import React, { useState, useEffect } from 'react';
import { 
  User, Phone, MapPin, Mail, Calendar, FileText, Heart, Pill, AlertCircle, 
  Save, X, Edit2, Trash2, Plus, ShieldAlert, Clock, CheckCircle, XCircle 
} from 'lucide-react';
import { ROLES } from '../../constants/roles';
import ResponsablesSection from './ResponsablesSection';

const formatPeruDateTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    if (dateString.includes('T') && dateString.endsWith('Z')) {
      const date = new Date(dateString);
      date.setHours(date.getHours() + 5);
      return date.toLocaleDateString('es-PE', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    const [datePart, timePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hours, minutes, seconds] = timePart.split(':');
    
    const date = new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours) + 5,
      parseInt(minutes),
      parseInt(seconds)
    ));
    
    return date.toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Lima'
    });
    
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Error en fecha';
  }
};

const FormField = ({ icon: Icon, label, value, displayValue, name, type = 'text', editable, onChange, error, iconColor = 'text-[#7B1FA2]', options = null }) => (
  <div>
    <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-2.5">
      <Icon className={`w-4 h-4 ${iconColor}`} />
      {label}
    </label>
    {editable ? (
      <>
        {options ? (
          <div className="relative">
            <select
              name={name}
              value={value || ''}
              onChange={onChange}
              className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none transition-all bg-white text-gray-900 appearance-none cursor-pointer ${
                error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#7B1FA2]'
              }`}
            >
              <option value="">Seleccionar {label.toLowerCase()}</option>
              {options.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.nombre}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        ) : (
          <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none transition-all bg-white text-gray-900 ${
              error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#7B1FA2]'
            }`}
            placeholder={`Ingresa ${label.toLowerCase()}`}
          />
        )}
        {error && (
          <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </>
    ) : (
      <div className="py-3 px-4 text-sm text-gray-900 bg-gray-50 rounded-xl border border-gray-100">
        {displayValue || value || '-'}
      </div>
    )}
  </div>
);

const Section = ({ icon: Icon, title, iconColor = 'text-[#7B1FA2]', bgColor = 'bg-[#7B1FA2]/5', children }) => (
  <div className="mb-10">
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
      <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
);

const FiliacionView = ({
  paciente,
  setPaciente,
  handleSubmit,
  saving,
  generos,
  distritos,
  tiposDocumento,
  setOpenAsignarServicio,
  setServicioAEditar,
  setNuevoTerapeuta,
  setOpenEditarTerapeuta,
  setModalEliminarServicio,
  user
}) => {
  const [localPacienteData, setLocalPacienteData] = useState(paciente);
  const [modoEdicion, setModoEdicion] = useState(false);
  
  // ✅ ESTADOS PARA LOS MODALES (dentro del componente)
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const puedeEditarPaciente = user?.rol?.id === ROLES.ADMINISTRADOR;
  const puedeGestionarServicios = user?.rol?.id === ROLES.ADMINISTRADOR || user?.rol?.id === ROLES.ADMISION;
  const esAdmision = user?.rol?.id === ROLES.ADMISION;
  const esTerapeuta = user?.rol?.id === ROLES.TERAPEUTA;

  useEffect(() => {
    // Normalizar la fecha de nacimiento al formato YYYY-MM-DD para evitar problemas de timezone
    if (paciente) {
      setLocalPacienteData({
        ...paciente,
        fecha_nacimiento: paciente.fecha_nacimiento
          ? paciente.fecha_nacimiento.split('T')[0]
          : paciente.fecha_nacimiento
      });
    }
  }, [paciente]);

  const handleLocalChange = (e) => {
    const { name, value } = e.target;
    setLocalPacienteData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    console.log('🔄 handleSelectChange:', name, value);
    setLocalPacienteData(prev => ({
      ...prev,
      [name]: { id: parseInt(value) }
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleSubmit(e, localPacienteData);
      setModoEdicion(false);
    } catch (error) {
      console.error('❌ Error al guardar:', error);
    }
  };

  const handleCancelar = () => {
    // Normalizar la fecha de nacimiento al formato YYYY-MM-DD para evitar problemas de timezone
    setLocalPacienteData({
      ...paciente,
      fecha_nacimiento: paciente.fecha_nacimiento
        ? paciente.fecha_nacimiento.split('T')[0]
        : paciente.fecha_nacimiento
    });
    setModoEdicion(false);
  };

  if (!paciente) return null;

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm" style={{ minHeight: '700px' }}>
        {/* Header */}
        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Información del Paciente
              </h2>
              <p className="text-sm text-gray-500">
                Datos personales y médicos
              </p>
              
              {paciente.updated_at && (
                <div className="space-y-1 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span className="font-medium">Última actualización:</span>
                    <span>{formatPeruDateTime(paciente.updated_at)}</span>
                  </div>
                </div>
              )}
            </div>
            
            {puedeEditarPaciente && !modoEdicion && (
              <button
                onClick={() => setModoEdicion(true)}
                className="flex items-center gap-2 bg-[#7B1FA2] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#6A1B9A] transition-all shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
            )}

            {!puedeEditarPaciente && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-amber-700 font-medium">
                  {esAdmision ? 'Solo lectura - Sin permisos de edición de datos personales' : 'Modo solo lectura'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleFormSubmit} className="p-8">
          {/* Datos Personales */}
          <Section icon={User} title="Datos Personales" iconColor="text-[#7B1FA2]" bgColor="bg-[#7B1FA2]/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                icon={User}
                label="Nombres"
                value={localPacienteData.nombres}
                name="nombres"
                editable={modoEdicion && puedeEditarPaciente}
                onChange={handleLocalChange}
                iconColor="text-[#7B1FA2]"
              />
              <FormField
                icon={User}
                label="Apellido Paterno"
                value={localPacienteData.apellido_paterno}
                name="apellido_paterno"
                editable={modoEdicion && puedeEditarPaciente}
                onChange={handleLocalChange}
                iconColor="text-[#7B1FA2]"
              />
              <FormField
                icon={User}
                label="Apellido Materno"
                value={localPacienteData.apellido_materno}
                name="apellido_materno"
                editable={modoEdicion && puedeEditarPaciente}
                onChange={handleLocalChange}
                iconColor="text-[#7B1FA2]"
              />
              <FormField
                icon={Calendar}
                label="Fecha de Nacimiento"
                value={localPacienteData.fecha_nacimiento ? localPacienteData.fecha_nacimiento.substring(0, 10) : ''}
                name="fecha_nacimiento"
                type="date"
                editable={modoEdicion && puedeEditarPaciente}
                onChange={handleLocalChange}
                iconColor="text-[#7B1FA2]"
              />
              <FormField
                icon={FileText}
                label="Tipo de Documento"
                value={localPacienteData.tipo_documento?.id}
                displayValue={localPacienteData.tipo_documento?.nombre}
                name="tipo_documento"
                editable={modoEdicion && puedeEditarPaciente}
                onChange={(e) => handleSelectChange('tipo_documento', e.target.value)}
                options={tiposDocumento}
                iconColor="text-[#7B1FA2]"
              />
              <FormField
                icon={FileText}
                label="Número de Documento"
                value={localPacienteData.numero_documento}
                name="numero_documento"
                editable={modoEdicion && puedeEditarPaciente}
                onChange={handleLocalChange}
                iconColor="text-[#7B1FA2]"
              />
              <FormField
                icon={User}
                label="Sexo"
                value={localPacienteData.sexo?.id}
                displayValue={localPacienteData.sexo?.nombre}
                name="sexo"
                editable={modoEdicion && puedeEditarPaciente}
                onChange={(e) => handleSelectChange('sexo', e.target.value)}
                options={generos}
                iconColor="text-[#7B1FA2]"
              />
            </div>
          </Section>

          {/* Contacto - Solo visible para Administrador, Admisión y Recursos Humanos */}
          {!esTerapeuta && (
            <Section icon={Phone} title="Información de Contacto" iconColor="text-emerald-600" bgColor="bg-emerald-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  icon={Phone}
                  label="Celular Principal"
                  value={localPacienteData.celular}
                  name="celular"
                  editable={modoEdicion && puedeEditarPaciente}
                  onChange={handleLocalChange}
                  iconColor="text-emerald-600"
                />
                <FormField
                  icon={Phone}
                  label="Celular Secundario"
                  value={localPacienteData.celular2}
                  name="celular2"
                  editable={modoEdicion && puedeEditarPaciente}
                  onChange={handleLocalChange}
                  iconColor="text-emerald-600"
                />
                <div className="md:col-span-2">
                  <FormField
                    icon={Mail}
                    label="Correo Electrónico"
                    value={localPacienteData.correo}
                    name="correo"
                    type="email"
                    editable={modoEdicion && puedeEditarPaciente}
                    onChange={handleLocalChange}
                    iconColor="text-emerald-600"
                  />
                </div>
              </div>
            </Section>
          )}

          {/* Dirección - Solo visible para Administrador, Admisión y Recursos Humanos */}
          {!esTerapeuta && (
            <Section icon={MapPin} title="Dirección" iconColor="text-blue-600" bgColor="bg-blue-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  icon={MapPin}
                  label="Distrito"
                  value={localPacienteData.distrito?.id}
                  displayValue={localPacienteData.distrito?.nombre}
                  name="distrito"
                  editable={modoEdicion && puedeEditarPaciente}
                  onChange={(e) => handleSelectChange('distrito', e.target.value)}
                  options={distritos}
                  iconColor="text-blue-600"
                />
                <FormField
                  icon={MapPin}
                  label="Dirección Completa"
                  value={localPacienteData.direccion}
                  name="direccion"
                  editable={modoEdicion && puedeEditarPaciente}
                  onChange={handleLocalChange}
                  iconColor="text-blue-600"
                />
              </div>
            </Section>
          )}

          {/* Información Médica */}
          <Section icon={Heart} title="Información Médica" iconColor="text-rose-600" bgColor="bg-rose-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                icon={FileText}
                label="Motivo de Consulta"
                value={localPacienteData.motivo_consulta}
                name="motivo_consulta"
                editable={modoEdicion && puedeEditarPaciente}
                onChange={handleLocalChange}
                iconColor="text-rose-600"
              />
              <FormField
                icon={User}
                label="Referido Por"
                value={localPacienteData.referido_por}
                name="referido_por"
                editable={modoEdicion && puedeEditarPaciente}
                onChange={handleLocalChange}
                iconColor="text-rose-600"
              />
              <FormField
                icon={Heart}
                label="Diagnóstico Médico"
                value={localPacienteData.diagnostico_medico}
                name="diagnostico_medico"
                editable={modoEdicion && puedeEditarPaciente}
                onChange={handleLocalChange}
                iconColor="text-rose-600"
              />
              <FormField
                icon={AlertCircle}
                label="Alergias"
                value={localPacienteData.alergias}
                name="alergias"
                editable={modoEdicion && puedeEditarPaciente}
                onChange={handleLocalChange}
                iconColor="text-rose-600"
              />
              <div className="md:col-span-2">
                <FormField
                  icon={Pill}
                  label="Medicamentos Actuales"
                  value={localPacienteData.medicamentos_actuales}
                  name="medicamentos_actuales"
                  editable={modoEdicion && puedeEditarPaciente}
                  onChange={handleLocalChange}
                  iconColor="text-rose-600"
                />
              </div>
            </div>
          </Section>

          {/* Responsables del Paciente */}
          <Section icon={User} title="Responsables" iconColor="text-purple-600" bgColor="bg-purple-50">
            <ResponsablesSection
              pacienteId={paciente.id}
              canEdit={user?.rol?.id === ROLES.ADMINISTRADOR}
              soloNombreYDni={esTerapeuta}
              onSuccess={(mensaje) => {
                setSuccessMessage(mensaje);
                setShowSuccessModal(true);
              }}
              onError={(mensaje) => {
                setErrorMessage(mensaje);
                setShowErrorModal(true);
              }}
            />
          </Section>

          {/* Servicios Asignados */}
          <Section icon={FileText} title="Servicios Asignados" iconColor="text-[#A3C644]" bgColor="bg-[#A3C644]/10">
            {puedeGestionarServicios && (
              <button
                type="button"
                onClick={() => setOpenAsignarServicio(true)}
                className="flex items-center gap-2 bg-[#A3C644] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#8FB82D] transition-all shadow-sm mb-5"
              >
                <Plus className="w-4 h-4" />
                Asignar Nuevo Servicio
              </button>
            )}

            {paciente.servicios && paciente.servicios.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {paciente.servicios.map(servicio => (
                  <div
                    key={servicio.id}
                    className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-all bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-2 h-2 rounded-full bg-[#7B1FA2]"></div>
                          <span className="font-semibold text-gray-900">
                            {servicio.servicio?.nombre || 'Sin nombre'}
                          </span>
                        </div>

                        {servicio.asignaciones && servicio.asignaciones.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {servicio.asignaciones
                              .filter(asig => asig.estado === 'ACTIVO' && asig.activo)
                              .map((asignacion, index) => (
                                <div
                                  key={asignacion.id || index}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                                >
                                  <User className="w-3 h-3" />
                                  <span>
                                    {asignacion.terapeuta?.nombres} {asignacion.terapeuta?.apellidos}
                                  </span>
                                  {puedeGestionarServicios && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setModalEliminarServicio({
                                          open: true,
                                          servicio,
                                          asignacionId: asignacion.id,
                                          terapeutaNombre: `${asignacion.terapeuta?.nombres} ${asignacion.terapeuta?.apellidos}`
                                        });
                                      }}
                                      className="ml-1 text-emerald-600 hover:text-red-600 hover:bg-red-50 rounded-full p-0.5 transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <User className="w-3 h-3" />
                            Sin asignar
                          </div>
                        )}
                      </div>

                      {puedeGestionarServicios && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              console.log('🔵 Botón editar clickeado');
                              console.log('🔵 Servicio:', servicio);
                              console.log('🔵 Terapeuta ID:', servicio.asignaciones?.[0]?.terapeuta?.id);
                              setServicioAEditar(servicio);
                              const terapeutaId = servicio.asignaciones && 
                                                 servicio.asignaciones.length > 0 && 
                                                 servicio.asignaciones[0].terapeuta
                                ? String(servicio.asignaciones[0].terapeuta.id)
                                : '';
                              console.log('🔵 ID del terapeuta a setear:', terapeutaId);
                              setNuevoTerapeuta(terapeutaId);
                              setOpenEditarTerapeuta(true);
                            }}
                            className="p-2 text-[#7B1FA2] hover:bg-purple-50 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setModalEliminarServicio({ open: true, servicio })}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No hay servicios asignados</p>
              </div>
            )}
          </Section>

          {/* Botones de acción - Solo visible en modo edición para ADMINISTRADOR */}
          {modoEdicion && puedeEditarPaciente && (
            <div className="flex items-center justify-end gap-3 pt-8 border-t border-gray-100 mt-8">
              <button
                type="button"
                onClick={handleCancelar}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-xl transition-all disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-[#A3C644] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#8FB82D] transition-all shadow-sm disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Modales de éxito y error */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Éxito!</h3>
              <p className="text-gray-600 mb-6">{successMessage}</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-[#A3C644] text-white py-2.5 rounded-xl font-medium hover:bg-[#8FB82D] transition-colors"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full bg-gray-200 text-gray-800 py-2.5 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FiliacionView;