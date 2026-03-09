import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, User, AlertCircle, Ban } from 'lucide-react';
import { crearBloqueo } from '../../services/bloqueoService';
import { getTipoBloqueo } from '../../services/catalogoService';

const DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

const ModalBloquearHorario = ({ open, onClose, terapeutas, onBloqueoCreado, userId }) => {
  const [loading, setLoading] = useState(false);
  const [tiposBloqueo, setTiposBloqueo] = useState([]);
  const [formData, setFormData] = useState({
    trabajadorId: '',
    tipoBloqueoId: '',
    fechaInicio: '',
    fechaFin: '',
    diaSemana: '',
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
    }
  }, [open]);

  const cargarTiposBloqueo = async () => {
    try {
      console.log('🔍 Cargando tipos de bloqueo...');
      const tipos = await getTipoBloqueo();
      console.log('✅ Tipos de bloqueo recibidos:', tipos);
      setTiposBloqueo(tipos);
    } catch (error) {
      console.error('❌ Error al cargar tipos de bloqueo:', error);
      console.error('❌ Detalles del error:', error.response?.data);
    }
  };

  const resetForm = () => {
    setFormData({
      trabajadorId: '',
      tipoBloqueoId: '',
      fechaInicio: '',
      fechaFin: '',
      diaSemana: '',
      todoElDia: true,
      horaInicio: '08:00',
      horaFin: '18:00',
      motivo: '',
    });
    setErrors({});
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Auto-ajustes
    if (field === 'tipoBloqueoId') {
      const tipo = tiposBloqueo.find(t => t.id === parseInt(value));
      if (tipo?.codigo === 'PUNTUAL') {
        // Para bloqueos puntuales, fecha_fin = fecha_inicio
        setFormData(prev => ({ ...prev, fechaFin: prev.fechaInicio, diaSemana: '' }));
      } else if (tipo?.codigo === 'RECURRENTE') {
        // Para recurrentes, resetear diaSemana
        setFormData(prev => ({ ...prev, diaSemana: '' }));
      }
    }

    if (field === 'fechaInicio' && formData.tipoBloqueoId) {
      const tipo = tiposBloqueo.find(t => t.id === parseInt(formData.tipoBloqueoId));
      if (tipo?.codigo === 'PUNTUAL') {
        setFormData(prev => ({ ...prev, fechaFin: value }));
      }
    }

    if (field === 'todoElDia' && value === true) {
      setFormData(prev => ({ ...prev, horaInicio: '', horaFin: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.trabajadorId) newErrors.trabajadorId = 'Seleccione un terapeuta';
    if (!formData.tipoBloqueoId) newErrors.tipoBloqueoId = 'Seleccione un tipo de bloqueo';
    if (!formData.fechaInicio) newErrors.fechaInicio = 'Ingrese fecha de inicio';
    if (!formData.fechaFin) newErrors.fechaFin = 'Ingrese fecha de fin';
    if (!formData.motivo.trim()) newErrors.motivo = 'Ingrese un motivo';

    const tipo = tiposBloqueo.find(t => t.id === parseInt(formData.tipoBloqueoId));
    if (tipo?.codigo === 'RECURRENTE' && !formData.diaSemana && formData.diaSemana !== 0) {
      newErrors.diaSemana = 'Seleccione el día de la semana';
    }

    if (!formData.todoElDia) {
      if (!formData.horaInicio) newErrors.horaInicio = 'Ingrese hora de inicio';
      if (!formData.horaFin) newErrors.horaFin = 'Ingrese hora de fin';
      if (formData.horaInicio && formData.horaFin && formData.horaInicio >= formData.horaFin) {
        newErrors.horaFin = 'La hora de fin debe ser mayor a la de inicio';
      }
    }

    if (formData.fechaInicio && formData.fechaFin && formData.fechaFin < formData.fechaInicio) {
      newErrors.fechaFin = 'La fecha de fin debe ser mayor o igual a la de inicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const bloqueoData = {
        trabajadorId: parseInt(formData.trabajadorId),
        tipoBloqueoId: parseInt(formData.tipoBloqueoId),
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        diaSemana: formData.diaSemana !== '' ? parseInt(formData.diaSemana) : null,
        todoElDia: formData.todoElDia,
        horaInicio: formData.todoElDia ? null : `${formData.horaInicio}:00`,
        horaFin: formData.todoElDia ? null : `${formData.horaFin}:00`,
        motivo: formData.motivo,
        userIdCrea: userId,
      };

      await crearBloqueo(bloqueoData);
      onBloqueoCreado();
      onClose();
    } catch (error) {
      console.error('Error al crear bloqueo:', error);
      alert('Error al crear el bloqueo. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const tipoSeleccionado = tiposBloqueo.find(t => t.id === parseInt(formData.tipoBloqueoId));
  const esPuntual = tipoSeleccionado?.codigo === 'PUNTUAL';
  const esRecurrente = tipoSeleccionado?.codigo === 'RECURRENTE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 px-6 py-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Ban className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Bloquear Horario</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Info Alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Importante:</p>
              <p>Los horarios bloqueados no estarán disponibles para agendar citas. El motivo es obligatorio para auditoría.</p>
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

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                {esPuntual ? 'Fecha' : 'Desde'}
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

            {!esPuntual && (
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
            )}
          </div>

          {/* Día de la Semana (solo para recurrentes) */}
          {esRecurrente && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Día de la Semana
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={formData.diaSemana}
                onChange={(e) => handleChange('diaSemana', e.target.value)}
                className={`w-full px-4 py-2.5 text-sm border-2 rounded-xl focus:outline-none transition-colors ${
                  errors.diaSemana ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-red-600'
                }`}
              >
                <option value="">Seleccione un día</option>
                {DIAS_SEMANA.map(dia => (
                  <option key={dia.value} value={dia.value}>{dia.label}</option>
                ))}
              </select>
              {errors.diaSemana && <p className="text-xs text-red-500 mt-1">{errors.diaSemana}</p>}
            </div>
          )}

          {/* Horario */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Horario
            </label>
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
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
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
  );
};

export default ModalBloquearHorario;
