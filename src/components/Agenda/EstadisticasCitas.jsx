import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, TrendingUp } from 'lucide-react';
import { obtenerEstadisticasCitas } from '../../services/citasEstadisticasService';

// Sparkline decorativo (igual que en Lista de Pacientes)
const Sparkline = ({ color = '#7B1FA2' }) => {
  const id = `spk-${color.replace('#', '')}`;
  return (
    <svg className="absolute bottom-0 left-0 w-full h-9 pointer-events-none" viewBox="0 0 120 40" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0,28 C15,24 22,13 36,18 C50,23 58,8 72,12 C86,16 98,27 120,15 L120,40 L0,40 Z" fill={`url(#${id})`} />
      <path d="M0,28 C15,24 22,13 36,18 C50,23 58,8 72,12 C86,16 98,27 120,15" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.45" />
    </svg>
  );
};

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
    // Skeleton que imita las tarjetas reales (tinte por tipo de métrica)
    const tonos = esTerapeuta
      ? ['bg-blue-50', 'bg-green-50', 'bg-amber-50']
      : ['bg-purple-50', 'bg-blue-50', 'bg-green-50', 'bg-amber-50'];
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {tonos.map((tono, i) => (
          <div key={i} className="glass-card rounded-2xl p-4 relative overflow-hidden">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-xl ${tono} flex-shrink-0 animate-pulse`} />
              <div className="min-w-0 flex-1 space-y-2.5">
                <div className="h-2.5 w-2/3 rounded-full bg-gray-200/80 animate-pulse" />
                <div className="h-6 w-10 rounded-lg bg-gray-200 animate-pulse" />
                <div className="h-2 w-1/2 rounded-full bg-gray-100 animate-pulse" />
              </div>
            </div>
            {/* barrido shimmer */}
            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent cx-shimmer" />
          </div>
        ))}
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
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-[#7B1FA2]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-400 truncate">Total del Año</p>
            <p className="text-[26px] font-extrabold text-gray-900 leading-tight">{estadisticas.totalCitasAnio}</p>
            <p className="text-[11px] text-gray-400 -mt-0.5 truncate">{estadisticas.anioBase}</p>
          </div>
        </div>
        <Sparkline color="#7B1FA2" />
        </div> )}

      {/* 2. Total del MES (sin reuniones clínicas) */}
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-400 truncate">Citas del Mes</p>
            <p className="text-[26px] font-extrabold text-gray-900 leading-tight">{estadisticas.totalCitasMes}</p>
            <p className="text-[11px] text-gray-400 -mt-0.5 truncate capitalize">{obtenerNombreMes()}</p>
          </div>
        </div>
        <Sparkline color="#2563eb" />
      </div>

      {/* 3. Total de la SEMANA (lunes a sábado - sin reuniones clínicas) */}
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-green-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-400 truncate">Esta Semana</p>
            <p className="text-[26px] font-extrabold text-gray-900 leading-tight">{estadisticas.citasEstaSemana}</p>
            <p className="text-[11px] text-gray-400 -mt-0.5 truncate">Lunes a Sábado</p>
          </div>
        </div>
        <Sparkline color="#16a34a" />
      </div>

      {/* 4. Reuniones Clínicas del Mes */}
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-amber-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-400 truncate">Reuniones Clínicas</p>
            <p className="text-[26px] font-extrabold text-gray-900 leading-tight">{estadisticas.totalReunionesClinicasMes || 0}</p>
            <p className="text-[11px] text-gray-400 -mt-0.5 truncate">Este mes</p>
          </div>
        </div>
        <Sparkline color="#f59e0b" />
      </div>
    </div>
  );
};

export default EstadisticasCitas;