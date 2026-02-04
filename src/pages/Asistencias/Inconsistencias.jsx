import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { obtenerInconsistenciasAsistencia } from '../../services/api';

const Inconsistencias = () => {
  const [inconsistencias, setInconsistencias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    // Establecer fechas por defecto (semana actual: lunes a sábado)
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

    // Calcular el lunes de esta semana
    const lunes = new Date(hoy);
    const diasDesdeElLunes = diaSemana === 0 ? 6 : diaSemana - 1; // Si es domingo, retroceder 6 días
    lunes.setDate(hoy.getDate() - diasDesdeElLunes);

    // Calcular el sábado de esta semana
    const sabado = new Date(lunes);
    sabado.setDate(lunes.getDate() + 5); // Lunes + 5 días = Sábado

    // Formatear fechas sin conversión a UTC (usar fecha local)
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

    cargarInconsistencias(fechaInicioStr, fechaFinStr);
  }, []);

  const cargarInconsistencias = async (inicio, fin) => {
    if (!inicio || !fin) {
      alert('Seleccione un rango de fechas');
      return;
    }

    setCargando(true);
    try {
      const data = await obtenerInconsistenciasAsistencia(inicio || fechaInicio, fin || fechaFin);
      setInconsistencias(data.inconsistencias || []);
    } catch (error) {
      console.error('Error al cargar inconsistencias:', error);
      alert('Error al cargar inconsistencias');
    } finally {
      setCargando(false);
    }
  };

  const handleBuscar = () => {
    cargarInconsistencias(fechaInicio, fechaFin);
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
        return 'Desconocido';
    }
  };

  const getInconsistenciaTipo = (recepcionEstado, terapeutaEstado, recepcionMarco, terapeutaMarco) => {
    // Caso 1: Ninguno marcó asistencia
    if (!recepcionMarco && !terapeutaMarco) {
      return {
        tipo: 'Ninguno marcó asistencia',
        color: 'bg-red-100 text-red-800 border-red-200'
      };
    }

    // Caso 2: Falta registro de admisión (solo terapeuta marcó)
    if (!recepcionMarco) {
      return {
        tipo: 'Falta registro de admisión',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      };
    }

    // Caso 3: Falta registro del terapeuta (solo admisión marcó)
    if (!terapeutaMarco) {
      return {
        tipo: 'Falta registro del terapeuta',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      };
    }

    // Caso 4: Ambos marcaron pero estados no coinciden
    if (recepcionEstado !== terapeutaEstado) {
      const estadoAdmision = recepcionEstado === 7 ? 'Asistió' : 'Sesión Dictada';
      const estadoTerapeuta = terapeutaEstado === 7 ? 'Asistió' : 'Sesión Dictada';

      return {
        tipo: `Estados no coinciden (Admisión: ${estadoAdmision}, Terapeuta: ${estadoTerapeuta})`,
        color: 'bg-orange-100 text-orange-800 border-orange-200'
      };
    }

    return {
      tipo: 'Inconsistencia detectada',
      color: 'bg-gray-100 text-gray-800 border-gray-200'
    };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <ExclamationTriangleIcon className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inconsistencias de Asistencia</h1>
            <p className="text-gray-600">Revise las discrepancias entre recepción y terapeuta</p>
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
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Botón Buscar */}
          <div className="flex items-end">
            <button
              onClick={handleBuscar}
              disabled={cargando}
              className="w-full px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
            >
              {cargando ? 'Cargando...' : 'Buscar Inconsistencias'}
            </button>
          </div>
        </div>
      </div>

      {/* Estadística Total */}
      {!cargando && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">Total de Inconsistencias Detectadas</p>
              <p className="text-4xl font-bold text-red-900">{inconsistencias.length}</p>
            </div>
            <ShieldCheckIcon className="w-16 h-16 text-red-400" />
          </div>
        </div>
      )}

      {/* Tabla de Inconsistencias */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Cita ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Paciente</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Terapeuta</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Fecha Cita</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Recepción Marcó</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Terapeuta Marcó</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Tipo de Inconsistencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cargando ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
                      <span className="text-gray-600">Cargando inconsistencias...</span>
                    </div>
                  </td>
                </tr>
              ) : inconsistencias.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <ShieldCheckIcon className="w-16 h-16 text-green-400 mx-auto mb-3" />
                    <p className="text-green-700 text-lg font-semibold">¡Excelente!</p>
                    <p className="text-gray-500">No se encontraron inconsistencias en el rango seleccionado</p>
                  </td>
                </tr>
              ) : (
                inconsistencias
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => {
                  // Determinar color basado en el tipo de inconsistencia
                  const getColorByTipo = (tipo) => {
                    if (tipo === 'Ninguno marcó asistencia') {
                      return 'bg-red-100 text-red-800 border-red-200';
                    } else if (tipo === 'Falta registro de admisión' || tipo === 'Falta registro del terapeuta') {
                      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                    } else if (tipo && tipo.startsWith('Estados no coinciden')) {
                      return 'bg-orange-100 text-orange-800 border-orange-200';
                    }
                    return 'bg-gray-100 text-gray-800 border-gray-200';
                  };

                  return (
                    <tr key={item.id} className="hover:bg-red-50 transition-colors">
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
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getColorByTipo(item.tipo_inconsistencia)}`}>
                          <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs font-bold">
                            {item.tipo_inconsistencia}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {!cargando && inconsistencias.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, inconsistencias.length)} de {inconsistencias.length} inconsistencias
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
                  {Array.from({ length: Math.min(Math.ceil(inconsistencias.length / rowsPerPage), 3) }, (_, i) => {
                    const totalPages = Math.ceil(inconsistencias.length / rowsPerPage);
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
                            ? 'bg-red-600 text-white'
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
                  disabled={page >= Math.ceil(inconsistencias.length / rowsPerPage) - 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  Siguiente
                </button>
                <button
                  onClick={() => setPage(Math.ceil(inconsistencias.length / rowsPerPage) - 1)}
                  disabled={page >= Math.ceil(inconsistencias.length / rowsPerPage) - 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  Último
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Tipos de Inconsistencias:</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-700"><strong>Ninguno marcó asistencia:</strong> Ni admisión ni terapeuta registraron después de 24 horas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-700"><strong>Falta registro de admisión:</strong> Solo el terapeuta marcó, falta que admisión registre</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-700"><strong>Falta registro del terapeuta:</strong> Solo admisión marcó, falta que el terapeuta registre</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-700"><strong>Estados no coinciden:</strong> Ambos marcaron pero con estados diferentes (Ej: Admisión: Asistió, Terapeuta: Sesión Dictada)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inconsistencias;
