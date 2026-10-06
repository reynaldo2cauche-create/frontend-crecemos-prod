import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, Copy, Check, Link2, Clock, CheckCircle2, Eye, Trash2, X, Loader2, AlertCircle, Brain,
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

const SeguimientoPsicologiaView = ({ paciente, user }) => {
  const puedeGestionar = canManagePatientStatus(user); // Admin / Admisión
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState(null); // { msg, tipo }
  const [copiadoId, setCopiadoId] = useState(null);

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

  return (
    <div className="space-y-4">
      {snack && (
        <div className="fixed top-6 right-6 z-[90000] px-4 py-3 rounded-xl shadow-lg border bg-white flex items-center gap-2.5">
          <div className={`w-1.5 h-1.5 rounded-full ${snack.tipo === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-700">{snack.msg}</span>
        </div>
      )}

      {/* Cabecera + acción */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Cuestionario para maestros (Conners) que llena la docente del colegio a través de un enlace único.
        </p>
        {puedeGestionar && (
          <button
            onClick={() => setModalGenerar(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7B1FA2] hover:bg-[#6A1B9A] text-white text-sm font-medium transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Generar solicitud
          </button>
        )}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-6 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
        </div>
      ) : fichas.length === 0 ? (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center">
          <Brain className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Aún no hay solicitudes de seguimiento psicológico.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {fichas.map((f) => {
            const completada = f.estado === 'COMPLETADA';
            return (
              <div
                key={f.id}
                className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      completada ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {completada ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {completada ? 'Completada' : 'Pendiente'}
                    </span>
                    {f.periodo_observacion && (
                      <span className="text-xs text-gray-400">· {f.periodo_observacion}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Entrega: {formatFecha(f.fecha_entrega || f.fecha_crea)}
                    {completada && (
                      <>
                        {' · '}Docente: <span className="text-gray-700">{f.docente_nombre || '—'}</span>
                        {' · '}Devolución: {formatFecha(f.fecha_devolucion || f.fecha_completado)}
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!completada && (
                    <button
                      onClick={() => copiarLink(f)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-[#7B1FA2] text-xs font-medium hover:bg-purple-100 transition-all"
                    >
                      {copiadoId === f.id ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                      {copiadoId === f.id ? 'Copiado' : 'Copiar enlace'}
                    </button>
                  )}
                  {completada && (
                    <button
                      onClick={() => setVerFicha(f)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ver respuestas
                    </button>
                  )}
                  {puedeGestionar && !completada && (
                    <button
                      onClick={() => setModalAnular(f)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Anular solicitud"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal generar */}
      {modalGenerar && createPortal((
        <div className="fixed inset-0 z-[70000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalGenerar(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold !text-white">Generar solicitud de ficha</h2>
              <button onClick={() => setModalGenerar(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-500">
                Selecciona el periodo de observación. Al generar, obtendrás un enlace único para
                enviarle a la docente (ella llenará las fechas de entrega y devolución).
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Periodo de observación</label>
                <select
                  value={form.periodo_observacion}
                  onChange={(e) => setForm((p) => ({ ...p, periodo_observacion: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30"
                >
                  {opcionesPeriodo().map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setModalGenerar(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerar}
                disabled={generando}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#7B1FA2] hover:bg-[#6A1B9A] text-white text-sm font-medium disabled:opacity-60"
              >
                {generando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Generar
              </button>
            </div>
          </div>
        </div>
      ), document.body)}

      {/* Modal ver respuestas (lectura) */}
      {verFicha && createPortal((
        <div className="fixed inset-0 z-[70000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setVerFicha(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-base font-bold !text-white">Ficha de Seguimiento · Psicología</h2>
                <p className="text-white/70 text-xs">
                  {verFicha.estudiante} · Docente: {verFicha.docente_nombre || '—'}
                  {verFicha.nivel_grado ? ` · ${verFicha.nivel_grado}` : ''}
                  {verFicha.institucion_educativa ? ` · ${verFicha.institucion_educativa}` : ''}
                </p>
              </div>
              <button onClick={() => setVerFicha(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <FichaPsicologiaFormBody
                valores={{ ...valoresVacios(), ...verFicha }}
                setValores={() => {}}
                readOnly
              />
            </div>
          </div>
        </div>
      ), document.body)}

      {/* Modal anular */}
      {modalAnular && createPortal((
        <div className="fixed inset-0 z-[70000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalAnular(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-50 mx-auto flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-base font-bold text-gray-900 mb-1">Anular solicitud</h2>
              <p className="text-sm text-gray-500 mb-5">
                El enlace dejará de funcionar. Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalAnular(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAnular}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium"
                >
                  Anular
                </button>
              </div>
            </div>
          </div>
        </div>
      ), document.body)}
    </div>
  );
};

export default SeguimientoPsicologiaView;
