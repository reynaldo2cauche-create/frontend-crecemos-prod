import React, { useState, useEffect } from 'react';
import { X, UserCheck, Loader2, Briefcase, User, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { ROLES } from '../../constants/roles';
import { getTrabajadoresByServicio } from '../../services/trabajadorServicioService';

const EditarTerapeutaModal = ({ open, onClose, servicio, nuevoTerapeuta, setNuevoTerapeuta, terapeutas, onGuardar }) => {
  const [saving, setSaving] = useState(false);
  const [terapeutasFiltrados, setTerapeutasFiltrados] = useState([]);
  const [loadingTerapeutas, setLoadingTerapeutas] = useState(false);
  const [transferirNotas, setTransferirNotas] = useState(true); // Por defecto activado

  // Cargar terapeutas filtrados cuando se abre el modal
  useEffect(() => {
    const cargarTerapeutasFiltrados = async () => {
      if (open && servicio?.servicio?.id) {
        setLoadingTerapeutas(true);
        try {
          const trabajadoresDelServicio = await getTrabajadoresByServicio(servicio.servicio.id);
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
      }
    };

    cargarTerapeutasFiltrados();
  }, [open, servicio, terapeutas]);

  const handleGuardar = async () => {
    setSaving(true);
    try {
      await onGuardar(transferirNotas); // Pasar el estado de transferencia
    } finally {
      setSaving(false);
    }
  };

  // Detectar si es cambio de terapeuta o primera asignación
  const terapeutaActual = servicio?.asignaciones?.[0]?.terapeuta;
  const esCambioTerapeuta = Boolean(terapeutaActual);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7B1FA2] to-purple-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Editar Terapeuta</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content - Scrolleable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Servicio (readonly) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#7B1FA2]" />
              Servicio
            </label>
            <div className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600">
              {servicio?.servicio?.nombre || 'Sin nombre'}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              El servicio no se puede cambiar, solo el terapeuta asignado
            </p>
          </div>

          {/* Terapeuta actual (si existe) */}
          {esCambioTerapeuta && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-7 sm:w-8 h-7 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-blue-900 mb-0.5 sm:mb-1">Terapeuta Actual</p>
                  <p className="text-sm font-bold text-blue-700 truncate">
                    {terapeutaActual.nombres} {terapeutaActual.apellidos}
                  </p>
                  {terapeutaActual.especialidad && (
                    <p className="text-xs text-blue-600 mt-0.5 truncate">
                      {terapeutaActual.especialidad.nombre}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Terapeuta Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#7B1FA2]" />
              Terapeuta
              <span className="text-red-500">*</span>
              {loadingTerapeutas && (
                <Loader2 className="w-3 h-3 animate-spin text-[#7B1FA2]" />
              )}
            </label>
            <select
              value={nuevoTerapeuta}
              onChange={e => setNuevoTerapeuta(e.target.value)}
              disabled={loadingTerapeutas}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] transition-colors bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingTerapeutas
                  ? 'Cargando terapeutas...'
                  : terapeutasFiltrados.length === 0
                  ? 'No hay terapeutas para este servicio'
                  : 'Sin asignar'}
              </option>
              {terapeutasFiltrados.map(t => (
                <option key={t.id} value={`${t.nombres} ${t.apellidos}`}>
                  {t.nombres} {t.apellidos}{t.especialidad ? ` — ${t.especialidad.nombre}` : ''}
                </option>
              ))}
            </select>
            {terapeutasFiltrados.length > 0 && !loadingTerapeutas && (
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                {terapeutasFiltrados.length} terapeuta
                {terapeutasFiltrados.length !== 1 ? 's' : ''} disponible
                {terapeutasFiltrados.length !== 1 ? 's' : ''} para este servicio
              </p>
            )}
          </div>

          {/* Opción de transferir notas (solo si es cambio de terapeuta) */}
          {esCambioTerapeuta && nuevoTerapeuta && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    id="transferir-notas"
                    checked={transferirNotas}
                    onChange={e => setTransferirNotas(e.target.checked)}
                    className="w-4 sm:w-5 h-4 sm:h-5 text-[#7B1FA2] border-2 border-purple-300 rounded focus:ring-2 focus:ring-[#7B1FA2] focus:ring-offset-0 cursor-pointer"
                  />
                </div>
                <label htmlFor="transferir-notas" className="flex-1 cursor-pointer select-none">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                    <ArrowRightLeft className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#7B1FA2]" />
                    <span className="text-xs sm:text-sm font-bold text-purple-900">
                      Transferir notas de evolución
                    </span>
                  </div>
                  <p className="text-xs text-purple-700 leading-relaxed">
                    El nuevo terapeuta verá las notas de{' '}
                    <span className="font-semibold">
                      {terapeutaActual.nombres}
                    </span>{' '}
                    para continuidad del tratamiento.
                  </p>
                </label>
              </div>

              {!transferirNotas && (
                <div className="mt-2 sm:mt-3 flex items-start gap-1.5 sm:gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3">
                  <AlertCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-800">
                    <span className="font-semibold">Advertencia:</span> El nuevo terapeuta no verá el historial previo.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-end gap-2 sm:gap-3 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={saving || !nuevoTerapeuta}
            className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-purple-600 rounded-xl hover:from-[#6A1B9A] hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-purple-500/30"
          >
            {saving ? (
              <>
                <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 animate-spin" />
                <span className="hidden sm:inline">Guardando...</span>
                <span className="sm:hidden">Guardar...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3 sm:w-4 h-3 sm:h-4" />
                <span className="hidden sm:inline">Guardar Cambios</span>
                <span className="sm:hidden">Guardar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarTerapeutaModal;
