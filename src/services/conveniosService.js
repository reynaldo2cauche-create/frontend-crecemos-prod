// src/services/conveniosService.js
import api from './api';

// =============== CONVENIOS ===============

/**
 * Crear un nuevo convenio con logo
 * @param {Object} convenioData - Datos del convenio
 * @param {File} [logoFile] - Archivo de imagen del logo
 */
export const crearConvenio = async (convenioData, logoFile) => {
  try {
    const formData = new FormData();
    
    // Agregar datos del convenio
    Object.keys(convenioData).forEach(key => {
      if (convenioData[key] !== null && convenioData[key] !== undefined) {
        formData.append(key, convenioData[key]);
      }
    });

    // Agregar archivo si existe
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    console.log('Enviando datos del convenio:', Object.fromEntries(formData.entries()));
    
    const response = await api.post('/convenios', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error en crearConvenio:', error);
    throw error;
  }
};

/**
 * Obtener todos los convenios
 */
export const getConvenios = async (activo) => {
  try {
    const params = activo !== undefined ? { activo } : {};
    console.log('Obteniendo convenios con params:', params);
    const response = await api.get('/convenios', { params });
    console.log('Convenios obtenidos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error en getConvenios:', error);
    throw error;
  }
};


/**
 * Obtener un convenio por ID
 */
export const getConvenioPorId = async (id) => {
  const response = await api.get(`/convenios/${id}`);
  return response.data;
};

/**
 * Actualizar un convenio con logo
 * @param {number} id - ID del convenio
 * @param {Object} convenioData - Datos a actualizar
 * @param {File} [logoFile] - Archivo de imagen del logo
 */
export const actualizarConvenio = async (id, convenioData, logoFile) => {
  const formData = new FormData();
  
  // Agregar datos del convenio
  Object.keys(convenioData).forEach(key => {
    if (convenioData[key] !== null && convenioData[key] !== undefined) {
      formData.append(key, convenioData[key]);
    }
  });

  // Agregar archivo si existe
  if (logoFile) {
    formData.append('logo', logoFile);
  }

  const response = await api.patch(`/convenios/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Eliminar un convenio
 */
export const eliminarConvenio = async (id) => {
  const response = await api.delete(`/convenios/${id}`);
  return response.data;
};

/**
 * Activar un convenio
 */
export const activarConvenio = async (id) => {
  const response = await api.put(`/convenios/${id}/activar`);
  return response.data;
};

/**
 * Desactivar un convenio
 */
export const desactivarConvenio = async (id) => {
  const response = await api.put(`/convenios/${id}/desactivar`);
  return response.data;
};

// =============== PACIENTE-CONVENIO ===============

export const asignarConvenioPaciente = async (asignacionData) => {
  const response = await api.post('/convenios/pacientes', asignacionData);
  return response.data;
};

export const getConveniosPorPaciente = async (pacienteId) => {
  try {
    const response = await api.get(`/convenios/paciente/${pacienteId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener convenios del paciente:', error);
    throw error;
  }
};

export const getPacientesPorConvenio = async (convenioId, activo) => {
  const params = activo !== undefined ? { activo } : {};
  const response = await api.get(`/convenios/pacientes/por-convenio/${convenioId}`, { params });
  return response.data;
};

export const getPacienteConvenioPorId = async (id) => {
  const response = await api.get(`/convenios/pacientes/${id}`);
  return response.data;
};

export const actualizarPacienteConvenio = async (id, datos) => {
  const response = await api.patch(`/convenios/pacientes/${id}`, datos);
  return response.data;
};

export const eliminarPacienteConvenio = async (id) => {
  const response = await api.delete(`/convenios/pacientes/${id}`);
  return response.data;
};

export const activarPacienteConvenio = async (id) => {
  const response = await api.put(`/convenios/pacientes/${id}/activar`);
  return response.data;
};

export const desactivarPacienteConvenio = async (id) => {
  const response = await api.put(`/convenios/pacientes/${id}/desactivar`);
  return response.data;
};

// =============== BENEFICIOS ===============

/**
 * Crear un nuevo beneficio
 */
export const crearBeneficio = async (beneficioData) => {
  try {
    const response = await api.post('/convenios/beneficios', beneficioData);
    return response.data;
  } catch (error) {
    console.error('Error en crearBeneficio:', error);
    throw error;
  }
};

/**
 * Obtener todos los beneficios
 */
export const getBeneficios = async (activo) => {
  try {
    const params = activo !== undefined ? { activo } : {};
    const response = await api.get('/convenios/beneficios', { params });
    return response.data;
  } catch (error) {
    console.error('Error en getBeneficios:', error);
    throw error;
  }
};

/**
 * Obtener un beneficio por ID
 */
export const getBeneficioPorId = async (id) => {
  const response = await api.get(`/convenios/beneficios/${id}`);
  return response.data;
};

/**
 * Actualizar un beneficio
 */
export const actualizarBeneficio = async (id, beneficioData) => {
  try {
    console.log('🌐 [SERVICE] Actualizando beneficio ID:', id);
    console.log('🌐 [SERVICE] Datos:', beneficioData);
    console.log('🌐 [SERVICE] URL:', `/convenios/beneficios/${id}`);

    const response = await api.patch(`/convenios/beneficios/${id}`, beneficioData);

    console.log('✅ [SERVICE] Respuesta recibida:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [SERVICE] Error en actualizarBeneficio:', error);
    console.error('❌ [SERVICE] Error response:', error.response);
    throw error;
  }
};

/**
 * Eliminar un beneficio
 */
export const eliminarBeneficio = async (id) => {
  const response = await api.delete(`/convenios/beneficios/${id}`);
  return response.data;
};

/**
 * Activar un beneficio
 */
export const activarBeneficio = async (id) => {
  const response = await api.put(`/convenios/beneficios/${id}/activar`);
  return response.data;
};

/**
 * Desactivar un beneficio
 */
export const desactivarBeneficio = async (id) => {
  const response = await api.put(`/convenios/beneficios/${id}/desactivar`);
  return response.data;
};

/**
 * Obtener beneficios por convenio
 */
export const getBeneficiosPorConvenio = async (convenioId, activo) => {
  const params = { convenio_id: convenioId };
  if (activo !== undefined) {
    params.activo = activo;
  }
  const response = await api.get('/convenios/beneficios', { params });
  return response.data;
};

/**
 * Obtener categorías de beneficios
 */
export const getCategoriasBeneficios = async () => {
  try {
    const response = await api.get('/convenios/categorias-beneficios');
    return response.data;
  } catch (error) {
    console.error('Error en getCategoriasBeneficios:', error);
    throw error;
  }
};

// =============== FUNCIONES AUXILIARES ===============

export const getConveniosActivos = async () => {
  return await getConvenios(true);
};

export const getConveniosInactivos = async () => {
  return await getConvenios(false);
};

export const verificarPacienteTieneConvenio = async (pacienteId, convenioId) => {
  try {
    const convenios = await getConveniosPorPaciente(pacienteId);
    return convenios.some(pc => pc.convenio_id === convenioId && pc.activo);
  } catch (error) {
    console.error('Error verificando convenio del paciente:', error);
    return false;
  }
};

export const getConveniosActivosPorPaciente = async (pacienteId) => {
  const convenios = await getConveniosPorPaciente(pacienteId);
  return convenios.filter(pc => pc.activo);
};