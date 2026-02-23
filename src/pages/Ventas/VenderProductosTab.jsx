import React, { useState, useEffect, useRef } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { crearVentaProducto, TIPOS_DESCUENTO } from '../../services/ventasService';
import { getProductos } from '../../services/inventarioService';
import { getPacientes } from '../../services/pacienteService';

const VenderProductosTab = () => {
  const [productos, setProductos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [lineas, setLineas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [descuentoGlobal, setDescuentoGlobal] = useState({ tipo: '%', valor: '' });
  const [observaciones, setObservaciones] = useState('');
  const [nota, setNota] = useState('');
  const [pacienteId, setPacienteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const searchRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [prodData, pacData] = await Promise.all([
        getProductos(),
        getPacientes(),
      ]);
      setProductos(prodData.filter(p => p.flg_activo));
      setPacientes(pacData);
    } catch (err) {
      console.error('Error cargando datos:', err);
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
    const igv = totalLinea * 0.18;
    const total = totalLinea + igv;
    return { subtotal, descuento, totalLinea, igv, total };
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

    const subtotal = subtotalDespuesDescuentosLineas - descuentoGlobalMonto;
    const igv = subtotal * 0.18;
    const total = subtotal + igv;

    return {
      subtotalBruto,
      descuentosLineas,
      descuentoGlobalMonto,
      subtotal,
      igv,
      total,
    };
  };

  const handleSubmit = async () => {
    setError('');
    setExito('');

    if (lineas.length === 0) {
      setError('Agrega al menos un producto');
      return;
    }

    if (!pacienteId) {
      setError('Selecciona un paciente');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        tipo_pagador_id: 1, // Paciente
        paciente_id: parseInt(pacienteId),
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
      setDescuentoGlobal({ tipo: '%', valor: '' });
      setObservaciones('');
      setNota('');

      setTimeout(() => setExito(''), 5000);
    } catch (err) {
      console.error('Error al registrar venta:', err);
      setError(err?.response?.data?.message || 'Error al registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  const totales = calcularTotales();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nueva Venta - Productos</h1>
              <p className="text-sm text-gray-500 mt-1">
                Registra ventas de productos del inventario
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
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

          {/* Búsqueda y Paciente */}
          <div className="p-6 border-b border-gray-100">
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

              {/* Paciente */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Paciente *
                </label>
                <select
                  value={pacienteId}
                  onChange={(e) => setPacienteId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]"
                >
                  <option value="">Seleccionar paciente...</option>
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombres} {p.apellidos}
                    </option>
                  ))}
                </select>
              </div>
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
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-600 uppercase">Subtotal</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-600 uppercase">IGV (18%)</th>
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
                        S/ {calc.totalLinea.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-right text-gray-600">
                        S/ {calc.igv.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        S/ {calc.total.toFixed(2)}
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
              {/* Observaciones */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    Observaciones (visible en comprobante)
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]"
                    placeholder="Ej: Producto con garantía de 30 días"
                  />
                </div>
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
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">S/ {totales.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">IGV (18%)</span>
                    <span className="font-semibold">S/ {totales.igv.toFixed(2)}</span>
                  </div>
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
                setObservaciones('');
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
      </div>
    </div>
  );
};

export default VenderProductosTab;
