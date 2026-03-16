import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  School,
  Ban,
  X,
  Clock,
  AlertCircle
} from 'lucide-react';
import { ROLES } from '../../constants/roles';

// ✅ Componente memoizado para cada cita individual
const CitaCard = React.memo(({
  cita,
  slotInfo,
  index,
  totalCitas,
  onCitaClick,
  getEstadoColor,
  dia,
  hora
}) => {
  const indiceCitaVisible = slotInfo.citas.filter(c => c.isTop).findIndex(c => c.cita.id === cita.id);
  const anchoCita = totalCitas === 1 ? 'calc(100% - 8px)' : `calc(${100 / totalCitas}% - 4px)`;
  const leftOffset = totalCitas === 1 ? '4px' : `calc(${(100 / totalCitas) * indiceCitaVisible}% + 2px)`;
  const estadoColor = getEstadoColor ? getEstadoColor(cita.estado) : '#7B1FA2';

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onCitaClick && onCitaClick({
      id: cita.id,
      fecha: dia.fechaString,
      hora: hora,
      cita
    });
  }, [cita, dia.fechaString, hora, onCitaClick]);

  // Obtener el motivo de la cita
  const motivoNombre = cita.motivo?.nombre || '';
  let badge = { text: 'CITA', color: 'bg-gray-500' };

  if (motivoNombre.toLowerCase().includes('entrevista de padres') || motivoNombre.toLowerCase().includes('entrevista padres')) {
    badge = { text: 'EP', color: 'bg-green-500' };
  } else if (motivoNombre.toLowerCase().includes('entrevista adolescentes') || motivoNombre.toLowerCase().includes('entrevista adultos')) {
    badge = { text: 'EA', color: 'bg-emerald-500' };
  } else if (motivoNombre.toLowerCase().includes('reevaluación') || motivoNombre.toLowerCase().includes('reevaluacion')) {
    badge = { text: 'REEV', color: 'bg-orange-500' };
  } else if (motivoNombre.toLowerCase().includes('evaluación') || motivoNombre.toLowerCase().includes('evaluacion')) {
    badge = { text: 'EVAL', color: 'bg-yellow-500' };
  } else if (motivoNombre.toLowerCase().includes('sesión de terapia') || motivoNombre.toLowerCase().includes('sesion de terapia')) {
    badge = { text: 'ST', color: 'bg-blue-500' };
  } else if (motivoNombre.toLowerCase().includes('informe verbal')) {
    badge = { text: 'IV', color: 'bg-indigo-500' };
  } else if (motivoNombre.toLowerCase().includes('reunión clínica') || motivoNombre.toLowerCase().includes('reunion clinica')) {
    badge = { text: 'RC', color: 'bg-purple-500' };
  } else if (motivoNombre.toLowerCase().includes('visita escolar')) {
    badge = { text: 'VE', color: 'bg-teal-500' };
  }

  const obtenerHoraFin = (cita) => {
    if (cita.hora_fin) return cita.hora_fin.substring(0, 5);
    if (cita.hora_inicio && cita.duracion_minutos) {
      const [h, m] = cita.hora_inicio.substring(0,5).split(':').map(x => parseInt(x, 10));
      const total = h * 60 + m + parseInt(cita.duracion_minutos, 10);
      const hh = Math.floor(total / 60) % 24;
      const mm = total % 60;
      return `${hh.toString().padStart(2,'0')}:${mm.toString().padStart(2,'0')}`;
    }
    return '';
  };

  return (
    <div
      onClick={handleClick}
      style={{
        width: anchoCita,
        height: `${slotInfo.alturaTotal}px`,
        left: leftOffset,
        borderLeftColor: estadoColor
      }}
      className="absolute top-0.5 bg-gradient-to-br from-blue-50 to-blue-100 border border-gray-200 border-l-4 rounded-lg pt-6 px-2 pb-2 cursor-pointer hover:shadow-md hover:from-blue-100 hover:to-blue-150 transition-all z-10 overflow-hidden"
    >
      <span className={`absolute top-1 left-1 ${badge.color} text-white text-[9px] px-1.5 py-0.5 rounded font-bold`}>
        {badge.text}
      </span>

      <div className="flex flex-col h-full justify-between text-xs">
        <div className="mb-1">
          <p className="font-bold text-gray-900 leading-tight truncate">
            {cita.tipo_cita === 'REUNION_CLINICA' && !cita.paciente && !cita.paciente_nombre
              ? 'Reunión Interna'
              : (() => {
                  if (cita.paciente && typeof cita.paciente === 'object') {
                    return `${cita.paciente.nombres || ''} ${cita.paciente.apellido_paterno || ''} ${cita.paciente.apellido_materno || ''}`.trim();
                  }
                  return cita.paciente_nombre || 'Sin paciente';
                })()}
          </p>
          <p className="text-[10px] text-gray-600 truncate">
            {cita.hora_inicio?.substring(0,5) || cita.hora} - {obtenerHoraFin(cita)}
          </p>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Solo re-renderizar si cambian estos props
  return (
    prevProps.cita.id === nextProps.cita.id &&
    prevProps.slotInfo.alturaTotal === nextProps.slotInfo.alturaTotal &&
    prevProps.totalCitas === nextProps.totalCitas &&
    prevProps.cita.estado === nextProps.cita.estado
  );
});

CitaCard.displayName = 'CitaCard';

const CalendarioSemanal = ({
  citas = [],
  bloqueos = [],
  onSlotClick,
  onCitaClick,
  getEstadoColor,
  fechaActual = new Date(),
  onFechaChange,
  currentUser = null,
  cargando = false
}) => {
  const [diasSemana, setDiasSemana] = useState([]);
  const [modalBloqueoAbierto, setModalBloqueoAbierto] = useState(false);
  const [bloqueoSeleccionado, setBloqueoSeleccionado] = useState(null);


 // Generar horas según el día de la semana
  const generarHorasPorDia = (diaSemana) => {
    const horas = [];

    // Sábado (6): 8:00 AM a 2:00 PM
    if (diaSemana === 6) {
      let minutos = 8 * 60; // 8:00 AM
      const finMinutos = 14 * 60; // 2:00 PM

      while (minutos < finMinutos) {
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        minutos += 40;
      }
    }
    // Lunes a viernes (1-5)
    else if (diaSemana >= 1 && diaSemana <= 5) {
      // Lunes a Viernes: 8:20 AM a 8:00 PM
      // Break de 1:00 PM (13:00) a 2:00 PM (14:00)
      // Última cita antes del break: 12:20 PM (puede extenderse hasta 13:00 si es de 40 min)
      // Primera cita después del break: 14:00 PM (2:00 PM)

      let minutos = 8 * 60 + 20; // 8:20 AM
      const ultimaCitaAntesBreak = 12 * 60 + 20; // 12:20 PM
      const primeraCitaDespuesBreak = 14 * 60; // 14:00 PM (2:00 PM)
      const finMinutos = 20 * 60; // 8:00 PM

      // Horario de la mañana: 8:20 AM hasta 12:20 PM (incluido)
      while (minutos <= ultimaCitaAntesBreak) {
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        minutos += 40;
      }

      // Horario de la tarde: desde 2:00 PM (14:00) hasta 8:00 PM (20:00)
      minutos = primeraCitaDespuesBreak;
      while (minutos <= finMinutos) {
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        minutos += 40;
      }
    }

    return horas;
  };

  useEffect(() => {
    const calcularDiasSemana = (fecha) => {
      // Normalizar a medianoche local para evitar problemas de zona horaria
      const lunes = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
      const diaSemana = fecha.getDay();
      const diasParaLunes = diaSemana === 0 ? -6 : 1 - diaSemana; // Si es domingo (0), retroceder 6 días
      lunes.setDate(lunes.getDate() + diasParaLunes);


      // Generar 6 días: lunes a sábado (0-5)
      const dias = Array.from({length: 6}, (_, i) => {
        // Crear cada día directamente en zona horaria local
        const fechaLocal = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + i);

        // Construir fechaString manualmente para evitar conversión a UTC
        const year = fechaLocal.getFullYear();
        const month = String(fechaLocal.getMonth() + 1).padStart(2, '0');
        const day = String(fechaLocal.getDate()).padStart(2, '0');
        const fechaString = `${year}-${month}-${day}`;

        const diaData = {
          nombre: fechaLocal.toLocaleDateString('es-ES', { weekday: 'long' }),
          numero: fechaLocal.getDate(),
          fecha: fechaLocal,
          fechaString: fechaString
        };

      

        return diaData;
      });

      return dias;
    };

    setDiasSemana(calcularDiasSemana(fechaActual));
  }, [fechaActual]);

  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(n => parseInt(n, 10));
    return h * 60 + (m || 0);
  };

  const slotDurationMin = 40;

  const getCitasEnSlot = (dia, hora) => {
    // Log detallado solo la primera vez que se renderiza cada día
    const shouldLog = hora === '09:00' && citas.length > 0;



    const citasEnSlot = citas.filter(c => {
      const coincide = c.fecha === dia.fechaString;
      if (!coincide) return false;

      const start = c.hora_inicio ? c.hora_inicio.substring(0,5) : (c.hora || null);
      if (!start) return false;

      const startMin = toMinutes(start.padStart(5, '0'));
      const endMin = c.hora_fin ? toMinutes(c.hora_fin.substring(0,5)) : (c.duracion_minutos ? startMin + parseInt(c.duracion_minutos,10) : startMin + slotDurationMin);
      const slotStart = toMinutes(hora.padStart(5, '0'));
      const slotEnd = slotStart + slotDurationMin;

      return startMin < slotEnd && endMin > slotStart;
    });

    if (citasEnSlot.length === 0) return null;

    return citasEnSlot.map(cita => {
      const start = cita.hora_inicio ? cita.hora_inicio.substring(0,5) : (cita.hora || '00:00');
      const startMin = toMinutes(start.padStart(5, '0'));
      const endMin = cita.hora_fin ? toMinutes(cita.hora_fin.substring(0,5)) : (cita.duracion_minutos ? startMin + parseInt(cita.duracion_minutos,10) : startMin + slotDurationMin);
      const slotStart = toMinutes(hora.padStart(5, '0'));
      const slotEnd = slotStart + slotDurationMin;

      const isTop = startMin >= slotStart && startMin < slotEnd;
      const duracionMinutos = cita.duracion_minutos || (endMin - startMin);
      const alturaPorSlot = 80;
      // Para citas de 40 minutos, usar altura exacta de 76px (80px - 4px de padding)
      // Para citas más largas, calcular proporcionalmente pero con margen
      let alturaTotal;
      if (duracionMinutos === 40) {
        alturaTotal = 76; // Encaja perfectamente en la casilla
      } else {
        alturaTotal = (duracionMinutos / slotDurationMin) * alturaPorSlot - 4;
      }

      return { cita, isTop, alturaTotal };
    });
  };

  // Verificar si un slot está bloqueado
  const getBloqueoEnSlot = (dia, hora) => {
    if (!bloqueos || bloqueos.length === 0) return null;

    const slotStart = toMinutes(hora.padStart(5, '0'));
    const slotEnd = slotStart + slotDurationMin;

    // Buscar bloqueo que coincida con este slot
    const bloqueo = bloqueos.find(b => {
      // Verificar si el bloqueo está activo
      if (!b.activo) return false;

      // Verificar si la fecha del slot está dentro del rango del bloqueo
      const fechaSlot = dia.fechaString; // YYYY-MM-DD
      const fechaInicio = b.fechaInicio; // YYYY-MM-DD
      const fechaFin = b.fechaFin; // YYYY-MM-DD

      if (fechaSlot < fechaInicio || fechaSlot > fechaFin) return false;

      // Si es bloqueo recurrente (tiene diaSemana), verificar el día
      if (b.diaSemana !== null && b.diaSemana !== undefined) {
        const diaSlot = dia.fecha.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
        if (b.diaSemana !== diaSlot) return false;
      }

      // Si es todo el día, está bloqueado
      if (b.todoElDia) return true;

      // Verificar horario
      const bloqStart = b.horaInicio ? toMinutes(b.horaInicio.substring(0, 5)) : 0;
      const bloqEnd = b.horaFin ? toMinutes(b.horaFin.substring(0, 5)) : bloqStart + slotDurationMin;

      // Verificar si el slot está dentro del rango de bloqueo
      return slotStart < bloqEnd && slotEnd > bloqStart;
    });

    if (bloqueo) {
      console.log(`🚫 Bloqueo encontrado para ${dia.fechaString} ${hora}:`, bloqueo);
    }

    return bloqueo || null;
  };

  const navegarSemana = (direccion) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setDate(fechaActual.getDate() + (direccion * 7));
    onFechaChange && onFechaChange(nuevaFecha);
  };

  const irAHoy = () => {
    onFechaChange && onFechaChange(new Date());
  };

  const formatearRangoSemana = () => {
    if (diasSemana.length === 0) return '';
    const inicio = diasSemana[0];
    const fin = diasSemana[4]; // Viernes (último día)

    const mesInicio = inicio.fecha.toLocaleDateString('es-ES', { month: 'short' });
    const mesFin = fin.fecha.toLocaleDateString('es-ES', { month: 'short' });

    if (inicio.fecha.getMonth() === fin.fecha.getMonth()) {
      return `${inicio.numero} - ${fin.numero} ${mesInicio} ${fin.fecha.getFullYear()}`;
    } else {
      return `${inicio.numero} ${mesInicio} - ${fin.numero} ${mesFin} ${fin.fecha.getFullYear()}`;
    }
  };

  const formatearHora = (hhmm) => {
    if (!hhmm) return '';
    const [h, m] = hhmm.split(':');
    const numH = parseInt(h, 10);
    return `${numH}:${m}`;
  };

  const obtenerHoraFin = (cita) => {
    if (cita.hora_fin) return formatearHora(cita.hora_fin.substring(0, 5));
    if (cita.hora_inicio && cita.duracion_minutos) {
      const [h, m] = cita.hora_inicio.substring(0,5).split(':').map(x => parseInt(x, 10));
      const total = h * 60 + m + parseInt(cita.duracion_minutos, 10);
      const hh = Math.floor(total / 60) % 24;
      const mm = total % 60;
      return formatearHora(`${hh.toString().padStart(2,'0')}:${mm.toString().padStart(2,'0')}`);
    }
    return '';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header de navegación */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navegarSemana(-1)}
              className="w-10 h-10 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl flex items-center justify-center hover:shadow-lg transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navegarSemana(1)}
              className="w-10 h-10 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl flex items-center justify-center hover:shadow-lg transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={irAHoy}
              className="ml-2 px-4 py-2 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-semibold text-sm flex items-center gap-2 hover:shadow-lg transition-all"
            >
              <Calendar className="w-4 h-4" />
              Hoy
            </button>
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {formatearRangoSemana()}
          </h3>
        </div>
      </div>

      {/* ✅ Indicador de carga */}
      {cargando ? (
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B1FA2]"></div>
        </div>
      ) : (
        <>
          {/* Columnas de días independientes */}
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-180px)]">
            <div className="flex min-w-max">
              {diasSemana.map((dia) => {
            const horasDelDia = generarHorasPorDia(dia.fecha.getDay());
            // ✅ Usar zona horaria de Perú para detectar "hoy"
            const ahora = new Date();
            const fechaPeru = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Lima' }));
            const hoyString = `${fechaPeru.getFullYear()}-${String(fechaPeru.getMonth() + 1).padStart(2, '0')}-${String(fechaPeru.getDate()).padStart(2, '0')}`;
            const esHoy = dia.fechaString === hoyString;
            const esTerapeuta = currentUser?.rol?.id === ROLES.TERAPEUTA;

            return (
              <div key={dia.fechaString} className="flex-1 min-w-[200px] border-r border-gray-200 last:border-r-0">
                {/* Header del día */}
                <div className={`p-3 text-center border-b border-gray-200 sticky top-0 z-30 ${
                  esHoy ? 'bg-purple-50 border-b-2 border-b-[#7B1FA2]' : 'bg-gradient-to-r from-gray-50 to-gray-100'
                }`}>
                  <div className="capitalize text-sm font-semibold text-gray-600">
                    {dia.nombre}
                  </div>
                  <div className={`text-2xl font-bold mt-1 ${
                    esHoy ? 'text-[#7B1FA2]' : 'text-gray-700'
                  }`}>
                    {dia.numero}
                  </div>
                </div>

                {/* Horas del día */}
                <div>
                  {horasDelDia.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      No hay horarios disponibles para este día
                    </div>
                  )}
                  {horasDelDia.map((hora) => {
                    const citasInfo = getCitasEnSlot(dia, hora);
                    const bloqueo = getBloqueoEnSlot(dia, hora);
                    const hayCitas = citasInfo && citasInfo.length > 0;
                    const estaBloqueado = !!bloqueo;
                    const puedeHacerClic = !hayCitas && !esTerapeuta && !estaBloqueado;

                    const handleSlotClick = () => {
                      // Si está bloqueado, mostrar modal con información del bloqueo
                      if (estaBloqueado && bloqueo) {
                        setBloqueoSeleccionado(bloqueo);
                        setModalBloqueoAbierto(true);
                      } else if (puedeHacerClic && onSlotClick) {
                        onSlotClick(dia, hora);
                      }
                    };

                    return (
                      <div
                        key={`${dia.fechaString}-${hora}`}
                        onClick={handleSlotClick}
                        className={`relative h-[80px] border-b border-gray-200 ${
                          estaBloqueado
                            ? 'bg-red-50 cursor-pointer hover:bg-red-100'
                            : puedeHacerClic
                            ? 'cursor-pointer hover:bg-purple-50/50'
                            : 'cursor-default'
                        } ${esHoy && !estaBloqueado ? 'bg-purple-50/20' : ''}`}
                      >
                        {/* Etiqueta de hora */}
                        <div className={`absolute left-2 top-1 text-xs font-semibold z-20 px-1.5 py-0.5 rounded shadow-sm ${
                          estaBloqueado ? 'bg-red-100 text-red-700' : 'bg-white/90 text-gray-500'
                        }`}>
                          {hora}
                        </div>

                        {/* Indicador de bloqueo */}
                        {estaBloqueado && !hayCitas && (
                          <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
                            <div className="text-center">
                              <div className="text-red-600 font-bold text-xs mb-1">🚫 BLOQUEADO</div>
                              <div className="text-red-500 text-[10px]">
                                {bloqueo.tipoBloqueo?.nombre || 'Horario no disponible'}
                              </div>
                              <div className="text-red-400 text-[9px] mt-1 italic">
                                Click para ver motivo
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Citas */}
                        {citasInfo && citasInfo.map((slotInfo, index) => {
                          const cita = slotInfo.cita;
                          if (!slotInfo.isTop) return null;

                          const totalCitas = citasInfo.filter(c => c.isTop).length;
                          const anchoCita = totalCitas === 1 ? 'calc(100% - 8px)' : `calc(${100 / totalCitas}% - 4px)`;
                          const indiceCitaVisible = citasInfo.filter(c => c.isTop).findIndex(c => c.cita.id === cita.id);
                          const leftOffset = totalCitas === 1 ? '4px' : `calc(${(100 / totalCitas) * indiceCitaVisible}% + 2px)`;

                          const estadoColor = getEstadoColor ? getEstadoColor(cita.estado) : '#7B1FA2';

                          return (
                            <div
                              key={`${cita.id}-${index}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onCitaClick && onCitaClick({
                                  id: cita.id,
                                  fecha: dia.fechaString,
                                  hora: hora,
                                  cita
                                });
                              }}
                              style={{
                                width: anchoCita,
                                height: `${slotInfo.alturaTotal}px`,
                                left: leftOffset,
                                borderLeftColor: estadoColor
                              }}
                              className="absolute top-0.5 bg-gradient-to-br from-blue-50 to-blue-100 border border-gray-200 border-l-4 rounded-lg pt-6 px-2 pb-2 cursor-pointer hover:shadow-md hover:from-blue-100 hover:to-blue-150 transition-all z-10 overflow-hidden"
                            >
                              {/* Badge de motivo de cita */}
                              {(() => {
                                // Obtener el motivo de la cita
                                const motivoNombre = cita.motivo?.nombre || '';
                                let badge = { text: 'CITA', color: 'bg-gray-500' };

                                // Abreviaturas según los motivos reales del sistema
                                // ⚠️ IMPORTANTE: Verificar "reevaluación" ANTES que "evaluación"
                                // porque "reevaluación" contiene la palabra "evaluación"
                                if (motivoNombre.toLowerCase().includes('entrevista de padres') || motivoNombre.toLowerCase().includes('entrevista padres')) {
                                  badge = { text: 'EP', color: 'bg-green-500' }; // Entrevista de Padres
                                } else if (motivoNombre.toLowerCase().includes('entrevista adolescentes') || motivoNombre.toLowerCase().includes('entrevista adultos')) {
                                  badge = { text: 'EA', color: 'bg-emerald-500' }; // Entrevista Adolescentes/Adultos
                                } else if (motivoNombre.toLowerCase().includes('reevaluación') || motivoNombre.toLowerCase().includes('reevaluacion')) {
                                  badge = { text: 'REEV', color: 'bg-orange-500' }; // Reevaluación
                                } else if (motivoNombre.toLowerCase().includes('evaluación') || motivoNombre.toLowerCase().includes('evaluacion')) {
                                  badge = { text: 'EVAL', color: 'bg-yellow-500' }; // Evaluación
                                } else if (motivoNombre.toLowerCase().includes('sesión de terapia') || motivoNombre.toLowerCase().includes('sesion de terapia')) {
                                  badge = { text: 'ST', color: 'bg-blue-500' }; // Sesión de Terapia
                                } else if (motivoNombre.toLowerCase().includes('informe verbal')) {
                                  badge = { text: 'IV', color: 'bg-indigo-500' }; // Informe Verbal
                                } else if (motivoNombre.toLowerCase().includes('reunión clínica') || motivoNombre.toLowerCase().includes('reunion clinica')) {
                                  badge = { text: 'RC', color: 'bg-purple-500' }; // Reunión Clínica
                                } else if (motivoNombre.toLowerCase().includes('visita escolar')) {
                                  badge = { text: 'VE', color: 'bg-teal-500' }; // Visita Escolar
                                } else if (motivoNombre) {
                                  // Generar abreviatura automática si hay un motivo nuevo
                                  const palabras = motivoNombre.split(' ').filter(p => p.length > 2);
                                  badge.text = palabras.slice(0, 2).map(p => p[0]).join('').toUpperCase();
                                }

                                return (
                                  <div className={`absolute top-1 right-1 ${badge.color} text-white text-[9px] font-bold px-1.5 py-0.5 rounded`}>
                                    {badge.text}
                                  </div>
                                );
                              })()}

                              <div className="font-bold text-blue-700 text-[9px] leading-[1.2] break-words line-clamp-2">
                                {(() => {
                                  // Si es reunión clínica sin paciente, mostrar "Reunión Interna"
                                  if (cita.tipo_cita === 'REUNION_CLINICA' && !cita.paciente && !cita.paciente_nombre) {
                                    return 'Reunión Interna';
                                  }

                                  // Extraer del objeto paciente directamente - NOMBRE COMPLETO
                                  if (cita.paciente && typeof cita.paciente === 'object') {
                                    const nombres = cita.paciente.nombres || '';
                                    const apellidoPaterno = cita.paciente.apellido_paterno || '';
                                    const apellidoMaterno = cita.paciente.apellido_materno || '';
                                    return `${nombres} ${apellidoPaterno} ${apellidoMaterno}`.trim() || 'Paciente';
                                  } else if (cita.paciente_nombre || (cita.paciente && typeof cita.paciente === 'string')) {
                                    // Si viene como string, mostrar completo
                                    return (cita.paciente_nombre || cita.paciente || 'Paciente').trim();
                                  }

                                  return 'Paciente';
                                })()}
                              </div>

                              <div className="text-gray-600 text-[10px] leading-tight truncate mt-0 flex items-center gap-1">
                                {(() => {
                                  const tipoCita = cita.tipo_cita;

                                  // REUNIÓN CLÍNICA: Mostrar cantidad de terapeutas
                                  if (tipoCita === 'REUNION_CLINICA') {
                                    const cantTerapeutas = cita.terapeutas?.length || 0;
                                    return (
                                      <>
                                        <Users className="w-3 h-3 flex-shrink-0 text-purple-600" />
                                        <span className="truncate">{cantTerapeutas} terapeuta{cantTerapeutas !== 1 ? 's' : ''}</span>
                                      </>
                                    );
                                  }

                                  // VISITA ESCOLAR: Mostrar nombre del colegio
                                  if (tipoCita === 'VISITA_ESCOLAR') {
                                    const colegio = cita.nombre_colegio || 'Colegio';
                                    return (
                                      <>
                                        <School className="w-3 h-3 flex-shrink-0 text-orange-600" />
                                        <span className="truncate">{colegio.substring(0, 12)}{colegio.length > 12 ? '...' : ''}</span>
                                      </>
                                    );
                                  }

                                  // CITA NORMAL: Mostrar servicio
                                  const servicio = cita.servicio_nombre ||
                                                  (typeof cita.servicio === 'string' ? cita.servicio : cita.servicio?.nombre) ||
                                                  'Servicio';
                                  return <span className="truncate">{servicio.substring(0, 15) + (servicio.length > 15 ? '...' : '')}</span>;
                                })()}
                              </div>

                              <div className="flex items-center justify-between mt-0">
                                <span className="text-[10px] font-bold text-gray-600">
                                  {formatearHora(cita.hora_inicio ? cita.hora_inicio.substring(0, 5) : hora)}-{obtenerHoraFin(cita)}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 bg-gray-500 text-white rounded-full font-semibold">
                                  {cita.duracion_minutos || 60}m
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
        </>
      )}

      {/* Modal de Información de Bloqueo */}
      {modalBloqueoAbierto && bloqueoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <Ban className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Horario Bloqueado</h2>
                </div>
                <button
                  onClick={() => setModalBloqueoAbierto(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              {/* Tipo de Bloqueo */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Tipo de Bloqueo</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {bloqueoSeleccionado.tipoBloqueo?.nombre || 'No especificado'}
                </p>
              </div>

              {/* Período */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Período</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-900">
                    {new Date(bloqueoSeleccionado.fechaInicio + 'T00:00:00').toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                    {bloqueoSeleccionado.fechaInicio !== bloqueoSeleccionado.fechaFin && (
                      <> - {new Date(bloqueoSeleccionado.fechaFin + 'T00:00:00').toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}</>
                    )}
                  </p>
                </div>
              </div>

              {/* Horario */}
              {!bloqueoSeleccionado.todoElDia && bloqueoSeleccionado.horaInicio && bloqueoSeleccionado.horaFin && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Horario</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-900">
                      {bloqueoSeleccionado.horaInicio.substring(0, 5)} - {bloqueoSeleccionado.horaFin.substring(0, 5)}
                    </p>
                  </div>
                </div>
              )}

              {bloqueoSeleccionado.todoElDia && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Horario</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-semibold text-red-600">Todo el día bloqueado</p>
                  </div>
                </div>
              )}

              {/* Día recurrente */}
              {bloqueoSeleccionado.diaSemana !== null && bloqueoSeleccionado.diaSemana !== undefined && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Recurrencia</label>
                  <p className="text-sm text-gray-900 mt-1">
                    Todos los {['Domingos', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábados'][bloqueoSeleccionado.diaSemana]}
                  </p>
                </div>
              )}

              {/* Motivo */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Motivo</label>
                <div className="flex items-start gap-2 mt-1">
                  <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-900 flex-1">{bloqueoSeleccionado.motivo || 'No especificado'}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
              <button
                onClick={() => setModalBloqueoAbierto(false)}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Memorizar el componente para evitar re-renders innecesarios
export default React.memo(CalendarioSemanal);