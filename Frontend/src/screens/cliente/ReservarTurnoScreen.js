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
import { listarMascotasPorCliente, obtenerAgenda, crearReserva } from '../../services/api';
import {
  SelectorCampo,
  BotonPrimario,
  AlertaError,
  ModalExito,
  CargandoPantalla,
  EncabezadoPersonalizado,
} from '../../components/ui';
import {
  COLORS, FONT_SIZE, SPACING, BORDER_RADIUS, MOTIVOS, HORARIOS_DISPONIBLES,
} from '../../constants';

// Formatea una fecha como "Lun 11 May"
const formatearFecha = (fecha) => {
  return fecha.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

// Agrega días a una fecha
const addDias = (fecha, dias) => {
  const nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() + dias);
  return nueva;
};

const ReservarTurnoScreen = ({ navigation }) => {
  const { usuario } = useAuth();

  const [mascotas, setMascotas] = useState([]);
  const [mascotaId, setMascotaId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);

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

  // Cargar agenda cuando cambia la fecha
  const cargarAgenda = useCallback(async () => {
    setCargandoAgenda(true);
    setHorarioSeleccionado(null);
    try {
      const fechaStr = fecha.toISOString().split('T')[0];
      const reservas = await obtenerAgenda(fechaStr);
      
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
  }, [fecha]);

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
      await crearReserva({
        clienteId: usuario.id,
        mascotaId: parseInt(mascotaId, 10),
        fechaHora: fechaHoraLocalStr      
      });
      setModalExito(true);
    } catch (e) {
      setError(e.message || 'Error al reservar el turno.');
    } finally {
      setReservando(false);
    }
  };

  if (cargandoMascotas) return <CargandoPantalla />;

  return (
    <SafeAreaView style={estilos.safeArea}>
      <EncabezadoPersonalizado onVolver={() => navigation.goBack()} titulo="" estilo={estilos.encabezadoOscuro} />

      <ScrollView contentContainerStyle={estilos.scroll} keyboardShouldPersistTaps="handled">
        <Text style={estilos.titulo}>Turnos disponibles</Text>

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

        {/* Navegador de fecha */}
        <View style={estilos.fechaNavegador}>
          <TouchableOpacity
            onPress={() => setFecha((f) => addDias(f, -1))}
            style={estilos.fechaBoton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={estilos.fechaFlecha}>‹</Text>
          </TouchableOpacity>
          <Text style={estilos.fechaTexto}>{formatearFecha(fecha)}</Text>
          <TouchableOpacity
            onPress={() => setFecha((f) => addDias(f, 1))}
            style={estilos.fechaBoton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={estilos.fechaFlecha}>›</Text>
          </TouchableOpacity>
        </View>

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
  fechaNavegador: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E3E3E3',
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    minHeight: 52,
  },
  fechaBoton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fechaFlecha: {
    fontSize: 28,
    color: '#1F1F1F',
    fontWeight: '400',
  },
  fechaTexto: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#1F1F1F',
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