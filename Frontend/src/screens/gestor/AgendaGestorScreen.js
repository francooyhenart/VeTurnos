// AgendaGestorScreen.js - Lista de veterinarios para ver su agenda
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
import { obtenerVeterinarios } from '../../services/api';

const TarjetaVeterinario = ({ vet, onPress }) => (
  <TouchableOpacity style={estilos.tarjeta} onPress={onPress} activeOpacity={0.8}>
    <View style={estilos.tarjetaInfo}>
      <Text style={estilos.nombre}>{vet.nombreCompleto}</Text>
      <Text style={estilos.matricula}>{vet.matricula}</Text>
      {vet.especialidad ? (
        <Text style={estilos.especialidad}>{vet.especialidad}</Text>
      ) : null}
    </View>
    <Text style={estilos.flecha}>›</Text>
  </TouchableOpacity>
);

const AgendaGestorScreen = ({ navigation }) => {
  const [veterinarios, setVeterinarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const data = await obtenerVeterinarios();
      setVeterinarios(data);
    } catch (e) {
      setError(e.message || 'Error al cargar los veterinarios');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargar);
    return unsubscribe;
  }, [navigation, cargar]);

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
        <Text style={estilos.titulo}>Agenda por Veterinario</Text>
        <TouchableOpacity
          onPress={cargar}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={estilos.refresh}>🔄</Text>
        </TouchableOpacity>
      </View>

      <Text style={estilos.subtitulo}>
        Seleccioná un veterinario para ver su agenda
      </Text>

      {!!error && <AlertaError mensaje={error} estilo={{ margin: SPACING.md }} />}

      <FlatList
        data={veterinarios}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TarjetaVeterinario
            vet={item}
            onPress={() => navigation.navigate('AgendaVeterinario', { veterinario: item })}
          />
        )}
        contentContainerStyle={estilos.lista}
        ListEmptyComponent={
          <EstadoVacio mensaje="No hay veterinarios registrados en el sistema." />
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
  refresh: {
    fontSize: FONT_SIZE.lg,
  },
  subtitulo: {
    fontSize: FONT_SIZE.sm,
    color: '#A3E1FC',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  lista: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
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
  nombre: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#143343',
  },
  matricula: {
    fontSize: FONT_SIZE.sm,
    color: '#555',
    marginTop: 2,
  },
  especialidad: {
    fontSize: FONT_SIZE.sm,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  flecha: {
    fontSize: 24,
    color: '#143343',
    fontWeight: '700',
    paddingLeft: SPACING.md,
  },
});

export default AgendaGestorScreen;
