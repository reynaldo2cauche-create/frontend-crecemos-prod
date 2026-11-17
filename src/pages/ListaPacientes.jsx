import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip
} from '@mui/material';
import { Search, X, Filter, RefreshCw, Users, UserX, UserCheck, UserCog, Stethoscope, MessageSquare, User, UserPlus, MapPin, Layers, Activity, FileText, ChevronDown } from 'lucide-react';
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
        <div className="glass-panel rounded-2xl p-4">
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
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
              <div className="relative min-w-[160px]">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={filters.distritoId}
                  onChange={(e) => handleFilterChange('distritoId', e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer text-gray-600"
                >
                  <option value="">Distrito</option>
                  {distritos
                    .filter(distrito => distrito.id_provincia === 1)
                    .map((distrito) => (
                      <option key={distrito.id} value={distrito.id}>
                        {distrito.nombre}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Estado por servicio */}
            <div className="relative min-w-[150px]">
              <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={filters.estadoServicioId}
                onChange={(e) => handleFilterChange('estadoServicioId', e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer text-gray-600"
              >
                <option value="">Estado</option>
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Servicio */}
            {canViewServiceInfo(user) && (
              <div className="relative min-w-[150px]">
                <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={filters.servicioId || ''}
                  onChange={(e) => handleFilterChange('servicioId', e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer text-gray-600"
                >
                  <option value="">Servicio</option>
                  {Object.entries(
                    servicios.reduce((acc, servicio) => {
                      if (servicio.activo && servicio.area?.activo) {
                        const area = servicio.area?.nombre || 'Sin Área';
                        if (!acc[area]) acc[area] = [];
                        acc[area].push(servicio);
                      }
                      return acc;
                    }, {})
                  ).map(([areaNombre, serviciosArea]) => (
                    <optgroup key={areaNombre} label={areaNombre}>
                      {serviciosArea.map(servicio => (
                        <option key={servicio.id} value={servicio.id}>
                          {servicio.nombre}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}

            {esJefe && (
              <div className="relative min-w-[160px]">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B1FA2] pointer-events-none" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                <select
                  value={filtroJefe}
                  onChange={(e) => setFiltroJefe(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 bg-purple-50 border border-purple-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer font-medium text-purple-800"
                >
                  <option value="propio">Mis pacientes</option>
                  {subordinadosJefe.map((sub) => (
                    <option key={sub.id} value={String(sub.id)}>
                      {sub.nombres} {sub.apellidos}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Selector de Terapeuta - solo para no terapeutas */}
            {!isTerapeuta(user) && (
              <div className="relative min-w-[160px]">
                <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={filters.terapeutaId || ''}
                  onChange={(e) => handleFilterChange('terapeutaId', e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer text-gray-600"
                >
                  <option value="">Terapeuta</option>
                  {terapeutasDisponibles.map((terapeuta) => (
                    <option key={terapeuta.id} value={terapeuta.id}>
                      {terapeuta.nombres} {terapeuta.apellidos}
                    </option>
                  ))}
                </select>
              </div>
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

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-2 w-full sm:w-auto">
              {/* Selector de filas por página */}
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value));
                  setPage(0);
                }}
                className="w-full sm:w-auto px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] cursor-pointer"
              >
                <option value={6}>6 por página</option>
                <option value={12}>12 por página</option>
                <option value={24}>24 por página</option>
                <option value={48}>48 por página</option>
              </select>

              {/* Botones de paginación */}
              <div className="flex flex-wrap gap-1 justify-center">
                <button
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                  className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <span className="hidden sm:inline">Primero</span>
                  <span className="sm:hidden">««</span>
                </button>
                
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <span className="hidden sm:inline">Anterior</span>
                  <span className="sm:hidden">«</span>
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
                        className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                          page === pageNum
                            ? 'bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white'
                            : 'hover:bg-gray-100 text-gray-700'
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
                  className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <span className="sm:hidden">»</span>
                </button>

                <button
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                  className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <span className="hidden sm:inline">Último</span>
                  <span className="sm:hidden">»»</span>
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