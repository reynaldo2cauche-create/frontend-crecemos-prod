import api from './api';

// Obtener todos los trabajadores
export const getTrabajadores = async () => {
  const response = await api.get('/trabajadores');
  return response.data;
};

// Crear trabajador
export const crearTrabajador = async (data) => {
  const response = await api.post('/trabajadores', data);
  return response.data;
};

// Obtener roles
export const getRoles = async () => {
  const response = await api.get('/roles');
  return response.data;
};

// Obtener especialidades
export const getEspecialidades = async () => {
  const response = await api.get('/especialidades');
  return response.data;
};

// Obtener cargos
export const getCargos = async () => {
  const response = await api.get('/cargos');
  return response.data;
};

// Activar trabajador
export const activarTrabajador = async (id) => {
  const response = await api.put(`/trabajadores/${id}/activar`);
  return response.data;
};

// Desactivar trabajador
export const desactivarTrabajador = async (id) => {
  const response = await api.put(`/trabajadores/${id}/desactivar`);
  return response.data;
};

// Obtener trabajador por ID
export const getTrabajadorById = async (id) => {
  const response = await api.get(`/trabajadores/${id}`);
  return response.data;
};

// Actualizar trabajador
export const updateTrabajador = async (id, data) => {
  const response = await api.patch(`/trabajadores/${id}`, data);
  return response.data;
};

// Obtener lista de trabajadores para select
export const getTrabajadoresSelect = async () => {
  try {
    const response = await api.get('/trabajadores/select');
    return response.data;
  } catch (error) {
    console.error('Error al obtener trabajadores:', error);
    throw error;
  }
};

// Obtener perfil del usuario autenticado
export const getMyProfile = async () => {
  const response = await api.get('/trabajadores/perfil/me');
  return response.data;
};

// Actualizar perfil del usuario autenticado
export const updateMyProfile = async (data) => {
  const response = await api.patch('/trabajadores/perfil/me', data);
  return response.data;
};

// Obtener estado de bloqueo de campos del perfil
export const getCamposBloqueados = async () => {
  const response = await api.get('/trabajadores/perfil/me/campos-bloqueados');
  return response.data;
};

// ============== FUNCIONES PARA DOCUMENTOS (CV y DNI) ==============

// Subir CV para un trabajador específico
export const subirCV = async (id, file) => {
  console.log('🌐 trabajadorService.subirCV llamado');
  console.log('   ID trabajador:', id);
  console.log('   Archivo:', file.name);
  console.log('   Tipo:', file.type);
  console.log('   Tamaño:', file.size);

  const formData = new FormData();
  formData.append('cv', file);

  console.log('📦 FormData creado, enviando a backend...');

  try {
    const response = await api.post(`/trabajadores/${id}/cv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('✅ Respuesta del backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error en subirCV service:', error);
    console.error('   Response:', error.response?.data);
    console.error('   Status:', error.response?.status);
    throw error;
  }
};

// Subir DNI para un trabajador específico
export const subirDNI = async (id, file) => {
  console.log('🌐 trabajadorService.subirDNI llamado');
  console.log('   ID trabajador:', id);
  console.log('   Archivo:', file.name);
  console.log('   Tipo:', file.type);
  console.log('   Tamaño:', file.size);

  const formData = new FormData();
  formData.append('dni', file);

  console.log('📦 FormData creado, enviando a backend...');

  try {
    const response = await api.post(`/trabajadores/${id}/dni`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('✅ Respuesta del backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error en subirDNI service:', error);
    console.error('   Response:', error.response?.data);
    console.error('   Status:', error.response?.status);
    throw error;
  }
};

// Subir mi CV (perfil propio)
export const subirMiCV = async (file) => {
  const formData = new FormData();
  formData.append('cv', file);
  
  const response = await api.post('/trabajadores/perfil/me/cv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Subir mi DNI (perfil propio)
export const subirMiDNI = async (file) => {
  const formData = new FormData();
  formData.append('dni', file);
  
  const response = await api.post('/trabajadores/perfil/me/dni', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Ver/descargar archivo
export const verArchivo = async (filename) => {
  const response = await api.get(`/trabajadores/archivos/${filename}`, {
    responseType: 'blob'
  });
  return response.data;
};

// Ver mi CV
export const verMiCV = async () => {
  const response = await api.get('/trabajadores/perfil/me/cv', {
    responseType: 'blob'
  });
  return response.data;
};

// Ver mi DNI
export const verMiDNI = async () => {
  const response = await api.get('/trabajadores/perfil/me/dni', {
    responseType: 'blob'
  });
  return response.data;
};

// Eliminar CV
export const eliminarCV = async (id) => {
  const response = await api.delete(`/trabajadores/${id}/cv`);
  return response.data;
};

// Eliminar DNI
export const eliminarDNI = async (id) => {
  const response = await api.delete(`/trabajadores/${id}/dni`);
  return response.data;
};

// Eliminar mi CV (perfil propio)
export const eliminarMiCV = async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const response = await api.delete(`/trabajadores/${user.id}/cv`);
  return response.data;
};

// Eliminar mi DNI (perfil propio)
export const eliminarMiDNI = async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const response = await api.delete(`/trabajadores/${user.id}/dni`);
  return response.data;
};

export const abrirArchivo = async (archivoNombre) => {
  if (!archivoNombre) {
    alert('No hay archivo disponible');
    return;
  }

  try {
    // Obtener el archivo como blob
    const response = await api.get(`/trabajadores/archivos/${archivoNombre}`, {
      responseType: 'blob'
    });

    // Obtener el tipo de contenido del header o inferirlo de la extensión
    const contentType = response.headers['content-type'];
    const extension = archivoNombre.toLowerCase().split('.').pop();
    
    // Determinar el tipo MIME correcto
    let mimeType = contentType;
    if (!mimeType) {
      // Si no viene en el header, inferirlo
      const mimeTypes = {
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };
      mimeType = mimeTypes[extension] || 'application/octet-stream';
    }

    // Crear el blob con el tipo MIME correcto
    const blob = new Blob([response.data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    
    console.log('📄 Archivo para abrir:', {
      nombre: archivoNombre,
      extension,
      contentType,
      mimeType,
      tamaño: blob.size
    });

    // Si es PDF o imagen, abrir en nueva pestaña
    if (mimeType === 'application/pdf' || mimeType.startsWith('image/')) {
      // Abrir en nueva pestaña
      const nuevaPestana = window.open(url, '_blank');
      
      // Si el navegador bloquea la ventana emergente, crear un iframe
      if (!nuevaPestana || nuevaPestana.closed) {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.position = 'fixed';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.zIndex = '9999';
        iframe.style.background = 'white';
        
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.background = 'rgba(0,0,0,0.9)';
        modal.style.zIndex = '9998';
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '× Cerrar';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.zIndex = '10000';
        closeBtn.onclick = () => {
          document.body.removeChild(modal);
          window.URL.revokeObjectURL(url);
        };
        
        modal.appendChild(closeBtn);
        modal.appendChild(iframe);
        document.body.appendChild(modal);
      }
    } else {
      // Para archivos que no se pueden visualizar, forzar descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = archivoNombre;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    // Liberar memoria después de un tiempo
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 30000);
    
  } catch (error) {
    console.error('Error al abrir archivo:', error);
    
    // Si falla, intentar una forma alternativa
    try {
      // Método alternativo: redirigir directamente al endpoint
      window.open(`/trabajadores/archivos/${archivoNombre}`, '_blank');
    } catch (fallbackError) {
      console.error('Error en fallback:', fallbackError);
      alert('Error al abrir el archivo. Intenta descargarlo manualmente.');
    }
  }
};


export const getSubordinados = (jefeId) =>
  api.get(`/trabajadores/${jefeId}/subordinados`).then(r => r.data);

