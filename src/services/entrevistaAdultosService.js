import api from './api';

/**
 * Crear una nueva entrevista de adultos
 */
export const crearEntrevistaAdultos = async (data) => {
  const response = await api.post('/entrevistas-adultos', data);
  return response.data;
};

/**
 * Obtener todas las entrevistas de un paciente
 */
export const obtenerEntrevistasAdultosPorPaciente = async (pacienteId) => {
  const response = await api.get(`/entrevistas-adultos/paciente/${pacienteId}`);
  return response.data;
};
/**
 * Obtener la última entrevista de un paciente
 */
export const obtenerUltimaEntrevistaAdultos = async (pacienteId) => {
  const response = await api.get(`/entrevistas-adultos/paciente/${pacienteId}/ultima`);
  return response.data;
};

/**
 * Obtener una entrevista por ID
 */
export const obtenerEntrevistaAdultos = async (id) => {
  const response = await api.get(`/entrevistas-adultos/${id}`);
  return response.data;
};

/**
 * Actualizar una entrevista
 */
export const actualizarEntrevistaAdultos = async (id, data) => {
  const response = await api.put(`/entrevistas-adultos/${id}`, data);
  return response.data;
};

/**
 * Eliminar una entrevista
 */
export const eliminarEntrevistaAdultos = async (id) => {
  const response = await api.delete(`/entrevistas-adultos/${id}`);
  return response.data;
};
