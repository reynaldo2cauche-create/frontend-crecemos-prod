import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText, Clock, Eye, XCircle, CheckCircle, Package,
  Search, X, Download, Check, RefreshCw, Calendar,
  AlertCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Edit2, Trash2, History, Stethoscope, Activity, Layers, ChevronDown, Filter,
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
import '../../styles/intranet.css';

// ─── Constantes ───────────────────────────────────────────────────────────────

const ESTADO = {
  PENDIENTE_SUBIDA:   1,
  PENDIENTE_REVISION: 2,
  RECHAZADO:          3,
  APROBADO:           4,
  ENTREGADO:          5,
};

const ESTADO_STYLE = {
  1: { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-400',   hex: '#f59e0b', label: 'Pdte. Subida',    Icon: Clock },
  2: { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    dot: 'bg-blue-500',    hex: '#2563eb', label: 'Pdte. Revisión',  Icon: Eye },
  3: { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     dot: 'bg-red-500',     hex: '#f43f5e', label: 'Rechazado',       Icon: XCircle },
  4: { bg: 'bg-green-50',   border: 'border-green-200',   text: 'text-green-700',   dot: 'bg-green-500',   hex: '#16a34a', label: 'Aprobado',        Icon: CheckCircle },
  5: { bg: 'bg-purple-50',  border: 'border-purple-200',  text: 'text-purple-700',  dot: 'bg-purple-500',  hex: '#7B1FA2', label: 'Entregado',       Icon: Package },
};

const estadoStyle = (id) =>
  ESTADO_STYLE[id] ?? { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', dot: 'bg-gray-400', hex: '#9ca3af', label: '—', Icon: AlertCircle };

const fmtMoney = (v) => `S/ ${Number(v ?? 0).toFixed(2)}`;

const fmtDate = (d) => {
  if (!d) return '—';
  const str = typeof d === 'string' ? d.split('T')[0] : d;
  const [y, m, day] = str.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

// ─── Sparkline decorativo (sutil) para las stat cards ─────────────────────────

const Sparkline = ({ color = '#7B1FA2' }) => {
  const id = `sg-${color.replace('#', '')}`;
  return (
    <svg className="absolute bottom-0 left-0 w-full h-9 pointer-events-none" viewBox="0 0 120 40" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0,28 C15,24 22,13 36,18 C50,23 58,8 72,12 C86,16 98,27 120,15 L120,40 L0,40 Z" fill={`url(#${id})`} />
      <path d="M0,28 C15,24 22,13 36,18 C50,23 58,8 72,12 C86,16 98,27 120,15" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.45" />
    </svg>
  );
};

// ─── Dropdown custom con opciones estilizadas ─────────────────────────────────

const DropdownFiltro = ({
  icon: Icon,
  iconClass = 'text-gray-400',
  value,
  onChange,
  options = [],
  placeholder = 'Seleccionar',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const selected = options.find((o) => String(o.value) === String(value));
  const activo = value !== '' && value !== null && value !== undefined;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center ${Icon ? 'pl-10' : 'pl-4'} rounded-xl border bg-white py-2.5 pr-9 text-left text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#A3C644] ${
          open ? 'border-[#A3C644] ring-2 ring-[#A3C644]' : 'border-gray-200'
        }`}
      >
        {Icon && <Icon className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${iconClass}`} />}
        <span className={`truncate ${activo ? 'font-medium text-gray-800' : 'text-gray-500'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 max-h-72 w-full min-w-[200px] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5">
          {options.map((o) => {
            const isSel = String(o.value) === String(value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isSel ? 'bg-purple-50 font-semibold text-[#7B1FA2]' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="truncate">{o.label}</span>
                {isSel && <Check className="h-4 w-4 flex-shrink-0 text-[#7B1FA2]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Badge de estado ──────────────────────────────────────────────────────────

const EstadoBadge = ({ estadoId }) => {
  const s = estadoStyle(estadoId);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text} border ${s.border} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

// ─── Selector inline de estado (menú en portal para no quedar recortado) ──────

const SelectorEstado = ({ solicitud, onCambiar, procesando }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  const opciones = Object.entries(ESTADO_STYLE).map(([id, s]) => ({
    id: Number(id),
    label: s.label,
    dot: s.dot,
    text: s.text,
  }));

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const menuH = 230;
      const top = r.bottom + menuH > window.innerHeight ? Math.max(8, r.top - menuH - 4) : r.bottom + 4;
      setPos({ top, left: r.left });
    }
    setOpen((o) => !o);
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={toggle}
        disabled={procesando === solicitud.id}
        className="flex items-center gap-1.5 group"
        title="Cambiar estado"
      >
        <EstadoBadge estadoId={solicitud.estado_solicitud_id} />
        {procesando === solicitud.id
          ? <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />
          : <Edit2 className="w-3 h-3 text-gray-300 group-hover:text-[#7B1FA2] transition" />
        }
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[9999] min-w-[180px] rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5"
            style={{ top: pos.top, left: pos.left }}
          >
            {opciones.map((op) => {
              const isSel = solicitud.estado_solicitud_id === op.id;
              return (
                <button
                  key={op.id}
                  onClick={() => { onCambiar(solicitud.id, op.id); setOpen(false); }}
                  className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isSel ? 'bg-purple-50 font-semibold' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${op.dot}`} />
                  <span className={op.text}>{op.label}</span>
                  {isSel && <Check className="w-4 h-4 ml-auto text-[#7B1FA2]" />}
                </button>
              );
            })}
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

// ─── Modal Editar ─────────────────────────────────────────────────────────────

const ModalEditar = ({ solicitud, documentosTarifa, trabajadores, onGuardar, onCerrar, guardando }) => {
  const [tipo,      setTipo]      = useState(String(solicitud.documento_tarifa_id ?? ''));
  const [terapeuta, setTerapeuta] = useState(String(solicitud.especialista_id ?? ''));

  return createPortal(
    <div className="tailwind-scope">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]" onClick={onCerrar} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto ring-1 ring-black/5">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center shadow-sm">
                <Edit2 className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-extrabold text-gray-900">Editar solicitud</h3>
            </div>
            <button onClick={onCerrar} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tipo de informe</label>
              <DropdownFiltro
                icon={FileText}
                iconClass="text-blue-500"
                placeholder="Seleccionar..."
                value={tipo}
                onChange={setTipo}
                options={[
                  { value: '', label: 'Seleccionar...' },
                  ...documentosTarifa.map((d) => ({ value: String(d.id), label: d.nombre })),
                ]}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Terapeuta</label>
              <DropdownFiltro
                icon={Stethoscope}
                iconClass="text-teal-500"
                placeholder="Seleccionar..."
                value={terapeuta}
                onChange={setTerapeuta}
                options={[
                  { value: '', label: 'Seleccionar...' },
                  ...trabajadores.map((t) => ({ value: String(t.id), label: `${t.nombres} ${t.apellidos}` })),
                ]}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={onCerrar}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-[#7B1FA2] transition-all">
                Cancelar
              </button>
              <button
                onClick={() => onGuardar({
                  documento_tarifa_id: tipo      ? Number(tipo)      : undefined,
                  especialista_id:     terapeuta ? Number(terapeuta) : undefined,
                })}
                disabled={guardando}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] rounded-xl shadow-md shadow-purple-500/25 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── Modal Eliminar ───────────────────────────────────────────────────────────

const ModalEliminar = ({ onConfirmar, onCerrar, procesando }) => createPortal(
  <div className="tailwind-scope">
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]" onClick={onCerrar} />
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto ring-1 ring-black/5">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-rose-500" />
            </div>
            <h3 className="text-sm font-extrabold text-gray-900">Eliminar solicitud</h3>
          </div>
          <button onClick={onCerrar} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-600 mb-5">¿Estás segura de que deseas eliminar esta solicitud de informe? Esta acción no se puede deshacer.</p>
          <div className="flex gap-2">
            <button onClick={onCerrar}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
              Cancelar
            </button>
            <button onClick={onConfirmar} disabled={procesando}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-red-500 rounded-xl shadow-md shadow-rose-500/25 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {procesando ? 'Eliminando…' : 'Sí, eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>,
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
    <div className="tailwind-scope">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]" onClick={onCerrar} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto flex flex-col max-h-[85vh] ring-1 ring-black/5">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center shadow-sm">
                <History className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 leading-tight">Historial de estados</h3>
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
              <ol className="relative border-l-2 border-purple-100 ml-3 space-y-5">
                {historial.map((h) => {
                  const sAnt = h.estado_anterior_id ? estadoStyle(h.estado_anterior_id) : null;
                  const sNuevo = estadoStyle(h.estado_nuevo_id);
                  const user = h.user ? [h.user.nombres, h.user.apellidos].filter(Boolean).join(' ') : null;

                  return (
                    <li key={h.id} className="ml-5">
                      <span className={`absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full ${sNuevo.bg} border-2 border-white`}>
                        <span className={`w-2 h-2 rounded-full ${sNuevo.dot}`} />
                      </span>

                      <div className="bg-gray-50/80 rounded-xl px-4 py-3 border border-gray-100">
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

                        {h.observacion && (
                          <p className="text-xs text-gray-500 mt-1">{h.observacion}</p>
                        )}

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
    </div>,
    document.body
  );
};

// ─── Página Principal ─────────────────────────────────────────────────────────

export default function GestionInformesPage() {
  const [solicitudes,      setSolicitudes]      = useState([]);
  const [trabajadores,     setTrabajadores]     = useState([]);
  const [documentosTarifa, setDocumentosTarifa] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');
  const [procesando,       setProcesando]       = useState(null);
  const [feedback,         setFeedback]         = useState(null);
  const [modalEditar,      setModalEditar]      = useState(null); // solicitud a editar
  const [confirmEliminar,  setConfirmEliminar]  = useState(null); // id a eliminar
  const [verHistorial,     setVerHistorial]     = useState(null); // solicitud para historial

  // Filtros
  const [busqueda, setBusqueda]                 = useState('');
  const [filtroEstado, setFiltroEstado]         = useState('');
  const [filtroTerapeuta, setFiltroTerapeuta]   = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');

  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solicitudes, busqueda, filtroEstado, filtroTerapeuta, filtroFechaDesde, filtroFechaHasta]);

  const totalPages  = Math.ceil(filtradas.length / rowsPerPage);
  const paginated   = filtradas.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  useEffect(() => { setPage(0); }, [busqueda, filtroEstado, filtroTerapeuta, filtroFechaDesde, filtroFechaHasta, rowsPerPage]);

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
    { label: 'Total',          value: solicitudes.length, hex: '#6b7280', bg: 'bg-gray-100',   iconColor: 'text-gray-600',   Icon: FileText,    id: '' },
    { label: 'Pdte. Subida',   value: resumen[1],         hex: '#f59e0b', bg: 'bg-amber-50',   iconColor: 'text-amber-600',  Icon: Clock,       id: '1' },
    { label: 'Pdte. Revisión', value: resumen[2],         hex: '#2563eb', bg: 'bg-blue-50',    iconColor: 'text-blue-600',   Icon: Eye,         id: '2' },
    { label: 'Aprobado',       value: resumen[4],         hex: '#16a34a', bg: 'bg-green-50',   iconColor: 'text-green-600',  Icon: CheckCircle, id: '4' },
    { label: 'Entregado',      value: resumen[5],         hex: '#7B1FA2', bg: 'bg-purple-50',  iconColor: 'text-[#7B1FA2]',  Icon: Package,     id: '5' },
  ];

  const estadoOptions = [
    { value: '', label: 'Todos los estados' },
    ...Object.entries(ESTADO_STYLE).map(([id, s]) => ({ value: id, label: s.label })),
  ];

  const terapeutaOptions = [
    { value: '', label: 'Todas las terapeutas' },
    ...terapeutasUnicos.map(([id, nombre]) => ({ value: String(id), label: nombre })),
  ];

  // ── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="tailwind-scope">
      <div
        className="cx-admin-bg min-h-screen"
        style={{ padding: '1rem 1.25rem' }}
      >
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center shadow-sm flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-gray-900 leading-tight">Gestión de Informes</h1>
              <p className="text-[13px] text-gray-400 -mt-0.5">Resumen y control de todas las solicitudes de informe</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={cargar}
                className="cx-glow flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl text-sm font-semibold"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`mb-3 px-4 py-2.5 rounded-xl text-sm font-medium border flex items-center gap-2 ${
              feedback.tipo === 'exito'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {feedback.tipo === 'exito'
                ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {feedback.msg}
            </div>
          )}

          {/* Cards resumen */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
            {cards.map(c => {
              const activa = filtroEstado === c.id;
              const CardIcon = c.Icon;
              return (
                <button
                  key={c.id}
                  onClick={() => setFiltroEstado(c.id)}
                  className={`glass-card rounded-2xl p-4 flex items-center gap-3.5 relative overflow-hidden text-left transition-all ${
                    activa ? 'ring-2 ring-[#7B1FA2]' : 'hover:-translate-y-0.5'
                  }`}
                >
                  <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center flex-shrink-0 relative z-10`}>
                    <CardIcon className={`w-6 h-6 ${c.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1 relative z-10">
                    <p className="text-xs font-medium text-gray-400 truncate">{c.label}</p>
                    <p className="text-[26px] font-extrabold text-gray-900 leading-tight">{c.value}</p>
                  </div>
                  <Sparkline color={c.hex} />
                </button>
              );
            })}
          </div>

          {/* Filtros */}
          <div className="mb-3">
            <div className="glass-panel rounded-2xl p-4 relative z-30">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Búsqueda */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B1FA2] pointer-events-none" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    placeholder="Buscar por paciente, terapeuta, tipo…"
                    className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all"
                  />
                  {busqueda && (
                    <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Estado */}
                <DropdownFiltro
                  className="min-w-[170px]"
                  icon={Activity}
                  iconClass="text-emerald-500"
                  placeholder="Estado"
                  value={filtroEstado}
                  onChange={setFiltroEstado}
                  options={estadoOptions}
                />

                {/* Terapeuta */}
                <DropdownFiltro
                  className="min-w-[190px]"
                  icon={Stethoscope}
                  iconClass="text-teal-500"
                  placeholder="Terapeuta"
                  value={filtroTerapeuta}
                  onChange={setFiltroTerapeuta}
                  options={terapeutaOptions}
                />

                {/* Fechas */}
                <div className="relative min-w-[150px]">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
                  <input
                    type="date"
                    value={filtroFechaDesde}
                    onChange={e => setFiltroFechaDesde(e.target.value)}
                    title="Desde"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all"
                  />
                </div>
                <div className="relative min-w-[150px]">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500 pointer-events-none" />
                  <input
                    type="date"
                    value={filtroFechaHasta}
                    onChange={e => setFiltroFechaHasta(e.target.value)}
                    title="Hasta"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all"
                  />
                </div>

                {/* Limpiar */}
                <button
                  onClick={limpiarFiltros}
                  title="Limpiar filtros"
                  disabled={!hayFiltros}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 hover:text-[#7B1FA2] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-extrabold text-gray-900">Resultados</h2>
              <div className="px-2.5 py-0.5 bg-purple-50 text-[#7B1FA2] rounded-full text-sm font-bold">
                {filtradas.length} {filtradas.length === 1 ? 'solicitud' : 'solicitudes'}
              </div>
              {hayFiltros && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 border border-purple-200 text-purple-800 rounded-full text-xs font-semibold">
                  <Filter className="w-3 h-3" />
                  Filtros activos
                </div>
              )}
            </div>
          </div>

          {/* Modales */}
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
          <div className="glass-panel rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-16 text-rose-400">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>{error}</p>
              </div>
            ) : filtradas.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-purple-50 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-[#7B1FA2] opacity-60" />
                </div>
                <p className="font-medium">No hay solicitudes con los filtros aplicados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      {['Paciente', 'Tipo de informe', 'Terapeuta', 'Generado por', 'Revisado por', 'F. Solicitud', 'Monto', 'Estado', 'Archivo', ''].map((h, i) => (
                        <th key={i} className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginated.map(s => (
                      <tr key={s.id} className="hover:bg-[#7B1FA2]/[0.03] transition-colors">

                        {/* Paciente */}
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-900 whitespace-nowrap">{nombrePaciente(s)}</span>
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
                        <td className="px-4 py-3">
                          <span className="font-extrabold text-gray-900 whitespace-nowrap">{fmtMoney(s.monto)}</span>
                          {(() => {
                            const detalles = s.venta_servicio?.detalles ?? [];
                            const itemInforme = detalles.find(d => d.tipoItemVenta === 2 || d.tipo_item_venta === 2);
                            if (!itemInforme?.paquete_combo_id) return null;
                            const comboTotal = detalles
                              .filter(d => d.paquete_combo_id === itemInforme.paquete_combo_id)
                              .reduce((acc, d) => acc + Number(d.subtotal ?? 0), 0);
                            return (
                              <div className="mt-0.5">
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 whitespace-nowrap">
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
                        <td className="px-4 py-3">
                          <SelectorEstado solicitud={s} onCambiar={handleCambiarEstado} procesando={procesando} />
                        </td>

                        {/* Archivo */}
                        <td className="px-4 py-3">
                          {s.archivo_url ? (() => {
                            const esPdf = s.archivo_url.toLowerCase().endsWith('.pdf');
                            return (
                              <div className="flex items-center gap-1.5">
                                {esPdf && (
                                  <a href={buildArchivoUrl(s.archivo_url)} target="_blank" rel="noopener noreferrer"
                                    title="Ver PDF"
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-[#7B1FA2] bg-purple-50 hover:bg-purple-100 transition whitespace-nowrap">
                                    <Eye className="w-3.5 h-3.5" /> Ver
                                  </a>
                                )}
                                <button
                                  onClick={() => handleDescargar(s.archivo_url)}
                                  title="Descargar"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-green-700 bg-green-50 hover:bg-green-100 transition whitespace-nowrap">
                                  <Download className="w-3.5 h-3.5" /> Descargar
                                </button>
                              </div>
                            );
                          })() : (
                            <span className="text-xs text-gray-300 italic">Sin archivo</span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="px-4 py-3">
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
                              className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition">
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
          </div>

          {/* Paginación moderna */}
          {!loading && filtradas.length > 0 && (
            <div className="mt-3 glass-panel rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Mostrando <span className="font-semibold text-gray-900">{page * rowsPerPage + 1}</span> a{' '}
                  <span className="font-semibold text-gray-900">
                    {Math.min((page + 1) * rowsPerPage, filtradas.length)}
                  </span>{' '}
                  de <span className="font-semibold text-gray-900">{filtradas.length}</span> solicitudes
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <DropdownFiltro
                    className="w-full sm:w-40"
                    value={String(rowsPerPage)}
                    onChange={(val) => setRowsPerPage(parseInt(val))}
                    options={[
                      { value: '10', label: '10 por página' },
                      { value: '15', label: '15 por página' },
                      { value: '30', label: '30 por página' },
                      { value: '50', label: '50 por página' },
                    ]}
                  />

                  <div className="flex items-center gap-1 rounded-2xl bg-gray-50/80 p-1 ring-1 ring-gray-100">
                    <button
                      onClick={() => setPage(0)}
                      disabled={page === 0}
                      title="Primero"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-white hover:text-[#7B1FA2] disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      title="Anterior"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-white hover:text-[#7B1FA2] disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 3) {
                          pageNum = i;
                        } else if (page < 2) {
                          pageNum = i;
                        } else if (page > totalPages - 3) {
                          pageNum = totalPages - 3 + i;
                        } else {
                          pageNum = page - 1 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-xl px-2 text-sm font-bold transition-all ${
                              page === pageNum
                                ? 'bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white shadow-md shadow-purple-500/25'
                                : 'text-gray-600 hover:bg-white hover:text-[#7B1FA2]'
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      title="Siguiente"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-white hover:text-[#7B1FA2] disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPage(totalPages - 1)}
                      disabled={page >= totalPages - 1}
                      title="Último"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-white hover:text-[#7B1FA2] disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}