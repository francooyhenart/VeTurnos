// src/screens/cliente/MascotasScreen.js
import React, { useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useMascotas } from '../../hooks/index';
import {
  CargandoPantalla,
  EstadoVacio,
  AlertaError,
  Tarjeta,
} from '../../components/ui';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

const ItemMascota = ({ mascota, onPress }) => (
  <Tarjeta onPress={onPress} estilo={estilos.itemMascota}>
    <View style={estilos.itemMascotaContenido}>
      <View style={estilos.iconoMascota}>
        <Text style={estilos.iconoMascotaTexto}>
          {mascota.especie === 'PERRO' ? '🐶' :
           mascota.especie === 'GATO' ? '🐱' :
           mascota.especie === 'AVE' ? '🐦' : '🐾'}
        </Text>
      </View>
      <View style={estilos.infoMascota}>
        <Text style={estilos.nombreMascota}>{mascota.nombre}</Text>
        <Text style={estilos.detalleMascota}>
          {mascota.especie.charAt(0) + mascota.especie.slice(1).toLowerCase()}
          {mascota.raza ? ` - ${mascota.raza}` : ''}
        </Text>
      </View>
    </View>
  </Tarjeta>
);

const MascotasScreen = ({ navigation }) => {
  const { usuario } = useAuth();
  const { mascotas, cargando, error, cargarMascotas } = useMascotas(usuario?.id);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarMascotas);
    return unsubscribe;
  }, [navigation, cargarMascotas]);

  if (cargando) return <CargandoPantalla />;

  return (
    <SafeAreaView style={estilos.safeArea}>
      {/* Encabezado */}
      <View style={estilos.encabezado}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={estilos.botonVolver}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={estilos.flechaTexto}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={estilos.tituloContenedor}>
        <Text style={estilos.titulo}>Mis mascotas</Text>
      </View>

      {error && <AlertaError mensaje={error} estilo={{ margin: SPACING.md }} />}

      <FlatList
        data={mascotas}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ItemMascota mascota={item} onPress={() => {}} />
        )}
        contentContainerStyle={estilos.lista}
        ListEmptyComponent={
          <EstadoVacio mensaje="No tenés mascotas registradas aún." />
        }
      />

      {/* FAB - Agregar mascota */}
      <TouchableOpacity
        style={estilos.fab}
        onPress={() => navigation.navigate('NuevaMascota')}
        accessibilityLabel="Agregar nueva mascota"
        activeOpacity={0.9}
      >
        <Text style={estilos.fabTexto}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  encabezado: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  botonVolver: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  flechaTexto: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
  },
  tituloContenedor: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  titulo: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  lista: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
    gap: SPACING.sm,
  },
  itemMascota: {
    marginBottom: 0,
  },
  itemMascotaContenido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconoMascota: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoMascotaTexto: {
    fontSize: 28,
  },
  infoMascota: {
    flex: 1,
  },
  nombreMascota: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  detalleMascota: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  fabTexto: {
    fontSize: 28,
    color: COLORS.textInverse,
    fontWeight: '300',
    lineHeight: 32,
  },
});

export default MascotasScreen;
