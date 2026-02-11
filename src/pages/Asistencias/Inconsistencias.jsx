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
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { obtenerInconsistenciasAsistencia } from '../../services/api';
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

  useEffect(() => {
    // Establecer fechas por defecto (semana actual: lunes a sábado)
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

    // Calcular el lunes de esta semana
    const lunes = new Date(hoy);
    const diasDesdeElLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    lunes.setDate(hoy.getDate() - diasDesdeElLunes);

    // Calcular el sábado de esta semana
    const sabado = new Date(lunes);
    sabado.setDate(lunes.getDate() + 5);

    // Formatear fechas
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

  // Cargar lista de terapeutas
  const cargarTerapeutas = async () => {
    try {
      const response = await getTrabajadores();
      console.log('📋 Respuesta de getTrabajadores:', response);

      if (!response || response.length === 0) {
        console.warn('⚠️ No se encontraron trabajadores');
        return;
      }

      // Verificar qué campos tienen los trabajadores
      console.log('📊 Ejemplo completo de UN trabajador:', response[0]);
      console.log('🔍 Rol del trabajador:', response[0].rol);

      // Filtrar trabajadores activos (estado es booleano true)
      // Y filtrar solo terapeutas (rol.id === 4)
      const trabajadoresActivos = response
        .filter(t => {
          const esActivo = t.estado === true || t.estado === 1;
          const esTerapeuta = t.rol && t.rol.id === 4;
          return esActivo && esTerapeuta;
        })
        .sort((a, b) => {
          const nombreA = a.nombres || '';
          const nombreB = b.nombres || '';
          return nombreA.localeCompare(nombreB);
        });

      console.log('✅ Terapeutas activos cargados:', trabajadoresActivos.length);

      // Si no hay terapeutas, mostrar todos los activos
      if (trabajadoresActivos.length === 0) {
        console.warn('⚠️ No hay terapeutas con rol.id=4, mostrando todos los trabajadores activos');
        const todosActivos = response
          .filter(t => t.estado === true || t.estado === 1)
          .sort((a, b) => {
            const nombreA = a.nombres || '';
            const nombreB = b.nombres || '';
            return nombreA.localeCompare(nombreB);
          });
        setTerapeutas(todosActivos);
      } else {
        setTerapeutas(trabajadoresActivos);
      }
    } catch (error) {
      console.error('❌ Error al cargar terapeutas:', error);
    }
  };

  // Buscar pacientes con autocomplete
  const handleBuscarPaciente = async (query) => {
    setBusquedaPaciente(query);
    console.log('🔎 Buscando paciente:', query);

    if (query.length >= 2) {
      try {
        const resultados = await buscarPacientes(query);
        console.log('✅ Pacientes encontrados:', resultados);
        console.log('📝 Total de pacientes:', resultados.length);
        if (resultados.length > 0) {
          console.log('🔍 Estructura del primer paciente:', resultados[0]);
          console.log('🔍 Claves del paciente:', Object.keys(resultados[0]));
        }
        setPacientesSugerencias(resultados);
        setMostrarSugerencias(true);
        console.log('👁️ Mostrando sugerencias: true');
      } catch (error) {
        console.error('❌ Error al buscar pacientes:', error);
        setPacientesSugerencias([]);
      }
    } else {
      setPacientesSugerencias([]);
      setMostrarSugerencias(false);
    }
  };

  // Seleccionar un paciente de las sugerencias
  const seleccionarPaciente = (paciente) => {
    const nombreCompleto = paciente.nombre_completo || '';
    setBusquedaPaciente(nombreCompleto);
    setFiltros(prev => ({ ...prev, paciente: nombreCompleto }));
    setMostrarSugerencias(false);
  };

  // Monitorear cambios en sugerencias de pacientes
  useEffect(() => {
    console.log('🔄 Estado actualizado - mostrarSugerencias:', mostrarSugerencias);
    console.log('🔄 Estado actualizado - pacientesSugerencias:', pacientesSugerencias.length);
  }, [mostrarSugerencias, pacientesSugerencias]);

  // Aplicar filtros cuando cambien los filtros o las inconsistencias
  useEffect(() => {
    if (inconsistencias.length > 0) {
      aplicarFiltros();
    }
  }, [filtros, inconsistencias]);

  const cargarInconsistencias = async (inicio, fin) => {
    if (!inicio || !fin) {
      alert('Seleccione un rango de fechas');
      return;
    }

    setCargando(true);
    try {
      const data = await obtenerInconsistenciasAsistencia(inicio || fechaInicio, fin || fechaFin);
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

    // Filtro por terapeuta (ahora es un ID)
    if (filtros.terapeuta) {
      const terapeutaSeleccionado = terapeutas.find(t => t.id === parseInt(filtros.terapeuta));
      if (terapeutaSeleccionado) {
        const nombreTerapeuta = `${terapeutaSeleccionado.nombres} ${terapeutaSeleccionado.apellidos}`.trim();
        resultados = resultados.filter(item =>
          item.terapeuta_nombre?.toLowerCase().includes(nombreTerapeuta.toLowerCase())
        );
      }
    }

    // Filtro por paciente
    if (filtros.paciente) {
      resultados = resultados.filter(item => 
        item.paciente_nombre?.toLowerCase().includes(filtros.paciente.toLowerCase())
      );
    }

    // Filtro por tipo de inconsistencia
    if (filtros.tipoInconsistencia) {
      resultados = resultados.filter(item => 
        item.tipo_inconsistencia === filtros.tipoInconsistencia
      );
    }

    // Filtro por estado recepción
    if (filtros.estadoRecepcion !== '') {
      if (filtros.estadoRecepcion === '0') {
        resultados = resultados.filter(item => item.recepcion_marco === 0);
      } else if (filtros.estadoRecepcion === '7') {
        resultados = resultados.filter(item => item.recepcion_estado_id === 7);
      } else if (filtros.estadoRecepcion === '6') {
        resultados = resultados.filter(item => item.recepcion_estado_id === 6);
      }
    }

    // Filtro por estado terapeuta
    if (filtros.estadoTerapeuta !== '') {
      if (filtros.estadoTerapeuta === '0') {
        resultados = resultados.filter(item => item.terapeuta_marco === 0);
      } else if (filtros.estadoTerapeuta === '7') {
        resultados = resultados.filter(item => item.terapeuta_estado_id === 7);
      } else if (filtros.estadoTerapeuta === '6') {
        resultados = resultados.filter(item => item.terapeuta_estado_id === 6);
      }
    }

    setInconsistenciasFiltradas(resultados);
    setPage(0); // Resetear a la primera página
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

  // Extraer tipos de inconsistencia únicos para el select
  const tiposInconsistencia = useMemo(() => {
    return [...new Set(inconsistencias.map(item => item.tipo_inconsistencia).filter(Boolean))].sort();
  }, [inconsistencias]);

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  };

  const formatearFechaSimple = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const exportarAExcel = () => {
    if (inconsistenciasFiltradas.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Preparar datos para el Excel
    const datosExcel = inconsistenciasFiltradas.map((item, index) => ({
      'N°': index + 1,
      'ID Cita': item.cita_id,
      'Paciente': item.paciente_nombre || 'N/A',
      'Terapeuta': item.terapeuta_nombre || 'N/A',
      'Fecha Cita': item.fecha_cita ? formatearFecha(item.fecha_cita) : 'N/A',
      'Estado Recepción': item.recepcion_marco
        ? `${getEstadoTexto(item.recepcion_estado_id)} - ${item.recepcion_fecha ? formatearFecha(item.recepcion_fecha) : ''}`
        : 'Sin marcar',
      'Estado Terapeuta': item.terapeuta_marco
        ? `${getEstadoTexto(item.terapeuta_estado_id)} - ${item.terapeuta_fecha ? formatearFecha(item.terapeuta_fecha) : ''}`
        : 'Sin marcar',
      'Tipo de Inconsistencia': item.tipo_inconsistencia
    }));

    // Crear workbook
    const wb = XLSX.utils.book_new();

    // Crear hoja con encabezado
    const ws = XLSX.utils.aoa_to_sheet([]);

    // Agregar título y encabezado
    XLSX.utils.sheet_add_aoa(ws, [
      ['CENTRO CRECEMOS'],
      ['REPORTE DE INCONSISTENCIAS DE ASISTENCIA'],
      [''],
      [`Período: ${formatearFechaSimple(fechaInicio)} - ${formatearFechaSimple(fechaFin)}`],
      [`Fecha de generación: ${formatearFechaSimple(new Date())}`],
      [`Total de inconsistencias: ${inconsistenciasFiltradas.length}`],
      [''],
    ], { origin: 'A1' });

    // Agregar datos
    XLSX.utils.sheet_add_json(ws, datosExcel, { origin: 'A8' });

    // Ajustar anchos de columna
    const colWidths = [
      { wch: 8 },  // N°
      { wch: 12 }, // ID Cita
      { wch: 35 }, // Paciente
      { wch: 35 }, // Terapeuta
      { wch: 22 }, // Fecha Cita
      { wch: 40 }, // Estado Recepción
      { wch: 40 }, // Estado Terapeuta
      { wch: 45 }, // Tipo de Inconsistencia
    ];
    ws['!cols'] = colWidths;

    // Merge cells para el título
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // CENTRO CRECEMOS
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }, // REPORTE DE...
    ];

    // Definir bordes completos
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

    // Estilos modernos
    const estiloTitulo = {
      font: { bold: true, sz: 18, color: { rgb: "1F2937" }, name: "Calibri" },
      fill: { fgColor: { rgb: "F3F4F6" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: borderThick
    };

    const estiloSubtitulo = {
      font: { bold: true, sz: 14, color: { rgb: "374151" }, name: "Calibri" },
      fill: { fgColor: { rgb: "E5E7EB" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: borderFull
    };

    const estiloInfo = {
      font: { bold: false, sz: 11, color: { rgb: "4B5563" }, name: "Calibri" },
      alignment: { horizontal: "left", vertical: "center" },
      fill: { fgColor: { rgb: "FFFFFF" } }
    };

    const estiloEncabezado = {
      font: { bold: true, sz: 11, color: { rgb: "FFFFFF" }, name: "Calibri" },
      fill: { fgColor: { rgb: "059669" } }, // Verde moderno
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: borderFull
    };

    const estiloCeldaNumero = {
      font: { sz: 10, bold: true, color: { rgb: "1F2937" }, name: "Calibri" },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "DBEAFE" } }, // Azul claro
      border: borderFull
    };

    const estiloCeldaPar = {
      font: { sz: 10, color: { rgb: "1F2937" }, name: "Calibri" },
      alignment: { horizontal: "left", vertical: "center", wrapText: true },
      fill: { fgColor: { rgb: "FFFFFF" } },
      border: borderFull
    };

    const estiloCeldaImpar = {
      font: { sz: 10, color: { rgb: "1F2937" }, name: "Calibri" },
      alignment: { horizontal: "left", vertical: "center", wrapText: true },
      fill: { fgColor: { rgb: "F9FAFB" } },
      border: borderFull
    };

    // Aplicar estilos al título
    ws['A1'].s = estiloTitulo;
    ws['A2'].s = estiloSubtitulo;

    // Aplicar estilos a la información del reporte
    ws['A4'].s = estiloInfo;
    ws['A5'].s = estiloInfo;
    ws['A6'].s = estiloInfo;

    // Aplicar estilos a los encabezados de columna (fila 8)
    const encabezados = ['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8'];
    encabezados.forEach(celda => {
      if (ws[celda]) ws[celda].s = estiloEncabezado;
    });

    // Aplicar estilos a las celdas de datos
    const totalFilas = inconsistenciasFiltradas.length;
    for (let i = 0; i < totalFilas; i++) {
      const fila = 9 + i;
      const esFilaPar = i % 2 === 0;

      // Columna N° con estilo especial
      if (ws[`A${fila}`]) {
        ws[`A${fila}`].s = estiloCeldaNumero;
      }

      // Resto de columnas con alternancia de colores
      ['B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach(col => {
        if (ws[`${col}${fila}`]) {
          ws[`${col}${fila}`].s = esFilaPar ? estiloCeldaPar : estiloCeldaImpar;
        }
      });
    }

    // Ajustar altura de filas
    const rowHeights = [
      { hpt: 30 }, // Fila 1: Título
      { hpt: 25 }, // Fila 2: Subtítulo
      { hpt: 12 }, // Fila 3: Espacio
      { hpt: 18 }, // Fila 4: Período
      { hpt: 18 }, // Fila 5: Fecha generación
      { hpt: 18 }, // Fila 6: Total
      { hpt: 12 }, // Fila 7: Espacio
      { hpt: 40 }, // Fila 8: Encabezados
    ];

    // Agregar altura para las filas de datos
    for (let i = 0; i < totalFilas; i++) {
      rowHeights.push({ hpt: 25 }); // Filas de datos
    }

    ws['!rows'] = rowHeights;

    // Agregar hoja al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Inconsistencias');

    // Generar nombre de archivo
    const nombreArchivo = `Reporte_Inconsistencias_${fechaInicio}_${fechaFin}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(wb, nombreArchivo);
  };

  const getEstadoTexto = (estadoId) => {
    switch (estadoId) {
      case 7:
        return 'Asistió';
      case 6:
        return 'Sesión Dictada';
      default:
        return 'Desconocido';
    }
  };

  const getColorByTipo = (tipo) => {
    if (tipo === 'Ninguno marcó asistencia') {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (tipo === 'Falta registro de admisión' || tipo === 'Falta registro del terapeuta') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else if (tipo && tipo.startsWith('Estados no coinciden')) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Datos para mostrar (con paginación)
  const datosMostrados = inconsistenciasFiltradas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.ceil(inconsistenciasFiltradas.length / rowsPerPage);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <ExclamationTriangleIcon className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inconsistencias de Asistencia</h1>
            <p className="text-gray-600">Revise las discrepancias entre recepción y terapeuta</p>
          </div>
        </div>
      </div>

      {/* Filtros Rápidos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => aplicarFiltroRapido(1)}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={() => aplicarFiltroRapido(7)}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Última semana
          </button>
          <button
            onClick={() => aplicarFiltroRapido(30)}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Último mes
          </button>
          <div className="flex-1"></div>
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
          {/* Fecha Inicio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Botón Buscar */}
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
                  <UserIcon className="w-4 h-4 inline mr-1" />
                  Terapeuta
                </label>
                <select
                  value={filtros.terapeuta}
                  onChange={(e) => setFiltros(prev => ({ ...prev, terapeuta: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Todos los terapeutas</option>
                  {terapeutas.map((terapeuta) => (
                    <option key={terapeuta.id} value={terapeuta.id}>
                      {terapeuta.nombres} {terapeuta.apellidos}
                    </option>
                  ))}
                </select>
              </div>

              {/* Paciente */}
              <div style={{ position: 'relative', zIndex: mostrarSugerencias ? 100 : 1 }}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <UsersIcon className="w-4 h-4 inline mr-1" />
                  Paciente
                </label>
                <input
                  type="text"
                  placeholder="Buscar paciente (min. 2 caracteres)..."
                  value={busquedaPaciente}
                  onChange={(e) => handleBuscarPaciente(e.target.value)}
                  onFocus={() => {
                    if (pacientesSugerencias.length > 0) setMostrarSugerencias(true);
                  }}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {mostrarSugerencias && pacientesSugerencias.length > 0 && (
                  <>
                    <div
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999,
                        background: 'transparent'
                      }}
                      onClick={() => setMostrarSugerencias(false)}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        marginTop: '4px',
                        backgroundColor: 'white',
                        border: '2px solid #ef4444',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                        maxHeight: '240px',
                        overflowY: 'auto',
                        zIndex: 1000
                      }}
                    >
                      {pacientesSugerencias.map((paciente) => (
                        <button
                          key={paciente.id}
                          type="button"
                          onClick={() => seleccionarPaciente(paciente)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            textAlign: 'left',
                            border: 'none',
                            borderBottom: '1px solid #e5e7eb',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            display: 'block'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <div style={{ fontWeight: 500, color: '#111827' }}>
                            {paciente.nombre_completo}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Tipo de Inconsistencia */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Inconsistencia
                </label>
                <select
                  value={filtros.tipoInconsistencia}
                  onChange={(e) => setFiltros(prev => ({ ...prev, tipoInconsistencia: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Todos los tipos</option>
                  {tiposInconsistencia.map((tipo, index) => (
                    <option key={index} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              {/* Estado Recepción */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estado Recepción
                </label>
                <select
                  value={filtros.estadoRecepcion}
                  onChange={(e) => setFiltros(prev => ({ ...prev, estadoRecepcion: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="0">No marcado</option>
                  <option value="7">Asistió</option>
                  <option value="6">Sesión Dictada</option>
                </select>
              </div>

              {/* Estado Terapeuta */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estado Terapeuta
                </label>
                <select
                  value={filtros.estadoTerapeuta}
                  onChange={(e) => setFiltros(prev => ({ ...prev, estadoTerapeuta: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="0">No marcado</option>
                  <option value="7">Asistió</option>
                  <option value="6">Sesión Dictada</option>
                </select>
              </div>
            </div>

            {/* Botones de acción filtros */}
            <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={limpiarFiltros}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Limpiar Filtros
                </button>
                <button
                  onClick={() => aplicarFiltros()}
                  className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                >
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  Aplicar
                </button>
              </div>

            {/* Resumen de filtros activos */}
            {(filtros.terapeuta || filtros.paciente || filtros.tipoInconsistencia || filtros.estadoRecepcion || filtros.estadoTerapeuta) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FunnelIcon className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-semibold text-red-700">Filtros aplicados:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filtros.terapeuta && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Terapeuta: {(() => {
                        const t = terapeutas.find(ter => ter.id === parseInt(filtros.terapeuta));
                        return t ? `${t.nombres} ${t.apellidos}` : filtros.terapeuta;
                      })()}
                      <button onClick={() => setFiltros(prev => ({ ...prev, terapeuta: '' }))}>
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filtros.paciente && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Paciente: {filtros.paciente}
                      <button onClick={() => {
                        setFiltros(prev => ({ ...prev, paciente: '' }));
                        setBusquedaPaciente('');
                      }}>
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filtros.tipoInconsistencia && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Tipo: {filtros.tipoInconsistencia}
                      <button onClick={() => setFiltros(prev => ({ ...prev, tipoInconsistencia: '' }))}>
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filtros.estadoRecepcion && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Recepción: {filtros.estadoRecepcion === '0' ? 'No marcado' : filtros.estadoRecepcion === '7' ? 'Asistió' : 'Sesión Dictada'}
                      <button onClick={() => setFiltros(prev => ({ ...prev, estadoRecepcion: '' }))}>
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filtros.estadoTerapeuta && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Terapeuta: {filtros.estadoTerapeuta === '0' ? 'No marcado' : filtros.estadoTerapeuta === '7' ? 'Asistió' : 'Sesión Dictada'}
                      <button onClick={() => setFiltros(prev => ({ ...prev, estadoTerapeuta: '' }))}>
                        <XMarkIcon className="w-3 h-3" />
                      </button>
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
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900 mb-1">{inconsistenciasFiltradas.length}</div>
            <div className="text-sm text-gray-600">Total Filtrado</div>
            <div className="text-xs text-gray-500 mt-1">
              {inconsistencias.length} totales
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-900 mb-1">
              {inconsistenciasFiltradas.filter(i => i.tipo_inconsistencia === 'Ninguno marcó asistencia').length}
            </div>
            <div className="text-sm text-gray-600">Ninguno marcó</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-yellow-900 mb-1">
              {inconsistenciasFiltradas.filter(i => 
                i.tipo_inconsistencia === 'Falta registro de admisión' || 
                i.tipo_inconsistencia === 'Falta registro del terapeuta'
              ).length}
            </div>
            <div className="text-sm text-gray-600">Faltan registros</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-orange-900 mb-1">
              {inconsistenciasFiltradas.filter(i => 
                i.tipo_inconsistencia && i.tipo_inconsistencia.startsWith('Estados no coinciden')
              ).length}
            </div>
            <div className="text-sm text-gray-600">Estados diferentes</div>
          </div>
        </div>
      )}

      {/* Botón de exportar */}
      {!cargando && inconsistenciasFiltradas.length > 0 && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={exportarAExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-sm"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Exportar a Excel
          </button>
        </div>
      )}

      {/* Tabla de Inconsistencias */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Cita ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Paciente</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Terapeuta</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Fecha Cita</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Recepción Marcó</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Terapeuta Marcó</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Tipo de Inconsistencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cargando ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
                      <span className="text-gray-600">Cargando inconsistencias...</span>
                    </div>
                  </td>
                </tr>
              ) : datosMostrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <ShieldCheckIcon className="w-16 h-16 text-green-400 mx-auto mb-3" />
                    <p className="text-green-700 text-lg font-semibold">¡Excelente!</p>
                    <p className="text-gray-500">No se encontraron inconsistencias con los filtros aplicados</p>
                  </td>
                </tr>
              ) : (
                datosMostrados.map((item) => (
                  <tr key={item.id} className="hover:bg-red-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      #{item.cita_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.paciente_nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.terapeuta_nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.fecha_cita ? formatearFecha(item.fecha_cita) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {item.recepcion_marco ? (
                        <>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.recepcion_estado_id === 7
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {getEstadoTexto(item.recepcion_estado_id)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.recepcion_fecha ? formatearFecha(item.recepcion_fecha) : ''}
                          </p>
                        </>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                          Sin marcar
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.terapeuta_marco ? (
                        <>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.terapeuta_estado_id === 7
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {getEstadoTexto(item.terapeuta_estado_id)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.terapeuta_fecha ? formatearFecha(item.terapeuta_fecha) : ''}
                          </p>
                        </>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                          Sin marcar
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getColorByTipo(item.tipo_inconsistencia)}`}>
                        <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs font-bold">
                          {item.tipo_inconsistencia}
                        </span>
                      </div>
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
                <button
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  Primero
                </button>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  Anterior
                </button>

                <div className="flex gap-1">
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
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          page === pageNum
                            ? 'bg-red-600 text-white'
                            : 'hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  Siguiente
                </button>
                <button
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  Último
                </button>
              </div>

              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value));
                  setPage(0);
                }}
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
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-700"><strong>Ninguno marcó asistencia:</strong> Ni admisión ni terapeuta registraron después de 24 horas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-700"><strong>Falta registro de admisión:</strong> Solo el terapeuta marcó, falta que admisión registre</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-700"><strong>Falta registro del terapeuta:</strong> Solo admisión marcó, falta que el terapeuta registre</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-700"><strong>Estados no coinciden:</strong> Ambos marcaron pero con estados diferentes (Ej: Admisión: Asistió, Terapeuta: Sesión Dictada)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inconsistencias;