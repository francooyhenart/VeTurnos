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
import { useAuth } from '../../context/AuthContext';
import { useMascotas } from '../../hooks/index';
import {
  CampoTexto,
  SelectorCampo,
  BotonPrimario,
  AlertaError,
  EncabezadoPersonalizado,
} from '../../components/ui';
import { COLORS, FONT_SIZE, SPACING, ESPECIES } from '../../constants';

const NuevaMascotaScreen = ({ navigation }) => {
  const { usuario } = useAuth();
  const { agregarMascota } = useMascotas(usuario?.id);

  const [form, setForm] = useState({
    nombre: '',
    especie: '',
    raza: '',
    edad: '',
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
    if (!form.nombre.trim()) nuevos.nombre = 'El nombre es obligatorio';
    if (!form.especie) nuevos.especie = 'La especie es obligatoria';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const manejarGuardar = async () => {
    setErrorGeneral('');
    if (!validar()) return;

    setCargando(true);
    try {
      await agregarMascota({
        nombre: form.nombre.trim(),
        especie: form.especie,
        raza: form.raza.trim() || null,
        edad: form.edad ? parseInt(form.edad, 10) : null,
      });
      navigation.goBack();
    } catch (e) {
      setErrorGeneral(e.message || 'Error al guardar la mascota.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={estilos.safeArea}>
      {/* 🚀 Encabezado unificado con el fondo oscuro */}
      <EncabezadoPersonalizado onVolver={() => navigation.goBack()} titulo="" estilo={estilos.encabezadoOscuro} />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={estilos.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={estilos.titulo}>Nueva mascota</Text>

          <View style={estilos.formulario}>
            <CampoTexto
              placeholder="Nombre"
              valor={form.nombre}
              alCambiar={actualizar('nombre')}
              error={errores.nombre}
            />
            <SelectorCampo
              placeholder="Especie"
              valor={form.especie}
              alCambiar={actualizar('especie')}
              opciones={ESPECIES}
              error={errores.especie}
            />
            <CampoTexto
              placeholder="Raza"
              valor={form.raza}
              alCambiar={actualizar('raza')}
            />
            <CampoTexto
              placeholder="Edad (años)"
              valor={form.edad}
              alCambiar={actualizar('edad')}
              teclado="numeric"
            />

            {!!errorGeneral && <AlertaError mensaje={errorGeneral} />}

            {/* 🚀 BOTÓN GUARDAR VERDE PASTEL DEL FIGMA */}
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

// ════════════════════════════════════════════
//  ESTILOS CORREGIDOS CON LA PALETA FIGMA B3
// ════════════════════════════════════════════
const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#143343', // 🎨 Fondo Azul Petróleo Oscuro
  },
  encabezadoOscuro: {
    backgroundColor: '#143343', // 🎨 Fondo de la barra superior oscuro
  },
  scroll: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    flexGrow: 1,
  },
  titulo: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: '#FFFFFF', // 🎨 Letras blancas para el título
    textAlign: 'center',
    marginVertical: SPACING.xl,
  },
  formulario: {
    gap: SPACING.sm,
  },
  botonGuardar: {
    backgroundColor: '#90C7A1', // 🎨 Botón Verde Pastel del Figma
    marginTop: SPACING.lg,
  },
});

export default NuevaMascotaScreen;