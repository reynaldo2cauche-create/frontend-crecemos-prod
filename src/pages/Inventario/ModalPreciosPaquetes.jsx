import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import {
  getPreciosPaquetesByServicioTarifa,
  crearPrecioPaquete,
  actualizarPrecioPaquete,
  eliminarPrecioPaquete,
} from '../../services/inventarioService';
import { getPaquetes } from '../../services/serviciosService';

const ModalPreciosPaquetes = ({ tarifa, onClose, onSaved }) => {
  const [paquetes, setPaquetes] = useState([]);
  const [preciosPaquetes, setPreciosPaquetes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [tarifa]);

  const cargarDatos = async () => {
    try {
      const [paqData, preciosData] = await Promise.all([
        getPaquetes(),
        getPreciosPaquetesByServicioTarifa(tarifa.id),
      ]);
      setPaquetes(Array.isArray(paqData) ? paqData.filter(p => p.flgActivo) : []);
      setPreciosPaquetes(Array.isArray(preciosData) ? preciosData : []);
    } catch (err) {
      console.error('Error cargando datos:', err);
    }
  };

  const agregarNuevoPrecio = () => {
    const paquetesSinConfigurar = paquetes.filter(
      p => !preciosPaquetes.find(pp => pp.paquete_id === p.id)
    );
    if (paquetesSinConfigurar.length === 0) {
      alert('Ya configuraste precios para todos los paquetes disponibles');
      return;
    }
    setPreciosPaquetes(prev => [...prev, {
      _isNew: true,
      servicio_tarifa_id: tarifa.id,
      paquete_id: paquetesSinConfigurar[0].id,
      tipo_calculo: 'precio_total',
      valor: '',
    }]);
  };

  const actualizarPrecio = (index, campo, valor) => {
    setPreciosPaquetes(prev => prev.map((item, i) =>
      i === index ? { ...item, [campo]: valor } : item
    ));
  };

  const guardarPrecio = async (index) => {
    const item = preciosPaquetes[index];
    if (!item.valor || parseFloat(item.valor) <= 0) {
      alert('Ingresa un valor válido');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const payload = {
        servicio_tarifa_id: tarifa.id,
        paquete_id: parseInt(item.paquete_id),
        tipo_calculo: item.tipo_calculo,
        valor: parseFloat(item.valor),
        user_crea_id: user?.id,
      };

      if (item._isNew) {
        const nuevo = await crearPrecioPaquete(payload);
        setPreciosPaquetes(prev => prev.map((p, i) =>
          i === index ? { ...nuevo, _isNew: false } : p
        ));
        alert('Precio de paquete creado exitosamente');
      } else {
        await actualizarPrecioPaquete(item.id, { ...payload, user_actua_id: user?.id });
        alert('Precio de paquete actualizado exitosamente');
      }
      if (onSaved) onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const eliminarPrecio = async (index) => {
    const item = preciosPaquetes[index];
    if (item._isNew) {
      setPreciosPaquetes(prev => prev.filter((_, i) => i !== index));
      return;
    }

    if (!confirm('¿Eliminar esta configuración de precio?')) return;

    setLoading(true);
    try {
      await eliminarPrecioPaquete(item.id);
      setPreciosPaquetes(prev => prev.filter((_, i) => i !== index));
      alert('Precio eliminado exitosamente');
      if (onSaved) onSaved();
    } catch (err) {
      alert(err?.response?.data?.message || 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  const getPaqueteNombre = (paqueteId) => {
    const paq = paquetes.find(p => p.id === paqueteId);
    return paq ? `${paq.nombre} (${paq.cantidadSesiones} sesiones)` : 'Paquete';
  };

  const paquetesDisponibles = (currentPaqueteId) => {
    return paquetes.filter(p =>
      p.id === currentPaqueteId ||
      !preciosPaquetes.find(pp => pp.paquete_id === p.id)
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Configurar Precios por Paquete</h2>
            <p className="text-sm text-gray-500 mt-1">
              {tarifa.servicio?.nombre} - {tarifa.motivo_cita?.nombre}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Precio base: <span className="font-semibold">S/ {parseFloat(tarifa.precio).toFixed(2)}</span> por sesión
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Info Box */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">¿Cómo funciona?</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• <strong>Precio Total:</strong> Ej: 4 sesiones = S/280 total (S/70 por sesión)</li>
              <li>• <strong>Descuento %:</strong> Ej: 10% descuento sobre el precio base</li>
            </ul>
          </div>

          {/* Lista de precios */}
          <div className="space-y-3">
            {preciosPaquetes.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="grid grid-cols-12 gap-3 items-end">
                  {/* Paquete */}
                  <div className="col-span-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Paquete
                    </label>
                    <select
                      value={item.paquete_id}
                      onChange={(e) => actualizarPrecio(index, 'paquete_id', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      disabled={!item._isNew}
                    >
                      {paquetesDisponibles(item.paquete_id).map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} ({p.cantidadSesiones} ses.)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tipo de cálculo */}
                  <div className="col-span-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      value={item.tipo_calculo}
                      onChange={(e) => actualizarPrecio(index, 'tipo_calculo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="precio_total">Precio Total</option>
                      <option value="descuento_porcentaje">Descuento %</option>
                    </select>
                  </div>

                  {/* Valor */}
                  <div className="col-span-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {item.tipo_calculo === 'precio_total' ? 'Precio Total' : 'Descuento %'}
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.valor}
                        onChange={(e) => actualizarPrecio(index, 'valor', e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-right"
                      />
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="col-span-2 flex gap-1">
                    <button
                      onClick={() => guardarPrecio(index)}
                      disabled={loading}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-xs font-semibold"
                    >
                      {item._isNew ? 'Crear' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => eliminarPrecio(index)}
                      disabled={loading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Vista previa del cálculo */}
                {item.valor && (
                  <div className="mt-3 pt-3 border-t border-gray-300 text-xs text-gray-600">
                    {item.tipo_calculo === 'precio_total' ? (
                      <>
                        <span>Precio unitario: </span>
                        <span className="font-semibold text-purple-700">
                          S/ {(parseFloat(item.valor) / (paquetes.find(p => p.id === item.paquete_id)?.cantidadSesiones || 1)).toFixed(2)} por sesión
                        </span>
                      </>
                    ) : (
                      <>
                        <span>Precio con descuento: </span>
                        <span className="font-semibold text-purple-700">
                          S/ {(parseFloat(tarifa.precio) * (1 - parseFloat(item.valor) / 100)).toFixed(2)} por sesión
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}

            {preciosPaquetes.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No hay precios configurados para paquetes</p>
                <p className="text-xs mt-1">Haz clic en "Agregar Precio" para comenzar</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <button
            onClick={agregarNuevoPrecio}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100"
          >
            <PlusIcon className="w-4 h-4" />
            Agregar Precio
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalPreciosPaquetes;
