import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { registrarCliente } from '../../services/api';
import { CampoTexto, BotonPrimario, AlertaError, EncabezadoPersonalizado } from '../../components/ui';
import { COLORS, FONT_SIZE, SPACING } from '../../constants';

const RegistroScreen = ({ navigation }) => {
  const { iniciarSesion } = useAuth();
  const [form, setForm] = useState({
    nombreCompleto: '',
    dni: '',
    telefono: '',
    email: '',
    password: '',
  });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [cargando, setCargando] = useState(false);

  const actualizar = (campo) => (valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: '' }));
  };

  const validar = () => {
    const nuevosErrores = {};
    if (!form.nombreCompleto.trim()) nuevosErrores.nombreCompleto = 'El nombre es obligatorio';
    if (!form.dni.trim()) nuevosErrores.dni = 'El DNI es obligatorio';
    if (!form.email.trim()) nuevosErrores.email = 'El email es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      nuevosErrores.email = 'Formato de email inválido';
    if (!form.password.trim()) nuevosErrores.password = 'La contraseña es obligatoria';
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarRegistro = async () => {
    setErrorGeneral('');
    if (!validar()) return;

    setCargando(true);
    try {
      const respuesta = await registrarCliente({
        nombreCompleto: form.nombreCompleto.trim(),
        dni: form.dni.trim(),
        telefono: form.telefono.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      const usuarioSinToken = {
        id: respuesta.id,
        nombreCompleto: respuesta.nombreCompleto,
        email: respuesta.email,
        rol: respuesta.rol,
      };
      await iniciarSesion(usuarioSinToken, respuesta.token);
    } catch (e) {
      setErrorGeneral(e.message || 'Error al registrarse.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={estilos.safeArea}>
        {/* 🚀 Encabezado unificado oscuro para la flecha de volver */}
        <EncabezadoPersonalizado onVolver={() => navigation.goBack()} titulo="" estilo={estilos.encabezadoOscuro} />
        
        <ScrollView
          contentContainerStyle={estilos.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={estilos.contenedor}>
            <Text style={estilos.titulo}>Crear cuenta</Text>

            <View style={estilos.formulario}>
              <CampoTexto
                placeholder="Nombre completo"
                valor={form.nombreCompleto}
                alCambiar={actualizar('nombreCompleto')}
                error={errores.nombreCompleto}
              />
              <CampoTexto
                placeholder="DNI"
                valor={form.dni}
                alCambiar={actualizar('dni')}
                teclado="numeric"
                error={errores.dni}
              />
              <CampoTexto
                placeholder="Teléfono"
                valor={form.telefono}
                alCambiar={actualizar('telefono')}
                teclado="phone-pad"
              />
              <CampoTexto
                placeholder="Email"
                valor={form.email}
                alCambiar={actualizar('email')}
                teclado="email-address"
                error={errores.email}
              />
              <CampoTexto
                placeholder="Contraseña"
                valor={form.password}
                alCambiar={actualizar('password')}
                esPassword
                error={errores.password}
              />

              {!!errorGeneral && (
                <AlertaError mensaje={errorGeneral} estilo={{ marginTop: SPACING.xs }} />
              )}

              {/* 🚀 BOTÓN REGISTRAR EN VERDE PASTEL */}
              <BotonPrimario
                titulo="Registrar"
                onPress={manejarRegistro}
                cargando={cargando}
                estilo={estilos.botonRegistrar}
              />
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={estilos.linkLogin}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={estilos.linkTexto}>¿Ya tenés cuenta? Ingresá</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

// ════════════════════════════════════════════
//  ESTILOS CORREGIDOS CON LA PALETA FIGMA
// ════════════════════════════════════════════
const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#143343', // 🎨 Asegura el fondo oscuro continuo arriba
  },
  encabezadoOscuro: {
    backgroundColor: '#143343',
  },
  scroll: {
    flexGrow: 1,
  },
  contenedor: {
    flex: 1,
    backgroundColor: '#143343', // 🎨 Fondo Azul Petróleo Oscuro
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  titulo: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: '#FFFFFF', // 🎨 Título en blanco impecable
    textAlign: 'center',
    marginVertical: SPACING.xl,
  },
  formulario: {
    gap: SPACING.sm,
  },
  botonRegistrar: {
    backgroundColor: '#90C7A1', // 🎨 Botón principal Verde Pastel del Figma
    marginTop: SPACING.lg,
  },
  linkLogin: {
    alignSelf: 'center',
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
    minHeight: 48,
    justifyContent: 'center',
  },
  linkTexto: {
    fontSize: FONT_SIZE.sm,
    color: '#A3E1FC', // 🎨 Enlace en celeste pastel para resaltar prolijo
    textDecorationLine: 'underline',
  },
});

export default RegistroScreen;