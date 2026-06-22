import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, Alert } from 'react-native';

export default function HistorialMascotaScreen({ route, navigation }) {
  // Recibimos los datos de la mascota desde la agenda
  const { mascotaId, mascotaNombre } = route.params || { mascotaId: 1, mascotaNombre: 'Mascota' };
  
  const [historial, setHistorial] = useState([]);
  const [nuevaObservacion, setNuevaObservacion] = useState('');
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Cargar el historial clínico previo de la mascota
  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/fichas-medicas/mascota/${mascotaId}`);
      if (response.ok) {
        const data = await response.json();
        setHistorial(data);
      } else {
        Alert.alert('Error', 'No se pudo obtener el historial clínico.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Error de conexión al cargar la ficha.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  // Guardar la nueva atención médica
  const handleGuardarConsulta = async () => {
    if (!nuevaObservacion.trim()) {
      Alert.alert('Atención', 'Por favor, escriba una observación antes de guardar.');
      return;
    }

    try {
      setGuardando(true);
      const nuevaEntrada = {
        mascotaId: mascotaId,
        fecha: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
        descripcion: nuevaObservacion,
        veterinarioId: 99 // ID del veterinario logueado
      };

      const response = await fetch('http://localhost:8080/api/fichas-medicas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaEntrada),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Consulta guardada en la ficha médica correctamente.');
        setNuevaObservacion('');
        cargarHistorial(); // Recargamos la lista para ver la nueva entrada arriba
      } else {
        Alert.alert('Error', 'No se pudo guardar la consulta en el servidor.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema de red al intentar guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const renderHistorialItem = ({ item }) => (
    <View style={styles.historialCard}>
      <View style={styles.historialHeader}>
        <Text style={styles.historialFecha}>📅 {item.fecha}</Text>
        <Text style={styles.historialVet}>Dr/a: {item.veterinarioNombre || 'Staff'}</Text>
      </View>
      <Text style={styles.historialTexto}>{item.descripcion}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ficha Médica: {mascotaNombre}</Text>
      <Text style={styles.subtitle}>Historial Clínico del Paciente</Text>

      {/* Sección para agregar nueva consulta */}
      <View style={styles.nuevaConsultaBox}>
        <Text style={styles.sectionTitle}>Nueva Evolución / Tratamiento</Text>
        <TextInput
          style={styles.textArea}
          multiline={true}
          numberOfLines={4}
          placeholder="Escriba el diagnóstico, medicamentos recetados, vacunas aplicadas o indicaciones..."
          value={nuevaObservacion}
          onChangeText={setNuevaObservacion}
        />
        <TouchableOpacity 
          style={[styles.guardarButton, guardando && { backgroundColor: '#aaa' }]} 
          onPress={handleGuardarConsulta}
          disabled={guardando}
        >
          <Text style={styles.guardarButtonText}>
            {guardando ? 'Guardando...' : 'Guardar en Ficha'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitleList}>Antecedentes Médicos</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={historial}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderHistorialItem}
          scrollEnabled={false} // Deshabilitado porque ya estamos dentro de un ScrollView general
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Esta mascota no registra consultas previas.</Text>
          }
        />
      )}
    </ScrollView>
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
  },
  nuevaConsultaBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  sectionTitleList: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#f8fafc',
    textAlignVertical: 'top', // Para que en Android el texto empiece arriba
    minHeight: 100,
  },
  guardarButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
    alignItems: 'center',
  },
  guardarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 40,
  },
  historialCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  historialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 5,
    marginBottom: 8,
  },
  historialFecha: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  historialVet: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
  },
  historialTexto: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 20,
    fontSize: 15,
    fontStyle: 'italic',
  },
});