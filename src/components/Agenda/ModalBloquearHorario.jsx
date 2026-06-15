import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Clock, Calendar, User, AlertCircle, Ban, Plus } from 'lucide-react';
import { crearBloqueo } from '../../services/bloqueoService';
import { getTipoBloqueo } from '../../services/catalogoService';

const DIAS_SEMANA = [
  { value: 1, label: 'Lunes', corto: 'Lun' },
  { value: 2, label: 'Martes', corto: 'Mar' },
  { value: 3, label: 'Miércoles', corto: 'Mié' },
  { value: 4, label: 'Jueves', corto: 'Jue' },
  { value: 5, label: 'Viernes', corto: 'Vie' },
  { value: 6, label: 'Sábado', corto: 'Sáb' },
  { value: 0, label: 'Domingo', corto: 'Dom' },
];

const fmtFechaCorta = (f) => {
  if (!f) return '';
  const d = new Date(`${f}T00:00:00`);
  return isNaN(d) ? f : d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const ModalBloquearHorario = ({ open, onClose, terapeutas, onBloqueoCreado, userId }) => {
  const [loading, setLoading] = useState(false);
  const [tiposBloqueo, setTiposBloqueo] = useState([]);
  const [formData, setFormData] = useState({
    trabajadorId: '',
    tipoBloqueoId: '',
    fechaInicio: '',          // rango (RECURRENTE) — desde
    fechaFin: '',             // rango (RECURRENTE) — hasta
    fechaPuntualTemp: '',     // input temporal para agregar fechas puntuales
    fechasPuntuales: [],      // PUNTUAL — varias fechas sueltas
    diasSemana: [],           // RECURRENTE — varios días de la semana
    todoElDia: true,
    horaInicio: '08:00',
    horaFin: '18:00',
    motivo: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      cargarTiposBloqueo();
      resetForm();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const cargarTiposBloqueo = async () => {
    try {
      const tipos = await getTipoBloqueo();
      setTiposBloqueo(tipos);
    } catch (error) {
      console.error('❌ Error al cargar tipos de bloqueo:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      trabajadorId: '',
      tipoBloqueoId: '',
      fechaInicio: '',
      fechaFin: '',
      fechaPuntualTemp: '',
      fechasPuntuales: [],
      diasSemana: [],
      todoElDia: true,
      horaInicio: '08:00',
      horaFin: '18:00',
      motivo: '',
    });
    setErrors({});
  };

  const handleChange = (field, value) => {
    if (field === 'tipoBloqueoId') {
      // Al cambiar de tipo, limpiar las selecciones específicas del tipo anterior.
      setFormData(prev => ({ ...prev, tipoBloqueoId: value, diasSemana: [], fechasPuntuales: [], fechaPuntualTemp: '' }));
    } else if (field === 'todoElDia' && value === true) {
      setFormData(prev => ({ ...prev, todoElDia: true, horaInicio: '', horaFin: '' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Multi-selección de días de la semana (RECURRENTE)
  const toggleDia = (diaValue) => {
    setFormData(prev => {
      const existe = prev.diasSemana.includes(diaValue);
      return { ...prev, diasSemana: existe ? prev.diasSemana.filter(d => d !== diaValue) : [...prev.diasSemana, diaValue] };
    });
    if (errors.diasSemana) setErrors(prev => ({ ...prev, diasSemana: null }));
  };

  // Agregar / quitar fechas puntuales (PUNTUAL)
  const agregarFechaPuntual = () => {
    const f = formData.fechaPuntualTemp;
    if (!f) return;
    setFormData(prev => prev.fechasPuntuales.includes(f)
      ? { ...prev, fechaPuntualTemp: '' }
      : { ...prev, fechasPuntuales: [...prev.fechasPuntuales, f].sort(), fechaPuntualTemp: '' });
    if (errors.fechasPuntuales) setErrors(prev => ({ ...prev, fechasPuntuales: null }));
  };
  const quitarFechaPuntual = (f) => {
    setFormData(prev => ({ ...prev, fechasPuntuales: prev.fechasPuntuales.filter(x => x !== f) }));
  };

  const validate = (esPuntual, esRecurrente) => {
    const newErrors = {};
    if (!formData.trabajadorId) newErrors.trabajadorId = 'Seleccione un terapeuta';
    if (!formData.tipoBloqueoId) newErrors.tipoBloqueoId = 'Seleccione un tipo de bloqueo';
    if (!formData.motivo.trim()) newErrors.motivo = 'Ingrese un motivo';

    if (esPuntual) {
      if (formData.fechasPuntuales.length === 0) newErrors.fechasPuntuales = 'Agregue al menos una fecha';
    } else if (esRecurrente) {
      if (!formData.fechaInicio) newErrors.fechaInicio = 'Ingrese fecha de inicio';
      if (!formData.fechaFin) newErrors.fechaFin = 'Ingrese fecha de fin';
      if (formData.fechaInicio && formData.fechaFin && formData.fechaFin < formData.fechaInicio) {
        newErrors.fechaFin = 'La fecha de fin debe ser mayor o igual a la de inicio';
      }
      if (formData.diasSemana.length === 0) newErrors.diasSemana = 'Seleccione al menos un día de la semana';
    }

    if (!formData.todoElDia) {
      if (!formData.horaInicio) newErrors.horaInicio = 'Ingrese hora de inicio';
      if (!formData.horaFin) newErrors.horaFin = 'Ingrese hora de fin';
      if (formData.horaInicio && formData.horaFin && formData.horaInicio >= formData.horaFin) {
        newErrors.horaFin = 'La hora de fin debe ser mayor a la de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const tipo = tiposBloqueo.find(t => t.id === parseInt(formData.tipoBloqueoId));
    const esPuntual = tipo?.codigo === 'PUNTUAL';
    const esRecurrente = tipo?.codigo === 'RECURRENTE';
    if (!validate(esPuntual, esRecurrente)) return;

    // Base común a todos los bloqueos que se crearán en este submit.
    const base = {
      trabajadorId: parseInt(formData.trabajadorId),
      tipoBloqueoId: parseInt(formData.tipoBloqueoId),
      todoElDia: formData.todoElDia,
      horaInicio: formData.todoElDia ? null : `${formData.horaInicio}:00`,
      horaFin: formData.todoElDia ? null : `${formData.horaFin}:00`,
      motivo: formData.motivo,
      userIdCrea: userId,
    };

    // Construir un bloqueo por cada fecha (PUNTUAL) o por cada día de la semana (RECURRENTE).
    let bloqueos = [];
    if (esPuntual) {
      bloqueos = formData.fechasPuntuales.map(f => ({ ...base, fechaInicio: f, fechaFin: f, diaSemana: null }));
    } else if (esRecurrente) {
      bloqueos = formData.diasSemana.map(d => ({ ...base, fechaInicio: formData.fechaInicio, fechaFin: formData.fechaFin, diaSemana: d }));
    } else {
      // Otros tipos (rango simple): un único bloqueo.
      bloqueos = [{ ...base, fechaInicio: formData.fechaInicio, fechaFin: formData.fechaFin, diaSemana: null }];
    }

    setLoading(true);
    try {
      const resultados = await Promise.allSettled(bloqueos.map(b => crearBloqueo(b)));
      const fallidos = resultados.filter(r => r.status === 'rejected').length;
      const creados = resultados.length - fallidos;

      if (fallidos > 0) {
        alert(`Se crearon ${creados} de ${resultados.length} bloqueos. ${fallidos} fallaron, intenta nuevamente con los que faltan.`);
      }
      if (creados > 0) {
        onBloqueoCreado();
        onClose();
      }
    } catch (error) {
      console.error('Error al crear bloqueos:', error);
      alert('Error al crear los bloqueos. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const tipoSeleccionado = tiposBloqueo.find(t => t.id === parseInt(formData.tipoBloqueoId));
  const esPuntual = tipoSeleccionado?.codigo === 'PUNTUAL';
  const esRecurrente = tipoSeleccionado?.codigo === 'RECURRENTE';

  // Portal: monta el modal en document.body, escapando el stacking context del navbar/layout
  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
      {/* Overlay */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Centrado */}
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 flex items-center justify-between z-10 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Ban className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white">Bloquear Horario</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Info Alert */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Importante:</p>
                <p>Puedes bloquear varios días a la vez. El motivo es obligatorio para auditoría.</p>
              </div>
            </div>

            {/* Terapeuta */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-red-600" />
                Terapeuta
                <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.trabajadorId}
                onChange={(e) => handleChange('trabajadorId', e.target.value)}
                className={`w-full px-4 py-2.5 text-sm border-2 rounded-xl focus:outline-none transition-colors ${
                  errors.trabajadorId ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-red-600'
                }`}
              >
                <option value="">Seleccione un terapeuta</option>
                {terapeutas?.filter(t => t.estado).map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nombres} {t.apellidos} {t.especialidad?.nombre ? `— ${t.especialidad.nombre}` : ''}
                  </option>
                ))}
              </select>
              {errors.trabajadorId && <p className="text-xs text-red-500 mt-1">{errors.trabajadorId}</p>}
            </div>

            {/* Tipo de Bloqueo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Bloqueo
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {tiposBloqueo.length === 0 ? (
                  <div className="col-span-2 text-center text-sm text-gray-500 py-4">
                    Cargando tipos de bloqueo...
                  </div>
                ) : (
                  tiposBloqueo.map(tipo => (
                    <button
                      key={tipo.id}
                      type="button"
                      onClick={() => handleChange('tipoBloqueoId', tipo.id)}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        formData.tipoBloqueoId === tipo.id
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-sm text-gray-900">{tipo.nombre}</div>
                      <div className="text-xs text-gray-500 mt-1">{tipo.descripcion}</div>
                    </button>
                  ))
                )}
              </div>
              {errors.tipoBloqueoId && <p className="text-xs text-red-500 mt-1">{errors.tipoBloqueoId}</p>}
            </div>

            {/* PUNTUAL: varias fechas sueltas */}
            {esPuntual && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-600" />
                  Fechas a bloquear
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={formData.fechaPuntualTemp}
                    onChange={(e) => handleChange('fechaPuntualTemp', e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarFechaPuntual(); } }}
                    className={`flex-1 px-4 py-2.5 text-sm border-2 rounded-xl focus:outline-none transition-colors ${
                      errors.fechasPuntuales ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-red-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={agregarFechaPuntual}
                    disabled={!formData.fechaPuntualTemp}
                    className="px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Agregar
                  </button>
                </div>
                {formData.fechasPuntuales.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.fechasPuntuales.map(f => (
                      <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg">
                        {fmtFechaCorta(f)}
                        <button type="button" onClick={() => quitarFechaPuntual(f)} className="hover:text-red-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.fechasPuntuales && <p className="text-xs text-red-500 mt-1">{errors.fechasPuntuales}</p>}
                <p className="text-[11px] text-gray-400 mt-2">Agrega todas las fechas que quieras; se crea un bloqueo por cada una.</p>
              </div>
            )}

            {/* RECURRENTE: rango de fechas */}
            {esRecurrente && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-600" />
                    Desde
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => handleChange('fechaInicio', e.target.value)}
                    className={`w-full px-4 py-2.5 text-sm border-2 rounded-xl focus:outline-none transition-colors ${
                      errors.fechaInicio ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-red-600'
                    }`}
                  />
                  {errors.fechaInicio && <p className="text-xs text-red-500 mt-1">{errors.fechaInicio}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-600" />
                    Hasta
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => handleChange('fechaFin', e.target.value)}
                    className={`w-full px-4 py-2.5 text-sm border-2 rounded-xl focus:outline-none transition-colors ${
                      errors.fechaFin ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-red-600'
                    }`}
                  />
                  {errors.fechaFin && <p className="text-xs text-red-500 mt-1">{errors.fechaFin}</p>}
                </div>
              </div>
            )}

            {/* RECURRENTE: varios días de la semana */}
            {esRecurrente && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Días de la Semana
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIAS_SEMANA.map(dia => {
                    const sel = formData.diasSemana.includes(dia.value);
                    return (
                      <button
                        key={dia.value}
                        type="button"
                        onClick={() => toggleDia(dia.value)}
                        className={`px-3.5 py-2 text-sm font-semibold rounded-xl border-2 transition-all ${
                          sel ? 'border-red-600 bg-red-600 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {dia.corto}
                      </button>
                    );
                  })}
                </div>
                {errors.diasSemana && <p className="text-xs text-red-500 mt-1">{errors.diasSemana}</p>}
                <p className="text-[11px] text-gray-400 mt-2">Selecciona uno o varios días (ej: Lunes y Sábado); el bloqueo se repite cada semana dentro del rango.</p>
              </div>
            )}

            {/* Horario */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Horario</label>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="todoElDia"
                    checked={formData.todoElDia}
                    onChange={() => handleChange('todoElDia', true)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Todo el día</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="todoElDia"
                    checked={!formData.todoElDia}
                    onChange={() => handleChange('todoElDia', false)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Horario específico</span>
                </label>
              </div>

              {!formData.todoElDia && (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      Desde
                    </label>
                    <input
                      type="time"
                      value={formData.horaInicio}
                      onChange={(e) => handleChange('horaInicio', e.target.value)}
                      className={`w-full px-4 py-2.5 text-sm border-2 rounded-xl focus:outline-none transition-colors ${
                        errors.horaInicio ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-red-600'
                      }`}
                    />
                    {errors.horaInicio && <p className="text-xs text-red-500 mt-1">{errors.horaInicio}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      Hasta
                    </label>
                    <input
                      type="time"
                      value={formData.horaFin}
                      onChange={(e) => handleChange('horaFin', e.target.value)}
                      className={`w-full px-4 py-2.5 text-sm border-2 rounded-xl focus:outline-none transition-colors ${
                        errors.horaFin ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-red-600'
                      }`}
                    />
                    {errors.horaFin && <p className="text-xs text-red-500 mt-1">{errors.horaFin}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Motivo
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={formData.motivo}
                onChange={(e) => handleChange('motivo', e.target.value)}
                placeholder="Explique la razón del bloqueo (ej: Curso de especialización, permiso médico, etc.)"
                rows={3}
                className={`w-full px-4 py-2.5 text-sm border-2 rounded-xl focus:outline-none transition-colors resize-none ${
                  errors.motivo ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-red-600'
                }`}
              />
              {errors.motivo && <p className="text-xs text-red-500 mt-1">{errors.motivo}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100 rounded-b-2xl">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-500/30"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Bloqueando...
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  Bloquear Horario
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalBloquearHorario;
