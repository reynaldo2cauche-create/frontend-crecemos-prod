import api from './api';

/**
 * Obtiene estadísticas de citas
 * @param {string} fechaDesde - Fecha de inicio (YYYY-MM-DD)
 * @param {string} fechaHasta - Fecha de fin (YYYY-MM-DD)
 * @param {number} terapeutaId - ID del terapeuta (opcional)
 * @returns {Promise<Object>} - Estadísticas de citas
 */
export const obtenerEstadisticasCitas = async (fechaDesde, fechaHasta, terapeutaId = null) => {
  try {
    const params = {
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
    };

    if (terapeutaId) {
      params.terapeuta_id = terapeutaId;
    }

    const response = await api.get('/citas/estadisticas', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de citas:', error);
    throw error;
  }
};

export default {
  obtenerEstadisticasCitas,
};
