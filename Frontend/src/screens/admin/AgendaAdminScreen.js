import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { obtenerAgenda, registrarAsistencia } from '../../services/api';
import {
  CargandoPantalla,
  EstadoVacio,
  AlertaError,
} from '../../components/ui';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants';

const addDias = (fecha, dias) => {
  const nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() + dias);
  return nueva;
};

const formatearFecha = (fecha) =>
  fecha.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

// Calculates the time range using the duration provided by the backend
const formatearHoraRango = (fechaHoraStr, duracionMinutos = 30) => {
  if (!fechaHoraStr) return '';
  const inicio = new Date(fechaHoraStr);
  const fin = new Date(inicio.getTime() + (duracionMinutos || 30) * 60000);

  const formato = (d) => d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `De ${formato(inicio)} a ${formato(fin)}`;
};

// 🚀 TARJETA COMPACTA ADAPTADA AL FLUJO MODERNO
const ItemAgenda = ({ reserva, onMarcar }) => {
  const completado = reserva.estado === 'COMPLETADO' || reserva.estado === 'ASISTIDO';

  return (
    <View style={estilos.itemTurno}>
      {/* Contenedor Izquierdo: Datos consolidados */}
      <View style={estilos.infoContenedor}>
        <Text style={estilos.itemHora}>
          {formatearHoraRango(reserva.fechaHora, reserva.duracionMinutos)}
        </Text>
        <Text style={estilos.itemNombre}>Cliente: {reserva.nombreCliente}</Text>
        <Text style={estilos.itemMascota}>Paciente: {reserva.nombreMascota}</Text>
      </View>

      {/* Contenedor Derecho: Botón check optimizado */}
      <TouchableOpacity
        style={[estilos.checkBoton, completado && estilos.checkBotonActivo]}
        onPress={() => onMarcar(reserva)}
        disabled={completado}
        accessibilityLabel={completado ? 'Asistencia registrada' : 'Marcar asistencia'}
        accessibilityRole="button"
      >
        <Text style={[estilos.checkTexto, completado && estilos.checkTextoActivo]}>✓</Text>
      </TouchableOpacity>
    </View>
  );
};

const AgendaAdminScreen = ({ navigation }) => {
  const { usuario } = useAuth();
  const [fecha, setFecha] = useState(new Date());
  const [agenda, setAgenda] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cargarAgenda = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const fechaStr = fecha.toISOString().split('T')[0];
      const data = await obtenerAgenda(fechaStr);
      // Solo mostrar pendientes y asistidos (no cancelados)
      const filtrados = data.filter((r) => r.estado !== 'CANCELADO');
      filtrados.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
      setAgenda(filtrados);
    } catch (e) {
      setError(e.message || 'Error al cargar la agenda.');
    } finally {
      setCargando(false);
    }
  }, [fecha]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarAgenda);
    return unsubscribe;
  }, [navigation, cargarAgenda]);

  const manejarMarcar = async (reserva) => {
    const nuevoEstado = reserva.estado === 'PENDIENTE' ? 'ASISTIDO' : 'COMPLETADO';
    try {
      await registrarAsistencia(reserva.id, nuevoEstado);
      await cargarAgenda();
    } catch (e) {
      setError(e.message || 'Error al actualizar el estado.');
    }
  };

  const nombre = usuario?.nombreCompleto?.split(' ')[0] || 'Admin';

  return (
    <SafeAreaView style={estilos.safeArea}>
      {/* Encabezado admin unificado oscuro */}
      <View style={estilos.encabezado}>
        <Text style={estilos.saludo}>Hola, {nombre}</Text>
        <TouchableOpacity
          style={estilos.avatarBoton}
          onPress={() => navigation.navigate('PerfilModal')}
          accessibilityLabel="Abrir perfil"
        >
          <View style={estilos.avatar}>
            <Text style={estilos.avatarInicial}>{nombre[0]?.toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={estilos.contenido}>
        <Text style={estilos.seccionTitulo}>Agenda</Text>

        {/* Navegador de fecha gris claro redondeado */}
        <View style={estilos.fechaNavegador}>
          <TouchableOpacity
            onPress={() => setFecha((f) => addDias(f, -1))}
            style={estilos.fechaBoton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={estilos.fechaFlecha}>‹</Text>
          </TouchableOpacity>
          <Text style={estilos.fechaTexto}>{formatearFecha(fecha)}</Text>
          <TouchableOpacity
            onPress={() => setFecha((f) => addDias(f, 1))}
            style={estilos.fechaBoton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={estilos.fechaFlecha}>›</Text>
          </TouchableOpacity>
        </View>

        {!!error && <AlertaError mensaje={error} style={{ marginBottom: SPACING.md }} />}

        {cargando ? (
          <CargandoPantalla />
        ) : (
          <FlatList
            data={agenda}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <ItemAgenda reserva={item} onMarcar={manejarMarcar} />
            )}
            contentContainerStyle={estilos.lista}
            ListEmptyComponent={
              <EstadoVacio mensaje="No hay turnos programados para este día." />
            }
          />
        )}
      </View>

      {/* 🚀 BOTÓN FLOTANTE MÁS LLAMATIVO EN VERDE PASTEL */}
      <TouchableOpacity
        style={estilos.botonFlotante}
        onPress={() => navigation.navigate('CrearTurnoAdmin')}
        accessibilityLabel="Cargar turno nuevo"
      >
        <Text style={estilos.botonFlotanteTexto}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// ════════════════════════════════════════════
//  ESTILOS TOTALMENTE REESTRUCTURADOS (ADMIN)
// ════════════════════════════════════════════
const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#143343', // 🎨 Fondo Oscuro general
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#143343',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.xl,
  },
  saludo: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#FFFFFF', // Saludo blanco
  },
  avatarBoton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3E3E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInicial: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#143343',
  },
  contenido: {
    flex: 1,
    padding: SPACING.lg,
  },
  seccionTitulo: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#FFFFFF', // Título central en blanco
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  fechaNavegador: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E3E3E3', // 🎨 Gris claro redondeado uniforme
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    minHeight: 52,
  },
  fechaBoton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fechaFlecha: {
    fontSize: 28,
    color: '#1F1F1F',
    fontWeight: '400',
  },
  fechaTexto: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  lista: {
    paddingBottom: SPACING.xl,
  },
  // 🚀 TARJETA ULTRA FLACA ESTILO HORIZONTAL
  itemTurno: {
    backgroundColor: '#E3E3E3',
    borderRadius: 12,
    paddingVertical: 10,           // Aire vertical comprimido al mínimo
    paddingHorizontal: SPACING.md,
    marginVertical: 4,
    flexDirection: 'row',          // Divide el contenido del botón de marcar
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoContenedor: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  itemHora: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#143343', // Resalta la hora del turno
  },
  itemNombre: {
    fontSize: FONT_SIZE.sm,
    color: '#1F1F1F',
    fontWeight: '500',
    marginTop: 1,
  },
  itemMascota: {
    fontSize: FONT_SIZE.sm,
    color: '#555555',
    marginTop: 1,
  },
  // 🚀 BOTÓN DE CHECK CORREGIDO Y ACCESIBLE
  checkBoton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#143343',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkBotonActivo: {
    backgroundColor: '#90C7A1', // 🎨 Verde pastel cuando asistió
    borderColor: '#90C7A1',
  },
  checkTexto: {
    fontSize: 20,
    color: '#143343',
    fontWeight: '700',
  },
  checkTextoActivo: {
    color: '#143343', // Mantiene la legibilidad del tilde oscuro
  },
  // 🚀 BOTÓN FLOATING SUMAR EN VERDE PASTEL
  botonFlotante: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: '#90C7A1', 
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  botonFlotanteTexto: {
    color: '#143343', // Símbolo más oscuro para mejor contraste
    fontSize: 32,
    fontWeight: '400',
    lineHeight: 32,
    marginBottom: 4,
  },
});

export default AgendaAdminScreen;