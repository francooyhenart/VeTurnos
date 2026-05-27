import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
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
  const nombre = usuario?.nombreCompleto?.split(' ')[0] || 'usuario';

  return (
    <SafeAreaView style={estilos.safeArea}>
      {/* Encabezado */}
      <View style={estilos.encabezado}>
        <Text style={estilos.saludo}>Hola, {nombre}</Text>
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
            })
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// ════════════════════════════════════════════
//  ESTILOS TUNEADOS CON LA PALETA FIGMA B1
// ════════════════════════════════════════════
const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#143343', // 🎨 Fondo Azul Petróleo Oscuro general
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#143343', // 🎨 Unificado con el fondo de la app
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.xl,
  },
  saludo: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#FFFFFF', // 🎨 "Hola, Brenda" en color blanco
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
    backgroundColor: '#E3E3E3', // 🎨 Gris clarito para el fondo del avatar
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInicial: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#1F1F1F', // 🎨 Inicial en texto oscuro
  },
  scroll: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  tarjetaAccion: {
    backgroundColor: '#A3E1FC', // 🎨 Las 3 tarjetas principales en Celeste Pastel
    borderRadius: 12, // Bordes redondeados más suaves
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110, // Un toque más de aire vertical
    ...SHADOWS.sm,
  },
  tarjetaAccionTexto: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700', // 🎨 Texto con más peso para que sea legible
    color: '#143343', // 🎨 Color azul oscuro para las letras sobre el celeste
  },
});

export default InicioClienteScreen;