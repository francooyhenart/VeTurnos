import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
  const [foto, setFoto] = useState(null);

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

  const seleccionarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitás permitir el acceso a la galería para seleccionar una foto.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.15,
      base64: true,
    });

    if (!resultado.canceled) {
      const asset = resultado.assets[0];
      setFoto({
        uri: asset.uri,
        base64: asset.base64,
        mimeType: asset.mimeType || 'image/jpeg',
      });
    }
  };

  const tomarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitás permitir el acceso a la cámara para tomar una foto.');
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.15,
      base64: true,
    });

    if (!resultado.canceled) {
      const asset = resultado.assets[0];
      setFoto({
        uri: asset.uri,
        base64: asset.base64,
        mimeType: asset.mimeType || 'image/jpeg',
      });
    }
  };

  const manejarGuardar = async () => {
    setErrorGeneral('');
    if (!validar()) return;

    setCargando(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        especie: form.especie,
        raza: form.raza.trim() || '',
        edad: form.edad ? parseInt(form.edad, 10) : null,
      };

      const fotoBase64 = foto?.base64?.trim();
      const fotoParaEnviar = fotoBase64 && fotoBase64.length < 400000
        ? `data:${foto.mimeType || 'image/jpeg'};base64,${fotoBase64}`
        : null;

      const mascotaCreada = fotoParaEnviar
        ? await agregarMascota({ ...payload, foto: fotoParaEnviar })
        : await agregarMascota(payload);

      navigation.navigate('ListaMascotas', {
        mascotaCreada: {
          ...mascotaCreada,
          foto: fotoParaEnviar || foto?.uri || null,
        },
      });
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

            <View style={estilos.seccionFoto}>
              <Text style={estilos.labelFoto}>Foto de la mascota</Text>
              {foto ? (
                <Image source={{ uri: foto.uri || foto }} style={estilos.previewFoto} />
              ) : (
                <View style={estilos.previewVacio}>
                  <Text style={estilos.previewVacioTexto}>Sin foto seleccionada</Text>
                </View>
              )}
              <View style={estilos.botonesFoto}>
                <TouchableOpacity style={estilos.botonFoto} onPress={seleccionarFoto}>
                  <Text style={estilos.botonFotoTexto}>Galería</Text>
                </TouchableOpacity>
                <TouchableOpacity style={estilos.botonFoto} onPress={tomarFoto}>
                  <Text style={estilos.botonFotoTexto}>Cámara</Text>
                </TouchableOpacity>
              </View>
            </View>

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
  seccionFoto: {
    marginTop: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    gap: SPACING.sm,
  },
  labelFoto: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: '#143343',
  },
  previewFoto: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#E8F0F2',
  },
  previewVacio: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#E8F0F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewVacioTexto: {
    color: '#6B7A80',
    fontSize: FONT_SIZE.sm,
  },
  botonesFoto: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  botonFoto: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    backgroundColor: '#143343',
    alignItems: 'center',
  },
  botonFotoTexto: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default NuevaMascotaScreen;