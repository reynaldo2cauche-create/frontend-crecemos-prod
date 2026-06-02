import React, { useState, useEffect } from 'react';
import { getResumenTerapiasPorPaciente } from '../../services/citaService';
import ListadoCitasPorServicio from './ListadoCitasPorServicio';
import { ROLES } from '../../constants/roles'; // ajusta la ruta según tu estructura
const ResumenTerapiasView = ({ pacienteId, user, pacienteNombre }) => {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Solo Administrador y Admisión ven el listado detallado de citas
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

  if (loading) return <div className="h-32 bg-gray-50 rounded-xl animate-pulse" />;

  if (error) return (
    <div className="bg-red-50 border border-gray-200 rounded-xl p-4 text-center">
      <p className="text-red-700 text-sm">{error}</p>
    </div>
  );

  const ColColumnas = ({ asistencias, faltas, colorAsist = 'text-[#7B1FA2]', colorFaltas = 'text-red-700', labelAsist = 'text-gray-400', labelFaltas = 'text-gray-400', divisor = 'bg-gray-100' }) => (
    <div className="flex items-center justify-between" style={{ width: '148px' }}>
      <div className="flex flex-col items-center" style={{ width: '60px' }}>
        <span className={`text-xl font-medium leading-none ${colorAsist}`}>{asistencias}</span>
        <span className={`text-[10px] uppercase tracking-wide mt-0.5 ${labelAsist}`}>Asist.</span>
      </div>
      <div className={`w-px h-8 ${divisor}`} style={{ flexShrink: 0 }} />
      <div className="flex flex-col items-center" style={{ width: '60px' }}>
        <span className={`text-xl font-medium leading-none ${colorFaltas}`}>{faltas}</span>
        <span className={`text-[10px] uppercase tracking-wide mt-0.5 ${labelFaltas}`}>Faltas</span>
      </div>
    </div>
  );

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2.5 pb-3 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-[#7B1FA2]/5 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-[#7B1FA2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-gray-900">Resumen de terapias</h3>
      </div>

      {/* Cards - SOLO si hay resumen */}
      {resumen && resumen.servicios && resumen.servicios.length > 0 ? (
        <>
          <div className="flex flex-col gap-2">
            {resumen.servicios.map((servicio) => (
              <div key={servicio.servicio_id} className="flex items-center bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-gray-200 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{servicio.servicio_nombre}</p>
                  <p className="text-xs text-gray-400">Servicio activo</p>
                </div>
                <ColColumnas
                  asistencias={servicio.asistencias}
                  faltas={servicio.faltas}
                />
              </div>
            ))}
          </div>

          {/* Pie — totales */}
          <div className="flex items-center mt-1.5 rounded-xl px-4 py-2.5 border border-[#7B1FA2]/15 bg-[#7B1FA2]/5">
            <span className="flex-1 text-xs font-medium text-[#7B1FA2]">Total general</span>
            <ColColumnas
              asistencias={resumen.totales.asistencias}
              faltas={resumen.totales.faltas}
              colorAsist="text-[#7B1FA2]"
              colorFaltas="text-red-700"
              labelAsist="text-[#7B1FA2]/60"
              labelFaltas="text-red-400"
              divisor="bg-[#7B1FA2]/20"
            />
          </div>
        </>
      ) : (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center mb-4">
          <p className="text-gray-400 text-sm">No hay terapias registradas aún</p>
        </div>
      )}

      {/* 🔥 LISTADO DE CITAS - SIEMPRE VISIBLE */}
      {pacienteId && puedeVerHistorial && (
        <div className="mt-6">
          <ListadoCitasPorServicio pacienteId={pacienteId} pacienteNombre={pacienteNombre} />
        </div>
      )}
    </div>
  );
};
export default ResumenTerapiasView;