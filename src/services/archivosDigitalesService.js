import api from './api';

// Obtener tipos de archivo
export const getTiposArchivo = async () => {
  const response = await api.get('/archivos-digitales/tipos');
  return response.data;
};

// Subir archivo digital
export const subirArchivo = async (formData) => {
  const response = await api.post('/archivos-digitales', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Obtener archivos de un paciente
export const getArchivosPorPaciente = async (pacienteId) => {
  const response = await api.get(`/archivos-digitales?pacienteId=${pacienteId}`);
  return response.data;
};

// Eliminar archivo
export const eliminarArchivo = async (archivoId) => {
  const response = await api.delete(`/archivos-digitales/${archivoId}`);
  return response.data;
};

// Descargar archivo
export const descargarArchivo = async (archivoId) => {
  const response = await api.get(`/archivos-digitales/${archivoId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

export const validarDocumentoPorCodigo = async (codigo) => {
  const response = await api.get(`/archivos-digitales/verificar/${codigo}`);
  return response.data;
};