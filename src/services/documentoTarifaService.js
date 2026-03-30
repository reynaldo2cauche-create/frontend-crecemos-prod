import api from './api';

const DOCUMENTO_TARIFA_BASE = '/inventario/documentos-tarifa';

/**
 * Servicio para manejo de Documentos Tarifados (vendibles sin cita)
 */

/**
 * Obtener todos los documentos tarifados activos
 * @returns {Promise<Array>} Lista de documentos tarifados
 */
export const getDocumentosTarifa = async () => {
  const res = await api.get(DOCUMENTO_TARIFA_BASE);
  return res.data;
};

/**
 * Obtener todos los documentos tarifados (incluidos inactivos)
 * @returns {Promise<Array>} Lista completa de documentos tarifados
 */
export const getDocumentosTarifaAll = async () => {
  const res = await api.get(`${DOCUMENTO_TARIFA_BASE}/all-including-inactive`);
  return res.data;
};

/**
 * Obtener un documento tarifado por ID
 * @param {number} id - ID del documento
 * @returns {Promise<Object>} Documento tarifado
 */
export const getDocumentoTarifaById = async (id) => {
  const res = await api.get(`${DOCUMENTO_TARIFA_BASE}/${id}`);
  return res.data;
};

/**
 * Crear nuevo documento tarifado
 * @param {Object} dto - Datos del documento
 * @param {number} dto.tipo_archivo_id - ID del tipo de archivo
 * @param {string} dto.nombre - Nombre del documento vendible
 * @param {string} [dto.descripcion] - Descripción del documento
 * @param {number} dto.precio - Precio del documento
 * @param {number} [dto.user_crea_id] - ID del usuario creador
 * @returns {Promise<Object>} Documento creado
 */
export const crearDocumentoTarifa = async (dto) => {
  const res = await api.post(DOCUMENTO_TARIFA_BASE, dto);
  return res.data;
};

/**
 * Actualizar documento tarifado
 * @param {number} id - ID del documento
 * @param {Object} dto - Datos a actualizar
 * @returns {Promise<Object>} Documento actualizado
 */
export const actualizarDocumentoTarifa = async (id, dto) => {
  const res = await api.patch(`${DOCUMENTO_TARIFA_BASE}/${id}`, dto);
  return res.data;
};

/**
 * Desactivar documento tarifado
 * @param {number} id - ID del documento
 * @param {number} [userActuaId] - ID del usuario que desactiva
 * @returns {Promise<Object>} Documento desactivado
 */
export const desactivarDocumentoTarifa = async (id, userActuaId) => {
  const res = await api.patch(`${DOCUMENTO_TARIFA_BASE}/${id}/desactivar`, {
    user_actua_id: userActuaId,
  });
  return res.data;
};

/**
 * Activar documento tarifado
 * @param {number} id - ID del documento
 * @param {number} [userActuaId] - ID del usuario que activa
 * @returns {Promise<Object>} Documento activado
 */
export const activarDocumentoTarifa = async (id, userActuaId) => {
  const res = await api.patch(`${DOCUMENTO_TARIFA_BASE}/${id}/activar`, {
    user_actua_id: userActuaId,
  });
  return res.data;
};
