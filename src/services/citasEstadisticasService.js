import api from './api';

/**
 * Obtener estadísticas de citas
 * @param {string} fechaDesde - Primer día del mes (YYYY-MM-DD)
 * @param {string} fechaHasta - Último día del mes (YYYY-MM-DD)
 * @param {number|null} terapeutaId - ID del terapeuta (null = todas las terapeutas)
 * @param {string|null} fechaReferencia - Fecha de referencia del calendario (YYYY-MM-DD)
 */
export const obtenerEstadisticasCitas = async (
  fechaDesde,
  fechaHasta,
  terapeutaId = null,
  fechaReferencia = null
) => {
  try {
    const params = {
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
    };

    // Solo agregar terapeuta_id si existe
    if (terapeutaId) {
      params.terapeuta_id = terapeutaId;
    }

    // Solo agregar fecha_referencia si existe (cuando hay calendario visible)
    if (fechaReferencia) {
      params.fecha_referencia = fechaReferencia;
    }

    console.log('📊 Solicitando estadísticas con params:', params);

    const response = await api.get('/citas/estadisticas', { params });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
};