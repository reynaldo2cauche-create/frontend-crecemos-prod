import React, { useState, useEffect } from 'react';
import { X, UserCheck, Loader2, Briefcase, User, AlertCircle } from 'lucide-react';
import { ROLES } from '../../constants/roles';
import { getTrabajadoresByServicio } from '../../services/trabajadorServicioService';

const EditarTerapeutaModal = ({ open, onClose, servicio, nuevoTerapeuta, setNuevoTerapeuta, terapeutas, onGuardar }) => {
  const [saving, setSaving] = useState(false);
  const [terapeutasFiltrados, setTerapeutasFiltrados] = useState([]);
  const [loadingTerapeutas, setLoadingTerapeutas] = useState(false);
  const [terapeutaActual, setTerapeutaActual] = useState(null);

  // Cargar terapeutas filtrados cuando se abre el modal
  useEffect(() => {
    const cargarTerapeutasFiltrados = async () => {
      if (open && servicio?.servicio?.id) {
        setLoadingTerapeutas(true);
        try {
          const trabajadoresDelServicio = await getTrabajadoresByServicio(servicio.servicio.id);
          const terapeutasDelServicio = trabajadoresDelServicio.filter(
            t => t.estado === true && t.rol?.id === ROLES.TERAPEUTA
          );
          
          // Guardar terapeuta actual
          const actual = servicio?.asignaciones?.[0]?.terapeuta;
          setTerapeutaActual(actual);
          
          // Si hay terapeuta actual y no está en la lista, agregarlo
          if (actual && !terapeutasDelServicio.some(t => t.id === actual.id)) {
            terapeutasDelServicio.push(actual);
          }
          
          setTerapeutasFiltrados(terapeutasDelServicio);
          
          // Si no hay nuevoTerapeuta seleccionado, establecer el actual como predeterminado
          if (!nuevoTerapeuta && actual) {
            setNuevoTerapeuta(String(actual.id));
          }
        } catch (error) {
          console.error('Error al cargar terapeutas del servicio:', error);
          const todosLosTerapeutas = terapeutas.filter(t => t.estado === true && t.rol?.id === ROLES.TERAPEUTA);
          setTerapeutasFiltrados(todosLosTerapeutas);
          
          const actual = servicio?.asignaciones?.[0]?.terapeuta;
          setTerapeutaActual(actual);
          
          if (!nuevoTerapeuta && actual) {
            setNuevoTerapeuta(String(actual.id));
          }
        } finally {
          setLoadingTerapeutas(false);
        }
      }
    };

    cargarTerapeutasFiltrados();
  }, [open, servicio, terapeutas]);

  const handleGuardar = async () => {
    setSaving(true);
    try {
      await onGuardar();
    } finally {
      setSaving(false);
    }
  };

  // Si no está abierto, no renderizar nada
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
      >
        {/* Header — estética lavanda */}
        <div
          className="relative px-6 py-5 overflow-hidden border-b border-purple-100/60"
          style={{ backgroundImage: 'radial-gradient(70% 140% at 100% 0%, rgba(123,31,162,.07) 0%, rgba(123,31,162,0) 60%), linear-gradient(120deg, #ffffff 0%, #fdfbff 60%, #faf6fe 100%)' }}
        >
          <div className="pointer-events-none absolute -top-10 right-10 w-32 h-32 rounded-full bg-[#7B1FA2]/[0.06] blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center shadow-md shadow-purple-500/30 flex-shrink-0">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#2D0A4E] leading-tight">Editar Terapeuta</h2>
              <p className="text-[13px] text-gray-500">Cambia el terapeuta asignado al servicio</p>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-5">
          {/* Servicio (readonly) */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Servicio</label>
            <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">
              {servicio?.servicio?.nombre || 'Sin nombre'}
            </div>
            <p className="text-xs text-gray-400 mt-1.5 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              El servicio no se puede cambiar, solo el terapeuta asignado
            </p>
          </div>

          {/* Terapeuta actual (si existe) */}
          {terapeutaActual && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Terapeuta Actual</label>
              <div className="px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl">
                <p className="text-sm font-bold text-gray-900">
                  {terapeutaActual.nombres} {terapeutaActual.apellidos}
                </p>
                {terapeutaActual.especialidad && (
                  <p className="text-xs text-gray-500 mt-0.5">{terapeutaActual.especialidad.nombre}</p>
                )}
              </div>
            </div>
          )}

          {/* Terapeuta Select */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              Nuevo Terapeuta <span className="text-red-400">*</span>
              {loadingTerapeutas && <Loader2 className="w-3 h-3 animate-spin text-[#7B1FA2]" />}
            </label>
            <select
              value={nuevoTerapeuta || ""}
              onChange={(e) => setNuevoTerapeuta(e.target.value)}
              disabled={loadingTerapeutas}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingTerapeutas
                  ? 'Cargando terapeutas...'
                  : terapeutasFiltrados.length === 0
                    ? 'No hay terapeutas para este servicio'
                    : 'Selecciona un terapeuta'}
              </option>
              {terapeutasFiltrados.map(t => (
                <option key={t.id} value={String(t.id)}>
                  {t.nombres} {t.apellidos}{t.especialidad ? ` — ${t.especialidad.nombre}` : ''}
                  {terapeutaActual && t.id === terapeutaActual.id ? ' (Actual)' : ''}
                </option>
              ))}
            </select>
            {terapeutasFiltrados.length > 0 && !loadingTerapeutas && (
              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                {terapeutasFiltrados.length} terapeuta{terapeutasFiltrados.length !== 1 ? 's' : ''} disponible{terapeutasFiltrados.length !== 1 ? 's' : ''} para este servicio
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center gap-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 rounded-full border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={!nuevoTerapeuta || saving}
            className="flex-1 cx-glow px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] rounded-full shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                {terapeutaActual && nuevoTerapeuta === String(terapeutaActual.id) ? 'Mantener' : 'Asignar'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarTerapeutaModal;