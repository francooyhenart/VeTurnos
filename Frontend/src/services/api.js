import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adjuntar token JWT
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@veturnos_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {}
    return config;
  },
  (error) => Promise.reject(error)
);

// Manejo global de respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const data = error.response.data || {};

      if (error.response.status === 409 && data.requiereConfirmacion) {
        const confirmError = new Error(data.advertencia || 'Confirmación requerida.');
        confirmError.requiereConfirmacion = true;
        confirmError.advertencia = data.advertencia;
        return Promise.reject(confirmError);
      }

      const message = data.error || data.mensaje || 'Ocurrió un error inesperado';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error('Sin conexión al servidor. Verificá tu red.'));
    }
    return Promise.reject(error);
  }
);

// --- AUTH ---
export const registrarCliente = async (data) => {
  const response = await api.post('/auth/registro', data);
  return response.data;
};

export const login = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

// --- CLIENTES ---
export const buscarClientes = async (q) => {
  const response = await api.get('/clientes/buscar', { params: { q } });
  return response.data;
};

// --- MASCOTAS ---
export const registrarMascota = async (data) => {
  const response = await api.post('/mascotas', data);
  return response.data;
};

export const listarMascotasPorCliente = async (clienteId) => {
  const response = await api.get(`/mascotas/cliente/${clienteId}`);
  return response.data;
};

export const buscarMascotas = async (query) => {
  const response = await api.get('/mascotas/buscar', { params: { query } });
  return response.data;
};

// --- RESERVAS ---
export const crearReserva = async (data) => {
  const response = await api.post('/reservas', data);
  return response.data;
};

export const cancelarReserva = async (id, confirmarRecargo = false) => {
  const response = await api.delete(`/reservas/${id}`, { params: { confirmarRecargo } });
  return response.data;
};

export const obtenerAgenda = async (fecha, sedeId) => {
  const params = { fecha };
  if (sedeId) params.sedeId = sedeId;
  const response = await api.get('/reservas/agenda', { params });
  return response.data;
};

export const obtenerDisponibilidad = async (fecha, sedeId) => {
  const params = { fecha };
  if (sedeId) params.sedeId = sedeId;
  const response = await api.get('/reservas/disponibilidad', { params });
  return response.data;
};

export const registrarAsistencia = async (id, estado, veterinarioId) => {
  const params = { estado };
  if (veterinarioId) params.veterinarioId = veterinarioId;
  const response = await api.patch(`/reservas/${id}/asistencia`, null, { params });
  return response.data;
};

export const actualizarObservaciones = async (id, observacionesClinicas) => {
  const response = await api.patch(`/reservas/${id}/observaciones`, { observacionesClinicas });
  return response.data;
};

export const obtenerReservasCliente = async (nombreCliente) => {
  const hoy = new Date();
  const promesas = [];

  for (let i = 0; i < 30; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);
    const fechaStr = fecha.toISOString().split('T')[0];
    promesas.push(
      api.get('/reservas/agenda', { params: { fecha: fechaStr } }).catch(() => ({ data: [] }))
    );
  }

  const resultados = await Promise.all(promesas);
  const todas = resultados.flatMap((r) => r.data || []);

  return todas.filter((r) =>
    r.nombreCliente?.toLowerCase().includes(nombreCliente.toLowerCase())
  );
};

// --- VETERINARIOS ---
export const obtenerVeterinarios = async () => {
  const response = await api.get('/admin/veterinarios');
  return response.data;
};

export const obtenerVeterinarioPorId = async (id) => {
  const response = await api.get(`/admin/veterinarios/${id}`);
  return response.data;
};

export const obtenerVeterinarioPorMatricula = async (matricula) => {
  const response = await api.get(`/admin/veterinarios/matricula/${matricula}`);
  return response.data;
};

export const crearVeterinario = async (data) => {
  const response = await api.post('/admin/veterinarios', data);
  return response.data;
};

export const actualizarVeterinario = async (id, data) => {
  const response = await api.put(`/admin/veterinarios/${id}`, data);
  return response.data;
};

export const cambiarEstadoAdmin = async (id, esAdministrador) => {
  const response = await api.patch(`/admin/veterinarios/${id}/admin`, { esAdministrador });
  return response.data;
};

export const eliminarVeterinario = async (id) => {
  const response = await api.delete(`/admin/veterinarios/${id}`);
  return response.data;
};

export const obtenerResumenVeterinarios = async () => {
  const response = await api.get('/admin/veterinarios/resumen/lista');
  return response.data;
};

export const obtenerEstadisticasVeterinarios = async () => {
  const response = await api.get('/admin/veterinarios/estadisticas/general');
  return response.data;
};

export const obtenerAgendaCompleta = async () => {
  const response = await api.get('/admin/veterinarios/agenda/completa');
  return response.data;
};

export const obtenerAgendaVeterinario = async (veterinarioId) => {
  const response = await api.get(`/reservas/veterinario/${veterinarioId}`);
  return response.data;
};

export const obtenerHistorialClinico = async (mascotaId) => {
  const response = await api.get(`/reservas/historial/${mascotaId}`);
  return response.data;
};

export const obtenerProximosTurnosVeterinario = async (veterinarioId) => {
  const response = await api.get(`/reservas/veterinario/${veterinarioId}/proximos`);
  return response.data;
};

// --- SEDES ---
export const crearSede = async (data) => {
  const response = await api.post('/sedes', data);
  return response.data;
};

export const obtenerSedes = async () => {
  const response = await api.get('/sedes');
  return response.data;
};

export const eliminarSede = async (id) => {
  const response = await api.delete(`/sedes/${id}`);
  return response.data;
};

// --- METRICAS Y REPORTE ---
export const obtenerEstadisticas = async () => {
  const response = await api.get('/metricas/estadisticas');
  return response.data;
};

// --- NOTIFICACIONES (NUEVO) ---
export const obtenerNotificaciones = async (usuarioId) => {
  const response = await api.get(`/notificaciones/usuario/${usuarioId}`);
  return response.data;
};

export const obtenerContadorSinLeer = async (usuarioId) => {
  const response = await api.get(`/notificaciones/usuario/${usuarioId}/sin-leer`);
  return response.data.cantidadSinLeer;
};

export const marcarNotificacionLeida = async (notificacionId) => {
  const response = await api.patch(`/notificaciones/${notificacionId}/leido`);
  return response.data;
};

export default api;