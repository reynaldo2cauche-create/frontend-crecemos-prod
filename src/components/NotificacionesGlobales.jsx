import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  TriangleAlert,
  Info,
  Calendar,
  Cake,
  Trash,
  Clock,
  PenSquare,
  FileText,
  Loader2,
  PartyPopper,
  Briefcase
} from 'lucide-react';
import { obtenerNotificacionesRecientes } from '../services/notificacionesService';

const NotificacionesGlobales = () => {
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [totalNotificaciones, setTotalNotificaciones] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarNotificaciones();
    const intervalo = setInterval(cargarNotificaciones, 60000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarNotificaciones = async () => {
    try {
      setCargando(true);
      setError(null);
      const response = await obtenerNotificacionesRecientes();
      setNotificaciones(response.notificaciones || []);
      setTotalNotificaciones(response.total || 0);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
      setError('Error al cargar notificaciones');
      setNotificaciones([]);
      setTotalNotificaciones(0);
    } finally {
      setCargando(false);
    }
  };

  const getIconoTipo = (tipo) => {
    const iconos = {
      CUMPLEANOS_PACIENTE: <Cake className="w-5 h-5 text-pink-600" />,
      CUMPLEANOS_EMPLEADO: <PartyPopper className="w-5 h-5 text-purple-600" />,
      ANIVERSARIO_LABORAL: <Briefcase className="w-5 h-5 text-blue-600" />,
      CUMPLEANOS: <Cake className="w-5 h-5 text-pink-600" />,
      ANIVERSARIO: <Calendar className="w-5 h-5 text-blue-600" />,
      ACCESO: <TriangleAlert className="w-5 h-5 text-orange-600" />,
      CITA_ELIMINADA: <Trash className="w-5 h-5 text-red-600" />,
      CITA_MODIFICADA: <PenSquare className="w-5 h-5 text-indigo-600" />,
      NOTA_EVOLUCION: <FileText className="w-5 h-5 text-green-600" />
    };
    return iconos[tipo] || <Info className="w-5 h-5 text-gray-600" />;
  };

  const getColorTipo = (tipo) => {
    const colores = {
      CUMPLEANOS_PACIENTE: 'bg-pink-50 border-pink-300',
      CUMPLEANOS_EMPLEADO: 'bg-purple-50 border-purple-300',
      ANIVERSARIO_LABORAL: 'bg-blue-50 border-blue-300',
      CUMPLEANOS: 'bg-pink-50 border-pink-300',
      ANIVERSARIO: 'bg-blue-50 border-blue-300',
      ACCESO: 'bg-orange-50 border-orange-300',
      CITA_ELIMINADA: 'bg-red-50 border-red-300',
      CITA_MODIFICADA: 'bg-indigo-50 border-indigo-300',
      NOTA_EVOLUCION: 'bg-green-50 border-green-300'
    };
    return colores[tipo] || 'bg-gray-50 border-gray-300';
  };

  const formatearTiempo = (fecha) => {
    const ahora = new Date();
    const fechaNotif = new Date(fecha);
    const diff = Math.floor((ahora - fechaNotif) / 1000);

    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    return `Hace ${Math.floor(diff / 86400)} días`;
  };

  const marcarTodasComoLeidas = () => {
    setNotificaciones([]);
    setTotalNotificaciones(0);
    setMostrarPanel(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setMostrarPanel(!mostrarPanel)}
        className="relative p-2 rounded-lg hover:bg-purple-50 transition-colors"
        title={`${totalNotificaciones} notificación${totalNotificaciones !== 1 ? 'es' : ''} sin leer`}
      >
        {totalNotificaciones > 0 ? (
          <Bell className="w-6 h-6 text-purple-600 animate-pulse" />
        ) : (
          <Bell className="w-6 h-6 text-gray-600" />
        )}

        {totalNotificaciones > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center animate-pulse">
            {totalNotificaciones > 99 ? '99+' : totalNotificaciones}
          </span>
        )}
      </button>

      {mostrarPanel && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMostrarPanel(false)} />

          <div className="absolute left-full top-0 ml-2 w-96 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 max-h-[500px] flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-800">
                    Notificaciones ({totalNotificaciones})
                  </h3>
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                    En tiempo real
                  </span>
                </div>
                <button
                  onClick={() => setMostrarPanel(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {cargando && notificaciones.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p className="text-sm">Cargando notificaciones...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-8 text-red-500">
                  <TriangleAlert className="w-8 h-8 mb-2" />
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={cargarNotificaciones}
                    className="mt-3 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              ) : notificaciones.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                  <Bell className="w-12 h-12 mb-2 text-gray-300" />
                  <p className="text-sm font-medium">No hay notificaciones</p>
                  <p className="text-xs text-gray-400 mt-1">Las notificaciones recientes aparecerán aquí</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notificaciones.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-gray-50 transition-colors relative ${getColorTipo(notif.tipo_notificacion)} border-l-4`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 pt-1">
                          {getIconoTipo(notif.tipo_notificacion)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-sm text-gray-800 line-clamp-1">
                              {notif.titulo}
                            </h4>
                          </div>

                          <p className="text-xs text-gray-600 mb-2" style={{ lineHeight: '1.4' }}>
                            {notif.mensaje}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {notif.tiempo_relativo || formatearTiempo(notif.fecha_creacion)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notificaciones.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={marcarTodasComoLeidas}
                  className="w-full px-3 py-2 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors font-medium"
                >
                  Marcar todas como leídas
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificacionesGlobales;