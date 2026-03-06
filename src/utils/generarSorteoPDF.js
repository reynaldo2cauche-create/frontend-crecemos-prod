import jsPDF from 'jspdf';

/**
 * Genera el PDF del acta de sorteo con los ganadores
 * @param {Object} sorteo - Datos del sorteo con ganadores
 * @returns {Promise<void>} - Descarga el PDF automáticamente
 */
export const generarSorteoPDF = async (sorteo) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 60;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  // ========== HEADER ==========
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  y = drawCenteredText(doc, 'Crecemos - Centro Integral de Terapias', y, pageWidth);
  y += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(102, 102, 102);
  y = drawCenteredText(doc, 'RUC: 20601074380', y, pageWidth);
  y += 25;

  // Línea separadora
  doc.setDrawColor(204, 204, 204);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  // ========== TÍTULO ==========
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  y = drawCenteredText(doc, 'ACTA DE SORTEO', y, pageWidth);
  y += 5;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(102, 102, 102);
  y = drawCenteredText(doc, `Sorteo: ${sorteo.nombre}`, y, pageWidth);
  y += 25;

  // ========== DATOS DEL SORTEO ==========
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  doc.text('DATOS DEL SORTEO', margin, y);

  // Subrayado del título
  const titleWidth = doc.getTextWidth('DATOS DEL SORTEO');
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, margin + titleWidth, y + 2);
  y += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 26);

  // Formatear fecha
  const fechaSorteo = new Date(sorteo.fecha_sorteo);
  const fechaFormateada = fechaSorteo.toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const horaFormateada = fechaSorteo.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Información del sorteo
  const labelX = margin;
  const valueX = margin + 140;

  y = drawLabelValue(doc, 'Fecha del Sorteo:', fechaFormateada, labelX, valueX, y);
  y = drawLabelValue(doc, 'Hora:', horaFormateada, labelX, valueX, y);

  if (sorteo.descripcion) {
    // Para descripciones largas, dividir en múltiples líneas
    doc.setFont('helvetica', 'bold');
    doc.text('Descripción:', labelX, y);
    doc.setFont('helvetica', 'normal');

    const descLines = doc.splitTextToSize(sorteo.descripcion, contentWidth - 140);
    doc.text(descLines, valueX, y);
    y += (descLines.length * 14);
  }

  y = drawLabelValue(doc, 'Total de Ganadores:', sorteo.cantidad_ganadores.toString(), labelX, valueX, y);
  y = drawLabelValue(doc, 'Registrado por:', sorteo.registrado_por || 'Sistema', labelX, valueX, y);
  y += 20;

  // ========== LISTA DE GANADORES ==========
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  doc.text('GANADORES DEL SORTEO', margin, y);

  const ganadoresTitleWidth = doc.getTextWidth('GANADORES DEL SORTEO');
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, margin + ganadoresTitleWidth, y + 2);
  y += 25;

  // Dibujar cada ganador
  sorteo.ganadores.forEach((ganador, index) => {
    // Verificar si necesitamos una nueva página
    if (y + 60 > pageHeight - 100) {
      doc.addPage();
      y = margin;
    }

    const nombreCompleto = `${ganador.nombres || ''} ${ganador.apellido_paterno || ''} ${ganador.apellido_materno || ''}`.trim();

    // Fondo alternado (gris claro para pares)
    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(margin, y - 5, contentWidth, 50, 'F');
    }

    const startY = y;

    // Posición del ganador
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text(`${ganador.posicion}°`, margin + 10, startY + 10);

    // Nombre del ganador
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    const nombreLines = doc.splitTextToSize(nombreCompleto, 350);
    doc.text(nombreLines, margin + 50, startY + 10);

    // DNI
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);
    doc.text(`DNI: ${ganador.numero_documento || 'N/A'}`, margin + 50, startY + 25);

    // Teléfono
    if (ganador.celular) {
      doc.text(`Tel: ${ganador.celular}`, margin + 50, startY + 37);
    }

    y += 55;
  });

  y += 20;

  // ========== FIRMAS ==========
  // Verificar si hay espacio para las firmas
  if (y + 80 > pageHeight - 100) {
    doc.addPage();
    y = margin;
  }

  // Línea separadora antes de firmas
  doc.setDrawColor(204, 204, 204);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 30;

  const firmaY = y;
  const firmaWidth = 180;

  // Calcular posiciones centradas para las firmas
  const seccionWidth = contentWidth / 2;
  const firma1CenterX = margin + (seccionWidth / 2);
  const firma2CenterX = margin + seccionWidth + (seccionWidth / 2);

  // Firma 1: Registrado por
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(102, 102, 102);
  doc.text('_________________________________', firma1CenterX, firmaY, { align: 'center' });
  doc.text('Registrado por', firma1CenterX, firmaY + 20, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  doc.text(sorteo.registrado_por || 'Sistema', firma1CenterX, firmaY + 35, { align: 'center' });

  // Firma 2: Director General
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(102, 102, 102);
  doc.text('_________________________________', firma2CenterX, firmaY, { align: 'center' });
  doc.text('Director(a) General', firma2CenterX, firmaY + 20, { align: 'center' });

  // ========== FOOTER (todas las páginas) ==========
  const totalPages = doc.internal.pages.length - 1; // -1 porque el índice 0 no cuenta
  const fechaGeneracion = new Date().toLocaleDateString('es-PE');
  const horaGeneracion = new Date().toLocaleTimeString('es-PE');

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(153, 153, 153);

    const footerY = pageHeight - 50;
    doc.text(
      `Documento generado el ${fechaGeneracion} a las ${horaGeneracion}`,
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      footerY + 15,
      { align: 'center' }
    );
  }

  // ========== DESCARGAR ==========
  const nombreArchivo = `acta_sorteo_${sorteo.nombre.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
  doc.save(nombreArchivo);
};

/**
 * Genera una URL de preview del PDF del sorteo
 * @param {Object} sorteo - Datos del sorteo
 * @returns {Promise<string>} - URL del blob para preview
 */
export const obtenerPreviewSorteoURL = async (sorteo) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 60;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  // (Mismo código que arriba, pero sin el save() al final)
  // ========== HEADER ==========
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  y = drawCenteredText(doc, 'Crecemos - Centro Integral de Terapias', y, pageWidth);
  y += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(102, 102, 102);
  y = drawCenteredText(doc, 'RUC: 20601074380', y, pageWidth);
  y += 25;

  doc.setDrawColor(204, 204, 204);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  y = drawCenteredText(doc, 'ACTA DE SORTEO', y, pageWidth);
  y += 5;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(102, 102, 102);
  y = drawCenteredText(doc, `Sorteo: ${sorteo.nombre}`, y, pageWidth);
  y += 25;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  doc.text('DATOS DEL SORTEO', margin, y);

  const titleWidth = doc.getTextWidth('DATOS DEL SORTEO');
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, margin + titleWidth, y + 2);
  y += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 26);

  const fechaSorteo = new Date(sorteo.fecha_sorteo);
  const fechaFormateada = fechaSorteo.toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const horaFormateada = fechaSorteo.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const labelX = margin;
  const valueX = margin + 140;

  y = drawLabelValue(doc, 'Fecha del Sorteo:', fechaFormateada, labelX, valueX, y);
  y = drawLabelValue(doc, 'Hora:', horaFormateada, labelX, valueX, y);

  if (sorteo.descripcion) {
    doc.setFont('helvetica', 'bold');
    doc.text('Descripción:', labelX, y);
    doc.setFont('helvetica', 'normal');

    const descLines = doc.splitTextToSize(sorteo.descripcion, contentWidth - 140);
    doc.text(descLines, valueX, y);
    y += (descLines.length * 14);
  }

  y = drawLabelValue(doc, 'Total de Ganadores:', sorteo.cantidad_ganadores.toString(), labelX, valueX, y);
  y = drawLabelValue(doc, 'Registrado por:', sorteo.registrado_por || 'Sistema', labelX, valueX, y);
  y += 20;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  doc.text('GANADORES DEL SORTEO', margin, y);

  const ganadoresTitleWidth = doc.getTextWidth('GANADORES DEL SORTEO');
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, margin + ganadoresTitleWidth, y + 2);
  y += 25;

  sorteo.ganadores.forEach((ganador, index) => {
    if (y + 60 > pageHeight - 100) {
      doc.addPage();
      y = margin;
    }

    const nombreCompleto = `${ganador.nombres || ''} ${ganador.apellido_paterno || ''} ${ganador.apellido_materno || ''}`.trim();

    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(margin, y - 5, contentWidth, 50, 'F');
    }

    const startY = y;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text(`${ganador.posicion}°`, margin + 10, startY + 10);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    const nombreLines = doc.splitTextToSize(nombreCompleto, 350);
    doc.text(nombreLines, margin + 50, startY + 10);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);
    doc.text(`DNI: ${ganador.numero_documento || 'N/A'}`, margin + 50, startY + 25);

    if (ganador.celular) {
      doc.text(`Tel: ${ganador.celular}`, margin + 50, startY + 37);
    }

    y += 55;
  });

  y += 20;

  if (y + 80 > pageHeight - 100) {
    doc.addPage();
    y = margin;
  }

  doc.setDrawColor(204, 204, 204);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 30;

  const firmaY = y;
  const firmaWidth = 180;

  // Calcular posiciones centradas para las firmas
  const seccionWidth = contentWidth / 2;
  const firma1CenterX = margin + (seccionWidth / 2);
  const firma2CenterX = margin + seccionWidth + (seccionWidth / 2);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(102, 102, 102);
  doc.text('_________________________________', firma1CenterX, firmaY, { align: 'center' });
  doc.text('Registrado por', firma1CenterX, firmaY + 20, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  doc.text(sorteo.registrado_por || 'Sistema', firma1CenterX, firmaY + 35, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(102, 102, 102);
  doc.text('_________________________________', firma2CenterX, firmaY, { align: 'center' });
  doc.text('Director(a) General', firma2CenterX, firmaY + 20, { align: 'center' });

  const totalPages = doc.internal.pages.length - 1;
  const fechaGeneracion = new Date().toLocaleDateString('es-PE');
  const horaGeneracion = new Date().toLocaleTimeString('es-PE');

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(153, 153, 153);

    const footerY = pageHeight - 50;
    doc.text(
      `Documento generado el ${fechaGeneracion} a las ${horaGeneracion}`,
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      footerY + 15,
      { align: 'center' }
    );
  }

  // Retornar como blob URL para preview
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
};

// ========== FUNCIONES AUXILIARES ==========

/**
 * Dibuja texto centrado y retorna la nueva posición Y
 */
function drawCenteredText(doc, text, y, pageWidth) {
  const textWidth = doc.getTextWidth(text);
  const x = (pageWidth - textWidth) / 2;
  doc.text(text, x, y);
  return y + 14; // Incremento estándar de línea
}

/**
 * Dibuja un par label: value y retorna la nueva posición Y
 */
function drawLabelValue(doc, label, value, labelX, valueX, y) {
  doc.setFont('helvetica', 'bold');
  doc.text(label, labelX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(value, valueX, y);
  return y + 14;
}
