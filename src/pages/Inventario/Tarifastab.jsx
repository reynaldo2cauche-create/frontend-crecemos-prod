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
  CurrencyDollarIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import {
  getTarifas,
  crearTarifa,
  actualizarTarifa,
  desactivarTarifa,
  activarTarifa,
  getPreciosPaquetesByServicioTarifa,
  crearPrecioPaquete,
  actualizarPrecioPaquete,
  eliminarPrecioPaquete,
} from '../../services/inventarioService';
import { getServicios, getPaquetes } from '../../services/serviciosService';
import { getMotivosCita } from '../../services/citaService';
import ModalPreciosPaquetes from './ModalPreciosPaquetes';

const EMPTY_FORM = {
  servicio_id: '',
  motivo_cita_id: '',
  precio: '',
};

// ─── Sub-componentes ─────────────────────────────────────────────────────────

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

// ─── Modal crear / editar ────────────────────────────────────────────────────

const TarifaModal = ({ tarifa, servicios, motivos, onClose, onSaved }) => {
  const [form, setForm] = useState(
    tarifa
      ? {
          servicio_id:    tarifa.servicio_id    ?? '',
          motivo_cita_id: tarifa.motivo_cita_id ?? '',
          precio:         tarifa.precio         ?? '',
        }
      : { ...EMPTY_FORM },
  );
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const isEdit = !!tarifa;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['servicio_id', 'motivo_cita_id'];
    setForm((f) => ({
      ...f,
      [name]: numericFields.includes(name)
        ? value === '' ? '' : parseInt(value, 10)
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user    = JSON.parse(localStorage.getItem('user') || '{}');
      const payload = {
        servicio_id:    parseInt(form.servicio_id, 10),
        motivo_cita_id: parseInt(form.motivo_cita_id, 10),
        precio:         parseFloat(form.precio),
      };

      if (isEdit) {
        await actualizarTarifa(tarifa.id, { precio: payload.precio, user_actua_id: user?.id });
      } else {
        await crearTarifa({ ...payload, user_crea_id: user?.id });
      }
      onSaved();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data) ? err.response.data.join(', ') : null) ||
        err?.message ||
        'Error al guardar la tarifa';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] transition-all';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7B1FA2]/10 flex items-center justify-center">
              <CurrencyDollarIcon className="w-4 h-4 text-[#7B1FA2]" />
            </div>
            <h2 className="font-bold text-gray-900">{isEdit ? 'Editar Tarifa' : 'Nueva Tarifa'}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className={labelClass}>Servicio *</label>
             <select
  name="servicio_id"
  value={form.servicio_id}
  onChange={handleChange}
  required
  disabled={isEdit}
  className={`${inputClass} ${isEdit ? 'bg-gray-50 cursor-not-allowed' : ''}`}
>
  <option value="">Seleccionar servicio...</option>
  {(() => {
    const agrupados = {};
    servicios.forEach(s => {
      const areaNombre = s.area?.nombre || 'Otros';
      if (!agrupados[areaNombre]) agrupados[areaNombre] = [];
      agrupados[areaNombre].push(s);
    });
    const ordenAreas = ['Área Infantil', 'Área Adolescentes y Adultos', 'Otros'];
    const areasOrdenadas = Object.keys(agrupados).sort((a, b) => {
      const indexA = ordenAreas.indexOf(a);
      const indexB = ordenAreas.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
    return areasOrdenadas.map(areaNombre => (
      <optgroup key={areaNombre} label={areaNombre}>
        {agrupados[areaNombre].map(s => (
          <option key={s.id} value={s.id}>{s.nombre}</option>
        ))}
      </optgroup>
    ));
  })()}
</select>
              {isEdit && (
                <p className="text-xs text-gray-400 mt-1">El servicio no se puede cambiar. Crea una nueva tarifa si lo necesitas.</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Motivo de Cita *</label>
              <select
                name="motivo_cita_id"
                value={form.motivo_cita_id}
                onChange={handleChange}
                required
                disabled={isEdit}
                className={`${inputClass} ${isEdit ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              >
                <option value="">Seleccionar motivo...</option>
                {motivos.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Precio (S/) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="precio"
                value={form.precio}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="0.00"
              />
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
              {loading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Tarifa'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

// ─── Componente principal ────────────────────────────────────────────────────

const TarifasTab = () => {
  const [tarifas, setTarifas]           = useState([]);
  const [servicios, setServicios]       = useState([]);
  const [motivos, setMotivos]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [busqueda, setBusqueda]         = useState('');
  const [filtroServicio, setFiltroServicio] = useState('');
  const [modal, setModal]               = useState(null); // null | 'crear' | tarifa
  const [modalPaquetes, setModalPaquetes] = useState(null); // null | tarifa
  const [confirmToggle, setConfirmToggle]   = useState(null);
  const [accionLoading, setAccionLoading]   = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const normalizar = (items) =>
    items.map((t) => ({ ...t, activo: t.activo ?? Boolean(t.flg_activo) }));

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [tarifasData, serviciosData, motivosData] = await Promise.all([
        getTarifas(mostrarTodos),
        getServicios(),
        getMotivosCita(),
      ]);
      setTarifas(normalizar(tarifasData));
      setServicios(serviciosData);
      setMotivos(motivosData);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, [mostrarTodos]);

  // Enriquecer tarifas con nombre de servicio y motivo desde las props
  const tarifasEnriquecidas = tarifas.map((t) => ({
    ...t,
    _servicio: servicios.find((s) => s.id === t.servicio_id),
    _motivo:   motivos.find((m) => m.id === t.motivo_cita_id),
  }));

  const tarifasFiltradas = tarifasEnriquecidas.filter((t) => {
    const textoBusqueda = busqueda.toLowerCase();
    const coincideTexto =
      !busqueda ||
      t._servicio?.nombre?.toLowerCase().includes(textoBusqueda) ||
      t._motivo?.nombre?.toLowerCase().includes(textoBusqueda);
    const coincideServicio =
      !filtroServicio || String(t.servicio_id) === filtroServicio;
    return coincideTexto && coincideServicio;
  });

  const handleToggleEstado = async () => {
    if (!confirmToggle) return;
    setAccionLoading(true);
    try {
      if (confirmToggle.activo) {
        await desactivarTarifa(confirmToggle.id, user?.id);
      } else {
        await activarTarifa(confirmToggle.id, user?.id);
      }
      setConfirmToggle(null);
      cargarDatos();
    } catch {
      alert('Error al cambiar el estado de la tarifa');
    } finally {
      setAccionLoading(false);
    }
  };

  // Stats
  const activas   = tarifas.filter((t) => t.activo).length;
  const inactivas = tarifas.filter((t) => !t.activo).length;
  const serviciosUnicos = [...new Set(tarifas.map((t) => t.servicio_id))].length;

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tarifas de Servicios</h2>
        <p className="text-sm text-gray-500 mt-1">Precios por servicio y motivo de cita</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7B1FA2]/10 rounded-xl flex items-center justify-center">
              <TagIcon className="w-5 h-5 text-[#7B1FA2]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{tarifas.length}</div>
              <div className="text-xs text-gray-500 font-medium">Total tarifas</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{activas}</div>
              <div className="text-xs text-gray-500 font-medium">Activas</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{serviciosUnicos}</div>
              <div className="text-xs text-gray-500 font-medium">Servicios con tarifa</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por servicio o motivo..."
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] w-64 transition-all"
            />
          </div>

          {/* Filtro por servicio */}
          {servicios.length > 0 && (
            <select
              value={filtroServicio}
              onChange={(e) => setFiltroServicio(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2] transition-all"
            >
              <option value="">Todos los servicios</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setMostrarTodos(!mostrarTodos)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
              mostrarTodos
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {mostrarTodos ? 'Mostrando todos' : 'Ver inactivas'}
          </button>
        </div>

        <button
          onClick={() => setModal('crear')}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] rounded-xl hover:shadow-lg transition-all"
        >
          <PlusIcon className="w-4 h-4" />
          Nueva Tarifa
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin" />
          </div>
        ) : tarifasFiltradas.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <TagIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No se encontraron tarifas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Servicio</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Área</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Motivo de Cita</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Precio</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tarifasFiltradas.map((t) => (
                  <tr
                    key={t.id}
                    className={`hover:bg-gray-50 transition-colors ${!t.activo ? 'opacity-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {t._servicio?.nombre ?? `Servicio #${t.servicio_id}`}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                        {t._servicio?.area?.nombre ?? '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {t._motivo?.nombre ?? `Motivo #${t.motivo_cita_id}`}
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-gray-900">
                      S/ {parseFloat(t.precio || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge activo={t.activo} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setModal(t)}
                          title="Editar precio base"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#7B1FA2] hover:bg-purple-50 transition-colors"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setModalPaquetes(t)}
                          title="Configurar precios por paquete"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <TagIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmToggle(t)}
                          title={t.activo ? 'Desactivar' : 'Activar'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            t.activo
                              ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                              : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {t.activo
                            ? <XCircleIcon className="w-4 h-4" />
                            : <CheckCircleIcon className="w-4 h-4" />}
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
          {tarifasFiltradas.length} tarifa{tarifasFiltradas.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Modal crear / editar */}
      {modal && (
        <TarifaModal
          tarifa={modal === 'crear' ? null : modal}
          servicios={servicios}
          motivos={motivos}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); cargarDatos(); }}
        />
      )}

      {/* Modal precios por paquete */}
      {modalPaquetes && (
        <ModalPreciosPaquetes
          tarifa={modalPaquetes}
          onClose={() => setModalPaquetes(null)}
          onSaved={() => { cargarDatos(); }}
        />
      )}

      {/* Confirm toggle estado */}
      {confirmToggle && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
              confirmToggle.activo ? 'bg-red-100' : 'bg-green-100'
            }`}>
              {confirmToggle.activo
                ? <XCircleIcon className="w-6 h-6 text-red-600" />
                : <CheckCircleIcon className="w-6 h-6 text-green-600" />}
            </div>
            <h3 className="text-center font-bold text-gray-900 mb-2">
              {confirmToggle.activo ? 'Desactivar tarifa' : 'Activar tarifa'}
            </h3>
            <p className="text-center text-sm text-gray-500 mb-6">
              ¿Confirmas {confirmToggle.activo ? 'desactivar' : 'activar'} la tarifa de{' '}
              <strong>
                {confirmToggle._servicio?.nombre ?? `Servicio #${confirmToggle.servicio_id}`}
              </strong>{' '}
              para{' '}
              <strong>
                {confirmToggle._motivo?.nombre ?? `Motivo #${confirmToggle.motivo_cita_id}`}
              </strong>?
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
        document.body,
      )}
    </div>
  );
};

export default TarifasTab;