import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDaysIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InboxIcon,
  ChatBubbleLeftEllipsisIcon,
} from '@heroicons/react/24/outline';
import {
  getSolicitudesReprogramacion,
  revisarSolicitudReprogramacion,
} from '../../services/reprogramacionService';
import { useCurrentUser } from '../../hooks/useCurrentUser';

const TABS = [
  { key: 'pendiente', label: 'Pendientes', icon: ClockIcon },
  { key: 'aprobada', label: 'Aprobadas', icon: CheckCircleIcon },
  { key: 'rechazada', label: 'Rechazadas', icon: XCircleIcon },
];

const ESTADO_BADGE = {
  pendiente: { cls: 'bg-amber-50 text-amber-700', label: 'Pendiente' },
  aprobada: { cls: 'bg-green-50 text-green-700', label: 'Aprobada' },
  rechazada: { cls: 'bg-red-50 text-red-700', label: 'Rechazada' },
};

const fmtFecha = (f) => {
  if (!f) return '—';
  const soloFecha = String(f).slice(0, 10);
  const [y, m, d] = soloFecha.split('-');
  if (!y || !m || !d) return f;
  return `${d}/${m}/${y}`;
};

const fmtHora = (h) => (h ? String(h).slice(0, 5) : '—');

const fmtFechaHora = (dt) => {
  if (!dt) return '—';
  const date = new Date(dt);
  if (isNaN(date)) return '—';
  return date.toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const nombreTrabajador = (t) =>
  t ? `${t.nombres || ''} ${t.apellidos || ''}`.replace(/\s+/g, ' ').trim() : '—';

const CambioLinea = ({ label, antes, despues }) => {
  if (!despues && !antes) return null;
  const cambia = String(antes || '') !== String(despues || '');
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-20 flex-shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
      <span className={cambia ? 'text-gray-400 line-through' : 'text-gray-600'}>{antes || '—'}</span>
      {cambia && (
        <>
          <ArrowRightIcon className="h-3.5 w-3.5 flex-shrink-0 text-[#7B1FA2]" />
          <span className="font-semibold text-gray-900">{despues || '—'}</span>
        </>
      )}
    </div>
  );
};

const SolicitudesReprogramacionPage = () => {
  const user = useCurrentUser();
  const [tab, setTab] = useState('pendiente');
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [notif, setNotif] = useState({ open: false, message: '', type: 'success' });
  const [modalRechazo, setModalRechazo] = useState({ open: false, solicitud: null, comentario: '' });

  const showNotif = (message, type = 'success') => {
    setNotif({ open: true, message, type });
    setTimeout(() => setNotif((n) => ({ ...n, open: false })), 4000);
  };

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSolicitudesReprogramacion(tab);
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar solicitudes de reprogramación:', err);
      showNotif('No se pudieron cargar las solicitudes', 'error');
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { cargar(); }, [cargar]);

  const aprobar = async (solicitud) => {
    setProcesando(solicitud.id);
    try {
      await revisarSolicitudReprogramacion(solicitud.id, {
        estado: 'aprobada',
        revisor_id: user?.id,
      });
      showNotif('Solicitud aprobada — la cita fue reprogramada');
      await cargar();
    } catch (err) {
      console.error('Error al aprobar:', err);
      const msg = err.response?.data?.message || 'No se pudo aplicar la reprogramación';
      showNotif(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
    } finally {
      setProcesando(null);
    }
  };

  const confirmarRechazo = async () => {
    const { solicitud, comentario } = modalRechazo;
    setProcesando(solicitud.id);
    try {
      await revisarSolicitudReprogramacion(solicitud.id, {
        estado: 'rechazada',
        revisor_id: user?.id,
        comentario: comentario?.trim() || null,
      });
      showNotif('Solicitud rechazada');
      setModalRechazo({ open: false, solicitud: null, comentario: '' });
      await cargar();
    } catch (err) {
      console.error('Error al rechazar:', err);
      showNotif(err.response?.data?.message || 'No se pudo rechazar la solicitud', 'error');
    } finally {
      setProcesando(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Notificación */}
      {notif.open && (
        <div className="fixed top-6 right-6 z-[90000] flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3.5 shadow-lg">
          <div className={`h-1.5 w-1.5 rounded-full ${notif.type === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-700">{notif.message}</span>
        </div>
      )}

      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Cabecera */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] shadow-lg">
              <CalendarDaysIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Solicitudes de reprogramación</h1>
              <p className="text-sm text-gray-500">Revisa y aprueba los cambios de cita propuestos por Admisión.</p>
            </div>
          </div>
          <button
            onClick={cargar}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-gray-300"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                tab === key
                  ? 'bg-[#7B1FA2] text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl border border-gray-200 bg-white" />
            ))}
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-16 text-center shadow-sm">
            <InboxIcon className="h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-500">No hay solicitudes {TABS.find((t) => t.key === tab)?.label.toLowerCase()}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {solicitudes.map((s) => {
              const badge = ESTADO_BADGE[s.estado] || ESTADO_BADGE.pendiente;
              const esPendiente = s.estado === 'pendiente';
              const enProceso = procesando === s.id;
              return (
                <div key={s.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${badge.cls}`}>
                          {badge.label}
                        </span>
                        <h3 className="text-base font-bold text-gray-900">{s.paciente_nombre || `Cita #${s.cita_id}`}</h3>
                      </div>

                      {/* Cambios propuestos */}
                      <div className="space-y-1.5 rounded-xl bg-gray-50 p-3.5">
                        <CambioLinea label="Fecha" antes={fmtFecha(s.fecha_anterior)} despues={fmtFecha(s.fecha_nueva)} />
                        <CambioLinea label="Hora" antes={fmtHora(s.hora_inicio_anterior)} despues={fmtHora(s.hora_inicio_nueva)} />
                        <CambioLinea label="Terapeuta" antes={s.doctor_nombre_anterior} despues={s.doctor_nombre_nuevo} />
                        <CambioLinea label="Servicio" antes={s.servicio_nombre_anterior} despues={s.servicio_nombre_nuevo} />
                        <CambioLinea label="Motivo cita" antes={s.motivo_cita_anterior} despues={s.motivo_cita_nuevo} />
                      </div>

                      {s.motivo && (
                        <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                          <ChatBubbleLeftEllipsisIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#7B1FA2]" />
                          <span><span className="font-semibold text-gray-700">Motivo:</span> {s.motivo}</span>
                        </div>
                      )}

                      {/* Metadatos */}
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                          <UserIcon className="h-3.5 w-3.5 text-gray-400" />
                          Solicita: <span className="font-medium text-gray-700">{nombreTrabajador(s.solicitante)}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <ClockIcon className="h-3.5 w-3.5 text-gray-400" />
                          Generada: {fmtFechaHora(s.created_at)}
                        </span>
                        {s.estado !== 'pendiente' && (
                          <span className="inline-flex items-center gap-1.5">
                            <CheckCircleIcon className="h-3.5 w-3.5 text-gray-400" />
                            {badge.label} por {nombreTrabajador(s.revisor)} · {fmtFechaHora(s.fecha_revision)}
                          </span>
                        )}
                      </div>

                      {s.comentario_revisor && (
                        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                          Comentario: {s.comentario_revisor}
                        </p>
                      )}
                    </div>

                    {/* Acciones */}
                    {esPendiente && (
                      <div className="flex flex-shrink-0 gap-2 lg:flex-col">
                        <button
                          onClick={() => aprobar(s)}
                          disabled={enProceso}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#A3C644] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#8FB82D] disabled:opacity-50"
                        >
                          {enProceso ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <CheckIcon className="h-4 w-4" />}
                          Aceptar
                        </button>
                        <button
                          onClick={() => setModalRechazo({ open: true, solicitud: s, comentario: '' })}
                          disabled={enProceso}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 disabled:opacity-50"
                        >
                          <XMarkIcon className="h-4 w-4" />
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de rechazo */}
      {modalRechazo.open && (
        <div className="fixed inset-0 z-[80000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModalRechazo({ open: false, solicitud: null, comentario: '' })}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center gap-3 border-b border-red-200 bg-red-50 px-6 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Rechazar solicitud</h2>
            </div>
            <div className="p-6">
              <p className="mb-4 text-sm text-gray-600">
                La cita no se modificará. Puedes indicar un motivo del rechazo (opcional).
              </p>
              <textarea
                value={modalRechazo.comentario}
                onChange={(e) => setModalRechazo((m) => ({ ...m, comentario: e.target.value }))}
                rows={3}
                placeholder="Motivo del rechazo…"
                className="w-full resize-none rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#7B1FA2] focus:outline-none focus:ring-1 focus:ring-[#7B1FA2]"
              />
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setModalRechazo({ open: false, solicitud: null, comentario: '' })}
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarRechazo}
                  disabled={procesando === modalRechazo.solicitud?.id}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50"
                >
                  Confirmar rechazo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitudesReprogramacionPage;
