import axios from 'axios';
import { API_BASE_URL } from './api';
import { getTrabajadores } from './trabajadorService';

// Obtener token del localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Obtener todos los trabajadores (reutilizando el servicio existente)
export const getEmpleados = getTrabajadores;

// ========== GRATIFICACIONES ==========

// Calcular gratificaciones para todos los empleados
export const calcularGratificaciones = async (data) => {
  const response = await axios.post(
    `${API_BASE_URL}/pagos/calcular-gratificaciones`,
    data,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Registrar una gratificación específica
export const registrarGratificacion = async (data) => {
  const response = await axios.post(
    `${API_BASE_URL}/pagos/registrar-gratificacion`,
    data,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ========== PAGOS GENERALES ==========

// Obtener todos los pagos con filtros opcionales
export const getPagos = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.tipo) params.append('tipo', filters.tipo);
  if (filters.mes) params.append('periodo', filters.mes);
  if (filters.anio) params.append('anio', filters.anio);

  const response = await axios.get(`${API_BASE_URL}/pagos?${params.toString()}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Obtener un pago específico
export const getPagoById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/pagos/${id}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Crear un nuevo pago
export const createPago = async (data) => {
  const response = await axios.post(`${API_BASE_URL}/pagos`, data, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Eliminar un pago
export const deletePago = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/pagos/${id}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// ========== PAGOS MENSUALES REGULARES ==========

// Registrar pago mensual regular (sin gratificación)
export const registrarPagoMensual = async (data) => {
  const response = await axios.post(
    `${API_BASE_URL}/pagos/registrar-pago-mensual`,
    data,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Obtener descuento mensual sugerido por faltas de un empleado
export const getDescuentoMensual = async ({ empleadoId, mesId, anio }) => {
  const params = new URLSearchParams();
  params.append('empleadoId', empleadoId);
  params.append('mesId', mesId);
  params.append('anio', anio);

  const response = await axios.get(
    `${API_BASE_URL}/pagos/descuento-mensual?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ========== FALTAS / PERMISOS ==========

// Obtener catálogo de tipos de falta
export const getTiposFalta = async () => {
  const response = await axios.get(`${API_BASE_URL}/faltas/tipos`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Obtener todos los tipos de falta (incluye inactivos) para configuración
export const getTiposFaltaAll = async () => {
  const response = await axios.get(`${API_BASE_URL}/faltas/tipos/all`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Crear un tipo de falta
export const crearTipoFalta = async (data) => {
  const response = await axios.post(`${API_BASE_URL}/faltas/tipos`, data, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Actualizar un tipo de falta (nombre, descuenta, activo)
export const actualizarTipoFalta = async (id, data) => {
  const response = await axios.patch(`${API_BASE_URL}/faltas/tipos/${id}`, data, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Registrar una falta / permiso
export const registrarFalta = async (data) => {
  const response = await axios.post(`${API_BASE_URL}/faltas`, data, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Obtener faltas con filtros opcionales (empleadoId, mesId, anio)
export const getFaltas = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.empleadoId) params.append('empleadoId', filters.empleadoId);
  if (filters.mesId) params.append('mesId', filters.mesId);
  if (filters.anio) params.append('anio', filters.anio);

  const response = await axios.get(
    `${API_BASE_URL}/faltas?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Actualizar una falta
export const updateFalta = async (id, data) => {
  const response = await axios.patch(`${API_BASE_URL}/faltas/${id}`, data, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Eliminar una falta
export const deleteFalta = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/faltas/${id}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// ========== SOLICITUDES (permisos / vacaciones con aprobación) ==========

// Crear una solicitud (autoservicio del terapeuta)
export const crearSolicitud = async (data) => {
  const response = await axios.post(`${API_BASE_URL}/solicitudes`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Subir el documento adjunto; devuelve { url, nombre }
export const subirAdjuntoSolicitud = async (file) => {
  const formData = new FormData();
  formData.append('archivo', file);
  const response = await axios.post(`${API_BASE_URL}/solicitudes/adjunto`, formData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Mis solicitudes (por trabajador)
export const getMisSolicitudes = async (trabajadorId, estado) => {
  const params = new URLSearchParams();
  params.append('trabajadorId', trabajadorId);
  if (estado) params.append('estado', estado);
  const response = await axios.get(`${API_BASE_URL}/solicitudes/mias?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Todas las solicitudes (panel admin), filtro opcional por estado
export const getSolicitudes = async (estado) => {
  const params = new URLSearchParams();
  if (estado) params.append('estado', estado);
  const response = await axios.get(`${API_BASE_URL}/solicitudes?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Detalle de una solicitud (incluye historial)
export const getSolicitud = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/solicitudes/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Aprobar o rechazar (RRHH)
export const revisarSolicitud = async (id, data) => {
  const response = await axios.patch(`${API_BASE_URL}/solicitudes/${id}/revisar`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Resumen mensual (4 indicadores). Sin trabajadorId = vista admin.
export const getResumenAsistencia = async ({ mes, anio, trabajadorId } = {}) => {
  const params = new URLSearchParams();
  if (mes) params.append('mes', mes);
  if (anio) params.append('anio', anio);
  if (trabajadorId) params.append('trabajadorId', trabajadorId);
  const response = await axios.get(`${API_BASE_URL}/solicitudes/resumen?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Eliminar una solicitud (solo pendientes)
export const eliminarSolicitud = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/solicitudes/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ========== VACACIONES ==========

// Calcular vacaciones disponibles para todos los empleados
export const calcularVacaciones = async (data) => {
  const response = await axios.post(
    `${API_BASE_URL}/vacaciones/calcular`,
    data,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Registrar vacaciones
export const registrarVacacion = async (data) => {
  const response = await axios.post(
    `${API_BASE_URL}/vacaciones`,
    data,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Obtener todas las vacaciones con filtros
export const getVacaciones = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.empleadoId) params.append('empleadoId', filters.empleadoId);
  if (filters.anio) params.append('anio', filters.anio);

  const response = await axios.get(
    `${API_BASE_URL}/vacaciones?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Eliminar una vacación
// DESHABILITADO: No se permite eliminar vacaciones registradas
// export const deleteVacacion = async (id) => {
//   const response = await axios.delete(
//     `${API_BASE_URL}/vacaciones/${id}`,
//     { headers: getAuthHeaders() }
//   );
//   return response.data;
// };

// ========== CUENTAS BANCARIAS ==========

// Obtener cuentas bancarias de un trabajador
export const getCuentasBancarias = async (trabajadorId) => {
  const response = await axios.get(
    `${API_BASE_URL}/cuentas-bancarias/trabajador/${trabajadorId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Crear una nueva cuenta bancaria
export const crearCuentaBancaria = async (data) => {
  const response = await axios.post(
    `${API_BASE_URL}/cuentas-bancarias`,
    data,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Actualizar una cuenta bancaria
export const actualizarCuentaBancaria = async (id, data) => {
  const response = await axios.put(
    `${API_BASE_URL}/cuentas-bancarias/${id}`,
    data,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Marcar cuenta como principal
export const marcarCuentaPrincipal = async (id) => {
  const response = await axios.put(
    `${API_BASE_URL}/cuentas-bancarias/${id}/marcar-principal`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Eliminar una cuenta bancaria
export const eliminarCuentaBancaria = async (id) => {
  const response = await axios.delete(
    `${API_BASE_URL}/cuentas-bancarias/${id}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ========== NOTIFICACIONES Y ALERTAS ==========

// Obtener vacaciones próximas (empleados próximos a cumplir primer año)
export const obtenerVacacionesProximas = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/vacaciones/alertas/primer-anio`,
      { headers: getAuthHeaders() }
    );
    // Filtrar solo los que faltan 7 días o menos (una semana)
    const proximosFiltrados = (response.data || []).filter(
      emp => emp.diasHastaPrimerAnio <= 7
    );
    return proximosFiltrados;
  } catch (error) {
    console.error('Error al obtener vacaciones próximas:', error);
    return [];
  }
};