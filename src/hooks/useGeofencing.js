import { useState, useEffect, useCallback } from 'react';
import {
  verificarPerimetro,
  monitorearUbicacion,
  detenerMonitoreo
} from '../services/geolocationService';

/**
 * Hook personalizado para geofencing
 * @param {boolean} activar - Si se debe activar el geofencing
 * @param {number} intervalo - Intervalo de verificación en milisegundos (default: 60000 = 1 minuto)
 * @returns {object} Estado del geofencing
 */
export const useGeofencing = (activar = true, intervalo = 60000) => {
  const [estado, setEstado] = useState({
    cargando: true,
    dentroDelPerimetro: true, // Por defecto permitir acceso
    distancia: null,
    ubicacion: null,
    error: null,
    ultimaVerificacion: null
  });

  // Verificar ubicación una vez
  const verificarUbicacion = useCallback(async () => {
    if (!activar) {
      setEstado(prev => ({ ...prev, cargando: false, dentroDelPerimetro: true }));
      return;
    }

    try {
      setEstado(prev => ({ ...prev, cargando: true, error: null }));

      const resultado = await verificarPerimetro();

      setEstado({
        cargando: false,
        dentroDelPerimetro: resultado.dentroDelPerimetro,
        distancia: resultado.distancia,
        ubicacion: resultado.ubicacion,
        error: null,
        ultimaVerificacion: new Date()
      });

      return resultado;
    } catch (error) {
      if (error.message === 'Permiso de ubicación denegado') {
        console.warn('⚠️ Geolocalización: permiso denegado por el usuario');
      }

      setEstado({
        cargando: false,
        dentroDelPerimetro: true, // En caso de error técnico, permitir acceso
        distancia: null,
        ubicacion: null,
        error: error.message,
        ultimaVerificacion: new Date()
      });

      return null;
    }
  }, [activar]);

  // Efecto para verificación periódica
  useEffect(() => {
    if (!activar) {
      return;
    }

    // Verificar inmediatamente
    verificarUbicacion();

    // Configurar verificación periódica
    const intervalId = setInterval(() => {
      verificarUbicacion();
    }, intervalo);

    return () => {
      clearInterval(intervalId);
    };
  }, [activar, intervalo, verificarUbicacion]);

  return {
    ...estado,
    verificar: verificarUbicacion
  };
};

/**
 * Hook para monitoreo continuo de ubicación
 * @param {boolean} activar - Si se debe activar el monitoreo
 * @returns {object} Estado del geofencing
 */
export const useGeofencingContinuo = (activar = true) => {
  const [estado, setEstado] = useState({
    cargando: true,
    dentroDelPerimetro: true,
    distancia: null,
    ubicacion: null,
    error: null,
    ultimaActualizacion: null
  });

  useEffect(() => {
    if (!activar) {
      setEstado(prev => ({ ...prev, cargando: false, dentroDelPerimetro: true }));
      return;
    }

    let watchId = null;

    // Iniciar monitoreo
    try {
      watchId = monitorearUbicacion((resultado) => {
        setEstado({
          cargando: false,
          dentroDelPerimetro: resultado.dentroDelPerimetro,
          distancia: resultado.distancia,
          ubicacion: resultado.ubicacion,
          error: null,
          ultimaActualizacion: new Date()
        });
      });
    } catch (error) {
      console.error('❌ Error al iniciar monitoreo:', error.message);
      setEstado({
        cargando: false,
        dentroDelPerimetro: true,
        distancia: null,
        ubicacion: null,
        error: error.message,
        ultimaActualizacion: new Date()
      });
    }

    // Limpiar al desmontar
    return () => {
      if (watchId) {
        detenerMonitoreo(watchId);
      }
    };
  }, [activar]);

  return estado;
};

export default useGeofencing;
