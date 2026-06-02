import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ClipboardList, Plus, Check, CheckCircle2, Clock, Circle, Trash2, X,
  Pencil, Target, AlertCircle, ChevronDown, Calendar, User as UserIcon, Timer, DollarSign, Receipt,
} from 'lucide-react';
import {
  getServiciosPlanificador, getPlanServicio, agregarObjetivo, editarObjetivo,
  eliminarObjetivo, guardarRegistro,
} from '../../services/planificadorService';
import { getVentaServicioById } from '../../services/ventasService';
import DetalleVentaModal from '../Ventas/DetalleVentaModal';

const RESULTADOS = [
  { key: 'NO_LOGRADO', label: 'No logrado', solid: 'bg-red-500 text-white border-red-500', soft: 'text-red-600 border-red-200 hover:bg-red-50', dot: 'bg-red-500' },
  { key: 'EN_PROCESO', label: 'En proceso', solid: 'bg-amber-500 text-white border-amber-500', soft: 'text-amber-600 border-amber-200 hover:bg-amber-50', dot: 'bg-amber-500' },
  { key: 'LOGRADO',    label: 'Logrado',    solid: 'bg-emerald-500 text-white border-emerald-500', soft: 'text-emerald-600 border-emerald-200 hover:bg-emerald-50', dot: 'bg-emerald-500' },
];

const ESTADO_SESION = {
  REALIZADA:   { Icon: CheckCircle2, color: 'text-emerald-500', sub: null, label: 'Realizada' },
  AGENDADA:    { Icon: Clock,        color: 'text-amber-500',   sub: null, label: 'Agendada' },
  POR_AGENDAR: { Icon: Circle,       color: 'text-gray-300',    sub: 'por agendar', label: 'Por agendar' },
  FALTA_PAGAR: { Icon: DollarSign,   color: 'text-red-400',     sub: 'falta pagar', label: 'Falta pagar y agendar' },
};

const progresoColor = (pct) => {
  if (pct >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-600', label: 'Óptimo' };
  if (pct >= 40) return { bar: 'bg-amber-500', text: 'text-amber-600', label: 'En proceso' };
  return { bar: 'bg-red-500', text: 'text-red-600', label: 'En riesgo' };
};
const fmtFecha = (f, year) => {
  if (!f) return null;
  const d = new Date(String(f).slice(0, 10) + 'T00:00:00');
  return isNaN(d) ? null : d.toLocaleDateString('es-PE', year ? { day: '2-digit', month: '2-digit', year: 'numeric' } : { day: '2-digit', month: '2-digit' });
};

const PlanTerapeuticoView = ({ pacienteId, user }) => {
  const [servicios, setServicios] = useState([]);
  const [servicioId, setServicioId] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [abierto, setAbierto] = useState(null);     // bloque_id expandido
  const [sesionActiva, setSesionActiva] = useState(1);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });
  const [modalObjetivo, setModalObjetivo] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [modalVenta, setModalVenta] = useState(null);

  const toast = (tipo, texto) => { setMsg({ tipo, texto }); setTimeout(() => setMsg({ tipo: '', texto: '' }), 3500); };

  useEffect(() => {
    if (!pacienteId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getServiciosPlanificador(pacienteId);
        setServicios(data || []);
        if (data?.length) setServicioId(data[0].servicio_id);
        else setLoading(false);
      } catch (e) {
        toast('error', e.response?.data?.message || 'Error al cargar los servicios');
        setLoading(false);
      }
    })();
  }, [pacienteId]);

  const recargarPlan = async (sid = servicioId) => {
    if (!sid) return;
    const data = await getPlanServicio(pacienteId, sid);
    setPlan(data);
    return data;
  };

  const sesionEnCurso = (data, b) => {
    const pend = data.sesiones.find((s) => s.numero_sesion >= b.sesion_desde && s.numero_sesion <= b.sesion_hasta && s.estado !== 'REALIZADA');
    return pend ? pend.numero_sesion : b.sesion_desde;
  };

  useEffect(() => {
    if (!servicioId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await recargarPlan(servicioId);
        const pend = data?.sesiones?.find((s) => s.estado !== 'REALIZADA');
        const num = pend ? pend.numero_sesion : data?.sesiones?.[data.sesiones.length - 1]?.numero_sesion || 1;
        const actual = data?.bloques?.find((b) => num >= b.sesion_desde && num <= b.sesion_hasta) || data?.bloques?.[data.bloques.length - 1];
        setAbierto(actual?.id || null);
        setSesionActiva(num);
      } catch (e) {
        toast('error', e.response?.data?.message || 'Error al cargar el plan');
      } finally {
        setLoading(false);
      }
    })();
  }, [servicioId]);

  const sesiones = plan?.sesiones || [];
  const bloques = plan?.bloques || [];
  const sesionByNum = useMemo(() => Object.fromEntries(sesiones.map((s) => [s.numero_sesion, s])), [sesiones]);

  // Última fecha (más reciente) de las sesiones de un bloque, para ordenar por fecha.
  const ultimaFechaBloque = (b) => {
    const ss = sesiones.filter((s) => s.numero_sesion >= b.sesion_desde && s.numero_sesion <= b.sesion_hasta && s.fecha);
    return ss.length ? String(ss[ss.length - 1].fecha).slice(0, 10) : '';
  };
  // Acordeón ordenado por fecha: bloque más reciente primero (respaldo: nº de bloque).
  const bloquesDesc = useMemo(() => {
    return [...bloques].sort((a, b) => {
      const fa = ultimaFechaBloque(a), fb = ultimaFechaBloque(b);
      if (fa && fb && fa !== fb) return fa < fb ? 1 : -1;
      if (fa && !fb) return -1;
      if (!fa && fb) return 1;
      return b.numero_bloque - a.numero_bloque;
    });
  }, [bloques, sesiones]);

  const bloqueActualId = useMemo(() => {
    if (!bloques.length) return null;
    const pend = sesiones.find((s) => s.estado !== 'REALIZADA');
    const num = pend ? pend.numero_sesion : sesiones[sesiones.length - 1]?.numero_sesion;
    return (bloques.find((b) => num >= b.sesion_desde && num <= b.sesion_hasta) || bloques[bloques.length - 1])?.id;
  }, [bloques, sesiones]);

  const servicioSel = servicios.find((s) => s.servicio_id === servicioId) || null;

  const toggleBloque = (b) => {
    if (abierto === b.id) { setAbierto(null); return; }
    setAbierto(b.id);
    setSesionActiva(plan ? sesionEnCurso(plan, b) : b.sesion_desde);
  };

  // ── Handlers ──
  const handleResultado = async (o, resultado) => {
    try {
      await guardarRegistro({ objetivo_id: o.id, numero_sesion: sesionActiva, resultado, observaciones: o.registros?.[sesionActiva]?.observaciones ?? null });
      await recargarPlan();
    } catch (e) { toast('error', e.response?.data?.message || 'No se pudo registrar el resultado'); }
  };
  const handleObs = async (objetivoId, observaciones) => {
    const b = plan?.bloques?.find((x) => x.id === abierto);
    const reg = b?.objetivos?.find((x) => x.id === objetivoId)?.registros?.[sesionActiva];
    if (!reg?.resultado) { toast('error', 'Marca un resultado antes de la observación'); return; }
    try {
      await guardarRegistro({ objetivo_id: objetivoId, numero_sesion: sesionActiva, resultado: reg.resultado, observaciones });
      await recargarPlan();
    } catch (e) { toast('error', e.response?.data?.message || 'No se pudo guardar la observación'); }
  };
  const handleGuardarObjetivo = async (form) => {
    try {
      if (modalObjetivo.mode === 'add') await agregarObjetivo({ bloque_id: modalObjetivo.bloque.id, ...form });
      else await editarObjetivo(modalObjetivo.data.id, form);
      setModalObjetivo(null);
      await recargarPlan();
      toast('success', 'Objetivo guardado');
    } catch (e) { toast('error', e.response?.data?.message || 'No se pudo guardar el objetivo'); }
  };
  const handleEliminar = async () => {
    try {
      await eliminarObjetivo(confirmDelete.id);
      setConfirmDelete(null);
      await recargarPlan();
      toast('success', 'Objetivo eliminado');
    } catch (e) { toast('error', e.response?.data?.message || 'No se pudo eliminar'); }
  };
  const abrirVenta = async (ventaId) => {
    try {
      const v = await getVentaServicioById(ventaId);
      setModalVenta(v);
    } catch (e) { toast('error', 'No se pudo cargar el detalle de la venta'); }
  };
  const handleCopiarAnterior = async (bloque) => {
    const prev = bloques.find((b) => b.numero_bloque === bloque.numero_bloque - 1);
    if (!prev?.objetivos?.length) return;
    try {
      for (const o of prev.objetivos) {
        await agregarObjetivo({ bloque_id: bloque.id, titulo: o.titulo, objetivo_especifico: o.objetivo_especifico,
          actividad_ejemplo: o.actividad_ejemplo, materiales: o.materiales, continuado_de_objetivo_id: o.id });
      }
      await recargarPlan();
      toast('success', 'Objetivos copiados del bloque anterior');
    } catch (e) { toast('error', e.response?.data?.message || 'No se pudieron copiar'); }
  };

  const rangoFechas = (bloque) => {
    const ss = sesiones.filter((s) => s.numero_sesion >= bloque.sesion_desde && s.numero_sesion <= bloque.sesion_hasta && s.fecha);
    if (!ss.length) return 'Sin fechas aún';
    const a = fmtFecha(ss[0].fecha), b = fmtFecha(ss[ss.length - 1].fecha);
    return a === b ? a : `${a} – ${b}`;
  };
  const promedioBloque = (bloque) => {
    const objs = bloque.objetivos || [];
    if (!objs.length) return null;
    return Math.round(objs.reduce((a, o) => a + (o.progreso || 0), 0) / objs.length);
  };

  // ── Render ──
  if (loading && !plan) return <div className="h-40 bg-gray-50 rounded-2xl animate-pulse" />;

  if (!servicios.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">Sin servicios de terapia</p>
        <p className="text-sm text-gray-400 mt-1">Este paciente no tiene sesiones de terapia asignadas a ti.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {msg.texto && (
        <div className={`px-4 py-2 rounded-xl text-sm ${msg.tipo === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{msg.texto}</div>
      )}

      {/* Servicios del paciente (ordena/separa por servicio) */}
      <div className="flex items-center gap-2 flex-wrap">
        <Target className="w-4 h-4 text-[#7B1FA2]" />
        {servicios.map((sv) => {
          const activo = sv.servicio_id === servicioId;
          return (
            <button key={sv.servicio_id} onClick={() => setServicioId(sv.servicio_id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                activo ? 'border-[#7B1FA2] bg-purple-50 text-[#7B1FA2]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              {sv.servicio_nombre}<span className="ml-1 text-[10px] text-gray-400">· {sv.total_sesiones} ses.</span>
            </button>
          );
        })}
        {servicioSel?.terapeuta_nombre && <span className="text-[11px] text-gray-500 ml-auto">Terapeuta: {servicioSel.terapeuta_nombre}</span>}
      </div>

      {/* Acordeón de bloques — más reciente primero */}
      <div className="space-y-2">
        {bloquesDesc.map((bloque) => {
          const exp = abierto === bloque.id;
          const esActual = bloque.id === bloqueActualId;
          const prom = promedioBloque(bloque);
          const objetivos = bloque.objetivos || [];
          const sesB = sesiones.filter((s) => s.numero_sesion >= bloque.sesion_desde && s.numero_sesion <= bloque.sesion_hasta);
          const bloqueAnterior = bloques.find((b) => b.numero_bloque === bloque.numero_bloque - 1);
          const sInfo = sesionByNum[sesionActiva];
          const enBloque = sInfo && sesionActiva >= bloque.sesion_desde && sesionActiva <= bloque.sesion_hasta;
          const sel = enBloque ? sInfo : sesB[0];
          const editable = !!sel?.puede_registrar;

          return (
            <div key={bloque.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Cabecera */}
              <button onClick={() => toggleBloque(bloque)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 transition-all">
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${exp ? 'rotate-180' : ''}`} />
                <span className="text-sm font-bold text-gray-800">Bloque {bloque.numero_bloque}</span>
                {esActual && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold">En curso</span>}
                <span className="text-[11px] text-gray-400">Sesiones 1–{bloque.sesion_hasta - bloque.sesion_desde + 1} · {rangoFechas(bloque)}</span>
                <div className="ml-auto flex items-center gap-2">
                  {prom != null && (
                    <>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${progresoColor(prom).bar} rounded-full`} style={{ width: `${prom}%` }} /></div>
                      <span className={`text-xs font-bold ${progresoColor(prom).text}`}>{prom}%</span>
                    </>
                  )}
                  <span className="text-[11px] text-gray-400">{objetivos.length} obj.</span>
                </div>
              </button>

              {/* Contenido = diseño del mockup (por sesión) */}
              {exp && (
                <div className="px-4 pb-4">
                  {/* Sub-pestañas de sesión del bloque */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {sesB.map((s) => {
                      const est = ESTADO_SESION[s.estado] || ESTADO_SESION.POR_AGENDAR;
                      const Icon = est.Icon;
                      const activa = s.numero_sesion === sel?.numero_sesion;
                      return (
                        <button key={s.numero_sesion} onClick={() => setSesionActiva(s.numero_sesion)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${activa ? 'border-[#7B1FA2] bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <span className="text-[13px] font-bold text-gray-800 whitespace-nowrap">Sesión {s.numero_sesion - bloque.sesion_desde + 1}</span>
                          <Icon className={`w-3.5 h-3.5 ${est.color}`} />
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">{fmtFecha(s.fecha) || est.sub}</span>
                        </button>
                      );
                    })}
                    <button onClick={() => setModalObjetivo({ mode: 'add', bloque, data: {} })}
                      className="ml-auto flex items-center gap-1 text-xs font-semibold text-white bg-[#7B1FA2] hover:bg-[#6A1B9A] px-2.5 py-1.5 rounded-lg whitespace-nowrap">
                      <Plus className="w-3.5 h-3.5" /> Objetivo
                    </button>
                    {objetivos.length === 0 && bloqueAnterior?.objetivos?.length > 0 && (
                      <button onClick={() => handleCopiarAnterior(bloque)}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap">
                        Copiar anterior
                      </button>
                    )}
                  </div>

                  {/* Meta de la sesión seleccionada */}
                  {sel && (
                    <div className="flex items-center gap-4 flex-wrap mb-2 px-3 py-2 bg-gray-50/70 rounded-xl text-[11px]">
                      <span className="flex items-center gap-1.5 text-gray-600"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {fmtFecha(sel.fecha, true) || (ESTADO_SESION[sel.estado]?.sub || '—')}{sel.hora_inicio ? ` · ${String(sel.hora_inicio).slice(0, 5)}` : ''}</span>
                      {sel.terapeuta_nombre && <span className="flex items-center gap-1.5 text-gray-600"><UserIcon className="w-3.5 h-3.5 text-gray-400" /> {sel.terapeuta_nombre}</span>}
                      {sel.duracion_minutos != null && <span className="flex items-center gap-1.5 text-gray-600"><Timer className="w-3.5 h-3.5 text-gray-400" /> {sel.duracion_minutos} min</span>}
                      {sel.venta?.codigo && (
                        <button onClick={() => abrirVenta(sel.venta.venta_id)}
                          className="flex items-center gap-1.5 text-[#7B1FA2] font-semibold hover:underline"
                          title="Ver detalle de venta">
                          <Receipt className="w-3.5 h-3.5" /> {sel.venta.codigo}
                        </button>
                      )}
                      <span className="ml-auto flex items-center gap-1.5"><span className="text-gray-400">Estado:</span>
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${sel.estado === 'REALIZADA' ? 'bg-emerald-50 text-emerald-600' : sel.estado === 'AGENDADA' ? 'bg-amber-50 text-amber-600' : sel.estado === 'FALTA_PAGAR' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                          {sel.estado_nombre || ESTADO_SESION[sel.estado]?.label}
                        </span>
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-start">
                    {/* Tabla de objetivos de la sesión */}
                    <div className="lg:col-span-3">
                      {objetivos.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">Sin objetivos en este bloque. Agrega el primero.</p>
                      ) : (
                        <table className="w-full text-sm table-fixed">
                          <colgroup>
                            <col style={{ width: '15%' }} />
                            <col style={{ width: '18%' }} />
                            <col style={{ width: '16%' }} />
                            <col style={{ width: '12%' }} />
                            <col style={{ width: '17%' }} />
                            <col style={{ width: '17%' }} />
                            <col style={{ width: '5%' }} />
                          </colgroup>
                          <thead>
                            <tr className="border-b border-gray-100 text-left">
                              <Th>Área</Th><Th>Objetivo específico</Th><Th>Actividad / Ejemplo</Th><Th>Materiales</Th>
                              <Th className="text-center">Resultado</Th><Th>Observaciones</Th><Th> </Th>
                            </tr>
                          </thead>
                          <tbody>
                            {objetivos.map((o) => {
                              const reg = o.registros?.[sel?.numero_sesion] || {};
                              return (
                                <tr key={o.id} className="border-b border-gray-50 align-top">
                                  <td className="px-2 py-2.5">
                                    <div className="flex items-start gap-1.5">
                                      <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5"><Target className="w-3 h-3 text-[#7B1FA2]" /></div>
                                      <p className="font-semibold text-gray-800 leading-tight break-words">{o.titulo}</p>
                                    </div>
                                  </td>
                                  <td className="px-2 py-2.5 text-[11px] text-gray-600 break-words">{o.objetivo_especifico || '—'}</td>
                                  <td className="px-2 py-2.5 text-[11px] text-gray-600 break-words">{o.actividad_ejemplo || '—'}</td>
                                  <td className="px-2 py-2.5 text-[11px] text-gray-600 break-words">{o.materiales || '—'}</td>
                                  <td className="px-2 py-2.5">
                                    <div className="flex flex-wrap items-center justify-center gap-1">
                                      {RESULTADOS.map((r) => {
                                        const selr = reg.resultado === r.key;
                                        return (
                                          <button key={r.key} disabled={!editable} onClick={() => handleResultado(o, r.key)}
                                            title={r.label}
                                            className={`text-[10px] font-semibold px-1.5 py-1 rounded-md border whitespace-nowrap transition-all ${selr ? r.solid : `bg-white ${r.soft}`} ${!editable ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            {r.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </td>
                                  <td className="px-2 py-2.5">
                                    <ObsCell value={reg.observaciones || ''} disabled={!editable || !reg.resultado}
                                      placeholder={reg.resultado ? 'Observaciones…' : 'Marca un resultado'} onSave={(t) => handleObs(o.id, t)} />
                                  </td>
                                  <td className="px-1 py-2.5">
                                    <div className="flex flex-col items-center gap-0.5">
                                      <button onClick={() => setModalObjetivo({ mode: 'edit', bloque, data: o })} className="p-1 text-gray-400 hover:text-[#7B1FA2]"><Pencil className="w-3.5 h-3.5" /></button>
                                      <button onClick={() => setConfirmDelete(o)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                      {!editable && objetivos.length > 0 && (
                        <p className="text-[11px] text-gray-400 mt-2">
                          {sel?.estado === 'FALTA_PAGAR' ? 'Esta sesión falta pagar y agendar.' : sel?.estado === 'POR_AGENDAR' ? 'Esta sesión está comprada; falta agendar la cita para registrar.' : 'Sesión no disponible para registrar.'}
                        </p>
                      )}
                    </div>

                    {/* Progreso de objetivos del bloque */}
                    <div className="bg-gray-50/50 rounded-xl p-3">
                      <h4 className="text-xs font-bold text-gray-800 mb-2">Progreso de objetivos</h4>
                      <div className="space-y-2.5">
                        {objetivos.map((o) => {
                          const pct = Math.round(o.progreso || 0);
                          const c = progresoColor(pct);
                          return (
                            <div key={o.id}>
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[11px] font-semibold text-gray-700 truncate pr-2">{o.titulo}</span>
                                <span className="text-[11px] font-bold text-gray-800">{pct}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full ${c.bar} rounded-full`} style={{ width: `${pct}%` }} /></div>
                              <span className={`text-[9px] ${c.text}`}>{c.label}</span>
                            </div>
                          );
                        })}
                        {objetivos.length === 0 && <p className="text-[11px] text-gray-400">Sin objetivos.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modalObjetivo && <ObjetivoModal mode={modalObjetivo.mode} data={modalObjetivo.data} onClose={() => setModalObjetivo(null)} onSave={handleGuardarObjetivo} />}
      {confirmDelete && <ConfirmModal titulo="Eliminar objetivo" mensaje={`¿Eliminar "${confirmDelete.titulo}"?`} onCancel={() => setConfirmDelete(null)} onConfirm={handleEliminar} />}
      {modalVenta && <DetalleVentaModal venta={modalVenta} tipo="servicio" onClose={() => setModalVenta(null)} />}
    </div>
  );
};

const ObsCell = ({ value, disabled, placeholder, onSave }) => {
  const [v, setV] = useState(value || '');
  const ref = useRef(null);
  const ajustarAlto = () => {
    const el = ref.current;
    if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; }
  };
  useEffect(() => { setV(value || ''); }, [value]);
  useEffect(() => { ajustarAlto(); }, [v]);
  return (
    <textarea ref={ref} value={v} disabled={disabled} placeholder={placeholder} rows={1}
      onChange={(e) => setV(e.target.value)} onBlur={() => { if ((value || '') !== v) onSave(v); }}
      className="w-full text-[11px] px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] disabled:bg-gray-50 disabled:text-gray-400 resize-none overflow-hidden leading-snug break-words" />
  );
};

const Th = ({ children, className = '' }) => (
  <th className={`px-2 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide ${className}`}>{children}</th>
);

const ObjetivoModal = ({ mode, data, onClose, onSave }) => {
  const [form, setForm] = useState({
    titulo: data.titulo || '', objetivo_especifico: data.objetivo_especifico || '',
    actividad_ejemplo: data.actividad_ejemplo || '', materiales: data.materiales || '',
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <Overlay onClose={onClose}>
      <Header title={mode === 'add' ? 'Nuevo objetivo' : 'Editar objetivo'} onClose={onClose} />
      <div className="p-5 space-y-3">
        <Field label="Área" required><input value={form.titulo} onChange={(e) => set('titulo', e.target.value)} className="inp" placeholder="Ej. Motricidad Orofacial" /></Field>
        <Field label="Objetivo específico"><textarea value={form.objetivo_especifico} onChange={(e) => set('objetivo_especifico', e.target.value)} rows={2} className="inp resize-none" placeholder="Ej. Coordinar movimientos rápidos simples" /></Field>
        <Field label="Actividad / Ejemplo"><textarea value={form.actividad_ejemplo} onChange={(e) => set('actividad_ejemplo', e.target.value)} rows={2} className="inp resize-none" /></Field>
        <Field label="Materiales"><input value={form.materiales} onChange={(e) => set('materiales', e.target.value)} className="inp" /></Field>
      </div>
      <Footer onClose={onClose} onSave={() => form.titulo.trim() && onSave(form)} disabled={!form.titulo.trim()} />
      <style>{`.inp{width:100%;padding:.55rem .75rem;border:2px solid #e5e7eb;border-radius:.6rem;font-size:.85rem;outline:none}.inp:focus{border-color:#7B1FA2}`}</style>
    </Overlay>
  );
};

const Overlay = ({ children, onClose, wide }) => (
  <div className="fixed inset-0 z-[80000] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} overflow-hidden`}>{children}</div>
  </div>
);
const Header = ({ title, onClose }) => (
  <div className="bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] px-5 py-4 flex items-center justify-between">
    <h2 className="text-base font-bold text-white">{title}</h2>
    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20"><X className="w-4 h-4 text-white" /></button>
  </div>
);
const Footer = ({ onClose, onSave, disabled, saveLabel = 'Guardar' }) => (
  <div className="bg-gray-50 px-5 py-3.5 flex items-center justify-end gap-2 border-t border-gray-100">
    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50">Cancelar</button>
    <button onClick={onSave} disabled={disabled} className="px-4 py-2 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"><Check className="w-4 h-4" /> {saveLabel}</button>
  </div>
);
const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label} {required && <span className="text-red-500">*</span>}</label>
    {children}
  </div>
);
const ConfirmModal = ({ titulo, mensaje, onCancel, onConfirm }) => (
  <Overlay onClose={onCancel}>
    <div className="bg-gradient-to-r from-red-500 to-red-600 px-5 py-4 flex items-center gap-3"><AlertCircle className="w-5 h-5 text-white" /><h2 className="text-base font-bold text-white">{titulo}</h2></div>
    <div className="p-5"><p className="text-sm text-gray-700">{mensaje}</p></div>
    <div className="bg-gray-50 px-5 py-3.5 flex items-center justify-end gap-2 border-t border-gray-100">
      <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50">Cancelar</button>
      <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 flex items-center gap-1.5"><Trash2 className="w-4 h-4" /> Eliminar</button>
    </div>
  </Overlay>
);

export default PlanTerapeuticoView;
