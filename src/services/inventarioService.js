import api from './api';

// ============================================================
// INVENTARIO — CATEGORÍAS
// ============================================================

export const getCategorias = (todos = false) =>
  api.get('/inventario/categorias', { params: todos ? { todos: 'true' } : {} }).then(r => r.data);

export const getCategoriaById = (id) =>
  api.get(`/inventario/categorias/${id}`).then(r => r.data);

export const crearCategoria = (dto) =>
  api.post('/inventario/categorias', dto).then(r => r.data);

export const actualizarCategoria = (id, dto) =>
  api.put(`/inventario/categorias/${id}`, dto).then(r => r.data);

export const desactivarCategoria = (id, user_id) =>
  api.patch(`/inventario/categorias/${id}/desactivar`, { user_id }).then(r => r.data);

export const activarCategoria = (id, user_id) =>
  api.patch(`/inventario/categorias/${id}/activar`, { user_id }).then(r => r.data);

// ============================================================
// INVENTARIO — PROVEEDORES
// ============================================================

export const getProveedores = (todos = false) =>
  api.get('/inventario/proveedores', { params: todos ? { todos: 'true' } : {} }).then(r => r.data);

export const getProveedorById = (id) =>
  api.get(`/inventario/proveedores/${id}`).then(r => r.data);

export const crearProveedor = (dto) =>
  api.post('/inventario/proveedores', dto).then(r => r.data);

export const actualizarProveedor = (id, dto) =>
  api.put(`/inventario/proveedores/${id}`, dto).then(r => r.data);

export const desactivarProveedor = (id, user_id) =>
  api.patch(`/inventario/proveedores/${id}/desactivar`, { user_id }).then(r => r.data);

export const activarProveedor = (id, user_id) =>
  api.patch(`/inventario/proveedores/${id}/activar`, { user_id }).then(r => r.data);

// ============================================================
// INVENTARIO — TIPOS DE PRODUCTO
// ============================================================

export const getTiposProducto = () =>
  api.get('/inventario/tipos-producto').then(r => r.data);

// ============================================================
// INVENTARIO — PRODUCTOS
// ============================================================

export const getProductos = (todos = false) =>
  api.get('/inventario/productos', { params: todos ? { todos: 'true' } : {} }).then(r => r.data);

export const getProductoById = (id) =>
  api.get(`/inventario/productos/${id}`).then(r => r.data);

export const getProductosStockBajo = () =>
  api.get('/inventario/productos/stock-bajo').then(r => r.data);

export const getProductosPorCategoria = (categoriaId) =>
  api.get(`/inventario/productos/por-categoria/${categoriaId}`).then(r => r.data);

export const crearProducto = (dto) =>
  api.post('/inventario/productos', dto).then(r => r.data);

export const actualizarProducto = (id, dto) =>
  api.put(`/inventario/productos/${id}`, dto).then(r => r.data);

export const desactivarProducto = (id, user_id) =>
  api.patch(`/inventario/productos/${id}/desactivar`, { user_id }).then(r => r.data);

export const activarProducto = (id, user_id) =>
  api.patch(`/inventario/productos/${id}/activar`, { user_id }).then(r => r.data);

// ============================================================
// INVENTARIO — COMPRAS DE REPOSICIÓN
// ============================================================

export const getComprasReposicion = () =>
  api.get('/inventario/compras').then(r => r.data);

export const getCompraReposicionById = (id) =>
  api.get(`/inventario/compras/${id}`).then(r => r.data);

/**
 * dto: {
 *   proveedor_id, fecha_compra, nota?,
 *   detalles: [{ producto_id, cantidad, precio_unitario }],
 *   user_crea_id?
 * }
 */
export const crearCompraReposicion = (dto) =>
  api.post('/inventario/compras', dto).then(r => r.data);


// ============================================================
// INVENTARIO — TARIFAS DE SERVICIO
// Añadir estas funciones al inventarioService.js existente
// ============================================================

export const getTarifas = (todos = false) =>
  api.get('/inventario/tarifas', { params: todos ? { todos: 'true' } : {} }).then(r => r.data);

export const getTarifasByServicio = (servicioId) =>
  api.get(`/inventario/tarifas/servicio/${servicioId}`).then(r => r.data);

export const getPrecioTarifa = (servicio_id, motivo_cita_id) =>
  api.get('/inventario/tarifas/precio', { params: { servicio_id, motivo_cita_id } }).then(r => r.data);

export const crearTarifa = (dto) =>
  api.post('/inventario/tarifas', dto).then(r => r.data);

export const actualizarTarifa = (id, dto) =>
  api.put(`/inventario/tarifas/${id}`, dto).then(r => r.data);

export const desactivarTarifa = (id, user_id) =>
  api.patch(`/inventario/tarifas/${id}/desactivar`, { user_id }).then(r => r.data);

export const activarTarifa = (id, user_id) =>
  api.patch(`/inventario/tarifas/${id}/activar`, { user_id }).then(r => r.data);

// ============================================================
// INVENTARIO — PRECIOS DE PAQUETES POR SERVICIO
// ============================================================

export const getPreciosPaquetes = () =>
  api.get('/servicio-paquete-precio').then(r => r.data);

export const getPreciosPaquetesByServicioTarifa = (servicioTarifaId) =>
  api.get(`/servicio-paquete-precio/servicio-tarifa/${servicioTarifaId}`).then(r => r.data);

export const getPrecioPaqueteById = (id) =>
  api.get(`/servicio-paquete-precio/${id}`).then(r => r.data);

/**
 * dto: {
 *   servicio_tarifa_id, paquete_id,
 *   tipo_calculo: 'precio_total' | 'descuento_porcentaje',
 *   valor,
 *   user_crea_id?
 * }
 */
export const crearPrecioPaquete = (dto) =>
  api.post('/servicio-paquete-precio', dto).then(r => r.data);

export const actualizarPrecioPaquete = (id, dto) =>
  api.put(`/servicio-paquete-precio/${id}`, dto).then(r => r.data);

export const eliminarPrecioPaquete = (id) =>
  api.delete(`/servicio-paquete-precio/${id}`).then(r => r.data);

// ============================================================
// INVENTARIO — PAQUETES COMBO
// ============================================================

export const getPaquetesCombo = (todos = false) =>
  api.get('/inventario/paquete-combo', { params: todos ? { todos: 'true' } : {} }).then(r => r.data);

export const getPaqueteComboById = (id) =>
  api.get(`/inventario/paquete-combo/${id}`).then(r => r.data);

/**
 * dto: {
 *   nombre, descripcion?, precio_total, precio_tachado?,
 *   flg_activo?,
 *   items: [{ servicio_tarifa_id?, documento_tarifa_id?, cantidad, descripcion_linea? }]
 * }
 */
export const crearPaqueteCombo = (dto) =>
  api.post('/inventario/paquete-combo', dto).then(r => r.data);

export const actualizarPaqueteCombo = (id, dto) =>
  api.patch(`/inventario/paquete-combo/${id}`, dto).then(r => r.data);

export const eliminarPaqueteCombo = (id) =>
  api.delete(`/inventario/paquete-combo/${id}`).then(r => r.data);

export const toggleActivoPaqueteCombo = (id) =>
  api.patch(`/inventario/paquete-combo/${id}/toggle-activo`).then(r => r.data);