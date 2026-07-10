import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { obtenerHistorialClinico } from '../../services/api';
import { CargandoPantalla, EstadoVacio, AlertaError, Tarjeta } from '../../components/ui';
import { FONT_SIZE, SPACING, SHADOWS } from '../../constants';

// Mismo helper que en MascotasScreen (podrías moverlo a un util compartido)
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

const iconoPorEspecie = (especie) =>
    especie === 'PERRO' ? '🐶' : especie === 'GATO' ? '🐱' : especie === 'AVE' ? '🐦' : '🐾';

const formatearFechaHora = (fechaHoraStr) => {
    try {
        const fecha = new Date(fechaHoraStr);
        return fecha.toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (_) {
        return fechaHoraStr;
    }
};

const ItemHistorial = ({ item }) => (
    <Tarjeta estilo={estilos.itemHistorial}>
        <Text style={estilos.itemFecha}>{formatearFechaHora(item.fechaHora)}</Text>
        <Text style={estilos.itemVetSede}>
            {item.nombreVeterinario ? `Dr/a. ${item.nombreVeterinario}` : 'Veterinario no asignado'}
            {item.nombreSede ? `  ·  ${item.nombreSede}` : ''}
        </Text>
        <Text style={estilos.itemObs}>
            {item.observacionesClinicas?.trim() ? item.observacionesClinicas : 'Sin observaciones cargadas.'}
        </Text>
    </Tarjeta>
);

const DetalleMascotaScreen = ({ navigation, route }) => {
    // Recibimos la mascota completa (ver cambio en MascotasScreen) para no
    // pegarle de nuevo al backend solo para mostrar el encabezado.
    const { mascota } = route?.params ?? {};

    const [historial, setHistorial] = useState([]);
    const [cargandoHistorial, setCargandoHistorial] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let activo = true;

        const cargarHistorial = async () => {
            if (!mascota?.id) {
                setCargandoHistorial(false);
                return;
            }
            setCargandoHistorial(true);
            setError(null);
            try {
                const data = await obtenerHistorialClinico(mascota.id);
                if (activo) setHistorial(data);
            } catch (e) {
                if (activo) setError(e.message);
            } finally {
                if (activo) setCargandoHistorial(false);
            }
        };

        cargarHistorial();
        return () => {
            activo = false;
        };
    }, [mascota?.id]);

    if (!mascota) {
        return (
            <SafeAreaView style={estilos.safeArea}>
                <EstadoVacio mensaje="No se encontró la mascota." />
            </SafeAreaView>
        );
    }

    const fotoUri = obtenerFotoMascota(mascota.foto);

    return (
        <SafeAreaView style={estilos.safeArea}>
            <View style={estilos.encabezado}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={estilos.botonVolver}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={estilos.flechaTexto}>←</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={historial}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => <ItemHistorial item={item} />}
                contentContainerStyle={estilos.lista}
                ListHeaderComponent={
                    <>
                        <View style={estilos.perfilContenedor}>
                            {fotoUri ? (
                                <Image source={{ uri: fotoUri }} style={estilos.fotoMascota} />
                            ) : (
                                <View style={estilos.iconoMascota}>
                                    <Text style={estilos.iconoMascotaTexto}>{iconoPorEspecie(mascota.especie)}</Text>
                                </View>
                            )}
                            <Text style={estilos.nombreMascota}>{mascota.nombre}</Text>
                            <Text style={estilos.detalleMascota}>
                                {mascota.especie.charAt(0) + mascota.especie.slice(1).toLowerCase()}
                                {mascota.raza ? ` · ${mascota.raza}` : ''}
                                {mascota.edad != null ? ` · ${mascota.edad} años` : ''}
                            </Text>
                            {mascota.nombreDueño && (
                                <Text style={estilos.dueñoTexto}>
                                    Dueño/a: {mascota.nombreDueño}
                                    {mascota.dniDueño ? ` (DNI ${mascota.dniDueño})` : ''}
                                </Text>
                            )}
                        </View>

                        <Text style={estilos.historialTitulo}>Historial clínico</Text>

                        {error && (
                            <AlertaError mensaje={error} estilo={{ marginHorizontal: SPACING.lg, marginBottom: SPACING.sm }} />
                        )}
                        {cargandoHistorial && (
                            <View style={estilos.cargandoInline}>
                                <ActivityIndicator size="small" color="#A3E1FC" />
                            </View>
                        )}
                    </>
                }
                ListEmptyComponent={
                    !cargandoHistorial ? (
                        <EstadoVacio mensaje="Todavía no hay turnos completados con diagnóstico cargado." />
                    ) : null
                }
            />
        </SafeAreaView>
    );
};

const estilos = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#143343' },
    encabezado: {
        backgroundColor: '#143343',
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.sm,
    },
    botonVolver: {
        minWidth: 48,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
    },
    flechaTexto: { fontSize: FONT_SIZE.xl, color: '#FFFFFF' },
    perfilContenedor: {
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.lg,
    },
    fotoMascota: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#FFFFFF',
        marginBottom: SPACING.sm,
    },
    iconoMascota: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    iconoMascotaTexto: { fontSize: 48 },
    nombreMascota: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    detalleMascota: {
        fontSize: FONT_SIZE.md,
        color: '#A3E1FC',
        marginTop: 4,
        textAlign: 'center',
    },
    dueñoTexto: {
        fontSize: FONT_SIZE.sm,
        color: '#D1D5DB',
        marginTop: SPACING.xs,
        textAlign: 'center',
    },
    historialTitulo: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: '#FFFFFF',
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.sm,
    },
    cargandoInline: {
        paddingVertical: SPACING.lg,
        alignItems: 'center',
    },
    lista: {
        paddingBottom: SPACING.xl,
    },
    itemHistorial: {
        marginHorizontal: SPACING.lg,
        backgroundColor: '#90C7A1',
        borderRadius: 12,
        ...SHADOWS.sm,
    },
    itemFecha: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '700',
        color: '#143343',
    },
    itemVetSede: {
        fontSize: FONT_SIZE.sm,
        color: '#3A4D40',
        marginTop: 2,
        fontWeight: '500',
    },
    itemObs: {
        fontSize: FONT_SIZE.sm,
        color: '#1F1F1F',
        marginTop: SPACING.xs,
    },
});

export default DetalleMascotaScreen;