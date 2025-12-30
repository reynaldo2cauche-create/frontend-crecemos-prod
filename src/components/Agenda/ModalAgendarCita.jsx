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
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  History
} from 'lucide-react';
import { useBusquedaPacientes } from '../../hooks/useBusquedaPacientes';
import { useServicios } from '../../hooks/useServicios';
import { useMotivosCita } from '../../hooks/useMotivosCita';
import { useHistorialCita } from '../../hooks/useHistorialCita';
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
  guardando = false
}) => {
  const [queryPaciente, setQueryPaciente] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [dialogoEliminarAbierto, setDialogoEliminarAbierto] = useState(false);
  const { pacientes, loading: loadingPacientes, error: errorPacientes } = useBusquedaPacientes(queryPaciente);
  const serviciosApi = useServicios();
  const { motivos, loading: loadingMotivos, error: errorMotivos } = useMotivosCita();

  const puedeVerHistorial = currentUser?.rol?.id === ROLES.ADMINISTRADOR || currentUser?.rol?.id === ROLES.ADMISION;
  const puedeEliminar = currentUser?.rol?.id === ROLES.ADMINISTRADOR || currentUser?.rol?.id === ROLES.ADMISION;
  const puedeEditar = currentUser?.rol?.id === ROLES.ADMINISTRADOR || currentUser?.rol?.id === ROLES.ADMISION;
  const esTerapeuta = currentUser?.rol?.id === ROLES.TERAPEUTA;
  const { historial, loading: loadingHistorial, error: errorHistorial } = useHistorialCita(
    modoEdicion && citaEditando?.id ? citaEditando.id : null
  );

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
      // Lunes a Viernes: 9:00 AM a 8:00 PM
      // Break de 1:00 PM (13:00) a 2:00 PM (14:00)
      // Última cita antes del break: 12:40 PM (puede extenderse hasta 13:10 si es de 50 min)
      // Primera cita después del break: 14:00 PM (2:00 PM) - EXACTAMENTE

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
    }

    return horas;
  };

  useEffect(() => {
    if (open) {
      setQueryPaciente('');
      setTabValue(0);
      setDialogoEliminarAbierto(false);
    }
  }, [open]);

  const abrirDialogoEliminar = () => {
    setDialogoEliminarAbierto(true);
  };

  const cerrarDialogoEliminar = () => {
    setDialogoEliminarAbierto(false);
  };

  const confirmarEliminar = () => {
    setDialogoEliminarAbierto(false);
    if (onEliminar) {
      onEliminar();
    }
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
      case 'CREATE':
        return <Plus className="w-4 h-4" />;
      case 'UPDATE':
        return <Save className="w-4 h-4" />;
      case 'DELETE':
        return <Trash2 className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  const getColorOperacion = (tipo) => {
    switch (tipo) {
      case 'CREATE':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'UPDATE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DELETE':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {esTerapeuta ? 'Ver Cita' : (modoEdicion ? 'Editar Cita' : 'Agendar Nueva Cita')}
                </h2>
                {slotSeleccionado && (
                  <p className="text-white/80 text-sm">
                    {slotSeleccionado.dia} - {slotSeleccionado.hora}
                  </p>
                )}
              </div>
            </div>
            <button 
              onClick={onClose} 
              disabled={guardando}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-all disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          {modoEdicion && puedeVerHistorial && (
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex">
                <button
                  onClick={() => setTabValue(0)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all relative ${
                    tabValue === 0
                      ? 'text-[#7B1FA2] bg-white'
                      : 'text-gray-600 hover:text-[#7B1FA2] hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Detalles
                  {tabValue === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0]"></div>
                  )}
                </button>
                <button
                  onClick={() => setTabValue(1)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all relative ${
                    tabValue === 1
                      ? 'text-[#7B1FA2] bg-white'
                      : 'text-gray-600 hover:text-[#7B1FA2] hover:bg-gray-100'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Historial
                  {tabValue === 1 && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0]"></div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
            {(!modoEdicion || !puedeVerHistorial || tabValue === 0) && (
              <div className="space-y-6">
                {/* Paciente */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Paciente *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar paciente por nombre..."
                      value={queryPaciente}
                      onChange={(e) => setQueryPaciente(e.target.value)}
                      disabled={esTerapeuta}
                      className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all disabled:opacity-50"
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
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-all border-b border-gray-100 last:border-0"
                        >
                          <p className="text-sm font-semibold text-gray-900">
                            {paciente.nombre_completo || paciente.nombre}
                          </p>
                          {paciente.documento && (
                            <p className="text-xs text-gray-600">DNI: {paciente.documento}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {formularioCita.paciente && (
                    <div className="mt-2 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {formularioCita.paciente.nombre_completo}
                          </p>
                        </div>
                      </div>
                      {!esTerapeuta && (
                        <button
                          onClick={() => onFormularioChange('paciente', null)}
                          className="text-blue-600 hover:bg-blue-100 p-1.5 rounded-lg transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Terapeuta */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Terapeuta
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {terapeutaSeleccionado 
                          ? `${terapeutaSeleccionado.nombres || ''} ${terapeutaSeleccionado.apellidos || ''}`.trim()
                          : 'No seleccionado'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Servicio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Servicio *
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

                      // Mapeo de IDs de áreas a nombres
                      const areasMap = {
                        1: 'Infantil y Adolescentes',
                        2: 'Adultos'
                      };

                      // Agrupar servicios por área usando area_id
                      const agrupados = {};
                      lista.forEach(srv => {
                        const areaId = srv.area_id || srv.area?.id;
                        const areaNombre = areasMap[areaId] || 'Otros';

                        if (!agrupados[areaNombre]) {
                          agrupados[areaNombre] = [];
                        }
                        agrupados[areaNombre].push(srv);
                      });

                      // Renderizar los grupos en orden
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

                {/* Motivo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Motivo *
                  </label>
                  <select
                    value={formularioCita.motivo_id || ''}
                    onChange={(e) => onFormularioChange('motivo_id', e.target.value)}
                    disabled={loadingMotivos || esTerapeuta}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">
                      {loadingMotivos ? 'Cargando motivos...' : 'Seleccionar motivo...'}
                    </option>
                    {motivos.map((motivo) => (
                      <option key={motivo.id} value={motivo.id}>
                        {motivo.nombre} - {motivo.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duración */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duración *
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
                      {modoEdicion ? 'Fecha y Hora' : 'Fechas y Horas'} *
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
                          // Solo permitir lunes a viernes (1-5)
                          if (diaSemana >= 1 && diaSemana <= 5) {
                            onFormularioChange('actualizarFechaHora', { index: 0, campo: 'fecha', valor: e.target.value });
                          } else {
                            alert('Solo se pueden agendar citas de lunes a viernes');
                          }
                        }}
                        disabled={esTerapeuta}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all disabled:opacity-50"
                      />
                      <select
                        value={formularioCita.fechasHoras?.[0]?.horaInicio || ''}
                        onChange={(e) => onFormularioChange('actualizarFechaHora', { index: 0, campo: 'horaInicio', valor: e.target.value })}
                        disabled={esTerapeuta || !formularioCita.fechasHoras?.[0]?.fecha || !formularioCita.duracion}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50"
                      >
                        <option value="">
                          {!formularioCita.fechasHoras?.[0]?.fecha ? 'Seleccione una fecha primero' :
                           !formularioCita.duracion ? 'Seleccione una duración primero' :
                           'Seleccionar hora...'}
                        </option>
                        {formularioCita.fechasHoras?.[0]?.fecha && formularioCita.duracion &&
                          generarHorasPorFecha(formularioCita.fechasHoras[0].fecha, parseInt(formularioCita.duracion)).map(hora => (
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
                                  // Solo permitir lunes a viernes (1-5)
                                  if (diaSemana >= 1 && diaSemana <= 5) {
                                    onFormularioChange('actualizarFechaHora', { index, campo: 'fecha', valor: e.target.value });
                                  } else {
                                    alert('Solo se pueden agendar citas de lunes a viernes');
                                  }
                                }}
                                disabled={esTerapeuta}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all disabled:opacity-50"
                              />
                              <select
                                value={fechaHora.horaInicio}
                                onChange={(e) => onFormularioChange('actualizarFechaHora', { index, campo: 'horaInicio', valor: e.target.value })}
                                disabled={esTerapeuta || !fechaHora.fecha || !formularioCita.duracion}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50"
                              >
                                <option value="">
                                  {!fechaHora.fecha ? 'Seleccione una fecha primero' :
                                   !formularioCita.duracion ? 'Seleccione una duración primero' :
                                   'Seleccionar hora...'}
                                </option>
                                {fechaHora.fecha && formularioCita.duracion &&
                                  generarHorasPorFecha(fechaHora.fecha, parseInt(formularioCita.duracion)).map(hora => (
                                    <option key={hora} value={hora}>{hora}</option>
                                  ))
                                }
                              </select>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                          <p className="text-sm text-gray-600 mb-2">No hay fechas programadas</p>
                          {!esTerapeuta && (
                            <button
                              onClick={() => onFormularioChange('agregarFechaHora', null)}
                              className="text-sm font-medium text-[#7B1FA2] hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-all"
                            >
                              Agregar primera fecha
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Nota */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nota
                  </label>
                  <textarea
                    value={formularioCita.nota || ''}
                    onChange={(e) => onFormularioChange('nota', e.target.value)}
                    disabled={esTerapeuta}
                    rows={3}
                    placeholder="Agregue observaciones adicionales..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all resize-none disabled:opacity-50"
                  />
                </div>
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
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-700">{errorHistorial}</p>
                  </div>
                ) : historial.length === 0 ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                    <p className="text-sm text-blue-700">No hay historial disponible para esta cita.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historial.map((item) => (
                      <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getColorOperacion(item.tipo_operacion)}`}>
                            {getIconoOperacion(item.tipo_operacion)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getColorOperacion(item.tipo_operacion)}`}>
                                {item.tipo_operacion}
                              </span>
                              <span className="text-xs text-gray-600">{formatearFechaHistorial(item.fecha_registro)}</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 mb-2">{item.descripcion_cambios}</p>
                            
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-gray-600">Paciente:</span>
                                  <span className="ml-1 font-medium text-gray-900">{item.paciente_nombre}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Terapeuta:</span>
                                  <span className="ml-1 font-medium text-gray-900">{item.doctor_nombre}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Servicio:</span>
                                  <span className="ml-1 font-medium text-gray-900">{item.servicio_nombre}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Motivo:</span>
                                  <span className="ml-1 font-medium text-gray-900">{item.motivo_nombre}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Fecha:</span>
                                  <span className="ml-1 font-medium text-gray-900">{item.fecha}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Hora:</span>
                                  <span className="ml-1 font-medium text-gray-900">{item.hora_inicio} - {item.hora_fin}</span>
                                </div>
                                {item.nota && (
                                  <div className="col-span-2">
                                    <span className="text-gray-600">Nota:</span>
                                    <span className="ml-1 font-medium text-gray-900">{item.nota}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
            {modoEdicion && puedeEliminar ? (
              <button
                onClick={abrirDialogoEliminar}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl font-medium text-sm hover:bg-red-50 transition-all"
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
                  className="px-6 py-2 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all"
                >
                  Cerrar
                </button>
              ) : (
                <>
                  <button
                    onClick={onClose}
                    disabled={guardando}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={onGuardar}
                    disabled={guardando}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-red-50 border-b-2 border-red-200 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                ¿Está seguro que desea eliminar esta cita? Esta acción no se puede deshacer.
              </p>
              
              {citaEditando && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-bold text-gray-900 mb-2">Detalles de la cita:</p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Paciente:</span> {formularioCita.paciente?.nombre_completo || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">Fechas y Horas:</span>
                  </p>
                  {formularioCita.fechasHoras && formularioCita.fechasHoras.length > 0 ? (
                    <div className="ml-4 mt-1">
                      {formularioCita.fechasHoras.map((fechaHora, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          • {fechaHora.fecha} a las {fechaHora.horaInicio}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 ml-4">No hay fechas programadas</p>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end gap-2">
              <button
                onClick={cerrarDialogoEliminar}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium text-sm hover:bg-red-700 hover:shadow-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Cita
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalAgendarCita;