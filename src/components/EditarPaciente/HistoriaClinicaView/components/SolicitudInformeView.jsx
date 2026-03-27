import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, X, Save, Calendar, DollarSign, User, Receipt,
  Eye, Trash2, AlertCircle, CheckCircle, Clock, ChevronDown
} from 'lucide-react';
import {
  crearSolicitudInforme,
  obtenerSolicitudesInformePorPaciente,
  actualizarSolicitudInforme,
  eliminarSolicitudInforme,
  obtenerModalidadesPago,
  obtenerEstadosPago
} from '../../../../services/solicitudInformeService';
import { getServiciosPorPaciente } from '../../../../services/pacienteService';
import { getVentasServicios } from '../../../../services/ventasService';
import { getTiposDocumento } from '../../../../services/tiposArchivoService';
import { useTerapeutas } from '../../../../hooks/useTerapeutas';

const SolicitudInformeView = ({ paciente, user }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalVer, setModalVer] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Catálogos
  const [servicios, setServicios] = useState([]);
  const [ventasServicios, setVentasServicios] = useState([]);
  const [tiposArchivo, setTiposArchivo] = useState([]);
  const terapeutas = useTerapeutas();
  const [modalidadesPago, setModalidadesPago] = useState([]);
  const [estadosPago, setEstadosPago] = useState([]);

  // Formulario
  const [formData, setFormData] = useState({
    servicio_id: '',
    venta_servicio_id: '',
    tipo_archivo_id: '',
    especialista_id: user?.id || '',
    fecha_solicitud: new Date().toISOString().split('T')[0],
    fecha_entrega: '',
    monto: 0,
    nro_recibo: '',
    modalidad_pago_id: '',
    estado_pago_id: 1, // Pendiente por defecto
    nota: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (paciente?.id) {
      cargarDatos();
    }
  }, [paciente?.id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [
        solicitudesData,
        serviciosData,
        ventasData = [],
        tiposArchivoData,
        modalidadesPagoData,
        estadosPagoData
      ] = await Promise.all([
        obtenerSolicitudesInformePorPaciente(paciente.id),
        getServiciosPorPaciente(paciente.id),
        getVentasServicios({ paciente_id: paciente.id }),
        getTiposDocumento(),
        obtenerModalidadesPago(),
        obtenerEstadosPago()
      ]);

      setSolicitudes(solicitudesData || []);
      setServicios(serviciosData || []);
      setVentasServicios(ventasData || []);
      setTiposArchivo(tiposArchivoData || []);
      setModalidadesPago(modalidadesPagoData || []);
      setEstadosPago(estadosPagoData || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      mostrarMensaje('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensaje = (mensaje, tipo = 'success') => {
    setSnackbarMessage(mensaje);
    setSnackbarSeverity(tipo);
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.servicio_id || !formData.venta_servicio_id || !formData.tipo_archivo_id ||
        !formData.especialista_id || !formData.monto || !formData.nro_recibo) {
      mostrarMensaje('Por favor complete todos los campos obligatorios', 'error');
      return;
    }

    try {
      setLoading(true);
      await crearSolicitudInforme(formData);
      mostrarMensaje('Solicitud de informe creada exitosamente');
      setModalCrear(false);
      limpiarFormulario();
      cargarDatos();
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      mostrarMensaje('Error al crear la solicitud de informe', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta solicitud?')) return;

    try {
      await eliminarSolicitudInforme(id);
      mostrarMensaje('Solicitud eliminada exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar solicitud:', error);
      mostrarMensaje('Error al eliminar la solicitud', 'error');
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      servicio_id: '',
      venta_servicio_id: '',
      tipo_archivo_id: '',
      especialista_id: user?.id || '',
      fecha_solicitud: new Date().toISOString().split('T')[0],
      fecha_entrega: '',
      monto: 0,
      nro_recibo: '',
      modalidad_pago_id: '',
      estado_pago_id: 1,
      nota: ''
    });
  };

  const getEstadoColor = (estadoId) => {
    switch (estadoId) {
      case 1: return { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' };
      case 2: return { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' };
    }
  };

  if (loading && solicitudes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-[#7B1FA2] rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 text-xs font-medium">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Notification */}
      {showSnackbar && (
        <div className={`fixed top-6 right-6 z-[90000] px-5 py-3 rounded-xl shadow-lg border transform transition-all duration-300 ${
          snackbarSeverity === 'success' ? 'bg-white border-gray-100' : 'bg-white border-red-100'
        } flex items-center gap-2.5`}>
          <div className={`w-1.5 h-1.5 rounded-full ${snackbarSeverity === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`}></div>
          <span className="text-xs font-medium text-gray-700">{snackbarMessage}</span>
          <button onClick={() => setShowSnackbar(false)} className="ml-2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Solicitudes de Informe</h3>
            <p className="text-sm text-gray-500">Gestión de informes terapéuticos</p>
          </div>
        </div>
        <button
          onClick={() => setModalCrear(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#7B1FA2] text-white rounded-lg hover:bg-[#6A1B9A] transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nueva Solicitud
        </button>
      </div>

      {/* Lista de Solicitudes */}
      {solicitudes.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No hay solicitudes de informe registradas</p>
          <button
            onClick={() => setModalCrear(true)}
            className="mt-4 text-[#7B1FA2] text-sm font-medium hover:underline"
          >
            Crear primera solicitud
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {solicitudes.map((solicitud) => {
            const estadoColor = getEstadoColor(solicitud.estado_pago_id);
            return (
              <div
                key={solicitud.id}
                className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {solicitud.servicio?.nombre}
                      </h4>
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${estadoColor.bg} ${estadoColor.text}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${estadoColor.dot}`}></div>
                        {solicitud.estado_pago?.nombre}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span>{solicitud.tipo_archivo?.nombre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{solicitud.especialista?.nombres} {solicitud.especialista?.apellidos}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Solicitado: {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-PE')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span>S/ {Number(solicitud.monto).toFixed(2)}</span>
                      </div>
                      {solicitud.fecha_entrega && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">Entregado: {new Date(solicitud.fecha_entrega).toLocaleDateString('es-PE')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSolicitudSeleccionada(solicitud);
                        setModalVer(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEliminar(solicitud.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Crear Solicitud */}
      {modalCrear && (
        <div className="fixed inset-0 z-[80000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalCrear(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Nueva Solicitud de Informe</h2>
              </div>
              <button
                onClick={() => setModalCrear(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Servicio */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Servicio <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.servicio_id}
                  onChange={(e) => setFormData({ ...formData, servicio_id: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
                  required
                >
                  <option value="">Seleccionar servicio...</option>
                  {servicios.map(servicio => (
                    <option key={servicio.servicio.id} value={servicio.servicio.id}>
                      {servicio.servicio.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Venta de Servicio */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Venta de Servicio <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.venta_servicio_id}
                  onChange={(e) => setFormData({ ...formData, venta_servicio_id: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
                  required
                >
                  <option value="">Seleccionar venta...</option>
                  {ventasServicios.map(venta => (
                    <option key={venta.id} value={venta.id}>
                      {venta.codigo_comprobante} - S/ {Number(venta.total).toFixed(2)} ({new Date(venta.fecha_venta).toLocaleDateString('es-PE')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Archivo */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Tipo de Informe <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tipo_archivo_id}
                  onChange={(e) => setFormData({ ...formData, tipo_archivo_id: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
                  required
                >
                  <option value="">Seleccionar tipo de informe...</option>
                  {tiposArchivo.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Especialista */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Especialista <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.especialista_id}
                  onChange={(e) => setFormData({ ...formData, especialista_id: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
                  required
                >
                  <option value="">Seleccionar especialista...</option>
                  {terapeutas.map(terapeuta => (
                    <option key={terapeuta.id} value={terapeuta.id}>
                      {terapeuta.nombres} {terapeuta.apellidos}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Fecha Solicitud */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Fecha de Solicitud <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_solicitud}
                    onChange={(e) => setFormData({ ...formData, fecha_solicitud: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
                    required
                  />
                </div>

                {/* Monto */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Monto (S/) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
                    required
                  />
                </div>
              </div>

              {/* Nro Recibo */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Número de Recibo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nro_recibo}
                  onChange={(e) => setFormData({ ...formData, nro_recibo: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
                  placeholder="Ej: REC-2024-001"
                  required
                />
              </div>

              {/* Modalidad de Pago */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Modalidad de Pago
                </label>
                <select
                  value={formData.modalidad_pago_id}
                  onChange={(e) => setFormData({ ...formData, modalidad_pago_id: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
                >
                  <option value="">Seleccionar modalidad...</option>
                  {modalidadesPago.map(modalidad => (
                    <option key={modalidad.id} value={modalidad.id}>
                      {modalidad.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nota */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Observaciones
                </label>
                <textarea
                  value={formData.nota}
                  onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all resize-none"
                  rows={3}
                  placeholder="Notas adicionales..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalCrear(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] rounded-xl hover:from-[#6A1B9A] hover:to-[#5E1690] transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Guardando...' : 'Guardar Solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Detalles */}
      {modalVer && solicitudSeleccionada && (
        <div className="fixed inset-0 z-[80000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalVer(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Detalles de la Solicitud</h2>
              </div>
              <button
                onClick={() => setModalVer(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Servicio</p>
                  <p className="text-sm text-gray-900">{solicitudSeleccionada.servicio?.nombre}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Tipo de Informe</p>
                  <p className="text-sm text-gray-900">{solicitudSeleccionada.tipo_archivo?.nombre}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Especialista</p>
                  <p className="text-sm text-gray-900">
                    {solicitudSeleccionada.especialista?.nombres} {solicitudSeleccionada.especialista?.apellidos}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Estado de Pago</p>
                  <p className="text-sm text-gray-900">{solicitudSeleccionada.estado_pago?.nombre}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Monto</p>
                  <p className="text-sm text-gray-900 font-semibold">S/ {Number(solicitudSeleccionada.monto).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Número de Recibo</p>
                  <p className="text-sm text-gray-900">{solicitudSeleccionada.nro_recibo}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Fecha de Solicitud</p>
                  <p className="text-sm text-gray-900">
                    {new Date(solicitudSeleccionada.fecha_solicitud).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                {solicitudSeleccionada.fecha_entrega && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Fecha de Entrega</p>
                    <p className="text-sm text-green-600 font-medium">
                      {new Date(solicitudSeleccionada.fecha_entrega).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {solicitudSeleccionada.modalidad_pago && (
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Modalidad de Pago</p>
                    <p className="text-sm text-gray-900">{solicitudSeleccionada.modalidad_pago.nombre}</p>
                  </div>
                )}
              </div>

              {solicitudSeleccionada.nota && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Observaciones</p>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{solicitudSeleccionada.nota}</p>
                </div>
              )}

              <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={() => setModalVer(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] rounded-xl hover:from-[#6A1B9A] hover:to-[#5E1690] transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitudInformeView;
