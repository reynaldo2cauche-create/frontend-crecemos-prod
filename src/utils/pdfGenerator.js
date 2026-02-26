import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import logoUrl from '/logo-text-short.png';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toFloat = (v) => parseFloat(v || 0);

const formatMoney = (num) => {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const getNombreCliente = (venta) => {
  if (venta.paciente)
    return `${venta.paciente.nombres} ${venta.paciente.apellidos || venta.paciente.apellido_paterno || ''}`.trim();
  if (venta.responsable)
    return `${venta.responsable.nombres} ${venta.responsable.apellidos || venta.responsable.apellido_paterno || ''}`.trim();
  if (venta.comprador_externo)
    return venta.comprador_externo.nombre_completo || venta.comprador_externo.nombre || '';
  return '-';
};

// Para ventas de servicios: obtener el nombre del comprador/pagador
const getNombreComprador = (venta) => {
  if (venta.responsable)
    return `${venta.responsable.nombres} ${venta.responsable.apellidos || venta.responsable.apellido_paterno || ''}`.trim();
  if (venta.comprador_externo)
    return venta.comprador_externo.nombre_completo || venta.comprador_externo.nombre || '';
  if (venta.paciente)
    return `${venta.paciente.nombres} ${venta.paciente.apellidos || venta.paciente.apellido_paterno || ''}`.trim();
  return '-';
};

// Para ventas de servicios: obtener pacientes únicos de los detalles
const getPacientesServicio = (venta) => {
  const detalles = venta.detalles || [];
  const pacientesMap = new Map();

  detalles.forEach(d => {
    if (d.paciente && d.paciente.id) {
      const nombre = `${d.paciente.nombres} ${d.paciente.apellidos || d.paciente.apellido_paterno || ''}`.trim();
      const dni = d.paciente.dni || d.paciente.numero_documento || '-';
      pacientesMap.set(d.paciente.id, { nombre, dni });
    }
  });

  return Array.from(pacientesMap.values());
};

const getDni = (venta) =>
  venta.paciente?.dni ||
  venta.paciente?.numero_documento ||
  venta.responsable?.dni ||
  venta.responsable?.numero_documento ||
  venta.comprador_externo?.dni ||
  '-';

const getDniComprador = (venta) =>
  venta.responsable?.dni ||
  venta.responsable?.numero_documento ||
  venta.comprador_externo?.dni ||
  venta.paciente?.dni ||
  venta.paciente?.numero_documento ||
  '-';

const getFechaEmision = (venta) => {
  const str = String(venta.fecha_venta || '');
  const [datePart, timePart] = str.split('T');
  const [year, month, day]   = datePart.split('-').map(Number);
  if (timePart) {
    const [h, m] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, h, m).toLocaleString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }
  return new Date(year, month - 1, day).toLocaleDateString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

// Función para convertir números a letras en español
const numeroALetras = (num) => {
  const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  if (num === 0) return 'CERO';
  if (num === 100) return 'CIEN';

  const convertirGrupo = (n) => {
    if (n === 0) return '';
    if (n < 10) return unidades[n];
    if (n >= 10 && n < 20) return especiales[n - 10];
    if (n >= 20 && n < 30) {
      return n === 20 ? 'VEINTE' : 'VEINTI' + unidades[n - 20];
    }
    if (n < 100) {
      const dec = Math.floor(n / 10);
      const uni = n % 10;
      return decenas[dec] + (uni > 0 ? ' Y ' + unidades[uni] : '');
    }
    if (n < 1000) {
      const cent = Math.floor(n / 100);
      const resto = n % 100;
      return (n === 100 ? 'CIEN' : centenas[cent]) + (resto > 0 ? ' ' + convertirGrupo(resto) : '');
    }
    return '';
  };

  if (num < 1000) return convertirGrupo(num);

  if (num < 1000000) {
    const miles = Math.floor(num / 1000);
    const resto = num % 1000;
    let textoMiles = miles === 1 ? 'MIL' : convertirGrupo(miles) + ' MIL';
    return textoMiles + (resto > 0 ? ' ' + convertirGrupo(resto) : '');
  }

  if (num < 1000000000) {
    const millones = Math.floor(num / 1000000);
    const resto = num % 1000000;
    let textoMillones = millones === 1 ? 'UN MILLON' : convertirGrupo(millones) + ' MILLONES';
    return textoMillones + (resto > 0 ? ' ' + numeroALetras(resto) : '');
  }

  return num.toString();
};

const getImporteLetras = (total) => {
  const parteEntera = Math.floor(total);
  const centavos = Math.round((total - parteEntera) * 100);
  const letras = numeroALetras(parteEntera);
  return `${letras} CON ${centavos.toString().padStart(2, '0')}/100 SOLES`;
};

const buildTableRows = (venta, tipo) =>
  (venta.detalles || []).map((d) => {
    if (tipo === 'servicio') {
      const esPaquete  = d.tipo_venta?.nombre?.toLowerCase().includes('paquete');
      let descripcion;
      let cantidad;

      if (esPaquete && d.paquete) {
        // Para paquetes: calcular cantidad de paquetes comprados
        const sesionesPorPaquete = d.paquete.cantidad_sesiones || d.paquete.sesiones || d.paquete.numero_sesiones || 1;
        const sesionesTotales = d.sesiones_totales || 0;
        cantidad = Math.round(sesionesTotales / sesionesPorPaquete);

        const nombreServicio = d.servicio?.nombre || '';
        descripcion = nombreServicio
          ? `${d.paquete.nombre} (${sesionesPorPaquete} SES.) - ${nombreServicio}`
          : `${d.paquete.nombre} (${sesionesPorPaquete} SES.)`;
      } else {
        // Para sesiones individuales: cantidad = número de sesiones
        cantidad = d.sesiones_totales || 0;
        descripcion = d.servicio?.nombre || '-';
      }

      const precioUnitario = toFloat(d.precio_unitario) * (d.sesiones_totales || 1);
      const subtotal       = precioUnitario - toFloat(d.descuento_monto);
      const pacienteNombre = d.paciente
        ? `${d.paciente.nombres} ${d.paciente.apellidos || d.paciente.apellido_paterno || ''}`.trim()
        : '-';
      return {
        descripcion,
        codigo: String(d.servicio?.id || 0).padStart(4, '0'),
        cantidad,
        precioUnitario,
        subtotal,
        paciente: pacienteNombre
      };
    }
    return {
      descripcion:    d.producto?.nombre || '-',
      codigo:         String(d.producto?.id || 0).padStart(4, '0'),
      cantidad:       toFloat(d.cantidad),
      precioUnitario: toFloat(d.precio_unitario),
      subtotal:       toFloat(d.subtotal),
      paciente:       null  // No aplica para productos
    };
  });

// ─── Cargar logo como base64 ──────────────────────────────────────────────────

let _logoCache = null;

const cargarLogo = () => {
  if (_logoCache) return Promise.resolve(_logoCache);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width  = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        _logoCache = canvas.toDataURL('image/png');
        resolve(_logoCache);
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = logoUrl;
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORMATO A4
// ═══════════════════════════════════════════════════════════════════════════════

export const generarPDFA4 = async (venta, tipo) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const COLOR_PRIMARY = [123, 31, 162];
  const COLOR_TEXTO   = [51, 51, 51];
  const COLOR_GRIS    = [128, 128, 128];
  const COLOR_LINEA   = [200, 200, 200];
  const pageW = doc.internal.pageSize.getWidth();
  const M     = 15;
  const rows  = buildTableRows(venta, tipo);

  const logoBase64 = await cargarLogo();
  if (logoBase64) doc.addImage(logoBase64, 'PNG', M, M, 50, 12);

  const bx = pageW - M - 65, by = M, bw = 65, bh = 30;
  doc.setDrawColor(...COLOR_PRIMARY); doc.setLineWidth(0.5);
  doc.rect(bx, by, bw, bh);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...COLOR_TEXTO);
  doc.text('R.U.C. N° 20601074380', bx + bw / 2, by + 7, { align: 'center' });
  doc.setFontSize(10);
  doc.text((venta.tipo_comprobante?.nombre || 'TICKET DE VENTA').toUpperCase(), bx + bw / 2, by + 14, { align: 'center' });
  doc.setFontSize(14); doc.setTextColor(...COLOR_PRIMARY);
  doc.text(venta.codigo_comprobante || '#00000', bx + bw / 2, by + 23, { align: 'center' });

  let y = M + 25;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...COLOR_TEXTO);
  doc.text('CONTIGO CRECEMOS E.I.R.L.', M, y); y += 5;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...COLOR_GRIS);
  ['Centro de terapias Crecemos', 'LT. 5 MZ. W1 URB. EL PINAR PARCELA H - LIMA LIMA',
   'COMAS', 'Telf.: 957 064 401', 'Correo: info@crecemos.com.pe']
    .forEach((line) => { doc.text(line, M, y); y += 4; });

  // Recuadro de datos del cliente/comprador
  const cx = bx, cy = M + 35, cw = 65, ch = 28;
  doc.setDrawColor(...COLOR_LINEA); doc.setLineWidth(0.3);
  doc.rect(cx, cy, cw, ch);
  let cy2 = cy + 6;
  const clientField = (label, value) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...COLOR_TEXTO);
    doc.text(label, cx + 3, cy2);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(`: ${value}`, cw - 31);
    doc.text(lines, cx + 28, cy2);
    cy2 += lines.length * 4 + 1;
  };

  clientField('Fecha emisión', getFechaEmision(venta));

  if (tipo === 'servicio') {
    // Para servicios: solo mostrar comprador (los pacientes van en cada línea de la tabla)
    clientField('Comprador', getNombreComprador(venta));
    clientField('DNI', getDniComprador(venta));
    clientField('Dirección', '-');
  } else {
    // Para productos: mostrar como antes
    clientField('Señor(es)', getNombreCliente(venta));
    clientField('DNI', getDni(venta));
    clientField('Dirección', '-');
  }

  y = cy + ch + 10;

  // Tabla dinámica según tipo de venta
  if (tipo === 'servicio') {
    // Para servicios: agregar columna "Paciente"
    doc.autoTable({
      startY: y,
      head: [['Cant.', 'Código', 'Descripción', 'Paciente', 'P.U.', 'Total']],
      body: rows.map((r) => [
        r.cantidad.toFixed(2),
        r.codigo,
        r.descripcion,
        r.paciente || '-',
        formatMoney(r.precioUnitario),
        formatMoney(r.subtotal)
      ]),
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.5, textColor: COLOR_TEXTO },
      headStyles: { fillColor: [245, 245, 245], textColor: COLOR_TEXTO, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { halign: 'center', cellWidth: 15 },
        2: { halign: 'left', cellWidth: 'auto' },
        3: { halign: 'left', cellWidth: 40 },
        4: { halign: 'right', cellWidth: 22 },
        5: { halign: 'right', cellWidth: 22 },
      },
      margin: { left: M, right: M },
    });
  } else {
    // Para productos: tabla sin columna paciente
    doc.autoTable({
      startY: y,
      head: [['Cant.', 'Unidad', 'Código', 'Descripción', 'P.U.', 'Total']],
      body: rows.map((r) => [
        r.cantidad.toFixed(2),
        'UNIDAD',
        r.codigo,
        r.descripcion,
        formatMoney(r.precioUnitario),
        formatMoney(r.subtotal)
      ]),
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3, textColor: COLOR_TEXTO },
      headStyles: { fillColor: [245, 245, 245], textColor: COLOR_TEXTO, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'center', cellWidth: 18 },
        3: { halign: 'left', cellWidth: 'auto' },
        4: { halign: 'right', cellWidth: 25 },
        5: { halign: 'right', cellWidth: 25 },
      },
      margin: { left: M, right: M },
    });
  }

  y = doc.lastAutoTable.finalY + 5;
  const descuento = toFloat(venta.descuento_monto);
  const total     = toFloat(venta.total);

  // Determinar si es boleta o factura (requiere IGV)
  const tipoComprobante = (venta.tipo_comprobante?.nombre || '').toUpperCase();
  const esBoleta = tipoComprobante.includes('BOLETA');
  const esFactura = tipoComprobante.includes('FACTURA');
  const requiereIGV = esBoleta || esFactura;

  const totalesData = [];

  if (requiereIGV) {
    // Para boleta/factura: calcular IGV sobre el total final
    const baseImponible = total / 1.18;
    const igv = total - baseImponible;

    if (descuento > 0) totalesData.push(['DESCUENTOS(-)', 'S/', formatMoney(descuento)]);
    totalesData.push(['BASE IMPONIBLE', 'S/', formatMoney(baseImponible)]);
    totalesData.push(['IGV (18%)', 'S/', formatMoney(igv)]);
    totalesData.push(['TOTAL', 'S/', formatMoney(total)]);
  } else {
    // Para ticket de venta: solo descuento y total
    if (descuento > 0) totalesData.push(['DESCUENTOS(-)', 'S/', formatMoney(descuento)]);
    totalesData.push(['TOTAL', 'S/', formatMoney(total)]);
  }

  doc.autoTable({
    startY: y, body: totalesData, theme: 'plain',
    styles: { fontSize: 10, fontStyle: 'bold', cellPadding: 2 },
    columnStyles: {
      0: { halign: 'right', cellWidth: pageW - M * 2 - 50 },
      1: { halign: 'right', cellWidth: 15 },
      2: { halign: 'right', cellWidth: 35 },
    },
    margin: { left: M, right: M },
  });

  y = doc.lastAutoTable.finalY + 8;
  doc.setDrawColor(...COLOR_LINEA); doc.setLineWidth(0.3);
  doc.rect(M, y, pageW - M * 2, 10);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...COLOR_TEXTO);
  doc.text('IMPORTE EN LETRAS:', M + 2, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(getImporteLetras(total), M + 42, y + 6);

  if (venta.nota?.trim()) {
    y += 15;
    const obsLines = doc.splitTextToSize(venta.nota, pageW - M * 2 - 4);
    const obsH = Math.max(20, obsLines.length * 4 + 10);
    doc.setDrawColor(...COLOR_LINEA);
    doc.rect(M, y, pageW - M * 2, obsH);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text('OBSERVACIONES:', M + 2, y + 5);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text(obsLines, M + 2, y + 10);
    y += obsH;
  }

  y += 20;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...COLOR_PRIMARY);
  doc.text('¡Gracias por su preferencia!', pageW / 2, y, { align: 'center' });

  return doc;
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORMATO TICKET TÉRMICO — genera PDF desde el HTML de la vista previa
// Así el PDF es 100% idéntico a lo que se ve en pantalla
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Recibe el elemento DOM del ticket (el div con id="ticket-preview-node")
 * y lo convierte a PDF usando html2canvas.
 */
export const generarPDFDesdeHTML = async (elemento) => {
  // Asegurar que el elemento tenga altura completa antes de capturar
  const alturaOriginal = elemento.style.height;
  const maxHeightOriginal = elemento.style.maxHeight;
  const overflowOriginal = elemento.style.overflow;

  elemento.style.height = 'auto';
  elemento.style.maxHeight = 'none';
  elemento.style.overflow = 'visible';

  // Delay mayor para asegurar que el DOM esté completamente renderizado
  await new Promise(resolve => setTimeout(resolve, 300));

  // Forzar reflow
  const alturaReal = elemento.scrollHeight;
  elemento.offsetHeight;

  console.log('Altura real del elemento:', alturaReal, 'px');

  const canvas = await html2canvas(elemento, {
    scale: 3,                    // alta resolución para impresión
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    scrollY: -window.scrollY,    // compensar scroll
    scrollX: -window.scrollX,
    windowHeight: alturaReal,    // capturar altura completa
    height: alturaReal,          // altura total del contenido
    onclone: (clonedDoc) => {
      // Asegurar que el elemento clonado también tenga altura completa
      const clonedElement = clonedDoc.getElementById(elemento.id) || clonedDoc.querySelector('[data-ticket-preview]');
      if (clonedElement) {
        clonedElement.style.height = 'auto';
        clonedElement.style.maxHeight = 'none';
        clonedElement.style.overflow = 'visible';
        // Asegurar que todos los hijos también sean visibles
        const allChildren = clonedElement.querySelectorAll('*');
        allChildren.forEach(child => {
          child.style.maxHeight = 'none';
          child.style.overflow = 'visible';
        });
      }
    }
  });

  // Restaurar estilos originales
  elemento.style.height = alturaOriginal;
  elemento.style.maxHeight = maxHeightOriginal;
  elemento.style.overflow = overflowOriginal;

  console.log('Canvas capturado - height:', canvas.height, 'px, width:', canvas.width, 'px');

  const imgData = canvas.toDataURL('image/png');
  const imgW = 72;  // ancho del ticket en mm (papel térmico de 72mm)
  const imgH = (canvas.height * imgW) / canvas.width;

  // Altura máxima por página compatible con navegadores (297mm = tamaño A4)
  const maxAlturaPagina = 297;

  console.log('PDF - Ancho:', imgW, 'mm, Alto total:', imgH, 'mm');

  if (imgH <= maxAlturaPagina) {
    // Si cabe en una sola página, generar PDF simple
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [imgW, imgH],
    });
    doc.addImage(imgData, 'PNG', 0, 0, imgW, imgH);
    console.log('PDF generado en 1 página');
    return doc;
  } else {
    // Si es muy largo, dividir en múltiples páginas
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [imgW, maxAlturaPagina],
    });

    // Crear imagen desde el canvas original una vez
    const img = new Image();
    img.src = imgData;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const pixelsPorMM = canvas.width / imgW;
    let offsetY = 0;
    let paginaActual = 0;

    while (offsetY < imgH) {
      if (paginaActual > 0) {
        doc.addPage([imgW, maxAlturaPagina]);
      }

      // Calcular la porción de la imagen para esta página
      const alturaRestante = imgH - offsetY;
      const alturaPagina = Math.min(maxAlturaPagina, alturaRestante);

      // Usar canvas temporal para recortar la porción correcta
      const canvasTemp = document.createElement('canvas');
      const ctx = canvasTemp.getContext('2d');

      const offsetYPixels = offsetY * pixelsPorMM;
      const alturaPaginaPixels = alturaPagina * pixelsPorMM;

      canvasTemp.width = canvas.width;
      canvasTemp.height = alturaPaginaPixels;

      // Dibujar la porción correspondiente
      ctx.drawImage(
        img,
        0, offsetYPixels,           // source x, y
        canvas.width, alturaPaginaPixels,  // source width, height
        0, 0,                       // dest x, y
        canvas.width, alturaPaginaPixels   // dest width, height
      );

      const imgDataPagina = canvasTemp.toDataURL('image/png');
      doc.addImage(imgDataPagina, 'PNG', 0, 0, imgW, alturaPagina);

      offsetY += maxAlturaPagina;
      paginaActual++;
    }

    console.log(`PDF generado en ${paginaActual} páginas`);
    return doc;
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// API PÚBLICA
// ═══════════════════════════════════════════════════════════════════════════════

export const generarTicketPDF = async (venta, tipo) => {
  const doc    = await generarPDFA4(venta, tipo);
  const nombre = getNombreCliente(venta).replace(/\s+/g, '_');
  doc.save(`${venta.codigo_comprobante || 'ticket'}_${nombre}.pdf`);
};

// generarTicketTermico ahora recibe el elemento DOM del preview
export const generarTicketTermico = async (elemento, venta, tipo) => {
  const doc    = await generarPDFDesdeHTML(elemento);
  const nombre = getNombreCliente(venta).replace(/\s+/g, '_');
  doc.save(`ticket_${venta.codigo_comprobante || 'termico'}_${nombre}.pdf`);
};

export const obtenerPreviewURL = async (venta, tipo, formato = 'a4', elemento = null) => {
  if (formato === 'ticket' && elemento) {
    const doc = await generarPDFDesdeHTML(elemento);
    return doc.output('bloburl');
  }
  const doc = await generarPDFA4(venta, tipo);
  return doc.output('bloburl');
};

// Helpers exportados para uso en TicketPreviewHTML
export {
  getNombreCliente,
  getNombreComprador,
  getPacientesServicio,
  getDni,
  getDniComprador,
  getFechaEmision,
  getImporteLetras,
  buildTableRows,
  toFloat,
  formatMoney
};