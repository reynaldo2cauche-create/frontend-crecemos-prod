import api from './api';

class PostulacionesService {
  // CREAR POSTULACIÓN (para el formulario público)
 async crearPostulacion(formData) {
    try {
      
      // Verificar que el archivo existe antes de enviar
      const cvFile = formData.get('cv');
      if (!cvFile || !(cvFile instanceof File)) {
        throw new Error('No se ha seleccionado un archivo CV válido');
      }
      
      // 🔍 DEBUGGING: Verificar TODO lo que contiene el FormData
      console.log('📦 Contenido del FormData antes de enviar:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: [File] ${value.name} (${value.size} bytes, type: ${value.type})`);
        } else {
          console.log(`  ${key}: "${value}" (type: ${typeof value}, length: ${value.length})`);
        }
      }
      
      const response = await api.post('/postulaciones', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      // Log detallado del error
      if (error.response?.data) {
        console.error('Mensaje de error:', error.response.data.message);
        console.error('Error completo:', JSON.stringify(error.response.data, null, 2));
      }
      
      // ✅ Mejor manejo de arrays de errores
      let errorMessage;
      if (Array.isArray(error.response?.data?.message)) {
        errorMessage = error.response.data.message.join(', ');
      } else {
        errorMessage = error.response?.data?.message || 
          error.response?.data?.error || 
          error.message ||
          'Error al crear la postulación';
      }
      
      throw new Error(errorMessage);
    }
  }
  
  
   async obtenerCargos() {
    try {
      const response = await api.get('/cargos-postulacion');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        'Error al obtener los cargos';
      console.error('Error en obtenerCargos:', error);
      throw new Error(errorMessage);
    }
  }

  // Obtener todos los estados activos
  async obtenerEstados() {
    try {
      const response = await api.get('/estados-postulacion');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        'Error al obtener los estados';
      console.error('Error en obtenerEstados:', error);
      throw new Error(errorMessage);
    }
  }

  // Obtener todas las postulaciones con filtros
  async obtenerPostulaciones(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      // Mapear los filtros del dashboard a los parámetros del backend
      if (filtros.search) {
        params.append('search', filtros.search);
      }
      if (filtros.estado_postulacion) {
        params.append('estado', filtros.estado_postulacion);
      }
      if (filtros.distrito) {
        params.append('distrito', filtros.distrito);
      }
      if (filtros.cargo_postulado) {
        params.append('cargo', filtros.cargo_postulado);
      }
      if (filtros.fechaInicio) {
        params.append('fechaInicio', filtros.fechaInicio);
      }
      if (filtros.fechaFin) {
        params.append('fechaFin', filtros.fechaFin);
      }

      const queryString = params.toString();
      const url = queryString ? `/postulaciones?${queryString}` : '/postulaciones';
      
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        error.response?.data?.error || 
        'Error al obtener las postulaciones';
      
      console.error('Error en obtenerPostulaciones:', error.response?.data);
      throw new Error(errorMessage);
    }
  }

  // Obtener estadísticas
  async obtenerEstadisticas() {
    try {
      const response = await api.get('/postulaciones/estadisticas');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        'Error al obtener estadísticas';
      throw new Error(errorMessage);
    }
  }

   async obtenerEstadisticasPorEstados() {
    try {
      const response = await api.get('/postulaciones/estadisticas-por-estados');
      console.log('Respuesta de estadísticas por estados:', response.data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        'Error al obtener estadísticas';
      throw new Error(errorMessage);
    }
  }


  // Obtener una postulación por ID
  async obtenerPostulacionPorId(id) {
    try {
      const response = await api.get(`/postulaciones/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        'Error al obtener la postulación';
      throw new Error(errorMessage);
    }
  }

  // Obtener comentarios de una postulación
  async obtenerComentarios(idPostulacion) {
    try {
      const response = await api.get(`/postulaciones/${idPostulacion}/comentarios`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        'Error al obtener comentarios';
      console.error('Error en obtenerComentarios:', error);
      throw new Error(errorMessage);
    }
  }

  // Agregar comentario
  async agregarComentario(idPostulacion, idTrabajador, comentario) {
    try {
      const response = await api.post('/postulaciones/comentarios', {
        id_postulacion: idPostulacion,
        id_trabajador: idTrabajador,
        comentario: comentario
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        'Error al agregar comentario';
      console.error('Error en agregarComentario:', error);
      throw new Error(errorMessage);
    }
  }

  // Actualizar estado de postulación
  async actualizarEstado(id, nuevoEstado) {
    try {
      const response = await api.patch(`/postulaciones/${id}`, { 
        estado_postulacion: nuevoEstado 
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        'Error al actualizar el estado';
      console.error('Error en actualizarEstado:', error);
      throw new Error(errorMessage);
    }
  }

  // Actualizar postulación completa
  async actualizarPostulacion(id, datos) {
    try {
      const response = await api.patch(`/postulaciones/${id}`, datos);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        'Error al actualizar la postulación';
      throw new Error(errorMessage);
    }
  }

  // Eliminar postulación
  async eliminarPostulacion(id) {
    try {
      const response = await api.delete(`/postulaciones/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        'Error al eliminar la postulación';
      console.error('Error en eliminarPostulacion:', error);
      throw new Error(errorMessage);
    }
  }

  // Obtener CV (blob URL para visualizar)
  async obtenerCV(id) {
    try {
      const response = await api.get(`/postulaciones/${id}/cv`, {
        responseType: 'blob',
      });
      
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      return pdfUrl;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        'Error al obtener el CV';
      console.error('Error en obtenerCV:', error);
      throw new Error(errorMessage);
    }
  }

  // Descargar CV
  async descargarCV(id, nombrePostulante = 'cv') {
    try {
      const response = await api.get(`/postulaciones/${id}/cv/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CV_${nombrePostulante.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'CV descargado correctamente' };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        'Error al descargar el CV';
      console.error('Error en descargarCV:', error);
      throw new Error(errorMessage);
    }
  }
  


  // Limpiar URL blob
  limpiarUrlBlob(url) {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
  
}

export default new PostulacionesService();