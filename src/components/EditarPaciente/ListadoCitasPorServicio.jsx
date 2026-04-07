import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getListadoCitasPorPaciente } from '../../services/citaService';

const ListadoCitasPorServicio = ({ pacienteId }) => {
  const [listado, setListado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const FILAS_POR_PAGINA = 10;

  useEffect(() => {
    if (!pacienteId) return;
    const cargarListado = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getListadoCitasPorPaciente(pacienteId);
        setListado(data);
      } catch (err) {
        console.error('Error al cargar listado de citas:', err);
        setError('No se pudo cargar el listado de citas');
      } finally {
        setLoading(false);
      }
    };
    cargarListado();
  }, [pacienteId]);

  // Resetear página cuando cambia servicio
  useEffect(() => {
    setPaginaActual(1);
  }, [servicioSeleccionado]);

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatearHora = (hora) => {
    if (!hora) return '-';
    return hora.substring(0, 5);
  };

  if (loading) return (
    <div className="space-y-3 mt-6">
      <div className="flex items-center gap-3 mb-2 pb-2 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse flex-shrink-0"></div>
        <div className="h-4 w-48 bg-gray-100 rounded animate-pulse"></div>
      </div>
      <div className="h-96 bg-gray-50 rounded-xl animate-pulse"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-gray-200 rounded-xl p-4 text-center mt-6">
      <p className="text-red-700 text-sm">{error}</p>
    </div>
  );

  if (!listado || listado.servicios.length === 0) return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center mt-6">
      <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
      <p className="text-gray-400 text-sm">No hay citas registradas</p>
    </div>
  );

  // Obtener servicio actual
  const servicioActual = listado.servicios[servicioSeleccionado];

  // Convertir todas las citas del servicio en un array plano para paginar
  const todasLasCitas = servicioActual.paquetes.flatMap((paquete) => {
    const citasOrdenadas = [...paquete.citas].reverse();
    return citasOrdenadas.map((cita, citaIdx) => ({
      ...cita,
      paquete_id: paquete.paquete_id,
      paquete_nombre: paquete.paquete_nombre,
      es_primera_del_paquete: citaIdx === 0,
      total_citas_paquete: citasOrdenadas.length,
      numero_en_paquete: citaIdx + 1
    }));
  });

  // Calcular paginación
  const totalPaginas = Math.ceil(todasLasCitas.length / FILAS_POR_PAGINA);
  const indiceInicio = (paginaActual - 1) * FILAS_POR_PAGINA;
  const indiceFin = indiceInicio + FILAS_POR_PAGINA;
  const citasPaginadas = todasLasCitas.slice(indiceInicio, indiceFin);

  const totalCitasServicio = todasLasCitas.length;

  return (
    <div className="mt-8">
      {/* Tabs de servicios */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1 overflow-x-auto">
          {listado.servicios.map((servicio, index) => {
            const totalCitas = servicio.paquetes.reduce((sum, paq) => sum + paq.citas.length, 0);
            return (
              <button
                key={servicio.servicio_id}
                onClick={() => setServicioSeleccionado(index)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  servicioSeleccionado === index
                    ? 'border-[#9575CD] text-[#9575CD] bg-[#9575CD]/5'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="font-semibold">{servicio.servicio_nombre}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  servicioSeleccionado === index
                    ? 'bg-[#9575CD] text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {totalCitas}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabla del servicio seleccionado */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header con total */}
        <div className="bg-gradient-to-r from-[#9575CD] to-[#7B1FA2] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Calendar className="w-5 h-5" />
            <h4 className="text-sm font-bold">HISTORIAL DE CITAS</h4>
          </div>
          <span className="text-xs font-semibold text-white bg-white/20 px-3 py-1 rounded-full">
            {totalCitasServicio} registro{totalCitasServicio !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="px-3 py-2.5 text-left font-semibold border-r border-gray-700">#</th>
                <th className="px-3 py-2.5 text-left font-semibold border-r border-gray-700">FECHA</th>
                <th className="px-3 py-2.5 text-left font-semibold border-r border-gray-700">HORA</th>
                <th className="px-3 py-2.5 text-center font-semibold border-r border-gray-700">ASISTENCIA</th>
                <th className="px-3 py-2.5 text-left font-semibold border-r border-gray-700">ESPECIALISTA</th>
                <th className="px-3 py-2.5 text-left font-semibold border-r border-gray-700">TIPO DE SERVICIO</th>
                <th className="px-3 py-2.5 text-right font-semibold border-r border-gray-700">MONTO</th>
                <th className="px-3 py-2.5 text-left font-semibold border-r border-gray-700">F. PAGO</th>
                <th className="px-3 py-2.5 text-left font-semibold border-r border-gray-700">MODALIDAD</th>
                <th className="px-3 py-2.5 text-left font-semibold">COMPROBANTE</th>
              </tr>
            </thead>
            <tbody>
              {citasPaginadas.map((cita, idx) => {
                // Determinar si debemos mostrar celdas con rowspan
                const citasDelMismoPaquete = citasPaginadas.filter(c => c.paquete_id === cita.paquete_id);
                const esPrimeraCitaDelPaqueteEnPagina = citasDelMismoPaquete[0]?.id === cita.id;
                const totalCitasDelPaqueteEnPagina = citasDelMismoPaquete.length;

                return (
                  <tr
                    key={cita.id}
                    className="border-b border-gray-100 hover:bg-purple-50/30 transition-colors"
                  >
                    <td className="px-3 py-2.5 font-semibold text-gray-900 border-r border-gray-100">
                      {cita.numero_en_paquete}
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 border-r border-gray-100">
                      {formatearFecha(cita.fecha)}
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 border-r border-gray-100">
                      {formatearHora(cita.hora)}
                    </td>
                    <td className="px-3 py-2.5 text-center border-r border-gray-100">
                      {cita.asistencia === 1 ? (
                        <span className="inline-block px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-[10px] font-bold">ASISTIÓ</span>
                      ) : cita.asistencia === 0 ? (
                        <span className="inline-block px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-[10px] font-bold">NO ASISTIÓ</span>
                      ) : (
                        <span className="text-gray-400 text-[10px]">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 border-r border-gray-100">
                      {cita.especialista}
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 border-r border-gray-100">
                      {cita.tipo_servicio || '-'}
                    </td>

                    {/* Celdas con rowspan solo para la primera del paquete EN ESTA PÁGINA */}
                    {esPrimeraCitaDelPaqueteEnPagina && (
                      <>
                        <td
                          rowSpan={totalCitasDelPaqueteEnPagina}
                          className="px-3 py-2.5 text-right font-bold text-gray-900 border-r border-gray-100 bg-purple-50 align-middle"
                        >
                          <span className="text-[#7B1FA2]">S/. {cita.monto.toFixed(2)}</span>
                        </td>
                        <td
                          rowSpan={totalCitasDelPaqueteEnPagina}
                          className="px-3 py-2.5 text-gray-700 border-r border-gray-100 bg-purple-50 align-middle"
                        >
                          {formatearFecha(cita.fecha_pago)}
                        </td>
                        <td
                          rowSpan={totalCitasDelPaqueteEnPagina}
                          className="px-3 py-2.5 text-gray-700 border-r border-gray-100 bg-purple-50 align-middle"
                        >
                          {cita.modalidad_pago || '-'}
                        </td>
                        <td
                          rowSpan={totalCitasDelPaqueteEnPagina}
                          className="px-3 py-2.5 text-gray-700 bg-purple-50 align-middle"
                        >
                          <span className="font-semibold text-[#7B1FA2]">{cita.comprobante || '-'}</span>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Mostrando <span className="font-semibold text-gray-700">{indiceInicio + 1}</span> a{' '}
              <span className="font-semibold text-gray-700">{Math.min(indiceFin, todasLasCitas.length)}</span> de{' '}
              <span className="font-semibold text-gray-700">{todasLasCitas.length}</span> registros
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                disabled={paginaActual === 1}
                className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <div className="flex gap-1">
                {[...Array(totalPaginas)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPaginaActual(i + 1)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      paginaActual === i + 1
                        ? 'bg-[#9575CD] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                disabled={paginaActual === totalPaginas}
                className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListadoCitasPorServicio;
