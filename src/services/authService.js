import api, { API_BASE_URL } from './api';
import { obtenerUbicacionActual } from './geolocationService';

export const login = async (credentials) => {
  // 📍 PREPARAR HEADERS
  const headers = {
    'Content-Type': 'application/json'
  };

  // 📍 CAPTURAR COORDENADAS GPS ANTES DE LOGIN
  try {
    const ubicacion = await obtenerUbicacionActual();
    
    // ✅ Validar que sean números válidos (incluyendo 0)
    if (typeof ubicacion.lat === 'number' && typeof ubicacion.lng === 'number') {
      headers['x-user-latitude'] = ubicacion.lat.toString();
      headers['x-user-longitude'] = ubicacion.lng.toString();
      
      console.log('📍 Coordenadas GPS capturadas para login:', {
        latitud: ubicacion.lat,
        longitud: ubicacion.lng
      });
    }
  } catch (error) {
    console.warn('⚠️ No se pudieron obtener coordenadas GPS para login:', error.message);
    // Continuar con el login aunque no haya GPS
  }

  // 🚀 ENVIAR LOGIN CON COORDENADAS
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error en la autenticación');
  }

  return await response.json();
};