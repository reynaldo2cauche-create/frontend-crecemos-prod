import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip
} from '@mui/material';
import { Search, X, Filter, RefreshCw, Users, UserX, UserCheck, UserCog, Stethoscope, MessageSquare, User } from 'lucide-react';
import { getPacientes, getEstadosPaciente, getEstadisticasPacientes } from '../services/pacienteService';
import { getDistritos, getServicios } from '../services/catalogoService';
import TarjetasPacientes from '../components/Pacientes/TablaPacientes';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { ROLES, isTerapeuta, canViewServiceInfo } from '../constants/roles';
import { useNavigate } from 'react-router-dom';
import { useTerapeutas } from '../hooks/useTerapeutas';
import { getSubordinados } from '../services/trabajadorService';
import '../styles/intranet.css';

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
    numeroDocumento: '',
    nombreCompleto: '',
    servicioId: '',
    terapeutaId: '' // ✅ AGREGADO
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
        // ✅ FILTRAR pacientes con estado.id === 5 (Inactivo) si es terapeuta
        let pacientesFiltrados = data;
        if (user?.rol?.id === ROLES.TERAPEUTA) {
          pacientesFiltrados = data.filter(p => p.estado?.id !== 5);
        }

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
          // Filtrar inactivos si es terapeuta
          let pacientesFiltrados = data;
          if (user?.rol?.id === ROLES.TERAPEUTA) {
            pacientesFiltrados = data.filter(p => p.estado?.id !== 5);
          }
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
      let pacientesFiltrados = data;
      if (user?.rol?.id === ROLES.TERAPEUTA) {
        pacientesFiltrados = data.filter(p => p.estado?.id !== 5);
      }
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
      let pacientesFiltrados = data;
      if (user?.rol?.id === ROLES.TERAPEUTA) {
        pacientesFiltrados = data.filter(p => p.estado?.id !== 5);
      }
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

  const filtrosActivos = searchParams.distritoId || searchParams.estadoId || searchParams.servicioId || searchParams.numeroDocumento || searchParams.nombreCompleto || (searchParams.terapeutaId && !esJefe);

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
      component="main"
      sx={{
        flexGrow: 1,
        p: { xs: 2, md: 4 },
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        pt: { xs: 10, md: 4 }
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lista de Pacientes</h1>
        <p className="text-gray-600">Gestiona y visualiza todos tus pacientes</p>
      </div>

      {/* Estadísticas Cards - Estilo RRHH - Una sola fila */}
      
      {estadisticas  && user?.rol?.id !== ROLES.TERAPEUTA &&  (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* Pacientes Registrados este mes */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600">Registrados este Mes</span>
              <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{estadisticas?.pacientesActivosMes || 0}</div>
            <div className="text-xs text-gray-500 mt-0.5 capitalize">
              {new Date().toLocaleDateString('es-ES', { month: 'long' })} {new Date().getFullYear()}
            </div>
          </div>

          {/* Pacientes Dados de baja este mes */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600">Dados de Baja</span>
              <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
                <UserX className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{estadisticas?.pacientesInactivosMes || 0}</div>
            <div className="text-xs text-gray-500 mt-0.5 capitalize">
              {new Date().toLocaleDateString('es-ES', { month: 'long' })} {new Date().getFullYear()}
            </div>
          </div>

          {/* Total de Pacientes en Tratamiento */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600">En Tratamiento</span>
              <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {estadisticas?.estadisticas
                ?.filter(est => ['Entrevista', 'Evaluacion', 'Terapia'].includes(est.estadoNombre))
                .reduce((sum, est) => sum + est.total, 0) || 0}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Entrevista, Evaluación y Terapia
            </div>
          </div>

          {/* Desglose por Estados - Mismo card en la misma fila */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600">Por Estado</span>
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {estadisticas.estadisticas.map((est) => {
                // Colores específicos por estado
                const getEstadoColor = (nombreEstado) => {
                  const colorMap = {
                    'Nuevo': { bg: 'bg-green-100', text: 'text-green-700' },
                    'Entrevista': { bg: 'bg-blue-100', text: 'text-blue-700' },
                    'Evaluacion': { bg: 'bg-orange-100', text: 'text-orange-700' },
                    'Terapia': { bg: 'bg-purple-100', text: 'text-purple-700' },
                    'Inactivo': { bg: 'bg-gray-100', text: 'text-gray-700' }
                  };
                  return colorMap[nombreEstado] || { bg: 'bg-gray-100', text: 'text-gray-700' };
                };

                const color = getEstadoColor(est.estadoNombre);

                return (
                  <div
                    key={est.estadoId}
                    className={`inline-flex items-center justify-center gap-0.5 ${color.bg} rounded px-1.5 py-0.5`}
                  >
                    <span className={`text-[10px] font-medium ${color.text} whitespace-nowrap`}>{est.estadoNombre}</span>
                    <span className={`text-[10px] font-bold ${color.text}`}>{est.total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filtros Section - Estilo moderno */}
      <div className="mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {/* Filtros aplicados */}
          {filtrosActivos && (
            <div className="mb-6 p-4 bg-gradient-to-r from-[#7B1FA2]/5 to-[#A3C644]/5 rounded-xl border border-[#7B1FA2]/20">
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
                
                {searchParams.estadoId && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-[#7B1FA2]/30 text-sm">
                    <span className="font-medium text-[#7B1FA2]">Estado:</span>
                    <span className="text-gray-700">{estados.find(e => e.id === parseInt(searchParams.estadoId))?.nombre}</span>
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

          {/* Inputs de búsqueda */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {/* Nombre Completo */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nombre Completo"
                  value={nombreCompletoInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
                      setNombreCompletoInput(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      ejecutarBusqueda();
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all"
                />
              </div>

              {/* Número de Documento */}
              <div className="relative">
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      ejecutarBusqueda();
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all"
                />
              </div>

              {/* Distrito */}
              {!isTerapeuta(user) && (
                <select
                  value={filters.distritoId}
                  onChange={(e) => handleFilterChange('distritoId', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  <option value="">Todos los distritos</option>
                  {distritos
                    .filter(distrito => distrito.id_provincia === 1)
                    .map((distrito) => (
                      <option key={distrito.id} value={distrito.id}>
                        {distrito.nombre}
                      </option>
                    ))}
                </select>
              )}

              {/* Estado */}
              <select
                value={filters.estadoId}
                onChange={(e) => handleFilterChange('estadoId', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="">Todos los estados</option>
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </option>
                ))}
              </select>

              {/* Servicio */}
              {canViewServiceInfo(user) && (
                <select
                  value={filters.servicioId || ''}
                  onChange={(e) => handleFilterChange('servicioId', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  <option value="">Todos los servicios</option>
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
              )}

              {esJefe && (
                <select
                  value={filtroJefe}
                  onChange={(e) => setFiltroJefe(e.target.value)}
                  className="w-full px-4 py-2.5 bg-purple-50 border border-purple-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer font-medium text-purple-800"
                >
                  <option value="propio">Mis pacientes</option>  {/* ← default ahora */}
                  {subordinadosJefe.map((sub) => (
                    <option key={sub.id} value={String(sub.id)}>
                      {sub.nombres} {sub.apellidos}
                    </option>
                  ))}
                  
                </select>
              )}

              {/* Selector de Terapeuta - solo para no terapeutas (admins, recepción, etc.) */}
              {!isTerapeuta(user) && (
                <select
                  value={filters.terapeutaId || ''}
                  onChange={(e) => handleFilterChange('terapeutaId', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  <option value="">Todos los terapeutas</option>
                  {terapeutasDisponibles.map((terapeuta) => (
                    <option key={terapeuta.id} value={terapeuta.id}>
                      {terapeuta.nombres} {terapeuta.apellidos}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={ejecutarBusqueda}
                disabled={searching || (!numeroDocumentoInput && !nombreCompletoInput && !filters.distritoId && !filters.estadoId && !(canViewServiceInfo(user) && filters.servicioId) && !filters.terapeutaId)}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {searching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Buscar
                  </>
                )}
              </button>

              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-bold text-gray-900">Resultados</h2>
          <div className="px-4 py-1.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-full text-sm font-semibold">
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
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
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