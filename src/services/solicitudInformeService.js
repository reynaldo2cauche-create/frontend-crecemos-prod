import api from './api';

// ==================== SOLICITUDES DE INFORME ====================

export const crearSolicitudInforme = async (solicitudData) => {
  try {
    const response = await api.post('/solicitud-informe', solicitudData);
    return response.data;
  } catch (error) {
    console.error('Error al crear solicitud de informe:', error);
    throw error;
  }
};

export const obtenerSolicitudesInforme = async () => {
  try {
    const response = await api.get('/solicitud-informe');
    return response.data;
  } catch (error) {
    console.error('Error al obtener solicitudes de informe:', error);
    throw error;
  }
};

export const obtenerSolicitudInformePorId = async (solicitudId) => {
  try {
    const response = await api.get(`/solicitud-informe/${solicitudId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener solicitud de informe:', error);
    throw error;
  }
};

export const obtenerSolicitudesInformePorPaciente = async (pacienteId) => {
  try {
    const response = await api.get(`/solicitud-informe/paciente/${pacienteId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener solicitudes de informe del paciente:', error);
    throw error;
  }
};

export const obtenerSolicitudesInformePorEspecialista = async (especialistaId) => {
  try {
    const response = await api.get(`/solicitud-informe/especialista/${especialistaId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener solicitudes de informe del especialista:', error);
    throw error;
  }
};

export const actualizarSolicitudInforme = async (solicitudId, solicitudData) => {
  try {
    const response = await api.patch(`/solicitud-informe/${solicitudId}`, solicitudData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar solicitud de informe:', error);
    throw error;
  }
};

export const eliminarSolicitudInforme = async (solicitudId) => {
  try {
    const response = await api.delete(`/solicitud-informe/${solicitudId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar solicitud de informe:', error);
    throw error;
  }
};

// ==================== CATÁLOGOS ====================

export const obtenerModalidadesPago = async () => {
  try {
    const response = await api.get('/solicitud-informe/catalogos/modalidades-pago');
    return response.data;
  } catch (error) {
    console.error('Error al obtener modalidades de pago:', error);
    throw error;
  }
};

export const obtenerEstadosPago = async () => {
  try {
    const response = await api.get('/solicitud-informe/catalogos/estados-pago');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estados de pago:', error);
    throw error;
  }
};
