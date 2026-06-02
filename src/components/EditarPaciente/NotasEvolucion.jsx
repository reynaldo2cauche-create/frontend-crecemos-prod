import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Save, FileText, Target, Activity, Stethoscope, ClipboardList, Calendar, User, Filter } from 'lucide-react';
import { guardarNotaEvolucion, obtenerNotasEvolucionPorPaciente } from '../../services/notaEvolucionService';
import { ROLES } from '../../constants/roles';

const construirUrl = (paciente_id, user) => {
  const esTerapeuta = user?.rol?.id === ROLES.TERAPEUTA;
  const base = `/nota-evolucion/paciente/${paciente_id}`;
  return esTerapeuta ? `${base}?trabajador_id=${user.id}` : base;
};

const mapearNota = (n) => ({
  id: n.id,
  fecha: n.fecha_crea
    ? new Date(n.fecha_crea).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' +
      new Date(n.fecha_crea).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '',
  autor: n.trabajador
    ? `${n.trabajador.nombres} ${n.trabajador.apellidos}${n.trabajador.rol ? ' — ' + n.trabajador.rol.nombre : ''}`
    : `Usuario ${n.user_id_crea}`,
  servicio: n.servicio?.nombre || 'Sin servicio',
  entrevista: n.entrevista,
  sesionEvaluacion: n.sesion_evaluacion,
  sesionTerapias: n.sesion_terapias,
  objetivosTerapeuticos: n.objetivos_terapeuticos,
  observaciones: n.observaciones,
});

const TIPOS_NOTA = [
  { id: 'entrevista',   label: 'Entrevista',              icon: <User className="w-4 h-4" />,         color: 'purple', campo: 'entrevista' },
  { id: 'objetivos',    label: 'Objetivos Terapéuticos',  icon: <Target className="w-4 h-4" />,        color: 'emerald', campo: 'objetivosTerapeuticos' },
  { id: 'evaluacion',   label: 'Sesión de Evaluación',    icon: <Activity className="w-4 h-4" />,      color: 'blue',   campo: 'sesionEvaluacion' },
  { id: 'terapias',     label: 'Sesión de Terapias',      icon: <Stethoscope className="w-4 h-4" />,   color: 'amber',  campo: 'sesionTerapias' },
  { id: 'observaciones',label: 'Observaciones',           icon: <ClipboardList className="w-4 h-4" />, color: 'gray',   campo: 'observaciones' },
];

const COLOR_CLASSES = {
  purple: { tab: 'border-purple-500 text-purple-700 bg-purple-50', bg: 'bg-purple-100', section: 'bg-purple-50 border-purple-200', title: 'text-purple-700', icon: 'text-purple-600' },
  emerald: { tab: 'border-emerald-500 text-emerald-700 bg-emerald-50', bg: 'bg-emerald-100', section: 'bg-emerald-50 border-emerald-200', title: 'text-emerald-700', icon: 'text-emerald-600' },
  blue:   { tab: 'border-blue-500 text-blue-700 bg-blue-50', bg: 'bg-blue-100', section: 'bg-blue-50 border-blue-200', title: 'text-blue-700', icon: 'text-blue-600' },
  amber:  { tab: 'border-amber-500 text-amber-700 bg-amber-50', bg: 'bg-amber-100', section: 'bg-amber-50 border-amber-200', title: 'text-amber-700', icon: 'text-amber-600' },
  gray:   { tab: 'border-gray-500 text-gray-700 bg-gray-50', bg: 'bg-gray-100', section: 'bg-gray-50 border-gray-200', title: 'text-gray-700', icon: 'text-gray-600' },
};

// Menú renderizado via portal para escapar del z-index del modal
const MenuTiposPortal = ({ anchorRef, onSelect, onClose, tiposUsados }) => {
  const [pos, setPos] = useState(null); // null = todavía no calculado

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 8, left: rect.left });
  }, [anchorRef]);

  const tiposDisponibles = TIPOS_NOTA.filter(t => !tiposUsados.includes(t.id));

  // No renderizar hasta tener coordenadas reales → evita el flash
  if (!pos) return createPortal(
    <div className="fixed inset-0" style={{ zIndex: 99998 }} onClick={onClose} />,
    document.body
  );

  return createPortal(
    <>
      <div className="fixed inset-0" style={{ zIndex: 99998 }} onClick={onClose} />
      <div
        className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[240px]"
        style={{ top: pos.top, left: pos.left, zIndex: 99999 }}
      >
        {tiposDisponibles.length > 0 ? tiposDisponibles.map(tipo => (
          <button
            key={tipo.id}
            onClick={() => onSelect(tipo.id)}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-all text-left"
          >
            <div className={`w-8 h-8 rounded-lg ${COLOR_CLASSES[tipo.color].bg} flex items-center justify-center flex-shrink-0`}>
              {tipo.icon}
            </div>
            <span className="text-sm font-medium text-gray-700">{tipo.label}</span>
          </button>
        )) : (
          <div className="px-4 py-3 text-sm text-gray-400 text-center">
            Ya agregaste todos los tipos
          </div>
        )}
      </div>
    </>,
    document.body
  );
};

const formatTextWithLineBreaks = (text) => {
  if (!text) return '';
  return text.split('\n').map((line, index, arr) => (
    <React.Fragment key={index}>
      {line}
      {index < arr.length - 1 && <br />}
    </React.Fragment>
  ));
};

const NotasEvolucion = ({
  notas,
  setNotas,
  openNotaModal,
  setOpenNotaModal,
  nota,
  setNota,
  paciente_id,
  user_id_crea,
  user,
  setSnackbar,
}) => {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
  const [filtroTerapeuta, setFiltroTerapeuta] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const containerRef = useRef(null);
  const btnAgregarRef = useRef(null); // ref para calcular posición del portal

  const [tabs, setTabs] = useState([]);
  const [tabActiva, setTabActiva] = useState(0);
  const [mostrarMenuTipos, setMostrarMenuTipos] = useState(false);

  // Cargar notas al montar
  useEffect(() => {
    if (!paciente_id) return;
    const cargarNotas = async () => {
      try {
        setLoading(true);
        const url = construirUrl(paciente_id, user);
        const respuesta = await obtenerNotasEvolucionPorPaciente(paciente_id, url);
        setNotas((respuesta?.data || []).map(mapearNota));
      } catch (error) {
        console.error('❌ Error al cargar notas:', error);
        setSnackbar({ open: true, message: 'Error al cargar las notas de evolución', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    cargarNotas();
  }, [paciente_id, user]);

  // Ajustar altura al contenedor de filiación
  useEffect(() => {
    const ajustarAltura = () => {
      if (!containerRef.current) return;
      const filiacion = containerRef.current.parentElement?.previousElementSibling?.firstElementChild;
      if (filiacion) {
        const alturaFinal = Math.max(filiacion.offsetHeight, 700);
        containerRef.current.style.height = `${alturaFinal}px`;
      }
    };
    ajustarAltura();
    window.addEventListener('resize', ajustarAltura);
    const interval = setInterval(ajustarAltura, 500);
    return () => {
      window.removeEventListener('resize', ajustarAltura);
      clearInterval(interval);
    };
  }, []);

  // Limpiar tabs al cerrar modal
  useEffect(() => {
    if (!openNotaModal) {
      setTabs([]);
      setTabActiva(0);
      setMostrarMenuTipos(false);
    }
  }, [openNotaModal]);

  const especialidades = useMemo(() => {
    if (!notas?.length) return [];
    return [...new Set(notas.map(n => n.autor.split(' — ')[1]).filter(Boolean))].sort();
  }, [notas]);

  const terapeutas = useMemo(() => {
    if (!notas?.length) return [];
    return [...new Set(notas.map(n => n.autor.split(' — ')[0]).filter(Boolean))].sort();
  }, [notas]);

  const notasFiltradas = useMemo(() => {
    if (!notas?.length) return [];
    return notas.filter(n => {
      const [nombre, especialidad] = n.autor.split(' — ');
      if (filtroEspecialidad && especialidad?.trim() !== filtroEspecialidad) return false;
      if (filtroTerapeuta && nombre?.trim() !== filtroTerapeuta) return false;
      if (filtroTipo) {
        const tieneContenido = (campo) => !!campo && campo.trim().length > 0;
        const mapaFiltro = {
          entrevista:    tieneContenido(n.entrevista),
          objetivos:     tieneContenido(n.objetivosTerapeuticos),
          evaluacion:    tieneContenido(n.sesionEvaluacion),
          terapia:       tieneContenido(n.sesionTerapias),
          observaciones: tieneContenido(n.observaciones),
        };
        if (!mapaFiltro[filtroTipo]) return false;
      }
      return true;
    });
  }, [notas, filtroEspecialidad, filtroTerapeuta, filtroTipo]);

  const agregarTab = (tipoId) => {
    const nuevoTab = { id: Date.now(), tipo: tipoId, contenido: '' };
    setTabs(prev => [...prev, nuevoTab]);
    setTabActiva(tabs.length);
    setMostrarMenuTipos(false);
  };

  const eliminarTab = (index) => {
    setTabs(prev => {
      const nuevos = prev.filter((_, i) => i !== index);
      if (nuevos.length === 0) setTabActiva(0);
      else if (tabActiva >= nuevos.length) setTabActiva(nuevos.length - 1);
      return nuevos;
    });
  };

  const actualizarContenidoTab = (index, contenido) => {
    setTabs(prev => prev.map((tab, i) => i === index ? { ...tab, contenido } : tab));
  };

  const handleGuardarNota = async (e) => {
    e.preventDefault();
    const hayContenido = tabs.some(tab => tab.contenido.trim().length > 0);
    if (!hayContenido) return;

    // Mapear campos de camelCase a snake_case para el backend
    const campoBackend = {
      objetivosTerapeuticos: 'objetivos_terapeuticos',
      sesionEvaluacion:      'sesion_evaluacion',
      sesionTerapias:        'sesion_terapias',
      entrevista:            'entrevista',
      observaciones:         'observaciones',
    };

    const notaData = { entrevista: '', sesion_evaluacion: '', sesion_terapias: '', objetivos_terapeuticos: '', observaciones: '' };
    tabs.forEach(tab => {
      const tipo = TIPOS_NOTA.find(t => t.id === tab.tipo);
      if (tipo && tab.contenido.trim()) {
        const keyBackend = campoBackend[tipo.campo] ?? tipo.campo;
        notaData[keyBackend] = tab.contenido.trim();
      }
    });

    setSaving(true);
    try {
      await guardarNotaEvolucion({ paciente_id, ...notaData, user_id_crea });
      const url = construirUrl(paciente_id, user);
      const respuesta = await obtenerNotasEvolucionPorPaciente(paciente_id, url);
      setNotas((respuesta?.data || []).map(mapearNota));
      setNota({ entrevista: '', sesionEvaluacion: '', sesionTerapias: '', objetivosTerapeuticos: '', observaciones: '' });
      setOpenNotaModal(false);
      setSnackbar({ open: true, message: 'Nota guardada correctamente', severity: 'success' });
    } catch (error) {
      console.error('❌ Error al guardar la nota:', error);
      setSnackbar({ open: true, message: 'Error al guardar la nota', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* ── Panel lateral de notas ── */}
      <div ref={containerRef} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#7B1FA2]/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-[#7B1FA2]" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">Notas de Evolución</h2>
              <p className="text-xs text-gray-500 truncate">Seguimiento del paciente</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-semibold text-gray-700">Filtros</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select value={filtroEspecialidad} onChange={e => setFiltroEspecialidad(e.target.value)}
                className="text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 bg-white">
                <option value="">Todas las especialidades</option>
                {especialidades.map(esp => <option key={esp} value={esp}>{esp}</option>)}
              </select>
              <select value={filtroTerapeuta} onChange={e => setFiltroTerapeuta(e.target.value)}
                className="text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 bg-white">
                <option value="">Todos los terapeutas</option>
                {terapeutas.map(ter => <option key={ter} value={ter}>{ter}</option>)}
              </select>
              <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
                className="text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 bg-white">
                <option value="">Todos los tipos</option>
                <option value="entrevista">Entrevista</option>
                <option value="objetivos">Objetivos Terapéuticos</option>
                <option value="evaluacion">Sesión de Evaluación</option>
                <option value="terapia">Sesión de Terapias</option>
                <option value="observaciones">Observaciones</option>
              </select>
            </div>
          </div>

          <button onClick={() => setOpenNotaModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-[#7B1FA2] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#6A1B9A] transition-all shadow-sm">
            <Plus className="w-4 h-4" />
            Nueva Nota
          </button>
        </div>

        {/* Lista de notas */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          <style>{`
            .notas-scroll::-webkit-scrollbar { width: 8px; }
            .notas-scroll::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
            .notas-scroll::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
            .notas-scroll::-webkit-scrollbar-thumb:hover { background: #a1a1a1; }
            .notas-scroll { scrollbar-width: thin; scrollbar-color: #c1c1c1 #f1f1f1; }
          `}</style>

          {loading ? (
            <div className="p-4 text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 m-4">
              <div className="w-6 h-6 border-2 border-[#7B1FA2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-900 mb-1">Cargando notas...</p>
              <p className="text-xs text-gray-500">Obteniendo historial del paciente</p>
            </div>
          ) : notas?.length > 0 ? (
            <div className="p-3 sm:p-4 space-y-3 notas-scroll">
              {notasFiltradas.length > 0 ? notasFiltradas.map(n => {
                const [nombre] = n.autor.split(' — ');
                const iniciales = nombre.split(' ').map(p => p[0]).join('');
                return (
                  <div key={n.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all bg-white">
                    <div className="bg-gradient-to-r from-gray-50 to-white p-4 sm:p-5 border-b border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A] flex items-center justify-center text-white text-base font-bold shadow-sm flex-shrink-0">
                          {iniciales}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-bold text-gray-900 truncate">{nombre}</p>
                          {n.servicio && (
                            <span className="inline-block mt-1.5 px-2.5 py-1 bg-[#A3C644]/10 text-[#A3C644] text-sm font-medium rounded border border-[#A3C644]/20">
                              {n.servicio}
                            </span>
                          )}
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
                            <Calendar className="w-4 h-4" />
                            <span>{n.fecha}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 space-y-3">
                      {TIPOS_NOTA.map(tipo => {
                        const contenido = n[tipo.campo];
                        if (!contenido) return null;
                        const c = COLOR_CLASSES[tipo.color];
                        return (
                          <div key={tipo.id} className={`${c.section} border rounded-lg p-4`}>
                            <div className="flex items-center gap-2 mb-2.5">
                              <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
                                <span className={c.icon}>{tipo.icon}</span>
                              </div>
                              <span className={`text-sm font-bold ${c.title} uppercase tracking-wide`}>{tipo.label}</span>
                            </div>
                            <div className="text-base text-gray-800 leading-relaxed pl-10">
                              {formatTextWithLineBreaks(contenido)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <p className="text-sm text-gray-500">No hay notas que coincidan con los filtros</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-100">
                  <FileText className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Sin notas registradas</p>
                <p className="text-xs text-gray-500">Agrega la primera nota de evolución del paciente</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal nueva nota ── */}
      {openNotaModal && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" style={{ zIndex: 9998 }} onClick={() => setOpenNotaModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col border border-gray-100"
              style={{ height: 'calc(100vh - 100px)', maxHeight: '900px' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#7B1FA2]/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#7B1FA2]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Nueva Nota de Evolución</h2>
                      <p className="text-xs text-gray-500">Registra el progreso del paciente</p>
                    </div>
                  </div>
                  <button onClick={() => setOpenNotaModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Barra de tabs */}
              <div
                className="border-b border-gray-200 bg-white flex-shrink-0"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${tabs.length}, 1fr)${tabs.length < TIPOS_NOTA.length ? ' auto' : ''}`,
                }}
              >
                {tabs.map((tab, index) => {
                  const tipo = TIPOS_NOTA.find(t => t.id === tab.tipo);
                  const c = COLOR_CLASSES[tipo?.color];
                  return (
                    <div
                      key={tab.id}
                      className={`flex items-center justify-center gap-1.5 px-2 py-3 cursor-pointer border-b-2 transition-all ${
                        tabActiva === index ? `${c.tab} font-semibold` : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setTabActiva(index)}
                    >
                      <span className="flex-shrink-0">{tipo?.icon}</span>
                      <span className="text-xs leading-tight whitespace-nowrap">{tipo?.label}</span>
                      <button
                        onClick={e => { e.stopPropagation(); eliminarTab(index); }}
                        className="flex-shrink-0 p-0.5 hover:bg-red-100 rounded transition-all ml-1"
                      >
                        <X className="w-3 h-3 text-gray-400 hover:text-red-600" />
                      </button>
                    </div>
                  );
                })}

                {/* Botón agregar — oculto cuando ya se agregaron todos los tipos */}
                {tabs.length < TIPOS_NOTA.length && (
                  <button
                    ref={btnAgregarRef}
                    onClick={() => setMostrarMenuTipos(v => !v)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 my-1 mx-2 text-[#7B1FA2] hover:bg-purple-50 rounded-lg transition-all border-2 border-dashed border-[#7B1FA2]/30 hover:border-[#7B1FA2] font-medium text-xs whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {tabs.length === 0 ? 'Agregar Nota' : 'Agregar'}
                  </button>
                )}

                {/* Portal — se renderiza en document.body, fuera del modal */}
                {mostrarMenuTipos && (
                  <MenuTiposPortal
                    anchorRef={btnAgregarRef}
                    onSelect={agregarTab}
                    onClose={() => setMostrarMenuTipos(false)}
                    tiposUsados={tabs.map(t => t.tipo)}
                  />
                )}
              </div>

              {/* Contenido del tab activo */}
              <div className="flex-1 overflow-hidden flex flex-col p-5 sm:p-6">
                {tabs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 text-[#7B1FA2]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Crea tu primera nota</h3>
                    <p className="text-sm text-gray-500 mb-4 max-w-sm">
                      Haz clic en "Agregar Nota" para seleccionar el tipo de registro que deseas crear
                    </p>
                    <button
                      onClick={() => setMostrarMenuTipos(true)}
                      className="flex items-center gap-2 bg-[#7B1FA2] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#6A1B9A] transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar Nota
                    </button>
                  </div>
                ) : (() => {
                  const tipo = TIPOS_NOTA.find(t => t.id === tabs[tabActiva]?.tipo);
                  const c = COLOR_CLASSES[tipo?.color];
                  return (
                    <div className="flex flex-col h-full">
                      <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                        <div className={`w-10 h-10 rounded-xl ${c?.bg} flex items-center justify-center`}>
                          {tipo?.icon}
                        </div>
                        {tipo?.label}
                      </label>
                      <textarea
                        value={tabs[tabActiva]?.contenido || ''}
                        onChange={e => actualizarContenidoTab(tabActiva, e.target.value)}
                        className="flex-1 w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all bg-white text-gray-900 resize-none"
                        placeholder={`Escribe aquí ${tipo?.label?.toLowerCase()}...`}
                        autoFocus
                      />
                    </div>
                  );
                })()}
              </div>

              {/* Footer */}
              <div className="bg-gray-50/50 px-5 sm:px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100 flex-shrink-0">
                <button
                  onClick={() => setOpenNotaModal(false)}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-white border border-gray-200 rounded-xl transition-all disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarNota}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#A3C644] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#8FB82D] transition-all shadow-sm disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Nota
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default NotasEvolucion;