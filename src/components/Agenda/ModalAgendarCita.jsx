import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  X,
  Search,
  User,
  Briefcase,
  FileText,
  Save,
  Trash2,
  Plus,
  AlertTriangle,
  History,
  Users,
  Building2,
  Phone,
  AlertCircle,
  MessageCircle,
  Copy,
  Check
} from 'lucide-react';
import { useBusquedaPacientes } from '../../hooks/useBusquedaPacientes';
import { useServicios } from '../../hooks/useServicios';
import { useMotivosCita } from '../../hooks/useMotivosCita';
import { useHistorialCita } from '../../hooks/useHistorialCita';
import { useTrabajadores } from '../../hooks/useTrabajadores';
import { ROLES } from '../../constants/roles';
import api from '../../services/api';

// Importamos el hook de geofencing
import { useGeofencing } from '../../hooks/useGeofencing';

const ModalAgendarCita = ({
  open,
  onClose,
  slotSeleccionado,
  formularioCita,
  onFormularioChange,
  onGuardar,
  onEliminar,
  servicios,
  duraciones,
  terapeutaSeleccionado,
  modoEdicion = false,
  citaEditando = null,
  currentUser = null,
  guardando = false,
  citas = []
}) => {
  const [queryPaciente, setQueryPaciente] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [dialogoEliminarAbierto, setDialogoEliminarAbierto] = useState(false);
  const [motivoEliminacion, setMotivoEliminacion] = useState('');
  const [modalYaAbierto, setModalYaAbierto] = useState(false);

  // Estado para el modal de alerta
  const [alertaAbierta, setAlertaAbierta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState('');

  // ✅ USAR motivoAccion DEL PADRE (formularioCita.motivo_accion)
  const motivoAccion = formularioCita.motivo_accion || '';

  // Estados para tipos de cita
  const [tipoCita, setTipoCita] = useState(null);
  const [terapeutasReunion, setTerapeutasReunion] = useState([]);

  // Estados para asistencia
  const [seguimientoAsistencia, setSeguimientoAsistencia] = useState(null);
  const [cargandoAsistencia, setCargandoAsistencia] = useState(false);
  const [guardandoAsistencia, setGuardandoAsistencia] = useState(false);

  // Estados para el tab de recordatorio
  const [mensajeRecordatorio, setMensajeRecordatorio] = useState('');
  const [copiado, setCopiado] = useState(false);

  // Determinar permisos
  const esRecepcionista = currentUser?.rol?.id === ROLES.ADMISION;
  const esTerapeuta = currentUser?.rol?.id === ROLES.TERAPEUTA;

  // 🆕 Verificar geofencing SOLO para roles TERAPEUTA y ADMISIÓN
  const requiereGeofencing = esTerapeuta || esRecepcionista;
  const { cargando: cargandoGeofencing, dentroDelPerimetro } = useGeofencing(requiereGeofencing, 30000);

  // 🆕 Determinar si debe estar en modo solo lectura (solo lectura cuando está fuera del perímetro)
  const modoSoloLectura = requiereGeofencing && !dentroDelPerimetro;

  // Cargar seguimiento de asistencia
  const cargarSeguimientoAsistencia = useCallback(async () => {
    if (!citaEditando?.id) return;

    setCargandoAsistencia(true);
    try {
      const response = await api.get(`/asistencia/seguimiento/${citaEditando.id}`);
      setSeguimientoAsistencia(response.data);
    } catch (error) {
      console.error('Error al cargar seguimiento:', error);
    } finally {
      setCargandoAsistencia(false);
    }
  }, [citaEditando?.id]);

  // Marcar llegada (Recepción) - ✅ SIEMPRE PERMITIDO, INCLUSO FUERA DEL PERÍMETRO
  const handleRecepcionMarcar = async (estadoId) => {
    setGuardandoAsistencia(true);
    try {
      await api.post('/asistencia/registrar-recepcion', {
        cita_id: citaEditando.id,
        usuario_id: currentUser.id,
        estado_id: estadoId
      });

      await cargarSeguimientoAsistencia();
    } catch (error) {
      console.error('Error al registrar:', error);
      alert(error.response?.data?.message || 'Error al registrar');
    } finally {
      setGuardandoAsistencia(false);
    }
  };

  // Marcar sesión completada (Terapeuta) - ✅ SIEMPRE PERMITIDO, INCLUSO FUERA DEL PERÍMETRO
  const handleTerapeutaMarcar = async (estadoId) => {
    setGuardandoAsistencia(true);
    try {
      await api.post('/asistencia/registrar-terapeuta', {
        cita_id: citaEditando.id,
        terapeuta_id: currentUser.id,
        estado_id: estadoId
      });

      await cargarSeguimientoAsistencia();
    } catch (error) {
      console.error('Error al registrar:', error);
      alert(error.response?.data?.message || 'Error al registrar');
    } finally {
      setGuardandoAsistencia(false);
    }
  };

  // Cargar seguimiento cuando se abre el tab
  useEffect(() => {
    if (tabValue === 2 && modoEdicion && citaEditando?.id) {
      cargarSeguimientoAsistencia();
    }
  }, [tabValue, modoEdicion, citaEditando?.id, cargarSeguimientoAsistencia]);

  // ✅ useCallback para el onChange del campo motivo - Actualiza en el PADRE
  const handleMotivoChange = useCallback((e) => {
    if (modoSoloLectura) return;
    
    const nuevoValor = e.target.value;
    onFormularioChange('motivo_accion', nuevoValor);
  }, [onFormularioChange, modoSoloLectura]);

  const [serviciosReunion, setServiciosReunion] = useState([]);
  const [encargadoVisita, setEncargadoVisita] = useState({
    nombre_completo: '',
    telefono: '',
    institucion: ''
  });
  const [documentoFirmado, setDocumentoFirmado] = useState(false);

  const { pacientes, loading: loadingPacientes } = useBusquedaPacientes(queryPaciente);
  const serviciosApi = useServicios();
  const { motivos, loading: loadingMotivos } = useMotivosCita();
  const { trabajadores } = useTrabajadores();
  const { historial, loading: loadingHistorial, error: errorHistorial } = useHistorialCita(
    modoEdicion && citaEditando?.id ? citaEditando.id : null
  );

  // Permisos del usuario
  const puedeVerHistorial = currentUser?.rol?.id === ROLES.ADMINISTRADOR || 
                           currentUser?.rol?.id === ROLES.ADMISION || 
                           currentUser?.rol?.id === ROLES.TERAPEUTA;
  
  const puedeEliminar = currentUser?.rol?.id === ROLES.ADMINISTRADOR && !modoSoloLectura;

  // Función para generar mensaje de recordatorio
  const generarMensajeRecordatorio = useCallback(() => {
    if (modoSoloLectura) return;

    // En modo edición, usar los datos reales de citaEditando
    if (modoEdicion && citaEditando) {
      if (!citaEditando.fecha || !citaEditando.hora_inicio) {
        console.warn('No hay fecha u hora_inicio disponible para generar el mensaje');
        return;
      }

      // 🔥 OBTENER TODAS LAS CITAS DEL MISMO PACIENTE EN EL MISMO DÍA
      const citasMismoDia = citas.filter(cita => {
        return cita.paciente_id === citaEditando.paciente_id &&
               cita.fecha === citaEditando.fecha;
      }).sort((a, b) => {
        // Ordenar por hora de inicio
        return a.hora_inicio.localeCompare(b.hora_inicio);
      });

      const fechaStr = citaEditando.fecha;
      const [year, month, day] = fechaStr.split('-').map(Number);
      const fechaObj = new Date(year, month - 1, day);

      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

      const diaSemana = diasSemana[fechaObj.getDay()];
      const dia = fechaObj.getDate();
      const mes = meses[fechaObj.getMonth()];

      // 🔥 SI HAY MÚLTIPLES CITAS, GENERAR MENSAJE AGRUPADO
      if (citasMismoDia.length > 1) {
        let mensajeCitas = '';

        citasMismoDia.forEach((cita, index) => {
          const [hours, minutes] = cita.hora_inicio.split(':').map(Number);
          let horasFormateadas = hours;
          const ampm = horasFormateadas >= 12 ? 'pm' : 'am';
          horasFormateadas = horasFormateadas % 12;
          horasFormateadas = horasFormateadas ? horasFormateadas : 12;
          const horaFormateada = `${horasFormateadas}:${minutes.toString().padStart(2, '0')} ${ampm}`;

          let servicioNombre = 'Servicio no especificado';
          if (cita.tipo_cita === 'NORMAL' && cita.servicio) {
            servicioNombre = cita.servicio.nombre;
          } else if (cita.tipo_cita === 'VISITA_ESCOLAR') {
            servicioNombre = 'Visita Escolar';
          } else if (cita.tipo_cita === 'REUNION_CLINICA') {
            servicioNombre = 'Reunión Clínica';
          }

          let terapeutaNombre = 'Terapeuta no especificado';
          if (cita.tipo_cita === 'NORMAL' || cita.tipo_cita === 'VISITA_ESCOLAR') {
            if (cita.doctor) {
              terapeutaNombre = `Lic. ${cita.doctor.nombres || ''} ${cita.doctor.apellidos || ''}`.trim();
            }
          } else if (cita.tipo_cita === 'REUNION_CLINICA' && cita.terapeutas && cita.terapeutas.length > 0) {
            terapeutaNombre = 'Equipo de Terapeutas';
          }

          mensajeCitas += `\n${index + 1}️⃣ *Cita ${index + 1}*
🕓 ${horaFormateada}
💜 ${servicioNombre}
✨ ${terapeutaNombre}`;

          if (index < citasMismoDia.length - 1) {
            mensajeCitas += '\n';
          }
        });

        const mensaje = `Buenas tardes, Sr(a).
Le hacemos recordar sus citas para el día de mañana
🗓️ ${diaSemana}, ${dia} de ${mes}
${mensajeCitas}

🥳 ¡Los esperamos! ✨`;

        setMensajeRecordatorio(mensaje);
        setCopiado(false);
      } else {
        // 🔥 UNA SOLA CITA - MENSAJE INDIVIDUAL (FORMATO ORIGINAL)
        const [hours, minutes] = citaEditando.hora_inicio.split(':').map(Number);
        let horasFormateadas = hours;
        const ampm = horasFormateadas >= 12 ? 'pm' : 'am';
        horasFormateadas = horasFormateadas % 12;
        horasFormateadas = horasFormateadas ? horasFormateadas : 12;
        const horaFormateada = `${horasFormateadas}:${minutes.toString().padStart(2, '0')} ${ampm}`;

        let servicioNombre = 'Servicio no especificado';
        if (citaEditando.tipo_cita === 'NORMAL' && citaEditando.servicio) {
          servicioNombre = citaEditando.servicio.nombre;
        } else if (citaEditando.tipo_cita === 'VISITA_ESCOLAR') {
          servicioNombre = 'Visita Escolar';
        } else if (citaEditando.tipo_cita === 'REUNION_CLINICA') {
          servicioNombre = 'Reunión Clínica';
        }

        let terapeutaNombre = 'Terapeuta no especificado';
        if (citaEditando.tipo_cita === 'NORMAL' || citaEditando.tipo_cita === 'VISITA_ESCOLAR') {
          if (citaEditando.doctor) {
            terapeutaNombre = `Lic. ${citaEditando.doctor.nombres || ''} ${citaEditando.doctor.apellidos || ''}`.trim();
          }
        } else if (citaEditando.tipo_cita === 'REUNION_CLINICA' && citaEditando.terapeutas && citaEditando.terapeutas.length > 0) {
          terapeutaNombre = 'Equipo de Terapeutas';
        }

        const mensaje = `Buenas tardes, Sr(a).
Le hacemos recordar su cita para el día de mañana
🗓️ ${diaSemana}, ${dia} de ${mes}
🕓 ${horaFormateada}
💜 ${servicioNombre}
✨ ${terapeutaNombre}

🥳 ¡Los esperamos! ✨`;

        setMensajeRecordatorio(mensaje);
        setCopiado(false);
      }
    } else {
      if (!formularioCita.paciente || !formularioCita.fechasHoras?.[0]) {
        alert('No hay suficiente información para generar el mensaje');
        return;
      }

      const fechaHora = formularioCita.fechasHoras[0];
      const fechaObj = new Date(`${fechaHora.fecha}T${fechaHora.horaInicio}`);
      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

      const diaSemana = diasSemana[fechaObj.getDay()];
      const dia = fechaObj.getDate();
      const mes = meses[fechaObj.getMonth()];

      let horas = fechaObj.getHours();
      let minutos = fechaObj.getMinutes();
      const ampm = horas >= 12 ? 'pm' : 'am';
      horas = horas % 12;
      horas = horas ? horas : 12;
      const horaFormateada = `${horas}:${minutos.toString().padStart(2, '0')} ${ampm}`;

      let servicioNombre = 'Servicio no especificado';
      if (tipoCita === 'NORMAL' && formularioCita.servicio_id) {
        const servicio = (serviciosApi && serviciosApi.length ? serviciosApi : (servicios || []))
          .find(s => s.id === parseInt(formularioCita.servicio_id));
        servicioNombre = servicio?.nombre || 'Servicio no especificado';
      } else if (tipoCita === 'VISITA_ESCOLAR') {
        servicioNombre = 'Visita Escolar';
      } else if (tipoCita === 'REUNION_CLINICA') {
        servicioNombre = 'Reunión Clínica';
      }

      let terapeutaNombre = 'Terapeuta no especificado';
      if (tipoCita === 'NORMAL' || tipoCita === 'VISITA_ESCOLAR') {
        if (terapeutaSeleccionado) {
          terapeutaNombre = `Lic. ${terapeutaSeleccionado.nombres || ''} ${terapeutaSeleccionado.apellidos || ''}`.trim();
        }
      } else if (tipoCita === 'REUNION_CLINICA' && terapeutasReunion.length > 0) {
        terapeutaNombre = 'Equipo de Terapeutas';
      }

      const mensaje = `Buenas tardes, Sr(a).
Le hacemos recordar su cita para el día de mañana
🗓️ ${diaSemana}, ${dia} de ${mes}
🕓 ${horaFormateada}
💜 ${servicioNombre}
✨ ${terapeutaNombre}

🥳 ¡Los esperamos! ✨`;

      setMensajeRecordatorio(mensaje);
      setCopiado(false);
    }
  }, [modoEdicion, citaEditando, tipoCita, formularioCita, serviciosApi, servicios, terapeutaSeleccionado, terapeutasReunion, modoSoloLectura, citas]);

  // Función para copiar al portapapeles
  const copiarAlPortapapeles = async () => {
    if (modoSoloLectura) return;
    
    try {
      await navigator.clipboard.writeText(mensajeRecordatorio);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
      alert('Error al copiar el mensaje');
    }
  };

  // Verificar si una hora está disponible
  const verificarDisponibilidad = (fechaString, hora, duracionMinutos) => {
    if (!fechaString || !hora) return true;

    if (!citas || citas.length === 0) {
      return true;
    }

    let terapeutasIds = [];

    if (tipoCita === 'NORMAL' || tipoCita === 'VISITA_ESCOLAR') {
      const doctorId = formularioCita.doctor_id || terapeutaSeleccionado?.id;
      if (doctorId) {
        terapeutasIds = [parseInt(doctorId)];
      }
    } else if (tipoCita === 'REUNION_CLINICA') {
      terapeutasIds = terapeutasReunion
        .map(t => parseInt(t.terapeuta_id))
        .filter(id => id && !isNaN(id));

      if (terapeutasIds.length === 0 && formularioCita.terapeutas_ids && formularioCita.terapeutas_ids.length > 0) {
        terapeutasIds = formularioCita.terapeutas_ids
          .map(id => parseInt(id))
          .filter(id => id && !isNaN(id));
      }

      if (terapeutasIds.length === 0 && citaEditando) {
        if (citaEditando.terapeutas && citaEditando.terapeutas.length > 0) {
          terapeutasIds = citaEditando.terapeutas
            .map(t => parseInt(t.id_terapeuta || t.terapeuta_id || t.id))
            .filter(id => id && !isNaN(id));
        }
      }

      if (terapeutasIds.length === 0) {
        return true;
      }
    }

    if (terapeutasIds.length === 0) {
      return true;
    }

    const citasDelDia = citas.filter(cita => {
      if (citaEditando && cita.id === citaEditando.id) {
        return false;
      }

      if (cita.fecha !== fechaString) {
        return false;
      }

      if (cita.tipo_cita === 'NORMAL' || cita.tipo_cita === 'VISITA_ESCOLAR') {
        const estaInvolucrado = terapeutasIds.includes(cita.doctor_id);
        return estaInvolucrado;
      } else if (cita.tipo_cita === 'REUNION_CLINICA') {
        const terapeutasCita = cita.terapeutas?.map(t =>
          t.id_terapeuta || t.terapeuta_id || t.id
        ).filter(id => id) || [];

        const compartenTerapeuta = terapeutasIds.some(id => terapeutasCita.includes(id));
        return compartenTerapeuta;
      }

      return false;
    });

    const [horaH, horaM] = hora.split(':').map(Number);
    const horaInicioMinutos = horaH * 60 + horaM;
    const horaFinMinutos = horaInicioMinutos + parseInt(duracionMinutos || 40);

    for (const cita of citasDelDia) {
      const [citaH, citaM] = cita.hora_inicio.split(':').map(Number);
      const citaInicioMinutos = citaH * 60 + citaM;
      const citaFinMinutos = citaInicioMinutos + parseInt(cita.duracion_minutos || 40);

      if (
        (horaInicioMinutos >= citaInicioMinutos && horaInicioMinutos < citaFinMinutos) ||
        (horaFinMinutos > citaInicioMinutos && horaFinMinutos <= citaFinMinutos) ||
        (horaInicioMinutos <= citaInicioMinutos && horaFinMinutos >= citaFinMinutos)
      ) {
        return false;
      }
    }

    return true;
  };

  // Generar horas según el día de la semana
  const generarHorasPorFecha = (fechaString, duracion) => {
    if (!fechaString) return [];

    const fecha = new Date(fechaString + 'T00:00:00');
    const diaSemana = fecha.getDay();
    const horas = [];

    if (diaSemana === 6) {
      let minutos = 8 * 60;
      const finMinutos = 14 * 60;

      while (minutos < finMinutos) {
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        minutos += 40;
      }
    } else if (diaSemana >= 1 && diaSemana <= 5) {
      horas.push('08:20', '09:00', '09:40', '10:20', '11:00', '11:40', '12:20');

      let minutos = 14 * 60;
      const finMinutos = 20 * 60;

      while (minutos <= finMinutos) {
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        minutos += 40;
      }
    } else {
      return [];
    }

    return horas.filter(hora => verificarDisponibilidad(fechaString, hora, duracion));
  };

  // Efecto para inicializar cuando se abre el modal
  useEffect(() => {
    if (!open) {
      setModalYaAbierto(false);
      return;
    }

    if (open && !modalYaAbierto) {
      setModalYaAbierto(true);
      setQueryPaciente('');
      setTabValue(0);
      setDialogoEliminarAbierto(false);
      setMensajeRecordatorio('');
      setCopiado(false);
      setMotivoEliminacion('');

      if (formularioCita.terapeutas_ids && formularioCita.terapeutas_ids.length > 0) {
        setTerapeutasReunion(formularioCita.terapeutas_ids.map(id => ({ terapeuta_id: id })));
      } else {
        if (terapeutaSeleccionado?.id && !modoEdicion) {
          setTerapeutasReunion([{ terapeuta_id: terapeutaSeleccionado.id }]);
        } else {
          setTerapeutasReunion([]);
        }
      }

      if (formularioCita.servicios_ids && formularioCita.servicios_ids.length > 0) {
        setServiciosReunion(formularioCita.servicios_ids.map(id => ({ servicio_id: id })));
      } else {
        setServiciosReunion([]);
      }

      if (formularioCita.encargado) {
        setEncargadoVisita(formularioCita.encargado);
      } else {
        setEncargadoVisita({ nombre_completo: '', telefono: '', institucion: '' });
      }

      setDocumentoFirmado(formularioCita.firma_documento === 1 || formularioCita.firma_documento === true);

      if (!formularioCita.fechasHoras || formularioCita.fechasHoras.length === 0) {
        onFormularioChange('fechasHoras', [{ fecha: '', horaInicio: '' }]);
      }
    }
  }, [open, modalYaAbierto]);

  // Detectar tipo de cita según motivo_id
  useEffect(() => {
    if (formularioCita.motivo_id && motivos.length > 0) {
      const motivo = motivos.find(m => m.id === parseInt(formularioCita.motivo_id));
      if (motivo && motivo.tipoCita) {
        setTipoCita(motivo.tipoCita.codigo);
      } else {
        setTipoCita('NORMAL');
      }
    } else {
      setTipoCita(null);
    }
  }, [formularioCita.motivo_id, motivos]);

  // Funciones para Reunión Clínica
  const agregarTerapeuta = () => {
    if (modoSoloLectura) return;
    setTerapeutasReunion([...terapeutasReunion, { terapeuta_id: '' }]);
  };
  
  const eliminarTerapeuta = (index) => {
    if (modoSoloLectura) return;
    setTerapeutasReunion(terapeutasReunion.filter((_, i) => i !== index));
  };
  
  const actualizarTerapeuta = (index, valor) => {
    if (modoSoloLectura) return;
    const nuevos = [...terapeutasReunion];
    nuevos[index].terapeuta_id = parseInt(valor);
    setTerapeutasReunion(nuevos);
  };

  const agregarServicio = () => {
    if (modoSoloLectura) return;
    setServiciosReunion([...serviciosReunion, { servicio_id: '' }]);
  };
  
  const eliminarServicio = (index) => {
    if (modoSoloLectura) return;
    setServiciosReunion(serviciosReunion.filter((_, i) => i !== index));
  };
  
  const actualizarServicio = (index, valor) => {
    if (modoSoloLectura) return;
    const nuevos = [...serviciosReunion];
    nuevos[index].servicio_id = parseInt(valor);
    setServiciosReunion(nuevos);
  };

  // HandleGuardar modificado
  const handleGuardar = useCallback(() => {
    if (modoSoloLectura) return;

    if (modoEdicion && !esTerapeuta) {
      if (!motivoAccion || motivoAccion.trim() === '') {
        setMensajeAlerta('El motivo de modificación es obligatorio para actualizar la cita.');
        setAlertaAbierta(true);
        return;
      }
    }

    let datosGuardar = { ...formularioCita };

    if (modoEdicion && !esTerapeuta) {
      datosGuardar.motivo_accion = motivoAccion;
    }

    if (tipoCita === 'NORMAL') {
      datosGuardar.terapeutas_ids = [];
      datosGuardar.servicios_ids = [];
      datosGuardar.encargado = null;
      datosGuardar.firma_documento = false;
    } else if (tipoCita === 'REUNION_CLINICA') {
      datosGuardar.terapeutas_ids = terapeutasReunion.filter(t => t.terapeuta_id).map(t => parseInt(t.terapeuta_id));
      datosGuardar.servicios_ids = serviciosReunion.filter(s => s.servicio_id).map(s => parseInt(s.servicio_id));
      datosGuardar.doctor_id = null;
      datosGuardar.servicio_id = null;
      datosGuardar.encargado = null;
      datosGuardar.firma_documento = false;
    } else if (tipoCita === 'VISITA_ESCOLAR') {
      datosGuardar.encargado = encargadoVisita;
      datosGuardar.terapeutas_ids = [];
      datosGuardar.servicios_ids = [];
      datosGuardar.firma_documento = documentoFirmado ? 1 : 0;
    }

    datosGuardar.esMultiple = !modoEdicion && datosGuardar.fechasHoras && datosGuardar.fechasHoras.length > 1;

    onGuardar(datosGuardar);
  }, [modoEdicion, esTerapeuta, motivoAccion, formularioCita, tipoCita, terapeutasReunion, serviciosReunion, encargadoVisita, documentoFirmado, onGuardar, modoSoloLectura]);

  const abrirDialogoEliminar = () => {
    if (modoSoloLectura) return;
    setDialogoEliminarAbierto(true);
  };
  
  const cerrarDialogoEliminar = () => {
    setDialogoEliminarAbierto(false);
    setMotivoEliminacion('');
  };
  
  const confirmarEliminar = () => {
    if (modoSoloLectura) return;

    if (!motivoEliminacion || motivoEliminacion.trim() === '') {
      setMensajeAlerta('El motivo de eliminación es obligatorio para eliminar la cita.');
      setAlertaAbierta(true);
      return;
    }

    setDialogoEliminarAbierto(false);
    if (onEliminar) onEliminar(motivoEliminacion);
  };

  const formatearFechaHistorial = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIconoOperacion = (tipo) => {
    switch (tipo) {
      case 'CREATE': return <Plus className="w-4 h-4" />;
      case 'UPDATE': return <Save className="w-4 h-4" />;
      case 'DELETE': return <Trash2 className="w-4 h-4" />;
      default: return <History className="w-4 h-4" />;
    }
  };

  const getColorOperacion = (tipo) => {
    switch (tipo) {
      case 'CREATE': return 'bg-green-50 text-green-700 border-green-200';
      case 'UPDATE': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DELETE': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] ring-1 ring-black/5">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#7B1FA2] via-[#8E24AA] to-[#9C27B0] px-6 py-4">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center ring-1 ring-white/20 shadow-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {esTerapeuta || modoSoloLectura ? 'Ver Cita' : (modoEdicion ? 'Editar Cita' : 'Nueva Cita')}
                  </h2>
                  {slotSeleccionado && (
                    <p className="text-white/90 text-sm font-medium mt-0.5">
                      {slotSeleccionado.dia} • {slotSeleccionado.hora}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={guardando}
                className="text-white/80 hover:text-white hover:bg-white/15 p-2 rounded-xl transition-all duration-200 disabled:opacity-50 backdrop-blur-sm ring-1 ring-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          {modoEdicion && puedeVerHistorial && (
            <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white overflow-x-auto">
              <div className="flex px-2 min-w-max">
                <button
                  onClick={() => setTabValue(0)}
                  className={`flex items-center gap-2 px-3 sm:px-5 py-3.5 text-xs sm:text-sm font-semibold transition-all duration-200 relative whitespace-nowrap ${
                    tabValue === 0
                      ? 'text-[#7B1FA2]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Detalles</span>
                  <span className="sm:hidden">Det.</span>
                  {tabValue === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] rounded-full"></div>
                  )}
                </button>

                <button
                  onClick={() => setTabValue(1)}
                  className={`flex items-center gap-2 px-3 sm:px-5 py-3.5 text-xs sm:text-sm font-semibold transition-all duration-200 relative whitespace-nowrap ${
                    tabValue === 1
                      ? 'text-[#7B1FA2]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">Historial</span>
                  <span className="sm:hidden">Hist.</span>
                  {tabValue === 1 && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] rounded-full"></div>
                  )}
                </button>

                {/* TAB DE ASISTENCIA - ✅ SIEMPRE DISPONIBLE, INCLUSO FUERA DEL PERÍMETRO */}
                <button
                  onClick={() => setTabValue(2)}
                  className={`flex items-center gap-2 px-3 sm:px-5 py-3.5 text-xs sm:text-sm font-semibold transition-all duration-200 relative whitespace-nowrap ${
                    tabValue === 2
                      ? 'text-[#7B1FA2]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Asistencia</span>
                  <span className="sm:hidden">Asist.</span>
                  {tabValue === 2 && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] rounded-full"></div>
                  )}
                </button>

                {/* TAB DE RECORDATORIO - Solo para Admisión y Administración */}
                {!esTerapeuta && (
                  <button
                    onClick={() => setTabValue(3)}
                    className={`flex items-center gap-2 px-3 sm:px-5 py-3.5 text-xs sm:text-sm font-semibold transition-all duration-200 relative whitespace-nowrap ${
                      tabValue === 3
                        ? 'text-[#7B1FA2]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Recordatorio</span>
                    <span className="sm:hidden">Rec.</span>
                    {tabValue === 3 && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] rounded-full"></div>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
            {(!modoEdicion || !puedeVerHistorial || tabValue === 0) && (
              <div className="space-y-5">
                {/* MOTIVO */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Motivo de la Cita <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formularioCita.motivo_id || ''}
                    onChange={(e) => onFormularioChange('motivo_id', e.target.value)}
                    disabled={loadingMotivos || esTerapeuta || modoSoloLectura}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900
                    focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/20
                    transition-all disabled:opacity-60 disabled:bg-gray-50
                    hover:border-gray-300"
                  >
                    <option value="">{loadingMotivos ? 'Cargando...' : 'Seleccionar motivo...'}</option>
                    {motivos.map((motivo) => (
                      <option key={motivo.id} value={motivo.id}>{motivo.nombre}</option>
                    ))}
                  </select>
                  {tipoCita && (
                    <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                      <p className="text-xs font-medium text-blue-700">
                        {tipoCita === 'NORMAL' ? 'Cita Normal' : tipoCita === 'REUNION_CLINICA' ? 'Reunión Clínica' : 'Visita Escolar'}
                      </p>
                    </div>
                  )}
                </div>

                {/* PACIENTE */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Paciente <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar por nombre..."
                      value={queryPaciente}
                      onChange={(e) => setQueryPaciente(e.target.value)}
                      disabled={esTerapeuta || modoSoloLectura}
                      className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-900
                      focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/20
                      transition-all disabled:opacity-60 disabled:bg-gray-50
                      hover:border-gray-300"
                    />
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  </div>

                  {queryPaciente.length >= 2 && pacientes.length > 0 && !modoSoloLectura && (
                    <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {pacientes.map((paciente) => (
                        <button
                          key={paciente.id}
                          onClick={() => {
                            onFormularioChange('paciente', paciente);
                            setQueryPaciente('');
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-all border-b border-gray-100 last:border-0"
                        >
                          <p className="text-sm font-medium text-gray-900">{paciente.nombre_completo || paciente.nombre}</p>
                          {paciente.documento && <p className="text-xs text-gray-500">DNI: {paciente.documento}</p>}
                        </button>
                      ))}
                    </div>
                  )}

                  {formularioCita.paciente && (
                    <div className="mt-2 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{formularioCita.paciente.nombre_completo}</p>
                      </div>
                      {!esTerapeuta && !modoSoloLectura && (
                        <button onClick={() => onFormularioChange('paciente', null)} className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* FORMULARIOS POR TIPO */}
                {tipoCita === 'NORMAL' && (
                  <>
                    {/* Terapeuta y Servicio */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Terapeuta <span className="text-red-500">*</span>
                        </label>
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              {terapeutaSeleccionado ? `${terapeutaSeleccionado.nombres || ''} ${terapeutaSeleccionado.apellidos || ''}`.trim() : 'No seleccionado'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Servicio <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formularioCita.servicio_id || ''}
                          onChange={(e) => onFormularioChange('servicio_id', e.target.value)}
                          disabled={esTerapeuta || modoSoloLectura}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="">Seleccionar servicio...</option>
                          {(() => {
                            const lista = (serviciosApi && serviciosApi.length ? serviciosApi : (servicios || []));

                            if (!Array.isArray(lista) || lista.length === 0) {
                              return <option disabled>No hay servicios disponibles</option>;
                            }

                            const areasMap = {
                              1: 'Infantil y Adolescentes',
                              2: 'Adultos'
                            };

                            const agrupados = {};
                            lista.forEach(srv => {
                              const areaId = srv.area_id || srv.area?.id;
                              const areaNombre = areasMap[areaId] || 'Otros';

                              if (!agrupados[areaNombre]) {
                                agrupados[areaNombre] = [];
                              }
                              agrupados[areaNombre].push(srv);
                            });

                            const ordenAreas = ['Infantil y Adolescentes', 'Adultos', 'Otros'];
                            return ordenAreas
                              .filter(area => agrupados[area] && agrupados[area].length > 0)
                              .map(areaNombre => (
                                <optgroup key={areaNombre} label={areaNombre}>
                                  {agrupados[areaNombre].map(srv => (
                                    <option key={srv.id} value={srv.id}>
                                      {srv.nombre || 'Sin nombre'}
                                    </option>
                                  ))}
                                </optgroup>
                              ));
                          })()}
                        </select>
                      </div>
                    </div>

                    {/* Duración */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Duración <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formularioCita.duracion}
                        onChange={(e) => onFormularioChange('duracion', e.target.value)}
                        disabled={esTerapeuta || modoSoloLectura}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50"
                      >
                        <option value="">Seleccionar duración...</option>
                        {duraciones.map((duracion) => (
                          <option key={duracion.valor} value={duracion.valor}>
                            {duracion.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Fechas y Horas */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          {modoEdicion ? 'Fecha y Hora' : 'Fechas y Horas'} <span className="text-red-500">*</span>
                        </label>
                        {!esTerapeuta && !modoEdicion && !modoSoloLectura && (
                          <button
                            onClick={() => onFormularioChange('agregarFechaHora', null)}
                            className="flex items-center gap-1 text-sm font-medium text-[#7B1FA2] hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            Agregar
                          </button>
                        )}
                      </div>

                      {modoEdicion ? (
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="date"
                            value={formularioCita.fechasHoras?.[0]?.fecha || ''}
                            onChange={(e) => {
                              if (modoSoloLectura) return;
                              const fecha = new Date(e.target.value + 'T00:00:00');
                              const diaSemana = fecha.getDay();
                              if (diaSemana >= 1 && diaSemana <= 6) {
                                onFormularioChange('actualizarFechaHora', { index: 0, campo: 'fecha', valor: e.target.value });
                              } else {
                                alert('Solo se pueden agendar citas de lunes a sábado');
                              }
                            }}
                            disabled={esTerapeuta || modoSoloLectura}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all disabled:opacity-50"
                          />
                          <select
                            value={formularioCita.fechasHoras?.[0]?.horaInicio || ''}
                            onChange={(e) => {
                              if (modoSoloLectura) return;
                              onFormularioChange('actualizarFechaHora', { index: 0, campo: 'horaInicio', valor: e.target.value });
                            }}
                            disabled={esTerapeuta || modoSoloLectura || !formularioCita.fechasHoras?.[0]?.fecha}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50"
                          >
                            <option value="">
                              {!formularioCita.fechasHoras?.[0]?.fecha ? 'Seleccione una fecha primero' : 'Seleccionar hora...'}
                            </option>
                            {formularioCita.fechasHoras?.[0]?.fecha &&
                              generarHorasPorFecha(formularioCita.fechasHoras[0].fecha, formularioCita.duracion ? parseInt(formularioCita.duracion) : 40).map(hora => (
                                <option key={hora} value={hora}>{hora}</option>
                              ))
                            }
                          </select>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {formularioCita.fechasHoras && formularioCita.fechasHoras.length > 0 ? (
                            formularioCita.fechasHoras.map((fechaHora, index) => (
                              <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative">
                                {!esTerapeuta && !modoSoloLectura && formularioCita.fechasHoras.length > 1 && (
                                  <button
                                    onClick={() => onFormularioChange('eliminarFechaHora', index)}
                                    className="absolute top-2 right-2 text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="date"
                                    value={fechaHora.fecha}
                                    onChange={(e) => {
                                      if (modoSoloLectura) return;
                                      const fecha = new Date(e.target.value + 'T00:00:00');
                                      const diaSemana = fecha.getDay();
                                      if (diaSemana >= 1 && diaSemana <= 6) {
                                        onFormularioChange('actualizarFechaHora', { index, campo: 'fecha', valor: e.target.value });
                                      } else {
                                        alert('Solo se pueden agendar citas de lunes a sábado');
                                      }
                                    }}
                                    disabled={esTerapeuta || modoSoloLectura}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all disabled:opacity-50"
                                  />
                                  <select
                                    value={fechaHora.horaInicio || ''}
                                    onChange={(e) => {
                                      if (modoSoloLectura) return;
                                      onFormularioChange('actualizarFechaHora', { index, campo: 'horaInicio', valor: e.target.value });
                                    }}
                                    disabled={esTerapeuta || modoSoloLectura || !fechaHora.fecha}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50"
                                  >
                                    <option value="">
                                      {!fechaHora.fecha ? 'Seleccione una fecha primero' : 'Seleccionar hora...'}
                                    </option>
                                    {fechaHora.fecha &&
                                      generarHorasPorFecha(fechaHora.fecha, formularioCita.duracion ? parseInt(formularioCita.duracion) : 40).map(hora => (
                                        <option key={hora} value={hora}>{hora}</option>
                                      ))
                                    }
                                  </select>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <p className="text-sm text-gray-500">Haga clic en "Agregar" para agregar fechas y horas</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Nota */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nota (Opcional)</label>
                      <textarea
                        value={formularioCita.nota || ''}
                        onChange={(e) => onFormularioChange('nota', e.target.value)}
                        disabled={esTerapeuta || modoSoloLectura}
                        rows={2}
                        placeholder="Observaciones adicionales..."
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] resize-none disabled:opacity-60"
                      />
                    </div>
                  </>
                )}

                {tipoCita === 'REUNION_CLINICA' && (
                  <>
                    {/* Terapeutas */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Terapeutas <span className="text-red-500">*</span>
                        </label>
                        {!esTerapeuta && !modoSoloLectura && (
                          <button
                            onClick={agregarTerapeuta}
                            className="flex items-center gap-1 text-sm font-medium text-[#7B1FA2] hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            Agregar
                          </button>
                        )}
                      </div>
                      {terapeutasReunion.length > 0 ? (
                        <div className="space-y-2">
                          {terapeutasReunion.map((terapeuta, index) => {
                            const esPrimerTerapeuta = index === 0 && terapeutaSeleccionado?.id;
                            const esDisabled = esTerapeuta || modoSoloLectura || (esPrimerTerapeuta && !modoEdicion);

                            return (
                              <div key={index} className="flex gap-2">
                                <select
                                  value={terapeuta.terapeuta_id || ''}
                                  onChange={(e) => actualizarTerapeuta(index, e.target.value)}
                                  disabled={esDisabled}
                                  className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none transition-all ${
                                    esDisabled
                                      ? 'bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed'
                                      : 'bg-gray-50 border-gray-300 focus:ring-2 focus:ring-[#7B1FA2]'
                                  }`}
                                >
                                  <option value="">Seleccionar terapeuta...</option>
                                  {trabajadores
                                    .filter(t => {
                                      const rolId = t.rol_id || t.rol?.id;
                                      const esActivo = t.estado === true;
                                      return rolId === ROLES.TERAPEUTA && esActivo;
                                    })
                                    .map((t) => (
                                      <option key={t.id} value={t.id}>
                                        {t.nombres} {t.apellidos}
                                      </option>
                                    ))}
                                </select>
                                {!esTerapeuta && !modoSoloLectura && !(esPrimerTerapeuta && !modoEdicion) && (
                                  <button
                                    onClick={() => eliminarTerapeuta(index)}
                                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <p className="text-sm text-gray-500">Haga clic en "Agregar" para agregar terapeutas</p>
                        </div>
                      )}
                    </div>

                    {/* Servicios */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Servicios <span className="text-red-500">*</span>
                        </label>
                        {!esTerapeuta && !modoSoloLectura && (
                          <button
                            onClick={agregarServicio}
                            className="flex items-center gap-1 text-sm font-medium text-[#7B1FA2] hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            Agregar
                          </button>
                        )}
                      </div>
                      {serviciosReunion.length > 0 ? (
                        <div className="space-y-2">
                          {serviciosReunion.map((servicio, index) => (
                            <div key={index} className="flex gap-2">
                              <select
                                value={servicio.servicio_id || ''}
                                onChange={(e) => actualizarServicio(index, e.target.value)}
                                disabled={esTerapeuta || modoSoloLectura}
                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] disabled:opacity-60"
                              >
                                <option value="">Seleccionar servicio...</option>
                                {(() => {
                                  const lista = (serviciosApi && serviciosApi.length ? serviciosApi : (servicios || []));
                                  if (!Array.isArray(lista) || lista.length === 0) {
                                    return <option disabled>No hay servicios</option>;
                                  }

                                  const areasMap = { 1: 'Infantil y Adolescentes', 2: 'Adultos' };
                                  const agrupados = {};
                                  lista.forEach(srv => {
                                    const areaId = srv.area_id || srv.area?.id;
                                    const areaNombre = areasMap[areaId] || 'Otros';
                                    if (!agrupados[areaNombre]) agrupados[areaNombre] = [];
                                    agrupados[areaNombre].push(srv);
                                  });

                                  const ordenAreas = ['Infantil y Adolescentes', 'Adultos', 'Otros'];
                                  return ordenAreas
                                    .filter(area => agrupados[area] && agrupados[area].length > 0)
                                    .map(areaNombre => (
                                      <optgroup key={areaNombre} label={areaNombre}>
                                        {agrupados[areaNombre].map(srv => (
                                          <option key={srv.id} value={srv.id}>{srv.nombre || 'Sin nombre'}</option>
                                        ))}
                                      </optgroup>
                                    ));
                                })()}
                              </select>
                              {!esTerapeuta && !modoSoloLectura && (
                                <button
                                  onClick={() => eliminarServicio(index)}
                                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <p className="text-sm text-gray-500">Haga clic en "Agregar" para agregar servicios</p>
                        </div>
                      )}
                    </div>

                    {/* Duración */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Duración <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formularioCita.duracion}
                        onChange={(e) => onFormularioChange('duracion', e.target.value)}
                        disabled={esTerapeuta || modoSoloLectura}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] disabled:opacity-60"
                      >
                        <option value="">Seleccionar duración...</option>
                        {duraciones.map((duracion) => (
                          <option key={duracion.valor} value={duracion.valor}>{duracion.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Fecha y Hora */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          {modoEdicion ? 'Fecha y Hora' : 'Fechas y Horas'} <span className="text-red-500">*</span>
                        </label>
                        {!esTerapeuta && !modoEdicion && !modoSoloLectura && (
                          <button
                            onClick={() => onFormularioChange('agregarFechaHora', null)}
                            className="flex items-center gap-1 text-sm font-medium text-[#7B1FA2] hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            Agregar
                          </button>
                        )}
                      </div>

                      {modoEdicion ? (
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="date"
                            value={formularioCita.fechasHoras?.[0]?.fecha || ''}
                            onChange={(e) => {
                              if (modoSoloLectura) return;
                              const fecha = new Date(e.target.value + 'T00:00:00');
                              const diaSemana = fecha.getDay();
                              if (diaSemana >= 1 && diaSemana <= 6) {
                                onFormularioChange('actualizarFechaHora', { index: 0, campo: 'fecha', valor: e.target.value });
                              } else {
                                alert('Solo se pueden agendar citas de lunes a sábado');
                              }
                            }}
                            disabled={esTerapeuta || modoSoloLectura}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all disabled:opacity-50"
                          />
                          <select
                            value={formularioCita.fechasHoras?.[0]?.horaInicio || ''}
                            onChange={(e) => {
                              if (modoSoloLectura) return;
                              onFormularioChange('actualizarFechaHora', { index: 0, campo: 'horaInicio', valor: e.target.value });
                            }}
                            disabled={esTerapeuta || modoSoloLectura || !formularioCita.fechasHoras?.[0]?.fecha}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50"
                          >
                            <option value="">
                              {!formularioCita.fechasHoras?.[0]?.fecha ? 'Seleccione una fecha primero' : 'Seleccionar hora...'}
                            </option>
                            {formularioCita.fechasHoras?.[0]?.fecha &&
                              generarHorasPorFecha(formularioCita.fechasHoras[0].fecha, formularioCita.duracion ? parseInt(formularioCita.duracion) : 40).map(hora => (
                                <option key={hora} value={hora}>{hora}</option>
                              ))
                            }
                          </select>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {formularioCita.fechasHoras && formularioCita.fechasHoras.length > 0 ? (
                            formularioCita.fechasHoras.map((fechaHora, index) => (
                              <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative">
                                {!esTerapeuta && !modoSoloLectura && formularioCita.fechasHoras.length > 1 && (
                                  <button
                                    onClick={() => onFormularioChange('eliminarFechaHora', index)}
                                    className="absolute top-2 right-2 text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="date"
                                    value={fechaHora.fecha}
                                    onChange={(e) => {
                                      if (modoSoloLectura) return;
                                      const fecha = new Date(e.target.value + 'T00:00:00');
                                      const diaSemana = fecha.getDay();
                                      if (diaSemana >= 1 && diaSemana <= 6) {
                                        onFormularioChange('actualizarFechaHora', { index, campo: 'fecha', valor: e.target.value });
                                      } else {
                                        alert('Solo se pueden agendar citas de lunes a sábado');
                                      }
                                    }}
                                    disabled={esTerapeuta || modoSoloLectura}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all disabled:opacity-50"
                                  />
                                  <select
                                    value={fechaHora.horaInicio || ''}
                                    onChange={(e) => {
                                      if (modoSoloLectura) return;
                                      onFormularioChange('actualizarFechaHora', { index, campo: 'horaInicio', valor: e.target.value });
                                    }}
                                    disabled={esTerapeuta || modoSoloLectura || !fechaHora.fecha}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50"
                                  >
                                    <option value="">
                                      {!fechaHora.fecha ? 'Seleccione una fecha primero' : 'Seleccionar hora...'}
                                    </option>
                                    {fechaHora.fecha &&
                                      generarHorasPorFecha(fechaHora.fecha, formularioCita.duracion ? parseInt(formularioCita.duracion) : 40).map(hora => (
                                        <option key={hora} value={hora}>{hora}</option>
                                      ))
                                    }
                                  </select>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <p className="text-sm text-gray-500">Haga clic en "Agregar" para agregar fechas y horas</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Nota */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nota (Opcional)</label>
                      <textarea
                        value={formularioCita.nota || ''}
                        onChange={(e) => onFormularioChange('nota', e.target.value)}
                        disabled={esTerapeuta || modoSoloLectura}
                        rows={2}
                        placeholder="Observaciones adicionales..."
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] resize-none disabled:opacity-60"
                      />
                    </div>
                  </>
                )}

                {tipoCita === 'VISITA_ESCOLAR' && (
                  <div className="space-y-4">
                    {/* Terapeuta que realizará la visita */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Terapeuta <span className="text-red-500">*</span>
                      </label>
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-purple-600" />
                          <p className="text-sm font-semibold text-gray-900">
                            {terapeutaSeleccionado?.nombres} {terapeutaSeleccionado?.apellidos}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Datos de la Visita Escolar */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-white" />
                        </div>
                        Datos de la Visita Escolar
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Colegio <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={encargadoVisita.institucion}
                            onChange={(e) => {
                              if (modoSoloLectura) return;
                              setEncargadoVisita({...encargadoVisita, institucion: e.target.value});
                            }}
                            disabled={esTerapeuta || modoSoloLectura}
                            placeholder="Ej: Colegio San Juan"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900
                            focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                            transition-all disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Encargado <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={encargadoVisita.nombre_completo}
                            onChange={(e) => {
                              if (modoSoloLectura) return;
                              setEncargadoVisita({...encargadoVisita, nombre_completo: e.target.value});
                            }}
                            disabled={esTerapeuta || modoSoloLectura}
                            placeholder="Ej: María García (Directora)"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900
                            focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                            transition-all disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Teléfono <span className="text-red-500">*</span></label>
                          <input
                            type="tel"
                            value={encargadoVisita.telefono}
                            onChange={(e) => {
                              if (modoSoloLectura) return;
                              setEncargadoVisita({...encargadoVisita, telefono: e.target.value});
                            }}
                            disabled={esTerapeuta || modoSoloLectura}
                            placeholder="987654321"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900
                            focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                            transition-all disabled:opacity-60"
                          />
                        </div>
                        <div className="pt-2 border-t border-indigo-200">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={documentoFirmado}
                              onChange={(e) => {
                                if (modoSoloLectura) return;
                                setDocumentoFirmado(e.target.checked);
                              }}
                              disabled={esTerapeuta || modoSoloLectura}
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-60 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-gray-700">Autorización de visita firmada</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Servicio */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Servicio (Opcional)</label>
                      <select
                        value={formularioCita.servicio_id || ''}
                        onChange={(e) => onFormularioChange('servicio_id', e.target.value)}
                        disabled={esTerapeuta || modoSoloLectura}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] disabled:opacity-60"
                      >
                        <option value="">Seleccionar...</option>
                        {(() => {
                          const lista = (serviciosApi && serviciosApi.length ? serviciosApi : (servicios || []));
                          if (!Array.isArray(lista) || lista.length === 0) {
                            return <option disabled>No hay servicios</option>;
                          }

                          const areasMap = { 1: 'Infantil y Adolescentes', 2: 'Adultos' };
                          const agrupados = {};
                          lista.forEach(srv => {
                            const areaId = srv.area_id || srv.area?.id;
                            const areaNombre = areasMap[areaId] || 'Otros';
                            if (!agrupados[areaNombre]) agrupados[areaNombre] = [];
                            agrupados[areaNombre].push(srv);
                          });

                          const ordenAreas = ['Infantil y Adolescentes', 'Adultos', 'Otros'];
                          return ordenAreas
                            .filter(area => agrupados[area] && agrupados[area].length > 0)
                            .map(areaNombre => (
                              <optgroup key={areaNombre} label={areaNombre}>
                                {agrupados[areaNombre].map(srv => (
                                  <option key={srv.id} value={srv.id}>{srv.nombre || 'Sin nombre'}</option>
                                ))}
                              </optgroup>
                            ));
                        })()}
                      </select>
                    </div>

                    {/* Duración */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Duración <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formularioCita.duracion}
                        onChange={(e) => onFormularioChange('duracion', e.target.value)}
                        disabled={esTerapeuta || modoSoloLectura}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50"
                      >
                        <option value="">Seleccionar duración...</option>
                        {duraciones.map((duracion) => (
                          <option key={duracion.valor} value={duracion.valor}>
                            {duracion.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Fechas y Horas */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          {modoEdicion ? 'Fecha y Hora' : 'Fechas y Horas'} <span className="text-red-500">*</span>
                        </label>
                        {!esTerapeuta && !modoEdicion && !modoSoloLectura && (
                          <button
                            onClick={() => onFormularioChange('agregarFechaHora', null)}
                            className="flex items-center gap-1 text-sm font-medium text-[#7B1FA2] hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            Agregar
                          </button>
                        )}
                      </div>

                      {modoEdicion ? (
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="date"
                            value={formularioCita.fechasHoras?.[0]?.fecha || ''}
                            onChange={(e) => {
                              if (modoSoloLectura) return;
                              const fecha = new Date(e.target.value + 'T00:00:00');
                              const diaSemana = fecha.getDay();
                              if (diaSemana >= 1 && diaSemana <= 6) {
                                onFormularioChange('actualizarFechaHora', { index: 0, campo: 'fecha', valor: e.target.value });
                              } else {
                                alert('Solo se pueden agendar citas de lunes a sábado');
                              }
                            }}
                            disabled={esTerapeuta || modoSoloLectura}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all disabled:opacity-50"
                          />
                          <select
                            value={formularioCita.fechasHoras?.[0]?.horaInicio || ''}
                            onChange={(e) => {
                              if (modoSoloLectura) return;
                              onFormularioChange('actualizarFechaHora', { index: 0, campo: 'horaInicio', valor: e.target.value });
                            }}
                            disabled={esTerapeuta || modoSoloLectura || !formularioCita.fechasHoras?.[0]?.fecha}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50"
                          >
                            <option value="">
                              {!formularioCita.fechasHoras?.[0]?.fecha ? 'Seleccione una fecha primero' : 'Seleccionar hora...'}
                            </option>
                            {formularioCita.fechasHoras?.[0]?.fecha &&
                              generarHorasPorFecha(formularioCita.fechasHoras[0].fecha, formularioCita.duracion ? parseInt(formularioCita.duracion) : 40).map(hora => (
                                <option key={hora} value={hora}>{hora}</option>
                              ))
                            }
                          </select>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {formularioCita.fechasHoras && formularioCita.fechasHoras.length > 0 ? (
                            formularioCita.fechasHoras.map((fechaHora, index) => (
                              <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative">
                                {!esTerapeuta && !modoSoloLectura && formularioCita.fechasHoras.length > 1 && (
                                  <button
                                    onClick={() => onFormularioChange('eliminarFechaHora', index)}
                                    className="absolute top-2 right-2 text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="date"
                                    value={fechaHora.fecha}
                                    onChange={(e) => {
                                      if (modoSoloLectura) return;
                                      const fecha = new Date(e.target.value + 'T00:00:00');
                                      const diaSemana = fecha.getDay();
                                      if (diaSemana >= 1 && diaSemana <= 6) {
                                        onFormularioChange('actualizarFechaHora', { index, campo: 'fecha', valor: e.target.value });
                                      } else {
                                        alert('Solo se pueden agendar citas de lunes a sábado');
                                      }
                                    }}
                                    disabled={esTerapeuta || modoSoloLectura}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all disabled:opacity-50"
                                  />
                                  <select
                                    value={fechaHora.horaInicio || ''}
                                    onChange={(e) => {
                                      if (modoSoloLectura) return;
                                      onFormularioChange('actualizarFechaHora', { index, campo: 'horaInicio', valor: e.target.value });
                                    }}
                                    disabled={esTerapeuta || modoSoloLectura || !fechaHora.fecha}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50"
                                  >
                                    <option value="">
                                      {!fechaHora.fecha ? 'Seleccione una fecha primero' : 'Seleccionar hora...'}
                                    </option>
                                    {fechaHora.fecha &&
                                      generarHorasPorFecha(fechaHora.fecha, formularioCita.duracion ? parseInt(formularioCita.duracion) : 40).map(hora => (
                                        <option key={hora} value={hora}>{hora}</option>
                                      ))
                                    }
                                  </select>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <p className="text-sm text-gray-500">Haga clic en "Agregar" para agregar fechas y horas</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Nota */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nota (Opcional)</label>
                      <textarea
                        value={formularioCita.nota || ''}
                        onChange={(e) => onFormularioChange('nota', e.target.value)}
                        disabled={esTerapeuta || modoSoloLectura}
                        rows={2}
                        placeholder="Observaciones adicionales..."
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] resize-none disabled:opacity-60"
                      />
                    </div>
                  </div>
                )}

                {/* ✅ MOTIVO DE MODIFICACIÓN - UN SOLO CAMPO PARA TODOS LOS TIPOS */}
                {modoEdicion && !esTerapeuta && !modoSoloLectura && (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Motivo de Modificación <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={motivoAccion}
                      onChange={handleMotivoChange}
                      rows={3}
                      placeholder="Explique detalladamente el motivo de la modificación..."
                      className="w-full px-3 py-2 bg-white border border-yellow-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                      autoComplete="off"
                    />
                    <p className="text-xs text-yellow-700 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Este campo es obligatorio para modificar una cita
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab Historial */}
            {modoEdicion && puedeVerHistorial && tabValue === 1 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Historial de Cambios</h3>
                {loadingHistorial ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin"></div>
                  </div>
                ) : errorHistorial ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700">{errorHistorial}</p>
                  </div>
                ) : historial.length === 0 ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <p className="text-sm text-blue-700">No hay historial disponible.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historial.map((item) => (
                      <div key={item.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getColorOperacion(item.tipo_operacion)}`}>
                              {getIconoOperacion(item.tipo_operacion)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getColorOperacion(item.tipo_operacion)}`}>
                                  {item.tipo_operacion}
                                </span>
                                <span className="text-xs font-semibold text-gray-700">{formatearFechaHistorial(item.fecha_registro)}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-900">{item.descripcion_cambios}</p>
                            </div>
                          </div>
                        </div>

                        {/* Body - Datos de la cita */}
                        <div className="p-4 space-y-3">
                          {/* Usuario que hizo el cambio */}
                          {item.usuario && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-purple-700" />
                                <span className="text-xs font-semibold text-purple-900">
                                  Realizado por: {item.usuario.nombre}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Información del paciente */}
                          {item.paciente && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-1">Paciente:</p>
                                <p className="text-sm font-medium text-gray-900">{item.paciente.nombre_completo}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-1">Documento:</p>
                                <p className="text-sm font-medium text-gray-900">{item.paciente.numero_documento}</p>
                              </div>
                            </div>
                          )}

                          {/* Motivo y Estado */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-1">Motivo:</p>
                              <p className="text-sm text-gray-900">{item.motivo}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-1">Estado:</p>
                              <p className="text-sm text-gray-900">{item.estado}</p>
                            </div>
                          </div>

                          {/* Fecha y Hora */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-1">Fecha:</p>
                              <p className="text-sm text-gray-900">{item.fecha}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-1">Hora:</p>
                              <p className="text-sm text-gray-900">{item.hora_inicio} - {item.hora_fin || 'N/A'}</p>
                            </div>
                          </div>

                          {/* Duración */}
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">Duración:</p>
                            <p className="text-sm text-gray-900">{item.duracion_minutos} minutos</p>
                          </div>

                          {/* CITA NORMAL: Terapeuta y Servicio */}
                          {item.tipo_cita === 'NORMAL' && (
                            <>
                              {item.terapeuta && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-600 mb-1">Terapeuta:</p>
                                  <p className="text-sm text-gray-900">{item.terapeuta.nombre}</p>
                                </div>
                              )}
                              {item.servicio && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-600 mb-1">Servicio:</p>
                                  <p className="text-sm text-gray-900">{item.servicio.nombre}</p>
                                </div>
                              )}
                            </>
                          )}

                          {/* REUNIÓN CLÍNICA: Terapeutas y Servicios */}
                          {item.tipo_cita === 'REUNION_CLINICA' && (
                            <>
                              {item.terapeutas && item.terapeutas.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-600 mb-2">Terapeutas:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {item.terapeutas.map((t, idx) => (
                                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                        {t.nombre}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {item.servicios && item.servicios.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-600 mb-2">Servicios:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {item.servicios.map((s, idx) => (
                                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                        {s.nombre}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {/* VISITA ESCOLAR: Terapeuta + Datos del encargado */}
                          {item.tipo_cita === 'VISITA_ESCOLAR' && (
                            <>
                              {item.terapeuta && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-600 mb-1">Terapeuta:</p>
                                  <p className="text-sm text-gray-900">{item.terapeuta.nombre}</p>
                                </div>
                              )}
                              {item.servicio && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-600 mb-1">Servicio:</p>
                                  <p className="text-sm text-gray-900">{item.servicio.nombre}</p>
                                </div>
                              )}
                              {item.visita_escolar && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
                                  <p className="text-xs font-bold text-orange-900 mb-2">Datos de Visita Escolar:</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <p className="text-xs font-semibold text-orange-700">Institución:</p>
                                      <p className="text-sm text-gray-900">{item.visita_escolar.nombre_colegio}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-orange-700">Encargado:</p>
                                      <p className="text-sm text-gray-900">{item.visita_escolar.nombre_intermediario}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-orange-700">Teléfono:</p>
                                      <p className="text-sm text-gray-900">{item.visita_escolar.telefono || 'N/A'}</p>
                                    </div>
                                  </div>
                                  {item.visita_escolar.observaciones && (
                                    <div className="mt-2">
                                      <p className="text-xs font-semibold text-orange-700 mb-1">Observaciones:</p>
                                      <p className="text-sm text-gray-900">{item.visita_escolar.observaciones}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}

                          {/* Nota */}
                          {item.nota && (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-1">Nota:</p>
                              <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-2">{item.nota}</p>
                            </div>
                          )}

                          {/* Motivo de Modificación/Eliminación */}
                          {item.motivo_accion && (item.tipo_operacion === 'UPDATE' || item.tipo_operacion === 'DELETE') && (
                            <div className={`rounded-lg p-3 border ${
                              item.tipo_operacion === 'DELETE'
                                ? 'bg-red-50 border-red-200'
                                : 'bg-yellow-50 border-yellow-200'
                            }`}>
                              <div className="flex items-start gap-2">
                                <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                  item.tipo_operacion === 'DELETE'
                                    ? 'text-red-600'
                                    : 'text-yellow-600'
                                }`} />
                                <div className="flex-1">
                                  <p className={`text-xs font-bold mb-1 ${
                                    item.tipo_operacion === 'DELETE'
                                      ? 'text-red-900'
                                      : 'text-yellow-900'
                                  }`}>
                                    {item.tipo_operacion === 'DELETE' ? 'Motivo de Eliminación:' : 'Motivo de Modificación:'}
                                  </p>
                                  <p className="text-sm text-gray-900 leading-relaxed">{item.motivo_accion}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          {/* TAB DE ASISTENCIA - ✅ SIEMPRE DISPONIBLE, INCLUSO FUERA DEL PERÍMETRO */}
          {modoEdicion && puedeVerHistorial && tabValue === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Control de Asistencia</h3>
                {cargandoAsistencia && (
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin"></div>
                )}
              </div>

              {/* RECEPCIONISTA - Marcar llegada */}
              {esRecepcionista && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Recepción</h4>
                      <p className="text-xs text-gray-600">¿El paciente llegó a su cita?</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* ✅ BOTONES SIEMPRE HABILITADOS PARA ASISTENCIA */}
                    <button
                      onClick={() => handleRecepcionMarcar(7)}
                      disabled={guardandoAsistencia || seguimientoAsistencia?.recepcion_marco}
                      className="py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✓ Asistió
                    </button>

                    <button
                      onClick={() => handleRecepcionMarcar(6)}
                      disabled={guardandoAsistencia || seguimientoAsistencia?.recepcion_marco}
                      className="py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ◆ Sesión Dictada
                    </button>
                  </div>

                  {seguimientoAsistencia?.recepcion_marco === 1 && (
                    <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded-lg text-center">
                      <p className="text-xs text-green-800 font-bold">Ya registrado</p>
                    </div>
                  )}

                  {guardandoAsistencia && (
                    <div className="mt-3 text-center text-sm text-gray-600 flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      Guardando...
                    </div>
                  )}
                </div>
              )}

              {/* TERAPEUTA - Marcar sesión */}
              {esTerapeuta && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Terapeuta</h4>
                      <p className="text-xs text-gray-600">Registrar resultado de la sesión</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* ✅ BOTONES SIEMPRE HABILITADOS PARA ASISTENCIA */}
                    <button
                      onClick={() => handleTerapeutaMarcar(7)}
                      disabled={guardandoAsistencia || seguimientoAsistencia?.terapeuta_marco}
                      className="py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✓ Asistió
                    </button>

                    <button
                      onClick={() => handleTerapeutaMarcar(6)}
                      disabled={guardandoAsistencia || seguimientoAsistencia?.terapeuta_marco}
                      className="py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ◆ Sesión Dictada
                    </button>
                  </div>

                  {seguimientoAsistencia?.terapeuta_marco === 1 && (
                    <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded-lg text-center">
                      <p className="text-xs text-green-800 font-bold">Ya registrado</p>
                    </div>
                  )}

                  {guardandoAsistencia && (
                    <div className="mt-3 text-center text-sm text-gray-600 flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      Guardando...
                    </div>
                  )}
                </div>
              )}

              {/* RESUMEN DE REGISTROS */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Registros</h4>

                <div className="space-y-2">
                  {/* REGISTRO RECEPCIÓN - Solo lo ven: ADMINISTRADOR y RECEPCIONISTA */}
                  {(currentUser?.rol?.id === ROLES.ADMINISTRADOR || esRecepcionista) && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Recepción</span>
                      </div>

                      {seguimientoAsistencia?.recepcion_marco === 1 ? (
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded font-bold ${
                            seguimientoAsistencia.recepcion_estado_id === 7
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {seguimientoAsistencia.recepcion_estado_id === 7 ? '✓ Asistió' : '◆ Sesión Dictada'}
                          </span>
                          {seguimientoAsistencia?.recepcion_fecha && (
                            <span className="text-xs text-gray-500">
                              {new Date(seguimientoAsistencia.recepcion_fecha).toLocaleString('es-PE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }).replace(',', '')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-bold">
                          Pendiente
                        </span>
                      )}
                    </div>
                  )}

                  {/* REGISTRO TERAPEUTA - Solo lo ven: ADMINISTRADOR y TERAPEUTA */}
                  {(currentUser?.rol?.id === ROLES.ADMINISTRADOR || esTerapeuta) && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Terapeuta</span>
                      </div>

                      {seguimientoAsistencia?.terapeuta_marco === 1 ? (
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded font-bold ${
                            seguimientoAsistencia.terapeuta_estado_id === 7
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {seguimientoAsistencia.terapeuta_estado_id === 7 ? '✓ Asistió' : '◆ Sesión Dictada'}
                          </span>
                          {seguimientoAsistencia?.terapeuta_fecha && (
                            <span className="text-xs text-gray-500">
                              {new Date(seguimientoAsistencia.terapeuta_fecha).toLocaleString('es-PE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }).replace(',', '')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-bold">
                          Pendiente
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* ALERTA DE DISCREPANCIA - Solo la ve ADMINISTRADOR */}
                {currentUser?.rol?.id === ROLES.ADMINISTRADOR &&
                seguimientoAsistencia?.recepcion_marco === 1 && 
                seguimientoAsistencia?.terapeuta_marco === 1 &&
                !((seguimientoAsistencia.recepcion_estado_id === 7 && seguimientoAsistencia.terapeuta_estado_id === 7) ||
                  (seguimientoAsistencia.recepcion_estado_id === 6 && seguimientoAsistencia.terapeuta_estado_id === 6)) && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <p className="text-xs text-red-800 font-medium">
                      ⚠️ Discrepancia detectada entre Recepción y Terapeuta
                    </p>
                  </div>
                )}

                {/* MENSAJE DE ÉXITO - Solo lo ve ADMINISTRADOR */}
                {currentUser?.rol?.id === ROLES.ADMINISTRADOR &&
                seguimientoAsistencia?.recepcion_marco === 1 && 
                seguimientoAsistencia?.terapeuta_marco === 1 &&
                seguimientoAsistencia.recepcion_estado_id === 7 && 
                seguimientoAsistencia.terapeuta_estado_id === 7 && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p className="text-xs text-green-800 font-medium">
                      Asistencia validada correctamente por ambas partes
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

            {/* TAB DE RECORDATORIO */}
            {modoEdicion && puedeVerHistorial && tabValue === 3 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Mensaje de Recordatorio</h3>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#7B1FA2]" />
                    <span className="text-sm font-medium text-gray-600">Para enviar por WhatsApp</span>
                  </div>
                </div>

                {/* Información de la cita */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Resumen de la Cita</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Paciente:</p>
                      <p className="text-sm font-medium text-gray-900">
                        {citaEditando?.paciente ?
                          `${citaEditando.paciente.nombres || ''} ${citaEditando.paciente.apellido_paterno || ''} ${citaEditando.paciente.apellido_materno || ''}`.trim()
                          : 'No especificado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Fecha:</p>
                      <p className="text-sm font-medium text-gray-900">
                        {citaEditando?.fecha ? (() => {
                          const [year, month, day] = citaEditando.fecha.split('-').map(Number);
                          const fechaLocal = new Date(year, month - 1, day);
                          return fechaLocal.toLocaleDateString('es-ES', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          });
                        })() : 'No especificada'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Hora:</p>
                      <p className="text-sm font-medium text-gray-900">
                        {citaEditando?.hora_inicio ? (() => {
                          const [hours, minutes] = citaEditando.hora_inicio.split(':').map(Number);
                          const ampm = hours >= 12 ? 'pm' : 'am';
                          const horasFormateadas = hours % 12 || 12;
                          return `${horasFormateadas}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                        })() : 'No especificada'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Tipo:</p>
                      <p className="text-sm font-medium text-gray-900">
                        {citaEditando?.tipo_cita === 'NORMAL' ? 'Cita Normal' :
                         citaEditando?.tipo_cita === 'REUNION_CLINICA' ? 'Reunión Clínica' :
                         citaEditando?.tipo_cita === 'VISITA_ESCOLAR' ? 'Visita Escolar' : 'No especificado'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botón para generar mensaje */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Generar Mensaje de Recordatorio</h4>
                    <p className="text-sm text-gray-600 mb-4 max-w-md">
                      Genera un mensaje personalizado con los datos de la cita para enviar por WhatsApp al paciente
                    </p>
                    <button
                      onClick={generarMensajeRecordatorio}
                      disabled={modoSoloLectura}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Generar Mensaje
                    </button>
                  </div>
                </div>

                {/* Área del mensaje generado */}
                {mensajeRecordatorio && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900">Mensaje Generado</h4>
                      <button
                        onClick={copiarAlPortapapeles}
                        disabled={modoSoloLectura}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-lg font-bold text-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {copiado ? (
                          <>
                            <Check className="w-4 h-4" />
                            ¡Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copiar Mensaje
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-300">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                          {mensajeRecordatorio}
                        </pre>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MessageCircle className="w-4 h-4" />
                          <span>Listo para copiar y pegar en WhatsApp</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {mensajeRecordatorio.length} caracteres
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-yellow-900 mb-1">Instrucciones:</p>
                          <ul className="text-xs text-yellow-800 space-y-1">
                            <li>1. Haz clic en "Copiar Mensaje" para copiar el texto al portapapeles</li>
                            <li>2. Abre WhatsApp y selecciona el contacto del paciente</li>
                            <li>3. Pega el mensaje (Ctrl+V o Cmd+V) en el chat</li>
                            <li>4. Revisa que toda la información sea correcta antes de enviar</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!mensajeRecordatorio && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-8 text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Mensaje no generado</h4>
                    <p className="text-sm text-gray-600 max-w-md mx-auto">
                      Haz clic en "Generar Mensaje" para crear un mensaje de recordatorio personalizado con los datos de la cita actual.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
            {!modoSoloLectura && modoEdicion && puedeEliminar ? (
              <button
                onClick={abrirDialogoEliminar}
                disabled={modoSoloLectura}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex gap-2">
              {esTerapeuta || modoSoloLectura ? (
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-semibold text-sm hover:shadow-md transition-all"
                >
                  Cerrar
                </button>
              ) : (
                <>
                  <button
                    onClick={onClose}
                    disabled={guardando}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardar}
                    disabled={guardando || modoSoloLectura}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-semibold text-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {guardando ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {modoEdicion ? 'Actualizar' : 'Guardar'}
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Confirmar Eliminación */}
      {dialogoEliminarAbierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
            <div className="bg-red-50 border-b border-red-200 px-5 py-4 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
              </div>
            </div>

            <div className="p-5">
              <p className="text-sm text-gray-700 mb-4">¿Está seguro que desea eliminar esta cita? Esta acción no se puede deshacer.</p>
              {citaEditando && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Paciente:</span> {formularioCita.paciente?.nombre_completo || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">Fecha:</span> {formularioCita.fechasHoras?.[0]?.fecha} - {formularioCita.fechasHoras?.[0]?.horaInicio}
                  </p>
                </div>
              )}

              {/* MOTIVO DE ELIMINACIÓN (obligatorio) */}
              <div className="bg-red-50 border border-red-300 rounded-xl p-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Motivo de Eliminación <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={motivoEliminacion}
                  onChange={(e) => setMotivoEliminacion(e.target.value)}
                  rows={3}
                  placeholder="Explique detalladamente el motivo de la eliminación..."
                  className="w-full px-3 py-2 bg-white border border-red-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
                <p className="text-xs text-red-700 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Este campo es obligatorio para eliminar una cita
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 px-5 py-3.5 flex justify-end gap-2 bg-gray-50 rounded-b-2xl">
              <button
                onClick={cerrarDialogoEliminar}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Alerta */}
      {alertaAbierta && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200 px-5 py-4 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Campo Requerido</h3>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-700 leading-relaxed">{mensajeAlerta}</p>
            </div>

            <div className="border-t border-gray-200 px-5 py-4 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setAlertaAbierta(false)}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Memorizar el componente para evitar re-renders innecesarios
export default React.memo(ModalAgendarCita);