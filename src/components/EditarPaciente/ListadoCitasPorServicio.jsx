import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, CreditCard, User, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { getListadoCitasPorPaciente } from '../../services/citaService';

const PAQUETES_POR_PAGINA = 5;

const ListadoCitasPorServicio = ({ pacienteId }) => {
  const [listado, setListado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(0);
  const [paquetesAbiertos, setPaquetesAbiertos] = useState({});
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    if (!pacienteId) return;
    const cargarListado = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getListadoCitasPorPaciente(pacienteId);
        setListado(data);
        // Abrir el primer paquete del primer servicio por defecto
        if (data?.servicios?.[0]?.paquetes?.[0]) {
          setPaquetesAbiertos({ [data.servicios[0].paquetes[0].paquete_id]: true });
        }
      } catch (err) {
        console.error('Error al cargar listado de citas:', err);
        setError('No se pudo cargar el listado de citas');
      } finally {
        setLoading(false);
      }
    };
    cargarListado();
  }, [pacienteId]);

  useEffect(() => {
    if (!listado) return;
    setPaginaActual(1); // Resetear a primera página al cambiar de servicio
    const primerPaquete = listado.servicios[servicioSeleccionado]?.paquetes?.[0];
    if (primerPaquete) {
      setPaquetesAbiertos({ [primerPaquete.paquete_id]: true });
    }
  }, [servicioSeleccionado, listado]);

  const togglePaquete = (id) => {
    setPaquetesAbiertos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatearHora = (hora) => {
    if (!hora) return '-';
    return hora.substring(0, 5);
  };

  const AsistenciaBadge = ({ valor }) => {
    if (valor === 1) return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold border border-green-100">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
        Asistió
      </span>
    );
    if (valor === 0) return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-semibold border border-red-100">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
        No asistió
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 text-[10px] font-medium border border-gray-100">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
        Pendiente
      </span>
    );
  };

  if (loading) return (
    <div className="space-y-3 mt-6">
      <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
      <div className="h-32 bg-gray-50 rounded-xl animate-pulse" />
      <div className="h-32 bg-gray-50 rounded-xl animate-pulse" />
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

  const servicioActual = listado.servicios[servicioSeleccionado];

  // Ordenar paquetes del más reciente al más antiguo (por fecha de compra)
  const paquetesOrdenados = [...servicioActual.paquetes].sort((a, b) => {
    const primeraCitaA = a.citas[0];
    const primeraCitaB = b.citas[0];

    // Primero ordenar por fecha de pago/fecha
    const fechaA = new Date(primeraCitaA?.fecha_pago || primeraCitaA?.fecha || 0).getTime();
    const fechaB = new Date(primeraCitaB?.fecha_pago || primeraCitaB?.fecha || 0).getTime();

    if (fechaB !== fechaA) {
      return fechaB - fechaA; // Más reciente primero
    }

    // Si las fechas son iguales, usar el ID de la cita como desempate (mayor ID = más reciente)
    const idA = primeraCitaA?.id || 0;
    const idB = primeraCitaB?.id || 0;
    return idB - idA;
  });

  // Paginación
  const totalPaquetes = paquetesOrdenados.length;
  const totalPaginas = Math.ceil(totalPaquetes / PAQUETES_POR_PAGINA);
  const inicio = (paginaActual - 1) * PAQUETES_POR_PAGINA;
  const fin = inicio + PAQUETES_POR_PAGINA;
  const paquetesPaginados = paquetesOrdenados.slice(inicio, fin);

  return (
    <div className="mt-8">

      {/* Header sección */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-[#7B1FA2]/5 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-4 h-4 text-[#7B1FA2]" />
        </div>
        <h3 className="text-sm font-bold text-gray-900">Historial de citas</h3>
      </div>

      {/* Tabs de servicios */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5">
        {listado.servicios.map((servicio, index) => {
          const totalCitas = servicio.paquetes.reduce((sum, paq) => sum + paq.citas.length, 0);
          const activo = servicioSeleccionado === index;
          return (
            <button
              key={servicio.servicio_id}
              onClick={() => setServicioSeleccionado(index)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap border ${
                activo
                  ? 'bg-[#7B1FA2]/8 border-[#7B1FA2]/20 text-[#7B1FA2]'
                  : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:text-gray-700'
              }`}
            >
              {servicio.servicio_nombre}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activo ? 'bg-[#7B1FA2] text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {totalCitas}
              </span>
            </button>
          );
        })}
      </div>

      {/* Paquetes */}
      <div className="flex flex-col gap-3">
        {paquetesPaginados.map((paquete, paqIdx) => {
          const indiceReal = inicio + paqIdx;
          const abierto = !!paquetesAbiertos[paquete.paquete_id];
          const citasOrdenadas = paquete.citas; // Ya vienen ordenadas del backend (más recientes primero)
          const asistidas = citasOrdenadas.filter(c => c.asistencia === 1).length;
          const noAsistidas = citasOrdenadas.filter(c => c.asistencia === 0).length;
          const pendientes = citasOrdenadas.filter(c => c.asistencia === null || c.asistencia === undefined).length;
          const primeraCita = citasOrdenadas[0];
          const esCitaIndividual = citasOrdenadas.length === 1; // Si solo hay 1 cita, es compra individual

          return (
            <div key={paquete.paquete_id} className={`rounded-xl border transition-all ${
              abierto ? 'border-[#7B1FA2]/20 shadow-sm' : 'border-gray-100'
            }`}>

              {/* Header del paquete — clickeable */}
              <button
                onClick={() => togglePaquete(paquete.paquete_id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                  abierto ? 'bg-[#7B1FA2]/5 rounded-b-none' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">

                  {/* Ícono paquete */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    abierto ? 'bg-[#7B1FA2]/10' : 'bg-gray-100'
                  }`}>
                    <Package className={`w-4 h-4 ${abierto ? 'text-[#7B1FA2]' : 'text-gray-400'}`} />
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${abierto ? 'text-[#7B1FA2]' : 'text-gray-800'}`}>
                        {esCitaIndividual ? 'Cita individual' : `Paquete ${indiceReal + 1}`}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-sm font-bold text-gray-900">
                        S/. {primeraCita?.monto?.toFixed(2) ?? '0.00'}
                      </span>
                      {primeraCita?.modalidad_pago && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <CreditCard className="w-3 h-3" />
                            {primeraCita.modalidad_pago}
                          </span>
                        </>
                      )}
                      {primeraCita?.fecha_pago && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-gray-500">{formatearFecha(primeraCita.fecha_pago)}</span>
                        </>
                      )}
                      {primeraCita?.comprobante && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-[#7B1FA2] font-medium">{primeraCita.comprobante}</span>
                        </>
                      )}
                    </div>

                    {/* Especialista + tipo */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-500 truncate">{primeraCita?.especialista ?? '-'}</span>
                      {primeraCita?.tipo_servicio && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-gray-400">{primeraCita.tipo_servicio}</span>
                        </>
                      )}
                    </div>

                    {/* Mini stats */}
                    <div className="flex items-center gap-2 mt-1.5">
                      {!esCitaIndividual && (
                        <span className="text-[10px] text-gray-400">{citasOrdenadas.length} citas</span>
                      )}
                      {asistidas > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-green-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          {asistidas} asistió
                        </span>
                      )}
                      {noAsistidas > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-red-500 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          {noAsistidas} no asistió
                        </span>
                      )}
                      {pendientes > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                          {pendientes} pendiente{pendientes > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Chevron */}
                  <div className={`flex-shrink-0 mt-1 ${abierto ? 'text-[#7B1FA2]' : 'text-gray-400'}`}>
                    {abierto ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Lista de citas */}
              {abierto && (
                <div className="border-t border-[#7B1FA2]/10">
                  {/* Cabecera columnas */}
                  <div className="grid px-4 py-2 bg-gray-50 border-b border-gray-100"
                    style={{ gridTemplateColumns: '28px 1fr 60px 1fr' }}>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">#</span>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Fecha</span>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Hora</span>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Asistencia</span>
                  </div>

                  {/* Filas de citas */}
                  {citasOrdenadas.map((cita, citaIdx) => (
                    <div
                      key={cita.id}
                      className={`grid items-center px-4 py-2.5 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60 transition-colors ${
                        citaIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                      style={{ gridTemplateColumns: '28px 1fr 60px 1fr' }}
                    >
                      <span className="text-xs font-semibold text-gray-400">{citaIdx + 1}</span>
                      <span className="text-xs text-gray-700 font-medium">{formatearFecha(cita.fecha)}</span>
                      <span className="text-xs text-gray-500">{formatearHora(cita.hora)}</span>
                      <AsistenciaBadge valor={cita.asistencia} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Controles de paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Mostrando {inicio + 1}-{Math.min(fin, totalPaquetes)} de {totalPaquetes} paquetes
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
              disabled={paginaActual === 1}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                paginaActual === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Anterior
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numPagina => (
                <button
                  key={numPagina}
                  onClick={() => setPaginaActual(numPagina)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    paginaActual === numPagina
                      ? 'bg-[#7B1FA2] text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {numPagina}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
              disabled={paginaActual === totalPaginas}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                paginaActual === totalPaginas
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              Siguiente
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListadoCitasPorServicio;