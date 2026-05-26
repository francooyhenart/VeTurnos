// src/screens/cliente/TurnosScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { obtenerReservasCliente, cancelarReserva } from '../../services/api';
import {
  CargandoPantalla,
  EstadoVacio,
  AlertaError,
  Tarjeta,
  ModalConfirmacion,
} from '../../components/ui';
import { COLORS, FONT_SIZE, SPACING } from '../../constants';

// Proyecta el rango horario dinámicamente usando la duración que envía el DTO
const formatearFechaHoraRango = (fechaHoraStr, duracionMinutos = 30) => {
  if (!fechaHoraStr) return '';
  
  const inicio = new Date(fechaHoraStr);
  // Multiplicamos por 60000 para pasar los minutos a milisegundos
  const fin = new Date(inicio.getTime() + (duracionMinutos || 30) * 60000);

  const dia = inicio.getDate();
  const mes = inicio.toLocaleString('es-AR', { month: 'short' });
  
  const horaInicio = inicio.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const horaFin = fin.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return `${dia} ${mes} de ${horaInicio} a ${horaFin}`;
};

const badgeColor = (estado) => {
  switch (estado) {
    case 'PENDIENTE': return COLORS.info;
    case 'ASISTIDO': return COLORS.success;
    case 'COMPLETADO': return COLORS.primary;
    case 'CANCELADO': return COLORS.textMuted;
    default: return COLORS.textMuted;
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

const ItemTurno = ({ turno, onCancelar }) => (
  <Tarjeta>
    <View style={estilos.itemTurnoContenido}>
      <View style={estilos.itemTurnoInfo}>
        <Text style={estilos.itemTurnoNombreMascota}>{turno.nombreMascota}</Text>
        <Text style={estilos.itemTurnoDetalle}>
          {/* 🔥 Pasamos la duración al formateador para mostrar el rango completo */}
          {formatearFechaHoraRango(turno.fechaHora, turno.duracionMinutos)}
          {turno.motivo ? ` - ${turno.motivo}` : ''}
        </Text>
        <View style={[estilos.badge, { backgroundColor: badgeColor(turno.estado) + '22' }]}>
          <Text style={[estilos.badgeTexto, { color: badgeColor(turno.estado) }]}>
            {badgeLabel(turno.estado)}
          </Text>
        </View>
      </View>
      {turno.estado === 'PENDIENTE' && (
        <TouchableOpacity
          onPress={() => onCancelar(turno)}
          style={estilos.botonCancelar}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Cancelar turno"
        >
          <Text style={estilos.iconoCancelar}>🗑</Text>
        </TouchableOpacity>
      )}
    </View>
  </Tarjeta>
);

const TurnosScreen = ({ navigation }) => {
  const { usuario } = useAuth();
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [advertencia, setAdvertencia] = useState('');
  const [turnoAcancelar, setTurnoACancelar] = useState(null);
  const [cancelando, setCancelando] = useState(false);

  const cargarTurnos = useCallback(async () => {
    if (!usuario?.nombreCompleto) return;
    setCargando(true);
    setError('');
    try {
      const data = await obtenerReservasCliente(usuario.nombreCompleto);
      data.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
      setTurnos(data);
    } catch (e) {
      setError(e.message || 'Error al cargar los turnos.');
    } finally {
      setCargando(false);
    }
  }, [usuario]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarTurnos);
    return unsubscribe;
  }, [navigation, cargarTurnos]);

  const confirmarCancelacion = async () => {
    if (!turnoAcancelar) return;
    setCancelando(true);
    try {
      const res = await cancelarReserva(turnoAcancelar.id);
      setTurnoACancelar(null);
      if (res?.advertencia) {
        setAdvertencia(res.advertencia);
      }
      await cargarTurnos();
    } catch (e) {
      setError(e.message || 'Error al cancelar el turno.');
      setTurnoACancelar(null);
    } finally {
      setCancelando(false);
    }
  };

  if (cargando) return <CargandoPantalla />;

  return (
    <SafeAreaView style={estilos.safeArea}>
      {/* Encabezado */}
      <View style={estilos.encabezado}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={estilos.botonVolver}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={estilos.flechaTexto}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={estilos.tituloContenedor}>
        <Text style={estilos.titulo}>Mis turnos</Text>
      </View>

      {!!error && <AlertaError mensaje={error} estilo={{ margin: SPACING.md }} />}
      {!!advertencia && (
        <View style={estilos.alertaAdvertencia}>
          <Text style={estilos.alertaAdvertenciaTexto}>{advertencia}</Text>
          <TouchableOpacity onPress={() => setAdvertencia('')}>
            <Text style={estilos.cerrarAdvertencia}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={turnos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ItemTurno turno={item} onCancelar={setTurnoACancelar} />
        )}
        contentContainerStyle={estilos.lista}
        ListEmptyComponent={<EstadoVacio mensaje="No tenés turnos programados." />}
      />

      {/* Modal de confirmación de cancelación */}
      <ModalConfirmacion
        visible={!!turnoAcancelar}
        titulo="¿Cancelar este turno?"
        descripcion="Se liberará el horario."
        onConfirmar={confirmarCancelacion}
        onCancelar={() => setTurnoACancelar(null)}
      />
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  encabezado: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  botonVolver: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  flechaTexto: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
  },
  tituloContenedor: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  titulo: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  lista: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  itemTurnoContenido: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTurnoInfo: {
    flex: 1,
    gap: 4,
  },
  itemTurnoNombreMascota: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  itemTurnoDetalle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  badgeTexto: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  botonCancelar: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoCancelar: {
    fontSize: 22,
  },
  alertaAdvertencia: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: 8,
  },
  alertaAdvertenciaTexto: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: '#E65100',
  },
  cerrarAdvertencia: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    paddingLeft: SPACING.sm,
  },
});

export default TurnosScreen;