// AltaVeterinarioScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import {
  CampoTexto,
  BotonPrimario,
  AlertaError,
  EncabezadoPersonalizado,
} from '../../components/ui';
import { FONT_SIZE, SPACING } from '../../constants';
import { crearVeterinario } from '../../services/api';

const AltaVeterinarioScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    nombreCompleto: '',
    dni: '',
    telefono: '',
    email: '',
    password: '',
    matricula: '',
    especialidad: '',
  });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [cargando, setCargando] = useState(false);

  const actualizar = (campo) => (valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: '' }));
  };

  const validar = () => {
    const nuevos = {};
    if (!form.nombreCompleto.trim()) nuevos.nombreCompleto = 'El nombre es obligatorio';
    if (!form.dni.trim()) nuevos.dni = 'El DNI es obligatorio';
    if (!/^\d{7,8}$/.test(form.dni)) nuevos.dni = 'El DNI debe tener 7 u 8 dígitos';
    if (!form.telefono.trim()) nuevos.telefono = 'El teléfono es obligatorio';
    if (!form.email.trim()) nuevos.email = 'El email es obligatorio';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nuevos.email = 'Email inválido';
    if (!form.password.trim()) nuevos.password = 'La contraseña es obligatoria';
    if (form.password.length < 8) nuevos.password = 'Mínimo 8 caracteres';
    if (!form.matricula.trim()) nuevos.matricula = 'La matrícula es obligatoria';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

const manejarGuardar = async () => {
    setErrorGeneral('');
    if (!validar()) return;

    setCargando(true);
    try {
      // Pasamos el objeto 'form' completo
      const respuesta = await crearVeterinario(form);
      
      // Si todo sale bien, navegamos hacia atrás
      navigation.navigate('GestionVeterinarios', { refresh: true }); 
    } catch (e) {
      // Capturamos el error específico del backend
      setErrorGeneral(e.response?.data?.message || 'Error al registrar el veterinario');
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={estilos.safeArea}>
      <EncabezadoPersonalizado
        onVolver={() => navigation.goBack()}
        titulo=""
        estilo={estilos.encabezadoOscuro}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={estilos.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={estilos.titulo}>Nuevo Veterinario</Text>

          <View style={estilos.formulario}>
            <CampoTexto
              placeholder="Nombre Completo"
              valor={form.nombreCompleto}
              alCambiar={actualizar('nombreCompleto')}
              error={errores.nombreCompleto}
            />
            <CampoTexto
              placeholder="DNI"
              valor={form.dni}
              alCambiar={actualizar('dni')}
              error={errores.dni}
              teclado="numeric"
            />
            <CampoTexto
              placeholder="Teléfono"
              valor={form.telefono}
              alCambiar={actualizar('telefono')}
              error={errores.telefono}
              teclado="phone-pad"
            />
            <CampoTexto
              placeholder="Email"
              valor={form.email}
              alCambiar={actualizar('email')}
              error={errores.email}
              teclado="email-address"
            />
            <CampoTexto
              placeholder="Contraseña"
              valor={form.password}
              alCambiar={actualizar('password')}
              error={errores.password}
              seguro={true}
            />
            <CampoTexto
              placeholder="Matrícula Profesional"
              valor={form.matricula}
              alCambiar={actualizar('matricula')}
              error={errores.matricula}
            />
            <CampoTexto
              placeholder="Especialidad (Opcional)"
              valor={form.especialidad}
              alCambiar={actualizar('especialidad')}
            />

            {!!errorGeneral && <AlertaError mensaje={errorGeneral} />}

            <BotonPrimario
              titulo="Guardar"
              onPress={manejarGuardar}
              cargando={cargando}
              estilo={estilos.botonGuardar}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#143343',
  },
  encabezadoOscuro: {
    backgroundColor: '#143343',
  },
  scroll: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    flexGrow: 1,
  },
  titulo: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: SPACING.xl,
  },
  formulario: {
    gap: SPACING.sm,
  },
  botonGuardar: {
    backgroundColor: '#90C7A1',
    marginTop: SPACING.lg,
  },
});

export default AltaVeterinarioScreen;
