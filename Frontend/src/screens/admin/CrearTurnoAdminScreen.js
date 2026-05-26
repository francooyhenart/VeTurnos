// src/screens/admin/CrearTurnoAdminScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    StyleSheet,
} from 'react-native';
import api from '../../services/api'; 
import {
    SelectorCampo,
    BotonPrimario,
    AlertaError,
    ModalExito,
    EncabezadoPersonalizado,
    CampoTexto,
} from '../../components/ui';
import {
    COLORS, FONT_SIZE, SPACING, MOTIVOS, HORARIOS_DISPONIBLES,
} from '../../constants';

const DURACIONES_CIRUGIA = [
    { label: '1 Hora (2 bloques)', value: '60' },
    { label: '1 hora y media (3 bloques)', value: '90' },
    { label: '2 Horas (4 bloques)', value: '120' },
    { label: '3 Horas (6 bloques)', value: '180' },
    { label: '4 Horas (8 bloques)', value: '240' },
];

const CrearTurnoAdminScreen = ({ navigation }) => {
    const [clienteId, setClienteId] = useState('');
    const [mascotaId, setMascotaId] = useState('');
    const [motivo, setMotivo] = useState('Consulta');
    const [horario, setHorario] = useState('09:00');
    const [duracionMinutos, setDuracionMinutos] = useState('120');
    const [fechaStr, setFechaStr] = useState(new Date().toISOString().split('T')[0]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [modalExito, setModalExito] = useState(false);

    const manejarGuardarTurno = async () => {
        setError('');
        if (!clienteId.trim() || !mascotaId.trim()) {
            setError('Por favor completá los IDs de Cliente y Mascota.');
            return;
        }

        setCargando(true);

        const duracionTotal = motivo === 'Cirugia' ? parseInt(duracionMinutos, 10) : 30;

        const [h, m] = horario.split(':').map(Number);
        let fechaHoraActual = new Date(`${fechaStr}T00:00:00`);
        fechaHoraActual.setHours(h, m, 0, 0);

        const anio = fechaHoraActual.getFullYear();
        const mes = String(fechaHoraActual.getMonth() + 1).padStart(2, '0');
        const dia = String(fechaHoraActual.getDate()).padStart(2, '0');
        const horas = String(fechaHoraActual.getHours()).padStart(2, '0');
        const minutos = String(fechaHoraActual.getMinutes()).padStart(2, '0');
        
        const isoLocalStr = `${anio}-${mes}-${dia}T${horas}:${minutos}:00`;

        try {
            await api.post('/reservas', {
                clienteId: parseInt(clienteId, 10),
                mascotaId: parseInt(mascotaId, 10),
                fechaHora: isoLocalStr,
                duracionMinutos: duracionTotal
            });

            setModalExito(true);
        } catch (e) {
            setError(e.message || 'Ocurrió un error al guardar el turno.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <SafeAreaView style={estilos.safeArea}>
        <EncabezadoPersonalizado onVolver={() => navigation.goBack()} titulo="" />
        <ScrollView contentContainerStyle={estilos.scroll} keyboardShouldPersistTaps="handled">
            <Text style={estilos.titulo}>Cargar Turno (Mostrador)</Text>

            <CampoTexto
            placeholder="ID del Cliente"
            valor={clienteId}
            alCambiar={setClienteId}
            teclado="numeric"
            />

            <CampoTexto
            placeholder="ID de la Mascota"
            valor={mascotaId}
            alCambiar={setMascotaId}
            teclado="numeric"
            />

            <CampoTexto
            placeholder="Fecha (YYYY-MM-DD)"
            valor={fechaStr}
            alCambiar={setFechaStr}
            />

            <SelectorCampo
            placeholder="Motivo del Turno"
            valor={motivo}
            alCambiar={setMotivo}
            opciones={MOTIVOS}
            estilo={{ marginBottom: SPACING.sm }}
            />

            {motivo === 'Cirugia' && (
            <SelectorCampo
                placeholder="Duración estimada"
                valor={duracionMinutos}
                alCambiar={setDuracionMinutos}
                opciones={DURACIONES_CIRUGIA}
                estilo={{ marginBottom: SPACING.sm }}
            />
            )}

            <SelectorCampo
            placeholder="Horario de Inicio"
            valor={horario}
            alCambiar={setHorario}
            opciones={HORARIOS_DISPONIBLES.map(h => ({ label: h, value: h }))}
            estilo={{ marginBottom: SPACING.md }}
            />

            {!!error && <AlertaError mensaje={error} estilo={{ marginTop: SPACING.md }} />}

            <BotonPrimario
            titulo={motivo === 'Cirugia' ? "Bloquear Quirófano" : "Agendar Turno"}
            onPress={manejarGuardarTurno}
            cargando={cargando}
            estilo={{ marginTop: SPACING.lg }}
            />
        </ScrollView>

        <ModalExito
            visible={modalExito}
            titulo="¡Turno cargado con éxito!"
            textBoton="Volver a la Agenda"
            onAccion={() => {
                setModalExito(false);
                navigation.goBack();
            }}
        />
        </SafeAreaView>
    );
};

const estilos = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    scroll: { padding: SPACING.lg },
    titulo: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
});

export default CrearTurnoAdminScreen;