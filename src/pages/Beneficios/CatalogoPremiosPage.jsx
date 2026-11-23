import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Gift, Calculator, Settings, Lightbulb, Search, Pencil, Trash2, Check, X,
  CheckCircle2, Image as ImageIcon, Info,
} from 'lucide-react';
import {
  getConfigBeneficios, actualizarConfigBeneficios,
  getPremios, guardarPremio, quitarPremio,
} from '../../services/beneficiosService';
import { getCategorias } from '../../services/inventarioService';

// Puntos = CEIL( (precio / (%/100)) / 100 ) * 100
const calcPuntos = (precio, pct) => {
  const pv = Number(precio), p = Number(pct);
  if (!pv || !p) return 0;
  return Math.ceil((pv / (p / 100)) / 100) * 100;
};

const PORCENTAJES = ['0.5', '1.0', '1.5', '2.0', '2.5', '3.0'];

const FORM_VACIO = {
  id: null, nombre: '', categoria_id: '', precio_venta: '', porcentaje_recompensa: '',
  precio_compra: '', stock_actual: '', disponible: true, imagen_url: '', codigo: '',
  puntos_manual: false, puntos_necesarios: '',
};

const CatalogoPremiosPage = () => {
  const [config, setConfig] = useState({ porcentaje_recompensa: 1 });
  const [categorias, setCategorias] = useState([]);
  const [premios, setPremios] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [busqueda, setBusqueda] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [notif, setNotif] = useState({ open: false, msg: '', tipo: 'success' });

  // Calculadora independiente (panel derecho)
  const [calc, setCalc] = useState({ precio: '50', porcentaje: '1.0' });

  const showNotif = (msg, tipo = 'success') => {
    setNotif({ open: true, msg, tipo });
    setTimeout(() => setNotif(n => ({ ...n, open: false })), 3500);
  };

  const cargar = useCallback(async () => {
    try {
      const [cfg, cats, prem] = await Promise.all([
        getConfigBeneficios(), getCategorias(), getPremios(busqueda || undefined),
      ]);
      setConfig(cfg || { porcentaje_recompensa: 1 });
      setCategorias(Array.isArray(cats) ? cats : []);
      setPremios(Array.isArray(prem) ? prem : []);
    } catch (e) {
      console.error('Error cargando beneficios:', e);
      showNotif('No se pudo cargar el catálogo', 'error');
    }
  }, [busqueda]);

  useEffect(() => { cargar(); }, [cargar]);

  // Puntos del formulario (en vivo)
  const pctEfectivo = form.porcentaje_recompensa || config.porcentaje_recompensa;
  const puntosForm = form.puntos_manual
    ? Math.ceil((Number(form.puntos_necesarios) || 0) / 100) * 100
    : calcPuntos(form.precio_venta, pctEfectivo);

  const puntosCalc = useMemo(() => calcPuntos(calc.precio, calc.porcentaje), [calc]);

  const editar = (p) => {
    setForm({
      id: p.id, nombre: p.nombre || '', categoria_id: p.categoria_id || '',
      precio_venta: p.precio_venta ?? '', porcentaje_recompensa: p.porcentaje_recompensa ?? '',
      precio_compra: p.precio_compra ?? '', stock_actual: p.stock_actual ?? '',
      disponible: p.flg_activo !== 0, imagen_url: p.imagen_url || '', codigo: p.codigo || '',
      puntos_manual: !!p.puntos_manual, puntos_necesarios: p.puntos_necesarios ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const guardar = async () => {
    if (!form.nombre.trim() || !form.precio_venta) {
      showNotif('Nombre y valor de venta son obligatorios', 'error');
      return;
    }
    setGuardando(true);
    try {
      await guardarPremio({
        id: form.id || undefined,
        nombre: form.nombre.trim(),
        categoria_id: Number(form.categoria_id) || null,
        precio_venta: Number(form.precio_venta),
        precio_compra: form.precio_compra !== '' ? Number(form.precio_compra) : null,
        stock_actual: form.stock_actual !== '' ? Number(form.stock_actual) : 0,
        porcentaje_recompensa: form.porcentaje_recompensa !== '' ? Number(form.porcentaje_recompensa) : null,
        puntos_manual: form.puntos_manual,
        puntos_necesarios: form.puntos_manual ? Number(form.puntos_necesarios) : undefined,
        disponible: form.disponible,
        imagen_url: form.imagen_url || null,
        codigo: form.codigo || null,
      });
      showNotif(form.id ? 'Producto actualizado' : 'Producto registrado');
      setForm(FORM_VACIO);
      await cargar();
    } catch (e) {
      showNotif(e.response?.data?.message || 'No se pudo guardar', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (p) => {
    if (!window.confirm(`¿Quitar "${p.nombre}" del catálogo de premios?`)) return;
    try {
      await quitarPremio(p.id);
      showNotif('Producto quitado del catálogo');
      await cargar();
    } catch (e) {
      showNotif('No se pudo quitar', 'error');
    }
  };

  const guardarConfig = async (nuevoPct) => {
    try {
      const cfg = await actualizarConfigBeneficios(Number(nuevoPct));
      setConfig(cfg);
      showNotif(`Porcentaje actualizado a ${Number(nuevoPct).toFixed(1)}%`);
    } catch (e) {
      showNotif('No se pudo actualizar el porcentaje', 'error');
    }
  };

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7B1FA2] focus:outline-none focus:ring-1 focus:ring-[#7B1FA2]';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {notif.open && (
        <div className="fixed top-6 right-6 z-[90000] flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3.5 shadow-lg">
          <div className={`h-1.5 w-1.5 rounded-full ${notif.tipo === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-700">{notif.msg}</span>
        </div>
      )}

      <div className="mx-auto max-w-[1300px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Cabecera */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] shadow-lg">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Catálogo de Premios</h1>
            <p className="text-sm text-gray-500">Registra y gestiona los productos que los pacientes pueden canjear con sus puntos.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ── Columna principal ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Formulario */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
                <Gift className="h-5 w-5 text-[#7B1FA2]" /> Registrar / Editar Producto
              </h2>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    {form.imagen_url
                      ? <img src={form.imagen_url} alt="" className="h-full w-full object-cover" />
                      : <ImageIcon className="h-10 w-10 text-gray-300" />}
                  </div>
                  <input
                    value={form.imagen_url}
                    onChange={e => setForm(f => ({ ...f, imagen_url: e.target.value }))}
                    placeholder="URL de imagen"
                    className="w-28 rounded-lg border border-gray-200 px-2 py-1 text-[11px] focus:border-[#7B1FA2] focus:outline-none"
                  />
                </div>

                <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Nombre del producto *</label>
                    <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Categoría</label>
                    <select value={form.categoria_id} onChange={e => setForm(f => ({ ...f, categoria_id: e.target.value }))} className={inputCls}>
                      <option value="">Seleccionar</option>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Valor de venta (S/) *</label>
                    <input type="number" step="0.01" value={form.precio_venta} onChange={e => setForm(f => ({ ...f, precio_venta: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">% de recompensa</label>
                    <select
                      value={form.porcentaje_recompensa || String(Number(config.porcentaje_recompensa).toFixed(1))}
                      onChange={e => setForm(f => ({ ...f, porcentaje_recompensa: e.target.value, puntos_manual: false }))}
                      className={inputCls}
                    >
                      {PORCENTAJES.map(p => <option key={p} value={p}>{p} %</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Puntos de canje</label>
                    <div className="flex items-center justify-center rounded-lg bg-purple-50 px-3 py-2 text-lg font-extrabold text-[#7B1FA2]">
                      {puntosForm.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Costo de adquisición (S/)</label>
                    <input type="number" step="0.01" value={form.precio_compra} onChange={e => setForm(f => ({ ...f, precio_compra: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Stock actual</label>
                    <input type="number" value={form.stock_actual} onChange={e => setForm(f => ({ ...f, stock_actual: e.target.value }))} className={inputCls} />
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, disponible: !f.disponible }))}
                      className={`relative h-6 w-11 rounded-full transition-colors ${form.disponible ? 'bg-[#A3C644]' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${form.disponible ? 'left-5' : 'left-0.5'}`} />
                    </button>
                    <span className="text-sm font-medium text-gray-700">{form.disponible ? 'Disponible' : 'No disponible'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-xl bg-purple-50/60 px-3.5 py-2.5 text-xs text-gray-600">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#7B1FA2]" />
                <span><b className="text-[#7B1FA2]">Cálculo automático:</b> Puntos = Valor de venta ÷ (Porcentaje / 100), redondeado al múltiplo de 100 hacia arriba.</span>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setForm(FORM_VACIO)} className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button onClick={guardar} disabled={guardando} className="rounded-lg bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] px-5 py-2 text-sm font-semibold text-white hover:shadow-md disabled:opacity-50">
                  {guardando ? 'Guardando…' : 'Guardar producto'}
                </button>
              </div>
            </div>

            {/* Tabla */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-base font-bold text-gray-900">Productos registrados ({premios.length})</h2>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar producto…" className="rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-[#7B1FA2] focus:outline-none" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                      <th className="py-2 pr-3">Producto</th>
                      <th className="py-2 pr-3">Categoría</th>
                      <th className="py-2 pr-3">Valor</th>
                      <th className="py-2 pr-3">% Recomp.</th>
                      <th className="py-2 pr-3">Puntos</th>
                      <th className="py-2 pr-3">Stock</th>
                      <th className="py-2 pr-3">Estado</th>
                      <th className="py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {premios.length === 0 ? (
                      <tr><td colSpan={8} className="py-8 text-center text-gray-400">Aún no hay productos en el catálogo de premios.</td></tr>
                    ) : premios.map(p => (
                      <tr key={p.id} className="border-b border-gray-50">
                        <td className="py-2.5 pr-3 font-medium text-gray-800">{p.nombre}</td>
                        <td className="py-2.5 pr-3 text-gray-500">{p.categoria?.nombre || '—'}</td>
                        <td className="py-2.5 pr-3 text-gray-700">{Number(p.precio_venta).toFixed(2)}</td>
                        <td className="py-2.5 pr-3 text-gray-500">{p.porcentaje_recompensa != null ? `${Number(p.porcentaje_recompensa).toFixed(1)}%` : `${Number(config.porcentaje_recompensa).toFixed(1)}%`}</td>
                        <td className="py-2.5 pr-3 font-bold text-[#7B1FA2]">{Number(p.puntos_necesarios).toLocaleString()}</td>
                        <td className="py-2.5 pr-3 text-gray-700">{p.stock_actual}</td>
                        <td className="py-2.5 pr-3">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.flg_activo !== 0 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {p.flg_activo !== 0 ? 'Disponible' : 'No disponible'}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <div className="flex gap-1.5">
                            <button onClick={() => editar(p)} className="rounded-lg p-1.5 text-gray-400 hover:bg-purple-50 hover:text-[#7B1FA2]"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => eliminar(p)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Columna derecha ── */}
          <div className="space-y-6">
            {/* Config */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
                <Settings className="h-5 w-5 text-[#7B1FA2]" /> Configuración del programa
              </h2>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Porcentaje de recompensa general</label>
              <select value={String(Number(config.porcentaje_recompensa).toFixed(1))} onChange={e => guardarConfig(e.target.value)} className={inputCls}>
                {PORCENTAJES.map(p => <option key={p} value={p}>{p} %</option>)}
              </select>
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-purple-50/60 px-3 py-2.5 text-xs text-gray-600">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#7B1FA2]" />
                <span>Se usa para calcular los puntos de canje de los productos (salvo los que tengan su propio %). Editable por gerencia.</span>
              </div>
            </div>

            {/* Calculadora */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
                <Calculator className="h-5 w-5 text-[#7B1FA2]" /> Calculadora de Puntos
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Valor del producto (S/)</label>
                  <input type="number" value={calc.precio} onChange={e => setCalc(c => ({ ...c, precio: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">% de recompensa</label>
                  <select value={calc.porcentaje} onChange={e => setCalc(c => ({ ...c, porcentaje: e.target.value }))} className={inputCls}>
                    {PORCENTAJES.map(p => <option key={p} value={p}>{p} %</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-[#A3C644]/15 py-4 text-center">
                <p className="text-xs font-semibold text-gray-500">Puntos de canje:</p>
                <p className="text-2xl font-extrabold text-[#5a7a0f]">{puntosCalc.toLocaleString()} <span className="text-sm">puntos</span></p>
              </div>
            </div>

            {/* Reglas */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
                <Lightbulb className="h-5 w-5 text-[#7B1FA2]" /> Reglas de cálculo
              </h2>
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  'Fórmula: Puntos = Valor de venta ÷ (Porcentaje / 100)',
                  'Porcentaje recomendado inicial: 1%',
                  'Redondeo: múltiplos de 100 puntos (hacia arriba)',
                  'El porcentaje puede ajustarse por gerencia.',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#A3C644]" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogoPremiosPage;
