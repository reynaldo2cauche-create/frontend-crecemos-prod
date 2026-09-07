import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SunIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  PaperClipIcon,
  ArrowPathIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  getResumenAsistencia,
  getMisSolicitudes,
  crearSolicitud,
  subirAdjuntoSolicitud,
  eliminarSolicitud,
} from '../../services/rrhhService';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import HoraPicker from '../HoraPicker/HoraPicker';

// Anticipación mínima (días) por tipo — espejo del backend.
const MIN_ANTICIPACION = {
  permiso_medico: 0,
  otro: 0,
  permiso_horas: 0,
  permiso_capacitacion: 30,
  permiso_personal: 60,
  vacaciones: 90,
};

const MOTIVO_OBLIGATORIO = ['permiso_medico', 'permiso_capacitacion', 'permiso_personal', 'otro'];
const ADJUNTO_OBLIGATORIO = ['permiso_capacitacion', 'otro'];

const TIPOS_PERMISO = [
  { id: 'permiso_personal', label: 'Permiso personal' },
  { id: 'permiso_medico', label: 'Permiso médico' },
  { id: 'permiso_capacitacion', label: 'Permiso por capacitación' },
  { id: 'permiso_horas', label: 'Permiso por horas' },
  { id: 'otro', label: 'Otro' },
];

const LABEL_TIPO = {
  permiso_personal: 'Permiso personal',
  permiso_medico: 'Permiso médico',
  permiso_capacitacion: 'Permiso por capacitación',
  permiso_horas: 'Permiso por horas',
  vacaciones: 'Vacaciones',
  otro: 'Otro',
};

const ESTADO_BADGE = {
  pendiente: 'bg-amber-50 text-amber-700',
  aprobado: 'bg-green-50 text-green-700',
  rechazado: 'bg-red-50 text-red-700',
};

const NOMBRE_MES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// Formatea Date -> 'YYYY-MM-DD' en hora local (evita el corrimiento de toISOString).
const fmtFecha = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const fechaMinima = (tipo) => {
  const dias = MIN_ANTICIPACION[tipo] ?? 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dias);
  return fmtFecha(d);
};

const formatearVisual = (fechaStr) => {
  if (!fechaStr) return '';
  const [y, m, d] = String(fechaStr).split('T')[0].split('-');
  return `${d}/${m}/${y}`;
};

export default function MiAsistencia({ perfil }) {
  const trabajadorId = perfil?.id;
  const ahora = new Date();
  const [resumen, setResumen] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'permiso' | 'vacaciones' | null
  const [notif, setNotif] = useState(null);
  const [porEliminar, setPorEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const showNotif = (message, type = 'success') => {
    setNotif({ message, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const cargar = useCallback(async () => {
    if (!trabajadorId) return;
    setLoading(true);
    try {
      const [res, sols] = await Promise.all([
        getResumenAsistencia({ mes: ahora.getMonth() + 1, anio: ahora.getFullYear(), trabajadorId }),
        getMisSolicitudes(trabajadorId),
      ]);
      setResumen(res);
      setSolicitudes(Array.isArray(sols) ? sols : []);
    } catch (e) {
      console.error('Error al cargar Mi asistencia:', e);
    } finally {
      setLoading(false);
    }
  }, [trabajadorId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const onCreada = () => {
    setModal(null);
    showNotif('Solicitud enviada. Queda pendiente de aprobación por RRHH.', 'success');
    cargar();
  };

  const confirmarEliminar = async () => {
    if (!porEliminar) return;
    setEliminando(true);
    try {
      await eliminarSolicitud(porEliminar);
      showNotif('Solicitud eliminada', 'success');
      setPorEliminar(null);
      cargar();
    } catch (e) {
      showNotif(e.response?.data?.message || 'No se pudo eliminar', 'error');
    } finally {
      setEliminando(false);
    }
  };

  const indicadores = [
    { label: 'Faltas', valor: resumen?.faltas ?? 0, icon: ExclamationTriangleIcon, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Tardanzas', valor: resumen?.tardanzas ?? 0, icon: ClockIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Permisos', valor: resumen?.permisos ?? 0, icon: CalendarDaysIcon, color: 'text-[#7B1FA2]', bg: 'bg-purple-50' },
    { label: 'Vacaciones', valor: resumen?.vacaciones ?? 0, icon: SunIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="mb-10">
      {notif && (
        <div className="fixed top-6 right-6 z-[60] px-5 py-3 rounded-xl shadow-lg border bg-white border-gray-200 flex items-center gap-2.5">
          {notif.type === 'success'
            ? <CheckCircleIcon className="w-5 h-5 text-[#A3C644]" />
            : <XMarkIcon className="w-5 h-5 text-red-500" />}
          <span className="text-xs font-medium text-gray-700">{notif.message}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center">
              <CalendarDaysIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Mi asistencia</h2>
              <p className="text-xs text-gray-500">{NOMBRE_MES[ahora.getMonth()]} {ahora.getFullYear()}</p>
            </div>
          </div>
          <button onClick={cargar} className="p-2 text-gray-400 hover:text-[#7B1FA2] hover:bg-purple-50 rounded-lg transition-all" title="Actualizar">
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Indicadores */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6">
          {indicadores.map((ind) => (
            <div key={ind.label} className="rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">{ind.label}</span>
                <div className={`w-8 h-8 ${ind.bg} rounded-lg flex items-center justify-center`}>
                  <ind.icon className={`w-4 h-4 ${ind.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{ind.valor}</div>
            </div>
          ))}
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 px-6 pb-6">
          <button
            onClick={() => setModal('permiso')}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#7B1FA2] text-white text-sm font-semibold rounded-xl hover:bg-[#6A1B9A] transition-all shadow-sm"
          >
            <PlusIcon className="w-5 h-5" /> Solicitar permiso
          </button>
          <button
            onClick={() => setModal('vacaciones')}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#A3C644] text-white text-sm font-semibold rounded-xl hover:bg-[#8FB82D] transition-all shadow-sm"
          >
            <PlusIcon className="w-5 h-5" /> Solicitar vacaciones
          </button>
        </div>

        {/* Mis solicitudes recientes */}
        {solicitudes.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Mis solicitudes</p>
            <div className="space-y-2">
              {solicitudes.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{LABEL_TIPO[s.tipo] || s.tipo}</p>
                    <p className="text-xs text-gray-400">
                      {formatearVisual(s.fecha_inicio)}
                      {s.fecha_fin && s.fecha_fin !== s.fecha_inicio ? ` — ${formatearVisual(s.fecha_fin)}` : ''}
                      {s.hora_desde ? ` · ${s.hora_desde?.slice(0, 5)}-${s.hora_hasta?.slice(0, 5)}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ESTADO_BADGE[s.estado] || 'bg-gray-100 text-gray-600'}`}>
                      {s.estado}
                    </span>
                    {s.estado === 'pendiente' && (
                      <button
                        onClick={() => setPorEliminar(s.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Eliminar solicitud"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal === 'permiso' && (
        <ModalPermiso trabajadorId={trabajadorId} onClose={() => setModal(null)} onCreada={onCreada} notify={showNotif} />
      )}
      {modal === 'vacaciones' && (
        <ModalVacaciones trabajadorId={trabajadorId} onClose={() => setModal(null)} onCreada={onCreada} notify={showNotif} />
      )}

      <ConfirmModal
        open={porEliminar != null}
        title="Eliminar solicitud"
        message="¿Estás seguro de eliminar esta solicitud? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        loading={eliminando}
        onConfirm={confirmarEliminar}
        onCancel={() => setPorEliminar(null)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal: Solicitar permiso
// ─────────────────────────────────────────────────────────────────────────────
function ModalPermiso({ trabajadorId, onClose, onCreada, notify }) {
  const [tipo, setTipo] = useState('permiso_personal');
  const [fecha, setFecha] = useState('');
  const [horaDesde, setHoraDesde] = useState('');
  const [horaHasta, setHoraHasta] = useState('');
  const [motivo, setMotivo] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const minFecha = fechaMinima(tipo);
  const motivoReq = MOTIVO_OBLIGATORIO.includes(tipo);
  const adjuntoReq = ADJUNTO_OBLIGATORIO.includes(tipo);
  const esPorHoras = tipo === 'permiso_horas';

  // Al cambiar de tipo, si la fecha elegida ya no cumple la anticipación, la limpio.
  useEffect(() => {
    if (fecha && fecha < minFecha) setFecha('');
  }, [tipo]); // eslint-disable-line

  const anticipacionTexto = () => {
    const d = MIN_ANTICIPACION[tipo] ?? 0;
    if (d === 0) return 'Se puede solicitar desde hoy en adelante.';
    if (d === 30) return 'Se debe avisar con 1 mes de anticipación.';
    if (d === 60) return 'Se debe avisar con 2 meses de anticipación.';
    return `Se debe solicitar con ${d} días de anticipación.`;
  };

  const validar = () => {
    if (!fecha) return 'Selecciona la fecha.';
    if (fecha < minFecha) return `Esa fecha no cumple la anticipación requerida (mínimo ${minFecha}).`;
    if (esPorHoras && (!horaDesde || !horaHasta)) return 'Indica la hora desde y hasta.';
    if (esPorHoras && horaHasta <= horaDesde) return 'La hora "hasta" debe ser mayor que "desde".';
    if (motivoReq && !motivo.trim()) return 'El motivo es obligatorio para este tipo.';
    if (adjuntoReq && !archivo) return 'Debes adjuntar un documento para este tipo.';
    return null;
  };

  const enviar = async () => {
    const error = validar();
    if (error) { notify(error, 'error'); return; }
    setEnviando(true);
    try {
      let archivoUrl;
      if (archivo) {
        const up = await subirAdjuntoSolicitud(archivo);
        archivoUrl = up.url;
      }
      await crearSolicitud({
        trabajadorId,
        tipo,
        fechaInicio: fecha,
        horaDesde: esPorHoras ? horaDesde : undefined,
        horaHasta: esPorHoras ? horaHasta : undefined,
        motivo: motivo.trim() || undefined,
        archivoUrl,
      });
      onCreada();
    } catch (e) {
      notify(e.response?.data?.message || 'Error al enviar la solicitud', 'error');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ModalShell titulo="Solicitar permiso" subtitulo="Nueva solicitud" onClose={onClose}>
      {/* Tipo */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Tipo</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TIPOS_PERMISO.map((t) => (
            <label
              key={t.id}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-all text-sm ${
                tipo === t.id ? 'border-[#7B1FA2] bg-purple-50 text-[#7B1FA2] font-semibold' : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <input type="radio" name="tipo" className="accent-[#7B1FA2]" checked={tipo === t.id} onChange={() => setTipo(t.id)} />
              {t.label}
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <ClockIcon className="w-3.5 h-3.5" /> {anticipacionTexto()}
        </p>
      </div>

      {/* Fecha */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Fecha <span className="text-red-500">*</span></label>
        <input
          type="date"
          min={minFecha}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] bg-white"
        />
      </div>

      {/* Horas (solo permiso por horas) */}
      {esPorHoras && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Desde <span className="text-red-500">*</span></label>
            <HoraPicker value={horaDesde} onChange={setHoraDesde} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Hasta <span className="text-red-500">*</span></label>
            <HoraPicker value={horaHasta} onChange={setHoraHasta} />
          </div>
        </div>
      )}

      {/* Motivo */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
          Motivo {motivoReq ? <span className="text-red-500">*</span> : <span className="text-gray-400 normal-case">(opcional)</span>}
        </label>
        <textarea
          rows="3"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Describe el motivo..."
          className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] resize-none bg-white"
        />
      </div>

      {/* Adjunto */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
          Adjuntar documento {adjuntoReq ? <span className="text-red-500">*</span> : <span className="text-gray-400 normal-case">(opcional)</span>}
        </label>
        <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#7B1FA2] transition-all text-sm text-gray-600">
          <PaperClipIcon className="w-4 h-4" />
          {archivo ? archivo.name : 'Seleccionar archivo...'}
          <input type="file" className="hidden" onChange={(e) => setArchivo(e.target.files?.[0] || null)} />
        </label>
      </div>

      <ModalFooter onClose={onClose} onEnviar={enviar} enviando={enviando} />
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal: Solicitar vacaciones
// ─────────────────────────────────────────────────────────────────────────────
function ModalVacaciones({ trabajadorId, onClose, onCreada, notify }) {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);

  const minFecha = fechaMinima('vacaciones'); // recomendado (3 meses), solo aviso
  const hoyStr = fmtFecha(new Date());

  // Aviso (no bloquea) si la fecha "desde" es antes de los 3 meses recomendados.
  const avisoAnticipacion = desde && desde < minFecha;

  const dias = (() => {
    if (!desde || !hasta) return 0;
    const d1 = new Date(`${desde}T00:00:00`);
    const d2 = new Date(`${hasta}T00:00:00`);
    if (d2 < d1) return 0;
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
  })();

  const enviar = async () => {
    if (!desde || !hasta) { notify('Selecciona el rango de fechas.', 'error'); return; }
    if (hasta < desde) { notify('La fecha "hasta" no puede ser anterior a "desde".', 'error'); return; }
    setEnviando(true);
    try {
      await crearSolicitud({
        trabajadorId,
        tipo: 'vacaciones',
        fechaInicio: desde,
        fechaFin: hasta,
        motivo: motivo.trim() || undefined,
      });
      onCreada();
    } catch (e) {
      notify(e.response?.data?.message || 'Error al enviar la solicitud', 'error');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ModalShell titulo="Solicitar vacaciones" subtitulo="Nueva solicitud" onClose={onClose} verde>
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex items-center gap-3">
        <SunIcon className="w-6 h-6 text-blue-600" />
        <p className="text-sm text-blue-800">Se recomienda solicitar las vacaciones con <b>3 meses de anticipación</b>.</p>
      </div>

      {avisoAnticipacion && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
          <ClockIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            Estás solicitando con <b>menos de 3 meses de anticipación</b>. Puedes enviarla igual, pero tenlo en cuenta: RRHH lo verá al revisar.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Desde <span className="text-red-500">*</span></label>
          <input type="date" min={hoyStr} value={desde} onChange={(e) => setDesde(e.target.value)} className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#A3C644] bg-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Hasta <span className="text-red-500">*</span></label>
          <input type="date" min={desde || hoyStr} value={hasta} onChange={(e) => setHasta(e.target.value)} className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#A3C644] bg-white" />
        </div>
      </div>

      {dias > 0 && (
        <div className="text-center py-2">
          <span className="text-sm text-gray-600">Total: </span>
          <span className="text-lg font-bold text-[#A3C644]">{dias} día{dias !== 1 ? 's' : ''}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Motivo <span className="text-gray-400 normal-case">(opcional)</span></label>
        <textarea rows="2" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Opcional..." className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#A3C644] resize-none bg-white" />
      </div>

      <ModalFooter onClose={onClose} onEnviar={enviar} enviando={enviando} verde />
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shell y footer reutilizables (panel lateral)
// ─────────────────────────────────────────────────────────────────────────────
function ModalShell({ titulo, subtitulo, onClose, children, verde }) {
  const grad = verde ? 'from-[#A3C644] to-[#8FB82D]' : 'from-[#7B1FA2] via-[#8E24AA] to-[#AB47BC]';
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-lg bg-white shadow-xl z-50 flex flex-col">
        <div className={`flex-shrink-0 bg-gradient-to-r ${grad} p-6`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-white/80 uppercase tracking-wide mb-1">{subtitulo}</p>
              <h2 className="text-2xl font-bold text-white">{titulo}</h2>
            </div>
            <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">{children}</div>
      </div>
    </>
  );
}

function ModalFooter({ onClose, onEnviar, enviando, verde }) {
  const btn = verde ? 'bg-[#A3C644] hover:bg-[#8FB82D]' : 'bg-[#7B1FA2] hover:bg-[#6A1B9A]';
  return (
    <div className="flex gap-3 justify-end pt-2">
      <button onClick={onClose} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all">
        Cancelar
      </button>
      <button
        onClick={onEnviar}
        disabled={enviando}
        className={`inline-flex items-center gap-2 ${btn} text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50`}
      >
        {enviando ? (
          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enviando...</>
        ) : (
          <><CheckCircleIcon className="w-4 h-4" /> Enviar solicitud</>
        )}
      </button>
    </div>
  );
}
