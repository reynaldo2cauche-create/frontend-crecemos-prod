import api from './api';

// ==========================================
// RUTAS PÚBLICAS (sin autenticación)
// ==========================================

/**
 * Crear un nuevo reclamo (PÚBLICO)
 */
export const crearReclamoPublico = async (formData) => {
  const response = await api.post('/libro-reclamaciones/publico/crear', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Consultar reclamo por código y documento (PÚBLICO)
 */
export const consultarReclamoPublico = async (codigo, documento) => {
  const response = await api.get('/libro-reclamaciones/publico/consultar', {
    params: { codigo, documento },
  });
  return response.data;
};

/**
 * Obtener catálogos (estados, tipos de solicitud, tipos de bien) (PÚBLICO)
 */
export const obtenerCatalogos = async () => {
  const response = await api.get('/libro-reclamaciones/publico/catalogos');
  return response.data;
};

// ==========================================
// RUTAS ADMINISTRATIVAS (con autenticación)
// ==========================================

/**
 * Listar todos los reclamos con filtros (ADMIN)
 */
export const listarReclamos = async (filtros = {}) => {
  const response = await api.get('/libro-reclamaciones', {
    params: filtros,
  });
  return response.data;
};

/**
 * Obtener detalle de un reclamo (ADMIN)
 */
export const obtenerReclamo = async (id) => {
  const response = await api.get(`/libro-reclamaciones/${id}`);
  return response.data;
};

/**
 * Responder a un reclamo (ADMIN)
 */
export const responderReclamo = async (id, data) => {
  const response = await api.put(`/libro-reclamaciones/${id}/responder`, data);
  return response.data;
};

/**
 * Cambiar estado de un reclamo (ADMIN)
 */
export const cambiarEstadoReclamo = async (id, data) => {
  const response = await api.put(`/libro-reclamaciones/${id}/estado`, data);
  return response.data;
};

/**
 * Obtener estadísticas (ADMIN)
 */
export const obtenerEstadisticas = async () => {
  const response = await api.get('/libro-reclamaciones/admin/estadisticas');
  return response.data;
};

/**
 * Enviar correo con PDF adjunto (PÚBLICO)
 */
export const enviarCorreoConPDF = async (codigoReclamo, documento, pdfBlob) => {
  const formData = new FormData();
  formData.append('codigo_reclamo', codigoReclamo);
  formData.append('documento', documento);
  formData.append('pdf', pdfBlob, `Reclamo-${codigoReclamo}.pdf`);

  const response = await api.post('/libro-reclamaciones/publico/enviar-correo-pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
