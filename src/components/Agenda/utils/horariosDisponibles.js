import { esFeriado } from '../../../constants/feriados';

/**
 * Convierte una hora en formato HH:MM a minutos
 */
const toMinutes = (hora) => {
  const [hh, mm] = hora.split(':').map(Number);
  return hh * 60 + mm;
};

/**
 * Verifica si hay conflicto con citas del terapeuta
 * @param {string} fechaString - Fecha en formato YYYY-MM-DD
 * @param {string} hora - Hora en formato HH:MM
 * @param {number} duracionMinutos - Duración en minutos
 * @param {Array} citas - Lista de todas las citas
 * @param {Array} terapeutasIds - IDs de los terapeutas a verificar
 * @param {number|null} citaEditandoId - ID de la cita que se está editando (para excluirla)
 * @param {string} tipoCita - Tipo de cita: 'NORMAL', 'VISITA_ESCOLAR', 'REUNION_CLINICA'
 * @returns {boolean} - true si está disponible, false si hay conflicto
 */
export const verificarDisponibilidadTerapeuta = (
  fechaString,
  hora,
  duracionMinutos,
  citas,
  terapeutasIds,
  citaEditandoId = null,
  tipoCita = 'NORMAL'
) => {
  if (!fechaString || !hora) return true;
  if (!citas || citas.length === 0) return true;
  if (!terapeutasIds || terapeutasIds.length === 0) return true;

  const citasDelDia = citas.filter(cita => {
    if (citaEditandoId && cita.id === citaEditandoId) return false;
    if (cita.fecha !== fechaString) return false;

    if (cita.tipo_cita === 'NORMAL' || cita.tipo_cita === 'VISITA_ESCOLAR') {
      return terapeutasIds.includes(cita.doctor_id);
    } else if (cita.tipo_cita === 'REUNION_CLINICA') {
      const terapeutasCita = cita.terapeutas?.map(t => t.id_terapeuta || t.terapeuta_id || t.id).filter(id => id) || [];
      return terapeutasIds.some(id => terapeutasCita.includes(id));
    }
    return false;
  });

  const horaInicioMinutos = toMinutes(hora);
  const horaFinMinutos = horaInicioMinutos + parseInt(duracionMinutos || 40);

  for (const cita of citasDelDia) {
    const [citaH, citaM] = cita.hora_inicio.split(':').map(Number);
    const citaInicioMinutos = citaH * 60 + citaM;
    const citaFinMinutos = citaInicioMinutos + parseInt(cita.duracion_minutos || 40);

    if (
      (horaInicioMinutos >= citaInicioMinutos && horaInicioMinutos < citaFinMinutos) ||
      (horaFinMinutos > citaInicioMinutos && horaFinMinutos <= citaFinMinutos) ||
      (horaInicioMinutos <= citaInicioMinutos && horaFinMinutos >= citaFinMinutos)
    ) {
      return false;
    }
  }
  return true;
};

/**
 * Verifica si hay conflicto con otras citas del mismo paciente
 * @param {string} fechaString - Fecha en formato YYYY-MM-DD
 * @param {string} hora - Hora en formato HH:MM
 * @param {number} duracionMinutos - Duración en minutos
 * @param {Array} citas - Lista de todas las citas
 * @param {number} pacienteId - ID del paciente
 * @param {number|null} citaEditandoId - ID de la cita que se está editando (para excluirla)
 * @returns {Object|null} - Cita conflictiva o null si no hay conflicto
 */
export const verificarConflictoPaciente = (
  fechaString,
  hora,
  duracionMinutos,
  citas,
  pacienteId,
  citaEditandoId = null
) => {
  if (!fechaString || !hora) return null;
  if (!citas || citas.length === 0) return null;
  if (!pacienteId) return null;

  const nuevaInicio = toMinutes(hora);
  const nuevaFin = nuevaInicio + parseInt(duracionMinutos || 40);

  const citasDelPaciente = citas.filter(c => {
    if (citaEditandoId && c.id === citaEditandoId) return false;
    return String(c.paciente_id) === String(pacienteId) && c.fecha === fechaString;
  });

  for (const c of citasDelPaciente) {
    const cInicio = toMinutes(c.hora_inicio);
    const cFin = cInicio + parseInt(c.duracion_minutos || 40);

    if (
      (nuevaInicio >= cInicio && nuevaInicio < cFin) ||
      (nuevaFin > cInicio && nuevaFin <= cFin) ||
      (nuevaInicio <= cInicio && nuevaFin >= cFin)
    ) {
      return c; // devuelve la cita que genera conflicto
    }
  }
  return null;
};

/**
 * Verifica si una hora está bloqueada
 * @param {string} fechaString - Fecha en formato YYYY-MM-DD
 * @param {string} hora - Hora en formato HH:MM
 * @param {Array} bloqueos - Lista de bloqueos
 * @returns {boolean} - true si está bloqueada, false si está disponible
 */
export const verificarHoraBloqueada = (fechaString, hora, bloqueos) => {
  if (!fechaString || !hora || !bloqueos || bloqueos.length === 0) return false;

  const slotStart = toMinutes(hora);
  const slotEnd = slotStart + 40; // duración del slot

  const bloqueado = bloqueos.some(b => {
    // Verificar si el bloqueo está activo
    if (!b.activo) return false;

    // Verificar si la fecha está dentro del rango del bloqueo
    if (fechaString < b.fechaInicio || fechaString > b.fechaFin) return false;

    // Si es bloqueo recurrente, verificar el día de la semana
    if (b.diaSemana !== null && b.diaSemana !== undefined) {
      const fecha = new Date(fechaString + 'T00:00:00');
      const diaSlot = fecha.getDay();
      if (b.diaSemana !== diaSlot) return false;
    }

    // Si es todo el día, está bloqueado
    if (b.todoElDia) return true;

    // Verificar horario
    const bloqStart = b.horaInicio ? toMinutes(b.horaInicio.substring(0, 5)) : 0;
    const bloqEnd = b.horaFin ? toMinutes(b.horaFin.substring(0, 5)) : bloqStart + 40;

    // Verificar si hay superposición
    return slotStart < bloqEnd && slotEnd > bloqStart;
  });

  return bloqueado;
};

/**
 * Verifica si una fecha está bloqueada todo el día
 * @param {string} fechaString - Fecha en formato YYYY-MM-DD
 * @param {Array} bloqueos - Lista de bloqueos
 * @returns {boolean} - true si está bloqueada todo el día
 */
export const verificarFechaBloqueadaTodoElDia = (fechaString, bloqueos) => {
  if (!fechaString || !bloqueos || bloqueos.length === 0) return false;

  return bloqueos.some(b => {
    // Verificar si el bloqueo está activo
    if (!b.activo) return false;

    // Verificar si la fecha está dentro del rango del bloqueo
    if (fechaString < b.fechaInicio || fechaString > b.fechaFin) return false;

    // Si es bloqueo recurrente, verificar el día de la semana
    if (b.diaSemana !== null && b.diaSemana !== undefined) {
      const fecha = new Date(fechaString + 'T00:00:00');
      const diaSlot = fecha.getDay();
      if (b.diaSemana !== diaSlot) return false;
    }

    // Retornar true si es todo el día
    return b.todoElDia === true;
  });
};

/**
 * Genera todas las horas posibles para un día según el día de la semana
 * @param {string} fechaString - Fecha en formato YYYY-MM-DD
 * @returns {Array<string>} - Array de horas en formato HH:MM
 */
export const generarHorasDelDia = (fechaString) => {
  if (!fechaString) return [];

  const fecha = new Date(fechaString + 'T00:00:00');
  const diaSemana = fecha.getDay();
  const horas = [];

  // Sábado (6): 8:00 AM a 8:00 PM
  if (diaSemana === 6) {
    let minutos = 8 * 60;
    const finMinutos = 20 * 60;

    while (minutos < finMinutos) {
      const h = Math.floor(minutos / 60);
      const m = minutos % 60;
      horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      minutos += 40;
    }
  }
  // Lunes a Viernes (1-5)
  else if (diaSemana >= 1 && diaSemana <= 5) {
    // Horarios específicos de la mañana
    horas.push('08:20', '09:00', '09:40', '10:20', '11:00', '11:40', '12:20');

    // Horarios de la tarde: 14:00 a 20:00
    let minutos = 14 * 60;
    const finMinutos = 20 * 60;

    while (minutos <= finMinutos) {
      const h = Math.floor(minutos / 60);
      const m = minutos % 60;
      horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      minutos += 40;
    }
  }
  // Domingo (0): No hay horarios
  else {
    return [];
  }

  return horas;
};

/**
 * Obtiene todos los horarios disponibles de un día con todas las verificaciones
 * @param {string} fechaString - Fecha en formato YYYY-MM-DD
 * @param {number} duracion - Duración de la cita en minutos
 * @param {Array} citas - Lista de todas las citas
 * @param {Array} bloqueos - Lista de bloqueos
 * @param {Array} terapeutasIds - IDs de los terapeutas (opcional, para verificar disponibilidad)
 * @param {number|null} pacienteId - ID del paciente (opcional, para verificar conflictos)
 * @param {number|null} citaEditandoId - ID de la cita que se está editando (para excluirla)
 * @param {string} tipoCita - Tipo de cita
 * @returns {Array<string>} - Array de horas disponibles en formato HH:MM
 */
export const obtenerHorariosDisponibles = (
  fechaString,
  duracion = 40,
  citas = [],
  bloqueos = [],
  terapeutasIds = [],
  pacienteId = null,
  citaEditandoId = null,
  tipoCita = 'NORMAL'
) => {
  // Validar que no sea domingo
  const fecha = new Date(fechaString + 'T00:00:00');
  const diaSemana = fecha.getDay();
  if (diaSemana === 0) return []; // Domingo

  // Validar que no sea feriado
  if (esFeriado(fechaString)) return [];

  // Validar que no esté bloqueado todo el día
  if (verificarFechaBloqueadaTodoElDia(fechaString, bloqueos)) return [];

  // Generar todas las horas posibles del día
  const todasLasHoras = generarHorasDelDia(fechaString);

  // Filtrar horas que cumplan todas las condiciones
  return todasLasHoras.filter(hora => {
    // Verificar que no esté bloqueada
    if (verificarHoraBloqueada(fechaString, hora, bloqueos)) {
      return false;
    }

    // Verificar disponibilidad del terapeuta (si se especificó)
    if (terapeutasIds && terapeutasIds.length > 0) {
      if (!verificarDisponibilidadTerapeuta(
        fechaString,
        hora,
        duracion,
        citas,
        terapeutasIds,
        citaEditandoId,
        tipoCita
      )) {
        return false;
      }
    }

    // Verificar conflicto con el paciente (si se especificó)
    if (pacienteId) {
      if (verificarConflictoPaciente(
        fechaString,
        hora,
        duracion,
        citas,
        pacienteId,
        citaEditandoId
      )) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Verifica si un horario tiene conflicto con alguna cita existente
 * @param {string} fechaString - Fecha en formato YYYY-MM-DD
 * @param {string} hora - Hora en formato HH:MM
 * @param {number} duracion - Duración del slot en minutos (por defecto 40)
 * @param {Array} citas - Lista de citas
 * @returns {boolean} - true si hay conflicto, false si está libre
 */
export const verificarConflictoCita = (fechaString, hora, duracion = 40, citas = []) => {
  if (!citas || citas.length === 0) return false;

  const slotInicio = toMinutes(hora);
  const slotFin = slotInicio + duracion;

  const citasDelDia = citas.filter(c => c.fecha === fechaString);

  for (const cita of citasDelDia) {
    const citaInicio = toMinutes(cita.hora_inicio.substring(0, 5));

    // Calcular hora fin de la cita (puede ser hora_fin o hora_inicio + duración)
    let citaFin;
    if (cita.hora_fin) {
      citaFin = toMinutes(cita.hora_fin.substring(0, 5));
    } else {
      citaFin = citaInicio + parseInt(cita.duracion_minutos || 40);
    }

    // Verificar solapamiento
    if (slotInicio < citaFin && slotFin > citaInicio) {
      return true; // Hay conflicto
    }
  }

  return false;
};

/**
 * Obtiene horarios disponibles considerando bloqueos, feriados y citas existentes
 * @param {string} fechaString - Fecha en formato YYYY-MM-DD
 * @param {Array} bloqueos - Lista de bloqueos
 * @param {Array} citas - Lista de citas existentes
 * @returns {Array<string>} - Array de horas disponibles en formato HH:MM
 */
export const obtenerHorariosDisponiblesSinRestricciones = (fechaString, bloqueos = [], citas = []) => {
  // Validar que no sea domingo
  const fecha = new Date(fechaString + 'T00:00:00');
  const diaSemana = fecha.getDay();
  if (diaSemana === 0) return []; // Domingo

  // Validar que no sea feriado
  if (esFeriado(fechaString)) return [];

  // Validar que no esté bloqueado todo el día
  if (verificarFechaBloqueadaTodoElDia(fechaString, bloqueos)) return [];

  // Generar todas las horas posibles del día
  const todasLasHoras = generarHorasDelDia(fechaString);

  // Filtrar por bloqueos y citas existentes
  return todasLasHoras.filter(hora => {
    // Verificar que no esté bloqueada
    if (verificarHoraBloqueada(fechaString, hora, bloqueos)) {
      return false;
    }

    // Verificar que no haya conflicto con citas existentes
    if (verificarConflictoCita(fechaString, hora, 40, citas)) {
      return false;
    }

    return true;
  });
};
