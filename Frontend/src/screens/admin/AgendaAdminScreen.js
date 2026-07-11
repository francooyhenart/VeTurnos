import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import {
  obtenerAgenda,
  registrarAsistencia,
  actualizarObservaciones,
  obtenerSedes,
} from '../../services/api';
import { ROLES } from '../../constants';
import {
  CargandoPantalla,
  EstadoVacio,
  AlertaError,
  BotonPrimario,
  BotonSecundario,
  CampoTexto,
  SelectorCampo,
  SelectorFecha,
  ModalFormulario,
} from '../../components/ui';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants';

// Calculates the time range using the duration provided by the backend
const formatearHoraRango = (fechaHoraStr, duracionMinutos = 30) => {
  if (!fechaHoraStr) return '';
  const inicio = new Date(fechaHoraStr);
  const fin = new Date(inicio.getTime() + (duracionMinutos || 30) * 60000);

  const formato = (d) => d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `De ${formato(inicio)} a ${formato(fin)}`;
};

const badgeConfig = {
  PENDIENTE: { color: '#E3E3E3', textColor: '#143343', label: 'Pendiente' },
  ASISTIDO:  { color: '#90C7A1', textColor: '#143343', label: 'Asistido' },
  COMPLETADO:{ color: '#A3E1FC', textColor: '#143343', label: 'Completado' },
};

// Para el VET: botón interactivo que alterna PENDIENTE ↔ ASISTIDO
const ItemAgendaVet = ({ reserva, onMarcar, actualizando, onAbrirFicha }) => {
  const asistido = reserva.estado === 'ASISTIDO';
  const completado = reserva.estado === 'COMPLETADO';
  const cancelado = reserva.estado === 'CANCELADO';

  const turnoAunNoComienza = !asistido && new Date(reserva.fechaHora) > new Date();

  return (
    <View style={estilos.itemTurno}>
      <View style={estilos.filaPrincipal}>
        <View style={estilos.infoContenedor}>
          <Text style={estilos.itemHora}>
            {formatearHoraRango(reserva.fechaHora, reserva.duracionMinutos)}
          </Text>
          <Text style={estilos.itemNombre}>Cliente: {reserva.nombreCliente}</Text>
          <Text style={estilos.itemMascota}>Paciente: {reserva.nombreMascota}</Text>
          {turnoAunNoComienza && (
             <Text style={estilos.avisoHorario}>Disponible al comenzar el turno</Text>
          )}
        </View>

        {completado ? (
          <View style={[estilos.checkBoton, estilos.checkBotonCompletado]}>
            <Text style={estilos.checkTextoActivo}>✓✓</Text>
          </View>
        ) : (
          <TouchableOpacity
          style={[
            estilos.checkBoton,
            asistido && estilos.checkBotonActivo,
            turnoAunNoComienza && estilos.checkBotonDeshabilitado,
          ]}
            onPress={() => onMarcar(reserva, turnoAunNoComienza)}
            disabled={actualizando}
          accessibilityLabel={
            asistido
                ? 'Desconfirmar asistencia'
                : turnoAunNoComienza
                ? 'Aún no se puede confirmar asistencia'
                : 'Confirmar asistencia'
          }
            accessibilityRole="button"
          >
            {actualizando ? (
              <ActivityIndicator size="small" color="#143343" />
            ) : (
              <Text style={[estilos.checkTexto, asistido && estilos.checkTextoActivo]}>✓</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* RF-14: oculto para turnos cancelados */}
      {!cancelado && (
        <BotonSecundario
          titulo={reserva.observacionesClinicas ? 'Ver / Editar Ficha Médica' : 'Ficha Médica'}
          onPress={() => onAbrirFicha(reserva)}
          estilo={estilos.botonFicha}
        />
      )}
    </View>
  );
};

// Para el GESTOR: solo muestra el estado (sin botón interactivo)
const ItemAgendaGestor = ({ reserva }) => {
  const cfg = badgeConfig[reserva.estado] || badgeConfig.PENDIENTE;
  return (
    <View style={estilos.itemTurno}>
      <View style={estilos.infoContenedor}>
        <Text style={estilos.itemHora}>
          {formatearHoraRango(reserva.fechaHora, reserva.duracionMinutos)}
        </Text>
        <Text style={estilos.itemNombre}>Cliente: {reserva.nombreCliente}</Text>
        <Text style={estilos.itemMascota}>Paciente: {reserva.nombreMascota}</Text>
      </View>
      <View style={[estilos.estadoBadge, { backgroundColor: cfg.color }]}>
        <Text style={[estilos.estadoBadgeTexto, { color: cfg.textColor }]}>{cfg.label}</Text>
      </View>
    </View>
  );
};

const AgendaAdminScreen = ({ navigation }) => {
  const { usuario } = useAuth();
  const esVeterinario = usuario?.rol === ROLES.VETERINARIO;
  const [fecha, setFecha] = useState(new Date());
  const [agenda, setAgenda] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [actualizandoIds, setActualizandoIds] = useState({});

  // Filtro por sede (solo tiene sentido para el gestor, que ve múltiples sedes)
  const [sedes, setSedes] = useState([]);
  const [sedeId, setSedeId] = useState('');

  useEffect(() => {
    if (esVeterinario) return;
    obtenerSedes()
      .then(setSedes)
      .catch(() => setSedes([]));
  }, [esVeterinario]);

  // RF-14: Ficha Médica (observacionesClinicas del turno)
  const [fichaReserva, setFichaReserva] = useState(null);
  const [textoFicha, setTextoFicha] = useState('');
  const [guardandoFicha, setGuardandoFicha] = useState(false);
  const [errorFicha, setErrorFicha] = useState('');

  const cargarAgenda = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const fechaStr = fecha.toISOString().split('T')[0];
      const data = await obtenerAgenda(fechaStr, sedeId ? parseInt(sedeId, 10) : null);
      const filtrados = data.filter((r) => r.estado !== 'CANCELADO');
      filtrados.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
      setAgenda(filtrados);
    } catch (e) {
      setError(e.message || 'Error al cargar la agenda.');
    } finally {
      setCargando(false);
    }
  }, [fecha, sedeId]);

  useEffect(() => {
    cargarAgenda();
  }, [cargarAgenda]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarAgenda);
    return unsubscribe;
  }, [navigation, cargarAgenda]);

  const manejarMarcar = async (reserva, bloqueadoPorHorario = false) => {
    if (actualizandoIds[reserva.id]) return; // evita doble tap mientras hay una petición en curso

    // (Reserva.marcarComoAsistido) sigue siendo la validación real — esto es
    // solo UX, por si el reloj del dispositivo está desfasado del servidor.
    if (bloqueadoPorHorario) {
      setError('No se puede marcar como asistido un turno antes de su fecha y hora de inicio.');
      return;
    }

    // Alterna entre PENDIENTE y ASISTIDO; COMPLETADO es un estado final
    const nuevoEstado = reserva.estado === 'ASISTIDO' ? 'PENDIENTE' : 'ASISTIDO';
    const estadoAnterior = reserva.estado;

    // Optimistic update: refleja el cambio al toque, sin esperar la respuesta del backend
    setAgenda((prev) => prev.map((r) => (r.id === reserva.id ? { ...r, estado: nuevoEstado } : r)));
    setActualizandoIds((prev) => ({ ...prev, [reserva.id]: true }));

    try {
      // Si es veterinario, se auto-asigna al turno cuando lo confirma
      const vetId = esVeterinario ? usuario.id : null;
      await registrarAsistencia(reserva.id, nuevoEstado, vetId);
    } catch (e) {
      // Revertimos el cambio optimista si el backend lo rechazó
      setAgenda((prev) => prev.map((r) => (r.id === reserva.id ? { ...r, estado: estadoAnterior } : r)));
      setError(e.message || 'Error al actualizar el estado.');
    } finally {
      setActualizandoIds((prev) => {
        const { [reserva.id]: _omitido, ...resto } = prev;
        return resto;
      });
    }
  };

  const abrirFicha = (reserva) => {
    setFichaReserva(reserva);
    setTextoFicha(reserva.observacionesClinicas || '');
    setErrorFicha('');
  };

  const cerrarFicha = () => {
    setFichaReserva(null);
    setErrorFicha('');
  };

  const guardarFicha = async () => {
    if (!fichaReserva) return;
    setErrorFicha('');
    setGuardandoFicha(true);
    try {
      await actualizarObservaciones(fichaReserva.id, textoFicha);
      // Reflejamos el cambio en la lista para que el botón pase a "Ver / Editar Ficha Médica"
      setAgenda((prev) =>
        prev.map((r) => (r.id === fichaReserva.id ? { ...r, observacionesClinicas: textoFicha } : r))
      );
      setFichaReserva(null);
    } catch (e) {
      setErrorFicha(e.message || 'Error al guardar la ficha médica.');
    } finally {
      setGuardandoFicha(false);
    }
  };

  const nombre = usuario?.nombreCompleto?.split(' ')[0] || 'Admin';

  const puedeVolver = navigation.canGoBack();

  return (
    <SafeAreaView style={estilos.safeArea}>
      {/* Encabezado: con botón volver si es gestor, con saludo si es veterinario */}
      <View style={estilos.encabezado}>
        {puedeVolver ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={estilos.flechaVolver}>←</Text>
          </TouchableOpacity>
        ) : (
          <Text style={estilos.saludo}>Hola, {nombre}</Text>
        )}
        {puedeVolver && <Text style={estilos.tituloEncabezado}>Agenda del Día</Text>}
        {/* Punto 3: la lupa ya no va acá, ahora vive en el Dashboard del veterinario */}
        <TouchableOpacity
          style={estilos.avatarBoton}
          onPress={() => navigation.navigate('PerfilModal')}
          accessibilityLabel="Abrir perfil"
        >
          <View style={estilos.avatar}>
            <Text style={estilos.avatarInicial}>{nombre[0]?.toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={estilos.contenido}>
        <Text style={estilos.seccionTitulo}>Agenda</Text>

        {/* Filtro por Sede: solo para el gestor, que administra varias sedes */}
        {!esVeterinario && (
          <SelectorCampo
            placeholder="Filtrar por Sede"
            valor={sedeId}
            alCambiar={setSedeId}
            opciones={sedes.map((s) => ({ label: s.nombre, value: String(s.id) }))}
            estilo={estilos.selectorSede}
          />
        )}

        {/* Punto 5: selector de fecha con calendario propio */}
        <SelectorFecha
          valor={fecha}
          alCambiar={setFecha}
          estilo={estilos.selectorFechaAgenda}
        />

        {!!error && <AlertaError mensaje={error} style={{ marginBottom: SPACING.md }} />}

        {cargando ? (
          <CargandoPantalla oscuro />
        ) : (
          <FlatList
            data={agenda}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) =>
              esVeterinario ? (
                <ItemAgendaVet
                  reserva={item}
                  onMarcar={manejarMarcar}
                  actualizando={!!actualizandoIds[item.id]}
                  onAbrirFicha={abrirFicha}
                />
              ) : (
                <ItemAgendaGestor reserva={item} />
              )
            }
            contentContainerStyle={estilos.lista}
            ListEmptyComponent={
              <EstadoVacio mensaje="No hay turnos programados para este día." />
            }
          />
        )}
      </View>

      {/* 🚀 BOTÓN FLOTANTE: Punto 10, para el veterinario esto se movió al
          Dashboard ("Programar Nuevo Turno"); acá solo queda para el gestor */}
      {!esVeterinario && (
        <TouchableOpacity
          style={estilos.botonFlotante}
          onPress={() => navigation.navigate('CrearTurnoAdmin')}
          accessibilityLabel="Cargar turno nuevo"
        >
          <Text style={estilos.botonFlotanteTexto}>+</Text>
        </TouchableOpacity>
      )}

      {/* RF-14: Modal de Ficha Médica */}
      <ModalFormulario
        visible={!!fichaReserva}
        titulo="Ficha Médica"
        onCerrar={cerrarFicha}
      >
        <CampoTexto
          placeholder="Diagnóstico / observaciones del turno..."
          valor={textoFicha}
          alCambiar={setTextoFicha}
          multilinea
          numeroLineas={6}
        />
        {!!errorFicha && <AlertaError mensaje={errorFicha} />}
        <BotonPrimario
          titulo="Guardar"
          onPress={guardarFicha}
          cargando={guardandoFicha}
          estilo={estilos.botonGuardarFicha}
        />
      </ModalFormulario>
    </SafeAreaView>
  );
};

// ════════════════════════════════════════════
//  ESTILOS TOTALMENTE REESTRUCTURADOS (ADMIN)
// ════════════════════════════════════════════
const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#143343', // 🎨 Fondo Oscuro general
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#143343',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.xl,
  },
  saludo: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  flechaVolver: {
    fontSize: FONT_SIZE.xl,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tituloEncabezado: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarBoton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3E3E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInicial: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#143343',
  },
  contenido: {
    flex: 1,
    padding: SPACING.lg,
  },
  seccionTitulo: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#FFFFFF', // Título central en blanco
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  selectorSede: {
    marginBottom: SPACING.md,
  },
  selectorFechaAgenda: {
    marginBottom: SPACING.md,
  },
  lista: {
    paddingBottom: SPACING.xl,
  },
  // 🚀 TARJETA ULTRA FLACA ESTILO HORIZONTAL
  itemTurno: {
    backgroundColor: '#E3E3E3',
    borderRadius: 12,
    paddingVertical: 10,           // Aire vertical comprimido al mínimo
    paddingHorizontal: SPACING.md,
    marginVertical: 4,
  },
  filaPrincipal: {
    flexDirection: 'row',          // Divide el contenido del botón de marcar
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botonFicha: {
    marginTop: SPACING.sm,
    minHeight: 40,
    paddingVertical: SPACING.xs,
    borderColor: '#143343',
  },
  infoContenedor: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  itemHora: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#143343', // Resalta la hora del turno
  },
  itemNombre: {
    fontSize: FONT_SIZE.sm,
    color: '#1F1F1F',
    fontWeight: '500',
    marginTop: 1,
  },
  itemMascota: {
    fontSize: FONT_SIZE.sm,
    color: '#555555',
    marginTop: 1,
  },
  // 🚀 BOTÓN DE CHECK CORREGIDO Y ACCESIBLE
  checkBoton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#143343',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkBotonActivo: {
    backgroundColor: '#90C7A1', // 🎨 Verde pastel cuando asistió
    borderColor: '#90C7A1',
  },
  checkTexto: {
    fontSize: 20,
    color: '#143343',
    fontWeight: '700',
  },
  checkTextoActivo: {
    color: '#143343',
  },
  checkBotonCompletado: {
    backgroundColor: '#A3E1FC',
    borderColor: '#A3E1FC',
  },
  checkBotonDeshabilitado: {
    opacity: 0.4,
  },
  avisoHorario: {
  fontSize: FONT_SIZE.sm - 1,
    color: '#B45309',
    marginTop: 2,
    fontStyle: 'italic',
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  estadoBadgeTexto: {
    fontSize: 12,
    fontWeight: '700',
  },
  // 🚀 BOTÓN FLOATING SUMAR EN VERDE PASTEL
  botonFlotante: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: '#90C7A1', 
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  botonFlotanteTexto: {
    color: '#143343', // Símbolo más oscuro para mejor contraste
    fontSize: 32,
    fontWeight: '400',
    lineHeight: 32,
    marginBottom: 4,
  },
  botonGuardarFicha: {
    backgroundColor: '#90C7A1',
    marginTop: SPACING.md,
  },
});

export default AgendaAdminScreen;