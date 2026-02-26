import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  TagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  getPromociones,
  crearPromocion,
  actualizarPromocion,
  activarPromocion,
  desactivarPromocion,
  eliminarPromocion,
} from '../../services/promocionesService';

// Badge component
const Badge = ({ activo }) =>
  activo ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Activa
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />Inactiva
    </span>
  );

// Vigencia badge
const VigenciaBadge = ({ fechaInicio, fechaFin }) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Normalizar a medianoche

  const inicio = new Date(fechaInicio + 'T00:00:00'); // Forzar a medianoche local
  const fin = fechaFin ? new Date(fechaFin + 'T23:59:59') : null;

  const vigente = inicio <= hoy && (!fin || fin >= hoy);

  return vigente ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
      <CalendarIcon className="w-3 h-3" />Vigente
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-600">
      <CalendarIcon className="w-3 h-3" />No vigente
    </span>
  );
};

// Modal de Crear/Editar Promoción
const PromocionModal = ({ promocion, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Info básica, 2: Reglas, 3: Alcance

  // Función helper para formatear fecha a YYYY-MM-DD
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    // Si ya viene en formato YYYY-MM-DD, retornarlo directamente
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    // Si viene con timestamp, extraer solo la fecha
    return dateStr.split('T')[0];
  };

  const [form, setForm] = useState({
    nombre: promocion?.nombre || '',
    descripcion: promocion?.descripcion || '',
    aplica_todo: promocion ? Boolean(promocion.aplica_todo) : false,
    fecha_inicio: promocion?.fecha_inicio ? formatDateForInput(promocion.fecha_inicio) : new Date().toISOString().split('T')[0],
    fecha_fin: promocion?.fecha_fin ? formatDateForInput(promocion.fecha_fin) : '',
    flg_acumulable: promocion ? Boolean(promocion.flg_acumulable) : false,
    flg_activo: promocion ? Boolean(promocion.flg_activo) : true,
    reglas: promocion?.reglas || [
      {
        condicion_tipo_id: 1,
        condicion_valor: 1,
        beneficio_tipo_id: 1,
        beneficio_valor: 10,
      }
    ],
    alcances: promocion?.alcances || [],
  });

  const isEdit = !!promocion;

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const user = JSON.parse(localStorage.getItem('user'));
   // ✅ Después — envía booleanos reales
      const dto = {
        ...form,
        fecha_fin: form.fecha_fin || null,
        user_crea_id: user?.id,
        user_actua_id: user?.id,
      };

      if (isEdit) {
        await actualizarPromocion(promocion.id, dto);
      } else {
        await crearPromocion(dto);
      }
      onSaved();
    }// En handleSubmit, cambia el catch temporalmente:
    catch (err) {
      console.error('Detalle error:', err?.response?.data);
      setError(JSON.stringify(err?.response?.data?.message));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]/30 focus:border-[#E91E63] transition-all';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E91E63]/10 flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-[#E91E63]" />
            </div>
            <h2 className="font-bold text-gray-900">
              {isEdit ? 'Editar Promoción' : 'Nueva Promoción'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 border-b border-gray-200">
          {[
            { num: 1, label: 'Información' },
            { num: 2, label: 'Reglas' },
            { num: 3, label: 'Alcance' },
          ].map(({ num, label }) => (
            <React.Fragment key={num}>
              <button
                onClick={() => setStep(num)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  step === num
                    ? 'bg-[#E91E63] text-white'
                    : step > num
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  {num}
                </span>
                {label}
              </button>
              {num < 3 && <div className="w-8 h-0.5 bg-gray-300" />}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: Información Básica */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre *</label>
                <input
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  required
                  className={inputClass}
                  placeholder="Ej. 2x1 en terapias"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  rows={3}
                  className={inputClass}
                  placeholder="Descripción de la promoción..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha Inicio *</label>
                  <input
                    type="date"
                    value={form.fecha_inicio}
                    onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={form.fecha_fin}
                    onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value }))}
                    className={inputClass}
                  />
                  <p className="text-xs text-gray-500 mt-1">Dejar vacío para promoción sin vencimiento</p>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.flg_acumulable}
                    onChange={e => setForm(f => ({ ...f, flg_acumulable: e.target.checked }))}
                    className="w-4 h-4 text-[#E91E63] border-gray-300 rounded focus:ring-[#E91E63]"
                  />
                  <span className="text-sm text-gray-700">Es acumulable con otras promociones</span>
                </label>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.aplica_todo}
                    onChange={e => setForm(f => ({ ...f, aplica_todo: e.target.checked, alcances: [] }))}
                    className="w-4 h-4 text-[#E91E63] border-gray-300 rounded focus:ring-[#E91E63]"
                  />
                  <span className="text-sm text-gray-700">Aplica a todo el catálogo</span>
                </label>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.flg_activo}
                    onChange={e => setForm(f => ({ ...f, flg_activo: e.target.checked }))}
                    className="w-4 h-4 text-[#E91E63] border-gray-300 rounded focus:ring-[#E91E63]"
                  />
                  <span className="text-sm text-gray-700">Promoción activa</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Reglas */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Reglas de la Promoción</h3>
                <button
                  type="button"
                  onClick={() => setForm(f => ({
                    ...f,
                    reglas: [...f.reglas, { condicion_tipo_id: 1, condicion_valor: 1, beneficio_tipo_id: 1, beneficio_valor: 10 }]
                  }))}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#E91E63] hover:bg-pink-50 rounded-lg transition-colors"
                >
                  <PlusIcon className="w-3 h-3" />
                  Agregar Regla
                </button>
              </div>

              {form.reglas.map((regla, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600">Regla {idx + 1}</span>
                    {form.reglas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, reglas: f.reglas.filter((_, i) => i !== idx) }))}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Condición</label>
                      <select
                        value={regla.condicion_tipo_id}
                        onChange={e => {
                          const newReglas = [...form.reglas];
                          newReglas[idx].condicion_tipo_id = parseInt(e.target.value);
                          setForm(f => ({ ...f, reglas: newReglas }));
                        }}
                        className={inputClass}
                      >
                        <option value={1}>Cantidad mínima</option>
                        <option value={2}>Monto mínimo (S/)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Valor</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={regla.condicion_valor}
                        onChange={e => {
                          const newReglas = [...form.reglas];
                          newReglas[idx].condicion_valor = parseFloat(e.target.value);
                          setForm(f => ({ ...f, reglas: newReglas }));
                        }}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Beneficio</label>
                      <select
                        value={regla.beneficio_tipo_id}
                        onChange={e => {
                          const newReglas = [...form.reglas];
                          newReglas[idx].beneficio_tipo_id = parseInt(e.target.value);
                          setForm(f => ({ ...f, reglas: newReglas }));
                        }}
                        className={inputClass}
                      >
                        <option value={1}>Descuento %</option>
                        <option value={2}>Descuento fijo S/</option>
                        <option value={3}>Ítem más barato gratis</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Valor</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={regla.beneficio_valor}
                        onChange={e => {
                          const newReglas = [...form.reglas];
                          newReglas[idx].beneficio_valor = parseFloat(e.target.value);
                          setForm(f => ({ ...f, reglas: newReglas }));
                        }}
                        className={inputClass}
                        disabled={regla.beneficio_tipo_id === 3}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Alcance */}
          {step === 3 && (
            <div className="space-y-4">
              {form.aplica_todo ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <TagIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-green-700">Esta promoción aplica a todo el catálogo</p>
                  <p className="text-xs text-green-600 mt-1">No es necesario especificar alcances individuales</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Alcance de la Promoción</h3>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({
                        ...f,
                        alcances: [...f.alcances, { tipo_alcance_id: 1, referencia_id: 1 }]
                      }))}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#E91E63] hover:bg-pink-50 rounded-lg transition-colors"
                    >
                      <PlusIcon className="w-3 h-3" />
                      Agregar Alcance
                    </button>
                  </div>

                  {form.alcances.length === 0 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center text-sm text-yellow-700">
                      Agrega al menos un alcance o marca "Aplica a todo el catálogo"
                    </div>
                  )}

                  {form.alcances.map((alcance, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg space-y-3 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">Alcance {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, alcances: f.alcances.filter((_, i) => i !== idx) }))}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo</label>
                          <select
                            value={alcance.tipo_alcance_id}
                            onChange={e => {
                              const newAlcances = [...form.alcances];
                              newAlcances[idx].tipo_alcance_id = parseInt(e.target.value);
                              setForm(f => ({ ...f, alcances: newAlcances }));
                            }}
                            className={inputClass}
                          >
                            <option value={1}>Producto</option>
                            <option value={2}>Categoría</option>
                            <option value={3}>Servicio</option>
                            <option value={4}>Paquete</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">ID Referencia</label>
                          <input
                            type="number"
                            min="1"
                            value={alcance.referencia_id}
                            onChange={e => {
                              const newAlcances = [...form.alcances];
                              newAlcances[idx].referencia_id = parseInt(e.target.value);
                              setForm(f => ({ ...f, alcances: newAlcances }));
                            }}
                            className={inputClass}
                            placeholder="ID del ítem"
                          />
                        </div>
                      </div>

                      {alcance.tipo_alcance_id === 3 && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Motivo Cita (opcional)</label>
                          <input
                            type="number"
                            min="1"
                            value={alcance.motivo_cita_id || ''}
                            onChange={e => {
                              const newAlcances = [...form.alcances];
                              newAlcances[idx].motivo_cita_id = e.target.value ? parseInt(e.target.value) : null;
                              setForm(f => ({ ...f, alcances: newAlcances }));
                            }}
                            className={inputClass}
                            placeholder="Dejar vacío para todos"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Anterior
            </button>
          )}
          {step < 3 && (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#E91E63] rounded-xl hover:bg-[#C2185B] transition-colors"
            >
              Siguiente
            </button>
          )}
          {step === 3 && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#E91E63] rounded-xl hover:bg-[#C2185B] transition-colors disabled:opacity-50"
              >
                {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

// Componente principal
const GestionPromocionesTab = () => {
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroActivas, setFiltroActivas] = useState('todas');
  const [filtroVigentes, setFiltroVigentes] = useState('todas');
  const [showModal, setShowModal] = useState(false);
  const [editingPromocion, setEditingPromocion] = useState(null);

  const cargarPromociones = async () => {
    setLoading(true);
    try {
      const soloActivas = filtroActivas === 'activas';
      const soloVigentes = filtroVigentes === 'vigentes';
      const data = await getPromociones(soloActivas, soloVigentes);
      setPromociones(data);
    } catch (error) {
      console.error('Error al cargar promociones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPromociones();
  }, [filtroActivas, filtroVigentes]);

  const handleToggleActivo = async (id, activo) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (activo) {
        await activarPromocion(id, user?.id);
      } else {
        await desactivarPromocion(id, user?.id);
      }
      cargarPromociones();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta promoción?')) return;
    try {
      await eliminarPromocion(id);
      cargarPromociones();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar la promoción');
    }
  };

  const handleEdit = (promocion) => {
    setEditingPromocion(promocion);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPromocion(null);
  };

  const handleSaved = () => {
    handleCloseModal();
    cargarPromociones();
  };

  const filteredPromociones = promociones.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar promoción..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]/30 focus:border-[#E91E63]"
            />
          </div>

          <select
            value={filtroActivas}
            onChange={e => setFiltroActivas(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]/30"
          >
            <option value="todas">Todas</option>
            <option value="activas">Solo activas</option>
          </select>

          <select
            value={filtroVigentes}
            onChange={e => setFiltroVigentes(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]/30"
          >
            <option value="todas">Todas</option>
            <option value="vigentes">Solo vigentes</option>
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#E91E63] rounded-lg hover:bg-[#C2185B] transition-colors shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Nueva Promoción
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : filteredPromociones.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay promociones</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Vigencia</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Alcance</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPromociones.map(promo => (
                  <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-sm text-gray-900">{promo.nombre}</div>
                      <div className="text-xs text-gray-500">ID: {promo.id}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {promo.descripcion || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-600">
                        {new Date(promo.fecha_inicio).toLocaleDateString('es-PE')} - {promo.fecha_fin ? new Date(promo.fecha_fin).toLocaleDateString('es-PE') : 'Sin fin'}
                      </div>
                      <div className="mt-1">
                        <VigenciaBadge fechaInicio={promo.fecha_inicio} fechaFin={promo.fecha_fin} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge activo={promo.flg_activo === 1} />
                    </td>
                    <td className="px-4 py-3">
                      {promo.aplica_todo ? (
                        <span className="text-xs font-semibold text-green-600">Todo el catálogo</span>
                      ) : (
                        <span className="text-xs text-gray-600">{promo.alcances?.length || 0} alcance(s)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(promo)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActivo(promo.id, promo.flg_activo !== 1)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            promo.flg_activo === 1
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={promo.flg_activo === 1 ? 'Desactivar' : 'Activar'}
                        >
                          {promo.flg_activo === 1 ? '❌' : '✅'}
                        </button>
                        <button
                          onClick={() => handleDelete(promo.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-4 h-4" />
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

      {/* Modal */}
      {showModal && (
        <PromocionModal
          promocion={editingPromocion}
          onClose={handleCloseModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default GestionPromocionesTab;
