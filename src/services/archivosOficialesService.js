// ============================================
// src/services/archivosOficialesService.js
// ============================================
import api from './api';
import { downloadPDFWithWatermark } from '../utils/pdfWatermark';

const API_PATH = '/archivos-oficiales';

const archivosOficialesService = {
  /**
   * Subir archivo oficial
   * @param {File} file - Archivo a subir
   * @param {Object} data - Datos del archivo
   */
 subirArchivo: async (file, data) => {
  try {
    const formData = new FormData();
    formData.append('archivo', file);
    
    // ✅ SOLO AGREGAR SI TIENE VALOR (no undefined, no "", no null)
    if (data.pacienteId) {
      formData.append('pacienteId', data.pacienteId);
    }
    
    if (data.trabajadorId) {
      formData.append('trabajadorId', data.trabajadorId);
    }
    
    // Campos obligatorios
    formData.append('terapeutaId', data.terapeutaId);
    formData.append('tipoArchivoId', data.tipoArchivoId);
    formData.append('fechaEmision', data.fechaEmision);
    
    // Campos opcionales
    if (data.fechaVigencia) {
      formData.append('fechaVigencia', data.fechaVigencia);
    }
    
    if (data.descripcion) {
      formData.append('descripcion', data.descripcion);
    }
    
    if (data.codigoManual) {
      formData.append('codigoManual', data.codigoManual);
    }

    const response = await api.post(`${API_PATH}/subir`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
},

  /**
   * Listar archivos oficiales
   * @param {number} pacienteId - ID del paciente (opcional)
   */
  listarArchivos: async (pacienteId = null) => {
    try {
      const params = pacienteId ? { pacienteId } : {};
      const response = await api.get(API_PATH, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Descargar archivo
   * @param {number} id - ID del archivo
   */
  descargarArchivo: async (id, customFilename = null) => {
    try {
      const response = await api.get(`${API_PATH}/${id}/descargar`, {
        responseType: 'blob',
      });

      const contentDisposition = response.headers['content-disposition'];
      const contentType = response.headers['content-type'] || 'application/octet-stream';

      // Extraer extensión del header o del content-type
      let extension = '';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match?.[1]) {
          const original = match[1].replace(/['"]/g, '');
          const ext = original.match(/\.[^.]+$/);
          if (ext) extension = ext[0];
        }
      }
      if (!extension) {
        if (contentType.includes('pdf'))                          extension = '.pdf';
        else if (contentType.includes('png'))                     extension = '.png';
        else if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = '.jpg';
        else if (contentType.includes('word') || contentType.includes('docx')) extension = '.docx';
      }

      const filename = customFilename ? `${customFilename}${extension}` : `archivo_descargado${extension}`;

      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (error) {
      console.error('Error al descargar:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Visualizar archivo en nueva pestaña
   * @param {number} id - ID del archivo
   */
  visualizarArchivo: async (id) => {
    try {
      const response = await api.get(`${API_PATH}/${id}/descargar`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/pdf'
      });

      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      // Limpiar después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

      return { success: true };
    } catch (error) {
      console.error('Error al visualizar:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Eliminar archivo (soft delete)
   * @param {number} id - ID del archivo
   */
  eliminarArchivo: async (id) => {
    try {
      const response = await api.delete(`${API_PATH}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Validar documento (público - sin autenticación)
   * @param {string} codigo - Código de validación
   */
  validarDocumento: async (codigo) => {
    try {
      const response = await api.post(`${API_PATH}/validar`, { 
        codigo: codigo.toUpperCase() 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Validar documento por URL (público)
   * @param {string} codigo - Código de validación
   */
  validarDocumentoPorUrl: async (codigo) => {
    try {
      const response = await api.get(`${API_PATH}/validar/${codigo.toUpperCase()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Descargar archivo validado (público - sin autenticación) con marca de agua
   * @param {number} id - ID del archivo
   * @param {string} codigo - Código del documento para la marca de agua
   */
  descargarArchivoValidado: async (id, codigo = '', nombrePersonalizado = '') => {
    try {
      console.log('Descargando archivo validado ID:', id);
      const response = await api.get(`${API_PATH}/descargar-validado/${id}`, {
        responseType: 'blob',
      });

      console.log('Respuesta recibida:', response);

      let filename = nombrePersonalizado ? `${nombrePersonalizado}.pdf` : 'documento_oficial.pdf';

      if (!nombrePersonalizado) {
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
          }
        }
      }

      console.log('Nombre del archivo:', filename);

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/pdf'
      });

      console.log('Blob creado, tamaño:', blob.size);
      console.log('Agregando marca de agua...');

      // Agregar marca de agua distribuida en todas las páginas
      const result = await downloadPDFWithWatermark(blob, filename, {
        codigo: codigo,
        opacity: 0.08,
        logoPath: '/videologo.png',
        logoWidth: 180,
        logoHeight: 180,
        rotation: 45,
        distributeAcrossPage: true
      });

      console.log('Descarga completada con marca de agua');
      return result;
    } catch (error) {
      console.error('Error detallado al descargar:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);

      // Construir un error más descriptivo
      const errorInfo = {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: `${API_PATH}/descargar-validado/${id}`,
        id: id
      };

      throw errorInfo;
    }
  },

  /**
   * Marcar entrega del archivo (fisico o digital)
   * @param {number} id - ID del archivo
   * @param {'fisico'|'digital'} tipoEntrega - Tipo de entrega
   */
  marcarEntrega: async (id, tipoEntrega) => {
    try {
      const response = await api.patch(`${API_PATH}/${id}/entrega`, { tipoEntrega });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Generar código de validación preview
   */
  generarCodigoPreview: async () => {
    try {
      const response = await api.get(`${API_PATH}/generar-codigo`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default archivosOficialesService;