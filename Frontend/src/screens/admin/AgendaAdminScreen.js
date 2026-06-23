import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
// 🚀 E2: Importamos guardarObservacionesClinicas con su nombre correcto
import { obtenerAgenda, registrarAsistencia, guardarObservacionesClinicas } from '../../services/api';
import {
  CargandoPantalla,
  EstadoVacio,
  AlertaError,
  BotonPrimario,
} from '../../components/ui';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants';

const addDias = (fecha, dias) => {
  const nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() + dias);
  return nueva;
};

const formatearFecha = (fecha) =>
  fecha.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

const formatearHoraRango = (fechaHoraStr, duracionMinutos = 30) => {
  if (!fechaHoraStr) return '';
  const inicio = new Date(fechaHoraStr);
  const fin = new Date(inicio.getTime() + (duracionMinutos || 30) * 60000);

  const formato = (d) => d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `De ${formato(inicio)} a ${formato(fin)}`;
};

const ItemAgenda = ({ reserva, onMarcar, onAbrirConsulta }) => {
  const completado = reserva.estado === 'COMPLETADO' || reserva.estado === 'ASISTIDO';

  return (
    <TouchableOpacity 
      style={estilos.itemTurno} 
      onPress={() => onAbrirConsulta(reserva)}
      activeOpacity={0.8}
    >
      <View style={estilos.infoContenedor}>
        <Text style={estilos.itemHora}>
          {formatearHoraRango(reserva.fechaHora, reserva.duracionMinutos)}
        </Text>
        <Text style={estilos.itemNombre}>Cliente: {reserva.nombreCliente}</Text>
        <Text style={estilos.itemMascota}>Paciente: {reserva.nombreMascota}</Text>
        {reserva.observaciones && (
          <Text style={estilos.itemFichaStatus}>📝 Ficha Médica Registrada</Text>
        )}
      </View>

      <TouchableOpacity
        style={[estilos.checkBoton, completado && estilos.checkBotonActivo]}
        onPress={() => onMarcar(reserva)}
        disabled={completado}
        accessibilityLabel={completado ? 'Asistencia registrada' : 'Marcar asistencia'}
        accessibilityRole="button"
      >
        <Text style={[estilos.checkTexto, completado && estilos.checkBotonActivo]}></Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const AgendaAdminScreen = ({ navigation }) => {
  const { usuario } = useAuth();
  const [fecha, setFecha] = useState(new Date());
  const [agenda, setAgenda] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // 🚀 E2: Estados en español para el modal de evolución clínica
  const [modalVisible, setModalVisible] = useState(false);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [guardandoFicha, setGuardandoFicha] = useState(false);

  const cargarAgenda = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const fechaStr = fecha.toISOString().split('T')[0];
      const data = await obtenerAgenda(fechaStr);
      const filtrados = data.filter((r) => r.estado !== 'CANCELADO');
      filtrados.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
      setAgenda(filtrados);
    } catch (e) {
      setError(e.message || 'Error al cargar la agenda.');
    } finally {
      setCargando(false);
    }
  }, [fecha]);

  useEffect(() => {
    cargarAgenda();
  }, [cargarAgenda]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarAgenda);
    return unsubscribe;
  }, [navigation, cargarAgenda]);

  const manejarMarcar = async (reserva) => {
    const nuevoEstado = reserva.estado === 'PENDIENTE' ? 'ASISTIDO' : 'COMPLETADO';
    try {
      await registrarAsistencia(reserva.id, nuevoEstado);
      await cargarAgenda();
    } catch (e) {
      setError(e.message || 'Error al actualizar el estado.');
    }
  };

  const manejarAbrirConsulta = (reserva) => {
    setTurnoSeleccionado(reserva);
    setObservaciones(reserva.observaciones || '');
    setModalVisible(true);
  };

  const manejarGuardarFicha = async () => {
    if (!observaciones.trim()) {
      Alert.alert('Datos obligatorios', 'Por favor, ingresá las anotaciones del diagnóstico antes de guardar.');
      return;
    }

    setGuardandoFicha(true);
    try {
      // ✅ Sincronizado con el nombre correcto de la API
      await guardarObservacionesClinicas(turnoSeleccionado.id, { observaciones: observaciones.trim() });
      
      if (turnoSeleccionado.estado === 'PENDIENTE') {
        await registrarAsistencia(turnoSeleccionado.id, 'COMPLETADO');
      }

      setModalVisible(false);
      Alert.alert('Éxito', 'Ficha clínica guardada y sincronizada correctamente.');
      await cargarAgenda();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo salvar el expediente médico.');
    } finally {
      setGuardandoFicha(false);
    }
  };

  const nombre = usuario?.nombreCompleto?.split(' ')[0] || 'Admin';

  return (
    <SafeAreaView style={estilos.safeArea}>
      <View style={estilos.encabezado}>
        <View>
          <Text style={estilos.saludo}>Hola, {nombre}</Text>
          <Text style={estilos.subSaludo}>Panel de Control General</Text>
        </View>
        <TouchableOpacity
          style={estilos.avatarBoton}
          onPress={() => navigation.navigate('PerfilModal')}
          accessibilityLabel="Abrir perfil"
        >
          <View style={estilos.avatar}>
            <Text style={estilos.avatarInicial}>{nombre[0]?.toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 🚀 PANEL DE ACCESOS RÁPIDOS - Sincronizado exactamente con las rutas del Index */}
      <View style={estilos.panelAdminContenedor}>
        <TouchableOpacity 
          style={estilos.adminCardBoton}
          onPress={() => navigation.navigate('AltaVeterinario')}
        >
          <Text style={estilos.adminBotonIcono}>➕🥼</Text>
          <Text style={estilos.adminBotonTexto}>Alta Profesional</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={estilos.adminCardBoton}
          onPress={() => navigation.navigate('ListaVeterinarios')}
        >
          <Text style={estilos.adminBotonIcono}>📋🩺</Text>
          <Text style={estilos.adminBotonTexto}>Cartilla Médica</Text>
        </TouchableOpacity>
      </View>

      <View style={estilos.contenido}>
        <Text style={estilos.seccionTitulo}>Agenda de Turnos</Text>

        <View style={estilos.fechaNavegador}>
          <TouchableOpacity
            onPress={() => setFecha((f) => addDias(f, -1))}
            style={estilos.fechaBoton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={estilos.fechaFlecha}>‹</Text>
          </TouchableOpacity>
          <Text style={estilos.fechaTexto}>{formatearFecha(fecha)}</Text>
          <TouchableOpacity
            onPress={() => setFecha((f) => addDias(f, 1))}
            style={estilos.fechaBoton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={estilos.fechaFlecha}>›</Text>
          </TouchableOpacity>
        </View>

        {!!error && <AlertaError mensaje={error} style={{ marginBottom: SPACING.md }} />}

        {cargando ? (
          <CargandoPantalla />
        ) : (
          <FlatList
            data={agenda}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <ItemAgenda 
                reserva={item} 
                onMarcar={manejarMarcar} 
                onAbrirConsulta={manejarAbrirConsulta}
              />
            )}
            contentContainerStyle={estilos.lista}
            ListEmptyComponent={
              <EstadoVacio mensaje="No hay turnos programados para este día." />
            }
          />
        )}
      </View>

      <TouchableOpacity
        style={estilos.botonFlotante}
        onPress={() => navigation.navigate('CrearTurnoAdmin')}
        accessibilityLabel="Cargar turno nuevo"
      >
        <Text style={estilos.botonFlotanteTexto}>+</Text>
      </TouchableOpacity>

      {/* 🚀 MODAL NATIVO PARA REGISTRO DE FICHA MÉDICA */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={estilos.modalCentrado}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, width: '100%' }}
          >
            <View style={estilos.modalContenedor}>
              <View style={estilos.modalEncabezado}>
                <Text style={estilos.modalTitulo}>Ficha Clínica</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={estilos.modalCerrarIcono}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={estilos.modalScroll} keyboardShouldPersistTaps="handled">
                {turnoSeleccionado && (
                  <View style={estilos.modalMetaInfo}>
                    <Text style={estilos.metaTexto}><Text style={estilos.negrita}>Paciente:</Text> {turnoSeleccionado.nombreMascota}</Text>
                    <Text style={estilos.metaTexto}><Text style={estilos.negrita}>Dueño:</Text> {turnoSeleccionado.nombreCliente}</Text>
                    <Text style={estilos.metaTexto}><Text style={estilos.negrita}>Motivo:</Text> {turnoSeleccionado.motivo || 'Consulta General'}</Text>
                  </View>
                )}

                <Text style={estilos.labelInput}>Observaciones y Tratamiento:</Text>
                <TextInput
                  style={estilos.textAreaInput}
                  multiline={true}
                  numberOfLines={6}
                  placeholder="Escribí acá la evolución, diagnóstico clínico y medicamentos recetados..."
                  placeholderTextColor="#777777"
                  value={observaciones}
                  onChangeText={setObservaciones} // ✅ Corregido a español
                />

                <BotonPrimario
                  titulo="Guardar Historial Clínico"
                  onPress={manejarGuardarFicha}
                  cargando={guardandoFicha}
                  estilo={estilos.modalGuardarBoton}
                />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#143343' },
  encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#143343', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, paddingTop: Platform.OS === 'ios' ? SPACING.md : SPACING.xl },
  saludo: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: '#FFFFFF' },
  subSaludo: { fontSize: 12, color: '#90C7A1', fontWeight: '500', marginTop: 2 },
  panelAdminContenedor: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  adminCardBoton: { backgroundColor: '#E3E3E3', borderRadius: 12, padding: 12, width: '48%', alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  adminBotonIcono: { fontSize: 22, marginBottom: 4 },
  adminBotonTexto: { fontSize: 13, fontWeight: '700', color: '#143343' },
  avatarBoton: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E3E3E3', alignItems: 'center', justifyContent: 'center' },
  avatarInicial: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: '#143343' },
  contenido: { flex: 1, padding: SPACING.lg },
  seccionTitulo: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: '#FFFFFF', textAlign: 'left', marginBottom: SPACING.sm },
  fechaNavegador: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#E3E3E3', borderRadius: 8, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, marginBottom: SPACING.md, minHeight: 52 },
  fechaBoton: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  fechaFlecha: { fontSize: 28, color: '#1F1F1F', fontWeight: '400' },
  fechaTexto: { fontSize: FONT_SIZE.md, fontWeight: '700', color: '#1F1F1F' },
  lista: { paddingBottom: SPACING.xl },
  itemTurno: { backgroundColor: '#E3E3E3', borderRadius: 12, paddingVertical: 12, paddingHorizontal: SPACING.md, marginVertical: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoContenedor: { flex: 1, paddingRight: SPACING.sm },
  itemHora: { fontSize: FONT_SIZE.md, fontWeight: '700', color: '#143343' },
  itemNombre: { fontSize: FONT_SIZE.sm, color: '#1F1F1F', fontWeight: '500', marginTop: 1 },
  itemMascota: { fontSize: FONT_SIZE.sm, color: '#555555', marginTop: 1 },
  itemFichaStatus: { fontSize: 12, color: '#3A4D40', fontWeight: '700', marginTop: 4 },
  checkBoton: { width: 44, height: 44, borderRadius: 8, borderWidth: 1.5, borderColor: '#143343', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  checkBotonActivo: { backgroundColor: '#90C7A1', borderColor: '#90C7A1' },
  checkTexto: { fontSize: 20, color: '#143343', fontWeight: '700' },
  checkTextoActivo: { color: '#143343' },
  botonFlotante: { position: 'absolute', bottom: SPACING.lg, right: SPACING.lg, backgroundColor: '#90C7A1', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  botonFlotanteTexto: { color: '#143343', fontSize: 32, fontWeight: '400', lineHeight: 32, marginBottom: 4 },
  modalCentrado: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContenedor: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: SPACING.lg, height: '75%' },
  modalEncabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E3E3E3', paddingBottom: SPACING.sm, marginBottom: SPACING.md },
  modalTitulo: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: '#143343' },
  modalCerrarIcono: { fontSize: 20, color: '#647D8B', padding: 4 },
  modalScroll: { flex: 1 },
  modalMetaInfo: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: SPACING.md, marginBottom: SPACING.md },
  metaTexto: { fontSize: FONT_SIZE.sm, color: '#1F1F1F', marginBottom: 2 },
  negrita: { fontWeight: '700', color: '#143343' },
  labelInput: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: '#143343', marginBottom: SPACING.xs },
  textAreaInput: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#647D8B', borderRadius: 8, padding: SPACING.md, fontSize: FONT_SIZE.sm, color: '#1F1F1F', minHeight: 120, textAlignVertical: 'top', marginBottom: SPACING.lg },
  modalGuardarBoton: { backgroundColor: '#90C7A1', marginBottom: SPACING.xl },
});

export default AgendaAdminScreen;