import api from './api';

const BASE = '/beneficios';

export const getPuntosPaciente = (pacienteId) =>
  api.get(`${BASE}/paciente/${pacienteId}/puntos`).then((r) => r.data);
// ── Config del programa ──
export const getConfigBeneficios = () => api.get(`${BASE}/config`).then(r => r.data);

export const actualizarConfigBeneficios = (porcentaje, motivo) =>
  api.patch(`${BASE}/config`, { porcentaje, motivo }).then(r => r.data);

// ── Calculadora de puntos ──
export const calcularPuntos = (precio, porcentaje) =>
  api.get(`${BASE}/calcular`, { params: { precio, porcentaje } }).then(r => r.data.puntos);

// ── Catálogo de premios (productos canjeables) ──
export const getPremios = (q) =>
  api.get(`${BASE}/premios`, { params: q ? { q } : {} }).then(r => r.data);

export const guardarPremio = (data) => api.post(`${BASE}/premios`, data).then(r => r.data);

export const quitarPremio = (id) => api.delete(`${BASE}/premios/${id}`).then(r => r.data);
