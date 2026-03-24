/**
 * Feriados de Perú 2026
 * Estos días se bloquean automáticamente en la agenda
 */

export const FERIADOS_2026 = [
  { fecha: '2026-04-02', nombre: 'Jueves Santo - Semana Santa' },
  { fecha: '2026-04-03', nombre: 'Viernes Santo - Semana Santa' },
  { fecha: '2026-05-01', nombre: 'Día del Trabajo' },
  { fecha: '2026-06-07', nombre: 'Batalla de Arica y Día de la Bandera' },
  { fecha: '2026-06-29', nombre: 'Día de San Pedro y San Pablo' },
  { fecha: '2026-07-23', nombre: 'Día de la Fuerza Aérea del Perú' },
  { fecha: '2026-07-28', nombre: 'Fiestas Patrias' },
  { fecha: '2026-07-29', nombre: 'Fiestas Patrias' },
  { fecha: '2026-08-06', nombre: 'Batalla de Junín' },
  { fecha: '2026-08-30', nombre: 'Santa Rosa de Lima' },
  { fecha: '2026-10-08', nombre: 'Combate de Angamos' },
  { fecha: '2026-11-01', nombre: 'Día de Todos los Santos' },
  { fecha: '2026-12-08', nombre: 'Inmaculada Concepción' },
  { fecha: '2026-12-09', nombre: 'Batalla de Ayacucho' },
  { fecha: '2026-12-25', nombre: 'Navidad' },
];

/**
 * Verifica si una fecha es feriado
 * @param {string} fecha - Fecha en formato 'YYYY-MM-DD'
 * @returns {object|null} - Objeto con información del feriado o null
 */
export const esFeriado = (fecha) => {
  return FERIADOS_2026.find(f => f.fecha === fecha) || null;
};

/**
 * Obtiene el nombre del feriado para una fecha
 * @param {string} fecha - Fecha en formato 'YYYY-MM-DD'
 * @returns {string|null} - Nombre del feriado o null
 */
export const getNombreFeriado = (fecha) => {
  const feriado = esFeriado(fecha);
  return feriado ? feriado.nombre : null;
};

/**
 * Obtiene todos los feriados como un Set para búsqueda rápida
 * @returns {Set<string>} - Set con todas las fechas de feriados
 */
export const getFeriadosSet = () => {
  return new Set(FERIADOS_2026.map(f => f.fecha));
};
