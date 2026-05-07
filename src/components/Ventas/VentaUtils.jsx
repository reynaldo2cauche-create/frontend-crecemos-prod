import React from 'react';
import { SparklesIcon, GiftIcon } from '@heroicons/react/24/outline';
import { TIPOS_PAGADOR } from '../../services/ventasService';
import { getInfoBeneficio } from './TicketComponents';

export const formatFecha = (f) => {
  if (!f) return '—';
  const [year, month, day] = String(f).slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export const formatMonto = (n) =>
  `S/ ${parseFloat(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

export const formatMoney = (num) =>
  parseFloat(num || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const tipoPagadorNombre = (id) => {
  switch (id) {
    case TIPOS_PAGADOR.PACIENTE:    return 'Paciente';
    case TIPOS_PAGADOR.RESPONSABLE: return 'Responsable';
    case TIPOS_PAGADOR.EXTERNO:     return 'Externo';
    default: return '—';
  }
};

export const calcularIgv = (total, tipoComprobanteId) => {
  const conIgv = tipoComprobanteId === 2 || tipoComprobanteId === 3;
  if (!conIgv) return { base: parseFloat(total || 0), igv: 0, conIgv: false };
  const t = parseFloat(total || 0);
  return { base: t / 1.18, igv: t - t / 1.18, conIgv: true };
};

export const ComprobanteLabel = ({ nombre, id }) => {
  const estilos = {
    1: 'bg-gray-100 text-gray-600',
    2: 'bg-blue-50 text-blue-700',
    3: 'bg-emerald-50 text-emerald-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estilos[id] || 'bg-gray-100 text-gray-600'}`}>
      {nombre || '—'}
    </span>
  );
};

export const DescuentoLabel = ({ tipoDescuento, valor, monto, className = '' }) => {
  if (!monto || parseFloat(monto) <= 0 || !tipoDescuento) return null;
  return (
    <p className={`text-xs text-amber-600 font-medium ${className}`}>
      Descuento ({tipoDescuento.nombre}):&nbsp;
      {tipoDescuento.id === 1
        ? `${parseFloat(valor)}% = - ${formatMonto(monto)}`
        : `- ${formatMonto(valor)}`}
    </p>
  );
};

export const PanelPromocionesDetalle = ({ promociones = [] }) => {
  if (!promociones || promociones.length === 0) return null;

  const totalAhorrado = promociones.reduce((s, p) => {
    const { esProductoGratis, esItemGratis } = getInfoBeneficio(p);
    return (esProductoGratis || esItemGratis) ? s : s + parseFloat(p.monto_ahorrado || 0);
  }, 0);

  return (
    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <SparklesIcon className="w-4 h-4 text-green-600" />
        <span className="text-sm font-bold text-green-700">
          {promociones.length} promoción{promociones.length > 1 ? 'es' : ''} aplicada{promociones.length > 1 ? 's' : ''}
        </span>
      </div>

      {promociones.map((p, i) => {
        const { esProductoGratis, esItemGratis, nombreProducto } = getInfoBeneficio(p);
        return (
          <div key={i} className="flex items-start justify-between bg-white/70 rounded-lg px-3 py-2 gap-3">
            <div className="flex items-start gap-2">
              <GiftIcon className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-green-800">
                  {p.promocion?.nombre || `Promoción #${p.promocion_id}`}
                </p>
                {p.promocion?.descripcion && (
                  <p className="text-xs text-green-600">{p.promocion.descripcion}</p>
                )}
                {esProductoGratis && (
                  <p className="text-xs font-medium text-emerald-700 mt-0.5">
                    🎁 Producto incluido gratis: <span className="font-bold">{nombreProducto}</span>
                  </p>
                )}
                {esItemGratis && (
                  <p className="text-xs font-medium text-emerald-700 mt-0.5">
                    🎁 El ítem más barato va <span className="font-bold">gratis</span>
                  </p>
                )}
              </div>
            </div>
            {!esProductoGratis && !esItemGratis && (
              <span className="text-sm font-bold text-green-700 shrink-0">
                -{formatMonto(p.monto_ahorrado)}
              </span>
            )}
          </div>
        );
      })}

      {totalAhorrado > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-green-200">
          <span className="text-sm font-bold text-green-800">Total ahorrado</span>
          <span className="text-sm font-bold text-green-700">-{formatMonto(totalAhorrado)}</span>
        </div>
      )}
    </div>
  );
};
