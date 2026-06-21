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
  Image, // 🚀 E2: Importamos Image para previsualizar la foto capturada
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // 🚀 E2: Librería nativa para controlar la cámara
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
  const [fotoBase64, setFotoBase64] = useState(null); // 🚀 E2: Estado para almacenar la foto procesada
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [cargando, setCargando] = useState(false);

  const actualizar = (campo) => (valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: '' }));
  };

  // 🚀 E2: Función nativa para solicitar permisos y activar la cámara del celular
  const tomarFoto = async () => {
    try {
      // Solicitar permisos de hardware en tiempo de ejecución
      const permisos = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permisos.granted) {
        Alert.alert('Permiso denegado', 'Se necesitan permisos de cámara para capturar la foto de tu mascota.');
        return;
      }

      // Lanzar la cámara nativa con configuraciones de compresión (< 2MB Regla de Negocio)
      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // Habilita recorte cuadrado impecable
        aspect: [1, 1],
        quality: 0.6, // Aplica compresión por software del lado del cliente
        base64: true, // Clave: Expo nos devuelve el string codificado listo para la API
      });

      if (!resultado.canceled && resultado.assets[0].base64) {
        setFotoBase64(resultado.assets[0].base64);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo abrir la cámara del dispositivo.');
    }
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
        clienteId: usuario?.id,
        foto: fotoBase64, // 🚀 E2: Se adjunta la imagen base64 para persistir en PostgreSQL
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

          {/* 🚀 E2: Componente Visual Interactivo de Captura Multimedia */}
          <View style={estilos.contenedorFoto}>
            <TouchableOpacity style={estilos.circuloFoto} onPress={tomarFoto} activeOpacity={0.8}>
              {fotoBase64 ? (
                <Image 
                  source={{ uri: `data:image/jpeg;base64,${fotoBase64}` }} 
                  style={estilos.fotoPrevisualizada} 
                />
              ) : (
                <View style={estilos.placeholderFotoContenedor}>
                  <Text style={estilos.placeholderFotoIcono}>📷</Text>
                  <Text style={estilos.placeholderFotoTexto}>Añadir foto</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

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
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  contenedorFoto: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  circuloFoto: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#647D8B', // Gris complementario oscuro uniforme
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#90C7A1', // Borde verde pastel del Figma
  },
  fotoPrevisualizada: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderFotoContenedor: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderFotoIcono: {
    fontSize: 26,
    marginBottom: 2,
  },
  placeholderFotoTexto: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  formulario: {
    gap: SPACING.sm,
  },
  botonGuardar: {
    backgroundColor: '#90C7A1', 
    marginTop: SPACING.lg,
  },
});

export default NuevaMascotaScreen;