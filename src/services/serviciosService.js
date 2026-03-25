import api from './api';

// ============================================================
// SERVICIOS (Catálogo)
// ============================================================

/**
 * Obtener todos los servicios del catálogo
 */
export const getServicios = () =>
  api.get('/catalogos/servicios').then(r => {
    // Ordenar servicios: primero Infantil, luego Adultos
    const serviciosOrdenados = r.data.sort((a, b) => {
      const areaNombreA = (a.area?.nombre || '').toLowerCase().trim();
      const areaNombreB = (b.area?.nombre || '').toLowerCase().trim();

      // Verificar si es infantil (con variaciones posibles)
      const esInfantilA = areaNombreA.includes('infantil');
      const esInfantilB = areaNombreB.includes('infantil');

      // Si A es Infantil y B no, A va primero
      if (esInfantilA && !esInfantilB) return -1;
      // Si B es Infantil y A no, B va primero
      if (!esInfantilA && esInfantilB) return 1;
      // Si ambos son del mismo tipo, mantener el orden original
      return 0;
    });

    console.log('🔍 Servicios ordenados (serviciosService):', serviciosOrdenados.map(s => ({ nombre: s.nombre, area: s.area?.nombre })));

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
