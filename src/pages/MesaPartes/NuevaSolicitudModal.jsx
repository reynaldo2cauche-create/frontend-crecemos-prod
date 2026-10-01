import React, { useState } from 'react';
import { X, Loader2, Paperclip, Search, UserCheck, Send } from 'lucide-react';
import { crearSolicitud, buscarPacientesMP } from '../../services/mesaPartesService';
import { imprimirCargo } from './shared';

const PURPLE = '#7B1FA2';
const inputCls = 'w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200';

// El endpoint /pacientes/buscar devuelve { id, nombre_completo, numero_documento, celular }
const nombrePaciente = (p) =>
  p.nombre_completo ||
  [p.nombres, p.apellido_paterno, p.apellido_materno].filter(Boolean).join(' ') ||
  `Paciente #${p.id}`;

const NuevaSolicitudModal = ({ catalogos, userId, onClose, onCreated }) => {
  const [form, setForm] = useState({
    tipo_id: '', asunto: '', descripcion: '', entregado_por_nombre: '',
    entregado_por_doc: '', entregado_por_telefono: '',
  });
  const [paciente, setPaciente] = useState(null);
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [archivos, setArchivos] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const buscar = async (q) => {
    setQuery(q);
    if (!q || q.trim().length < 2) { setResultados([]); return; }
    setBuscando(true);
    try {
      const res = await buscarPacientesMP(q);
      setResultados(Array.isArray(res) ? res.slice(0, 8) : []);
    } catch (e) {
      console.error('Error buscando pacientes:', e);
      setResultados([]);
    }
    finally { setBuscando(false); }
  };

  const submit = async () => {
    if (!form.tipo_id) return setError('Seleccione el tipo de solicitud.');
    if (!form.descripcion.trim()) return setError('Describa la solicitud.');
    if (!form.entregado_por_nombre.trim()) return setError('Ingrese quién entrega el documento.');
    setError('');
    setGuardando(true);
    try {
      const creada = await crearSolicitud(
        {
          tipo_id: Number(form.tipo_id),
          asunto: form.asunto.trim(),
          descripcion: form.descripcion.trim(),
          entregado_por_nombre: form.entregado_por_nombre.trim(),
          entregado_por_doc: form.entregado_por_doc.trim(),
          entregado_por_telefono: form.entregado_por_telefono.trim(),
          paciente_id: paciente?.id,
          user_crea_id: userId,
        },
        archivos,
      );
      // Imprime el cargo para entregar al apoderado
      imprimirCargo(creada);
      onCreated();
    } catch (e) {
      setError(e.response?.data?.message || 'No se pudo registrar la solicitud.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="font-bold text-gray-900">Nueva solicitud</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tipo de solicitud *</label>
            <select value={form.tipo_id} onChange={set('tipo_id')} className={inputCls}>
              <option value="">Seleccione…</option>
              {catalogos.tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Asunto</label>
            <input value={form.asunto} onChange={set('asunto')} className={inputCls}
              placeholder="Título breve del documento (ej: Carta notarial, Constancia de asistencia…)" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Descripción *</label>
            <textarea value={form.descripcion} onChange={set('descripcion')} rows={3}
              placeholder="¿Qué solicita el apoderado?" className={inputCls} />
          </div>

          {/* Quién entrega */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Entregado por (apoderado) *</label>
              <input value={form.entregado_por_nombre} onChange={set('entregado_por_nombre')} className={inputCls} placeholder="Nombre completo" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Documento</label>
              <input value={form.entregado_por_doc} onChange={set('entregado_por_doc')} className={inputCls} placeholder="DNI" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Teléfono</label>
              <input value={form.entregado_por_telefono} onChange={set('entregado_por_telefono')} className={inputCls} placeholder="Para avisarle" />
            </div>
          </div>

          {/* Paciente opcional */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Paciente relacionado (opcional)</label>
            {paciente ? (
              <div className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                <span className="text-sm text-purple-800 font-medium flex items-center gap-2">
                  <UserCheck className="w-4 h-4" /> {nombrePaciente(paciente)}
                </span>
                <button onClick={() => { setPaciente(null); setQuery(''); }} className="text-purple-400 hover:text-purple-700"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={query} onChange={(e) => buscar(e.target.value)} className={`${inputCls} pl-9`} placeholder="Buscar paciente por nombre…" />
                {buscando && <Loader2 className="w-4 h-4 animate-spin text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />}
                {resultados.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {resultados.map((p) => (
                      <button key={p.id} onClick={() => { setPaciente(p); setResultados([]); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50">
                        {nombrePaciente(p)}
                        {p.numero_documento && <span className="text-xs text-gray-400 ml-2">{p.numero_documento}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Adjuntos */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Documento físico escaneado (opcional)</label>
            <label className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg px-3 py-2 cursor-pointer w-fit">
              <Paperclip className="w-4 h-4" /> Adjuntar archivos
              <input type="file" multiple accept="image/*,application/pdf" className="hidden"
                onChange={(e) => setArchivos(Array.from(e.target.files || []))} />
            </label>
            {archivos.length > 0 && (
              <ul className="mt-2 space-y-1">
                {archivos.map((f, i) => <li key={i} className="text-xs text-gray-500 truncate">• {f.name}</li>)}
              </ul>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2 sticky bottom-0 bg-white rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancelar</button>
          <button onClick={submit} disabled={guardando}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: PURPLE }}>
            {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {guardando ? 'Registrando…' : 'Registrar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NuevaSolicitudModal;
