// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../services/api';
import { CampoTexto, BotonPrimario, AlertaError } from '../../components/ui';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants';

const LoginScreen = ({ navigation }) => {
  const { iniciarSesion } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const manejarLogin = async () => {
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor completá todos los campos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('El formato del email no es válido.');
      return;
    }

    setCargando(true);
    try {
      const usuario = await login({ email: email.trim(), password });
      await iniciarSesion(usuario);
    } catch (e) {
      setError(e.message || 'Error al iniciar sesión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={estilos.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={estilos.contenedor}>
          <Text style={estilos.titulo}>Iniciar sesión</Text>

          <View style={estilos.formulario}>
            <CampoTexto
              placeholder="Email"
              valor={email}
              alCambiar={setEmail}
              teclado="email-address"
            />
            <CampoTexto
              placeholder="Contraseña"
              valor={password}
              alCambiar={setPassword}
              esPassword
            />

            {!!error && <AlertaError mensaje={error} estilo={{ marginTop: SPACING.xs }} />}

            <BotonPrimario
              titulo="Ingresar"
              onPress={manejarLogin}
              cargando={cargando}
              estilo={{ marginTop: SPACING.lg }}
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Registro')}
            style={estilos.linkRegistro}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={estilos.linkTexto}>¿No tenés cuenta? Registrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const estilos = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  contenedor: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  titulo: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  formulario: {
    gap: SPACING.sm,
  },
  linkRegistro: {
    alignSelf: 'center',
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
    minHeight: 48,
    justifyContent: 'center',
  },
  linkTexto: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
