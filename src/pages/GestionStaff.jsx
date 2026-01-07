import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Power, Search, Eye, Trash2, X,
  Users, AlertCircle, User, Briefcase, Upload
} from 'lucide-react';
import {
  getStaff,
  crearStaff,
  actualizarStaff,
  eliminarStaff,
  cambiarEstadoStaff,
  getStaffById,
  uploadFotoStaff
} from '../services/staffService';
import { getTrabajadores } from '../services/trabajadorService';
import { getServiciosByTrabajador } from '../services/trabajadorServicioService';
import { API_BASE_URL } from '../services/api';

export default function GestionStaff() {
  const [staffList, setStaffList] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('activo');

  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [staffSeleccionado, setStaffSeleccionado] = useState(null);

  const [formData, setFormData] = useState({
    trabajador_id: '',
    descripcion_especialidad: '',
    foto: '',
    orden: 1,
    activo: true
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    cargarDatos();
  }, []);

  // ✅ Función para cargar SOLO servicios ACTIVOS del trabajador
  const cargarServiciosTrabajador = async (trabajadorId) => {
    try {
      const servicios = await getServiciosByTrabajador(trabajadorId);
      // ✅ Agrupar por nombre para evitar duplicados (mismo servicio en diferentes áreas)
      const serviciosUnicos = new Map();
      servicios.forEach(s => {
        if (!serviciosUnicos.has(s.nombre)) {
          serviciosUnicos.set(s.nombre, s.nombre);
        }
      });
      return Array.from(serviciosUnicos.values());
    } catch (error) {
      console.error(`Error al cargar servicios del trabajador ${trabajadorId}:`, error);
      return [];
    }
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [staffData, trabajadoresData] = await Promise.all([
        getStaff(),
        getTrabajadores()
      ]);

      // ✅ Enriquecer cada staff con sus servicios ACTIVOS (sin duplicados)
      const staffEnriquecido = await Promise.all(
        staffData.map(async (staff) => {
          let serviciosActivos = [];

          if (staff.trabajador_id) {
            serviciosActivos = await cargarServiciosTrabajador(staff.trabajador_id);
          }

          return {
            ...staff,
            servicios: serviciosActivos
          };
        })
      );

      console.log('Staff con servicios activos:', staffEnriquecido);

      // ✅ Eliminar duplicados por trabajador_id (por si acaso)
      const trabajadoresVistos = new Map();
      const staffSinDuplicados = staffEnriquecido.filter(staff => {
        if (!trabajadoresVistos.has(staff.trabajador_id)) {
          trabajadoresVistos.set(staff.trabajador_id, true);
          return true;
        }
        console.warn('⚠️ Staff duplicado detectado:', staff.trabajador?.nombres, staff.trabajador_id);
        return false;
      });

      console.log('Staff sin duplicados:', staffSinDuplicados);

      setStaffList(staffSinDuplicados);
      setTrabajadores(trabajadoresData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showNotification('Error al cargar los datos', 'error');
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadFoto = async () => {
    if (!selectedFile) return null;

    try {
      setUploadingFoto(true);
      const result = await uploadFotoStaff(selectedFile);
      return result.url;
    } catch (error) {
      console.error('Error al subir foto:', error);
      showNotification('Error al subir la foto', 'error');
      return null;
    } finally {
      setUploadingFoto(false);
    }
  };

  const handleCrear = async () => {
    try {
      if (!formData.trabajador_id) {
        showNotification('Debes seleccionar un trabajador', 'error');
        return;
      }

      let fotoUrl = formData.foto;

      if (selectedFile) {
        fotoUrl = await handleUploadFoto();
        if (!fotoUrl) {
          showNotification('Error al subir la foto', 'error');
          return;
        }
      }

      const dataToSend = {
        ...formData,
        foto: fotoUrl
      };

      await crearStaff(dataToSend);
      showNotification('Staff creado exitosamente', 'success');
      setModalNuevo(false);
      resetForm();
      cargarDatos(); // ✅ Recargar con servicios
    } catch (error) {
      console.error('Error al crear staff:', error);
      showNotification(error.response?.data?.message || 'Error al crear el staff', 'error');
    }
  };

  const handleEditar = async () => {
    try {
      if (!formData.trabajador_id) {
        showNotification('Debes seleccionar un trabajador', 'error');
        return;
      }

      let fotoUrl = formData.foto;

      if (selectedFile) {
        fotoUrl = await handleUploadFoto();
        if (!fotoUrl) {
          showNotification('Error al subir la foto', 'error');
          return;
        }
      }

      const dataToSend = {
        ...formData,
        foto: fotoUrl
      };

      await actualizarStaff(staffSeleccionado.id, dataToSend);
      showNotification('Staff actualizado exitosamente', 'success');
      setModalEditar(false);
      setStaffSeleccionado(null);
      resetForm();
      cargarDatos(); // ✅ Recargar con servicios
    } catch (error) {
      console.error('Error al actualizar staff:', error);
      showNotification(error.response?.data?.message || 'Error al actualizar el staff', 'error');
    }
  };

  const handleToggleActivo = async (staff) => {
    try {
      await cambiarEstadoStaff(staff.id, !staff.activo);
      showNotification(
        staff.activo ? 'Staff desactivado de la web' : 'Staff activado en la web',
        'success'
      );
      cargarDatos(); // ✅ Recargar con servicios
    } catch (error) {
      showNotification('Error al cambiar el estado del staff', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await eliminarStaff(staffSeleccionado.id);
      showNotification('Staff eliminado exitosamente', 'success');
      setModalDelete(false);
      setStaffSeleccionado(null);
      cargarDatos(); // ✅ Recargar con servicios
    } catch (error) {
      console.error('Error al eliminar staff:', error);
      showNotification(error.response?.data?.message || 'Error al eliminar el staff', 'error');
    }
  };

  const handleAbrirEditar = (staff) => {
    setStaffSeleccionado(staff);
    setFormData({
      trabajador_id: staff.trabajador_id,
      descripcion_especialidad: staff.descripcion_especialidad || '',
      foto: staff.foto || '',
      orden: staff.orden || 1,
      activo: staff.activo
    });
    setSelectedFile(null);
    if (staff.foto) {
      const filename = staff.foto.split('/').pop();
      setPreviewUrl(`${API_BASE_URL}/staff/foto/${filename}`);
    } else {
      setPreviewUrl('');
    }
    setModalEditar(true);
  };

  const handleAbrirDetalle = async (staff) => {
    try {
      // ✅ Cargar detalles completos con servicios ACTIVOS (sin duplicados)
      const detalles = await getStaffById(staff.id);
      const serviciosActivos = await cargarServiciosTrabajador(staff.trabajador_id);

      setStaffSeleccionado({
        ...detalles,
        servicios: serviciosActivos
      });
      setModalDetalle(true);
    } catch (error) {
      showNotification('Error al cargar los detalles', 'error');
    }
  };

  const handleAbrirEliminar = (staff) => {
    setStaffSeleccionado(staff);
    setModalDelete(true);
  };

  const resetForm = () => {
    setFormData({
      trabajador_id: '',
      descripcion_especialidad: '',
      foto: '',
      orden: 1,
      activo: true
    });
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const staffFiltrado = staffList.filter(staff => {
    const nombreCompleto = `${staff.trabajador?.nombres} ${staff.trabajador?.apellidos}`.toLowerCase();
    const matchBusqueda = !busqueda ||
      nombreCompleto.includes(busqueda.toLowerCase()) ||
      staff.trabajador?.especialidad?.toLowerCase().includes(busqueda.toLowerCase());

    const matchEstado = !filtroEstado ||
      (filtroEstado === 'activo' && staff.activo) ||
      (filtroEstado === 'inactivo' && !staff.activo);

    return matchBusqueda && matchEstado;
  });

  const trabajadoresDisponibles = trabajadores.filter(t =>
    !staffList.some(s => s.trabajador_id === t.id) ||
    (staffSeleccionado && t.id === staffSeleccionado.trabajador_id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-[#7B1FA2] rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 mt-3 text-xs font-medium tracking-wide">Cargando staff...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-1.5">Gestión de Staff Web</h1>
            <p className="text-sm text-gray-500">Administra los terapeutas que aparecen en la web pública</p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setModalNuevo(true);
            }}
            className="flex items-center gap-2 bg-[#7B1FA2] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#6A1B9A] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Agregar al Staff
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{staffList.length}</p>
                <p className="text-sm text-gray-500">Total en Staff</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {staffList.filter(s => s.activo).length}
                </p>
                <p className="text-sm text-gray-500">Activos en Web</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{trabajadores.length}</p>
                <p className="text-sm text-gray-500">Total Trabajadores</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o especialidad..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent"
              />
            </div>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activos en Web</option>
              <option value="inactivo">Inactivos en Web</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Terapeuta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Especialidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servicios Activos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado Web
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staffFiltrado.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-gray-400" />
                      <p className="text-sm text-gray-500">No se encontraron resultados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                staffFiltrado.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A] flex items-center justify-center text-white font-bold text-sm">
                          {staff.trabajador?.nombres?.[0]}{staff.trabajador?.apellidos?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {staff.trabajador?.nombres} {staff.trabajador?.apellidos}
                          </p>
                          <p className="text-xs text-gray-500">{staff.trabajador?.cargo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{staff.trabajador?.especialidad || 'Sin especialidad'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {staff.servicios && staff.servicios.length > 0 ? (
                          <>
                            {staff.servicios.slice(0, 2).map((servicio, idx) => (
                              <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                {servicio}
                              </span>
                            ))}
                            {staff.servicios.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                +{staff.servicios.length - 2}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">Sin servicios activos</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{staff.orden}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggleActivo(staff)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          staff.activo
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {staff.activo ? 'Visible' : 'Oculto'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleAbrirDetalle(staff)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAbrirEditar(staff)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAbrirEliminar(staff)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo */}
      {modalNuevo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Agregar al Staff</h2>
              <button
                onClick={() => setModalNuevo(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trabajador <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.trabajador_id}
                  onChange={(e) => setFormData({ ...formData, trabajador_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]"
                >
                  <option value="">Seleccionar trabajador...</option>
                  {trabajadoresDisponibles.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nombres} {t.apellidos} - {t.especialidad?.nombre || t.cargo?.nombre || 'Sin especialidad'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción de Especialidad
                </label>
                <textarea
                  value={formData.descripcion_especialidad}
                  onChange={(e) => setFormData({ ...formData, descripcion_especialidad: e.target.value })}
                  rows="3"
                  placeholder="Descripción profesional para mostrar en la web..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto del Terapeuta
                </label>
                <div className="space-y-3">
                  {/* Preview de la foto */}
                  {previewUrl && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Input de archivo */}
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#7B1FA2] hover:bg-purple-50 transition-all cursor-pointer">
                      <Upload className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {selectedFile ? selectedFile.name : 'Seleccionar imagen'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">Formatos: JPG, PNG, GIF, WEBP. Máximo 5MB</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orden de Aparición
                </label>
                <input
                  type="number"
                  value={formData.orden}
                  onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-200">
              <button
                onClick={() => setModalNuevo(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrear}
                disabled={uploadingFoto}
                className="px-4 py-2 bg-[#7B1FA2] text-white rounded-lg hover:bg-[#6A1B9A] transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingFoto ? 'Subiendo...' : 'Crear Staff'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {modalEditar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Editar Staff</h2>
              <button
                onClick={() => {
                  setModalEditar(false);
                  setStaffSeleccionado(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trabajador <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.trabajador_id}
                  onChange={(e) => setFormData({ ...formData, trabajador_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]"
                >
                  <option value="">Seleccionar trabajador...</option>
                  {trabajadoresDisponibles.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nombres} {t.apellidos} - {t.especialidad?.nombre || t.cargo?.nombre || 'Sin especialidad'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción de Especialidad
                </label>
                <textarea
                  value={formData.descripcion_especialidad}
                  onChange={(e) => setFormData({ ...formData, descripcion_especialidad: e.target.value })}
                  rows="3"
                  placeholder="Descripción profesional para mostrar en la web..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto del Terapeuta
                </label>
                <div className="space-y-3">
                  {/* Preview de la foto */}
                  {previewUrl && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Input de archivo */}
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#7B1FA2] hover:bg-purple-50 transition-all cursor-pointer">
                      <Upload className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {selectedFile ? selectedFile.name : 'Cambiar imagen'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">Formatos: JPG, PNG, GIF, WEBP. Máximo 5MB</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orden de Aparición
                </label>
                <input
                  type="number"
                  value={formData.orden}
                  onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-200">
              <button
                onClick={() => {
                  setModalEditar(false);
                  setStaffSeleccionado(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditar}
                disabled={uploadingFoto}
                className="px-4 py-2 bg-[#7B1FA2] text-white rounded-lg hover:bg-[#6A1B9A] transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingFoto ? 'Subiendo...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {modalDetalle && staffSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Detalles del Staff</h2>
              <button
                onClick={() => {
                  setModalDetalle(false);
                  setStaffSeleccionado(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                {staffSeleccionado.foto ? (
                  <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200">
                    <img
                      src={`${API_BASE_URL}/staff/foto/${staffSeleccionado.foto.split('/').pop()}`}
                      alt={`${staffSeleccionado.trabajador?.nombres} ${staffSeleccionado.trabajador?.apellidos}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Si falla la carga, mostrar las iniciales
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A] flex items-center justify-center text-white font-bold text-2xl" style={{display: 'none'}}>
                      {staffSeleccionado.trabajador?.nombres?.[0]}{staffSeleccionado.trabajador?.apellidos?.[0]}
                    </div>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A] flex items-center justify-center text-white font-bold text-2xl">
                    {staffSeleccionado.trabajador?.nombres?.[0]}{staffSeleccionado.trabajador?.apellidos?.[0]}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {staffSeleccionado.trabajador?.nombres} {staffSeleccionado.trabajador?.apellidos}
                  </h3>
                  <p className="text-sm text-gray-500">{staffSeleccionado.trabajador?.especialidad}</p>
                  <p className="text-xs text-gray-400">{staffSeleccionado.trabajador?.cargo}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Estado</label>
                  <p className={`mt-1 text-sm font-medium ${staffSeleccionado.activo ? 'text-green-600' : 'text-gray-400'}`}>
                    {staffSeleccionado.activo ? 'Activo en Web' : 'Inactivo'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Orden</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{staffSeleccionado.orden}</p>
                </div>
              </div>

              {staffSeleccionado.descripcion_especialidad && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Descripción</label>
                  <p className="mt-1 text-sm text-gray-700">{staffSeleccionado.descripcion_especialidad}</p>
                </div>
              )}

              {staffSeleccionado.servicios && staffSeleccionado.servicios.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Servicios</label>
                  <div className="flex flex-wrap gap-2">
                    {staffSeleccionado.servicios.map((servicio, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm">
                        {servicio}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {staffSeleccionado.areas && staffSeleccionado.areas.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Áreas de Atención</label>
                  <div className="flex flex-wrap gap-2">
                    {staffSeleccionado.areas.map((area, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
              <button
                onClick={() => {
                  setModalDetalle(false);
                  setStaffSeleccionado(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalDelete && staffSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                ¿Eliminar del Staff?
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                ¿Estás seguro de eliminar a <strong>{staffSeleccionado.trabajador?.nombres} {staffSeleccionado.trabajador?.apellidos}</strong> del staff de la web? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setModalDelete(false);
                    setStaffSeleccionado(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
