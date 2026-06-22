import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';

export default function ListaVeterinariosScreen({ navigation }) {
  const [veterinarios, setVeterinarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para traer los veterinarios desde el Backend
  const cargarVeterinarios = async () => {
    try {
      setLoading(true);
      // Reemplazar por la URL de tu API local cuando el backend esté encendido
      const response = await fetch('http://localhost:8080/api/veterinarios');
      if (response.ok) {
        const data = await response.json();
        setVeterinarios(data);
      } else {
        Alert.alert('Error', 'No se pudieron obtener los datos de los profesionales.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Problema de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVeterinarios();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.vetName}>{item.nombreCompleto || item.nombre}</Text>
        <Text style={styles.badge}>M.P. {item.matricula}</Text>
      </View>
      <Text style={styles.vetInfo}><Text style={{fontWeight: '600'}}>Email:</Text> {item.email}</Text>
      <Text style={styles.vetInfo}><Text style={{fontWeight: '600'}}>DNI:</Text> {item.dni}</Text>
      <Text style={styles.vetInfo}>
        <Text style={{fontWeight: '600'}}>Especialidad:</Text> {item.especialidad || 'General'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Staff de Veterinarios</Text>
      <Text style={styles.subtitle}>Panel de Control Administrativo</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={veterinarios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay veterinarios dados de alta en el sistema.</Text>
          }
          refreshing={loading}
          onRefresh={cargarVeterinarios}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    // Sombras ligeras para que quede estético
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 5,
  },
  vetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  badge: {
    backgroundColor: '#e3f2fd',
    color: '#0d47a1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    fontSize: 12,
    fontWeight: '600',
  },
  vetInfo: {
    fontSize: 14,
    color: '#555',
    marginTop: 3,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 16,
  },
});