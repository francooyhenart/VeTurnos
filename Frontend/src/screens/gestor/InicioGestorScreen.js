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
import { BotonPrimario } from '../../components/ui';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

const TarjetaAccion = ({ titulo, onPress, icono }) => (
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

const InicioGestorScreen = ({ navigation }) => {
  const { usuario } = useAuth();
  const nombre = usuario?.nombreCompleto?.split(' ')[0] || 'Gestor';

  return (
    <SafeAreaView style={estilos.safeArea}>
      {/* Encabezado */}
      <View style={estilos.encabezado}>
        <Text style={estilos.saludo}>Hola, {nombre}</Text>
        <TouchableOpacity
          style={estilos.avatarBoton}
          onPress={() => navigation.navigate('PerfilGestor')} 
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
        <Text style={estilos.subtitulo}>Panel de Gestión</Text>

        <TarjetaAccion
          titulo="Gestionar Veterinarios"
          icono="👨‍⚕️"
          onPress={() => navigation.navigate('GestionVeterinarios')}
        />
        <TarjetaAccion
          titulo="Agregar Veterinario"
          icono="➕"
          onPress={() => navigation.navigate('AltaVeterinario')}
        />
        <TarjetaAccion
          titulo="Gestionar Sedes"
          icono="🏥"
          onPress={() => navigation.navigate('ListadoSedes')}
        />
        <TarjetaAccion
          titulo="Agregar Sede"
          icono="➕"
          onPress={() => navigation.navigate('NuevaSede')}
        />
        <TarjetaAccion
          titulo="Agenda del Día"
          icono="📋"
          onPress={() => navigation.navigate('AgendaAdmin')}
        />
        <TarjetaAccion
          titulo="Ver Agenda por Veterinario"
          icono="📅"
          onPress={() => navigation.navigate('AgendaGestor')}
        />
        <TarjetaAccion
          titulo="Ver Estadísticas"
          icono="📊"
          onPress={() => navigation.navigate('Estadisticas')}
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
    color: '#1F1F1F',
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

export default InicioGestorScreen;