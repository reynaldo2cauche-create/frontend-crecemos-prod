import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Printer,
  X,
  Send,
  Download,
  Paperclip,
  CheckCircle,
  Clock,
  MessageSquare,
  User,
  Calendar,
  AlertCircle,
  FileCheck,
  XCircle
} from 'lucide-react';
import { listarReclamos, obtenerReclamo, responderReclamo, cambiarEstadoReclamo } from '../../services/libroReclamacionesService';
import { libroReclamacionesService } from '../../services/libroReclamaciones';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { generarPDFReclamo } from '../../utils/generarPDFReclamo';

const ESTADO_COLORS = {
  'Registrado': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', icon: Clock },
  'En proceso': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: AlertCircle },
  'Respondido': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: CheckCircle },
  'Cerrado': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', icon: XCircle },
};

const ESTADO_TIMELINE_ICONS = {
  'Registrado': Clock,
  'En proceso': AlertCircle,
  'Respondido': CheckCircle,
  'Cerrado': XCircle,
};

const PanelAdmin = () => {
  const currentUser = useCurrentUser();
  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado_id: '',
    tipo_solicitud_id: '',
    page: 1,
    limit: 12,
  });
  const [total, setTotal] = useState(0);
  const [modalReclamo, setModalReclamo] = useState(null);
  const [modalRespuesta, setModalRespuesta] = useState(false);
  const [respuesta, setRespuesta] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [archivoVisualizando, setArchivoVisualizando] = useState(null);
  const [urlArchivoVisualizando, setUrlArchivoVisualizando] = useState(null);

  // Snackbar de notificaciones
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setSnackbarMessage(mensaje);
    setSnackbarSeverity(tipo);
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 4000);
  };

  const cargarReclamos = useCallback(async (filtrosActuales) => {
    setLoading(true);
    try {
      const response = await listarReclamos(filtrosActuales);
      setReclamos(response.data);
      setTotal(response.total);
    } catch (err) {
      console.error('Error al cargar reclamos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarReclamos(filtros);
  }, [filtros, cargarReclamos]);

  const abrirDetalle = async (id) => {
    try {
      const response = await obtenerReclamo(id);
      setModalReclamo(response.data);
    } catch (err) {
      console.error('Error al cargar detalle:', err);
      mostrarNotificacion('Error al cargar detalle del reclamo', 'error');
    }
  };

  const handleResponder = async () => {
    if (!respuesta.trim()) {
      mostrarNotificacion('Debe escribir una respuesta', 'error');
      return;
    }
    setEnviando(true);
    try {
      await responderReclamo(modalReclamo.id, {
        respuesta_proveedor: respuesta,
        usuario_id: currentUser.id,
      });
      mostrarNotificacion('✓ Respuesta enviada y estado cambiado a "Respondido"', 'success');
      setModalRespuesta(false);
      setRespuesta('');

      // Recargar el detalle del reclamo para mostrar el nuevo estado
      const response = await obtenerReclamo(modalReclamo.id);
      setModalReclamo(response.data);

      // Recargar la lista
      cargarReclamos(filtros);
    } catch (err) {
      mostrarNotificacion('Error al enviar respuesta', 'error');
    } finally {
      setEnviando(false);
    }
  };

  const handleCambiarEstado = async (estadoId) => {
    if (cambiandoEstado) return;
    setCambiandoEstado(true);
    try {
      await cambiarEstadoReclamo(modalReclamo.id, {
        estado_id: estadoId,
        usuario_id: currentUser.id,
        descripcion: 'Cambio de estado desde panel admin',
      });
      mostrarNotificacion('✓ Estado actualizado correctamente', 'success');

      // Recargar el detalle del reclamo para actualizar el historial
      const response = await obtenerReclamo(modalReclamo.id);
      setModalReclamo(response.data);

      // Recargar la lista
      setFiltros(prev => ({ ...prev }));
    } catch (err) {
      console.error('Error completo al cambiar estado:', err);
      mostrarNotificacion('Error al cambiar estado: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setCambiandoEstado(false);
    }
  };

  // Visualizar archivo con autenticación
  const handleVisualizarArchivo = async (doc) => {
    try {
      const urlBlob = await libroReclamacionesService.visualizarArchivoProtegido(doc.ruta_archivo);
      setArchivoVisualizando(doc);
      setUrlArchivoVisualizando(urlBlob);
    } catch (err) {
      console.error('Error al visualizar archivo:', err);
      mostrarNotificacion('Error al cargar el archivo', 'error');
    }
  };

  // Descargar archivo con autenticación
  const handleDescargarArchivo = async (doc) => {
    try {
      const blob = await libroReclamacionesService.descargarArchivoProtegido(doc.ruta_archivo);

      // Crear URL temporal para descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.nombre_original;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      mostrarNotificacion('✓ Archivo descargado correctamente', 'success');
    } catch (err) {
      console.error('Error al descargar archivo:', err);
      mostrarNotificacion('Error al descargar el archivo', 'error');
    }
  };

  // Cerrar visualizador de archivo y limpiar URL
  const handleCerrarVisualizador = () => {
    if (urlArchivoVisualizando) {
      URL.revokeObjectURL(urlArchivoVisualizando);
    }
    setArchivoVisualizando(null);
    setUrlArchivoVisualizando(null);
  };

  const getEstadoBadge = (estado) => {
    const config = ESTADO_COLORS[estado] || ESTADO_COLORS['Registrado'];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text} ${config.border} border`}>
        <Icon className="w-3.5 h-3.5" />
        {estado}
      </span>
    );
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearFechaCorta = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calcular estadísticas
  const stats = {
    total: total,
    registrados: reclamos.filter(r => r.estado?.nombre === 'Registrado').length,
    enProceso: reclamos.filter(r => r.estado?.nombre === 'En proceso').length,
    respondidos: reclamos.filter(r => r.estado?.nombre === 'Respondido').length,
    cerrados: reclamos.filter(r => r.estado?.nombre === 'Cerrado').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Snackbar de notificaciones */}
      {showSnackbar && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-lg border transform transition-all duration-300 ${
          snackbarSeverity === 'success'
            ? 'bg-white border-gray-100'
            : 'bg-white border-red-100'
        } flex items-center gap-2.5`}>
          <div className={`w-1.5 h-1.5 rounded-full ${snackbarSeverity === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`}></div>
          <span className="text-xs font-medium text-gray-700">{snackbarMessage}</span>
          <button onClick={() => setShowSnackbar(false)} className="ml-2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 pt-6 pb-2">
        {/* Header estilo PromocionesPage */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <FileText className="w-8 h-8 text-[#7B1FA2]" />
              <h1 className="text-3xl font-bold text-gray-900">Libro de Reclamaciones</h1>
            </div>
            <p className="text-sm text-gray-500">
              Gestiona reclamos y quejas de consumidores
            </p>
          </div>
        </div>

        {/* Filtros modernos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value, page: 1 }))}
                  placeholder="Código, nombre, documento..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            {/* Filtro Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filtros.estado_id}
                  onChange={(e) => setFiltros(prev => ({ ...prev, estado_id: e.target.value, page: 1 }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent transition-all outline-none appearance-none bg-white"
                >
                  <option value="">Todos los estados</option>
                  <option value="1">Registrado</option>
                  <option value="2">En proceso</option>
                  <option value="3">Respondido</option>
                  <option value="4">Cerrado</option>
                </select>
              </div>
            </div>

            {/* Filtro Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de solicitud
              </label>
              <select
                value={filtros.tipo_solicitud_id}
                onChange={(e) => setFiltros(prev => ({ ...prev, tipo_solicitud_id: e.target.value, page: 1 }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent transition-all outline-none appearance-none bg-white"
              >
                <option value="">Todos los tipos</option>
                <option value="1">Reclamo</option>
                <option value="2">Queja</option>
              </select>
            </div>
          </div>
        </div>

        {/* Estadísticas - Estilo SesionesPage */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-50 text-purple-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 leading-none">{stats.total}</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">Total Reclamos</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50 text-blue-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 leading-none">{stats.registrados}</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">Registrados</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-yellow-50 text-yellow-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 leading-none">{stats.enProceso}</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">En Proceso</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-50 text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 leading-none">{stats.respondidos}</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">Respondidos</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-50 text-gray-600">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 leading-none">{stats.cerrados}</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">Cerrados</div>
              </div>
            </div>
          </div>
        )}

        {/* Cards de reclamos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#7B1FA2] border-r-transparent"></div>
            <p className="mt-4 text-gray-500">Cargando reclamos...</p>
          </div>
        ) : reclamos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay reclamos</h3>
            <p className="text-gray-500">No se encontraron reclamos con los filtros aplicados</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {reclamos.map((reclamo) => (
                <div
                  key={reclamo.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => abrirDetalle(reclamo.id)}
                >
                  {/* Header del card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Código</p>
                      <p className="text-sm font-bold text-[#7B1FA2]">{reclamo.codigo_reclamo}</p>
                    </div>
                    {getEstadoBadge(reclamo.estado?.nombre)}
                  </div>

                  {/* Información del consumidor */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-semibold text-gray-900">
                        {reclamo.nombres} {reclamo.apellidos}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">
                      {reclamo.tipo_documento} - {reclamo.numero_documento}
                    </p>
                  </div>

                  {/* Tipo y fecha */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                      <FileCheck className="w-3.5 h-3.5" />
                      {reclamo.tipoSolicitud?.nombre}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatearFechaCorta(reclamo.fecha_registro)}
                    </span>
                  </div>

                  {/* Botón ver detalle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirDetalle(reclamo.id);
                    }}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7B1FA2] text-white rounded-xl hover:bg-[#6A1B9A] transition-all shadow-sm hover:shadow-md text-sm font-semibold"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Detalle
                  </button>
                </div>
              ))}
            </div>

            {/* Paginación mejorada */}
            {total > filtros.limit && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex justify-between items-center">
                <p className="text-sm font-medium text-gray-600">
                  Mostrando <span className="text-purple-600 font-bold">{((filtros.page - 1) * filtros.limit) + 1} - {Math.min(filtros.page * filtros.limit, total)}</span> de <span className="text-purple-600 font-bold">{total}</span> reclamos
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={filtros.page === 1}
                    onClick={() => setFiltros(prev => ({ ...prev, page: prev.page - 1 }))}
                    className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={filtros.page * filtros.limit >= total}
                    onClick={() => setFiltros(prev => ({ ...prev, page: prev.page + 1 }))}
                    className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Detalle MEJORADO */}
      {modalReclamo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header del modal */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0]">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-white" />
                <div>
                  <h2 className="text-xl font-bold text-white">Detalle del Reclamo</h2>
                  <p className="text-sm text-purple-100">{modalReclamo.codigo_reclamo}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => await generarPDFReclamo(modalReclamo)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#7B1FA2] rounded-xl hover:bg-purple-50 transition-all shadow-sm hover:shadow-md font-semibold"
                  title="Descargar PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Imprimir PDF</span>
                </button>
                <button
                  onClick={() => setModalReclamo(null)}
                  className="text-white hover:bg-white/20 p-2 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenido del modal con scroll */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna izquierda - Información principal (2/3) */}
                <div className="lg:col-span-2 space-y-5">
                  {/* Estado actual */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-purple-900">Estado actual</p>
                      {getEstadoBadge(modalReclamo.estado?.nombre)}
                    </div>
                  </div>

                  {/* Información del consumidor */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-5 h-5 text-[#7B1FA2]" />
                      <h3 className="font-bold text-gray-900">Información del Consumidor</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Nombre completo</p>
                        <p className="text-sm font-medium text-gray-900">
                          {modalReclamo.nombres} {modalReclamo.apellidos}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Documento</p>
                        <p className="text-sm font-medium text-gray-900">
                          {modalReclamo.tipo_documento} - {modalReclamo.numero_documento}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-sm font-medium text-gray-900">{modalReclamo.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Teléfono</p>
                        <p className="text-sm font-medium text-gray-900">{modalReclamo.telefono}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Dirección</p>
                        <p className="text-sm font-medium text-gray-900">{modalReclamo.direccion || 'No registrado'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Tipo</p>
                        <p className="text-sm font-medium text-gray-900">{modalReclamo.tipoSolicitud?.nombre}</p>
                      </div>
                    </div>

                    {/* Mostrar apoderado si es menor de edad */}
                    {modalReclamo.menor_edad && modalReclamo.datos_apoderado && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Apoderado (Menor de Edad)</p>
                        <p className="text-sm font-medium text-gray-900">{modalReclamo.datos_apoderado}</p>
                      </div>
                    )}
                  </div>

                  {/* Detalle del reclamo */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-5 h-5 text-[#7B1FA2]" />
                      <h3 className="font-bold text-gray-900">Detalle del Reclamo</h3>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {modalReclamo.detalle_reclamo}
                    </p>
                  </div>

                  {/* Pedido del consumidor */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <FileCheck className="w-5 h-5 text-[#7B1FA2]" />
                      <h3 className="font-bold text-gray-900">Pedido del Consumidor</h3>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {modalReclamo.pedido_consumidor}
                    </p>
                  </div>

                  {/* Archivos adjuntos */}
                  {modalReclamo.documentos && modalReclamo.documentos.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Paperclip className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-blue-900">
                          Archivos Adjuntos ({modalReclamo.documentos.length})
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {modalReclamo.documentos.map((doc, index) => {
                          return (
                          <div
                            key={doc.id || index}
                            className="flex items-center justify-between bg-white p-3 rounded-lg hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{doc.nombre_original}</p>
                                <p className="text-xs text-gray-500">
                                  {doc.mime} - {(doc.tamaño / 1024).toFixed(2)} KB
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleVisualizarArchivo(doc)}
                                className="flex items-center gap-1 text-[#7B1FA2] hover:text-[#6A1B9A] text-sm font-medium transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                Ver
                              </button>
                              <button
                                onClick={() => handleDescargarArchivo(doc)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                Descargar
                              </button>
                            </div>
                          </div>
                        );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Respuesta del proveedor */}
                  {modalReclamo.respuesta_proveedor ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h3 className="font-bold text-green-900">Respuesta Enviada</h3>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-4 rounded-lg mb-2">
                        {modalReclamo.respuesta_proveedor}
                      </p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatearFecha(modalReclamo.fecha_respuesta)}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setModalRespuesta(true)}
                      className="w-full bg-[#7B1FA2] hover:bg-[#6A1B9A] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Responder Reclamo
                    </button>
                  )}

                  {/* Cambiar estado */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-bold text-gray-900 mb-3">Cambiar Estado</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: 1, label: 'Registrado', color: 'bg-blue-500 hover:bg-blue-600' },
                        { id: 2, label: 'En proceso', color: 'bg-yellow-500 hover:bg-yellow-600' },
                        { id: 3, label: 'Respondido', color: 'bg-green-500 hover:bg-green-600' },
                        { id: 4, label: 'Cerrado', color: 'bg-gray-500 hover:bg-gray-600' },
                      ].map(({ id, label, color }) => (
                        <button
                          key={id}
                          onClick={() => handleCambiarEstado(id)}
                          disabled={cambiandoEstado || modalReclamo.estado?.id === id}
                          className={`px-4 py-2.5 ${color} text-white rounded-xl text-sm font-semibold
                            disabled:opacity-40 disabled:cursor-not-allowed
                            transition-all shadow-sm hover:shadow-md`}
                        >
                          {cambiandoEstado ? '...' : label}
                        </button>
                      ))}
                    </div>
                    {modalReclamo.estado && (
                      <p className="text-xs text-gray-500 mt-3">
                        Estado actual: <strong className="text-purple-600">{modalReclamo.estado.nombre}</strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Columna derecha - Seguimiento/Historial (1/3) */}
                <div className="lg:col-span-1">
                  <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-0">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-[#7B1FA2]" />
                      <h3 className="font-bold text-gray-900">Historial de Seguimiento</h3>
                    </div>

                    {/* Timeline vertical */}
                    <div className="space-y-4">
                      {modalReclamo.seguimientos && modalReclamo.seguimientos.length > 0 ? (
                        modalReclamo.seguimientos
                          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                          .map((seguimiento, index) => {
                            const IconComponent = ESTADO_TIMELINE_ICONS[seguimiento.estado?.nombre] || Clock;
                            const config = ESTADO_COLORS[seguimiento.estado?.nombre] || ESTADO_COLORS['Registrado'];
                            const isLast = index === modalReclamo.seguimientos.length - 1;

                            return (
                              <div key={seguimiento.id} className="relative">
                                {/* Línea conectora */}
                                {!isLast && (
                                  <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-200"></div>
                                )}

                                <div className="flex gap-3">
                                  {/* Icono del estado */}
                                  <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.bg} ${config.border} border-2 flex items-center justify-center`}>
                                    <IconComponent className={`w-4 h-4 ${config.text}`} />
                                  </div>

                                  {/* Contenido */}
                                  <div className="flex-1 pb-4">
                                    <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                                      <div className="flex items-start justify-between mb-1">
                                        <span className={`text-xs font-bold ${config.text}`}>
                                          {seguimiento.estado?.nombre}
                                        </span>
                                      </div>

                                      <p className="text-xs text-gray-600 mb-2">
                                        {seguimiento.descripcion}
                                      </p>

                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                          {new Date(seguimiento.fecha).toLocaleDateString('es-PE', {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                      </div>

                                      {seguimiento.usuario && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                          <User className="w-3 h-3" />
                                          <span>
                                            {seguimiento.usuario.nombre} {seguimiento.usuario.apellido}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <div className="text-center py-8">
                          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Sin historial de seguimiento</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Respuesta */}
      {modalRespuesta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-[#7B1FA2]" />
                <h2 className="text-xl font-bold text-gray-900">Responder Reclamo</h2>
              </div>
              <button
                onClick={() => setModalRespuesta(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <textarea
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              rows={8}
              placeholder="Escriba la respuesta detallada al reclamo del consumidor..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent mb-4 outline-none resize-none"
            />

            <button
              onClick={handleResponder}
              disabled={enviando}
              className="w-full bg-[#7B1FA2] hover:bg-[#6A1B9A] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
              {enviando ? 'Enviando...' : 'Enviar Respuesta'}
            </button>
          </div>
        </div>
      )}

      {/* Modal Visualizador de Archivos */}
      {archivoVisualizando && urlArchivoVisualizando && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-[70]">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{archivoVisualizando.nombre_original}</h2>
                <p className="text-sm text-gray-500">
                  {archivoVisualizando.mime} - {(archivoVisualizando.tamaño / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={handleCerrarVisualizador}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-gray-100 p-4" style={{ minHeight: '500px' }}>
              {archivoVisualizando.mime.startsWith('image/') ? (
                <div className="w-full h-full flex items-start justify-center">
                  <img
                    src={urlArchivoVisualizando}
                    alt={archivoVisualizando.nombre_original}
                    className="max-w-full h-auto rounded-lg shadow-lg"
                    style={{ cursor: 'zoom-in' }}
                    onClick={(e) => {
                      if (e.target.style.transform === 'scale(1.5)') {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.cursor = 'zoom-in';
                      } else {
                        e.target.style.transform = 'scale(1.5)';
                        e.target.style.cursor = 'zoom-out';
                      }
                    }}
                  />
                </div>
              ) : archivoVisualizando.mime === 'application/pdf' ? (
                <iframe
                  src={urlArchivoVisualizando}
                  className="w-full h-full min-h-[600px] rounded-lg"
                  title={archivoVisualizando.nombre_original}
                />
              ) : (
                <div className="text-center p-8">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Este tipo de archivo no se puede previsualizar</p>
                  <button
                    onClick={() => handleDescargarArchivo(archivoVisualizando)}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Descargar Archivo
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white flex justify-end">
              <button
                onClick={() => handleDescargarArchivo(archivoVisualizando)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                Descargar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelAdmin;
