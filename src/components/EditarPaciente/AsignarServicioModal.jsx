import React, { useState, useEffect, useMemo } from 'react';
import { X, UserPlus, Loader2, Briefcase, User } from 'lucide-react';
import { ROLES } from '../../constants/roles';
import { getTrabajadoresByServicio } from '../../services/trabajadorServicioService';

const ORDEN_AREAS = ['infantil', 'adolescente', 'adulto'];
const prioridadArea = (nombre = '') => {
  const n = nombre.toLowerCase();
  const idx = ORDEN_AREAS.findIndex(k => n.includes(k));
  return idx === -1 ? ORDEN_AREAS.length : idx;
};

const AsignarServicioModal = ({ open, onClose, servicios, terapeutas, nuevoServicio, setNuevoServicio, onAsignar, serviciosActualesPaciente = [] }) => {
  const [saving, setSaving] = useState(false);
  const [terapeutasFiltrados, setTerapeutasFiltrados] = useState([]);
  const [loadingTerapeutas, setLoadingTerapeutas] = useState(false);

  // Agrupar servicios por área en orden: Infantil → Adolescentes → Adultos → Otros
  const serviciosPorArea = useMemo(() => {
    const grupos = {};
    servicios.forEach(s => {
      const areaNombre = s.area?.nombre || 'Otros Servicios';
      if (!grupos[areaNombre]) grupos[areaNombre] = [];
      grupos[areaNombre].push(s);
    });
    return Object.entries(grupos).sort(([a], [b]) => prioridadArea(a) - prioridadArea(b));
  }, [servicios]);

  // Encontrar el servicio seleccionado por ID
  const servicioSeleccionado = useMemo(() => {
    return servicios.find(s => s.id === parseInt(nuevoServicio.servicio));
  }, [servicios, nuevoServicio.servicio]);

  // Cargar terapeutas filtrados cuando se selecciona un servicio
  useEffect(() => {
    const cargarTerapeutasFiltrados = async () => {
      if (servicioSeleccionado) {
        setLoadingTerapeutas(true);
        try {
          const trabajadoresDelServicio = await getTrabajadoresByServicio(servicioSeleccionado.id);
          // Filtrar solo los que sean terapeutas activos
          const terapeutasDelServicio = trabajadoresDelServicio.filter(
            t => t.estado === true && t.rol?.id === ROLES.TERAPEUTA
          );
          setTerapeutasFiltrados(terapeutasDelServicio);
        } catch (error) {
          console.error('Error al cargar terapeutas del servicio:', error);
          // Si hay error, mostrar todos los terapeutas
          setTerapeutasFiltrados(terapeutas.filter(t => t.estado === true && t.rol?.id === ROLES.TERAPEUTA));
        } finally {
          setLoadingTerapeutas(false);
        }
      } else {
        // Si no hay servicio seleccionado, mostrar todos
        setTerapeutasFiltrados(terapeutas.filter(t => t.estado === true && t.rol?.id === ROLES.TERAPEUTA));
      }
    };

    cargarTerapeutasFiltrados();
  }, [servicioSeleccionado, terapeutas]);

  const handleAsignar = async () => {
    setSaving(true);
    try {
      await onAsignar();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header — estética lavanda */}
        <div
          className="relative px-6 py-5 overflow-hidden border-b border-purple-100/60"
          style={{ backgroundImage: 'radial-gradient(70% 140% at 100% 0%, rgba(123,31,162,.07) 0%, rgba(123,31,162,0) 60%), linear-gradient(120deg, #ffffff 0%, #fdfbff 60%, #faf6fe 100%)' }}
        >
          <div className="pointer-events-none absolute -top-10 right-10 w-32 h-32 rounded-full bg-[#7B1FA2]/[0.06] blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center shadow-md shadow-purple-500/30 flex-shrink-0">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#2D0A4E] leading-tight">Asignar Nuevo Servicio</h2>
              <p className="text-[13px] text-gray-500">Selecciona servicio y terapeuta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Servicio Select */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#7B1FA2]" />
              Servicio
              <span className="text-red-400">*</span>
            </label>
            <select
              value={nuevoServicio.servicio}
              onChange={e => setNuevoServicio({ ...nuevoServicio, servicio: e.target.value })}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all bg-white"
            >
              <option value="">Seleccione un servicio</option>
              {serviciosPorArea.map(([areaNombre, lista]) => (
                <optgroup key={areaNombre} label={areaNombre}>
                  {lista.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Terapeuta Select */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#7B1FA2]" />
              Terapeuta
              <span className="text-red-400">*</span>
              {loadingTerapeutas && (
                <Loader2 className="w-3 h-3 animate-spin text-[#7B1FA2]" />
              )}
            </label>
            <select
              value={nuevoServicio.terapeuta}
              onChange={e => setNuevoServicio({ ...nuevoServicio, terapeuta: e.target.value })}
              disabled={loadingTerapeutas || !nuevoServicio.servicio}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {!nuevoServicio.servicio
                  ? 'Primero seleccione un servicio'
                  : loadingTerapeutas
                  ? 'Cargando terapeutas...'
                  : terapeutasFiltrados.length === 0
                  ? 'No hay terapeutas para este servicio'
                  : 'Seleccione un terapeuta'}
              </option>
              {terapeutasFiltrados.map(t => (
                <option key={t.id} value={t.nombres + ' ' + t.apellidos}>
                  {t.nombres} {t.apellidos}{t.especialidad ? ` — ${t.especialidad.nombre}` : ''}
                </option>
              ))}
            </select>
            {nuevoServicio.servicio && terapeutasFiltrados.length > 0 && (
              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                {terapeutasFiltrados.length} terapeuta{terapeutasFiltrados.length !== 1 ? 's' : ''} disponible{terapeutasFiltrados.length !== 1 ? 's' : ''} para este servicio
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 rounded-full border border-gray-200 hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleAsignar}
            disabled={saving || !nuevoServicio.servicio || !nuevoServicio.terapeuta}
            className="cx-glow px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] rounded-full shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Asignando...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Asignar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AsignarServicioModal; 