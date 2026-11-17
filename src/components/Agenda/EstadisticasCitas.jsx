import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Loader2, Users, TrendingUp } from 'lucide-react';
import { obtenerEstadisticasCitas } from '../../services/citasEstadisticasService';

const EstadisticasCitas = ({ 
  fechaDesde, 
  fechaHasta, 
  terapeutaId = null,
  fechaReferencia = null // 🆕 Fecha visible en el calendario
}) => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
  const esTerapeuta = user?.rol?.id === 4; 

  useEffect(() => {
    cargarEstadisticas();
  }, [fechaDesde, fechaHasta, terapeutaId, fechaReferencia]);

  const cargarEstadisticas = async () => {
    if (!fechaDesde || !fechaHasta) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Cargando estadísticas:', {
        fechaDesde,
        fechaHasta,
        terapeutaId,
        fechaReferencia
      });

      const data = await obtenerEstadisticasCitas(
        fechaDesde, 
        fechaHasta, 
        terapeutaId,
        fechaReferencia
      );
      
      console.log('✅ Estadísticas recibidas:', data);
      setEstadisticas(data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      setError('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const obtenerNombreMes = () => {
    if (!estadisticas?.mesDesde) return '';
    const [year, month] = estadisticas.mesDesde.split('-');
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total del AÑO (sin reuniones clínicas) */}
      {!esTerapeuta && (
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-[#7B1FA2]" />
          </div>
          <div>
            <div className="text-[26px] font-extrabold text-gray-900 leading-tight">
              {estadisticas.totalCitasAnio}
            </div>
            <div className="text-[11px] text-gray-400 font-medium">
              Total del Año {estadisticas.anioBase}
            </div>
          </div>
        </div>
        </div> )}

      {/* 2. Total del MES (sin reuniones clínicas) */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-[26px] font-extrabold text-gray-900 leading-tight">
              {estadisticas.totalCitasMes}
            </div>
            <div className="text-[11px] text-gray-400 font-medium">
              {obtenerNombreMes()}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Total de la SEMANA (lunes a sábado - sin reuniones clínicas) */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-[26px] font-extrabold text-gray-900 leading-tight">
              {estadisticas.citasEstaSemana}
            </div>
            <div className="text-[11px] text-gray-400 font-medium">
              Esta Semana (Lun-Sáb)
            </div>
          </div>
        </div>
      </div>

      {/* 4. Reuniones Clínicas del Mes */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="text-[26px] font-extrabold text-gray-900 leading-tight">
              {estadisticas.totalReunionesClinicasMes || 0}
            </div>
            <div className="text-[11px] text-gray-400 font-medium">
              Reuniones Clínicas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasCitas;