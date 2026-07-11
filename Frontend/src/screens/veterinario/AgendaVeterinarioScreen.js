// AgendaVeterinarioScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, SafeAreaView, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { CargandoPantalla, EstadoVacio, AlertaError } from '../../components/ui';
import { FONT_SIZE, SPACING } from '../../constants';
import { obtenerAgendaVeterinario, obtenerProximosTurnosVeterinario } from '../../services/api';

const formatearFechaHoraRango = (fechaHoraStr, duracionMinutos = 30) => {
  if (!fechaHoraStr) return '';
  const inicio = new Date(fechaHoraStr);
  const fin = new Date(inicio.getTime() + (duracionMinutos || 30) * 60000);
  const dia = inicio.getDate();
  const mes = inicio.toLocaleString('es-AR', { month: 'short' });
  const horaInicio = inicio.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const horaFin = fin.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `${dia} ${mes} de ${horaInicio} a ${horaFin}`;
};

const badgeColor = (estado) => {
  switch (estado) {
    case 'PENDIENTE': return '#0284C7';
    case 'ASISTIDO': return '#16A34A';
    case 'COMPLETADO': return '#90C7A1';
    case 'CANCELADO': return '#999';
    default: return '#999';
  }
};

const badgeLabel = (estado) => {
  switch (estado) {
    case 'PENDIENTE': return 'Pendiente';
    case 'ASISTIDO': return 'Asistido';
    case 'COMPLETADO': return 'Completado';
    case 'CANCELADO': return 'Cancelado';
    default: return estado;
  }
};

const ItemTurno = ({ turno }) => (
  <View style={estilos.itemTurno}>
    <View style={estilos.infoTurno}>
      <Text style={estilos.mascotaNombre}>{turno.nombreMascota}</Text>
      <Text style={estilos.clienteNombre}>👤 {turno.nombreCliente}</Text>
      <Text style={estilos.fechaTexto}>{formatearFechaHoraRango(turno.fechaHora, turno.duracionMinutos)}</Text>
      {turno.motivo && <Text style={estilos.motivoTexto}>📝 {turno.motivo}</Text>}
    </View>
    <View style={[estilos.estadoBadge, { backgroundColor: badgeColor(turno.estado) }]}>
      <Text style={estilos.estadoTexto}>{badgeLabel(turno.estado)}</Text>
    </View>
  </View>
);

const BloqueLibre = ({ horario, onPress }) => (
  <TouchableOpacity style={estilos.bloqueLibre} onPress={() => onPress(horario)}>
    <Text style={estilos.bloqueLibreHora}>{horario}</Text>
    <Text style={estilos.bloqueLibreTexto}>🟢 Disponible</Text>
  </TouchableOpacity>
);

const BloqueContinuacion = ({ horario }) => (
  <View style={estilos.bloqueContinuacion}>
    <Text style={estilos.bloqueContinuacionHora}>{horario}</Text>
    <Text style={estilos.bloqueContinuacionTexto}>⏳ Procedimiento en curso</Text>
  </View>
);

// 🟢 Grilla dinámica basada en la jornada del veterinario activo
const armarGrillaDelDia = (turnosDeHoy, vet) => {
  const inicioPorHorario = new Map();
  const bloquesOcupados = new Set();

  turnosDeHoy.forEach((turno) => {
    if (turno.estado === 'CANCELADO') return;
    const inicio = new Date(turno.fechaHora);
    const duracion = turno.duracionMinutos || 30;
    const fin = new Date(inicio.getTime() + duracion * 60000);

    const horarioInicio = `${String(inicio.getHours()).padStart(2, '0')}:${String(inicio.getMinutes()).padStart(2, '0')}`;
    inicioPorHorario.set(horarioInicio, turno);

    let actual = new Date(inicio.getTime());
    while (actual < fin) {
      const hStr = `${String(actual.getHours()).padStart(2, '0')}:${String(actual.getMinutes()).padStart(2, '0')}`;
      bloquesOcupados.add(hStr);
      actual.setMinutes(actual.getMinutes() + 30);
    }
  });

  // 🟢 Generación del array de bloques leyendo vet.horaInicio y vet.horaFin
  const hInicioStr = vet?.horaInicio ? vet.horaInicio.slice(0, 5) : '09:00';
  const hFinStr = vet?.horaFin ? vet.horaFin.slice(0, 5) : '18:00';
  
  const [hIn, mIn] = hInicioStr.split(':').map(Number);
  const [hFi, mFi] = hFinStr.split(':').map(Number);
  
  let minutosActual = hIn * 60 + mIn;
  const minutosFin = hFi * 60 + mFi;
  const listaHorarios = [];

  while (minutosActual < minutosFin) {
    const h = String(Math.floor(minutosActual / 60)).padStart(2, '0');
    const m = String(minutosActual % 60).padStart(2, '0');
    listaHorarios.push(`${h}:${m}`);
    minutosActual += 30;
  }

  return listaHorarios.map((horario) => {
    if (inicioPorHorario.has(horario)) {
      return { tipo: 'turno', horario, turno: inicioPorHorario.get(horario) };
    }
    if (bloquesOcupados.has(horario)) {
      return { tipo: 'continuacion', horario };
    }
    return { tipo: 'libre', horario };
  });
};

const AgendaVeterinarioScreen = ({ navigation, route }) => {
  const { veterinario } = route.params;
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [vista, setVista] = useState('hoy');

  const cargarHoy = useCallback(async () => {
    const data = await obtenerAgendaVeterinario(veterinario.id);
    const hoyStr = new Date().toDateString();
    const deHoy = data.filter((t) => new Date(t.fechaHora).toDateString() === hoyStr);
    deHoy.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
    return deHoy;
  }, [veterinario.id]);

  const cargarProximos = useCallback(async () => {
    return obtenerProximosTurnosVeterinario(veterinario.id);
  }, [veterinario.id]);

  const cargarAgenda = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const data = vista === 'hoy' ? await cargarHoy() : await cargarProximos();
      setTurnos(data);
    } catch (e) {
      setError(e.message || 'Error al cargar la agenda');
    } finally {
      setCargando(false);
    }
  }, [vista, cargarHoy, cargarProximos]);

  useEffect(() => {
    cargarAgenda();
  }, [cargarAgenda]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarAgenda);
    return unsubscribe;
  }, [navigation, cargarAgenda]);

  const manejarBloqueLibre = (horario) => {
    // TODO: navigation.navigate('CargarTurnoVeterinario', { horarioPrecargado: horario });
  };

  if (cargando) return <CargandoPantalla oscuro />;

  // 🟢 Pasamos el objeto veterinario a la función generadora
  const datosLista = vista === 'hoy' ? armarGrillaDelDia(turnos, veterinario) : turnos;

  const renderizarItem = ({ item }) => {
    if (vista !== 'hoy') return <ItemTurno turno={item} />;
    switch (item.tipo) {
      case 'turno': return <ItemTurno turno={item.turno} />;
      case 'continuacion': return <BloqueContinuacion horario={item.horario} />;
      default: return <BloqueLibre horario={item.horario} onPress={manejarBloqueLibre} />;
    }
  };

  const obtenerKey = (item) => (vista === 'hoy' ? item.horario : String(item.id));

  return (
    <SafeAreaView style={estilos.safeArea}>
      <View style={estilos.encabezado}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}><Text style={estilos.flechaTexto}>←</Text></TouchableOpacity>
        <Text style={estilos.titulo}>Agenda</Text>
        <TouchableOpacity onPress={cargarAgenda} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}><Text style={estilos.botonRefresh}>🔄</Text></TouchableOpacity>
      </View>

      <View style={estilos.segmentado}>
        <TouchableOpacity style={[estilos.segmentoBoton, vista === 'hoy' && estilos.segmentoBotonActivo]} onPress={() => setVista('hoy')}>
          <Text style={[estilos.segmentoTexto, vista === 'hoy' && estilos.segmentoTextoActivo]}>Turnos Hoy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[estilos.segmentoBoton, vista === 'proximos' && estilos.segmentoBotonActivo]} onPress={() => setVista('proximos')}>
          <Text style={[estilos.segmentoTexto, vista === 'proximos' && estilos.segmentoTextoActivo]}>Próximos Turnos</Text>
        </TouchableOpacity>
      </View>

      <View style={estilos.tarjetaVeterinario}>
        <Text style={estilos.nombreVet}>{veterinario.nombreCompleto}</Text>
        <Text style={estilos.matriculaTexto}>{veterinario.matricula}</Text>
        {veterinario.especialidad && <Text style={estilos.especialidadTexto}>{veterinario.especialidad}</Text>}
      </View>

      {!!error && <AlertaError mensaje={error} estilo={{ margin: SPACING.md }} />}

      <FlatList data={datosLista} keyExtractor={obtenerKey} renderItem={renderizarItem} contentContainerStyle={estilos.lista}
        ListEmptyComponent={<EstadoVacio mensaje={vista === 'hoy' ? 'No hay bloques horarios configurados para hoy.' : 'Este veterinario no tiene próximos turnos pendientes.'} />}
      />
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#143343' },
  encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#143343', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, paddingTop: SPACING.lg },
  flechaTexto: { fontSize: FONT_SIZE.xl, color: '#FFFFFF', fontWeight: '700' },
  titulo: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: '#FFFFFF' },
  botonRefresh: { fontSize: FONT_SIZE.lg },
  segmentado: { flexDirection: 'row', backgroundColor: '#0F2733', borderRadius: 10, marginHorizontal: SPACING.lg, marginTop: SPACING.xs, padding: 4 },
  segmentoBoton: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  segmentoBotonActivo: { backgroundColor: '#90C7A1' },
  segmentoTexto: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: '#A3E1FC' },
  segmentoTextoActivo: { color: '#143343', fontWeight: '700' },
  tarjetaVeterinario: { backgroundColor: '#A3E1FC', marginHorizontal: SPACING.lg, marginVertical: SPACING.md, padding: SPACING.md, borderRadius: 12 },
  nombreVet: { fontSize: FONT_SIZE.md, fontWeight: '700', color: '#143343' },
  matriculaTexto: { fontSize: FONT_SIZE.sm, color: '#1F1F1F', marginTop: 4 },
  especialidadTexto: { fontSize: FONT_SIZE.sm, color: '#1F1F1F', fontStyle: 'italic', marginTop: 2 },
  lista: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  itemTurno: { backgroundColor: '#E3E3E3', borderRadius: 12, padding: SPACING.md, marginVertical: SPACING.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoTurno: { flex: 1, paddingRight: SPACING.md },
  mascotaNombre: { fontSize: FONT_SIZE.md, fontWeight: '700', color: '#143343' },
  clienteNombre: { fontSize: FONT_SIZE.sm, color: '#666', marginTop: 2 },
  fechaTexto: { fontSize: FONT_SIZE.sm, color: '#1F1F1F', marginTop: 4 },
  motivoTexto: { fontSize: FONT_SIZE.sm, color: '#0284C7', marginTop: 2, fontWeight: '600' },
  estadoBadge: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: 8, minWidth: 70, alignItems: 'center' },
  estadoTexto: { fontSize: FONT_SIZE.sm - 1, fontWeight: '700', color: '#FFFFFF' },
  bloqueLibre: { backgroundColor: '#F3F4F6', borderRadius: 10, borderWidth: 1.5, borderColor: '#90C7A1', borderStyle: 'dashed', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, marginVertical: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  bloqueLibreHora: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: '#143343' },
  bloqueLibreTexto: { fontSize: FONT_SIZE.sm, color: '#16A34A', fontWeight: '600' },
  bloqueContinuacion: { backgroundColor: '#FEE2E2', borderRadius: 8, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, marginVertical: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 40 },
  bloqueContinuacionHora: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: '#7F1D1D' },
  bloqueContinuacionTexto: { fontSize: FONT_SIZE.sm - 1, color: '#991B1B', fontWeight: '600' },
});

export default AgendaVeterinarioScreen;