import React, { useState, useEffect } from 'react';
import { Upload, X, Trash2, Download, Eye, FileText, Cloud, AlertCircle, Lock } from 'lucide-react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { getTiposArchivo, subirArchivo, getArchivosPorPaciente, eliminarArchivo, descargarArchivo } from '../../services/archivosDigitalesService';
import { API_BASE_URL, SERVER_BASE_URL } from '../../services/api';
import { Document, Page, pdfjs } from 'react-pdf';

// Configurar el worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const ArchivosDigitales = ({ paciente }) => {
  const currentUser = useCurrentUser();
  const [openModal, setOpenModal] = useState(false);
  const [tiposArchivo, setTiposArchivo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    tipoArchivoId: '',
    descripcion: '',
    archivo: null
  });
  const [errors, setErrors] = useState({});
  const [archivos, setArchivos] = useState([]);
  const [loadingArchivos, setLoadingArchivos] = useState(false);
  const [openVistaPrevia, setOpenVistaPrevia] = useState(false);
  const [archivoVistaPrevia, setArchivoVistaPrevia] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [openConfirmacion, setOpenConfirmacion] = useState(false);
  const [archivoAEliminar, setArchivoAEliminar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);

  // Función para verificar si el usuario es administrador
  const esAdministrador = () => {
    const rolUsuario = currentUser?.rol?.nombre?.toLowerCase() || currentUser?.rol?.toLowerCase() || '';
    return ['admin', 'administrador'].includes(rolUsuario);
  };

  // Obtener tipos de archivo del backend
  useEffect(() => {
    const obtenerTiposArchivo = async () => {
      try {
        const data = await getTiposArchivo();
        setTiposArchivo(data);
      } catch (error) {
        console.error('Error al obtener tipos de archivo:', error);
        setTiposArchivo([
          { id: 1, nombre: 'Informe de evaluación' },
          { id: 2, nombre: 'Receta médica' },
          { id: 3, nombre: 'Consentimiento informado' },
          { id: 4, nombre: 'Otro' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    obtenerTiposArchivo();
  }, []);

  // Cargar archivos del paciente
  useEffect(() => {
    const cargarArchivos = async () => {
      if (!paciente?.id) return;

      try {
        setLoadingArchivos(true);
        const data = await getArchivosPorPaciente(paciente.id);
        setArchivos(data || []);
      } catch (error) {
        console.error('Error al cargar archivos:', error);
        setArchivos([]);
      } finally {
        setLoadingArchivos(false);
      }
    };

    cargarArchivos();
  }, [paciente?.id]);

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!form.tipoArchivoId || form.tipoArchivoId === '') {
      nuevosErrores.tipoArchivoId = 'Debe seleccionar un tipo de archivo';
    }

    if (!form.descripcion || form.descripcion.trim() === '') {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    }

    if (!form.archivo) {
      nuevosErrores.archivo = 'Debe seleccionar un archivo';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleCerrarModal = () => {
    setOpenModal(false);
    setForm({
      tipoArchivoId: '',
      descripcion: '',
      archivo: null
    });
    setErrors({});
    setGuardando(false);
  };

  const handleEliminarArchivo = (archivo) => {
    setArchivoAEliminar(archivo);
    setOpenConfirmacion(true);
  };

  const confirmarEliminacion = async () => {
    if (!archivoAEliminar) return;

    try {
      await eliminarArchivo(archivoAEliminar.id);
      const archivosActualizados = await getArchivosPorPaciente(paciente.id);
      setArchivos(archivosActualizados || []);
      mostrarNotificacion('Archivo eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      mostrarNotificacion('Error al eliminar el archivo', 'error');
    } finally {
      setOpenConfirmacion(false);
      setArchivoAEliminar(null);
    }
  };

  const cancelarEliminacion = () => {
    setOpenConfirmacion(false);
    setArchivoAEliminar(null);
  };

  const formatearTamano = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVistaPrevia = (archivo) => {
    console.log('Vista previa de archivo:', archivo);
    console.log('ID del archivo:', archivo.id);
    console.log('Ruta del archivo:', archivo.rutaArchivo);
    console.log('Tipo MIME:', archivo.tipoMime);
    setArchivoVistaPrevia(archivo);
    setOpenVistaPrevia(true);
  };

  const handleCerrarVistaPrevia = () => {
    setOpenVistaPrevia(false);
    setArchivoVistaPrevia(null);
    setNumPages(null);
    setScale(1.0);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const containerRef = React.useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const esImagen = (tipoMime) => {
    return tipoMime?.startsWith('image/');
  };

  const esPDF = (tipoMime) => {
    return tipoMime === 'application/pdf';
  };

  const esWord = (tipoMime) => {
    return tipoMime === 'application/msword' ||
           tipoMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  };

  const esExcel = (tipoMime) => {
    return tipoMime === 'application/vnd.ms-excel' ||
           tipoMime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  };

  const esPowerPoint = (tipoMime) => {
    return tipoMime === 'application/vnd.ms-powerpoint' ||
           tipoMime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  };

  const esTexto = (tipoMime) => {
    return tipoMime?.startsWith('text/');
  };

  const puedeVistaPrevia = (archivo) => {
    return esImagen(archivo.tipoMime) ||
           esPDF(archivo.tipoMime) ||
           esWord(archivo.tipoMime) ||
           esExcel(archivo.tipoMime) ||
           esPowerPoint(archivo.tipoMime) ||
           esTexto(archivo.tipoMime);
  };

  const mostrarNotificacion = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
    setTimeout(() => {
      setSnackbar(prev => ({ ...prev, open: false }));
    }, 4000);
  };

  // FUNCIÓN MODIFICADA: Solo admin puede descargar
  const handleDescargarArchivo = async (archivo) => {
    try {
      if (!esAdministrador()) {
        
        return;
      }

      const blob = await descargarArchivo(archivo.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = archivo.nombreOriginal;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      mostrarNotificacion('Archivo descargado exitosamente', 'success');
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      mostrarNotificacion('Error al descargar el archivo', 'error');
    }
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);

    try {
      const formData = new FormData();
      formData.append('archivo', form.archivo);

      const nombreOriginal = form.archivo.name;
      const tipoMime = form.archivo.type;
      const tamano = form.archivo.size;
      const requiereVerificacion = (currentUser?.rol?.id === 1 || currentUser?.rol?.id === 2)
        ? 'OFICIAL'
        : 'TERAPIA';

      formData.append('terapeutaId', currentUser?.id);
      formData.append('tipoArchivoId', form.tipoArchivoId);
      formData.append('pacienteId', paciente?.id || null);
      formData.append('descripcion', form.descripcion);
      formData.append('nombreOriginal', nombreOriginal);
      formData.append('tipoMime', tipoMime);
      formData.append('tamano', tamano);
      formData.append('requiereVerificacion', requiereVerificacion);

      await subirArchivo(formData);

      const archivosActualizados = await getArchivosPorPaciente(paciente.id);
      setArchivos(archivosActualizados || []);

      mostrarNotificacion('Archivo subido exitosamente', 'success');
      handleCerrarModal();

    } catch (error) {
      console.error('Error al subir archivo:', error);
      mostrarNotificacion('Error al subir el archivo', 'error');
    } finally {
      setGuardando(false);
    }
  };

  // Prevenir clic derecho en imágenes para usuarios no admin
  const handleContextMenu = (e) => {
    if (!esAdministrador()) {
      e.preventDefault();
      
    }
  };

  // Prevenir arrastrar imágenes para usuarios no admin
  const handleDragStart = (e) => {
    if (!esAdministrador()) {
      e.preventDefault();
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      {/* Notificación */}
      {snackbar.open && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border transform transition-all duration-300 ${
          snackbar.severity === 'success'
            ? 'bg-white border-gray-100'
            : 'bg-white border-red-100'
        } flex items-center gap-2.5`}>
          <div className={`w-1.5 h-1.5 rounded-full ${snackbar.severity === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`}></div>
          <span className="text-xs font-medium text-gray-700">{snackbar.message}</span>
          <button onClick={() => setSnackbar(prev => ({ ...prev, open: false }))} className="ml-2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Archivos Digitales</h2>
            <p className="text-sm text-gray-500">Gestiona los documentos del paciente</p>
          </div>
        </div>
        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 bg-[#A3C644] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all shadow-sm"
        >
          <Upload className="w-4 h-4" />
          Subir Archivo
        </button>
      </div>

     

      {/* Lista de archivos */}
      {loadingArchivos ? (
        <div className="flex items-center justify-center py-12">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
      ) : archivos.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center">
          <Cloud className="w-16 h-16 text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm font-medium">No se encontró ningún archivo</p>
          <p className="text-gray-400 text-xs mt-1">Sube el primer archivo del paciente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {archivos.map((archivo) => (
            <div key={archivo.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{archivo.nombreOriginal}</h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{archivo.descripcion}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {archivo.tipoArchivo?.nombre || 'Sin tipo'}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {formatearTamano(archivo.tamano)}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hidden md:inline">
                        {formatearFecha(archivo.fechaCreacion)}
                      </span>
                      {archivo.terapeuta && (
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                          Subido por: {archivo.terapeuta.nombres} {archivo.terapeuta.apellidos}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* BOTÓN DE VISTA PREVIA: Todos pueden ver */}
                  {puedeVistaPrevia(archivo) && (
                    <button
                      onClick={() => handleVistaPrevia(archivo)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                      title="Vista previa"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}

                  {/* BOTÓN DE DESCARGA: Solo para Administrador */}
                  {esAdministrador() && (
                    <button
                      onClick={() => handleDescargarArchivo(archivo)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Descargar"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}

                  {/* ELIMINACIÓN DESHABILITADA: Los archivos no pueden ser eliminados por ningún usuario */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para subir archivo */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Subir Nuevo Archivo</h3>
              <button onClick={handleCerrarModal} className="p-1 hover:bg-gray-100 rounded-lg transition-all">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Terapeuta */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Terapeuta</label>
                <input
                  type="text"
                  value={currentUser?.nombres + ' ' + currentUser?.apellidos || ''}
                  readOnly
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Tipo de archivo */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Tipo de Archivo <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.tipoArchivoId}
                  onChange={(e) => {
                    setForm({ ...form, tipoArchivoId: e.target.value });
                    if (errors.tipoArchivoId) {
                      setErrors({ ...errors, tipoArchivoId: '' });
                    }
                  }}
                  className={`w-full px-4 py-2.5 text-sm border-2 rounded-lg focus:outline-none transition-all ${
                    errors.tipoArchivoId
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:border-[#A3C644]'
                  }`}
                >
                  <option value="">Seleccionar tipo</option>
                  {tiposArchivo.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                  ))}
                </select>
                {errors.tipoArchivoId && <p className="text-xs text-red-500 mt-1">{errors.tipoArchivoId}</p>}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => {
                    setForm({ ...form, descripcion: e.target.value });
                    if (errors.descripcion) {
                      setErrors({ ...errors, descripcion: '' });
                    }
                  }}
                  rows={3}
                  className={`w-full px-4 py-3 text-sm border-2 rounded-lg focus:outline-none transition-all resize-none ${
                    errors.descripcion
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:border-[#A3C644]'
                  }`}
                  placeholder="Describe el contenido del archivo..."
                />
                {errors.descripcion && <p className="text-xs text-red-500 mt-1">{errors.descripcion}</p>}
              </div>

              {/* Archivo */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Archivo <span className="text-red-500">*</span>
                </label>

                {/* Aviso de formatos recomendados */}
                <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-blue-900 mb-1">Formatos Recomendados con Vista Previa</p>
                      <div className="text-xs text-blue-700 space-y-1">
                        <p><strong>✓ PDF:</strong> Mejor opción para documentos (vista previa completa)</p>
                        <p><strong>✓ Imágenes:</strong> JPG, PNG, GIF, BMP, WEBP (vista previa con zoom)</p>
                        <p><strong>• Word/Excel/PowerPoint:</strong> Solo administradores pueden descargar</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-[#A3C644] transition-all ${
                  errors.archivo ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                }`}>
                  <input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,.txt,.csv"
                    onChange={(e) => {
                      setForm({ ...form, archivo: e.target.files[0] });
                      if (errors.archivo) {
                        setErrors({ ...errors, archivo: '' });
                      }
                    }}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 font-medium">
                      {form.archivo ? form.archivo.name : 'Haz click para seleccionar un archivo'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Tamaño máximo: 10MB</p>
                  </label>
                </div>
                {errors.archivo && <p className="text-xs text-red-500 mt-1">{errors.archivo}</p>}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={handleCerrarModal}
                disabled={guardando}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="flex items-center gap-2 bg-[#A3C644] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {guardando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vista Previa */}
      {openVistaPrevia && archivoVistaPrevia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="text-lg font-bold text-gray-900 truncate">Vista Previa - {archivoVistaPrevia.nombreOriginal}</h3>
                {!esAdministrador() && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Solo visualización - Descarga restringida
                  </p>
                )}
              </div>
              <button onClick={handleCerrarVistaPrevia} className="p-1 hover:bg-gray-100 rounded-lg transition-all flex-shrink-0">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-gray-50 relative">
              {/* IMÁGENES: Protegidas contra clic derecho y arrastre */}
              {esImagen(archivoVistaPrevia.tipoMime) && (
                <div className="flex items-center justify-center h-full">
                  <img
                    src={`${API_BASE_URL}/archivos-digitales/${archivoVistaPrevia.id}/preview`}
                    alt={archivoVistaPrevia.nombreOriginal}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg select-none"
                    onContextMenu={handleContextMenu}
                    onDragStart={handleDragStart}
                    onError={(e) => {
                      console.error('Error al cargar imagen:', e);
console.error('URL intentada:', e.target.src);
}}
onLoad={() => {
console.log('Imagen cargada correctamente');
}}
style={{
userSelect: 'none',
pointerEvents: esAdministrador() ? 'auto' : 'none'
}}
/>
{/* Overlay invisible para prevenir interacciones en usuarios no admin */}
{!esAdministrador() && (
<div
className="absolute inset-0"
onContextMenu={handleContextMenu}
style={{ cursor: 'default' }}
/>
)}
</div>
)}
          {/* PDFs: react-pdf para control total */}
{esPDF(archivoVistaPrevia.tipoMime) && (
  <>
    {esAdministrador() ? (
      // Admin: PDF normal con todas las funcionalidades
      <iframe
        src={`${API_BASE_URL}/archivos-digitales/${archivoVistaPrevia.id}/preview#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
        className="w-full h-full rounded-lg border-0 shadow-lg"
        title={archivoVistaPrevia.nombreOriginal}
        style={{ border: 'none' }}
      />
    ) : (
      // No-admin: react-pdf con scroll nativo y bloqueo de clic derecho
      <div className="relative w-full h-full">
        <div
          ref={containerRef}
          className="w-full h-full overflow-y-auto overflow-x-hidden"
          style={{
            backgroundColor: '#525659'
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleContextMenu(e);
            return false;
          }}
        >
          <div className="flex flex-col items-center py-4">
            <Document
              file={{
                url: `${API_BASE_URL}/archivos-digitales/${archivoVistaPrevia.id}/preview`,
                httpHeaders: {
                  'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
                }
              }}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => {
                console.error('Error cargando PDF:', error);
              }}
              loading={
                <div className="flex items-center justify-center py-12">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                </div>
              }
              error={
                <div className="flex items-center justify-center py-12">
                  <p className="text-red-500 text-sm">Error al cargar el PDF</p>
                </div>
              }
            >
              {numPages && Array.from(new Array(numPages), (el, index) => (
                <div
                  key={`page_${index + 1}`}
                  className="mb-4"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleContextMenu(e);
                  }}
                >
                  <Page
                    pageNumber={index + 1}
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </div>
              ))}
            </Document>
          </div>
        </div>

        {/* Controles de zoom flotantes */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-md z-[100]">
          <div className="flex items-center gap-2 px-3 py-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-medium text-gray-700">Vista protegida</span>
            <div className="flex items-center gap-1 ml-2 border-l pl-2">
              <button
                onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                title="Reducir zoom"
              >
                -
              </button>
              <span className="text-xs font-medium text-gray-700 min-w-[50px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale(prev => Math.min(3, prev + 0.1))}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                title="Aumentar zoom"
              >
                +
              </button>
              <button
                onClick={() => setScale(1.0)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors ml-1"
                title="Restablecer zoom"
              >
                100%
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
)}
          {/* ARCHIVOS DE OFFICE: Solo admin puede descargar */}
          {(esWord(archivoVistaPrevia.tipoMime) || esExcel(archivoVistaPrevia.tipoMime) || esPowerPoint(archivoVistaPrevia.tipoMime)) && (
            <div className="w-full h-full flex flex-col">
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <FileText className="w-20 h-20 text-blue-500 mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  {esWord(archivoVistaPrevia.tipoMime) && 'Documento de Word'}
                  {esExcel(archivoVistaPrevia.tipoMime) && 'Hoja de Cálculo Excel'}
                  {esPowerPoint(archivoVistaPrevia.tipoMime) && 'Presentación PowerPoint'}
                </p>
                <p className="text-sm text-gray-600 mb-4 max-w-md">
                  Los archivos de Office requieren aplicaciones especiales para visualizarse correctamente.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-w-md mb-4">
                  <p className="text-xs text-gray-500 mb-2">
                    <strong>Nombre:</strong> {archivoVistaPrevia.nombreOriginal}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    <strong>Tipo:</strong> {
                      esWord(archivoVistaPrevia.tipoMime) ? 'Microsoft Word' :
                      esExcel(archivoVistaPrevia.tipoMime) ? 'Microsoft Excel' :
                      'Microsoft PowerPoint'
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    <strong>Tamaño:</strong> {formatearTamano(archivoVistaPrevia.tamano)}
                  </p>
                </div>

                {esAdministrador() ? (
                  <button
                    onClick={() => handleDescargarArchivo(archivoVistaPrevia)}
                    className="flex items-center gap-2 bg-[#A3C644] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all shadow-sm"
                  >
                    <Download className="w-5 h-5" />
                    Descargar y Abrir con Office
                  </button>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md flex items-start gap-3">
                    <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-amber-900 mb-1">Descarga Restringida</p>
                      <p className="text-xs text-amber-700">
                        Los archivos de Office solo pueden ser descargados por administradores. Contacta con un administrador si necesitas acceder a este archivo.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ARCHIVOS DE TEXTO */}
          {esTexto(archivoVistaPrevia.tipoMime) && (
            <div className="relative w-full h-full">
              <iframe
                src={`${API_BASE_URL}/archivos-digitales/${archivoVistaPrevia.id}/preview`}
                className="w-full h-full rounded-lg border-0 shadow-lg bg-white p-4"
                title={archivoVistaPrevia.nombreOriginal}
                onError={(e) => {
                  console.error('Error al cargar archivo de texto:', e);
                }}
                onLoad={() => {
                  console.log('Archivo de texto cargado correctamente');
                }}
              />
              {/* Overlay para usuarios no admin */}
              {!esAdministrador() && (
                <div 
                  className="absolute inset-0 pointer-events-auto"
                  onContextMenu={handleContextMenu}
                  style={{ background: 'transparent' }}
                />
              )}
            </div>
          )}

          {/* OTROS ARCHIVOS SIN VISTA PREVIA */}
          {!puedeVistaPrevia(archivoVistaPrevia) && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-2">Vista previa no disponible</p>
              <p className="text-sm text-gray-500 mb-4">Este tipo de archivo no se puede previsualizar</p>
              
              {esAdministrador() ? (
                <p className="text-xs text-gray-400">Puedes descargarlo para verlo en tu dispositivo</p>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md flex items-start gap-3">
                  <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-amber-900 mb-1">Acceso Restringido</p>
                    <p className="text-xs text-amber-700">
                      Este archivo no tiene vista previa disponible y solo los administradores pueden descargarlo.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer con botones */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {!esAdministrador() && (
              <>
                <Lock className="w-4 h-4 text-amber-600" />
                <span className="text-amber-600 font-medium">Modo solo visualización</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCerrarVistaPrevia}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              Cerrar
            </button>
            
            {/* BOTÓN DE DESCARGA: Solo para administradores */}
            {esAdministrador() && (
              <button
                onClick={() => handleDescargarArchivo(archivoVistaPrevia)}
                className="flex items-center gap-2 bg-[#A3C644] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                Descargar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Modal de Confirmación de Eliminación */}
  {openConfirmacion && archivoAEliminar && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
              <p className="text-sm text-gray-500 mt-1">Esta acción no se puede deshacer</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{archivoAEliminar.nombreOriginal}</p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{archivoAEliminar.descripcion}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                    {archivoAEliminar.tipoArchivo?.nombre || 'Sin tipo'}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    {formatearTamano(archivoAEliminar.tamano)}
                  </span>
                  {archivoAEliminar.terapeuta && (
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                      Subido por: {archivoAEliminar.terapeuta.nombres} {archivoAEliminar.terapeuta.apellidos}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-700 text-center mt-6">
            ¿Estás seguro de que quieres eliminar este archivo?
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button
            onClick={cancelarEliminacion}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={confirmarEliminacion}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-all shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar Archivo
          </button>
        </div>
      </div>
    </div>
  )}
</div>
);
};
export default ArchivosDigitales;