import api from './api';

const BASE_URL = '/notificaciones';

export const obtenerNotificaciones = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.leida !== undefined) params.append('leida', filtros.leida);
    if (filtros.limite) params.append('limite', filtros.limite);

    const response = await api.get(`${BASE_URL}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    throw error;
  }
};

export const contarNotificacionesNoLeidas = async () => {
  try {
    const response = await api.get(`${BASE_URL}/contador/no-leidas`);
    return response.data;
  } catch (error) {
    console.error('Error al contar notificaciones no leídas:', error);
    throw error;
  }
};

export const marcarNotificacionLeida = async (id) => {
  try {
    const response = await api.put(`${BASE_URL}/${id}/marcar-leida`);
    return response.data;
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    throw error;
  }
};

export const marcarTodasNotificacionesLeidas = async () => {
  try {
    const response = await api.put(`${BASE_URL}/marcar-todas-leidas`);
    return response.data;
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    throw error;
  }
};

export const obtenerNotificacionesNoLeidas = async (limite = 15) => {
  try {
    const response = await api.get(`${BASE_URL}?leida=false&limite=${limite}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener notificaciones no leídas:', error);
    throw error;
  }
};

// NOTA: El polling ya no es necesario, ahora usamos SSE (Server-Sent Events)
// SSE permite que el servidor envíe actualizaciones en tiempo real al cliente
// sin necesidad de WebSockets y funciona en cPanel

export default {
  obtenerNotificaciones,
  contarNotificacionesNoLeidas,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
  obtenerNotificacionesNoLeidas,
};
