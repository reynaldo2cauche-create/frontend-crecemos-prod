import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  UserIcon,
  UsersIcon,
  FunnelIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { obtenerInconsistenciasAsistencia, modificarAsistenciaAdmin } from '../../services/api';
import { getTrabajadores } from '../../services/trabajadorService';
import { buscarPacientes } from '../../services/pacienteService';
import * as XLSX from 'xlsx-js-style';

const Inconsistencias = () => {
  const [inconsistencias, setInconsistencias] = useState([]);
  const [inconsistenciasFiltradas, setInconsistenciasFiltradas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filtros avanzados
  const [filtros, setFiltros] = useState({
    terapeuta: '',
    paciente: '',
    tipoInconsistencia: '',
    estadoRecepcion: '',
    estadoTerapeuta: '',
  });

  // Estados para terapeutas y pacientes
  const [terapeutas, setTerapeutas] = useState([]);
  const [pacientesSugerencias, setPacientesSugerencias] = useState([]);
  const [busquedaPaciente, setBusquedaPaciente] = useState('');
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Estados para modal de edición
  const [modalAbierto, setModalAbierto] = useState(false);
  const [asistenciaSeleccionada, setAsistenciaSeleccionada] = useState(null);
  const [estadoRecepcion, setEstadoRecepcion] = useState(null);
  const [estadoTerapeuta, setEstadoTerapeuta] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Estados para notificaciones
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const lunes = new Date(hoy);
    const diasDesdeElLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    lunes.setDate(hoy.getDate() - diasDesdeElLunes);
    const sabado = new Date(lunes);
    sabado.setDate(lunes.getDate() + 5);

    const formatearFecha = (fecha) => {
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const fechaInicioStr = formatearFecha(lunes);
    const fechaFinStr = formatearFecha(sabado);

    setFechaInicio(fechaInicioStr);
    setFechaFin(fechaFinStr);

    cargarInconsistencias(fechaInicioStr, fechaFinStr);
    cargarTerapeutas();
  }, []);

  const cargarTerapeutas = async () => {
    try {
      const response = await getTrabajadores();
      if (!response || response.length === 0) return;

      const trabajadoresActivos = response
        .filter(t => {
          const esActivo = t.estado === true || t.estado === 1;
          const esTerapeuta = t.rol && t.rol.id === 4;
          return esActivo && esTerapeuta;
        })
        .sort((a, b) => (a.nombres || '').localeCompare(b.nombres || ''));

      if (trabajadoresActivos.length === 0) {
        const todosActivos = response
          .filter(t => t.estado === true || t.estado === 1)
          .sort((a, b) => (a.nombres || '').localeCompare(b.nombres || ''));
        setTerapeutas(todosActivos);
      } else {
        setTerapeutas(trabajadoresActivos);
      }
    } catch (error) {
      console.error('Error al cargar terapeutas:', error);
    }
  };

  const handleBuscarPaciente = async (query) => {
    setBusquedaPaciente(query);
    if (query.length >= 2) {
      try {
        const resultados = await buscarPacientes(query);
        setPacientesSugerencias(resultados);
        setMostrarSugerencias(true);
      } catch (error) {
        console.error('Error al buscar pacientes:', error);
        setPacientesSugerencias([]);
      }
    } else {
      setPacientesSugerencias([]);
      setMostrarSugerencias(false);
    }
  };

  const seleccionarPaciente = (paciente) => {
    const nombreCompleto = paciente.nombre_completo || '';
    setBusquedaPaciente(nombreCompleto);
    setFiltros(prev => ({ ...prev, paciente: nombreCompleto }));
    setMostrarSugerencias(false);
  };

  // ✅ FIX: limpiar filtradas cuando no hay inconsistencias
  useEffect(() => {
    if (inconsistencias.length > 0) {
      aplicarFiltros();
    } else {
      setInconsistenciasFiltradas([]);
    }
  }, [filtros, inconsistencias]);

  // ✅ FIX: limpiar datos viejos antes de cada búsqueda
  const cargarInconsistencias = async (inicio, fin, resetPage = true) => {
    const fechaInicioFinal = inicio || fechaInicio;
    const fechaFinFinal    = fin    || fechaFin;

    if (!fechaInicioFinal || !fechaFinFinal) {
      alert('Seleccione un rango de fechas');
      return;
    }

    setInconsistencias([]);
    setInconsistenciasFiltradas([]);
    if (resetPage) setPage(0);
    setCargando(true);

    try {
      const data = await obtenerInconsistenciasAsistencia(fechaInicioFinal, fechaFinFinal);
      setInconsistencias(data.inconsistencias || []);
    } catch (error) {
      console.error('Error al cargar inconsistencias:', error);
      alert('Error al cargar inconsistencias');
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = () => {
    let resultados = [...inconsistencias];

    if (filtros.terapeuta) {
      const terapeutaSeleccionado = terapeutas.find(t => t.id === parseInt(filtros.terapeuta));
      if (terapeutaSeleccionado) {
        const nombreTerapeuta = `${terapeutaSeleccionado.nombres} ${terapeutaSeleccionado.apellidos}`.trim();
        resultados = resultados.filter(item =>
          item.terapeuta_nombre?.toLowerCase().includes(nombreTerapeuta.toLowerCase())
        );
      }
    }

    if (filtros.paciente) {
      resultados = resultados.filter(item =>
        item.paciente_nombre?.toLowerCase().includes(filtros.paciente.toLowerCase())
      );
    }

    if (filtros.tipoInconsistencia) {
      resultados = resultados.filter(item =>
        item.tipo_inconsistencia === filtros.tipoInconsistencia
      );
    }

    if (filtros.estadoRecepcion !== '') {
      if (filtros.estadoRecepcion === '0') {
        resultados = resultados.filter(item => item.recepcion_marco == 0);
      } else if (filtros.estadoRecepcion === '7') {
        resultados = resultados.filter(item => item.recepcion_marco == 1 && item.recepcion_estado_id == 7);
      } else if (filtros.estadoRecepcion === '6') {
        resultados = resultados.filter(item => item.recepcion_marco == 1 && item.recepcion_estado_id == 6);
      }
    }

    if (filtros.estadoTerapeuta !== '') {
      if (filtros.estadoTerapeuta === '0') {
        resultados = resultados.filter(item => item.terapeuta_marco == 0);
      } else if (filtros.estadoTerapeuta === '7') {
        resultados = resultados.filter(item => item.terapeuta_marco == 1 && item.terapeuta_estado_id == 7);
      } else if (filtros.estadoTerapeuta === '6') {
        resultados = resultados.filter(item => item.terapeuta_marco == 1 && item.terapeuta_estado_id == 6);
      }
    }
    setInconsistenciasFiltradas(resultados);
    setPage(0);
  };

  const handleBuscar = () => {
    cargarInconsistencias(fechaInicio, fechaFin);
  };

  const limpiarFiltros = () => {
    setFiltros({
      terapeuta: '',
      paciente: '',
      tipoInconsistencia: '',
      estadoRecepcion: '',
      estadoTerapeuta: '',
    });
    setBusquedaPaciente('');
    setPacientesSugerencias([]);
    setMostrarSugerencias(false);
  };

  const aplicarFiltroRapido = (dias) => {
    const hoy = new Date();
    const fechaInicioRapido = new Date(hoy);
    fechaInicioRapido.setDate(hoy.getDate() - dias);

    const formatearFecha = (fecha) => {
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setFechaInicio(formatearFecha(fechaInicioRapido));
    setFechaFin(formatearFecha(hoy));
  };

  const tiposInconsistencia = useMemo(() => {
    return [...new Set(inconsistencias.map(item => item.tipo_inconsistencia).filter(Boolean))].sort();
  }, [inconsistencias]);

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).replace(',', '');
  };

  const formatearFechaSimple = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const exportarAExcel = () => {
    if (inconsistenciasFiltradas.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const datosExcel = inconsistenciasFiltradas.map((item, index) => ({
      'N°': index + 1,
      'ID Cita': item.cita_id,
      'Paciente': item.paciente_nombre || 'N/A',
      'Terapeuta': item.terapeuta_nombre || 'N/A',
      'Fecha Cita': item.fecha_cita ? formatearFecha(item.fecha_cita) : 'N/A',
      'Estado Recepción': item.recepcion_marco
        ? `${getEstadoTexto(item.recepcion_estado_id)} - ${item.recepcion_fecha ? formatearFecha(item.recepcion_fecha) : ''}`
        : 'No marcó',
      'Estado Terapeuta': item.terapeuta_marco
        ? `${getEstadoTexto(item.terapeuta_estado_id)} - ${item.terapeuta_fecha ? formatearFecha(item.terapeuta_fecha) : ''}`
        : 'No marcó',
      'Tipo de Inconsistencia': item.tipo_inconsistencia
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);

    XLSX.utils.sheet_add_aoa(ws, [
      ['CENTRO CRECEMOS'],
      ['REPORTE DE INCONSISTENCIAS DE ASISTENCIA'],
      [''],
      [`Período: ${formatearFechaSimple(fechaInicio)} - ${formatearFechaSimple(fechaFin)}`],
      [`Fecha de generación: ${formatearFechaSimple(new Date())}`],
      [`Total de inconsistencias: ${inconsistenciasFiltradas.length}`],
      [''],
    ], { origin: 'A1' });

    XLSX.utils.sheet_add_json(ws, datosExcel, { origin: 'A8' });

    ws['!cols'] = [
      { wch: 8 }, { wch: 12 }, { wch: 35 }, { wch: 35 },
      { wch: 22 }, { wch: 40 }, { wch: 40 }, { wch: 45 },
    ];

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    ];

    const borderFull = {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    };
    const borderThick = {
      top: { style: "medium", color: { rgb: "000000" } },
      bottom: { style: "medium", color: { rgb: "000000" } },
      left: { style: "medium", color: { rgb: "000000" } },
      right: { style: "medium", color: { rgb: "000000" } }
    };

    if (ws['A1']) ws['A1'].s = { font: { bold: true, sz: 18, color: { rgb: "1F2937" }, name: "Calibri" }, fill: { fgColor: { rgb: "F3F4F6" } }, alignment: { horizontal: "center", vertical: "center" }, border: borderThick };
    if (ws['A2']) ws['A2'].s = { font: { bold: true, sz: 14, color: { rgb: "374151" }, name: "Calibri" }, fill: { fgColor: { rgb: "E5E7EB" } }, alignment: { horizontal: "center", vertical: "center" }, border: borderFull };
    if (ws['A4']) ws['A4'].s = { font: { sz: 11, color: { rgb: "4B5563" }, name: "Calibri" }, alignment: { horizontal: "left", vertical: "center" } };
    if (ws['A5']) ws['A5'].s = { font: { sz: 11, color: { rgb: "4B5563" }, name: "Calibri" }, alignment: { horizontal: "left", vertical: "center" } };
    if (ws['A6']) ws['A6'].s = { font: { sz: 11, color: { rgb: "4B5563" }, name: "Calibri" }, alignment: { horizontal: "left", vertical: "center" } };

    ['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8'].forEach(celda => {
      if (ws[celda]) ws[celda].s = { font: { bold: true, sz: 11, color: { rgb: "FFFFFF" }, name: "Calibri" }, fill: { fgColor: { rgb: "059669" } }, alignment: { horizontal: "center", vertical: "center", wrapText: true }, border: borderFull };
    });

    const totalFilas = inconsistenciasFiltradas.length;
    for (let i = 0; i < totalFilas; i++) {
      const fila = 9 + i;
      const esFilaPar = i % 2 === 0;
      const estilo = { font: { sz: 10, color: { rgb: "1F2937" }, name: "Calibri" }, alignment: { horizontal: "left", vertical: "center", wrapText: true }, fill: { fgColor: { rgb: esFilaPar ? "FFFFFF" : "F9FAFB" } }, border: borderFull };
      if (ws[`A${fila}`]) ws[`A${fila}`].s = { ...estilo, font: { ...estilo.font, bold: true }, fill: { fgColor: { rgb: "DBEAFE" } }, alignment: { horizontal: "center", vertical: "center" } };
      ['B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach(col => {
        if (ws[`${col}${fila}`]) ws[`${col}${fila}`].s = estilo;
      });
    }

    const rowHeights = [
      { hpt: 30 }, { hpt: 25 }, { hpt: 12 }, { hpt: 18 },
      { hpt: 18 }, { hpt: 18 }, { hpt: 12 }, { hpt: 40 },
    ];
    for (let i = 0; i < totalFilas; i++) rowHeights.push({ hpt: 25 });
    ws['!rows'] = rowHeights;

    XLSX.utils.book_append_sheet(wb, ws, 'Inconsistencias');
    XLSX.writeFile(wb, `Reporte_Inconsistencias_${fechaInicio}_${fechaFin}.xlsx`);
  };

  const getEstadoTexto = (estadoId) => {
    switch (estadoId) {
      case 7: return 'Asistió';
      case 6: return 'Sesión Dictada';
      default: return 'No marcó';
    }
  };

  const getColorByTipo = (tipo) => {
    if (tipo === 'Ninguno marcó asistencia') return 'bg-red-100 text-red-800 border-red-200';
    if (tipo === 'Falta registro de admisión' || tipo === 'Falta registro del terapeuta') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (tipo && tipo.startsWith('Estados no coinciden')) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const abrirModal = (asistencia) => {
    setAsistenciaSeleccionada(asistencia);
    setEstadoRecepcion(asistencia.recepcion_estado_id || null);
    setEstadoTerapeuta(asistencia.terapeuta_estado_id || null);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setAsistenciaSeleccionada(null);
    setEstadoRecepcion(null);
    setEstadoTerapeuta(null);
  };

  const handleGuardarCambios = async () => {
    if (!asistenciaSeleccionada) return;

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      setSnackbarMessage('No se pudo obtener información del usuario');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      return;
    }

    setGuardando(true);
    try {
      await modificarAsistenciaAdmin(
        asistenciaSeleccionada.cita_id,
        estadoRecepcion,
        estadoTerapeuta,
        user.id
      );

      setSnackbarMessage(`✅ Asistencia #${asistenciaSeleccionada.cita_id} actualizada correctamente`);
      setSnackbarSeverity('success');
      setShowSnackbar(true);

      cerrarModal();
      cargarInconsistencias(fechaInicio, fechaFin, false);
    } catch (error) {
      console.error('Error al modificar asistencia:', error);
      setSnackbarMessage(error.response?.data?.message || 'Error al modificar asistencia');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    } finally {
      setGuardando(false);
    }
  };

  const datosMostrados = inconsistenciasFiltradas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.ceil(inconsistenciasFiltradas.length / rowsPerPage);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Snackbar de notificaciones */}
      {showSnackbar && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-lg border transform transition-all duration-300 ${
          snackbarSeverity === 'success'
            ? 'bg-white border-gray-100'
            : 'bg-white border-red-100'
        } flex items-center gap-2.5`}>
          <div className={`w-1.5 h-1.5 rounded-full ${snackbarSeverity === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`}></div>
          <span className="text-xs font-medium text-gray-700">{snackbarMessage}</span>
          <button onClick={() => setShowSnackbar(false)} className="ml-2">
            <XMarkIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <ExclamationTriangleIcon className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inconsistencias de Asistencia</h1>
            <p className="text-gray-600">Revise las discrepancias entre recepción y terapeuta </p>
          </div>
        </div>
      </div>

      {/* Filtros Rápidos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => aplicarFiltroRapido(1)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">Hoy</button>
          <button onClick={() => aplicarFiltroRapido(7)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">Última semana</button>
          <button onClick={() => aplicarFiltroRapido(30)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">Último mes</button>
          <div className="flex-1" />
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            {showAdvancedFilters ? 'Ocultar filtros' : 'Filtros avanzados'}
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filtros Básicos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleBuscar}
              disabled={cargando}
              className="w-full px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
            >
              {cargando ? 'Cargando...' : 'Buscar Inconsistencias'}
            </button>
          </div>
        </div>

        {/* Filtros Avanzados */}
        {showAdvancedFilters && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Terapeuta */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <UserIcon className="w-4 h-4 inline mr-1" />Terapeuta
                </label>
                <select
                  value={filtros.terapeuta}
                  onChange={(e) => setFiltros(prev => ({ ...prev, terapeuta: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Todos los terapeutas</option>
                  {terapeutas.map((t) => (
                    <option key={t.id} value={t.id}>{t.nombres} {t.apellidos}</option>
                  ))}
                </select>
              </div>

              {/* Paciente */}
              <div style={{ position: 'relative', zIndex: mostrarSugerencias ? 100 : 1 }}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <UsersIcon className="w-4 h-4 inline mr-1" />Paciente
                </label>
                <input
                  type="text"
                  placeholder="Buscar paciente (min. 2 caracteres)..."
                  value={busquedaPaciente}
                  onChange={(e) => handleBuscarPaciente(e.target.value)}
                  onFocus={() => { if (pacientesSugerencias.length > 0) setMostrarSugerencias(true); }}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {mostrarSugerencias && pacientesSugerencias.length > 0 && (
                  <>
                    <div
                      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, background: 'transparent' }}
                      onClick={() => setMostrarSugerencias(false)}
                    />
                    <div style={{ position: 'absolute', left: 0, right: 0, marginTop: '4px', backgroundColor: 'white', border: '2px solid #ef4444', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', maxHeight: '240px', overflowY: 'auto', zIndex: 1000 }}>
                      {pacientesSugerencias.map((paciente) => (
                        <button
                          key={paciente.id}
                          type="button"
                          onClick={() => seleccionarPaciente(paciente)}
                          style={{ width: '100%', padding: '12px 16px', textAlign: 'left', border: 'none', borderBottom: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', display: 'block' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <div style={{ fontWeight: 500, color: '#111827' }}>{paciente.nombre_completo}</div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Tipo de Inconsistencia */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Inconsistencia</label>
                <select
                  value={filtros.tipoInconsistencia}
                  onChange={(e) => setFiltros(prev => ({ ...prev, tipoInconsistencia: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Todos los tipos</option>
                  {tiposInconsistencia.map((tipo, i) => (
                    <option key={i} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              {/* Estado Recepción */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estado Recepción</label>
                <select
                  value={filtros.estadoRecepcion}
                  onChange={(e) => setFiltros(prev => ({ ...prev, estadoRecepcion: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="0">No marcó</option>
                  <option value="7">Asistió</option>
                  <option value="6">Sesión Dictada</option>
                </select>
              </div>

              {/* Estado Terapeuta */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estado Terapeuta</label>
                <select
                  value={filtros.estadoTerapeuta}
                  onChange={(e) => setFiltros(prev => ({ ...prev, estadoTerapeuta: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="0">No marcó</option>
                  <option value="7">Asistió</option>
                  <option value="6">Sesión Dictada</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={limpiarFiltros}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <XMarkIcon className="w-4 h-4" />Limpiar Filtros
              </button>
              <button
                onClick={() => aplicarFiltros()}
                className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />Aplicar
              </button>
            </div>

            {/* Resumen filtros activos */}
            {(filtros.terapeuta || filtros.paciente || filtros.tipoInconsistencia || filtros.estadoRecepcion || filtros.estadoTerapeuta) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <FunnelIcon className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-semibold text-red-700">Filtros aplicados:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filtros.terapeuta && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Terapeuta: {(() => { const t = terapeutas.find(ter => ter.id === parseInt(filtros.terapeuta)); return t ? `${t.nombres} ${t.apellidos}` : filtros.terapeuta; })()}
                      <button onClick={() => setFiltros(prev => ({ ...prev, terapeuta: '' }))}><XMarkIcon className="w-3 h-3" /></button>
                    </span>
                  )}
                  {filtros.paciente && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Paciente: {filtros.paciente}
                      <button onClick={() => { setFiltros(prev => ({ ...prev, paciente: '' })); setBusquedaPaciente(''); }}><XMarkIcon className="w-3 h-3" /></button>
                    </span>
                  )}
                  {filtros.tipoInconsistencia && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Tipo: {filtros.tipoInconsistencia}
                      <button onClick={() => setFiltros(prev => ({ ...prev, tipoInconsistencia: '' }))}><XMarkIcon className="w-3 h-3" /></button>
                    </span>
                  )}
                  {filtros.estadoRecepcion && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Recepción: {filtros.estadoRecepcion === '0' ? 'No marcó' : filtros.estadoRecepcion === '7' ? 'Asistió' : 'Sesión Dictada'}
                      <button onClick={() => setFiltros(prev => ({ ...prev, estadoRecepcion: '' }))}><XMarkIcon className="w-3 h-3" /></button>
                    </span>
                  )}
                  {filtros.estadoTerapeuta && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Terapeuta: {filtros.estadoTerapeuta === '0' ? 'No marcó' : filtros.estadoTerapeuta === '7' ? 'Asistió' : 'Sesión Dictada'}
                      <button onClick={() => setFiltros(prev => ({ ...prev, estadoTerapeuta: '' }))}><XMarkIcon className="w-3 h-3" /></button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Estadísticas */}
      {!cargando && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { valor: inconsistenciasFiltradas.length, label: 'Total Filtrado', sub: `${inconsistencias.length} totales`, color: 'text-gray-900' },
            { valor: inconsistenciasFiltradas.filter(i => i.tipo_inconsistencia === 'Ninguno marcó asistencia').length, label: 'Ninguno marcó', sub: '', color: 'text-red-900' },
            { valor: inconsistenciasFiltradas.filter(i => i.tipo_inconsistencia === 'Falta registro de admisión' || i.tipo_inconsistencia === 'Falta registro del terapeuta').length, label: 'Faltan registros', sub: '', color: 'text-yellow-900' },
            { valor: inconsistenciasFiltradas.filter(i => i.tipo_inconsistencia?.startsWith('Estados no coinciden')).length, label: 'Estados diferentes', sub: '', color: 'text-orange-900' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className={`text-2xl font-bold mb-1 ${stat.color}`}>{stat.valor}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
              {stat.sub && <div className="text-xs text-gray-500 mt-1">{stat.sub}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Botón exportar */}
      {!cargando && inconsistenciasFiltradas.length > 0 && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={exportarAExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-sm"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />Exportar a Excel
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Cita ID', 'Paciente', 'Terapeuta', 'Fecha Cita', 'Recepción Marcó', 'Terapeuta Marcó', 'Tipo de Inconsistencia', 'Acciones'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cargando ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin" />
                      <span className="text-gray-600">Cargando inconsistencias...</span>
                    </div>
                  </td>
                </tr>
              ) : datosMostrados.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <ShieldCheckIcon className="w-16 h-16 text-green-400 mx-auto mb-3" />
                    <p className="text-green-700 text-lg font-semibold">¡Excelente!</p>
                    <p className="text-gray-500">No se encontraron inconsistencias con los filtros aplicados</p>
                  </td>
                </tr>
              ) : (
                datosMostrados.map((item) => (
                  <tr key={item.id} className="hover:bg-red-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">#{item.cita_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.paciente_nombre || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.terapeuta_nombre || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.fecha_cita ? formatearFecha(item.fecha_cita) : 'N/A'}</td>
                    <td className="px-6 py-4">
                      {item.recepcion_marco ? (
                        <>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${item.recepcion_estado_id === 7 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                            {getEstadoTexto(item.recepcion_estado_id)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{item.recepcion_fecha ? formatearFecha(item.recepcion_fecha) : ''}</p>
                        </>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">No marcó</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.terapeuta_marco ? (
                        <>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${item.terapeuta_estado_id === 7 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                            {getEstadoTexto(item.terapeuta_estado_id)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{item.terapeuta_fecha ? formatearFecha(item.terapeuta_fecha) : ''}</p>
                        </>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">No marcó</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getColorByTipo(item.tipo_inconsistencia)}`}>
                        <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs font-bold">{item.tipo_inconsistencia}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => abrirModal(item)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Modificar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {!cargando && inconsistenciasFiltradas.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, inconsistenciasFiltradas.length)} de {inconsistenciasFiltradas.length} inconsistencias
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(0)} disabled={page === 0} className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200">Primero</button>
                <button onClick={() => setPage(page - 1)} disabled={page === 0} className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200">Anterior</button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 3)            pageNum = i;
                    else if (page < 2)              pageNum = i;
                    else if (page > totalPages - 3) pageNum = totalPages - 3 + i;
                    else                            pageNum = page - 1 + i;
                    return (
                      <button key={pageNum} onClick={() => setPage(pageNum)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${page === pageNum ? 'bg-red-600 text-white' : 'hover:bg-gray-200 text-gray-700'}`}>
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1} className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200">Siguiente</button>
                <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200">Último</button>
              </div>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm"
              >
                <option value={10}>10 por página</option>
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Tipos de Inconsistencias:</h3>
        <div className="space-y-2 text-sm">
          {[
            { color: 'bg-red-500', text: '<strong>Ninguno marcó asistencia:</strong> Ni admisión ni terapeuta registraron después de las 9pm del día de la cita' },
            { color: 'bg-yellow-500', text: '<strong>Falta registro de admisión:</strong> Solo el terapeuta marcó, falta que admisión registre' },
            { color: 'bg-yellow-500', text: '<strong>Falta registro del terapeuta:</strong> Solo admisión marcó, falta que el terapeuta registre' },
            { color: 'bg-orange-500', text: '<strong>Estados no coinciden:</strong> Ambos marcaron pero con estados diferentes' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-3 h-3 ${item.color} rounded-full flex-shrink-0`} />
              <span className="text-gray-700" dangerouslySetInnerHTML={{ __html: item.text }} />
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Modificación */}
      {modalAbierto && asistenciaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="bg-red-600 px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-white">Modificar Asistencia - Cita #{asistenciaSeleccionada.cita_id}</h2>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6">
              {/* Información de la Cita */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1"><span className="font-semibold">Paciente:</span> {asistenciaSeleccionada.paciente_nombre}</p>
                <p className="text-sm text-gray-600 mb-1"><span className="font-semibold">Terapeuta:</span> {asistenciaSeleccionada.terapeuta_nombre}</p>
                <p className="text-sm text-gray-600"><span className="font-semibold">Fecha:</span> {formatearFecha(asistenciaSeleccionada.fecha_cita)}</p>
              </div>

              {/* Estado de Recepción */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Estado de Recepción/Admisión
                </label>
                <p className="text-xs text-gray-500 mb-3">Haz clic en la opción seleccionada para desmarcarla</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setEstadoRecepcion(estadoRecepcion === 7 ? null : 7)}
                    className={`py-3 px-4 rounded-lg font-bold transition-all ring-offset-1 ${
                      estadoRecepcion === 7
                        ? 'bg-green-600 text-white ring-2 ring-green-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-800'
                    }`}
                  >
                    ✓ Asistió
                  </button>
                  <button
                    onClick={() => setEstadoRecepcion(estadoRecepcion === 6 ? null : 6)}
                    className={`py-3 px-4 rounded-lg font-bold transition-all ring-offset-1 ${
                      estadoRecepcion === 6
                        ? 'bg-orange-600 text-white ring-2 ring-orange-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-800'
                    }`}
                  >
                    ◆ Sesión Dictada
                  </button>
                </div>
                {estadoRecepcion === null && (
                  <p className="mt-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                    Sin marcar — se guardará como pendiente
                  </p>
                )}
              </div>

              {/* Estado de Terapeuta */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Estado de Terapeuta
                </label>
                <p className="text-xs text-gray-500 mb-3">Haz clic en la opción seleccionada para desmarcarla</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setEstadoTerapeuta(estadoTerapeuta === 7 ? null : 7)}
                    className={`py-3 px-4 rounded-lg font-bold transition-all ring-offset-1 ${
                      estadoTerapeuta === 7
                        ? 'bg-green-600 text-white ring-2 ring-green-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-800'
                    }`}
                  >
                    ✓ Asistió
                  </button>
                  <button
                    onClick={() => setEstadoTerapeuta(estadoTerapeuta === 6 ? null : 6)}
                    className={`py-3 px-4 rounded-lg font-bold transition-all ring-offset-1 ${
                      estadoTerapeuta === 6
                        ? 'bg-orange-600 text-white ring-2 ring-orange-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-800'
                    }`}
                  >
                    ◆ Sesión Dictada
                  </button>
                </div>
                {estadoTerapeuta === null && (
                  <p className="mt-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                    Sin marcar — se guardará como pendiente
                  </p>
                )}
              </div>

              {/* Advertencia */}
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-bold">⚠️ Advertencia:</span> Esta acción sobrescribirá los estados marcados por admisión y terapeuta.
                </p>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3">
                <button
                  onClick={cerrarModal}
                  disabled={guardando}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarCambios}
                  disabled={guardando}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inconsistencias;