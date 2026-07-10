import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
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

const obtenerFotoMascota = (foto) => {
  if (!foto) return null;
  if (typeof foto !== 'string') return null;
  if (foto.startsWith('data:') || foto.startsWith('file:') || foto.startsWith('http')) {
    return foto;
  }
  if (foto.startsWith('iVBORw0KGgo') || foto.includes('base64,')) {
    return foto;
  }
  return `data:image/jpeg;base64,${foto}`;
};

const ItemMascota = ({ mascota, onPress }) => {
  const fotoUri = obtenerFotoMascota(mascota.foto);

  return (
    <Tarjeta onPress={onPress} estilo={estilos.itemMascota}>
      <View style={estilos.itemMascotaContenido}>
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={estilos.fotoMascota} />
        ) : (
          <View style={estilos.iconoMascota}>
            <Text style={estilos.iconoMascotaTexto}>
              {mascota.especie === 'PERRO' ? '🐶' :
               mascota.especie === 'GATO' ? '🐱' :
               mascota.especie === 'AVE' ? '🐦' : '🐾'}
            </Text>
          </View>
        )}
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
};

const MascotasScreen = ({ navigation, route }) => {
  const { usuario } = useAuth();
  const { mascotas, cargando, error, cargarMascotas } = useMascotas(usuario?.id);
  const [mascotasLocal, setMascotasLocal] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarMascotas);
    return unsubscribe;
  }, [navigation, cargarMascotas]);

  useEffect(() => {
    if (route?.params?.mascotaCreada) {
      const nuevaMascota = {
        ...route.params.mascotaCreada,
        id: route.params.mascotaCreada.id ?? `local-${Date.now()}`,
      };
      setMascotasLocal((prev) => [nuevaMascota, ...prev]);
      navigation.setParams({ mascotaCreada: undefined });
    }
  }, [route?.params?.mascotaCreada, navigation]);

  const mascotasMostradas = useMemo(() => {
    if (!mascotasLocal.length) return mascotas;
    return [ ...mascotasLocal, ...mascotas ];
  }, [mascotas, mascotasLocal]);

  if (cargando) return <CargandoPantalla oscuro />;

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
        data={mascotasMostradas}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
            <ItemMascota
           mascota={item}
             onPress={() => navigation.navigate('DetalleMascota', { mascota: item })}
            />
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

// ════════════════════════════════════════════
//  ESTILOS TUNEADOS CON LOS COLORES DEL FIGMA
// ════════════════════════════════════════════
const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#143343', // 🎨 Fondo Azul Petróleo (B2 - Figma)
  },
  encabezado: {
    backgroundColor: '#143343', // 🎨 Unificado con el fondo oscuro
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
    color: '#FFFFFF', // 🎨 Flecha blanca para contrastar
  },
  tituloContenedor: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  titulo: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: '#FFFFFF', // 🎨 Título en blanco impecable
    textAlign: 'center',
  },
  lista: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
    gap: SPACING.sm,
  },
  itemMascota: {
    marginBottom: 0,
    backgroundColor: '#90C7A1', // 🎨 Tarjeta Verde Pastel
    borderRadius: 12,
  },
  itemMascotaContenido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  fotoMascota: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
  },
  iconoMascota: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF', // 🎨 Círculo blanco del avatar
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
    fontWeight: '700',
    color: '#1F1F1F', // 🎨 Texto oscuro sobre fondo claro
  },
  detalleMascota: {
    fontSize: FONT_SIZE.sm,
    color: '#3A4D40', // 🎨 Subtítulo verde oscuro
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
    backgroundColor: '#90C7A1', // 🎨 Botón flotante Verde Pastel
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  fabTexto: {
    fontSize: 32,
    color: '#143343', // 🎨 Signo "+" oscuro del color del fondo
    fontWeight: 'bold',
    lineHeight: 34,
  },
});

export default MascotasScreen;