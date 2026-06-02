// utils/horariosCitas.js

/**
 * Convierte una hora en formato "HH:MM" a minutos desde medianoche
 */
export const toMinutes = (hhmm) => {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(':').map(n => parseInt(n, 10));
  return h * 60 + (m || 0);
};

/**
 * Formatea hora de 24h a 12h con am/pm
 * Ejemplo: "14:30" → "2:30 pm"
 */
export const formatearHora12 = (hhmm) => {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

/**
 * Formatea hora de 24h a formato corto (solo HH:MM)
 */
export const formatearHora = (hhmm) => {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':');
  const numH = parseInt(h, 10);
  return `${numH}:${m}`;
};

/**
 * Duración estándar de cada slot en minutos
 */
export const SLOT_DURACION_MINUTOS = 40;

/**
 * Genera las horas disponibles según el día de la semana
 * @param {number} diaSemana - 0=Domingo, 1=Lunes, ..., 6=Sábado
 * @returns {string[]} Array de horas en formato "HH:MM"
 */
export const generarHorasPorDia = (diaSemana) => {
  const horas = [];

  // Sábado (6): 8:00 AM a 6:00 PM (cada 40 min)
  if (diaSemana === 6) {
    let minutos = 8 * 60; // 8:00 AM
    const finMinutos = 18 * 60; // 6:00 PM

    while (minutos < finMinutos) {
      const h = Math.floor(minutos / 60);
      const m = minutos % 60;
      horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      minutos += SLOT_DURACION_MINUTOS;
    }
  }
  // Lunes a Viernes (1-5)
  else if (diaSemana >= 1 && diaSemana <= 5) {
    // Mañana: 8:20 a 12:20
    let minutos = 8 * 60 + 20;
    const ultimaCitaAntesBreak = 12 * 60 + 20;

    while (minutos <= ultimaCitaAntesBreak) {
      const h = Math.floor(minutos / 60);
      const m = minutos % 60;
      horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      minutos += SLOT_DURACION_MINUTOS;
    }

    // Tarde: 14:00 a 20:00
    minutos = 14 * 60;
    const finMinutos = 20 * 60;
    while (minutos <= finMinutos) {
      const h = Math.floor(minutos / 60);
      const m = minutos % 60;
      horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      minutos += SLOT_DURACION_MINUTOS;
    }
  }

  return horas;
};

/**
 * Verifica si un terapeuta está disponible en una fecha y hora específica
 * @param {string} fechaString - Fecha en formato "YYYY-MM-DD"
 * @param {string} hora - Hora en formato "HH:MM"
 * @param {number} duracionMinutos - Duración de la cita en minutos
 * @param {Array} citas - Lista de todas las citas
 * @param {Array} terapeutasIds - IDs de los terapeutas a verificar
 * @param {number|null} citaEditandoId - ID de la cita que se está editando (para excluirla)
 * @returns {boolean} - true si está disponible
 */
export const verificarDisponibilidadTerapeuta = (
  fechaString,
  hora,
  duracionMinutos,
  citas,
  terapeutasIds,
  citaEditandoId = null
) => {
  if (!fechaString || !hora || !terapeutasIds || terapeutasIds.length === 0) return true;
  if (!citas || citas.length === 0) return true;

  const slotStart = toMinutes(hora);
  const slotEnd = slotStart + (duracionMinutos || SLOT_DURACION_MINUTOS);

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

  for (const cita of citasDelDia) {
    const citaStart = toMinutes(cita.hora_inicio);
    const citaEnd = citaStart + (cita.duracion_minutos || SLOT_DURACION_MINUTOS);

    if (
      (slotStart >= citaStart && slotStart < citaEnd) ||
      (slotEnd > citaStart && slotEnd <= citaEnd) ||
      (slotStart <= citaStart && slotEnd >= citaEnd)
    ) {
      return false;
    }
  }

  return true;
};

/**
 * Verifica si un paciente tiene conflicto de horario
 * @param {string} fechaString - Fecha en formato "YYYY-MM-DD"
 * @param {string} hora - Hora en formato "HH:MM"
 * @param {number} duracionMinutos - Duración de la cita en minutos
 * @param {Array} citas - Lista de todas las citas
 * @param {number} pacienteId - ID del paciente
 * @param {number|null} citaEditandoId - ID de la cita que se está editando (para excluirla)
 * @returns {Object|null} - La cita conflictiva o null
 */
export const verificarConflictoPaciente = (
  fechaString,
  hora,
  duracionMinutos,
  citas,
  pacienteId,
  citaEditandoId = null
) => {
  if (!fechaString || !hora || !pacienteId) return null;
  if (!citas || citas.length === 0) return null;

  const slotStart = toMinutes(hora);
  const slotEnd = slotStart + (duracionMinutos || SLOT_DURACION_MINUTOS);

  const citasDelPaciente = citas.filter(c => {
    if (citaEditandoId && c.id === citaEditandoId) return false;
    return String(c.paciente_id) === String(pacienteId) && c.fecha === fechaString;
  });

  for (const c of citasDelPaciente) {
    const cStart = toMinutes(c.hora_inicio);
    const cEnd = cStart + (c.duracion_minutos || SLOT_DURACION_MINUTOS);

    if (
      (slotStart >= cStart && slotStart < cEnd) ||
      (slotEnd > cStart && slotEnd <= cEnd) ||
      (slotStart <= cStart && slotEnd >= cEnd)
    ) {
      return c;
    }
  }

  return null;
};

/**
 * Verifica si una hora está bloqueada por bloqueos manuales
 * @param {string} fechaString - Fecha en formato "YYYY-MM-DD"
 * @param {string} hora - Hora en formato "HH:MM"
 * @param {Array} bloqueos - Lista de bloqueos
 * @returns {Object|null} - El bloqueo encontrado o null
 */
export const verificarHoraBloqueada = (fechaString, hora, bloqueos) => {
  if (!fechaString || !hora || !bloqueos || bloqueos.length === 0) return null;

  const slotStart = toMinutes(hora);
  const slotEnd = slotStart + SLOT_DURACION_MINUTOS;

  const bloqueo = bloqueos.find(b => {
    if (!b.activo) return false;
    if (fechaString < b.fechaInicio || fechaString > b.fechaFin) return false;

    if (b.diaSemana !== null && b.diaSemana !== undefined) {
      const fecha = new Date(fechaString + 'T00:00:00');
      const diaSlot = fecha.getDay();
      if (b.diaSemana !== diaSlot) return false;
    }

    if (b.todoElDia) return true;

    const bloqStart = b.horaInicio ? toMinutes(b.horaInicio.substring(0, 5)) : 0;
    const bloqEnd = b.horaFin ? toMinutes(b.horaFin.substring(0, 5)) : bloqStart + SLOT_DURACION_MINUTOS;

    return slotStart < bloqEnd && slotEnd > bloqStart;
  });

  return bloqueo || null;
};

/**
 * Verifica si una fecha está bloqueada todo el día
 */
export const verificarFechaBloqueadaTodoElDia = (fechaString, bloqueos) => {
  if (!fechaString || !bloqueos || bloqueos.length === 0) return false;

  return bloqueos.some(b => {
    if (!b.activo) return false;
    if (fechaString < b.fechaInicio || fechaString > b.fechaFin) return false;

    if (b.diaSemana !== null && b.diaSemana !== undefined) {
      const fecha = new Date(fechaString + 'T00:00:00');
      const diaSlot = fecha.getDay();
      if (b.diaSemana !== diaSlot) return false;
    }

    return b.todoElDia === true;
  });
};

/**
 * Genera horas disponibles para una fecha específica (filtra ocupadas y bloqueadas)
 * @param {string} fechaString - Fecha en formato "YYYY-MM-DD"
 * @param {number} duracionMinutos - Duración de la cita en minutos
 * @param {Array} citas - Lista de todas las citas
 * @param {Array} bloqueos - Lista de bloqueos
 * @param {number} terapeutaId - ID del terapeuta (opcional)
 * @param {number} pacienteId - ID del paciente (opcional)
 * @param {number|null} citaEditandoId - ID de la cita que se está editando
 * @returns {string[]} - Horas disponibles
 */
export const generarHorasDisponibles = (
  fechaString,
  duracionMinutos,
  citas,
  bloqueos,
  terapeutaId = null,
  pacienteId = null,
  citaEditandoId = null
) => {
  if (!fechaString) return [];

  const fecha = new Date(fechaString + 'T00:00:00');
  const diaSemana = fecha.getDay();
  const todasHoras = generarHorasPorDia(diaSemana);

  if (verificarFechaBloqueadaTodoElDia(fechaString, bloqueos)) {
    return [];
  }

  const horasDisponibles = [];

  for (const hora of todasHoras) {
    if (verificarHoraBloqueada(fechaString, hora, bloqueos)) {
      continue;
    }

    if (terapeutaId) {
      const disponible = verificarDisponibilidadTerapeuta(
        fechaString,
        hora,
        duracionMinutos,
        citas,
        [terapeutaId],
        citaEditandoId
      );
      if (!disponible) continue;
    }

    if (pacienteId) {
      const conflicto = verificarConflictoPaciente(
        fechaString,
        hora,
        duracionMinutos,
        citas,
        pacienteId,
        citaEditandoId
      );
      if (conflicto) continue;
    }

    horasDisponibles.push(hora);
  }

  return horasDisponibles;
};

/**
 * Obtiene las horas libres de un día específico
 * @param {Object} dia - Objeto con fechaString y fecha
 * @param {string[]} horasDelDia - Array de horas disponibles del día
 * @param {Function} getCitasEnSlot - Función para obtener citas en un slot
 * @param {Function} getBloqueoEnSlot - Función para obtener bloqueo en un slot
 * @returns {string[]} - Array de horas libres
 */
export const obtenerHorasLibres = (dia, horasDelDia, getCitasEnSlot, getBloqueoEnSlot) => {
  return horasDelDia.filter(hora => {
    const citasInfo = getCitasEnSlot(dia, hora);
    const bloqueo = getBloqueoEnSlot(dia, hora);
    const hayCitas = citasInfo && citasInfo.some(s => s.isTop);
    return !hayCitas && !bloqueo;
  });
};

/**
 * Genera el texto del mensaje para copiar horarios disponibles
 * @param {Object} dia - Objeto con fechaString y fecha
 * @param {string[]} horasLibres - Array de horas libres
 * @returns {string} - Texto formateado para copiar
 */
export const generarTextoHorariosDisponibles = (dia, horasLibres) => {
  const [year, month, day] = dia.fechaString.split('-').map(Number);
  const fechaObj = new Date(year, month - 1, day);
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  const encabezado = `📅 *${diasSemana[fechaObj.getDay()]} ${day} de ${meses[month - 1]}*\n⏰ *Horarios disponibles:*`;
  const lista = horasLibres.map(h => `• ${formatearHora12(h)}`).join('\n');
  
  return `${encabezado}\n${lista}`;
};