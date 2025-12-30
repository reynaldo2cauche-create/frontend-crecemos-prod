import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Heart, HardDrive, Camera, Clock, AlertCircle, ChevronDown, X, Trash2, ArrowLeft, Building2, Plus, CheckCircle, XCircle } from 'lucide-react';
import { getPacienteById, getServiciosPorPaciente, updatePacienteById, getEstadosPaciente, cambiarEstadoPaciente, asignarServicioPaciente, desasignarServicioPaciente } from '../services/pacienteService';
import api from '../services/api';
import { getDistritos, getTiposDocumento, getGeneros } from '../services/catalogoService';
import FiliacionView from '../components/EditarPaciente/FiliacionView';
import HistoriaClinicaView from '../components/EditarPaciente/HistoriaClinicaView';
import ArchivosDigitales from '../components/EditarPaciente/ArchivosDigitales';
import NotasEvolucion from '../components/EditarPaciente/NotasEvolucion';
import AsignarServicioModal from '../components/EditarPaciente/AsignarServicioModal';
import EditarTerapeutaModal from '../components/EditarPaciente/EditarTerapeutaModal';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useServicios } from '../hooks/useServicios';
import { useTerapeutas } from '../hooks/useTerapeutas';
import { calcularEdad } from '../utils/date';
import { obtenerNotasEvolucionPorPaciente } from '../services/notaEvolucionService';
import { ROLES, canManagePatientStatus } from '../constants/roles';
import {
  getConvenios,
  getConveniosPorPaciente,
  asignarConvenioPaciente,
  desactivarPacienteConvenio
} from '../services/conveniosService';
import { SERVER_BASE_URL } from '../services/api';

const EditarPacienteSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 lg:p-8 mb-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-7 w-48 sm:w-64 bg-gray-100 rounded-lg animate-pulse mb-3"></div>
              <div className="h-4 w-32 sm:w-48 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 lg:p-8">
              <div className="h-8 w-40 sm:w-56 bg-gray-100 rounded-lg animate-pulse mb-6 sm:mb-8"></div>
              <div className="space-y-4 sm:space-y-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-12 sm:h-14 bg-gray-50 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
              <div className="h-6 w-32 sm:w-40 bg-gray-100 rounded animate-pulse mb-4 sm:mb-6"></div>
              <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 sm:h-32 bg-gray-50 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getEstadoColor = (nombreEstado) => {
  const colorMap = {
    'Nuevo': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    'Entrevista': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    'Evaluacion': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    'Terapia': { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
    'Inactivo': { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' }
  };
  return colorMap[nombreEstado] || colorMap['Inactivo'];
};

const EditarPacientePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const user_id = user?.id;
  
  const [paciente, setPaciente] = useState(null);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [distritos, setDistritos] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [estadosPaciente, setEstadosPaciente] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [saving, setSaving] = useState(false);
  const [openNotaModal, setOpenNotaModal] = useState(false);
  const [nota, setNota] = useState({
    entrevista: '',
    sesionEvaluacion: '',
    sesionTerapias: '',
    objetivosTerapeuticos: '',
    observaciones: ''
  });
  const [tabSeleccionado, setTabSeleccionado] = useState('filiacion');
  const serviciosDisponibles = useServicios();
  const terapeutasDisponibles = useTerapeutas();
  const [openAsignarServicio, setOpenAsignarServicio] = useState(false);
  const [nuevoServicio, setNuevoServicio] = useState({ servicio: '', terapeuta: '' });
  const [openEditarTerapeuta, setOpenEditarTerapeuta] = useState(false);
  const [servicioAEditar, setServicioAEditar] = useState(null);
  const [nuevoTerapeuta, setNuevoTerapeuta] = useState('');
  const [anchorEstado, setAnchorEstado] = useState(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [modalEliminarServicio, setModalEliminarServicio] = useState({ open: false, servicio: null });
  const [errorModal, setErrorModal] = useState({ open: false, message: '', title: 'Error' });
  const [mostrarErrorEnModal, setMostrarErrorEnModal] = useState(false);
  // ============== NUEVOS ESTADOS PARA CONVENIOS ==============
const [conveniosDisponibles, setConveniosDisponibles] = useState([]);
const [conveniosPaciente, setConveniosPaciente] = useState([]);
const [modalConvenio, setModalConvenio] = useState(false);
const [convenioSeleccionado, setConvenioSeleccionado] = useState('');
const [numeroPoliza, setNumeroPoliza] = useState('');
const [observacionesConvenio, setObservacionesConvenio] = useState('');
const [modalEliminarConvenio, setModalEliminarConvenio] = useState({ open: false, convenio: null });
const [loadingConvenios, setLoadingConvenios] = useState(false);

useEffect(() => {
  const cargarConvenios = async () => {
    if (!id) return;
    
    try {
      setLoadingConvenios(true);
      const [disponibles, asignados] = await Promise.all([
        getConvenios(true),
        getConveniosPorPaciente(id)
      ]);
      
      setConveniosDisponibles(disponibles || []);
      setConveniosPaciente(asignados || []);
    } catch (error) {
      console.error('Error al cargar convenios:', error);
      setConveniosDisponibles([]);
      setConveniosPaciente([]);
    } finally {
      setLoadingConvenios(false);
    }
  };

  if (id) {
    cargarConvenios();
  }
}, [id]);
  useEffect(() => {
    const cargarPaciente = async () => {
      try {
        setLoading(true);
        const data = await getPacienteById(id);
        const pacienteCompleto = {
          ...data.paciente,
          parejas: data.parejas || []
        };
        const servicios = await getServiciosPorPaciente(id);
        pacienteCompleto.servicios = servicios;
        setPaciente(pacienteCompleto);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos del paciente');
        console.error('Error al cargar los datos del paciente', err);
        setLoading(false);
      }
    };
    if (id) cargarPaciente();
  }, [id]);

  useEffect(() => {
    const cargarDatosAdicionales = async () => {
      try {
        setLoadingData(true);
        const [distritosData, tiposDocumentoData, generosData, estadosData] = await Promise.all([
          getDistritos(),
          getTiposDocumento(),
          getGeneros(),
          getEstadosPaciente()
        ]);
        
        setDistritos(distritosData || []);
        setTiposDocumento(tiposDocumentoData || []);
        setGeneros(generosData || []);
        setEstadosPaciente(estadosData || []);
      } catch (err) {
        console.error('Error al cargar datos adicionales:', err);
      } finally {
        setLoadingData(false);
      }
    };
    
    if (!loading && paciente) {
      cargarDatosAdicionales();
    }
  }, [loading, paciente]);

  useEffect(() => {
    const cargarNotasEvolucion = async () => {
      if (id) {
        try {
          let url = `/nota-evolucion/paciente/${id}`;
          if (user?.rol?.id === ROLES.TERAPEUTA) {
            url += `?trabajador_id=${user.id}`;
          }
          const notas = await obtenerNotasEvolucionPorPaciente(id, url);
          setComentarios(notas.map(nota => ({
            id: nota.id,
            fecha: nota.fecha_crea ? new Date(nota.fecha_crea).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + new Date(nota.fecha_crea).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '',
            autor: nota.trabajador
              ? `${nota.trabajador.nombres} ${nota.trabajador.apellidos}${nota.trabajador.rol ? ' — ' + nota.trabajador.rol.nombre : ''}`
              : `Usuario ${nota.user_id_crea}`,
            tipoNota: nota.tipo_nota || null,
            entrevista: nota.entrevista,
            sesionEvaluacion: nota.sesion_evaluacion,
            sesionTerapias: nota.sesion_terapias,
            objetivosTerapeuticos: nota.objetivos_terapeuticos,
            observaciones: nota.observaciones
          })));
        } catch (error) {
          setComentarios([]);
        }
      }
    };
    cargarNotasEvolucion();
  }, [id, user]);

  const handleFotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPerfil(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event, datosActualizados = null) => {
    event.preventDefault();
    setSaving(true);

    const pacienteData = datosActualizados || paciente;

    const data = {
    nombres: pacienteData.nombres,
    apellido_paterno: pacienteData.apellido_paterno,
    apellido_materno: pacienteData.apellido_materno,
    fecha_nacimiento: pacienteData.fecha_nacimiento,
    tipo_documento_id: pacienteData.tipo_documento?.id || null,
    numero_documento: pacienteData.numero_documento,
    sexo_id: pacienteData.sexo?.id || null,
    distrito_id: pacienteData.distrito?.id || null,
    direccion: pacienteData.direccion,
    celular: pacienteData.celular,
    celular2: pacienteData.celular2,
    correo: pacienteData.correo,
    user_id,
    motivo_consulta: pacienteData.motivo_consulta,
    referido_por: pacienteData.referido_por,
    diagnostico_medico: pacienteData.diagnostico_medico,
    alergias: pacienteData.alergias,
    medicamentos_actuales: pacienteData.medicamentos_actuales
  };
    
    try {
      const response = await updatePacienteById(id, data);
      setPaciente(prev => ({
        ...prev,
        ...pacienteData,
        updated_at: response.updated_at
      }));
      setSnackbar({ open: true, message: 'Datos guardados correctamente', severity: 'success' });
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      setSnackbar({ open: true, message: 'Error al guardar los datos', severity: 'error' });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleCambiarEstado = async (estadoId) => {
    setCambiandoEstado(true);
    try {
      const estadoSeleccionado = estadosPaciente.find(e => e.id === estadoId);
      if (!estadoSeleccionado) {
        throw new Error('Estado no encontrado');
      }
      await cambiarEstadoPaciente(paciente.id, estadoId, user_id);
      setPaciente(prev => ({
        ...prev,
        estado: {
          id: estadoSeleccionado.id,
          nombre: estadoSeleccionado.nombre
        }
      }));
      setSnackbar({
        open: true,
        message: `Estado cambiado a: ${estadoSeleccionado.nombre}`,
        severity: 'success'
      });
      setAnchorEstado(null);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al cambiar el estado',
        severity: 'error'
      });
    } finally {
      setCambiandoEstado(false);
    }
  };

const handleAsignarServicio = async () => {
  try {
    const servicioSeleccionado = serviciosDisponibles.find(s => s.nombre === nuevoServicio.servicio);
    if (!servicioSeleccionado) {
      throw new Error('Servicio no encontrado');
    }

    const terapeutaSeleccionado = terapeutasDisponibles.find(
      t => `${t.nombres} ${t.apellidos}` === nuevoServicio.terapeuta
    );
    if (!terapeutaSeleccionado) {
      throw new Error('Terapeuta no encontrado');
    }

    // Obtener fecha actual en Perú (UTC-5)
    const getPeruTimeISOString = () => {
      const now = new Date();
      // Perú está en UTC-5 (PET) - no cambia por horario de verano
      const offsetPeru = -5 * 60 * 60 * 1000; // -5 horas en milisegundos
      const peruTime = new Date(now.getTime() + offsetPeru);
      return peruTime.toISOString();
    };

    const serviciosPaciente = paciente.servicios || [];
    const servicioExistente = serviciosPaciente.find(
      s => s.servicio?.id === servicioSeleccionado.id
    );

    // VALIDACIÓN 1: Verificar si el terapeuta ya está asignado en CUALQUIER servicio de este paciente
    const terapeutaOcupadoEnOtroServicio = serviciosPaciente.find(s => {
      const tieneAsignacion = s.asignaciones?.some(
        asig => asig.terapeuta?.id === terapeutaSeleccionado.id && asig.estado === 'ACTIVO'
      );
      if (tieneAsignacion && s.servicio?.id !== servicioSeleccionado.id) {
        return true; // Encontró al terapeuta en OTRO servicio
      }
      return false;
    });

    if (terapeutaOcupadoEnOtroServicio) {
      setSnackbar({
        open: true,
        message: `❌ El terapeuta ${nuevoServicio.terapeuta} ya está asignado en el servicio de ${terapeutaOcupadoEnOtroServicio.servicio?.nombre}. No puede estar en dos servicios a la vez.`,
        severity: 'error'
      });
      return; // Detener la ejecución
    }

    if (servicioExistente) {
      // El servicio ya existe, solo agregar el terapeuta
      // VALIDACIÓN 2: Verificar si el terapeuta ya está asignado en ESTE MISMO servicio
      const terapeutaYaAsignado = servicioExistente.asignaciones?.some(
        asig => asig.terapeuta?.id === terapeutaSeleccionado.id && asig.estado === 'ACTIVO'
      );

      if (terapeutaYaAsignado) {
        setSnackbar({
          open: true,
          message: `❌ El terapeuta ${nuevoServicio.terapeuta} ya está asignado a este mismo servicio.`,
          severity: 'error'
        });
        return; // Detener la ejecución
      }

      await api.post('/paciente-servicio/asignacion', {
        paciente_servicio_id: servicioExistente.id,
        terapeuta_id: terapeutaSeleccionado.id,
        fecha_asignacion: getPeruTimeISOString(), // Fecha Perú
        estado: 'ACTIVO',
        user_id_crea: user_id
      });
    } else {
      // NUEVO SERVICIO
      console.log('📤 Enviando al backend:', {
        paciente_id: parseInt(id),
        servicio_id: servicioSeleccionado.id,
        terapeuta_id: terapeutaSeleccionado.id,
        fecha_inicio: getPeruTimeISOString(),
        motivo_consulta: paciente.motivo_consulta || '',
        observaciones: '',
        activo: true
      });

      const resultado = await api.post('/paciente-servicio/asignar', {
        paciente_id: parseInt(id),
        servicio_id: servicioSeleccionado.id,
        terapeuta_id: terapeutaSeleccionado.id,
        fecha_inicio: getPeruTimeISOString(), // Fecha Perú
        motivo_consulta: paciente.motivo_consulta || '',
        observaciones: '',
        activo: true
      });

    }

    // Recargar servicios
    await new Promise(resolve => setTimeout(resolve, 500));
    const serviciosActualizados = await getServiciosPorPaciente(id);
    
    setPaciente(prev => ({
      ...prev,
      servicios: serviciosActualizados
    }));

    const mensaje = servicioExistente
      ? `Terapeuta agregado al servicio "${servicioSeleccionado.nombre}"`
      : 'Servicio y terapeuta asignados correctamente';

    setSnackbar({
      open: true,
      message: mensaje,
      severity: 'success'
    });

    setOpenAsignarServicio(false);
    setNuevoServicio({ servicio: '', terapeuta: '' });

  } catch (error) {
    console.error('❌ Error al asignar servicio:', error);
    console.error('❌ Detalles del error:', error.response?.data);
    
    // Mostrar mensaje de error específico del backend
    const backendMessage = error.response?.data?.message || 
                          (Array.isArray(error.response?.data?.message) 
                            ? error.response.data.message.join(', ') 
                            : error.response?.data?.message);
    
    const errorMessage = backendMessage || error.message || 'Error al asignar el servicio';
    
    setOpenAsignarServicio(false);
    setErrorModal({
      open: true,
      message: errorMessage,
      title: 'Error al asignar servicio'
    });
  }
};

  const handleEliminarServicio = async () => {
    const { servicio, asignacionId, terapeutaNombre } = modalEliminarServicio;
    try {
      if (asignacionId) {
        await api.delete(`/paciente-servicio/asignacion/${asignacionId}`);
        setSnackbar({
          open: true,
          message: `Terapeuta ${terapeutaNombre} desasignado exitosamente`,
          severity: 'success'
        });
      } else {
        await desasignarServicioPaciente(paciente.id, servicio.servicio.id, user_id);
        setSnackbar({
          open: true,
          message: 'Servicio eliminado exitosamente',
          severity: 'success'
        });
      }
      const serviciosActualizados = await getServiciosPorPaciente(id);
      setPaciente(prev => ({
        ...prev,
        servicios: serviciosActualizados
      }));
      setModalEliminarServicio({ open: false, servicio: null });
    } catch (error) {
      console.error('Error al eliminar:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al eliminar',
        severity: 'error'
      });
    }
  };

const handleEditarTerapeuta = async () => {
  try {
    if (!servicioAEditar) {
      throw new Error('No hay servicio seleccionado');
    }

    const terapeutaSeleccionado = terapeutasDisponibles.find(
      t => t.id === parseInt(nuevoTerapeuta)
    );

    if (!terapeutaSeleccionado) {
      throw new Error('Terapeuta no encontrado');
    }

    // VALIDACIÓN 1: Verificar si el terapeuta ya está asignado en OTRO servicio del paciente
    const serviciosPaciente = paciente.servicios || [];
    const terapeutaOcupadoEnOtroServicio = serviciosPaciente.find(s => {
      const tieneAsignacion = s.asignaciones?.some(
        asig => asig.terapeuta?.id === terapeutaSeleccionado.id && asig.estado === 'ACTIVO'
      );
      if (tieneAsignacion && s.id !== servicioAEditar.id) {
        return true; // Encontró al terapeuta en OTRO servicio
      }
      return false;
    });

    if (terapeutaOcupadoEnOtroServicio) {
      setSnackbar({
        open: true,
        message: `❌ El terapeuta ${terapeutaSeleccionado.nombres} ${terapeutaSeleccionado.apellidos} ya está asignado en el servicio de ${terapeutaOcupadoEnOtroServicio.servicio?.nombre}. No puede estar en dos servicios a la vez.`,
        severity: 'error'
      });
      return; // Detener la ejecución
    }

    // VALIDACIÓN 2: Verificar si el terapeuta ya está asignado en ESTE MISMO servicio
    const terapeutaYaAsignado = servicioAEditar.asignaciones?.some(
      asig => asig.terapeuta?.id === terapeutaSeleccionado.id && asig.estado === 'ACTIVO'
    );

    if (terapeutaYaAsignado) {
      setSnackbar({
        open: true,
        message: `❌ El terapeuta ${terapeutaSeleccionado.nombres} ${terapeutaSeleccionado.apellidos} ya está asignado a este mismo servicio.`,
        severity: 'error'
      });
      return; // Detener la ejecución
    }

    const tieneAsignacion = servicioAEditar.asignaciones && servicioAEditar.asignaciones.length > 0;

    if (tieneAsignacion) {
      // Actualizar asignación existente
      const asignacionId = servicioAEditar.asignaciones[0].id;
      await api.patch(`/paciente-servicio/asignacion/${asignacionId}`, {
        terapeuta_id: terapeutaSeleccionado.id,
        user_id_actua: user_id
      });
    } else {
      // Crear nueva asignación
      await api.post('/paciente-servicio/asignacion', {
        paciente_servicio_id: servicioAEditar.id,
        terapeuta_id: terapeutaSeleccionado.id,
        fecha_asignacion: new Date().toISOString().split('T')[0],
        estado: 'ACTIVO',
        user_id_crea: user_id
      });
    }

    // Recargar servicios
    await new Promise(resolve => setTimeout(resolve, 300));
    const serviciosActualizados = await getServiciosPorPaciente(id);
    setPaciente(prev => ({
      ...prev,
      servicios: serviciosActualizados
    }));

    const mensajeExito = tieneAsignacion 
      ? 'Terapeuta actualizado correctamente' 
      : 'Terapeuta asignado correctamente';
      
    setSnackbar({
      open: true,
      message: mensajeExito,
      severity: 'success'
    });

    setOpenEditarTerapeuta(false);
    setServicioAEditar(null);
    setNuevoTerapeuta('');

  } catch (error) {
    console.error('❌ Error al asignar/actualizar terapeuta:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Error al asignar el terapeuta';
    
    setOpenEditarTerapeuta(false);
    setErrorModal({
      open: true,
      message: errorMessage,
      title: 'Error al asignar terapeuta'
    });
  }
};

// ============== HANDLERS DE CONVENIOS ==============
const handleAsignarConvenio = async () => {
  if (!convenioSeleccionado) {
    setSnackbar({ open: true, message: 'Debes seleccionar un convenio', severity: 'error' });
    return;
  }

  try {
    const convenio = conveniosDisponibles.find(c => c.id === parseInt(convenioSeleccionado));
    
    // Verificar si ya está asignado
    if (conveniosPaciente.some(c => c.convenio_id === convenio.id && c.activo)) {
      setSnackbar({ open: true, message: 'Este convenio ya está asignado al paciente', severity: 'error' });
      return;
    }

    await asignarConvenioPaciente({
      paciente_id: parseInt(id),
      convenio_id: convenio.id,
      observaciones: observacionesConvenio || null,
      activo: true
    });

    // Recargar convenios
    const asignados = await getConveniosPorPaciente(id);
    setConveniosPaciente(asignados || []);

    setSnackbar({ open: true, message: 'Convenio asignado correctamente', severity: 'success' });
    setModalConvenio(false);
    setConvenioSeleccionado('');
    setObservacionesConvenio('');
  } catch (error) {
    console.error('Error al asignar convenio:', error);
    setSnackbar({ 
      open: true, 
      message: error.response?.data?.message || 'Error al asignar el convenio', 
      severity: 'error' 
    });
  }
};

const handleEliminarConvenio = async () => {
  const { convenio } = modalEliminarConvenio;

  try {
    // Hacer eliminación lógica (desactivar) en lugar de eliminar físicamente
    await desactivarPacienteConvenio(convenio.id);

    // Recargar convenios
    const asignados = await getConveniosPorPaciente(id);
    setConveniosPaciente(asignados || []);

    setSnackbar({ open: true, message: 'Convenio eliminado correctamente', severity: 'success' });
    setModalEliminarConvenio({ open: false, convenio: null });
  } catch (error) {
    console.error('Error al eliminar convenio:', error);
    setSnackbar({
      open: true,
      message: error.response?.data?.message || 'Error al eliminar el convenio',
      severity: 'error'
    });
  }
};

  if (loading) return <EditarPacienteSkeleton />;
  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );
  if (!paciente) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
      <p className="text-gray-600">No se encontró el paciente.</p>
    </div>
  );

  const edad = calcularEdad(paciente.fecha_nacimiento);
  const estadoColors = getEstadoColor(paciente.estado?.nombre);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {snackbar.open && (
        <div className={`fixed top-6 right-6 z-[90000] px-5 py-3.5 rounded-xl shadow-2xl border transform transition-all duration-300 ${
          snackbar.severity === 'success'
            ? 'bg-white border-gray-100'
            : snackbar.severity === 'warning'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-white border-red-100'
        } flex items-center gap-3`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            snackbar.severity === 'success'
              ? 'bg-[#A3C644]'
              : snackbar.severity === 'warning'
              ? 'bg-amber-500'
              : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-gray-700">{snackbar.message}</span>
          <button onClick={() => setSnackbar({ ...snackbar, open: false })} className="ml-2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      )}

      {loadingData && !loading && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-gray-100 border-t-[#7B1FA2] rounded-full animate-spin"></div>
          <span className="text-sm text-gray-700">Cargando datos...</span>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 lg:pl-8">
        <button
          onClick={() => navigate('/intranet/lista-pacientes')}
          className="flex items-center gap-2 px-4 py-2 mb-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium">Volver</span>
        </button>

    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 lg:p-8 mb-6 shadow-sm">
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div className="flex items-center gap-4 sm:gap-6">
      <div className="relative group">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A] flex items-center justify-center text-white text-xl font-bold shadow-sm">
          {paciente.nombres?.[0]}{paciente.apellido_paterno?.[0]}
        </div>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="foto-paciente"
          type="file"
          onChange={handleFotoChange}
        />
        <label htmlFor="foto-paciente">
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#A3C644] rounded-xl cursor-pointer hover:bg-[#8FB82D] transition-all flex items-center justify-center border-3 border-white shadow-sm opacity-0 group-hover:opacity-100">
            <Camera className="w-3.5 h-3.5 text-white" />
          </div>
        </label>
      </div>

      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 break-words line-clamp-2">
          {paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno}
        </h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-400">Edad:</span>
            <span>{edad} años</span>
          </div>
          
          <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block"></span>
          
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-400">DNI:</span>
            <span>{paciente.numero_documento}</span>
          </div>
          
          {paciente.created_at && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block"></span>
              
              <div className="hidden md:flex items-center gap-1.5 text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-medium">Registro:</span>
                <span>
                  {new Date(paciente.created_at).toLocaleDateString('es-PE', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>

    <button
      onClick={canManagePatientStatus(user) ? (e) => setAnchorEstado(e.currentTarget) : undefined}
      disabled={!canManagePatientStatus(user)}
      className={`flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl ${estadoColors.bg} ${
        canManagePatientStatus(user) ? 'cursor-pointer hover:shadow-sm transition-all' : 'cursor-default'
      } w-full sm:w-auto justify-center sm:justify-start`}
    >
      <div className={`w-2 h-2 rounded-full ${estadoColors.dot}`}></div>
      <span className={`text-sm font-semibold ${estadoColors.text}`}>
        {paciente.estado?.nombre || 'Sin estado'}
      </span>
      {canManagePatientStatus(user) && (
        <ChevronDown className={`w-4 h-4 ${estadoColors.text}`} />
      )}
    </button>
  </div>

<div className="mt-4 pt-4 border-t border-gray-100">
  <div className="flex items-center justify-between">
    {/* Lado izquierdo: Título + Tabs */}
    <div className="flex items-center gap-6">
      

      {/* Tabs */}
      <div className="flex gap-1">
        <button
          onClick={() => setTabSeleccionado('filiacion')}
          className={`flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
            tabSeleccionado === 'filiacion'
              ? 'bg-[#7B1FA2] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Filiación</span>
          <span className="sm:hidden">Datos</span>
        </button>

        <button
          onClick={() => setTabSeleccionado('historia')}
          className={`flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
            tabSeleccionado === 'historia'
              ? 'bg-[#7B1FA2] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span className="hidden sm:inline">Historia Clínica</span>
          <span className="sm:hidden">Historia</span>
        </button>

        <button
          onClick={() => setTabSeleccionado('archivos')}
          className={`flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
            tabSeleccionado === 'archivos'
              ? 'bg-[#7B1FA2] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          Archivos
        </button>
      </div>
    </div>

          <div className="flex items-center gap-4">
            {/* Título de Convenios */}
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#7B1FA2]" />
              <h3 className="text-xs font-bold text-gray-900">Convenios</h3><span>|</span>
            </div>
            {conveniosPaciente.filter(pc => pc.activo).length === 0 ? (
              <p className="text-xs text-gray-400 mr-2">Sin convenios</p>
            ) : (
              <div className="flex items-start gap-4">
                {conveniosPaciente
                  .filter(pc => pc.activo) // Solo mostrar convenios activos
                  .map((pc) => {
                  const convenio = conveniosDisponibles.find(c => c.id === pc.convenio_id);
                  if (!convenio) return null;

                  return (
                    <div
                      key={pc.id}
                      className="flex flex-col items-center gap-1.5 max-w-[80px]"
                    >
                      {/* Círculo con logo */}
                      <div
                        className="group relative"
                        onClick={() => setModalDesactivarConvenio({ open: true, convenio: pc })}
                      >
                        <div className="w-12 h-12 rounded-full border-2 border-[#7B1FA2] overflow-hidden bg-white flex items-center justify-center transition-all cursor-pointer hover:shadow-md hover:scale-105">
                          {convenio.logo_url ? (
                            <img
                              src={`${SERVER_BASE_URL}${convenio.logo_url}`}
                              alt={convenio.nombre}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const fallback = e.target.parentElement.querySelector('.fallback-logo');
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`fallback-logo absolute inset-0 ${convenio.logo_url ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A]`}>
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                        </div>

                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-green-500" />

                        <div
                          className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalEliminarConvenio({ open: true, convenio: pc });
                            }}
                            className="p-1.5 rounded-full transition-all bg-red-500 hover:bg-red-600 text-white"
                            title="Eliminar asignación"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Nombre completo en múltiples líneas */}
                      <p className="text-[10px] font-medium text-gray-700 text-center leading-tight line-clamp-3 break-words w-full">
                        {convenio.empresa || convenio.nombre}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setModalConvenio(true)}
              className="w-10 h-10 rounded-full bg-[#7B1FA2] hover:bg-[#6A1B9A] text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm flex-shrink-0"
              title="Agregar convenio"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
      </div>
    </div>
    </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            {tabSeleccionado === 'filiacion' && (
              <FiliacionView
                paciente={paciente}
                setPaciente={setPaciente}
                handleSubmit={handleSubmit}
                saving={saving}
                generos={generos}
                distritos={distritos}
                tiposDocumento={tiposDocumento}
                setOpenAsignarServicio={setOpenAsignarServicio}
                setServicioAEditar={setServicioAEditar}
                setNuevoTerapeuta={setNuevoTerapeuta}
                setOpenEditarTerapeuta={setOpenEditarTerapeuta}
                setModalEliminarServicio={setModalEliminarServicio}
                user={user}
              />
            )}
            {tabSeleccionado === 'historia' && <HistoriaClinicaView paciente={paciente} user={user} />}
            {tabSeleccionado === 'archivos' && <ArchivosDigitales paciente={paciente} />}
          </div>

          <div className="lg:col-span-5">
            <NotasEvolucion
              notas={comentarios}
              setNotas={setComentarios}
              openNotaModal={openNotaModal}
              setOpenNotaModal={setOpenNotaModal}
              nota={nota}
              setNota={setNota}
              paciente_id={paciente?.id}
              user_id_crea={user_id}
              user={user}
              setSnackbar={setSnackbar}
            />
          </div>
        </div>
      </div>

      <AsignarServicioModal
        open={openAsignarServicio}
        onClose={() => setOpenAsignarServicio(false)}
        servicios={serviciosDisponibles}
        terapeutas={terapeutasDisponibles}
        nuevoServicio={nuevoServicio}
        setNuevoServicio={setNuevoServicio}
        onAsignar={handleAsignarServicio}
        serviciosActualesPaciente={paciente?.servicios || []}
      />

      <EditarTerapeutaModal
        open={openEditarTerapeuta}
        onClose={() => {
          setOpenEditarTerapeuta(false);
          setServicioAEditar(null);
          setNuevoTerapeuta('');
        }}
        servicio={servicioAEditar}
        nuevoTerapeuta={nuevoTerapeuta}
        setNuevoTerapeuta={setNuevoTerapeuta}
        terapeutas={terapeutasDisponibles}
        onGuardar={handleEditarTerapeuta}
      />

      {anchorEstado && canManagePatientStatus(user) && (
        <div className="fixed inset-0 z-[80000]" onClick={() => setAnchorEstado(null)}>
          <div
            className="absolute bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 min-w-[180px]"
            style={{
              top: anchorEstado.getBoundingClientRect().bottom + 8,
              left: anchorEstado.getBoundingClientRect().left
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {estadosPaciente.filter(estado => estado.activo).map((estado) => {
              const colors = getEstadoColor(estado.nombre);
              const isActive = paciente?.estado?.id === estado.id;
              return (
                <button
                  key={estado.id}
                  onClick={() => handleCambiarEstado(estado.id)}
                  disabled={cambiandoEstado || isActive}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    isActive ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
                  <span className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                    {estado.nombre}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {modalEliminarServicio.open && (
        <div className="fixed inset-0 z-[70000] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalEliminarServicio({ open: false, servicio: null })}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Confirmar Eliminación</h2>
              </div>
              <button
                onClick={() => setModalEliminarServicio({ open: false, servicio: null })}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6">
              {modalEliminarServicio.asignacionId ? (
                <>
                  <p className="text-gray-700 mb-2">
                    ¿Estás seguro de que deseas desasignar al terapeuta:
                  </p>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    "{modalEliminarServicio.terapeutaNombre}"
                  </p>
                  <p className="text-gray-700 mb-4">
                    del servicio "{modalEliminarServicio.servicio?.servicio?.nombre}"?
                  </p>
                  <p className="text-sm text-gray-500">
                    Los demás terapeutas del servicio no se verán afectados.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-700 mb-2">
                    ¿Estás seguro de que deseas eliminar el servicio:
                  </p>
                  <p className="text-lg font-semibold text-gray-900 mb-4">
                    "{modalEliminarServicio.servicio?.servicio?.nombre}"?
                  </p>
                  <p className="text-sm text-gray-500">
                    Esta acción no se puede deshacer. Todos los terapeutas asignados serán desvinculados de este servicio.
                  </p>
                </>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setModalEliminarServicio({ open: false, servicio: null })}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarServicio}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-500/30"
              >
                <Trash2 className="w-4 h-4" />
                {modalEliminarServicio.asignacionId ? 'Desasignar Terapeuta' : 'Eliminar Servicio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {errorModal.open && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setErrorModal({ open: false, message: '', title: 'Error' })}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden z-[100001]">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">{errorModal.title}</h2>
              </div>
              <button
                onClick={() => setErrorModal({ open: false, message: '', title: 'Error' })}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 mt-1">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 leading-relaxed">
                    {errorModal.message}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-sm text-amber-800">
                  <strong>Nota:</strong> Para cambiar el terapeuta, primero debe desasignar el servicio actual y luego asignar el nuevo terapeuta al servicio deseado.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end border-t border-gray-100">
              <button
                onClick={() => setErrorModal({ open: false, message: '', title: 'Error' })}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/30"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>

        

      )}

{/* ============== MODAL ASIGNAR CONVENIO ============== */}
{modalConvenio && (
  <div className="fixed inset-0 z-[70000] flex items-center justify-center">
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onClick={() => setModalConvenio(false)}
    />

    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
      <div className="bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Asignar Convenio</h2>
        </div>
        <button
          onClick={() => setModalConvenio(false)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="p-6 space-y-4">
     <div>
  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
    Convenio <span className="text-red-500">*</span>
  </label>
  
  {loadingConvenios ? (
    <div className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm text-gray-500 flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin"></div>
      Cargando...
    </div>
  ) : (
    <select
      value={convenioSeleccionado}
      onChange={(e) => setConvenioSeleccionado(e.target.value)}
      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
    >
      <option value="">Seleccionar convenio...</option>
      {conveniosDisponibles.map(convenio => (
        <option key={convenio.id} value={convenio.id}>
          {convenio.empresa || convenio.nombre}
        </option>
      ))}
    </select>
  )}
  
  {!loadingConvenios && conveniosDisponibles.length === 0 && (
    <p className="text-xs text-red-600 mt-2">
      No hay convenios activos disponibles
    </p>
  )}
</div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            Observaciones
          </label>
          <textarea
            value={observacionesConvenio}
            onChange={(e) => setObservacionesConvenio(e.target.value)}
            placeholder="Detalles adicionales del convenio (cobertura, restricciones, etc.)"
            rows={3}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all resize-none"
          />
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
        <button
          onClick={() => {
            setModalConvenio(false);
            setConvenioSeleccionado('');
            setObservacionesConvenio('');
          }}
          className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={handleAsignarConvenio}
          disabled={!convenioSeleccionado}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] rounded-xl hover:from-[#6A1B9A] hover:to-[#5E1690] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#7B1FA2]/30"
        >
          Asignar Convenio
        </button>
      </div>
    </div>
  </div>
)}

{/* ============== MODAL ELIMINAR CONVENIO ============== */}
{modalEliminarConvenio.open && (
  <div className="fixed inset-0 z-[70000] flex items-center justify-center">
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onClick={() => setModalEliminarConvenio({ open: false, convenio: null })}
    />

    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Eliminar Asignación</h2>
        </div>
        <button
          onClick={() => setModalEliminarConvenio({ open: false, convenio: null })}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="p-6">
        <p className="text-gray-700 mb-2">
          ¿Estás seguro de que deseas quitar el convenio:
        </p>
        <p className="text-lg font-semibold text-gray-900 mb-4">
          "{conveniosDisponibles.find(c => c.id === modalEliminarConvenio.convenio?.convenio_id)?.empresa}"
        </p>
        <p className="text-gray-700 mb-4">
          de este paciente?
        </p>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-sm text-orange-800">
            <strong>Nota:</strong> El paciente dejará de tener acceso a los beneficios de este convenio. Esta acción puede revertirse volviendo a asignar el convenio.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
        <button
          onClick={() => setModalEliminarConvenio({ open: false, convenio: null })}
          className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={handleEliminarConvenio}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-2 shadow-lg shadow-orange-500/30"
        >
          <Trash2 className="w-4 h-4" />
          Quitar Convenio
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default EditarPacientePage;