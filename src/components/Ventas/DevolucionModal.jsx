import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ReceiptRefundIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { previewDevolucion, crearNotaCredito } from '../../services/ventasService';
import { formatMonto } from './VentaUtils';

const hoyISO = () => new Date().toISOString().split('T')[0];

// Nombre de a quién se le hace la devolución (según el pagador de la venta)
const nombrePagador = (venta) => {
  if (venta?.paciente)
    return `${venta.paciente.nombres} ${venta.paciente.apellido_paterno} ${venta.paciente.apellido_materno || ''}`.trim();
  if (venta?.responsable)
    return `${venta.responsable.nombres} ${venta.responsable.apellido_paterno} ${venta.responsable.apellido_materno || ''}`.trim();
  if (venta?.comprador_externo)
    return venta.comprador_externo.nombre;
  return '—';
};

const DevolucionModal = ({ venta, modalidades = [], onClose, onDone }) => {
  const [loading, setLoading]     = useState(true);
  const [preview, setPreview]     = useState(null);
  const [error, setError]         = useState(null);
  const [procesando, setProcesando] = useState(false);

  const [form, setForm] = useState({
    fecha: hoyISO(),
    motivo: '',
    monto_devuelto: '',
    modalidad_pago_id: '',
  });

  useEffect(() => {
    let activo = true;
    setLoading(true);
    previewDevolucion(venta.id)
      .then(data => {
        if (!activo) return;
        setPreview(data);
        setForm(f => ({ ...f, monto_devuelto: String(data.monto_sugerido ?? 0) }));
      })
      .catch(e => activo && setError(e?.response?.data?.message || 'No se pudo cargar la devolución'))
      .finally(() => activo && setLoading(false));
    return () => { activo = false; };
  }, [venta.id]);

  const handleConfirm = async () => {
    if (!form.motivo.trim()) {
      setError('El motivo de la devolución es obligatorio');
      return;
    }
    setProcesando(true);
    setError(null);
    try {
      const res = await crearNotaCredito(venta.id, {
        fecha: form.fecha,
        motivo: form.motivo.trim(),
        monto_devuelto: Number(form.monto_devuelto || 0),
        modalidad_pago_id: form.modalidad_pago_id ? Number(form.modalidad_pago_id) : undefined,
      });
      onDone?.(res);
    } catch (e) {
      setError(e?.response?.data?.message || 'No se pudo registrar la nota de crédito');
      setProcesando(false);
    }
  };

  const yaDevuelta = preview?.ya_devuelta;
  const nadaQueAnular = preview && preview.total_sesiones_anulables === 0;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <ReceiptRefundIcon className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900">Devolución / Nota de crédito</h2>
            <p className="text-xs text-gray-500">
              {venta.codigo_comprobante ? `Venta ${venta.codigo_comprobante}` : `Venta #${venta.id}`}
            </p>
          </div>
          <button onClick={onClose} disabled={procesando}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          {loading && <p className="text-sm text-gray-500 py-6 text-center">Cargando devolución…</p>}

          {!loading && preview && (
            <>
              {/* A quién se le hace la devolución */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500">Devolución a</span>
                <span className="text-sm font-semibold text-gray-900 text-right">{nombrePagador(venta)}</span>
              </div>

              {yaDevuelta && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                  ℹ️ Esta venta ya tiene una nota de crédito
                  {preview.nota_credito?.codigo ? ` (${preview.nota_credito.codigo})` : ''}. No se puede volver a devolver.
                </div>
              )}

              {!yaDevuelta && nadaQueAnular && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">
                  No hay citas pendientes ni sesiones sin asignar para anular en esta venta.
                </div>
              )}

              {/* Resumen de lo que se anula */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-amber-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-amber-700">{preview.total_citas_pendientes}</p>
                  <p className="text-[11px] text-amber-800 leading-tight mt-0.5">Citas a anular<br/>(liberan agenda)</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-amber-700">{preview.total_sesiones_sin_asignar}</p>
                  <p className="text-[11px] text-amber-800 leading-tight mt-0.5">Sesiones sin<br/>asignar</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-700">{formatMonto(preview.total_venta)}</p>
                  <p className="text-[11px] text-gray-600 leading-tight mt-0.5">Total de<br/>la venta</p>
                </div>
              </div>

              {/* Detalle por línea */}
              {preview.lineas?.length > 0 && (
                <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 text-xs">
                  {preview.lineas.map(l => (
                    <div key={l.detalle_id} className="flex items-center justify-between px-3 py-2">
                      <span className="text-gray-700 pr-2 truncate">{l.descripcion}</span>
                      <span className="text-gray-500 whitespace-nowrap">
                        {l.sesiones_anulables > 0
                          ? `anula ${l.sesiones_anulables} (${l.citas_pendientes} cita/s + ${l.sesiones_sin_asignar} saldo)`
                          : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario */}
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha</label>
                    <input type="date" value={form.fecha}
                      onChange={e => setForm({ ...form, fecha: e.target.value })}
                      disabled={yaDevuelta || procesando}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:bg-gray-100" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Monto a devolver</label>
                    <input type="number" min="0" step="0.01" value={form.monto_devuelto}
                      onChange={e => setForm({ ...form, monto_devuelto: e.target.value })}
                      disabled={yaDevuelta || procesando}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:bg-gray-100" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Método de devolución</label>
                  <select value={form.modalidad_pago_id}
                    onChange={e => setForm({ ...form, modalidad_pago_id: e.target.value })}
                    disabled={yaDevuelta || procesando}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:bg-gray-100">
                    <option value="">— Sin especificar —</option>
                    {modalidades.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Motivo <span className="text-red-500">*</span>
                  </label>
                  <textarea rows={2} value={form.motivo}
                    onChange={e => setForm({ ...form, motivo: e.target.value })}
                    disabled={yaDevuelta || procesando}
                    placeholder="Motivo de la devolución"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:bg-gray-100 resize-none" />
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} disabled={procesando}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={handleConfirm}
            disabled={loading || procesando || yaDevuelta}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700 disabled:opacity-50">
            {procesando ? 'Registrando…' : 'Registrar devolución'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DevolucionModal;
