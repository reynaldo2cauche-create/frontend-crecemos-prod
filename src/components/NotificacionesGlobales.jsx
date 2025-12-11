import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  InformationCircleIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import {
  contarAlertasNoLeidas,
  obtenerAlertasNoLeidas,
  marcarAlertaLeida,
  marcarTodasAlertasLeidas,
} from '../services/alertasService';
import { obtenerVacacionesProximas } from '../services/rrhhService';

const TABS = {
  TODAS: 'todas',
  ALERTAS: 'alertas',
  VACACIONES: 'vacaciones',
};

const NotificacionesGlobales = () => {
  const [totalNotificaciones, setTotalNotificaciones] = useState(0);
  const [alertas, setAlertas] = useState([]);
  const [vacaciones, setVacaciones] = useState([]);
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [tabActiva, setTabActiva] = useState(TABS.TODAS);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const esAdministrador = user?.rol?.id === 1;

  // Cargar conteo de notificaciones al montar
  useEffect(() => {
    cargarConteoNotificaciones();

    // Polling cada 30 segundos
    const interval = setInterval(cargarConteoNotificaciones, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cargar notificaciones cuando se abre el panel
  useEffect(() => {
    if (mostrarPanel) {
      cargarNotificaciones();
    }
  }, [mostrarPanel]);

  const cargarConteoNotificaciones = async () => {
    try {
      let totalAlertas = 0;
      let totalVacaciones = 0;

      // Solo administradores ven alertas
      if (esAdministrador) {
        const { total } = await contarAlertasNoLeidas();
        totalAlertas = total;
      }

      // Todos ven vacaciones (si hay empleados próximos a vacacionar)
      try {
        const vacacionesData = await obtenerVacacionesProximas();
        totalVacaciones = vacacionesData?.length || 0;
      } catch (error) {
        // No hacer nada si falla
      }

      setTotalNotificaciones(totalAlertas + totalVacaciones);
    } catch (error) {
      console.error('Error al cargar conteo de notificaciones:', error);
    }
  };

  const cargarNotificaciones = async () => {
    setCargando(true);
    try {
      const promises = [];

      // Cargar alertas (solo administradores)
      if (esAdministrador) {
        promises.push(
          obtenerAlertasNoLeidas(10).then(res => {
            setAlertas(res.alertas || []);
          }).catch(() => setAlertas([]))
        );
      }

      // Cargar vacaciones (todos)
      promises.push(
        obtenerVacacionesProximas().then(res => {
          setVacaciones(res || []);
        }).catch(() => setVacaciones([]))
      );

      await Promise.all(promises);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleMarcarAlertaLeida = async (id) => {
    try {
      await marcarAlertaLeida(id);
      setAlertas(prev => prev.filter(a => a.id !== id));
      cargarConteoNotificaciones();
    } catch (error) {
      console.error('Error al marcar alerta como leída:', error);
    }
  };

  const handleMarcarTodasAlertasLeidas = async () => {
    try {
      await marcarTodasAlertasLeidas();
      setAlertas([]);
      cargarConteoNotificaciones();
    } catch (error) {
      console.error('Error al marcar todas las alertas como leídas:', error);
    }
  };

  const handleVerAlertas = () => {
    setMostrarPanel(false);
    navigate('/intranet/alertas');
  };

  const handleVerVacaciones = () => {
    setMostrarPanel(false);
    navigate('/intranet/rrhh/vacaciones');
  };

  const getIconoSeveridad = (severidad) => {
    const iconos = {
      CRITICA: <ShieldExclamationIcon className="w-5 h-5 text-red-600" />,
      ALTA: <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />,
      MEDIA: <InformationCircleIcon className="w-5 h-5 text-yellow-600" />,
      BAJA: <InformationCircleIcon className="w-5 h-5 text-blue-600" />,
    };
    return iconos[severidad] || iconos.MEDIA;
  };

  const getColorSeveridad = (severidad) => {
    const colores = {
      CRITICA: 'bg-red-100 border-red-300',
      ALTA: 'bg-orange-100 border-orange-300',
      MEDIA: 'bg-yellow-100 border-yellow-300',
      BAJA: 'bg-blue-100 border-blue-300',
    };
    return colores[severidad] || colores.MEDIA;
  };

  const formatearTiempo = (fecha) => {
    const ahora = new Date();
    const fechaNotif = new Date(fecha);
    const diff = Math.floor((ahora - fechaNotif) / 1000); // segundos

    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    return `Hace ${Math.floor(diff / 86400)} días`;
  };

  const getNotificacionesFiltradas = () => {
    if (tabActiva === TABS.ALERTAS) return { tipo: 'alertas', datos: alertas };
    if (tabActiva === TABS.VACACIONES) return { tipo: 'vacaciones', datos: vacaciones };

    // TODAS: combinar y ordenar
    const todas = [
      ...alertas.map(a => ({ ...a, tipo: 'alerta', fechaOrden: new Date(a.fechaCreacion) })),
      ...vacaciones.map(v => ({ ...v, tipo: 'vacacion', fechaOrden: new Date() })),
    ].sort((a, b) => {
      // Ordenar alertas primero, luego vacaciones por días restantes
      if (a.tipo === 'alerta' && b.tipo === 'vacacion') return -1;
      if (a.tipo === 'vacacion' && b.tipo === 'alerta') return 1;
      if (a.tipo === 'vacacion' && b.tipo === 'vacacion') {
        return (a.diasHastaPrimerAnio || 0) - (b.diasHastaPrimerAnio || 0);
      }
      return b.fechaOrden - a.fechaOrden;
    });

    return { tipo: 'mixto', datos: todas };
  };

  const notificacionesFiltradas = getNotificacionesFiltradas();

  return (
    <div className="relative inline-block">
      {/* Badge de notificaciones */}
      <button
        onClick={() => setMostrarPanel(!mostrarPanel)}
        className="relative p-2 rounded-lg hover:bg-purple-50 transition-colors"
        title={`${totalNotificaciones} notificación${totalNotificaciones !== 1 ? 'es' : ''} sin leer`}
      >
        {totalNotificaciones > 0 ? (
          <BellSolidIcon className="w-6 h-6 text-purple-600 animate-pulse" />
        ) : (
          <BellIcon className="w-6 h-6 text-gray-600" />
        )}

        {totalNotificaciones > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center animate-pulse">
            {totalNotificaciones > 99 ? '99+' : totalNotificaciones}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {mostrarPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMostrarPanel(false)}
          />

          {/* Panel - Abriendo hacia la DERECHA desde el sidebar */}
          <div className="absolute left-full top-0 ml-2 w-96 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 max-h-[500px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BellSolidIcon className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-800">
                    Notificaciones
                  </h3>
                </div>
                <button
                  onClick={() => setMostrarPanel(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setTabActiva(TABS.TODAS)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    tabActiva === TABS.TODAS
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Todas ({alertas.length + vacaciones.length})
                </button>
                {esAdministrador && (
                  <button
                    onClick={() => setTabActiva(TABS.ALERTAS)}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      tabActiva === TABS.ALERTAS
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Alertas ({alertas.length})
                  </button>
                )}
                <button
                  onClick={() => setTabActiva(TABS.VACACIONES)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    tabActiva === TABS.VACACIONES
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Vacaciones ({vacaciones.length})
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto">
              {cargando ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  Cargando notificaciones...
                </div>
              ) : notificacionesFiltradas.datos.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <BellIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notificacionesFiltradas.datos.map((notif, index) => {
                    // Renderizar según tipo
                    if (notif.tipo === 'alerta') {
                      return (
                        <div
                          key={`alerta-${notif.id}`}
                          className={`p-4 hover:bg-gray-50 transition-colors relative ${getColorSeveridad(notif.severidad)} border-l-4`}
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 pt-1">
                              {getIconoSeveridad(notif.severidad)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-semibold text-sm text-gray-800 line-clamp-1">
                                  {notif.titulo}
                                </h4>
                                <button
                                  onClick={() => handleMarcarAlertaLeida(notif.id)}
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
                                  title="Marcar como leída"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>

                              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                {notif.mensaje}
                              </p>

                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {formatearTiempo(notif.fechaCreacion)}
                                </span>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                                  notif.severidad === 'CRITICA' ? 'bg-red-200 text-red-800' :
                                  notif.severidad === 'ALTA' ? 'bg-orange-200 text-orange-800' :
                                  notif.severidad === 'MEDIA' ? 'bg-yellow-200 text-yellow-800' :
                                  'bg-blue-200 text-blue-800'
                                }`}>
                                  {notif.severidad}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } else if (notif.tipo === 'vacacion') {
                      const diasRestantes = notif.diasHastaPrimerAnio || 0;
                      const esCritico = diasRestantes <= 7;

                      return (
                        <div
                          key={`vacacion-${notif.id || index}`}
                          className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${
                            esCritico ? 'bg-orange-50 border-orange-400' : 'bg-blue-50 border-blue-400'
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 pt-1">
                              <CalendarIcon className={`w-5 h-5 ${esCritico ? 'text-orange-600' : 'text-blue-600'}`} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-gray-800 mb-1">
                                Próximo a cumplir primer año
                              </h4>
                              <p className="text-xs text-gray-600 mb-2">
                                {notif.nombres} {notif.apellidos} cumplirá su primer año
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <ClockIcon className="w-4 h-4" />
                                  {diasRestantes === 0 ? 'Hoy' : diasRestantes === 1 ? 'Mañana' : `En ${diasRestantes} días`}
                                </span>
                                {notif.fechaIngreso && (
                                  <span>
                                    Ingresó: {new Date(notif.fechaIngreso).toLocaleDateString('es-PE')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notificacionesFiltradas.datos.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50 flex gap-2">
                {tabActiva === TABS.ALERTAS && (
                  <>
                    <button
                      onClick={handleMarcarTodasAlertasLeidas}
                      className="flex-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Marcar leídas
                    </button>
                    <button
                      onClick={handleVerAlertas}
                      className="flex-1 px-3 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium"
                    >
                      Ver todas
                    </button>
                  </>
                )}
                {tabActiva === TABS.VACACIONES && (
                  <button
                    onClick={handleVerVacaciones}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium"
                  >
                    Ver vacaciones
                  </button>
                )}
                {tabActiva === TABS.TODAS && (
                  <button
                    onClick={handleMarcarTodasAlertasLeidas}
                    className="flex-1 px-3 py-2 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors font-medium"
                  >
                    Gestionar notificaciones
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificacionesGlobales;
