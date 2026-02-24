import api from './api';

export const buscarPacientes = async (query) => {
  const response = await api.get(`/pacientes/buscar?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const getPacientes = async (url = '/pacientes') => {
  const response = await api.get(url);
  return response.data;
};

export const getPacientesAll = async (url = '/pacientes/all') => {
  const response = await api.get(url);
  return response.data;
};


export const getPacienteById = async (id) => {
  const response = await api.get(`/pacientes/${id}`);
  return response.data;
};

export const createPaciente = async (pacienteData) => {
  const response = await api.post('/pacientes/completo', pacienteData);
  return response.data;
};

export const updatePacienteById = async (id, data) => {
  const response = await api.patch(`/pacientes/${id}`, data);
  return response.data;
};

export const asignarServicioPaciente = async ({ paciente_id, servicio_id, user_id_actua }) => {
  const response = await api.post('/paciente-servicio/asignar', {
    paciente_id,
    servicio_id,
    user_id_actua
  });
  return response.data;
};

export const desasignarServicioPaciente = async (pacienteId, servicioId, userId) => {
  const response = await api.delete(`/paciente-servicio/paciente/${pacienteId}/servicio/${servicioId}`, {
    data: { user_id_actua: userId }
  });
  return response.data;
};

export const getServiciosPorPaciente = async (id) => {
  // Agregar timestamp para evitar cache
  const timestamp = new Date().getTime();
  const response = await api.get(`/paciente-servicio/paciente/${id}?_t=${timestamp}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
  return response.data;
};

export const checkDocumentoExists = async (numeroDocumento) => {
  const response = await api.get(`/pacientes/check-documento/${numeroDocumento}`);
  return response.data;
};

export const getEstadosPaciente = async () => {
  const response = await api.get('/estados-paciente');
  return response.data;
};

export const cambiarEstadoPaciente = async (pacienteId, estadoPacienteId, userId) => {
  const response = await api.patch(`/pacientes/${pacienteId}/estado`, {
    estado_paciente_id: estadoPacienteId,
    user_id_actua: userId
  });
  return response.data;
};

export const cambiarVisibilidadPaciente = async (pacienteId, mostrarEnListado, userId) => {
  const response = await api.patch(`/pacientes/${pacienteId}/visibilidad`, {
    mostrarEnListado,
    userId
  });
  return response.data;
};

export const verificarPacienteYObtenerBeneficios = async (numeroDocumento) => {
  const response = await api.get(`/pacientes/beneficios/${numeroDocumento}`);
  return response.data;
}

export const getEstadisticasPacientes = async () => {
  const response = await api.get('/pacientes/estadisticas');
  return response.data;
}

export const getResponsablesPorPaciente = async (pacienteId) => {
  const response = await api.get(`/pacientes/${pacienteId}/responsables`);
  return response.data;
}

/**
 * Buscar responsable por DNI (solo devuelve nombre y apellidos para autocompletar)
 * Similar a SUNAT - autocompleta datos básicos pero el resto se llena manualmente
 */
export const buscarResponsablePorDni = async (pacienteId, dni) => {
  try {
    const response = await api.get(`/pacientes/${pacienteId}/responsables/buscar-por-dni/${dni}`);
    return response.data;
  } catch (error) {
    console.error('Error al buscar responsable:', error);
    return { success: false, data: null };
  }
}

// 🆕 Obtener TODOS los responsables (para venta de servicios)
export const getTodosLosResponsables = async () => {
  try {
    const response = await api.get('/responsables');
    return response.data;
  } catch (error) {
    console.error('Error al obtener responsables:', error);
    throw error;
  }
};

// 🆕 Obtener pacientes a cargo de un responsable
export const getPacientesPorResponsable = async (responsableId) => {
  try {
    const response = await api.get(`/responsables/${responsableId}/pacientes`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener pacientes del responsable:', error);
    throw error;
  }
};

export const getProcesosLegalesInfantiles = async () => {
  const response = await api.get('/procesos-legales-infantiles');
  return response.data;
}
