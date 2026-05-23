// src/screens/admin/AgendaAdminScreen.js
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
  Tarjeta,
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

const formatearHora = (fechaHoraStr) => {
  const d = new Date(fechaHoraStr);
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

const ItemAgenda = ({ reserva, onMarcar }) => {
  const completado = reserva.estado === 'COMPLETADO' || reserva.estado === 'ASISTIDO';

  return (
    <Tarjeta>
      <View style={estilos.itemContenido}>
        <View style={estilos.itemInfo}>
          <Text style={estilos.itemHora}>{formatearHora(reserva.fechaHora)}</Text>
          <Text style={estilos.itemNombre}>{reserva.nombreCliente}</Text>
          <Text style={estilos.itemMascota}>{reserva.nombreMascota}</Text>
        </View>
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
    </Tarjeta>
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
    cargarAgenda();
  }, [cargarAgenda]);

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
      {/* Encabezado admin */}
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

        {/* Navegador de fecha */}
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

        {!!error && <AlertaError mensaje={error} estilo={{ marginBottom: SPACING.md }} />}

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
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.xl,
  },
  saludo: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
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
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInicial: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  contenido: {
    flex: 1,
    padding: SPACING.lg,
  },
  seccionTitulo: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  fechaNavegador: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
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
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  fechaTexto: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  lista: {
    gap: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  itemContenido: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemHora: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  itemNombre: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  itemMascota: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  checkBoton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  checkBotonActivo: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkTexto: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  checkTextoActivo: {
    color: COLORS.textInverse,
  },
});

export default AgendaAdminScreen;
