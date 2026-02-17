import api from './api';

/**
 * Obtiene los paquetes/compras disponibles (con sesiones restantes) de un paciente
 * @param {number} pacienteId 
 * @returns {Promise<Array>}
 */
export const obtenerPaquetesDisponibles = async (pacienteId) => {
  const response = await api.get(`/compras/paciente/${pacienteId}/disponibles`);
  return response.data; // Array de compras con sesiones restantes
};

/**
 * Obtiene detalle de una compra específica
 * @param {number} compraId 
 * @returns {Promise<Object>}
 */
export const obtenerCompra = async (compraId) => {
  const response = await api.get(`/compras/${compraId}`);
  return response.data;
};

export const crearCompra = async (data) => {
  const response = await api.post('/compras', data);
  return response.data;
};