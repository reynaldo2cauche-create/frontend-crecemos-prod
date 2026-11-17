import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Briefcase,
  Building2,
  Calendar,
  Check,
  Clock,
  Copy,
  FileText,
  History,
  MessageCircle,
  Package,
  Plus,
  Save,
  Search,
  Trash2,
  User,
  Users,
  X
} from 'lucide-react';
import { useBusquedaPacientes } from '../../hooks/useBusquedaPacientes';
import { useServicios } from '../../hooks/useServicios';
import { useMotivosCita } from '../../hooks/useMotivosCita';
import { useHistorialCita } from '../../hooks/useHistorialCita';
import { useTrabajadores } from '../../hooks/useTrabajadores';
import { useGeofencing } from '../../hooks/useGeofencing';
import { ROLES } from '../../constants/roles';
import { esFeriado } from '../../constants/feriados';
import api from '../../services/api';
import {
  getVentasDisponibles,
  getListadoCitasPorPaciente,
  getInfoVentaDeCita
} from '../../services/citaService';
import { getVentaServicioById } from '../../services/ventasService';
import { obtenerBloqueosPorTerapeuta } from '../../services/bloqueoService';
import DetalleVentaModal from '../Ventas/DetalleVentaModal';

/* ═══════════════════════════ Constantes ═══════════════════════════ */

const SLOT_MIN = 40;
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const ESTADO_ASISTIO = 7;
const ESTADO_DICTADA = 6;
const TIPOS_CITA = { NORMAL: 'Cita normal', REUNION_CLINICA: 'Reunión clínica', VISITA_ESCOLAR: 'Visita escolar' };
const ORDEN_AREAS = ['Área Infantil', 'Infantil y Adolescentes', 'Área Adolescentes y Adultos', 'Adultos', 'Otros'];
const ENCARGADO_VACIO = { nombre_completo: '', telefono: '', institucion: '' };
const SLOT_VACIO = { fecha: '', horaInicio: '' };

const AVISO_PAGO =
  '\n\n💳 Asimismo, para poder mantener reservado el horario, le agradeceríamos realizar el pago correspondiente dentro de las próximas *12 horas* posteriores a la atención.';

const TEXTO_BLOQUEO = {
  NORMAL: {
    dia: 'Tiene bloqueado todo este día. Elige otra fecha u otro terapeuta.',
    hora: (h) => `Tiene bloqueada la hora ${h}. Elige otra hora u otro terapeuta.`
  },
  REUNION_CLINICA: {
    dia: 'Algún terapeuta del equipo tiene bloqueado todo este día. Elige otra fecha o quita ese terapeuta.',
    hora: (h) => `Algún terapeuta del equipo tiene bloqueada la hora ${h}. Elige otra hora o quita ese terapeuta.`
  },
  VISITA_ESCOLAR: {
    dia: 'Tiene bloqueado todo este día. Elige otra fecha.',
    hora: (h) => `Tiene bloqueada la hora ${h}. Elige otra hora.`
  }
};

const HEADER_STYLE = {
  backgroundImage:
    'radial-gradient(70% 140% at 100% 0%, rgba(123,31,162,.07) 0%, rgba(123,31,162,0) 60%), linear-gradient(120deg, #ffffff 0%, #fdfbff 60%, #faf6fe 100%)'
};

const INPUT =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-[0_1px_2px_rgba(16,24,40,0.03)] transition hover:border-gray-300 focus:border-[#7B1FA2] focus:outline-none focus:ring-4 focus:ring-[#7B1FA2]/15 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60';
const BTN_PRIMARY =
  'flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/25 transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50';
const BTN_OUTLINE =
  'rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50';
const BTN_GHOST =
  'flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#7B1FA2] transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-40';

const TONOS_AVISO = {
  red: { box: 'border-red-100 bg-red-50', icono: 'text-red-500', titulo: 'text-red-800', texto: 'text-red-600' },
  yellow: { box: 'border-yellow-100 bg-yellow-50', icono: 'text-yellow-600', titulo: 'text-yellow-800', texto: 'text-yellow-700' },
  amber: { box: 'border-amber-200 bg-amber-50', icono: 'text-amber-600', titulo: 'text-amber-800', texto: 'text-amber-700' },
  purple: { box: 'border-purple-100 bg-purple-50', icono: 'text-purple-600', titulo: 'text-purple-800', texto: 'text-purple-700' },
  blue: { box: 'border-blue-100 bg-blue-50', icono: 'text-blue-600', titulo: 'text-blue-800', texto: 'text-blue-700' },
  green: { box: 'border-green-100 bg-green-50', icono: 'text-green-600', titulo: 'text-green-800', texto: 'text-green-700' }
};

const TONOS_PILL = {
  purple: 'border-purple-100 bg-purple-50 text-purple-700',
  blue: 'border-blue-100 bg-blue-50 text-blue-700',
  green: 'border-green-100 bg-green-50 text-green-700',
  red: 'border-red-100 bg-red-50 text-red-700',
  yellow: 'border-yellow-100 bg-yellow-50 text-yellow-700',
  gray: 'border-gray-100 bg-gray-50 text-gray-400'
};

const TONOS_DIALOGO = {
  error: { header: 'from-red-50 to-white border-red-100', icono: 'bg-red-100 text-red-600', boton: 'from-red-600 to-red-700', Icono: AlertCircle },
  warning: { header: 'from-amber-50 to-white border-amber-100', icono: 'bg-amber-100 text-amber-600', boton: 'from-orange-500 to-orange-600', Icono: AlertTriangle },
  feriado: { header: 'from-orange-50 to-white border-orange-100', icono: 'bg-orange-100 text-orange-600', boton: 'from-orange-500 to-orange-600', Icono: Calendar }
};

const OPERACIONES = {
  CREATE: { Icono: Plus, estilo: 'border-green-200 bg-green-50 text-green-700' },
  UPDATE: { Icono: Save, estilo: 'border-blue-200 bg-blue-50 text-blue-700' },
  DELETE: { Icono: Trash2, estilo: 'border-red-200 bg-red-50 text-red-700' }
};
const OPERACION_DEFAULT = { Icono: History, estilo: 'border-gray-200 bg-gray-50 text-gray-700' };

const ASISTENCIA = {
  recepcion: { endpoint: '/asistencia/registrar-recepcion', campoUsuario: 'usuario_id' },
  terapeuta: { endpoint: '/asistencia/registrar-terapeuta', campoUsuario: 'terapeuta_id' }
};

/* ═══════════════════════════ Utilidades puras ═══════════════════════════ */

const toMin = (hhmm = '') => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
};
const aHHMM = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const haySolapamiento = (aIni, aFin, bIni, bFin) => aIni < bFin && aFin > bIni;
const duracionDe = (cita) => parseInt(cita.duracion_minutos, 10) || SLOT_MIN;
const idsValidos = (valores) => valores.map((v) => parseInt(v, 10)).filter((id) => id && !Number.isNaN(id));
const igual = (valor, n) => valor !== null && valor !== undefined && valor !== '' && Number(valor) === n;

const rango = (desde, hasta, paso = SLOT_MIN) => {
  const minutos = [];
  for (let m = desde; m <= hasta; m += paso) minutos.push(m);
  return minutos;
};
const HORAS_SABADO = rango(8 * 60, 20 * 60 - 1).map(aHHMM);
const HORAS_ENTRE_SEMANA = [...rango(8 * 60 + 20, 12 * 60 + 20), ...rango(14 * 60, 20 * 60)].map(aHHMM);

const horasDelDia = (fecha) => {
  const dia = new Date(`${fecha}T00:00:00`).getDay();
  if (dia === 6) return HORAS_SABADO;
  return dia >= 1 && dia <= 5 ? HORAS_ENTRE_SEMANA : [];
};

const ajustarHoraMasCercana = (horasValidas, horaActual) => {
  if (horasValidas.includes(horaActual)) return horaActual;
  if (horasValidas.length === 0) return '';
  if (!horaActual) return horasValidas[0];
  const objetivo = toMin(horaActual);
  return horasValidas.reduce(
    (mejor, h) => (Math.abs(toMin(h) - objetivo) < Math.abs(toMin(mejor) - objetivo) ? h : mejor),
    horasValidas[0]
  );
};

const desplazarHora = (hhmm, delta) => {
  const total = toMin(hhmm) + delta;
  return total >= 0 && total < 24 * 60 ? aHHMM(total) : null;
};

const formatearHora12 = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`;
};

// Las fechas "YYYY-MM-DD" se interpretan en hora local (new Date('YYYY-MM-DD') las toma como UTC y retrasa un día).
const fechaLocal = (fecha, opciones) =>
  new Date(`${String(fecha).slice(0, 10)}T00:00:00`).toLocaleDateString('es-ES', opciones);

const formatearFechaRecordatorio = (fecha) => {
  const [y, m, d] = fecha.split('-').map(Number);
  const f = new Date(y, m - 1, d);
  return `${DIAS[f.getDay()]}, ${f.getDate()} de ${MESES[f.getMonth()]}`;
};

const formatearFechaHistorial = (fecha) =>
  new Date(fecha).toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

const obtenerSaludo = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches';
};

const formatearNombreTitulo = (nombre) =>
  nombre.toLowerCase().split(' ').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

const obtenerIniciales = (nombre = '') =>
  nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

const tieneResponsableActivo = (paciente) =>
  Array.isArray(paciente?.responsables) && paciente.responsables.some((r) => [true, 1, '1'].includes(r.activo));

const getServicioNombre = (cita) => {
  if (cita.tipo_cita === 'NORMAL' && cita.servicio) return cita.servicio.nombre;
  if (cita.tipo_cita === 'VISITA_ESCOLAR') return 'Visita Escolar';
  if (cita.tipo_cita === 'REUNION_CLINICA') return 'Reunión Clínica';
  return 'Servicio no especificado';
};

const getServicioConMotivo = (cita) => {
  const motivo = cita.motivo?.nombre;
  return motivo ? `${getServicioNombre(cita)} - ${motivo}` : getServicioNombre(cita);
};

const getTerapeutaNombre = (cita) => {
  if ((cita.tipo_cita === 'NORMAL' || cita.tipo_cita === 'VISITA_ESCOLAR') && cita.doctor) {
    return `Lic. ${cita.doctor.nombres || ''} ${cita.doctor.apellidos || ''}`.trim();
  }
  if (cita.tipo_cita === 'REUNION_CLINICA' && cita.terapeutas?.length > 0) return 'Equipo de Terapeutas';
  return 'Terapeuta no especificado';
};

/* ── Conflictos de agenda ── */

const idsTerapeutasDeCita = (c) =>
  (c.terapeutas || []).map((t) => t.id_terapeuta || t.terapeuta_id || t.id).filter(Boolean);

const citaInvolucraTerapeutas = (c, ids) => {
  if (c.tipo_cita === 'NORMAL' || c.tipo_cita === 'VISITA_ESCOLAR') return ids.includes(c.doctor_id);
  if (c.tipo_cita === 'REUNION_CLINICA') return ids.some((id) => idsTerapeutasDeCita(c).includes(id));
  return false;
};

const bloqueoCubreFecha = (b, fecha, terapeutasIds) => {
  if (!b.activo || !terapeutasIds.includes(Number(b.trabajadorId))) return false;
  if (fecha < b.fechaInicio || fecha > b.fechaFin) return false;
  const esRecurrente = b.diaSemana !== null && b.diaSemana !== undefined;
  return !esRecurrente || b.diaSemana === new Date(`${fecha}T00:00:00`).getDay();
};

const buscarConflicto = (slots, citasPorFecha, duracion, coincide) => {
  for (const { fecha, horaInicio } of slots) {
    const delDia = citasPorFecha.get(fecha);
    if (!delDia || !horaInicio) continue;
    const inicio = toMin(horaInicio);
    const conflicto = delDia.find((c) => {
      if (!coincide(c)) return false;
      const cInicio = toMin(c.hora_inicio);
      return haySolapamiento(inicio, inicio + duracion, cInicio, cInicio + duracionDe(c));
    });
    if (conflicto) return conflicto;
  }
  return null;
};

const obtenerCitasPorFecha = async (fechas) => {
  const entradas = await Promise.all(
    fechas.map(async (fecha) => {
      try {
        const { data } = await api.get('/citas', { params: { fecha_desde: fecha, fecha_hasta: fecha } });
        return [fecha, Array.isArray(data) ? data : []];
      } catch (err) {
        console.warn('No se pudo verificar conflictos:', err.message);
        return [fecha, null];
      }
    })
  );
  return new Map(entradas.filter(([, citas]) => citas));
};

const buscarBloqueoRemoto = async (slots, terapeutasIds) => {
  for (const { fecha, horaInicio } of slots) {
    if (!fecha || !horaInicio) continue;
    const hora = horaInicio.length === 5 ? `${horaInicio}:00` : horaInicio;
    for (const trabajadorId of terapeutasIds) {
      try {
        const { data } = await api.post('/bloqueos/verificar', { trabajadorId, fecha, hora });
        if (data?.bloqueado) return { trabajadorId, fecha, horaInicio };
      } catch (err) {
        console.warn('No se pudo verificar bloqueo:', err.message);
      }
    }
  }
  return null;
};

/* ── Paquete ── */

const paquetesDe = (servicio) =>
  Array.isArray(servicio.paquetes) ? servicio.paquetes : Object.values(servicio.paquetes || {});

const buscarPaquete = (servicios, detalleId) => {
  for (const servicio of servicios) {
    const paquete = paquetesDe(servicio).find((p) => Number(p.venta_servicio_detalle_id) === Number(detalleId));
    if (paquete) return { ...paquete, servicio_nombre: servicio.servicio_nombre, servicio_id: servicio.servicio_id };
  }
  return null;
};

/** Un combo reúne las citas de todas sus líneas (distintos motivos). */
const consolidarCombo = (paquete, servicios) => {
  const lineas = servicios.flatMap((servicio) =>
    paquetesDe(servicio)
      .filter((p) => p.paquete_combo_id === paquete.paquete_combo_id)
      .map((p) => ({ paquete: p, servicio }))
  );

  return {
    ...paquete,
    paquete_nombre: paquete.paquete_combo_nombre || paquete.paquete_nombre,
    citas: lineas.flatMap(({ paquete: p, servicio }) =>
      p.citas.map((c) => ({ ...c, linea_servicio: servicio.servicio_nombre }))
    ),
    sesiones_totales: lineas.reduce((acc, { paquete: p }) => acc + (p.sesiones_totales || 0), 0),
    es_combo: true
  };
};

const asistio = (c) => (igual(c.terapeuta_estado_id, 7) && igual(c.recepcion_estado_id, 7)) || igual(c.asistencia, 1);
const noAsistio = (c) => (igual(c.terapeuta_estado_id, 6) && igual(c.recepcion_estado_id, 6)) || igual(c.asistencia, 0);
const porFechaHora = (a, b) => new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`);

/* ── Mensaje de recordatorio ── */

const textoSesionesFaltantes = (n) => (n === 1 ? 'falta *1 sesión*' : `faltan *${n} sesiones*`);

const detalleUltima = ({ info, cita, unitaria }) => {
  const svc = getServicioConMotivo(cita);
  const total = info.sesiones_totales;
  if (unitaria) {
    return `• La cita de *${svc}* corresponde a la ${total === 1 ? 'sesión adquirida' : `última de las *${total} sesiones* adquiridas`}.`;
  }
  if (info.informe_verbal_pendiente) {
    return `• Con la cita de *${svc}* se completan las sesiones de *Evaluación* del paquete (${total} sesiones). Aún queda pendiente el *Informe Verbal*.`;
  }
  return `• La cita de *${svc}* corresponde a la última sesión del paquete contratado (${total} sesiones).`;
};

const avisoUltimas = (ultimas, hayVarias) => {
  if (ultimas.length > 1) {
    return `\n\n📌 Le comentamos también que:\n${ultimas.map(detalleUltima).join('\n')}\n\nEn caso deseen continuar con sus terapias y mantener su horario habitual, les recomendamos coordinar la renovación con anticipación.${AVISO_PAGO}`;
  }
  const { info, cita, unitaria } = ultimas[0];
  const sujeto = hayVarias ? `la cita de *${getServicioConMotivo(cita)}*` : 'esta';
  const total = info.sesiones_totales;
  if (unitaria) {
    return `\n\n📌 Le comentamos también que ${sujeto} corresponde a la ${total === 1 ? 'sesión adquirida' : `última de las *${total} sesiones* adquiridas`}. En caso deseen continuar con sus terapias, les recomendamos coordinar una nueva contratación con anticipación.${AVISO_PAGO}`;
  }
  if (info.informe_verbal_pendiente) {
    return `\n\n📌 Con ${sujeto} se completan las sesiones de *Evaluación* del paquete contratado (${total} sesiones). Recuerden que aún queda pendiente agendar el *Informe Verbal* incluido en el paquete. Les recomendamos coordinarlo pronto.${AVISO_PAGO}`;
  }
  return `\n\n📌 Le comentamos también que ${sujeto} corresponde a la última sesión del paquete contratado (${total} sesiones). En caso deseen continuar con sus terapias y mantener su horario habitual, les recomendamos coordinar la renovación con anticipación.${AVISO_PAGO}`;
};

const detallePenultima = ({ info, cita, unitaria }) => {
  const svc = getServicioConMotivo(cita);
  const total = info.sesiones_totales;
  if (unitaria) return `• De las ${total} sesiones de *${svc}*, solo quedará *1 sesión más*.`;
  if (info.informe_verbal_pendiente) {
    return `• Del paquete de *${svc}* (${total} sesiones), solo quedará *1 sesión más de Evaluación* y el *Informe Verbal*.`;
  }
  return `• Del paquete de *${svc}* (${total} sesiones), solo quedará *1 sesión más* por agendar.`;
};

const avisoPenultimas = (penultimas, hayVarias) => {
  if (penultimas.length > 1) return `\n\n📌 *Recordatorio:*\n${penultimas.map(detallePenultima).join('\n')}`;
  const { info, cita, unitaria } = penultimas[0];
  const sujeto = hayVarias ? `la cita de *${getServicioConMotivo(cita)}*` : 'esta cita';
  const total = info.sesiones_totales;
  if (unitaria) {
    return `\n\n📌 *Recordatorio:* Luego de ${sujeto}, solo quedará *1 sesión más* de las ${total} sesiones adquiridas. Le recomendamos ir coordinando la contratación de más sesiones para continuar con su proceso.`;
  }
  if (info.informe_verbal_pendiente) {
    return `\n\n📌 *Recordatorio:* Luego de ${sujeto}, solo quedará *1 sesión más de Evaluación* por agendar del paquete (${total} sesiones en total), además del *Informe Verbal* incluido en el paquete.`;
  }
  return `\n\n📌 *Recordatorio:* Luego de ${sujeto}, solo quedará *1 sesión más* por agendar del paquete (${total} sesiones en total).`;
};

const armarAvisoSesiones = (infoVentas, citasConVenta, totalCitasDia) => {
  const ultimas = [];
  const penultimas = [];
  let avisoPendientes = '';

  infoVentas.forEach((info, idx) => {
    if (!info) return;
    const entrada = { info, cita: citasConVenta[idx], unitaria: info.tipo_venta_id === 1 };
    const restantes = info.sesiones_restantes || 0;
    const esPenultimaManual = !info.es_penultima_cita && !info.es_ultima_cita && restantes === 1;

    if (info.es_ultima_cita) {
      ultimas.push(entrada);
    } else if ((info.es_penultima_cita || esPenultimaManual) && info.sesiones_totales > 2 && restantes > 0) {
      penultimas.push(entrada);
    } else if (restantes > 0 && totalCitasDia === 1) {
      const origen = entrada.unitaria
        ? `de las ${info.sesiones_totales} sesiones adquiridas`
        : `del paquete contratado (${info.sesiones_totales} sesiones en total)`;
      avisoPendientes = `\n\n📋 *Recordatorio:* Aún ${textoSesionesFaltantes(restantes)} por agendar ${origen}.`;
    }
  });

  const hayVarias = totalCitasDia > 1;
  if (ultimas.length > 0) return avisoUltimas(ultimas, hayVarias);
  if (penultimas.length > 0) return avisoPenultimas(penultimas, hayVarias);
  return avisoPendientes;
};

const obtenerAvisoSesiones = async (citasDia) => {
  try {
    const conVenta = citasDia.filter((c) => c.venta_servicio_detalle_id);
    if (conVenta.length === 0) return '';
    const infos = await Promise.all(conVenta.map((c) => getInfoVentaDeCita(c.id).catch(() => null)));
    return armarAvisoSesiones(infos, conVenta, citasDia.length);
  } catch (err) {
    console.warn('No se pudo obtener info de la venta:', err);
    return '';
  }
};

const armarMensajeRecordatorio = ({ saludo, nombrePaciente, tieneResponsable, fechaTexto, citas, extra = '' }) => {
  const varias = citas.length > 1;
  const encabezado = tieneResponsable
    ? `${saludo}, Sr(a).\nLe hacemos recordar ${varias ? 'las citas' : 'la cita'} de *${nombrePaciente}* para el día`
    : `${saludo}, *${nombrePaciente}*\nLe hacemos recordar ${varias ? 'sus citas' : 'su cita'} para el día`;

  const lineas = (c) => `🕓 *${c.hora}*\n💜 ${c.servicio}\n✨ ${c.terapeuta}`;
  const detalle = varias
    ? `\n\n${citas.map((c, i) => `${i + 1}️⃣ *Cita ${i + 1}*\n${lineas(c)}`).join('\n\n')}`
    : `\n${lineas(citas[0])}`;

  return `${encabezado}\n🗓️ *${fechaTexto}*${detalle}${extra}\n\n🥳 ¡${tieneResponsable ? 'Los esperamos' : 'Lo esperamos'}! ✨`;
};

/* ═══════════════════════════ Componentes de UI ═══════════════════════════ */

const Aviso = ({ tono = 'red', icono: Icono = AlertCircle, titulo, children, className = '' }) => {
  const t = TONOS_AVISO[tono];
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border p-3 ${t.box} ${className}`}>
      <Icono className={`mt-0.5 h-4 w-4 flex-shrink-0 ${t.icono}`} />
      <div className="min-w-0 flex-1">
        {titulo && <p className={`text-sm font-semibold ${t.titulo}`}>{titulo}</p>}
        {children && <div className={`text-xs ${titulo ? 'mt-0.5' : ''} ${t.texto}`}>{children}</div>}
      </div>
    </div>
  );
};

const Pill = ({ tono = 'purple', children }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${TONOS_PILL[tono]}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {children}
  </span>
);

const Seccion = ({ icono: Icono, titulo, accion, children }) => (
  <section className="rounded-2xl border border-white bg-white p-4 shadow-[0_2px_10px_rgba(123,31,162,0.06)]">
    <header className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-[#7B1FA2]">
          <Icono className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-bold text-gray-900">{titulo}</h3>
      </div>
      {accion}
    </header>
    <div className="space-y-4">{children}</div>
  </section>
);

const Campo = ({ label, requerido, opcional, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold text-gray-500">
      {label}
      {requerido && <span className="ml-0.5 text-red-500">*</span>}
      {opcional && <span className="ml-1 font-normal text-gray-400">(opcional)</span>}
    </label>
    {children}
  </div>
);

const Dato = ({ label, children }) => (
  <div>
    <p className="text-xs font-semibold text-gray-400">{label}</p>
    <div className="text-sm text-gray-900">{children}</div>
  </div>
);

const Spinner = ({ className = 'h-4 w-4 border-white' }) => (
  <div className={`animate-spin rounded-full border-2 border-t-transparent ${className}`} />
);

const Dialogo = ({ tono = 'error', titulo, z = 'z-[70]', ancho = 'max-w-sm', children, footer }) => {
  const t = TONOS_DIALOGO[tono];
  return (
    <div className={`fixed inset-0 ${z} flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm`}>
      <div className={`w-full ${ancho} overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5`}>
        <div className={`flex items-center gap-3 border-b bg-gradient-to-r px-5 py-4 ${t.header}`}>
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${t.icono}`}>
            <t.Icono className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-extrabold text-gray-900">{titulo}</h3>
        </div>
        <div className="p-5">{children}</div>
        <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50/70 px-5 py-4">{footer}</div>
      </div>
    </div>
  );
};

const botonDialogo = (tono) =>
  `rounded-xl bg-gradient-to-r px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg ${TONOS_DIALOGO[tono].boton}`;

const OpcionesServicios = ({ lista }) => {
  if (!Array.isArray(lista) || lista.length === 0) return <option disabled>No hay servicios disponibles</option>;

  const agrupados = lista.reduce((acc, srv) => {
    const area = srv.area?.nombre || 'Otros';
    acc[area] = [...(acc[area] || []), srv];
    return acc;
  }, {});
  const prioridad = (area) => {
    const i = ORDEN_AREAS.indexOf(area);
    return i === -1 ? Infinity : i;
  };
  const areas = Object.keys(agrupados).sort((a, b) => prioridad(a) - prioridad(b) || a.localeCompare(b));

  return areas.map((area) => (
    <optgroup key={area} label={area}>
      {agrupados[area].map((srv) => (
        <option key={srv.id} value={srv.id}>
          {srv.nombre || 'Sin nombre'}
        </option>
      ))}
    </optgroup>
  ));
};

const ListaSelects = ({ valores, placeholder, vacio, deshabilitado, esFijo = () => false, opciones, onCambio, onEliminar }) => {
  if (valores.length === 0) {
    return <div className="rounded-xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-400">{vacio}</div>;
  }

  return (
    <div className="space-y-2">
      {valores.map((valor, index) => {
        const fijo = esFijo(index);
        return (
          <div key={index} className="flex gap-2">
            <select
              value={valor || ''}
              onChange={(e) => onCambio(index, e.target.value)}
              disabled={deshabilitado || fijo}
              className={INPUT}
            >
              <option value="">{placeholder}</option>
              {opciones}
            </select>
            {!deshabilitado && !fijo && (
              <button
                type="button"
                onClick={() => onEliminar(index)}
                aria-label="Quitar"
                className="rounded-xl p-2.5 text-red-500 transition hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

const TerapeutaFijo = ({ nombre }) => (
  <div className="flex items-center gap-2.5 rounded-xl border border-purple-100 bg-purple-50/60 p-2.5">
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] text-white">
      <User className="h-4 w-4" />
    </span>
    <p className="text-sm font-semibold text-gray-900">{nombre || 'No seleccionado'}</p>
  </div>
);

/* ── Fechas y horas ── */

const SlotFechaHora = ({
  slot, index, duracionMin, modoEdicion, deshabilitado, mostrarEliminar, reglas,
  onCambioFecha, onCambioHora, onAjuste, onEliminar
}) => {
  const horas = slot.fecha ? reglas.generarHoras(slot.fecha, duracionMin) : [];
  const diaBloqueado = Boolean(slot.fecha) && reglas.diaBloqueado(slot.fecha);
  const sinHoras = Boolean(slot.fecha) && !diaBloqueado && horas.length === 0;
  const horaBloqueada =
    modoEdicion && Boolean(slot.fecha && slot.horaInicio) && !diaBloqueado && reglas.horaBloqueada(slot.fecha, slot.horaInicio);

  const horaFueraDeLista = Boolean(slot.horaInicio) && !horas.includes(slot.horaInicio);
  const opciones = horaFueraDeLista ? [...horas, slot.horaInicio].sort() : horas;
  const sufijo = modoEdicion ? ' (ajustada)' : ' (no disponible)';

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3.5">
      {!modoEdicion && (
        <div className="mb-3 flex items-center justify-between">
          <Pill>Cita #{index + 1}</Pill>
          {mostrarEliminar && (
            <button
              type="button"
              onClick={() => onEliminar(index)}
              aria-label="Quitar cita"
              className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          value={slot.fecha || ''}
          onChange={(e) => onCambioFecha(e.target.value, index)}
          disabled={deshabilitado}
          className={INPUT}
        />

        <div className="space-y-2">
          <select
            value={slot.horaInicio || ''}
            onChange={(e) => onCambioHora(index, e.target.value)}
            disabled={deshabilitado || !slot.fecha}
            className={INPUT}
          >
            <option value="">{slot.fecha ? 'Seleccionar hora...' : 'Seleccione una fecha primero'}</option>
            {opciones.map((h) => (
              <option key={h} value={h}>
                {h}
                {h === slot.horaInicio && horaFueraDeLista ? sufijo : ''}
              </option>
            ))}
          </select>

          {modoEdicion && slot.horaInicio && (
            <div className="flex gap-2">
              {[-10, 10].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  disabled={deshabilitado}
                  onClick={() => onAjuste(delta)}
                  className="flex-1 rounded-lg border border-purple-100 bg-purple-50 px-2 py-1.5 text-xs font-semibold text-[#7B1FA2] transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {delta > 0 ? '+' : '−'}10 min
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {diaBloqueado && (
        <Aviso tono="red" titulo="Esta fecha está bloqueada" className="mt-3">
          El terapeuta no tiene disponibilidad este día. Por favor seleccione otra fecha.
        </Aviso>
      )}
      {sinHoras && (
        <Aviso tono="yellow" icono={AlertTriangle} titulo="No hay horarios disponibles" className="mt-3">
          Todos los horarios están ocupados o bloqueados para esta fecha.
        </Aviso>
      )}
      {horaBloqueada && (
        <Aviso tono="red" titulo="Horario bloqueado" className="mt-3">
          El terapeuta tiene bloqueada esta hora. Seleccione otro horario disponible.
        </Aviso>
      )}
    </div>
  );
};

const FechasHorasSection = ({
  fechasHoras = [], duracion, modoEdicion, deshabilitado, reglas, contador,
  agregarDeshabilitado, agregarTitulo, onAgregar, onCambioFecha, onCambioHora, onAjuste, onEliminar
}) => {
  const duracionMin = duracion ? parseInt(duracion, 10) : SLOT_MIN;
  const slots = modoEdicion ? [fechasHoras[0] || SLOT_VACIO] : fechasHoras;

  const accion = (
    <div className="flex items-center gap-2">
      {contador && (
        <Pill tono={contador.actual >= contador.maximo ? 'red' : 'green'}>
          {contador.actual} de {contador.maximo} sesiones
        </Pill>
      )}
      {!modoEdicion && !deshabilitado && (
        <button type="button" onClick={onAgregar} disabled={agregarDeshabilitado} title={agregarTitulo} className={BTN_GHOST}>
          <Plus className="h-4 w-4" /> Agregar
        </button>
      )}
    </div>
  );

  return (
    <Seccion
      icono={Calendar}
      titulo={
        <>
          {modoEdicion ? 'Fecha y hora' : 'Fechas y horas'} <span className="text-red-500">*</span>
        </>
      }
      accion={accion}
    >
      {slots.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-400">
          Haz clic en "Agregar" para crear fechas y horas
        </div>
      ) : (
        <div className="space-y-3">
          {slots.map((slot, index) => (
            <SlotFechaHora
              key={index}
              slot={slot}
              index={index}
              duracionMin={duracionMin}
              modoEdicion={modoEdicion}
              deshabilitado={deshabilitado}
              mostrarEliminar={!deshabilitado && slots.length > 1}
              reglas={reglas}
              onCambioFecha={onCambioFecha}
              onCambioHora={onCambioHora}
              onAjuste={onAjuste}
              onEliminar={onEliminar}
            />
          ))}
        </div>
      )}
    </Seccion>
  );
};

/* ── Tabs ── */

const TabsBar = ({ tabs, activa, onCambio }) => (
  <div className="overflow-x-auto px-6 pt-4">
    <div className="inline-flex gap-1 rounded-2xl bg-gray-100/70 p-1">
      {tabs.map(({ id, label, Icono }) => (
        <button
          key={id}
          type="button"
          onClick={() => onCambio(id)}
          aria-label={label}
          className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
            activa === id
              ? 'bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white shadow-md shadow-purple-500/25'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Icono className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  </div>
);

const HistorialItem = ({ item }) => {
  const { Icono, estilo } = OPERACIONES[item.tipo_operacion] || OPERACION_DEFAULT;
  const esReunion = item.tipo_cita === 'REUNION_CLINICA';
  const esVisita = item.tipo_cita === 'VISITA_ESCOLAR';
  const esNormal = item.tipo_cita === 'NORMAL';
  const esDelete = item.tipo_operacion === 'DELETE';
  const mostrarMotivoAccion = item.motivo_accion && (item.tipo_operacion === 'UPDATE' || esDelete);

  return (
    <div className="overflow-hidden rounded-2xl border border-white bg-white shadow-[0_2px_10px_rgba(123,31,162,0.06)]">
      <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${estilo}`}>
          <Icono className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${estilo}`}>{item.tipo_operacion}</span>
            <span className="text-xs font-semibold text-gray-600">{formatearFechaHistorial(item.fecha_registro)}</span>
          </div>
          <p className="text-sm font-medium text-gray-900">{item.descripcion_cambios}</p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {item.usuario && (
          <Aviso tono="purple" icono={User}>
            <span className="font-semibold">Realizado por: {item.usuario.nombre}</span>
          </Aviso>
        )}

        {(item.paciente || esReunion) && (
          <div className="grid grid-cols-2 gap-3">
            <Dato label="Paciente">{esReunion && !item.paciente ? 'Reunión Interna' : item.paciente?.nombre_completo}</Dato>
            {item.paciente && <Dato label="Documento">{item.paciente.numero_documento}</Dato>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Dato label="Motivo">{item.motivo}</Dato>
          <Dato label="Estado">{item.estado}</Dato>
          <Dato label="Fecha">{item.fecha}</Dato>
          <Dato label="Hora">
            {item.hora_inicio} - {item.hora_fin || 'N/A'}
          </Dato>
          <Dato label="Duración">{item.duracion_minutos} minutos</Dato>
        </div>

        {(esNormal || esVisita) && (
          <div className="grid grid-cols-2 gap-3">
            {item.terapeuta && <Dato label="Terapeuta">{item.terapeuta.nombre}</Dato>}
            {item.servicio && <Dato label="Servicio">{item.servicio.nombre}</Dato>}
          </div>
        )}

        {esReunion &&
          [
            { label: 'Terapeutas', lista: item.terapeutas, estilo: 'bg-blue-100 text-blue-800' },
            { label: 'Servicios', lista: item.servicios, estilo: 'bg-green-100 text-green-800' }
          ].map(
            ({ label, lista, estilo: chip }) =>
              lista?.length > 0 && (
                <Dato key={label} label={label}>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {lista.map((x, idx) => (
                      <span key={idx} className={`rounded-full px-3 py-1 text-xs font-medium ${chip}`}>
                        {x.nombre}
                      </span>
                    ))}
                  </div>
                </Dato>
              )
          )}

        {esVisita && item.visita_escolar && (
          <div className="rounded-xl border border-orange-100 bg-orange-50/70 p-3">
            <p className="mb-2 text-xs font-bold text-orange-900">Datos de la visita escolar</p>
            <div className="grid grid-cols-2 gap-2">
              <Dato label="Institución">{item.visita_escolar.nombre_colegio}</Dato>
              <Dato label="Encargado">{item.visita_escolar.nombre_intermediario}</Dato>
              <Dato label="Teléfono">{item.visita_escolar.telefono || 'N/A'}</Dato>
            </div>
            {item.visita_escolar.observaciones && (
              <div className="mt-2">
                <Dato label="Observaciones">{item.visita_escolar.observaciones}</Dato>
              </div>
            )}
          </div>
        )}

        {item.nota && (
          <Dato label="Nota">
            <p className="rounded-lg bg-gray-50 p-2">{item.nota}</p>
          </Dato>
        )}

        {mostrarMotivoAccion && (
          <Aviso tono={esDelete ? 'red' : 'yellow'} titulo={esDelete ? 'Motivo de eliminación' : 'Motivo de modificación'}>
            <span className="text-sm leading-relaxed text-gray-900">{item.motivo_accion}</span>
          </Aviso>
        )}
      </div>
    </div>
  );
};

const TabHistorial = ({ historial, cargando, error }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-extrabold text-[#2D0A4E]">Historial de cambios</h3>
    {cargando ? (
      <div className="flex justify-center py-8">
        <Spinner className="h-8 w-8 border-[#7B1FA2]" />
      </div>
    ) : error ? (
      <Aviso tono="red">{error}</Aviso>
    ) : historial.length === 0 ? (
      <Aviso tono="blue" icono={History}>No hay historial disponible.</Aviso>
    ) : (
      historial.map((item) => <HistorialItem key={item.id} item={item} />)
    )}
  </div>
);

const AsistenciaCard = ({ rol, titulo, Icono, tono, seguimiento, guardando, onMarcar }) => {
  const marcado = seguimiento?.[`${rol}_marco`];
  const estado = seguimiento?.[`${rol}_estado_id`];
  const botones = [
    { id: ESTADO_ASISTIO, texto: '✓ Asistió', activo: 'bg-green-600 text-white ring-2 ring-green-300', hover: 'hover:bg-green-50 hover:text-green-800' },
    { id: ESTADO_DICTADA, texto: '◆ Sesión dictada', activo: 'bg-orange-500 text-white ring-2 ring-orange-300', hover: 'hover:bg-orange-50 hover:text-orange-800' }
  ];

  return (
    <div className={`rounded-2xl border p-5 ${tono === 'blue' ? 'border-blue-100 bg-blue-50/60' : 'border-purple-100 bg-purple-50/60'}`}>
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${tono === 'blue' ? 'bg-blue-500' : 'bg-[#7B1FA2]'}`}>
          <Icono className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-bold text-gray-900">{titulo}</h4>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {botones.map((b) => (
          <button
            key={b.id}
            type="button"
            disabled={guardando}
            onClick={() => onMarcar(rol, marcado && estado === b.id ? null : b.id)}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              marcado && estado === b.id ? b.activo : `bg-white text-gray-700 ${b.hover}`
            }`}
          >
            {guardando ? <><Spinner className="h-4 w-4 border-current" />Guardando...</> : b.texto}
          </button>
        ))}
      </div>

      {!marcado && (
        <p className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 px-2 py-1 text-center text-xs text-yellow-700">
          Pendiente, sin registrar
        </p>
      )}
    </div>
  );
};

const RegistroAsistencia = ({ rol, titulo, Icono, seguimiento }) => {
  const marcado = igual(seguimiento?.[`${rol}_marco`], 1);
  const estado = seguimiento?.[`${rol}_estado_id`];
  const fecha = seguimiento?.[`${rol}_fecha`];

  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
      <div className="flex items-center gap-2">
        <Icono className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">{titulo}</span>
      </div>
      {marcado ? (
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${estado === ESTADO_ASISTIO ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
            {estado === ESTADO_ASISTIO ? '✓ Asistió' : '◆ Sesión dictada'}
          </span>
          {fecha && (
            <span className="text-xs text-gray-400">
              {new Date(fecha)
                .toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                .replace(',', '')}
            </span>
          )}
        </div>
      ) : (
        <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-bold text-yellow-800">Pendiente</span>
      )}
    </div>
  );
};

const TabAsistencia = ({ seguimiento, cargando, guardando, esAdmin, esRecepcionista, esTerapeuta, onMarcar }) => {
  const ambosMarcaron = igual(seguimiento?.recepcion_marco, 1) && igual(seguimiento?.terapeuta_marco, 1);
  const r = seguimiento?.recepcion_estado_id;
  const t = seguimiento?.terapeuta_estado_id;
  const coinciden = (r === ESTADO_ASISTIO && t === ESTADO_ASISTIO) || (r === ESTADO_DICTADA && t === ESTADO_DICTADA);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-[#2D0A4E]">Control de asistencia</h3>
        {cargando && <Spinner className="h-5 w-5 border-[#7B1FA2]" />}
      </div>

      {esRecepcionista && (
        <AsistenciaCard rol="recepcion" titulo="Recepción" Icono={User} tono="blue" seguimiento={seguimiento} guardando={guardando} onMarcar={onMarcar} />
      )}
      {esTerapeuta && (
        <AsistenciaCard rol="terapeuta" titulo="Terapeuta" Icono={Briefcase} tono="purple" seguimiento={seguimiento} guardando={guardando} onMarcar={onMarcar} />
      )}

      <div className="rounded-2xl border border-white bg-white p-4 shadow-[0_2px_10px_rgba(123,31,162,0.06)]">
        <h4 className="mb-3 text-sm font-bold text-gray-900">Registros</h4>
        <div className="space-y-2">
          {(esAdmin || esRecepcionista) && <RegistroAsistencia rol="recepcion" titulo="Recepción" Icono={User} seguimiento={seguimiento} />}
          {(esAdmin || esTerapeuta) && <RegistroAsistencia rol="terapeuta" titulo="Terapeuta" Icono={Briefcase} seguimiento={seguimiento} />}
        </div>

        {esAdmin && ambosMarcaron && !coinciden && (
          <Aviso tono="red" icono={AlertTriangle} className="mt-3">
            <span className="font-medium">Discrepancia detectada entre Recepción y Terapeuta</span>
          </Aviso>
        )}
        {esAdmin && ambosMarcaron && r === ESTADO_ASISTIO && t === ESTADO_ASISTIO && (
          <Aviso tono="green" icono={Check} className="mt-3">
            <span className="font-medium">Asistencia validada correctamente por ambas partes</span>
          </Aviso>
        )}
      </div>
    </div>
  );
};

const TabRecordatorio = ({ cita, modoSoloLectura, mensaje, cargando, copiado, onGenerar, onCopiar }) => {
  const paciente = cita?.paciente;
  const nombrePaciente = paciente
    ? `${paciente.nombres || ''} ${paciente.apellido_paterno || ''} ${paciente.apellido_materno || ''}`.trim()
    : '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-[#2D0A4E]">Recordatorio por WhatsApp</h3>
        <MessageCircle className="h-5 w-5 text-[#7B1FA2]" />
      </div>

      <Seccion icono={FileText} titulo="Resumen de la cita">
        <div className="grid grid-cols-2 gap-3">
          <Dato label="Paciente">
            {cita?.tipo_cita === 'REUNION_CLINICA' && !paciente ? (
              'Reunión Interna'
            ) : paciente ? (
              modoSoloLectura ? (
                <span className="font-semibold">{nombrePaciente}</span>
              ) : (
                <a href={`/editar-paciente/${cita.paciente_id}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:underline">
                  {nombrePaciente}
                </a>
              )
            ) : (
              'No especificado'
            )}
          </Dato>
          <Dato label="Fecha">
            {cita?.fecha ? fechaLocal(cita.fecha, { day: 'numeric', month: 'short' }) : 'No especificada'}
          </Dato>
          <Dato label="Hora">{cita?.hora_inicio ? formatearHora12(cita.hora_inicio) : 'No especificada'}</Dato>
          <Dato label="Tipo">{TIPOS_CITA[cita?.tipo_cita] || 'No especificado'}</Dato>
        </div>
      </Seccion>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-green-100 bg-green-50/70 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Generar mensaje</h4>
            <p className="text-xs text-gray-500">Personalizado para WhatsApp</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onGenerar}
          disabled={modoSoloLectura || cargando}
          className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-green-500/25 transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cargando ? <><Spinner />Generando...</> : <><MessageCircle className="h-4 w-4" />Generar</>}
        </button>
      </div>

      {mensaje ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-900">Mensaje generado</h4>
            <button type="button" onClick={onCopiar} disabled={modoSoloLectura} className={`${BTN_PRIMARY} !px-3 !py-1.5 text-xs`}>
              {copiado ? <><Check className="h-3.5 w-3.5" />¡Copiado!</> : <><Copy className="h-3.5 w-3.5" />Copiar</>}
            </button>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">{mensaje}</pre>
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />Listo para WhatsApp</span>
              <span>{mensaje.length} caracteres</span>
            </div>
          </div>
          <Aviso tono="yellow">
            <span className="font-semibold">Tip:</span> copia el mensaje, ábrelo en WhatsApp, pégalo al contacto y revísalo antes de enviar.
          </Aviso>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-400">
          El mensaje aparecerá aquí una vez generado
        </p>
      )}
    </div>
  );
};

const EstadoCitaPill = ({ cita }) => {
  if (!cita.programada || !cita.id) return <Pill tono="gray">Por agendar</Pill>;
  if (asistio(cita)) return <Pill tono="green">Asistió</Pill>;
  if (noAsistio(cita)) return <Pill tono="red">No asistió</Pill>;
  return <Pill tono="yellow">Pendiente</Pill>;
};

const IndicadorSesion = ({ infoPaquete, citaId }) => {
  const programadas = infoPaquete.citas.filter((c) => c.programada && c.id !== null).sort(porFechaHora);
  const total = infoPaquete.sesiones_totales || programadas.length;
  const esUltima = programadas.length > 0 && programadas[programadas.length - 1].id === citaId;
  const esPenultima = programadas.length >= 2 && programadas[programadas.length - 2].id === citaId;
  const restantes = Math.max(0, total - programadas.length);
  const unitaria = infoPaquete.tipo_venta_id === 1;

  if (esUltima) {
    const texto = unitaria
      ? total === 1
        ? 'Esta es la sesión adquirida. Se recomienda coordinar una nueva cita.'
        : `Se han usado las ${total} sesiones adquiridas. Se recomienda coordinar una nueva cita.`
      : `Se han agendado las ${total} sesiones contratadas. Se recomienda coordinar la renovación.`;
    return (
      <Aviso tono="amber" icono={AlertTriangle} titulo={unitaria ? 'Última sesión adquirida' : 'Última sesión del paquete'}>
        {texto}
      </Aviso>
    );
  }
  if (esPenultima) {
    return (
      <Aviso tono="blue" titulo={unitaria ? 'Penúltima sesión adquirida' : 'Penúltima sesión del paquete'}>
        {unitaria ? `Luego de esta cita quedará 1 sesión más de las ${total} adquiridas.` : 'Luego de esta cita quedará solo 1 sesión más.'}
      </Aviso>
    );
  }
  if (restantes > 0) {
    return (
      <Aviso tono="green" icono={Package}>
        <span className="text-sm">
          <span className="font-bold">{restantes}</span> {restantes === 1 ? 'sesión pendiente' : 'sesiones pendientes'} de agendar
        </span>
      </Aviso>
    );
  }
  return null;
};

const FilaCitaPaquete = ({ cita, idx, esActual, esCombo }) => (
  <div className={`px-4 py-2.5 transition-colors ${esActual ? 'border-l-4 border-[#7B1FA2] bg-[#7B1FA2]/5' : 'hover:bg-gray-50'}`}>
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold ${esActual ? 'bg-[#7B1FA2] text-white' : 'bg-gray-100 text-gray-600'}`}>
          {idx + 1}
        </div>
        <div className="min-w-0 flex-1">
          {esCombo && cita.linea_servicio && (
            <div className="mb-0.5 text-[10px] font-semibold text-[#7B1FA2]">
              {cita.linea_servicio}
              {cita.motivo_nombre ? ` · ${cita.motivo_nombre}` : ''}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-3 w-3 flex-shrink-0 text-gray-400" />
            {cita.fecha ? (
              <span className="font-medium text-gray-900">{fechaLocal(cita.fecha, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            ) : (
              <span className="italic text-gray-400">Por agendar</span>
            )}
            {cita.hora && (
              <>
                <Clock className="h-3 w-3 flex-shrink-0 text-gray-400" />
                <span className="text-gray-600">{cita.hora.substring(0, 5)}</span>
              </>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <User className="h-3 w-3 flex-shrink-0 text-gray-400" />
            <span className="truncate text-xs text-gray-500">{cita.especialista || 'No asignado'}</span>
          </div>
        </div>
      </div>
      <EstadoCitaPill cita={cita} />
    </div>
    {esActual && (
      <div className="mt-2 flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7B1FA2]" />
        <span className="text-[10px] font-semibold text-[#7B1FA2]">Cita actual</span>
      </div>
    )}
  </div>
);

const TabPaquete = ({ infoPaquete, cargando, citaId, cargandoVenta, onAbrirVenta }) => {
  const citasReales = infoPaquete?.citas.filter((c) => c.programada && c.id !== null) || [];
  const citasOrdenadas = infoPaquete
    ? [...infoPaquete.citas].sort((a, b) => (!a.programada ? 1 : !b.programada ? -1 : porFechaHora(a, b)))
    : [];
  const stats = infoPaquete && [
    { valor: infoPaquete.sesiones_totales || citasReales.length, label: 'Total sesiones', color: 'text-[#7B1FA2]' },
    { valor: citasReales.filter(asistio).length, label: 'Asistidas', color: 'text-green-600' },
    { valor: citasReales.filter(noAsistio).length, label: 'Faltas', color: 'text-red-600' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-[#2D0A4E]">Información del paquete</h3>
        <Package className="h-5 w-5 text-[#7B1FA2]" />
      </div>

      {cargando && <div className="flex h-40 animate-pulse items-center justify-center rounded-2xl bg-white text-sm text-gray-400">Cargando información del paquete...</div>}

      {!cargando && !infoPaquete && (
        <div className="rounded-2xl border border-white bg-white p-8 text-center shadow-[0_2px_10px_rgba(123,31,162,0.06)]">
          <Package className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-500">Esta cita no pertenece a ningún paquete</p>
        </div>
      )}

      {!cargando && infoPaquete && (
        <>
          <div className="flex items-start justify-between gap-3 rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-white p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#7B1FA2]/10">
                <Package className="h-5 w-5 text-[#7B1FA2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-gray-900">{infoPaquete.servicio_nombre}</h4>
                <p className="mt-0.5 text-xs text-gray-500">{infoPaquete.paquete_nombre || 'Paquete de sesiones'}</p>
              </div>
            </div>
            {infoPaquete.citas[0]?.comprobante && (
              <button
                type="button"
                onClick={() => onAbrirVenta(infoPaquete.citas.find((c) => c.venta_id)?.venta_id || infoPaquete.venta_id)}
                disabled={cargandoVenta}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-[#7B1FA2]/30 bg-white px-3 py-1.5 transition-colors hover:bg-[#7B1FA2]/5"
              >
                <FileText className="h-3.5 w-3.5 text-[#7B1FA2]" />
                <span className="font-mono text-xs font-bold text-[#7B1FA2]">{cargandoVenta ? '...' : infoPaquete.citas[0].comprobante}</span>
              </button>
            )}
          </div>

          {infoPaquete.paquete_nombre === 'Cita individual' && (
            <Aviso tono="purple" icono={AlertTriangle} titulo="Sesión individual">
              Para continuar el tratamiento, recuerda coordinar la compra de la próxima sesión o un paquete de sesiones.
            </Aviso>
          )}

          <IndicadorSesion infoPaquete={infoPaquete} citaId={citaId} />

          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white bg-white p-3 text-center shadow-[0_2px_10px_rgba(123,31,162,0.06)]">
                <div className={`text-2xl font-extrabold ${s.color}`}>{s.valor}</div>
                <div className="mt-1 text-xs text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-white bg-white shadow-[0_2px_10px_rgba(123,31,162,0.06)]">
            <div className="border-b border-gray-100 bg-gray-50/70 px-4 py-2.5">
              <h4 className="text-xs font-bold text-gray-600">Citas del paquete</h4>
            </div>
            <div className="max-h-60 divide-y divide-gray-100 overflow-y-auto">
              {citasOrdenadas.map((cita, idx) => (
                <FilaCitaPaquete key={cita.id ?? `slot-${idx}`} cita={cita} idx={idx} esActual={cita.id === citaId} esCombo={infoPaquete.es_combo} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════ Componente principal ═══════════════════════════ */

const ModalAgendarCita = ({
  open,
  onClose,
  slotSeleccionado,
  formularioCita,
  onFormularioChange,
  onGuardar,
  onEliminar,
  servicios,
  duraciones,
  terapeutaSeleccionado,
  modoEdicion = false,
  citaEditando = null,
  currentUser = null,
  guardando = false,
  citas = [],
  bloqueos = []
}) => {
  /* ── Estado ── */
  const [queryPaciente, setQueryPaciente] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [guardandoLocal, setGuardandoLocal] = useState(false);

  const [dialogoEliminarAbierto, setDialogoEliminarAbierto] = useState(false);
  const [motivoEliminacion, setMotivoEliminacion] = useState('');
  const [alerta, setAlerta] = useState(null); // { titulo, mensaje, tipo }
  const [confirmFeriado, setConfirmFeriado] = useState(null); // { feriado, continuar }

  const [tipoCita, setTipoCita] = useState(null);
  const [terapeutasReunion, setTerapeutasReunion] = useState([]);
  const [serviciosReunion, setServiciosReunion] = useState([]);
  const [encargadoVisita, setEncargadoVisita] = useState(ENCARGADO_VACIO);
  const [documentoFirmado, setDocumentoFirmado] = useState(false);

  const [seguimientoAsistencia, setSeguimientoAsistencia] = useState(null);
  const [cargandoAsistencia, setCargandoAsistencia] = useState(false);
  const [guardandoAsistencia, setGuardandoAsistencia] = useState(false);

  const [mensajeRecordatorio, setMensajeRecordatorio] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [cargandoRecordatorio, setCargandoRecordatorio] = useState(false);

  const [ventasDisponibles, setVentasDisponibles] = useState([]);
  const [cargandoVentas, setCargandoVentas] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  const [infoPaquete, setInfoPaquete] = useState(null);
  const [cargandoPaquete, setCargandoPaquete] = useState(false);
  const [ventaDetallePaquete, setVentaDetallePaquete] = useState(null);
  const [cargandoVentaDetalle, setCargandoVentaDetalle] = useState(false);

  const [bloqueosTerapeutaModal, setBloqueosTerapeutaModal] = useState([]);

  /* ── Roles y permisos ── */
  const rolId = currentUser?.rol?.id;
  const esRecepcionista = rolId === ROLES.ADMISION;
  const esTerapeuta = rolId === ROLES.TERAPEUTA;
  const esAdmin = rolId === ROLES.ADMINISTRADOR;
  const requiereGeofencing = esTerapeuta || esRecepcionista;

  const { dentroDelPerimetro } = useGeofencing(requiereGeofencing, 30000);
  const modoSoloLectura = requiereGeofencing && !dentroDelPerimetro;

  const puedeVerHistorial = esAdmin || esRecepcionista || esTerapeuta;
  const puedeEliminar = esAdmin && !modoSoloLectura;

  // Admisión no puede editar una cita con asistencia ya registrada (solo el administrador).
  const bloqueadoPorAsistencia =
    esRecepcionista &&
    modoEdicion &&
    (igual(seguimientoAsistencia?.recepcion_marco, 1) || igual(seguimientoAsistencia?.terapeuta_marco, 1));
  const deshabilitadoForm = esTerapeuta || modoSoloLectura || bloqueadoPorAsistencia;

  /* ── Datos externos ── */
  const { pacientes } = useBusquedaPacientes(queryPaciente);
  const serviciosApi = useServicios();
  const { motivos, loading: loadingMotivos } = useMotivosCita();
  const { trabajadores } = useTrabajadores();
  const { historial, loading: loadingHistorial, error: errorHistorial } = useHistorialCita(
    modoEdicion && citaEditando?.id ? citaEditando.id : null
  );

  const listaServicios = serviciosApi?.length ? serviciosApi : servicios || [];
  const terapeutasActivos = useMemo(
    () => trabajadores.filter((t) => (t.rol_id || t.rol?.id) === ROLES.TERAPEUTA && (t.estado === true || t.estado === 1)),
    [trabajadores]
  );
  const opcionesTerapeutas = terapeutasActivos.map((t) => (
    <option key={t.id} value={t.id}>
      {t.nombres} {t.apellidos}
    </option>
  ));
  const opcionesServicios = <OpcionesServicios lista={listaServicios} />;

  const motivoAccion = formularioCita.motivo_accion || '';
  const duracionMin = formularioCita.duracion ? parseInt(formularioCita.duracion, 10) : SLOT_MIN;

  /* ── Alertas ── */
  const mostrarAlerta = (titulo, mensaje, tipo = 'error') => setAlerta({ titulo, mensaje, tipo });

  // Admin/Admisión pueden confirmar y agendar en feriado; el resto queda bloqueado.
  const manejarFeriado = (feriado, continuar) => {
    if (esAdmin || esRecepcionista) {
      setConfirmFeriado({ feriado, continuar });
    } else {
      mostrarAlerta('Feriado nacional', `No se pueden agendar citas en feriados.\n\n🎉 ${feriado.nombre}`, 'feriado');
    }
  };

  /* ── Terapeutas asignados, disponibilidad y bloqueos ── */
  const terapeutasIds = (() => {
    if (tipoCita === 'REUNION_CLINICA') {
      return (
        [
          terapeutasReunion.map((t) => t.terapeuta_id),
          formularioCita.terapeutas_ids || [],
          (citaEditando?.terapeutas || []).map((t) => t.id_terapeuta || t.terapeuta_id || t.id)
        ]
          .map(idsValidos)
          .find((ids) => ids.length > 0) || []
      );
    }
    return idsValidos([formularioCita.doctor_id || terapeutaSeleccionado?.id]);
  })();
  const terapeutasKey = terapeutasIds.join(',');

  // La prop `bloqueos` solo trae los del terapeuta filtrado en la agenda; aquí la cita puede ir a otro.
  useEffect(() => {
    if (!open) return undefined;
    let cancelado = false;
    const ids = terapeutasKey ? terapeutasKey.split(',').map(Number) : [];

    const cargar = async () => {
      const resultados = await Promise.all(ids.map((id) => obtenerBloqueosPorTerapeuta(id).catch(() => [])));
      if (!cancelado) setBloqueosTerapeutaModal(resultados.flat());
    };
    cargar();

    return () => {
      cancelado = true;
    };
  }, [open, terapeutasKey]);

  const bloqueosEfectivos = bloqueosTerapeutaModal.length > 0 ? bloqueosTerapeutaModal : bloqueos || [];
  const editId = citaEditando?.id;

  const terapeutaDisponible = (fecha, hora, duracion) => {
    if (!fecha || !hora || terapeutasIds.length === 0) return true;
    const inicio = toMin(hora);
    return !citas.some((c) => {
      if (c.id === editId || c.fecha !== fecha || !citaInvolucraTerapeutas(c, terapeutasIds)) return false;
      const cInicio = toMin(c.hora_inicio);
      return haySolapamiento(inicio, inicio + duracion, cInicio, cInicio + duracionDe(c));
    });
  };

  const conflictoPaciente = (fecha, hora, duracion) => {
    const pacienteId = formularioCita.paciente_id ?? citaEditando?.paciente_id;
    if (!fecha || !hora || !pacienteId) return null;
    const inicio = toMin(hora);
    return (
      citas.find((c) => {
        if (c.id === editId || c.fecha !== fecha || String(c.paciente_id) !== String(pacienteId)) return false;
        const cInicio = toMin(c.hora_inicio);
        return haySolapamiento(inicio, inicio + duracion, cInicio, cInicio + duracionDe(c));
      }) || null
    );
  };

  const verificarHoraBloqueada = (fecha, hora) => {
    if (!fecha || !hora || terapeutasIds.length === 0) return false;
    const inicio = toMin(hora);
    const fin = inicio + SLOT_MIN;

    return bloqueosEfectivos.some((b) => {
      if (!bloqueoCubreFecha(b, fecha, terapeutasIds)) return false;
      if (b.todoElDia) return true;
      const bInicio = b.horaInicio ? toMin(b.horaInicio.substring(0, 5)) : 0;
      const bFin = b.horaFin ? toMin(b.horaFin.substring(0, 5)) : bInicio + SLOT_MIN;
      return haySolapamiento(inicio, fin, bInicio, bFin);
    });
  };

  const verificarFechaBloqueadaTodoElDia = (fecha) =>
    Boolean(fecha) &&
    terapeutasIds.length > 0 &&
    bloqueosEfectivos.some((b) => bloqueoCubreFecha(b, fecha, terapeutasIds) && b.todoElDia === true);

  const generarHorasDisponibles = (fecha, duracion) =>
    horasDelDia(fecha).filter(
      (hora) =>
        terapeutaDisponible(fecha, hora, duracion) &&
        !conflictoPaciente(fecha, hora, duracion) &&
        !verificarHoraBloqueada(fecha, hora)
    );

  const reglas = {
    generarHoras: generarHorasDisponibles,
    diaBloqueado: verificarFechaBloqueadaTodoElDia,
    horaBloqueada: verificarHoraBloqueada
  };

  const primerSlot = formularioCita.fechasHoras?.[0];
  const diaPrimerSlotBloqueado = verificarFechaBloqueadaTodoElDia(primerSlot?.fecha);
  const terapeutaBloqueado =
    diaPrimerSlotBloqueado || Boolean(primerSlot?.horaInicio && verificarHoraBloqueada(primerSlot.fecha, primerSlot.horaInicio));
  const avisoTerapeuta = terapeutaBloqueado && TEXTO_BLOQUEO[tipoCita] && (
    <Aviso tono="red" titulo="Terapeuta con horario bloqueado" className="mt-2">
      {diaPrimerSlotBloqueado ? TEXTO_BLOQUEO[tipoCita].dia : TEXTO_BLOQUEO[tipoCita].hora(primerSlot.horaInicio)}
    </Aviso>
  );

  /* ── Sesiones disponibles de la compra ── */
  const sesionesDisponiblesVenta = ventaSeleccionada?.sesiones_disponibles || 0;
  const slotsActuales = formularioCita.fechasHoras?.length || 0;
  const puedeAgregarMasSlots = tipoCita === 'NORMAL' ? Boolean(ventaSeleccionada) && slotsActuales < sesionesDisponiblesVenta : true;
  const agregarDeshabilitado = tipoCita === 'NORMAL' && Boolean(ventaSeleccionada) && !puedeAgregarMasSlots;

  /* ── Carga de datos ── */
  const cargarSeguimientoAsistencia = useCallback(async () => {
    if (!citaEditando?.id) return;
    setCargandoAsistencia(true);
    try {
      const { data } = await api.get(`/asistencia/seguimiento/${citaEditando.id}`);
      setSeguimientoAsistencia(data);
    } catch (error) {
      console.error('Error al cargar seguimiento:', error);
    } finally {
      setCargandoAsistencia(false);
    }
  }, [citaEditando?.id]);

  const cargarInfoPaquete = useCallback(async () => {
    if (!citaEditando?.paciente_id || !citaEditando?.venta_servicio_detalle_id) {
      setInfoPaquete(null);
      return;
    }
    setCargandoPaquete(true);
    try {
      const listado = await getListadoCitasPorPaciente(citaEditando.paciente_id);
      const paquete = buscarPaquete(listado.servicios, citaEditando.venta_servicio_detalle_id);
      setInfoPaquete(paquete?.paquete_combo_id ? consolidarCombo(paquete, listado.servicios) : paquete);
    } catch (error) {
      console.error('Error al cargar info del paquete:', error);
      setInfoPaquete(null);
    } finally {
      setCargandoPaquete(false);
    }
  }, [citaEditando?.paciente_id, citaEditando?.venta_servicio_detalle_id]);

  const abrirDetalleVenta = async (ventaId) => {
    if (!ventaId) return;
    setCargandoVentaDetalle(true);
    try {
      setVentaDetallePaquete(await getVentaServicioById(ventaId));
    } catch (err) {
      console.error('Error al cargar detalle de venta:', err);
    } finally {
      setCargandoVentaDetalle(false);
    }
  };

  // Inicializar al abrir el modal.
  useEffect(() => {
    if (!open) return;
    setQueryPaciente('');
    setTabValue(0);
    setDialogoEliminarAbierto(false);
    setMensajeRecordatorio('');
    setCopiado(false);
    setMotivoEliminacion('');

    const { terapeutas_ids, servicios_ids, encargado, firma_documento, fechasHoras } = formularioCita;

    if (terapeutas_ids?.length > 0) {
      setTerapeutasReunion(terapeutas_ids.map((id) => ({ terapeuta_id: id })));
    } else if (terapeutaSeleccionado?.id && !modoEdicion) {
      setTerapeutasReunion([{ terapeuta_id: terapeutaSeleccionado.id }]);
    } else {
      setTerapeutasReunion([]);
    }

    setServiciosReunion(servicios_ids?.length > 0 ? servicios_ids.map((id) => ({ servicio_id: id })) : []);
    setEncargadoVisita(encargado || ENCARGADO_VACIO);
    setDocumentoFirmado(firma_documento === 1 || firma_documento === true);

    if (!fechasHoras || fechasHoras.length === 0) {
      onFormularioChange('fechasHoras', [{ ...SLOT_VACIO }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Seguimiento de asistencia: al abrir en edición (valida el bloqueo) y al entrar a su pestaña.
  useEffect(() => {
    if ((open && modoEdicion && citaEditando?.id) || (tabValue === 2 && modoEdicion && citaEditando?.id)) {
      cargarSeguimientoAsistencia();
    }
  }, [open, tabValue, modoEdicion, citaEditando?.id, cargarSeguimientoAsistencia]);

  useEffect(() => {
    if (tabValue === 4 && modoEdicion && citaEditando?.id) cargarInfoPaquete();
  }, [tabValue, modoEdicion, citaEditando?.id, cargarInfoPaquete]);

  // Tipo de cita según el motivo.
  useEffect(() => {
    if (formularioCita.motivo_id && motivos.length > 0) {
      const motivo = motivos.find((m) => m.id === parseInt(formularioCita.motivo_id, 10));
      setTipoCita(motivo?.tipoCita?.codigo || 'NORMAL');
    } else {
      setTipoCita(null);
    }
  }, [formularioCita.motivo_id, motivos]);

  // Ventas disponibles del paciente para el servicio/motivo elegidos.
  useEffect(() => {
    const cargarVentasDisponibles = async () => {
      const { paciente_id: pacienteId, servicio_id: servicioId, motivo_id: motivoId } = formularioCita;
      if (tipoCita !== 'NORMAL' || !pacienteId || !servicioId) {
        setVentasDisponibles([]);
        return;
      }

      setCargandoVentas(true);
      try {
        let ventas = (await getVentasDisponibles(pacienteId, servicioId, motivoId || null)) || [];

        // En edición, si la compra vinculada ya no tiene sesiones libres se agrega igual,
        // pero solo mientras el motivo no haya cambiado.
        const motivoOriginalId = citaEditando?.motivo_id || citaEditando?.motivo?.id;
        const motivoSinCambio = !motivoOriginalId || String(motivoId) === String(motivoOriginalId);
        const detalleId = citaEditando?.venta_servicio_detalle_id;

        if (modoEdicion && detalleId && motivoSinCambio && !ventas.some((v) => String(v.id) === String(detalleId))) {
          const motivoNombre = citaEditando.motivo?.nombre ? ` - ${citaEditando.motivo.nombre}` : '';
          ventas = [
            {
              id: detalleId,
              descripcion: `#${detalleId} — ${citaEditando.servicio?.nombre || 'Servicio'}${motivoNombre} (compra vinculada)`,
              sesiones_disponibles: 0
            },
            ...ventas
          ];
        }

        setVentasDisponibles(ventas);

        // Una sola compra disponible: se selecciona sola (solo en cita nueva).
        if (ventas.length === 1 && !modoEdicion) {
          onFormularioChange('venta_servicio_detalle_id', ventas[0].id);
          setVentaSeleccionada(ventas[0]);
        }
      } catch (error) {
        console.error('Error al cargar ventas disponibles:', error);
        setVentasDisponibles([]);
        mostrarAlerta('Error', 'No se pudieron cargar las ventas disponibles del paciente.');
      } finally {
        setCargandoVentas(false);
      }
    };

    cargarVentasDisponibles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formularioCita.paciente_id, formularioCita.servicio_id, formularioCita.motivo_id, tipoCita, modoEdicion, citaEditando?.id, citaEditando?.venta_servicio_detalle_id]);

  // Mantener sincronizada la venta seleccionada con el formulario.
  useEffect(() => {
    if (tipoCita !== 'NORMAL') {
      setVentaSeleccionada(null);
      return;
    }
    if (formularioCita.venta_servicio_detalle_id && ventasDisponibles.length > 0) {
      const venta = ventasDisponibles.find((v) => String(v.id) === String(formularioCita.venta_servicio_detalle_id));
      if (venta) setVentaSeleccionada(venta);
    }
  }, [formularioCita.venta_servicio_detalle_id, ventasDisponibles, tipoCita]);

  /* ── Asistencia ── */
  const marcarAsistencia = async (rol, estadoId) => {
    const { endpoint, campoUsuario } = ASISTENCIA[rol];
    if (seguimientoAsistencia?.[`${rol}_marco`] && !esAdmin) return;

    setGuardandoAsistencia(true);
    const respaldo = seguimientoAsistencia;
    // Actualización optimista: estadoId null = desmarcar.
    setSeguimientoAsistencia((prev) =>
      prev
        ? {
            ...prev,
            [`${rol}_marco`]: estadoId !== null ? 1 : 0,
            [`${rol}_estado_id`]: estadoId,
            [`${rol}_fecha`]: estadoId !== null ? new Date().toISOString() : null
          }
        : prev
    );

    try {
      await api.post(endpoint, { cita_id: citaEditando.id, [campoUsuario]: currentUser.id, estado_id: estadoId });
      await cargarSeguimientoAsistencia();
    } catch (error) {
      console.error('Error al registrar:', error);
      setSeguimientoAsistencia(respaldo);
      alert(error.response?.data?.message || 'Error al registrar');
    } finally {
      setGuardandoAsistencia(false);
    }
  };

  /* ── Reunión clínica: listas editables ── */
  const actualizarLista = (setter, campo) => ({
    agregar: () => !modoSoloLectura && setter((prev) => [...prev, { [campo]: '' }]),
    eliminar: (index) => !modoSoloLectura && setter((prev) => prev.filter((_, i) => i !== index)),
    cambiar: (index, valor) =>
      !modoSoloLectura && setter((prev) => prev.map((item, i) => (i === index ? { ...item, [campo]: parseInt(valor, 10) } : item)))
  });
  const listaTerapeutas = actualizarLista(setTerapeutasReunion, 'terapeuta_id');
  const listaServiciosReunion = actualizarLista(setServiciosReunion, 'servicio_id');

  const actualizarEncargado = (campo) => (e) => {
    if (modoSoloLectura) return;
    setEncargadoVisita((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  /* ── Fechas y horas ── */
  const agregarFechaHora = () => {
    if (modoSoloLectura) return;

    if (tipoCita === 'NORMAL') {
      if (!ventaSeleccionada) {
        mostrarAlerta('Compra requerida', 'Primero selecciona una compra de sesiones antes de agregar fechas/horas.');
        return;
      }
      if (!puedeAgregarMasSlots) {
        mostrarAlerta(
          'Límite de sesiones alcanzado',
          `Esta compra solo tiene ${sesionesDisponiblesVenta} sesión(es) disponible(s). Ya tienes ${slotsActuales} slot(s) agregado(s).`,
          'warning'
        );
        return;
      }
    }
    onFormularioChange('agregarFechaHora', null);
  };

  const manejarCambioFecha = (fechaStr, index) => {
    if (modoSoloLectura) return;
    const diaSemana = new Date(`${fechaStr}T00:00:00`).getDay();

    if (diaSemana === 0) {
      mostrarAlerta('Domingo no disponible', 'Los domingos no están disponibles para agendar citas.', 'warning');
      return;
    }
    if (Number.isNaN(diaSemana)) {
      mostrarAlerta('Fecha no válida', 'Solo se pueden agendar citas de lunes a sábado.', 'warning');
      return;
    }

    const aplicar = () => {
      if (modoEdicion) {
        // Sábado y L-V tienen grillas distintas: se ajusta la hora a la más cercana válida
        // para que la cita caiga en su casilla exacta.
        const horaActual = formularioCita.fechasHoras?.[0]?.horaInicio || '';
        const horaInicio = ajustarHoraMasCercana(generarHorasDisponibles(fechaStr, duracionMin), horaActual);
        onFormularioChange('actualizarFechaHoraCompleta', { index: 0, fecha: fechaStr, horaInicio });
      } else {
        onFormularioChange('actualizarFechaHora', { index, campo: 'fecha', valor: fechaStr });
      }
    };

    const feriado = esFeriado(fechaStr);
    if (feriado) manejarFeriado(feriado, aplicar);
    else aplicar();
  };

  const manejarCambioHora = (index, valor) => {
    if (modoSoloLectura) return;
    onFormularioChange('actualizarFechaHora', { index, campo: 'horaInicio', valor });
  };

  const manejarAjusteMinutos = (delta) => {
    if (modoSoloLectura) return;
    const nueva = desplazarHora(formularioCita.fechasHoras[0].horaInicio, delta);
    if (nueva) onFormularioChange('actualizarFechaHora', { index: 0, campo: 'horaInicio', valor: nueva });
  };

  const manejarCambioMotivo = (e) => {
    const nuevoMotivo = e.target.value;
    onFormularioChange('motivo_id', nuevoMotivo);

    if (modoEdicion && citaEditando) {
      const motivoOriginal = citaEditando.motivo_id || citaEditando.motivo?.id;
      if (String(nuevoMotivo) !== String(motivoOriginal)) {
        onFormularioChange('venta_servicio_detalle_id', '');
        setVentaSeleccionada(null);
      }
    }
  };

  const manejarCambioVenta = (e) => {
    const ventaId = e.target.value;
    onFormularioChange('venta_servicio_detalle_id', ventaId);

    const venta = ventasDisponibles.find((v) => String(v.id) === ventaId) || null;
    setVentaSeleccionada(venta);

    const maximo = venta?.sesiones_disponibles;
    if (!modoEdicion && venta && slotsActuales > maximo) {
      onFormularioChange('fechasHoras', formularioCita.fechasHoras.slice(0, maximo));
      mostrarAlerta('Slots ajustados', `Se redujeron los slots a ${maximo} porque es el máximo de sesiones disponibles en esta compra.`, 'warning');
    }
  };

  /* ── Recordatorio ── */
  const generarMensajeCitaExistente = async () => {
    if (!citaEditando.fecha || !citaEditando.hora_inicio) return null;

    const { data } = await api.get('/citas', { params: { fecha_desde: citaEditando.fecha, fecha_hasta: citaEditando.fecha } });
    const citasMismoDia = (Array.isArray(data) ? data : [])
      .filter((c) => String(c.paciente_id) === String(citaEditando.paciente_id))
      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

    const p = citaEditando.paciente;
    const nombrePaciente = p
      ? formatearNombreTitulo(`${p.nombres || ''} ${p.apellido_paterno || ''} ${p.apellido_materno || ''}`.trim())
      : 'Paciente';
    const citasMensaje = citasMismoDia.length > 1 ? citasMismoDia : [citaEditando];

    return armarMensajeRecordatorio({
      saludo: obtenerSaludo(),
      nombrePaciente,
      tieneResponsable: tieneResponsableActivo(p),
      fechaTexto: formatearFechaRecordatorio(citaEditando.fecha),
      citas: citasMensaje.map((c) => ({
        hora: formatearHora12(c.hora_inicio),
        servicio: getServicioConMotivo(c),
        terapeuta: getTerapeutaNombre(c)
      })),
      extra: await obtenerAvisoSesiones(citasMismoDia)
    });
  };

  const generarMensajeFormulario = () => {
    const { paciente, fechasHoras, servicio_id: servicioId, motivo_id: motivoId } = formularioCita;
    const slot = fechasHoras?.[0];
    if (!paciente || !slot?.fecha || !slot?.horaInicio) {
      alert('No hay suficiente información para generar el mensaje');
      return null;
    }

    let servicio = 'Servicio no especificado';
    if (tipoCita === 'NORMAL' && servicioId) {
      servicio = listaServicios.find((s) => s.id === parseInt(servicioId, 10))?.nombre || servicio;
    } else if (tipoCita === 'VISITA_ESCOLAR') {
      servicio = 'Visita Escolar';
    } else if (tipoCita === 'REUNION_CLINICA') {
      servicio = 'Reunión Clínica';
    }
    const motivo = motivoId && motivos.find((m) => m.id === parseInt(motivoId, 10));
    if (motivo?.nombre) servicio = `${servicio} - ${motivo.nombre}`;

    let terapeuta = 'Terapeuta no especificado';
    if ((tipoCita === 'NORMAL' || tipoCita === 'VISITA_ESCOLAR') && terapeutaSeleccionado) {
      terapeuta = `Lic. ${terapeutaSeleccionado.nombres || ''} ${terapeutaSeleccionado.apellidos || ''}`.trim();
    } else if (tipoCita === 'REUNION_CLINICA' && terapeutasReunion.length > 0) {
      terapeuta = 'Equipo de Terapeutas';
    }

    return armarMensajeRecordatorio({
      saludo: obtenerSaludo(),
      nombrePaciente: paciente.nombre_completo ? formatearNombreTitulo(paciente.nombre_completo) : 'Paciente',
      tieneResponsable: tieneResponsableActivo(paciente),
      fechaTexto: formatearFechaRecordatorio(slot.fecha),
      citas: [{ hora: formatearHora12(slot.horaInicio), servicio, terapeuta }]
    });
  };

  const generarMensajeRecordatorio = async () => {
    if (modoSoloLectura) return;
    setCargandoRecordatorio(true);
    try {
      const mensaje = modoEdicion && citaEditando ? await generarMensajeCitaExistente() : generarMensajeFormulario();
      if (mensaje) {
        setMensajeRecordatorio(mensaje);
        setCopiado(false);
      }
    } catch (error) {
      console.error('Error al generar el recordatorio:', error);
      alert('No se pudo generar el mensaje. Intenta de nuevo.');
    } finally {
      setCargandoRecordatorio(false);
    }
  };

  const copiarAlPortapapeles = async () => {
    if (modoSoloLectura) return;
    try {
      await navigator.clipboard.writeText(mensajeRecordatorio);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
      alert('Error al copiar el mensaje');
    }
  };

  /* ── Guardar ── */
  const nombreTerapeuta = (id) => {
    const t = trabajadores.find((w) => w.id === id);
    return t ? `Lic. ${t.nombres} ${t.apellidos}`.trim() : 'El terapeuta';
  };

  /** Devuelve { titulo, mensaje, tipo } con el primer problema encontrado, o null si todo está bien. */
  const validarAntesDeGuardar = async () => {
    if (modoEdicion && !esTerapeuta && !motivoAccion.trim()) {
      return { titulo: 'Campo requerido', mensaje: 'El motivo de modificación es obligatorio para actualizar la cita.' };
    }

    const slots =
      formularioCita.fechasHoras?.length > 0
        ? formularioCita.fechasHoras
        : citaEditando?.fecha && citaEditando?.hora_inicio
          ? [{ fecha: citaEditando.fecha, horaInicio: citaEditando.hora_inicio.substring(0, 5) }]
          : [];

    const fechas = [...new Set(slots.map((s) => s.fecha).filter(Boolean))];
    const citasPorFecha = await obtenerCitasPorFecha(fechas);
    const duracion = parseInt(formularioCita.duracion || SLOT_MIN, 10);
    const pacienteId = formularioCita.paciente_id ?? citaEditando?.paciente_id;

    if (terapeutasIds.length > 0) {
      const c = buscarConflicto(slots, citasPorFecha, duracion, (x) => x.id !== editId && citaInvolucraTerapeutas(x, terapeutasIds));
      if (c) {
        const fin = toMin(c.hora_inicio) + duracionDe(c);
        return {
          titulo: 'Conflicto de terapeuta',
          tipo: 'warning',
          mensaje: `${nombreTerapeuta(c.doctor_id)} ya tiene una cita de ${c.hora_inicio.substring(0, 5)} a ${aHHMM(fin)} (${c.servicio?.nombre || c.tipo_cita || 'otra cita'}).\n\nSelecciona otro horario.`
        };
      }
    }

    if (pacienteId) {
      const c = buscarConflicto(slots, citasPorFecha, duracion, (x) => x.id !== editId && String(x.paciente_id) === String(pacienteId));
      if (c) {
        return {
          titulo: 'Conflicto de horario',
          mensaje: `El paciente ya tiene una cita a las ${c.hora_inicio.substring(0, 5)} (${c.servicio?.nombre || c.tipo_cita || 'otra especialidad'}). No se pueden agendar citas en horarios superpuestos.`
        };
      }
    }

    // Validación autoritativa en el backend con el/los terapeuta(s) realmente asignados.
    const bloqueo = await buscarBloqueoRemoto(slots, terapeutasIds);
    if (bloqueo) {
      return {
        titulo: 'Horario bloqueado',
        mensaje: `${nombreTerapeuta(bloqueo.trabajadorId)} tiene bloqueado el horario del ${bloqueo.fecha} a las ${bloqueo.horaInicio}. No está disponible para agendar citas.`
      };
    }

    if (tipoCita === 'NORMAL') {
      if (!formularioCita.venta_servicio_detalle_id) {
        return {
          titulo: 'Venta requerida',
          mensaje: 'Debes seleccionar un detalle de venta para poder agendar la cita. Si el paciente no tiene compras disponibles, primero debe realizar una venta.'
        };
      }

      // Si el motivo cambió, la compra elegida debe tener sesiones para el nuevo motivo.
      const motivoOriginal = citaEditando?.motivo_id || citaEditando?.motivo?.id;
      if (modoEdicion && citaEditando && String(formularioCita.motivo_id) !== String(motivoOriginal)) {
        const ventaValida = ventasDisponibles.find(
          (v) => String(v.id) === String(formularioCita.venta_servicio_detalle_id) && (v.sesiones_disponibles || 0) > 0
        );
        if (!ventaValida) {
          return {
            titulo: 'Sin sesiones disponibles',
            mensaje: 'El paciente no tiene una compra activa para el motivo seleccionado. No se puede cambiar el motivo sin una compra válida para ese servicio.'
          };
        }
      }
    }

    return null;
  };

  const construirDatosGuardar = () => {
    const datos = {
      ...formularioCita,
      esMultiple: !modoEdicion && (formularioCita.fechasHoras?.length || 0) > 1
    };
    if (modoEdicion && !esTerapeuta) datos.motivo_accion = motivoAccion;

    if (tipoCita === 'NORMAL') {
      Object.assign(datos, { terapeutas_ids: [], servicios_ids: [], encargado: null, firma_documento: false });
    } else if (tipoCita === 'REUNION_CLINICA') {
      Object.assign(datos, {
        terapeutas_ids: terapeutasReunion.filter((t) => t.terapeuta_id).map((t) => parseInt(t.terapeuta_id, 10)),
        servicios_ids: serviciosReunion.filter((s) => s.servicio_id).map((s) => parseInt(s.servicio_id, 10)),
        doctor_id: null,
        servicio_id: null,
        encargado: null,
        firma_documento: false,
        compra_id: null
      });
    } else if (tipoCita === 'VISITA_ESCOLAR') {
      Object.assign(datos, {
        encargado: encargadoVisita,
        terapeutas_ids: [],
        servicios_ids: [],
        firma_documento: documentoFirmado ? 1 : 0,
        compra_id: null
      });
    }
    return datos;
  };

  const handleGuardar = async () => {
    if (modoSoloLectura || guardandoLocal) return;
    setGuardandoLocal(true);

    try {
      const problema = await validarAntesDeGuardar();
      if (problema) {
        mostrarAlerta(problema.titulo, problema.mensaje, problema.tipo);
        return;
      }
      await onGuardar(construirDatosGuardar());
    } catch (error) {
      const respuesta = error?.response?.data?.message;
      const mensaje = respuesta
        ? Array.isArray(respuesta) ? respuesta.join(', ') : respuesta
        : error?.message || 'Error al guardar la cita';
      mostrarAlerta('Conflicto de horario', mensaje);
    } finally {
      setGuardandoLocal(false);
    }
  };

  /* ── Eliminar ── */
  const cerrarDialogoEliminar = () => {
    setDialogoEliminarAbierto(false);
    setMotivoEliminacion('');
  };

  const confirmarEliminar = () => {
    if (modoSoloLectura) return;
    if (!motivoEliminacion.trim()) {
      mostrarAlerta('Campo requerido', 'El motivo de eliminación es obligatorio para eliminar la cita.');
      return;
    }
    setDialogoEliminarAbierto(false);
    onEliminar?.(motivoEliminacion);
  };

  /* ── Render ── */
  if (!open) return null;

  const mostrarTabs = modoEdicion && puedeVerHistorial;
  const mostrarDetalles = !mostrarTabs || tabValue === 0;
  const esReunion = tipoCita === 'REUNION_CLINICA';
  const tabs = [
    { id: 0, label: 'Detalles', Icono: FileText },
    { id: 1, label: 'Historial', Icono: History },
    { id: 2, label: 'Asistencia', Icono: User },
    !esTerapeuta && { id: 3, label: 'Recordatorio', Icono: MessageCircle },
    !esTerapeuta && citaEditando?.venta_servicio_detalle_id && { id: 4, label: 'Paquete', Icono: Package }
  ].filter(Boolean);

  const compraVinculadaVisible =
    modoEdicion &&
    citaEditando?.venta_servicio_detalle_id &&
    tipoCita === 'NORMAL' &&
    String(formularioCita.motivo_id) === String(citaEditando.motivo_id || citaEditando.motivo?.id);

  const sinVentas =
    tipoCita === 'NORMAL' &&
    !cargandoVentas &&
    formularioCita.paciente_id &&
    formularioCita.servicio_id &&
    formularioCita.motivo_id &&
    ventasDisponibles.length === 0;

  const campoDuracion = (
    <Campo label="Duración" requerido>
      <select
        value={formularioCita.duracion ?? ''}
        onChange={(e) => onFormularioChange('duracion', e.target.value)}
        disabled={deshabilitadoForm}
        className={INPUT}
      >
        <option value="">Seleccionar duración...</option>
        {duraciones.map((d) => (
          <option key={d.valor} value={d.valor}>
            {d.label}
          </option>
        ))}
      </select>
    </Campo>
  );

  const nombreTerapeutaFijo = terapeutaSeleccionado
    ? `${terapeutaSeleccionado.nombres || ''} ${terapeutaSeleccionado.apellidos || ''}`.trim()
    : '';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
        <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)] ring-1 ring-black/5">
          {/* Header */}
          <div className="relative flex-shrink-0 overflow-hidden border-b border-purple-100/60 px-6 py-4" style={HEADER_STYLE}>
            <div className="pointer-events-none absolute -top-10 right-16 h-32 w-32 rounded-full bg-[#7B1FA2]/[0.06] blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] shadow-md shadow-purple-500/30">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold leading-tight tracking-tight text-[#2D0A4E]">
                    {esTerapeuta || modoSoloLectura ? 'Ver cita' : modoEdicion ? 'Editar cita' : 'Nueva cita'}
                    {modoEdicion && citaEditando?.id && <span className="ml-2 font-bold text-[#7B1FA2]">#{citaEditando.id}</span>}
                  </h2>
                  {slotSeleccionado && (
                    <p className="mt-0.5 text-[13px] font-medium text-gray-500">
                      {slotSeleccionado.dia} • {slotSeleccionado.hora}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={guardando}
                aria-label="Cerrar"
                className="rounded-xl p-2 text-gray-400 transition hover:bg-white/70 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          {mostrarTabs && (
            <div className="flex-shrink-0 bg-[#fbf9fe]">
              <TabsBar tabs={tabs} activa={tabValue} onCambio={setTabValue} />
            </div>
          )}

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#fbf9fe] to-white p-6">
            {mostrarDetalles && (
              <div className="space-y-4">
                {bloqueadoPorAsistencia && (
                  <Aviso tono="red" titulo="Cita bloqueada para edición">
                    Ya registraste la asistencia para esta cita. No se puede editar para evitar reutilización de citas antiguas. Solo un administrador puede modificarla.
                  </Aviso>
                )}

                {/* Motivo y paciente */}
                <Seccion icono={FileText} titulo="Motivo y paciente">
                  <Campo label="Motivo de la cita" requerido>
                    <select
                      value={formularioCita.motivo_id || ''}
                      onChange={manejarCambioMotivo}
                      disabled={loadingMotivos || deshabilitadoForm}
                      className={INPUT}
                    >
                      <option value="">{loadingMotivos ? 'Cargando...' : 'Seleccionar motivo...'}</option>
                      {motivos.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nombre}
                        </option>
                      ))}
                    </select>
                    {tipoCita && (
                      <div className="mt-2">
                        <Pill tono="blue">{TIPOS_CITA[tipoCita]}</Pill>
                      </div>
                    )}
                  </Campo>

                  {compraVinculadaVisible && (
                    <Aviso tono="purple" icono={Package}>
                      <span className="font-semibold">Compra vinculada:</span> #{citaEditando.venta_servicio_detalle_id}
                      {citaEditando.servicio?.nombre ? ` — ${citaEditando.servicio.nombre}` : ''}
                      {citaEditando.motivo?.nombre ? ` (${citaEditando.motivo.nombre})` : ''}
                    </Aviso>
                  )}

                  <Campo label="Paciente" requerido={!esReunion} opcional={esReunion}>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={queryPaciente}
                        onChange={(e) => setQueryPaciente(e.target.value)}
                        disabled={deshabilitadoForm}
                        className={`${INPUT} pl-10`}
                      />
                    </div>

                    {queryPaciente.length >= 2 && pacientes.length > 0 && !modoSoloLectura && !bloqueadoPorAsistencia && (
                      <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
                        {pacientes.map((paciente) => (
                          <button
                            key={paciente.id}
                            type="button"
                            onClick={() => {
                              onFormularioChange('paciente', paciente);
                              setQueryPaciente('');
                            }}
                            className="w-full border-b border-gray-100 px-4 py-2.5 text-left transition hover:bg-purple-50/50 last:border-0"
                          >
                            <p className="text-sm font-medium text-gray-900">{paciente.nombre_completo || paciente.nombre}</p>
                            {paciente.documento && <p className="text-xs text-gray-500">DNI: {paciente.documento}</p>}
                          </button>
                        ))}
                      </div>
                    )}

                    {formularioCita.paciente && (
                      <div className="mt-2 flex items-center justify-between rounded-xl border border-purple-100 bg-purple-50/60 p-2.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] text-xs font-bold text-white">
                            {obtenerIniciales(formularioCita.paciente.nombre_completo)}
                          </span>
                          {modoSoloLectura ? (
                            <span className="text-sm font-semibold text-gray-700">{formularioCita.paciente.nombre_completo}</span>
                          ) : (
                            <a
                              href={`/editar-paciente/${formularioCita.paciente_id || formularioCita.paciente.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-semibold text-[#7B1FA2] hover:underline"
                            >
                              {formularioCita.paciente.nombre_completo}
                            </a>
                          )}
                        </div>
                        {!deshabilitadoForm && (
                          <button
                            type="button"
                            onClick={() => onFormularioChange('paciente', null)}
                            aria-label="Quitar paciente"
                            className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-100"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </Campo>
                </Seccion>

                {/* Detalles según el tipo de cita */}
                {tipoCita === 'NORMAL' && (
                  <Seccion icono={Briefcase} titulo="Detalles de la sesión">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Campo label="Terapeuta" requerido>
                        {esAdmin || esRecepcionista ? (
                          <select
                            value={formularioCita.doctor_id || terapeutaSeleccionado?.id || ''}
                            onChange={(e) => onFormularioChange('doctor_id', e.target.value)}
                            disabled={modoSoloLectura || bloqueadoPorAsistencia}
                            className={INPUT}
                          >
                            <option value="">Seleccionar terapeuta...</option>
                            {opcionesTerapeutas}
                          </select>
                        ) : (
                          <TerapeutaFijo nombre={nombreTerapeutaFijo} />
                        )}
                        {avisoTerapeuta}
                      </Campo>

                      <Campo label="Servicio" requerido>
                        <select
                          value={formularioCita.servicio_id || ''}
                          onChange={(e) => onFormularioChange('servicio_id', e.target.value)}
                          disabled={deshabilitadoForm || (modoEdicion && !!citaEditando?.venta_servicio_detalle_id)}
                          className={INPUT}
                        >
                          <option value="">Seleccionar servicio...</option>
                          {opcionesServicios}
                        </select>
                      </Campo>

                      <div className="md:col-span-2">
                        <Campo label="Compra de sesiones" requerido>
                          <select
                            value={formularioCita.venta_servicio_detalle_id || ''}
                            onChange={manejarCambioVenta}
                            disabled={cargandoVentas || !formularioCita.paciente_id || !formularioCita.servicio_id || deshabilitadoForm}
                            className={INPUT}
                          >
                            <option value="">
                              {cargandoVentas
                                ? 'Cargando ventas...'
                                : !formularioCita.paciente_id || !formularioCita.servicio_id
                                  ? 'Primero selecciona paciente y servicio'
                                  : ventasDisponibles.length === 0
                                    ? 'No hay sesiones disponibles para este servicio'
                                    : 'Seleccionar compra...'}
                            </option>
                            {ventasDisponibles.map((venta) => (
                              <option key={venta.id} value={String(venta.id)}>
                                {venta.descripcion}
                              </option>
                            ))}
                          </select>
                          {sinVentas && (
                            <Aviso tono="red" titulo="No hay sesiones disponibles" className="mt-2">
                              {modoEdicion
                                ? 'El paciente no tiene una compra activa para este motivo y servicio. No se puede cambiar el motivo sin una compra válida: debe realizar una compra primero.'
                                : 'No hay compras con sesiones para este motivo y servicio. El paciente debe realizar una compra primero.'}
                            </Aviso>
                          )}
                        </Campo>
                      </div>

                      {campoDuracion}
                    </div>
                  </Seccion>
                )}

                {esReunion && (
                  <>
                    <Seccion
                      icono={Users}
                      titulo={<>Terapeutas <span className="text-red-500">*</span></>}
                      accion={
                        !deshabilitadoForm && (
                          <button type="button" onClick={listaTerapeutas.agregar} className={BTN_GHOST}>
                            <Plus className="h-4 w-4" /> Agregar
                          </button>
                        )
                      }
                    >
                      <div>
                        <ListaSelects
                          valores={terapeutasReunion.map((t) => t.terapeuta_id)}
                          placeholder="Seleccionar terapeuta..."
                          vacio='Haz clic en "Agregar" para sumar terapeutas'
                          deshabilitado={deshabilitadoForm}
                          // El terapeuta de la agenda queda fijo en la primera fila al crear.
                          esFijo={(i) => i === 0 && Boolean(terapeutaSeleccionado?.id) && !modoEdicion}
                          opciones={opcionesTerapeutas}
                          onCambio={listaTerapeutas.cambiar}
                          onEliminar={listaTerapeutas.eliminar}
                        />
                        {avisoTerapeuta}
                      </div>
                    </Seccion>

                    <Seccion
                      icono={Briefcase}
                      titulo={<>Servicios <span className="text-red-500">*</span></>}
                      accion={
                        !deshabilitadoForm && (
                          <button type="button" onClick={listaServiciosReunion.agregar} className={BTN_GHOST}>
                            <Plus className="h-4 w-4" /> Agregar
                          </button>
                        )
                      }
                    >
                      <ListaSelects
                        valores={serviciosReunion.map((s) => s.servicio_id)}
                        placeholder="Seleccionar servicio..."
                        vacio='Haz clic en "Agregar" para sumar servicios'
                        deshabilitado={deshabilitadoForm}
                        opciones={opcionesServicios}
                        onCambio={listaServiciosReunion.cambiar}
                        onEliminar={listaServiciosReunion.eliminar}
                      />
                      {campoDuracion}
                    </Seccion>
                  </>
                )}

                {tipoCita === 'VISITA_ESCOLAR' && (
                  <Seccion icono={Building2} titulo="Visita escolar">
                    <Campo label="Terapeuta" requerido>
                      <TerapeutaFijo nombre={nombreTerapeutaFijo} />
                      {avisoTerapeuta}
                    </Campo>

                    <div className="space-y-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                      {[
                        { campo: 'institucion', label: 'Colegio', placeholder: 'Ej: Colegio San Juan', type: 'text' },
                        { campo: 'nombre_completo', label: 'Encargado', placeholder: 'Ej: María García (Directora)', type: 'text' },
                        { campo: 'telefono', label: 'Teléfono', placeholder: '987654321', type: 'tel' }
                      ].map(({ campo, label, placeholder, type }) => (
                        <Campo key={campo} label={label} requerido>
                          <input
                            type={type}
                            value={encargadoVisita[campo]}
                            onChange={actualizarEncargado(campo)}
                            disabled={deshabilitadoForm}
                            placeholder={placeholder}
                            className={INPUT}
                          />
                        </Campo>
                      ))}
                      <label className="flex cursor-pointer items-center gap-2 border-t border-indigo-100 pt-3">
                        <input
                          type="checkbox"
                          checked={documentoFirmado}
                          onChange={(e) => !modoSoloLectura && setDocumentoFirmado(e.target.checked)}
                          disabled={deshabilitadoForm}
                          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-60"
                        />
                        <span className="text-sm font-medium text-gray-700">Autorización de visita firmada</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Campo label="Servicio" opcional>
                        <select
                          value={formularioCita.servicio_id || ''}
                          onChange={(e) => onFormularioChange('servicio_id', e.target.value)}
                          disabled={deshabilitadoForm}
                          className={INPUT}
                        >
                          <option value="">Seleccionar...</option>
                          {opcionesServicios}
                        </select>
                      </Campo>
                      {campoDuracion}
                    </div>
                  </Seccion>
                )}

                {tipoCita && (
                  <>
                    <FechasHorasSection
                      fechasHoras={formularioCita.fechasHoras}
                      duracion={formularioCita.duracion}
                      modoEdicion={modoEdicion}
                      deshabilitado={deshabilitadoForm}
                      reglas={reglas}
                      contador={
                        tipoCita === 'NORMAL' && ventaSeleccionada && !modoEdicion
                          ? { actual: slotsActuales, maximo: sesionesDisponiblesVenta }
                          : null
                      }
                      agregarDeshabilitado={agregarDeshabilitado}
                      agregarTitulo={agregarDeshabilitado ? `Límite alcanzado: ${sesionesDisponiblesVenta} sesiones disponibles` : 'Agregar más fechas/horas'}
                      onAgregar={agregarFechaHora}
                      onCambioFecha={manejarCambioFecha}
                      onCambioHora={manejarCambioHora}
                      onAjuste={manejarAjusteMinutos}
                      onEliminar={(index) => onFormularioChange('eliminarFechaHora', index)}
                    />

                    <Seccion icono={FileText} titulo="Nota (opcional)">
                      <textarea
                        value={formularioCita.nota || ''}
                        onChange={(e) => onFormularioChange('nota', e.target.value)}
                        disabled={deshabilitadoForm}
                        rows={2}
                        placeholder="Observaciones adicionales..."
                        className={`${INPUT} resize-none`}
                      />
                    </Seccion>
                  </>
                )}

                {modoEdicion && !esTerapeuta && !modoSoloLectura && (
                  <div className="rounded-2xl border border-yellow-200 bg-yellow-50/70 p-4">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Motivo de modificación <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={motivoAccion}
                      onChange={(e) => !modoSoloLectura && onFormularioChange('motivo_accion', e.target.value)}
                      rows={3}
                      placeholder="Explica detalladamente el motivo de la modificación..."
                      autoComplete="off"
                      className="w-full resize-none rounded-xl border border-yellow-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-yellow-400/25"
                    />
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-yellow-700">
                      <AlertCircle className="h-3 w-3" /> Este campo es obligatorio para modificar una cita
                    </p>
                  </div>
                )}
              </div>
            )}

            {mostrarTabs && tabValue === 1 && (
              <TabHistorial historial={historial} cargando={loadingHistorial} error={errorHistorial} />
            )}

            {mostrarTabs && tabValue === 2 && (
              <TabAsistencia
                seguimiento={seguimientoAsistencia}
                cargando={cargandoAsistencia}
                guardando={guardandoAsistencia}
                esAdmin={esAdmin}
                esRecepcionista={esRecepcionista}
                esTerapeuta={esTerapeuta}
                onMarcar={marcarAsistencia}
              />
            )}

            {mostrarTabs && tabValue === 3 && (
              <TabRecordatorio
                cita={citaEditando}
                modoSoloLectura={modoSoloLectura}
                mensaje={mensajeRecordatorio}
                cargando={cargandoRecordatorio}
                copiado={copiado}
                onGenerar={generarMensajeRecordatorio}
                onCopiar={copiarAlPortapapeles}
              />
            )}

            {mostrarTabs && tabValue === 4 && (
              <TabPaquete
                infoPaquete={infoPaquete}
                cargando={cargandoPaquete}
                citaId={citaEditando?.id}
                cargandoVenta={cargandoVentaDetalle}
                onAbrirVenta={abrirDetalleVenta}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-shrink-0 items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
            {modoEdicion && puedeEliminar ? (
              <button
                type="button"
                onClick={() => setDialogoEliminarAbierto(true)}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Eliminar
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              {esTerapeuta || modoSoloLectura ? (
                <button type="button" onClick={onClose} className={BTN_PRIMARY}>
                  Cerrar
                </button>
              ) : (
                <>
                  <button type="button" onClick={onClose} disabled={guardando} className={BTN_OUTLINE}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleGuardar}
                    disabled={guardando || guardandoLocal || bloqueadoPorAsistencia}
                    className={BTN_PRIMARY}
                  >
                    {guardando || guardandoLocal ? (
                      <><Spinner />Guardando...</>
                    ) : (
                      <><Save className="h-4 w-4" />{modoEdicion ? 'Actualizar' : 'Guardar'}</>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmar eliminación */}
      {dialogoEliminarAbierto && (
        <Dialogo
          tono="error"
          titulo="Confirmar eliminación"
          z="z-[60]"
          ancho="max-w-md"
          icono={AlertTriangle}
          footer={
            <>
              <button type="button" onClick={cerrarDialogoEliminar} className={BTN_OUTLINE}>
                Cancelar
              </button>
              <button type="button" onClick={confirmarEliminar} className={`flex items-center gap-2 ${botonDialogo('error')}`}>
                <Trash2 className="h-4 w-4" /> Eliminar
              </button>
            </>
          }
        >
          <p className="mb-4 text-sm text-gray-700">¿Seguro que deseas eliminar esta cita? Esta acción no se puede deshacer.</p>
          {citaEditando && (
            <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600">
              <p>
                <span className="font-semibold">Paciente:</span>{' '}
                {citaEditando.tipo_cita === 'REUNION_CLINICA' && !formularioCita.paciente
                  ? 'Reunión Interna'
                  : formularioCita.paciente?.nombre_completo || 'N/A'}
              </p>
              <p className="mt-1">
                <span className="font-semibold">Fecha:</span> {formularioCita.fechasHoras?.[0]?.fecha} - {formularioCita.fechasHoras?.[0]?.horaInicio}
              </p>
            </div>
          )}
          <div className="rounded-xl border border-red-200 bg-red-50/70 p-3">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Motivo de eliminación <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motivoEliminacion}
              onChange={(e) => setMotivoEliminacion(e.target.value)}
              rows={3}
              placeholder="Explica detalladamente el motivo de la eliminación..."
              className="w-full resize-none rounded-xl border border-red-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-red-500/15"
            />
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-700">
              <AlertCircle className="h-3 w-3" /> Este campo es obligatorio para eliminar una cita
            </p>
          </div>
        </Dialogo>
      )}

      {/* Alerta */}
      {alerta && (
        <Dialogo
          tono={alerta.tipo}
          titulo={alerta.titulo}
          footer={
            <button type="button" onClick={() => setAlerta(null)} className={`w-full ${botonDialogo(alerta.tipo)}`}>
              Entendido
            </button>
          }
        >
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{alerta.mensaje}</p>
        </Dialogo>
      )}

      {/* Confirmar agendar en feriado */}
      {confirmFeriado && (
        <Dialogo
          tono="feriado"
          titulo="Día feriado"
          z="z-[80]"
          footer={
            <>
              <button type="button" onClick={() => setConfirmFeriado(null)} className={BTN_OUTLINE}>
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const continuar = confirmFeriado.continuar;
                  setConfirmFeriado(null);
                  continuar?.();
                }}
                className={botonDialogo('feriado')}
              >
                Agendar igual
              </button>
            </>
          }
        >
          <p className="text-sm leading-relaxed text-gray-700">
            El <b>{confirmFeriado.feriado.fecha}</b> es feriado:
            <br />🎉 <b>{confirmFeriado.feriado.nombre}</b>
          </p>
          <p className="mt-3 text-sm text-gray-600">¿Deseas agendar la cita igual en este día feriado?</p>
        </Dialogo>
      )}

      {ventaDetallePaquete && (
        <DetalleVentaModal venta={ventaDetallePaquete} tipo="servicio" onClose={() => setVentaDetallePaquete(null)} />
      )}
    </>
  );
};

export default React.memo(ModalAgendarCita);