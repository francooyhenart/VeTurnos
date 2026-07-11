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

const generarOpcionesHorario = (horaInicio = 6, horaFin = 22, pasoMinutos = 30) => {
  const opciones = [];
for (let minutos = horaInicio * 60; minutos <= horaFin * 60; minutos += pasoMinutos) {    const h = String(Math.floor(minutos / 60)).padStart(2, '0');
    const m = String(minutos % 60).padStart(2, '0');
    const valor = `${h}:${m}`;
    opciones.push({ label: valor, value: valor });
  }
  return opciones;
};

const OPCIONES_HORARIO = generarOpcionesHorario();

const aHoraCorta = (horaStr, valorPorDefecto) => {
  if (!horaStr) return valorPorDefecto;
  return horaStr.slice(0, 5);
};

const DetalleVeterinarioScreen = ({ navigation, route }) => {
  const { veterinario, modoInicial } = route.params;

  const [form, setForm] = useState({
    nombreCompleto: veterinario.nombreCompleto || '',
    telefono: veterinario.telefono || '',
    especialidad: veterinario.especialidad || '',
    email: veterinario.email || '',
    matricula: veterinario.matricula || '',
    sedeId: veterinario.sede?.id ? String(veterinario.sede.id) : '',
    horaInicio: aHoraCorta(veterinario.horaInicio, '09:00'),
    horaFin: aHoraCorta(veterinario.horaFin, '18:00'),
  });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [cargando, setCargando] = useState(false);
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
    if (!form.horaInicio) nuevos.horaInicio = 'La hora de inicio es obligatoria';
    if (!form.horaFin) nuevos.horaFin = 'La hora de fin es obligatoria';
    if (form.horaInicio && form.horaFin && form.horaInicio >= form.horaFin) {
      nuevos.horaFin = 'La hora de fin debe ser posterior a la de inicio';
    }
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const manejarGuardar = async () => {
    setErrorGeneral('');
    if (!validar()) return;

    setCargando(true);
    try {
      const sedeSeleccionada = sedes.find(s => String(s.id) === form.sedeId);

      const payload = {
        nombreCompleto: form.nombreCompleto,
        email: form.email,
        matricula: form.matricula,
        telefono: form.telefono,
        especialidad: form.especialidad,
        sedeId: form.sedeId ? parseInt(form.sedeId, 10) : null,
        horaInicio: form.horaInicio.length === 5 ? `${form.horaInicio}:00` : form.horaInicio,
        horaFin: form.horaFin.length === 5 ? `${form.horaFin}:00` : form.horaFin,
      };
      
      await actualizarVeterinario(veterinario.id, payload);

      veterinario.nombreCompleto = payload.nombreCompleto;
      veterinario.email = payload.email;
      veterinario.matricula = payload.matricula;
      veterinario.telefono = payload.telefono;
      veterinario.especialidad = payload.especialidad;
      veterinario.horaInicio = payload.horaInicio;
      veterinario.horaFin = payload.horaFin;
      veterinario.sede = sedeSeleccionada ? { id: sedeSeleccionada.id, nombre: sedeSeleccionada.nombre } : null;

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
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={estilos.flechaTexto}>←</Text></TouchableOpacity>
        <Text style={estilos.titulo}>Detalles</Text>
        {modo === 'edicion' ? (
          <TouchableOpacity onPress={() => setModo('vista')} accessibilityLabel="Cancelar edición"><Text style={estilos.botonEditar}>✕</Text></TouchableOpacity>
        ) : (
          <View style={estilos.espacioEncabezado} />
        )}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={estilos.scroll}>
          {modo === 'vista' ? (
            <>
              <View style={estilos.tarjetaInfo}><Text style={estilos.label}>Nombre</Text><Text style={estilos.valor}>{form.nombreCompleto}</Text></View>
              <View style={estilos.tarjetaInfo}><Text style={estilos.label}>Matrícula</Text><Text style={estilos.valor}>{form.matricula}</Text></View>
              <View style={estilos.tarjetaInfo}><Text style={estilos.label}>Email</Text><Text style={estilos.valor}>{form.email}</Text></View>
              <View style={estilos.tarjetaInfo}><Text style={estilos.label}>Teléfono</Text><Text style={estilos.valor}>{form.telefono || 'No especificado'}</Text></View>
              <View style={estilos.tarjetaInfo}><Text style={estilos.label}>Especialidad</Text><Text style={estilos.valor}>{form.especialidad || 'No especificada'}</Text></View>
              <View style={estilos.tarjetaInfo}><Text style={estilos.label}>Sede</Text><Text style={estilos.valor}>{veterinario.sede?.nombre || 'Sin asignar'}</Text></View>
              <View style={estilos.tarjetaInfo}>
                <Text style={estilos.label}>Jornada Laboral</Text>
                <Text style={estilos.valor}>{form.horaInicio} a {form.horaFin}</Text>
              </View>

              <View style={estilos.accionesContenedor}>
                <TouchableOpacity style={estilos.botonAgenda} onPress={() => navigation.navigate('AgendaVeterinario', { veterinario })}>
                  <Text style={estilos.botonAgendaTexto}>📅 Ver Agenda</Text>
                </TouchableOpacity>
                <BotonPrimario titulo="Modificar Datos" onPress={() => setModo('edicion')} estilo={estilos.botonModificar} />
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
              <SelectorCampo placeholder="Especialidad" valor={form.especialidad} alCambiar={actualizar('especialidad')} opciones={ESPECIALIDADES} />

              {!cargandoSedes && sedes.length === 0 ? (
                <Text style={estilos.avisoSinSedes}>No hay sedes cargadas, crea una primero.</Text>
              ) : (
                <SelectorCampo placeholder="Sede (Opcional)" valor={form.sedeId} alCambiar={actualizar('sedeId')} opciones={sedes.map((s) => ({ label: s.nombre, value: String(s.id) }))} />
              )}

              <Text style={estilos.seccionLabel}>Jornada Laboral</Text>
              <SelectorCampo placeholder="Hora de Inicio" valor={form.horaInicio} alCambiar={actualizar('horaInicio')} opciones={OPCIONES_HORARIO} error={errores.horaInicio} />
              <SelectorCampo placeholder="Hora de Fin" valor={form.horaFin} alCambiar={actualizar('horaFin')} opciones={OPCIONES_HORARIO} error={errores.horaFin} />

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
  seccionLabel: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: '#A3E1FC', marginTop: SPACING.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  avisoSinSedes: { fontSize: FONT_SIZE.sm, color: '#A3E1FC', fontStyle: 'italic', marginVertical: SPACING.xs },
  botonGuardar: { backgroundColor: '#90C7A1', marginTop: SPACING.lg },
});

export default DetalleVeterinarioScreen;