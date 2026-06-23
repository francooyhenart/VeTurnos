// GestionVeterinariosScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  CargandoPantalla,
  EstadoVacio,
  AlertaError,
  ModalConfirmacion,
} from '../../components/ui';
import { FONT_SIZE, SPACING } from '../../constants';
import { obtenerVeterinarios, eliminarVeterinario } from '../../services/api';

const ItemVeterinario = ({ veterinario, onEditar, onEliminar, onVerAgenda }) => (
  <View style={estilos.itemVeterinario}>
    <View style={estilos.infoVeterinario}>
      <Text style={estilos.nombreVeterinario}>{veterinario.nombreCompleto}</Text>
      <Text style={estilos.matricula}>Matrícula: {veterinario.matricula}</Text>
      <Text style={estilos.especialidad}>{veterinario.especialidad || 'Sin especialidad'}</Text>
      <Text style={estilos.email}>{veterinario.email}</Text>
    </View>

    <View style={estilos.botonesAccion}>
      <TouchableOpacity
        style={estilos.botonVerAgenda}
        onPress={() => onVerAgenda(veterinario)}
      >
        <Text style={estilos.botonTexto}>📅</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={estilos.botonEditar}
        onPress={() => onEditar(veterinario)}
      >
        <Text style={estilos.botonTexto}>✏️</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={estilos.botonEliminar}
        onPress={() => onEliminar(veterinario)}
      >
        <Text style={estilos.botonTexto}>🗑️</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const GestionVeterinariosScreen = ({ navigation }) => {
  const [veterinarios, setVeterinarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [vetAEliminar, setVetAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const cargarVeterinarios = useCallback(async () => {
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
    const unsubscribe = navigation.addListener('focus', cargarVeterinarios);
    return unsubscribe;
  }, [navigation, cargarVeterinarios]);

  const veterinariosFiltrados = veterinarios.filter(vet =>
    vet.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
    vet.matricula.toLowerCase().includes(busqueda.toLowerCase())
  );

  const confirmarEliminacion = async () => {
    if (!vetAEliminar) return;
    setEliminando(true);
    try {
      await eliminarVeterinario(vetAEliminar.id);
      setVetAEliminar(null);
      await cargarVeterinarios();
    } catch (e) {
      setError(e.message || 'Error al eliminar el veterinario');
      setVetAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  if (cargando) return <CargandoPantalla />;

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
        <Text style={estilos.titulo}>Veterinarios</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AltaVeterinario')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={estilos.botonAgregar}>➕</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={estilos.buscadorContenedor}>
        <TextInput
          style={estilos.buscador}
          placeholder="Buscar por nombre o matrícula..."
          placeholderTextColor="#999"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {!!error && <AlertaError mensaje={error} estilo={{ margin: SPACING.md }} />}

      {/* Lista */}
      <FlatList
        data={veterinariosFiltrados}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ItemVeterinario
            veterinario={item}
            onEditar={(vet) => navigation.navigate('DetalleVeterinario', { veterinario: vet })}
            onEliminar={setVetAEliminar}
            onVerAgenda={(vet) => navigation.navigate('AgendaVeterinario', { veterinario: vet })}
          />
        )}
        contentContainerStyle={estilos.lista}
        ListEmptyComponent={<EstadoVacio mensaje="No hay veterinarios registrados." />}
      />

      <ModalConfirmacion
        visible={!!vetAEliminar}
        titulo="¿Eliminar veterinario?"
        descripcion={`¿Estás seguro de que deseas eliminar a ${vetAEliminar?.nombreCompleto}?`}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setVetAEliminar(null)}
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
  buscadorContenedor: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  buscador: {
    backgroundColor: '#E3E3E3',
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: '#1F1F1F',
  },
  lista: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  itemVeterinario: {
    backgroundColor: '#E3E3E3',
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoVeterinario: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  nombreVeterinario: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#143343',
  },
  matricula: {
    fontSize: FONT_SIZE.sm,
    color: '#1F1F1F',
    marginTop: 2,
  },
  especialidad: {
    fontSize: FONT_SIZE.sm,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  email: {
    fontSize: FONT_SIZE.sm - 1,
    color: '#999',
    marginTop: 4,
  },
  botonesAccion: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  botonVerAgenda: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A3E1FC',
    borderRadius: 8,
  },
  botonEditar: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#90C7A1',
    borderRadius: 8,
  },
  botonEliminar: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCA5A5',
    borderRadius: 8,
  },
  botonTexto: {
    fontSize: FONT_SIZE.lg,
  },
});

export default GestionVeterinariosScreen;
