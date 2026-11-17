import React, { useState, useEffect } from 'react';
import { FileText, Save, Edit, ChevronDown, ChevronUp, X, ShieldAlert } from 'lucide-react';
import {
  guardarEvaluacionTerapia,
  obtenerEvaluacionesTerapia,
  obtenerEvaluacionTerapiaPorId,
  actualizarEvaluacionTerapia
} from '../../../../services/historiaClinicaService';
import { ROLES } from '../../../../constants/roles';

const formatearFechaSinZonaHoraria = (fechaStr) => {
  if (!fechaStr) return 'No especificado';

  if (typeof fechaStr === 'string' && fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = fechaStr.split('-');
    return `${day}/${month}/${year}`;
  }

  const fecha = new Date(fechaStr + 'T00:00:00');
  const day = String(fecha.getDate()).padStart(2, '0');
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const year = fecha.getFullYear();
  return `${day}/${month}/${year}`;
};

const EvaluacionTerapiaOcupacional = ({ pacienteId, usuarioId, user }) => {
  // ✅ CONTROL DE PERMISOS - Solo TERAPEUTA y ADMINISTRADOR pueden editar
  const puedeEditarHistoriaClinica = user?.rol?.id === ROLES.ADMINISTRADOR || user?.rol?.id === ROLES.TERAPEUTA;
  const esAdmision = user?.rol?.id === ROLES.ADMISION;

  const [evaluacion, setEvaluacion] = useState(getEstadoInicial());
  const [evaluacionActual, setEvaluacionActual] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [expandida, setExpandida] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  function getEstadoInicial() {
    return {
      fecha_evaluacion: new Date().toISOString().split('T')[0],
      motivo_consulta: '',
      tipo_parto: '',
      estimulacion_temprana: false,
      terapias_anteriores: false,
      observaciones_datos_generales: '',
      nivel_alerta: '',
      nivel_atencion: '',
      nivel_actividad: '',
      usa_lentes: false,
      fijacion_visual: false,
      contacto_visual: false,
      seguimiento_visual: false,
      observaciones_visuales: '',
      reconoce_fuentes_sonoras: false,
      busca_sonido: false,
      observaciones_auditivas: '',
      desordenes_modulacion: false,
      hiperresponsividad_tactil: false,
      hiporresponsividad_tactil: false,
      observaciones_tactiles: '',
      selectividad_comidas: false,
      hiperresponsividad_propioceptivo: false,
      hiporresponsividad_propioceptivo: false,
      observaciones_propioceptivo: '',
      inseguridad_gravitacional: false,
      intolerancia_movimiento: false,
      hiporrespuesta_movimiento: false,
      observaciones_vestibular: '',
      fuerza_muscular: '',
      rango_articular: '',
      coordinacion_bimanual: '',
      cruce_linea_media: false,
      dominacion_manual: '',
      observaciones_motor: '',
      intereses: '',
      atencion_concentracion: '',
      seguimiento_ordenes: '',
      otros_cognitivo: '',
      alimentacion_independiente: '',
      observacion_alimentacion: '',
      desvestido_superior: false,
      desvestido_inferior: false,
      vestido_superior: false,
      vestido_inferior: false,
      manejo_botones: false,
      manejo_cierre: false,
      manejo_lazos: false,
      observacion_vestido: '',
      esfinter_vesical: false,
      esfinter_anal: false,
      lavado_manos: false,
      lavado_cara: false,
      cepillado_dientes: false,
      observacion_higiene: '',
      prension_lapiz_imitado: false,
      prension_lapiz_copiado: false,
      prension_lapiz_coloreado: false,
      recortado: false,
      prension_tijeras: '',
      observacion_escolar: '',
      juguetes_preferidos: '',
      tipo_juego_sensoriomotor: false,
      tipo_juego_simbolico: false,
      tipo_juego_otro: false,
      lugar_preferido_jugar: '',
      observacion_juego: '',
      lenguaje: '',
      conclusiones: '',
      sugerencias: '',
      objetivos_iniciales: '',
      observaciones_gustativos: ''
    };
  }

  useEffect(() => {
    if (pacienteId) {
      cargarEvaluacion();
    }
  }, [pacienteId]);

  const cargarEvaluacion = async () => {
    try {
      setCargando(true);
      const evaluaciones = await obtenerEvaluacionesTerapia(pacienteId);

      if (evaluaciones && evaluaciones.length > 0) {
        const ultima = evaluaciones[0];
        const evaluacionFormateada = convertirCamelCaseASnakeCase(ultima);
        setEvaluacionActual(ultima);
        setEvaluacion(evaluacionFormateada);
        setModoEdicion(false);
      } else {
        setEvaluacionActual(null);
        setEvaluacion(getEstadoInicial());
        setModoEdicion(true);
      }
    } catch (error) {
      console.error('Error al cargar evaluación:', error);
      mostrarSnackbar('Error al cargar evaluación', 'error');
      setEvaluacion(getEstadoInicial());
      setModoEdicion(true);
    } finally {
      setCargando(false);
    }
  };

  const convertirCamelCaseASnakeCase = (obj) => {
    if (!obj) return getEstadoInicial();

    return {
      fecha_evaluacion: obj.fechaEvaluacion,
      motivo_consulta: obj.motivoConsulta || '',
      tipo_parto: obj.tipoParto || '',
      estimulacion_temprana: obj.estimulacionTemprana || false,
      terapias_anteriores: obj.terapiasAnteriores || false,
      observaciones_datos_generales: obj.observacionesDatosGenerales || '',
      nivel_alerta: obj.nivelAlerta || '',
      nivel_atencion: obj.nivelAtencion || '',
      nivel_actividad: obj.nivelActividad || '',
      usa_lentes: obj.usaLentes || false,
      fijacion_visual: obj.fijacionVisual || false,
      contacto_visual: obj.contactoVisual || false,
      seguimiento_visual: obj.seguimientoVisual || false,
      observaciones_visuales: obj.observacionesVisuales || '',
      reconoce_fuentes_sonoras: obj.reconoceFuentesSonoras || false,
      busca_sonido: obj.buscaSonido || false,
      observaciones_auditivas: obj.observacionesAuditivas || '',
      desordenes_modulacion: obj.desordenesModulacion || false,
      hiperresponsividad_tactil: obj.hiperresponsividadTactil || false,
      hiporresponsividad_tactil: obj.hiporresponsividadTactil || false,
      observaciones_tactiles: obj.observacionesTactiles || '',
      selectividad_comidas: obj.selectividadComidas || false,
      observaciones_gustativos: obj.observacionesGustativos || '',
      hiperresponsividad_propioceptivo: obj.hiperresponsividadPropioceptivo || false,
      hiporresponsividad_propioceptivo: obj.hiporresponsividadPropioceptivo || false,
      observaciones_propioceptivo: obj.observacionesPropioceptivo || '',
      inseguridad_gravitacional: obj.inseguridadGravitacional || false,
      intolerancia_movimiento: obj.intoleranciaMovimiento || false,
      hiporrespuesta_movimiento: obj.hiporrespuestaMovimiento || false,
      observaciones_vestibular: obj.observacionesVestibular || '',
      fuerza_muscular: obj.fuerzaMuscular || '',
      rango_articular: obj.rangoArticular || '',
      coordinacion_bimanual: obj.coordinacionBimanual || '',
      cruce_linea_media: obj.cruceLineaMedia || false,
      dominacion_manual: obj.dominacionManual || '',
      observaciones_motor: obj.observacionesMotor || '',
      intereses: obj.intereses || '',
      atencion_concentracion: obj.atencionConcentracion || '',
      seguimiento_ordenes: obj.seguimientoOrdenes || '',
      otros_cognitivo: obj.otrosCognitivo || '',
      alimentacion_independiente: obj.alimentacionIndependiente || '',
      observacion_alimentacion: obj.observacionAlimentacion || '',
      desvestido_superior: obj.desvestidoSuperior || false,
      desvestido_inferior: obj.desvestidoInferior || false,
      vestido_superior: obj.vestidoSuperior || false,
      vestido_inferior: obj.vestidoInferior || false,
      manejo_botones: obj.manejoBotones || false,
      manejo_cierre: obj.manejoCierre || false,
      manejo_lazos: obj.manejoLazos || false,
      observacion_vestido: obj.observacionVestido || '',
      esfinter_vesical: obj.esfinterVesical || false,
      esfinter_anal: obj.esfinterAnal || false,
      lavado_manos: obj.lavadoManos || false,
      lavado_cara: obj.lavadoCara || false,
      cepillado_dientes: obj.cepilladoDientes || false,
      observacion_higiene: obj.observacionHigiene || '',
      prension_lapiz_imitado: obj.prensionLapizImitado || false,
      prension_lapiz_copiado: obj.prensionLapizCopiado || false,
      prension_lapiz_coloreado: obj.prensionLapizColoreado || false,
      recortado: obj.recortado || false,
      prension_tijeras: obj.prensionTijeras || '',
      observacion_escolar: obj.observacionEscolar || '',
      juguetes_preferidos: obj.juguetesPreferidos || '',
      tipo_juego_sensoriomotor: obj.tipoJuegoSensoriomotor || false,
      tipo_juego_simbolico: obj.tipoJuegoSimbolico || false,
      tipo_juego_otro: obj.tipoJuegoOtro || false,
      lugar_preferido_jugar: obj.lugarPreferidoJugar || '',
      observacion_juego: obj.observacionJuego || '',
      lenguaje: obj.lenguaje || '',
      conclusiones: obj.conclusiones || '',
      sugerencias: obj.sugerencias || '',
      objetivos_iniciales: obj.objetivosIniciales || ''
    };
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleInputChange = (field, value) => {
    setEvaluacion(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field) => {
    setEvaluacion(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);

      if (!pacienteId || !usuarioId) {
        mostrarSnackbar('Error: Faltan datos del paciente o usuario', 'error');
        return;
      }

      const evaluacionData = {
        paciente_id: Number(pacienteId),
        usuario_id: Number(usuarioId),
        ...evaluacion
      };

      if (evaluacionActual) {
        await actualizarEvaluacionTerapia(evaluacionActual.id, evaluacionData);
        mostrarSnackbar('Evaluación actualizada correctamente');
      } else {
        await guardarEvaluacionTerapia(evaluacionData);
        mostrarSnackbar('Evaluación guardada correctamente');
      }

      await cargarEvaluacion();
      setModoEdicion(false);
      setExpandida(true);

    } catch (error) {
      console.error('Error al guardar:', error);
      mostrarSnackbar(
        error.response?.data?.message || 'Error al guardar la evaluación',
        'error'
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = () => {
    setModoEdicion(true);
    setExpandida(true);
  };

  const handleCancelar = () => {
    if (evaluacionActual) {
      const evaluacionFormateada = convertirCamelCaseASnakeCase(evaluacionActual);
      setEvaluacion(evaluacionFormateada);
      setModoEdicion(false);
    } else {
      setEvaluacion(getEstadoInicial());
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-[#7B1FA2] rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 text-xs font-medium">Cargando evaluación...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Notification */}
      {snackbar.open && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border transform transition-all duration-300 ${
          snackbar.severity === 'success'
            ? 'bg-white border-gray-100'
            : 'bg-white border-red-100'
        } flex items-center gap-2.5`}>
          <div className={`w-1.5 h-1.5 rounded-full ${snackbar.severity === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`}></div>
          <span className="text-xs font-medium text-gray-700">{snackbar.message}</span>
          <button onClick={() => setSnackbar({ ...snackbar, open: false })} className="ml-2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 p-4 bg-purple-50 border border-purple-100 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">EVALUACIÓN DE TERAPIA OCUPACIONAL</h2>
            {evaluacionActual && !modoEdicion && (
              <p className="text-sm text-gray-500">Última evaluación: {formatearFechaSinZonaHoraria(evaluacionActual.fechaEvaluacion)}</p>
            )}
          </div>
        </div>

        {evaluacionActual && !modoEdicion && (
          puedeEditarHistoriaClinica ? (
            <button
              onClick={handleEditar}
              className="p-2.5 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-all"
            >
              <Edit className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-amber-700 font-medium">
                Solo lectura
              </span>
            </div>
          )
        )}
      </div>

      {/* Vista de resumen cuando existe evaluación y no está en modo edición */}
      {evaluacionActual && !modoEdicion ? (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <button
            onClick={() => setExpandida(!expandida)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-all"
          >
            <span className="font-semibold text-gray-900">Evaluación Registrada</span>
            {expandida ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandida && (
            <div className="p-6">
              <VistaResumen evaluacion={evaluacion} />
            </div>
          )}
        </div>
      ) : (
        /* Formulario de edición/creación COMPLETO */
        <FormularioEvaluacionCompleto
          evaluacion={evaluacion}
          onInputChange={handleInputChange}
          onCheckboxChange={handleCheckboxChange}
          onGuardar={handleGuardar}
          onCancelar={handleCancelar}
          guardando={guardando}
          esNuevo={!evaluacionActual}
          puedeEditarHistoriaClinica={puedeEditarHistoriaClinica}
        />
      )}
    </div>
  );
};

// Componente de Checkbox Personalizado con Tailwind
const CheckboxPersonalizado = ({
  id,
  checked,
  onChange,
  label,
  name,
  disabled = false
}) => (
  <div className="inline-block mr-4 mb-2">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      name={name}
      disabled={disabled}
      className="w-4 h-4 text-[#7B1FA2] border-gray-300 rounded focus:ring-[#7B1FA2]"
    />
    <label htmlFor={id} className="ml-2 text-sm text-gray-700">
      {label}
    </label>
  </div>
);

// Componentes auxiliares movidos FUERA del componente principal
const CheckboxField = ({ id, checked, onChange, label }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 text-[#7B1FA2] border-gray-300 rounded focus:ring-[#7B1FA2]"
    />
    <span className="text-sm text-gray-700">{label}</span>
  </label>
);

const Section = ({ title, children }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
      {title}
    </h3>
    {children}
  </div>
);

const SubSection = ({ title, children }) => (
  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
    <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>
    {children}
  </div>
);

const FormField = ({ label, required, children, className = '' }) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

// FORMULARIO COMPLETO CON TODAS LAS SECCIONES
const FormularioEvaluacionCompleto = ({
  evaluacion,
  onInputChange,
  onCheckboxChange,
  onGuardar,
  onCancelar,
  guardando,
  esNuevo,
  puedeEditarHistoriaClinica
}) => {
  return (
    <div className="space-y-6">
      {/* DATOS DE LA EVALUACIÓN */}
      <Section title="DATOS DE LA EVALUACIÓN">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="FECHA DE EVALUACIÓN" required>
            <input
              type="date"
              value={evaluacion.fecha_evaluacion}
              onChange={(e) => onInputChange('fecha_evaluacion', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all"
            />
          </FormField>

          <FormField label="MOTIVO DE CONSULTA" required className="md:col-span-2">
            <textarea
              value={evaluacion.motivo_consulta}
              onChange={(e) => onInputChange('motivo_consulta', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all resize-none"
            />
          </FormField>
        </div>
      </Section>

      {/* 1. DATOS GENERALES */}
      <Section title="1. DATOS GENERALES">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="TIPO DE PARTO">
            <select
              value={evaluacion.tipo_parto}
              onChange={(e) => onInputChange('tipo_parto', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all"
            >
              <option value="">Seleccionar</option>
              <option value="Natural">Parto Natural</option>
              <option value="Cesárea">Parto por Cesárea</option>
            </select>
          </FormField>

          <div className="space-y-3">
            <CheckboxField
              id="estimulacion_temprana"
              checked={evaluacion.estimulacion_temprana}
              onChange={() => onCheckboxChange('estimulacion_temprana')}
              label="LLEVÓ ESTIMULACIÓN TEMPRANA"
            />
            <CheckboxField
              id="terapias_anteriores"
              checked={evaluacion.terapias_anteriores}
              onChange={() => onCheckboxChange('terapias_anteriores')}
              label="LLEVÓ TERAPIAS ANTERIORMENTE"
            />
          </div>

          <FormField label="OBSERVACIONES" className="md:col-span-2">
            <textarea
              value={evaluacion.observaciones_datos_generales}
              onChange={(e) => onInputChange('observaciones_datos_generales', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all resize-none"
            />
          </FormField>
        </div>
      </Section>

      {/* 2. OBSERVACIONES GENERALES */}
      <Section title="2. OBSERVACIONES GENERALES">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="NIVEL DE ALERTA">
            <input
              type="text"
              value={evaluacion.nivel_alerta}
              onChange={(e) => onInputChange('nivel_alerta', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all"
            />
          </FormField>

          <FormField label="NIVEL DE ATENCIÓN">
            <input
              type="text"
              value={evaluacion.nivel_atencion}
              onChange={(e) => onInputChange('nivel_atencion', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all"
            />
          </FormField>

          <FormField label="NIVEL DE ACTIVIDAD">
            <input
              type="text"
              value={evaluacion.nivel_actividad}
              onChange={(e) => onInputChange('nivel_actividad', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all"
            />
          </FormField>
        </div>
      </Section>

      {/* 3. COMPONENTE SENSORIAL */}
      <Section title="3. COMPONENTE SENSORIAL">
        <div className="space-y-6">
          {/* VISUALES */}
          <SubSection title="VISUALES">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <CheckboxField
                id="usa_lentes"
                checked={evaluacion.usa_lentes}
                onChange={() => onCheckboxChange('usa_lentes')}
                label="USA LENTES"
              />
              <CheckboxField
                id="fijacion_visual"
                checked={evaluacion.fijacion_visual}
                onChange={() => onCheckboxChange('fijacion_visual')}
                label="FIJACIÓN VISUAL"
              />
              <CheckboxField
                id="contacto_visual"
                checked={evaluacion.contacto_visual}
                onChange={() => onCheckboxChange('contacto_visual')}
                label="CONTACTO VISUAL"
              />
              <CheckboxField
                id="seguimiento_visual"
                checked={evaluacion.seguimiento_visual}
                onChange={() => onCheckboxChange('seguimiento_visual')}
                label="SEGUIMIENTO VISUAL"
              />
            </div>
            <FormField label="OBSERVACIONES">
              <textarea
                value={evaluacion.observaciones_visuales}
                onChange={(e) => onInputChange('observaciones_visuales', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all resize-none"
              />
            </FormField>
          </SubSection>

          {/* AUDITIVAS */}
          <SubSection title="AUDITIVAS">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <CheckboxField
                id="reconoce_fuentes_sonoras"
                checked={evaluacion.reconoce_fuentes_sonoras}
                onChange={() => onCheckboxChange('reconoce_fuentes_sonoras')}
                label="RECONOCE FUENTES SONORAS"
              />
              <CheckboxField
                id="busca_sonido"
                checked={evaluacion.busca_sonido}
                onChange={() => onCheckboxChange('busca_sonido')}
                label="BUSCA EL SONIDO"
              />
            </div>
            <FormField label="OBSERVACIONES">
              <textarea
                value={evaluacion.observaciones_auditivas}
                onChange={(e) => onInputChange('observaciones_auditivas', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all resize-none"
              />
            </FormField>
          </SubSection>

          {/* TÁCTILES */}
          <SubSection title="TÁCTILES">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <CheckboxField
                id="desordenes_modulacion"
                checked={evaluacion.desordenes_modulacion}
                onChange={() => onCheckboxChange('desordenes_modulacion')}
                label="DESÓRDENES DE MODULACIÓN"
              />
              <CheckboxField
                id="hiperresponsividad_tactil"
                checked={evaluacion.hiperresponsividad_tactil}
                onChange={() => onCheckboxChange('hiperresponsividad_tactil')}
                label="HIPERRESPONSIVIDAD"
              />
              <CheckboxField
                id="hiporresponsividad_tactil"
                checked={evaluacion.hiporresponsividad_tactil}
                onChange={() => onCheckboxChange('hiporresponsividad_tactil')}
                label="HIPORRESPONSIVIDAD"
              />
            </div>
            <FormField label="OBSERVACIONES">
              <textarea
                value={evaluacion.observaciones_tactiles}
                onChange={(e) => onInputChange('observaciones_tactiles', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all resize-none"
              />
            </FormField>
          </SubSection>

          {/* GUSTATIVOS */}
          <SubSection title="GUSTATIVOS">
            <CheckboxField
              id="selectividad_comidas"
              checked={evaluacion.selectividad_comidas}
              onChange={() => onCheckboxChange('selectividad_comidas')}
              label="SELECTIVIDAD EN COMIDAS"
            />
            <FormField label="OBSERVACIONES" className="mt-4">
              <textarea
                value={evaluacion.observaciones_gustativos}
                onChange={(e) => onInputChange('observaciones_gustativos', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all resize-none"
              />
            </FormField>
          </SubSection>

          {/* PROPIOCEPTIVO */}
          <SubSection title="PROPIOCEPTIVO">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <CheckboxField
                id="hiperresponsividad_propioceptivo"
                checked={evaluacion.hiperresponsividad_propioceptivo}
                onChange={() => {
                  onInputChange('hiperresponsividad_propioceptivo', true);
                  onInputChange('hiporresponsividad_propioceptivo', false);
                }}
                label="HIPERRESPONSIVIDAD"
              />
              <CheckboxField
                id="hiporresponsividad_propioceptivo"
                checked={evaluacion.hiporresponsividad_propioceptivo}
                onChange={() => {
                  onInputChange('hiporresponsividad_propioceptivo', true);
                  onInputChange('hiperresponsividad_propioceptivo', false);
                }}
                label="HIPORRESPONSIVIDAD"
              />
            </div>
            <FormField label="OBSERVACIONES">
              <textarea
                value={evaluacion.observaciones_propioceptivo}
                onChange={(e) => onInputChange('observaciones_propioceptivo', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all resize-none"
              />
            </FormField>
          </SubSection>

          {/* VESTIBULAR */}
          <SubSection title="VESTIBULAR">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <CheckboxField
                id="inseguridad_gravitacional"
                checked={evaluacion.inseguridad_gravitacional}
                onChange={() => onCheckboxChange('inseguridad_gravitacional')}
                label="INSEGURIDAD GRAVITACIONAL"
              />
              <CheckboxField
                id="intolerancia_movimiento"
                checked={evaluacion.intolerancia_movimiento}
                onChange={() => onCheckboxChange('intolerancia_movimiento')}
                label="INTOLERANCIA AL MOVIMIENTO"
              />
              <CheckboxField
                id="hiporrespuesta_movimiento"
                checked={evaluacion.hiporrespuesta_movimiento}
                onChange={() => onCheckboxChange('hiporrespuesta_movimiento')}
                label="HIPORRESPUESTA AL MOVIMIENTO"
              />
            </div>
            <FormField label="OBSERVACIONES">
              <textarea
                value={evaluacion.observaciones_vestibular}
                onChange={(e) => onInputChange('observaciones_vestibular', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all resize-none"
              />
            </FormField>
          </SubSection>
        </div>
      </Section>

      {/* 4. COMPONENTE MOTOR */}
      <Section title="4. COMPONENTE MOTOR">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="FUERZA MUSCULAR">
            <input
              type="text"
              value={evaluacion.fuerza_muscular}
              onChange={(e) => onInputChange('fuerza_muscular', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all"
            />
          </FormField>

          <FormField label="RANGO ARTICULAR">
            <select
              value={evaluacion.rango_articular}
              onChange={(e) => onInputChange('rango_articular', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all"
            >
              <option value="">Seleccionar</option>
              <option value="Normal">Normal</option>
              <option value="Hiperlaxitud">Hiperlaxitud Articular</option>
            </select>
          </FormField>

          <FormField label="COORDINACIÓN BIMANUAL">
            <input
              type="text"
              value={evaluacion.coordinacion_bimanual}
              onChange={(e) => onInputChange('coordinacion_bimanual', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all"
            />
          </FormField>

          <div className="flex flex-wrap items-center gap-4">
            <CheckboxField
              id="cruce_linea_media"
              checked={evaluacion.cruce_linea_media}
              onChange={() => onCheckboxChange('cruce_linea_media')}
              label="CRUCE DE LÍNEA MEDIA"
            />
            <FormField label="DOMINACIÓN MANUAL" className="flex-1 min-w-[200px]">
              <select
                value={evaluacion.dominacion_manual}
                onChange={(e) => onInputChange('dominacion_manual', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all"
              >
                <option value="">Seleccionar</option>
                <option value="Derecha">Derecha</option>
                <option value="Izquierda">Izquierda</option>
                <option value="Ambidiestro">Ambidiestro</option>
                <option value="No definido">No definido</option>
              </select>
            </FormField>
          </div>

          <FormField label="OBSERVACIONES" className="md:col-span-2">
            <textarea
              value={evaluacion.observaciones_motor}
              onChange={(e) => onInputChange('observaciones_motor', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all resize-none"
            />
          </FormField>
        </div>
      </Section>

      {/* 5. COMPONENTE PSICOLÓGICO */}
      <Section title="5. COMPONENTE PSICOLÓGICO">
        <FormField label="INTERESES">
          <textarea
            value={evaluacion.intereses}
            onChange={(e) => onInputChange('intereses', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all resize-none"
          />
        </FormField>
      </Section>

      {/* 6. COMPONENTE COGNITIVO */}
      <Section title="6. COMPONENTE COGNITIVO">
        <div className="grid grid-cols-1 gap-6">
          <FormField label="ATENCIÓN-CONCENTRACIÓN">
            <input
              type="text"
              value={evaluacion.atencion_concentracion}
              onChange={(e) => onInputChange('atencion_concentracion', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all"
            />
          </FormField>

          <FormField label="SEGUIMIENTO DE ÓRDENES">
            <input
              type="text"
              value={evaluacion.seguimiento_ordenes}
              onChange={(e) => onInputChange('seguimiento_ordenes', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all"
            />
          </FormField>

          <FormField label="OTROS">
            <input
              type="text"
              value={evaluacion.otros_cognitivo}
              onChange={(e) => onInputChange('otros_cognitivo', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all"
            />
          </FormField>
        </div>
      </Section>

      {/* 7. ÁREA DEL DESEMPEÑO OCUPACIONAL - AVD */}
      <Section title="7. ÁREA DEL DESEMPEÑO OCUPACIONAL - ACTIVIDADES DE VIDA DIARIA (AVD)">
        <div className="space-y-6">
          {/* ALIMENTACIÓN */}
          <SubSection title="ALIMENTACIÓN">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                ALIMENTACIÓN INDEPENDIENTE
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="Independiente"
                    checked={evaluacion.alimentacion_independiente === 'Independiente'}
                    onChange={(e) => onInputChange('alimentacion_independiente', e.target.value)}
                    className="w-4 h-4 text-[#A3C644] border-gray-300 focus:ring-[#A3C644]"
                  />
                  <span className="text-sm text-gray-700">INDEPENDIENTE</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="Dependiente"
                    checked={evaluacion.alimentacion_independiente === 'Dependiente'}
                    onChange={(e) => onInputChange('alimentacion_independiente', e.target.value)}
                    className="w-4 h-4 text-[#A3C644] border-gray-300 focus:ring-[#A3C644]"
                  />
                  <span className="text-sm text-gray-700">DEPENDIENTE</span>
                </label>
              </div>
            </div>
            <FormField label="OBSERVACIÓN">
              <textarea
                value={evaluacion.observacion_alimentacion}
                onChange={(e) => onInputChange('observacion_alimentacion', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all resize-none"
              />
            </FormField>
          </SubSection>

          {/* VESTIDO */}
          <SubSection title="VESTIDO">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <CheckboxField
                id="desvestido_superior"
                checked={evaluacion.desvestido_superior}
                onChange={() => onCheckboxChange('desvestido_superior')}
                label="A) DESVESTIDO PRENDA SUPERIOR"
              />
              <CheckboxField
                id="desvestido_inferior"
                checked={evaluacion.desvestido_inferior}
                onChange={() => onCheckboxChange('desvestido_inferior')}
                label="B) DESVESTIDO PRENDA INFERIOR"
              />
              <CheckboxField
                id="vestido_superior"
                checked={evaluacion.vestido_superior}
                onChange={() => onCheckboxChange('vestido_superior')}
                label="C) VESTIDO PRENDA SUPERIOR"
              />
              <CheckboxField
                id="vestido_inferior"
                checked={evaluacion.vestido_inferior}
                onChange={() => onCheckboxChange('vestido_inferior')}
                label="D) VESTIDO PRENDA INFERIOR"
              />
              <CheckboxField
                id="manejo_botones"
                checked={evaluacion.manejo_botones}
                onChange={() => onCheckboxChange('manejo_botones')}
                label="E) MANEJO DE BOTONES"
              />
              <CheckboxField
                id="manejo_cierre"
                checked={evaluacion.manejo_cierre}
                onChange={() => onCheckboxChange('manejo_cierre')}
                label="F) MANEJO DE CIERRE"
              />
              <CheckboxField
                id="manejo_lazos"
                checked={evaluacion.manejo_lazos}
                onChange={() => onCheckboxChange('manejo_lazos')}
                label="G) MANEJO DE LAZOS"
              />
            </div>
            <FormField label="OBSERVACIÓN">
              <textarea
                value={evaluacion.observacion_vestido}
                onChange={(e) => onInputChange('observacion_vestido', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all resize-none"
              />
            </FormField>
          </SubSection>

          {/* HIGIENE */}
          <SubSection title="HIGIENE">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">A) CONTROL DE ESFÍNTERES:</label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <CheckboxField
                  id="esfinter_vesical"
                  checked={evaluacion.esfinter_vesical}
                  onChange={() => onCheckboxChange('esfinter_vesical')}
                  label="ESFÍNTER VESICAL"
                />
                <CheckboxField
                  id="esfinter_anal"
                  checked={evaluacion.esfinter_anal}
                  onChange={() => onCheckboxChange('esfinter_anal')}
                  label="ESFÍNTER ANAL"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">B) HIGIENE MENOR:</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CheckboxField
                  id="lavado_manos"
                  checked={evaluacion.lavado_manos}
                  onChange={() => onCheckboxChange('lavado_manos')}
                  label="LAVADO DE MANOS"
                />
                <CheckboxField
                  id="lavado_cara"
                  checked={evaluacion.lavado_cara}
                  onChange={() => onCheckboxChange('lavado_cara')}
                  label="LAVADO DE CARA"
                />
                <CheckboxField
                  id="cepillado_dientes"
                  checked={evaluacion.cepillado_dientes}
                  onChange={() => onCheckboxChange('cepillado_dientes')}
                  label="CEPILLADO DE DIENTES"
                />
              </div>
            </div>

            <FormField label="OBSERVACIÓN GENERAL">
              <textarea
                value={evaluacion.observacion_higiene}
                onChange={(e) => onInputChange('observacion_higiene', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all resize-none"
              />
            </FormField>
          </SubSection>
        </div>
      </Section>

      {/* 8. ÁREA ESCOLAR */}
      <Section title="8. ÁREA DEL DESEMPEÑO OCUPACIONAL - ESCOLAR">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">PRENSIÓN EN LÁPIZ:</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <CheckboxField
                id="prension_lapiz_imitado"
                checked={evaluacion.prension_lapiz_imitado}
                onChange={() => onCheckboxChange('prension_lapiz_imitado')}
                label="IMITADO"
              />
              <CheckboxField
                id="prension_lapiz_copiado"
                checked={evaluacion.prension_lapiz_copiado}
                onChange={() => onCheckboxChange('prension_lapiz_copiado')}
                label="COPIADO"
              />
              <CheckboxField
                id="prension_lapiz_coloreado"
                checked={evaluacion.prension_lapiz_coloreado}
                onChange={() => onCheckboxChange('prension_lapiz_coloreado')}
                label="COLOREADO"
              />
              <CheckboxField
                id="recortado"
                checked={evaluacion.recortado}
                onChange={() => onCheckboxChange('recortado')}
                label="RECORTADO"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">PRENSIÓN EN TIJERAS/PATRÓN DE SUJECIÓN:</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="Adecuado"
                  checked={evaluacion.prension_tijeras === 'Adecuado'}
                  onChange={(e) => onInputChange('prension_tijeras', e.target.value)}
                  className="w-4 h-4 text-[#A3C644] border-gray-300 focus:ring-[#A3C644]"
                />
                <span className="text-sm text-gray-700">ADECUADO</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="Inadecuado"
                  checked={evaluacion.prension_tijeras === 'Inadecuado'}
                  onChange={(e) => onInputChange('prension_tijeras', e.target.value)}
                  className="w-4 h-4 text-[#A3C644] border-gray-300 focus:ring-[#A3C644]"
                />
                <span className="text-sm text-gray-700">INADECUADO</span>
              </label>
            </div>
          </div>

          <FormField label="OBSERVACIÓN">
            <textarea
              value={evaluacion.observacion_escolar}
              onChange={(e) => onInputChange('observacion_escolar', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all resize-none"
            />
          </FormField>
        </div>
      </Section>

      {/* 9. ÁREA DEL DESEMPEÑO - JUEGO */}
      <Section title="9. ÁREA DEL DESEMPEÑO - JUEGO">
        <div className="grid grid-cols-1 gap-6">
          <FormField label="JUGUETES PREFERIDOS">
            <input
              type="text"
              value={evaluacion.juguetes_preferidos}
              onChange={(e) => onInputChange('juguetes_preferidos', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all"
            />
          </FormField>

          <div>
            <label className="block text-sm text-gray-700 mb-2">JUEGOS PREFERIDOS:</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <CheckboxField
                id="tipo_juego_sensoriomotor"
                checked={evaluacion.tipo_juego_sensoriomotor}
                onChange={() => onCheckboxChange('tipo_juego_sensoriomotor')}
                label="SENSORIOMOTOR"
              />
              <CheckboxField
                id="tipo_juego_simbolico"
                checked={evaluacion.tipo_juego_simbolico}
                onChange={() => onCheckboxChange('tipo_juego_simbolico')}
                label="SIMBÓLICO"
              />
              <CheckboxField
                id="tipo_juego_otro"
                checked={evaluacion.tipo_juego_otro}
                onChange={() => onCheckboxChange('tipo_juego_otro')}
                label="OTRO"
              />
            </div>
          </div>

          <FormField label="LUGAR PREFERIDO PARA JUGAR">
            <input
              type="text"
              value={evaluacion.lugar_preferido_jugar}
              onChange={(e) => onInputChange('lugar_preferido_jugar', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all"
            />
          </FormField>

          <FormField label="OBSERVACIÓN">
            <textarea
              value={evaluacion.observacion_juego}
              onChange={(e) => onInputChange('observacion_juego', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all resize-none"
            />
          </FormField>
        </div>
      </Section>

      {/* 10. COMUNICACIÓN */}
      <Section title="10. COMUNICACIÓN">
        <FormField label="LENGUAJE">
          <textarea
            value={evaluacion.lenguaje}
            onChange={(e) => onInputChange('lenguaje', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all resize-none"
            placeholder="Describir lenguaje expresivo y comprensivo"
          />
        </FormField>
      </Section>

      {/* 11. CONCLUSIONES */}
      <Section title="11. CONCLUSIONES">
        <FormField label="CONCLUSIONES">
          <textarea
            value={evaluacion.conclusiones}
            onChange={(e) => onInputChange('conclusiones', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all resize-none"
            placeholder="Escriba las conclusiones de la evaluación..."
          />
        </FormField>
      </Section>

      {/* 12. SUGERENCIAS */}
      <Section title="12. SUGERENCIAS">
        <FormField label="SUGERENCIAS">
          <textarea
            value={evaluacion.sugerencias}
            onChange={(e) => onInputChange('sugerencias', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all resize-none"
            placeholder="Escriba las sugerencias..."
          />
        </FormField>
      </Section>

      {/* 13. OBJETIVOS INICIALES */}
      <Section title="13. OBJETIVOS INICIALES">
        <FormField label="OBJETIVOS INICIALES">
          <textarea
            value={evaluacion.objetivos_iniciales}
            onChange={(e) => onInputChange('objetivos_iniciales', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all resize-none"
            placeholder="Escriba los objetivos iniciales..."
          />
        </FormField>
      </Section>

      {/* Botones de acción */}
      {puedeEditarHistoriaClinica && (
        <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={onCancelar}
            disabled={guardando}
            className="px-6 py-3 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onGuardar}
            disabled={guardando}
            className="flex items-center gap-2 bg-[#A3C644] text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all shadow-sm disabled:opacity-50"
          >
            {guardando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {esNuevo ? 'Guardar Evaluación' : 'Actualizar Evaluación'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

// Componente para la vista de resumen - Estilo EntrevistaPadres
const VistaResumen = ({ evaluacion }) => {
  const mostrarSiNo = (valor) => valor ? 'Sí' : 'No';
  const mostrarValor = (valor) => valor || 'No especificado';

  const DataRow = ({ label, value, fullWidth = false }) => (
    <div className={`py-3 border-b border-gray-100 ${fullWidth ? 'md:col-span-2' : ''}`}>
      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{label}</p>
      <p className="text-sm text-gray-900 whitespace-pre-line">{value || 'No especificado'}</p>
    </div>
  );

  const SeccionResumen = ({ titulo, children }) => (
    <div className="mb-6">
      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
        {titulo}
      </h4>
      {children}
    </div>
  );

  return (
    <div>
      {/* DATOS DE LA EVALUACIÓN */}
      <SeccionResumen titulo="DATOS DE LA EVALUACIÓN">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <DataRow label="Fecha de Evaluación" value={formatearFechaSinZonaHoraria(evaluacion.fecha_evaluacion)} />
          <DataRow label="Motivo de Consulta" value={evaluacion.motivo_consulta} fullWidth />
        </div>
      </SeccionResumen>

      {/* 1. DATOS GENERALES */}
      <SeccionResumen titulo="1. DATOS GENERALES">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <DataRow label="Tipo de Parto" value={mostrarValor(evaluacion.tipo_parto)} />
          <DataRow label="Estimulación Temprana" value={mostrarSiNo(evaluacion.estimulacion_temprana)} />
          <DataRow label="Terapias Anteriores" value={mostrarSiNo(evaluacion.terapias_anteriores)} />
          <DataRow label="Observaciones" value={evaluacion.observaciones_datos_generales} fullWidth />
        </div>
      </SeccionResumen>

      {/* 2. OBSERVACIONES GENERALES */}
      <SeccionResumen titulo="2. OBSERVACIONES GENERALES">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
          <DataRow label="Nivel de Alerta" value={evaluacion.nivel_alerta} />
          <DataRow label="Nivel de Atención" value={evaluacion.nivel_atencion} />
          <DataRow label="Nivel de Actividad" value={evaluacion.nivel_actividad} />
        </div>
      </SeccionResumen>

      {/* 3. COMPONENTE SENSORIAL */}
      <SeccionResumen titulo="3. COMPONENTE SENSORIAL">
        <div className="grid grid-cols-1 gap-x-6">
          {/* Visuales */}
          <div className="py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-[#7B1FA2] uppercase mb-2">VISUALES</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <DataRow label="Usa Lentes" value={mostrarSiNo(evaluacion.usa_lentes)} />
              <DataRow label="Fijación Visual" value={mostrarSiNo(evaluacion.fijacion_visual)} />
              <DataRow label="Contacto Visual" value={mostrarSiNo(evaluacion.contacto_visual)} />
              <DataRow label="Seguimiento Visual" value={mostrarSiNo(evaluacion.seguimiento_visual)} />
              <DataRow label="Observaciones" value={evaluacion.observaciones_visuales} fullWidth />
            </div>
          </div>

          {/* Auditivas */}
          <div className="py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-[#7B1FA2] uppercase mb-2">AUDITIVAS</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <DataRow label="Reconoce Fuentes Sonoras" value={mostrarSiNo(evaluacion.reconoce_fuentes_sonoras)} />
              <DataRow label="Busca Sonido" value={mostrarSiNo(evaluacion.busca_sonido)} />
              <DataRow label="Observaciones" value={evaluacion.observaciones_auditivas} fullWidth />
            </div>
          </div>

          {/* Táctiles */}
          <div className="py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-[#7B1FA2] uppercase mb-2">TÁCTILES</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <DataRow label="Desórdenes Modulación" value={mostrarSiNo(evaluacion.desordenes_modulacion)} />
              <DataRow label="Hiperresponsividad" value={mostrarSiNo(evaluacion.hiperresponsividad_tactil)} />
              <DataRow label="Hiporresponsividad" value={mostrarSiNo(evaluacion.hiporresponsividad_tactil)} />
              <DataRow label="Observaciones" value={evaluacion.observaciones_tactiles} fullWidth />
            </div>
          </div>

          {/* Gustativos */}
          <div className="py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-[#7B1FA2] uppercase mb-2">GUSTATIVOS</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <DataRow label="Selectividad en Comidas" value={mostrarSiNo(evaluacion.selectividad_comidas)} />
              <DataRow label="Observaciones" value={evaluacion.observaciones_gustativos} fullWidth />
            </div>
          </div>

          {/* Propioceptivo */}
          <div className="py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-[#7B1FA2] uppercase mb-2">PROPIOCEPTIVO</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <DataRow label="Hiperresponsividad" value={mostrarSiNo(evaluacion.hiperresponsividad_propioceptivo)} />
              <DataRow label="Hiporresponsividad" value={mostrarSiNo(evaluacion.hiporresponsividad_propioceptivo)} />
              <DataRow label="Observaciones" value={evaluacion.observaciones_propioceptivo} fullWidth />
            </div>
          </div>

          {/* Vestibular */}
          <div className="py-3">
            <p className="text-xs font-semibold text-[#7B1FA2] uppercase mb-2">VESTIBULAR</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <DataRow label="Inseguridad Gravitacional" value={mostrarSiNo(evaluacion.inseguridad_gravitacional)} />
              <DataRow label="Intolerancia Movimiento" value={mostrarSiNo(evaluacion.intolerancia_movimiento)} />
              <DataRow label="Hiporrespuesta Movimiento" value={mostrarSiNo(evaluacion.hiporrespuesta_movimiento)} />
              <DataRow label="Observaciones" value={evaluacion.observaciones_vestibular} fullWidth />
            </div>
          </div>
        </div>
      </SeccionResumen>

      {/* 4. COMPONENTE MOTOR */}
      <SeccionResumen titulo="4. COMPONENTE MOTOR">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <DataRow label="Fuerza Muscular" value={evaluacion.fuerza_muscular} />
          <DataRow label="Rango Articular" value={evaluacion.rango_articular} />
          <DataRow label="Coordinación Bimanual" value={evaluacion.coordinacion_bimanual} />
          <DataRow label="Dominación Manual" value={evaluacion.dominacion_manual} />
          <DataRow label="Cruce Línea Media" value={mostrarSiNo(evaluacion.cruce_linea_media)} />
          <DataRow label="Observaciones" value={evaluacion.observaciones_motor} fullWidth />
        </div>
      </SeccionResumen>

      {/* 5. COMPONENTE PSICOLÓGICO */}
      <SeccionResumen titulo="5. COMPONENTE PSICOLÓGICO">
        <div className="grid grid-cols-1 gap-x-6">
          <DataRow label="Intereses" value={evaluacion.intereses} fullWidth />
        </div>
      </SeccionResumen>

      {/* 6. COMPONENTE COGNITIVO */}
      <SeccionResumen titulo="6. COMPONENTE COGNITIVO">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <DataRow label="Atención-Concentración" value={evaluacion.atencion_concentracion} />
          <DataRow label="Seguimiento de Órdenes" value={evaluacion.seguimiento_ordenes} />
          <DataRow label="Otros" value={evaluacion.otros_cognitivo} fullWidth />
        </div>
      </SeccionResumen>

      {/* 7. AVD */}
      <SeccionResumen titulo="7. ACTIVIDADES DE VIDA DIARIA">
        <div className="grid grid-cols-1 gap-x-6">
          {/* Alimentación */}
          <div className="py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-[#7B1FA2] uppercase mb-2">ALIMENTACIÓN</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <DataRow label="Nivel de Independencia" value={evaluacion.alimentacion_independiente} />
              <DataRow label="Observación" value={evaluacion.observacion_alimentacion} fullWidth />
            </div>
          </div>

          {/* Vestido */}
          <div className="py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-[#7B1FA2] uppercase mb-2">VESTIDO</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <DataRow label="Desvestido Prenda Superior" value={mostrarSiNo(evaluacion.desvestido_superior)} />
              <DataRow label="Desvestido Prenda Inferior" value={mostrarSiNo(evaluacion.desvestido_inferior)} />
              <DataRow label="Vestido Prenda Superior" value={mostrarSiNo(evaluacion.vestido_superior)} />
              <DataRow label="Vestido Prenda Inferior" value={mostrarSiNo(evaluacion.vestido_inferior)} />
              <DataRow label="Manejo de Botones" value={mostrarSiNo(evaluacion.manejo_botones)} />
              <DataRow label="Manejo de Cierre" value={mostrarSiNo(evaluacion.manejo_cierre)} />
              <DataRow label="Manejo de Lazos" value={mostrarSiNo(evaluacion.manejo_lazos)} />
              <DataRow label="Observación" value={evaluacion.observacion_vestido} fullWidth />
            </div>
          </div>

          {/* Higiene */}
          <div className="py-3">
            <p className="text-xs font-semibold text-[#7B1FA2] uppercase mb-2">HIGIENE</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <DataRow label="Esfínter Vesical" value={mostrarSiNo(evaluacion.esfinter_vesical)} />
              <DataRow label="Esfínter Anal" value={mostrarSiNo(evaluacion.esfinter_anal)} />
              <DataRow label="Lavado de Manos" value={mostrarSiNo(evaluacion.lavado_manos)} />
              <DataRow label="Lavado de Cara" value={mostrarSiNo(evaluacion.lavado_cara)} />
              <DataRow label="Cepillado de Dientes" value={mostrarSiNo(evaluacion.cepillado_dientes)} />
              <DataRow label="Observación" value={evaluacion.observacion_higiene} fullWidth />
            </div>
          </div>
        </div>
      </SeccionResumen>

      {/* 8. ÁREA ESCOLAR */}
      <SeccionResumen titulo="8. ÁREA ESCOLAR">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <DataRow label="Prensión Lápiz - Imitado" value={mostrarSiNo(evaluacion.prension_lapiz_imitado)} />
          <DataRow label="Prensión Lápiz - Copiado" value={mostrarSiNo(evaluacion.prension_lapiz_copiado)} />
          <DataRow label="Prensión Lápiz - Coloreado" value={mostrarSiNo(evaluacion.prension_lapiz_coloreado)} />
          <DataRow label="Recortado" value={mostrarSiNo(evaluacion.recortado)} />
          <DataRow label="Prensión en Tijeras" value={evaluacion.prension_tijeras} />
          <DataRow label="Observación" value={evaluacion.observacion_escolar} fullWidth />
        </div>
      </SeccionResumen>

      {/* 9. ÁREA DEL DESEMPEÑO - JUEGO */}
      <SeccionResumen titulo="9. ÁREA DEL DESEMPEÑO - JUEGO">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <DataRow label="Juguetes Preferidos" value={evaluacion.juguetes_preferidos} />
          <DataRow
            label="Tipo de Juego"
            value={[
              evaluacion.tipo_juego_sensoriomotor && 'Sensoriomotor',
              evaluacion.tipo_juego_simbolico && 'Simbólico',
              evaluacion.tipo_juego_otro && 'Otro'
            ].filter(Boolean).join(', ') || 'No especificado'}
          />
          <DataRow label="Lugar Preferido para Jugar" value={evaluacion.lugar_preferido_jugar} />
          <DataRow label="Observación" value={evaluacion.observacion_juego} fullWidth />
        </div>
      </SeccionResumen>

      {/* 10. COMUNICACIÓN */}
      <SeccionResumen titulo="10. COMUNICACIÓN">
        <div className="grid grid-cols-1 gap-x-6">
          <DataRow label="Lenguaje" value={evaluacion.lenguaje} fullWidth />
        </div>
      </SeccionResumen>

      {/* 11. CONCLUSIONES */}
      <SeccionResumen titulo="11. CONCLUSIONES">
        <div className="grid grid-cols-1 gap-x-6">
          <DataRow label="Conclusiones" value={evaluacion.conclusiones} fullWidth />
        </div>
      </SeccionResumen>

      {/* 12. SUGERENCIAS */}
      <SeccionResumen titulo="12. SUGERENCIAS">
        <div className="grid grid-cols-1 gap-x-6">
          <DataRow label="Sugerencias" value={evaluacion.sugerencias} fullWidth />
        </div>
      </SeccionResumen>

      {/* 13. OBJETIVOS INICIALES */}
      <SeccionResumen titulo="13. OBJETIVOS INICIALES">
        <div className="grid grid-cols-1 gap-x-6">
          <DataRow label="Objetivos Iniciales" value={evaluacion.objetivos_iniciales} fullWidth />
        </div>
      </SeccionResumen>
    </div>
  );
};

export default EvaluacionTerapiaOcupacional;