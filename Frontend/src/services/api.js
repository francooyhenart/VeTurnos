// src/services/api.js
import axios from 'axios';
import { API_BASE_URL } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Interceptor de respuestas para manejo de errores centralizado ───
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de error
      const message =
        error.response.data?.error ||
        error.response.data?.mensaje ||
        'Ocurrió un error inesperado';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error('Sin conexión al servidor. Verificá tu red.'));
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════
//  AUTH ENDPOINTS  →  /api/auth
// ═══════════════════════════════════════════

/**
 * Registra un nuevo cliente.
 * POST /api/auth/registro
 * @param {{ nombreCompleto, dni, telefono, email, password }} data
 * @returns {Promise<{ id, nombreCompleto, email, rol }>}
 */
export const registrarCliente = async (data) => {
  const response = await api.post('/auth/registro', data);
  return response.data; // AuthResponse
};

/**
 * Inicia sesión de un usuario.
 * POST /api/auth/login
 * @param {{ email, password }} data
 * @returns {Promise<{ id, nombreCompleto, email, rol }>}
 */
export const login = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data; // AuthResponse
};

// ═══════════════════════════════════════════
//  VETERINARIOS ENDPOINTS  →  /api/veterinarios (Nuevo E2)
// ═══════════════════════════════════════════

/**
 * Obtiene la lista de todos los veterinarios activos y sus especialidades.
 * GET /api/veterinarios
 * @returns {Promise<{ id, nombre, especialidad }[]>}
 */
export const listarVeterinarios = async () => {
  const response = await api.get('/veterinarios');
  return response.data;
};

// ═══════════════════════════════════════════
//  MASCOTAS ENDPOINTS  →  /api/mascotas
// ═══════════════════════════════════════════

/**
 * Registra una nueva mascota.
 * POST /api/mascotas
 * @param {{ nombre, especie, raza, edad, clienteId, foto }} data  --> 🚀 E2: foto viaja en Base64 string
 * @returns {Promise<MascotaResponse>}
 */
export const registrarMascota = async (data) => {
  const response = await api.post('/mascotas', data);
  return response.data; // MascotaResponse
};

/**
 * Lista las mascotas de un cliente.
 * GET /api/mascotas/cliente/:clienteId
 * @param {number} clienteId
 * @returns {Promise<MascotaResponse[]>}
 */
export const listarMascotasPorCliente = async (clienteId) => {
  const response = await api.get(`/mascotas/cliente/${clienteId}`);
  return response.data;
};

// ═══════════════════════════════════════════
//  RESERVAS ENDPOINTS  →  /api/reservas
// ═══════════════════════════════════════════

/**
 * Crea una nueva reserva vinculando cliente, mascota y profesional.
 * POST /api/reservas
 * @param {{ clienteId, veterinarioId, mascotaId, motivo, fechaHora }} data --> 🚀 E2: Se acopla veterinarioId y motivo
 * fechaHora en formato ISO: "2025-05-11T10:30:00"
 * @returns {Promise<ReservaResponse>}
 */
export const crearReserva = async (data) => {
  const response = await api.post('/reservas', data);
  return response.data; // ReservaResponse
};

/**
 * Cancela una reserva por ID.
 * DELETE /api/reservas/:id
 * @param {number} id
 * @returns {Promise<{ mensaje?: string, advertencia?: string }>}
 */
export const cancelarReserva = async (id) => {
  const response = await api.delete(`/reservas/${id}`);
  return response.data;
};

/**
 * Obtiene la agenda del día filtrando opcionalmente por veterinario (US-06 / US-03).
 * GET /api/reservas/agenda?fecha=YYYY-MM-DD&veterinarioId=ID
 * @param {string} fecha formato "YYYY-MM-DD"
 * @param {number|string} [veterinarioId] ID del profesional seleccionado --> 🚀 E2: Query param opcional/requerido
 * @returns {Promise<ReservaResponse[]>}
 */
export const obtenerAgenda = async (fecha, veterinarioId = '') => {
  const params = { fecha };
  if (veterinarioId) {
    params.veterinarioId = veterinarioId;
  }
  const response = await api.get('/reservas/agenda', { params });
  return response.data;
};

/**
 * Registra asistencia (ASISTIDO o COMPLETADO).
 * PATCH /api/reservas/:id/asistencia?estado=ASISTIDO
 * @param {number} id
 * @param {'ASISTIDO'|'COMPLETADO'} estado
 * @returns {Promise<ReservaResponse>}
 */
export const registrarAsistencia = async (id, estado) => {
  const response = await api.patch(`/reservas/${id}/asistencia`, null, {
    params: { estado },
  });
  return response.data;
};

/**
 * Guarda las observaciones clínicas / diagnóstico de un turno atendido (RF-11 / US-09).
 * POST /api/reservas/:id/ficha-medica
 * @param {number} id ID de la reserva/turno
 * @param {{ observaciones: string }} data Notas del profesional
 * @returns {Promise<ReservaResponse>}
 */
export const guardarObservacionesClinicas = async (id, data) => {
  const response = await api.post(`/reservas/${id}/ficha-medica`, data);
  return response.data;
};

/**
 * Obtiene reservas de un cliente.
 * WORKAROUND: Consultamos los próximos 30 días y filtramos por nombreCliente.
 * @param {string} nombreCliente
 * @returns {Promise<ReservaResponse[]>}
 */
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

export default api;