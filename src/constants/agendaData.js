// Datos estáticos para la agenda

export const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Horarios fijos para el calendario (40 minutos de intervalo)
// Cubre desde 8:00 AM hasta 8:00 PM (lunes-viernes)
export const horas = [
  '08:00', '08:40', '09:20', '10:00', '10:40', '11:20', '12:00', '12:40',
  '14:00', '14:40', '15:20', '16:00', '16:40', '17:20', '18:00',
  '18:40', '19:20', '20:00'
];

export const pacientes = [
  { id: 1, nombre: 'María González', documento: '12345678' },
  { id: 2, nombre: 'Carlos López', documento: '87654321' },
  { id: 3, nombre: 'Sofia Rodríguez', documento: '11223344' },
  { id: 4, nombre: 'Romeo Prueba', documento: '55667788' },
  { id: 5, nombre: 'Homero Prueba', documento: '99887766' },
  { id: 6, nombre: 'Ana García', documento: '44332211' },
  { id: 7, nombre: 'Luis Martínez', documento: '77889900' }
];

export const doctores = [
  { id: 1, nombre: 'Dr. Juan Pérez', especialidad: 'Psicología' },
  { id: 2, nombre: 'Dra. Ana Martínez', especialidad: 'Terapia Ocupacional' },
  { id: 3, nombre: 'Dr. Miguel Torres', especialidad: 'Terapia de Lenguaje' },
  { id: 4, nombre: 'Dra. Carmen López', especialidad: 'Psicología Infantil' },
  { id: 5, nombre: 'Dr. Roberto Silva', especialidad: 'Terapia Familiar' }
];

export const servicios = [
  'Terapia Individual',
  'Terapia Familiar',
  'Evaluación Psicológica',
  'Terapia de Lenguaje',
  'Terapia Ocupacional',
  'Orientación Vocacional',
  'Evaluación Neuropsicológica'
];

export const motivos = [
  'Consulta inicial',
  'Seguimiento',
  'Evaluación',
  'Terapia regular',
  'Emergencia',
  'Reevaluación'
];

export const duraciones = [
  { valor: 40, label: '40 minutos' },
  { valor: 50, label: '50 minutos' }
];

export const citasEjemplo = [
  {
    id: 1,
    paciente: 'María González',
    terapeuta: 'Dr. Juan Pérez',
    fecha: '2024-01-15',
    hora: '09:00',
    duracion: 60,
    tipo: 'Terapia Individual',
    estado: 'Confirmada',
    dia: 'Lunes'
  },
  {
    id: 2,
    paciente: 'Carlos López',
    terapeuta: 'Dra. Ana Martínez',
    fecha: '2024-01-16',
    hora: '10:30',
    duracion: 45,
    tipo: 'Evaluación',
    estado: 'Pendiente',
    dia: 'Martes'
  },
  {
    id: 3,
    paciente: 'Sofia Rodríguez',
    terapeuta: 'Dr. Miguel Torres',
    fecha: '2024-01-17',
    hora: '14:00',
    duracion: 90,
    tipo: 'Terapia Familiar',
    estado: 'Confirmada',
    dia: 'Miércoles'
  },
  {
    id: 4,
    paciente: 'Romeo Prueba',
    terapeuta: 'Dr. Juan Pérez',
    fecha: '2024-01-17',
    hora: '09:00',
    duracion: 60,
    tipo: 'Evaluación',
    estado: 'Confirmada',
    dia: 'Miércoles'
  },
  {
    id: 5,
    paciente: 'Homero Prueba',
    terapeuta: 'Dra. Ana Martínez',
    fecha: '2024-01-17',
    hora: '11:00',
    duracion: 60,
    tipo: 'Terapia Individual',
    estado: 'Confirmada',
    dia: 'Miércoles'
  }
];

/**
 * Generar horas disponibles según la duración y el día de la semana
 * @param {number} duracionMinutos - Duración de la cita (40 o 50 minutos)
 * @param {number} diaSemana - Día de la semana (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
 * @returns {string[]} Array de horas en formato "HH:MM"
 */
export const generarHorasDisponibles = (duracionMinutos, diaSemana) => {
  const horasDisponibles = []; // ✅ Cambiado de 'horas' a 'horasDisponibles'

  // Determinar horario según el día
  let inicioMin, finMin;

  if (diaSemana === 0) {
    // Domingo: no hay horarios disponibles
    return [];
  } else if (diaSemana === 6) {
    // Sábado: 8:00 AM a 2:00 PM
    inicioMin = 8 * 60; // 8:00 = 480 minutos
    finMin = 14 * 60; // 14:00 = 840 minutos
  } else {
    // Lunes a Viernes: 8:00 AM a 8:00 PM
    inicioMin = 8 * 60; // 8:00 = 480 minutos
    finMin = 20 * 60; // 20:00 = 1200 minutos
  }

  // Horario de refrigerio (solo lunes a viernes)
  const inicioRefrigerio = 13 * 60; // 13:00
  const finRefrigerio = 14 * 60; // 14:00

  // Generar slots según la duración
  let minutosActuales = inicioMin;

  while (minutosActuales < finMin) {
    const hrs = Math.floor(minutosActuales / 60); // ✅ Cambiado de 'horas' a 'hrs'
    const mins = minutosActuales % 60; // ✅ Cambiado de 'minutos' a 'mins'
    const horaFormateada = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

    // Verificar si está en horario de refrigerio (solo lunes a viernes)
    const esRefrigerio = diaSemana >= 1 && diaSemana <= 5 &&
                         minutosActuales >= inicioRefrigerio &&
                         minutosActuales < finRefrigerio;

    if (!esRefrigerio) {
      horasDisponibles.push(horaFormateada); // ✅ Usar 'horasDisponibles'
    }

    minutosActuales += duracionMinutos;
  }

  return horasDisponibles; // ✅ Retornar 'horasDisponibles'
};

/**
 * Generar horas disponibles para una fecha específica
 * @param {string} fecha - Fecha en formato "YYYY-MM-DD"
 * @param {number} duracionMinutos - Duración de la cita (40 o 50 minutos)
 * @returns {string[]} Array de horas en formato "HH:MM"
 */
export const generarHorasPorFecha = (fecha, duracionMinutos) => {
  if (!fecha || !duracionMinutos) return [];

  const fechaObj = new Date(fecha + 'T00:00:00');
  const diaSemana = fechaObj.getDay();

  return generarHorasDisponibles(duracionMinutos, diaSemana);
};

// Función para verificar si una hora está bloqueada según el día
export const esHorarioBloqueado = (hora, diaSemana) => {
  // diaSemana: 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  const [h, m] = hora.split(':').map(num => parseInt(num, 10));
  const horaMinutos = h * 60 + m;

  // Domingo (0): bloqueado completamente
  if (diaSemana === 0) {
    return true;
  }

  // Sábado (6): 8:00 AM a 2:00 PM
  if (diaSemana === 6) {
    const inicioSabado = 8 * 60; // 8:00 = 480 minutos
    const finSabado = 14 * 60; // 14:00 = 840 minutos

    // Bloquear antes de las 8:00 AM o después de las 2:00 PM
    if (horaMinutos < inicioSabado || horaMinutos >= finSabado) {
      return true;
    }

    return false; // Dentro del horario permitido en sábado
  }

  // Lunes a Viernes: 8:00 AM a 8:00 PM
  if (diaSemana >= 1 && diaSemana <= 5) {
    const inicioLaboral = 8 * 60; // 8:00 = 480 minutos
    const finLaboral = 20 * 60; // 20:00 = 1200 minutos

    // Bloquear antes de las 8:00 AM o después de las 8:00 PM
    if (horaMinutos < inicioLaboral || horaMinutos >= finLaboral) {
      return true;
    }

    // Horario de refrigerio: 13:00 (1 PM) a 14:00 (2 PM)
    const inicioRefrigerio = 13 * 60; // 13:00 = 780 minutos
    const finRefrigerio = 14 * 60; // 14:00 = 840 minutos

    if (horaMinutos >= inicioRefrigerio && horaMinutos < finRefrigerio) {
      return true;
    }
  }

  return false;
};