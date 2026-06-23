import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '../../constants';

export default function AgendaVeterinarioScreen({ navigation }) {
  // Datos simulados blindados para la Cartilla Médica
  const [mostrarCartilla, setMostrarCartilla] = useState(false);
  const veterinariosSimulados = [
    { id: 1, nombre: 'Maca Romero', email: 'maca@veturnos.com', matricula: 'M.P. 9999', esp: 'Cirugía General' },
    { id: 2, nombre: 'Dr. Javier Pérez', email: 'javier@veturnos.com', matricula: 'M.P. 5432', esp: 'Clínica General' },
    { id: 3, nombre: 'Dra. Clara Gomez', email: 'clara@veturnos.com', matricula: 'M.P. 6789', esp: 'Fisiatría' }
  ];

  return (
      <ScrollView style={estilos.contenedor}>
        {/* CABECERA OSCURA DE ADMINISTRACIÓN */}
        <View style={estilos.cabecera}>
          <Text style={estilos.titulo}>Panel de Control General</Text>
          <Text style={estilos.subtitulo}>CONSULTORIO VETERINARIO - MODO ADMIN</Text>

          {/* BOTONES DE GESTIÓN */}
          <View style={estilos.btonContenedor}>
            <TouchableOpacity
                style={estilos.boton}
                onPress={() => alert('¡Redirigiendo al Formulario de Alta Profesional!')}
            >
              <Text style={estilos.botonTexto}>➕ Alta Profesional</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[estilos.boton, estilos.botonVerde]}
                onPress={() => setMostrarCartilla(!mostrarCartilla)}
            >
              <Text style={estilos.botonTexto}>📋 Cartilla Médica</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CONTENIDO DINÁMICO */}
        <View style={estilos.contenido}>
          {mostrarCartilla ? (
              <View>
                <Text style={estilos.seccionTitulo}>📋 Cartilla Médica Profesional</Text>
                {veterinariosSimulados.map((vet) => (
                    <View key={vet.id} style={estilos.tarjeta}>
                      <Text style={estilos.tarjetaNombre}>{vet.nombre}</Text>
                      <Text style={estilos.tarjetaInfo}>✉️ {vet.email}</Text>
                      <Text style={estilos.tarjetaInfo}>🪪 {vet.matricula} — {vet.esp}</Text>
                    </View>
                ))}
              </View>
          ) : (
              <View style={estilos.vacioContenedor}>
                <Text style={estilos.vacioTexto}>Bienvenida al Panel. Hacé clic en "Cartilla Médica" para desplegar los profesionales simulados.</Text>
              </View>
          )}
        </View>
      </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#f8f9fa' },
  cabecera: { backgroundColor: '#1e293b', padding: SPACING.xl, alignItems: 'center', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  subtitulo: { fontSize: 12, color: '#94a3b8', letterSpacing: 1, marginBottom: SPACING.md },
  btonContenedor: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  boton: { backgroundColor: '#3b82f6', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, elevation: 2 },
  botonVerde: { backgroundColor: '#10b981' },
  botonTexto: { color: '#ffffff', fontWeight: '600', fontSize: FONT_SIZE.md },
  contenido: { padding: SPACING.md },
  seccionTitulo: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: '#1e293b', marginBottom: SPACING.md },
  tarjeta: { backgroundColor: '#ffffff', padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.sm, borderLeftWidth: 5, borderLeftColor: '#10b981', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  tarjetaNombre: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: '#1e293b' },
  tarjetaInfo: { fontSize: FONT_SIZE.md, color: '#64748b', marginTop: 2 },
  vacioContenedor: { alignItems: 'center', marginTop: 40, paddingHorizontal: SPACING.xl },
  vacioTexto: { fontSize: FONT_SIZE.md, color: '#64748b', textAlign: 'center', lineHeight: 22 }
});