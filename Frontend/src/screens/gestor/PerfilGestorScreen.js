import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { BotonPrimario } from '../../components/ui';
import { FONT_SIZE, SPACING } from '../../constants';

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

      {/* Menú reducido únicamente a cerrar sesión */}
      <View style={estilos.menu}>
        <BotonPrimario
          titulo="Cerrar sesión"
          onPress={manejarCerrarSesion}
          estilo={estilos.botonCerrarSesion}
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
  },
  botonCerrarSesion: {
    backgroundColor: '#90C7A1',
  },
});

export default PerfilGestorScreen;