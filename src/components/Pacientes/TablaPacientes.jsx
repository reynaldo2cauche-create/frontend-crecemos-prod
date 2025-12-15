import React, { useState, useEffect } from 'react';
import {
  UserCircle, Phone, MapPin, Calendar, FileText, X,
  Clock, Stethoscope, Mail, Home, AlertCircle, Heart, Pill, User, Users,
  Edit2, Trash2, Check, ChevronRight, Grid3x3, List, Eye
} from 'lucide-react';
import { canViewContactInfo, canViewServiceInfo, canManagePatientStatus, isAdministrador } from '../../constants/roles';
import { cambiarVisibilidadPaciente } from '../../services/pacienteService';

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
    // Si la fecha está en formato yyyy-mm-dd
    if (typeof fechaStr === 'string' && fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = fechaStr.split('-');
      const fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return `${day} ${monthNames[parseInt(month) - 1]}, ${year}`;
    }

    // Si la fecha viene como timestamp
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
    'Nuevo': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
    'Entrevista': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    'Evaluacion': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
    'Terapia': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
    'Inactivo': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500' }
  };
  return colorMap[nombreEstado] || colorMap['Inactivo'];
};

// Tarjeta minimalista con colores balanceados
const TarjetaPacienteCompacta = ({ paciente, onClick, seleccionado, user }) => {
  const estadoColors = getEstadoColor(paciente.estado?.nombre);
  
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
      {/* Barra lateral de selección - VERDE LIMA */}
      {seleccionado && (
        <div className="absolute -left-0.5 top-4 bottom-4 w-1 bg-[#A3C644] rounded-r-full" />
      )}

      <div className="flex items-start gap-3">
        {/* Avatar - morado elegante cuando seleccionado */}
        <div className={`
          flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm transition-all
          ${seleccionado 
            ? 'bg-gradient-to-br from-[#9C27B0] to-[#BA68C8]' 
            : 'bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A]'
          }
        `}>
          {paciente.nombres?.[0]}{paciente.apellido_paterno?.[0]}
        </div>
        
        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-gray-900 text-sm leading-tight">
              {paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno}
            </h3>
            
            {/* Estado badge - mantener colores originales */}
            <div className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-lg border flex-shrink-0
              ${estadoColors.bg} ${estadoColors.border}
            `}>
              <div className={`w-1.5 h-1.5 rounded-full ${estadoColors.dot}`} />
              <span className={`text-[10px] font-semibold ${estadoColors.text} uppercase tracking-wide`}>
                {paciente.estado?.nombre}
              </span>
            </div>
          </div>

          {/* Info secundaria con iconos de colores */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <FileText className="w-3 h-3 flex-shrink-0 text-blue-500" />
              <span className="font-medium">{paciente.numero_documento}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <Calendar className="w-3 h-3 flex-shrink-0 text-orange-500" />
              <span>{calcularEdad(paciente.fecha_nacimiento)}</span>
            </div>
            
            {canViewServiceInfo(user) && paciente.servicio && (
              <div className="flex items-center gap-2 text-xs">
                <Stethoscope className="w-3 h-3 flex-shrink-0 text-[#A3C644]" />
                <span className="font-medium text-gray-700 truncate">{paciente.servicio.nombre}</span>
              </div>
            )}
          </div>
        </div>

        {/* Indicador chevron - verde lima */}
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
  const estadoColors = getEstadoColor(paciente.estado?.nombre);

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
      <div className="pl-11">
        {children}
      </div>
    </div>
  );

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel lateral */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-2xl bg-white shadow-xl z-50 overflow-hidden flex flex-col px-0">
        {/* Header con gradiente morado suave */}
        <div className="flex-shrink-0 bg-gradient-to-r from-[#7B1FA2] via-[#8E24AA] to-[#AB47BC] p-4 sm:p-6">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              {/* Avatar */}
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
            
            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Estado y badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className={`
              flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border bg-white/95
              ${estadoColors.border}
            `}>
              <div className={`w-1.5 h-1.5 rounded-full ${estadoColors.dot}`} />
              <span className={`text-xs font-semibold ${estadoColors.text} uppercase tracking-wide`}>
                {paciente.estado?.nombre}
              </span>
            </div>
            
            <div className="px-3.5 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-xs text-white font-medium border border-white/30 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {formatearFecha(paciente.fecha_creacion || paciente.created_at)}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center gap-2">
          <button
            onClick={() => onEditar(paciente.id)}
            className="flex items-center gap-2 bg-[#A3C644] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all shadow-sm"
          >
            <Edit2 className="w-4 h-4" />
            Editar
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
        </div>

        {/* Contenido scrolleable con colores variados */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-8 sm:space-y-10">
            {/* Datos Personales - Azul */}
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

            {/* Información de Contacto - Verde */}
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

            {/* Responsable - Naranja */}
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

            {/* Información Médica - Rojo */}
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

            {/* Información Adicional - Morado */}
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

            {/* Consentimientos - Verde Lima */}
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

      {/* Modal de confirmación */}
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
    </>
  );
};

// Componente principal
const TarjetasPacientes = ({ pacientes, pacienteSeleccionadoId, onSelect, onEditar, user, emptyMessage, onPacienteOcultado }) => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  // Cargar preferencia de vista desde localStorage
  const [viewMode, setViewMode] = useState(() => {
    const savedView = localStorage.getItem('pacientes_viewMode');
    return savedView || 'grid'; // Por defecto 'grid'
  });

  // Guardar preferencia cuando cambie el viewMode
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
      {/* Botones de cambio de vista */}
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

      {/* Vista de Tarjetas */}
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

     {/* Vista de Lista */}
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
                Servicio
              </th>
            )}
            {canViewContactInfo(user) && (
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Contacto
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {pacientes.map((paciente) => {
            const estadoColors = getEstadoColor(paciente.estado?.nombre);

            return (
              <tr
                key={paciente.id}
                className={`hover:bg-gray-50 transition-colors group ${
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
                    {paciente.servicio ? (
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-[#A3C644] flex-shrink-0" />
                        <span className="text-sm text-gray-700">
                          {paciente.servicio.nombre}
                        </span>
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
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${estadoColors.bg} ${estadoColors.border}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${estadoColors.dot}`} />
                    <span className={`text-xs font-semibold ${estadoColors.text} uppercase tracking-wide`}>
                      {paciente.estado?.nombre}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleClickPaciente(paciente)}
                      className="p-2 text-[#7B1FA2] hover:bg-purple-50 rounded-lg transition-all"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        handleClickPaciente(paciente);
                        setTimeout(() => onEditar(paciente.id), 100);
                      }}
                      className="p-2 text-[#A3C644] hover:bg-green-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
)}

      {/* Modal lateral */}
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