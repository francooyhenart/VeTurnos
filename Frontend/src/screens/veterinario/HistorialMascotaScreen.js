import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, Alert } from 'react-native';

export default function HistorialMascotaScreen({ route, navigation }) {
  // Recibimos los datos de la mascota y el ID del turno (reservaId) desde la agenda
  const { mascotaId, mascotaNombre, reservaId } = route.params || { mascotaId: 1, mascotaNombre: 'Mascota', reservaId: 1 };
  
  const [historial, setHistorial] = useState([]);
  const [nuevaObservacion, setNuevaObservacion] = useState('');
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Cargar el historial clínico previo de la mascota
  const cargarHistorial = async () => {
    try {
      setLoading(true);
      // Ajustamos el fetch para apuntar a la ruta que el grupo usa para el historial de la mascota
      const response = await fetch(`http://localhost:8080/api/fichas-medicas/mascota/${mascotaId}`);
      if (response.ok) {
        const data = await response.json();
        setHistorial(data);
      } else {
        // Si el endpoint de arriba aún no está desarrollado por completo, evitamos que rompa la pantalla
        console.log('No se pudo obtener el historial, intentando mapear registros locales.');
        setHistorial([]);
      }
    } catch (error) {
      console.error(error);
      // No bloqueamos al usuario si la red falla al listar
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [mascotaId]);

  // Guardar la nueva atención médica adaptado al Backend del grupo
  const handleGuardarConsulta = async () => {
    if (!nuevaObservacion.trim()) {
      Alert.alert('Atención', 'Por favor, escriba una observación antes de guardar.');
      return;
    }

    try {
      setGuardando(true);
      
      // Armamos el cuerpo exacto tal como lo recibe el ReservaController de tus compañeros
      const bodyBackend = {
        observaciones: nuevaObservacion
      };

      // Apuntamos al endpoint real vinculando el id del turno/reserva
      const idTurno = reservaId || 1; 

      const response = await fetch(`http://localhost:8080/api/reservas/${idTurno}/ficha-medica`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyBackend),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Ficha médica actualizada correctamente en esta consulta.');
        setNuevaObservacion('');
        cargarHistorial(); // Intenta refrescar los antecedentes médicos
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'No se pudo guardar la ficha clínica.');
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
        <Text style={styles.historialFecha}>📅 {item.fecha || 'Consulta'}</Text>
        <Text style={styles.historialVet}>Dr/a: {item.veterinarioNombre || 'Staff'}</Text>
      </View>
      <Text style={styles.historialTexto}>{item.descripcion || item.observaciones}</Text>
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
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
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
    textAlignVertical: 'top',
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