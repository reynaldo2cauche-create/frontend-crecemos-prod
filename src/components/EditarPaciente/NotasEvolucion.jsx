import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, X, Save, FileText, Target, Activity, Stethoscope, ClipboardList, Calendar, User, Filter } from 'lucide-react';
import { guardarNotaEvolucion, obtenerNotasEvolucionPorPaciente } from '../../services/notaEvolucionService';
import { ROLES } from '../../constants/roles';

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
  setSnackbar
}) => {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
  const [filtroTerapeuta, setFiltroTerapeuta] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const containerRef = useRef(null);

  // Cargar notas al montar el componente
  useEffect(() => {
    const cargarNotasIniciales = async () => {
      try {
        setLoading(true);
        let url = `/nota-evolucion/paciente/${paciente_id}`;
        // Si es terapeuta pero NO es jefe, filtrar solo sus propias notas
        // Si es jefe (cargo.es_jefe), ver todas las notas (propias + subordinadas)
        const esJefe = user?.cargo?.es_jefe === true;
        if (user?.rol?.id === ROLES.TERAPEUTA && !esJefe) {
          url += `?trabajador_id=${user.id}`;
        }
        
        const respuesta = await obtenerNotasEvolucionPorPaciente(paciente_id, url);
        const notasActualizadas = respuesta?.data || [];

        setNotas(notasActualizadas.map(n => ({
          id: n.id,
          fecha: n.fecha_crea
            ? new Date(n.fecha_crea).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
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
          observaciones: n.observaciones
        })));
      } catch (error) {
        console.error('❌ Error al cargar notas iniciales:', error);
        setSnackbar({ open: true, message: 'Error al cargar las notas de evolución', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (paciente_id) {
      cargarNotasIniciales();
    }
  }, [paciente_id, user]);

  useEffect(() => {
    const ajustarAltura = () => {
      if (!containerRef.current) return;
      const filiacion = containerRef.current.parentElement.previousElementSibling?.firstElementChild;
      if (filiacion) {
        const alturaFiliacion = filiacion.offsetHeight;
        const alturaMinima = 700;
        const alturaFinal = Math.max(alturaFiliacion, alturaMinima);
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

  const especialidades = useMemo(() => {
    if (!notas || notas.length === 0) return [];
    const lista = [...new Set(notas.map(n => n.autor.split(' — ')[1]).filter(Boolean))];
    return lista.sort();
  }, [notas]);

  const terapeutas = useMemo(() => {
    if (!notas || notas.length === 0) return [];
    const lista = [...new Set(notas.map(n => n.autor.split(' — ')[0]).filter(Boolean))];
    return lista.sort();
  }, [notas]);

  const notasFiltradas = useMemo(() => {
    if (!notas || notas.length === 0) return [];
    return notas.filter(n => {
      const [nombre, especialidad] = n.autor.split(' — ');

      // Filtro de especialidad
      if (filtroEspecialidad && especialidad?.trim() !== filtroEspecialidad) {
        return false;
      }

      // Filtro de terapeuta
      if (filtroTerapeuta && nombre?.trim() !== filtroTerapeuta) {
        return false;
      }

      // Filtro de tipo de comentario
      if (filtroTipo) {
        switch (filtroTipo) {
          case 'entrevista':
            return !!n.entrevista && n.entrevista.trim().length > 0;
          case 'objetivos':
            return !!n.objetivosTerapeuticos && n.objetivosTerapeuticos.trim().length > 0;
          case 'evaluacion':
            return !!n.sesionEvaluacion && n.sesionEvaluacion.trim().length > 0;
          case 'terapia':
            return !!n.sesionTerapias && n.sesionTerapias.trim().length > 0;
          case 'observaciones':
            return !!n.observaciones && n.observaciones.trim().length > 0;
          default:
            return true;
        }
      }

      return true;
    });
  }, [notas, filtroEspecialidad, filtroTerapeuta, filtroTipo]);

  const formatTextWithLineBreaks = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const handleAgregarComentario = async (e) => {
    e.preventDefault();
    if (nota.entrevista.trim() || nota.sesionEvaluacion.trim() || nota.sesionTerapias.trim() || nota.objetivosTerapeuticos.trim() || nota.observaciones.trim()) {
      setSaving(true);
      const nuevaNota = {
        paciente_id,
        entrevista: nota.entrevista,
        sesion_evaluacion: nota.sesionEvaluacion,
        sesion_terapias: nota.sesionTerapias,
        objetivos_terapeuticos: nota.objetivosTerapeuticos,
        observaciones: nota.observaciones,
        user_id_crea
      };
      try {
        console.log('📝 Guardando nota de evolución:', nuevaNota);
        const respuestaGuardado = await guardarNotaEvolucion(nuevaNota);
        console.log('✅ Respuesta del guardado:', respuestaGuardado);

        let url = `/nota-evolucion/paciente/${paciente_id}`;
        // Si es terapeuta pero NO es jefe, filtrar solo sus propias notas
        // Si es jefe (cargo.es_jefe), ver todas las notas (propias + subordinadas)
        const esJefe = user?.cargo?.es_jefe === true;
        if (user?.rol?.id === ROLES.TERAPEUTA && !esJefe) {
          url += `?trabajador_id=${user.id}`;
        }
        
        const respuesta = await obtenerNotasEvolucionPorPaciente(paciente_id, url);
        const notasActualizadas = respuesta?.data || [];

        setNotas(notasActualizadas.map(n => ({
          id: n.id,
          fecha: n.fecha_crea
            ? new Date(n.fecha_crea).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
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
          observaciones: n.observaciones
        })));

        setNota({ entrevista: '', sesionEvaluacion: '', sesionTerapias: '', objetivosTerapeuticos: '', observaciones: '' });
        setOpenNotaModal(false);
        setSnackbar({ open: true, message: 'Nota guardada correctamente', severity: 'success' });
      } catch (error) {
        console.error('❌ Error al guardar la nota:', error);
        console.error('❌ Detalles:', error.response?.data);
        setSnackbar({ open: true, message: 'Error al guardar la nota', severity: 'error' });
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col"
      >
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

          <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-semibold text-gray-700">Filtros</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={filtroEspecialidad}
                onChange={(e) => setFiltroEspecialidad(e.target.value)}
                className="text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 bg-white"
              >
                <option value="">Todas las especialidades</option>
                {especialidades.map(esp => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>

              <select
                value={filtroTerapeuta}
                onChange={(e) => setFiltroTerapeuta(e.target.value)}
                className="text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 bg-white"
              >
                <option value="">Todos los terapeutas</option>
                {terapeutas.map(ter => (
                  <option key={ter} value={ter}>{ter}</option>
                ))}
              </select>

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 bg-white"
              >
                <option value="">Todos los tipos</option>
                <option value="entrevista">Entrevista</option>
                <option value="objetivos">Objetivos Terapéuticos</option>
                <option value="evaluacion">Sesión de Evaluación</option>
                <option value="terapia">Sesión de Terapias</option>
                <option value="observaciones">Observaciones</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setOpenNotaModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-[#7B1FA2] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#6A1B9A] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva Nota
          </button>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          <style>{`
            .flex-1::-webkit-scrollbar {
              width: 8px;
            }
            .flex-1::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 4px;
            }
            .flex-1::-webkit-scrollbar-thumb {
              background: #c1c1c1;
              border-radius: 4px;
            }
            .flex-1::-webkit-scrollbar-thumb:hover {
              background: #a1a1a1;
            }
            .flex-1 {
              scrollbar-width: thin;
              scrollbar-color: #c1c1c1 #f1f1f1;
            }
          `}</style>
          
          {loading ? (
            <div className="p-3 sm:p-4">
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-100">
                  <div className="w-6 h-6 border-2 border-[#7B1FA2] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Cargando notas...</p>
                <p className="text-xs text-gray-500">Obteniendo historial del paciente</p>
              </div>
            </div>
          ) : notas && notas.length > 0 ? (
            <div className="p-3 sm:p-4 space-y-3">
              {notasFiltradas.length > 0 ? notasFiltradas.map((n) => {
                const [nombre, especialidad] = n.autor.split(' — ');
                return (
                  <div
                    key={n.id}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all bg-white"
                  >
                    <div className="bg-gradient-to-r from-gray-50 to-white p-4 sm:p-5 border-b border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A] flex items-center justify-center text-white text-base font-bold shadow-sm flex-shrink-0">
                          {nombre.split(' ').map(p => p[0]).join('')}
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
                    {n.entrevista && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-4.5 h-4.5 text-purple-600" />
                          </div>
                          <span className="text-sm font-bold text-purple-700 uppercase tracking-wide">
                            Entrevista
                          </span>
                        </div>
                        <div className="text-base text-gray-800 leading-relaxed pl-10">
                          {formatTextWithLineBreaks(n.entrevista)}
                        </div>
                      </div>
                    )}

                    {n.objetivosTerapeuticos && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Target className="w-4.5 h-4.5 text-emerald-600" />
                          </div>
                          <span className="text-sm font-bold text-emerald-700 uppercase tracking-wide">
                            Objetivos Terapéuticos
                          </span>
                        </div>
                        <div className="text-base text-gray-800 leading-relaxed pl-10">
                          {formatTextWithLineBreaks(n.objetivosTerapeuticos)}
                        </div>
                      </div>
                    )}

                    {n.sesionEvaluacion && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Activity className="w-4.5 h-4.5 text-blue-600" />
                          </div>
                          <span className="text-sm font-bold text-blue-700 uppercase tracking-wide">
                            Sesión de Evaluación
                          </span>
                        </div>
                        <div className="text-base text-gray-800 leading-relaxed pl-10">
                          {formatTextWithLineBreaks(n.sesionEvaluacion)}
                        </div>
                      </div>
                    )}

                    {n.sesionTerapias && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="w-4.5 h-4.5 text-amber-600" />
                          </div>
                          <span className="text-sm font-bold text-amber-700 uppercase tracking-wide">
                            Sesión de Terapias
                          </span>
                        </div>
                        <div className="text-base text-gray-800 leading-relaxed pl-10">
                          {formatTextWithLineBreaks(n.sesionTerapias)}
                        </div>
                      </div>
                    )}

                    {n.observaciones && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <ClipboardList className="w-4.5 h-4.5 text-gray-600" />
                          </div>
                          <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                            Observaciones
                          </span>
                        </div>
                        <div className="text-base text-gray-800 leading-relaxed pl-10">
                          {formatTextWithLineBreaks(n.observaciones)}
                        </div>
                      </div>
                    )}
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
            <div className="p-3 sm:p-4">
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

      {/* Modal para nueva nota */}
      {openNotaModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
            onClick={() => setOpenNotaModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col border border-gray-100"
              style={{ height: 'calc(100vh - 100px)', maxHeight: '900px' }}
              onClick={(e) => e.stopPropagation()}
            >
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
                  <button
                    onClick={() => setOpenNotaModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-full">
                  <div className="flex flex-col">
                    <label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-3">
                      <User className="w-5 h-5 text-purple-600" />
                      Entrevista
                    </label>
                    <textarea
                      value={nota.entrevista}
                      onChange={e => setNota({ ...nota, entrevista: e.target.value })}
                      className="flex-1 w-full px-5 py-4 text-base border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all bg-white text-gray-900 resize-none"
                      placeholder="Describe la entrevista con el paciente..."
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-3">
                      <Target className="w-5 h-5 text-emerald-600" />
                      Objetivos Terapéuticos
                    </label>
                    <textarea
                      value={nota.objetivosTerapeuticos}
                      onChange={e => setNota({ ...nota, objetivosTerapeuticos: e.target.value })}
                      className="flex-1 w-full px-5 py-4 text-base border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all bg-white text-gray-900 resize-none"
                      placeholder="Define los objetivos terapéuticos..."
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-3">
                      <Activity className="w-5 h-5 text-blue-600" />
                      Sesión de Evaluación
                    </label>
                    <textarea
                      value={nota.sesionEvaluacion}
                      onChange={e => setNota({ ...nota, sesionEvaluacion: e.target.value })}
                      className="flex-1 w-full px-5 py-4 text-base border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all bg-white text-gray-900 resize-none"
                      placeholder="Resultados de la evaluación..."
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-3">
                      <Stethoscope className="w-5 h-5 text-amber-600" />
                      Sesión de Terapias
                    </label>
                    <textarea
                      value={nota.sesionTerapias}
                      onChange={e => setNota({ ...nota, sesionTerapias: e.target.value })}
                      className="flex-1 w-full px-5 py-4 text-base border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all bg-white text-gray-900 resize-none"
                      placeholder="Detalles de la sesión de terapia..."
                    />
                  </div>

                  <div className="flex flex-col lg:col-span-2">
                    <label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-3">
                      <ClipboardList className="w-5 h-5 text-gray-600" />
                      Observaciones
                    </label>
                    <textarea
                      value={nota.observaciones}
                      onChange={e => setNota({ ...nota, observaciones: e.target.value })}
                      className="flex-1 w-full px-5 py-4 text-base border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all bg-white text-gray-900 resize-none min-h-[150px]"
                      placeholder="Observaciones generales..."
                    />
                  </div>
                </div>
              </div>

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
                  onClick={handleAgregarComentario}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#A3C644] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#8FB82D] transition-all shadow-sm disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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