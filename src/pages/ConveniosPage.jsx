import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Power, Check, X, Search, Eye, Trash2,
  CheckCircle, XCircle, Building2, FileText,
  Users, Calendar, AlertCircle, Upload, Gift, Tag,
  AlertTriangle, List, ChevronUp, ChevronDown
} from 'lucide-react';
import {
  getConvenios,
  crearConvenio,
  actualizarConvenio,
  eliminarConvenio,
  activarConvenio,
  desactivarConvenio,
  getPacientesPorConvenio,
  getBeneficios,
  crearBeneficio,
  actualizarBeneficio,
  eliminarBeneficio,
  activarBeneficio,
  desactivarBeneficio,
  getCategoriasBeneficios,
  getTerminosPorBeneficio,
  crearBeneficioTermino,
  actualizarBeneficioTermino,
  eliminarBeneficioTermino
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

  // Estados para beneficios
  const [modalBeneficios, setModalBeneficios] = useState(false);
  const [beneficios, setBeneficios] = useState([]);
  const [loadingBeneficios, setLoadingBeneficios] = useState(false);
  const [modalNuevoBeneficio, setModalNuevoBeneficio] = useState(false);
  const [modalEditarBeneficio, setModalEditarBeneficio] = useState(false);
  const [modalEliminarBeneficio, setModalEliminarBeneficio] = useState({ open: false, beneficio: null });
  const [beneficioSeleccionado, setBeneficioSeleccionado] = useState(null);
  const [categoriasBeneficios, setCategoriasBeneficios] = useState([]);
  const [formBeneficio, setFormBeneficio] = useState({
    nombre: '',
    descripcion: '',
    categoria_id: '',
    descuento: '',
    convenio_id: ''
  });

  // Estados para términos y condiciones
  const [terminos, setTerminos] = useState([]);
  const [terminosTemp, setTerminosTemp] = useState([]); // Para modal de crear
  const [nuevoTermino, setNuevoTermino] = useState('');
  const [terminoEditando, setTerminoEditando] = useState(null);

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

  // =============== FUNCIONES PARA BENEFICIOS ===============

  const cargarBeneficios = async () => {
    try {
      setLoadingBeneficios(true);
      const [beneficiosData, categoriasData] = await Promise.all([
        getBeneficios(),
        getCategoriasBeneficios()
      ]);
      setBeneficios(Array.isArray(beneficiosData) ? beneficiosData : []);
      setCategoriasBeneficios(Array.isArray(categoriasData) ? categoriasData : []);
    } catch (error) {
      console.error('Error al cargar beneficios:', error);
      showNotification('Error al cargar beneficios', 'error');
      setBeneficios([]);
      setCategoriasBeneficios([]);
    } finally {
      setLoadingBeneficios(false);
    }
  };

  const handleAbrirBeneficios = () => {
    setModalBeneficios(true);
    cargarBeneficios();
  };

  const handleCrearBeneficio = async () => {
    try {
      if (!formBeneficio.nombre || !formBeneficio.convenio_id) {
        showNotification('Nombre y convenio son obligatorios', 'error');
        return;
      }

      console.log('Creando beneficio con datos:', formBeneficio);

      const beneficioData = {
        nombre: formBeneficio.nombre,
        descripcion: formBeneficio.descripcion || null,
        categoria_id: formBeneficio.categoria_id || null,
        descuento: formBeneficio.descuento || null,
        convenio_id: parseInt(formBeneficio.convenio_id),
        activo: true
      };

      const beneficioCreado = await crearBeneficio(beneficioData);

      // Crear términos si existen
      if (terminosTemp.length > 0) {
        for (let i = 0; i < terminosTemp.length; i++) {
          await crearBeneficioTermino({
            beneficio_id: beneficioCreado.id,
            descripcion: terminosTemp[i],
            orden: i,
            activo: true
          });
        }
      }

      showNotification('Beneficio creado exitosamente', 'success');
      setModalNuevoBeneficio(false);
      setTerminosTemp([]);
      setNuevoTermino('');
      setFormBeneficio({
        nombre: '',
        descripcion: '',
        categoria_id: '',
        descuento: '',
        convenio_id: ''
      });
      cargarBeneficios();
    } catch (error) {
      console.error('Error al crear beneficio:', error);
      showNotification(error.response?.data?.message || 'Error al crear el beneficio', 'error');
    }
  };

  const handleAbrirEditarBeneficio = async (beneficio) => {
    console.log('Abriendo editar beneficio:', beneficio);
    setBeneficioSeleccionado(beneficio);
    setFormBeneficio({
      nombre: beneficio.nombre,
      descripcion: beneficio.descripcion || '',
      categoria_id: beneficio.categoria_id ? String(beneficio.categoria_id) : '',
      descuento: beneficio.descuento || '',
      convenio_id: String(beneficio.convenio_id)
    });

    // Cargar términos del beneficio
    await cargarTerminos(beneficio.id);

    setModalEditarBeneficio(true);
  };

  const handleActualizarBeneficio = async () => {
    try {
      console.log('🔧 Iniciando actualización de beneficio...');
      console.log('📝 FormBeneficio:', formBeneficio);
      console.log('🆔 Beneficio seleccionado ID:', beneficioSeleccionado?.id);

      if (!formBeneficio.nombre || !formBeneficio.convenio_id) {
        console.error('❌ Validación falló: nombre o convenio_id vacío');
        showNotification('Nombre y convenio son obligatorios', 'error');
        return;
      }

      if (!beneficioSeleccionado || !beneficioSeleccionado.id) {
        console.error('❌ No hay beneficio seleccionado');
        showNotification('Error: No se ha seleccionado un beneficio', 'error');
        return;
      }

      const beneficioData = {
        nombre: formBeneficio.nombre.trim(),
        descripcion: formBeneficio.descripcion?.trim() || null,
        categoria_id: formBeneficio.categoria_id && formBeneficio.categoria_id !== '' ? parseInt(formBeneficio.categoria_id) : null,
        descuento: formBeneficio.descuento?.trim() || null,
        convenio_id: parseInt(formBeneficio.convenio_id)
      };

      console.log('📤 Datos a enviar:', beneficioData);
      console.log('🔄 Llamando a actualizarBeneficio con ID:', beneficioSeleccionado.id);

      const resultado = await actualizarBeneficio(beneficioSeleccionado.id, beneficioData);

      console.log('✅ Respuesta del servidor:', resultado);

      showNotification('Beneficio actualizado exitosamente', 'success');
      setModalEditarBeneficio(false);
      setBeneficioSeleccionado(null);
      setFormBeneficio({
        nombre: '',
        descripcion: '',
        categoria_id: '',
        descuento: '',
        convenio_id: ''
      });
      cargarBeneficios();
    } catch (error) {
      console.error('❌ Error completo al actualizar beneficio:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      showNotification(error.response?.data?.message || 'Error al actualizar el beneficio', 'error');
    }
  };

  const handleToggleActivoBeneficio = async (beneficio) => {
    try {
      if (beneficio.activo) {
        await desactivarBeneficio(beneficio.id);
        showNotification('Beneficio desactivado', 'success');
      } else {
        await activarBeneficio(beneficio.id);
        showNotification('Beneficio activado', 'success');
      }
      cargarBeneficios();
    } catch (error) {
      console.error('Error al cambiar estado del beneficio:', error);
      showNotification('Error al cambiar el estado del beneficio', 'error');
    }
  };

  const handleEliminarBeneficio = async () => {
    const { beneficio } = modalEliminarBeneficio;

    try {
      // Desactivar el beneficio en lugar de eliminarlo (eliminación lógica)
      await desactivarBeneficio(beneficio.id);
      showNotification('Beneficio desactivado exitosamente', 'success');
      setModalEliminarBeneficio({ open: false, beneficio: null });
      cargarBeneficios();
    } catch (error) {
      console.error('Error al desactivar beneficio:', error);
      showNotification(error.response?.data?.message || 'Error al desactivar el beneficio', 'error');
      setModalEliminarBeneficio({ open: false, beneficio: null });
    }
  };

  // =============== FUNCIONES PARA TÉRMINOS Y CONDICIONES ===============

  const cargarTerminos = async (beneficioId) => {
    try {
      const data = await getTerminosPorBeneficio(beneficioId);
      setTerminos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar términos:', error);
      setTerminos([]);
    }
  };

  // Funciones para términos temporales (modal de crear)
  const handleAgregarTerminoTemp = () => {
    if (!nuevoTermino.trim()) {
      showNotification('Ingresa una descripción para el término', 'error');
      return;
    }

    setTerminosTemp([...terminosTemp, nuevoTermino.trim()]);
    setNuevoTermino('');
    showNotification('Término agregado', 'success');
  };

  const handleEliminarTerminoTemp = (index) => {
    setTerminosTemp(terminosTemp.filter((_, i) => i !== index));
    showNotification('Término eliminado', 'success');
  };

  const handleMoverTerminoTemp = (index, direccion) => {
    const nuevoIndice = direccion === 'arriba' ? index - 1 : index + 1;
    if (nuevoIndice < 0 || nuevoIndice >= terminosTemp.length) return;

    const nuevosTerminos = [...terminosTemp];
    [nuevosTerminos[index], nuevosTerminos[nuevoIndice]] =
    [nuevosTerminos[nuevoIndice], nuevosTerminos[index]];

    setTerminosTemp(nuevosTerminos);
  };

  const handleAgregarTermino = async (beneficioId) => {
    if (!nuevoTermino.trim()) {
      showNotification('Ingresa una descripción para el término', 'error');
      return;
    }

    try {
      const orden = terminos.length;
      await crearBeneficioTermino({
        beneficio_id: beneficioId,
        descripcion: nuevoTermino.trim(),
        orden: orden,
        activo: true
      });

      setNuevoTermino('');
      await cargarTerminos(beneficioId);
      showNotification('Término agregado exitosamente', 'success');
    } catch (error) {
      console.error('Error al agregar término:', error);
      showNotification(error.response?.data?.message || 'Error al agregar el término', 'error');
    }
  };

  const handleEditarTermino = async (terminoId, nuevaDescripcion) => {
    if (!nuevaDescripcion.trim()) {
      showNotification('La descripción no puede estar vacía', 'error');
      return;
    }

    try {
      await actualizarBeneficioTermino(terminoId, {
        descripcion: nuevaDescripcion.trim()
      });

      await cargarTerminos(beneficioSeleccionado.id);
      setTerminoEditando(null);
      showNotification('Término actualizado exitosamente', 'success');
    } catch (error) {
      console.error('Error al editar término:', error);
      showNotification(error.response?.data?.message || 'Error al editar el término', 'error');
    }
  };

  const handleEliminarTermino = async (terminoId, beneficioId) => {
    if (!window.confirm('¿Estás seguro de eliminar este término?')) return;

    try {
      await eliminarBeneficioTermino(terminoId);
      await cargarTerminos(beneficioId);
      showNotification('Término eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error al eliminar término:', error);
      showNotification(error.response?.data?.message || 'Error al eliminar el término', 'error');
    }
  };

  const handleMoverTermino = async (index, direccion) => {
    const nuevoIndice = direccion === 'arriba' ? index - 1 : index + 1;
    if (nuevoIndice < 0 || nuevoIndice >= terminos.length) return;

    const terminosActualizados = [...terminos];
    [terminosActualizados[index], terminosActualizados[nuevoIndice]] =
    [terminosActualizados[nuevoIndice], terminosActualizados[index]];

    try {
      // Actualizar orden en backend
      await Promise.all(terminosActualizados.map((termino, idx) =>
        actualizarBeneficioTermino(termino.id, { orden: idx })
      ));

      setTerminos(terminosActualizados);
      showNotification('Orden actualizado', 'success');
    } catch (error) {
      console.error('Error al reordenar términos:', error);
      showNotification('Error al actualizar el orden', 'error');
    }
  };

  // Filtrar convenios
  const conveniosFiltrados = convenios.filter(convenio => {
    const matchBusqueda = !busqueda ||
      convenio.empresa?.toLowerCase().includes(busqueda.toLowerCase()) ||
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

          <div className="flex items-center gap-3">
            <button
              onClick={handleAbrirBeneficios}
              className="flex items-center gap-2 bg-white border-2 border-[#7B1FA2] text-[#7B1FA2] px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#7B1FA2] hover:text-white transition-all shadow-sm"
            >
              <Gift className="w-4 h-4" />
              Gestionar Beneficios
            </button>
            <button
              onClick={() => setModalNuevo(true)}
              className="flex items-center gap-2 bg-[#7B1FA2] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#6A1B9A] transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nuevo Convenio
            </button>
          </div>
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

      {/* MODAL GESTIONAR BENEFICIOS */}
      {modalBeneficios && (
        <ModalBeneficios
          beneficios={beneficios}
          convenios={convenios}
          categorias={categoriasBeneficios}
          loading={loadingBeneficios}
          onClose={() => setModalBeneficios(false)}
          onNuevo={() => {
            setFormBeneficio({
              nombre: '',
              descripcion: '',
              categoria_id: '',
              descuento: '',
              convenio_id: ''
            });
            setModalNuevoBeneficio(true);
          }}
          onEditar={handleAbrirEditarBeneficio}
          onToggleActivo={handleToggleActivoBeneficio}
          onEliminar={(beneficio) => setModalEliminarBeneficio({ open: true, beneficio })}
        />
      )}

      {/* MODAL NUEVO BENEFICIO */}
      {modalNuevoBeneficio && (
        <ModalNuevoBeneficio
          convenios={convenios}
          categorias={categoriasBeneficios}
          formData={formBeneficio}
          onChange={(e) => setFormBeneficio({ ...formBeneficio, [e.target.name]: e.target.value })}
          onClose={() => {
            setModalNuevoBeneficio(false);
            setTerminosTemp([]);
            setNuevoTermino('');
            setFormBeneficio({
              nombre: '',
              descripcion: '',
              categoria_id: '',
              descuento: '',
              convenio_id: ''
            });
          }}
          onSubmit={handleCrearBeneficio}
          terminosTemp={terminosTemp}
          nuevoTermino={nuevoTermino}
          setNuevoTermino={setNuevoTermino}
          onAgregarTerminoTemp={handleAgregarTerminoTemp}
          onEliminarTerminoTemp={handleEliminarTerminoTemp}
          onMoverTerminoTemp={handleMoverTerminoTemp}
        />
      )}

      {/* MODAL EDITAR BENEFICIO */}
      {modalEditarBeneficio && beneficioSeleccionado && (
        <ModalEditarBeneficio
          convenios={convenios}
          categorias={categoriasBeneficios}
          beneficio={beneficioSeleccionado}
          formData={formBeneficio}
          onChange={(e) => setFormBeneficio({ ...formBeneficio, [e.target.name]: e.target.value })}
          onClose={() => {
            setModalEditarBeneficio(false);
            setBeneficioSeleccionado(null);
            setTerminos([]);
            setNuevoTermino('');
            setTerminoEditando(null);
            setFormBeneficio({
              nombre: '',
              descripcion: '',
              categoria_id: '',
              descuento: '',
              convenio_id: ''
            });
          }}
          onSubmit={handleActualizarBeneficio}
          terminos={terminos}
          nuevoTermino={nuevoTermino}
          setNuevoTermino={setNuevoTermino}
          onAgregarTermino={handleAgregarTermino}
          onEditarTermino={handleEditarTermino}
          onEliminarTermino={handleEliminarTermino}
          onMoverTermino={handleMoverTermino}
          terminoEditando={terminoEditando}
          setTerminoEditando={setTerminoEditando}
        />
      )}

      {/* MODAL ELIMINAR BENEFICIO */}
      {modalEliminarBeneficio.open && modalEliminarBeneficio.beneficio && (
        <ModalEliminarBeneficio
          beneficio={modalEliminarBeneficio.beneficio}
          onClose={() => setModalEliminarBeneficio({ open: false, beneficio: null })}
          onConfirm={handleEliminarBeneficio}
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
        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white border border-gray-100 flex items-center justify-center shadow-sm">
          {convenio.logo_url && !logoError ? (
            <img
              src={convenio.logo_url
                ? (convenio.logo_url.startsWith('/')
                  ? `${API_BASE_URL}/convenios/logo/${convenio.logo_url.split('/').pop()}`
                  : `${API_BASE_URL}/convenios/logo/${convenio.logo_url}`)
                : ''}
              alt={convenio.empresa}
              className="w-full h-full object-cover"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${
              convenio.activo
                ? 'bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A]'
                : 'bg-gradient-to-br from-gray-400 to-gray-500'
            }`}>
              <Building2 className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">
            {convenio.empresa}
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
    empresa: '',
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
    
    if (!formData.empresa?.trim()) {
      erroresNuevos.empresa = 'El nombre de la empresa es obligatorio';
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
                  name="empresa" 
                  value={formData.empresa} 
                  onChange={handleChange} 
                  error={errors.empresa} 
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
                    <div className="space-y-3">
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
                            Arrastra una imagen o haz clic para seleccionar
                          </p>
                        </label>
                      </div>

                      {/* Requisitos de la imagen */}
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Requisitos de la imagen
                        </p>
                        <ul className="text-xs text-blue-800 space-y-1">
                          <li className="flex items-start gap-1.5">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span><strong>Formatos:</strong> PNG, JPG, JPEG o WEBP</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span><strong>Peso máximo:</strong> 5 MB</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span><strong>Tamaño recomendado:</strong> 500x500 píxeles (cuadrado)</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
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
    empresa: convenio.empresa || '',
    descripcion: convenio.descripcion || '',
    activo: convenio.activo
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(
    convenio.logo_url
      ? (convenio.logo_url.startsWith('/')
        ? `${API_BASE_URL}/convenios/logo/${convenio.logo_url.split('/').pop()}`
        : `${API_BASE_URL}/convenios/logo/${convenio.logo_url}`)
      : null
  );
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
    
    if (!formData.empresa?.trim()) {
      erroresNuevos.empresa = 'El nombre de la empresa es obligatorio';
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
              <p className="text-sm text-white/90">{convenio.empresa}</p>
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
                  name="empresa" 
                  value={formData.empresa} 
                  onChange={handleChange} 
                  error={errors.empresa} 
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
                  src={convenio.logo_url
                    ? (convenio.logo_url.startsWith('/')
                      ? `${API_BASE_URL}/convenios/logo/${convenio.logo_url.split('/').pop()}`
                      : `${API_BASE_URL}/convenios/logo/${convenio.logo_url}`)
                    : ''}
                  alt={convenio.empresa}
                  className="w-16 h-16 rounded-xl bg-white/20 object-contain p-2"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white mb-1.5">{convenio.empresa}</h2>
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
              <span className="font-bold text-gray-900">"{convenio.empresa}"</span>?
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

// ============== MODAL BENEFICIOS ==============
const ModalBeneficios = ({ beneficios, convenios, loading, onClose, onNuevo, onEditar, onToggleActivo, onEliminar }) => {
  const [busquedaBeneficio, setBusquedaBeneficio] = React.useState('');

  const beneficiosFiltrados = beneficios.filter(beneficio => {
    if (!busquedaBeneficio) return true;

    const searchLower = busquedaBeneficio.toLowerCase();
    const nombreMatch = beneficio.nombre?.toLowerCase().includes(searchLower);
    const empresaMatch = beneficio.convenio?.empresa?.toLowerCase().includes(searchLower);
    const categoriaMatch = beneficio.categoria?.nombre?.toLowerCase().includes(searchLower);
    const descuentoMatch = beneficio.descuento?.toLowerCase().includes(searchLower);

    return nombreMatch || empresaMatch || categoriaMatch || descuentoMatch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b-2 border-gray-100 px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A] rounded-xl flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gestión de Beneficios</h2>
              <p className="text-xs text-gray-500">Administra los beneficios de los convenios</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onNuevo}
              className="flex items-center gap-2 bg-[#7B1FA2] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#6A1B9A] transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nuevo Beneficio
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 mt-3 text-sm">Cargando beneficios...</p>
              </div>
            </div>
          ) : beneficios.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No hay beneficios registrados</p>
            </div>
          ) : (
            <>
              {/* Buscador */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, empresa, categoría o descuento..."
                    value={busquedaBeneficio}
                    onChange={(e) => setBusquedaBeneficio(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
                  />
                  {busquedaBeneficio && (
                    <button
                      onClick={() => setBusquedaBeneficio('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {busquedaBeneficio ? (
                    <>
                      Encontrados: <span className="font-bold text-[#7B1FA2]">{beneficiosFiltrados.length}</span> de {beneficios.length}
                    </>
                  ) : (
                    <>
                      Activos: <span className="font-bold text-green-600">{beneficios.filter(b => b.activo).length}</span>
                    </>
                  )}
                </p>
              </div>

              {beneficiosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No se encontraron beneficios que coincidan con "{busquedaBeneficio}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {beneficiosFiltrados.map(beneficio => {
                    return (
                    <div
                      key={beneficio.id}
                      className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-[#7B1FA2] transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{beneficio.nombre}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {beneficio.convenio?.empresa || 'Sin convenio'}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          beneficio.activo
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : 'bg-gray-50 text-gray-600 border-gray-100'
                        }`}>
                          {beneficio.activo ? 'Activo' : 'Inactivo'}
                        </div>
                      </div>

                      {beneficio.descripcion && (
                        <p className="text-sm text-gray-600 mb-3">{beneficio.descripcion}</p>
                      )}

                      <div className="flex items-center gap-2 mb-3">
                        {beneficio.categoria?.nombre && (
                          <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {beneficio.categoria.nombre}
                          </span>
                        )}
                        {beneficio.descuento && (
                          <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium">
                            {beneficio.descuento}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEditar(beneficio)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-all"
                        >
                          <Edit2 className="w-3 h-3" />
                          Editar
                        </button>
                        <button
                          onClick={() => onToggleActivo(beneficio)}
                          className={`p-2 rounded-lg transition-all ${
                            beneficio.activo
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                          title={beneficio.activo ? 'Desactivar' : 'Activar'}
                        >
                          <Power className={`w-4 h-4 ${beneficio.activo ? 'text-green-600' : 'text-gray-400'}`} />
                        </button>
                        <button
                          onClick={() => onEliminar(beneficio)}
                          className="p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============== MODAL NUEVO BENEFICIO ==============
const ModalNuevoBeneficio = ({
  convenios,
  categorias = [],
  formData,
  onChange,
  onClose,
  onSubmit,
  terminosTemp,
  nuevoTermino,
  setNuevoTermino,
  onAgregarTerminoTemp,
  onEliminarTerminoTemp,
  onMoverTerminoTemp
}) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white truncate">Nuevo Beneficio</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* SECCIÓN: DATOS DEL BENEFICIO */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#7B1FA2]" />
              Datos del Beneficio
            </h3>
            <div className="space-y-3">
              <InputField
                label="Nombre del Beneficio"
                name="nombre"
                value={formData.nombre}
                onChange={onChange}
                placeholder="Ej: Descuento en consultas"
                required
              />

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Convenio <span className="text-red-500">*</span>
                </label>
                <select
                  name="convenio_id"
                  value={formData.convenio_id}
                  onChange={onChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
                  required
                >
                  <option value="">Seleccionar convenio...</option>
                  {convenios.filter(c => c.activo).map(convenio => (
                    <option key={convenio.id} value={String(convenio.id)}>
                      {convenio.empresa}
                    </option>
                  ))}
                </select>
              </div>

              <TextAreaField
                label="Descripción"
                name="descripcion"
                value={formData.descripcion}
                onChange={onChange}
                placeholder="Describe el beneficio en detalle"
                rows={3}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Categoría
                  </label>
                  <select
                    name="categoria_id"
                    value={formData.categoria_id}
                    onChange={onChange}
                    className="w-full px-3 sm:px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id} value={String(categoria.id)}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <InputField
                  label="Descuento"
                  name="descuento"
                  value={formData.descuento}
                  onChange={onChange}
                  placeholder="Ej: 15%, S/50"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN: TÉRMINOS Y CONDICIONES */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <List className="w-4 h-4 text-[#7B1FA2]" />
              Términos y Condiciones (Opcional)
            </h3>

            {/* Agregar nuevo término */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={nuevoTermino}
                onChange={(e) => setNuevoTermino(e.target.value)}
                placeholder="Escribe un término o condición..."
                className="flex-1 px-3 py-2 border-2 border-purple-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onAgregarTerminoTemp();
                  }
                }}
              />
              <button
                type="button"
                onClick={onAgregarTerminoTemp}
                className="px-4 py-2 bg-[#7B1FA2] text-white rounded-lg text-sm font-medium hover:bg-[#6A1B9A] transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>

            {/* Lista de términos */}
            {terminosTemp.length === 0 ? (
              <div className="text-center py-6 bg-white border-2 border-dashed border-purple-200 rounded-lg">
                <List className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No hay términos agregados</p>
                <p className="text-xs text-gray-400 mt-1">Agrega términos y condiciones para este beneficio</p>
              </div>
            ) : (
              <div className="space-y-2">
                {terminosTemp.map((termino, index) => (
                  <div
                    key={index}
                    className="bg-white border-2 border-purple-100 rounded-lg p-3 flex items-start gap-3 hover:border-purple-300 transition-all"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-[#7B1FA2]">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">{termino}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEliminarTerminoTemp(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => onMoverTerminoTemp(index, 'arriba')}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-all"
                          title="Mover arriba"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      )}
                      {index < terminosTemp.length - 1 && (
                        <button
                          type="button"
                          onClick={() => onMoverTerminoTemp(index, 'abajo')}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-all"
                          title="Mover abajo"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            className="px-4 sm:px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] rounded-xl hover:from-[#6A1B9A] hover:to-[#5E1690] transition-all shadow-lg shadow-[#7B1FA2]/30"
          >
            Crear Beneficio
          </button>
        </div>
      </div>
    </div>
  );
};

// ============== MODAL EDITAR BENEFICIO ==============
const ModalEditarBeneficio = ({
  convenios,
  categorias = [],
  beneficio,
  formData,
  onChange,
  onClose,
  onSubmit,
  terminos,
  nuevoTermino,
  setNuevoTermino,
  onAgregarTermino,
  onEditarTermino,
  onEliminarTermino,
  onMoverTermino,
  terminoEditando,
  setTerminoEditando
}) => {
  const [descripcionEditando, setDescripcionEditando] = React.useState('');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white truncate">Editar Beneficio</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* SECCIÓN: DATOS DEL BENEFICIO */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#7B1FA2]" />
              Datos del Beneficio
            </h3>
            <div className="space-y-3">
              <InputField
                label="Nombre del Beneficio"
                name="nombre"
                value={formData.nombre}
                onChange={onChange}
                placeholder="Ej: Descuento en consultas"
                required
              />

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Convenio <span className="text-red-500">*</span>
                </label>
                <select
                  name="convenio_id"
                  value={formData.convenio_id}
                  onChange={onChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
                  required
                >
                  <option value="">Seleccionar convenio...</option>
                  {convenios.filter(c => c.activo).map(convenio => (
                    <option key={convenio.id} value={String(convenio.id)}>
                      {convenio.empresa}
                    </option>
                  ))}
                </select>
              </div>

              <TextAreaField
                label="Descripción"
                name="descripcion"
                value={formData.descripcion}
                onChange={onChange}
                placeholder="Describe el beneficio en detalle"
                rows={3}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Categoría
                  </label>
                  <select
                    name="categoria_id"
                    value={formData.categoria_id}
                    onChange={onChange}
                    className="w-full px-3 sm:px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id} value={String(categoria.id)}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <InputField
                  label="Descuento"
                  name="descuento"
                  value={formData.descuento}
                  onChange={onChange}
                  placeholder="Ej: 15%, S/50"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN: TÉRMINOS Y CONDICIONES */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <List className="w-4 h-4 text-[#7B1FA2]" />
              Términos y Condiciones
            </h3>

            {/* Agregar nuevo término */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={nuevoTermino}
                onChange={(e) => setNuevoTermino(e.target.value)}
                placeholder="Escribe un término o condición..."
                className="flex-1 px-3 py-2 border-2 border-purple-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    onAgregarTermino(beneficio.id);
                  }
                }}
              />
              <button
                onClick={() => onAgregarTermino(beneficio.id)}
                className="px-4 py-2 bg-[#7B1FA2] text-white rounded-lg text-sm font-medium hover:bg-[#6A1B9A] transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>

            {/* Lista de términos */}
            {terminos.length === 0 ? (
              <div className="text-center py-6 bg-white border-2 border-dashed border-purple-200 rounded-lg">
                <List className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No hay términos agregados</p>
                <p className="text-xs text-gray-400 mt-1">Agrega términos y condiciones para este beneficio</p>
              </div>
            ) : (
              <div className="space-y-2">
                {terminos.map((termino, index) => (
                  <div
                    key={termino.id}
                    className="bg-white border-2 border-purple-100 rounded-lg p-3 flex items-start gap-3 hover:border-purple-300 transition-all"
                  >
                    {/* Número de orden */}
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-[#7B1FA2]">
                      {index + 1}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      {terminoEditando === termino.id ? (
                        <input
                          type="text"
                          defaultValue={termino.descripcion}
                          value={descripcionEditando}
                          onChange={(e) => setDescripcionEditando(e.target.value)}
                          className="w-full px-2 py-1 border-2 border-purple-300 rounded text-sm focus:outline-none focus:border-[#7B1FA2]"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              onEditarTermino(termino.id, descripcionEditando);
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm text-gray-700">{termino.descripcion}</p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-1">
                      {terminoEditando === termino.id ? (
                        <>
                          <button
                            onClick={() => {
                              onEditarTermino(termino.id, descripcionEditando);
                            }}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-all"
                            title="Guardar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setTerminoEditando(null);
                              setDescripcionEditando('');
                            }}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-all"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setTerminoEditando(termino.id);
                              setDescripcionEditando(termino.descripcion);
                            }}
                            className="p-1 text-[#7B1FA2] hover:bg-purple-50 rounded transition-all"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEliminarTermino(termino.id, beneficio.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-all"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {index > 0 && (
                            <button
                              onClick={() => onMoverTermino(index, 'arriba')}
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-all"
                              title="Mover arriba"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                          )}
                          {index < terminos.length - 1 && (
                            <button
                              onClick={() => onMoverTermino(index, 'abajo')}
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-all"
                              title="Mover abajo"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            className="px-4 sm:px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] rounded-xl hover:from-[#6A1B9A] hover:to-[#5E1690] transition-all shadow-lg shadow-[#7B1FA2]/30"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

// ============== MODAL ELIMINAR BENEFICIO ==============
const ModalEliminarBeneficio = ({ beneficio, onClose, onConfirm }) => {
  if (!beneficio) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Desactivar Beneficio</h2>
              <p className="text-xs text-orange-100 mt-0.5">El beneficio dejará de estar disponible</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-orange-50 border-2 border-orange-100 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-700 mb-3">
              ¿Estás seguro de que deseas desactivar el siguiente beneficio?
            </p>
            <div className="bg-white border border-orange-200 rounded-lg p-3">
              <p className="font-bold text-gray-900 mb-1">{beneficio.nombre}</p>
              {beneficio.descripcion && (
                <p className="text-xs text-gray-600 mb-2">{beneficio.descripcion}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Building2 className="w-3 h-3" />
                <span>{beneficio.convenio?.empresa || 'Sin convenio'}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            El beneficio no se eliminará permanentemente, solo se desactivará y podrás reactivarlo más tarde.
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30"
          >
            Desactivar Beneficio
          </button>
        </div>
      </div>
    </div>
  );
};