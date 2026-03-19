import api from './api';

/**
 * Obtener configuración de agenda flexible
 */
export const obtenerConfiguracionAgenda = async () => {
  const response = await api.get('/citas/agenda-flexible/configuracion');
  return response.data;
};

/**
 * Actualizar configuración de agenda flexible
 */
export const actualizarConfiguracionAgenda = async (config) => {
  const response = await api.put('/citas/agenda-flexible/configuracion', config);
  return response.data;
};

/**
 * Detectar huecos disponibles
 */
export const detectarHuecos = async (doctorId, fecha) => {
  const response = await api.post('/citas/agenda-flexible/detectar-huecos', {
    doctor_id: doctorId,
    fecha,
  });
  return response.data;
};

/**
 * Generar vista previa de agendar en hueco
 */
export const generarVistaPrevia = async (datos) => {
  const response = await api.post('/citas/agenda-flexible/vista-previa', datos);
  return response.data;
};

/**
 * Agendar cita en hueco y mover citas siguientes
 */
export const agendarEnHueco = async (datos) => {
  const response = await api.post('/citas/agenda-flexible/agendar-en-hueco', datos);
  return response.data;
};
