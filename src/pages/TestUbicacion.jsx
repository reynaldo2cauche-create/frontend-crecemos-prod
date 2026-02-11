import React, { useState } from 'react';
import { obtenerUbicacionActual } from '../services/geolocationService';

/**
 * Componente temporal para obtener las coordenadas exactas del centro
 * Úsalo cuando estés FÍSICAMENTE en el centro de labores
 */
const TestUbicacion = () => {
  const [ubicacion, setUbicacion] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const obtenerCoordenadas = async () => {
    setCargando(true);
    setError(null);

    try {
      const coords = await obtenerUbicacionActual();
      setUbicacion(coords);
      console.log('📍 COORDENADAS EXACTAS DEL CENTRO:');
      console.log(`Latitud: ${coords.lat}`);
      console.log(`Longitud: ${coords.lng}`);
      console.log(`Precisión: ${coords.accuracy} metros`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🧪 Test de Ubicación GPS
        </h1>

        <p className="text-gray-600 mb-6">
          Esta página es para obtener las coordenadas EXACTAS del centro de labores.
          Úsala cuando estés físicamente en el centro.
        </p>

        <button
          onClick={obtenerCoordenadas}
          disabled={cargando}
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 mb-6"
        >
          {cargando ? 'Obteniendo ubicación...' : 'Obtener Coordenadas Actuales'}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-semibold">Error:</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {ubicacion && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-green-900 mb-4">
              ✅ Coordenadas Obtenidas
            </h2>

            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Latitud:</p>
                <p className="text-2xl font-mono font-bold text-gray-900 select-all">
                  {ubicacion.lat}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Longitud:</p>
                <p className="text-2xl font-mono font-bold text-gray-900 select-all">
                  {ubicacion.lng}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Precisión:</p>
                <p className="text-lg font-semibold text-gray-900">
                  {ubicacion.accuracy.toFixed(2)} metros
                </p>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-yellow-900 mb-2">
                📋 Instrucciones:
              </p>
              <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                <li>Copia la Latitud y Longitud</li>
                <li>Pégalas en el backend: <code className="bg-yellow-100 px-1 rounded">geofencing.service.ts</code></li>
                <li>Pégalas en el frontend: <code className="bg-yellow-100 px-1 rounded">geolocationService.js</code></li>
              </ol>
            </div>

            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-600 font-mono">
                // Backend (src/geofencing/geofencing.service.ts)<br/>
                private readonly CENTRO_LAT = {ubicacion.lat};<br/>
                private readonly CENTRO_LNG = {ubicacion.lng};<br/>
                <br/>
                // Frontend (src/services/geolocationService.js)<br/>
                const CENTRO_COORDENADAS = {'{'}<br/>
                &nbsp;&nbsp;lat: {ubicacion.lat},<br/>
                &nbsp;&nbsp;lng: {ubicacion.lng}<br/>
                {'}'};
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestUbicacion;
