// NuevaSedeScreen.js - Alta de sede/sucursal (RF-12)
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
  ModalExito,
  EncabezadoPersonalizado,
} from '../../components/ui';
import { FONT_SIZE, SPACING } from '../../constants';
import { crearSede } from '../../services/api';

const NuevaSedeScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    nombre: '',
    calle: '',
    numero: '',
    entreCalles: '',
  });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalExito, setModalExito] = useState(false);

  const actualizar = (campo) => (valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: '' }));
  };

  const validar = () => {
    const nuevos = {};
    if (!form.nombre.trim()) nuevos.nombre = 'El nombre es obligatorio';
    if (!form.calle.trim()) nuevos.calle = 'La calle es obligatoria';
    if (!form.numero.trim()) nuevos.numero = 'El número es obligatorio';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const manejarGuardar = async () => {
    setErrorGeneral('');
    if (!validar()) return;

    setCargando(true);
    try {
      await crearSede(form);
      setModalExito(true);
    } catch (e) {
      setErrorGeneral(e.message || 'Error al registrar la sede');
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
          <Text style={estilos.titulo}>Nueva Sede</Text>

          <View style={estilos.formulario}>
            <CampoTexto
              placeholder="Nombre de la Sede"
              valor={form.nombre}
              alCambiar={actualizar('nombre')}
              error={errores.nombre}
            />
            <CampoTexto
              placeholder="Calle"
              valor={form.calle}
              alCambiar={actualizar('calle')}
              error={errores.calle}
            />
            <CampoTexto
              placeholder="Número"
              valor={form.numero}
              alCambiar={actualizar('numero')}
              error={errores.numero}
              teclado="numeric"
            />
            <CampoTexto
              placeholder="Entre calles (Opcional)"
              valor={form.entreCalles}
              alCambiar={actualizar('entreCalles')}
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

      <ModalExito
        visible={modalExito}
        titulo="¡Sede registrada con éxito!"
        textBoton="Volver"
        onAccion={() => {
          setModalExito(false);
          navigation.goBack();
        }}
      />
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

export default NuevaSedeScreen;
