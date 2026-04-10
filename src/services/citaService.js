import api from './api';
import cacheManager from '../utils/cacheManager';

export const listarCitas = async (params = {}) => {
  const queryParams = new URLSearchParams();

  // Agregar parámetros si existen
  if (params.terapeuta_id) {
    queryParams.append('terapeuta_id', params.terapeuta_id);
  }

  if (params.fecha_desde) {
    queryParams.append('fecha_desde', params.fecha_desde);
  }

  if (params.fecha_hasta) {
    queryParams.append('fecha_hasta', params.fecha_hasta);
  }

  const url = queryParams.toString() ? `/citas?${queryParams.toString()}` : '/citas';
  const response = await api.get(url);
  return response.data;
};

export const crearCita = async (citaData) => {
  const response = await api.post('/citas', citaData);
  // ✅ Limpiar caché para forzar recarga de listas
  return response.data;
};

// 🆕 NUEVA FUNCIÓN PARA MÚLTIPLES CITAS
export const crearMultiplesCitas = async (citasArray) => {
  const response = await api.post('/citas/multiples', { citas: citasArray });
  return response.data;
};
export const actualizarCita = async (id, citaDto) => {
  try {
    const response = await api.put(`/citas/${id}`, citaDto);
    // ✅ Invalidar caché de esta cita para forzar recarga
    cacheManager.delete(`cita:${id}`);
    return response.data;
  } catch (error) {
    console.error('Error actualizando cita:', error);
    throw error;
  }
};

export const eliminarCita = async (id, userId, motivoAccion) => {
  const response = await api.delete(`/citas/${id}`, {
    data: {
      usuario_id: userId,
      motivo_accion: motivoAccion
    }
  });
  return response.data;
};

// ✅ OPTIMIZADO: Caché temporal de citas cargadas recientemente (2 minutos)
// Esto evita recargar la misma cita si se abre/cierra rápido
export const getCitaById = async (id) => {
  const cacheKey = `cita:${id}`;
  const cached = cacheManager.get(cacheKey);

  if (cached) {
    console.log(`📦 Cita ${id} cargada desde caché (tablet optimizado)`);
    return cached;
  }

  const response = await api.get(`/citas/${id}`);
  // Cachear por 2 minutos - tiempo suficiente para evitar recargas innecesarias
  cacheManager.set(cacheKey, response.data, 2 * 60 * 1000);
  return response.data;
};

export const getHistorialCita = async (id) => {
  const response = await api.get(`/citas/${id}/historial`);
  return response.data;
};

// ✅ CATÁLOGOS CON CACHÉ - Optimizado para tablets
// Los catálogos no cambian frecuentemente, podemos cachearlos por 30 minutos
export const getMotivosCita = async () => {
  const cacheKey = 'catalogos:motivos';
  const cached = cacheManager.get(cacheKey);

  if (cached) {
    console.log('📦 Motivos cargados desde caché (tablet optimizado)');
    return cached;
  }

  const response = await api.get('/citas/catalogos/motivos');
  cacheManager.set(cacheKey, response.data, 30 * 60 * 1000); // 30 minutos
  return response.data;
};

export const getEstadosCita = async () => {
  const cacheKey = 'catalogos:estados';
  const cached = cacheManager.get(cacheKey);

  if (cached) {
    console.log('📦 Estados cargados desde caché (tablet optimizado)');
    return cached;
  }

  const response = await api.get('/citas/catalogos/estados');
  cacheManager.set(cacheKey, response.data, 30 * 60 * 1000); // 30 minutos
  return response.data;
};

export const getTiposCita = async () => {
  const cacheKey = 'catalogos:tipos';
  const cached = cacheManager.get(cacheKey);

  if (cached) {
    console.log('📦 Tipos cargados desde caché (tablet optimizado)');
    return cached;
  }

  const response = await api.get('/citas/catalogos/tipos');
  cacheManager.set(cacheKey, response.data, 30 * 60 * 1000); // 30 minutos
  return response.data;
};

// Alias para compatibilidad
export const getMotivoCita = getMotivosCita;

// 🛒 OBTENER VENTAS/SESIONES DISPONIBLES DEL PACIENTE
export const getVentasDisponibles = async (pacienteId, servicioId = null, motivoCitaId = null) => {
  const params = new URLSearchParams();
  if (servicioId) params.append('servicio_id', servicioId);
  if (motivoCitaId) params.append('motivo_cita_id', motivoCitaId);

  const url = params.toString()
    ? `/citas/ventas-disponibles/${pacienteId}?${params.toString()}`
    : `/citas/ventas-disponibles/${pacienteId}`;

  const response = await api.get(url);
  return response.data;
};

// 📋 OBTENER LISTADO DETALLADO DE CITAS POR PACIENTE
export const getListadoCitasPorPaciente = async (pacienteId) => {
  const response = await api.get(`/citas/listado-citas/${pacienteId}`);
  return response.data;
};

export const getInfoVentaDeCita = async (citaId) => {
  const response = await api.get(`/citas/${citaId}/info-venta`);
  return response.data;
};

// 📊 OBTENER RESUMEN DE TERAPIAS POR PACIENTE
export const getResumenTerapiasPorPaciente = async (pacienteId) => {
  const response = await api.get(`/citas/resumen-terapias/${pacienteId}`);
  return response.data;
};
