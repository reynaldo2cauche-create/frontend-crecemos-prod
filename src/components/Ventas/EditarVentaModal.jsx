import React from 'react';
import { createPortal } from 'react-dom';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import VenderServiciosTab from '../../pages/Ventas/VenderServiciosTab';
import VenderProductosTab from '../../pages/Ventas/VenderProductosTab';

const EditarVentaModal = ({ venta, tipo, onGuardar, onClose, loading }) => {
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <PencilIcon className="w-5 h-5 text-[#7B1FA2]" />
            <h2 className="font-bold text-gray-900">
              Editar Venta de {tipo === 'servicio' ? 'Servicio' : 'Producto'}
            </h2>
            {venta.codigo_comprobante && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                {venta.codigo_comprobante}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {tipo === 'servicio' ? (
            <VenderServiciosTab
              modoEdicion={true}
              ventaExistente={venta}
              onGuardarEdicion={onGuardar}
              onCancelarEdicion={onClose}
            />
          ) : (
            <VenderProductosTab
              modoEdicion={true}
              ventaExistente={venta}
              onGuardarEdicion={onGuardar}
              onCancelarEdicion={onClose}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditarVentaModal;
