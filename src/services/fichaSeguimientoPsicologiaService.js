import axios from 'axios';
import api, { API_BASE_URL } from './api';

// Instancia sin interceptores para los endpoints públicos (los usa la docente,
// que no tiene sesión). Evita el redirect a /intranet del interceptor de `api`.
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const BASE = '/ficha-seguimiento-psicologia';

// ─── Protegidos (Admisión / Administrador / Terapeuta) ───

export const generarFicha = async ({ paciente_id, periodo_observacion, fecha_entrega, fecha_devolucion, user_id_crea }) => {
  const { data } = await api.post(BASE, {
    paciente_id,
    periodo_observacion,
    fecha_entrega,
    fecha_devolucion,
    user_id_crea,
  });
  return data; // { id, token, estado }
};

export const getFichasPorPaciente = async (pacienteId) => {
  const { data } = await api.get(`${BASE}/paciente/${pacienteId}`);
  return data;
};

export const anularFicha = async (id) => {
  const { data } = await api.delete(`${BASE}/${id}`);
  return data;
};

// ─── Públicos (docente, sin login) ───

export const getFichaPublica = async (token) => {
  const { data } = await publicApi.get(`${BASE}/publico/${token}`);
  return data;
};

export const enviarFichaPublica = async (token, payload) => {
  const { data } = await publicApi.post(`${BASE}/publico/${token}`, payload);
  return data;
};

// Construye el link público que se comparte con la docente.
export const buildFichaLink = (token) => `${window.location.origin}/ficha-seguimiento-psicologia/${token}`;
