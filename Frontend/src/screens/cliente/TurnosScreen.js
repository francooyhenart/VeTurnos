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
  ModalConfirmacion,
} from '../../components/ui';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants';

// Proyecta el rango horario dinámicamente usando la duración que envía el DTO
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
    case 'ASISTIDO': return COLORS.success;
    case 'COMPLETADO': return COLORS.primary;
    case 'CANCELADO': return COLORS.textMuted;
    case 'AUSENTE': return '#B45309';
    default: return COLORS.textMuted;
  }
};

const badgeLabel = (estado) => {
  switch (estado) {
    case 'PENDIENTE': return 'Pendiente';
    case 'ASISTIDO': return 'Asistido';
    case 'COMPLETADO': return 'Completado';
    case 'CANCELADO': return 'Cancelado';
    case 'AUSENTE': return 'Ausente';
    default: return estado;
  }
};

const ItemTurno = ({ turno, onCancelar }) => (
  <View style={estilos.itemTurno}>
    <View style={estilos.infoContenedor}>
      <Text style={estilos.nombreMascota}>{turno.nombreMascota}</Text>
      <Text style={estilos.fechaTexto}>
        {formatearFechaHoraRango(turno.fechaHora, turno.duracionMinutos)}
        {turno.motivo ? ` - ${turno.motivo}` : ''}
      </Text>
      <Text style={[estilos.estadoTexto, { color: badgeColor(turno.estado) }]}>
        {badgeLabel(turno.estado)}
      </Text>
    </View>

    {turno.estado === 'PENDIENTE' && (
      <TouchableOpacity
        onPress={() => onCancelar(turno)}
        style={estilos.botonEliminar}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="Cancelar turno"
      >
        <Text style={estilos.tachoIcono}>🗑️</Text>
      </TouchableOpacity>
    )}
  </View>
);

const ESTADOS_HISTORIAL = ['ASISTIDO', 'COMPLETADO', 'CANCELADO', 'AUSENTE'];

const TurnosScreen = ({ navigation }) => {
  const { usuario } = useAuth();
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [advertencia, setAdvertencia] = useState('');
  const [vista, setVista] = useState('proximos');

  // Paso 1: modal clásico de "¿cancelar este turno?"
  const [turnoAcancelar, setTurnoACancelar] = useState(null);
  // Paso 2: modal de "esto tiene recargo, ¿confirmás?" (AC 02)
  const [turnoConRecargo, setTurnoConRecargo] = useState(null);
  const [mensajeRecargo, setMensajeRecargo] = useState('');

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

  // Paso 1: intento de cancelación "normal" (sin confirmar recargo todavía)
  const confirmarCancelacion = async () => {
    if (!turnoAcancelar) return;
    const turno = turnoAcancelar;
    setCancelando(true);
    try {
      const res = await cancelarReserva(turno.id, false);
      // No requería recargo: se canceló directo
      setTurnoACancelar(null);
      if (res?.advertencia) setAdvertencia(res.advertencia);
      await cargarTurnos();
    } catch (e) {
      if (e.requiereConfirmacion) {
        // AC 02: todavía NO se tocó la base. Pasamos al modal de recargo.
        setTurnoACancelar(null);
        setMensajeRecargo(e.advertencia);
        setTurnoConRecargo(turno);
      } else {
        setError(e.message || 'Error al cancelar el turno.');
        setTurnoACancelar(null);
      }
    } finally {
      setCancelando(false);
    }
  };

  // Paso 2: el cliente ya vio el aviso de recargo y decidió continuar
  const confirmarCancelacionConRecargo = async () => {
    if (!turnoConRecargo) return;
    setCancelando(true);
    try {
      const res = await cancelarReserva(turnoConRecargo.id, true);
      setTurnoConRecargo(null);
      setMensajeRecargo('');
      if (res?.advertencia) setAdvertencia(res.advertencia);
      await cargarTurnos();
    } catch (e) {
      setError(e.message || 'Error al cancelar el turno.');
      setTurnoConRecargo(null);
      setMensajeRecargo('');
    } finally {
      setCancelando(false);
    }
  };

  const cancelarFlujoRecargo = () => {
    setTurnoConRecargo(null);
    setMensajeRecargo('');
  };

  const turnosFiltrados = turnos.filter((t) =>
    vista === 'proximos'
      ? t.estado === 'PENDIENTE'
      : ESTADOS_HISTORIAL.includes(t.estado)
  );

  if (cargando) return <CargandoPantalla oscuro />;

  return (
    <SafeAreaView style={estilos.safeArea}>
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

      <View style={estilos.segmentado}>
        <TouchableOpacity
          style={[estilos.segmentoBoton, vista === 'proximos' && estilos.segmentoBotonActivo]}
          onPress={() => setVista('proximos')}
        >
          <Text style={[estilos.segmentoTexto, vista === 'proximos' && estilos.segmentoTextoActivo]}>
            Próximos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[estilos.segmentoBoton, vista === 'historial' && estilos.segmentoBotonActivo]}
          onPress={() => setVista('historial')}
        >
          <Text style={[estilos.segmentoTexto, vista === 'historial' && estilos.segmentoTextoActivo]}>
            Historial
          </Text>
        </TouchableOpacity>
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
        data={turnosFiltrados}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ItemTurno turno={item} onCancelar={setTurnoACancelar} />
        )}
        contentContainerStyle={estilos.lista}
        ListEmptyComponent={
          <EstadoVacio
            mensaje={
              vista === 'proximos'
                ? 'No tenés turnos próximos programados.'
                : 'Todavía no tenés turnos en tu historial.'
            }
          />
        }
      />

      {/* Paso 1: confirmación clásica */}
      <ModalConfirmacion
        visible={!!turnoAcancelar}
        titulo="¿Cancelar este turno?"
        descripcion="Se liberará el horario."
        onConfirmar={confirmarCancelacion}
        onCancelar={() => setTurnoACancelar(null)}
      />

      {/* Paso 2 (AC 02): confirmación de recargo por cancelación tardía */}
      <ModalConfirmacion
        visible={!!turnoConRecargo}
        titulo="Cancelación tardía"
        descripcion={mensajeRecargo || 'Esta cancelación se considera tardía y aplicará un recargo. ¿Deseás continuar?'}
        onConfirmar={confirmarCancelacionConRecargo}
        onCancelar={cancelarFlujoRecargo}
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
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    minHeight: 48,
  },
  botonVolver: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  flechaTexto: {
    fontSize: FONT_SIZE.xl,
    color: '#FFFFFF',
  },
  tituloContenedor: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  titulo: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  segmentado: {
    flexDirection: 'row',
    backgroundColor: '#0F2733',
    borderRadius: 10,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: 4,
  },
  segmentoBoton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  segmentoBotonActivo: {
    backgroundColor: '#90C7A1',
  },
  segmentoTexto: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: '#A3E1FC',
  },
  segmentoTextoActivo: {
    color: '#143343',
    fontWeight: '700',
  },
  lista: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  itemTurno: {
    backgroundColor: '#E3E3E3',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoContenedor: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  nombreMascota: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#143343',
  },
  fechaTexto: {
    fontSize: FONT_SIZE.sm - 1,
    color: '#1F1F1F',
    marginTop: 2,
  },
  estadoTexto: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    marginTop: 2,
  },
  botonEliminar: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tachoIcono: {
    fontSize: 22,
    color: '#EF4444',
  },
  alertaAdvertencia: {
    backgroundColor: '#FEF3C7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  alertaAdvertenciaTexto: {
    color: '#92400E',
    fontSize: FONT_SIZE.sm,
    flex: 1,
  },
  cerrarAdvertencia: {
    color: '#92400E',
    fontSize: FONT_SIZE.md,
    marginLeft: SPACING.sm,
    padding: 4,
  },
});

export default TurnosScreen;