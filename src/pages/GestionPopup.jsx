
import React, { useState, useEffect } from 'react';
import {
  Image,
  Upload,
  Eye,
  Trash2,
  X,
  Check,
  AlertCircle,
  Calendar,
  Plus,
  Edit,
  Clock,
  Power,
  PowerOff,
  MessageCircle
} from 'lucide-react';
import * as popupService from '../services/popupService';
import { API_BASE_URL } from '../services/api';

const GestionPopup = () => {
  const [popups, setPopups] = useState([]);
  const [dialogoCrear, setDialogoCrear] = useState(false);
  const [dialogoEditar, setDialogoEditar] = useState(false);
  const [popupEditando, setPopupEditando] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 12;

  // Estado del formulario
  const [formulario, setFormulario] = useState({
    titulo: '',
    fechaInicio: '',
    fechaFin: '',
    activo: true,
    mensajeWhatsapp: '', // 👈 NUEVO
    imagen: null,
    imagenPreview: null
  });

  useEffect(() => {
    cargarPopups();
  }, []);

  const cargarPopups = async () => {
    try {
      setCargando(true);
      const data = await popupService.listarPopups();
      setPopups(data);
    } catch (error) {
      console.error('Error al cargar popups:', error);
      showNotification('Error al cargar los popups', 'error');
    } finally {
      setCargando(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const resetFormulario = () => {
    setFormulario({
      titulo: '',
      fechaInicio: '',
      fechaFin: '',
      activo: true,
      mensajeWhatsapp: '', // 👈 NUEVO
      imagen: null,
      imagenPreview: null
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const extensionesPermitidas = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      const esImagenPorTipo = file.type.startsWith('image/') || tiposPermitidos.includes(file.type);
      const esImagenPorExtension = extensionesPermitidas.includes(extension);

      if (!esImagenPorTipo && !esImagenPorExtension) {
        showNotification(`Formato no permitido. Solo se aceptan imágenes JPG, PNG, GIF o WEBP. Archivo recibido: ${file.type || 'tipo desconocido'}`, 'error');
        return;
      }

      // Validar tamaño (aumentado a 5MB para imágenes decorativas)
      const tamajoMaximo = 5 * 1024 * 1024; // 5MB
      if (file.size > tamajoMaximo) {
        const tamanjoMB = (file.size / (1024 * 1024)).toFixed(2);
        showNotification(`La imagen es muy grande (${tamanjoMB}MB). El tamaño máximo permitido es 5MB. Por favor, comprime la imagen antes de subirla.`, 'error');
        return;
      }

      // Si pasa todas las validaciones, leer el archivo
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormulario(prev => ({
          ...prev,
          imagen: file,
          imagenPreview: reader.result
        }));
      };
      reader.onerror = () => {
        showNotification('Error al leer el archivo. Por favor, intenta nuevamente.', 'error');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrearPopup = async () => {
    if (!formulario.titulo || !formulario.fechaInicio || !formulario.fechaFin || !formulario.imagen) {
      showNotification('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    if (new Date(formulario.fechaInicio) >= new Date(formulario.fechaFin)) {
      showNotification('La fecha de inicio debe ser anterior a la fecha de fin', 'error');
      return;
    }

    setGuardando(true);
    try {
      await popupService.crearPopup({
        titulo: formulario.titulo,
        fechaInicio: formulario.fechaInicio,
        fechaFin: formulario.fechaFin,
        activo: formulario.activo,
        mensajeWhatsapp: formulario.mensajeWhatsapp // 👈 NUEVO
      }, formulario.imagen);

      showNotification('Popup creado correctamente', 'success');
      setDialogoCrear(false);
      resetFormulario();
      await cargarPopups();
    } catch (error) {
      showNotification('Error al crear el popup', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleActualizarPopup = async () => {
    if (!formulario.titulo || !formulario.fechaInicio || !formulario.fechaFin) {
      showNotification('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    if (new Date(formulario.fechaInicio) >= new Date(formulario.fechaFin)) {
      showNotification('La fecha de inicio debe ser anterior a la fecha de fin', 'error');
      return;
    }

    setGuardando(true);
    try {
      await popupService.actualizarPopup(
        popupEditando.id,
        {
          titulo: formulario.titulo,
          fechaInicio: formulario.fechaInicio,
          fechaFin: formulario.fechaFin,
          activo: formulario.activo,
          mensajeWhatsapp: formulario.mensajeWhatsapp // 👈 NUEVO
        },
        formulario.imagen
      );

      showNotification('Popup actualizado correctamente', 'success');
      setDialogoEditar(false);
      setPopupEditando(null);
      resetFormulario();
      await cargarPopups();
    } catch (error) {
      showNotification('Error al actualizar el popup', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleActivo = async (id, activo) => {
    try {
      await popupService.toggleActivoPopup(id, !activo);
      showNotification(`Popup ${!activo ? 'activado' : 'desactivado'}`, 'success');
      await cargarPopups();
    } catch (error) {
      showNotification('Error al cambiar el estado', 'error');
    }
  };

  const handleEliminarPopup = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este popup? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await popupService.eliminarPopup(id);
      showNotification('Popup eliminado correctamente', 'success');

      // Si eliminas el último de la página actual, retroceder una página
      const indexInicio = (paginaActual - 1) * itemsPorPagina;
      const indexFin = indexInicio + itemsPorPagina;
      const popupsEnPaginaActual = popups.slice(indexInicio, indexFin);
      if (popupsEnPaginaActual.length === 1 && paginaActual > 1) {
        setPaginaActual(paginaActual - 1);
      }

      await cargarPopups();
    } catch (error) {
      showNotification('Error al eliminar el popup', 'error');
    }
  };

  const convertirUTCaDateTimeLocal = (fechaUTC) => {
    const fecha = new Date(fechaUTC);
    fecha.setHours(fecha.getHours() - 5);
    return fecha.toISOString().slice(0, 16);
  };

  const abrirDialogoEditar = (popup) => {
    setPopupEditando(popup);
    setFormulario({
      titulo: popup.titulo,
      fechaInicio: convertirUTCaDateTimeLocal(popup.fechaInicio),
      fechaFin: convertirUTCaDateTimeLocal(popup.fechaFin),
      activo: popup.activo,
      mensajeWhatsapp: popup.mensajeWhatsapp || '', // 👈 NUEVO
      imagen: null,
      imagenPreview: `${API_BASE_URL}/popup/imagen/${popup.imagenUrl}`
    });
    setDialogoEditar(true);
  };

  const getEstadoPopup = (fechaInicio, fechaFin, activo) => {
    if (!activo) return { texto: 'Desactivado', color: 'text-gray-500', bg: 'bg-gray-100' };

    const ahora = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (ahora < inicio) return { texto: 'Programado', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (ahora >= inicio && ahora <= fin) return { texto: 'Activo Ahora', color: 'text-green-600', bg: 'bg-green-100' };
    return { texto: 'Vencido', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando popups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:pt-12">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl ${
            notification.type === 'error'
              ? 'bg-red-500 text-white'
              : notification.type === 'info'
              ? 'bg-blue-500 text-white'
              : 'bg-green-500 text-white'
          }`}>
            {notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <Check className="w-5 h-5" />
            )}
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Gestión de Popups</h1>
                <p className="text-gray-600">Programa y gestiona tus popups promocionales</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetFormulario();
                setDialogoCrear(true);
              }}
              className="px-6 py-3 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Crear Popup
            </button>
          </div>
        </div>

        {/* Lista de popups */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(() => {
            const indexInicio = (paginaActual - 1) * itemsPorPagina;
            const indexFin = indexInicio + itemsPorPagina;
            const popupsPaginados = popups.slice(indexInicio, indexFin);
            const totalPaginas = Math.ceil(popups.length / itemsPorPagina);

            if (popups.length === 0) {
              return (
                <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No hay popups programados
                    </h3>
                    <p className="text-gray-500 mb-6">Crea tu primer popup promocional para comenzar</p>
                    <button
                      onClick={() => {
                        resetFormulario();
                        setDialogoCrear(true);
                      }}
                      className="px-6 py-3 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="w-5 h-5" />
                      Crear Primer Popup
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <>
                {popupsPaginados.map((popup) => {
              const estado = getEstadoPopup(popup.fechaInicio, popup.fechaFin, popup.activo);
              return (
                <div key={popup.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Imagen */}
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={`${API_BASE_URL}/popup/imagen/${popup.imagenUrl}`}
                      alt={popup.titulo}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                      }}
                    />
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold ${estado.bg} ${estado.color}`}>
                      {estado.texto}
                    </div>
                    {/* Indicador de WhatsApp */}
                    {popup.mensajeWhatsapp && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        WhatsApp
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-2.5">
                    <h3 className="text-xs font-bold text-gray-900 mb-2 line-clamp-2 h-8">{popup.titulo}</h3>

                    <div className="space-y-1 mb-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-[#7B1FA2] flex-shrink-0" />
                        <span className="text-xs truncate">{formatearFecha(popup.fechaInicio)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-[#7B1FA2] flex-shrink-0" />
                        <span className="text-xs truncate">{formatearFecha(popup.fechaFin)}</span>
                      </div>
                      {popup.mensajeWhatsapp && (
                        <div className="flex items-center gap-1 p-1 bg-green-50 rounded">
                          <MessageCircle className="w-2.5 h-2.5 text-green-600 flex-shrink-0" />
                          <span className="text-xs text-green-700 truncate">WhatsApp</span>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="grid grid-cols-4 gap-1">
                      <button
                        onClick={() => handleToggleActivo(popup.id, popup.activo)}
                        className={`col-span-4 px-2 py-1 rounded text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                          popup.activo
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title={popup.activo ? 'Activo' : 'Inactivo'}
                      >
                        {popup.activo ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                        <span className="hidden sm:inline">{popup.activo ? 'Activo' : 'Inactivo'}</span>
                      </button>
                      <button
                        onClick={() => setVistaPrevia(popup)}
                        className="p-1.5 bg-purple-50 text-[#7B1FA2] rounded hover:bg-purple-100 transition-all border border-purple-200 flex items-center justify-center"
                        title="Ver"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => abrirDialogoEditar(popup)}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-all border border-blue-200 flex items-center justify-center"
                        title="Editar"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleEliminarPopup(popup.id)}
                        className="col-span-2 p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-all border border-red-200 flex items-center justify-center gap-1"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span className="text-xs hidden sm:inline">Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
                  );
                })}

                {/* Paginación */}
                {totalPaginas > 1 && (
                  <div className="col-span-full flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                      disabled={paginaActual === 1}
                      className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Anterior
                    </button>

                    <div className="flex gap-1">
                      {[...Array(totalPaginas)].map((_, idx) => {
                        const numeroPagina = idx + 1;
                        return (
                          <button
                            key={numeroPagina}
                            onClick={() => setPaginaActual(numeroPagina)}
                            className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                              paginaActual === numeroPagina
                                ? 'bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white shadow-md'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {numeroPagina}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                      disabled={paginaActual === totalPaginas}
                      className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Información útil */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Cómo funciona</h3>
          </div>
          <ul className="text-sm text-gray-600 space-y-2.5">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Los popups se muestran automáticamente según las fechas programadas</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Solo se muestra un popup a la vez (el más reciente si hay varios activos)</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Los popups vencidos se ocultan automáticamente</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Puedes programar múltiples popups para diferentes períodos</span>
            </li>
            <li className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Configura un mensaje de WhatsApp personalizado para cada promoción</span>
            </li>
            <li className="flex items-start gap-2">
              <Power className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
              <span>Desactiva un popup para que no se muestre aunque esté en su período</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Diálogo Crear/Editar */}
      {(dialogoCrear || dialogoEditar) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white p-6 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                {dialogoCrear ? <Plus className="w-6 h-6" /> : <Edit className="w-6 h-6" />}
                {dialogoCrear ? 'Crear Nuevo Popup' : 'Editar Popup'}
              </h3>
              <button
                onClick={() => {
                  dialogoCrear ? setDialogoCrear(false) : setDialogoEditar(false);
                  resetFormulario();
                  setPopupEditando(null);
                }}
                className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Título */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Título del Popup *
                </label>
                <input
                  type="text"
                  value={formulario.titulo}
                  onChange={(e) => setFormulario(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ej: Promoción Día Mundial del TEA"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#7B1FA2] focus:outline-none transition-colors"
                />
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Fecha y Hora de Inicio *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={formulario.fechaInicio.split('T')[0] || ''}
                      onChange={(e) => {
                        const horaActual = formulario.fechaInicio.split('T')[1] || '00:00';
                        setFormulario(prev => ({ ...prev, fechaInicio: `${e.target.value}T${horaActual}` }));
                      }}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#7B1FA2] focus:outline-none transition-colors text-sm"
                    />
                    <input
                      type="time"
                      value={formulario.fechaInicio.split('T')[1] || ''}
                      onChange={(e) => {
                        const fechaActual = formulario.fechaInicio.split('T')[0] || '';
                        setFormulario(prev => ({ ...prev, fechaInicio: `${fechaActual}T${e.target.value}` }));
                      }}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#7B1FA2] focus:outline-none transition-colors text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Fecha y Hora de Fin *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={formulario.fechaFin.split('T')[0] || ''}
                      onChange={(e) => {
                        const horaActual = formulario.fechaFin.split('T')[1] || '00:00';
                        setFormulario(prev => ({ ...prev, fechaFin: `${e.target.value}T${horaActual}` }));
                      }}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#7B1FA2] focus:outline-none transition-colors text-sm"
                    />
                    <input
                      type="time"
                      value={formulario.fechaFin.split('T')[1] || ''}
                      onChange={(e) => {
                        const fechaActual = formulario.fechaFin.split('T')[0] || '';
                        setFormulario(prev => ({ ...prev, fechaFin: `${fechaActual}T${e.target.value}` }));
                      }}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#7B1FA2] focus:outline-none transition-colors text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900">Estado del Popup</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formulario.activo ? 'Se mostrará en las fechas programadas' : 'No se mostrará (desactivado)'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormulario(prev => ({ ...prev, activo: !prev.activo }))}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      formulario.activo ? 'bg-[#7B1FA2]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        formulario.activo ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>

              {/* Mensaje WhatsApp - NUEVO */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  Mensaje de WhatsApp (Opcional)
                </label>
                <textarea
                  value={formulario.mensajeWhatsapp}
                  onChange={(e) => setFormulario(prev => ({ ...prev, mensajeWhatsapp: e.target.value }))}
                  placeholder="Ej: Hola! Vengo de la web y deseo más información sobre la promoción por el Día Mundial del TEA"
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#7B1FA2] focus:outline-none transition-colors resize-none"
                />
                <p className="text-xs text-gray-500 mt-2 flex items-start gap-2">
                  <MessageCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>
                    Este mensaje se enviará automáticamente al hacer clic en el botón de WhatsApp del popup.
                    Si no agregas un mensaje, no aparecerá el botón de WhatsApp.
                  </span>
                </p>
              </div>

              {/* Imagen */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Imagen del Popup * {dialogoEditar && '(Dejar vacío para mantener la actual)'}
                </label>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="upload-popup-image"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="upload-popup-image">
                  <div className="cursor-pointer border-2 border-dashed border-[#7B1FA2] rounded-xl p-8 hover:bg-purple-50 transition-colors text-center">
                    {formulario.imagenPreview ? (
                      <div>
                        <img
                          src={formulario.imagenPreview}
                          alt="Vista previa"
                          className="max-w-full max-h-64 mx-auto rounded-xl border border-gray-200 shadow-lg mb-3"
                        />
                        <p className="text-sm text-gray-600">Click para cambiar imagen</p>
                      </div>
                    ) : (
                      <div>
                        <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <Upload className="w-8 h-8 text-[#7B1FA2]" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900 mb-1">
                          Seleccionar Imagen
                        </p>
                        <p className="text-sm text-gray-600">
                          PNG, JPG, GIF, WEBP - Máx 5MB - Recomendado: 800x800px
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  dialogoCrear ? setDialogoCrear(false) : setDialogoEditar(false);
                  resetFormulario();
                  setPopupEditando(null);
                }}
                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={dialogoCrear ? handleCrearPopup : handleActualizarPopup}
                disabled={guardando || !formulario.titulo || !formulario.fechaInicio || !formulario.fechaFin || (dialogoCrear && !formulario.imagen)}
                className="px-5 py-2.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {guardando ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    {dialogoCrear ? 'Crear Popup' : 'Guardar Cambios'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de vista previa */}
      {vistaPrevia && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white p-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Vista Previa: {vistaPrevia.titulo}
              </h3>
              <button
                onClick={() => setVistaPrevia(null)}
                className="w-9 h-9 flex items-center justify-center hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-auto flex-1">
              <img
                src={`${API_BASE_URL}/popup/imagen/${vistaPrevia.imagenUrl}`}
                alt={vistaPrevia.titulo}
                className="w-full h-auto object-contain"
                style={{ maxHeight: 'calc(90vh - 80px)' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPopup;
