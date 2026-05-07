import React from 'react';
import { createPortal } from 'react-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const FeedbackModal = ({ tipo, mensaje, onClose }) =>
  createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-8 flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            tipo === 'exito' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {tipo === 'exito' ? (
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            )}
          </div>
          <h3 className={`text-lg font-bold mb-2 ${tipo === 'exito' ? 'text-gray-900' : 'text-red-700'}`}>
            {tipo === 'exito' ? '¡Listo!' : 'Ocurrió un error'}
          </h3>
          <p className="text-sm text-gray-600">{mensaje}</p>
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className={`w-full py-2.5 text-sm font-semibold text-white rounded-xl transition-colors ${
              tipo === 'exito' ? 'bg-[#7B1FA2] hover:bg-[#6A1B9A]' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

export default FeedbackModal;
