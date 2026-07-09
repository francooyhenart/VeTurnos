// DetalleVeterinarioScreen.js
import React, { useState, useEffect } from 'react';
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
  SelectorCampo,
  BotonPrimario,
  AlertaError,
  ModalConfirmacion,
} from '../../components/ui';
import { FONT_SIZE, SPACING, ESPECIALIDADES } from '../../constants';
import { actualizarVeterinario, eliminarVeterinario, obtenerSedes } from '../../services/api';

const DetalleVeterinarioScreen = ({ navigation, route }) => {
  const { veterinario, modoInicial } = route.params;

  const [form, setForm] = useState({
    nombreCompleto: veterinario.nombreCompleto || '',
    telefono: veterinario.telefono || '',
    especialidad: veterinario.especialidad || '',
    email: veterinario.email || '',
    matricula: veterinario.matricula || '',
    sedeId: veterinario.sede?.id ? String(veterinario.sede.id) : '',
  });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [cargando, setCargando] = useState(false);
  // Punto 1: el lápiz en el listado navega directo acá con modoInicial='edicion'
  const [modo, setModo] = useState(modoInicial || 'vista');
  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  const [sedes, setSedes] = useState([]);
  const [cargandoSedes, setCargandoSedes] = useState(true);

  useEffect(() => {
    obtenerSedes()
      .then(setSedes)
      .catch(() => setSedes([]))
      .finally(() => setCargandoSedes(false));
  }, []);

  const actualizar = (campo) => (valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: '' }));
  };

  const validar = () => {
    const nuevos = {};
    if (!form.nombreCompleto?.trim()) nuevos.nombreCompleto = 'El nombre es obligatorio';
    if (!form.email?.trim()) {
      nuevos.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nuevos.email = 'El formato del email no es válido';
    }
    if (!form.matricula?.trim()) nuevos.matricula = 'La matrícula es obligatoria';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const manejarGuardar = async () => {
    setErrorGeneral('');
    if (!validar()) return;

    setCargando(true);
    try {
      // sedeId viaja como número (o null si se dejó sin seleccionar)
      const payload = {
        ...form,
        sedeId: form.sedeId ? parseInt(form.sedeId, 10) : null,
      };
      await actualizarVeterinario(veterinario.id, payload);
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
        {modo === 'edicion' ? (
          <TouchableOpacity onPress={() => setModo('vista')} accessibilityLabel="Cancelar edición">
            <Text style={estilos.botonEditar}>✕</Text>
          </TouchableOpacity>
        ) : (
          <View style={estilos.espacioEncabezado} />
        )}
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
              <View style={estilos.tarjetaInfo}><Text style={estilos.label}>Sede</Text><Text style={estilos.valor}>{veterinario.sede?.nombre || 'Sin asignar'}</Text></View>

              <View style={estilos.accionesContenedor}>
                <TouchableOpacity style={estilos.botonAgenda} onPress={() => navigation.navigate('AgendaVeterinario', { veterinario })}>
                  <Text style={estilos.botonAgendaTexto}>📅 Ver Agenda</Text>
                </TouchableOpacity>
                <BotonPrimario
                  titulo="Modificar Datos"
                  onPress={() => setModo('edicion')}
                  estilo={estilos.botonModificar}
                />
                <TouchableOpacity style={estilos.botonEliminarRojo} onPress={() => setMostrarEliminar(true)}>
                  <Text style={estilos.botonEliminarTexto}>🗑️ Eliminar Veterinario</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={estilos.formulario}>
              <Text style={estilos.tituloEdicion}>Editar Veterinario</Text>
              <CampoTexto placeholder="Nombre Completo" valor={form.nombreCompleto} alCambiar={actualizar('nombreCompleto')} error={errores.nombreCompleto} />
              <CampoTexto placeholder="Email" valor={form.email} alCambiar={actualizar('email')} teclado="email-address" error={errores.email} />
              <CampoTexto placeholder="Matrícula" valor={form.matricula} alCambiar={actualizar('matricula')} error={errores.matricula} />
              <CampoTexto placeholder="Teléfono" valor={form.telefono} alCambiar={actualizar('telefono')} teclado="phone-pad" />
              <SelectorCampo
                placeholder="Especialidad"
                valor={form.especialidad}
                alCambiar={actualizar('especialidad')}
                opciones={ESPECIALIDADES}
              />

              {!cargandoSedes && sedes.length === 0 ? (
                <Text style={estilos.avisoSinSedes}>
                  No hay sedes cargadas, crea una primero.
                </Text>
              ) : (
                <SelectorCampo
                  placeholder="Sede (Opcional)"
                  valor={form.sedeId}
                  alCambiar={actualizar('sedeId')}
                  opciones={sedes.map((s) => ({ label: s.nombre, value: String(s.id) }))}
                />
              )}

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
  espacioEncabezado: { width: 32 },
  scroll: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, paddingBottom: SPACING.xl },
  tarjetaInfo: { backgroundColor: '#E3E3E3', borderRadius: 12, padding: SPACING.md, marginVertical: SPACING.sm },
  label: { fontSize: FONT_SIZE.sm, color: '#666', fontWeight: '600' },
  valor: { fontSize: FONT_SIZE.md, color: '#1F1F1F', fontWeight: '700', marginTop: SPACING.xs },
  accionesContenedor: { marginTop: SPACING.md, gap: 15 },
  botonAgenda: { backgroundColor: '#A3E1FC', borderRadius: 12, paddingVertical: SPACING.lg, alignItems: 'center', width: '100%' },
  botonAgendaTexto: { fontSize: FONT_SIZE.md, fontWeight: '700', color: '#143343' },
  botonModificar: { backgroundColor: '#90C7A1', paddingVertical: SPACING.lg, width: '100%' },
  botonEliminarRojo: { backgroundColor: '#FCA5A5', borderRadius: 12, paddingVertical: SPACING.lg, alignItems: 'center', width: '100%' },
  botonEliminarTexto: { fontSize: FONT_SIZE.md, fontWeight: '700', color: '#7F1D1D' },
  tituloEdicion: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: SPACING.xl },
  formulario: { gap: SPACING.sm },
  avisoSinSedes: { fontSize: FONT_SIZE.sm, color: '#A3E1FC', fontStyle: 'italic', marginVertical: SPACING.xs },
  botonGuardar: { backgroundColor: '#90C7A1', marginTop: SPACING.lg },
});

export default DetalleVeterinarioScreen;