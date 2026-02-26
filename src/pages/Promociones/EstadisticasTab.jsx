import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  TicketIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { getEstadisticasPromociones } from '../../services/promocionesService';

const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const EstadisticasTab = () => {
  const [estadisticas, setEstadisticas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const data = await getEstadisticasPromociones();
      setEstadisticas(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular totales
  const totalUsos = estadisticas.reduce((sum, e) => sum + parseInt(e.total_usos || 0), 0);
  const totalAhorro = estadisticas.reduce((sum, e) => sum + parseFloat(e.ahorro_total || 0), 0);
  const promoMasUsada = estadisticas.length > 0
    ? estadisticas.reduce((max, e) => parseInt(e.total_usos) > parseInt(max.total_usos) ? e : max, estadisticas[0])
    : null;

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={TicketIcon}
          title="Total de Usos"
          value={totalUsos.toLocaleString()}
          subtitle="Promociones aplicadas"
          color="blue"
        />
        <StatCard
          icon={CurrencyDollarIcon}
          title="Ahorro Total"
          value={`S/ ${totalAhorro.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Descuentos generados"
          color="green"
        />
        <StatCard
          icon={TrophyIcon}
          title="Más Popular"
          value={promoMasUsada?.nombre_promocion || 'N/A'}
          subtitle={promoMasUsada ? `${promoMasUsada.total_usos} usos` : ''}
          color="pink"
        />
      </div>

      {/* Tabla de Estadísticas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-[#E91E63]" />
            <h3 className="font-bold text-gray-900">Estadísticas por Promoción</h3>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando estadísticas...</div>
        ) : estadisticas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay estadísticas disponibles
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Promoción</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">Total Usos</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">Ahorro Total</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">Promedio por Uso</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">% del Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {estadisticas.map(stat => {
                  const usos = parseInt(stat.total_usos || 0);
                  const ahorro = parseFloat(stat.ahorro_total || 0);
                  const promedio = usos > 0 ? ahorro / usos : 0;
                  const porcentaje = totalUsos > 0 ? (usos / totalUsos) * 100 : 0;

                  return (
                    <tr key={stat.promocion_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {stat.promocion_id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm text-gray-900">{stat.nombre_promocion}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                          {usos.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-green-600">
                        S/ {ahorro.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">
                        S/ {promedio.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#E91E63] to-[#F06292]"
                              style={{ width: `${Math.min(porcentaje, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-600 w-10 text-right">
                            {porcentaje.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-sm font-bold text-gray-900">
                    TOTAL
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      {totalUsos.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-green-700">
                    S/ {totalAhorro.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstadisticasTab;
