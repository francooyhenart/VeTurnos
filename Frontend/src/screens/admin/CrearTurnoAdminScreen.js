import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import api, {
  buscarClientes,
  listarMascotasPorCliente,
  obtenerVeterinarios,
} from '../../services/api';
import {
  SelectorCampo,
  BotonPrimario,
  AlertaError,
  ModalExito,
} from '../../components/ui';
import { FONT_SIZE, SPACING, MOTIVOS, HORARIOS_DISPONIBLES } from '../../constants';

const DURACIONES_CIRUGIA = [
  { label: '1 Hora (2 bloques)', value: '60' },
  { label: '1 hora y media (3 bloques)', value: '90' },
  { label: '2 Horas (4 bloques)', value: '120' },
  { label: '3 Horas (6 bloques)', value: '180' },
  { label: '4 Horas (8 bloques)', value: '240' },
];

const CrearTurnoAdminScreen = ({ navigation }) => {
  // Búsqueda de cliente
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Mascotas del cliente
  const [mascotas, setMascotas] = useState([]);
  const [mascotaId, setMascotaId] = useState('');

  // Veterinarios
  const [veterinarios, setVeterinarios] = useState([]);
  const [veterinarioId, setVeterinarioId] = useState('');

  // Turno
  const [motivo, setMotivo] = useState('Consulta');
  const [horario, setHorario] = useState('09:00');
  const [duracionMinutos, setDuracionMinutos] = useState('120');
  const [fechaStr, setFechaStr] = useState(new Date().toISOString().split('T')[0]);

  // UI
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [modalExito, setModalExito] = useState(false);

  // Cargar lista de vets al montar
  useEffect(() => {
    obtenerVeterinarios()
      .then(setVeterinarios)
      .catch(() => {});
  }, []);

  // Buscar clientes con debounce
  useEffect(() => {
    if (busqueda.trim().length < 2) {
      setResultados([]);
      return;
    }
    const timer = setTimeout(async () => {
      setBuscando(true);
      try {
        const data = await buscarClientes(busqueda.trim());
        setResultados(data);
      } catch {
        setResultados([]);
      } finally {
        setBuscando(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const seleccionarCliente = useCallback(async (cliente) => {
    setClienteSeleccionado(cliente);
    setResultados([]);
    setBusqueda('');
    setMascotaId('');
    setMascotas([]);
    try {
      const data = await listarMascotasPorCliente(cliente.id);
      setMascotas(data);
      if (data.length === 1) setMascotaId(String(data[0].id));
    } catch {
      setMascotas([]);
    }
  }, []);

  const limpiarCliente = useCallback(() => {
    setClienteSeleccionado(null);
    setMascotas([]);
    setMascotaId('');
  }, []);

  const guardarTurno = async () => {
    setError('');
    if (!clienteSeleccionado) {
      setError('Buscá y seleccioná un cliente.');
      return;
    }
    if (!mascotaId) {
      setError('Seleccioná una mascota del cliente.');
      return;
    }

    setCargando(true);
    const duracionTotal = motivo === 'Cirugia' ? parseInt(duracionMinutos, 10) : 30;
    const [h, m] = horario.split(':').map(Number);
    const fechaBase = new Date(`${fechaStr}T00:00:00`);
    fechaBase.setHours(h, m, 0, 0);

    const pad = (n) => String(n).padStart(2, '0');
    const isoLocal = `${fechaBase.getFullYear()}-${pad(fechaBase.getMonth() + 1)}-${pad(fechaBase.getDate())}T${pad(fechaBase.getHours())}:${pad(fechaBase.getMinutes())}:00`;

    try {
      const body = {
        clienteId: clienteSeleccionado.id,
        mascotaId: parseInt(mascotaId, 10),
        fechaHora: isoLocal,
        duracionMinutos: duracionTotal,
      };
      if (veterinarioId) body.veterinarioId = parseInt(veterinarioId, 10);

      await api.post('/reservas', body);
      setModalExito(true);
    } catch (e) {
      setError(e.message || 'Ocurrió un error al guardar el turno.');
    } finally {
      setCargando(false);
    }
  };

  const opcionesMascotas = mascotas.map((m) => ({ label: m.nombre, value: String(m.id) }));
  const opcionesVets = [
    { label: 'Sin asignar', value: '' },
    ...veterinarios.map((v) => ({ label: v.nombreCompleto, value: String(v.id) })),
  ];

  return (
    <SafeAreaView style={estilos.safeArea}>
      {/* Encabezado */}
      <View style={estilos.encabezado}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={estilos.flechaTexto}>←</Text>
        </TouchableOpacity>
        <Text style={estilos.tituloEncabezado}>Cargar Turno</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={estilos.scroll} keyboardShouldPersistTaps="handled">

        {/* ── Sección Cliente ── */}
        <Text style={estilos.seccionLabel}>Cliente</Text>

        {clienteSeleccionado ? (
          <View style={estilos.clienteSeleccionado}>
            <View style={estilos.clienteInfo}>
              <Text style={estilos.clienteNombre}>{clienteSeleccionado.nombreCompleto}</Text>
              <Text style={estilos.clienteDni}>DNI: {clienteSeleccionado.dni}</Text>
            </View>
            <TouchableOpacity onPress={limpiarCliente} style={estilos.botonCambiar}>
              <Text style={estilos.botonCambiarTexto}>Cambiar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TextInput
              style={estilos.buscador}
              placeholder="Buscar por nombre o DNI..."
              placeholderTextColor="#999"
              value={busqueda}
              onChangeText={setBusqueda}
            />
            {buscando && (
              <Text style={estilos.buscandoTexto}>Buscando...</Text>
            )}
            {resultados.length > 0 && (
              <View style={estilos.resultados}>
                {resultados.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={estilos.itemResultado}
                    onPress={() => seleccionarCliente(c)}
                  >
                    <Text style={estilos.resultadoNombre}>{c.nombreCompleto}</Text>
                    <Text style={estilos.resultadoDni}>DNI: {c.dni}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {busqueda.trim().length >= 2 && !buscando && resultados.length === 0 && (
              <Text style={estilos.sinResultados}>Sin resultados para "{busqueda}"</Text>
            )}
          </>
        )}

        {/* ── Sección Mascota ── */}
        {clienteSeleccionado && (
          <>
            <Text style={estilos.seccionLabel}>Mascota</Text>
            {mascotas.length === 0 ? (
              <Text style={estilos.sinResultados}>Este cliente no tiene mascotas registradas.</Text>
            ) : (
              <SelectorCampo
                placeholder="Seleccioná la mascota"
                valor={mascotaId}
                alCambiar={setMascotaId}
                opciones={opcionesMascotas}
                estilo={{ marginBottom: SPACING.sm }}
              />
            )}
          </>
        )}

        {/* ── Sección Turno ── */}
        <Text style={estilos.seccionLabel}>Turno</Text>

        <TextInput
          style={estilos.input}
          placeholder="Fecha (YYYY-MM-DD)"
          placeholderTextColor="#999"
          value={fechaStr}
          onChangeText={setFechaStr}
        />

        <SelectorCampo
          placeholder="Motivo del Turno"
          valor={motivo}
          alCambiar={setMotivo}
          opciones={MOTIVOS}
          estilo={{ marginBottom: SPACING.sm }}
        />

        {motivo === 'Cirugia' && (
          <SelectorCampo
            placeholder="Duración estimada"
            valor={duracionMinutos}
            alCambiar={setDuracionMinutos}
            opciones={DURACIONES_CIRUGIA}
            estilo={{ marginBottom: SPACING.sm }}
          />
        )}

        <SelectorCampo
          placeholder="Horario de Inicio"
          valor={horario}
          alCambiar={setHorario}
          opciones={HORARIOS_DISPONIBLES.map((h) => ({ label: h, value: h }))}
          estilo={{ marginBottom: SPACING.sm }}
        />

        {/* ── Sección Veterinario (opcional) ── */}
        <Text style={estilos.seccionLabel}>Veterinario (opcional)</Text>
        <SelectorCampo
          placeholder="Asignar veterinario"
          valor={veterinarioId}
          alCambiar={setVeterinarioId}
          opciones={opcionesVets}
          estilo={{ marginBottom: SPACING.md }}
        />

        {!!error && <AlertaError mensaje={error} estilo={{ marginTop: SPACING.sm }} />}

        <BotonPrimario
          titulo={motivo === 'Cirugia' ? 'Bloquear Quirófano' : 'Agendar Turno'}
          onPress={guardarTurno}
          cargando={cargando}
          estilo={estilos.botonAgendar}
        />
      </ScrollView>

      <ModalExito
        visible={modalExito}
        titulo="¡Turno cargado con éxito!"
        textBoton="Volver a la Agenda"
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
  input: {
    backgroundColor: '#E3E3E3',
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZE.sm,
    color: '#1F1F1F',
    marginBottom: SPACING.sm,
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
  clienteSeleccionado: {
    backgroundColor: '#90C7A1',
    borderRadius: 8,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNombre: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#143343',
  },
  clienteDni: {
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

export default CrearTurnoAdminScreen;
