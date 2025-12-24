import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Power, Check, X, Search, Eye, Trash2,
  CheckCircle, XCircle, Building2, FileText,
  Users, Calendar, AlertCircle, Upload
} from 'lucide-react';
import {
  getConvenios,
  crearConvenio,
  actualizarConvenio,
  eliminarConvenio,
  activarConvenio,
  desactivarConvenio,
  getPacientesPorConvenio
} from '../services/conveniosService';
import { API_BASE_URL, SERVER_BASE_URL } from '../services/api';

export default function ConveniosPage() {
  const [convenios, setConvenios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('activo');

  // Estados de modales
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [convenioSeleccionado, setConvenioSeleccionado] = useState(null);

  // Notificaciones
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    cargarConvenios();
  }, []);

  const cargarConvenios = async () => {
    try {
      setLoading(true);
      console.log('Cargando convenios...');
      const data = await getConvenios();
      console.log('Convenios cargados:', data);
      setConvenios(data);
    } catch (error) {
      console.error('Error al cargar convenios:', error);
      showNotification('Error al cargar los convenios. Verifica la conexión con el servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleToggleActivo = async (convenio) => {
    try {
      if (convenio.activo) {
        await desactivarConvenio(convenio.id);
        showNotification('Convenio desactivado correctamente', 'success');
      } else {
        await activarConvenio(convenio.id);
        showNotification('Convenio activado correctamente', 'success');
      }
      cargarConvenios();
    } catch (error) {
      showNotification('Error al cambiar el estado del convenio', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await eliminarConvenio(convenioSeleccionado.id);
      showNotification('Convenio eliminado exitosamente', 'success');
      setModalDelete(false);
      setConvenioSeleccionado(null);
      cargarConvenios();
    } catch (error) {
      console.error('Error al eliminar convenio:', error);
      showNotification(error.response?.data?.message || 'Error al eliminar el convenio', 'error');
    }
  };

  // Filtrar convenios
  const conveniosFiltrados = convenios.filter(convenio => {
    const matchBusqueda = !busqueda ||
      convenio.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      convenio.descripcion?.toLowerCase().includes(busqueda.toLowerCase());

    const matchEstado = !filtroEstado ||
      (filtroEstado === 'activo' && convenio.activo) ||
      (filtroEstado === 'inactivo' && !convenio.activo);

    return matchBusqueda && matchEstado;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-[#7B1FA2] rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 mt-3 text-xs font-medium tracking-wide">Cargando convenios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border transform transition-all duration-300 ${
          notification.type === 'success'
            ? 'bg-white border-gray-200'
            : 'bg-white border-red-200'
        } flex items-center gap-2.5`}>
          <div className={`w-1.5 h-1.5 rounded-full ${notification.type === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`}></div>
          <span className="text-xs font-medium text-gray-700">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1.5">Gestión de Convenios</h1>
            <p className="text-sm text-gray-500">Administra los convenios institucionales</p>
          </div>

          <button
            onClick={() => setModalNuevo(true)}
            className="flex items-center gap-2 bg-[#7B1FA2] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#6A1B9A] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo Convenio
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{convenios.length}</p>
                <p className="text-sm text-gray-500">Total Convenios</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {convenios.filter(c => c.activo).length}
                </p>
                <p className="text-sm text-gray-500">Activos</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {convenios.filter(c => !c.activo).length}
                </p>
                <p className="text-sm text-gray-500">Inactivos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
            />
          </div>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all bg-white"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Lista de convenios */}
      {conveniosFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gradient-to-br from-[#9C27B0] to-[#BA68C8] opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-600 font-medium text-base mb-1">No se encontraron convenios</p>
          <p className="text-gray-400 text-sm">Ajusta los filtros de búsqueda o crea uno nuevo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {conveniosFiltrados.map((convenio) => (
            <TarjetaConvenio
              key={convenio.id}
              convenio={convenio}
              onEditar={(conv) => {
                setConvenioSeleccionado(conv);
                setModalEditar(true);
              }}
              onToggleActivo={handleToggleActivo}
              onVerDetalle={(conv) => {
                setConvenioSeleccionado(conv);
                setModalDetalle(true);
              }}
              onDelete={(conv) => {
                setConvenioSeleccionado(conv);
                setModalDelete(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      {modalNuevo && (
        <ModalNuevoConvenio
          onClose={() => setModalNuevo(false)}
          onSuccess={() => {
            cargarConvenios();
            showNotification('Convenio creado correctamente', 'success');
          }}
          onError={(msg) => showNotification(msg, 'error')}
        />
      )}

      {modalEditar && convenioSeleccionado && (
        <ModalEditarConvenio
          convenio={convenioSeleccionado}
          onClose={() => {
            setModalEditar(false);
            setConvenioSeleccionado(null);
          }}
          onSuccess={() => {
            cargarConvenios();
            showNotification('Convenio actualizado correctamente', 'success');
          }}
          onError={(msg) => showNotification(msg, 'error')}
        />
      )}

      {modalDetalle && convenioSeleccionado && (
        <ModalDetalleConvenio
          convenio={convenioSeleccionado}
          onClose={() => {
            setModalDetalle(false);
            setConvenioSeleccionado(null);
          }}
          onEditar={() => {
            setModalDetalle(false);
            setModalEditar(true);
          }}
        />
      )}

      {modalDelete && convenioSeleccionado && (
        <ModalConfirmDelete
          convenio={convenioSeleccionado}
          onClose={() => {
            setModalDelete(false);
            setConvenioSeleccionado(null);
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

// ============== TARJETA CONVENIO ==============
const TarjetaConvenio = ({ convenio, onEditar, onToggleActivo, onVerDetalle, onDelete }) => {
  const [pacientesCount, setPacientesCount] = useState(0);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        const data = await getPacientesPorConvenio(convenio.id, true);
        setPacientesCount(data.length);
      } catch (error) {
        console.error('Error al cargar pacientes:', error);
      } finally {
        setLoadingPacientes(false);
      }
    };
    cargarPacientes();
  }, [convenio.id]);

  return (
    <div className="group relative bg-white rounded-xl p-4 border border-gray-200 hover:border-[#7B1FA2]/50 hover:shadow-sm transition-all">
      <div className="flex items-start gap-3 mb-3">
        {/* Logo del Convenio - AHORA SE MUESTRA SIEMPRE SI EXISTE */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-white border border-gray-100 flex items-center justify-center shadow-sm">
          {convenio.logo_url && !logoError ? (
            <img 
              src={`${SERVER_BASE_URL}${convenio.logo_url}`} 
              alt={convenio.nombre} 
              className="w-full h-full object-contain p-1"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${
              convenio.activo
                ? 'bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A]'
                : 'bg-gradient-to-br from-gray-400 to-gray-500'
            }`}>
              <Building2 className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">
            {convenio.nombre}
          </h3>
          {convenio.descripcion && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {convenio.descripcion}
            </p>
          )}
        </div>

        {/* Estado badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border flex-shrink-0 ${
          convenio.activo
            ? 'bg-green-50 border-green-200'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${convenio.activo ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className={`text-[10px] font-semibold uppercase tracking-wide ${
            convenio.activo ? 'text-green-700' : 'text-gray-700'
          }`}>
            {convenio.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Info adicional */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <Users className="w-3 h-3 flex-shrink-0 text-[#7B1FA2]" />
          <span className="text-gray-600">
            {loadingPacientes ? (
              <span className="animate-pulse">Cargando...</span>
            ) : (
              `${pacientesCount} paciente${pacientesCount !== 1 ? 's' : ''} asociado${pacientesCount !== 1 ? 's' : ''}`
            )}
          </span>
        </div>

        {convenio.created_at && (
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3 h-3 flex-shrink-0 text-blue-500" />
            <span className="text-gray-600">
              Creado: {new Date(convenio.created_at).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="space-y-2 pt-3 border-t border-gray-100">
        {/* Primera fila de acciones */}
        <div className="flex gap-2">
          <button
            onClick={() => onVerDetalle(convenio)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-100 transition-all"
            title="Ver información completa"
          >
            <Eye className="w-3.5 h-3.5" />
            Ver
          </button>

          <button
            onClick={() => onEditar(convenio)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#A3C644] text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-[#8FB82D] transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Editar
          </button>

          <button
            onClick={() => onDelete(convenio)}
            className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-100 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar
          </button>
        </div>

        {/* Segunda fila - Estado */}
        <button
          onClick={() => onToggleActivo(convenio)}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            convenio.activo
              ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
          }`}
          title={convenio.activo ? 'Desactivar convenio' : 'Activar convenio'}
        >
          <Power className="w-3.5 h-3.5" />
          {convenio.activo ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </div>
  );
};

// ============== MODAL NUEVO CONVENIO ==============
const ModalNuevoConvenio = ({ onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        onError('Solo se permiten archivos de imagen (JPG, PNG, WEBP)');
        return;
      }

      // Validar tamaño (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        onError('El archivo no debe superar los 5MB');
        return;
      }

      setLogoFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const validarFormulario = () => {
    const erroresNuevos = {};
    
    if (!formData.nombre?.trim()) {
      erroresNuevos.nombre = 'El nombre es obligatorio';
    }

    setErrors(erroresNuevos);
    return Object.keys(erroresNuevos).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      onError('Por favor corrige los errores');
      return;
    }

    setLoading(true);
    try {
      console.log('Guardando convenio:', formData);
      await crearConvenio(formData, logoFile);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al crear convenio:', error);
      onError(error.response?.data?.message || 'Error al crear el convenio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-2xl bg-white shadow-xl z-50 overflow-hidden flex flex-col">
        <div className="flex-shrink-0 bg-gradient-to-r from-[#7B1FA2] via-[#8E24AA] to-[#AB47BC] p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1.5">Nuevo Convenio</h2>
              <p className="text-sm text-white/90">Registra un nuevo convenio institucional</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Información Básica */}
            <Section title="Información Básica" icon={FileText}>
              <div className="space-y-4">
                <InputField 
                  label="Empresa o Institución" 
                  name="nombre" 
                  value={formData.nombre} 
                  onChange={handleChange} 
                  error={errors.nombre} 
                  required 
                  placeholder="Ej: Clínica San Pablo, Corporación ABC"
                />
                
                <TextAreaField
                  label="Descripción"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Describe los beneficios, descuentos o características del convenio"
                  rows={3}
                />

                {/* Logo Upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Logo del Convenio
                  </label>
                  
                  {logoPreview ? (
                    <div className="space-y-2">
                      <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                        <img 
                          src={logoPreview} 
                          alt="Preview" 
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Haz clic en el botón para cambiar la imagen
                      </p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-[#7B1FA2] transition-all">
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Upload className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Subir logo</p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, WEBP (Máx. 5MB)
                        </p>
                      </label>
                    </div>
                  )}
                </div>

                <CheckboxField
                  label="Convenio activo desde su creación"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                />
              </div>
            </Section>
          </div>
        </div>

        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={loading}
            className="flex items-center gap-2 bg-[#A3C644] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

// ============== MODAL EDITAR CONVENIO ==============
const ModalEditarConvenio = ({ convenio, onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    nombre: convenio.nombre || '',
    descripcion: convenio.descripcion || '',
    activo: convenio.activo
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(convenio.logo_url || null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        onError('Solo se permiten archivos de imagen (JPG, PNG, WEBP)');
        return;
      }

      // Validar tamaño (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        onError('El archivo no debe superar los 5MB');
        return;
      }

      setLogoFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const validarFormulario = () => {
    const erroresNuevos = {};
    
    if (!formData.nombre?.trim()) {
      erroresNuevos.nombre = 'El nombre es obligatorio';
    }

    setErrors(erroresNuevos);
    return Object.keys(erroresNuevos).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      onError('Por favor corrige los errores');
      return;
    }

    setLoading(true);
    try {
      await actualizarConvenio(convenio.id, formData, logoFile);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al actualizar convenio:', error);
      onError(error.response?.data?.message || 'Error al actualizar el convenio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-2xl bg-white shadow-xl z-50 overflow-hidden flex flex-col">
        <div className="flex-shrink-0 bg-gradient-to-r from-[#7B1FA2] via-[#8E24AA] to-[#AB47BC] p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1.5">Editar Convenio</h2>
              <p className="text-sm text-white/90">{convenio.nombre}</p>
            </div>
            <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <Section title="Información Básica" icon={FileText}>
              <div className="space-y-4">
                <InputField 
                  label="Nombre del Convenio" 
                  name="nombre" 
                  value={formData.nombre} 
                  onChange={handleChange} 
                  error={errors.nombre} 
                  required 
                  placeholder="Ej: Clínica San Pablo, Corporación ABC"
                />
                
                <TextAreaField
                  label="Descripción"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Describe los beneficios, descuentos o características del convenio"
                  rows={3}
                />

                {/* Logo Upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Logo del Convenio
                  </label>
                  
                  {logoPreview ? (
                    <div className="space-y-2">
                      <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                        <img 
                          src={logoPreview} 
                          alt="Preview" 
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Haz clic en el botón para cambiar la imagen
                      </p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-[#7B1FA2] transition-all">
                      <input
                        type="file"
                        id="logo-upload-edit"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <label htmlFor="logo-upload-edit" className="cursor-pointer">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Upload className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Subir logo</p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, WEBP (Máx. 5MB)
                        </p>
                      </label>
                    </div>
                  )}
                </div>

                <CheckboxField
                  label="Convenio activo"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                />
              </div>
            </Section>
          </div>
        </div>

        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={loading}
            className="flex items-center gap-2 bg-[#A3C644] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

// ============== MODAL DETALLE CONVENIO ==============
const ModalDetalleConvenio = ({ convenio, onClose, onEditar }) => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        const data = await getPacientesPorConvenio(convenio.id);
        setPacientes(data);
      } catch (error) {
        console.error('Error al cargar pacientes:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarPacientes();
  }, [convenio.id]);

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-2xl bg-white shadow-xl z-50 overflow-hidden flex flex-col">
        <div className="flex-shrink-0 bg-gradient-to-r from-[#7B1FA2] via-[#8E24AA] to-[#AB47BC] p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {convenio.logo_url && !logoError ? (
                <img 
                  src={`${SERVER_BASE_URL}${convenio.logo_url}`}
                  
                  alt={convenio.nombre}
                  className="w-16 h-16 rounded-xl bg-white/20 object-contain p-2"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white mb-1.5">{convenio.nombre}</h2>
                <p className="text-sm text-white/90">Información del convenio</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Información básica */}
            <Section title="Información Básica" icon={FileText}>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Estado</span>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${
                    convenio.activo
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${convenio.activo ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <span className={`text-xs font-semibold ${
                      convenio.activo ? 'text-green-700' : 'text-gray-700'
                    }`}>
                      {convenio.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                {convenio.descripcion && (
                  <div className="py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500 block mb-1">Descripción</span>
                    <p className="text-sm text-gray-900">{convenio.descripcion}</p>
                  </div>
                )}

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Fecha de creación</span>
                  <span className="text-sm text-gray-900">
                    {new Date(convenio.created_at).toLocaleDateString('es-PE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                {convenio.updated_at && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-500">Última actualización</span>
                    <span className="text-sm text-gray-900">
                      {new Date(convenio.updated_at).toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </Section>

            {/* Pacientes asociados */}
            <Section title="Pacientes Asociados" icon={Users}>
              {loading ? (
                <div className="text-center py-6">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-gray-400 mt-2">Cargando pacientes...</p>
                </div>
              ) : pacientes.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No hay pacientes asociados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Total: {pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-500">
                      Activos: {pacientes.filter(p => p.activo).length}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {pacientes.map(pc => (
                      <div key={pc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Paciente ID: {pc.paciente_id}</p>
                          {pc.observaciones && (
                            <p className="text-xs text-gray-600 mt-1">{pc.observaciones}</p>
                          )}
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          pc.activo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {pc.activo ? 'Activo' : 'Inactivo'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          </div>
        </div>

        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
          >
            Cerrar
          </button>
          <button
            onClick={onEditar}
            className="flex items-center gap-2 bg-[#A3C644] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        </div>
      </div>
    </>
  );
};

// ============== MODAL CONFIRMAR ELIMINACIÓN ==============
const ModalConfirmDelete = ({ convenio, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div 
          className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Confirmar eliminación</h3>
              <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              ¿Estás seguro de que deseas eliminar el convenio{' '}
              <span className="font-bold text-gray-900">"{convenio.nombre}"</span>?
            </p>
            <p className="text-xs text-red-600 mt-2">
              Nota: Solo se puede eliminar si no tiene pacientes asociados.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50"
            >
              {loading ? (
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
    </>
  );
};

// ============== COMPONENTES AUXILIARES ==============
const Section = ({ title, icon: Icon, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon className="w-5 h-5 text-[#7B1FA2]" />}
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h3>
    </div>
    {children}
  </div>
);

const InputField = ({ label, name, value, onChange, error, required, placeholder, type = 'text' }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm focus:outline-none transition-all ${
        error
          ? 'border-red-300 focus:border-red-500'
          : 'border-gray-200 focus:border-[#7B1FA2]'
      }`}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder, rows = 3 }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
      {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all resize-none"
    />
  </div>
);

const CheckboxField = ({ label, name, checked, onChange }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 text-[#7B1FA2] border-gray-300 rounded focus:ring-[#7B1FA2] focus:ring-2"
    />
    <label className="text-sm text-gray-700 font-medium cursor-pointer" onClick={() => onChange({ target: { name, type: 'checkbox', checked: !checked } })}>
      {label}
    </label>
  </div>
);