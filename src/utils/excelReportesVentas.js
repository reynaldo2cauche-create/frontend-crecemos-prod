import XLSXStyle from 'xlsx-js-style';

// ─── Helpers de fecha ─────────────────────────────────────────────────────────
const parseFecha = (f) => {
  if (!f) return null;
  if (f instanceof Date) return isNaN(f) ? null : f;
  const m = String(f).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(f);
  return isNaN(d) ? null : d;
};

const fmtFecha = (f) => {
  const d = parseFecha(f);
  if (!d) return String(f ?? '').slice(0, 10) || '—';
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Parsea fecha sabiendo que el backend puede enviar YYYY-DD-MM en vez de YYYY-MM-DD.
const parseFechaVenta = (f, inicio, fin) => {
  if (!f) return null;
  const m = String(f).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const yr = +m[1], a = +m[2], b = +m[3];
    const normal  = new Date(yr, a - 1, b);
    const swapped = new Date(yr, b - 1, a);
    if (inicio && fin) {
      const inNormal  = !isNaN(normal)  && normal  >= inicio && normal  <= fin;
      const inSwapped = !isNaN(swapped) && swapped >= inicio && swapped <= fin;
      if (!inNormal && inSwapped) return swapped;
    }
    return isNaN(normal) ? (isNaN(swapped) ? null : swapped) : normal;
  }
  const d = new Date(f);
  return isNaN(d) ? null : d;
};

const fmtHora = (h) => {
  if (!h) return '—';
  const m = String(h).match(/^(\d{1,2}):(\d{2})/);
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : String(h);
};

const fmtMoneda = (v) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(v ?? 0);

const fmtPct = (v, t) => (t > 0 ? ((v / t) * 100).toFixed(1) + '%' : '0%');

const ahora = () =>
  new Date().toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

// ─── Colores ──────────────────────────────────────────────────────────────────
const P = {
  PURPLE:    '5C1E8A',
  PURPLE2:   '7B1FA2',
  PURPLE_LT: 'F3E5F5',
  WHITE:     'FFFFFF',
  GRAY1:     'FAFAFA',
  GRAY2:     'F0F0F0',
  GRAY3:     'BDBDBD',
  GRAY4:     '757575',
  GREEN:     '2E7D32',
  GREEN_LT:  'E8F5E9',
  AMBER:     'E65100',
  AMBER_LT:  'FFF8E1',
  RED:       'C62828',
  RED_LT:    'FFEBEE',
  BLUE:      '1565C0',
  BLUE_LT:   'E3F2FD',
};

// ─── Estilos base ─────────────────────────────────────────────────────────────
const borde = (c = P.GRAY3) => ({
  top:    { style: 'thin', color: { rgb: c } },
  bottom: { style: 'thin', color: { rgb: c } },
  left:   { style: 'thin', color: { rgb: c } },
  right:  { style: 'thin', color: { rgb: c } },
});

const S = {
  titulo: {
    font:      { name: 'Calibri', sz: 16, bold: true, color: { rgb: P.WHITE } },
    fill:      { fgColor: { rgb: P.PURPLE } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border:    borde(P.PURPLE),
  },
  seccion: {
    font:      { name: 'Calibri', sz: 13, bold: true, color: { rgb: P.WHITE } },
    fill:      { fgColor: { rgb: P.PURPLE2 } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border:    borde(P.PURPLE2),
  },
  filtroEtiq: {
    font:      { name: 'Calibri', sz: 13, bold: true, color: { rgb: P.GRAY4 } },
    fill:      { fgColor: { rgb: P.GRAY2 } },
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    borde(P.GRAY3),
  },
  filtroVal: {
    font:      { name: 'Calibri', sz: 13, italic: true, color: { rgb: P.PURPLE2 } },
    fill:      { fgColor: { rgb: P.GRAY1 } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border:    borde(P.GRAY3),
  },
  th: (bg = P.PURPLE2) => ({
    font:      { name: 'Calibri', sz: 13, bold: true, color: { rgb: P.WHITE } },
    fill:      { fgColor: { rgb: bg } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border:    borde(bg),
  }),
  thL: (bg = P.PURPLE2) => ({
    font:      { name: 'Calibri', sz: 13, bold: true, color: { rgb: P.WHITE } },
    fill:      { fgColor: { rgb: bg } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border:    borde(bg),
  }),
  tdPar:  (color = null) => ({
    font:      { name: 'Calibri', sz: 13, ...(color ? { color: { rgb: color } } : {}) },
    fill:      { fgColor: { rgb: P.WHITE } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border:    borde(),
  }),
  tdImpar: (color = null) => ({
    font:      { name: 'Calibri', sz: 13, ...(color ? { color: { rgb: color } } : {}) },
    fill:      { fgColor: { rgb: P.PURPLE_LT } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border:    borde(),
  }),
  tdParC:  (color = null) => ({
    font:      { name: 'Calibri', sz: 13, ...(color ? { color: { rgb: color } } : {}) },
    fill:      { fgColor: { rgb: P.WHITE } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border:    borde(),
  }),
  tdImparC: (color = null) => ({
    font:      { name: 'Calibri', sz: 13, ...(color ? { color: { rgb: color } } : {}) },
    fill:      { fgColor: { rgb: P.PURPLE_LT } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border:    borde(),
  }),
  tdParR:  (color = null) => ({
    font:      { name: 'Calibri', sz: 13, ...(color ? { color: { rgb: color } } : {}) },
    fill:      { fgColor: { rgb: P.WHITE } },
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    borde(),
  }),
  tdImparR: (color = null) => ({
    font:      { name: 'Calibri', sz: 13, ...(color ? { color: { rgb: color } } : {}) },
    fill:      { fgColor: { rgb: P.PURPLE_LT } },
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    borde(),
  }),
  total: (bg = P.PURPLE) => ({
    font:      { name: 'Calibri', sz: 13, bold: true, color: { rgb: P.WHITE } },
    fill:      { fgColor: { rgb: bg } },
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    borde(bg),
  }),
  totalL: (bg = P.PURPLE) => ({
    font:      { name: 'Calibri', sz: 13, bold: true, color: { rgb: P.WHITE } },
    fill:      { fgColor: { rgb: bg } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border:    borde(bg),
  }),
  totalC: (bg = P.PURPLE) => ({
    font:      { name: 'Calibri', sz: 13, bold: true, color: { rgb: P.WHITE } },
    fill:      { fgColor: { rgb: bg } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border:    borde(bg),
  }),
};

// ─── Celda ────────────────────────────────────────────────────────────────────
const C = (v, s, t = 's') => ({ v, s, t });

// ─── Columna letra ────────────────────────────────────────────────────────────
const col = (i) => {
  if (i < 26) return String.fromCharCode(65 + i);
  return String.fromCharCode(64 + Math.floor(i / 26)) + String.fromCharCode(65 + (i % 26));
};

// ─── Cabecera corporativa ─────────────────────────────────────────────────────
function cabecera(ws, merges, ncols, filtros, titulo) {
  const tipos = { general: 'General', productos: 'Productos', servicios: 'Servicios' };
  const tipo  = tipos[filtros.tipoReporte] || filtros.tipoReporte;

  ws['A1'] = C('CENTRO DE TERAPIAS CRECEMOS', S.titulo);
  for (let c = 1; c < ncols; c++) ws[`${col(c)}1`] = C('', S.titulo);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: ncols - 1 } });

  ws['A2'] = C(titulo, S.seccion);
  for (let c = 1; c < ncols; c++) ws[`${col(c)}2`] = C('', S.seccion);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: ncols - 1 } });

  const filas = [
    ['Período:', `${fmtFecha(filtros.fechaInicio)}  →  ${fmtFecha(filtros.fechaFin)}`],
    ['Tipo de reporte:', tipo],
    ['Generado:', ahora()],
  ];
  filas.forEach(([etiq, val], i) => {
    const r = 3 + i;
    ws[`A${r}`] = C(etiq, S.filtroEtiq);
    ws[`B${r}`] = C(val,  S.filtroVal);
    for (let c = 2; c < ncols; c++) ws[`${col(c)}${r}`] = C('', S.filtroVal);
    merges.push({ s: { r: r - 1, c: 1 }, e: { r: r - 1, c: ncols - 1 } });
  });

  for (let c = 0; c < ncols; c++) ws[`${col(c)}6`] = C('', { fill: { fgColor: { rgb: P.GRAY2 } } });

  return 7;
}

// ─── Altura de filas ──────────────────────────────────────────────────────────
// ROW_H: altura para filas de datos (px). Aumentado de 24 → 32.
const ROW_H = 32;

function rowHeights(lastRow) {
  return [
    { hpx: 44 }, // 1 título
    { hpx: 32 }, // 2 sección
    { hpx: 26 }, // 3 filtro
    { hpx: 26 }, // 4 filtro
    { hpx: 26 }, // 5 filtro
    { hpx: 8  }, // 6 separador
    ...Array(lastRow).fill({ hpx: ROW_H }),
  ];
}

// ─── Guardar ──────────────────────────────────────────────────────────────────
function guardar(ws, merges, ref, cols, nombre, lastDataRow) {
  ws['!ref']    = ref;
  ws['!merges'] = merges;
  ws['!cols']   = cols;
  ws['!rows']   = rowHeights(lastDataRow + 10);
  const wb = XLSXStyle.utils.book_new();
  XLSXStyle.utils.book_append_sheet(wb, ws, nombre.slice(0, 31));
  const buf = XLSXStyle.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${nombre}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. MÉTRICAS GENERALES
// ═══════════════════════════════════════════════════════════════════════════════
export function exportarMetricas(metricas, filtros) {
  const ws = {}; const merges = []; const NCOLS = 3;
  let r = cabecera(ws, merges, NCOLS, filtros, 'Métricas Generales del Período');

  ws[`A${r}`] = C('INDICADOR',   S.thL());
  ws[`B${r}`] = C('VALOR',       S.th());
  ws[`C${r}`] = C('DETALLE',     S.thL());
  r++;

  const kpis = [
    { label: 'Total de ventas',                valor: metricas.totalVentas ?? 0,               detalle: `Productos: ${metricas.ventasProductos ?? 0}   |   Servicios: ${metricas.ventasServicios ?? 0}`,  vColor: P.PURPLE2 },
    { label: 'Total de ingresos',               valor: fmtMoneda(metricas.totalIngresos),        detalle: `Ticket promedio: ${fmtMoneda(metricas.ticketPromedio)}`,                                          vColor: P.GREEN   },
    { label: 'Crecimiento vs período anterior', valor: `${(metricas.crecimiento ?? 0) > 0 ? '+' : ''}${metricas.crecimiento ?? 0}%`, detalle: 'Comparado con el período inmediatamente anterior',          vColor: P.BLUE    },
    { label: 'Sesiones vendidas',               valor: metricas.sesionesTotalesVendidas ?? 0,    detalle: `Usadas: ${metricas.sesionesUsadas ?? 0}   |   Pendientes: ${metricas.sesionesPendientes ?? 0}`,  vColor: P.AMBER   },
    { label: 'Sesiones pendientes sin cita',    valor: metricas.sesionesPendientes ?? 0,         detalle: 'Servicios vendidos que aún no tienen cita programada',                                             vColor: P.AMBER   },
    { label: 'Total descontado',                valor: fmtMoneda(metricas.totalDescuentos),      detalle: `Por promociones: ${fmtMoneda(metricas.totalDescuentosPromo)}`,                                    vColor: P.RED     },
  ];

  kpis.forEach(({ label, valor, detalle, vColor }, i) => {
    const par = i % 2 === 0;
    ws[`A${r}`] = C(label,   par ? S.tdPar()  : S.tdImpar());
    ws[`B${r}`] = C(valor,   { ...(par ? S.tdParC() : S.tdImparC()), font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: vColor } } });
    ws[`C${r}`] = C(detalle, { ...(par ? S.tdPar()  : S.tdImpar()),  font: { name: 'Calibri', sz: 13, color: { rgb: P.GRAY4 } } });
    r++;
  });

  guardar(ws, merges, `A1:C${r - 1}`,
    [{ wpx: 220 }, { wpx: 160 }, { wpx: 320 }],
    `Metricas_${filtros.fechaInicio}_${filtros.fechaFin}`, r);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. TENDENCIA DE VENTAS
// ═══════════════════════════════════════════════════════════════════════════════
export function exportarTendencia(ventasPorDia, filtros) {
  const ws = {}; const merges = []; const NCOLS = 5;
  let r = cabecera(ws, merges, NCOLS, filtros, 'Tendencia de Ventas por Día');

  ws[`A${r}`] = C('FECHA',           S.th());
  ws[`B${r}`] = C('N° VENTAS',       S.th());
  ws[`C${r}`] = C('INGRESOS (S/)',   S.th());
  ws[`D${r}`] = C('% DEL TOTAL',     S.th());
  ws[`E${r}`] = C('ACUMULADO (S/)',  S.th());
  r++;

  const inicio = parseFecha(filtros.fechaInicio);
  const fin    = parseFecha(filtros.fechaFin);

  const totalIng = ventasPorDia.reduce((s, d) => s + (d.ingresos || 0), 0);
  let acum = 0, sumV = 0, sumI = 0;

  ventasPorDia.forEach((d, i) => {
    const par = i % 2 === 0;
    acum += d.ingresos || 0;
    sumV += d.ventas   || 0;
    sumI += d.ingresos || 0;

    // Usar el campo fecha que ya viene del backend — igual que el gráfico en la UI.
    // parseFechaVenta maneja YYYY-MM-DD y el caso invertido YYYY-DD-MM.
    const fechaD   = parseFechaVenta(d.fecha, inicio, fin);
    const fechaStr = fechaD
      ? fechaD.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
      : String(d.fecha ?? '—').slice(0, 10);

    ws[`A${r}`] = C(fechaStr, par ? S.tdParC() : S.tdImparC());
    ws[`B${r}`] = C(d.ventas ?? 0,         { ...(par ? S.tdParC()  : S.tdImparC()), font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: P.PURPLE2 } } }, 'n');
    ws[`C${r}`] = C(fmtMoneda(d.ingresos), { ...(par ? S.tdParR()  : S.tdImparR()), font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: P.GREEN   } } });
    ws[`D${r}`] = C(fmtPct(d.ingresos || 0, totalIng), par ? S.tdParC() : S.tdImparC());
    ws[`E${r}`] = C(fmtMoneda(acum),        { ...(par ? S.tdParR()  : S.tdImparR()), font: { name: 'Calibri', sz: 13, color: { rgb: P.BLUE } } });
    r++;
  });

  ws[`A${r}`] = C('TOTAL',          S.totalL());
  ws[`B${r}`] = C(sumV,             S.totalC(), 'n');
  ws[`C${r}`] = C(fmtMoneda(sumI),  S.total());
  ws[`D${r}`] = C('100%',           S.totalC());
  ws[`E${r}`] = C(fmtMoneda(sumI),  S.total());

  guardar(ws, merges, `A1:E${r}`,
    [{ wpx: 90 }, { wpx: 80 }, { wpx: 130 }, { wpx: 90 }, { wpx: 130 }],
    `Tendencia_${filtros.fechaInicio}_${filtros.fechaFin}`, r);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. DISTRIBUCIÓN POR TIPO
// ═══════════════════════════════════════════════════════════════════════════════
export function exportarDistribucion(ventasPorCategoria, metricas, filtros) {
  const ws = {}; const merges = []; const NCOLS = 3;
  let r = cabecera(ws, merges, NCOLS, filtros, 'Distribución por Tipo de Venta');

  ws[`A${r}`] = C('TIPO DE VENTA', S.thL());
  ws[`B${r}`] = C('CANTIDAD',      S.th());
  ws[`C${r}`] = C('PARTICIPACIÓN', S.th());
  r++;

  const total   = ventasPorCategoria.reduce((s, v) => s + (v.valor || 0), 0);
  const accents = [P.PURPLE2, P.GREEN];
  const bgs     = [P.PURPLE_LT, P.GREEN_LT];

  ventasPorCategoria.forEach((v, i) => {
    ws[`A${r}`] = C(v.nombre,                     { ...S.tdPar(),  fill: { fgColor: { rgb: bgs[i % 2] } }, font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: accents[i % 2] } } });
    ws[`B${r}`] = C(v.valor ?? 0,                 { ...S.tdParC(), fill: { fgColor: { rgb: bgs[i % 2] } }, font: { name: 'Calibri', sz: 15, bold: true, color: { rgb: accents[i % 2] } } }, 'n');
    ws[`C${r}`] = C(fmtPct(v.valor || 0, total),  { ...S.tdParC(), fill: { fgColor: { rgb: bgs[i % 2] } }, font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: accents[i % 2] } } });
    r++;
  });

  ws[`A${r}`] = C('TOTAL',  S.totalL());
  ws[`B${r}`] = C(total,    S.totalC(), 'n');
  ws[`C${r}`] = C('100%',   S.totalC());

  guardar(ws, merges, `A1:C${r}`,
    [{ wpx: 160 }, { wpx: 100 }, { wpx: 120 }],
    `Distribucion_${filtros.fechaInicio}_${filtros.fechaFin}`, r);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. INGRESOS POR RESPONSABLE
// ═══════════════════════════════════════════════════════════════════════════════
export function exportarResponsables(ingresosPorResponsable, filtros) {
  const ws = {}; const merges = []; const NCOLS = 4;
  let r = cabecera(ws, merges, NCOLS, filtros, 'Ingresos por Responsable');

  ws[`A${r}`] = C('PUESTO',         S.th());
  ws[`B${r}`] = C('RESPONSABLE',    S.thL());
  ws[`C${r}`] = C('INGRESOS (S/)',  S.th());
  ws[`D${r}`] = C('PARTICIPACIÓN',  S.th());
  r++;

  const ordenados = [...ingresosPorResponsable].sort((a, b) => (b.ingresos || 0) - (a.ingresos || 0));
  const totalIng  = ordenados.reduce((s, v) => s + (v.ingresos || 0), 0);
  const medallas  = ['🥇 1°', '🥈 2°', '🥉 3°'];

  ordenados.forEach((v, i) => {
    const par    = i % 2 === 0;
    const puesto = i < 3 ? medallas[i] : `${i + 1}°`;
    ws[`A${r}`] = C(puesto,                       { ...(par ? S.tdParC()  : S.tdImparC()), font: { name: 'Calibri', sz: 13, bold: i < 3 } });
    ws[`B${r}`] = C(v.nombre || '—',              { ...(par ? S.tdPar()   : S.tdImpar()),  font: { name: 'Calibri', sz: 13, bold: i < 3 } });
    ws[`C${r}`] = C(fmtMoneda(v.ingresos ?? 0),   { ...(par ? S.tdParR()  : S.tdImparR()), font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: P.GREEN } } });
    ws[`D${r}`] = C(fmtPct(v.ingresos || 0, totalIng), par ? S.tdParC() : S.tdImparC());
    r++;
  });

  ws[`A${r}`] = C('',                  S.totalL());
  ws[`B${r}`] = C('TOTAL',             S.totalL());
  ws[`C${r}`] = C(fmtMoneda(totalIng), S.total());
  ws[`D${r}`] = C('100%',              S.totalC());

  guardar(ws, merges, `A1:D${r}`,
    [{ wpx: 70 }, { wpx: 200 }, { wpx: 140 }, { wpx: 110 }],
    `Ingresos_Responsable_${filtros.fechaInicio}_${filtros.fechaFin}`, r);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. TOP PRODUCTOS / SERVICIOS
// ═══════════════════════════════════════════════════════════════════════════════
export function exportarTopItems(topItems, filtros) {
  const ws = {}; const merges = []; const NCOLS = 5;
  let r = cabecera(ws, merges, NCOLS, filtros, 'Top Productos y Servicios más Vendidos');

  ws[`A${r}`] = C('PUESTO',              S.th());
  ws[`B${r}`] = C('PRODUCTO / SERVICIO', S.thL());
  ws[`C${r}`] = C('CANTIDAD',            S.th());
  ws[`D${r}`] = C('INGRESOS (S/)',       S.th());
  ws[`E${r}`] = C('TICKET PROMEDIO',     S.th());
  r++;

  const medallas = ['🥇 1°', '🥈 2°', '🥉 3°'];
  let totalC = 0, totalI = 0;

  topItems.forEach((item, i) => {
    const par    = i % 2 === 0;
    const puesto = i < 3 ? medallas[i] : `${i + 1}°`;
    const ticket = (item.cantidad || 0) > 0 ? fmtMoneda((item.ingresos || 0) / item.cantidad) : '—';
    totalC += item.cantidad || 0;
    totalI += item.ingresos || 0;
    ws[`A${r}`] = C(puesto,                        { ...(par ? S.tdParC()  : S.tdImparC()), font: { name: 'Calibri', sz: 13, bold: i < 3 } });
    ws[`B${r}`] = C(item.nombre || '—',            { ...(par ? S.tdPar()   : S.tdImpar()),  font: { name: 'Calibri', sz: 13, bold: i < 3 } });
    ws[`C${r}`] = C(item.cantidad ?? 0,            { ...(par ? S.tdParC()  : S.tdImparC()), font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: P.PURPLE2 } } }, 'n');
    ws[`D${r}`] = C(fmtMoneda(item.ingresos ?? 0), { ...(par ? S.tdParR()  : S.tdImparR()), font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: P.GREEN } } });
    ws[`E${r}`] = C(ticket,                         par ? S.tdParC() : S.tdImparC());
    r++;
  });

  ws[`A${r}`] = C('',               S.totalL());
  ws[`B${r}`] = C('TOTAL',          S.totalL());
  ws[`C${r}`] = C(totalC,           S.totalC(), 'n');
  ws[`D${r}`] = C(fmtMoneda(totalI), S.total());
  ws[`E${r}`] = C('',               S.totalC());

  guardar(ws, merges, `A1:E${r}`,
    [{ wpx: 65 }, { wpx: 240 }, { wpx: 90 }, { wpx: 140 }, { wpx: 130 }],
    `Top_Items_${filtros.fechaInicio}_${filtros.fechaFin}`, r);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. VENTAS SIN CITA
// ═══════════════════════════════════════════════════════════════════════════════
export function exportarVentasSinCita(ventasSinCita, filtros) {
  const ws = {}; const merges = []; const NCOLS = 5;
  let r = cabecera(ws, merges, NCOLS, filtros, 'Ventas sin Cita Agendada');

  const totalSes = ventasSinCita.reduce((s, row) => s + (row.sesiones_pendientes || 0), 0);
  const thA = S.th(P.AMBER);
  ws[`A${r}`] = C('FECHA',       thA);
  ws[`B${r}`] = C('COMPROBANTE', thA);
  ws[`C${r}`] = C('PACIENTE',    thA);
  ws[`D${r}`] = C('SERVICIO',    { ...thA, alignment: { horizontal: 'left', vertical: 'center' } });
  ws[`E${r}`] = C('SES. PEND.',  thA);
  r++;

  ventasSinCita.forEach((row, i) => {
    const par = i % 2 === 0;
    const bg  = par ? P.WHITE : P.AMBER_LT;
    const td  = (al = 'left') => ({ font: { name: 'Calibri', sz: 13 }, fill: { fgColor: { rgb: bg } }, alignment: { horizontal: al, vertical: 'center' }, border: borde() });
    ws[`A${r}`] = C(fmtFecha(row.fecha_venta),                              td('center'));
    ws[`B${r}`] = C(row.codigo_comprobante || '—',                          { ...td('center'), font: { name: 'Courier New', sz: 11 } });
    ws[`C${r}`] = C(row.paciente || '—',                                    { ...td(), font: { name: 'Calibri', sz: 13, bold: true } });
    ws[`D${r}`] = C(row.descripcion_linea || row.motivo_cita || '—',        td());
    ws[`E${r}`] = C(row.sesiones_pendientes ?? 0,                           { ...td('center'), font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: P.AMBER } } }, 'n');
    r++;
  });

  const totAmbar = { font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: P.WHITE } }, fill: { fgColor: { rgb: P.AMBER } }, alignment: { horizontal: 'left', vertical: 'center' }, border: borde(P.AMBER) };
  ws[`A${r}`] = C(`Total: ${ventasSinCita.length} ventas sin cita`, totAmbar);
  ws[`B${r}`] = C('', totAmbar);
  ws[`C${r}`] = C('', totAmbar);
  ws[`D${r}`] = C('', totAmbar);
  ws[`E${r}`] = C(totalSes, { ...totAmbar, alignment: { horizontal: 'center', vertical: 'center' } }, 'n');
  merges.push({ s: { r: r - 1, c: 0 }, e: { r: r - 1, c: 3 } });

  guardar(ws, merges, `A1:E${r}`,
    [{ wpx: 105 }, { wpx: 130 }, { wpx: 200 }, { wpx: 230 }, { wpx: 80 }],
    `Ventas_Sin_Cita_${filtros.fechaInicio}_${filtros.fechaFin}`, r);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. DESCUENTOS
// ═══════════════════════════════════════════════════════════════════════════════
export function exportarDescuentos(descuentos, filtros) {
  const ws = {}; const merges = []; const NCOLS = 4;
  let r = cabecera(ws, merges, NCOLS, filtros, 'Descuentos Aplicados por Tipo');

  const thR = S.th(P.RED);
  ws[`A${r}`] = C('TIPO DE DESCUENTO', { ...thR, alignment: { horizontal: 'left', vertical: 'center' } });
  ws[`B${r}`] = C('CANTIDAD',          thR);
  ws[`C${r}`] = C('MONTO (S/)',        thR);
  ws[`D${r}`] = C('% DEL TOTAL',       thR);
  r++;

  const totalMonto = descuentos.reduce((s, d) => s + (d.monto || 0), 0);
  let   totalCant  = 0;

  descuentos.forEach((d, i) => {
    const par = i % 2 === 0;
    const bg  = par ? P.WHITE : P.RED_LT;
    const td  = (al = 'left') => ({ font: { name: 'Calibri', sz: 13 }, fill: { fgColor: { rgb: bg } }, alignment: { horizontal: al, vertical: 'center' }, border: borde() });
    totalCant += d.cantidad || 0;
    ws[`A${r}`] = C(d.nombre || '—',                { ...td(), font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: P.RED } } });
    ws[`B${r}`] = C(d.cantidad ?? 0,                { ...td('center'), font: { name: 'Calibri', sz: 13, bold: true } }, 'n');
    ws[`C${r}`] = C(`− ${fmtMoneda(d.monto ?? 0)}`, { ...td('right'),  font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: P.RED } } });
    ws[`D${r}`] = C(fmtPct(d.monto || 0, totalMonto), td('center'));
    r++;
  });

  const totR = S.total(P.RED);
  ws[`A${r}`] = C('TOTAL DESCONTADO',           { ...totR, alignment: { horizontal: 'left', vertical: 'center' } });
  ws[`B${r}`] = C(totalCant,                    S.totalC(P.RED), 'n');
  ws[`C${r}`] = C(`− ${fmtMoneda(totalMonto)}`, totR);
  ws[`D${r}`] = C('100%',                       S.totalC(P.RED));

  guardar(ws, merges, `A1:D${r}`,
    [{ wpx: 230 }, { wpx: 90 }, { wpx: 150 }, { wpx: 110 }],
    `Descuentos_${filtros.fechaInicio}_${filtros.fechaFin}`, r);
}


// ═══════════════════════════════════════════════════════════════════════════════
// 8. PAQUETES POR RENOVAR
// ═══════════════════════════════════════════════════════════════════════════════
export function exportarPaquetesPorRenovar(paquetes, filtros) {
  const ws = {}; const merges = []; const NCOLS = 8;
  let r = cabecera(ws, merges, NCOLS, filtros, 'Paquetes por Renovar');

  const thP = S.th(P.PURPLE2);
  ws[`A${r}`] = C('N°',                  thP);
  ws[`B${r}`] = C('PACIENTE',            { ...thP, alignment: { horizontal: 'left', vertical: 'center' } });
  ws[`C${r}`] = C('DOCUMENTO',           thP);
  ws[`D${r}`] = C('SERVICIO',            { ...thP, alignment: { horizontal: 'left', vertical: 'center' } });
  ws[`E${r}`] = C('ÁREA',                thP);
  ws[`F${r}`] = C('SESIONES ATENDIDAS',  thP);
  ws[`G${r}`] = C('ÚLTIMA CITA',         thP);
  ws[`H${r}`] = C('HORA',                thP);
  r++;

  paquetes.forEach((row, i) => {
    const par = i % 2 === 0;
    const bg  = par ? P.WHITE : P.PURPLE_LT;
    const td  = (al = 'left') => ({ font: { name: 'Calibri', sz: 13 }, fill: { fgColor: { rgb: bg } }, alignment: { horizontal: al, vertical: 'center' }, border: borde() });
    ws[`A${r}`] = C(i + 1,                  { ...td('center'), font: { name: 'Calibri', sz: 13, color: { rgb: P.GRAY4 } } }, 'n');
    ws[`B${r}`] = C(row.paciente || '—',   { ...td(), font: { name: 'Calibri', sz: 13, bold: true } });
    ws[`C${r}`] = C(row.documento || '—',  td('center'));
    ws[`D${r}`] = C(row.servicio || '—',   td());
    ws[`E${r}`] = C(row.area || '—',       td('center'));
    ws[`F${r}`] = C(`${row.sesiones_atendidas ?? 0} / ${row.sesiones_totales ?? 0}`, { ...td('center'), font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: P.PURPLE2 } } });
    ws[`G${r}`] = C(fmtFecha(row.ultima_cita_fecha), td('center'));
    ws[`H${r}`] = C(fmtHora(row.ultima_cita_hora),   td('center'));
    r++;
  });

  const tot = { font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: P.WHITE } }, fill: { fgColor: { rgb: P.PURPLE } }, alignment: { horizontal: 'left', vertical: 'center' }, border: borde(P.PURPLE) };
  ws[`A${r}`] = C(`Total: ${paquetes.length} paquetes por renovar`, tot);
  for (const letra of ['B','C','D','E','F','G','H']) ws[`${letra}${r}`] = C('', tot);
  merges.push({ s: { r: r - 1, c: 0 }, e: { r: r - 1, c: 7 } });

  guardar(ws, merges, `A1:H${r}`,
    [{ wpx: 50 }, { wpx: 220 }, { wpx: 110 }, { wpx: 180 }, { wpx: 120 }, { wpx: 150 }, { wpx: 120 }, { wpx: 80 }],
    `Paquetes_Por_Renovar_${filtros.fechaInicio ?? ''}_${filtros.fechaFin ?? ''}`, r);
}


// ═══════════════════════════════════════════════════════════════════════════════
// 9. PACIENTES INACTIVADOS
// ═══════════════════════════════════════════════════════════════════════════════
export function exportarPacientesInactivados(pacientes, filtros) {
  const ws = {}; const merges = []; const NCOLS = 6;
  let r = cabecera(ws, merges, NCOLS, filtros, 'Pacientes Inactivados');

  const thR = S.th(P.RED);
  ws[`A${r}`] = C('N°',                 thR);
  ws[`B${r}`] = C('FECHA INACTIVACIÓN', thR);
  ws[`C${r}`] = C('PACIENTE',           { ...thR, alignment: { horizontal: 'left', vertical: 'center' } });
  ws[`D${r}`] = C('DOCUMENTO',          thR);
  ws[`E${r}`] = C('SERVICIO',           { ...thR, alignment: { horizontal: 'left', vertical: 'center' } });
  ws[`F${r}`] = C('ÁREA',               thR);
  r++;

  pacientes.forEach((p, i) => {
    const par = i % 2 === 0;
    const bg  = par ? P.WHITE : P.RED_LT;
    const td  = (al = 'left') => ({ font: { name: 'Calibri', sz: 13 }, fill: { fgColor: { rgb: bg } }, alignment: { horizontal: al, vertical: 'center' }, border: borde() });
    ws[`A${r}`] = C(i + 1,                       { ...td('center'), font: { name: 'Calibri', sz: 13, color: { rgb: P.GRAY4 } } }, 'n');
    ws[`B${r}`] = C(fmtFecha(p.fecha_inactivacion), td('center'));
    ws[`C${r}`] = C(p.nombre || '—',             { ...td(), font: { name: 'Calibri', sz: 13, bold: true } });
    ws[`D${r}`] = C(p.documento || '—',          td('center'));
    ws[`E${r}`] = C(p.servicio || '—',           td());
    ws[`F${r}`] = C(p.area || '—',               td('center'));
    r++;
  });

  const tot = { font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: P.WHITE } }, fill: { fgColor: { rgb: P.RED } }, alignment: { horizontal: 'left', vertical: 'center' }, border: borde(P.RED) };
  ws[`A${r}`] = C(`Total: ${pacientes.length} pacientes inactivados`, tot);
  for (const letra of ['B','C','D','E','F']) ws[`${letra}${r}`] = C('', tot);
  merges.push({ s: { r: r - 1, c: 0 }, e: { r: r - 1, c: 5 } });

  guardar(ws, merges, `A1:F${r}`,
    [{ wpx: 50 }, { wpx: 150 }, { wpx: 220 }, { wpx: 110 }, { wpx: 180 }, { wpx: 120 }],
    `Pacientes_Inactivados_${filtros.fechaInicio ?? ''}_${filtros.fechaFin ?? ''}`, r);
}


// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTAR HISTORIAL DE VENTAS CON DETALLE
// Agregar esta función a excelReportesVentas.js
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Helpers locales (ya existen en excelReportesVentas.js, no duplicar) ──────
// fmtFecha, fmtMoneda, borde, C, col, P, S, cabecera, rowHeights, guardar

// ─── Helpers específicos de historial ────────────────────────────────────────

const getCliente = (v) => {
  if (v.paciente)
    return `${v.paciente.nombres || ''} ${v.paciente.apellido_paterno || ''} ${v.paciente.apellido_materno || ''}`.trim();
  if (v.responsable)
    return `${v.responsable.nombres || ''} ${v.responsable.apellido_paterno || ''} ${v.responsable.apellido_materno || ''}`.trim();
  if (v.comprador_externo)
    return v.comprador_externo.nombre_completo || v.comprador_externo.nombre || '—';
  return '—';
};

const getPacienteDetalle = (d) => {
  if (!d.paciente) return '—';
  return `${d.paciente.nombres || ''} ${d.paciente.apellido_paterno || ''} ${d.paciente.apellido_materno || ''}`.trim();
};

const getDescripcionDetalle = (d, tipo) => {
  if (tipo === 'producto') return d.producto?.nombre || d.descripcion_linea || '—';
  if (d.descripcionLinea)  return d.descripcionLinea;
  if (d.descripcion_linea) return d.descripcion_linea;
  const srv = d.servicio_tarifa?.servicio?.nombre || '';
  const mot = d.servicio_tarifa?.motivo_cita?.nombre || '';
  return mot ? `${srv} [${mot}]` : (srv || '—');
};

const getCantidadDetalle = (d, tipo) =>
  tipo === 'producto' ? parseFloat(d.cantidad || 0) : parseFloat(d.sesiones_totales || 1);

const tipoPagadorLabel = (id) =>
  id === 1 ? 'Paciente' : id === 2 ? 'Responsable' : id === 3 ? 'Externo' : '—';

// ─── Estructura de columnas ───────────────────────────────────────────────────
// Cabecera de venta (cols A–N) + detalle (cols O–T)
// A  Fecha
// B  Hora
// C  Tipo
// D  Comprobante (tipo)
// E  N° Comprobante
// F  Pagador (tipo)
// G  Cliente
// H  Usuario que registró
// I  Subtotal
// J  Descuento
// K  Total
// L  Promos
// M  Notas
// N  Observaciones
// O  # Línea
// P  Descripción ítem
// Q  Paciente ítem
// R  Cantidad
// S  P. Unit.
// T  Subtotal ítem

const NCOLS = 20; // A(0)–T(19)

// ─── Función principal ────────────────────────────────────────────────────────

export function exportarHistorialVentas(ventas, filtros) {
  const ws = {};
  const merges = [];

  let r = cabecera(ws, merges, NCOLS, filtros, 'Historial de Ventas con Detalle');

  // ── Encabezados dobles ────────────────────────────────────────────────────
  // Fila r: grupo "CABECERA DE VENTA" + grupo "DETALLE"
  const thV  = S.th(P.PURPLE2);
  const thVL = S.thL(P.PURPLE2);
  const thD  = S.th('1565C0');   // azul para detalle
  const thDL = S.thL('1565C0');

  // Grupo venta (A–N = cols 0–13)
  ws[`A${r}`] = C('CABECERA DE VENTA', { ...thV, alignment: { horizontal: 'center', vertical: 'center' } });
  for (let c = 1; c <= 13; c++) ws[`${col(c)}${r}`] = C('', thV);
  merges.push({ s: { r: r - 1, c: 0 }, e: { r: r - 1, c: 13 } });

  // Grupo detalle (O–T = cols 14–19)
  ws[`O${r}`] = C('DETALLE DE LÍNEAS', { ...thD, alignment: { horizontal: 'center', vertical: 'center' } });
  for (let c = 15; c <= 19; c++) ws[`${col(c)}${r}`] = C('', thD);
  merges.push({ s: { r: r - 1, c: 14 }, e: { r: r - 1, c: 19 } });
  r++;

  // Fila r: encabezados de columna
  ws[`A${r}`] = C('FECHA',            thVL);
  ws[`B${r}`] = C('HORA',             thV);
  ws[`C${r}`] = C('TIPO',             thV);
  ws[`D${r}`] = C('COMPROBANTE',      thV);
  ws[`E${r}`] = C('N° COMPROBANTE',   thV);
  ws[`F${r}`] = C('PAGADOR',          thV);
  ws[`G${r}`] = C('CLIENTE',          thVL);
  ws[`H${r}`] = C('REGISTRADO POR',   thVL);
  ws[`I${r}`] = C('SUBTOTAL (S/)',    thV);
  ws[`J${r}`] = C('DESCUENTO (S/)',   thV);
  ws[`K${r}`] = C('TOTAL (S/)',       thV);
  ws[`L${r}`] = C('PROMOS',           thV);
  ws[`M${r}`] = C('NOTAS',            thVL);
  ws[`N${r}`] = C('OBSERVACIONES',    thVL);
  ws[`O${r}`] = C('#',                thD);
  ws[`P${r}`] = C('DESCRIPCIÓN',      thDL);
  ws[`Q${r}`] = C('PACIENTE',         thDL);
  ws[`R${r}`] = C('CANT.',            thD);
  ws[`S${r}`] = C('P. UNIT. (S/)',    thD);
  ws[`T${r}`] = C('SUBTOTAL (S/)',    thD);
  r++;

  // ── Filas de datos ────────────────────────────────────────────────────────
  let sumTotal = 0;
  let sumDesc  = 0;
  let ventaIdx = 0;

  for (const v of ventas) {
    const tipo     = v.tipo || 'servicio';
    const detalles = v.detalles || [];
    const nLineas  = Math.max(detalles.length, 1);
    const par      = ventaIdx % 2 === 0;

    // Colores alternados para cabecera de venta
    const bgVenta = par ? P.WHITE : P.PURPLE_LT;
    const tdV  = (al = 'left') => ({
      font:      { name: 'Calibri', sz: 11 },
      fill:      { fgColor: { rgb: bgVenta } },
      alignment: { horizontal: al, vertical: 'center', wrapText: true },
      border:    borde(),
    });

    // Colores alternados para detalle (más claro)
    const bgDet = par ? 'F9F9F9' : 'EDE7F6';
    const tdD  = (al = 'left') => ({
      font:      { name: 'Calibri', sz: 11 },
      fill:      { fgColor: { rgb: bgDet } },
      alignment: { horizontal: al, vertical: 'center', wrapText: true },
      border:    borde(),
    });

    const descuentoItems  = (detalles).reduce((s, d) => s + parseFloat(d.descuento_monto || 0), 0);
    const descuentoGlobal = parseFloat(v.descuento_monto || 0);
    const descuento       = Math.round((descuentoItems + descuentoGlobal) * 100) / 100;
    const total           = parseFloat(v.total || 0);
    const promos          = (v.promociones_aplicadas || []).length;

    sumTotal += total;
    sumDesc  += descuento;

    // Datos de cabecera — se repiten en la primera fila y se mergean verticalmente
    const fechaStr  = fmtFecha(v.fecha_venta);
    const horaStr   = v.created_at
      ? new Date(v.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : '—';
    const tipoStr   = tipo === 'servicio' ? 'Servicio' : 'Producto';
    const compNom   = v.tipo_comprobante?.nombre || '—';
    const compCod   = v.codigo_comprobante || '—';
    const pagStr    = tipoPagadorLabel(v.tipo_pagador_id || v.tipo_comprador_id);
    const cliente   = getCliente(v);
    const usuarioStr = v.user_crea
      ? `${v.user_crea.nombres || ''} ${v.user_crea.apellidos || ''}`.trim()
      : '—';
    const notaStr   = v.nota || '—';
    const obsStr    = v.observaciones || '—';

    // Escribir celdas de cabecera fila a fila
    // En la primera fila del grupo: valor real; en el resto: vacío (el merge une visualmente)
    for (let li = 0; li < nLineas; li++) {
      const fila = r + li;

      // Columnas de cabecera (A–N): solo primera línea tiene valor, el resto vacío
      const esFirst = li === 0;

      ws[`A${fila}`] = C(esFirst ? fechaStr   : '', { ...tdV('center'), font: { name: 'Calibri', sz: 11, bold: esFirst } });
      ws[`B${fila}`] = C(esFirst ? horaStr    : '', { ...tdV('center'), font: { name: 'Calibri', sz: 11, color: { rgb: P.GRAY4 } } });
      ws[`C${fila}`] = C(esFirst ? tipoStr    : '', { ...tdV('center'), font: { name: 'Calibri', sz: 11, bold: esFirst,
        color: { rgb: tipo === 'servicio' ? '1565C0' : P.AMBER } } });
      ws[`D${fila}`] = C(esFirst ? compNom    : '', { ...tdV('center'), font: { name: 'Calibri', sz: 11 } });
      ws[`E${fila}`] = C(esFirst ? compCod    : '', { ...tdV('center'), font: { name: 'Courier New', sz: 11, bold: esFirst, color: { rgb: P.PURPLE2 } } });
      ws[`F${fila}`] = C(esFirst ? pagStr     : '', { ...tdV('center'), font: { name: 'Calibri', sz: 11 } });
      ws[`G${fila}`] = C(esFirst ? cliente    : '', { ...tdV(), font: { name: 'Calibri', sz: 11, bold: esFirst } });
      ws[`H${fila}`] = C(esFirst ? usuarioStr : '', { ...tdV(), font: { name: 'Calibri', sz: 11, color: { rgb: P.BLUE } } });
      ws[`I${fila}`] = C(esFirst ? fmtMoneda(v.subtotal || total) : '', { ...tdV('right'), font: { name: 'Calibri', sz: 11 } });
      ws[`J${fila}`] = C(esFirst ? (descuento > 0 ? `− ${fmtMoneda(descuento)}` : '—') : '', {
        ...tdV('right'),
        font: { name: 'Calibri', sz: 11, color: { rgb: descuento > 0 ? P.AMBER : P.GRAY3 } },
      });
      ws[`K${fila}`] = C(esFirst ? fmtMoneda(total) : '', {
        ...tdV('right'),
        font: { name: 'Calibri', sz: 11, bold: esFirst, color: { rgb: P.GREEN } },
      });
      ws[`L${fila}`] = C(esFirst ? (promos > 0 ? `✦ ${promos}` : '—') : '', {
        ...tdV('center'),
        font: { name: 'Calibri', sz: 11, color: { rgb: promos > 0 ? '15803D' : P.GRAY3 } },
      });
      ws[`M${fila}`] = C(esFirst ? notaStr    : '', { ...tdV(), font: { name: 'Calibri', sz: 10, italic: true, color: { rgb: P.GRAY4 } } });
      ws[`N${fila}`] = C(esFirst ? obsStr     : '', { ...tdV(), font: { name: 'Calibri', sz: 10, italic: true, color: { rgb: P.GRAY4 } } });

      // Columnas de detalle (O–T)
      const d = detalles[li];
      if (d) {
        const desc   = getDescripcionDetalle(d, tipo);
        const pac    = tipo === 'servicio' ? getPacienteDetalle(d) : '—';
        const cant   = getCantidadDetalle(d, tipo);
        const punit  = parseFloat(d.precio_unitario || 0);
        const subDet = parseFloat(d.subtotal || punit * cant || 0);

        ws[`O${fila}`] = C(li + 1,            { ...tdD('center'), font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: P.PURPLE2 } } }, 'n');
        ws[`P${fila}`] = C(desc,              { ...tdD(), font: { name: 'Calibri', sz: 11 } });
        ws[`Q${fila}`] = C(pac,               { ...tdD(), font: { name: 'Calibri', sz: 11, color: { rgb: P.PURPLE2 } } });
        ws[`R${fila}`] = C(cant,              { ...tdD('center'), font: { name: 'Calibri', sz: 11 } }, 'n');
        ws[`S${fila}`] = C(fmtMoneda(punit),  { ...tdD('right'), font: { name: 'Calibri', sz: 11 } });
        ws[`T${fila}`] = C(fmtMoneda(subDet), { ...tdD('right'), font: { name: 'Calibri', sz: 11, bold: true } });
      } else {
        // Venta sin detalles — celdas vacías
        for (const letra of ['O','P','Q','R','S','T']) ws[`${letra}${fila}`] = C('', tdD());
      }
    }

    // Merge vertical para celdas de cabecera (A–N) si hay más de 1 línea
    if (nLineas > 1) {
      for (let c = 0; c <= 13; c++) {
        merges.push({ s: { r: r - 1, c }, e: { r: r - 1 + nLineas - 1, c } });
      }
    }

    r += nLineas;
    ventaIdx++;
  }

  // ── Fila total ────────────────────────────────────────────────────────────
  ws[`A${r}`] = C(`TOTAL — ${ventas.length} ventas`, S.totalL());
  for (let c = 1; c <= 7; c++) ws[`${col(c)}${r}`] = C('', S.totalL());
  merges.push({ s: { r: r - 1, c: 0 }, e: { r: r - 1, c: 7 } });

  ws[`I${r}`] = C('',                       S.total());
  ws[`J${r}`] = C(`− ${fmtMoneda(sumDesc)}`, S.total());
  ws[`K${r}`] = C(fmtMoneda(sumTotal),       S.total());
  ws[`L${r}`] = C('',                        S.totalC());
  ws[`M${r}`] = C('',                        S.totalC());
  ws[`N${r}`] = C('',                        S.totalC());
  for (const letra of ['O','P','Q','R','S','T']) ws[`${letra}${r}`] = C('', S.totalC());

  guardar(
    ws,
    merges,
    `A1:T${r}`,
    [
      { wpx: 95  }, // A Fecha
      { wpx: 70  }, // B Hora
      { wpx: 70  }, // C Tipo
      { wpx: 85  }, // D Comprobante
      { wpx: 115 }, // E N° Comprobante
      { wpx: 75  }, // F Pagador
      { wpx: 175 }, // G Cliente
      { wpx: 155 }, // H Registrado por
      { wpx: 105 }, // I Subtotal
      { wpx: 105 }, // J Descuento
      { wpx: 105 }, // K Total
      { wpx: 50  }, // L Promos
      { wpx: 180 }, // M Notas
      { wpx: 180 }, // N Observaciones
      { wpx: 35  }, // O #
      { wpx: 195 }, // P Descripción
      { wpx: 165 }, // Q Paciente
      { wpx: 55  }, // R Cant.
      { wpx: 100 }, // S P. Unit.
      { wpx: 110 }, // T Subtotal ítem
    ],
    `Historial_Ventas_${filtros.fechaInicio ?? ''}_${filtros.fechaFin ?? ''}`,
    r,
  );
}