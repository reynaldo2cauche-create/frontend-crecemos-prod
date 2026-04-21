import React, { useState, useEffect } from 'react';
import { ROLES } from '../../constants/roles';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import {
  Eye,
  Trash2,
  Calendar,
  User,
  Trophy,
  Download,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  obtenerHistorial,
  obtenerDetalle,
  eliminarSorteo,
  descargarArchivoPDF
} from '../../services/sorteoService';

const HistorialSorteos = ({ onClose }) => {
  const { user } = useCurrentUser();
  const canDelete = user?.rol?.id === ROLES.ADMINISTRADOR;

  const [sorteos, setSorteos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalSorteos, setTotalSorteos] = useState(0);
  const [error, setError] = useState(null);

  const [selectedSorteo, setSelectedSorteo] = useState(null);
  const [showDetalleDialog, setShowDetalleDialog] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sorteoToDelete, setSorteoToDelete] = useState(null);

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    cargarHistorial();
  }, [page, rowsPerPage]);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await obtenerHistorial({
        page: page + 1,
        limit: rowsPerPage
      });

      setSorteos(response.data || response.sorteos || []);
      setTotalSorteos(response.total || response.data?.length || 0);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setError('No se pudo cargar el historial de sorteos');
      showMessage('No se pudo cargar el historial de sorteos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = async (sorteoId) => {
    try {
      setLoadingDetalle(true);
      const response = await obtenerDetalle(sorteoId);
      setSelectedSorteo(response.data || response);
      setShowDetalleDialog(true);
    } catch (err) {
      console.error('Error al cargar detalle:', err);
      showMessage('No se pudo cargar el detalle del sorteo', 'error');
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleEliminar = (sorteo) => {
    setSorteoToDelete(sorteo);
    setShowDeleteDialog(true);
  };

  const confirmarEliminacion = async () => {
    try {
      await eliminarSorteo(sorteoToDelete.id);
      setShowDeleteDialog(false);
      setSorteoToDelete(null);
      showMessage('Sorteo eliminado correctamente', 'success');
      cargarHistorial();
    } catch (err) {
      console.error('Error al eliminar sorteo:', err);
      showMessage('No se pudo eliminar el sorteo', 'error');
    }
  };

  const handleExportarPDF = async (sorteoId) => {
    try {
      await descargarArchivoPDF(sorteoId, `sorteo_${sorteoId}_${new Date().getTime()}.pdf`);
      showMessage('PDF descargado correctamente', 'success');
    } catch (err) {
      console.error('Error al exportar PDF:', err);
      showMessage('No se pudo exportar el PDF', 'error');
    }
  };

  const showMessage = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 4000);
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNombreCompleto = (paciente) => {
    return `${paciente.nombres} ${paciente.apellido_paterno} ${paciente.apellido_materno || ''}`.trim();
  };

  const totalPages = Math.ceil(totalSorteos / rowsPerPage);

  if (loading && sorteos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#7B1FA2] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Snackbar */}
      {showSnackbar && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border transform transition-all duration-300 ${
          snackbarSeverity === 'success'
            ? 'bg-white border-green-100'
            : 'bg-white border-red-100'
        } flex items-center gap-2.5`}>
          <div className={`w-1.5 h-1.5 rounded-full ${snackbarSeverity === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`}></div>
          <span className="text-xs font-medium text-gray-700">{snackbarMessage}</span>
          <button onClick={() => setShowSnackbar(false)} className="ml-2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Contenido */}
      {sorteos.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-[#7B1FA2]" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay sorteos registrados</h3>
          <p className="text-gray-600">Aún no se han realizado sorteos en el sistema</p>
        </div>
      ) : (
        <>
          {/* Tabla */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre del Sorteo</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Ganadores</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Fecha del Sorteo</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Realizado por</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sorteos.map((sorteo) => (
                    <tr key={sorteo.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white">
                          #{sorteo.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {sorteo.nombre || 'Sin nombre'}
                        </p>
                        {sorteo.descripcion && (
                          <p className="text-xs text-gray-500 mt-1">{sorteo.descripcion}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-bold text-gray-900">{sorteo.cantidad_ganadores}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{formatFecha(sorteo.fecha_sorteo)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{sorteo.registrado_por || 'Sistema'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleVerDetalle(sorteo.id)}
                            className="p-2 hover:bg-purple-50 rounded-lg transition-all group"
                            title="Ver Detalle"
                          >
                            <Eye className="w-4 h-4 text-gray-600 group-hover:text-[#7B1FA2]" />
                          </button>

                          <button
                            onClick={() => handleExportarPDF(sorteo.id)}
                            className="p-2 hover:bg-green-50 rounded-lg transition-all group"
                            title="Exportar PDF"
                          >
                            <Download className="w-4 h-4 text-gray-600 group-hover:text-green-600" />
                          </button>

                          {canDelete && (
                            <button
                              onClick={() => handleEliminar(sorteo)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-all group"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Mostrando <span className="font-semibold text-gray-900">{page * rowsPerPage + 1}</span> a{' '}
                <span className="font-semibold text-gray-900">
                  {Math.min((page + 1) * rowsPerPage, totalSorteos)}
                </span>{' '}
                de <span className="font-semibold text-gray-900">{totalSorteos}</span> sorteos
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-2 w-full sm:w-auto">
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value));
                    setPage(0);
                  }}
                  className="w-full sm:w-auto px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] cursor-pointer"
                >
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                </select>

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
                    <ChevronLeft className="w-4 h-4" />
                  </button>

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
                    <ChevronRight className="w-4 h-4" />
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
        </>
      )}

      {/* Modal de Detalle */}
      {showDetalleDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h2 className="text-xl font-bold text-gray-900">Detalle del Sorteo</h2>
              </div>
              <button
                onClick={() => setShowDetalleDialog(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              {loadingDetalle ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-[#7B1FA2] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : selectedSorteo ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Nombre del Sorteo:</span>
                      <p className="text-sm text-gray-900 font-bold">{selectedSorteo.nombre || 'Sin nombre'}</p>
                    </div>
                    {selectedSorteo.descripcion && (
                      <div>
                        <span className="text-xs font-semibold text-gray-500">Descripción:</span>
                        <p className="text-sm text-gray-900">{selectedSorteo.descripcion}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Fecha:</span>
                      <p className="text-sm text-gray-900">{formatFecha(selectedSorteo.fecha_sorteo)}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Realizado por:</span>
                      <p className="text-sm text-gray-900">{selectedSorteo.registrado_por || 'Sistema'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Ganadores
                    </h3>

                    <div className="space-y-3">
                      {selectedSorteo.ganadores?.map((ganador) => (
                        <div
                          key={ganador.id}
                          className="bg-white border-2 border-gray-100 rounded-xl p-4 flex items-center gap-4 hover:border-[#A3C644] transition-all"
                        >
                          <span className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-bold text-sm">
                            {ganador.posicion}°
                          </span>
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center font-bold text-[#7B1FA2]">
                            {ganador.nombres?.charAt(0)}{ganador.apellido_paterno?.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">{getNombreCompleto(ganador)}</p>
                            <p className="text-xs text-gray-600">DNI: {ganador.numero_documento}</p>
                            {ganador.celular && (
                              <p className="text-xs text-gray-600">📱 {ganador.celular}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">No se pudo cargar el detalle del sorteo</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowDetalleDialog(false)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Confirmar Eliminación</h2>
            </div>

            <div className="p-6">
              <div className="bg-red-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-900">
                  ¿Está seguro que desea eliminar el sorteo <span className="font-bold">"{sorteoToDelete?.descripcion}"</span>?
                </p>
                <p className="text-sm text-red-700 mt-2 font-semibold">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminacion}
                className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialSorteos;