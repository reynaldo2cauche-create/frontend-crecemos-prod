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

// ==================== WORKFLOW ====================

/**
 * PASO 1 — Terapeuta sube el archivo del informe.
 * Estado: Pendiente Subida → Pendiente Revisión.
 * @param {number} solicitudId
 * @param {{ archivo_url: string, user_actua_id?: number }} data
 */
export const subirArchivoInforme = async (solicitudId, data) => {
  try {
    const response = await api.patch(`/solicitud-informe/${solicitudId}/subir-archivo`, data);
    return response.data;
  } catch (error) {
    console.error('Error al subir archivo del informe:', error);
    throw error;
  }
};

/**
 * PASO 2 — Jefa revisa el informe (aprueba o rechaza).
 * Estado: Pendiente Revisión → Aprobado (4) o Rechazado (3).
 * @param {number} solicitudId
 * @param {{ estado_id: 3 | 4, revisor_id: number, comentario?: string }} data
 */
export const revisarInforme = async (solicitudId, data) => {
  try {
    const response = await api.patch(`/solicitud-informe/${solicitudId}/revisar`, data);
    return response.data;
  } catch (error) {
    console.error('Error al revisar el informe:', error);
    throw error;
  }
};

/**
 * PASO 3 — Admisión marca el informe como entregado al paciente.
 * Estado: Aprobado → Entregado (5).
 * @param {number} solicitudId
 * @param {{ user_actua_id?: number }} data
 */
export const marcarInformeEntregado = async (solicitudId, data = {}) => {
  try {
    const response = await api.patch(`/solicitud-informe/${solicitudId}/marcar-entregado`, data);
    return response.data;
  } catch (error) {
    console.error('Error al marcar informe como entregado:', error);
    throw error;
  }
};

// ==================== HISTORIAL DE REVISIONES ====================

/**
 * Obtiene el historial completo de revisiones de una solicitud.
 * @param {number} solicitudId
 */
export const obtenerRevisionesInforme = async (solicitudId) => {
  try {
    const response = await api.get(`/solicitud-informe/${solicitudId}/revisiones`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener revisiones del informe:', error);
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

export const obtenerEstadosSolicitud = async () => {
  try {
    const response = await api.get('/solicitud-informe/catalogos/estados-solicitud');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estados de solicitud:', error);
    throw error;
  }
};