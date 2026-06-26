import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ClipboardList, Plus, Check, CheckCircle2, Clock, Circle, Trash2, X,
  Pencil, Target, AlertCircle, Calendar, User as UserIcon, Timer, DollarSign,
  CalendarClock, Users, ChevronDown, ChevronLeft, ChevronRight, ListChecks, Search,
  Ear, MessageCircle, Brain, Eye, Smile, Hand, BookOpen, Activity, Music, Utensils,
} from 'lucide-react';
import {
  getServiciosPlan, getAreasServicio, getPlan, actualizarPlan,
  crearGeneral, editarGeneral, eliminarGeneral,
  crearEspecifico, editarEspecifico, eliminarEspecifico, guardarRegistro,
  asignarObjetivoSesion, desasignarObjetivoSesion,
} from '../../services/planTerapeuticoService';
import { isAdministrador } from '../../constants/roles';

const SESIONES_POR_BLOQUE = 4; // los bloques de 4 sesiones se usan solo para agrupar la línea de tiempo

const ESTADO_SESION = {
  REALIZADA:   { Icon: CheckCircle2, color: 'text-emerald-500', sub: null, label: 'Realizada' },
  AGENDADA:    { Icon: Clock,        color: 'text-amber-500',   sub: null, label: 'Agendada' },
  POR_AGENDAR: { Icon: Circle,       color: 'text-gray-300',    sub: 'por agendar', label: 'Por agendar' },
  FALTA_PAGAR: { Icon: DollarSign,   color: 'text-red-400',     sub: 'falta pagar', label: 'Falta pagar y agendar' },
};

// Paleta para diferenciar áreas (se asigna por orden del objetivo general).
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
// Ícono según el área de trabajo (por palabra clave en el nombre).
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
// Estado del objetivo específico (badge tipo "Logrado / En proceso / No logrado").
const estadoEsp = (pct) => {
  if (pct >= 80) return { label: 'Logrado', text: 'text-emerald-700', bg: 'bg-emerald-50' };
  if (pct >= 40) return { label: 'En proceso', text: 'text-amber-700', bg: 'bg-amber-50' };
  return { label: 'No logrado', text: 'text-red-700', bg: 'bg-red-50' };
};
// Fecha de hoy en formato 'YYYY-MM-DD' (hora local), para comparar con las fechas de las sesiones.
const hoyISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const fmtFecha = (f, year) => {
  if (!f) return null;
  const d = new Date(String(f).slice(0, 10) + 'T00:00:00');
  return isNaN(d) ? null : d.toLocaleDateString('es-PE', year ? { day: '2-digit', month: '2-digit', year: 'numeric' } : { day: '2-digit', month: '2-digit' });
};

const PlanTerapeuticoView = ({ pacienteId, user, vista = 'plan' }) => {
  const [servicios, setServicios] = useState([]);
  const [servicioId, setServicioId] = useState(null);
  const [plan, setPlan] = useState(null);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sesionActiva, setSesionActiva] = useState(1);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });
  const [modalGeneral, setModalGeneral] = useState(null);     // {mode, data}
  const [modalEspecifico, setModalEspecifico] = useState(null); // {mode, generalId, data}
  const [confirmDelete, setConfirmDelete] = useState(null);     // {tipo, id, label}

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
        // Sesión activa por defecto: la de HOY; si no hay, la primera pendiente; si no, la última.
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
  // En Terapia de Lenguaje solo jefa/admin gestionan objetivos, actividades y materiales.
  const puedeGestionar = plan?.permisos?.gestionar_objetivos ?? true;
  // Solo el administrador puede re-editar un registro ya colocado; las terapeutas (jefa o
  // subordinada) registran una vez por sesión y luego queda bloqueado.
  const esAdmin = isAdministrador(user);
  const servicioSel = servicios.find((s) => s.servicio_id === servicioId) || null;
  const sesionSel = useMemo(() => sesiones.find((s) => s.numero_sesion === sesionActiva) || null, [sesiones, sesionActiva]);

  // Áreas aún no usadas (para el selector al crear general)
  const areasUsadas = new Set(generales.map((g) => g.area_id));

  // ── Handlers de objetivos ──
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

  // ── Handlers de registro por sesión ──
  // Cada campo (resultado, observaciones, actividad, materiales) se define POR SESIÓN.
  // Se reenvían todos los valores actuales y se sobreescribe solo el que cambió.
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

  // ── Guardar (asignar/quitar) objetivos de una sesión, en lote ──
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
        <div className="fixed top-6 right-6 z-[60] px-5 py-3 rounded-xl shadow-lg border bg-white flex items-center gap-2.5"
          style={{ borderColor: msg.tipo === 'success' ? '#D1FAE5' : '#FEE2E2' }}>
          {msg.tipo === 'success'
            ? <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
          <span className="text-sm font-medium text-gray-700">{msg.texto}</span>
          <button onClick={() => setMsg({ tipo: '', texto: '' })} className="ml-2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      )}

      {/* Servicios del paciente */}
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

      {vista === 'plan' ? (
        <TabPlan
          plan={plan} generales={generales} maxGen={maxGen} maxEsp={maxEsp} puedeGestionar={puedeGestionar}
          esAdmin={esAdmin}
          onAddGeneral={() => setModalGeneral({ mode: 'add', data: {} })}
          onEditGeneral={(g) => setModalGeneral({ mode: 'edit', data: g })}
          onDeleteGeneral={(g) => setConfirmDelete({ tipo: 'general', id: g.id, label: g.area_nombre })}
          onAddEspecifico={(g) => setModalEspecifico({ mode: 'add', generalId: g.id, data: {} })}
          onEditEspecifico={(g, e) => setModalEspecifico({ mode: 'edit', generalId: g.id, data: e })}
          onDeleteEspecifico={(e) => setConfirmDelete({ tipo: 'especifico', id: e.id, label: e.descripcion })}
        />
      ) : (
        <TabSesiones
          plan={plan} generales={generales} sesiones={sesiones} resultados={resultados}
          sesionActiva={sesionActiva} setSesionActiva={setSesionActiva} sesionSel={sesionSel}
          puedeGestionar={puedeGestionar} esAdmin={esAdmin}
          onResultado={handleResultado} onObs={handleObs}
          onActividad={handleActividad} onMateriales={handleMateriales}
          onGuardarObjetivos={handleGuardarObjetivosSesion}
        />
      )}

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
// TAB · PLAN DE TRATAMIENTO
// ════════════════════════════════════════════════════════════════════
const TabPlan = ({ plan, generales, maxGen, maxEsp, puedeGestionar, esAdmin, onAddGeneral, onEditGeneral, onDeleteGeneral, onAddEspecifico, onEditEspecifico, onDeleteEspecifico }) => {
  const progresoPlan = plan?.plan?.progreso ?? 0;
  const totalSes = plan?.servicio?.total_sesiones ?? 0;
  const revisionCada = plan?.plan?.revision_cada ?? 8;
  const reunionCada = plan?.plan?.reunion_padres_cada ?? 24;
  const faltanRevision = revisionCada - (totalSes % revisionCada || revisionCada) + (totalSes % revisionCada === 0 ? revisionCada : 0);
  const faltanReunion = reunionCada - (totalSes % reunionCada || reunionCada) + (totalSes % reunionCada === 0 ? reunionCada : 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-start">
      {/* Columna principal: objetivos generales */}
      <div className="lg:col-span-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-800">Plan de tratamiento</h3>
            {plan?.plan?.metodologia && <p className="text-[11px] text-gray-400">{plan.plan.metodologia}</p>}
          </div>
          {puedeGestionar && (
            <button onClick={onAddGeneral} disabled={generales.length >= maxGen}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#7B1FA2] hover:bg-[#6A1B9A] px-3 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed">
              <Plus className="w-3.5 h-3.5" /> Objetivo general
            </button>
          )}
        </div>

        {generales.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
            <Target className="w-9 h-9 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Aún no hay objetivos generales. Agrega hasta {maxGen} áreas de trabajo.</p>
          </div>
        )}

        {generales.map((g, i) => (
          <GeneralCard key={g.id} g={g} maxEsp={maxEsp} color={AREA_COLORS[i % AREA_COLORS.length]} puedeGestionar={puedeGestionar} esAdmin={esAdmin}
            onEditGeneral={onEditGeneral} onDeleteGeneral={onDeleteGeneral}
            onAddEspecifico={onAddEspecifico} onEditEspecifico={onEditEspecifico} onDeleteEspecifico={onDeleteEspecifico} />
        ))}
      </div>

      {/* Sidebar: progreso general + próximas fechas */}
      <div className="space-y-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Progreso general</h4>
          <p className="text-[10px] text-gray-400 mb-2">Avance general del plan terapéutico</p>
          <div className="flex justify-center my-2"><Donut pct={progresoPlan} /></div>
          <div className="space-y-2 mt-3">
            {generales.map((g, i) => {
              const c = progresoColor(g.progreso);
              const col = AREA_COLORS[i % AREA_COLORS.length];
              const AreaIcon = areaIcon(g.area_nombre);
              return (
                <div key={g.id}>
                  <div className="flex items-center justify-between mb-0.5 gap-2">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-6 h-6 rounded-lg ${col.bg} flex items-center justify-center flex-shrink-0`}><AreaIcon className={`w-3.5 h-3.5 ${col.icon}`} /></span>
                      <span className="text-[11px] font-semibold text-gray-700 truncate">{g.area_nombre}</span>
                    </span>
                    <span className={`text-[11px] font-bold ${c.text} flex-shrink-0`}>{g.progreso}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${c.bar} rounded-full`} style={{ width: `${g.progreso}%` }} /></div>
                </div>
              );
            })}
            {generales.length === 0 && <p className="text-[11px] text-gray-400">Sin objetivos aún.</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Próximas fechas importantes</h4>
          <div className="flex items-center gap-2 py-1.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0"><Calendar className="w-4 h-4 text-blue-500" /></div>
            <div className="flex-1"><p className="text-[11px] font-semibold text-gray-700">Revisión clínica</p><p className="text-[10px] text-gray-400">cada {revisionCada} sesiones</p></div>
            <span className="text-xs font-bold text-gray-700">{faltanRevision} <span className="text-[10px] font-normal text-gray-400">faltan</span></span>
          </div>
          <div className="flex items-center gap-2 py-1.5 border-t border-gray-50">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0"><Users className="w-4 h-4 text-[#7B1FA2]" /></div>
            <div className="flex-1"><p className="text-[11px] font-semibold text-gray-700">Reunión con padres</p><p className="text-[10px] text-gray-400">cada {reunionCada} sesiones</p></div>
            <span className="text-xs font-bold text-gray-700">{faltanReunion} <span className="text-[10px] font-normal text-gray-400">faltan</span></span>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-50">Las fechas pueden ajustarse según la evolución del paciente.</p>
        </div>
      </div>
    </div>
  );
};

// Tarjeta de un objetivo general: panel izquierdo (área + progreso) + tabla de específicos.
const GeneralCard = ({ g, maxEsp, color, puedeGestionar, esAdmin, onEditGeneral, onDeleteGeneral, onAddEspecifico, onEditEspecifico, onDeleteEspecifico }) => {
  // Crear objetivos específicos: quien gestiona objetivos o el administrador.
  const puedeGestionarEspecifico = puedeGestionar || esAdmin;
  const [abierto, setAbierto] = useState(true);
  const c = progresoColor(g.progreso);
  const col = color || AREA_COLORS[0];
  const especificos = g.especificos || [];
  const AreaIcon = areaIcon(g.area_nombre);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Panel izquierdo: área + descripción + progreso general */}
        <div className={`lg:w-64 flex-shrink-0 ${col.soft} border-l-4 ${col.accent} p-4 lg:border-r lg:border-r-gray-100`}>
          <div className="flex items-start gap-2.5">
            <div className={`w-9 h-9 rounded-xl ${col.bg} flex items-center justify-center flex-shrink-0`}><AreaIcon className={`w-4 h-4 ${col.icon}`} /></div>
            <h4 className={`text-sm font-bold uppercase tracking-wide leading-tight ${col.icon}`}>{g.area_nombre}</h4>
          </div>
          {g.descripcion && <p className="text-xs text-gray-600 mt-2 leading-snug">{g.descripcion}</p>}
          <div className="mt-4">
            <p className="text-[11px] text-gray-500">Progreso general</p>
            <p className={`text-2xl font-bold ${c.text}`}>{g.progreso}%</p>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1"><div className={`h-full ${c.bar} rounded-full`} style={{ width: `${g.progreso}%` }} /></div>
          </div>
        </div>

        {/* Panel derecho: meta + tabla de específicos */}
        <div className="flex-1 min-w-0 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-gray-600">
              {g.plazo_sesiones != null && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" /> <span><span className="block text-[9px] text-gray-400 uppercase">Plazo estimado</span>{g.plazo_sesiones} sesiones</span></span>}
              {g.fecha_inicio && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> <span><span className="block text-[9px] text-gray-400 uppercase">Inicio</span>{fmtFecha(g.fecha_inicio, true)}</span></span>}
              {g.frecuencia_nombre && <span className="flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5 text-gray-400" /> <span><span className="block text-[9px] text-gray-400 uppercase">Frecuencia</span>{g.frecuencia_nombre}</span></span>}
              {g.fecha_logro_est && <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-gray-400" /> <span><span className="block text-[9px] text-gray-400 uppercase">Logro estimado</span>{fmtFecha(g.fecha_logro_est, true)}</span></span>}
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
                          <td className="py-2 pr-2"><span className="w-5 h-5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold flex items-center justify-center">{i + 1}</span></td>
                          <td className="py-2 pr-2 text-xs text-gray-700 leading-snug">{e.descripcion}</td>
                          <td className="py-2 px-2 text-center"><span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${est.text} ${est.bg}`}>{est.label}</span></td>
                          <td className="py-2 pl-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full ${ec.bar} rounded-full`} style={{ width: `${e.progreso}%` }} /></div>
                              <span className="text-[11px] font-bold text-gray-700 w-9 text-right">{e.progreso}%</span>
                            </div>
                          </td>
                          <td className="py-2">
                            {/* Editar y eliminar objetivos específicos: solo el Administrador */}
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

// ════════════════════════════════════════════════════════════════════
// TAB · SESIONES
// ════════════════════════════════════════════════════════════════════
const TabSesiones = ({ plan, generales, sesiones, resultados, sesionActiva, setSesionActiva, sesionSel, puedeGestionar, esAdmin, onResultado, onObs, onActividad, onMateriales, onGuardarObjetivos }) => {
  // Todos los específicos del plan (con su área).
  const filasTodas = useMemo(
    () => generales.flatMap((g) => (g.especificos || []).map((e) => ({ ...e, area_nombre: g.area_nombre }))),
    [generales],
  );
  // Objetivos asignados a la sesión activa (cada sesión elige sus propios objetivos).
  const filas = useMemo(
    () => filasTodas.filter((e) => (e.sesiones_asignadas || []).includes(sesionActiva)),
    [filasTodas, sesionActiva],
  );
  const totalEspecificos = filasTodas.length;
  // Agrupar las filas por área (objetivo general) para unir la celda de "Área de trabajo".
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
  const [gestionarOpen, setGestionarOpen] = useState(false);
  const [confirmQuitar, setConfirmQuitar] = useState(null); // objetivo específico a quitar del bloque
  const editable = !!sesionSel?.puede_registrar;

  // Agrupar las sesiones en bloques de 4. Orden de visualización: reciente primero.
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

  // Al cambiar de sesión: abrir su bloque y saltar a la página que lo contiene.
  useEffect(() => {
    const idx = sesiones.findIndex((s) => s.numero_sesion === sesionActiva);
    if (idx < 0) return;
    const bi = Math.floor(idx / SESIONES_POR_BLOQUE);
    setBloqueAbierto(bi);
    const posReciente = (totalBloques - 1) - bi; // posición en orden reciente-primero
    setPagina(Math.floor(posReciente / BLOQUES_POR_PAGINA));
  }, [sesionActiva, sesiones, totalBloques]);

  const bloquesPagina = bloquesOrden.slice(pag * BLOQUES_POR_PAGINA, pag * BLOQUES_POR_PAGINA + BLOQUES_POR_PAGINA);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-start">
      <div className="lg:col-span-3 space-y-3">
        {/* Sesiones en acordeones de 4, paginados — reciente primero */}
        <div className="space-y-2">
          {bloquesPagina.map(({ bloque, bi }) => {
            const abierto = bloqueAbierto === bi;
            const realizadas = bloque.filter((s) => s.estado === 'REALIZADA').length;
            const desdeF = fmtFecha(bloque[0]?.fecha);
            const hastaF = fmtFecha(bloque[bloque.length - 1]?.fecha);
            const rango = desdeF && hastaF ? `${desdeF}–${hastaF}` : (desdeF || hastaF || 'sin fecha');
            return (
              <div key={bi} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button onClick={() => setBloqueAbierto(abierto ? -1 : bi)}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50/70 hover:bg-gray-100 transition-all">
                  <CalendarClock className="w-4 h-4 text-[#7B1FA2] flex-shrink-0" />
                  <span className="text-sm font-bold text-gray-800 whitespace-nowrap">Bloque {bi + 1}</span>
                  <span className="text-[11px] text-gray-400 truncate">{rango}</span>
                  <span className="ml-auto text-[10px] font-semibold text-gray-400 whitespace-nowrap">{realizadas}/{bloque.length}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${abierto ? 'rotate-180' : ''}`} />
                </button>
                {abierto && (
                  <div className="p-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {bloque.map((s) => {
                      const est = ESTADO_SESION[s.estado] || ESTADO_SESION.POR_AGENDAR;
                      const Icon = est.Icon;
                      const activa = s.numero_sesion === sesionActiva;
                      return (
                        <button key={s.numero_sesion} onClick={() => setSesionActiva(s.numero_sesion)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-left ${activa ? 'border-[#7B1FA2] bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
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

          {/* Paginación de bloques */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between pt-1">
              <button onClick={() => setPagina((p) => Math.max(0, p - 1))} disabled={pag === 0}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="w-3.5 h-3.5" /> Recientes
              </button>
              <span className="text-[11px] text-gray-400">Página {pag + 1} de {totalPaginas}</span>
              <button onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))} disabled={pag >= totalPaginas - 1}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Antiguos <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Meta de la sesión */}
        {sesionSel && (
          <div className="flex items-center gap-4 flex-wrap px-3 py-2 bg-gray-50/70 rounded-xl text-[11px]">
            <span className="flex items-center gap-1.5 text-gray-600"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {fmtFecha(sesionSel.fecha, true) || (ESTADO_SESION[sesionSel.estado]?.sub || '—')}{sesionSel.hora_inicio ? ` · ${String(sesionSel.hora_inicio).slice(0, 5)}` : ''}</span>
            {sesionSel.terapeuta_nombre && <span className="flex items-center gap-1.5 text-gray-600"><UserIcon className="w-3.5 h-3.5 text-gray-400" /> {sesionSel.terapeuta_nombre}</span>}
            {sesionSel.duracion_minutos != null && <span className="flex items-center gap-1.5 text-gray-600"><Timer className="w-3.5 h-3.5 text-gray-400" /> {sesionSel.duracion_minutos} min</span>}
            <span className="ml-auto flex items-center gap-1.5"><span className="text-gray-400">Estado:</span>
              <span className={`px-2 py-0.5 rounded-full font-semibold ${sesionSel.estado === 'REALIZADA' ? 'bg-emerald-50 text-emerald-600' : sesionSel.estado === 'AGENDADA' ? 'bg-amber-50 text-amber-600' : sesionSel.estado === 'FALTA_PAGAR' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                {sesionSel.estado_nombre || ESTADO_SESION[sesionSel.estado]?.label}
              </span>
            </span>
          </div>
        )}

        {/* Tabla de registro */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-visible">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-gray-800">Registro de la sesión</h4>
              <p className="text-[11px] text-gray-400">Objetivos de la Sesión {sesionActiva}</p>
            </div>
            {puedeGestionar && (
              <button onClick={() => setGestionarOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#7B1FA2] hover:bg-[#6A1B9A] px-3 py-2 rounded-lg">
                <ListChecks className="w-3.5 h-3.5" /> Gestionar objetivos
              </button>
            )}
          </div>
          {filas.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              {totalEspecificos === 0
                ? 'Define objetivos en el tab "Plan de tratamiento" para poder asignarlos aquí.'
                : `Esta sesión aún no tiene objetivos. Usa "Gestionar objetivos" para elegir cuáles trabajar en la Sesión ${sesionActiva}.`}
            </p>
          ) : (
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col style={{ width: '12%' }} /><col style={{ width: '19%' }} /><col style={{ width: '14%' }} />
                <col style={{ width: '12%' }} /><col style={{ width: '25%' }} /><col style={{ width: '18%' }} />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-100 text-left bg-gray-50/50">
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
                    // Una vez colocado un valor, solo el administrador puede re-editarlo.
                    const resultadoBloqueado  = !esAdmin && !!reg.resultado_codigo;
                    const actividadBloqueada  = !esAdmin && !!(reg.actividad && String(reg.actividad).trim());
                    const materialesBloqueados = !esAdmin && !!(reg.materiales && String(reg.materiales).trim());
                    const obsBloqueada        = !esAdmin && !!(reg.observaciones && String(reg.observaciones).trim());
                    return (
                      <tr key={e.id} className={`align-top ${ultimo ? 'border-b border-gray-100' : ''}`}>
                        {i === 0 && (
                          <td rowSpan={grupo.items.length} className={`px-2 py-2.5 ${col.soft} border-l-4 ${col.accent} border-r border-gray-100 align-middle`}>
                            <div className="flex flex-col items-center text-center gap-1">
                              <div className={`w-7 h-7 rounded-lg ${col.bg} flex items-center justify-center flex-shrink-0`}><AreaIcon className={`w-3.5 h-3.5 ${col.icon}`} /></div>
                              <p className={`font-semibold leading-tight break-words text-[11px] ${col.icon}`}>{grupo.area_nombre}</p>
                            </div>
                          </td>
                        )}
                        <td className="px-2 py-2.5 text-[11px] text-gray-700 break-words">
                          <div className="group/obj flex items-start justify-between gap-1">
                            <span>{e.descripcion}</span>
                            {puedeGestionar && (
                              <button onClick={() => setConfirmQuitar(e)} title="Quitar objetivo de este bloque"
                                className="opacity-0 group-hover/obj:opacity-100 transition-opacity p-0.5 text-gray-300 hover:text-red-500 flex-shrink-0">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
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
                                  className={`text-[10px] font-semibold px-2 py-1 rounded-md border whitespace-nowrap transition-all ${sel ? cc.solid : `bg-white ${cc.soft}`} ${(!editable || resultadoBloqueado) ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
          )}
          {!editable && filas.length > 0 && (
            <p className="text-[11px] text-gray-400 px-4 py-2 border-t border-gray-50">
              {sesionSel?.estado === 'FALTA_PAGAR' ? 'Esta sesión falta pagar y agendar.' : sesionSel?.estado === 'POR_AGENDAR' ? 'Sesión comprada; falta agendar la cita para registrar.' : 'Sesión no disponible para registrar.'}
            </p>
          )}
        </div>
      </div>

      {/* Sidebar: progreso de objetivos generales */}
      <div className="space-y-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Progreso de objetivos generales</h4>
          <div className="space-y-2.5">
            {generales.map((g, i) => {
              const c = progresoColor(g.progreso);
              const col = colorGen[g.id] || AREA_COLORS[i % AREA_COLORS.length];
              return (
                <div key={g.id}>
                  <div className="flex items-center justify-between mb-0.5 gap-2">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${col.dot}`} />
                      <span className="text-[11px] font-semibold text-gray-700 truncate">{i + 1}. {g.area_nombre}</span>
                    </span>
                    <span className={`text-[11px] font-bold ${c.text} flex-shrink-0`}>{g.progreso}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${c.bar} rounded-full`} style={{ width: `${g.progreso}%` }} /></div>
                  <span className={`text-[9px] ${c.text}`}>{c.label}</span>
                </div>
              );
            })}
            {generales.length === 0 && <p className="text-[11px] text-gray-400">Sin objetivos aún.</p>}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-50 space-y-1">
            <p className="text-[9px] text-gray-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Óptimo (80–100%)</p>
            <p className="text-[9px] text-gray-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> En proceso (40–79%)</p>
            <p className="text-[9px] text-gray-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> En riesgo (0–39%)</p>
          </div>
        </div>
        <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3">
          <p className="text-[10px] text-blue-700">Solo se trabajan {plan?.limites?.max_generales ?? 3} objetivos generales y cada uno con máximo {plan?.limites?.max_especificos ?? 3} objetivos específicos.</p>
        </div>
      </div>

      {gestionarOpen && (
        <ObjetivosSesionModal sesion={sesionActiva} generales={generales}
          onClose={() => setGestionarOpen(false)}
          onGuardar={(addIds, removeIds) => onGuardarObjetivos(sesionActiva, addIds, removeIds)} />
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
// MODAL · Gestionar objetivos de una sesión
// ════════════════════════════════════════════════════════════════════
const ObjetivosSesionModal = ({ sesion, generales, onClose, onGuardar }) => {
  const inicial = useMemo(
    () => new Set(
      generales.flatMap((g) => (g.especificos || [])
        .filter((e) => (e.sesiones_asignadas || []).includes(sesion))
        .map((e) => e.id)),
    ),
    [generales, sesion],
  );
  const [checked, setChecked] = useState(() => new Set(inicial));
  const [q, setQ] = useState('');
  const [confirmar, setConfirmar] = useState(false);

  const toggle = (id) => setChecked((prev) => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const ql = q.trim().toLowerCase();
  const norm = (s) => (s || '').toLowerCase();
  // ¿el específico tiene registros (resultado u observación) en esta sesión?
  const tieneRegistros = (e) => !!e.registros?.[sesion];

  const todos = useMemo(() => generales.flatMap((g) => g.especificos || []), [generales]);
  const addIds = [...checked].filter((id) => !inicial.has(id));
  const removeIds = [...inicial].filter((id) => !checked.has(id));
  const removalsConData = todos.filter((e) => removeIds.includes(e.id) && tieneRegistros(e));
  const sinCambios = addIds.length === 0 && removeIds.length === 0;

  const handleGuardar = () => {
    if (removalsConData.length && !confirmar) { setConfirmar(true); return; }
    onGuardar(addIds, removeIds);
    onClose();
  };

  const hayEspecificos = todos.length > 0;

  return (
    <Overlay onClose={onClose} wide>
      <Header title={`Objetivos de la Sesión ${sesion}`} onClose={onClose} />
      <div className="px-5 pt-4">
        <p className="text-[11px] text-gray-400 mb-2">Marca los objetivos que se trabajarán en la Sesión {sesion}.</p>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar objetivo…"
            className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-[#7B1FA2]" />
        </div>
      </div>

      <div className="px-5 py-3 max-h-[50vh] overflow-y-auto space-y-4">
        {!hayEspecificos && (
          <p className="text-sm text-gray-400 text-center py-6">Primero crea objetivos en el tab "Plan de tratamiento".</p>
        )}
        {generales.map((g) => {
          const AreaIcon = areaIcon(g.area_nombre);
          const items = (g.especificos || []).filter((e) => !ql || norm(e.descripcion).includes(ql) || norm(g.area_nombre).includes(ql));
          if (!items.length) return null;
          return (
            <div key={g.id}>
              <p className="flex items-center gap-1.5 text-[10px] font-bold text-[#7B1FA2] uppercase tracking-wide mb-1.5">
                <AreaIcon className="w-3.5 h-3.5" /> {g.area_nombre}
              </p>
              <div className="space-y-1">
                {items.map((e) => {
                  const on = checked.has(e.id);
                  const conData = tieneRegistros(e);
                  return (
                    <button key={e.id} onClick={() => toggle(e.id)}
                      className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left border transition-all ${on ? 'border-[#7B1FA2] bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <span className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${on ? 'bg-[#7B1FA2] border-[#7B1FA2]' : 'border-gray-300 bg-white'}`}>
                        {on && <Check className="w-3 h-3 text-white" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs text-gray-700 leading-snug">{e.descripcion}</span>
                        {conData && <span className="block text-[9px] text-amber-600 mt-0.5">Tiene registros en esta sesión</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {hayEspecificos && ql && todos.every((e) => !norm(e.descripcion).includes(ql)) && (
          <p className="text-[11px] text-gray-400 text-center py-2">Sin coincidencias para "{q}".</p>
        )}
      </div>

      {confirmar && removalsConData.length > 0 && (
        <div className="px-5 py-2 bg-amber-50 border-t border-amber-100">
          <p className="text-[11px] text-amber-700">
            Vas a quitar {removalsConData.length} objetivo(s) que ya tienen registros en esta sesión; se borrarán esos resultados/observaciones. Pulsa "Confirmar y guardar" para continuar.
          </p>
        </div>
      )}

      <Footer onClose={onClose} onSave={handleGuardar} disabled={sinCambios}
        saveLabel={confirmar && removalsConData.length ? 'Confirmar y guardar' : 'Guardar'} />
    </Overlay>
  );
};

// ════════════════════════════════════════════════════════════════════
// Subcomponentes
// ════════════════════════════════════════════════════════════════════
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

// `disabled` = no editable de plano (sesión no registrable o sin permiso).
// `locked`   = bloqueo suave (ya tiene valor); con permiso se puede reabrir con el lapicito.
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
          className="w-full text-[11px] px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] disabled:bg-gray-50 disabled:text-gray-400 resize-none overflow-hidden leading-snug break-words" />
        {locked && !unlocked && !disabled && (
          <button type="button" title="Editar" onClick={() => setUnlocked(true)}
            className="absolute top-1 right-1 p-0.5 text-gray-400 hover:text-[#7B1FA2] bg-white/80 rounded">
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>
      {dirty && !soloLectura && (
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={guardar}
          className="flex items-center gap-1 text-[10px] font-semibold text-white bg-[#7B1FA2] hover:bg-[#6A1B9A] px-2 py-1 rounded-md">
          <Check className="w-3 h-3" /> Guardar
        </button>
      )}
    </div>
  );
};

const Th = ({ children, className = '' }) => (
  <th className={`px-2 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide ${className}`}>{children}</th>
);

const GeneralModal = ({ mode, data, areas, areasUsadas, frecuencias, onClose, onSave }) => {
  const [form, setForm] = useState({
    area_id: data.area_id || '', frecuencia_id: data.frecuencia_id || '',
    descripcion: data.descripcion || '', plazo_sesiones: data.plazo_sesiones || '',
    fecha_inicio: data.fecha_inicio ? String(data.fecha_inicio).slice(0, 10) : '',
    fecha_logro_est: data.fecha_logro_est ? String(data.fecha_logro_est).slice(0, 10) : '',
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  // En edición se permite el área actual; en alta, solo áreas no usadas.
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
      <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
        <Field label="Área de trabajo" required>
          <select value={form.area_id} onChange={(e) => set('area_id', e.target.value)} className="inp">
            <option value="">Selecciona un área…</option>
            {areasDisponibles.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </Field>
        <Field label="Objetivo general"><textarea value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} rows={2} className="inp resize-none" placeholder="Ej. Incrementar la comprensión de instrucciones…" /></Field>
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
      <style>{`.inp{width:100%;padding:.55rem .75rem;border:2px solid #e5e7eb;border-radius:.6rem;font-size:.85rem;outline:none}.inp:focus{border-color:#7B1FA2}`}</style>
    </Overlay>
  );
};

const EspecificoModal = ({ mode, data, onClose, onSave }) => {
  const [form, setForm] = useState({ descripcion: data.descripcion || '' });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <Overlay onClose={onClose}>
      <Header title={mode === 'add' ? 'Nuevo objetivo específico' : 'Editar objetivo específico'} onClose={onClose} />
      <div className="p-5 space-y-3">
        <Field label="Objetivo específico" required><textarea value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} rows={2} className="inp resize-none" placeholder="Ej. Sigue instrucciones de 1 paso" /></Field>
        <p className="text-[11px] text-gray-400">La actividad y los materiales se definen por sesión en el tab "Sesiones".</p>
      </div>
      <Footer onClose={onClose} onSave={() => form.descripcion.trim() && onSave(form)} disabled={!form.descripcion.trim()} />
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
