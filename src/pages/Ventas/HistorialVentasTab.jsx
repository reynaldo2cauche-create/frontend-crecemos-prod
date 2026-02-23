import React, { useState, useEffect } from 'react';
import {
  EyeIcon,
  ShoppingCartIcon,
  CubeIcon,
  XMarkIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import {
  getVentasServicios,
  getVentasProductos,
  TIPOS_PAGADOR,
} from '../../services/ventasService';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatFecha = (f) =>
  f ? new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const formatMonto = (n) => `S/ ${parseFloat(n || 0).toFixed(2)}`;

const tipoPagadorNombre = (id) => {
  switch (id) {
    case TIPOS_PAGADOR.PACIENTE:    return 'Paciente';
    case TIPOS_PAGADOR.RESPONSABLE: return 'Responsable';
    case TIPOS_PAGADOR.EXTERNO:     return 'Externo';
    default: return '—';
  }
};

// Badge de comprobante: color distinto por tipo
const ComprobanteLabel = ({ nombre, id }) => {
  const estilos = {
    1: 'bg-gray-100 text-gray-600',       // Nota de Venta
    2: 'bg-blue-50 text-blue-700',         // Boleta
    3: 'bg-emerald-50 text-emerald-700',   // Factura
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estilos[id] || 'bg-gray-100 text-gray-600'}`}>
      {nombre || '—'}
    </span>
  );
};

// ─── Calcula IGV desglosado según tipo de comprobante ────────────────────────
const calcularIgv = (total, tipoComprobanteId) => {
  const conIgv = tipoComprobanteId === 2 || tipoComprobanteId === 3;
  if (!conIgv) return { base: parseFloat(total || 0), igv: 0, conIgv: false };
  const t   = parseFloat(total || 0);
  const igv = t - t / 1.18;
  return { base: t / 1.18, igv, conIgv: true };
};

// ─── Modal Detalle ────────────────────────────────────────────────────────────
const DetalleVentaModal = ({ venta, tipo, onClose }) => {
  const { base, igv, conIgv } = calcularIgv(venta.total, venta.tipo_comprobante?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {tipo === 'servicio'
              ? <ShoppingCartIcon className="w-5 h-5 text-[#7B1FA2]" />
              : <CubeIcon className="w-5 h-5 text-[#7B1FA2]" />}
            <h2 className="font-bold text-gray-900">
              Detalle de Venta de {tipo === 'servicio' ? 'Servicio' : 'Producto'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-4">
          {/* Info General */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-xs text-gray-500">Fecha</p>
              <p className="font-semibold text-gray-900">{formatFecha(venta.fecha_venta)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Comprobante</p>
              <div className="mt-0.5">
                <ComprobanteLabel nombre={venta.tipo_comprobante?.nombre} id={venta.tipo_comprobante?.id} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Tipo de Pagador</p>
              <p className="font-semibold text-gray-900">{tipoPagadorNombre(venta.tipo_pagador_id || venta.tipo_comprador_id)}</p>
            </div>
            {venta.paciente && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Paciente</p>
                <p className="font-semibold text-gray-900">
                  {venta.paciente.nombres} {venta.paciente.apellido_paterno} {venta.paciente.apellido_materno || ''}
                </p>
              </div>
            )}
            {venta.responsable && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Responsable (quien paga)</p>
                <p className="font-semibold text-gray-900">
                  {venta.responsable.nombres} {venta.responsable.apellido_paterno} {venta.responsable.apellido_materno || ''}
                </p>
              </div>
            )}
            {venta.comprador_externo && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Comprador Externo</p>
                <p className="font-semibold text-gray-900">
                  {venta.comprador_externo.nombre} - DNI: {venta.comprador_externo.dni}
                </p>
              </div>
            )}
            {venta.nota && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Nota</p>
                <p className="text-sm text-gray-700">{venta.nota}</p>
              </div>
            )}
          </div>

          {/* Detalles de líneas */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              {tipo === 'servicio' ? 'Servicios vendidos' : 'Productos vendidos'}
            </p>
            <div className="space-y-2">
              {(venta.detalles || []).map((d, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm text-gray-900">
                          {tipo === 'servicio'
                            ? d.servicio?.nombre || d.paquete?.nombre || '—'
                            : d.producto?.nombre || '—'}
                        </p>
                        {tipo === 'servicio' && d.tipo_venta?.nombre && (
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                            d.tipo_venta.nombre.toLowerCase().includes('paquete')
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {d.tipo_venta.nombre}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {tipo === 'servicio' ? (
                          <>
                            {d.sesiones_totales} sesión(es) × {formatMonto(d.precio_unitario)} = {formatMonto(d.sesiones_totales * d.precio_unitario)}
                            {d.paciente && (
                              <span className="block mt-1 text-purple-600 font-medium">
                                Para: {d.paciente.nombres} {d.paciente.apellido_paterno} {d.paciente.apellido_materno || ''}
                              </span>
                            )}
                          </>
                        ) : (
                          <>{d.cantidad} unid. × {formatMonto(d.precio_unitario)} = {formatMonto(d.cantidad * d.precio_unitario)}</>
                        )}
                      </p>
                      {d.descuento_monto > 0 && (
                        <p className="text-xs text-amber-600 font-medium mt-1">
                          Descuento: - {formatMonto(d.descuento_monto)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500 font-medium">Subtotal de línea:</span>
                    <span className="font-bold text-gray-900">{formatMonto(d.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales con IGV desglosado */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">{formatMonto(venta.subtotal)}</span>
            </div>
            {venta.descuento_monto > 0 && (
              <div className="flex justify-between text-sm text-amber-600">
                <span>Descuento global:</span>
                <span className="font-semibold">- {formatMonto(venta.descuento_monto)}</span>
              </div>
            )}

            {/* Desglose IGV solo si aplica */}
            {conIgv ? (
              <>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Base imponible:</span>
                  <span className="font-semibold">{formatMonto(base)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>IGV (18% incluido):</span>
                  <span className="font-semibold">{formatMonto(igv)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-sm text-gray-400">
                <span>IGV:</span>
                <span className="text-xs italic">No aplica (Nota de Venta)</span>
              </div>
            )}

            <div className="flex justify-between text-lg font-bold text-[#7B1FA2] pt-2 border-t">
              <span>TOTAL:</span>
              <span>{formatMonto(venta.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────────
const HistorialVentasTab = () => {
  const [ventasServicios, setVentasServicios] = useState([]);
  const [ventasProductos, setVentasProductos] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filtros, setFiltros]   = useState({ tipo: 'todos', fechaDesde: '', fechaHasta: '' });
  const [ventaDetalle, setVentaDetalle] = useState(null);
  const [tipoDetalle, setTipoDetalle]   = useState(null);

  useEffect(() => { cargarVentas(); }, []);

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const filtrosAPI = {};
      if (filtros.fechaDesde) filtrosAPI.desde = filtros.fechaDesde;
      if (filtros.fechaHasta) filtrosAPI.hasta = filtros.fechaHasta;

      const [servsData, prodsData] = await Promise.all([
        getVentasServicios(filtrosAPI),
        getVentasProductos(filtrosAPI),
      ]);
      setVentasServicios(servsData || []);
      setVentasProductos(prodsData || []);
    } catch (err) {
      console.error('Error cargando ventas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Combinar, ordenar y filtrar
  const ventasCombinadas = [
    ...ventasServicios.map(v => ({ ...v, tipo: 'servicio' })),
    ...ventasProductos.map(v => ({ ...v, tipo: 'producto' })),
  ].sort((a, b) => new Date(b.fecha_venta) - new Date(a.fecha_venta));

  const ventasFiltradas = filtros.tipo === 'todos'
    ? ventasCombinadas
    : ventasCombinadas.filter(v =>
        filtros.tipo === 'servicios' ? v.tipo === 'servicio' : v.tipo === 'producto'
      );

  // Estadísticas
  const totalMonto     = ventasFiltradas.reduce((acc, v) => acc + parseFloat(v.total || 0), 0);
  const totalServicios = ventasServicios.length;
  const totalProductos = ventasProductos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Historial de Ventas</h1>
          <p className="text-sm text-gray-500 mt-1">Consulta todas las ventas de servicios y productos</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Ventas',    value: ventasFiltradas.length, icon: <ShoppingCartIcon className="w-5 h-5 text-[#7B1FA2]" />, bg: 'bg-[#7B1FA2]/10' },
            { label: 'Total Ingresos',  value: formatMonto(totalMonto), icon: <span className="text-lg font-bold text-green-600">S/</span>, bg: 'bg-green-50' },
            { label: 'Servicios',       value: totalServicios, icon: <ShoppingCartIcon className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50' },
            { label: 'Productos',       value: totalProductos, icon: <CubeIcon className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-500 font-medium">{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de Venta</label>
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros(f => ({ ...f, tipo: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]"
              >
                <option value="todos">Todos</option>
                <option value="servicios">Solo Servicios</option>
                <option value="productos">Solo Productos</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Desde</label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => setFiltros(f => ({ ...f, fechaDesde: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Hasta</label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => setFiltros(f => ({ ...f, fechaHasta: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={cargarVentas}
                className="w-full px-4 py-2 text-sm font-semibold text-white bg-[#7B1FA2] rounded-lg hover:bg-[#6A1B9A] transition-colors"
              >
                Filtrar
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin" />
            </div>
          ) : ventasFiltradas.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingCartIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No hay ventas registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Tipo</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Comprobante</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Fecha</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Pagador</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Cliente</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase">Items</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Base</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">IGV</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Total</th>
                    <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase">Ver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ventasFiltradas.map(v => {
                    const { base, igv, conIgv } = calcularIgv(v.total, v.tipo_comprobante?.id);
                    return (
                      <tr key={`${v.tipo}-${v.id}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          {v.tipo === 'servicio' ? (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">Servicio</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold">Producto</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <ComprobanteLabel nombre={v.tipo_comprobante?.nombre} id={v.tipo_comprobante?.id} />
                        </td>
                        <td className="px-4 py-4 text-gray-700">{formatFecha(v.fecha_venta)}</td>
                        <td className="px-4 py-4 text-gray-600 text-xs">
                          {tipoPagadorNombre(v.tipo_pagador_id || v.tipo_comprador_id)}
                        </td>
                        <td className="px-4 py-4 text-gray-900 text-sm">
                          {v.paciente
                            ? `${v.paciente.nombres} ${v.paciente.apellido_paterno} ${v.paciente.apellido_materno || ''}`.trim()
                            : v.responsable
                            ? `${v.responsable.nombres} ${v.responsable.apellido_paterno} ${v.responsable.apellido_materno || ''}`.trim()
                            : v.comprador_externo
                            ? v.comprador_externo.nombre
                            : '—'}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                            {(v.detalles || []).length}
                          </span>
                        </td>
                        {/* Base imponible o total si no hay IGV */}
                        <td className="px-4 py-4 text-right text-sm text-gray-600">
                          {formatMonto(base)}
                        </td>
                        {/* IGV o guión */}
                        <td className="px-4 py-4 text-right text-sm text-gray-500">
                          {conIgv ? formatMonto(igv) : <span className="text-gray-300 text-xs">—</span>}
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-gray-900">
                          {formatMonto(v.total)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => { setVentaDetalle(v); setTipoDetalle(v.tipo); }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#7B1FA2] hover:bg-purple-50 transition-colors"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Contador */}
        {!loading && (
          <p className="text-xs text-gray-400 text-right">
            {ventasFiltradas.length} venta{ventasFiltradas.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Modal Detalle */}
      {ventaDetalle && (
        <DetalleVentaModal
          venta={ventaDetalle}
          tipo={tipoDetalle}
          onClose={() => { setVentaDetalle(null); setTipoDetalle(null); }}
        />
      )}
    </div>
  );
};

export default HistorialVentasTab;