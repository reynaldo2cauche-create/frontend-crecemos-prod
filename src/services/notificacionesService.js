import api from './api';

const BASE_URL = 'notificaciones';

/**
 * Obtiene todas las notificaciones para el usuario autenticado
 * @param {number} limite - Cantidad de notificaciones a obtener (opcional, default: 50)
 * @returns {Promise<Object>} - { total, rol_id, usuario_id, notificaciones }
 */
export const obtenerNotificaciones = async (limite = 50) => {
  try {
    const response = await api.get(`${BASE_URL}`, {
      params: { limite }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    throw error;
  }
};

/**
 * Obtiene las notificaciones recientes (últimas 24 horas)
 * @returns {Promise<Object>} - { total, rol_id, usuario_id, tiempo_actual, notificaciones }
 */
export const obtenerNotificacionesRecientes = async () => {
  try {
    const response = await api.get(`${BASE_URL}/recientes`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener notificaciones recientes:', error);
    throw error;
  }
};

/**
 * Obtiene el conteo total de notificaciones del usuario
 * @returns {Promise<Object>} - { rol_id, usuario_id, total }
 */
export const contarNotificaciones = async () => {
  try {
    const response = await api.get(`${BASE_URL}/count`);
    return response.data;
  } catch (error) {
    console.error('Error al contar notificaciones:', error);
    throw error;
  }
};

/**
 * Marca una notificación como leída
 * @param {number} notificacionId - ID de la notificación
 * @returns {Promise<Object>} - { success, message }
 */
export const marcarComoLeida = async (notificacionId) => {
  try {
    const response = await api.post(`${BASE_URL}/${notificacionId}/marcar-leida`);
    return response.data;
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    throw error;
  }
};

/**
 * Marca todas las notificaciones como leídas
 * @returns {Promise<Object>} - { success, message }
 */
export const marcarTodasComoLeidas = async () => {
  try {
    const response = await api.post(`${BASE_URL}/marcar-todas-leidas`);
    return response.data;
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    throw error;
  }
};

const notificacionesService = {
  obtenerNotificaciones,
  obtenerNotificacionesRecientes,
  contarNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas
};

export default notificacionesService;