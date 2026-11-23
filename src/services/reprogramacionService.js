import api from './api';

const BASE = '/solicitudes-reprogramacion';

/**
 * Crea una solicitud de reprogramación (Admisión, a partir de la 2ª vez).
 * @param {object} data { cita_id, paciente_id, solicitante_id, motivo,
 *   fecha_nueva, hora_inicio_nueva, hora_fin_nueva, doctor_nombre_nuevo,
 *   servicio_nombre_nuevo, payload }
 *   `payload` = el mismo citaDto que se usaría para editar la cita.
 */
export const crearSolicitudReprogramacion = async (data) => {
  const response = await api.post(BASE, data);
  return response.data;
};

/** Listado para el Admin. estado opcional: 'pendiente' | 'aprobada' | 'rechazada' */
export const getSolicitudesReprogramacion = async (estado) => {
  const url = estado ? `${BASE}?estado=${encodeURIComponent(estado)}` : BASE;
  const response = await api.get(url);
  return response.data;
};

export const getSolicitudReprogramacion = async (id) => {
  const response = await api.get(`${BASE}/${id}`);
  return response.data;
};

/** Última solicitud de una cita (para mostrar su estado/respuesta en el modal). */
export const getSolicitudReprogramacionPorCita = async (citaId) => {
  const response = await api.get(`${BASE}/por-cita/${citaId}`);
  return response.data; // puede ser null
};

/** Cantidad de pendientes (badge del menú). */
export const getPendientesReprogramacionCount = async () => {
  const response = await api.get(`${BASE}/pendientes/count`);
  return response.data;
};

/**
 * Aprueba o rechaza. Al aprobar, el backend aplica el cambio a la cita.
 * @param {number} id
 * @param {object} body { estado: 'aprobada'|'rechazada', revisor_id, comentario }
 */
export const revisarSolicitudReprogramacion = async (id, body) => {
  const response = await api.patch(`${BASE}/${id}/revisar`, body);
  return response.data;
};

export const eliminarSolicitudReprogramacion = async (id) => {
  const response = await api.delete(`${BASE}/${id}`);
  return response.data;
};
