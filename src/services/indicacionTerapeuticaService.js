import api from './api';

export const crearIndicacionTerapeutica = async (indicacionData) => {
  try {
    const response = await api.post('/historia-clinica/indicacion-terapeutica', indicacionData);
    return response.data;
  } catch (error) {
    console.error('Error al crear indicación terapéutica:', error);
    throw error;
  }
};

export const obtenerIndicacionesPorPaciente = async (pacienteId) => {
  try {
    const response = await api.get(`/historia-clinica/indicacion-terapeutica/paciente/${pacienteId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener indicaciones terapéuticas:', error);
    throw error;
  }
};

export const obtenerIndicacionTerapeutica = async (id) => {
  try {
    const response = await api.get(`/historia-clinica/indicacion-terapeutica/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener indicación terapéutica:', error);
    throw error;
  }
};

export const eliminarIndicacionTerapeutica = async (id) => {
  try {
    const response = await api.delete(`/historia-clinica/indicacion-terapeutica/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar indicación terapéutica:', error);
    throw error;
  }
};
