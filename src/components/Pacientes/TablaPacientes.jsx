import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  UserCircle, Phone, MapPin, Calendar, FileText, X,
  Clock, Stethoscope, Mail, Home, AlertCircle, Heart, Pill, User, Users,
  Edit2, Trash2, Check, ChevronRight, Grid3x3, List, Eye, Building2
} from 'lucide-react';
import { canViewContactInfo, canViewServiceInfo, canManagePatientStatus, isAdministrador } from '../../constants/roles';
import { cambiarVisibilidadPaciente, eliminarPacienteDeRaiz } from '../../services/pacienteService';
import { API_BASE_URL, SERVER_BASE_URL } from '../../services/api';
import { getConveniosPorPaciente } from '../../services/conveniosService';

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return 'N/A';
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return `${edad} años`;
};

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return 'No especificada';

  try {
    if (typeof fechaStr === 'string' && fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = fechaStr.split('-');
      const fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return `${day} ${monthNames[parseInt(month) - 1]}, ${year}`;
    }

    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) {
      return 'Fecha inválida';
    }

    const day = String(fecha.getDate()).padStart(2, '0');
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const month = monthNames[fecha.getMonth()];
    const year = fecha.getFullYear();
    return `${day} ${month}, ${year}`;
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha inválida';
  }
};

const getEstadoColor = (nombreEstado) => {
  const colorMap = {
    'Nuevo':      { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500'  },
    'Entrevista': { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
    'Evaluacion': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
    'Terapia':    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
    'Inactivo':   { bg: 'bg-gray-50',   text: 'text-gray-500',   border: 'border-gray-200',   dot: 'bg-gray-400'   },
  };
  return colorMap[nombreEstado] || { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-200', dot: 'bg-gray-300' };
};

const ABREVIATURA_SERVICIO = {
  1: 'TL', 2: 'PO', 3: 'TA', 4: 'PI', 5: 'EPC',
  6: 'OV', 7: 'PTI', 8: 'TP', 9: 'TF', 10: 'TLA',
};
const SKIP = new Set(['de','del','la','el','y','en','con','para','a','o']);
const getAbrev = (id, nombre) =>
  ABREVIATURA_SERVICIO[id] ||
  (nombre || '').split(' ').filter(w => w && !SKIP.has(w.toLowerCase())).map(w => w[0]).join('').toUpperCase().slice(0, 3) || '?';

const ServicioChips = ({ servicios }) => {
  if (!servicios?.length) return <span className="text-xs text-gray-400">Sin servicios</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {servicios.map((s, i) => {
        const colors = getEstadoColor(s.estado_nombre);
        return (
          <span
            key={s.id ?? i}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} flex-shrink-0`} />
            {s.servicio_nombre} - {s.estado_nombre || 'Sin estado'}
          </span>
        );
      })}
    </div>
  );
};

// Función para construir la URL del logo igual que en EditarPacientePage
const construirUrlLogo = (logo_url) => {
  if (!logo_url) return null;
  
  // Si la URL ya es completa (http:// o https://)
  if (logo_url.startsWith('http')) {
    return logo_url;
  }
  
  // Si es una ruta relativa (empieza con /)
  if (logo_url.startsWith('/')) {
    return `${API_BASE_URL}/convenios/logo/${logo_url.split('/').pop()}`;
  }
  
  // Si es solo el nombre del archivo
  return `${API_BASE_URL}/convenios/logo/${logo_url}`;
};

// Componente para mostrar logos de convenios
const ConveniosDisplay = ({ pacienteId, convenios: propConvenios }) => {
  const [convenios, setConvenios] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarConvenios = async () => {
      if (!pacienteId) {
        setConvenios([]);
        return;
      }

      try {
        setLoading(true);
        const data = await getConveniosPorPaciente(pacienteId);
        setConvenios(data || []);
      } catch (error) {
        console.error('Error al cargar convenios:', error);
        setConvenios([]);
      } finally {
        setLoading(false);
      }
    };

    cargarConvenios();
  }, [pacienteId]);

  if (loading) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-[#7B1FA2] rounded-full animate-spin"></div>
        <span className="text-xs text-gray-400">Cargando...</span>
      </div>
    );
  }

  // Solo mostrar convenios activos
  const conveniosActivos = convenios.filter(c => c.activo === true || c.activo === 1 || c.activo === 'ACTIVO');

  if (conveniosActivos.length === 0) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400">Sin convenios</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {conveniosActivos.slice(0, 3).map((pc, idx) => {
        // Extraer el objeto convenio de la relación paciente-convenio
        const convenio = pc.convenio || pc;
        const logoUrl = construirUrlLogo(convenio.logo_url);
        const nombreConvenio = convenio.empresa || convenio.nombre || 'Convenio';
        
        return (
          <div
            key={idx}
            className="relative group"
            title={nombreConvenio}
          >
            <div className="w-8 h-8 rounded-full border-2 border-[#7B1FA2] overflow-hidden bg-white flex items-center justify-center">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={nombreConvenio}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.parentElement.querySelector('.fallback-logo');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`fallback-logo absolute inset-0 ${logoUrl ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A]`}>
                <Building2 className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white bg-green-500" />
          </div>
        );
      })}
      
      {conveniosActivos.length > 3 && (
        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center">
          <span className="text-xs font-medium text-gray-600">+{conveniosActivos.length - 3}</span>
        </div>
      )}
    </div>
  );
};

// Tarjeta minimalista con colores balanceados
const TarjetaPacienteCompacta = ({ paciente, onClick, seleccionado, user }) => {
  return (
    <div
      onClick={onClick}
      className={`
        group relative bg-white rounded-xl p-4 cursor-pointer
        transition-all duration-200 border
        ${seleccionado 
          ? 'border-[#A3C644] shadow-md' 
          : 'border-gray-200 hover:border-[#A3C644]/50 hover:shadow-sm'
        }
      `}
    >
      {seleccionado && (
        <div className="absolute -left-0.5 top-4 bottom-4 w-1 bg-[#A3C644] rounded-r-full" />
      )}

      <div className="flex items-start gap-3">
        <div className={`
          flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm transition-all
          ${seleccionado 
            ? 'bg-gradient-to-br from-[#9C27B0] to-[#BA68C8]' 
            : 'bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A]'
          }
        `}>
          {paciente.nombres?.[0]}{paciente.apellido_paterno?.[0]}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <h3 className="font-bold text-gray-900 text-sm leading-tight">
              {paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno}
            </h3>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <FileText className="w-3 h-3 flex-shrink-0 text-blue-500" />
              <span className="font-medium">{paciente.numero_documento}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <Calendar className="w-3 h-3 flex-shrink-0 text-orange-500" />
              <span>{calcularEdad(paciente.fecha_nacimiento)}</span>
            </div>

            {canViewServiceInfo(user) && (
              <div className="mt-1">
                <ServicioChips servicios={paciente.servicios} />
              </div>
            )}

            {/* Convenios en vista tarjeta */}
            <div className="mt-1">
              <ConveniosDisplay pacienteId={paciente.id} />
            </div>
          </div>
        </div>

        <ChevronRight className={`
          w-4 h-4 flex-shrink-0 transition-all
          ${seleccionado ? 'text-[#A3C644]' : 'text-gray-300 group-hover:text-[#A3C644]'}
        `} />
      </div>
    </div>
  );
};

// Modal lateral con más variedad de colores
const ModalDetallesPaciente = ({ paciente, onClose, onEditar, user, onPacienteOcultado }) => {
  const [ocultando, setOcultando] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [convenios, setConvenios] = useState([]);
  const [loadingConvenios, setLoadingConvenios] = useState(false);

  // Eliminación total (permanente) — solo administrador
  const [showEliminarTotal, setShowEliminarTotal] = useState(false);
  const [eliminandoTotal, setEliminandoTotal] = useState(false);
  const [resultadoEliminar, setResultadoEliminar] = useState(null); // { tipo: 'success' | 'error', mensaje }

  const handleEliminarDeRaiz = async () => {
    setEliminandoTotal(true);
    try {
      await eliminarPacienteDeRaiz(paciente.id);
      setShowEliminarTotal(false);
      setResultadoEliminar({
        tipo: 'success',
        mensaje: `Se eliminó por completo a ${paciente.nombres} ${paciente.apellido_paterno}. Se notificó por correo a info@crecemos.com.pe y rrhh@crecemos.com.pe.`,
      });
    } catch (error) {
      console.error('Error al eliminar al paciente:', error);
      setResultadoEliminar({
        tipo: 'error',
        mensaje: error?.response?.data?.message || 'No se pudo eliminar al paciente. Inténtalo de nuevo.',
      });
    } finally {
      setEliminandoTotal(false);
    }
  };

  const cerrarResultadoEliminar = () => {
    const fueExito = resultadoEliminar?.tipo === 'success';
    setResultadoEliminar(null);
    if (fueExito) {
      if (onPacienteOcultado) {
        onPacienteOcultado(paciente.id);
      }
      onClose();
    }
  };

  useEffect(() => {
    const cargarConvenios = async () => {
      if (!paciente.id) return;
      
      try {
        setLoadingConvenios(true);
        const data = await getConveniosPorPaciente(paciente.id);
        setConvenios(data || []);
      } catch (error) {
        console.error('Error al cargar convenios:', error);
        setConvenios([]);
      } finally {
        setLoadingConvenios(false);
      }
    };

    cargarConvenios();
  }, [paciente.id]);

  const handleOcultar = async () => {
    setOcultando(true);
    try {
      await cambiarVisibilidadPaciente(paciente.id, false, user.id);
      if (onPacienteOcultado) {
        onPacienteOcultado(paciente.id);
      }
      onClose();
    } catch (error) {
      console.error('Error al ocultar paciente:', error);
    } finally {
      setOcultando(false);
    }
  };

  // Componente Field con iconos de colores
  const Field = ({ icon: Icon, label, value, iconColor = 'text-gray-400' }) => {
    if (!value) return null;
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
          {label}
        </label>
        <div className="py-2.5 px-3 text-sm text-gray-900 font-medium bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-2">
          <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
          <span className="break-words">{value}</span>
        </div>
      </div>
    );
  };

  // Section con colores variados
  const Section = ({ title, icon: Icon, color, bgColor, children }) => (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
      </div>
      <div>
        {children}
      </div>
    </div>
  );

  // Solo convenios activos
  const conveniosActivos = convenios.filter(c => c.activo);

  return ReactDOM.createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="modal-detalle-paciente fixed right-0 top-0 bottom-0 w-full sm:max-w-2xl bg-white shadow-xl z-50 flex flex-col ">
        <div className="flex-shrink-0 bg-gradient-to-r from-[#7B1FA2] via-[#8E24AA] to-[#AB47BC] px-8 py-4 sm:px-10 sm:py-6">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-sm">
                  {paciente.nombres?.[0]}{paciente.apellido_paterno?.[0]}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-1.5 break-words leading-tight">
                  {paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-white/90">
                  <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                  <span className="break-words">{paciente.tipo_documento?.nombre}: {paciente.numero_documento}</span>
                  {paciente.servicio && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-white/60 flex-shrink-0"></span>
                      <span className="font-medium break-words">{paciente.servicio.nombre}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {(paciente.servicios || []).length > 0 ? (
              (paciente.servicios).map((s, idx) => {
                const colors = getEstadoColor(s.estado_nombre);
                return (
                  <div key={s.id ?? idx} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-white/95 ${colors.border}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                    <span className={`text-xs font-semibold ${colors.text} uppercase tracking-wide`}>
                      {s.servicio_nombre} - {s.estado_nombre || 'Sin estado'}
                    </span>
                  </div>
                );
              })
            ) : null}

            <div className="px-3.5 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-xs text-white font-medium border border-white/30 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {formatearFecha(paciente.fecha_creacion || paciente.created_at)}
            </div>
          </div>

        
        </div>

        <div className="flex-shrink-0 px-8 sm:px-10 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center gap-2">
          <button
            onClick={() => onEditar(paciente.id)}
            className="flex items-center gap-2 bg-[#A3C644] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all shadow-sm"
          >
            <Edit2 className="w-4 h-4" />
            Visualizar
          </button>

          {isAdministrador(user) && (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg border border-red-200 text-sm font-medium hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Ocultar
            </button>
          )}

          {isAdministrador(user) && (
            <button
              onClick={() => setShowEliminarTotal(true)}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg border border-red-700 text-sm font-medium hover:bg-red-700 transition-all"
              title="Eliminar permanentemente al paciente y su historia clínica (a solicitud del paciente)"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-12 py-8 sm:px-16 sm:py-10 space-y-8 sm:space-y-10">
            <Section 
              title="Datos Personales" 
              icon={User} 
              color="text-blue-600" 
              bgColor="bg-blue-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Field
                  icon={Calendar}
                  label="Fecha de Nacimiento"
                  value={paciente.fecha_nacimiento ? formatearFecha(paciente.fecha_nacimiento) : null}
                  iconColor="text-blue-500"
                />
                <Field icon={User} label="Sexo" value={paciente.sexo?.nombre} iconColor="text-blue-500" />
                <Field icon={Calendar} label="Edad" value={calcularEdad(paciente.fecha_nacimiento)} iconColor="text-blue-500" />
              </div>
            </Section>

            {canViewContactInfo(user) && (
              <Section 
                title="Contacto" 
                icon={Phone} 
                color="text-green-600" 
                bgColor="bg-green-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <Field icon={Phone} label="Celular Principal" value={paciente.celular} iconColor="text-green-500" />
                  <Field icon={Phone} label="Celular Secundario" value={paciente.celular2} iconColor="text-green-500" />
                  <Field icon={Mail} label="Correo Electrónico" value={paciente.correo} iconColor="text-green-500" />
                  <Field icon={MapPin} label="Distrito" value={paciente.distrito?.nombre} iconColor="text-green-500" />
                  {paciente.direccion && (
                    <div className="md:col-span-2">
                      <Field icon={Home} label="Dirección Completa" value={paciente.direccion} iconColor="text-green-500" />
                    </div>
                  )}
                </div>
              </Section>
            )}

            {paciente.responsable_nombre && (
              <Section 
                title="Datos del Responsable" 
                icon={Users} 
                color="text-orange-600" 
                bgColor="bg-orange-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <div className="md:col-span-2">
                    <Field 
                      icon={User} 
                      label="Nombre Completo" 
                      value={`${paciente.responsable_nombre} ${paciente.responsable_apellido_paterno} ${paciente.responsable_apellido_materno}`}
                      iconColor="text-orange-500"
                    />
                  </div>
                  <Field icon={Users} label="Relación" value={paciente.responsable_relacion?.nombre} iconColor="text-orange-500" />
                  {canViewContactInfo(user) && (
                    <>
                      <Field icon={Phone} label="Teléfono" value={paciente.responsable_telefono} iconColor="text-orange-500" />
                      <Field 
                        icon={FileText} 
                        label="Documento" 
                        value={paciente.responsable_numero_documento ? `${paciente.responsable_tipo_documento?.nombre} - ${paciente.responsable_numero_documento}` : null}
                        iconColor="text-orange-500"
                      />
                      <Field icon={Mail} label="Correo" value={paciente.responsable_email} iconColor="text-orange-500" />
                    </>
                  )}
                </div>
              </Section>
            )}

            {/* Convenios - Morado */}
            {loadingConvenios ? (
              <div className="py-8 text-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Cargando convenios...</p>
              </div>
            ) : conveniosActivos.length > 0 && (
              <Section 
                title="Convenios" 
                icon={Building2} 
                color="text-[#7B1FA2]" 
                bgColor="bg-[#7B1FA2]/10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {conveniosActivos.map((pc, idx) => {
                    const convenio = pc.convenio || pc;
                    const logoUrl = construirUrlLogo(convenio.logo_url);
                    const nombreConvenio = convenio.empresa || convenio.nombre || 'Convenio';

                    return (
                      <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col items-center gap-2">
                        <div className="relative w-16 h-16 rounded-full border-2 border-[#7B1FA2] overflow-hidden bg-white flex items-center justify-center">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt={nombreConvenio}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const fallback = e.target.parentElement.querySelector('.fallback-logo');
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`fallback-logo absolute inset-0 ${logoUrl ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A]`}>
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">
                            {nombreConvenio}
                          </p>
                         
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            <Section 
              title="Información Médica" 
              icon={Heart} 
              color="text-red-600" 
              bgColor="bg-red-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {paciente.diagnostico_medico && (
                  <div className="md:col-span-2">
                    <Field icon={Stethoscope} label="Diagnóstico Médico" value={paciente.diagnostico_medico} iconColor="text-red-500" />
                  </div>
                )}
                <Field icon={AlertCircle} label="Alergias Conocidas" value={paciente.alergias || 'Ninguna conocida'} iconColor="text-red-500" />
                <Field icon={Pill} label="Medicamentos Actuales" value={paciente.medicamentos_actuales || 'Ninguno'} iconColor="text-red-500" />
              </div>
            </Section>

            <Section 
              title="Información Adicional" 
              icon={FileText} 
              color="text-purple-600" 
              bgColor="bg-purple-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Field icon={FileText} label="Motivo de Consulta" value={paciente.motivo_consulta} iconColor="text-purple-500" />
                <Field icon={Users} label="Referido Por" value={paciente.referido_por} iconColor="text-purple-500" />
              </div>
            </Section>

            {canViewContactInfo(user) && (
              <Section 
                title="Consentimientos" 
                icon={Check} 
                color="text-[#A3C644]" 
                bgColor="bg-[#A3C644]/10"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${paciente.acepta_terminos ? 'bg-[#A3C644] border-[#A3C644]' : 'border-gray-300'}`}>
                      {paciente.acepta_terminos && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">Acepta términos y condiciones de la empresa</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${paciente.acepta_info_comercial ? 'bg-[#A3C644] border-[#A3C644]' : 'border-gray-300'}`}>
                      {paciente.acepta_info_comercial && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">Autoriza el envío de información comercial</span>
                  </div>
                </div>
              </Section>
            )}
          </div>
        </div>
      </div>

      {showConfirm && (
        <div 
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]"
          onClick={() => setShowConfirm(false)}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar Ocultación</h3>
            <p className="text-sm text-gray-600 mb-4">
              ¿Estás seguro de que deseas ocultar al paciente <strong>{paciente.nombres} {paciente.apellido_paterno}</strong>?
              <br /><br />
              <strong>Nota:</strong> Esta acción ocultará al paciente de la lista principal, pero no eliminará sus datos del sistema.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={ocultando}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleOcultar}
                disabled={ocultando}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {ocultando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Ocultando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Ocultar Paciente
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEliminarTotal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          onClick={() => !eliminandoTotal && setShowEliminarTotal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Eliminar paciente</h3>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-800">
                Se eliminará <strong>de forma permanente e irreversible</strong> a:
              </p>
              <p className="text-sm font-bold text-gray-900 mt-2">
                {paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno}
              </p>
              <p className="text-sm text-gray-700">
                {paciente.tipo_documento?.nombre || 'Documento'}: <strong>{paciente.numero_documento}</strong>
              </p>
              <p className="text-xs text-red-700 mt-2">
                Incluye su historia clínica, citas, ventas/pagos, archivos y todo lo relacionado en el sistema.
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Se enviará un correo informativo a <strong>info@crecemos.com.pe</strong> y <strong>rrhh@crecemos.com.pe</strong>{' '}
              indicando que se eliminó toda la información del paciente del sistema <strong>a solicitud del paciente</strong>.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowEliminarTotal(false)}
                disabled={eliminandoTotal}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarDeRaiz}
                disabled={eliminandoTotal}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {eliminandoTotal ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {resultadoEliminar && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4"
          onClick={cerrarResultadoEliminar}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-100 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                resultadoEliminar.tipo === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {resultadoEliminar.tipo === 'success' ? (
                <Check className="w-7 h-7 text-green-600" />
              ) : (
                <AlertCircle className="w-7 h-7 text-red-600" />
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {resultadoEliminar.tipo === 'success' ? 'Paciente eliminado' : 'No se pudo eliminar'}
            </h3>
            <p className="text-sm text-gray-600 mb-5">{resultadoEliminar.mensaje}</p>
            <button
              onClick={cerrarResultadoEliminar}
              className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all ${
                resultadoEliminar.tipo === 'success'
                  ? 'bg-[#A3C644] hover:bg-[#8FB82D]'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

// Componente principal
const TarjetasPacientes = ({ pacientes, pacienteSeleccionadoId, onSelect, onEditar, user, emptyMessage, onPacienteOcultado }) => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    const savedView = localStorage.getItem('pacientes_viewMode');
    return savedView || 'grid';
  });

  useEffect(() => {
    localStorage.setItem('pacientes_viewMode', viewMode);
  }, [viewMode]);

  const handleClickPaciente = (paciente) => {
    setPacienteSeleccionado(paciente);
    setModalAbierto(true);
    if (onSelect) {
      onSelect(paciente);
    }
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setTimeout(() => setPacienteSeleccionado(null), 300);
  };

  if (pacientes.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
        <div className="w-16 h-16 bg-gradient-to-br from-[#9C27B0] to-[#BA68C8] opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCircle className="w-8 h-8 text-gray-600" />
        </div>
        <p className="text-gray-600 font-medium text-base mb-1">{emptyMessage || 'No se encontraron pacientes'}</p>
        <p className="text-gray-400 text-sm">Ajusta los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end mb-4 px-0">
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-[#7B1FA2] shadow-sm'
                : 'text-gray-600 hover:text-[#7B1FA2]'
            }`}
            title="Vista de tarjetas"
          >
            <Grid3x3 className="w-4 h-4" />
            Tarjetas
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-white text-[#7B1FA2] shadow-sm'
                : 'text-gray-600 hover:text-[#7B1FA2]'
            }`}
            title="Vista de lista"
          >
            <List className="w-4 h-4" />
            Lista
          </button>
        </div>
      </div>

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {pacientes.map((paciente) => (
            <TarjetaPacienteCompacta
              key={paciente.id}
              paciente={paciente}
              onClick={() => handleClickPaciente(paciente)}
              seleccionado={pacienteSeleccionadoId === paciente.id}
              user={user}
            />
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto -mx-4 md:-mx-16">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Edad
                  </th>
                  {canViewServiceInfo(user) && (
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Servicios
                    </th>
                  )}
                  {canViewContactInfo(user) && (
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Contacto
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Convenios
                  </th>

                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pacientes.map((paciente) => {
                  return (
                    <tr
                      key={paciente.id}
                      onClick={() => handleClickPaciente(paciente)}
                      className={`hover:bg-gray-50 transition-colors group cursor-pointer ${
                        pacienteSeleccionadoId === paciente.id ? 'bg-[#A3C644]/5' : ''
                      }`}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                            pacienteSeleccionadoId === paciente.id
                              ? 'bg-gradient-to-br from-[#9C27B0] to-[#BA68C8]'
                              : 'bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A]'
                          }`}>
                            {paciente.nombres?.[0]}{paciente.apellido_paterno?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="text-sm text-gray-900 font-medium">
                            {paciente.numero_documento}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            {calcularEdad(paciente.fecha_nacimiento)}
                          </span>
                        </div>
                      </td>
                      {canViewServiceInfo(user) && (
                        <td className="px-4 py-4">
                          {paciente.servicios && paciente.servicios.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {paciente.servicios.map((s, idx) => {
                                const colors = getEstadoColor(s.estado_nombre);
                                return (
                                  <span
                                    key={s.id ?? idx}
                                    title={`${s.servicio_nombre} · ${s.estado_nombre || 'Sin estado'}`}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} flex-shrink-0`} />
                                    {s.servicio_nombre} - {s.estado_nombre || 'Sin estado'}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                      )}
                      {canViewContactInfo(user) && (
                        <td className="px-4 py-4">
                          {paciente.celular ? (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-gray-700">
                                {paciente.celular}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-4">
                        <ConveniosDisplay pacienteId={paciente.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalAbierto && pacienteSeleccionado && (
        <ModalDetallesPaciente
          paciente={pacienteSeleccionado}
          onClose={handleCerrarModal}
          onEditar={onEditar}
          user={user}
          onPacienteOcultado={(id) => {
            if (onPacienteOcultado) {
              onPacienteOcultado(id);
            }
            handleCerrarModal();
          }}
        />
      )}
    </>
  );
};

export default TarjetasPacientes;