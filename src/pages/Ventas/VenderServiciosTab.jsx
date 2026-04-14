import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import logoUrl from '/logo-text-short.png';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  UserIcon,
  UserGroupIcon,
  UserPlusIcon,
  XMarkIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline';
import {
  crearVentaServicio,
  TIPOS_DESCUENTO,
  TIPOS_VENTA_SERVICIO,
  TIPOS_PAGADOR,
  TIPOS_ITEM_VENTA,
  getCompradoresExternos,
  crearCompradorExterno,
  getTiposComprobante,
} from '../../services/ventasService';
import { getDocumentosTarifa } from '../../services/documentoTarifaService';
import { calcularPromociones, registrarPromocionAplicada } from '../../services/promocionesService';
import { obtenerModalidadesPago } from '../../services/solicitudInformeService';
import { getTarifasServicios, getPaquetes } from '../../services/serviciosService';
import { getPaquetesCombo } from '../../services/inventarioService';
import {
  getPacientes,
  getTodosLosResponsables,
  getPacientesPorResponsable,
} from '../../services/pacienteService';
import ModalExito from '../../components/Ventas/ModalExito';
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

const TIPO_VENTA_SERVICIO_ID = 2;

// ─── Autocomplete ─────────────────────────────────────────────────────────────
const SearchableCombobox = ({
  items = [], value, onChange, placeholder = 'Buscar...',
  getItemLabel, getItemValue, getItemSearchText,
  disabled = false, className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const wrapperRef = useRef(null);
  const safeItems = Array.isArray(items) ? items : [];

  useEffect(() => {
    const handle = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        if (!value) setInputValue('');
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [value]);

  useEffect(() => {
    if (value && safeItems.length > 0) {
      const found = safeItems.find(item => getItemValue(item) === value);
      if (found) setInputValue(getItemLabel(found));
    } else if (!value) {
      setInputValue('');
    }
  }, [value, safeItems]);

  const filteredItems = inputValue.trim()
    ? safeItems.filter(item => getItemSearchText(item).toLowerCase().includes(inputValue.toLowerCase()))
    : safeItems;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input type="text" value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setIsOpen(true); if (!e.target.value) onChange(''); }}
          onFocus={() => setIsOpen(true)} placeholder={placeholder} disabled={disabled}
          className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
        />
      </div>
      {isOpen && !disabled && filteredItems.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {filteredItems.map((item, i) => {
            const itemValue = getItemValue(item);
            const isSelected = itemValue === value;
            return (
              <button key={itemValue ?? i} type="button"
                onClick={() => { onChange(getItemValue(item)); setInputValue(getItemLabel(item)); setIsOpen(false); }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 ${isSelected ? 'bg-purple-50' : ''}`}>
                <span className={`text-sm block ${isSelected ? 'text-[#7B1FA2] font-semibold' : 'text-gray-900'}`}>{getItemLabel(item)}</span>
              </button>
            );
          })}
        </div>
      )}
      {isOpen && !disabled && inputValue && filteredItems.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-8 text-center">
          <p className="text-sm text-gray-400">No se encontraron resultados</p>
        </div>
      )}
    </div>
  );
};

// ─── Panel de Promociones ─────────────────────────────────────────────────────
const PanelPromociones = ({ promocionesAplicadas, totalDescuento, calculando }) => {
  if (calculando) {
    return (
      <div className="p-3 bg-pink-50 border border-pink-200 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-pink-600">
          <SparklesIcon className="w-4 h-4 animate-pulse" />
          <span>Buscando promociones...</span>
        </div>
      </div>
    );
  }
  if (!promocionesAplicadas || promocionesAplicadas.length === 0) return null;
  return (
    <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
      <div className="flex items-center gap-2">
        <SparklesIcon className="w-4 h-4 text-green-600" />
        <span className="text-sm font-semibold text-green-700">
          {promocionesAplicadas.length} promoción{promocionesAplicadas.length > 1 ? 'es' : ''} aplicada{promocionesAplicadas.length > 1 ? 's' : ''}
        </span>
      </div>
      {promocionesAplicadas.map((p, i) => (
        <div key={i} className="flex items-center justify-between text-xs text-green-700">
          <span>✓ {p.mensaje || p.promocion?.nombre}</span>
          <span className="font-semibold">-S/ {p.descuento.toFixed(2)}</span>
        </div>
      ))}
      <div className="flex items-center justify-between text-sm font-bold text-green-800 border-t border-green-300 pt-2">
        <span>Ahorro total por promociones</span>
        <span>-S/ {totalDescuento.toFixed(2)}</span>
      </div>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getServicioNombre = (d) => d?.servicio_tarifa?.servicio?.nombre || '-';
const getMotivoCita = (d) => d?.servicio_tarifa?.motivo_cita?.nombre || '';

const getInfoBeneficio = (promoAplicada) => {
  const reglas = promoAplicada.promocion?.reglas || [];
  const reglaRegalo = reglas.find((r) => r.beneficio_tipo_id === 4);
  const reglaItemGratis = reglas.find((r) => r.beneficio_tipo_id === 3);
  if (reglaRegalo) return { esProductoGratis: true, esItemGratis: false, nombreProducto: reglaRegalo.beneficio_producto?.nombre || 'Producto de regalo' };
  if (reglaItemGratis) return { esProductoGratis: false, esItemGratis: true, nombreProducto: null };
  return { esProductoGratis: false, esItemGratis: false, nombreProducto: null };
};

const buildDetalleRows = (detalles, tipo, fm) => {
  const toFloat = (v) => parseFloat(v || 0);

  if (tipo !== 'servicio') {
    return (detalles || []).map((d) => ({
      desc: d.producto?.nombre || '-',
      cantidad: toFloat(d.cantidad).toFixed(2),
      precio: fm(toFloat(d.precio_unitario)),
      subtotal: fm(toFloat(d.subtotal)),
      paciente: null
    }));
  }

  // 🔵 AGRUPAR COMBOS
  const combos = {};
  const normales = [];

  (detalles || []).forEach(d => {
    if (d.paquete_combo_id || d.paqueteComboId) {
      const comboId = d.paquete_combo_id || d.paqueteComboId;
      if (!combos[comboId]) {
        // Obtener el nombre del combo
        const nombreCombo = d.paqueteCombo?.nombre ||
                           d.descripcionLinea?.split(' - ')[0] ||
                           d.descripcion_linea?.split(' - ')[0] ||
                           'Paquete Combo';

        combos[comboId] = {
          nombre: nombreCombo,
          subtotal: 0,  // Se calculará sumando los items
          detalles: [],
        };
      }
      // Sumar el subtotal de cada ítem para obtener el precio histórico
      combos[comboId].subtotal += Number(d.subtotal || 0);
      combos[comboId].detalles.push(d);
    } else {
      normales.push(d);
    }
  });

  const rows = [];

  // 🔷 COMBOS
  Object.values(combos).forEach(c => {
    c.detalles.forEach((d, index) => {
      const esPrimerItem = index === 0;

      // Detectar si es documento
      const esDocumento = d.tipoItemVenta === 2 || d.tipo_item_venta === 2 || d.documentoTarifaId || d.documento_tarifa_id;

      let servicioNombre = '';
      let motivoNombre = '';

      if (esDocumento) {
        servicioNombre = d.documento_tarifa?.nombre ||
                        d.descripcionLinea?.split(' - ').pop() ||
                        d.descripcion_linea?.split(' - ').pop() ||
                        'Documento';
      } else {
        servicioNombre = d.servicio_tarifa?.servicio?.nombre ||
                        d.descripcionLinea?.split(' - ')[1]?.split(' [')[0] ||
                        d.descripcion_linea?.split(' - ')[1]?.split(' [')[0] ||
                        'Servicio';
        motivoNombre = d.servicio_tarifa?.motivo_cita?.nombre || '';
      }

      // Formato: "Nombre del Combo - Servicio [Motivo]"
      const descripcionCompleta = motivoNombre
        ? `${c.nombre} - ${servicioNombre} [${motivoNombre}]`
        : `${c.nombre} - ${servicioNombre}`;

      const paciente = d.paciente
        ? `${d.paciente.nombres || ''} ${d.paciente.apellido_paterno || ''} ${d.paciente.apellido_materno || ''}`.trim()
        : null;

      rows.push({
        desc: descripcionCompleta,
        cantidad: (d.sesiones_totales || 1).toFixed(2),
        precio: esPrimerItem ? fm(c.subtotal) : null,
        subtotal: esPrimerItem ? fm(c.subtotal) : null,
        paciente,
        esCombo: true,
        esPrimerItemCombo: esPrimerItem,
        nombreCombo: c.nombre,
      });
    });
  });

  // 🔷 ITEMS NORMALES
  normales.forEach(d => {
    if (d.descripcionLinea || d.descripcion_linea) {
      rows.push({
        desc: d.descripcionLinea || d.descripcion_linea,
        cantidad: (d.sesiones_totales || 1).toFixed(2),
        precio: fm(toFloat(d.precio_unitario)),
        subtotal: fm(toFloat(d.subtotal)),
        paciente: d.paciente ? `${d.paciente.nombres || ''} ${d.paciente.apellido_paterno || ''} ${d.paciente.apellido_materno || ''}`.trim() : null,
      });
      return;
    }

    const esPaquete = d.tipo_venta?.nombre?.toLowerCase().includes('paquete');
    const motivoCita = getMotivoCita(d);
    const srvNombre = getServicioNombre(d);
    let desc, cantidad;

    if (esPaquete && d.paquete) {
      const spp = d.paquete.cantidad_sesiones || d.paquete.sesiones || d.paquete.numero_sesiones || 1;
      cantidad = Math.round((d.sesiones_totales || 0) / spp).toFixed(2);
      const base = srvNombre !== '-' ? `${d.paquete.nombre} (${spp} SES.) - ${srvNombre}` : `${d.paquete.nombre} (${spp} SES.)`;
      desc = motivoCita ? `${base} [${motivoCita}]` : base;
    } else {
      cantidad = (d.sesiones_totales || 0).toFixed(2);
      desc = motivoCita ? `${srvNombre} [${motivoCita}]` : srvNombre;
    }

    const precioUnitario = toFloat(d.precio_unitario);
    const subtotal = precioUnitario * (d.sesiones_totales || 1) - toFloat(d.descuento_monto);
    const paciente = d.paciente ? `${d.paciente.nombres || ''} ${d.paciente.apellido_paterno || ''} ${d.paciente.apellido_materno || ''}`.trim() : null;

    rows.push({ desc, cantidad, precio: fm(precioUnitario), subtotal: fm(subtotal), paciente });
  });

  return rows;
};

// ─── TicketPreviewHTML ────────────────────────────────────────────────────────
const TicketPreviewHTML = React.forwardRef(({ venta, tipo }, ref) => {
  const promociones = venta.promociones_aplicadas || [];
  const toFloat = (v) => parseFloat(v || 0);
  const total = toFloat(venta.total);
  const descuento = toFloat(venta.descuento_monto);
  const fm = (v) => formatMoney(toFloat(v));
  const totalPromos = promociones.reduce((s, p) => {
    const { esProductoGratis, esItemGratis } = getInfoBeneficio(p);
    return (esProductoGratis || esItemGratis) ? s : s + parseFloat(p.monto_ahorrado || 0);
  }, 0);
  const nombreCliente = getNombreComprador(venta);
  const dni = getDniComprador(venta);
  const rows = buildDetalleRows(venta.detalles, tipo, formatMoney);
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
  const s = {
    wrap: { fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Arial,sans-serif', fontSize: '12px', lineHeight: '1.4', color: '#111', background: '#fff', width: '270px', margin: '0 auto', padding: '12px 10px', boxShadow: '0 2px 16px rgba(0,0,0,0.13)', borderRadius: '4px', fontWeight: '500' },
    center: { textAlign: 'center', display: 'block' },
    bold: { fontWeight: '600' },
    hr: { border: 'none', borderTop: '1px dashed #aaa', margin: '6px 0' },
    hrSolid: { border: 'none', borderTop: '1px solid #ccc', margin: '6px 0' },
    row: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' },
  };
  const tipoComprobante = (venta.tipo_comprobante?.nombre || '').toUpperCase();
  const requiereIGV = tipoComprobante.includes('BOLETA') || tipoComprobante.includes('FACTURA');
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
      <div style={{ ...s.center, ...s.bold, fontSize: '11px', color: '#7B1FA2' }}>{(venta.tipo_comprobante?.nombre || 'TICKET DE VENTA').toUpperCase()}</div>
      <div style={{ ...s.center, ...s.bold, fontSize: '14px', color: '#7B1FA2', letterSpacing: '1px', margin: '3px 0' }}>{venta.codigo_comprobante || '#00000'}</div>
      <hr style={s.hrSolid} />
      <div style={{ marginBottom: '6px' }}>
        {[['Fecha emisión', fechaEmision], ['Comprador', nombreCliente], ['DNI', dni], ['Dirección', '-']].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', gap: '3px', marginBottom: '2px', fontSize: '9px' }}>
            <span style={{ ...s.bold, minWidth: '70px', flexShrink: 0 }}>{label}:</span>
            <span style={{ wordBreak: 'break-word' }}>{value}</span>
          </div>
        ))}
      </div>
      <hr style={s.hr} />
     
{/* Header columnas */}
<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: '600', borderBottom: '1px dashed #aaa', paddingBottom: '2px', marginBottom: '3px' }}>
  <span style={{ width: '25px' }}>Cant.</span>
  <span style={{ flex: 1, paddingLeft: '3px' }}>Descripción</span>
  <span style={{ width: '42px', textAlign: 'right' }}>P.Unit</span>
  <span style={{ width: '42px', textAlign: 'right' }}>Total</span>
</div>
      {(() => {
        // Renderizar los rows agrupando los combos
        const elementos = [];
        let i = 0;

        while (i < rows.length) {
          const r = rows[i];

          // Si es un combo, agrupar todos sus ítems
          if (r.esCombo && r.esPrimerItemCombo) {
            const comboRows = [];
            const nombreCombo = r.nombreCombo;
            let j = i;

            // Recolectar todos los ítems del mismo combo
            while (j < rows.length && rows[j].esCombo && rows[j].nombreCombo === nombreCombo) {
              comboRows.push(rows[j]);
              j++;
            }

            // Renderizar el combo agrupado
          // POR ESTE (minimalista, igual al doc 11):
elementos.push(
  <div key={`combo-${i}`} style={{ marginBottom: '4px', borderBottom: '1px dotted #ddd', paddingBottom: '3px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
      <span style={{ fontWeight: '600' }}>{r.nombreCombo}</span>
      <span style={{ fontWeight: '600' }}>S/ {r.subtotal}</span>
    </div>
    {comboRows.map((cr, idx) => {
      const partes = cr.desc.split(' - ');
      const servicioDesc = partes.slice(1).join(' - ') || partes[0];
      return (
        <div key={idx} style={{ paddingLeft: '8px', fontSize: '9px', color: '#444', marginBottom: '1px' }}>
          <div>• {cr.cantidad} NIU — {servicioDesc}</div>
          {tipo === 'servicio' && cr.paciente && cr.paciente !== '-' && (
            <div style={{ color: '#7B1FA2' }}>Paciente: {cr.paciente}</div>
          )}
        </div>
      );
    })}
  </div>
);

            i = j;
          } else if (!r.esCombo) {
            // Item normal (no es parte de un combo)
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
            // Saltar ítems de combo que no son el primero (ya fueron procesados)
            i++;
          }
        }

        return elementos;
      })()}
      <hr style={s.hr} />
      {descuento > 0 && <div style={{ ...s.row, color: '#b45309' }}><span>DESCUENTOS(-)</span><span>S/ {fm(descuento)}</span></div>}
      {promociones.length > 0 && (
        <div style={{ borderTop: '1px dashed #bbf7d0', marginTop: '3px', paddingTop: '3px' }}>
          <div style={{ fontSize: '9px', fontWeight: '700', color: '#15803d', marginBottom: '2px' }}>✦ PROMOCIONES APLICADAS</div>
          {promociones.map((p, i) => {
            const { esProductoGratis, esItemGratis, nombreProducto } = getInfoBeneficio(p);
            return (
              <div key={i} style={{ marginBottom: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#16a34a' }}>
                  <span style={{ flex: 1, paddingRight: '4px' }}>• {p.promocion?.nombre || `Promo #${p.promocion_id}`}</span>
                  {!esProductoGratis && !esItemGratis && <span style={{ fontWeight: '700', flexShrink: 0 }}>-S/ {fm(p.monto_ahorrado)}</span>}
                </div>
                {esProductoGratis && <div style={{ fontSize: '8px', color: '#15803d', paddingLeft: '8px' }}>🎁 Incluye gratis: <strong>{nombreProducto}</strong></div>}
                {esItemGratis && <div style={{ fontSize: '8px', color: '#15803d', paddingLeft: '8px' }}>🎁 El ítem más barato va <strong>gratis</strong></div>}
              </div>
            );
          })}
          {totalPromos > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '10px', color: '#15803d', background: '#f0fdf4', borderRadius: '2px', padding: '2px 3px', margin: '2px 0 4px' }}>
              <span>AHORRO TOTAL PROMOCIONES</span><span>-S/ {fm(totalPromos)}</span>
            </div>
          )}
        </div>
      )}
      {requiereIGV && (
        <>
          <div style={s.row}><span>BASE IMPONIBLE</span><span>S/ {fm(total / 1.18)}</span></div>
          <div style={s.row}><span>IGV (18%)</span><span>S/ {fm(total - total / 1.18)}</span></div>
        </>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', ...s.bold, fontSize: '13px', color: '#7B1FA2', margin: '4px 0 3px' }}>
        <span>TOTAL</span><span>S/ {fm(total)}</span>
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

// ─── Modal Vista Previa ───────────────────────────────────────────────────────
const FORMATOS_IMPRESION = [
  { id: 'a4', label: 'A4', desc: 'Carta / Oficio', Icon: DocumentTextIcon },
  { id: 'ticket', label: 'Ticket 72mm', desc: 'Impresora térmica', Icon: ReceiptPercentIcon },
];

const PrintPreviewModal = ({ venta, tipo, onClose }) => {
  const [formato, setFormato] = useState('a4');
  const [a4Url, setA4Url] = useState(null);
  const [loadingA4, setLoadingA4] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef(null);

  useEffect(() => {
    if (formato !== 'a4') return;
    let cancelled = false;
    setLoadingA4(true);
    setA4Url(null);
    obtenerPreviewURL(venta, tipo, 'a4')
      .then(url => { if (!cancelled) setA4Url(url); })
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
      const toFloat = (v) => parseFloat(v || 0);
      const total = toFloat(venta.total);
      const fm = (n) => toFloat(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      const nombreCliente = getNombreComprador(venta);
      const dni = getDniComprador(venta);
      const fechaStr = String(venta.fecha_venta || '');
      const [datePart, timePart] = fechaStr.split('T');
      const [y, m, d] = datePart.split('-').map(Number);
      const fechaEmision = timePart
        ? new Date(y, m - 1, d, ...timePart.split(':').map(Number)).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : new Date(y, m - 1, d).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const tipoNombre = (venta.tipo_comprobante?.nombre || 'TICKET DE VENTA').toUpperCase();
      const requiereIGV = tipoNombre.includes('BOLETA') || tipoNombre.includes('FACTURA');
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.4;color:#111;width:72mm;padding:10px 8px;font-weight:500}@media print{@page{size:72mm auto;margin:0}body{width:72mm}}.center{text-align:center}.bold{font-weight:700}.purple{color:#7B1FA2}hr.d{border:none;border-top:1px dashed #aaa;margin:6px 0}hr.s{border:none;border-top:1px solid #ccc;margin:6px 0}.row{display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px}.item{margin-bottom:4px;border-bottom:1px dotted #ddd;padding-bottom:3px}</style></head><body>
<div class="center" style="margin-bottom:6px"><img src="${window.location.origin}/logo-text-short.png" style="width:130px;height:auto;display:block;margin:0 auto"></div>
<div class="center" style="font-size:10px;line-height:1.4"><div class="bold" style="font-size:12px">CONTIGO CRECEMOS E.I.R.L.</div><div>Centro de terapias Crecemos</div><div>LT. 5 MZ. W1 URB. EL PINAR PARCELA H</div><div>LIMA LIMA COMAS — Telf.: 957 064 401</div><div>info@crecemos.com.pe</div><div class="bold" style="margin-top:2px">R.U.C. N° 20601074380</div></div>
<hr class="s"><div class="center bold purple" style="font-size:11px">${tipoNombre}</div>
<div class="center bold purple" style="font-size:14px;letter-spacing:1px;margin:3px 0">${venta.codigo_comprobante || '#00000'}</div><hr class="s">
<div style="margin-bottom:6px;font-size:10px">
  <div style="display:flex;gap:3px;margin-bottom:2px"><span class="bold" style="min-width:75px">Fecha emisión:</span><span>${fechaEmision}</span></div>
  <div style="display:flex;gap:3px;margin-bottom:2px"><span class="bold" style="min-width:75px">Comprador:</span><span>${nombreCliente}</span></div>
  <div style="display:flex;gap:3px;margin-bottom:2px"><span class="bold" style="min-width:75px">DNI:</span><span>${dni}</span></div>
</div><hr class="d">

<div style="display:flex;justify-content:space-between;font-size:9px;font-weight:600;border-bottom:1px dashed #aaa;padding-bottom:2px;margin-bottom:3px">
  <span style="width:25px">Cant.</span>
  <span style="flex:1;padding-left:3px">Descripción</span>
  <span style="width:42px;text-align:right">P.Unit</span>
  <span style="width:42px;text-align:right">Total</span>
</div>


${(() => {
  const rows = buildDetalleRows(venta.detalles, tipo, fm);
  let html = '';
  let i = 0;

  while (i < rows.length) {
    const r = rows[i];

    if (r.esCombo && r.esPrimerItemCombo) {
      // Recolectar ítems del combo
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
})()}
<hr class="d">
${requiereIGV ? `<div class="row"><span>BASE IMPONIBLE</span><span>S/ ${fm(total / 1.18)}</span></div><div class="row"><span>IGV (18%)</span><span>S/ ${fm(total - total / 1.18)}</span></div>` : ''}
<div style="display:flex;justify-content:space-between;font-weight:bold;font-size:13px;color:#7B1FA2;margin:4px 0 3px"><span>TOTAL</span><span>S/ ${fm(total)}</span></div>
<hr class="s"><div class="center bold purple" style="margin-top:4px;font-size:10px">¡Gracias por su preferencia!</div>
<script>window.onload=function(){window.focus();window.print();}<\/script></body></html>`;
      ventana.document.write(html);
      ventana.document.close();
    } else {
      try {
        setDownloading(true);
        const doc = await generarPDFA4(venta, tipo);
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
            {venta.codigo_comprobante && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">{venta.codigo_comprobante}</span>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Formato:</span>
          {FORMATOS_IMPRESION.map(({ id, label, desc, Icon }) => (
            <button key={id} onClick={() => setFormato(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${formato === id ? 'border-[#7B1FA2] bg-purple-50 text-[#7B1FA2]' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'}`}>
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
              {a4Url && !loadingA4 && <iframe src={a4Url} className="w-full border-0" style={{ height: '100%', minHeight: '500px' }} title="Vista previa A4" />}
              {!a4Url && !loadingA4 && <div className="absolute inset-0 flex items-center justify-center"><p className="text-sm text-gray-400">No se pudo generar la vista previa</p></div>}
            </>
          )}
          {formato === 'ticket' && (
            <div className="py-8 px-4 flex justify-center">
              <TicketPreviewHTML ref={ticketRef} venta={venta} tipo={tipo} />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <p className="text-xs text-gray-400">{formato === 'ticket' ? 'Descarga o imprime el ticket térmico de 72mm' : 'Descarga o imprime en formato A4 (210 × 297 mm)'}</p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cerrar</button>
            <button onClick={handleDescargar} disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#7B1FA2] bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 disabled:opacity-50">
              <ArrowDownTrayIcon className="w-4 h-4" />{downloading ? 'Generando...' : 'Descargar PDF'}
            </button>
            <button onClick={handleImprimir} disabled={downloading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] disabled:opacity-50">
              <PrinterIcon className="w-5 h-5" />{downloading ? 'Generando...' : 'Imprimir'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const VenderServiciosTab = ({
  modoEdicion = false,
  ventaExistente = null,
  onGuardarEdicion = null,
  onCancelarEdicion = null,
}) => {
  const [tarifas, setTarifas] = useState([]);
  const [documentosTarifa, setDocumentosTarifa] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [paquetesCombo, setPaquetesCombo] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [responsables, setResponsables] = useState([]);
  const [compradoresExternos, setCompradoresExternos] = useState([]);
  const [tiposComprobante, setTiposComprobante] = useState([]);

  const [lineas, setLineas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [descuentoGlobal, setDescuentoGlobal] = useState({ tipo: '%', valor: '' });
  const [nota, setNota] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [tipoPagador, setTipoPagador] = useState(TIPOS_PAGADOR.PACIENTE);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState('');
  const [responsableSeleccionado, setResponsableSeleccionado] = useState('');
  const [compradorExternoSeleccionado, setCompradorExternoSeleccionado] = useState('');
  const [tipoComprobante, setTipoComprobante] = useState(1);

  const [mostrarModalTipoVenta, setMostrarModalTipoVenta] = useState(false);
  const [tarifaSeleccionada, setTarifaSeleccionada] = useState(null);
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState('');

  const [promocionesAplicadas, setPromocionesAplicadas] = useState([]);
  const [totalDescuentoPromo, setTotalDescuentoPromo] = useState(0);
  const [calculandoPromos, setCalculandoPromos] = useState(false);
  const timerPromo = useRef(null);

  const [loading, setLoading] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [mostrarModalExterno, setMostrarModalExterno] = useState(false);
  const [formExterno, setFormExterno] = useState({ dni: '', nombre: '', telefono: '', email: '' });
  const [pacientesDelResponsable, setPacientesDelResponsable] = useState([]);

  const [mostrarModalExito, setMostrarModalExito] = useState(false);
  const [ventaGuardada, setVentaGuardada] = useState(null);
  const [mostrarModalImpresion, setMostrarModalImpresion] = useState(false);
  const [modalidadesPago, setModalidadesPago] = useState([]);
  const [modalidadPagoId, setModalidadPagoId] = useState(null);

  const searchRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const conIgv = tipoComprobante === 2 || tipoComprobante === 3;

  useEffect(() => { cargarDatos(); }, []);

  useEffect(() => {
    if (tipoPagador === TIPOS_PAGADOR.RESPONSABLE && responsableSeleccionado) {
      cargarPacientesDelResponsable();
    }
  }, [responsableSeleccionado]);

  useEffect(() => {
    if (lineas.length === 0) {
      setPromocionesAplicadas([]);
      setTotalDescuentoPromo(0);
      return;
    }
    clearTimeout(timerPromo.current);
    timerPromo.current = setTimeout(() => recalcularPromociones(), 600);
    return () => clearTimeout(timerPromo.current);
  }, [lineas]);

  const cargarDatos = async () => {
    setLoadingDatos(true);
    try {
      const tarifasData = await getTarifasServicios();
      let docData = [];
      try {
        docData = await getDocumentosTarifa();
      } catch (docError) {
        console.error('Error al cargar documentos de tarifa:', docError);
      }

      const [pacData, respData, compData, tiposComp, modalidades] = await Promise.all([
        getPacientes(),
        getTodosLosResponsables(),
        getCompradoresExternos(),
        getTiposComprobante(),
        obtenerModalidadesPago(),
      ]);

      setTarifas(Array.isArray(tarifasData) ? tarifasData.filter(t => t.flg_activo || t.activo) : []);

      const docsActivos = Array.isArray(docData) ? docData.filter(d =>
        d.flgActivo === 1 || d.flg_activo === 1 || d.flgActivo === '1' || d.flg_activo === '1'
      ) : [];
      setDocumentosTarifa(docsActivos);

      const pacientesArr = Array.isArray(pacData) ? pacData : [];
      const responsablesArr = respData?.data && Array.isArray(respData.data) ? respData.data : [];

      setPacientes(pacientesArr);
      setResponsables(responsablesArr);
      setCompradoresExternos(Array.isArray(compData) ? compData : []);
      setTiposComprobante(Array.isArray(tiposComp) ? tiposComp : []);
      setModalidadesPago(Array.isArray(modalidades) ? modalidades : []);

      try {
        const paquetesData = await getPaquetes();
        setPaquetes(Array.isArray(paquetesData) ? paquetesData.filter(p => p.flgActivo) : []);
      } catch { setPaquetes([]); }

      try {
        const combosData = await getPaquetesCombo(false);
        setPaquetesCombo(Array.isArray(combosData) ? combosData.filter(c => c.flgActivo || c.activo) : []);
      } catch { setPaquetesCombo([]); }

      if (modoEdicion && ventaExistente) {
        precargarVentaExistente(pacientesArr, responsablesArr);
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoadingDatos(false);
    }
  };

  const cargarPacientesDelResponsable = async () => {
    try {
      const resp = await getPacientesPorResponsable(responsableSeleccionado);
      const pacientesResp = resp?.data && Array.isArray(resp.data) ? resp.data : [];
      setPacientesDelResponsable(pacientesResp);
      if (pacientesResp.length === 1) {
        setLineas(prev => prev.map(l => !l.paciente_linea_id ? { ...l, paciente_linea_id: pacientesResp[0].id } : l));
      }
    } catch { setPacientesDelResponsable([]); }
  };

  const precargarVentaExistente = (pacientesData = [], responsablesData = []) => {
    if (!ventaExistente) return;

    setTipoPagador(ventaExistente.tipo_pagador_id || TIPOS_PAGADOR.PACIENTE);
    if (ventaExistente.paciente_id) setPacienteSeleccionado(ventaExistente.paciente_id);
    if (ventaExistente.responsable_id) setResponsableSeleccionado(ventaExistente.responsable_id);
    if (ventaExistente.comprador_externo_id) setCompradorExternoSeleccionado(ventaExistente.comprador_externo_id);
    if (ventaExistente.tipo_comprobante_id) setTipoComprobante(ventaExistente.tipo_comprobante_id);
    if (ventaExistente.modalidad_pago_id) setModalidadPagoId(ventaExistente.modalidad_pago_id);
    setNota(ventaExistente.nota || '');
    setObservaciones(ventaExistente.observaciones || '');
    if (ventaExistente.descuento_tipo_id && ventaExistente.descuento_valor) {
      setDescuentoGlobal({ tipo: ventaExistente.descuento_tipo_id === 1 ? '%' : 'S/', valor: ventaExistente.descuento_valor || '' });
    }

    if (ventaExistente.detalles && ventaExistente.detalles.length > 0) {
      const lineasPrecargadas = ventaExistente.detalles.map((d, index) => {
        const tipoItem = d.tipoItemVenta || d.tipo_item_venta || 1;
        const esDocumento = tipoItem === 2;
        return {
          id: `edit-${index}`,
          paciente_linea_id: d.paciente_id || d.paciente?.id,
          tipo_item_venta: tipoItem,
          tipo_venta_servicio_id: d.tipo_venta_id || d.tipo_venta?.id || 1,
          servicio_tarifa_id: !esDocumento ? (d.servicio_tarifa_id || d.servicio_tarifa?.id) : null,
          paquete_id: d.paquete_id || d.paquete?.id || null,
          servicio_nombre: d.servicio_tarifa?.servicio?.nombre || d.descripcionLinea || d.descripcion_linea || '—',
          motivo_nombre: d.servicio_tarifa?.motivo_cita?.nombre || '',
          paquete_nombre: d.paquete?.nombre || '',
          descripcion_linea: d.descripcionLinea || d.descripcion_linea || null,
          documento_tarifa_id: esDocumento ? (d.documentoTarifaId || d.documento_tarifa_id) : null,
          documento_nombre: esDocumento ? (d.descripcionLinea || d.descripcion_linea || d.documento?.nombre) : null,
          sesiones_por_paquete: d.paquete?.cantidad_sesiones || d.paquete?.cantidadSesiones || null,
          sesiones: d.sesiones_totales || 1,
          precio_unitario: parseFloat(d.precio_unitario || 0),
          precio_base: parseFloat(d.precio_unitario || 0),
          descuento_tipo: d.descuento_tipo_id ? (d.descuento_tipo_id === 1 ? '%' : 'S/') : '',
          descuento_valor: d.descuento_valor || '',
          paciente_obj: d.paciente,
          tarifa_obj: d.servicio_tarifa,
          paquete_obj: d.paquete,
          // Si viene con paquete_combo_id del backend, preservarlo
          paquete_combo_id: d.paquete_combo_id || null,
          _combo_nombre: d.paquete_combo_id ? (d.descripcionLinea || d.descripcion_linea || '').split(' - ')[0] : null,
          _combo_precio_total: 0,
          _combo_id: d.paquete_combo_id || null,
        };
      });
      setLineas(lineasPrecargadas);
    }
  };

  const recalcularPromociones = async () => {
    if (lineas.length === 0) return;
    setCalculandoPromos(true);
    try {
      const items = lineas.map(l => {
        const sesionesTotales = l.sesiones || 1;
        const subtotalBruto = sesionesTotales * l.precio_unitario;
        let descuento = 0;
        if (l.descuento_tipo && l.descuento_valor) {
          descuento = l.descuento_tipo === '%'
            ? subtotalBruto * (parseFloat(l.descuento_valor) / 100)
            : parseFloat(l.descuento_valor);
        }
        return { servicio_id: l.servicio_id, paquete_id: l.paquete_id || undefined, motivo_cita_id: l.motivo_cita_id || undefined, cantidad: sesionesTotales, precio_unitario: l.precio_unitario, subtotal: subtotalBruto - descuento };
      });
      const resultado = await calcularPromociones({ items });
      setPromocionesAplicadas(resultado.promociones_aplicadas || []);
      setTotalDescuentoPromo(resultado.total_descuento || 0);
    } catch (err) {
      console.warn('No se pudieron calcular promociones:', err);
      setPromocionesAplicadas([]);
      setTotalDescuentoPromo(0);
    } finally { setCalculandoPromos(false); }
  };

  const itemsFiltrados = busqueda ? [
    ...tarifas.filter(t => {
      const q = busqueda.toLowerCase();
      return (t.servicio?.nombre || '').toLowerCase().includes(q) || (t.motivo_cita?.nombre || '').toLowerCase().includes(q);
    }).map(t => ({ ...t, _tipo: TIPOS_ITEM_VENTA.SERVICIO })),
    ...documentosTarifa.filter(d => {
      const q = busqueda.toLowerCase();
      return (d.nombre || '').toLowerCase().includes(q) || (d.descripcion || '').toLowerCase().includes(q);
    }).map(d => ({ ...d, _tipo: TIPOS_ITEM_VENTA.DOCUMENTO })),
    ...paquetesCombo.filter(c => {
      const q = busqueda.toLowerCase();
      return (c.nombre || '').toLowerCase().includes(q) || (c.descripcion || '').toLowerCase().includes(q);
    }).map(c => ({ ...c, _tipo: 'COMBO' })),
  ] : [];

  const seleccionarTarifa = (tarifa) => {
    setTarifaSeleccionada(tarifa);
    setPaqueteSeleccionado('');
    setMostrarModalTipoVenta(true);
    setMostrarResultados(false);
  };

  const seleccionarDocumento = (documento) => {
    let pacienteLineaId = pacienteSeleccionado;
    if (tipoPagador === TIPOS_PAGADOR.RESPONSABLE && pacientesDelResponsable.length === 1) {
      pacienteLineaId = pacientesDelResponsable[0].id;
    }
    setLineas(prev => [...prev, {
      id: Date.now(),
      tipo_item_venta: TIPOS_ITEM_VENTA.DOCUMENTO,
      tipo_venta_servicio_id: TIPOS_VENTA_SERVICIO.SESION,
      documento_tarifa_id: documento.id,
      documento_nombre: documento.nombre,
      descripcion_linea: documento.nombre,
      sesiones: 1,
      precio_unitario: parseFloat(documento.precio || 0),
      precio_base: parseFloat(documento.precio || 0),
      descuento_tipo: '',
      descuento_valor: '',
      paciente_linea_id: pacienteLineaId,
      paquete_combo_id: null,
      _combo_precio_total: 0,
      _combo_id: null,
    }]);
    setBusqueda('');
    setMostrarResultados(false);
  };

  // ─── FIX PRINCIPAL: seleccionarCombo ─────────────────────────────────────
  // Los ítems se muestran individualmente (para enviar IDs al backend),
  // pero precio_unitario = 0 en todos. El precio total del combo se guarda
  // en _combo_precio_total y se suma UNA SOLA VEZ en calcularTotales.
  const seleccionarCombo = (combo) => {
    let pacienteLineaId = pacienteSeleccionado;
    if (tipoPagador === TIPOS_PAGADOR.RESPONSABLE && pacientesDelResponsable.length === 1) {
      pacienteLineaId = pacientesDelResponsable[0].id;
    }

    if (!combo.items || combo.items.length === 0) {
      alert('Este combo no tiene items configurados');
      return;
    }

    const precioTotalCombo = parseFloat(combo.precioTotal || combo.precio_total || 0);
    const nuevasLineas = [];
    const timestamp = Date.now();

    combo.items.forEach((item, index) => {
      const cantidad = item.cantidad || 1;

      if (item.servicioTarifaId || item.servicio_tarifa_id) {
        const tarifaId = item.servicioTarifaId || item.servicio_tarifa_id;
        const tarifa = tarifas.find(t => t.id === tarifaId);

        if (tarifa) {
          const servicioNombre = tarifa.servicio?.nombre || `Servicio #${tarifaId}`;
          const motivoNombre = tarifa.motivo_cita?.nombre || '';
          const descripcion = `${combo.nombre} - ${servicioNombre}${motivoNombre ? ` [${motivoNombre}]` : ''}`;

          nuevasLineas.push({
            id: timestamp + index,
            tipo_item_venta: TIPOS_ITEM_VENTA.SERVICIO,
            tipo_venta_servicio_id: TIPOS_VENTA_SERVICIO.SESION,
            servicio_tarifa_id: tarifaId,
            servicio_id: tarifa.servicio_id,
            motivo_cita_id: tarifa.motivo_cita_id || null,
            servicio_nombre: servicioNombre,
            motivo_nombre: motivoNombre,
            descripcion_linea: descripcion,
            sesiones: cantidad,
            precio_unitario: 0,         // siempre 0 en ítems de combo
            precio_base: parseFloat(tarifa.precio || 0),
            descuento_tipo: '',
            descuento_valor: '',
            paciente_linea_id: pacienteLineaId,
            paquete_combo_id: combo.id,
            _combo_nombre: combo.nombre,
            _combo_precio_total: precioTotalCombo, // precio total del combo completo
            _combo_id: combo.id,
          });
        }
      } else if (item.documentoTarifaId || item.documento_tarifa_id) {
        const docId = item.documentoTarifaId || item.documento_tarifa_id;
        const doc = documentosTarifa.find(d => d.id === docId);

        if (doc) {
          const descripcion = `${combo.nombre} - ${doc.nombre}`;

          nuevasLineas.push({
            id: timestamp + index,
            tipo_item_venta: TIPOS_ITEM_VENTA.DOCUMENTO,
            tipo_venta_servicio_id: TIPOS_VENTA_SERVICIO.SESION,
            documento_tarifa_id: docId,
            documento_nombre: doc.nombre,
            descripcion_linea: descripcion,
            sesiones: cantidad,
            precio_unitario: 0,         // siempre 0 en ítems de combo
            precio_base: parseFloat(doc.precio || 0),
            descuento_tipo: '',
            descuento_valor: '',
            paciente_linea_id: pacienteLineaId,
            paquete_combo_id: combo.id,
            _combo_nombre: combo.nombre,
            _combo_precio_total: precioTotalCombo, // precio total del combo completo
            _combo_id: combo.id,
          });
        }
      }
    });

    if (nuevasLineas.length === 0) {
      alert('No se pudo agregar ningún item del combo');
      return;
    }

    setLineas(prev => [...prev, ...nuevasLineas]);
    setBusqueda('');
    setMostrarResultados(false);
  };

  const agregarItemConTipo = (tipoVentaId) => {
    if (!tarifaSeleccionada) return;
    if (tipoVentaId === TIPOS_VENTA_SERVICIO.PAQUETE && !paqueteSeleccionado) { alert('Debes seleccionar un paquete'); return; }

    let paqueteId = null, paqueteNombre = '', sesionesPorPaquete = null, sesiones = null;
    if (tipoVentaId === TIPOS_VENTA_SERVICIO.PAQUETE) {
      const paq = paquetes.find(p => p.id === parseInt(paqueteSeleccionado));
      if (paq) { sesionesPorPaquete = paq.cantidadSesiones; sesiones = paq.cantidadSesiones; paqueteId = paq.id; paqueteNombre = paq.nombre; }
    } else { sesiones = 1; }

    let pacienteLineaId = pacienteSeleccionado;
    if (tipoPagador === TIPOS_PAGADOR.RESPONSABLE && pacientesDelResponsable.length === 1) {
      pacienteLineaId = pacientesDelResponsable[0].id;
    }

    let precioUnitario = parseFloat(tarifaSeleccionada.precio || 0);
    let precioBase = precioUnitario;
    if (tipoVentaId === TIPOS_VENTA_SERVICIO.PAQUETE && paqueteId) {
      const config = (tarifaSeleccionada.precios_paquetes || []).find(pp => pp.paquete_id === paqueteId && pp.flg_activo === 1);
      if (config) {
        if (config.tipo_calculo === 'precio_total') precioUnitario = parseFloat(config.valor) / sesionesPorPaquete;
        else if (config.tipo_calculo === 'descuento_porcentaje') precioUnitario = precioBase * (1 - parseFloat(config.valor) / 100);
      }
    }

    const motivoNombre = tarifaSeleccionada.motivo_cita?.nombre || '';
    const servicioNombre = tarifaSeleccionada.servicio?.nombre || `Servicio #${tarifaSeleccionada.servicio_id}`;
    const descripcionLinea = paqueteNombre
      ? `${paqueteNombre} (${sesionesPorPaquete} SES.) - ${servicioNombre}${motivoNombre ? ` [${motivoNombre}]` : ''}`
      : `${sesiones} ${sesiones === 1 ? 'Sesión' : 'Sesiones'} de ${motivoNombre ? motivoNombre + ' - ' : ''}${servicioNombre}`;

    setLineas(prev => [...prev, {
      id: Date.now(),
      tipo_item_venta: TIPOS_ITEM_VENTA.SERVICIO,
      tipo_venta_servicio_id: tipoVentaId,
      servicio_tarifa_id: tarifaSeleccionada.id,
      servicio_id: tarifaSeleccionada.servicio_id,
      motivo_cita_id: tarifaSeleccionada.motivo_cita_id || null,
      paquete_id: paqueteId,
      servicio_nombre: servicioNombre,
      motivo_nombre: motivoNombre,
      paquete_nombre: paqueteNombre,
      descripcion_linea: descripcionLinea,
      sesiones_por_paquete: sesionesPorPaquete,
      sesiones,
      precio_unitario: precioUnitario,
      precio_base: precioBase,
      descuento_tipo: '',
      descuento_valor: '',
      paciente_linea_id: pacienteLineaId,
      paquete_combo_id: null,
      _combo_precio_total: 0,
      _combo_id: null,
    }]);

    setBusqueda('');
    setMostrarModalTipoVenta(false);
    setTarifaSeleccionada(null);
    setPaqueteSeleccionado('');
  };

  const setSesiones = (id, val) => setLineas(prev => prev.map(l => {
    if (l.id !== id) return l;
    const minimo = l.tipo_venta_servicio_id === TIPOS_VENTA_SERVICIO.PAQUETE ? l.sesiones_por_paquete : 1;
    return { ...l, sesiones: Math.max(minimo, val) };
  }));
  const setDescuentoLinea = (id, tipo, valor) => setLineas(prev => prev.map(l => l.id === id ? { ...l, descuento_tipo: tipo, descuento_valor: valor } : l));
  const setPacienteLinea = (id, pacId) => setLineas(prev => prev.map(l => l.id === id ? { ...l, paciente_linea_id: pacId } : l));
  const eliminarLinea = (id) => setLineas(prev => prev.filter(l => l.id !== id));

  // ─── calcularLinea: ítems de combo devuelven 0 (el precio se suma aparte) ──
  const calcularLinea = (linea) => {
    if (linea.paquete_combo_id) {
      return { subtotalBruto: 0, descuento: 0, totalLinea: 0, igv: 0, base: 0, sesionesTotales: linea.sesiones };
    }
    const sesionesTotales = linea.sesiones;
    const subtotalBruto = sesionesTotales * linea.precio_unitario;
    let descuento = 0;
    if (linea.descuento_tipo && linea.descuento_valor) {
      descuento = linea.descuento_tipo === '%'
        ? subtotalBruto * (parseFloat(linea.descuento_valor) / 100)
        : parseFloat(linea.descuento_valor);
    }
    const totalLinea = subtotalBruto - descuento;
    const igv = conIgv ? totalLinea - totalLinea / 1.18 : 0;
    const base = conIgv ? totalLinea / 1.18 : totalLinea;
    return { subtotalBruto, descuento, totalLinea, igv, base, sesionesTotales };
  };

  // ─── calcularTotales: precio de combo se suma UNA SOLA VEZ por combo_id ───
  const calcularTotales = () => {
    let subtotalBruto = 0, descuentosLineas = 0;

    // Sumar ítems normales (no combo)
    lineas.forEach(l => {
      if (!l.paquete_combo_id) {
        const c = calcularLinea(l);
        subtotalBruto += c.subtotalBruto;
        descuentosLineas += c.descuento;
      }
    });

    // Sumar precio total de cada combo UNA SOLA VEZ (por _combo_id único)
    const combosVistos = new Set();
    lineas.forEach(l => {
      if (l.paquete_combo_id && !combosVistos.has(l.paquete_combo_id)) {
        combosVistos.add(l.paquete_combo_id);
        subtotalBruto += parseFloat(l._combo_precio_total || 0);
      }
    });

    const subtotalDespuesDesc = subtotalBruto - descuentosLineas;
    let descuentoGlobalMonto = 0;
    if (descuentoGlobal.tipo && descuentoGlobal.valor) {
      descuentoGlobalMonto = descuentoGlobal.tipo === '%'
        ? subtotalDespuesDesc * (parseFloat(descuentoGlobal.valor) / 100)
        : parseFloat(descuentoGlobal.valor);
    }
    const totalConDesc = subtotalDespuesDesc - descuentoGlobalMonto - totalDescuentoPromo;
    const igvTotal = conIgv ? totalConDesc - totalConDesc / 1.18 : 0;
    const baseTotal = conIgv ? totalConDesc / 1.18 : totalConDesc;
    return { subtotalBruto, descuentosLineas, descuentoGlobalMonto, base: baseTotal, igv: igvTotal, total: Math.max(0, totalConDesc) };
  };

  const resetForm = () => {
    setLineas([]);
    setPacienteSeleccionado('');
    setResponsableSeleccionado('');
    setPacientesDelResponsable([]);
    setCompradorExternoSeleccionado('');
    setDescuentoGlobal({ tipo: '%', valor: '' });
    setNota('');
    setObservaciones('');
    setTipoComprobante(1);
    setPromocionesAplicadas([]);
    setTotalDescuentoPromo(0);
    setModalidadPagoId(null);
  };

  const handleCrearExterno = async (e) => {
    e.preventDefault();
    try {
      const nuevoExterno = await crearCompradorExterno({ ...formExterno, user_crea_id: user?.id });
      setCompradoresExternos(prev => [...prev, nuevoExterno]);
      setCompradorExternoSeleccionado(nuevoExterno.id);
      setMostrarModalExterno(false);
      setFormExterno({ dni: '', nombre: '', telefono: '', email: '' });
    } catch (err) { alert(err?.response?.data?.message || 'Error al crear comprador externo'); }
  };

  const handleSubmit = async () => {
    setError('');
    setExito('');
    if (lineas.length === 0) return setError('Agrega al menos un servicio');
    if (tipoPagador === TIPOS_PAGADOR.PACIENTE && !pacienteSeleccionado) return setError('Selecciona un paciente');
    if (tipoPagador === TIPOS_PAGADOR.RESPONSABLE && !responsableSeleccionado) return setError('Selecciona un responsable');
    if (tipoPagador === TIPOS_PAGADOR.EXTERNO && !compradorExternoSeleccionado) return setError('Selecciona o crea un comprador externo');
    if (lineas.find(l => !l.paciente_linea_id)) return setError('Todas las líneas deben tener un paciente asignado');
    if (!modalidadPagoId && !modoEdicion) return setError('Selecciona una modalidad de pago');

    setLoading(true);
    try {
      const hoy = new Date();
      const fecha_venta = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

      const payload = {
        tipo_pagador_id: tipoPagador,
        tipo_comprobante_id: tipoComprobante,
        fecha_venta,
        detalles: lineas.map(l => {
          const sesionesTotales = l.sesiones || 1;
          const tipoItem = l.tipo_item_venta || TIPOS_ITEM_VENTA.SERVICIO;
          const det = {
            tipo_item_venta: tipoItem,
            tipo_venta_id: l.tipo_venta_servicio_id,
            paciente_id: parseInt(l.paciente_linea_id),
            sesiones_totales: sesionesTotales,
           precio_unitario: (() => {
              let valor = l.precio_unitario;

              if (l.paquete_combo_id) {
                // Solo el primer ítem del combo lleva el precio total
                // Los demás ítems llevan precio 0 para evitar errores de redondeo
                const lineasDelCombo = lineas.filter(x => x.paquete_combo_id === l.paquete_combo_id);
                const esPrimerItem = lineasDelCombo[0]?.id === l.id;

                if (esPrimerItem) {
                  valor = Number(l._combo_precio_total); // Precio total del combo
                } else {
                  valor = 0; // Resto de ítems con precio 0
                }
              }

              const numero = Number(valor);

              return Number.isFinite(numero) ? numero : 0;
            })(),// siempre 0 para ítems de combo
          };
          if (tipoItem === TIPOS_ITEM_VENTA.SERVICIO) {
            det.servicio_tarifa_id = parseInt(l.servicio_tarifa_id);
            if (l.tipo_venta_servicio_id === TIPOS_VENTA_SERVICIO.PAQUETE && l.paquete_id) det.paquete_id = parseInt(l.paquete_id);
          }
         if (tipoItem === TIPOS_ITEM_VENTA.DOCUMENTO) {
          det.documento_tarifa_id = parseInt(l.documento_tarifa_id);

          // 🔥 ESTO ES LO QUE TE FALTA
          det.descripcion_linea =
            l.descripcion_linea ||
            l.documento_tarifa_nombre ||
            l.nombre ||
            'Documento';
        }
          if (l.paquete_combo_id) det.paquete_combo_id = parseInt(l.paquete_combo_id);
          if (l.descripcion_linea) det.descripcion_linea = l.descripcion_linea;
          if (l.descuento_tipo && l.descuento_valor) {
            det.descuento_tipo_id = l.descuento_tipo === '%' ? TIPOS_DESCUENTO.PORCENTAJE : TIPOS_DESCUENTO.MONTO_FIJO;
            det.descuento_valor = parseFloat(l.descuento_valor);
          }
          if (isNaN(det.precio_unitario)) det.precio_unitario = 0;
          if (isNaN(det.sesiones_totales) || det.sesiones_totales < 1) det.sesiones_totales = 1;
          if (det.paciente_id && isNaN(det.paciente_id)) delete det.paciente_id;
  

          return det;
        }),
      };

      if (user?.id) payload.user_crea_id = parseInt(user.id);
      if (tipoPagador === TIPOS_PAGADOR.PACIENTE) payload.paciente_id = parseInt(pacienteSeleccionado);
      if (tipoPagador === TIPOS_PAGADOR.RESPONSABLE) payload.responsable_id = parseInt(responsableSeleccionado);
      if (tipoPagador === TIPOS_PAGADOR.EXTERNO) payload.comprador_externo_id = parseInt(compradorExternoSeleccionado);
      if (descuentoGlobal.tipo && descuentoGlobal.valor) {
        payload.descuento_tipo_id = descuentoGlobal.tipo === '%' ? TIPOS_DESCUENTO.PORCENTAJE : TIPOS_DESCUENTO.MONTO_FIJO;
        payload.descuento_valor = parseFloat(descuentoGlobal.valor);
      }
      if (nota) payload.nota = nota;
      if (observaciones) payload.observaciones = observaciones;
      if (modalidadPagoId) payload.modalidad_pago_id = modalidadPagoId;
      if (totalDescuentoPromo > 0) payload.descuento_promocion = parseFloat(totalDescuentoPromo.toFixed(2));

      if (modoEdicion && onGuardarEdicion) {
        onGuardarEdicion(payload);
        return;
      }
      

      const venta = await crearVentaServicio(payload);

      if (venta?.id && promocionesAplicadas.length > 0) {
        await Promise.allSettled(
          promocionesAplicadas.map(p =>
            registrarPromocionAplicada({
              promocion_id: p.promocion.id,
              tipo_venta_id: TIPO_VENTA_SERVICIO_ID,
              venta_id: venta.id,
              monto_ahorrado: p.descuento,
            })
          )
        );
      }

      setVentaGuardada(venta);
      setMostrarModalExito(true);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error al registrar la venta';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally { setLoading(false); }
  };

  const handleImprimirComprobante = () => {
    if (!ventaGuardada) { alert('No hay venta para imprimir'); return; }
    setMostrarModalImpresion(true);
  };

  const handleNuevaVenta = () => { resetForm(); setVentaGuardada(null); };
  const totales = calcularTotales();

  const OPCIONES_PAGADOR = [
    { id: TIPOS_PAGADOR.PACIENTE, nombre: 'Paciente', icon: UserIcon },
    { id: TIPOS_PAGADOR.RESPONSABLE, nombre: 'Responsable', icon: UserGroupIcon },
    { id: TIPOS_PAGADOR.EXTERNO, nombre: 'Comprador Externo', icon: UserPlusIcon },
  ].filter(tipo => tipo.id !== 3);

  const zIndexModalTipoVenta = modoEdicion ? 'z-[90]' : 'z-[80]';

  if (loadingDatos) {
    return (
      <div className={modoEdicion ? '' : 'min-h-screen bg-gray-50'}>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Cargando datos...</p>
        </div>
      </div>
    );
  }

  // ─── Helper: primer ítem de cada combo (para mostrar precio total ahí) ────
  const esPrimerItemDeCombo = (linea) => {
    if (!linea.paquete_combo_id) return false;
    const primerItem = lineas.find(l => l.paquete_combo_id === linea.paquete_combo_id);
    return primerItem?.id === linea.id;
  };

  return (
    <div className={modoEdicion ? '' : 'min-h-screen bg-gray-50'}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        {!modoEdicion && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1.5">
              <ClipboardDocumentListIcon className="w-8 h-8 text-[#7B1FA2]" />
              <h1 className="text-3xl font-bold text-gray-900">Venta de Servicios</h1>
            </div>
            <p className="text-sm text-gray-500">Registra ventas de sesiones individuales o paquetes</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {error && <div className="mx-6 mt-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          {exito && <div className="mx-6 mt-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{exito}</div>}

          {/* Comprobante */}
          <div className="p-6 border-b border-gray-100">
            <label className="block text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <DocumentTextIcon className="w-4 h-4" />Tipo de Comprobante
            </label>
            <div className="flex flex-wrap gap-3">
              {tiposComprobante.map(tc => (
                <button key={tc.id} type="button" onClick={() => setTipoComprobante(tc.id)}
                  disabled={!!ventaGuardada}
                  className={`px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${tipoComprobante === tc.id ? 'border-[#7B1FA2] bg-purple-50 text-[#7B1FA2]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {tc.nombre}
                </button>
              ))}
            </div>
            {conIgv && <p className="mt-2 text-xs text-amber-600 font-medium">⚠ Los precios ya incluyen IGV (18%). Se mostrará desglosado en el resumen.</p>}
          </div>

          {/* Pagador */}
          <div className="p-6 border-b border-gray-100">
            <label className="block text-xs font-semibold text-gray-600 mb-3">¿Quién paga?</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {OPCIONES_PAGADOR.map(tipo => {
                const Icon = tipo.icon;
                const activo = tipoPagador === tipo.id;
                return (
                  <button key={tipo.id} type="button" onClick={() => setTipoPagador(tipo.id)}
                    disabled={!!ventaGuardada}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${activo ? 'border-[#7B1FA2] bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activo ? 'bg-[#7B1FA2] text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`font-semibold text-sm ${activo ? 'text-[#7B1FA2]' : 'text-gray-700'}`}>{tipo.nombre}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tipoPagador === TIPOS_PAGADOR.PACIENTE && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Paciente (Pagador) *</label>
                  <SearchableCombobox items={pacientes} value={pacienteSeleccionado}
                    onChange={(value) => { setPacienteSeleccionado(value); setLineas(prev => prev.map(l => !l.paciente_linea_id ? { ...l, paciente_linea_id: value } : l)); }}
                    placeholder="Buscar por DNI o nombre..."
                    getItemLabel={(p) => `${p.nombres || ''} ${p.apellido_paterno || ''} ${p.apellido_materno || ''} - DNI: ${p.numero_documento || 'S/N'}`.trim()}
                    getItemValue={(p) => p.id}
                    getItemSearchText={(p) => `${p.numero_documento || ''} ${p.nombres || ''} ${p.apellido_paterno || ''} ${p.apellido_materno || ''}`.toLowerCase()}
                    disabled={!!ventaGuardada && !modoEdicion}
                  />
                </div>
              )}
              {tipoPagador === TIPOS_PAGADOR.RESPONSABLE && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Responsable (Pagador) *</label>
                  <SearchableCombobox items={responsables} value={responsableSeleccionado}
                    onChange={(value) => { setResponsableSeleccionado(value); setPacienteSeleccionado(''); setPacientesDelResponsable([]); }}
                    placeholder="Buscar responsable..."
                    getItemLabel={(r) => `${r.nombres || ''} ${r.apellido_paterno || ''} ${r.apellido_materno || ''} - DNI: ${r.numero_documento || 'S/N'}`.trim()}
                    getItemValue={(r) => r.id}
                    getItemSearchText={(r) => `${r.numero_documento || ''} ${r.nombres || ''} ${r.apellido_paterno || ''} ${r.apellido_materno || ''}`.toLowerCase()}
                    disabled={!!ventaGuardada && !modoEdicion}
                  />
                  {responsableSeleccionado && pacientesDelResponsable.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">ℹ️ Selecciona el paciente en cada línea ({pacientesDelResponsable.length} paciente(s) a cargo)</p>
                  )}
                </div>
              )}
              {tipoPagador === TIPOS_PAGADOR.EXTERNO && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Comprador Externo (Pagador) *</label>
                  <div className="flex gap-2">
                    <SearchableCombobox items={compradoresExternos} value={compradorExternoSeleccionado} onChange={setCompradorExternoSeleccionado}
                      placeholder="Buscar por DNI o nombre..."
                      getItemLabel={(c) => `${c.nombre} - DNI: ${c.dni}`}
                      getItemValue={(c) => c.id}
                      getItemSearchText={(c) => `${c.dni} ${c.nombre}`}
                      className="flex-1"
                      disabled={!!ventaGuardada && !modoEdicion}
                    />
                    <button type="button" onClick={() => setMostrarModalExterno(true)}
                      disabled={!!ventaGuardada}
                      className="px-4 py-3 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">+ Nuevo</button>
                  </div>
                </div>
              )}

              {/* Búsqueda */}
              <div className="relative" ref={searchRef}>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Buscar Servicio o Documento</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={busqueda}
                    onChange={(e) => { setBusqueda(e.target.value); setMostrarResultados(true); }}
                    onFocus={() => setMostrarResultados(true)}
                    disabled={!!ventaGuardada && !modoEdicion}
                    placeholder="Buscar servicio, documento o paquete combo..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                {mostrarResultados && busqueda && itemsFiltrados.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                    {itemsFiltrados.slice(0, 10).map((item, idx) => {
                      const esServicio = item._tipo === TIPOS_ITEM_VENTA.SERVICIO;
                      const esDocumento = item._tipo === TIPOS_ITEM_VENTA.DOCUMENTO;
                      const esCombo = item._tipo === 'COMBO';

                      let badgeClass = 'bg-blue-100 text-blue-700';
                      let badgeText = 'Servicio';
                      let handleClick = () => seleccionarTarifa(item);

                      if (esDocumento) {
                        badgeClass = 'bg-green-100 text-green-700';
                        badgeText = 'Documento';
                        handleClick = () => seleccionarDocumento(item);
                      } else if (esCombo) {
                        badgeClass = 'bg-purple-100 text-purple-700';
                        badgeText = 'Paquete Combo';
                        handleClick = () => seleccionarCombo(item);
                      }

                      return (
                        <button key={`${item._tipo}-${item.id}-${idx}`}
                          onClick={handleClick}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0">
                          <div className="flex items-start gap-2">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded whitespace-nowrap ${badgeClass}`}>
                              {badgeText}
                            </span>
                            <div className="flex-1">
                              {esServicio ? (
                                <>
                                  <div className="font-semibold text-gray-900">{item.servicio?.nombre || `Servicio #${item.servicio_id}`} - {item.motivo_cita?.nombre || `#${item.motivo_cita_id}`}</div>
                                  <div className="text-xs text-gray-500 mt-1">{item.servicio?.area?.nombre || 'Sin área'} | S/ {parseFloat(item.precio || 0).toFixed(2)}</div>
                                </>
                              ) : esDocumento ? (
                                <>
                                  <div className="font-semibold text-gray-900">{item.nombre}</div>
                                  <div className="text-xs text-gray-500 mt-1">{item.descripcion || 'Sin descripción'} | S/ {parseFloat(item.precio || 0).toFixed(2)}</div>
                                </>
                              ) : esCombo ? (
                                <>
                                  <div className="font-semibold text-gray-900">{item.nombre}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {item.descripcion || 'Paquete combo'} • {item.items?.length || 0} ítems |
                                    {item.precioTachado && (
                                      <span className="line-through text-gray-400 ml-1">S/ {parseFloat(item.precioTachado).toFixed(2)}</span>
                                    )}
                                    <span className="font-semibold text-purple-600 ml-1">S/ {parseFloat(item.precioTotal || item.precio_total || 0).toFixed(2)}</span>
                                  </div>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modalidad de Pago */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Modalidad de Pago <span className="text-red-500">*</span></label>
                <select
                  value={modalidadPagoId ?? ''}
                  onChange={(e) => setModalidadPagoId(e.target.value ? parseInt(e.target.value) : null)}
                  disabled={!!ventaGuardada}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] bg-white text-sm text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed">
                  <option value="">Seleccionar modalidad...</option>
                  {modalidadesPago.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de líneas */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-600 uppercase">Servicio</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase">Paciente</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 uppercase">Cantidad</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-600 uppercase">Precio U.</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-600 uppercase">Descuento</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-600 uppercase">{conIgv ? 'Base' : 'Subtotal'}</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-600 uppercase">{conIgv ? 'IGV (incl.)' : '—'}</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-gray-600 uppercase">Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lineas.map(linea => {
                  const calc = calcularLinea(linea);
                  const esCombo = !!linea.paquete_combo_id;
                  const esPrimeroDelCombo = esPrimerItemDeCombo(linea);

                  return (
                    <tr key={linea.id} className={`hover:bg-gray-50 ${esCombo ? 'bg-purple-50/30' : ''}`}>
                      {/* Columna Servicio */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {esCombo ? (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-100 text-purple-700">Combo</span>
                          ) : linea.tipo_item_venta === TIPOS_ITEM_VENTA.DOCUMENTO ? (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-green-100 text-green-700">Documento</span>
                          ) : (
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${linea.tipo_venta_servicio_id === TIPOS_VENTA_SERVICIO.PAQUETE ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {linea.tipo_venta_servicio_id === TIPOS_VENTA_SERVICIO.PAQUETE ? 'Paquete' : 'Sesión'}
                            </span>
                          )}
                        </div>

                        {linea.tipo_item_venta === TIPOS_ITEM_VENTA.DOCUMENTO ? (
                          <>
                            <div className="font-semibold text-gray-900">{linea.documento_nombre || linea.descripcion_linea}</div>
                            {esCombo && linea._combo_nombre && (
                              <div className="text-xs text-purple-600 font-semibold mt-0.5">→ {linea._combo_nombre}</div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="font-semibold text-gray-900">{linea.servicio_nombre}</div>
                            {!esCombo && <div className="text-xs text-gray-500">{linea.motivo_nombre}</div>}
                            {!esCombo && linea.tipo_venta_servicio_id === TIPOS_VENTA_SERVICIO.PAQUETE && linea.paquete_nombre && (
                              <div className="text-xs text-purple-600 font-semibold mt-1">{linea.paquete_nombre}</div>
                            )}
                            {esCombo && linea._combo_nombre && (
                              <div className="text-xs text-purple-600 font-semibold mt-0.5">→ {linea._combo_nombre}</div>
                            )}
                          </>
                        )}
                      </td>

                      {/* Columna Paciente */}
                      <td className="px-4 py-4 min-w-[200px]">
                        <SearchableCombobox
                          items={tipoPagador === TIPOS_PAGADOR.RESPONSABLE && pacientesDelResponsable.length > 0 ? pacientesDelResponsable : pacientes}
                          value={linea.paciente_linea_id}
                          onChange={(val) => setPacienteLinea(linea.id, val)}
                          placeholder="Buscar paciente..."
                          getItemLabel={(p) => `${p.nombres} ${p.apellido_paterno} ${p.apellido_materno || ''}`.trim()}
                          getItemValue={(p) => p.id}
                          getItemSearchText={(p) => `${p.numero_documento || ''} ${p.nombres} ${p.apellido_paterno}`.toLowerCase()}
                          disabled={!!ventaGuardada && !modoEdicion}
                        />
                      </td>

                      {/* Columna Cantidad */}
                      <td className="px-4 py-4">
                        {esCombo || linea.tipo_item_venta === TIPOS_ITEM_VENTA.DOCUMENTO ? (
                          <div className="text-center font-semibold text-gray-600">{linea.sesiones}</div>
                        ) : linea.tipo_venta_servicio_id === TIPOS_VENTA_SERVICIO.PAQUETE ? (
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => setSesiones(linea.id, linea.sesiones - 1)} disabled={!!ventaGuardada} className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"><MinusIcon className="w-4 h-4 text-gray-600" /></button>
                              <span className="w-12 text-center font-semibold">{linea.sesiones}</span>
                              <button onClick={() => setSesiones(linea.id, linea.sesiones + 1)} disabled={!!ventaGuardada} className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"><PlusIcon className="w-4 h-4 text-gray-600" /></button>
                            </div>
                            <div className="text-xs text-purple-600 mt-1">Paquete {linea.paquete_nombre} (mín. {linea.sesiones_por_paquete})</div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => setSesiones(linea.id, linea.sesiones - 1)} disabled={!!ventaGuardada} className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"><MinusIcon className="w-4 h-4 text-gray-600" /></button>
                            <span className="w-12 text-center font-semibold">{linea.sesiones}</span>
                            <button onClick={() => setSesiones(linea.id, linea.sesiones + 1)} disabled={!!ventaGuardada} className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"><PlusIcon className="w-4 h-4 text-gray-600" /></button>
                          </div>
                        )}
                      </td>

                      {/* Columna Precio U. — oculto en ítems de combo */}
                      <td className="px-4 py-4">
                        {esCombo ? (
                          <span className="text-xs text-gray-400 italic block text-right">— combo</span>
                        ) : (
                          <input type="number" step="0.01" min="0" value={linea.precio_unitario} readOnly
                            className="w-20 px-2 py-1 text-xs text-right border border-gray-200 rounded bg-gray-100 text-gray-600 cursor-not-allowed" />
                        )}
                      </td>

                      {/* Columna Descuento — deshabilitado en combo */}
                      <td className="px-4 py-4">
                        {esCombo ? (
                          <span className="text-xs text-gray-300 block text-right">—</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <select value={linea.descuento_tipo} onChange={(e) => setDescuentoLinea(linea.id, e.target.value, linea.descuento_valor)}
                              disabled={!!ventaGuardada}
                              className="px-2 py-1 text-xs border border-gray-200 rounded disabled:bg-gray-100 disabled:cursor-not-allowed">
                              <option value="">-</option><option value="%">%</option><option value="S/">S/</option>
                            </select>
                            <input type="number" step="0.01" min="0" value={linea.descuento_valor}
                              onChange={(e) => setDescuentoLinea(linea.id, linea.descuento_tipo, e.target.value)}
                              disabled={!!ventaGuardada}
                              className="w-16 px-2 py-1 text-xs text-right border border-gray-200 rounded disabled:bg-gray-100 disabled:cursor-not-allowed" placeholder="0" />
                          </div>
                        )}
                      </td>

                      {/* Columna Base/Subtotal */}
                      <td className="px-4 py-4 text-right text-sm text-gray-600">
                        {esCombo ? (
                          <span className="text-gray-300">—</span>
                        ) : (
                          `S/ ${calc.base.toFixed(2)}`
                        )}
                      </td>

                      {/* Columna IGV */}
                      <td className="px-4 py-4 text-right text-sm text-gray-500">
                        {esCombo ? (
                          <span className="text-gray-300">—</span>
                        ) : conIgv ? (
                          `S/ ${calc.igv.toFixed(2)}`
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Columna Total: solo en el primer ítem del combo muestra el precio total */}
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        {esCombo ? (
                          esPrimeroDelCombo ? (
                            <div className="text-right">
                              <div className="text-purple-700 font-bold text-sm">S/ {(linea._combo_precio_total || 0).toFixed(2)}</div>
                              <div className="text-xs text-purple-400 font-normal">precio combo</div>
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )
                        ) : (
                          `S/ ${calc.totalLinea.toFixed(2)}`
                        )}
                      </td>

                      {/* Columna Eliminar */}
                      <td className="px-4 py-4">
                        <button onClick={() => eliminarLinea(linea.id)} disabled={!!ventaGuardada} className="p-1 hover:bg-red-50 rounded text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"><TrashIcon className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })}
                {lineas.length === 0 && (
                  <tr><td colSpan="9" className="px-6 py-12 text-center text-gray-400">Busca y agrega tarifas para comenzar</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Resumen */}
          <div className="p-6 border-t border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Nota interna (solo visible en sistema)</label>
                <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={3}
                  disabled={!!ventaGuardada}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] disabled:bg-gray-100 disabled:cursor-not-allowed" placeholder="Notas internas..." />
                <label className="block text-xs font-semibold text-gray-600 mb-2 mt-4">Observaciones (visible en comprobante)</label>
                <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={3}
                  disabled={!!ventaGuardada}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] disabled:bg-gray-100 disabled:cursor-not-allowed" placeholder="Observaciones para el comprobante..." />
              </div>
              <div className="space-y-3">
                <PanelPromociones promocionesAplicadas={promocionesAplicadas} totalDescuento={totalDescuentoPromo} calculando={calculandoPromos} />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Descuento Global</span>
                  <div className="flex items-center gap-2">
                    <select value={descuentoGlobal.tipo} onChange={(e) => setDescuentoGlobal({ ...descuentoGlobal, tipo: e.target.value })}
                      disabled={!!ventaGuardada}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed">
                      <option value="%">%</option><option value="S/">S/</option>
                    </select>
                    <input type="number" step="0.01" min="0" value={descuentoGlobal.valor}
                      onChange={(e) => setDescuentoGlobal({ ...descuentoGlobal, valor: e.target.value })}
                      disabled={!!ventaGuardada}
                      className="w-24 px-3 py-2 text-sm text-right border border-gray-200 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed" placeholder="0" />
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{conIgv ? 'Base imponible' : 'Subtotal'}</span>
                    <span className="font-semibold">S/ {totales.base.toFixed(2)}</span>
                  </div>
                  {conIgv && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">IGV (18% incluido)</span>
                      <span className="font-semibold text-gray-500">S/ {totales.igv.toFixed(2)}</span>
                    </div>
                  )}
                  {totalDescuentoPromo > 0 && (
                    <div className="flex items-center justify-between text-sm text-green-700">
                      <span className="flex items-center gap-1"><SparklesIcon className="w-3.5 h-3.5" />Descuento promociones</span>
                      <span className="font-semibold">-S/ {totalDescuentoPromo.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-lg font-bold border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span className="text-[#7B1FA2]">S/ {totales.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            {ventaGuardada ? (
              <>
                <button onClick={handleNuevaVenta} className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2">
                  <PlusIcon className="w-4 h-4" />Nueva Venta
                </button>
                <button onClick={handleImprimirComprobante} className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" />Imprimir Comprobante
                </button>
              </>
            ) : (
              <>
                <button onClick={modoEdicion && onCancelarEdicion ? onCancelarEdicion : resetForm}
                  className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
                  Cancelar
                </button>
                <button onClick={handleSubmit} disabled={loading || lineas.length === 0}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (modoEdicion ? 'Actualizando...' : 'Guardando...') : (modoEdicion ? 'Actualizar Venta' : 'Guardar Venta')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal Tipo de Venta */}
      {mostrarModalTipoVenta && tarifaSeleccionada && createPortal(
        <div className={`fixed inset-0 ${zIndexModalTipoVenta} flex items-center justify-center bg-black/60 px-4`}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 text-sm">¿Cómo deseas agregar este servicio?</h2>
                <p className="text-xs text-gray-500">{tarifaSeleccionada.servicio?.nombre} - {tarifaSeleccionada.motivo_cita?.nombre}</p>
              </div>
              <span className="text-sm font-bold text-[#7B1FA2]">S/ {parseFloat(tarifaSeleccionada.precio || 0).toFixed(2)}/sesión</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {/* Sesión Individual */}
              <div className="border-2 border-gray-200 rounded-xl p-3 hover:border-blue-400 transition-all flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-blue-700">1</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Sesión Individual</div>
                    <div className="text-xs text-gray-500">Venta de 1 sesión</div>
                  </div>
                </div>
                <button onClick={() => agregarItemConTipo(TIPOS_VENTA_SERVICIO.SESION)}
                  className="w-full px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                  Agregar Sesión
                </button>
              </div>
              {/* Paquete */}
              <div className="border-2 border-gray-200 rounded-xl p-3 hover:border-purple-400 transition-all flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <span className="text-sm"></span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Paquete de Sesiones</div>
                    <div className="text-xs text-gray-500">Múltiples sesiones</div>
                  </div>
                </div>
                {paquetes.length === 0 ? (
                  <p className="text-xs text-yellow-700 font-semibold bg-yellow-50 border border-yellow-200 rounded-lg px-2 py-1 mb-2">⚠ No hay paquetes disponibles</p>
                ) : (
                  <div className="mb-2">
                    <select value={paqueteSeleccionado} onChange={(e) => setPaqueteSeleccionado(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]">
                      <option value="">Seleccionar paquete...</option>
                      {paquetes.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.cantidadSesiones} ses.)</option>)}
                    </select>
                    {paqueteSeleccionado && (() => {
                      const paq = paquetes.find(p => p.id === parseInt(paqueteSeleccionado));
                      const precioNormal = parseFloat(tarifaSeleccionada.precio || 0);
                      const sesiones = paq?.cantidadSesiones || 0;
                      const totalNormal = precioNormal * sesiones;
                      const config = (tarifaSeleccionada.precios_paquetes || []).find(pp => pp.paquete_id === parseInt(paqueteSeleccionado) && pp.flg_activo === 1);
                      let totalPaquete = totalNormal;
                      if (config) {
                        if (config.tipo_calculo === 'precio_total') totalPaquete = parseFloat(config.valor);
                        else if (config.tipo_calculo === 'descuento_porcentaje') totalPaquete = precioNormal * (1 - parseFloat(config.valor) / 100) * sesiones;
                      }
                      return (
                        <div className="mt-1.5 p-2 bg-purple-50 border border-purple-200 rounded-lg text-xs space-y-0.5">
                          <div className="text-gray-400 line-through">S/ {totalNormal.toFixed(2)} normal</div>
                          <div className="font-bold text-purple-700">Total: S/ {totalPaquete.toFixed(2)}</div>
                          {config && totalPaquete < totalNormal && <div className="text-green-700 font-semibold">¡Ahorras S/ {(totalNormal - totalPaquete).toFixed(2)}!</div>}
                        </div>
                      );
                    })()}
                  </div>
                )}
                <button onClick={() => agregarItemConTipo(TIPOS_VENTA_SERVICIO.PAQUETE)}
                  disabled={!paqueteSeleccionado || paquetes.length === 0}
                  className="w-full px-3 py-1.5 text-xs font-semibold text-white bg-[#7B1FA2] rounded-lg hover:bg-[#6A1B9A] disabled:opacity-50 disabled:cursor-not-allowed">
                  {paquetes.length === 0 ? 'Sin paquetes' : 'Agregar Paquete'}
                </button>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
              <button onClick={() => { setMostrarModalTipoVenta(false); setTarifaSeleccionada(null); setPaqueteSeleccionado(''); }}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
                Cancelar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Crear Comprador Externo */}
      {mostrarModalExterno && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Nuevo Comprador Externo</h2>
              <button onClick={() => setMostrarModalExterno(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleCrearExterno} className="p-6 space-y-4">
              {[
                { key: 'dni', label: 'DNI *', required: true, placeholder: '12345678', type: 'text' },
                { key: 'nombre', label: 'Nombre *', required: true, placeholder: 'Juan Pérez', type: 'text' },
                { key: 'telefono', label: 'Teléfono', required: false, placeholder: '999888777', type: 'text' },
                { key: 'email', label: 'Email', required: false, placeholder: 'email@ejemplo.com', type: 'email' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                  <input type={f.type} value={formExterno[f.key]}
                    onChange={(e) => setFormExterno(prev => ({ ...prev, [f.key]: e.target.value }))}
                    required={f.required} placeholder={f.placeholder}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" />
                </div>
              ))}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setMostrarModalExterno(false)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A]">Crear</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <ModalExito isOpen={mostrarModalExito} onClose={() => setMostrarModalExito(false)} mensaje="¡Venta Registrada!" />

      {mostrarModalImpresion && ventaGuardada && (
        <PrintPreviewModal venta={ventaGuardada} tipo="servicio" onClose={() => setMostrarModalImpresion(false)} />
      )}
    </div>
  );
};

export default VenderServiciosTab;