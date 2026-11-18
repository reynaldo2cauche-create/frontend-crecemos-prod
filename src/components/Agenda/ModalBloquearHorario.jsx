import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Plus, Ban, Repeat, CalendarDays, AlertCircle } from 'lucide-react';
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

const inputClass = (error) =>
  `w-full px-3 py-2 text-sm border rounded-xl focus:outline-none transition-all bg-white text-gray-900 ${
    error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-red-600'
  }`;

const labelClass = 'block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1';

// Etiqueta + error en una sola pieza para no repetir markup
const Field = ({ label, error, children }) => (
  <div>
    <label className={labelClass}>{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const ModalBloquearHorario = ({ open, onClose, terapeutas, onBloqueoCreado, userId }) => {
  const [loading, setLoading] = useState(false);
  const [tiposBloqueo, setTiposBloqueo] = useState([]);
  const [submitError, setSubmitError] = useState('');
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
    setSubmitError('');
  };

  const handleChange = (field, value) => {
    if (field === 'tipoBloqueoId') {
      // Al cambiar de tipo, limpiar las selecciones específicas del tipo anterior.
      setFormData(prev => ({ ...prev, tipoBloqueoId: value, diasSemana: [], fechasPuntuales: [], fechaPuntualTemp: '' }));
    } else if (field === 'todoElDia' && value === true) {
      setFormData(prev => ({ ...prev, todoElDia: true, horaInicio: '', horaFin: '' }));
    } else if (field === 'todoElDia' && value === false) {
      setFormData(prev => ({ ...prev, todoElDia: false, horaInicio: prev.horaInicio || '08:00', horaFin: prev.horaFin || '18:00' }));
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
    setSubmitError('');
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

    // Un bloqueo por cada fecha (PUNTUAL) o por cada día de la semana (RECURRENTE).
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
      const idxFallidos = resultados.map((r, i) => (r.status === 'rejected' ? i : -1)).filter(i => i !== -1);
      const fallidos = idxFallidos.length;
      const creados = resultados.length - fallidos;

      if (creados > 0) onBloqueoCreado();

      if (fallidos === 0) {
        onClose();
        return;
      }

      // Hubo fallos: el modal queda abierto con solo lo que faltó, para reintentar sin duplicar.
      if (esPuntual) {
        setFormData(prev => ({ ...prev, fechasPuntuales: prev.fechasPuntuales.filter((_, i) => idxFallidos.includes(i)) }));
      } else if (esRecurrente) {
        setFormData(prev => ({ ...prev, diasSemana: prev.diasSemana.filter((_, i) => idxFallidos.includes(i)) }));
      }
      setSubmitError(
        creados > 0
          ? `Se crearon ${creados} de ${resultados.length} bloqueos. Los ${fallidos} restantes fallaron y quedaron seleccionados para reintentar.`
          : 'No se pudo crear el bloqueo. Intente nuevamente.'
      );
    } catch (error) {
      console.error('Error al crear bloqueos:', error);
      setSubmitError('Error al crear los bloqueos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const tipoSeleccionado = tiposBloqueo.find(t => t.id === parseInt(formData.tipoBloqueoId));
  const esPuntual = tipoSeleccionado?.codigo === 'PUNTUAL';
  const esRecurrente = tipoSeleccionado?.codigo === 'RECURRENTE';
  const esOtroTipo = !!tipoSeleccionado && !esPuntual && !esRecurrente;
  const totalBloqueos = esPuntual ? formData.fechasPuntuales.length : esRecurrente ? formData.diasSemana.length : tipoSeleccionado ? 1 : 0;

  // Portal: monta el modal en document.body, escapando el stacking context del navbar/layout
  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', pointerEvents: 'none' }}>
        <div
          style={{ pointerEvents: 'auto' }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-red-500/20">
              <Ban className="w-4 h-4 text-white" />
            </div>
            <h2 className="flex-1 text-base font-extrabold text-gray-900">Bloquear Horario</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Formulario plano, sin tarjetas internas */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
            {submitError && (
              <p className="flex items-start gap-2 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {submitError}
              </p>
            )}

            <Field label="Terapeuta" error={errors.trabajadorId}>
              <select
                value={formData.trabajadorId}
                onChange={(e) => handleChange('trabajadorId', e.target.value)}
                className={`${inputClass(errors.trabajadorId)} cursor-pointer`}
              >
                <option value="">Seleccione un terapeuta</option>
                {terapeutas?.filter(t => t.estado).map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nombres} {t.apellidos} {t.especialidad?.nombre ? `— ${t.especialidad.nombre}` : ''}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tipo de bloqueo" error={errors.tipoBloqueoId}>
              {tiposBloqueo.length === 0 ? (
                <p className="text-xs text-gray-400 py-2">Cargando tipos...</p>
              ) : (
                <div className="flex gap-2">
                  {tiposBloqueo.map(tipo => {
                    const activo = formData.tipoBloqueoId === tipo.id;
                    const Icono = tipo.codigo === 'RECURRENTE' ? Repeat : CalendarDays;
                    return (
                      <button
                        key={tipo.id}
                        type="button"
                        title={tipo.descripcion}
                        onClick={() => handleChange('tipoBloqueoId', tipo.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${
                          activo
                            ? 'border-red-500 bg-red-50 text-red-600'
                            : 'border-gray-200 text-gray-600 hover:border-red-300'
                        }`}
                      >
                        <Icono className="w-4 h-4" />
                        {tipo.nombre}
                      </button>
                    );
                  })}
                </div>
              )}
            </Field>

            {/* PUNTUAL */}
            {esPuntual && (
              <Field label="Fechas a bloquear" error={errors.fechasPuntuales}>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={formData.fechaPuntualTemp}
                    onChange={(e) => handleChange('fechaPuntualTemp', e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarFechaPuntual(); } }}
                    className={inputClass(errors.fechasPuntuales)}
                  />
                  <button
                    type="button"
                    onClick={agregarFechaPuntual}
                    disabled={!formData.fechaPuntualTemp}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-md shadow-red-500/25 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" /> Agregar
                  </button>
                </div>
                {formData.fechasPuntuales.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData.fechasPuntuales.map(f => (
                      <span key={f} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        {fmtFechaCorta(f)}
                        <button type="button" onClick={() => quitarFechaPuntual(f)} className="hover:bg-red-100 rounded-full p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>
            )}

            {/* RECURRENTE */}
            {esRecurrente && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Desde" error={errors.fechaInicio}>
                    <input type="date" value={formData.fechaInicio} onChange={(e) => handleChange('fechaInicio', e.target.value)} className={inputClass(errors.fechaInicio)} />
                  </Field>
                  <Field label="Hasta" error={errors.fechaFin}>
                    <input type="date" value={formData.fechaFin} onChange={(e) => handleChange('fechaFin', e.target.value)} className={inputClass(errors.fechaFin)} />
                  </Field>
                </div>
                <Field label="Se repite cada" error={errors.diasSemana}>
                  <div className="flex flex-wrap gap-1.5">
                    {DIAS_SEMANA.map(dia => {
                      const sel = formData.diasSemana.includes(dia.value);
                      return (
                        <button
                          key={dia.value}
                          type="button"
                          title={dia.label}
                          onClick={() => toggleDia(dia.value)}
                          className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                            sel
                              ? 'border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm shadow-red-500/25'
                              : 'border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600'
                          }`}
                        >
                          {dia.corto}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </>
            )}

            {/* Otros tipos: rango simple */}
            {esOtroTipo && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Desde" error={errors.fechaInicio}>
                  <input type="date" value={formData.fechaInicio} onChange={(e) => handleChange('fechaInicio', e.target.value)} className={inputClass(errors.fechaInicio)} />
                </Field>
                <Field label="Hasta" error={errors.fechaFin}>
                  <input type="date" value={formData.fechaFin} onChange={(e) => handleChange('fechaFin', e.target.value)} className={inputClass(errors.fechaFin)} />
                </Field>
              </div>
            )}

            {/* Horario */}
            <Field label="Horario">
              <div className="inline-flex p-0.5 rounded-full bg-gray-100">
                {[{ v: true, t: 'Todo el día' }, { v: false, t: 'Horario específico' }].map(op => (
                  <button
                    key={String(op.v)}
                    type="button"
                    onClick={() => handleChange('todoElDia', op.v)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                      formData.todoElDia === op.v ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {op.t}
                  </button>
                ))}
              </div>
              {!formData.todoElDia && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <input type="time" value={formData.horaInicio} onChange={(e) => handleChange('horaInicio', e.target.value)} className={inputClass(errors.horaInicio)} />
                    {errors.horaInicio && <p className="text-red-500 text-xs mt-1">{errors.horaInicio}</p>}
                  </div>
                  <div>
                    <input type="time" value={formData.horaFin} onChange={(e) => handleChange('horaFin', e.target.value)} className={inputClass(errors.horaFin)} />
                    {errors.horaFin && <p className="text-red-500 text-xs mt-1">{errors.horaFin}</p>}
                  </div>
                </div>
              )}
            </Field>

            <Field label="Motivo (obligatorio para auditoría)" error={errors.motivo}>
              <textarea
                value={formData.motivo}
                onChange={(e) => handleChange('motivo', e.target.value)}
                placeholder="Ej: curso de especialización, permiso médico..."
                rows={2}
                className={`${inputClass(errors.motivo)} resize-none`}
              />
            </Field>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              {totalBloqueos > 0 && `${totalBloqueos} bloqueo${totalBloqueos !== 1 ? 's' : ''} a crear`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-full transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 cx-glow bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg shadow-red-500/30 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Bloqueando...
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4" />
                    Bloquear
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalBloquearHorario;