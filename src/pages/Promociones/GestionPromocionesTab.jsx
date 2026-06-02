import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SparklesIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  TagIcon,
  WrenchScrewdriverIcon,
  ArchiveBoxIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesSolid } from '@heroicons/react/24/solid';
import {
  getPromociones,
  getCatalogoAlcances,
  getTiposPromociones,
  crearPromocion,
  actualizarPromocion,
  activarPromocion,
  desactivarPromocion,
  eliminarPromocion,
} from '../../services/promocionesService';

// ── Constantes tipo_alcance_promo (deben coincidir con la BD) ─────────────────
const ALCANCE = { PRODUCTO: 1, CATEGORIA: 2, SERVICIO: 3, PAQUETE: 4 };
const CONDICION = { CANTIDAD_MINIMA: 1, MONTO_MINIMO: 2 };
const BENEFICIO = {
  DESCUENTO_PORCENTAJE: 1,
  DESCUENTO_MONTO_FIJO: 2,
  ITEM_BARATO_GRATIS: 3,
  PRODUCTO_REGALO: 4,
};

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

// ── Badge de alcance ──────────────────────────────────────────────────────────
const AlcanceBadge = ({ tipo }) => {
  const cfg = {
    [ALCANCE.PRODUCTO]: { label: 'Producto', color: 'bg-blue-100 text-blue-700' },
    [ALCANCE.CATEGORIA]: { label: 'Categoría', color: 'bg-[#7B1FA2]/10 text-[#7B1FA2]' },
    [ALCANCE.SERVICIO]: { label: 'Servicio', color: 'bg-emerald-100 text-emerald-700' },
    [ALCANCE.PAQUETE]: { label: 'Paquete', color: 'bg-[#A3C644]/10 text-[#A3C644]' },
  }[tipo] || { label: 'General', color: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

// ── Selector visual de alcances ───────────────────────────────────────────────
/**
 * Props:
 *   catalogo: { productos, categorias, servicios, paquetes }
 *   alcances: [{ tipo_alcance_id, referencia_id, motivo_cita_id? }]
 *   onChange: (alcances) => void
 *   tipoPromocion: 'productos' | 'servicios' | null  (bloquea mezcla)
 */
const SelectorAlcances = ({ catalogo, alcances, onChange, tipoPromocion }) => {
  const [busqueda, setBusqueda] = useState('');
  const [tab, setTab] = useState('productos'); // 'productos' | 'categorias' | 'servicios' | 'paquetes'
  const [expandedServicios, setExpandedServicios] = useState({});
  const dBusqueda = useDebounce(busqueda, 200);

  // Determinar tab activo según tipoPromocion
  useEffect(() => {
    if (tipoPromocion === 'servicios' && (tab === 'productos' || tab === 'categorias')) {
      setTab('servicios');
    } else if (tipoPromocion === 'productos' && (tab === 'servicios' || tab === 'paquetes')) {
      setTab('productos');
    }
  }, [tipoPromocion]);

  const esSeleccionado = (tipoId, refId, motivoId = null) =>
    alcances.some(
      (a) =>
        a.tipo_alcance_id === tipoId &&
        a.referencia_id === refId &&
        (motivoId === null ? true : a.motivo_cita_id === motivoId),
    );

  const toggle = (tipoId, refId, motivoId = null) => {
    const yaEsta = esSeleccionado(tipoId, refId, motivoId);
    if (yaEsta) {
      onChange(
        alcances.filter(
          (a) =>
            !(
              a.tipo_alcance_id === tipoId &&
              a.referencia_id === refId &&
              a.motivo_cita_id === (motivoId || null)
            ),
        ),
      );
    } else {
      onChange([
        ...alcances,
        { tipo_alcance_id: tipoId, referencia_id: refId, motivo_cita_id: motivoId || null },
      ]);
    }
  };

  // Toggle todos los motivos de un servicio (o el servicio completo sin motivo)
  const toggleServicioCompleto = (servicio) => {
    const todosMotivosSeleccionados =
      servicio.motivos.length > 0 &&
      servicio.motivos.every((m) => esSeleccionado(ALCANCE.SERVICIO, servicio.id, m.id));

    if (todosMotivosSeleccionados) {
      // Deseleccionar todos
      onChange(
        alcances.filter(
          (a) => !(a.tipo_alcance_id === ALCANCE.SERVICIO && a.referencia_id === servicio.id),
        ),
      );
    } else {
      // Agregar los que faltan
      const nuevos = servicio.motivos
        .filter((m) => !esSeleccionado(ALCANCE.SERVICIO, servicio.id, m.id))
        .map((m) => ({ tipo_alcance_id: ALCANCE.SERVICIO, referencia_id: servicio.id, motivo_cita_id: m.id }));
      onChange([...alcances, ...nuevos]);
    }
  };

  const filtrar = (lista, campo) =>
    dBusqueda ? lista.filter((i) => i[campo]?.toLowerCase().includes(dBusqueda.toLowerCase())) : lista;

  const TABS = [
    {
      id: 'productos',
      label: 'Productos',
      icon: ShoppingBagIcon,
      disabled: tipoPromocion === 'servicios',
    },
    {
      id: 'categorias',
      label: 'Categorías',
      icon: TagIcon,
      disabled: tipoPromocion === 'servicios',
    },
    {
      id: 'servicios',
      label: 'Servicios',
      icon: WrenchScrewdriverIcon,
      disabled: tipoPromocion === 'productos',
    },
    {
      id: 'paquetes',
      label: 'Paquetes',
      icon: ArchiveBoxIcon,
      disabled: tipoPromocion === 'productos',
    },
  ];

  // Texto explicativo para cada pestaña
  const EXPLICACIONES = {
    productos: 'Selecciona productos individuales específicos',
    categorias: 'Selecciona categorías completas (incluye automáticamente TODOS los productos de esa categoría)',
    servicios: 'Selecciona servicios individuales con sus motivos de cita',
    paquetes: 'Selecciona paquetes completos (incluye automáticamente todas las sesiones del paquete)',
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {TABS.map(({ id, label, icon: Icon, disabled }) => (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-all
              ${tab === id ? 'bg-white border-b-2 border-[#7B1FA2] text-[#7B1FA2]' : 'text-gray-500 hover:text-gray-700'}
              ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Explicación de la pestaña actual */}
      <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100">
        <p className="text-xs text-blue-700 flex items-start gap-2">
          <span className="text-blue-500 font-bold shrink-0">ℹ️</span>
          <span>{EXPLICACIONES[tab]}</span>
        </p>
      </div>

      {/* Búsqueda */}
      <div className="p-3 border-b border-gray-100 space-y-2">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/20 focus:border-[#7B1FA2]"
          />
        </div>
        {/* Botón seleccionar todos */}
        {tab === 'productos' && catalogo.productos?.length > 0 && (
          <button
            type="button"
            onClick={() => {
              const todosProductos = filtrar(catalogo.productos || [], 'nombre');
              const todosSeleccionados = todosProductos.every((p) => esSeleccionado(ALCANCE.PRODUCTO, p.id));
              if (todosSeleccionados) {
                // Deseleccionar todos los productos
                onChange(alcances.filter((a) => a.tipo_alcance_id !== ALCANCE.PRODUCTO));
              } else {
                // Seleccionar todos los productos
                const nuevosAlcances = alcances.filter((a) => a.tipo_alcance_id !== ALCANCE.PRODUCTO);
                todosProductos.forEach((p) => {
                  nuevosAlcances.push({ tipo_alcance_id: ALCANCE.PRODUCTO, referencia_id: p.id, motivo_cita_id: null });
                });
                onChange(nuevosAlcances);
              }
            }}
            className="w-full px-3 py-1.5 text-xs font-semibold text-[#7B1FA2] bg-[#7B1FA2]/10 hover:bg-[#7B1FA2]/20 rounded-lg transition-colors"
          >
            {filtrar(catalogo.productos || [], 'nombre').every((p) => esSeleccionado(ALCANCE.PRODUCTO, p.id))
              ? 'Deseleccionar todos los productos'
              : 'Seleccionar todos los productos'}
          </button>
        )}
        {tab === 'categorias' && catalogo.categorias?.length > 0 && (
          <button
            type="button"
            onClick={() => {
              const todasCategorias = filtrar(catalogo.categorias || [], 'nombre');
              const todasSeleccionadas = todasCategorias.every((c) => esSeleccionado(ALCANCE.CATEGORIA, c.id));
              if (todasSeleccionadas) {
                onChange(alcances.filter((a) => a.tipo_alcance_id !== ALCANCE.CATEGORIA));
              } else {
                const nuevosAlcances = alcances.filter((a) => a.tipo_alcance_id !== ALCANCE.CATEGORIA);
                todasCategorias.forEach((c) => {
                  nuevosAlcances.push({ tipo_alcance_id: ALCANCE.CATEGORIA, referencia_id: c.id, motivo_cita_id: null });
                });
                onChange(nuevosAlcances);
              }
            }}
            className="w-full px-3 py-1.5 text-xs font-semibold text-[#7B1FA2] bg-[#7B1FA2]/10 hover:bg-[#7B1FA2]/20 rounded-lg transition-colors"
          >
            {filtrar(catalogo.categorias || [], 'nombre').every((c) => esSeleccionado(ALCANCE.CATEGORIA, c.id))
              ? 'Deseleccionar todas las categorías'
              : 'Seleccionar todas las categorías'}
          </button>
        )}
        {tab === 'servicios' && catalogo.servicios?.length > 0 && (
          <button
            type="button"
            onClick={() => {
              const todosServicios = filtrar(catalogo.servicios || [], 'nombre');
              // Verificar si todos los motivos de todos los servicios están seleccionados
              const todosSeleccionados = todosServicios.every((srv) =>
                srv.motivos.every((m) => esSeleccionado(ALCANCE.SERVICIO, srv.id, m.id))
              );
              if (todosSeleccionados) {
                onChange(alcances.filter((a) => a.tipo_alcance_id !== ALCANCE.SERVICIO));
              } else {
                const nuevosAlcances = alcances.filter((a) => a.tipo_alcance_id !== ALCANCE.SERVICIO);
                todosServicios.forEach((srv) => {
                  srv.motivos.forEach((m) => {
                    nuevosAlcances.push({ tipo_alcance_id: ALCANCE.SERVICIO, referencia_id: srv.id, motivo_cita_id: m.id });
                  });
                });
                onChange(nuevosAlcances);
              }
            }}
            className="w-full px-3 py-1.5 text-xs font-semibold text-[#7B1FA2] bg-[#7B1FA2]/10 hover:bg-[#7B1FA2]/20 rounded-lg transition-colors"
          >
            {filtrar(catalogo.servicios || [], 'nombre').every((srv) =>
              srv.motivos.every((m) => esSeleccionado(ALCANCE.SERVICIO, srv.id, m.id))
            )
              ? 'Deseleccionar todos los servicios'
              : 'Seleccionar todos los servicios'}
          </button>
        )}
        {tab === 'paquetes' && catalogo.paquetes?.length > 0 && (
          <button
            type="button"
            onClick={() => {
              const todosPaquetes = filtrar(catalogo.paquetes || [], 'nombre');
              const todosSeleccionados = todosPaquetes.every((p) => esSeleccionado(ALCANCE.PAQUETE, p.id));
              if (todosSeleccionados) {
                onChange(alcances.filter((a) => a.tipo_alcance_id !== ALCANCE.PAQUETE));
              } else {
                const nuevosAlcances = alcances.filter((a) => a.tipo_alcance_id !== ALCANCE.PAQUETE);
                todosPaquetes.forEach((p) => {
                  nuevosAlcances.push({ tipo_alcance_id: ALCANCE.PAQUETE, referencia_id: p.id, motivo_cita_id: null });
                });
                onChange(nuevosAlcances);
              }
            }}
            className="w-full px-3 py-1.5 text-xs font-semibold text-[#7B1FA2] bg-[#7B1FA2]/10 hover:bg-[#7B1FA2]/20 rounded-lg transition-colors"
          >
            {filtrar(catalogo.paquetes || [], 'nombre').every((p) => esSeleccionado(ALCANCE.PAQUETE, p.id))
              ? 'Deseleccionar todos los paquetes'
              : 'Seleccionar todos los paquetes'}
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
        {/* ── PRODUCTOS ── */}
        {tab === 'productos' && (
          <>
            {filtrar(catalogo.productos || [], 'nombre').length === 0 && (
              <p className="p-4 text-sm text-gray-400 text-center">No hay productos</p>
            )}
            {filtrar(catalogo.productos || [], 'nombre').map((prod) => {
              const sel = esSeleccionado(ALCANCE.PRODUCTO, prod.id);
              return (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => toggle(ALCANCE.PRODUCTO, prod.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors
                    ${sel ? 'bg-blue-50' : ''}`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0
                    ${sel ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}
                  >
                    {sel && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{prod.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {prod.categoria_nombre} · S/ {parseFloat(prod.precio_venta || 0).toFixed(2)} ·
                      Stock: {prod.stock_actual}
                    </p>
                  </div>
                </button>
              );
            })}
          </>
        )}

        {/* ── CATEGORÍAS ── */}
        {tab === 'categorias' && (
          <>
            {filtrar(catalogo.categorias || [], 'nombre').length === 0 && (
              <p className="p-4 text-sm text-gray-400 text-center">No hay categorías</p>
            )}
            {filtrar(catalogo.categorias || [], 'nombre').map((cat) => {
              const sel = esSeleccionado(ALCANCE.CATEGORIA, cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggle(ALCANCE.CATEGORIA, cat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors
                    ${sel ? 'bg-[#7B1FA2]/10' : ''}`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0
                    ${sel ? 'bg-[#7B1FA2] border-[#7B1FA2]' : 'border-gray-300'}`}
                  >
                    {sel && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{cat.nombre}</p>
                    <p className="text-xs text-gray-500">
                      Incluye {cat.total_productos} producto(s) automáticamente
                    </p>
                  </div>
                  <TagIcon className="w-4 h-4 text-gray-300" />
                </button>
              );
            })}
          </>
        )}

        {/* ── SERVICIOS ── */}
        {tab === 'servicios' && (
          <>
            {filtrar(catalogo.servicios || [], 'nombre').length === 0 && (
              <p className="p-4 text-sm text-gray-400 text-center">No hay servicios</p>
            )}
            {filtrar(catalogo.servicios || [], 'nombre').map((srv) => {
              const expanded = expandedServicios[srv.id];
              const algunoSel = srv.motivos.some((m) => esSeleccionado(ALCANCE.SERVICIO, srv.id, m.id));
              const todosSel =
                srv.motivos.length > 0 &&
                srv.motivos.every((m) => esSeleccionado(ALCANCE.SERVICIO, srv.id, m.id));

              return (
                <div key={srv.id}>
                  <div className={`flex items-center gap-2 px-4 py-2.5 ${algunoSel ? 'bg-emerald-50' : ''}`}>
                    {/* Checkbox maestro del servicio */}
                    <button
                      type="button"
                      onClick={() => toggleServicioCompleto(srv)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0
                        ${todosSel ? 'bg-emerald-600 border-emerald-600' : algunoSel ? 'bg-emerald-200 border-emerald-400' : 'border-gray-300'}`}
                    >
                      {todosSel ? (
                        <CheckIcon className="w-3 h-3 text-white" />
                      ) : algunoSel ? (
                        <div className="w-2 h-0.5 bg-emerald-700 rounded" />
                      ) : null}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{srv.nombre}</p>
                      {algunoSel && (
                        <p className="text-xs text-emerald-600">
                          {srv.motivos.filter((m) => esSeleccionado(ALCANCE.SERVICIO, srv.id, m.id)).length}/
                          {srv.motivos.length} motivo(s)
                        </p>
                      )}
                    </div>
                    {srv.motivos.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedServicios((prev) => ({ ...prev, [srv.id]: !prev[srv.id] }))
                        }
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {expanded ? (
                          <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Motivos de cita (sub-items) */}
                  {expanded &&
                    srv.motivos.map((m) => {
                      const mSel = esSeleccionado(ALCANCE.SERVICIO, srv.id, m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggle(ALCANCE.SERVICIO, srv.id, m.id)}
                          className={`w-full flex items-center gap-3 pl-10 pr-4 py-2 text-left hover:bg-gray-50 transition-colors
                            ${mSel ? 'bg-emerald-50' : ''}`}
                        >
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0
                            ${mSel ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}
                          >
                            {mSel && <CheckIcon className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-700">{m.nombre}</p>
                            {m.precio && (
                              <p className="text-xs text-gray-400">S/ {parseFloat(m.precio).toFixed(2)}</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                </div>
              );
            })}
          </>
        )}

        {/* ── PAQUETES ── */}
        {tab === 'paquetes' && (
          <>
            {filtrar(catalogo.paquetes || [], 'nombre').length === 0 && (
              <p className="p-4 text-sm text-gray-400 text-center">No hay paquetes</p>
            )}
            {filtrar(catalogo.paquetes || [], 'nombre').map((paq) => {
              const sel = esSeleccionado(ALCANCE.PAQUETE, paq.id);
              return (
                <button
                  key={paq.id}
                  type="button"
                  onClick={() => toggle(ALCANCE.PAQUETE, paq.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors
                    ${sel ? 'bg-[#A3C644]/10' : ''}`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0
                    ${sel ? 'bg-[#A3C644] border-[#A3C644]' : 'border-gray-300'}`}
                  >
                    {sel && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{paq.nombre}</p>
                    <p className="text-xs text-gray-500">{paq.cantidadSesiones} sesiones</p>
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Footer: resumen de seleccionados */}
      {alcances.length > 0 && (
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-2">
            {alcances.length} alcance(s) seleccionado(s):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {alcances.map((a, i) => {
              let label = '';
              if (a.tipo_alcance_id === ALCANCE.PRODUCTO) {
                const p = catalogo.productos?.find((x) => x.id === a.referencia_id);
                label = p?.nombre || `Producto #${a.referencia_id}`;
              } else if (a.tipo_alcance_id === ALCANCE.CATEGORIA) {
                const c = catalogo.categorias?.find((x) => x.id === a.referencia_id);
                const totalProds = c?.total_productos || 0;
                label = `${c?.nombre || `Categoría #${a.referencia_id}`} (${totalProds} prods)`;
              } else if (a.tipo_alcance_id === ALCANCE.SERVICIO) {
                const srv = catalogo.servicios?.find((x) => x.id === a.referencia_id);
                const mot = srv?.motivos?.find((m) => m.id === a.motivo_cita_id);
                label = `${srv?.nombre || `Servicio #${a.referencia_id}`}${mot ? ' · ' + mot.nombre : ''}`;
              } else if (a.tipo_alcance_id === ALCANCE.PAQUETE) {
                const paq = catalogo.paquetes?.find((x) => x.id === a.referencia_id);
                const totalSesiones = paq?.cantidadSesiones || 0;
                label = `${paq?.nombre || `Paquete #${a.referencia_id}`} (${totalSesiones} ses)`;
              }
              return (
                <span
                  key={i}
                  className="flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700"
                >
                  <AlcanceBadge tipo={a.tipo_alcance_id} />
                  <span className="max-w-[120px] truncate">{label}</span>
                  <button
                    type="button"
                    onClick={() => onChange(alcances.filter((_, j) => j !== i))}
                    className="ml-0.5 text-gray-400 hover:text-red-500"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Modal Crear/Editar Promoción ──────────────────────────────────────────────
const ModalPromocion = ({ promo, catalogo, tiposCatalogo, onClose, onSaved }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const esEdicion = !!(promo && promo.id);
  const [pasoActual, setPasoActual] = useState(1);

  // Debug: verificar qué está recibiendo el modal
  console.log('🎭 Modal abierto:', { promo, esEdicion });

  const [form, setForm] = useState({
    nombre: promo?.nombre || '',
    descripcion: promo?.descripcion || '',
    aplica_todo: promo?.aplica_todo === 1 || false,
    fecha_inicio: promo?.fecha_inicio?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    fecha_fin: promo?.fecha_fin?.slice(0, 10) || '',
    flg_acumulable: promo?.flg_acumulable === 1 || false,
    flg_activo: promo?.flg_activo !== 0,
  });

  const [reglas, setReglas] = useState(
    promo?.reglas?.length
      ? promo.reglas.map((r) => ({
          condicion_tipo_id: r.condicion_tipo_id,
          condicion_valor: r.condicion_valor,
          beneficio_tipo_id: r.beneficio_tipo_id,
          beneficio_valor: r.beneficio_valor || '',
          beneficio_producto_id: r.beneficio_producto_id || null,
        }))
      : [{ condicion_tipo_id: CONDICION.MONTO_MINIMO, condicion_valor: '', beneficio_tipo_id: BENEFICIO.DESCUENTO_PORCENTAJE, beneficio_valor: '', beneficio_producto_id: null }],
  );

  const [alcances, setAlcances] = useState(
    promo?.alcances?.map((a) => ({
      tipo_alcance_id: a.tipo_alcance_id,
      referencia_id: a.referencia_id,
      motivo_cita_id: a.motivo_cita_id || null,
    })) || [],
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Detectar tipo de promoción (productos o servicios) basado en alcances actuales
  const tipoPromocion = (() => {
    if (alcances.length === 0) return null;
    const tieneProductos = alcances.some(
      (a) => a.tipo_alcance_id === ALCANCE.PRODUCTO || a.tipo_alcance_id === ALCANCE.CATEGORIA,
    );
    const tieneServicios = alcances.some(
      (a) => a.tipo_alcance_id === ALCANCE.SERVICIO || a.tipo_alcance_id === ALCANCE.PAQUETE,
    );
    if (tieneProductos) return 'productos';
    if (tieneServicios) return 'servicios';
    return null;
  })();

  const agregarRegla = () =>
    setReglas((prev) => [
      ...prev,
      { condicion_tipo_id: CONDICION.MONTO_MINIMO, condicion_valor: '', beneficio_tipo_id: BENEFICIO.DESCUENTO_PORCENTAJE, beneficio_valor: '', beneficio_producto_id: null },
    ]);

  const updateRegla = (i, campo, valor) =>
    setReglas((prev) => prev.map((r, j) => (j === i ? { ...r, [campo]: valor } : r)));

  const removeRegla = (i) => setReglas((prev) => prev.filter((_, j) => j !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validar Paso 1
    if (!form.nombre.trim()) {
      setPasoActual(1);
      return setError('El nombre es obligatorio');
    }

    // Validar Paso 2
    if (reglas.length === 0) {
      setPasoActual(2);
      return setError('Agrega al menos una regla');
    }
    for (const r of reglas) {
      if (!r.condicion_valor || r.condicion_valor === '') {
        setPasoActual(2);
        return setError('Completa el valor de todas las condiciones de las reglas');
      }
      if ([BENEFICIO.DESCUENTO_PORCENTAJE, BENEFICIO.DESCUENTO_MONTO_FIJO].includes(r.beneficio_tipo_id) && (!r.beneficio_valor || r.beneficio_valor === '')) {
        setPasoActual(2);
        return setError('Completa el valor del beneficio de todas las reglas');
      }
    }

    // Validar Paso 3
    if (!form.aplica_todo && alcances.length === 0) {
      setPasoActual(3);
      return setError('Selecciona al menos un alcance, o marca "Aplica a todo el catálogo"');
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        aplica_todo: form.aplica_todo,
        fecha_fin: form.fecha_fin || null,
        reglas: reglas.map((r) => ({
          condicion_tipo_id: parseInt(r.condicion_tipo_id),
          condicion_valor: parseFloat(r.condicion_valor),
          beneficio_tipo_id: parseInt(r.beneficio_tipo_id),
          beneficio_valor: r.beneficio_valor ? parseFloat(r.beneficio_valor) : null,
          beneficio_producto_id: r.beneficio_producto_id || null,
        })),
        alcances: form.aplica_todo ? [] : alcances,
        user_crea_id: user?.id,
        user_actua_id: user?.id,
      };

      console.log('🔍 Guardando promoción:', {
        esEdicion,
        promo,
        promoId: promo?.id,
        accion: (esEdicion && promo?.id) ? 'EDITAR' : 'CREAR',
        payload
      });

      if (esEdicion && promo?.id) {
        console.log('📝 Actualizando promoción ID:', promo.id);
        await actualizarPromocion(promo.id, payload);
      } else {
        console.log('✨ Creando nueva promoción');
        await crearPromocion(payload);
      }
      onSaved();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || (Array.isArray(err) ? err.join(', ') : JSON.stringify(err));
      setError(msg);
      console.error('Error al guardar promoción:', err);
    } finally {
      setLoading(false);
    }
  };

  const LABELS_CONDICION = {
    [CONDICION.CANTIDAD_MINIMA]: 'Cantidad mínima de items',
    [CONDICION.MONTO_MINIMO]: 'Monto mínimo de compra (S/)',
  };
  const LABELS_BENEFICIO = {
    [BENEFICIO.DESCUENTO_PORCENTAJE]: 'Descuento %',
    [BENEFICIO.DESCUENTO_MONTO_FIJO]: 'Descuento monto fijo (S/)',
    [BENEFICIO.ITEM_BARATO_GRATIS]: 'Item más barato gratis',
    [BENEFICIO.PRODUCTO_REGALO]: 'Producto de regalo',
  };

  const PASOS = [
    { numero: 1, titulo: 'Información', descripcion: 'Datos generales' },
    { numero: 2, titulo: 'Reglas', descripcion: 'Condiciones y beneficios' },
    { numero: 3, titulo: 'Alcance', descripcion: 'Productos o servicios' },
  ];

  const irAPaso = (numeroPaso) => {
    setPasoActual(numeroPaso);
    setError('');
  };

  const siguientePaso = () => {
    if (pasoActual < 3) {
      setPasoActual(pasoActual + 1);
      setError('');
    }
  };

  const pasoAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
      setError('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7B1FA2]/10 flex items-center justify-center">
                <SparklesSolid className="w-6 h-6 text-[#7B1FA2]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {esEdicion ? 'Editar Promoción' : 'Nueva Promoción'}
                </h2>
                <p className="text-sm text-gray-500">
                  {PASOS[pasoActual - 1].descripcion}
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Indicador de pasos */}
          <div className="flex items-center gap-2">
            {PASOS.map((paso, idx) => (
              <React.Fragment key={paso.numero}>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => irAPaso(paso.numero)}
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all cursor-pointer hover:scale-110
                      ${pasoActual === paso.numero
                        ? 'bg-[#7B1FA2] text-white shadow-md'
                        : pasoActual > paso.numero
                        ? 'bg-[#A3C644] text-white'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                      }`}
                  >
                    {pasoActual > paso.numero ? <CheckIcon className="w-4 h-4" /> : paso.numero}
                  </button>
                  <button
                    type="button"
                    onClick={() => irAPaso(paso.numero)}
                    className={`text-sm font-medium hidden sm:inline transition-colors hover:text-[#7B1FA2]
                      ${pasoActual === paso.numero ? 'text-[#7B1FA2]' : 'text-gray-500'}`}
                  >
                    {paso.titulo}
                  </button>
                </div>
                {idx < PASOS.length - 1 && (
                  <div className={`flex-1 h-0.5 ${pasoActual > paso.numero ? 'bg-[#A3C644]' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          {/* Contenido con scroll */}
          <div className="flex-1 overflow-y-auto">
            {/* Error */}
            {error && (
              <div className="mx-6 mt-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-sm text-red-700">
                <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

          {/* ── PASO 1: Info general ── */}
          {pasoActual === 1 && (
            <div className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Información general</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Nombre de la promoción *
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: 2x1 en fisioterapia, Descuento verano..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/20 focus:border-[#7B1FA2]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                rows={2}
                placeholder="Descripción interna de la promoción..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/20 focus:border-[#7B1FA2] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fecha inicio *</label>
                <input
                  type="date"
                  value={form.fecha_inicio}
                  onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/20 focus:border-[#7B1FA2]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Fecha fin <span className="text-gray-400 font-normal">(vacío = sin vencimiento)</span>
                </label>
                <input
                  type="date"
                  value={form.fecha_fin}
                  onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/20 focus:border-[#7B1FA2]"
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.flg_acumulable}
                  onChange={(e) => setForm({ ...form, flg_acumulable: e.target.checked })}
                  className="w-4 h-4 text-[#7B1FA2] rounded border-gray-300 focus:ring-[#7B1FA2]/20"
                />
                <span className="text-sm text-gray-700">Acumulable con otras promociones</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.flg_activo}
                  onChange={(e) => setForm({ ...form, flg_activo: e.target.checked })}
                  className="w-4 h-4 text-[#7B1FA2] rounded border-gray-300 focus:ring-[#7B1FA2]/20"
                />
                <span className="text-sm text-gray-700">Activa</span>
              </label>
            </div>
            </div>
          )}

          {/* ── PASO 2: Reglas ── */}
          {pasoActual === 2 && (
            <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Reglas de la promoción
              </h3>
              <button
                type="button"
                onClick={agregarRegla}
                className="flex items-center gap-1 text-xs font-semibold text-[#7B1FA2] hover:underline"
              >
                <PlusIcon className="w-4 h-4" /> Agregar regla
              </button>
            </div>

            {reglas.map((regla, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-xl space-y-3 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Regla {i + 1}</span>
                  {reglas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRegla(i)}
                      className="p-1 hover:bg-red-50 rounded text-red-500"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Condición */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Condición</label>
                    <select
                      value={regla.condicion_tipo_id}
                      onChange={(e) => updateRegla(i, 'condicion_tipo_id', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/20 focus:border-[#7B1FA2] bg-white"
                    >
                      {tiposCatalogo?.tiposCondicion?.map((tc) => (
                        <option key={tc.id} value={tc.id}>{tc.nombre}</option>
                      )) || (
                        <>
                          <option value={CONDICION.MONTO_MINIMO}>Monto mínimo de compra</option>
                          <option value={CONDICION.CANTIDAD_MINIMA}>Cantidad mínima de items</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Valor ({regla.condicion_tipo_id === CONDICION.MONTO_MINIMO ? 'S/' : 'unidades'})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={regla.condicion_valor}
                      onChange={(e) => updateRegla(i, 'condicion_valor', e.target.value)}
                      placeholder="Ej: 100.00"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/20 focus:border-[#7B1FA2]"
                    />
                  </div>
                </div>

                {/* Beneficio */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Beneficio</label>
                    <select
                      value={regla.beneficio_tipo_id}
                      onChange={(e) => updateRegla(i, 'beneficio_tipo_id', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/20 focus:border-[#7B1FA2] bg-white"
                    >
                      {tiposCatalogo?.tiposBeneficio?.map((tb) => (
                        <option key={tb.id} value={tb.id}>{tb.nombre}</option>
                      )) || Object.entries(LABELS_BENEFICIO).map(([id, label]) => (
                        <option key={id} value={id}>{label}</option>
                      ))}
                    </select>
                  </div>
                  {[BENEFICIO.DESCUENTO_PORCENTAJE, BENEFICIO.DESCUENTO_MONTO_FIJO].includes(
                    regla.beneficio_tipo_id,
                  ) && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Valor ({regla.beneficio_tipo_id === BENEFICIO.DESCUENTO_PORCENTAJE ? '%' : 'S/'})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        max={regla.beneficio_tipo_id === BENEFICIO.DESCUENTO_PORCENTAJE ? 100 : undefined}
                        value={regla.beneficio_valor}
                        onChange={(e) => updateRegla(i, 'beneficio_valor', e.target.value)}
                        placeholder={regla.beneficio_tipo_id === BENEFICIO.DESCUENTO_PORCENTAJE ? 'Ej: 10' : 'Ej: 25.00'}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/20 focus:border-[#7B1FA2]"
                      />
                    </div>
                  )}
                  {regla.beneficio_tipo_id === BENEFICIO.PRODUCTO_REGALO && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Producto regalo
                      </label>
                      <select
                        value={regla.beneficio_producto_id || ''}
                        onChange={(e) =>
                          updateRegla(i, 'beneficio_producto_id', e.target.value ? parseInt(e.target.value) : null)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/20 focus:border-[#7B1FA2] bg-white"
                      >
                        <option value="">Seleccionar producto...</option>
                        {catalogo.productos?.map((p) => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>
          )}

          {/* ── PASO 3: Alcance ── */}
          {pasoActual === 3 && (
            <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-2">
                Alcance de la promoción
              </h3>
              <div className="p-3 bg-[#A3C644]/10 border border-[#A3C644]/30 rounded-lg mb-4">
                <p className="text-xs text-gray-700 leading-relaxed">
                  <strong className="text-[#A3C644]">💡 ¿Cómo funciona?</strong>
                  <br />
                  • <strong>Productos individuales:</strong> La promoción aplica solo a esos productos específicos
                  <br />
                  • <strong>Categoría completa:</strong> La promoción aplica automáticamente a TODOS los productos de esa categoría (actuales y futuros)
                  <br />
                  • <strong>Servicios/Paquetes:</strong> Funcionan igual - selección individual o por grupo completo
                </p>
              </div>
            </div>

            {/* Opción: aplica a todo */}
            <div
              onClick={() => setForm({ ...form, aplica_todo: !form.aplica_todo })}
              className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all
                ${form.aplica_todo ? 'border-[#7B1FA2] bg-[#7B1FA2]/5' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                ${form.aplica_todo ? 'bg-[#7B1FA2] text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                <GlobeAltIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${form.aplica_todo ? 'text-[#7B1FA2]' : 'text-gray-700'}`}>
                  Aplica a todo el catálogo
                </p>
                <p className="text-xs text-gray-500">
                  La promoción se aplicará a cualquier producto o servicio sin excepción
                </p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${form.aplica_todo ? 'bg-[#7B1FA2] border-[#7B1FA2]' : 'border-gray-300'}`}
              >
                {form.aplica_todo && <CheckIcon className="w-3 h-3 text-white" />}
              </div>
            </div>

            {/* Selector específico */}
            {!form.aplica_todo && (
              <>
                {tipoPromocion && (
                  <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold">i</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      {tipoPromocion === 'productos' ? (
                        <>
                          <strong>Promoción de productos:</strong> Puedes seleccionar productos individuales o categorías completas.
                          Las pestañas de servicios y paquetes están deshabilitadas.
                        </>
                      ) : (
                        <>
                          <strong>Promoción de servicios:</strong> Puedes seleccionar servicios individuales o paquetes completos.
                          Las pestañas de productos y categorías están deshabilitadas.
                        </>
                      )}
                    </p>
                  </div>
                )}
                <SelectorAlcances
                  catalogo={catalogo}
                  alcances={alcances}
                  onChange={setAlcances}
                  tipoPromocion={tipoPromocion}
                />
              </>
            )}
            </div>
          )}
          </div>

          {/* Footer - Navegación por pasos */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-3">
              {pasoActual > 1 && (
                <button
                  type="button"
                  onClick={pasoAnterior}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Anterior
                </button>
              )}

              {pasoActual < 3 ? (
                <button
                  type="button"
                  onClick={siguientePaso}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#7B1FA2] rounded-lg hover:bg-[#6A1B9A] transition-colors shadow-sm"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#A3C644] rounded-lg hover:bg-[#8FB82D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {loading ? 'Guardando...' : esEdicion ? 'Actualizar promoción' : 'Crear promoción'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Tooltip de alcances ───────────────────────────────────────────────────────
const TooltipAlcances = ({ alcances, catalogo }) => {
  const [mostrar, setMostrar] = useState(false);

  const nombresCompletos = alcances.map((a) => {
    if (a.tipo_alcance_id === ALCANCE.PRODUCTO) {
      const p = catalogo.productos?.find((x) => x.id === a.referencia_id);
      return p ? `📦 ${p.nombre}` : null;
    } else if (a.tipo_alcance_id === ALCANCE.CATEGORIA) {
      const c = catalogo.categorias?.find((x) => x.id === a.referencia_id);
      return c ? `🏷️ Categoría: ${c.nombre}` : null;
    } else if (a.tipo_alcance_id === ALCANCE.SERVICIO) {
      const srv = catalogo.servicios?.find((x) => x.id === a.referencia_id);
      const mot = srv?.motivos?.find((m) => m.id === a.motivo_cita_id);
      if (srv && mot) return `🔧 ${srv.nombre} - ${mot.nombre}`;
      if (srv) return `🔧 ${srv.nombre}`;
      return null;
    } else if (a.tipo_alcance_id === ALCANCE.PAQUETE) {
      const paq = catalogo.paquetes?.find((x) => x.id === a.referencia_id);
      return paq ? `📁 Paquete: ${paq.nombre}` : null;
    }
    return null;
  }).filter(Boolean);

  if (alcances.length <= 3) return null;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setMostrar(true)}
        onMouseLeave={() => setMostrar(false)}
        className="ml-1 text-xs text-[#7B1FA2] hover:underline cursor-help"
      >
        ver todos
      </button>
      {mostrar && (
        <div className="absolute z-50 left-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-xl p-3 max-h-64 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-600 mb-2">Todos los alcances ({nombresCompletos.length}):</p>
          <div className="space-y-1">
            {nombresCompletos.map((nombre, i) => (
              <p key={i} className="text-xs text-gray-700">{nombre}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────
const GestionPromocionesPage = () => {
  const [promociones, setPromociones] = useState([]);
  const [catalogo, setCatalogo] = useState({ productos: [], categorias: [], servicios: [], paquetes: [] });
  const [tiposCatalogo, setTiposCatalogo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [promoEditando, setPromoEditando] = useState(null);
  const [modoCreacion, setModoCreacion] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [promos, cat, tipos] = await Promise.all([
        getPromociones(),
        getCatalogoAlcances(),
        getTiposPromociones(),
      ]);
      setPromociones(promos);
      setCatalogo(cat);
      setTiposCatalogo(tipos);
    } catch (err) {
      setError('Error cargando datos');
      console.error('Error al cargar promociones:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleSaved = () => {
    setModalAbierto(false);
    setPromoEditando(null);
    setExito('Promoción guardada exitosamente');
    setTimeout(() => setExito(''), 3000);
    cargar();
  };

  const handleToggle = async (promo) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (promo.flg_activo) {
        await desactivarPromocion(promo.id, user?.id);
      } else {
        await activarPromocion(promo.id, user?.id);
      }
      cargar();
    } catch (err) {
      setError('Error al cambiar estado');
      console.error('Error al cambiar estado de promoción:', err);
    }
  };

  const handleEliminar = async () => {
    try {
      await eliminarPromocion(confirmEliminar);
      setConfirmEliminar(null);
      setExito('Promoción eliminada');
      setTimeout(() => setExito(''), 3000);
      cargar();
    } catch (err) {
      setError('Error al eliminar');
      console.error('Error al eliminar promoción:', err);
    }
  };

  const resumenAlcance = (promo) => {
    if (promo.aplica_todo) return 'Todo el catálogo';
    if (!promo.alcances?.length) return 'Sin alcances definidos';

    const nombresAlcances = [];

    promo.alcances.forEach((a) => {
      if (a.tipo_alcance_id === ALCANCE.PRODUCTO) {
        const p = catalogo.productos?.find((x) => x.id === a.referencia_id);
        if (p) nombresAlcances.push(p.nombre);
      } else if (a.tipo_alcance_id === ALCANCE.CATEGORIA) {
        const c = catalogo.categorias?.find((x) => x.id === a.referencia_id);
        if (c) nombresAlcances.push(`Categoría: ${c.nombre}`);
      } else if (a.tipo_alcance_id === ALCANCE.SERVICIO) {
        const srv = catalogo.servicios?.find((x) => x.id === a.referencia_id);
        const mot = srv?.motivos?.find((m) => m.id === a.motivo_cita_id);
        if (srv && mot) nombresAlcances.push(`${srv.nombre} - ${mot.nombre}`);
        else if (srv) nombresAlcances.push(srv.nombre);
      } else if (a.tipo_alcance_id === ALCANCE.PAQUETE) {
        const paq = catalogo.paquetes?.find((x) => x.id === a.referencia_id);
        if (paq) nombresAlcances.push(`Paquete: ${paq.nombre}`);
      }
    });

    if (nombresAlcances.length === 0) return 'Sin alcances definidos';
    if (nombresAlcances.length <= 3) return nombresAlcances.join(', ');
    return `${nombresAlcances.slice(0, 3).join(', ')} y ${nombresAlcances.length - 3} más`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <SparklesIcon className="w-8 h-8 text-[#7B1FA2]" />
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Promociones</h1>
            </div>
            <p className="text-sm text-gray-500">
              Crea y administra promociones para productos y servicios
            </p>
          </div>
          <button
            onClick={() => {
              setPromoEditando(null);
              setError('');
              setExito('');
              setModalAbierto(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Nueva promoción
          </button>
        </div>

        {/* Alertas */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}
        {exito && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{exito}</div>
        )}

        {/* Lista */}
        {cargando ? (
          <div className="text-center py-16 text-gray-400">Cargando promociones...</div>
        ) : promociones.length === 0 ? (
          <div className="text-center py-16">
            <SparklesIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay promociones creadas</p>
            <p className="text-sm text-gray-400 mt-1">
              Crea tu primera promoción para aplicar descuentos automáticos
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {promociones.map((promo) => (
              <div
                key={promo.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all
                  ${promo.flg_activo ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}
              >
                <div className="p-5 flex items-start gap-4">
                  {/* Ícono */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                    ${promo.flg_activo ? 'bg-[#7B1FA2]/10' : 'bg-gray-100'}`}
                  >
                    <SparklesSolid
                      className={`w-6 h-6 ${promo.flg_activo ? 'text-[#7B1FA2]' : 'text-gray-400'}`}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-gray-900">{promo.nombre}</h3>
                      {!promo.flg_activo && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full">
                          Inactiva
                        </span>
                      )}
                      {promo.flg_acumulable ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Acumulable
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                          No acumulable
                        </span>
                      )}
                      {promo.aplica_todo ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          <GlobeAltIcon className="w-3 h-3" />Todo el catálogo
                        </span>
                      ) : (
                        promo.alcances &&
                        [...new Set(promo.alcances.map((a) => a.tipo_alcance_id))].map((t) => (
                          <AlcanceBadge key={t} tipo={t} />
                        ))
                      )}
                    </div>
                    {promo.descripcion && (
                      <p className="text-sm text-gray-500 mb-2 truncate">{promo.descripcion}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        📅 {new Date(promo.fecha_inicio).toLocaleDateString('es-PE')}
                        {promo.fecha_fin
                          ? ` → ${new Date(promo.fecha_fin).toLocaleDateString('es-PE')}`
                          : ' → Sin vencimiento'}
                      </span>
                      <span className="flex items-center">
                        📦 {resumenAlcance(promo)}
                        {!promo.aplica_todo && promo.alcances?.length > 0 && (
                          <TooltipAlcances alcances={promo.alcances} catalogo={catalogo} />
                        )}
                      </span>
                      <span>📋 {promo.reglas?.length || 0} regla(s)</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggle(promo)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all
                        ${promo.flg_activo
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                    >
                      {promo.flg_activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => { setPromoEditando(promo); setModalAbierto(true); }}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmEliminar(promo.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {modalAbierto && (
        <ModalPromocion
          key={promoEditando?.id || 'nueva'}
          promo={promoEditando}
          catalogo={catalogo}
          tiposCatalogo={tiposCatalogo}
          onClose={() => {
            setModalAbierto(false);
            setPromoEditando(null);
            setError('');
          }}
          onSaved={handleSaved}
        />
      )}

      {/* Confirm eliminar */}
      {confirmEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <TrashIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">¿Eliminar promoción?</h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmEliminar(null)}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPromocionesPage;