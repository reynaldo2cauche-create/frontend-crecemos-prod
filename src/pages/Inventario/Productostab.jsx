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
  CubeIcon,
  BuildingOfficeIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getProductos,
  crearProducto,
  actualizarProducto,
  desactivarProducto,
  activarProducto,
  getProductosStockBajo,
  getCategorias,
  getProveedores,
  getTiposProducto,
} from '../../services/inventarioService';

const EMPTY_FORM = {
  nombre: '',
  descripcion: '',
  categoria_id: '',
  proveedor_id: '',
  tipo_producto_id: '',
  stock_actual: 0,
  stock_minimo: 5,
  precio_compra: '',
  precio_venta: '',
  unidad_medida: '',
};

// Fallback por si el backend no tiene endpoint de tipos
const TIPOS_FALLBACK = [
  { id: 1, nombre: 'Para venta' },
  { id: 2, nombre: 'Uso interno' },
];

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

const StockBadge = ({ stock, minimo }) => {
  if (stock === 0)
    return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">Sin stock</span>;
  if (stock <= minimo)
    return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Stock bajo</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">OK</span>;
};

const TipoBadge = ({ tipo }) => {
  if (!tipo) return <span className="text-gray-400">—</span>;
  const esVenta = tipo.id === 1 || tipo.nombre?.toLowerCase().includes('venta');
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
      esVenta ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
    }`}>
      {tipo.nombre}
    </span>
  );
};

const ProductoModal = ({ producto, categorias, proveedores, tiposProducto, onClose, onSaved }) => {
  const [form, setForm] = useState(producto ? {
    nombre:           producto.nombre           ?? '',
    descripcion:      producto.descripcion      ?? '',
    categoria_id:     producto.categoria_id     ?? producto.categoria?.id     ?? '',
    proveedor_id:     producto.proveedor_id     ?? producto.proveedor?.id     ?? '',
    tipo_producto_id: producto.tipo_producto_id ?? producto.tipo_producto?.id ?? '',
    stock_actual:     producto.stock_actual     ?? 0,
    stock_minimo:     producto.stock_minimo     ?? 5,
    precio_compra:    producto.precio_compra    ?? '',
    precio_venta:     producto.precio_venta     ?? '',
    unidad_medida:    producto.unidad_medida    ?? '',
  } : { ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!producto;

  const handleChange = e => {
    const { name, value } = e.target;
    // Convertir a número los IDs y campos numéricos
    const numericFields = ['categoria_id', 'proveedor_id', 'tipo_producto_id', 'stock_actual', 'stock_minimo'];
    const priceFields = ['precio_compra', 'precio_venta'];

    let finalValue = value;
    if (numericFields.includes(name)) {
      finalValue = value === '' ? '' : parseInt(value, 10);
    } else if (priceFields.includes(name)) {
      finalValue = value === '' ? '' : parseFloat(value);
    }

    setForm(f => ({ ...f, [name]: finalValue }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Obtener user_id del localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Preparar el payload limpiando valores vacíos y convirtiendo tipos
      const payload = {
        nombre: form.nombre?.trim(),
        categoria_id: parseInt(form.categoria_id, 10),
        precio_venta: parseFloat(form.precio_venta),
        stock_actual: parseInt(form.stock_actual, 10) || 0,
        stock_minimo: parseInt(form.stock_minimo, 10) || 5,
      };

      // Agregar tipo_producto_id solo si tiene valor (es opcional en el backend)
      if (form.tipo_producto_id && form.tipo_producto_id !== '') {
        payload.tipo_producto_id = parseInt(form.tipo_producto_id, 10);
      }

      // Agregar campos opcionales solo si tienen valor (NOTA: 'codigo' no existe en el backend)
      if (form.descripcion?.trim()) payload.descripcion = form.descripcion.trim();
      if (form.unidad_medida?.trim()) payload.unidad_medida = form.unidad_medida.trim();
      if (form.proveedor_id && form.proveedor_id !== '') {
        payload.proveedor_id = parseInt(form.proveedor_id, 10);
      }
      if (form.precio_compra && form.precio_compra !== '') {
        payload.precio_compra = parseFloat(form.precio_compra);
      }

      console.log('=== PRODUCTO MODAL ===');
      console.log('Form data:', form);
      console.log('Payload a enviar:', payload);
      console.log('Es edición?', isEdit);
      if (isEdit) console.log('ID del producto:', producto.id);

      if (isEdit) {
        const updatePayload = {
          ...payload,
          user_actua_id: user?.id
        };
        console.log('UPDATE Payload:', updatePayload);
        await actualizarProducto(producto.id, updatePayload);
      } else {
        const createPayload = {
          ...payload,
          user_crea_id: user?.id
        };
        console.log('CREATE Payload:', createPayload);
        await crearProducto(createPayload);
      }
      console.log('Guardado exitosamente');
      onSaved();
    } catch (err) {
      console.error('❌ Error completo al guardar producto:', err);
      console.error('Response data:', err?.response?.data);
      console.error('Response status:', err?.response?.status);

      // Mostrar mensaje de error más detallado
      let errorMsg = 'Error al guardar el producto';
      if (err?.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (Array.isArray(err?.response?.data)) {
        errorMsg = err.response.data.join(', ');
      } else if (err?.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] transition-all';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7B1FA2]/10 flex items-center justify-center">
              <CubeIcon className="w-4 h-4 text-[#7B1FA2]" />
            </div>
            <h2 className="font-bold text-gray-900">{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body y Footer en un solo form */}
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
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Ej. Pelota sensorial grande"
                />
              </div>

              <div>
                <label className={labelClass}>Unidad de medida</label>
                <input
                  name="unidad_medida"
                  value={form.unidad_medida}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Ej. unidad, caja, kg"
                />
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
                <label className={labelClass}>Proveedor</label>
                <select name="proveedor_id" value={form.proveedor_id} onChange={handleChange} className={inputClass}>
                  <option value="">Sin proveedor</option>
                  {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass}>Precio de Compra (S/)</label>
                <input
                  type="number" step="0.01" min="0"
                  name="precio_compra"
                  value={form.precio_compra}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className={labelClass}>Precio de Venta (S/) *</label>
                <input
                  type="number" step="0.01" min="0"
                  name="precio_venta"
                  value={form.precio_venta}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className={labelClass}>Stock Actual</label>
                <input
                  type="number" min="0"
                  name="stock_actual"
                  value={form.stock_actual}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Stock Mínimo</label>
                <input
                  type="number" min="0"
                  name="stock_minimo"
                  value={form.stock_minimo}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Descripción</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                  placeholder="Descripción opcional del producto..."
                />
              </div>
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
              {loading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

const ProductosTab = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [tiposProducto, setTiposProducto] = useState(TIPOS_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [soloStockBajo, setSoloStockBajo] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null);
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [accionLoading, setAccionLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  // Nuevo: filtro por tipo de producto (1=venta, 2=uso interno, null=todos)
  const [filtroTipo, setFiltroTipo] = useState(1); // Por defecto mostrar "Para venta"

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Normaliza flg_activo (0|1) → activo (bool) por si el backend no lo mapea
  const normalizar = (prods) =>
    prods.map(p => ({ ...p, activo: p.activo ?? Boolean(p.flg_activo) }));

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [prods, cats, provs, tipos] = await Promise.all([
        soloStockBajo ? getProductosStockBajo() : getProductos(mostrarTodos),
        getCategorias(true),
        getProveedores(true),
        getTiposProducto().catch(() => TIPOS_FALLBACK),
      ]);
      setProductos(normalizar(prods));
      setCategorias(cats);
      setProveedores(provs);
      setTiposProducto(tipos?.length ? tipos : TIPOS_FALLBACK);
    } catch (err) {
      console.error('Error cargando inventario:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, [mostrarTodos, soloStockBajo]);

  const productosFiltrados = productos.filter(p => {
    // Filtro por búsqueda
    const coincideBusqueda = p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(busqueda.toLowerCase());

    // Filtro por tipo de producto
    const coincideTipo = filtroTipo === null || p.tipo_producto_id === filtroTipo;

    return coincideBusqueda && coincideTipo;
  });

  // Paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / registrosPorPagina);
  const indexUltimo = paginaActual * registrosPorPagina;
  const indexPrimero = indexUltimo - registrosPorPagina;
  const productosPaginados = productosFiltrados.slice(indexPrimero, indexUltimo);

  // Resetear a página 1 cuando cambia el filtro
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, mostrarTodos, soloStockBajo, filtroTipo]);

  const handleToggleEstado = async () => {
    if (!confirmToggle) return;
    setAccionLoading(true);
    try {
      if (confirmToggle.activo) {
        await desactivarProducto(confirmToggle.id, user?.id);
      } else {
        await activarProducto(confirmToggle.id, user?.id);
      }
      setConfirmToggle(null);
      cargarDatos();
    } catch {
      alert('Error al cambiar el estado del producto');
    } finally {
      setAccionLoading(false);
    }
  };

  // Estadísticas generales (filtradas por tipo si aplica)
  const productosParaStats = filtroTipo === null
    ? productos
    : productos.filter(p => p.tipo_producto_id === filtroTipo);

  const stockBajoCount = productosParaStats.filter(p => p.activo && p.stock_actual <= p.stock_minimo).length;
  const activos = productosParaStats.filter(p => p.activo).length;
  const sinStock = productosParaStats.filter(p => p.activo && p.stock_actual === 0).length;

  // Estadísticas separadas por tipo
  const productosVenta = productos.filter(p => p.tipo_producto_id === 1);
  const productosUsoInterno = productos.filter(p => p.tipo_producto_id === 2);

  const statsVenta = {
    total: productosVenta.length,
    activos: productosVenta.filter(p => p.activo).length,
    stockBajo: productosVenta.filter(p => p.activo && p.stock_actual <= p.stock_minimo).length,
    sinStock: productosVenta.filter(p => p.activo && p.stock_actual === 0).length,
  };

  const statsUsoInterno = {
    total: productosUsoInterno.length,
    activos: productosUsoInterno.filter(p => p.activo).length,
    stockBajo: productosUsoInterno.filter(p => p.activo && p.stock_actual <= p.stock_minimo).length,
    sinStock: productosUsoInterno.filter(p => p.activo && p.stock_actual === 0).length,
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Productos</h2>
        <p className="text-sm text-gray-500 mt-1">Gestión de productos e inventario</p>
      </div>

     {/* Filtro por Tipo de Producto */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFiltroTipo(1)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition-all ${
            filtroTipo === 1
              ? 'bg-[#7B1FA2] text-white border-[#7B1FA2] shadow-md'
              : 'bg-white text-gray-600 border-gray-200 hover:border-[#7B1FA2] hover:text-[#7B1FA2]'
          }`}
        >
          <CubeIcon className="w-4 h-4" />
          Para Venta ({statsVenta.total})
        </button>

        <button
          onClick={() => setFiltroTipo(2)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition-all ${
            filtroTipo === 2
              ? 'bg-[#7B1FA2] text-white border-[#7B1FA2] shadow-md'
              : 'bg-white text-gray-600 border-gray-200 hover:border-[#7B1FA2] hover:text-[#7B1FA2]'
          }`}
        >
          <BuildingOfficeIcon className="w-4 h-4" />
          Uso Interno ({statsUsoInterno.total})
        </button>

        <button
          onClick={() => setFiltroTipo(null)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition-all ${
            filtroTipo === null
              ? 'bg-[#7B1FA2] text-white border-[#7B1FA2] shadow-md'
              : 'bg-white text-gray-600 border-gray-200 hover:border-[#7B1FA2] hover:text-[#7B1FA2]'
          }`}
        >
          <Squares2X2Icon className="w-4 h-4" />
          Ver Todos ({productos.length})
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7B1FA2]/10 rounded-xl flex items-center justify-center">
              <CubeIcon className="w-5 h-5 text-[#7B1FA2]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{productosParaStats.length}</div>
              <div className="text-xs text-gray-500 font-medium">
                Total{filtroTipo === 1 ? ' (Venta)' : filtroTipo === 2 ? ' (Uso Interno)' : ''}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{activos}</div>
              <div className="text-xs text-gray-500 font-medium">Activos</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stockBajoCount}</div>
              <div className="text-xs text-gray-500 font-medium">Stock bajo</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <XCircleIcon className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{sinStock}</div>
              <div className="text-xs text-gray-500 font-medium">Sin stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta stock bajo */}
      {stockBajoCount > 0 && !soloStockBajo && (
        <div
          className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors"
          onClick={() => setSoloStockBajo(true)}
        >
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-amber-800">
            {stockBajoCount} producto{stockBajoCount > 1 ? 's' : ''} con stock bajo o sin stock.{' '}
            <span className="underline">Ver ahora</span>
          </p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar producto..."
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] w-56 transition-all"
            />
          </div>
          <button
            onClick={() => setSoloStockBajo(!soloStockBajo)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
              soloStockBajo
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:text-amber-700'
            }`}
          >
            <ExclamationTriangleIcon className="w-3.5 h-3.5" />
            Stock bajo
          </button>
          <button
            onClick={() => { setMostrarTodos(!mostrarTodos); setSoloStockBajo(false); }}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
              mostrarTodos
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {mostrarTodos ? 'Mostrando todos' : 'Ver inactivos'}
          </button>
        </div>
        <button
          onClick={() => setModal('crear')}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] rounded-xl hover:shadow-lg transition-all"
        >
          <PlusIcon className="w-4 h-4" />
          Nuevo Producto
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin" />
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CubeIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No se encontraron productos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Producto</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Categoría</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Tipo</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Stock</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Precio Venta</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productosPaginados.map(p => (
                  <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${!p.activo ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{p.nombre}</p>
                        {p.codigo && <p className="text-xs text-gray-400">{p.codigo}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{p.categoria?.nombre || '—'}</td>
                    <td className="px-4 py-4">
                      <TipoBadge tipo={p.tipo_producto} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-gray-900">{p.stock_actual}</span>
                        <StockBadge stock={p.stock_actual} minimo={p.stock_minimo} />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-gray-900">
                      S/ {parseFloat(p.precio_venta || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge activo={p.activo} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setModal(p)}
                          title="Editar"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#7B1FA2] hover:bg-purple-50 transition-colors"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmToggle(p)}
                          title={p.activo ? 'Desactivar' : 'Activar'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            p.activo
                              ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                              : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {p.activo ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
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

      {/* Paginación */}
      {!loading && productosFiltrados.length > 0 && (
        <div className="flex items-center justify-between px-4">
          <p className="text-xs text-gray-400">
            Mostrando {indexPrimero + 1}-{Math.min(indexUltimo, productosFiltrados.length)} de {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
          </p>

          <div className="flex items-center gap-2">
            <select
              value={registrosPorPagina}
              onChange={(e) => {
                setRegistrosPorPagina(Number(e.target.value));
                setPaginaActual(1);
              }}
              className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]"
            >
              <option value="10">10 por página</option>
              <option value="25">25 por página</option>
              <option value="50">50 por página</option>
              <option value="100">100 por página</option>
            </select>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPaginas <= 5) {
                    pageNum = i + 1;
                  } else if (paginaActual <= 3) {
                    pageNum = i + 1;
                  } else if (paginaActual >= totalPaginas - 2) {
                    pageNum = totalPaginas - 4 + i;
                  } else {
                    pageNum = paginaActual - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPaginaActual(pageNum)}
                      className={`min-w-[32px] px-2 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        paginaActual === pageNum
                          ? 'bg-[#7B1FA2] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear/editar */}
      {modal && (
        <ProductoModal
          producto={modal === 'crear' ? null : modal}
          categorias={categorias}
          proveedores={proveedores}
          tiposProducto={tiposProducto}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); cargarDatos(); }}
        />
      )}

      {/* Confirm toggle estado */}
      {confirmToggle && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${confirmToggle.activo ? 'bg-red-100' : 'bg-green-100'}`}>
              {confirmToggle.activo
                ? <XCircleIcon className="w-6 h-6 text-red-600" />
                : <CheckCircleIcon className="w-6 h-6 text-green-600" />}
            </div>
            <h3 className="text-center font-bold text-gray-900 mb-2">
              {confirmToggle.activo ? 'Desactivar producto' : 'Activar producto'}
            </h3>
            <p className="text-center text-sm text-gray-500 mb-6">
              ¿Estás seguro de que deseas {confirmToggle.activo ? 'desactivar' : 'activar'}{' '}
              <strong>{confirmToggle.nombre}</strong>?
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
        document.body
      )}
    </div>
  );
};

export default ProductosTab;