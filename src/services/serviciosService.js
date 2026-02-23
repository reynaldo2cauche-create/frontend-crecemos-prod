import api from './api';

// ============================================================
// SERVICIOS (Catálogo)
// ============================================================

/**
 * Obtener todos los servicios del catálogo
 */
export const getServicios = () =>
  api.get('/catalogos/servicios').then(r => r.data);

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
