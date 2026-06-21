import React, { useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image, // 🚀 Importamos Image para renderizar la foto nativa capturada
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
        {/* 🚀 Validación E2: Si tiene foto Base64 renderiza la imagen, sino el Emoji nativo */}
        {mascota.foto ? (
          <Image 
            source={{ uri: `data:image/jpeg;base64,${mascota.foto}` }} 
            style={estilos.fotoMascotaReal} 
          />
        ) : (
          <Text style={estilos.iconoMascotaTexto}>
            {mascota.especie === 'PERRO' ? '🐶' :
             mascota.especie === 'GATO' ? '🐱' :
             mascota.especie === 'AVE' ? '🐦' : '🐾'}
          </Text>
        )}
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
    backgroundColor: '#143343', 
  },
  encabezado: {
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
    color: '#FFFFFF', 
  },
  tituloContenedor: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  titulo: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: '#FFFFFF', 
    textAlign: 'center',
  },
  lista: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
    gap: SPACING.sm,
  },
  itemMascota: {
    marginBottom: 0,
    backgroundColor: '#90C7A1', 
    borderRadius: 12,
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
    backgroundColor: '#FFFFFF', 
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // 🚀 Clave para que la foto no tape las esquinas redondeadas
  },
  fotoMascotaReal: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  iconoMascotaTexto: {
    fontSize: 28,
  },
  infoMascota: {
    flex: 1,
  },
  nombreMascota: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#1F1F1F', 
  },
  detalleMascota: {
    fontSize: FONT_SIZE.sm,
    color: '#3A4D40', 
    marginTop: 2,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#90C7A1', 
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  fabTexto: {
    fontSize: 32,
    color: '#143343', 
    fontWeight: 'bold',
    lineHeight: 34,
  },
});

export default MascotasScreen;