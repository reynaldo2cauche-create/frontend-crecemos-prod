import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User
} from 'lucide-react';
import { ROLES } from '../../constants/roles';
import { esHorarioBloqueado, generarHorasDisponibles } from '../../constants/agendaData';

const CalendarioSemanal = ({
  horas: horasProp,
  citas,
  onSlotClick,
  onCitaClick,
  getEstadoColor,
  getEstadoIcon,
  fechaActual,
  onFechaChange,
  currentUser = null
}) => {
  const [diasSemana, setDiasSemana] = useState([]);

  // Generar todas las horas posibles (8:00 AM - 8:00 PM con intervalos de 40 min)
  // Esto cubre tanto sábados (8:00-14:00) como lunes-viernes (11:00-20:00)
  const todasLasHoras = React.useMemo(() => {
    const horas = [];
    let minutos = 8 * 60; // Empezar a las 8:00 AM
    const finMinutos = 20 * 60; // Terminar a las 8:00 PM

    while (minutos <= finMinutos) {
      const h = Math.floor(minutos / 60);
      const m = minutos % 60;
      horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      minutos += 40; // Intervalos de 40 minutos
    }

    return horas;
  }, []);

  const horas = todasLasHoras;

  useEffect(() => {
    const calcularDiasSemana = (fecha) => {
      const lunes = new Date(fecha);
      lunes.setDate(fecha.getDate() - fecha.getDay() + 1);

      // Solo generar 6 días (lunes a sábado), sin domingo
      const dias = Array.from({length: 6}, (_, i) => {
        const dia = new Date(lunes);
        dia.setDate(lunes.getDate() + i);
        return {
          nombre: dia.toLocaleDateString('es-ES', { weekday: 'long' }),
          numero: dia.getDate(),
          fecha: new Date(dia),
          fechaString: dia.toISOString().split('T')[0]
        };
      });
      return dias;
    };

    setDiasSemana(calcularDiasSemana(fechaActual));
  }, [fechaActual]);

  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(n => parseInt(n, 10));
    return h * 60 + (m || 0);
  };

  const getSlotMinutes = () => {
    if (!horas || horas.length < 2) return 60;
    return Math.abs(toMinutes(horas[1].padStart(5, '0')) - toMinutes(horas[0].padStart(5, '0')));
  };

  const slotDurationMin = getSlotMinutes();

  const getCitasEnSlot = (dia, hora) => {
    const citasEnSlot = citas.filter(c => {
      if (c.fecha !== dia.fechaString) return false;

      const start = c.hora_inicio ? c.hora_inicio.substring(0,5) : (c.hora || null);
      if (!start) return false;

      const startMin = toMinutes(start.padStart(5, '0'));
      const endMin = c.hora_fin ? toMinutes(c.hora_fin.substring(0,5)) : (c.duracion_minutos ? startMin + parseInt(c.duracion_minutos,10) : startMin + slotDurationMin);
      const slotStart = toMinutes(hora.padStart(5, '0'));
      const slotEnd = slotStart + slotDurationMin;

      const cumple = startMin < slotEnd && endMin > slotStart;

      return cumple;
    });

    if (citasEnSlot.length === 0) return null;

    return citasEnSlot.map(cita => {
      const start = cita.hora_inicio ? cita.hora_inicio.substring(0,5) : (cita.hora || '00:00');
      const startMin = toMinutes(start.padStart(5, '0'));
      const endMin = cita.hora_fin ? toMinutes(cita.hora_fin.substring(0,5)) : (c.duracion_minutos ? startMin + parseInt(cita.duracion_minutos,10) : startMin + slotDurationMin);
      const slotStart = toMinutes(hora.padStart(5, '0'));
      const slotEnd = slotStart + slotDurationMin;

      const isTop = startMin >= slotStart && startMin < slotEnd;
      const isBottom = endMin <= slotEnd;

      const duracionMinutos = cita.duracion_minutos || (endMin - startMin);
      const alturaPorSlot = 60;
      const alturaTotal = (duracionMinutos / slotDurationMin) * alturaPorSlot;

      return { cita, isTop, isBottom, alturaTotal };
    });
  };

  const navegarSemana = (direccion) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setDate(fechaActual.getDate() + (direccion * 7));
    onFechaChange(nuevaFecha);
  };

  const irAHoy = () => {
    onFechaChange(new Date());
  };

  const formatearRangoSemana = () => {
    if (diasSemana.length === 0) return '';
    const inicio = diasSemana[0];
    const fin = diasSemana[5]; // Último día es sábado (índice 5)

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

      {/* Tabla del calendario */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
              <th className="w-28 p-3 text-left font-bold text-gray-700 border-b border-gray-200 sticky left-0 bg-gray-50 z-10">
                Hora
              </th>
              {diasSemana.map((dia) => {
                const esHoy = dia.fechaString === new Date().toISOString().split('T')[0];
                return (
                  <th
                    key={dia.fechaString}
                    className={`p-3 text-center border-b border-l border-gray-200 min-w-[140px] ${
                      esHoy ? 'bg-purple-50 border-l-2 border-l-[#7B1FA2]' : ''
                    }`}
                  >
                    <div className="capitalize text-sm font-semibold text-gray-600">
                      {dia.nombre}
                    </div>
                    <div className={`text-2xl font-bold mt-1 ${
                      esHoy ? 'text-[#7B1FA2]' : 'text-gray-700'
                    }`}>
                      {dia.numero}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {horas.map((hora) => (
              <tr key={hora} className="h-[60px] hover:bg-gray-50 transition-colors">
                <td className="p-3 font-semibold text-gray-600 text-sm bg-gray-50 border-r border-b border-gray-200 sticky left-0 z-10">
                  {hora}
                </td>
                {diasSemana.map((dia) => {
                  const citasInfo = getCitasEnSlot(dia, hora);
                  const esHoy = dia.fechaString === new Date().toISOString().split('T')[0];
                  const hayCitas = citasInfo && citasInfo.length > 0;
                  const esTerapeuta = currentUser?.rol?.id === ROLES.TERAPEUTA;

                  // Verificar si la hora está bloqueada según el día de la semana
                  const diaSemana = dia.fecha.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
                  const horaBloqueada = esHorarioBloqueado(hora, diaSemana);

                  const puedeHacerClic = !hayCitas && !esTerapeuta && !horaBloqueada;

                  return (
                    <td
                      key={`${dia.fechaString}-${hora}`}
                      onClick={() => puedeHacerClic && onSlotClick(dia, hora)}
                      className={`relative border-l border-b border-gray-200 ${
                        horaBloqueada
                          ? 'bg-gray-100 cursor-not-allowed'
                          : puedeHacerClic
                            ? 'cursor-pointer hover:bg-purple-50/50'
                            : 'cursor-default'
                      } ${esHoy && !horaBloqueada ? 'bg-purple-50/20' : ''}`}
                    >
                      {horaBloqueada && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs text-gray-400 font-semibold select-none">
                            Bloqueado
                          </span>
                        </div>
                      )}
                      {!horaBloqueada && citasInfo && citasInfo.map((slotInfo, index) => {
                        const cita = slotInfo.cita;
                        if (!slotInfo.isTop) return null;

                        const totalCitas = citasInfo.filter(c => c.isTop).length;
                        const anchoCita = totalCitas === 1 ? 'calc(100% - 4px)' : `calc(${100 / totalCitas}% - 2px)`;
                        const indiceCitaVisible = citasInfo.filter(c => c.isTop).findIndex(c => c.cita.id === cita.id);
                        const leftOffset = totalCitas === 1 ? '2px' : `calc(${(100 / totalCitas) * indiceCitaVisible}%)`;

                        const estadoColor = getEstadoColor(cita.estado);

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
                            className="absolute top-0.5 bg-gradient-to-br from-blue-50 to-blue-100 border border-gray-200 border-l-4 rounded-lg p-2 cursor-pointer hover:shadow-md hover:from-blue-100 hover:to-blue-150 transition-all z-10 overflow-hidden"
                          >
                            {/* Nombre del paciente */}
                            <div className="font-bold text-blue-700 text-xs leading-tight truncate">
                              {(cita.paciente_nombre || cita.paciente || 'Paciente').substring(0, 20)}
                              {(cita.paciente_nombre || cita.paciente || 'Paciente').length > 20 ? '...' : ''}
                            </div>

                            {/* Servicio */}
                            <div className="text-gray-600 text-[10px] leading-tight truncate mt-0.5">
                              {(cita.servicio_nombre || 'Servicio').substring(0, 15)}
                              {(cita.servicio_nombre || 'Servicio').length > 15 ? '...' : ''}
                            </div>

                            {/* Hora y duración */}
                            <div className="flex items-center justify-between mt-1">
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
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CalendarioSemanal;
