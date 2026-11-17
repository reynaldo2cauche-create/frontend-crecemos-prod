import React, { useState, useEffect } from 'react';
import {
  Calendar, ChevronDown, ChevronUp, CreditCard, User, Package,
  ChevronLeft, ChevronRight, Receipt, Clock, CheckCircle2, XCircle
} from 'lucide-react';
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
    let isMounted = true;

    if (!pacienteId) return;

    const cargarListado = async () => {
      if (!isMounted) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getListadoCitasPorPaciente(pacienteId);

        if (!isMounted) return;

        console.log('📦 Datos recibidos:', data);

        if (data?.servicios?.length > 0) {
          const primerasCitas = data.servicios[0]?.paquetes?.[0]?.citas?.slice(0, 2);
          if (primerasCitas) {
            console.log('🔍 Ejemplo de citas (verificar campos recepcion_estado_id y terapeuta_estado_id):', primerasCitas);
          }
        }

        setListado(data);

        if (data?.servicios?.length > 0 && data.servicios[0]?.paquetes?.length > 0) {
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

    return () => {
      isMounted = false;
    };
  }, [pacienteId]);

  useEffect(() => {
    if (!listado) return;
    setPaginaActual(1);
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

    let ventaId = cita.venta_id;

    if (!ventaId) {
      console.error('⚠️ No se encontró venta_id en la cita:', cita);
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
    const soloFecha = String(fecha).split('T')[0].split(' ')[0];
    const [año, mes, dia] = soloFecha.split('-').map(Number);
    const d = new Date(año, mes - 1, dia);
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${diasSemana[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatearHora = (hora) => {
    if (!hora) return '-';
    return hora.substring(0, 5);
  };

  // ── Badge con verificación de asistencia de terapeuta Y admisión ──
  const AsistenciaBadge = ({ recepcion_estado_id, terapeuta_estado_id, programada, anulada }) => {
    if (anulada) return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
        <XCircle className="w-3 h-3" />
        Anulada
      </span>
    );

    if (programada === false) return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold border border-blue-200">
        <Calendar className="w-3 h-3" />
        Por agendar
      </span>
    );

    const terapeutaAsistio = terapeuta_estado_id === 7;
    const admisionAsistio = recepcion_estado_id === 7;

    if (terapeutaAsistio && admisionAsistio) return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" />
        Asistió
      </span>
    );

    if ((recepcion_estado_id && !admisionAsistio) || (terapeuta_estado_id && !terapeutaAsistio)) return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[10px] font-semibold border border-red-200">
        <XCircle className="w-3 h-3" />
        No asistió
      </span>
    );

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 text-[10px] font-medium border border-gray-200">
        <Clock className="w-3 h-3" />
        Pendiente
      </span>
    );
  };

  if (loading) {
    return (
      <div className="glass-panel rounded-3xl p-5">
        <div className="flex items-center justify-center py-12">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-purple-100 rounded-full" />
            <div className="absolute inset-0 border-2 border-transparent border-t-[#7B1FA2] rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel rounded-3xl p-5">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!listado?.servicios?.length) {
    return (
      <div className="glass-panel rounded-3xl p-5">
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-8 h-8 text-[#7B1FA2]/40" />
          </div>
          <p className="text-sm font-semibold text-gray-500">No hay citas registradas</p>
          <p className="text-xs text-gray-400 mt-1">Las citas aparecerán aquí cuando se agenden</p>
        </div>
      </div>
    );
  }

  const servicioActual = listado.servicios[servicioSeleccionado];
  const ventasAgrupadas = agruparPorVenta(servicioActual.paquetes);

  const totalVentas = ventasAgrupadas.length;
  const totalPaginas = Math.ceil(totalVentas / PAQUETES_POR_PAGINA);
  const inicio = (paginaActual - 1) * PAQUETES_POR_PAGINA;
  const fin = inicio + PAQUETES_POR_PAGINA;
  const ventasPaginadas = ventasAgrupadas.slice(inicio, fin);

  return (
    <div className="glass-panel rounded-3xl p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-500/20">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-extrabold text-[#2D0A4E] leading-tight">Historial de Citas</h2>
          {pacienteNombre && (
            <p className="text-[13px] text-gray-400 flex items-center gap-1">
              <User className="w-3 h-3 flex-shrink-0" />
              {pacienteNombre}
            </p>
          )}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-gray-200 to-transparent mb-4" />

      {/* Tabs de servicios */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        {listado.servicios.map((servicio, index) => {
          const totalCitas = servicio.paquetes.reduce(
            (sum, paq) => sum + paq.citas.filter(c => c.programada !== false).length,
            0
          );
          const activo = servicioSeleccionado === index;
          return (
            <button
              key={servicio.servicio_id}
              onClick={() => setServicioSeleccionado(index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activo
                  ? 'bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white shadow-lg shadow-purple-500/20'
                  : 'bg-[#F5F0FA] text-gray-600 hover:bg-purple-100/70'
              }`}
            >
              {servicio.servicio_nombre}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activo ? 'bg-white/25 text-white' : 'bg-white text-[#7B1FA2]'
              }`}>
                {totalCitas}
              </span>
            </button>
          );
        })}
      </div>

      {/* Ventas */}
      <div className="space-y-3">
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
          const citasPorAgendar = citasOrdenadas.filter(c => c.programada === false && !c.anulada);

          const anuladas = citasOrdenadas.filter(c => c.anulada).length;
          const asistidas = citasProgramadas.filter(c => !c.anulada && c.terapeuta_estado_id === 7 && c.recepcion_estado_id === 7).length;
          const noAsistidas = citasProgramadas.filter(c => !c.anulada && (
            (c.recepcion_estado_id && c.recepcion_estado_id !== 7) ||
            (c.terapeuta_estado_id && c.terapeuta_estado_id !== 7)
          )).length;
          const pendientes = citasProgramadas.filter(c => !c.anulada && !c.recepcion_estado_id && !c.terapeuta_estado_id).length;

          const sesionesTotales = citasOrdenadas.length;
          const sesionesUsadas = citasProgramadas.filter(c => !c.anulada).length;
          const porcentaje = sesionesTotales > 0 ? Math.round((sesionesUsadas / sesionesTotales) * 100) : 0;

          return (
            <div
              key={ventaKey}
              className={`rounded-2xl bg-[#F5F0FA] overflow-hidden transition-all ${
                abierto ? 'shadow-md ring-1 ring-purple-200/60' : 'hover:shadow-sm'
              }`}
            >
              {/* Header de la venta */}
              <button
                onClick={() => togglePaquete(ventaKey)}
                className={`w-full text-left px-4 py-3 transition-colors ${abierto ? 'bg-purple-50/40' : 'hover:bg-purple-50/20'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    esSinVenta
                      ? 'bg-gray-200'
                      : 'bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] shadow-sm shadow-purple-500/20'
                  }`}>
                    {esSinVenta
                      ? <Package className="w-5 h-5 text-gray-500" />
                      : <CreditCard className="w-5 h-5 text-white" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full ${
                        esSinVenta ? 'bg-gray-200 text-gray-700' : 'bg-purple-100/70 text-[#7B1FA2]'
                      }`}>
                        {esSinVenta ? 'Sin venta' : 'Venta'}
                      </span>

                      {esSinVenta ? (
                        <span className="text-sm font-bold text-gray-800">Atenciones directas</span>
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
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#7B1FA2] hover:text-white hover:bg-[#7B1FA2] rounded-full transition-colors cursor-pointer"
                              >
                                <Receipt className="w-3 h-3" />
                                {primeraCitaConInfo.comprobante}
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[11px] text-gray-500">
                        {sesionesUsadas}/{sesionesTotales} sesiones
                      </span>
                      {asistidas > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {asistidas} asistió
                        </span>
                      )}
                      {noAsistidas > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-500 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          {noAsistidas} no asistió
                        </span>
                      )}
                      {pendientes > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                          {pendientes} pendiente{pendientes > 1 ? 's' : ''}
                        </span>
                      )}
                      {anuladas > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {anuladas} anulada{anuladas > 1 ? 's' : ''}
                        </span>
                      )}
                      {citasPorAgendar.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-blue-500 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          {citasPorAgendar.length} por agendar
                        </span>
                      )}
                    </div>

                    {sesionesTotales > 1 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${esSinVenta ? 'bg-gray-400' : 'bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0]'}`}
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{porcentaje}%</span>
                      </div>
                    )}
                  </div>

                  <div className={`flex-shrink-0 mt-1 ${abierto ? 'text-[#7B1FA2]' : 'text-gray-400'}`}>
                    {abierto ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Lista de citas */}
              {abierto && (
                <div className="border-t border-purple-100/40 bg-white/70 p-3 space-y-2">
                  {citasOrdenadas.map((cita, citaIdx) => {
                    const esAnulada = !!cita.anulada;
                    const esPendiente = cita.programada === false && !esAnulada;

                    return (
                      <div
                        key={cita.id ?? `pending-${citaIdx}`}
                        className={`rounded-2xl p-3.5 transition-all ${
                          esAnulada
                            ? 'bg-amber-50/60 border border-amber-200/60'
                            : esPendiente
                              ? 'bg-blue-50/40 border border-dashed border-blue-200/60'
                              : 'bg-white border border-gray-100 hover:border-purple-200 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          
                          {/* 1. Número + Fecha */}
                          <div className="flex items-center gap-3 flex-shrink-0 sm:w-40">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                              esAnulada
                                ? 'bg-amber-100 text-amber-700'
                                : esPendiente
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] text-white shadow-sm shadow-purple-500/20'
                            }`}>
                              {citaIdx + 1}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-bold leading-tight ${
                                esPendiente ? 'text-blue-500 italic' : esAnulada ? 'text-gray-400 line-through' : 'text-gray-800'
                              }`}>
                                {esAnulada
                                  ? (cita.fecha ? formatearFecha(cita.fecha) : 'Anulada')
                                  : esPendiente
                                    ? 'Sin agendar'
                                    : formatearFecha(cita.fecha)}
                              </p>
                              <p className={`text-[11px] mt-0.5 flex items-center gap-1 ${
                                esPendiente ? 'text-blue-300' : 'text-gray-400'
                              }`}>
                                <Clock className="w-3 h-3" />
                                {esPendiente || esAnulada ? '—' : formatearHora(cita.hora)}
                              </p>
                            </div>
                          </div>

                          {/* 2. Especialista y Motivo (con espacio suficiente) */}
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
                            <div>
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Especialista</p>
                              <p className={`text-xs font-medium flex items-start gap-1.5 ${
                                esPendiente ? 'text-blue-300' : 'text-gray-700'
                              }`}>
                                <User className="w-3.5 h-3.5 flex-shrink-0 text-gray-400 mt-0.5" />
                                <span className="break-words leading-snug">{cita.especialista || '—'}</span>
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Motivo</p>
                              <p className={`text-xs font-medium break-words leading-snug ${
                                esPendiente ? 'text-blue-300' : 'text-gray-700'
                              }`}>
                                {cita.motivo_nombre || '—'}
                              </p>
                            </div>
                          </div>

                          {/* 3. Badge de Asistencia */}
                          <div className="flex-shrink-0 pt-1 sm:pt-0">
                            <AsistenciaBadge
                              recepcion_estado_id={cita.recepcion_estado_id}
                              terapeuta_estado_id={cita.terapeuta_estado_id}
                              programada={cita.programada}
                              anulada={cita.anulada}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {citasOrdenadas.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-xs text-gray-400">No hay citas en esta venta</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 flex-wrap gap-3">
          <div className="text-xs text-gray-500">
            Mostrando {inicio + 1}-{Math.min(fin, totalVentas)} de {totalVentas} ventas
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
              disabled={paginaActual === 1}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium transition-all ${
                paginaActual === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-200 hover:text-[#7B1FA2]'
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
                  className={`w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                    paginaActual === numPagina
                      ? 'bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white shadow-md shadow-purple-500/30'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-200'
                  }`}
                >
                  {numPagina}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
              disabled={paginaActual === totalPaginas}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium transition-all ${
                paginaActual === totalPaginas
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-200 hover:text-[#7B1FA2]'
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