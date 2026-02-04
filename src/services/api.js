import axios from "axios";

// URL base del servidor (para archivos estáticos como imágenes)
export const SERVER_BASE_URL = 'http://localhost:3001';
// export const SERVER_BASE_URL = 'https://www.crecemos.com.pe';

// URL base de la API
export const API_BASE_URL = `${SERVER_BASE_URL}/backend_api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor para agregar el token en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Endpoints públicos que NO deben redirigir al login
      const publicEndpoints = [
        '/pacientes/check-documento',
        '/pacientes/completo',
        '/pacientes/beneficios',
        '/catalogos/tipo-documento',
        '/catalogos/sexo',
        '/catalogos/distrito',
        '/catalogos/relacion-responsable',
        '/catalogos/servicios',
        '/catalogos/grado-escolar',
        '/catalogos/area-servicio'
      ];

      const requestUrl = error.config?.url || '';
      const isPublicEndpoint = publicEndpoints.some(endpoint => requestUrl.includes(endpoint));

      if (!isPublicEndpoint) {
        // Token inválido o expirado, redirigir al login solo si NO es endpoint público
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/intranet';
      }
    }
    return Promise.reject(error);
  }
);

// ============== FUNCIONES DE ASISTENCIAS ==============

/**
 * Obtener lista de terapeutas
 */
export const obtenerTerapeutas = async () => {
  const response = await api.get('/trabajadores/terapeutas');
  return response.data;
};

/**
 * Obtener asistencias por terapeuta
 */
export const obtenerAsistenciasPorTerapeuta = async (terapeutaId, fechaInicio, fechaFin) => {
  const response = await api.get(`/asistencia/por-terapeuta/${terapeutaId}`, {
    params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
  });
  return response.data;
};

/**
 * Obtener asistencias por paciente
 */
export const obtenerAsistenciasPorPaciente = async (pacienteId, fechaInicio, fechaFin) => {
  const response = await api.get(`/asistencia/por-paciente/${pacienteId}`, {
    params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
  });
  return response.data;
};

/**
 * Obtener inconsistencias de asistencia
 */
export const obtenerInconsistenciasAsistencia = async (fechaInicio, fechaFin) => {
  const response = await api.get('/asistencia/inconsistencias', {
    params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
  });
  return response.data;
};

/**
 * Obtener todas las asistencias (ADMINISTRADOR)
 */
export const obtenerTodasAsistenciasAdmin = async (fechaInicio, fechaFin) => {
  const response = await api.get('/asistencia/admin/todas', {
    params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
  });
  return response.data;
};

/**
 * Modificar asistencia (SOLO ADMINISTRADOR)
 */
export const modificarAsistenciaAdmin = async (citaId, recepcionEstado, terapeutaEstado, adminUsuarioId) => {
  const response = await api.put(`/asistencia/admin/modificar/${citaId}`, {
    recepcion_estado_id: recepcionEstado,
    terapeuta_estado_id: terapeutaEstado,
    admin_usuario_id: adminUsuarioId
  });
  return response.data;
};

export default api;