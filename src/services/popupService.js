import api from './api';

// Obtener userId del localStorage
const getUserId = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.id;
};

/**
 * Obtener el popup activo actual (público)
 */
export const obtenerPopupActivo = async () => {
  try {
    const response = await api.get('/popup/activo');
    return response.data;
  } catch (error) {
    console.error('Error al obtener popup activo:', error);
    throw error;
  }
};

/**
 * Listar todos los popups programados (admin)
 */
export const listarPopups = async () => {
  try {
    const response = await api.get('/popup/lista');
    return response.data;
  } catch (error) {
    console.error('Error al listar popups:', error);
    throw error;
  }
};

/**
 * Crear nuevo popup programado
 */
export const crearPopup = async (datos, archivo) => {
  try {
    const formData = new FormData();
    formData.append('titulo', datos.titulo);
    formData.append('fechaInicio', datos.fechaInicio);
    formData.append('fechaFin', datos.fechaFin);
    formData.append('activo', datos.activo);
    if (datos.mensajeWhatsapp) formData.append('mensajeWhatsapp', datos.mensajeWhatsapp); // 👈 NUEVO
    formData.append('imagen', archivo);
    formData.append('userId', getUserId());

    const response = await api.post('/popup/crear', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear popup:', error);
    throw error;
  }
};

/**
 * Actualizar popup existente
 */
export const actualizarPopup = async (id, datos, archivo = null) => {
  try {
    const formData = new FormData();
    if (datos.titulo) formData.append('titulo', datos.titulo);
    if (datos.fechaInicio) formData.append('fechaInicio', datos.fechaInicio);
    if (datos.fechaFin) formData.append('fechaFin', datos.fechaFin);
    if (datos.activo !== undefined) formData.append('activo', datos.activo);
    if (archivo) formData.append('imagen', archivo);
    formData.append('userId', getUserId());
    if (datos.mensajeWhatsapp !== undefined) {
      formData.append('mensajeWhatsapp', datos.mensajeWhatsapp || '');// 👈 NUEVO
    }

    const response = await api.put(`/popup/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar popup:', error);
    throw error;
  }
};

/**
 * Eliminar popup
 */
export const eliminarPopup = async (id) => {
  try {
    const response = await api.delete(`/popup/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar popup:', error);
    throw error;
  }
};

/**
 * Activar/Desactivar popup
 */
export const toggleActivoPopup = async (id, activo) => {
  try {
    const userId = getUserId(); // 👈 AGREGADO
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    const response = await api.patch(`/popup/${id}/toggle`, { 
      activo,
      userId // 👈 AGREGADO
    });
    return response.data;
  } catch (error) {
    console.error('Error al cambiar estado del popup:', error);
    throw error;
  }
};

// ===== MÉTODOS ANTIGUOS (DEPRECADOS - mantener por compatibilidad) =====

/**
 * @deprecated Usar obtenerPopupActivo() en su lugar
 */
export const obtenerConfiguracionPopup = async () => {
  return obtenerPopupActivo();
};

/**
 * @deprecated Usar crearPopup() en su lugar
 */
export const subirImagenPopup = async (archivo) => {
  console.warn('subirImagenPopup está deprecado, usa crearPopup()');
  return crearPopup({
    titulo: 'Popup sin título',
    fechaInicio: new Date().toISOString(),
    fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
    activo: true
  }, archivo);
};

/**
 * @deprecated Usar actualizarPopup() en su lugar
 */
export const actualizarConfiguracionPopup = async (configuracion) => {
  console.warn('actualizarConfiguracionPopup está deprecado, usa toggleActivoPopup()');
  throw new Error('Método deprecado. Usa toggleActivoPopup() o actualizarPopup()');
};

/**
 * @deprecated Usar eliminarPopup() en su lugar
 */
export const eliminarImagenPopup = async () => {
  console.warn('eliminarImagenPopup está deprecado, usa eliminarPopup()');
  throw new Error('Método deprecado. Usa eliminarPopup(id)');
};