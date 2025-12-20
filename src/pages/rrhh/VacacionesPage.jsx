import React, { useState, useEffect } from 'react';
import { CalendarIcon, UserIcon, PlusIcon, XMarkIcon, CheckCircleIcon, MagnifyingGlassIcon, ClockIcon } from '@heroicons/react/24/outline';
import {
  calcularVacaciones,
  registrarVacacion,
  getVacaciones,
  // deleteVacacion // DESHABILITADO: No se permite eliminar vacaciones
} from '../../services/rrhhService';

export default function VacacionesPage() {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [vacaciones, setVacaciones] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [resumen, setResumen] = useState({
    totalEmpleados: 0,
    empleadosConVacacionesPendientes: 0
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [modalRegistro, setModalRegistro] = useState({ open: false, empleado: null });
  const [formData, setFormData] = useState({
    fechaSalida: '',
    fechaRegreso: '',
    observaciones: ''
  });

  useEffect(() => {
    cargarVacaciones();
    cargarHistorial();
  }, [anio]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const cargarVacaciones = async () => {
    setLoading(true);
    try {
      const data = await calcularVacaciones({ anio });
      console.log('DATOS RECIBIDOS:', data.vacaciones[0]); // Ver qué llega del backend
      setVacaciones(data.vacaciones);
      setResumen({
        totalEmpleados: data.totalEmpleados,
        empleadosConVacacionesPendientes: data.empleadosConVacacionesPendientes
      });
    } catch (error) {
      console.error('Error al cargar vacaciones:', error);
      showNotification('Error al cargar vacaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cargarHistorial = async () => {
    try {
      const data = await getVacaciones({ anio });
      setHistorial(data);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  };

  const abrirModalRegistro = (empleado) => {
    setModalRegistro({ open: true, empleado });
    setFormData({
      fechaSalida: '',
      fechaRegreso: '',
      observaciones: ''
    });
  };

  const cerrarModalRegistro = () => {
    setModalRegistro({ open: false, empleado: null });
    setFormData({
      fechaSalida: '',
      fechaRegreso: '',
      observaciones: ''
    });
  };

  const calcularDiasSolicitados = () => {
    if (!formData.fechaSalida || !formData.fechaRegreso) return 0;
    const inicio = new Date(formData.fechaSalida);
    const fin = new Date(formData.fechaRegreso);
    const dias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
    return dias > 0 ? dias : 0;
  };

  const registrarVacaciones = async () => {
    const empleado = modalRegistro.empleado;
    if (!empleado) return;

    const diasSolicitados = calcularDiasSolicitados();
    if (diasSolicitados <= 0) {
      showNotification('Fecha inválida', 'error');
      return;
    }

    if (diasSolicitados > empleado.diasDisponibles) {
      showNotification(
        `Solo tiene ${empleado.diasDisponibles} días disponibles. Está solicitando ${diasSolicitados} días.`,
        'error'
      );
      return;
    }

    try {
      // Obtener usuario logueado
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      await registrarVacacion({
        empleadoId: empleado.id,
        fechaInicio: formData.fechaSalida,
        fechaFin: formData.fechaRegreso,
        periodoAnio: anio,
        observaciones: formData.observaciones,
        userId: user.id // ✅ Enviamos el ID del usuario que registra
      });

      showNotification(
        `Vacaciones registradas para ${empleado.nombres} ${empleado.apellidos}`,
        'success'
      );

      cerrarModalRegistro();
      await cargarVacaciones();
      await cargarHistorial();
    } catch (error) {
      console.error('Error al registrar vacaciones:', error);
      showNotification(
        error.response?.data?.message || 'Error al registrar vacaciones',
        'error'
      );
    }
  };

  // FUNCIÓN DESHABILITADA: No se permite eliminar vacaciones registradas
  // const eliminarVacacion = async (id, empleado) => {
  //   if (!window.confirm(`¿Eliminar vacaciones de ${empleado}?`)) return;

  //   try {
  //     await deleteVacacion(id);
  //     showNotification('Vacación eliminada', 'success');
  //     await cargarVacaciones();
  //     await cargarHistorial();
  //   } catch (error) {
  //     showNotification('Error al eliminar', 'error');
  //   }
  // };

  const formatearFechaHistorial = (fechaStr) => {
    if (!fechaStr) return '';
    try {
      // Convertir a string si no lo es
      const fechaString = String(fechaStr);

      // Extraer solo la parte de fecha YYYY-MM-DD
      let fechaSolo;
      if (fechaString.includes('T')) {
        fechaSolo = fechaString.split('T')[0];
      } else if (fechaString.includes(' ')) {
        fechaSolo = fechaString.split(' ')[0];
      } else {
        fechaSolo = fechaString;
      }

      // Parsear directamente sin usar Date()
      const partes = fechaSolo.split('-');
      if (partes.length === 3) {
        const [anio, mes, dia] = partes;
        // Quitar ceros a la izquierda para formato peruano
        const diaNum = parseInt(dia, 10);
        const mesNum = parseInt(mes, 10);
        return `${diaNum}/${mesNum}/${anio}`;
      }

      return fechaStr;
    } catch (error) {
      console.error('Error formateando fecha:', error, fechaStr);
      return fechaStr;
    }
  };

  const filteredVacaciones = vacaciones.filter(vac =>
    // Solo mostrar empleados con días disponibles
    vac.diasDisponibles > 0 &&
    (
      `${vac.nombres} ${vac.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vac.cargo.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#7B1FA2] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando vacaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:pt-12">

        {/* Notification */}
        {notification.show && (
          <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border transform transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-white border-gray-200'
              : 'bg-white border-red-200'
          } flex items-center gap-2.5`}>
            <div className={`w-1.5 h-1.5 rounded-full ${notification.type === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`}></div>
            <span className="text-xs font-medium text-gray-700">{notification.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-2xl flex items-center justify-center shadow-lg">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Gestión de Vacaciones</h1>
              <p className="text-gray-600">Control de vacaciones del personal (7 días por año trabajado)</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">Total Empleados</span>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{resumen.totalEmpleados}</div>
            <div className="text-xs text-gray-500 mt-1">Con derecho a vacaciones</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">Con Días Pendientes</span>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{resumen.empleadosConVacacionesPendientes}</div>
            <div className="text-xs text-gray-500 mt-1">Tienen días sin tomar</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">Año Actual</span>
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{anio}</div>
            <div className="text-xs text-gray-500 mt-1">Periodo de vacaciones</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">Historial</span>
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{historial.length}</div>
            <div className="text-xs text-gray-500 mt-1">Vacaciones registradas</div>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
                placeholder="Buscar por nombre o cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="w-full md:w-48">
              <select
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all bg-white"
                value={anio}
                onChange={(e) => setAnio(parseInt(e.target.value))}
              >
                {[2023, 2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de Empleados */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Empleado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Cargo</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">Años</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">Total</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">Tomados</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">Disponibles</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVacaciones.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 font-medium">No se encontraron empleados</p>
                    </td>
                  </tr>
                ) : (
                  filteredVacaciones.map((vac) => (
                    <tr key={vac.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {vac.nombres?.[0]}{vac.apellidos?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{vac.nombres} {vac.apellidos}</p>
                            <p className="text-xs text-gray-500">Ingreso: {formatearFechaHistorial(vac.fechaIngreso)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{vac.cargo?.nombre}</td>
                      <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">{vac.aniosTrabajados}</td>
                      <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">{vac.diasTotalesAcumulados}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">{vac.diasTomados}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-bold ${
                          vac.diasDisponibles > 4
                            ? 'text-green-600'
                            : vac.diasDisponibles > 0
                            ? 'text-amber-600'
                            : 'text-gray-500'
                        }`}>
                          {vac.diasDisponibles}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {vac.diasDisponibles > 0 && (
                          <button
                            onClick={() => abrirModalRegistro(vac)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#A3C644] text-white text-sm font-semibold rounded-lg hover:bg-[#8FB82D] transition-all shadow-sm hover:shadow"
                          >
                            <PlusIcon className="w-4 h-4" />
                            Registrar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Historial de Vacaciones - PARTE CORREGIDA */}
{historial.length > 0 && (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/30">
      <h2 className="text-base font-semibold text-gray-900">Historial de Vacaciones {anio}</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50/50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Empleado</th>
    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">Fecha Salida</th>
    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">Último Día</th>
    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">Días</th>
    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">Observaciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {historial.map((h) => (
            <tr key={h.id} className="hover:bg-gray-50/70 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {h.empleado.nombres?.[0]}{h.empleado.apellidos?.[0]}
                  </div>
                  <span className="font-semibold text-sm text-gray-900">
                    {h.empleado.nombres} {h.empleado.apellidos}
                  </span>
                </div>
              </td>
              {/* LÍNEAS CORREGIDAS - USANDO LA FUNCIÓN NUEVA */}
              <td className="px-6 py-4 text-center text-sm text-gray-700">
                {formatearFechaHistorial(h.fecha_inicio)}
              </td>
              <td className="px-6 py-4 text-center text-sm text-gray-700">
                {formatearFechaHistorial(h.fecha_fin)}
              </td>
              <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">{h.dias_tomados}</td>
              <td className="px-6 py-4 text-center text-sm text-gray-600">{h.observaciones || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

        {/* Modal Registro */}
        {modalRegistro.open && (
          <>
            <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={cerrarModalRegistro} />

            <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-2xl bg-white shadow-xl z-50 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex-shrink-0 bg-gradient-to-r from-[#7B1FA2] via-[#8E24AA] to-[#AB47BC] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1.5 flex items-center gap-2">
                      <CalendarIcon className="w-6 h-6" />
                      Registrar Vacaciones
                    </h2>
                    <p className="text-sm text-white/90">Registra las fechas de salida y regreso</p>
                  </div>
                  <button
                    onClick={cerrarModalRegistro}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Info del empleado */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Información del Empleado</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Nombre</p>
                        <p className="font-semibold text-sm text-gray-900">{modalRegistro.empleado?.nombres} {modalRegistro.empleado?.apellidos}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Cargo</p>
                        <p className="font-semibold text-sm text-gray-900">{modalRegistro.empleado?.cargo.nombre}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Días Disponibles</p>
                        <p className="font-bold text-2xl text-[#A3C644]">{modalRegistro.empleado?.diasDisponibles} días</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Años Trabajados</p>
                        <p className="font-semibold text-sm text-gray-900">{modalRegistro.empleado?.aniosTrabajados} {modalRegistro.empleado?.aniosTrabajados === 1 ? 'año' : 'años'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Formulario */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                          Fecha Salida <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white"
                          value={formData.fechaSalida}
                          onChange={(e) => setFormData({ ...formData, fechaSalida: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                          Último Día de Vacaciones <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white"
                          value={formData.fechaRegreso}
                          onChange={(e) => setFormData({ ...formData, fechaRegreso: e.target.value })}
                          min={formData.fechaSalida}
                        />
                      </div>
                    </div>

                    {formData.fechaSalida && formData.fechaRegreso && (
                      <div className={`rounded-lg p-3 border-2 ${
                        calcularDiasSolicitados() > modalRegistro.empleado?.diasDisponibles
                          ? 'bg-red-50 border-red-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <p className={`font-semibold text-sm ${
                          calcularDiasSolicitados() > modalRegistro.empleado?.diasDisponibles
                            ? 'text-red-700'
                            : 'text-blue-700'
                        }`}>
                          Días a solicitar: {calcularDiasSolicitados()} días
                        </p>
                        {calcularDiasSolicitados() > modalRegistro.empleado?.diasDisponibles && (
                          <p className="text-red-600 text-xs mt-1 font-medium">
                            ⚠️ Excede los días disponibles
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Observaciones</label>
                      <textarea
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white"
                        rows="3"
                        placeholder="Opcional: agregar observaciones..."
                        value={formData.observaciones}
                        onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={cerrarModalRegistro}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={registrarVacaciones}
                  disabled={!formData.fechaSalida || !formData.fechaRegreso || calcularDiasSolicitados() > modalRegistro.empleado?.diasDisponibles}
                  className="flex items-center gap-2 bg-[#A3C644] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Registrar Vacaciones
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
