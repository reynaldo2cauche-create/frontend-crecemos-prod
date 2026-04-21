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
import { getReportes } from '../../services/ventasService';

const ReportesVentas = () => {
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoReporte, setTipoReporte] = useState('general');

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

      {/* 5 Tarjetas métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map(({ label, value, sub, gradient, border, text, num, iconBg, iconColor, Icon }) => (
          <div key={label} className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 border ${border}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`text-xs font-semibold ${text} mb-1`}>{label}</p>
                <p className={`text-xl font-bold ${num} leading-tight break-words`}>{value}</p>
                <p className={`text-xs ${text} mt-2 leading-snug`}>{sub}</p>
              </div>
              <div className={`${iconBg} p-2.5 rounded-xl shrink-0`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tendencia de ventas — ancho completo */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-[#7B1FA2]" />
          Tendencia de ventas
        </h3>
        {ventasPorDia.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">Sin datos para el período seleccionado</p>
        ) : (
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
        )}
      </div>

      {/* Grid: Distribución por tipo + Ingresos por responsable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Distribución por tipo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Distribución por tipo</h3>
          {ventasPorCategoria.every(v => v.valor === 0) ? (
            <p className="text-sm text-gray-400 text-center py-10">Sin datos para el período seleccionado</p>
          ) : (
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
          )}
        </div>

        {/* Ingresos por responsable */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Ingresos por responsable</h3>
          {ingresosPorResponsable.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Sin datos para el período seleccionado</p>
          ) : (
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
          )}
        </div>
      </div>

  {/* Top productos/servicios — solo barra de cantidad, ingresos en tooltip */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
    <ChartBarIcon className="w-5 h-5 text-[#7B1FA2]" />
    Top productos / servicios más vendidos
  </h3>
  {topItems.length === 0 ? (
    <p className="text-sm text-gray-400 text-center py-10">Sin datos para el período seleccionado</p>
  ) : (
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
  )}
</div>

      {/* Tabla descuentos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-900">Descuentos aplicados por tipo</h3>
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