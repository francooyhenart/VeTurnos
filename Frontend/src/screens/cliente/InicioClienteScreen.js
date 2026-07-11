import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { obtenerContadorSinLeer } from '../../services/api'; // 🟢 Conexión a tu Backend
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

const TarjetaAccion = ({ titulo, onPress }) => (
  <TouchableOpacity
    style={estilos.tarjetaAccion}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
  >
    <Text style={estilos.tarjetaAccionTexto}>{titulo}</Text>
  </TouchableOpacity>
);

const InicioClienteScreen = ({ navigation }) => {
  const { usuario } = useAuth();
  const [sinLeer, setSinLeer] = useState(0); // 🟢 Estado para el globito rojo
  
  const nombre = usuario?.nombreCompleto?.split(' ')[0] || 'usuario';

  const actualizarContador = useCallback(async () => {
    if (!usuario?.id) return;
    try {
      const cantidad = await obtenerContadorSinLeer(usuario.id);
      setSinLeer(cantidad);
    } catch (error) {
      console.error("🔴 ERROR EN EL POLLING DE NOTIFICACIONES:", error);
    }
  }, [usuario?.id]);

  // 🟢 Polling: Se ejecuta al entrar y revisa cambios cada 10 segundos
  useEffect(() => {
    actualizarContador();
    const intervalo = setInterval(actualizarContador, 10000);
    return () => clearInterval(intervalo);
  }, [actualizarContador]);

  return (
    <SafeAreaView style={estilos.safeArea}>
      {/* 🟢 Encabezado Nuevo: 3 Columnas Estrictas (Campana | Saludo Centrado | Avatar) */}
      <View style={estilos.encabezado}>
        
        {/* Columna Izquierda: Campanita de Notificaciones */}
        <View style={estilos.columnaEncabezado}>
          <TouchableOpacity
            style={estilos.iconoBoton}
            onPress={() => navigation.navigate('NotificacionesModal')} // 🟢 Abre tu nuevo modal global
            accessibilityLabel="Ver notificaciones"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={estilos.campanaTexto}>🔔</Text>
            {sinLeer > 0 && (
              <View style={estilos.badge}>
                <Text style={estilos.badgeTexto}>{sinLeer > 9 ? '+9' : sinLeer}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Columna Central: Saludo perfectamente Centrado */}
        <View style={[estilos.columnaEncabezado, estilos.columnaCentral]}>
          <Text style={estilos.saludo} numberOfLines={1}>Hola, {nombre}</Text>
        </View>

        {/* Columna Derecha: Avatar de Perfil */}
        <View style={[estilos.columnaEncabezado, estilos.columnaDerecha]}>
          <TouchableOpacity
            style={estilos.avatarBoton}
            onPress={() => navigation.navigate('PerfilModal')}
            accessibilityLabel="Abrir perfil"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={estilos.avatar}>
              <Text style={estilos.avatarInicial}>{nombre[0]?.toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>

      </View>

      {/* Contenido */}
      <ScrollView contentContainerStyle={estilos.scroll}>
        <TarjetaAccion
          titulo="Mis mascotas"
          onPress={() => navigation.navigate('Mascotas')}
        />
        <TarjetaAccion
          titulo="Mis turnos"
          onPress={() => navigation.navigate('Turnos')}
        />
        <TarjetaAccion
          titulo="Reservar turno"
          onPress={() =>
            navigation.navigate('Turnos', {
              screen: 'ReservarTurno',
              initial: false,
            })
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// ════════════════════════════════════════════
//  ESTILOS CORREGIDOS CON CENTRADO ABSOLUTO
// ════════════════════════════════════════════
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
    paddingTop: SPACING.xl,
  },
  // 🟢 Proporciones fijas 20% - 60% - 20% para forzar el alineado exacto
  columnaEncabezado: {
    width: '20%',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  columnaCentral: {
    width: '60%',
    alignItems: 'center',
  },
  columnaDerecha: {
    width: '20%',
    alignItems: 'flex-end',
  },
  saludo: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  iconoBoton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  campanaTexto: {
    fontSize: 24,
  },
  // 🟢 Indicador Rojo Flotante
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#E53935',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeTexto: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  avatarBoton: {
    minWidth: 44,
    minHeight: 44,
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
    color: '#1F1F1F',
  },
  scroll: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  tarjetaAccion: {
    backgroundColor: '#A3E1FC',
    borderRadius: 12,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    ...SHADOWS.sm,
  },
  tarjetaAccionTexto: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#143343',
  },
});

export default InicioClienteScreen;