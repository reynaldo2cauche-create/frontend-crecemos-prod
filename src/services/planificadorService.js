import api from './api';

// Servicios de terapia del paciente que el usuario puede planificar
export const getServiciosPlanificador = (pacienteId) =>
  api.get(`/planificador/servicios/${pacienteId}`).then((r) => r.data);

// Plan de un servicio: línea de tiempo de sesiones + bloques + objetivos + registros
export const getPlanServicio = (pacienteId, servicioId) =>
  api.get(`/planificador/plan/${pacienteId}/${servicioId}`).then((r) => r.data);

// Agregar un objetivo a un bloque
export const agregarObjetivo = (body) =>
  api.post('/planificador/objetivo', body).then((r) => r.data);

// Editar un objetivo
export const editarObjetivo = (id, body) =>
  api.patch(`/planificador/objetivo/${id}`, body).then((r) => r.data);

// Eliminar (soft) un objetivo
export const eliminarObjetivo = (id) =>
  api.delete(`/planificador/objetivo/${id}`).then((r) => r.data);

// Registrar/actualizar el resultado de un objetivo en una sesión
export const guardarRegistro = (body) =>
  api.put('/planificador/registro', body).then((r) => r.data);
