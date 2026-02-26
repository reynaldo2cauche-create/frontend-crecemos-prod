import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  XMarkIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline';
import { obtenerPreviewURL, generarTicketPDF, generarTicketTermico } from '../../utils/pdfGenerator';

/**
 * Modal de vista previa + impresión.
 *
 * Props:
 *   venta   {object}  — objeto de venta
 *   tipo    {string}  — 'servicio' | 'producto'
 *   onClose {fn}
 */
const PrintPreviewModal = ({ venta, tipo, onClose }) => {
  const [formato, setFormato]       = useState('a4');
  const [previewUrl, setPreview]    = useState(null);
  const [loading, setLoading]       = useState(false);
  const [generating, setGenerating] = useState(false);

  // ── Generar preview cada vez que cambia formato ──────────────────────────────
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

  // ── Descargar ─────────────────────────────────────────────────────────────────
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


  const buildTicketHTML = (venta, tipo) => {
  const toFloat = (v) => parseFloat(v || 0);
  const formatMoney = (num) => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  const total     = toFloat(venta.total);
  const descuento = toFloat(venta.descuento_monto);

  const fechaEmision = (() => {
    const str = String(venta.fecha_venta || '');
    const [datePart, timePart] = str.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    if (timePart) {
      const [h, m] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, h, m).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    return new Date(year, month - 1, day).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  })();

  const nombreCliente = (() => {
    if (venta.paciente) return `${venta.paciente.nombres} ${venta.paciente.apellidos || venta.paciente.apellido_paterno || ''}`.trim();
    if (venta.responsable) return `${venta.responsable.nombres} ${venta.responsable.apellidos || venta.responsable.apellido_paterno || ''}`.trim();
    if (venta.comprador_externo) return venta.comprador_externo.nombre_completo || venta.comprador_externo.nombre || '-';
    return '-';
  })();

  const nombreComprador = (() => {
    if (venta.responsable) return `${venta.responsable.nombres} ${venta.responsable.apellidos || venta.responsable.apellido_paterno || ''}`.trim();
    if (venta.comprador_externo) return venta.comprador_externo.nombre_completo || venta.comprador_externo.nombre || '-';
    if (venta.paciente) return `${venta.paciente.nombres} ${venta.paciente.apellidos || venta.paciente.apellido_paterno || ''}`.trim();
    return '-';
  })();

  const dni = venta.paciente?.dni || venta.paciente?.numero_documento || venta.responsable?.dni || venta.responsable?.numero_documento || venta.comprador_externo?.dni || '-';
  const dniComprador = venta.responsable?.dni || venta.responsable?.numero_documento || venta.comprador_externo?.dni || venta.paciente?.dni || venta.paciente?.numero_documento || '-';

  const campos = tipo === 'servicio'
    ? [['Fecha emisión', fechaEmision], ['Comprador', nombreComprador], ['DNI', dniComprador], ['Dirección', '-']]
    : [['Fecha emisión', fechaEmision], ['Cliente', nombreCliente], ['DNI', dni], ['Dirección', '-']];

  const rows = (venta.detalles || []).map(d => {
    if (tipo === 'servicio') {
      const esPaquete = d.tipo_venta?.nombre?.toLowerCase().includes('paquete');
      let desc, cantidad;
      if (esPaquete && d.paquete) {
        const spp = d.paquete.cantidad_sesiones || d.paquete.sesiones || d.paquete.numero_sesiones || 1;
        cantidad  = Math.round((d.sesiones_totales || 0) / spp).toFixed(2);
        const srv = d.servicio?.nombre || '';
        desc      = srv ? `${d.paquete.nombre} (${spp} SES.) - ${srv}` : `${d.paquete.nombre} (${spp} SES.)`;
      } else {
        cantidad = (d.sesiones_totales || 0).toFixed(2);
        desc     = d.servicio?.nombre || '-';
      }
      const precio   = toFloat(d.precio_unitario) * (d.sesiones_totales || 1);
      const subtotal = precio - toFloat(d.descuento_monto);
      const paciente = d.paciente ? `${d.paciente.nombres} ${d.paciente.apellidos || d.paciente.apellido_paterno || ''}`.trim() : null;
      return { desc, cantidad, precio: formatMoney(precio), subtotal: formatMoney(subtotal), paciente };
    }
    return { desc: d.producto?.nombre || '-', cantidad: toFloat(d.cantidad).toFixed(2), precio: formatMoney(toFloat(d.precio_unitario)), subtotal: formatMoney(toFloat(d.subtotal)), paciente: null };
  });

  // número a letras
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
      if (n < 100) return D[Math.floor(n/10)] + (n%10 ? ' Y ' + U[n%10] : '');
      return (n===100?'CIEN':C[Math.floor(n/100)]) + (n%100 ? ' ' + g(n%100) : '');
    };
    if (!num) return 'CERO';
    if (num < 1000) return g(num);
    if (num < 1000000) return (Math.floor(num/1000)===1?'MIL':g(Math.floor(num/1000))+' MIL') + (num%1000?' '+g(num%1000):'');
    return num.toString();
  };
  const importeLetras = `${nAL(Math.floor(total))} CON ${String(Math.round((total % 1) * 100)).padStart(2,'0')}/100 SOLES`;

  const tipoNombre   = (venta.tipo_comprobante?.nombre || 'TICKET DE VENTA').toUpperCase();
  const requiereIGV  = tipoNombre.includes('BOLETA') || tipoNombre.includes('FACTURA');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.4; color: #111; width: 72mm; padding: 10px 8px; font-weight: 500; }
  @media print { @page { size: 72mm auto; margin: 0; } body { width: 72mm; } }
  .center { text-align: center; }
  .bold   { font-weight: 700; }
  .purple { color: #7B1FA2; }
  hr.d { border: none; border-top: 1px dashed #aaa; margin: 6px 0; }
  hr.s { border: none; border-top: 1px solid  #ccc; margin: 6px 0; }
  .row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px; }
  .campo { display: flex; gap: 3px; margin-bottom: 2px; font-size: 10px; }
  .campo-label { font-weight: bold; min-width: 75px; flex-shrink: 0; }
  .thead { display: flex; justify-content: space-between; font-size: 10px; font-weight: bold; border-bottom: 1px dashed #aaa; padding-bottom: 2px; margin-bottom: 3px; }
  .item  { margin-bottom: 4px; border-bottom: 1px dotted #ddd; padding-bottom: 3px; }
</style>
</head>
<body>
  <div class="center" style="margin-bottom:6px">
    <img src="${window.location.origin}/logo-text-short.png" style="width:130px;height:auto;display:block;margin:0 auto">
  </div>
  <div class="center" style="font-size:10px;line-height:1.4">
    <div class="bold" style="font-size:12px">CONTIGO CRECEMOS E.I.R.L.</div>
    <div>Centro de terapias Crecemos</div>
    <div>LT. 5 MZ. W1 URB. EL PINAR PARCELA H</div>
    <div>LIMA LIMA COMAS</div>
    <div>Telf.: 957 064 401 | info@crecemos.com.pe</div>
    <div class="bold" style="margin-top:2px">R.U.C. N° 20601074380</div>
  </div>
  <hr class="s">
  <div class="center bold purple" style="font-size:11px">${tipoNombre}</div>
  <div class="center bold purple" style="font-size:14px;letter-spacing:1px;margin:3px 0">${venta.codigo_comprobante || '#00000'}</div>
  <hr class="s">
  <div style="margin-bottom:6px">
    ${campos.map(([l, v]) => `<div class="campo"><span class="campo-label">${l}:</span><span style="word-break:break-word">${v}</span></div>`).join('')}
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
      <div style="font-size:10px;margin-bottom:2px;word-break:break-word"><strong>${r.cantidad} NIU</strong> — ${r.desc}</div>
      ${r.paciente ? `<div style="font-size:9px;color:#7B1FA2;margin-bottom:2px"><strong>Paciente:</strong> ${r.paciente}</div>` : ''}
      <div style="display:flex;justify-content:space-between;font-size:10px">
        <span style="color:#555">P.Unit: S/ ${r.precio}</span>
        <strong>S/ ${r.subtotal}</strong>
      </div>
    </div>
  `).join('')}
  <hr class="d">
  ${descuento > 0 ? `<div class="row" style="color:#b45309"><span>DESCUENTOS(-)</span><span>S/ ${formatMoney(descuento)}</span></div>` : ''}
  ${requiereIGV ? `
    <div class="row"><span>BASE IMPONIBLE</span><span>S/ ${formatMoney(total/1.18)}</span></div>
    <div class="row"><span>IGV (18%)</span><span>S/ ${formatMoney(total - total/1.18)}</span></div>
  ` : ''}
  <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:13px;color:#7B1FA2;margin:4px 0 3px">
    <span>TOTAL</span><span>S/ ${formatMoney(total)}</span>
  </div>
  <hr class="s">
  <div style="font-size:9px;margin-bottom:4px;line-height:1.3"><strong>IMPORTE EN LETRAS: </strong>${importeLetras}</div>
  ${venta.nota?.trim() ? `<hr class="d"><div style="font-size:9px"><strong>OBSERVACIONES:</strong><div style="margin-top:2px;white-space:pre-wrap">${venta.nota}</div></div>` : ''}
  <hr class="s">
  <div class="center bold purple" style="margin-top:4px;font-size:10px">¡Gracias por su preferencia!</div>
  <script>window.onload = function(){ window.focus(); window.print(); }<\/script>
</body>
</html>`;
};

  // ── Imprimir ──────────────────────────────────────────────────────────────────
  const handleImprimir = async () => {
    if (formato === 'ticket') {
      const ventana = window.open('', '_blank');
      ventana.document.write(buildTicketHTML(venta, tipo));
      ventana.document.close();
      ventana.onload = () => {
        ventana.focus();
        ventana.print();
      };
    } else {
      // Para A4: generar PDF y usar iframe temporal
      try {
        setGenerating(true);

        // Importar la función para generar PDF
        const { generarPDFA4 } = await import('../../utils/pdfGenerator');
        const doc = await generarPDFA4(venta, tipo);
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Crear iframe temporal oculto
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '-10000px';
        iframe.style.left = '-10000px';
        iframe.style.width = '0';
        iframe.style.height = '0';
        document.body.appendChild(iframe);

        iframe.onload = () => {
          setTimeout(() => {
            try {
              iframe.contentWindow.focus();
              iframe.contentWindow.print();

              // Limpiar después de un tiempo
              setTimeout(() => {
                document.body.removeChild(iframe);
                URL.revokeObjectURL(pdfUrl);
              }, 1000);
            } catch (error) {
              console.error('Error al imprimir:', error);
              document.body.removeChild(iframe);
              URL.revokeObjectURL(pdfUrl);
              alert('Error al abrir el diálogo de impresión');
            }
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
    { id: 'a4',     label: 'A4',        desc: 'Carta / Oficio',    icon: DocumentTextIcon   },
    { id: 'ticket', label: 'Ticket 72mm', desc: 'Impresora térmica', icon: ReceiptPercentIcon },
  ];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <PrinterIcon className="w-5 h-5 text-[#7B1FA2]" />
            <h2 className="font-bold text-gray-900">Vista Previa de Impresión</h2>
            {venta.codigo_comprobante && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                {venta.codigo_comprobante}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ── Selector de formato ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Formato:</span>
          {FORMATOS.map((f) => {
            const Icon   = f.icon;
            const activo = formato === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFormato(f.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                  activo
                    ? 'border-[#7B1FA2] bg-purple-50 text-[#7B1FA2]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{f.label}</span>
                <span className={`text-xs font-normal ${activo ? 'text-purple-500' : 'text-gray-400'}`}>
                  {f.desc}
                </span>
              </button>
            );
          })}

          <button
            onClick={regenerarPreview}
            disabled={loading}
            className="ml-auto text-xs text-gray-500 hover:text-[#7B1FA2] underline disabled:opacity-40"
          >
            {loading ? 'Generando...' : 'Actualizar'}
          </button>
        </div>

        {/* ── Preview ─────────────────────────────────────────────────────────── */}
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

        {/* ── Acciones ────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <p className="text-xs text-gray-400">
            {formato === 'ticket'
              ? 'Optimizado para impresora térmica de 72mm'
              : 'Formato estándar A4 (210 × 297 mm)'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              Cerrar
            </button>
            <button
              onClick={handleDescargar}
              disabled={generating || loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#7B1FA2] bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 disabled:opacity-50"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              {generating ? 'Descargando...' : 'Descargar PDF'}
            </button>
            <button
              onClick={handleImprimir}
              disabled={!previewUrl || loading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] disabled:opacity-50"
            >
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