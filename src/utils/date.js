export function calcularEdad(fecha) {
  if (!fecha) return '';
  const hoy = new Date();
  const nacimiento = new Date(fecha);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

export function calcularEdadDetallada(fecha) {
  if (!fecha) return { años: 0, meses: 0, texto: '' };

  const hoy = new Date();
  const nacimiento = new Date(fecha);

  let años = hoy.getFullYear() - nacimiento.getFullYear();
  let meses = hoy.getMonth() - nacimiento.getMonth();

  // Ajustar años y meses si el día actual es antes del día de nacimiento
  if (hoy.getDate() < nacimiento.getDate()) {
    meses--;
  }

  // Si los meses son negativos, restar un año y ajustar meses
  if (meses < 0) {
    años--;
    meses += 12;
  }

  // Construir el texto
  let texto = '';
  if (años > 0) {
    texto = `${años} año${años !== 1 ? 's' : ''}`;
    if (meses > 0) {
      texto += ` y ${meses} mes${meses !== 1 ? 'es' : ''}`;
    }
  } else {
    texto = `${meses} mes${meses !== 1 ? 'es' : ''}`;
  }

  return { años, meses, texto };
}

/**
 * Formatea una fecha para enviar al backend en formato YYYY-MM-DD
 * evitando problemas de zona horaria
 * @param {string} fechaString - Fecha en formato YYYY-MM-DD del input
 * @returns {string} - Fecha formateada YYYY-MM-DD
 */
export function formatearFechaParaBackend(fechaString) {
  if (!fechaString) return '';

  // Si es un string con timestamp (YYYY-MM-DDTHH:mm:ss o similar), extraer solo la fecha
  if (typeof fechaString === 'string' && fechaString.includes('T')) {
    return fechaString.split('T')[0];
  }

  // Si ya viene en formato correcto YYYY-MM-DD, devolverla tal cual
  if (typeof fechaString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fechaString)) {
    return fechaString;
  }

  // Si es un objeto Date, formatear correctamente usando UTC para evitar problemas de timezone
  const fecha = new Date(fechaString);
  const año = fecha.getUTCFullYear();
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getUTCDate()).padStart(2, '0');

  return `${año}-${mes}-${dia}`;
}

/**
 * Formatea una fecha del backend para mostrar en input date
 * Evita problemas de timezone restando un día
 * @param {string} fechaString - Fecha del backend (puede incluir hora)
 * @returns {string} - Fecha en formato YYYY-MM-DD para input date
 */
export function formatearFechaParaInput(fechaString) {
  if (!fechaString) return '';

  // Extraer solo la parte de la fecha (YYYY-MM-DD)
  // Esto evita problemas con la zona horaria
  const soloFecha = fechaString.split('T')[0].split(' ')[0];

  return soloFecha;
}

/**
 * Formatea una fecha para mostrar en formato DD/MM/YYYY
 * @param {string} fechaString - Fecha en formato YYYY-MM-DD
 * @returns {string} - Fecha en formato DD/MM/YYYY
 */
export function formatearFechaParaMostrar(fechaString) {
  if (!fechaString) return '';

  // Extraer solo la parte de la fecha
  const soloFecha = fechaString.split('T')[0].split(' ')[0];
  const [año, mes, dia] = soloFecha.split('-');

  return `${dia}/${mes}/${año}`;
} 