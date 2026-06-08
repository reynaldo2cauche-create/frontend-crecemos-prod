import React, { useState, useEffect } from 'react';
import { FileText, Save, ChevronDown, ChevronUp, Plus, Eye, Calendar, User, X, ShieldAlert } from 'lucide-react';
import { calcularEdad } from '../../../../utils/date';
import { ROLES } from '../../../../constants/roles';

const ReporteEvolucion = ({
  paciente,
  user,
  loading,
  reporteEvolucion,
  handleInputChange,
  handleSaveReporte,
  saving,
  reportesExistentes,
  vistaResumida,
  toggleVistaResumida,
  frecuenciasAtencion,
  handleNuevoReporte,
  serviciosPaciente
}) => {
  // ✅ CONTROL DE PERMISOS - Solo TERAPEUTA y ADMINISTRADOR pueden editar
  const puedeEditarHistoriaClinica = user?.rol?.id === ROLES.ADMINISTRADOR || user?.rol?.id === ROLES.TERAPEUTA;
  const esAdmision = user?.rol?.id === ROLES.ADMISION;

  const [expandedReportes, setExpandedReportes] = useState({});

  // Estados para el periodo de intervención
  const [mesInicio, setMesInicio] = useState('');
  const [anioInicio, setAnioInicio] = useState(new Date().getFullYear().toString());
  const [mesFin, setMesFin] = useState('');
  const [anioFin, setAnioFin] = useState(new Date().getFullYear().toString());

  // Meses del año
  const meses = [
    { value: 'Enero', label: 'Enero' },
    { value: 'Febrero', label: 'Febrero' },
    { value: 'Marzo', label: 'Marzo' },
    { value: 'Abril', label: 'Abril' },
    { value: 'Mayo', label: 'Mayo' },
    { value: 'Junio', label: 'Junio' },
    { value: 'Julio', label: 'Julio' },
    { value: 'Agosto', label: 'Agosto' },
    { value: 'Septiembre', label: 'Septiembre' },
    { value: 'Octubre', label: 'Octubre' },
    { value: 'Noviembre', label: 'Noviembre' },
    { value: 'Diciembre', label: 'Diciembre' }
  ];

  // Años (últimos 5 años + próximos 2)
  const aniosDisponibles = [];
  const anioActual = new Date().getFullYear();
  for (let i = anioActual - 5; i <= anioActual + 2; i++) {
    aniosDisponibles.push(i);
  }

  // Actualizar periodo cuando cambien los valores
  useEffect(() => {
    if (mesInicio && anioInicio && mesFin && anioFin) {
      const periodoFormateado = `${mesInicio} ${anioInicio} - ${mesFin} ${anioFin}`;
      handleInputChange('periodoIntervencion', periodoFormateado);
    }
  }, [mesInicio, anioInicio, mesFin, anioFin]);

  // Parsear periodo existente cuando se carga un reporte
  useEffect(() => {
    if (reporteEvolucion.periodoIntervencion) {
      // Ejemplo: "Marzo 2024 - Enero 2025"
      const match = reporteEvolucion.periodoIntervencion.match(/^(\w+)\s+(\d{4})\s*-\s*(\w+)\s+(\d{4})$/);
      if (match) {
        setMesInicio(match[1]);
        setAnioInicio(match[2]);
        setMesFin(match[3]);
        setAnioFin(match[4]);
      }
    }
  }, [reporteEvolucion.periodoIntervencion]);

  const toggleExpandedReporte = (reporteId) => {
    setExpandedReportes(prev => ({
      ...prev,
      [reporteId]: !prev[reporteId]
    }));
  };

  // Expandir el primer reporte por defecto cuando se cargan los reportes
  useEffect(() => {
    if (reportesExistentes.length > 0 && Object.keys(expandedReportes).length === 0) {
      const primerReporte = reportesExistentes[0];
      setExpandedReportes({ [primerReporte.id]: true });
    }
  }, [reportesExistentes, expandedReportes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-[#7B1FA2] rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 text-xs font-medium">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Vista Resumida - Lista de Reportes */}
      {vistaResumida ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Reportes de Evolución</h2>
                <p className="text-sm text-gray-500">Historial de evaluaciones del paciente</p>
              </div>
            </div>
            {puedeEditarHistoriaClinica ? (
              <button
                onClick={handleNuevoReporte}
                className="flex items-center gap-2 bg-[#7B1FA2] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#6A1B9A] transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Nuevo Reporte
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-amber-700 font-medium">
                  Solo lectura
                </span>
              </div>
            )}
          </div>

          {/* Lista de Reportes */}
          {reportesExistentes && reportesExistentes.length > 0 ? (
            <div className="space-y-3">
              {reportesExistentes.map((reporte, index) => {
                const isExpanded = expandedReportes[reporte.id];
                return (
                  <div
                    key={reporte.id}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all hover:shadow-md"
                  >
                    {/* Header del reporte */}
                    <button
                      onClick={() => toggleExpandedReporte(reporte.id)}
                      className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-base font-bold text-gray-900">Reporte {reportesExistentes.length - index}</h3>
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                              {reporte.servicio?.nombre || reporte.servicio}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {reporte.fechaEvaluacion}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span>{reporte.periodoIntervencion}</span>
                          </div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {/* Contenido expandible */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-6 bg-gray-50">
                        <div className="space-y-6">
                          {/* Grid de información */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InfoItem label="Especialista" value={reporte.especialista} />
                            <InfoItem label="Edad" value={reporte.edad ? `${reporte.edad} años` : null} />
                            <InfoItem label="Frecuencia" value={reporte.frecuenciaAtencion} />
                          </div>

                          {/* Secciones de texto */}
                          <TextSection title="Metodología" content={reporte.metodologia} />
                          <TextSection title="Objetivos" content={reporte.objetivos} />
                          <TextSection title="Logros" content={reporte.logros} />
                          <TextSection title="Dificultades" content={reporte.dificultades} />
                          <TextSection title="Objetivos Siguiente Período" content={reporte.objetivosSiguientePeriodo} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay reportes de evolución</h3>
              <p className="text-sm text-gray-500 mb-4">
                Aún no se han creado reportes de evolución para este paciente
              </p>
              {puedeEditarHistoriaClinica && (
                <button
                  onClick={handleNuevoReporte}
                  className="inline-flex items-center gap-2 bg-[#7B1FA2] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#6A1B9A] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Crear Primer Reporte
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Vista de Formulario - Crear/Editar */
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7B1FA2]/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-[#7B1FA2]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Nuevo Reporte de Evolución</h2>
                <p className="text-sm text-gray-500">Complete la información del reporte</p>
              </div>
            </div>
            {reportesExistentes && reportesExistentes.length > 0 && (
              <button
                onClick={toggleVistaResumida}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Sección I: DATOS GENERALES */}
            <Section title="I. DATOS GENERALES">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Servicio" required>
                  <select
                    value={reporteEvolucion.servicio}
                    onChange={(e) => handleInputChange('servicio', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
                  >
                    <option value="">Seleccionar servicio</option>
                    {serviciosPaciente.map((servicio) => (
                      <option key={servicio.id} value={servicio.servicio.id}>
                        {servicio.servicio.nombre}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Edad (Actual al realizar el reporte)">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={calcularEdad(paciente?.fecha_nacimiento)}
                      disabled
                      className="flex-1 px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium"
                    />
                    <span className="text-sm text-gray-600 font-medium">años</span>
                  </div>
                </FormField>

                <FormField label="Fecha de Evaluación" required>
                  <input
                    type="date"
                    value={reporteEvolucion.fechaEvaluacion}
                    onChange={(e) => handleInputChange('fechaEvaluacion', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
                  />
                </FormField>

                <FormField label="Frecuencia de Atención" required>
                  <select
                    value={reporteEvolucion.frecuenciaAtencion}
                    onChange={(e) => handleInputChange('frecuenciaAtencion', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
                  >
                    <option value="">Seleccionar frecuencia</option>
                    {frecuenciasAtencion.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Especialista">
                  <input
                    type="text"
                    value={user?.nombres + ' ' + user?.apellidos}
                    disabled
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                    Periodo de Intervención
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Fecha Inicio */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Desde
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1.5">Mes</label>
                          <select
                            value={mesInicio}
                            onChange={(e) => setMesInicio(e.target.value)}
                            className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
                          >
                            <option value="">Mes</option>
                            {meses.map((mes) => (
                              <option key={mes.value} value={mes.value}>
                                {mes.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1.5">Año</label>
                          <select
                            value={anioInicio}
                            onChange={(e) => setAnioInicio(e.target.value)}
                            className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
                          >
                            {aniosDisponibles.map((anio) => (
                              <option key={anio} value={anio}>
                                {anio}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Fecha Fin */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Hasta
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1.5">Mes</label>
                          <select
                            value={mesFin}
                            onChange={(e) => setMesFin(e.target.value)}
                            className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
                          >
                            <option value="">Mes</option>
                            {meses.map((mes) => (
                              <option key={mes.value} value={mes.value}>
                                {mes.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1.5">Año</label>
                          <select
                            value={anioFin}
                            onChange={(e) => setAnioFin(e.target.value)}
                            className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
                          >
                            {aniosDisponibles.map((anio) => (
                              <option key={anio} value={anio}>
                                {anio}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vista previa del periodo */}
                  {mesInicio && anioInicio && mesFin && anioFin && (
                    <div className="mt-3 px-4 py-2.5 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <p className="text-sm text-purple-800 font-medium">
                        Periodo: <span className="font-bold">{mesInicio} {anioInicio} - {mesFin} {anioFin}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* Sección II: METODOLOGÍA EMPLEADA */}
            <Section title="II. METODOLOGÍA EMPLEADA">
              <FormField label="Describa la metodología empleada en el tratamiento" required>
                <textarea
                  value={reporteEvolucion.metodologia}
                  onChange={(e) => handleInputChange('metodologia', e.target.value)}
                  placeholder="Escriba aquí la metodología..."
                  rows={6}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
                />
              </FormField>
            </Section>

            {/* Sección III: OBJETIVOS TRAZADOS */}
            <Section title="III. OBJETIVOS TRAZADOS (24 SESIONES)">
              <FormField label="Describa los objetivos trazados para las 24 sesiones" required>
                <textarea
                  value={reporteEvolucion.objetivos}
                  onChange={(e) => handleInputChange('objetivos', e.target.value)}
                  placeholder="Escriba aquí los objetivos..."
                  rows={6}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
                />
              </FormField>
            </Section>

            {/* Sección IV: LOGROS */}
            <Section title="IV. LOGROS">
              <FormField label="Describa los logros alcanzados durante el tratamiento" required>
                <textarea
                  value={reporteEvolucion.logros}
                  onChange={(e) => handleInputChange('logros', e.target.value)}
                  placeholder="Escriba aquí los logros..."
                  rows={6}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
                />
              </FormField>
            </Section>

            {/* Sección V: DIFICULTADES */}
            <Section title="V. DIFICULTADES">
              <FormField label="Describa las dificultades encontradas durante el tratamiento" required>
                <textarea
                  value={reporteEvolucion.dificultades}
                  onChange={(e) => handleInputChange('dificultades', e.target.value)}
                  placeholder="Escriba aquí las dificultades..."
                  rows={6}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
                />
              </FormField>
            </Section>

            {/* Sección VI: OBJETIVOS PARA EL SIGUIENTE PERIODO */}
            <Section title="VI. OBJETIVOS PARA EL SIGUIENTE PERIODO">
              <FormField label="Describa los objetivos para el siguiente periodo de tratamiento" required>
                <textarea
                  value={reporteEvolucion.objetivosSiguientePeriodo}
                  onChange={(e) => handleInputChange('objetivosSiguientePeriodo', e.target.value)}
                  placeholder="Escriba aquí los objetivos..."
                  rows={6}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
                />
              </FormField>
            </Section>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              {reportesExistentes && reportesExistentes.length > 0 && (
                <button
                  onClick={toggleVistaResumida}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
              )}
              {puedeEditarHistoriaClinica && (
                <button
                  onClick={handleSaveReporte}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#A3C644] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Reporte de Evolución
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componentes auxiliares
const Section = ({ title, children }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-6">
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">{title}</h3>
    {children}
  </div>
);

const FormField = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const InfoItem = ({ label, value }) => (
  <div className="p-4 bg-white rounded-lg border border-gray-100">
    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{label}</p>
    <p className="text-sm text-gray-900 font-medium">{value || 'No especificado'}</p>
  </div>
);

const TextSection = ({ title, content }) => (
  <div>
    <h4 className="text-sm font-bold text-[#7B1FA2] mb-3">{title}</h4>
    <div className="p-4 bg-white rounded-lg border border-gray-100">
      <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
        {content || 'No especificado'}
      </p>
    </div>
  </div>
);

export default ReporteEvolucion;
