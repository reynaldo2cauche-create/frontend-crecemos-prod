import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon, ArrowDownTrayIcon, ChevronDownIcon, ChevronRightIcon,
  CalendarDaysIcon, ChartBarIcon, UserIcon, ExclamationTriangleIcon,
  CheckCircleIcon, ClockIcon, BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import XLSXStyle from 'xlsx-js-style';
import { listarTareas } from '../../services/centroOperativoService';
import api from '../../services/api';

// ─── Constantes ───────────────────────────────────────────────────────────────

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function estaCompletada(t) { return t.columna?.es_final === true; }

function estaVencida(t) {
  if (!t.fecha_limite) return false;
  if (t.columna?.es_final) return false;
  return new Date(t.fecha_limite) < new Date();
}

function tareasDeTrabajador(tareas, usuarioId) {
  return tareas.filter(t =>
    // eslint-disable-next-line eqeqeq
    t.asignaciones?.some(a => a.usuario_id == usuarioId)
  );
}

function filtrarPorMes(tareas, mes, anio) {
  return tareas.filter(t => {
    const fecha = t.fecha_limite || t.created_at;
    if (!fecha) return false;
    const d = new Date(fecha);
    return d.getMonth() + 1 === mes && d.getFullYear() === anio;
  });
}

function filtrarPorDia(tareas, fechaStr) {
  if (!fechaStr) return [];
  const [y, m, d] = fechaStr.split('-').map(Number);
  const dia = new Date(y, m - 1, d);
  const diaSig = new Date(y, m - 1, d + 1);
  return tareas.filter(t => {
    if (!t.fecha_limite) return false;
    const fl = new Date(t.fecha_limite);
    return fl >= dia && fl < diaSig;
  });
}

function calcularSemaforo(tareasW) {
  if (tareasW.length === 0) return 'gris';
  if (tareasW.some(estaVencida)) return 'rojo';
  if (tareasW.some(t => !estaCompletada(t))) return 'amarillo';
  return 'verde';
}

function nombreTrabajador(u) {
  return u.nombre_completo || `${u.nombres || ''} ${u.apellidos || ''}`.trim() || `Usuario #${u.id}`;
}

function fmtFechaCorta(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ahora() {
  return new Date().toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Semáforo config ─────────────────────────────────────────────────────────

const SEM = {
  verde:    { bg: 'bg-green-50',  border: 'border-green-200', dot: 'bg-green-500',  text: 'text-green-700',  label: 'Al día',         xlsx: '2E7D32' },
  amarillo: { bg: 'bg-amber-50',  border: 'border-amber-200', dot: 'bg-amber-400',  text: 'text-amber-700',  label: 'En progreso',    xlsx: 'E65100' },
  rojo:     { bg: 'bg-red-50',    border: 'border-red-200',   dot: 'bg-red-500',    text: 'text-red-700',    label: 'Tiene vencidas', xlsx: 'C62828' },
  gris:     { bg: 'bg-gray-50',   border: 'border-gray-200',  dot: 'bg-gray-300',   text: 'text-gray-500',   label: 'Sin tareas',     xlsx: '757575' },
};

// ─── Excel ────────────────────────────────────────────────────────────────────

const P = {
  PURPLE: '5C1E8A', PURPLE2: '7B1FA2', PURPLE_LT: 'F3E5F5',
  WHITE: 'FFFFFF', GRAY1: 'FAFAFA', GRAY2: 'F0F0F0', GRAY3: 'BDBDBD',
  GREEN: '2E7D32', GREEN_LT: 'E8F5E9',
  AMBER: 'E65100', AMBER_LT: 'FFF3E0',
  RED: 'C62828', RED_LT: 'FFEBEE',
};

const borde = (c = P.GRAY3) => ({
  top: { style: 'thin', color: { rgb: c } }, bottom: { style: 'thin', color: { rgb: c } },
  left: { style: 'thin', color: { rgb: c } }, right: { style: 'thin', color: { rgb: c } },
});

const S = {
  titulo:   { font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: P.WHITE } }, fill: { fgColor: { rgb: P.PURPLE } }, alignment: { horizontal: 'center', vertical: 'center' }, border: borde(P.PURPLE) },
  subtitulo:{ font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: P.WHITE } }, fill: { fgColor: { rgb: P.PURPLE2 } }, alignment: { horizontal: 'left', vertical: 'center' }, border: borde(P.PURPLE2) },
  meta:     { font: { name: 'Calibri', sz: 11, color: { rgb: P.GRAY3 } }, fill: { fgColor: { rgb: P.GRAY1 } }, alignment: { horizontal: 'left', vertical: 'center' }, border: borde(P.GRAY3) },
  metaVal:  { font: { name: 'Calibri', sz: 11, italic: true, color: { rgb: P.PURPLE2 } }, fill: { fgColor: { rgb: P.GRAY1 } }, alignment: { horizontal: 'left', vertical: 'center' }, border: borde(P.GRAY3) },
  th:       { font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: P.WHITE } }, fill: { fgColor: { rgb: P.PURPLE2 } }, alignment: { horizontal: 'center', vertical: 'center' }, border: borde(P.PURPLE2) },
  thL:      { font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: P.WHITE } }, fill: { fgColor: { rgb: P.PURPLE2 } }, alignment: { horizontal: 'left', vertical: 'center' }, border: borde(P.PURPLE2) },
  workerH:  (bg) => ({ font: { name: 'Calibri', sz: 12, bold: true, color: { rgb: P.WHITE } }, fill: { fgColor: { rgb: bg } }, alignment: { horizontal: 'left', vertical: 'center' }, border: borde(bg) }),
  num:      (bg) => ({ font: { name: 'Calibri', sz: 12, bold: true, color: { rgb: P.WHITE } }, fill: { fgColor: { rgb: bg } }, alignment: { horizontal: 'center', vertical: 'center' }, border: borde(bg) }),
  td:       { font: { name: 'Calibri', sz: 11, color: { rgb: '333333' } }, fill: { fgColor: { rgb: P.WHITE } }, alignment: { horizontal: 'left', vertical: 'center', wrapText: true }, border: borde() },
  tdC:      { font: { name: 'Calibri', sz: 11, color: { rgb: '333333' } }, fill: { fgColor: { rgb: P.WHITE } }, alignment: { horizontal: 'center', vertical: 'center' }, border: borde() },
  tdAlt:    { font: { name: 'Calibri', sz: 11, color: { rgb: '333333' } }, fill: { fgColor: { rgb: P.PURPLE_LT } }, alignment: { horizontal: 'left', vertical: 'center', wrapText: true }, border: borde() },
  tdAltC:   { font: { name: 'Calibri', sz: 11, color: { rgb: '333333' } }, fill: { fgColor: { rgb: P.PURPLE_LT } }, alignment: { horizontal: 'center', vertical: 'center' }, border: borde() },
  ok:       { font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: P.GREEN } }, fill: { fgColor: { rgb: P.GREEN_LT } }, alignment: { horizontal: 'center', vertical: 'center' }, border: borde(P.GREEN) },
  venc:     { font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: P.RED } }, fill: { fgColor: { rgb: P.RED_LT } }, alignment: { horizontal: 'center', vertical: 'center' }, border: borde(P.RED) },
  prog:     { font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: P.AMBER } }, fill: { fgColor: { rgb: P.AMBER_LT } }, alignment: { horizontal: 'center', vertical: 'center' }, border: borde(P.AMBER) },
};

const C = (v, s, t = 's') => ({ v, s, t });
const colLetter = (i) => {
  if (i < 26) return String.fromCharCode(65 + i);
  return String.fromCharCode(64 + Math.floor(i / 26)) + String.fromCharCode(65 + (i % 26));
};

function exportarExcel({ vista, label, trabajadores, tareasBase }) {
  const ws = {};
  const merges = [];
  const NCOLS = 7;

  // ── Cabecera ──
  ws['A1'] = C('CENTRO DE TERAPIAS CRECEMOS', S.titulo);
  for (let c = 1; c < NCOLS; c++) ws[`${colLetter(c)}1`] = C('', S.titulo);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: NCOLS - 1 } });

  ws['A2'] = C(`Reporte de Actividades — ${vista === 'mensual' ? 'Vista Mensual' : 'Vista Diaria'}`, S.subtitulo);
  for (let c = 1; c < NCOLS; c++) ws[`${colLetter(c)}2`] = C('', S.subtitulo);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: NCOLS - 1 } });

  ws['A3'] = C('Período:', S.meta);
  ws['B3'] = C(label, S.metaVal);
  for (let c = 2; c < NCOLS; c++) ws[`${colLetter(c)}3`] = C('', S.metaVal);
  merges.push({ s: { r: 2, c: 1 }, e: { r: 2, c: NCOLS - 1 } });

  ws['A4'] = C('Generado:', S.meta);
  ws['B4'] = C(ahora(), S.metaVal);
  for (let c = 2; c < NCOLS; c++) ws[`${colLetter(c)}4`] = C('', S.metaVal);
  merges.push({ s: { r: 3, c: 1 }, e: { r: 3, c: NCOLS - 1 } });

  // separador
  for (let c = 0; c < NCOLS; c++) ws[`${colLetter(c)}5`] = C('', { fill: { fgColor: { rgb: P.GRAY2 } } });

  // ── Encabezado tabla ──
  let row = 6;
  ws[`A${row}`] = C('Trabajador', S.thL);
  ws[`B${row}`] = C('Estado', S.th);
  ws[`C${row}`] = C('Completadas', S.th);
  ws[`D${row}`] = C('En progreso', S.th);
  ws[`E${row}`] = C('Vencidas', S.th);
  ws[`F${row}`] = C('Tarea', S.thL);
  ws[`G${row}`] = C('Vencimiento', S.th);

  row++;
  let taskRow = 0;
  trabajadores.forEach((u) => {
    const tw = tareasDeTrabajador(tareasBase, u.id);
    const sem = calcularSemaforo(tw);
    const semCfg = SEM[sem];
    const completadas = tw.filter(estaCompletada).length;
    const vencidas = tw.filter(estaVencida).length;
    const enProgreso = tw.filter(t => !estaCompletada(t) && !estaVencida(t)).length;
    const nombre = nombreTrabajador(u);
    const isAlt = taskRow % 2 !== 0;

    if (tw.length === 0) {
      ws[`A${row}`] = C(nombre, S.workerH(semCfg.xlsx));
      ws[`B${row}`] = C(semCfg.label, S.num(semCfg.xlsx));
      ws[`C${row}`] = C(completadas, S.num(semCfg.xlsx));
      ws[`D${row}`] = C(enProgreso, S.num(semCfg.xlsx));
      ws[`E${row}`] = C(vencidas, S.num(semCfg.xlsx));
      ws[`F${row}`] = C('Sin tareas en este período', isAlt ? S.tdAlt : S.td);
      ws[`G${row}`] = C('—', isAlt ? S.tdAltC : S.tdC);
      merges.push({ s: { r: row - 1, c: 0 }, e: { r: row - 1, c: 0 } });
      row++; taskRow++;
    } else {
      const startRow = row;
      tw.forEach((t, ti) => {
        const tAlt = (taskRow + ti) % 2 !== 0;
        const completada = estaCompletada(t);
        const vencida = estaVencida(t);
        const estadoTd = completada ? S.ok : vencida ? S.venc : S.prog;
        const estado = completada ? '✓ Completada' : vencida ? '⚠ Vencida' : '→ En progreso';

        if (ti === 0) {
          ws[`A${row}`] = C(nombre, S.workerH(semCfg.xlsx));
          ws[`B${row}`] = C(semCfg.label, S.num(semCfg.xlsx));
          ws[`C${row}`] = C(completadas, S.num(semCfg.xlsx));
          ws[`D${row}`] = C(enProgreso, S.num(semCfg.xlsx));
          ws[`E${row}`] = C(vencidas, S.num(semCfg.xlsx));
        } else {
          ws[`A${row}`] = C('', S.workerH(semCfg.xlsx));
          ws[`B${row}`] = C('', S.num(semCfg.xlsx));
          ws[`C${row}`] = C('', S.num(semCfg.xlsx));
          ws[`D${row}`] = C('', S.num(semCfg.xlsx));
          ws[`E${row}`] = C('', S.num(semCfg.xlsx));
        }
        ws[`F${row}`] = C(t.titulo, tAlt ? S.tdAlt : S.td);
        ws[`G${row}`] = C(fmtFechaCorta(t.fecha_limite), { ...(tAlt ? S.tdAltC : S.tdC), ...(vencida ? { font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: P.RED } } } : {}) });
        row++; taskRow++;
      });
      if (tw.length > 1) {
        merges.push({ s: { r: startRow - 1, c: 0 }, e: { r: row - 2, c: 0 } });
        merges.push({ s: { r: startRow - 1, c: 1 }, e: { r: row - 2, c: 1 } });
        merges.push({ s: { r: startRow - 1, c: 2 }, e: { r: row - 2, c: 2 } });
        merges.push({ s: { r: startRow - 1, c: 3 }, e: { r: row - 2, c: 3 } });
        merges.push({ s: { r: startRow - 1, c: 4 }, e: { r: row - 2, c: 4 } });
      }
    }
  });

  ws['!ref'] = `A1:${colLetter(NCOLS - 1)}${row - 1}`;
  ws['!merges'] = merges;
  ws['!cols'] = [
    { wch: 28 }, { wch: 16 }, { wch: 13 }, { wch: 13 }, { wch: 10 }, { wch: 40 }, { wch: 16 },
  ];
  ws['!rows'] = [
    { hpx: 44 }, { hpx: 32 }, { hpx: 22 }, { hpx: 22 }, { hpx: 8 }, { hpx: 28 },
    ...Array(row - 6).fill({ hpx: 28 }),
  ];

  const wb = XLSXStyle.utils.book_new();
  XLSXStyle.utils.book_append_sheet(wb, ws, 'Reporte Actividades');
  const buf = XLSXStyle.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Reporte_Actividades_${label.replace(/\s/g, '_')}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── WorkerCard ───────────────────────────────────────────────────────────────

function WorkerCard({ usuario, tareasW }) {
  const [expandido, setExpandido] = useState(false);
  const sem = calcularSemaforo(tareasW);
  const st = SEM[sem];
  const completadas = tareasW.filter(estaCompletada).length;
  const vencidas = tareasW.filter(estaVencida).length;
  const enProgreso = tareasW.filter(t => !estaCompletada(t) && !estaVencida(t)).length;
  const nombre = nombreTrabajador(usuario);

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm ${st.border}`}>
      <button
        onClick={() => tareasW.length > 0 && setExpandido(e => !e)}
        className={`w-full flex items-center gap-4 px-5 py-4 ${st.bg} transition-all ${tareasW.length > 0 ? 'hover:brightness-95 cursor-pointer' : 'cursor-default'}`}
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
          {nombre[0]?.toUpperCase() ?? '?'}
        </div>

        {/* Nombre + semáforo */}
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{nombre}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`} />
            <span className={`text-xs font-semibold ${st.text}`}>{st.label}</span>
          </div>
        </div>

        {/* Números */}
        <div className="flex items-center gap-5 flex-shrink-0">
          <div className="text-center">
            <p className="text-xl font-black text-green-600">{completadas}</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Listas</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-amber-500">{enProgreso}</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Progreso</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-red-500">{vencidas}</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Vencidas</p>
          </div>
          {tareasW.length > 0 && (
            <div className="w-5 flex-shrink-0">
              {expandido
                ? <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                : <ChevronRightIcon className="w-4 h-4 text-gray-400" />}
            </div>
          )}
        </div>
      </button>

      {/* Lista de tareas expandida */}
      {expandido && tareasW.length > 0 && (
        <div className="bg-white divide-y divide-gray-50">
          {tareasW.map(t => {
            const completada = estaCompletada(t);
            const vencida = estaVencida(t);
            return (
              <div key={t.id} className="flex items-center gap-3 px-5 py-2.5">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${completada ? 'bg-green-500' : vencida ? 'bg-red-500' : 'bg-amber-400'}`} />
                <span className="flex-1 text-sm text-gray-700 truncate min-w-0">{t.titulo}</span>
                {t.prioridad && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: t.prioridad.color + '22', color: t.prioridad.color }}>
                    {t.prioridad.nombre}
                  </span>
                )}
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: (t.columna?.color || '#888') + '22', color: t.columna?.color || '#888' }}>
                  {t.columna?.nombre || '—'}
                </span>
                {t.fecha_limite && (
                  <span className={`text-[10px] font-medium flex-shrink-0 ${vencida ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    {new Date(t.fecha_limite).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ReporteActividades() {
  const navigate = useNavigate();
  const hoy = new Date();

  const [vista, setVista] = useState('mensual');
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [fechaDia, setFechaDia] = useState(hoy.toISOString().slice(0, 10));

  const [tareas, setTareas] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    setCargando(true);
    Promise.all([
      listarTareas().catch(() => []),
      api.get('/trabajadores/select').then(r => r.data).catch(() => []),
    ]).then(([ts, ws]) => {
      setTareas(Array.isArray(ts) ? ts : []);
      setTrabajadores(Array.isArray(ws) ? ws : []);
      setCargando(false);
    });
  }, []);

  const tareasBase = vista === 'mensual'
    ? filtrarPorMes(tareas, mes, anio)
    : filtrarPorDia(tareas, fechaDia);

  const labelPeriodo = vista === 'mensual'
    ? `${MESES[mes - 1]} ${anio}`
    : new Date(fechaDia + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  // Estadísticas globales
  const totalCompletas = tareas.filter(estaCompletada).length;
  const totalVencidas = tareas.filter(estaVencida).length;
  const totalProgreso = tareas.filter(t => !estaCompletada(t) && !estaVencida(t)).length;
  const trabajadoresRojo = trabajadores.filter(u => calcularSemaforo(tareasDeTrabajador(tareasBase, u.id)) === 'rojo').length;

  const handleExportar = () => {
    setExportando(true);
    try {
      exportarExcel({ vista, label: labelPeriodo, trabajadores, tareasBase });
    } finally {
      setTimeout(() => setExportando(false), 800);
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen lg:min-h-[calc(100vh-56px)]">

      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 lg:px-8 pt-16 lg:pt-5 pb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/intranet/centro-operativo')}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0">
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <ChartBarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Reporte de Actividades</h1>
              <p className="text-xs text-gray-400 font-medium">Rendimiento del equipo · {labelPeriodo}</p>
            </div>
          </div>

          <button
            onClick={handleExportar}
            disabled={exportando || cargando}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50">
            <ArrowDownTrayIcon className="w-4 h-4" />
            {exportando ? 'Generando...' : 'Exportar Excel'}
          </button>
        </div>

        {/* Filtros */}
        <div className="px-4 lg:px-8 pb-4 flex items-center gap-3 flex-wrap">
          {/* Vista toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-0.5">
            <button onClick={() => setVista('mensual')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${vista === 'mensual' ? 'bg-white text-[#7B1FA2] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Mensual
            </button>
            <button onClick={() => setVista('diaria')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${vista === 'diaria' ? 'bg-white text-[#7B1FA2] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Diaria
            </button>
          </div>

          {/* Selector de fecha */}
          {vista === 'mensual' ? (
            <div className="flex items-center gap-2">
              <select value={mes} onChange={e => setMes(Number(e.target.value))}
                className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-[#7B1FA2] bg-white font-medium text-gray-700">
                {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
              <select value={anio} onChange={e => setAnio(Number(e.target.value))}
                className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-[#7B1FA2] bg-white font-medium text-gray-700">
                {[2024, 2025, 2026, 2027].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          ) : (
            <input type="date" value={fechaDia} onChange={e => setFechaDia(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-[#7B1FA2] bg-white font-medium text-gray-700" />
          )}
        </div>
      </div>

      {/* Stats globales */}
      {!cargando && (
        <div className="flex-shrink-0 px-4 lg:px-8 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Tareas del período', value: tareasBase.length, color: 'text-[#7B1FA2]', bg: 'bg-purple-50', border: 'border-purple-100' },
            { label: 'Completadas (total)', value: totalCompletas, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-100' },
            { label: 'En progreso', value: totalProgreso, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
            { label: 'Con vencidas', value: trabajadoresRojo, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100', sub: 'trabajadores' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} px-4 py-3 text-center`}>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Contenido */}
      <div className="flex-1 px-4 lg:px-8 pb-8 overflow-y-auto">
        {cargando ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-white rounded-2xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : trabajadores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <UserIcon className="w-12 h-12 text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm font-medium">No hay trabajadores registrados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Leyenda */}
            <div className="flex items-center gap-4 pb-1 flex-wrap">
              {Object.entries(SEM).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${v.dot}`} />
                  <span className="text-xs text-gray-500 font-medium">{v.label}</span>
                </div>
              ))}
              <span className="text-xs text-gray-400 ml-auto">Clic en un trabajador para ver sus tareas</span>
            </div>

            {/* Cards por trabajador */}
            {trabajadores.map(u => {
              const tw = tareasDeTrabajador(tareasBase, u.id);
              return <WorkerCard key={u.id} usuario={u} tareasW={tw} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
