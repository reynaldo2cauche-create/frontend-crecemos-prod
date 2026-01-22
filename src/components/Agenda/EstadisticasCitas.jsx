import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { obtenerEstadisticasCitas } from '../../services/citasEstadisticasService';

const EstadisticasCitas = ({ fechaDesde, fechaHasta, terapeutaId = null }) => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarEstadisticas();
  }, [fechaDesde, fechaHasta, terapeutaId]);

  const cargarEstadisticas = async () => {
    if (!fechaDesde || !fechaHasta) return;

    try {
      setLoading(true);
      setError(null);
      const data = await obtenerEstadisticasCitas(fechaDesde, fechaHasta, terapeutaId);
      setEstadisticas(data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      setError('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const obtenerNombreMesActual = () => {
    if (!fechaDesde) return '';
    const [year, month] = fechaDesde.split('-');
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${meses[parseInt(month) - 1]} ${year}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
          <span className="ml-2 text-gray-600">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  if (!estadisticas) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 1. Total del AÑO */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {estadisticas.totalCitasAnio}
            </div>
            <div className="text-xs text-gray-600 font-medium">
              Total del Año
            </div>
          </div>
        </div>
      </div>

      {/* 2. Total del MES */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {estadisticas.totalCitasMes}
            </div>
            <div className="text-xs text-gray-600 font-medium">
              {obtenerNombreMesActual()}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Total de la SEMANA (lunes a sábado) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {estadisticas.citasEstaSemana}
            </div>
            <div className="text-xs text-gray-600 font-medium">Esta Semana (Lun-Sáb)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasCitas;