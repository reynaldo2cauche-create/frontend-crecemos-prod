import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PlusIcon, ClockIcon, PencilIcon, TrashIcon, ChatBubbleLeftIcon,
  PlayIcon, PauseIcon, ChartBarIcon, XMarkIcon, CheckIcon,
  ExclamationTriangleIcon, CalendarDaysIcon, BuildingOfficeIcon, Bars3Icon,
} from '@heroicons/react/24/outline';
import {
  listarTareas, obtenerColumnas, obtenerPrioridades, crearTarea,
  actualizarTarea, eliminarTarea, moverColumna, iniciarTimer,
  pausarTimer, listarComentarios, agregarComentario, obtenerReporteMensual,
  crearColumna, eliminarColumna, reordenarColumnas,
} from '../../services/centroOperativoService';
import { ROLES } from '../../constants/roles';
import api from '../../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getUser = () => JSON.parse(localStorage.getItem('user') || '{}');
const esAdmin = () => getUser()?.rol?.id === ROLES.ADMINISTRADOR;

function formatTiempo(segundos) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  if (h > 0) return `${h}h ${m}m`;
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

// ─── Timer en vivo ────────────────────────────────────────────────────────────

function useTiempoVivo(tarea) {
  const [seg, setSeg] = useState(tarea?.tiempo_acumulado || 0);
  useEffect(() => {
    if (!tarea?.timer_activo || !tarea?.timer_inicio) {
      setSeg(tarea?.tiempo_acumulado || 0);
      return;
    }
    const base = tarea.tiempo_acumulado || 0;
    const inicio = new Date(tarea.timer_inicio).getTime();
    const tick = () => setSeg(base + Math.floor((Date.now() - inicio) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tarea?.timer_activo, tarea?.timer_inicio, tarea?.tiempo_acumulado]);
  return seg;
}

// ─── Notificación ─────────────────────────────────────────────────────────────

function Notificacion({ notif }) {
  if (!notif.show) return null;
  return (
    <div className={`fixed top-5 right-5 z-[999] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white transition-all ${
      notif.type === 'error' ? 'bg-red-500' : 'bg-green-500'
    }`}>
      {notif.type === 'error'
        ? <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
        : <CheckIcon className="w-5 h-5 flex-shrink-0" />}
      <p className="font-medium">{notif.message}</p>
    </div>
  );
}

// ─── Tarjeta de tarea ─────────────────────────────────────────────────────────

function TareaCard({ tarea, onEditar, onEliminar, onToggleTimer, onVerDetalle, onDragStart, onDragEnd, puedeTimer, puedeEditar, puedeEliminar }) {
  const vencida = estaVencida(tarea);
  const tiempo = useTiempoVivo(tarea);
  const dias = diasRestantes(tarea.fecha_limite);

  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.setData('dragType', 'tarea'); onDragStart(tarea); }}
      onDragEnd={() => onDragEnd()}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => onVerDetalle(tarea)}
      className={`rounded-xl p-3.5 mb-2.5 cursor-grab active:cursor-grabbing border transition-all hover:shadow-md ${
        vencida
          ? 'bg-red-50 border-red-200 hover:border-red-300'
          : 'bg-white border-gray-200 hover:border-purple-200'
      }`}
    >
      {/* Prioridad + badge vencida */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: tarea.prioridad?.color + '22', color: tarea.prioridad?.color }}>
          {tarea.prioridad?.nombre}
        </span>
        {vencida && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">
            <ExclamationTriangleIcon className="w-3 h-3" /> VENCIDA
          </span>
        )}
      </div>

      {/* Título */}
      <p className={`text-sm font-semibold leading-snug mb-2.5 ${vencida ? 'text-red-700' : 'text-gray-800'}`}>
        {tarea.titulo}
      </p>

      {/* Fecha límite */}
      {tarea.fecha_limite && (
        <div className={`flex items-center gap-1 text-[11px] mb-2 ${
          vencida ? 'text-red-500 font-semibold'
          : dias !== null && dias <= 2 ? 'text-amber-600 font-medium'
          : 'text-gray-400'
        }`}>
          <CalendarDaysIcon className="w-3 h-3 flex-shrink-0" />
          {new Date(tarea.fecha_limite).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
          {!vencida && dias !== null && dias <= 3 && (
            <span className="ml-1">({dias === 0 ? 'hoy' : `${dias}d`})</span>
          )}
        </div>
      )}

      {/* Asignados */}
      {tarea.asignaciones?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {tarea.asignaciones.slice(0, 3).map(a => (
            <span key={a.id} className="text-[10px] bg-purple-50 text-[#7B1FA2] px-1.5 py-0.5 rounded-full font-medium border border-purple-100">
              {a.usuario ? `${a.usuario.nombres} ${a.usuario.apellidos}`.split(' ').slice(0, 2).join(' ') : `Rol: ${a.rol?.nombre}`}
            </span>
          ))}
          {tarea.asignaciones.length > 3 && (
            <span className="text-[10px] text-gray-400">+{tarea.asignaciones.length - 3}</span>
          )}
        </div>
      )}

      {/* Timer + acciones */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100" onClick={e => e.stopPropagation()}>
        <div className={`flex items-center gap-1 text-[11px] font-medium ${tarea.timer_activo ? 'text-green-600' : 'text-gray-400'}`}>
          <ClockIcon className="w-3 h-3" />
          {formatTiempo(tiempo)}
          {tarea.timer_activo && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse ml-0.5" />}
        </div>
        <div className="flex items-center gap-1">
          {puedeTimer && (
            <button onClick={() => onToggleTimer(tarea)}
              className={`p-1 rounded-lg transition-colors ${tarea.timer_activo ? 'text-amber-500 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
              title={tarea.timer_activo ? 'Pausar' : 'Iniciar'}>
              {tarea.timer_activo ? <PauseIcon className="w-3.5 h-3.5" /> : <PlayIcon className="w-3.5 h-3.5" />}
            </button>
          )}
          {puedeEditar && (
            <button onClick={() => onEditar(tarea)}
              className="p-1 rounded-lg text-gray-400 hover:text-[#7B1FA2] hover:bg-purple-50 transition-colors">
              <PencilIcon className="w-3.5 h-3.5" />
            </button>
          )}
          {puedeEliminar && (
            <button onClick={() => onEliminar(tarea.id)}
              className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Modal crear/editar ───────────────────────────────────────────────────────

function TareaModal({ tarea, columnas, prioridades, usuarios, roles, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    titulo: tarea?.titulo || '',
    descripcion: tarea?.descripcion || '',
    prioridad_id: tarea?.prioridad_id || 2,
    columna_id: tarea?.columna_id || 1,
    fecha_limite: tarea?.fecha_limite ? tarea.fecha_limite.slice(0, 16) : '',
    asignaciones: tarea?.asignaciones?.map(a => ({
      tipo: a.usuario_id ? 'usuario' : 'rol',
      id: a.usuario_id || a.rol_id,
    })) || [],
  });
  const [guardando, setGuardando] = useState(false);
  const [nuevaAsig, setNuevaAsig] = useState({ tipo: 'usuario', id: '' });

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
      await onGuardar({
        titulo: form.titulo.trim(),
        descripcion: form.descripcion || null,
        prioridad_id: Number(form.prioridad_id),
        columna_id: Number(form.columna_id),
        fecha_limite: form.fecha_limite || null,
        asignaciones: form.asignaciones.map(a =>
          a.tipo === 'usuario' ? { usuario_id: a.id } : { rol_id: a.id }
        ),
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCerrar}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Header modal */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-xl flex items-center justify-center">
              <BuildingOfficeIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">{tarea ? 'Editar tarea' : 'Nueva tarea'}</h2>
          </div>
          <button onClick={onCerrar} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Título *</label>
            <input value={form.titulo} onChange={e => set('titulo', e.target.value)}
              placeholder="¿Qué hay que hacer?"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-purple-50 transition-all" />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descripción</label>
            <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
              rows={3} placeholder="Detalles adicionales..."
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#7B1FA2] resize-none transition-all" />
          </div>

          {/* Prioridad + Columna */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Prioridad</label>
              <select value={form.prioridad_id} onChange={e => set('prioridad_id', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B1FA2] bg-white">
                {prioridades.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Columna</label>
              <select value={form.columna_id} onChange={e => set('columna_id', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B1FA2] bg-white">
                {columnas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>

          {/* Fecha límite */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fecha límite</label>
            <input type="datetime-local" value={form.fecha_limite} onChange={e => set('fecha_limite', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#7B1FA2] transition-all" />
          </div>

          {/* Asignaciones */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Asignar a</label>
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
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 pb-5">
          <button onClick={onCerrar} className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium">
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

function DetalleModal({ tarea, onCerrar, puedeCommentar }) {
  const [comentarios, setComentarios] = useState([]);
  const [nuevo, setNuevo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const tiempo = useTiempoVivo(tarea);

  useEffect(() => {
    listarComentarios(tarea.id).then(setComentarios).catch(() => {});
  }, [tarea.id]);

  const enviar = async () => {
    if (!nuevo.trim()) return;
    setEnviando(true);
    try {
      const c = await agregarComentario(tarea.id, nuevo.trim());
      setComentarios(p => [...p, c]);
      setNuevo('');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCerrar}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: tarea.prioridad?.color + '22', color: tarea.prioridad?.color }}>
                  {tarea.prioridad?.nombre}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ backgroundColor: tarea.columna?.color + '22', color: tarea.columna?.color }}>
                  {tarea.columna?.nombre}
                </span>
                {estaVencida(tarea) && (
                  <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">VENCIDA</span>
                )}
              </div>
              <h2 className="text-base font-bold text-gray-900 leading-snug">{tarea.titulo}</h2>
            </div>
            <button onClick={onCerrar} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 flex-shrink-0 transition-colors">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
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
                    {new Date(tarea.fecha_limite).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
            <div className={`flex items-center gap-2 p-3 rounded-xl border ${tarea.timer_activo ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
              <ClockIcon className="w-4 h-4 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5">Tiempo</p>
                <p className="text-xs font-bold">{formatTiempo(tiempo)}</p>
              </div>
              {tarea.timer_activo && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto" />}
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

          {/* Comentarios */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2.5 flex items-center gap-1.5">
              <ChatBubbleLeftIcon className="w-4 h-4 text-[#7B1FA2]" />
              Comentarios <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full text-[10px] font-bold">{comentarios.length}</span>
            </p>
            <div className="space-y-2 mb-3">
              {comentarios.length === 0 && (
                <p className="text-xs text-gray-400 italic text-center py-3">Sin comentarios aún.</p>
              )}
              {comentarios.map(c => (
                <div key={c.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[11px] font-semibold text-[#7B1FA2] mb-1">
                    {c.user_crea?.nombres} {c.user_crea?.apellidos}
                    <span className="font-normal text-gray-400 ml-1.5">
                      {new Date(c.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed">{c.contenido}</p>
                </div>
              ))}
            </div>
            {puedeCommentar && (
              <div className="flex gap-2">
                <input value={nuevo} onChange={e => setNuevo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviar()}
                  placeholder="Escribe un comentario..."
                  className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-purple-50 transition-all" />
                <button onClick={enviar} disabled={enviando || !nuevo.trim()}
                  className="px-4 py-2 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-semibold hover:shadow-md disabled:opacity-50 transition-all">
                  <CheckIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
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
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Gestionar columnas</h2>
            <p className="text-xs text-gray-400 mt-0.5">Arrastra <Bars3Icon className="w-3 h-3 inline" /> para reordenar</p>
          </div>
          <button onClick={onCerrar} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400"><XMarkIcon className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Lista de columnas existentes con drag-to-reorder */}
          <div className="space-y-1.5">
            {listaLocal.map(col => (
              <div
                key={col.id}
                draggable
                onDragStart={() => handleDragStart(col)}
                onDragOver={(e) => handleDragOver(e, col)}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDrop(e, col)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                  dragOver === col.id
                    ? 'border-[#7B1FA2] bg-purple-50 shadow-sm'
                    : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <Bars3Icon className="w-4 h-4 text-gray-300 cursor-grab active:cursor-grabbing flex-shrink-0" />
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                  <span className="text-sm font-medium text-gray-700 truncate">{col.nombre}</span>
                  {col.es_final && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">Final</span>}
                </div>
                <button onClick={() => handleEliminar(col)} className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 ml-2">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          {/* Crear nueva columna */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nueva columna</p>
            <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre de la columna"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#7B1FA2]" />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-600">Color</label>
                <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                  className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.es_final} onChange={e => setForm(p => ({ ...p, es_final: e.target.checked }))}
                  className="w-4 h-4 accent-[#7B1FA2]" />
                <span className="text-xs font-medium text-gray-600">Es columna final</span>
              </label>
            </div>
            <button onClick={handleCrear} disabled={guardando || !form.nombre.trim()}
              className="w-full py-2.5 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl text-sm font-semibold hover:shadow-md disabled:opacity-50 transition-all">
              {guardando ? 'Creando...' : 'Crear columna'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function CentroOperativo() {
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
  const [notif, setNotif] = useState({ show: false, message: '', type: 'success' });
  const [isDragging, setIsDragging] = useState(false);
  const [colDragOver, setColDragOver] = useState(null);
  const draggedTareaRef = useRef(null);
  const colDragRef = useRef(null);

  const roles = [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Admisión' },
    { id: 3, nombre: 'Recursos Humanos' },
    { id: 4, nombre: 'Terapeuta' },
  ];

  const currentUser = getUser();
  const admin = currentUser?.rol?.id === ROLES.ADMINISTRADOR;

  const esAsignadoATarea = (tarea) =>
    tarea.asignaciones?.some(a =>
      a.usuario_id === currentUser?.id ||
      a.rol_id === currentUser?.rol?.id
    );

  const showNotif = (message, type = 'success') => {
    setNotif({ show: true, message, type });
    setTimeout(() => setNotif({ show: false, message: '', type: 'success' }), 3000);
  };

  const ordenarTareas = (lista) => [...lista].sort((a, b) => {
    const av = estaVencida(a) ? 0 : 1;
    const bv = estaVencida(b) ? 0 : 1;
    if (av !== bv) return av - bv;
    if (!a.fecha_limite && !b.fecha_limite) return 0;
    if (!a.fecha_limite) return 1;
    if (!b.fecha_limite) return -1;
    return new Date(a.fecha_limite) - new Date(b.fecha_limite);
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

  const tareasPorColumna = (colId) => tareas.filter(t => t.columna_id === colId);

  const handleCrear = async (payload) => {
    try {
      await crearTarea(payload);
      setModalCrear(false);
      showNotif('Tarea creada correctamente');
      cargar();
    } catch {
      showNotif('Error al crear la tarea', 'error');
    }
  };

  const handleEditar = async (payload) => {
    try {
      await actualizarTarea(tareaEditar.id, payload);
      setTareaEditar(null);
      showNotif('Tarea actualizada');
      cargar();
    } catch {
      showNotif('Error al actualizar', 'error');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return;
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
    draggedTareaRef.current = null;
    setIsDragging(false);
    if (!tarea || tarea.columna_id === colId) return;
    await handleMoverColumna(tarea, colId);
  };

  const handleToggleTimer = async (tarea) => {
    try {
      if (tarea.timer_activo) await pausarTimer(tarea.id);
      else await iniciarTimer(tarea.id);
      cargar();
    } catch {
      showNotif('Error con el cronómetro', 'error');
    }
  };

  const vencidas = tareas.filter(estaVencida).length;
  const completadas = tareas.filter(t => t.columna?.es_final && t.columna?.nombre === 'Completado').length;
  const enCurso = tareas.filter(t => !t.columna?.es_final).length;

  return (
    <div className="flex flex-col bg-gray-50" style={{ height: '100vh' }}>
      <Notificacion notif={notif} />

      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 pt-24 lg:pt-6 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Título */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-2xl flex items-center justify-center shadow-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Centro Operativo</h1>
              <p className="text-sm text-gray-500">Gestión y seguimiento de tareas internas</p>
            </div>
          </div>

          {/* Stats + acciones */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              {[
                { label: tareas.length, sub: 'Total', cls: 'text-gray-700 bg-gray-50 border-gray-200' },
                { label: enCurso, sub: 'En curso', cls: 'text-blue-700 bg-blue-50 border-blue-100' },
                { label: completadas, sub: 'Listas', cls: 'text-green-700 bg-green-50 border-green-100' },
                ...(vencidas > 0 ? [{ label: vencidas, sub: 'Vencidas', cls: 'text-red-700 bg-red-50 border-red-100' }] : []),
              ].map(s => (
                <div key={s.sub} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold ${s.cls}`}>
                  <span className="font-bold">{s.label}</span> {s.sub}
                </div>
              ))}
            </div>
            <div className="w-px h-6 bg-gray-200" />
            <button onClick={() => setMostrarReporte(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 bg-white">
              <ChartBarIcon className="w-4 h-4" /> Reporte
            </button>
            {admin && (
              <button onClick={() => setMostrarColumnas(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 bg-white">
                <PlusIcon className="w-4 h-4" /> Columnas
              </button>
            )}
            <button onClick={() => setModalCrear(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl text-xs font-semibold hover:shadow-lg transition-all shadow-sm">
              <PlusIcon className="w-4 h-4" /> Nueva tarea
            </button>
          </div>
        </div>
      </div>

      {/* Tablero Kanban */}
      {cargando ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin mb-3" />
          <p className="text-gray-500 text-sm font-medium">Cargando tareas...</p>
        </div>
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
                    className={`flex items-center justify-between mb-2 px-1.5 py-1.5 rounded-xl border-2 transition-all ${
                      admin ? 'cursor-grab active:cursor-grabbing' : ''
                    } ${
                      colDragOver === col.id
                        ? 'border-[#7B1FA2] bg-purple-50 shadow-sm'
                        : 'border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {admin && (
                        <Bars3Icon className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" title="Arrastra para reordenar" />
                      )}
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                      <span className="text-sm font-bold text-gray-700">{col.nombre}</span>
                      <span className="text-[11px] bg-gray-100 text-gray-500 font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {tareasCol.length}
                      </span>
                      {tieneVencidas && <ExclamationTriangleIcon className="w-3 h-3 text-red-500" />}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setModalCrear(true); }}
                      className="p-1 rounded-lg hover:bg-white text-gray-300 hover:text-[#7B1FA2] transition-colors">
                      <PlusIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Área de tarjetas */}
                  <div
                    className="flex-1 rounded-2xl p-2 border-2 border-dashed transition-all overflow-y-auto"
                    style={{ backgroundColor: col.color + '0d', borderColor: col.color + (isDragging ? 'aa' : '40') }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.getData('dragType') === 'tarea') handleDropTarea(e, col.id); }}
                  >
                    {tareasCol.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-10 text-center">
                        <p className="text-xs text-gray-300 font-medium">
                          {isDragging ? 'Soltar aquí' : 'Sin tareas'}
                        </p>
                      </div>
                    ) : (
                      tareasCol.map(t => (
                        <TareaCard key={t.id} tarea={t}
                          onEditar={setTareaEditar}
                          onEliminar={handleEliminar}
                          onToggleTimer={handleToggleTimer}
                          onVerDetalle={setTareaDetalle}
                          onDragStart={(tarea) => { draggedTareaRef.current = tarea; setIsDragging(true); }}
                          onDragEnd={() => { draggedTareaRef.current = null; setIsDragging(false); }}
                          puedeTimer={admin || esAsignadoATarea(t)}
                          puedeEditar={admin || t.user_crea?.id === currentUser?.id}
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
              <div className="flex-shrink-0 w-[200px] flex flex-col pt-9">
                <button onClick={() => setMostrarColumnas(true)}
                  className="flex-1 min-h-[160px] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-300 hover:border-[#7B1FA2] hover:text-[#7B1FA2] hover:bg-purple-50 transition-all">
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                    <PlusIcon className="w-4 h-4" />
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
          onGuardar={tareaEditar ? handleEditar : handleCrear}
          onCerrar={() => { setModalCrear(false); setTareaEditar(null); }}
        />
      )}

      {tareaDetalle && (
        <DetalleModal
          tarea={tareaDetalle}
          onCerrar={() => setTareaDetalle(null)}
          puedeCommentar={admin || esAsignadoATarea(tareaDetalle)}
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
    </div>
  );
}
