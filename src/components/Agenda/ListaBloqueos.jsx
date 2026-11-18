import React, { useState, useEffect, useRef } from 'react';
import {
  Ban, Trash2, Calendar, Clock, User, Users, AlertCircle, Plus, Filter, Search, X, RefreshCw,
  ChevronDown, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Repeat, CalendarDays,
  XCircle
} from 'lucide-react';
import { obtenerBloqueos, eliminarBloqueo } from '../../services/bloqueoService';
import { getTipoBloqueo } from '../../services/catalogoService';
import ModalBloquearHorario from './ModalBloquearHorario';
import DialogMotivo from '../DialogMotivo/DialogMotivo';

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Dropdown custom con opciones estilizadas (los <option> nativos no se pueden diseñar)
const DropdownBloqueo = ({ icon: Icon, iconClass = 'text-gray-400', value, onChange, options = [], placeholder = 'Seleccionar', className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const selected = options.find((o) => String(o.value) === String(value));
  const activo = value !== '' && value !== null && value !== undefined;
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center ${Icon ? 'pl-10' : 'pl-4'} rounded-xl border bg-white py-2.5 pr-9 text-left text-sm transition-all focus:outline-none ${open ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'}`}
      >
        {Icon && <Icon className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${iconClass}`} />}
        <span className={`truncate ${activo ? 'font-medium text-gray-800' : 'text-gray-500'}`}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5">
          {options.map((o) => {
            const isSel = String(o.value) === String(value);
            return (
              <button
                key={o.value ?? '__all'}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${isSel ? 'bg-red-50 font-semibold text-red-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span className="truncate">{o.label}</span>
                {isSel && <Check className="h-4 w-4 flex-shrink-0 text-red-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Campo en forma de tarjeta: etiqueta arriba, valor debajo (igual que en Filiación)
const InfoField = ({ icon: Icon, iconClass = 'text-red-600', label, children }) => (
  <div className="py-1">
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
    <p className="text-sm font-semibold text-gray-800 break-words min-h-[1.25rem] flex items-center gap-2">
      {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${iconClass}`} />}
      <span className="min-w-0">{children}</span>
    </p>
  </div>
);

const ListaBloqueos = ({ terapeutas, userId, onBloqueoChange }) => {
  const [bloqueos, setBloqueos] = useState([]);
  const [filteredBloqueos, setFilteredBloqueos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [dialogMotivo, setDialogMotivo] = useState({ open: false, bloqueoId: null });

  // Modal de error (reemplaza al alert del navegador)
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Estados para filtros
  const [filtroTerapeuta, setFiltroTerapeuta] = useState('');
  const [filtroTipoBloqueo, setFiltroTipoBloqueo] = useState('');
  const [busquedaMotivo, setBusquedaMotivo] = useState('');
  const [tiposBloqueo, setTiposBloqueo] = useState([]);

  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  useEffect(() => {
    cargarBloqueos();
    cargarTiposBloqueo();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [bloqueos, filtroTerapeuta, filtroTipoBloqueo, busquedaMotivo]);

  const cargarBloqueos = async () => {
    try {
      setLoading(true);
      const data = await obtenerBloqueos();
      setBloqueos(data);

      // Notificar al componente padre que hubo cambios
      if (onBloqueoChange) {
        onBloqueoChange();
      }
    } catch (error) {
      console.error('Error al cargar bloqueos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarTiposBloqueo = async () => {
    try {
      const data = await getTipoBloqueo();
      setTiposBloqueo(data);
    } catch (error) {
      console.error('Error al cargar tipos de bloqueo:', error);
    }
  };

  const aplicarFiltros = () => {
    let filtered = [...bloqueos];

    // Filtrar por terapeuta
    if (filtroTerapeuta) {
      filtered = filtered.filter(b => b.trabajadorId === parseInt(filtroTerapeuta));
    }

    // Filtrar por tipo de bloqueo
    if (filtroTipoBloqueo) {
      filtered = filtered.filter(b => b.tipoBloqueoId === parseInt(filtroTipoBloqueo));
    }

    // Filtrar por motivo
    if (busquedaMotivo.trim()) {
      const searchLower = busquedaMotivo.toLowerCase();
      filtered = filtered.filter(b =>
        b.motivo?.toLowerCase().includes(searchLower)
      );
    }

    // Ordenar del más reciente primero (por fecha de creación; desempate por id).
    filtered.sort((a, b) => {
      const fa = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const fb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return fb - fa || (b.id - a.id);
    });

    setFilteredBloqueos(filtered);
    setPage(0); // Reset página cuando cambian los filtros
  };

  const limpiarFiltros = () => {
    setFiltroTerapeuta('');
    setFiltroTipoBloqueo('');
    setBusquedaMotivo('');
    setPage(0);
  };

  const handleEliminarClick = (bloqueoId) => {
    setDialogMotivo({ open: true, bloqueoId });
  };

  const handleConfirmarEliminar = async (motivo) => {
    try {
      await eliminarBloqueo(dialogMotivo.bloqueoId, userId, motivo);
      setDialogMotivo({ open: false, bloqueoId: null });
      cargarBloqueos();
    } catch (error) {
      console.error('Error al eliminar bloqueo:', error);
      setDialogMotivo({ open: false, bloqueoId: null });
      setErrorMessage('No se pudo eliminar el bloqueo. Por favor intente nuevamente.');
      setShowErrorModal(true);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearHora = (hora) => {
    if (!hora) return null;
    return hora.substring(0, 5);
  };

  const obtenerDescripcionBloqueo = (bloqueo) => {
    if (bloqueo.tipoBloqueo?.codigo === 'PUNTUAL') {
      return formatearFecha(bloqueo.fechaInicio);
    } else if (bloqueo.tipoBloqueo?.codigo === 'RECURRENTE') {
      const dia = DIAS_SEMANA[bloqueo.diaSemana];
      return `${dia}s (${formatearFecha(bloqueo.fechaInicio)} - ${formatearFecha(bloqueo.fechaFin)})`;
    }
    return '';
  };

  // Paginación
  const paginatedBloqueos = filteredBloqueos.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(filteredBloqueos.length / rowsPerPage);

  const filtrosActivos = filtroTerapeuta || filtroTipoBloqueo || busquedaMotivo.trim();

  // Resumen rápido (chips) calculado sobre todos los bloqueos
  const totalRecurrentes = bloqueos.filter(b => b.tipoBloqueo?.codigo === 'RECURRENTE').length;
  const totalPuntuales = bloqueos.filter(b => b.tipoBloqueo?.codigo === 'PUNTUAL').length;
  const terapeutasAfectados = new Set(bloqueos.map(b => b.trabajadorId).filter(Boolean)).size;

  const resumen = [
    { Icon: Ban, label: 'Total de bloqueos', value: bloqueos.length },
    { Icon: Repeat, label: 'Recurrentes', value: totalRecurrentes },
    { Icon: CalendarDays, label: 'Puntuales', value: totalPuntuales },
    { Icon: Users, label: 'Terapeutas con bloqueos', value: terapeutasAfectados },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass-panel relative overflow-hidden rounded-3xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 flex-shrink-0 animate-pulse rounded-xl bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-40 animate-pulse rounded-full bg-gray-200" />
                <div className="h-2.5 w-24 animate-pulse rounded-full bg-gray-100" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
              <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
              <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
            </div>
            <div className="mt-3 h-14 animate-pulse rounded-xl bg-gray-50" />
            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent cx-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header + resumen + filtros */}
        <div className="glass-panel rounded-3xl relative z-30">
          {/* Header */}
          <div className="p-5 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-red-500/20">
                  <Ban className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-extrabold text-gray-900 leading-tight">
                  Horarios Bloqueados
                </h2>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={cargarBloqueos}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all flex-shrink-0"
                  title="Recargar bloqueos"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 cx-glow bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg shadow-red-500/30 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 flex-shrink-0" />
                  Nuevo Bloqueo
                </button>
              </div>
            </div>

            <p className="text-[13px] text-gray-400 mt-2">Gestión de bloqueos de horarios</p>
          </div>

          <div className="px-6 pb-6 space-y-5">
            {/* Resumen rápido en chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {resumen.map((c, i) => (
                <div key={i} className="rounded-xl bg-[#FDF2F2] p-3 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-red-100/70 flex items-center justify-center flex-shrink-0">
                    <c.Icon className="w-[18px] h-[18px] text-red-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{c.label}</p>
                    <p className="text-[13px] font-semibold text-gray-700 break-words leading-snug">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filtros activos */}
            {filtrosActivos && (
              <div className="p-4 bg-red-50/60 rounded-xl border border-red-100">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-semibold text-gray-700">Filtros activos:</span>
                  </div>

                  {filtroTerapeuta && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-red-200 text-xs">
                      <span className="font-medium text-red-600">Terapeuta:</span>
                      <span className="text-gray-700">
                        {terapeutas?.find(t => t.id === parseInt(filtroTerapeuta))?.nombres} {terapeutas?.find(t => t.id === parseInt(filtroTerapeuta))?.apellidos}
                      </span>
                    </div>
                  )}

                  {filtroTipoBloqueo && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-red-200 text-xs">
                      <span className="font-medium text-red-600">Tipo:</span>
                      <span className="text-gray-700">
                        {tiposBloqueo?.find(t => t.id === parseInt(filtroTipoBloqueo))?.nombre}
                      </span>
                    </div>
                  )}

                  {busquedaMotivo.trim() && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-red-200 text-xs">
                      <span className="font-medium text-red-600">Motivo:</span>
                      <span className="text-gray-700">{busquedaMotivo}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={limpiarFiltros}
                    className="ml-auto flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100/70 rounded-full transition-all"
                  >
                    <X className="w-4 h-4" />
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}

            {/* Buscador y filtros */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Buscador por motivo */}
                <div className="relative lg:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por motivo..."
                    value={busquedaMotivo}
                    onChange={(e) => setBusquedaMotivo(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-red-600 transition-all"
                  />
                </div>

                {/* Filtro Terapeuta */}
                <DropdownBloqueo
                  icon={User}
                  iconClass="text-teal-500"
                  placeholder="Todos los terapeutas"
                  value={filtroTerapeuta}
                  onChange={setFiltroTerapeuta}
                  options={[
                    { value: '', label: 'Todos los terapeutas' },
                    ...(terapeutas || []).filter((t) => t.estado).map((t) => ({ value: String(t.id), label: `${t.nombres} ${t.apellidos}` })),
                  ]}
                />

                {/* Filtro Tipo de Bloqueo */}
                <DropdownBloqueo
                  icon={Ban}
                  iconClass="text-red-500"
                  placeholder="Todos los tipos"
                  value={filtroTipoBloqueo}
                  onChange={setFiltroTipoBloqueo}
                  options={[
                    { value: '', label: 'Todos los tipos' },
                    ...tiposBloqueo.map((tipo) => ({ value: String(tipo.id), label: tipo.nombre })),
                  ]}
                />
              </div>

              <p className="text-[13px] text-gray-400 mt-3">
                <span className="font-semibold text-gray-700">{filteredBloqueos.length}</span> bloqueo{filteredBloqueos.length !== 1 ? 's' : ''} encontrado{filteredBloqueos.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de bloqueos: cada uno en su propia tarjeta */}
        {filteredBloqueos.length === 0 ? (
          <div className="glass-panel rounded-3xl p-5">
            <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <Ban className="w-10 h-10 text-gray-300 mx-auto mb-2.5" />
              <p className="text-sm font-semibold text-gray-500">
                {filtrosActivos ? 'No se encontraron bloqueos' : 'No hay bloqueos activos'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {filtrosActivos ? 'Intenta ajustar los filtros de búsqueda' : 'Los bloqueos de horarios aparecerán aquí'}
              </p>
            </div>
          </div>
        ) : (
          paginatedBloqueos.map(bloqueo => {
            const esRecurrente = bloqueo.tipoBloqueo?.codigo === 'RECURRENTE';
            return (
              <section
                key={bloqueo.id}
                className="glass-panel rounded-3xl p-5 transition-all hover:shadow-md"
              >
                {/* Cabecera: terapeuta + tipo + eliminar */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-red-500/20 text-sm font-bold text-white">
                    {bloqueo.trabajador?.nombres?.[0]}{bloqueo.trabajador?.apellidos?.[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-gray-800">
                      {bloqueo.trabajador?.nombres} {bloqueo.trabajador?.apellidos}
                    </h3>
                    <p className="truncate text-[13px] text-gray-400">
                      {bloqueo.trabajador?.especialidad?.nombre || 'Sin especialidad'}
                    </p>
                  </div>

                  <span className={`hidden sm:inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                    esRecurrente ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-blue-200 bg-blue-50 text-blue-700'
                  }`}>
                    {esRecurrente ? <Repeat className="h-3 w-3" /> : <CalendarDays className="h-3 w-3" />}
                    {bloqueo.tipoBloqueo?.nombre || (esRecurrente ? 'Recurrente' : 'Puntual')}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleEliminarClick(bloqueo.id)}
                    className="p-2 flex-shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar bloqueo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Tipo en móvil */}
                <span className={`sm:hidden mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  esRecurrente ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-blue-200 bg-blue-50 text-blue-700'
                }`}>
                  {esRecurrente ? <Repeat className="h-3 w-3" /> : <CalendarDays className="h-3 w-3" />}
                  {bloqueo.tipoBloqueo?.nombre || (esRecurrente ? 'Recurrente' : 'Puntual')}
                </span>

                {/* Línea divisoria degradada */}
                <div className="h-px bg-gradient-to-r from-gray-200 to-transparent my-4" />

                {/* Datos en campos tipo etiqueta/valor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoField icon={Calendar} iconClass="text-red-600" label={esRecurrente ? 'Recurrencia' : 'Fecha'}>
                    {obtenerDescripcionBloqueo(bloqueo) || '-'}
                  </InfoField>
                  <InfoField icon={Clock} iconClass="text-orange-500" label="Horario">
                    {bloqueo.todoElDia ? 'Todo el día' : `${formatearHora(bloqueo.horaInicio)} - ${formatearHora(bloqueo.horaFin)}`}
                  </InfoField>
                </div>

                {/* Motivo */}
                <div className="mt-3 rounded-xl border border-red-100 bg-red-50/50 p-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Motivo</p>
                      <p className="text-sm font-semibold text-gray-800 break-words">{bloqueo.motivo}</p>
                    </div>
                  </div>
                </div>

                {/* Info de creación */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-3">
                  <User className="w-3.5 h-3.5" />
                  <span>
                    Bloqueado por {bloqueo.userCrea?.nombres} {bloqueo.userCrea?.apellidos} ·{' '}
                    {bloqueo.createdAt && new Date(bloqueo.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </section>
            );
          })
        )}

        {/* Paginación */}
        {filteredBloqueos.length > 0 && (
          <div className="glass-panel rounded-3xl p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                Mostrando <span className="font-semibold text-gray-700">{page * rowsPerPage + 1}</span> a{' '}
                <span className="font-semibold text-gray-700">
                  {Math.min((page + 1) * rowsPerPage, filteredBloqueos.length)}
                </span>{' '}
                de <span className="font-semibold text-gray-700">{filteredBloqueos.length}</span> bloqueos
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                {/* Selector de filas por página */}
                <DropdownBloqueo
                  className="w-full sm:w-40"
                  value={String(rowsPerPage)}
                  onChange={(val) => { setRowsPerPage(parseInt(val)); setPage(0); }}
                  options={[
                    { value: '12', label: '12 por página' },
                    { value: '24', label: '24 por página' },
                    { value: '48', label: '48 por página' },
                  ]}
                />

                {/* Controles de paginación */}
                <div className="flex items-center gap-1 rounded-full bg-[#FDF2F2] p-1">
                  <button type="button" onClick={() => setPage(0)} disabled={page === 0} title="Primero"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white hover:text-red-600 disabled:opacity-40 disabled:hover:bg-transparent">
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setPage(page - 1)} disabled={page === 0} title="Anterior"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white hover:text-red-600 disabled:opacity-40 disabled:hover:bg-transparent">
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(3)].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 3) pageNum = i;
                      else if (page < 2) pageNum = i;
                      else if (page > totalPages - 3) pageNum = totalPages - 3 + i;
                      else pageNum = page - 1 + i;

                      return (
                        pageNum < totalPages && (
                          <button
                            type="button"
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-full px-2 text-sm font-bold transition-all ${
                              page === pageNum
                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-500/25'
                                : 'text-gray-600 hover:bg-white hover:text-red-600'
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        )
                      );
                    })}
                  </div>

                  <button type="button" onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1} title="Siguiente"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white hover:text-red-600 disabled:opacity-40 disabled:hover:bg-transparent">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} title="Último"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white hover:text-red-600 disabled:opacity-40 disabled:hover:bg-transparent">
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Bloqueo */}
        <ModalBloquearHorario
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          terapeutas={terapeutas}
          onBloqueoCreado={cargarBloqueos}
          userId={userId}
        />

        {/* Dialog de Motivo para Eliminar */}
        <DialogMotivo
          open={dialogMotivo.open}
          onClose={() => setDialogMotivo({ open: false, bloqueoId: null })}
          onConfirm={handleConfirmarEliminar}
          title="Eliminar Bloqueo"
          message="¿Está seguro que desea eliminar este bloqueo de horario? Ingrese el motivo de la eliminación:"
          confirmText="Eliminar"
          cancelText="Cancelar"
        />
      </div>

      {/* Modal de error */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <button
                type="button"
                onClick={() => setShowErrorModal(false)}
                className="w-full bg-gray-200 text-gray-800 py-2.5 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ListaBloqueos;