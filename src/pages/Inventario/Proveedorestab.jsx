import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  PlusIcon, MagnifyingGlassIcon, PencilSquareIcon, XCircleIcon, CheckCircleIcon,
  XMarkIcon, TruckIcon, ExclamationTriangleIcon, PhoneIcon, EnvelopeIcon,
} from '@heroicons/react/24/outline';
import {
  getProveedores, crearProveedor, actualizarProveedor,
  desactivarProveedor, activarProveedor,
} from '../../services/inventarioService';

const normalizar = (provs) =>
  provs.map(p => ({ ...p, activo: p.activo ?? Boolean(p.flg_activo) }));

const Badge = ({ activo }) => activo ? (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Activo
  </span>
) : (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">
    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />Inactivo
  </span>
);

const EMPTY = { nombre: '', contacto: '', telefono: '', email: '' };

const ProveedorModal = ({ proveedor, onClose, onSaved }) => {
  const [form, setForm] = useState(proveedor ? {
    nombre:   proveedor.nombre   ?? '',
    contacto: proveedor.contacto ?? '',
    telefono: proveedor.telefono ?? '',
    email:    proveedor.email    ?? '',
  } : { ...EMPTY });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!proveedor;

  const inputClass = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] transition-all bg-gray-50';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1.5';

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await actualizarProveedor(proveedor.id, { ...form, user_actua_id: user?.id });
      } else {
        await crearProveedor({ ...form, user_crea_id: user?.id });
      }
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#7B1FA2]/10 flex items-center justify-center">
              <TruckIcon className="w-5 h-5 text-[#7B1FA2]" />
            </div>
            <h2 className="font-bold text-gray-900">{isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Nombre / Razón Social *</label>
              <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required className={inputClass} placeholder="Ej. Distribuidora ABC SAC" />
            </div>
            <div>
              <label className={labelClass}>Nombre de Contacto</label>
              <input value={form.contacto} onChange={e => setForm(f => ({ ...f, contacto: e.target.value }))} className={inputClass} placeholder="Persona de contacto" />
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} className={inputClass} placeholder="9XXXXXXXX" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputClass} placeholder="correo@empresa.com" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] rounded-xl hover:shadow-lg disabled:opacity-50 transition-all">
              {loading ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

const ProveedoresTab = () => {
  const [proveedores, setProveedores] = useState([]);
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
      const data = await getProveedores(mostrarTodos);
      setProveedores(normalizar(data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [mostrarTodos]);

  const handleToggle = async () => {
    setAccionLoading(true);
    try {
      confirmToggle.activo
        ? await desactivarProveedor(confirmToggle.id, user?.id)
        : await activarProveedor(confirmToggle.id, user?.id);
      setConfirmToggle(null);
      cargar();
    } catch {
      alert('Error al cambiar estado');
    } finally {
      setAccionLoading(false);
    }
  };

  const proveedoresFiltrados = proveedores.filter(p =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.contacto?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.email?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const activos = proveedores.filter(p => p.activo).length;
  const inactivos = proveedores.filter(p => !p.activo).length;

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Proveedores</h2>
        <p className="text-sm text-gray-500 mt-1">Gestión de proveedores del inventario</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7B1FA2]/10 rounded-xl flex items-center justify-center">
              <TruckIcon className="w-5 h-5 text-[#7B1FA2]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{proveedores.length}</div>
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
              <div className="text-xs text-gray-500 font-medium">Activos</div>
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
              <div className="text-xs text-gray-500 font-medium">Inactivos</div>
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
              placeholder="Buscar proveedor..."
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] w-52 transition-all"
            />
          </div>
          <button
            onClick={() => setMostrarTodos(!mostrarTodos)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
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
          Nuevo Proveedor
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin" />
          </div>
        ) : proveedoresFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <TruckIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No se encontraron proveedores</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Proveedor</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Contacto</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {proveedoresFiltrados.map(p => (
                  <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${!p.activo ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#7B1FA2]/10 flex items-center justify-center flex-shrink-0">
                          <TruckIcon className="w-4 h-4 text-[#7B1FA2]" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{p.nombre}</p>
                          {p.direccion && <p className="text-xs text-gray-400 truncate max-w-[200px]">{p.direccion}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-0.5">
                        {p.contacto && <p className="text-sm text-gray-700">{p.contacto}</p>}
                        {p.telefono && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <PhoneIcon className="w-3 h-3" />{p.telefono}
                          </div>
                        )}
                        {p.email && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <EnvelopeIcon className="w-3 h-3" />{p.email}
                          </div>
                        )}
                        {!p.contacto && !p.telefono && !p.email && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge activo={p.activo} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setModal(p)} className="p-1.5 rounded-lg text-gray-500 hover:text-[#7B1FA2] hover:bg-purple-50 transition-colors">
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmToggle(p)}
                          className={`p-1.5 rounded-lg transition-colors ${p.activo ? 'text-gray-500 hover:text-red-600 hover:bg-red-50' : 'text-gray-500 hover:text-green-600 hover:bg-green-50'}`}
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

      {/* Contador */}
      {!loading && (
        <p className="text-xs text-gray-400 text-right">
          {proveedoresFiltrados.length} proveedor{proveedoresFiltrados.length !== 1 ? 'es' : ''}
        </p>
      )}

      {/* Modal crear/editar */}
      {modal && (
        <ProveedorModal
          proveedor={modal === 'crear' ? null : modal}
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
              {confirmToggle.activo ? 'Desactivar proveedor' : 'Activar proveedor'}
            </h3>
            <p className="text-center text-sm text-gray-500 mb-6">
              ¿Confirmas {confirmToggle.activo ? 'desactivar' : 'activar'} <strong>{confirmToggle.nombre}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmToggle(null)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
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

export default ProveedoresTab;