import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ClipboardList, Plus, Check, CheckCircle2, Clock, Circle, Trash2, X,
  Pencil, Target, AlertCircle, Calendar, User as UserIcon, Timer, DollarSign,
  CalendarClock, Users, ChevronDown, ChevronLeft, ChevronRight, Search,
  Ear, MessageCircle, Brain, Eye, Smile, Hand, BookOpen, Activity, Music, Utensils,
  Layers, BarChart3
} from 'lucide-react';
import {
  getServiciosPlan, getAreasServicio, getPlan, actualizarPlan,
  crearGeneral, editarGeneral, eliminarGeneral,
  crearEspecifico, editarEspecifico, eliminarEspecifico, guardarRegistro,
  asignarObjetivoSesion, desasignarObjetivoSesion,
} from '../../services/planTerapeuticoService';
import { isAdministrador } from '../../constants/roles';

const SESIONES_POR_BLOQUE = 4;

const ESTADO_SESION = {
  REALIZADA:   { Icon: CheckCircle2, color: 'text-emerald-500', sub: null, label: 'Realizada' },
  AGENDADA:    { Icon: Clock,        color: 'text-amber-500',   sub: null, label: 'Agendada' },
  POR_AGENDAR: { Icon: Circle,       color: 'text-gray-300',    sub: 'por agendar', label: 'Por agendar' },
  FALTA_PAGAR: { Icon: DollarSign,   color: 'text-red-400',     sub: 'falta pagar', label: 'Falta pagar y agendar' },
};

const AREA_COLORS = [
  { icon: 'text-violet-600',  bg: 'bg-violet-100',  soft: 'bg-violet-50/50',  accent: 'border-violet-400',  bar: 'bg-violet-500',  dot: 'bg-violet-500' },
  { icon: 'text-sky-600',     bg: 'bg-sky-100',     soft: 'bg-sky-50/50',     accent: 'border-sky-400',     bar: 'bg-sky-500',     dot: 'bg-sky-500' },
  { icon: 'text-emerald-600', bg: 'bg-emerald-100', soft: 'bg-emerald-50/50', accent: 'border-emerald-400', bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
  { icon: 'text-amber-600',   bg: 'bg-amber-100',   soft: 'bg-amber-50/50',   accent: 'border-amber-400',   bar: 'bg-amber-500',   dot: 'bg-amber-500' },
  { icon: 'text-rose-600',    bg: 'bg-rose-100',    soft: 'bg-rose-50/50',    accent: 'border-rose-400',    bar: 'bg-rose-500',    dot: 'bg-rose-500' },
  { icon: 'text-cyan-600',    bg: 'bg-cyan-100',    soft: 'bg-cyan-50/50',    accent: 'border-cyan-400',    bar: 'bg-cyan-500',    dot: 'bg-cyan-500' },
];
const coloresPorGeneral = (generales) => {
  const m = {};
  (generales || []).forEach((g, i) => { m[g.id] = AREA_COLORS[i % AREA_COLORS.length]; });
  return m;
};

const COLOR_RES = {
  red:     { solid: 'bg-red-500 text-white border-red-500',         soft: 'text-red-600 border-red-200 hover:bg-red-50' },
  amber:   { solid: 'bg-amber-500 text-white border-amber-500',     soft: 'text-amber-600 border-amber-200 hover:bg-amber-50' },
  emerald: { solid: 'bg-emerald-500 text-white border-emerald-500', soft: 'text-emerald-600 border-emerald-200 hover:bg-emerald-50' },
};

const progresoColor = (pct) => {
  if (pct >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-600', stroke: '#10b981', label: 'Óptimo' };
  if (pct >= 40) return { bar: 'bg-amber-500', text: 'text-amber-600', stroke: '#f59e0b', label: 'En proceso' };
  return { bar: 'bg-red-500', text: 'text-red-600', stroke: '#ef4444', label: 'En riesgo' };
};
const estadoEsp = (pct) => {
  if (pct >= 80) return { label: 'Logrado', text: 'text-emerald-700', bg: 'bg-emerald-50' };
  if (pct >= 40) return { label: 'En proceso', text: 'text-amber-700', bg: 'bg-amber-50' };
  return { label: 'No logrado', text: 'text-red-700', bg: 'bg-red-50' };
};
const ICONOS_AREA = [
  { kw: ['comprens', 'recept', 'escucha', 'auditiv'], Icon: Ear },
  { kw: ['expres', 'morfosint', 'articul', 'fonolog', 'habla', 'lenguaje', 'verbal'], Icon: MessageCircle },
  { kw: ['pragmat', 'social', 'comunic', 'interacc'], Icon: Users },
  { kw: ['cognit', 'atenc', 'memoria', 'pensam', 'razon'], Icon: Brain },
  { kw: ['sensor', 'visual', 'percep', 'mirada'], Icon: Eye },
  { kw: ['emocion', 'conduct', 'afect'], Icon: Smile },
  { kw: ['fino', 'grafo', 'escritura', 'manual', 'motriz fina'], Icon: Hand },
  { kw: ['lectur', 'lecto', 'academ', 'preacadem'], Icon: BookOpen },
  { kw: ['motor', 'motriz', 'movim', 'postur', 'gruesa', 'equilibr'], Icon: Activity },
  { kw: ['oral', 'deglu', 'aliment', 'mastic', 'succion'], Icon: Utensils },
  { kw: ['ritmo', 'musical', 'prosod'], Icon: Music },
];
const areaIcon = (nombre = '') => {
  const n = String(nombre).toLowerCase();
  const found = ICONOS_AREA.find((m) => m.kw.some((k) => n.includes(k)));
  return found ? found.Icon : Target;
};
const hoyISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const fmtFecha = (f, year) => {
  if (!f) return null;
  const d = new Date(String(f).slice(0, 10) + 'T00:00:00');
  return isNaN(d) ? null : d.toLocaleDateString('es-PE', year ? { day: '2-digit', month: '2-digit', year: 'numeric' } : { day: '2-digit', month: '2-digit' });
};

// ── Toast ──
const Toast = ({ tipo, texto, onClose }) => (
  <div className="fixed top-6 right-6 z-[90000] flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-xl shadow-purple-900/10 border border-gray-100">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
      tipo === 'success' ? 'bg-[#A3C644]/15' : 'bg-red-50'
    }`}>
      {tipo === 'success'
        ? <Check className="w-4 h-4 text-[#8FB82D]" />
        : <AlertCircle className="w-4 h-4 text-red-500" />}
    </div>
    <span className="text-xs font-semibold text-gray-700">{texto}</span>
    <button onClick={onClose} className="ml-1 text-gray-400 hover:text-gray-600">
      <X className="w-4 h-4" />
    </button>
  </div>
);

const PlanTerapeuticoView = ({ pacienteId, user }) => {
  const [servicios, setServicios] = useState([]);
  const [servicioId, setServicioId] = useState(null);
  const [plan, setPlan] = useState(null);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sesionActiva, setSesionActiva] = useState(1);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });
  const [modalGeneral, setModalGeneral] = useState(null);
  const [modalEspecifico, setModalEspecifico] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const toast = (tipo, texto) => { setMsg({ tipo, texto }); setTimeout(() => setMsg({ tipo: '', texto: '' }), 3500); };

  useEffect(() => {
    if (!pacienteId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getServiciosPlan(pacienteId);
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
    const data = await getPlan(pacienteId, sid);
    setPlan(data);
    return data;
  };

  useEffect(() => {
    if (!servicioId) return;
    (async () => {
      try {
        setLoading(true);
        const [data, ar] = await Promise.all([getPlan(pacienteId, servicioId), getAreasServicio(servicioId)]);
        setPlan(data);
        setAreas(ar || []);
        const hoy = hoyISO();
        const sesiones = data?.sesiones || [];
        const deHoy = sesiones.find((s) => s.fecha && String(s.fecha).slice(0, 10) === hoy);
        const pend = sesiones.find((s) => s.estado !== 'REALIZADA');
        setSesionActiva((deHoy || pend || sesiones[sesiones.length - 1])?.numero_sesion || 1);
      } catch (e) {
        toast('error', e.response?.data?.message || 'Error al cargar el plan');
      } finally {
        setLoading(false);
      }
    })();
  }, [servicioId]);

  const generales = plan?.generales || [];
  const sesiones = plan?.sesiones || [];
  const resultados = plan?.catalogos?.resultados || [];
  const maxGen = plan?.limites?.max_generales ?? 3;
  const maxEsp = plan?.limites?.max_especificos ?? 3;
  const puedeGestionar = plan?.permisos?.gestionar_objetivos ?? true;
  const esAdmin = isAdministrador(user);
  const servicioSel = servicios.find((s) => s.servicio_id === servicioId) || null;
  const sesionSel = useMemo(() => sesiones.find((s) => s.numero_sesion === sesionActiva) || null, [sesiones, sesionActiva]);
  const areasUsadas = new Set(generales.map((g) => g.area_id));

  const handleGuardarGeneral = async (form) => {
    const esNuevo = modalGeneral.mode === 'add';
    try {
      if (esNuevo) await crearGeneral({ plan_id: plan.plan.id, ...form });
      else await editarGeneral(modalGeneral.data.id, form);
      setModalGeneral(null);
      await recargarPlan();
      toast('success', esNuevo ? 'Objetivo general creado correctamente' : 'Objetivo general editado correctamente');
    } catch (e) { toast('error', e.response?.data?.message || (esNuevo ? 'No se pudo crear el objetivo general' : 'No se pudo editar el objetivo general')); }
  };
  const handleGuardarEspecifico = async (form) => {
    const esNuevo = modalEspecifico.mode === 'add';
    try {
      if (esNuevo) await crearEspecifico({ objetivo_general_id: modalEspecifico.generalId, ...form });
      else await editarEspecifico(modalEspecifico.data.id, form);
      setModalEspecifico(null);
      await recargarPlan();
      toast('success', esNuevo ? 'Objetivo específico creado correctamente' : 'Objetivo específico editado correctamente');
    } catch (e) { toast('error', e.response?.data?.message || (esNuevo ? 'No se pudo crear el objetivo específico' : 'No se pudo editar el objetivo específico')); }
  };
  const handleEliminar = async () => {
    const esGeneral = confirmDelete.tipo === 'general';
    try {
      if (esGeneral) await eliminarGeneral(confirmDelete.id);
      else await eliminarEspecifico(confirmDelete.id);
      setConfirmDelete(null);
      await recargarPlan();
      toast('success', esGeneral ? 'Objetivo general eliminado correctamente' : 'Objetivo específico eliminado correctamente');
    } catch (e) { toast('error', e.response?.data?.message || (esGeneral ? 'No se pudo eliminar el objetivo general' : 'No se pudo eliminar el objetivo específico')); }
  };

  const guardarCampoRegistro = async (esp, cambios, msgError) => {
    const reg = esp.registros?.[sesionActiva] || {};
    try {
      await guardarRegistro({
        objetivo_especifico_id: esp.id,
        numero_sesion: sesionActiva,
        resultado: reg.resultado_codigo ?? null,
        observaciones: reg.observaciones ?? null,
        actividad: reg.actividad ?? null,
        materiales: reg.materiales ?? null,
        ...cambios,
      });
      await recargarPlan();
    } catch (e) { toast('error', e.response?.data?.message || msgError); }
  };
  const handleResultado = (esp, codigo) => guardarCampoRegistro(esp, { resultado: codigo }, 'No se pudo registrar el resultado');
  const handleObs = (esp, observaciones) => guardarCampoRegistro(esp, { observaciones }, 'No se pudo guardar la observación');
  const handleActividad = (esp, actividad) => guardarCampoRegistro(esp, { actividad }, 'No se pudo guardar la actividad');
  const handleMateriales = (esp, materiales) => guardarCampoRegistro(esp, { materiales }, 'No se pudieron guardar los materiales');

  const handleGuardarObjetivosSesion = async (numeroSesion, addIds, removeIds) => {
    try {
      await Promise.all([
        ...addIds.map((id) => asignarObjetivoSesion({ objetivo_especifico_id: id, numero_sesion: numeroSesion })),
        ...removeIds.map((id) => desasignarObjetivoSesion(id, numeroSesion)),
      ]);
      await recargarPlan();
      if (addIds.length || removeIds.length) toast('success', 'Objetivos de la sesión actualizados');
    } catch (e) { toast('error', e.response?.data?.message || 'No se pudieron actualizar los objetivos'); }
  };

  const handleCrearObjetivoEnSesion = async ({ generalId, areaId, descripcion, actividad, materiales }) => {
    try {
      let gid = generalId;
      if (!gid && areaId) {
        const cg = await crearGeneral({
          plan_id: plan.plan.id,
          area_id: areaId,
          frecuencia_id: null,
          descripcion: null,
          plazo_sesiones: null,
          fecha_inicio: null,
          fecha_logro_est: null,
        });
        gid = cg?.id ?? cg?.general?.id;
        if (!gid) {
          const data = await recargarPlan();
          gid = (data?.generales || []).find((g) => g.area_id === areaId)?.id;
        }
      }
      if (!gid) throw new Error('No se pudo determinar el área del objetivo');

      const ce = await crearEspecifico({ objetivo_general_id: gid, descripcion });
      let eid = ce?.id ?? ce?.especifico?.id;
      if (!eid) {
        const data = await recargarPlan();
        const g = (data?.generales || []).find((x) => x.id === gid);
        eid = [...(g?.especificos || [])].reverse().find((e) => e.descripcion === descripcion)?.id;
      }
      if (!eid) throw new Error('No se pudo crear el objetivo específico');

      await asignarObjetivoSesion({ objetivo_especifico_id: eid, numero_sesion: sesionActiva });

      const actTrim = (actividad || '').trim();
      const matTrim = (materiales || '').trim();
      if (actTrim || matTrim) {
        await guardarRegistro({
          objetivo_especifico_id: eid,
          numero_sesion: sesionActiva,
          resultado: null,
          observaciones: null,
          actividad: actTrim || null,
          materiales: matTrim || null,
        });
      }

      await recargarPlan();
      toast('success', `Objetivo agregado a la Sesión ${sesionActiva}`);
    } catch (e) {
      toast('error', e.response?.data?.message || e.message || 'No se pudo agregar el objetivo');
    }
  };

  if (loading && !plan) {
    return (
      <div className="glass-panel rounded-3xl p-5">
        <div className="flex items-center justify-center py-12">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-purple-100 rounded-full" />
            <div className="absolute inset-0 border-2 border-transparent border-t-[#7B1FA2] rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!servicios.length) {
    return (
      <div className="glass-panel rounded-3xl p-5">
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-8 h-8 text-[#7B1FA2]/40" />
          </div>
          <p className="text-sm font-semibold text-gray-500">Sin servicios de terapia</p>
          <p className="text-xs text-gray-400 mt-1">Este paciente no tiene sesiones de terapia asignadas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {msg.texto && <Toast tipo={msg.tipo} texto={msg.texto} onClose={() => setMsg({ tipo: '', texto: '' })} />}

      {/* Selector de servicio */}
      <div className="glass-panel rounded-3xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-500/20">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-extrabold text-[#2D0A4E] leading-tight">Plan Terapéutico</h2>
            <p className="text-[13px] text-gray-400">
              Objetivos y registro por sesión
              {servicioSel?.terapeuta_nombre && ` · Terapeuta: ${servicioSel.terapeuta_nombre}`}
            </p>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-gray-200 to-transparent mb-4" />

        <div className="flex gap-2 overflow-x-auto pb-1">
          {servicios.map((sv) => {
            const activo = sv.servicio_id === servicioId;
            return (
              <button
                key={sv.servicio_id}
                onClick={() => setServicioId(sv.servicio_id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  activo
                    ? 'bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white shadow-lg shadow-purple-500/20'
                    : 'bg-[#F5F0FA] text-gray-600 hover:bg-purple-100/70'
                }`}
              >
                {sv.servicio_nombre}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activo ? 'bg-white/25 text-white' : 'bg-white text-[#7B1FA2]'
                }`}>
                  {sv.total_sesiones}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Plan de tratamiento */}
      <SeccionPlan
        plan={plan} generales={generales} maxGen={maxGen} maxEsp={maxEsp}
        puedeGestionar={puedeGestionar} esAdmin={esAdmin}
        onAddGeneral={() => setModalGeneral({ mode: 'add', data: {} })}
        onEditGeneral={(g) => setModalGeneral({ mode: 'edit', data: g })}
        onDeleteGeneral={(g) => setConfirmDelete({ tipo: 'general', id: g.id, label: g.area_nombre })}
        onAddEspecifico={(g) => setModalEspecifico({ mode: 'add', generalId: g.id, data: {} })}
        onEditEspecifico={(g, e) => setModalEspecifico({ mode: 'edit', generalId: g.id, data: e })}
        onDeleteEspecifico={(e) => setConfirmDelete({ tipo: 'especifico', id: e.id, label: e.descripcion })}
      />

      {/* Separador */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registro por sesión</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      {/* Sesiones */}
      <SeccionSesiones
        generales={generales} sesiones={sesiones} resultados={resultados}
        areas={areas} areasUsadas={areasUsadas} maxGen={maxGen} maxEsp={maxEsp}
        sesionActiva={sesionActiva} setSesionActiva={setSesionActiva} sesionSel={sesionSel}
        puedeGestionar={puedeGestionar} esAdmin={esAdmin}
        onResultado={handleResultado} onObs={handleObs}
        onActividad={handleActividad} onMateriales={handleMateriales}
        onGuardarObjetivos={handleGuardarObjetivosSesion}
        onCrearObjetivo={handleCrearObjetivoEnSesion}
        onEditEspecifico={(e) => setModalEspecifico({ mode: 'edit', generalId: e.objetivo_general_id, data: e })}
      />

      {modalGeneral && (
        <GeneralModal mode={modalGeneral.mode} data={modalGeneral.data} areas={areas}
          areasUsadas={areasUsadas} frecuencias={plan?.catalogos?.frecuencias || []}
          onClose={() => setModalGeneral(null)} onSave={handleGuardarGeneral} />
      )}
      {modalEspecifico && (
        <EspecificoModal mode={modalEspecifico.mode} data={modalEspecifico.data}
          onClose={() => setModalEspecifico(null)} onSave={handleGuardarEspecifico} />
      )}
      {confirmDelete && (
        <ConfirmModal titulo={confirmDelete.tipo === 'general' ? 'Eliminar objetivo general' : 'Eliminar objetivo específico'}
          mensaje={`¿Eliminar "${confirmDelete.label}"?${confirmDelete.tipo === 'general' ? ' Se eliminarán también sus específicos y registros.' : ''}`}
          onCancel={() => setConfirmDelete(null)} onConfirm={handleEliminar} />
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// SECCIÓN · Sesiones
// ════════════════════════════════════════════════════════════════════
const SeccionSesiones = ({ generales, sesiones, resultados, areas, areasUsadas, maxGen, maxEsp, sesionActiva, setSesionActiva, sesionSel, puedeGestionar, esAdmin, onResultado, onObs, onActividad, onMateriales, onGuardarObjetivos, onCrearObjetivo, onEditEspecifico }) => {
  const filasTodas = useMemo(
    () => generales.flatMap((g) => (g.especificos || []).map((e) => ({ ...e, area_nombre: g.area_nombre }))),
    [generales],
  );
  const filas = useMemo(
    () => filasTodas.filter((e) => (e.sesiones_asignadas || []).includes(sesionActiva)),
    [filasTodas, sesionActiva],
  );
  const grupos = useMemo(() => {
    const out = [];
    filas.forEach((e) => {
      const key = e.objetivo_general_id ?? e.area_nombre;
      const last = out[out.length - 1];
      if (last && last.key === key) last.items.push(e);
      else out.push({ key, area_nombre: e.area_nombre, items: [e] });
    });
    return out;
  }, [filas]);
  const colorGen = useMemo(() => coloresPorGeneral(generales), [generales]);
  const [agregarOpen, setAgregarOpen] = useState(false);
  const [confirmQuitar, setConfirmQuitar] = useState(null);
  const editable = !!sesionSel?.puede_registrar;

  const bloquesOrden = useMemo(() => {
    const out = [];
    for (let i = 0; i < sesiones.length; i += SESIONES_POR_BLOQUE) {
      out.push({ bloque: sesiones.slice(i, i + SESIONES_POR_BLOQUE), bi: out.length });
    }
    return out.reverse();
  }, [sesiones]);

  const BLOQUES_POR_PAGINA = 4;
  const totalBloques = bloquesOrden.length;
  const totalPaginas = Math.max(1, Math.ceil(totalBloques / BLOQUES_POR_PAGINA));
  const [pagina, setPagina] = useState(0);
  const [bloqueAbierto, setBloqueAbierto] = useState(0);
  const pag = Math.min(pagina, totalPaginas - 1);

  useEffect(() => {
    const idx = sesiones.findIndex((s) => s.numero_sesion === sesionActiva);
    if (idx < 0) return;
    const bi = Math.floor(idx / SESIONES_POR_BLOQUE);
    setBloqueAbierto(bi);
    const posReciente = (totalBloques - 1) - bi;
    setPagina(Math.floor(posReciente / BLOQUES_POR_PAGINA));
  }, [sesionActiva, sesiones, totalBloques]);

  const bloquesPagina = bloquesOrden.slice(pag * BLOQUES_POR_PAGINA, pag * BLOQUES_POR_PAGINA + BLOQUES_POR_PAGINA);

  return (
    <div className="space-y-3">
      <div className="glass-panel rounded-3xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 ring-1 ring-black/[0.03]">
            <CalendarClock className="w-5 h-5 text-[#7B1FA2]" />
          </div>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap">Sesiones</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
        </div>

        <div className="space-y-2">
          {bloquesPagina.map(({ bloque, bi }) => {
            const abierto = bloqueAbierto === bi;
            const realizadas = bloque.filter((s) => s.estado === 'REALIZADA').length;
            const desdeF = fmtFecha(bloque[0]?.fecha);
            const hastaF = fmtFecha(bloque[bloque.length - 1]?.fecha);
            const rango = desdeF && hastaF ? `${desdeF}–${hastaF}` : (desdeF || hastaF || 'sin fecha');
            return (
              <div key={bi} className={`rounded-2xl bg-[#F5F0FA] overflow-hidden transition-all ${abierto ? 'shadow-md ring-1 ring-purple-200/60' : 'hover:shadow-sm'}`}>
                <button onClick={() => setBloqueAbierto(abierto ? -1 : bi)}
                  className={`w-full flex items-center gap-2 px-4 py-3 transition-colors ${abierto ? 'bg-purple-50/40' : 'hover:bg-purple-50/20'}`}>
                  <CalendarClock className="w-4 h-4 text-[#7B1FA2] flex-shrink-0" />
                  <span className="text-sm font-bold text-gray-800 whitespace-nowrap">Bloque {bi + 1}</span>
                  <span className="text-[11px] text-gray-500 truncate">{rango}</span>
                  <span className="ml-auto text-[10px] font-semibold text-gray-500 whitespace-nowrap">{realizadas}/{bloque.length}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${abierto ? 'rotate-180' : ''}`} />
                </button>
                {abierto && (
                  <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-purple-100/40 bg-white/50">
                    {bloque.map((s) => {
                      const est = ESTADO_SESION[s.estado] || ESTADO_SESION.POR_AGENDAR;
                      const Icon = est.Icon;
                      const activa = s.numero_sesion === sesionActiva;
                      return (
                        <button key={s.numero_sesion} onClick={() => setSesionActiva(s.numero_sesion)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all text-left ${
                            activa
                              ? 'border-[#7B1FA2] bg-purple-50 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-purple-200'
                          }`}>
                          <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${est.color}`} />
                          <span className="min-w-0">
                            <span className="block text-[13px] font-bold text-gray-800 leading-tight">Sesión {s.numero_sesion}</span>
                            <span className="block text-[10px] text-gray-400 truncate">{fmtFecha(s.fecha) || est.sub}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {sesiones.length === 0 && <p className="text-sm text-gray-400 py-2">No hay sesiones agendadas todavía.</p>}

          {totalPaginas > 1 && (
            <div className="flex items-center justify-between pt-1">
              <button onClick={() => setPagina((p) => Math.max(0, p - 1))} disabled={pag === 0}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-purple-50 hover:border-purple-200 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="w-3.5 h-3.5" /> Recientes
              </button>
              <span className="text-[11px] text-gray-400">Página {pag + 1} de {totalPaginas}</span>
              <button onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))} disabled={pag >= totalPaginas - 1}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-purple-50 hover:border-purple-200 disabled:opacity-40 disabled:cursor-not-allowed">
                Antiguos <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {sesionSel && (
          <div className="flex items-center gap-4 flex-wrap mt-3 px-3 py-2.5 bg-[#F5F0FA] rounded-2xl text-[11px]">
            <span className="flex items-center gap-1.5 text-gray-600">
              <Calendar className="w-3.5 h-3.5 text-[#7B1FA2]" />
              {fmtFecha(sesionSel.fecha, true) || (ESTADO_SESION[sesionSel.estado]?.sub || '—')}{sesionSel.hora_inicio ? ` · ${String(sesionSel.hora_inicio).slice(0, 5)}` : ''}
            </span>
            {sesionSel.terapeuta_nombre && <span className="flex items-center gap-1.5 text-gray-600"><UserIcon className="w-3.5 h-3.5 text-gray-400" /> {sesionSel.terapeuta_nombre}</span>}
            {sesionSel.duracion_minutos != null && <span className="flex items-center gap-1.5 text-gray-600"><Timer className="w-3.5 h-3.5 text-gray-400" /> {sesionSel.duracion_minutos} min</span>}
            <span className="ml-auto flex items-center gap-1.5"><span className="text-gray-400">Estado:</span>
              <span className={`px-2.5 py-1 rounded-full font-semibold ${
                sesionSel.estado === 'REALIZADA' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                sesionSel.estado === 'AGENDADA' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                sesionSel.estado === 'FALTA_PAGAR' ? 'bg-red-50 text-red-600 border border-red-200' :
                'bg-gray-100 text-gray-500 border border-gray-200'
              }`}>
                {sesionSel.estado_nombre || ESTADO_SESION[sesionSel.estado]?.label}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Tabla de registro */}
      <div className="glass-panel rounded-3xl overflow-visible">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-gray-800">Registro de la sesión</h4>
            <p className="text-[11px] text-gray-400">Objetivos de la Sesión {sesionActiva}</p>
          </div>
          {puedeGestionar && (
            <button onClick={() => setAgregarOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] hover:from-[#6A1B9A] hover:to-[#8E24AA] px-4 py-2 rounded-full shadow-lg shadow-purple-500/20">
              <Plus className="w-3.5 h-3.5" /> Agregar objetivo
            </button>
          )}
        </div>
        {filas.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10 px-4">
            {`Esta sesión aún no tiene objetivos. Usa "Agregar objetivo" para crear uno nuevo o reutilizar uno existente.`}
          </p>
        ) : (
          <>
            {/* Vista móvil */}
            <div className="md:hidden divide-y divide-gray-100">
              {grupos.map((grupo) => {
                const AreaIcon = areaIcon(grupo.area_nombre);
                const col = colorGen[grupo.key] || AREA_COLORS[0];
                return grupo.items.map((e) => {
                  const reg = e.registros?.[sesionActiva] || {};
                  const resultadoBloqueado   = !esAdmin && !!reg.resultado_codigo;
                  const actividadBloqueada   = !esAdmin && !!(reg.actividad && String(reg.actividad).trim());
                  const materialesBloqueados = !esAdmin && !!(reg.materiales && String(reg.materiales).trim());
                  const obsBloqueada         = !esAdmin && !!(reg.observaciones && String(reg.observaciones).trim());
                  return (
                    <div key={e.id} className={`p-4 space-y-3 border-l-4 ${col.accent}`}>
                      <div className="flex items-start gap-2">
                        <div className={`w-8 h-8 rounded-lg ${col.bg} flex items-center justify-center flex-shrink-0`}>
                          <AreaIcon className={`w-4 h-4 ${col.icon}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[10px] font-semibold uppercase tracking-wide ${col.icon}`}>{grupo.area_nombre}</p>
                          <p className="text-xs text-gray-700 break-words leading-snug">{e.descripcion}</p>
                        </div>
                        <span className="flex items-center gap-0.5 flex-shrink-0">
                          {esAdmin && (
                            <button onClick={() => onEditEspecifico(e)} title="Editar objetivo específico" className="p-1 text-gray-400 hover:text-[#7B1FA2]"><Pencil className="w-3.5 h-3.5" /></button>
                          )}
                          {puedeGestionar && (
                            <button onClick={() => setConfirmQuitar(e)} title="Quitar objetivo de esta sesión" className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                          )}
                        </span>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Resultado</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {resultados.map((r) => {
                            const sel = reg.resultado_codigo === r.codigo;
                            const cc = COLOR_RES[r.color] || COLOR_RES.amber;
                            return (
                              <button key={r.codigo} disabled={!editable || resultadoBloqueado} onClick={() => onResultado(e, r.codigo)} title={r.nombre}
                                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap transition-all ${sel ? `${cc.solid} shadow-sm` : `bg-white ${cc.soft}`} ${(!editable || resultadoBloqueado) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                                {r.nombre}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Actividad / Ejemplo</p>
                        <ObsCell value={reg.actividad || ''} disabled={!editable || !puedeGestionar} locked={actividadBloqueada}
                          placeholder={puedeGestionar ? 'Actividad / ejemplo…' : '—'} onSave={(t) => onActividad(e, t)} />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Materiales</p>
                        <ObsCell value={reg.materiales || ''} disabled={!editable || !puedeGestionar} locked={materialesBloqueados}
                          placeholder={puedeGestionar ? 'Materiales…' : '—'} onSave={(t) => onMateriales(e, t)} />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Observaciones</p>
                        <ObsCell value={reg.observaciones || ''} disabled={!editable || obsBloqueada}
                          placeholder="Observaciones…" onSave={(t) => onObs(e, t)} />
                      </div>
                    </div>
                  );
                });
              })}
            </div>

            {/* Vista escritorio */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm table-fixed">
                <colgroup>
                  <col style={{ width: '12%' }} /><col style={{ width: '19%' }} /><col style={{ width: '14%' }} />
                  <col style={{ width: '12%' }} /><col style={{ width: '25%' }} /><col style={{ width: '18%' }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-100 text-left bg-purple-50/40">
                    <Th>Área de trabajo</Th><Th>Objetivo específico</Th><Th>Actividad / Ejemplo</Th>
                    <Th>Materiales</Th><Th className="text-center">Resultado</Th><Th>Observaciones</Th>
                  </tr>
                </thead>
                <tbody>
                  {grupos.map((grupo) => {
                    const AreaIcon = areaIcon(grupo.area_nombre);
                    const col = colorGen[grupo.key] || AREA_COLORS[0];
                    return grupo.items.map((e, i) => {
                      const reg = e.registros?.[sesionActiva] || {};
                      const ultimo = i === grupo.items.length - 1;
                      const resultadoBloqueado  = !esAdmin && !!reg.resultado_codigo;
                      const actividadBloqueada  = !esAdmin && !!(reg.actividad && String(reg.actividad).trim());
                      const materialesBloqueados = !esAdmin && !!(reg.materiales && String(reg.materiales).trim());
                      const obsBloqueada        = !esAdmin && !!(reg.observaciones && String(reg.observaciones).trim());
                      return (
                        <tr key={e.id} className={`align-top hover:bg-gray-50/40 transition-colors ${ultimo ? 'border-b border-gray-100' : ''}`}>
                          {i === 0 && (
                            <td rowSpan={grupo.items.length} className={`px-2 py-2.5 ${col.soft} border-l-4 ${col.accent} border-r border-gray-100 align-middle`}>
                              <div className="flex flex-col items-center text-center gap-1">
                                <div className={`w-7 h-7 rounded-lg ${col.bg} flex items-center justify-center flex-shrink-0`}>
                                  <AreaIcon className={`w-3.5 h-3.5 ${col.icon}`} />
                                </div>
                                <p className={`font-semibold leading-tight break-words text-[11px] ${col.icon}`}>{grupo.area_nombre}</p>
                              </div>
                            </td>
                          )}
                          <td className="px-2 py-2.5 text-[11px] text-gray-700 break-words">
                            <div className="group/obj flex items-start justify-between gap-1">
                              <span>{e.descripcion}</span>
                              <span className="flex items-center gap-0.5 opacity-0 group-hover/obj:opacity-100 transition-opacity flex-shrink-0">
                                {esAdmin && (
                                  <button onClick={() => onEditEspecifico(e)} title="Editar objetivo específico"
                                    className="p-0.5 text-gray-300 hover:text-[#7B1FA2]">
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                )}
                                {puedeGestionar && (
                                  <button onClick={() => setConfirmQuitar(e)} title="Quitar objetivo de esta sesión"
                                    className="p-0.5 text-gray-300 hover:text-red-500">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-2.5">
                            <ObsCell value={reg.actividad || ''} disabled={!editable || !puedeGestionar} locked={actividadBloqueada}
                              placeholder={puedeGestionar ? 'Actividad / ejemplo…' : '—'} onSave={(t) => onActividad(e, t)} />
                          </td>
                          <td className="px-2 py-2.5">
                            <ObsCell value={reg.materiales || ''} disabled={!editable || !puedeGestionar} locked={materialesBloqueados}
                              placeholder={puedeGestionar ? 'Materiales…' : '—'} onSave={(t) => onMateriales(e, t)} />
                          </td>
                          <td className="px-2 py-2.5">
                            <div className="flex items-center justify-center gap-1">
                              {resultados.map((r) => {
                                const sel = reg.resultado_codigo === r.codigo;
                                const cc = COLOR_RES[r.color] || COLOR_RES.amber;
                                return (
                                  <button key={r.codigo} disabled={!editable || resultadoBloqueado} onClick={() => onResultado(e, r.codigo)} title={r.nombre}
                                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border whitespace-nowrap transition-all ${sel ? `${cc.solid} shadow-sm` : `bg-white ${cc.soft}`} ${(!editable || resultadoBloqueado) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                                    {r.nombre}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-2 py-2.5">
                            <ObsCell value={reg.observaciones || ''} disabled={!editable || obsBloqueada}
                              placeholder="Observaciones…" onSave={(t) => onObs(e, t)} />
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        {!editable && filas.length > 0 && (
          <p className="text-[11px] text-gray-400 px-5 py-3 border-t border-gray-50">
            {sesionSel?.estado === 'FALTA_PAGAR' ? 'Esta sesión falta pagar y agendar.' : sesionSel?.estado === 'POR_AGENDAR' ? 'Sesión comprada; falta agendar la cita para registrar.' : 'Sesión no disponible para registrar.'}
          </p>
        )}
      </div>

      {agregarOpen && (
        <AgregarObjetivoModal sesion={sesionActiva} generales={generales} areas={areas}
          areasUsadas={areasUsadas} maxGen={maxGen} maxEsp={maxEsp} puedeGestionar={puedeGestionar}
          onClose={() => setAgregarOpen(false)}
          onCrear={onCrearObjetivo}
          onAsignarExistentes={(addIds) => onGuardarObjetivos(sesionActiva, addIds, [])} />
      )}

      {confirmQuitar && (
        <ConfirmModal titulo="Quitar objetivo de la sesión"
          mensaje={`¿Quitar "${confirmQuitar.descripcion}" de la Sesión ${sesionActiva}? Se borrarán los registros (resultado, observaciones, actividad y materiales) de este objetivo en esa sesión.`}
          onCancel={() => setConfirmQuitar(null)}
          onConfirm={() => { onGuardarObjetivos(sesionActiva, [], [confirmQuitar.id]); setConfirmQuitar(null); }} />
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// MODAL · Agregar objetivo
// ════════════════════════════════════════════════════════════════════
const AgregarObjetivoModal = ({ sesion, generales, areas, areasUsadas, maxGen, maxEsp, onClose, onCrear, onAsignarExistentes }) => {
  const [modo, setModo] = useState('nuevo');
  const areasNuevas = (areas || []).filter((a) => !areasUsadas?.has(a.id));
  const puedeCrearArea = generales.length < maxGen;
  const [areaSel, setAreaSel] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [actividad, setActividad] = useState('');
  const [materiales, setMateriales] = useState('');

  const parsed = useMemo(() => {
    if (!areaSel) return { generalId: null, areaId: null };
    const [t, id] = areaSel.split(':');
    return t === 'g' ? { generalId: Number(id), areaId: null } : { generalId: null, areaId: Number(id) };
  }, [areaSel]);
  const generalSel = parsed.generalId ? generales.find((g) => g.id === parsed.generalId) : null;
  const generalLleno = generalSel && (generalSel.especificos?.length || 0) >= maxEsp;
  const puedeGuardarNuevo = !!areaSel && descripcion.trim() && !generalLleno;

  const guardarNuevo = () => {
    if (!puedeGuardarNuevo) return;
    onCrear({ generalId: parsed.generalId, areaId: parsed.areaId, descripcion: descripcion.trim(), actividad, materiales });
    onClose();
  };

  const [q, setQ] = useState('');
  const [checked, setChecked] = useState(() => new Set());
  const ql = q.trim().toLowerCase();
  const norm = (s) => (s || '').toLowerCase();
  const disponibles = useMemo(
    () => generales
      .map((g) => ({ g, items: (g.especificos || []).filter((e) => !(e.sesiones_asignadas || []).includes(sesion)) }))
      .filter((x) => x.items.length),
    [generales, sesion],
  );
  const hayDisponibles = disponibles.length > 0;
  const toggle = (id) => setChecked((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const guardarExistentes = () => { if (checked.size) { onAsignarExistentes([...checked]); onClose(); } };

  return (
    <Overlay onClose={onClose} wide>
      <Header title={`Agregar objetivo · Sesión ${sesion}`} onClose={onClose} />
      <div className="px-5 pt-3 flex gap-1">
        {[['nuevo', 'Nuevo objetivo'], ['existente', 'Reutilizar existente']].map(([k, label]) => (
          <button key={k} onClick={() => setModo(k)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              modo === k
                ? 'bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white shadow-lg shadow-purple-500/20'
                : 'text-gray-600 hover:bg-purple-50'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {modo === 'nuevo' ? (
        <>
          <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
            <Field label="Área de trabajo" required>
              <select value={areaSel} onChange={(e) => setAreaSel(e.target.value)} className="inp">
                <option value="">Selecciona un área…</option>
                {generales.length > 0 && (
                  <optgroup label="Áreas del plan">
                    {generales.map((g) => (
                      <option key={`g${g.id}`} value={`g:${g.id}`}>
                        {g.area_nombre}{(g.especificos?.length || 0) >= maxEsp ? ' (lleno)' : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                {puedeCrearArea && areasNuevas.length > 0 && (
                  <optgroup label="Crear nueva área">
                    {areasNuevas.map((a) => <option key={`a${a.id}`} value={`a:${a.id}`}>＋ {a.nombre}</option>)}
                  </optgroup>
                )}
              </select>
            </Field>
            {generalLleno && <p className="text-[11px] text-red-500">Esta área ya tiene el máximo de {maxEsp} objetivos. Elige otra área.</p>}
            <Field label="Objetivo específico" required>
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} className="inp resize-none" placeholder="Ej. Sigue instrucciones de 1 paso" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Actividad / ejemplo"><textarea value={actividad} onChange={(e) => setActividad(e.target.value)} rows={2} className="inp resize-none" placeholder="Opcional" /></Field>
              <Field label="Materiales"><textarea value={materiales} onChange={(e) => setMateriales(e.target.value)} rows={2} className="inp resize-none" placeholder="Opcional" /></Field>
            </div>
            <p className="text-[11px] text-gray-400">El objetivo se creará y quedará asignado a la Sesión {sesion}. La actividad y los materiales son opcionales; puedes editarlos luego en la tabla.</p>
          </div>
          <Footer onClose={onClose} onSave={guardarNuevo} disabled={!puedeGuardarNuevo} saveLabel="Crear y agregar" />
        </>
      ) : (
        <>
          <div className="px-5 pt-4">
            <p className="text-[11px] text-gray-400 mb-2">Reutiliza un objetivo ya definido (que no esté en esta sesión) en la Sesión {sesion}.</p>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar objetivo…"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-[#7B1FA2]/15 transition-shadow" />
            </div>
          </div>
          <div className="px-5 py-3 max-h-[50vh] overflow-y-auto space-y-4">
            {!hayDisponibles && (
              <p className="text-sm text-gray-400 text-center py-6">No hay objetivos para reutilizar. Crea uno nuevo en la pestaña “Nuevo objetivo”.</p>
            )}
            {disponibles.map(({ g, items }) => {
              const AreaIcon = areaIcon(g.area_nombre);
              const vis = items.filter((e) => !ql || norm(e.descripcion).includes(ql) || norm(g.area_nombre).includes(ql));
              if (!vis.length) return null;
              return (
                <div key={g.id}>
                  <p className="flex items-center gap-1.5 text-[10px] font-bold text-[#7B1FA2] uppercase tracking-wide mb-1.5">
                    <AreaIcon className="w-3.5 h-3.5" /> {g.area_nombre}
                  </p>
                  <div className="space-y-1.5">
                    {vis.map((e) => {
                      const on = checked.has(e.id);
                      return (
                        <button key={e.id} onClick={() => toggle(e.id)}
                          className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left border-2 transition-all ${
                            on ? 'border-[#7B1FA2] bg-purple-50' : 'border-gray-200 hover:bg-purple-50/40 hover:border-purple-200'
                          }`}>
                          <span className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            on ? 'bg-[#7B1FA2] border-[#7B1FA2]' : 'border-gray-300 bg-white'
                          }`}>
                            {on && <Check className="w-3 h-3 text-white" />}
                          </span>
                          <span className="min-w-0 flex-1"><span className="block text-xs text-gray-700 leading-snug">{e.descripcion}</span></span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <Footer onClose={onClose} onSave={guardarExistentes} disabled={checked.size === 0} saveLabel={`Agregar (${checked.size})`} />
        </>
      )}
      <style>{`.inp{width:100%;padding:.6rem .8rem;border:1px solid #e5e7eb;border-radius:.7rem;font-size:.85rem;outline:none;transition:box-shadow .2s,border-color .2s}.inp:focus{border-color:#7B1FA2;box-shadow:0 0 0 4px rgba(123,31,162,.15)}select.inp{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right .7rem center;background-size:1rem;padding-right:2.3rem}`}</style>
    </Overlay>
  );
};

// ════════════════════════════════════════════════════════════════════
// SECCIÓN · Plan de tratamiento
// ════════════════════════════════════════════════════════════════════
const SeccionPlan = ({ plan, generales, maxGen, maxEsp, puedeGestionar, esAdmin, onAddGeneral, onEditGeneral, onDeleteGeneral, onAddEspecifico, onEditEspecifico, onDeleteEspecifico }) => {
  const [abierto, setAbierto] = useState(false);
  const progresoPlan = plan?.plan?.progreso ?? 0;
  const cp = progresoColor(progresoPlan);
  const totalSes = plan?.servicio?.total_sesiones ?? 0;
  const revisionCada = plan?.plan?.revision_cada ?? 8;
  const reunionCada = plan?.plan?.reunion_padres_cada ?? 24;
  const faltanRevision = revisionCada - (totalSes % revisionCada || revisionCada) + (totalSes % revisionCada === 0 ? revisionCada : 0);
  const faltanReunion = reunionCada - (totalSes % reunionCada || reunionCada) + (totalSes % reunionCada === 0 ? reunionCada : 0);

  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button onClick={() => setAbierto((v) => !v)} className="flex items-center gap-3 min-w-0 text-left">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 ring-1 ring-black/[0.03]">
            <ClipboardList className="w-5 h-5 text-[#7B1FA2]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap">
              Plan de tratamiento {generales.length > 0 && <span className={`ml-2 ${cp.text}`}>· {progresoPlan}%</span>}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Áreas de trabajo y objetivos</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${abierto ? 'rotate-180' : ''}`} />
        </button>
        <div className="flex items-center gap-2">
          {puedeGestionar && (
            <button onClick={onAddGeneral} disabled={generales.length >= maxGen}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] hover:from-[#6A1B9A] hover:to-[#8E24AA] px-4 py-2 rounded-full shadow-lg shadow-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none">
              <Plus className="w-3.5 h-3.5" /> Área
            </button>
          )}
          <button onClick={() => setAbierto((v) => !v)}
            className="text-xs font-semibold text-[#7B1FA2] bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-full transition-colors">
            {abierto ? 'Ocultar' : 'Ver / editar'}
          </button>
        </div>
      </div>

      {generales.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-4">
          {generales.map((g, i) => {
            const c = progresoColor(g.progreso);
            const col = AREA_COLORS[i % AREA_COLORS.length];
            const AreaIcon = areaIcon(g.area_nombre);
            return (
              <button key={g.id} onClick={() => setAbierto(true)} title={`${g.area_nombre} · ${g.progreso}%`}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 bg-[#F5F0FA] hover:shadow-md hover:-translate-y-0.5 transition-all min-w-[160px] max-w-[230px]">
                <span className={`w-8 h-8 rounded-lg ${col.bg} flex items-center justify-center flex-shrink-0`}>
                  <AreaIcon className={`w-4 h-4 ${col.icon}`} />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-[11px] font-semibold text-gray-700 truncate">{g.area_nombre}</span>
                  <span className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <span className={`block h-full ${c.bar} rounded-full`} style={{ width: `${g.progreso}%` }} />
                    </span>
                    <span className={`text-[10px] font-bold ${c.text}`}>{g.progreso}%</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-[11px] text-gray-400 mt-3">Aún no hay áreas. Usa “+ Área” para crear la primera (hasta {maxGen}).</p>
      )}

      {abierto && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Áreas de trabajo y objetivos</h3>
            {generales.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                <Target className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aún no hay áreas. Agrega hasta {maxGen} áreas de trabajo.</p>
              </div>
            )}
            {generales.map((g, i) => (
              <GeneralCard key={g.id} g={g} maxEsp={maxEsp} color={AREA_COLORS[i % AREA_COLORS.length]} puedeGestionar={puedeGestionar} esAdmin={esAdmin}
                onEditGeneral={onEditGeneral} onDeleteGeneral={onDeleteGeneral}
                onAddEspecifico={onAddEspecifico} onEditEspecifico={onEditEspecifico} onDeleteEspecifico={onDeleteEspecifico} />
            ))}
          </div>

          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-2xl border border-purple-100/60 p-4 shadow-[0_8px_24px_rgba(123,31,162,0.06)]" style={{ backgroundImage: 'radial-gradient(90% 120% at 50% 0%, rgba(123,31,162,.07) 0%, rgba(123,31,162,0) 60%), linear-gradient(160deg, #ffffff 0%, #fbf8ff 100%)' }}>
              <div className="pointer-events-none absolute -top-10 -right-8 w-28 h-28 rounded-full bg-[#7B1FA2]/[0.06] blur-2xl" />
              <div className="relative flex items-center gap-2 mb-1">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center shadow-sm shadow-purple-500/20 flex-shrink-0">
                  <BarChart3 className="w-4 h-4 text-white" />
                </span>
                <h4 className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Avance general</h4>
              </div>
              <p className="relative text-[10px] text-gray-400 mb-2 pl-9 -mt-0.5">Promedio de todos los objetivos generales</p>
              <div className="relative flex justify-center my-2"><Donut pct={progresoPlan} /></div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Próximas fechas importantes</h4>
              <div className="flex items-center gap-2 py-1.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-gray-700">Revisión clínica</p>
                  <p className="text-[10px] text-gray-400">cada {revisionCada} sesiones</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 text-[11px] font-bold text-gray-700 flex-shrink-0">{faltanRevision}<span className="text-[10px] font-normal text-gray-400">faltan</span></span>
              </div>
              <div className="flex items-center gap-2 py-1.5 border-t border-gray-50">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-[#7B1FA2]" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-gray-700">Reunión con padres</p>
                  <p className="text-[10px] text-gray-400">cada {reunionCada} sesiones</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 text-[11px] font-bold text-gray-700 flex-shrink-0">{faltanReunion}<span className="text-[10px] font-normal text-gray-400">faltan</span></span>
              </div>
            </div>

            <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-3.5">
              <p className="text-[10px] text-[#7B1FA2]/80 leading-relaxed">
                Solo se trabajan {plan?.limites?.max_generales ?? 3} objetivos generales y cada uno con máximo {plan?.limites?.max_especificos ?? 3} objetivos específicos.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// Sub-componentes
// ════════════════════════════════════════════════════════════════════
const GeneralCard = ({ g, maxEsp, color, puedeGestionar, esAdmin, onEditGeneral, onDeleteGeneral, onAddEspecifico, onEditEspecifico, onDeleteEspecifico }) => {
  const puedeGestionarEspecifico = puedeGestionar || esAdmin;
  const [abierto, setAbierto] = useState(true);
  const c = progresoColor(g.progreso);
  const col = color || AREA_COLORS[0];
  const especificos = g.especificos || [];
  const AreaIcon = areaIcon(g.area_nombre);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_1px_3px_rgba(16,24,40,0.04)] hover:shadow-[0_10px_30px_rgba(16,24,40,0.07)] transition-shadow">
      <div className="flex flex-col lg:flex-row">
        <div className={`lg:w-64 flex-shrink-0 ${col.soft} border-l-4 ${col.accent} p-4 lg:border-r lg:border-r-gray-100`}>
          <div className="flex items-start gap-2.5">
            <div className={`w-9 h-9 rounded-xl ${col.bg} flex items-center justify-center flex-shrink-0`}>
              <AreaIcon className={`w-4 h-4 ${col.icon}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Área</p>
              <h4 className={`text-sm font-bold uppercase tracking-wide leading-tight ${col.icon}`}>{g.area_nombre}</h4>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Objetivo general</p>
            {g.descripcion
              ? <p className="text-xs text-gray-600 leading-snug">{g.descripcion}</p>
              : <p className="text-xs text-gray-400 italic">Sin texto.</p>}
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Progreso general</p>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${c.text} bg-white/70 border border-current/10`}>{c.label}</span>
            </div>
            <p className={`text-2xl font-extrabold ${c.text} leading-none mt-1`}>{g.progreso}%</p>
            <div className="h-2 bg-gray-200/80 rounded-full overflow-hidden mt-2">
              <div className={`h-full ${c.bar} rounded-full transition-all duration-500`} style={{ width: `${g.progreso}%` }} />
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-gray-600">
              {g.plazo_sesiones != null && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span><span className="block text-[9px] text-gray-400 uppercase">Plazo estimado</span>{g.plazo_sesiones} sesiones</span>
                </span>
              )}
              {g.fecha_inicio && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span><span className="block text-[9px] text-gray-400 uppercase">Inicio</span>{fmtFecha(g.fecha_inicio, true)}</span>
                </span>
              )}
              {g.frecuencia_nombre && (
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5 text-gray-400" />
                  <span><span className="block text-[9px] text-gray-400 uppercase">Frecuencia</span>{g.frecuencia_nombre}</span>
                </span>
              )}
              {g.fecha_logro_est && (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                  <span><span className="block text-[9px] text-gray-400 uppercase">Logro estimado</span>{fmtFecha(g.fecha_logro_est, true)}</span>
                </span>
              )}
            </div>
            {puedeGestionar && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => onEditGeneral(g)} className="p-1.5 text-gray-400 hover:text-[#7B1FA2]"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => onDeleteGeneral(g)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => setAbierto((v) => !v)} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                Objetivos específicos (máx. {maxEsp})
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${abierto ? 'rotate-180' : ''}`} />
              </button>
              {puedeGestionarEspecifico && (
                <button onClick={() => onAddEspecifico(g)} disabled={especificos.length >= maxEsp}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#7B1FA2] hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed">
                  <Plus className="w-3 h-3" /> Específico
                </button>
              )}
            </div>

            {abierto && (
              especificos.length === 0 ? (
                <p className="text-[11px] text-gray-400 py-2">Sin objetivos específicos.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-100">
                      <th className="py-1.5 pr-2 w-6 text-[9px] font-bold text-gray-400 uppercase">#</th>
                      <th className="py-1.5 pr-2 text-[9px] font-bold text-gray-400 uppercase">Objetivo específico</th>
                      <th className="py-1.5 px-2 text-[9px] font-bold text-gray-400 uppercase text-center w-24">Estado</th>
                      <th className="py-1.5 pl-2 text-[9px] font-bold text-gray-400 uppercase w-40">Progreso</th>
                      <th className="w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {especificos.map((e, i) => {
                      const ec = progresoColor(e.progreso);
                      const est = estadoEsp(e.progreso);
                      return (
                        <tr key={e.id} className="border-b border-gray-50 group align-middle">
                          <td className="py-2 pr-2">
                            <span className="w-5 h-5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                          </td>
                          <td className="py-2 pr-2 text-xs text-gray-700 leading-snug">{e.descripcion}</td>
                          <td className="py-2 px-2 text-center">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${est.text} ${est.bg}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{est.label}</span>
                          </td>
                          <td className="py-2 pl-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full ${ec.bar} rounded-full`} style={{ width: `${e.progreso}%` }} />
                              </div>
                              <span className="text-[11px] font-bold text-gray-700 w-9 text-right">{e.progreso}%</span>
                            </div>
                          </td>
                          <td className="py-2">
                            {esAdmin && (
                              <div className="flex items-center gap-0.5">
                                <button onClick={() => onEditEspecifico(g, e)} title="Editar objetivo específico" className="p-1 text-gray-400 hover:text-[#7B1FA2]"><Pencil className="w-3 h-3" /></button>
                                <button onClick={() => onDeleteEspecifico(e)} title="Eliminar objetivo específico" className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Donut ──
const Donut = ({ pct }) => {
  const r = 48, c = 2 * Math.PI * r;
  const off = c - (Math.min(100, Math.max(0, pct)) / 100) * c;
  const col = progresoColor(pct).stroke;
  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#f1f1f4" strokeWidth="12" />
      <circle cx="60" cy="60" r={r} fill="none" stroke={col} strokeWidth="12" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset .5s' }} />
      <text x="60" y="56" textAnchor="middle" className="fill-gray-800" style={{ fontSize: '22px', fontWeight: 700 }}>{pct}%</text>
      <text x="60" y="74" textAnchor="middle" className="fill-gray-400" style={{ fontSize: '9px' }}>Avance general</text>
    </svg>
  );
};

const ObsCell = ({ value, disabled, locked = false, placeholder, onSave }) => {
  const [v, setV] = useState(value || '');
  const [unlocked, setUnlocked] = useState(false);
  const ref = useRef(null);
  const ajustarAlto = () => { const el = ref.current; if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; } };
  useEffect(() => { setV(value || ''); setUnlocked(false); }, [value]);
  useEffect(() => { ajustarAlto(); }, [v]);
  const soloLectura = disabled || (locked && !unlocked);
  const dirty = (value || '') !== v;
  const guardar = () => { if (dirty) onSave(v); };
  return (
    <div className="space-y-1">
      <div className="relative">
        <textarea ref={ref} value={v} disabled={soloLectura} placeholder={placeholder} rows={1}
          onChange={(e) => setV(e.target.value)} onBlur={guardar}
          className="w-full text-[11px] px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-[#7B1FA2]/15 disabled:bg-gray-50 disabled:text-gray-400 resize-none overflow-hidden leading-snug break-words transition-shadow" />
        {locked && !unlocked && !disabled && (
          <button type="button" title="Editar" onClick={() => setUnlocked(true)}
            className="absolute top-1 right-1 p-0.5 text-gray-400 hover:text-[#7B1FA2] bg-white/80 rounded">
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>
      {dirty && !soloLectura && (
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={guardar}
          className="flex items-center gap-1 text-[10px] font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] hover:from-[#6A1B9A] hover:to-[#8E24AA] px-2.5 py-1 rounded-full shadow-sm">
          <Check className="w-3 h-3" /> Guardar
        </button>
      )}
    </div>
  );
};

const Th = ({ children, className = '' }) => (
  <th className={`px-2 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide ${className}`}>{children}</th>
);

// ── Modales ──
const GeneralModal = ({ mode, data, areas, areasUsadas, frecuencias, onClose, onSave }) => {
  const [form, setForm] = useState({
    area_id: data.area_id || '', frecuencia_id: data.frecuencia_id || '',
    descripcion: data.descripcion || '', plazo_sesiones: data.plazo_sesiones || '',
    fecha_inicio: data.fecha_inicio ? String(data.fecha_inicio).slice(0, 10) : '',
    fecha_logro_est: data.fecha_logro_est ? String(data.fecha_logro_est).slice(0, 10) : '',
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const areasDisponibles = areas.filter((a) => a.id === data.area_id || !areasUsadas.has(a.id));
  const payload = () => ({
    area_id: Number(form.area_id),
    frecuencia_id: form.frecuencia_id ? Number(form.frecuencia_id) : null,
    descripcion: form.descripcion || null,
    plazo_sesiones: form.plazo_sesiones ? Number(form.plazo_sesiones) : null,
    fecha_inicio: form.fecha_inicio || null,
    fecha_logro_est: form.fecha_logro_est || null,
  });

  return (
    <Overlay onClose={onClose} wide>
      <Header title={mode === 'add' ? 'Nuevo objetivo general' : 'Editar objetivo general'} onClose={onClose} />
      <div className="p-4 space-y-3.5 max-h-[70vh] overflow-y-auto">
        <Field label="Área de trabajo" required>
          <select value={form.area_id} onChange={(e) => set('area_id', e.target.value)} className="inp">
            <option value="">Selecciona un área…</option>
            {areasDisponibles.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </Field>
        <Field label="Objetivo general">
          <textarea value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} rows={2} className="inp resize-none" placeholder="Ej. Incrementar la comprensión de instrucciones…" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Plazo (sesiones)"><input type="number" min="1" value={form.plazo_sesiones} onChange={(e) => set('plazo_sesiones', e.target.value)} className="inp" placeholder="24" /></Field>
          <Field label="Frecuencia">
            <select value={form.frecuencia_id} onChange={(e) => set('frecuencia_id', e.target.value)} className="inp">
              <option value="">—</option>
              {frecuencias.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
            </select>
          </Field>
          <Field label="Inicio"><input type="date" value={form.fecha_inicio} onChange={(e) => set('fecha_inicio', e.target.value)} className="inp" /></Field>
          <Field label="Logro estimado"><input type="date" value={form.fecha_logro_est} onChange={(e) => set('fecha_logro_est', e.target.value)} className="inp" /></Field>
        </div>
      </div>
      <Footer onClose={onClose} onSave={() => form.area_id && onSave(payload())} disabled={!form.area_id} />
      <style>{`.inp{width:100%;padding:.65rem .85rem;border:1px solid #e5e7eb;border-radius:.75rem;font-size:.85rem;outline:none;transition:box-shadow .2s,border-color .2s}.inp:focus{border-color:#7B1FA2;box-shadow:0 0 0 4px rgba(123,31,162,.15)}select.inp{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right .7rem center;background-size:1rem;padding-right:2.3rem}`}</style>
    </Overlay>
  );
};

const EspecificoModal = ({ mode, data, onClose, onSave }) => {
  const [form, setForm] = useState({ descripcion: data.descripcion || '' });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <Overlay onClose={onClose}>
      <Header title={mode === 'add' ? 'Nuevo objetivo específico' : 'Editar objetivo específico'} onClose={onClose} />
      <div className="p-4 space-y-3">
        <Field label="Objetivo específico" required>
          <textarea value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} rows={3} className="inp resize-none" placeholder="Ej. Sigue instrucciones de 1 paso" />
        </Field>
        <p className="text-[11px] text-gray-400">La actividad y los materiales se definen por sesión, dentro de cada sesión.</p>
      </div>
      <Footer onClose={onClose} onSave={() => form.descripcion.trim() && onSave(form)} disabled={!form.descripcion.trim()} />
      <style>{`.inp{width:100%;padding:.65rem .85rem;border:1px solid #e5e7eb;border-radius:.75rem;font-size:.85rem;outline:none;transition:box-shadow .2s,border-color .2s}.inp:focus{border-color:#7B1FA2;box-shadow:0 0 0 4px rgba(123,31,162,.15)}select.inp{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right .7rem center;background-size:1rem;padding-right:2.3rem}`}</style>
    </Overlay>
  );
};

const Overlay = ({ children, onClose, wide }) => (
  <div className="fixed inset-0 z-[80000] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    <div className={`relative bg-white rounded-[2rem] shadow-2xl shadow-purple-900/30 w-full ${wide ? 'max-w-2xl' : 'max-w-md'} overflow-hidden ring-1 ring-white/20`}>
      {children}
    </div>
  </div>
);

const Header = ({ title, onClose }) => (
  <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center shadow-sm shadow-purple-500/20">
        <ClipboardList className="w-[18px] h-[18px] text-white" />
      </div>
      <h2 className="text-base font-extrabold text-[#2D0A4E] leading-tight">{title}</h2>
    </div>
    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-purple-50 hover:text-[#7B1FA2] rounded-full transition-colors">
      <X className="w-4 h-4 text-gray-400" />
    </button>
  </div>
);

const Footer = ({ onClose, onSave, disabled, saveLabel = 'Guardar' }) => (
  <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-gray-100 bg-white">
    <button onClick={onClose}
      className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-full transition-all">
      <X className="w-4 h-4" />
      Cancelar
    </button>
    <button onClick={onSave} disabled={disabled}
      className="flex items-center gap-2 cx-glow bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none">
      <Check className="w-4 h-4" />
      {saveLabel}
    </button>
  </div>
);

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const ConfirmModal = ({ titulo, mensaje, onCancel, onConfirm }) => (
  <Overlay onClose={onCancel}>
    <div className="p-6 text-center">
      <div className="mx-auto w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7 text-red-600" />
      </div>
      <h3 className="text-lg font-extrabold text-[#2D0A4E] mb-1">{titulo}</h3>
      <p className="text-sm text-gray-500 mb-2 leading-relaxed">Esta acción no se puede deshacer</p>
      <div className="p-4 bg-[#F5F0FA] rounded-2xl text-left mt-4">
        <p className="text-sm text-gray-700 leading-relaxed">{mensaje}</p>
      </div>
    </div>
    <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
      <button onClick={onCancel}
        className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-full transition-all">
        <X className="w-4 h-4" />
        Cancelar
      </button>
      <button onClick={onConfirm}
        className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-red-700 transition-all shadow-lg shadow-red-500/30">
        <Trash2 className="w-4 h-4" />
        Eliminar
      </button>
    </div>
  </Overlay>
);

export default PlanTerapeuticoView;