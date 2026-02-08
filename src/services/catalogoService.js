import api from './api';
import cacheManager from '../utils/cacheManager';

// ✅ CATÁLOGOS CON CACHÉ - Optimizado para tablets
// TTL de 1 hora para catálogos estáticos
const CATALOG_TTL = 60 * 60 * 1000; // 1 hora

export const getTiposDocumento = async () => {
  const cacheKey = 'catalogos:tipo-documento';
  const cached = cacheManager.get(cacheKey);
  if (cached) return cached;

  const response = await api.get('/catalogos/tipo-documento');
  cacheManager.set(cacheKey, response.data, CATALOG_TTL);
  return response.data;
};

export const getGeneros = async () => {
  const cacheKey = 'catalogos:sexo';
  const cached = cacheManager.get(cacheKey);
  if (cached) return cached;

  const response = await api.get('/catalogos/sexo');
  cacheManager.set(cacheKey, response.data, CATALOG_TTL);
  return response.data;
};

export const getProvincias = async () => {
  const cacheKey = 'catalogos:provincias';
  const cached = cacheManager.get(cacheKey);
  if (cached) return cached;

  const response = await api.get('/catalogos/provincias');
  cacheManager.set(cacheKey, response.data, CATALOG_TTL);
  return response.data;
};

export const getDistritos = async () => {
  const cacheKey = 'catalogos:distrito';
  const cached = cacheManager.get(cacheKey);
  if (cached) return cached;

  const response = await api.get('/catalogos/distrito');
  cacheManager.set(cacheKey, response.data, CATALOG_TTL);
  return response.data;
};

export const getDistritosByProvincia = async (provinciaId) => {
  const cacheKey = `catalogos:distritos-provincia-${provinciaId}`;
  const cached = cacheManager.get(cacheKey);
  if (cached) return cached;

  const response = await api.get(`/catalogos/distritos/provincia/${provinciaId}`);
  cacheManager.set(cacheKey, response.data, CATALOG_TTL);
  return response.data;
};

export const getServicios = async () => {
  const cacheKey = 'catalogos:servicios';
  const cached = cacheManager.get(cacheKey);
  if (cached) return cached;

  const response = await api.get('/catalogos/servicios');
  cacheManager.set(cacheKey, response.data, CATALOG_TTL);
  return response.data;
};

export const getRelacionesResponsable = async () => {
  const response = await api.get('/catalogos/relacion-responsable');
  return response.data;
};

export const getGradosEscolares = async () => {
  const response = await api.get('/catalogos/grado-escolar');
  return response.data;
};

export const getAtenciones = async () => {
  const response = await api.get('/catalogos/atenciones');
  return response.data;
};

export const getRelacionPadres = async () => {
  const response = await api.get('/catalogos/relacion-padres');
  return response.data;
};

export const getOcupaciones = async () => {
  const response = await api.get('/catalogos/ocupaciones');
  return response.data;
};

export const getEstadosCiviles = async () => {
  const response = await api.get('/catalogos/estado-civil');
  return response.data;
};

export const getParentescos = async () => {
  const response = await api.get('/catalogos/parentesco');
  return response.data;
};

export const getNivelesEducacion = async () => {
  const response = await api.get('/catalogos/nivel-educacion');
  return response.data;
}; 