import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  UserCircle, Phone, MapPin, Calendar, FileText, X,
  Clock, Stethoscope, Mail, Home, AlertCircle, Heart, Pill, User, Users,
  Edit2, Trash2, Check, ChevronRight, Grid3x3, List, Eye, EyeOff, Building2
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

// Tarjeta con la vibe de editar-paciente: avatar con ring-4, meta en píldora lila,
// chips de servicio redondos con borde, divisor lila y CTA "Ver ficha →" al hover
const TarjetaPacienteCompacta = ({ paciente, onClick, seleccionado, user }) => {
  const servicios = paciente.servicios || [];
  return (
    <div
      onClick={onClick}
      className={`group relative glass-card cursor-pointer overflow-hidden rounded-2xl ${
        seleccionado ? 'ring-2 ring-[#7B1FA2]' : ''
      }`}
    >
      {/* Orbe glass decorativo */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#7B1FA2]/[0.06] blur-2xl" />

      <div className="relative p-4">
        {/* Cabecera */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] text-base font-bold text-white shadow-lg shadow-purple-500/30 ring-4 ring-purple-100/60 transition-transform group-hover:scale-105">
            {paciente.nombres?.[0]}{paciente.apellido_paterno?.[0]}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-extrabold leading-tight text-gray-900">
              {paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno}
            </h3>
            <div className="mt-1 inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#F5F0FA] px-2.5 py-1 text-[11px] text-gray-600">
              <FileText className="h-3 w-3 flex-shrink-0 text-[#7B1FA2]" />
              <span className="truncate font-semibold text-gray-700">{paciente.numero_documento}</span>
              <span className="h-1 w-1 flex-shrink-0 rounded-full bg-purple-300" />
              <Calendar className="h-3 w-3 flex-shrink-0 text-orange-500" />
              <span className="flex-shrink-0">{calcularEdad(paciente.fecha_nacimiento)}</span>
            </div>
          </div>
        </div>

        {/* Servicios como chips redondos con borde (vibe editar-paciente) */}
        {canViewServiceInfo(user) && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {servicios.length === 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-400">
                Sin servicios
              </span>
            )}
            {servicios.slice(0, 3).map((s, i) => {
              const colors = getEstadoColor(s.estado_nombre);
              return (
                <span
                  key={s.id ?? i}
                  title={`${s.servicio_nombre} · ${s.estado_nombre || 'Sin estado'}`}
                  className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${colors.bg} ${colors.text} ${colors.border}`}
                >
                  <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${colors.dot}`} />
                  <span className="truncate">{s.servicio_nombre}</span>
                </span>
              );
            })}
            {servicios.length > 3 && (
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-500">
                +{servicios.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Pie: convenios + CTA */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-purple-100/60 pt-2.5">
          <ConveniosDisplay pacienteId={paciente.id} />
          <span className={`inline-flex flex-shrink-0 items-center gap-1 text-[11px] font-bold transition-colors ${
            seleccionado ? 'text-[#7B1FA2]' : 'text-gray-400 group-hover:text-[#7B1FA2]'
          }`}>
            Ver ficha
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
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
  const [tab, setTab] = useState('info'); // info | servicios | notas

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

  // Bloquear el scroll del fondo mientras el modal está abierto (evita doble scroll)
  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, []);

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

  // Field estilo fila: etiqueta a la izquierda, valor a la derecha
  const Field = ({ icon: Icon, label, value, iconColor = 'text-gray-400' }) => {
    if (!value) return null;
    return (
      <div className="flex items-start justify-between gap-3 py-1.5 px-2 -mx-2 rounded-lg border-b border-gray-50 last:border-b-0 hover:bg-gray-50/70 transition-colors">
        <span className="text-[13px] text-gray-500 flex-shrink-0">{label}</span>
        <span className="text-[13px] font-semibold text-gray-800 text-right break-words flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${iconColor}`} />
          {value}
        </span>
      </div>
    );
  };

  // Section sin card: encabezado con chip de color + línea degradada + filas
  const Section = ({ title, icon: Icon, color, bgColor, children }) => (
    <div className="group/sec">
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`w-7 h-7 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0 ring-1 ring-black/[0.03] transition-transform group-hover/sec:scale-105`}>
          <Icon className={`w-[15px] h-[15px] ${color}`} />
        </span>
        <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{title}</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-1" />
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

      <div className="modal-detalle-paciente fixed right-0 top-0 bottom-0 w-full sm:max-w-4xl bg-white shadow-2xl z-50 flex flex-col ">
        <div className="relative flex-shrink-0 px-6 py-5 sm:px-8 overflow-hidden border-b border-purple-100/60" style={{ backgroundImage: 'radial-gradient(70% 140% at 100% 0%, rgba(123,31,162,.06) 0%, rgba(123,31,162,0) 60%), linear-gradient(120deg, #ffffff 0%, #fdfbff 60%, #faf6fe 100%)' }}>
          {/* Orbe glass sutil */}
          <div className="pointer-events-none absolute -top-10 right-10 w-32 h-32 rounded-full bg-[#7B1FA2]/[0.06] blur-2xl" />
          {/* Encabezado: avatar + nombre + badges */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-purple-500/30 ring-4 ring-purple-100/70 flex-shrink-0">
                {paciente.nombres?.[0]}{paciente.apellido_paterno?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 break-words leading-tight">
                  {paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno}
                </h1>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mt-0.5">
                  <FileText className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                  <span className="break-words">{paciente.tipo_documento?.nombre}: {paciente.numero_documento}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {(paciente.servicios || []).map((s, idx) => {
                    const colors = getEstadoColor(s.estado_nombre);
                    return (
                      <div key={s.id ?? idx} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${colors.bg} ${colors.border}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                        <span className={`text-[11px] font-bold ${colors.text} uppercase tracking-wide`}>
                          {s.servicio_nombre} - {s.estado_nombre || 'Sin estado'}
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg text-[11px] text-gray-500 font-medium border border-gray-200">
                    <Clock className="w-3 h-3" />
                    {formatearFecha(paciente.fecha_creacion || paciente.created_at)}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => onEditar(paciente.id)}
                title="Visualizar / Editar"
                className="w-9 h-9 rounded-xl bg-purple-50 text-[#7B1FA2] hover:bg-purple-100 flex items-center justify-center transition-all"
              >
                <Eye className="w-4 h-4" />
              </button>
              {isAdministrador(user) && (
                <button
                  onClick={() => setShowConfirm(true)}
                  title="Ocultar paciente"
                  className="w-9 h-9 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 flex items-center justify-center transition-all"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              )}
              {isAdministrador(user) && (
                <button
                  onClick={() => setShowEliminarTotal(true)}
                  title="Eliminar paciente"
                  className="w-9 h-9 rounded-xl bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                title="Cerrar"
                className="w-9 h-9 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tarjetas rápidas: Fecha nac · Sexo · Distrito */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
            <div className="rounded-xl border border-purple-100/70 bg-purple-50/40 p-3 flex items-center gap-2.5 hover:border-purple-200 hover:shadow-md transition-all">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-white to-purple-50 flex items-center justify-center shadow-sm flex-shrink-0 ring-1 ring-purple-100/50">
                <Calendar className="w-4 h-4 text-[#7B1FA2]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 font-medium">Fecha de nacimiento</p>
                <p className="text-sm font-bold text-gray-800 truncate">
                  {paciente.fecha_nacimiento ? formatearFecha(paciente.fecha_nacimiento) : '—'}
                </p>
                <p className="text-[10px] text-gray-400">{calcularEdad(paciente.fecha_nacimiento)}</p>
              </div>
            </div>
            <div className="rounded-xl border border-purple-100/70 bg-purple-50/40 p-3 flex items-center gap-2.5 hover:border-purple-200 hover:shadow-md transition-all">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-white to-purple-50 flex items-center justify-center shadow-sm flex-shrink-0 ring-1 ring-purple-100/50">
                <User className="w-4 h-4 text-[#7B1FA2]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 font-medium">Sexo</p>
                <p className="text-sm font-bold text-gray-800 truncate">{paciente.sexo?.nombre || '—'}</p>
              </div>
            </div>
            <div className="rounded-xl border border-purple-100/70 bg-purple-50/40 p-3 flex items-center gap-2.5 hover:border-purple-200 hover:shadow-md transition-all">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-white to-purple-50 flex items-center justify-center shadow-sm flex-shrink-0 ring-1 ring-purple-100/50">
                <MapPin className="w-4 h-4 text-[#7B1FA2]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 font-medium">Distrito</p>
                <p className="text-sm font-bold text-gray-800 truncate">{paciente.distrito?.nombre || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 sm:px-8 sm:py-6 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 items-start">
            <Section 
              title="Datos Personales" 
              icon={User} 
              color="text-blue-600" 
              bgColor="bg-blue-50"
            >
              <div className="space-y-0.5">
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
                <div className="space-y-0.5">
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
                <div className="space-y-0.5">
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

            {/* Convenios */}
            {conveniosActivos.length > 0 && (
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
              <div className="space-y-0.5">
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
              <div className="space-y-0.5">
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
                <div className="space-y-2.5">
                  {[
                    { ok: paciente.acepta_terminos, label: 'Acepta términos y condiciones de la empresa' },
                    { ok: paciente.acepta_info_comercial, label: 'Autoriza el envío de información comercial' },
                  ].map((c, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${c.ok ? 'bg-gradient-to-r from-[#A3C644]/12 to-[#A3C644]/5 border-[#A3C644]/30' : 'bg-gray-50 border-gray-100'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${c.ok ? 'bg-gradient-to-br from-[#A3C644] to-[#8FB82D]' : 'bg-gray-200'}`}>
                        {c.ok ? <Check className="w-4 h-4 text-white" /> : <X className="w-3.5 h-3.5 text-gray-400" />}
                      </div>
                      <span className={`text-sm font-medium ${c.ok ? 'text-gray-800' : 'text-gray-400'}`}>{c.label}</span>
                      {c.ok && <Check className="w-4 h-4 text-[#A3C644] ml-auto flex-shrink-0" />}
                    </div>
                  ))}
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
    return savedView || 'list';
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
      <div className="flex items-center justify-end mb-3 px-0">
        <div className="flex items-center bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white shadow-sm'
                : 'text-gray-500 hover:text-[#7B1FA2]'
            }`}
            title="Vista de lista"
          >
            <List className="w-4 h-4" />
            Lista
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white shadow-sm'
                : 'text-gray-500 hover:text-[#7B1FA2]'
            }`}
            title="Vista de tarjetas"
          >
            <Grid3x3 className="w-4 h-4" />
            Tarjetas
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
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-purple-100/60 bg-gradient-to-r from-purple-50/60 to-white">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Edad
                  </th>
                  {canViewServiceInfo(user) && (
                    <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Servicios
                    </th>
                  )}
                  {canViewContactInfo(user) && (
                    <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Contacto
                    </th>
                  )}
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Convenios
                  </th>
                  <th className="w-10 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pacientes.map((paciente) => {
                  return (
                    <tr
                      key={paciente.id}
                      onClick={() => handleClickPaciente(paciente)}
                      className={`group cursor-pointer transition-colors hover:bg-purple-50/40 ${
                        pacienteSeleccionadoId === paciente.id
                          ? 'bg-purple-50/60 shadow-[inset_3px_0_0_#7B1FA2]'
                          : ''
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] text-sm font-bold text-white shadow-sm ring-2 ring-purple-100/70 transition-transform group-hover:scale-105">
                            {paciente.nombres?.[0]}{paciente.apellido_paterno?.[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-900">
                              {paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
                            <FileText className="h-3.5 w-3.5 text-blue-500" />
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {paciente.numero_documento}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50">
                            <Calendar className="h-3.5 w-3.5 text-orange-500" />
                          </span>
                          <span className="text-sm text-gray-700">
                            {calcularEdad(paciente.fecha_nacimiento)}
                          </span>
                        </div>
                      </td>
                      {canViewServiceInfo(user) && (
                        <td className="px-4 py-3">
                          {paciente.servicios && paciente.servicios.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {paciente.servicios.map((s, idx) => {
                                const colors = getEstadoColor(s.estado_nombre);
                                return (
                                  <span
                                    key={s.id ?? idx}
                                    title={`${s.servicio_nombre} · ${s.estado_nombre || 'Sin estado'}`}
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${colors.bg} ${colors.text} ${colors.border}`}
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
                        <td className="px-4 py-3">
                          {paciente.celular ? (
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-green-50">
                                <Phone className="h-3.5 w-3.5 text-green-500" />
                              </span>
                              <span className="text-sm text-gray-700">
                                {paciente.celular}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <ConveniosDisplay pacienteId={paciente.id} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight className={`inline h-4 w-4 transition-all ${
                          pacienteSeleccionadoId === paciente.id
                            ? 'text-[#7B1FA2]'
                            : 'text-gray-300 group-hover:translate-x-0.5 group-hover:text-[#7B1FA2]'
                        }`} />
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