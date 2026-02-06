import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  RefreshCw,
  Filter,
  Shield,
  Activity,
  Users,
  FileText,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  MapPin,
  Globe
} from 'lucide-react';
import { obtenerHistorial, obtenerEstadisticas } from '../../services/auditoriaService';

const MODULOS = [
  { value: '', label: 'Todos los módulos' },
  { value: 'AUTH', label: 'Autenticación' },
  { value: 'PACIENTES', label: 'Pacientes' },
  { value: 'CITAS', label: 'Citas' },
  { value: 'ARCHIVOS', label: 'Archivos' },
  { value: 'RRHH', label: 'Recursos Humanos' },
  { value: 'POSTULACIONES', label: 'Postulaciones' },
  { value: 'AUDITORIA', label: 'Auditoría' },
];

const ACCIONES = [
  { value: '', label: 'Todas las acciones' },
  { value: 'LOGIN', label: 'Inicio de Sesión' },
  { value: 'VER_PACIENTE', label: 'Ver Paciente' },
  { value: 'CREAR_PACIENTE', label: 'Crear Paciente' },
  { value: 'EDITAR_PACIENTE', label: 'Editar Paciente' },
  { value: 'CREAR_CITA', label: 'Crear Cita' },
  { value: 'EDITAR_CITA', label: 'Editar Cita' },
  { value: 'ELIMINAR_CITA', label: 'Eliminar Cita' },
  { value: 'SUBIR_ARCHIVO', label: 'Subir Archivo' },
  { value: 'DESCARGAR_ARCHIVO', label: 'Descargar Archivo' },
  { value: 'CREAR_CERTIFICADO', label: 'Crear Certificado' },
  { value: 'EDITAR_EMPLEADO', label: 'Editar Empleado' },
  { value: 'REGISTRAR_PAGO', label: 'Registrar Pago' },
];

const HistorialAuditoria = () => {
  const [registros, setRegistros] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(true);

  // Ref para evitar llamadas duplicadas
  const isLoadingRef = useRef(false);

  // Filtros
  const [filtros, setFiltros] = useState({
    modulo: '',
    accion: '',
    fechaInicio: '',
    fechaFin: '',
    busqueda: '',
  });

  const cargarHistorial = useCallback(async () => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setLoading(true);
    try {
      const resultado = await obtenerHistorial({
        ...filtros,
        page: page + 1,
        limit: rowsPerPage,
      });

      setRegistros(resultado.registros || []);
      setTotalRegistros(resultado.total || 0);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [filtros, page, rowsPerPage]);

  const cargarEstadisticas = useCallback(async () => {
    try {
      const stats = await obtenerEstadisticas(
        filtros.fechaInicio || null,
        filtros.fechaFin || null
      );
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }, [filtros.fechaInicio, filtros.fechaFin]);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const aplicarFiltros = () => {
    setPage(0);
  };

  const limpiarFiltros = () => {
    setFiltros({
      modulo: '',
      accion: '',
      fechaInicio: '',
      fechaFin: '',
      busqueda: '',
    });
    setPage(0);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    const segundos = String(date.getSeconds()).padStart(2, '0');
    return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
  };

  const getColorModulo = (modulo) => {
    const colores = {
      AUTH: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200' },
      PACIENTES: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
      CITAS: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200' },
      ARCHIVOS: { bg: 'bg-cyan-100', text: 'text-cyan-700', dot: 'bg-cyan-500', border: 'border-cyan-200' },
      RRHH: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', border: 'border-orange-200' },
      POSTULACIONES: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
      AUDITORIA: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
    };
    return colores[modulo] || { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500', border: 'border-gray-200' };
  };

  const totalPages = Math.ceil(totalRegistros / rowsPerPage);
  const paginatedRegistros = registros;

  if (loading && registros.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando historial de auditoría...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24 lg:pt-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Historial de Auditoría</h1>
              <p className="text-sm text-gray-600">Registro completo de todas las acciones del sistema</p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Total de Acciones */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{estadisticas.totalAcciones}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Total de Acciones</div>
            </div>

            {/* Módulos Activos */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#7B1FA2]" />
                </div>
                <TrendingUp className="w-4 h-4 text-[#7B1FA2]" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {estadisticas.accionesPorModulo?.length || 0}
              </div>
              <div className="text-xs text-gray-600 font-medium mt-1">Módulos Activos</div>
            </div>

            {/* Usuarios Activos */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {estadisticas.accionesPorUsuario?.length || 0}
              </div>
              <div className="text-xs text-gray-600 font-medium mt-1">Usuarios Activos</div>
            </div>

            {/* Tipos de Acciones */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-orange-600" />
                </div>
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {estadisticas.accionesPorTipo?.length || 0}
              </div>
              <div className="text-xs text-gray-600 font-medium mt-1">Tipos de Acciones</div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-[#7B1FA2]" />
              <h2 className="text-sm font-bold text-gray-900">Filtros de Búsqueda</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mb-3">
              {/* Búsqueda General */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por usuario o descripción..."
                  value={filtros.busqueda}
                  onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent transition-all"
                />
              </div>

              {/* Módulo */}
              <select
                value={filtros.modulo}
                onChange={(e) => handleFiltroChange('modulo', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                {MODULOS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              {/* Acción */}
              <select
                value={filtros.accion}
                onChange={(e) => handleFiltroChange('accion', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                {ACCIONES.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              {/* Fecha Inicio */}
              <input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent transition-all"
              />

              {/* Fecha Fin */}
              <input
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={aplicarFiltros}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all"
              >
                <Search className="w-4 h-4" />
                Aplicar
              </button>
              <button
                onClick={limpiarFiltros}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Limpiar
              </button>
              <button
                onClick={() => { cargarHistorial(); cargarEstadisticas(); }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-green-200 text-green-700 rounded-lg font-medium text-sm hover:bg-green-50 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de registros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando registros...</p>
              </div>
            </div>
          ) : registros.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No se encontraron registros
                </h3>
                <p className="text-sm text-gray-500">Intenta ajustar los filtros de búsqueda</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Fecha y Hora
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Usuario
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Módulo / Acción
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Descripción
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Ubicación GPS
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRegistros.map((registro) => {
                      const moduloColor = getColorModulo(registro.modulo);
                      return (
                        <tr key={registro.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="whitespace-nowrap">{formatearFecha(registro.fechaHora)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                {registro.trabajador?.nombres?.charAt(0) || '?'}
                                {registro.trabajador?.apellidos?.charAt(0) || '?'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">
                                  {registro.trabajador?.nombres} {registro.trabajador?.apellidos}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                  @{registro.trabajador?.username}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1.5">
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border w-fit ${moduloColor.bg} ${moduloColor.border}`}>
                                <div className={`w-2 h-2 rounded-full ${moduloColor.dot}`}></div>
                                <span className={`text-xs font-semibold ${moduloColor.text}`}>{registro.modulo}</span>
                              </div>
                              <span className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-0.5 rounded w-fit">
                                {registro.accion}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed" title={registro.descripcion}>
                              {registro.descripcion}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            {registro.latitud && registro.longitud ? (
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`https://www.google.com/maps?q=${registro.latitud},${registro.longitud}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-xs font-medium text-green-700 hover:shadow-md hover:from-green-100 hover:to-emerald-100 transition-all group"
                                  title={`Ver en Google Maps\nLat: ${registro.latitud}\nLng: ${registro.longitud}`}
                                >
                                  <MapPin className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                  <span className="font-mono">{parseFloat(registro.latitud).toFixed(4)}</span>
                                  <span className="text-green-400">,</span>
                                  <span className="font-mono">{parseFloat(registro.longitud).toFixed(4)}</span>
                                  <Globe className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                                </a>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Sin ubicación</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded whitespace-nowrap block w-fit">
                              {registro.ipAddress || '-'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalRegistros > 0 && (
                <div className="border-t border-gray-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Mostrando <span className="font-semibold">{page * rowsPerPage + 1}</span> a{' '}
                    <span className="font-semibold">{Math.min((page + 1) * rowsPerPage, totalRegistros)}</span> de{' '}
                    <span className="font-semibold">{totalRegistros}</span> registros
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="p-1.5 text-gray-600 hover:bg-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (page < 3) {
                        pageNum = i;
                      } else if (page > totalPages - 4) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white'
                              : 'hover:bg-white text-gray-600'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page >= totalPages - 1}
                      className="p-1.5 text-gray-600 hover:bg-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <select
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]"
                  >
                    <option value={10}>10 por página</option>
                    <option value={25}>25 por página</option>
                    <option value={50}>50 por página</option>
                    <option value={100}>100 por página</option>
                  </select>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorialAuditoria;
