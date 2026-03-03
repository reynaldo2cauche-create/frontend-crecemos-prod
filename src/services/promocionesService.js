import api from './api';

// ============================================================
// PROMOCIONES — CRUD
// ============================================================

export const getPromociones = (soloActivas = false, soloVigentes = false) =>
  api.get('/promociones', {
    params: {
      soloActivas: soloActivas ? 'true' : undefined,
      soloVigentes: soloVigentes ? 'true' : undefined
    }
  }).then(r => r.data);

export const getPromocionesVigentes = (fecha = null) =>
  api.get('/promociones/vigentes', { params: fecha ? { fecha } : {} }).then(r => r.data);

export const getPromocionById = (id) =>
  api.get(`/promociones/${id}`).then(r => r.data);

export const crearPromocion = (dto) =>
  api.post('/promociones', dto).then(r => r.data);

export const actualizarPromocion = (id, dto) =>
  api.put(`/promociones/${id}`, dto).then(r => r.data);

export const activarPromocion = (id, user_id) =>
  api.patch(`/promociones/${id}/activar`, { user_id }).then(r => r.data);

export const desactivarPromocion = (id, user_id) =>
  api.patch(`/promociones/${id}/desactivar`, { user_id }).then(r => r.data);

export const eliminarPromocion = (id) =>
  api.delete(`/promociones/${id}`).then(r => r.data);

// ============================================================
// PROMOCIONES — CÁLCULO Y APLICACIÓN
// ============================================================

/**
 * Calcular promociones aplicables a un carrito
 * @param {Object} dto - { items: ItemVentaDto[], promociones_excluidas?: number[] }
 * @returns {Promise<{promociones_aplicadas, total_descuento, items_actualizados}>}
 */
export const calcularPromociones = (dto) =>
  api.post('/promociones/calcular', dto).then(r => r.data);

/**
 * Registrar que se aplicó una promoción en una venta
 */
export const registrarPromocionAplicada = (dto) =>
  api.post('/promociones/registrar-aplicacion', dto).then(r => r.data);

/**
 * Obtener promociones aplicadas a una venta específica
 */
export const getPromocionesAplicadas = (tipoVentaId, ventaId) =>
  api.get(`/promociones/aplicadas/${tipoVentaId}/${ventaId}`).then(r => r.data);

/**
 * Obtener estadísticas de uso de promociones
 */
export const getEstadisticasPromociones = (promocionId = null) =>
  api.get('/promociones/estadisticas/general', {
    params: promocionId ? { promocionId } : {}
  }).then(r => r.data);

// ============================================================
// PROMOCIONES — CATÁLOGOS Y TIPOS
// ============================================================

/**
 * Obtener el catálogo completo de alcances disponibles
 * Retorna: { productos, categorias, servicios, paquetes }
 */
export const getCatalogoAlcances = () =>
  api.get('/promociones/catalogo').then(r => r.data);

/**
 * Obtener tipos de promociones (alcance, condición, beneficio)
 * Retorna: { tiposAlcance, tiposCondicion, tiposBeneficio }
 */
export const getTiposPromociones = () =>
  api.get('/promociones/tipos').then(r => r.data);
