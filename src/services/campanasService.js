import api from './api';

// ============================================================
// ENDPOINTS PÚBLICOS
// ============================================================

/**
 * Obtener campañas activas (público)
 */
export const getCampanasActivas = () =>
  api.get('/campanas/publicas').then(r => r.data);

// ============================================================
// ENDPOINTS PROTEGIDOS (ADMIN)
// ============================================================

/**
 * Obtener todas las campañas
 */
export const getCampanas = () =>
  api.get('/campanas').then(r => r.data);

/**
 * Obtener una campaña por ID
 */
export const getCampana = (id) =>
  api.get(`/campanas/${id}`).then(r => r.data);

/**
 * Obtener estados de campaña
 */
export const getEstadosCampana = () =>
  api.get('/campanas/estados').then(r => r.data);

/**
 * Crear una nueva campaña
 */
export const crearCampana = (data) =>
  api.post('/campanas', data).then(r => r.data);

/**
 * Actualizar una campaña
 */
export const actualizarCampana = (id, data) =>
  api.patch(`/campanas/${id}`, data).then(r => r.data);

/**
 * Eliminar una campaña
 */
export const eliminarCampana = (id) =>
  api.delete(`/campanas/${id}`).then(r => r.data);
