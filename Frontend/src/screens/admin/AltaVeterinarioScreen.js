import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';

export default function AltaVeterinarioScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const stringEmail = ''; // Usamos estado para controlar los campos
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const constraseniaFija = '123456'; // Contraseña por defecto que le asigna el Admin
  const [matricula, setMatricula] = useState('');
  const [especialidad, setEspecialidad] = useState('');

  const handleAlta = async () => {
    // Validación básica de campos obligatorios
    if (!nombre || !dni || !email || !matricula) {
      Alert.alert('Error', 'Por favor, completá los campos obligatorios (*)');
      return;
    }

    const nuevoVeterinario = {
      nombreCompleto: nombre,
      dni: dni,
      email: email,
      password: constraseniaFija,
      telefono: telefono,
      rol: 'VETERINARIO',
      matricula: matricula,
      especialidad: especialidad,
      esAdministrador: false
    };

    try {
      // Reemplazar por la URL de tu API local cuando el backend esté encendido
      const response = await fetch('http://localhost:8080/api/veterinarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoVeterinario),
      });

      if (response.ok) {
        Alert.alert('Éxito', `Veterinario ${nombre} dado de alta correctamente. Clave por defecto: 123456`);
        // Limpiar el formulario
        setNombre('');
        setDni('');
        setEmail('');
        setTelefono('');
        setMatricula('');
        setEspecialidad('');
      } else {
        Alert.alert('Error', 'No se pudo registrar al profesional en el servidor.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema de conexión con el Backend.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Alta de Nuevo Veterinario</Text>
      <Text style={styles.subtitle}>Perfil Administrador</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Nombre Completo *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: Juan Pérez" 
          value={nombre} 
          onChangeText={setNombre} 
        />

        <Text style={styles.label}>DNI *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: 45678912" 
          keyboardType="numeric"
          value={dni} 
          onChangeText={setDni} 
        />

        <Text style={styles.label}>Email Institucional *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: juan.perez@vet.com" 
          keyboardType="email-address"
          autoCapitalize="none"
          value={email} 
          onChangeText={setEmail} 
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: 2215554433" 
          keyboardType="phone-pad"
          value={telefono} 
          onChangeText={setTelefono} 
        />

        <Text style={styles.label}>Nro. de Matrícula *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: MAT-4592" 
          autoCapitalize="characters"
          value={matricula} 
          onChangeText={setMatricula} 
        />

        <Text style={styles.label}>Especialidad</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: Cirugía, Clínica General" 
          value={especialidad} 
          onChangeText={setEspecialidad} 
        />

        <Text style={styles.infoText}>
          * Al crearse, el sistema le asignará la contraseña provisoria: <Text style={{fontWeight: 'bold'}}>123456</Text>
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleAlta}>
          <Text style={styles.buttonText}>Registrar Profesional</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  form: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  infoText: {
    fontSize: 13,
    color: '#888',
    marginTop: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#28a745', // Verde como el de registrar de la app
    borderRadius: 8,
    padding: 15,
    marginTop: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});