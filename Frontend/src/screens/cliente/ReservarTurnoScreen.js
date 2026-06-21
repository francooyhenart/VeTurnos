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
// 🚀 E2: Agregamos listarVeterinarios para la grilla de profesionales independientes
import { listarMascotasPorCliente, obtenerAgenda, crearReserva, listarVeterinarios } from '../../services/api';
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

const formatearFecha = (fecha) => {
  return fecha.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

const addDias = (fecha, dias) => {
  const nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() + dias);
  return nueva;
};

const ReservarTurnoScreen = ({ navigation }) => {
  const { usuario } = useAuth();

  const [mascotas, setMascotas] = useState([]);
  const [mascotaId, setMascotaId] = useState('');
  const [veterinarios, setVeterinarios] = useState([]); // 🚀 E2: Estado para la cartilla médica
  const [veterinarioId, setVeterinarioId] = useState(''); // 🚀 E2: Profesional seleccionado
  const [motivo, setMotivo] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);

  const [cargandoInicial, setCargandoInicial] = useState(true); // 🚀 Combinamos estados de carga de catálogo
  const [cargandoAgenda, setCargandoAgenda] = useState(false);
  const [reservando, setReservando] = useState(false);
  const [error, setError] = useState('');
  const [modalExito, setModalExito] = useState(false);

  // 🚀 E2: Cargar Catálogos Iniciales (Mascotas y Veterinarios)
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [dataMascotas, dataVeterinarios] = await Promise.all([
          listarMascotasPorCliente(usuario.id),
          listarVeterinarios()
        ]);
        
        setMascotas(dataMascotas.map((m) => ({ label: m.nombre, value: String(m.id) })));
        
        // Formateamos mostrando nombre y especialidad médica para la US-06
        setVeterinarios(dataVeterinarios.map((v) => ({ 
          label: `${v.nombre} (${v.especialidad ? v.especialidad : 'General'})`, 
          value: String(v.id) 
        })));
      } catch (e) {
        setError('No se pudieron cargar los datos iniciales.');
      } finally {
        setCargandoInicial(false);
      }
    };
    cargarCatalogos();
  }, [usuario.id]);

  // 🚀 E2: Cargar agenda filtrando obligatoriamente por Fecha y por Veterinario ID
  const cargarAgenda = useCallback(async () => {
    if (!veterinarioId) {
      setHorariosOcupados([]);
      return;
    }
    
    setCargandoAgenda(true);
    setHorarioSeleccionado(null);
    try {
      const fechaStr = fecha.toISOString().split('T')[0];
      // Pasamos el veterinarioId para la consulta en la base de datos relacional
      const reservas = await obtenerAgenda(fechaStr, veterinarioId);
      
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
  }, [fecha, veterinarioId]);

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
    if (!veterinarioId) {
      setError('Por favor, seleccioná primero un profesional médico.');
      return;
    }
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
    if (!veterinarioId) { setError('Seleccioná un veterinario.'); return; }
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
      // 🚀 E2: Enviamos el veterinarioId para persistir la clave foránea en Spring Boot
      await crearReserva({
        clienteId: usuario.id,
        veterinarioId: parseInt(veterinarioId, 10),
        mascotaId: parseInt(mascotaId, 10),
        motivo: motivo || 'CONSULTA_GENERAL',
        fechaHora: fechaHoraLocalStr      
      });
      setModalExito(true);
    } catch (e) {
      setError(e.message || 'Error al reservar el turno.');
    } finally {
      setReservando(false);
    }
  };

  if (cargandoInicial) return <CargandoPantalla />;

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

        {/* 🚀 E2: Nuevo Selector de Profesional Técnico (US-06) */}
        <SelectorCampo
          placeholder="Seleccionar Profesional"
          valor={veterinarioId}
          alCambiar={setVeterinarioId}
          opciones={veterinarios}
          estilo={{ marginBottom: SPACING.sm }}
        />

        {/* Selector de motivo */}
        <SelectorCampo
          placeholder="Motivo de consulta"
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

        {/* Grilla de horarios dinámicos */}
        {!veterinarioId ? (
          <View style={estilos.cargandoHorarios}>
            <Text style={estilos.cargandoTexto}>Elegí un profesional para ver sus turnos.</Text>
          </View>
        ) : cargandoAgenda ? (
          <View style={estilos.cargandoHorarios}>
            <Text style={estilos.cargandoTexto}>Cargando disponibilidad...</Text>
          </View>
        ) : (
          <>
            <View style={estilos.grilla}>
              {HORARIOS_DISPONIBLES.map((horario) => {
                const ocupado = horariosOcupados.includes(horario);
                const pasado = esPasado(horario);
                const seleccionado =  horario === horarioSeleccionado;
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
          deshabilitado={!horarioSeleccionado || !mascotaId || !veterinarioId}
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
    textAlign: 'center',
  },
  botonReservar: {
    backgroundColor: '#90C7A1',
    marginTop: SPACING.xl,
  },
});

export default ReservarTurnoScreen;