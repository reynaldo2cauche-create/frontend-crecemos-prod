// src/services/geolocationService.js

/**
 * Servicio de Geolocalización
 * Valida si el usuario está dentro del perímetro permitido del centro de labores
 */

// 📍 COORDENADAS DEL CENTRO DE LABORES
// Dirección: Calle 48 Nro. 234 Urbanización El Pinar, Comas 15316 Lima, Perú
const CENTRO_COORDENADAS = { lat: -11.915504916666666, lng: -77.05404908333334 };
// Radio permitido en metros
const RADIO_PERMITIDO = 100; // 100 metros

/**
 * Calcular distancia entre dos puntos usando la fórmula de Haversine
 * @param {number} lat1 - Latitud del punto 1
 * @param {number} lon1 - Longitud del punto 1
 * @param {number} lat2 - Latitud del punto 2
 * @param {number} lon2 - Longitud del punto 2
 * @returns {number} Distancia en metros
 */
const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
};

/**
 * Obtener la ubicación actual del usuario
 * @returns {Promise<{lat: number, lng: number, accuracy: number}>}
 */
export const obtenerUbicacionActual = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada por el navegador'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy // precisión en metros
        });
      },
      (error) => {
        let mensaje = 'Error al obtener ubicación';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            mensaje = 'Permiso de ubicación denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            mensaje = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            mensaje = 'Tiempo de espera agotado';
            break;
          default:
            mensaje = 'Error desconocido al obtener ubicación';
        }

        reject(new Error(mensaje));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000 // Usar posición cacheada del browser si tiene menos de 30s
      }
    );
  });
};

/**
 * Verificar si el usuario está dentro del perímetro permitido
 * @returns {Promise<{dentroDelPerimetro: boolean, distancia: number, ubicacion: object}>}
 */
export const verificarPerimetro = async () => {
  try {
    const ubicacion = await obtenerUbicacionActual();

    const distancia = calcularDistancia(
      ubicacion.lat,
      ubicacion.lng,
      CENTRO_COORDENADAS.lat,
      CENTRO_COORDENADAS.lng
    );

    console.log(`📍 Ubicación actual: ${ubicacion.lat}, ${ubicacion.lng}`);
    console.log(`📏 Distancia al centro: ${distancia.toFixed(2)} metros`);
    console.log(`✅ Dentro del perímetro: ${distancia <= RADIO_PERMITIDO}`);

    return {
      dentroDelPerimetro: distancia <= RADIO_PERMITIDO,
      distancia: Math.round(distancia),
      ubicacion: {
        lat: ubicacion.lat,
        lng: ubicacion.lng,
        accuracy: ubicacion.accuracy
      },
      centro: CENTRO_COORDENADAS,
      radioPermitido: RADIO_PERMITIDO
    };
  } catch (error) {
    console.error('❌ Error al verificar perímetro:', error.message);
    throw error;
  }
};

/**
 * Monitorear ubicación en tiempo real
 * @param {Function} callback - Función que se ejecuta cuando cambia la ubicación
 * @returns {number} ID del watcher para poder detenerlo
 */
export const monitorearUbicacion = (callback) => {
  if (!navigator.geolocation) {
    console.error('❌ Geolocalización no soportada');
    return null;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const ubicacion = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      const distancia = calcularDistancia(
        ubicacion.lat,
        ubicacion.lng,
        CENTRO_COORDENADAS.lat,
        CENTRO_COORDENADAS.lng
      );

      callback({
        dentroDelPerimetro: distancia <= RADIO_PERMITIDO,
        distancia: Math.round(distancia),
        ubicacion,
        centro: CENTRO_COORDENADAS,
        radioPermitido: RADIO_PERMITIDO
      });
    },
    (error) => {
      console.error('❌ Error al monitorear ubicación:', error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000 // Actualizar cada 30 segundos
    }
  );

  return watchId;
};

/**
 * Detener monitoreo de ubicación
 * @param {number} watchId - ID del watcher
 */
export const detenerMonitoreo = (watchId) => {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
    console.log('🛑 Monitoreo de ubicación detenido');
  }
};

/**
 * Obtener coordenadas del centro de labores
 * @returns {object} Coordenadas del centro
 */
export const obtenerCoordenadasCentro = () => {
  return CENTRO_COORDENADAS;
};

/**
 * Obtener radio permitido
 * @returns {number} Radio en metros
 */
export const obtenerRadioPermitido = () => {
  return RADIO_PERMITIDO;
};