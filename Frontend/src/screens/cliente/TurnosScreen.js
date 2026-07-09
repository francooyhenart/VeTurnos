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
    case 'PENDIENTE': return '#0284C7'; // Un celeste prolijo para combinar
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

// 🚀 COMPONENTE TOTALMENTE CORREGIDO Y ALINEADO HORIZONTALMENTE
const ItemTurno = ({ turno, onCancelar }) => (
  <View style={estilos.itemTurno}>
    {/* Contenedor Izquierdo: Textos e info compacta */}
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

    {/* Contenedor Derecho: Tacho de basura más grande al costado */}
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

// Punto 3: "Próximos" = PENDIENTE; "Historial" = lo que ya pasó (asistido,
// completado o cancelado)
const ESTADOS_HISTORIAL = ['ASISTIDO', 'COMPLETADO', 'CANCELADO'];

const TurnosScreen = ({ navigation }) => {
  const { usuario } = useAuth();
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [advertencia, setAdvertencia] = useState('');
  const [turnoAcancelar, setTurnoACancelar] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const [vista, setVista] = useState('proximos');

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

  const turnosFiltrados = turnos.filter((t) =>
    vista === 'proximos'
      ? t.estado === 'PENDIENTE'
      : ESTADOS_HISTORIAL.includes(t.estado)
  );

  if (cargando) return <CargandoPantalla oscuro />;

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

      {/* Punto 3: segmented control Próximos / Historial */}
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

// ════════════════════════════════════════════
//  ESTILOS TOTALMENTE RESTRUCTURADOS Y LIMPIOS
// ════════════════════════════════════════════
const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#143343', // Fondo Azul Petróleo
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
    color: '#FFFFFF', // Flecha de volver blanca
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
  // 🚀 TARJETA SUPER FLACA CON ALINEACIÓN HORIZONTAL (ESTILO FIGMA)
  itemTurno: {
    backgroundColor: '#E3E3E3', 
    borderRadius: 12,
    paddingVertical: 10,           // 👈 Ultra flaco arriba y abajo
    paddingHorizontal: SPACING.md,  
    marginVertical: 4,              
    flexDirection: 'row',          // Info a la izquierda, tacho a la derecha
    alignItems: 'center',          
    justifyContent: 'space-between',
  },
  infoContenedor: {
    flex: 1,                       // Toma todo el ancho disponible empujando el tacho al final
    paddingRight: SPACING.sm,
  },
  nombreMascota: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#143343', 
  },
  fechaTexto: {
    fontSize: FONT_SIZE.sm - 1,   // Un punto menos de tamaño para ganar espacio vertical
    color: '#1F1F1F',
    marginTop: 2,
  },
  estadoTexto: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    marginTop: 2,
  },
  // 🚀 BOTÓN ELIMINAR CON EL TACHO GRANDE AL COSTADO
  botonEliminar: {
    minWidth: 44,                 
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tachoIcono: {
    fontSize: 22,                 // 👈 Tacho más grande y accesible en web
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