import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip
} from '@mui/material';
import { Search, X, Filter, RefreshCw, Users, UserX, UserCheck, UserCog, Stethoscope, MessageSquare, User, UserPlus, MapPin, Layers, Activity, FileText, ChevronDown, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { getPacientes, getEstadosPaciente, getEstadisticasPacientes } from '../services/pacienteService';
import { getDistritos, getServicios } from '../services/catalogoService';
import TarjetasPacientes from '../components/Pacientes/TablaPacientes';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { ROLES, isTerapeuta, canViewServiceInfo } from '../constants/roles';
import { useNavigate } from 'react-router-dom';
import { useTerapeutas } from '../hooks/useTerapeutas';
import { getSubordinados } from '../services/trabajadorService';
import '../styles/intranet.css';

// Sparkline decorativo (sutil) para las stat cards
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

// Dropdown custom con opciones estilizadas (soporta planos y agrupados). Los <option> nativos no se pueden diseñar.
const DropdownFiltro = ({
  icon: Icon,
  iconClass = 'text-gray-400',
  value,
  onChange,
  options = null,
  groups = null,
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

  const flat = groups ? groups.flatMap((g) => g.items) : (options || []);
  const selected = flat.find((o) => String(o.value) === String(value));
  const activo = value !== '' && value !== null && value !== undefined;

  const Item = ({ o }) => {
    const isSel = String(o.value) === String(value);
    return (
      <button
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
  };

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
          {groups ? (
            <>
              <Item o={{ value: '', label: placeholder }} />
              {groups.map((g) => (
                <div key={g.label} className="pt-1">
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">{g.label}</p>
                  {g.items.map((o) => <Item key={o.value} o={o} />)}
                </div>
              ))}
            </>
          ) : (
            (options || []).map((o) => <Item key={o.value} o={o} />)
          )}
        </div>
      )}
    </div>
  );
};

// Colores por estado (donut + leyenda)
const ESTADO_COLORS = {
  'Nuevo': '#16a34a', 'Entrevista': '#2563eb', 'Evaluacion': '#f59e0b',
  'Terapia': '#7B1FA2', 'Inactivo': '#9ca3af', 'Espera': '#9ca3af',
};

// Donut chart a partir de datos reales
const Donut = ({ data }) => {
  const total = data.reduce((s, d) => s + (d.total || 0), 0) || 1;
  const R = 15.9155; // circunferencia ≈ 100
  let offset = 0;
  return (
    <svg viewBox="0 0 42 42" className="w-16 h-16 flex-shrink-0 -rotate-90" aria-hidden="true">
      <circle cx="21" cy="21" r={R} fill="none" stroke="#eceef3" strokeWidth="5" />
      {data.map((d, i) => {
        const frac = ((d.total || 0) / total) * 100;
        const color = ESTADO_COLORS[d.estadoNombre] || '#c4b5fd';
        const el = (
          <circle key={i} cx="21" cy="21" r={R} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${frac} ${100 - frac}`} strokeDashoffset={-offset} strokeLinecap="round" />
        );
        offset += frac;
        return el;
      })}
    </svg>
  );
};

export const ListaPacientes = () => {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const trabajadores = useTerapeutas(); // Obtener todos los trabajadores
  // Filtrar solo terapeutas (sin validar activo porque viene undefined del backend)
  const terapeutasDisponibles = trabajadores.filter(
    t => t.rol?.id === ROLES.TERAPEUTA && t.estado
  );
  const [pacientes, setPacientes] = useState([]);
  const [filteredPacientes, setFilteredPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({});
  const [filters, setFilters] = useState({
    distritoId: '',
    estadoId: '',
    estadoServicioId: '',
    numeroDocumento: '',
    nombreCompleto: '',
    servicioId: '',
    terapeutaId: ''
  });
  const [numeroDocumentoInput, setNumeroDocumentoInput] = useState('');
  const [nombreCompletoInput, setNombreCompletoInput] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState(null);
  const [distritos, setDistritos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [searching, setSearching] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);

  // Estado para jefe: lista de subordinadas y el filtro seleccionado
  const esJefe = user?.rol?.id === ROLES.TERAPEUTA && user?.cargo?.es_jefe === true;
  const [subordinadosJefe, setSubordinadosJefe] = useState([]);
  // filtroJefe: '' = todos (jefe + subordinadas), 'propio' = solo el jefe, ID = solo esa subordinada
  // Cambiar el estado inicial
const [filtroJefe, setFiltroJefe] = useState('propio'); // ← era ''
  useEffect(() => {
    const tieneFiltrosActivos = searchParams.distritoId || searchParams.estadoId ||
                                searchParams.estadoServicioId ||
                                searchParams.numeroDocumento || searchParams.nombreCompleto ||
                                searchParams.servicioId || searchParams.terapeutaId; // ✅ AGREGADO

    if (!tieneFiltrosActivos) {
      return;
    }

    const cargarPacientes = async () => {
      try {
        setLoading(true);
        let url = '/pacientes';
        const params = new URLSearchParams();

        if (user?.rol?.id === ROLES.TERAPEUTA) {
          if (esJefe) {
            if (filtroJefe === '') {
              params.append('terapeutaId', user.id);
            } else if (filtroJefe === 'propio') {
              params.append('terapeutaId', user.id);
              params.append('soloPropio', 'true');
            } else {
              params.append('terapeutaId', filtroJefe);
              params.append('soloPropio', 'true');
            }
          } else {
            params.append('terapeutaId', user.id);
          }
          params.append('estadoIds', '1,2,3,4');
        }
        
        if (searchParams.distritoId) params.append('distritoId', searchParams.distritoId);
        if (searchParams.estadoId) params.append('estadoId', searchParams.estadoId);
        if (searchParams.numeroDocumento) params.append('numeroDocumento', searchParams.numeroDocumento);
        if (searchParams.nombreCompleto) params.append('nombreCompleto', searchParams.nombreCompleto);
        if (searchParams.servicioId && searchParams.servicioId !== '') {
          params.append('servicioId', searchParams.servicioId);
        }
        if (searchParams.estadoServicioId && searchParams.estadoServicioId !== '') {
          params.append('estadoServicioId', searchParams.estadoServicioId);
        }
        if (searchParams.terapeutaId && searchParams.terapeutaId !== '') {
          params.append('terapeutaId', searchParams.terapeutaId);
          // Forzar soloPropio para que no se expandan subordinados del terapeuta filtrado
          params.append('soloPropio', 'true');
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const data = await getPacientes(url);

        if (data && Array.isArray(data)) {
        // El terapeuta ve sus pacientes según el estado POR SERVICIO (el backend ya filtra
        // por asignación + paciente_servicio ACTIVO), NO según el estado global del paciente.
        const pacientesFiltrados = data;

        setPacientes(pacientesFiltrados);
        setFilteredPacientes(pacientesFiltrados);
        setError(null);
      } else {
          setPacientes([]);
          setFilteredPacientes([]);
          setError(null);
        }
      } catch (err) {
        console.error('Error al cargar pacientes:', err);
        setPacientes([]);
        setFilteredPacientes([]);
        setError('Error al cargar los pacientes');
      } finally {
        setLoading(false);
      }
    };

    cargarPacientes();
  }, [user, searchParams, filtroJefe, esJefe]);

  useEffect(() => {
    const cargarPacientesIniciales = async () => {
      try {
        setLoading(true);
        let url = '/pacientes';
        const params = new URLSearchParams();

        if (user?.rol?.id === ROLES.TERAPEUTA) {
          if (esJefe) {
            if (filtroJefe === '') {
              // Todos: jefe + subordinadas (backend auto-expande)
              params.append('terapeutaId', user.id);
            } else if (filtroJefe === 'propio') {
              params.append('terapeutaId', user.id);
              params.append('soloPropio', 'true');
            } else {
              // ID de una subordinada específica
              params.append('terapeutaId', filtroJefe);
              params.append('soloPropio', 'true');
            }
          } else {
            params.append('terapeutaId', user.id);
          }
          params.append('estadoIds', '1,2,3,4');
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const data = await getPacientes(url);
        if (data && Array.isArray(data)) {
          // El terapeuta ve por estado POR SERVICIO (lo filtra el backend), no por estado global
          const pacientesFiltrados = data;
          setPacientes(pacientesFiltrados);
          setFilteredPacientes(pacientesFiltrados);
          setError(null);
        } else {
          setPacientes([]);
          setFilteredPacientes([]);
          setError(null);
        }
      } catch (err) {
        console.error('Error al cargar pacientes iniciales:', err);
        setPacientes([]);
        setFilteredPacientes([]);
        setError('Error al cargar los pacientes');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      cargarPacientesIniciales();
    }
  }, [user, filtroJefe, esJefe]);

  // Cargar subordinados si el usuario es jefe
  useEffect(() => {
    if (esJefe && user?.id) {
      getSubordinados(user.id)
        .then(data => setSubordinadosJefe(Array.isArray(data) ? data : []))
        .catch(() => setSubordinadosJefe([]));
    }
  }, [esJefe, user?.id]);

  useEffect(() => {
    const cargarDatosAdicionales = async () => {
      try {
        const [distritosData, estadosData, serviciosData, estadisticasData] = await Promise.all([
          getDistritos(),
          getEstadosPaciente(),
          getServicios(),
          getEstadisticasPacientes()
        ]);

        setDistritos(distritosData || []);
        setEstados(estadosData || []);
        setServicios(serviciosData || []);
        setEstadisticas(estadisticasData || null);
      } catch (error) {
        console.error('Error cargando datos adicionales:', error);
      }
    };

    cargarDatosAdicionales();
  }, []);

  const ejecutarBusqueda = async () => {
    setSearching(true);

    try {
      const nuevosSearchParams = {
        numeroDocumento: numeroDocumentoInput || '',
        nombreCompleto: nombreCompletoInput || '',
        distritoId: filters.distritoId || '',
        estadoId: filters.estadoId || '',
        estadoServicioId: filters.estadoServicioId || '',
        terapeutaId: filters.terapeutaId || '',
        ...(canViewServiceInfo(user) && { servicioId: filters.servicioId || '' })
      };

      // Solo actualizar searchParams, el useEffect se encargará de hacer la búsqueda en el backend
      setSearchParams(nuevosSearchParams);
      setPage(0);
    } finally {
      setSearching(false);
    }
  };

  const handleFilterChange = (field, value) => {
    let processedValue = value;
    if (field === 'servicioId' || field === 'terapeutaId') { // ✅ MODIFICADO
      processedValue = value === '' ? '' : String(value);
    }
    
    setFilters(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const clearFilters = async () => {
    // Resetear todos los filtros de UI
    setFilters({
      distritoId: '',
      estadoId: '',
      estadoServicioId: '',
      numeroDocumento: '',
      nombreCompleto: '',
      terapeutaId: '',
      ...(canViewServiceInfo(user) && { servicioId: '' })
    });
    setNumeroDocumentoInput('');
    setNombreCompletoInput('');
    setSearchParams({});
    setPage(0);
    // Si es jefe, también resetear el filtro de área (el useEffect se encargará de recargar)
    if (esJefe) {
      setFiltroJefe('propio');
      return; // El efecto se encargará de la recarga
    }

    try {
      setLoading(true);
      let url = '/pacientes';
      const params = new URLSearchParams();

      if (user?.rol?.id === ROLES.TERAPEUTA) {
        params.append('terapeutaId', user.id);
        params.append('estadoIds', '1,2,3,4');
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const data = await getPacientes(url);
      // El terapeuta ve por estado POR SERVICIO (lo filtra el backend), no por estado global
      const pacientesFiltrados = data;
      setPacientes(pacientesFiltrados);
      setFilteredPacientes(pacientesFiltrados);
    } catch (error) {
      console.error('Error al recargar pacientes:', error);
      setError('Error al recargar la lista de pacientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPaciente = async (paciente) => {
    setPacienteSeleccionadoId(paciente.id);
  };

  const handleEditarPaciente = (id) => {
    navigate(`/editar-paciente/${id}`);
  };
  const recargarPacientes = async () => {
    try {
      setLoading(true);
      let url = '/pacientes';
      const params = new URLSearchParams();

      if (user?.rol?.id === ROLES.TERAPEUTA) {
        if (esJefe) {
          if (filtroJefe === 'propio' || filtroJefe === '') {
            params.append('terapeutaId', user.id);
            params.append('soloPropio', 'true');
          } else {
            params.append('terapeutaId', filtroJefe);
            params.append('soloPropio', 'true');
          }
        } else {
          params.append('terapeutaId', user.id);
          params.append('soloPropio', 'true');
        }
        params.append('estadoIds', '1,2,3,4');
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const data = await getPacientes(url);
      // El terapeuta ve por estado POR SERVICIO (lo filtra el backend), no por estado global
      const pacientesFiltrados = data;
      setPacientes(pacientesFiltrados);
      setFilteredPacientes(pacientesFiltrados);
      
      const estadisticasData = await getEstadisticasPacientes();
      setEstadisticas(estadisticasData || null);
    } catch (err) {
      console.error('Error al recargar pacientes:', err);
    } finally {
      setLoading(false);
    }
  };
  const paginatedPacientes = filteredPacientes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(filteredPacientes.length / rowsPerPage);

  if (loading) {
    return (
      <div className="tailwind-scope">
      <Box sx={{
        flexGrow: 1,
        p: 3,
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress sx={{ color: '#7B1FA2' }} />
      </Box>
      </div>
    );
  }

  if (error && !pacientes.length) {
    return (
      <Box sx={{
        flexGrow: 1,
        p: 3,
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  const filtrosActivos = searchParams.distritoId || searchParams.estadoId || searchParams.estadoServicioId || searchParams.servicioId || searchParams.numeroDocumento || searchParams.nombreCompleto || (searchParams.terapeutaId && !esJefe);

 const etiquetaVistaJefe = esJefe
  ? filtroJefe === 'propio' || filtroJefe === ''
    ? 'Mis pacientes'
    : (() => {
        const sub = subordinadosJefe.find(s => String(s.id) === filtroJefe);
        return sub ? `${sub.nombres} ${sub.apellidos}` : 'Subordinada';
      })()
  : null;

  return (
    <div className="tailwind-scope">
    <Box
      component="div"
      className="cx-admin-bg"
      sx={{
        flexGrow: 1,
        p: { xs: 2, md: 2.5 },
        minHeight: '100vh',
        pt: { xs: 10, md: 2.5 }
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center shadow-sm flex-shrink-0">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-gray-900 leading-tight">Pacientes</h1>
          <p className="text-[13px] text-gray-400 -mt-0.5">Gestión integral de pacientes</p>
        </div>
        {!isTerapeuta(user) && (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => navigate('/registro-paciente')}
              className="cx-glow flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl text-sm font-semibold"
            >
              <UserPlus className="w-4 h-4" /> Nuevo paciente
            </button>
          </div>
        )}
      </div>

      {/* Estadísticas Cards - Estilo RRHH - Una sola fila */}
      
      {estadisticas && user?.rol?.id !== ROLES.TERAPEUTA && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {/* Pacientes Registrados este mes */}
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3.5 relative overflow-hidden">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="min-w-0 flex-1 relative z-10">
              <p className="text-xs font-medium text-gray-400 truncate">Registrados este Mes</p>
              <p className="text-[26px] font-extrabold text-gray-900 leading-tight">{estadisticas?.pacientesActivosMes || 0}</p>
              <p className="text-[11px] text-gray-400 -mt-0.5 capitalize truncate">
                {new Date().toLocaleDateString('es-ES', { month: 'long' })} {new Date().getFullYear()}
              </p>
            </div>
            <Sparkline color="#16a34a" />
          </div>

          {/* Pacientes Dados de baja este mes */}
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3.5 relative overflow-hidden">
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10">
              <UserX className="w-6 h-6 text-rose-500" />
            </div>
            <div className="min-w-0 flex-1 relative z-10">
              <p className="text-xs font-medium text-gray-400 truncate">Dados de Baja</p>
              <p className="text-[26px] font-extrabold text-gray-900 leading-tight">{estadisticas?.pacientesInactivosMes || 0}</p>
              <p className="text-[11px] text-gray-400 -mt-0.5 capitalize truncate">
                {new Date().toLocaleDateString('es-ES', { month: 'long' })} {new Date().getFullYear()}
              </p>
            </div>
            <Sparkline color="#f43f5e" />
          </div>

          {/* Total en Tratamiento (suma de servicios activos) */}
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3.5 relative overflow-hidden">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10">
              <Users className="w-6 h-6 text-[#7B1FA2]" />
            </div>
            <div className="min-w-0 flex-1 relative z-10">
              <p className="text-xs font-medium text-gray-400 truncate">En Tratamiento</p>
              <p className="text-[26px] font-extrabold text-gray-900 leading-tight">
                {(estadisticas?.estadisticas || [])
                  .filter(est => ['Nuevo', 'Entrevista', 'Evaluacion', 'Terapia'].includes(est.estadoNombre))
                  .reduce((sum, est) => sum + est.total, 0)}
              </p>
              <p className="text-[11px] text-gray-400 -mt-0.5 truncate">Nuevo, Entrevista, Evaluación y Terapia</p>
            </div>
            <Sparkline color="#7B1FA2" />
          </div>

          {/* Desglose por Estado — donut + leyenda */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-400">Por Estado</span>
            </div>
            <div className="flex items-center gap-3">
              <Donut data={estadisticas?.estadisticas || []} />
              <div className="flex-1 min-w-0 space-y-1">
                {(estadisticas?.estadisticas || []).map((est) => (
                  <div key={est.estadoId} className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ESTADO_COLORS[est.estadoNombre] || '#c4b5fd' }} />
                    <span className="text-gray-500 flex-1 truncate">{est.estadoNombre}</span>
                    <span className="font-bold text-gray-800">{est.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros Section - Estilo moderno */}
      <div className="mb-3">
        <div className="glass-panel rounded-2xl p-4 relative z-30">
          {/* Filtros aplicados */}
          {filtrosActivos && (
            <div className="mb-3 p-3 bg-gradient-to-r from-[#7B1FA2]/5 to-[#A3C644]/5 rounded-xl border border-[#7B1FA2]/20">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#7B1FA2]" />
                  <span className="text-sm font-semibold text-gray-700">Filtros activos:</span>
                </div>
                
                {searchParams.nombreCompleto && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-[#7B1FA2]/30 text-sm">
                    <span className="font-medium text-[#7B1FA2]">Nombre:</span>
                    <span className="text-gray-700">{searchParams.nombreCompleto}</span>
                  </div>
                )}
                
                {searchParams.numeroDocumento && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-[#7B1FA2]/30 text-sm">
                    <span className="font-medium text-[#7B1FA2]">Doc:</span>
                    <span className="text-gray-700">{searchParams.numeroDocumento}</span>
                  </div>
                )}
                
                {searchParams.distritoId && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-[#7B1FA2]/30 text-sm">
                    <span className="font-medium text-[#7B1FA2]">Distrito:</span>
                    <span className="text-gray-700">{distritos.find(d => d.id === parseInt(searchParams.distritoId))?.nombre}</span>
                  </div>
                )}
                
                {searchParams.estadoServicioId && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-[#7B1FA2]/30 text-sm">
                    <span className="font-medium text-[#7B1FA2]">Estado:</span>
                    <span className="text-gray-700">{estados.find(e => e.id === parseInt(searchParams.estadoServicioId))?.nombre}</span>
                  </div>
                )}
                
                {searchParams.servicioId && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-[#7B1FA2]/30 text-sm">
                    <span className="font-medium text-[#7B1FA2]">Servicio:</span>
                    <span className="text-gray-700">{servicios.find(s => s.id === parseInt(searchParams.servicioId))?.nombre}</span>
                  </div>
                )}

                {/* Chip para Terapeuta (admin) */}
                {searchParams.terapeutaId && !esJefe && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-[#7B1FA2]/30 text-sm">
                    <span className="font-medium text-[#7B1FA2]">Terapeuta:</span>
                    <span className="text-gray-700">
                      {terapeutasDisponibles.find(t => t.id === parseInt(searchParams.terapeutaId))
                        ? `${terapeutasDisponibles.find(t => t.id === parseInt(searchParams.terapeutaId)).nombres} ${terapeutasDisponibles.find(t => t.id === parseInt(searchParams.terapeutaId)).apellidos}`
                        : 'Desconocido'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Inputs de búsqueda — barra moderna con íconos */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Nombre Completo */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B1FA2] pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={nombreCompletoInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
                    setNombreCompletoInput(value);
                  }
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ejecutarBusqueda(); } }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all"
              />
            </div>

            {/* Número de Documento */}
            <div className="relative min-w-[150px]">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
              <input
                type="text"
                placeholder="N° Documento"
                value={numeroDocumentoInput}
                maxLength={12}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setNumeroDocumentoInput(value);
                  }
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ejecutarBusqueda(); } }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all"
              />
            </div>

            {/* Distrito */}
            {!isTerapeuta(user) && (
              <DropdownFiltro
                className="min-w-[160px]"
                icon={MapPin}
                iconClass="text-rose-500"
                placeholder="Distrito"
                value={filters.distritoId}
                onChange={(val) => handleFilterChange('distritoId', val)}
                options={[
                  { value: '', label: 'Distrito' },
                  ...distritos
                    .filter((d) => d.id_provincia === 1)
                    .map((d) => ({ value: String(d.id), label: d.nombre })),
                ]}
              />
            )}

            {/* Estado por servicio */}
            <DropdownFiltro
              className="min-w-[150px]"
              icon={Activity}
              iconClass="text-emerald-500"
              placeholder="Estado"
              value={filters.estadoServicioId}
              onChange={(val) => handleFilterChange('estadoServicioId', val)}
              options={[
                { value: '', label: 'Estado' },
                ...estados.map((e) => ({ value: String(e.id), label: e.nombre })),
              ]}
            />

            {/* Servicio */}
            {canViewServiceInfo(user) && (
              <DropdownFiltro
                className="min-w-[150px]"
                icon={Layers}
                iconClass="text-indigo-500"
                placeholder="Servicio"
                value={filters.servicioId || ''}
                onChange={(val) => handleFilterChange('servicioId', val)}
                groups={Object.entries(
                  servicios.reduce((acc, servicio) => {
                    if (servicio.activo && servicio.area?.activo) {
                      const area = servicio.area?.nombre || 'Sin Área';
                      if (!acc[area]) acc[area] = [];
                      acc[area].push(servicio);
                    }
                    return acc;
                  }, {})
                ).map(([areaNombre, serviciosArea]) => ({
                  label: areaNombre,
                  items: serviciosArea.map((s) => ({ value: String(s.id), label: s.nombre })),
                }))}
              />
            )}

            {esJefe && (
              <DropdownFiltro
                className="min-w-[160px]"
                icon={Users}
                iconClass="text-[#7B1FA2]"
                placeholder="Mis pacientes"
                value={filtroJefe}
                onChange={(val) => setFiltroJefe(val)}
                options={[
                  { value: 'propio', label: 'Mis pacientes' },
                  ...subordinadosJefe.map((sub) => ({ value: String(sub.id), label: `${sub.nombres} ${sub.apellidos}` })),
                ]}
              />
            )}

            {/* Selector de Terapeuta - solo para no terapeutas */}
            {!isTerapeuta(user) && (
              <DropdownFiltro
                className="min-w-[160px]"
                icon={Stethoscope}
                iconClass="text-teal-500"
                placeholder="Terapeuta"
                value={filters.terapeutaId || ''}
                onChange={(val) => handleFilterChange('terapeutaId', val)}
                options={[
                  { value: '', label: 'Terapeuta' },
                  ...terapeutasDisponibles.map((t) => ({ value: String(t.id), label: `${t.nombres} ${t.apellidos}` })),
                ]}
              />
            )}

            {/* Botones de acción */}
            <button
              onClick={ejecutarBusqueda}
              disabled={searching || (!numeroDocumentoInput && !nombreCompletoInput && !filters.distritoId && !filters.estadoServicioId && !(canViewServiceInfo(user) && filters.servicioId) && !filters.terapeutaId)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-semibold text-sm shadow-md shadow-purple-500/25 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Buscar
            </button>

            <button
              onClick={clearFilters}
              title="Limpiar filtros"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 hover:text-[#7B1FA2] transition-all"
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
            {filteredPacientes.length} {filteredPacientes.length === 1 ? 'paciente' : 'pacientes'}
          </div>
          {/* Badge indicando la vista actual para jefes */}
          {esJefe && etiquetaVistaJefe && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 border border-purple-200 text-purple-800 rounded-full text-xs font-semibold">
              <User className="w-3 h-3" />
              {etiquetaVistaJefe}
            </div>
          )}
        </div>
      </div>

      {/* Tarjetas de pacientes */}
      <div className="-mx-4 md:-mx-0">
      <TarjetasPacientes
        pacientes={paginatedPacientes}
        pacienteSeleccionadoId={pacienteSeleccionadoId}
        onSelect={handleSelectPaciente}
        onEditar={handleEditarPaciente}
        user={user}
        emptyMessage={
          pacientes.length === 0 && !loading
            ? (filtrosActivos ? 'No se encontraron pacientes con los filtros aplicados' : 'No hay pacientes registrados')
            : filteredPacientes.length === 0 && pacientes.length > 0
            ? 'No se encontraron pacientes con los filtros aplicados'
            : null
        }
        onPacienteOcultado={(pacienteId) => {
          recargarPacientes();
          if (pacienteSeleccionadoId === pacienteId) {
            setPacienteSeleccionadoId(null);
          }
        }}
      />
      </div>

      {/* Paginación moderna */}
      {filteredPacientes.length > 0 && (
        <div className="mt-3 glass-panel rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              Mostrando <span className="font-semibold text-gray-900">{page * rowsPerPage + 1}</span> a{' '}
              <span className="font-semibold text-gray-900">
                {Math.min((page + 1) * rowsPerPage, filteredPacientes.length)}
              </span>{' '}
              de <span className="font-semibold text-gray-900">{filteredPacientes.length}</span> pacientes
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Selector de filas por página — dropdown custom */}
              <DropdownFiltro
                className="w-full sm:w-36"
                value={String(rowsPerPage)}
                onChange={(val) => { setRowsPerPage(parseInt(val)); setPage(0); }}
                options={[
                  { value: '6', label: '6 por página' },
                  { value: '12', label: '12 por página' },
                  { value: '24', label: '24 por página' },
                  { value: '48', label: '48 por página' },
                ]}
              />

              {/* Botones de paginación */}
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
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  title="Anterior"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-white hover:text-[#7B1FA2] disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Números de página */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages <= 3 ? totalPages : 3, totalPages) }, (_, i) => {
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
                  onClick={() => setPage(page + 1)}
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
    </Box>
    </div> 
  );
};