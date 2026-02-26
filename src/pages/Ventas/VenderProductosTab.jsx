import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  UserIcon,
  UserGroupIcon,
  UserPlusIcon,
  XMarkIcon,
  DocumentTextIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import {
  crearVentaProducto,
  TIPOS_DESCUENTO,
  TIPOS_PAGADOR,
  getCompradoresExternos,
  crearCompradorExterno,
  getTiposComprobante,
} from '../../services/ventasService';
import { getProductos } from '../../services/inventarioService';
import {
  getPacientes,
  getTodosLosResponsables,
  getPacientesPorResponsable,
} from '../../services/pacienteService';

// ─── Componente Autocomplete ──────────────────────────────────────────────────
const SearchableCombobox = ({
  items = [],
  value,
  onChange,
  placeholder = 'Buscar...',
  getItemLabel,
  getItemValue,
  getItemSearchText,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const wrapperRef = useRef(null);

  const safeItems = Array.isArray(items) ? items : [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        if (!value) setInputValue('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  useEffect(() => {
    if (value && safeItems.length > 0) {
      const found = safeItems.find(item => getItemValue(item) === value);
      if (found) setInputValue(getItemLabel(found));
    } else if (!value) {
      setInputValue('');
    }
  }, [value, safeItems]);

  const filteredItems = inputValue.trim()
    ? safeItems.filter(item =>
        getItemSearchText(item).toLowerCase().includes(inputValue.toLowerCase())
      )
    : safeItems;

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    if (!e.target.value) onChange('');
  };

  const handleSelect = (item) => {
    onChange(getItemValue(item));
    setInputValue(getItemLabel(item));
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] ${
            disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
          }`}
        />
      </div>

      {isOpen && !disabled && filteredItems.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {filteredItems.map((item, i) => {
            const itemValue = getItemValue(item);
            const isSelected = itemValue === value;
            return (
              <button
                key={itemValue ?? i}
                type="button"
                onClick={() => handleSelect(item)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 ${isSelected ? 'bg-purple-50' : ''}`}
              >
                <span className={`text-sm block ${isSelected ? 'text-[#7B1FA2] font-semibold' : 'text-gray-900'}`}>
                  {getItemLabel(item)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {isOpen && !disabled && inputValue && filteredItems.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-8 text-center">
          <p className="text-sm text-gray-400">No se encontraron resultados</p>
        </div>
      )}
    </div>
  );
};

const VenderProductosTab = () => {
  const [productos, setProductos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [responsables, setResponsables] = useState([]);
  const [pacientesDelResponsable, setPacientesDelResponsable] = useState([]);
  const [compradoresExternos, setCompradoresExternos] = useState([]);
  const [tiposComprobante, setTiposComprobante] = useState([]);

  const [lineas, setLineas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [descuentoGlobal, setDescuentoGlobal] = useState({ tipo: '%', valor: '' });
  const [nota, setNota] = useState('');

  // 🆕 Estados para tipo de pagador
  const [tipoPagador, setTipoPagador] = useState(TIPOS_PAGADOR.PACIENTE);
  const [pacienteId, setPacienteId] = useState('');
  const [responsableId, setResponsableId] = useState('');
  const [compradorExternoId, setCompradorExternoId] = useState('');

  // Comprobante
  const [tipoComprobante, setTipoComprobante] = useState(1); // 1=Nota de Venta por defecto

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [mostrarModalExterno, setMostrarModalExterno] = useState(false);
  const [formExterno, setFormExterno] = useState({ dni: '', nombre: '', telefono: '', email: '' });

  const searchRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const conIgv = tipoComprobante === 2 || tipoComprobante === 3;

  useEffect(() => {
    cargarDatos();
  }, []);

  // 🆕 Cuando selecciona responsable → cargar sus pacientes
  useEffect(() => {
    if (tipoPagador === TIPOS_PAGADOR.RESPONSABLE && responsableId) {
      cargarPacientesDelResponsable();
    }
  }, [responsableId]);

  const cargarDatos = async () => {
    try {
      const [prodData, pacData, respData, compData, tiposComp] = await Promise.all([
        getProductos(),
        getPacientes(),
        getTodosLosResponsables(),
        getCompradoresExternos(),
        getTiposComprobante(),
      ]);
      setProductos(prodData.filter(p => p.flg_activo));
      setPacientes(pacData);

      const responsablesArray = respData?.data && Array.isArray(respData.data) ? respData.data : [];
      setResponsables(responsablesArray);

      setCompradoresExternos(Array.isArray(compData) ? compData : []);
      setTiposComprobante(Array.isArray(tiposComp) ? tiposComp : []);
    } catch (err) {
      console.error('Error cargando datos:', err);
    }
  };

  // 🆕 Cargar pacientes del responsable seleccionado
  const cargarPacientesDelResponsable = async () => {
    try {
      const resp = await getPacientesPorResponsable(responsableId);
      const pacientesResp = resp?.data && Array.isArray(resp.data) ? resp.data : [];
      setPacientesDelResponsable(pacientesResp);

      // ✅ Si tiene 1 solo paciente → autoseleccionarlo
      if (pacientesResp.length === 1) {
        setPacienteId(pacientesResp[0].id);
      }
    } catch (error) {
      console.error('Error cargando pacientes del responsable:', error);
      setPacientesDelResponsable([]);
    }
  };

  const productosFiltrados = busqueda
    ? productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.codigo?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : [];

  const agregarProducto = (producto) => {
    const yaExiste = lineas.find(l => l.producto_id === producto.id);
    if (yaExiste) {
      setCantidad(yaExiste.id, yaExiste.cantidad + 1);
    } else {
      const nuevaLinea = {
        id: Date.now(),
        producto_id: producto.id,
        nombre: producto.nombre,
        cantidad: 1,
        precio_unitario: parseFloat(producto.precio_venta || 0),
        descuento_tipo: '',
        descuento_valor: '',
        stock_disponible: producto.stock_actual,
      };
      setLineas([...lineas, nuevaLinea]);
    }
    setBusqueda('');
    setMostrarResultados(false);
  };

  const setCantidad = (id, nuevaCantidad) => {
    setLineas(lineas.map(l => {
      if (l.id === id) {
        const cantidad = Math.max(1, Math.min(nuevaCantidad, l.stock_disponible));
        return { ...l, cantidad };
      }
      return l;
    }));
  };

  const setDescuentoLinea = (id, tipo, valor) => {
    setLineas(lineas.map(l =>
      l.id === id ? { ...l, descuento_tipo: tipo, descuento_valor: valor } : l
    ));
  };

  const eliminarLinea = (id) => {
    setLineas(lineas.filter(l => l.id !== id));
  };

  const calcularLinea = (linea) => {
    const subtotal = linea.cantidad * linea.precio_unitario;
    let descuento = 0;
    if (linea.descuento_tipo && linea.descuento_valor) {
      if (linea.descuento_tipo === '%') {
        descuento = subtotal * (parseFloat(linea.descuento_valor) / 100);
      } else {
        descuento = parseFloat(linea.descuento_valor);
      }
    }
    const totalLinea = subtotal - descuento;
    // 🆕 IGV incluido en el precio (solo si aplica)
    const igv = conIgv ? totalLinea - totalLinea / 1.18 : 0;
    const base = conIgv ? totalLinea / 1.18 : totalLinea;
    return { subtotal, descuento, totalLinea, igv, base };
  };

  const calcularTotales = () => {
    let subtotalBruto = 0;
    let descuentosLineas = 0;

    lineas.forEach(linea => {
      const calc = calcularLinea(linea);
      subtotalBruto += calc.subtotal;
      descuentosLineas += calc.descuento;
    });

    const subtotalDespuesDescuentosLineas = subtotalBruto - descuentosLineas;

    let descuentoGlobalMonto = 0;
    if (descuentoGlobal.tipo && descuentoGlobal.valor) {
      if (descuentoGlobal.tipo === '%') {
        descuentoGlobalMonto = subtotalDespuesDescuentosLineas * (parseFloat(descuentoGlobal.valor) / 100);
      } else {
        descuentoGlobalMonto = parseFloat(descuentoGlobal.valor);
      }
    }

    const totalConDesc = subtotalDespuesDescuentosLineas - descuentoGlobalMonto;
    // 🆕 IGV incluido en el precio (solo si aplica)
    const igv = conIgv ? totalConDesc - totalConDesc / 1.18 : 0;
    const base = conIgv ? totalConDesc / 1.18 : totalConDesc;

    return {
      subtotalBruto,
      descuentosLineas,
      descuentoGlobalMonto,
      base,      // base imponible (sin IGV)
      igv,       // IGV (incluido en el precio si aplica)
      total: totalConDesc,  // total final (precio con IGV incluido)
    };
  };

  const handleCrearExterno = async (e) => {
    e.preventDefault();
    try {
      const nuevoExterno = await crearCompradorExterno({ ...formExterno, user_crea_id: user?.id });
      setCompradoresExternos([...compradoresExternos, nuevoExterno]);
      setCompradorExternoId(nuevoExterno.id);
      setMostrarModalExterno(false);
      setFormExterno({ dni: '', nombre: '', telefono: '', email: '' });
    } catch (err) {
      alert(err?.response?.data?.message || 'Error al crear comprador externo');
    }
  };

const handleSubmit = async () => {
    setError('');
    setExito('');

    if (lineas.length === 0) return setError('Agrega al menos un producto');
    if (tipoPagador === TIPOS_PAGADOR.PACIENTE && !pacienteId) return setError('Selecciona un paciente');
    if (tipoPagador === TIPOS_PAGADOR.RESPONSABLE && !responsableId) return setError('Selecciona un responsable');
    if (tipoPagador === TIPOS_PAGADOR.EXTERNO && !compradorExternoId) return setError('Selecciona o crea un comprador externo');

    setLoading(true);
    try {
      const payload = {
        // FIX: el DTO del backend espera tipo_comprador_id, no tipo_pagador_id
        tipo_comprador_id: tipoPagador,
        tipo_comprobante_id: tipoComprobante,
        fecha_venta: new Date().toISOString().slice(0, 10),
        user_crea_id: user?.id,
        detalles: lineas.map(l => {
          const det = {
            producto_id: l.producto_id,
            cantidad: l.cantidad,
            precio_unitario: l.precio_unitario,
          };
          if (l.descuento_tipo && l.descuento_valor) {
            det.descuento_tipo_id = l.descuento_tipo === '%' ? TIPOS_DESCUENTO.PORCENTAJE : TIPOS_DESCUENTO.MONTO_FIJO;
            det.descuento_valor = parseFloat(l.descuento_valor);
          }
          return det;
        }),
      };

      if (tipoPagador === TIPOS_PAGADOR.PACIENTE) payload.paciente_id = parseInt(pacienteId);
      if (tipoPagador === TIPOS_PAGADOR.RESPONSABLE) {
        payload.responsable_id = parseInt(responsableId);
        if (pacienteId) payload.paciente_id = parseInt(pacienteId);
      }
      if (tipoPagador === TIPOS_PAGADOR.EXTERNO) payload.comprador_externo_id = parseInt(compradorExternoId);

      if (descuentoGlobal.tipo && descuentoGlobal.valor) {
        payload.descuento_tipo_id = descuentoGlobal.tipo === '%' ? TIPOS_DESCUENTO.PORCENTAJE : TIPOS_DESCUENTO.MONTO_FIJO;
        payload.descuento_valor = parseFloat(descuentoGlobal.valor);
      }

      if (nota) payload.nota = nota;

      await crearVentaProducto(payload);
      setExito('¡Venta registrada exitosamente!');

      // Reset
      setLineas([]);
      setPacienteId('');
      setResponsableId('');
      setCompradorExternoId('');
      setPacientesDelResponsable([]);
      setDescuentoGlobal({ tipo: '%', valor: '' });
      setNota('');

      setTimeout(() => setExito(''), 5000);
    } catch (err) {
      console.error('Error al registrar venta:', err);
      // FIX: NestJS devuelve message como array en errores de validación
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  const totales = calcularTotales();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1.5">
            <ShoppingCartIcon className="w-8 h-8 text-[#7B1FA2]" />
            <h1 className="text-3xl font-bold text-gray-900">Venta de Productos</h1>
          </div>
          <p className="text-sm text-gray-500">Registra ventas de productos del inventario</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Alertas */}
          {error && (
            <div className="mx-6 mt-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          {exito && (
            <div className="mx-6 mt-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {exito}
            </div>
          )}

          {/* ── Tipo de Comprobante ────────────────────────────────────────── */}
          <div className="p-6 border-b border-gray-100">
            <label className="block text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <DocumentTextIcon className="w-4 h-4" />
              Tipo de Comprobante
            </label>
            <div className="flex flex-wrap gap-3">
              {tiposComprobante.map(tc => (
                <button
                  key={tc.id}
                  type="button"
                  onClick={() => setTipoComprobante(tc.id)}
                  className={`px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    tipoComprobante === tc.id
                      ? 'border-[#7B1FA2] bg-purple-50 text-[#7B1FA2]'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {tc.nombre}
                </button>
              ))}
            </div>
            {conIgv && (
              <p className="mt-2 text-xs text-amber-600 font-medium">
                ⚠ Los precios ya incluyen IGV (18%). Se mostrará desglosado en el resumen.
              </p>
            )}
          </div>

          {/* ── Pagador ───────────────────────────────────────────────────── */}
          <div className="p-6 border-b border-gray-100">
            <label className="block text-xs font-semibold text-gray-600 mb-3">¿Quién paga?</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {[
                { id: TIPOS_PAGADOR.PACIENTE,    nombre: 'Paciente',           icon: UserIcon },
                { id: TIPOS_PAGADOR.RESPONSABLE, nombre: 'Responsable',        icon: UserGroupIcon },
                { id: TIPOS_PAGADOR.EXTERNO,     nombre: 'Comprador Externo',  icon: UserPlusIcon },
              ].map(tipo => {
                const Icon   = tipo.icon;
                const activo = tipoPagador === tipo.id;
                return (
                  <button
                    key={tipo.id}
                    type="button"
                    onClick={() => setTipoPagador(tipo.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                      activo ? 'border-[#7B1FA2] bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activo ? 'bg-[#7B1FA2] text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`font-semibold text-sm ${activo ? 'text-[#7B1FA2]' : 'text-gray-700'}`}>
                      {tipo.nombre}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Búsqueda de producto */}
              <div className="relative" ref={searchRef}>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Buscar Producto
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => {
                      setBusqueda(e.target.value);
                      setMostrarResultados(true);
                    }}
                    onFocus={() => setMostrarResultados(true)}
                    placeholder="Buscar por nombre o código..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]"
                  />
                </div>

                {/* Resultados de búsqueda */}
                {mostrarResultados && busqueda && productosFiltrados.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                    {productosFiltrados.slice(0, 10).map(producto => (
                      <button
                        key={producto.id}
                        onClick={() => agregarProducto(producto)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="font-semibold text-gray-900">{producto.nombre}</div>
                        <div className="text-xs text-gray-500">
                          Stock: {producto.stock_actual} | S/ {parseFloat(producto.precio_venta || 0).toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagador según tipo */}
              {tipoPagador === TIPOS_PAGADOR.PACIENTE && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Paciente (Pagador) *</label>
                  <SearchableCombobox
                    items={pacientes}
                    value={pacienteId}
                    onChange={(value) => setPacienteId(value)}
                    placeholder="Buscar por DNI o nombre..."
                    getItemLabel={(p) => `${p.nombres || ''} ${p.apellido_paterno || ''} ${p.apellido_materno || ''} - DNI: ${p.numero_documento || 'S/N'}`.trim()}
                    getItemValue={(p) => p.id}
                    getItemSearchText={(p) => `${p.numero_documento || ''} ${p.nombres || ''} ${p.apellido_paterno || ''} ${p.apellido_materno || ''}`.toLowerCase()}
                  />
                </div>
              )}

              {tipoPagador === TIPOS_PAGADOR.RESPONSABLE && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Responsable (Pagador) *</label>
                  <SearchableCombobox
                    items={responsables}
                    value={responsableId}
                    onChange={(value) => {
                      setResponsableId(value);
                      setPacienteId('');
                      setPacientesDelResponsable([]);
                    }}
                    placeholder="Buscar responsable por DNI o nombre..."
                    getItemLabel={(r) => `${r.nombres || ''} ${r.apellido_paterno || ''} ${r.apellido_materno || ''} - DNI: ${r.numero_documento || 'S/N'}`.trim()}
                    getItemValue={(r) => r.id}
                    getItemSearchText={(r) => `${r.numero_documento || ''} ${r.nombres || ''} ${r.apellido_paterno || ''} ${r.apellido_materno || ''}`.toLowerCase()}
                  />
                  {responsableId && pacientesDelResponsable.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      ℹ️ {pacientesDelResponsable.length} paciente{pacientesDelResponsable.length > 1 ? 's' : ''} a cargo{pacientesDelResponsable.length === 1 ? ' (autoseleccionado)' : ''}
                    </p>
                  )}
                </div>
              )}

              {tipoPagador === TIPOS_PAGADOR.EXTERNO && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Comprador Externo (Pagador) *</label>
                  <div className="flex gap-2">
                    <SearchableCombobox
                      items={compradoresExternos}
                      value={compradorExternoId}
                      onChange={(value) => setCompradorExternoId(value)}
                      placeholder="Buscar por DNI o nombre..."
                      getItemLabel={(c) => `${c.nombre} - DNI: ${c.dni}`}
                      getItemValue={(c) => c.id}
                      getItemSearchText={(c) => `${c.dni} ${c.nombre}`}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarModalExterno(true)}
                      className="px-4 py-3 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] whitespace-nowrap"
                    >
                      + Nuevo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabla de productos */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-600 uppercase">Producto</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 uppercase">Cantidad</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-600 uppercase">Precio U.</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-600 uppercase">Descuento</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-600 uppercase">{conIgv ? 'Base' : 'Subtotal'}</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-600 uppercase">{conIgv ? 'IGV (incl.)' : '—'}</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-gray-600 uppercase">Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lineas.map(linea => {
                  const calc = calcularLinea(linea);
                  return (
                    <tr key={linea.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{linea.nombre}</div>
                        <div className="text-xs text-gray-500">Stock: {linea.stock_disponible}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setCantidad(linea.id, linea.cantidad - 1)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <MinusIcon className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="w-12 text-center font-semibold">{linea.cantidad}</span>
                          <button
                            onClick={() => setCantidad(linea.id, linea.cantidad + 1)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <PlusIcon className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        S/ {linea.precio_unitario.toFixed(2)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <select
                            value={linea.descuento_tipo}
                            onChange={(e) => setDescuentoLinea(linea.id, e.target.value, linea.descuento_valor)}
                            className="px-2 py-1 text-xs border border-gray-200 rounded"
                          >
                            <option value="">-</option>
                            <option value="%">%</option>
                            <option value="S/">S/</option>
                          </select>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={linea.descuento_valor}
                            onChange={(e) => setDescuentoLinea(linea.id, linea.descuento_tipo, e.target.value)}
                            className="w-16 px-2 py-1 text-xs text-right border border-gray-200 rounded"
                            placeholder="0"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        S/ {calc.base.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-right text-gray-600">
                        {conIgv ? `S/ ${calc.igv.toFixed(2)}` : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        S/ {calc.totalLinea.toFixed(2)}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => eliminarLinea(linea.id)}
                          className="p-1 hover:bg-red-50 rounded text-red-600"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {lineas.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                      Busca y agrega productos para comenzar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Resumen y totales */}
          <div className="p-6 border-t border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Nota interna */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Nota interna (no visible en comprobante)
                </label>
                <textarea
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]"
                  placeholder="Notas internas..."
                />
              </div>

              {/* Totales */}
              <div className="space-y-3">
                {/* Descuento Global */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Descuento Global</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={descuentoGlobal.tipo}
                      onChange={(e) => setDescuentoGlobal({ ...descuentoGlobal, tipo: e.target.value })}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    >
                      <option value="%">%</option>
                      <option value="S/">S/</option>
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={descuentoGlobal.valor}
                      onChange={(e) => setDescuentoGlobal({ ...descuentoGlobal, valor: e.target.value })}
                      className="w-24 px-3 py-2 text-sm text-right border border-gray-200 rounded-lg"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{conIgv ? 'Base imponible' : 'Subtotal'}</span>
                    <span className="font-semibold">S/ {totales.base.toFixed(2)}</span>
                  </div>
                  {conIgv && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">IGV (18% incl.)</span>
                      <span className="font-semibold">S/ {totales.igv.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-lg font-bold border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span className="text-[#7B1FA2]">S/ {totales.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => {
                setLineas([]);
                setPacienteId('');
                setDescuentoGlobal({ tipo: '%', valor: '' });
                setNota('');
              }}
              className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || lineas.length === 0}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Guardar Venta'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Crear Comprador Externo */}
      {mostrarModalExterno && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Nuevo Comprador Externo</h3>
              <button
                onClick={() => {
                  setMostrarModalExterno(false);
                  setFormExterno({ dni: '', nombre: '', telefono: '', email: '' });
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleCrearExterno} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">DNI *</label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  value={formExterno.dni}
                  onChange={(e) => setFormExterno({ ...formExterno, dni: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]"
                  placeholder="Ej: 12345678"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={formExterno.nombre}
                  onChange={(e) => setFormExterno({ ...formExterno, nombre: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]"
                  placeholder="Ej: Juan Pérez García"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Teléfono</label>
                <input
                  type="text"
                  maxLength={9}
                  value={formExterno.telefono}
                  onChange={(e) => setFormExterno({ ...formExterno, telefono: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]"
                  placeholder="Ej: 987654321"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Email</label>
                <input
                  type="email"
                  value={formExterno.email}
                  onChange={(e) => setFormExterno({ ...formExterno, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]"
                  placeholder="Ej: ejemplo@correo.com"
                />
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalExterno(false);
                    setFormExterno({ dni: '', nombre: '', telefono: '', email: '' });
                  }}
                  className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A]"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
    
  );
};

export default VenderProductosTab;
