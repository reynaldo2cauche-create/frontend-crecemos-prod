import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  XMarkIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { obtenerPreviewURL, generarTicketPDF, generarTicketTermico, generarPDFA4 } from '../utils/pdfGenerator';

const fetchPromocionesAplicadas = async (tipoVentaId, ventaId) => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    const res = await fetch(
      `/backend_api/promociones/aplicadas/${tipoVentaId}/${ventaId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
};

const getTipoVentaId = (tipo) => tipo === 'servicio' ? 2 : 1;

const buildTicketHTML = (venta, tipo, promociones = []) => {
  const toFloat = (v) => parseFloat(v || 0);
  const fm      = (n)  => parseFloat(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const total   = toFloat(venta.total);
  const desc    = toFloat(venta.descuento_monto);
  const promos  = Array.isArray(promociones) ? promociones : [];

  // Solo suma descuentos monetarios reales (los regalos tienen monto_ahorrado = 0)
  const totalPromos = promos.reduce((s, p) => s + toFloat(p.monto_ahorrado), 0);

  const fechaEmision = (() => {
    const str = String(venta.fecha_venta || '');
    const [datePart, timePart] = str.split('T');
    const [y, m, d] = datePart.split('-').map(Number);
    if (timePart) {
      const [h, min] = timePart.split(':').map(Number);
      return new Date(y, m - 1, d, h, min).toLocaleString('es-PE', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    }
    return new Date(y, m - 1, d).toLocaleDateString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
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

  const dni = venta.paciente?.dni || venta.paciente?.numero_documento
    || venta.responsable?.dni || venta.responsable?.numero_documento
    || venta.comprador_externo?.dni || '-';
  const dniComprador = venta.responsable?.dni || venta.responsable?.numero_documento
    || venta.comprador_externo?.dni
    || venta.paciente?.dni || venta.paciente?.numero_documento || '-';

  const campos = tipo === 'servicio'
    ? [['Fecha emisión', fechaEmision], ['Comprador', nombreComprador], ['DNI', dniComprador], ['Dirección', '-']]
    : [['Fecha emisión', fechaEmision], ['Cliente', nombreCliente], ['DNI', dni], ['Dirección', '-']];

  const rows = (venta.detalles || []).map(d => {
    if (tipo === 'servicio') {
      const esPaquete = d.tipo_venta?.nombre?.toLowerCase().includes('paquete');
      let dsc, cant;
      if (esPaquete && d.paquete) {
        const spp = d.paquete.cantidad_sesiones || d.paquete.sesiones || d.paquete.numero_sesiones || 1;
        cant = Math.round((d.sesiones_totales || 0) / spp).toFixed(2);
        const srv = d.servicio?.nombre || '';
        dsc = srv ? `${d.paquete.nombre} (${spp} SES.) - ${srv}` : `${d.paquete.nombre} (${spp} SES.)`;
      } else {
        cant = (d.sesiones_totales || 0).toFixed(2);
        dsc = d.servicio?.nombre || '-';
      }
      const precio = toFloat(d.precio_unitario) * (d.sesiones_totales || 1);
      const sub    = precio - toFloat(d.descuento_monto);
      const pac    = d.paciente
        ? `${d.paciente.nombres || ''} ${d.paciente.apellido_paterno || ''} ${d.paciente.apellido_materno || ''}`.trim() || '-'
        : null;
      return { desc: dsc, cantidad: cant, precio: fm(precio), subtotal: fm(sub), paciente: pac };
    }
    return {
      desc:     d.producto?.nombre || '-',
      cantidad: toFloat(d.cantidad).toFixed(2),
      precio:   fm(toFloat(d.precio_unitario)),
      subtotal: fm(toFloat(d.subtotal)),
      paciente: null,
    };
  });

  const nAL = (num) => {
    const U = ['','UNO','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE'];
    const D = ['','DIEZ','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
    const E = ['DIEZ','ONCE','DOCE','TRECE','CATORCE','QUINCE','DIECISEIS','DIECISIETE','DIECIOCHO','DIECINUEVE'];
    const C = ['','CIENTO','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
    const g = (n) => {
      if (!n) return '';
      if (n < 10) return U[n];
      if (n < 20) return E[n - 10];
      if (n < 30) return n === 20 ? 'VEINTE' : 'VEINTI' + U[n - 20];
      if (n < 100) return D[Math.floor(n / 10)] + (n % 10 ? ' Y ' + U[n % 10] : '');
      return (n === 100 ? 'CIEN' : C[Math.floor(n / 100)]) + (n % 100 ? ' ' + g(n % 100) : '');
    };
    if (!num) return 'CERO';
    if (num < 1000) return g(num);
    if (num < 1000000) return (Math.floor(num / 1000) === 1 ? 'MIL' : g(Math.floor(num / 1000)) + ' MIL') + (num % 1000 ? ' ' + g(num % 1000) : '');
    return num.toString();
  };

  const importeLetras = `${nAL(Math.floor(total))} CON ${String(Math.round((total % 1) * 100)).padStart(2, '0')}/100 SOLES`;
  const tipoNombre    = (venta.tipo_comprobante?.nombre || 'TICKET DE VENTA').toUpperCase();
  const requiereIGV   = tipoNombre.includes('BOLETA') || tipoNombre.includes('FACTURA');

  // ── Bloque de promociones ──────────────────────────────────────────────────
  // FIX: detectar regalos y mostrar "¡GRATIS!" + nombre del producto regalado
  const promosHTML = promos.length > 0 ? `
    <div style="border-top:1px dashed #bbf7d0;margin-top:3px;padding-top:3px">
      <div style="font-size:9px;font-weight:700;color:#15803d;margin-bottom:2px">✦ PROMOCIONES APLICADAS</div>
      ${promos.map(p => {
        const esRegalo       = p.producto_regalo != null || toFloat(p.monto_ahorrado) === 0;
        const nombrePromo    = p.promocion?.nombre || `Promo #${p.promocion_id}`;
        const nombreProducto = p.producto_regalo?.nombre || '';

        // Si es regalo: mostrar nombre del producto regalado y "¡GRATIS!"
        // Si es descuento: mostrar "-S/ monto" como antes
        const etiqueta = esRegalo && nombreProducto
          ? `• ${nombrePromo}: ${nombreProducto}`
          : `• ${nombrePromo}`;

        const valor = esRegalo
          ? `<span style="font-weight:700;flex-shrink:0;color:#16a34a">¡GRATIS!</span>`
          : `<span style="font-weight:700;flex-shrink:0">-S/ ${fm(p.monto_ahorrado)}</span>`;

        return `
          <div style="display:flex;justify-content:space-between;font-size:9px;color:#16a34a;margin-bottom:2px">
            <span style="flex:1;padding-right:4px">${etiqueta}</span>
            ${valor}
          </div>
        `;
      }).join('')}
      ${totalPromos > 0 ? `
        <div style="display:flex;justify-content:space-between;font-weight:700;font-size:10px;color:#15803d;background:#f0fdf4;border-radius:2px;padding:2px 3px;margin:2px 0 4px">
          <span>AHORRO TOTAL PROMOCIONES</span><span>-S/ ${fm(totalPromos)}</span>
        </div>
      ` : ''}
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
  <div class="center" style="margin-bottom:6px">
    <img src="${window.location.origin}/logo-text-short.png" style="width:130px;height:auto;display:block;margin:0 auto">
  </div>
  <div class="center" style="font-size:10px;line-height:1.4">
    <div class="bold" style="font-size:12px">CONTIGO CRECEMOS E.I.R.L.</div>
    <div>Centro de terapias Crecemos</div>
    <div>LT. 5 MZ. W1 URB. EL PINAR PARCELA H</div>
    <div>LIMA LIMA COMAS — Telf.: 957 064 401</div>
    <div>info@crecemos.com.pe</div>
    <div class="bold" style="margin-top:2px">R.U.C. N° 20601074380</div>
  </div>
  <hr class="s">
  <div class="center bold purple" style="font-size:11px">${tipoNombre}</div>
  <div class="center bold purple" style="font-size:14px;letter-spacing:1px;margin:3px 0">${venta.codigo_comprobante || '#00000'}</div>
  <hr class="s">
  <div style="margin-bottom:6px">
    ${campos.map(([l, v]) => `
      <div class="campo">
        <span class="campo-label">${l}:</span>
        <span style="word-break:break-word">${v}</span>
      </div>
    `).join('')}
  </div>
  <hr class="d">
  <div class="thead">
    <span style="width:25px">Cant.</span>
    <span style="flex:1;padding-left:3px">Descripción</span>
    <span style="width:42px;text-align:right">P.Unit</span>
    <span style="width:42px;text-align:right">Total</span>
  </div>
  ${rows.map(r => `
    <div class="item">
      <div style="font-size:10px;margin-bottom:2px;word-break:break-word">
        <strong>${r.cantidad} NIU</strong> — ${r.desc}
      </div>
      ${r.paciente ? `<div style="font-size:9px;color:#7B1FA2;margin-bottom:2px"><strong>Paciente:</strong> ${r.paciente}</div>` : ''}
      <div style="display:flex;justify-content:space-between;font-size:10px">
        <span style="color:#555">P.Unit: S/ ${r.precio}</span>
        <strong>S/ ${r.subtotal}</strong>
      </div>
    </div>
  `).join('')}
  <hr class="d">
  ${desc > 0 ? `<div class="row" style="color:#b45309"><span>DESCUENTOS(-)</span><span>S/ ${fm(desc)}</span></div>` : ''}
  ${promosHTML}
  ${requiereIGV ? `
    <div class="row"><span>BASE IMPONIBLE</span><span>S/ ${fm(total / 1.18)}</span></div>
    <div class="row"><span>IGV (18%)</span><span>S/ ${fm(total - total / 1.18)}</span></div>
  ` : ''}
  <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:13px;color:#7B1FA2;margin:4px 0 3px">
    <span>TOTAL</span><span>S/ ${fm(total)}</span>
  </div>
  <hr class="s">
  <div style="font-size:9px;margin-bottom:4px;line-height:1.3">
    <strong>IMPORTE EN LETRAS: </strong>${importeLetras}
  </div>
  ${venta.nota?.trim() ? `
    <hr class="d">
    <div style="font-size:9px">
      <strong>OBSERVACIONES:</strong>
      <div style="margin-top:2px;white-space:pre-wrap">${venta.nota}</div>
    </div>
  ` : ''}
  <hr class="s">
  <div class="center bold purple" style="margin-top:4px;font-size:10px">¡Gracias por su preferencia!</div>
  <script>window.onload=function(){window.focus();window.print();}<\/script>
</body></html>`;
};

const PrintPreviewModal = ({ venta, tipo, onClose }) => {
  const [formato, setFormato]         = useState('a4');
  const [previewUrl, setPreview]      = useState(null);
  const [loading, setLoading]         = useState(false);
  const [generating, setGenerating]   = useState(false);
  const [promociones, setPromociones] = useState([]);

  useEffect(() => {
    fetchPromocionesAplicadas(getTipoVentaId(tipo), venta.id)
      .then(data => setPromociones(Array.isArray(data) ? data : []))
      .catch(() => setPromociones([]));
  }, [venta.id, tipo]);

  const regenerarPreview = useCallback(async () => {
    setLoading(true);
    setPreview(null);
    try {
      const url = await obtenerPreviewURL(venta, tipo, formato);
      setPreview(url);
    } catch (err) {
      console.error('Error generando preview:', err);
    } finally {
      setLoading(false);
    }
  }, [venta, tipo, formato]);

  useEffect(() => { regenerarPreview(); }, [regenerarPreview]);

  const handleDescargar = async () => {
    setGenerating(true);
    try {
      if (formato === 'ticket') await generarTicketTermico(venta, tipo);
      else                      await generarTicketPDF(venta, tipo);
    } catch (err) {
      console.error('Error descargando PDF:', err);
      alert('Error al generar el PDF. Intente nuevamente.');
    } finally {
      setGenerating(false);
    }
  };

  const handleImprimir = async () => {
    if (formato === 'ticket') {
      const ventana = window.open('', '_blank');
      ventana.document.write(buildTicketHTML(venta, tipo, promociones));
      ventana.document.close();
    } else {
      try {
        setGenerating(true);
        const doc    = await generarPDFA4(venta, tipo);
        const pdfUrl = URL.createObjectURL(doc.output('blob'));
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;top:-10000px;left:-10000px;width:0;height:0';
        document.body.appendChild(iframe);
        iframe.onload = () => {
          setTimeout(() => {
            try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch (e) { console.error(e); }
            setTimeout(() => { document.body.removeChild(iframe); URL.revokeObjectURL(pdfUrl); }, 1000);
          }, 500);
        };
        iframe.src = pdfUrl;
      } catch (error) {
        console.error('Error al preparar impresión:', error);
        alert('Error al preparar la impresión');
      } finally {
        setGenerating(false);
      }
    }
  };

  const FORMATOS = [
    { id: 'a4',     label: 'A4',          desc: 'Carta / Oficio',    icon: DocumentTextIcon   },
    { id: 'ticket', label: 'Ticket 72mm', desc: 'Impresora térmica', icon: ReceiptPercentIcon },
  ];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">

        {/* Header */}
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

        {/* Selector de formato */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Formato:</span>
          {FORMATOS.map((f) => {
            const Icon   = f.icon;
            const activo = formato === f.id;
            return (
              <button key={f.id} onClick={() => setFormato(f.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                  activo
                    ? 'border-[#7B1FA2] bg-purple-50 text-[#7B1FA2]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                }`}>
                <Icon className="w-4 h-4" />
                <span>{f.label}</span>
                <span className={`text-xs font-normal ${activo ? 'text-purple-500' : 'text-gray-400'}`}>{f.desc}</span>
              </button>
            );
          })}
          <button onClick={regenerarPreview} disabled={loading}
            className="ml-auto text-xs text-gray-500 hover:text-[#7B1FA2] underline disabled:opacity-40">
            {loading ? 'Generando...' : 'Actualizar'}
          </button>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-hidden bg-gray-200 relative min-h-0">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 gap-3 z-10">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-[#7B1FA2] rounded-full animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Generando vista previa...</p>
            </div>
          )}
          {previewUrl && !loading && (
            <iframe
              id="pdf-preview-iframe"
              src={previewUrl}
              className="w-full h-full border-0"
              title="Vista previa del comprobante"
            />
          )}
          {!previewUrl && !loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-gray-400">No se pudo generar la vista previa</p>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <p className="text-xs text-gray-400">
            {formato === 'ticket' ? 'Optimizado para impresora térmica de 72mm' : 'Formato estándar A4 (210 × 297 mm)'}
            {promociones.length > 0 && (
              <span className="ml-2 text-green-600 font-medium">
                · {promociones.length} promoción{promociones.length > 1 ? 'es' : ''} incluida{promociones.length > 1 ? 's' : ''} en ticket
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
              Cerrar
            </button>
            <button onClick={handleDescargar} disabled={generating || loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#7B1FA2] bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 disabled:opacity-50">
              <ArrowDownTrayIcon className="w-4 h-4" />
              {generating ? 'Descargando...' : 'Descargar PDF'}
            </button>
            <button onClick={handleImprimir} disabled={!previewUrl || loading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] disabled:opacity-50">
              <PrinterIcon className="w-4 h-4" />
              Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PrintPreviewModal;