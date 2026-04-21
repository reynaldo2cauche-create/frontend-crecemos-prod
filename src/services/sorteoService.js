import api from './api';

/**
 * 🎲 Servicio de Sorteos - Sistema Manual
 * Los pacientes se agregan manualmente al sorteo
 */

// ==================== TIPOS ====================

/**
 * @typedef {Object} GanadorDto
 * @property {number} paciente_id
 * @property {number} posicion
 */

/**
 * @typedef {Object} RealizarSorteoDto
 * @property {string} nombre
 * @property {string} [descripcion]
 * @property {string} fecha_inicio - ISO 8601
 * @property {string} fecha_fin
 * @property {string} fecha_sorteo
 * @property {number} cantidad_ganadores
 * @property {GanadorDto[]} ganadores
 */

/**
 * @typedef {Object} SorteoDetalle
 * @property {number} id
 * @property {string} nombre
 * @property {string} [descripcion]
 * @property {string} fecha_inicio
 * @property {string} fecha_fin
 * @property {string} fecha_sorteo
 * @property {number} cantidad_ganadores
 * @property {any[]} ganadores
 * @property {string} createdAt
 * @property {string} [registrado_por] - Nombre del usuario que registró
 */

/**
 * @typedef {Object} HistorialResponse
 * @property {SorteoDetalle[]} data
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 * @property {number} totalPages
 */

// ==================== FUNCIONES ====================

/**
 * 🎲 Realizar sorteo completo (crear sorteo Y guardar ganadores)
 * Ejecuta el sorteo y guarda los resultados inmediatamente
 */
export const realizarSorteo = async (sorteoData) => {
  try {
    const response = await api.post('/sorteos/realizar', sorteoData);
    return response.data;
  } catch (error) {
    console.error('❌ Error al realizar sorteo:', error);
    throw error;
  }
};

/**
 * 📚 Obtener historial de sorteos con paginación
 */
export const obtenerHistorial = async (params) => {
  try {
    const response = await api.get('/sorteos/historial', {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener historial:', error);
    throw error;
  }
};

/**
 * 🔍 Obtener detalle de un sorteo específico
 */
export const obtenerDetalle = async (id) => {
  try {
    const response = await api.get(`/sorteos/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener detalle del sorteo:', error);
    throw error;
  }
};

/**
 * 🗑️ Eliminar un sorteo
 */
export const eliminarSorteo = async (id) => {
  try {
    await api.delete(`/sorteos/${id}`);
  } catch (error) {
    console.error('❌ Error al eliminar sorteo:', error);
    throw error;
  }
};

/**
 * 📄 Descargar PDF de resultados del sorteo (generado en el frontend)
 */
export const descargarArchivoPDF = async (id) => {
  try {
    // Importar la función de generación de PDF
    const { generarSorteoPDF } = await import('../utils/generarSorteoPDF');

    // Obtener los datos del sorteo
    const sorteo = await obtenerDetalle(id);

    // Generar y descargar el PDF
    await generarSorteoPDF(sorteo);
  } catch (error) {
    console.error('❌ Error al descargar PDF:', error);
    throw error;
  }
};

// ==================== SORTEOS MANUALES (DOS FASES) ====================

/**
 * 🎯 Crear un sorteo manual (estado: preparación)
 * Solo requiere nombre y descripción opcional
 */
export const crearSorteoManual = async (data) => {
  try {
    const response = await api.post('/sorteos/manual', {
      nombre: data.nombre,
      descripcion: data.descripcion,
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear sorteo manual:', error);
    throw error;
  }
};

/**
 * 📚 Obtener sorteos en preparación
 */
export const obtenerSorteosEnPreparacion = async () => {
  try {
    const response = await api.get('/sorteos/en-preparacion');
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener sorteos en preparación:', error);
    throw error;
  }
};

/**
 * ➕ Agregar un participante a un sorteo manual
 */
export const agregarParticipante = async (sorteoId, pacienteId) => {
  try {
    const response = await api.post(`/sorteos/${sorteoId}/participantes`, {
      paciente_id: pacienteId,
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error al agregar participante:', error);
    throw error;
  }
};

/**
 * ➕ Agregar múltiples participantes a un sorteo manual
 */
export const agregarMultiplesParticipantes = async (sorteoId, pacientesIds) => {
  try {
    const response = await api.post(`/sorteos/${sorteoId}/participantes/multiples`, {
      pacientes_ids: pacientesIds,
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error al agregar múltiples participantes:', error);
    throw error;
  }
};

/**
 * 📋 Obtener participantes de un sorteo manual
 */
export const obtenerParticipantes = async (sorteoId) => {
  try {
    const response = await api.get(`/sorteos/${sorteoId}/participantes`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener participantes:', error);
    throw error;
  }
};

/**
 * ➖ Eliminar UNA entrada de un participante de un sorteo manual
 * @param {number} sorteoId - ID del sorteo
 * @param {number} entradaId - ID de la entrada específica a eliminar
 */
export const eliminarParticipante = async (sorteoId, entradaId) => {
  try {
    const response = await api.delete(`/sorteos/${sorteoId}/participantes/${entradaId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al eliminar participante:', error);
    throw error;
  }
};

/**
 * 🎉 Finalizar sorteo manual (guardar ganadores)
 */
export const finalizarSorteoManual = async (sorteoId, ganadores) => {
  try {
    const ganadoresFormateados = ganadores.map((g, index) => ({
      paciente_id: g.paciente_id || g.id,
      posicion: g.posicion || index + 1,
    }));

    console.log('📤 Enviando al backend:', {
      sorteoId,
      ganadores: ganadoresFormateados
    });

    const response = await api.post(`/sorteos/${sorteoId}/finalizar`, {
      ganadores: ganadoresFormateados,
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error al finalizar sorteo manual:', error);
    console.error('❌ Response data:', error.response?.data);
    console.error('❌ Response status:', error.response?.status);
    throw error;
  }
};