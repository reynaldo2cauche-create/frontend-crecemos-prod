import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Users, Calendar, CheckCircle, XCircle, Clock, Pencil, UserCheck, Stethoscope,
  Search, X, RefreshCw, Check, ChevronDown, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, AlertCircle, AlertTriangle, ClipboardCheck, Activity, Filter,
  Percent, ShieldCheck, FileText,
} from 'lucide-react';
import api, { obtenerAsistenciasPorPaciente, modificarAsistenciaAdmin } from '../../services/api';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import '../../styles/intranet.css';

// ─── Constantes ───────────────────────────────────────────────────────────────

const ESTADO_ASISTIO = 7;
const ESTADO_SESION_DICTADA = 6;

const OPCIONES_MARCA = [
  { label: 'Asistió',        value: ESTADO_ASISTIO,        color: 'green'  },
  { label: 'Sesión dictada', value: ESTADO_SESION_DICTADA, color: 'orange' },
  { label: 'Desmarcar',      value: '',                    color: 'gray'   },
];

const FILTROS_ESTADO = [
  { value: '',               label: 'Todos los registros' },
  { value: 'completada',     label: 'Completadas (ambos asistió)' },
  { value: 'dictada',        label: 'Con sesión dictada' },
  { value: 'pendiente',      label: 'Pendientes / incompletas' },
  { value: 'inconsistencia', label: 'Con inconsistencia' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toISO = (f) => {
  const y = f.getFullYear();
  const m = String(f.getMonth() + 1).padStart(2, '0');
  const d = String(f.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const rangoSemana = (offsetSemanas = 0) => {
  const hoy = new Date();
  const dia = hoy.getDay();
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - (dia === 0 ? 6 : dia - 1) + offsetSemanas * 7);
  const sabado = new Date(lunes);
  sabado.setDate(lunes.getDate() + 5);
  return [toISO(lunes), toISO(sabado)];
};

const rangoMes = () => {
  const hoy = new Date();
  return [toISO(new Date(hoy.getFullYear(), hoy.getMonth(), 1)), toISO(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0))];
};

const formatearFecha = (fecha) =>
  new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).replace(',', '');

const iniciales = (nombre = '') =>
  nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '?';

const esInconsistencia = (a) =>
  a.recepcion_marco == 1 && a.terapeuta_marco == 1 && a.recepcion_estado_id !== a.terapeuta_estado_id;

// ─── Sparkline decorativo ─────────────────────────────────────────────────────

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

// ─── Dropdown custom ──────────────────────────────────────────────────────────

const DropdownFiltro = ({
  icon: Icon, iconClass = 'text-gray-400', value, onChange,
  options = [], placeholder = 'Seleccionar', className = '',
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

// ─── Badge de marcación ───────────────────────────────────────────────────────

const BadgeMarca = ({ marco, estadoId }) => {
  if (marco != 1) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Pendiente
      </span>
    );
  }
  const asistio = estadoId === ESTADO_ASISTIO;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${
      asistio ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${asistio ? 'bg-green-500' : 'bg-orange-400'}`} />
      {asistio ? 'Asistió' : 'Sesión dictada'}
    </span>
  );
};

// ─── Badge de estado final ────────────────────────────────────────────────────

const BadgeEstadoFinal = ({ a }) => {
  if (a.recepcion_marco == 1 && a.terapeuta_marco == 1) {
    if (a.recepcion_estado_id === a.terapeuta_estado_id) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 whitespace-nowrap">
          <ShieldCheck className="w-3.5 h-3.5" /> Validado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
        <AlertTriangle className="w-3.5 h-3.5" /> Inconsistencia
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
      <Clock className="w-3.5 h-3.5" /> Incompleto
    </span>
  );
};

// ─── Selector de estado (modal) ───────────────────────────────────────────────

const SelectorMarca = ({ label, icon: Icon, value, onChange }) => (
  <div>
    <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
      <Icon className="w-3.5 h-3.5" /> {label}
    </label>
    <div className="flex gap-2">
      {OPCIONES_MARCA.map(({ label: l, value: v, color }) => {
        const activo = value === v;
        const estilos = activo
          ? color === 'green'  ? 'bg-green-50 border-green-500 text-green-800 shadow-sm'
          : color === 'orange' ? 'bg-orange-50 border-orange-500 text-orange-800 shadow-sm'
          : 'bg-gray-100 border-gray-400 text-gray-700 shadow-sm'
          : 'bg-white border-gray-200 text-gray-500 hover:border-[#7B1FA2]/40 hover:text-[#7B1FA2]';
        return (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold border-2 transition-all ${estilos}`}
          >
            {l}
          </button>
        );
      })}
    </div>
  </div>
);

// ─── Modal Editar ─────────────────────────────────────────────────────────────

const ModalEditar = ({ datos, setDatos, onGuardar, onCerrar, guardando }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCerrar]);

  return createPortal(
    <div className="tailwind-scope">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]" onClick={onCerrar} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto ring-1 ring-black/5">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center shadow-sm">
                <Pencil className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 leading-tight">Editar asistencia</h3>
                <p className="text-xs text-gray-400">Cita #{datos.citaId}{datos.terapeuta_nombre ? ` · ${datos.terapeuta_nombre}` : ''}</p>
              </div>
            </div>
            <button onClick={onCerrar} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <SelectorMarca label="Recepción" icon={ClipboardCheck} value={datos.recepcion}
              onChange={(v) => setDatos((p) => ({ ...p, recepcion: v }))} />
            <SelectorMarca label="Terapeuta" icon={Stethoscope} value={datos.terapeuta}
              onChange={(v) => setDatos((p) => ({ ...p, terapeuta: v }))} />

            <div className="flex gap-2 pt-1">
              <button onClick={onCerrar}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-[#7B1FA2] transition-all">
                Cancelar
              </button>
              <button onClick={onGuardar} disabled={guardando}
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

// ─── Página principal ─────────────────────────────────────────────────────────

const AsistenciasPorPaciente = () => {
  const currentUser = useCurrentUser();
  const [pacientes, setPacientes] = useState([]);
  const [pacienteFiltrado, setPacienteFiltrado] = useState([]);
  const [busquedaPaciente, setBusquedaPaciente] = useState('');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [asistencias, setAsistencias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalEditar, setModalEditar] = useState(null);
  const [editando, setEditando] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Filtros locales de la tabla
  const [busquedaTabla, setBusquedaTabla] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Autocompletado
  const [mostrarLista, setMostrarLista] = useState(false);
  const buscadorRef = useRef(null);

  const mostrarFeedback = useCallback((tipo, msg) => {
    setFeedback({ tipo, msg });
    setTimeout(() => setFeedback(null), 3500);
  }, []);

  // ── Inicialización ─────────────────────────────────────────────────────────

  useEffect(() => {
    api.get('/pacientes')
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        setPacientes(data.map((p) => ({
          ...p,
          nombre_completo: `${p.nombres || ''} ${p.apellido_paterno || ''} ${p.apellido_materno || ''}`.trim(),
        })));
      })
      .catch((error) => {
        console.error('Error al cargar pacientes:', error);
        mostrarFeedback('error', 'No se pudo cargar la lista de pacientes.');
      });

    const [ini, fin] = rangoSemana(0);
    setFechaInicio(ini);
    setFechaFin(fin);
  }, [mostrarFeedback]);

  // Cerrar lista al hacer clic fuera
  useEffect(() => {
    const handle = (e) => { if (buscadorRef.current && !buscadorRef.current.contains(e.target)) setMostrarLista(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // ── Búsqueda inteligente de paciente ───────────────────────────────────────

  useEffect(() => {
    if (busquedaPaciente.trim() === '') {
      setPacienteFiltrado([]);
    } else if (pacienteSeleccionado && busquedaPaciente === pacienteSeleccionado.nombre_completo) {
      setPacienteFiltrado([]);
    } else {
      const busquedaLower = busquedaPaciente.toLowerCase().trim();
      const terminos = busquedaLower.split(/\s+/).filter((t) => t.length > 0);

      const filtrados = pacientes.filter((p) => {
        const documento = String(p.numero_documento || p.documento || '');
        if (documento.includes(busquedaPaciente.trim())) return true;

        const nombres = (p.nombres || '').toLowerCase();
        const apPat = (p.apellido_paterno || '').toLowerCase();
        const apMat = (p.apellido_materno || '').toLowerCase();

        // Cada término debe estar en algún campo del nombre
        return terminos.every((t) => nombres.includes(t) || apPat.includes(t) || apMat.includes(t));
      });

      setPacienteFiltrado(filtrados.slice(0, 50));
    }
  }, [busquedaPaciente, pacientes, pacienteSeleccionado]);

  // ── Estadísticas derivadas ─────────────────────────────────────────────────

  const estadisticas = useMemo(() => {
    const total = asistencias.length;
    const completadas = asistencias.filter((a) => a.terapeuta_estado_id === ESTADO_ASISTIO && a.recepcion_estado_id === ESTADO_ASISTIO).length;
    const sesionDictada = asistencias.filter((a) => a.recepcion_estado_id === ESTADO_SESION_DICTADA || a.terapeuta_estado_id === ESTADO_SESION_DICTADA).length;
    // Pendiente = al menos uno de los dos no marcó
    const pendientes = asistencias.filter((a) => !a.recepcion_marco || !a.terapeuta_marco).length;
    const inconsistencias = asistencias.filter(esInconsistencia).length;
    const tasa = total ? Math.round((completadas / total) * 100) : 0;
    return { total, completadas, sesionDictada, pendientes, inconsistencias, tasa };
  }, [asistencias]);

  // ── Filtrado local ─────────────────────────────────────────────────────────

  const filtradas = useMemo(() => {
    const q = busquedaTabla.trim().toLowerCase();
    return asistencias.filter((a) => {
      if (q) {
        const ter = (a.terapeuta_nombre || '').toLowerCase();
        if (!ter.includes(q) && !String(a.cita_id).includes(q)) return false;
      }
      switch (filtroEstado) {
        case 'completada':     return a.terapeuta_estado_id === ESTADO_ASISTIO && a.recepcion_estado_id === ESTADO_ASISTIO;
        case 'dictada':        return a.recepcion_estado_id === ESTADO_SESION_DICTADA || a.terapeuta_estado_id === ESTADO_SESION_DICTADA;
        case 'pendiente':      return !a.recepcion_marco || !a.terapeuta_marco;
        case 'inconsistencia': return esInconsistencia(a);
        default:               return true;
      }
    });
  }, [asistencias, busquedaTabla, filtroEstado]);

  const totalPages = Math.ceil(filtradas.length / rowsPerPage);
  const paginadas = filtradas.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  useEffect(() => { setPage(0); }, [busquedaTabla, filtroEstado, rowsPerPage]);

  // ── Carga de datos ─────────────────────────────────────────────────────────

  const cargarAsistencias = async (pacienteId, resetPage = true, rango = null) => {
    const ini = rango?.[0] ?? fechaInicio;
    const fin = rango?.[1] ?? fechaFin;

    if (!ini || !fin) {
      mostrarFeedback('error', 'Seleccione un rango de fechas.');
      return;
    }
    if (ini > fin) {
      mostrarFeedback('error', 'La fecha de inicio no puede ser mayor a la fecha fin.');
      return;
    }

    setCargando(true);
    try {
      const data = await obtenerAsistenciasPorPaciente(pacienteId, ini, fin);
      // Solo citas donde al menos uno marcó
      const conRegistro = (data.asistencias || []).filter(
        (a) => a.recepcion_marco == 1 || a.terapeuta_marco == 1
      );
      setAsistencias(conRegistro);
      if (resetPage) setPage(0);
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
      mostrarFeedback('error', 'Error al cargar asistencias.');
    } finally {
      setCargando(false);
    }
  };

  const seleccionarPaciente = (paciente) => {
    setPacienteSeleccionado(paciente);
    setBusquedaPaciente(paciente.nombre_completo);
    setPacienteFiltrado([]);
    setMostrarLista(false);
    setBusquedaTabla('');
    setFiltroEstado('');
    cargarAsistencias(paciente.id);
  };

  const limpiarPaciente = () => {
    setPacienteSeleccionado(null);
    setBusquedaPaciente('');
    setPacienteFiltrado([]);
    setAsistencias([]);
    setBusquedaTabla('');
    setFiltroEstado('');
  };

  const aplicarRango = ([ini, fin]) => {
    setFechaInicio(ini);
    setFechaFin(fin);
    if (pacienteSeleccionado) cargarAsistencias(pacienteSeleccionado.id, true, [ini, fin]);
  };

  // ── Edición ────────────────────────────────────────────────────────────────

  const abrirEditar = (a) => {
    setModalEditar({
      citaId: a.cita_id,
      terapeuta_nombre: a.terapeuta_nombre,
      recepcion: a.recepcion_marco == 1 ? (a.recepcion_estado_id ?? '') : '',
      terapeuta: a.terapeuta_marco == 1 ? (a.terapeuta_estado_id ?? '') : '',
    });
  };

  const guardarEdicion = async () => {
    if (!modalEditar) return;
    setEditando(true);
    try {
      await modificarAsistenciaAdmin(
        modalEditar.citaId,
        modalEditar.recepcion === '' ? null : Number(modalEditar.recepcion),
        modalEditar.terapeuta === '' ? null : Number(modalEditar.terapeuta),
        currentUser?.id
      );
      setModalEditar(null);
      await cargarAsistencias(pacienteSeleccionado.id, false);
      mostrarFeedback('exito', 'Asistencia actualizada correctamente.');
    } catch (err) {
      mostrarFeedback('error', 'Error al guardar los cambios.');
    } finally {
      setEditando(false);
    }
  };

  const limpiarFiltrosTabla = () => { setBusquedaTabla(''); setFiltroEstado(''); };
  const hayFiltrosTabla = busquedaTabla || filtroEstado;

  // ── Cards ──────────────────────────────────────────────────────────────────

  const cards = [
    { label: 'Total citas',    value: estadisticas.total,         hex: '#2563eb', bg: 'bg-blue-50',   iconColor: 'text-blue-600',   Icon: Calendar,    filtro: '' },
    { label: 'Completadas',    value: estadisticas.completadas,   hex: '#16a34a', bg: 'bg-green-50',  iconColor: 'text-green-600',  Icon: CheckCircle, filtro: 'completada' },
    { label: 'Sesión dictada', value: estadisticas.sesionDictada, hex: '#f97316', bg: 'bg-orange-50', iconColor: 'text-orange-500', Icon: XCircle,     filtro: 'dictada' },
    { label: 'Pendientes',     value: estadisticas.pendientes,    hex: '#f59e0b', bg: 'bg-amber-50',  iconColor: 'text-amber-500',  Icon: Clock,       filtro: 'pendiente' },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="tailwind-scope">
      <div className="cx-admin-bg min-h-screen" style={{ padding: '1rem 1.25rem' }}>
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center shadow-sm flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-gray-900 leading-tight">Asistencias por Paciente</h1>
              <p className="text-[13px] text-gray-400 -mt-0.5">Consulta y corrige el historial de asistencias de cada paciente</p>
            </div>
            {pacienteSeleccionado && (
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => cargarAsistencias(pacienteSeleccionado.id, false)}
                  disabled={cargando}
                  className="cx-glow flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl text-sm font-semibold disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>
            )}
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

          {/* Filtros principales */}
          <div className="mb-3">
            <div className="glass-panel rounded-2xl p-4 relative z-30">
              <div className="flex flex-wrap items-center gap-2.5">

                {/* Buscador de paciente con autocompletado */}
                <div ref={buscadorRef} className="relative flex-1 min-w-[260px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B1FA2] pointer-events-none" />
                  <input
                    type="text"
                    value={busquedaPaciente}
                    onChange={(e) => { setBusquedaPaciente(e.target.value); setMostrarLista(true); }}
                    onFocus={() => setMostrarLista(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setMostrarLista(false);
                      if (e.key === 'Enter' && pacienteFiltrado.length === 1) {
                        e.preventDefault();
                        seleccionarPaciente(pacienteFiltrado[0]);
                      }
                    }}
                    placeholder="Buscar paciente por nombre o DNI…"
                    className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all"
                  />
                  {busquedaPaciente && (
                    <button onClick={limpiarPaciente} title="Limpiar paciente"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {mostrarLista && busquedaPaciente.trim() !== '' && !pacienteSeleccionado?.nombre_completo?.includes(busquedaPaciente) && (
                    <div className="absolute z-50 mt-2 w-full max-h-72 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5">
                      {pacienteFiltrado.length === 0 ? (
                        <p className="px-3 py-3 text-sm text-gray-400 text-center">No se encontraron pacientes</p>
                      ) : (
                        pacienteFiltrado.map((p) => {
                          const doc = p.numero_documento || p.documento;
                          return (
                            <button
                              key={p.id}
                              onMouseDown={(e) => { e.preventDefault(); seleccionarPaciente(p); }}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-purple-50"
                            >
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                                {iniciales(p.nombre_completo)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{p.nombre_completo}</p>
                                {doc && <p className="text-xs text-gray-400">DNI: {doc}</p>}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                <div className="relative min-w-[160px]">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    title="Fecha inicio"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all"
                  />
                </div>
                <div className="relative min-w-[160px]">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500 pointer-events-none" />
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    title="Fecha fin"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all"
                  />
                </div>

                <button
                  onClick={() => pacienteSeleccionado && cargarAsistencias(pacienteSeleccionado.id)}
                  disabled={cargando || !pacienteSeleccionado}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-semibold text-sm shadow-md shadow-purple-500/25 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cargando ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Buscar
                </button>
              </div>

              {/* Rangos rápidos */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Rango rápido</span>
                {[
                  { label: 'Esta semana',   fn: () => rangoSemana(0) },
                  { label: 'Semana pasada', fn: () => rangoSemana(-1) },
                  { label: 'Este mes',      fn: rangoMes },
                ].map((r) => (
                  <button
                    key={r.label}
                    onClick={() => aplicarRango(r.fn())}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-[#7B1FA2] hover:border-[#7B1FA2]/30 transition-all"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Métricas */}
          {pacienteSeleccionado && asistencias.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
              {cards.map((c) => {
                const CardIcon = c.Icon;
                const activa = filtroEstado === c.filtro && c.filtro !== '';
                return (
                  <button
                    key={c.label}
                    onClick={() => setFiltroEstado(activa ? '' : c.filtro)}
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

              {/* Tasa de asistencia */}
              <div className="glass-card rounded-2xl p-4 flex items-center gap-3.5 relative overflow-hidden">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10">
                  <Percent className="w-6 h-6 text-[#7B1FA2]" />
                </div>
                <div className="min-w-0 flex-1 relative z-10">
                  <p className="text-xs font-medium text-gray-400 truncate">Tasa de asistencia</p>
                  <p className="text-[26px] font-extrabold text-gray-900 leading-tight">{estadisticas.tasa}%</p>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-1">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#7B1FA2] to-[#A3C644] transition-all" style={{ width: `${estadisticas.tasa}%` }} />
                  </div>
                </div>
                <Sparkline color="#7B1FA2" />
              </div>
            </div>
          )}

          {/* Alerta de inconsistencias */}
          {pacienteSeleccionado && estadisticas.inconsistencias > 0 && (
            <button
              onClick={() => setFiltroEstado(filtroEstado === 'inconsistencia' ? '' : 'inconsistencia')}
              className="w-full mb-3 px-4 py-2.5 rounded-xl text-sm font-medium border bg-amber-50 border-amber-200 text-amber-800 flex items-center gap-2 text-left hover:bg-amber-100/70 transition"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                <b>{estadisticas.inconsistencias}</b> {estadisticas.inconsistencias === 1 ? 'cita tiene' : 'citas tienen'} marcaciones distintas entre recepción y terapeuta.
                <span className="underline ml-1">{filtroEstado === 'inconsistencia' ? 'Quitar filtro' : 'Ver solo esas'}</span>
              </span>
            </button>
          )}

          {/* Filtros de tabla + contador */}
          {pacienteSeleccionado && asistencias.length > 0 && (
            <>
              <div className="glass-panel rounded-2xl p-4 mb-3 relative z-20">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative flex-1 min-w-[220px]">
                    <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500 pointer-events-none" />
                    <input
                      type="text"
                      value={busquedaTabla}
                      onChange={(e) => setBusquedaTabla(e.target.value)}
                      placeholder="Buscar por terapeuta o N° de cita…"
                      className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all"
                    />
                    {busquedaTabla && (
                      <button onClick={() => setBusquedaTabla('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <DropdownFiltro
                    className="min-w-[240px]"
                    icon={Activity}
                    iconClass="text-emerald-500"
                    placeholder="Estado"
                    value={filtroEstado}
                    onChange={setFiltroEstado}
                    options={FILTROS_ESTADO}
                  />
                  <button
                    onClick={limpiarFiltrosTabla}
                    disabled={!hayFiltrosTabla}
                    title="Limpiar filtros"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 hover:text-[#7B1FA2] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap mb-3">
                <h2 className="text-base font-extrabold text-gray-900">Registros</h2>
                <div className="px-2.5 py-0.5 bg-purple-50 text-[#7B1FA2] rounded-full text-sm font-bold">
                  {filtradas.length} {filtradas.length === 1 ? 'asistencia' : 'asistencias'}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 border border-purple-200 text-purple-800 rounded-full text-xs font-semibold">
                  <Users className="w-3 h-3" />
                  {pacienteSeleccionado.nombre_completo}
                </div>
                {hayFiltrosTabla && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-semibold">
                    <Filter className="w-3 h-3" /> Filtros activos
                  </div>
                )}
              </div>
            </>
          )}

          {/* Tabla */}
          {pacienteSeleccionado && (
            <div className="glass-panel rounded-2xl overflow-hidden">
              {cargando ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin" />
                </div>
              ) : filtradas.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-purple-50 flex items-center justify-center">
                    <FileText className="w-7 h-7 text-[#7B1FA2] opacity-60" />
                  </div>
                  <p className="font-medium">
                    {asistencias.length === 0
                      ? 'No hay registros en el rango seleccionado'
                      : 'No hay registros con los filtros aplicados'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/70">
                        {['Cita', 'Terapeuta', 'Fecha cita', 'Recepción', 'Terapeuta marcó', 'Estado final'].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                        <th className="text-center px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Editar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paginadas.map((a) => {
                        const inc = esInconsistencia(a);
                        return (
                          <tr key={a.id} className={`transition-colors ${inc ? 'bg-red-50/30 hover:bg-red-50/60' : 'hover:bg-[#7B1FA2]/[0.03]'}`}>
                            <td className="px-4 py-3 font-semibold text-gray-500 whitespace-nowrap">#{a.cita_id}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                                  <Stethoscope className="w-4 h-4" />
                                </div>
                                <span className="font-semibold text-gray-900 whitespace-nowrap">{a.terapeuta_nombre || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                              {a.fecha_cita ? formatearFecha(a.fecha_cita) : 'N/A'}
                            </td>
                            <td className="px-4 py-3">
                              <BadgeMarca marco={a.recepcion_marco} estadoId={a.recepcion_estado_id} />
                            </td>
                            <td className="px-4 py-3">
                              <BadgeMarca marco={a.terapeuta_marco} estadoId={a.terapeuta_estado_id} />
                            </td>
                            <td className="px-4 py-3">
                              <BadgeEstadoFinal a={a} />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => abrirEditar(a)}
                                title="Editar asistencia"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-[#7B1FA2] hover:bg-purple-50 transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Paginación */}
          {pacienteSeleccionado && !cargando && filtradas.length > 0 && (
            <div className="mt-3 glass-panel rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Mostrando <span className="font-semibold text-gray-900">{page * rowsPerPage + 1}</span> a{' '}
                  <span className="font-semibold text-gray-900">{Math.min((page + 1) * rowsPerPage, filtradas.length)}</span>{' '}
                  de <span className="font-semibold text-gray-900">{filtradas.length}</span> asistencias
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <DropdownFiltro
                    className="w-full sm:w-40"
                    value={String(rowsPerPage)}
                    onChange={(val) => setRowsPerPage(parseInt(val))}
                    options={[
                      { value: '10', label: '10 por página' },
                      { value: '20', label: '20 por página' },
                      { value: '50', label: '50 por página' },
                      { value: '100', label: '100 por página' },
                    ]}
                  />

                  <div className="flex items-center gap-1 rounded-2xl bg-gray-50/80 p-1 ring-1 ring-gray-100">
                    <button onClick={() => setPage(0)} disabled={page === 0} title="Primero"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-white hover:text-[#7B1FA2] disabled:opacity-40 disabled:hover:bg-transparent">
                      <ChevronsLeft className="h-4 w-4" />
                    </button>
                    <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} title="Anterior"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-white hover:text-[#7B1FA2] disabled:opacity-40 disabled:hover:bg-transparent">
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 3) pageNum = i;
                        else if (page < 2) pageNum = i;
                        else if (page > totalPages - 3) pageNum = totalPages - 3 + i;
                        else pageNum = page - 1 + i;

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

                    <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} title="Siguiente"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-white hover:text-[#7B1FA2] disabled:opacity-40 disabled:hover:bg-transparent">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} title="Último"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-white hover:text-[#7B1FA2] disabled:opacity-40 disabled:hover:bg-transparent">
                      <ChevronsRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Estado vacío: sin paciente */}
          {!pacienteSeleccionado && (
            <div className="glass-panel rounded-2xl p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-50 flex items-center justify-center">
                <UserCheck className="w-8 h-8 text-[#7B1FA2]" />
              </div>
              <p className="text-gray-700 text-base font-bold">Busque y seleccione un paciente</p>
              <p className="text-gray-400 text-sm mt-1">Escriba su nombre o DNI y elija un rango de fechas para ver sus asistencias.</p>
            </div>
          )}

          {/* Modal editar */}
          {modalEditar && (
            <ModalEditar
              datos={modalEditar}
              setDatos={setModalEditar}
              onGuardar={guardarEdicion}
              onCerrar={() => setModalEditar(null)}
              guardando={editando}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AsistenciasPorPaciente;