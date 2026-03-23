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
  ClipboardDocumentListIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  crearVentaServicio,
  TIPOS_DESCUENTO,
  TIPOS_VENTA_SERVICIO,
  TIPOS_PAGADOR,
  getCompradoresExternos,
  crearCompradorExterno,
  getTiposComprobante,
} from '../../services/ventasService';
import { calcularPromociones, registrarPromocionAplicada } from '../../services/promocionesService';
import { getTarifasServicios, getPaquetes } from '../../services/serviciosService';
import {
  getPacientesAll,
  getTodosLosResponsables,
  getPacientesPorResponsable,
} from '../../services/pacienteService';

// Tipo de venta para servicios (según tipo_venta_promo)
const TIPO_VENTA_SERVICIO_ID = 2;

// ─── Autocomplete ────────────────────────────────────────────────────────────
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
    const handle = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        if (!value) setInputValue('');
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
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

// ─── Panel de Promociones ────────────────────────────────────────────────────
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
        <div key={i} className="flex items-center justify-between text-xs text-green-700">
          <span>✓ {p.mensaje || p.promocion?.nombre}</span>
          <span className="font-semibold">-S/ {p.descuento.toFixed(2)}</span>
        </div>
      ))}
      <div className="flex items-center justify-between text-sm font-bold text-green-800 border-t border-green-300 pt-2">
        <span>Ahorro total por promociones</span>
        <span>-S/ {totalDescuento.toFixed(2)}</span>
      </div>
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const VenderServiciosTab = () => {
  const [tarifas, setTarifas] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [responsables, setResponsables] = useState([]);
  const [compradoresExternos, setCompradoresExternos] = useState([]);
  const [tiposComprobante, setTiposComprobante] = useState([]);

  const [lineas, setLineas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [descuentoGlobal, setDescuentoGlobal] = useState({ tipo: '%', valor: '' });
  const [nota, setNota] = useState('');

  const [tipoPagador, setTipoPagador] = useState(TIPOS_PAGADOR.PACIENTE);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState('');
  const [responsableSeleccionado, setResponsableSeleccionado] = useState('');
  const [compradorExternoSeleccionado, setCompradorExternoSeleccionado] = useState('');
  const [tipoComprobante, setTipoComprobante] = useState(1);

  const [mostrarModalTipoVenta, setMostrarModalTipoVenta] = useState(false);
  const [tarifaSeleccionada, setTarifaSeleccionada] = useState(null);
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState('');

  // 🆕 Promociones
  const [promocionesAplicadas, setPromocionesAplicadas] = useState([]);
  const [totalDescuentoPromo, setTotalDescuentoPromo] = useState(0);
  const [calculandoPromos, setCalculandoPromos] = useState(false);
  const timerPromo = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [mostrarModalExterno, setMostrarModalExterno] = useState(false);
  const [formExterno, setFormExterno] = useState({ dni: '', nombre: '', telefono: '', email: '' });
  const [pacientesDelResponsable, setPacientesDelResponsable] = useState([]);

  const searchRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const conIgv = tipoComprobante === 2 || tipoComprobante === 3;

  useEffect(() => { cargarDatos(); }, []);

  useEffect(() => {
    if (tipoPagador === TIPOS_PAGADOR.RESPONSABLE && responsableSeleccionado) {
      cargarPacientesDelResponsable();
    }
  }, [responsableSeleccionado]);

  // 🆕 Recalcular promociones con debounce cuando cambian las líneas
  useEffect(() => {
    if (lineas.length === 0) {
      setPromocionesAplicadas([]);
      setTotalDescuentoPromo(0);
      return;
    }
    clearTimeout(timerPromo.current);
    timerPromo.current = setTimeout(() => recalcularPromociones(), 600);
    return () => clearTimeout(timerPromo.current);
  }, [lineas]);

  const cargarDatos = async () => {
    try {
      const [tarifasData, pacData, respData, compData, tiposComp] = await Promise.all([
        getTarifasServicios(),
        getPacientesAll(),
        getTodosLosResponsables(),
        getCompradoresExternos(),
        getTiposComprobante(),
      ]);
      setTarifas(Array.isArray(tarifasData) ? tarifasData.filter(t => t.flg_activo || t.activo) : []);
      setPacientes(Array.isArray(pacData) ? pacData : []);
      setResponsables(respData?.data && Array.isArray(respData.data) ? respData.data : []);
      setCompradoresExternos(Array.isArray(compData) ? compData : []);
      setTiposComprobante(Array.isArray(tiposComp) ? tiposComp : []);
      try {
        const paquetesData = await getPaquetes();
        setPaquetes(Array.isArray(paquetesData) ? paquetesData.filter(p => p.flgActivo) : []);
      } catch { setPaquetes([]); }
    } catch (err) { console.error('Error cargando datos:', err); }
  };

  const cargarPacientesDelResponsable = async () => {
    try {
      const resp = await getPacientesPorResponsable(responsableSeleccionado);
      const pacientesResp = resp?.data && Array.isArray(resp.data) ? resp.data : [];
      setPacientesDelResponsable(pacientesResp);
      if (pacientesResp.length === 1) {
        setLineas(prev => prev.map(l => !l.paciente_linea_id ? { ...l, paciente_linea_id: pacientesResp[0].id } : l));
      }
    } catch { setPacientesDelResponsable([]); }
  };

  // 🆕 Llamar al backend para calcular promociones
  const recalcularPromociones = async () => {
    if (lineas.length === 0) return;
    setCalculandoPromos(true);
    try {
      const items = lineas.map(l => {
        const sesionesTotales = l.sesiones || 1;
        const subtotalBruto = sesionesTotales * l.precio_unitario;
        let descuento = 0;
        if (l.descuento_tipo && l.descuento_valor) {
          descuento = l.descuento_tipo === '%'
            ? subtotalBruto * (parseFloat(l.descuento_valor) / 100)
            : parseFloat(l.descuento_valor);
        }
        return {
          servicio_id: l.servicio_id,
          paquete_id: l.paquete_id || undefined,
          motivo_cita_id: l.motivo_cita_id || undefined,
          cantidad: sesionesTotales,
          precio_unitario: l.precio_unitario,
          subtotal: subtotalBruto - descuento,
        };
      });

      const resultado = await calcularPromociones({ items });
      setPromocionesAplicadas(resultado.promociones_aplicadas || []);
      setTotalDescuentoPromo(resultado.total_descuento || 0);
    } catch (err) {
      console.warn('No se pudieron calcular promociones:', err);
      setPromocionesAplicadas([]);
      setTotalDescuentoPromo(0);
    } finally {
      setCalculandoPromos(false);
    }
  };

  const itemsFiltrados = busqueda
    ? tarifas.filter(t => {
        const q = busqueda.toLowerCase();
        return (t.servicio?.nombre || '').toLowerCase().includes(q) || (t.motivo_cita?.nombre || '').toLowerCase().includes(q);
      })
    : [];

  const seleccionarTarifa = (tarifa) => {
    setTarifaSeleccionada(tarifa);
    setPaqueteSeleccionado('');
    setMostrarModalTipoVenta(true);
    setMostrarResultados(false);
  };

  const agregarItemConTipo = (tipoVentaId) => {
    if (!tarifaSeleccionada) return;
    if (tipoVentaId === TIPOS_VENTA_SERVICIO.PAQUETE && !paqueteSeleccionado) { alert('Debes seleccionar un paquete'); return; }

    let paqueteId = null, paqueteNombre = '', sesionesPorPaquete = null, sesiones = null;
    if (tipoVentaId === TIPOS_VENTA_SERVICIO.PAQUETE) {
      const paq = paquetes.find(p => p.id === parseInt(paqueteSeleccionado));
      if (paq) {
        sesionesPorPaquete = paq.cantidadSesiones;
        sesiones = paq.cantidadSesiones; // Iniciar con el mínimo del paquete
        paqueteId = paq.id;
        paqueteNombre = paq.nombre;
      }
    } else {
      sesiones = 1;
    }

    let pacienteLineaId = pacienteSeleccionado;
    if (tipoPagador === TIPOS_PAGADOR.RESPONSABLE && pacientesDelResponsable.length === 1) {
      pacienteLineaId = pacientesDelResponsable[0].id;
    }

    // 🆕 Calcular precio unitario según configuración de paquetes
    let precioUnitario = parseFloat(tarifaSeleccionada.precio || 0);
    let precioBase = precioUnitario;

    if (tipoVentaId === TIPOS_VENTA_SERVICIO.PAQUETE && paqueteId) {
      const preciosPaquetes = tarifaSeleccionada.precios_paquetes || [];
      const configuracion = preciosPaquetes.find(pp => pp.paquete_id === paqueteId && pp.flg_activo === 1);

      if (configuracion) {
        if (configuracion.tipo_calculo === 'precio_total') {
          // Precio fijo total dividido por sesiones
          precioUnitario = parseFloat(configuracion.valor) / sesionesPorPaquete;
        } else if (configuracion.tipo_calculo === 'descuento_porcentaje') {
          // Aplicar descuento porcentual al precio base
          const descuentoPorcentaje = parseFloat(configuracion.valor);
          precioUnitario = precioBase * (1 - descuentoPorcentaje / 100);
        }
      }
    }

    setLineas(prev => [...prev, {
      id: Date.now(),
      tipo_venta_servicio_id: tipoVentaId,
      servicio_tarifa_id: tarifaSeleccionada.id,
      servicio_id: tarifaSeleccionada.servicio_id,
      motivo_cita_id: tarifaSeleccionada.motivo_cita_id || null,
      paquete_id: paqueteId,
      servicio_nombre: tarifaSeleccionada.servicio?.nombre || `Servicio #${tarifaSeleccionada.servicio_id}`,
      motivo_nombre: tarifaSeleccionada.motivo_cita?.nombre || `Motivo #${tarifaSeleccionada.motivo_cita_id}`,
      paquete_nombre: paqueteNombre,
      sesiones_por_paquete: sesionesPorPaquete, // Guarda el mínimo del paquete
      sesiones, // Sesiones actuales (puede ser >= sesiones_por_paquete)
      precio_unitario: precioUnitario,
      precio_base: precioBase,
      descuento_tipo: '',
      descuento_valor: '',
      paciente_linea_id: pacienteLineaId,
    }]);

    setBusqueda('');
    setMostrarModalTipoVenta(false);
    setTarifaSeleccionada(null);
    setPaqueteSeleccionado('');
  };

  const setSesiones = (id, val) => setLineas(prev => prev.map(l => {
    if (l.id !== id) return l;
    // Para paquetes: mínimo = sesiones_por_paquete (ej: si es paquete de 4, mínimo 4)
    // Para sesiones individuales: mínimo 1
    const minimo = l.tipo_venta_servicio_id === TIPOS_VENTA_SERVICIO.PAQUETE
      ? l.sesiones_por_paquete
      : 1;
    return { ...l, sesiones: Math.max(minimo, val) };
  }));
  const setDescuentoLinea = (id, tipo, valor) => setLineas(prev => prev.map(l => l.id === id ? { ...l, descuento_tipo: tipo, descuento_valor: valor } : l));
  const setPacienteLinea = (id, pacId) => setLineas(prev => prev.map(l => l.id === id ? { ...l, paciente_linea_id: pacId } : l));
  const eliminarLinea = (id) => setLineas(prev => prev.filter(l => l.id !== id));

  const calcularLinea = (linea) => {
    // Para paquetes, usar sesiones directamente (no cantidad_paquetes × sesiones_por_paquete)
    const sesionesTotales = linea.tipo_venta_servicio_id === TIPOS_VENTA_SERVICIO.PAQUETE
      ? linea.sesiones
      : linea.sesiones;

    const subtotalBruto = sesionesTotales * linea.precio_unitario;

    // Descuento manual
    let descuento = 0;
    if (linea.descuento_tipo && linea.descuento_valor) {
      descuento = linea.descuento_tipo === '%'
        ? subtotalBruto * (parseFloat(linea.descuento_valor) / 100)
        : parseFloat(linea.descuento_valor);
    }
    const totalLinea = subtotalBruto - descuento;
    const igv = conIgv ? totalLinea - totalLinea / 1.18 : 0;
    const base = conIgv ? totalLinea / 1.18 : totalLinea;
    return { subtotalBruto, descuento, totalLinea, igv, base, sesionesTotales };
  };

  const calcularTotales = () => {
    let subtotalBruto = 0, descuentosLineas = 0;
    lineas.forEach(l => {
      const c = calcularLinea(l);
      subtotalBruto += c.subtotalBruto;
      descuentosLineas += c.descuento;
    });
    const subtotalDespuesDesc = subtotalBruto - descuentosLineas;
    let descuentoGlobalMonto = 0;
    if (descuentoGlobal.tipo && descuentoGlobal.valor) {
      descuentoGlobalMonto = descuentoGlobal.tipo === '%'
        ? subtotalDespuesDesc * (parseFloat(descuentoGlobal.valor) / 100)
        : parseFloat(descuentoGlobal.valor);
    }
    // Restar también el descuento por promociones
    const totalConDesc = subtotalDespuesDesc - descuentoGlobalMonto - totalDescuentoPromo;
    const igvTotal = conIgv ? totalConDesc - totalConDesc / 1.18 : 0;
    const baseTotal = conIgv ? totalConDesc / 1.18 : totalConDesc;
    return { subtotalBruto, descuentosLineas, descuentoGlobalMonto, base: baseTotal, igv: igvTotal, total: Math.max(0, totalConDesc) };
  };

  const resetForm = () => {
    setLineas([]);
    setPacienteSeleccionado('');
    setResponsableSeleccionado('');
    setPacientesDelResponsable([]);
    setCompradorExternoSeleccionado('');
    setDescuentoGlobal({ tipo: '%', valor: '' });
    setNota('');
    setTipoComprobante(1);
    setPromocionesAplicadas([]);
    setTotalDescuentoPromo(0);
  };

  const handleCrearExterno = async (e) => {
    e.preventDefault();
    try {
      const nuevoExterno = await crearCompradorExterno({ ...formExterno, user_crea_id: user?.id });
      setCompradoresExternos(prev => [...prev, nuevoExterno]);
      setCompradorExternoSeleccionado(nuevoExterno.id);
      setMostrarModalExterno(false);
      setFormExterno({ dni: '', nombre: '', telefono: '', email: '' });
    } catch (err) { alert(err?.response?.data?.message || 'Error al crear comprador externo'); }
  };

  const handleSubmit = async () => {
    setError('');
    setExito('');
    if (lineas.length === 0) return setError('Agrega al menos un servicio');
    if (tipoPagador === TIPOS_PAGADOR.PACIENTE && !pacienteSeleccionado) return setError('Selecciona un paciente');
    if (tipoPagador === TIPOS_PAGADOR.RESPONSABLE && !responsableSeleccionado) return setError('Selecciona un responsable');
    if (tipoPagador === TIPOS_PAGADOR.EXTERNO && !compradorExternoSeleccionado) return setError('Selecciona o crea un comprador externo');
    if (lineas.find(l => !l.paciente_linea_id)) return setError('Todas las líneas deben tener un paciente asignado');

    setLoading(true);
    try {
      const hoy = new Date();
      const fecha_venta = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

      const payload = {
        tipo_pagador_id: tipoPagador,
        tipo_comprobante_id: tipoComprobante,
        fecha_venta,
        detalles: lineas.map(l => {
          const sesionesTotales = l.sesiones || 1;
          const det = {
            tipo_venta_id: l.tipo_venta_servicio_id,
            servicio_tarifa_id: parseInt(l.servicio_tarifa_id),
            paciente_id: parseInt(l.paciente_linea_id),
            sesiones_totales: sesionesTotales,
            precio_unitario: parseFloat(l.precio_unitario),
          };
          if (l.tipo_venta_servicio_id === TIPOS_VENTA_SERVICIO.PAQUETE && l.paquete_id) det.paquete_id = parseInt(l.paquete_id);
          if (l.descuento_tipo && l.descuento_valor) {
            det.descuento_tipo_id = l.descuento_tipo === '%' ? TIPOS_DESCUENTO.PORCENTAJE : TIPOS_DESCUENTO.MONTO_FIJO;
            det.descuento_valor = parseFloat(l.descuento_valor);
          }
          return det;
        }),
      };

      if (user?.id) payload.user_crea_id = parseInt(user.id);
      if (tipoPagador === TIPOS_PAGADOR.PACIENTE) payload.paciente_id = parseInt(pacienteSeleccionado);
      if (tipoPagador === TIPOS_PAGADOR.RESPONSABLE) payload.responsable_id = parseInt(responsableSeleccionado);
      if (tipoPagador === TIPOS_PAGADOR.EXTERNO) payload.comprador_externo_id = parseInt(compradorExternoSeleccionado);

      if (descuentoGlobal.tipo && descuentoGlobal.valor) {
        payload.descuento_tipo_id = descuentoGlobal.tipo === '%' ? TIPOS_DESCUENTO.PORCENTAJE : TIPOS_DESCUENTO.MONTO_FIJO;
        payload.descuento_valor = parseFloat(descuentoGlobal.valor);
      }
    if (nota) payload.nota = nota;
    if (totalDescuentoPromo > 0) {
      payload.descuento_promocion = parseFloat(totalDescuentoPromo.toFixed(2));
    }

    const ventaCreada = await crearVentaServicio(payload);

      // 🆕 Registrar promociones aplicadas en el historial
      if (ventaCreada?.id && promocionesAplicadas.length > 0) {
        await Promise.allSettled(
          promocionesAplicadas.map(p =>
            registrarPromocionAplicada({
              promocion_id: p.promocion.id,
              tipo_venta_id: TIPO_VENTA_SERVICIO_ID,
              venta_id: ventaCreada.id,
              monto_ahorrado: p.descuento,
            })
          )
        );
      }

      setExito('¡Venta de servicios registrada exitosamente!');
      resetForm();
      setTimeout(() => setExito(''), 5000);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error al registrar la venta';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  const totales = calcularTotales();

  const OPCIONES_PAGADOR = [
    { id: TIPOS_PAGADOR.PACIENTE, nombre: 'Paciente', icon: UserIcon },
    { id: TIPOS_PAGADOR.RESPONSABLE, nombre: 'Responsable', icon: UserGroupIcon },
    { id: TIPOS_PAGADOR.EXTERNO, nombre: 'Comprador Externo', icon: UserPlusIcon },
  ].filter(tipo => tipo.id !== 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1.5">
            <ClipboardDocumentListIcon className="w-8 h-8 text-[#7B1FA2]" />
            <h1 className="text-3xl font-bold text-gray-900">Venta de Servicios</h1>
          </div>
          <p className="text-sm text-gray-500">Registra ventas de sesiones individuales o paquetes</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {error && <div className="mx-6 mt-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          {exito && <div className="mx-6 mt-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{exito}</div>}

          {/* Comprobante */}
          <div className="p-6 border-b border-gray-100">
            <label className="block text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <DocumentTextIcon className="w-4 h-4" />Tipo de Comprobante
            </label>
            <div className="flex flex-wrap gap-3">
              {tiposComprobante.map(tc => (
                <button key={tc.id} type="button" onClick={() => setTipoComprobante(tc.id)}
                  className={`px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${tipoComprobante === tc.id ? 'border-[#7B1FA2] bg-purple-50 text-[#7B1FA2]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {tc.nombre}
                </button>
              ))}
            </div>
            {conIgv && <p className="mt-2 text-xs text-amber-600 font-medium">⚠ Los precios ya incluyen IGV (18%). Se mostrará desglosado en el resumen.</p>}
          </div>

          {/* Pagador */}
          <div className="p-6 border-b border-gray-100">
            <label className="block text-xs font-semibold text-gray-600 mb-3">¿Quién paga?</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {OPCIONES_PAGADOR.map(tipo => {
                const Icon = tipo.icon;
                const activo = tipoPagador === tipo.id;
                return (
                  <button key={tipo.id} type="button" onClick={() => setTipoPagador(tipo.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${activo ? 'border-[#7B1FA2] bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activo ? 'bg-[#7B1FA2] text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`font-semibold text-sm ${activo ? 'text-[#7B1FA2]' : 'text-gray-700'}`}>{tipo.nombre}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tipoPagador === TIPOS_PAGADOR.PACIENTE && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Paciente (Pagador) *</label>
                  <SearchableCombobox items={pacientes} value={pacienteSeleccionado}
                    onChange={(value) => { setPacienteSeleccionado(value); setLineas(prev => prev.map(l => !l.paciente_linea_id ? { ...l, paciente_linea_id: value } : l)); }}
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
                  <SearchableCombobox items={responsables} value={responsableSeleccionado}
                    onChange={(value) => { setResponsableSeleccionado(value); setPacienteSeleccionado(''); setPacientesDelResponsable([]); }}
                    placeholder="Buscar responsable..."
                    getItemLabel={(r) => `${r.nombres || ''} ${r.apellido_paterno || ''} ${r.apellido_materno || ''} - DNI: ${r.numero_documento || 'S/N'}`.trim()}
                    getItemValue={(r) => r.id}
                    getItemSearchText={(r) => `${r.numero_documento || ''} ${r.nombres || ''} ${r.apellido_paterno || ''} ${r.apellido_materno || ''}`.toLowerCase()}
                  />
                  {responsableSeleccionado && pacientesDelResponsable.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">ℹ️ Selecciona el paciente en cada línea de servicio ({pacientesDelResponsable.length} paciente(s) a cargo)</p>
                  )}
                </div>
              )}
              {tipoPagador === TIPOS_PAGADOR.EXTERNO && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Comprador Externo (Pagador) *</label>
                  <div className="flex gap-2">
                    <SearchableCombobox items={compradoresExternos} value={compradorExternoSeleccionado} onChange={setCompradorExternoSeleccionado}
                      placeholder="Buscar por DNI o nombre..."
                      getItemLabel={(c) => `${c.nombre} - DNI: ${c.dni}`}
                      getItemValue={(c) => c.id}
                      getItemSearchText={(c) => `${c.dni} ${c.nombre}`}
                      className="flex-1"
                    />
                    <button type="button" onClick={() => setMostrarModalExterno(true)}
                      className="px-4 py-3 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] whitespace-nowrap">+ Nuevo</button>
                  </div>
                </div>
              )}

              {/* Búsqueda tarifa */}
              <div className="relative" ref={searchRef}>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Buscar Tarifa</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={busqueda}
                    onChange={(e) => { setBusqueda(e.target.value); setMostrarResultados(true); }}
                    onFocus={() => setMostrarResultados(true)}
                    placeholder="Buscar por servicio o motivo..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]"
                  />
                </div>
                {mostrarResultados && busqueda && itemsFiltrados.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                    {itemsFiltrados.slice(0, 10).map(item => (
                      <button key={item.id} onClick={() => seleccionarTarifa(item)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0">
                        <div className="font-semibold text-gray-900">{item.servicio?.nombre || `Servicio #${item.servicio_id}`}</div>
                        <div className="text-xs text-gray-500">Motivo: {item.motivo_cita?.nombre || `#${item.motivo_cita_id}`} | S/ {parseFloat(item.precio || 0).toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-600 uppercase">Servicio</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase">Paciente</th>
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
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${linea.tipo_venta_servicio_id === TIPOS_VENTA_SERVICIO.PAQUETE ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {linea.tipo_venta_servicio_id === TIPOS_VENTA_SERVICIO.PAQUETE ? 'Paquete' : 'Sesión'}
                          </span>
                        </div>
                        <div className="font-semibold text-gray-900 mt-1">{linea.servicio_nombre}</div>
                        <div className="text-xs text-gray-500">{linea.motivo_nombre}</div>
                        {linea.tipo_venta_servicio_id === TIPOS_VENTA_SERVICIO.PAQUETE && linea.paquete_nombre && (
                          <div className="text-xs text-purple-600 font-semibold mt-1">{linea.paquete_nombre}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 min-w-[200px]">
                        <SearchableCombobox
                          items={tipoPagador === TIPOS_PAGADOR.RESPONSABLE && pacientesDelResponsable.length > 0 ? pacientesDelResponsable : pacientes}
                          value={linea.paciente_linea_id}
                          onChange={(val) => setPacienteLinea(linea.id, val)}
                          placeholder="Buscar paciente..."
                          getItemLabel={(p) => `${p.nombres} ${p.apellido_paterno} ${p.apellido_materno || ''}`.trim()}
                          getItemValue={(p) => p.id}
                          getItemSearchText={(p) => `${p.numero_documento || ''} ${p.nombres} ${p.apellido_paterno}`.toLowerCase()}
                        />
                      </td>
                      <td className="px-4 py-4">
                        {linea.tipo_venta_servicio_id === TIPOS_VENTA_SERVICIO.PAQUETE ? (
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => setSesiones(linea.id, linea.sesiones - 1)} className="p-1 hover:bg-gray-200 rounded"><MinusIcon className="w-4 h-4 text-gray-600" /></button>
                              <span className="w-12 text-center font-semibold">{linea.sesiones}</span>
                              <button onClick={() => setSesiones(linea.id, linea.sesiones + 1)} className="p-1 hover:bg-gray-200 rounded"><PlusIcon className="w-4 h-4 text-gray-600" /></button>
                            </div>
                            <div className="text-xs text-purple-600 mt-1">Paquete {linea.paquete_nombre} (mín. {linea.sesiones_por_paquete})</div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => setSesiones(linea.id, linea.sesiones - 1)} className="p-1 hover:bg-gray-200 rounded"><MinusIcon className="w-4 h-4 text-gray-600" /></button>
                            <span className="w-12 text-center font-semibold">{linea.sesiones}</span>
                            <button onClick={() => setSesiones(linea.id, linea.sesiones + 1)} className="p-1 hover:bg-gray-200 rounded"><PlusIcon className="w-4 h-4 text-gray-600" /></button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <input type="number" step="0.01" min="0" value={linea.precio_unitario} readOnly
                          className="w-20 px-2 py-1 text-xs text-right border border-gray-200 rounded bg-gray-100 text-gray-600 cursor-not-allowed" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <select value={linea.descuento_tipo} onChange={(e) => setDescuentoLinea(linea.id, e.target.value, linea.descuento_valor)} className="px-2 py-1 text-xs border border-gray-200 rounded">
                            <option value="">-</option>
                            <option value="%">%</option>
                            <option value="S/">S/</option>
                          </select>
                          <input type="number" step="0.01" min="0" value={linea.descuento_valor}
                            onChange={(e) => setDescuentoLinea(linea.id, linea.descuento_tipo, e.target.value)}
                            className="w-16 px-2 py-1 text-xs text-right border border-gray-200 rounded" placeholder="0" />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-gray-600">S/ {calc.base.toFixed(2)}</td>
                      <td className="px-4 py-4 text-right text-sm text-gray-500">{conIgv ? `S/ ${calc.igv.toFixed(2)}` : <span className="text-gray-300">—</span>}</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">S/ {calc.totalLinea.toFixed(2)}</td>
                      <td className="px-4 py-4">
                        <button onClick={() => eliminarLinea(linea.id)} className="p-1 hover:bg-red-50 rounded text-red-600"><TrashIcon className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })}
                {lineas.length === 0 && (
                  <tr><td colSpan="9" className="px-6 py-12 text-center text-gray-400">Busca y agrega tarifas para comenzar</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Resumen */}
          <div className="p-6 border-t border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Nota interna (no visible en comprobante)</label>
                <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={5}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]" placeholder="Notas internas..." />
              </div>

              <div className="space-y-3">
                {/* 🆕 Panel de promociones */}
                <PanelPromociones
                  promocionesAplicadas={promocionesAplicadas}
                  totalDescuento={totalDescuentoPromo}
                  calculando={calculandoPromos}
                />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Descuento Global</span>
                  <div className="flex items-center gap-2">
                    <select value={descuentoGlobal.tipo} onChange={(e) => setDescuentoGlobal({ ...descuentoGlobal, tipo: e.target.value })} className="px-3 py-2 text-sm border border-gray-200 rounded-lg">
                      <option value="%">%</option>
                      <option value="S/">S/</option>
                    </select>
                    <input type="number" step="0.01" min="0" value={descuentoGlobal.valor}
                      onChange={(e) => setDescuentoGlobal({ ...descuentoGlobal, valor: e.target.value })}
                      className="w-24 px-3 py-2 text-sm text-right border border-gray-200 rounded-lg" placeholder="0" />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{conIgv ? 'Base imponible' : 'Subtotal'}</span>
                    <span className="font-semibold">S/ {totales.base.toFixed(2)}</span>
                  </div>
                  {conIgv && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">IGV (18% incluido)</span>
                      <span className="font-semibold text-gray-500">S/ {totales.igv.toFixed(2)}</span>
                    </div>
                  )}
                  {/* Línea de descuento por promociones */}
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

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button onClick={resetForm} className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cancelar</button>
            <button onClick={handleSubmit} disabled={loading || lineas.length === 0}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Guardando...' : 'Guardar Venta'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Tipo de Venta */}
    {mostrarModalTipoVenta && tarifaSeleccionada && createPortal(
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
      
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-sm">¿Cómo deseas agregar este servicio?</h2>
          <p className="text-xs text-gray-500">{tarifaSeleccionada.servicio?.nombre} - {tarifaSeleccionada.motivo_cita?.nombre}</p>
        </div>
        <span className="text-sm font-bold text-[#7B1FA2]">S/ {parseFloat(tarifaSeleccionada.precio || 0).toFixed(2)}/sesión</span>
      </div>

      {/* Body horizontal */}
      <div className="p-4 grid grid-cols-2 gap-3">

        {/* Sesión Individual */}
        <div className="border-2 border-gray-200 rounded-xl p-3 hover:border-blue-400 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-blue-700">1</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">Sesión Individual</div>
              <div className="text-xs text-gray-500">Venta de 1 sesión</div>
            </div>
          </div>
          <button
            onClick={() => agregarItemConTipo(TIPOS_VENTA_SERVICIO.SESION)}
            className="w-full px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Agregar Sesión
          </button>
        </div>

        {/* Paquete */}
        <div className="border-2 border-gray-200 rounded-xl p-3 hover:border-purple-400 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <span className="text-sm">📦</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">Paquete de Sesiones</div>
              <div className="text-xs text-gray-500">Múltiples sesiones</div>
            </div>
          </div>

          {paquetes.length === 0 ? (
            <p className="text-xs text-yellow-700 font-semibold bg-yellow-50 border border-yellow-200 rounded-lg px-2 py-1 mb-2">⚠ No hay paquetes disponibles</p>
          ) : (
            <div className="mb-2">
              <select
                value={paqueteSeleccionado}
                onChange={(e) => setPaqueteSeleccionado(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]"
              >
                <option value="">Seleccionar paquete...</option>
                {paquetes.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} ({p.cantidadSesiones} ses.)</option>
                ))}
              </select>

              {paqueteSeleccionado && (() => {
                const paq = paquetes.find(p => p.id === parseInt(paqueteSeleccionado));
                const precioNormal = parseFloat(tarifaSeleccionada.precio || 0);
                const sesiones = paq?.cantidadSesiones || 0;
                const totalNormal = precioNormal * sesiones;
                const config = (tarifaSeleccionada.precios_paquetes || [])
                  .find(pp => pp.paquete_id === parseInt(paqueteSeleccionado) && pp.flg_activo === 1);

                let precioUnitarioPaquete = precioNormal;
                let totalPaquete = totalNormal;

                if (config) {
                  if (config.tipo_calculo === 'precio_total') {
                    totalPaquete = parseFloat(config.valor);
                    precioUnitarioPaquete = totalPaquete / sesiones;
                  } else if (config.tipo_calculo === 'descuento_porcentaje') {
                    precioUnitarioPaquete = precioNormal * (1 - parseFloat(config.valor) / 100);
                    totalPaquete = precioUnitarioPaquete * sesiones;
                  }
                }

                return (
                  <div className="mt-1.5 p-2 bg-purple-50 border border-purple-200 rounded-lg text-xs space-y-0.5">
                    <div className="text-gray-400 line-through">S/ {totalNormal.toFixed(2)} normal</div>
                    <div className="font-bold text-purple-700">Total: S/ {totalPaquete.toFixed(2)}</div>
                    {config && totalPaquete < totalNormal && (
                      <div className="text-green-700 font-semibold">¡Ahorras S/ {(totalNormal - totalPaquete).toFixed(2)}!</div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          <button
            onClick={() => agregarItemConTipo(TIPOS_VENTA_SERVICIO.PAQUETE)}
            disabled={!paqueteSeleccionado || paquetes.length === 0}
            className="w-full px-3 py-1.5 text-xs font-semibold text-white bg-[#7B1FA2] rounded-lg hover:bg-[#6A1B9A] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {paquetes.length === 0 ? 'Sin paquetes' : 'Agregar Paquete'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
        <button
          onClick={() => { setMostrarModalTipoVenta(false); setTarifaSeleccionada(null); setPaqueteSeleccionado(''); }}
          className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>,
  document.body
)}

      {/* Modal Crear Comprador Externo */}
      {mostrarModalExterno && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Nuevo Comprador Externo</h2>
              <button onClick={() => setMostrarModalExterno(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleCrearExterno} className="p-6 space-y-4">
              {[
                { key: 'dni', label: 'DNI *', required: true, placeholder: '12345678', type: 'text' },
                { key: 'nombre', label: 'Nombre *', required: true, placeholder: 'Juan Pérez', type: 'text' },
                { key: 'telefono', label: 'Teléfono', required: false, placeholder: '999888777', type: 'text' },
                { key: 'email', label: 'Email', required: false, placeholder: 'email@ejemplo.com', type: 'email' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                  <input type={f.type} value={formExterno[f.key]}
                    onChange={(e) => setFormExterno(prev => ({ ...prev, [f.key]: e.target.value }))}
                    required={f.required} placeholder={f.placeholder}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" />
                </div>
              ))}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setMostrarModalExterno(false)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A]">Crear</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default VenderServiciosTab;