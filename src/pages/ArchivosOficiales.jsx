import React, { useState, useEffect, useMemo } from 'react';
import {
  CloudUpload,
  FileText,
  X,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Trash2,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Copy,
  Calendar,
  User,
  Briefcase,
  FolderOpen,
  Upload,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileCheck,
  AlertTriangle,
  Grid3x3,
  List
} from 'lucide-react';
import { getPacientesAll } from '../services/pacienteService';
import { getTrabajadores } from '../services/trabajadorService';
import archivosOficialesService from '../services/archivosOficialesService';
import { getTiposDocumento } from '../services/tiposArchivoService';

const GestionArchivosOficiales = () => {
  const [tabValue, setTabValue] = useState(0);
  const [documentos, setDocumentos] = useState([]);
  const [documentosFiltrados, setDocumentosFiltrados] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [modalVer, setModalVer] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  // Cargar preferencia de vista desde localStorage
  const [viewMode, setViewMode] = useState(() => {
    const savedView = localStorage.getItem('archivosOficiales_viewMode');
    return savedView || 'grid'; // Por defecto 'grid'
  });

  // Guardar preferencia cuando cambie el viewMode
  useEffect(() => {
    localStorage.setItem('archivosOficiales_viewMode', viewMode);
  }, [viewMode]);

  // Estados formulario
  const [tipoDestinatario, setTipoDestinatario] = useState('paciente');
  const [formData, setFormData] = useState({
    pacienteId: '',
    trabajadorId: '',
    terapeutaId: '',
    tipoArchivoId: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVigencia: '',
    descripcion: '',
    codigoManual: '',
  });
  const [archivo, setArchivo] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [pacientes, setPacientes] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [terapeutas, setTerapeutas] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState(null);
  const [terapeutaSeleccionado, setTerapeutaSeleccionado] = useState(null);
  const [codigoGeneradoPreview, setCodigoGeneradoPreview] = useState('');
  const [loadingCodigoPreview, setLoadingCodigoPreview] = useState(false);
  const [dialogExito, setDialogExito] = useState(false);
  const [codigoGenerado, setCodigoGenerado] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tiposArchivo, setTiposArchivo] = useState([]);
  const [tiposArchivoCompletos, setTiposArchivoCompletos] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [errorFechaVigencia, setErrorFechaVigencia] = useState('');
  const [datosInicializados, setDatosInicializados] = useState(false);

  useEffect(() => {
    if (datosInicializados) return;
    
    const inicializar = async () => {
      await cargarDatosIniciales();
      await cargarTiposArchivo();
      setDatosInicializados(true);
    };
    inicializar();
  }, [datosInicializados]);

  useEffect(() => {
    if (tabValue === 0 && documentos.length === 0 && datosInicializados) {
      cargarDocumentos();
    }
  }, [tabValue, datosInicializados]);

  useEffect(() => {
    let filtered = [...documentos];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc => {
        const pacienteNombre = doc.paciente 
          ? `${doc.paciente.nombres} ${doc.paciente.apellido_paterno} ${doc.paciente.apellido_materno}`.toLowerCase()
          : '';
        const trabajadorNombre = doc.trabajador
          ? `${doc.trabajador.nombres} ${doc.trabajador.apellidos}`.toLowerCase()
          : '';
        
        return doc.codigoValidacion?.toLowerCase().includes(term) ||
              pacienteNombre.includes(term) ||
              trabajadorNombre.includes(term) ||
              doc.tipoArchivo?.nombre?.toLowerCase().includes(term) ||
              doc.nombreArchivo?.toLowerCase().includes(term);
      });
    }

    if (filtroTipo) {
      filtered = filtered.filter(doc => doc.tipoArchivo?.id === filtroTipo);
    }

    setDocumentosFiltrados(filtered);
  }, [searchTerm, filtroTipo, documentos]);

  const cargarDatosIniciales = async () => {
    try {
      setLoadingData(true);
      
      const resPacientes = await getPacientesAll();
      const pacientesData = resPacientes.data || resPacientes;
      setPacientes(pacientesData);

      const resTrabajadores = await getTrabajadores();
      const trabajadoresData = resTrabajadores.data || resTrabajadores;
      
      const trabajadoresFiltrados = Array.isArray(trabajadoresData)
        ? trabajadoresData.filter(t => t && typeof t === 'object' && t.nombres)
        : [];
      
      setTrabajadores(trabajadoresFiltrados);

      const terapeutasFiltrados = Array.isArray(trabajadoresData)
        ? trabajadoresData.filter(
            (t) => t && typeof t === 'object' && t.nombres && t.rol && t.rol.id === 4
          )
        : [];
       
      setTerapeutas(terapeutasFiltrados);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos iniciales');
    } finally {
      setLoadingData(false);
    }
  };

  const tiposArchivoFiltrados = useMemo(() => {
    return tiposArchivoCompletos.filter(tipo => 
      tipo.destinatario_tipo === tipoDestinatario || tipo.destinatario_tipo === 'ambos'
    );
  }, [tiposArchivoCompletos, tipoDestinatario]);

  const calcularFechaVigencia = (fechaEmision, vigenciaMeses) => {
    if (!vigenciaMeses || !fechaEmision) return '';
    
    const fecha = new Date(fechaEmision + 'T00:00:00');
    fecha.setMonth(fecha.getMonth() + vigenciaMeses);
    
    return fecha.toISOString().split('T')[0];
  };

  const cargarDocumentos = async () => {
    try {
      setLoadingDocs(true);
      const response = await archivosOficialesService.listarArchivos();
      const docs = response.data || response;
      setDocumentos(Array.isArray(docs) ? docs : []);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      setError('Error al cargar los documentos');
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleTipoArchivoChange = (e) => {
    const tipoId = e.target.value;
    const tipo = tiposArchivoFiltrados.find(t => t.id == tipoId);
    
    setTipoSeleccionado(tipo);
    
    const fechaVigenciaCalculada = tipo?.vigencia_meses 
      ? calcularFechaVigencia(formData.fechaEmision, tipo.vigencia_meses)
      : '';
    
    setFormData(prev => ({
      ...prev,
      tipoArchivoId: tipoId,
      fechaVigencia: fechaVigenciaCalculada,
    }));
    
    setError('');
  };

  const cargarTiposArchivo = async () => {
    try {
      setLoadingTipos(true);
      const response = await getTiposDocumento();
      const tipos = response || [];
      
      setTiposArchivo(tipos);
      setTiposArchivoCompletos(tipos);
    } catch (error) {
      console.error('Error al cargar tipos de archivo:', error);
      setError('Error al cargar los tipos de documento');
    } finally {
      setLoadingTipos(false);
    }
  };

  const handleFechaEmisionChange = (e) => {
    const nuevaFechaEmision = e.target.value;
    
    const fechaVigenciaCalculada = tipoSeleccionado?.vigencia_meses
      ? calcularFechaVigencia(nuevaFechaEmision, tipoSeleccionado.vigencia_meses)
      : formData.fechaVigencia;
    
    setFormData(prev => ({
      ...prev,
      fechaEmision: nuevaFechaEmision,
      fechaVigencia: fechaVigenciaCalculada,
    }));
  };

  const generarCodigoPreview = async () => {
    try {
      setLoadingCodigoPreview(true);
      setError('');
      
      const response = await archivosOficialesService.generarCodigoPreview();
      const codigo = response.data?.codigo || response.codigo;
      
      setCodigoGeneradoPreview(codigo);
      setFormData(prev => ({ ...prev, codigoManual: codigo }));
      
      setSuccess('Código generado. Añádalo al documento antes de subirlo.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error al generar código:', error);
      setError('Error al generar código preview');
    } finally {
      setLoadingCodigoPreview(false);
    }
  };

  const handleMenuOpen = (event, documento) => {
    setMenuAnchor(event.currentTarget);
    setDocumentoSeleccionado(documento);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleVerDocumento = () => {
    setModalVer(documentoSeleccionado);
    handleMenuClose();
  };

  const handleDescargar = async () => {
    try {
      console.log('Descargando archivo con ID:', documentoSeleccionado.id);
      await archivosOficialesService.descargarArchivo(documentoSeleccionado.id);
      setSuccess('Archivo descargado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error completo al descargar:', error);
      setError(`Error al descargar el archivo: ${error.message || 'Error desconocido'}`);
    }
    handleMenuClose();
  };

  const handleVisualizar = async () => {
    try {
      await archivosOficialesService.visualizarArchivo(documentoSeleccionado.id);
      handleMenuClose();
    } catch (error) {
      console.error('Error al visualizar:', error);
      setError('Error al visualizar el archivo');
      handleMenuClose();
    }
  };

  const handleEliminarClick = () => {
    setModalEliminar(documentoSeleccionado);
    handleMenuClose();
  };

  const handleEliminarConfirmar = async () => {
    try {
      await archivosOficialesService.eliminarArchivo(documentoSeleccionado.id);
      setSuccess('Documento eliminado correctamente');
      setTimeout(() => setSuccess(''), 3000);
      
      if (tabValue === 0) {
        cargarDocumentos();
      }
      
      setModalEliminar(null);
      setDocumentoSeleccionado(null);
    } catch (error) {
      setError('Error al eliminar el documento');
      setModalEliminar(null);
    }
  };

  const handleTipoDestinatarioChange = (nuevoTipo) => {
    setTipoDestinatario(nuevoTipo);
    
    if (nuevoTipo === 'paciente') {
      setTrabajadorSeleccionado(null);
      setFormData(prev => ({ ...prev, trabajadorId: '', pacienteId: '' }));
    } else {
      setPacienteSeleccionado(null);
      setFormData(prev => ({ ...prev, pacienteId: '', trabajadorId: '' }));
    }
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newFormData = { ...prev, [name]: value };
      
      if (name === 'fechaEmision' || name === 'fechaVigencia') {
        validarFechas(
          name === 'fechaEmision' ? value : newFormData.fechaEmision,
          name === 'fechaVigencia' ? value : newFormData.fechaVigencia
        );
      }
      
      return newFormData;
    });
    setError('');
  };

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const tiposPermitidos = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'image/jpeg',
        'image/png',
      ];

      if (!tiposPermitidos.includes(file.type)) {
        setError('Solo se permiten archivos PDF, Word (.doc, .docx), JPG y PNG');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo no debe superar los 10 MB');
        return;
      }

      setArchivo(file);
      setError('');
    }
  };

  const handleRemoverArchivo = () => {
    setArchivo(null);
    const input = document.getElementById('file-upload');
    if (input) input.value = '';
  };

  const validarFormulario = () => {
    if (!formData.pacienteId && !formData.trabajadorId) {
      setError('Debe seleccionar un paciente o un trabajador');
      return false;
    }
    if (formData.pacienteId && formData.trabajadorId) {
      setError('No puede seleccionar paciente y trabajador al mismo tiempo');
      return false;
    }
    
    if (tipoDestinatario === 'paciente' && !formData.terapeutaId) {
      setError('Debe seleccionar el terapeuta responsable');
      return false;
    }
    if (!formData.tipoArchivoId) {
      setError('Debe seleccionar el tipo de archivo');
      return false;
    }
    if (!archivo) {
      setError('Debe seleccionar un archivo');
      return false;
    }
    if (!formData.fechaEmision) {
      setError('Debe indicar la fecha de emisión');
      return false;
    }
    if (!validarFechas(formData.fechaEmision, formData.fechaVigencia)) {
      setErrorFechaVigencia('La fecha de vigencia no puede ser anterior a la fecha de emisión');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;
    
    try {
      setLoadingForm(true);
      setError('');
      
      const resultado = await archivosOficialesService.subirArchivo(archivo, formData);
      
      if (resultado.success) {
        setCodigoGenerado(resultado.data);
        setDialogExito(true);
        
        setFormData({
          pacienteId: '',
          trabajadorId: '',
          terapeutaId: '',
          tipoArchivoId: '',
          fechaEmision: new Date().toISOString().split('T')[0],
          fechaVigencia: '',
          descripcion: '',
          codigoManual: '',
        });
        setPacienteSeleccionado(null);
        setTrabajadorSeleccionado(null);
        setTerapeutaSeleccionado(null);
        setArchivo(null);
        setCodigoGeneradoPreview('');
        setTipoDestinatario('paciente');
        setTipoSeleccionado(null);
        
        const input = document.getElementById('file-upload');
        if (input) input.value = '';
      }
    } catch (err) {
      console.error('Error al subir archivo:', err);
      setError(err.message || 'Error al subir el archivo. Intente nuevamente.');
    } finally {
      setLoadingForm(false);
    }
  };

  const copiarCodigo = () => {
    if (codigoGenerado?.codigoValidacion) {
      navigator.clipboard.writeText(codigoGenerado.codigoValidacion);
    }
  };

  const validarFechas = (fechaEmision, fechaVigencia) => {
    if (fechaVigencia && fechaEmision) {
      const fechaEmisionDate = new Date(fechaEmision);
      const fechaVigenciaDate = new Date(fechaVigencia);
      
      if (fechaVigenciaDate < fechaEmisionDate) {
        setErrorFechaVigencia('La fecha de vigencia no puede ser anterior a la fecha de emisión');
        return false;
      }
    }
    setErrorFechaVigencia('');
    return true;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const fechaSolo = fecha.split('T')[0].split(' ')[0];
    const [año, mes, dia] = fechaSolo.split('-');
    const fechaCorrecta = new Date(Date.UTC(parseInt(año), parseInt(mes) - 1, parseInt(dia)));
    
    return fechaCorrecta.toLocaleDateString('es-PE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  const obtenerNombreDestinatario = (doc) => {
    if (doc.paciente) {
      return `${doc.paciente.nombres} ${doc.paciente.apellido_paterno} ${doc.paciente.apellido_materno}`;
    }
    if (doc.trabajador) {
      return `${doc.trabajador.nombres} ${doc.trabajador.apellidos}`;
    }
    return '-';
  };

  const getInitials = (nombre, apellido) => {
    return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
  };

  const paginatedDocumentos = documentosFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(documentosFiltrados.length / rowsPerPage);

  // Calcular documentos del mes calendario actual (ej: todo noviembre, todo diciembre)
  const documentosEsteMes = useMemo(() => {
    const ahora = new Date();
    const mesActual = ahora.getMonth(); // 0-11 (diciembre = 11)
    const añoActual = ahora.getFullYear();

    return documentos.filter(doc => {
      if (!doc.fechaEmision) return false;

      // Crear fecha en UTC para evitar problemas de zona horaria
      const fechaStr = doc.fechaEmision.split('T')[0]; // "2024-12-01"
      const [año, mes, dia] = fechaStr.split('-');
      const fechaDoc = new Date(Date.UTC(parseInt(año), parseInt(mes) - 1, parseInt(dia)));

      const mesDoc = fechaDoc.getUTCMonth();
      const añoDoc = fechaDoc.getUTCFullYear();

      return mesDoc === mesActual && añoDoc === añoActual;
    }).length;
  }, [documentos]);

  // Calcular documentos activos (estado 'Activo' o sin estado definido)
  const documentosActivos = useMemo(() => {
    return documentos.filter(doc => !doc.estado || doc.estado === 'Activo').length;
  }, [documentos]);

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pt-24 lg:pt-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
           
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Archivos Oficiales</h1>
              <p className="text-gray-600">Sistema de gestión documental para pacientes y trabajadores</p>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{documentos.length}</div>
                  <div className="text-xs text-gray-600 font-medium">Total Documentos</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{documentosActivos}</div>
                  <div className="text-xs text-gray-600 font-medium">Activos</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{documentosEsteMes}</div>
                  <div className="text-xs text-gray-600 font-medium">Este Mes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-600 hover:bg-red-100 p-1 rounded-lg transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">{success}</p>
            </div>
            <button onClick={() => setSuccess('')} className="text-green-600 hover:bg-green-100 p-1 rounded-lg transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex">
              <button
                onClick={() => setTabValue(0)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all relative ${
                  tabValue === 0
                    ? 'text-[#7B1FA2] bg-white'
                    : 'text-gray-600 hover:text-[#7B1FA2] hover:bg-gray-100'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                Mis Documentos
                {tabValue === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0]"></div>
                )}
              </button>
              <button
                onClick={() => setTabValue(1)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all relative ${
                  tabValue === 1
                    ? 'text-[#7B1FA2] bg-white'
                    : 'text-gray-600 hover:text-[#7B1FA2] hover:bg-gray-100'
                }`}
              >
                <CloudUpload className="w-4 h-4" />
                Subir Nuevo
                {tabValue === 1 && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0]"></div>
                )}
              </button>
            </div>
          </div>

          {/* TAB 0: DASHBOARD */}
          {tabValue === 0 && (
            <div className="p-6">
              {/* Filtros y Vista */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-[#7B1FA2]" />
                    <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Botones de cambio de vista */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                          viewMode === 'grid'
                            ? 'bg-white text-[#7B1FA2] shadow-sm'
                            : 'text-gray-600 hover:text-[#7B1FA2]'
                        }`}
                        title="Vista de tarjetas"
                      >
                        <Grid3x3 className="w-4 h-4" />
                        Tarjetas
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                          viewMode === 'list'
                            ? 'bg-white text-[#7B1FA2] shadow-sm'
                            : 'text-gray-600 hover:text-[#7B1FA2]'
                        }`}
                        title="Vista de lista"
                      >
                        <List className="w-4 h-4" />
                        Lista
                      </button>
                    </div>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="text-sm font-medium text-[#7B1FA2] hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-all"
                    >
                      {showFilters ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                </div>

                {showFilters && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar por código, nombre..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all"
                        />
                      </div>

                      <select
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Todos los tipos</option>
                        {tiposArchivo.map((tipo) => (
                          <option key={tipo.id} value={tipo.id}>
                            {tipo.nombre}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setFiltroTipo('');
                        }}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all"
                      >
                        <X className="w-4 h-4" />
                        Limpiar
                      </button>
                    </div>

                    <button
                      onClick={() => { cargarDocumentos(); }}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Actualizar
                    </button>
                  </>
                )}
              </div>

              {/* Lista de documentos */}
              {loadingDocs ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando documentos...</p>
                  </div>
                </div>
              ) : documentosFiltrados.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-1">No hay documentos</p>
                    <p className="text-gray-600">
                      {searchTerm || filtroTipo ? 'Intenta ajustar los filtros' : 'Sube tu primer documento oficial'}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Vista de Tarjetas */}
                  {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {paginatedDocumentos.map((doc) => {
                      const isPaciente = doc.paciente;

                      return (
                        <div
                          key={doc.id}
                          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all group"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4 gap-2">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isPaciente ? 'bg-blue-100' : 'bg-amber-100'
                              }`}>
                                {isPaciente ? (
                                  <User className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <Briefcase className="w-4 h-4 text-amber-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 break-words leading-tight">
                                  {obtenerNombreDestinatario(doc)}
                                </p>
                                <p className={`text-xs font-medium mt-1 ${isPaciente ? 'text-blue-600' : 'text-amber-600'}`}>
                                  {isPaciente ? 'Paciente' : 'Trabajador'}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={(e) => handleMenuOpen(e, doc)}
                              className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Código */}
                          <div className={`rounded-lg p-3 mb-4 ${
                            isPaciente
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                              : 'bg-gradient-to-r from-amber-500 to-amber-600'
                          }`}>
                            <p className="text-xs text-white/80 font-medium mb-1">CÓDIGO</p>
                            <p className="text-sm font-mono font-bold text-white">{doc.codigoValidacion}</p>
                          </div>

                          {/* Detalles */}
                          <div className="space-y-2.5 mb-4">
                            <div className="flex items-center gap-2">
                              <FileText className={`w-4 h-4 flex-shrink-0 ${
                                isPaciente ? 'text-blue-500' : 'text-amber-500'
                              }`} />
                              <span className="text-xs text-gray-600 truncate">{doc.tipoArchivo?.nombre}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className={`w-4 h-4 flex-shrink-0 ${
                                isPaciente ? 'text-blue-500' : 'text-amber-500'
                              }`} />
                              <span className="text-xs text-gray-600">{formatearFecha(doc.fechaEmision)}</span>
                            </div>
                            {isPaciente && doc.terapeuta && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <span className="text-xs text-gray-600 truncate">
                                  {doc.terapeuta.nombres} {doc.terapeuta.apellidos}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                              doc.estado === 'Activo'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {doc.estado === 'Activo' ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <AlertCircle className="w-3 h-3" />
                              )}
                              {doc.estado || 'Activo'}
                            </div>
                            <button
                              onClick={() => setModalVer(doc)}
                              className="text-xs font-medium text-[#7B1FA2] hover:text-[#9C27B0] transition-colors"
                            >
                              Ver detalles →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  )}

                  {/* Vista de Lista */}
                  {viewMode === 'list' && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Destinatario
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Código
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Tipo de Documento
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Fecha Emisión
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Terapeuta
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Estado
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {paginatedDocumentos.map((doc) => {
                              const isPaciente = doc.paciente;

                              return (
                                <tr key={doc.id} className="hover:bg-gray-50 transition-colors group">
                                  <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        isPaciente ? 'bg-blue-100' : 'bg-amber-100'
                                      }`}>
                                        {isPaciente ? (
                                          <User className="w-5 h-5 text-blue-600" />
                                        ) : (
                                          <Briefcase className="w-5 h-5 text-amber-600" />
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 break-words">
                                          {obtenerNombreDestinatario(doc)}
                                        </p>
                                        <p className={`text-xs font-medium ${isPaciente ? 'text-blue-600' : 'text-amber-600'}`}>
                                          {isPaciente ? 'Paciente' : 'Trabajador'}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className={`inline-block px-3 py-1.5 rounded-lg ${
                                      isPaciente
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                                        : 'bg-gradient-to-r from-amber-500 to-amber-600'
                                    }`}>
                                      <p className="text-xs font-mono font-bold text-white">
                                        {doc.codigoValidacion}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                      <FileText className={`w-4 h-4 flex-shrink-0 ${
                                        isPaciente ? 'text-blue-500' : 'text-amber-500'
                                      }`} />
                                      <span className="text-sm text-gray-900 font-medium">
                                        {doc.tipoArchivo?.nombre}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                      <Calendar className={`w-4 h-4 flex-shrink-0 ${
                                        isPaciente ? 'text-blue-500' : 'text-amber-500'
                                      }`} />
                                      <span className="text-sm text-gray-700">
                                        {formatearFecha(doc.fechaEmision)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    {isPaciente && doc.terapeuta ? (
                                      <span className="text-sm text-gray-700">
                                        {doc.terapeuta.nombres} {doc.terapeuta.apellidos}
                                      </span>
                                    ) : (
                                      <span className="text-sm text-gray-400">-</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                                      doc.estado === 'Activo'
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {doc.estado === 'Activo' ? (
                                        <CheckCircle2 className="w-3 h-3" />
                                      ) : (
                                        <AlertCircle className="w-3 h-3" />
                                      )}
                                      {doc.estado || 'Activo'}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => setModalVer(doc)}
                                        className="p-2 text-[#7B1FA2] hover:bg-purple-50 rounded-lg transition-all"
                                        title="Ver detalles"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={(e) => handleMenuOpen(e, doc)}
                                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="Más opciones"
                                      >
                                        <MoreVertical className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Paginación */}
                  {documentosFiltrados.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                          Mostrando <span className="font-semibold text-gray-900">{page * rowsPerPage + 1}</span> a{' '}
                          <span className="font-semibold text-gray-900">
                            {Math.min((page + 1) * rowsPerPage, documentosFiltrados.length)}
                          </span>{' '}
                          de <span className="font-semibold text-gray-900">{documentosFiltrados.length}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-2 w-full sm:w-auto">
                          <select
                            value={rowsPerPage}
                            onChange={(e) => {
                              setRowsPerPage(parseInt(e.target.value));
                              setPage(0);
                            }}
                            className="w-full sm:w-auto px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] cursor-pointer"
                          >
                            <option value={6}>6 por página</option>
                            <option value={12}>12 por página</option>
                            <option value={24}>24 por página</option>
                          </select>

                          <div className="flex gap-1">
                            <button
                              onClick={() => setPage(0)}
                              disabled={page === 0}
                              className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>

                            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 3) {
                                pageNum = i;
                              } else if (page < 2) {
                                pageNum = i;
                              } else if (page > totalPages - 3) {
                                pageNum = totalPages - 3 + i;
                              } else {
                                pageNum = page - 1 + i;
                              }

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setPage(pageNum)}
                                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                    page === pageNum
                                      ? 'bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white'
                                      : 'hover:bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {pageNum + 1}
                                </button>
                              );
                            })}

                            <button
                              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                              disabled={page >= totalPages - 1}
                              className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 1: FORMULARIO */}
          {tabValue === 1 && (
            <div className="p-6">
              <div className="space-y-6">
                {/* Paso 1: Generar Código */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Paso 1: Generar Código de Validación</h3>
                      <p className="text-sm text-gray-600">Genera el código primero, añádelo al documento, luego sube el archivo</p>
                    </div>
                  </div>

                  {!codigoGeneradoPreview ? (
                    <button
                      onClick={generarCodigoPreview}
                      disabled={loadingCodigoPreview}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {loadingCodigoPreview ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Generando...
                        </>
                      ) : (
                        <>
                          <FileCheck className="w-5 h-5" />
                          Generar Código Único
                        </>
                      )}
                    </button>
                  ) : (
                    <div>
                      <div className="bg-white border-2 border-green-500 rounded-xl p-5 mb-4">
                        <p className="text-xs font-bold text-green-700 uppercase mb-2 tracking-wide">✓ Código Generado</p>
                        <div className="flex items-center gap-3">
                          <p className="text-2xl font-mono font-bold text-green-600 flex-1">{codigoGeneradoPreview}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(codigoGeneradoPreview);
                              setSuccess('Código copiado');
                              setTimeout(() => setSuccess(''), 3000);
                            }}
                            className="p-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="bg-amber-100 border border-amber-300 rounded-xl p-3 mb-3">
                        <p className="text-xs font-semibold text-amber-900">
                          <strong>IMPORTANTE:</strong> Añada este código al documento antes de subirlo.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setCodigoGeneradoPreview('');
                          setFormData(prev => ({ ...prev, codigoManual: '' }));
                        }}
                        className="text-sm font-medium text-amber-700 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Generar Otro Código
                      </button>
                    </div>
                  )}
                </div>

                {/* Paso 2: Tipo de destinatario */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Paso 2: Seleccionar Destinatario</h3>
                  
                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={() => handleTipoDestinatarioChange('paciente')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                        tipoDestinatario === 'paciente'
                          ? 'bg-blue-50 border-2 border-blue-500 text-blue-700'
                          : 'bg-gray-50 border-2 border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <User className="w-5 h-5" />
                      Paciente
                    </button>
                    <button
                      onClick={() => handleTipoDestinatarioChange('trabajador')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                        tipoDestinatario === 'trabajador'
                          ? 'bg-amber-50 border-2 border-amber-500 text-amber-700'
                          : 'bg-gray-50 border-2 border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Briefcase className="w-5 h-5" />
                      Trabajador
                    </button>
                  </div>

                  {/* Selector de persona */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {tipoDestinatario === 'paciente' ? 'Seleccionar Paciente' : 'Seleccionar Trabajador'}
                    </label>
                    <select
                      value={tipoDestinatario === 'paciente' ? formData.pacienteId : formData.trabajadorId}
                      onChange={(e) => {
                        if (tipoDestinatario === 'paciente') {
                          const paciente = pacientes.find(p => p.id == e.target.value);
                          setPacienteSeleccionado(paciente);
                          setFormData(prev => ({ ...prev, pacienteId: e.target.value, trabajadorId: '' }));
                        } else {
                          const trabajador = trabajadores.find(t => t.id == e.target.value);
                          setTrabajadorSeleccionado(trabajador);
                          setFormData(prev => ({ ...prev, trabajadorId: e.target.value, pacienteId: '' }));
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Seleccionar...</option>
                      {tipoDestinatario === 'paciente'
                        ? pacientes.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.nombres} {p.apellido_paterno} {p.apellido_materno} - {p.numero_documento}
                            </option>
                          ))
                        : trabajadores.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.nombres} {t.apellidos} {t.dni ? `- ${t.dni}` : ''}
                            </option>
                          ))
                      }
                    </select>
                  </div>

                  {/* Terapeuta (solo para pacientes) */}
                  {tipoDestinatario === 'paciente' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Terapeuta Responsable
                      </label>
                      <select
                        value={formData.terapeutaId}
                        onChange={(e) => {
                          const terapeuta = terapeutas.find(t => t.id == e.target.value);
                          setTerapeutaSeleccionado(terapeuta);
                          setFormData(prev => ({ ...prev, terapeutaId: e.target.value }));
                        }}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Seleccionar terapeuta...</option>
                        {terapeutas.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.nombres} {t.apellidos} {t.dni ? `- ${t.dni}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Paso 3: Detalles del documento */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Paso 3: Detalles del Documento</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tipo de Documento
                      </label>
                      <select
                        value={formData.tipoArchivoId}
                        onChange={handleTipoArchivoChange}
                        disabled={loadingTipos}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Seleccionar tipo...</option>
                        {loadingTipos ? (
                          <option disabled>Cargando...</option>
                        ) : (
                          tiposArchivoFiltrados.map((tipo) => (
                            <option key={tipo.id} value={tipo.id}>
                              {tipo.nombre}
                              {tipo.vigencia_meses ? ` (${tipo.vigencia_meses} meses)` : ''}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Fecha de Emisión
                      </label>
                      <input
                        type="date"
                        value={formData.fechaEmision}
                        onChange={handleFechaEmisionChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {tipoSeleccionado && (
                    <div className={`p-3 rounded-xl border mb-4 ${
                      tipoSeleccionado.vigencia_meses
                        ? 'bg-green-50 border-green-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <p className="text-xs font-semibold">
                        {tipoSeleccionado.vigencia_meses ? (
                          <>
                            ✓ Vigencia: {tipoSeleccionado.vigencia_meses} {tipoSeleccionado.vigencia_meses === 1 ? 'mes' : 'meses'}
                            {formData.fechaVigencia && (
                              <span className="block mt-1 text-gray-700">
                                Vence el: <strong>{formatearFecha(formData.fechaVigencia)}</strong>
                              </span>
                            )}
                          </>
                        ) : (
                          '∞ Este documento no tiene fecha de vencimiento'
                        )}
                      </p>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fecha de Vigencia <span className="text-gray-400 font-normal">(Opcional)</span>
                    </label>
                    <input
                      type="date"
                      name="fechaVigencia"
                      value={formData.fechaVigencia}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        errorFechaVigencia
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-gray-200 focus:ring-[#A3C644] focus:border-transparent'
                      }`}
                    />
                    {errorFechaVigencia && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errorFechaVigencia}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descripción <span className="text-gray-400 font-normal">(Opcional)</span>
                    </label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Detalles adicionales sobre el documento..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Paso 4: Subir archivo */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Paso 4: Subir Archivo</h3>
                  
                  {!archivo ? (
                    <div
                      onClick={() => document.getElementById('file-upload').click()}
                      className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-[#7B1FA2] hover:bg-purple-50 transition-all cursor-pointer group"
                    >
                      <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all">
                        <CloudUpload className="w-8 h-8 text-[#7B1FA2]" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900 mb-1">Haz clic para seleccionar</p>
                      <p className="text-sm text-gray-600 mb-3">o arrastra y suelta aquí</p>
                      <p className="text-xs text-gray-500">PDF, Word, JPG, PNG - Máx. 10MB</p>
                      <input
                        id="file-upload"
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleArchivoChange}
                      />
                    </div>
                  ) : (
                    <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileCheck className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-green-900 truncate">{archivo.name}</p>
                        <p className="text-xs text-green-700">{(archivo.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        onClick={handleRemoverArchivo}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Botón de envío */}
                <button
                  onClick={handleSubmit}
                  disabled={loadingForm}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingForm ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Subiendo archivo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Subir Archivo Oficial
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Ver Documento */}
      {modalVer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] p-6 flex items-center justify-between sticky top-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold">
                  {getInitials(
                    modalVer.paciente?.nombres || modalVer.trabajador?.nombres,
                    modalVer.paciente?.apellido_paterno || modalVer.trabajador?.apellidos
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{obtenerNombreDestinatario(modalVer)}</h2>
                  <p className="text-white/80 text-sm">Detalles del Documento</p>
                </div>
              </div>
              <button onClick={() => setModalVer(null)} className="text-white hover:bg-white/20 p-2 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Código de validación */}
              <div className="bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] rounded-xl p-5">
                <p className="text-xs text-white/70 font-bold uppercase mb-2 tracking-wide">Código de Validación</p>
                <p className="text-3xl font-mono font-bold text-white">{modalVer.codigoValidacion}</p>
              </div>

              {/* Información */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Destinatario</p>
                  <div className="flex items-center gap-2">
                    {modalVer.paciente ? (
                      <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-amber-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{obtenerNombreDestinatario(modalVer)}</p>
                      <p className="text-xs text-gray-500">{modalVer.paciente ? 'Paciente' : 'Trabajador'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Terapeuta</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {modalVer.terapeuta?.nombres} {modalVer.terapeuta?.apellidos}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Documento</p>
                  <p className="text-sm font-semibold text-gray-900">{modalVer.tipoArchivo?.nombre}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Estado</p>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    modalVer.estado === 'Activo'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {modalVer.estado === 'Activo' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    {modalVer.estado || 'Activo'}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Fecha de Emisión</p>
                  <p className="text-sm font-semibold text-gray-900">{formatearFecha(modalVer.fechaEmision)}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Fecha de Vigencia</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatearFecha(modalVer.fechaVigencia) !== '-' ? formatearFecha(modalVer.fechaVigencia) : 'Sin vigencia'}
                  </p>
                </div>
              </div>

              {modalVer.nombreArchivo && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Archivo</p>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#7B1FA2]" />
                    <p className="text-sm font-semibold text-gray-900">{modalVer.nombreArchivo}</p>
                  </div>
                </div>
              )}

              {modalVer.descripcion && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Descripción</p>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-700">{modalVer.descripcion}</p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs text-blue-900">
                  Este documento puede validarse públicamente en: <br />
                  <strong>www.crecemos.com.pe/validar</strong>
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 p-4 flex gap-3 bg-gray-50">
              <button
                onClick={async () => {
                  try {
                    await archivosOficialesService.descargarArchivo(modalVer.id);
                    setSuccess('Archivo descargado correctamente');
                    setTimeout(() => setSuccess(''), 3000);
                  } catch (error) {
                    console.error('Error al descargar:', error);
                    setError('Error al descargar el archivo');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all"
              >
                <Download className="w-4 h-4" />
                Descargar
              </button>
              <button
                onClick={async () => {
                  try {
                    await archivosOficialesService.visualizarArchivo(modalVer.id);
                  } catch (error) {
                    console.error('Error al visualizar:', error);
                    setError('Error al visualizar el archivo');
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all"
              >
                <Eye className="w-4 h-4" />
                Abrir Archivo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
            <div className="bg-red-50 border-b-2 border-red-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-red-900">Confirmar Eliminación</h2>
                  <p className="text-sm text-red-700">Esta acción no se puede deshacer</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-900 font-medium mb-4">¿Estás seguro de que deseas eliminar la postulación de:</p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center text-white font-bold">
                    {getInitials(
                      modalEliminar.paciente?.nombres || modalEliminar.trabajador?.nombres,
                      modalEliminar.paciente?.apellido_paterno || modalEliminar.trabajador?.apellidos
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{obtenerNombreDestinatario(modalEliminar)}</p>
                    <p className="text-xs text-gray-600">{modalEliminar.paciente ? 'Paciente' : 'Trabajador'}</p>
                  </div>
                </div>
                
                <div className="space-y-2 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Código:</span>
                    <span className="font-mono font-semibold text-gray-900">{modalEliminar.codigoValidacion}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium text-gray-900">{modalEliminar.tipoArchivo?.nombre}</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
                <div className="flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900">Se eliminará toda la información del documento, incluyendo el archivo.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setModalEliminar(null)}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEliminarConfirmar}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium text-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Éxito */}
      {dialogExito && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2"></div>
            
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Éxito!</h2>
              <p className="text-gray-600 mb-6">Archivo subido correctamente</p>

              <div className="bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] rounded-xl p-5 mb-4">
                <p className="text-xs text-white/70 font-bold uppercase mb-2">Código de Validación</p>
                <p className="text-2xl font-mono font-bold text-white">{codigoGenerado?.codigoValidacion}</p>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(codigoGenerado?.codigoValidacion);
                  setSuccess('Código copiado');
                  setTimeout(() => setSuccess(''), 3000);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-all mx-auto mb-4"
              >
                <Copy className="w-4 h-4" />
                Copiar Código
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6">
                <p className="text-xs text-blue-900">
                  Este código puede validarse públicamente en: <br />
                  <strong>www.crecemos.com.pe/validar</strong>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDialogExito(false);
                    setCodigoGenerado(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all"
                >
                  Subir Otro
                </button>
                <button
                  onClick={async () => {
                    setDialogExito(false);
                    setCodigoGenerado(null);
                    setTabValue(0);
                    // Recargar documentos
                    await cargarDocumentos();
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all"
                >
                  Ver Documentos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu contextual */}
      {menuAnchor && (
        <div className="fixed inset-0 z-40" onClick={handleMenuClose}>
          <div
            className="absolute bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-[180px]"
            style={{
              top: menuAnchor.getBoundingClientRect().bottom + 8,
              left: menuAnchor.getBoundingClientRect().left,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleVerDocumento}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              <Eye className="w-4 h-4 text-gray-500" />
              Ver Detalles
            </button>
            <button
              onClick={handleVisualizar}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              <FileText className="w-4 h-4 text-gray-500" />
              Abrir Archivo
            </button>
            <button
              onClick={handleDescargar}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              <Download className="w-4 h-4 text-gray-500" />
              Descargar
            </button>
            <div className="border-t border-gray-200 my-1"></div>
            <button
              onClick={handleEliminarClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionArchivosOficiales;