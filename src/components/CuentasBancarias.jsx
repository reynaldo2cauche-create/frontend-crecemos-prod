import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import {
  getCuentasBancarias,
  crearCuentaBancaria,
  eliminarCuentaBancaria,
  marcarCuentaPrincipal
} from '../services/rrhhService';

export default function CuentasBancarias({ trabajadorId, onUpdate, readOnly = false, localMode = false, cuentasLocales = [], onCuentasLocalesChange }) {
  const [cuentas, setCuentas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    banco: '',
    numero_cuenta: '',
    cci: '',
    es_principal: false
  });

  // En modo local (crear empleado) las cuentas viven en el padre, sin tocar el backend
  const listaCuentas = localMode ? cuentasLocales : cuentas;
  const puedeEditar = (trabajadorId || localMode) && !readOnly;

  const bancos = [
    'BCP',
    'BBVA',
    'INTERBANK',
    'SCOTIABANK',
    'BANBIF',
    'PICHINCHA',
    'BANCO DE LA NACIÓN',
    'OTROS'
  ];

  useEffect(() => {
    if (!localMode && trabajadorId) {
      cargarCuentas();
    }
  }, [trabajadorId]);

  const cargarCuentas = async () => {
    try {
      setLoading(true);
      const data = await getCuentasBancarias(trabajadorId);
      setCuentas(data);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarCuenta = async () => {
    if (!formData.banco || !formData.numero_cuenta) {
      alert('Por favor completa banco y número de cuenta');
      return;
    }

    // Modo local (crear empleado): solo agregar a la lista en memoria
    if (localMode) {
      const nueva = {
        id: `tmp-${Date.now()}`,
        banco: formData.banco,
        numero_cuenta: formData.numero_cuenta,
        cci: formData.cci || null,
        es_principal: cuentasLocales.length === 0
      };
      onCuentasLocalesChange?.([...cuentasLocales, nueva]);
      setFormData({ banco: '', numero_cuenta: '', cci: '', es_principal: false });
      setMostrarFormulario(false);
      return;
    }

    try {
      setLoading(true);
      await crearCuentaBancaria({
        trabajadorId: trabajadorId,
        banco: formData.banco,
        numero_cuenta: formData.numero_cuenta,
        cci: formData.cci || null,
        es_principal: cuentas.length === 0 // Si es la primera, marcarla como principal
      });

      setFormData({
        banco: '',
        numero_cuenta: '',
        cci: '',
        es_principal: false
      });
      setMostrarFormulario(false);
      await cargarCuentas();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error al agregar cuenta:', error);
      alert('Error al agregar cuenta bancaria');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarCuenta = async (id) => {
    if (localMode) {
      onCuentasLocalesChange?.(cuentasLocales.filter(c => c.id !== id));
      return;
    }

    if (!confirm('¿Estás seguro de eliminar esta cuenta bancaria?')) return;

    try {
      setLoading(true);
      await eliminarCuentaBancaria(id);
      await cargarCuentas();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      alert('Error al eliminar cuenta bancaria');
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarPrincipal = async (id) => {
    if (localMode) {
      onCuentasLocalesChange?.(cuentasLocales.map(c => ({ ...c, es_principal: c.id === id })));
      return;
    }

    try {
      setLoading(true);
      await marcarCuentaPrincipal(id);
      await cargarCuentas();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error al marcar cuenta principal:', error);
      alert('Error al marcar como principal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Cuentas Bancarias {listaCuentas.length > 0 && `(${listaCuentas.length})`}
        </h3>
        {/* Solo muestra el botón si NO es readOnly */}
        {puedeEditar && (
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#7B1FA2] hover:bg-[#6A1B9A] rounded-lg transition-all"
            disabled={loading}
          >
            <PlusIcon className="w-4 h-4" />
            Agregar
          </button>
        )}
      </div>

      {/* Formulario para agregar cuenta - NO se muestra en modo readOnly */}
      {mostrarFormulario && !readOnly && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Banco <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.banco}
                onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white"
              >
                <option value="">Seleccionar banco</option>
                {bancos.map(banco => (
                  <option key={banco} value={banco}>{banco}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Número de Cuenta <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.numero_cuenta}
                onChange={(e) => setFormData({ ...formData, numero_cuenta: e.target.value })}
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all"
                placeholder="Ej: 19412345678901"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                CCI (Código de Cuenta Interbancario)
              </label>
              <input
                type="text"
                value={formData.cci}
                onChange={(e) => setFormData({ ...formData, cci: e.target.value })}
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all"
                placeholder="Ej: 00219400123456789012"
                maxLength={20}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setMostrarFormulario(false);
                setFormData({ banco: '', numero_cuenta: '', cci: '', es_principal: false });
              }}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleAgregarCuenta}
              className="px-3 py-1.5 text-xs font-medium text-white bg-[#7B1FA2] hover:bg-[#6A1B9A] rounded-lg transition-all"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cuenta'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de cuentas */}
      {listaCuentas.length === 0 && !mostrarFormulario ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-sm text-gray-500">No hay cuentas bancarias registradas</p>
          {puedeEditar && (
            <p className="text-xs text-gray-400 mt-1">Haz clic en "Agregar" para registrar una cuenta</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {listaCuentas.map((cuenta) => (
            <div
              key={cuenta.id}
              className={`relative border-2 rounded-lg p-3 transition-all ${
                cuenta.es_principal
                  ? 'border-[#A3C644] bg-green-50/50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Badge principal */}
              {cuenta.es_principal && (
                <div className="absolute -top-2 -right-2 bg-[#A3C644] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  PRINCIPAL
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 text-sm">{cuenta.banco}</h4>
                  </div>
                  <p className="text-xs text-gray-600 mb-0.5">
                    <span className="font-medium">Cuenta:</span> {cuenta.numero_cuenta}
                  </p>
                  {cuenta.cci && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">CCI:</span> {cuenta.cci}
                    </p>
                  )}
                </div>

                {/* Botones de acciones - SOLO si NO es readOnly */}
                {puedeEditar && (
                  <div className="flex items-center gap-1">
                    {!cuenta.es_principal && (
                      <button
                        onClick={() => handleMarcarPrincipal(cuenta.id)}
                        className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded transition-all"
                        title="Marcar como principal"
                        disabled={loading}
                      >
                        <StarIcon className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEliminarCuenta(cuenta.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                      title="Eliminar cuenta"
                      disabled={loading}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}