// DetalleVeterinarioScreen.js
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
} from 'react-native';
import {
  CampoTexto,
  BotonPrimario,
  AlertaError,
  ModalConfirmacion,
} from '../../components/ui';
import { FONT_SIZE, SPACING } from '../../constants';
import { actualizarVeterinario, eliminarVeterinario } from '../../services/api';

const DetalleVeterinarioScreen = ({ navigation, route }) => {
  const { veterinario } = route.params;
  
  const [form, setForm] = useState({
    nombreCompleto: veterinario.nombreCompleto || '',
    telefono: veterinario.telefono || '',
    especialidad: veterinario.especialidad || '',
  });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modo, setModo] = useState('vista');
  const [mostrarEliminar, setMostrarEliminar] = useState(false);

  const actualizar = (campo) => (valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: '' }));
  };

  const validar = () => {
    const nuevos = {};
    if (!form.nombreCompleto?.trim()) nuevos.nombreCompleto = 'El nombre es obligatorio';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const manejarGuardar = async () => {
    setErrorGeneral('');
    if (!validar()) return;

    setCargando(true);
    try {
      await actualizarVeterinario(veterinario.id, form);
      setModo('vista');
    } catch (e) {
      setErrorGeneral(e.message || 'Error al guardar los cambios');
    } finally {
      setCargando(false);
    }
  };

  const manejarEliminar = async () => {
    setCargando(true);
    try {
      await eliminarVeterinario(veterinario.id);
      setMostrarEliminar(false);
      navigation.goBack();
    } catch (e) {
      setErrorGeneral(e.message || 'Error al eliminar el veterinario');
      setMostrarEliminar(false);
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={estilos.safeArea}>
      <View style={estilos.encabezado}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={estilos.flechaTexto}>←</Text>
        </TouchableOpacity>
        <Text style={estilos.titulo}>Detalles</Text>
        <TouchableOpacity onPress={() => setModo(modo === 'vista' ? 'edicion' : 'vista')}>
          <Text style={estilos.botonEditar}>{modo === 'vista' ? '✏️' : '✕'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={estilos.scroll}>
          {modo === 'vista' ? (
            <>
              <View style={estilos.tarjetaInfo}><Text style={estilos.label}>Nombre</Text><Text style={estilos.valor}>{veterinario.nombreCompleto}</Text></View>
              <View style={estilos.tarjetaInfo}><Text style={estilos.label}>Matrícula</Text><Text style={estilos.valor}>{veterinario.matricula}</Text></View>
              <View style={estilos.tarjetaInfo}><Text style={estilos.label}>Email</Text><Text style={estilos.valor}>{veterinario.email}</Text></View>
              <View style={estilos.tarjetaInfo}><Text style={estilos.label}>Teléfono</Text><Text style={estilos.valor}>{veterinario.telefono || 'No especificado'}</Text></View>
              <View style={estilos.tarjetaInfo}><Text style={estilos.label}>Especialidad</Text><Text style={estilos.valor}>{veterinario.especialidad || 'No especificada'}</Text></View>
              <TouchableOpacity style={estilos.botonAgenda} onPress={() => navigation.navigate('AgendaVeterinario', { veterinario })}>
                <Text style={estilos.botonAgendaTexto}>📅 Ver Agenda</Text>
              </TouchableOpacity>
              <TouchableOpacity style={estilos.botonEliminarRojo} onPress={() => setMostrarEliminar(true)}>
                <Text style={estilos.botonEliminarTexto}>🗑️ Eliminar Veterinario</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={estilos.formulario}>
              <Text style={estilos.tituloEdicion}>Editar Veterinario</Text>
              <CampoTexto placeholder="Nombre Completo" valor={form.nombreCompleto} alCambiar={actualizar('nombreCompleto')} error={errores.nombreCompleto} />
              <CampoTexto placeholder="Teléfono" valor={form.telefono} alCambiar={actualizar('telefono')} teclado="phone-pad" />
              <CampoTexto placeholder="Especialidad" valor={form.especialidad} alCambiar={actualizar('especialidad')} />

              {!!errorGeneral && <AlertaError mensaje={errorGeneral} />}
              <BotonPrimario titulo="Guardar Cambios" onPress={manejarGuardar} cargando={cargando} estilo={estilos.botonGuardar} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <ModalConfirmacion visible={mostrarEliminar} titulo="¿Eliminar veterinario?" descripcion={`¿Estás seguro de eliminar a ${form.nombreCompleto}?`} onConfirmar={manejarEliminar} onCancelar={() => setMostrarEliminar(false)} />
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#143343' },
  encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#143343', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, paddingTop: SPACING.lg },
  flechaTexto: { fontSize: FONT_SIZE.xl, color: '#FFFFFF', fontWeight: '700' },
  titulo: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: '#FFFFFF' },
  botonEditar: { fontSize: FONT_SIZE.lg },
  scroll: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, paddingBottom: SPACING.xl },
  tarjetaInfo: { backgroundColor: '#E3E3E3', borderRadius: 12, padding: SPACING.md, marginVertical: SPACING.sm },
  label: { fontSize: FONT_SIZE.sm, color: '#666', fontWeight: '600' },
  valor: { fontSize: FONT_SIZE.md, color: '#1F1F1F', fontWeight: '700', marginTop: SPACING.xs },
  botonAgenda: { backgroundColor: '#A3E1FC', borderRadius: 12, paddingVertical: SPACING.lg, alignItems: 'center', marginVertical: SPACING.xl },
  botonAgendaTexto: { fontSize: FONT_SIZE.md, fontWeight: '700', color: '#143343' },
  botonEliminarRojo: { backgroundColor: '#FCA5A5', borderRadius: 12, paddingVertical: SPACING.lg, alignItems: 'center', marginVertical: SPACING.md },
  botonEliminarTexto: { fontSize: FONT_SIZE.md, fontWeight: '700', color: '#7F1D1D' },
  tituloEdicion: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: SPACING.xl },
  formulario: { gap: SPACING.sm },
  botonGuardar: { backgroundColor: '#90C7A1', marginTop: SPACING.lg },
});

export default DetalleVeterinarioScreen;