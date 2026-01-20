import api from './api';
/**
 * Obtiene notificaciones recientes (leídas y no leídas) del último mes
 * @param {number} limite - Cantidad de notificaciones a obtener
 * @param {number} offset - Offset para paginación
 * @returns {Promise} Respuesta con notificaciones
 */
export const obtenerNotificacionesRecientes = async (limite = 20, offset = 0) => {
  try {
    const response = await api.get('notificaciones/recientes', {
      params: { limite, offset }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener notificaciones recientes:', error);
    throw error;
  }
};

/**
 * Obtiene el conteo de notificaciones NO LEÍDAS
 * @returns {Promise} Total de notificaciones sin leer
 */
export const contarNotificaciones = async () => {
  try {
    const response = await api.get('/notificaciones/count');
    return response.data;
  } catch (error) {
    console.error('❌ Error al contar notificaciones:', error);
    throw error;
  }
};

export const marcarComoLeida = async (notificacionId) => {
  try {
    console.log('📤 [SERVICE] Marcando como leída:', notificacionId);
    
    const response = await api.post(`/notificaciones/${notificacionId}/marcar-leida`);
    
    console.log('✅ [SERVICE] Respuesta completa:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error del servidor');
    }
    
    return response.data;
    
  } catch (error) {
    console.error('❌ [SERVICE] Error en marcarComoLeida:', error);
    
    if (error.response) {
      console.error('❌ [SERVICE] Respuesta error:', error.response.data);
      console.error('❌ [SERVICE] Status:', error.response.status);
    }
    
    throw error;
  }
};

/**
 * Marca TODAS las notificaciones como leídas (GUARDA EN LA TABLA notificaciones_leidas)
 * @returns {Promise} Respuesta del servidor
 */
export const marcarTodasComoLeidas = async () => {
  try {
    console.log('📤 Enviando petición POST para marcar TODAS como leídas');
    console.log('📤 URL: /backend_api/notificaciones/marcar-todas-leidas');
    
    const response = await api.post('/backend_api/notificaciones/marcar-todas-leidas');
    
    console.log('✅ Respuesta del servidor:', response.data);
    
    if (response.data.success) {
      console.log('✅ Todas las notificaciones marcadas como leídas en BD');
    } else {
      console.warn('⚠️ El servidor respondió pero success=false');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error al marcar todas como leídas:', error);
    console.error('❌ Error details:', error.response?.data);
    throw error;
  }
};