// ============================================
// src/utils/pdfWatermark.js
// Utilidad para agregar marca de agua a PDFs
// ============================================

import { PDFDocument, rgb, degrees } from 'pdf-lib';

/**
 * Carga una imagen como bytes
 * @param {string} imagePath - Ruta de la imagen
 * @returns {Promise<ArrayBuffer>} - Bytes de la imagen
 */
async function loadImageAsBytes(imagePath) {
  const response = await fetch(imagePath);
  return await response.arrayBuffer();
}

/**
 * Agrega marca de agua a un PDF
 * @param {ArrayBuffer} pdfBytes - Bytes del PDF original
 * @param {Object} options - Opciones de marca de agua
 * @returns {Uint8Array} - PDF con marca de agua
 */
export async function addWatermarkToPDF(pdfBytes, options = {}) {
  try {
    const {
      codigo = '',
      opacity = 0.8,
      logoPath = '/assets/img/documento-logo.webp',
      logoWidth = 200,
      logoHeight = 200,
      distributeAcrossPage = true,
      rotation = 45
    } = options;

    // Cargar el PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    // Cargar el logo
    let logo;
    try {
      const logoBytes = await loadImageAsBytes(logoPath);
      logo = await pdfDoc.embedPng(logoBytes);
    } catch (error) {
      console.error('Error cargando logo, usando texto como fallback:', error);
      logo = null;
    }

    // Procesar cada página
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();

      if (distributeAcrossPage && logo) {
        // Marca de agua distribuida en diagonal profesional
        // Patrón diagonal que cubre toda la página uniformemente
        const diagonal = [
          { x: width * 0.15, y: height * 0.75 },
          { x: width * 0.50, y: height * 0.75 },
          { x: width * 0.85, y: height * 0.75 },

          { x: width * 0.15, y: height * 0.50 },
          { x: width * 0.50, y: height * 0.50 },
          { x: width * 0.85, y: height * 0.50 },

          { x: width * 0.15, y: height * 0.25 },
          { x: width * 0.50, y: height * 0.25 },
          { x: width * 0.85, y: height * 0.25 },
        ];

        diagonal.forEach(pos => {
          page.drawImage(logo, {
            x: pos.x - (logoWidth / 2),
            y: pos.y - (logoHeight / 2),
            width: logoWidth,
            height: logoHeight,
            opacity: opacity,
            rotate: degrees(rotation),
          });
        });
      } else if (logo) {
        // Marca de agua central única
        const centerX = width / 2 - logoWidth / 2;
        const centerY = height / 2 - logoHeight / 2;

        page.drawImage(logo, {
          x: centerX,
          y: centerY,
          width: logoWidth,
          height: logoHeight,
          opacity: opacity,
          rotate: degrees(rotation),
        });
      }
    }

    // Retornar el PDF modificado
    const modifiedPdfBytes = await pdfDoc.save();
    return modifiedPdfBytes;

  } catch (error) {
    console.error('Error al agregar marca de agua:', error);
    throw error;
  }
}

/**
 * Agrega marca de agua y descarga el PDF
 * @param {Blob} pdfBlob - Blob del PDF original
 * @param {string} filename - Nombre del archivo
 * @param {Object} watermarkOptions - Opciones de marca de agua
 */
export async function downloadPDFWithWatermark(pdfBlob, filename, watermarkOptions = {}) {
  try {
    // Convertir Blob a ArrayBuffer
    const arrayBuffer = await pdfBlob.arrayBuffer();

    // Agregar marca de agua
    const modifiedPdfBytes = await addWatermarkToPDF(arrayBuffer, watermarkOptions);

    // Crear nuevo Blob
    const modifiedBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

    // Descargar
    const url = window.URL.createObjectURL(modifiedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true, filename };
  } catch (error) {
    console.error('Error al descargar PDF con marca de agua:', error);
    throw error;
  }
}
