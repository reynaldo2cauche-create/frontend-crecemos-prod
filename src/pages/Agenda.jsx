import React, { useState } from 'react';
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

// Datos y utilidades
import { 
  diasSemana, 
  horas, 
  servicios, 
  duraciones,
  citasEjemplo
} from '../constants/agendaData';
import { getEstadoColor, getEstadoIcon } from '../utils/agendaUtils';
import { useCitas } from '../hooks/useCitas';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useTrabajadores } from '../hooks/useTrabajadores';
import { ROLES } from '../constants/roles';

const Agenda = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [fechaCalendario, setFechaCalendario] = useState(new Date());
  const [modalAbierto, setModalAbierto] = useState(false);
  const [slotSeleccionado, setSlotSeleccionado] = useState(null);
  const [terapeutaFiltro, setTerapeutaFiltro] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [citaEditando, setCitaEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formularioCita, setFormularioCita] = useState({
    paciente: null,
    doctor_id: '',
    servicio_id: '',
    motivo_id: '',
    duracion: '',
    fechasHoras: [],
    nota: ''
  });

  const currentUser = useCurrentUser();
  const { trabajadores } = useTrabajadores();
  const { citas, loading, error, listarCitas, crearCita, crearMultiplesCitas, actualizarCita, eliminarCita } = useCitas();
  
  React.useEffect(() => {
    if (!currentUser) return;
    
    if (currentUser.rol?.id === ROLES.TERAPEUTA) {
      listarCitas({ terapeuta_id: currentUser.id });
    } else if ((currentUser.rol?.id === ROLES.ADMINISTRADOR || currentUser.rol?.id === ROLES.ADMISION) && terapeutaFiltro) {
      listarCitas({ terapeuta_id: terapeutaFiltro });
    } else if (currentUser.rol?.id === ROLES.ADMISION) {
      listarCitas();
    }
  }, [currentUser, terapeutaFiltro]);

  React.useEffect(() => {
    if (!currentUser) return;
    
    if (currentUser.rol?.id === ROLES.TERAPEUTA) {
      listarCitas({ terapeuta_id: currentUser.id });
    } else if ((currentUser.rol?.id === ROLES.ADMINISTRADOR || currentUser.rol?.id === ROLES.ADMISION) && terapeutaFiltro) {
      listarCitas({ terapeuta_id: terapeutaFiltro });
    } else if (currentUser.rol?.id === ROLES.ADMISION) {
      listarCitas();
    }
  }, [fechaActual]);

  const formatearHora = (hora) => {
    if (!hora) return '';
    const [h, m] = hora.split(':');
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
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

    setFormularioCita({
      paciente: null,
      doctor_id: doctorId,
      servicio_id: '',
      motivo_id: '',
      duracion: '',
      fechasHoras: [{ fecha: dia.fechaString, horaInicio: formatearHora(hora) }],
      nota: ''
    });
    setModalAbierto(true);
  };

  const abrirModalNuevaCita = () => {
    const doctorId = currentUser?.rol?.id === ROLES.TERAPEUTA 
      ? currentUser.id 
      : terapeutaFiltro;
    
    setSlotSeleccionado(null);
    setFormularioCita({
      paciente: null,
      doctor_id: doctorId,
      servicio_id: '',
      motivo_id: '',
      duracion: '',
      fechasHoras: [],
      nota: ''
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setSlotSeleccionado(null);
    setCitaEditando(null);
    setFormularioCita({
      paciente: null,
      doctor_id: '',
      servicio_id: '',
      motivo_id: '',
      duracion: '',
      fechasHoras: [],
      nota: ''
    });
  };

  const manejarCambioFormulario = (campo, valor) => {
    if (campo === 'agregarFechaHora') {
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
      setFormularioCita(prev => ({
        ...prev,
        fechasHoras: prev.fechasHoras.map((fh, index) => 
          index === valor.index 
            ? { ...fh, [valor.campo]: valor.valor }
            : fh
        )
      }));
    } else {
      setFormularioCita(prev => ({
        ...prev,
        [campo]: valor
      }));
    }
  };

  const guardarCita = async (datosFormulario = null) => {
    setGuardando(true);
    try {
      // Usar los datos recibidos o los del estado
      const datos = datosFormulario || formularioCita;

      const validaciones = [];

      if (!datos.paciente?.id) validaciones.push('Debe seleccionar un paciente');
      if (!datos.motivo_id) validaciones.push('Debe seleccionar un motivo');

      // Determinar tipo de cita según motivo_id
      const motivoId = parseInt(datos.motivo_id);
      let tipoCita = 'NORMAL';
      if (motivoId === 6) {
        tipoCita = 'REUNION_CLINICA';
      } else if (motivoId === 7) {
        tipoCita = 'VISITA_ESCOLAR';
      }

      // Validaciones según tipo de cita
      if (tipoCita === 'NORMAL') {
        if (!datos.doctor_id) validaciones.push('Debe seleccionar un terapeuta');
        if (!datos.servicio_id) validaciones.push('Debe seleccionar un servicio');
      } else if (tipoCita === 'REUNION_CLINICA') {
        if (!datos.terapeutas_ids || datos.terapeutas_ids.length === 0) {
          validaciones.push('Debe seleccionar al menos un terapeuta para la reunión clínica');
        }
        if (!datos.servicios_ids || datos.servicios_ids.length === 0) {
          validaciones.push('Debe seleccionar al menos un servicio para la reunión clínica');
        }
      } else if (tipoCita === 'VISITA_ESCOLAR') {
        if (!datos.doctor_id) validaciones.push('Debe seleccionar un terapeuta');
        if (!datos.encargado?.nombre_completo) validaciones.push('Debe ingresar el nombre del encargado');
        if (!datos.encargado?.institucion) validaciones.push('Debe ingresar el nombre del colegio');
        if (!datos.encargado?.telefono) validaciones.push('Debe ingresar el teléfono del encargado');
      }

      if (!datos.duracion) validaciones.push('Debe seleccionar una duración');
      if (!datos.fechasHoras || datos.fechasHoras.length === 0) {
        validaciones.push('Debe agregar al menos una fecha y hora');
      } else {
        datos.fechasHoras.forEach((fh, index) => {
          if (!fh.fecha) validaciones.push(`Debe seleccionar una fecha para la cita ${index + 1}`);
          if (!fh.horaInicio) validaciones.push(`Debe seleccionar una hora para la cita ${index + 1}`);
        });
      }

      if (validaciones.length > 0) {
        setSnackbar({ 
          open: true, 
          message: `Por favor complete los siguientes campos:\n• ${validaciones.join('\n• ')}`, 
          severity: 'error' 
        });
        setGuardando(false);
        return;
      }

      if (citaEditando) {
        const citaData = {
          paciente_id: datos.paciente?.id,
          doctor_id: datos.doctor_id,
          servicio_id: datos.servicio_id,
          motivo_id: datos.motivo_id,
          fecha: datos.fechasHoras[0].fecha,
          hora_inicio: datos.fechasHoras[0].horaInicio + ':00',
          duracion_minutos: parseInt(datos.duracion),
          nota: datos.nota,
          user_id_crea: currentUser?.id,
          estado_id: 1,
          // Datos del nuevo sistema
          terapeutas_ids: datos.terapeutas_ids || [],
          servicios_ids: datos.servicios_ids || [],
          encargado: datos.encargado || null,
          firma_documento: datos.firma_documento || false,
        };
        await actualizarCita(citaEditando.id, citaData);
        setSnackbar({ open: true, message: 'Cita actualizada correctamente', severity: 'success' });
      } else {
        const citasParaCrear = datos.fechasHoras.map(fechaHora => ({
          paciente_id: datos.paciente?.id,
          doctor_id: datos.doctor_id,
          servicio_id: datos.servicio_id,
          motivo_id: datos.motivo_id,
          fecha: fechaHora.fecha,
          hora_inicio: fechaHora.horaInicio + ':00',
          duracion_minutos: parseInt(datos.duracion),
          nota: datos.nota,
          user_id_crea: currentUser?.id,
          estado_id: 1,
          // Datos del nuevo sistema
          terapeutas_ids: datos.terapeutas_ids || [],
          servicios_ids: datos.servicios_ids || [],
          encargado: datos.encargado || null,
          firma_documento: datos.firma_documento || false,
        }));

        // Crear cada cita individualmente
        const promesas = citasParaCrear.map(cita => crearCita(cita));
        const resultados = await Promise.all(promesas);

        const cantidadCitas = resultados.length;
        setSnackbar({
          open: true,
          message: `${cantidadCitas} cita${cantidadCitas > 1 ? 's' : ''} agendada${cantidadCitas > 1 ? 's' : ''} correctamente`,
          severity: 'success'
        });
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      cerrarModal();
    } catch (error) {
      console.error('Error capturado en guardarCita:', error);

      // Error 409: Conflicto de horarios con otra cita
      if (error.status === 409) {
        let mensajeConflicto = error.message || 'Ya existe una cita en ese horario';
        if (error.conflictos && error.conflictos.length > 0) {
          const detallesConflictos = error.conflictos.map(c => {
            const fecha = new Date(c.fecha).toLocaleDateString('es-ES');
            return `• ${fecha} a las ${c.hora_inicio}`;
          }).join('\n');
          mensajeConflicto = `Conflicto de horarios detectado:\n${detallesConflictos}`;
        }
        setSnackbar({ open: true, message: mensajeConflicto, severity: 'error' });
      }
      // Error 400: Validaciones (horarios bloqueados, datos incorrectos, etc.)
      else if (error.status === 400) {
        // El mensaje del backend ya viene formateado y específico
        const mensajeValidacion = error.message || error.response?.data?.message || 'Error de validación';
        setSnackbar({ open: true, message: mensajeValidacion, severity: 'error' });
      }
      // Otros errores
      else {
        let mensajeError = citaEditando ? 'Error al actualizar la cita' : 'Error al agendar la cita';
        if (error.message) {
          mensajeError = error.message;
        } else if (error.response?.data?.message) {
          mensajeError = error.response.data.message;
        }
        setSnackbar({ open: true, message: mensajeError, severity: 'error' });
      }
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarCita = async () => {
    if (!citaEditando?.id) return;
    
    try {
      const resultado = await eliminarCita(citaEditando.id, currentUser?.id);
      const mensaje = resultado.message || 'Cita eliminada exitosamente';
      setSnackbar({ 
        open: true, 
        message: mensaje,
        severity: 'success' 
      });
      cerrarModal();
    } catch (error) {
      let mensajeError = 'Error al eliminar la cita';
      if (error.response?.data?.message) {
        mensajeError = error.response.data.message;
      } else if (error.message) {
        mensajeError = error.message;
      }
      setSnackbar({ open: true, message: mensajeError, severity: 'error' });
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

  const obtenerCitasConfirmadas = (citas) => {
    return citas?.filter(c => c.estado_id === 2 || c.estado === 'confirmada').length || 0;
  };

  const obtenerCitasSemana = (citas, fecha) => {
    const { primerDia, ultimoDia } = obtenerLimitesSemanaMostrada(fecha);
    
    return citas?.filter(c => {
      // Crear fecha sin considerar la zona horaria
      const [year, month, day] = c.fecha.split('-');
      const citaDate = new Date(year, month - 1, day);
      citaDate.setHours(0, 0, 0, 0);
      
      return citaDate >= primerDia && citaDate <= ultimoDia;
    }).length || 0;
  };

  // Obtener el terapeuta seleccionado para el modal
  const obtenerTerapeutaSeleccionado = () => {
    if (currentUser?.rol?.id === ROLES.TERAPEUTA) {
      return currentUser;
    } else if (terapeutaFiltro) {
      const filtroId = typeof terapeutaFiltro === 'string' ? parseInt(terapeutaFiltro) : terapeutaFiltro;
      const terapeuta = trabajadores.find(t => t.id === filtroId);
      return terapeuta;
    }
    return null;
  };

  const debeSeleccionarTerapeuta = (currentUser?.rol?.id === ROLES.ADMINISTRADOR || currentUser?.rol?.id === ROLES.ADMISION) && !terapeutaFiltro;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pt-24 lg:pt-12">
        
        {/* Notificación */}
        {snackbar.open && (
          <div className={`fixed top-6 right-6 z-[9999] px-5 py-3.5 rounded-xl shadow-lg border transform transition-all duration-300 ${
            snackbar.severity === 'success'
              ? 'bg-white border-gray-100'
              : 'bg-white border-red-100'
          } flex items-center gap-3 max-w-md`}>
            <div className={`w-1.5 h-1.5 rounded-full ${snackbar.severity === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-700 whitespace-pre-line flex-1">{snackbar.message}</span>
            <button onClick={() => setSnackbar({ ...snackbar, open: false })} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

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
                {trabajadores && trabajadores.length > 0 ? (
                  trabajadores
                    .filter(t => {
                      const rolId = t.rol_id || t.rol?.id;
                      // El campo en el backend se llama 'estado' y es boolean (true = activo, false = inactivo)
                      const esActivo = t.estado === true;
                      return rolId === ROLES.TERAPEUTA && esActivo;
                    })
                    .map((terapeuta) => (
                      <option key={terapeuta.id} value={terapeuta.id}>
                        {terapeuta.nombres} {terapeuta.apellidos}
                      </option>
                    ))
                ) : (
                  <option disabled>Cargando terapeutas...</option>
                )}
              </select>
            </div>
          )}
        </div>

        {/* Contenido */}
        {debeSeleccionarTerapeuta ? (
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
            horas={horas}
            citas={citas}
            onSlotClick={abrirModalDesdeSlot}
            onCitaClick={({ fecha, hora, cita }) => {
              const horaInicioCita = cita.hora_inicio ? cita.hora_inicio.substring(0, 5) : hora;
              setSlotSeleccionado({ dia: '', hora: horaInicioCita, fecha });
              setCitaEditando(cita);

              // Extraer terapeutas adicionales
              const terapeutasAdicionales = cita.terapeutas_adicionales?.map(t => t.id || t.terapeuta_id) || [];

              // Extraer servicios
              const servicios = cita.servicios?.map(s => s.servicio_id || s.id) || [];

              setFormularioCita({
                fechasHoras: [{ fecha, horaInicio: formatearHora(horaInicioCita) }],
                paciente: cita.paciente_id ? {
                  id: cita.paciente_id,
                  nombre_completo: cita.paciente_nombre
                } : null,
                doctor_id: cita.doctor_id || '',
                servicio_id: cita.servicio_id || '',
                motivo_id: cita.motivo_id || '',
                duracion: String(cita.duracion_minutos || ''),
                nota: cita.nota || '',
                terapeutas_adicionales: terapeutasAdicionales,
                servicios_adicionales: servicios
              });
              setModalAbierto(true);
            }}
            getEstadoColor={getEstadoColor}
            getEstadoIcon={getEstadoIcon}
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
          terapeutaSeleccionado={obtenerTerapeutaSeleccionado()}
          modoEdicion={!!citaEditando}
          citaEditando={citaEditando}
          currentUser={currentUser}
          guardando={guardando}
        />
      </div>
    </div>
  );
};

export default Agenda;