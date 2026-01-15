import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  User,
  Briefcase,
  Filter,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

// Componentes
import ModalAgendarCita from '../components/Agenda/ModalAgendarCita';
import CalendarioSemanal from '../components/Agenda/CalendarioSemanal';

// Servicios
import { 
  listarCitas, 
  crearCita, 
  eliminarCita, 
  getCitaById,
  crearMultiplesCitas,
  getMotivosCita,
  getEstadosCita 
} from '../services/citaService';
import { getServicios } from '../services/catalogoService';
import { getTrabajadores } from '../services/trabajadorService';
import { actualizarCita } from '../services/citaService';

// Hooks y utilidades
import { useCurrentUser } from '../hooks/useCurrentUser';
import { getEstadoColor } from '../utils/agendaUtils';
import { ROLES } from '../constants/roles';

const Agenda = () => {
  const currentUser = useCurrentUser();
  const [fechaActual, setFechaActual] = useState(new Date());
  const [fechaCalendario, setFechaCalendario] = useState(new Date());
  const [modalAbierto, setModalAbierto] = useState(false);
  const [slotSeleccionado, setSlotSeleccionado] = useState(null);
  const [terapeutaFiltro, setTerapeutaFiltro] = useState('');
  const [citaEditando, setCitaEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formularioCita, setFormularioCita] = useState({
    motivo_id: '',
    paciente: null,
    paciente_id: null,
    doctor_id: null,
    servicio_id: null,
    estado_id: 1,
    duracion: '40',
    fechasHoras: [],
    nota: '',
    terapeutas_ids: [],
    servicios_ids: [],
    encargado: null,
    firma_documento: false,
    user_id_crea: null,
    motivo_accion: '' // ✅ CAMPO PARA MOTIVO DE MODIFICACIÓN
  });
  
  // Estados para datos
  const [citas, setCitas] = useState([]);
  const [todasLasCitas, setTodasLasCitas] = useState([]); // Para validación de disponibilidad
  const [servicios, setServicios] = useState([]);
  const [motivos, setMotivos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Estados para notificaciones
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setCargando(true);
        const [
          motivosRes,
          estadosRes,
          trabajadoresRes,
          serviciosRes
        ] = await Promise.all([
          getMotivosCita(),
          getEstadosCita(),
          getTrabajadores(),
          getServicios()
        ]);

        setMotivos(motivosRes);
        setEstados(estadosRes);
        setTrabajadores(trabajadoresRes);
        setServicios(serviciosRes);
      } catch (error) {
        console.error('Error cargando datos:', error);
        setSnackbarMessage('Error al cargar datos');
        setSnackbarSeverity('error');
        setShowSnackbar(true);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  // Cargar citas
  useEffect(() => {
    const cargarCitas = async () => {
      try {
        let params = {};

        if (currentUser?.rol?.id === ROLES.TERAPEUTA) {
          params.terapeuta_id = currentUser.id;
        } else if ((currentUser?.rol?.id === ROLES.ADMINISTRADOR || currentUser?.rol?.id === ROLES.ADMISION) && terapeutaFiltro) {
          params.terapeuta_id = terapeutaFiltro;
        }

        // Calcular el rango de fechas: toda la semana visible y el resto del mes
        const fecha = new Date(fechaActual);

        // Obtener el primer día del mes
        const primerDiaMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);

        // Obtener el último día del mes
        const ultimoDiaMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);

        // Formatear fechas como YYYY-MM-DD
        const formatearFecha = (f) => {
          const year = f.getFullYear();
          const month = String(f.getMonth() + 1).padStart(2, '0');
          const day = String(f.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        params.fecha_desde = formatearFecha(primerDiaMes);
        params.fecha_hasta = formatearFecha(ultimoDiaMes);

        console.log(`📅 Cargando citas del ${params.fecha_desde} al ${params.fecha_hasta}`);

        // Cargar citas filtradas para mostrar en el calendario
        const citasRes = await listarCitas(params);
        setCitas(citasRes);
        setTodasLasCitas(citasRes);

      } catch (error) {
        console.error('Error cargando citas:', error);
        setSnackbarMessage('Error al cargar citas');
        setSnackbarSeverity('error');
        setShowSnackbar(true);
      }
    };

    if (currentUser) {
      cargarCitas();
    }
  }, [currentUser, terapeutaFiltro, fechaActual]);

  // Determinar tipo de cita basado en motivo_id
  const determinarTipoCita = (motivoId) => {
    const motivo = motivos.find(m => m.id === parseInt(motivoId));
    if (!motivo) return 'NORMAL';
    
    const tipoCodigo = motivo.tipoCita?.codigo;
    return tipoCodigo || 'NORMAL';
  };

  const formatearHora = (hora) => {
    if (!hora) return '';
    const [h, m] = hora.split(':');
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  };

  // Función auxiliar para obtener parámetros de fecha del mes actual visualizado
  const obtenerParamsFechaActual = () => {
    const params = {};

    if (currentUser?.rol?.id === ROLES.TERAPEUTA) {
      params.terapeuta_id = currentUser.id;
    } else if ((currentUser?.rol?.id === ROLES.ADMINISTRADOR || currentUser?.rol?.id === ROLES.ADMISION) && terapeutaFiltro) {
      params.terapeuta_id = terapeutaFiltro;
    }

    const fecha = new Date(fechaActual);
    const primerDiaMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const ultimoDiaMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);

    const formatearFecha = (f) => {
      const year = f.getFullYear();
      const month = String(f.getMonth() + 1).padStart(2, '0');
      const day = String(f.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    params.fecha_desde = formatearFecha(primerDiaMes);
    params.fecha_hasta = formatearFecha(ultimoDiaMes);

    return params;
  };

  const abrirModalDesdeSlot = (dia, hora) => {
    const doctorId = currentUser?.rol?.id === ROLES.TERAPEUTA
      ? currentUser.id
      : terapeutaFiltro;

    setSlotSeleccionado({
      dia: dia.nombre,
      hora,
      fecha: dia.fechaString
    });

    const horaFormateada = formatearHora(hora);

    setFormularioCita({
      motivo_id: '',
      paciente: null,
      paciente_id: null,
      doctor_id: doctorId,
      servicio_id: null,
      estado_id: 1,
      duracion: '40',
      fechasHoras: [{ fecha: dia.fechaString, horaInicio: horaFormateada }],
      nota: '',
      terapeutas_ids: [],
      servicios_ids: [],
      encargado: null,
      firma_documento: false,
      user_id_crea: currentUser?.id || null
    });

    setCitaEditando(null);
    setModalAbierto(true);
  };

  const abrirModalNuevaCita = () => {
    const doctorId = currentUser?.rol?.id === ROLES.TERAPEUTA 
      ? currentUser.id 
      : terapeutaFiltro;
    
    setSlotSeleccionado(null);
    setFormularioCita({
      motivo_id: '',
      paciente: null,
      paciente_id: null,
      doctor_id: doctorId,
      servicio_id: null,
      estado_id: 1,
      duracion: '40',
      fechasHoras: [],
      nota: '',
      terapeutas_ids: [],
      servicios_ids: [],
      encargado: null,
      firma_documento: false,
      user_id_crea: currentUser?.id || null
    });
    setCitaEditando(null);
    setModalAbierto(true);
  };

  const handleCitaClick = async (citaData) => {
    try {
   
      const citaCompleta = await getCitaById(citaData.cita.id);

      
      setCitaEditando(citaCompleta);
      
      // Formatear datos para el formulario
      const paciente = citaCompleta.paciente ? {
        id: citaCompleta.paciente_id,
        nombre_completo: `${citaCompleta.paciente.nombres || ''} ${citaCompleta.paciente.apellido_paterno || ''} ${citaCompleta.paciente.apellido_materno || ''}`.trim() || 'Paciente'
      } : null;

      let fechasHoras = [];
      if (citaCompleta.fecha && citaCompleta.hora_inicio) {
        fechasHoras = [{
          fecha: citaCompleta.fecha,
          horaInicio: citaCompleta.hora_inicio.substring(0, 5)
        }];
      }

      // Extraer datos según tipo de cita
      let terapeutas_ids = [];
      let servicios_ids = [];
      let encargado = null;
      let firma_documento = false;

      if (citaCompleta.tipo_cita === 'REUNION_CLINICA') {
        terapeutas_ids = citaCompleta.terapeutas?.map(t => t.id_terapeuta || t.terapeuta_id || t.id) || [];
        servicios_ids = citaCompleta.servicios?.map(s => s.id_servicio || s.servicio_id || s.id) || [];
      } else if (citaCompleta.tipo_cita === 'VISITA_ESCOLAR') {
        encargado = {
          nombre_completo: citaCompleta.nombre_intermediario || citaCompleta.encargado?.nombre_completo || '',
          telefono: citaCompleta.telefono || citaCompleta.encargado?.telefono || '',
          institucion: citaCompleta.nombre_colegio || citaCompleta.encargado?.institucion || ''
        };
        firma_documento = Boolean(citaCompleta.firma_documento);
      }

      setFormularioCita({
        motivo_id: citaCompleta.motivo_id,
        paciente,
        paciente_id: citaCompleta.paciente_id,
        doctor_id: citaCompleta.doctor_id,
        servicio_id: citaCompleta.servicio_id,
        estado_id: citaCompleta.estado_id,
        duracion: citaCompleta.duracion_minutos?.toString() || '40',
        fechasHoras,
        nota: citaCompleta.nota || '',
        terapeutas_ids,
        servicios_ids,
        encargado,
        firma_documento,
        user_id_crea: citaCompleta.user_id_crea || currentUser?.id
      });

      setModalAbierto(true);
    } catch (error) {
      console.error('Error cargando cita:', error);
      setSnackbarMessage('Error al cargar la cita');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setSlotSeleccionado(null);
    setCitaEditando(null);
    setFormularioCita({
      motivo_id: '',
      paciente: null,
      paciente_id: null,
      doctor_id: null,
      servicio_id: null,
      estado_id: 1,
      duracion: '40',
      fechasHoras: [],
      nota: '',
      terapeutas_ids: [],
      servicios_ids: [],
      encargado: null,
      firma_documento: false,
      user_id_crea: null,
      motivo_accion: '' // ✅ RESETEAR MOTIVO
    });
  };

  const manejarCambioFormulario = useCallback((campo, valor) => {
    if (campo === 'paciente') {
      setFormularioCita(prev => ({
        ...prev,
        paciente: valor,
        paciente_id: valor ? valor.id : null
      }));
    } else if (campo === 'agregarFechaHora') {
      setFormularioCita(prev => ({
        ...prev,
        fechasHoras: [...prev.fechasHoras, { fecha: '', horaInicio: '' }]
      }));
    } else if (campo === 'eliminarFechaHora') {
      setFormularioCita(prev => ({
        ...prev,
        fechasHoras: prev.fechasHoras.filter((_, index) => index !== valor)
      }));
    } else if (campo === 'actualizarFechaHora') {
      const { index, campo: subCampo, valor: subValor } = valor;
      
      setFormularioCita(prev => {
        const nuevasFechasHoras = [...prev.fechasHoras];
        nuevasFechasHoras[index] = {
          ...nuevasFechasHoras[index],
          [subCampo]: subValor
        };
        
        return {
          ...prev,
          fechasHoras: nuevasFechasHoras
        };
      });
    } else {
      setFormularioCita(prev => ({
        ...prev,
        [campo]: valor
      }));
    }
  }, []);

const guardarCita = async (datosFormulario = null) => {
  setGuardando(true);
  
  try {
    const datos = datosFormulario || formularioCita;

    console.log('💾 Guardando cita con datos:', datos);
    console.log('📅 Cantidad de fechas/horas:', datos.fechasHoras?.length);

    // Validaciones básicas
    if (!datos.paciente_id) {
      throw new Error('Se requiere seleccionar un paciente');
    }

    if (!datos.motivo_id) {
      throw new Error('Se requiere seleccionar un motivo');
    }

    if (!datos.fechasHoras || datos.fechasHoras.length === 0) {
      throw new Error('Se requiere al menos una fecha y hora');
    }

    // Validar que todas las fechas/horas estén completas
    const fechasHorasValidas = datos.fechasHoras.every(fh => fh.fecha && fh.horaInicio);
    if (!fechasHorasValidas) {
      throw new Error('Todas las fechas y horas deben estar completas');
    }

    const tipoCita = determinarTipoCita(datos.motivo_id);
    console.log('📋 Tipo de cita:', tipoCita);

    // Construir datos base comunes
    let datosBase = {
      motivo_id: parseInt(datos.motivo_id),
      paciente_id: datos.paciente_id,
      estado_id: parseInt(datos.estado_id || 1),
      duracion_minutos: parseInt(datos.duracion || 40),
      nota: datos.nota || '',
      user_id_crea: currentUser.id,
      motivo_accion: datos.motivo_accion || '' // ✅ INCLUIR MOTIVO DE ACCIÓN
      
    };

    // Agregar campos según tipo de cita
    if (tipoCita === 'NORMAL') {
      if (!datos.doctor_id || !datos.servicio_id) {
        throw new Error('Se requiere terapeuta y servicio para cita normal');
      }
      datosBase.doctor_id = parseInt(datos.doctor_id);
      datosBase.servicio_id = parseInt(datos.servicio_id);
    } 
    else if (tipoCita === 'REUNION_CLINICA') {
      if (!datos.terapeutas_ids || datos.terapeutas_ids.length === 0) {
        throw new Error('Se requiere al menos un terapeuta para reunión clínica');
      }
      if (!datos.servicios_ids || datos.servicios_ids.length === 0) {
        throw new Error('Se requiere al menos un servicio para reunión clínica');
      }
      datosBase.terapeutas_ids = datos.terapeutas_ids.map(id => parseInt(id));
      datosBase.servicios_ids = datos.servicios_ids.map(id => parseInt(id));
    } 
    else if (tipoCita === 'VISITA_ESCOLAR') {
      if (!datos.doctor_id) {
        throw new Error('Se requiere terapeuta para visita escolar');
      }
      if (!datos.encargado?.nombre_completo || !datos.encargado?.institucion) {
        throw new Error('Se requiere nombre del encargado y nombre de la institución');
      }
      datosBase.doctor_id = parseInt(datos.doctor_id);
      datosBase.servicio_id = datos.servicio_id ? parseInt(datos.servicio_id) : null;
      datosBase.encargado = datos.encargado;
      datosBase.firma_documento = Boolean(datos.firma_documento);
    }

    // Función auxiliar para calcular hora_fin
    const calcularHoraFin = (horaInicio, duracionMinutos) => {
      const [hora, minuto] = horaInicio.split(':').map(Number);
      const totalMinutos = hora * 60 + minuto + parseInt(duracionMinutos);
      const horaFin = Math.floor(totalMinutos / 60);
      const minutoFin = totalMinutos % 60;
      return `${String(horaFin).padStart(2, '0')}:${String(minutoFin).padStart(2, '0')}:00`;
    };

    // 🎯 AQUÍ ESTÁ LA MAGIA: Detectar si son múltiples citas
    if (citaEditando) {
      // ✏️ MODO EDICIÓN - Siempre es una sola cita
      console.log('✏️ Actualizando cita existente:', citaEditando.id);

      const horaInicio = datos.fechasHoras[0].horaInicio + ':00';
      const horaFin = calcularHoraFin(datos.fechasHoras[0].horaInicio, datosBase.duracion_minutos);

      const citaDto = {
        ...datosBase,
        fecha: datos.fechasHoras[0].fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin
      };

      console.log('📤 Datos a actualizar:', citaDto);

      await actualizarCita(citaEditando.id, citaDto);
      setSnackbarMessage('✅ Cita actualizada correctamente');

    } else {
      // ➕ MODO CREACIÓN - Detectar si hay múltiples fechas
      const cantidadFechas = datos.fechasHoras.length;
      console.log(`📊 Cantidad de fechas a crear: ${cantidadFechas}`);

      if (cantidadFechas > 1) {
        // 🔄 CREAR MÚLTIPLES CITAS
        console.log(`🔄 Creando ${cantidadFechas} citas...`);

        const citasACrear = datos.fechasHoras.map((fechaHora, index) => {
          const horaInicio = fechaHora.horaInicio + ':00';
          const horaFin = calcularHoraFin(fechaHora.horaInicio, datosBase.duracion_minutos);

          console.log(`Preparando cita ${index + 1}:`, {
            fecha: fechaHora.fecha,
            hora: fechaHora.horaInicio,
            hora_fin: horaFin
          });

          return {
            ...datosBase,
            fecha: fechaHora.fecha,
            hora_inicio: horaInicio,
            hora_fin: horaFin
          };
        });

        console.log('📤 Enviando múltiples citas al backend:', citasACrear);

        const resultado = await crearMultiplesCitas(citasACrear);

        console.log('📊 Resultado del backend:', resultado);

        // Mostrar mensaje según el resultado
        if (resultado.exitosas === resultado.total) {
          setSnackbarMessage(`✅ ${resultado.exitosas} citas creadas exitosamente`);
        } else if (resultado.exitosas > 0) {
          setSnackbarMessage(`⚠️ ${resultado.exitosas} de ${resultado.total} citas creadas. ${resultado.fallidas} fallaron.`);
          console.error('❌ Errores:', resultado.errores);
        } else {
          throw new Error('No se pudo crear ninguna cita');
        }

      } else {
        // 📝 CREAR UNA SOLA CITA
        console.log('📝 Creando una sola cita');

        const horaInicio = datos.fechasHoras[0].horaInicio + ':00';
        const horaFin = calcularHoraFin(datos.fechasHoras[0].horaInicio, datosBase.duracion_minutos);

        const citaDto = {
          ...datosBase,
          fecha: datos.fechasHoras[0].fecha,
          hora_inicio: horaInicio,
          hora_fin: horaFin
        };

        console.log('📤 Enviando cita única:', citaDto);

        await crearCita(citaDto);
        setSnackbarMessage('✅ Cita creada correctamente');
      }
    }
    
    setSnackbarSeverity('success');
    setShowSnackbar(true);

    // Recargar citas del mes actual visualizado
    console.log('🔄 Recargando citas...');
    const params = obtenerParamsFechaActual();
    console.log(`🔄 Recargando citas del ${params.fecha_desde} al ${params.fecha_hasta}`);

    const citasActualizadas = await listarCitas(params);
    setCitas(citasActualizadas);
    setTodasLasCitas(citasActualizadas);

    cerrarModal();
  } catch (error) {
    console.error('❌ Error guardando cita:', error);
    console.error('❌ Detalles:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    let mensajeError = 'Error al guardar la cita';
    if (error.response?.data?.message) {
      mensajeError = error.response.data.message;
    } else if (error.message) {
      mensajeError = error.message;
    }

    setSnackbarMessage(mensajeError);
    setSnackbarSeverity('error');
    setShowSnackbar(true);
  } finally {
    setGuardando(false);
  }
};

  const handleEliminarCita = async (motivoEliminacion) => {
    if (!citaEditando?.id) return;

    try {
      // ✅ Enviar motivo de eliminación al backend
      await eliminarCita(citaEditando.id, currentUser?.id, motivoEliminacion);

      setSnackbarMessage('Cita eliminada correctamente');
      setSnackbarSeverity('success');
      setShowSnackbar(true);

      // Recargar citas del mes actual visualizado
      const params = obtenerParamsFechaActual();
      const citasActualizadas = await listarCitas(params);
      setCitas(citasActualizadas);
      setTodasLasCitas(citasActualizadas);

      cerrarModal();
    } catch (error) {
      console.error('Error eliminando cita:', error);

      let mensajeError = 'Error al eliminar la cita';
      if (error.response?.data?.message) {
        mensajeError = error.response.data.message;
      } else if (error.message) {
        mensajeError = error.message;
      }

      setSnackbarMessage(mensajeError);
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    }
  };

  const obtenerLimitesSemanaMostrada = (fecha) => {
    const hoy = new Date(fecha);
    const dia = hoy.getDay();
    const diferencia = hoy.getDate() - dia + (dia === 0 ? -6 : 1);
    const primerDia = new Date(hoy);
    primerDia.setDate(diferencia);
    primerDia.setHours(0, 0, 0, 0);

    const ultimoDia = new Date(primerDia);
    ultimoDia.setDate(primerDia.getDate() + 6);
    ultimoDia.setHours(23, 59, 59, 999);

    return { primerDia, ultimoDia };
  };

  const obtenerCitasSemana = (citas, fecha) => {
    const { primerDia, ultimoDia } = obtenerLimitesSemanaMostrada(fecha);
    
    return citas?.filter(c => {
      const [year, month, day] = c.fecha.split('-');
      const citaDate = new Date(year, month - 1, day);
      citaDate.setHours(0, 0, 0, 0);
      
      return citaDate >= primerDia && citaDate <= ultimoDia;
    }).length || 0;
  };

  // Obtener terapeutas disponibles
  const terapeutasDisponibles = trabajadores.filter(trabajador => {
    const rolId = trabajador.rol_id || trabajador.rol?.id;
    return rolId === ROLES.TERAPEUTA && (trabajador.estado === true || trabajador.estado === 1);
  });

  // Obtener terapeuta seleccionado para el modal - memorizado con useMemo
  const terapeutaSeleccionadoMemo = useMemo(() => {
    if (currentUser?.rol?.id === ROLES.TERAPEUTA) {
      return currentUser;
    } else if (terapeutaFiltro) {
      const filtroId = typeof terapeutaFiltro === 'string' ? parseInt(terapeutaFiltro) : terapeutaFiltro;
      return terapeutasDisponibles.find(t => t.id === filtroId);
    }
    return null;
  }, [currentUser, terapeutaFiltro, terapeutasDisponibles]);

  const debeSeleccionarTerapeuta = (currentUser?.rol?.id === ROLES.ADMINISTRADOR || currentUser?.rol?.id === ROLES.ADMISION) && !terapeutaFiltro;

  // Duración de citas disponibles - memorizado para evitar re-renders
  const duraciones = useMemo(() => [
    { valor: '40', label: '40 minutos' },
    { valor: '50', label: '50 minutos' },
  ], []);

  // Función para obtener color de estado
  const getEstadoColorCustom = useCallback((estado) => {
    if (!estado) return '#7B1FA2';
    
    const estadoNombre = typeof estado === 'object' ? estado.nombre : estado;
    const estadoObj = estados.find(e => e.nombre === estadoNombre);
    if (!estadoObj) return '#7B1FA2';
    
    const colores = {
      'Programada': '#7B1FA2',
      'Confirmada': '#4CAF50',
      'Cancelada': '#F44336',
      'Completada': '#2196F3',
      'En progreso': '#FF9800'
    };
    
    return colores[estadoObj.nombre] || '#7B1FA2';
  }, [estados]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Snackbar de notificaciones */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pt-24 lg:pt-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-2xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Agenda de Citas</h1>
              <p className="text-gray-600">Gestiona y organiza las citas de tus pacientes</p>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{citas?.length || 0}</div>
                  <div className="text-xs text-gray-600 font-medium">Total Citas</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {obtenerCitasSemana(citas, fechaCalendario)}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">Esta Semana</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#7B1FA2]" />
              <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
            </div>
          </div>

          {(currentUser?.rol?.id === ROLES.ADMINISTRADOR || currentUser?.rol?.id === ROLES.ADMISION) && (
            <div className="max-w-md">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Terapeuta *
              </label>
              <select
                value={terapeutaFiltro}
                onChange={(e) => setTerapeutaFiltro(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="">Seleccione un terapeuta</option>
                {terapeutasDisponibles.map((terapeuta) => (
                  <option key={terapeuta.id} value={terapeuta.id}>
                    {terapeuta.nombres} {terapeuta.apellidos}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Contenido */}
        {cargando ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-[#7B1FA2] border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-3 text-gray-600">Cargando citas...</p>
          </div>
        ) : debeSeleccionarTerapeuta ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-[#7B1FA2]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Seleccione un terapeuta</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Por favor, utilice el filtro de terapeuta en la parte superior para seleccionar al profesional cuya agenda desea visualizar.
            </p>
          </div>
        ) : (
          <CalendarioSemanal
            citas={citas}
            onSlotClick={abrirModalDesdeSlot}
            onCitaClick={handleCitaClick}
            getEstadoColor={getEstadoColorCustom}
            fechaActual={fechaActual}
            onFechaChange={(nuevaFecha) => {
              setFechaActual(nuevaFecha);
              setFechaCalendario(nuevaFecha);
            }}
            currentUser={currentUser}
          />
        )}

        {/* Botón flotante */}
        {(currentUser?.rol?.id === ROLES.ADMINISTRADOR || currentUser?.rol?.id === ROLES.ADMISION) && (
          <button
            onClick={abrirModalNuevaCita}
            className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-2xl shadow-xl flex items-center justify-center hover:shadow-2xl hover:scale-110 transition-all z-40"
          >
            <Plus className="w-7 h-7" />
          </button>
        )}

        {/* Modal */}
        <ModalAgendarCita
          open={modalAbierto}
          onClose={cerrarModal}
          slotSeleccionado={slotSeleccionado}
          formularioCita={formularioCita}
          onFormularioChange={manejarCambioFormulario}
          onGuardar={guardarCita}
          onEliminar={handleEliminarCita}
          servicios={servicios}
          duraciones={duraciones}
          terapeutaSeleccionado={terapeutaSeleccionadoMemo}
          modoEdicion={!!citaEditando}
          citaEditando={citaEditando}
          currentUser={currentUser}
          guardando={guardando}
          motivos={motivos}
          trabajadores={trabajadores}
          citas={todasLasCitas}
        />
      </div>
    </div>
  );
};

export default Agenda;