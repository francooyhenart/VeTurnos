// BuscadorPacientesScreen.js - Búsqueda Global de Pacientes (Veterinario)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { CampoTexto, EstadoVacio, AlertaError } from '../../components/ui';
import { FONT_SIZE, SPACING } from '../../constants';
import { buscarMascotas } from '../../services/api';

const especieIcono = {
  PERRO: '🐶',
  GATO: '🐱',
  AVE: '🐦',
  ROEDOR: '🐹',
  REPTIL: '🦎',
  OTRO: '🐾',
};

const ItemPaciente = ({ mascota, onPress }) => (
  <TouchableOpacity style={estilos.item} onPress={() => onPress(mascota)} activeOpacity={0.8}>
    <Text style={estilos.icono}>{especieIcono[mascota.especie] || '🐾'}</Text>
    <View style={estilos.info}>
      <Text style={estilos.nombreMascota}>{mascota.nombre}</Text>
      <Text style={estilos.raza}>{mascota.raza}</Text>
      <Text style={estilos.dueño}>
        👤 {mascota.nombreDueño} · DNI {mascota.dniDueño}
      </Text>
    </View>
    <Text style={estilos.flecha}>›</Text>
  </TouchableOpacity>
);

const BuscadorPacientesScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (query.trim().length < 2) {
      setResultados([]);
      return;
    }
    const timer = setTimeout(async () => {
      setBuscando(true);
      setError('');
      try {
        const data = await buscarMascotas(query.trim());
        setResultados(data);
      } catch (e) {
        setError(e.message || 'Error al buscar pacientes.');
        setResultados([]);
      } finally {
        setBuscando(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const irAHistorial = (mascota) => {
    navigation.navigate('HistorialClinicoGlobal', { mascota });
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
        <Text style={estilos.titulo}>Buscar Paciente</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={estilos.contenido}>
        <CampoTexto
          placeholder="Nombre de la mascota o DNI del dueño..."
          valor={query}
          alCambiar={setQuery}
        />

        {!!error && <AlertaError mensaje={error} estilo={{ marginTop: SPACING.sm }} />}

        {buscando && <Text style={estilos.buscandoTexto}>Buscando...</Text>}

        {!buscando && query.trim().length >= 2 && resultados.length === 0 && !error && (
          <Text style={estilos.buscandoTexto}>Sin resultados para "{query}"</Text>
        )}

        <FlatList
          data={resultados}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ItemPaciente mascota={item} onPress={irAHistorial} />}
          contentContainerStyle={estilos.lista}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            query.trim().length < 2 ? (
              <EstadoVacio mensaje="Escribí al menos 2 caracteres para buscar un paciente." />
            ) : null
          }
        />
      </View>
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
  contenido: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  buscandoTexto: {
    fontSize: FONT_SIZE.sm,
    color: '#A3E1FC',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  lista: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  item: {
    backgroundColor: '#E3E3E3',
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icono: {
    fontSize: 28,
    marginRight: SPACING.sm,
  },
  info: {
    flex: 1,
  },
  nombreMascota: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#143343',
  },
  raza: {
    fontSize: FONT_SIZE.sm,
    color: '#555',
    marginTop: 2,
  },
  dueño: {
    fontSize: FONT_SIZE.sm - 1,
    color: '#666',
    marginTop: 4,
  },
  flecha: {
    fontSize: 24,
    color: '#143343',
    fontWeight: '700',
    paddingLeft: SPACING.sm,
  },
});

export default BuscadorPacientesScreen;
