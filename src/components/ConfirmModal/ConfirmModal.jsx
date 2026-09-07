import React from 'react';
import { TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * Modal de confirmación reutilizable (estilo del sistema).
 * Props: open, title, message, confirmLabel, onConfirm, onCancel, loading, danger.
 */
export default function ConfirmModal({
  open,
  title = '¿Confirmar?',
  message = '',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
  danger = true,
}) {
  if (!open) return null;

  const grad = danger ? 'from-red-500 to-red-600' : 'from-[#7B1FA2] to-[#6A1B9A]';
  const btn = danger ? 'bg-red-500 hover:bg-red-600' : 'bg-[#7B1FA2] hover:bg-[#6A1B9A]';
  const Icon = danger ? TrashIcon : ExclamationTriangleIcon;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`bg-gradient-to-r ${grad} px-6 py-4`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white ${btn} rounded-lg transition-all shadow-sm hover:shadow disabled:opacity-50`}
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Eliminando...</>
            ) : (
              <><TrashIcon className="w-4 h-4" /> {confirmLabel}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
