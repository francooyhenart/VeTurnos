// NotificacionesModal.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { obtenerNotificaciones, marcarNotificacionLeida } from '../../services/api';
import { EncabezadoPersonalizado, EstadoVacio } from '../../components/ui';
import { COLORS, FONT_SIZE, SPACING } from '../../constants';

const NotificacionesModal = ({ navigation }) => {
    const { usuario } = useAuth();
    const [lista, setLista] = useState([]);
    const [cargando, setCargando] = useState(true);

    const cargarAlertas = useCallback(async () => {
        if (!usuario?.id) return;
        try {
        const data = await obtenerNotificaciones(usuario.id);
        setLista(data);
        } catch (_) {
        // Manejo silencioso de errores de red
        } finally {
        setCargando(false);
        }
    }, [usuario?.id]);

    useEffect(() => {
        cargarAlertas();
    }, [cargarAlertas]);

    const alPresionarNotificacion = async (id, leido) => {
        if (leido) return; // Si ya está leída, no hace falta pegarle al back
        try {
        await marcarNotificacionLeida(id);
        // Actualizamos el estado local para que el puntito azul se apague al toque
        setLista((prev) =>
            prev.map((n) => (n.id === id ? { ...n, leido: true } : n))
        );
        } catch (_) {
        // Falla silenciosa
        }
    };

    if (cargando) {
        return (
        <SafeAreaView style={estilos.safeArea}>
            <View style={estilos.centrado}><ActivityIndicator size="large" color="#A3E1FC" /></View>
        </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={estilos.safeArea}>
        <EncabezadoPersonalizado onVolver={() => navigation.goBack()} titulo="Notificaciones" estilo={estilos.encabezado} />
        
        <FlatList
            data={lista}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={estilos.listaContainer}
            ListEmptyComponent={<EstadoVacio mensaje="No tenés notificaciones pendientes de revisión." />}
            renderItem={({ item }) => (
            <TouchableOpacity
                style={[estilos.tarjeta, !item.leido && estilos.tarjetaNoLeida]}
                onPress={() => alPresionarNotificacion(item.id, item.leido)}
                activeOpacity={0.8}
            >
                <View style={estilos.filaTitulo}>
                <Text style={estilos.itemTitulo}>{item.getTitulo || item.titulo}</Text>
                {!item.leido && <View style={estilos.puntitoAzul} />}
                </View>
                <Text style={estilos.itemMensaje}>{item.mensaje}</Text>
                <Text style={estilos.itemFecha}>
                {new Date(item.fechaHoraCreacion).toLocaleDateString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </TouchableOpacity>
            )}
        />
        </SafeAreaView>
    );
};

const estilos = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#143343' },
    encabezado: { backgroundColor: '#143343' },
    centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listaContainer: { padding: SPACING.md, gap: SPACING.sm },
    tarjeta: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: '#E3E3E3',
    },
    tarjetaNoLeida: {
        backgroundColor: '#F0F9FF', // Fondo celeste hiper sutil para destacar las no leídas
        borderColor: '#A3E1FC',
    },
    filaTitulo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    itemTitulo: { fontSize: FONT_SIZE.md, fontWeight: '700', color: '#143343' },
    puntitoAzul: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1E88E5' },
    itemMensaje: { fontSize: FONT_SIZE.sm, color: '#4A4A4A', marginBottom: SPACING.xs, lineHeight: 18 },
    itemFecha: { fontSize: 11, color: '#9E9E9E', textAlign: 'right' },
});

export default NotificacionesModal;