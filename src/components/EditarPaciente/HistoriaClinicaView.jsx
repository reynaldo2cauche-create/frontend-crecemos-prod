import React, { useState, useEffect } from 'react';
import { FileText, Users, Activity, ChevronDown, ChevronRight, X, ClipboardList } from 'lucide-react';
import { guardarReporteEvolucion, actualizarReporteEvolucion, obtenerReporteEvolucion } from '../../services/historiaClinicaService';
import { getServiciosPorPaciente } from '../../services/pacienteService';

import { getVisibleTabs, getTabIndex } from './HistoriaClinicaView/tabConfig';
import EntrevistaPadresView from './HistoriaClinicaView/components/EntrevistaPadresView';
import ReporteEvolucion from './HistoriaClinicaView/components/ReporteEvolucion';
import { calcularEdad } from '../../utils/date';
import EvaluacionTerapiaOcupacional from './HistoriaClinicaView/components/EvaluacionTOcupacionalView';
import IndicacionTerapeuticaView from './HistoriaClinicaView/components/IndicacionTerapeuticaView';

const HistoriaClinicaView = ({ paciente, user }) => {
  const [serviciosPaciente, setServiciosPaciente] = useState([]);
  const [seccionActiva, setSeccionActiva] = useState(null); // null = ninguna, 'reporte', 'entrevista', 'evaluacion'

  // Función helper para obtener fecha local en formato YYYY-MM-DD
  const getFechaLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [reporteEvolucion, setReporteEvolucion] = useState({
    servicio: null,
    edad: paciente?.edad || '',
    fechaEvaluacion: getFechaLocal(),
    periodoIntervencion: '',
    frecuenciaAtencion: '',
    especialista: user?.nombres + ' ' + user?.apellidos,
    metodologia: '',
    objetivos: '',
    logros: '',
    dificultades: '',
    objetivosSiguientePeriodo: ''
  });

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportesExistentes, setReportesExistentes] = useState([]);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [reporteId, setReporteId] = useState(null);
  const [vistaResumida, setVistaResumida] = useState(true);

  // Filtrar tabs visibles según la configuración y servicios del paciente
  const visibleTabs = getVisibleTabs(paciente, serviciosPaciente);

  const handleInputChange = (field, value) => {
    setReporteEvolucion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCambiarReporte = (reporte) => {
    setReporteSeleccionado(reporte);
    setReporteId(reporte.id);

    // Función para convertir fecha sin afectar zona horaria
    const formatearFecha = (fecha) => {
      if (!fecha) return getFechaLocal();
      const d = new Date(fecha);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Actualizar el formulario con los datos del reporte seleccionado
    setReporteEvolucion({
      servicio: reporte.servicio || '',
      edad: reporte.edad?.toString() || '',
      fechaEvaluacion: formatearFecha(reporte.fechaEvaluacion),
      periodoIntervencion: reporte.periodoIntervencion || '',
      frecuenciaAtencion: reporte.frecuenciaAtencion || '',
      especialista: reporte.especialista || user?.nombres + ' ' + user?.apellidos,
      metodologia: reporte.metodologia || '',
      objetivos: reporte.objetivos || '',
      logros: reporte.logros || '',
      dificultades: reporte.dificultades || '',
      objetivosSiguientePeriodo: reporte.objetivosSiguientePeriodo || ''
    });
  };

  const handleNuevoReporte = () => {
    setReporteSeleccionado(null);
    setReporteId(null);

    // Cambiar a vista completa para mostrar el formulario
    setVistaResumida(false);

    // Limpiar el formulario para un nuevo reporte
    setReporteEvolucion({
      servicio: null,
      edad: '',
      fechaEvaluacion: getFechaLocal(),
      periodoIntervencion: '',
      frecuenciaAtencion: '',
      especialista: '',
      metodologia: '',
      objetivos: '',
      logros: '',
      dificultades: '',
      objetivosSiguientePeriodo: ''
    });
  };

  const toggleVistaResumida = () => {
    const nuevaVistaResumida = !vistaResumida;
    setVistaResumida(nuevaVistaResumida);

    // Si estamos cambiando a vista completa (crear nuevo reporte), limpiar el formulario
    if (!nuevaVistaResumida) {
      setReporteSeleccionado(null);
      setReporteId(null);
      setReporteEvolucion({
        servicio: null,
        edad: '',
        fechaEvaluacion: getFechaLocal(),
        periodoIntervencion: '',
        frecuenciaAtencion: '',
        especialista: '',
        metodologia: '',
        objetivos: '',
        logros: '',
        dificultades: '',
        objetivosSiguientePeriodo: ''
      });
    }
  };

  const handleSaveReporte = async () => {
    try {
      setSaving(true);
      
      // Validar campos requeridos
      if (!reporteEvolucion.servicio || !reporteEvolucion.periodoIntervencion || 
          !reporteEvolucion.frecuenciaAtencion || !reporteEvolucion.metodologia || 
          !reporteEvolucion.objetivos || !reporteEvolucion.logros || 
          !reporteEvolucion.dificultades || !reporteEvolucion.objetivosSiguientePeriodo) {
        setSnackbarMessage('Por favor complete todos los campos requeridos');
        setSnackbarSeverity('error');
        setShowSnackbar(true);
        return;
      }

      // Preparar datos para el backend
      const reporteData = {
        paciente_id: paciente?.id,
        servicio_id: reporteEvolucion.servicio,
        edad: calcularEdad(paciente?.fecha_nacimiento) || 0,
        fecha_evaluacion: reporteEvolucion.fechaEvaluacion,
        periodo_intervencion: reporteEvolucion.periodoIntervencion,
        frecuencia_atencion: reporteEvolucion.frecuenciaAtencion,
        especialista: user?.nombres + ' ' + user?.apellidos,
        metodologia: reporteEvolucion.metodologia,
        objetivos: reporteEvolucion.objetivos,
        logros: reporteEvolucion.logros,
        dificultades: reporteEvolucion.dificultades,
        objetivos_siguiente_periodo: reporteEvolucion.objetivosSiguientePeriodo,
        usuario_id: user?.id
      };

      console.log('Enviando reporte de evolución:', reporteData);

      let response;
      
      // Determinar si es crear o actualizar
      if (reporteId) {
        // Actualizar reporte existente
        console.log('Actualizando reporte existente con ID:', reporteId);
        response = await actualizarReporteEvolucion(reporteId, reporteData);
        setSnackbarMessage('Reporte de evolución actualizado exitosamente');
      } else {
        // Crear nuevo reporte
        console.log('Creando nuevo reporte de evolución');
        response = await guardarReporteEvolucion(reporteData);
        setSnackbarMessage('Reporte de evolución guardado exitosamente');
        
        // Si es un nuevo reporte, actualizar el ID para futuras actualizaciones
        if (response && response.id) {
          setReporteId(response.id);
        }
      }
      
      console.log('Respuesta del backend:', response);
      
      // Recargar los reportes para incluir el nuevo
      try {
        const reportesData = await obtenerReporteEvolucion(paciente.id);
        if (reportesData && reportesData.length > 0) {
          setReportesExistentes(reportesData);
        }
      } catch (error) {
        console.error('Error al recargar reportes:', error);
      }
      
      // Cambiar a vista resumida para mostrar el reporte guardado
      setVistaResumida(true);

      // Limpiar el formulario
      setReporteEvolucion({
        servicio: null,
        edad: paciente?.edad || '',
        fechaEvaluacion: getFechaLocal(),
        periodoIntervencion: '',
        frecuenciaAtencion: '',
        especialista: user?.nombres + ' ' + user?.apellidos,
        metodologia: '',
        objetivos: '',
        logros: '',
        dificultades: '',
        objetivosSiguientePeriodo: ''
      });
      
      setSnackbarSeverity('success');
      setShowSnackbar(true);
      
    } catch (error) {
      console.error('Error al guardar reporte de evolución:', error);
      setSnackbarMessage(error.response?.data?.message || 'Error al guardar el reporte de evolución');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    } finally {
      setSaving(false);
    }
  };

  const frecuenciasAtencion = [
    { value: '1', label: '1 vez por semana' },
    { value: '2', label: '2 veces por semana' },
    { value: '3', label: '3 veces por semana' },
    { value: '4', label: '4 veces por semana' },
    { value: '5', label: '5 veces por semana' }
  ];

  // Cargar datos existentes cuando se monta el componente
  useEffect(() => {
    const cargarDatos = async () => {
      if (!paciente?.id) return;
      
      try {
        setLoading(true);
        
        // Cargar servicios del paciente PRIMERO (crítico para mostrar tabs correctos)
        try {
          const serviciosData = await getServiciosPorPaciente(paciente.id);
          console.log('📋 Servicios cargados del paciente:', serviciosData);
          
          // Filtrar solo servicios activos
          const serviciosActivos = serviciosData?.filter(s => s.estado === 'ACTIVO' && s.activo === true) || [];
          console.log('✅ Servicios activos:', serviciosActivos);
          
          setServiciosPaciente(serviciosActivos);
        } catch (error) {
          console.error('❌ Error al cargar servicios:', error);
          setServiciosPaciente([]);
        }
        
        // Cargar reportes de evolución
        try {
          const reportesData = await obtenerReporteEvolucion(paciente.id);
          if (reportesData && reportesData.length > 0) {
            setReportesExistentes(reportesData);
          }
        } catch (error) {
          console.error('❌ Error al cargar reportes:', error);
          setReportesExistentes([]);
        }
        
      } catch (error) {
        console.error('❌ Error general al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [paciente?.id]);

  // Renderizar el componente correspondiente según el tab activo
  const renderTabContent = (tabId) => {
    switch (tabId) {
      case 'reporte-evolucion':
        return (
          <ReporteEvolucion
            paciente={paciente}
            user={user}
            loading={loading}
            reporteEvolucion={reporteEvolucion}
            handleInputChange={handleInputChange}
            handleSaveReporte={handleSaveReporte}
            saving={saving}
            reportesExistentes={reportesExistentes}
            vistaResumida={vistaResumida}
            toggleVistaResumida={toggleVistaResumida}
            frecuenciasAtencion={frecuenciasAtencion}
            handleNuevoReporte={handleNuevoReporte}
            serviciosPaciente={serviciosPaciente}
          />
        );
      case 'entrevista-padres':
        return <EntrevistaPadresView paciente={paciente} user={user} />;
      case 'evaluacion-terapia-ocupacional':
        return <EvaluacionTerapiaOcupacional pacienteId={paciente?.id} usuarioId={user?.id} user={user} />;
      case 'indicacion-terapeutica':
        return <IndicacionTerapeuticaView paciente={paciente} user={user} />;
      default:
        return <div>Contenido no encontrado</div>;
    }
  };

  // Función para alternar sección
  const toggleSeccion = (seccion) => {
    setSeccionActiva(seccionActiva === seccion ? null : seccion);
  };

  // Configuración de las secciones con iconos
  const secciones = [
    {
      id: 'reporte-evolucion',
      title: 'Reportes de Evolución',
      description: 'Historial y creación de reportes de evaluación',
      icon: FileText,
      color: 'amber',
      visible: visibleTabs.some(tab => tab.id === 'reporte-evolucion')
    },
    {
      id: 'entrevista-padres',
      title: 'Entrevista a Padres',
      description: 'Formulario de entrevista inicial',
      icon: Users,
      color: 'blue',
      visible: visibleTabs.some(tab => tab.id === 'entrevista-padres')
    },
    {
      id: 'evaluacion-terapia-ocupacional',
      title: 'Evaluación de Terapia Ocupacional',
      description: 'Evaluación completa de terapia ocupacional',
      icon: Activity,
      color: 'purple',
      visible: visibleTabs.some(tab => tab.id === 'evaluacion-terapia-ocupacional')
    },
    {
      id: 'indicacion-terapeutica',
      title: 'Indicación Terapéutica',
      description: 'Prescripción de sesiones y recomendaciones terapéuticas',
      icon: ClipboardList,
      color: 'purple',
      visible: true // Siempre visible
    }
  ].filter(s => s.visible);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-[#7B1FA2] rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 text-xs font-medium">Cargando historia clínica...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Notification */}
      {showSnackbar && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border transform transition-all duration-300 ${
          snackbarSeverity === 'success'
            ? 'bg-white border-gray-100'
            : 'bg-white border-red-100'
        } flex items-center gap-2.5`}>
          <div className={`w-1.5 h-1.5 rounded-full ${snackbarSeverity === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`}></div>
          <span className="text-xs font-medium text-gray-700">{snackbarMessage}</span>
          <button onClick={() => setShowSnackbar(false)} className="ml-2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      )}

      {/* Cards de Secciones */}
      {secciones.map((seccion) => {
        const Icon = seccion.icon;
        const isActive = seccionActiva === seccion.id;

        const colorClasses = {
          amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100', hover: 'hover:border-amber-200' },
          blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100', hover: 'hover:border-blue-200' },
          purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100', hover: 'hover:border-purple-200' }
        };

        const colors = colorClasses[seccion.color];

        return (
          <div key={seccion.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all">
            {/* Header Card */}
            <button
              onClick={() => toggleSeccion(seccion.id)}
              className={`w-full p-6 flex items-center justify-between transition-all ${
                isActive ? 'bg-gray-50' : 'hover:bg-gray-50/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-gray-900">{seccion.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{seccion.description}</p>
                </div>
              </div>
              <div className={`transition-transform ${isActive ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </button>

            {/* Contenido expandible */}
            {isActive && (
              <div className="border-t border-gray-100 p-6 bg-white">
                {renderTabContent(seccion.id)}
              </div>
            )}
          </div>
        );
      })}

      {/* Mensaje si no hay secciones disponibles */}
      {secciones.length === 0 && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">No hay secciones de historia clínica disponibles para este paciente</p>
        </div>
      )}
    </div>
  );
};

export default HistoriaClinicaView;