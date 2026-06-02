import React from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useGeofencing } from '../hooks/useGeofencing';
import { ROLES } from '../constants/roles';
import { MapPin, ChevronRight } from 'lucide-react';

const GeofencingGuard = ({ children, rutasPermitidas = ['/intranet/agenda'] }) => {
  const currentUser = useCurrentUser();

  const requiereGeofencing = currentUser?.rol?.id === ROLES.TERAPEUTA ||
                             currentUser?.rol?.id === ROLES.ADMISION;

  const { dentroDelPerimetro, distancia } = useGeofencing(requiereGeofencing, 60000);

  // Sin geofencing requerido: acceso directo
  if (!requiereGeofencing) return children;

  // Mientras no se haya verificado aún (cargando): mostrar children igual
  // El backend protege cada request, no necesitamos bloquear la UI

  // Si está fuera del perímetro, verificar si la ruta está permitida
  if (dentroDelPerimetro === false) {
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
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default GeofencingGuard;
