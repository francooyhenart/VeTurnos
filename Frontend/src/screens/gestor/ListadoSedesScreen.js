// ListadoSedesScreen.js - ABM de Sedes (Punto 4)
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  CargandoPantalla,
  EstadoVacio,
  AlertaError,
  ModalConfirmacion,
} from '../../components/ui';
import { FONT_SIZE, SPACING } from '../../constants';
import { obtenerSedes, eliminarSede } from '../../services/api';

const ItemSede = ({ sede, onEliminar }) => (
  <View style={estilos.itemSede}>
    <View style={estilos.infoSede}>
      <Text style={estilos.nombreSede}>{sede.nombre}</Text>
      <Text style={estilos.direccion}>{sede.direccionCompleta}</Text>
    </View>
    <TouchableOpacity style={estilos.botonEliminar} onPress={() => onEliminar(sede)}>
      <Text style={estilos.botonTexto}>🗑️</Text>
    </TouchableOpacity>
  </View>
);

const ListadoSedesScreen = ({ navigation }) => {
  const [sedes, setSedes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [sedeAEliminar, setSedeAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const cargarSedes = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const data = await obtenerSedes();
      setSedes(data);
    } catch (e) {
      setError(e.message || 'Error al cargar las sedes');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarSedes);
    return unsubscribe;
  }, [navigation, cargarSedes]);

  const confirmarEliminacion = async () => {
    if (!sedeAEliminar) return;
    setEliminando(true);
    try {
      await eliminarSede(sedeAEliminar.id);
      setSedeAEliminar(null);
      await cargarSedes();
    } catch (e) {
      setError(e.message || 'Error al eliminar la sede');
      setSedeAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

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
        <Text style={estilos.titulo}>Sedes</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('NuevaSede')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={estilos.botonAgregar}>➕</Text>
        </TouchableOpacity>
      </View>

      {!!error && <AlertaError mensaje={error} estilo={{ margin: SPACING.md }} />}

      <FlatList
        data={sedes}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ItemSede sede={item} onEliminar={setSedeAEliminar} />
        )}
        contentContainerStyle={estilos.lista}
        ListEmptyComponent={
          <EstadoVacio mensaje="No hay sedes registradas todavía." />
        }
      />

      <ModalConfirmacion
        visible={!!sedeAEliminar}
        titulo="¿Eliminar sede?"
        descripcion={`¿Estás seguro de que deseas eliminar "${sedeAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setSedeAEliminar(null)}
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
    backgroundColor: '#143343',
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
  botonAgregar: {
    fontSize: FONT_SIZE.lg,
  },
  lista: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
  itemSede: {
    backgroundColor: '#E3E3E3',
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoSede: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  nombreSede: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#143343',
  },
  direccion: {
    fontSize: FONT_SIZE.sm,
    color: '#555',
    marginTop: 2,
  },
  botonEliminar: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCA5A5',
    borderRadius: 8,
  },
  botonTexto: {
    fontSize: FONT_SIZE.lg,
  },
});

export default ListadoSedesScreen;
