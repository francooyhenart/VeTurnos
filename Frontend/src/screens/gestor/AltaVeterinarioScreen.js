// AltaVeterinarioScreen.js
import React, { useState, useEffect } from 'react';
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
  SelectorCampo,
  BotonPrimario,
  AlertaError,
  EncabezadoPersonalizado,
} from '../../components/ui';
import { FONT_SIZE, SPACING, ESPECIALIDADES } from '../../constants';
import { crearVeterinario, obtenerSedes } from '../../services/api';

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

const AltaVeterinarioScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    nombreCompleto: '',
    dni: '',
    telefono: '',
    email: '',
    password: '',
    matricula: '',
    especialidad: '',
    sedeId: '',
    horaInicio: '09:00',
    horaFin: '18:00',
  });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [cargando, setCargando] = useState(false);
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
    if (!form.nombreCompleto.trim()) nuevos.nombreCompleto = 'El nombre es obligatorio';
    if (!form.dni.trim()) nuevos.dni = 'El DNI es obligatorio';
    if (!/^\d{7,8}$/.test(form.dni)) nuevos.dni = 'El DNI debe tener 7 u 8 dígitos';
    if (!form.telefono.trim()) nuevos.telefono = 'El teléfono es obligatorio';
    if (!form.email.trim()) nuevos.email = 'El email es obligatorio';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nuevos.email = 'Email inválido';
    if (!form.password.trim()) nuevos.password = 'La contraseña es obligatoria';
    if (form.password.length < 8) nuevos.password = 'Mínimo 8 caracteres';
    if (!form.matricula.trim()) nuevos.matricula = 'La matrícula es obligatoria';
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

  return (
    <SafeAreaView style={estilos.safeArea}>
      <EncabezadoPersonalizado onVolver={() => navigation.goBack()} titulo="" estilo={estilos.encabezadoOscuro} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={estilos.scroll} keyboardShouldPersistTaps="handled">
          <Text style={estilos.titulo}>Nuevo Veterinario</Text>
          <View style={estilos.formulario}>
            <CampoTexto placeholder="Nombre Completo" valor={form.nombreCompleto} alCambiar={actualizar('nombreCompleto')} error={errores.nombreCompleto} />
            <CampoTexto placeholder="DNI" valor={form.dni} alCambiar={actualizar('dni')} error={errores.dni} teclado="numeric" />
            <CampoTexto placeholder="Teléfono" valor={form.telefono} alCambiar={actualizar('telefono')} error={errores.telefono} teclado="phone-pad" />
            <CampoTexto placeholder="Email" valor={form.email} alCambiar={actualizar('email')} error={errores.email} teclado="email-address" />
            <CampoTexto placeholder="Contraseña" valor={form.password} alCambiar={actualizar('password')} error={errores.password} seguro={true} />
            <CampoTexto placeholder="Matrícula Profesional" valor={form.matricula} alCambiar={actualizar('matricula')} error={errores.matricula} />
            <SelectorCampo placeholder="Especialidad (Opcional)" valor={form.especialidad} alCambiar={actualizar('especialidad')} opciones={ESPECIALIDADES} />
            
            {!cargandoSedes && sedes.length === 0 ? (
              <Text style={estilos.avisoSinSedes}>No hay sedes cargadas, crea una primero.</Text>
            ) : (
              <SelectorCampo placeholder="Sede (Opcional)" valor={form.sedeId} alCambiar={actualizar('sedeId')} opciones={sedes.map((s) => ({ label: s.nombre, value: String(s.id) }))} />
            )}

            <Text style={estilos.seccionLabel}>Jornada Laboral</Text>
            <SelectorCampo placeholder="Hora de Inicio" valor={form.horaInicio} alCambiar={actualizar('horaInicio')} opciones={OPCIONES_HORARIO} error={errores.horaInicio} />
            <SelectorCampo placeholder="Hora de Fin" valor={form.horaFin} alCambiar={actualizar('horaFin')} opciones={OPCIONES_HORARIO} error={errores.horaFin} />

            {!!errorGeneral && <AlertaError mensaje={errorGeneral} />}
            <BotonPrimario titulo="Guardar" onPress={manejarGuardar} cargando={cargando} estilo={estilos.botonGuardar} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#143343' },
  encabezadoOscuro: { backgroundColor: '#143343' },
  scroll: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl, flexGrow: 1 },
  titulo: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginVertical: SPACING.xl },
  formulario: { gap: SPACING.sm },
  seccionLabel: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: '#A3E1FC', marginTop: SPACING.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  avisoSinSedes: { fontSize: FONT_SIZE.sm, color: '#A3E1FC', fontStyle: 'italic', marginVertical: SPACING.xs },
  botonGuardar: { backgroundColor: '#90C7A1', marginTop: SPACING.lg },
});

export default AltaVeterinarioScreen;