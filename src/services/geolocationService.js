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
const intentarGeolocalizacion = (opciones) =>
  new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }),
      (error) => reject(error),
      opciones
    );
  });

export const obtenerUbicacionActual = async () => {
  if (!navigator.geolocation) {
    throw new Error('Geolocalización no soportada por el navegador');
  }

  // Intento 1: alta precisión, caché 30s
  try {
    return await intentarGeolocalizacion({ enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 });
  } catch (_) { /* continuar */ }

  // Intento 2: baja precisión (WiFi/IP), caché 2min — mejor opción en desktop/Mac
  try {
    return await intentarGeolocalizacion({ enableHighAccuracy: false, timeout: 10000, maximumAge: 120000 });
  } catch (_) { /* continuar */ }

  // Intento 3: aceptar cualquier posición cacheada por el OS, sin importar la edad
  try {
    return await intentarGeolocalizacion({ enableHighAccuracy: false, timeout: 5000, maximumAge: Infinity });
  } catch (e) {
    // Solo propagar si es denegación explícita del usuario — lo demás se maneja arriba
    if (e.code === 1) throw new Error('Permiso de ubicación denegado');
    throw new Error('Ubicación no disponible');
  }
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
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 60000
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