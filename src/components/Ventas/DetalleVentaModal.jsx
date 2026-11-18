import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ShoppingCartIcon,
  CubeIcon,
  XMarkIcon,
  PrinterIcon,
  ReceiptRefundIcon,
  CalendarDaysIcon,
  UserIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
  CalculatorIcon,
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

const nombreTrabajador = (t) => t ? [t.nombres, t.apellidos].filter(Boolean).join(' ') : null;

// Campo label/valor sin cajitas — estilo editar-paciente
const Campo = ({ label, children, className = '' }) => (
  <div className={className}>
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
    <div className="text-sm font-semibold text-gray-800 break-words leading-snug">{children}</div>
  </div>
);

// Encabezado de sección con icono + título + divisor degradado
const Section = ({ icon: Icon, title, iconColor = 'text-[#7B1FA2]', bgColor = 'bg-purple-50', children }) => (
  <div>
    <div className="flex items-center gap-2.5 mb-2.5">
      <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0 ring-1 ring-black/[0.03]`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap">{title}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
    </div>
    {children}
  </div>
);

const DetalleVentaModal = ({ venta, tipo, onClose, esAdministrador = false, onValidarNotaCredito }) => {
  const [mostrarPrint, setMostrarPrint] = useState(false);
  const [validandoNC, setValidandoNC] = useState(false);
  const { base, igv, conIgv } = calcularIgv(venta.total, venta.tipo_comprobante?.id);
  const promociones = venta.promociones_aplicadas || [];

  const pagosVenta = Array.isArray(venta.pagos) && venta.pagos.length > 0
    ? venta.pagos
    : venta.modalidad_pago
      ? [{ modalidad_pago: venta.modalidad_pago, monto: venta.total }]
      : [];

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header — estilo editar-paciente */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-500/20">
              {tipo === 'servicio'
                ? <ShoppingCartIcon className="w-5 h-5 text-white" />
                : <CubeIcon className="w-5 h-5 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-extrabold text-[#2D0A4E] leading-tight truncate">
                Detalle de Venta de {tipo === 'servicio' ? 'Servicio' : 'Producto'}
              </h2>
              <p className="text-[13px] text-gray-400 truncate">
                {venta.codigo_comprobante || venta.tipo_comprobante?.nombre || 'Comprobante'}
              </p>
            </div>
            <button
              onClick={() => setMostrarPrint(true)}
              className="flex items-center gap-2 cx-glow bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-purple-500/30 shrink-0"
            >
              <PrinterIcon className="w-4 h-4" />Imprimir
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto px-6 pt-3 pb-6 space-y-4">
            {/* Datos de la venta */}
            <Section icon={CalendarDaysIcon} title="Datos de la venta">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <Campo label="Fecha de venta">{formatFecha(venta.fecha_venta)}</Campo>
                <Campo label="Registrado el">
                  {venta.created_at
                    ? new Date(venta.created_at).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </Campo>
                <Campo label="Comprobante">
                  <div className="flex items-center gap-1.5">
                    <ComprobanteLabel nombre={venta.tipo_comprobante?.nombre} id={venta.tipo_comprobante?.id} />
                    {venta.codigo_comprobante && (
                      <span className="text-xs font-mono font-bold text-purple-900">{venta.codigo_comprobante}</span>
                    )}
                  </div>
                </Campo>
                <Campo label="Tipo de pagador">
                  {tipoPagadorNombre(venta.tipo_pagador_id || venta.tipo_comprador_id)}
                </Campo>
                {venta.paciente && (
                  <Campo label="Paciente" className="sm:col-span-2">
                    {venta.paciente.nombres} {venta.paciente.apellido_paterno} {venta.paciente.apellido_materno || ''}
                  </Campo>
                )}
                {venta.responsable && (
                  <Campo label="Responsable (quien paga)" className="sm:col-span-2">
                    {venta.responsable.nombres} {venta.responsable.apellido_paterno} {venta.responsable.apellido_materno || ''}
                  </Campo>
                )}
                {venta.comprador_externo && (
                  <Campo label="Comprador externo" className="sm:col-span-2">
                    {venta.comprador_externo.nombre} — DNI: {venta.comprador_externo.dni}
                  </Campo>
                )}
              </div>
            </Section>

            {/* Forma de pago */}
            {pagosVenta.length > 0 && (
              <Section icon={CreditCardIcon} title="Forma de pago" iconColor="text-emerald-600" bgColor="bg-emerald-50">
                <div className="flex flex-col gap-2">
                  {pagosVenta.map((p, i) => {
                    const validado = !!p.pago_validado;
                    const validadoPor = p.validado_por
                      ? [p.validado_por.nombres, p.validado_por.apellidos].filter(Boolean).join(' ')
                      : null;
                    const validadoAt = p.pago_validado_at
                      ? new Date(p.pago_validado_at).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : null;
                    return (
                      <div key={i} className={`rounded-xl px-4 py-3 border ${validado ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-gray-900">
                            {p.modalidad_pago?.nombre || '—'}{p.referencia ? ` — ${p.referencia}` : ''}
                          </span>
                          <span className="font-bold text-gray-800">
                            S/ {p.monto != null ? Number(p.monto).toFixed(2) : '—'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {validado ? (
                            <>
                              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 12 10" fill="none">
                                  <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Validado
                              </span>
                              {validadoPor && <span className="text-xs text-emerald-600">por {validadoPor}</span>}
                              {validadoAt && <span className="text-xs text-gray-400">· {validadoAt}</span>}
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Pago pendiente de validación</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* Servicios / Productos vendidos */}
            <Section
              icon={ClipboardDocumentListIcon}
              title={tipo === 'servicio' ? 'Servicios vendidos' : 'Productos vendidos'}
              iconColor="text-[#A3C644]"
              bgColor="bg-[#A3C644]/10"
            >
              <div className="space-y-2">
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
                      <div key={`combo-${ci}`} className="rounded-xl border border-gray-100 bg-white px-4 py-3 hover:shadow-md transition-shadow">
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
                      <div key={`normal-${i}`} className="rounded-xl border border-gray-100 bg-white px-4 py-3 hover:shadow-md transition-shadow">
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
            </Section>

            <PanelPromocionesDetalle promociones={promociones} />

            {/* Totales */}
            <Section icon={CalculatorIcon} title="Totales" iconColor="text-[#7B1FA2]">
              <div className="rounded-2xl bg-purple-50/60 px-4 py-3.5 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatMonto(venta.subtotal)}</span>
                </div>
                {parseFloat(venta.descuento_monto) > 0 && venta.descuento_tipo && (
                  <div className="flex justify-between text-sm text-amber-600">
                    <span>
                      Descuento global ({venta.descuento_tipo.nombre}
                      {venta.descuento_tipo.id === 1 ? `: ${parseFloat(venta.descuento_valor)}%` : ''})
                    </span>
                    <span className="font-semibold">- {formatMonto(venta.descuento_monto)}</span>
                  </div>
                )}
                {conIgv ? (
                  <>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Base imponible</span><span>{formatMonto(base)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>IGV (18%)</span><span>{formatMonto(igv)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>IGV</span><span className="italic">No aplica (NV)</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-purple-200/70">
                  <span className="text-sm font-bold uppercase tracking-wide text-[#7B1FA2]">Total</span>
                  <span className="text-xl font-extrabold text-[#7B1FA2]">{formatMonto(venta.total)}</span>
                </div>
              </div>
            </Section>

            {/* Nota de crédito / Devolución */}
            {venta.nota_credito && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
                  <ReceiptRefundIcon className="w-4 h-4" />
                  Devolución / Nota de crédito
                  {venta.nota_credito.codigo && (
                    <span className="font-mono font-bold text-amber-900">{venta.nota_credito.codigo}</span>
                  )}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Fecha:</span>{' '}
                    <span className="font-semibold text-gray-800">{formatFecha(venta.nota_credito.fecha)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Monto devuelto:</span>{' '}
                    <span className="font-semibold text-amber-700">{formatMonto(venta.nota_credito.monto_devuelto)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Citas anuladas:</span>{' '}
                    <span className="font-semibold text-gray-800">{venta.nota_credito.citas_anuladas}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Sesiones anuladas:</span>{' '}
                    <span className="font-semibold text-gray-800">{venta.nota_credito.sesiones_anuladas}</span>
                  </div>
                  {venta.nota_credito.modalidad_pago?.nombre && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Método de devolución:</span>{' '}
                      <span className="font-semibold text-gray-800">{venta.nota_credito.modalidad_pago.nombre}</span>
                    </div>
                  )}
                  {venta.nota_credito.motivo && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Motivo:</span>{' '}
                      <span className="text-gray-700 whitespace-pre-wrap">{venta.nota_credito.motivo}</span>
                    </div>
                  )}
                  {nombreTrabajador(venta.nota_credito.user_crea) && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Registrada por:</span>{' '}
                      <span className="font-semibold text-gray-800">{nombreTrabajador(venta.nota_credito.user_crea)}</span>
                    </div>
                  )}
                </div>

                {/* Validación de la devolución */}
                <div className="mt-3 pt-3 border-t border-amber-200 flex items-center justify-between gap-2">
                  {venta.nota_credito.validado ? (
                    <span className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="flex items-center gap-1 font-semibold text-green-700">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 12 10" fill="none">
                          <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Validada
                      </span>
                      {nombreTrabajador(venta.nota_credito.validado_por_trabajador) && (
                        <span className="text-green-600">por {nombreTrabajador(venta.nota_credito.validado_por_trabajador)}</span>
                      )}
                      {venta.nota_credito.validado_at && (
                        <span className="text-gray-400">
                          · {new Date(venta.nota_credito.validado_at).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </span>
                  ) : (
                    <>
                      <span className="text-xs text-gray-400 italic">Devolución pendiente de validación</span>
                      {esAdministrador && onValidarNotaCredito && (
                        <button
                          onClick={async () => { setValidandoNC(true); try { await onValidarNotaCredito(venta.nota_credito.id); } finally { setValidandoNC(false); } }}
                          disabled={validandoNC}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 whitespace-nowrap"
                        >
                          {validandoNC ? 'Validando…' : 'Validar devolución'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Nota interna y Observaciones */}
            {(venta.nota || venta.observaciones) && (
              <div className="space-y-3">
                {venta.nota && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
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
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
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
    </>,
    document.body
  );
};

export default DetalleVentaModal;
