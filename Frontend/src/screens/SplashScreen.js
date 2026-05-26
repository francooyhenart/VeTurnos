// src/screens/SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.logoContenedor}>
        <Text style={estilos.logoTexto}>🐾</Text>
        <Text style={estilos.logoNombre}>VeTurnos</Text>
      </View>
      <ActivityIndicator
        size="large"
        color={COLORS.primary}
        style={estilos.indicador}
      />
      <Text style={estilos.cargandoTexto}>cargando...</Text>
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  logoContenedor: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  logoTexto: {
    fontSize: 52,
  },
  logoNombre: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  indicador: {
    marginTop: SPACING.sm,
  },
  cargandoTexto: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
});

export default SplashScreen;
