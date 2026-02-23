import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  XCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  TagIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  getCategorias,
  crearCategoria,
  actualizarCategoria,
  desactivarCategoria,
  activarCategoria,
} from '../../services/inventarioService';

const normalizar = (cats) =>
  cats.map(c => ({ ...c, activo: c.activo ?? Boolean(c.flg_activo) }));

const Badge = ({ activo }) =>
  activo ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Activo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />Inactivo
    </span>
  );

const CategoriaModal = ({ categoria, onClose, onSaved }) => {
  const [form, setForm] = useState({ nombre: categoria?.nombre || '', descripcion: categoria?.descripcion || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!categoria;

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      isEdit ? await actualizarCategoria(categoria.id, form) : await crearCategoria(form);
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] transition-all';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7B1FA2]/10 flex items-center justify-center">
              <TagIcon className="w-4 h-4 text-[#7B1FA2]" />
            </div>
            <h2 className="font-bold text-gray-900">{isEdit ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre *</label>
            <input
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              required
              className={inputClass}
              placeholder="Ej. Materiales sensoriales"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              rows={3}
              className={inputClass}
              placeholder="Descripción opcional..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] disabled:opacity-50 transition-colors">
              {loading ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

const CategoriasTab = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null);
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [accionLoading, setAccionLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getCategorias(mostrarTodos);
      setCategorias(normalizar(data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [mostrarTodos]);

  const handleToggle = async () => {
    setAccionLoading(true);
    try {
      confirmToggle.activo
        ? await desactivarCategoria(confirmToggle.id, user?.id)
        : await activarCategoria(confirmToggle.id, user?.id);
      setConfirmToggle(null);
      cargar();
    } catch {
      alert('Error al cambiar estado');
    } finally {
      setAccionLoading(false);
    }
  };

  const categoriasFiltradas = categorias.filter(c =>
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const activos = categorias.filter(c => c.activo).length;
  const inactivos = categorias.filter(c => !c.activo).length;

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Categorías</h2>
        <p className="text-sm text-gray-500 mt-1">Organización de productos por categoría</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7B1FA2]/10 rounded-xl flex items-center justify-center">
              <TagIcon className="w-5 h-5 text-[#7B1FA2]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{categorias.length}</div>
              <div className="text-xs text-gray-500 font-medium">Total</div>
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
              <div className="text-xs text-gray-500 font-medium">Activas</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <XCircleIcon className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{inactivos}</div>
              <div className="text-xs text-gray-500 font-medium">Inactivas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar categoría..."
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] w-52 transition-all"
            />
          </div>
          <button
            onClick={() => setMostrarTodos(!mostrarTodos)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
              mostrarTodos ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
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
          Nueva Categoría
        </button>
      </div>

      {/* Grid de categorías */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin" />
        </div>
      ) : categoriasFiltradas.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <TagIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No se encontraron categorías</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categoriasFiltradas.map(cat => (
            <div
              key={cat.id}
              className={`bg-white rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${
                cat.activo ? 'border-gray-200' : 'border-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#7B1FA2]/10 flex items-center justify-center">
                  <TagIcon className="w-4 h-4 text-[#7B1FA2]" />
                </div>
                <Badge activo={cat.activo} />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{cat.nombre}</h3>
              {cat.descripcion && <p className="text-xs text-gray-500 line-clamp-2">{cat.descripcion}</p>}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setModal(cat)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-[#7B1FA2] bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <PencilSquareIcon className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => setConfirmToggle(cat)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    cat.activo ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'
                  }`}
                >
                  {cat.activo ? <XCircleIcon className="w-3.5 h-3.5" /> : <CheckCircleIcon className="w-3.5 h-3.5" />}
                  {cat.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contador */}
      {!loading && categorias.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          {categoriasFiltradas.length} categoría{categoriasFiltradas.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Modal crear/editar */}
      {modal && (
        <CategoriaModal
          categoria={modal === 'crear' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); cargar(); }}
        />
      )}

      {/* Confirm toggle */}
      {confirmToggle && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${confirmToggle.activo ? 'bg-red-100' : 'bg-green-100'}`}>
              {confirmToggle.activo
                ? <XCircleIcon className="w-6 h-6 text-red-600" />
                : <CheckCircleIcon className="w-6 h-6 text-green-600" />}
            </div>
            <h3 className="text-center font-bold text-gray-900 mb-2">
              {confirmToggle.activo ? 'Desactivar categoría' : 'Activar categoría'}
            </h3>
            <p className="text-center text-sm text-gray-500 mb-6">
              ¿Confirmas {confirmToggle.activo ? 'desactivar' : 'activar'} <strong>{confirmToggle.nombre}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmToggle(null)}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleToggle}
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

export default CategoriasTab;