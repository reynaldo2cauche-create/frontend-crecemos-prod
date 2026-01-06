import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { useBusquedaPacientes } from '../../hooks/useBusquedaPacientes';
import { useServicios } from '../../hooks/useServicios';
import { useMotivosCita } from '../../hooks/useMotivosCita';
import { useHistorialCita } from '../../hooks/useHistorialCita';
import { useTrabajadores } from '../../hooks/useTrabajadores';
import { ROLES } from '../../constants/roles';

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

  // Estados para tipos de cita
  const [tipoCita, setTipoCita] = useState(null);
  const [terapeutasReunion, setTerapeutasReunion] = useState([]);
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

  // Determinar permisos del usuario
  const esTerapeuta = currentUser?.rol?.id === ROLES.TERAPEUTA;
  const puedeVerHistorial = currentUser?.rol?.id === ROLES.ADMINISTRADOR || currentUser?.rol?.id === ROLES.ADMISION;
  const puedeEliminar = currentUser?.rol?.id === ROLES.ADMINISTRADOR || currentUser?.rol?.id === ROLES.ADMISION;

  // Verificar si una hora está disponible
  const verificarDisponibilidad = (fechaString, hora, duracionMinutos) => {
    if (!fechaString || !hora) return true;

    console.log('🔍 Verificando disponibilidad:', {
      fecha: fechaString,
      hora: hora,
      duracion: duracionMinutos,
      tipoCita: tipoCita,
      totalCitas: citas?.length || 0,
      doctorId: formularioCita.doctor_id,
      terapeutaSeleccionado: terapeutaSeleccionado?.id,
      terapeutasReunion: terapeutasReunion,
      modoEdicion: modoEdicion,
      citaEditando: citaEditando ? { id: citaEditando.id, terapeutas: citaEditando.terapeutas } : null
    });

    if (!citas || citas.length === 0) {
      console.log('✅ No hay citas, todas las horas disponibles');
      return true;
    }

    // Obtener los IDs de terapeutas a verificar según el tipo de cita
    let terapeutasIds = [];

    if (tipoCita === 'NORMAL' || tipoCita === 'VISITA_ESCOLAR') {
      const doctorId = formularioCita.doctor_id || terapeutaSeleccionado?.id;
      if (doctorId) {
        terapeutasIds = [parseInt(doctorId)];
      }
      console.log('👨‍⚕️ Doctor ID para validación:', doctorId);
    } else if (tipoCita === 'REUNION_CLINICA') {
      // Para reunión clínica, obtenemos todos los terapeutas seleccionados
      // Primero intentamos desde terapeutasReunion
      terapeutasIds = terapeutasReunion
        .map(t => parseInt(t.terapeuta_id))
        .filter(id => id && !isNaN(id));

      console.log('👥 Terapeutas IDs desde terapeutasReunion:', terapeutasIds);

      // Si no hay terapeutas en el array local, intentamos obtenerlos de formularioCita
      if (terapeutasIds.length === 0 && formularioCita.terapeutas_ids && formularioCita.terapeutas_ids.length > 0) {
        terapeutasIds = formularioCita.terapeutas_ids
          .map(id => parseInt(id))
          .filter(id => id && !isNaN(id));
        console.log('👥 Terapeutas IDs obtenidos de formularioCita.terapeutas_ids:', terapeutasIds);
      }

      // Si estamos en modo edición y aún no hay terapeutas,
      // intentamos obtenerlos de la cita que estamos editando
      if (terapeutasIds.length === 0 && citaEditando) {
        if (citaEditando.terapeutas && citaEditando.terapeutas.length > 0) {
          terapeutasIds = citaEditando.terapeutas
            .map(t => parseInt(t.id_terapeuta || t.terapeuta_id || t.id))
            .filter(id => id && !isNaN(id));
          console.log('👥 Terapeutas IDs obtenidos de citaEditando:', terapeutasIds);
        }
      }

      // Si no hay terapeutas seleccionados aún, permitimos cualquier hora
      if (terapeutasIds.length === 0) {
        console.log('⚠️ REUNION_CLINICA sin terapeutas seleccionados');
        return true;
      }
    }

    // Si no hay terapeutas para verificar, permitir cualquier hora
    if (terapeutasIds.length === 0) {
      console.log('⚠️ No hay terapeutas seleccionados, permitiendo todas las horas');
      return true;
    }

    // Buscar citas que puedan tener conflicto
    console.log('🔎 Buscando conflictos para terapeutas:', terapeutasIds);
    console.log('🔎 Total de citas a revisar:', citas.length);

    const citasDelDia = citas.filter(cita => {
      // Excluir la cita que estamos editando
      if (citaEditando && cita.id === citaEditando.id) {
        console.log('⏭️ Saltando cita que estamos editando:', cita.id);
        return false;
      }

      // Filtrar solo citas del mismo día
      if (cita.fecha !== fechaString) {
        return false;
      }

      // Verificar si la cita involucra a alguno de nuestros terapeutas
      if (cita.tipo_cita === 'NORMAL' || cita.tipo_cita === 'VISITA_ESCOLAR') {
        // Para citas normales o visitas, verificar si el doctor_id está en nuestra lista
        const estaInvolucrado = terapeutasIds.includes(cita.doctor_id);
        console.log(`🔍 Cita NORMAL/VISITA ${cita.id} - Doctor: ${cita.doctor_id} - ¿Involucrado?: ${estaInvolucrado}`);
        return estaInvolucrado;
      } else if (cita.tipo_cita === 'REUNION_CLINICA') {
        // Para reuniones clínicas, verificar si comparten terapeutas
        const terapeutasCita = cita.terapeutas?.map(t =>
          t.id_terapeuta || t.terapeuta_id || t.id
        ).filter(id => id) || [];

        const compartenTerapeuta = terapeutasIds.some(id => terapeutasCita.includes(id));
        console.log(`🔍 Cita REUNION ${cita.id} - Terapeutas: [${terapeutasCita}] - ¿Comparten?: ${compartenTerapeuta}`);
        return compartenTerapeuta;
      }

      return false;
    });

    console.log('📅 Citas del día que podrían tener conflicto:', citasDelDia.length);
    console.log('📅 Detalles de las citas:', citasDelDia.map(c => ({ id: c.id, hora: c.hora_inicio, tipo: c.tipo_cita, doctor_id: c.doctor_id })));

    // Convertir hora seleccionada a minutos
    const [horaH, horaM] = hora.split(':').map(Number);
    const horaInicioMinutos = horaH * 60 + horaM;
    const horaFinMinutos = horaInicioMinutos + parseInt(duracionMinutos || 40);

    // Verificar conflictos
    for (const cita of citasDelDia) {
      const [citaH, citaM] = cita.hora_inicio.split(':').map(Number);
      const citaInicioMinutos = citaH * 60 + citaM;
      const citaFinMinutos = citaInicioMinutos + parseInt(cita.duracion_minutos || 40);

      console.log('⏰ Comparando:', {
        horaSeleccionada: `${hora} (${horaInicioMinutos}-${horaFinMinutos})`,
        citaExistente: `${cita.hora_inicio} (${citaInicioMinutos}-${citaFinMinutos})`,
        paciente: cita.paciente?.nombres || 'N/A',
        terapeutaId: cita.doctor_id || cita.terapeutas?.map(t => t.id_terapeuta)
      });

      // Verificar si hay solapamiento
      if (
        (horaInicioMinutos >= citaInicioMinutos && horaInicioMinutos < citaFinMinutos) ||
        (horaFinMinutos > citaInicioMinutos && horaFinMinutos <= citaFinMinutos) ||
        (horaInicioMinutos <= citaInicioMinutos && horaFinMinutos >= citaFinMinutos)
      ) {
        console.log('❌ CONFLICTO encontrado - hora NO disponible');
        return false; // Hay conflicto
      }
    }

    console.log('✅ Hora disponible');
    return true; // No hay conflictos, hora disponible
  };

  // Generar horas según el día de la semana (igual que en CalendarioSemanal)
  const generarHorasPorFecha = (fechaString, duracion) => {
    if (!fechaString) return [];

    const fecha = new Date(fechaString + 'T00:00:00');
    const diaSemana = fecha.getDay();
    const horas = [];

    // Sábado (6): 8:00 AM a 2:00 PM
    if (diaSemana === 6) {
      let minutos = 8 * 60; // 8:00 AM
      const finMinutos = 14 * 60; // 2:00 PM

      while (minutos < finMinutos) {
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        minutos += 40;
      }
    }
    // Lunes a viernes (1-5)
    else if (diaSemana >= 1 && diaSemana <= 5) {
      // Horario de la mañana: 9:00 AM hasta 12:40 PM (incluido)
      horas.push('09:00', '09:40', '10:20', '11:00', '11:40', '12:20');

      // Horario de la tarde: desde 2:00 PM (14:00) hasta 8:00 PM (20:00)
      let minutos = 14 * 60; // 14:00 PM (2:00 PM)
      const finMinutos = 20 * 60; // 8:00 PM

      while (minutos <= finMinutos) {
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        minutos += 40;
      }
    } else {
      return []; // Domingo, no hay citas
    }

    // Filtrar horas disponibles
    return horas.filter(hora => verificarDisponibilidad(fechaString, hora, duracion));
  };

  // Este useEffect se ejecuta SOLO cuando el modal se abre, no cuando formularioCita cambia
  useEffect(() => {
    if (!open) return;

    console.log('Modal abierto con:', {
      slotSeleccionado,
      formularioCita,
      fechasHoras: formularioCita.fechasHoras
    });

    setQueryPaciente('');
    setTabValue(0);
    setDialogoEliminarAbierto(false);

    // Cargar terapeutas desde formularioCita.terapeutas_ids
    if (formularioCita.terapeutas_ids && formularioCita.terapeutas_ids.length > 0) {
      setTerapeutasReunion(formularioCita.terapeutas_ids.map(id => ({ terapeuta_id: id })));
    } else {
      // Si no hay terapeutas y hay un terapeuta seleccionado (estamos en su agenda),
      // agregarlo como primer terapeuta por defecto
      if (terapeutaSeleccionado?.id && !modoEdicion) {
        setTerapeutasReunion([{ terapeuta_id: terapeutaSeleccionado.id }]);
      } else {
        setTerapeutasReunion([]);
      }
    }

    // Cargar servicios desde formularioCita.servicios_ids
    if (formularioCita.servicios_ids && formularioCita.servicios_ids.length > 0) {
      setServiciosReunion(formularioCita.servicios_ids.map(id => ({ servicio_id: id })));
    } else {
      setServiciosReunion([]);
    }

    // Cargar encargado si es visita escolar
    if (formularioCita.encargado) {
      setEncargadoVisita(formularioCita.encargado);
    } else {
      setEncargadoVisita({ nombre_completo: '', telefono: '', institucion: '' });
    }

    // Cargar firma documento
    setDocumentoFirmado(formularioCita.firma_documento === 1 || formularioCita.firma_documento === true);

    // Asegurar que fechasHoras tenga al menos un elemento
    if (!formularioCita.fechasHoras || formularioCita.fechasHoras.length === 0) {
      onFormularioChange('fechasHoras', [{ fecha: '', horaInicio: '' }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // Solo depende de 'open', no de 'formularioCita'

  // Detectar tipo de cita según motivo_id
  useEffect(() => {
    if (formularioCita.motivo_id && motivos.length > 0) {
      const motivo = motivos.find(m => m.id === parseInt(formularioCita.motivo_id));
      if (motivo && motivo.tipoCita) {
        setTipoCita(motivo.tipoCita.codigo); // Usar el código del tipo: NORMAL, REUNION_CLINICA, VISITA_ESCOLAR
      } else {
        setTipoCita('NORMAL');
      }
    } else {
      setTipoCita(null);
    }
  }, [formularioCita.motivo_id, motivos]);

  // Estado para forzar re-render cuando cambien los terapeutas (para actualizar horas disponibles)
  const [, setForceUpdate] = useState(0);

  // Re-renderizar cuando cambien terapeutas, doctor_id o duración para actualizar horas disponibles
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [terapeutasReunion, formularioCita.doctor_id, formularioCita.duracion]);

  // Funciones para Reunión Clínica
  const agregarTerapeuta = () => setTerapeutasReunion([...terapeutasReunion, { terapeuta_id: '' }]);
  const eliminarTerapeuta = (index) => setTerapeutasReunion(terapeutasReunion.filter((_, i) => i !== index));
  const actualizarTerapeuta = (index, valor) => {
    const nuevos = [...terapeutasReunion];
    nuevos[index].terapeuta_id = parseInt(valor);
    setTerapeutasReunion(nuevos);
  };

  const agregarServicio = () => setServiciosReunion([...serviciosReunion, { servicio_id: '' }]);
  const eliminarServicio = (index) => setServiciosReunion(serviciosReunion.filter((_, i) => i !== index));
  const actualizarServicio = (index, valor) => {
    const nuevos = [...serviciosReunion];
    nuevos[index].servicio_id = parseInt(valor);
    setServiciosReunion(nuevos);
  };

  const handleGuardar = () => {
    let datosGuardar = { ...formularioCita };

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
      // Mantener doctor_id y servicio_id para visita escolar
    }

    onGuardar(datosGuardar);
  };

  const abrirDialogoEliminar = () => setDialogoEliminarAbierto(true);
  const cerrarDialogoEliminar = () => setDialogoEliminarAbierto(false);
  const confirmarEliminar = () => {
    setDialogoEliminarAbierto(false);
    if (onEliminar) onEliminar();
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
                    {esTerapeuta ? 'Ver Cita' : (modoEdicion ? 'Editar Cita' : 'Nueva Cita')}
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
            <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
              <div className="flex px-2">
                <button
                  onClick={() => setTabValue(0)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all duration-200 relative ${
                    tabValue === 0
                      ? 'text-[#7B1FA2]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Detalles
                  {tabValue === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] rounded-full"></div>
                  )}
                </button>
                <button
                  onClick={() => setTabValue(1)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all duration-200 relative ${
                    tabValue === 1
                      ? 'text-[#7B1FA2]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Historial
                  {tabValue === 1 && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] rounded-full"></div>
                  )}
                </button>
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
                    disabled={loadingMotivos || esTerapeuta}
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
                      disabled={esTerapeuta}
                      className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-900
                      focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/20
                      transition-all disabled:opacity-60 disabled:bg-gray-50
                      hover:border-gray-300"
                    />
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  </div>

                  {queryPaciente.length >= 2 && pacientes.length > 0 && (
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
                      {!esTerapeuta && (
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
                          disabled={esTerapeuta}
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
                        disabled={esTerapeuta}
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
                        {!esTerapeuta && !modoEdicion && (
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
                              const fecha = new Date(e.target.value + 'T00:00:00');
                              const diaSemana = fecha.getDay();
                              if (diaSemana >= 1 && diaSemana <= 6) {
                                onFormularioChange('actualizarFechaHora', { index: 0, campo: 'fecha', valor: e.target.value });
                              } else {
                                alert('Solo se pueden agendar citas de lunes a sábado');
                              }
                            }}
                            disabled={esTerapeuta}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all disabled:opacity-50"
                          />
                          <select
                            value={formularioCita.fechasHoras?.[0]?.horaInicio || ''}
                            onChange={(e) => {
                              onFormularioChange('actualizarFechaHora', { index: 0, campo: 'horaInicio', valor: e.target.value });
                            }}
                            disabled={esTerapeuta || !formularioCita.fechasHoras?.[0]?.fecha}
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
                                {!esTerapeuta && formularioCita.fechasHoras.length > 1 && (
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
                                      const fecha = new Date(e.target.value + 'T00:00:00');
                                      const diaSemana = fecha.getDay();
                                      if (diaSemana >= 1 && diaSemana <= 6) {
                                        onFormularioChange('actualizarFechaHora', { index, campo: 'fecha', valor: e.target.value });
                                      } else {
                                        alert('Solo se pueden agendar citas de lunes a sábado');
                                      }
                                    }}
                                    disabled={esTerapeuta}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all disabled:opacity-50"
                                  />
                                  <select
                                    value={fechaHora.horaInicio || ''}
                                    onChange={(e) => {
                                      onFormularioChange('actualizarFechaHora', { index, campo: 'horaInicio', valor: e.target.value });
                                    }}
                                    disabled={esTerapeuta || !fechaHora.fecha}
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
                        disabled={esTerapeuta}
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
                        {!esTerapeuta && (
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
                            // El primer terapeuta (índice 0) es el de la agenda actual y no se puede eliminar ni cambiar
                            const esPrimerTerapeuta = index === 0 && terapeutaSeleccionado?.id;
                            const esDisabled = esTerapeuta || (esPrimerTerapeuta && !modoEdicion);

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
                                {!esTerapeuta && !(esPrimerTerapeuta && !modoEdicion) && (
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
                        {!esTerapeuta && (
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
                                disabled={esTerapeuta}
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
                              {!esTerapeuta && (
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
                        disabled={esTerapeuta}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] disabled:opacity-60"
                      >
                        <option value="">Seleccionar duración...</option>
                        {duraciones.map((duracion) => (
                          <option key={duracion.valor} value={duracion.valor}>{duracion.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Fecha y Hora - IGUAL QUE CITA NORMAL */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          {modoEdicion ? 'Fecha y Hora' : 'Fechas y Horas'} <span className="text-red-500">*</span>
                        </label>
                        {!esTerapeuta && !modoEdicion && (
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
                              const fecha = new Date(e.target.value + 'T00:00:00');
                              const diaSemana = fecha.getDay();
                              if (diaSemana >= 1 && diaSemana <= 6) {
                                onFormularioChange('actualizarFechaHora', { index: 0, campo: 'fecha', valor: e.target.value });
                              } else {
                                alert('Solo se pueden agendar citas de lunes a sábado');
                              }
                            }}
                            disabled={esTerapeuta}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all disabled:opacity-50"
                          />
                          <select
                            value={formularioCita.fechasHoras?.[0]?.horaInicio || ''}
                            onChange={(e) => {
                              onFormularioChange('actualizarFechaHora', { index: 0, campo: 'horaInicio', valor: e.target.value });
                            }}
                            disabled={esTerapeuta || !formularioCita.fechasHoras?.[0]?.fecha}
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
                                {!esTerapeuta && formularioCita.fechasHoras.length > 1 && (
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
                                      const fecha = new Date(e.target.value + 'T00:00:00');
                                      const diaSemana = fecha.getDay();
                                      if (diaSemana >= 1 && diaSemana <= 6) {
                                        onFormularioChange('actualizarFechaHora', { index, campo: 'fecha', valor: e.target.value });
                                      } else {
                                        alert('Solo se pueden agendar citas de lunes a sábado');
                                      }
                                    }}
                                    disabled={esTerapeuta}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all disabled:opacity-50"
                                  />
                                  <select
                                    value={fechaHora.horaInicio || ''}
                                    onChange={(e) => {
                                      onFormularioChange('actualizarFechaHora', { index, campo: 'horaInicio', valor: e.target.value });
                                    }}
                                    disabled={esTerapeuta || !fechaHora.fecha}
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
                        disabled={esTerapeuta}
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
            onChange={(e) => setEncargadoVisita({...encargadoVisita, institucion: e.target.value})}
            disabled={esTerapeuta}
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
            onChange={(e) => setEncargadoVisita({...encargadoVisita, nombre_completo: e.target.value})}
            disabled={esTerapeuta}
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
            onChange={(e) => setEncargadoVisita({...encargadoVisita, telefono: e.target.value})}
            disabled={esTerapeuta}
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
              onChange={(e) => setDocumentoFirmado(e.target.checked)}
              disabled={esTerapeuta}
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
        disabled={esTerapeuta}
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
        disabled={esTerapeuta}
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

    {/* Fechas y Horas - IGUAL QUE CITA NORMAL */}
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold text-gray-700">
          {modoEdicion ? 'Fecha y Hora' : 'Fechas y Horas'} <span className="text-red-500">*</span>
        </label>
        {!esTerapeuta && !modoEdicion && (
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
              const fecha = new Date(e.target.value + 'T00:00:00');
              const diaSemana = fecha.getDay();
              if (diaSemana >= 1 && diaSemana <= 6) {
                onFormularioChange('actualizarFechaHora', { index: 0, campo: 'fecha', valor: e.target.value });
              } else {
                alert('Solo se pueden agendar citas de lunes a sábado');
              }
            }}
            disabled={esTerapeuta}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all disabled:opacity-50"
          />
          <select
            value={formularioCita.fechasHoras?.[0]?.horaInicio || ''}
            onChange={(e) => {
              onFormularioChange('actualizarFechaHora', { index: 0, campo: 'horaInicio', valor: e.target.value });
            }}
            disabled={esTerapeuta || !formularioCita.fechasHoras?.[0]?.fecha}
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
                {!esTerapeuta && formularioCita.fechasHoras.length > 1 && (
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
                      const fecha = new Date(e.target.value + 'T00:00:00');
                      const diaSemana = fecha.getDay();
                      if (diaSemana >= 1 && diaSemana <= 6) {
                        onFormularioChange('actualizarFechaHora', { index, campo: 'fecha', valor: e.target.value });
                      } else {
                        alert('Solo se pueden agendar citas de lunes a sábado');
                      }
                    }}
                    disabled={esTerapeuta}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all disabled:opacity-50"
                  />
                  <select
                    value={fechaHora.horaInicio || ''}
                    onChange={(e) => {
                      onFormularioChange('actualizarFechaHora', { index, campo: 'horaInicio', valor: e.target.value });
                    }}
                    disabled={esTerapeuta || !fechaHora.fecha}
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
        disabled={esTerapeuta}
        rows={2}
        placeholder="Observaciones adicionales..."
        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] resize-none disabled:opacity-60"
      />
    </div>
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
            {modoEdicion && puedeEliminar ? (
              <button
                onClick={abrirDialogoEliminar}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-all shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex gap-2">
              {esTerapeuta ? (
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
                    disabled={guardando}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-semibold text-sm hover:shadow-md transition-all disabled:opacity-50"
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
            <div className="bg-red-50 border-b border-red-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
              </div>
            </div>

            <div className="p-5">
              <p className="text-gray-700 mb-4">¿Está seguro que desea eliminar esta cita? Esta acción no se puede deshacer.</p>
              {citaEditando && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Paciente:</span> {formularioCita.paciente?.nombre_completo || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">Fecha:</span> {formularioCita.fechasHoras?.[0]?.fecha} - {formularioCita.fechasHoras?.[0]?.horaInicio}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-4 flex justify-end gap-2 bg-gray-50">
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
    </>
  );
};

export default ModalAgendarCita;
