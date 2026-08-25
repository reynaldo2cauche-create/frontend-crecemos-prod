// ============================================
// src/utils/qrValidacion.js
// Genera la tarjeta QR de validación de un documento oficial (CTC-XXXXXXXX):
// título, QR ondeado (morado claro) con el logo del centro, el código debajo
// y el texto para escanear. El QR apunta directo al validador público, que
// auto-valida al leer el parámetro ?code=.
// ============================================
import QRCodeStyling from 'qr-code-styling';

// Dominio público del validador. Se fija a producción para que el QR
// impreso en el certificado funcione siempre, aunque se genere desde
// localhost. El validador (VerificarDocumento) lee ?code= y valida solo.
export const VALIDACION_BASE_URL = 'https://www.crecemos.com.pe';

// Ruta del logo del centro (public/). Apaisado (~2563x975).
const LOGO_PATH = '/logo-text-short.png';

// Morado claro para los módulos y el código.
const MORADO = '#A98CD9';
const NEGRO = '#1A1A1A';

/**
 * Construye la URL de validación que codifica el QR.
 * @param {string} codigo - Código CTC-XXXXXXXX
 */
export const construirUrlValidacion = (codigo) => {
  const c = (codigo || '').trim().toUpperCase();
  return `${VALIDACION_BASE_URL}/verificar-documento?code=${encodeURIComponent(c)}`;
};

// Carga una imagen desde un blob/URL y resuelve cuando está lista.
const cargarImagen = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// Genera solo el QR ondeado (morado claro) con fondo transparente y lo
// devuelve como <img>. El logo NO se incrusta aquí: se dibuja aparte en el
// canvas (con su caja blanca) para poder dejar el resto del PNG transparente.
const generarQRImg = async (codigo, size) => {
  const qr = new QRCodeStyling({
    width: size,
    height: size,
    type: 'canvas',
    data: construirUrlValidacion(codigo),
    margin: 0,
    qrOptions: { errorCorrectionLevel: 'H' },
    dotsOptions: { type: 'extra-rounded', color: MORADO },
    cornersSquareOptions: { type: 'extra-rounded', color: MORADO },
    cornersDotOptions: { type: 'dot', color: MORADO },
    backgroundOptions: { color: 'transparent' },
  });

  const blob = await qr.getRawData('png');
  const url = URL.createObjectURL(blob);
  try {
    return await cargarImagen(url);
  } finally {
    // Liberar tras cargar la imagen en memoria.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
};

/**
 * Genera un dataURL PNG de la tarjeta completa de validación:
 * título + QR (con logo) + código + texto para escanear.
 * @param {string} codigo - Código CTC-XXXXXXXX
 * @param {Object} [opts]
 * @param {number} [opts.qrSize=560] - Lado del QR en px
 * @returns {Promise<string>} dataURL image/png
 */
export const generarQRDataURL = async (codigo, opts = {}) => {
  const { qrSize = 560 } = opts;
  const cod = (codigo || '').trim().toUpperCase();

  const qrImg = await generarQRImg(cod, qrSize);

  // Layout de la tarjeta
  const padX = 80;
  const width = qrSize + padX * 2;
  const topTitulo = 56;      // baseline del título
  const gapTituloQR = 40;
  const qrTop = topTitulo + gapTituloQR;
  const gapQRCodigo = 78;
  const codigoY = qrTop + qrSize + gapQRCodigo;
  const gapCodigoPie = 56;
  const pieY = codigoY + gapCodigoPie;
  const bottom = 44;
  const height = pieY + bottom;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Sin fondo: el PNG queda transparente (solo el QR, el logo y los textos).

  ctx.textAlign = 'center';

  // Título
  ctx.fillStyle = NEGRO;
  ctx.font = "bold 40px 'Segoe UI', Arial, sans-serif";
  ctx.fillText('Código de verificación', width / 2, topTitulo);

  // QR centrado (fondo transparente)
  ctx.drawImage(qrImg, padX, qrTop, qrSize, qrSize);

  // Logo centrado con su caja blanca. El QR usa corrección de errores 'H',
  // así que tapar el centro (~30-40%) no impide la lectura.
  const logoImg = await cargarImagen(LOGO_PATH);
  const cx = padX + qrSize / 2;
  const cy = qrTop + qrSize / 2;
  const logoW = qrSize * 0.40;
  const logoH = logoW * (logoImg.naturalHeight / logoImg.naturalWidth);
  const boxPad = qrSize * 0.03;
  const boxW = logoW + boxPad * 2;
  const boxH = logoH + boxPad * 2;
  const boxX = cx - boxW / 2;
  const boxY = cy - boxH / 2;

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 14);
  ctx.fill();

  ctx.drawImage(logoImg, cx - logoW / 2, cy - logoH / 2, logoW, logoH);

  // Código (morado claro)
  ctx.fillStyle = MORADO;
  ctx.font = "bold 56px 'Courier New', monospace";
  ctx.fillText(cod, width / 2, codigoY);

  // Texto para escanear
  ctx.fillStyle = NEGRO;
  ctx.font = "bold 26px 'Segoe UI', Arial, sans-serif";
  ctx.fillText('*Escanea este QR para validar este documento', width / 2, pieY);

  return canvas.toDataURL('image/png');
};

/**
 * Genera y descarga la tarjeta QR de validación como PNG.
 * @param {string} codigo - Código CTC-XXXXXXXX
 * @param {Object} [opts] - Ver generarQRDataURL
 */
export const descargarQR = async (codigo, opts = {}) => {
  const dataUrl = await generarQRDataURL(codigo, opts);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `QR-${(codigo || 'validacion').trim().toUpperCase()}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  return dataUrl;
};

export default { construirUrlValidacion, generarQRDataURL, descargarQR };
