import React, { useEffect, useMemo, useState } from 'react';
import {
  Ban,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Loader2,
  AlertCircle,
  Plus,
  School,
  Sparkles,
  Users,
  X
} from 'lucide-react';
import { ROLES } from '../../constants/roles';
import { esFeriado } from '../../constants/feriados';
import { obtenerHorariosDisponiblesSinRestricciones } from './utils/horariosDisponibles';

/* ───────────────────────────── Constantes ───────────────────────────── */

const SLOT_MIN = 40; // duración de cada casilla (min)
const SLOT_HEIGHT = 76; // alto de cada casilla (px)
const DIAS_SEMANA = ['Domingos', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábados'];
const COLOR_ESTADO_DEFAULT = '#7B1FA2';

const BLOCKED_STYLE = {
  backgroundImage:
    'repeating-linear-gradient(135deg, rgba(239,68,68,.06) 0 8px, rgba(239,68,68,.015) 8px 16px)'
};

const HEADER_STYLE = {
  backgroundImage:
    'radial-gradient(60% 140% at 100% 0%, rgba(123,31,162,.14) 0%, rgba(123,31,162,0) 60%), linear-gradient(120deg, #ffffff 0%, #fdfbff 60%, #faf6fe 100%)'
};


const BTN_PRIMARY =
  'w-full rounded-xl bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/25 transition hover:shadow-lg';
const BTN_SECONDARY =
  'flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50';
const BTN_WARNING =
  'flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:shadow-lg';

/** Badge por motivo de cita. El orden importa: "reevaluación" va antes que "evaluación". */
const BADGES = [
  { text: 'EP', color: 'bg-green-100 text-green-700', keywords: ['entrevista de padres', 'entrevista padres'] },
  { text: 'EA', color: 'bg-emerald-100 text-emerald-700', keywords: ['entrevista adolescentes', 'entrevista adultos'] },
  { text: 'REEV', color: 'bg-orange-100 text-orange-700', keywords: ['reevaluacion'] },
  { text: 'EVAL', color: 'bg-yellow-100 text-yellow-700', keywords: ['evaluacion'] },
  { text: 'ST', color: 'bg-blue-100 text-blue-700', keywords: ['sesion de terapia'] },
  { text: 'IV', color: 'bg-indigo-100 text-indigo-700', keywords: ['informe verbal'] },
  { text: 'RC', color: 'bg-purple-100 text-purple-700', keywords: ['reunion clinica'] },
  { text: 'VE', color: 'bg-teal-100 text-teal-700', keywords: ['visita escolar'] }
];
const BADGE_DEFAULT = { text: 'CITA', color: 'bg-gray-100 text-gray-600' };

const rango = (desde, hasta, paso = SLOT_MIN) => {
  const minutos = [];
  for (let m = desde; m <= hasta; m += paso) minutos.push(m);
  return minutos;
};

const HORARIO_SABADO = rango(8 * 60, 20 * 60 - 1);
const HORARIO_ENTRE_SEMANA = [
  ...rango(8 * 60 + 20, 12 * 60 + 20), // mañana
  ...rango(14 * 60, 20 * 60) // tarde (break 13:00–14:00)
];

/* ───────────────────────────── Utilidades ───────────────────────────── */

const pad = (n) => String(n).padStart(2, '0');
const minutosAHHMM = (min) => `${pad(Math.floor(min / 60) % 24)}:${pad(min % 60)}`;
const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
};
const formatearHora = (hhmm) => (hhmm ? `${parseInt(hhmm, 10)}:${hhmm.split(':')[1]}` : '');
const aFechaString = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fechaLocal = (fechaString, opciones) =>
  new Date(`${fechaString}T00:00:00`).toLocaleDateString('es-PE', opciones);
const normalizar = (texto = '') =>
  texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const horasDelDia = (diaSemana) => {
  const minutos = diaSemana === 6 ? HORARIO_SABADO : diaSemana >= 1 ? HORARIO_ENTRE_SEMANA : [];
  return minutos.map(minutosAHHMM);
};

const construirSemana = (fecha) => {
  const lunes = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  lunes.setDate(lunes.getDate() + (fecha.getDay() === 0 ? -6 : 1 - fecha.getDay()));

  return Array.from({ length: 6 }, (_, i) => {
    const f = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + i);
    return {
      nombre: f.toLocaleDateString('es-ES', { weekday: 'long' }),
      numero: f.getDate(),
      fecha: f,
      fechaString: aFechaString(f)
    };
  });
};

const obtenerBadge = (motivoNombre) => {
  const motivo = normalizar(motivoNombre);
  const encontrado = BADGES.find((b) => b.keywords.some((k) => motivo.includes(k)));
  if (encontrado) return encontrado;

  const iniciales = motivoNombre
    .split(' ')
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return iniciales ? { ...BADGE_DEFAULT, text: iniciales } : BADGE_DEFAULT;
};

const obtenerNombrePaciente = (cita) => {
  if (cita.tipo_cita === 'REUNION_CLINICA' && !cita.paciente && !cita.paciente_nombre) {
    return 'Reunión Interna';
  }
  if (cita.paciente && typeof cita.paciente === 'object') {
    const { nombres, apellido_paterno, apellido_materno } = cita.paciente;
    return [nombres, apellido_paterno, apellido_materno].filter(Boolean).join(' ').trim() || 'Paciente';
  }
  return (cita.paciente_nombre || cita.paciente || 'Paciente').trim();
};

const nombreEstado = (estado) =>
  (typeof estado === 'object' ? estado?.nombre : estado) || 'Sin estado';

/** Devuelve el bloqueo activo que cubre la casilla, o null. */
const buscarBloqueo = (bloqueos, dia, slotStart) => {
  const slotEnd = slotStart + SLOT_MIN;

  return (
    bloqueos.find((b) => {
      if (!b.activo) return false;
      if (dia.fechaString < b.fechaInicio || dia.fechaString > b.fechaFin) return false;

      const esRecurrente = b.diaSemana !== null && b.diaSemana !== undefined;
      if (esRecurrente && b.diaSemana !== dia.fecha.getDay()) return false;

      if (b.todoElDia) return true;

      const inicio = b.horaInicio ? toMinutes(b.horaInicio.substring(0, 5)) : 0;
      const fin = b.horaFin ? toMinutes(b.horaFin.substring(0, 5)) : inicio + SLOT_MIN;
      return slotStart < fin && slotEnd > inicio;
    }) || null
  );
};

/* ───────────────────────────── Chips de resumen ───────────────────────────── */

const Chip = ({ color, children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600">
    {color && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />}
    {children}
  </span>
);

/* ───────────────────────────── Piezas del calendario ───────────────────────────── */

const CitaSubtitulo = ({ cita }) => {
  if (cita.tipo_cita === 'REUNION_CLINICA') {
    const cantidad = cita.terapeutas?.length || 0;
    return (
      <>
        <Users className="h-3 w-3 flex-shrink-0 text-purple-600" />
        <span className="truncate">
          {cantidad} terapeuta{cantidad !== 1 ? 's' : ''}
        </span>
      </>
    );
  }

  if (cita.tipo_cita === 'VISITA_ESCOLAR') {
    return (
      <>
        <School className="h-3 w-3 flex-shrink-0 text-orange-600" />
        <span className="truncate">{cita.nombre_colegio || 'Colegio'}</span>
      </>
    );
  }

  const servicio =
    cita.servicio_nombre ||
    (typeof cita.servicio === 'string' ? cita.servicio : cita.servicio?.nombre) ||
    'Servicio';
  return <span className="truncate">{servicio}</span>;
};

const CitaCard = ({ item, slotStart, indice, total, color, onClick }) => {
  const { cita, inicio, fin, duracion } = item;
  const badge = obtenerBadge(cita.motivo?.nombre || '');

  const style = {
    top: ((inicio - slotStart) / SLOT_MIN) * SLOT_HEIGHT + 4,
    height: (duracion / SLOT_MIN) * SLOT_HEIGHT - 8,
    left: total === 1 ? 6 : `calc(${(100 / total) * indice}% + 4px)`,
    width: total === 1 ? 'calc(100% - 12px)' : `calc(${100 / total}% - 8px)`,
    backgroundColor: `color-mix(in srgb, ${color} 18%, white)`
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className="absolute z-10 flex flex-col gap-1 overflow-hidden rounded-2xl p-2.5 text-left transition duration-200 hover:z-20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-900/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B1FA2]"
    >
      <div className="flex items-center justify-between gap-1">
        <span className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold tabular-nums text-gray-600">
          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <span className="truncate">
            {formatearHora(minutosAHHMM(inicio))}–{formatearHora(minutosAHHMM(fin))}
          </span>
        </span>
        <span className={`rounded-full px-1.5 py-px text-[9px] font-bold ${badge.color}`}>{badge.text}</span>
      </div>

      <p className="line-clamp-2 break-words text-[12px] font-bold leading-[1.2] text-gray-900">
        {obtenerNombrePaciente(cita)}
      </p>

      <p className="flex items-center gap-1 text-[10.5px] leading-tight text-gray-500">
        <CitaSubtitulo cita={cita} />
      </p>
    </button>
  );
};

const SlotBloqueado = ({ icon: Icon, titulo, detalle, pista }) => (
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-2">
    <div className="text-center">
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-500 ring-1 ring-red-100">
        <Icon className="h-3 w-3" /> {titulo}
      </span>
      <p className="mt-1 text-[10px] leading-tight text-red-400">{detalle}</p>
      {pista && <p className="mt-0.5 text-[9px] text-red-300">{pista}</p>}
    </div>
  </div>
);

const DiaColumna = ({
  dia,
  esHoy,
  citasDia,
  bloqueos,
  puedeAgendar,
  getEstadoColor,
  onSlotClick,
  onCitaClick,
  onBloqueoClick,
  onFeriadoClick
}) => {
  const feriado = esFeriado(dia.fechaString);
  const horas = horasDelDia(dia.fecha.getDay());

  if (horas.length === 0) {
    return <div className="p-4 text-center text-sm text-gray-400">Sin horario de atención</div>;
  }

  return horas.map((hora) => {
    const slotStart = toMinutes(hora);
    const slotEnd = slotStart + SLOT_MIN;

    const enSlot = citasDia.filter((i) => i.inicio < slotEnd && i.fin > slotStart);
    const visibles = enSlot.filter((i) => i.inicio >= slotStart);
    const hayCitas = enSlot.length > 0;
    const esContinuacion = hayCitas && visibles.length === 0;

    const bloqueo = buscarBloqueo(bloqueos, dia, slotStart);
    const estaBloqueado = Boolean(feriado || bloqueo);
    const puedeClic = !hayCitas && puedeAgendar && !estaBloqueado;

    const handleClick = () => {
      if (feriado) return onFeriadoClick({ feriado, dia, hora });
      if (bloqueo) return onBloqueoClick(bloqueo);
      if (puedeClic) onSlotClick?.(dia, hora);
    };

    const fondo = estaBloqueado
      ? 'cursor-pointer hover:bg-red-50/60'
      : puedeClic
        ? 'cursor-pointer hover:bg-purple-100/60'
        : '';

    return (
      <div
        key={`${dia.fechaString}-${hora}`}
        onClick={handleClick}
        style={estaBloqueado ? BLOCKED_STYLE : undefined}
        className={`group relative border-b border-[#7B1FA2]/[0.06] ${fondo} ${
          esHoy && !estaBloqueado ? 'bg-purple-50/50' : ''
        }`}
      >
        <div style={{ height: SLOT_HEIGHT }} />

        {!esContinuacion && (
          <span
            className={`absolute left-2 top-1.5 text-[10px] font-semibold tabular-nums ${
              estaBloqueado ? 'text-red-400' : 'text-[#7B1FA2]/55'
            }`}
          >
            {hora}
          </span>
        )}

        {puedeClic && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7B1FA2]/10 text-[#7B1FA2]">
              <Plus className="h-4 w-4" />
            </span>
          </span>
        )}

        {!hayCitas && feriado && <SlotBloqueado icon={Sparkles} titulo="Feriado" detalle={feriado.nombre} />}

        {!hayCitas && !feriado && bloqueo && (
          <SlotBloqueado
            icon={Ban}
            titulo="Bloqueado"
            detalle={bloqueo.tipoBloqueo?.nombre || 'Horario no disponible'}
            pista="Click para ver motivo"
          />
        )}

        {visibles.map((item, indice) => (
          <CitaCard
            key={item.cita.id}
            item={item}
            slotStart={slotStart}
            indice={indice}
            total={visibles.length}
            color={getEstadoColor?.(item.cita.estado) || COLOR_ESTADO_DEFAULT}
            onClick={(e) => {
              e.stopPropagation();
              onCitaClick?.({ id: item.cita.id, fecha: dia.fechaString, hora, cita: item.cita });
            }}
          />
        ))}
      </div>
    );
  });
};

/* ───────────────────────────── Modales ───────────────────────────── */

const ModalShell = ({ icon: Icon, title, onClose, footer, children }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D0A4E]/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(45,10,78,0.25)] ring-1 ring-black/5"
      >
        <div className="flex items-center justify-between border-b border-red-100 bg-gradient-to-r from-white to-red-50/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-xl p-2 text-gray-400 transition hover:bg-white hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">{children}</div>
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">{footer}</div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, icon: Icon, children }) => (
  <div>
    <p className="text-xs font-semibold text-gray-400">{label}</p>
    <div className="mt-1 flex items-start gap-2 text-sm text-gray-900">
      {Icon && <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />}
      <div className="flex-1">{children}</div>
    </div>
  </div>
);

const BloqueoModal = ({ bloqueo, onClose }) => {
  const formato = { day: '2-digit', month: 'short', year: 'numeric' };
  const esRango = bloqueo.fechaInicio !== bloqueo.fechaFin;
  const esRecurrente = bloqueo.diaSemana !== null && bloqueo.diaSemana !== undefined;

  return (
    <ModalShell
      icon={Ban}
      title="Horario bloqueado"
      onClose={onClose}
      footer={
        <button type="button" onClick={onClose} className={BTN_PRIMARY}>
          Cerrar
        </button>
      }
    >
      <InfoRow label="Tipo de bloqueo">
        <span className="font-semibold">{bloqueo.tipoBloqueo?.nombre || 'No especificado'}</span>
      </InfoRow>

      <InfoRow label="Período" icon={Calendar}>
        {fechaLocal(bloqueo.fechaInicio, formato)}
        {esRango && ` – ${fechaLocal(bloqueo.fechaFin, formato)}`}
      </InfoRow>

      {(bloqueo.todoElDia || (bloqueo.horaInicio && bloqueo.horaFin)) && (
        <InfoRow label="Horario" icon={Clock}>
          {bloqueo.todoElDia ? (
            <span className="font-semibold text-red-600">Todo el día bloqueado</span>
          ) : (
            `${bloqueo.horaInicio.substring(0, 5)} – ${bloqueo.horaFin.substring(0, 5)}`
          )}
        </InfoRow>
      )}

      {esRecurrente && <InfoRow label="Recurrencia">Todos los {DIAS_SEMANA[bloqueo.diaSemana]}</InfoRow>}

      <InfoRow label="Motivo" icon={AlertCircle}>
        {bloqueo.motivo || 'No especificado'}
      </InfoRow>
    </ModalShell>
  );
};

const FeriadoModal = ({ seleccion, puedeForzar, onClose, onForzar }) => {
  const { feriado } = seleccion;
  const permiteForzar = puedeForzar && Boolean(onForzar);

  return (
    <ModalShell
      icon={Calendar}
      title="Feriado nacional"
      onClose={onClose}
      footer={
        permiteForzar ? (
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={BTN_SECONDARY}>
              Cancelar
            </button>
            <button type="button" onClick={onForzar} className={BTN_WARNING}>
              Crear cita igual
            </button>
          </div>
        ) : (
          <button type="button" onClick={onClose} className={BTN_PRIMARY}>
            Entendido
          </button>
        )
      }
    >
      <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-red-100/60 p-6 text-center">
        <div className="mb-2 text-4xl">🎉</div>
        <h3 className="text-lg font-bold text-red-900">{feriado.nombre}</h3>
        <p className="mt-1 text-sm capitalize text-red-700">
          {fechaLocal(feriado.fecha, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
        <div>
          <p className="text-sm font-semibold text-red-900">
            {puedeForzar ? 'Día feriado nacional' : 'No se pueden agendar citas en feriados'}
          </p>
          <p className="mt-1 text-xs text-red-700">
            {puedeForzar
              ? 'Por defecto el centro no atiende en feriados. Si un terapeuta atenderá este día (se le canjeará por otro), puedes crear la cita igual.'
              : 'Este día está bloqueado automáticamente por ser feriado nacional. El centro permanecerá cerrado.'}
          </p>
        </div>
      </div>
    </ModalShell>
  );
};

/* ───────────────────────────── Componente principal ───────────────────────────── */

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
  const [bloqueoSeleccionado, setBloqueoSeleccionado] = useState(null);
  const [feriadoSeleccionado, setFeriadoSeleccionado] = useState(null); // { feriado, dia, hora }
  const [diaCopiado, setDiaCopiado] = useState(null);

  const rolId = currentUser?.rol?.id;
  const esTerapeuta = rolId === ROLES.TERAPEUTA;
  // Solo Admin/Admisión pueden agendar en feriados.
  const puedeForzarFeriado = rolId === ROLES.ADMINISTRADOR || rolId === ROLES.ADMISION;

  const diasSemana = useMemo(() => construirSemana(fechaActual), [fechaActual]);
  const hoyString = useMemo(
    () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' }), // YYYY-MM-DD
    []
  );

  // Citas normalizadas (minutos de inicio/fin) e indexadas por fecha.
  const citasPorFecha = useMemo(() => {
    const mapa = new Map();

    citas.forEach((cita) => {
      const inicioStr = (cita.hora_inicio || cita.hora)?.substring(0, 5);
      if (!inicioStr) return;

      const inicio = toMinutes(inicioStr.padStart(5, '0'));
      const duracionBase = parseInt(cita.duracion_minutos, 10) || 0;
      const fin = cita.hora_fin
        ? toMinutes(cita.hora_fin.substring(0, 5))
        : inicio + (duracionBase || SLOT_MIN);

      const item = { cita, inicio, fin, duracion: duracionBase || fin - inicio };
      mapa.set(cita.fecha, [...(mapa.get(cita.fecha) || []), item]);
    });

    return mapa;
  }, [citas]);

  // Resumen de la semana visible.
  const resumen = useMemo(() => {
    let total = 0;
    const conteo = new Map();
    diasSemana.forEach((d) =>
      (citasPorFecha.get(d.fechaString) || []).forEach(({ cita }) => {
        total += 1;
        const nombre = nombreEstado(cita.estado);
        const previo = conteo.get(nombre) || { nombre, total: 0, color: getEstadoColor?.(cita.estado) || COLOR_ESTADO_DEFAULT };
        conteo.set(nombre, { ...previo, total: previo.total + 1 });
      })
    );
    return {
      total,
      hoy: citasPorFecha.get(hoyString)?.length || 0,
      estados: [...conteo.values()].sort((a, b) => b.total - a.total)
    };
  }, [diasSemana, citasPorFecha, hoyString, getEstadoColor]);

  const navegarSemana = (direccion) => {
    const nueva = new Date(fechaActual);
    nueva.setDate(fechaActual.getDate() + direccion * 7);
    onFechaChange?.(nueva);
  };

  const formatearRangoSemana = () => {
    if (diasSemana.length === 0) return '';
    const inicio = diasSemana[0];
    const fin = diasSemana[diasSemana.length - 1];
    const mes = (d) => d.fecha.toLocaleDateString('es-ES', { month: 'short' });
    const anio = fin.fecha.getFullYear();

    return inicio.fecha.getMonth() === fin.fecha.getMonth()
      ? `${inicio.numero} - ${fin.numero} ${mes(inicio)} ${anio}`
      : `${inicio.numero} ${mes(inicio)} - ${fin.numero} ${mes(fin)} ${anio}`;
  };

  const copiarHorariosDisponibles = async (dia) => {
    try {
      const horarios = obtenerHorariosDisponiblesSinRestricciones(dia.fechaString, bloqueos, citas);
      if (horarios.length === 0) {
        alert('No hay horarios disponibles para este día');
        return;
      }

      const nombreDia = dia.fecha.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      await navigator.clipboard.writeText(`📅 Horarios disponibles - ${nombreDia}\n\n${horarios.join('\n')}`);
      setDiaCopiado(dia.fechaString);
      setTimeout(() => setDiaCopiado(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
      alert('Error al copiar los horarios');
    }
  };

  const forzarCitaEnFeriado = () => {
    const { dia, hora } = feriadoSeleccionado;
    setFeriadoSeleccionado(null);
    onSlotClick?.(dia, hora);
  };

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-[0_4px_32px_rgba(123,31,162,0.07)] ring-1 ring-gray-100">
      {/* Barra superior */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-5" style={HEADER_STYLE}>
        <div className="min-w-0">
          <h3 className="truncate text-2xl font-extrabold leading-tight text-[#2D0A4E]">{formatearRangoSemana()}</h3>
          <p className="text-[13px] text-gray-400">Agenda semanal del centro</p>
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-2 lg:justify-center">
          <Chip color="#7B1FA2">
            {resumen.total} cita{resumen.total !== 1 ? 's' : ''} esta semana
          </Chip>
          <Chip color="#16A34A">{resumen.hoy} hoy</Chip>
          {resumen.estados.slice(0, 3).map((e) => (
            <Chip key={e.nombre} color={e.color}>
              {e.nombre} · {e.total}
            </Chip>
          ))}
        </div>

        <div className="flex flex-shrink-0 items-center gap-1 rounded-full bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => navegarSemana(-1)}
            title="Semana anterior"
            aria-label="Semana anterior"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-white hover:text-[#7B1FA2] hover:shadow-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onFechaChange?.(new Date())}
            className="rounded-full bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-purple-500/25 transition hover:shadow-lg"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => navegarSemana(1)}
            title="Semana siguiente"
            aria-label="Semana siguiente"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-white hover:text-[#7B1FA2] hover:shadow-sm"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendario */}
      {cargando ? (
        <div className="flex flex-col items-center justify-center gap-3 p-20 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin text-[#7B1FA2]" />
          <span className="text-sm">Cargando agenda…</span>
        </div>
      ) : (
        <div className="max-h-[calc(100vh-220px)] overflow-auto bg-[#F3EEF8]">
          <div className="sticky top-0 z-40 h-3 min-w-[1200px] bg-[#F3EEF8]" aria-hidden />
          <div className="grid min-w-[1200px] grid-cols-6 items-start gap-3 px-3 pb-3">
            {diasSemana.map((dia) => {
              const esHoy = dia.fechaString === hoyString;
              const copiado = diaCopiado === dia.fechaString;

              return (
                <div
                  key={dia.fechaString}
                  style={{ overflow: 'clip' }}
                  className={`rounded-3xl bg-white ${
                    esHoy
                      ? 'shadow-lg shadow-purple-500/15 ring-2 ring-[#7B1FA2]'
                      : 'shadow-[0_1px_8px_rgba(123,31,162,0.06)]'
                  }`}
                >
                  <div className="sticky top-3 z-30 bg-[#F3EEF8]">
                    <div
                      className={`group relative flex flex-col items-center rounded-t-3xl py-3 ${
                        esHoy ? 'bg-[#FAF5FD]' : 'bg-white'
                      }`}
                    >
                      <span className={`text-xs font-semibold capitalize ${esHoy ? 'text-[#7B1FA2]' : 'text-[#5B3B73]'}`}>
                        {dia.nombre}
                      </span>
                      <span
                        className={`text-2xl font-extrabold leading-tight ${esHoy ? 'text-[#7B1FA2]' : 'text-[#3B1259]'}`}
                      >
                        {dia.numero}
                      </span>

                      <button
                        type="button"
                        onClick={() => copiarHorariosDisponibles(dia)}
                        title="Copiar horarios disponibles del día"
                        aria-label="Copiar horarios disponibles del día"
                        className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full transition ${
                          copiado
                            ? 'bg-green-50 text-green-600 opacity-100'
                            : 'text-gray-400 opacity-0 hover:bg-purple-50 hover:text-[#7B1FA2] focus-visible:opacity-100 group-hover:opacity-100'
                        }`}
                      >
                        {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <DiaColumna
                    dia={dia}
                    esHoy={esHoy}
                    citasDia={citasPorFecha.get(dia.fechaString) || []}
                    bloqueos={bloqueos || []}
                    puedeAgendar={!esTerapeuta}
                    getEstadoColor={getEstadoColor}
                    onSlotClick={onSlotClick}
                    onCitaClick={onCitaClick}
                    onBloqueoClick={setBloqueoSeleccionado}
                    onFeriadoClick={setFeriadoSeleccionado}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {bloqueoSeleccionado && <BloqueoModal bloqueo={bloqueoSeleccionado} onClose={() => setBloqueoSeleccionado(null)} />}

      {feriadoSeleccionado && (
        <FeriadoModal
          seleccion={feriadoSeleccionado}
          puedeForzar={puedeForzarFeriado}
          onClose={() => setFeriadoSeleccionado(null)}
          onForzar={forzarCitaEnFeriado}
        />
      )}
    </div>
  );
};

export default React.memo(CalendarioSemanal);