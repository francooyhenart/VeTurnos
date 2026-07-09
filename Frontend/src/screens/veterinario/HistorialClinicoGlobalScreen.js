// HistorialClinicoGlobalScreen.js - Historial clínico completo de una mascota
// (todos los turnos completados, sin importar sede o veterinario que la atendió)
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { CargandoPantalla, EstadoVacio, AlertaError } from '../../components/ui';
import { FONT_SIZE, SPACING } from '../../constants';
import { obtenerHistorialClinico } from '../../services/api';

const formatearFechaHora = (fechaHoraStr) => {
  if (!fechaHoraStr) return '';
  const fecha = new Date(fechaHoraStr);
  const diaMes = fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  const hora = fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `${diaMes} · ${hora}`;
};

const ItemHistorial = ({ visita }) => (
  <View style={estilos.itemVisita}>
    <View style={estilos.lineaTiempo}>
      <View style={estilos.punto} />
      <View style={estilos.linea} />
    </View>
    <View style={estilos.tarjetaVisita}>
      <Text style={estilos.fecha}>{formatearFechaHora(visita.fechaHora)}</Text>
      <Text style={estilos.veterinario}>
        👨‍⚕️ {visita.nombreVeterinario || 'Sin veterinario asignado'}
      </Text>
      {visita.nombreSede && <Text style={estilos.sede}>🏥 {visita.nombreSede}</Text>}
      <Text style={estilos.observacionesLabel}>Diagnóstico / Observaciones</Text>
      <Text style={estilos.observaciones}>
        {visita.observacionesClinicas || 'Sin observaciones cargadas para este turno.'}
      </Text>
    </View>
  </View>
);

const HistorialClinicoGlobalScreen = ({ navigation, route }) => {
  const { mascota } = route.params;
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cargarHistorial = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const data = await obtenerHistorialClinico(mascota.id);
      setHistorial(data);
    } catch (e) {
      setError(e.message || 'Error al cargar el historial clínico.');
    } finally {
      setCargando(false);
    }
  }, [mascota.id]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarHistorial);
    return unsubscribe;
  }, [navigation, cargarHistorial]);

  if (cargando) return <CargandoPantalla oscuro />;

  return (
    <SafeAreaView style={estilos.safeArea}>
      <View style={estilos.encabezado}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={estilos.flechaTexto}>←</Text>
        </TouchableOpacity>
        <Text style={estilos.titulo}>Historial Clínico</Text>
        <TouchableOpacity
          onPress={cargarHistorial}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={estilos.botonRefresh}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={estilos.tarjetaPaciente}>
        <Text style={estilos.nombrePaciente}>{mascota.nombre}</Text>
        <Text style={estilos.datoPaciente}>{mascota.raza}</Text>
        <Text style={estilos.datoPaciente}>
          👤 {mascota.nombreDueño} · DNI {mascota.dniDueño}
        </Text>
      </View>

      {!!error && <AlertaError mensaje={error} estilo={{ margin: SPACING.md }} />}

      <FlatList
        data={historial}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ItemHistorial visita={item} />}
        contentContainerStyle={estilos.lista}
        ListEmptyComponent={
          <EstadoVacio mensaje="Esta mascota todavía no tiene turnos completados en su historial." />
        }
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
  titulo: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  botonRefresh: {
    fontSize: FONT_SIZE.lg,
  },
  tarjetaPaciente: {
    backgroundColor: '#A3E1FC',
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
  },
  nombrePaciente: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#143343',
  },
  datoPaciente: {
    fontSize: FONT_SIZE.sm,
    color: '#1F1F1F',
    marginTop: 2,
  },
  lista: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  itemVisita: {
    flexDirection: 'row',
  },
  lineaTiempo: {
    alignItems: 'center',
    width: 20,
  },
  punto: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#90C7A1',
    marginTop: 6,
  },
  linea: {
    flex: 1,
    width: 2,
    backgroundColor: '#2C4A5A',
    marginTop: 2,
  },
  tarjetaVisita: {
    flex: 1,
    backgroundColor: '#E3E3E3',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    marginLeft: SPACING.sm,
  },
  fecha: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: '#143343',
  },
  veterinario: {
    fontSize: FONT_SIZE.sm,
    color: '#1F1F1F',
    marginTop: 4,
  },
  sede: {
    fontSize: FONT_SIZE.sm,
    color: '#555',
    marginTop: 2,
  },
  observacionesLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: '#0284C7',
    marginTop: SPACING.sm,
    textTransform: 'uppercase',
  },
  observaciones: {
    fontSize: FONT_SIZE.sm,
    color: '#1F1F1F',
    marginTop: 2,
  },
});

export default HistorialClinicoGlobalScreen;
