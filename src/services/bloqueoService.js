import api from './api';

// Crear un bloqueo de horario
export const crearBloqueo = async (bloqueoData) => {
  try {
    const response = await api.post('/bloqueos', bloqueoData);
    return response.data;
  } catch (error) {
    console.error('Error al crear bloqueo:', error);
    throw error;
  }
};

// Obtener todos los bloqueos
export const obtenerBloqueos = async () => {
  try {
    const response = await api.get('/bloqueos');
    return response.data;
  } catch (error) {
    console.error('Error al obtener bloqueos:', error);
    throw error;
  }
};

// Obtener bloqueos activos (vigentes)
export const obtenerBloqueosActivos = async () => {
  try {
    const response = await api.get('/bloqueos/activos');
    return response.data;
  } catch (error) {
    console.error('Error al obtener bloqueos activos:', error);
    throw error;
  }
};

// Obtener bloqueos de un terapeuta específico
export const obtenerBloqueosPorTerapeuta = async (trabajadorId) => {
  try {
    const response = await api.get(`/bloqueos/trabajador/${trabajadorId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener bloqueos del terapeuta:', error);
    throw error;
  }
};

// Obtener un bloqueo por ID
export const obtenerBloqueoPorId = async (id) => {
  try {
    const response = await api.get(`/bloqueos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener bloqueo:', error);
    throw error;
  }
};

// Actualizar un bloqueo
export const actualizarBloqueo = async (id, bloqueoData) => {
  try {
    const response = await api.put(`/bloqueos/${id}`, bloqueoData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar bloqueo:', error);
    throw error;
  }
};

// Eliminar un bloqueo (soft delete). motivoEliminacion queda registrado en auditoría.
export const eliminarBloqueo = async (id, userId, motivoEliminacion) => {
  try {
    const response = await api.delete(`/bloqueos/${id}`, {
      params: { userId },
      data: { motivoEliminacion }
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
    const response = await api.post('/bloqueos/verificar', {
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
    const response = await api.get(`/bloqueos/disponibles/${trabajadorId}`, {
      params: { fecha, horaInicio, horaFin, intervalo }
    });
    return response.data.horarios;
  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    throw error;
  }
};
