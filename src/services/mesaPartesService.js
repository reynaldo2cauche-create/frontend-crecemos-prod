import api, { SERVER_BASE_URL } from './api';

// ─── Catálogos y estadísticas ───
export const getCatalogos = async () => {
  const { data } = await api.get('/mesa-partes/catalogos');
  return data.data; // { estados, tipos, tiposEvento }
};

export const getEstadisticas = async () => {
  const { data } = await api.get('/mesa-partes/estadisticas');
  return data.data; // { total, porEstado }
};

// ─── Bandeja / listado ───
export const listarSolicitudes = async (filtros = {}) => {
  const { data } = await api.get('/mesa-partes', { params: filtros });
  return data; // { success, data, total, page, limit, totalPages }
};

export const getSolicitud = async (id) => {
  const { data } = await api.get(`/mesa-partes/${id}`);
  return data.data; // expediente con eventos + adjuntos
};

// ─── Registrar (recepción) ───
// payload: { paciente_id?, tipo_id, descripcion, entregado_por_nombre,
//            entregado_por_doc?, entregado_por_telefono?, user_crea_id }
// archivos: File[]
export const crearSolicitud = async (payload, archivos = []) => {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') fd.append(k, v);
  });
  archivos.forEach((f) => fd.append('archivos', f));
  const { data } = await api.post('/mesa-partes', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

// ─── Responder (admin): atender / rechazar ───
// payload: { resultado: 'ATENDIDA'|'RECHAZADA', respuesta, usuario_id }
export const responderSolicitud = async (id, payload, archivos = []) => {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') fd.append(k, v);
  });
  archivos.forEach((f) => fd.append('archivos', f));
  const { data } = await api.put(`/mesa-partes/${id}/responder`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

// ─── Acciones simples (observar / notificar / entregar / comentar) ───
export const observarSolicitud = (id, payload) =>
  api.put(`/mesa-partes/${id}/observar`, payload).then((r) => r.data.data);

export const notificarSolicitud = (id, payload) =>
  api.put(`/mesa-partes/${id}/notificar`, payload).then((r) => r.data.data);

export const entregarSolicitud = (id, payload) =>
  api.put(`/mesa-partes/${id}/entregar`, payload).then((r) => r.data.data);

export const comentarSolicitud = (id, payload) =>
  api.put(`/mesa-partes/${id}/comentar`, payload).then((r) => r.data.data);

// Buscar pacientes (endpoint propio del módulo, sin geofencing)
export const buscarPacientesMP = async (q) => {
  if (!q || q.trim().length < 2) return [];
  const { data } = await api.get('/mesa-partes/pacientes/buscar', { params: { q } });
  return data.data || [];
};

// Abre un adjunto de forma autenticada (en prod /uploads no llega al backend).
// Descarga el archivo como blob con el token y devuelve un Object URL para abrirlo.
export const verAdjunto = async (ruta) => {
  const filename = String(ruta).split('/').pop();
  const { data } = await api.get(`/mesa-partes/archivo/${filename}`, { responseType: 'blob' });
  return URL.createObjectURL(data);
};

// (Fallback) URL directa por /uploads — solo útil en desarrollo
export const buildAdjuntoUrl = (ruta) => `${SERVER_BASE_URL}/uploads/${ruta}`;
