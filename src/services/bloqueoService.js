import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Crear un bloqueo de horario
export const crearBloqueo = async (bloqueoData) => {
  try {
    const response = await axios.post(`${API_URL}/bloqueos`, bloqueoData);
    return response.data;
  } catch (error) {
    console.error('Error al crear bloqueo:', error);
    throw error;
  }
};

// Obtener todos los bloqueos
export const obtenerBloqueos = async () => {
  try {
    const response = await axios.get(`${API_URL}/bloqueos`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener bloqueos:', error);
    throw error;
  }
};

// Obtener bloqueos activos (vigentes)
export const obtenerBloqueosActivos = async () => {
  try {
    const response = await axios.get(`${API_URL}/bloqueos/activos`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener bloqueos activos:', error);
    throw error;
  }
};

// Obtener bloqueos de un terapeuta específico
export const obtenerBloqueosPorTerapeuta = async (trabajadorId) => {
  try {
    const response = await axios.get(`${API_URL}/bloqueos/trabajador/${trabajadorId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener bloqueos del terapeuta:', error);
    throw error;
  }
};

// Obtener un bloqueo por ID
export const obtenerBloqueoPorId = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/bloqueos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener bloqueo:', error);
    throw error;
  }
};

// Actualizar un bloqueo
export const actualizarBloqueo = async (id, bloqueoData) => {
  try {
    const response = await axios.put(`${API_URL}/bloqueos/${id}`, bloqueoData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar bloqueo:', error);
    throw error;
  }
};

// Eliminar un bloqueo (soft delete)
export const eliminarBloqueo = async (id, userId) => {
  try {
    const response = await axios.delete(`${API_URL}/bloqueos/${id}`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar bloqueo:', error);
    throw error;
  }
};

// Verificar si un horario está bloqueado
export const verificarHorarioBloqueado = async (trabajadorId, fecha, hora) => {
  try {
    const response = await axios.post(`${API_URL}/bloqueos/verificar`, {
      trabajadorId,
      fecha,
      hora
    });
    return response.data.bloqueado;
  } catch (error) {
    console.error('Error al verificar horario bloqueado:', error);
    throw error;
  }
};

// Obtener horarios disponibles de un terapeuta en una fecha
export const obtenerHorariosDisponibles = async (trabajadorId, fecha, horaInicio, horaFin, intervalo) => {
  try {
    const response = await axios.get(`${API_URL}/bloqueos/disponibles/${trabajadorId}`, {
      params: { fecha, horaInicio, horaFin, intervalo }
    });
    return response.data.horarios;
  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    throw error;
  }
};
