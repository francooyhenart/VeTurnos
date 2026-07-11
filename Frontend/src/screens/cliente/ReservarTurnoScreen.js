// ReservarTurnoScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import {
  listarMascotasPorCliente,
  obtenerDisponibilidad,
  obtenerSedes,
  obtenerVeterinarios,
  crearReserva,
} from '../../services/api';
import {
  SelectorCampo,
  SelectorFecha,
  BotonPrimario,
  AlertaError,
  ModalExito,
  CargandoPantalla,
  EncabezadoPersonalizado,
} from '../../components/ui';
import { COLORS, FONT_SIZE, SPACING, MOTIVOS } from '../../constants';

const esMotivoCirugia = (motivo) => {
  const texto = typeof motivo === 'string' ? motivo : (motivo?.label ?? motivo?.value ?? '');
  return String(texto).toLowerCase().includes('cirug');
};

const MOTIVOS_CLIENTE = MOTIVOS.filter((motivo) => !esMotivoCirugia(motivo));

// Generador dinámico de bloques horarios basado en la jornada del veterinario asignado
const generarBloquesJornada = (inicioStr, finStr) => {
  if (!inicioStr || !finStr) return [];
  const opciones = [];
  const [hInicio, mInicio] = inicioStr.slice(0, 5).split(':').map(Number);
  const [hFin, mFin] = finStr.slice(0, 5).split(':').map(Number);
  
  let minutosActual = hInicio * 60 + mInicio;
  const minutosFin = hFin * 60 + mFin;

  while (minutosActual < minutosFin) {
    const h = String(Math.floor(minutosActual / 60)).padStart(2, '0');
    const m = String(minutosActual % 60).padStart(2, '0');
    opciones.push(`${h}:${m}`);
    minutosActual += 30;
  }
  return opciones;
};

const ReservarTurnoScreen = ({ navigation }) => {
  const { usuario } = useAuth();

  const [mascotas, setMascotas] = useState([]);
  const [mascotaId, setMascotaId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);

  const [sedes, setSedes] = useState([]);
  const [cargandoSedes, setCargandoSedes] = useState(true);
  const [sedeId, setSedeId] = useState('');
  const [veterinarios, setVeterinarios] = useState([]);
  const [veterinarioId, setVeterinarioId] = useState('');
  const [vetSeleccionadoObj, setVetSeleccionadoObj] = useState(null);

  const [cargandoMascotas, setCargandoMascotas] = useState(true);
  const [cargandoAgenda, setCargandoAgenda] = useState(false);
  const [reservando, setReservando] = useState(false);
  const [error, setError] = useState('');
  const [modalExito, setModalExito] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await listarMascotasPorCliente(usuario.id);
        setMascotas(data.map((m) => ({ label: m.nombre, value: String(m.id) })));
      } catch (e) {
        setError('No se pudieron cargar las mascotas.');
      } finally {
        setCargandoMascotas(false);
      }
    };
    cargar();
  }, []);

  useEffect(() => {
    obtenerSedes()
      .then(setSedes)
      .catch(() => setSedes([]))
      .finally(() => setCargandoSedes(false));
  }, []);

  useEffect(() => {
    if (!sedeId) {
      setVeterinarios([]);
      setVeterinarioId('');
      setVetSeleccionadoObj(null);
      return;
    }
    setVeterinarioId('');
    setVetSeleccionadoObj(null);
    obtenerVeterinarios()
      .then((data) => {
        const deLaSede = data.filter((v) => String(v.sede?.id) === sedeId);
        setVeterinarios(deLaSede);
      })
      .catch(() => setVeterinarios([]));
  }, [sedeId]);

  const alCambiarVeterinario = (id) => {
    setVeterinarioId(id);
    if (!id) {
      setVetSeleccionadoObj(null);
      return;
    }
    const obj = veterinarios.find((v) => String(v.id) === String(id));
    if (obj) {
      setVetSeleccionadoObj({
        ...obj,
        horaInicio: obj.horaInicio ? obj.horaInicio : '09:00',
        horaFin: obj.horaFin ? obj.horaFin : '18:00'
      });
    } else {
      setVetSeleccionadoObj(null);
    }
  };

  const cargarAgenda = useCallback(async () => {
    if (!sedeId || !veterinarioId) return;
    setCargandoAgenda(true);
    try {
      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      const fechaStr = `${año}-${mes}-${dia}`;

      const vId = veterinarioId ? parseInt(veterinarioId, 10) : null;
      const reservas = await obtenerDisponibilidad(fechaStr, parseInt(sedeId, 10), vId);

      const ocupados = [];
      reservas
        .filter((r) => r.estado !== 'CANCELADO')
        .forEach((r) => {
          // 🟢 Normalización robusta extrayendo solo HH:mm del String ISO
          if (r.fechaHora && r.fechaHora.includes('T')) {
            const soloHora = r.fechaHora.split('T')[1].slice(0, 5); // Consigue "17:00" limpio
            ocupados.push(soloHora);
          }
        });

      setHorariosOcupados(ocupados);
    } catch (_) {
      setHorariosOcupados([]);
    } finally {
      setCargandoAgenda(false);
    }
  }, [fecha, sedeId, veterinarioId]);

  useEffect(() => {
    cargarAgenda();
  }, [cargarAgenda]);

  const esPasado = (horario) => {
    const ahora = new Date();
    const [h, m] = horario.split(':').map(Number);
    const turnoFecha = new Date(fecha);
    turnoFecha.setHours(h, m, 0, 0);
    return turnoFecha <= ahora;
  };

  const manejarSeleccionarHorario = (horario) => {
    if (horariosOcupados.includes(horario)) return;
    if (esPasado(horario)) {
      setError('No se pueden reservar turnos en horarios ya transcurridos.');
      return;
    }
    setError('');
    setHorarioSeleccionado(horario === horarioSeleccionado ? null : horario);
  };

  const manejarReservar = async () => {
    setError('');
    if (!mascotaId) { setError('Seleccioná una mascota.'); return; }
    if (!horarioSeleccionado) { setError('Seleccioná un horario.'); return; }

    const [h, m] = horarioSeleccionado.split(':').map(Number);
    const fechaHora = new Date(fecha);
    fechaHora.setHours(h, m, 0, 0);

    if (fechaHora <= new Date()) {
      setError('No se pueden reservar turnos en horarios ya transcurridos.');
      return;
    }

    const payloadStr = `${fechaHora.getFullYear()}-${String(fechaHora.getMonth() + 1).padStart(2, '0')}-${String(fechaHora.getDate()).padStart(2, '0')}T${String(fechaHora.getHours()).padStart(2, '0')}:${String(fechaHora.getMinutes()).padStart(2, '0')}:00`;

    setReservando(true);
    try {
      const body = {
        clienteId: usuario.id,
        mascotaId: parseInt(mascotaId, 10),
        fechaHora: payloadStr,
      };
      if (veterinarioId) body.veterinarioId = parseInt(veterinarioId, 10);

      await crearReserva(body);
      await cargarAgenda(); // Refresca los datos locales inmediatamente
      setHorarioSeleccionado(null);
      setModalExito(true);
    } catch (e) {
      setError(e.message || 'Error al reservar el turno.');
    } finally {
      setReservando(false);
    }
  };

  const horaInicioVet = vetSeleccionadoObj?.horaInicio ? vetSeleccionadoObj.horaInicio.slice(0, 5) : '09:00';
  const horaFinVet = vetSeleccionadoObj?.horaFin ? vetSeleccionadoObj.horaFin.slice(0, 5) : '18:00';

  const bloquesHorarios = generarBloquesJornada(horaInicioVet, horaFinVet);

  if (cargandoMascotas || cargandoSedes) return <CargandoPantalla oscuro />;

  return (
    <SafeAreaView style={estilos.safeArea}>
      <EncabezadoPersonalizado onVolver={() => navigation.goBack()} titulo="" estilo={estilos.encabezadoOscuro} />
      <ScrollView contentContainerStyle={estilos.scroll} keyboardShouldPersistTaps="handled">
        <Text style={estilos.titulo}>Turnos disponibles</Text>

        {sedes.length === 0 ? (
          <Text style={estilos.avisoSinSedes}>No hay sedes cargadas todavía. Comunicate con la clínica para poder reservar.</Text>
        ) : (
          <SelectorCampo placeholder="Sede" valor={sedeId} alCambiar={setSedeId} opciones={sedes.map((s) => ({ label: s.nombre, value: String(s.id) }))} estilo={{ marginBottom: SPACING.sm }} />
        )}

        {!!sedeId && (
          <SelectorCampo placeholder="Veterinario" valor={veterinarioId} alCambiar={alCambiarVeterinario} opciones={veterinarios.map((v) => ({ label: v.nombreCompleto, value: String(v.id) }))} estilo={{ marginBottom: SPACING.sm }} />
        )}

        {!!sedeId && !!veterinarioId && (
          <>
            {veterinarios.length === 0 && (
              <Text style={estilos.avisoSinVets}>Esta sede todavía no tiene veterinarios asignados; el turno se reservará sin asignar.</Text>
            )}

            <SelectorCampo placeholder="Mascota" valor={mascotaId} alCambiar={setMascotaId} opciones={mascotas} estilo={{ marginBottom: SPACING.sm }} />
            <SelectorCampo placeholder="Motivo" valor={motivo} alCambiar={setMotivo} opciones={MOTIVOS_CLIENTE} estilo={{ marginBottom: SPACING.md }} />
            <SelectorFecha valor={fecha} alCambiar={setFecha} estilo={{ marginBottom: SPACING.md }} />

            {cargandoAgenda ? (
              <View style={estilos.cargandoHorarios}><Text style={estilos.cargandoTexto}>Cargando disponibilidad...</Text></View>
            ) : (
              <>
                <View style={estilos.grilla}>
                  {bloquesHorarios.map((horario) => {
                    // 🟢 COMPROBACIÓN COMPLETAMENTE ASEGURADA: Mismo comportamiento que esPasado
                    const ocupado = horariosOcupados.includes(horario);
                    const pasado = esPasado(horario);
                    const seleccionado = horario === horarioSeleccionado;
                    
                    // Si ya pasó O si la base de datos dice que está ocupado -> Inhabilita el cuadrado
                    const noDisponible = ocupado || pasado;

                    return (
                      <TouchableOpacity
                        key={horario}
                        style={[estilos.horarioBotón, noDisponible && estilos.horarioOcupado, seleccionado && estilos.horarioSeleccionado]}
                        onPress={() => manejarSeleccionarHorario(horario)}
                        disabled={noDisponible} // 🟢 Deshabilita el botón igual que con la hora pasada
                      >
                        <Text style={[estilos.horarioTexto, noDisponible && estilos.horarioTextoOcupado, seleccionado && estilos.horarioTextoSeleccionado]}>{horario}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={estilos.leyenda}>Gris = no disponible</Text>
              </>
            )}

            {!!error && <AlertaError mensaje={error} estilo={{ marginTop: SPACING.md }} />}
            <BotonPrimario titulo="Reservar" onPress={manejarReservar} cargando={reservando} deshabilitado={!horarioSeleccionado || !mascotaId} estilo={estilos.botonReservar} />
          </>
        )}
      </ScrollView>
      <ModalExito visible={modalExito} titulo="¡Turno reservado!" textBoton="Mis Turnos" onAccion={() => { setModalExito(false); navigation.goBack(); }} />
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#143343' },
  encabezadoOscuro: { backgroundColor: '#143343' },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  titulo: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: SPACING.lg },
  avisoSinSedes: { fontSize: FONT_SIZE.sm, color: '#A3E1FC', fontStyle: 'italic', marginVertical: SPACING.sm, textAlign: 'center' },
  avisoSinVets: { fontSize: FONT_SIZE.xs, color: '#A3E1FC', fontStyle: 'italic', marginBottom: SPACING.sm },
  grilla: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'space-between' },
  horarioBotón: { width: '31%', backgroundColor: '#E3E3E3', borderRadius: 8, paddingVertical: SPACING.md, alignItems: 'center', justifyContent: 'center', minHeight: 48, marginBottom: 4 },
  horarioOcupado: { backgroundColor: '#647D8B', opacity: 0.6 },
  horarioSeleccionado: { backgroundColor: '#90C7A1' },
  horarioTexto: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: '#1F1F1F' },
  horarioTextoOcupado: { color: '#E3E3E3', fontWeight: '400' },
  horarioTextoSeleccionado: { color: '#143343', fontWeight: '800' },
  leyenda: { fontSize: FONT_SIZE.xs, color: '#9CA3AF', textAlign: 'center', marginTop: SPACING.md },
  cargandoHorarios: { paddingVertical: SPACING.xl, alignItems: 'center' },
  cargandoTexto: { fontSize: FONT_SIZE.sm, color: '#D1D5DB' },
  botonReservar: { backgroundColor: '#90C7A1', marginTop: SPACING.xl },
});

export default ReservarTurnoScreen;