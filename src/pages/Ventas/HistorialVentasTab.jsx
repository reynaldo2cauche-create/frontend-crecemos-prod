import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  EyeIcon,
  ShoppingCartIcon,
  CubeIcon,
  ClockIcon,
  PrinterIcon,
  SparklesIcon,
  PencilIcon,
  TrashIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useBusquedaPacientes } from '../../hooks/useBusquedaPacientes';
import { obtenerModalidadesPago } from '../../services/solicitudInformeService';
import {
  getHistorialVentas,
  eliminarVentaServicio,
  eliminarVentaProducto,
  getVentaServicioById,
  getVentaProductoById,
  actualizarVentaServicio,
  actualizarVentaProducto,
  verificarVentaServicioTieneCitas,
  validarPagoVentaServicio,
  validarPagoVentaProducto,
} from '../../services/ventasService';
import { verificarVentaTieneSolicitudInforme } from '../../services/solicitudInformeService';
import PrintPreviewModal, { getServicioNombre, getMotivoCita } from '../../components/Ventas/TicketComponents';
import DetalleVentaModal from '../../components/Ventas/DetalleVentaModal';
import EditarVentaModal from '../../components/Ventas/EditarVentaModal';
import ConfirmarEliminarModal from '../../components/Ventas/ConfirmarEliminarModal';
import FeedbackModal from '../../components/Ventas/FeedbackModal';
import {
  formatFecha,
  formatMonto,
  tipoPagadorNombre,
  calcularIgv,
  ComprobanteLabel,
  DescuentoLabel,
  PanelPromocionesDetalle,
} from '../../components/Ventas/VentaUtils';

// ─── Componente Principal ─────────────────────────────────────────────────────

const HistorialVentasTab = () => {
  const [historialData, setHistorialData]   = useState([]);
  const [totalVentas, setTotalVentas]       = useState(0);
  const [totalMontoFiltrado, setTotalMontoFiltrado] = useState(0);
  const [totalMontoGlobal, setTotalMontoGlobal] = useState(0);
  const [totalServicios, setTotalServicios] = useState(0);
  const [totalProductos, setTotalProductos] = useState(0);
  const [loading, setLoading]               = useState(true);
  const [filtros, setFiltros]               = useState({ tipo: 'todos', fechaDesde: '', fechaHasta: '', metodoPagoId: '' });
  const [modalidades, setModalidades]       = useState([]);
  const [queryPaciente, setQueryPaciente]   = useState('');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [showDropdownPaciente, setShowDropdownPaciente] = useState(false);
  const { pacientes: resultadosPaciente, loading: loadingPaciente } = useBusquedaPacientes(queryPaciente);
  const [ventaDetalle, setVentaDetalle]     = useState(null);
  const [tipoDetalle, setTipoDetalle]       = useState(null);
  const [ventaImprimir, setVentaImprimir]   = useState(null);
  const [ventaEliminar, setVentaEliminar]   = useState(null);
  const [ventaEditar, setVentaEditar]       = useState(null);
  const [procesando, setProcesando]         = useState(false);
  const [page, setPage]                     = useState(0);
  const [rowsPerPage, setRowsPerPage]       = useState(12);
  const [feedback, setFeedback]             = useState(null);
  const [validando, setValidando]           = useState(null); // id procesando

  // Indicador de scroll horizontal de la tabla
  const scrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ left: false, right: false });
  const actualizarScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setScrollState({
      left: scrollLeft > 4,
      right: scrollLeft + clientWidth < scrollWidth - 4,
    });
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const esAdmision = user?.rol?.id === 2;
  const esAdministrador = user?.rol?.id === 1;

  useEffect(() => { obtenerModalidadesPago().then(setModalidades).catch(() => {}); }, []);
  useEffect(() => { cargarVentas(); }, [page, rowsPerPage, filtros.tipo, filtros.fechaDesde, filtros.fechaHasta, filtros.metodoPagoId, pacienteSeleccionado]);

  // Recalcular indicador de scroll cuando cambian los datos o el tamaño de ventana
  useEffect(() => {
    actualizarScroll();
    window.addEventListener('resize', actualizarScroll);
    return () => window.removeEventListener('resize', actualizarScroll);
  }, [historialData, loading, actualizarScroll]);

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const params = { page, limit: rowsPerPage, tipo: filtros.tipo };
      if (filtros.fechaDesde) params.desde = filtros.fechaDesde;
      if (filtros.fechaHasta) params.hasta = filtros.fechaHasta;
      if (filtros.metodoPagoId) params.metodoPagoId = filtros.metodoPagoId;
      if (pacienteSeleccionado) params.pacienteId = pacienteSeleccionado.id;
      const res = await getHistorialVentas(params);
      setHistorialData(res.data || []);
      setTotalVentas(res.total || 0);
      setTotalMontoFiltrado(res.totalMonto || 0);
      setTotalMontoGlobal(res.totalMontoGlobal || 0);

      // Totales por tipo sobre todo el conjunto filtrado (no solo la página visible)
      if (res.totalServicios != null && res.totalProductos != null) {
        setTotalServicios(res.totalServicios);
        setTotalProductos(res.totalProductos);
      } else if (filtros.tipo === 'servicios') {
        setTotalServicios(res.total || 0);
        setTotalProductos(0);
      } else if (filtros.tipo === 'productos') {
        setTotalServicios(0);
        setTotalProductos(res.total || 0);
      } else {
        // 'todos': consulta ligera para contar servicios y deducir productos
        const resServ = await getHistorialVentas({ ...params, tipo: 'servicios', page: 0, limit: 1 });
        const servicios = resServ.total || 0;
        setTotalServicios(servicios);
        setTotalProductos(Math.max((res.total || 0) - servicios, 0));
      }
    } catch (err) { console.error('Error cargando ventas:', err); }
    finally { setLoading(false); }
  };

  const verificarSolicitudInforme = async (ventaId) => {
    try {
      const { tieneSolicitud, mensaje } = await verificarVentaTieneSolicitudInforme(ventaId);
      return { tieneSolicitud, mensaje };
    } catch {
      return { tieneSolicitud: false };
    }
  };

  const handleClickEliminar = async (venta) => {
    if (venta.tipo === 'servicio') {
      try {
        const { tieneCitas, mensaje } = await verificarVentaServicioTieneCitas(venta.id);
        if (tieneCitas) {
          setFeedback({ tipo: 'error', mensaje: `❌ No se puede eliminar: ${mensaje || 'Esta venta tiene citas asociadas'}` });
          return;
        }
      } catch {
        setFeedback({ tipo: 'error', mensaje: 'Error al verificar la venta' });
        return;
      }
      const { tieneSolicitud, mensaje: msgInforme } = await verificarSolicitudInforme(venta.id);
      if (tieneSolicitud) {
        setFeedback({ tipo: 'error', mensaje: `❌ No se puede eliminar: ${msgInforme || 'Esta venta tiene una solicitud de informe asociada'}` });
        return;
      }
    }
    setVentaEliminar(venta);
  };

  const handleClickEditar = async (venta) => {
    let detallesProtegidos = false;
    if (venta.tipo === 'servicio') {
      try {
        const { tieneCitas } = await verificarVentaServicioTieneCitas(venta.id);
        if (tieneCitas) detallesProtegidos = true;
      } catch { /* continuar sin el flag */ }
      try {
        const { tieneSolicitud } = await verificarSolicitudInforme(venta.id);
        if (tieneSolicitud) detallesProtegidos = true;
      } catch { /* continuar sin el flag */ }
    }
    try {
      const ventaCompleta = venta.tipo === 'servicio'
        ? await getVentaServicioById(venta.id)
        : await getVentaProductoById(venta.id);
      setVentaEditar({ ...ventaCompleta, tipo: venta.tipo, tieneCitas: detallesProtegidos });
    } catch {
      setVentaEditar({ ...venta, tieneCitas: detallesProtegidos });
    }
  };

  const handleEliminarVenta = async () => {
    if (!ventaEliminar) return;
    setProcesando(true);
    try {
      if (ventaEliminar.tipo === 'servicio') {
        await eliminarVentaServicio(ventaEliminar.id);
      } else {
        await eliminarVentaProducto(ventaEliminar.id);
      }
      setFeedback({ tipo: 'exito', mensaje: 'Venta eliminada correctamente' });
      setVentaEliminar(null);
      await cargarVentas();
    } catch (err) {
      setFeedback({ tipo: 'error', mensaje: err.response?.data?.message || 'Error al eliminar la venta' });
    } finally {
      setProcesando(false);
    }
  };

  const handleEditarVenta = async (payload) => {
    if (!ventaEditar) return;
    setProcesando(true);
    try {
      if (ventaEditar.tipo === 'servicio') {
        await actualizarVentaServicio(ventaEditar.id, payload);
      } else {
        await actualizarVentaProducto(ventaEditar.id, payload);
      }
      setFeedback({ tipo: 'exito', mensaje: 'Venta actualizada correctamente' });
      setVentaEditar(null);
      await cargarVentas();
    } catch (err) {
      setFeedback({ tipo: 'error', mensaje: err.response?.data?.message || 'Error al actualizar la venta' });
    } finally {
      setProcesando(false);
    }
  };

  const handleValidarPago = async (venta, pago) => {
    const key = `pago-${pago.id}`;
    if (validando === key) return;
    setValidando(key);
    try {
      const updated = venta.tipo === 'servicio'
        ? await validarPagoVentaServicio(pago.id)
        : await validarPagoVentaProducto(pago.id);
      // Actualizar solo ese pago dentro de la venta en el estado local
      setHistorialData(prev => prev.map(item => {
        if (item.tipo !== venta.tipo || item.id !== venta.id) return item;
        return {
          ...item,
          pagos: (item.pagos || []).map(p =>
            p.id === pago.id ? { ...p, ...updated } : p
          ),
        };
      }));
    } catch {
      setFeedback({ tipo: 'error', mensaje: 'Error al actualizar validación de pago' });
    } finally {
      setValidando(null);
    }
  };

  const hayFiltros = filtros.tipo !== 'todos' || filtros.fechaDesde || filtros.fechaHasta || filtros.metodoPagoId || pacienteSeleccionado;
  const totalMonto = hayFiltros ? totalMontoFiltrado : totalMontoGlobal;
  const ventasPaginadas = historialData;
  const totalPages = Math.ceil(totalVentas / rowsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1.5">
            <ClockIcon className="w-8 h-8 text-[#7B1FA2]" />
            <h1 className="text-3xl font-bold text-gray-900">Historial de Ventas</h1>
          </div>
          <p className="text-sm text-gray-500">Consulta todas las ventas de servicios y productos</p>
        </div>

        {!esAdmision && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Ventas',   value: totalVentas,             icon: <ShoppingCartIcon className="w-5 h-5 text-[#7B1FA2]" />, bg: 'bg-[#7B1FA2]/10' },
              { label: 'Total Ingresos', value: formatMonto(totalMonto), icon: <span className="text-lg font-bold text-green-600">S/</span>, bg: 'bg-green-50' },
              { label: 'Servicios',      value: totalServicios, icon: <ShoppingCartIcon className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50' },
              { label: 'Productos',      value: totalProductos, icon: <CubeIcon className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>{s.icon}</div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">{s.value}</div>
                    <div className="text-xs text-gray-500 font-medium">{s.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
            <div className="relative sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Paciente</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={pacienteSeleccionado ? pacienteSeleccionado.nombre_completo : queryPaciente}
                  onChange={e => { setQueryPaciente(e.target.value); setPacienteSeleccionado(null); setShowDropdownPaciente(true); }}
                  onFocus={() => setShowDropdownPaciente(true)}
                  onBlur={() => setTimeout(() => setShowDropdownPaciente(false), 150)}
                  placeholder="Buscar paciente..."
                  className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]"
                />
                {(pacienteSeleccionado || queryPaciente) && (
                  <button onClick={() => { setPacienteSeleccionado(null); setQueryPaciente(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {showDropdownPaciente && queryPaciente.length >= 2 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                  {loadingPaciente ? (
                    <div className="px-4 py-3 text-sm text-gray-400">Buscando...</div>
                  ) : resultadosPaciente.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400">Sin resultados</div>
                  ) : resultadosPaciente.map(p => (
                    <button key={p.id} onMouseDown={() => { setPacienteSeleccionado(p); setQueryPaciente(''); setShowDropdownPaciente(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#7B1FA2]/5 transition-colors border-b border-gray-50 last:border-0">
                      <span className="font-medium text-gray-900">{p.nombre_completo}</span>
                      <span className="text-xs text-gray-400 ml-2">{p.numero_documento}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de Venta</label>
              <select value={filtros.tipo} onChange={e => { setFiltros(f => ({ ...f, tipo: e.target.value })); setPage(0); }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]">
                <option value="todos">Todos</option>
                <option value="servicios">Solo Servicios</option>
                <option value="productos">Solo Productos</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Método de Pago</label>
              <select value={filtros.metodoPagoId} onChange={e => { setFiltros(f => ({ ...f, metodoPagoId: e.target.value })); setPage(0); }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]">
                <option value="">Todos</option>
                {modalidades.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Desde</label>
              <input type="date" value={filtros.fechaDesde} onChange={e => { setFiltros(f => ({ ...f, fechaDesde: e.target.value })); setPage(0); }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Hasta</label>
              <input type="date" value={filtros.fechaHasta} onChange={e => { setFiltros(f => ({ ...f, fechaHasta: e.target.value })); setPage(0); }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]" />
            </div>
            <div className="flex items-end sm:col-span-6">
              <button onClick={cargarVentas}
                className="px-6 py-2 text-sm font-semibold text-white bg-[#7B1FA2] rounded-lg hover:bg-[#6A1B9A] transition-colors">
                Filtrar
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin" />
            </div>
          ) : totalVentas === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingCartIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No hay ventas registradas</p>
            </div>
          ) : (
            <div className="relative">
              {/* Degradado indicador: hay más columnas a la izquierda */}
              <div className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-gray-200/70 to-transparent transition-opacity duration-200 ${scrollState.left ? 'opacity-100' : 'opacity-0'}`} />
              {/* Degradado indicador: hay más columnas a la derecha */}
              <div className={`pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-gray-200/80 to-transparent transition-opacity duration-200 ${scrollState.right ? 'opacity-100' : 'opacity-0'}`} />
              {scrollState.right && (
                <div className="pointer-events-none absolute right-2 top-3 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-[#7B1FA2] text-white text-[10px] font-semibold shadow-md animate-pulse">
                  Desliza <ChevronRight className="w-3 h-3" />
                </div>
              )}
              <div ref={scrollRef} onScroll={actualizarScroll} className="overflow-x-auto scrollbar-visible">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-3 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-tight whitespace-nowrap">Tipo</th>
                    <th className="text-left px-2.5 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-tight whitespace-nowrap">Comprobante</th>
                    <th className="text-left px-2.5 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-tight whitespace-nowrap">Fecha y Hora</th>
                    <th className="text-left px-2.5 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-tight whitespace-nowrap">Pagador</th>
                    <th className="text-left px-2.5 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-tight whitespace-nowrap">Cliente</th>
                    <th className="text-center px-2.5 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-tight whitespace-nowrap">Items</th>
                    <th className="text-center px-2.5 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-tight whitespace-nowrap">Promos</th>
                    <th className="text-right px-2.5 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-tight whitespace-nowrap">IGV</th>
                    <th className="text-right px-2.5 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-tight whitespace-nowrap">Total</th>
                    <th className="text-left px-2.5 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-tight whitespace-nowrap">Nro Operación</th>
                    <th className="text-center px-2.5 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-tight whitespace-nowrap">Pago validado</th>
                    <th className="text-center px-3 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-tight whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ventasPaginadas.map(v => {
                    const { igv, conIgv } = calcularIgv(v.total, v.tipo_comprobante?.id);
                    const promos = v.promociones_aplicadas || [];
                    return (
                      <tr key={`${v.tipo}-${v.id}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3 align-top">
                          {v.tipo === 'servicio'
                            ? <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">Servicio</span>
                            : <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold">Producto</span>}
                        </td>
                        <td className="px-2.5 py-3 align-top">
                          <div className="space-y-0.5">
                            <ComprobanteLabel nombre={v.tipo_comprobante?.nombre} id={v.tipo_comprobante?.id} />
                            {v.codigo_comprobante && <p className="text-xs font-mono font-semibold text-purple-700">{v.codigo_comprobante}</p>}
                          </div>
                        </td>
                        <td className="px-2.5 py-3 text-gray-700 align-top whitespace-nowrap">
                          <div className="text-xs font-medium">{formatFecha(v.fecha_venta)}</div>
                          {v.created_at && (
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              {new Date(v.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                          )}
                        </td>
                        <td className="px-2.5 py-3 text-gray-600 text-xs align-top">{tipoPagadorNombre(v.tipo_pagador_id || v.tipo_comprador_id)}</td>
                        <td className="px-2.5 py-3 text-gray-900 text-xs align-top">
                          {v.paciente
                            ? `${v.paciente.nombres} ${v.paciente.apellido_paterno} ${v.paciente.apellido_materno || ''}`.trim()
                            : v.responsable
                            ? `${v.responsable.nombres} ${v.responsable.apellido_paterno} ${v.responsable.apellido_materno || ''}`.trim()
                            : v.comprador_externo ? v.comprador_externo.nombre : '—'}
                        </td>
                        <td className="px-2.5 py-3 text-center align-top">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{(v.detalles || []).length}</span>
                        </td>
                        <td className="px-2.5 py-3 text-center align-top">
                          {promos.length > 0
                            ? <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                                <SparklesIcon className="w-3 h-3" />{promos.length}
                              </span>
                            : <span className="text-gray-300 text-xs">—</span>}
                        </td>
                        <td className="px-2.5 py-3 text-right text-xs text-gray-500 align-top whitespace-nowrap">
                          {conIgv ? formatMonto(igv) : <span className="text-gray-300 text-xs">—</span>}
                        </td>
                        <td className="px-2.5 py-3 text-right text-sm font-bold text-gray-900 align-top whitespace-nowrap">{formatMonto(v.total)}</td>

                        {/* Nro Operación */}
                        <td className="px-2.5 py-3 align-top">
                          {(v.pagos || []).length === 0 ? (
                            <span className="text-xs text-gray-300">—</span>
                          ) : (
                            <div className="space-y-2">
                              {(v.pagos || []).map(pago => (
                                <div key={pago.id} className="text-xs">
                                  {pago.referencia
                                    ? <span className="font-mono font-semibold text-gray-800">{pago.referencia}</span>
                                    : <span className="text-gray-300">—</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Pago validado — checkbox por método de pago */}
                        <td className="px-2.5 py-3 align-top">
                          {(v.pagos || []).length === 0 ? (
                            <span className="text-xs text-gray-300 italic">Sin pagos</span>
                          ) : (
                            <div className="space-y-2">
                              {(v.pagos || []).map(pago => {
                                const key = `pago-${pago.id}`;
                                const cargando = validando === key;
                                const validado = !!pago.pago_validado;
                                const validadoPor = pago.validado_por
                                  ? [pago.validado_por.nombres, pago.validado_por.apellidos].filter(Boolean).join(' ')
                                  : null;
                                const validadoAt = pago.pago_validado_at
                                  ? new Date(pago.pago_validado_at).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                  : null;
                                return (
                                  <div key={pago.id} className="flex items-start gap-2">
                                    <div
                                      onClick={() => esAdministrador && !validado && !cargando && handleValidarPago(v, pago)}
                                      title={validado
                                        ? `Validado por: ${validadoPor ?? '—'}\nFecha: ${validadoAt ?? '—'}`
                                        : esAdministrador
                                        ? 'Clic para marcar como validado'
                                        : 'Solo el administrador puede validar pagos'}
                                      className={`mt-0.5 w-4 h-4 shrink-0 rounded border-2 flex items-center justify-center transition-all ${
                                        validado
                                          ? 'bg-green-500 border-green-500 cursor-default'
                                          : cargando
                                          ? 'border-gray-300 bg-gray-100 cursor-wait'
                                          : esAdministrador
                                          ? 'border-gray-300 bg-white hover:border-green-400 cursor-pointer'
                                          : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                                      }`}
                                    >
                                      {validado && (
                                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 10" fill="none">
                                          <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      )}
                                      {cargando && !validado && (
                                        <div className="w-2 h-2 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className={`text-xs font-medium ${validado ? 'text-green-700' : 'text-gray-600'}`}>
                                        {pago.modalidad_pago?.nombre ?? '—'}
                                        <span className="font-normal text-gray-500 ml-1">S/ {Number(pago.monto || 0).toFixed(2)}</span>
                                      </div>
                                      {validado && validadoPor && (
                                        <div className="text-[10px] text-green-500 leading-tight">{validadoPor}</div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>

                        <td className="px-3 py-3 align-top">
                          <div className="flex items-center justify-center gap-0.5">
                            <button onClick={() => { setVentaDetalle(v); setTipoDetalle(v.tipo); }} title="Ver detalle"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-[#7B1FA2] hover:bg-purple-50 transition-colors">
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => setVentaImprimir(v)} title="Imprimir"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-[#7B1FA2] hover:bg-purple-50 transition-colors">
                              <PrinterIcon className="w-4 h-4" />
                            </button>
                            {!esAdmision && (
                              <>
                                <button onClick={() => handleClickEditar(v)} title="Editar venta"
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleClickEliminar(v)} title="Eliminar venta"
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>

        {!loading && totalVentas > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-gray-600">
                Mostrando <span className="font-semibold text-gray-900">{page * rowsPerPage + 1}</span> a{' '}
                <span className="font-semibold text-gray-900">{Math.min((page + 1) * rowsPerPage, totalVentas)}</span>{' '}
                de <span className="font-semibold text-gray-900">{totalVentas}</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-2 w-full sm:w-auto">
                <select value={rowsPerPage} onChange={e => { setPage(0); setRowsPerPage(parseInt(e.target.value)); }}
                  className="w-full sm:w-auto px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] cursor-pointer">
                  <option value={6}>6 por página</option>
                  <option value={12}>12 por página</option>
                  <option value={24}>24 por página</option>
                </select>
                <div className="flex gap-1">
                  <button onClick={() => setPage(0)} disabled={page === 0}
                    className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 3)            pageNum = i;
                    else if (page < 2)              pageNum = i;
                    else if (page > totalPages - 3) pageNum = totalPages - 3 + i;
                    else                            pageNum = page - 1 + i;
                    return (
                      <button key={pageNum} onClick={() => setPage(pageNum)}
                        className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${page === pageNum ? 'bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                        {pageNum + 1}
                      </button>
                    );
                  })}
                  <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                    className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {ventaDetalle && (
        <DetalleVentaModal
          venta={ventaDetalle}
          tipo={tipoDetalle}
          onClose={() => { setVentaDetalle(null); setTipoDetalle(null); }}
        />
      )}
      {ventaImprimir && (
        <PrintPreviewModal venta={ventaImprimir} tipo={ventaImprimir.tipo} onClose={() => setVentaImprimir(null)} />
      )}
      {ventaEliminar && (
        <ConfirmarEliminarModal
          venta={ventaEliminar}
          tipo={ventaEliminar.tipo}
          onConfirm={handleEliminarVenta}
          onClose={() => setVentaEliminar(null)}
          loading={procesando}
        />
      )}
      {ventaEditar && (
        <EditarVentaModal
          venta={ventaEditar}
          tipo={ventaEditar.tipo}
          tieneCitas={ventaEditar.tieneCitas}
          onGuardar={handleEditarVenta}
          onClose={() => setVentaEditar(null)}
          loading={procesando}
        />
      )}
      {feedback && (
        <FeedbackModal
          tipo={feedback.tipo}
          mensaje={feedback.mensaje}
          onClose={() => setFeedback(null)}
        />
      )}
    </div>
  );
};

// Re-exports para compatibilidad con otros archivos que importan desde aquí
export {
  formatFecha,
  formatMonto,
  tipoPagadorNombre,
  calcularIgv,
  getServicioNombre,
  getMotivoCita,
  ComprobanteLabel,
  DescuentoLabel,
  PanelPromocionesDetalle,
};
export { default as DetalleVentaModal } from '../../components/Ventas/DetalleVentaModal';
export default HistorialVentasTab;
