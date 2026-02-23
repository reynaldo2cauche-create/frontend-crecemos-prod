import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  PlusIcon,
  ArrowPathIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  EyeIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CalendarIcon,
  ChevronUpDownIcon,
  CheckIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import {
  getComprasReposicion,
  crearCompraReposicion,
  getProductos,
  getProveedores,
  getCategorias,
  getTiposProducto,
  crearProducto,
  crearProveedor,
} from '../../services/inventarioService';

const formatFecha = (f) =>
  f ? new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const formatMonto = (n) => `S/ ${parseFloat(n || 0).toFixed(2)}`;

// ─── Combobox con búsqueda ────────────────────────────────────────────────────

const Combobox = ({ items, value, onChange, placeholder, label, displayKey = 'nombre' }) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Cerrar al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autofocus cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredItems = items.filter(item =>
    item[displayKey]?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedItem = items.find(item => item.id === value);

  const handleSelect = (item) => {
    onChange(item.id);
    setSearch('');
    setIsOpen(false);
  };

  const handleClearSelection = (e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
    setIsOpen(true);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Input de búsqueda visible */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? search : (selectedItem ? selectedItem[displayKey] : '')}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-8 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] transition-all"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {selectedItem && !isOpen && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="p-0.5 hover:bg-gray-100 rounded transition-colors"
              title="Limpiar selección"
            >
              <XMarkIcon className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
          <ChevronUpDownIcon className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-400 text-center">
              No se encontraron resultados
            </div>
          ) : (
            filteredItems.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-[#7B1FA2]/5 transition-colors flex items-center justify-between ${
                  item.id === value ? 'bg-[#7B1FA2]/10 font-semibold text-[#7B1FA2]' : 'text-gray-700'
                }`}
              >
                <span>{item[displayKey]}</span>
                {item.id === value && <CheckIcon className="w-4 h-4" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ─── Modal Crear Proveedor Rápido ─────────────────────────────────────────────

const CrearProveedorModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    contacto_nombre: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        nombre: form.nombre?.trim(),
        user_crea_id: user?.id,
      };

      if (form.telefono?.trim()) payload.telefono = form.telefono.trim();
      if (form.email?.trim()) payload.email = form.email.trim();
      if (form.direccion?.trim()) payload.direccion = form.direccion.trim();
      if (form.contacto_nombre?.trim()) payload.contacto_nombre = form.contacto_nombre.trim();

      const nuevoProveedor = await crearProveedor(payload);
      onCreated(nuevoProveedor);
    } catch (err) {
      console.error('Error al crear proveedor:', err);
      setError(err?.response?.data?.message || err?.message || 'Error al crear el proveedor');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] transition-all bg-white';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Crear Proveedor</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="overflow-y-auto px-6 py-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className={labelClass}>Nombre del Proveedor *</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))}
                required
                className={inputClass}
                placeholder="Ej. Distribuidora ABC"
              />
            </div>

            <div>
              <label className={labelClass}>Teléfono</label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={(e) => setForm(f => ({ ...f, telefono: e.target.value }))}
                className={inputClass}
                placeholder="Ej. 987654321"
              />
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                className={inputClass}
                placeholder="ejemplo@proveedor.com"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-semibold text-white bg-[#7B1FA2] rounded-lg hover:bg-[#6A1B9A] disabled:opacity-50 transition-colors">
              {loading ? 'Creando...' : 'Crear Proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// ─── Modal Crear Producto Rápido ──────────────────────────────────────────────

const CrearProductoModal = ({ categorias, proveedores, tiposProducto, onClose, onCreated, onProveedoresActualizados }) => {
  const [form, setForm] = useState({
    nombre: '',
    categoria_id: '',
    tipo_producto_id: '',
    precio_venta: '',
    precio_compra: '',
    stock_actual: 0,
    stock_minimo: 5,
    descripcion: '',
    unidad_medida: '',
    proveedor_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mostrarCrearProveedor, setMostrarCrearProveedor] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        nombre: form.nombre?.trim(),
        categoria_id: parseInt(form.categoria_id, 10),
        precio_venta: parseFloat(form.precio_venta),
        stock_actual: parseInt(form.stock_actual, 10) || 0,
        stock_minimo: parseInt(form.stock_minimo, 10) || 5,
      };

      if (form.tipo_producto_id) payload.tipo_producto_id = parseInt(form.tipo_producto_id, 10);
      if (form.descripcion?.trim()) payload.descripcion = form.descripcion.trim();
      if (form.unidad_medida?.trim()) payload.unidad_medida = form.unidad_medida.trim();
      if (form.proveedor_id) payload.proveedor_id = parseInt(form.proveedor_id, 10);
      if (form.precio_compra) payload.precio_compra = parseFloat(form.precio_compra);

      payload.user_crea_id = user?.id;

      const nuevoProducto = await crearProducto(payload);
      onCreated(nuevoProducto);
    } catch (err) {
      console.error('Error al crear producto:', err);
      setError(err?.response?.data?.message || err?.message || 'Error al crear el producto');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] transition-all bg-white';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7B1FA2]/10 flex items-center justify-center">
              <CubeIcon className="w-4 h-4 text-[#7B1FA2]" />
            </div>
            <h2 className="font-bold text-gray-900">Crear Producto Rápido</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="overflow-y-auto px-6 py-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Nombre del Producto *</label>
                <input name="nombre" value={form.nombre} onChange={handleChange} required className={inputClass} placeholder="Ej. Pelota sensorial grande" />
              </div>

              <div>
                <label className={labelClass}>Categoría *</label>
                <select name="categoria_id" value={form.categoria_id} onChange={handleChange} required className={inputClass}>
                  <option value="">Seleccionar...</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass}>Tipo de Producto *</label>
                <select name="tipo_producto_id" value={form.tipo_producto_id} onChange={handleChange} required className={inputClass}>
                  <option value="">Seleccionar...</option>
                  {tiposProducto.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass}>Precio de Compra (S/) *</label>
                <input type="number" step="0.01" min="0" name="precio_compra" value={form.precio_compra} onChange={handleChange} required className={inputClass} placeholder="0.00" />
              </div>

              <div>
                <label className={labelClass}>Precio de Venta (S/) *</label>
                <input type="number" step="0.01" min="0" name="precio_venta" value={form.precio_venta} onChange={handleChange} required className={inputClass} placeholder="0.00" />
              </div>

              <div>
                <label className={labelClass}>Stock Actual *</label>
                <input type="number" min="0" name="stock_actual" value={form.stock_actual} onChange={handleChange} required className={inputClass} placeholder="0" />
              </div>

              <div>
                <label className={labelClass}>Stock Mínimo *</label>
                <input type="number" min="0" name="stock_minimo" value={form.stock_minimo} onChange={handleChange} required className={inputClass} placeholder="5" />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Proveedor</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Combobox
                      items={[{ id: '', nombre: 'Sin proveedor' }, ...proveedores]}
                      value={form.proveedor_id}
                      onChange={(id) => setForm(f => ({ ...f, proveedor_id: id }))}
                      placeholder="Buscar proveedor..."
                      label="proveedor"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setMostrarCrearProveedor(true)}
                    className="px-3 py-2 text-xs font-semibold text-[#7B1FA2] bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors whitespace-nowrap flex items-center gap-1"
                    title="Crear nuevo proveedor"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    Nuevo Proveedor
                  </button>
                </div>
              </div>

              <div>
                <label className={labelClass}>Unidad de medida</label>
                <input name="unidad_medida" value={form.unidad_medida} onChange={handleChange} className={inputClass} placeholder="Ej. unidad, caja, kg" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-semibold text-white bg-[#7B1FA2] rounded-lg hover:bg-[#6A1B9A] disabled:opacity-50 transition-colors">
              {loading ? 'Creando...' : 'Crear Producto'}
            </button>
          </div>
        </form>

        {/* Modal anidado de crear proveedor */}
        {mostrarCrearProveedor && (
          <CrearProveedorModal
            onClose={() => setMostrarCrearProveedor(false)}
            onCreated={(nuevoProveedor) => {
              setMostrarCrearProveedor(false);
              // Auto-seleccionar el proveedor recién creado
              setForm(f => ({ ...f, proveedor_id: nuevoProveedor.id }));
              // Actualizar la lista de proveedores en el componente padre
              if (onProveedoresActualizados) {
                onProveedoresActualizados();
              }
            }}
          />
        )}
      </div>
    </div>,
    document.body
  );
};

// ─── Modal Nueva Compra ───────────────────────────────────────────────────────

const NuevaCompraModal = ({ productos, proveedores, onClose, onSaved, onCrearProducto, categorias, tiposProducto, onProveedoresActualizados }) => {
  const [form, setForm] = useState({
    proveedor_id: '',
    fecha_compra: new Date().toISOString().slice(0, 10),
    nota: '',
  });
  const [detalles, setDetalles] = useState([
    { producto_id: '', cantidad: 1, precio_unitario: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filaCreandoProducto, setFilaCreandoProducto] = useState(null);
  const [mostrarCrearProveedorDirecto, setMostrarCrearProveedorDirecto] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Al seleccionar un producto, autocompleta precio_unitario desde precio_compra
  const handleSelectProducto = (index, productoId, productoObj = null) => {
    // Si se pasa el producto directamente, usarlo; sino buscarlo en la lista
    const prod = productoObj || productos.find(p => p.id === productoId);
    setDetalles(d => d.map((item, i) =>
      i === index
        ? {
            ...item,
            producto_id: productoId,
            precio_unitario: prod?.precio_compra ? String(parseFloat(prod.precio_compra).toFixed(2)) : '',
          }
        : item
    ));
  };

  const addDetalle = () =>
    setDetalles(d => [...d, { producto_id: '', cantidad: 1, precio_unitario: '' }]);

  const removeDetalle = (i) =>
    setDetalles(d => d.filter((_, idx) => idx !== i));

  const updateDetalle = (i, key, value) =>
    setDetalles(d => d.map((item, idx) => idx === i ? { ...item, [key]: value } : item));

  const total = detalles.reduce(
    (acc, d) => acc + parseFloat(d.cantidad || 0) * parseFloat(d.precio_unitario || 0),
    0
  );

  const handleSubmit = async e => {
    e.preventDefault();
    if (detalles.some(d => !d.producto_id || !d.cantidad || !d.precio_unitario)) {
      setError('Completa todos los campos de los productos antes de registrar');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await crearCompraReposicion({
        ...form,
        proveedor_id: Number(form.proveedor_id),
        user_crea_id: user?.id,
        detalles: detalles.map(d => ({
          producto_id: Number(d.producto_id),
          cantidad: Number(d.cantidad),
          precio_unitario: parseFloat(d.precio_unitario),
        })),
      });
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al registrar la compra');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] transition-all bg-white';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7B1FA2]/10 flex items-center justify-center">
              <ArrowPathIcon className="w-4 h-4 text-[#7B1FA2]" />
            </div>
            <h2 className="font-bold text-gray-900">Registrar Compra de Reposición</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          {/* Sección 1: Datos generales */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">1. Datos de la compra</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Proveedor *</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Combobox
                      items={proveedores}
                      value={form.proveedor_id}
                      onChange={(id) => setForm(f => ({ ...f, proveedor_id: id }))}
                      placeholder="Buscar proveedor..."
                      label="proveedor"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setMostrarCrearProveedorDirecto(true)}
                    className="px-3 py-2 text-xs font-semibold text-[#7B1FA2] bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors whitespace-nowrap flex items-center gap-1"
                    title="Crear nuevo proveedor"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    Nuevo Proveedor
                  </button>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Fecha de Compra *</label>
                <input
                  type="date"
                  value={form.fecha_compra}
                  onChange={e => setForm(f => ({ ...f, fecha_compra: e.target.value }))}
                  required
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Nota interna{' '}
                  <span className="font-normal text-gray-400">(opcional — ej: N° factura, orden de compra)</span>
                </label>
                <input
                  value={form.nota}
                  onChange={e => setForm(f => ({ ...f, nota: e.target.value }))}
                  className={inputClass}
                  placeholder="Ej: Factura 001-00123 / OC mensual proveedor X"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Productos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">2. Productos a reponer</p>
                <p className="text-xs text-gray-400 mt-0.5">El precio se autocompleta desde el precio de compra del producto</p>
              </div>
              <button
                type="button"
                onClick={addDetalle}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#7B1FA2] bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Agregar producto
              </button>
            </div>

            {/* Header de columnas */}
            <div className="hidden sm:grid grid-cols-12 gap-3 px-3 mb-1">
              <div className="col-span-6 text-xs font-semibold text-gray-400">Producto</div>
              <div className="col-span-2 text-xs font-semibold text-gray-400 text-center">Cantidad</div>
              <div className="col-span-2 text-xs font-semibold text-gray-400 text-right">Precio unit. (S/)</div>
              <div className="col-span-2 text-xs font-semibold text-gray-400 text-right">Subtotal</div>
            </div>

            <div className="space-y-3">
              {detalles.map((d, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                  {/* Producto */}
                  <div className="col-span-12 sm:col-span-6">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Combobox
                          items={productos}
                          value={d.producto_id}
                          onChange={(id) => handleSelectProducto(i, id)}
                          placeholder="Buscar producto..."
                          label="producto"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFilaCreandoProducto(i)}
                        className="px-3 py-2 text-xs font-semibold text-[#7B1FA2] bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors whitespace-nowrap flex items-center gap-1"
                        title="Crear nuevo producto"
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                        Nuevo
                      </button>
                    </div>
                  </div>

                  {/* Cantidad */}
                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={d.cantidad}
                      onChange={e => updateDetalle(i, 'cantidad', e.target.value)}
                      className={inputClass + ' text-center font-semibold'}
                      placeholder="Cant."
                    />
                  </div>

                  {/* Precio unitario */}
                  <div className="col-span-4 sm:col-span-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">S/</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={d.precio_unitario}
                        onChange={e => updateDetalle(i, 'precio_unitario', e.target.value)}
                        className={inputClass + ' pl-7 text-right font-semibold'}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Subtotal + eliminar */}
                  <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      S/ {(parseFloat(d.cantidad || 0) * parseFloat(d.precio_unitario || 0)).toFixed(2)}
                    </span>
                    {detalles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDetalle(i)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                        title="Eliminar producto"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-200 gap-3">
              <span className="text-sm font-semibold text-gray-500">Total a pagar:</span>
              <span className="text-2xl font-bold text-[#7B1FA2]">{formatMonto(total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Registrando...' : 'Registrar Compra'}
          </button>
        </div>

        {/* Modal anidado de crear producto */}
        {filaCreandoProducto !== null && (
          <CrearProductoModal
            categorias={categorias}
            proveedores={proveedores}
            tiposProducto={tiposProducto}
            onClose={() => setFilaCreandoProducto(null)}
            onCreated={(nuevoProducto) => {
              console.log('Producto recién creado:', nuevoProducto);
              // Auto-seleccionar el producto recién creado en la fila específica
              // Pasar el producto completo para que pueda autocompletar el precio
              handleSelectProducto(filaCreandoProducto, nuevoProducto.id, nuevoProducto);
              setFilaCreandoProducto(null);
              // Notificar al padre para recargar productos
              if (onCrearProducto) {
                onCrearProducto();
              }
            }}
            onProveedoresActualizados={onProveedoresActualizados}
          />
        )}

        {/* Modal anidado de crear proveedor directo */}
        {mostrarCrearProveedorDirecto && (
          <CrearProveedorModal
            onClose={() => setMostrarCrearProveedorDirecto(false)}
            onCreated={(nuevoProveedor) => {
              setMostrarCrearProveedorDirecto(false);
              // Auto-seleccionar el proveedor recién creado
              setForm(f => ({ ...f, proveedor_id: nuevoProveedor.id }));
              // Notificar al padre para recargar proveedores
              if (onProveedoresActualizados) {
                onProveedoresActualizados();
              }
            }}
          />
        )}
      </div>
    </div>,
    document.body
  );
};

// ─── Modal Detalle Compra ─────────────────────────────────────────────────────

const DetalleCompraModal = ({ compra, onClose }) => {
  const totalCompra = (compra.detalles || []).reduce(
    (acc, d) => acc + d.cantidad * d.precio_unitario, 0
  );

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Detalle de Compra</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-xs text-gray-500">Proveedor</p>
              <p className="font-semibold text-gray-900">{compra.proveedor?.nombre || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Fecha</p>
              <p className="font-semibold text-gray-900">{formatFecha(compra.fecha_compra)}</p>
            </div>
            {compra.nota && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Nota interna</p>
                <p className="text-sm text-gray-700">{compra.nota}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Productos repuestos</p>
            <div className="space-y-2">
              {(compra.detalles || []).map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{d.producto?.nombre || '—'}</p>
                    <p className="text-xs text-gray-500">
                      {d.cantidad} unid. × {formatMonto(d.precio_unitario)}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900">{formatMonto(d.cantidad * d.precio_unitario)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center p-3 bg-[#7B1FA2]/5 rounded-xl border border-[#7B1FA2]/20">
            <span className="font-bold text-gray-700">Total pagado</span>
            <span className="text-xl font-bold text-[#7B1FA2]">{formatMonto(totalCompra)}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── Tab Principal ────────────────────────────────────────────────────────────

const ReposicionTab = () => {
  const [compras, setCompras] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tiposProducto, setTiposProducto] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalCrear, setModalCrear] = useState(false);
  const [compraDetalle, setCompraDetalle] = useState(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const [comp, prods, provs, cats, tipos] = await Promise.all([
        getComprasReposicion(),
        getProductos(false),
        getProveedores(false),
        getCategorias(true),
        getTiposProducto().catch(() => [
          { id: 1, nombre: 'Para venta' },
          { id: 2, nombre: 'Uso interno' },
        ]),
      ]);
      setCompras([...comp]); // forzar nuevo array para re-render
      setProductos(prods);
      setProveedores(provs);
      setCategorias(cats);
      setTiposProducto(tipos?.length ? tipos : [
        { id: 1, nombre: 'Para venta' },
        { id: 2, nombre: 'Uso interno' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const totalGastado = compras.reduce((acc, c) =>
    acc + (c.detalles || []).reduce((a, d) => a + d.cantidad * d.precio_unitario, 0), 0
  );

  const comprasMes = compras.filter(c => {
    if (!c.fecha_compra) return false;
    const f = new Date(c.fecha_compra);
    const now = new Date();
    return f.getMonth() === now.getMonth() && f.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reposición de Stock</h2>
        <p className="text-sm text-gray-500 mt-1">Registro de compras y reposición de inventario</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7B1FA2]/10 rounded-xl flex items-center justify-center">
              <ShoppingCartIcon className="w-5 h-5 text-[#7B1FA2]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{compras.length}</div>
              <div className="text-xs text-gray-500 font-medium">Total compras</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{comprasMes}</div>
              <div className="text-xs text-gray-500 font-medium">Este mes</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{formatMonto(totalGastado)}</div>
              <div className="text-xs text-gray-500 font-medium">Total invertido</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {compras.length} compra{compras.length !== 1 ? 's' : ''} registrada{compras.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setModalCrear(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] rounded-xl hover:shadow-lg transition-all"
        >
          <PlusIcon className="w-4 h-4" />
          Nueva Compra
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin" />
          </div>
        ) : compras.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ArrowPathIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No hay compras registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Proveedor</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Productos</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Nota</th>
                  <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Ver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {compras.map(c => {
                  const totalCompra = (c.detalles || []).reduce(
                    (acc, d) => acc + d.cantidad * d.precio_unitario, 0
                  );
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{formatFecha(c.fecha_compra)}</td>
                      <td className="px-4 py-4 text-gray-700">{c.proveedor?.nombre || '—'}</td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2 py-0.5 bg-[#7B1FA2]/10 text-[#7B1FA2] rounded-full text-xs font-semibold">
                          {(c.detalles || []).length} ítem{(c.detalles || []).length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-gray-900">{formatMonto(totalCompra)}</td>
                      <td className="px-4 py-4 text-gray-500 text-xs max-w-[150px] truncate">{c.nota || '—'}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setCompraDetalle(c)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#7B1FA2] hover:bg-purple-50 transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalCrear && (
        <NuevaCompraModal
          productos={productos}
          proveedores={proveedores}
          categorias={categorias}
          tiposProducto={tiposProducto}
          onClose={() => setModalCrear(false)}
          onSaved={() => {
            setModalCrear(false);
            setTimeout(() => cargar(), 300);
          }}
          onCrearProducto={() => {
            // Recargar productos después de crear uno nuevo
            cargar();
          }}
          onProveedoresActualizados={() => {
            // Recargar proveedores después de crear uno nuevo
            cargar();
          }}
        />
      )}

      {compraDetalle && (
        <DetalleCompraModal
          compra={compraDetalle}
          onClose={() => setCompraDetalle(null)}
        />
      )}
    </div>
  );
};

export default ReposicionTab;