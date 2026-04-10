import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MegaphoneIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  getCampanas,
  getEstadosCampana,
  crearCampana,
  actualizarCampana,
  eliminarCampana,
} from '../../services/campanasService';

const GestorCampanas = () => {
  const [campanas, setCampanas] = useState([]);
  const [campanasFiltered, setCampanasFiltered] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  const [filtroBusqueda, setFiltroBusqueda] = useState('');

  // Usuario autenticado
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion_corta: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado_id: 2,
    orden: 0,
    secciones: [{ titulo: '', contenido: '', orden: 0 }],
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrar campañas cuando cambian los filtros
  useEffect(() => {
    let resultado = [...campanas];

    // Filtrar por estado
    if (filtroEstado) {
      resultado = resultado.filter(c => c.estado_id === parseInt(filtroEstado));
    }

    // Filtrar por fecha inicio
    if (filtroFechaInicio) {
      resultado = resultado.filter(c => c.fecha_inicio >= filtroFechaInicio);
    }

    // Filtrar por fecha fin
    if (filtroFechaFin) {
      resultado = resultado.filter(c => c.fecha_fin <= filtroFechaFin);
    }

    // Filtrar por búsqueda en título y descripción
    if (filtroBusqueda) {
      const busqueda = filtroBusqueda.toLowerCase();
      resultado = resultado.filter(c =>
        c.titulo.toLowerCase().includes(busqueda) ||
        (c.descripcion_corta && c.descripcion_corta.toLowerCase().includes(busqueda))
      );
    }

    setCampanasFiltered(resultado);
  }, [campanas, filtroEstado, filtroFechaInicio, filtroFechaFin, filtroBusqueda]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [campanasData, estadosData] = await Promise.all([
        getCampanas(),
        getEstadosCampana(),
      ]);
      setCampanas(campanasData || []);
      setEstados(estadosData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      mostrarFeedback('Error al cargar las campañas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mostrarFeedback = (mensaje, tipo) => {
    setFeedback({ mensaje, tipo });
    setTimeout(() => setFeedback(null), 4000);
  };

  const abrirModal = (campana = null) => {
    if (campana) {
      setEditando(campana);
      setFormData({
        titulo: campana.titulo,
        descripcion_corta: campana.descripcion_corta || '',
        fecha_inicio: campana.fecha_inicio,
        fecha_fin: campana.fecha_fin,
        estado_id: campana.estado_id,
        orden: campana.orden,
        secciones: campana.secciones?.length > 0
          ? campana.secciones
          : [{ titulo: '', contenido: '', orden: 0 }],
      });
    } else {
      setEditando(null);
      setFormData({
        titulo: '',
        descripcion_corta: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado_id: 2,
        orden: 0,
        secciones: [{ titulo: '', contenido: '', orden: 0 }],
      });
    }
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditando(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSeccionChange = (index, field, value) => {
    const nuevasSecciones = [...formData.secciones];
    nuevasSecciones[index][field] = value;
    setFormData({ ...formData, secciones: nuevasSecciones });
  };

  const agregarSeccion = () => {
    setFormData({
      ...formData,
      secciones: [
        ...formData.secciones,
        { titulo: '', contenido: '', orden: formData.secciones.length },
      ],
    });
  };

  const eliminarSeccion = (index) => {
    const nuevasSecciones = formData.secciones.filter((_, i) => i !== index);
    setFormData({ ...formData, secciones: nuevasSecciones });
  };

  const moverSeccion = (index, direccion) => {
    const nuevasSecciones = [...formData.secciones];
    const newIndex = index + direccion;
    if (newIndex >= 0 && newIndex < nuevasSecciones.length) {
      [nuevasSecciones[index], nuevasSecciones[newIndex]] =
      [nuevasSecciones[newIndex], nuevasSecciones[index]];
      // Actualizar orden
      nuevasSecciones.forEach((sec, i) => sec.orden = i);
      setFormData({ ...formData, secciones: nuevasSecciones });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const dataToSend = { ...formData };

      if (editando) {
        // Agregar user_actua_id al actualizar
        dataToSend.user_actua_id = user.id;
        await actualizarCampana(editando.id, dataToSend);
        mostrarFeedback('Campaña actualizada correctamente', 'success');
      } else {
        // Agregar user_crea_id al crear
        dataToSend.user_crea_id = user.id;
        await crearCampana(dataToSend);
        mostrarFeedback('Campaña creada correctamente', 'success');
      }
      cerrarModal();
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar:', error);
      mostrarFeedback(error.response?.data?.message || 'Error al guardar la campaña', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    if (!modalEliminar) return;
    setGuardando(true);

    try {
      await eliminarCampana(modalEliminar.id);
      mostrarFeedback('Campaña eliminada correctamente', 'success');
      setModalEliminar(null);
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      mostrarFeedback('Error al eliminar la campaña', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return '';
    const [year, month, day] = fechaString.split('-');
    return new Date(year, month - 1, day).toLocaleDateString('es-ES');
  };

  const getEstadoBadge = (estadoId) => {
    return estadoId === 1 ? (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
        <CheckCircleIcon className="w-3 h-3" />
        Activa
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
        <XCircleIcon className="w-3 h-3" />
        Inactiva
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando campañas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <MegaphoneIcon className="w-8 h-8 text-[#7B1FA2]" />
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Campañas</h1>
              </div>
              <p className="text-sm text-gray-500">
                Administra las campañas que se muestran en la web pública
              </p>
            </div>
            <button
              onClick={() => abrirModal()}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Nueva Campaña
            </button>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`mb-4 p-4 rounded-xl ${
              feedback.tipo === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {feedback.mensaje}
          </div>
        )}

        {/* Filtros */}
        <div className="mb-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <FunnelIcon className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-700">Filtros</h3>
            {(filtroEstado || filtroFechaInicio || filtroFechaFin || filtroBusqueda) && (
              <button
                onClick={() => {
                  setFiltroEstado('');
                  setFiltroFechaInicio('');
                  setFiltroFechaFin('');
                  setFiltroBusqueda('');
                }}
                className="ml-auto flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                Limpiar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Buscar por título
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filtroBusqueda}
                  onChange={(e) => setFiltroBusqueda(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Desde fecha inicio
              </label>
              <input
                type="date"
                value={filtroFechaInicio}
                onChange={(e) => setFiltroFechaInicio(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Hasta fecha fin
              </label>
              <input
                type="date"
                value={filtroFechaFin}
                onChange={(e) => setFiltroFechaFin(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Mostrando {campanasFiltered.length} de {campanas.length} campañas
          </div>
        </div>

        {/* Lista de Campañas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          {campanas.length === 0 ? (
            <div className="p-12 text-center">
              <MegaphoneIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay campañas registradas</p>
              <button
                onClick={() => abrirModal()}
                className="mt-4 text-sm text-[#7B1FA2] font-semibold hover:underline"
              >
                Crear la primera campaña
              </button>
            </div>
          ) : campanasFiltered.length === 0 ? (
            <div className="p-12 text-center">
              <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron campañas con los filtros aplicados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Fechas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Orden
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Secciones
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {campanasFiltered.map((campana) => (
                    <tr key={campana.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{campana.titulo}</div>
                        {campana.descripcion_corta && (
                          <div className="text-sm text-gray-500 mt-1">
                            {campana.descripcion_corta.substring(0, 100)}
                            {campana.descripcion_corta.length > 100 && '...'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <CalendarIcon className="w-4 h-4" />
                          <span>
                            {formatearFecha(campana.fecha_inicio)} - {formatearFecha(campana.fecha_fin)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getEstadoBadge(campana.estado_id)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{campana.orden}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {campana.secciones?.length || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => abrirModal(campana)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setModalEliminar(campana)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editando ? 'Editar Campaña' : 'Nueva Campaña'}
              </h2>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-600"
                disabled={guardando}
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase">
                  Información Básica
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción Corta
                  </label>
                  <textarea
                    name="descripcion_corta"
                    value={formData.descripcion_corta}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha Inicio *
                    </label>
                    <input
                      type="date"
                      name="fecha_inicio"
                      value={formData.fecha_inicio}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha Fin *
                    </label>
                    <input
                      type="date"
                      name="fecha_fin"
                      value={formData.fecha_fin}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado *
                    </label>
                    <select
                      name="estado_id"
                      value={formData.estado_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent"
                    >
                      {estados.map((estado) => (
                        <option key={estado.id} value={estado.id}>
                          {estado.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Orden
                    </label>
                    <input
                      type="number"
                      name="orden"
                      value={formData.orden}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Secciones */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase">
                    Secciones de Contenido
                  </h3>
                  <button
                    type="button"
                    onClick={agregarSeccion}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#7B1FA2] hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Agregar Sección
                  </button>
                </div>

                {formData.secciones.map((seccion, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">
                        Sección {index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moverSeccion(index, -1)}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronUpIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moverSeccion(index, 1)}
                          disabled={index === formData.secciones.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronDownIcon className="w-4 h-4" />
                        </button>
                        {formData.secciones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => eliminarSeccion(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título de la Sección (opcional)
                      </label>
                      <input
                        type="text"
                        value={seccion.titulo}
                        onChange={(e) => handleSeccionChange(index, 'titulo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contenido *
                      </label>
                      <textarea
                        value={seccion.contenido}
                        onChange={(e) => handleSeccionChange(index, 'contenido', e.target.value)}
                        required
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent resize-none"
                        placeholder="Puedes usar Markdown para dar formato..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={cerrarModal}
                disabled={guardando}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={guardando}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : editando ? 'Actualizar' : 'Crear Campaña'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar Eliminación</h3>
              <p className="text-sm text-gray-600 mb-4">
                ¿Estás seguro de eliminar la campaña "{modalEliminar.titulo}"? Esta acción no se
                puede deshacer.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setModalEliminar(null)}
                  disabled={guardando}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEliminar}
                  disabled={guardando}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50"
                >
                  {guardando ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestorCampanas;
