import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';

export default function AgendaVeterinarioScreen({ navigation }) {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reemplazar por el ID real del veterinario logueado (que vendrá del AuthContext)
  const idVeterinario = 99; 

  const cargarAgenda = async () => {
    try {
      setLoading(true);
      // Petición al endpoint que filtra los turnos de este veterinario específico
      const response = await fetch(`http://localhost:8080/api/turnos/veterinario/${idVeterinario}`);
      if (response.ok) {
        const data = await response.json();
        setTurnos(data);
      } else {
        Alert.alert('Error', 'No se pudo cargar la agenda del día.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Problema al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAgenda();
  }, []);

  const renderTurno = ({ item }) => (
    <View style={styles.turnoCard}>
      <View style={styles.horaContainer}>
        <Text style={styles.horaText}>{item.hora || '09:00'}</Text>
        <Text style={styles.fechaText}>{item.fecha || '22 May'}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.mascotaName}>🐾 {item.mascotaNombre || 'Firulais'}</Text>
        <Text style={styles.detallesText}>Dueño: {item.duenioNombre || 'Juan Pérez'}</Text>
        <Text style={styles.motivoBadge}>{item.motivo || 'Consulta General'}</Text>
      </View>

      <TouchableOpacity 
        style={styles.atenderButton}
        onPress={() => navigation.navigate('HistorialMascota', { mascotaId: item.mascotaId, mascotaNombre: item.mascotaNombre })}
      >
        <Text style={styles.atenderButtonText}>Atender</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Agenda Diaria</Text>
      <Text style={styles.subtitle}>Consultorio Veterinario</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={turnos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTurno}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tenés turnos asignados para hoy. ¡Día libre!</Text>
          }
          refreshing={loading}
          onRefresh={cargarAgenda}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 13,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  list: {
    paddingBottom: 20,
  },
  turnoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 5,
    borderLeftColor: '#007bff', // Azul distintivo para turnos ocupados
    elevation: 2,
  },
  horaContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#eceff1',
    width: '20%',
  },
  horaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  fechaText: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  mascotaName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  detallesText: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 2,
  },
  motivoBadge: {
    backgroundColor: '#e8f0fe',
    color: '#1a73e8',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  atenderButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  atenderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#95a5a6',
    marginTop: 40,
    fontSize: 16,
  },
});