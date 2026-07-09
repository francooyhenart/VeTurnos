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
import {
  COLORS, FONT_SIZE, SPACING, BORDER_RADIUS, MOTIVOS, HORARIOS_DISPONIBLES,
} from '../../constants';

const ReservarTurnoScreen = ({ navigation }) => {
  const { usuario } = useAuth();

  const [mascotas, setMascotas] = useState([]);
  const [mascotaId, setMascotaId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);

  // Punto 3: la Sede es el primer paso; recién con ella elegida se cargan
  // los veterinarios disponibles en esa sede.
  const [sedes, setSedes] = useState([]);
  const [cargandoSedes, setCargandoSedes] = useState(true);
  const [sedeId, setSedeId] = useState('');
  const [veterinarios, setVeterinarios] = useState([]);
  const [veterinarioId, setVeterinarioId] = useState('');

  const [cargandoMascotas, setCargandoMascotas] = useState(true);
  const [cargandoAgenda, setCargandoAgenda] = useState(false);
  const [reservando, setReservando] = useState(false);
  const [error, setError] = useState('');
  const [modalExito, setModalExito] = useState(false);

  // Cargar mascotas al montar
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

  // Cargar sedes al montar
  useEffect(() => {
    obtenerSedes()
      .then(setSedes)
      .catch(() => setSedes([]))
      .finally(() => setCargandoSedes(false));
  }, []);

  // Al elegir sede, cargar solo los veterinarios que pertenecen a ella
  useEffect(() => {
    if (!sedeId) {
      setVeterinarios([]);
      setVeterinarioId('');
      return;
    }
    setVeterinarioId('');
    obtenerVeterinarios()
      .then((data) => {
        const deLaSede = data.filter((v) => String(v.sede?.id) === sedeId);
        setVeterinarios(deLaSede);
      })
      .catch(() => setVeterinarios([]));
  }, [sedeId]);

  // Cargar disponibilidad cuando cambia la fecha o la sede
  const cargarAgenda = useCallback(async () => {
    if (!sedeId) return;
    setCargandoAgenda(true);
    setHorarioSeleccionado(null);
    try {
      const fechaStr = fecha.toISOString().split('T')[0];
      const reservas = await obtenerDisponibilidad(fechaStr, parseInt(sedeId, 10));

      const ocupados = [];

      reservas
        .filter((r) => r.estado !== 'CANCELADO')
        .forEach((r) => {
          const inicio = new Date(r.fechaHora);
          const duracion = r.duracionMinutos || 30;

          let tiempoActual = new Date(inicio.getTime());
          const fin = new Date(inicio.getTime() + duracion * 60000);

          while (tiempoActual < fin) {
            const hStr = String(tiempoActual.getHours()).padStart(2, '0');
            const mStr = String(tiempoActual.getMinutes()).padStart(2, '0');
            ocupados.push(`${hStr}:${mStr}`);

            tiempoActual.setMinutes(tiempoActual.getMinutes() + 30);
          }
        });

      setHorariosOcupados(ocupados);
    } catch (_) {
      setHorariosOcupados([]);
    } finally {
      setCargandoAgenda(false);
    }
  }, [fecha, sedeId]);

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

    const anio = fechaHora.getFullYear();
    const mes = String(fechaHora.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaHora.getDate()).padStart(2, '0');
    const horas = String(fechaHora.getHours()).padStart(2, '0');
    const minutos = String(fechaHora.getMinutes()).padStart(2, '0');
    const segundos = '00';

    const fechaHoraLocalStr = `${anio}-${mes}-${dia}T${horas}:${minutos}:${segundos}`;

    setReservando(true);
    try {
      const body = {
        clienteId: usuario.id,
        mascotaId: parseInt(mascotaId, 10),
        fechaHora: fechaHoraLocalStr,
      };
      if (veterinarioId) body.veterinarioId = parseInt(veterinarioId, 10);

      await crearReserva(body);
      setModalExito(true);
    } catch (e) {
      setError(e.message || 'Error al reservar el turno.');
    } finally {
      setReservando(false);
    }
  };

  if (cargandoMascotas || cargandoSedes) return <CargandoPantalla oscuro />;

  return (
    <SafeAreaView style={estilos.safeArea}>
      <EncabezadoPersonalizado onVolver={() => navigation.goBack()} titulo="" estilo={estilos.encabezadoOscuro} />

      <ScrollView contentContainerStyle={estilos.scroll} keyboardShouldPersistTaps="handled">
        <Text style={estilos.titulo}>Turnos disponibles</Text>

        {/* Punto 3: primer paso obligatorio, elegir Sede */}
        {sedes.length === 0 ? (
          <Text style={estilos.avisoSinSedes}>
            No hay sedes cargadas todavía. Comunicate con la clínica para poder reservar.
          </Text>
        ) : (
          <SelectorCampo
            placeholder="Sede"
            valor={sedeId}
            alCambiar={setSedeId}
            opciones={sedes.map((s) => ({ label: s.nombre, value: String(s.id) }))}
            estilo={{ marginBottom: SPACING.sm }}
          />
        )}

        {!!sedeId && (
          <>
            {/* Selector de veterinario, ya filtrado por la sede elegida */}
            <SelectorCampo
              placeholder="Veterinario (Opcional)"
              valor={veterinarioId}
              alCambiar={setVeterinarioId}
              opciones={veterinarios.map((v) => ({ label: v.nombreCompleto, value: String(v.id) }))}
              estilo={{ marginBottom: SPACING.sm }}
            />
            {veterinarios.length === 0 && (
              <Text style={estilos.avisoSinVets}>
                Esta sede todavía no tiene veterinarios asignados; el turno se reservará sin asignar.
              </Text>
            )}

            {/* Selector de mascota */}
            <SelectorCampo
              placeholder="Mascota"
              valor={mascotaId}
              alCambiar={setMascotaId}
              opciones={mascotas}
              estilo={{ marginBottom: SPACING.sm }}
            />

            {/* Selector de motivo */}
            <SelectorCampo
              placeholder="Motivo"
              valor={motivo}
              alCambiar={setMotivo}
              opciones={MOTIVOS}
              estilo={{ marginBottom: SPACING.md }}
            />

            {/* Punto 5: selector de fecha con calendario propio */}
            <SelectorFecha
              valor={fecha}
              alCambiar={setFecha}
              estilo={{ marginBottom: SPACING.md }}
            />

            {/* Grilla de horarios */}
            {cargandoAgenda ? (
              <View style={estilos.cargandoHorarios}>
                <Text style={estilos.cargandoTexto}>Cargando disponibilidad...</Text>
              </View>
            ) : (
              <>
                <View style={estilos.grilla}>
                  {HORARIOS_DISPONIBLES.map((horario) => {
                    const ocupado = horariosOcupados.includes(horario);
                    const pasado = esPasado(horario);
                    const seleccionado = horario === horarioSeleccionado;
                    const noDisponible = ocupado || pasado;

                    return (
                      <TouchableOpacity
                        key={horario}
                        style={[
                          estilos.horarioBotón,
                          noDisponible && estilos.horarioOcupado,
                          seleccionado && estilos.horarioSeleccionado,
                        ]}
                        onPress={() => manejarSeleccionarHorario(horario)}
                        disabled={noDisponible}
                        accessibilityLabel={`Horario ${horario}${noDisponible ? ', no disponible' : ''}`}
                      >
                        <Text
                          style={[
                            estilos.horarioTexto,
                            noDisponible && estilos.horarioTextoOcupado,
                            seleccionado && estilos.horarioTextoSeleccionado,
                          ]}
                        >
                          {horario}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={estilos.leyenda}>Gris = no disponible</Text>
              </>
            )}

            {!!error && <AlertaError mensaje={error} estilo={{ marginTop: SPACING.md }} />}

            {/* Botón Reservar */}
            <BotonPrimario
              titulo="Reservar"
              onPress={manejarReservar}
              cargando={reservando}
              deshabilitado={!horarioSeleccionado || !mascotaId}
              estilo={estilos.botonReservar}
            />
          </>
        )}
      </ScrollView>

      {/* Modal de éxito */}
      <ModalExito
        visible={modalExito}
        titulo="¡Turno reservado!"
        textBoton="Mis Turnos"
        onAccion={() => {
          setModalExito(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
};

// ════════════════════════════════════════════
//  ESTILOS GENERALES ADAPTADOS AL MODO OSCURO
// ════════════════════════════════════════════
const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#143343',
  },
  encabezadoOscuro: {
    backgroundColor: '#143343',
  },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  titulo: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  avisoSinSedes: {
    fontSize: FONT_SIZE.sm,
    color: '#A3E1FC',
    fontStyle: 'italic',
    marginVertical: SPACING.sm,
    textAlign: 'center',
  },
  avisoSinVets: {
    fontSize: FONT_SIZE.xs,
    color: '#A3E1FC',
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  grilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  horarioBotón: {
    width: '31%',
    backgroundColor: '#E3E3E3',
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginBottom: 4,
  },
  horarioOcupado: {
    backgroundColor: '#647D8B',
    opacity: 0.6,
  },
  horarioSeleccionado: {
    backgroundColor: '#90C7A1',
  },
  horarioTexto: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  horarioTextoOcupado: {
    color: '#E3E3E3',
    fontWeight: '400',
  },
  horarioTextoSeleccionado: {
    color: '#143343',
    fontWeight: '800',
  },
  leyenda: {
    fontSize: FONT_SIZE.xs,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  cargandoHorarios: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  cargandoTexto: {
    fontSize: FONT_SIZE.sm,
    color: '#D1D5DB',
  },
  botonReservar: {
    backgroundColor: '#90C7A1',
    marginTop: SPACING.xl,
  },
});

export default ReservarTurnoScreen;
