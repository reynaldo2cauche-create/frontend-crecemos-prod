// Fixed: setGuardando state added - v2
import React, { useState, useEffect } from 'react';
import {
  UserPlus, Edit2, Power, Check, X, Search, Eye,
  Mail, Phone, MapPin, User, Users, Briefcase, Shield,
  DollarSign, Calendar, Building2, CreditCard,
  Settings, Trash2, CheckCircle, XCircle,
  Info, Shirt, Upload, FileText, IdCard
} from 'lucide-react';
import {
  getTrabajadores,
  crearTrabajador,
  getRoles,
  getEspecialidades,
  getCargos,
  activarTrabajador,
  desactivarTrabajador,
  updateTrabajador,
  subirCV,
  subirDNI,
  verArchivo,
  eliminarCV,
  eliminarDNI,
  abrirArchivo,
// ← NUEVA
  getTrabajadorById  
} from '../../services/trabajadorService';
import { registrarPagoMensual } from '../../services/rrhhService';
import { getServicios, getGeneros, getEstadosCiviles, getParentescos, getProvincias, getDistritosByProvincia, getNivelesEducacion } from '../../services/catalogoService';
import { asignarServicio, getServiciosByTrabajador, desactivarServicio } from '../../services/trabajadorServicioService';
import api from '../../services/api';
import CuentasBancarias from '../../components/CuentasBancarias';

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([]);
  const [roles, setRoles] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [estadosCiviles, setEstadosCiviles] = useState([]);
  const [parentescos, setParentescos] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [distritos, setDistritos] = useState([]);
  const [nivelesEducacion, setNivelesEducacion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('activo');

  // Estados de modales
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalPago, setModalPago] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

  // Modal de confirmación de eliminación de archivos
  const [modalEliminarArchivo, setModalEliminarArchivo] = useState({
    show: false,
    tipo: null, // 'cv' o 'dni'
    empleadoId: null,
    callback: null
  });

  // Notificaciones
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [trabajadoresData, rolesData, especialidadesData, cargosData, serviciosData, generosData, estadosCivilesData, parentescosData, provinciasData, nivelesEducacionData] = await Promise.all([
        getTrabajadores(),
        getRoles(),
        getEspecialidades(),
        getCargos(),
        getServicios(),
        getGeneros(),
        getEstadosCiviles(),
        getParentescos(),
        getProvincias(),
        getNivelesEducacion()
      ]);
      setEmpleados(trabajadoresData);
      setRoles(rolesData);
      setEspecialidades(especialidadesData);
      setCargos(cargosData);
      setServicios(serviciosData);
      setGeneros(generosData);
      setEstadosCiviles(estadosCivilesData);
      setParentescos(parentescosData);
      setProvincias(provinciasData);
      setNivelesEducacion(nivelesEducacionData);

      console.log('Datos cargados:', {
        empleados: trabajadoresData?.length,
        roles: rolesData?.length,
        especialidades: especialidadesData?.length,
        cargos: cargosData?.length,
        servicios: serviciosData?.length,
        generos: generosData?.length,
        estadosCiviles: estadosCivilesData?.length,
        parentescos: parentescosData?.length,
        provincias: provinciasData?.length,
        nivelesEducacion: nivelesEducacionData?.length,
        serviciosData
      });
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

  const handleToggleActivo = async (empleado) => {
    try {
      if (empleado.estado === 1 || empleado.estado === true) {
        await desactivarTrabajador(empleado.id);
        showNotification('Empleado desactivado correctamente', 'success');
      } else {
        await activarTrabajador(empleado.id);
        showNotification('Empleado activado correctamente', 'success');
      }
      cargarDatos();
    } catch (error) {
      showNotification('Error al cambiar el estado del empleado', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/trabajadores/${empleadoSeleccionado.id}`);
      showNotification('Empleado eliminado exitosamente', 'success');
      setModalDelete(false);
      setEmpleadoSeleccionado(null);
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      showNotification('Error al eliminar el empleado', 'error');
    }
  };

  // Función para abrir el modal de confirmación de eliminación de archivos
  const handleOpenDeleteArchivo = (tipo, callback) => {
    setModalEliminarArchivo({
      show: true,
      tipo: tipo,
      callback: callback
    });
  };

  // Filtrar empleados
  const empleadosFiltrados = empleados.filter(emp => {
    const matchBusqueda = !busqueda ||
      emp.nombres?.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.apellidos?.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.dni?.includes(busqueda) ||
      emp.email?.toLowerCase().includes(busqueda.toLowerCase());

    const matchRol = !filtroRol || emp.rol?.nombre === filtroRol;
    const matchEstado = !filtroEstado ||
      (filtroEstado === 'activo' && (emp.estado === 1 || emp.estado === true)) ||
      (filtroEstado === 'inactivo' && (emp.estado === 0 || emp.estado === false));

    return matchBusqueda && matchRol && matchEstado;
  });

  const calcularCostoAnual = (sueldo_base) => {
    if (!sueldo_base) return 0;
    const sueldoAnual = sueldo_base * 12;
    const gratificaciones = sueldo_base * 0.25 * 2;
    return sueldoAnual + gratificaciones;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-[#7B1FA2] rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 mt-3 text-xs font-medium tracking-wide">Cargando empleados...</p>
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

      {/* Modal de Confirmación de Eliminación de Archivos */}
      {modalEliminarArchivo.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fade-in">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Eliminar {modalEliminarArchivo.tipo === 'cv' ? 'CV' : 'DNI'}</h3>
                  <p className="text-xs text-white/80">Esta acción no se puede deshacer</p>
                </div>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="px-6 py-5">
              <p className="text-gray-700 text-sm leading-relaxed mb-1">
                ¿Estás seguro de que deseas eliminar el <span className="font-bold">{modalEliminarArchivo.tipo === 'cv' ? 'Curriculum Vitae' : 'DNI'}</span> del empleado?
              </p>
              <p className="text-gray-500 text-xs">
                El archivo será eliminado permanentemente del sistema.
              </p>
            </div>

            {/* Botones de Acción */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setModalEliminarArchivo({ show: false, tipo: null, callback: null })}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (modalEliminarArchivo.callback) {
                    modalEliminarArchivo.callback();
                  }
                  setModalEliminarArchivo({ show: false, tipo: null, callback: null });
                }}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all shadow-sm hover:shadow flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1.5">Gestión de Empleados</h1>
            <p className="text-sm text-gray-500">Administra el personal completo de la institución</p>
          </div>

          <button
            onClick={() => setModalNuevo(true)}
            className="flex items-center gap-2 bg-[#7B1FA2] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#6A1B9A] transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Empleado
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{empleados.length}</p>
                <p className="text-sm text-gray-500">Total Empleados</p>
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
                  {empleados.filter(e => e.estado === true || e.estado === 1).length}
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
                  {empleados.filter(e => e.estado === false || e.estado === 0).length}
                </p>
                <p className="text-sm text-gray-500">Inactivos</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">
                  S/ {empleados
                    .filter(e => e.estado === true || e.estado === 1)
                    .reduce((sum, e) => sum + calcularCostoAnual(e.sueldo_base || 0), 0)
                    .toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Costo Anual</p>
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
              placeholder="Buscar por nombre, DNI o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
            />
          </div>

          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all bg-white"
          >
            <option value="">Todos los roles</option>
            {roles.map(rol => (
              <option key={rol.id} value={rol.nombre}>{rol.nombre}</option>
            ))}
          </select>

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

      {/* Lista de empleados */}
      {empleadosFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gradient-to-br from-[#9C27B0] to-[#BA68C8] opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-600 font-medium text-base mb-1">No se encontraron empleados</p>
          <p className="text-gray-400 text-sm">Ajusta los filtros de búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {empleadosFiltrados.map((empleado) => (
            <TarjetaEmpleado
              key={empleado.id}
              empleado={empleado}
              onEditar={(emp) => {
                setEmpleadoSeleccionado(emp);
                setModalEditar(true);
              }}
              onToggleActivo={handleToggleActivo}
              onVerDetalle={(emp) => {
                setEmpleadoSeleccionado(emp);
                setModalDetalle(true);
              }}
              onPago={(emp) => {
                setEmpleadoSeleccionado(emp);
                setModalPago(true);
              }}
              onDelete={(emp) => {
                setEmpleadoSeleccionado(emp);
                setModalDelete(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      {modalNuevo && (
        <ModalNuevoEmpleado
          onClose={() => setModalNuevo(false)}
          roles={roles}
          especialidades={especialidades}
          cargos={cargos}
          servicios={servicios}
          generos={generos}
          estadosCiviles={estadosCiviles}
          parentescos={parentescos}
          provincias={provincias}
          nivelesEducacion={nivelesEducacion}
          onSuccess={() => {
            cargarDatos();
            showNotification('Empleado creado correctamente', 'success');
          }}
          onError={(msg) => showNotification(msg, 'error')}
        />
      )}

      {modalEditar && empleadoSeleccionado && (
        <ModalEditarEmpleado
          empleado={empleadoSeleccionado}
          onClose={() => {
            setModalEditar(false);
            setEmpleadoSeleccionado(null);
          }}
          roles={roles}
          especialidades={especialidades}
          cargos={cargos}
          servicios={servicios}
          generos={generos}
          estadosCiviles={estadosCiviles}
          parentescos={parentescos}
          provincias={provincias}
          nivelesEducacion={nivelesEducacion}
          trabajadores={empleados}
          onSuccess={() => {
            cargarDatos();
            showNotification('Empleado actualizado correctamente', 'success');
          }}
          onError={(msg) => showNotification(msg, 'error')}
          onOpenDeleteArchivo={handleOpenDeleteArchivo}
        />
      )}

      {modalDetalle && empleadoSeleccionado && (
        <ModalDetalleEmpleado
          empleado={empleadoSeleccionado}
          onClose={() => {
            setModalDetalle(false);
            setEmpleadoSeleccionado(null);
          }}
          onEditar={() => {
            setModalDetalle(false);
            setModalEditar(true);
          }}
        />
      )}

      {modalPago && empleadoSeleccionado && (
        <ModalPago
          empleado={empleadoSeleccionado}
          onClose={() => {
            setModalPago(false);
            setEmpleadoSeleccionado(null);
          }}
          onSuccess={() => {
            showNotification('Pago registrado exitosamente', 'success');
          }}
          onError={(msg) => showNotification(msg, 'error')}
        />
      )}

      {modalDelete && empleadoSeleccionado && (
        <ModalConfirmDelete
          empleado={empleadoSeleccionado}
          onClose={() => {
            setModalDelete(false);
            setEmpleadoSeleccionado(null);
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

// Componente Tarjeta Empleado
const TarjetaEmpleado = ({ empleado, onEditar, onToggleActivo, onVerDetalle, onPago, onDelete }) => {
  const esActivo = empleado.estado === 1 || empleado.estado === true;

  return (
    <div className="group relative bg-white rounded-xl p-4 border border-gray-200 hover:border-[#7B1FA2]/50 hover:shadow-sm transition-all">
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm transition-all ${
          esActivo
            ? 'bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A]'
            : 'bg-gradient-to-br from-gray-400 to-gray-500'
        }`}>
          {(empleado.nombres?.[0] || '').toUpperCase()}{(empleado.apellidos?.[0] || '').toUpperCase()}
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">
            {empleado.nombres || ''} {empleado.apellidos || ''}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-1.5">
            <User className="w-3 h-3 flex-shrink-0 text-blue-500" />
            <span className="font-medium">@{empleado.username}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Mail className="w-3 h-3 flex-shrink-0 text-green-500" />
            <span className="truncate">{empleado.email}</span>
          </div>
        </div>

        {/* Estado badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border flex-shrink-0 ${
          esActivo
            ? 'bg-green-50 border-green-200'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${esActivo ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className={`text-[10px] font-semibold uppercase tracking-wide ${
            esActivo ? 'text-green-700' : 'text-gray-700'
          }`}>
            {esActivo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Info adicional */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <Shield className="w-3 h-3 flex-shrink-0 text-[#7B1FA2]" />
          <span className="font-medium text-gray-700">{empleado.rol?.nombre}</span>
        </div>

        {empleado.cargo && (
          <div className="flex items-center gap-2 text-xs">
            <Briefcase className="w-3 h-3 flex-shrink-0 text-orange-500" />
            <span className="text-gray-600">
              {empleado.cargo.nombre}
            </span>
          </div>
        )}

        {empleado.sueldo_base && (
          <div className="flex items-center gap-2 text-xs">
            <DollarSign className="w-3 h-3 flex-shrink-0 text-green-500" />
            <span className="text-gray-600">S/ {Number(empleado.sueldo_base).toLocaleString()}/mes</span>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="space-y-2 pt-3 border-t border-gray-100">
        {/* Primera fila de acciones */}
        <div className="flex gap-2">
          <button
            onClick={() => onVerDetalle(empleado)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-100 transition-all"
            title="Ver información completa"
          >
            <Eye className="w-3.5 h-3.5" />
            Ver
          </button>

          <button
            onClick={() => onEditar(empleado)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#A3C644] text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-[#8FB82D] transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Editar
          </button>

          {empleado.sueldo_base && (
            <button
              onClick={() => onPago(empleado)}
              className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-600 border border-green-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-green-100 transition-all"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Pago
            </button>
          )}
        </div>

        {/* Segunda fila - Estado */}
        <button
          onClick={() => onToggleActivo(empleado)}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            esActivo
              ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
          }`}
          title={esActivo ? 'Desactivar empleado' : 'Activar empleado'}
        >
          <Power className="w-3.5 h-3.5" />
          {esActivo ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </div>
  );
};

const DocumentosSection = ({
  empleado,
  onUploadCV,
  onUploadDNI,
  onViewCV,
  onViewDNI,
  onDeleteCV,
  onDeleteDNI,
  readOnly = false,
  onRefresh, // ✅ Asegúrate de recibir esta prop
  onOpenDeleteModal // ✅ Nueva prop para abrir el modal
}) => {
  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadingDNI, setUploadingDNI] = useState(false);
  const [deletingCV, setDeletingCV] = useState(false);
  const [deletingDNI, setDeletingDNI] = useState(false);

  // Prevenir el comportamiento por defecto del formulario
  const handleFormSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleFileUpload = async (type, file) => {
    console.log('🎯 DocumentosSection.handleFileUpload llamado');
    console.log('   Tipo:', type);
    console.log('   Archivo:', file?.name);
    console.log('   Tamaño:', file?.size);

    if (!file) {
      console.log('❌ No se recibió archivo');
      return;
    }

    const validTypes = {
      cv: ['.pdf', '.doc', '.docx'],
      dni: ['.pdf', '.jpg', '.jpeg', '.png']
    };

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    console.log('📄 Extensión del archivo:', ext);

    if (!validTypes[type].includes(ext)) {
      console.log('❌ Formato no válido:', ext);
      alert(`Formato no válido. Formatos aceptados para ${type.toUpperCase()}: ${validTypes[type].join(', ')}`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      console.log('❌ Archivo demasiado grande:', file.size);
      alert('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    console.log('✅ Archivo válido, procediendo a subir...');

    try {
      if (type === 'cv') {
        console.log('📤 Subiendo CV...');
        setUploadingCV(true);
        await onUploadCV(file);
        console.log('✅ onUploadCV completado');
      } else {
        console.log('📤 Subiendo DNI...');
        setUploadingDNI(true);
        await onUploadDNI(file);
        console.log('✅ onUploadDNI completado');
      }

      // ✅ IMPORTANTE: El refresh ya se hace dentro de handleUploadCV/handleUploadDNI
      // No es necesario hacerlo aquí también
      console.log('✅ Archivo subido exitosamente');
    } catch (error) {
      console.error(`❌ Error al subir ${type}:`, error);
      console.error('   Detalle:', error.message);
      alert(`Error al subir el ${type.toUpperCase()}`);
    } finally {
      if (type === 'cv') setUploadingCV(false);
      else setUploadingDNI(false);
    }
  };

  const handleViewDocument = async (type) => {
    try {
      if (type === 'cv') await onViewCV();
      else await onViewDNI();
    } catch (error) {
      console.error(`Error al ver ${type}:`, error);
      alert(`Error al visualizar el ${type.toUpperCase()}`);
    }
  };

  const handleDeleteDocument = async (type) => {
    // Usar el modal personalizado en lugar de window.confirm
    if (onOpenDeleteModal) {
      onOpenDeleteModal(type, async () => {
        try {
          if (type === 'cv') {
            setDeletingCV(true);
            await onDeleteCV();
          } else {
            setDeletingDNI(true);
            await onDeleteDNI();
          }

          // ✅ IMPORTANTE: Refrescar datos después de eliminar
          if (onRefresh) {
            // Esperar un momento para que el backend procese
            setTimeout(async () => {
              await onRefresh();
            }, 300);
          }
        } catch (error) {
          console.error(`Error al eliminar ${type}:`, error);
          alert(`Error al eliminar el ${type.toUpperCase()}`);
        } finally {
          if (type === 'cv') setDeletingCV(false);
          else setDeletingDNI(false);
        }
      });
      return;
    }

    // Fallback a window.confirm si no se pasó la prop (por compatibilidad)
    if (!window.confirm(`¿Estás seguro de eliminar el ${type.toUpperCase()}?`)) return;

    try {
      if (type === 'cv') {
        setDeletingCV(true);
        await onDeleteCV();
      } else {
        setDeletingDNI(true);
        await onDeleteDNI();
      }

      // ✅ IMPORTANTE: Refrescar datos después de eliminar
      if (onRefresh) {
        // Esperar un momento para que el backend procese
        setTimeout(async () => {
          await onRefresh();
        }, 300);
      }
    } catch (error) {
      console.error(`Error al eliminar ${type}:`, error);
      alert(`Error al eliminar el ${type.toUpperCase()}`);
    } finally {
      if (type === 'cv') setDeletingCV(false);
      else setDeletingDNI(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Documentos Adjuntos
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CV */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">Curriculum Vitae</h4>
            </div>
            {empleado.archivo_cv && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Subido
              </span>
            )}
          </div>

          {empleado.archivo_cv ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span className="truncate">{empleado.archivo_cv.split('/').pop()}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleViewDocument('cv')}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-100 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver
                </button>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument('cv')}
                    disabled={deletingCV}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-100 transition-all disabled:opacity-50"
                  >
                    {deletingCV ? (
                      <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-3">No se ha subido CV</p>
          )}

          {!readOnly && (
            <div className="mt-3">
              <form onSubmit={handleFormSubmit}>
                <label className="block">
                  <div className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-all ${uploadingCV ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}>
                    {uploadingCV ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-gray-600">Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Subir CV</span>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload('cv', e.target.files[0])}
                      disabled={uploadingCV}
                    />
                  </div>
                </label>
              </form>
              <p className="text-xs text-gray-500 mt-2">Formatos: PDF, DOC, DOCX (Max. 10MB)</p>
            </div>
          )}
        </div>

        {/* DNI */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <IdCard className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-gray-900">Copia de DNI</h4>
            </div>
            {empleado.archivo_dni && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Subido
              </span>
            )}
          </div>

          {empleado.archivo_dni ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span className="truncate">{empleado.archivo_dni.split('/').pop()}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleViewDocument('dni')}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-100 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver
                </button>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument('dni')}
                    disabled={deletingDNI}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-100 transition-all disabled:opacity-50"
                  >
                    {deletingDNI ? (
                      <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-3">No se ha subido DNI</p>
          )}

          {!readOnly && (
            <div className="mt-3">
              <form onSubmit={handleFormSubmit}>
                <label className="block">
                  <div className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-all ${uploadingDNI ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-green-400 hover:bg-green-50'}`}>
                    {uploadingDNI ? (
                      <>
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-gray-600">Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Subir DNI</span>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.webp"
                      onChange={(e) => handleFileUpload('dni', e.target.files[0])}
                      disabled={uploadingDNI}
                    />
                  </div>
                </label>
              </form>
              <p className="text-xs text-gray-500 mt-2">Formatos: PDF, JPG, PNG (Max. 10MB)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// Modal Nuevo Empleado
const ModalNuevoEmpleado = ({ onClose, roles, especialidades, cargos, servicios, generos, estadosCiviles, parentescos, provincias, nivelesEducacion, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    usuario: '',
    contrasena: '',
    email: '',
    correo_corporativo: '',
    rol: '',
    especialidad: '',
    cargo_id: '',
    telefono: '',
    telefono_emergencia: '',
    contacto_emergencia: '',
    talla_polo: '',
    talla_pantalon: '',
    talla_zapatos: '',
    numero_colegiatura: '',
    fecha_nacimiento: '',
    sexo_id: '',
    estado_civil_id: '',
    hijos: '',
    pais: '',
    referencia_direccion: '',
    parentesco_emergencia_id: '',
    provincia_id: '',
    distrito_id: '',
    procedencia_laboral: '',
    area_laboral: '',
    empresa_anterior: '',
    motivo_renuncia: '',
    hobbies: '',
    nivel_educacion_id: '',
    centro_estudios_principal: '',
    carrera_estudiada_principal: '',
    fecha_inicio_estudio: '',
    fecha_termino_estudio: '',
    sueldo_base: '',
    fecha_ingreso: '',
    numero_cuenta: '',
    banco: '',
    opciones_regalo: ''
  });

  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [distritosDisponibles, setDistritosDisponibles] = useState([]);

  // Estado para manejar archivos
  const [archivos, setArchivos] = useState({
    cv: null,
    dni: null
  });

  // Efecto para cargar distritos cuando cambia la provincia
  useEffect(() => {
    const cargarDistritos = async () => {
      if (formData.provincia_id) {
        try {
          const distritosData = await getDistritosByProvincia(formData.provincia_id);
          setDistritosDisponibles(distritosData);
        } catch (error) {
          console.error('Error al cargar distritos:', error);
          setDistritosDisponibles([]);
        }
      } else {
        setDistritosDisponibles([]);
        setFormData(prev => ({ ...prev, distrito_id: '' }));
      }
    };
    cargarDistritos();
  }, [formData.provincia_id]);

  const handleFileChange = (type, file) => {
    if (!file) return;

    const validTypes = {
      cv: ['.pdf', '.doc', '.docx'],
      dni: ['.pdf', '.jpg', '.jpeg', '.png']
    };

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validTypes[type].includes(ext)) {
      alert(`Formato no válido. Formatos aceptados para ${type.toUpperCase()}: ${validTypes[type].join(', ')}`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    setArchivos(prev => ({ ...prev, [type]: file }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validarFormulario = () => {
    const erroresNuevos = {};
    const camposObligatorios = ['nombres', 'apellidos', 'dni', 'usuario', 'contrasena', 'email', 'rol'];

    const rolObj = roles.find(r => r.nombre === formData.rol);
    if (rolObj?.nombre === 'Terapeuta') {
      camposObligatorios.push('especialidad');
    }

    camposObligatorios.forEach(campo => {
      if (!formData[campo]?.trim()) {
        erroresNuevos[campo] = 'Este campo es obligatorio';
      }
    });

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      erroresNuevos.email = 'Email inválido';
    }

    if (formData.dni && !/^\d{8}$/.test(formData.dni)) {
      erroresNuevos.dni = 'Debe tener 8 dígitos';
    }

    setErrors(erroresNuevos);
    return Object.keys(erroresNuevos).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      onError('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setLoading(true);

      // ✅ OBTENER EL USUARIO LOGUEADO (Administrador)
      const usuarioLogueado = JSON.parse(localStorage.getItem('user'));

      console.log('🔐 Usuario que crea:', {
        id: usuarioLogueado.id,
        nombre: usuarioLogueado.nombres,
        rol: usuarioLogueado.rol?.nombre
      });

      const rolObj = roles.find(r => r.nombre === formData.rol);
      const especialidadObj = formData.especialidad
        ? especialidades.find(e => e.nombre === formData.especialidad)
        : null;
      const cargoObj = formData.cargo
        ? cargos.find(c => c.nombre === formData.cargo)
        : null;
      const jefeObj = formData.jefe_id
        ? { id: formData.jefe_id }
        : null;

      console.log('🔍 FRONTEND CREAR - Preparando datos:', {
        'formData.rol': formData.rol,
        'formData.especialidad': formData.especialidad,
        rolObj,
        especialidadObj,
        'especialidad_id a enviar': especialidadObj?.id || null
      });

      const dataToCreate = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        dni: formData.dni,
        username: formData.usuario,
        password: formData.contrasena,
        email: formData.email,
        correo_corporativo: formData.correo_corporativo || null,
        telefono: formData.telefono || null,
        telefono_emergencia: formData.telefono_emergencia || null,
        contacto_emergencia: formData.contacto_emergencia || null,
        direccion: formData.direccion || null,
        distrito: formData.distrito || null,
        provincia: formData.provincia || null,
        departamento: formData.departamento || null,
        talla_polo: formData.talla_polo || null,
        talla_pantalon: formData.talla_pantalon || null,
        talla_zapatos: formData.talla_zapatos || null,
        numero_colegiatura: formData.numero_colegiatura || null,

        rol_id: rolObj?.id || null,
        especialidad_id: especialidadObj?.id || null,
        cargo_id: cargoObj?.id || null,
        jefe_id: jefeObj?.id || null,
        institucion_id: formData.institucion_id || null,

        fecha_nacimiento: formData.fecha_nacimiento || null,
        sexo_id: formData.sexo_id || null,
        estado_civil_id: formData.estado_civil_id || null,
        hijos: formData.hijos || null,
        pais: formData.pais || null,
        referencia_direccion: formData.referencia_direccion || null,
        parentesco_emergencia_id: formData.parentesco_emergencia_id || null,
        distrito_id: formData.distrito_id || null,

        procedencia_laboral: formData.procedencia_laboral || null,
        area_laboral: formData.area_laboral || null,
        empresa_anterior: formData.empresa_anterior || null,
        motivo_renuncia: formData.motivo_renuncia || null,

        nivel_educacion_id: formData.nivel_educacion_id || null,
        centro_estudios_principal: formData.centro_estudios_principal || null,
        carrera_estudiada_principal: formData.carrera_estudiada_principal || null,
        fecha_inicio_estudio: formData.fecha_inicio_estudio || null,
        fecha_termino_estudio: formData.fecha_termino_estudio || null,

        hobbies: formData.hobbies || null,

        // ✅ AGREGAR EL ID DEL USUARIO LOGUEADO (ADMINISTRADOR)
        user_id_actua: usuarioLogueado.id
      };

      console.log('🚀 FRONTEND - Enviando al backend:', {
        dataCompleta: dataToCreate,
        'data.rol_id': dataToCreate.rol_id,
        'data.especialidad_id': dataToCreate.especialidad_id,
        'data.cargo_id': dataToCreate.cargo_id,
        'data.user_id_actua': dataToCreate.user_id_actua // ✅ Verificar que se envía
      });

      await crearTrabajador(dataToCreate);

      onSuccess('Empleado creado correctamente');
      onClose();
    } catch (error) {
      console.error('Error al crear empleado:', error);
      const mensajeError = error.response?.data?.message || 'Error al crear el empleado';
      onError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const rolSeleccionado = roles.find(r => r.nombre === formData.rol);
  const esTerapeuta = rolSeleccionado?.nombre === 'Terapeuta';

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-3xl bg-white shadow-xl z-50 overflow-hidden flex flex-col">
        <div className="flex-shrink-0 bg-gradient-to-r from-[#7B1FA2] via-[#8E24AA] to-[#AB47BC] p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1.5">Nuevo Empleado</h2>
              <p className="text-sm text-white/90">Completa los datos del nuevo empleado</p>
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
            {/* Datos Personales */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                <User className="w-4 h-4" />
                Datos Personales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Nombres" name="nombres" value={formData.nombres} onChange={handleChange} error={errors.nombres} required />
                <InputField label="Apellidos" name="apellidos" value={formData.apellidos} onChange={handleChange} error={errors.apellidos} required />
                <InputField label="DNI" name="dni" value={formData.dni} onChange={handleChange} error={errors.dni} maxLength={8} required />
                <InputField label="Fecha de Nacimiento" name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleChange} />
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Sexo
                  </label>
                  <select
                    name="sexo_id"
                    value={formData.sexo_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7B1FA2]/20 focus:border-[#7B1FA2] outline-none transition-all"
                  >
                    <option value="">Seleccionar sexo</option>
                    {generos?.map(g => (
                      <option key={g.id} value={g.id}>{g.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Estado Civil
                  </label>
                  <select
                    name="estado_civil_id"
                    value={formData.estado_civil_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7B1FA2]/20 focus:border-[#7B1FA2] outline-none transition-all"
                  >
                    <option value="">Seleccionar estado civil</option>
                    {estadosCiviles?.map(ec => (
                      <option key={ec.id} value={ec.id}>{ec.nombre}</option>
                    ))}
                  </select>
                </div>
                <InputField label="Número de Hijos" name="hijos" type="number" value={formData.hijos} onChange={handleChange} min="0" />
                <InputField label="Email Personal" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} required />
                <InputField label="Email Corporativo" name="correo_corporativo" type="email" value={formData.correo_corporativo} onChange={handleChange} placeholder="correo@crecemos.com.pe" />
                <InputField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} maxLength={9} />
                <InputField label="Teléfono Emergencia" name="telefono_emergencia" value={formData.telefono_emergencia} onChange={handleChange} maxLength={9} />
                <InputField label="Contacto Emergencia" name="contacto_emergencia" value={formData.contacto_emergencia} onChange={handleChange} />
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Parentesco Contacto Emergencia
                  </label>
                  <select
                    name="parentesco_emergencia_id"
                    value={formData.parentesco_emergencia_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7B1FA2]/20 focus:border-[#7B1FA2] outline-none transition-all"
                  >
                    <option value="">Seleccionar parentesco</option>
                    {parentescos?.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <InputField label="País" name="pais" value={formData.pais} onChange={handleChange} placeholder="Perú" />
                <InputField label="Referencia de Dirección" name="referencia_direccion" value={formData.referencia_direccion} onChange={handleChange} className="md:col-span-2" />
              </div>
            </div>

            {/* Acceso y Cargo */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Acceso y Cargo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Usuario" name="usuario" value={formData.usuario} onChange={handleChange} error={errors.usuario} required />
                <InputField label="Contraseña" name="contrasena" type="password" value={formData.contrasena} onChange={handleChange} error={errors.contrasena} required />
                
                <SelectField 
                  label="Rol del Sistema" 
                  name="rol" 
                  value={formData.rol} 
                  onChange={handleChange} 
                  error={errors.rol} 
                  options={roles.map(r => r.nombre)} 
                  required 
                />
                
                <SelectField 
                  label="Cargo/Puesto de Trabajo" 
                  name="cargo_id" 
                  value={formData.cargo_id} 
                  onChange={handleChange} 
                  options={cargos.filter(c => c.activo).map(c => ({ 
                    value: c.id, 
                    label: `${c.nombre}` 
                  }))}
                  isValueLabel={true}
                />

                {esTerapeuta && (
                  <div className="md:col-span-2">
                    <SelectField
                      label="Especialidad Terapéutica"
                      name="especialidad"
                      value={formData.especialidad}
                      onChange={handleChange}
                      error={errors.especialidad}
                      options={especialidades.filter(e => e.activo && e.nombre && e.nombre.trim() !== '').map(e => e.nombre)}
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {esTerapeuta && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Servicios que Brinda
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-600 mb-4">Selecciona los servicios que este terapeuta puede brindar</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <h4 className="text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Infantil y Adolescentes
                      </h4>
                      <div className="space-y-1">
                        {servicios
                          .filter(s => s.activo && s.area.id === 1)
                          .map(servicio => (
                            <label key={servicio.id} className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded cursor-pointer transition-all">
                              <input
                                type="checkbox"
                                checked={serviciosSeleccionados.includes(servicio.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setServiciosSeleccionados([...serviciosSeleccionados, servicio.id]);
                                  } else {
                                    setServiciosSeleccionados(serviciosSeleccionados.filter(id => id !== servicio.id));
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{servicio.nombre}</span>
                            </label>
                          ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <h4 className="text-xs font-bold text-purple-700 mb-2 uppercase tracking-wide flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Adultos
                      </h4>
                      <div className="space-y-1">
                        {servicios
                          .filter(s => s.activo && s.area.id === 2)
                          .map(servicio => (
                            <label key={servicio.id} className="flex items-center gap-2 p-2 hover:bg-purple-50 rounded cursor-pointer transition-all">
                              <input
                                type="checkbox"
                                checked={serviciosSeleccionados.includes(servicio.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setServiciosSeleccionados([...serviciosSeleccionados, servicio.id]);
                                  } else {
                                    setServiciosSeleccionados(serviciosSeleccionados.filter(id => id !== servicio.id));
                                  }
                                }}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <span className="text-sm text-gray-700">{servicio.nombre}</span>
                            </label>
                          ))}
                      </div>
                    </div>
                  </div>

                  {serviciosSeleccionados.length === 0 && (
                    <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      No has seleccionado ningún servicio
                    </p>
                  )}
                  {serviciosSeleccionados.length > 0 && (
                    <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {serviciosSeleccionados.length} servicio{serviciosSeleccionados.length > 1 ? 's' : ''} seleccionado{serviciosSeleccionados.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tallas */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Shirt className="w-4 h-4" />
                Tallas de Uniforme (Opcional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SelectField
                  label="Talla Polo/Camisa"
                  name="talla_polo"
                  value={formData.talla_polo}
                  onChange={handleChange}
                  options={['XS', 'S', 'M', 'L', 'XL', 'XXL']}
                />
                <SelectField
                  label="Talla Pantalón"
                  name="talla_pantalon"
                  value={formData.talla_pantalon}
                  onChange={handleChange}
                  options={['26', '28', '30', '32', '34', '36', '38', '40', '42', '44']}
                />
                <SelectField
                  label="Talla Zapatos"
                  name="talla_zapatos"
                  value={formData.talla_zapatos}
                  onChange={handleChange}
                  options={['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45']}
                />
              </div>
            </div>

            {/* Datos Profesionales */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Datos Profesionales (Opcional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Número de Colegiatura" name="numero_colegiatura" value={formData.numero_colegiatura} onChange={handleChange} placeholder="Ej: CPsP 12345" />
                <InputField label="Procedencia Laboral" name="procedencia_laboral" value={formData.procedencia_laboral} onChange={handleChange} placeholder="Lugar de trabajo anterior" />
                <InputField label="Área Laboral" name="area_laboral" value={formData.area_laboral} onChange={handleChange} placeholder="Área de trabajo" />
                <InputField label="Empresa Anterior" name="empresa_anterior" value={formData.empresa_anterior} onChange={handleChange} />
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Motivo de Renuncia</label>
                  <textarea
                    name="motivo_renuncia"
                    value={formData.motivo_renuncia}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7B1FA2]/20 focus:border-[#7B1FA2] outline-none transition-all"
                    placeholder="Breve descripción del motivo..."
                  />
                </div>
              </div>
            </div>

            {/* Datos Adicionales */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                <User className="w-4 h-4" />
                Datos Adicionales (Opcional)
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Hobbies e Intereses</label>
                  <textarea
                    name="hobbies"
                    value={formData.hobbies}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7B1FA2]/20 focus:border-[#7B1FA2] outline-none transition-all"
                    placeholder="Actividades, deportes, pasatiempos..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Opciones de Regalo</label>
                  <textarea
                    name="opciones_regalo" 
                    value={formData.opciones_regalo} 
                    onChange={handleChange} 
                    multiline 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7B1FA2]/20 focus:border-[#7B1FA2] outline-none transition-all"
                    placeholder="Preferencias de regalo, tallas, etc."
                  />
                </div>
              </div>
            </div>

            {/* Documentos */}
            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Documentos Adjuntos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CV */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Curriculum Vitae (CV)
                  </label>
                  <label className="block">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                      <Upload className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-700">
                          {archivos.cv ? archivos.cv.name : 'Seleccionar archivo'}
                        </p>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX (Max. 10MB)</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange('cv', e.target.files[0])}
                    />
                  </label>
                  {archivos.cv && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-600">{archivos.cv.name}</span>
                      <button
                        onClick={() => setArchivos(prev => ({ ...prev, cv: null }))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* DNI */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Copia de DNI
                  </label>
                  <label className="block">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
                      <Upload className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-700">
                          {archivos.dni ? archivos.dni.name : 'Seleccionar archivo'}
                        </p>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG (Max. 10MB)</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.webp"
                      onChange={(e) => handleFileChange('dni', e.target.files[0])}
                    />
                  </label>
                  {archivos.dni && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-600">{archivos.dni.name}</span>
                      <button
                        onClick={() => setArchivos(prev => ({ ...prev, dni: null }))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Datos Financieros */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Datos Financieros (Opcional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <InputField label="Sueldo Base (S/)" name="sueldo_base" type="number" step="0.01" value={formData.sueldo_base} onChange={handleChange} />
                <InputField label="Fecha de Ingreso" name="fecha_ingreso" type="date" value={formData.fecha_ingreso} onChange={handleChange} />
                <SelectField
                  label="Banco Principal"
                  name="banco"
                  value={formData.banco}
                  onChange={handleChange}
                  options={['BCP', 'BBVA', 'INTERBANK', 'SCOTIABANK', 'BANBIF', 'PICHINCHA', 'OTROS']}
                />
                <InputField label="Número de Cuenta Principal" name="numero_cuenta" value={formData.numero_cuenta} onChange={handleChange} />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                <p className="text-xs text-blue-800 flex items-center gap-2">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span>Puedes agregar cuentas bancarias adicionales después de crear el empleado, editando su perfil.</span>
                </p>
              </div>
            </div>
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

// Modal Editar Empleado
const ModalEditarEmpleado = ({ empleado, onClose, roles, especialidades, cargos, servicios, generos, estadosCiviles, parentescos, provincias, nivelesEducacion, trabajadores = [], onSuccess, onError, onOpenDeleteArchivo }) => {
  const [formData, setFormData] = useState({
    nombres: empleado.nombres || '',
    apellidos: empleado.apellidos || '',
    dni: empleado.dni || '',
    usuario: empleado.username || '',
    email: empleado.email || '',
    correo_corporativo: empleado.correo_corporativo || '',
    rol: empleado.rol?.nombre || '',
    especialidad: empleado.especialidad?.nombre || '',
    contrasena: '',
    cargo_id: empleado.cargo?.id || '',
    jefe_id: empleado.jefe?.id || '',
    telefono: empleado.telefono || '',
    telefono_emergencia: empleado.telefono_emergencia || '',
    contacto_emergencia: empleado.contacto_emergencia || '',
    direccion: empleado.direccion || '',
    distrito: empleado.distrito || '',
    provincia: empleado.provincia || '',
    provincia_id: empleado.distrito_rel?.provincia?.id || '',
    distrito_id: empleado.distrito_id || '',
    departamento: empleado.departamento || '',
    talla_polo: empleado.talla_polo || '',
    talla_pantalon: empleado.talla_pantalon || '',
    talla_zapatos: empleado.talla_zapatos || '',
    numero_colegiatura: empleado.numero_colegiatura || '',
    fecha_nacimiento: empleado.fecha_nacimiento || '',
    sexo_id: empleado.sexo?.id || '',
    estado_civil_id: empleado.estado_civil?.id || '',
    hijos: empleado.hijos || '',
    pais: empleado.pais || '',
    referencia_direccion: empleado.referencia_direccion || '',
    parentesco_emergencia_id: empleado.parentesco_emergencia?.id || '',
    procedencia_laboral: empleado.procedencia_laboral || '',
    area_laboral: empleado.area_laboral || '',
    empresa_anterior: empleado.empresa_anterior || '',
    motivo_renuncia: empleado.motivo_renuncia || '',
    hobbies: empleado.hobbies || '',
    opciones_regalo: empleado.opciones_regalo || '', 
    nivel_educacion_id: empleado.nivel_educacion?.id || '',
    centro_estudios_principal: empleado.centro_estudios_principal || '',
    carrera_estudiada_principal: empleado.carrera_estudiada_principal || '',
    fecha_inicio_estudio: empleado.fecha_inicio_estudio || '',
    fecha_termino_estudio: empleado.fecha_termino_estudio || '',
    archivo_cv: empleado.archivo_cv || '',
    archivo_dni: empleado.archivo_dni || '',
    sueldo_base: empleado.sueldo_base || '',
    fecha_ingreso: empleado.fecha_ingreso || ''
  });
  
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [serviciosOriginales, setServiciosOriginales] = useState([]);
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [empleadoActual, setEmpleadoActual] = useState(empleado);
  const [distritosDisponibles, setDistritosDisponibles] = useState([]);

  // Efecto para cargar distritos cuando cambia la provincia
  useEffect(() => {
    const cargarDistritos = async () => {
      if (formData.provincia_id) {
        try {
          const distritosData = await getDistritosByProvincia(formData.provincia_id);
          setDistritosDisponibles(distritosData);
        } catch (error) {
          console.error('Error al cargar distritos:', error);
          setDistritosDisponibles([]);
        }
      } else {
        setDistritosDisponibles([]);
      }
    };
    cargarDistritos();
  }, [formData.provincia_id]);

  // Cargar servicios del empleado
  useEffect(() => {
    const cargarServicios = async () => {
      if (empleado.rol?.nombre === 'Terapeuta') {
        console.log('✅ Es Terapeuta, cargando servicios...');
        try {
          setCargandoServicios(true);
          const serviciosData = await getServiciosByTrabajador(empleado.id);
          const serviciosIds = serviciosData.map(s => s.id);

          console.log('Servicios cargados del empleado:', serviciosData);
          console.log('IDs de servicios:', serviciosIds);

          setServiciosSeleccionados(serviciosIds);
          setServiciosOriginales(serviciosIds);
        } catch (error) {
          console.error('Error al cargar servicios:', error);
        } finally {
          setCargandoServicios(false);
        }
      } else {
        console.log('❌ NO es Terapeuta, no se cargarán servicios');
        setCargandoServicios(false);
      }
    };

    cargarServicios();
  }, [empleado.id, empleado.rol?.nombre]);



  const handleCheckboxChange = (servicioId, isChecked) => {
    console.log('Checkbox cambiado:', { servicioId, isChecked });
    
    if (isChecked) {
      if (!serviciosSeleccionados.includes(servicioId)) {
        setServiciosSeleccionados(prev => [...prev, servicioId]);
      }
    } else {
      setServiciosSeleccionados(prev => prev.filter(id => id !== servicioId));
    }
  };

  // Funciones para manejar documentos
  const handleUploadCV = async (file) => {
    console.log('📤 handleUploadCV - Subiendo CV...');
    console.log('   Empleado ID:', empleado.id);
    console.log('   Archivo:', file.name);
    console.log('   Tamaño:', file.size);

    try {
      const resultado = await subirCV(empleado.id, file);
      console.log('✅ CV subido exitosamente:', resultado);
      await refrescarEmpleado(); // ✅ Refrescar después de subir
    } catch (error) {
      console.error('❌ Error al subir CV:', error);
      console.error('   Detalle:', error.message);
      throw error;
    }
  };

  const handleUploadDNI = async (file) => {
    console.log('📤 handleUploadDNI - Subiendo DNI...');
    console.log('   Empleado ID:', empleado.id);
    console.log('   Archivo:', file.name);
    console.log('   Tamaño:', file.size);

    try {
      const resultado = await subirDNI(empleado.id, file);
      console.log('✅ DNI subido exitosamente:', resultado);
      await refrescarEmpleado(); // ✅ Refrescar después de subir
    } catch (error) {
      console.error('❌ Error al subir DNI:', error);
      console.error('   Detalle:', error.message);
      throw error;
    }
  };

  const handleViewCV = async () => {
  try {
    // Usar el nombre del archivo directamente
    if (empleadoActual.archivo_cv) {
      await abrirArchivo(empleadoActual.archivo_cv);
    } else {
      alert('No hay CV subido');
    }
  } catch (error) {
    console.error('Error al ver CV:', error);
    alert('Error al abrir el CV');
  }
};

const handleViewDNI = async () => {
  try {
    if (empleadoActual.archivo_dni) {
      await abrirArchivo(empleadoActual.archivo_dni);
    } else {
      alert('No hay DNI subido');
    }
  } catch (error) {
    console.error('Error al ver DNI:', error);
    alert('Error al abrir el DNI');
  }
};

// Función para refrescar los datos del empleado
const refrescarEmpleado = async () => {
  try {
    console.log('🔄 Refrescando datos del empleado ID:', empleado.id);
    const empleadoActualizado = await getTrabajadorById(empleado.id);
    console.log('✅ Empleado actualizado obtenido:', {
      id: empleadoActualizado.id,
      archivo_cv: empleadoActualizado.archivo_cv,
      archivo_dni: empleadoActualizado.archivo_dni
    });
    setEmpleadoActual(empleadoActualizado);
    console.log('✅ Estado empleadoActual actualizado');
    return empleadoActualizado; // Importante retornar
  } catch (error) {
    console.error('❌ Error al refrescar empleado:', error);
  }
};

  const handleDeleteCV = async () => {
    await eliminarCV(empleado.id);
    await refrescarEmpleado(); // ✅ Refrescar después de eliminar
  };

  const handleDeleteDNI = async () => {
    await eliminarDNI(empleado.id);
    await refrescarEmpleado(); // ✅ Refrescar después de eliminar
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleProvinciaChange = async (e) => {
    const provinciaId = e.target.value === '' ? '' : parseInt(e.target.value);
    const provinciaSeleccionada = provincias.find(p => p.id === provinciaId);

    console.log('🌍 Cambiando provincia:', {
      provinciaId,
      nombre: provinciaSeleccionada?.nombre
    });

    // Actualizar provincia_id, provincia (nombre) y departamento
    setFormData(prev => ({
      ...prev,
      provincia_id: provinciaId || '',
      provincia: provinciaSeleccionada?.nombre || '',
      departamento: provinciaSeleccionada?.region || '',
      distrito_id: '',  // Limpiar distrito porque cambió provincia
      distrito: ''
    }));

    // Cargar distritos de la nueva provincia
    if (provinciaId) {
      try {
        const distritosData = await getDistritosByProvincia(provinciaId);
        setDistritosDisponibles(distritosData || []);
        console.log('✅ Distritos cargados:', distritosData?.length);
      } catch (error) {
        console.error('❌ Error al cargar distritos:', error);
        setDistritosDisponibles([]);
      }
    } else {
      setDistritosDisponibles([]);
    }
  };

  const handleDistritoChange = (e) => {
    const distritoId = e.target.value === '' ? '' : parseInt(e.target.value);
    const distritoSeleccionado = distritosDisponibles.find(d => d.id === distritoId);

    console.log('📍 Cambiando distrito:', {
      distritoId,
      tipo: typeof distritoId,
      nombre: distritoSeleccionado?.nombre,
      distritoSeleccionado
    });

    // Actualizar distrito_id y distrito (nombre)
    setFormData(prev => {
      const nuevoEstado = {
        ...prev,
        distrito_id: distritoId || '',
        distrito: distritoSeleccionado?.nombre || ''
      };
      console.log('📊 Estado actualizado con distrito_id:', nuevoEstado.distrito_id);
      return nuevoEstado;
    });
  };

  const validarFormulario = () => {
    const erroresNuevos = {};
    const camposObligatorios = ['nombres', 'apellidos', 'dni', 'usuario', 'email', 'rol'];

    const rolObj = roles.find(r => r.nombre === formData.rol);
    if (rolObj?.nombre === 'Terapeuta') {
      camposObligatorios.push('especialidad');
    }

    camposObligatorios.forEach(campo => {
      if (!formData[campo]?.trim()) {
        erroresNuevos[campo] = 'Este campo es obligatorio';
      }
    });

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      erroresNuevos.email = 'Email inválido';
    }

    if (formData.dni && !/^\d{8}$/.test(formData.dni)) {
      erroresNuevos.dni = 'Debe tener 8 dígitos';
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
      // ✅ OBTENER EL USUARIO LOGUEADO (Administrador)
      const usuarioLogueado = JSON.parse(localStorage.getItem('user'));

      const rolObj = roles.find(r => r.nombre === formData.rol);
      const especialidadObj = especialidades.find(e => e.nombre === formData.especialidad);

      console.log('🔍 FRONTEND EDITAR - Preparando datos:', {
        'formData.rol': formData.rol,
        'formData.especialidad': formData.especialidad,
        'rolObj': rolObj,
        'especialidadObj': especialidadObj,
        'especialidad_id a enviar': especialidadObj?.id || null,
        '🌍 formData.provincia_id': formData.provincia_id,
        '🌍 formData.distrito_id': formData.distrito_id,
        '🌍 formData.distrito': formData.distrito,
        '🌍 formData.provincia': formData.provincia,
        '🌍 formData.departamento': formData.departamento
      });

      const data = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        dni: formData.dni,
        username: formData.usuario,
        email: formData.email,
        correo_corporativo: formData.correo_corporativo || null,
        rol_id: rolObj.id,
        especialidad_id: especialidadObj?.id || null,
        cargo_id: formData.cargo_id ? parseInt(formData.cargo_id) : null,
        jefe_id: formData.jefe_id ? parseInt(formData.jefe_id) : null,
        telefono: formData.telefono || null,
        telefono_emergencia: formData.telefono_emergencia || null,
        contacto_emergencia: formData.contacto_emergencia || null,
        direccion: formData.direccion || null,
        // Los campos distrito, provincia y departamento se actualizan automáticamente en el backend basándose en distrito_id
        talla_polo: formData.talla_polo || null,
        talla_pantalon: formData.talla_pantalon || null,
        talla_zapatos: formData.talla_zapatos || null,
        numero_colegiatura: formData.numero_colegiatura || null,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        sexo_id: formData.sexo_id ? parseInt(formData.sexo_id) : null,
        estado_civil_id: formData.estado_civil_id ? parseInt(formData.estado_civil_id) : null,
        hijos: formData.hijos ? parseInt(formData.hijos) : null,
        pais: formData.pais || null,
        referencia_direccion: formData.referencia_direccion || null,
        parentesco_emergencia_id: formData.parentesco_emergencia_id ? parseInt(formData.parentesco_emergencia_id) : null,
        distrito_id: formData.distrito_id ? parseInt(formData.distrito_id) : null,
        procedencia_laboral: formData.procedencia_laboral || null,
        area_laboral: formData.area_laboral || null,
        empresa_anterior: formData.empresa_anterior || null,
        motivo_renuncia: formData.motivo_renuncia || null,
        hobbies: formData.hobbies || null,
        opciones_regalo: formData.opciones_regalo || null, 
        nivel_educacion_id: formData.nivel_educacion_id ? parseInt(formData.nivel_educacion_id) : null,
        centro_estudios_principal: formData.centro_estudios_principal || null,
        carrera_estudiada_principal: formData.carrera_estudiada_principal || null,
        fecha_inicio_estudio: formData.fecha_inicio_estudio || null,
        fecha_termino_estudio: formData.fecha_termino_estudio || null,
        // ❌ NO enviar archivo_cv y archivo_dni aquí - se manejan con endpoints separados
        // archivo_cv: formData.archivo_cv || null,
        // archivo_dni: formData.archivo_dni || null,
        sueldo_base: formData.sueldo_base ? parseFloat(formData.sueldo_base) : null,
        fecha_ingreso: formData.fecha_ingreso || null,

        // ✅ AGREGAR EL ID DEL USUARIO LOGUEADO (ADMINISTRADOR)
        user_id_actua: usuarioLogueado.id
      };

      if (formData.contrasena?.trim()) {
        data.password = formData.contrasena;
      }

      console.log('🚀 FRONTEND - Enviando al backend:', {
        empleadoId: empleado.id,
        dataCompleta: data,
        'data.rol_id': data.rol_id,
        'data.especialidad_id': data.especialidad_id,
        'data.cargo_id': data.cargo_id,
        '🌍 data.distrito_id': data.distrito_id,
        '🌍 formData.distrito_id': formData.distrito_id,
        'tipo distrito_id': typeof data.distrito_id
      });

      // Actualizar datos del empleado
      await updateTrabajador(empleado.id, data);

      // Si es terapeuta, actualizar servicios
      if (esTerapeuta) {
        console.log('Procesando servicios...');
        console.log('Servicios originales:', serviciosOriginales);
        console.log('Servicios seleccionados:', serviciosSeleccionados);
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id || 1;

        const serviciosAgregar = serviciosSeleccionados.filter(id => !serviciosOriginales.includes(id));
        const serviciosEliminar = serviciosOriginales.filter(id => !serviciosSeleccionados.includes(id));

        console.log('Servicios a agregar:', serviciosAgregar);
        console.log('Servicios a eliminar:', serviciosEliminar);

        // Agregar nuevos servicios
        for (const servicioId of serviciosAgregar) {
          try {
            await asignarServicio(empleado.id, servicioId, '', userId);
            console.log(`Servicio ${servicioId} agregado exitosamente`);
          } catch (error) {
            console.error(`Error al agregar servicio ${servicioId}:`, error);
          }
        }

        // Eliminar servicios
        for (const servicioId of serviciosEliminar) {
          try {
            await desactivarServicio(empleado.id, servicioId, userId);
            console.log(`Servicio ${servicioId} eliminado exitosamente`);
          } catch (error) {
            console.error(`Error al eliminar servicio ${servicioId}:`, error);
          }
        }

        // Recargar servicios desde el backend para sincronizar estado
        try {
          const serviciosActualizados = await getServiciosByTrabajador(empleado.id);
          const serviciosIds = serviciosActualizados.map(s => s.id);
          setServiciosOriginales(serviciosIds);
          setServiciosSeleccionados(serviciosIds);
          console.log('Servicios recargados después de guardar:', serviciosIds);
        } catch (error) {
          console.error('Error al recargar servicios:', error);
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar el empleado';
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const rolSeleccionado = roles.find(r => r.nombre === formData.rol);
  const esTerapeuta = rolSeleccionado?.nombre === 'Terapeuta';

  // Servicios agrupados por área
  const serviciosInfantiles = servicios.filter(s => s.activo && s.area?.id === 1);
  const serviciosAdultos = servicios.filter(s => s.activo && s.area?.id === 2);

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-3xl bg-white shadow-xl z-50 overflow-hidden flex flex-col">
        <div className="flex-shrink-0 bg-gradient-to-r from-[#7B1FA2] via-[#8E24AA] to-[#AB47BC] p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1.5">Editar Empleado</h2>
              <p className="text-sm text-white/90">{empleado.nombres} {empleado.apellidos}</p>
            </div>
            <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Datos Básicos */}
            <Section title="Datos Básicos" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Nombres" name="nombres" value={formData.nombres} onChange={handleChange} required error={errors.nombres} />
                <InputField label="Apellidos" name="apellidos" value={formData.apellidos} onChange={handleChange} required error={errors.apellidos} />
                <InputField label="DNI" name="dni" value={formData.dni} onChange={handleChange} maxLength={8} required error={errors.dni} />
                <InputField label="Fecha de Nacimiento" name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleChange} />
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Sexo
                  </label>
                  <select
                    name="sexo_id"
                    value={formData.sexo_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
                  >
                    <option value="">Seleccionar sexo</option>
                    {generos?.map(g => (
                      <option key={g.id} value={g.id}>{g.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Estado Civil
                  </label>
                  <select
                    name="estado_civil_id"
                    value={formData.estado_civil_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
                  >
                    <option value="">Seleccionar estado civil</option>
                    {estadosCiviles?.map(ec => (
                      <option key={ec.id} value={ec.id}>{ec.nombre}</option>
                    ))}
                  </select>
                </div>
                <InputField label="Número de Hijos" name="hijos" type="number" value={formData.hijos} onChange={handleChange} min="0" />
                <InputField label="País" name="pais" value={formData.pais} onChange={handleChange} placeholder="Perú" />
                <InputField label="Usuario" name="usuario" value={formData.usuario} onChange={handleChange} required error={errors.usuario} />
                <InputField label="Nueva Contraseña" name="contrasena" type="password" value={formData.contrasena} onChange={handleChange} placeholder="Dejar en blanco para no cambiar" />
                <InputField label="Email Personal" name="email" type="email" value={formData.email} onChange={handleChange} required error={errors.email} />
                <InputField label="Email Corporativo" name="correo_corporativo" type="email" value={formData.correo_corporativo} onChange={handleChange} />
              </div>
            </Section>

            {/* Rol, Cargo y Especialidad */}
            <Section title="Rol y Cargo" icon={Shield}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  label="Rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  options={roles.map(r => r.nombre)}
                  required
                  error={errors.rol}
                />
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Cargo
                  </label>
                  <select
                    name="cargo_id"
                    value={formData.cargo_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
                  >
                    <option value="">Seleccionar cargo</option>
                    {cargos.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Jefe Directo
                  </label>
                  <select
                    name="jefe_id"
                    value={formData.jefe_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
                  >
                    <option value="">Sin jefe directo</option>
                    {trabajadores
                      .filter(t => t.cargo?.es_jefe && t.estado && t.id !== empleado.id)
                      .map(t => (
                        <option key={t.id} value={t.id}>
                          {t.nombres} {t.apellidos} — {t.cargo?.nombre}
                        </option>
                      ))
                    }
                  </select>
                </div>
                {esTerapeuta && (
                  <>
                    <div className="md:col-span-2">
                      <SelectField
                        label="Especialidad"
                        name="especialidad"
                        value={formData.especialidad}
                        onChange={handleChange}
                        options={especialidades.filter(e => e.nombre && e.nombre.trim() !== '').map(e => e.nombre)}
                        required={esTerapeuta}
                        error={errors.especialidad}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <InputField
                        label="Número de Colegiatura"
                        name="numero_colegiatura"
                        value={formData.numero_colegiatura}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}
              </div>
            </Section>

            {/* SERVICIOS - Solo si es terapeuta */}
            {esTerapeuta && (
              <Section title="Servicios que Brinda" icon={Briefcase}>
                {cargandoServicios ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <span className="ml-3 text-sm text-gray-600">Cargando servicios...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-gray-600 mb-4">Selecciona los servicios que este terapeuta puede brindar</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Columna Infantil y Adolescentes */}
                      {serviciosInfantiles.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <h4 className="text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Infantil y Adolescentes ({serviciosInfantiles.length})
                          </h4>
                          <div className="space-y-1 max-h-60 overflow-y-auto">
                            {serviciosInfantiles.map(servicio => (
                              <label key={servicio.id} className="flex items-center gap-2 p-2 hover:bg-blue-100 rounded cursor-pointer transition-all">
                                <input
                                  type="checkbox"
                                  checked={serviciosSeleccionados.includes(servicio.id)}
                                  onChange={(e) => handleCheckboxChange(servicio.id, e.target.checked)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{servicio.nombre}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Columna Adultos */}
                      {serviciosAdultos.length > 0 && (
                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                          <h4 className="text-xs font-bold text-purple-700 mb-2 uppercase tracking-wide flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Adultos ({serviciosAdultos.length})
                          </h4>
                          <div className="space-y-1 max-h-60 overflow-y-auto">
                            {serviciosAdultos.map(servicio => (
                              <label key={servicio.id} className="flex items-center gap-2 p-2 hover:bg-purple-100 rounded cursor-pointer transition-all">
                                <input
                                  type="checkbox"
                                  checked={serviciosSeleccionados.includes(servicio.id)}
                                  onChange={(e) => handleCheckboxChange(servicio.id, e.target.checked)}
                                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-700">{servicio.nombre}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-700">
                            Servicios seleccionados: <span className="font-bold">{serviciosSeleccionados.length}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {serviciosOriginales.length} servicios estaban asignados previamente
                          </p>
                        </div>
                        {serviciosSeleccionados.length === 0 && (
                          <p className="text-xs text-amber-600 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            No has seleccionado ningún servicio
                          </p>
                        )}
                        {serviciosSeleccionados.length > 0 && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {serviciosSeleccionados.length} seleccionados
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </Section>
            )}

            {/* Contacto */}
            <Section title="Información de Contacto" icon={MapPin}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Teléfono Personal" name="telefono" value={formData.telefono} onChange={handleChange} maxLength={9} />
                <InputField label="Teléfono de Emergencia" name="telefono_emergencia" value={formData.telefono_emergencia} onChange={handleChange} maxLength={9} />
                <div className="md:col-span-2">
                  <InputField label="Contacto de Emergencia" name="contacto_emergencia" value={formData.contacto_emergencia} onChange={handleChange} placeholder="Nombre completo del contacto" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Parentesco Contacto Emergencia
                  </label>
                  <select
                    name="parentesco_emergencia_id"
                    value={formData.parentesco_emergencia_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
                  >
                    <option value="">Seleccionar parentesco</option>
                    {parentescos?.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Provincia
                  </label>
                  <select
                    name="provincia_id"
                    value={formData.provincia_id}
                    onChange={handleProvinciaChange}
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
                  >
                    <option value="">Seleccionar provincia</option>
                    {provincias?.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Distrito
                  </label>
                  <select
                    name="distrito_id"
                    value={formData.distrito_id}
                    onChange={handleDistritoChange}
                    disabled={!formData.provincia_id}
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Seleccionar distrito</option>
                    {distritosDisponibles?.map(d => (
                      <option key={d.id} value={d.id}>{d.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Departamento
                  </label>
                  <input
                    type="text"
                    name="departamento"
                    value={formData.departamento}
                    readOnly
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-medium cursor-not-allowed"
                    placeholder="Se asigna automáticamente"
                  />
                </div>
                <div className="md:col-span-2">
                  <InputField label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} multiline />
                </div>
                <div className="md:col-span-2">
                  <InputField label="Referencia de Dirección" name="referencia_direccion" value={formData.referencia_direccion} onChange={handleChange} />
                </div>
              </div>
            </Section>

            {/* Experiencia Laboral Previa */}
            <Section title="Experiencia Laboral Previa (Opcional)" icon={Briefcase}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Procedencia Laboral" name="procedencia_laboral" value={formData.procedencia_laboral} onChange={handleChange} placeholder="Lugar de trabajo anterior" />
                <InputField label="Área Laboral" name="area_laboral" value={formData.area_laboral} onChange={handleChange} placeholder="Área de trabajo" />
                <InputField label="Empresa Anterior" name="empresa_anterior" value={formData.empresa_anterior} onChange={handleChange} />
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Motivo de Renuncia
                  </label>
                  <textarea
                    name="motivo_renuncia"
                    value={formData.motivo_renuncia}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900"
                    placeholder="Breve descripción del motivo..."
                  />
                </div>
              </div>
            </Section>

            {/* Datos Académicos */}
            <Section title="Datos Académicos Principales (Opcional)" icon={FileText}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Nivel de Educación
                  </label>
                  <select
                    name="nivel_educacion_id"
                    value={formData.nivel_educacion_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
                  >
                    <option value="">Seleccionar nivel</option>
                    {nivelesEducacion?.map(n => (
                      <option key={n.id} value={n.id}>{n.nombre}</option>
                    ))}
                  </select>
                </div>
                <InputField label="Centro de Estudios Principal" name="centro_estudios_principal" value={formData.centro_estudios_principal} onChange={handleChange} placeholder="Universidad, instituto, etc." />
                <div className="md:col-span-2">
                  <InputField label="Carrera Estudiada Principal" name="carrera_estudiada_principal" value={formData.carrera_estudiada_principal} onChange={handleChange} placeholder="Nombre de la carrera" />
                </div>
                <InputField label="Fecha Inicio" name="fecha_inicio_estudio" type="date" value={formData.fecha_inicio_estudio} onChange={handleChange} />
                <InputField label="Fecha Término" name="fecha_termino_estudio" type="date" value={formData.fecha_termino_estudio} onChange={handleChange} />
              </div>
            </Section>

            {/* Tallas */}
            <Section title="Tallas de Uniforme" icon={Shirt}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SelectField
                  label="Talla Polo/Camisa"
                  name="talla_polo"
                  value={formData.talla_polo}
                  onChange={handleChange}
                  options={['XS', 'S', 'M', 'L', 'XL', 'XXL']}
                />
                <SelectField
                  label="Talla Pantalón"
                  name="talla_pantalon"
                  value={formData.talla_pantalon}
                  onChange={handleChange}
                  options={['26', '28', '30', '32', '34', '36', '38', '40', '42', '44']}
                />
                <SelectField
                  label="Talla Zapatos"
                  name="talla_zapatos"
                  value={formData.talla_zapatos}
                  onChange={handleChange}
                  options={['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45']}
                />
              </div>
            </Section>

            {/* Hobbies e Intereses */}
            <Section title="Hobbies e Intereses (Opcional)" icon={User}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Hobbies e Intereses
                  </label>
                  <textarea
                    name="hobbies"
                    value={formData.hobbies}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900"
                    placeholder="Actividades, deportes, pasatiempos..."
                  />
                </div>
                 <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Opciones de Regalo
                </label>
                <textarea
                  name="opciones_regalo"
                  value={formData.opciones_regalo}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900"
                  placeholder="Preferencias de regalo, tallas, colores, etc."
                />
              </div>
              </div>
            </Section>

            {/* Documentos */}
            <DocumentosSection
              empleado={empleadoActual} // ✅ CAMBIO IMPORTANTE
              onUploadCV={handleUploadCV}
              onUploadDNI={handleUploadDNI}
              onViewCV={handleViewCV}
              onViewDNI={handleViewDNI}
              onDeleteCV={handleDeleteCV}
              onDeleteDNI={handleDeleteDNI}
              readOnly={false}
              onRefresh={refrescarEmpleado} // ✅ PASAR callback
              onOpenDeleteModal={onOpenDeleteArchivo} // ✅ Usar la prop, no la función del padre
            />

            {/* Datos Financieros */}
            <Section title="Datos Financieros" icon={DollarSign}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <InputField label="Sueldo Base (S/)" name="sueldo_base" type="number" step="0.01" value={formData.sueldo_base} onChange={handleChange} />
                <InputField label="Fecha de Ingreso" name="fecha_ingreso" type="date" value={formData.fecha_ingreso} onChange={handleChange} />
              </div>
              
              <div className="mt-4">
                <CuentasBancarias 
                  trabajadorId={empleado.id}
                  onUpdate={() => console.log('Cuentas actualizadas')}
                  readOnly={false}
                />
              </div>
            </Section>
          </div>
        </div>

        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all">
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

// Modal Detalle Empleado
const ModalDetalleEmpleado = ({ empleado, onClose, onEditar }) => {
  const [empleadoActual, setEmpleadoActual] = useState(empleado);
  const esActivo = empleado.estado === 1 || empleado.estado === true;

  // Funciones para manejar documentos
 const handleViewCV = async () => {
  try {
    if (empleado.archivo_cv) {
      await abrirArchivo(empleado.archivo_cv, 'cv');
    } else {
      alert('No hay CV subido');
    }
  } catch (error) {
    console.error('Error al ver CV:', error);
    alert('Error al abrir el CV');
  }
};

const handleViewDNI = async () => {
  try {
    if (empleado.archivo_dni) {
      await abrirArchivo(empleado.archivo_dni, 'dni');
    } else {
      alert('No hay DNI subido');
    }
  } catch (error) {
    console.error('Error al ver DNI:', error);
    alert('Error al abrir el DNI');
  }
};


  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-2xl bg-white shadow-xl z-50 overflow-hidden flex flex-col">
        <div className="flex-shrink-0 bg-gradient-to-r from-[#7B1FA2] via-[#8E24AA] to-[#AB47BC] p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                {(empleado.nombres?.[0] || '').toUpperCase()}{(empleado.apellidos?.[0] || '').toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {empleado.nombres || ''} {empleado.apellidos || ''}
                </h2>
                <p className="text-sm text-white/90">@{empleado.username}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 ${
            esActivo ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-300 text-gray-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${esActivo ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span className="text-xs font-bold uppercase tracking-wide">
              {esActivo ? 'Empleado Activo' : 'Empleado Inactivo'}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Datos Personales */}
            <DetalleSection title="Datos Personales">
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Nombres" value={empleado.nombres} />
                <InfoField label="Apellidos" value={empleado.apellidos} />
                <InfoField label="DNI" value={empleado.dni} />
                <InfoField label="Fecha de Nacimiento" value={empleado.fecha_nacimiento ? empleado.fecha_nacimiento.split('-').reverse().join('/') : 'No registrada'} />
                <InfoField label="Sexo" value={empleado.sexo?.nombre || 'No registrado'} />
                <InfoField label="Estado Civil" value={empleado.estado_civil?.nombre || 'No registrado'} />
                <InfoField label="Número de Hijos" value={empleado.hijos || '0'} />
                <InfoField label="País" value={empleado.pais || 'No registrado'} />
                <InfoField label="Email Personal" value={empleado.email} />
                <InfoField label="Email Corporativo" value={empleado.correo_corporativo} />
                <InfoField label="Teléfono" value={empleado.telefono} />
              </div>
            </DetalleSection>

            {/* Información Profesional */}
           <DetalleSection title="Información Profesional">
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Rol" value={empleado.rol?.nombre || 'N/A'} />

                {empleado.cargo && (
                  <InfoField
                    label="Cargo/Puesto"
                    value={empleado.cargo.nombre}
                  />
                )}

                {empleado.especialidad && (
                  <InfoField label="Especialidad" value={empleado.especialidad.nombre} />
                )}

                {empleado.numero_colegiatura && (
                  <InfoField label="Número de Colegiatura" value={empleado.numero_colegiatura} />
                )}
              </div>
            </DetalleSection>

            {/* Experiencia Laboral Previa */}
            {(empleado.procedencia_laboral || empleado.area_laboral || empleado.empresa_anterior || empleado.motivo_renuncia) && (
              <DetalleSection title="Experiencia Laboral Previa">
                <div className="grid grid-cols-2 gap-4">
                  {empleado.procedencia_laboral && (
                    <InfoField label="Procedencia Laboral" value={empleado.procedencia_laboral} />
                  )}
                  {empleado.area_laboral && (
                    <InfoField label="Área Laboral" value={empleado.area_laboral} />
                  )}
                  {empleado.empresa_anterior && (
                    <InfoField label="Empresa Anterior" value={empleado.empresa_anterior} />
                  )}
                  {empleado.motivo_renuncia && (
                    <div className="col-span-2">
                      <InfoField label="Motivo de Renuncia" value={empleado.motivo_renuncia} />
                    </div>
                  )}
                </div>
              </DetalleSection>
            )}

            {/* Datos Financieros */}
            {(empleado.sueldo_base || empleado.banco) && (
              <DetalleSection title="Datos Financieros">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <InfoField label="Sueldo Base" value={empleado.sueldo_base ? `S/ ${Number(empleado.sueldo_base).toLocaleString()}` : 'No registrado'} />
                  <InfoField label="Fecha Ingreso" value={empleado.fecha_ingreso ? empleado.fecha_ingreso.split('-').reverse().join('/') : 'No registrada'} />
                </div>
                
                {/* Cuentas Bancarias */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <CuentasBancarias 
                    trabajadorId={empleado.id}
                    onUpdate={() => {
                      // Actualizar si es necesario
                    }}
                    readOnly={true}
                  />
                </div>
              </DetalleSection>
            )}

            {/* Contacto y Dirección */}
            <DetalleSection title="Información de Contacto">
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Teléfono Personal" value={empleado.telefono || 'No registrado'} />
                <InfoField label="Teléfono de Emergencia" value={empleado.telefono_emergencia || 'No registrado'} />
                <div className="col-span-2">
                  <InfoField label="Contacto de Emergencia" value={empleado.contacto_emergencia || 'No registrado'} />
                </div>
                {empleado.parentesco_emergencia && (
                  <InfoField label="Parentesco" value={empleado.parentesco_emergencia.nombre} />
                )}
              </div>
            </DetalleSection>

            {/* Dirección */}
            {empleado.direccion && (
              <DetalleSection title="Dirección">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <InfoField label="Dirección Completa" value={empleado.direccion} />
                  </div>
                  {empleado.referencia_direccion && (
                    <div className="col-span-2">
                      <InfoField label="Referencia" value={empleado.referencia_direccion} />
                    </div>
                  )}
                  <InfoField label="Distrito" value={empleado.distrito_rel?.nombre || empleado.distrito || 'No registrado'} />
                  <InfoField label="Provincia" value={empleado.distrito_rel?.provincia?.nombre || empleado.provincia || 'No registrada'} />
                  <InfoField label="Departamento" value={empleado.departamento} />
                </div>
              </DetalleSection>
            )}

            {/* Tallas */}
            {(empleado.talla_polo || empleado.talla_pantalon || empleado.talla_zapatos) && (
              <DetalleSection title="Tallas de Uniforme">
                <div className="grid grid-cols-3 gap-4">
                  <InfoField label="Polo/Camisa" value={empleado.talla_polo || 'No registrada'} />
                  <InfoField label="Pantalón" value={empleado.talla_pantalon || 'No registrada'} />
                  <InfoField label="Zapatos" value={empleado.talla_zapatos || 'No registrada'} />
                </div>
              </DetalleSection>
            )}

            {/* Hobbies e Intereses */}
            {empleado.hobbies && (
              <DetalleSection title="Hobbies e Intereses">
                <div className="grid grid-cols-1 gap-4">
                  <InfoField label="Hobbies" value={empleado.hobbies} />
                </div>
              </DetalleSection>
            )}
            {empleado.opciones_regalo && (
              <DetalleSection title="Opciones de Regalo">
                <div className="grid grid-cols-1 gap-4">
                    <InfoField label="Opciones de Regalo" value={empleado.opciones_regalo} />
                 </div>
              </DetalleSection>
            )}

            {/* Datos Académicos Principales */}
            {(empleado.nivel_educacion || empleado.centro_estudios_principal || empleado.carrera_estudiada_principal) && (
              <DetalleSection title="Datos Académicos Principales">
                <div className="grid grid-cols-2 gap-4">
                  {empleado.nivel_educacion && (
                    <InfoField label="Nivel de Educación" value={empleado.nivel_educacion?.nombre || 'No registrado'} />
                  )}
                  {empleado.centro_estudios_principal && (
                    <InfoField label="Centro de Estudios" value={empleado.centro_estudios_principal} />
                  )}
                  {empleado.carrera_estudiada_principal && (
                    <div className="col-span-2">
                      <InfoField label="Carrera Estudiada" value={empleado.carrera_estudiada_principal} />
                    </div>
                  )}
                  {empleado.fecha_inicio_estudio && (
                    <InfoField label="Fecha Inicio" value={empleado.fecha_inicio_estudio.split('-').reverse().join('/')} />
                  )}
                  {empleado.fecha_termino_estudio && (
                    <InfoField label="Fecha Término" value={empleado.fecha_termino_estudio.split('-').reverse().join('/')} />
                  )}
                </div>
              </DetalleSection>
            )}

            {/* Documentos */}
            {(empleado.archivo_cv || empleado.archivo_dni) && (
              <DetalleSection title="Documentos Adjuntos">
                <div className="grid grid-cols-2 gap-4">
                  {empleado.archivo_cv && (
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">Curriculum Vitae</span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Disponible
                        </span>
                      </div>
                      <button
                        onClick={handleViewCV}
                        className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-100 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver CV
                      </button>
                    </div>
                  )}

                  {empleado.archivo_dni && (
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <IdCard className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-900">Copia de DNI</span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Disponible
                        </span>
                      </div>
                      <button
                        onClick={handleViewDNI}
                        className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-600 border border-green-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-green-100 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver DNI
                      </button>
                    </div>
                  )}
                </div>
              </DetalleSection>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all">
            Cerrar
          </button>
          <button
            onClick={onEditar}
            className="flex items-center gap-2 bg-[#A3C644] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all"
          >
            <Edit2 className="w-4 h-4" />
            Editar Empleado
          </button>
        </div>
      </div>
    </>
  );
};

// Modal Pago
const ModalPago = ({ empleado, onClose, onSuccess, onError }) => {
  const MESES = [
    { id: 1, nombre: 'enero' },
    { id: 2, nombre: 'febrero' },
    { id: 3, nombre: 'marzo' },
    { id: 4, nombre: 'abril' },
    { id: 5, nombre: 'mayo' },
    { id: 6, nombre: 'junio' },
    { id: 7, nombre: 'julio' },
    { id: 8, nombre: 'agosto' },
    { id: 9, nombre: 'septiembre' },
    { id: 10, nombre: 'octubre' },
    { id: 11, nombre: 'noviembre' },
    { id: 12, nombre: 'diciembre' }
  ];

  const hoy = new Date();
  const fechaHoyFormateada = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

  const [pagoData, setPagoData] = useState({
    mesId: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
    fechaPago: fechaHoyFormateada
  });
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const confirmarPago = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const montoNumero = parseFloat(parseFloat(empleado.sueldo_base).toFixed(2));

      console.log('Datos del pago:', {
        empleadoId: empleado.id,
        mesId: pagoData.mesId,
        anio: pagoData.anio,
        monto: montoNumero,
        fechaPago: pagoData.fechaPago,
        userId: user.id
      });

      await registrarPagoMensual({
        empleadoId: empleado.id,
        mesId: pagoData.mesId,
        anio: pagoData.anio,
        monto: montoNumero,
        fechaPago: pagoData.fechaPago,
        userId: user.id
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al registrar pago:', error);
      console.error('Detalles del error:', error.response?.data);
      onError(error.response?.data?.message || 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Registrar Pago Mensual</h2>
              <p className="text-sm text-green-100">Sueldo regular</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Empleado</label>
                  <p className="font-semibold text-gray-900">{empleado.nombres} {empleado.apellidos}</p>
                </div>
                <div className="text-right">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Sueldo Base</label>
                  <p className="text-2xl font-bold text-green-600">
                    S/ {Number(empleado.sueldo_base).toLocaleString('es-PE', {minimumFractionDigits: 2})}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mes de Pago</label>
                <select
                  value={pagoData.mesId}
                  onChange={(e) => setPagoData({...pagoData, mesId: parseInt(e.target.value)})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent capitalize"
                  required
                >
                  {MESES.map(mes => (
                    <option key={mes.id} value={mes.id}>{mes.nombre.charAt(0).toUpperCase() + mes.nombre.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                  <select
                    value={pagoData.anio}
                    onChange={(e) => setPagoData({...pagoData, anio: parseInt(e.target.value)})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    {[...Array(5)].map((_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Pago</label>
                  <input
                    type="date"
                    value={pagoData.fechaPago}
                    onChange={(e) => setPagoData({...pagoData, fechaPago: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Registrar Pago
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg">Confirmar Registro de Pago</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center text-white font-bold">
                  {empleado.nombres[0]}{empleado.apellidos[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {empleado.nombres} {empleado.apellidos}
                  </p>
                  <p className="text-sm text-gray-500">{empleado.cargo?.nombre || 'Sin cargo'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Periodo</span>
                  <span className="font-semibold text-gray-900 capitalize">
                    {pagoData.mes} {pagoData.anio}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Fecha de Pago</span>
                  <span className="font-semibold text-gray-900">
                    {pagoData.fechaPago.split('-').reverse().join('/')}
                  </span>
                </div>
                <div className="pt-3 border-t-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">Monto a Pagar</span>
                    <span className="text-xl font-bold text-green-600">
                      S/ {Number(empleado.sueldo_base).toLocaleString('es-PE', {minimumFractionDigits: 2})}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                <p className="text-xs text-gray-700 text-center">
                  ¿Estás seguro de registrar este pago? Esta acción no se puede deshacer.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarPago}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Registrando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Modal Confirmación Delete
const ModalConfirmDelete = ({ empleado, onClose, onConfirm }) => {
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Confirmar Eliminación</h2>
            <p className="text-sm text-red-100">Esta acción no se puede deshacer</p>
          </div>

          <div className="p-6">
            <div className="bg-red-50 rounded-xl p-4 mb-6 border-2 border-red-200">
              <p className="text-sm text-red-600 font-medium mb-1">Empleado a eliminar:</p>
              <p className="text-lg font-bold text-gray-900">{empleado.nombres} {empleado.apellidos}</p>
              <p className="text-sm text-gray-600 mt-1">DNI: {empleado.dni}</p>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
              <p className="text-sm font-bold text-amber-900 mb-2">⚠️ Advertencia</p>
              <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
                <li>Todo el historial de pagos</li>
                <li>Datos financieros y bancarios</li>
                <li>Registros de gratificaciones</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Componentes auxiliares
const Section = ({ title, icon: Icon, children }) => (
  <div>
    <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
      <Icon className="w-4 h-4" />
      {title}
    </h3>
    {children}
  </div>
);

const DetalleSection = ({ title, children }) => (
  <div>
    <h3 className="text-base font-bold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

const InputField = ({ label, name, value, onChange, error, type = 'text', required, maxLength, placeholder, multiline, step }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {multiline ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        rows={2}
        className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:outline-none transition-all resize-none bg-white text-gray-900 font-medium ${
          error ? 'border-red-300 focus:border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-[#7B1FA2] hover:border-gray-300'
        }`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        step={step}
        className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 font-medium ${
          error ? 'border-red-300 focus:border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-[#7B1FA2] hover:border-gray-300'
        }`}
      />
    )}
    {error && (
      <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1.5">
        <span className="w-1 h-1 rounded-full bg-red-500"></span>
        {error}
      </p>
    )}
  </div>
);

const SelectField = ({ label, name, value, onChange, error, options, required, isValueLabel }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 font-medium ${
        error ? 'border-red-300 focus:border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-[#7B1FA2] hover:border-gray-300'
      }`}
    >
      <option value="">Seleccionar {label.toLowerCase()}</option>
      {options.map((option, index) => {
        if (isValueLabel && typeof option === 'object') {
          return (
            <option key={`${option.value}-${index}`} value={option.value}>
              {option.label}
            </option>
          );
        }
        return (
          <option key={`${option}-${index}`} value={option}>
            {option}
          </option>
        );
      })}
    </select>
    {error && (
      <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1.5">
        <span className="w-1 h-1 rounded-full bg-red-500"></span>
        {error}
      </p>
    )}
  </div>
);

const InfoField = ({ label, value }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
      {label}
    </label>
    <p className="text-sm text-gray-900 font-medium">{value || 'N/A'}</p>
  </div>
);