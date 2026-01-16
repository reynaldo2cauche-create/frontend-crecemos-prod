import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  School
} from 'lucide-react';
import { ROLES } from '../../constants/roles';

const CalendarioSemanal = ({
  citas = [],
  onSlotClick,
  onCitaClick,
  getEstadoColor,
  fechaActual = new Date(),
  onFechaChange,
  currentUser = null,
  cargando = false
}) => {
  const [diasSemana, setDiasSemana] = useState([]);


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
      // Lunes a Viernes: 9:00 AM a 8:00 PM
      // Break de 1:00 PM (13:00) a 2:00 PM (14:00)
      // Última cita antes del break: 12:40 PM (puede extenderse hasta 13:10 si es de 50 min)
      // Primera cita después del break: 14:00 PM (2:00 PM)

      let minutos = 9 * 60; // 9:00 AM
      const ultimaCitaAntesBreak = 12 * 60 + 40; // 12:40 PM
      const primeraCitaDespuesBreak = 14 * 60; // 14:00 PM (2:00 PM)
      const finMinutos = 20 * 60; // 8:00 PM

      // Horario de la mañana: 9:00 AM hasta 12:40 PM (incluido)
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
            const esHoy = dia.fechaString === new Date().toISOString().split('T')[0];
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
                    const hayCitas = citasInfo && citasInfo.length > 0;
                    const puedeHacerClic = !hayCitas && !esTerapeuta;

                    const handleSlotClick = () => {
                      if (puedeHacerClic && onSlotClick) {
                        onSlotClick(dia, hora);
                      }
                    };

                    return (
                      <div
                        key={`${dia.fechaString}-${hora}`}
                        onClick={handleSlotClick}
                        className={`relative h-[80px] border-b border-gray-200 ${
                          puedeHacerClic
                            ? 'cursor-pointer hover:bg-purple-50/50'
                            : 'cursor-default'
                        } ${esHoy ? 'bg-purple-50/20' : ''}`}
                      >
                        {/* Etiqueta de hora */}
                        <div className="absolute left-2 top-1 text-xs font-semibold text-gray-500 z-20 bg-white/90 px-1.5 py-0.5 rounded shadow-sm">
                          {hora}
                        </div>

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
                              {/* Badge de tipo de cita */}
                              {(() => {
                                const tipoCita = cita.tipo_cita;
                                let badge = { text: 'Cita', color: 'bg-blue-500' };

                                if (tipoCita === 'REUNION_CLINICA') {
                                  badge = { text: 'RC', color: 'bg-purple-500' };
                                } else if (tipoCita === 'VISITA_ESCOLAR') {
                                  badge = { text: 'VE', color: 'bg-orange-500' };
                                }

                                return (
                                  <div className={`absolute top-1 right-1 ${badge.color} text-white text-[9px] font-bold px-1.5 py-0.5 rounded`}>
                                    {badge.text}
                                  </div>
                                );
                              })()}

                              <div className="font-bold text-blue-700 text-[9px] leading-[1.2] break-words line-clamp-2">
                                {(() => {
                                  let nombre = cita.paciente_nombre || 'Paciente';

                                  // Si no hay paciente_nombre, construir nombre completo
                                  if (!cita.paciente_nombre && cita.paciente) {
                                    if (typeof cita.paciente === 'string') {
                                      nombre = cita.paciente;
                                    } else {
                                      const nombres = cita.paciente.nombres || '';
                                      const apellidos = cita.paciente.apellidos ||
                                                       (cita.paciente.apellido_paterno || '') +
                                                       (cita.paciente.apellido_materno ? ' ' + cita.paciente.apellido_materno : '');
                                      nombre = `${nombres} ${apellidos}`.trim() || 'Paciente';
                                    }
                                  }

                                  return nombre;
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
    </div>
  );
};

// Memorizar el componente para evitar re-renders innecesarios
export default React.memo(CalendarioSemanal);