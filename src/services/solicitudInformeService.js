import api, { API_BASE_URL } from './api';
import axios from 'axios';

// ==================== SOLICITUDES DE INFORME ====================

export const crearSolicitudInforme = async (solicitudData) => {
  try {
    const response = await api.post('/solicitudes-informe', solicitudData);
    return response.data;
  } catch (error) {
    console.error('Error al crear solicitud de informe:', error);
    throw error;
  }
};

export const obtenerSolicitudesInforme = async () => {
  try {
    const response = await api.get('/solicitudes-informe');
    return response.data;
  } catch (error) {
    console.error('Error al obtener solicitudes de informe:', error);
    throw error;
  }
};

export const obtenerSolicitudInformePorId = async (solicitudId) => {
  try {
    const response = await api.get(`/solicitudes-informe/${solicitudId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener solicitud de informe:', error);
    throw error;
  }
};

export const obtenerSolicitudesInformePorPaciente = async (pacienteId) => {
  try {
    const response = await api.get(`/solicitudes-informe/paciente/${pacienteId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener solicitudes de informe del paciente:', error);
    throw error;
  }
};

export const obtenerSolicitudesInformePorEspecialista = async (especialistaId) => {
  try {
    const response = await api.get(`/solicitudes-informe/especialista/${especialistaId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener solicitudes de informe del especialista:', error);
    throw error;
  }
};

export const actualizarSolicitudInforme = async (solicitudId, solicitudData) => {
  try {
    const response = await api.patch(`/solicitudes-informe/${solicitudId}`, solicitudData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar solicitud de informe:', error);
    throw error;
  }
};

export const eliminarSolicitudInforme = async (solicitudId) => {
  try {
    const response = await api.delete(`/solicitudes-informe/${solicitudId}`);
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
 * @param {File} archivo - Archivo PDF/Word
 */
export const subirArchivoInforme = async (solicitudId, archivo) => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📤 Subiendo archivo para solicitud #' + solicitudId);
    console.log('📎 Archivo:', archivo);
    console.log('   - Nombre:', archivo.name);
    console.log('   - Tipo:', archivo.type);
    console.log('   - Tamaño:', archivo.size + ' bytes');
    console.log('   - Es File?:', archivo instanceof File);

    const formData = new FormData();
    formData.append('archivo', archivo);

    // Debug: ver contenido del FormData
    console.log('📦 FormData entries:');
    for (let pair of formData.entries()) {
      console.log('   -', pair[0], ':', pair[1]);
    }

    // Obtener token manualmente (ya que no usamos api.js que lo agrega automáticamente)
    const token = localStorage.getItem('access_token');

    // Usar axios directamente sin las configuraciones globales de api.js
    // que fuerzan 'Content-Type': 'application/json'
    const response = await axios.post(
      `${API_BASE_URL}/solicitudes-informe/${solicitudId}/subir-archivo`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // NO definir Content-Type - Axios lo generará automáticamente como multipart/form-data con boundary
        },
      }
    );

    console.log('✅ Respuesta del servidor:', response.data);
    console.log('📋 Nuevo estado:', response.data?.estado_solicitud_id);
    console.log('🔗 URL del archivo:', response.data?.archivo_url);

    return response.data;
  } catch (error) {
    console.error('❌ Error al subir archivo del informe:', error);
    console.error('❌ Detalles del error:', error.response?.data);
    throw error;
  }
};

/**
 * PASO 2 — Jefa revisa el informe (aprueba o rechaza).
 * Estado: Pendiente Revisión → Aprobado (4) o Rechazado (3).
 * @param {number} solicitudId
 * @param {{ estado_id: 3 | 4, comentario?: string }} data
 */
export const revisarInforme = async (solicitudId, data) => {
  try {
    const response = await api.patch(`/solicitudes-informe/${solicitudId}/revisar`, data);
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
 */
export const marcarInformeEntregado = async (solicitudId) => {
  try {
    const response = await api.patch(`/solicitudes-informe/${solicitudId}/entregar`, {});
    return response.data;
  } catch (error) {
    console.error('Error al marcar informe como entregado:', error);
    throw error;
  }
};

// ==================== HISTORIAL DE ESTADO ====================

/**
 * Obtiene el historial de cambios de estado de una solicitud.
 * @param {number} solicitudId
 */
export const obtenerHistorialEstadoSolicitud = async (solicitudId) => {
  try {
    const response = await api.get(`/solicitudes-informe/${solicitudId}/historial`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial de estado:', error);
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
    const response = await api.get(`/solicitudes-informe/${solicitudId}/revisiones`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener revisiones del informe:', error);
    throw error;
  }
};

// ==================== CATÁLOGOS ====================

export const obtenerModalidadesPago = async () => {
  try {
    const response = await api.get('/solicitudes-informe/catalogos/modalidades-pago');
    return response.data;
  } catch (error) {
    console.error('Error al obtener modalidades de pago:', error);
    throw error;
  }
};

export const obtenerEstadosPago = async () => {
  try {
    const response = await api.get('/solicitudes-informe/catalogos/estados-pago');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estados de pago:', error);
    throw error;
  }
};

export const obtenerEstadosSolicitud = async () => {
  try {
    const response = await api.get('/solicitudes-informe/catalogos/estados-solicitud');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estados de solicitud:', error);
    throw error;
  }
};

/**
 * Verifica si una venta de servicio tiene una solicitud de informe asociada.
 * @param {number} ventaId
 * @returns {Promise<{tieneSolicitud: boolean, mensaje?: string}>}
 */
export const verificarVentaTieneSolicitudInforme = async (ventaId) => {
  try {
    const response = await api.get(`/solicitudes-informe/por-venta/${ventaId}`);
    return response.data;
  } catch (error) {
    console.error('Error al verificar solicitud de informe:', error);
    throw error;
  }
};