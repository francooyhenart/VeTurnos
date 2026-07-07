// AgendaVeterinarioScreen.js - Agenda de un veterinario específico
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  CargandoPantalla,
  EstadoVacio,
  AlertaError,
} from '../../components/ui';
import { FONT_SIZE, SPACING } from '../../constants';
import { obtenerAgendaVeterinario } from '../../services/api';

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

const ItemTurno = ({ turno }) => (
  <View style={estilos.itemTurno}>
    <View style={estilos.infoTurno}>
      <Text style={estilos.mascotaNombre}>{turno.nombreMascota}</Text>
      <Text style={estilos.clienteNombre}>👤 {turno.nombreCliente}</Text>
      <Text style={estilos.fechaTexto}>
        {formatearFechaHoraRango(turno.fechaHora, turno.duracionMinutos)}
      </Text>
      {turno.motivo && <Text style={estilos.motivoTexto}>📝 {turno.motivo}</Text>}
    </View>
    <View style={[estilos.estadoBadge, { backgroundColor: badgeColor(turno.estado) }]}>
      <Text style={estilos.estadoTexto}>{badgeLabel(turno.estado)}</Text>
    </View>
  </View>
);

const AgendaVeterinarioScreen = ({ navigation, route }) => {
  const { veterinario } = route.params;
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cargarAgenda = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const data = await obtenerAgendaVeterinario(veterinario.id);
      setTurnos(data);
    } catch (e) {
      setError(e.message || 'Error al cargar la agenda');
    } finally {
      setCargando(false);
    }
  }, [veterinario.id]);

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
        <Text style={estilos.titulo}>Agenda</Text>
        <TouchableOpacity
          onPress={cargarAgenda}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={estilos.botonRefresh}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Info del Veterinario */}
      <View style={estilos.tarjetaVeterinario}>
        <Text style={estilos.nombreVet}>{veterinario.nombreCompleto}</Text>
        <Text style={estilos.matriculaTexto}>{veterinario.matricula}</Text>
        {veterinario.especialidad && (
          <Text style={estilos.especialidadTexto}>{veterinario.especialidad}</Text>
        )}
      </View>

      {!!error && <AlertaError mensaje={error} estilo={{ margin: SPACING.md }} />}

      {/* Lista de Turnos */}
      <FlatList
        data={turnos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ItemTurno turno={item} />}
        contentContainerStyle={estilos.lista}
        ListEmptyComponent={
          <EstadoVacio mensaje="Este veterinario no tiene turnos programados." />
        }
      />
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
  tarjetaVeterinario: {
    backgroundColor: '#A3E1FC',
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
  },
  nombreVet: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#143343',
  },
  matriculaTexto: {
    fontSize: FONT_SIZE.sm,
    color: '#1F1F1F',
    marginTop: 4,
  },
  especialidadTexto: {
    fontSize: FONT_SIZE.sm,
    color: '#1F1F1F',
    fontStyle: 'italic',
    marginTop: 2,
  },
  lista: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  itemTurno: {
    backgroundColor: '#E3E3E3',
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoTurno: {
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
  motivoTexto: {
    fontSize: FONT_SIZE.sm,
    color: '#0284C7',
    marginTop: 2,
    fontWeight: '600',
  },
  estadoBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  estadoTexto: {
    fontSize: FONT_SIZE.sm - 1,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AgendaVeterinarioScreen;
