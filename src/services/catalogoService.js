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

  // TEMPORAL: Limpiar caché para forzar reordenamiento
  // TODO: Remover después de verificar que funciona
  cacheManager.delete(cacheKey);

  const cached = cacheManager.get(cacheKey);
  if (cached) return cached;

  const response = await api.get('/catalogos/servicios');

  // Ordenar servicios: primero Infantil, luego Adultos
  const serviciosOrdenados = response.data.sort((a, b) => {
    const areaNombreA = (a.area?.nombre || '').toLowerCase().trim();
    const areaNombreB = (b.area?.nombre || '').toLowerCase().trim();

    // Verificar si es infantil (con variaciones posibles)
    const esInfantilA = areaNombreA.includes('infantil');
    const esInfantilB = areaNombreB.includes('infantil');

    // Si A es Infantil y B no, A va primero
    if (esInfantilA && !esInfantilB) return -1;
    // Si B es Infantil y A no, B va primero
    if (!esInfantilA && esInfantilB) return 1;
    // Si ambos son del mismo tipo, mantener el orden original
    return 0;
  });

  console.log('🔍 Servicios ordenados:', serviciosOrdenados.map(s => ({ nombre: s.nombre, area: s.area?.nombre })));

  cacheManager.set(cacheKey, serviciosOrdenados, CATALOG_TTL);
  return serviciosOrdenados;
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

export const getModalidades = async () => {
  const cacheKey = 'catalogos:modalidades';
  const cached = cacheManager.get(cacheKey);
  if (cached) return cached;

  const response = await api.get('/catalogos/modalidades');
  cacheManager.set(cacheKey, response.data, CATALOG_TTL);
  return response.data;
};

export const getFrecuencias = async () => {
  const cacheKey = 'catalogos:frecuencias';
  const cached = cacheManager.get(cacheKey);
  if (cached) return cached;

  const response = await api.get('/catalogos/frecuencias');
  cacheManager.set(cacheKey, response.data, CATALOG_TTL);
  return response.data;
};

export const getTipoBloqueo = async () => {
  const cacheKey = 'catalogos:tipo-bloqueo';
  const cached = cacheManager.get(cacheKey);
  if (cached) return cached;

  const response = await api.get('/catalogos/tipo-bloqueo');
  cacheManager.set(cacheKey, response.data, CATALOG_TTL);
  return response.data;
};