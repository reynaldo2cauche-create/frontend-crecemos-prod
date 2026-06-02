import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import {
  PlayCircle,
  Trophy,
  Users,
  X,
  Plus,
  Trash2,
  Search,
  Save,
  FolderOpen,
  Loader,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Download,
  Filter,
  Calendar,
  XCircle,
} from 'lucide-react';
import Ruleta from './Ruleta';
import PalancaCasino from './PalancaCasino';
import {
  crearSorteoManual,
  obtenerSorteosEnPreparacion,
  agregarParticipante,
  obtenerParticipantes,
  eliminarParticipante,
  finalizarSorteoManual,
  obtenerDetalle,
  descargarArchivoPDF,
} from '../../services/sorteoService';
import { buscarPacientes } from '../../services/pacienteService';

const GestionSorteoManual = () => {
  // ==================== ESTADOS ====================
  const [vista, setVista] = useState('lista'); // 'lista', 'preparacion', 'sorteo'

  // Estados de lista de sorteos
  const [sorteosEnPreparacion, setSorteosEnPreparacion] = useState([]);
  const [cargandoSorteos, setCargandoSorteos] = useState(false);

  // Estados de filtros
  const [busquedaSorteo, setBusquedaSorteo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos'); // 'todos', 'preparacion', 'finalizado'
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 9;

  // Estados del sorteo actual
  const [sorteoActual, setSorteoActual] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [ganadoresGuardados, setGanadoresGuardados] = useState([]);
  const [cargandoParticipantes, setCargandoParticipantes] = useState(false);
  const [descargandoPDF, setDescargandoPDF] = useState(false);

  // Estados de creación
  const [nombreSorteo, setNombreSorteo] = useState('');
  const [descripcionSorteo, setDescripcionSorteo] = useState('');
  const [creandoSorteo, setCreandoSorteo] = useState(false);

  // Estados de búsqueda
  const [busquedaQuery, setBusquedaQuery] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Estados de sorteo (ruleta)
  const [ganadores, setGanadores] = useState([]);
  const [cantidadGanadores, setCantidadGanadores] = useState(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sorteoIniciado, setSorteoIniciado] = useState(false);
  const [ganadoresRevelados, setGanadoresRevelados] = useState(0);
  const [eliminandoGanador, setEliminandoGanador] = useState(null);
  const [ganadoresEliminados, setGanadoresEliminados] = useState([]);
  const [guardandoResultados, setGuardandoResultados] = useState(false);
  const [resultadosGuardados, setResultadosGuardados] = useState(false);

  // Snackbar
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // ==================== EFECTOS ====================

  useEffect(() => {
    if (vista === 'lista') {
      cargarSorteosEnPreparacion();
    }
  }, [vista]);

  // Búsqueda automática con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (busquedaQuery.trim() && busquedaQuery.length >= 2) {
        handleBuscarAutomatico();
      } else {
        setResultadosBusqueda([]);
        setMostrarSugerencias(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [busquedaQuery]);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.autocomplete-container')) {
        setMostrarSugerencias(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busquedaSorteo, filtroEstado, fechaDesde, fechaHasta]);

  // ==================== FUNCIONES DE SORTEOS ====================

  const cargarSorteosEnPreparacion = async () => {
    setCargandoSorteos(true);
    try {
      const sorteos = await obtenerSorteosEnPreparacion();
      setSorteosEnPreparacion(sorteos);
    } catch (error) {
      showMessage('Error al cargar sorteos', 'error');
    } finally {
      setCargandoSorteos(false);
    }
  };

  const handleCrearSorteo = async () => {
    if (!nombreSorteo.trim()) {
      showMessage('Ingrese un nombre para el sorteo', 'warning');
      return;
    }

    setCreandoSorteo(true);
    try {
      const nuevoSorteo = await crearSorteoManual({
        nombre: nombreSorteo,
        descripcion: descripcionSorteo,
      });

      showMessage('Sorteo creado exitosamente', 'success');
      setNombreSorteo('');
      setDescripcionSorteo('');

      // Recargar la lista
      await cargarSorteosEnPreparacion();

      // Cargar el sorteo recién creado
      const sorteos = await obtenerSorteosEnPreparacion();
      const sorteoCreado = sorteos.find(s => s.id === nuevoSorteo.id);

      if (sorteoCreado) {
        setSorteoActual(sorteoCreado);
        setParticipantes([]);
        setVista('preparacion');
      }
    } catch (error) {
      showMessage(error?.response?.data?.message || 'Error al crear sorteo', 'error');
    } finally {
      setCreandoSorteo(false);
    }
  };

  const cargarSorteo = async (sorteoId) => {
    setCargandoParticipantes(true);
    try {
      const sorteo = sorteosEnPreparacion.find(s => s.id === sorteoId);
      if (!sorteo) {
        await cargarSorteosEnPreparacion();
        return;
      }

      setSorteoActual(sorteo);

      // Cargar participantes
      const participantesData = await obtenerParticipantes(sorteoId);
      setParticipantes(participantesData);

      // Si el sorteo está finalizado, cargar los ganadores
      if (sorteo.estado === 'finalizado') {
        const detalleCompleto = await obtenerDetalle(sorteoId);
        setGanadoresGuardados(detalleCompleto.ganadores || []);
      } else {
        setGanadoresGuardados([]);
      }

      setVista('preparacion');
    } catch (error) {
      showMessage('Error al cargar sorteo', 'error');
    } finally {
      setCargandoParticipantes(false);
    }
  };

  // ==================== FUNCIONES DE BÚSQUEDA ====================

  const handleBuscarAutomatico = async () => {
    if (!busquedaQuery.trim() || busquedaQuery.length < 2) {
      return;
    }

    setBuscando(true);
    try {
      const resultados = await buscarPacientes(busquedaQuery);
      setResultadosBusqueda(resultados);
      setMostrarSugerencias(resultados.length > 0);
    } catch (err) {
      console.error('Error al buscar pacientes:', err);
      setResultadosBusqueda([]);
      setMostrarSugerencias(false);
    } finally {
      setBuscando(false);
    }
  };

  const handleAgregarPaciente = async (paciente) => {
    if (!sorteoActual) return;

    try {
      const response = await agregarParticipante(sorteoActual.id, paciente.id);

      // Recargar participantes
      const participantesData = await obtenerParticipantes(sorteoActual.id);
      setParticipantes(participantesData);

      setBusquedaQuery('');
      setResultadosBusqueda([]);
      setMostrarSugerencias(false);

      const veces = response.veces || 1;
      showMessage(`${getNombreCompleto(paciente)} agregado (${veces}x)`, 'success');
    } catch (error) {
      showMessage(error?.response?.data?.message || 'Error al agregar participante', 'error');
    }
  };

  const handleAgregarEntradaAdicional = async (pacienteId) => {
    if (!sorteoActual) return;

    try {
      const response = await agregarParticipante(sorteoActual.id, pacienteId);

      // Recargar participantes
      const participantesData = await obtenerParticipantes(sorteoActual.id);
      setParticipantes(participantesData);

      const veces = response.veces || 1;
      showMessage(`+1 entrada (Total: ${veces}x)`, 'success');
    } catch (error) {
      showMessage(error?.response?.data?.message || 'Error al agregar entrada', 'error');
    }
  };

  const handleEliminarUnaEntrada = async (pacienteId) => {
    if (!sorteoActual) return;

    try {
      const entrada = participantes.find(p => p.paciente_id === pacienteId);
      if (!entrada) return;

      await eliminarParticipante(sorteoActual.id, entrada.id);

      // Recargar participantes
      const participantesData = await obtenerParticipantes(sorteoActual.id);
      setParticipantes(participantesData);

      const quedanEntradas = participantesData.filter(p => p.paciente_id === pacienteId).length;
      if (quedanEntradas > 0) {
        showMessage(`-1 entrada (Quedan ${quedanEntradas}x)`, 'success');
      } else {
        showMessage('Participante eliminado completamente', 'success');
      }
    } catch (error) {
      showMessage(error?.response?.data?.message || 'Error al eliminar entrada', 'error');
    }
  };

  const handleEliminarTodasEntradas = async (pacienteId) => {
    if (!sorteoActual) return;

    try {
      const entradasPaciente = participantes.filter(p => p.paciente_id === pacienteId);

      for (const entrada of entradasPaciente) {
        await eliminarParticipante(sorteoActual.id, entrada.id);
      }

      // Recargar participantes
      const participantesData = await obtenerParticipantes(sorteoActual.id);
      setParticipantes(participantesData);

      showMessage('Todas las entradas eliminadas', 'success');
    } catch (error) {
      showMessage(error?.response?.data?.message || 'Error al eliminar entradas', 'error');
    }
  };

  // Agrupar pacientes para mostrar con cantidades
  const getPacientesAgrupados = () => {
    const agrupados = {};
    participantes.forEach(p => {
      if (!agrupados[p.paciente_id]) {
        agrupados[p.paciente_id] = { participante: p, cantidad: 0 };
      }
      agrupados[p.paciente_id].cantidad++;
    });
    return Object.values(agrupados);
  };

  // ==================== FUNCIONES DE SORTEO (RULETA) ====================

  const iniciarSorteo = () => {
    if (participantes.length < cantidadGanadores) {
      showMessage(`Debe tener al menos ${cantidadGanadores} participantes`, 'warning');
      return;
    }

    setGanadores([]);
    setSorteoIniciado(true);
    setGanadoresRevelados(0);
    setGanadoresEliminados([]);
    setResultadosGuardados(false);
    setVista('sorteo');
    showMessage('¡Sorteo iniciado! Jala la palanca para seleccionar cada ganador', 'success');
  };

  const jalarPalanca = () => {
    if (ganadores.length >= cantidadGanadores) {
      showMessage('Ya se seleccionaron todos los ganadores', 'warning');
      return;
    }

    // Si hay un ganador anterior revelado que aún no ha sido eliminado
    if (ganadoresRevelados > 0 && ganadoresRevelados === ganadores.length) {
      const ultimoGanadorRevelado = ganadores[ganadoresRevelados - 1];

      if (ganadoresEliminados.includes(ultimoGanadorRevelado.paciente_id)) {
        seleccionarNuevoGanador();
        return;
      }

      setEliminandoGanador(ultimoGanadorRevelado);

      setTimeout(() => {
        setGanadoresEliminados(prev => [...prev, ultimoGanadorRevelado.paciente_id]);
        setParticipantes(prevPacientes =>
          prevPacientes.filter(p => p.paciente_id !== ultimoGanadorRevelado.paciente_id)
        );
        setEliminandoGanador(null);

        setTimeout(() => {
          seleccionarNuevoGanador();
        }, 700);
      }, 2500);

      return;
    }

    seleccionarNuevoGanador();
  };

  const seleccionarNuevoGanador = () => {
    const idsGanadoresAnteriores = ganadores.map(g => g.paciente_id);
    const participantesDisponibles = participantes.filter(
      p => !idsGanadoresAnteriores.includes(p.paciente_id)
    );

    if (participantesDisponibles.length === 0) {
      showMessage('No hay más participantes disponibles', 'error');
      return;
    }

    const randomIndex = Math.floor(Math.random() * participantesDisponibles.length);
    const ganadorSeleccionado = participantesDisponibles[randomIndex];

    const nuevosGanadores = [...ganadores, ganadorSeleccionado];
    setGanadores(nuevosGanadores);

    setIsSpinning(true);
    setShowConfetti(false);

    setTimeout(() => {
      setIsSpinning(false);

      setTimeout(() => {
        setGanadoresRevelados(nuevosGanadores.length);
        setShowConfetti(true);

        setTimeout(() => {
          setShowConfetti(false);

          if (nuevosGanadores.length === cantidadGanadores) {
            showMessage('¡Sorteo completado! Todos los ganadores han sido seleccionados', 'success');
          } else {
            showMessage(`¡Ganador ${nuevosGanadores.length} seleccionado! Jala la palanca para continuar`, 'success');
          }
        }, 3000);
      }, 200);
    }, 5000);
  };

  const guardarResultados = async () => {
    if (ganadores.length === 0) {
      showMessage('Debe seleccionar al menos un ganador', 'warning');
      return;
    }

    if (ganadores.length < cantidadGanadores) {
      showMessage('El sorteo aún no ha terminado', 'warning');
      return;
    }

    if (resultadosGuardados) {
      showMessage('Los resultados ya fueron guardados', 'warning');
      return;
    }

    console.log('🔍 DEBUG - Ganadores antes de guardar:', ganadores);
    console.log('🔍 DEBUG - Estructura del primer ganador:', ganadores[0]);
    console.log('🔍 DEBUG - Campos disponibles:', Object.keys(ganadores[0]));
    console.log('🔍 DEBUG - paciente_id:', ganadores[0].paciente_id);
    console.log('🔍 DEBUG - id:', ganadores[0].id);

    setGuardandoResultados(true);
    try {
      const resultado = await finalizarSorteoManual(sorteoActual.id, ganadores);
      console.log('✅ Resultado del backend:', resultado);
      showMessage('Resultados guardados exitosamente', 'success');
      setResultadosGuardados(true);

      // Recargar el sorteo completo desde el backend para asegurar que tiene el estado actualizado
      const sorteoActualizado = await obtenerDetalle(sorteoActual.id);
      console.log('🔄 Sorteo actualizado desde backend:', sorteoActualizado);

      // Actualizar el sorteo actual con los datos reales del backend
      setSorteoActual(sorteoActualizado);

      // Guardar los ganadores
      if (sorteoActualizado.ganadores) {
        setGanadoresGuardados(sorteoActualizado.ganadores);
      }

      // Recargar participantes
      const participantesData = await obtenerParticipantes(sorteoActual.id);
      setParticipantes(participantesData);

      // Volver a la vista de preparación (que ahora mostrará los resultados)
      setTimeout(() => {
        setVista('preparacion');
        setSorteoIniciado(false);
        setIsSpinning(false);
        setShowConfetti(false);
      }, 2000);
    } catch (error) {
      console.error('❌ Error completo:', error);
      showMessage(error?.response?.data?.message || 'Error al guardar resultados', 'error');
    } finally {
      setGuardandoResultados(false);
    }
  };

  const resetearTodo = () => {
    setSorteoActual(null);
    setParticipantes([]);
    setGanadores([]);
    setGanadoresGuardados([]);
    setSorteoIniciado(false);
    setGanadoresRevelados(0);
    setGanadoresEliminados([]);
    setCantidadGanadores(1);
    setResultadosGuardados(false);
    setVista('lista');
    cargarSorteosEnPreparacion();
  };

  const handleDescargarPDF = async () => {
    if (!sorteoActual) return;

    setDescargandoPDF(true);
    try {
      await descargarArchivoPDF(sorteoActual.id, `Sorteo_${sorteoActual.nombre}.pdf`);
      showMessage('PDF descargado exitosamente', 'success');
    } catch (error) {
      showMessage('Error al descargar PDF', 'error');
    } finally {
      setDescargandoPDF(false);
    }
  };

  const volverAPreparacion = () => {
    setGanadores([]);
    setSorteoIniciado(false);
    setGanadoresRevelados(0);
    setGanadoresEliminados([]);
    setResultadosGuardados(false);
    setVista('preparacion');
  };

  // ==================== UI HELPERS ====================

  const showMessage = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 4000);
  };

  const getNombreCompleto = (paciente) => {
    if (paciente.nombre_completo) return paciente.nombre_completo;
    const nombres = paciente.nombres || '';
    const paterno = paciente.apellido_paterno || '';
    const materno = paciente.apellido_materno || '';
    return `${nombres} ${paterno} ${materno}`.trim() || 'Sin nombre';
  };

  const getDNI = (paciente) => {
    return paciente.numero_documento || '-';
  };

  // Función para filtrar sorteos
  const getSorteosFiltrados = () => {
    let sorteosFiltrados = [...sorteosEnPreparacion];

    // Filtro por búsqueda (nombre o descripción)
    if (busquedaSorteo.trim()) {
      const busqueda = busquedaSorteo.toLowerCase();
      sorteosFiltrados = sorteosFiltrados.filter(
        s =>
          s.nombre?.toLowerCase().includes(busqueda) ||
          s.descripcion?.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      sorteosFiltrados = sorteosFiltrados.filter(s => s.estado === filtroEstado);
    }

    // Filtro por rango de fechas
    if (fechaDesde) {
      sorteosFiltrados = sorteosFiltrados.filter(
        s => new Date(s.created_at) >= new Date(fechaDesde)
      );
    }

    if (fechaHasta) {
      const fechaHastaFin = new Date(fechaHasta);
      fechaHastaFin.setHours(23, 59, 59, 999);
      sorteosFiltrados = sorteosFiltrados.filter(
        s => new Date(s.created_at) <= fechaHastaFin
      );
    }

    return sorteosFiltrados;
  };

  const limpiarFiltros = () => {
    setBusquedaSorteo('');
    setFiltroEstado('todos');
    setFechaDesde('');
    setFechaHasta('');
    setPaginaActual(1);
  };

  // Función para obtener sorteos paginados
  const getSorteosPaginados = () => {
    const sorteosFiltrados = getSorteosFiltrados();
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return sorteosFiltrados.slice(inicio, fin);
  };

  const totalPaginas = Math.ceil(getSorteosFiltrados().length / itemsPorPagina);

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      {/* Snackbar */}
      {showSnackbar && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg border transform transition-all duration-300 ${
          snackbarSeverity === 'success' ? 'bg-white border-green-200' :
          snackbarSeverity === 'error' ? 'bg-white border-red-200' :
          snackbarSeverity === 'info' ? 'bg-white border-blue-200' :
          'bg-white border-yellow-200'
        } flex items-center gap-2.5`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            snackbarSeverity === 'success' ? 'bg-green-500' :
            snackbarSeverity === 'error' ? 'bg-red-500' :
            snackbarSeverity === 'info' ? 'bg-blue-500' :
            'bg-yellow-500'
          }`}></div>
          <span className="text-sm font-medium text-gray-700">{snackbarMessage}</span>
          <button onClick={() => setShowSnackbar(false)} className="ml-2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      )}

      {/* VISTA: LISTA DE SORTEOS */}
      {vista === 'lista' && (
        <div className="max-w-7xl mx-auto">
          {/* Header simplificado */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#7B1FA2] rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sorteos</h1>
                <p className="text-sm text-gray-600">Gestiona tus sorteos, participantes y ganadores en un solo lugar</p>
              </div>
            </div>
          </div>

          {/* Crear nuevo sorteo - Diseño cohesivo */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-[#7B1FA2]" />
              <h2 className="font-semibold text-gray-900">Crear Nuevo Sorteo</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nombre del Sorteo *</label>
                <input
                  type="text"
                  value={nombreSorteo}
                  onChange={(e) => setNombreSorteo(e.target.value)}
                  placeholder="Ej: Sorteo Navidad 2026"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Descripción (Opcional)</label>
                <input
                  type="text"
                  value={descripcionSorteo}
                  onChange={(e) => setDescripcionSorteo(e.target.value)}
                  placeholder="Agrega una descripción breve"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleCrearSorteo}
              disabled={creandoSorteo || !nombreSorteo.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-[#7B1FA2] text-white rounded-lg font-medium text-sm hover:bg-[#6A1B9A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creandoSorteo ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Creando sorteo...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Crear Sorteo
                </>
              )}
            </button>
          </div>

          {/* Buscador y Filtros - Cohesivo */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-[#7B1FA2]" />
              <h3 className="font-semibold text-gray-900">Buscar y filtrar</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Buscador */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={busquedaSorteo}
                  onChange={(e) => setBusquedaSorteo(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent"
                />
              </div>

              {/* Filtro por estado */}
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent"
              >
                <option value="todos">Todos los estados</option>
                <option value="preparacion">En preparación</option>
                <option value="finalizado">Finalizados</option>
              </select>

              {/* Botón limpiar filtros */}
              <button
                onClick={limpiarFiltros}
                className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-all"
              >
                <XCircle className="w-4 h-4" />
                Limpiar
              </button>
            </div>

            {/* Filtros de fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Desde</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Hasta</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Contador de resultados */}
            {(busquedaSorteo || filtroEstado !== 'todos' || fechaDesde || fechaHasta) && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  {getSorteosFiltrados().length} sorteo(s) encontrado(s)
                </p>
              </div>
            )}
          </div>

          {/* Lista de sorteos */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-[#7B1FA2]" />
                Mis Sorteos ({getSorteosFiltrados().length})
              </h2>
            </div>

            <div className="p-5">
              {cargandoSorteos ? (
                <div className="text-center py-12">
                  <Loader className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">Cargando sorteos...</p>
                </div>
              ) : getSorteosFiltrados().length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {sorteosEnPreparacion.length === 0 ? 'No hay sorteos creados' : 'No se encontraron sorteos'}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {sorteosEnPreparacion.length === 0 ? 'Crea tu primer sorteo para comenzar' : 'Intenta con otros filtros'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSorteosPaginados().map((sorteo) => (
                    <motion.div
                      key={sorteo.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg border border-gray-200 hover:border-[#7B1FA2] hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => cargarSorteo(sorteo.id)}
                    >
                      <div className="p-4">
                        {/* Nombre del sorteo */}
                        <h3 className="font-semibold text-gray-900 mb-1">{sorteo.nombre}</h3>

                        {/* Descripción si existe */}
                        {sorteo.descripcion && (
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{sorteo.descripcion}</p>
                        )}

                        {/* Estado - Debajo del título */}
                        <div className="mb-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                            sorteo.estado === 'finalizado'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {sorteo.estado === 'finalizado' ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Finalizado
                              </>
                            ) : (
                              <>
                                <PlayCircle className="w-3 h-3" />
                                Preparación
                              </>
                            )}
                          </span>
                        </div>

                        {/* Estadísticas con iconos coloridos */}
                        <div className="flex items-center gap-3 text-xs mb-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                              <Users className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-gray-700 font-medium">{sorteo.cantidad_participantes}</span>
                          </div>

                          {sorteo.estado === 'finalizado' && sorteo.cantidad_ganadores > 0 && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center">
                                <Trophy className="w-3.5 h-3.5 text-white" />
                              </div>
                              <span className="text-gray-700 font-medium">{sorteo.cantidad_ganadores}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 ml-auto text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs">{new Date(sorteo.created_at).toLocaleDateString('es-PE')}</span>
                          </div>
                        </div>

                        {/* Botón */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cargarSorteo(sorteo.id);
                          }}
                          className="w-full py-2 text-center text-sm font-medium text-[#7B1FA2] border border-[#7B1FA2] rounded-lg hover:bg-[#7B1FA2] hover:text-white transition-all"
                        >
                          Ver detalles
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Paginación */}
              {!cargandoSorteos && getSorteosFiltrados().length > 0 && totalPaginas > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
                  <div className="text-xs text-gray-600">
                    Mostrando {(paginaActual - 1) * itemsPorPagina + 1} - {Math.min(paginaActual * itemsPorPagina, getSorteosFiltrados().length)} de {getSorteosFiltrados().length}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                      disabled={paginaActual === 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Anterior
                    </button>
                    {[...Array(totalPaginas)].map((_, i) => {
                      const pageNum = i + 1;
                      // Mostrar solo algunas páginas
                      if (
                        pageNum === 1 ||
                        pageNum === totalPaginas ||
                        (pageNum >= paginaActual - 1 && pageNum <= paginaActual + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPaginaActual(pageNum)}
                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                              paginaActual === pageNum
                                ? 'bg-[#7B1FA2] text-white'
                                : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === paginaActual - 2 ||
                        pageNum === paginaActual + 2
                      ) {
                        return <span key={pageNum} className="text-gray-400 px-1">...</span>;
                      }
                      return null;
                    })}
                    <button
                      onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                      disabled={paginaActual === totalPaginas}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VISTA: PREPARACIÓN O FINALIZADO */}
      {vista === 'preparacion' && sorteoActual && (
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{sorteoActual.nombre}</h1>
              <p className="text-gray-600 text-sm">{sorteoActual.descripcion || (sorteoActual.estado === 'finalizado' ? 'Resultados del sorteo' : 'Agrega participantes')}</p>
            </div>
            <div className="flex items-center gap-2">
              {sorteoActual.estado === 'finalizado' && (
                <button
                  onClick={handleDescargarPDF}
                  disabled={descargandoPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {descargandoPDF ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Descargando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Descargar PDF
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => setVista('lista')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
            </div>
          </div>

          {/* Estadísticas mejoradas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">Participantes</span>
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{participantes.length}</div>
              <p className="text-xs text-gray-500 mt-1">Entradas totales</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">
                  {sorteoActual.estado === 'finalizado' ? 'Ganadores' : 'Estado'}
                </span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  sorteoActual.estado === 'finalizado' ? 'bg-amber-50' : 'bg-green-50'
                }`}>
                  {sorteoActual.estado === 'finalizado' ? (
                    <Trophy className="w-5 h-5 text-amber-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {sorteoActual.estado === 'finalizado' ? ganadoresGuardados.length : 'Preparación'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {sorteoActual.estado === 'finalizado' ? 'Seleccionados' : 'Listo para sortear'}
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">Fecha</span>
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {new Date(sorteoActual.created_at).toLocaleDateString('es-PE')}
              </div>
              <p className="text-xs text-gray-500 mt-1">Fecha de creación</p>
            </div>
          </div>

          {/* GANADORES - Solo si está finalizado */}
          {sorteoActual.estado === 'finalizado' && ganadoresGuardados.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                Ganadores del Sorteo
              </h3>

              <div className="space-y-2">
                {ganadoresGuardados
                  .sort((a, b) => a.posicion - b.posicion)
                  .map((ganador) => (
                    <div key={ganador.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                          {ganador.posicion}°
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {getNombreCompleto(ganador.paciente || ganador)}
                          </div>
                          <div className="text-xs text-gray-600">
                            DNI: {getDNI(ganador.paciente || ganador)}
                          </div>
                        </div>
                      </div>
                      <Trophy className="w-5 h-5 text-amber-600" />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Buscador - Solo si NO está finalizado */}
          {sorteoActual.estado !== 'finalizado' && (
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Agregar Participantes</h3>

            <div className="relative autocomplete-container">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={busquedaQuery}
                  onChange={(e) => setBusquedaQuery(e.target.value)}
                  onFocus={() => setMostrarSugerencias(resultadosBusqueda.length > 0)}
                  placeholder="Buscar paciente..."
                  className="w-full pl-9 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644]"
                />
                {buscando && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-[#7B1FA2] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Sugerencias */}
              {mostrarSugerencias && resultadosBusqueda.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {resultadosBusqueda.map((paciente) => (
                    <button
                      key={paciente.id}
                      onClick={() => handleAgregarPaciente(paciente)}
                      className="w-full text-left px-3 py-2 hover:bg-purple-50 text-sm"
                    >
                      <div className="font-medium text-gray-900">{getNombreCompleto(paciente)}</div>
                      <div className="text-xs text-gray-600">DNI: {getDNI(paciente)}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}

          {/* Lista de participantes - Editable solo si NO está finalizado */}
          {sorteoActual.estado !== 'finalizado' && participantes.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Participantes ({participantes.length} entradas)
              </h3>

              <div className="space-y-2">
                {getPacientesAgrupados().map(({ participante, cantidad }, index) => (
                  <div key={participante.paciente_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-xs text-gray-500">{index + 1}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{getNombreCompleto(participante)}</div>
                        <div className="text-xs text-gray-600">DNI: {getDNI(participante)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-bold">
                        {cantidad}x
                      </span>
                      <button
                        onClick={() => handleAgregarEntradaAdicional(participante.paciente_id)}
                        className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100"
                        title="Agregar entrada"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleEliminarUnaEntrada(participante.paciente_id)}
                        className="p-1.5 bg-orange-50 text-orange-600 rounded hover:bg-orange-100"
                        title="Eliminar una"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleEliminarTodasEntradas(participante.paciente_id)}
                        className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"
                        title="Eliminar todas"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de participantes - Solo lectura si está finalizado */}
          {sorteoActual.estado === 'finalizado' && participantes.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Participantes que entraron al sorteo ({participantes.length} entradas)
              </h3>

              <div className="space-y-2">
                {getPacientesAgrupados().map(({ participante, cantidad }, index) => (
                  <div key={participante.paciente_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-xs text-gray-500">{index + 1}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{getNombreCompleto(participante)}</div>
                        <div className="text-xs text-gray-600">DNI: {getDNI(participante)}</div>
                      </div>
                    </div>

                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-bold">
                      {cantidad}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Iniciar sorteo - Solo si NO está finalizado */}
          {sorteoActual.estado !== 'finalizado' && participantes.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Iniciar Sorteo</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad de Ganadores</label>
                <input
                  type="number"
                  min="1"
                  max={participantes.length}
                  value={cantidadGanadores}
                  onChange={(e) => setCantidadGanadores(Math.max(1, Math.min(participantes.length, parseInt(e.target.value) || 1)))}
                  className="w-full md:w-32 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644]"
                />
              </div>

              <button
                onClick={iniciarSorteo}
                disabled={participantes.length < cantidadGanadores}
                className="flex items-center gap-2 px-5 py-2 bg-[#7B1FA2] text-white rounded-lg font-medium text-sm hover:bg-[#6A1B9A] transition-all disabled:opacity-50"
              >
                <PlayCircle className="w-4 h-4" />
                Iniciar Sorteo
              </button>
            </div>
          )}
        </div>
      )}

      {/* VISTA: SORTEO (Ruleta) */}
      {vista === 'sorteo' && sorteoActual && sorteoIniciado && (
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{sorteoActual.nombre}</h1>
              <p className="text-gray-600 text-sm">Jala la palanca para seleccionar ganadores</p>
            </div>
            <button
              onClick={volverAPreparacion}
              disabled={isSpinning}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Ganadores</div>
              <div className="text-2xl font-bold text-gray-900">{ganadores.length}/{cantidadGanadores}</div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Estado</div>
              <div className="text-lg font-bold text-gray-900">
                {ganadores.length === cantidadGanadores ? 'Finalizado' : isSpinning ? 'Girando...' : 'En Proceso'}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Participantes</div>
              <div className="text-2xl font-bold text-gray-900">{participantes.length}</div>
            </div>
          </div>

          {/* Animación de eliminación */}
          <AnimatePresence>
            {eliminandoGanador && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center"
              >
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <h3 className="text-lg font-bold text-red-900">Eliminando de la Ruleta</h3>
                <p className="text-sm text-red-700">{getNombreCompleto(eliminandoGanador)}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Palanca y Ruleta */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 mb-6">
            <PalancaCasino
              onPull={jalarPalanca}
              disabled={isSpinning || ganadores.length >= cantidadGanadores}
              ganadorNumero={ganadoresRevelados > 0 ? ganadoresRevelados : 1}
              totalGanadores={cantidadGanadores}
            />

            <Ruleta
              pacientes={participantes}
              cantidadGanadores={cantidadGanadores}
              isSpinning={isSpinning}
              ganadores={ganadores}
              ganadoresRevelados={ganadoresRevelados}
              ganadoresEliminados={ganadoresEliminados}
              eliminandoGanador={eliminandoGanador}
            />
          </div>

          {/* Botón Guardar */}
          {ganadores.length === cantidadGanadores && (
            <div className="flex justify-center">
              <button
                onClick={guardarResultados}
                disabled={guardandoResultados || resultadosGuardados}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-50"
              >
                {guardandoResultados ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : resultadosGuardados ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Guardado
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Resultados
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GestionSorteoManual;
