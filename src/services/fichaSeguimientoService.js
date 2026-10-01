import axios from 'axios';
import api, { API_BASE_URL } from './api';

// Instancia sin interceptores para los endpoints públicos (los usa la docente,
// que no tiene sesión). Evita el redirect a /intranet del interceptor de `api`.
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Protegidos (Admisión / Administrador / Terapeuta) ───

export const generarFicha = async ({ paciente_id, periodo_observacion, fecha_entrega, fecha_devolucion, user_id_crea }) => {
  const { data } = await api.post('/ficha-seguimiento', {
    paciente_id,
    periodo_observacion,
    fecha_entrega,
    fecha_devolucion,
    user_id_crea,
  });
  return data; // { id, token, estado }
};

export const getFichasPorPaciente = async (pacienteId) => {
  const { data } = await api.get(`/ficha-seguimiento/paciente/${pacienteId}`);
  return data;
};

export const anularFicha = async (id) => {
  const { data } = await api.delete(`/ficha-seguimiento/${id}`);
  return data;
};

// ─── Públicos (docente, sin login) ───

export const getFichaPublica = async (token) => {
  const { data } = await publicApi.get(`/ficha-seguimiento/publico/${token}`);
  return data;
};

export const enviarFichaPublica = async (token, payload) => {
  const { data } = await publicApi.post(`/ficha-seguimiento/publico/${token}`, payload);
  return data;
};

// Construye el link público que se comparte con la docente.
// Usa el mismo origen donde está abierta la app: localhost:5173 en desarrollo,
// https://www.crecemos.com.pe en producción.
export const buildFichaLink = (token) => `${window.location.origin}/ficha-seguimiento/${token}`;
