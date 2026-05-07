import React, { useState } from 'react';
import {
  ShoppingCartIcon,
  CubeIcon,
  XMarkIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import PrintPreviewModal, { getServicioNombre, getMotivoCita } from './TicketComponents';
import {
  formatFecha,
  formatMonto,
  tipoPagadorNombre,
  calcularIgv,
  ComprobanteLabel,
  DescuentoLabel,
  PanelPromocionesDetalle,
} from './VentaUtils';

const DetalleVentaModal = ({ venta, tipo, onClose }) => {
  const [mostrarPrint, setMostrarPrint] = useState(false);
  const { base, igv, conIgv } = calcularIgv(venta.total, venta.tipo_comprobante?.id);
  const promociones = venta.promociones_aplicadas || [];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              {tipo === 'servicio'
                ? <ShoppingCartIcon className="w-4 h-4 text-[#7B1FA2]" />
                : <CubeIcon className="w-4 h-4 text-[#7B1FA2]" />}
              <h2 className="font-bold text-sm text-gray-900">
                Detalle de Venta de {tipo === 'servicio' ? 'Servicio' : 'Producto'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMostrarPrint(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#7B1FA2] text-white text-xs font-medium rounded-lg hover:bg-[#6A1B9A] transition-colors"
              >
                <PrinterIcon className="w-3.5 h-3.5" />Imprimir
              </button>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
                <XMarkIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto px-4 py-3 space-y-3">
            {/* Info cabecera */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Fecha</p>
                <p className="font-semibold text-sm text-gray-900">{formatFecha(venta.fecha_venta)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Comprobante</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <ComprobanteLabel nombre={venta.tipo_comprobante?.nombre} id={venta.tipo_comprobante?.id} />
                  {venta.codigo_comprobante && (
                    <span className="text-xs font-mono font-bold text-purple-900">{venta.codigo_comprobante}</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tipo de Pagador</p>
                <p className="font-semibold text-sm text-gray-900">
                  {tipoPagadorNombre(venta.tipo_pagador_id || venta.tipo_comprador_id)}
                </p>
              </div>
              {(() => {
                const pagosVenta = Array.isArray(venta.pagos) && venta.pagos.length > 0
                  ? venta.pagos
                  : venta.modalidad_pago
                    ? [{ modalidad_pago: venta.modalidad_pago, monto: venta.total }]
                    : [];
                if (!pagosVenta.length) return null;
                return (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Forma de Pago</p>
                    <div className="flex flex-col gap-0.5">
                      {pagosVenta.map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-gray-900">
                            {p.modalidad_pago?.nombre || '—'}{p.referencia ? ` — ${p.referencia}` : ''}
                          </span>
                          <span className="font-semibold text-gray-700">
                            S/ {p.monto != null ? Number(p.monto).toFixed(2) : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              {venta.paciente && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Paciente</p>
                  <p className="font-semibold text-sm text-gray-900">
                    {venta.paciente.nombres} {venta.paciente.apellido_paterno} {venta.paciente.apellido_materno || ''}
                  </p>
                </div>
              )}
              {venta.responsable && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Responsable (quien paga)</p>
                  <p className="font-semibold text-sm text-gray-900">
                    {venta.responsable.nombres} {venta.responsable.apellido_paterno} {venta.responsable.apellido_materno || ''}
                  </p>
                </div>
              )}
              {venta.comprador_externo && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Comprador Externo</p>
                  <p className="font-semibold text-sm text-gray-900">
                    {venta.comprador_externo.nombre} — DNI: {venta.comprador_externo.dni}
                  </p>
                </div>
              )}
            </div>

            {/* Detalles líneas */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                {tipo === 'servicio' ? 'Servicios vendidos' : 'Productos vendidos'}
              </p>
              <div className="space-y-1.5">
                {(() => {
                  const detalles = venta.detalles || [];
                  const combosMap = {};
                  const normales = [];

                  detalles.forEach((d) => {
                    if (d.paquete_combo_id) {
                      if (!combosMap[d.paquete_combo_id]) {
                        combosMap[d.paquete_combo_id] = {
                          nombre: d.paqueteCombo?.nombre
                            || d.descripcion_linea?.split(' - ')[0]
                            || d.descripcionLinea?.split(' - ')[0]
                            || 'Paquete Combo',
                          subtotal: 0,
                          items: [],
                        };
                      }
                      combosMap[d.paquete_combo_id].subtotal += parseFloat(d.subtotal || 0);
                      combosMap[d.paquete_combo_id].items.push(d);
                    } else {
                      normales.push(d);
                    }
                  });

                  const elementos = [];

                  Object.values(combosMap).forEach((combo, ci) => {
                    elementos.push(
                      <div key={`combo-${ci}`} className="p-2.5 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-gray-900">{combo.nombre}</span>
                            <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-purple-100 text-purple-700">Combo</span>
                          </div>
                          <span className="font-bold text-sm text-gray-900">{formatMonto(combo.subtotal)}</span>
                        </div>
                        <div className="space-y-0.5 pl-3 border-l-2 border-purple-200">
                          {combo.items.map((d, idx) => {
                            const srvNombre = d.descripcionLinea
                              ? d.descripcionLinea.split(' - ').slice(1).join(' - ') || d.descripcionLinea
                              : getServicioNombre(d);
                            return (
                              <div key={idx} className="text-xs text-gray-600">
                                <span className="font-medium">{d.sesiones_totales || 1} ses.</span>{' — '}{srvNombre}
                                {d.paciente && (
                                  <span className="block pl-2 text-purple-600 font-medium">
                                    Para: {d.paciente.nombres} {d.paciente.apellido_paterno} {d.paciente.apellido_materno || ''}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });

                  normales.forEach((d, i) => {
                    elementos.push(
                      <div key={`normal-${i}`} className="p-2.5 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                              <p className="font-semibold text-sm text-gray-900">
                                {tipo === 'servicio'
                                  ? (d.descripcionLinea || getServicioNombre(d) || d.paquete?.nombre || '—')
                                  : (d.producto?.nombre || '—')}
                              </p>
                              {tipo === 'servicio' && d.tipo_venta?.nombre && (
                                <span className={`px-1.5 py-0.5 text-xs font-semibold rounded ${
                                  d.tipo_venta.nombre.toLowerCase().includes('paquete')
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}>{d.tipo_venta.nombre}</span>
                              )}
                              {tipo === 'servicio' && getMotivoCita(d) && (
                                <span className="px-1.5 py-0.5 text-xs text-gray-500 bg-gray-100 rounded">
                                  {getMotivoCita(d)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {tipo === 'servicio' ? (
                                <>
                                  {d.sesiones_totales} ses. × {formatMonto(d.precio_unitario)}
                                  {d.paciente && (
                                    <span className="block text-purple-600 font-medium">
                                      Para: {d.paciente.nombres} {d.paciente.apellido_paterno} {d.paciente.apellido_materno || ''}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>{d.cantidad} unid. × {formatMonto(d.precio_unitario)}</>
                              )}
                            </p>
                            <DescuentoLabel
                              tipoDescuento={d.descuento_tipo}
                              valor={d.descuento_valor}
                              monto={d.descuento_monto}
                              className="mt-0.5"
                            />
                          </div>
                          <span className="font-bold text-sm text-gray-900 whitespace-nowrap">
                            {formatMonto(d.subtotal)}
                          </span>
                        </div>
                      </div>
                    );
                  });

                  return elementos;
                })()}
              </div>
            </div>

            <PanelPromocionesDetalle promociones={promociones} />

            {/* Totales */}
            <div className="space-y-1.5 border-t pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Subtotal:</span>
                <span className="font-semibold text-gray-900">{formatMonto(venta.subtotal)}</span>
              </div>
              {parseFloat(venta.descuento_monto) > 0 && venta.descuento_tipo && (
                <div className="flex justify-between text-xs text-amber-600">
                  <span>
                    Descuento global ({venta.descuento_tipo.nombre}
                    {venta.descuento_tipo.id === 1 ? `: ${parseFloat(venta.descuento_valor)}%` : ''}):
                  </span>
                  <span className="font-semibold">- {formatMonto(venta.descuento_monto)}</span>
                </div>
              )}
              {conIgv ? (
                <>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Base imponible:</span><span>{formatMonto(base)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>IGV (18%):</span><span>{formatMonto(igv)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-xs text-gray-400">
                  <span>IGV:</span><span className="italic">No aplica (NV)</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#7B1FA2] pt-1.5 border-t">
                <span>TOTAL:</span><span>{formatMonto(venta.total)}</span>
              </div>
            </div>

            {/* Nota interna y Observaciones */}
            {(venta.nota || venta.observaciones) && (
              <div className="space-y-3 pt-4 border-t border-gray-200">
                {venta.nota && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-yellow-800 mb-1.5 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Nota Interna (solo visible en sistema)
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{venta.nota}</p>
                  </div>
                )}
                {venta.observaciones && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-purple-800 mb-1.5 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Observaciones (visible en comprobante impreso)
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{venta.observaciones}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {mostrarPrint && (
        <PrintPreviewModal venta={venta} tipo={tipo} onClose={() => setMostrarPrint(false)} />
      )}
    </>
  );
};

export default DetalleVentaModal;
