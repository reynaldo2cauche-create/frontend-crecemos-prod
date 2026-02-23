import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Shield, Phone, Mail, FileText, AlertCircle, Save, X, Info, Loader2, User } from 'lucide-react';
import { getResponsablesPorPaciente, getProcesosLegalesInfantiles } from '../../services/pacienteService';
import { getRelacionesResponsable, getTiposDocumento } from '../../services/catalogoService';
import api from '../../services/api';

const ResponsablesSection = ({ pacienteId, canEdit, soloNombreYDni = false, onSuccess, onError }) => {
  const [responsables, setResponsables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relaciones, setRelaciones] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [procesosLegales, setProcesosLegales] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalData, setInfoModalData] = useState(null);

  // ⛔️ ELIMINAR el estado [alert, setAlert] y todo su código relacionado

  useEffect(() => {
    loadData();
  }, [pacienteId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [responsablesData, relacionesData, tiposDocData, procesosLegalesData] = await Promise.all([
        getResponsablesPorPaciente(pacienteId),
        getRelacionesResponsable(),
        getTiposDocumento(),
        getProcesosLegalesInfantiles()
      ]);

      setResponsables(responsablesData.data || []);
      setRelaciones(relacionesData || []);
      setTiposDocumento(tiposDocData || []);
      setProcesosLegales(procesosLegalesData || []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar responsables:', err);
      setError('Error al cargar los responsables');
      if (onError) onError('Error al cargar los responsables');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (responsable) => {
    // ⛔️ NO LLAMAR A showAlert AQUÍ - Solo abrir el modal
    console.log('Abriendo modal para editar responsable');
    setEditingId(responsable.id);
    setFormData({
      nombres: responsable.nombres,
      apellido_paterno: responsable.apellido_paterno,
      apellido_materno: responsable.apellido_materno,
      tipo_documento_id: responsable.tipo_documento_id,
      numero_documento: responsable.numero_documento,
      responsable_relacion_id: responsable.responsable_relacion_id,
      telefono: responsable.telefono,
      email: responsable.email,
      tiene_proceso_legal: responsable.tiene_proceso_legal,
      proceso_legal_infantil_id: responsable.proceso_legal_infantil_id
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      
      const responsableId = editingId || 'null';
      
      console.log('Guardando responsable...');
      const response = await api.put(
        `/pacientes/${pacienteId}/responsables/${responsableId}`,
        formData
      );
      
      console.log('Responsable guardado exitosamente');
      await loadData();
      
      // Cerrar modal
      setShowEditModal(false);
      setEditingId(null);
      setFormData({});
      
      // ✅ Usar el callback del padre para mostrar mensaje
      if (onSuccess) {
        console.log('Notificando éxito al padre');
        onSuccess('Responsable actualizado correctamente');
      }
    } catch (error) {
      console.error('Error al guardar responsable:', error);
      if (onError) onError('Error al actualizar responsable');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (responsableId) => {
    if (!window.confirm('¿Está seguro de eliminar este responsable?')) return;

    try {
      console.log('Eliminando responsable...');
      await api.delete(`/pacientes/${pacienteId}/responsables/${responsableId}`);
      await loadData();
      
      // ✅ Usar el callback del padre para mostrar mensaje
      if (onSuccess) onSuccess('Responsable eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar responsable:', err);
      if (onError) onError('Error al eliminar el responsable');
    }
  };

  const handleAddNew = async () => {
    try {
      setSaving(true);
      console.log('Agregando nuevo responsable...');
      await api.post(`/pacientes/${pacienteId}/responsables`, formData);
      await loadData();
      setShowAddModal(false);
      setFormData({});
      
      // ✅ Usar el callback del padre para mostrar mensaje
      if (onSuccess) onSuccess('Responsable agregado correctamente');
    } catch (err) {
      console.error('Error al agregar responsable:', err);
      if (onError) onError('Error al agregar el responsable');
    } finally {
      setSaving(false);
    }
  };

  const handleShowInfo = (procesoLegal) => {
    setInfoModalData(procesoLegal);
    setShowInfoModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B1FA2]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div>
      {/* ⛔️ ELIMINAR ESTE COMPONENTE Alert */}
      {/* No debe haber ningún componente de alerta aquí */}
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {responsables.length > 0 && (
            <span className="px-2.5 py-1 bg-[#7B1FA2]/10 text-[#7B1FA2] text-xs font-semibold rounded-full">
              {responsables.length}
            </span>
          )}
        </div>

        {canEdit && responsables.length < 2 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm bg-gradient-to-r from-[#7B1FA2] to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
          >
            <Plus className="w-4 h-4" />
            Agregar Responsable
          </button>
        )}
      </div>

      {responsables.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#7B1FA2]/10 to-purple-100 flex items-center justify-center">
            <Users className="w-8 h-8 text-[#7B1FA2]/40" />
          </div>
          <p className="text-sm font-medium text-gray-600">No hay responsables registrados</p>
          <p className="text-xs text-gray-400 mt-1">Agrega al menos un responsable para continuar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {responsables.map((responsable, index) => (
            <div
              key={responsable.id || `legacy-${index}`}
              className="bg-white rounded-xl border-2 border-gray-100 hover:border-[#7B1FA2]/30 transition-all p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {responsable.nombres?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {`${responsable.nombres} ${responsable.apellido_paterno} ${responsable.apellido_materno || ''}`}
                    </h4>
                    {!soloNombreYDni && (
                      <div className="flex items-center gap-2 mt-1">
                        {index === 0 && (
                          <span className="px-2 py-0.5 bg-[#7B1FA2]/10 text-[#7B1FA2] text-xs font-semibold rounded-md">
                            Principal
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {responsable.responsable_relacion?.nombre || 'N/A'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleEdit(responsable);
                      }}
                      className="p-2 text-[#7B1FA2] hover:bg-[#7B1FA2]/10 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {responsables.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDelete(responsable.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {!soloNombreYDni && (
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-500">{responsable.tipo_documento?.nombre || 'N/A'}:</span>
                    <span className="font-medium text-gray-700">{responsable.numero_documento}</span>
                  </div>
                )}

                {!soloNombreYDni && (
                  <>
                    <div className="flex items-center gap-2 text-xs">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-medium text-gray-700">{responsable.telefono || 'N/A'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs col-span-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-medium text-gray-700 truncate">{responsable.email || 'N/A'}</span>
                    </div>
                  </>
                )}

                <div className={`flex items-center gap-2 pt-2 border-t border-gray-100 ${soloNombreYDni ? 'col-span-2' : 'col-span-2'}`}>
                  <Shield className={`w-4 h-4 ${responsable.tiene_proceso_legal ? 'text-orange-500' : 'text-green-500'}`} />
                  <span className="text-xs font-medium text-gray-600">Proceso Legal:</span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                    responsable.tiene_proceso_legal
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {responsable.tiene_proceso_legal ? 'Sí' : 'No'}
                  </span>
                  {responsable.tiene_proceso_legal && responsable.procesoLegalInfantil && (
                    <span className="text-xs text-gray-600">
                      {responsable.procesoLegalInfantil.nombre}
                    </span>
                  )}
                  {!soloNombreYDni && responsable.tiene_proceso_legal && responsable.procesoLegalInfantil && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleShowInfo(responsable.procesoLegalInfantil);
                      }}
                      className="p-1 hover:bg-orange-100 rounded-lg transition-colors ml-auto"
                      title="Ver detalles"
                    >
                      <Info className="w-4 h-4 text-orange-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para agregar nuevo responsable */}
      {showAddModal && (
        <ResponsableModal
          title="Agregar Nuevo Responsable"
          formData={formData}
          
          setFormData={setFormData}
          onSave={handleAddNew}
          onClose={() => {
            setShowAddModal(false);
            setFormData({});
          }}
          saving={saving}
          relaciones={relaciones}
          tiposDocumento={tiposDocumento}
          procesosLegales={procesosLegales}
        />
      )}

      {/* Modal para editar responsable */}
      {showEditModal && (
        <ResponsableModal
          title="Editar Responsable"
          formData={formData}
          setFormData={setFormData}
          onSave={handleSaveEdit}
          onClose={() => {
            setShowEditModal(false);
            setEditingId(null);
            setFormData({});
          }}
          saving={saving}
          relaciones={relaciones}
          tiposDocumento={tiposDocumento}
          procesosLegales={procesosLegales}
        />
      )}

      {/* Modal de información del proceso legal */}
      {showInfoModal && infoModalData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                    <Info className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {infoModalData.nombre}
                    </h3>
                    <p className="text-sm text-gray-500">Proceso Legal Infantil</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {infoModalData.descripcion || 'Sin descripción disponible'}
                </p>
              </div>

              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full px-4 py-2.5 text-sm bg-gradient-to-r from-[#7B1FA2] to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal unificado para agregar/editar responsable
const ResponsableModal = ({ title, formData, setFormData, onSave, onClose, saving, relaciones, tiposDocumento, procesosLegales }) => {

  // Función para manejar cambio de documento con límites
  const handleNumeroDocumentoChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');

    // Limitar según tipo de documento
    const tipoDocumento = formData.tipo_documento_id;
    if (tipoDocumento === 1) { // DNI
      value = value.slice(0, 8);
    } else if (tipoDocumento === 3) { // Carnet de Extranjería
      value = value.slice(0, 12);
    }

    setFormData({...formData, numero_documento: value});
  };

  // Función para manejar cambio de teléfono (solo 9 dígitos, empieza con 9)
  const handleTelefonoChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 0 && value[0] !== '9') {
      value = '';
    }
    value = value.slice(0, 9);
    setFormData({...formData, telefono: value});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7B1FA2] to-purple-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content con scroll */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-5">
            {/* Sección: Datos Personales */}
            <div className="border-l-4 border-[#7B1FA2] pl-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-800">Datos Personales</h4>
              <p className="text-xs text-gray-500">Información básica del responsable</p>
            </div>

            {/* Nombres */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombres <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nombres || ''}
                onChange={(e) => setFormData({...formData, nombres: e.target.value.toUpperCase()})}
                className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] transition-colors"
                placeholder="Ingrese nombres completos"
              />
            </div>

            {/* Apellidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Apellido Paterno <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.apellido_paterno || ''}
                  onChange={(e) => setFormData({...formData, apellido_paterno: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] transition-colors"
                  placeholder="Apellido paterno"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Apellido Materno
                </label>
                <input
                  type="text"
                  value={formData.apellido_materno || ''}
                  onChange={(e) => setFormData({...formData, apellido_materno: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] transition-colors"
                  placeholder="Apellido materno (opcional)"
                />
              </div>
            </div>

            {/* Documento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Documento <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tipo_documento_id || ''}
                  onChange={(e) => {
                    const newTipoDoc = parseInt(e.target.value);
                    setFormData({
                      ...formData,
                      tipo_documento_id: newTipoDoc,
                      numero_documento: '' // Limpiar número al cambiar tipo
                    });
                  }}
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] transition-colors bg-white"
                >
                  <option value="">Seleccionar tipo...</option>
                  {tiposDocumento.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Número de Documento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.numero_documento || ''}
                  onChange={handleNumeroDocumentoChange}
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] transition-colors"
                  placeholder={formData.tipo_documento_id === 1 ? '8 dígitos' : formData.tipo_documento_id === 3 ? '9-12 dígitos' : 'Número'}
                  inputMode="numeric"
                />
                {formData.tipo_documento_id === 1 && (
                  <p className="text-xs text-gray-500 mt-1">DNI debe tener 8 dígitos</p>
                )}
                {formData.tipo_documento_id === 3 && (
                  <p className="text-xs text-gray-500 mt-1">Carnet de Extranjería: 9-12 dígitos</p>
                )}
              </div>
            </div>

            {/* Sección: Relación */}
            <div className="border-l-4 border-[#7B1FA2] pl-4 mb-4 mt-6">
              <h4 className="text-sm font-semibold text-gray-800">Relación con el Paciente</h4>
              <p className="text-xs text-gray-500">Vínculo familiar o legal</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-[#7B1FA2]" />
                Relación <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.responsable_relacion_id || ''}
                onChange={(e) => setFormData({...formData, responsable_relacion_id: parseInt(e.target.value)})}
                className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] transition-colors bg-white"
              >
                <option value="">Seleccionar relación...</option>
                {relaciones.map(rel => (
                  <option key={rel.id} value={rel.id}>{rel.nombre}</option>
                ))}
              </select>
            </div>

            {/* Sección: Contacto */}
            <div className="border-l-4 border-[#7B1FA2] pl-4 mb-4 mt-6">
              <h4 className="text-sm font-semibold text-gray-800">Información de Contacto</h4>
              <p className="text-xs text-gray-500">Teléfono y correo electrónico</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#7B1FA2]" />
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.telefono || ''}
                  onChange={handleTelefonoChange}
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] transition-colors"
                  placeholder="9XXXXXXXX"
                  inputMode="numeric"
                />
                <p className="text-xs text-gray-500 mt-1">Debe empezar con 9 y tener 9 dígitos</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#7B1FA2]" />
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value.toLowerCase()})}
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] transition-colors"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            {/* Sección: Proceso Legal */}
            <div className="border-l-4 border-orange-500 pl-4 mb-4 mt-6">
              <h4 className="text-sm font-semibold text-gray-800">Proceso Legal</h4>
              <p className="text-xs text-gray-500">Información sobre procesos legales del menor</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-500" />
                ¿Tiene proceso legal?
              </label>
              <select
                value={formData.tiene_proceso_legal === true ? '1' : '0'}
                onChange={(e) => {
                  const tieneProceso = e.target.value === '1';
                  setFormData({
                    ...formData,
                    tiene_proceso_legal: tieneProceso,
                    proceso_legal_infantil_id: tieneProceso ? formData.proceso_legal_infantil_id : null
                  });
                }}
                className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] transition-colors bg-white"
              >
                <option value="0">No</option>
                <option value="1">Sí</option>
              </select>
            </div>

            {/* Tipo de Proceso Legal (solo si tiene_proceso_legal = true) */}
            {formData.tiene_proceso_legal && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Proceso Legal <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.proceso_legal_infantil_id || ''}
                  onChange={(e) => setFormData({...formData, proceso_legal_infantil_id: parseInt(e.target.value) || null})}
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors bg-white"
                >
                  <option value="">Seleccionar tipo de proceso...</option>
                  {procesosLegales.map(proceso => (
                    <option key={proceso.id} value={proceso.id}>
                      {proceso.nombre}
                    </option>
                  ))}
                </select>
                {formData.proceso_legal_infantil_id && (
                  <p className="mt-2 text-xs text-orange-800 bg-orange-100 rounded-lg p-2.5">
                    📋 {procesosLegales.find(p => p.id === formData.proceso_legal_infantil_id)?.descripcion}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-[#7B1FA2] to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsablesSection;