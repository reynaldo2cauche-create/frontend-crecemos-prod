import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SunIcon,
  XMarkIcon,
  CheckIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  PaperClipIcon,
  InboxIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { SERVER_BASE_URL } from '../../services/api';
import {
  getResumenAsistencia,
  getSolicitudes,
  getSolicitud,
  revisarSolicitud,
  eliminarSolicitud,
} from '../../services/rrhhService';
import FaltasPanel from './FaltasPage';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';

const NOMBRE_MES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const LABEL_TIPO = {
  permiso_personal: 'Permiso personal',
  permiso_medico: 'Permiso médico',
  permiso_capacitacion: 'Permiso por capacitación',
  permiso_horas: 'Permiso por horas',
  vacaciones: 'Vacaciones',
  otro: 'Otro',
};

const TIPO_BADGE = {
  permiso_personal: 'bg-purple-50 text-[#7B1FA2]',
  permiso_medico: 'bg-rose-50 text-rose-600',
  permiso_capacitacion: 'bg-blue-50 text-blue-600',
  permiso_horas: 'bg-cyan-50 text-cyan-600',
  vacaciones: 'bg-[#A3C644]/15 text-[#6f8a1f]',
  otro: 'bg-gray-100 text-gray-600',
};

const ESTADO_BADGE = {
  pendiente: 'bg-amber-50 text-amber-700',
  aprobado: 'bg-green-50 text-green-700',
  rechazado: 'bg-red-50 text-red-700',
};

const formatearVisual = (fechaStr) => {
  if (!fechaStr) return '';
  const [y, m, d] = String(fechaStr).split('T')[0].split('-');
  return `${d}/${m}/${y}`;
};

const formatearFechaHora = (valor) => {
  if (!valor) return '';
  const d = new Date(valor);
  return d.toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const nombreCompleto = (t) => `${t?.nombres || ''} ${t?.apellidos || ''}`.trim();
const iniciales = (t) => `${t?.nombres?.[0] || ''}${t?.apellidos?.[0] || ''}`.toUpperCase();

export default function SolicitudesPage() {
  const ahora = new Date();
  const [mes, setMes] = useState(ahora.getMonth() + 1);
  const [anio] = useState(ahora.getFullYear());
  const [resumen, setResumen] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtro, setFiltro] = useState('pendiente'); // pendiente | '' (todas)
  const [loading, setLoading] = useState(false);
  const [seleccionId, setSeleccionId] = useState(null);
  const [notif, setNotif] = useState(null);
  const [tab, setTab] = useState('solicitudes'); // 'solicitudes' | 'faltas'
  const [porEliminar, setPorEliminar] = useState(null); // id de la solicitud a eliminar
  const [eliminando, setEliminando] = useState(false);

  const showNotif = (message, type = 'success') => {
    setNotif({ message, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const cargarResumen = useCallback(async () => {
    try {
      const r = await getResumenAsistencia({ mes, anio });
      setResumen(r);
    } catch (e) {
      console.error('Error al cargar resumen:', e);
    }
  }, [mes, anio]);

  const cargarSolicitudes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSolicitudes(filtro || undefined);
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error al cargar solicitudes:', e);
      showNotif('Error al cargar solicitudes', 'error');
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => { cargarResumen(); }, [cargarResumen]);
  useEffect(() => { cargarSolicitudes(); }, [cargarSolicitudes]);

  const tras = () => {
    cargarResumen();
    cargarSolicitudes();
  };

  const pedirEliminar = (id, ev) => {
    ev?.stopPropagation();
    setPorEliminar(id);
  };

  const confirmarEliminar = async () => {
    if (!porEliminar) return;
    setEliminando(true);
    try {
      await eliminarSolicitud(porEliminar);
      showNotif('Solicitud eliminada', 'success');
      if (seleccionId === porEliminar) setSeleccionId(null);
      setPorEliminar(null);
      tras();
    } catch (e) {
      showNotif(e.response?.data?.message || 'No se pudo eliminar', 'error');
    } finally {
      setEliminando(false);
    }
  };

  const indicadores = [
    { label: 'Faltas', valor: resumen?.faltas ?? 0, icon: ExclamationTriangleIcon, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Tardanzas', valor: resumen?.tardanzas ?? 0, icon: ClockIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Permisos', valor: resumen?.permisos ?? 0, icon: CalendarDaysIcon, color: 'text-[#7B1FA2]', bg: 'bg-purple-50' },
    { label: 'Vacaciones', valor: resumen?.vacaciones ?? 0, icon: SunIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:pt-12">

        {notif && (
          <div className="fixed top-6 right-6 z-[60] px-5 py-3 rounded-xl shadow-lg border bg-white border-gray-200 flex items-center gap-2.5">
            <div className={`w-1.5 h-1.5 rounded-full ${notif.type === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`} />
            <span className="text-xs font-medium text-gray-700">{notif.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-2xl flex items-center justify-center shadow-lg">
            <CalendarDaysIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Asistencia y ausencias</h1>
            <p className="text-gray-600">Revisa y aprueba las solicitudes de permisos y vacaciones</p>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200">
          {[
            { id: 'solicitudes', label: 'Solicitudes' },
            { id: 'faltas', label: 'Faltas y descuentos' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px ${
                tab === t.id ? 'border-[#7B1FA2] text-[#7B1FA2]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'faltas' ? (
          <FaltasPanel embedded />
        ) : (
        <>
        {/* Resumen */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Resumen</h2>
            <select
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
              className="px-3 py-1.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] bg-white"
            >
              {NOMBRE_MES.map((m, i) => <option key={i} value={i + 1}>{m} {anio}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {indicadores.map((ind) => (
              <div key={ind.label} className="rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500">{ind.label}</span>
                  <div className={`w-8 h-8 ${ind.bg} rounded-lg flex items-center justify-center`}>
                    <ind.icon className={`w-4 h-4 ${ind.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{ind.valor}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
            <span className="text-sm font-medium text-amber-800">
              Solicitudes pendientes: <b>{resumen?.solicitudesPendientes ?? 0}</b>
            </span>
            <button
              onClick={() => setFiltro('pendiente')}
              className="text-xs font-bold text-[#7B1FA2] hover:underline"
            >
              REVISAR
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 mb-4">
          {[
            { id: 'pendiente', label: 'Pendientes' },
            { id: '', label: 'Todas' },
          ].map((f) => (
            <button
              key={f.id || 'todas'}
              onClick={() => setFiltro(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filtro === f.id ? 'bg-[#7B1FA2] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Tabla de solicitudes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Colaborador</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Fecha / Horario</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Motivo</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">Anticipación</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="7" className="px-6 py-16 text-center text-sm text-gray-500">Cargando...</td></tr>
                ) : solicitudes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <InboxIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 font-medium">No hay solicitudes {filtro === 'pendiente' ? 'pendientes' : ''}</p>
                    </td>
                  </tr>
                ) : (
                  solicitudes.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/70 transition-colors cursor-pointer" onClick={() => setSeleccionId(s.id)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {iniciales(s.trabajador)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{nombreCompleto(s.trabajador)}</p>
                            <p className="text-xs text-gray-400 truncate">{s.trabajador?.especialidad?.nombre || s.trabajador?.cargo?.nombre || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${TIPO_BADGE[s.tipo] || 'bg-gray-100 text-gray-600'}`}>
                          {LABEL_TIPO[s.tipo] || s.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatearVisual(s.fecha_inicio)}
                        {s.fecha_fin && s.fecha_fin !== s.fecha_inicio ? ` — ${formatearVisual(s.fecha_fin)}` : ''}
                        {s.hora_desde ? <span className="block text-xs text-gray-400">{s.hora_desde?.slice(0, 5)} - {s.hora_hasta?.slice(0, 5)}</span> : null}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">{s.motivo || '—'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold text-green-600">{s.anticipacion_dias ?? 0} días</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ESTADO_BADGE[s.estado] || 'bg-gray-100 text-gray-600'}`}>
                          {s.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={(ev) => pedirEliminar(s.id, ev)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar solicitud"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <ChevronRightIcon className="w-5 h-5 text-gray-300 inline ml-1" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </div>

      {seleccionId && (
        <PanelDetalle
          id={seleccionId}
          onClose={() => setSeleccionId(null)}
          onRevisada={() => { setSeleccionId(null); tras(); }}
          onPedirEliminar={(sid) => setPorEliminar(sid)}
          notify={showNotif}
        />
      )}

      <ConfirmModal
        open={porEliminar != null}
        title="Eliminar solicitud"
        message="¿Estás seguro de eliminar esta solicitud? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        loading={eliminando}
        onConfirm={confirmarEliminar}
        onCancel={() => setPorEliminar(null)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel lateral: Detalle de la solicitud
// ─────────────────────────────────────────────────────────────────────────────
function PanelDetalle({ id, onClose, onRevisada, onPedirEliminar, notify }) {
  const [sol, setSol] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [comentario, setComentario] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    let vivo = true;
    (async () => {
      setCargando(true);
      try {
        const data = await getSolicitud(id);
        if (vivo) setSol(data);
      } catch (e) {
        notify('Error al cargar el detalle', 'error');
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => { vivo = false; };
  }, [id]);

  const revisar = async (estado) => {
    setProcesando(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await revisarSolicitud(id, { estado, revisorId: user.id, comentarioRrhh: comentario.trim() || undefined });
      notify(estado === 'aprobado' ? 'Solicitud aprobada' : 'Solicitud rechazada', 'success');
      onRevisada();
    } catch (e) {
      notify(e.response?.data?.message || 'Error al procesar', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const pendiente = sol?.estado === 'pendiente';

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-white shadow-xl z-50 flex flex-col">
        <div className="flex-shrink-0 bg-gradient-to-r from-[#7B1FA2] via-[#8E24AA] to-[#AB47BC] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-white/80 uppercase tracking-wide mb-1">Detalle de la solicitud</p>
              <h2 className="text-xl font-bold text-white">{sol ? nombreCompleto(sol.trabajador) : '...'}</h2>
              {sol?.trabajador?.especialidad?.nombre && (
                <p className="text-sm text-white/80">{sol.trabajador.especialidad.nombre}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {!cargando && sol && (
                <button
                  onClick={() => onPedirEliminar?.(sol.id)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
                  title="Eliminar solicitud"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
              <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {cargando || !sol ? (
            <p className="text-sm text-gray-500 text-center py-10">Cargando...</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${TIPO_BADGE[sol.tipo] || 'bg-gray-100 text-gray-600'}`}>
                  {LABEL_TIPO[sol.tipo] || sol.tipo}
                </span>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${ESTADO_BADGE[sol.estado] || 'bg-gray-100'}`}>
                  {sol.estado}
                </span>
              </div>

              {/* Info */}
              <div className="rounded-xl border border-gray-100 divide-y divide-gray-50">
                <Fila label="Fecha" valor={formatearVisual(sol.fecha_inicio) + (sol.fecha_fin && sol.fecha_fin !== sol.fecha_inicio ? ` — ${formatearVisual(sol.fecha_fin)}` : '')} />
                {sol.hora_desde && <Fila label="Horario" valor={`${sol.hora_desde?.slice(0, 5)} - ${sol.hora_hasta?.slice(0, 5)}`} />}
                <Fila label="Fecha de solicitud" valor={formatearFechaHora(sol.fecha_solicitud)} />
                <Fila label="Anticipación" valor={`${sol.anticipacion_dias ?? 0} días`} />
              </div>

              {/* Motivo */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Motivo</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100">{sol.motivo || 'Sin motivo indicado'}</p>
              </div>

              {sol.comentario_colaborador && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Comentario del colaborador</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100">{sol.comentario_colaborador}</p>
                </div>
              )}

              {/* Adjunto */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Documento adjunto</p>
                {sol.archivo_url ? (
                  <a
                    href={`${SERVER_BASE_URL}${sol.archivo_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#7B1FA2] font-medium hover:underline bg-purple-50 rounded-lg px-3 py-2 border border-purple-100"
                  >
                    <PaperClipIcon className="w-4 h-4" /> Ver documento
                  </a>
                ) : (
                  <p className="text-sm text-gray-400 flex items-center gap-2"><DocumentTextIcon className="w-4 h-4" /> No hay documentos adjuntos</p>
                )}
              </div>

              {/* Historial */}
              {sol.historial?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Historial</p>
                  <div className="space-y-3">
                    {sol.historial.map((h) => (
                      <div key={h.id} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#7B1FA2] mt-1.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-gray-700 capitalize">{h.accion}</p>
                          {h.comentario && <p className="text-xs text-gray-500">{h.comentario}</p>}
                          <p className="text-xs text-gray-400">{formatearFechaHora(h.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sol.comentario_rrhh && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Comentario de RRHH</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100">{sol.comentario_rrhh}</p>
                </div>
              )}

              {/* Comentario opcional al revisar */}
              {pendiente && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Comentario (opcional)</p>
                  <textarea
                    rows="2"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Observación interna..."
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] resize-none bg-white"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {pendiente && !cargando && (
          <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
            <button
              onClick={() => revisar('rechazado')}
              disabled={procesando}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-all disabled:opacity-50"
            >
              <XMarkIcon className="w-4 h-4" /> Rechazar
            </button>
            <button
              onClick={() => revisar('aprobado')}
              disabled={procesando}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#A3C644] text-white rounded-lg text-sm font-semibold hover:bg-[#8FB82D] transition-all disabled:opacity-50"
            >
              <CheckIcon className="w-4 h-4" /> Aprobar
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function Fila({ label, valor }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right">{valor}</span>
    </div>
  );
}
