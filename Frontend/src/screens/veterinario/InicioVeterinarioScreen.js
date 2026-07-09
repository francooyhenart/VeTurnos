// InicioVeterinarioScreen.js - Dashboard del Veterinario (Punto 3)
import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { FONT_SIZE, SPACING, SHADOWS } from '../../constants';

const TarjetaAccion = ({ titulo, icono, onPress }) => (
  <TouchableOpacity
    style={estilos.tarjetaAccion}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
  >
    <Text style={estilos.iconoTarjeta}>{icono}</Text>
    <Text style={estilos.tarjetaAccionTexto}>{titulo}</Text>
  </TouchableOpacity>
);

const InicioVeterinarioScreen = ({ navigation }) => {
  const { usuario } = useAuth();
  const nombre = usuario?.nombreCompleto?.split(' ')[0] || 'Doctor/a';

  return (
    <SafeAreaView style={estilos.safeArea}>
      {/* Encabezado */}
      <View style={estilos.encabezado}>
        <Text style={estilos.saludo}>Hola, {nombre}</Text>
        <TouchableOpacity
          style={estilos.avatarBoton}
          onPress={() => navigation.navigate('PerfilModal')}
          accessibilityLabel="Abrir perfil"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={estilos.avatar}>
            <Text style={estilos.avatarInicial}>{nombre[0]?.toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      <ScrollView contentContainerStyle={estilos.scroll}>
        <Text style={estilos.subtitulo}>Panel del Veterinario</Text>

        <TarjetaAccion
          titulo="Mi Agenda Diaria"
          icono="📋"
          onPress={() => navigation.navigate('AgendaAdmin')}
        />
        <TarjetaAccion
          titulo="Buscador de Historiales"
          icono="🔍"
          onPress={() => navigation.navigate('BuscadorPacientes')}
        />
        <TarjetaAccion
          titulo="Programar Nuevo Turno"
          icono="🗓️"
          onPress={() => navigation.navigate('CargarTurnoVeterinario')}
        />
      </ScrollView>
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
    paddingTop: SPACING.xl,
  },
  saludo: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarBoton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3E3E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInicial: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#143343',
  },
  scroll: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  subtitulo: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: '#A3E1FC',
    marginBottom: SPACING.md,
  },
  tarjetaAccion: {
    backgroundColor: '#90C7A1',
    borderRadius: 12,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    ...SHADOWS.sm,
  },
  iconoTarjeta: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  tarjetaAccionTexto: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#143343',
    textAlign: 'center',
  },
});

export default InicioVeterinarioScreen;
