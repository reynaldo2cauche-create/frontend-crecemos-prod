/**
 * Utilidades para detectar y gestionar huecos en el calendario
 */

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(n => parseInt(n, 10));
  return h * 60 + (m || 0);
};

/**
 * Detectar huecos entre citas consecutivas en un día específico
 * @param {Array} citas - Lista de citas del día
 * @param {Array} horas - Horarios disponibles del día
 * @param {string} fechaString - Fecha en formato YYYY-MM-DD
 * @returns {Array} - Lista de huecos detectados
 */
export const detectarHuecosEnDia = (citas, horas, fechaString) => {
  if (!citas || citas.length === 0 || !horas || horas.length === 0) {
    return [];
  }

  // Filtrar citas del día y ordenarlas por hora_inicio
  const citasDelDia = citas
    .filter(c => c.fecha === fechaString && c.hora_inicio)
    .sort((a, b) => {
      const startA = toMinutes(a.hora_inicio.substring(0, 5));
      const startB = toMinutes(b.hora_inicio.substring(0, 5));
      return startA - startB;
    });

  if (citasDelDia.length < 2) {
    return []; // Necesitamos al menos 2 citas para tener un hueco entre ellas
  }

  const huecos = [];

  // Detectar huecos entre citas consecutivas
  for (let i = 0; i < citasDelDia.length - 1; i++) {
    const citaActual = citasDelDia[i];
    const citaSiguiente = citasDelDia[i + 1];

    // Calcular hora fin de cita actual
    const startActual = toMinutes(citaActual.hora_inicio.substring(0, 5));
    const duracionActual = citaActual.duracion_minutos || 40;
    const endActual = startActual + duracionActual;

    // Hora inicio de cita siguiente
    const startSiguiente = toMinutes(citaSiguiente.hora_inicio.substring(0, 5));

    // Calcular minutos entre citas
    const minutosLibres = startSiguiente - endActual;

    // Solo considerar huecos de 10-30 minutos (menores a duración mínima de 40)
    if (minutosLibres >= 10 && minutosLibres < 40) {
      const horaInicioHueco = minutosToHHMM(endActual);
      const horaFinHueco = minutosToHHMM(startSiguiente);

      huecos.push({
        hora_inicio: horaInicioHueco,
        hora_fin: horaFinHueco,
        minutos_disponibles: minutosLibres,
        doctor_id: citaActual.doctor_id,
        fecha: fechaString,
        // Información adicional para UI
        cita_anterior: {
          id: citaActual.id,
          paciente: citaActual.paciente_nombre || `${citaActual.paciente?.nombres || ''} ${citaActual.paciente?.apellido_paterno || ''}`.trim(),
        },
        cita_siguiente: {
          id: citaSiguiente.id,
          paciente: citaSiguiente.paciente_nombre || `${citaSiguiente.paciente?.nombres || ''} ${citaSiguiente.paciente?.apellido_paterno || ''}`.trim(),
        }
      });
    }
  }

  return huecos;
};

/**
 * Convertir minutos a formato HH:MM
 */
const minutosToHHMM = (minutos) => {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

/**
 * Verificar si un slot corresponde a un hueco
 * @param {string} hora - Hora del slot (HH:MM)
 * @param {Array} huecos - Lista de huecos detectados
 * @returns {Object|null} - Hueco si existe, null si no
 */
export const getHuecoEnSlot = (hora, huecos) => {
  if (!huecos || huecos.length === 0) return null;

  const horaMin = toMinutes(hora);

  return huecos.find(hueco => {
    const inicioHueco = toMinutes(hueco.hora_inicio);
    const finHueco = toMinutes(hueco.hora_fin);

    // El slot está dentro del hueco
    return horaMin >= inicioHueco && horaMin < finHueco;
  });
};

/**
 * Agrupar huecos por día de la semana y terapeuta
 */
export const agruparHuecosPorDia = (todasLasCitas, diasSemana, terapeutaId = null) => {
  const huecosPorDia = {};

  diasSemana.forEach(dia => {
    const citasDelDia = todasLasCitas.filter(c => {
      const coincideFecha = c.fecha === dia.fechaString;
      const coincideTerapeuta = !terapeutaId || c.doctor_id === parseInt(terapeutaId);
      return coincideFecha && coincideTerapeuta;
    });

    // Generar horas según día de la semana (sábado tiene horario diferente)
    const horas = dia.fecha.getDay() === 6
      ? generarHorasSabado()
      : generarHorasNormal();

    const huecos = detectarHuecosEnDia(citasDelDia, horas, dia.fechaString);

    if (huecos.length > 0) {
      huecosPorDia[dia.fechaString] = huecos;
    }
  });

  return huecosPorDia;
};

// Helper para generar horas normales (lunes a viernes)
const generarHorasNormal = () => {
  const horas = [];
  let minutos = 9 * 60; // 9:00 AM
  const finMinutos = 18 * 60; // 6:00 PM

  while (minutos < finMinutos) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    minutos += 40;
  }

  return horas;
};

// Helper para generar horas sábado
const generarHorasSabado = () => {
  const horas = [];
  let minutos = 8 * 60; // 8:00 AM
  const finMinutos = 14 * 60; // 2:00 PM

  while (minutos < finMinutos) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    minutos += 40;
  }

  return horas;
};
