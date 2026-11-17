import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Upload, X, Trash2, Download, Eye, FileText, Cloud, AlertCircle, Lock,
  Image as ImageIcon, FileSpreadsheet, User, Calendar, HardDrive, CheckCircle, XCircle,
  ZoomIn, ZoomOut
} from 'lucide-react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { getTiposArchivo, subirArchivo, getArchivosPorPaciente, eliminarArchivo, descargarArchivo } from '../../services/archivosDigitalesService';
import { API_BASE_URL } from '../../services/api';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

// ---------- Helpers de tipo de archivo ----------
const esImagen = (m) => m?.startsWith('image/');
const esPDF = (m) => m === 'application/pdf';
const esWord = (m) =>
  m === 'application/msword' ||
  m === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const esExcel = (m) =>
  m === 'application/vnd.ms-excel' ||
  m === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const esPowerPoint = (m) =>
  m === 'application/vnd.ms-powerpoint' ||
  m === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
const esTexto = (m) => m?.startsWith('text/');

const puedeVistaPrevia = (a) =>
  esImagen(a.tipoMime) || esPDF(a.tipoMime) || esWord(a.tipoMime) ||
  esExcel(a.tipoMime) || esPowerPoint(a.tipoMime) || esTexto(a.tipoMime);

const getFileStyle = (mime) => {
  if (esPDF(mime)) return { Icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50' };
  if (esImagen(mime)) return { Icon: ImageIcon, color: 'text-blue-600', bg: 'bg-blue-50' };
  if (esExcel(mime)) return { Icon: FileSpreadsheet, color: 'text-emerald-600', bg: 'bg-emerald-50' };
  if (esWord(mime)) return { Icon: FileText, color: 'text-sky-600', bg: 'bg-sky-50' };
  if (esPowerPoint(mime)) return { Icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' };
  return { Icon: FileText, color: 'text-[#7B1FA2]', bg: 'bg-purple-50' };
};

const Spinner = ({ className = 'w-12 h-12' }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 border-2 border-purple-100 rounded-full"></div>
    <div className="absolute inset-0 border-2 border-transparent border-t-[#7B1FA2] rounded-full animate-spin"></div>
  </div>
);

const inputBase =
  'w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none transition-all bg-white text-gray-900';

const labelBase = 'block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5';

// Section reutilizable
const Section = ({ icon: Icon, title, iconColor = 'text-[#7B1FA2]', bgColor = 'bg-purple-50', action, children }) => (
  <section className="glass-panel rounded-3xl p-5">
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0 ring-1 ring-black/[0.03]`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap">{title}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
      {action}
    </div>
    {children}
  </section>
);

const SummaryChip = ({ Icon, label, value, color = 'text-[#7B1FA2]', bg = 'bg-purple-100/70' }) => (
  <div className="rounded-xl bg-[#F5F0FA] p-3 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all">
    <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-[18px] h-[18px] ${color}`} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-[13px] font-semibold text-gray-700 break-words leading-snug">{value}</p>
    </div>
  </div>
);

const ArchivosDigitales = ({ paciente }) => {
  const currentUser = useCurrentUser();
  const [openModal, setOpenModal] = useState(false);
  const [tiposArchivo, setTiposArchivo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ tipoArchivoId: '', descripcion: '', archivo: null });
  const [errors, setErrors] = useState({});
  const [archivos, setArchivos] = useState([]);
  const [loadingArchivos, setLoadingArchivos] = useState(false);
  const [openVistaPrevia, setOpenVistaPrevia] = useState(false);
  const [archivoVistaPrevia, setArchivoVistaPrevia] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openConfirmacion, setOpenConfirmacion] = useState(false);
  const [archivoAEliminar, setArchivoAEliminar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);
  const containerRef = useRef(null);

  const esAdministrador = () => {
    const rolUsuario = currentUser?.rol?.nombre?.toLowerCase() || currentUser?.rol?.toLowerCase() || '';
    return ['admin', 'administrador'].includes(rolUsuario);
  };

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale((prev) => Math.max(0.5, Math.min(3, prev + delta)));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [openVistaPrevia, archivoVistaPrevia]);

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
    setForm({ tipoArchivoId: '', descripcion: '', archivo: null });
    setErrors({});
    setGuardando(false);
  };

  const handleEliminarArchivo = (archivo) => {
    setArchivoAEliminar(archivo);
    setOpenConfirmacion(true);
  };

  const mostrarNotificacion = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, open: false }));
    }, 4000);
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
    if (!bytes || bytes === 0) return '0 Bytes';
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

  const handleDescargarArchivo = async (archivo) => {
    try {
      if (!esAdministrador()) return;
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
    if (!validarFormulario()) return;
    setGuardando(true);
    try {
      const formData = new FormData();
      formData.append('archivo', form.archivo);

      const nombreOriginal = form.archivo.name;
      const tipoMime = form.archivo.type;
      const tamano = form.archivo.size;
      const requiereVerificacion =
        currentUser?.rol?.id === 1 || currentUser?.rol?.id === 2 ? 'OFICIAL' : 'TERAPIA';

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

  const handleContextMenu = (e) => {
    if (!esAdministrador()) e.preventDefault();
  };

  const handleDragStart = (e) => {
    if (!esAdministrador()) e.preventDefault();
  };

  const previewUrl = (archivo) => `${API_BASE_URL}/archivos-digitales/${archivo.id}/preview`;

  const totalArchivos = archivos.length;
  const conVistaPrevia = archivos.filter(puedeVistaPrevia).length;
  const soloDescarga = totalArchivos - conVistaPrevia;

  return (
    <div className="space-y-4">
      {/* Snackbar */}
      {snackbar.open && createPortal(
        <div className="fixed top-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-xl shadow-purple-900/10 border border-gray-100">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              snackbar.severity === 'success' ? 'bg-[#A3C644]/15' : 'bg-red-50'
            }`}
          >
            {snackbar.severity === 'success' ? (
              <CheckCircle className="w-4 h-4 text-[#8FB82D]" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
          <span className="text-xs font-semibold text-gray-700">{snackbar.message}</span>
          <button
            onClick={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      , document.body)}

      {/* Header principal */}
      <div className="glass-panel rounded-3xl p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-500/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#2D0A4E] leading-tight">Archivos Digitales</h2>
              <p className="text-[13px] text-gray-400">Gestiona los documentos del paciente</p>
            </div>
          </div>
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 cx-glow bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg shadow-purple-500/30"
          >
            <Upload className="w-4 h-4" />
            Subir Archivo
          </button>
        </div>

        <div className="h-px bg-gradient-to-r from-gray-200 to-transparent my-4" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <SummaryChip Icon={FileText} label="Total archivos" value={totalArchivos} />
          <SummaryChip Icon={CheckCircle} label="Con vista previa" value={conVistaPrevia} color="text-emerald-600" bg="bg-emerald-100/70" />
          <SummaryChip Icon={Lock} label="Solo descarga" value={soloDescarga} color="text-amber-600" bg="bg-amber-100/70" />
        </div>
      </div>

      {/* Lista */}
      <Section
        icon={FileText}
        title="Documentos del Paciente"
        iconColor="text-[#7B1FA2]"
        bgColor="bg-purple-50"
        action={
          !loadingArchivos && archivos.length > 0 ? (
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {archivos.length} {archivos.length === 1 ? 'archivo' : 'archivos'}
            </span>
          ) : null
        }
      >
        {loadingArchivos ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : archivos.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
              <Cloud className="w-8 h-8 text-[#7B1FA2]/40" />
            </div>
            <p className="text-sm font-semibold text-gray-500">No se encontró ningún archivo</p>
            <p className="text-xs text-gray-400 mt-1">Sube el primer archivo del paciente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {archivos.map((archivo) => {
              const { Icon, color, bg } = getFileStyle(archivo.tipoMime);
              return (
                <div
                  key={archivo.id}
                  className="rounded-2xl bg-[#F5F0FA] p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 ring-1 ring-black/[0.03]`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-800 truncate">{archivo.nombreOriginal}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{archivo.descripcion}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="px-2.5 py-1 bg-purple-100/70 text-[#7B1FA2] rounded-full text-[11px] font-semibold">
                            {archivo.tipoArchivo?.nombre || 'Sin tipo'}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-gray-500 rounded-full text-[11px]">
                            <HardDrive className="w-3 h-3" />
                            {formatearTamano(archivo.tamano)}
                          </span>
                          <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 bg-white text-gray-500 rounded-full text-[11px]">
                            <Calendar className="w-3 h-3" />
                            {formatearFecha(archivo.fechaCreacion)}
                          </span>
                          {archivo.terapeuta && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-medium">
                              <User className="w-3 h-3" />
                              {archivo.terapeuta.nombres} {archivo.terapeuta.apellidos}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {puedeVistaPrevia(archivo) && (
                        <button
                          onClick={() => handleVistaPrevia(archivo)}
                          className="p-2 text-gray-400 hover:text-[#7B1FA2] hover:bg-white rounded-lg transition-colors"
                          title="Vista previa"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {esAdministrador() && (
                        <>
                          <button
                            onClick={() => handleDescargarArchivo(archivo)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                            title="Descargar"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEliminarArchivo(archivo)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar archivo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* ===================== MODAL: SUBIR ARCHIVO ===================== */}
      {openModal && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-purple-900/30 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-white/20">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center shadow-sm shadow-purple-500/20">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#2D0A4E] leading-tight">Subir Nuevo Archivo</h3>
                  <p className="text-xs text-gray-400">Agrega un documento al expediente del paciente</p>
                </div>
              </div>
              <button
                onClick={handleCerrarModal}
                className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-purple-50 hover:text-[#7B1FA2] rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-white to-[#FBF8FD]">
              <div>
                <label className={labelBase}>Terapeuta</label>
                <input
                  type="text"
                  value={`${currentUser?.nombres || ''} ${currentUser?.apellidos || ''}`.trim()}
                  readOnly
                  className={`${inputBase} border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed`}
                />
              </div>

              <div>
                <label className={labelBase}>
                  Tipo de Archivo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.tipoArchivoId}
                    onChange={(e) => {
                      setForm({ ...form, tipoArchivoId: e.target.value });
                      if (errors.tipoArchivoId) setErrors({ ...errors, tipoArchivoId: '' });
                    }}
                    disabled={loading}
                    className={`${inputBase} appearance-none cursor-pointer ${
                      errors.tipoArchivoId
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-[#7B1FA2]'
                    }`}
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposArchivo.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.tipoArchivoId && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" />
                    {errors.tipoArchivoId}
                  </p>
                )}
              </div>

              <div>
                <label className={labelBase}>
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => {
                    setForm({ ...form, descripcion: e.target.value });
                    if (errors.descripcion) setErrors({ ...errors, descripcion: '' });
                  }}
                  rows={3}
                  className={`${inputBase} resize-none ${
                    errors.descripcion
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-[#7B1FA2]'
                  }`}
                  placeholder="Describe el contenido del archivo..."
                />
                {errors.descripcion && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" />
                    {errors.descripcion}
                  </p>
                )}
              </div>

              <div>
                <label className={labelBase}>
                  Archivo <span className="text-red-500">*</span>
                </label>

                <div className="mb-3 bg-purple-50/60 border border-purple-100 rounded-2xl p-3.5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[#7B1FA2] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#2D0A4E] mb-1">Formatos recomendados con vista previa</p>
                      <div className="text-xs text-purple-700 space-y-1">
                        <p><strong>✓ PDF:</strong> Mejor opción para documentos (vista previa completa)</p>
                        <p><strong>✓ Imágenes:</strong> JPG, PNG, GIF, BMP, WEBP (vista previa con zoom)</p>
                        <p><strong>• Word/Excel/PowerPoint:</strong> Solo administradores pueden descargar</p>
                      </div>
                    </div>
                  </div>
                </div>

                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,.txt,.csv"
                  onChange={(e) => {
                    setForm({ ...form, archivo: e.target.files[0] });
                    if (errors.archivo) setErrors({ ...errors, archivo: '' });
                  }}
                />
                <label
                  htmlFor="file-upload"
                  className={`block border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    errors.archivo
                      ? 'border-red-300 bg-red-50/60'
                      : form.archivo
                      ? 'border-[#A3C644] bg-[#A3C644]/5'
                      : 'border-purple-200 bg-purple-50/40 hover:border-[#7B1FA2] hover:bg-purple-50'
                  }`}
                >
                  {form.archivo ? (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-3 shadow-sm ring-1 ring-[#A3C644]/30">
                        <CheckCircle className="w-7 h-7 text-[#8FB82D]" />
                      </div>
                      <p className="text-sm text-gray-800 font-bold break-words">{form.archivo.name}</p>
                      <div className="flex items-center justify-center gap-1.5 mt-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-gray-500 rounded-full text-[11px]">
                          <HardDrive className="w-3 h-3" />
                          {formatearTamano(form.archivo.size)}
                        </span>
                        <span className="px-2.5 py-1 bg-white text-[#7B1FA2] rounded-full text-[11px] font-semibold">
                          Cambiar archivo
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-3 shadow-sm ring-1 ring-purple-100">
                        <Upload className="w-7 h-7 text-[#7B1FA2]" />
                      </div>
                      <p className="text-sm text-gray-700 font-bold">Haz clic para seleccionar un archivo</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, imágenes, Office o texto · Máximo 10MB</p>
                    </>
                  )}
                </label>
                {errors.archivo && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" />
                    {errors.archivo}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white flex-shrink-0">
              <button
                onClick={handleCerrarModal}
                disabled={guardando}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-full transition-all disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="flex items-center gap-2 cx-glow bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
      , document.body)}

      {/* ===================== MODAL: VISTA PREVIA ===================== */}
      {openVistaPrevia && archivoVistaPrevia && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-purple-900/30 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden ring-1 ring-white/20">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                {(() => {
                  const { Icon, color, bg } = getFileStyle(archivoVistaPrevia.tipoMime);
                  return (
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 ring-1 ring-black/[0.03]`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                  );
                })()}
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-[#2D0A4E] truncate">
                    {archivoVistaPrevia.nombreOriginal}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="px-2.5 py-0.5 bg-purple-100/70 text-[#7B1FA2] rounded-full text-[11px] font-semibold">
                      {archivoVistaPrevia.tipoArchivo?.nombre || 'Sin tipo'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[11px]">
                      <HardDrive className="w-3 h-3" />
                      {formatearTamano(archivoVistaPrevia.tamano)}
                    </span>
                    {archivoVistaPrevia.fechaCreacion && (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[11px]">
                        <Calendar className="w-3 h-3" />
                        {formatearFecha(archivoVistaPrevia.fechaCreacion)}
                      </span>
                    )}
                    {!esAdministrador() && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-[11px] font-medium">
                        <Lock className="w-3 h-3" />
                        Solo visualización
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleCerrarVistaPrevia}
                className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-purple-50 hover:text-[#7B1FA2] rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div
              className="flex-1 overflow-auto p-6 relative bg-gradient-to-br from-[#F5F0FA] via-white to-[#F5F0FA]"
              style={{
                backgroundImage: 'radial-gradient(rgba(123,31,162,0.08) 1px, transparent 1px)',
                backgroundSize: '18px 18px'
              }}
            >
              {esImagen(archivoVistaPrevia.tipoMime) && (
                <div className="flex items-center justify-center h-full relative">
                  <img
                    src={previewUrl(archivoVistaPrevia)}
                    alt={archivoVistaPrevia.nombreOriginal}
                    className="max-w-full max-h-full object-contain rounded-3xl border-[10px] border-white shadow-2xl shadow-purple-900/20 ring-1 ring-purple-100 bg-white select-none"
                    onContextMenu={handleContextMenu}
                    onDragStart={handleDragStart}
                    style={{
                      userSelect: 'none',
                      pointerEvents: esAdministrador() ? 'auto' : 'none'
                    }}
                  />
                  {!esAdministrador() && (
                    <div className="absolute inset-0" onContextMenu={handleContextMenu} style={{ cursor: 'default' }} />
                  )}
                </div>
              )}

              {esPDF(archivoVistaPrevia.tipoMime) && (
                <>
                  {esAdministrador() ? (
                    <iframe
                      src={`${previewUrl(archivoVistaPrevia)}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                      className="w-full h-full rounded-2xl border-0 shadow-lg"
                      title={archivoVistaPrevia.nombreOriginal}
                      style={{ border: 'none' }}
                    />
                  ) : (
                    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg">
                      <div
                        ref={containerRef}
                        className="w-full h-full overflow-y-auto overflow-x-hidden"
                        style={{ backgroundColor: '#525659' }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleContextMenu(e);
                          return false;
                        }}
                      >
                        <div className="flex flex-col items-center py-16">
                          <Document
                            file={{
                              url: previewUrl(archivoVistaPrevia),
                              httpHeaders: {
                                Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`
                              }
                            }}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={(error) => console.error('Error cargando PDF:', error)}
                            loading={<div className="flex items-center justify-center py-12"><Spinner /></div>}
                            error={
                              <div className="flex items-center justify-center py-12">
                                <p className="text-red-300 text-sm">Error al cargar el PDF</p>
                              </div>
                            }
                          >
                            {numPages &&
                              Array.from(new Array(numPages), (el, index) => (
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

                      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur border border-gray-200 rounded-full shadow-lg z-[100]">
                        <div className="flex items-center gap-2 px-4 py-2">
                          <Lock className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-semibold text-gray-700">Vista protegida</span>
                          <div className="flex items-center gap-1 ml-2 border-l border-gray-200 pl-3">
                            <button
                              onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
                              className="p-1.5 text-gray-500 hover:text-[#7B1FA2] hover:bg-purple-50 rounded-full transition-colors"
                              title="Reducir zoom"
                            >
                              <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-semibold text-gray-700 min-w-[44px] text-center">
                              {Math.round(scale * 100)}%
                            </span>
                            <button
                              onClick={() => setScale((prev) => Math.min(3, prev + 0.1))}
                              className="p-1.5 text-gray-500 hover:text-[#7B1FA2] hover:bg-purple-50 rounded-full transition-colors"
                              title="Aumentar zoom"
                            >
                              <ZoomIn className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setScale(1.0)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-[#7B1FA2] bg-purple-50 hover:bg-purple-100 rounded-full transition-colors ml-1"
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

              {(esWord(archivoVistaPrevia.tipoMime) ||
                esExcel(archivoVistaPrevia.tipoMime) ||
                esPowerPoint(archivoVistaPrevia.tipoMime)) && (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-sm mb-4">
                    {(() => {
                      const { Icon, color } = getFileStyle(archivoVistaPrevia.tipoMime);
                      return <Icon className={`w-10 h-10 ${color}`} />;
                    })()}
                  </div>
                  <p className="text-lg font-extrabold text-[#2D0A4E] mb-1">
                    {esWord(archivoVistaPrevia.tipoMime) && 'Documento de Word'}
                    {esExcel(archivoVistaPrevia.tipoMime) && 'Hoja de Cálculo Excel'}
                    {esPowerPoint(archivoVistaPrevia.tipoMime) && 'Presentación PowerPoint'}
                  </p>
                  <p className="text-sm text-gray-500 mb-5 max-w-md">
                    Los archivos de Office requieren aplicaciones especiales para visualizarse correctamente.
                  </p>

                  <div className="bg-white rounded-2xl p-4 max-w-md w-full mb-5 text-left space-y-2">
                    <div>
                      <p className={labelBase + ' !mb-0.5'}>Nombre</p>
                      <p className="text-sm font-semibold text-gray-800 break-words">{archivoVistaPrevia.nombreOriginal}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className={labelBase + ' !mb-0.5'}>Tipo</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {esWord(archivoVistaPrevia.tipoMime) ? 'Microsoft Word'
                            : esExcel(archivoVistaPrevia.tipoMime) ? 'Microsoft Excel'
                            : 'Microsoft PowerPoint'}
                        </p>
                      </div>
                      <div>
                        <p className={labelBase + ' !mb-0.5'}>Tamaño</p>
                        <p className="text-sm font-semibold text-gray-800">{formatearTamano(archivoVistaPrevia.tamano)}</p>
                      </div>
                    </div>
                  </div>

                  {esAdministrador() ? (
                    <button
                      onClick={() => handleDescargarArchivo(archivoVistaPrevia)}
                      className="flex items-center gap-2 cx-glow bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg shadow-purple-500/30"
                    >
                      <Download className="w-5 h-5" />
                      Descargar y abrir con Office
                    </button>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 max-w-md flex items-start gap-3">
                      <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-amber-900 mb-1">Descarga restringida</p>
                        <p className="text-xs text-amber-700">
                          Los archivos de Office solo pueden ser descargados por administradores. Contacta con un
                          administrador si necesitas acceder a este archivo.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {esTexto(archivoVistaPrevia.tipoMime) && (
                <div className="relative w-full h-full">
                  <iframe
                    src={previewUrl(archivoVistaPrevia)}
                    className="w-full h-full rounded-2xl border-0 shadow-lg bg-white p-4"
                    title={archivoVistaPrevia.nombreOriginal}
                  />
                  {!esAdministrador() && (
                    <div
                      className="absolute inset-0 pointer-events-auto"
                      onContextMenu={handleContextMenu}
                      style={{ background: 'transparent' }}
                    />
                  )}
                </div>
              )}

              {!puedeVistaPrevia(archivoVistaPrevia) && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-sm mb-4">
                    <FileText className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-lg font-extrabold text-[#2D0A4E] mb-1">Vista previa no disponible</p>
                  <p className="text-sm text-gray-500 mb-4">Este tipo de archivo no se puede previsualizar</p>

                  {esAdministrador() ? (
                    <p className="text-xs text-gray-400">Puedes descargarlo para verlo en tu dispositivo</p>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 max-w-md flex items-start gap-3">
                      <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-amber-900 mb-1">Acceso restringido</p>
                        <p className="text-xs text-amber-700">
                          Este archivo no tiene vista previa disponible y solo los administradores pueden descargarlo.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-white flex-shrink-0">
              <div className="min-w-0 flex-1">
                {archivoVistaPrevia.descripcion && (
                  <p className="text-xs text-gray-500 line-clamp-2">{archivoVistaPrevia.descripcion}</p>
                )}
                {archivoVistaPrevia.terapeuta && (
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-medium">
                    <User className="w-3 h-3" />
                    Subido por {archivoVistaPrevia.terapeuta.nombres} {archivoVistaPrevia.terapeuta.apellidos}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCerrarVistaPrevia}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-full transition-all"
                >
                  <X className="w-4 h-4" />
                  Cerrar
                </button>
                {esAdministrador() && (
                  <button
                    onClick={() => handleDescargarArchivo(archivoVistaPrevia)}
                    className="flex items-center gap-2 cx-glow bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-purple-500/30"
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      , document.body)}

      {/* ===================== MODAL: CONFIRMAR ELIMINACIÓN ===================== */}
      {openConfirmacion && archivoAEliminar && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl shadow-purple-900/20 w-full max-w-md overflow-hidden ring-1 ring-white/20">
            <div className="p-6 text-center">
              <div className="mx-auto w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-extrabold text-[#2D0A4E] mb-1">Confirmar eliminación</h3>
              <p className="text-sm text-gray-500 mb-5">Esta acción no se puede deshacer</p>

              <div className="p-4 bg-[#F5F0FA] rounded-2xl text-left">
                <div className="flex items-start gap-3">
                  {(() => {
                    const { Icon, color, bg } = getFileStyle(archivoAEliminar.tipoMime);
                    return (
                      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{archivoAEliminar.nombreOriginal}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{archivoAEliminar.descripcion}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="px-2.5 py-1 bg-purple-100/70 text-[#7B1FA2] rounded-full text-[11px] font-semibold">
                        {archivoAEliminar.tipoArchivo?.nombre || 'Sin tipo'}
                      </span>
                      <span className="px-2.5 py-1 bg-white text-gray-500 rounded-full text-[11px]">
                        {formatearTamano(archivoAEliminar.tamano)}
                      </span>
                      {archivoAEliminar.terapeuta && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-medium">
                          <User className="w-3 h-3" />
                          {archivoAEliminar.terapeuta.nombres} {archivoAEliminar.terapeuta.apellidos}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-5">¿Estás seguro de que quieres eliminar este archivo?</p>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
              <button
                onClick={cancelarEliminacion}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button
                onClick={confirmarEliminacion}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-red-700 transition-all shadow-lg shadow-red-500/30"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default ArchivosDigitales;