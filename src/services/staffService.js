import api from './api';

// Obtener todos los staff (para intranet)
export const getStaff = async () => {
  const response = await api.get('/staff');
  return response.data;
};

// Obtener solo staff activos (para web pública)
export const getStaffActivos = async () => {
  const response = await api.get('/staff/activos');
  return response.data;
};

// Obtener staff por ID
export const getStaffById = async (id) => {
  const response = await api.get(`/staff/${id}`);
  return response.data;
};

// Crear nuevo staff
export const crearStaff = async (staffData) => {
  const response = await api.post('/staff', staffData);
  return response.data;
};

// Actualizar staff
export const actualizarStaff = async (id, staffData) => {
  const response = await api.put(`/staff/${id}`, staffData);
  return response.data;
};

// Eliminar staff
export const eliminarStaff = async (id) => {
  const response = await api.delete(`/staff/${id}`);
  return response.data;
};

// Cambiar estado activo/inactivo
export const cambiarEstadoStaff = async (id, activo) => {
  const response = await api.patch(`/staff/${id}/estado`, { activo });
  return response.data;
};

// Subir foto
export const uploadFotoStaff = async (file) => {
  const formData = new FormData();
  formData.append('foto', file);

  const response = await api.post('/staff/upload-foto', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Obtener detalle completo del staff (con formación académica y cursos)
export const getStaffDetalleCompleto = async (id) => {
  const response = await api.get(`/staff/${id}/detalle-completo`);
  return response.data;
};
