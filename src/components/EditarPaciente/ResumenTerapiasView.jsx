import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { getResumenTerapiasPorPaciente } from '../../services/citaService';
import ListadoCitasPorServicio from './ListadoCitasPorServicio';
import { ROLES } from '../../constants/roles';

// Chip resumen (mismo look que FiliacionView / ArchivosDigitales)
const SummaryChip = ({ Icon, label, value, color = 'text-[#7B1FA2]', bg = 'bg-purple-100/70' }) => (
  <div className="rounded-xl bg-[#F5F0FA] p-3 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all">
    <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-[18px] h-[18px] ${color}`} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-[13px] font-semibold text-gray-700 break-words leading-snug">{value}</p>
    </div>
  </div>
);

const ColColumnas = ({
  asistencias,
  faltas,
  colorAsist = 'text-[#7B1FA2]',
  colorFaltas = 'text-red-600',
  labelAsist = 'text-gray-400',
  labelFaltas = 'text-gray-400',
  divisor = 'bg-gray-200',
}) => (
  <div className="flex items-center justify-between" style={{ width: '148px' }}>
    <div className="flex flex-col items-center" style={{ width: '60px' }}>
      <span className={`text-xl font-semibold leading-none ${colorAsist}`}>{asistencias}</span>
      <span className={`text-[10px] uppercase tracking-wide mt-0.5 ${labelAsist}`}>Asist.</span>
    </div>
    <div className={`w-px h-8 ${divisor}`} style={{ flexShrink: 0 }} />
    <div className="flex flex-col items-center" style={{ width: '60px' }}>
      <span className={`text-xl font-semibold leading-none ${colorFaltas}`}>{faltas}</span>
      <span className={`text-[10px] uppercase tracking-wide mt-0.5 ${labelFaltas}`}>Faltas</span>
    </div>
  </div>
);

const ResumenTerapiasView = ({ pacienteId, user, pacienteNombre }) => {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const puedeVerHistorial = user?.rol?.id === ROLES.ADMINISTRADOR || user?.rol?.id === ROLES.ADMISION;

  useEffect(() => {
    if (!pacienteId) return;
    const cargarResumen = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getResumenTerapiasPorPaciente(pacienteId);
        setResumen(data);
      } catch (err) {
        console.error('Error al cargar resumen de terapias:', err);
        setError('No se pudo cargar el resumen de terapias');
      } finally {
        setLoading(false);
      }
    };
    cargarResumen();
  }, [pacienteId]);

  if (loading) {
    return (
      <div className="glass-panel rounded-3xl p-5">
        <div className="flex items-center justify-center py-12">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-purple-100 rounded-full" />
            <div className="absolute inset-0 border-2 border-transparent border-t-[#7B1FA2] rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel rounded-3xl p-5">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const totalAsist = resumen?.totales?.asistencias ?? 0;
  const totalFaltas = resumen?.totales?.faltas ?? 0;
  const totalServicios = resumen?.servicios?.length ?? 0;

  return (
    <div className="space-y-4 mb-10">
      {/* Header principal con chips */}
      <div className="glass-panel rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-500/20">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#2D0A4E] leading-tight">Resumen de Terapias</h2>
            <p className="text-[13px] text-gray-400">
              Asistencias y faltas por servicio
              {pacienteNombre && ` · ${pacienteNombre}`}
            </p>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-gray-200 to-transparent my-4" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SummaryChip Icon={BarChart3} label="Servicios activos" value={totalServicios} />
          <SummaryChip Icon={BarChart3} label="Asistencias totales" value={totalAsist} color="text-emerald-600" bg="bg-emerald-100/70" />
          <SummaryChip Icon={BarChart3} label="Faltas totales" value={totalFaltas} color="text-red-600" bg="bg-red-100/70" />
        </div>
      </div>

      {/* Listado por servicio */}
      <div className="glass-panel rounded-3xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 ring-1 ring-black/[0.03]">
            <BarChart3 className="w-5 h-5 text-[#7B1FA2]" />
          </div>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap">Por Servicio</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
        </div>

        {resumen && resumen.servicios && resumen.servicios.length > 0 ? (
          <>
            <div className="space-y-3">
              {resumen.servicios.map((servicio) => (
                <div key={servicio.servicio_id} className="rounded-2xl bg-[#F5F0FA] p-4 flex items-center hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{servicio.servicio_nombre}</p>
                    <p className="text-xs text-gray-400">Servicio activo</p>
                  </div>
                  <ColColumnas asistencias={servicio.asistencias} faltas={servicio.faltas} />
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="mt-3 flex items-center rounded-2xl px-4 py-3 border border-purple-200/60 bg-gradient-to-r from-[#7B1FA2]/8 to-[#9C27B0]/5">
              <span className="flex-1 text-sm font-bold text-[#7B1FA2]">Total general</span>
              <ColColumnas
                asistencias={totalAsist}
                faltas={totalFaltas}
                colorAsist="text-[#7B1FA2]"
                colorFaltas="text-red-600"
                labelAsist="text-[#7B1FA2]/60"
                labelFaltas="text-red-400"
                divisor="bg-[#7B1FA2]/20"
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-8 h-8 text-[#7B1FA2]/40" />
            </div>
            <p className="text-sm font-semibold text-gray-500">No hay terapias registradas aún</p>
            <p className="text-xs text-gray-400 mt-1">El resumen aparecerá cuando se registren citas</p>
          </div>
        )}
      </div>

      {/* Historial de citas (ListadoCitasPorServicio) */}
      {pacienteId && puedeVerHistorial && (
        <ListadoCitasPorServicio pacienteId={pacienteId} pacienteNombre={pacienteNombre} />
      )}
    </div>
  );
};

export default ResumenTerapiasView;