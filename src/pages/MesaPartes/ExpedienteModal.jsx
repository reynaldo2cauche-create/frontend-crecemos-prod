import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Loader2, Paperclip, Download, Send, CheckCircle2, XCircle,
  Bell, PackageCheck, MessageSquarePlus, User, Phone, FileText, AlertTriangle, Printer,
} from 'lucide-react';
import {
  getSolicitud, responderSolicitud, observarSolicitud,
  notificarSolicitud, entregarSolicitud, comentarSolicitud, verAdjunto,
} from '../../services/mesaPartesService';
import { EstadoBadge, fmtFecha, imprimirCargo } from './shared';

const PURPLE = '#7B1FA2';
const nombreUsuario = (u) => (u ? [u.nombres, u.apellidos].filter(Boolean).join(' ') : 'Sistema');
const nombrePaciente = (p) => (p ? [p.nombres, p.apellido_paterno, p.apellido_materno].filter(Boolean).join(' ') : '—');

// Lista de adjuntos de un grupo (solicitud vs respuesta)
const AdjuntoLinks = ({ items }) => {
  const [abriendo, setAbriendo] = useState(null);
  const abrir = async (a) => {
    setAbriendo(a.id);
    try {
      const url = await verAdjunto(a.ruta);
      window.open(url, '_blank', 'noopener');
    } catch (e) {
      console.error('Error al abrir adjunto:', e);
      alert('No se pudo abrir el archivo.');
    } finally {
      setAbriendo(null);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((a) => (
        <button key={a.id} onClick={() => abrir(a)} disabled={abriendo === a.id}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition max-w-[220px] disabled:opacity-60">
          {abriendo === a.id ? <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" /> : <Download className="w-3.5 h-3.5 flex-shrink-0" />}
          <span className="truncate">{a.nombre_archivo}</span>
        </button>
      ))}
    </div>
  );
};

// Separa los adjuntos según el evento que los subió:
//  - solicitud: documento físico entregado al registrar (evento_id null o RECEPCION)
//  - respuesta: documento que adjuntó el admin al responder (RESPUESTA / RECHAZO)
const AdjuntosSeccion = ({ sol }) => {
  if (!sol.adjuntos?.length) return null;
  const codigoPorEvento = {};
  (sol.eventos || []).forEach((ev) => { codigoPorEvento[ev.id] = ev.tipoEvento?.codigo; });

  const esRespuesta = (a) => ['RESPUESTA', 'RECHAZO'].includes(codigoPorEvento[a.evento_id]);
  const deSolicitud = sol.adjuntos.filter((a) => !a.evento_id || codigoPorEvento[a.evento_id] === 'RECEPCION');
  const deRespuesta = sol.adjuntos.filter(esRespuesta);
  const otros = sol.adjuntos.filter(
    (a) => a.evento_id && !['RECEPCION', 'RESPUESTA', 'RECHAZO'].includes(codigoPorEvento[a.evento_id]),
  );

  return (
    <div className="space-y-3">
      {deSolicitud.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold mb-2">Documento de la solicitud</p>
          <AdjuntoLinks items={deSolicitud} />
        </div>
      )}
      {deRespuesta.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wide text-green-600 font-semibold mb-2">Documento de la respuesta</p>
          <AdjuntoLinks items={deRespuesta} />
        </div>
      )}
      {otros.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold mb-2">Otros adjuntos</p>
          <AdjuntoLinks items={otros} />
        </div>
      )}
    </div>
  );
};

const Dato = ({ label, value, icon: Icon }) => (
  <div>
    <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">{label}</p>
    <p className="text-sm text-gray-800 flex items-center gap-1.5">{Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}{value}</p>
  </div>
);

const ExpedienteModal = ({ id, isAdmin, isAdmision, userId, onClose, onChanged }) => {
  const [sol, setSol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Panel de respuesta (admin)
  const [resultado, setResultado] = useState('ATENDIDA');
  const [respuesta, setRespuesta] = useState('');
  const [archivos, setArchivos] = useState([]);

  // Acción genérica con comentario
  const [accion, setAccion] = useState(null); // 'observar' | 'notificar' | 'entregar' | 'comentar'
  const [comentario, setComentario] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    try { setSol(await getSolicitud(id)); }
    catch { setError('No se pudo cargar el expediente.'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const refrescar = async () => { await cargar(); onChanged?.(); };

  const codigo = sol?.estado?.codigo;
  // El administrador responde (atiende / rechaza / observa)
  const canResponder = isAdmin && ['RECEPCIONADA', 'OBSERVADA'].includes(codigo);
  const canObservar = isAdmin && codigo === 'RECEPCIONADA';
  // Admisión (recepción) es quien notifica y entrega al apoderado
  const esRechazo = codigo === 'RECHAZADA';
  const canNotificar = isAdmision && ['ATENDIDA', 'RECHAZADA'].includes(codigo);
  const canEntregar = isAdmision && codigo === 'NOTIFICADA';
  const canComentar = codigo !== 'CERRADA';

  const enviarRespuesta = async () => {
    if (!respuesta.trim()) return setError('Escriba la respuesta o el motivo.');
    setError(''); setBusy(true);
    try {
      await responderSolicitud(id, { resultado, respuesta: respuesta.trim(), usuario_id: userId }, archivos);
      setRespuesta(''); setArchivos([]);
      await refrescar();
    } catch (e) { setError(e.response?.data?.message || 'No se pudo responder.'); }
    finally { setBusy(false); }
  };

  const ejecutarAccion = async () => {
    if (accion === 'observar' && !comentario.trim()) return setError('La observación requiere un comentario.');
    if (accion === 'comentar' && !comentario.trim()) return setError('Escriba un comentario.');
    setError(''); setBusy(true);
    const payload = { comentario: comentario.trim(), usuario_id: userId };
    try {
      if (accion === 'observar') await observarSolicitud(id, payload);
      else if (accion === 'notificar') await notificarSolicitud(id, payload);
      else if (accion === 'entregar') await entregarSolicitud(id, payload);
      else if (accion === 'comentar') await comentarSolicitud(id, payload);
      setAccion(null); setComentario('');
      await refrescar();
    } catch (e) { setError(e.response?.data?.message || 'No se pudo ejecutar la acción.'); }
    finally { setBusy(false); }
  };

  const AccionBtn = ({ onClick, icon: Icon, children, color = 'text-gray-700 bg-gray-100 hover:bg-gray-200' }) => (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${color}`}>
      <Icon className="w-4 h-4" /> {children}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-gray-900">{sol?.numero_expediente || '…'}</span>
            {sol?.estado && <EstadoBadge estado={sol.estado} />}
          </div>
          <div className="flex items-center gap-1">
            {sol && (
              <button onClick={() => imprimirCargo(sol)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition" title="Imprimir cargo">
                <Printer className="w-4 h-4" /> Cargo
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        ) : !sol ? (
          <div className="py-16 text-center text-gray-400">{error || 'No encontrado'}</div>
        ) : (
          <div className="p-5 space-y-5">
            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-sm text-red-700">{error}</div>}

            {/* Datos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4">
              <Dato label="Tipo" value={sol.tipo?.nombre || '—'} icon={FileText} />
              <Dato label="Fecha recepción" value={fmtFecha(sol.created_at)} />
              <Dato label="Paciente" value={nombrePaciente(sol.paciente)} />
              <Dato label="Entregado por" value={sol.entregado_por_nombre} icon={User} />
              <Dato label="Documento" value={sol.entregado_por_doc || '—'} />
              <Dato label="Teléfono" value={sol.entregado_por_telefono || '—'} icon={Phone} />
            </div>

            {sol.asunto && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold mb-1">Asunto</p>
                <p className="text-sm font-medium text-gray-800">{sol.asunto}</p>
              </div>
            )}

            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold mb-1">Descripción</p>
              <p className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg p-3">{sol.descripcion}</p>
            </div>

            {/* Respuesta vigente */}
            {sol.respuesta && (
              <div className={`rounded-xl p-4 border ${codigo === 'RECHAZADA' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                <p className={`text-[11px] uppercase tracking-wide font-semibold mb-1 ${codigo === 'RECHAZADA' ? 'text-red-600' : 'text-green-700'}`}>
                  {codigo === 'RECHAZADA' ? 'Motivo del rechazo' : 'Respuesta'}
                </p>
                <p className="text-sm text-gray-800">{sol.respuesta}</p>
              </div>
            )}

            {/* Adjuntos separados por origen (solicitud vs respuesta) */}
            <AdjuntosSeccion sol={sol} />

            {/* Bitácora */}
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold mb-2">Bitácora</p>
              <ol className="relative border-l-2 border-gray-100 ml-1.5 space-y-4">
                {sol.eventos?.map((ev) => (
                  <li key={ev.id} className="ml-4">
                    <span className="absolute -left-[7px] w-3 h-3 rounded-full bg-purple-400 ring-4 ring-white" />
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800">{ev.tipoEvento?.nombre}</span>
                      {ev.estadoNuevo && (
                        <span className="text-[11px] text-gray-400">→ {ev.estadoNuevo?.nombre}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">{fmtFecha(ev.created_at)} · {nombreUsuario(ev.usuarioCrea)}</p>
                    {ev.comentario && <p className="text-sm text-gray-600 mt-0.5">{ev.comentario}</p>}
                  </li>
                ))}
              </ol>
            </div>

            {/* ===== Panel de respuesta (ADMIN) ===== */}
            {canResponder && (
              <div className="border border-purple-100 rounded-xl p-4 bg-purple-50/40">
                <p className="text-sm font-bold text-gray-800 mb-3">Responder solicitud</p>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setResultado('ATENDIDA')}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition ${resultado === 'ATENDIDA' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                    <CheckCircle2 className="w-4 h-4" /> Atender
                  </button>
                  <button onClick={() => setResultado('RECHAZADA')}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition ${resultado === 'RECHAZADA' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                    <XCircle className="w-4 h-4" /> Rechazar
                  </button>
                </div>
                <textarea value={respuesta} onChange={(e) => setRespuesta(e.target.value)} rows={3}
                  placeholder={resultado === 'RECHAZADA' ? 'Motivo del rechazo…' : 'Respuesta para el apoderado…'}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200 mb-2" />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs text-purple-700 cursor-pointer">
                    <Paperclip className="w-4 h-4" /> {archivos.length > 0 ? `${archivos.length} archivo(s)` : 'Adjuntar respuesta'}
                    <input type="file" multiple accept="image/*,application/pdf" className="hidden"
                      onChange={(e) => setArchivos(Array.from(e.target.files || []))} />
                  </label>
                  <button onClick={enviarRespuesta} disabled={busy}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ background: PURPLE }}>
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Guardar
                  </button>
                </div>
              </div>
            )}

            {/* ===== Acciones ===== */}
            {!accion && (canObservar || canNotificar || canEntregar || canComentar) && (
              <div className="flex flex-wrap gap-2">
                {canObservar && <AccionBtn onClick={() => setAccion('observar')} icon={AlertTriangle} color="text-amber-700 bg-amber-100 hover:bg-amber-200">Observar</AccionBtn>}
                {canNotificar && <AccionBtn onClick={() => setAccion('notificar')} icon={Bell} color="text-teal-700 bg-teal-100 hover:bg-teal-200">{esRechazo ? 'Informar y cerrar' : 'Notificar al apoderado'}</AccionBtn>}
                {canEntregar && <AccionBtn onClick={() => setAccion('entregar')} icon={PackageCheck} color="text-green-700 bg-green-100 hover:bg-green-200">Entregar / Cerrar</AccionBtn>}
                {canComentar && <AccionBtn onClick={() => setAccion('comentar')} icon={MessageSquarePlus}>Comentario</AccionBtn>}
              </div>
            )}

            {accion && (
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  {accion === 'observar' && 'Observar (pedir corrección)'}
                  {accion === 'notificar' && (esRechazo ? 'Informar el rechazo y cerrar' : 'Confirmar aviso al apoderado')}
                  {accion === 'entregar' && 'Entregar respuesta y cerrar'}
                  {accion === 'comentar' && 'Comentario interno'}
                </p>
                <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows={2}
                  placeholder={
                    accion === 'observar' ? '¿Qué debe corregir el apoderado?'
                    : accion === 'notificar' ? (esRechazo ? '¿Cómo se le informó del rechazo? (ej: se le llamó, se le explicó el motivo)' : '¿Cómo se le avisó? (ej: se le llamó, confirmó que pasa el jueves)')
                    : accion === 'entregar' ? 'Nota de entrega (opcional)'
                    : 'Escriba su comentario…'
                  }
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200 mb-2" />
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setAccion(null); setComentario(''); setError(''); }} className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancelar</button>
                  <button onClick={ejecutarAccion} disabled={busy}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ background: PURPLE }}>
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Confirmar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpedienteModal;
