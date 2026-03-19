import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ML   = 10;
const MR   = 10;
const CW   = 190;
const LINE = 0.2;
const GRAY = [220, 220, 220];
const BLK  = [0, 0, 0];
const WHT  = [255, 255, 255];

const base = {
  fontSize: 8.5,
  textColor: BLK,
  lineWidth: LINE,
  lineColor: BLK,
  cellPadding: 2,
  overflow: 'linebreak',
};

const hdr = {
  ...base,
  fillColor: GRAY,
  fontStyle: 'bold',
  fontSize: 9,
};

// Si marcado: X. Si no marcado: nada.
const drawCheckInCell = (doc, cellX, cellY, cellW, cellH, checked) => {
  if (!checked) return;
  const size = 3.8;
  const x = cellX + (cellW - size) / 2;
  const y = cellY + (cellH - size) / 2;
  doc.setDrawColor(0);
  doc.setLineWidth(0.8);
  doc.line(x,        y,        x + size, y + size);
  doc.line(x + size, y,        x,        y + size);
};

export const generarPDFReclamo = async (reclamo) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = 8;

  // Variables para el logo
  const pageWidth = 210;
  const pageHeight = 297;
  const logoSize = 120;
  const logoX = (pageWidth - logoSize) / 2;
  const logoY = (pageHeight - logoSize) / 2;
  let logoBase64 = null;

  // Cargar imagen y convertir a base64
  try {
    console.log('🖼️ Intentando cargar logo desde /videologo.png...');
    const response = await fetch('/videologo.png');
    console.log('🖼️ Response status:', response.status);
    const blob = await response.blob();
    console.log('🖼️ Blob size:', blob.size);
    const reader = new FileReader();

    logoBase64 = await new Promise((resolve) => {
      reader.onloadend = () => {
        const base64data = reader.result;
        console.log('🖼️ Base64 data length:', base64data.length);
        resolve(base64data);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('❌ No se pudo cargar el logo:', error);
  }

  const tbl = (opts) => {
    doc.autoTable({
      theme: 'grid',
      margin: { left: ML, right: MR },
      styles: { ...base },
      ...opts,
      startY: y,
    });
    y = doc.lastAutoTable.finalY;
  };

  // ── HELPERS ───────────────────────────────────────────────
  const numEq = (val, target) => Number(val) === Number(target);

  const parsearApoderado = (raw) => {
    if (!raw) return '';
    if (typeof raw === 'object') raw = JSON.stringify(raw);
    try {
      const obj = JSON.parse(raw);
      const nombre   = obj.nombre   || obj.apoderado_nombre   || '';
      const dni      = obj.dni      || obj.apoderado_dni      || '';
      const relacion = obj.relacion || obj.apoderado_relacion || '';
      return [nombre, dni ? `DNI: ${dni}` : '', relacion ? `(${relacion})` : '']
        .filter(Boolean).join(' - ');
    } catch { return raw; }
  };

  // ── ENCABEZADO ─────────────────────────────────────────────
  tbl({
    body: [[
      { content: 'LIBRO DE RECLAMACIONES', styles: { ...hdr, halign: 'center', valign: 'middle', fontSize: 11, minCellHeight: 10 } },
      { content: 'HOJA DE RECLAMACION',    styles: { ...hdr, halign: 'center', valign: 'middle', fontSize: 11, minCellHeight: 10 } },
    ]],
    columnStyles: { 0: { cellWidth: 130 }, 1: { cellWidth: 60 } },
  });

  // ── FECHA / N° ─────────────────────────────────────────────
  tbl({
    body: [[
      { content: 'FECHA:', styles: { ...base, fontStyle: 'bold' } },
      { content: reclamo.fecha_registro ? new Date(reclamo.fecha_registro).toLocaleDateString('es-PE') : '', styles: base },
      { content: 'N',     styles: { ...base, fontStyle: 'bold', halign: 'center' } },
      { content: reclamo.codigo_reclamo || '-', styles: base },
    ]],
    columnStyles: { 0: { cellWidth: 18 }, 1: { cellWidth: 112 }, 2: { cellWidth: 15 }, 3: { cellWidth: 45 } },
  });

  // ── PROVEEDOR ──────────────────────────────────────────────
  tbl({
    body: [
      [{ content: 'PROVEEDOR:', styles: { ...base, fontStyle: 'bold' } }, { content: 'CONTIGO CRECEMOS E.I.R.L', styles: { ...base, fontStyle: 'bold' } }],
      [{ content: 'RUC:',       styles: { ...base, fontStyle: 'bold' } }, { content: '20601074380', styles: base }],
      [{ content: 'DOMICILIO:', styles: { ...base, fontStyle: 'bold' } }, { content: 'CALLE 48 NRO. 234 URBANIZACION EL PINAR, COMAS 15316 LIMA, PERU', styles: base }],
    ],
    columnStyles: { 0: { cellWidth: 26 }, 1: { cellWidth: 164 } },
  });

  // ── SECCION 1 ──────────────────────────────────────────────
  tbl({
    body: [[{ content: '1. IDENTIFICACION DEL CONSUMIDOR RECLAMANTE', styles: { ...hdr, halign: 'left' } }]],
    columnStyles: { 0: { cellWidth: CW } },
  });
  tbl({
    body: [[
      { content: 'NOMBRE:', styles: { ...base, fontStyle: 'bold' } },
      { content: `${reclamo.nombres || ''} ${reclamo.apellidos || ''}`.trim(), styles: base },
    ]],
    columnStyles: { 0: { cellWidth: 26 }, 1: { cellWidth: 164 } },
  });
  tbl({
    body: [[
      { content: 'DNI / CE:', styles: { ...base, fontStyle: 'bold' } },
      { content: [reclamo.tipo_documento, reclamo.numero_documento].filter(Boolean).join(' - '), styles: base },
    ]],
    columnStyles: { 0: { cellWidth: 26 }, 1: { cellWidth: 164 } },
  });
  tbl({
    body: [[
      { content: 'DOMICILIO:', styles: { ...base, fontStyle: 'bold' } },
      { content: reclamo.direccion || reclamo.domicilio || '', styles: base },
    ]],
    columnStyles: { 0: { cellWidth: 26 }, 1: { cellWidth: 164 } },
  });
  tbl({
    body: [[
      { content: 'TELEFONO',  styles: { ...base, fontStyle: 'bold' } },
      { content: reclamo.telefono || '', styles: base },
      { content: 'E-MAIL:', styles: { ...base, fontStyle: 'bold' } },
      { content: reclamo.email || '', styles: base },
    ]],
    columnStyles: { 0: { cellWidth: 26 }, 1: { cellWidth: 60 }, 2: { cellWidth: 20 }, 3: { cellWidth: 84 } },
  });
  const apoderado = reclamo.menor_edad ? parsearApoderado(reclamo.datos_apoderado) : '';
  tbl({
    body: [[
      { content: 'SI ES MENOR DE EDAD, NOMBRE DEL PADRE, MADRE O APODERADO:', styles: { ...base, fontStyle: 'bold' } },
      { content: apoderado, styles: base },
    ]],
    columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 80 } },
  });

  // ── SECCION 2 — checkboxes con didDrawCell ──────────────────
  tbl({
    body: [[{ content: '2. IDENTIFICACION DEL BIEN CONTRATADO', styles: { ...hdr, halign: 'left' } }]],
    columnStyles: { 0: { cellWidth: CW } },
  });

  const esProducto = reclamo.tipoBien?.nombre === 'Producto' || numEq(reclamo.tipo_bien_id, 1);
  const esServicio = reclamo.tipoBien?.nombre === 'Servicio' || numEq(reclamo.tipo_bien_id, 2);
  const monto = reclamo.monto_reclamado != null && reclamo.monto_reclamado !== ''
    ? `S/ ${parseFloat(reclamo.monto_reclamado).toFixed(2)}` : '';

  tbl({
    body: [
      [
        { content: 'PRODUCTO', styles: { ...base, fontStyle: 'bold' } },
        { content: '', styles: { ...base, minCellHeight: 8 } },          // col 1 → checkbox
        { content: 'MONTO RECLAMADO:', styles: { ...base, fontStyle: 'bold' } },
        { content: monto, styles: base },
      ],
      [
        { content: 'SERVICIO', styles: { ...base, fontStyle: 'bold' } },
        { content: '', styles: { ...base, minCellHeight: 8 } },          // col 1 → checkbox
        { content: 'DESCRIPCION:', styles: { ...base, fontStyle: 'bold' } },
        { content: reclamo.descripcion_bien || '', styles: base },
      ],
    ],
    columnStyles: { 0: { cellWidth: 26 }, 1: { cellWidth: 12 }, 2: { cellWidth: 40 }, 3: { cellWidth: 112 } },
    // didDrawCell da las coordenadas EXACTAS de cada celda → posicionamiento perfecto
    didDrawCell: (data) => {
      if (data.column.index === 1) {
        const checked = data.row.index === 0 ? esProducto : esServicio;
        drawCheckInCell(doc, data.cell.x, data.cell.y, data.cell.width, data.cell.height, checked);
      }
    },
  });

  // ── SECCION 3 — checkboxes con didDrawCell ──────────────────
  const esReclamo = reclamo.tipoSolicitud?.nombre === 'Reclamo' || numEq(reclamo.tipo_solicitud_id, 1);
  const esQueja   = reclamo.tipoSolicitud?.nombre === 'Queja'   || numEq(reclamo.tipo_solicitud_id, 2);

  // Dibujamos el header de sección 3 con los labels; los checkboxes van en col 2 y 4
  tbl({
    body: [[
      { content: '3. DETALLE DE LA RECLAMACION Y PEDIDO DEL CONSUMIDOR', styles: { ...hdr, halign: 'left', valign: 'middle' } },
      { content: 'RECLAMO', styles: { ...hdr, halign: 'center', valign: 'middle' } },
      { content: '', styles: { ...hdr, minCellHeight: 8 } },   // col 2 → checkbox reclamo
      { content: 'QUEJA',   styles: { ...hdr, halign: 'center', valign: 'middle' } },
      { content: '', styles: { ...hdr, minCellHeight: 8 } },   // col 4 → checkbox queja
    ]],
    columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 22 }, 2: { cellWidth: 12 }, 3: { cellWidth: 22 }, 4: { cellWidth: 24 } },
    didDrawCell: (data) => {
      if (data.column.index === 1 || data.column.index === 3) {
        // Dibujar superíndice ¹ o ² pegado al texto del label
        const sup = data.column.index === 1 ? '1' : '2';
        // Posición: esquina superior derecha de la celda
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5.5);
        doc.setTextColor(0, 0, 0);
        doc.text(sup, data.cell.x + data.cell.width - 1.5, data.cell.y + 2.5);
        // Restaurar
        doc.setFontSize(base.fontSize);
      }
      if (data.column.index === 2) {
        drawCheckInCell(doc, data.cell.x, data.cell.y, data.cell.width, data.cell.height, esReclamo);
      }
      if (data.column.index === 4) {
        drawCheckInCell(doc, data.cell.x, data.cell.y, data.cell.width, data.cell.height, esQueja);
      }
    },
  });

  // ── DETALLE ────────────────────────────────────────────────
  tbl({
    body: [[{ content: `DETALLE:\n\n${reclamo.detalle_reclamo || ''}`, styles: { ...base, valign: 'top' } }]],
    columnStyles: { 0: { cellWidth: CW, minCellHeight: 50 } },
  });
  tbl({
    body: [[
      { content: `PEDIDO:\n\n${reclamo.pedido_consumidor || ''}`, styles: { ...base, valign: 'top' } },
      { content: 'FIRMA DEL CONSUMIDOR', styles: { ...base, fontStyle: 'bold', fontSize: 7, halign: 'center', valign: 'bottom' } },
    ]],
    columnStyles: { 0: { cellWidth: 135, minCellHeight: 32 }, 1: { cellWidth: 55, minCellHeight: 32 } },
  });

  // ── SECCION 4 ──────────────────────────────────────────────
  tbl({
    body: [[{ content: '4. OBSERVACIONES Y ACCIONES ADOPTADAS POR EL PROVEEDOR', styles: { ...hdr, halign: 'left' } }]],
    columnStyles: { 0: { cellWidth: CW } },
  });
  const fechaResp = reclamo.fecha_respuesta
    ? new Date(reclamo.fecha_respuesta).toLocaleDateString('es-PE') : '';
  tbl({
    body: [[
      { content: 'FECHA DE COMUNICACION DE LA RESPUESTA:', styles: { ...base, fontStyle: 'bold' } },
      { content: fechaResp, styles: base },
    ]],
    columnStyles: { 0: { cellWidth: 95 }, 1: { cellWidth: 95 } },
  });
  tbl({
    body: [[
      { content: reclamo.respuesta_proveedor || '', styles: { ...base, valign: 'top' } },
      { content: 'FIRMA DEL PROVEEDOR', styles: { ...base, fontStyle: 'bold', fontSize: 7, halign: 'center', valign: 'bottom' } },
    ]],
    columnStyles: { 0: { cellWidth: 135, minCellHeight: 40 }, 1: { cellWidth: 55, minCellHeight: 40 } },
  });

  // ── NOTAS AL PIE — superíndices dibujados a mano ───────────
  tbl({
    body: [[
      { content: ' RECLAMO: Disconformidad relacionada a los productos o servicios.', styles: { ...base, fontSize: 6.5, cellPadding: 1.5 } },
      { content: ' QUEJA: Disconformidad no relacionada a los productos o servicios; o, malestar o descontento respecto a la atencion al publico.', styles: { ...base, fontSize: 6.5, cellPadding: 1.5 } },
    ]],
    tableLineWidth: 0,
    tableLineColor: WHT,
    columnStyles: { 0: { cellWidth: 95 }, 1: { cellWidth: 95 } },
    didDrawCell: (data) => {
      // Dibujar "1" o "2" pequeño al inicio de cada celda (simula superíndice)
      const sup = data.column.index === 0 ? '1' : '2';
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5);
      doc.setTextColor(0, 0, 0);
      doc.text(sup, data.cell.x + 1, data.cell.y + 2.8);
      doc.setFontSize(base.fontSize);
    },
  });

  // ── HOJA DE RECLAMACION VIRTUAL ────────────────────────────
  tbl({
    body: [[{ content: 'HOJA DE RECLAMACION VIRTUAL', styles: { ...hdr, halign: 'center', fontSize: 9 } }]],
    columnStyles: { 0: { cellWidth: CW } },
  });

  // ── TEXTOS LEGALES ─────────────────────────────────────────
  const lineH = 2.8;
  y += 2;
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(0, 0, 0);
  const t1 = doc.splitTextToSize('*La formulacion del reclamo no impide acudir a otras vias de solucion de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.', CW);
  const t2 = doc.splitTextToSize('* El proveedor debe dar respuesta al reclamo o queja en un plazo no mayor a quince (15) dias habiles, el cual es improrrogable.', CW);
  doc.text(t1, ML, y);
  doc.text(t2, ML, y + t1.length * lineH);

  // Agregar marca de agua en todas las páginas
  if (logoBase64) {
    const totalPages = doc.internal.getNumberOfPages();
    console.log('🖼️ Agregando marca de agua a', totalPages, 'páginas');

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.1 }));
      doc.addImage(logoBase64, 'PNG', logoX, logoY, logoSize, logoSize);
      doc.restoreGraphicsState();
    }
    console.log('✅ Marca de agua agregada a todas las páginas');
  }

  doc.save(`Reclamo_${reclamo.codigo_reclamo || 'N/A'}.pdf`);
};

/**
 * Genera el PDF como Blob para enviarlo al backend
 */
export const generarPDFReclamoBlob = async (reclamo) => {
  return new Promise(async (resolve) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let y = 8;

    // Variables para el logo
    const pageWidth = 210;
    const pageHeight = 297;
    const logoSize = 120;
    const logoX = (pageWidth - logoSize) / 2;
    const logoY = (pageHeight - logoSize) / 2;
    let logoBase64 = null;

    // Cargar imagen y convertir a base64
    try {
      const response = await fetch('/videologo.png');
      const blob = await response.blob();
      const reader = new FileReader();

      logoBase64 = await new Promise((resolveImg) => {
        reader.onloadend = () => {
          const base64data = reader.result;
          resolveImg(base64data);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('No se pudo cargar el logo:', error);
    }

    const tbl = (opts) => {
      doc.autoTable({
        theme: 'grid',
        margin: { left: ML, right: MR },
        styles: { ...base },
        ...opts,
        startY: y,
      });
      y = doc.lastAutoTable.finalY;
    };

    // ── HELPERS ───────────────────────────────────────────────
    const numEq = (val, target) => Number(val) === Number(target);

    const parsearApoderado = (raw) => {
      if (!raw) return '';
      if (typeof raw === 'object') raw = JSON.stringify(raw);
      try {
        const obj = JSON.parse(raw);
        const nombre   = obj.nombre   || obj.apoderado_nombre   || '';
        const dni      = obj.dni      || obj.apoderado_dni      || '';
        const relacion = obj.relacion || obj.apoderado_relacion || '';
        return [nombre, dni ? `DNI: ${dni}` : '', relacion ? `(${relacion})` : '']
          .filter(Boolean).join(' - ');
      } catch { return raw; }
    };

    // ── ENCABEZADO ─────────────────────────────────────────────
    tbl({
      body: [[
        { content: 'LIBRO DE RECLAMACIONES', styles: { ...hdr, halign: 'center', valign: 'middle', fontSize: 11, minCellHeight: 10 } },
        { content: 'HOJA DE RECLAMACION',    styles: { ...hdr, halign: 'center', valign: 'middle', fontSize: 11, minCellHeight: 10 } },
      ]],
      columnStyles: { 0: { cellWidth: 130 }, 1: { cellWidth: 60 } },
    });

    // ── FECHA / N° ─────────────────────────────────────────────
    tbl({
      body: [[
        { content: 'FECHA:', styles: { ...base, fontStyle: 'bold' } },
        { content: reclamo.fecha_registro ? new Date(reclamo.fecha_registro).toLocaleDateString('es-PE') : '', styles: base },
        { content: 'N',     styles: { ...base, fontStyle: 'bold', halign: 'center' } },
        { content: reclamo.codigo_reclamo || '-', styles: base },
      ]],
      columnStyles: { 0: { cellWidth: 18 }, 1: { cellWidth: 112 }, 2: { cellWidth: 15 }, 3: { cellWidth: 45 } },
    });

    // ── PROVEEDOR ──────────────────────────────────────────────
    tbl({
      body: [
        [{ content: 'PROVEEDOR:', styles: { ...base, fontStyle: 'bold' } }, { content: 'CONTIGO CRECEMOS E.I.R.L', styles: { ...base, fontStyle: 'bold' } }],
        [{ content: 'RUC:',       styles: { ...base, fontStyle: 'bold' } }, { content: '20601074380', styles: base }],
        [{ content: 'DOMICILIO:', styles: { ...base, fontStyle: 'bold' } }, { content: 'CALLE 48 NRO. 234 URBANIZACION EL PINAR, COMAS 15316 LIMA, PERU', styles: base }],
      ],
      columnStyles: { 0: { cellWidth: 26 }, 1: { cellWidth: 164 } },
    });

    // ── SECCION 1 ──────────────────────────────────────────────
    tbl({
      body: [[{ content: '1. IDENTIFICACION DEL CONSUMIDOR RECLAMANTE', styles: { ...hdr, halign: 'left' } }]],
      columnStyles: { 0: { cellWidth: CW } },
    });
    tbl({
      body: [[
        { content: 'NOMBRE:', styles: { ...base, fontStyle: 'bold' } },
        { content: `${reclamo.nombres || ''} ${reclamo.apellidos || ''}`.trim(), styles: base },
      ]],
      columnStyles: { 0: { cellWidth: 26 }, 1: { cellWidth: 164 } },
    });
    tbl({
      body: [[
        { content: 'DNI / CE:', styles: { ...base, fontStyle: 'bold' } },
        { content: [reclamo.tipo_documento, reclamo.numero_documento].filter(Boolean).join(' - '), styles: base },
      ]],
      columnStyles: { 0: { cellWidth: 26 }, 1: { cellWidth: 164 } },
    });
    tbl({
      body: [[
        { content: 'DOMICILIO:', styles: { ...base, fontStyle: 'bold' } },
        { content: reclamo.direccion || reclamo.domicilio || '', styles: base },
      ]],
      columnStyles: { 0: { cellWidth: 26 }, 1: { cellWidth: 164 } },
    });
    tbl({
      body: [[
        { content: 'TELEFONO',  styles: { ...base, fontStyle: 'bold' } },
        { content: reclamo.telefono || '', styles: base },
        { content: 'E-MAIL:', styles: { ...base, fontStyle: 'bold' } },
        { content: reclamo.email || '', styles: base },
      ]],
      columnStyles: { 0: { cellWidth: 26 }, 1: { cellWidth: 60 }, 2: { cellWidth: 20 }, 3: { cellWidth: 84 } },
    });
    const apoderado = reclamo.menor_edad ? parsearApoderado(reclamo.datos_apoderado) : '';
    tbl({
      body: [[
        { content: 'SI ES MENOR DE EDAD, NOMBRE DEL PADRE, MADRE O APODERADO:', styles: { ...base, fontStyle: 'bold' } },
        { content: apoderado, styles: base },
      ]],
      columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 80 } },
    });

    // ── SECCION 2 — checkboxes con didDrawCell ──────────────────
    tbl({
      body: [[{ content: '2. IDENTIFICACION DEL BIEN CONTRATADO', styles: { ...hdr, halign: 'left' } }]],
      columnStyles: { 0: { cellWidth: CW } },
    });

    const esProducto = reclamo.tipoBien?.nombre === 'Producto' || numEq(reclamo.tipo_bien_id, 1);
    const esServicio = reclamo.tipoBien?.nombre === 'Servicio' || numEq(reclamo.tipo_bien_id, 2);
    const monto = reclamo.monto_reclamado != null && reclamo.monto_reclamado !== ''
      ? `S/ ${parseFloat(reclamo.monto_reclamado).toFixed(2)}` : '';

    tbl({
      body: [
        [
          { content: 'PRODUCTO', styles: { ...base, fontStyle: 'bold' } },
          { content: '', styles: { ...base, minCellHeight: 8 } },
          { content: 'MONTO RECLAMADO:', styles: { ...base, fontStyle: 'bold' } },
          { content: monto, styles: base },
        ],
        [
          { content: 'SERVICIO', styles: { ...base, fontStyle: 'bold' } },
          { content: '', styles: { ...base, minCellHeight: 8 } },
          { content: 'DESCRIPCION:', styles: { ...base, fontStyle: 'bold' } },
          { content: reclamo.descripcion_bien || '', styles: base },
        ],
      ],
      columnStyles: { 0: { cellWidth: 26 }, 1: { cellWidth: 12 }, 2: { cellWidth: 40 }, 3: { cellWidth: 112 } },
      didDrawCell: (data) => {
        if (data.column.index === 1) {
          const checked = data.row.index === 0 ? esProducto : esServicio;
          drawCheckInCell(doc, data.cell.x, data.cell.y, data.cell.width, data.cell.height, checked);
        }
      },
    });

    // ── SECCION 3 — checkboxes con didDrawCell ──────────────────
    const esReclamo = reclamo.tipoSolicitud?.nombre === 'Reclamo' || numEq(reclamo.tipo_solicitud_id, 1);
    const esQueja   = reclamo.tipoSolicitud?.nombre === 'Queja'   || numEq(reclamo.tipo_solicitud_id, 2);

    tbl({
      body: [[
        { content: '3. DETALLE DE LA RECLAMACION Y PEDIDO DEL CONSUMIDOR', styles: { ...hdr, halign: 'left', valign: 'middle' } },
        { content: 'RECLAMO', styles: { ...hdr, halign: 'center', valign: 'middle' } },
        { content: '', styles: { ...hdr, minCellHeight: 8 } },
        { content: 'QUEJA',   styles: { ...hdr, halign: 'center', valign: 'middle' } },
        { content: '', styles: { ...hdr, minCellHeight: 8 } },
      ]],
      columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 22 }, 2: { cellWidth: 12 }, 3: { cellWidth: 22 }, 4: { cellWidth: 24 } },
      didDrawCell: (data) => {
        if (data.column.index === 1 || data.column.index === 3) {
          const sup = data.column.index === 1 ? '1' : '2';
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(5.5);
          doc.setTextColor(0, 0, 0);
          doc.text(sup, data.cell.x + data.cell.width - 1.5, data.cell.y + 2.5);
          doc.setFontSize(base.fontSize);
        }
        if (data.column.index === 2) {
          drawCheckInCell(doc, data.cell.x, data.cell.y, data.cell.width, data.cell.height, esReclamo);
        }
        if (data.column.index === 4) {
          drawCheckInCell(doc, data.cell.x, data.cell.y, data.cell.width, data.cell.height, esQueja);
        }
      },
    });

    // ── DETALLE ────────────────────────────────────────────────
    tbl({
      body: [[{ content: `DETALLE:\n\n${reclamo.detalle_reclamo || ''}`, styles: { ...base, valign: 'top' } }]],
      columnStyles: { 0: { cellWidth: CW, minCellHeight: 50 } },
    });
    tbl({
      body: [[
        { content: `PEDIDO:\n\n${reclamo.pedido_consumidor || ''}`, styles: { ...base, valign: 'top' } },
        { content: 'FIRMA DEL CONSUMIDOR', styles: { ...base, fontStyle: 'bold', fontSize: 7, halign: 'center', valign: 'bottom' } },
      ]],
      columnStyles: { 0: { cellWidth: 135, minCellHeight: 32 }, 1: { cellWidth: 55, minCellHeight: 32 } },
    });

    // ── SECCION 4 ──────────────────────────────────────────────
    tbl({
      body: [[{ content: '4. OBSERVACIONES Y ACCIONES ADOPTADAS POR EL PROVEEDOR', styles: { ...hdr, halign: 'left' } }]],
      columnStyles: { 0: { cellWidth: CW } },
    });
    const fechaResp = reclamo.fecha_respuesta
      ? new Date(reclamo.fecha_respuesta).toLocaleDateString('es-PE') : '';
    tbl({
      body: [[
        { content: 'FECHA DE COMUNICACION DE LA RESPUESTA:', styles: { ...base, fontStyle: 'bold' } },
        { content: fechaResp, styles: base },
      ]],
      columnStyles: { 0: { cellWidth: 95 }, 1: { cellWidth: 95 } },
    });
    tbl({
      body: [[
        { content: reclamo.respuesta_proveedor || '', styles: { ...base, valign: 'top' } },
        { content: 'FIRMA DEL PROVEEDOR', styles: { ...base, fontStyle: 'bold', fontSize: 7, halign: 'center', valign: 'bottom' } },
      ]],
      columnStyles: { 0: { cellWidth: 135, minCellHeight: 40 }, 1: { cellWidth: 55, minCellHeight: 40 } },
    });

    // ── NOTAS AL PIE ───────────────────────────────────────────
    tbl({
      body: [[
        { content: ' RECLAMO: Disconformidad relacionada a los productos o servicios.', styles: { ...base, fontSize: 6.5, cellPadding: 1.5 } },
        { content: ' QUEJA: Disconformidad no relacionada a los productos o servicios; o, malestar o descontento respecto a la atencion al publico.', styles: { ...base, fontSize: 6.5, cellPadding: 1.5 } },
      ]],
      tableLineWidth: 0,
      tableLineColor: WHT,
      columnStyles: { 0: { cellWidth: 95 }, 1: { cellWidth: 95 } },
      didDrawCell: (data) => {
        const sup = data.column.index === 0 ? '1' : '2';
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5);
        doc.setTextColor(0, 0, 0);
        doc.text(sup, data.cell.x + 1, data.cell.y + 2.8);
        doc.setFontSize(base.fontSize);
      },
    });

    // ── HOJA DE RECLAMACION VIRTUAL ────────────────────────────
    tbl({
      body: [[{ content: 'HOJA DE RECLAMACION VIRTUAL', styles: { ...hdr, halign: 'center', fontSize: 9 } }]],
      columnStyles: { 0: { cellWidth: CW } },
    });

    // ── TEXTOS LEGALES ─────────────────────────────────────────
    const lineH = 2.8;
    y += 2;
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(0, 0, 0);
    const t1 = doc.splitTextToSize('*La formulacion del reclamo no impide acudir a otras vias de solucion de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.', CW);
    const t2 = doc.splitTextToSize('* El proveedor debe dar respuesta al reclamo o queja en un plazo no mayor a quince (15) dias habiles, el cual es improrrogable.', CW);
    doc.text(t1, ML, y);
    doc.text(t2, ML, y + t1.length * lineH);

    // Agregar marca de agua en todas las páginas
    if (logoBase64) {
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.1 }));
        doc.addImage(logoBase64, 'PNG', logoX, logoY, logoSize, logoSize);
        doc.restoreGraphicsState();
      }
    }

    // Retornar como Blob
    const blob = doc.output('blob');
    resolve(blob);
  });
};