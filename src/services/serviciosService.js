import api from './api';

// ============================================================
// SERVICIOS (Catálogo)
// ============================================================

/**
 * Obtener todos los servicios del catálogo
 */
const ORDEN_AREAS = ['infantil', 'adolescente', 'adulto'];

const prioridadArea = (nombre = '') => {
  const n = nombre.toLowerCase();
  const idx = ORDEN_AREAS.findIndex(k => n.includes(k));
  return idx === -1 ? ORDEN_AREAS.length : idx;
};

export const getServicios = () =>
  api.get('/catalogos/servicios').then(r => {
    const serviciosOrdenados = [...r.data].sort((a, b) => {
      const pa = prioridadArea(a.area?.nombre);
      const pb = prioridadArea(b.area?.nombre);
      if (pa !== pb) return pa - pb;
      return (a.nombre || '').localeCompare(b.nombre || '', 'es');
    });
    return serviciosOrdenados;
  });

/**
 * Obtener áreas de servicio
 */
export const getAreasServicio = () =>
  api.get('/catalogos/area-servicio').then(r => r.data);

/**
 * Obtener tarifas de servicios (servicio + motivo + precio)
 */
export const getTarifasServicios = () =>
  api.get('/inventario/tarifas').then(r => r.data);

// ============================================================
// PAQUETES
// ============================================================

/**
 * Obtener todos los paquetes activos
 */
export const getPaquetes = () =>
  api.get('/catalogos/paquetes').then(r => r.data);
