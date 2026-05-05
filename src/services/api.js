import axios from "axios";
import { obtenerUbicacionActual } from "./geolocationService";
import ReactDOM from 'react-dom/client';
import React from 'react';
import SessionExpiredModal from '../components/SessionExpiredModal';

// URL base del servidor (para archivos estáticos como imágenes)
// export const SERVER_BASE_URL = 'http://localhost:3001';
export const SERVER_BASE_URL = 'https://www.crecemos.com.pe';


// URL base de la API
export const API_BASE_URL = `${SERVER_BASE_URL}/backend_api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor para agregar el token Y coordenadas GPS en cada petición
api.interceptors.request.use(
  async (config) => {
    // 1. Agregar token de autenticación
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Agregar coordenadas GPS PARA TODOS LOS USUARIOS (auditoría)
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);

        // Intentar obtener ubicación para TODOS los usuarios (para auditoría)
        try {
          const ubicacion = await obtenerUbicacionActual();
          config.headers['x-user-latitude'] = ubicacion.lat.toString();
          config.headers['x-user-longitude'] = ubicacion.lng.toString();
          console.log(`📍 Coordenadas agregadas al request: ${ubicacion.lat}, ${ubicacion.lng}`);
        } catch (gpsError) {
          console.warn('⚠️ No se pudo obtener ubicación GPS:', gpsError.message);
          // No bloqueamos el request si falla el GPS
        }
      }
    } catch (error) {
      console.warn('⚠️ Error al procesar ubicación GPS:', error.message);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación Y geofencing
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar error 401 (No autenticado)
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
        const errorData = error.response.data;

        // 🔒 Detectar si la sesión fue cerrada por login en otro dispositivo
        if (errorData?.code === 'SESSION_EXPIRED' || errorData?.message?.includes('sesión en otro dispositivo')) {
          // Mostrar modal profesional
          console.log('🔒 Sesión cerrada: Login detectado en otro dispositivo');

          // Crear contenedor para el modal si no existe
          let modalContainer = document.getElementById('session-expired-modal-root');
          if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'session-expired-modal-root';
            document.body.appendChild(modalContainer);
          }

          // Renderizar modal con React
          const root = ReactDOM.createRoot(modalContainer);
          root.render(
            React.createElement(SessionExpiredModal, {
              isOpen: true,
              onClose: () => {
                // Limpiar sesión y redirigir
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                window.location.href = '/intranet';
              }
            })
          );

          return Promise.reject(error);
        }

        // Token inválido o expirado, redirigir al login solo si NO es endpoint público
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/intranet';
      }
    }

    // Manejar error 403 (Fuera del perímetro de geofencing)
    if (error.response && error.response.status === 403) {
      const errorData = error.response.data;

      if (errorData.code === 'FUERA_DEL_PERIMETRO') {
        console.error('❌ Acceso denegado por geofencing:', errorData);

        // Agregar información del error para que el componente pueda mostrarla
        error.geofencingError = {
          message: errorData.message,
          distancia: errorData.details?.distancia,
          radioPermitido: errorData.details?.radioPermitido
        };
      }
    }

    // Manejar error 400 (Ubicación requerida)
    if (error.response && error.response.status === 400) {
      const errorData = error.response.data;

      if (errorData.code === 'UBICACION_REQUERIDA' || errorData.code === 'COORDENADAS_INVALIDAS') {
        console.error('⚠️ Error de ubicación:', errorData);

        error.geofencingError = {
          message: errorData.message,
          details: errorData.details
        };
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

// ============== FUNCIONES DE JEFE/SUPERVISORA ==============

/**
 * Obtiene la lista de subordinados directos de un jefe terapeuta
 */
export const getSubordinados = async (jefeId) => {
  const response = await api.get(`/terapeuta/${jefeId}/subordinados`);
  return response.data;
};

// ============== FUNCIONES DE VENTAS/SESIONES ==============

/**
 * Obtiene sesiones disponibles para un paciente
 * @param {number} pacienteId - ID del paciente
 * @param {number} servicioId - ID del servicio (opcional, para filtrar)
 * @returns {Promise<Array>} Lista de sesiones disponibles del paciente
 */
export const obtenerSesionesDisponibles = async (pacienteId, servicioId = null) => {
  const params = servicioId ? { servicioId } : {};
  const response = await api.get(`/citas/paciente/${pacienteId}/sesiones-disponibles`, { params });
  return response.data;
};

export default api;



