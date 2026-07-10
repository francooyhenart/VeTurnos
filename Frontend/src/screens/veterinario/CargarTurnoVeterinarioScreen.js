// CargarTurnoVeterinarioScreen.js - Alta de turno propio del Veterinario (Punto 10)
// La Sede y el Veterinario NO se eligen acá: se infieren del usuario logueado
// (veterinarioId = usuario.id; sedeId se busca en su propia ficha de
// veterinario) y viajan siempre así en el payload, nunca como campos editables.
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import {
  buscarMascotas,
  crearReserva,
  obtenerVeterinarios,
  obtenerDisponibilidad,
} from '../../services/api';
import {
  SelectorCampo,
  SelectorFecha,
  BotonPrimario,
  AlertaError,
  ModalExito,
} from '../../components/ui';
import { FONT_SIZE, SPACING, MOTIVOS, HORARIOS_DISPONIBLES } from '../../constants';

const esPasado = (horario, fecha) => {
  const ahora = new Date();
  const [h, m] = horario.split(':').map(Number);
  const turnoFecha = new Date(fecha);
  turnoFecha.setHours(h, m, 0, 0);
  return turnoFecha <= ahora;
};

// Punto 2: duración configurable del turno del veterinario, para poder
// bloquear varios bloques de 30 min consecutivos (ej. una cirugía de 2hs).
const DURACIONES_TURNO = [
  { label: '30 min', value: 30 },
  { label: '60 min (1 hora)', value: 60 },
  { label: '90 min', value: 90 },
  { label: '120 min (2 horas)', value: 120 },
];

const CargarTurnoVeterinarioScreen = ({ navigation }) => {
  const { usuario } = useAuth();

  // sedeId del propio veterinario logueado (se infiere, no se elige)
  const [sedeId, setSedeId] = useState(undefined); // undefined = todavía cargando
  const [cargandoSede, setCargandoSede] = useState(true);

  // Búsqueda de paciente (mascota + dueño en un solo paso)
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);

  // Turno
  const [motivo, setMotivo] = useState('Consulta');
  const [duracion, setDuracion] = useState(30);
  const [horario, setHorario] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [modalExito, setModalExito] = useState(false);

  // El vet no elige su Sede: se infiere buscando su propia ficha en el
  // listado de veterinarios (el endpoint por-id está restringido a gestor).
  useEffect(() => {
    obtenerVeterinarios()
      .then((data) => {
        const yo = data.find((v) => v.id === usuario.id);
        setSedeId(yo?.sede?.id ?? null);
      })
      .catch(() => setSedeId(null))
      .finally(() => setCargandoSede(false));
  }, [usuario.id]);

  // Al elegir fecha o duración (con la sede ya resuelta), se consulta la
  // disponibilidad real —mismo endpoint que usa el cliente— y el selector de
  // horario se puebla solo con los inicios que tienen TODOS los bloques de
  // 30 min necesarios para la duración elegida libres y consecutivos.
  // Nota: esta reconstrucción por índice asume que HORARIOS_DISPONIBLES es
  // una grilla contigua de bloques de 30 min sin huecos (ej. sin pausa de
  // almuerzo en el medio); si la grilla tuviera huecos habría que comparar
  // por horario real en vez de por índice consecutivo.
  const cargarHorariosDisponibles = useCallback(async () => {
    if (!sedeId) return;
    setCargandoHorarios(true);
    try {
      const fechaStr = fecha.toISOString().split('T')[0];
      const reservas = await obtenerDisponibilidad(fechaStr, sedeId);

      const ocupados = new Set();
      reservas
        // Solo cuentan como "ocupado" los turnos de la agenda de ESTE
        // veterinario en particular: obtenerDisponibilidad devuelve todos
        // los turnos de la sede (de cualquier profesional), así que sin
        // este filtro se bloqueaban horarios que en realidad estaban
        // libres para este vet (colisión con la agenda de un colega).
        .filter((r) => r.estado !== 'CANCELADO' && r.veterinarioId === usuario.id)
        .forEach((r) => {
          const inicio = new Date(r.fechaHora);
          const duracionReserva = r.duracionMinutos || 30;
          const fin = new Date(inicio.getTime() + duracionReserva * 60000);

          let tiempoActual = new Date(inicio.getTime());
          while (tiempoActual < fin) {
            const hStr = String(tiempoActual.getHours()).padStart(2, '0');
            const mStr = String(tiempoActual.getMinutes()).padStart(2, '0');
            ocupados.add(`${hStr}:${mStr}`);
            tiempoActual.setMinutes(tiempoActual.getMinutes() + 30);
          }
        });

      // Punto 2 (Multibloque): un horario de inicio solo es válido si desde
      // ahí hay suficientes bloques consecutivos libres para cubrir la
      // duración elegida, sin salirse de la grilla del día.
      const bloquesNecesarios = Math.max(1, Math.round(duracion / 30));

      const libres = HORARIOS_DISPONIBLES.filter((horarioInicio, index) => {
        if (esPasado(horarioInicio, fecha)) return false;
        if (index + bloquesNecesarios > HORARIOS_DISPONIBLES.length) return false;

        for (let i = 0; i < bloquesNecesarios; i++) {
          if (ocupados.has(HORARIOS_DISPONIBLES[index + i])) return false;
        }
        return true;
      });

      setHorariosDisponibles(libres);
      // Si el horario que tenía elegido dejó de estar libre para la nueva
      // duración (o cambió la fecha), lo deselecciona.
      setHorario((actual) => (libres.includes(actual) ? actual : ''));
    } catch {
      setHorariosDisponibles([]);
    } finally {
      setCargandoHorarios(false);
    }
  }, [fecha, sedeId, usuario.id, duracion]);

  useEffect(() => {
    cargarHorariosDisponibles();
  }, [cargarHorariosDisponibles]);

  // Buscar mascotas con debounce (mismo endpoint que Buscador de Historiales)
  useEffect(() => {
    if (busqueda.trim().length < 2) {
      setResultados([]);
      return;
    }
    const timer = setTimeout(async () => {
      setBuscando(true);
      try {
        const data = await buscarMascotas(busqueda.trim());
        setResultados(data);
      } catch {
        setResultados([]);
      } finally {
        setBuscando(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const seleccionarMascota = (mascota) => {
    setMascotaSeleccionada(mascota);
    setResultados([]);
    setBusqueda('');
  };

  const limpiarMascota = () => setMascotaSeleccionada(null);

  const guardarTurno = async () => {
    setError('');
    if (!sedeId) {
      setError('No tenés una sede asignada. Pedile al gestor que te asigne una para poder programar turnos.');
      return;
    }
    if (!mascotaSeleccionada) {
      setError('Buscá y seleccioná un paciente.');
      return;
    }
    if (!horario) {
      setError('Seleccioná un horario disponible.');
      return;
    }

    const [h, m] = horario.split(':').map(Number);
    const fechaHora = new Date(fecha);
    fechaHora.setHours(h, m, 0, 0);

    if (fechaHora <= new Date()) {
      setError('No se pueden programar turnos en horarios ya transcurridos.');
      return;
    }

    const pad = (n) => String(n).padStart(2, '0');
    const isoLocal = `${fechaHora.getFullYear()}-${pad(fechaHora.getMonth() + 1)}-${pad(fechaHora.getDate())}T${pad(fechaHora.getHours())}:${pad(fechaHora.getMinutes())}:00`;

    setCargando(true);
    try {
      await crearReserva({
        clienteId: mascotaSeleccionada.clienteId,
        mascotaId: mascotaSeleccionada.id,
        fechaHora: isoLocal,
        // Punto 2: cantidad de bloques de 30' que debe reservar (30/60/90/120).
        duracionMinutos: duracion,
        // El backend igual fuerza este valor a partir del JWT (ver
        // ReservaController.crearReserva), pero lo mandamos explícitamente
        // para que el payload no dependa silenciosamente de esa sobreescritura.
        veterinarioId: usuario.id,
      });
      setModalExito(true);
    } catch (e) {
      setError(e.message || 'Ocurrió un error al programar el turno.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={estilos.safeArea}>
      <View style={estilos.encabezado}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={estilos.flechaTexto}>←</Text>
        </TouchableOpacity>
        <Text style={estilos.tituloEncabezado}>Programar Turno</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={estilos.scroll} keyboardShouldPersistTaps="handled">
        {/* ── Sección Paciente ── */}
        <Text style={estilos.seccionLabel}>Paciente</Text>

        {mascotaSeleccionada ? (
          <View style={estilos.mascotaSeleccionada}>
            <View style={estilos.mascotaInfo}>
              <Text style={estilos.mascotaNombre}>{mascotaSeleccionada.nombre}</Text>
              <Text style={estilos.mascotaDueño}>
                👤 {mascotaSeleccionada.nombreDueño} · DNI {mascotaSeleccionada.dniDueño}
              </Text>
            </View>
            <TouchableOpacity onPress={limpiarMascota} style={estilos.botonCambiar}>
              <Text style={estilos.botonCambiarTexto}>Cambiar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TextInput
              style={estilos.buscador}
              placeholder="Buscar por nombre de mascota o DNI del dueño..."
              placeholderTextColor="#999"
              value={busqueda}
              onChangeText={setBusqueda}
            />
            {buscando && <Text style={estilos.buscandoTexto}>Buscando...</Text>}
            {resultados.length > 0 && (
              <View style={estilos.resultados}>
                {resultados.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={estilos.itemResultado}
                    onPress={() => seleccionarMascota(m)}
                  >
                    <Text style={estilos.resultadoNombre}>{m.nombre}</Text>
                    <Text style={estilos.resultadoDni}>
                      👤 {m.nombreDueño} · DNI {m.dniDueño}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {busqueda.trim().length >= 2 && !buscando && resultados.length === 0 && (
              <Text style={estilos.sinResultados}>Sin resultados para "{busqueda}"</Text>
            )}
          </>
        )}

        {/* ── Sección Turno ── */}
        <Text style={estilos.seccionLabel}>Turno</Text>

        {!cargandoSede && !sedeId ? (
          <Text style={estilos.avisoSinSede}>
            No tenés una sede asignada. Pedile al gestor que te asigne una para poder programar turnos.
          </Text>
        ) : (
          <>
            <SelectorFecha
              valor={fecha}
              alCambiar={setFecha}
              estilo={{ marginBottom: SPACING.sm }}
            />

            <SelectorCampo
              placeholder="Motivo del Turno"
              valor={motivo}
              alCambiar={setMotivo}
              opciones={MOTIVOS}
              estilo={{ marginBottom: SPACING.sm }}
            />

            {/* Punto 2: duración del turno, para reservar múltiples bloques
                consecutivos (ej. cirugías) sin que se superpongan con otra
                cita del mismo veterinario. */}
            <SelectorCampo
              placeholder="Duración del Turno"
              valor={duracion}
              alCambiar={setDuracion}
              opciones={DURACIONES_TURNO}
              estilo={{ marginBottom: SPACING.sm }}
            />

            {cargandoHorarios ? (
              <Text style={estilos.buscandoTexto}>Buscando horarios disponibles...</Text>
            ) : horariosDisponibles.length === 0 ? (
              <Text style={estilos.sinResultados}>No hay horarios disponibles para esta fecha y duración</Text>
            ) : (
              <SelectorCampo
                placeholder="Horario de Inicio"
                valor={horario}
                alCambiar={setHorario}
                opciones={horariosDisponibles.map((h) => ({ label: h, value: h }))}
                estilo={{ marginBottom: SPACING.md }}
              />
            )}
          </>
        )}

        {!!error && <AlertaError mensaje={error} estilo={{ marginTop: SPACING.sm }} />}

        <BotonPrimario
          titulo="Programar Turno"
          onPress={guardarTurno}
          cargando={cargando}
          deshabilitado={!sedeId || !horario || !mascotaSeleccionada}
          estilo={estilos.botonAgendar}
        />
      </ScrollView>

      <ModalExito
        visible={modalExito}
        titulo="¡Turno programado con éxito!"
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
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.lg,
  },
  flechaTexto: {
    fontSize: FONT_SIZE.xl,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tituloEncabezado: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  avisoSinSede: {
    fontSize: FONT_SIZE.sm,
    color: '#FCA5A5',
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  seccionLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: '#A3E1FC',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buscador: {
    backgroundColor: '#E3E3E3',
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZE.sm,
    color: '#1F1F1F',
    marginBottom: SPACING.xs,
  },
  buscandoTexto: {
    fontSize: FONT_SIZE.sm,
    color: '#A3E1FC',
    marginBottom: SPACING.xs,
  },
  sinResultados: {
    fontSize: FONT_SIZE.sm,
    color: '#A3E1FC',
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  resultados: {
    backgroundColor: '#E3E3E3',
    borderRadius: 8,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  itemResultado: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#D0D0D0',
  },
  resultadoNombre: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: '#143343',
  },
  resultadoDni: {
    fontSize: FONT_SIZE.sm - 1,
    color: '#555',
    marginTop: 2,
  },
  mascotaSeleccionada: {
    backgroundColor: '#90C7A1',
    borderRadius: 8,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  mascotaInfo: {
    flex: 1,
  },
  mascotaNombre: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#143343',
  },
  mascotaDueño: {
    fontSize: FONT_SIZE.sm,
    color: '#1F1F1F',
    marginTop: 2,
  },
  botonCambiar: {
    backgroundColor: '#143343',
    borderRadius: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  botonCambiarTexto: {
    fontSize: FONT_SIZE.sm,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  botonAgendar: {
    backgroundColor: '#90C7A1',
    marginTop: SPACING.lg,
  },
});

export default CargarTurnoVeterinarioScreen;