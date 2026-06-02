import axios from 'axios';
import { SERVER_BASE_URL } from './api';

const API_URL = import.meta.env.VITE_API_URL || SERVER_BASE_URL;

/**
 * Obtiene todos los trabajadores asignados a un servicio específico
 * @param {number} servicioId - ID del servicio
 * @returns {Promise<Array>} - Array de trabajadores
 */
export const getTrabajadoresByServicio = async (servicioId) => {
  try {
    const response = await axios.get(`${API_URL}/backend_api/trabajador-servicio/por-servicio/${servicioId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener trabajadores por servicio:', error);
    throw error;
  }
};

/**
 * Obtiene todos los servicios asignados a un trabajador específico
 * @param {number} trabajadorId - ID del trabajador
 * @returns {Promise<Array>} - Array de servicios
 */
export const getServiciosByTrabajador = async (trabajadorId) => {
  try {
    const response = await axios.get(`${API_URL}/backend_api/trabajador-servicio/por-trabajador/${trabajadorId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener servicios por trabajador:', error);
    throw error;
  }
};

/**
 * Asigna un servicio a un trabajador
 * @param {number} trabajadorId - ID del trabajador
 * @param {number} servicioId - ID del servicio
 * @param {string} observaciones - Observaciones opcionales
 * @returns {Promise<Object>} - Asignación creada
 */
export const asignarServicio = async (trabajadorId, servicioId, observaciones = '', userId = null) => {
  try {
    const response = await axios.post(`${API_URL}/backend_api/trabajador-servicio`, {
      trabajadorId,
      servicioId,
      observaciones,
      userId
    });
    return response.data;
  } catch (error) {
    console.error('Error al asignar servicio:', error);
    throw error;
  }
};

/**
 * Desactiva un servicio de un trabajador
 * @param {number} trabajadorId - ID del trabajador
 * @param {number} servicioId - ID del servicio
 * @returns {Promise<Object>} - Resultado de la desactivación
 */

export const desactivarServicio = async (trabajadorId, servicioId, userId = null) => {
  try {
    const response = await axios.delete(`${API_URL}/backend_api/trabajador-servicio/${trabajadorId}/${servicioId}`, {
      data: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error al desactivar servicio:', error);
    throw error;
  }
};

export default {
  getTrabajadoresByServicio,
  getServiciosByTrabajador,
  asignarServicio,
  desactivarServicio
};
