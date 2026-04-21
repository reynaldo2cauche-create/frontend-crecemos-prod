import React from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useGeofencing } from '../hooks/useGeofencing';
import { ROLES } from '../constants/roles';
import { MapPin, AlertTriangle, Loader2, XCircle, ChevronRight } from 'lucide-react';

/**
 * Componente que restringe el acceso a ciertas rutas según la ubicación
 * Solo para roles Terapeuta y Admisión
 */
const GeofencingGuard = ({ children, rutasPermitidas = ['/intranet/agenda'] }) => {
  const currentUser = useCurrentUser();

  // Solo aplicar geofencing a Terapeutas y Admisión
  const requiereGeofencing = currentUser?.rol?.id === ROLES.TERAPEUTA ||
                             currentUser?.rol?.id === ROLES.ADMISION;

  // Activar geofencing solo si el rol lo requiere
  const { cargando, dentroDelPerimetro, distancia, error } = useGeofencing(
    requiereGeofencing,
    60000 // Verificar cada 1 minuto
  );

  // Si no requiere geofencing, permitir acceso
  if (!requiereGeofencing) {
    return children;
  }

  // Mostrar cargador mientras verifica ubicación
  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="text-center w-full max-w-xs">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 animate-spin mx-auto mb-3 sm:mb-4" />
          <p className="text-gray-600 text-base sm:text-lg font-medium">Verificando ubicación...</p>
          <p className="text-gray-500 text-sm mt-1 sm:mt-2 px-4">Por favor, permite el acceso a tu ubicación</p>
        </div>
      </div>
    );
  }

  // ⚠️ CAMBIO CRÍTICO: Si hay error, BLOQUEAR ACCESO COMPLETAMENTE
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md sm:max-w-2xl bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-5 sm:p-8 border-l-4 border-red-500">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
              <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Acceso Denegado
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-4">
                No se pudo verificar tu ubicación. El acceso requiere que permitas la geolocalización.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm font-semibold text-red-800 mb-1 sm:mb-2">Error:</p>
                <p className="text-xs sm:text-sm text-red-700 break-words">{error}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm font-semibold text-blue-800 mb-2">
                  ¿Cómo permitir el acceso a la ubicación?
                </p>
                <ol className="text-xs sm:text-sm text-blue-700 space-y-1 sm:space-y-2 list-decimal list-inside pl-1">
                  <li className="mb-1">Haz clic en el ícono de ubicación en el navegador</li>
                  <li className="mb-1">Selecciona "Permitir" para este sitio</li>
                  <li>Recarga la página</li>
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2.5 sm:px-6 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base font-medium flex items-center justify-center gap-2"
                >
                  Reintentar
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                <a
                  href="/intranet"
                  className="px-4 py-2.5 sm:px-6 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base font-medium text-center"
                >
                  Cerrar Sesión
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si está FUERA del perímetro, verificar si la ruta está permitida
  if (!dentroDelPerimetro) {
    const rutaActual = window.location.pathname;
    const rutaPermitida = rutasPermitidas.some(ruta => rutaActual.includes(ruta));

    if (!rutaPermitida) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4 sm:p-6">
          <div className="w-full max-w-md sm:max-w-2xl bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-5 sm:p-8 border-l-4 border-red-500">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Acceso Restringido por Ubicación
                </h2>
                <p className="text-gray-600 text-sm sm:text-base mb-4">
                  Esta sección solo está disponible cuando te encuentras en el centro de labores.
                </p>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="text-center sm:text-left">
                      <p className="text-xs sm:text-sm font-semibold text-red-800 mb-1">Tu distancia actual:</p>
                      <p className="text-xl sm:text-2xl font-bold text-red-600">{distancia} metros</p>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-xs sm:text-sm font-semibold text-red-800 mb-1">Distancia permitida:</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-700">100 metros</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm font-semibold text-blue-800 mb-2">Secciones disponibles fuera del centro:</p>
                  <ul className="list-disc list-inside text-xs sm:text-sm text-blue-700 space-y-1 pl-1">
                    <li className="mb-1">Agenda de Citas</li>
                    <li>Webmail / Correo</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <a
                    href="/intranet/agenda"
                    className="px-4 py-2.5 sm:px-6 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base font-medium flex items-center justify-center gap-2"
                  >
                    Ir a mi Agenda
                    <ChevronRight className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2.5 sm:px-6 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base font-medium"
                  >
                    Verificar Ubicación
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Si está DENTRO del perímetro, permitir acceso completo
  return children;
};

export default GeofencingGuard;