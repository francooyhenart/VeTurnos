// AgendaGestorScreen.js - Agenda completa de todos los veterinarios
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import {
  CargandoPantalla,
  EstadoVacio,
  AlertaError,
} from '../../components/ui';
import { FONT_SIZE, SPACING } from '../../constants';
import { obtenerAgendaCompleta } from '../../services/api';

const formatearFechaHoraRango = (fechaHoraStr, duracionMinutos = 30) => {
  if (!fechaHoraStr) return '';
  
  const inicio = new Date(fechaHoraStr);
  const fin = new Date(inicio.getTime() + (duracionMinutos || 30) * 60000);

  const dia = inicio.getDate();
  const mes = inicio.toLocaleString('es-AR', { month: 'short' });
  
  const horaInicio = inicio.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const horaFin = fin.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return `${dia} ${mes} de ${horaInicio} a ${horaFin}`;
};

const badgeColor = (estado) => {
  switch (estado) {
    case 'PENDIENTE': return '#0284C7';
    case 'ASISTIDO': return '#16A34A';
    case 'COMPLETADO': return '#90C7A1';
    case 'CANCELADO': return '#999';
    default: return '#999';
  }
};

const badgeLabel = (estado) => {
  switch (estado) {
    case 'PENDIENTE': return 'Pendiente';
    case 'ASISTIDO': return 'Asistido';
    case 'COMPLETADO': return 'Completado';
    case 'CANCELADO': return 'Cancelado';
    default: return estado;
  }
};

const ItemReserva = ({ reserva }) => (
  <View style={estilos.itemReserva}>
    <View style={estilos.infoReserva}>
      <Text style={estilos.mascotaNombre}>{reserva.nombreMascota}</Text>
      <Text style={estilos.clienteNombre}>👤 {reserva.clienteNombre}</Text>
      <Text style={estilos.fechaTexto}>
        {formatearFechaHoraRango(reserva.fechaHora, reserva.duracionMinutos)}
      </Text>
    </View>
    <View style={[estilos.estadoBadge, { backgroundColor: badgeColor(reserva.estado) }]}>
      <Text style={estilos.estadoTexto}>{badgeLabel(reserva.estado)}</Text>
    </View>
  </View>
);

const VeterinarioSection = ({ veterinario, reservas }) => (
  <View style={estilos.sectionVeterinario}>
    <View style={estilos.headerVeterinario}>
      <View>
        <Text style={estilos.nombreVeterinario}>{veterinario.nombre}</Text>
        <Text style={estilos.matriculaVet}>{veterinario.matricula}</Text>
      </View>
      <Text style={estilos.totalReservas}>{reservas.length} turnos</Text>
    </View>
    
    {reservas.length > 0 ? (
      <View style={estilos.reservasLista}>
        {reservas.map((reserva) => (
          <ItemReserva key={reserva.id} reserva={reserva} />
        ))}
      </View>
    ) : (
      <View style={estilos.sinReservas}>
        <Text style={estilos.sinReservasTexto}>Sin turnos programados</Text>
      </View>
    )}
  </View>
);

const AgendaGestorScreen = ({ navigation }) => {
  const [agendaData, setAgendaData] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cargarAgenda = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const data = await obtenerAgendaCompleta();
      setAgendaData(data);
    } catch (e) {
      setError(e.message || 'Error al cargar la agenda');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarAgenda);
    return unsubscribe;
  }, [navigation, cargarAgenda]);

  if (cargando) return <CargandoPantalla />;

  return (
    <SafeAreaView style={estilos.safeArea}>
      {/* Encabezado */}
      <View style={estilos.encabezado}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={estilos.flechaTexto}>←</Text>
        </TouchableOpacity>
        <Text style={estilos.titulo}>Agenda Completa</Text>
        <TouchableOpacity
          onPress={cargarAgenda}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={estilos.botonRefresh}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Info General */}
      {agendaData && (
        <View style={estilos.infoGeneral}>
          <View style={estilos.infoItem}>
            <Text style={estilos.infoLabel}>Veterinarios</Text>
            <Text style={estilos.infoValor}>{agendaData.totalVeterinarios}</Text>
          </View>
          <View style={estilos.infoItem}>
            <Text style={estilos.infoLabel}>Turnos</Text>
            <Text style={estilos.infoValor}>{agendaData.totalReservas}</Text>
          </View>
        </View>
      )}

      {!!error && <AlertaError mensaje={error} estilo={{ margin: SPACING.md }} />}

      {/* Lista de Veterinarios y sus Reservas */}
      {agendaData?.veterinarios && agendaData.veterinarios.length > 0 ? (
        <FlatList
          data={agendaData.veterinarios}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const reservasDelVet = agendaData.reservas.filter(r => true); // En futuro filtrar por vet
            return (
              <VeterinarioSection
                veterinario={item}
                reservas={reservasDelVet}
              />
            );
          }}
          contentContainerStyle={estilos.lista}
          ListEmptyComponent={<EstadoVacio mensaje="No hay veterinarios registrados." />}
        />
      ) : (
        <View style={estilos.contenedorVacio}>
          <EstadoVacio mensaje="No hay veterinarios en el sistema." />
        </View>
      )}
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#143343',
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#143343',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.lg,
  },
  flechaTexto: {
    fontSize: FONT_SIZE.xl,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  titulo: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  botonRefresh: {
    fontSize: FONT_SIZE.lg,
  },
  infoGeneral: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  infoItem: {
    flex: 1,
    backgroundColor: '#A3E1FC',
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: FONT_SIZE.sm,
    color: '#143343',
    fontWeight: '600',
  },
  infoValor: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#143343',
    marginTop: 4,
  },
  lista: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  contenedorVacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionVeterinario: {
    backgroundColor: '#E3E3E3',
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    overflow: 'hidden',
  },
  headerVeterinario: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#D0D0D0',
  },
  nombreVeterinario: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#143343',
  },
  matriculaVet: {
    fontSize: FONT_SIZE.sm,
    color: '#666',
    marginTop: 2,
  },
  totalReservas: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#A3E1FC',
    backgroundColor: '#143343',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reservasLista: {
    gap: SPACING.sm,
  },
  itemReserva: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#A3E1FC',
  },
  infoReserva: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  mascotaNombre: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#143343',
  },
  clienteNombre: {
    fontSize: FONT_SIZE.sm,
    color: '#666',
    marginTop: 2,
  },
  fechaTexto: {
    fontSize: FONT_SIZE.sm,
    color: '#1F1F1F',
    marginTop: 4,
  },
  estadoBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  estadoTexto: {
    fontSize: FONT_SIZE.sm - 1,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sinReservas: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  sinReservasTexto: {
    fontSize: FONT_SIZE.sm,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default AgendaGestorScreen;
