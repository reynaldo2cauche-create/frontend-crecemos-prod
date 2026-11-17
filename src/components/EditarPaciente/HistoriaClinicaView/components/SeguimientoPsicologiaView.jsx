import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, Check, Link2, Clock, CheckCircle2, Eye, Trash2, X, AlertCircle, Brain, Calendar, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  generarFicha,
  getFichasPorPaciente,
  anularFicha,
  buildFichaLink,
} from '../../../../services/fichaSeguimientoPsicologiaService';
import { valoresVacios } from '../../../../constants/fichaSeguimientoPsicologia';
import { canManagePatientStatus } from '../../../../constants/roles';
import FichaPsicologiaFormBody from '../../../FichaSeguimiento/FichaPsicologiaFormBody';

const formatFecha = (f) => {
  if (!f) return '—';
  const d = new Date(f);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Genera opciones de periodo desde el mes actual hacia adelante (12 meses): "Octubre 2026"
const opcionesPeriodo = () => {
  const hoy = new Date();
  const lista = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() + i, 1);
    lista.push(`${MESES[d.getMonth()]} ${d.getFullYear()}`);
  }
  return lista;
};

const periodoActual = () => {
  const hoy = new Date();
  return `${MESES[hoy.getMonth()]} ${hoy.getFullYear()}`;
};

// Dato con etiqueta pequeña (mismo patrón que el detalle de Indicación Terapéutica)
const Dato = ({ label, children }) => (
  <div className="min-w-0">
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-sm font-semibold text-gray-800 truncate">{children}</p>
  </div>
);

const SeguimientoPsicologiaView = ({ paciente, user }) => {
  const puedeGestionar = canManagePatientStatus(user); // Admin / Admisión
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState(null); // { msg, tipo }
  const [copiadoId, setCopiadoId] = useState(null);
  const [expandidas, setExpandidas] = useState({});
  const toggleExpandida = (id) => setExpandidas((prev) => ({ ...prev, [id]: !prev[id] }));

  const [modalGenerar, setModalGenerar] = useState(false);
  const [form, setForm] = useState({ periodo_observacion: periodoActual() });
  const [generando, setGenerando] = useState(false);

  const [verFicha, setVerFicha] = useState(null); // ficha completada a visualizar
  const [modalAnular, setModalAnular] = useState(null); // ficha a anular

  const toast = (msg, tipo = 'success') => {
    setSnack({ msg, tipo });
    setTimeout(() => setSnack(null), 3000);
  };

  const cargar = async () => {
    if (!paciente?.id) return;
    try {
      setLoading(true);
      const data = await getFichasPorPaciente(paciente.id);
      setFichas(data || []);
    } catch (e) {
      console.error('Error al cargar fichas de seguimiento psicológico:', e);
      setFichas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paciente?.id]);

  const handleGenerar = async () => {
    try {
      setGenerando(true);
      await generarFicha({
        paciente_id: paciente.id,
        periodo_observacion: form.periodo_observacion || null,
        user_id_crea: user?.id,
      });
      setModalGenerar(false);
      setForm({ periodo_observacion: periodoActual() });
      await cargar();
      toast('Solicitud generada. Copia el enlace y envíalo a la docente.');
    } catch (e) {
      console.error('Error al generar ficha:', e);
      toast('No se pudo generar la solicitud.', 'error');
    } finally {
      setGenerando(false);
    }
  };

  const copiarLink = (ficha) => {
    const link = buildFichaLink(ficha.token);
    navigator.clipboard.writeText(link).then(() => {
      setCopiadoId(ficha.id);
      setTimeout(() => setCopiadoId(null), 2000);
    });
  };

  const handleAnular = async () => {
    if (!modalAnular) return;
    try {
      await anularFicha(modalAnular.id);
      setModalAnular(null);
      await cargar();
      toast('Solicitud anulada.');
    } catch (e) {
      console.error('Error al anular ficha:', e);
      toast(e.response?.data?.message || 'No se pudo anular.', 'error');
    }
  };

  // ── Spinner de carga ───────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <div className="absolute inset-0 border-2 border-gray-100 rounded-full" />
            <div className="absolute inset-0 border-2 border-transparent border-t-[#7B1FA2] rounded-full animate-spin" />
          </div>
          <p className="text-gray-400 text-xs font-medium">Cargando fichas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Snackbar ─────────────────────────────────────── */}
      {snack && (
        <div className={`fixed top-6 right-6 z-[90000] px-5 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 bg-white ${
          snack.tipo === 'success' ? 'border-gray-100' : 'border-red-100'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${snack.tipo === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`} />
          <span className="text-xs font-medium text-gray-700">{snack.msg}</span>
          <button onClick={() => setSnack(null)} className="ml-2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      )}

      {/* ── Botón generar solicitud ─────────────────────── */}
      {puedeGestionar && (
        <button
          onClick={() => setModalGenerar(true)}
          className="w-full px-4 py-3 cx-glow bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-full flex items-center justify-center gap-2 font-semibold text-sm shadow-lg shadow-purple-500/30"
        >
          <Plus className="w-5 h-5" />
          Generar solicitud de seguimiento
        </button>
      )}

      <p className="text-xs text-gray-400 px-1">
        Cuestionario para maestros (Conners) que llena la docente del colegio a través de un enlace único.
      </p>

      {/* ── Listado de fichas ───────────────────────────── */}
      {fichas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Aún no hay solicitudes de seguimiento psicológico</p>
        </div>
      ) : (
        <div className="space-y-3">
          {fichas.map((f) => {
            const completada = f.estado === 'COMPLETADA';
            const abierta = !!expandidas[f.id];
            return (
              <div
                key={f.id}
                className={`bg-white rounded-2xl overflow-hidden border transition-all ${
                  abierta
                    ? 'border-purple-200/70 shadow-[0_8px_24px_rgba(123,31,162,0.08)]'
                    : 'border-gray-100 shadow-[0_1px_3px_rgba(16,24,40,0.04)] hover:shadow-[0_6px_18px_rgba(16,24,40,0.06)]'
                }`}
              >
                {/* Fila de cabecera */}
                <div className={`w-full p-4 flex items-center justify-between transition-colors ${abierta ? 'bg-purple-50/40' : 'hover:bg-gray-50/60'}`}>
                  <button onClick={() => toggleExpandida(f.id)} className="flex items-center gap-3.5 flex-1 text-left min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                      completada
                        ? 'bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] shadow-purple-500/20'
                        : 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-500/20'
                    }`}>
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate">
                        {f.periodo_observacion || 'Sin periodo'} — Seguimiento psicológico
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          completada ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {completada ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {completada ? 'Completada' : 'Pendiente'}
                        </span>
                        {completada && f.docente_nombre && (
                          <span className="text-xs text-gray-400 truncate">{f.docente_nombre}</span>
                        )}
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-1">
                    {!completada && (
                      <button
                        onClick={() => copiarLink(f)}
                        className="p-2 hover:bg-purple-50 rounded-lg transition-colors group"
                        title="Copiar enlace"
                      >
                        {copiadoId === f.id
                          ? <Check className="w-5 h-5 text-green-600" />
                          : <Link2 className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />}
                      </button>
                    )}
                    {completada && (
                      <button
                        onClick={() => setVerFicha(f)}
                        className="p-2 hover:bg-purple-50 rounded-lg transition-colors group"
                        title="Ver respuestas"
                      >
                        <Eye className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                      </button>
                    )}
                    {puedeGestionar && !completada && (
                      <button
                        onClick={() => setModalAnular(f)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                        title="Anular solicitud"
                      >
                        <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
                      </button>
                    )}
                    <button onClick={() => toggleExpandida(f.id)} className="p-2">
                      {abierta
                        ? <ChevronUp className="w-5 h-5 text-gray-400" />
                        : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                {/* Detalle expandido */}
                {abierta && (
                  <div className="border-t border-gray-100 p-6 bg-white space-y-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                      <Dato label="Periodo">{f.periodo_observacion || '—'}</Dato>
                      <Dato label="Entrega">{formatFecha(f.fecha_entrega || f.fecha_crea)}</Dato>
                      <Dato label="Docente">{completada ? (f.docente_nombre || '—') : 'Sin responder'}</Dato>
                      <Dato label="Devolución">
                        {completada ? formatFecha(f.fecha_devolucion || f.fecha_completado) : '—'}
                      </Dato>
                    </div>

                    {completada ? (
                      <button
                        onClick={() => setVerFicha(f)}
                        className="cx-glow px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] rounded-full shadow-lg shadow-purple-500/30 inline-flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" /> Ver respuestas
                      </button>
                    ) : (
                      <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                        <p className="text-sm text-gray-600 leading-snug">
                          Esperando respuesta de la docente. Comparte el enlace para que complete la ficha.
                        </p>
                        <button
                          onClick={() => copiarLink(f)}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#7B1FA2]/10 text-[#7B1FA2] text-sm font-semibold hover:bg-[#7B1FA2]/15 transition-all flex-shrink-0"
                        >
                          {copiadoId === f.id ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                          {copiadoId === f.id ? 'Copiado' : 'Copiar enlace'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal generar ───────────────────────────────── */}
      {modalGenerar && createPortal((
        <div className="fixed inset-0 z-[70000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalGenerar(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div
              className="flex items-center justify-between px-5 py-3 border-b border-purple-100/60"
              style={{ backgroundImage: 'radial-gradient(70% 140% at 100% 0%, rgba(123,31,162,.07) 0%, rgba(123,31,162,0) 60%), linear-gradient(120deg, #ffffff 0%, #fdfbff 60%, #faf6fe 100%)' }}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center shadow-sm shadow-purple-500/20 flex-shrink-0">
                  <Brain className="w-[18px] h-[18px] text-white" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-[#2D0A4E] leading-tight">Generar solicitud</h3>
                  <p className="text-[11px] text-gray-500 leading-tight">Cuestionario de Conners</p>
                </div>
              </div>
              <button onClick={() => setModalGenerar(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/70 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                Selecciona el periodo de observación. Al generar, obtendrás un enlace único para
                enviarle a la docente (ella llenará las fechas de entrega y devolución).
              </p>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Periodo de observación <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    value={form.periodo_observacion}
                    onChange={(e) => setForm((p) => ({ ...p, periodo_observacion: e.target.value }))}
                    className="cx-select w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-[#7B1FA2]/15 transition-shadow"
                  >
                    {opcionesPeriodo().map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                onClick={() => setModalGenerar(false)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerar}
                disabled={generando}
                className="cx-glow px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] rounded-full disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 flex items-center gap-2"
              >
                {generando
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Generando...</>
                  : <><Plus className="w-4 h-4" />Generar</>
                }
              </button>
            </div>
          </div>
        </div>
      ), document.body)}

      {/* ── Modal ver respuestas (lectura) ──────────────── */}
      {verFicha && createPortal((
        <div className="fixed inset-0 z-[70000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setVerFicha(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div
              className="flex items-center justify-between px-5 py-3 border-b border-purple-100/60 flex-shrink-0"
              style={{ backgroundImage: 'radial-gradient(70% 140% at 100% 0%, rgba(123,31,162,.07) 0%, rgba(123,31,162,0) 60%), linear-gradient(120deg, #ffffff 0%, #fdfbff 60%, #faf6fe 100%)' }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center shadow-sm shadow-purple-500/20 flex-shrink-0">
                  <Brain className="w-[18px] h-[18px] text-white" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-[#2D0A4E] leading-tight">Ficha de Seguimiento · Psicología</h3>
                  <p className="text-[11px] text-gray-500 leading-tight truncate">
                    {verFicha.estudiante} · Docente: {verFicha.docente_nombre || '—'}
                    {verFicha.nivel_grado ? ` · ${verFicha.nivel_grado}` : ''}
                    {verFicha.institucion_educativa ? ` · ${verFicha.institucion_educativa}` : ''}
                  </p>
                </div>
              </div>
              <button onClick={() => setVerFicha(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/70 transition-colors flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 bg-gray-50/70 border border-gray-100 rounded-xl p-4">
                <Dato label="Estudiante">{verFicha.estudiante || '—'}</Dato>
                <Dato label="Docente">{verFicha.docente_nombre || '—'}</Dato>
                <Dato label="Nivel / Grado">{verFicha.nivel_grado || '—'}</Dato>
                <Dato label="Devolución">{formatFecha(verFicha.fecha_devolucion || verFicha.fecha_completado)}</Dato>
              </div>
              <FichaPsicologiaFormBody
                valores={{ ...valoresVacios(), ...verFicha }}
                setValores={() => {}}
                readOnly
              />
            </div>
          </div>
        </div>
      ), document.body)}

      {/* ── Modal anular ────────────────────────────────── */}
      {modalAnular && createPortal((
        <div className="fixed inset-0 z-[70000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalAnular(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Anular solicitud</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  El enlace dejará de funcionar. Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalAnular(null)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAnular}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
              >
                Anular
              </button>
            </div>
          </div>
        </div>
      ), document.body)}
    </div>
  );
};

export default SeguimientoPsicologiaView;