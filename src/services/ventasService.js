import api from './api';

// ============================================================
// VENTAS — SERVICIOS
// ============================================================

/**
 * Obtener todas las ventas de servicios
 * @param {Object} filtros - { fechaDesde?, fechaHasta?, paciente_id?, tipo_pagador_id? }
 */
export const getVentasServicios = (filtros = {}) =>
  api.get('/ventas/servicios', { params: filtros }).then(r => r.data);

export const getHistorialVentas = (filtros = {}) =>
  api.get('/ventas/servicios/historial', { params: filtros }).then(r => r.data);

/**
 * Obtener una venta de servicio por ID
 * @param {number} id - ID de la venta
 */
export const getVentaServicioById = (id) =>
  api.get(`/ventas/servicios/${id}`).then(r => r.data);

/**
 * Obtener sesiones pendientes de un paciente
 * @param {number} pacienteId - ID del paciente
 */
export const getSesionesPendientesPaciente = (pacienteId) =>
  api.get(`/ventas/servicios/pendientes/paciente/${pacienteId}`).then(r => r.data);

/**
 * Crear una venta de servicio
 * @param {Object} dto - CreateVentaServicioDto
 * {
 *   tipo_pagador_id: number,
 *   paciente_id?: number,
 *   responsable_id?: number,
 *   comprador_externo_id?: number,
 *   fecha_venta: string (ISO),
 *   descuento_tipo_id?: number (1=%, 2=monto),
 *   descuento_valor?: number,
 *   nota?: string,
 *   user_crea_id?: number,
 *   detalles: [{
 *     servicio_id?: number,
 *     paquete_id?: number,
 *     tipo_venta_servicio_id: number (1=sesión, 2=paquete),
 *     paciente_id: number,
 *     sesiones_totales: number,
 *     precio_unitario: number,
 *     descuento_tipo_id?: number,
 *     descuento_valor?: number
 *   }]
 * }
 */
export const crearVentaServicio = (dto) =>
  api.post('/ventas/servicios', dto).then(r => r.data);

/**
 * Marcar una sesión como usada
 * @param {number} detalleId - ID del detalle de venta
 * @param {Object} body - { user_registra_id: number }
 */
export const marcarSesionUsada = (detalleId, body) =>
  api.patch(`/ventas/servicios/detalle/${detalleId}/sesion-usada`, body).then(r => r.data);

/**
 * Actualizar una venta de servicio
 * @param {number} id - ID de la venta
 * @param {Object} dto - UpdateVentaServicioDto
 * {
 *   fecha_venta?: string,
 *   descuento_tipo_id?: number,
 *   descuento_valor?: number,
 *   nota?: string,
 *   observaciones?: string,
 *   modalidad_pago_id?: number,
 *   user_actua_id?: number
 * }
 */
export const actualizarVentaServicio = (id, dto) =>
  api.patch(`/ventas/servicios/${id}`, dto).then(r => r.data);

/**
 * Verificar si una venta de servicio tiene citas asociadas
 * @param {number} id - ID de la venta
 * @returns {Promise<{tieneCitas: boolean, cantidadCitas: number, mensaje?: string}>}
 */
export const verificarVentaServicioTieneCitas = (id) =>
  api.get(`/ventas/servicios/${id}/verificar-citas`).then(r => r.data);

/**
 * Eliminar una venta de servicio
 * @param {number} id - ID de la venta
 */
export const eliminarVentaServicio = (id) =>
  api.delete(`/ventas/servicios/${id}`).then(r => r.data);

// ============================================================
// VENTAS — PRODUCTOS
// ============================================================

/**
 * Obtener todas las ventas de productos
 * @param {Object} filtros - { fechaDesde?, fechaHasta?, paciente_id?, tipo_pagador_id? }
 */
export const getVentasProductos = (filtros = {}) =>
  api.get('/ventas/productos', { params: filtros }).then(r => r.data);

/**
 * Obtener una venta de producto por ID
 * @param {number} id - ID de la venta
 */
export const getVentaProductoById = (id) =>
  api.get(`/ventas/productos/${id}`).then(r => r.data);

/**
 * Crear una venta de producto
 * @param {Object} dto - CreateVentaProductoDto
 * {
 *   tipo_pagador_id: number,
 *   paciente_id?: number,
 *   responsable_id?: number,
 *   comprador_externo_id?: number,
 *   fecha_venta: string (ISO),
 *   descuento_tipo_id?: number (1=%, 2=monto),
 *   descuento_valor?: number,
 *   nota?: string,
 *   user_crea_id?: number,
 *   detalles: [{
 *     producto_id: number,
 *     cantidad: number,
 *     precio_unitario: number,
 *     descuento_tipo_id?: number,
 *     descuento_valor?: number
 *   }]
 * }
 */
export const crearVentaProducto = (dto) =>
  api.post('/ventas/productos', dto).then(r => r.data);

/**
 * Actualizar una venta de producto
 * @param {number} id - ID de la venta
 * @param {Object} dto - UpdateVentaProductoDto
 * {
 *   fecha_venta?: string,
 *   descuento_tipo_id?: number,
 *   descuento_valor?: number,
 *   nota?: string,
 *   observaciones?: string,
 *   modalidad_pago_id?: number,
 *   user_actua_id?: number
 * }
 */
export const actualizarVentaProducto = (id, dto) =>
  api.patch(`/ventas/productos/${id}`, dto).then(r => r.data);

/**
 * Eliminar una venta de producto
 * @param {number} id - ID de la venta
 */
export const eliminarVentaProducto = (id) =>
  api.delete(`/ventas/productos/${id}`).then(r => r.data);

// ============================================================
// COMPRADORES EXTERNOS
// ============================================================

/**
 * Obtener todos los compradores externos activos
 */
export const getCompradoresExternos = () =>
  api.get('/ventas/compradores-externos').then(r => r.data);

/**
 * Buscar compradores externos por nombre o DNI
 * @param {string} texto - Texto a buscar
 */
export const buscarCompradoresExternos = (texto) =>
  api.get('/ventas/compradores-externos/buscar', { params: { q: texto } }).then(r => r.data);

/**
 * Crear un comprador externo
 * @param {Object} dto - { dni: string, nombre: string, telefono?: string, email?: string, user_crea_id?: number }
 */
export const crearCompradorExterno = (dto) =>
  api.post('/ventas/compradores-externos', dto).then(r => r.data);


export const getTiposComprobante = () =>
  api.get('/ventas/tipos-comprobante').then(r => r.data);

// ============================================================
// REPORTES
// ============================================================

/**
 * Obtener reportes de ventas
 * @param {Object} filtros - { fechaInicio: string, fechaFin: string, tipo?: 'general' | 'productos' | 'servicios' }
 * @returns {Promise<{metricas: Object, ventasPorDia: Array, topItems: Array, descuentos: Array, ingresosPorResponsable: Array}>}
 */
export const getReportes = (filtros = {}) =>
  api.get('/ventas/reportes', { params: filtros }).then(r => r.data);

// ============================================================
// CATÁLOGOS
// ============================================================

/**
 * Tipos de pagador: 1=Paciente, 2=Responsable, 3=Externo
 */
export const TIPOS_PAGADOR = {
  PACIENTE: 1,
  RESPONSABLE: 2,
  EXTERNO: 3,
};

/**
 * Tipos de venta de servicio: 1=Sesión unitaria, 2=Paquete
 */
export const TIPOS_VENTA_SERVICIO = {
  SESION: 1,
  PAQUETE: 2,
};

/**
 * Tipos de descuento: 1=Porcentaje, 2=Monto fijo
 */
export const TIPOS_DESCUENTO = {
  PORCENTAJE: 1,
  MONTO_FIJO: 2,
};

/**
 * Tipos de item en venta: 1=Servicio con cita, 2=Documento sin cita
 */
export const TIPOS_ITEM_VENTA = {
  SERVICIO: 1,
  DOCUMENTO: 2,
};

