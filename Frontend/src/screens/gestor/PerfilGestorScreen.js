import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { FONT_SIZE, SPACING } from '../../constants';

// Mismo componente base que usa el menú del cliente (PerfilModal.js), para que
// los tres roles compartan la misma estética de menú.
const ItemMenu = ({ titulo, onPress, colorTexto }) => (
  <TouchableOpacity style={estilos.itemMenu} onPress={onPress} activeOpacity={0.8}>
    <Text style={[estilos.itemMenuTexto, colorTexto && { color: colorTexto }]}>{titulo}</Text>
  </TouchableOpacity>
);

const PerfilGestorScreen = ({ navigation }) => {
  const { usuario, cerrarSesion } = useAuth();
  const nombre = usuario?.nombreCompleto || 'Gestor';
  const inicial = nombre[0]?.toUpperCase();

  const manejarCerrarSesion = async () => {
    await cerrarSesion();
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={estilos.safeArea}>
      <TouchableOpacity
        style={estilos.cerrar}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={estilos.cerrarTexto}>✕</Text>
      </TouchableOpacity>

      {/* Avatar del Gestor */}
      <View style={estilos.avatarContenedor}>
        <View style={estilos.avatar}>
          <Text style={estilos.avatarInicial}>{inicial}</Text>
        </View>
        <Text style={estilos.nombreUsuario}>{nombre}</Text>
      </View>

      <View style={estilos.menu}>
        <ItemMenu
          titulo="Configuración"
          onPress={() => Alert.alert('Configuración', 'Próximamente')}
        />
        <ItemMenu
          titulo="Ayuda"
          onPress={() => Alert.alert('Ayuda', 'Contacto: manager@test.com')}
        />
        <ItemMenu
          titulo="Cerrar sesión"
          onPress={manejarCerrarSesion}
          colorTexto="#B91C1C"
        />
      </View>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#143343',
    paddingHorizontal: SPACING.xl,
  },
  cerrar: {
    alignSelf: 'flex-end',
    marginTop: SPACING.lg,
    padding: SPACING.sm,
  },
  cerrarTexto: {
    fontSize: FONT_SIZE.xl,
    color: '#FFFFFF',
  },
  avatarContenedor: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#90C7A1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInicial: {
    fontSize: 52,
    fontWeight: '700',
    color: '#143343',
  },
  nombreUsuario: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  menu: {
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  itemMenu: {
    backgroundColor: '#E3E3E3',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minHeight: 52,
    justifyContent: 'center',
  },
  itemMenuTexto: {
    fontSize: FONT_SIZE.md,
    color: '#1F1F1F',
    fontWeight: '700',
  },
});

export default PerfilGestorScreen;