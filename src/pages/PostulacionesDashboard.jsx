import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, RefreshCw, Eye, Trash2, FileText, Send, ChevronLeft, ChevronRight, Users, Sparkles, CheckCircle2, XCircle, Phone, MessageCircle, Clock } from 'lucide-react';
import { CONFIGURACION_ESTADOS_POSTULACION } from '../constants/estadosPostulacion';
import TopMenu from '../components/TopMenu';
import { getDistritos } from '../services/catalogoService';
import postulacionesService from '../services/postulacionesService';

const PostulacionesDashboard = () => {
  const [postulaciones, setPostulaciones] = useState([]);
  const [filtros, setFiltros] = useState({
    search: '',
    estado_postulacion: '',
    distrito: '',
    cargo_postulado: ''
  });
  const [modalPerfil, setModalPerfil] = useState(null);
  const [modalCV, setModalCV] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [cvUrl, setCvUrl] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [estadisticas, setEstadisticas] = useState({ total: 0, estados: [] });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [estadosDisponibles, setEstadosDisponibles] = useState([]);
  const [cargosDisponibles, setCargosDisponibles] = useState([]);
  const [distritosDisponibles, setDistritosDisponibles] = useState([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [loadingCV, setLoadingCV] = useState(false);
  const inicializadoRef = useRef(false);

  const coloresEstado = {
    'Nuevo': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
    'En revisión': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    'Contactado': { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200' },
    'Por entrevistar': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
    'Rechazado': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
    'Contratado': { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200' }
  };

  useEffect(() => {
    if (inicializadoRef.current) return;
    inicializadoRef.current = true;

    const inicializar = async () => {
      await cargarCatalogos();
      await Promise.all([cargarPostulaciones(), cargarEstadisticas()]);
    };
    inicializar();
  }, []);

  const cargarCatalogos = async () => {
    try {
      setCargandoCatalogos(true);
      const [estadosData, cargosData, distritosData] = await Promise.all([
        postulacionesService.obtenerEstados(),
        postulacionesService.obtenerCargos(),
        getDistritos(),
      ]);
      setEstadosDisponibles(estadosData);
      setCargosDisponibles(cargosData);
      setDistritosDisponibles(distritosData);
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
    } finally {
      setCargandoCatalogos(false);
    }
  };

  const cargarPostulaciones = async () => {
    try {
      setLoading(true);
      const data = await postulacionesService.obtenerPostulaciones(filtros);
      setPostulaciones(data);
    } catch (error) {
      console.error('Error al cargar postulaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const data = await postulacionesService.obtenerEstadisticasPorEstados();
      setEstadisticas(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleVerPerfil = async (postulacion) => {
    try {
      setModalPerfil(postulacion);
      const comentariosData = await postulacionesService.obtenerComentarios(postulacion.id_postulacion);
      setComentarios(comentariosData);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    }
  };

  const handleVerCV = async (postulacion) => {
    try {
      setLoadingCV(true);
      setCvUrl(null);
      setModalCV(postulacion);
      console.log('Obteniendo CV para:', postulacion.id_postulacion);
      
      const url = await postulacionesService.obtenerCV(postulacion.id_postulacion);
      console.log('URL obtenida:', url);
      
      if (url) {
        setCvUrl(url);
      } else {
        console.error('URL vacía');
      }
    } catch (error) {
      console.error('Error al cargar CV:', error);
    } finally {
      setLoadingCV(false);
    }
  };

  const handleEliminar = async () => {
    try {
      await postulacionesService.eliminarPostulacion(modalEliminar.id_postulacion);
      setPostulaciones(postulaciones.filter(p => p.id_postulacion !== modalEliminar.id_postulacion));
      setModalEliminar(null);
      cargarEstadisticas();
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await postulacionesService.actualizarEstado(id, nuevoEstado);
      setPostulaciones(postulaciones.map(p => 
        p.id_postulacion === id ? { ...p, estado_postulacion: nuevoEstado } : p
      ));
      if (modalPerfil?.id_postulacion === id) {
        setModalPerfil({ ...modalPerfil, estado_postulacion: nuevoEstado });
      }
      cargarEstadisticas();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const handleAgregarComentario = async () => {
    if (!nuevoComentario.trim()) return;
    try {
      const idTrabajador = 1;
      const comentario = await postulacionesService.agregarComentario(
        modalPerfil.id_postulacion,
        idTrabajador,
        nuevoComentario
      );
      setComentarios([comentario, ...comentarios]);
      setNuevoComentario('');
    } catch (error) {
      console.error('Error al agregar comentario:', error);
    }
  };

  const cerrarModalCV = () => {
    if (cvUrl) {
      postulacionesService.limpiarUrlBlob(cvUrl);
      setCvUrl(null);
    }
    setModalCV(null);
  };

  const getInitials = (nombre, apellido) => {
    return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
  };

  const paginatedPostulaciones = postulaciones.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(postulaciones.length / rowsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pt-24 lg:pt-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Gestión de Postulaciones</h1>
          <p className="text-gray-600">Administra y revisa las postulaciones de candidatos</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-8">
          {/* Total */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{estadisticas.total}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Total</div>
            </div>
          </div>

          {/* Nuevo */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="text-center">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{estadisticas.estados?.find(e => e.nombre === 'Nuevo')?.cantidad || 0}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Nuevo</div>
            </div>
          </div>

          {/* En revisión */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{estadisticas.estados?.find(e => e.nombre === 'En revisión')?.cantidad || 0}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Revisión</div>
            </div>
          </div>

          {/* Contactado */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="text-center">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Phone className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{estadisticas.estados?.find(e => e.nombre === 'Contactado')?.cantidad || 0}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Contactado</div>
            </div>
          </div>

          {/* Por entrevistar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="text-center">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <MessageCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{estadisticas.estados?.find(e => e.nombre === 'Por entrevistar')?.cantidad || 0}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Entrevista</div>
            </div>
          </div>

          {/* Rechazado */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="text-center">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{estadisticas.estados?.find(e => e.nombre === 'Rechazado')?.cantidad || 0}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Rechazado</div>
            </div>
          </div>

          {/* Contratado */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="text-center">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{estadisticas.estados?.find(e => e.nombre === 'Contratado')?.cantidad || 0}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Contratado</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#7B1FA2]" />
                <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm font-medium text-[#7B1FA2] hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-all"
              >
                {showFilters ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            {showFilters && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Búsqueda */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, email..."
                      value={filtros.search}
                      onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Estado */}
                  <select
                    value={filtros.estado_postulacion}
                    onChange={(e) => setFiltros({ ...filtros, estado_postulacion: e.target.value })}
                    disabled={cargandoCatalogos}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Todos los estados</option>
                    {estadosDisponibles.map(estado => (
                      <option key={estado.id} value={estado.descripcion}>{estado.descripcion}</option>
                    ))}
                  </select>

                  {/* Distrito */}
                  <select
                    value={filtros.distrito}
                    onChange={(e) => setFiltros({ ...filtros, distrito: e.target.value })}
                    disabled={cargandoCatalogos}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Todos los distritos</option>
                    {distritosDisponibles.map(distrito => (
                      <option key={distrito.id} value={distrito.nombre}>{distrito.nombre}</option>
                    ))}
                  </select>

                  {/* Cargo */}
                  <select
                    value={filtros.cargo_postulado}
                    onChange={(e) => setFiltros({ ...filtros, cargo_postulado: e.target.value })}
                    disabled={cargandoCatalogos}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Todos los cargos</option>
                    {cargosDisponibles.map(cargo => (
                      <option key={cargo.id} value={cargo.descripcion}>{cargo.descripcion}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={cargarPostulaciones}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Search className="w-4 h-4" />
                    Buscar
                  </button>
                  <button
                    onClick={() => {
                      setFiltros({ search: '', estado_postulacion: '', distrito: '', cargo_postulado: '' });
                      setTimeout(cargarPostulaciones, 100);
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all"
                  >
                    <X className="w-4 h-4" />
                    Limpiar
                  </button>
                  <button
                    onClick={() => { cargarPostulaciones(); cargarEstadisticas(); }}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-green-200 text-green-700 rounded-xl font-medium text-sm hover:bg-green-50 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Actualizar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando postulaciones...</p>
              </div>
            </div>
          ) : postulaciones.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-gray-600">No se encontraron postulaciones</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Candidato</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cargo</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Distrito</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPostulaciones.map((postulacion) => {
                      const estadoColors = coloresEstado[postulacion.estado_postulacion] || coloresEstado['Nuevo'];
                      return (
                        <tr key={postulacion.id_postulacion} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center text-white font-semibold text-sm">
                                {getInitials(postulacion.nombre, postulacion.apellido)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{postulacion.nombre} {postulacion.apellido}</p>
                                <p className="text-xs text-gray-600">{postulacion.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{postulacion.cargo_postulado}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{postulacion.distrito}</td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${estadoColors.bg} ${estadoColors.border}`}>
                              <div className={`w-2 h-2 rounded-full ${estadoColors.dot}`}></div>
                              <span className={`text-xs font-semibold ${estadoColors.text}`}>{postulacion.estado_postulacion}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {new Date(postulacion.fecha_postulacion).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleVerPerfil(postulacion)}
                                className="p-2 text-[#7B1FA2] hover:bg-purple-50 rounded-lg transition-all"
                                title="Ver perfil"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleVerCV(postulacion)}
                                disabled={loadingCV}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
                                title="Ver CV"
                              >
                                {loadingCV ? (
                                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => setModalEliminar(postulacion)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Vista de tarjetas - móvil */}
              <div className="md:hidden divide-y divide-gray-100">
                {paginatedPostulaciones.map((postulacion) => {
                  const estadoColors = coloresEstado[postulacion.estado_postulacion] || coloresEstado['Nuevo'];
                  return (
                    <div key={postulacion.id_postulacion} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {getInitials(postulacion.nombre, postulacion.apellido)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 break-words">{postulacion.nombre} {postulacion.apellido}</p>
                          <p className="text-xs text-gray-600 break-words">{postulacion.email}</p>
                        </div>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border flex-shrink-0 ${estadoColors.bg} ${estadoColors.border}`}>
                          <div className={`w-2 h-2 rounded-full ${estadoColors.dot}`}></div>
                          <span className={`text-xs font-semibold ${estadoColors.text}`}>{postulacion.estado_postulacion}</span>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-xs text-gray-500">Cargo</span>
                          <p className="text-gray-800 break-words">{postulacion.cargo_postulado}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Distrito</span>
                          <p className="text-gray-800 break-words">{postulacion.distrito}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Fecha</span>
                          <p className="text-gray-800">{new Date(postulacion.fecha_postulacion).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleVerPerfil(postulacion)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[#7B1FA2] bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-medium transition-all"
                        >
                          <FileText className="w-4 h-4" />
                          Perfil
                        </button>
                        <button
                          onClick={() => handleVerCV(postulacion)}
                          disabled={loadingCV}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                        >
                          <Eye className="w-4 h-4" />
                          CV
                        </button>
                        <button
                          onClick={() => setModalEliminar(postulacion)}
                          className="flex items-center justify-center p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Paginación */}
              {postulaciones.length > 0 && (
                <div className="border-t border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
                  <div className="text-sm text-gray-600 text-center sm:text-left">
                    Mostrando <span className="font-semibold">{page * rowsPerPage + 1}</span> a{' '}
                    <span className="font-semibold">{Math.min((page + 1) * rowsPerPage, postulaciones.length)}</span> de{' '}
                    <span className="font-semibold">{postulaciones.length}</span>
                  </div>

                  <div className="flex items-center flex-wrap justify-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="p-2 text-gray-600 hover:bg-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i).map(i => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          page === i
                            ? 'bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white'
                            : 'hover:bg-white text-gray-600'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page >= totalPages - 1}
                      className="p-2 text-gray-600 hover:bg-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <select
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#A3C644]"
                  >
                    <option value={6}>6 por página</option>
                    <option value={12}>12 por página</option>
                    <option value={24}>24 por página</option>
                    <option value={48}>48 por página</option>
                  </select>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Perfil */}
      {modalPerfil && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] p-4 sm:p-6 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#7B1FA2] font-bold flex-shrink-0">
                  {getInitials(modalPerfil.nombre, modalPerfil.apellido)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white break-words">{modalPerfil.nombre} {modalPerfil.apellido}</h2>
                  <p className="text-white/80 text-sm">Perfil del Candidato</p>
                </div>
              </div>
              <button onClick={() => setModalPerfil(null)} className="text-white hover:bg-white/20 p-2 rounded-lg transition-all flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Info Personal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Nombre Completo</label>
                  <p className="text-gray-900 font-semibold mt-1">{modalPerfil.nombre} {modalPerfil.apellido}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Cargo</label>
                  <p className="text-gray-900 font-semibold mt-1">{modalPerfil.cargo_postulado}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Distrito</label>
                  <p className="text-gray-900 font-semibold mt-1">{modalPerfil.distrito}</p>
                </div>
                <div className="min-w-0">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                  <p className="text-gray-900 font-semibold mt-1 break-words">{modalPerfil.email}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Teléfono</label>
                  <p className="text-gray-900 font-semibold mt-1">{modalPerfil.telefono}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Estado</label>
                  <select
                    value={modalPerfil.estado_postulacion}
                    onChange={(e) => handleCambiarEstado(modalPerfil.id_postulacion, e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644]"
                  >
                    {estadosDisponibles.map(estado => (
                      <option key={estado.id} value={estado.descripcion}>{estado.descripcion}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Notas y Comentarios</h3>
                
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Agregar una nota..."
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAgregarComentario()}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644]"
                  />
                  <button
                    onClick={handleAgregarComentario}
                    disabled={!nuevoComentario.trim()}
                    className="px-4 py-2.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-lg font-medium text-sm disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {comentarios.length === 0 ? (
                    <p className="text-gray-600 text-sm text-center py-4">No hay notas registradas</p>
                  ) : (
                    comentarios.map((comentario) => (
                      <div key={comentario.id_comentario} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-gray-900 text-sm mb-2">{comentario.comentario}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(comentario.fecha_comentario).toLocaleString('es-ES')}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-4 sm:p-6 flex justify-end gap-3">
              <button
                onClick={() => setModalPerfil(null)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal CV - Rediseñado */}
      {modalCV && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header - Minimalista */}
            <div className="bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] p-4 flex items-center justify-between gap-2 sticky top-0 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-white truncate">CV - {modalCV.nombre} {modalCV.apellido}</h2>
                  <p className="text-white/80 text-xs truncate">{modalCV.cargo_postulado}</p>
                </div>
              </div>
              <button
                onClick={cerrarModalCV}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-all flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden relative">
              {loadingCV ? (
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-gray-700 font-medium">Cargando CV...</p>
                  <p className="text-gray-500 text-sm mt-2">Por favor espera un momento</p>
                </div>
              ) : cvUrl && modalCV ? (
                <>
                  <iframe
                    key={modalCV.id_postulacion}
                    src={cvUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="CV PDF"
                    className="rounded-none"
                    onError={() => {
                      console.error('Error al cargar iframe');
                      setCvUrl(null);
                    }}
                  />
                  {/* Watermark sutil */}
                  <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                    <p className="text-xs text-gray-600 font-medium">📄 Documento PDF</p>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-gray-900 font-semibold mb-1">No se pudo cargar el CV</p>
                  <p className="text-gray-500 text-sm">Verifica que el archivo exista o intenta nuevamente</p>
                  <button
                    onClick={() => modalCV && handleVerCV(modalCV)}
                    className="mt-4 px-4 py-2.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              )}
            </div>

            {/* Footer - Minimalista */}
            <div className="bg-white border-t border-gray-200 p-3 flex items-center justify-between gap-2">
              <div className="text-xs text-gray-600 min-w-0">
                <span className="font-medium truncate block">{modalCV.email}</span>
              </div>
              <button
                onClick={cerrarModalCV}
                className="px-4 py-1.5 text-gray-700 text-sm hover:bg-gray-100 rounded-lg transition-all flex-shrink-0"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
            <div className="bg-red-50 p-6 border-b border-red-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-lg font-bold text-red-900">Confirmar Eliminación</h2>
              </div>
              <p className="text-sm text-red-800 mt-2">Esta acción no se puede deshacer</p>
            </div>

            <div className="p-6">
              <p className="text-gray-900 font-medium mb-4">¿Estás seguro de que deseas eliminar la postulación de:</p>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(modalEliminar.nombre, modalEliminar.apellido)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{modalEliminar.nombre} {modalEliminar.apellido}</p>
                    <p className="text-xs text-gray-600">{modalEliminar.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cargo:</span>
                    <span className="font-medium text-gray-900">{modalEliminar.cargo_postulado}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Distrito:</span>
                    <span className="font-medium text-gray-900">{modalEliminar.distrito}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-6">Se eliminará toda la información del candidato, incluyendo su CV y comentarios.</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setModalEliminar(null)}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEliminar}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium text-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostulacionesDashboard;