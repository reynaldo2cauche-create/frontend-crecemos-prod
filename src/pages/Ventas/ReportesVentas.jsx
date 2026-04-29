import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getReportes, getVentasSinCita , getHistorialVentasExcel } from '../../services/ventasService';
import {
  exportarMetricas,
  exportarTendencia,
  exportarDistribucion,
  exportarResponsables,
  exportarTopItems,
  exportarVentasSinCita,
  exportarDescuentos,
  exportarHistorialVentas
} from '../../utils/excelReportesVentas';


const ReportesVentas = () => {
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoReporte, setTipoReporte] = useState('general');
  const [historialVentas, setHistorialVentas] = useState([]);

  const [metricas, setMetricas] = useState({
    totalVentas: 0,
    totalIngresos: 0,
    ventasProductos: 0,
    ventasServicios: 0,
    ticketPromedio: 0,
    crecimiento: 0,
    sesionesPendientes: 0,
    sesionesTotalesVendidas: 0,
    sesionesUsadas: 0,
    totalDescuentos: 0,
    totalDescuentosPromo: 0,
  });
  const [ventasPorDia, setVentasPorDia] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [ventasPorCategoria, setVentasPorCategoria] = useState([]);
  const [descuentos, setDescuentos] = useState([]);
  const [ingresosPorResponsable, setIngresosPorResponsable] = useState([]);
  const [ventasSinCita, setVentasSinCita] = useState([]);
  const [loadingSinCita, setLoadingSinCita] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [exportando, setExportando] = useState(null);
  const filasPorPagina = 10;

  const exportar = (key, fn) => {
    setExportando(key);
    try {
      fn();
    } catch (e) {
      console.error('Error exportando Excel:', e);
      alert('Error al generar el Excel: ' + (e?.message || e));
    } finally {
      setExportando(null);
    }
  };

  const COLORS = ['#7B1FA2', '#A3C644', '#E91E63', '#FF9800', '#2196F3', '#9C27B0'];

  // Inicializa fechas al montar - mes actual completo
  useEffect(() => {
    const hoy = new Date();
    // Primer día del mes actual
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    // Último día del mes actual
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    setFechaInicio(primerDia.toISOString().split('T')[0]);
    setFechaFin(ultimoDia.toISOString().split('T')[0]);
  }, []);

  // Dispara la carga cuando cambian fechas o tipo
  useEffect(() => {
    if (fechaInicio && fechaFin) cargarReportes();
  }, [fechaInicio, fechaFin, tipoReporte]);

  useEffect(() => {
    const cargarSinCita = async () => {
      setLoadingSinCita(true);
      try {
        const data = await getVentasSinCita();
        setVentasSinCita(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Error al cargar ventas sin cita:', e);
      } finally {
        setLoadingSinCita(false);
      }
    };
    cargarSinCita();
  }, []);

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const data = await getReportes({
        fechaInicio,
        fechaFin,
        tipo: tipoReporte,
      });

      console.log('📊 Datos recibidos del backend:', data);

      const met = data.metricas || {};
      setMetricas(met);

      // ✅ ventasPorDia → viene como "ventasPorDia" desde el backend
      const ventasDia = data.ventasPorDia || [];
      console.log('📈 ventasPorDia:', ventasDia);
      setVentasPorDia(ventasDia);

      // ✅ topItems → el backend devuelve "topItems", NO "topProductos"
      const items = data.topItems || [];
      console.log('🏆 topItems:', items);
      setTopItems(items);

      // ✅ descuentos → viene como "descuentos"
      const desc = data.descuentos || [];
      console.log('💰 descuentos:', desc);
      setDescuentos(desc);

      // ✅ ingresosPorResponsable → viene como "ingresosPorResponsable"
      const ingresos = data.ingresosPorResponsable || [];
      console.log('👤 ingresosPorResponsable:', ingresos);
      setIngresosPorResponsable(ingresos);

     const historialData = await getHistorialVentasExcel({ 
        fechaInicio,   // esto se mapea a "desde" dentro del service
        fechaFin,      // esto se mapea a "hasta"
        tipo: tipoReporte 
      });
      setHistorialVentas(historialData.data || []);

      // ✅ ventasPorCategoria → no existe en backend, se construye desde métricas
      const categorias = [
        { nombre: 'Productos', valor: met.ventasProductos || 0 },
        { nombre: 'Servicios', valor: met.ventasServicios || 0 },
      ];
      console.log('📊 ventasPorCategoria:', categorias);
      setVentasPorCategoria(categorias);
    } catch (error) {
      console.error('❌ Error al cargar reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value ?? 0);

  const formatFecha = (f) => {
    if (!f) return '—';
    const [y, m, d] = String(f).slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm text-gray-600">
            {entry.name}:{' '}
            <span className="font-semibold" style={{ color: entry.color }}>
              {entry.name === 'Ingresos' ? formatCurrency(entry.value) : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  };

  const metricCards = [
    {
      label: 'Total ventas',
      value: metricas.totalVentas,
      sub: `Productos: ${metricas.ventasProductos} | Servicios: ${metricas.ventasServicios}`,
      gradient: 'from-purple-50 to-purple-100', border: 'border-purple-200',
      text: 'text-purple-600', num: 'text-purple-900', iconBg: 'bg-purple-200', iconColor: 'text-purple-700',
      Icon: ShoppingCartIcon,
    },
    {
      label: 'Total ingresos',
      value: formatCurrency(metricas.totalIngresos),
      sub: `Ticket prom: ${formatCurrency(metricas.ticketPromedio)}`,
      gradient: 'from-green-50 to-emerald-100', border: 'border-green-200',
      text: 'text-green-600', num: 'text-green-900', iconBg: 'bg-green-200', iconColor: 'text-green-700',
      Icon: CurrencyDollarIcon,
    },
    {
      label: 'Crecimiento',
      value: `${metricas.crecimiento > 0 ? '+' : ''}${metricas.crecimiento}%`,
      sub: 'vs. período anterior',
      gradient: 'from-blue-50 to-blue-100', border: 'border-blue-200',
      text: 'text-blue-600', num: 'text-blue-900', iconBg: 'bg-blue-200', iconColor: 'text-blue-700',
      Icon: ArrowTrendingUpIcon,
    },
    {
      label: 'Sesiones pendientes',
      value: metricas.sesionesPendientes,
      sub: `Vendidas: ${metricas.sesionesTotalesVendidas} | Usadas: ${metricas.sesionesUsadas}`,
      gradient: 'from-orange-50 to-orange-100', border: 'border-orange-200',
      text: 'text-orange-600', num: 'text-orange-900', iconBg: 'bg-orange-200', iconColor: 'text-orange-700',
      Icon: CalendarIcon,
    },
    {
      label: 'Total descontado',
      value: formatCurrency(metricas.totalDescuentos),
      sub: `Promos: ${formatCurrency(metricas.totalDescuentosPromo)}`,
      gradient: 'from-red-50 to-red-100', border: 'border-red-200',
      text: 'text-red-600', num: 'text-red-900', iconBg: 'bg-red-200', iconColor: 'text-red-700',
      Icon: TagIcon,
    },
  ];


  const indiceUltimaFila = paginaActual * filasPorPagina;
  const indicePrimeraFila = indiceUltimaFila - filasPorPagina;

  const ventasPaginadas = ventasSinCita.slice(indicePrimeraFila, indiceUltimaFila);

  const totalPaginas = Math.ceil(ventasSinCita.length / filasPorPagina);

  const filtros = { fechaInicio, fechaFin, tipoReporte };

  const BtnExcel = ({ id, onClick, disabled }) => {
    const cargando = exportando === id;
    return (
      <button
        onClick={onClick}
        disabled={disabled || cargando}
        title="Exportar a Excel"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#217346] hover:bg-[#1a5c37] disabled:opacity-40 transition-all shadow-sm"
      >
        {cargando
          ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <ArrowDownTrayIcon className="w-3.5 h-3.5" />}
        {cargando ? 'Exportando…' : 'Excel'}
      </button>
    );
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Reportes de ventas</h1>
        <p className="text-gray-500 text-sm">Análisis de factibilidad y métricas del negocio</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de reporte</label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]"
            >
              <option value="general">General</option>
              <option value="productos">Productos</option>
              <option value="servicios">Servicios</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={cargarReportes}
              disabled={loading}
              className="w-full px-6 py-3 bg-[#7B1FA2] text-white rounded-xl font-semibold hover:bg-[#6A1B9A] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <ChartBarIcon className="w-5 h-5" />
                  Generar reporte
                </>
              )}
            </button>
          </div>

        
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Exportar historial:</span>
          <BtnExcel
            id="historial"
            onClick={() => exportar('historial', () => exportarHistorialVentas(historialVentas, filtros))}
            disabled={loading || historialVentas.length === 0}
          />
        </div>

      {/* 5 Tarjetas métricas */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-gray-700">Métricas del período</h2>
        <BtnExcel id="metricas" onClick={() => exportar('metricas', () => exportarMetricas(metricas, filtros))} disabled={loading} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map(({ label, value, sub, gradient, border, text, num, iconBg, iconColor, Icon }) => (
          <div key={label} className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 border ${border}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`${iconBg} p-1.5 rounded-lg shrink-0`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
              <p className={`text-xs font-semibold ${text} truncate`}>{label}</p>
            </div>
            <p className={`text-xl font-bold ${num} leading-tight whitespace-nowrap overflow-hidden text-ellipsis`}>{value}</p>
            <p className={`text-xs ${text} mt-1 leading-snug`}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Tendencia de ventas — ancho completo */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#7B1FA2]" />
            Tendencia de ventas
          </h3>
          <BtnExcel id="tendencia" onClick={() => exportar('tendencia', () => exportarTendencia(ventasPorDia, filtros))} disabled={loading || ventasPorDia.length === 0} />
        </div>
        {ventasPorDia.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">Sin datos para el período seleccionado</p>
        ) : (
          <div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={ventasPorDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="fecha" style={{ fontSize: '12px' }} />
                <YAxis yAxisId="left" style={{ fontSize: '12px' }} />
                <YAxis yAxisId="right" orientation="right" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line yAxisId="left"  type="monotone" dataKey="ventas"   stroke="#7B1FA2" strokeWidth={2} dot={{ r: 3 }} name="Cantidad" />
                <Line yAxisId="right" type="monotone" dataKey="ingresos" stroke="#A3C644" strokeWidth={2} dot={{ r: 3 }} name="Ingresos" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Grid: Distribución por tipo + Ingresos por responsable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Distribución por tipo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Distribución por tipo</h3>
            <BtnExcel id="distribucion" onClick={() => exportar('distribucion', () => exportarDistribucion(ventasPorCategoria, metricas, filtros))} disabled={loading || ventasPorCategoria.every(v => v.valor === 0)} />
          </div>
          {ventasPorCategoria.every(v => v.valor === 0) ? (
            <p className="text-sm text-gray-400 text-center py-10">Sin datos para el período seleccionado</p>
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={ventasPorCategoria}
                    cx="50%" cy="50%"
                    labelLine={true}
                    label={({ nombre, valor, percent }) =>
                      `${nombre}: ${valor} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={75}
                    dataKey="valor"
                    nameKey="nombre"
                  >
                    {ventasPorCategoria.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'Cantidad']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Ingresos por responsable */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Ingresos por responsable</h3>
            <BtnExcel id="responsables" onClick={() => exportar('responsables', () => exportarResponsables(ingresosPorResponsable, filtros))} disabled={loading || ingresosPorResponsable.length === 0} />
          </div>
          {ingresosPorResponsable.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Sin datos para el período seleccionado</p>
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={ingresosPorResponsable} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `S/ ${v.toLocaleString('es-PE')}`}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis dataKey="nombre" type="category" width={130} style={{ fontSize: '11px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="ingresos" fill="#A3C644" name="Ingresos" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

  {/* Top productos/servicios — solo barra de cantidad, ingresos en tooltip */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
      <ChartBarIcon className="w-5 h-5 text-[#7B1FA2]" />
      Top productos / servicios más vendidos
    </h3>
    <BtnExcel id="topitems" onClick={() => exportar('topitems', () => exportarTopItems(topItems, filtros))} disabled={loading || topItems.length === 0} />
  </div>
  {topItems.length === 0 ? (
    <p className="text-sm text-gray-400 text-center py-10">Sin datos para el período seleccionado</p>
  ) : (
    <div>
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={topItems} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis type="number" style={{ fontSize: '12px' }} />
        <YAxis dataKey="nombre" type="category" width={180} style={{ fontSize: '11px' }} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
                <p className="font-semibold text-gray-800 mb-1">{d.nombre}</p>
                <p className="text-[#7B1FA2]">Cantidad: <span className="font-bold">{d.cantidad}</span></p>
                <p className="text-[#A3C644]">Ingresos: <span className="font-bold">S/ {d.ingresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span></p>
              </div>
            );
          }}
        />
        <Bar dataKey="cantidad" fill="#7B1FA2" name="Cantidad" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
    </div>
  )}
</div>

      {/* Ventas sin cita agendada */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-amber-100 bg-amber-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-amber-900">Ventas sin cita agendada</h3>
            {!loadingSinCita && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-800">
                {ventasSinCita.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-amber-600">Servicios vendidos que aún no tienen cita programada</p>
            <BtnExcel id="sincita" onClick={() => exportar('sincita', () => exportarVentasSinCita(ventasSinCita, filtros))} disabled={ventasSinCita.length === 0} />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loadingSinCita ? (
            <div className="flex items-center justify-center py-10 gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin" />
              Cargando...
            </div>
          ) : ventasSinCita.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Todas las ventas tienen cita agendada</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Comprobante</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Paciente</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Servicio</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Sesiones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ventasPaginadas.map((row, i) => (
                  <tr key={i} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-4 py-2.5 text-sm text-gray-700 whitespace-nowrap">{formatFecha(row.fecha_venta)}</td>
                    <td className="px-4 py-2.5 text-sm font-mono text-gray-600">{row.codigo_comprobante || '—'}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{row.paciente || '—'}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{row.descripcion_linea || row.motivo_cita || '—'}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        {row.sesiones_pendientes} pendientes 
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Página {paginaActual} de {totalPaginas || 1}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
                disabled={paginaActual === 1}
                className="px-3 py-1.5 rounded-lg border text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40"
              >
                Anterior
              </button>

              <button
                onClick={() => setPaginaActual((p) => Math.min(p + 1, totalPaginas))}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-1.5 rounded-lg border text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla descuentos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Descuentos aplicados por tipo</h3>
          <BtnExcel id="descuentos" onClick={() => exportar('descuentos', () => exportarDescuentos(descuentos, filtros))} disabled={loading || descuentos.length === 0} />
        </div>
          <div className="overflow-x-auto">
            {descuentos.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">Sin descuentos en el período seleccionado</p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Tipo</th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wide">Cantidad</th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wide">Monto total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {descuentos.map((d, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-sm text-gray-900">{d.nombre}</td>
                      <td className="px-5 py-3 text-sm text-gray-600 text-right">{d.cantidad}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-red-500 text-right">
                        − {formatCurrency(d.monto)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-red-50">
                    <td className="px-5 py-3 text-sm font-bold text-red-700" colSpan={2}>Total descontado</td>
                    <td className="px-5 py-3 text-sm font-bold text-red-700 text-right">
                      − {formatCurrency(descuentos.reduce((acc, d) => acc + d.monto, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
      </div>
    </div>
  );
};

export default ReportesVentas;