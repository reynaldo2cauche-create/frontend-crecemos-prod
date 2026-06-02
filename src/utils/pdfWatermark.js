// ============================================
// src/utils/pdfWatermark.js
// ============================================

import { PDFDocument, degrees } from 'pdf-lib';

async function loadImageAsBytes(imagePath) {
  const response = await fetch(imagePath);
  return await response.arrayBuffer();
}

function buildWatermarkGrid(width, height, logoWidth, logoHeight) {
  const positions = [];
  const cols = 4;
  const rows = 5;

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      positions.push({
        x: (col / (cols - 1)) * width,
        y: (row / (rows - 1)) * height,
      });
    }
  }

  return positions;
}

export async function addWatermarkToPDF(pdfBytes, options = {}) {
  const {
    opacity              = 0.25,
    logoPath             = '/assets/img/documento-logo.webp',
    logoWidth            = 130,
    logoHeight           = 130,
    distributeAcrossPage = true,
    rotation             = 40,
  } = options;

  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages  = pdfDoc.getPages();

  // Cargar logo una sola vez
  let logo = null;
  try {
    const logoBytes = await loadImageAsBytes(logoPath);
    try {
      logo = await pdfDoc.embedPng(logoBytes);
    } catch {
      logo = await pdfDoc.embedJpg(logoBytes);
    }
  } catch (error) {
    console.error('Error cargando logo:', error);
  }

  if (!logo) throw new Error('No se pudo cargar el logo para la marca de agua.');

  for (const page of pages) {
    const { width, height } = page.getSize();

    const positions = distributeAcrossPage
      ? buildWatermarkGrid(width, height, logoWidth, logoHeight)
      : [{ x: width / 2, y: height / 2 }];

    for (const { x, y } of positions) {
      page.drawImage(logo, {
        x:       x - logoWidth  / 2,
        y:       y - logoHeight / 2,
        width:   logoWidth,
        height:  logoHeight,
        opacity: opacity,
        rotate:  degrees(rotation),
      });
    }
  }

  return await pdfDoc.save();
}

export async function downloadPDFWithWatermark(pdfBlob, filename, watermarkOptions = {}) {
  const arrayBuffer   = await pdfBlob.arrayBuffer();
  const modifiedBytes = await addWatermarkToPDF(arrayBuffer, watermarkOptions);
  const modifiedBlob  = new Blob([modifiedBytes], { type: 'application/pdf' });

  const url  = window.URL.createObjectURL(modifiedBlob);
  const link = document.createElement('a');
  link.href  = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return { success: true, filename };
}