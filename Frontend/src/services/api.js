// src/services/api.js
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

// ─── Interceptor de solicitudes para agregar token JWT ───
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@veturnos_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {
      // Si no se puede obtener el token, simplemente continuar sin él
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const data = error.response.data || {};

      // US-04 AC 02: caso especial, no es un error real sino un pedido de confirmación
      if (error.response.status === 409 && data.requiereConfirmacion) {
        const confirmError = new Error(data.advertencia || 'Se requiere confirmación para continuar.');
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
//  CLIENTES ENDPOINTS  →  /api/clientes
// ═══════════════════════════════════════════

/**
 * Busca clientes por nombre o DNI (solo gestor).
 * GET /api/clientes/buscar?q=xxx
 * @param {string} q - texto de búsqueda (nombre o DNI)
 * @returns {Promise<Array<{ id, nombreCompleto, dni, email }>>}
 */
export const buscarClientes = async (q) => {
  const response = await api.get('/clientes/buscar', { params: { q } });
  return response.data;
};

// ═══════════════════════════════════════════
//  MASCOTAS ENDPOINTS  →  /api/mascotas
// ═══════════════════════════════════════════

/**
 * Registra una nueva mascota.
 * POST /api/mascotas
 * @param {{ nombre, especie, raza, edad, clienteId }} data
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

/**
 * Búsqueda Global de Pacientes (Veterinario): por nombre de mascota o DNI del dueño.
 * GET /api/mascotas/buscar?query=...
 * @param {string} query
 * @returns {Promise<MascotaResponse[]>}
 */
export const buscarMascotas = async (query) => {
  const response = await api.get('/mascotas/buscar', { params: { query } });
  return response.data;
};

// ═══════════════════════════════════════════
//  RESERVAS ENDPOINTS  →  /api/reservas
// ═══════════════════════════════════════════

/**
 * Crea una nueva reserva.
 * POST /api/reservas
 * @param {{ clienteId, mascotaId, fechaHora }} data
 *   fechaHora en formato ISO: "2025-05-11T10:30:00"
 * @returns {Promise<ReservaResponse>}
 */
export const crearReserva = async (data) => {
  const response = await api.post('/reservas', data);
  return response.data; // ReservaResponse
};

/**
 * Cancela una reserva por ID.
 * DELETE /api/reservas/:id?confirmarRecargo=true|false
 * @param {number} id
 * @param {boolean} confirmarRecargo - true cuando el cliente ya aceptó el recargo por cancelación tardía
 * @returns {Promise<{ mensaje?: string, advertencia?: string, recargoAplicado?: boolean }>}
 */
export const cancelarReserva = async (id, confirmarRecargo = false) => {
  const response = await api.delete(`/reservas/${id}`, { params: { confirmarRecargo } });
  return response.data;
};

/**
 * Obtiene la agenda del día (para admin/vet), con filtro opcional por sede.
 * GET /api/reservas/agenda?fecha=YYYY-MM-DD&sedeId=1
 * @param {string} fecha  formato "YYYY-MM-DD"
 * @param {number|null} sedeId  filtro opcional por sede
 * @returns {Promise<ReservaResponse[]>}
 */
export const obtenerAgenda = async (fecha, sedeId) => {
  const params = { fecha };
  if (sedeId) params.sedeId = sedeId;
  const response = await api.get('/reservas/agenda', { params });
  return response.data;
};

/**
 * Disponibilidad de turnos para el cliente (solo horarios futuros), con
 * filtro opcional por sede. Distinto de obtenerAgenda (usada por vet/gestor).
 * GET /api/reservas/disponibilidad?fecha=YYYY-MM-DD&sedeId=1
 * @param {string} fecha  formato "YYYY-MM-DD"
 * @param {number|null} sedeId
 * @returns {Promise<ReservaResponse[]>}
 */
export const obtenerDisponibilidad = async (fecha, sedeId) => {
  const params = { fecha };
  if (sedeId) params.sedeId = sedeId;
  const response = await api.get('/reservas/disponibilidad', { params });
  return response.data;
};

/**
 * Registra asistencia (ASISTIDO o COMPLETADO).
 * PATCH /api/reservas/:id/asistencia?estado=ASISTIDO
 * @param {number} id
 * @param {'ASISTIDO'|'COMPLETADO'} estado
 * @returns {Promise<ReservaResponse>}
 */
export const registrarAsistencia = async (id, estado, veterinarioId) => {
  const params = { estado };
  if (veterinarioId) params.veterinarioId = veterinarioId;
  const response = await api.patch(`/reservas/${id}/asistencia`, null, { params });
  return response.data;
};

/**
 * Carga o edita el diagnóstico/observaciones clínicas de un turno (ficha médica).
 * PATCH /api/reservas/:id/observaciones
 * @param {number} id
 * @param {string} observacionesClinicas
 * @returns {Promise<ReservaResponse>}
 */
export const actualizarObservaciones = async (id, observacionesClinicas) => {
  const response = await api.patch(`/reservas/${id}/observaciones`, { observacionesClinicas });
  return response.data;
};

/**
 * Obtiene reservas de un cliente (filtrando por fecha si fuera necesario).
 * GET /api/reservas/agenda - filtramos localmente por clienteId
 * Nota: como el backend no tiene un endpoint GET por clienteId,
 * obtenemos todas las reservas del día o usamos la agenda completa.
 * Para "Mis turnos" necesitamos un approach alternativo:
 * consultamos la agenda de varios días y filtramos por cliente.
 * 
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

  // Filtramos por nombreCliente (coincidencia parcial, case-insensitive)
  return todas.filter((r) =>
    r.nombreCliente?.toLowerCase().includes(nombreCliente.toLowerCase())
  );
};

// ═══════════════════════════════════════════════════════════════════
//  GESTOR VETERINARIOS ENDPOINTS  →  /api/admin/veterinarios
// ═══════════════════════════════════════════════════════════════════

/**
 * Obtiene la lista de todos los veterinarios.
 * GET /api/admin/veterinarios
 * @returns {Promise<VeterinarioResponse[]>}
 */
export const obtenerVeterinarios = async () => {
  const response = await api.get('/admin/veterinarios');
  return response.data;
};

/**
 * Obtiene un veterinario por ID.
 * GET /api/admin/veterinarios/:id
 * @param {number} id
 * @returns {Promise<VeterinarioResponse>}
 */
export const obtenerVeterinarioPorId = async (id) => {
  const response = await api.get(`/admin/veterinarios/${id}`);
  return response.data;
};

/**
 * Obtiene un veterinario por matrícula.
 * GET /api/admin/veterinarios/matricula/:matricula
 * @param {string} matricula
 * @returns {Promise<VeterinarioResponse>}
 */
export const obtenerVeterinarioPorMatricula = async (matricula) => {
  const response = await api.get(`/admin/veterinarios/matricula/${matricula}`);
  return response.data;
};

/**
 * Crea un nuevo veterinario.
 * POST /api/admin/veterinarios
 * @param {{ nombreCompleto, dni, telefono, email, password, matricula, especialidad }} data
 * @returns {Promise<VeterinarioResponse>}
 */
export const crearVeterinario = async (data) => {
  const response = await api.post('/admin/veterinarios', data);
  return response.data;
};

/**
 * Actualiza datos de un veterinario (actualización parcial: los campos
 * ausentes o vacíos no se modifican en el backend).
 * PUT /api/admin/veterinarios/:id
 * @param {number} id
 * @param {{ nombreCompleto?, telefono?, especialidad?, email?, matricula? }} data
 * @returns {Promise<VeterinarioResponse>}
 */
export const actualizarVeterinario = async (id, data) => {
  const response = await api.put(`/admin/veterinarios/${id}`, data);
  return response.data;
};

/**
 * Cambia el estado de administrador de un veterinario.
 * PATCH /api/admin/veterinarios/:id/admin
 * @param {number} id
 * @param {boolean} esAdministrador
 * @returns {Promise<VeterinarioResponse>}
 */
export const cambiarEstadoAdmin = async (id, esAdministrador) => {
  const response = await api.patch(`/admin/veterinarios/${id}/admin`, {
    esAdministrador,
  });
  return response.data;
};

/**
 * Elimina un veterinario.
 * DELETE /api/admin/veterinarios/:id
 * @param {number} id
 * @returns {Promise<{ mensaje: string }>}
 */
export const eliminarVeterinario = async (id) => {
  const response = await api.delete(`/admin/veterinarios/${id}`);
  return response.data;
};

/**
 * Obtiene resumen de todos los veterinarios.
 * GET /api/admin/veterinarios/resumen/lista
 * @returns {Promise<Array>}
 */
export const obtenerResumenVeterinarios = async () => {
  const response = await api.get('/admin/veterinarios/resumen/lista');
  return response.data;
};

/**
 * Obtiene estadísticas generales de veterinarios.
 * GET /api/admin/veterinarios/estadisticas/general
 * @returns {Promise<{ totalVeterinarios, totalAdministradores, totalReservas }>}
 */
export const obtenerEstadisticasVeterinarios = async () => {
  const response = await api.get('/admin/veterinarios/estadisticas/general');
  return response.data;
};

/**
 * Obtiene la agenda completa de todos los veterinarios.
 * GET /api/admin/veterinarios/agenda/completa
 * @returns {Promise<{ totalVeterinarios, totalReservas, veterinarios, reservas }>}
 */
export const obtenerAgendaCompleta = async () => {
  const response = await api.get('/admin/veterinarios/agenda/completa');
  return response.data;
};

/**
 * Obtiene la agenda de un veterinario específico.
 * GET /api/reservas/veterinario/:veterinarioId
 * @param {number} veterinarioId
 * @returns {Promise<ReservaResponse[]>}
 */
export const obtenerAgendaVeterinario = async (veterinarioId) => {
  const response = await api.get(`/reservas/veterinario/${veterinarioId}`);
  return response.data;
};

/**
 * Búsqueda Global de Pacientes: historial clínico completo de una mascota
 * (turnos COMPLETADO), sin importar la sede o el veterinario que la atendió.
 * GET /api/reservas/historial/:mascotaId
 * @param {number} mascotaId
 * @returns {Promise<Array<{ id, fechaHora, nombreVeterinario, nombreSede, observacionesClinicas }>>}
 */
export const obtenerHistorialClinico = async (mascotaId) => {
  const response = await api.get(`/reservas/historial/${mascotaId}`);
  return response.data;
};

/**
 * Punto 6: próximos turnos PENDIENTES de un veterinario, sin importar el día,
 * ordenados por fecha/hora.
 * GET /api/reservas/veterinario/:veterinarioId/proximos
 * @param {number} veterinarioId
 * @returns {Promise<ReservaResponse[]>}
 */
export const obtenerProximosTurnosVeterinario = async (veterinarioId) => {
  const response = await api.get(`/reservas/veterinario/${veterinarioId}/proximos`);
  return response.data;
};

// ═══════════════════════════════════════════════════════════════════
//  SEDES ENDPOINTS  →  /api/sedes
// ═══════════════════════════════════════════════════════════════════

/**
 * Crea una nueva sede.
 * POST /api/sedes
 * @param {{ nombre, calle, numero, entreCalles? }} data
 * @returns {Promise<SedeResponse>}
 */
export const crearSede = async (data) => {
  const response = await api.post('/sedes', data);
  return response.data;
};

/**
 * Obtiene la lista de todas las sedes.
 * GET /api/sedes
 * @returns {Promise<SedeResponse[]>}
 */
export const obtenerSedes = async () => {
  const response = await api.get('/sedes');
  return response.data;
};

/**
 * Elimina una sede (falla si tiene turnos asignados).
 * DELETE /api/sedes/:id
 * @param {number} id
 * @returns {Promise<{ mensaje: string }>}
 */
export const eliminarSede = async (id) => {
  const response = await api.delete(`/sedes/${id}`);
  return response.data;
};

// ═══════════════════════════════════════════════════════════════════
//  MÉTRICAS ENDPOINTS  →  /api/metricas
// ═══════════════════════════════════════════════════════════════════

/**
 * RF-11 / RF-18: Dashboard de estadísticas — total general de turnos
 * atendidos, desglosados por sede y por veterinario.
 * GET /api/metricas/estadisticas
 * @returns {Promise<{
 *   totalTurnos: number,
 *   porSede: Array<{ nombreSede, cantidadTurnos }>,
 *   porVeterinario: Array<{ nombreVeterinario, cantidadTurnos }>
 * }>}
 */
export const obtenerEstadisticas = async () => {
  const response = await api.get('/metricas/estadisticas');
  return response.data;
};

export default api;
