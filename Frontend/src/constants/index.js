// src/constants/index.js
import { Platform } from 'react-native';

export const COLORS = {
  // Primarios
  primary: '#2D2D2D',
  primaryLight: '#4A4A4A',
  primaryDark: '#1A1A1A',

  // Fondos
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  surface: '#EBEBEB',
  surfaceLight: '#F0F0F0',

  // Texto
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9E9E9E',
  textInverse: '#FFFFFF',

  // Estados
  success: '#4CAF50',
  error: '#E53935',
  warning: '#FB8C00',
  info: '#1E88E5',

  // Bordes
  border: '#DCDCDC',
  borderFocus: '#2D2D2D',

  // Botón principal
  buttonPrimary: '#555555',
  buttonPrimaryText: '#FFFFFF',
  buttonDisabled: '#BDBDBD',
  buttonDisabledText: '#888888',

  // Turnos
  turnoDisponible: '#F5F5F5',
  turnoOcupado: '#BDBDBD',
  turnoSeleccionado: '#555555',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  title: 32,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Usa una URL accesible desde Expo web y desde el emulador Android
const HOST_API = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
export const API_BASE_URL = `${HOST_API}/api`;

export const ESPECIES = [
  { label: 'Perro', value: 'PERRO' },
  { label: 'Gato', value: 'GATO' },
  { label: 'Ave', value: 'AVE' },
  { label: 'Roedor', value: 'ROEDOR' },
  { label: 'Reptil', value: 'REPTIL' },
  { label: 'Otro', value: 'OTRO' },
];

export const ESPECIALIDADES = [
  { label: 'Clínica General', value: 'Clínica General' },
  { label: 'Cirugía', value: 'Cirugía' },
  { label: 'Dermatología', value: 'Dermatología' },
  { label: 'Cardiología', value: 'Cardiología' },
];

export const MOTIVOS = [
  { label: 'Control general', value: 'Control' },
  { label: 'Vacunación', value: 'Vacunacion' },
  { label: 'Cirugía', value: 'Cirugia' },
  { label: 'Urgencia', value: 'Urgencia' },
  { label: 'Consulta', value: 'Consulta' },
];

export const HORARIOS_DISPONIBLES = [
  '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30',
  '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
];

export const ROLES = {
  CLIENTE: 'CLIENTE',
  VETERINARIO: 'VETERINARIO',
  GESTOR_VETERINARIOS: 'GESTOR_VETERINARIOS',
};
