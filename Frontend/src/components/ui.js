// Componentes reutilizables para toda la app

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  FlatList,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants';

// ─── Botón Principal ───────────────────────────────────────────
export const BotonPrimario = ({ titulo, onPress, cargando = false, deshabilitado = false, estilo }) => (
  <TouchableOpacity
    style={[estilos.botonPrimario, (deshabilitado || cargando) && estilos.botonDeshabilitado, estilo]}
    onPress={onPress}
    disabled={deshabilitado || cargando}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={titulo}
  >
    {cargando ? (
      <ActivityIndicator color={COLORS.textInverse} size="small" />
    ) : (
      <Text style={estilos.botonPrimarioTexto}>{titulo}</Text>
    )}
  </TouchableOpacity>
);

// ─── Botón Secundario (outline) ────────────────────────────────
export const BotonSecundario = ({ titulo, onPress, estilo }) => (
  <TouchableOpacity
    style={[estilos.botonSecundario, estilo]}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
  >
    <Text style={estilos.botonSecundarioTexto}>{titulo}</Text>
  </TouchableOpacity>
);

// ─── Campo de Texto ────────────────────────────────────────────
export const CampoTexto = ({
  placeholder,
  valor,
  alCambiar,
  esPassword = false,
  teclado = 'default',
  error = null,
  estilo,
  multilinea = false,
  numeroLineas = 4,
}) => {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [enfocado, setEnfocado] = useState(false);

  return (
    <View style={[estilos.campoContenedor, estilo]}>
      <View
        style={[
          estilos.campoWrapper,
          multilinea && estilos.campoWrapperMultilinea,
          enfocado && estilos.campoEnfocado,
          error && estilos.campoError,
        ]}
      >
        <TextInput
          style={[estilos.campoInput, multilinea && estilos.campoInputMultilinea]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={valor}
          onChangeText={alCambiar}
          secureTextEntry={esPassword && !mostrarPassword}
          keyboardType={teclado}
          autoCapitalize={esPassword ? 'none' : 'sentences'}
          multiline={multilinea}
          numberOfLines={multilinea ? numeroLineas : 1}
          textAlignVertical={multilinea ? 'top' : 'center'}
          onFocus={() => setEnfocado(true)}
          onBlur={() => setEnfocado(false)}
          accessibilityLabel={placeholder}
        />
        {esPassword && (
          <TouchableOpacity
            onPress={() => setMostrarPassword(!mostrarPassword)}
            style={estilos.iconoPassword}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={estilos.iconoPasswordTexto}>{mostrarPassword ? '👁' : '○'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={estilos.campoErrorTexto}>{error}</Text>}
    </View>
  );
};

// ─── Selector (Modal + FlatList propios, sin Picker nativo) ────
export const SelectorCampo = ({ placeholder, valor, alCambiar, opciones, error, estilo }) => {
  const [visible, setVisible] = useState(false);

  const opcionSeleccionada = opciones.find((op) => op.value === valor);

  // Si las opciones no traen ya una entrada "vacía", agregamos una para poder
  // volver a "sin selección" (mismo rol que cumplía el placeholder del Picker).
  const datos = opciones.some((op) => op.value === '')
    ? opciones
    : [{ label: placeholder, value: '' }, ...opciones];

  const seleccionar = (op) => {
    alCambiar(op.value);
    setVisible(false);
  };

  return (
    <View style={[estilos.campoContenedor, estilo]}>
      <TouchableOpacity
        style={[estilos.campoWrapper, estilos.selectorWrapper, visible && estilos.campoEnfocado, error && estilos.campoError]}
        onPress={() => setVisible(true)}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={placeholder}
      >
        <Text
          style={[estilos.selectorTexto, !opcionSeleccionada && estilos.selectorTextoPlaceholder]}
          numberOfLines={1}
        >
          {opcionSeleccionada ? opcionSeleccionada.label : placeholder}
        </Text>
        <Text style={estilos.selectorFlecha}>▾</Text>
      </TouchableOpacity>
      {error && <Text style={estilos.campoErrorTexto}>{error}</Text>}

      <Modal transparent animationType="fade" visible={visible} onRequestClose={() => setVisible(false)}>
        <Pressable style={estilos.modalOverlay} onPress={() => setVisible(false)}>
          <Pressable style={estilos.selectorModalContenido} onPress={() => {}}>
            <View style={estilos.selectorModalEncabezado}>
              <Text style={estilos.selectorModalTitulo} numberOfLines={1}>{placeholder}</Text>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                style={estilos.modalCerrar}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Cerrar"
              >
                <Text style={estilos.modalCerrarTexto}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={datos}
              keyExtractor={(op) => String(op.value)}
              style={estilos.selectorLista}
              ItemSeparatorComponent={() => <View style={estilos.selectorSeparador} />}
              renderItem={({ item }) => {
                const activa = item.value === valor;
                return (
                  <TouchableOpacity
                    style={[estilos.selectorOpcion, activa && estilos.selectorOpcionActiva]}
                    onPress={() => seleccionar(item)}
                    accessibilityRole="button"
                  >
                    <Text style={[estilos.selectorOpcionTexto, activa && estilos.selectorOpcionTextoActiva]}>
                      {item.label}
                    </Text>
                    {activa && <Text style={estilos.selectorOpcionCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const generarDiasDelMes = (fechaRef) => {
  const anio = fechaRef.getFullYear();
  const mes = fechaRef.getMonth();
  const primerDia = new Date(anio, mes, 1);
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const offset = (primerDia.getDay() + 6) % 7; // semana arranca en lunes

  const dias = [];
  for (let i = 0; i < offset; i++) dias.push(null);
  for (let d = 1; d <= diasEnMes; d++) dias.push(new Date(anio, mes, d));
  return dias;
};

const esMismoDia = (a, b) => !!a && !!b && a.toDateString() === b.toDateString();

// ─── Selector de Fecha (modal con calendario propio) ───────────
export const SelectorFecha = ({ valor, alCambiar, estilo }) => {
  const [visible, setVisible] = useState(false);
  const [mesVisible, setMesVisible] = useState(valor);

  const abrir = () => {
    setMesVisible(valor);
    setVisible(true);
  };

  const cambiarMes = (delta) => {
    setMesVisible((m) => {
      const nuevo = new Date(m);
      nuevo.setDate(1);
      nuevo.setMonth(nuevo.getMonth() + delta);
      return nuevo;
    });
  };

  const seleccionarDia = (dia) => {
    alCambiar(dia);
    setVisible(false);
  };

  const hoy = new Date();
  const dias = generarDiasDelMes(mesVisible);

  return (
    <>
      <TouchableOpacity
        style={[estilos.fechaSelector, estilo]}
        onPress={abrir}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Elegir fecha"
      >
        <Text style={estilos.fechaSelectorTexto}>
          {valor.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
        </Text>
        <Text style={estilos.fechaSelectorIcono}>📅</Text>
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={visible} onRequestClose={() => setVisible(false)}>
        <Pressable style={estilos.modalOverlay} onPress={() => setVisible(false)}>
          <Pressable style={estilos.calendarioContenido} onPress={() => {}}>
            <View style={estilos.calendarioEncabezado}>
              <TouchableOpacity
                onPress={() => cambiarMes(-1)}
                style={estilos.calendarioBotonMes}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Mes anterior"
              >
                <Text style={estilos.calendarioFlecha}>‹</Text>
              </TouchableOpacity>
              <Text style={estilos.calendarioMesTexto} numberOfLines={1}>
                {mesVisible.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity
                onPress={() => cambiarMes(1)}
                style={estilos.calendarioBotonMes}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Mes siguiente"
              >
                <Text style={estilos.calendarioFlecha}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={estilos.calendarioDiasSemana}>
              {DIAS_SEMANA.map((d) => (
                <Text key={d} style={estilos.calendarioDiaSemanaTexto}>{d}</Text>
              ))}
            </View>

            <View style={estilos.calendarioGrilla}>
              {dias.map((dia, i) => {
                if (!dia) return <View key={`vacio-${i}`} style={estilos.calendarioCelda} />;
                const seleccionado = esMismoDia(dia, valor);
                const esHoy = esMismoDia(dia, hoy);
                return (
                  <TouchableOpacity
                    key={dia.toISOString()}
                    style={[
                      estilos.calendarioCelda,
                      estilos.calendarioDiaBoton,
                      esHoy && !seleccionado && estilos.calendarioDiaHoy,
                      seleccionado && estilos.calendarioDiaSeleccionado,
                    ]}
                    onPress={() => seleccionarDia(dia)}
                    accessibilityRole="button"
                    accessibilityLabel={dia.toLocaleDateString('es-AR')}
                  >
                    <Text
                      style={[
                        estilos.calendarioDiaTexto,
                        seleccionado && estilos.calendarioDiaTextoSeleccionado,
                      ]}
                    >
                      {dia.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

// ─── Tarjeta genérica ───
export const Tarjeta = ({ children, estilo, onPress }) => {
  if (onPress) {
    return (
      <TouchableOpacity style={[estilos.tarjeta, estilo]} onPress={onPress} activeOpacity={0.85}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[estilos.tarjeta, estilo]}>{children}</View>;
};

// ─── Mensaje de Error / Alerta ─────────────────────────────────
export const AlertaError = ({ mensaje, estilo }) => {
  if (!mensaje) return null;
  return (
    <View style={[estilos.alerta, estilo]}>
      <Text style={estilos.alertaTexto}>{mensaje}</Text>
    </View>
  );
};

// ─── Modal de Confirmación ─────────────────────────────────────
export const ModalConfirmacion = ({ visible, titulo, descripcion, onConfirmar, onCancelar }) => (
  <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancelar}>
    <Pressable style={estilos.modalOverlay} onPress={onCancelar}>
      <Pressable style={estilos.modalContenido} onPress={() => {}}>
        <TouchableOpacity style={estilos.modalCerrar} onPress={onCancelar}>
          <Text style={estilos.modalCerrarTexto}>✕</Text>
        </TouchableOpacity>
        <Text style={estilos.modalTitulo}>{titulo}</Text>
        {descripcion && <Text style={estilos.modalDescripcion}>{descripcion}</Text>}
        <View style={estilos.modalBotones}>
          <BotonPrimario
            titulo="SÍ"
            onPress={onConfirmar}
            estilo={estilos.modalBotonSi}
          />
          <BotonSecundario
            titulo="NO"
            onPress={onCancelar}
            estilo={estilos.modalBotonNo}
          />
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

// ─── Modal de Éxito (🚀 OPTIMIZADO CON ESTILO FIGMA) ───────────
export const ModalExito = ({ visible, titulo, textBoton, onAccion }) => (
  <Modal transparent animationType="fade" visible={visible}>
    <View style={estilos.modalOverlay}>
      <View style={estilos.modalContenido}>
        <TouchableOpacity style={estilos.modalCerrar} onPress={onAccion}>
          <Text style={estilos.modalCerrarTexto}>✕</Text>
        </TouchableOpacity>
        <View style={estilos.exitoIcono}>
          <Text style={estilos.exitoCheck}>✓</Text>
        </View>
        <Text style={estilos.modalExitoTitulo}>{titulo}</Text>
        {textBoton && (
          <BotonPrimario 
            titulo={textBoton} 
            onPress={onAccion} 
            estilo={estilos.modalExitoBoton} 
          />
        )}
      </View>
    </View>
  </Modal>
);

// ─── Modal de Formulario genérico (contenido libre) ────────────
export const ModalFormulario = ({ visible, titulo, onCerrar, children }) => (
  <Modal transparent animationType="fade" visible={visible} onRequestClose={onCerrar}>
    <Pressable style={estilos.modalOverlay} onPress={onCerrar}>
      <Pressable style={estilos.modalContenidoFormulario} onPress={() => {}}>
        <TouchableOpacity style={estilos.modalCerrar} onPress={onCerrar}>
          <Text style={estilos.modalCerrarTexto}>✕</Text>
        </TouchableOpacity>
        <Text style={estilos.modalTitulo}>{titulo}</Text>
        {children}
      </Pressable>
    </Pressable>
  </Modal>
);

// ─── Cargador de pantalla completa ────────────────────────────
// `oscuro` adapta fondo/colores para pantallas con tema oscuro (#143343),
// evitando el pantallazo blanco de golpe mientras se espera una respuesta.
export const CargandoPantalla = ({ mensaje = 'cargando...', oscuro = false }) => {
  const opacidad = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacidad, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [opacidad]);

  return (
    <Animated.View
      style={[
        estilos.cargandoPantalla,
        oscuro && estilos.cargandoPantallaOscura,
        { opacity: opacidad },
      ]}
    >
      <ActivityIndicator size="large" color={oscuro ? '#A3E1FC' : COLORS.primary} />
      <Text style={[estilos.cargandoTexto, oscuro && estilos.cargandoTextoOscuro]}>{mensaje}</Text>
    </Animated.View>
  );
};

// ─── Estado vacío ─────────────────────────────────────────────
export const EstadoVacio = ({ mensaje }) => (
  <View style={estilos.estadoVacio}>
    <Text style={estilos.estadoVacioTexto}>{mensaje}</Text>
  </View>
);

// ─── Barra de navegación superior personalizada ───────────────
export const EncabezadoPersonalizado = ({ titulo, onVolver, estilo }) => (
  <View style={[estilos.encabezado, estilo]}>
    {onVolver && (
      <TouchableOpacity onPress={onVolver} style={estilos.encabezadoBotonVolver} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={estilos.encabezadoFlecha}>←</Text>
      </TouchableOpacity>
    )}
    <Text style={estilos.encabezadoTitulo}>{titulo}</Text>
  </View>
);

// ════════════════════════════════════════════
//  ESTILOS BASE
// ════════════════════════════════════════════
const estilos = StyleSheet.create({
  botonPrimario: {
    backgroundColor: COLORS.buttonPrimary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    ...SHADOWS.sm,
  },
  botonDeshabilitado: {
    backgroundColor: COLORS.buttonDisabled,
  },
  botonPrimarioTexto: {
    color: COLORS.buttonPrimaryText,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  botonSecundario: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  botonSecundarioTexto: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  campoContenedor: {
    marginBottom: SPACING.sm,
  },
  // Punto 9: borderRadius 12 y sombra sutil consistente en todos los
  // contenedores grises (inputs, selector) para una estética más moderna.
  campoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 52,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.sm,
  },
  campoEnfocado: {
    borderColor: COLORS.borderFocus,
    backgroundColor: COLORS.background,
  },
  campoWrapperMultilinea: {
    alignItems: 'flex-start',
    minHeight: 120,
    paddingVertical: SPACING.sm,
  },
  campoError: {
    borderColor: COLORS.error,
  },
  campoInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
    borderWidth: 0,
    // En web, react-native-web renderiza un <input> real que trae el
    // recuadro de foco nativo del navegador/SO; lo apagamos acá porque
    // el foco visual ya lo maneja `campoEnfocado` en el wrapper de afuera.
    outlineStyle: 'none',
  },
  campoInputMultilinea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  iconoPassword: {
    padding: SPACING.xs,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoPasswordTexto: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  campoErrorTexto: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    marginTop: 4,
    marginLeft: SPACING.xs,
  },
  selectorWrapper: {
    justifyContent: 'space-between',
    backgroundColor: '#E3E3E3',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selectorTexto: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.md,
  },
  selectorTextoPlaceholder: {
    color: COLORS.textMuted,
  },
  selectorFlecha: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    marginLeft: SPACING.sm,
  },
  // ── Modal del selector ──
  selectorModalContenido: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    width: '100%',
    maxWidth: 420,
    maxHeight: '70%',
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  selectorModalEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectorModalTitulo: {
    flex: 1,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  selectorLista: {
    flexGrow: 0,
  },
  selectorSeparador: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  // Área táctil amplia y cómoda por opción (mínimo 52px de alto)
  selectorOpcion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  selectorOpcionActiva: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  selectorOpcionTexto: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  selectorOpcionTextoActiva: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  selectorOpcionCheck: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  tarjeta: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  // ── SelectorFecha: chip disparador ──
  fechaSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E3E3E3',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 52,
    ...SHADOWS.sm,
  },
  fechaSelectorTexto: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  fechaSelectorIcono: {
    fontSize: FONT_SIZE.lg,
    marginLeft: SPACING.sm,
  },
  // ── SelectorFecha: modal de calendario ──
  // Fondo blanco explícito + minHeight fijo: sin esto, en React Native Web el
  // modal podía quedar como un rectángulo sin alto definido (contenido colapsado).
  calendarioContenido: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 380,
    minHeight: 420,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  calendarioEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  calendarioBotonMes: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarioFlecha: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  calendarioMesTexto: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#1F1F1F',
    textTransform: 'capitalize',
  },
  calendarioDiasSemana: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  calendarioDiaSemanaTexto: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: '#666666',
  },
  calendarioGrilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  // Cada celda ocupa 1/7 del ancho con una altura fija (en vez de aspectRatio,
  // que en react-native-web puede colapsar a 0 combinado con ancho en %).
  calendarioCelda: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  calendarioDiaBoton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarioDiaHoy: {
    borderWidth: 1.5,
    borderColor: '#143343',
  },
  calendarioDiaSeleccionado: {
    backgroundColor: '#90C7A1',
  },
  calendarioDiaTexto: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  calendarioDiaTextoSeleccionado: {
    color: '#143343',
    fontWeight: '800',
  },
  alerta: {
    backgroundColor: '#FDECEA',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  alertaTexto: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)', // Un poquito más oscuro el fondo para aislar la vista
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContenido: {
    backgroundColor: '#FFFFFF', // Mantenemos la tarjeta en blanco limpio
    borderRadius: 16,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  // Variante para modales con contenido de formulario (inputs a lo ancho, sin centrar)
  modalContenidoFormulario: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 420,
    ...SHADOWS.lg,
  },
  modalCerrar: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCerrarTexto: {
    fontSize: FONT_SIZE.lg,
    color: '#9CA3AF',
  },
  modalTitulo: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  /* 🚀 Título del modal de éxito en azul oscuro/petróleo */
  modalExitoTitulo: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#143343', 
    textAlign: 'center',
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  /* 🚀 Botón "Mis Turnos" en verde pastel con letras oscuras */
  modalExitoBoton: {
    backgroundColor: '#90C7A1',
    width: '70%',
    minHeight: 48,
    borderRadius: 8,
    marginTop: SPACING.xs,
  },
  modalDescripcion: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  modalBotones: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  modalBotonSi: {
    flex: 1,
    minHeight: 48,
  },
  modalBotonNo: {
    flex: 1,
    minHeight: 48,
  },
  /* 🚀 Círculo del check en gris muy clarito y estilizado */
  exitoIcono: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#F3F4F6', 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  exitoCheck: {
    fontSize: 42,
    color: '#1F1F1F', // Check negro definido
    fontWeight: '300',
  },
  cargandoPantalla: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    gap: SPACING.md,
  },
  cargandoTexto: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  cargandoPantallaOscura: {
    backgroundColor: '#143343',
  },
  cargandoTextoOscuro: {
    color: '#A3E1FC',
  },
  estadoVacio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  estadoVacioTexto: {
    fontSize: FONT_SIZE.md,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    minHeight: 64,
  },
  encabezadoBotonVolver: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  encabezadoFlecha: {
    fontSize: FONT_SIZE.xl,
    color: '#FFFFFF', 
  },
  encabezadoTitulo: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});