import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

const DialogMotivo = ({
  open,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message = "Por favor ingrese el motivo:",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmColor = "red" // 'red' | 'purple' | 'green'
}) => {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setMotivo('');
      setError('');
    }
  }, [open]);

  const handleConfirm = () => {
    if (!motivo.trim()) {
      setError('El motivo es obligatorio');
      return;
    }

    onConfirm(motivo.trim());
    setMotivo('');
    setError('');
  };

  const handleClose = () => {
    setMotivo('');
    setError('');
    onClose();
  };

  if (!open) return null;

  const colorClasses = {
    red: {
      button: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-500/30',
      border: 'border-red-300 focus:border-red-500',
      text: 'text-red-600'
    },
    purple: {
      button: 'bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] hover:from-[#6A1B9A] hover:to-[#7B1FA2] shadow-purple-500/30',
      border: 'border-purple-300 focus:border-purple-500',
      text: 'text-[#7B1FA2]'
    },
    green: {
      button: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-green-500/30',
      border: 'border-green-300 focus:border-green-500',
      text: 'text-green-600'
    }
  };

  const colors = colorClasses[confirmColor] || colorClasses.red;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                confirmColor === 'red' ? 'bg-red-100' :
                confirmColor === 'purple' ? 'bg-purple-100' :
                'bg-green-100'
              }`}>
                <AlertCircle className={`w-5 h-5 ${colors.text}`} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600">{message}</p>

          <div>
            <textarea
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                if (error) setError('');
              }}
              placeholder="Escriba el motivo aquí..."
              rows={4}
              className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-colors resize-none ${
                error ? 'border-red-300 focus:border-red-500' : `${colors.border} border-gray-200`
              }`}
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-end gap-3 border-t border-gray-100">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-lg ${colors.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DialogMotivo;
