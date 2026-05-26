// src/components/ui.js
// Componentes reutilizables para toda la app

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
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
}) => {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [enfocado, setEnfocado] = useState(false);

  return (
    <View style={[estilos.campoContenedor, estilo]}>
      <View style={[estilos.campoWrapper, enfocado && estilos.campoEnfocado, error && estilos.campoError]}>
        <TextInput
          style={estilos.campoInput}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={valor}
          onChangeText={alCambiar}
          secureTextEntry={esPassword && !mostrarPassword}
          keyboardType={teclado}
          autoCapitalize={esPassword ? 'none' : 'sentences'}
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

// ─── Selector (Picker) ─────────────────────────────────────────
export const SelectorCampo = ({ placeholder, valor, alCambiar, opciones, error, estilo }) => (
  <View style={[estilos.campoContenedor, estilo]}>
    <View style={[estilos.campoWrapper, estilos.selectorWrapper, error && estilos.campoError]}>
      <Picker
        selectedValue={valor}
        onValueChange={alCambiar}
        style={estilos.selector}
        dropdownIconColor={COLORS.textSecondary}
      >
        <Picker.Item label={placeholder} value="" color={COLORS.textMuted} />
        {opciones.map((op) => (
          <Picker.Item key={op.value} label={op.label} value={op.value} />
        ))}
      </Picker>
    </View>
    {error && <Text style={estilos.campoErrorTexto}>{error}</Text>}
  </View>
);

// ─── Tarjeta genérica ──────────────────────────────────────────
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

// ─── Modal de Éxito ────────────────────────────────────────────
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
        <Text style={estilos.modalTitulo}>{titulo}</Text>
        {textBoton && (
          <BotonPrimario titulo={textBoton} onPress={onAccion} estilo={{ marginTop: SPACING.md }} />
        )}
      </View>
    </View>
  </Modal>
);

// ─── Cargador de pantalla completa ────────────────────────────
export const CargandoPantalla = ({ mensaje = 'cargando...' }) => (
  <View style={estilos.cargandoPantalla}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={estilos.cargandoTexto}>{mensaje}</Text>
  </View>
);

// ─── Estado vacío ─────────────────────────────────────────────
export const EstadoVacio = ({ mensaje }) => (
  <View style={estilos.estadoVacio}>
    <Text style={estilos.estadoVacioTexto}>{mensaje}</Text>
  </View>
);

// ─── Barra de navegación superior personalizada ───────────────
export const EncabezadoPersonalizado = ({ titulo, onVolver }) => (
  <View style={estilos.encabezado}>
    {onVolver && (
      <TouchableOpacity onPress={onVolver} style={estilos.encabezadoBotonVolver} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={estilos.encabezadoFlecha}>←</Text>
      </TouchableOpacity>
    )}
    <Text style={estilos.encabezadoTitulo}>{titulo}</Text>
  </View>
);

// ════════════════════════════════════════════
//  ESTILOS
// ════════════════════════════════════════════
const estilos = StyleSheet.create({
  // Botón Primario
  botonPrimario: {
    backgroundColor: COLORS.buttonPrimary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
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

  // Botón Secundario
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

  // Campo de texto
  campoContenedor: {
    marginBottom: SPACING.sm,
  },
  campoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 52,
    paddingHorizontal: SPACING.md,
  },
  campoEnfocado: {
    borderColor: COLORS.borderFocus,
    backgroundColor: COLORS.background,
  },
  campoError: {
    borderColor: COLORS.error,
  },
  campoInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
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

  // Selector
  selectorWrapper: {
    paddingHorizontal: 0,
  },
  selector: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.md,
  },

  // Tarjeta
  tarjeta: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },

  // Alerta
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

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContenido: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    ...SHADOWS.md,
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
    color: COLORS.textSecondary,
  },
  modalTitulo: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
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

  // Modal de éxito
  exitoIcono: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  exitoCheck: {
    fontSize: 36,
    color: COLORS.textPrimary,
  },

  // Cargando pantalla
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

  // Estado vacío
  estadoVacio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  estadoVacioTexto: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Encabezado
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
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
    color: COLORS.textPrimary,
  },
  encabezadoTitulo: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
