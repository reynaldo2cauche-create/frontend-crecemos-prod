import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  XCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import {
  getTarifas,
  crearTarifa,
  actualizarTarifa,
  desactivarTarifa,
  activarTarifa,
  getPreciosPaquetesByServicioTarifa,
  crearPrecioPaquete,
  actualizarPrecioPaquete,
  eliminarPrecioPaquete,
  getPaquetesCombo,
  crearPaqueteCombo,
  actualizarPaqueteCombo,
  eliminarPaqueteCombo,
  toggleActivoPaqueteCombo,
} from '../../services/inventarioService';
import { getServicios, getPaquetes } from '../../services/serviciosService';
import { getMotivosCita } from '../../services/citaService';
import { getDocumentosTarifa } from '../../services/documentoTarifaService';
import ModalPreciosPaquetes from './ModalPreciosPaquetes';

const EMPTY_FORM = {
  servicio_id: '',
  motivo_cita_id: '',
  precio: '',
};

// ─── Sub-componentes ─────────────────────────────────────────────────────────

const Badge = ({ activo }) =>
  activo ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      Activo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      Inactivo
    </span>
  );

// ─── Modal crear / editar ────────────────────────────────────────────────────

const TarifaModal = ({ tarifa, servicios, motivos, onClose, onSaved }) => {
  const [form, setForm] = useState(
    tarifa
      ? {
          servicio_id:    tarifa.servicio_id    ?? '',
          motivo_cita_id: tarifa.motivo_cita_id ?? '',
          precio:         tarifa.precio         ?? '',
        }
      : { ...EMPTY_FORM },
  );
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const isEdit = !!tarifa;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['servicio_id', 'motivo_cita_id'];
    setForm((f) => ({
      ...f,
      [name]: numericFields.includes(name)
        ? value === '' ? '' : parseInt(value, 10)
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user    = JSON.parse(localStorage.getItem('user') || '{}');
      const payload = {
        servicio_id:    parseInt(form.servicio_id, 10),
        motivo_cita_id: parseInt(form.motivo_cita_id, 10),
        precio:         parseFloat(form.precio),
      };

      if (isEdit) {
        await actualizarTarifa(tarifa.id, { precio: payload.precio, user_actua_id: user?.id });
      } else {
        await crearTarifa({ ...payload, user_crea_id: user?.id });
      }
      onSaved();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data) ? err.response.data.join(', ') : null) ||
        err?.message ||
        'Error al guardar la tarifa';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] transition-all';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7B1FA2]/10 flex items-center justify-center">
              <CurrencyDollarIcon className="w-4 h-4 text-[#7B1FA2]" />
            </div>
            <h2 className="font-bold text-gray-900">{isEdit ? 'Editar Tarifa' : 'Nueva Tarifa'}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className={labelClass}>Servicio *</label>
             <select
  name="servicio_id"
  value={form.servicio_id}
  onChange={handleChange}
  required
  disabled={isEdit}
  className={`${inputClass} ${isEdit ? 'bg-gray-50 cursor-not-allowed' : ''}`}
>
  <option value="">Seleccionar servicio...</option>
  {(() => {
    const agrupados = {};
    servicios.forEach(s => {
      const areaNombre = s.area?.nombre || 'Otros';
      if (!agrupados[areaNombre]) agrupados[areaNombre] = [];
      agrupados[areaNombre].push(s);
    });
    const ordenAreas = ['Área Infantil', 'Área Adolescentes y Adultos', 'Otros'];
    const areasOrdenadas = Object.keys(agrupados).sort((a, b) => {
      const indexA = ordenAreas.indexOf(a);
      const indexB = ordenAreas.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
    return areasOrdenadas.map(areaNombre => (
      <optgroup key={areaNombre} label={areaNombre}>
        {agrupados[areaNombre].map(s => (
          <option key={s.id} value={s.id}>{s.nombre}</option>
        ))}
      </optgroup>
    ));
  })()}
</select>
              {isEdit && (
                <p className="text-xs text-gray-400 mt-1">El servicio no se puede cambiar. Crea una nueva tarifa si lo necesitas.</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Motivo de Cita *</label>
              <select
                name="motivo_cita_id"
                value={form.motivo_cita_id}
                onChange={handleChange}
                required
                disabled={isEdit}
                className={`${inputClass} ${isEdit ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              >
                <option value="">Seleccionar motivo...</option>
                {motivos.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Precio (S/) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="precio"
                value={form.precio}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#7B1FA2] rounded-lg hover:bg-[#6A1B9A] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Tarifa'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

// ─── ComboBox buscable ───────────────────────────────────────────────────────

const ComboBox = ({ options, value, onChange, placeholder = 'Buscar...', renderOption, renderSelected, getSearchText, disabled = false }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  const selected = options.find(o => o.id === value);

  const filtered = query.trim() === ''
    ? options
    : options.filter(o => {
        const txt = getSearchText ? getSearchText(o) : (renderSelected ? renderSelected(o) : String(o.id));
        return txt.toLowerCase().includes(query.toLowerCase());
      });

  // Cerrar al click fuera
  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div
        className={`flex items-center w-full px-3 py-1.5 text-sm border rounded-lg cursor-pointer transition-all ${
          disabled ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-200 hover:border-[#7B1FA2]/50 focus-within:ring-2 focus-within:ring-[#7B1FA2]/30 focus-within:border-[#7B1FA2]'
        }`}
        onClick={() => !disabled && setOpen(o => !o)}
      >
        {open ? (
          <input
            autoFocus
            className="flex-1 outline-none text-sm bg-transparent"
            placeholder={placeholder}
            value={query}
            onChange={e => { setQuery(e.target.value); }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className={`flex-1 truncate ${selected ? 'text-gray-900' : 'text-gray-400'}`}>
            {selected ? (renderSelected ? renderSelected(selected) : renderOption(selected, true)) : placeholder}
          </span>
        )}
        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">Sin resultados</div>
          ) : (
            filtered.map(opt => (
              <div
                key={opt.id}
                onClick={() => { onChange(opt.id); setOpen(false); setQuery(''); }}
                className={`px-3 py-2 cursor-pointer hover:bg-[#7B1FA2]/5 transition-colors ${value === opt.id ? 'bg-[#7B1FA2]/10' : ''}`}
              >
                {renderOption(opt)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ─── Modal Paquete Combo ─────────────────────────────────────────────────────

const ModalPaqueteCombo = ({ combo, tarifas, documentos, onClose, onSaved }) => {
 const [form, setForm] = useState(
  combo
    ? {
        nombre:         combo.nombre       ?? '',
        descripcion:    combo.descripcion  ?? '',
        precio_total:   combo.precioTotal  ?? combo.precio_total  ?? '',
        precio_tachado: combo.precioTachado ?? combo.precio_tachado ?? '',
        items: (combo.items ?? []).map(it => {
          const servicioTarifaId  = it.servicioTarifaId  ?? it.servicio_tarifa_id  ?? null;
          const documentoTarifaId = it.documentoTarifaId ?? it.documento_tarifa_id ?? null;
          return {
            tipo:                servicioTarifaId ? 'servicio' : documentoTarifaId ? 'documento' : null,
            servicio_tarifa_id:  servicioTarifaId,
            documento_tarifa_id: documentoTarifaId,
            cantidad:            it.cantidad ?? 1,
            descripcion_linea:   it.descripcionLinea ?? it.descripcion_linea ?? '',
          };
        }),
      }
    : { nombre: '', descripcion: '', precio_total: '', precio_tachado: '', items: [] }
);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!combo;

  const agregarItem = () => {
    setForm(f => ({
      ...f,
      items: [...f.items, {
        tipo: null,
        servicio_tarifa_id: null,
        documento_tarifa_id: null,
        cantidad: 1,
        descripcion_linea: ''
      }]
    }));
  };

  const eliminarItem = (idx) => {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const actualizarItem = (idx, campo, valor) => {
    setForm(f => ({
      ...f,
      items: f.items.map((it, i) => {
        if (i !== idx) return it;
        const nuevoItem = { ...it, [campo]: valor };
        if (campo === 'servicio_tarifa_id' && valor) nuevoItem.documento_tarifa_id = null;
        if (campo === 'documento_tarifa_id' && valor) nuevoItem.servicio_tarifa_id = null;
        return nuevoItem;
      })
    }));
  };

  const cambiarTipoItem = (idx, tipo) => {
    setForm(f => ({
      ...f,
      items: f.items.map((it, i) =>
        i !== idx ? it : { ...it, tipo, servicio_tarifa_id: null, documento_tarifa_id: null }
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.items.length === 0) {
      setError('Debes agregar al menos un ítem al combo');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        precio_total: parseFloat(form.precio_total),
        precio_tachado: form.precio_tachado ? parseFloat(form.precio_tachado) : null,
        items: form.items.map(it => ({
          servicio_tarifa_id: it.servicio_tarifa_id || null,
          documento_tarifa_id: it.documento_tarifa_id || null,
          cantidad: parseInt(it.cantidad, 10),
          descripcion_linea: it.descripcion_linea || null,
        })),
      };
      if (isEdit) {
        await actualizarPaqueteCombo(combo.id, { ...payload, user_actua_id: user?.id });
      } else {
        await crearPaqueteCombo({ ...payload, user_crea_id: user?.id });
      }
      onSaved();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error al guardar el combo';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 overflow-y-auto py-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-[#7B1FA2]/5 to-transparent rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#7B1FA2]/10 flex items-center justify-center">
              <TagIcon className="w-4 h-4 text-[#7B1FA2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {isEdit ? 'Editar Paquete Combo' : 'Nuevo Paquete Combo'}
              </h2>
              <p className="text-xs text-gray-500">
                {isEdit ? 'Modifica los datos del combo' : 'Crea un paquete con múltiples servicios/documentos'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[75vh] rounded-b-2xl overflow-hidden">
          <div className="px-6 py-3 space-y-3 overflow-y-auto">

            {error && (
              <div className="flex items-center gap-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Información básica */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-1 h-3.5 bg-[#7B1FA2] rounded-full" />
                Información del Combo
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Nombre del Combo *</label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))}
                    required
                    className={inputClass}
                    placeholder="Ej: Paquete Integral"
                  />
                </div>
                <div>
                  <label className={labelClass}>Descripción (Opcional)</label>
                  <input
                    type="text"
                    value={form.descripcion}
                    onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))}
                    className={inputClass}
                    placeholder="Breve descripción del combo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Precio Total *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">S/</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.precio_total}
                      onChange={(e) => setForm(f => ({ ...f, precio_total: e.target.value }))}
                      required
                      className={`${inputClass} pl-8`}
                      placeholder="320.00"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Precio Tachado (Opcional)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">S/</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.precio_tachado}
                      onChange={(e) => setForm(f => ({ ...f, precio_tachado: e.target.value }))}
                      className={`${inputClass} pl-8`}
                      placeholder="360.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ítems del combo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-1 h-3.5 bg-[#7B1FA2] rounded-full" />
                  Ítems del Combo *
                  <span className="text-xs font-normal text-gray-400">
                    ({form.items.length} ítem{form.items.length !== 1 ? 's' : ''})
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={agregarItem}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#7B1FA2] rounded-lg hover:bg-[#6A1B9A] transition-colors"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  Agregar Ítem
                </button>
              </div>

              {form.items.length === 0 ? (
                <div className="text-center py-6 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                  <TagIcon className="w-7 h-7 mx-auto mb-1.5 text-gray-300" />
                  <p>No hay ítems. Agrega servicios o documentos al combo.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {form.items.map((item, idx) => {
                    const tipoItem = item.tipo;
                    return (
                      <div key={idx} className="p-3 bg-white rounded-xl border-2 border-gray-200 hover:border-[#7B1FA2]/30 transition-colors">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 space-y-2">

                            {/* Selector tipo */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-600">Tipo:</span>
                              <div className="inline-flex gap-0.5 p-0.5 bg-gray-100 rounded-lg">
                                <button
                                  type="button"
                                  onClick={() => cambiarTipoItem(idx, 'servicio')}
                                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                    tipoItem === 'servicio'
                                      ? 'bg-[#7B1FA2] text-white shadow-sm'
                                      : 'text-gray-600 hover:text-gray-900'
                                  }`}
                                >
                                  Servicio
                                </button>
                                <button
                                  type="button"
                                  onClick={() => cambiarTipoItem(idx, 'documento')}
                                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                    tipoItem === 'documento'
                                      ? 'bg-[#7B1FA2] text-white shadow-sm'
                                      : 'text-gray-600 hover:text-gray-900'
                                  }`}
                                >
                                  Documento
                                </button>
                              </div>
                            </div>

                            {/* Select + cantidad */}
                            <div className="grid grid-cols-[1fr_auto] gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  {tipoItem === 'servicio' ? 'Servicio' : tipoItem === 'documento' ? 'Documento' : 'Selecciona un tipo primero'}
                                </label>
                                {tipoItem === 'servicio' ? (
                                  <ComboBox
                                    options={tarifas}
                                    value={item.servicio_tarifa_id}
                                    onChange={(id) => actualizarItem(idx, 'servicio_tarifa_id', id)}
                                    placeholder="Buscar servicio..."
                                    getSearchText={(t) => `${t._servicio?.nombre || ''} ${t._motivo?.nombre || ''} ${t._servicio?.area?.nombre || ''}`}
                                    renderOption={(t) => (
                                      <div>
                                        <div className="font-semibold text-gray-900 text-xs">{t._servicio?.nombre}</div>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                          <span className="text-xs text-purple-600 font-medium">{t._servicio?.area?.nombre}</span>
                                          <span className="text-xs text-gray-400">·</span>
                                          <span className="text-xs text-gray-500">{t._motivo?.nombre}</span>
                                          <span className="text-xs text-gray-400">·</span>
                                          <span className="text-xs font-semibold text-green-700">S/ {parseFloat(t.precio || 0).toFixed(2)}</span>
                                        </div>
                                      </div>
                                    )}
                                    renderSelected={(t) => `${t._servicio?.nombre} · ${t._motivo?.nombre} · S/ ${parseFloat(t.precio || 0).toFixed(2)}`}
                                  />
                                ) : tipoItem === 'documento' ? (
                                  <ComboBox
                                    options={documentos}
                                    value={item.documento_tarifa_id}
                                    onChange={(id) => actualizarItem(idx, 'documento_tarifa_id', id)}
                                    placeholder="Buscar documento..."
                                    getSearchText={(d) => `${d.nombre || ''}`}
                                    renderOption={(d) => (
                                      <div>
                                        <div className="font-semibold text-gray-900 text-xs">{d.nombre}</div>
                                        <span className="text-xs font-semibold text-green-700">S/ {parseFloat(d.precio || 0).toFixed(2)}</span>
                                      </div>
                                    )}
                                    renderSelected={(d) => `${d.nombre} · S/ ${parseFloat(d.precio || 0).toFixed(2)}`}
                                  />
                                ) : (
                                  <div className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400">
                                    Selecciona un tipo arriba
                                  </div>
                                )}
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.cantidad}
                                  onChange={(e) => actualizarItem(idx, 'cantidad', e.target.value)}
                                  className="w-16 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 text-center font-semibold"
                                  required
                                />
                              </div>
                            </div>

                          </div>

                          {/* Botón eliminar */}
                          <button
                            type="button"
                            onClick={() => eliminarItem(idx)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                            title="Eliminar ítem"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <p className="text-xs text-gray-400">* Campos obligatorios</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-sm font-semibold text-white bg-[#7B1FA2] rounded-lg hover:bg-[#6A1B9A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </span>
                ) : (
                  isEdit ? 'Guardar Cambios' : 'Crear Combo'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// ─── Componente principal ────────────────────────────────────────────────────

const TarifasTab = () => {
  const [vistaActiva, setVistaActiva] = useState('tarifas'); // 'tarifas' | 'combos'
  const [tarifas, setTarifas]           = useState([]);
  const [servicios, setServicios]       = useState([]);
  const [motivos, setMotivos]           = useState([]);
  const [documentos, setDocumentos]     = useState([]);
  const [combos, setCombos]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [busqueda, setBusqueda]         = useState('');
  const [filtroServicio, setFiltroServicio] = useState('');
  const [modal, setModal]               = useState(null); // null | 'crear' | tarifa
  const [modalPaquetes, setModalPaquetes] = useState(null); // null | tarifa
  const [modalCombo, setModalCombo]     = useState(null); // null | 'crear' | combo
  const [confirmToggle, setConfirmToggle]   = useState(null);
  const [confirmToggleCombo, setConfirmToggleCombo] = useState(null);
  const [accionLoading, setAccionLoading]   = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const normalizar = (items) =>
    items.map((t) => ({ ...t, activo: t.activo ?? Boolean(t.flg_activo ?? t.flgActivo) }));

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [tarifasData, serviciosData, motivosData, docsData, combosData] = await Promise.all([
        getTarifas(mostrarTodos),
        getServicios(),
        getMotivosCita(),
        getDocumentosTarifa(),
        getPaquetesCombo(mostrarTodos),
      ]);
      setTarifas(normalizar(tarifasData));
      setServicios(serviciosData);
      setMotivos(motivosData);
      setDocumentos(normalizar(docsData));
      setCombos(normalizar(combosData));
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, [mostrarTodos]);

  // Enriquecer tarifas con nombre de servicio y motivo desde las props
  const tarifasEnriquecidas = tarifas.map((t) => ({
    ...t,
    _servicio: servicios.find((s) => s.id === t.servicio_id),
    _motivo:   motivos.find((m) => m.id === t.motivo_cita_id),
  }));

  const tarifasFiltradas = tarifasEnriquecidas.filter((t) => {
    const textoBusqueda = busqueda.toLowerCase();
    const coincideTexto =
      !busqueda ||
      t._servicio?.nombre?.toLowerCase().includes(textoBusqueda) ||
      t._motivo?.nombre?.toLowerCase().includes(textoBusqueda);
    const coincideServicio =
      !filtroServicio || String(t.servicio_id) === filtroServicio;
    return coincideTexto && coincideServicio;
  });

  const handleToggleEstado = async () => {
    if (!confirmToggle) return;
    setAccionLoading(true);
    try {
      if (confirmToggle.activo) {
        await desactivarTarifa(confirmToggle.id, user?.id);
      } else {
        await activarTarifa(confirmToggle.id, user?.id);
      }
      setConfirmToggle(null);
      cargarDatos();
    } catch {
      alert('Error al cambiar el estado de la tarifa');
    } finally {
      setAccionLoading(false);
    }
  };

  const handleToggleCombo = async () => {
    if (!confirmToggleCombo) return;
    setAccionLoading(true);
    try {
      await toggleActivoPaqueteCombo(confirmToggleCombo.id);
      setConfirmToggleCombo(null);
      cargarDatos();
    } catch {
      alert('Error al cambiar el estado del combo');
    } finally {
      setAccionLoading(false);
    }
  };

  const handleEliminarCombo = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este combo?')) return;
    setAccionLoading(true);
    try {
      await eliminarPaqueteCombo(id);
      cargarDatos();
    } catch (err) {
      alert(err?.response?.data?.message || 'Error al eliminar el combo');
    } finally {
      setAccionLoading(false);
    }
  };

  // Stats
  const activas   = tarifas.filter((t) => t.activo).length;
  const inactivas = tarifas.filter((t) => !t.activo).length;
  const serviciosUnicos = [...new Set(tarifas.map((t) => t.servicio_id))].length;

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tarifas de Servicios</h2>
        <p className="text-sm text-gray-500 mt-1">Gestión de tarifas y paquetes combo</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setVistaActiva('tarifas')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            vistaActiva === 'tarifas'
              ? 'border-[#7B1FA2] text-[#7B1FA2]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Tarifas
        </button>
        <button
          onClick={() => setVistaActiva('combos')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            vistaActiva === 'combos'
              ? 'border-[#7B1FA2] text-[#7B1FA2]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Paquetes Combo
        </button>
      </div>

      {/* Vista de Tarifas */}
      {vistaActiva === 'tarifas' && (
        <>
          {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7B1FA2]/10 rounded-xl flex items-center justify-center">
              <TagIcon className="w-5 h-5 text-[#7B1FA2]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{tarifas.length}</div>
              <div className="text-xs text-gray-500 font-medium">Total tarifas</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{activas}</div>
              <div className="text-xs text-gray-500 font-medium">Activas</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{serviciosUnicos}</div>
              <div className="text-xs text-gray-500 font-medium">Servicios con tarifa</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por servicio o motivo..."
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] w-64 transition-all"
            />
          </div>

          {/* Filtro por servicio */}
          {servicios.length > 0 && (
            <select
              value={filtroServicio}
              onChange={(e) => setFiltroServicio(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] transition-all"
            >
              <option value="">Todos los servicios</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setMostrarTodos(!mostrarTodos)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
              mostrarTodos
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {mostrarTodos ? 'Mostrando todos' : 'Ver inactivas'}
          </button>
        </div>

        <button
          onClick={() => setModal('crear')}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] rounded-xl hover:shadow-lg transition-all"
        >
          <PlusIcon className="w-4 h-4" />
          Nueva Tarifa
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin" />
          </div>
        ) : tarifasFiltradas.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <TagIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No se encontraron tarifas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Servicio</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Área</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Motivo de Cita</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Precio</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tarifasFiltradas.map((t) => (
                  <tr
                    key={t.id}
                    className={`hover:bg-gray-50 transition-colors ${!t.activo ? 'opacity-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {t._servicio?.nombre ?? `Servicio #${t.servicio_id}`}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                        {t._servicio?.area?.nombre ?? '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {t._motivo?.nombre ?? `Motivo #${t.motivo_cita_id}`}
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-gray-900">
                      S/ {parseFloat(t.precio || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge activo={t.activo} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setModal(t)}
                          title="Editar precio base"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#7B1FA2] hover:bg-purple-50 transition-colors"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        {(() => {
                          const motivoNombre = (t._motivo?.nombre || '').toLowerCase();
                          const esSesionTerapia = motivoNombre.includes('sesión') || motivoNombre.includes('sesion') || motivoNombre.includes('terapia');
                          const esEvaluacion = motivoNombre.includes('evaluación') || motivoNombre.includes('evaluacion');
                          const puedeConfigurarPaquetes = esSesionTerapia || esEvaluacion;

                          return (
                            <button
                              onClick={() => {
                                if (!puedeConfigurarPaquetes) {
                                  alert('Los paquetes solo pueden configurarse para:\n• Sesiones de terapia\n• Evaluaciones\n\nMotivo actual: ' + (t._motivo?.nombre || 'No especificado'));
                                  return;
                                }
                                setModalPaquetes(t);
                              }}
                              title={puedeConfigurarPaquetes ? "Configurar precios por paquete" : "No disponible para este tipo de servicio"}
                              disabled={!puedeConfigurarPaquetes}
                              className={`p-1.5 rounded-lg transition-colors ${
                                puedeConfigurarPaquetes
                                  ? 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                                  : 'text-gray-300 cursor-not-allowed'
                              }`}
                            >
                              <TagIcon className="w-4 h-4" />
                            </button>
                          );
                        })()}
                        <button
                          onClick={() => setConfirmToggle(t)}
                          title={t.activo ? 'Desactivar' : 'Activar'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            t.activo
                              ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                              : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {t.activo
                            ? <XCircleIcon className="w-4 h-4" />
                            : <CheckCircleIcon className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contador */}
      {!loading && (
        <p className="text-xs text-gray-400 text-right">
          {tarifasFiltradas.length} tarifa{tarifasFiltradas.length !== 1 ? 's' : ''}
        </p>
      )}
        </>
      )}

      {/* Vista de Paquetes Combo */}
      {vistaActiva === 'combos' && (
        <>
          {/* Header con botón crear */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Paquetes Combo</h3>
              <p className="text-sm text-gray-500">Agrupa múltiples servicios/documentos con precio fijo</p>
            </div>
            <button
              onClick={() => setModalCombo('crear')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] transition-colors shadow-sm"
            >
              <PlusIcon className="w-4 h-4" />
              Crear Combo
            </button>
          </div>

          {/* Toggle mostrar todos */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="mostrarTodosCombos"
              checked={mostrarTodos}
              onChange={(e) => setMostrarTodos(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#7B1FA2] focus:ring-[#7B1FA2]/30"
            />
            <label htmlFor="mostrarTodosCombos" className="text-sm text-gray-600 cursor-pointer select-none">
              Mostrar combos inactivos
            </label>
          </div>

          {/* Tabla de combos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin" />
              </div>
            ) : combos.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <TagIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No hay combos registrados</p>
                <button
                  onClick={() => setModalCombo('crear')}
                  className="mt-4 text-sm text-[#7B1FA2] hover:underline font-medium"
                >
                  Crear primer combo
                </button>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Combo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ítems</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {combos.map((combo) => (
                    <tr key={combo.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{combo.nombre}</div>
                          {combo.descripcion && (
                            <div className="text-xs text-gray-500 mt-0.5">{combo.descripcion}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-gray-700">
                            {combo.items?.length || 0} ítem{combo.items?.length !== 1 ? 's' : ''}
                          </div>
                          {combo.items && combo.items.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {combo.items.map((item, idx) => {
                                const tarifa = tarifasEnriquecidas.find(t => t.id === (item.servicioTarifaId ?? item.servicio_tarifa_id));
                                const doc = documentos.find(d => d.id === (item.documentoTarifaId ?? item.documento_tarifa_id));
                                const nombre = tarifa ? tarifa._servicio?.nombre : doc ? doc.nombre : '?';
                                const cantidad = item.cantidad;
                                const areaNombre = tarifa?._servicio?.area?.nombre;
                                return (
                                  <div key={idx} className="truncate">
                                    {cantidad > 1 ? `${cantidad}x ` : ''}{nombre}
                                    {areaNombre && (
                                      <span className="ml-1 text-purple-500">· {areaNombre}</span>
                                    )}
                                  </div>
                                );
                              }).slice(0, 3)}
                              {combo.items.length > 3 && (
                                <div className="text-gray-400 italic">+{combo.items.length - 3} más</div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {combo.precioTachado && (
                            <span className="text-xs text-gray-400 line-through">
                              S/ {parseFloat(combo.precioTachado).toFixed(2)}
                            </span>
                          )}
                          <span className="font-semibold text-gray-900">
                            S/ {parseFloat(combo.precioTotal).toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge activo={combo.activo} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setModalCombo(combo)}
                            title="Editar"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmToggleCombo(combo)}
                            title={combo.activo ? 'Desactivar' : 'Activar'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              combo.activo
                                ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                                : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {combo.activo ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <p className="text-xs text-gray-400 text-right">
            {combos.length} combo{combos.length !== 1 ? 's' : ''}
          </p>
        </>
      )}

      {/* Modal crear / editar */}
      {modal && (
        <TarifaModal
          tarifa={modal === 'crear' ? null : modal}
          servicios={servicios}
          motivos={motivos}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); cargarDatos(); }}
        />
      )}

      {/* Modal precios por paquete */}
      {modalPaquetes && (
        <ModalPreciosPaquetes
          tarifa={modalPaquetes}
          onClose={() => setModalPaquetes(null)}
          onSaved={() => { cargarDatos(); }}
        />
      )}

      {/* Modal crear / editar combo */}
      {modalCombo && (
        <ModalPaqueteCombo
          combo={modalCombo === 'crear' ? null : modalCombo}
          tarifas={tarifasEnriquecidas}
          documentos={documentos}
          onClose={() => setModalCombo(null)}
          onSaved={() => { setModalCombo(null); cargarDatos(); }}
        />
      )}

      {/* Confirm toggle estado */}
      {confirmToggle && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
              confirmToggle.activo ? 'bg-red-100' : 'bg-green-100'
            }`}>
              {confirmToggle.activo
                ? <XCircleIcon className="w-6 h-6 text-red-600" />
                : <CheckCircleIcon className="w-6 h-6 text-green-600" />}
            </div>
            <h3 className="text-center font-bold text-gray-900 mb-2">
              {confirmToggle.activo ? 'Desactivar tarifa' : 'Activar tarifa'}
            </h3>
            <p className="text-center text-sm text-gray-500 mb-6">
              ¿Confirmas {confirmToggle.activo ? 'desactivar' : 'activar'} la tarifa de{' '}
              <strong>
                {confirmToggle._servicio?.nombre ?? `Servicio #${confirmToggle.servicio_id}`}
              </strong>{' '}
              para{' '}
              <strong>
                {confirmToggle._motivo?.nombre ?? `Motivo #${confirmToggle.motivo_cita_id}`}
              </strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmToggle(null)}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleToggleEstado}
                disabled={accionLoading}
                className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition-colors ${
                  confirmToggle.activo ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {accionLoading ? '...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* Confirm toggle combo */}
      {confirmToggleCombo && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
              confirmToggleCombo.activo ? 'bg-red-100' : 'bg-green-100'
            }`}>
              {confirmToggleCombo.activo
                ? <XCircleIcon className="w-6 h-6 text-red-600" />
                : <CheckCircleIcon className="w-6 h-6 text-green-600" />}
            </div>
            <h3 className="text-center font-bold text-gray-900 mb-2">
              {confirmToggleCombo.activo ? 'Desactivar combo' : 'Activar combo'}
            </h3>
            <p className="text-center text-sm text-gray-500 mb-6">
              ¿Confirmas {confirmToggleCombo.activo ? 'desactivar' : 'activar'} el combo{' '}
              <strong>{confirmToggleCombo.nombre}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmToggleCombo(null)}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleToggleCombo}
                disabled={accionLoading}
                className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition-colors ${
                  confirmToggleCombo.activo ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {accionLoading ? '...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};

export default TarifasTab;