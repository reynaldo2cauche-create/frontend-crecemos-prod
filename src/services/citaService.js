import api from './api';

export const listarCitas = async (params = {}) => {
  const queryParams = new URLSearchParams();

  // Agregar parámetros si existen
  if (params.terapeuta_id) {
    queryParams.append('terapeuta_id', params.terapeuta_id);
  }

  if (params.fecha_desde) {
    queryParams.append('fecha_desde', params.fecha_desde);
  }

  if (params.fecha_hasta) {
    queryParams.append('fecha_hasta', params.fecha_hasta);
  }

  const url = queryParams.toString() ? `/citas?${queryParams.toString()}` : '/citas';
  const response = await api.get(url);
  return response.data;
};

export const crearCita = async (citaData) => {
  const response = await api.post('/citas', citaData);
  return response.data;
};

// 🆕 NUEVA FUNCIÓN PARA MÚLTIPLES CITAS
export const crearMultiplesCitas = async (citasArray) => {
  const response = await api.post('/citas/multiples', { citas: citasArray });
  return response.data;
};
export const actualizarCita = async (id, citaDto) => {
  try {
    const response = await api.put(`/citas/${id}`, citaDto);
    return response.data;
  } catch (error) {
    console.error('Error actualizando cita:', error);
    throw error;
  }
};

export const eliminarCita = async (id, userId, motivoAccion) => {
  const response = await api.delete(`/citas/${id}`, {
    data: {
      usuario_id: userId,
      motivo_accion: motivoAccion
    }
  });
  return response.data;
};

export const getCitaById = async (id) => {
  const response = await api.get(`/citas/${id}`);
  return response.data;
};

export const getHistorialCita = async (id) => {
  const response = await api.get(`/citas/${id}/historial`);
  return response.data;
};

export const getMotivosCita = async () => {
  const response = await api.get('/citas/catalogos/motivos');
  return response.data;
};

export const getEstadosCita = async () => {
  const response = await api.get('/citas/catalogos/estados');
  return response.data;
};

export const getTiposCita = async () => {
  const response = await api.get('/citas/catalogos/tipos');
  return response.data;
};

