import React, { useState, useEffect } from 'react';
import { UserIcon, CalendarIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { obtenerTerapeutas, obtenerAsistenciasPorTerapeuta } from '../../services/api';

const AsistenciasPorTerapeuta = () => {
  const [terapeutas, setTerapeutas] = useState([]);
  const [terapeutaSeleccionado, setTerapeutaSeleccionado] = useState(null);
  const [asistencias, setAsistencias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    completadas: 0,
    noAsistio: 0,
    pendientes: 0
  });

  useEffect(() => {
    cargarTerapeutas();

    // Establecer fechas por defecto (semana actual: lunes a sábado)
    const hoy = new Date();
    const diaSemana = hoy.getDay();

    const lunes = new Date(hoy);
    const diasDesdeElLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    lunes.setDate(hoy.getDate() - diasDesdeElLunes);

    const sabado = new Date(lunes);
    sabado.setDate(lunes.getDate() + 5);

    const formatearFecha = (fecha) => {
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setFechaInicio(formatearFecha(lunes));
    setFechaFin(formatearFecha(sabado));
  }, []);

  const cargarTerapeutas = async () => {
    try {
      const data = await obtenerTerapeutas();
      setTerapeutas(data);
    } catch (error) {
      console.error('Error al cargar terapeutas:', error);
    }
  };

  const cargarAsistencias = async (terapeutaId) => {
    if (!fechaInicio || !fechaFin) {
      alert('Seleccione un rango de fechas');
      return;
    }

    setCargando(true);
    try {
      const data = await obtenerAsistenciasPorTerapeuta(terapeutaId, fechaInicio, fechaFin);
      setAsistencias(data.asistencias || []);
      calcularEstadisticas(data.asistencias || []);
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
      alert('Error al cargar asistencias');
    } finally {
      setCargando(false);
    }
  };

  const calcularEstadisticas = (data) => {
    const total = data.length;
    const completadas = data.filter(a => a.terapeuta_estado_id === 7).length;
    const sesionDictada = data.filter(a => a.terapeuta_estado_id === 6).length;
    const pendientes = data.filter(a => !a.terapeuta_marco).length;

    setEstadisticas({ total, completadas, noAsistio: sesionDictada, pendientes });
  };

  const handleTerapeutaChange = (e) => {
    const id = parseInt(e.target.value);
    const terapeuta = terapeutas.find(t => t.id === id);
    setTerapeutaSeleccionado(terapeuta);

    if (id) {
      cargarAsistencias(id);
    } else {
      setAsistencias([]);
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Asistencias por Terapeuta</h1>
        <p className="text-gray-600">Consulta el registro de asistencias de cada terapeuta</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Selector de Terapeuta */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Terapeuta
            </label>
            <select
              value={terapeutaSeleccionado?.id || ''}
              onChange={handleTerapeutaChange}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Seleccione un terapeuta</option>
              {terapeutas.map(terapeuta => (
                <option key={terapeuta.id} value={terapeuta.id}>
                  {terapeuta.nombres} {terapeuta.apellidos}
                </option>
              ))}
            </select>
          </div>

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
        </div>

        {terapeutaSeleccionado && (
          <button
            onClick={() => cargarAsistencias(terapeutaSeleccionado.id)}
            disabled={cargando}
            className="mt-4 px-6 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all disabled:opacity-50"
          >
            {cargando ? 'Cargando...' : 'Buscar'}
          </button>
        )}
      </div>

      {/* Estadísticas */}
      {terapeutaSeleccionado && asistencias.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Citas</p>
                <p className="text-2xl font-bold text-blue-900">{estadisticas.total}</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Asistió</p>
                <p className="text-2xl font-bold text-green-900">{estadisticas.completadas}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Sesión Dictada</p>
                <p className="text-2xl font-bold text-orange-900">{estadisticas.noAsistio}</p>
              </div>
              <XCircleIcon className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-900">{estadisticas.pendientes}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Asistencias */}
      {terapeutaSeleccionado && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Cita ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Paciente</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Fecha Cita</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Recepción</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Terapeuta</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Fecha Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {asistencias.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {cargando ? 'Cargando...' : 'No hay registros en el rango seleccionado'}
                    </td>
                  </tr>
                ) : (
                  asistencias
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((asistencia) => (
                    <tr key={asistencia.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        #{asistencia.cita_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {asistencia.paciente_nombre || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {asistencia.fecha_cita ? formatearFecha(asistencia.fecha_cita) : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {asistencia.recepcion_marco ? (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            asistencia.recepcion_estado_id === 7
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {asistencia.recepcion_estado_id === 7 ? '✓ Asistió' : '◆ Sesión Dictada'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {asistencia.terapeuta_marco ? (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            asistencia.terapeuta_estado_id === 7
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {asistencia.terapeuta_estado_id === 7 ? '✓ Asistió' : '◆ Sesión Dictada'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {asistencia.terapeuta_fecha ? formatearFecha(asistencia.terapeuta_fecha) : '-'}
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
                              ? 'bg-blue-600 text-white'
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
      )}

      {!terapeutaSeleccionado && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Seleccione un terapeuta para ver sus asistencias</p>
        </div>
      )}
    </div>
  );
};

export default AsistenciasPorTerapeuta;
