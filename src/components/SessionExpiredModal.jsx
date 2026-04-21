import React, { useEffect } from 'react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const SessionExpiredModal = ({ isOpen, onClose }) => {
  // Auto-cerrar después de 2.5 segundos
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // Bloquear scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      }}
    >
      {/* Modal minimalista */}
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 overflow-hidden"
        style={{
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        <div className="px-6 py-6 text-center">
          {/* Icono */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowRightOnRectangleIcon className="w-8 h-8 text-red-600" />
          </div>

          {/* Título */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">Sesión Cerrada</h3>

          {/* Mensaje */}
          <p className="text-sm text-gray-600 mb-1">
            Iniciaste sesión en otro dispositivo
          </p>
          <p className="text-xs text-gray-500">
            Redirigiendo al login...
          </p>

          {/* Barra de progreso */}
          <div className="w-full h-1 bg-gray-200 rounded-full mt-5 overflow-hidden">
            <div
              className="h-full bg-[#7B1FA2]"
              style={{
                animation: 'progress 2.5s linear'
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SessionExpiredModal;
