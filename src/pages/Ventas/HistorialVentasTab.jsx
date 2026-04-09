import React, { useState, useEffect, useRef } from 'react';
import logoUrl from '/logo-text-short.png';
import { createPortal } from 'react-dom';
import {
  EyeIcon,
  ShoppingCartIcon,
  CubeIcon,
  XMarkIcon,
  ClockIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
  SparklesIcon,
  GiftIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getVentasServicios,
  getVentasProductos,
  eliminarVentaServicio,
  eliminarVentaProducto,
  getVentaServicioById,
  getVentaProductoById,
  actualizarVentaServicio,  
  actualizarVentaProducto,   
  TIPOS_PAGADOR,
} from '../../services/ventasService';
import VenderServiciosTab from './VenderServiciosTab';
import VenderProductosTab from './VenderProductosTab';
import {
  generarTicketPDF,
  generarTicketTermico,
  generarPDFA4,
  obtenerPreviewURL,
  getImporteLetras,
  getNombreComprador,
  getDniComprador,
} from '../../utils/pdfGenerator';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatFecha = (f) => {
  if (!f) return '—';
  const [year, month, day] = String(f).slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const formatMonto = (n) => `S/ ${parseFloat(n || 0).toFixed(2)}`;
const formatMoney = (num) => parseFloat(num || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const tipoPagadorNombre = (id) => {
  switch (id) {
    case TIPOS_PAGADOR.PACIENTE:    return 'Paciente';
    case TIPOS_PAGADOR.RESPONSABLE: return 'Responsable';
    case TIPOS_PAGADOR.EXTERNO:     return 'Externo';
    default: return '—';
  }
};

const calcularIgv = (total, tipoComprobanteId) => {
  const conIgv = tipoComprobanteId === 2 || tipoComprobanteId === 3;
  if (!conIgv) return { base: parseFloat(total || 0), igv: 0, conIgv: false };
  const t = parseFloat(total || 0);
  return { base: t / 1.18, igv: t - t / 1.18, conIgv: true };
};

/**
 * Resuelve el nombre del servicio desde la ruta correcta:
 * detalle → servicio_tarifa → servicio → nombre
 */
const getServicioNombre = (d) =>
  d?.servicio_tarifa?.servicio?.nombre || '-';

/**
 * Resuelve el motivo de cita desde:
 * detalle → servicio_tarifa → motivo_cita → nombre
 */
const getMotivoCita = (d) =>
  d?.servicio_tarifa?.motivo_cita?.nombre || '';

/**
 * Detecta el tipo de beneficio de una promoción aplicada.
 * beneficio_tipo_id: 1=Desc%, 2=Desc fijo, 3=Ítem más barato gratis, 4=Producto de regalo
 */
const getInfoBeneficio = (promoAplicada) => {
  const reglas = promoAplicada.promocion?.reglas || [];
  const reglaRegalo     = reglas.find((r) => r.beneficio_tipo_id === 4);
  const reglaItemGratis = reglas.find((r) => r.beneficio_tipo_id === 3);

  if (reglaRegalo) {
    return {
      esProductoGratis: true,
      esItemGratis: false,
      nombreProducto: reglaRegalo.beneficio_producto?.nombre || 'Producto de regalo',
    };
  }
  if (reglaItemGratis) {
    return { esProductoGratis: false, esItemGratis: true, nombreProducto: null };
  }
  return { esProductoGratis: false, esItemGratis: false, nombreProducto: null };
};

// ─── Subcomponentes de UI ─────────────────────────────────────────────────────

const ComprobanteLabel = ({ nombre, id }) => {
  const estilos = { 1: 'bg-gray-100 text-gray-600', 2: 'bg-blue-50 text-blue-700', 3: 'bg-emerald-50 text-emerald-700' };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estilos[id] || 'bg-gray-100 text-gray-600'}`}>
      {nombre || '—'}
    </span>
  );
};

const DescuentoLabel = ({ tipoDescuento, valor, monto, className = '' }) => {
  if (!monto || parseFloat(monto) <= 0 || !tipoDescuento) return null;
  return (
    <p className={`text-xs text-amber-600 font-medium ${className}`}>
      Descuento ({tipoDescuento.nombre}):&nbsp;
      {tipoDescuento.id === 1 ? `${parseFloat(valor)}% = - ${formatMonto(monto)}` : `- ${formatMonto(valor)}`}
    </p>
  );
};

// ─── Panel de Promociones ─────────────────────────────────────────────────────

const PanelPromocionesDetalle = ({ promociones = [] }) => {
  if (!promociones || promociones.length === 0) return null;

  const totalAhorrado = promociones.reduce((s, p) => {
    const { esProductoGratis, esItemGratis } = getInfoBeneficio(p);
    return (esProductoGratis || esItemGratis) ? s : s + parseFloat(p.monto_ahorrado || 0);
  }, 0);

  return (
    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <SparklesIcon className="w-4 h-4 text-green-600" />
        <span className="text-sm font-bold text-green-700">
          {promociones.length} promoción{promociones.length > 1 ? 'es' : ''} aplicada{promociones.length > 1 ? 's' : ''}
        </span>
      </div>

      {promociones.map((p, i) => {
        const { esProductoGratis, esItemGratis, nombreProducto } = getInfoBeneficio(p);
        return (
          <div key={i} className="flex items-start justify-between bg-white/70 rounded-lg px-3 py-2 gap-3">
            <div className="flex items-start gap-2">
              <GiftIcon className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-green-800">
                  {p.promocion?.nombre || `Promoción #${p.promocion_id}`}
                </p>
                {p.promocion?.descripcion && (
                  <p className="text-xs text-green-600">{p.promocion.descripcion}</p>
                )}
                {esProductoGratis && (
                  <p className="text-xs font-medium text-emerald-700 mt-0.5">
                    🎁 Producto incluido gratis: <span className="font-bold">{nombreProducto}</span>
                  </p>
                )}
                {esItemGratis && (
                  <p className="text-xs font-medium text-emerald-700 mt-0.5">
                    🎁 El ítem más barato va <span className="font-bold">gratis</span>
                  </p>
                )}
              </div>
            </div>
            {!esProductoGratis && !esItemGratis && (
              <span className="text-sm font-bold text-green-700 shrink-0">
                -{formatMonto(p.monto_ahorrado)}
              </span>
            )}
          </div>
        );
      })}

      {totalAhorrado > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-green-200">
          <span className="text-sm font-bold text-green-800">Total ahorrado</span>
          <span className="text-sm font-bold text-green-700">-{formatMonto(totalAhorrado)}</span>
        </div>
      )}
    </div>
  );
};

// ─── Helper: construir rows de detalles para ticket ───────────────────────────

/**
 * Transforma los detalles de una venta en filas listas para renderizar en ticket.
 * Centralizado aquí para que TicketPreviewHTML y buildTicketHTML usen la misma lógica.
 */
const buildDetalleRows = (detalles, tipo, fm) => {
  const toFloat = (v) => parseFloat(v || 0);

  return (detalles || []).map((d) => {
    if (tipo === 'servicio') {
      // Si hay descripcionLinea, usarla directamente (para documentos o descripción personalizada)
      if (d.descripcionLinea) {
        return {
          desc: d.descripcionLinea,
          cantidad: (d.sesiones_totales || 1).toFixed(2),
          precio: fm(toFloat(d.precio_unitario)),
          subtotal: fm(toFloat(d.subtotal)),
          paciente: d.paciente
            ? `${d.paciente.nombres} ${d.paciente.apellidos || d.paciente.apellido_paterno || ''}`.trim()
            : null,
        };
      }

      const esPaquete  = d.tipo_venta?.nombre?.toLowerCase().includes('paquete');
      const motivoCita = getMotivoCita(d);
      const srvNombre  = getServicioNombre(d);

      let desc, cantidad;
      if (esPaquete && d.paquete) {
        const spp  = d.paquete.cantidad_sesiones || d.paquete.sesiones || d.paquete.numero_sesiones || 1;
        cantidad   = Math.round((d.sesiones_totales || 0) / spp).toFixed(2);
        const base = srvNombre !== '-'
          ? `${d.paquete.nombre} (${spp} SES.) - ${srvNombre}`
          : `${d.paquete.nombre} (${spp} SES.)`;
        desc = motivoCita ? `${base} [${motivoCita}]` : base;
      } else {
        cantidad   = (d.sesiones_totales || 0).toFixed(2);
        desc       = motivoCita ? `${srvNombre} [${motivoCita}]` : srvNombre;
      }

      const precioUnitario = toFloat(d.precio_unitario);
      const subtotal       = precioUnitario * (d.sesiones_totales || 1) - toFloat(d.descuento_monto);
      const paciente       = d.paciente
        ? `${d.paciente.nombres} ${d.paciente.apellidos || d.paciente.apellido_paterno || ''}`.trim()
        : null;

      return {
        desc,
        cantidad,
        precio:   fm(precioUnitario),
        subtotal: fm(subtotal),
        paciente,
      };
    }

    // Producto
    return {
      desc:     d.producto?.nombre || '-',
      cantidad: toFloat(d.cantidad).toFixed(2),
      precio:   fm(toFloat(d.precio_unitario)),
      subtotal: fm(toFloat(d.subtotal)),
      paciente: null,
    };
  });
};

// ─── TicketPreviewHTML ────────────────────────────────────────────────────────

const TicketPreviewHTML = React.forwardRef(({ venta, tipo }, ref) => {
  const promociones = venta.promociones_aplicadas || [];
  const toFloat     = (v) => parseFloat(v || 0);
  const total       = toFloat(venta.total);
  const descuento   = toFloat(venta.descuento_monto);

  const totalPromos = promociones.reduce((s, p) => {
    const { esProductoGratis, esItemGratis } = getInfoBeneficio(p);
    return (esProductoGratis || esItemGratis) ? s : s + parseFloat(p.monto_ahorrado || 0);
  }, 0);

  const nombreCliente = (() => {
    if (venta.paciente)          return `${venta.paciente.nombres} ${venta.paciente.apellidos || venta.paciente.apellido_paterno || ''}`.trim();
    if (venta.responsable)       return `${venta.responsable.nombres} ${venta.responsable.apellidos || venta.responsable.apellido_paterno || ''}`.trim();
    if (venta.comprador_externo) return venta.comprador_externo.nombre_completo || venta.comprador_externo.nombre || '-';
    return '-';
  })();
  const dni = venta.paciente?.dni || venta.paciente?.numero_documento
    || venta.responsable?.dni || venta.responsable?.numero_documento
    || venta.comprador_externo?.dni || '-';

  const fechaEmision = (() => {
    const str = String(venta.fecha_venta || '');
    const [datePart, timePart] = str.split('T');
    const [y, m, d] = datePart.split('-').map(Number);
    if (timePart) {
      const [h, min] = timePart.split(':').map(Number);
      return new Date(y, m - 1, d, h, min).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    return new Date(y, m - 1, d).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  })();

  const rows = buildDetalleRows(venta.detalles, tipo, formatMoney);

  const s = {
    wrap:    { fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Arial,sans-serif', fontSize: '12px', lineHeight: '1.4', color: '#111', background: '#fff', width: '270px', margin: '0 auto', padding: '12px 10px', boxShadow: '0 2px 16px rgba(0,0,0,0.13)', borderRadius: '4px', fontWeight: '500' },
    center:  { textAlign: 'center', display: 'block' },
    bold:    { fontWeight: '600' },
    hr:      { border: 'none', borderTop: '1px dashed #aaa', margin: '6px 0' },
    hrSolid: { border: 'none', borderTop: '1px solid #ccc', margin: '6px 0' },
    row:     { display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' },
  };

  const tipoComprobante = (venta.tipo_comprobante?.nombre || '').toUpperCase();
  const requiereIGV     = tipoComprobante.includes('BOLETA') || tipoComprobante.includes('FACTURA');
  const camposCliente   = tipo === 'servicio'
    ? [['Fecha emisión', fechaEmision], ['Comprador', getNombreComprador(venta)], ['DNI', getDniComprador(venta)], ['Dirección', '-']]
    : [['Fecha emisión', fechaEmision], ['Cliente', nombreCliente], ['DNI', dni], ['Dirección', '-']];

  return (
    <div ref={ref} style={s.wrap} data-ticket-preview="true" id="ticket-preview-node">
      <div style={{ textAlign: 'center', marginBottom: '6px' }}>
        <img src={logoUrl} alt="Crecemos" style={{ width: '130px', height: 'auto', display: 'block', margin: '0 auto' }} />
      </div>
      <div style={{ textAlign: 'center', fontSize: '10px', lineHeight: '1.4' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>CONTIGO CRECEMOS E.I.R.L.</div>
        <div>Centro de terapias Crecemos</div>
        <div>LT. 5 MZ. W1 URB. EL PINAR PARCELA H</div>
        <div>LIMA LIMA COMAS — Telf.: 957 064 401</div>
        <div>info@crecemos.com.pe</div>
        <div style={{ fontWeight: 'bold', marginTop: '2px' }}>R.U.C. N° 20601074380</div>
      </div>
      <hr style={s.hrSolid} />
      <div style={{ ...s.center, ...s.bold, fontSize: '11px', color: '#7B1FA2' }}>
        {(venta.tipo_comprobante?.nombre || 'TICKET DE VENTA').toUpperCase()}
      </div>
      <div style={{ ...s.center, ...s.bold, fontSize: '14px', color: '#7B1FA2', letterSpacing: '1px', margin: '3px 0' }}>
        {venta.codigo_comprobante || '#00000'}
      </div>
      <hr style={s.hrSolid} />
      <div style={{ marginBottom: '6px' }}>
        {camposCliente.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', gap: '3px', marginBottom: '2px', fontSize: '9px' }}>
            <span style={{ ...s.bold, minWidth: '70px', flexShrink: 0 }}>{label}:</span>
            <span style={{ wordBreak: 'break-word' }}>{value}</span>
          </div>
        ))}
      </div>
      <hr style={s.hr} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', ...s.bold, borderBottom: '1px dashed #aaa', paddingBottom: '2px', marginBottom: '3px' }}>
        <span style={{ width: '25px' }}>Cant.</span>
        <span style={{ flex: 1, paddingLeft: '3px' }}>Descripción</span>
        <span style={{ width: '42px', textAlign: 'right' }}>P.Unit</span>
        <span style={{ width: '42px', textAlign: 'right' }}>Total</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ marginBottom: '4px', borderBottom: '1px dotted #ddd', paddingBottom: '3px' }}>
          <div style={{ fontSize: '10px', marginBottom: '2px', wordBreak: 'break-word' }}>
            <span style={s.bold}>{r.cantidad} NIU</span> — {r.desc}
          </div>
          {tipo === 'servicio' && r.paciente && r.paciente !== '-' && (
            <div style={{ fontSize: '9px', marginBottom: '2px', color: '#7B1FA2' }}>
              <span style={s.bold}>Paciente:</span> {r.paciente}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
            <span style={{ color: '#555' }}>P.Unit: S/ {r.precio}</span>
            <span style={s.bold}>S/ {r.subtotal}</span>
          </div>
        </div>
      ))}
      <hr style={s.hr} />
      {descuento > 0 && (
        <div style={{ ...s.row, color: '#b45309' }}>
          <span>DESCUENTOS(-)</span><span>S/ {formatMoney(descuento)}</span>
        </div>
      )}
      {promociones.length > 0 && (
        <div style={{ borderTop: '1px dashed #bbf7d0', marginTop: '3px', paddingTop: '3px' }}>
          <div style={{ fontSize: '9px', fontWeight: '700', color: '#15803d', marginBottom: '2px' }}>
            ✦ PROMOCIONES APLICADAS
          </div>
          {promociones.map((p, i) => {
            const { esProductoGratis, esItemGratis, nombreProducto } = getInfoBeneficio(p);
            return (
              <div key={i} style={{ marginBottom: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#16a34a' }}>
                  <span style={{ flex: 1, paddingRight: '4px' }}>• {p.promocion?.nombre || `Promo #${p.promocion_id}`}</span>
                  {!esProductoGratis && !esItemGratis && (
                    <span style={{ fontWeight: '700', flexShrink: 0 }}>-S/ {formatMoney(p.monto_ahorrado)}</span>
                  )}
                </div>
                {esProductoGratis && (
                  <div style={{ fontSize: '8px', color: '#15803d', paddingLeft: '8px' }}>
                    🎁 Incluye gratis: <strong>{nombreProducto}</strong>
                  </div>
                )}
                {esItemGratis && (
                  <div style={{ fontSize: '8px', color: '#15803d', paddingLeft: '8px' }}>
                    🎁 El ítem más barato va <strong>gratis</strong>
                  </div>
                )}
              </div>
            );
          })}
          {totalPromos > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '10px', color: '#15803d', background: '#f0fdf4', borderRadius: '2px', padding: '2px 3px', margin: '2px 0 4px' }}>
              <span>AHORRO TOTAL PROMOCIONES</span>
              <span>-S/ {formatMoney(totalPromos)}</span>
            </div>
          )}
        </div>
      )}
      {requiereIGV && (
        <>
          <div style={s.row}><span>BASE IMPONIBLE</span><span>S/ {formatMoney(total / 1.18)}</span></div>
          <div style={s.row}><span>IGV (18%)</span><span>S/ {formatMoney(total - total / 1.18)}</span></div>
        </>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', ...s.bold, fontSize: '13px', color: '#7B1FA2', margin: '4px 0 3px' }}>
        <span>TOTAL</span><span>S/ {formatMoney(total)}</span>
      </div>
      <hr style={s.hrSolid} />
      <div style={{ fontSize: '8px', marginBottom: '4px', lineHeight: '1.3' }}>
        <span style={s.bold}>IMPORTE EN LETRAS: </span>
        <span>{getImporteLetras(total)}</span>
      </div>
      {venta.observaciones?.trim() && (
        <>
          <hr style={s.hr} />
          <div style={{ fontSize: '8px' }}>
            <div style={s.bold}>OBSERVACIONES:</div>
            <div style={{ marginTop: '2px', whiteSpace: 'pre-wrap', lineHeight: '1.3' }}>{venta.observaciones}</div>
          </div>
        </>
      )}

      
      <hr style={s.hrSolid} />
      <div style={{ ...s.center, ...s.bold, color: '#7B1FA2', marginTop: '4px', fontSize: '9px' }}>¡Gracias por su preferencia!</div>
    </div>
  );
});

// ─── HTML para ventana de impresión ──────────────────────────────────────────

const buildTicketHTML = (venta, tipo) => {
  const promociones = venta.promociones_aplicadas || [];
  const toFloat     = (v) => parseFloat(v || 0);
  const fm          = (n) => parseFloat(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const total       = toFloat(venta.total);
  const desc        = toFloat(venta.descuento_monto);

  const totalPromos = promociones.reduce((s, p) => {
    const reglas    = p.promocion?.reglas || [];
    const esGratis  = reglas.some((r) => r.beneficio_tipo_id === 3 || r.beneficio_tipo_id === 4);
    return esGratis ? s : s + parseFloat(p.monto_ahorrado || 0);
  }, 0);

  const fechaEmision = (() => {
    const str = String(venta.fecha_venta || '');
    const [datePart, timePart] = str.split('T');
    const [y, m, d] = datePart.split('-').map(Number);
    if (timePart) {
      const [h, min] = timePart.split(':').map(Number);
      return new Date(y, m - 1, d, h, min).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    return new Date(y, m - 1, d).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  })();

  const nombreCliente = (() => {
    if (venta.paciente)          return `${venta.paciente.nombres} ${venta.paciente.apellidos || venta.paciente.apellido_paterno || ''}`.trim();
    if (venta.responsable)       return `${venta.responsable.nombres} ${venta.responsable.apellidos || venta.responsable.apellido_paterno || ''}`.trim();
    if (venta.comprador_externo) return venta.comprador_externo.nombre_completo || venta.comprador_externo.nombre || '-';
    return '-';
  })();
  const nombreComprador = (() => {
    if (venta.responsable)       return `${venta.responsable.nombres} ${venta.responsable.apellidos || venta.responsable.apellido_paterno || ''}`.trim();
    if (venta.comprador_externo) return venta.comprador_externo.nombre_completo || venta.comprador_externo.nombre || '-';
    if (venta.paciente)          return `${venta.paciente.nombres} ${venta.paciente.apellidos || venta.paciente.apellido_paterno || ''}`.trim();
    return '-';
  })();
  const dni          = venta.paciente?.dni || venta.paciente?.numero_documento || venta.responsable?.dni || venta.responsable?.numero_documento || venta.comprador_externo?.dni || '-';
  const dniComprador = venta.responsable?.dni || venta.responsable?.numero_documento || venta.comprador_externo?.dni || venta.paciente?.dni || venta.paciente?.numero_documento || '-';
  const campos = tipo === 'servicio'
    ? [['Fecha emisión', fechaEmision], ['Comprador', nombreComprador], ['DNI', dniComprador], ['Dirección', '-']]
    : [['Fecha emisión', fechaEmision], ['Cliente', nombreCliente], ['DNI', dni], ['Dirección', '-']];

  // Usar el mismo helper centralizado
  const rows = buildDetalleRows(venta.detalles, tipo, fm);

  const nAL = (num) => {
    const U=['','UNO','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE'],D=['','DIEZ','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'],E=['DIEZ','ONCE','DOCE','TRECE','CATORCE','QUINCE','DIECISEIS','DIECISIETE','DIECIOCHO','DIECINUEVE'],C=['','CIENTO','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
    const g=(n)=>{if(!n)return '';if(n<10)return U[n];if(n<20)return E[n-10];if(n<30)return n===20?'VEINTE':'VEINTI'+U[n-20];if(n<100)return D[Math.floor(n/10)]+(n%10?' Y '+U[n%10]:'');return(n===100?'CIEN':C[Math.floor(n/100)])+(n%100?' '+g(n%100):'');};
    if(!num)return 'CERO';if(num<1000)return g(num);if(num<1000000)return(Math.floor(num/1000)===1?'MIL':g(Math.floor(num/1000))+' MIL')+(num%1000?' '+g(num%1000):'');return num.toString();
  };
  const importeLetras = `${nAL(Math.floor(total))} CON ${String(Math.round((total % 1) * 100)).padStart(2, '0')}/100 SOLES`;
  const tipoNombre    = (venta.tipo_comprobante?.nombre || 'TICKET DE VENTA').toUpperCase();
  const requiereIGV   = tipoNombre.includes('BOLETA') || tipoNombre.includes('FACTURA');

  const promosHTML = promociones.length > 0 ? `
    <div style="border-top:1px dashed #bbf7d0;margin-top:3px;padding-top:3px">
      <div style="font-size:9px;font-weight:700;color:#15803d;margin-bottom:2px">✦ PROMOCIONES APLICADAS</div>
      ${promociones.map(p => {
        const reglas       = p.promocion?.reglas || [];
        const reglaRegalo  = reglas.find(r => r.beneficio_tipo_id === 4);
        const reglaGratis  = reglas.find(r => r.beneficio_tipo_id === 3);
        const esProducto   = !!reglaRegalo;
        const esItemGratis = !!reglaGratis && !reglaRegalo;
        const nombreProd   = reglaRegalo?.beneficio_producto?.nombre || 'Producto de regalo';
        return `
          <div style="margin-bottom:3px">
            <div class="row" style="color:#16a34a;font-size:9px">
              <span style="flex:1;padding-right:4px">• ${p.promocion?.nombre || `Promo #${p.promocion_id}`}</span>
              ${!esProducto && !esItemGratis ? `<span style="font-weight:700;flex-shrink:0">-S/ ${fm(p.monto_ahorrado)}</span>` : ''}
            </div>
            ${esProducto   ? `<div style="font-size:8px;color:#15803d;padding-left:8px">🎁 Incluye gratis: <strong>${nombreProd}</strong></div>` : ''}
            ${esItemGratis ? `<div style="font-size:8px;color:#15803d;padding-left:8px">🎁 El ítem más barato va <strong>gratis</strong></div>` : ''}
          </div>
        `;
      }).join('')}
      ${totalPromos > 0 ? `
        <div style="display:flex;justify-content:space-between;font-weight:700;font-size:10px;color:#15803d;background:#f0fdf4;border-radius:2px;padding:2px 3px;margin:2px 0 4px">
          <span>AHORRO TOTAL PROMOCIONES</span><span>-S/ ${fm(totalPromos)}</span>
        </div>` : ''}
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.4;color:#111;width:72mm;padding:10px 8px;font-weight:500}
  @media print{@page{size:72mm auto;margin:0}body{width:72mm}}
  .center{text-align:center}.bold{font-weight:700}.purple{color:#7B1FA2}
  hr.d{border:none;border-top:1px dashed #aaa;margin:6px 0}hr.s{border:none;border-top:1px solid #ccc;margin:6px 0}
  .row{display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px}
  .campo{display:flex;gap:3px;margin-bottom:2px;font-size:10px}.campo-label{font-weight:bold;min-width:75px;flex-shrink:0}
  .thead{display:flex;justify-content:space-between;font-size:10px;font-weight:bold;border-bottom:1px dashed #aaa;padding-bottom:2px;margin-bottom:3px}
  .item{margin-bottom:4px;border-bottom:1px dotted #ddd;padding-bottom:3px}
</style></head><body>
  <div class="center" style="margin-bottom:6px"><img src="${window.location.origin}/logo-text-short.png" style="width:130px;height:auto;display:block;margin:0 auto"></div>
  <div class="center" style="font-size:10px;line-height:1.4">
    <div class="bold" style="font-size:12px">CONTIGO CRECEMOS E.I.R.L.</div>
    <div>Centro de terapias Crecemos</div><div>LT. 5 MZ. W1 URB. EL PINAR PARCELA H</div>
    <div>LIMA LIMA COMAS — Telf.: 957 064 401</div><div>info@crecemos.com.pe</div>
    <div class="bold" style="margin-top:2px">R.U.C. N° 20601074380</div>
  </div>
  <hr class="s">
  <div class="center bold purple" style="font-size:11px">${tipoNombre}</div>
  <div class="center bold purple" style="font-size:14px;letter-spacing:1px;margin:3px 0">${venta.codigo_comprobante || '#00000'}</div>
  <hr class="s">
  <div style="margin-bottom:6px">${campos.map(([l, v]) => `<div class="campo"><span class="campo-label">${l}:</span><span style="word-break:break-word">${v}</span></div>`).join('')}</div>
  <hr class="d">
  <div class="thead"><span style="width:25px">Cant.</span><span style="flex:1;padding-left:3px">Descripción</span><span style="width:42px;text-align:right">P.Unit</span><span style="width:42px;text-align:right">Total</span></div>
  ${rows.map(r => `
    <div class="item">
      <div style="font-size:10px;margin-bottom:2px;word-break:break-word"><strong>${r.cantidad} NIU</strong> — ${r.desc}</div>
      ${r.paciente ? `<div style="font-size:9px;color:#7B1FA2;margin-bottom:2px"><strong>Paciente:</strong> ${r.paciente}</div>` : ''}
      <div style="display:flex;justify-content:space-between;font-size:10px"><span style="color:#555">P.Unit: S/ ${r.precio}</span><strong>S/ ${r.subtotal}</strong></div>
    </div>
  `).join('')}
  <hr class="d">
  ${desc > 0 ? `<div class="row" style="color:#b45309"><span>DESCUENTOS(-)</span><span>S/ ${fm(desc)}</span></div>` : ''}
  ${promosHTML}
  ${requiereIGV ? `<div class="row"><span>BASE IMPONIBLE</span><span>S/ ${fm(total / 1.18)}</span></div><div class="row"><span>IGV (18%)</span><span>S/ ${fm(total - total / 1.18)}</span></div>` : ''}
  <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:13px;color:#7B1FA2;margin:4px 0 3px"><span>TOTAL</span><span>S/ ${fm(total)}</span></div>
  <hr class="s">
  <div style="font-size:9px;margin-bottom:4px;line-height:1.3"><strong>IMPORTE EN LETRAS: </strong>${importeLetras}</div>
  ${venta.observaciones?.trim() ? `<hr class="d"><div style="font-size:9px"><strong>OBSERVACIONES:</strong><div style="margin-top:2px;white-space:pre-wrap">${venta.observaciones}</div></div>` : ''}
  <hr class="s">
  <div class="center bold purple" style="margin-top:4px;font-size:10px">¡Gracias por su preferencia!</div>
  <script>window.onload=function(){window.focus();window.print();}<\/script>
</body></html>`;
};

// ─── Modal Vista Previa ───────────────────────────────────────────────────────

const FORMATOS_IMPRESION = [
  { id: 'a4',     label: 'A4',          desc: 'Carta / Oficio',    Icon: DocumentTextIcon   },
  { id: 'ticket', label: 'Ticket 72mm', desc: 'Impresora térmica', Icon: ReceiptPercentIcon },
];

const PrintPreviewModal = ({ venta, tipo, onClose }) => {
  const [formato, setFormato]         = useState('a4');
  const [a4Url, setA4Url]             = useState(null);
  const [loadingA4, setLoadingA4]     = useState(false);
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef(null);

  const promociones = venta.promociones_aplicadas || [];

  useEffect(() => {
    if (formato !== 'a4') return;
    let cancelled = false;
    setLoadingA4(true); setA4Url(null);
    obtenerPreviewURL(venta, tipo, 'a4')
      .then(url  => { if (!cancelled) setA4Url(url); })
      .catch(err => console.error('Error preview A4:', err))
      .finally(()  => { if (!cancelled) setLoadingA4(false); });
    return () => { cancelled = true; };
  }, [venta, tipo, formato]);

  const handleDescargar = async () => {
    setDownloading(true);
    try {
      if (formato === 'ticket') {
        if (!ticketRef.current) { alert('Vista previa no disponible'); return; }
        await generarTicketTermico(ticketRef.current, venta, tipo);
      } else {
        await generarTicketPDF(venta, tipo);
      }
    } catch (err) {
      console.error('Error descargando:', err);
      alert('Error al generar el PDF.');
    } finally { setDownloading(false); }
  };

  const handleImprimir = async () => {
    if (formato === 'ticket') {
      const ventana = window.open('', '_blank');
      ventana.document.write(buildTicketHTML(venta, tipo));
      ventana.document.close();
    } else {
      try {
        setDownloading(true);
        const doc    = await generarPDFA4(venta, tipo);
        const pdfUrl = URL.createObjectURL(doc.output('blob'));
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;top:-10000px;left:-10000px;width:0;height:0';
        document.body.appendChild(iframe);
        iframe.onload = () => {
          setTimeout(() => {
            try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch {}
            setTimeout(() => { document.body.removeChild(iframe); URL.revokeObjectURL(pdfUrl); }, 1000);
          }, 500);
        };
        iframe.src = pdfUrl;
      } catch { alert('Error al preparar la impresión'); }
      finally { setDownloading(false); }
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <PrinterIcon className="w-5 h-5 text-[#7B1FA2]" />
            <h2 className="font-bold text-gray-900">Vista Previa de Impresión</h2>
            {venta.codigo_comprobante && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">{venta.codigo_comprobante}</span>
            )}
            {promociones.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                <SparklesIcon className="w-3 h-3" />
                {promociones.length} promo{promociones.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Formato:</span>
          {FORMATOS_IMPRESION.map(({ id, label, desc, Icon }) => (
            <button key={id} onClick={() => setFormato(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                formato === id ? 'border-[#7B1FA2] bg-purple-50 text-[#7B1FA2]' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
              }`}>
              <Icon className="w-4 h-4" />{label}
              <span className={`text-xs font-normal ${formato === id ? 'text-purple-500' : 'text-gray-400'}`}>{desc}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto bg-gray-100 relative min-h-0">
          {formato === 'a4' && (
            <>
              {loadingA4 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 gap-3 z-10">
                  <div className="w-10 h-10 border-4 border-gray-300 border-t-[#7B1FA2] rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 font-medium">Generando vista previa A4...</p>
                </div>
              )}
              {a4Url && !loadingA4 && (
                <iframe src={a4Url} className="w-full border-0" style={{ height: '100%', minHeight: '500px' }} title="Vista previa A4" />
              )}
              {!a4Url && !loadingA4 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm text-gray-400">No se pudo generar la vista previa</p>
                </div>
              )}
            </>
          )}
          {formato === 'ticket' && (
            <div className="py-8 px-4 flex justify-center">
              <TicketPreviewHTML ref={ticketRef} venta={venta} tipo={tipo} />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <p className="text-xs text-gray-400">
            {formato === 'ticket' ? 'Descarga o imprime el ticket térmico de 72mm' : 'Descarga o imprime en formato A4 (210 × 297 mm)'}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cerrar</button>
            <button onClick={handleDescargar} disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#7B1FA2] bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 disabled:opacity-50">
              <ArrowDownTrayIcon className="w-4 h-4" />
              {downloading ? 'Generando...' : 'Descargar PDF'}
            </button>
            <button onClick={handleImprimir} disabled={downloading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] disabled:opacity-50">
              <PrinterIcon className="w-5 h-5" />
              {downloading ? 'Generando...' : 'Imprimir'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── Modal Confirmar Eliminación ──────────────────────────────────────────────

const ConfirmarEliminarModal = ({ venta, tipo, onConfirm, onClose, loading }) => {
  const tieneSesionesUsadas = tipo === 'servicio' && venta?.detalles?.some(d => d.sesiones_usadas > 0);

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900">Confirmar Eliminación</h2>
            <p className="text-xs text-gray-500">Esta acción no se puede deshacer</p>
          </div>
          <button onClick={onClose} disabled={loading} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {tieneSesionesUsadas ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-800 font-medium mb-2">❌ No se puede eliminar esta venta</p>
              <p className="text-sm text-red-700">
                Esta venta tiene sesiones ya utilizadas en citas registradas.
                Solo se pueden eliminar ventas que no hayan sido usadas.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-700">
                ¿Estás seguro de eliminar la venta {tipo === 'servicio' ? 'de servicio' : 'de producto'}
                {venta.codigo_comprobante && <span className="font-semibold"> {venta.codigo_comprobante}</span>}?
              </p>

              <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-semibold">{tipo === 'servicio' ? 'Servicio' : 'Producto'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-semibold">{formatFecha(venta.fecha_venta)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold text-red-600">{formatMonto(venta.total)}</span>
                </div>
              </div>

              {tipo === 'producto' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    ℹ️ El stock de los productos será devuelto automáticamente.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50">
            Cancelar
          </button>
          {!tieneSesionesUsadas && (
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50">
              {loading ? 'Eliminando...' : 'Eliminar Venta'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── Modal Editar Venta (Llama a VenderServiciosTab/VenderProductosTab) ───────

const EditarVentaModal = ({ venta, tipo, onGuardar, onClose, loading }) => {
  const tieneSesionesUsadas = tipo === 'servicio' && venta?.detalles?.some(d => d.sesiones_usadas > 0);

  // Si tiene sesiones usadas, bloqueamos la edición completa
  if (tieneSesionesUsadas) {
    return createPortal(
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900">No se puede editar</h2>
              <p className="text-xs text-gray-500">La venta tiene sesiones usadas</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-gray-700 mb-3">
              Esta venta tiene sesiones ya utilizadas en citas registradas.
            </p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800 font-medium">
                ⚠️ Solo se pueden editar ventas que no hayan sido usadas en ninguna cita.
              </p>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button onClick={onClose}
              className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">
              Cerrar
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Modal que envuelve VenderServiciosTab o VenderProductosTab
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <PencilIcon className="w-5 h-5 text-[#7B1FA2]" />
            <h2 className="font-bold text-gray-900">Editar Venta de {tipo === 'servicio' ? 'Servicio' : 'Producto'}</h2>
            {venta.codigo_comprobante && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                {venta.codigo_comprobante}
              </span>
            )}
          </div>
          <button onClick={onClose} disabled={loading} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {tipo === 'servicio' ? (
            <VenderServiciosTab
              modoEdicion={true}
              ventaExistente={venta}
              onGuardarEdicion={(datosActualizados) => {
                onGuardar(datosActualizados);
              }}
              onCancelarEdicion={onClose}
            />
          ) : (
            <VenderProductosTab
              modoEdicion={true}
              ventaExistente={venta}
              onGuardarEdicion={(datosActualizados) => {
                onGuardar(datosActualizados);
              }}
              onCancelarEdicion={onClose}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── Modal Detalle Venta ──────────────────────────────────────────────────────

const DetalleVentaModal = ({ venta, tipo, onClose }) => {
  const [mostrarPrint, setMostrarPrint] = useState(false);
  const { base, igv, conIgv } = calcularIgv(venta.total, venta.tipo_comprobante?.id);
  const promociones = venta.promociones_aplicadas || [];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              {tipo === 'servicio' ? <ShoppingCartIcon className="w-5 h-5 text-[#7B1FA2]" /> : <CubeIcon className="w-5 h-5 text-[#7B1FA2]" />}
              <h2 className="font-bold text-gray-900">Detalle de Venta de {tipo === 'servicio' ? 'Servicio' : 'Producto'}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setMostrarPrint(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[#7B1FA2] text-white text-sm font-medium rounded-lg hover:bg-[#6A1B9A] transition-colors">
                <PrinterIcon className="w-4 h-4" />Imprimir
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto px-6 py-5 space-y-4">
            {venta.codigo_comprobante && (
              <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 border-l-4 border-purple-600 px-4 py-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-purple-700 mb-0.5">Número de Comprobante</p>
                    <p className="text-2xl font-bold font-mono text-purple-900 tracking-wider">{venta.codigo_comprobante}</p>
                  </div>
                  <div className="text-right">
                    <ComprobanteLabel nombre={venta.tipo_comprobante?.nombre} id={venta.tipo_comprobante?.id} />
                    <p className="text-xs text-gray-500 mt-1">{formatFecha(venta.fecha_venta)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl">
              {!venta.codigo_comprobante && (
                <>
                  <div><p className="text-xs text-gray-500">Fecha</p><p className="font-semibold text-gray-900">{formatFecha(venta.fecha_venta)}</p></div>
                  <div><p className="text-xs text-gray-500">Comprobante</p><div className="mt-0.5"><ComprobanteLabel nombre={venta.tipo_comprobante?.nombre} id={venta.tipo_comprobante?.id} /></div></div>
                </>
              )}
              <div className={!venta.codigo_comprobante ? '' : 'col-span-2'}>
                <p className="text-xs text-gray-500">Tipo de Pagador</p>
                <p className="font-semibold text-gray-900">{tipoPagadorNombre(venta.tipo_pagador_id || venta.tipo_comprador_id)}</p>
              </div>
              {venta.paciente && (
                <div className="col-span-2"><p className="text-xs text-gray-500">Paciente</p>
                  <p className="font-semibold text-gray-900">{venta.paciente.nombres} {venta.paciente.apellido_paterno} {venta.paciente.apellido_materno || ''}</p></div>
              )}
              {venta.responsable && (
                <div className="col-span-2"><p className="text-xs text-gray-500">Responsable (quien paga)</p>
                  <p className="font-semibold text-gray-900">{venta.responsable.nombres} {venta.responsable.apellido_paterno} {venta.responsable.apellido_materno || ''}</p></div>
              )}
              {venta.comprador_externo && (
                <div className="col-span-2"><p className="text-xs text-gray-500">Comprador Externo</p>
                  <p className="font-semibold text-gray-900">{venta.comprador_externo.nombre} - DNI: {venta.comprador_externo.dni}</p></div>
              )}
              {venta.modalidad_pago && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Modalidad de Pago</p>
                <p className="font-semibold text-gray-900">{venta.modalidad_pago.nombre}</p>
              </div>
            )}
            </div>

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
                              ? (d.descripcionLinea || getServicioNombre(d) || d.paquete?.nombre || '—')
                              : (d.producto?.nombre || '—')}
                          </p>
                          {tipo === 'servicio' && d.tipo_venta?.nombre && (
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${d.tipo_venta.nombre.toLowerCase().includes('paquete') ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {d.tipo_venta.nombre}
                            </span>
                          )}
                          {tipo === 'servicio' && getMotivoCita(d) && (
                            <span className="px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded">
                              {getMotivoCita(d)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {tipo === 'servicio' ? (
                            <>{d.sesiones_totales} sesión(es) × {formatMonto(d.precio_unitario)} = {formatMonto(d.sesiones_totales * d.precio_unitario)}
                              {d.paciente && <span className="block mt-1 text-purple-600 font-medium">Para: {d.paciente.nombres} {d.paciente.apellido_paterno} {d.paciente.apellido_materno || ''}</span>}
                            </>
                          ) : (
                            <>{d.cantidad} unid. × {formatMonto(d.precio_unitario)} = {formatMonto(d.cantidad * d.precio_unitario)}</>
                          )}
                        </p>
                        <DescuentoLabel tipoDescuento={d.descuento_tipo} valor={d.descuento_valor} monto={d.descuento_monto} className="mt-1" />
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

            <PanelPromocionesDetalle promociones={promociones} />

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">{formatMonto(venta.subtotal)}</span>
              </div>
              {parseFloat(venta.descuento_monto) > 0 && venta.descuento_tipo && (
                <div className="flex justify-between text-sm text-amber-600">
                  <span>Descuento global ({venta.descuento_tipo.nombre}{venta.descuento_tipo.id === 1 ? `: ${parseFloat(venta.descuento_valor)}%` : ''}):</span>
                  <span className="font-semibold">- {formatMonto(venta.descuento_monto)}</span>
                </div>
              )}
              {conIgv ? (
                <>
                  <div className="flex justify-between text-sm text-gray-500"><span>Base imponible:</span><span className="font-semibold">{formatMonto(base)}</span></div>
                  <div className="flex justify-between text-sm text-gray-500"><span>IGV (18% incluido):</span><span className="font-semibold">{formatMonto(igv)}</span></div>
                </>
              ) : (
                <div className="flex justify-between text-sm text-gray-400"><span>IGV:</span><span className="text-xs italic">No aplica (Nota de Venta)</span></div>
              )}
              <div className="flex justify-between text-lg font-bold text-[#7B1FA2] pt-2 border-t">
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
      {mostrarPrint && <PrintPreviewModal venta={venta} tipo={tipo} onClose={() => setMostrarPrint(false)} />}
    </>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────────

const HistorialVentasTab = () => {
  const [ventasServicios, setVentasServicios] = useState([]);
  const [ventasProductos, setVentasProductos] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [filtros, setFiltros]               = useState({ tipo: 'todos', fechaDesde: '', fechaHasta: '' });
  const [ventaDetalle, setVentaDetalle]     = useState(null);
  const [tipoDetalle, setTipoDetalle]       = useState(null);
  const [ventaImprimir, setVentaImprimir]   = useState(null);
  const [ventaEliminar, setVentaEliminar]   = useState(null);
  const [ventaEditar, setVentaEditar]       = useState(null);
  const [procesando, setProcesando]         = useState(false);
  const [page, setPage]                     = useState(0);
  const [rowsPerPage, setRowsPerPage]       = useState(12);
  const [feedback, setFeedback] = useState(null);

  // Obtener el rol del usuario
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const esAdmision = user?.rol?.id === 2; // ROLES.ADMISION = 2

  useEffect(() => { cargarVentas(); }, []);
  useEffect(() => { setPage(0); }, [filtros.tipo, filtros.fechaDesde, filtros.fechaHasta]);

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
    } catch (err) { console.error('Error cargando ventas:', err); }
    finally { setLoading(false); }
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
      console.error('Error eliminando venta:', err);
      setFeedback({ tipo: 'error', mensaje: err.response?.data?.message || 'Error al eliminar la venta' });
    } finally {
      setProcesando(false);
    }
  };

  const handleEditarVenta = async (payload) => {
    if (!ventaEditar) return;
     console.log('ventaEditar:', ventaEditar);
  console.log('payload:', JSON.stringify(payload, null, 2));
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
      console.error('Error actualizando venta:', err);
      setFeedback({ tipo: 'error', mensaje: err.response?.data?.message || 'Error al actualizar la venta' });
    } finally {
      setProcesando(false);
    }
  };

  const ventasCombinadas = [
    ...ventasServicios.map(v => ({ ...v, tipo: 'servicio' })),
    ...ventasProductos.map(v => ({ ...v, tipo: 'producto' })),
  ].sort((a, b) => new Date(b.created_at || b.fecha_venta) - new Date(a.created_at || a.fecha_venta));

  const ventasFiltradas = filtros.tipo === 'todos'
    ? ventasCombinadas
    : ventasCombinadas.filter(v => filtros.tipo === 'servicios' ? v.tipo === 'servicio' : v.tipo === 'producto');

  const totalMonto      = ventasFiltradas.reduce((acc, v) => acc + parseFloat(v.total || 0), 0);
  const ventasPaginadas = ventasFiltradas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages      = Math.ceil(ventasFiltradas.length / rowsPerPage);

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

        {/* Cards de estadísticas - Solo visible para administradores */}
        {!esAdmision && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Ventas',   value: ventasFiltradas.length,  icon: <ShoppingCartIcon className="w-5 h-5 text-[#7B1FA2]" />, bg: 'bg-[#7B1FA2]/10' },
              { label: 'Total Ingresos', value: formatMonto(totalMonto), icon: <span className="text-lg font-bold text-green-600">S/</span>, bg: 'bg-green-50' },
              { label: 'Servicios',      value: ventasServicios.length,  icon: <ShoppingCartIcon className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50' },
              { label: 'Productos',      value: ventasProductos.length,  icon: <CubeIcon className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>{s.icon}</div>
                  <div><div className="text-xl font-bold text-gray-900">{s.value}</div><div className="text-xs text-gray-500 font-medium">{s.label}</div></div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de Venta</label>
              <select value={filtros.tipo} onChange={e => setFiltros(f => ({ ...f, tipo: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]">
                <option value="todos">Todos</option>
                <option value="servicios">Solo Servicios</option>
                <option value="productos">Solo Productos</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Desde</label>
              <input type="date" value={filtros.fechaDesde} onChange={e => setFiltros(f => ({ ...f, fechaDesde: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Hasta</label>
              <input type="date" value={filtros.fechaHasta} onChange={e => setFiltros(f => ({ ...f, fechaHasta: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]" />
            </div>
            <div className="flex items-end">
              <button onClick={cargarVentas}
                className="w-full px-4 py-2 text-sm font-semibold text-white bg-[#7B1FA2] rounded-lg hover:bg-[#6A1B9A] transition-colors">Filtrar</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-12 h-12 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin" /></div>
          ) : ventasFiltradas.length === 0 ? (
            <div className="text-center py-16 text-gray-400"><ShoppingCartIcon className="w-10 h-10 mx-auto mb-3 opacity-40" /><p className="font-medium">No hay ventas registradas</p></div>
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
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase">Promos</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Base</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">IGV</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Total</th>
                    <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ventasPaginadas.map(v => {
                    const { base, igv, conIgv } = calcularIgv(v.total, v.tipo_comprobante?.id);
                    const promos = v.promociones_aplicadas || [];
                    return (
                      <tr key={`${v.tipo}-${v.id}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          {v.tipo === 'servicio'
                            ? <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">Servicio</span>
                            : <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold">Producto</span>}
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <ComprobanteLabel nombre={v.tipo_comprobante?.nombre} id={v.tipo_comprobante?.id} />
                            {v.codigo_comprobante && <p className="text-sm font-mono font-semibold text-purple-700">{v.codigo_comprobante}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-700">{formatFecha(v.fecha_venta)}</td>
                        <td className="px-4 py-4 text-gray-600 text-xs">{tipoPagadorNombre(v.tipo_pagador_id || v.tipo_comprador_id)}</td>
                        <td className="px-4 py-4 text-gray-900 text-sm">
                          {v.paciente
                            ? `${v.paciente.nombres} ${v.paciente.apellido_paterno} ${v.paciente.apellido_materno || ''}`.trim()
                            : v.responsable
                            ? `${v.responsable.nombres} ${v.responsable.apellido_paterno} ${v.responsable.apellido_materno || ''}`.trim()
                            : v.comprador_externo ? v.comprador_externo.nombre : '—'}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{(v.detalles || []).length}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {promos.length > 0
                            ? <span className="flex items-center justify-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                                <SparklesIcon className="w-3 h-3" />{promos.length}
                              </span>
                            : <span className="text-gray-300 text-xs">—</span>
                          }
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-gray-600">{formatMonto(base)}</td>
                        <td className="px-4 py-4 text-right text-sm text-gray-500">{conIgv ? formatMonto(igv) : <span className="text-gray-300 text-xs">—</span>}</td>
                        <td className="px-4 py-4 text-right font-bold text-gray-900">{formatMonto(v.total)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => { setVentaDetalle(v); setTipoDetalle(v.tipo); }} title="Ver detalle"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-[#7B1FA2] hover:bg-purple-50 transition-colors">
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => setVentaImprimir(v)} title="Imprimir"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-[#7B1FA2] hover:bg-purple-50 transition-colors">
                              <PrinterIcon className="w-4 h-4" />
                            </button>
                            <button  onClick={async () => {
                              try {
                                const ventaCompleta = v.tipo === 'servicio'
                                  ? await getVentaServicioById(v.id)
                                  : await getVentaProductoById(v.id);
                                setVentaEditar({ ...ventaCompleta, tipo: v.tipo });
                              } catch {
                                setVentaEditar(v); // fallback
                              }
                            }} title="Editar venta"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => setVentaEliminar(v)} title="Eliminar venta"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && ventasFiltradas.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-gray-600">
                Mostrando <span className="font-semibold text-gray-900">{page * rowsPerPage + 1}</span> a{' '}
                <span className="font-semibold text-gray-900">{Math.min((page + 1) * rowsPerPage, ventasFiltradas.length)}</span>{' '}
                de <span className="font-semibold text-gray-900">{ventasFiltradas.length}</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-2 w-full sm:w-auto">
                <select value={rowsPerPage} onChange={e => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
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
        <DetalleVentaModal venta={ventaDetalle} tipo={tipoDetalle} onClose={() => { setVentaDetalle(null); setTipoDetalle(null); }} />
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


// 4. Agrega el componente FeedbackModal antes del export default
const FeedbackModal = ({ tipo, mensaje, onClose }) => createPortal(
  <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
      <div className={`px-6 py-8 flex flex-col items-center text-center`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          tipo === 'exito' ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {tipo === 'exito' ? (
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          )}
        </div>
        <h3 className={`text-lg font-bold mb-2 ${tipo === 'exito' ? 'text-gray-900' : 'text-red-700'}`}>
          {tipo === 'exito' ? '¡Listo!' : 'Ocurrió un error'}
        </h3>
        <p className="text-sm text-gray-600">{mensaje}</p>
      </div>
      <div className="px-6 pb-6">
        <button
          onClick={onClose}
          className={`w-full py-2.5 text-sm font-semibold text-white rounded-xl transition-colors ${
            tipo === 'exito' ? 'bg-[#7B1FA2] hover:bg-[#6A1B9A]' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          Aceptar
        </button>
      </div>
    </div>
  </div>,
  document.body
);
export default HistorialVentasTab;