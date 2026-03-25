import React from 'react';
import { CheckCircle } from 'lucide-react';

const ModalExito = ({ isOpen, onClose, mensaje = '¡Operación exitosa!' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-75" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full border border-gray-200">
          {/* Contenido */}
          <div className="p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{mensaje}</h3>
            <p className="text-sm text-gray-600">La venta se registró correctamente</p>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 rounded-b-xl">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-[#7B1FA2] text-white rounded-lg font-semibold text-sm hover:bg-[#6A1B9A] transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalExito;
