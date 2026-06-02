import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText, Clock, Eye, XCircle, CheckCircle, Package,
  Search, X, Download, Check, RefreshCw, User, Calendar,
  AlertCircle, ChevronLeft, ChevronRight, Edit2, Trash2, History,
} from 'lucide-react';
import {
  obtenerSolicitudesInforme,
  actualizarSolicitudInforme,
  eliminarSolicitudInforme,
  obtenerHistorialEstadoSolicitud,
} from '../../services/solicitudInformeService';
import { getTrabajadores } from '../../services/trabajadorService';
import { getDocumentosTarifa } from '../../services/documentoTarifaService';
import { API_BASE_URL } from '../../services/api';

// ─── Constantes ───────────────────────────────────────────────────────────────

const ESTADO = {
  PENDIENTE_SUBIDA:   1,
  PENDIENTE_REVISION: 2,
  RECHAZADO:          3,
  APROBADO:           4,
  ENTREGADO:          5,
};

const ESTADO_STYLE = {
  1: { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-400',   label: 'Pdte. Subida',    Icon: Clock },
  2: { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    dot: 'bg-blue-500',    label: 'Pdte. Revisión',  Icon: Eye },
  3: { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     dot: 'bg-red-500',     label: 'Rechazado',       Icon: XCircle },
  4: { bg: 'bg-green-50',   border: 'border-green-200',   text: 'text-green-700',   dot: 'bg-green-500',   label: 'Aprobado',        Icon: CheckCircle },
  5: { bg: 'bg-purple-50',  border: 'border-purple-200',  text: 'text-purple-700',  dot: 'bg-purple-500',  label: 'Entregado',       Icon: Package },
};

const estadoStyle = (id) =>
  ESTADO_STYLE[id] ?? { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', dot: 'bg-gray-400', label: '—', Icon: AlertCircle };

const fmtMoney = (v) => `S/ ${Number(v ?? 0).toFixed(2)}`;

const fmtDate = (d) => {
  if (!d) return '—';
  const str = typeof d === 'string' ? d.split('T')[0] : d;
  const [y, m, day] = str.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const ROWS_PER_PAGE = 15;
const COLOR = '#7B1FA2';

// ─── Badge de estado ──────────────────────────────────────────────────────────

const EstadoBadge = ({ estadoId }) => {
  const s = estadoStyle(estadoId);
  const Icon = s.Icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text} border ${s.border} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

// ─── Selector inline de estado ────────────────────────────────────────────────

const SelectorEstado = ({ solicitud, onCambiar, procesando }) => {
  const [open, setOpen] = useState(false);

  const opciones = Object.entries(ESTADO_STYLE).map(([id, s]) => ({
    id: Number(id),
    label: s.label,
    dot: s.dot,
    text: s.text,
  }));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={procesando === solicitud.id}
        className="flex items-center gap-1 group"
        title="Cambiar estado"
      >
        <EstadoBadge estadoId={solicitud.estado_solicitud_id} />
        {procesando === solicitud.id
          ? <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />
          : <Edit2 className="w-3 h-3 text-gray-300 group-hover:text-gray-500 transition" />
        }
      </button>

      {open && (
        <>
          {/* overlay para cerrar */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[160px]">
            {opciones.map(op => (
              <button
                key={op.id}
                onClick={() => { onCambiar(solicitud.id, op.id); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 transition ${
                  solicitud.estado_solicitud_id === op.id ? 'font-bold' : ''
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${op.dot}`} />
                <span className={op.text}>{op.label}</span>
                {solicitud.estado_solicitud_id === op.id && (
                  <Check className="w-3 h-3 ml-auto text-gray-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Modal Editar ─────────────────────────────────────────────────────────────

const ModalEditar = ({ solicitud, documentosTarifa, trabajadores, onGuardar, onCerrar, guardando }) => {
  const [tipo,      setTipo]      = useState(String(solicitud.documento_tarifa_id ?? ''));
  const [terapeuta, setTerapeuta] = useState(String(solicitud.especialista_id ?? ''));

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]" onClick={onCerrar} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm pointer-events-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800">Editar solicitud</h3>
            <button onClick={onCerrar} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tipo de informe</label>
              <select value={tipo} onChange={e => setTipo(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/20 transition">
                <option value="">Seleccionar...</option>
                {documentosTarifa.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Terapeuta</label>
              <select value={terapeuta} onChange={e => setTerapeuta(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/20 transition">
                <option value="">Seleccionar...</option>
                {trabajadores.map(t => <option key={t.id} value={t.id}>{t.nombres} {t.apellidos}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={onCerrar}
                className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button
                onClick={() => onGuardar({
                  documento_tarifa_id: tipo      ? Number(tipo)      : undefined,
                  especialista_id:     terapeuta ? Number(terapeuta) : undefined,
                })}
                disabled={guardando}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] disabled:opacity-50 transition">
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

// ─── Modal Eliminar ───────────────────────────────────────────────────────────

const ModalEliminar = ({ onConfirmar, onCerrar, procesando }) => createPortal(
  <>
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]" onClick={onCerrar} />
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm pointer-events-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">Eliminar solicitud</h3>
          </div>
          <button onClick={onCerrar} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-600 mb-5">¿Estás segura de que deseas eliminar esta solicitud de informe? Esta acción no se puede deshacer.</p>
          <div className="flex gap-2">
            <button onClick={onCerrar}
              className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button onClick={onConfirmar} disabled={procesando}
              className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition">
              {procesando ? 'Eliminando…' : 'Sí, eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </>,
  document.body
);

// ─── Modal Historial ──────────────────────────────────────────────────────────

const ModalHistorial = ({ solicitud, onCerrar }) => {
  const [historial,  setHistorial]  = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [errorMsg,   setErrorMsg]   = useState('');

  useEffect(() => {
    setCargando(true);
    obtenerHistorialEstadoSolicitud(solicitud.id)
      .then(data => setHistorial(Array.isArray(data) ? data : []))
      .catch(() => setErrorMsg('No se pudo cargar el historial.'))
      .finally(() => setCargando(false));
  }, [solicitud.id]);

  const fmtDateTime = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]" onClick={onCerrar} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg pointer-events-auto flex flex-col max-h-[85vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                <History className="w-4 h-4 text-[#7B1FA2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Historial de estados</h3>
                <p className="text-xs text-gray-400">Solicitud #{solicitud.id}</p>
              </div>
            </div>
            <button onClick={onCerrar} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-5">
            {cargando ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin" />
              </div>
            ) : errorMsg ? (
              <p className="text-sm text-red-500 text-center py-8">{errorMsg}</p>
            ) : historial.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8 italic">Sin historial registrado.</p>
            ) : (
              <ol className="relative border-l-2 border-gray-100 ml-3 space-y-5">
                {historial.map((h, i) => {
                  const sAnt = h.estado_anterior_id ? estadoStyle(h.estado_anterior_id) : null;
                  const sNuevo = estadoStyle(h.estado_nuevo_id);
                  const IconNuevo = sNuevo.Icon;
                  const user = h.user ? [h.user.nombres, h.user.apellidos].filter(Boolean).join(' ') : null;

                  return (
                    <li key={h.id} className="ml-5">
                      {/* Dot */}
                      <span className={`absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full ${sNuevo.bg} border-2 border-white`}>
                        <span className={`w-2 h-2 rounded-full ${sNuevo.dot}`} />
                      </span>

                      <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                        {/* Transición de estado */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {sAnt ? (
                            <>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sAnt.bg} ${sAnt.text} border ${sAnt.border}`}>
                                {sAnt.label}
                              </span>
                              <span className="text-gray-300 text-xs">→</span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Creación</span>
                          )}
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sNuevo.bg} ${sNuevo.text} border ${sNuevo.border}`}>
                            {sNuevo.label}
                          </span>
                        </div>

                        {/* Observación */}
                        {h.observacion && (
                          <p className="text-xs text-gray-500 mt-1">{h.observacion}</p>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                          <span>{fmtDateTime(h.created_at)}</span>
                          {user && <span>· {user}</span>}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

// ─── Página Principal ─────────────────────────────────────────────────────────

export default function GestionInformesPage() {
  const [solicitudes,     setSolicitudes]     = useState([]);
  const [trabajadores,    setTrabajadores]    = useState([]);
  const [documentosTarifa, setDocumentosTarifa] = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');
  const [procesando,      setProcesando]      = useState(null);
  const [feedback,        setFeedback]        = useState(null);
  const [modalEditar,     setModalEditar]     = useState(null); // solicitud a editar
  const [confirmEliminar, setConfirmEliminar] = useState(null); // id a eliminar
  const [verHistorial,    setVerHistorial]    = useState(null); // solicitud para historial

  // Filtros
  const [busqueda, setBusqueda]               = useState('');
  const [filtroEstado, setFiltroEstado]       = useState('');
  const [filtroTerapeuta, setFiltroTerapeuta] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');

  // Paginación
  const [page, setPage] = useState(0);

  // ── Carga ──────────────────────────────────────────────────────────────────

  const cargar = async () => {
    setLoading(true);
    setError('');
    try {
      const [data, trab, tipos] = await Promise.all([
        obtenerSolicitudesInforme(),
        getTrabajadores().catch(() => []),
        getDocumentosTarifa().catch(() => []),
      ]);
      setSolicitudes(Array.isArray(data) ? data : []);
      setTrabajadores(Array.isArray(trab) ? trab : []);
      setDocumentosTarifa(Array.isArray(tipos) ? tipos : []);
    } catch {
      setError('No se pudo cargar el listado de solicitudes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  // ── Helpers de nombre ──────────────────────────────────────────────────────

  const nombrePaciente = (s) => {
    const p = s.venta_servicio?.paciente;
    if (!p) return '—';
    return [p.nombres, p.apellido_paterno, p.apellido_materno].filter(Boolean).join(' ');
  };

  const nombreTerapeuta = (s) => {
    const e = s.especialista;
    if (!e) return '—';
    return [e.nombres, e.apellidos].filter(Boolean).join(' ');
  };

  const nombreCreador = (s) => {
    if (s.user_crea) {
      return [s.user_crea.nombres, s.user_crea.apellidos].filter(Boolean).join(' ');
    }
    const t = trabajadores.find(t => t.id === s.user_crea_id);
    if (!t) return s.user_crea_id ? `#${s.user_crea_id}` : '—';
    return [t.nombres, t.apellidos].filter(Boolean).join(' ');
  };

  const nombreRevisor = (s) => {
    const r = s.revisor;
    if (!r) return '—';
    return [r.nombres, r.apellidos].filter(Boolean).join(' ');
  };

  // ── Terapeutas únicos para filtro ──────────────────────────────────────────

  const terapeutasUnicos = useMemo(() => {
    const map = new Map();
    solicitudes.forEach(s => {
      const e = s.especialista;
      if (e && !map.has(e.id))
        map.set(e.id, [e.nombres, e.apellidos].filter(Boolean).join(' '));
    });
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [solicitudes]);

  // ── Filtrado ───────────────────────────────────────────────────────────────

  const filtradas = useMemo(() => {
    const q = busqueda.toLowerCase();
    return solicitudes.filter(s => {
      if (filtroEstado && String(s.estado_solicitud_id) !== filtroEstado) return false;
      if (filtroTerapeuta && String(s.especialista_id) !== filtroTerapeuta) return false;
      if (filtroFechaDesde && s.fecha_solicitud < filtroFechaDesde) return false;
      if (filtroFechaHasta && s.fecha_solicitud > filtroFechaHasta) return false;
      if (q) {
        const pac = nombrePaciente(s).toLowerCase();
        const ter = nombreTerapeuta(s).toLowerCase();
        const tipo = (s.documento_tarifa?.nombre ?? '').toLowerCase();
        if (!pac.includes(q) && !ter.includes(q) && !tipo.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [solicitudes, busqueda, filtroEstado, filtroTerapeuta, filtroFechaDesde, filtroFechaHasta]);

  const totalPages  = Math.ceil(filtradas.length / ROWS_PER_PAGE);
  const paginated   = filtradas.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  useEffect(() => { setPage(0); }, [busqueda, filtroEstado, filtroTerapeuta, filtroFechaDesde, filtroFechaHasta]);

  // ── Resumen por estado ─────────────────────────────────────────────────────

  const resumen = useMemo(() => {
    const r = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    solicitudes.forEach(s => { if (r[s.estado_solicitud_id] !== undefined) r[s.estado_solicitud_id]++; });
    return r;
  }, [solicitudes]);

  // ── Cambiar estado (admin) ─────────────────────────────────────────────────

  const handleCambiarEstado = async (id, nuevoEstadoId) => {
    if (procesando === id) return;
    setProcesando(id);
    try {
      await actualizarSolicitudInforme(id, { estado_solicitud_id: nuevoEstadoId });
      setSolicitudes(prev =>
        prev.map(s => s.id === id ? { ...s, estado_solicitud_id: nuevoEstadoId } : s)
      );
      mostrarFeedback('exito', 'Estado actualizado correctamente.');
    } catch {
      mostrarFeedback('error', 'No se pudo cambiar el estado.');
    } finally {
      setProcesando(null);
    }
  };

  const handleGuardarEdicion = async (cambios) => {
    if (!modalEditar) return;
    const id = modalEditar.id;
    setProcesando(id);
    try {
      await actualizarSolicitudInforme(id, cambios);
      setSolicitudes(prev => prev.map(s => {
        if (s.id !== id) return s;
        const especialista = cambios.especialista_id
          ? (trabajadores.find(t => t.id === cambios.especialista_id) ?? s.especialista)
          : s.especialista;
        const documento_tarifa = cambios.documento_tarifa_id
          ? (documentosTarifa.find(d => d.id === cambios.documento_tarifa_id) ?? s.documento_tarifa)
          : s.documento_tarifa;
        return { ...s, ...cambios, especialista, documento_tarifa };
      }));
      mostrarFeedback('exito', 'Actualizado correctamente.');
      setModalEditar(null);
    } catch {
      mostrarFeedback('error', 'No se pudo guardar el cambio.');
    } finally {
      setProcesando(null);
    }
  };

  const handleEliminar = async (id) => {
    setProcesando(id);
    try {
      await eliminarSolicitudInforme(id);
      setSolicitudes(prev => prev.filter(s => s.id !== id));
      mostrarFeedback('exito', 'Solicitud eliminada.');
      setConfirmEliminar(null);
    } catch {
      mostrarFeedback('error', 'No se pudo eliminar la solicitud.');
    } finally {
      setProcesando(null);
    }
  };

  const mostrarFeedback = (tipo, msg) => {
    setFeedback({ tipo, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  const buildArchivoUrl = (archivoUrl) => {
    const nombre = archivoUrl.split('/').pop();
    return `${API_BASE_URL}/solicitudes-informe/archivo/${nombre}`;
  };

  const handleDescargar = async (archivoUrl) => {
    const url = buildArchivoUrl(archivoUrl);
    const nombre = archivoUrl.split('/').pop() || 'informe';
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = nombre;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch {
      mostrarFeedback('error', 'No se pudo descargar el archivo.');
    }
  };


  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('');
    setFiltroTerapeuta('');
    setFiltroFechaDesde('');
    setFiltroFechaHasta('');
  };

  const hayFiltros = busqueda || filtroEstado || filtroTerapeuta || filtroFechaDesde || filtroFechaHasta;

  // ── RESUMEN CARDS ──────────────────────────────────────────────────────────

  const cards = [
    { label: 'Total',          value: solicitudes.length, color: 'text-gray-700',   bg: 'bg-gray-100',    id: '' },
    { label: 'Pdte. Subida',   value: resumen[1],         color: 'text-amber-700',  bg: 'bg-amber-50',    id: '1' },
    { label: 'Pdte. Revisión', value: resumen[2],         color: 'text-blue-700',   bg: 'bg-blue-50',     id: '2' },
    { label: 'Aprobado',       value: resumen[4],         color: 'text-green-700',  bg: 'bg-green-50',    id: '4' },
    { label: 'Entregado',      value: resumen[5],         color: 'text-purple-700', bg: 'bg-purple-50',   id: '5' },
  ];

  // ── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <FileText className="w-8 h-8" style={{ color: COLOR }} />
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Informes</h1>
            </div>
            <p className="text-sm text-gray-500">Resumen y control de todas las solicitudes de informe</p>
          </div>
          <button
            onClick={cargar}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition hover:opacity-90 shadow-sm"
            style={{ backgroundColor: COLOR }}
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`px-4 py-2.5 rounded-xl text-sm font-medium border ${
            feedback.tipo === 'exito'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {feedback.msg}
          </div>
        )}

        {/* Cards resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {cards.map(c => (
            <button
              key={c.id}
              onClick={() => setFiltroEstado(c.id)}
              className={`bg-white rounded-2xl p-4 shadow-sm border-2 text-left transition ${
                filtroEstado === c.id ? 'border-[#7B1FA2]' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-2`}>
                <span className={`text-lg font-bold ${c.color}`}>{c.value}</span>
              </div>
              <div className="text-xs text-gray-500 font-medium">{c.label}</div>
            </button>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Búsqueda */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Paciente, terapeuta, tipo…"
                  className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]"
                />
                {busqueda && (
                  <button onClick={() => setBusqueda('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {/* Estado */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Estado</label>
              <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]">
                <option value="">Todos</option>
                {Object.entries(ESTADO_STYLE).map(([id, s]) => <option key={id} value={id}>{s.label}</option>)}
              </select>
            </div>
            {/* Terapeuta */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Terapeuta</label>
              <select value={filtroTerapeuta} onChange={e => setFiltroTerapeuta(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]">
                <option value="">Todas</option>
                {terapeutasUnicos.map(([id, nombre]) => <option key={id} value={String(id)}>{nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Desde</label>
              <input type="date" value={filtroFechaDesde} onChange={e => setFiltroFechaDesde(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Hasta</label>
              <input type="date" value={filtroFechaHasta} onChange={e => setFiltroFechaHasta(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]" />
            </div>
            {hayFiltros && (
              <button onClick={limpiarFiltros} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition pb-2">
                <X className="w-3.5 h-3.5" /> Limpiar
              </button>
            )}
          </div>
        </div>

        {modalEditar && (
          <ModalEditar
            solicitud={modalEditar}
            documentosTarifa={documentosTarifa}
            trabajadores={trabajadores}
            onGuardar={handleGuardarEdicion}
            onCerrar={() => setModalEditar(null)}
            guardando={procesando === modalEditar.id}
          />
        )}
        {confirmEliminar && (
          <ModalEliminar
            onConfirmar={() => handleEliminar(confirmEliminar)}
            onCerrar={() => setConfirmEliminar(null)}
            procesando={procesando === confirmEliminar}
          />
        )}
        {verHistorial && (
          <ModalHistorial
            solicitud={verHistorial}
            onCerrar={() => setVerHistorial(null)}
          />
        )}

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>{error}</p>
            </div>
          ) : filtradas.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-25" />
              <p className="font-medium">No hay solicitudes con los filtros aplicados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Paciente', 'Tipo de informe', 'Terapeuta', 'Generado por', 'Revisado por', 'F. Solicitud', 'Monto', 'Estado', 'Archivo', ''].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map(s => (
                    <tr key={s.id} className="hover:bg-[#7B1FA2]/[0.02] transition">

                      {/* Paciente */}
                      <td className="px-3 py-2">
                        <span className="font-semibold text-gray-800 whitespace-nowrap">{nombrePaciente(s)}</span>
                      </td>

                      {/* Tipo */}
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {s.documento_tarifa?.nombre ?? '—'}
                      </td>

                      {/* Terapeuta */}
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {nombreTerapeuta(s)}
                      </td>

                      {/* Generado por */}
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{nombreCreador(s)}</td>

                      {/* Revisado por */}
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{nombreRevisor(s)}</td>

                      {/* Fecha */}
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmtDate(s.fecha_solicitud)}</td>

                      {/* Monto */}
                      <td className="px-3 py-2">
                        <span className="font-bold text-gray-800 whitespace-nowrap">{fmtMoney(s.monto)}</span>
                        {(() => {
                          const detalles = s.venta_servicio?.detalles ?? [];
                          const itemInforme = detalles.find(d => d.tipoItemVenta === 2 || d.tipo_item_venta === 2);
                          if (!itemInforme?.paquete_combo_id) return null;
                          const comboTotal = detalles
                            .filter(d => d.paquete_combo_id === itemInforme.paquete_combo_id)
                            .reduce((acc, d) => acc + Number(d.subtotal ?? 0), 0);
                          return (
                            <div className="mt-0.5">
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 whitespace-nowrap">
                                <Package className="w-2.5 h-2.5 shrink-0" />
                                {fmtMoney(comboTotal)}
                              </span>
                            </div>
                          );
                        })()}
                        {s.venta_servicio?.pagos?.length > 0 ? (
                          <div className="mt-0.5 space-y-0.5">
                            {s.venta_servicio.pagos.map((p, i) => (
                              <div key={i} className="text-[11px] text-gray-400 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                                {p.modalidad_pago?.nombre || '—'}
                                <span className="font-medium text-gray-500">S/ {Number(p.monto || 0).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        ) : s.modalidad_pago?.nombre ? (
                          <div className="text-[11px] text-gray-400 mt-0.5">{s.modalidad_pago.nombre}</div>
                        ) : null}
                      </td>

                      {/* Estado */}
                      <td className="px-3 py-2">
                        <SelectorEstado solicitud={s} onCambiar={handleCambiarEstado} procesando={procesando} />
                      </td>

                      {/* Archivo */}
                      <td className="px-3 py-2">
                        {s.archivo_url ? (() => {
                          const esPdf = s.archivo_url.toLowerCase().endsWith('.pdf');
                          return (
                            <div className="flex items-center gap-1">
                              {esPdf && (
                                <a href={buildArchivoUrl(s.archivo_url)} target="_blank" rel="noopener noreferrer"
                                  title="Ver PDF"
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg text-[#7B1FA2] bg-[#7B1FA2]/8 hover:bg-[#7B1FA2]/15 transition whitespace-nowrap">
                                  <Eye className="w-3.5 h-3.5" /> Ver
                                </a>
                              )}
                              <button
                                onClick={() => handleDescargar(s.archivo_url)}
                                title="Descargar"
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg text-green-700 bg-green-50 hover:bg-green-100 transition whitespace-nowrap">
                                <Download className="w-3.5 h-3.5" /> Descargar
                              </button>
                            </div>
                          );
                        })() : (
                          <span className="text-xs text-gray-300 italic">Sin archivo</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setVerHistorial(s)} title="Historial de estados"
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                            <History className="w-4 h-4" />
                          </button>
                          <button onClick={() => setModalEditar(s)} title="Editar"
                            className="p-1.5 text-gray-400 hover:text-[#7B1FA2] hover:bg-purple-50 rounded-lg transition">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setConfirmEliminar(s.id)} title="Eliminar"
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
              <span>{filtradas.length} resultado{filtradas.length !== 1 ? 's' : ''}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-medium text-gray-700">Pág. {page + 1} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
