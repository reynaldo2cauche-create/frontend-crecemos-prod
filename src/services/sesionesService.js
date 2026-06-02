import api from './api';

/**
 * Obtener estadísticas de sesiones
 * Funciona para los 3 modos:
 *   - General:    sin terapeutaId ni pacienteId
 *   - Terapeuta:  con terapeutaId
 *   - Paciente:   con pacienteId
 */
export const obtenerEstadisticasSesiones = async (
  fechaDesde,
  fechaHasta,
  terapeutaId = null,
  pacienteId = null
) => {
  const params = new URLSearchParams();

  if (fechaDesde) params.append('fecha_desde', fechaDesde);
  if (fechaHasta) params.append('fecha_hasta', fechaHasta);
  if (terapeutaId) params.append('terapeuta_id', terapeutaId);
  if (pacienteId) params.append('paciente_id', pacienteId);

  const response = await api.get(`/citas/estadisticas/sesiones?${params.toString()}`);
  return response.data;
};

/**
 * Obtener lista de terapeutas activos
 */
export const obtenerTerapeutas = async () => {
  const response = await api.get('/trabajadores/terapeutas');
  return response.data;
};

/**
 * Buscar pacientes por nombre o documento
 */
export const buscarPacientes = async (query) => {
  if (!query || query.trim().length < 2) return [];
  const response = await api.get(`/pacientes/buscar?q=${encodeURIComponent(query)}`);
  return response.data;
};