// src/screens/cliente/PerfilModal.js
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

      {/* Avatar grande */}
      <View style={estilos.avatarContenedor}>
        <View style={estilos.avatar}>
          <Text style={estilos.avatarInicial}>{inicial}</Text>
        </View>
      </View>

      <View style={estilos.menu}>
        <ItemMenu titulo="Configuración" onPress={() => {}} />
        <ItemMenu titulo="Ayuda" onPress={() => {}} />
        <BotonPrimario
          titulo="Cerrar sesión"
          onPress={manejarCerrarSesion}
          estilo={{ marginTop: SPACING.md }}
        />
      </View>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
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
    color: COLORS.textSecondary,
  },
  avatarContenedor: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInicial: {
    fontSize: 52,
    fontWeight: '300',
    color: COLORS.textSecondary,
  },
  menu: {
    gap: SPACING.sm,
  },
  itemMenu: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minHeight: 52,
    justifyContent: 'center',
  },
  itemMenuTexto: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
});

export default PerfilModal;
