// EstadisticasScreen.js - RF-11 / RF-18: dashboard de estadísticas del Manager
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { CargandoPantalla, AlertaError, Tarjeta } from '../../components/ui';
import { FONT_SIZE, SPACING } from '../../constants';
import { obtenerEstadisticas } from '../../services/api';

const TarjetaMetrica = ({ titulo, subtitulo, cantidad }) => (
  <Tarjeta estilo={estilos.tarjeta}>
    <View style={estilos.tarjetaInfo}>
      <Text style={estilos.nombreMetrica}>{titulo}</Text>
      <Text style={estilos.label}>{subtitulo}</Text>
    </View>
    <Text style={estilos.cantidad}>{cantidad}</Text>
  </Tarjeta>
);

const SinDatos = ({ mensaje }) => <Text style={estilos.sinDatos}>{mensaje}</Text>;

const EstadisticasScreen = ({ navigation }) => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const data = await obtenerEstadisticas();
      setEstadisticas(data);
    } catch (e) {
      setError(e.message || 'Error al cargar las estadísticas');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargar);
    return unsubscribe;
  }, [navigation, cargar]);

  const porSede = estadisticas?.porSede || [];
  const porVeterinario = estadisticas?.porVeterinario || [];

  return (
    <SafeAreaView style={estilos.safeArea}>
      <View style={estilos.encabezado}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={estilos.flechaTexto}>←</Text>
        </TouchableOpacity>
        <Text style={estilos.titulo}>Estadísticas</Text>
        <TouchableOpacity
          onPress={cargar}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={estilos.refresh}>🔄</Text>
        </TouchableOpacity>
      </View>

      {!!error && <AlertaError mensaje={error} estilo={{ margin: SPACING.md }} />}

      {cargando ? (
        <CargandoPantalla oscuro />
      ) : (
        <ScrollView contentContainerStyle={estilos.scroll}>
          {/* ── Total General ── */}
          <Text style={estilos.seccionTitulo}>Total General</Text>
          <View style={estilos.tarjetaTotal}>
            <Text style={estilos.totalNumero}>{estadisticas?.totalTurnos ?? 0}</Text>
            <Text style={estilos.totalLabel}>Turnos atendidos en total</Text>
          </View>

          {/* ── Turnos por Sede ── */}
          <Text style={estilos.seccionTitulo}>Turnos por Sede</Text>
          {porSede.length === 0 ? (
            <SinDatos mensaje="Todavía no hay turnos atendidos para mostrar por sede." />
          ) : (
            porSede.map((item, index) => (
              <TarjetaMetrica
                key={`sede-${item.nombreSede}-${index}`}
                titulo={item.nombreSede}
                subtitulo="Turnos atendidos"
                cantidad={item.cantidadTurnos}
              />
            ))
          )}

          {/* ── Turnos por Veterinario ── */}
          <Text style={estilos.seccionTitulo}>Turnos por Veterinario</Text>
          {porVeterinario.length === 0 ? (
            <SinDatos mensaje="Todavía no hay turnos atendidos para mostrar por veterinario." />
          ) : (
            porVeterinario.map((item, index) => (
              <TarjetaMetrica
                key={`vet-${item.nombreVeterinario}-${index}`}
                titulo={item.nombreVeterinario}
                subtitulo="Turnos atendidos"
                cantidad={item.cantidadTurnos}
              />
            ))
          )}
        </ScrollView>
      )}
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
  refresh: {
    fontSize: FONT_SIZE.lg,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  seccionTitulo: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: '#A3E1FC',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tarjetaTotal: {
    backgroundColor: '#90C7A1',
    borderRadius: 12,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalNumero: {
    fontSize: 48,
    fontWeight: '800',
    color: '#143343',
  },
  totalLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: '#143343',
    marginTop: SPACING.xs,
  },
  sinDatos: {
    fontSize: FONT_SIZE.sm,
    color: '#A3E1FC',
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  tarjeta: {
    backgroundColor: '#E3E3E3',
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tarjetaInfo: {
    flex: 1,
  },
  nombreMetrica: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#143343',
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: '#555',
    marginTop: 2,
  },
  cantidad: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: '#143343',
    marginLeft: SPACING.md,
  },
});

export default EstadisticasScreen;
