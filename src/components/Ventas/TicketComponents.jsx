import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import logoUrl from '/logo-text-short.png';
import {
  XMarkIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  generarTicketPDF,
  generarTicketTermico,
  generarPDFA4,
  obtenerPreviewURL,
  getImporteLetras,
  getNombreComprador,
  getDniComprador,
  formatMoney,
} from '../../utils/pdfGenerator';

// ─── Helpers compartidos ──────────────────────────────────────────────────────

export const getServicioNombre = (d) =>
  d?.servicio_tarifa?.servicio?.nombre || '-';

export const getMotivoCita = (d) =>
  d?.servicio_tarifa?.motivo_cita?.nombre || '';

export const getInfoBeneficio = (promoAplicada) => {
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

// ─── buildDetalleRows ─────────────────────────────────────────────────────────
// Transforma los detalles de una venta en filas listas para renderizar en ticket.
// Centralizado para que TicketPreviewHTML y buildTicketHTML usen la misma lógica.

export const buildDetalleRows = (detalles, tipo, fm) => {
  const toFloat = (v) => parseFloat(v || 0);

  if (tipo !== 'servicio') {
    return (detalles || []).map((d) => ({
      desc:     d.producto?.nombre || '-',
      cantidad: toFloat(d.cantidad).toFixed(2),
      precio:   fm(toFloat(d.precio_unitario)),
      subtotal: fm(toFloat(d.subtotal)),
      paciente: null,
      esCombo:  false,
    }));
  }

  // ── Separar combos de ítems normales ────────────────────────────────────────
  const combosMap = {};
  const normales  = [];

  (detalles || []).forEach((d) => {
    if (d.paquete_combo_id) {
      if (!combosMap[d.paquete_combo_id]) {
        combosMap[d.paquete_combo_id] = {
          nombre:   d.paqueteCombo?.nombre
                 || d.descripcion_linea?.split(' - ')[0]
                 || d.descripcionLinea?.split(' - ')[0]
                 || 'Paquete Combo',
          subtotal: 0,
          items:    [],
        };
      }
      combosMap[d.paquete_combo_id].subtotal += toFloat(d.subtotal);
      combosMap[d.paquete_combo_id].items.push(d);
    } else {
      normales.push(d);
    }
  });

  const rows = [];

  // ── Combos ──────────────────────────────────────────────────────────────────
  Object.values(combosMap).forEach((combo) => {
    combo.items.forEach((d, idx) => {
      const esPrimero = idx === 0;

      let servicioNombre;
      const esDocumento = d.tipoItemVenta === 2 || d.tipo_item_venta === 2
                       || d.documentoTarifaId || d.documento_tarifa_id;

      if (d.descripcionLinea) {
        const partes = d.descripcionLinea.split(' - ');
        servicioNombre = partes.length > 1 ? partes.slice(1).join(' - ') : partes[0];
      } else if (esDocumento) {
        servicioNombre = d.documento_tarifa?.nombre || 'Documento';
      } else {
        const motivoCita = getMotivoCita(d);
        const srvNombre  = getServicioNombre(d);
        servicioNombre   = motivoCita ? `${srvNombre} [${motivoCita}]` : srvNombre;
      }

      const paciente = d.paciente
        ? `${d.paciente.nombres || ''} ${d.paciente.apellido_paterno || ''} ${d.paciente.apellido_materno || ''}`.trim()
        : null;

      rows.push({
        desc:              `${combo.nombre} - ${servicioNombre}`,
        cantidad:          (d.sesiones_totales || 1).toFixed(2),
        precio:            esPrimero ? fm(combo.subtotal) : null,
        subtotal:          esPrimero ? fm(combo.subtotal) : null,
        paciente,
        esCombo:           true,
        esPrimerItemCombo: esPrimero,
        nombreCombo:       combo.nombre,
      });
    });
  });

  // ── Ítems normales ──────────────────────────────────────────────────────────
  normales.forEach((d) => {
    if (d.descripcionLinea) {
      rows.push({
        desc:     d.descripcionLinea,
        cantidad: (d.sesiones_totales || 1).toFixed(2),
        precio:   fm(toFloat(d.precio_unitario)),
        subtotal: fm(toFloat(d.subtotal)),
        paciente: d.paciente
          ? `${d.paciente.nombres || ''} ${d.paciente.apellido_paterno || ''} ${d.paciente.apellido_materno || ''}`.trim()
          : null,
        esCombo: false,
      });
      return;
    }

    const esPaquete   = d.tipo_venta?.nombre?.toLowerCase().includes('paquete');
    const esDocumento = d.tipoItemVenta === 2 || d.tipo_item_venta === 2
                     || d.documentoTarifaId   || d.documento_tarifa_id;
    const motivoCita  = getMotivoCita(d);
    const srvNombre   = esDocumento
      ? (d.documento_tarifa?.nombre || d.documentoTarifa?.nombre || 'Informe')
      : getServicioNombre(d);

    let desc, cantidad;
    if (esPaquete && d.paquete) {
      const spp = d.paquete.cantidad_sesiones || d.paquete.sesiones || d.paquete.numero_sesiones || 1;
      cantidad  = Math.round((d.sesiones_totales || 0) / spp).toFixed(2);
      const base = srvNombre !== '-'
        ? `${d.paquete.nombre}- ${srvNombre}`
        : `${d.paquete.nombre} `;
      desc = motivoCita ? `${base} [${motivoCita}]` : base;
    } else {
      cantidad = (d.sesiones_totales || 0).toFixed(2);
      desc     = motivoCita ? `${srvNombre} [${motivoCita}]` : srvNombre;
    }

    const precioUnitario = toFloat(d.precio_unitario);
    const subtotal       = precioUnitario * (d.sesiones_totales || 1);
    const paciente       = d.paciente
      ? `${d.paciente.nombres || ''} ${d.paciente.apellido_paterno || ''} ${d.paciente.apellido_materno || ''}`.trim()
      : null;

    rows.push({
      desc,
      cantidad,
      precio:   fm(precioUnitario),
      subtotal: fm(subtotal),
      paciente,
      esCombo:  false,
    });
  });

  return rows;
};

// ─── TicketPreviewHTML ────────────────────────────────────────────────────────

export const TicketPreviewHTML = React.forwardRef(({ venta, tipo }, ref) => {
  const promociones = venta.promociones_aplicadas || [];
  const toFloat     = (v) => parseFloat(v || 0);
  const total       = toFloat(venta.total);

  const descuentoItems  = (venta.detalles || []).reduce((sum, d) => sum + toFloat(d.descuento_monto), 0);
  const descuentoGlobal = toFloat(venta.descuento_monto);
  const descuento       = descuentoItems + descuentoGlobal;

  const totalPromos = promociones.reduce((s, p) => {
    const { esProductoGratis, esItemGratis } = getInfoBeneficio(p);
    return (esProductoGratis || esItemGratis) ? s : s + parseFloat(p.monto_ahorrado || 0);
  }, 0);

  const nombreCliente = (() => {
    if (venta.paciente)          return `${venta.paciente.nombres || ''} ${venta.paciente.apellido_paterno || ''} ${venta.paciente.apellido_materno || ''}`.trim();
    if (venta.responsable)       return `${venta.responsable.nombres || ''} ${venta.responsable.apellido_paterno || ''} ${venta.responsable.apellido_materno || ''}`.trim();
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

      {(() => {
        const elementos = [];
        let i = 0;
        while (i < rows.length) {
          const r = rows[i];
          if (r.esCombo && r.esPrimerItemCombo) {
            const comboRows = [];
            let j = i;
            while (j < rows.length && rows[j].esCombo && rows[j].nombreCombo === r.nombreCombo) {
              comboRows.push(rows[j]);
              j++;
            }
            elementos.push(
              <div key={`combo-${i}`} style={{ marginBottom: '4px', borderBottom: '1px dotted #ddd', paddingBottom: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                  <span style={s.bold}>{r.nombreCombo}</span>
                  <span style={s.bold}>S/ {r.subtotal}</span>
                </div>
                {comboRows.map((cr, idx) => {
                  const partes = cr.desc.split(' - ');
                  const servicioDesc = partes.slice(1).join(' - ') || partes[0];
                  return (
                    <div key={idx} style={{ paddingLeft: '8px', fontSize: '9px', color: '#444', marginBottom: '1px' }}>
                      <div>• {cr.cantidad} NIU — {servicioDesc}</div>
                      {tipo === 'servicio' && cr.paciente && (
                        <div style={{ color: '#7B1FA2' }}>Paciente: {cr.paciente}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
            i = j;
          } else if (!r.esCombo) {
            elementos.push(
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
            );
            i++;
          } else {
            i++;
          }
        }
        return elementos;
      })()}

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
      {(() => {
        const pagosVenta = Array.isArray(venta.pagos) && venta.pagos.length > 0
          ? venta.pagos
          : venta.modalidad_pago ? [{ modalidad_pago: venta.modalidad_pago, monto: venta.total }] : [];
        if (!pagosVenta.length) return null;
        return (
          <div style={{ borderTop: '1px dashed #ccc', marginTop: '3px', paddingTop: '3px' }}>
            <div style={{ fontSize: '8px', fontWeight: '700', color: '#555', marginBottom: '2px' }}>FORMA DE PAGO</div>
            {pagosVenta.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '1px' }}>
                <span>{p.modalidad_pago?.nombre || '—'}{p.referencia ? ` — ${p.referencia}` : ''}</span>
                <span style={{ fontWeight: '600' }}>S/ {formatMoney(p.monto)}</span>
              </div>
            ))}
          </div>
        );
      })()}
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

// ─── buildTicketHTML (ventana de impresión térmica) ───────────────────────────

export const buildTicketHTML = (venta, tipo) => {
  const promociones = venta.promociones_aplicadas || [];
  const toFloat     = (v) => parseFloat(v || 0);
  const fm          = (n) => parseFloat(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const total       = toFloat(venta.total);

  const descuentoItems  = (venta.detalles || []).reduce((sum, d) => sum + toFloat(d.descuento_monto), 0);
  const descuentoGlobal = toFloat(venta.descuento_monto);
  const desc            = descuentoItems + descuentoGlobal;

  const totalPromos = promociones.reduce((s, p) => {
    const reglas   = p.promocion?.reglas || [];
    const esGratis = reglas.some((r) => r.beneficio_tipo_id === 3 || r.beneficio_tipo_id === 4);
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
    if (venta.paciente)          return `${venta.paciente.nombres || ''} ${venta.paciente.apellido_paterno || ''} ${venta.paciente.apellido_materno || ''}`.trim();
    if (venta.responsable)       return `${venta.responsable.nombres || ''} ${venta.responsable.apellido_paterno || ''} ${venta.responsable.apellido_materno || ''}`.trim();
    if (venta.comprador_externo) return venta.comprador_externo.nombre_completo || venta.comprador_externo.nombre || '-';
    return '-';
  })();
  const nombreComprador = (() => {
    if (venta.responsable)       return `${venta.responsable.nombres || ''} ${venta.responsable.apellido_paterno || ''} ${venta.responsable.apellido_materno || ''}`.trim();
    if (venta.comprador_externo) return venta.comprador_externo.nombre_completo || venta.comprador_externo.nombre || '-';
    if (venta.paciente)          return `${venta.paciente.nombres || ''} ${venta.paciente.apellido_paterno || ''} ${venta.paciente.apellido_materno || ''}`.trim();
    return '-';
  })();
  const dni          = venta.paciente?.dni || venta.paciente?.numero_documento || venta.responsable?.dni || venta.responsable?.numero_documento || venta.comprador_externo?.dni || '-';
  const dniComprador = venta.responsable?.dni || venta.responsable?.numero_documento || venta.comprador_externo?.dni || venta.paciente?.dni || venta.paciente?.numero_documento || '-';

  const campos = tipo === 'servicio'
    ? [['Fecha emisión', fechaEmision], ['Comprador', nombreComprador], ['DNI', dniComprador], ['Dirección', '-']]
    : [['Fecha emisión', fechaEmision], ['Cliente', nombreCliente], ['DNI', dni], ['Dirección', '-']];

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

  const rowsHTML = (() => {
    let html = '';
    let i = 0;
    while (i < rows.length) {
      const r = rows[i];
      if (r.esCombo && r.esPrimerItemCombo) {
        const comboRows = [];
        let j = i;
        while (j < rows.length && rows[j].esCombo && rows[j].nombreCombo === r.nombreCombo) {
          comboRows.push(rows[j]);
          j++;
        }
        html += `
          <div class="item">
            <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px">
              <span class="bold"> ${r.nombreCombo}</span>
              <span class="bold">S/ ${r.subtotal}</span>
            </div>
            ${comboRows.map(cr => {
              const partes = cr.desc.split(' - ');
              const servicioDesc = partes.slice(1).join(' - ') || partes[0];
              return `
                <div style="padding-left:8px;font-size:9px;color:#444;margin-bottom:1px">
                  <div>• ${cr.cantidad} NIU — ${servicioDesc}</div>
                  ${cr.paciente ? `<div style="color:#7B1FA2">Paciente: ${cr.paciente}</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>`;
        i = j;
      } else if (!r.esCombo) {
        html += `
          <div class="item">
            <div style="font-size:10px;margin-bottom:2px;word-break:break-word">
              <strong>${r.cantidad} NIU</strong> — ${r.desc}
            </div>
            ${r.paciente ? `<div style="font-size:9px;color:#7B1FA2;margin-bottom:2px"><strong>Paciente:</strong> ${r.paciente}</div>` : ''}
            <div style="display:flex;justify-content:space-between;font-size:10px">
              <span style="color:#555">P.Unit: S/ ${r.precio}</span>
              <strong>S/ ${r.subtotal}</strong>
            </div>
          </div>`;
        i++;
      } else {
        i++;
      }
    }
    return html;
  })();

  const pagosHTML = (() => {
    const pagosVenta = Array.isArray(venta.pagos) && venta.pagos.length > 0
      ? venta.pagos
      : venta.modalidad_pago ? [{ modalidad_pago: venta.modalidad_pago, monto: venta.total }] : [];
    if (!pagosVenta.length) return '';
    const rows = pagosVenta.map(p => `<div style="display:flex;justify-content:space-between;font-size:9px;margin-bottom:1px"><span>${p.modalidad_pago?.nombre || '—'}${p.referencia ? ` — ${p.referencia}` : ''}</span><span style="font-weight:600">S/ ${fm(p.monto)}</span></div>`).join('');
    return `<div style="border-top:1px dashed #ccc;margin-top:3px;padding-top:3px"><div style="font-size:8px;font-weight:700;color:#555;margin-bottom:2px">FORMA DE PAGO</div>${rows}</div>`;
  })();

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
  <div class="center" style="margin-bottom:6px"><img src="${window.location.origin}/logo-text-short.png" style="width:160px;height:auto;display:block;margin:0 auto"></div>
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
  ${rowsHTML}
  <hr class="d">
  ${desc > 0 ? `<div class="row" style="color:#b45309"><span>DESCUENTOS(-)</span><span>S/ ${fm(desc)}</span></div>` : ''}
  ${promosHTML}
  ${requiereIGV ? `<div class="row"><span>BASE IMPONIBLE</span><span>S/ ${fm(total / 1.18)}</span></div><div class="row"><span>IGV (18%)</span><span>S/ ${fm(total - total / 1.18)}</span></div>` : ''}
  <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:13px;color:#7B1FA2;margin:4px 0 3px"><span>TOTAL</span><span>S/ ${fm(total)}</span></div>
  ${pagosHTML}
  <hr class="s">
  <div style="font-size:9px;margin-bottom:4px;line-height:1.3"><strong>IMPORTE EN LETRAS: </strong>${importeLetras}</div>
  ${venta.observaciones?.trim() ? `<hr class="d"><div style="font-size:9px"><strong>OBSERVACIONES:</strong><div style="margin-top:2px;white-space:pre-wrap">${venta.observaciones}</div></div>` : ''}
  <hr class="s">
  <div class="center bold purple" style="margin-top:4px;font-size:10px">¡Gracias por su preferencia!</div>
  <script>window.onload=function(){window.focus();window.print();}<\/script>
</body></html>`;
};

// ─── PrintPreviewModal ────────────────────────────────────────────────────────

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
    setLoadingA4(true);
    setA4Url(null);
    obtenerPreviewURL(venta, tipo, 'a4')
      .then(url  => { if (!cancelled) setA4Url(url); })
      .catch(err => console.error('Error preview A4:', err))
      .finally(() => { if (!cancelled) setLoadingA4(false); });
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
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                {venta.codigo_comprobante}
              </span>
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
            {promociones.length > 0 && (
              <span className="ml-2 text-green-600 font-medium">
                · {promociones.length} promoción{promociones.length > 1 ? 'es' : ''} incluida{promociones.length > 1 ? 's' : ''}
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
              Cerrar
            </button>
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

export default PrintPreviewModal;
