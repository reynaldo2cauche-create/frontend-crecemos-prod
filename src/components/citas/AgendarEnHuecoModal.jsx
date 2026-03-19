import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { generarVistaPrevia, agendarEnHueco } from '../../services/agendaFlexibleService';

const AgendarEnHuecoModal = ({
  isOpen,
  onClose,
  hueco,
  doctorId,
  fecha,
  pacientes,
  servicios,
  motivos,
  usuarioId,
  onSuccess,
  configAgenda // 🆕 Configuración de agenda flexible
}) => {
  const [paso, setPaso] = useState(1); // 1: Formulario, 2: Vista previa
  const [loading, setLoading] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    paciente_id: '',
    servicio_id: '',
    motivo_id: '',
    duracion_minutos: 40,
    nota: '',
  });

  if (!isOpen) return null;

  const handleGenerarVistaPrevia = async () => {
    if (!formData.paciente_id || !formData.servicio_id || !formData.motivo_id) {
      setError('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const datos = {
        paciente_id: parseInt(formData.paciente_id),
        doctor_id: doctorId,
        servicio_id: parseInt(formData.servicio_id),
        motivo_id: parseInt(formData.motivo_id),
        fecha,
        hora_inicio: hueco.hora_inicio,
        duracion_minutos: formData.duracion_minutos,
        usuario_id: usuarioId,
        nota: formData.nota,
        // 🆕 Configuración de movimiento máximo
        limite_movimiento_minutos: configAgenda?.limite_movimiento_minutos || 30
      };

      const preview = await generarVistaPrevia(datos);
      setVistaPrevia(preview);
      setPaso(2);
    } catch (error) {
      console.error('Error al generar vista previa:', error);
      const mensaje = error.response?.data?.error || 'Error al generar vista previa';
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = async () => {
    setLoading(true);
    setError(null);
    try {
      const datos = {
        paciente_id: parseInt(formData.paciente_id),
        doctor_id: doctorId,
        servicio_id: parseInt(formData.servicio_id),
        motivo_id: parseInt(formData.motivo_id),
        fecha,
        hora_inicio: hueco.hora_inicio,
        duracion_minutos: formData.duracion_minutos,
        usuario_id: usuarioId,
        nota: formData.nota,
        limite_movimiento_minutos: configAgenda?.limite_movimiento_minutos || 30
      };

      await agendarEnHueco(datos);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error al agendar:', error);
      const mensaje = error.response?.data?.error || error.response?.data?.advertencias?.join('\n') || 'Error al agendar la cita';
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Agendar en Hueco</h2>
              <p className="text-sm text-purple-100">
                {hueco.hora_inicio} - {hueco.hora_fin} ({hueco.minutos_disponibles} min disponibles)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {paso === 1 ? (
            <div className="space-y-5">
              {/* 🆕 Información del hueco con contexto */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4">
                <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Hueco detectado
                </h3>

                <div className="space-y-2 text-sm">
                  {hueco.cita_anterior && (
                    <div className="bg-white/60 rounded-lg p-2">
                      <p className="text-gray-600">Cita anterior:</p>
                      <p className="font-semibold text-gray-900">{hueco.cita_anterior.paciente}</p>
                    </div>
                  )}

                  <div className="bg-green-100 border-2 border-green-400 border-dashed rounded-lg p-3 text-center">
                    <p className="text-green-700 font-bold text-lg">
                      {hueco.hora_inicio} - {hueco.hora_fin}
                    </p>
                    <p className="text-green-600 text-sm">
                      {hueco.minutos_disponibles} minutos libres
                    </p>
                  </div>

                  {hueco.cita_siguiente && (
                    <div className="bg-white/60 rounded-lg p-2">
                      <p className="text-gray-600">Cita siguiente:</p>
                      <p className="font-semibold text-gray-900">{hueco.cita_siguiente.paciente}</p>
                    </div>
                  )}
                </div>
              </div>

              {hueco.minutos_disponibles < 40 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900 mb-1">
                        Este hueco es menor a la duración mínima (40 min)
                      </p>
                      <p className="text-xs text-yellow-700">
                        Se moverán automáticamente las citas siguientes para hacer espacio
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Límite de movimiento configurado: <span className="font-bold">{configAgenda?.limite_movimiento_minutos || 30} minutos</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mostrar errores si existen */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duración de la cita
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, duracion_minutos: 40 })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.duracion_minutos === 40
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-2xl font-bold">{formData.duracion_minutos === 40 && '●'} 40 min</div>
                    <div className="text-sm text-gray-600">{hueco.hora_inicio} - {calcularHoraFin(hueco.hora_inicio, 40)}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, duracion_minutos: 50 })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.duracion_minutos === 50
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-2xl font-bold">{formData.duracion_minutos === 50 && '●'} 50 min</div>
                    <div className="text-sm text-gray-600">{hueco.hora_inicio} - {calcularHoraFin(hueco.hora_inicio, 50)}</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Paciente</label>
                <select
                  value={formData.paciente_id}
                  onChange={(e) => setFormData({ ...formData, paciente_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                >
                  <option value="">Seleccionar paciente...</option>
                  {pacientes?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombres} {p.apellido_paterno} {p.apellido_materno}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Servicio</label>
                <select
                  value={formData.servicio_id}
                  onChange={(e) => setFormData({ ...formData, servicio_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                >
                  <option value="">Seleccionar servicio...</option>
                  {servicios?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Motivo</label>
                <select
                  value={formData.motivo_id}
                  onChange={(e) => setFormData({ ...formData, motivo_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                >
                  <option value="">Seleccionar motivo...</option>
                  {motivos?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nota (opcional)</label>
                <textarea
                  value={formData.nota}
                  onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none resize-none"
                  placeholder="Agregar nota..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Resumen de la nueva cita */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4">
                <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Nueva cita a agendar
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                  <div>
                    <p className="text-gray-600">Paciente:</p>
                    <p className="font-semibold text-gray-900">
                      {pacientes?.find(p => p.id === parseInt(formData.paciente_id))?.nombres || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duración:</p>
                    <p className="font-semibold text-gray-900">{vistaPrevia?.duracion_solicitada || formData.duracion_minutos} minutos</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Hora inicio:</p>
                    <p className="font-semibold text-gray-900">{hueco.hora_inicio}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Hora fin:</p>
                    <p className="font-semibold text-gray-900">
                      {calcularHoraFin(hueco.hora_inicio, formData.duracion_minutos)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mostrar errores en paso 2 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {vistaPrevia?.citas_a_mover?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Citas que se moverán:</h4>
                  <div className="space-y-2">
                    {vistaPrevia.citas_a_mover.map((mov, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                          mov.puede_moverse
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {mov.puede_moverse ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{mov.paciente_nombre}</p>
                            {!mov.puede_moverse && (
                              <p className="text-xs text-red-600">{mov.razon_no_mover}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-gray-900">
                            {mov.hora_anterior} → {mov.hora_nueva}
                          </p>
                          <p className="text-xs text-gray-600">(+{mov.minutos_movidos} min)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {vistaPrevia?.advertencias?.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Advertencias
                  </h4>
                  <ul className="space-y-1">
                    {vistaPrevia.advertencias.map((adv, index) => (
                      <li key={index} className="text-sm text-yellow-700">• {adv}</li>
                    ))}
                  </ul>
                </div>
              )}

              {vistaPrevia?.puede_agendar ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-semibold text-green-900">
                      ✓ Todas las citas pueden moverse correctamente
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm font-semibold text-red-900">
                      ✗ No se puede agendar la cita con estas condiciones
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between bg-gray-50">
          <button
            onClick={paso === 1 ? onClose : () => setPaso(1)}
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all font-semibold"
          >
            {paso === 1 ? 'Cancelar' : 'Atrás'}
          </button>
          <button
            onClick={paso === 1 ? handleGenerarVistaPrevia : handleConfirmar}
            disabled={loading || (paso === 2 && !vistaPrevia?.puede_agendar)}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
          >
            {loading ? 'Procesando...' : paso === 1 ? 'Ver Vista Previa →' : 'Confirmar y Agendar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Utilidad para calcular hora fin
const calcularHoraFin = (horaInicio, minutos) => {
  const [h, m] = horaInicio.split(':').map(Number);
  const date = new Date(2000, 0, 1, h, m);
  date.setMinutes(date.getMinutes() + minutos);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export default AgendarEnHuecoModal;
