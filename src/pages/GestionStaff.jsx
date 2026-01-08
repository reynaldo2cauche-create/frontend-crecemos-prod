import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Power, Search, Eye, Trash2, X,
  Users, AlertCircle, User, Briefcase, Upload,
  Calendar, BookOpen, Save,
  ChevronLeft, ChevronRight, Filter, Download, RefreshCw
} from 'lucide-react';
import {
  getStaff,
  crearStaff,
  actualizarStaff,
  eliminarStaff,
  cambiarEstadoStaff,
  getStaffById,
  uploadFotoStaff,
  getStaffDetalleCompleto
} from '../services/staffService';
import { getTrabajadores } from '../services/trabajadorService';
import { getServiciosByTrabajador } from '../services/trabajadorServicioService';
import { API_BASE_URL } from '../services/api';

export default function GestionStaffCompleta() {
  const [staffList, setStaffList] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Estados para los modales
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [staffSeleccionado, setStaffSeleccionado] = useState(null);
  
  // Estado para tabs dentro del modal
  const [activeTab, setActiveTab] = useState('info');

  // Formulario principal (simplificado)
  const [formData, setFormData] = useState({
    trabajador_id: '',
    descripcion_especialidad: '',
    foto: '',
    orden: 1,
    activo: true,
    cursos: []
  });

  // Formulario para nuevo item (curso, formación, diplomado, etc - solo descripción)
  const [nuevoCurso, setNuevoCurso] = useState({
    descripcion: ''
  });

  // Estados para edición
  const [editandoCurso, setEditandoCurso] = useState(null); // índice de curso en edición

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarServiciosTrabajador = async (trabajadorId) => {
    try {
      const servicios = await getServiciosByTrabajador(trabajadorId);
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

      // Enriquecer cada staff con servicios
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

      // Eliminar duplicados
      const trabajadoresVistos = new Map();
      const staffSinDuplicados = staffEnriquecido.filter(staff => {
        if (!trabajadoresVistos.has(staff.trabajador_id)) {
          trabajadoresVistos.set(staff.trabajador_id, true);
          return true;
        }
        return false;
      });

      console.log('✅ Staff cargado desde GestionStaff:', staffSinDuplicados);
      console.log('📊 IDs de staff:', staffSinDuplicados.map(s => ({
        id: s.id,
        trabajador_id: s.trabajador_id,
        nombre: `${s.trabajador?.nombres || ''} ${s.trabajador?.apellidos || ''}`.trim()
      })));

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
      if (!fotoUrl) return;
    }

    // Obtener usuario actual del localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const usuarioId = user.id;

    // Preparar cursos (formaciones, diplomados, todo en una sola lista - solo descripción)
    const cursosParaEnviar = formData.cursos.map((c, index) => ({
      descripcion: c.descripcion,
      orden: index + 1
    }));

    const dataToSend = {
      trabajador_id: parseInt(formData.trabajador_id),
      descripcion_especialidad: formData.descripcion_especialidad || '',
      foto: fotoUrl || '',
      orden: formData.orden || 1,
      activo: formData.activo !== undefined ? formData.activo : true,
      cursos: cursosParaEnviar,
      user_id_crea: usuarioId
    };

    await crearStaff(dataToSend);
    showNotification('Staff creado exitosamente', 'success');
    setModalNuevo(false);
    resetForm();
    cargarDatos();
  } catch (error) {
    console.error('Error al crear staff:', error);
    const errorMessage = error.response?.data?.message ||
                        error.message ||
                        'Error al crear el staff';
    showNotification(errorMessage, 'error');
  }
};

const handleEditar = async (staff) => {
  try {
    setLoadingDetail(true);

    if (!staff.id || isNaN(staff.id)) {
      console.error('❌ Error: staff.id no válido:', staff.id);
      showNotification('Error: ID de staff no válido', 'error');
      setLoadingDetail(false);
      return;
    }

    const detalles = await getStaffDetalleCompleto(staff.id);

    setStaffSeleccionado(detalles);
    setFormData({
      trabajador_id: detalles.trabajador_id,
      descripcion_especialidad: detalles.descripcion_especialidad || '',
      foto: detalles.foto || '',
      orden: detalles.orden || 1,
      activo: detalles.activo,
      cursos: detalles.cursos ? detalles.cursos.map(c => ({
        id: c.id,
        descripcion: c.descripcion || '',
        orden: c.orden || 1
      })) : []
    });

    setSelectedFile(null);
    if (detalles.foto) {
      const filename = detalles.foto.split('/').pop();
      setPreviewUrl(`${API_BASE_URL}/staff/foto/${filename}`);
    } else {
      setPreviewUrl('');
    }
    setActiveTab('info');
    setModalEditar(true);
  } catch (error) {
    console.error('Error al cargar detalles para editar:', error);
    showNotification('Error al cargar los detalles', 'error');
  } finally {
    setLoadingDetail(false);
  }
};

const handleActualizar = async () => {
  try {
    if (!staffSeleccionado?.id) {
      showNotification('Error: No se pudo identificar el staff a actualizar', 'error');
      return;
    }

    let fotoUrl = formData.foto;
    if (selectedFile) {
      fotoUrl = await handleUploadFoto();
      if (!fotoUrl) return;
    }

    // Obtener usuario actual del localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const usuarioId = user.id;

    // Preparar cursos (formaciones, diplomados, todo - solo descripción)
    const cursosParaEnviar = formData.cursos.map((c, index) => {
      const curso = {
        descripcion: c.descripcion,
        orden: index + 1
      };
      // Solo incluir ID si es un ID real de BD (menor a 1000000)
      if (c.id && c.id < 1000000) {
        curso.id = c.id;
      }
      return curso;
    });

    const dataToSend = {
      trabajador_id: parseInt(formData.trabajador_id),
      descripcion_especialidad: formData.descripcion_especialidad || '',
      foto: fotoUrl || '',
      orden: formData.orden || 1,
      activo: formData.activo !== undefined ? formData.activo : true,
      cursos: cursosParaEnviar,
      user_id_actualiza: usuarioId
    };

    await actualizarStaff(staffSeleccionado.id, dataToSend);
    showNotification('Staff actualizado exitosamente', 'success');
    setModalEditar(false);
    resetForm();
    cargarDatos();
  } catch (error) {
    console.error('Error al actualizar staff:', error);
    const errorMessage = error.response?.data?.message ||
                        error.message ||
                        'Error al actualizar el staff';
    showNotification(errorMessage, 'error');
  }
};

  const handleToggleActivo = async (staff) => {
    try {
      await cambiarEstadoStaff(staff.id, !staff.activo);
      showNotification(
        staff.activo ? 'Staff desactivado de la web' : 'Staff activado en la web',
        'success'
      );
      cargarDatos();
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
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar staff:', error);
      showNotification(error.response?.data?.message || 'Error al eliminar el staff', 'error');
    }
  };

  const handleAbrirDetalle = async (staff) => {
    try {
      setLoadingDetail(true);

      // ✅ Validar que staff.id exista y sea válido
      if (!staff.id || isNaN(staff.id)) {
        console.error('❌ Error: staff.id no válido:', staff.id);
        showNotification('Error: ID de staff no válido', 'error');
        setLoadingDetail(false);
        return;
      }

      const detalles = await getStaffDetalleCompleto(staff.id);

      // ✅ Cargar servicios ACTIVOS del trabajador
      let serviciosActivos = [];
      if (detalles.trabajador_id) {
        try {
          const serviciosData = await getServiciosByTrabajador(detalles.trabajador_id);
          serviciosActivos = serviciosData.map(s => s.nombre);
        } catch (error) {
          console.error('Error al cargar servicios activos:', error);
        }
      }

      // Reemplazar servicios con solo los activos
      const detallesConServiciosActivos = {
        ...detalles,
        servicios: serviciosActivos.length > 0 ? serviciosActivos : detalles.servicios
      };

      setStaffSeleccionado(detallesConServiciosActivos);
      setModalDetalle(true);
    } catch (error) {
      showNotification('Error al cargar los detalles', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAbrirNuevo = () => {
    resetForm();
    setActiveTab('info');
    setModalNuevo(true);
  };

  const resetForm = () => {
    setFormData({
      trabajador_id: '',
      descripcion_especialidad: '',
      foto: '',
      orden: 1,
      activo: true,
      cursos: []
    });
    setNuevoCurso({
      descripcion: ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setEditandoCurso(null);
    setStaffSeleccionado(null);
  };

  // Funciones para manejar cursos/formaciones/diplomados (simplificadas - todo en una lista)
  const agregarCurso = () => {
    if (!nuevoCurso.descripcion || nuevoCurso.descripcion.trim() === '') {
      showNotification('Ingrese la descripción del curso', 'error');
      return;
    }

    if (editandoCurso !== null) {
      // Actualizar curso existente
      const nuevosCursos = [...formData.cursos];
      nuevosCursos[editandoCurso] = {
        ...nuevosCursos[editandoCurso],
        descripcion: nuevoCurso.descripcion
      };
      setFormData({ ...formData, cursos: nuevosCursos });
      setEditandoCurso(null);
      showNotification('Curso actualizado', 'success');
    } else {
      // Agregar nuevo curso
      setFormData({
        ...formData,
        cursos: [...formData.cursos, { descripcion: nuevoCurso.descripcion, id: Date.now() }]
      });
      showNotification('Curso agregado', 'success');
    }

    // Resetear formulario
    setNuevoCurso({ descripcion: '' });
  };

  const editarCurso = (index) => {
    const curso = formData.cursos[index];
    setNuevoCurso({
      descripcion: curso.descripcion || ''
    });
    setEditandoCurso(index);
    showNotification('Editando curso', 'info');
  };

  const cancelarEdicionCurso = () => {
    setEditandoCurso(null);
    setNuevoCurso({ descripcion: '' });
  };

  const eliminarCurso = (index) => {
    const nuevosCursos = formData.cursos.filter((_, i) => i !== index);
    setFormData({ ...formData, cursos: nuevosCursos });
    if (editandoCurso === index) {
      cancelarEdicionCurso();
    }
    showNotification('Curso eliminado', 'success');
  };

  // Filtrado y paginación
  const staffFiltrado = staffList.filter(staff => {
    const nombreCompleto = `${staff.trabajador?.nombres} ${staff.trabajador?.apellidos}`.toLowerCase();
    const matchBusqueda = !busqueda ||
      nombreCompleto.includes(busqueda.toLowerCase()) ||
      staff.trabajador?.especialidad?.toLowerCase().includes(busqueda.toLowerCase());

    const matchEstado = filtroEstado === 'todos' ||
      (filtroEstado === 'activo' && staff.activo) ||
      (filtroEstado === 'inactivo' && !staff.activo);

    return matchBusqueda && matchEstado;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = staffFiltrado.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(staffFiltrado.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
            <h1 className="text-3xl font-bold text-gray-900 mb-1.5">Gestión Completa de Staff</h1>
            <p className="text-sm text-gray-500">Administra toda la información de los terapeutas para la web pública</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={cargarDatos}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
            <button
              onClick={handleAbrirNuevo}
              className="flex items-center gap-2 bg-[#7B1FA2] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#6A1B9A] transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nuevo Staff
            </button>
          </div>
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
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {staffList.reduce((acc, s) => acc + (s.cursos?.length || 0), 0)}
                </p>
                <p className="text-sm text-gray-500">Total Formación y Logros</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, especialidad..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent"
              />
            </div>

            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos en Web</option>
              <option value="inactivo">Inactivos en Web</option>
            </select>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Mostrando {currentItems.length} de {staffFiltrado.length} resultados
              </span>
            </div>
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
                  Especialidad / Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-12 h-12 text-gray-300" />
                      <p className="text-sm text-gray-500">No se encontraron resultados</p>
                      <button
                        onClick={handleAbrirNuevo}
                        className="mt-2 text-[#7B1FA2] hover:text-[#6A1B9A] text-sm font-medium"
                      >
                        Crear nuevo staff
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {staff.foto ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                              <img
                                src={`${API_BASE_URL}/staff/foto/${staff.foto.split('/').pop()}`}
                                alt={staff.trabajador?.nombres}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A] hidden items-center justify-center text-white font-bold text-sm">
                                {staff.trabajador?.nombres?.[0]}{staff.trabajador?.apellidos?.[0]}
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A] flex items-center justify-center text-white font-bold text-sm">
                              {staff.trabajador?.nombres?.[0]}{staff.trabajador?.apellidos?.[0]}
                            </div>
                          )}
                          {staff.activo && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {staff.trabajador?.nombres} {staff.trabajador?.apellidos}
                          </p>
                          <p className="text-xs text-gray-500">{staff.trabajador?.cargo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {staff.trabajador?.especialidad || 'Sin especialidad'}
                        </p>
                        {staff.titulo_profesional && (
                          <p className="text-xs text-gray-500 mt-1">{staff.titulo_profesional}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {staff.orden}
                      </span>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleAbrirDetalle(staff)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditar(staff)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setStaffSeleccionado(staff);
                            setModalDelete(true);
                          }}
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

        {/* Paginación */}
        {staffFiltrado.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`w-8 h-8 text-sm rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-[#7B1FA2] text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nuevo/Editar Staff (COMPLETO) */}
      {(modalNuevo || modalEditar) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">
                {modalNuevo ? 'Nuevo Staff' : 'Editar Staff'}
              </h2>
              <button
                onClick={() => {
                  modalNuevo ? setModalNuevo(false) : setModalEditar(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Formulario Completo */}
              <div className="space-y-6">
                {/* Información Básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Columna Izquierda */}
                  <div className="space-y-4">
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
                        Orden de Aparición
                      </label>
                      <input
                        type="number"
                        value={formData.orden}
                        onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 1 })}
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]"
                      />
                      <p className="text-xs text-gray-500 mt-1">Define el orden en que aparecerá en la web</p>
                    </div>
                  </div>

                  {/* Columna Derecha - Foto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto del Terapeuta
                    </label>
                    <div className="space-y-3">
                      {/* Preview */}
                      {previewUrl && (
                        <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Upload */}
                      <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#7B1FA2] hover:bg-purple-50 transition-all cursor-pointer">
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {selectedFile ? selectedFile.name : 'Arrastra o haz clic para subir'}
                        </span>
                        <span className="text-xs text-gray-500">JPG, PNG, GIF, WEBP (Max. 5MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Descripción de Especialidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción de Especialidad
                  </label>
                  <textarea
                    value={formData.descripcion_especialidad}
                    onChange={(e) => setFormData({ ...formData, descripcion_especialidad: e.target.value })}
                    rows="3"
                    placeholder="Breve descripción de la especialidad para mostrar en tarjetas..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]"
                  />
                </div>

                {/* Formaciones / Cursos / Diplomados / Especializaciones (TODO en una lista) */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Formaciones, Cursos y Especializaciones</h3>
                  <p className="text-sm text-gray-600 mb-4">Agrega todas las formaciones académicas, cursos, diplomados, maestrías, especializaciones, etc.</p>
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {editandoCurso !== null ? 'Editar Item' : 'Agregar Nuevo'}
                      </h3>
                      {editandoCurso !== null && (
                        <button
                          onClick={cancelarEdicionCurso}
                          className="text-sm text-gray-600 hover:text-gray-800 underline"
                        >
                          Cancelar edición
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción *
                      </label>
                      <textarea
                        value={nuevoCurso.descripcion}
                        onChange={(e) => setNuevoCurso({ descripcion: e.target.value })}
                        rows="3"
                        placeholder="Ej: Magister en Gestión y Gerencia en Servicios de Salud"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]"
                      />
                      <p className="text-xs text-gray-500 mt-1">Escribe la descripción completa</p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={agregarCurso}
                        className="flex items-center gap-2 px-4 py-2 bg-[#7B1FA2] text-white rounded-lg hover:bg-[#6A1B9A]"
                      >
                        {editandoCurso !== null ? (
                          <>
                            <Save className="w-4 h-4" />
                            Actualizar
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Agregar
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Items Registrados ({formData.cursos.length})
                    </h3>
                    {formData.cursos.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No hay items registrados</p>
                    ) : (
                      <div className="space-y-3">
                        {formData.cursos.map((curso, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-sm text-gray-700">{curso.descripcion}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => editarCurso(index)}
                                  className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => eliminarCurso(index)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => {
                  modalNuevo ? setModalNuevo(false) : setModalEditar(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={modalNuevo ? handleCrear : handleActualizar}
                disabled={uploadingFoto}
                className="flex items-center gap-2 px-4 py-2 bg-[#7B1FA2] text-white rounded-lg hover:bg-[#6A1B9A] transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingFoto ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {modalNuevo ? 'Crear Staff' : 'Guardar Cambios'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Completo */}
      {modalDetalle && staffSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Detalles Completos del Staff</h2>
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

            {loadingDetail ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B1FA2] mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando detalles...</p>
              </div>
            ) : (
              <div className="p-6 space-y-8">
                {/* Información Principal */}
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <div className="w-full h-64 rounded-xl overflow-hidden border-2 border-gray-200">
                      {staffSeleccionado.foto ? (
                        <img
                          src={`${API_BASE_URL}/staff/foto/${staffSeleccionado.foto.split('/').pop()}`}
                          alt={staffSeleccionado.trabajador?.nombres}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A] flex items-center justify-center text-white text-4xl font-bold">
                          {staffSeleccionado.trabajador?.nombres?.[0]}{staffSeleccionado.trabajador?.apellidos?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        staffSeleccionado.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {staffSeleccionado.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      <span className="text-sm text-gray-600">Orden: {staffSeleccionado.orden}</span>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {staffSeleccionado.trabajador?.nombres} {staffSeleccionado.trabajador?.apellidos}
                      </h3>
                      <p className="text-sm text-gray-500">{staffSeleccionado.trabajador?.cargo}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Especialidad</p>
                        <p className="text-gray-900">{staffSeleccionado.trabajador?.especialidad}</p>
                      </div>
                      {staffSeleccionado.titulo_profesional && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Título Profesional</p>
                          <p className="text-gray-900">{staffSeleccionado.titulo_profesional}</p>
                        </div>
                      )}
                      {staffSeleccionado.universidad_principal && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Universidad</p>
                          <p className="text-gray-900">{staffSeleccionado.universidad_principal}</p>
                        </div>
                      )}
                      {staffSeleccionado.numero_colegiatura && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Colegiatura</p>
                          <p className="text-gray-900">{staffSeleccionado.numero_colegiatura}</p>
                        </div>
                      )}
                    </div>

                    {staffSeleccionado.descripcion_especialidad && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Descripción</p>
                        <p className="text-gray-900">{staffSeleccionado.descripcion_especialidad}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Biografía */}
                {staffSeleccionado.biografia && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Biografía Profesional</h4>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">{staffSeleccionado.biografia}</p>
                    </div>
                  </div>
                )}

                {/* Formación Académica */}
                {staffSeleccionado.formaciones && staffSeleccionado.formaciones.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Formación Académica</h4>
                    <div className="space-y-4">
                      {staffSeleccionado.formaciones.map((formacion, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div>
                              {formacion.titulo ? (
                                <>
                                  <h5 className="font-medium text-gray-900">{formacion.titulo}</h5>
                                  <p className="text-sm text-gray-600">{formacion.institucion}</p>
                                  {formacion.convenio_con && (
                                    <p className="text-xs text-gray-500">Convenio: {formacion.convenio_con}</p>
                                  )}
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formacion.anio_inicio} - {formacion.en_curso ? 'En curso' : formacion.anio_fin}
                                  </p>
                                  {formacion.descripcion && (
                                    <p className="text-sm text-gray-700 mt-2">{formacion.descripcion}</p>
                                  )}
                                </>
                              ) : (
                                <p className="text-sm text-gray-700">{formacion.descripcion || formacion.nombre || 'Sin descripción'}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cursos y Certificaciones */}
                {staffSeleccionado.cursos && staffSeleccionado.cursos.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Formación y Logros</h4>
                    <ul className="list-none space-y-3">
                      {staffSeleccionado.cursos.map((curso, index) => (
                        <li key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                          <div className="w-2 h-2 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700 leading-relaxed">{curso.descripcion || curso.nombre || 'Sin descripción'}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Servicios */}
                {staffSeleccionado.servicios && staffSeleccionado.servicios.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Servicios Asociados</h4>
                    <div className="flex flex-wrap gap-2">
                      {staffSeleccionado.servicios.map((servicio, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {typeof servicio === 'string' ? servicio : servicio.nombre || JSON.stringify(servicio)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
                ¿Estás seguro de eliminar permanentemente a{' '}
                <strong>{staffSeleccionado.trabajador?.nombres} {staffSeleccionado.trabajador?.apellidos}</strong>{' '}
                del staff de la web? Esta acción no se puede deshacer.
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