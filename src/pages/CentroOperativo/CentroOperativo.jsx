import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon, ClockIcon, PencilIcon, TrashIcon, ChatBubbleLeftIcon,
  PlayIcon, PauseIcon, ChartBarIcon, XMarkIcon, CheckIcon,
  ExclamationTriangleIcon, CalendarDaysIcon, BuildingOfficeIcon, Bars3Icon,
  PaperClipIcon, ArrowDownTrayIcon, UserGroupIcon, EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
  listarTareas, obtenerColumnas, obtenerPrioridades, crearTarea,
  actualizarTarea, eliminarTarea, moverColumna, iniciarTimer,
  pausarTimer, listarComentarios, agregarComentario, obtenerReporteMensual,
  crearColumna, eliminarColumna, reordenarColumnas,
  subirArchivos, listarArchivos, eliminarArchivo, reordenarTareas, eliminarComentario,
} from '../../services/centroOperativoService';
import { SERVER_BASE_URL, API_BASE_URL } from '../../services/api';
import { ROLES } from '../../constants/roles';
import api from '../../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getUser = () => JSON.parse(localStorage.getItem('user') || '{}');
const esAdmin = () => getUser()?.rol?.id === ROLES.ADMINISTRADOR;

function formatTiempo(segundos) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function estaVencida(tarea) {
  if (!tarea.fecha_limite) return false;
  if (tarea.columna?.es_final) return false;
  return new Date(tarea.fecha_limite) < new Date();
}

function diasRestantes(fecha) {
  if (!fecha) return null;
  return Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24));
}

function toDatetimeLocalLima(isoUtc) {
  if (!isoUtc) return '';
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Lima',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  }).format(new Date(isoUtc)).replace(' ', 'T');
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileColor(mime) {
  if (!mime) return 'bg-gray-400';
  if (mime.startsWith('image/')) return 'bg-blue-400';
  if (mime === 'application/pdf') return 'bg-red-400';
  if (mime.includes('word') || mime.includes('document')) return 'bg-blue-600';
  if (mime.includes('sheet') || mime.includes('excel')) return 'bg-green-500';
  return 'bg-gray-400';
}

function fileLabel(mime) {
  if (!mime) return 'DOC';
  if (mime.startsWith('image/')) return 'IMG';
  if (mime === 'application/pdf') return 'PDF';
  if (mime.includes('word') || mime.includes('document')) return 'DOC';
  if (mime.includes('sheet') || mime.includes('excel')) return 'XLS';
  return 'FILE';
}

// ─── Detección de tipo de archivo ────────────────────────────────────────────

const EXT_IMG = /\.(jpe?g|png|gif|webp|bmp|svg|avif|tiff?)$/i;
const EXT_PDF = /\.pdf$/i;

function esArchivoImagen(archivo) {
  if (archivo?.tipo_mime?.startsWith('image/')) return true;
  return EXT_IMG.test(archivo?.nombre_original || '');
}

function esArchivoPDF(archivo) {
  if (archivo?.tipo_mime === 'application/pdf') return true;
  return EXT_PDF.test(archivo?.nombre_original || '');
}

// ─── Descarga forzada (cross-origin) ─────────────────────────────────────────

async function descargarArchivo(url, nombre) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, '_blank');
  }
}

// ─── Vista previa blob (cross-origin) ────────────────────────────────────────

function PreviewContenido({ url, esImagen, esPdf }) {
  const [imgError, setImgError] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [pdfCargando, setPdfCargando] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    if (!esPdf) return;
    let revocado = false;
    setPdfCargando(true);
    setPdfError(false);
    setBlobUrl(null);
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(); return r.blob(); })
      .then(blob => { if (!revocado) setBlobUrl(URL.createObjectURL(blob)); })
      .catch(() => { if (!revocado) setPdfError(true); })
      .finally(() => { if (!revocado) setPdfCargando(false); });
    return () => { revocado = true; };
  }, [url, esPdf]);

  if (esImagen) {
    if (imgError) return (
      <div className="text-center text-gray-400 p-8">
        <ExclamationTriangleIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm font-medium">No se pudo cargar la imagen</p>
      </div>
    );
    return (
      <img src={url} alt="Vista previa"
        className="max-w-full max-h-full object-contain p-4"
        onError={() => setImgError(true)} />
    );
  }

  if (esPdf) {
    if (pdfCargando) return (
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-[#A3C644] rounded-full animate-spin" />
        <p className="text-xs">Cargando PDF…</p>
      </div>
    );
    if (pdfError || !blobUrl) return (
      <div className="text-center text-gray-400 p-8">
        <ExclamationTriangleIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm font-medium">No se pudo cargar el PDF</p>
        <p className="text-xs mt-1">Usa el botón Descargar para abrirlo</p>
      </div>
    );
    return <iframe src={blobUrl} className="w-full h-full border-0" title="Vista previa PDF" />;
  }

  return null;
}

// ─── Modal de confirmación ────────────────────────────────────────────────────

function ConfirmModal({ mensaje, onConfirmar, onCancelar }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4" onClick={onCancelar}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-snug">{mensaje}</p>
            <p className="text-xs text-gray-400 mt-1">Esta acción no se puede deshacer.</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancelar}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirmar}
            className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Timer en vivo ────────────────────────────────────────────────────────────

function useTiempoVivo(timer) {
  const [seg, setSeg] = useState(timer?.tiempo_acumulado || 0);
  useEffect(() => {
    if (!timer?.timer_activo || !timer?.timer_inicio) {
      setSeg(timer?.tiempo_acumulado || 0);
      return;
    }
    const base = timer.tiempo_acumulado || 0;
    const inicio = new Date(timer.timer_inicio).getTime();
    const tick = () => setSeg(Math.max(0, base + Math.floor((Date.now() - inicio) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timer?.timer_activo, timer?.timer_inicio, timer?.tiempo_acumulado]);
  return seg;
}

// ─── Notificación ─────────────────────────────────────────────────────────────

function Notificacion({ notif }) {
  if (!notif.show) return null;
  return (
    <div className={`fixed top-5 right-5 z-[999] flex items-center gap-3 px-4 py-3 rounded-xl text-white transition-all ${
      notif.type === 'error' ? 'bg-red-500' : 'bg-[#2E7D32]'
    }`} style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${notif.type === 'error' ? 'bg-red-600' : 'bg-[#1B5E20]'}`}>
        {notif.type === 'error'
          ? <ExclamationTriangleIcon className="w-4 h-4" />
          : <CheckIcon className="w-4 h-4" />}
      </div>
      <p className="font-medium text-sm">{notif.message}</p>
    </div>
  );
}

// ─── Tarjeta de tarea ─────────────────────────────────────────────────────────

function TareaCard({ tarea, onEditar, onEliminar, onToggleTimer, onVerDetalle, onDragStart, onDragEnd, onDragOverCard, puedeTimer, puedeEditar, puedeEliminar, isDragOver }) {
  const vencida = estaVencida(tarea);
  const miTimer = tarea.mi_timer ?? null;
  const tiempo = useTiempoVivo(miTimer);
  const timerActivo = miTimer?.timer_activo ?? false;
  const dias = diasRestantes(tarea.fecha_limite);

  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.setData('dragType', 'tarea'); onDragStart(tarea); }}
      onDragEnd={() => onDragEnd()}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onDragOverCard?.(tarea); }}
      onClick={() => onVerDetalle(tarea)}
      className={`group relative mb-2 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md rounded-xl overflow-hidden ${
        isDragOver ? 'shadow-md ring-1 ring-[#7B1FA2]/40 scale-[1.01]' : ''
      }`}
      style={{
        background: vencida ? '#FFF5F5' : '#ffffff',
        border: vencida ? '1px solid #FECACA' : '1px solid #E5E7EB',
        borderLeft: `3px solid ${vencida ? '#EF4444' : (tarea.prioridad?.color || '#D1D5DB')}`,
      }}
    >
      <div className="p-3">
        {/* Título */}
        <p className={`text-sm font-semibold leading-snug mb-2 ${vencida ? 'text-red-800' : 'text-gray-800'}`}>
          {tarea.titulo}
        </p>

        {/* Badge vencida */}
        {vencida && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full w-fit mb-2">
            <ExclamationTriangleIcon className="w-3 h-3" /> VENCIDA
          </div>
        )}

        {/* Fecha límite */}
        {tarea.fecha_limite && (
          <div className={`flex items-center gap-1 text-[11px] mb-2 ${
            vencida ? 'text-red-500 font-semibold'
            : dias !== null && dias <= 2 ? 'text-amber-600 font-medium'
            : 'text-gray-400'
          }`}>
            <CalendarDaysIcon className="w-3 h-3 flex-shrink-0" />
            {new Date(tarea.fecha_limite).toLocaleString('es-PE', { timeZone: 'America/Lima', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            {!vencida && dias !== null && dias <= 3 && (
              <span className="ml-1 font-semibold">({dias === 0 ? 'hoy' : `${dias}d`})</span>
            )}
          </div>
        )}

        {/* Asignados */}
        {tarea.asignaciones?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tarea.asignaciones.slice(0, 2).map(a => (
              <span key={a.id} className="text-[10px] bg-purple-50 text-[#7B1FA2] px-1.5 py-0.5 rounded-full font-medium border border-purple-100">
                {a.usuario ? `${a.usuario.nombres} ${a.usuario.apellidos}`.split(' ').slice(0, 2).join(' ') : `${a.rol?.nombre}`}
              </span>
            ))}
            {tarea.asignaciones.length > 2 && (
              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full font-medium">+{tarea.asignaciones.length - 2}</span>
            )}
          </div>
        )}

        {/* Footer: prioridad + timer + acciones hover */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
              style={{ backgroundColor: tarea.prioridad?.color + '22', color: tarea.prioridad?.color }}>
              {tarea.prioridad?.nombre}
            </span>
            <div className={`flex items-center gap-1 text-[11px] font-medium tabular-nums ${timerActivo ? 'text-green-600' : 'text-gray-400'}`}>
              <ClockIcon className="w-3 h-3" />
              {formatTiempo(tiempo)}
              {timerActivo && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
            </div>
            {tarea.archivos?.length > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                <PaperClipIcon className="w-3 h-3" />{tarea.archivos.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            {puedeTimer && (
              <button onClick={() => onToggleTimer(tarea)}
                className={`p-1.5 rounded-lg transition-colors ${timerActivo ? 'text-amber-500 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                title={timerActivo ? 'Pausar tiempo' : 'Iniciar tiempo'}>
                {timerActivo ? <PauseIcon className="w-3.5 h-3.5" /> : <PlayIcon className="w-3.5 h-3.5" />}
              </button>
            )}
            {puedeEditar && (
              <button onClick={() => onEditar(tarea)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-[#7B1FA2] hover:bg-purple-50 transition-colors">
                <PencilIcon className="w-3.5 h-3.5" />
              </button>
            )}
            {puedeEliminar && (
              <button onClick={() => onEliminar(tarea.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal crear/editar ───────────────────────────────────────────────────────

function TareaModal({ tarea, columnas, prioridades, usuarios, roles, defaultAsignaciones = [], defaultColumnaId = null, onGuardar, onCerrar, showNotif, onRecargar }) {
  const [form, setForm] = useState({
    titulo: tarea?.titulo || '',
    descripcion: tarea?.descripcion || '',
    prioridad_id: tarea?.prioridad_id || 2,
    columna_id: tarea?.columna_id || defaultColumnaId || (columnas[0]?.id ?? 1),
    fecha_limite: toDatetimeLocalLima(tarea?.fecha_limite),
    asignaciones: tarea?.asignaciones?.map(a => ({
      tipo: a.usuario_id ? 'usuario' : 'rol',
      id: a.usuario_id || a.rol_id,
    })) ?? defaultAsignaciones,
  });
  const [guardando, setGuardando] = useState(false);
  const [nuevaAsig, setNuevaAsig] = useState({ tipo: 'usuario', id: '' });
  const [archivosSeleccionados, setArchivosSeleccionados] = useState([]);
  const fileModalRef = useRef(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const agregarAsignacion = () => {
    if (!nuevaAsig.id) return;
    const yaExiste = form.asignaciones.some(a => a.tipo === nuevaAsig.tipo && String(a.id) === String(nuevaAsig.id));
    if (yaExiste) return;
    set('asignaciones', [...form.asignaciones, { tipo: nuevaAsig.tipo, id: Number(nuevaAsig.id) }]);
    setNuevaAsig(p => ({ ...p, id: '' }));
  };

  const nombreAsig = (a) => {
    if (a.tipo === 'usuario') {
      const u = usuarios.find(u => u.id === a.id);
      return u ? u.nombre_completo : `Usuario #${a.id}`;
    }
    return `Rol: ${roles.find(r => r.id === a.id)?.nombre || a.id}`;
  };

  const handleGuardar = async () => {
    if (!form.titulo.trim()) return;
    setGuardando(true);
    try {
      const tareaGuardada = await onGuardar({
        titulo: form.titulo.trim(),
        descripcion: form.descripcion || null,
        prioridad_id: Number(form.prioridad_id),
        columna_id: Number(form.columna_id),
        fecha_limite: form.fecha_limite ? form.fecha_limite + ':00-05:00' : null,
        asignaciones: form.asignaciones.map(a =>
          a.tipo === 'usuario' ? { usuario_id: a.id } : { rol_id: a.id }
        ),
      });
      if (archivosSeleccionados.length > 0 && tareaGuardada?.id) {
        try {
          const res = await subirArchivos(tareaGuardada.id, archivosSeleccionados);
        } catch (e) {
          showNotif(e?.response?.data?.message || 'Error al subir archivos', 'error');
        }
      }
      onRecargar?.();
      onCerrar();
    } catch (e) {
      showNotif(e?.response?.data?.message || 'Error al guardar la tarea', 'error');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCerrar}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header modal */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">{tarea ? 'Editar tarea' : 'Nueva tarea'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{tarea ? 'Modifica los detalles de la tarea' : 'Completa los datos para crear la tarea'}</p>
          </div>
          <button onClick={onCerrar} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors flex-shrink-0">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Título <span className="text-red-500">*</span></label>
            <input value={form.titulo} onChange={e => set('titulo', e.target.value)}
              placeholder="¿Qué hay que hacer?"
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-purple-50 transition-all" />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Descripción</label>
            <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
              rows={2} placeholder="Detalles adicionales (opcional)..."
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#7B1FA2] resize-none transition-all" />
          </div>

          {/* Prioridad + Columna + Fecha */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Prioridad</label>
              <select value={form.prioridad_id} onChange={e => set('prioridad_id', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B1FA2] bg-white">
                {prioridades.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Columna</label>
              <select value={form.columna_id} onChange={e => set('columna_id', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B1FA2] bg-white">
                {columnas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Fecha límite</label>
            <input type="datetime-local" value={form.fecha_limite} onChange={e => set('fecha_limite', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#7B1FA2] transition-all" />
          </div>

          {/* Asignaciones */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Asignar a</label>
            <div className="flex gap-2 mb-2">
              <select value={nuevaAsig.tipo} onChange={e => setNuevaAsig(p => ({ ...p, tipo: e.target.value, id: '' }))}
                className="border border-gray-200 rounded-xl px-2.5 py-2 text-sm outline-none focus:border-[#7B1FA2] bg-white">
                <option value="usuario">Usuario</option>
                <option value="rol">Rol</option>
              </select>
              <select value={nuevaAsig.id} onChange={e => setNuevaAsig(p => ({ ...p, id: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-xl px-2.5 py-2 text-sm outline-none focus:border-[#7B1FA2] bg-white">
                <option value="">Seleccionar...</option>
                {nuevaAsig.tipo === 'usuario'
                  ? usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre_completo}</option>)
                  : roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
              <button onClick={agregarAsignacion}
                className="px-3.5 py-2 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl text-sm font-bold hover:shadow-md transition-all">
                +
              </button>
            </div>
            {form.asignaciones.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.asignaciones.map((a, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs bg-purple-50 text-[#7B1FA2] px-2.5 py-1 rounded-full font-medium border border-purple-100">
                    {nombreAsig(a)}
                    <button onClick={() => set('asignaciones', form.asignaciones.filter((_, j) => j !== i))}
                      className="hover:text-red-500 transition-colors ml-0.5">
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Archivos adjuntos */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Archivos adjuntos</label>
            {tarea?.archivos?.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {tarea.archivos.map(a => (
                  <span key={a.id} className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full border border-gray-200">
                    <PaperClipIcon className="w-2.5 h-2.5 flex-shrink-0" />
                    {a.nombre_original}
                  </span>
                ))}
              </div>
            )}
            <label className="flex items-center gap-2 w-fit px-3.5 py-2 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#7B1FA2] hover:bg-purple-50 transition-all text-sm text-gray-500 hover:text-[#7B1FA2]">
              <PaperClipIcon className="w-4 h-4 flex-shrink-0" />
              {archivosSeleccionados.length > 0 ? `${archivosSeleccionados.length} archivo(s) seleccionado(s)` : 'Adjuntar archivos'}
              <input ref={fileModalRef} type="file" multiple className="hidden"
                onChange={e => setArchivosSeleccionados(Array.from(e.target.files))} />
            </label>
            {archivosSeleccionados.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {archivosSeleccionados.map((f, i) => (
                  <span key={i} className="flex items-center gap-1 text-[10px] bg-purple-50 text-[#7B1FA2] px-2 py-1 rounded-full border border-purple-100">
                    {f.name}
                    <button type="button" onClick={() => setArchivosSeleccionados(p => p.filter((_, j) => j !== i))}
                      className="hover:text-red-500 ml-0.5"><XMarkIcon className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer sticky */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 flex-shrink-0 bg-gray-50 rounded-b-2xl">
          <button onClick={onCerrar} className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-200 rounded-xl transition-colors font-medium">
            Cancelar
          </button>
          <button onClick={handleGuardar} disabled={guardando || !form.titulo.trim()}
            className="px-6 py-2.5 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 shadow-sm">
            {guardando ? 'Guardando...' : tarea ? 'Guardar cambios' : 'Crear tarea'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal detalle + comentarios ──────────────────────────────────────────────

function DetalleModal({ tarea, onCerrar, puedeCommentar, puedeEliminarArchivo, puedeEditar, puedeEliminarTarea, onEditar, onEliminar, showNotif, currentUserId, esAdmin }) {
  const [comentarios, setComentarios] = useState([]);
  const [nuevo, setNuevo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [archivos, setArchivos] = useState([]);
  const [archivosPendientes, setArchivosPendientes] = useState([]);
  const [preview, setPreview] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [confirmEliminarArchivo, setConfirmEliminarArchivo] = useState(null);
  const fileInputRef = useRef(null);
  const miTimer = tarea.mi_timer ?? null;
  const timerActivo = miTimer?.timer_activo ?? false;
  const tiempo = useTiempoVivo(miTimer);

  useEffect(() => {
    setCargando(true);
    Promise.all([
      listarComentarios(tarea.id).catch(() => []),
      listarArchivos(tarea.id).then(data => Array.isArray(data) ? data : []).catch(() => []),
    ]).then(([cms, archs]) => {
      setComentarios(cms);
      setArchivos(archs);
      setCargando(false);
    });
  }, [tarea.id]);

  const handleEliminarComentario = async (comentarioId) => {
    try {
      await eliminarComentario(comentarioId);
      setComentarios(p => p.filter(c => c.id !== comentarioId));
    } catch (e) {
      if (showNotif) showNotif(e?.response?.data?.message || 'Error al eliminar', 'error');
    }
  };

  const handleEliminarArchivo = async (archivoId) => {
    try {
      await eliminarArchivo(tarea.id, archivoId);
      setArchivos(p => p.filter(a => a.id !== archivoId));
    } catch {}
  };

  const enviar = async () => {
    if (!nuevo.trim() && archivosPendientes.length === 0) return;
    setEnviando(true);
    try {
      const c = await agregarComentario(tarea.id, nuevo.trim() || ' ', archivosPendientes);
      setComentarios(p => [...p, c]);
      setNuevo('');
      setArchivosPendientes([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      const msg = e?.response?.data?.message || 'Error al enviar el comentario';
      if (showNotif) showNotif(msg, 'error');
      else alert(msg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCerrar}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex-shrink-0"
          style={{ borderLeft: `4px solid ${tarea.prioridad?.color || '#7B1FA2'}` }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-gray-900 leading-snug mb-2">{tarea.titulo}</h2>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: tarea.prioridad?.color + '22', color: tarea.prioridad?.color }}>
                  {tarea.prioridad?.nombre}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ backgroundColor: tarea.columna?.color + '22', color: tarea.columna?.color }}>
                  {tarea.columna?.nombre}
                </span>
                {estaVencida(tarea) && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                    <ExclamationTriangleIcon className="w-3 h-3" /> VENCIDA
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {puedeEditar && (
                <button onClick={() => { onCerrar(); onEditar(tarea); }}
                  className="p-2 rounded-xl hover:bg-purple-50 text-gray-400 hover:text-[#7B1FA2] transition-colors"
                  title="Editar tarea">
                  <PencilIcon className="w-4 h-4" />
                </button>
              )}
              {puedeEliminarTarea && (
                <button onClick={() => { onCerrar(); onEliminar(tarea.id); }}
                  className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                  title="Eliminar tarea">
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
              <button onClick={onCerrar} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 flex-shrink-0 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-3 pb-5 space-y-3">
          {tarea.descripcion && (
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3">{tarea.descripcion}</p>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {tarea.fecha_limite && (
              <div className={`flex items-center gap-2 p-3 rounded-xl border ${estaVencida(tarea) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                <CalendarDaysIcon className="w-4 h-4 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5">Fecha límite</p>
                  <p className="text-xs font-medium">
                    {new Date(tarea.fecha_limite).toLocaleString('es-PE', { timeZone: 'America/Lima', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )}
            <div className={`flex items-center gap-2 p-3 rounded-xl border ${timerActivo ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
              <ClockIcon className="w-4 h-4 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5">Mi tiempo</p>
                <p className="text-xs font-bold">{formatTiempo(tiempo)}</p>
              </div>
              {timerActivo && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto" />}
            </div>
          </div>

          {/* Asignados */}
          {tarea.asignaciones?.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-2">Asignado a</p>
              <div className="flex flex-wrap gap-1.5">
                {tarea.asignaciones.map(a => (
                  <span key={a.id} className="text-xs bg-white text-[#7B1FA2] px-2.5 py-1 rounded-full font-medium border border-purple-200">
                    {a.usuario ? `${a.usuario.nombres} ${a.usuario.apellidos}` : `Rol: ${a.rol?.nombre}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Creado por */}
          {tarea.user_crea && (
            <p className="text-[11px] text-gray-400">
              Creado por <span className="font-semibold text-gray-600">{tarea.user_crea.nombres} {tarea.user_crea.apellidos}</span>
              {' · '}{new Date(tarea.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          )}

          {/* Archivos de la tarea */}
          {cargando ? (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="space-y-1.5">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-gray-100 rounded-xl animate-pulse">
                    <div className="w-7 h-7 rounded-lg bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-2 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : archivos.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                <PaperClipIcon className="w-4 h-4 text-[#7B1FA2]" />
                Adjuntos
                <span className="bg-purple-50 text-[#7B1FA2] px-1.5 py-0.5 rounded-full text-[10px] font-bold">{archivos.length}</span>
              </p>
              <div className="space-y-1.5">
                {archivos.map(a => {
                  const url = `${SERVER_BASE_URL}${a.url}`;
                  const esImg = esArchivoImagen(a);
                  const esPdf = esArchivoPDF(a);
                  return (
                    <div key={a.id} className="flex flex-col bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                      <div className="flex items-center gap-2.5 px-3 py-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[9px] font-bold ${fileColor(a.tipo_mime)}`}>
                          {fileLabel(a.tipo_mime)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700 truncate">{a.nombre_original}</p>
                          {a.tamanio && <p className="text-[10px] text-gray-400">{formatFileSize(a.tamanio)}</p>}
                        </div>
                        {(esImg || esPdf) && (
                          <button onClick={() => setPreview(a)} className="p-1 rounded-lg text-gray-400 hover:text-[#7B1FA2] hover:bg-purple-50 transition-colors flex-shrink-0 text-[10px] font-semibold">Ver</button>
                        )}
                        <button onClick={() => descargarArchivo(url, a.nombre_original)} className="p-1 rounded-lg text-gray-400 hover:text-[#7B1FA2] hover:bg-purple-50 transition-colors flex-shrink-0" title="Descargar">
                          <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                        </button>
                        {puedeEliminarArchivo && (
                          <button onClick={() => setConfirmEliminarArchivo(a.id)} className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {esImg && (
                        <button onClick={() => setPreview(a)} className="block w-full text-left">
                          <img src={url} alt={a.nombre_original}
                            className="w-full max-h-40 object-cover border-t border-gray-100 hover:opacity-90 transition-opacity"
                            onError={e => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextSibling?.classList.remove('hidden');
                            }} />
                          <div className="hidden border-t border-gray-100 px-3 py-2 text-[11px] text-gray-400 flex items-center gap-1.5">
                            <ExclamationTriangleIcon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            No se pudo cargar la imagen
                          </div>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comentarios */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2.5 flex items-center gap-1.5">
              <ChatBubbleLeftIcon className="w-4 h-4 text-[#7B1FA2]" />
              Comentarios
              {!cargando && <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full text-[10px] font-bold">{comentarios.length}</span>}
            </p>

            <div className="space-y-2 mb-3">
              {cargando ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100 animate-pulse">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-2.5 bg-gray-200 rounded w-1/3" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 bg-gray-200 rounded w-full" />
                      <div className="h-2 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {comentarios.length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-3">Sin comentarios aún.</p>
                  )}
                  {comentarios.map(c => (
                <div key={c.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] font-semibold text-[#7B1FA2]">
                      {c.user_crea?.nombres} {c.user_crea?.apellidos}
                      <span className="font-normal text-gray-400 ml-1.5">
                        {new Date(c.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </p>
                    {(esAdmin || c.user_crea_id === currentUserId) && (
                      <button onClick={() => handleEliminarComentario(c.id)}
                        className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {c.contenido?.trim() && (
                    <p className="text-xs text-gray-700 leading-relaxed mb-2">{c.contenido}</p>
                  )}
                  {c.archivos?.length > 0 && (
                    <div className="space-y-1 mt-1">
                      {c.archivos.map(a => {
                        const url = `${SERVER_BASE_URL}${a.url}`;
                        const esImg = esArchivoImagen(a);
                        const esPdf = esArchivoPDF(a);
                        return (
                          <div key={a.id} className="rounded-lg overflow-hidden border border-gray-200">
                            {esImg && (
                              <button onClick={() => setPreview(a)} className="block w-full">
                                <img src={url} alt={a.nombre_original}
                                  className="w-full max-h-48 object-cover hover:opacity-90 transition-opacity"
                                  onError={e => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextSibling?.classList.remove('hidden');
                                  }} />
                                <div className="hidden px-3 py-2 text-[11px] text-gray-400 flex items-center gap-1.5 bg-gray-50">
                                  <ExclamationTriangleIcon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                  No se pudo cargar la imagen
                                </div>
                              </button>
                            )}
                            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white">
                              <div className={`w-5 h-5 rounded flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0 ${fileColor(a.tipo_mime)}`}>
                                {fileLabel(a.tipo_mime)}
                              </div>
                              <span className="text-[11px] text-gray-600 truncate flex-1">{a.nombre_original}</span>
                              {(esPdf || esImg) && (
                                <button onClick={() => setPreview(a)} className="text-[10px] font-semibold text-[#7B1FA2] hover:underline flex-shrink-0">Ver</button>
                              )}
                              <button onClick={() => descargarArchivo(url, a.nombre_original)} className="flex-shrink-0 text-gray-400 hover:text-[#7B1FA2]">
                                <ArrowDownTrayIcon className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
                </>
              )}
            </div>

            {/* Input comentario + adjuntar */}
            {puedeCommentar && (
              <div className="space-y-2">
                {/* Archivos pendientes de envío */}
                {archivosPendientes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {archivosPendientes.map((f, i) => (
                      <span key={i} className="flex items-center gap-1 text-[10px] bg-purple-50 text-[#7B1FA2] px-2 py-1 rounded-full border border-purple-100">
                        <PaperClipIcon className="w-2.5 h-2.5" />
                        {f.name}
                        <button type="button" onClick={() => setArchivosPendientes(p => p.filter((_, j) => j !== i))}
                          className="hover:text-red-500 ml-0.5"><XMarkIcon className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={e => {
                    const nuevos = Array.from(e.target.files);
                    e.target.value = '';
                    setArchivosPendientes(p => [...p, ...nuevos]);
                  }}
                />
                <div className="flex gap-2 items-center">
                  <input value={nuevo} onChange={e => setNuevo(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviar()}
                    placeholder="Comentario o adjunta un archivo..."
                    className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-purple-50 transition-all" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl border border-gray-200 hover:border-[#7B1FA2] hover:text-[#7B1FA2] hover:bg-purple-50 text-gray-400 transition-colors flex-shrink-0 relative"
                    title="Adjuntar archivos"
                  >
                    <PaperClipIcon className="w-4 h-4" />
                    {archivosPendientes.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#7B1FA2] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                        {archivosPendientes.length}
                      </span>
                    )}
                  </button>
                  <button onClick={enviar} disabled={enviando || (!nuevo.trim() && archivosPendientes.length === 0)}
                    className="p-2 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl hover:shadow-md disabled:opacity-50 transition-all flex-shrink-0">
                    <CheckIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>

    {/* Preview overlay — fuera del overflow para cubrir toda la pantalla */}
    {preview && (
      <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-2" onClick={() => setPreview(null)}>
        <div className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ height: '92vh' }} onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
            <p className="text-sm font-semibold text-gray-700 truncate">{preview.nombre_original}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => descargarArchivo(`${SERVER_BASE_URL}${preview.url}`, preview.nombre_original)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
                <ArrowDownTrayIcon className="w-3.5 h-3.5" /> Descargar
              </button>
              <button onClick={() => setPreview(null)} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50">
            {(esArchivoImagen(preview) || esArchivoPDF(preview)) ? (
              <PreviewContenido
                url={`${SERVER_BASE_URL}${preview.url}`}
                esImagen={esArchivoImagen(preview)}
                esPdf={esArchivoPDF(preview)}
              />
            ) : (
              <div className="text-center text-gray-400 p-8">
                <p className="text-sm font-medium">Vista previa no disponible</p>
                <p className="text-xs mt-1">Usa el botón Descargar para abrir el archivo</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Confirm eliminar archivo */}
    {confirmEliminarArchivo && (
      <ConfirmModal
        mensaje="¿Eliminar este archivo adjunto?"
        onConfirmar={() => { handleEliminarArchivo(confirmEliminarArchivo); setConfirmEliminarArchivo(null); }}
        onCancelar={() => setConfirmEliminarArchivo(null)}
      />
    )}
    </>
  );
}

// ─── Modal reporte mensual ─────────────────────────────────────────────────────

function ReporteModal({ onCerrar }) {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    setCargando(true);
    obtenerReporteMensual(mes, anio).then(setReporte).finally(() => setCargando(false));
  }, [mes, anio]);

  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCerrar}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Reporte Mensual</h2>
          </div>
          <button onClick={onCerrar} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          <div className="flex gap-3 mb-5">
            <select value={mes} onChange={e => setMes(Number(e.target.value))}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#7B1FA2] bg-white">
              {meses.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <select value={anio} onChange={e => setAnio(Number(e.target.value))}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#7B1FA2] bg-white">
              {[2024, 2025, 2026, 2027].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {cargando && (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Cargando reporte...</p>
            </div>
          )}

          {reporte && !cargando && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Total', value: reporte.resumen.total, cls: 'bg-purple-50 text-[#7B1FA2] border-purple-100' },
                  { label: 'Completadas', value: reporte.resumen.completadas, cls: 'bg-green-50 text-green-700 border-green-100' },
                  { label: 'Vencidas', value: reporte.resumen.vencidas, cls: 'bg-red-50 text-red-700 border-red-100' },
                  { label: 'Tiempo total', value: `${reporte.resumen.tiempo_total_horas}h`, cls: 'bg-blue-50 text-blue-700 border-blue-100' },
                ].map(s => (
                  <div key={s.label} className={`rounded-xl p-4 text-center border ${s.cls}`}>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs font-semibold mt-0.5 opacity-75">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-500">Tarea</th>
                      <th className="text-left px-3 py-3 font-semibold text-gray-500">Estado</th>
                      <th className="text-left px-3 py-3 font-semibold text-gray-500">Prioridad</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-500">Tiempo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.tareas.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-8 text-gray-400">Sin tareas en este período</td></tr>
                    )}
                    {reporte.tareas.map(t => (
                      <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-700 max-w-[180px] truncate">{t.titulo}</td>
                        <td className="px-3 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ backgroundColor: t.columna?.color + '22', color: t.columna?.color }}>
                            {t.columna?.nombre}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-semibold" style={{ color: t.prioridad?.color }}>{t.prioridad?.nombre}</td>
                        <td className="px-4 py-3 text-right text-gray-500">{formatTiempo(t.tiempo_acumulado || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Modal gestión de columnas ────────────────────────────────────────────────

function ColumnasModal({ columnas, onCerrar, onActualizar, showNotif }) {
  const [form, setForm] = useState({ nombre: '', color: '#8b5cf6', es_final: false });
  const [guardando, setGuardando] = useState(false);
  const [listaLocal, setListaLocal] = useState(columnas);
  const [dragOver, setDragOver] = useState(null);
  const dragSrcRef = useRef(null);

  useEffect(() => { setListaLocal(columnas); }, [columnas]);

  const handleCrear = async () => {
    if (!form.nombre.trim()) return;
    setGuardando(true);
    try {
      await crearColumna({ nombre: form.nombre.trim(), color: form.color, es_final: form.es_final });
      setForm({ nombre: '', color: '#8b5cf6', es_final: false });
      showNotif('Columna creada');
      onActualizar();
    } catch {
      showNotif('Error al crear la columna', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (col) => {
    if (!window.confirm(`¿Eliminar la columna "${col.nombre}"? Solo se puede eliminar si no tiene tareas.`)) return;
    try {
      await eliminarColumna(col.id);
      showNotif('Columna eliminada');
      onActualizar();
    } catch (e) {
      showNotif(e?.response?.data?.message || 'No se puede eliminar, tiene tareas asignadas', 'error');
    }
  };

  const handleDragStart = (col) => { dragSrcRef.current = col.id; };

  const handleDragOver = (e, col) => {
    e.preventDefault();
    if (dragSrcRef.current === col.id) return;
    setDragOver(col.id);
  };

  const handleDrop = async (e, targetCol) => {
    e.preventDefault();
    setDragOver(null);
    const srcId = dragSrcRef.current;
    dragSrcRef.current = null;
    if (!srcId || srcId === targetCol.id) return;
    const reordenado = [...listaLocal];
    const fromIdx = reordenado.findIndex(c => c.id === srcId);
    const toIdx = reordenado.findIndex(c => c.id === targetCol.id);
    if (fromIdx === -1 || toIdx === -1) return;
    const [col] = reordenado.splice(fromIdx, 1);
    reordenado.splice(toIdx, 0, col);
    setListaLocal(reordenado);
    try {
      await reordenarColumnas(reordenado.map(c => c.id));
      showNotif('Orden guardado');
      onActualizar();
    } catch {
      showNotif('Error al guardar el orden', 'error');
      setListaLocal(columnas);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCerrar}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Gestionar columnas</h2>
            <p className="text-xs text-gray-400 mt-0.5">Arrastra para reordenar · {listaLocal.length} columna{listaLocal.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onCerrar} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Lista de columnas con drag-to-reorder */}
          <div className="px-5 pt-4 pb-2 space-y-1.5">
            {listaLocal.map(col => (
              <div
                key={col.id}
                draggable
                onDragStart={() => handleDragStart(col)}
                onDragOver={(e) => handleDragOver(e, col)}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDrop(e, col)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border-l-[3px] transition-all cursor-grab active:cursor-grabbing ${
                  dragOver === col.id
                    ? 'bg-purple-50 shadow-sm ring-1 ring-[#7B1FA2]/20'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                style={{ borderLeftColor: col.color }}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <Bars3Icon className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-700 truncate">{col.nombre}</span>
                  {col.es_final && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">Final</span>
                  )}
                </div>
                <button onClick={() => handleEliminar(col)}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 ml-2">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Crear nueva columna */}
          <div className="mx-5 mb-5 mt-3 border border-gray-200 rounded-2xl p-4 space-y-3 bg-gray-50">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nueva columna</p>
            <input
              value={form.nombre}
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre de la columna"
              onKeyDown={e => e.key === 'Enter' && handleCrear()}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-purple-50 transition-all bg-white"
            />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <label className="text-xs font-semibold text-gray-600">Color</label>
                <div className="relative">
                  <input
                    type="color"
                    value={form.color}
                    onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                    className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
                  />
                </div>
                <div className="w-5 h-5 rounded-md border border-gray-200" style={{ backgroundColor: form.color }} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.es_final}
                  onChange={e => setForm(p => ({ ...p, es_final: e.target.checked }))}
                  className="w-4 h-4 accent-[#7B1FA2] rounded"
                />
                <span className="text-xs font-semibold text-gray-600">Es columna final</span>
              </label>
            </div>
            <button
              onClick={handleCrear}
              disabled={guardando || !form.nombre.trim()}
              className="w-full py-2.5 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl text-sm font-semibold hover:shadow-md disabled:opacity-50 transition-all">
              {guardando ? 'Creando...' : '+ Crear columna'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Vista por persona (tipo agenda) ─────────────────────────────────────────

function VistaPorPersonas({ tareas, columnas, usuarios, roles, onEditar, onEliminar, onToggleTimer, onVerDetalle, admin, currentUser, esAsignadoATarea, esCreadorDeTarea, personaVista, onPersonaChange }) {
  const opciones = [
    ...usuarios.map(u => ({
      key: `u_${u.id}`, tipo: 'usuario', id: u.id,
      nombre: u.nombre_completo,
    })),
    ...roles.map(r => ({
      key: `r_${r.id}`, tipo: 'rol', id: r.id,
      nombre: `Rol: ${r.nombre}`,
    })),
  ];

  const persona = opciones.find(p => p.key === personaVista) ?? null;

  const tareasPersona = persona
    ? tareas.filter(t => t.asignaciones?.some(a =>
        persona.tipo === 'usuario' ? a.usuario_id === persona.id : a.rol_id === persona.id
      ))
    : [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {!persona ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-1">
            <UserGroupIcon className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-gray-400 text-sm font-medium">Selecciona un trabajador</p>
          <p className="text-gray-300 text-xs">para ver sus tareas asignadas</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-1.5 px-4 py-3 h-full" style={{ minWidth: `${columnas.length * 222 + 32}px` }}>
            {columnas.map(col => {
              const tareasCol = tareasPersona.filter(t => t.columna_id === col.id);
              return (
                <div key={col.id} className="flex-shrink-0 w-[210px] flex flex-col">
                  <div className="flex items-center gap-2 mb-2 px-2 py-2 rounded-xl bg-white border border-transparent"
                    style={{ borderTop: `3px solid ${col.color}` }}>
                    <span className="text-sm font-bold text-gray-700 truncate">{col.nombre}</span>
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                      style={{ backgroundColor: col.color + '22', color: col.color }}>
                      {tareasCol.length}
                    </span>
                  </div>
                  <div className="flex-1 rounded-2xl p-2 border-2 border-dashed overflow-y-auto"
                    style={{ backgroundColor: col.color + '08', borderColor: col.color + '30' }}>
                    {tareasCol.length === 0 ? (
                      <div className="h-full flex items-center justify-center py-10">
                        <p className="text-xs text-gray-300 font-medium">Sin tareas</p>
                      </div>
                    ) : (
                      tareasCol.map(t => (
                        <TareaCard key={t.id} tarea={t}
                          onEditar={onEditar}
                          onEliminar={onEliminar}
                          onToggleTimer={onToggleTimer}
                          onVerDetalle={onVerDetalle}
                          onDragStart={() => {}}
                          onDragEnd={() => {}}
                          isDragOver={false}
                          puedeTimer={esAsignadoATarea(t)}
                          puedeEditar={admin || esCreadorDeTarea(t)}
                          puedeEliminar={admin} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function CentroOperativo() {
  const navigate = useNavigate();
  const [tareas, setTareas] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalCrear, setModalCrear] = useState(false);
  const [tareaEditar, setTareaEditar] = useState(null);
  const [tareaDetalle, setTareaDetalle] = useState(null);
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [mostrarColumnas, setMostrarColumnas] = useState(false);
  const [confirmEliminarTarea, setConfirmEliminarTarea] = useState(null);
  const [notif, setNotif] = useState({ show: false, message: '', type: 'success' });
  const [isDragging, setIsDragging] = useState(false);
  const [colDragOver, setColDragOver] = useState(null);
  const draggedTareaRef = useRef(null);
  const dragOverTareaRef = useRef(null);
  const [dragOverTareaId, setDragOverTareaId] = useState(null);
  const colDragRef = useRef(null);
  const [vista, setVista] = useState('kanban');
  const [personaVista, setPersonaVista] = useState('');
  const [asignadoDefault, setAsignadoDefault] = useState(null);
  const [columnaCrearDefault, setColumnaCrearDefault] = useState(null);
  const [menuAdmin, setMenuAdmin] = useState(false);
  const menuAdminRef = useRef(null);
  const [menuPersonas, setMenuPersonas] = useState(false);
  const menuPersonasRef = useRef(null);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarBuscar, setMostrarBuscar] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [fechaCustom, setFechaCustom] = useState('');
  const [comentariosTodos, setComentariosTodos] = useState({});
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const [archivosTodos, setArchivosTodos] = useState({});
  const buscarRef = useRef(null);

  useEffect(() => {
    if (!menuAdmin) return;
    const close = (e) => { if (menuAdminRef.current && !menuAdminRef.current.contains(e.target)) setMenuAdmin(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuAdmin]);

  useEffect(() => {
    if (!menuPersonas) return;
    const close = (e) => { if (menuPersonasRef.current && !menuPersonasRef.current.contains(e.target)) setMenuPersonas(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuPersonas]);

  const roles = [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Admisión' },
    { id: 3, nombre: 'Recursos Humanos' },
    { id: 4, nombre: 'Terapeuta' },
  ];

  const currentUser = getUser();
  // eslint-disable-next-line eqeqeq
  const admin = currentUser?.rol?.id == ROLES.ADMINISTRADOR;

  const esCreadorDeTarea = (t) => {
    const myId = currentUser?.id;
    if (myId == null) return false;
    // eslint-disable-next-line eqeqeq
    return t.user_crea?.id == myId || t.user_crea_id == myId;
  };

  const esAsignadoATarea = (tarea) =>
    tarea.asignaciones?.some(a =>
      // eslint-disable-next-line eqeqeq
      a.usuario_id == currentUser?.id ||
      // eslint-disable-next-line eqeqeq
      a.rol_id == currentUser?.rol?.id
    );

  const showNotif = (message, type = 'success') => {
    setNotif({ show: true, message, type });
    setTimeout(() => setNotif({ show: false, message: '', type: 'success' }), 3000);
  };

  const ordenarTareas = (lista) => [...lista].sort((a, b) => {
    const av = estaVencida(a) ? 0 : 1;
    const bv = estaVencida(b) ? 0 : 1;
    if (av !== bv) return av - bv;
    return (a.orden ?? 0) - (b.orden ?? 0);
  });

  const cargar = useCallback(async () => {
    try {
      const [t, c, p] = await Promise.all([listarTareas(), obtenerColumnas(), obtenerPrioridades()]);
      setColumnas(c);
      setPrioridades(p);
      setTareas(ordenarTareas(t));
    } catch {
      showNotif('Error al cargar las tareas', 'error');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    api.get('/trabajadores/select').then(r => setUsuarios(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!mostrarBuscar || tareas.length === 0) return;
    setCargandoBusqueda(true);
    const toArr = (d) => Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []);
    const cmsCalls = tareas.map(t =>
      listarComentarios(t.id).then(d => ({ tipo: 'cms', id: t.id, data: toArr(d) })).catch(() => ({ tipo: 'cms', id: t.id, data: [] }))
    );
    const archCalls = tareas.map(t =>
      listarArchivos(t.id).then(d => ({ tipo: 'archs', id: t.id, data: toArr(d) })).catch(() => ({ tipo: 'archs', id: t.id, data: [] }))
    );
    Promise.allSettled([...cmsCalls, ...archCalls]).then(results => {
      const mapaCms = {}, mapaArchs = {};
      results.forEach(r => {
        if (r.status === 'fulfilled') {
          if (r.value.tipo === 'cms') mapaCms[r.value.id] = r.value.data;
          else mapaArchs[r.value.id] = r.value.data;
        }
      });
      setComentariosTodos(mapaCms);
      setArchivosTodos(mapaArchs);
      setCargandoBusqueda(false);
    });
  }, [mostrarBuscar, tareas]);

  const pasaFecha = (t) => {
    if (!filtroFecha) return true;
    const fl = t.fecha_limite ? new Date(t.fecha_limite) : null;
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    if (filtroFecha === 'hoy') return fl && fl >= hoy && fl < new Date(hoy.getTime() + 86400000);
    if (filtroFecha === 'semana') { const fin = new Date(hoy); fin.setDate(hoy.getDate() + 7); return fl && fl >= hoy && fl <= fin; }
    if (filtroFecha === 'vencidas') return fl && fl < new Date();
    if (filtroFecha === 'custom' && fechaCustom) { const c = new Date(fechaCustom); c.setHours(0, 0, 0, 0); return fl && fl >= c && fl < new Date(c.getTime() + 86400000); }
    return true;
  };
  const tareasFiltered = tareas.filter(pasaFecha);

  const q = busqueda.trim().toLowerCase();
  const sugerencias = q.length < 2 ? [] : (() => {
    const results = [];
    for (const t of tareas) {
      const cms = Array.isArray(comentariosTodos[t.id]) ? comentariosTodos[t.id] : [];
      const archs = Array.isArray(archivosTodos[t.id]) ? archivosTodos[t.id] : [];

      if (t.titulo?.toLowerCase().includes(q)) {
        results.push({ tarea: t, tipo: 'tarea', contexto: null });
      } else {
        // Buscar en texto de comentarios
        const cm = cms.find(c => c.contenido?.toLowerCase().includes(q));
        // Buscar en archivos de la tarea
        const ar = archs.find(a => (a.nombre_original || '').toLowerCase().includes(q));
        // Buscar en archivos adjuntos de comentarios
        let arCm = null;
        if (!ar) {
          for (const c of cms) {
            const found = (c.archivos || []).find(a => (a.nombre_original || '').toLowerCase().includes(q));
            if (found) { arCm = { archivo: found, comentario: c }; break; }
          }
        }

        if (cm) results.push({ tarea: t, tipo: 'comentario', contexto: cm.contenido });
        else if (ar) results.push({ tarea: t, tipo: 'archivo', contexto: ar.nombre_original });
        else if (arCm) results.push({ tarea: t, tipo: 'archivo', contexto: arCm.archivo.nombre_original });
      }
      if (results.length >= 8) break;
    }
    return results;
  })();

  const tareasPorColumna = (colId) => tareasFiltered.filter(t => t.columna_id === colId);

  const handleNuevaTareaPersona = (persona) => {
    setAsignadoDefault(persona);
    setModalCrear(true);
  };

  const handleCrear = async (payload) => {
    const tarea = await crearTarea(payload);
    showNotif('Tarea creada correctamente');
    return tarea;
  };

  const handleEditar = async (payload) => {
    const tarea = await actualizarTarea(tareaEditar.id, payload);
    showNotif('Tarea actualizada');
    return tarea;
  };

  const handleEliminar = (id) => {
    setConfirmEliminarTarea(id);
  };

  const ejecutarEliminarTarea = async (id) => {
    try {
      await eliminarTarea(id);
      showNotif('Tarea eliminada');
      cargar();
    } catch {
      showNotif('Error al eliminar', 'error');
    }
  };

  const handleMoverColumna = async (tarea, colId) => {
    if (tarea.columna_id === colId) return;
    try {
      await moverColumna(tarea.id, colId);
      const nuevaColumna = columnas.find(c => c.id === colId);
      if (tareaDetalle?.id === tarea.id) {
        setTareaDetalle(prev => ({ ...prev, columna_id: colId, columna: nuevaColumna }));
      }
      cargar();
    } catch {
      showNotif('Error al mover la tarea', 'error');
    }
  };

  const handleDropColumna = async (srcId, targetId) => {
    if (srcId === targetId) return;
    const reordenado = [...columnas];
    const fromIdx = reordenado.findIndex(c => c.id === srcId);
    const toIdx = reordenado.findIndex(c => c.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [col] = reordenado.splice(fromIdx, 1);
    reordenado.splice(toIdx, 0, col);
    setColumnas(reordenado);
    try { await reordenarColumnas(reordenado.map(c => c.id)); } catch { cargar(); }
  };

  const handleDropTarea = async (e, colId) => {
    const tarea = draggedTareaRef.current;
    const targetTarea = dragOverTareaRef.current;
    draggedTareaRef.current = null;
    dragOverTareaRef.current = null;
    setDragOverTareaId(null);
    setIsDragging(false);
    if (!tarea) return;

    if (tarea.columna_id === colId) {
      // Reordenar dentro de la misma columna
      if (!targetTarea || targetTarea.id === tarea.id) return;
      const enColumna = tareas
        .filter(t => t.columna_id === colId)
        .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
      const fromIdx = enColumna.findIndex(t => t.id === tarea.id);
      const toIdx = enColumna.findIndex(t => t.id === targetTarea.id);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
      const reordenadas = [...enColumna];
      const [item] = reordenadas.splice(fromIdx, 1);
      reordenadas.splice(toIdx, 0, item);
      // Actualización optimista
      setTareas(prev => {
        const nuevas = prev.map(t => {
          const idx = reordenadas.findIndex(r => r.id === t.id);
          return idx !== -1 ? { ...t, orden: idx } : t;
        });
        return ordenarTareas(nuevas);
      });
      try {
        await reordenarTareas(reordenadas.map(t => t.id));
      } catch {
        cargar();
      }
    } else {
      await handleMoverColumna(tarea, colId);
    }
  };

  const handleToggleTimer = async (tarea) => {
    try {
      if (tarea.mi_timer?.timer_activo) await pausarTimer(tarea.id);
      else await iniciarTimer(tarea.id);
      cargar();
    } catch {
      showNotif('Error con el cronómetro', 'error');
    }
  };

  const vencidas = tareas.filter(estaVencida).length;
  const completadas = tareas.filter(t => t.columna?.es_final && t.columna?.nombre === 'Completado').length;
  const enCurso = tareas.filter(t => !t.columna?.es_final).length;

  const statChips = [
    { label: tareas.length, sub: 'Total', color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
    { label: enCurso, sub: 'En curso', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
    { label: completadas, sub: 'Listas', color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
    ...(vencidas > 0 ? [{ label: vencidas, sub: 'Vencidas', color: '#B91C1C', bg: '#FFF5F5', border: '#FECACA' }] : []),
  ];

  return (
    <div className="flex flex-col bg-gray-50 h-screen lg:h-[calc(100vh-56px)]">
      <Notificacion notif={notif} />

      {/* Encabezado — integrado al tablero, sin barra separada */}
      <div className="flex-shrink-0 px-4 lg:px-6 pt-16 lg:pt-5 pb-4 flex items-start justify-between gap-4">
        {/* Título + stats inline */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            <BuildingOfficeIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Centro Operativo</h1>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-xs text-gray-400 font-medium">{tareas.length} tareas</span>
              {enCurso > 0 && <><span className="text-gray-300 text-xs">·</span><span className="text-xs text-blue-600 font-medium">{enCurso} en curso</span></>}
              {completadas > 0 && <><span className="text-gray-300 text-xs">·</span><span className="text-xs text-green-600 font-medium">{completadas} listas</span></>}
              {vencidas > 0 && <><span className="text-gray-300 text-xs">·</span><span className="text-xs text-red-500 font-semibold">{vencidas} vencidas ⚠</span></>}
            </div>
          </div>
        </div>

        {/* Acciones — reducidas a 3 elementos */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {admin && (
            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-0.5 shadow-sm">
              <button onClick={() => { setVista('kanban'); setPersonaVista(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${vista === 'kanban' ? 'bg-[#7B1FA2] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                Tablero
              </button>
              <div className="relative" ref={menuPersonasRef}>
                <button
                  onClick={() => { setVista('personas'); setMenuPersonas(m => !m); }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${vista === 'personas' ? 'bg-[#7B1FA2] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  <UserGroupIcon className="w-3.5 h-3.5" />
                  {vista === 'personas' && personaVista
                    ? usuarios.find(u => `u_${u.id}` === personaVista)?.nombre_completo?.split(' ')[0]
                      ?? roles.find(r => `r_${r.id}` === personaVista)?.nombre
                      ?? 'Personas'
                    : 'Personas'}
                </button>
                {menuPersonas && vista === 'personas' && (
                  <div className="absolute left-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20 w-52 max-h-72 flex flex-col">
                    {personaVista && (
                      <>
                        <button onClick={() => { setPersonaVista(''); setMenuPersonas(false); }}
                          className="flex-shrink-0 w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                          <UserGroupIcon className="w-4 h-4 flex-shrink-0" />
                          <span>Ver todos</span>
                        </button>
                        <div className="border-t border-gray-100 flex-shrink-0" />
                      </>
                    )}
                    <div className="overflow-y-auto flex-1">
                      <p className="px-3.5 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Trabajadores</p>
                      {usuarios.map(u => (
                        <button key={`u_${u.id}`}
                          onClick={() => { setPersonaVista(`u_${u.id}`); setMenuPersonas(false); }}
                          className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors ${personaVista === `u_${u.id}` ? 'text-[#7B1FA2] bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                            {u.nombre_completo?.[0]?.toUpperCase()}
                          </span>
                          <span className="truncate text-left">{u.nombre_completo}</span>
                        </button>
                      ))}
                      <div className="border-t border-gray-100 my-1" />
                      <p className="px-3.5 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Por rol</p>
                      {roles.map(r => (
                        <button key={`r_${r.id}`}
                          onClick={() => { setPersonaVista(`r_${r.id}`); setMenuPersonas(false); }}
                          className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors ${personaVista === `r_${r.id}` ? 'text-[#7B1FA2] bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                            {r.nombre[0]}
                          </span>
                          <span className="truncate text-left">{r.nombre}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Búsqueda rápida */}
          <button onClick={() => { setMostrarBuscar(m => !m); setBusqueda(''); setFiltroFecha(''); setFechaCustom(''); }}
            className={`w-8 h-8 flex items-center justify-center rounded-xl border shadow-sm transition-colors ${mostrarBuscar ? 'bg-purple-50 border-[#7B1FA2] text-[#7B1FA2]' : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            title="Buscar tarea o archivo">
            <MagnifyingGlassIcon className="w-4 h-4" />
          </button>

          {/* Menú de opciones secundarias */}
          {admin && (
            <div className="relative" ref={menuAdminRef}>
              <button
                onClick={() => setMenuAdmin(m => !m)}
                className={`w-8 h-8 flex items-center justify-center rounded-xl border shadow-sm transition-colors ${menuAdmin ? 'bg-gray-100 border-gray-300 text-gray-700' : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                <EllipsisHorizontalIcon className="w-4.5 h-4.5" />
              </button>
              {menuAdmin && (
                <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 w-44 z-20">
                  <button onClick={() => { navigate('/intranet/centro-operativo/reporte'); setMenuAdmin(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <ChartBarIcon className="w-4 h-4 text-gray-400" /> Reporte de actividades
                  </button>
                  <button onClick={() => { setMostrarColumnas(true); setMenuAdmin(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <Bars3Icon className="w-4 h-4 text-gray-400" /> Gestionar columnas
                  </button>
                </div>
              )}
            </div>
          )}

          <button onClick={() => {
              if (vista === 'personas' && personaVista) {
                const opcs = [
                  ...usuarios.map(u => ({ key: `u_${u.id}`, tipo: 'usuario', id: u.id })),
                  ...roles.map(r => ({ key: `r_${r.id}`, tipo: 'rol', id: r.id })),
                ];
                const p = opcs.find(o => o.key === personaVista);
                if (p) { handleNuevaTareaPersona(p); return; }
              }
              setModalCrear(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all">
            <PlusIcon className="w-3.5 h-3.5" /> Nueva tarea
          </button>
        </div>
      </div>

      {/* Panel de búsqueda */}
      {mostrarBuscar && (
        <div className="flex-shrink-0 px-4 lg:px-6 pb-3 space-y-2">
          {/* Input de texto + sugerencias */}
          <div className="relative" ref={buscarRef}>
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              autoFocus
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              onKeyDown={e => { if (e.key === 'Escape') { setMostrarBuscar(false); setBusqueda(''); setFiltroFecha(''); setFechaCustom(''); } }}
              placeholder="Buscar tarea, archivo o comentario..."
              className="w-full pl-9 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-purple-50 shadow-sm transition-all"
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
            {/* Sugerencias dropdown */}
            {q.length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 z-30 overflow-hidden">
                {cargandoBusqueda ? (
                  <div className="px-4 py-3 text-xs text-gray-400 flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-gray-300 border-t-[#7B1FA2] rounded-full animate-spin" />
                    Buscando en comentarios y archivos...
                  </div>
                ) : sugerencias.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-gray-400">Sin resultados para &ldquo;{busqueda}&rdquo;</div>
                ) : (
                  <>
                    {sugerencias.map((s, i) => (
                      <button key={i}
                        onClick={() => { setTareaDetalle(s.tarea); setBusqueda(''); }}
                        className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                        <div className="flex-shrink-0 mt-0.5">
                          {s.tipo === 'comentario'
                            ? <ChatBubbleLeftIcon className="w-4 h-4 text-blue-400" />
                            : s.tipo === 'archivo'
                              ? <PaperClipIcon className="w-4 h-4 text-orange-400" />
                              : <CheckIcon className="w-4 h-4 text-purple-400" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-gray-800 truncate">{s.tarea.titulo}</div>
                          {s.contexto && (
                            <div className="text-[11px] text-gray-400 truncate mt-0.5">{s.contexto}</div>
                          )}
                        </div>
                      </button>
                    ))}
                    {cargandoBusqueda === false && (
                      <div className="px-4 py-1.5 text-[10px] text-gray-300 border-t border-gray-50">
                        Clic para abrir la tarea
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Filtros de fecha */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: 'hoy', label: 'Hoy' },
              { key: 'semana', label: 'Esta semana' },
              { key: 'vencidas', label: 'Vencidas' },
            ].map(f => (
              <button key={f.key}
                onClick={() => setFiltroFecha(filtroFecha === f.key ? '' : f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  filtroFecha === f.key
                    ? 'bg-[#7B1FA2] text-white border-transparent shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}>
                {f.label}
              </button>
            ))}
            <input
              type="date"
              value={fechaCustom}
              onChange={e => { setFechaCustom(e.target.value); setFiltroFecha(e.target.value ? 'custom' : ''); }}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 bg-white text-gray-600 outline-none focus:border-[#7B1FA2] transition-all cursor-pointer"
            />
            {(filtroFecha || fechaCustom) && (
              <button onClick={() => { setFiltroFecha(''); setFechaCustom(''); }}
                className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                <XMarkIcon className="w-3.5 h-3.5" /> Quitar filtro
              </button>
            )}
          </div>

        </div>
      )}

      {/* Banner filtro activo */}
      {filtroFecha && (
        <div className="flex-shrink-0 px-4 lg:px-6 pb-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-lg text-xs text-[#7B1FA2] font-medium">
            <CalendarDaysIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Mostrando {tareasFiltered.length} de {tareas.length} tareas</span>
            <button onClick={() => { setFiltroFecha(''); setFechaCustom(''); }}
              className="ml-auto text-[#7B1FA2] hover:text-purple-900 flex items-center gap-1">
              <XMarkIcon className="w-3 h-3" /> Quitar
            </button>
          </div>
        </div>
      )}

      {/* Tablero */}
      {cargando ? (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-3 px-4 py-4 h-full">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex-shrink-0 w-[262px] flex flex-col gap-2">
                <div className="h-8 bg-gray-100 rounded-xl animate-pulse" />
                <div className="flex-1 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 p-2 space-y-2">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="bg-white rounded-xl p-3 border border-gray-200 space-y-2 animate-pulse">
                      <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                      <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                      <div className="h-2 bg-gray-100 rounded-full w-1/3 mt-3" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : vista === 'personas' ? (
        <VistaPorPersonas
          tareas={tareasFiltered}
          columnas={columnas}
          usuarios={usuarios}
          roles={roles}
          onEditar={setTareaEditar}
          onEliminar={handleEliminar}
          onToggleTimer={handleToggleTimer}
          onVerDetalle={setTareaDetalle}
          onNuevaTarea={handleNuevaTareaPersona}
          admin={admin}
          currentUser={currentUser}
          esAsignadoATarea={esAsignadoATarea}
          esCreadorDeTarea={esCreadorDeTarea}
          personaVista={personaVista}
          onPersonaChange={setPersonaVista}
        />
      ) : columnas.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <BuildingOfficeIcon className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Sin columnas configuradas</h3>
          <p className="text-gray-400 text-sm mb-4">Crea tu primera columna para empezar.</p>
          {admin && <button onClick={() => setMostrarColumnas(true)}
            className="px-4 py-2 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl text-sm font-semibold">
            + Crear columna
          </button>}
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-1.5 px-4 py-4 h-full"
            style={{ minWidth: `${columnas.length * 272 + (admin ? 60 : 20) + 32}px` }}>
            {columnas.map((col, colIdx) => {
              const tareasCol = tareasPorColumna(col.id);
              const tieneVencidas = tareasCol.some(estaVencida);

              return (
                <React.Fragment key={col.id}>
                  <div className="flex-shrink-0 w-[262px] flex flex-col">
                  {/* Header columna — arrastrable para reordenar columnas */}
                  <div
                    draggable={admin}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('dragType', 'columna');
                      e.dataTransfer.setData('columnaId', String(col.id));
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (!isDragging) setColDragOver(col.id);
                    }}
                    onDragLeave={() => setColDragOver(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setColDragOver(null);
                      if (e.dataTransfer.getData('dragType') === 'columna') {
                        handleDropColumna(Number(e.dataTransfer.getData('columnaId')), col.id);
                      }
                    }}
                    className={`flex items-center justify-between mb-2 px-2 py-2 rounded-xl border transition-all ${
                      admin ? 'cursor-grab active:cursor-grabbing' : ''
                    } ${
                      colDragOver === col.id
                        ? 'border-[#7B1FA2] bg-purple-50 shadow-sm'
                        : 'border-transparent bg-white hover:bg-gray-50'
                    }`}
                    style={{ borderTop: `3px solid ${col.color}` }}
                  >
                    <div className="flex items-center gap-2">
                      {admin && (
                        <Bars3Icon className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" title="Arrastra para reordenar" />
                      )}
                      <span className="text-sm font-bold text-gray-700">{col.nombre}</span>
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                        style={{ backgroundColor: col.color + '22', color: col.color }}>
                        {tareasCol.length}
                      </span>
                      {tieneVencidas && <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-500" />}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setColumnaCrearDefault(col.id); setModalCrear(true); }}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-[#7B1FA2] hover:bg-purple-50 transition-all"
                      title="Añadir tarea en esta columna">
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Área de tarjetas */}
                  <div
                    className="flex-1 rounded-2xl p-2 border-2 border-dashed transition-all overflow-y-auto"
                    style={{ backgroundColor: col.color + '08', borderColor: col.color + (isDragging ? '80' : '30') }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.getData('dragType') === 'tarea') handleDropTarea(e, col.id); }}
                  >
                    {tareasCol.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-10 text-center gap-2">
                        {isDragging ? (
                          <div className="px-3 py-2 rounded-xl border-2 border-dashed text-xs font-semibold"
                            style={{ borderColor: col.color, color: col.color, background: col.color + '11' }}>
                            Soltar aquí
                          </div>
                        ) : (
                          <p className="text-xs text-gray-300 font-medium">Sin tareas</p>
                        )}
                      </div>
                    ) : (
                      tareasCol.map(t => (
                        <TareaCard key={t.id} tarea={t}
                          onEditar={setTareaEditar}
                          onEliminar={handleEliminar}
                          onToggleTimer={handleToggleTimer}
                          onVerDetalle={setTareaDetalle}
                          onDragStart={(tarea) => { draggedTareaRef.current = tarea; setIsDragging(true); }}
                          onDragEnd={() => { draggedTareaRef.current = null; dragOverTareaRef.current = null; setDragOverTareaId(null); setIsDragging(false); }}
                          onDragOverCard={(tarea) => { dragOverTareaRef.current = tarea; setDragOverTareaId(tarea.id); }}
                          isDragOver={isDragging && dragOverTareaId === t.id && draggedTareaRef.current?.id !== t.id}
                          puedeTimer={esAsignadoATarea(t)}
                          puedeEditar={admin || esCreadorDeTarea(t)}
                          puedeEliminar={admin} />
                      ))
                    )}
                  </div>
                  </div>

                  {/* Separador con + entre columnas */}
                  {admin && (
                    <div className="flex-shrink-0 w-6 flex items-start justify-center pt-8">
                      <button onClick={() => setMostrarColumnas(true)}
                        className="w-5 h-5 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300 hover:border-[#7B1FA2] hover:text-[#7B1FA2] hover:bg-purple-50 transition-all">
                        <PlusIcon className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {/* Columna fantasma para nueva columna al final */}
            {admin && (
              <div className="flex-shrink-0 w-[180px] flex flex-col pt-11">
                <button onClick={() => setMostrarColumnas(true)}
                  className="flex-1 min-h-[140px] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-300 hover:border-[#7B1FA2] hover:text-[#7B1FA2] hover:bg-purple-50 transition-all group">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                    <PlusIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold">Nueva columna</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modales */}
      {(modalCrear || tareaEditar) && (
        <TareaModal
          tarea={tareaEditar}
          columnas={columnas}
          prioridades={prioridades}
          usuarios={usuarios}
          roles={roles}
          defaultAsignaciones={asignadoDefault ? [{ tipo: asignadoDefault.tipo, id: asignadoDefault.id }] : []}
          defaultColumnaId={columnaCrearDefault}
          onGuardar={tareaEditar ? handleEditar : handleCrear}
          onCerrar={() => { setModalCrear(false); setTareaEditar(null); setAsignadoDefault(null); setColumnaCrearDefault(null); }}
          showNotif={showNotif}
          onRecargar={cargar}
        />
      )}

      {tareaDetalle && (
        <DetalleModal
          tarea={tareaDetalle}
          onCerrar={() => setTareaDetalle(null)}
          puedeCommentar={admin || esAsignadoATarea(tareaDetalle)}
          puedeEliminarArchivo={admin || esCreadorDeTarea(tareaDetalle)}
          puedeEditar={admin || esCreadorDeTarea(tareaDetalle)}
          puedeEliminarTarea={admin}
          onEditar={setTareaEditar}
          onEliminar={handleEliminar}
          showNotif={showNotif}
          currentUserId={currentUser?.id}
          esAdmin={admin}
        />
      )}

      {mostrarReporte && <ReporteModal onCerrar={() => setMostrarReporte(false)} />}
      {mostrarColumnas && (
        <ColumnasModal
          columnas={columnas}
          onCerrar={() => setMostrarColumnas(false)}
          onActualizar={cargar}
          showNotif={showNotif}
        />
      )}

      {confirmEliminarTarea && (
        <ConfirmModal
          mensaje="¿Eliminar esta tarea?"
          onConfirmar={() => { ejecutarEliminarTarea(confirmEliminarTarea); setConfirmEliminarTarea(null); setTareaDetalle(null); }}
          onCancelar={() => setConfirmEliminarTarea(null)}
        />
      )}
    </div>
  );
}
