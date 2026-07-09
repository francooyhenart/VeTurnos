import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Image, // 🚀 IMPORTANTE: Agregamos Image para renderizar el logo
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../services/api';
import { CampoTexto, BotonPrimario, AlertaError } from '../../components/ui';
import { FONT_SIZE, SPACING } from '../../constants';

const logoImagen = require('../../logo.jpg');

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
      const respuesta = await login({ email: email.trim(), password });
      const usuarioSinToken = {
        id: respuesta.id,
        nombreCompleto: respuesta.nombreCompleto,
        email: respuesta.email,
        rol: respuesta.rol,
      };
      await iniciarSesion(usuarioSinToken, respuesta.token);
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
          
          {/* 🚀 EL LOGO EN CUADRADO CON BORDES REDONDEADOS */}
          <View style={estilos.logoContenedor}>
            <View style={estilos.logoCuadrado}>
              <Image
                source={logoImagen}
                style={estilos.logo}
                resizeMode="contain"
              />
            </View>
          </View>

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
              estilo={estilos.botonIngresar}
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

// ════════════════════════════════════════════
//  ESTILOS ACTUALIZADOS CON EL LOGO CIRCULAR
// ════════════════════════════════════════════
const estilos = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  contenedor: {
    flex: 1,
    backgroundColor: '#143343',
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  /* 🚀 Estilos para el contenedor cuadrado del logo */
  logoContenedor: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoCuadrado: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  titulo: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  formulario: {
    gap: SPACING.sm,
  },
  botonIngresar: {
    backgroundColor: '#90C7A1',
    marginTop: SPACING.lg,
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
    color: '#A3E1FC',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;