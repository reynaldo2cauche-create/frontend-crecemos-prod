import api from './api';

// ─── Catálogos ────────────────────────────────────────────────────────────────

export const obtenerColumnas = () =>
  api.get('/tareas/columnas').then(r => r.data);

export const obtenerPrioridades = () =>
  api.get('/tareas/prioridades').then(r => r.data);

// ─── Tareas ───────────────────────────────────────────────────────────────────

export const listarTareas = () =>
  api.get('/tareas').then(r => r.data);

export const obtenerTarea = (id) =>
  api.get(`/tareas/${id}`).then(r => r.data);

export const crearTarea = (datos) =>
  api.post('/tareas', datos).then(r => r.data);

export const actualizarTarea = (id, datos) =>
  api.put(`/tareas/${id}`, datos).then(r => r.data);

export const eliminarTarea = (id) =>
  api.delete(`/tareas/${id}`).then(r => r.data);

export const moverColumna = (id, columna_id) =>
  api.patch(`/tareas/${id}/columna`, { columna_id }).then(r => r.data);

export const reordenarTareas = (ids) =>
  api.patch('/tareas/reordenar', { ids }).then(r => r.data);

// ─── Timer ────────────────────────────────────────────────────────────────────

export const iniciarTimer = (id) =>
  api.patch(`/tareas/${id}/timer/iniciar`).then(r => r.data);

export const pausarTimer = (id) =>
  api.patch(`/tareas/${id}/timer/pausar`).then(r => r.data);

// ─── Comentarios ─────────────────────────────────────────────────────────────

export const listarComentarios = (tareaId) =>
  api.get(`/tareas/${tareaId}/comentarios`).then(r => r.data);

export const eliminarComentario = (comentarioId) =>
  api.delete(`/tareas/comentarios/${comentarioId}`).then(r => r.data);

export const agregarComentario = (tareaId, contenido, archivos = []) => {
  const form = new FormData();
  form.append('contenido', contenido);
  archivos.forEach(f => form.append('archivos', f));
  return api.post(`/tareas/${tareaId}/comentarios`, form, {
    headers: { 'Content-Type': undefined },
  }).then(r => r.data);
};

// ─── Reporte ─────────────────────────────────────────────────────────────────

export const obtenerReporteMensual = (mes, anio) =>
  api.get(`/tareas/reporte/mensual`, { params: { mes, anio } }).then(r => r.data);

// ─── Columnas (admin) ─────────────────────────────────────────────────────────

export const crearColumna = (datos) =>
  api.post('/tareas/columnas', datos).then(r => r.data);

export const reordenarColumnas = (ids) =>
  api.patch('/tareas/columnas/reordenar', { ids }).then(r => r.data);

export const eliminarColumna = (id) =>
  api.delete(`/tareas/columnas/${id}`).then(r => r.data);

// ─── Archivos ─────────────────────────────────────────────────────────────────

export const listarArchivos = (tareaId) =>
  api.get(`/tareas/${tareaId}/archivos`).then(r => r.data);

export const subirArchivos = (tareaId, files, skipNotification = false) => {
  const form = new FormData();
  files.forEach(f => form.append('archivos', f));
  const url = skipNotification ? `/tareas/${tareaId}/archivos?nonotif=1` : `/tareas/${tareaId}/archivos`;
  return api.post(url, form, {
    headers: { 'Content-Type': undefined },
  }).then(r => r.data);
};

export const eliminarArchivo = (tareaId, archivoId) =>
  api.delete(`/tareas/${tareaId}/archivos/${archivoId}`).then(r => r.data);

export const verificarTareasVencidas = () =>
  api.post('/notificaciones/forzar-verificacion-tareas-vencidas').catch(() => {});

// ─── Archivadas ───────────────────────────────────────────────────────────────

export const listarArchivadas = (params = {}) =>
  api.get('/tareas/archivadas', { params }).then(r => r.data);

export const restaurarTarea = (id) =>
  api.patch(`/tareas/${id}/restaurar`).then(r => r.data);

export const archivarTarea = (id) =>
  api.patch(`/tareas/${id}/archivar`).then(r => r.data);
