import React, { useState, useEffect } from 'react';
import { Ban, Trash2, Calendar, Clock, User, AlertCircle, Plus, Filter, Search, X, RefreshCw } from 'lucide-react';
import { obtenerBloqueos, eliminarBloqueo } from '../../services/bloqueoService';
import { getTipoBloqueo } from '../../services/catalogoService';
import ModalBloquearHorario from './ModalBloquearHorario';
import DialogMotivo from '../DialogMotivo/DialogMotivo';

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const ListaBloqueos = ({ terapeutas, userId, onBloqueoChange }) => {
  const [bloqueos, setBloqueos] = useState([]);
  const [filteredBloqueos, setFilteredBloqueos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [dialogMotivo, setDialogMotivo] = useState({ open: false, bloqueoId: null });

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
      alert('Error al eliminar el bloqueo');
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
      return `Puntual: ${formatearFecha(bloqueo.fechaInicio)}`;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Horarios Bloqueados</h2>
              <p className="text-sm text-gray-500">Gestión de bloqueos de horarios</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={cargarBloqueos}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
              title="Recargar bloqueos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all flex items-center gap-2 shadow-lg shadow-red-500/30"
            >
              <Plus className="w-4 h-4" />
              Nuevo Bloqueo
            </button>
          </div>
        </div>

        {/* Filtros Activos */}
        {filtrosActivos && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-600/5 to-red-700/5 rounded-xl border border-red-600/20">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-gray-700">Filtros activos:</span>
              </div>

              {filtroTerapeuta && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-red-600/30 text-sm">
                  <span className="font-medium text-red-600">Terapeuta:</span>
                  <span className="text-gray-700">
                    {terapeutas?.find(t => t.id === parseInt(filtroTerapeuta))?.nombres} {terapeutas?.find(t => t.id === parseInt(filtroTerapeuta))?.apellidos}
                  </span>
                </div>
              )}

              {filtroTipoBloqueo && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-red-600/30 text-sm">
                  <span className="font-medium text-red-600">Tipo:</span>
                  <span className="text-gray-700">
                    {tiposBloqueo?.find(t => t.id === parseInt(filtroTipoBloqueo))?.nombre}
                  </span>
                </div>
              )}

              {busquedaMotivo.trim() && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-red-600/30 text-sm">
                  <span className="font-medium text-red-600">Motivo:</span>
                  <span className="text-gray-700">{busquedaMotivo}</span>
                </div>
              )}

              <button
                onClick={limpiarFiltros}
                className="ml-auto flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            </div>
          </div>
        )}

        {/* Buscador y Filtros */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Buscador por motivo */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por motivo..."
                value={busquedaMotivo}
                onChange={(e) => setBusquedaMotivo(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filtro Terapeuta */}
            <select
              value={filtroTerapeuta}
              onChange={(e) => setFiltroTerapeuta(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option value="">Todos los terapeutas</option>
              {terapeutas?.filter(t => t.estado).map(t => (
                <option key={t.id} value={t.id}>
                  {t.nombres} {t.apellidos}
                </option>
              ))}
            </select>

            {/* Filtro Tipo de Bloqueo */}
            <select
              value={filtroTipoBloqueo}
              onChange={(e) => setFiltroTipoBloqueo(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option value="">Todos los tipos</option>
              {tiposBloqueo.map(tipo => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-semibold">{filteredBloqueos.length}</span> bloqueo{filteredBloqueos.length !== 1 ? 's' : ''} encontrado{filteredBloqueos.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Lista de Bloqueos */}
      <div className="space-y-4">
        {filteredBloqueos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ban className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              {filtrosActivos ? 'No se encontraron bloqueos' : 'No hay bloqueos activos'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {filtrosActivos ? 'Intenta ajustar los filtros de búsqueda' : 'Los bloqueos de horarios aparecerán aquí'}
            </p>
          </div>
        ) : (
          paginatedBloqueos.map(bloqueo => (
            <div key={bloqueo.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Terapeuta */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                      {bloqueo.trabajador?.nombres?.[0]}{bloqueo.trabajador?.apellidos?.[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {bloqueo.trabajador?.nombres} {bloqueo.trabajador?.apellidos}
                      </div>
                      <div className="text-sm text-gray-500">
                        {bloqueo.trabajador?.especialidad?.nombre || 'Sin especialidad'}
                      </div>
                    </div>
                  </div>

                  {/* Tipo y Fechas */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{obtenerDescripcionBloqueo(bloqueo)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {bloqueo.todoElDia
                          ? 'Todo el día'
                          : `${formatearHora(bloqueo.horaInicio)} - ${formatearHora(bloqueo.horaFin)}`}
                      </span>
                    </div>
                  </div>

                  {/* Motivo */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Motivo</div>
                        <p className="text-sm text-gray-700">{bloqueo.motivo}</p>
                      </div>
                    </div>
                  </div>

                  {/* Info de Creación */}
                  <div className="text-xs text-gray-400">
                    Bloqueado por {bloqueo.userCrea?.nombres} {bloqueo.userCrea?.apellidos} el{' '}
                    {new Date(bloqueo.createdAt).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Acciones */}
                <button
                  onClick={() => handleEliminarClick(bloqueo.id)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar bloqueo"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {filteredBloqueos.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              Mostrando <span className="font-semibold text-gray-900">{page * rowsPerPage + 1}</span> a{' '}
              <span className="font-semibold text-gray-900">
                {Math.min((page + 1) * rowsPerPage, filteredBloqueos.length)}
              </span>{' '}
              de <span className="font-semibold text-gray-900">{filteredBloqueos.length}</span> bloqueos
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-2 w-full sm:w-auto">
              {/* Selector de filas por página */}
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value));
                  setPage(0);
                }}
                className="w-full sm:w-auto px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                <option value={12}>12 por página</option>
                <option value={24}>24 por página</option>
                <option value={48}>48 por página</option>
              </select>

              {/* Controles de paginación */}
              <div className="flex items-center gap-1 w-full sm:w-auto justify-center">
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

                <div className="flex items-center gap-1">
                  {[...Array(3)].map((_, i) => {
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
                      pageNum < totalPages && (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      )
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
  );
};

export default ListaBloqueos;
