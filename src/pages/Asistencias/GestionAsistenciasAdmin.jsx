import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, PencilSquareIcon, CalendarIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { obtenerTodasAsistenciasAdmin, modificarAsistenciaAdmin } from '../../services/api';

const GestionAsistenciasAdmin = () => {
  const [asistencias, setAsistencias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [asistenciaSeleccionada, setAsistenciaSeleccionada] = useState(null);
  const [estadoRecepcion, setEstadoRecepcion] = useState(null);
  const [estadoTerapeuta, setEstadoTerapeuta] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Estados para notificaciones - MISMO ESTILO QUE EN AGENDA
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    // Establecer fechas por defecto (semana actual: lunes a sábado)
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

    // Calcular el lunes de esta semana
    const lunes = new Date(hoy);
    const diasDesdeElLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    lunes.setDate(hoy.getDate() - diasDesdeElLunes);

    // Calcular el sábado de esta semana
    const sabado = new Date(lunes);
    sabado.setDate(lunes.getDate() + 5);

    // Formatear fechas sin conversión a UTC
    const formatearFecha = (fecha) => {
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const fechaInicioStr = formatearFecha(lunes);
    const fechaFinStr = formatearFecha(sabado);

    setFechaInicio(fechaInicioStr);
    setFechaFin(fechaFinStr);

    cargarAsistencias(fechaInicioStr, fechaFinStr);
  }, []);

  const cargarAsistencias = async (inicio, fin) => {
    if (!inicio || !fin) {
      setSnackbarMessage('Seleccione un rango de fechas');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      return;
    }

    setCargando(true);
    try {
      const data = await obtenerTodasAsistenciasAdmin(inicio || fechaInicio, fin || fechaFin);
      setAsistencias(data.asistencias || []);
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
      setSnackbarMessage('Error al cargar asistencias');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    } finally {
      setCargando(false);
    }
  };

  const handleBuscar = () => {
    cargarAsistencias(fechaInicio, fechaFin);
  };

  const abrirModal = (asistencia) => {
    setAsistenciaSeleccionada(asistencia);
    setEstadoRecepcion(asistencia.recepcion_estado_id || null);
    setEstadoTerapeuta(asistencia.terapeuta_estado_id || null);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setAsistenciaSeleccionada(null);
    setEstadoRecepcion(null);
    setEstadoTerapeuta(null);
  };

  const handleGuardarCambios = async () => {
    if (!asistenciaSeleccionada) return;

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      setSnackbarMessage('No se pudo obtener información del usuario');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      return;
    }

    setGuardando(true);
    try {
      await modificarAsistenciaAdmin(
        asistenciaSeleccionada.cita_id,
        estadoRecepcion,
        estadoTerapeuta,
        user.id
      );

      // ✅ SNACKBAR DE ÉXITO - IGUAL QUE EN AGENDA
      setSnackbarMessage(`✅ Asistencia #${asistenciaSeleccionada.cita_id} actualizada correctamente`);
      setSnackbarSeverity('success');
      setShowSnackbar(true);
      
      cerrarModal();
      cargarAsistencias(fechaInicio, fechaFin);
    } catch (error) {
      console.error('Error al modificar asistencia:', error);
      setSnackbarMessage(error.response?.data?.message || 'Error al modificar asistencia');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    } finally {
      setGuardando(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  };

  const getEstadoTexto = (estadoId) => {
    switch (estadoId) {
      case 7:
        return 'Asistió';
      case 6:
        return 'Sesión Dictada';
      default:
        return 'Sin marcar';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Snackbar de notificaciones - IDÉNTICO AL DE AGENDA */}
      {showSnackbar && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-lg border transform transition-all duration-300 ${
          snackbarSeverity === 'success'
            ? 'bg-white border-gray-100'
            : 'bg-white border-red-100'
        } flex items-center gap-2.5`}>
          <div className={`w-1.5 h-1.5 rounded-full ${snackbarSeverity === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`}></div>
          <span className="text-xs font-medium text-gray-700">{snackbarMessage}</span>
          <button onClick={() => setShowSnackbar(false)} className="ml-2">
            <XMarkIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <ShieldCheckIcon className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Asistencias</h1>
            <p className="text-gray-600">Panel de administrador - Corregir y modificar estados</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Fecha Inicio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Botón Buscar */}
          <div className="flex items-end">
            <button
              onClick={handleBuscar}
              disabled={cargando}
              className="w-full px-6 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all disabled:opacity-50"
            >
              {cargando ? 'Cargando...' : 'Buscar'}
            </button>
          </div>
        </div>
      </div>

      {/* Estadística Total */}
      {!cargando && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Total de Asistencias</p>
              <p className="text-4xl font-bold text-purple-900">{asistencias.length}</p>
            </div>
            <CalendarIcon className="w-16 h-16 text-purple-400" />
          </div>
        </div>
      )}

      {/* Tabla de Asistencias */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Cita ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Paciente</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Terapeuta</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Fecha Cita</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Recepción</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Terapeuta</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cargando ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
                      <span className="text-gray-600">Cargando asistencias...</span>
                    </div>
                  </td>
                </tr>
              ) : asistencias.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <CheckCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No se encontraron asistencias en el rango seleccionado</p>
                  </td>
                </tr>
              ) : (
                asistencias
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                  <tr key={item.id} className="hover:bg-purple-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      #{item.cita_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.paciente_nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.terapeuta_nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.fecha_cita ? formatearFecha(item.fecha_cita) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {item.recepcion_marco ? (
                        <>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.recepcion_estado_id === 7
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {getEstadoTexto(item.recepcion_estado_id)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.recepcion_fecha ? formatearFecha(item.recepcion_fecha) : ''}
                          </p>
                        </>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                          Sin marcar
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.terapeuta_marco ? (
                        <>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.terapeuta_estado_id === 7
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {getEstadoTexto(item.terapeuta_estado_id)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.terapeuta_fecha ? formatearFecha(item.terapeuta_fecha) : ''}
                          </p>
                        </>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                          Sin marcar
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => abrirModal(item)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-all"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Modificar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {!cargando && asistencias.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, asistencias.length)} de {asistencias.length} asistencias
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  Primero
                </button>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  Anterior
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(Math.ceil(asistencias.length / rowsPerPage), 3) }, (_, i) => {
                    const totalPages = Math.ceil(asistencias.length / rowsPerPage);
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
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          page === pageNum
                            ? 'bg-purple-600 text-white'
                            : 'hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(asistencias.length / rowsPerPage) - 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  Siguiente
                </button>
                <button
                  onClick={() => setPage(Math.ceil(asistencias.length / rowsPerPage) - 1)}
                  disabled={page >= Math.ceil(asistencias.length / rowsPerPage) - 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  Último
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Modificación */}
      {modalAbierto && asistenciaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="bg-purple-600 px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-white">Modificar Asistencia - Cita #{asistenciaSeleccionada.cita_id}</h2>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6">
              {/* Información de la Cita */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1"><span className="font-semibold">Paciente:</span> {asistenciaSeleccionada.paciente_nombre}</p>
                <p className="text-sm text-gray-600 mb-1"><span className="font-semibold">Terapeuta:</span> {asistenciaSeleccionada.terapeuta_nombre}</p>
                <p className="text-sm text-gray-600"><span className="font-semibold">Fecha:</span> {formatearFecha(asistenciaSeleccionada.fecha_cita)}</p>
              </div>

              {/* Estado de Recepción */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Estado de Recepción/Admisión
                </label>
                <p className="text-xs text-gray-500 mb-3">Haz clic en la opción seleccionada para desmarcarla</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setEstadoRecepcion(estadoRecepcion === 7 ? null : 7)}
                    className={`py-3 px-4 rounded-lg font-bold transition-all ring-offset-1 ${
                      estadoRecepcion === 7
                        ? 'bg-green-600 text-white ring-2 ring-green-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-800'
                    }`}
                  >
                    ✓ Asistió
                  </button>
                  <button
                    onClick={() => setEstadoRecepcion(estadoRecepcion === 6 ? null : 6)}
                    className={`py-3 px-4 rounded-lg font-bold transition-all ring-offset-1 ${
                      estadoRecepcion === 6
                        ? 'bg-orange-600 text-white ring-2 ring-orange-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-800'
                    }`}
                  >
                    ◆ Sesión Dictada
                  </button>
                </div>
                {estadoRecepcion === null && (
                  <p className="mt-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                    Sin marcar — se guardará como pendiente
                  </p>
                )}
              </div>

              {/* Estado de Terapeuta */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Estado de Terapeuta
                </label>
                <p className="text-xs text-gray-500 mb-3">Haz clic en la opción seleccionada para desmarcarla</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setEstadoTerapeuta(estadoTerapeuta === 7 ? null : 7)}
                    className={`py-3 px-4 rounded-lg font-bold transition-all ring-offset-1 ${
                      estadoTerapeuta === 7
                        ? 'bg-green-600 text-white ring-2 ring-green-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-800'
                    }`}
                  >
                    ✓ Asistió
                  </button>
                  <button
                    onClick={() => setEstadoTerapeuta(estadoTerapeuta === 6 ? null : 6)}
                    className={`py-3 px-4 rounded-lg font-bold transition-all ring-offset-1 ${
                      estadoTerapeuta === 6
                        ? 'bg-orange-600 text-white ring-2 ring-orange-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-800'
                    }`}
                  >
                    ◆ Sesión Dictada
                  </button>
                </div>
                {estadoTerapeuta === null && (
                  <p className="mt-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                    Sin marcar — se guardará como pendiente
                  </p>
                )}
              </div>

              {/* Advertencia */}
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-bold">⚠️ Advertencia:</span> Esta acción sobrescribirá los estados marcados por admisión y terapeuta.
                </p>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3">
                <button
                  onClick={cerrarModal}
                  disabled={guardando}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarCambios}
                  disabled={guardando}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionAsistenciasAdmin;