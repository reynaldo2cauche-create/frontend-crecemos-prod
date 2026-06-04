import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell, X, TriangleAlert, Info, Calendar, Cake, Trash,
  Clock, PenSquare, FileText, Loader2, PartyPopper,
  Briefcase, Check, BellOff, SlidersHorizontal, ChevronDown, ClipboardList, FileUp, UserCog,
  FileCheck, UserMinus, KanbanSquare, MessageSquare, CircleCheckBig, CalendarClock,
  ArrowRightCircle, Paperclip, PawPrint,
} from 'lucide-react';
import {
  obtenerNotificacionesRecientes,
  contarNotificaciones,
  marcarTodasComoLeidas as marcarLeidasAPI,
  marcarComoLeida
} from '../services/notificacionesService';

const LIMIT = 15;

// ─── helpers ──────────────────────────────────────────────────────────────────

const normalizarNotif = (n) => ({
  ...n,
  leida: n.leida === 1 || n.leida === '1' || n.leida === true
});

const formatearTiempo = (fecha) =>
  new Date(fecha).toLocaleString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).replace(',', ' ·');

// ─── config visual ────────────────────────────────────────────────────────────

const TIPO_CONFIG = {
  CUMPLEANOS_PACIENTE:      { icono: Cake,          color: 'text-pink-500',   borde: 'border-pink-400',   label: 'Cumpleaños paciente'  },
  CUMPLEANOS_EMPLEADO:      { icono: PartyPopper,   color: 'text-purple-500', borde: 'border-purple-400', label: 'Cumpleaños empleado'  },
  ANIVERSARIO_LABORAL:      { icono: Briefcase,     color: 'text-blue-500',   borde: 'border-blue-400',   label: 'Aniversario laboral'  },
  CUMPLEANOS:               { icono: Cake,          color: 'text-pink-500',   borde: 'border-pink-400',   label: 'Cumpleaños'           },
  ANIVERSARIO:              { icono: Calendar,      color: 'text-blue-500',   borde: 'border-blue-400',   label: 'Aniversario'          },
  ACCESO:                   { icono: TriangleAlert, color: 'text-orange-500', borde: 'border-orange-400', label: 'Acceso'               },
  CITA_ELIMINADA:           { icono: Trash,         color: 'text-red-500',    borde: 'border-red-400',    label: 'Cita eliminada'       },
  CITA_MODIFICADA:          { icono: PenSquare,     color: 'text-indigo-500', borde: 'border-indigo-400', label: 'Cita modificada'      },
  NOTA_EVOLUCION:           { icono: FileText,      color: 'text-green-500',  borde: 'border-green-400',  label: 'Nota de evolución'    },
  INDICACION_TERAPEUTICA:   { icono: ClipboardList, color: 'text-teal-500',   borde: 'border-teal-400',   label: 'Indicación terapéutica' },
  DOCUMENTO_SUBIDO:         { icono: FileUp,        color: 'text-blue-500',   borde: 'border-blue-400',   label: 'Documento subido'     },
  CAMBIO_ESTADO_PACIENTE:   { icono: UserCog,       color: 'text-amber-600',  borde: 'border-amber-500',  label: 'Cambio de estado'     },
  CAMBIO_ESTADO_SERVICIO:   { icono: UserCog,       color: 'text-amber-500',  borde: 'border-amber-400',  label: 'Cambio estado servicio' },
  SOLICITUD_INFORME:        { icono: FileCheck,     color: 'text-violet-600', borde: 'border-violet-500', label: 'Solicitud de informe' },
  SERVICIO_INACTIVO:        { icono: UserMinus,     color: 'text-red-500',    borde: 'border-red-400',    label: 'Servicio inactivo'    },
  TAREA_ASIGNADA:           { icono: KanbanSquare,      color: 'text-purple-600', borde: 'border-purple-500', label: 'Tarea asignada'        },
  TAREA_COMENTADA:          { icono: MessageSquare,     color: 'text-sky-500',    borde: 'border-sky-400',    label: 'Comentario en tarea'   },
  TAREA_COMPLETADA:         { icono: CircleCheckBig,    color: 'text-emerald-500',borde: 'border-emerald-400',label: 'Tarea completada'      },
  TAREA_VENCIDA:            { icono: CalendarClock,     color: 'text-rose-500',   borde: 'border-rose-400',   label: 'Tarea vencida'         },
  TAREA_MOVIDA:             { icono: ArrowRightCircle,  color: 'text-amber-500',  borde: 'border-amber-400',  label: 'Tarea movida'          },
  TAREA_ARCHIVO_SUBIDO:     { icono: Paperclip,         color: 'text-cyan-500',   borde: 'border-cyan-400',   label: 'Archivo en tarea'      },
  SESIONES_TERAPIA_24:      { icono: PawPrint,          color: 'text-yellow-500', borde: 'border-yellow-400', label: '24 sesiones de terapia' },
  DEFAULT:                  { icono: Info,          color: 'text-gray-500',   borde: 'border-gray-300',   label: 'Otro'                 },
};

const getTipoConfig  = (tipo) => TIPO_CONFIG[tipo] || TIPO_CONFIG.DEFAULT;
const TIPOS_OPCIONES = Object.entries(TIPO_CONFIG)
  .filter(([key]) => key !== 'DEFAULT')
  .map(([key, val]) => ({ value: key, label: val.label }));

const FILTROS_INICIALES = { fecha: '', tipo: '' };

// ─── subcomponentes ───────────────────────────────────────────────────────────

const NotificacionItem = ({ notif, onMarcarLeida }) => {
  const esLeida = notif.leida;
  const { icono: Icono, color, borde } = getTipoConfig(notif.tipo_notificacion);

  return (
    <div className={`px-4 py-3.5 border-l-4 transition-colors hover:bg-gray-50 ${
      esLeida ? 'border-gray-200' : borde
    }`}>
      <div className="flex gap-3">
        <div className={`flex-shrink-0 pt-0.5 ${esLeida ? 'opacity-40' : ''}`}>
          <Icono className={`w-5 h-5 ${esLeida ? 'text-gray-400' : color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h4 className={`font-semibold text-sm leading-snug ${esLeida ? 'text-gray-400' : 'text-gray-800'}`}>
              {notif.titulo}
            </h4>
            {!esLeida && (
              <button
                onClick={() => onMarcarLeida(notif.id)}
                className="flex-shrink-0 p-1 rounded-full hover:bg-green-100 text-green-500 hover:text-green-600 transition-colors"
                title="Marcar como leída"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className={`text-xs mb-2 leading-relaxed ${esLeida ? 'text-gray-400' : 'text-gray-600'}`}>
            {notif.mensaje}
          </p>
          <span className={`text-xs flex items-center gap-1 ${esLeida ? 'text-gray-300' : 'text-gray-400'}`}>
            <Clock className="w-3 h-3" />
            {formatearTiempo(notif.fecha_creacion)}
          </span>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ activo, onClick, label, count, variante }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2.5 text-sm font-semibold transition-all relative flex items-center justify-center gap-2 ${
      activo ? 'text-purple-700' : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    {label}
    {count > 0 && (
      <span className={`text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${
        activo
          ? variante === 'no_leidas' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'
          : 'bg-gray-200 text-gray-500'
      }`}>
        {count > 99 ? '99+' : count}
      </span>
    )}
    {activo && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-purple-600 rounded-full" />}
  </button>
);

const EstadoVacio = ({ hayFiltros }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      {hayFiltros
        ? <SlidersHorizontal className="w-6 h-6 text-gray-400" />
        : <BellOff className="w-6 h-6 text-gray-400" />
      }
    </div>
    <p className="text-sm font-medium text-gray-600">
      {hayFiltros ? 'Sin resultados' : 'Sin notificaciones'}
    </p>
    <p className="text-xs text-gray-400 mt-1">
      {hayFiltros
        ? 'Ninguna notificación coincide con los filtros aplicados'
        : 'Las notificaciones aparecerán aquí'
      }
    </p>
  </div>
);

const PanelFiltros = ({ filtros, onChange, onLimpiar, hayFiltros }) => (
  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 space-y-2.5">
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-gray-500 w-10 flex-shrink-0">Fecha</label>
      <input
        type="date"
        value={filtros.fecha}
        onChange={e => onChange({ ...filtros, fecha: e.target.value })}
        className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all text-gray-700"
      />
      {filtros.fecha && (
        <button onClick={() => onChange({ ...filtros, fecha: '' })} className="text-gray-400 hover:text-gray-600">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>

    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-gray-500 w-10 flex-shrink-0">Tipo</label>
      <div className="relative flex-1">
        <select
          value={filtros.tipo}
          onChange={e => onChange({ ...filtros, tipo: e.target.value })}
          className="w-full appearance-none px-2.5 py-1.5 pr-7 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all text-gray-700 cursor-pointer"
        >
          <option value="">Todos los tipos</option>
          {TIPOS_OPCIONES.map(op => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      </div>
      {filtros.tipo && (
        <button onClick={() => onChange({ ...filtros, tipo: '' })} className="text-gray-400 hover:text-gray-600">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>

    {hayFiltros && (
      <button
        onClick={onLimpiar}
        className="w-full py-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium hover:bg-purple-50 rounded-lg transition-colors"
      >
        Limpiar filtros
      </button>
    )}
  </div>
);

// ─── hook de datos ────────────────────────────────────────────────────────────

const useNotificaciones = () => {
  const [notificaciones, setNotificaciones]       = useState([]);
  const [totalNoLeidasReal, setTotalNoLeidasReal] = useState(0);
  const [cargando, setCargando]                   = useState(false);
  const [cargandoMas, setCargandoMas]             = useState(false);
  const [hayMas, setHayMas]                       = useState(false);
  const [error, setError]                         = useState(null);
  const [filtros, setFiltros]                     = useState(FILTROS_INICIALES);
  const [tabActivo, setTabActivo]                 = useState('no_leidas');

  const offsetRef  = useRef(0);
  const filtrosRef = useRef(filtros);
  const tabRef     = useRef(tabActivo);
  filtrosRef.current = filtros;
  tabRef.current     = tabActivo;

  // ── 1. Badge instantáneo al montar — usa /count (una sola query simple) ──
  // Se ejecuta inmediatamente, mucho más rápido que /recientes
  useEffect(() => {
    const cargarBadgeInicial = async () => {
      try {
        const data = await contarNotificaciones();
        setTotalNoLeidasReal(data.total || 0);
      } catch { /* silencioso */ }
    };

    cargarBadgeInicial();
  }, []);

  // ── 2. Polling cada 5s — /count para badge, /recientes para novedades ──
  // Separados para que el badge sea liviano y las novedades no bloqueen nada
  useEffect(() => {
    const pollBadge = async () => {
      try {
        const data = await contarNotificaciones();
        setTotalNoLeidasReal(data.total || 0);
      } catch { /* silencioso */ }
    };

    const pollNovedades = async () => {
      try {
        const f = filtrosRef.current;
        if (f.fecha || f.tipo) return;

        const leidaParam = tabRef.current === 'leidas' ? 'true' : 'false';
        const response = await obtenerNotificacionesRecientes(LIMIT, 0, undefined, undefined, leidaParam);
        const nuevas = (response.notificaciones || []).map(normalizarNotif);

        setNotificaciones(prev => {
          const ids = new Set(prev.map(n => n.id));
          const novedades = nuevas.filter(n => !ids.has(n.id));
          return novedades.length === 0 ? prev : [...novedades, ...prev];
        });
      } catch { /* silencioso */ }
    };

    // Badge liviano cada 5s
    const intervalBadge    = setInterval(pollBadge,    5000);
    // Novedades cada 15s — no necesita ser tan frecuente
    const intervalNovedades = setInterval(pollNovedades, 15000);

    return () => {
      clearInterval(intervalBadge);
      clearInterval(intervalNovedades);
    };
  }, []);

  // ── 3. Carga del panel — cada tab pide sus propios datos ──
  const cargarDesdeInicio = useCallback(async (nuevosFiltros = filtros, nuevoTab = tabActivo) => {
    setCargando(true);
    setError(null);
    offsetRef.current = 0;

    const leidaParam = nuevoTab === 'leidas' ? 'true' : 'false';

    try {
      const response = await obtenerNotificacionesRecientes(
        LIMIT, 0,
        nuevosFiltros.fecha || undefined,
        nuevosFiltros.tipo  || undefined,
        leidaParam,
      );

      const notificacionesNormalizadas = (response.notificaciones || []).map(normalizarNotif);
      setNotificaciones(notificacionesNormalizadas);
      setHayMas(response.tiene_mas || false);
      setTotalNoLeidasReal(response.total_no_leidas || 0);
      offsetRef.current = LIMIT;
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setError('No se pudieron cargar las notificaciones');
    } finally {
      setCargando(false);
    }
  }, []);

  // ── 4. Scroll infinito — append sin reemplazar ──
  const cargarMas = useCallback(async () => {
    if (cargandoMas || !hayMas) return;
    setCargandoMas(true);

    const leidaParam = tabRef.current === 'leidas' ? 'true' : 'false';

    try {
      const response = await obtenerNotificacionesRecientes(
        LIMIT,
        offsetRef.current,
        filtrosRef.current.fecha || undefined,
        filtrosRef.current.tipo  || undefined,
        leidaParam,
      );

      const nuevas = (response.notificaciones || []).map(normalizarNotif);

      setNotificaciones(prev => {
        const ids = new Set(prev.map(n => n.id));
        return [...prev, ...nuevas.filter(n => !ids.has(n.id))];
      });

      setHayMas(response.tiene_mas || false);
      // NO actualizar el contador aquí - se mantiene el total inicial
      offsetRef.current += LIMIT;
    } catch { /* silencioso */ } finally {
      setCargandoMas(false);
    }
  }, [cargandoMas, hayMas]);

  // ── acciones ──────────────────────────────────────────────────────────────

  const aplicarFiltros = useCallback((nuevosFiltros) => {
    setFiltros(nuevosFiltros);
    cargarDesdeInicio(nuevosFiltros, tabActivo);
  }, [tabActivo, cargarDesdeInicio]);

  const marcarUnaComoLeida = useCallback(async (notificacionId) => {
    try {
      const response = await marcarComoLeida(notificacionId);
      // En tab "no_leidas" la quitamos de la lista; en "leidas" ya no aparece
      setNotificaciones(prev => prev.filter(n => n.id !== notificacionId));
      if (response.nuevo_conteo !== undefined) {
        setTotalNoLeidasReal(response.nuevo_conteo);
      } else {
        setTotalNoLeidasReal(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  }, []);

  const marcarTodasComoLeidas = useCallback(async () => {
    try {
      await marcarLeidasAPI();
      setNotificaciones([]);
      setHayMas(false);
      setTotalNoLeidasReal(0);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
      cargarDesdeInicio(filtros, tabActivo);
    }
  }, [filtros, tabActivo, cargarDesdeInicio]);

  // Recargar cuando cambia de tab
  const cambiarTab = useCallback((nuevoTab) => {
    setTabActivo(nuevoTab);
    cargarDesdeInicio(filtros, nuevoTab);
  }, [filtros, cargarDesdeInicio]);

  return {
    notificaciones, totalNoLeidasReal,
    cargando, cargandoMas, hayMas, error,
    filtros, tabActivo, cambiarTab,
    cargarDesdeInicio, cargarMas,
    aplicarFiltros,
    marcarUnaComoLeida, marcarTodasComoLeidas,
  };
};

// ─── componente principal ─────────────────────────────────────────────────────

const NotificacionesGlobales = ({ sidebarMode = false, isCollapsed = false, panelClassName }) => {
  const [mostrarPanel, setMostrarPanel]     = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const cargaInicialHecha                   = useRef(false);

  const {
    notificaciones, totalNoLeidasReal,
    cargando, cargandoMas, hayMas, error,
    filtros, tabActivo, cambiarTab,
    cargarDesdeInicio, cargarMas,
    aplicarFiltros,
    marcarUnaComoLeida, marcarTodasComoLeidas,
  } = useNotificaciones();

  const hayFiltros  = Boolean(filtros.fecha || filtros.tipo);
  const listaActiva = notificaciones;

  const abrirPanel = () => {
    setMostrarPanel(true);
    if (!cargaInicialHecha.current) {
      cargaInicialHecha.current = true;
      cargarDesdeInicio();
    }
  };

  const handleScroll = (e) => {
    const { scrollHeight, scrollTop, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.3 && !cargandoMas && hayMas) {
      cargarMas();
    }
  };

  const limpiarFiltros = () => aplicarFiltros(FILTROS_INICIALES);

  return (
    <div className={`relative ${sidebarMode ? 'inline-block w-full' : 'inline-block'}`}>

      {/* Botón campana */}
      {sidebarMode ? (
        <button
          onClick={() => mostrarPanel ? setMostrarPanel(false) : abrirPanel()}
          className={`relative w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all ${isCollapsed ? 'justify-center' : ''}`}
          title={`${totalNoLeidasReal} notificación${totalNoLeidasReal !== 1 ? 'es' : ''} sin leer`}
        >
          <Bell className="w-5 h-5 text-white/80 flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-bold text-[16px] text-white/80 flex-1 text-left">Notificaciones</span>
          )}
          {totalNoLeidasReal > 0 && !isCollapsed && (
            <span className="bg-[#e040fb] text-white text-xs font-bold rounded-full px-2 py-0.5 flex-shrink-0">
              {totalNoLeidasReal > 99 ? '99+' : totalNoLeidasReal}
            </span>
          )}
          {totalNoLeidasReal > 0 && isCollapsed && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {totalNoLeidasReal > 9 ? '9+' : totalNoLeidasReal}
            </span>
          )}
        </button>
      ) : (
        <button
          onClick={() => mostrarPanel ? setMostrarPanel(false) : abrirPanel()}
          className="relative p-2 rounded-lg hover:bg-purple-50 transition-colors"
          title={`${totalNoLeidasReal} notificación${totalNoLeidasReal !== 1 ? 'es' : ''} sin leer`}
        >
          <Bell className={`w-6 h-6 transition-colors ${
            totalNoLeidasReal > 0 ? 'text-purple-600 animate-pulse' : 'text-gray-600'
          }`} />
          {totalNoLeidasReal > 0 && (
            <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center animate-pulse">
              {totalNoLeidasReal > 99 ? '99+' : totalNoLeidasReal}
            </span>
          )}
        </button>
      )}

      {mostrarPanel && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMostrarPanel(false)} />

          <div
            className={panelClassName || 'absolute left-full top-0 ml-2 w-96 bg-white rounded-xl shadow-2xl z-50 border border-gray-200 flex flex-col overflow-hidden'}
            style={{ maxHeight: '560px' }}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-0 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-gray-800 text-base">Notificaciones</h3>
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    En vivo
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setMostrarFiltros(v => !v)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      mostrarFiltros || hayFiltros
                        ? 'bg-purple-100 text-purple-700'
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Filtrar
                    {hayFiltros && (
                      <span className="bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {[filtros.fecha, filtros.tipo].filter(Boolean).length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setMostrarPanel(false)}
                    className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex">
                <TabButton
                  activo={tabActivo === 'no_leidas'}
                  onClick={() => cambiarTab('no_leidas')}
                  label="Sin leer"
                  count={totalNoLeidasReal}
                  variante="no_leidas"
                />
                <TabButton
                  activo={tabActivo === 'leidas'}
                  onClick={() => cambiarTab('leidas')}
                  label="Leídas"
                  count={0}
                  variante="leidas"
                />
              </div>
            </div>

            {mostrarFiltros && (
              <PanelFiltros
                filtros={filtros}
                onChange={aplicarFiltros}
                onLimpiar={limpiarFiltros}
                hayFiltros={hayFiltros}
              />
            )}

            <div
              className="flex-1 overflow-y-auto divide-y divide-gray-100 min-h-0"
              onScroll={handleScroll}
            >
              {cargando ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Loader2 className="w-7 h-7 animate-spin mb-2 text-purple-400" />
                  <p className="text-sm">Cargando notificaciones...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-10 px-6">
                  <TriangleAlert className="w-8 h-8 mb-2 text-red-400" />
                  <p className="text-sm text-center text-red-500">{error}</p>
                  <button
                    onClick={() => cargarDesdeInicio(filtros, tabActivo)}
                    className="mt-3 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              ) : listaActiva.length === 0 ? (
                <EstadoVacio hayFiltros={hayFiltros} />
              ) : (
                <>
                  {listaActiva.map(notif => (
                    <NotificacionItem
                      key={notif.id}
                      notif={notif}
                      onMarcarLeida={marcarUnaComoLeida}
                    />
                  ))}
                  {cargandoMas && (
                    <div className="flex items-center justify-center py-4 text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin mr-2 text-purple-400" />
                      <span className="text-xs">Cargando más...</span>
                    </div>
                  )}
                  {!hayMas && listaActiva.length > 0 && (
                    <div className="text-center py-4 text-xs text-gray-300">
                      No hay más notificaciones
                    </div>
                  )}
                </>
              )}
            </div>

            {tabActivo === 'no_leidas' && totalNoLeidasReal > 0 && !cargando && (
              <div className="px-3 py-2.5 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                <button
                  onClick={marcarTodasComoLeidas}
                  className="w-full py-2 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors font-medium"
                >
                  Marcar todas como leídas ({totalNoLeidasReal})
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