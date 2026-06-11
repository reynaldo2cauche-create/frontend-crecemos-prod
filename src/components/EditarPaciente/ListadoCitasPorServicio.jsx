import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, CreditCard, User, Package, ChevronLeft, ChevronRight, Receipt } from 'lucide-react';
import { getListadoCitasPorPaciente } from '../../services/citaService';
import { getVentaServicioById } from '../../services/ventasService';
import DetalleVentaModal from '../Ventas/DetalleVentaModal';

const PAQUETES_POR_PAGINA = 5;

// Agrupa los paquetes por venta_id y los ordena por fecha de pago: la venta MÁS RECIENTE primero.
const agruparPorVenta = (paquetes) => {
  const ventasMap = {};
  const sinVentaArr = [];

  (paquetes || []).forEach(paquete => {
    if (!paquete.venta_id) { sinVentaArr.push(paquete); return; }
    const key = paquete.venta_id;
    if (!ventasMap[key]) ventasMap[key] = { venta_id: key, paquetes: [] };
    ventasMap[key].paquetes.push(paquete);
  });

  const ventas = Object.values(ventasMap);

  ventas.sort((a, b) => {
    const fechaA = a.paquetes.flatMap(p => p.citas).find(c => c.fecha_pago)?.fecha_pago;
    const fechaB = b.paquetes.flatMap(p => p.citas).find(c => c.fecha_pago)?.fecha_pago;
    if (!fechaA && !fechaB) return 0;
    if (!fechaA) return 1;
    if (!fechaB) return -1;
    return new Date(fechaB).getTime() - new Date(fechaA).getTime();
  });

  if (sinVentaArr.length > 0) {
    ventas.push({ venta_id: null, esGrupoSinVenta: true, paquetes: sinVentaArr });
  }

  return ventas;
};

const ListadoCitasPorServicio = ({ pacienteId, pacienteNombre }) => {
  const [listado, setListado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(0);
  const [paquetesAbiertos, setPaquetesAbiertos] = useState({});
  const [paginaActual, setPaginaActual] = useState(1);
  const [ventaDetalle, setVentaDetalle] = useState(null);
  const [loadingVenta, setLoadingVenta] = useState(false);

useEffect(() => {
  let isMounted = true; // Flag para evitar actualizar estado si el componente se desmontó
  
  if (!pacienteId) return;
  
  const cargarListado = async () => {
    if (!isMounted) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getListadoCitasPorPaciente(pacienteId);
      
      if (!isMounted) return; // No actualizar estado si el componente ya no existe

      console.log('📦 Datos recibidos:', data);

      // Verificar que las citas tengan los campos de asistencia
      if (data?.servicios?.length > 0) {
        const primerasCitas = data.servicios[0]?.paquetes?.[0]?.citas?.slice(0, 2);
        if (primerasCitas) {
          console.log('🔍 Ejemplo de citas (verificar campos recepcion_estado_id y terapeuta_estado_id):', primerasCitas);
        }
      }

      setListado(data);
      
      if (data?.servicios?.length > 0 && data.servicios[0]?.paquetes?.length > 0) {
        // Abrir por defecto la venta más reciente
        const ventas = agruparPorVenta(data.servicios[0].paquetes);
        const reciente = ventas[0];
        if (reciente) setPaquetesAbiertos({ [reciente.venta_id ?? 'sin-venta']: true });
      }
    } catch (err) {
      if (!isMounted) return;
      console.error('Error:', err);
      setError('No se pudo cargar el listado de citas');
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };
  
  cargarListado();
  
  // Cleanup function
  return () => {
    isMounted = false;
  };
}, [pacienteId]);

  useEffect(() => {
    if (!listado) return;
    setPaginaActual(1);
    // Abrir por defecto la venta más reciente del servicio seleccionado
    const ventas = agruparPorVenta(listado.servicios[servicioSeleccionado]?.paquetes || []);
    const reciente = ventas[0];
    if (reciente) {
      setPaquetesAbiertos({ [reciente.venta_id ?? 'sin-venta']: true });
    }
  }, [servicioSeleccionado, listado]);

  const togglePaquete = (id) => {
    setPaquetesAbiertos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const abrirDetalleVenta = async (cita) => {
    if (!cita) return;

    // Intentar obtener venta_id desde la cita, sino buscar por venta_servicio_detalle_id
    let ventaId = cita.venta_id;

    // Si no tiene venta_id, mostrar error
    if (!ventaId) {
      console.error('⚠️ No se encontró venta_id en la cita:', cita);
    }

    if (!ventaId) {
      alert('No se puede obtener el detalle de esta venta');
      return;
    }

    setLoadingVenta(true);
    try {
      const venta = await getVentaServicioById(ventaId);
      setVentaDetalle(venta);
    } catch (err) {
      console.error('Error al cargar detalle de venta:', err);
      alert('No se pudo cargar el detalle de la venta');
    } finally {
      setLoadingVenta(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${diasSemana[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatearHora = (hora) => {
    if (!hora) return '-';
    return hora.substring(0, 5);
  };

  // ── Badge con verificación de asistencia de terapeuta Y admisión ──────────────────────
  const AsistenciaBadge = ({ recepcion_estado_id, terapeuta_estado_id, programada }) => {
    // Si no está programada, mostrar "Por agendar"
    if (programada === false) return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 text-[10px] font-semibold border border-blue-100">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
        Por agendar
      </span>
    );

    // Estado 7 = Asistió (tanto para terapeuta como para admisión/recepción)
    const terapeutaAsistio = terapeuta_estado_id === 7;
    const admisionAsistio = recepcion_estado_id === 7;

    // Solo se considera asistencia si AMBOS marcaron asistencia
    if (terapeutaAsistio && admisionAsistio) return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold border border-green-100">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
        Asistió
      </span>
    );

    // Si al menos uno marcó que NO asistió, mostrar "No asistió"
    if ((recepcion_estado_id && !admisionAsistio) || (terapeuta_estado_id && !terapeutaAsistio)) return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-semibold border border-red-100">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
        No asistió
      </span>
    );

    // Si ninguno ha marcado, mostrar "Pendiente"
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

  if (!listado?.servicios?.length) return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center mt-6">
      <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
      <p className="text-gray-400 text-sm">No hay citas registradas</p>
    </div>
  );

  const servicioActual = listado.servicios[servicioSeleccionado];

  const ventasAgrupadas = agruparPorVenta(servicioActual.paquetes);

  const totalVentas = ventasAgrupadas.length;
  const totalPaginas = Math.ceil(totalVentas / PAQUETES_POR_PAGINA);
  const inicio = (paginaActual - 1) * PAQUETES_POR_PAGINA;
  const fin = inicio + PAQUETES_POR_PAGINA;
  const ventasPaginadas = ventasAgrupadas.slice(inicio, fin);

  return (
    <div className="mt-8">

      {/* Header sección */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-[#7B1FA2]/5 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-4 h-4 text-[#7B1FA2]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900">Historial de citas</h3>
          {pacienteNombre && (
            <p className="text-xs text-[#7B1FA2] font-medium flex items-center gap-1 mt-0.5">
              <User className="w-3 h-3 flex-shrink-0" />
              {pacienteNombre}
            </p>
          )}
        </div>
      </div>

      {/* Tabs de servicios */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5">
        {listado.servicios.map((servicio, index) => {
          // ── NUEVO: contar solo citas programadas para el badge del tab ──
          const totalCitas = servicio.paquetes.reduce(
            (sum, paq) => sum + paq.citas.filter(c => c.programada !== false).length,
            0
          );
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

      {/* Ventas */}
      <div className="flex flex-col gap-3">
        {ventasPaginadas.map((venta) => {
          const ventaKey = venta.venta_id ?? 'sin-venta';
          const abierto = !!paquetesAbiertos[ventaKey];
          const esSinVenta = !venta.venta_id;

          const todasCitas = venta.paquetes.flatMap(p => p.citas);
          const primeraCitaConInfo = todasCitas.find(c => c.comprobante || c.fecha_pago);

          const citasOrdenadas = [...todasCitas].sort((a, b) => {
            if (a.programada === false) return 1;
            if (b.programada === false) return -1;
            const fechaDiff = new Date(a.fecha || 0) - new Date(b.fecha || 0);
            if (fechaDiff !== 0) return fechaDiff;
            return (a.hora || '').localeCompare(b.hora || '');
          });

          const citasProgramadas = citasOrdenadas.filter(c => c.programada !== false);
          const citasPorAgendar  = citasOrdenadas.filter(c => c.programada === false);

          const asistidas   = citasProgramadas.filter(c => c.terapeuta_estado_id === 7 && c.recepcion_estado_id === 7).length;
          const noAsistidas = citasProgramadas.filter(c =>
            (c.recepcion_estado_id && c.recepcion_estado_id !== 7) ||
            (c.terapeuta_estado_id && c.terapeuta_estado_id !== 7)
          ).length;
          const pendientes  = citasProgramadas.filter(c => !c.recepcion_estado_id && !c.terapeuta_estado_id).length;

          const sesionesTotales = citasOrdenadas.length;
          const sesionesUsadas  = citasProgramadas.length;
          const porcentaje      = sesionesTotales > 0 ? Math.round((sesionesUsadas / sesionesTotales) * 100) : 0;

          return (
            <div key={ventaKey} className={`rounded-xl border transition-all ${
              abierto
                ? esSinVenta ? 'border-gray-400 shadow-sm' : 'border-[#7B1FA2]/20 shadow-sm'
                : esSinVenta ? 'border-gray-200' : 'border-gray-100'
            }`}>

              {/* Header de la venta */}
              <button
                onClick={() => togglePaquete(ventaKey)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                  abierto
                    ? esSinVenta ? 'bg-gray-100 rounded-b-none' : 'bg-[#7B1FA2]/5 rounded-b-none'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    esSinVenta ? 'bg-gray-200' : abierto ? 'bg-[#7B1FA2]/10' : 'bg-gray-100'
                  }`}>
                    {esSinVenta
                      ? <Package className="w-4 h-4 text-gray-500" />
                      : <CreditCard className={`w-4 h-4 ${abierto ? 'text-[#7B1FA2]' : 'text-gray-400'}`} />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                        esSinVenta ? 'bg-gray-200 text-gray-700' : 'bg-[#7B1FA2]/10 text-[#7B1FA2]'
                      }`}>
                        {esSinVenta ? 'Sin venta' : 'Venta'}
                      </span>

                      {esSinVenta ? (
                        <span className="text-sm font-semibold text-gray-800">Atenciones directas</span>
                      ) : (
                        <>
                          {primeraCitaConInfo?.fecha_pago && (
                            <span className="text-xs text-gray-500">
                              {formatearFecha(primeraCitaConInfo.fecha_pago)}
                            </span>
                          )}
                          {primeraCitaConInfo?.comprobante && (
                            <>
                              <span className="text-gray-300">·</span>
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => { e.stopPropagation(); abrirDetalleVenta(primeraCitaConInfo); }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault(); e.stopPropagation();
                                    abrirDetalleVenta(primeraCitaConInfo);
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-[#7B1FA2] hover:text-white hover:bg-[#7B1FA2] rounded-md transition-colors cursor-pointer"
                              >
                                <Receipt className="w-3 h-3" />
                                {primeraCitaConInfo.comprobante}
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-gray-400">
                        {sesionesUsadas}/{sesionesTotales} sesiones
                      </span>
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
                      {citasPorAgendar.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-blue-500 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          {citasPorAgendar.length} por agendar
                        </span>
                      )}
                    </div>

                    {sesionesTotales > 1 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${esSinVenta ? 'bg-gray-400' : 'bg-[#7B1FA2]'}`}
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{porcentaje}%</span>
                      </div>
                    )}
                  </div>

                  <div className={`flex-shrink-0 mt-1 ${abierto ? (esSinVenta ? 'text-gray-500' : 'text-[#7B1FA2]') : 'text-gray-400'}`}>
                    {abierto ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Tabla de citas */}
              {abierto && (
                <div className={`border-t ${esSinVenta ? 'border-gray-200' : 'border-[#7B1FA2]/10'}`}>
                  <div className="grid px-4 py-2 bg-gray-50 border-b border-gray-100"
                    style={{ gridTemplateColumns: '28px 1fr 60px 1fr 1fr 1fr' }}>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">#</span>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Fecha</span>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Hora</span>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Especialista</span>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Motivo</span>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Asistencia</span>
                  </div>

                  {citasOrdenadas.map((cita, citaIdx) => {
                    const esPendiente = cita.programada === false;
                    return (
                      <div
                        key={cita.id ?? `pending-${citaIdx}`}
                        className={`grid items-center px-4 py-2.5 border-b border-gray-50 last:border-b-0 transition-colors ${
                          esPendiente
                            ? 'bg-blue-50/30 border-dashed'
                            : citaIdx % 2 === 0
                              ? 'bg-white hover:bg-gray-50/60'
                              : 'bg-gray-50/30 hover:bg-gray-50/60'
                        }`}
                        style={{ gridTemplateColumns: '28px 1fr 60px 1fr 1fr 1fr' }}
                      >
                        <span className={`text-xs font-semibold ${esPendiente ? 'text-blue-300' : 'text-gray-400'}`}>
                          {citaIdx + 1}
                        </span>
                        <span className={`text-xs font-medium ${esPendiente ? 'text-blue-300 italic' : 'text-gray-700'}`}>
                          {esPendiente ? 'Sin agendar' : formatearFecha(cita.fecha)}
                        </span>
                        <span className={`text-xs ${esPendiente ? 'text-blue-300' : 'text-gray-500'}`}>
                          {esPendiente ? '-' : formatearHora(cita.hora)}
                        </span>
                        <span className={`text-xs truncate ${esPendiente ? 'text-blue-300' : 'text-gray-600'}`}>
                          {cita.especialista || '-'}
                        </span>
                        <span className={`text-xs truncate ${esPendiente ? 'text-blue-300' : 'text-gray-600'}`}>
                          {cita.motivo_nombre}
                        </span>
                        <AsistenciaBadge
                          recepcion_estado_id={cita.recepcion_estado_id}
                          terapeuta_estado_id={cita.terapeuta_estado_id}
                          programada={cita.programada}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Mostrando {inicio + 1}-{Math.min(fin, totalVentas)} de {totalVentas} ventas
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

      {/* Modal de detalle de venta */}
      {ventaDetalle && (
        <DetalleVentaModal
          venta={ventaDetalle}
          tipo="servicio"
          onClose={() => setVentaDetalle(null)}
        />
      )}
    </div>
  );
};

export default ListadoCitasPorServicio;