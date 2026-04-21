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
  Check,
  Package
} from 'lucide-react';
import { useBusquedaPacientes } from '../../hooks/useBusquedaPacientes';
import { useServicios } from '../../hooks/useServicios';
import { useMotivosCita } from '../../hooks/useMotivosCita';
import { useHistorialCita } from '../../hooks/useHistorialCita';
import { useTrabajadores } from '../../hooks/useTrabajadores';
import { ROLES } from '../../constants/roles';
import api from '../../services/api';
import { useGeofencing } from '../../hooks/useGeofencing';
import { esFeriado, getNombreFeriado } from '../../constants/feriados';
import { getVentasDisponibles, getListadoCitasPorPaciente, getInfoVentaDeCita } from '../../services/citaService';
import { getVentaServicioById } from '../../services/ventasService';
import { DetalleVentaModal } from '../../pages/Ventas/HistorialVentasTab';

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
  citas = [],
  bloqueos = []
}) => {
  const [queryPaciente, setQueryPaciente] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [dialogoEliminarAbierto, setDialogoEliminarAbierto] = useState(false);
  const [motivoEliminacion, setMotivoEliminacion] = useState('');
  const [modalYaAbierto, setModalYaAbierto] = useState(false);

  const [alertaAbierta, setAlertaAbierta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState('');
  const [tituloAlerta, setTituloAlerta] = useState('Campo Requerido');
  const [tipoAlerta, setTipoAlerta] = useState('error'); // 'error', 'warning', 'feriado'

  const motivoAccion = formularioCita.motivo_accion || '';

  // Helper para mostrar alertas
  const mostrarAlerta = (titulo, mensaje, tipo = 'error') => {
    setTituloAlerta(titulo);
    setMensajeAlerta(mensaje);
    setTipoAlerta(tipo);
    setAlertaAbierta(true);
  };

  const [tipoCita, setTipoCita] = useState(null);
  const [terapeutasReunion, setTerapeutasReunion] = useState([]);

  const [seguimientoAsistencia, setSeguimientoAsistencia] = useState(null);
  const [cargandoAsistencia, setCargandoAsistencia] = useState(false);
  const [guardandoAsistencia, setGuardandoAsistencia] = useState(false);

  const [mensajeRecordatorio, setMensajeRecordatorio] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [cargandoRecordatorio, setCargandoRecordatorio] = useState(false);

  // 🛒 VENTAS DISPONIBLES
  const [ventasDisponibles, setVentasDisponibles] = useState([]);
  const [cargandoVentas, setCargandoVentas] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  // 📦 PAQUETE DE LA CITA
  const [infoPaquete, setInfoPaquete] = useState(null);
  const [cargandoPaquete, setCargandoPaquete] = useState(false);
  const [ventaDetallePaquete, setVentaDetallePaquete] = useState(null);
  const [cargandoVentaDetalle, setCargandoVentaDetalle] = useState(false);

  const esRecepcionista = currentUser?.rol?.id === ROLES.ADMISION;
  const esTerapeuta = currentUser?.rol?.id === ROLES.TERAPEUTA;
  const requiereGeofencing = esTerapeuta || esRecepcionista;
  const { cargando: cargandoGeofencing, dentroDelPerimetro } = useGeofencing(requiereGeofencing, 30000);
  const modoSoloLectura = requiereGeofencing && !dentroDelPerimetro;

  // ========== ESTADOS PARA REUNIÓN CLÍNICA Y VISITA ESCOLAR ==========
  const [serviciosReunion, setServiciosReunion] = useState([]);
  const [encargadoVisita, setEncargadoVisita] = useState({
    nombre_completo: '',
    telefono: '',
    institucion: ''
  });
  const [documentoFirmado, setDocumentoFirmado] = useState(false);

  // ========== HOOKS PERSONALIZADOS ==========
  const { pacientes, loading: loadingPacientes } = useBusquedaPacientes(queryPaciente);
  const serviciosApi = useServicios();
  const { motivos, loading: loadingMotivos } = useMotivosCita();
  const { trabajadores } = useTrabajadores();
  const { historial, loading: loadingHistorial, error: errorHistorial } = useHistorialCita(
    modoEdicion && citaEditando?.id ? citaEditando.id : null
  );
  

  // ========== PERMISOS ==========
  const puedeVerHistorial = currentUser?.rol?.id === ROLES.ADMINISTRADOR ||
    currentUser?.rol?.id === ROLES.ADMISION ||
    currentUser?.rol?.id === ROLES.TERAPEUTA;
  const puedeEliminar = currentUser?.rol?.id === ROLES.ADMINISTRADOR && !modoSoloLectura;

  // 🔒 BLOQUEAR EDICIÓN PARA ADMISIONISTA SI YA HAY ASISTENCIA REGISTRADA (por cualquiera de los dos)
  const bloqueadoPorAsistencia = esRecepcionista && modoEdicion && (
    seguimientoAsistencia?.recepcion_marco == 1 ||
    seguimientoAsistencia?.terapeuta_marco == 1
  );

  const [guardandoLocal, setGuardandoLocal] = useState(false);
  // ========== RESETEAR ESTADOS AL CERRAR MODAL ==========
  useEffect(() => {
    if (!open) {
      setModalYaAbierto(false);
    }
  }, [open]);

  // ========== FUNCIONES DE ASISTENCIA ==========
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

  const handleRecepcionMarcar = async (estadoId) => {
     if (seguimientoAsistencia?.recepcion_marco && currentUser?.rol?.id !== ROLES.ADMINISTRADOR) return;
    setGuardandoAsistencia(true);
    const backupSeguimiento = seguimientoAsistencia;
    // Optimistic update: si estadoId es null = desmarcar, si no = marcar/cambiar
    setSeguimientoAsistencia(prev => prev ? {
      ...prev,
      recepcion_marco: estadoId !== null ? 1 : 0,
      recepcion_estado_id: estadoId,
      recepcion_fecha: estadoId !== null ? new Date().toISOString() : null
    } : prev);
    try {
      await api.post('/asistencia/registrar-recepcion', {
        cita_id: citaEditando.id,
        usuario_id: currentUser.id,
        estado_id: estadoId  // null = desmarcar
      });
      await cargarSeguimientoAsistencia();
    } catch (error) {
      console.error('Error al registrar:', error);
      setSeguimientoAsistencia(backupSeguimiento);
      alert(error.response?.data?.message || 'Error al registrar');
    } finally {
      setGuardandoAsistencia(false);
    }
  };

  const handleTerapeutaMarcar = async (estadoId) => {
    if (seguimientoAsistencia?.terapeuta_marco && currentUser?.rol?.id !== ROLES.ADMINISTRADOR) return;
    setGuardandoAsistencia(true);
    const backupSeguimiento = seguimientoAsistencia;
    // Optimistic update: si estadoId es null = desmarcar, si no = marcar/cambiar
    setSeguimientoAsistencia(prev => prev ? {
      ...prev,
      terapeuta_marco: estadoId !== null ? 1 : 0,
      terapeuta_estado_id: estadoId,
      terapeuta_fecha: estadoId !== null ? new Date().toISOString() : null
    } : prev);
    try {
      await api.post('/asistencia/registrar-terapeuta', {
        cita_id: citaEditando.id,
        terapeuta_id: currentUser.id,
        estado_id: estadoId  // null = desmarcar
      });
      await cargarSeguimientoAsistencia();
    } catch (error) {
      console.error('Error al registrar:', error);
      setSeguimientoAsistencia(backupSeguimiento);
      alert(error.response?.data?.message || 'Error al registrar');
    } finally {
      setGuardandoAsistencia(false);
    }
  };

  // 📦 CARGAR INFORMACIÓN DEL PAQUETE
  const cargarInfoPaquete = useCallback(async () => {
    console.log('🔍 DEBUG cargarInfoPaquete:', {
      paciente_id: citaEditando?.paciente_id,
      venta_servicio_detalle_id: citaEditando?.venta_servicio_detalle_id,
      citaEditando: citaEditando
    });

    if (!citaEditando?.paciente_id || !citaEditando?.venta_servicio_detalle_id) {
      console.log('❌ No hay paciente_id o venta_servicio_detalle_id');
      setInfoPaquete(null);
      return;
    }

    setCargandoPaquete(true);
    try {
      const listado = await getListadoCitasPorPaciente(citaEditando.paciente_id);
      console.log('📦 Listado recibido:', listado);

      // Buscar el paquete usando venta_servicio_detalle_id (campo numérico confiable)
      let paqueteEncontrado = null;
      for (const servicio of listado.servicios) {
        const paquetesArray = Array.isArray(servicio.paquetes)
          ? servicio.paquetes
          : Object.values(servicio.paquetes);

        for (const paquete of paquetesArray) {
          if (Number(paquete.venta_servicio_detalle_id) === Number(citaEditando.venta_servicio_detalle_id)) {
            paqueteEncontrado = {
              ...paquete,
              servicio_nombre: servicio.servicio_nombre,
              servicio_id: servicio.servicio_id
            };
            break;
          }
        }
        if (paqueteEncontrado) break;
      }

      // Si es un combo, recopilar citas de TODAS las líneas del combo (distintos motivos)
      if (paqueteEncontrado?.paquete_combo_id) {
        const comboId = paqueteEncontrado.paquete_combo_id;
        let citasCombo = [];
        let sesionesTotalesCombo = 0;

        for (const servicio of listado.servicios) {
          const paquetesArray = Array.isArray(servicio.paquetes)
            ? servicio.paquetes
            : Object.values(servicio.paquetes);

          for (const paquete of paquetesArray) {
            if (paquete.paquete_combo_id === comboId) {
              // Agregar motivo_nombre de contexto a cada cita de esta línea
              const citasConMotivo = paquete.citas.map(c => ({
                ...c,
                linea_servicio: servicio.servicio_nombre,
              }));
              citasCombo = [...citasCombo, ...citasConMotivo];
              sesionesTotalesCombo += (paquete.sesiones_totales || 0);
            }
          }
        }

        paqueteEncontrado = {
          ...paqueteEncontrado,
          paquete_nombre: paqueteEncontrado.paquete_combo_nombre || paqueteEncontrado.paquete_nombre,
          citas: citasCombo,
          sesiones_totales: sesionesTotalesCombo,
          es_combo: true,
        };
      }

      setInfoPaquete(paqueteEncontrado);
    } catch (error) {
      console.error('❌ Error al cargar info del paquete:', error);
      setInfoPaquete(null);
    } finally {
      setCargandoPaquete(false);
    }
  }, [citaEditando?.paciente_id, citaEditando?.venta_servicio_detalle_id]);

  const abrirDetalleVenta = async (ventaId) => {
    if (!ventaId) return;
    setCargandoVentaDetalle(true);
    try {
      const venta = await getVentaServicioById(ventaId);
      setVentaDetallePaquete(venta);
    } catch (err) {
      console.error('Error al cargar detalle de venta:', err);
    } finally {
      setCargandoVentaDetalle(false);
    }
  };

  // 🔒 Cargar seguimiento apenas se abre el modal en edición (para validar bloqueo)
  useEffect(() => {
    if (open && modoEdicion && citaEditando?.id) {
      cargarSeguimientoAsistencia();
    }
  }, [open, modoEdicion, citaEditando?.id, cargarSeguimientoAsistencia]);

  // Recargar seguimiento cuando se cambia a la pestaña de asistencia
  useEffect(() => {
    if (tabValue === 2 && modoEdicion && citaEditando?.id) {
      cargarSeguimientoAsistencia();
    }
  }, [tabValue, modoEdicion, citaEditando?.id, cargarSeguimientoAsistencia]);

  // 📦 Cargar info del paquete cuando se cambia a la pestaña de paquete
  useEffect(() => {
    if (tabValue === 4 && modoEdicion && citaEditando?.id) {
      cargarInfoPaquete();
    }
  }, [tabValue, modoEdicion, citaEditando?.id, cargarInfoPaquete]);

  // ========== HELPERS PARA FORMATEAR DATOS DE CITA ==========
  const formatearHora = (horaStr) => {
    const [hours, minutes] = horaStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'pm' : 'am';
    const h = hours % 12 || 12;
    return `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const getServicioNombre = (cita) => {
    if (cita.tipo_cita === 'NORMAL' && cita.servicio) return cita.servicio.nombre;
    if (cita.tipo_cita === 'VISITA_ESCOLAR') return 'Visita Escolar';
    if (cita.tipo_cita === 'REUNION_CLINICA') return 'Reunión Clínica';
    return 'Servicio no especificado';
  };

  const getServicioConMotivo = (cita) => {
    const servicio = getServicioNombre(cita);
    const motivo = cita.motivo?.nombre || '';

    if (motivo) {
      return `${servicio} - ${motivo}`;
    }
    return servicio;
  };

  const getTerapeutaNombre = (cita) => {
    if ((cita.tipo_cita === 'NORMAL' || cita.tipo_cita === 'VISITA_ESCOLAR') && cita.doctor) {
      return `Lic. ${cita.doctor.nombres || ''} ${cita.doctor.apellidos || ''}`.trim();
    }
    if (cita.tipo_cita === 'REUNION_CLINICA' && cita.terapeutas?.length > 0) {
      return 'Equipo de Terapeutas';
    }
    return 'Terapeuta no especificado';
  };

  // ========== FUNCIÓN AUXILIAR PARA OBTENER SALUDO SEGÚN HORA ==========
  const obtenerSaludo = () => {
    const ahora = new Date();
    const hora = ahora.getHours();

    if (hora >= 0 && hora < 12) {
      return 'Buenos días';
    } else if (hora >= 12 && hora < 18) {
      return 'Buenas tardes';
    } else {
      return 'Buenas noches';
    }
  };

  // ========== FUNCIÓN PARA GENERAR RECORDATORIO ==========
  const generarMensajeRecordatorio = useCallback(async () => {
    if (modoSoloLectura) return;

    if (modoEdicion && citaEditando) {
      if (!citaEditando.fecha || !citaEditando.hora_inicio) {
        console.warn('No hay fecha u hora_inicio disponible para generar el mensaje');
        return;
      }

      setCargandoRecordatorio(true);
      try {
        const response = await api.get('/citas', {
          params: {
            fecha_desde: citaEditando.fecha,
            fecha_hasta: citaEditando.fecha,
          }
        });

        const todasCitasDelDia = Array.isArray(response.data) ? response.data : [];

        const citasMismoDia = todasCitasDelDia
          .filter(c => String(c.paciente_id) === String(citaEditando.paciente_id))
          .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

        const fechaStr = citaEditando.fecha;
        const [year, month, day] = fechaStr.split('-').map(Number);
        const fechaObj = new Date(year, month - 1, day);
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const diaSemana = diasSemana[fechaObj.getDay()];
        const dia = fechaObj.getDate();
        const mes = meses[fechaObj.getMonth()];

        const formatearNombreTitulo = (nombre) => nombre.toLowerCase().split(' ')
          .map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

        const nombrePaciente = citaEditando.paciente
          ? formatearNombreTitulo(`${citaEditando.paciente.nombres || ''} ${citaEditando.paciente.apellido_paterno || ''} ${citaEditando.paciente.apellido_materno || ''}`.trim())
          : 'Paciente';

        let tieneResponsable = false;
        if (citaEditando.paciente?.responsables && Array.isArray(citaEditando.paciente.responsables)) {
          const responsableActivo = citaEditando.paciente.responsables.find(
            r => r.activo === true || r.activo === 1 || r.activo === '1'
          );
          tieneResponsable = !!responsableActivo;
        }

        const saludo = obtenerSaludo();

        // 🎯 VERIFICAR SI ES ÚLTIMA SESIÓN DEL PAQUETE
        let mensajeUltimaSesion = '';
        try {
          if (citaEditando.venta_servicio_detalle_id) {
            const infoVenta = await getInfoVentaDeCita(citaEditando.id);
            if (infoVenta) {
              const { sesiones_restantes, sesiones_totales } = infoVenta;
              if (infoVenta.es_ultima_cita) {
                mensajeUltimaSesion = `\n\n⚠️ *Aviso importante:* Esta es la *última sesión* del paquete contratado (${infoVenta.sesiones_totales} sesiones). Le recomendamos coordinar la renovación.`;
              } else if (infoVenta.es_penultima_cita) {
                mensajeUltimaSesion = `\n\n📌 *Recordatorio:* Luego de esta cita, solo quedará *1 sesión más* del paquete.`;
              }
            }
          }
        } catch (err) {
          console.warn('No se pudo obtener info de la venta:', err);
        }

        let mensaje;
        if (citasMismoDia.length > 1) {
          let mensajeCitas = '';
          citasMismoDia.forEach((cita, index) => {
            mensajeCitas += `\n${index + 1}️⃣ *Cita ${index + 1}*
  🕓 *${formatearHora(cita.hora_inicio)}*
  💜 ${getServicioConMotivo(cita)}
  ✨ ${getTerapeutaNombre(cita)}`;
            if (index < citasMismoDia.length - 1) mensajeCitas += '\n';
          });

          if (tieneResponsable) {
            mensaje = `${saludo}, Sr(a).
  Le hacemos recordar las citas de *${nombrePaciente}* para el día
  🗓️ *${diaSemana}, ${dia} de ${mes}*
  ${mensajeCitas}${mensajeUltimaSesion}

  🥳 ¡Los esperamos! ✨`;
          } else {
            mensaje = `${saludo}, *${nombrePaciente}*
  Le hacemos recordar sus citas para el día
  🗓️ *${diaSemana}, ${dia} de ${mes}*
  ${mensajeCitas}${mensajeUltimaSesion}

  🥳 ¡Lo esperamos! ✨`;
          }
        } else {
          if (tieneResponsable) {
            mensaje = `${saludo}, Sr(a).
  Le hacemos recordar la cita de *${nombrePaciente}* para el día
  🗓️ *${diaSemana}, ${dia} de ${mes}*
  🕓 *${formatearHora(citaEditando.hora_inicio)}*
  💜 ${getServicioConMotivo(citaEditando)}
  ✨ ${getTerapeutaNombre(citaEditando)}${mensajeUltimaSesion}

  🥳 ¡Los esperamos! ✨`;
          } else {
            mensaje = `${saludo}, *${nombrePaciente}*
  Le hacemos recordar su cita para el día
  🗓️ *${diaSemana}, ${dia} de ${mes}*
  🕓 *${formatearHora(citaEditando.hora_inicio)}*
  💜 ${getServicioConMotivo(citaEditando)}
  ✨ ${getTerapeutaNombre(citaEditando)}${mensajeUltimaSesion}

  🥳 ¡Lo esperamos! ✨`;
          }
        }

        setMensajeRecordatorio(mensaje);
        setCopiado(false);
      } catch (error) {
        console.error('Error al obtener citas del día:', error);
        alert('No se pudo obtener las citas del día. Intenta de nuevo.');
      } finally {
        setCargandoRecordatorio(false);
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
      horas = horas % 12 || 12;
      const horaFormateada = `${horas}:${minutos.toString().padStart(2, '0')} ${ampm}`;

      const formatearNombreTitulo = (nombre) => nombre.toLowerCase().split(' ')
        .map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

      const nombrePaciente = formularioCita.paciente?.nombre_completo
        ? formatearNombreTitulo(formularioCita.paciente.nombre_completo)
        : 'Paciente';

      let tieneResponsable = false;
      if (formularioCita.paciente?.responsables && Array.isArray(formularioCita.paciente.responsables)) {
        const responsableActivo = formularioCita.paciente.responsables.find(
          r => r.activo === true || r.activo === 1 || r.activo === '1'
        );
        tieneResponsable = !!responsableActivo;
      }

      const saludo = obtenerSaludo();

      let servicioNombre = 'Servicio no especificado';
      if (tipoCita === 'NORMAL' && formularioCita.servicio_id) {
        const servicio = (serviciosApi?.length ? serviciosApi : (servicios || []))
          .find(s => s.id === parseInt(formularioCita.servicio_id));
        servicioNombre = servicio?.nombre || 'Servicio no especificado';
      } else if (tipoCita === 'VISITA_ESCOLAR') {
        servicioNombre = 'Visita Escolar';
      } else if (tipoCita === 'REUNION_CLINICA') {
        servicioNombre = 'Reunión Clínica';
      }

      if (formularioCita.motivo_id && motivos.length) {
        const motivoObj = motivos.find(m => m.id === parseInt(formularioCita.motivo_id));
        if (motivoObj?.nombre) servicioNombre = `${servicioNombre} - ${motivoObj.nombre}`;
      }

      let terapeutaNombre = 'Terapeuta no especificado';
      if ((tipoCita === 'NORMAL' || tipoCita === 'VISITA_ESCOLAR') && terapeutaSeleccionado) {
        terapeutaNombre = `Lic. ${terapeutaSeleccionado.nombres || ''} ${terapeutaSeleccionado.apellidos || ''}`.trim();
      } else if (tipoCita === 'REUNION_CLINICA' && terapeutasReunion.length > 0) {
        terapeutaNombre = 'Equipo de Terapeutas';
      }

      let mensaje;
      if (tieneResponsable) {
        mensaje = `${saludo}, Sr(a).
  Le hacemos recordar la cita de *${nombrePaciente}* para el día
  🗓️ *${diaSemana}, ${dia} de ${mes}*
  🕓 *${horaFormateada}*
  💜 ${servicioNombre}
  ✨ ${terapeutaNombre}

  🥳 ¡Los esperamos! ✨`;
      } else {
        mensaje = `${saludo}, *${nombrePaciente}*
  Le hacemos recordar su cita para el día
  🗓️ *${diaSemana}, ${dia} de ${mes}*
  🕓 *${horaFormateada}*
  💜 ${servicioNombre}
  ✨ ${terapeutaNombre}

  🥳 ¡Lo esperamos! ✨`;
      }

      setMensajeRecordatorio(mensaje);
      setCopiado(false);
    }
  }, [modoEdicion, citaEditando, tipoCita, formularioCita, serviciosApi, servicios, terapeutaSeleccionado, terapeutasReunion, modoSoloLectura, motivos]);

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

  // ========== VERIFICAR DISPONIBILIDAD DE HORAS ==========
  // Chequea conflicto de TERAPEUTA (disponibilidad del profesional)
  const verificarDisponibilidad = (fechaString, hora, duracionMinutos) => {
    if (!fechaString || !hora) return true;
    if (!citas || citas.length === 0) return true;
    let terapeutasIds = [];
    if (tipoCita === 'NORMAL' || tipoCita === 'VISITA_ESCOLAR') {
      const doctorId = formularioCita.doctor_id || terapeutaSeleccionado?.id;
      if (doctorId) terapeutasIds = [parseInt(doctorId)];
    } else if (tipoCita === 'REUNION_CLINICA') {
      terapeutasIds = terapeutasReunion.map(t => parseInt(t.terapeuta_id)).filter(id => id && !isNaN(id));
      if (terapeutasIds.length === 0 && formularioCita.terapeutas_ids && formularioCita.terapeutas_ids.length > 0) {
        terapeutasIds = formularioCita.terapeutas_ids.map(id => parseInt(id)).filter(id => id && !isNaN(id));
      }
      if (terapeutasIds.length === 0 && citaEditando) {
        if (citaEditando.terapeutas && citaEditando.terapeutas.length > 0) {
          terapeutasIds = citaEditando.terapeutas.map(t => parseInt(t.id_terapeuta || t.terapeuta_id || t.id)).filter(id => id && !isNaN(id));
        }
      }
      if (terapeutasIds.length === 0) return true;
    }
    if (terapeutasIds.length === 0) return true;

    const citasDelDia = citas.filter(cita => {
      if (citaEditando && cita.id === citaEditando.id) return false;
      if (cita.fecha !== fechaString) return false;
      if (cita.tipo_cita === 'NORMAL' || cita.tipo_cita === 'VISITA_ESCOLAR') {
        return terapeutasIds.includes(cita.doctor_id);
      } else if (cita.tipo_cita === 'REUNION_CLINICA') {
        const terapeutasCita = cita.terapeutas?.map(t => t.id_terapeuta || t.terapeuta_id || t.id).filter(id => id) || [];
        return terapeutasIds.some(id => terapeutasCita.includes(id));
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

  // Chequea conflicto de PACIENTE — devuelve la cita conflictiva o null
  const verificarConflictoPacienteLocal = (fechaString, hora, duracionMinutos) => {
    if (!fechaString || !hora) return null;
    if (!citas || citas.length === 0) return null;
    const pacienteId = formularioCita.paciente_id ?? citaEditando?.paciente_id;
    if (!pacienteId) return null;

    const toMin = (h) => {
      const [hh, mm] = h.split(':').map(Number);
      return hh * 60 + mm;
    };

    const nuevaInicio = toMin(hora);
    const nuevaFin = nuevaInicio + parseInt(duracionMinutos || 40);

    const citasDelPaciente = citas.filter(c => {
      if (citaEditando && c.id === citaEditando.id) return false;
      return String(c.paciente_id) === String(pacienteId) && c.fecha === fechaString;
    });

    for (const c of citasDelPaciente) {
      const cInicio = toMin(c.hora_inicio);
      const cFin = cInicio + parseInt(c.duracion_minutos || 40);
      if (
        (nuevaInicio >= cInicio && nuevaInicio < cFin) ||
        (nuevaFin > cInicio && nuevaFin <= cFin) ||
        (nuevaInicio <= cInicio && nuevaFin >= cFin)
      ) {
        return c; // devuelve la cita que genera conflicto
      }
    }
    return null;
  };

  // Verificar si una fecha/hora está bloqueada
  const verificarHoraBloqueada = (fechaString, hora) => {
    if (!fechaString || !hora || !bloqueos || bloqueos.length === 0) return false;

    const toMin = (h) => {
      const [hh, mm] = h.split(':').map(Number);
      return hh * 60 + mm;
    };

    const slotStart = toMin(hora);
    const slotEnd = slotStart + 40; // duración del slot

    const bloqueado = bloqueos.some(b => {
      // Verificar si el bloqueo está activo
      if (!b.activo) return false;

      // Verificar si la fecha está dentro del rango del bloqueo
      if (fechaString < b.fechaInicio || fechaString > b.fechaFin) return false;

      // Si es bloqueo recurrente, verificar el día de la semana
      if (b.diaSemana !== null && b.diaSemana !== undefined) {
        const fecha = new Date(fechaString + 'T00:00:00');
        const diaSlot = fecha.getDay();
        if (b.diaSemana !== diaSlot) return false;
      }

      // Si es todo el día, está bloqueado
      if (b.todoElDia) return true;

      // Verificar horario
      const bloqStart = b.horaInicio ? toMin(b.horaInicio.substring(0, 5)) : 0;
      const bloqEnd = b.horaFin ? toMin(b.horaFin.substring(0, 5)) : bloqStart + 40;

      // Verificar si hay superposición
      return slotStart < bloqEnd && slotEnd > bloqStart;
    });

    if (bloqueado) {
      console.log(`🚫 Hora bloqueada filtrada en modal: ${fechaString} ${hora}`);
    }

    return bloqueado;
  };

  // Verificar si una fecha está bloqueada todo el día
  const verificarFechaBloqueadaTodoElDia = (fechaString) => {
    if (!fechaString || !bloqueos || bloqueos.length === 0) return false;

    return bloqueos.some(b => {
      // Verificar si el bloqueo está activo
      if (!b.activo) return false;

      // Verificar si la fecha está dentro del rango del bloqueo
      if (fechaString < b.fechaInicio || fechaString > b.fechaFin) return false;

      // Si es bloqueo recurrente, verificar el día de la semana
      if (b.diaSemana !== null && b.diaSemana !== undefined) {
        const fecha = new Date(fechaString + 'T00:00:00');
        const diaSlot = fecha.getDay();
        if (b.diaSemana !== diaSlot) return false;
      }

      // Retornar true si es todo el día
      return b.todoElDia === true;
    });
  };

  const generarHorasPorFecha = (fechaString, duracion) => {
    if (!fechaString) return [];
    const fecha = new Date(fechaString + 'T00:00:00');
    const diaSemana = fecha.getDay();
    const horas = [];
    if (diaSemana === 6) {
      let minutos = 8 * 60;
      const finMinutos = 20 * 60;
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
    // Filtra horas ocupadas tanto por terapeuta como por el mismo paciente, y también las bloqueadas
    return horas.filter(hora =>
      verificarDisponibilidad(fechaString, hora, duracion) &&
      !verificarConflictoPacienteLocal(fechaString, hora, duracion) &&
      !verificarHoraBloqueada(fechaString, hora)
    );
  };

  // ========== INICIALIZAR MODAL ==========
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

  // 🛒 CARGAR VENTAS DISPONIBLES CUANDO CAMBIA PACIENTE O SERVICIO
  useEffect(() => {
    const cargarVentasDisponibles = async () => {
      // Solo cargar para citas NORMALES
      if (tipoCita !== 'NORMAL') {
        setVentasDisponibles([]);
        return;
      }

      const pacienteId = formularioCita.paciente_id;
      const servicioId = formularioCita.servicio_id;
      const motivoCitaId = formularioCita.motivo_id;

      if (!pacienteId || !servicioId || !motivoCitaId) {
        setVentasDisponibles([]);
        return;
      }

      setCargandoVentas(true);
      try {
        const ventas = await getVentasDisponibles(pacienteId, servicioId, motivoCitaId);
        setVentasDisponibles(ventas || []);

        // Si solo hay una venta disponible, seleccionarla automáticamente
        if (ventas && ventas.length === 1 && !modoEdicion) {
          onFormularioChange('venta_servicio_detalle_id', ventas[0].id);
          setVentaSeleccionada(ventas[0]); // 🛒 IMPORTANTE: Actualizar estado
        }
      } catch (error) {
        console.error('Error al cargar ventas disponibles:', error);
        setVentasDisponibles([]);
        mostrarAlerta('Error', 'No se pudieron cargar las ventas disponibles del paciente.', 'error');
      } finally {
        setCargandoVentas(false);
      }
    };

    cargarVentasDisponibles();
  }, [formularioCita.paciente_id, formularioCita.servicio_id, formularioCita.motivo_id, tipoCita, modoEdicion]);

  // 🛒 SINCRONIZAR VENTA SELECCIONADA CON EL FORMULARIO
// 🛒 SINCRONIZAR VENTA SELECCIONADA CON EL FORMULARIO
useEffect(() => {
  if (tipoCita === 'NORMAL' && formularioCita.venta_servicio_detalle_id && ventasDisponibles.length > 0) {
    const venta = ventasDisponibles.find(
      v => String(v.id) === String(formularioCita.venta_servicio_detalle_id)
    );
    if (venta) {
      setVentaSeleccionada(venta);
    }
  } else if (tipoCita !== 'NORMAL') {
    setVentaSeleccionada(null);
  }
}, [formularioCita.venta_servicio_detalle_id, ventasDisponibles, tipoCita]);
  // ========== FUNCIONES PARA REUNIÓN CLÍNICA ==========
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

  const handleMotivoChange = useCallback((e) => {
    if (modoSoloLectura) return;
    onFormularioChange('motivo_accion', e.target.value);
  }, [onFormularioChange, modoSoloLectura]);

  // 🛒 CALCULAR SESIONES DISPONIBLES DE LA VENTA SELECCIONADA
  const sesionesDisponiblesVenta = ventaSeleccionada?.sesiones_disponibles || 0;
  const slotsActuales = formularioCita.fechasHoras?.length || 0;
  // Para citas NORMALES: solo permitir si hay venta Y tiene sesiones disponibles
  // Para otros tipos: siempre permitir
  const puedeAgregarMasSlots = tipoCita === 'NORMAL'
    ? (ventaSeleccionada && slotsActuales < sesionesDisponiblesVenta)
    : true;

  // ========== 🚀 FUNCIONES MEJORADAS PARA FECHAS Y HORAS ==========
  const agregarFechaHora = () => {
    if (modoSoloLectura) return;

    // 🛒 VALIDAR QUE EXISTA VENTA PARA CITAS NORMALES
    if (tipoCita === 'NORMAL' && !ventaSeleccionada) {
      mostrarAlerta(
        'Compra Requerida',
        'Primero selecciona una compra de sesiones antes de agregar fechas/horas.',
        'error'
      );
      return;
    }

    // 🛒 VALIDAR LÍMITE DE SESIONES PARA CITAS NORMALES
    if (tipoCita === 'NORMAL' && ventaSeleccionada && !puedeAgregarMasSlots) {
      console.log('🛒 DEBUG: Bloqueando agregar slot', {
        ventaSeleccionada,
        sesionesDisponiblesVenta,
        slotsActuales,
        puedeAgregarMasSlots
      });
      mostrarAlerta(
        'Límite de Sesiones Alcanzado',
        `Esta compra solo tiene ${sesionesDisponiblesVenta} sesión(es) disponible(s). Ya tienes ${slotsActuales} slot(s) agregado(s).`,
        'warning'
      );
      return;
    }

    console.log('🛒 DEBUG: Permitiendo agregar slot', {
      tipoCita,
      ventaSeleccionada: ventaSeleccionada?.descripcion,
      sesionesDisponiblesVenta,
      slotsActuales,
      puedeAgregarMasSlots
    });

    onFormularioChange('agregarFechaHora', null);
  };

  const eliminarFechaHora = (index) => {
    if (modoSoloLectura) return;
    const slotsActuales = formularioCita.fechasHoras || [];
    if (slotsActuales.length <= 1) {
      setMensajeAlerta('Debe haber al menos una fecha y hora programada.');
      setAlertaAbierta(true);
      return;
    }
    onFormularioChange('eliminarFechaHora', index);
  };

const handleGuardar = useCallback(async () => {
  if (modoSoloLectura) return;
  if (guardandoLocal) return;
  setGuardandoLocal(true);

  if (modoEdicion && !esTerapeuta) {
    if (!motivoAccion || motivoAccion.trim() === '') {
      setMensajeAlerta('El motivo de modificación es obligatorio para actualizar la cita.');
      setTituloAlerta('Campo Requerido');
      setAlertaAbierta(true);
      setGuardandoLocal(false);
      return;
    }
  }

  const fechasHorasARevisar = formularioCita.fechasHoras?.length > 0
    ? formularioCita.fechasHoras
    : (citaEditando?.fecha && citaEditando?.hora_inicio
        ? [{ fecha: citaEditando.fecha, horaInicio: citaEditando.hora_inicio.substring(0, 5) }]
        : []);

  const pacienteId = formularioCita.paciente_id ?? citaEditando?.paciente_id;
  if (pacienteId) {
    const toMin = (h) => {
      const partes = (h || '').split(':').map(Number);
      return partes[0] * 60 + (partes[1] || 0);
    };

    const fechasUnicas = [...new Set(
      fechasHorasARevisar.map(fh => fh.fecha).filter(Boolean)
    )];

    for (const fecha of fechasUnicas) {
      try {
        const resp = await api.get('/citas', {
          params: { fecha_desde: fecha, fecha_hasta: fecha }
        });
        const todasCitasFecha = Array.isArray(resp.data) ? resp.data : [];

        const citasPaciente = todasCitasFecha.filter(c => {
          if (citaEditando && c.id === citaEditando.id) return false;
          return String(c.paciente_id) === String(pacienteId);
        });

        for (const fh of fechasHorasARevisar.filter(fh => fh.fecha === fecha)) {
          if (!fh.horaInicio) continue;
          const durMin = parseInt(formularioCita.duracion || 40);
          const nuevaInicio = toMin(fh.horaInicio);
          const nuevaFin = nuevaInicio + durMin;

          for (const c of citasPaciente) {
            const cInicio = toMin(c.hora_inicio);
            const cFin = cInicio + parseInt(c.duracion_minutos || 40);

            const hayConflicto =
              (nuevaInicio >= cInicio && nuevaInicio < cFin) ||
              (nuevaFin > cInicio && nuevaFin <= cFin) ||
              (nuevaInicio <= cInicio && nuevaFin >= cFin);

            if (hayConflicto) {
              const horaConf = c.hora_inicio.substring(0, 5);
              const servNombre = c.servicio?.nombre || c.tipo_cita || 'otra especialidad';
              setTituloAlerta('Conflicto de Horario');
              setMensajeAlerta(
                `El paciente ya tiene una cita a las ${horaConf} (${servNombre}). No se pueden agendar citas en horarios superpuestos.`
              );
              setAlertaAbierta(true);
              setGuardandoLocal(false);
              return;
            }
          }
        }
      } catch (checkErr) {
        console.warn('No se pudo verificar conflictos de paciente:', checkErr.message);
      }
    }
  }

  // Verificar si alguna fecha/hora está bloqueada
  for (const fh of fechasHorasARevisar) {
    if (!fh.fecha || !fh.horaInicio) continue;

    if (verificarHoraBloqueada(fh.fecha, fh.horaInicio)) {
      setTituloAlerta('Horario Bloqueado');
      setMensajeAlerta(
        `El horario ${fh.fecha} a las ${fh.horaInicio} está bloqueado y no está disponible para agendar citas.`
      );
      setAlertaAbierta(true);
      setGuardandoLocal(false);
      return;
    }
  }

  // Validar que para citas NORMALES haya una venta seleccionada
  if (tipoCita === 'NORMAL' && !modoEdicion) {
    if (!formularioCita.venta_servicio_detalle_id) {
      setTituloAlerta('Venta Requerida');
      setMensajeAlerta(
        'Debes seleccionar un detalle de venta para poder agendar la cita. Si el paciente no tiene compras disponibles, primero debe realizar una venta.'
      );
      setAlertaAbierta(true);
      setGuardandoLocal(false);
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
    datosGuardar.compra_id = null;
  } else if (tipoCita === 'VISITA_ESCOLAR') {
    datosGuardar.encargado = encargadoVisita;
    datosGuardar.terapeutas_ids = [];
    datosGuardar.servicios_ids = [];
    datosGuardar.firma_documento = documentoFirmado ? 1 : 0;
    datosGuardar.compra_id = null;
  }

  datosGuardar.esMultiple = !modoEdicion && datosGuardar.fechasHoras && datosGuardar.fechasHoras.length > 1;

  try {
    await onGuardar(datosGuardar);
  } catch (error) {
    const responseMsg = error?.response?.data?.message;
    let msg;
    if (responseMsg) {
      msg = Array.isArray(responseMsg) ? responseMsg.join(', ') : responseMsg;
    } else {
      msg = error?.message || 'Error al guardar la cita';
    }
    setTituloAlerta('Conflicto de Horario');
    setMensajeAlerta(msg);
    setAlertaAbierta(true);
  } finally {
    setGuardandoLocal(false);
  }
}, [guardandoLocal, modoEdicion, esTerapeuta, motivoAccion, formularioCita, tipoCita, terapeutasReunion, serviciosReunion, encargadoVisita, documentoFirmado, onGuardar, modoSoloLectura, citaEditando]);
  // ========== ELIMINAR CITA ==========
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

  // ========== FUNCIONES PARA HISTORIAL ==========
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
                    {modoEdicion && citaEditando?.id && (
                      <span className="ml-2 text-white/90 font-normal">#{citaEditando.id}</span>
                    )}
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
                {citaEditando?.venta_servicio_detalle_id && (
                  <button
                    onClick={() => setTabValue(4)}
                    className={`flex items-center gap-2 px-3 sm:px-5 py-3.5 text-xs sm:text-sm font-semibold transition-all duration-200 relative whitespace-nowrap ${
                      tabValue === 4
                        ? 'text-[#7B1FA2]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span className="hidden sm:inline">Paquete</span>
                    <span className="sm:hidden">Paq.</span>
                    {tabValue === 4 && (
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

                {/* 🔒 ADVERTENCIA: CITA CON ASISTENCIA REGISTRADA */}
                {bloqueadoPorAsistencia && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-900 mb-1">
                        🔒 Cita bloqueada para edición
                      </p>
                      <p className="text-xs text-red-800">
                        Ya registraste la asistencia para esta cita. No se puede editar para evitar reutilización de citas antiguas. Solo un administrador puede modificarla.
                      </p>
                    </div>
                  </div>
                )}

                {/* PACIENTE */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Paciente {tipoCita !== 'REUNION_CLINICA' && <span className="text-red-500">*</span>}
                    {tipoCita === 'REUNION_CLINICA' && <span className="text-gray-400 text-xs ml-1">(Opcional)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar por nombre..."
                      value={queryPaciente}
                      onChange={(e) => setQueryPaciente(e.target.value)}
                      disabled={esTerapeuta || modoSoloLectura || bloqueadoPorAsistencia}
                      className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-900
                      focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/20
                      transition-all disabled:opacity-60 disabled:bg-gray-50
                      hover:border-gray-300"
                    />
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  </div>

                  {queryPaciente.length >= 2 && pacientes.length > 0 && !modoSoloLectura && !bloqueadoPorAsistencia && (
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
                      {!esTerapeuta && !modoSoloLectura && !bloqueadoPorAsistencia && (
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
                          disabled={esTerapeuta || modoSoloLectura || bloqueadoPorAsistencia}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="">Seleccionar servicio...</option>
                          {(() => {
                            const lista = (serviciosApi && serviciosApi.length ? serviciosApi : (servicios || []));
                            if (!Array.isArray(lista) || lista.length === 0) {
                              return <option disabled>No hay servicios disponibles</option>;
                            }
                            const agrupados = {};
                            lista.forEach(srv => {
                              const areaNombre = srv.area?.nombre || 'Otros';
                              if (!agrupados[areaNombre]) agrupados[areaNombre] = [];
                              agrupados[areaNombre].push(srv);
                            });
                            const ordenAreas = ['Área Infantil', 'Área Adolescentes y Adultos', 'Otros'];
                            const areasOrdenadas = Object.keys(agrupados).sort((a, b) => {
                              const indexA = ordenAreas.indexOf(a);
                              const indexB = ordenAreas.indexOf(b);
                              if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                              if (indexA === -1) return 1;
                              if (indexB === -1) return -1;
                              return indexA - indexB;
                            });
                            return areasOrdenadas.map(areaNombre => (
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

                      {/* 🛒 SELECTOR DE VENTA (SESIONES DISPONIBLES) */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Compra de Sesiones <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formularioCita.venta_servicio_detalle_id || ''}
                          onChange={(e) => {
                            const ventaId = e.target.value;
                            onFormularioChange('venta_servicio_detalle_id', ventaId);

                            // 🛒 GUARDAR VENTA SELECCIONADA PARA LÍMITES
                            const venta = ventasDisponibles.find(v => v.id === parseInt(ventaId));
                            setVentaSeleccionada(venta || null);

                            // 🛒 AJUSTAR SLOTS SI EXCEDE SESIONES DISPONIBLES
                            if (venta && formularioCita.fechasHoras) {
                              const sesionesDisp = venta.sesiones_disponibles;
                              if (formularioCita.fechasHoras.length > sesionesDisp) {
                                onFormularioChange('fechasHoras', formularioCita.fechasHoras.slice(0, sesionesDisp));
                                mostrarAlerta(
                                  'Slots Ajustados',
                                  `Se redujeron los slots a ${sesionesDisp} porque es el máximo de sesiones disponibles en esta compra.`,
                                  'warning'
                                );
                              }
                            }
                          }}
                          disabled={cargandoVentas || !formularioCita.paciente_id || !formularioCita.servicio_id || esTerapeuta || modoSoloLectura || bloqueadoPorAsistencia}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="">
                            {cargandoVentas
                              ? 'Cargando ventas...'
                              : !formularioCita.paciente_id || !formularioCita.servicio_id
                                ? 'Primero selecciona paciente y servicio'
                                : ventasDisponibles.length === 0
                                  ? 'No hay sesiones disponibles'
                                  : 'Seleccionar compra...'}
                          </option>
                          {ventasDisponibles.map((venta) => (
                            <option key={venta.id} value={String(venta.id)}>
                              {venta.descripcion}
                            </option>
                          ))}
                        </select>
                        {formularioCita.paciente_id && formularioCita.servicio_id && !cargandoVentas && ventasDisponibles.length === 0 && (
                          <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            El paciente no tiene sesiones disponibles de este servicio. Debe realizar una compra primero.
                          </p>
                        )}
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
                        disabled={esTerapeuta || modoSoloLectura || bloqueadoPorAsistencia}
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

                    {/* 🚀 FECHAS Y HORAS */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <label className="block text-sm font-semibold text-gray-700">
                            {modoEdicion ? 'Fecha y Hora' : 'Fechas y Horas'} <span className="text-red-500">*</span>
                          </label>
                        </div>
                        {!esTerapeuta && !modoEdicion && !modoSoloLectura && !bloqueadoPorAsistencia && (
                          <button
                            onClick={agregarFechaHora}
                            disabled={tipoCita === 'NORMAL' && ventaSeleccionada && !puedeAgregarMasSlots}
                            className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg transition-all text-[#7B1FA2] hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            title={tipoCita === 'NORMAL' && ventaSeleccionada && !puedeAgregarMasSlots ? `Límite alcanzado: ${sesionesDisponiblesVenta} sesiones disponibles` : 'Agregar más fechas/horas'}
                          >
                            <Plus className="w-4 h-4" />
                            Agregar
                          </button>
                        )}
                        {/* 🛒 CONTADOR DE SESIONES */}
                        {tipoCita === 'NORMAL' && ventaSeleccionada && !modoEdicion && (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${slotsActuales >= sesionesDisponiblesVenta ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {slotsActuales} de {sesionesDisponiblesVenta} sesiones
                          </span>
                        )}
                      </div>

                      {modoEdicion ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="date"
                              value={formularioCita.fechasHoras?.[0]?.fecha || ''}
                              onChange={(e) => {
                                if (modoSoloLectura) return;
                                const fechaStr = e.target.value;
                                const fecha = new Date(fechaStr + 'T00:00:00');
                                const diaSemana = fecha.getDay();

                                // Validar que no sea domingo
                                if (diaSemana === 0) {
                                  mostrarAlerta('Domingo no disponible', 'Los domingos no están disponibles para agendar citas.', 'warning');
                                  return;
                                }

                                // Validar que no sea feriado
                                const feriado = esFeriado(fechaStr);
                                if (feriado) {
                                  mostrarAlerta('Feriado Nacional', `No se pueden agendar citas en feriados.\n\n🎉 ${feriado.nombre}`, 'feriado');
                                  return;
                                }

                                // Validar que sea de lunes a sábado
                                if (diaSemana >= 1 && diaSemana <= 6) {
                                  onFormularioChange('actualizarFechaHora', { index: 0, campo: 'fecha', valor: fechaStr });
                                } else {
                                  mostrarAlerta('Fecha no válida', 'Solo se pueden agendar citas de lunes a sábado.', 'warning');
                                }
                              }}
                              disabled={esTerapeuta || modoSoloLectura || bloqueadoPorAsistencia}
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all disabled:opacity-50"
                            />
                            <div className="flex flex-col gap-2">
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
                                {formularioCita.fechasHoras?.[0]?.fecha && (() => {
                                  const horasDisponibles = generarHorasPorFecha(formularioCita.fechasHoras[0].fecha, formularioCita.duracion ? parseInt(formularioCita.duracion) : 40);
                                  const horaActual = formularioCita.fechasHoras[0].horaInicio;

                                  if (horaActual && !horasDisponibles.includes(horaActual)) {
                                    const todasLasHoras = [...horasDisponibles, horaActual].sort();
                                    return todasLasHoras.map(hora => (
                                      <option
                                        key={hora}
                                        value={hora}
                                        style={hora === horaActual ? { backgroundColor: '#e9d5ff', fontWeight: 'bold' } : {}}
                                      >
                                        {hora}{hora === horaActual ? ' (ajustada)' : ''}
                                      </option>
                                    ));
                                  }

                                  return horasDisponibles.map(hora => (
                                    <option key={hora} value={hora}>{hora}</option>
                                  ));
                                })()}
                              </select>

                              {formularioCita.fechasHoras?.[0]?.horaInicio && (
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (modoSoloLectura) return;
                                      const horaActual = formularioCita.fechasHoras[0].horaInicio;
                                      const [h, m] = horaActual.split(':').map(Number);
                                      const minutosActuales = h * 60 + m;
                                      const nuevosMinutos = minutosActuales - 10;
                                      if (nuevosMinutos >= 0) {
                                        const nuevaH = Math.floor(nuevosMinutos / 60);
                                        const nuevaM = nuevosMinutos % 60;
                                        const nuevaHora = `${String(nuevaH).padStart(2, '0')}:${String(nuevaM).padStart(2, '0')}`;
                                        onFormularioChange('actualizarFechaHora', { index: 0, campo: 'horaInicio', valor: nuevaHora });
                                      }
                                    }}
                                    disabled={esTerapeuta || modoSoloLectura}
                                    className="flex-1 px-2 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    -10 min
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (modoSoloLectura) return;
                                      const horaActual = formularioCita.fechasHoras[0].horaInicio;
                                      const [h, m] = horaActual.split(':').map(Number);
                                      const minutosActuales = h * 60 + m;
                                      const nuevosMinutos = minutosActuales + 10;
                                      if (nuevosMinutos < 24 * 60) {
                                        const nuevaH = Math.floor(nuevosMinutos / 60);
                                        const nuevaM = nuevosMinutos % 60;
                                        const nuevaHora = `${String(nuevaH).padStart(2, '0')}:${String(nuevaM).padStart(2, '0')}`;
                                        onFormularioChange('actualizarFechaHora', { index: 0, campo: 'horaInicio', valor: nuevaHora });
                                      }
                                    }}
                                    disabled={esTerapeuta || modoSoloLectura}
                                    className="flex-1 px-2 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    +10 min
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          {formularioCita.fechasHoras?.[0]?.fecha && verificarFechaBloqueadaTodoElDia(formularioCita.fechasHoras[0].fecha) && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-red-800">Esta fecha está bloqueada</p>
                                <p className="text-xs text-red-600 mt-1">El terapeuta no tiene disponibilidad este día. Por favor seleccione otra fecha.</p>
                              </div>
                            </div>
                          )}
                          {formularioCita.fechasHoras?.[0]?.fecha && !verificarFechaBloqueadaTodoElDia(formularioCita.fechasHoras[0].fecha) && generarHorasPorFecha(formularioCita.fechasHoras[0].fecha, formularioCita.duracion ? parseInt(formularioCita.duracion) : 40).length === 0 && (
                            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-yellow-800">No hay horarios disponibles</p>
                                <p className="text-xs text-yellow-600 mt-1">Todos los horarios están ocupados o bloqueados para esta fecha.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {formularioCita.fechasHoras && formularioCita.fechasHoras.length > 0 ? (
                            formularioCita.fechasHoras.map((fechaHora, index) => (
                              <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative">
                                {/* Número de slot */}
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-xs font-bold text-[#7B1FA2] bg-purple-100 px-2.5 py-1 rounded-lg">
                                    Cita #{index + 1}
                                  </span>
                                  {!esTerapeuta && !modoSoloLectura && formularioCita.fechasHoras.length > 1 && (
                                    <button
                                      onClick={() => eliminarFechaHora(index)}
                                      className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                                      disabled={modoSoloLectura}
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="date"
                                    value={fechaHora.fecha}
                                    onChange={(e) => {
                                      if (modoSoloLectura) return;
                                      const fechaStr = e.target.value;
                                      const fecha = new Date(fechaStr + 'T00:00:00');
                                      const diaSemana = fecha.getDay();

                                      // Validar que no sea domingo
                                      if (diaSemana === 0) {
                                        mostrarAlerta('Domingo no disponible', 'Los domingos no están disponibles para agendar citas.', 'warning');
                                        return;
                                      }

                                      // Validar que no sea feriado
                                      const feriado = esFeriado(fechaStr);
                                      if (feriado) {
                                        mostrarAlerta('Feriado Nacional', `No se pueden agendar citas en feriados.\n\n🎉 ${feriado.nombre}`, 'feriado');
                                        return;
                                      }

                                      // Validar que sea de lunes a sábado
                                      if (diaSemana >= 1 && diaSemana <= 6) {
                                        onFormularioChange('actualizarFechaHora', { index, campo: 'fecha', valor: fechaStr });
                                      } else {
                                        mostrarAlerta('Fecha no válida', 'Solo se pueden agendar citas de lunes a sábado.', 'warning');
                                      }
                                    }}
                                    disabled={esTerapeuta || modoSoloLectura || bloqueadoPorAsistencia}
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
                                {fechaHora.fecha && verificarFechaBloqueadaTodoElDia(fechaHora.fecha) && (
                                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mt-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-red-800">Esta fecha está bloqueada</p>
                                      <p className="text-xs text-red-600 mt-1">El terapeuta no tiene disponibilidad este día. Por favor seleccione otra fecha.</p>
                                    </div>
                                  </div>
                                )}
                                {fechaHora.fecha && !verificarFechaBloqueadaTodoElDia(fechaHora.fecha) && generarHorasPorFecha(fechaHora.fecha, formularioCita.duracion ? parseInt(formularioCita.duracion) : 40).length === 0 && (
                                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl mt-2">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-yellow-800">No hay horarios disponibles</p>
                                      <p className="text-xs text-yellow-600 mt-1">Todos los horarios están ocupados o bloqueados para esta fecha.</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <p className="text-sm text-gray-500">
                                Haga clic en "Agregar" para crear slots de fechas y horas
                              </p>
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
                                disabled={esTerapeuta || modoSoloLectura || bloqueadoPorAsistencia}
                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] disabled:opacity-60"
                              >
                                <option value="">Seleccionar servicio...</option>
                                {(() => {
                                  const lista = (serviciosApi && serviciosApi.length ? serviciosApi : (servicios || []));
                                  if (!Array.isArray(lista) || lista.length === 0) {
                                    return <option disabled>No hay servicios</option>;
                                  }
                                  const agrupados = {};
                                  lista.forEach(srv => {
                                    const areaNombre = srv.area?.nombre || 'Otros';
                                    if (!agrupados[areaNombre]) agrupados[areaNombre] = [];
                                    agrupados[areaNombre].push(srv);
                                  });
                                  const ordenAreas = ['Infantil y Adolescentes', 'Adultos', 'Otros'];
                                  const areasOrdenadas = Object.keys(agrupados).sort((a, b) => {
                                    const indexA = ordenAreas.indexOf(a);
                                    const indexB = ordenAreas.indexOf(b);
                                    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                                    if (indexA === -1) return 1;
                                    if (indexB === -1) return -1;
                                    return indexA - indexB;
                                  });
                                  return areasOrdenadas.map(areaNombre => (
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
                        {!esTerapeuta && !modoEdicion && !modoSoloLectura && !bloqueadoPorAsistencia && (
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
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="date"
                              value={formularioCita.fechasHoras?.[0]?.fecha || ''}
                              onChange={(e) => {
                                if (modoSoloLectura) return;
                                const fechaStr = e.target.value;
                                const fecha = new Date(fechaStr + 'T00:00:00');
                                const diaSemana = fecha.getDay();

                                // Validar que no sea domingo
                                if (diaSemana === 0) {
                                  mostrarAlerta('Domingo no disponible', 'Los domingos no están disponibles para agendar citas.', 'warning');
                                  return;
                                }

                                // Validar que no sea feriado
                                const feriado = esFeriado(fechaStr);
                                if (feriado) {
                                  mostrarAlerta('Feriado Nacional', `No se pueden agendar citas en feriados.\n\n🎉 ${feriado.nombre}`, 'feriado');
                                  return;
                                }

                                // Validar que sea de lunes a sábado
                                if (diaSemana >= 1 && diaSemana <= 6) {
                                  onFormularioChange('actualizarFechaHora', { index: 0, campo: 'fecha', valor: fechaStr });
                                } else {
                                  mostrarAlerta('Fecha no válida', 'Solo se pueden agendar citas de lunes a sábado.', 'warning');
                                }
                              }}
                              disabled={esTerapeuta || modoSoloLectura || bloqueadoPorAsistencia}
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all disabled:opacity-50"
                            />
                            <div className="flex flex-col gap-2">
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
                                {formularioCita.fechasHoras?.[0]?.fecha && (() => {
                                  const horasDisponibles = generarHorasPorFecha(formularioCita.fechasHoras[0].fecha, formularioCita.duracion ? parseInt(formularioCita.duracion) : 40);
                                  const horaActual = formularioCita.fechasHoras[0].horaInicio;
                                  if (horaActual && !horasDisponibles.includes(horaActual)) {
                                    const todasLasHoras = [...horasDisponibles, horaActual].sort();
                                    return todasLasHoras.map(hora => (
                                      <option
                                        key={hora}
                                        value={hora}
                                        style={hora === horaActual ? { backgroundColor: '#e9d5ff', fontWeight: 'bold' } : {}}
                                      >
                                        {hora}{hora === horaActual ? ' (ajustada)' : ''}
                                      </option>
                                    ));
                                  }
                                  return horasDisponibles.map(hora => (
                                    <option key={hora} value={hora}>{hora}</option>
                                  ));
                                })()}
                              </select>
                              {formularioCita.fechasHoras?.[0]?.horaInicio && (
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (modoSoloLectura) return;
                                      const horaActual = formularioCita.fechasHoras[0].horaInicio;
                                      const [h, m] = horaActual.split(':').map(Number);
                                      const nuevosMinutos = h * 60 + m - 10;
                                      if (nuevosMinutos >= 0) {
                                        const nuevaHora = `${String(Math.floor(nuevosMinutos / 60)).padStart(2, '0')}:${String(nuevosMinutos % 60).padStart(2, '0')}`;
                                        onFormularioChange('actualizarFechaHora', { index: 0, campo: 'horaInicio', valor: nuevaHora });
                                      }
                                    }}
                                    disabled={esTerapeuta || modoSoloLectura}
                                    className="flex-1 px-2 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  >-10 min</button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (modoSoloLectura) return;
                                      const horaActual = formularioCita.fechasHoras[0].horaInicio;
                                      const [h, m] = horaActual.split(':').map(Number);
                                      const nuevosMinutos = h * 60 + m + 10;
                                      if (nuevosMinutos < 24 * 60) {
                                        const nuevaHora = `${String(Math.floor(nuevosMinutos / 60)).padStart(2, '0')}:${String(nuevosMinutos % 60).padStart(2, '0')}`;
                                        onFormularioChange('actualizarFechaHora', { index: 0, campo: 'horaInicio', valor: nuevaHora });
                                      }
                                    }}
                                    disabled={esTerapeuta || modoSoloLectura}
                                    className="flex-1 px-2 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  >+10 min</button>
                                </div>
                              )}
                            </div>
                          </div>
                          {formularioCita.fechasHoras?.[0]?.fecha && verificarFechaBloqueadaTodoElDia(formularioCita.fechasHoras[0].fecha) && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-red-800">Esta fecha está bloqueada</p>
                                <p className="text-xs text-red-600 mt-1">El terapeuta no tiene disponibilidad este día. Por favor seleccione otra fecha.</p>
                              </div>
                            </div>
                          )}
                          {formularioCita.fechasHoras?.[0]?.fecha && !verificarFechaBloqueadaTodoElDia(formularioCita.fechasHoras[0].fecha) && generarHorasPorFecha(formularioCita.fechasHoras[0].fecha, formularioCita.duracion ? parseInt(formularioCita.duracion) : 40).length === 0 && (
                            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-yellow-800">No hay horarios disponibles</p>
                                <p className="text-xs text-yellow-600 mt-1">Todos los horarios están ocupados o bloqueados para esta fecha.</p>
                              </div>
                            </div>
                          )}
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
                                      const fechaStr = e.target.value;
                                      const fecha = new Date(fechaStr + 'T00:00:00');
                                      const diaSemana = fecha.getDay();

                                      // Validar que no sea domingo
                                      if (diaSemana === 0) {
                                        mostrarAlerta('Domingo no disponible', 'Los domingos no están disponibles para agendar citas.', 'warning');
                                        return;
                                      }

                                      // Validar que no sea feriado
                                      const feriado = esFeriado(fechaStr);
                                      if (feriado) {
                                        mostrarAlerta('Feriado Nacional', `No se pueden agendar citas en feriados.\n\n🎉 ${feriado.nombre}`, 'feriado');
                                        return;
                                      }

                                      // Validar que sea de lunes a sábado
                                      if (diaSemana >= 1 && diaSemana <= 6) {
                                        onFormularioChange('actualizarFechaHora', { index, campo: 'fecha', valor: fechaStr });
                                      } else {
                                        mostrarAlerta('Fecha no válida', 'Solo se pueden agendar citas de lunes a sábado.', 'warning');
                                      }
                                    }}
                                    disabled={esTerapeuta || modoSoloLectura || bloqueadoPorAsistencia}
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
                                {fechaHora.fecha && verificarFechaBloqueadaTodoElDia(fechaHora.fecha) && (
                                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mt-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-red-800">Esta fecha está bloqueada</p>
                                      <p className="text-xs text-red-600 mt-1">El terapeuta no tiene disponibilidad este día. Por favor seleccione otra fecha.</p>
                                    </div>
                                  </div>
                                )}
                                {fechaHora.fecha && !verificarFechaBloqueadaTodoElDia(fechaHora.fecha) && generarHorasPorFecha(fechaHora.fecha, formularioCita.duracion ? parseInt(formularioCita.duracion) : 40).length === 0 && (
                                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl mt-2">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-yellow-800">No hay horarios disponibles</p>
                                      <p className="text-xs text-yellow-600 mt-1">Todos los horarios están ocupados o bloqueados para esta fecha.</p>
                                    </div>
                                  </div>
                                )}
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
                              setEncargadoVisita({ ...encargadoVisita, institucion: e.target.value });
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
                              setEncargadoVisita({ ...encargadoVisita, nombre_completo: e.target.value });
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
                              setEncargadoVisita({ ...encargadoVisita, telefono: e.target.value });
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
                              disabled={esTerapeuta || modoSoloLectura || bloqueadoPorAsistencia}
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
                          const agrupados = {};
                          lista.forEach(srv => {
                            const areaNombre = srv.area?.nombre || 'Otros';
                            if (!agrupados[areaNombre]) agrupados[areaNombre] = [];
                            agrupados[areaNombre].push(srv);
                          });
                          const ordenAreas = ['Infantil y Adolescentes', 'Adultos', 'Otros'];
                          const areasOrdenadas = Object.keys(agrupados).sort((a, b) => {
                            const indexA = ordenAreas.indexOf(a);
                            const indexB = ordenAreas.indexOf(b);
                            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                            if (indexA === -1) return 1;
                            if (indexB === -1) return -1;
                            return indexA - indexB;
                          });
                          return areasOrdenadas.map(areaNombre => (
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
                        disabled={esTerapeuta || modoSoloLectura || bloqueadoPorAsistencia}
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
                        {!esTerapeuta && !modoEdicion && !modoSoloLectura && !bloqueadoPorAsistencia && (
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
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="date"
                              value={formularioCita.fechasHoras?.[0]?.fecha || ''}
                              onChange={(e) => {
                                if (modoSoloLectura) return;
                                const fechaStr = e.target.value;
                                const fecha = new Date(fechaStr + 'T00:00:00');
                                const diaSemana = fecha.getDay();

                                // Validar que no sea domingo
                                if (diaSemana === 0) {
                                  mostrarAlerta('Domingo no disponible', 'Los domingos no están disponibles para agendar citas.', 'warning');
                                  return;
                                }

                                // Validar que no sea feriado
                                const feriado = esFeriado(fechaStr);
                                if (feriado) {
                                  mostrarAlerta('Feriado Nacional', `No se pueden agendar citas en feriados.\n\n🎉 ${feriado.nombre}`, 'feriado');
                                  return;
                                }

                                // Validar que sea de lunes a sábado
                                if (diaSemana >= 1 && diaSemana <= 6) {
                                  onFormularioChange('actualizarFechaHora', { index: 0, campo: 'fecha', valor: fechaStr });
                                } else {
                                  mostrarAlerta('Fecha no válida', 'Solo se pueden agendar citas de lunes a sábado.', 'warning');
                                }
                              }}
                              disabled={esTerapeuta || modoSoloLectura || bloqueadoPorAsistencia}
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all disabled:opacity-50"
                            />
                            <div className="flex flex-col gap-2">
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
                                {formularioCita.fechasHoras?.[0]?.fecha && (() => {
                                  const horasDisponibles = generarHorasPorFecha(formularioCita.fechasHoras[0].fecha, formularioCita.duracion ? parseInt(formularioCita.duracion) : 40);
                                  const horaActual = formularioCita.fechasHoras[0].horaInicio;
                                  if (horaActual && !horasDisponibles.includes(horaActual)) {
                                    const todasLasHoras = [...horasDisponibles, horaActual].sort();
                                    return todasLasHoras.map(hora => (
                                      <option key={hora} value={hora} style={hora === horaActual ? { backgroundColor: '#e9d5ff', fontWeight: 'bold' } : {}}>
                                        {hora}{hora === horaActual ? ' (ajustada)' : ''}
                                      </option>
                                    ));
                                  }
                                  return horasDisponibles.map(hora => (
                                    <option key={hora} value={hora}>{hora}</option>
                                  ));
                                })()}
                              </select>
                              {formularioCita.fechasHoras?.[0]?.horaInicio && (
                                <div className="flex gap-1">
                                  <button type="button" onClick={() => {
                                    if (modoSoloLectura) return;
                                    const horaActual = formularioCita.fechasHoras[0].horaInicio;
                                    const [h, m] = horaActual.split(':').map(Number);
                                    const nuevosMinutos = h * 60 + m - 10;
                                    if (nuevosMinutos >= 0) {
                                      const nuevaHora = `${String(Math.floor(nuevosMinutos / 60)).padStart(2, '0')}:${String(nuevosMinutos % 60).padStart(2, '0')}`;
                                      onFormularioChange('actualizarFechaHora', { index: 0, campo: 'horaInicio', valor: nuevaHora });
                                    }
                                  }} disabled={esTerapeuta || modoSoloLectura} className="flex-1 px-2 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed">-10 min</button>
                                  <button type="button" onClick={() => {
                                    if (modoSoloLectura) return;
                                    const horaActual = formularioCita.fechasHoras[0].horaInicio;
                                    const [h, m] = horaActual.split(':').map(Number);
                                    const nuevosMinutos = h * 60 + m + 10;
                                    if (nuevosMinutos < 24 * 60) {
                                      const nuevaHora = `${String(Math.floor(nuevosMinutos / 60)).padStart(2, '0')}:${String(nuevosMinutos % 60).padStart(2, '0')}`;
                                      onFormularioChange('actualizarFechaHora', { index: 0, campo: 'horaInicio', valor: nuevaHora });
                                    }
                                  }} disabled={esTerapeuta || modoSoloLectura} className="flex-1 px-2 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed">+10 min</button>
                                </div>
                              )}
                            </div>
                          </div>
                          {formularioCita.fechasHoras?.[0]?.fecha && verificarFechaBloqueadaTodoElDia(formularioCita.fechasHoras[0].fecha) && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-red-800">Esta fecha está bloqueada</p>
                                <p className="text-xs text-red-600 mt-1">El terapeuta no tiene disponibilidad este día. Por favor seleccione otra fecha.</p>
                              </div>
                            </div>
                          )}
                          {formularioCita.fechasHoras?.[0]?.fecha && !verificarFechaBloqueadaTodoElDia(formularioCita.fechasHoras[0].fecha) && generarHorasPorFecha(formularioCita.fechasHoras[0].fecha, formularioCita.duracion ? parseInt(formularioCita.duracion) : 40).length === 0 && (
                            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-yellow-800">No hay horarios disponibles</p>
                                <p className="text-xs text-yellow-600 mt-1">Todos los horarios están ocupados o bloqueados para esta fecha.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {formularioCita.fechasHoras && formularioCita.fechasHoras.length > 0 ? (
                            formularioCita.fechasHoras.map((fechaHora, index) => (
                              <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative">
                                {!esTerapeuta && !modoSoloLectura && formularioCita.fechasHoras.length > 1 && (
                                  <button onClick={() => onFormularioChange('eliminarFechaHora', index)} className="absolute top-2 right-2 text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all">
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                  <input type="date" value={fechaHora.fecha} onChange={(e) => {
                                    if (modoSoloLectura) return;
                                    const fechaStr = e.target.value;
                                    const fecha = new Date(fechaStr + 'T00:00:00');
                                    const diaSemana = fecha.getDay();

                                    // Validar que no sea domingo
                                    if (diaSemana === 0) {
                                      mostrarAlerta('Domingo no disponible', 'Los domingos no están disponibles para agendar citas.', 'warning');
                                      return;
                                    }

                                    // Validar que no sea feriado
                                    const feriado = esFeriado(fechaStr);
                                    if (feriado) {
                                      mostrarAlerta('Feriado Nacional', `No se pueden agendar citas en feriados.\n\n🎉 ${feriado.nombre}`, 'feriado');
                                      return;
                                    }

                                    if (diaSemana >= 1 && diaSemana <= 6) {
                                      onFormularioChange('actualizarFechaHora', { index, campo: 'fecha', valor: fechaStr });
                                    } else {
                                      mostrarAlerta('Fecha no válida', 'Solo se pueden agendar citas de lunes a sábado.', 'warning');
                                    }
                                  }} disabled={esTerapeuta || modoSoloLectura || bloqueadoPorAsistencia} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all disabled:opacity-50" />
                                  <select value={fechaHora.horaInicio || ''} onChange={(e) => {
                                    if (modoSoloLectura) return;
                                    onFormularioChange('actualizarFechaHora', { index, campo: 'horaInicio', valor: e.target.value });
                                  }} disabled={esTerapeuta || modoSoloLectura || !fechaHora.fecha} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50">
                                    <option value="">{!fechaHora.fecha ? 'Seleccione una fecha primero' : 'Seleccionar hora...'}</option>
                                    {fechaHora.fecha && generarHorasPorFecha(fechaHora.fecha, formularioCita.duracion ? parseInt(formularioCita.duracion) : 40).map(hora => (
                                      <option key={hora} value={hora}>{hora}</option>
                                    ))}
                                  </select>
                                </div>
                                {fechaHora.fecha && verificarFechaBloqueadaTodoElDia(fechaHora.fecha) && (
                                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mt-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1"><p className="text-sm font-semibold text-red-800">Esta fecha está bloqueada</p><p className="text-xs text-red-600 mt-1">El terapeuta no tiene disponibilidad este día. Por favor seleccione otra fecha.</p></div>
                                  </div>
                                )}
                                {fechaHora.fecha && !verificarFechaBloqueadaTodoElDia(fechaHora.fecha) && generarHorasPorFecha(fechaHora.fecha, formularioCita.duracion ? parseInt(formularioCita.duracion) : 40).length === 0 && (
                                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl mt-2">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1"><p className="text-sm font-semibold text-yellow-800">No hay horarios disponibles</p><p className="text-xs text-yellow-600 mt-1">Todos los horarios están ocupados o bloqueados para esta fecha.</p></div>
                                  </div>
                                )}
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

                {/* ✅ MOTIVO DE MODIFICACIÓN */}
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
                        <div className="p-4 space-y-3">
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
                          {(item.paciente || item.tipo_cita === 'REUNION_CLINICA') && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-1">Paciente:</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {item.tipo_cita === 'REUNION_CLINICA' && !item.paciente
                                    ? 'Reunión Interna'
                                    : item.paciente?.nombre_completo}
                                </p>
                              </div>
                              {item.paciente && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-600 mb-1">Documento:</p>
                                  <p className="text-sm font-medium text-gray-900">{item.paciente.numero_documento}</p>
                                </div>
                              )}
                            </div>
                          )}
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
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">Duración:</p>
                            <p className="text-sm text-gray-900">{item.duracion_minutos} minutos</p>
                          </div>
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
                          {item.nota && (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-1">Nota:</p>
                              <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-2">{item.nota}</p>
                            </div>
                          )}
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

            {/* TAB DE ASISTENCIA */}
            {modoEdicion && puedeVerHistorial && tabValue === 2 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Control de Asistencia</h3>
                  {cargandoAsistencia && (
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin"></div>
                  )}
                </div>

                {esRecepcionista && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Recepción</h4>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleRecepcionMarcar(
                          seguimientoAsistencia?.recepcion_marco && seguimientoAsistencia?.recepcion_estado_id === 7 ? null : 7
                        )}
                        disabled={guardandoAsistencia}
                        className={`py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                          seguimientoAsistencia?.recepcion_marco && seguimientoAsistencia?.recepcion_estado_id === 7
                            ? 'bg-green-600 text-white ring-2 ring-green-400'
                            : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-800'
                        }`}
                      >
                        {guardandoAsistencia ? (
                          <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>Guardando...</>
                        ) : '✓ Asistió'}
                      </button>
                      <button
                        onClick={() => handleRecepcionMarcar(
                          seguimientoAsistencia?.recepcion_marco && seguimientoAsistencia?.recepcion_estado_id === 6 ? null : 6
                        )}
                        disabled={guardandoAsistencia}
                        className={`py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                          seguimientoAsistencia?.recepcion_marco && seguimientoAsistencia?.recepcion_estado_id === 6
                            ? 'bg-orange-600 text-white ring-2 ring-orange-400'
                            : 'bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-800'
                        }`}
                      >
                        {guardandoAsistencia ? (
                          <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>Guardando...</>
                        ) : '◆ Sesión Dictada'}
                      </button>
                    </div>
                    {!seguimientoAsistencia?.recepcion_marco && (
                      <p className="mt-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 text-center">
                        Pendiente — sin registrar
                      </p>
                    )}
                  </div>
                )}

                {esTerapeuta && (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Terapeuta</h4>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleTerapeutaMarcar(
                          seguimientoAsistencia?.terapeuta_marco && seguimientoAsistencia?.terapeuta_estado_id === 7 ? null : 7
                        )}
                        disabled={guardandoAsistencia}
                        className={`py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                          seguimientoAsistencia?.terapeuta_marco && seguimientoAsistencia?.terapeuta_estado_id === 7
                            ? 'bg-green-600 text-white ring-2 ring-green-400'
                            : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-800'
                        }`}
                      >
                        {guardandoAsistencia ? (
                          <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>Guardando...</>
                        ) : '✓ Asistió'}
                      </button>
                      <button
                        onClick={() => handleTerapeutaMarcar(
                          seguimientoAsistencia?.terapeuta_marco && seguimientoAsistencia?.terapeuta_estado_id === 6 ? null : 6
                        )}
                        disabled={guardandoAsistencia}
                        className={`py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                          seguimientoAsistencia?.terapeuta_marco && seguimientoAsistencia?.terapeuta_estado_id === 6
                            ? 'bg-orange-600 text-white ring-2 ring-orange-400'
                            : 'bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-800'
                        }`}
                      >
                        {guardandoAsistencia ? (
                          <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>Guardando...</>
                        ) : '◆ Sesión Dictada'}
                      </button>
                    </div>
                    {!seguimientoAsistencia?.terapeuta_marco && (
                      <p className="mt-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 text-center">
                        Pendiente — sin registrar
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Registros</h4>
                  <div className="space-y-2">
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
                                  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                }).replace(',', '')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-bold">Pendiente</span>
                        )}
                      </div>
                    )}
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
                                  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                }).replace(',', '')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-bold">Pendiente</span>
                        )}
                      </div>
                    )}
                  </div>

                  {currentUser?.rol?.id === ROLES.ADMINISTRADOR &&
                    seguimientoAsistencia?.recepcion_marco === 1 &&
                    seguimientoAsistencia?.terapeuta_marco === 1 &&
                    !((seguimientoAsistencia.recepcion_estado_id === 7 && seguimientoAsistencia.terapeuta_estado_id === 7) ||
                      (seguimientoAsistencia.recepcion_estado_id === 6 && seguimientoAsistencia.terapeuta_estado_id === 6)) && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <p className="text-xs text-red-800 font-medium">⚠️ Discrepancia detectada entre Recepción y Terapeuta</p>
                      </div>
                    )}

                  {currentUser?.rol?.id === ROLES.ADMINISTRADOR &&
                    seguimientoAsistencia?.recepcion_marco === 1 &&
                    seguimientoAsistencia?.terapeuta_marco === 1 &&
                    seguimientoAsistencia.recepcion_estado_id === 7 &&
                    seguimientoAsistencia.terapeuta_estado_id === 7 && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <p className="text-xs text-green-800 font-medium">Asistencia validada correctamente por ambas partes</p>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* TAB DE RECORDATORIO */}
            {modoEdicion && puedeVerHistorial && tabValue === 3 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">Recordatorio WhatsApp</h3>
                  <MessageCircle className="w-4 h-4 text-[#7B1FA2]" />
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-xs font-bold text-gray-900 mb-2">Resumen de la Cita</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-gray-600">Paciente: </span>
                      <span className="text-gray-900">
                        {citaEditando?.tipo_cita === 'REUNION_CLINICA' && !citaEditando?.paciente
                          ? 'Reunión Interna'
                          : citaEditando?.paciente
                            ? `${citaEditando.paciente.nombres || ''} ${citaEditando.paciente.apellido_paterno || ''} ${citaEditando.paciente.apellido_materno || ''}`.trim()
                            : 'No especificado'}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600">Fecha: </span>
                      <span className="text-gray-900">
                        {citaEditando?.fecha ? (() => {
                          const [year, month, day] = citaEditando.fecha.split('-').map(Number);
                          const fechaLocal = new Date(year, month - 1, day);
                          return fechaLocal.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                        })() : 'No especificada'}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600">Hora: </span>
                      <span className="text-gray-900">
                        {citaEditando?.hora_inicio ? (() => {
                          const [hours, minutes] = citaEditando.hora_inicio.split(':').map(Number);
                          const ampm = hours >= 12 ? 'pm' : 'am';
                          const horasFormateadas = hours % 12 || 12;
                          return `${horasFormateadas}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                        })() : 'No especificada'}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600">Tipo: </span>
                      <span className="text-gray-900">
                        {citaEditando?.tipo_cita === 'NORMAL' ? 'Cita Normal' :
                          citaEditando?.tipo_cita === 'REUNION_CLINICA' ? 'Reunión Clínica' :
                            citaEditando?.tipo_cita === 'VISITA_ESCOLAR' ? 'Visita Escolar' : 'No especificado'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Generar Mensaje</h4>
                        <p className="text-xs text-gray-600">Personalizado para WhatsApp</p>
                      </div>
                    </div>
                    <button
                      onClick={generarMensajeRecordatorio}
                      disabled={modoSoloLectura || cargandoRecordatorio}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold text-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {cargandoRecordatorio ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Generando...</>
                      ) : (
                        <><MessageCircle className="w-4 h-4" />Generar</>
                      )}
                    </button>
                  </div>
                </div>

                {mensajeRecordatorio && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-900">Mensaje Generado</h4>
                      <button
                        onClick={copiarAlPortapapeles}
                        disabled={modoSoloLectura}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-lg font-semibold text-xs hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {copiado ? <><Check className="w-3.5 h-3.5" />¡Copiado!</> : <><Copy className="w-3.5 h-3.5" />Copiar</>}
                      </button>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                      <div className="bg-white rounded-md p-3 border border-gray-300">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">{mensajeRecordatorio}</pre>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          Listo para WhatsApp
                        </span>
                        <span className="text-gray-400">{mensajeRecordatorio.length} caracteres</span>
                      </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-yellow-800">
                          <span className="font-semibold">Tip:</span> Copia el mensaje, abre WhatsApp, pégalo al contacto y revisa antes de enviar
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!mensajeRecordatorio && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">
                      El mensaje aparecerá aquí una vez generado
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 📦 TAB PAQUETE */}
            {modoEdicion && puedeVerHistorial && tabValue === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">Información del Paquete</h3>
                  <Package className="w-5 h-5 text-[#7B1FA2]" />
                </div>

                {cargandoPaquete && (
                  <div className="h-40 bg-gray-50 rounded-xl animate-pulse flex items-center justify-center">
                    <div className="text-gray-400 text-sm">Cargando información del paquete...</div>
                  </div>
                )}

                {!cargandoPaquete && !infoPaquete && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Esta cita no pertenece a ningún paquete</p>
                  </div>
                )}

                {!cargandoPaquete && infoPaquete && (
                  <>
                    {/* Info del Paquete */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-[#7B1FA2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-[#7B1FA2]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900">{infoPaquete.servicio_nombre}</h4>
                            <p className="text-xs text-gray-600 mt-0.5">{infoPaquete.paquete_nombre || 'Paquete de sesiones'}</p>
                          </div>
                        </div>
                        {infoPaquete.citas[0]?.comprobante && (
                          <button
                            onClick={() => abrirDetalleVenta(infoPaquete.citas.find(c => c.venta_id)?.venta_id || infoPaquete.venta_id)}
                            disabled={cargandoVentaDetalle}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#7B1FA2]/30 rounded-lg hover:bg-[#7B1FA2]/5 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#7B1FA2]" />
                            <span className="text-xs font-bold text-[#7B1FA2] font-mono">
                              {cargandoVentaDetalle ? '...' : infoPaquete.citas[0].comprobante}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Aviso sesión individual */}
                    {infoPaquete.paquete_nombre === 'Cita individual' && (
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-purple-800">Sesión individual</p>
                          <p className="text-xs text-purple-700 mt-0.5">
                            Para continuar el tratamiento, recuerda coordinar la compra de la próxima sesión o un paquete de sesiones.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Indicador de última/penúltima sesión */}
                    {(() => {
                      const programadas = infoPaquete.citas
                        .filter(c => c.programada && c.id !== null)
                        .sort((a, b) => new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`));
                      const totalSesiones = infoPaquete.sesiones_totales || programadas.length;
                      const esUltima = programadas.length > 0 && programadas[programadas.length - 1].id === citaEditando?.id;
                      const esPenultima = programadas.length >= 2 && programadas[programadas.length - 2].id === citaEditando?.id;
                      const restantes = Math.max(0, totalSesiones - programadas.length);

                      if (esUltima) return (
                        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-amber-800">Última sesión del paquete</p>
                            <p className="text-xs text-amber-700 mt-0.5">
                              {totalSesiones > 1
                                ? `Se han agendado las ${totalSesiones} sesiones contratadas.`
                                : 'Sesión individual completada.'}
                              {restantes === 0 ? ' Se recomienda coordinar la renovación.' : ''}
                            </p>
                          </div>
                        </div>
                      );
                      if (esPenultima) return (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-blue-800">Penúltima sesión del paquete</p>
                            <p className="text-xs text-blue-700 mt-0.5">Luego de esta cita quedará solo 1 sesión más.</p>
                          </div>
                        </div>
                      );
                      if (restantes > 0) return (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                          <Package className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <p className="text-sm text-green-800">
                            <span className="font-bold">{restantes}</span> {restantes === 1 ? 'sesión pendiente' : 'sesiones pendientes'} de agendar
                          </p>
                        </div>
                      );
                      return null;
                    })()}

                    {/* Estadísticas */}
                    {(() => {
                      // Asistencia real: ambos (terapeuta + recepcion) en estado 7 = asistió, estado 6 = no asistió
                      const asistio = (c) =>
                        (c.terapeuta_estado_id == 7 && c.recepcion_estado_id == 7) || c.asistencia == 1;
                      const noAsistio = (c) =>
                        (c.terapeuta_estado_id == 6 && c.recepcion_estado_id == 6) || c.asistencia == 0;
                      const citasReales = infoPaquete.citas.filter(c => c.programada && c.id !== null);
                      return (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-[#7B1FA2]">{infoPaquete.sesiones_totales || citasReales.length}</div>
                            <div className="text-xs text-gray-500 mt-1">Total Sesiones</div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-600">{citasReales.filter(asistio).length}</div>
                            <div className="text-xs text-gray-500 mt-1">Asistidas</div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-red-600">{citasReales.filter(noAsistio).length}</div>
                            <div className="text-xs text-gray-500 mt-1">Faltas</div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Lista de Citas del Paquete */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h4 className="text-xs font-bold text-gray-700 uppercase">Citas del Paquete</h4>
                      </div>
                      <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                        {[...infoPaquete.citas]
                          .sort((a, b) => {
                            if (!a.programada) return 1;
                            if (!b.programada) return -1;
                            return new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`);
                          })
                          .map((cita, idx) => {
                          const esCitaActual = cita.id === citaEditando?.id;
                          return (
                            <div
                              key={cita.id ?? `slot-${idx}`}
                              className={`px-4 py-2.5 transition-colors ${
                                esCitaActual
                                  ? 'bg-[#7B1FA2]/5 border-l-4 border-[#7B1FA2]'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <div className="flex-shrink-0">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                                      esCitaActual
                                        ? 'bg-[#7B1FA2] text-white'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {idx + 1}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    {infoPaquete.es_combo && cita.linea_servicio && (
                                      <div className="text-[10px] font-semibold text-[#7B1FA2] uppercase tracking-wide mb-0.5">
                                        {cita.linea_servicio}{cita.motivo_nombre ? ` · ${cita.motivo_nombre}` : ''}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                      {cita.fecha ? (
                                        <span className="text-sm font-medium text-gray-900">
                                          {new Date(cita.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                      ) : (
                                        <span className="text-sm text-gray-400 italic">Por agendar</span>
                                      )}
                                      {cita.hora && (
                                        <>
                                          <span className="text-gray-300">·</span>
                                          <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                          <span className="text-sm text-gray-600">{cita.hora?.substring(0, 5)}</span>
                                        </>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                      <span className="text-xs text-gray-500 truncate">{cita.especialista || 'No asignado'}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-shrink-0">
                                  {(() => {
                                    const asistio = (cita.terapeuta_estado_id == 7 && cita.recepcion_estado_id == 7) || cita.asistencia == 1;
                                    const noAsistio = (cita.terapeuta_estado_id == 6 && cita.recepcion_estado_id == 6) || cita.asistencia == 0;
                                    if (!cita.programada || !cita.id) return (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 text-[10px] font-medium border border-gray-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                        Por agendar
                                      </span>
                                    );
                                    if (asistio) return (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold border border-green-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        Asistió
                                      </span>
                                    );
                                    if (noAsistio) return (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-semibold border border-red-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        No asistió
                                      </span>
                                    );
                                    return (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-[10px] font-medium border border-yellow-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                        Pendiente
                                      </span>
                                    );
                                  })()}
                                </div>
                              </div>
                              {esCitaActual && (
                                <div className="mt-2 flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#7B1FA2] animate-pulse" />
                                  <span className="text-[10px] font-semibold text-[#7B1FA2] uppercase tracking-wide">
                                    Cita Actual
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
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
                    disabled={guardando || guardandoLocal || modoSoloLectura || bloqueadoPorAsistencia}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-semibold text-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(guardando || guardandoLocal) ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Guardando...</>
                    ) : (
                      <><Save className="w-4 h-4" />{modoEdicion ? 'Actualizar' : 'Guardar'}</>
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
                    <span className="font-semibold">Paciente:</span> {
                      citaEditando.tipo_cita === 'REUNION_CLINICA' && !formularioCita.paciente
                        ? 'Reunión Interna'
                        : (formularioCita.paciente?.nombre_completo || 'N/A')
                    }
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">Fecha:</span> {formularioCita.fechasHoras?.[0]?.fecha} - {formularioCita.fechasHoras?.[0]?.horaInicio}
                  </p>
                </div>
              )}
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
              <button onClick={cerrarDialogoEliminar} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all">
                Cancelar
              </button>
              <button onClick={confirmarEliminar} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-all">
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Alerta */}
      {alertaAbierta && (() => {
        const estilos = {
          error: {
            headerBg: 'bg-gradient-to-r from-red-50 to-red-100',
            headerBorder: 'border-red-200',
            iconBg: 'bg-gradient-to-br from-red-400 to-red-600',
            icon: <AlertCircle className="w-6 h-6 text-white" />,
            buttonBg: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
          },
          warning: {
            headerBg: 'bg-gradient-to-r from-yellow-50 to-orange-50',
            headerBorder: 'border-yellow-200',
            iconBg: 'bg-gradient-to-br from-yellow-400 to-orange-500',
            icon: <AlertTriangle className="w-6 h-6 text-white" />,
            buttonBg: 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
          },
          feriado: {
            headerBg: 'bg-gradient-to-r from-orange-50 to-yellow-50',
            headerBorder: 'border-orange-200',
            iconBg: 'bg-gradient-to-br from-orange-400 to-orange-600',
            icon: <Calendar className="w-6 h-6 text-white" />,
            buttonBg: 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
          }
        };
        const estilo = estilos[tipoAlerta] || estilos.error;

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
              <div className={`${estilo.headerBg} border-b ${estilo.headerBorder} px-5 py-4 rounded-t-2xl`}>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 ${estilo.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
                    {estilo.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{tituloAlerta}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{mensajeAlerta}</p>
              </div>
              <div className="border-t border-gray-200 px-5 py-4 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={() => { setAlertaAbierta(false); setTituloAlerta('Campo Requerido'); setTipoAlerta('error'); }}
                  className={`w-full px-4 py-2.5 ${estilo.buttonBg} text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all`}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal detalle de venta desde tab Paquete */}
      {ventaDetallePaquete && (
        <DetalleVentaModal
          venta={ventaDetallePaquete}
          tipo="servicio"
          onClose={() => setVentaDetallePaquete(null)}
        />
      )}
    </>
  );
};

export default React.memo(ModalAgendarCita);