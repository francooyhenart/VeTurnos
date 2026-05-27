import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { BotonPrimario } from '../../components/ui';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants';

const ItemMenu = ({ titulo, onPress }) => (
  <TouchableOpacity style={estilos.itemMenu} onPress={onPress} activeOpacity={0.8}>
    <Text style={estilos.itemMenuTexto}>{titulo}</Text>
  </TouchableOpacity>
);

const PerfilModal = ({ navigation }) => {
  const { usuario, cerrarSesion } = useAuth();
  const nombre = usuario?.nombreCompleto || 'Usuario';
  const inicial = nombre[0]?.toUpperCase();

  const manejarCerrarSesion = async () => {
    await cerrarSesion();
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={estilos.safeArea}>
      <TouchableOpacity
        style={estilos.cerrar}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={estilos.cerrarTexto}>✕</Text>
      </TouchableOpacity>

      {/* Avatar grande estilo Figma */}
      <View style={estilos.avatarContenedor}>
        <View style={estilos.avatar}>
          <Text style={estilos.avatarInicial}>{inicial}</Text>
        </View>
      </View>

      <View style={estilos.menu}>
        <ItemMenu titulo="Configuración" onPress={() => {}} />
        <ItemMenu titulo="Ayuda" onPress={() => {}} />
        
        {/* 🚀 Botón Cerrar Sesión Verde Pastel */}
        <BotonPrimario
          titulo="Cerrar sesión"
          onPress={manejarCerrarSesion}
          estilo={estilos.botonCerrarSesion}
        />
      </View>
    </SafeAreaView>
  );
};

// ════════════════════════════════════════════
//  ESTILOS TUNEADOS CON LA PALETA DEL MENU FIGMA
// ════════════════════════════════════════════
const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#143343', // 🎨 Fondo Azul Petróleo Oscuro
    paddingHorizontal: SPACING.xl,
  },
  cerrar: {
    alignSelf: 'flex-end',
    marginTop: SPACING.lg,
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cerrarTexto: {
    fontSize: FONT_SIZE.xl,
    color: '#FFFFFF', // 🎨 Cruz blanca
  },
  avatarContenedor: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFFFFF', // 🎨 Borde blanco prolijo para resaltar el logo
    backgroundColor: '#90C7A1', // 🎨 Fondo Verde Pastel para el círculo del logo
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInicial: {
    fontSize: 52,
    fontWeight: '700',
    color: '#143343', // 🎨 Letra oscura (Azul Petróleo) para que contraste
  },
  menu: {
    gap: SPACING.sm,
  },
  itemMenu: {
    backgroundColor: '#E3E3E3', // 🎨 Barras gris claro idénticas a los inputs del Figma
    borderRadius: 8,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minHeight: 52,
    justifyContent: 'center',
    marginVertical: 2,
  },
  itemMenuTexto: {
    fontSize: FONT_SIZE.md,
    color: '#1F1F1F', // 🎨 Texto oscuro sobre el fondo gris claro
    fontWeight: '700',
  },
  botonCerrarSesion: {
    backgroundColor: '#90C7A1', // 🎨 Botón Cerrar Sesión en Verde Claro
    marginTop: SPACING.xl,
  },
});

export default PerfilModal;