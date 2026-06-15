import api from './api';

// Servicios de terapia del paciente que el usuario puede planificar
export const getServiciosPlan = (pacienteId) =>
  api.get(`/plan-terapeutico/servicios/${pacienteId}`).then((r) => r.data);

// Áreas de trabajo del catálogo para un servicio
export const getAreasServicio = (servicioId) =>
  api.get(`/plan-terapeutico/areas/${servicioId}`).then((r) => r.data);

// Plan completo: sesiones + generales → específicos → registros + progresos
export const getPlan = (pacienteId, servicioId) =>
  api.get(`/plan-terapeutico/plan/${pacienteId}/${servicioId}`).then((r) => r.data);

// Actualizar cabecera del plan (metodología, fechas, periodicidad)
export const actualizarPlan = (planId, body) =>
  api.patch(`/plan-terapeutico/plan/${planId}`, body).then((r) => r.data);

// ── Objetivos generales ──
export const crearGeneral = (body) =>
  api.post('/plan-terapeutico/general', body).then((r) => r.data);
export const editarGeneral = (id, body) =>
  api.patch(`/plan-terapeutico/general/${id}`, body).then((r) => r.data);
export const eliminarGeneral = (id) =>
  api.delete(`/plan-terapeutico/general/${id}`).then((r) => r.data);

// ── Objetivos específicos ──
export const crearEspecifico = (body) =>
  api.post('/plan-terapeutico/especifico', body).then((r) => r.data);
export const editarEspecifico = (id, body) =>
  api.patch(`/plan-terapeutico/especifico/${id}`, body).then((r) => r.data);
export const eliminarEspecifico = (id) =>
  api.delete(`/plan-terapeutico/especifico/${id}`).then((r) => r.data);

// Registrar/actualizar el resultado de un específico en una sesión
export const guardarRegistro = (body) =>
  api.put('/plan-terapeutico/registro', body).then((r) => r.data);

// ── Asignación de objetivos por sesión ──
export const asignarObjetivoSesion = (body) =>
  api.post('/plan-terapeutico/asignacion-sesion', body).then((r) => r.data);
export const desasignarObjetivoSesion = (especificoId, numeroSesion) =>
  api.delete(`/plan-terapeutico/asignacion-sesion/${especificoId}/${numeroSesion}`).then((r) => r.data);
