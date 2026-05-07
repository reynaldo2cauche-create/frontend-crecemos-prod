// VenderProductosTab.jsx - Agregar soporte para modoEdicion

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
  SparklesIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';
import {
  crearVentaProducto,
  TIPOS_DESCUENTO,
  TIPOS_PAGADOR,
  getCompradoresExternos,
  crearCompradorExterno,
  getTiposComprobante,
} from '../../services/ventasService';
import { calcularPromociones } from '../../services/promocionesService';
import { getProductos } from '../../services/inventarioService';
import {
  getPacientes,
  getTodosLosResponsables,
  getPacientesPorResponsable,
} from '../../services/pacienteService';
import { obtenerModalidadesPago } from '../../services/solicitudInformeService';
import ModalExito from '../../components/Ventas/ModalExito';
import PrintPreviewModal from '../../components/Ventas/TicketComponents';

const TIPO_VENTA_PRODUCTO = 1;

// ─── SearchableCombobox ───────────────────────────────────────────────────────
const SearchableCombobox = ({
  items = [], value, onChange, placeholder = 'Buscar...',
  getItemLabel, getItemValue, getItemSearchText,
  disabled = false, className = '',
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
    ? safeItems.filter(item => getItemSearchText(item).toLowerCase().includes(inputValue.toLowerCase()))
    : safeItems;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input type="text" value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setIsOpen(true); if (!e.target.value) onChange(''); }}
          onFocus={() => setIsOpen(true)} placeholder={placeholder} disabled={disabled}
          className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
        />
      </div>
      {isOpen && !disabled && filteredItems.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {filteredItems.map((item, i) => {
            const itemValue = getItemValue(item);
            const isSelected = itemValue === value;
            return (
              <button key={itemValue ?? i} type="button"
                onClick={() => { onChange(getItemValue(item)); setInputValue(getItemLabel(item)); setIsOpen(false); }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 ${isSelected ? 'bg-purple-50' : ''}`}>
                <span className={`text-sm block ${isSelected ? 'text-[#7B1FA2] font-semibold' : 'text-gray-900'}`}>{getItemLabel(item)}</span>
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

// ─── PanelPromociones ─────────────────────────────────────────────────────────
const PanelPromociones = ({ promocionesAplicadas, totalDescuento, calculando }) => {
  if (calculando) {
    return (
      <div className="p-3 bg-pink-50 border border-pink-200 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-pink-600">
          <SparklesIcon className="w-4 h-4 animate-pulse" />
          <span>Buscando promociones...</span>
        </div>
      </div>
    );
  }
  if (!promocionesAplicadas || promocionesAplicadas.length === 0) return null;
  return (
    <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
      <div className="flex items-center gap-2">
        <SparklesIcon className="w-4 h-4 text-green-600" />
        <span className="text-sm font-semibold text-green-700">
          {promocionesAplicadas.length} promoción{promocionesAplicadas.length > 1 ? 'es' : ''} aplicada{promocionesAplicadas.length > 1 ? 's' : ''}
        </span>
      </div>
      {promocionesAplicadas.map((p, i) => (
        <div key={i} className="flex items-start justify-between text-xs text-green-700 gap-2">
          <span className="flex items-center gap-1">
            {p.producto_regalo ? <GiftIcon className="w-3.5 h-3.5 shrink-0 text-green-600" /> : '✓'}
            {p.mensaje || p.promocion?.nombre}
          </span>
          {p.producto_regalo
            ? <span className="font-semibold shrink-0 text-green-600">¡GRATIS!</span>
            : <span className="font-semibold shrink-0">-S/ {p.descuento.toFixed(2)}</span>
          }
        </div>
      ))}
      {totalDescuento > 0 && (
        <div className="flex items-center justify-between text-sm font-bold text-green-800 border-t border-green-300 pt-2">
          <span>Ahorro total por promociones</span>
          <span>-S/ {totalDescuento.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
};

// ─── Componente principal VenderProductosTab ─────────────────────────────────────
const VenderProductosTab = ({ 
  modoEdicion = false, 
  ventaExistente = null, 
  onGuardarEdicion = null, 
  onCancelarEdicion = null 
}) => {
  // Estados para datos maestros
  const [productos, setProductos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [responsables, setResponsables] = useState([]);
  const [pacientesDelResponsable, setPacientesDelResponsable] = useState([]);
  const [compradoresExternos, setCompradoresExternos] = useState([]);
  const [tiposComprobante, setTiposComprobante] = useState([]);
  const [modalidadesPago, setModalidadesPago] = useState([]);
  const [pagos, setPagos] = useState([{ uid: Date.now(), modalidad_pago_id: '', monto: '', referencia: '' }]);

  // Estados para la venta
  const [lineas, setLineas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [descuentoGlobal, setDescuentoGlobal] = useState({ tipo: '%', valor: '' });
  const [nota, setNota] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [tipoPagador, setTipoPagador] = useState(TIPOS_PAGADOR.PACIENTE);
  const [pacienteId, setPacienteId] = useState('');
  const [responsableId, setResponsableId] = useState('');
  const [compradorExternoId, setCompradorExternoId] = useState('');
  const [tipoComprobante, setTipoComprobante] = useState(1);

  const [promocionesAplicadas, setPromocionesAplicadas] = useState([]);
  const [totalDescuentoPromo, setTotalDescuentoPromo] = useState(0);
  const [productosRegalo, setProductosRegalo] = useState([]);
  const [calculandoPromos, setCalculandoPromos] = useState(false);
  const timerPromo = useRef(null);

  // Eliminar estado individual de modalidad
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mostrarModalExterno, setMostrarModalExterno] = useState(false);
  const [formExterno, setFormExterno] = useState({ dni: '', nombre: '', telefono: '', email: '' });

  const [mostrarModalExito, setMostrarModalExito] = useState(false);
  const [ventaGuardada, setVentaGuardada] = useState(null);
  const [mostrarModalImpresion, setMostrarModalImpresion] = useState(false);

  const [alertaAbierta, setAlertaAbierta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState('');
  const [tituloAlerta, setTituloAlerta] = useState('');

  const searchRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const conIgv = tipoComprobante === 2 || tipoComprobante === 3;

  // Determinar si está en modo edición y bloqueado
  const esModoEdicion = modoEdicion && ventaExistente;
  const bloqueado = !!ventaGuardada && !modoEdicion;

  // Cargar datos maestros al montar
  useEffect(() => { cargarDatos(); }, []);

  // Cargar datos de la venta existente si está en modo edición
  useEffect(() => {
    if (esModoEdicion && ventaExistente) {
      cargarVentaExistente();
    }
  }, [esModoEdicion, ventaExistente]);

  // Cargar pacientes del responsable cuando cambia responsableId
  useEffect(() => {
    if (tipoPagador === TIPOS_PAGADOR.RESPONSABLE && responsableId) {
      cargarPacientesDelResponsable();
    }
  }, [responsableId]);

  // Recalcular promociones cuando cambian las líneas
  useEffect(() => {
    if (lineas.length === 0) {
      setPromocionesAplicadas([]);
      setTotalDescuentoPromo(0);
      setProductosRegalo([]);
      return;
    }
    clearTimeout(timerPromo.current);
    timerPromo.current = setTimeout(() => recalcularPromociones(), 600);
    return () => clearTimeout(timerPromo.current);
  }, [lineas]);

  const cargarDatos = async () => {
    try {
      const [prodData, pacData, respData, compData, tiposComp, modalidades] = await Promise.all([
        getProductos(),
        getPacientes(),
        getTodosLosResponsables(),
        getCompradoresExternos(),
        getTiposComprobante(),
        obtenerModalidadesPago(),
      ]);
      setProductos(prodData.filter(p => p.flg_activo));
      setPacientes(pacData);
      setResponsables(respData?.data && Array.isArray(respData.data) ? respData.data : []);
      setCompradoresExternos(Array.isArray(compData) ? compData : []);
      setTiposComprobante(Array.isArray(tiposComp) ? tiposComp : []);
      setModalidadesPago(Array.isArray(modalidades) ? modalidades : []);
    } catch (err) { console.error('Error cargando datos:', err); }
  };

  const cargarVentaExistente = () => {
    const v = ventaExistente;
    
    // Tipo de comprobante
    if (v.tipo_comprobante?.id) setTipoComprobante(v.tipo_comprobante.id);
    
    // Tipo de pagador
    const pagadorId = v.tipo_pagador_id || v.tipo_comprador_id;
    if (pagadorId) setTipoPagador(pagadorId);
    
    // Según tipo de pagador
    if (pagadorId === TIPOS_PAGADOR.PACIENTE && v.paciente_id) {
      setPacienteId(v.paciente_id);
    }
    if (pagadorId === TIPOS_PAGADOR.RESPONSABLE && v.responsable_id) {
      setResponsableId(v.responsable_id);
      if (v.paciente_id) setPacienteId(v.paciente_id);
    }
    if (pagadorId === TIPOS_PAGADOR.EXTERNO && v.comprador_externo_id) {
      setCompradorExternoId(v.comprador_externo_id);
    }
    
    // Pagos
    if (v.pagos && v.pagos.length > 0) {
      setPagos(v.pagos.map(p => ({ uid: p.id, modalidad_pago_id: p.modalidad_pago_id, monto: p.monto, referencia: p.referencia || '' })));
    } else if (v.modalidad_pago_id) {
      setPagos([{ uid: Date.now(), modalidad_pago_id: v.modalidad_pago_id, monto: v.total || '', referencia: '' }]);
    }
    
    // Nota y observaciones
    if (v.nota) setNota(v.nota);
    if (v.observaciones) setObservaciones(v.observaciones);
    
    // Descuento global
    if (v.descuento_tipo) {
      const tipoDescuento = v.descuento_tipo.id === 1 ? '%' : 'S/';
      setDescuentoGlobal({ tipo: tipoDescuento, valor: v.descuento_valor?.toString() || '' });
    }
    
    // Líneas de productos
    if (v.detalles && Array.isArray(v.detalles)) {
      const lineasCargadas = v.detalles.map(d => ({
        id: d.id || Date.now() + Math.random(),
        producto_id: d.producto_id,
        categoria_id: d.producto?.categoria_id || null,
        nombre: d.producto?.nombre || '-',
        cantidad: parseFloat(d.cantidad) || 1,
        precio_unitario: parseFloat(d.precio_unitario) || 0,
        descuento_tipo: d.descuento_tipo ? (d.descuento_tipo.id === 1 ? '%' : 'S/') : '',
        descuento_valor: d.descuento_valor?.toString() || '',
        stock_disponible: d.producto?.stock_actual || 999,
      }));
      setLineas(lineasCargadas);
    }
    
    // Promociones aplicadas (si existen)
    if (v.promociones_aplicadas) {
      setPromocionesAplicadas(v.promociones_aplicadas);
      const totalPromo = v.promociones_aplicadas.reduce((s, p) => s + parseFloat(p.monto_ahorrado || 0), 0);
      setTotalDescuentoPromo(totalPromo);
    }
  };

  const cargarPacientesDelResponsable = async () => {
    try {
      const resp = await getPacientesPorResponsable(responsableId);
      const pacientesResp = resp?.data && Array.isArray(resp.data) ? resp.data : [];
      setPacientesDelResponsable(pacientesResp);
      if (pacientesResp.length === 1) setPacienteId(pacientesResp[0].id);
    } catch { setPacientesDelResponsable([]); }
  };

  const recalcularPromociones = async () => {
    if (lineas.length === 0) return;
    setCalculandoPromos(true);
    try {
      const items = lineas.map(l => {
        const subtotal = l.cantidad * l.precio_unitario;
        let descuento = 0;
        if (l.descuento_tipo && l.descuento_valor) {
          descuento = l.descuento_tipo === '%'
            ? subtotal * (parseFloat(l.descuento_valor) / 100)
            : parseFloat(l.descuento_valor);
        }
        return { producto_id: l.producto_id, categoria_id: l.categoria_id || undefined, cantidad: l.cantidad, precio_unitario: l.precio_unitario, subtotal: subtotal - descuento };
      });
      const resultado = await calcularPromociones({ items });
      const promos = resultado.promociones_aplicadas || [];
      setPromocionesAplicadas(promos);
      setTotalDescuentoPromo(resultado.total_descuento || 0);
      setProductosRegalo(promos.filter(p => p.producto_regalo != null).map(p => p.producto_regalo));
    } catch {
      setPromocionesAplicadas([]);
      setTotalDescuentoPromo(0);
      setProductosRegalo([]);
    } finally { setCalculandoPromos(false); }
  };

  const productosFiltrados = busqueda
    ? productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.codigo?.toLowerCase().includes(busqueda.toLowerCase()))
    : [];

  const agregarProducto = (producto) => {
    const yaExiste = lineas.find(l => l.producto_id === producto.id);
    if (yaExiste) {
      setCantidad(yaExiste.id, yaExiste.cantidad + 1);
    } else {
      setLineas(prev => [...prev, { id: Date.now(), producto_id: producto.id, categoria_id: producto.categoria_id || null, nombre: producto.nombre, cantidad: 1, precio_unitario: parseFloat(producto.precio_venta || 0), descuento_tipo: '', descuento_valor: '', stock_disponible: producto.stock_actual }]);
    }
    setBusqueda('');
    setMostrarResultados(false);
  };

  const setCantidad = (id, nuevaCantidad) => setLineas(prev => prev.map(l => {
    if (l.id !== id) return l;
    return { ...l, cantidad: Math.max(1, Math.min(nuevaCantidad, l.stock_disponible)) };
  }));

  const setDescuentoLinea = (id, tipo, valor) => setLineas(prev => prev.map(l => l.id === id ? { ...l, descuento_tipo: tipo, descuento_valor: valor } : l));
  const eliminarLinea = (id) => setLineas(prev => prev.filter(l => l.id !== id));

  const calcularLinea = (linea) => {
    const subtotal = linea.cantidad * linea.precio_unitario;
    let descuento = 0;
    if (linea.descuento_tipo && linea.descuento_valor) {
      descuento = linea.descuento_tipo === '%'
        ? subtotal * (parseFloat(linea.descuento_valor) / 100)
        : parseFloat(linea.descuento_valor);
    }
    const totalLinea = subtotal - descuento;
    const igv = conIgv ? totalLinea - totalLinea / 1.18 : 0;
    const base = conIgv ? totalLinea / 1.18 : totalLinea;
    return { subtotal, descuento, totalLinea, igv, base };
  };

  const calcularTotales = () => {
    let subtotalBruto = 0, descuentosLineas = 0;
    lineas.forEach(linea => { const c = calcularLinea(linea); subtotalBruto += c.subtotal; descuentosLineas += c.descuento; });
    const subtotalDespuesDescuentosLineas = subtotalBruto - descuentosLineas;
    let descuentoGlobalMonto = 0;
    if (descuentoGlobal.tipo && descuentoGlobal.valor) {
      descuentoGlobalMonto = descuentoGlobal.tipo === '%'
        ? subtotalDespuesDescuentosLineas * (parseFloat(descuentoGlobal.valor) / 100)
        : parseFloat(descuentoGlobal.valor);
    }
    const totalConDesc = subtotalDespuesDescuentosLineas - descuentoGlobalMonto - totalDescuentoPromo;
    const igv = conIgv ? totalConDesc - totalConDesc / 1.18 : 0;
    const base = conIgv ? totalConDesc / 1.18 : totalConDesc;
    return { subtotalBruto, descuentosLineas, descuentoGlobalMonto, base, igv, total: Math.max(0, totalConDesc) };
  };

  const handleCrearExterno = async (e) => {
    e.preventDefault();
    try {
      const nuevoExterno = await crearCompradorExterno({ ...formExterno, user_crea_id: user?.id });
      setCompradoresExternos(prev => [...prev, nuevoExterno]);
      setCompradorExternoId(nuevoExterno.id);
      setMostrarModalExterno(false);
      setFormExterno({ dni: '', nombre: '', telefono: '', email: '' });
    } catch (err) { alert(err?.response?.data?.message || 'Error al crear comprador externo'); }
  };

  const construirPayload = () => {
    const detallesNormales = lineas.map(l => {
      const det = { producto_id: l.producto_id, cantidad: l.cantidad, precio_unitario: l.precio_unitario };
      if (l.descuento_tipo && l.descuento_valor) {
        det.descuento_tipo_id = l.descuento_tipo === '%' ? TIPOS_DESCUENTO.PORCENTAJE : TIPOS_DESCUENTO.MONTO_FIJO;
        det.descuento_valor = parseFloat(l.descuento_valor);
      }
      return det;
    });

    const detallesRegalo = productosRegalo.map(regalo => ({
      producto_id: regalo.producto_id,
      cantidad: 1,
      precio_unitario: regalo.precio_unitario,
      descuento_tipo_id: TIPOS_DESCUENTO.MONTO_FIJO,
      descuento_valor: regalo.precio_unitario,
    }));

    const payload = {
   
      tipo_comprador_id: tipoPagador,
      tipo_comprobante_id: tipoComprobante,
      fecha_venta: new Date().toISOString().slice(0, 10),
      detalles: [...detallesNormales, ...detallesRegalo],
      pagos: pagos.filter(p => p.modalidad_pago_id).map(p => ({
        modalidad_pago_id: parseInt(p.modalidad_pago_id),
        monto: parseFloat(p.monto) || 0,
        referencia: p.referencia || null,
      })),
    };

    // user_crea_id solo para crear, user_actua_id solo para actualizar
    if (esModoEdicion) {
      payload.user_actua_id = user?.id;
    } else {
      payload.user_crea_id = user?.id;
    }

    if (totalDescuentoPromo > 0) payload.descuento_promocion = parseFloat(totalDescuentoPromo.toFixed(2));

    // Manejar comprador según tipo de pagador
    if (tipoPagador === TIPOS_PAGADOR.PACIENTE) {
      payload.paciente_id = parseInt(pacienteId);
      if (esModoEdicion) {
        payload.responsable_id = null;
        payload.comprador_externo_id = null;
      }
    } else if (tipoPagador === TIPOS_PAGADOR.RESPONSABLE) {
      payload.responsable_id = parseInt(responsableId);
      if (pacienteId) payload.paciente_id = parseInt(pacienteId);
      if (esModoEdicion) {
        payload.comprador_externo_id = null;
      }
    } else if (tipoPagador === TIPOS_PAGADOR.EXTERNO) {
      payload.comprador_externo_id = parseInt(compradorExternoId);
      if (esModoEdicion) {
        payload.paciente_id = null;
        payload.responsable_id = null;
      }
    }

    if (descuentoGlobal.tipo && descuentoGlobal.valor) {
      payload.descuento_tipo_id = descuentoGlobal.tipo === '%' ? TIPOS_DESCUENTO.PORCENTAJE : TIPOS_DESCUENTO.MONTO_FIJO;
      payload.descuento_valor = parseFloat(descuentoGlobal.valor);
    } else if (esModoEdicion) {
      // Si se eliminó el descuento global en edición, enviarlo como null
      payload.descuento_tipo_id = null;
      payload.descuento_valor = null;
    }

    if (nota) payload.nota = nota;
    if (observaciones) payload.observaciones = observaciones;

    return payload;
  };

  const handleSubmit = async () => {
    setError('');
    
    if (lineas.length === 0) return setError('Agrega al menos un producto');
    if (tipoPagador === TIPOS_PAGADOR.PACIENTE && !pacienteId) return setError('Selecciona un paciente');
    if (tipoPagador === TIPOS_PAGADOR.RESPONSABLE && !responsableId) return setError('Selecciona un responsable');
    if (tipoPagador === TIPOS_PAGADOR.EXTERNO && !compradorExternoId) return setError('Selecciona o crea un comprador externo');
    const pagosValidos = pagos.filter(p => p.modalidad_pago_id && parseFloat(p.monto) > 0);
    if (pagosValidos.length === 0) {
      setTituloAlerta('Método de Pago Requerido');
      setMensajeAlerta('Agrega al menos un método de pago con monto para continuar.');
      setAlertaAbierta(true);
      return;
    }
    const totalPagado = pagosValidos.reduce((s, p) => s + parseFloat(p.monto), 0);
    const totalVenta = totales.total;
    if (Math.abs(totalPagado - totalVenta) > 0.05) {
      setTituloAlerta('Monto Incorrecto');
      setMensajeAlerta(`El total pagado (S/ ${totalPagado.toFixed(2)}) no coincide con el total de la venta (S/ ${totalVenta.toFixed(2)}).`);
      setAlertaAbierta(true);
      return;
    }

    const payload = construirPayload();

    // Si está en modo edición, llamar al callback onGuardarEdicion
    if (esModoEdicion && onGuardarEdicion) {
      setLoading(true);
      try {
        await onGuardarEdicion(payload);
        // El cierre del modal lo maneja el padre
      } catch (err) {
        const msg = err?.response?.data?.message;
        setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al actualizar la venta');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Modo normal: crear nueva venta
    setLoading(true);
    try {
      const ventaCreada = await crearVentaProducto(payload);

      if (ventaCreada?.id && promocionesAplicadas.length > 0) {
        await Promise.allSettled(
          promocionesAplicadas.map(p =>
            import('../../services/promocionesService').then(({ registrarPromocionAplicada }) =>
              registrarPromocionAplicada({ promocion_id: p.promocion.id, tipo_venta_id: TIPO_VENTA_PRODUCTO, venta_id: ventaCreada.id, monto_ahorrado: p.descuento })
            )
          )
        );
      }

      setVentaGuardada(ventaCreada);
      setMostrarModalExito(true);
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al registrar la venta');
    } finally { setLoading(false); }
  };

  const resetForm = () => {
    setLineas([]);
    setPacienteId('');
    setResponsableId('');
    setCompradorExternoId('');
    setPacientesDelResponsable([]);
    setDescuentoGlobal({ tipo: '%', valor: '' });
    setNota('');
    setObservaciones('');
    setPromocionesAplicadas([]);
    setTotalDescuentoPromo(0);
    setProductosRegalo([]);
    setPagos([{ uid: Date.now(), modalidad_pago_id: '', monto: '', referencia: '' }]);
    setTipoPagador(TIPOS_PAGADOR.PACIENTE);
    setTipoComprobante(1);
  };

  const handleNuevaVenta = () => { resetForm(); setVentaGuardada(null); };
  
  const handleCancelar = () => {
    if (esModoEdicion && onCancelarEdicion) {
      onCancelarEdicion();
    } else {
      resetForm();
    }
  };

  const totales = calcularTotales();

  return (
    <div className={esModoEdicion ? '' : 'min-h-screen bg-gray-50'}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Encabezado - Solo mostrar cuando NO está en modo edición */}
        {!esModoEdicion && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1.5">
              <ShoppingCartIcon className="w-8 h-8 text-[#7B1FA2]" />
              <h1 className="text-3xl font-bold text-gray-900">
                Venta de Productos
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              Registra ventas de productos del inventario
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {error && <div className="mx-6 mt-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

          {/* Tipo de Comprobante */}
          <div className="p-6 border-b border-gray-100">
            <label className="block text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <DocumentTextIcon className="w-4 h-4" />Tipo de Comprobante
            </label>
            <div className="flex flex-wrap gap-3">
              {tiposComprobante.map(tc => (
                <button key={tc.id} type="button" onClick={() => setTipoComprobante(tc.id)}
                  disabled={bloqueado}
                  className={`px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${tipoComprobante === tc.id ? 'border-[#7B1FA2] bg-purple-50 text-[#7B1FA2]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {tc.nombre}
                </button>
              ))}
            </div>
            {conIgv && <p className="mt-2 text-xs text-amber-600 font-medium">⚠ Los precios ya incluyen IGV (18%). Se mostrará desglosado en el resumen.</p>}
          </div>

          {/* Pagador */}
          <div className="p-6 border-b border-gray-100">
            <label className="block text-xs font-semibold text-gray-600 mb-3">¿Quién paga?</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {[
                { id: TIPOS_PAGADOR.PACIENTE, nombre: 'Paciente', icon: UserIcon },
                { id: TIPOS_PAGADOR.RESPONSABLE, nombre: 'Responsable', icon: UserGroupIcon },
                { id: TIPOS_PAGADOR.EXTERNO, nombre: 'Comprador Externo', icon: UserPlusIcon },
              ].map(tipo => {
                const Icon = tipo.icon;
                const activo = tipoPagador === tipo.id;
                return (
                  <button key={tipo.id} type="button" onClick={() => setTipoPagador(tipo.id)}
                    disabled={bloqueado}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${activo ? 'border-[#7B1FA2] bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activo ? 'bg-[#7B1FA2] text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`font-semibold text-sm ${activo ? 'text-[#7B1FA2]' : 'text-gray-700'}`}>{tipo.nombre}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative" ref={searchRef}>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Buscar Producto</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={busqueda}
                    onChange={(e) => { setBusqueda(e.target.value); setMostrarResultados(true); }}
                    onFocus={() => setMostrarResultados(true)}
                    disabled={bloqueado}
                    placeholder="Buscar por nombre o código..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                {mostrarResultados && busqueda && productosFiltrados.length > 0 && !bloqueado && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                    {productosFiltrados.slice(0, 10).map(producto => (
                      <button key={producto.id} onClick={() => agregarProducto(producto)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0">
                        <div className="font-semibold text-gray-900">{producto.nombre}</div>
                        <div className="text-xs text-gray-500">Stock: {producto.stock_actual} | S/ {parseFloat(producto.precio_venta || 0).toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>


              {tipoPagador === TIPOS_PAGADOR.PACIENTE && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Paciente (Pagador) *</label>
                  <SearchableCombobox items={pacientes} value={pacienteId} onChange={setPacienteId}
                    placeholder="Buscar por DNI o nombre..."
                    getItemLabel={(p) => `${p.nombres || ''} ${p.apellido_paterno || ''} ${p.apellido_materno || ''} - DNI: ${p.numero_documento || 'S/N'}`.trim()}
                    getItemValue={(p) => p.id}
                    getItemSearchText={(p) => `${p.numero_documento || ''} ${p.nombres || ''} ${p.apellido_paterno || ''} ${p.apellido_materno || ''}`.toLowerCase()}
                    disabled={bloqueado}
                  />
                </div>
              )}
              {tipoPagador === TIPOS_PAGADOR.RESPONSABLE && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Responsable (Pagador) *</label>
                  <SearchableCombobox items={responsables} value={responsableId}
                    onChange={(value) => { setResponsableId(value); setPacienteId(''); setPacientesDelResponsable([]); }}
                    placeholder="Buscar responsable..."
                    getItemLabel={(r) => `${r.nombres || ''} ${r.apellido_paterno || ''} ${r.apellido_materno || ''} - DNI: ${r.numero_documento || 'S/N'}`.trim()}
                    getItemValue={(r) => r.id}
                    getItemSearchText={(r) => `${r.numero_documento || ''} ${r.nombres || ''} ${r.apellido_paterno || ''} ${r.apellido_materno || ''}`.toLowerCase()}
                    disabled={bloqueado}
                  />
                  {responsableId && pacientesDelResponsable.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">ℹ️ {pacientesDelResponsable.length} paciente(s) a cargo{pacientesDelResponsable.length === 1 ? ' (autoseleccionado)' : ''}</p>
                  )}
                </div>
              )}
              {tipoPagador === TIPOS_PAGADOR.EXTERNO && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Comprador Externo (Pagador) *</label>
                  <div className="flex gap-2">
                    <SearchableCombobox items={compradoresExternos} value={compradorExternoId} onChange={setCompradorExternoId}
                      placeholder="Buscar por DNI o nombre..."
                      getItemLabel={(c) => `${c.nombre} - DNI: ${c.dni}`}
                      getItemValue={(c) => c.id}
                      getItemSearchText={(c) => `${c.dni} ${c.nombre}`}
                      className="flex-1"
                      disabled={bloqueado}
                    />
                    {!bloqueado && (
                      <button type="button" onClick={() => setMostrarModalExterno(true)}
                        className="px-4 py-3 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] whitespace-nowrap">
                        + Nuevo
                      </button>
                    )}
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
                          <button onClick={() => setCantidad(linea.id, linea.cantidad - 1)} disabled={bloqueado}
                            className="p-1 hover:bg-gray-200 rounded disabled:opacity-40 disabled:cursor-not-allowed">
                            <MinusIcon className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="w-12 text-center font-semibold">{linea.cantidad}</span>
                          <button onClick={() => setCantidad(linea.id, linea.cantidad + 1)} disabled={bloqueado}
                            className="p-1 hover:bg-gray-200 rounded disabled:opacity-40 disabled:cursor-not-allowed">
                            <PlusIcon className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">S/ {linea.precio_unitario.toFixed(2)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <select value={linea.descuento_tipo}
                            onChange={(e) => setDescuentoLinea(linea.id, e.target.value, linea.descuento_valor)}
                            disabled={bloqueado}
                            className="px-2 py-1 text-xs border border-gray-200 rounded disabled:bg-gray-100 disabled:cursor-not-allowed">
                            <option value="">-</option>
                            <option value="%">%</option>
                            <option value="S/">S/</option>
                          </select>
                          <input type="number" step="0.01" min="0" value={linea.descuento_valor}
                            onChange={(e) => setDescuentoLinea(linea.id, linea.descuento_tipo, e.target.value)}
                            disabled={bloqueado}
                            className="w-16 px-2 py-1 text-xs text-right border border-gray-200 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="0" />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">S/ {calc.base.toFixed(2)}</td>
                      <td className="px-4 py-4 text-right text-gray-600">{conIgv ? `S/ ${calc.igv.toFixed(2)}` : <span className="text-gray-300">—</span>}</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">S/ {calc.totalLinea.toFixed(2)}</td>
                      <td className="px-4 py-4">
                        <button onClick={() => eliminarLinea(linea.id)} disabled={bloqueado}
                          className="p-1 hover:bg-red-50 rounded text-red-600 disabled:opacity-40 disabled:cursor-not-allowed">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {productosRegalo.map((regalo, i) => (
                  <tr key={`regalo-${i}`} className="bg-green-50 border-l-4 border-green-400">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <GiftIcon className="w-4 h-4 text-green-600 shrink-0" />
                        <div>
                          <div className="font-semibold text-green-800">{regalo.nombre}</div>
                          <div className="text-xs text-green-600">🎁 Producto de regalo por promoción</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-green-800 font-semibold">1</td>
                    <td className="px-4 py-3 text-right text-green-700">
                      <span className="line-through text-gray-400 text-xs mr-1">S/ {regalo.precio_unitario.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-green-700">-100%</td>
                    <td className="px-4 py-3 text-right text-green-700">S/ 0.00</td>
                    <td className="px-4 py-3 text-right text-gray-300">—</td>
                    <td className="px-6 py-3 text-right font-bold text-green-700">S/ 0.00</td>
                    <td className="px-4 py-3 text-xs text-green-500">auto</td>
                  </tr>
                ))}
                {lineas.length === 0 && (
                  <tr><td colSpan="8" className="px-6 py-12 text-center text-gray-400">Busca y agrega productos para comenzar</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Resumen y totales */}
          <div className="p-6 border-t border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Nota interna (solo visible en sistema)</label>
                <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={3}
                  disabled={bloqueado}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Notas internas..." />

                <label className="block text-xs font-semibold text-gray-600 mb-2 mt-4">Observaciones (visible en comprobante)</label>
                <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={3}
                  disabled={bloqueado}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Observaciones para el comprobante..." />
              </div>
              <div className="space-y-3">
                <PanelPromociones promocionesAplicadas={promocionesAplicadas} totalDescuento={totalDescuentoPromo} calculando={calculandoPromos} />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Descuento Global</span>
                  <div className="flex items-center gap-2">
                    <select value={descuentoGlobal.tipo} onChange={(e) => setDescuentoGlobal({ ...descuentoGlobal, tipo: e.target.value })}
                      disabled={bloqueado}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed">
                      <option value="%">%</option>
                      <option value="S/">S/</option>
                    </select>
                    <input type="number" step="0.01" min="0" value={descuentoGlobal.valor}
                      onChange={(e) => setDescuentoGlobal({ ...descuentoGlobal, valor: e.target.value })}
                      disabled={bloqueado}
                      className="w-24 px-3 py-2 text-sm text-right border border-gray-200 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed" placeholder="0" />
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
                  {totalDescuentoPromo > 0 && (
                    <div className="flex items-center justify-between text-sm text-green-700">
                      <span className="flex items-center gap-1"><SparklesIcon className="w-3.5 h-3.5" />Descuento promociones</span>
                      <span className="font-semibold">-S/ {totalDescuentoPromo.toFixed(2)}</span>
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

          {/* Métodos de Pago */}
          <div className="p-6 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-600 mb-3">
              Métodos de Pago <span className="text-red-500">*</span>
              <span className="ml-2 text-gray-400 font-normal">— puedes dividir entre varios métodos</span>
            </p>
            <div className="space-y-2 max-w-2xl">
              {pagos.map((pago) => (
                <div key={pago.uid} className="flex items-center gap-2">
                  <select
                    value={pago.modalidad_pago_id}
                    onChange={e => setPagos(prev => prev.map(p => p.uid === pago.uid ? { ...p, modalidad_pago_id: e.target.value } : p))}
                    disabled={bloqueado}
                    className="flex-1 min-w-0 px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] disabled:bg-gray-100">
                    <option value="">Seleccionar método...</option>
                    {modalidadesPago.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                  <div className="relative w-32 shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-semibold pointer-events-none">S/</span>
                    <input
                      type="number" step="0.01" min="0"
                      value={pago.monto}
                      onFocus={() => {
                        if (!pago.monto) {
                          const restante = totales.total - pagos.filter(p => p.uid !== pago.uid).reduce((s, p) => s + (parseFloat(p.monto) || 0), 0);
                          if (restante > 0) setPagos(prev => prev.map(p => p.uid === pago.uid ? { ...p, monto: restante.toFixed(2) } : p));
                        }
                      }}
                      onChange={e => setPagos(prev => prev.map(p => p.uid === pago.uid ? { ...p, monto: e.target.value } : p))}
                      disabled={bloqueado}
                      placeholder="0.00"
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] disabled:bg-gray-100" />
                  </div>
                  <input
                    type="text"
                    value={pago.referencia}
                    onChange={e => setPagos(prev => prev.map(p => p.uid === pago.uid ? { ...p, referencia: e.target.value } : p))}
                    disabled={bloqueado}
                    placeholder="Nro. operación, código..."
                    className="w-44 shrink-0 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] disabled:bg-gray-100" />
                  {!bloqueado && pagos.length > 1 && (
                    <button type="button" onClick={() => setPagos(prev => prev.filter(p => p.uid !== pago.uid))}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <div className="flex items-center justify-between pt-1">
                {!bloqueado && (
                  <button type="button"
                    onClick={() => setPagos(prev => [...prev, { uid: Date.now(), modalidad_pago_id: '', monto: '', referencia: '' }])}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#7B1FA2] hover:text-[#6A1B9A]">
                    <PlusIcon className="w-3.5 h-3.5" />Agregar otro método
                  </button>
                )}
                {(() => {
                  const totalPagado = pagos.reduce((s, p) => s + (parseFloat(p.monto) || 0), 0);
                  const pendiente = totales.total - totalPagado;
                  if (Math.abs(pendiente) < 0.01) return <p className="text-xs text-green-600 font-semibold ml-auto">✓ Pago completo (S/ {totales.total.toFixed(2)})</p>;
                  if (pendiente > 0) return <p className="text-xs text-amber-600 font-semibold ml-auto">Falta asignar: S/ {pendiente.toFixed(2)}</p>;
                  return <p className="text-xs text-red-500 font-semibold ml-auto">Excede por: S/ {Math.abs(pendiente).toFixed(2)}</p>;
                })()}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            {esModoEdicion ? (
              // Botones para modo edición
              <>
                <button onClick={handleCancelar}
                  className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
                  Cancelar
                </button>
                <button onClick={handleSubmit} disabled={loading || lineas.length === 0}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </>
            ) : ventaGuardada ? (
              // Botones después de guardar una venta nueva
              <>
                <button onClick={handleNuevaVenta}
                  className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2">
                  <PlusIcon className="w-4 h-4" />
                  Nueva Venta
                </button>
                <button onClick={() => setMostrarModalImpresion(true)}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" />
                  Imprimir Comprobante
                </button>
              </>
            ) : (
              // Botones para nueva venta
              <>
                <button onClick={resetForm}
                  className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
                  Cancelar
                </button>
                <button onClick={handleSubmit} disabled={loading || lineas.length === 0}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'Guardando...' : 'Guardar Venta'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal Crear Comprador Externo */}
      {mostrarModalExterno && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Nuevo Comprador Externo</h3>
              <button onClick={() => { setMostrarModalExterno(false); setFormExterno({ dni: '', nombre: '', telefono: '', email: '' }); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCrearExterno} className="p-6 space-y-4">
              {[
                { key: 'dni', label: 'DNI *', required: true, placeholder: 'Ej: 12345678', type: 'text', maxLength: 8 },
                { key: 'nombre', label: 'Nombre Completo *', required: true, placeholder: 'Ej: Juan Pérez García', type: 'text' },
                { key: 'telefono', label: 'Teléfono', required: false, placeholder: 'Ej: 987654321', type: 'text', maxLength: 9 },
                { key: 'email', label: 'Email', required: false, placeholder: 'Ej: ejemplo@correo.com', type: 'email' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">{f.label}</label>
                  <input type={f.type} required={f.required} maxLength={f.maxLength} value={formExterno[f.key]}
                    onChange={(e) => setFormExterno({ ...formExterno, [f.key]: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]"
                    placeholder={f.placeholder} />
                </div>
              ))}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setMostrarModalExterno(false); setFormExterno({ dni: '', nombre: '', telefono: '', email: '' }); }}
                  className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A]">Crear</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de éxito */}
      <ModalExito
        isOpen={mostrarModalExito}
        onClose={() => setMostrarModalExito(false)}
        mensaje="¡Venta Registrada!"
      />


      {/* Modal de Alerta de Pago */}
      {alertaAbierta && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200 px-5 py-4 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{tituloAlerta}</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 leading-relaxed">{mensajeAlerta}</p>
            </div>
            <div className="border-t border-gray-200 px-5 py-4 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setAlertaAbierta(false)}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold text-sm transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vista previa para impresión */}
      {mostrarModalImpresion && ventaGuardada && (
        <PrintPreviewModal
          venta={ventaGuardada}
          tipo="producto"
          onClose={() => setMostrarModalImpresion(false)}
        />
      )}
    </div>
  );
};

export default VenderProductosTab;