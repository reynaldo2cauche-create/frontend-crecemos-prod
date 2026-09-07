import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ExclamationTriangleIcon,
  UserIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline';
import {
  getEmpleados,
  getTiposFalta,
  getTiposFaltaAll,
  crearTipoFalta,
  actualizarTipoFalta,
  registrarFalta,
  getFaltas,
  deleteFalta,
} from '../../services/rrhhService';

const MESES = [
  { id: 1, nombre: 'Enero' }, { id: 2, nombre: 'Febrero' }, { id: 3, nombre: 'Marzo' },
  { id: 4, nombre: 'Abril' }, { id: 5, nombre: 'Mayo' }, { id: 6, nombre: 'Junio' },
  { id: 7, nombre: 'Julio' }, { id: 8, nombre: 'Agosto' }, { id: 9, nombre: 'Septiembre' },
  { id: 10, nombre: 'Octubre' }, { id: 11, nombre: 'Noviembre' }, { id: 12, nombre: 'Diciembre' },
];

const DIAS_SEMANA = [
  { iso: 1, corto: 'L' }, { iso: 2, corto: 'M' }, { iso: 3, corto: 'X' },
  { iso: 4, corto: 'J' }, { iso: 5, corto: 'V' }, { iso: 6, corto: 'S' }, { iso: 7, corto: 'D' },
];

// ISO weekday (1=Lun..7=Dom) de un string YYYY-MM-DD, en UTC.
const isoWeekday = (fechaStr) => {
  const d = new Date(`${fechaStr}T00:00:00Z`).getUTCDay();
  return d === 0 ? 7 : d;
};

const parseDias = (csv) =>
  (csv || '')
    .split(',')
    .map((d) => parseInt(d.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 1 && n <= 7);

// Cuenta cuántos días labora en un mes calendario según su horario (mesIndex: 0=ene..11=dic).
const contarDiasLaborablesEnMes = (set, anio, mesIndex) => {
  let count = 0;
  for (let d = new Date(Date.UTC(anio, mesIndex, 1)); d.getUTCMonth() === mesIndex; d.setUTCDate(d.getUTCDate() + 1)) {
    const w = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
    if (set.has(w)) count++;
  }
  return count;
};

// Réplica del cálculo del backend para mostrar preview en vivo.
// El pago es mensual: valor día = sueldo / (días que trabaja en ESE mes real).
const calcularPreview = (empleado, fi, ff, descuenta) => {
  const dias = parseDias(empleado?.dias_laborables);
  const sueldo = Number(empleado?.sueldo_base) || 0;
  if (!dias.length || !sueldo || !fi || !ff) return null;

  const inicio = new Date(`${fi}T00:00:00Z`);
  const fin = new Date(`${ff}T00:00:00Z`);
  if (fin < inicio) return { error: 'La fecha fin no puede ser anterior a la fecha inicio.' };

  const set = new Set(dias);
  const divisor = contarDiasLaborablesEnMes(set, inicio.getUTCFullYear(), inicio.getUTCMonth());
  const valorDia = parseFloat((sueldo / divisor).toFixed(2));

  let cuenta = 0;
  for (let d = new Date(inicio); d <= fin; d.setUTCDate(d.getUTCDate() + 1)) {
    const w = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
    if (set.has(w)) cuenta++;
  }
  const montoDescuento = descuenta ? parseFloat((cuenta * valorDia).toFixed(2)) : 0;
  return { dias: cuenta, valorDia, montoDescuento, divisor };
};

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  const solo = String(fechaStr).split('T')[0].split(' ')[0];
  const partes = solo.split('-');
  if (partes.length === 3) return `${parseInt(partes[2], 10)}/${parseInt(partes[1], 10)}/${partes[0]}`;
  return fechaStr;
};

export default function FaltasPage({ embedded = false }) {
  const anioActual = new Date().getFullYear();
  const [anio, setAnio] = useState(anioActual);
  const [mesId, setMesId] = useState('');
  const [empleados, setEmpleados] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [faltas, setFaltas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTipos, setModalTipos] = useState(false);
  const [form, setForm] = useState({
    empleadoId: '',
    tipoFaltaId: '',
    fechaInicio: '',
    fechaFin: '',
    descuenta: true,
    montoDescuento: '',
    observaciones: '',
  });

  useEffect(() => {
    cargarBase();
  }, []);

  useEffect(() => {
    cargarFaltas();
  }, [anio, mesId]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const cargarBase = async () => {
    try {
      const [emps, tps] = await Promise.all([getEmpleados(), getTiposFalta()]);
      setEmpleados(Array.isArray(emps) ? emps : emps?.data || []);
      setTipos(tps || []);
    } catch (error) {
      console.error('Error al cargar datos base:', error);
      showNotification('Error al cargar empleados/tipos', 'error');
    }
  };

  const cargarFaltas = async () => {
    setLoading(true);
    try {
      const data = await getFaltas({ anio, mesId: mesId || undefined });
      setFaltas(data || []);
    } catch (error) {
      console.error('Error al cargar faltas:', error);
      showNotification('Error al cargar faltas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = () => {
    setForm({
      empleadoId: '',
      tipoFaltaId: '',
      fechaInicio: '',
      fechaFin: '',
      descuenta: true,
      montoDescuento: '',
      observaciones: '',
    });
    setModalOpen(true);
  };

  const cerrarModal = () => setModalOpen(false);

  const empleadoSel = empleados.find((e) => String(e.id) === String(form.empleadoId));

  const onTipoChange = (tipoFaltaId) => {
    const tipo = tipos.find((t) => String(t.id) === String(tipoFaltaId));
    setForm((f) => ({ ...f, tipoFaltaId, descuenta: tipo ? !!tipo.descuenta : f.descuenta }));
  };

  const guardar = async () => {
    if (!form.empleadoId || !form.tipoFaltaId || !form.fechaInicio || !form.fechaFin) {
      showNotification('Completa empleado, tipo y fechas', 'error');
      return;
    }
    if (form.descuenta && (form.montoDescuento === '' || Number(form.montoDescuento) < 0)) {
      showNotification('Ingresa el monto a descontar', 'error');
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await registrarFalta({
        empleadoId: Number(form.empleadoId),
        tipoFaltaId: Number(form.tipoFaltaId),
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        descuenta: form.descuenta,
        montoDescuento: form.descuenta ? Number(form.montoDescuento) : 0,
        observaciones: form.observaciones,
        userId: user.id,
      });
      showNotification('Falta registrada correctamente', 'success');
      cerrarModal();
      await cargarFaltas();
    } catch (error) {
      console.error('Error al registrar falta:', error);
      showNotification(error.response?.data?.message || 'Error al registrar falta', 'error');
    }
  };

  const eliminar = async (falta) => {
    if (!window.confirm(`¿Eliminar la falta de ${falta.empleado?.nombres} ${falta.empleado?.apellidos}?`)) return;
    try {
      await deleteFalta(falta.id);
      showNotification('Falta eliminada', 'success');
      await cargarFaltas();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error al eliminar', 'error');
    }
  };

  const faltasFiltradas = faltas.filter((f) =>
    `${f.empleado?.nombres} ${f.empleado?.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDescontar = faltasFiltradas
    .filter((f) => f.descuenta)
    .reduce((sum, f) => sum + Number(f.monto_descuento || 0), 0);

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'}>
      <div className={embedded ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:pt-12'}>

        {notification.show && (
          <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border bg-white border-gray-200 flex items-center gap-2.5">
            <div className={`w-1.5 h-1.5 rounded-full ${notification.type === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`}></div>
            <span className="text-xs font-medium text-gray-700">{notification.message}</span>
          </div>
        )}

        {/* Header + acciones */}
        <div className={`flex items-center justify-between flex-wrap gap-4 ${embedded ? 'mb-6' : 'mb-8'}`}>
          {!embedded ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-2xl flex items-center justify-center shadow-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Faltas y Permisos</h1>
                <p className="text-gray-600">Registro de inasistencias y descuento por días no laborados</p>
              </div>
            </div>
          ) : <div />}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalTipos(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 text-sm font-semibold rounded-lg border border-gray-200 hover:border-[#7B1FA2]/50 hover:text-[#7B1FA2] transition-all shadow-sm"
            >
              <Cog6ToothIcon className="w-5 h-5" />
              Configurar tipos
            </button>
            <button
              onClick={abrirModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#A3C644] text-white text-sm font-semibold rounded-lg hover:bg-[#8FB82D] transition-all shadow-sm hover:shadow"
            >
              <PlusIcon className="w-5 h-5" />
              Registrar Falta
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">Faltas registradas</span>
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{faltasFiltradas.length}</div>
            </div>
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">Total a descontar</span>
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                  <BanknotesIcon className="w-4 h-4 text-red-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-red-600">S/ {totalDescontar.toFixed(2)}</div>
            </div>
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">Periodo</span>
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-[#7B1FA2]" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{mesId ? MESES[mesId - 1].nombre : 'Todos'} {anio}</div>
            </div>
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
                placeholder="Buscar por empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <select
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] bg-white"
                value={mesId}
                onChange={(e) => setMesId(e.target.value ? parseInt(e.target.value) : '')}
              >
                <option value="">Todos los meses</option>
                {MESES.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
            <div className="w-full md:w-36">
              <select
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] bg-white"
                value={anio}
                onChange={(e) => setAnio(parseInt(e.target.value))}
              >
                {[anioActual - 2, anioActual - 1, anioActual, anioActual + 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de faltas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Empleado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Tipo</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">Desde</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">Hasta</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">Días</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">Descuento</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="8" className="px-6 py-16 text-center text-sm text-gray-500">Cargando...</td></tr>
                ) : faltasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center">
                      <ExclamationTriangleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 font-medium">No hay faltas registradas</p>
                    </td>
                  </tr>
                ) : (
                  faltasFiltradas.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {f.empleado?.nombres?.[0]}{f.empleado?.apellidos?.[0]}
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">{f.empleado?.nombres} {f.empleado?.apellidos}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{f.tipo?.nombre}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">{formatearFecha(f.fecha_inicio)}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">{formatearFecha(f.fecha_fin)}</td>
                      <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">{Number(f.dias)}</td>
                      <td className="px-6 py-4 text-center text-sm font-bold text-red-600">
                        {f.descuenta ? `S/ ${Number(f.monto_descuento).toFixed(2)}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {f.pago ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">Pagado</span>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">Pendiente</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!f.pago && (
                          <button
                            onClick={() => eliminar(f)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Eliminar"
                          >
                            <TrashIcon className="w-4 h-4" />
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

        {/* Modal Registro */}
        {modalOpen && (
          <>
            <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={cerrarModal} />
            <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-2xl bg-white shadow-xl z-50 overflow-hidden flex flex-col">
              <div className="flex-shrink-0 bg-gradient-to-r from-[#7B1FA2] via-[#8E24AA] to-[#AB47BC] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1.5 flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-6 h-6" />
                      Registrar Falta / Permiso
                    </h2>
                    <p className="text-sm text-white/90">El descuento se calcula según el horario del empleado</p>
                  </div>
                  <button onClick={cerrarModal} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Empleado <span className="text-red-500">*</span></label>
                    <EmpleadoCombobox
                      empleados={empleados}
                      value={form.empleadoId}
                      onChange={(id) => setForm({ ...form, empleadoId: id })}
                    />
                    {empleadoSel && (
                      <p className="text-xs mt-2 text-gray-500">
                        Horario:{' '}
                        {parseDias(empleadoSel.dias_laborables).length
                          ? DIAS_SEMANA.filter((d) => parseDias(empleadoSel.dias_laborables).includes(d.iso)).map((d) => d.corto).join(' ')
                          : <span className="text-red-500 font-semibold">sin configurar</span>}
                        {' · '}Sueldo: S/ {Number(empleadoSel.sueldo_base || 0).toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Tipo <span className="text-red-500">*</span></label>
                    <select
                      className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] bg-white"
                      value={form.tipoFaltaId}
                      onChange={(e) => onTipoChange(e.target.value)}
                    >
                      <option value="">Seleccionar tipo...</option>
                      {tipos.map((t) => (
                        <option key={t.id} value={t.id}>{t.nombre}{t.descuenta ? ' (descuenta)' : ' (sin descuento)'}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Desde <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] bg-white"
                        value={form.fechaInicio}
                        onChange={(e) => setForm({ ...form, fechaInicio: e.target.value, fechaFin: form.fechaFin || e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Hasta <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] bg-white"
                        value={form.fechaFin}
                        min={form.fechaInicio}
                        onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#7B1FA2]"
                      checked={form.descuenta}
                      onChange={(e) => setForm({ ...form, descuenta: e.target.checked })}
                    />
                    <span className="text-sm font-medium text-gray-700">Descontar del sueldo</span>
                  </label>

                  {/* Monto a descontar (manual) */}
                  {form.descuenta && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                        Monto a descontar (S/) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">S/</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full pl-9 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] bg-white"
                          placeholder="0.00"
                          value={form.montoDescuento}
                          onChange={(e) => setForm({ ...form, montoDescuento: e.target.value })}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">Ingresa manualmente el monto a descontar del sueldo.</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Observaciones</label>
                    <textarea
                      className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] resize-none bg-white"
                      rows="3"
                      placeholder="Opcional..."
                      value={form.observaciones}
                      onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                <button onClick={cerrarModal} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all">
                  Cancelar
                </button>
                <button
                  onClick={guardar}
                  disabled={!form.empleadoId || !form.tipoFaltaId || !form.fechaInicio || !form.fechaFin || (form.descuenta && form.montoDescuento === '')}
                  className="flex items-center gap-2 bg-[#A3C644] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Registrar
                </button>
              </div>
            </div>
          </>
        )}

        {/* Modal Configurar Tipos */}
        {modalTipos && (
          <ModalTipos
            onClose={() => setModalTipos(false)}
            onSaved={async () => {
              const tps = await getTiposFalta();
              setTipos(tps || []);
            }}
            notify={showNotification}
          />
        )}
      </div>
    </div>
  );
}

// Modal de configuración de tipos de falta (crear / editar / activar / marcar descuenta)
function ModalTipos({ onClose, onSaved, notify }) {
  const [tipos, setTipos] = useState([]);
  const [nuevo, setNuevo] = useState({ nombre: '', descuenta: true });
  const [cargando, setCargando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await getTiposFaltaAll();
      setTipos(data || []);
    } catch (e) {
      notify?.('Error al cargar tipos', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const guardarCambio = async (id, cambios) => {
    try {
      await actualizarTipoFalta(id, cambios);
      await cargar();
      onSaved?.();
    } catch (e) {
      notify?.(e.response?.data?.message || 'Error al actualizar', 'error');
    }
  };

  const crear = async () => {
    if (!nuevo.nombre.trim()) { notify?.('Escribe un nombre', 'error'); return; }
    try {
      await crearTipoFalta({ nombre: nuevo.nombre.trim(), descuenta: nuevo.descuenta });
      setNuevo({ nombre: '', descuenta: true });
      await cargar();
      onSaved?.();
      notify?.('Tipo creado', 'success');
    } catch (e) {
      notify?.(e.response?.data?.message || 'Error al crear', 'error');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-xl bg-white shadow-xl z-50 overflow-hidden flex flex-col">
        <div className="flex-shrink-0 bg-gradient-to-r from-[#7B1FA2] via-[#8E24AA] to-[#AB47BC] p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1.5 flex items-center gap-2">
                <Cog6ToothIcon className="w-6 h-6" />
                Tipos de Falta
              </h2>
              <p className="text-sm text-white/90">Define qué tipos existen y cuáles descuentan del sueldo</p>
            </div>
            <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Crear nuevo */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Nuevo tipo</p>
            <input
              type="text"
              className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] bg-white"
              placeholder="Ej: Permiso por lactancia"
              value={nuevo.nombre}
              onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#7B1FA2]"
                  checked={nuevo.descuenta}
                  onChange={(e) => setNuevo({ ...nuevo, descuenta: e.target.checked })}
                />
                <span className="text-sm text-gray-700">Descuenta del sueldo</span>
              </label>
              <button
                onClick={crear}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#A3C644] text-white text-sm font-semibold rounded-lg hover:bg-[#8FB82D] transition-all"
              >
                <PlusIcon className="w-4 h-4" /> Agregar
              </button>
            </div>
          </div>

          {/* Lista */}
          {cargando ? (
            <p className="text-sm text-gray-500 text-center py-6">Cargando...</p>
          ) : (
            <div className="space-y-2">
              {tipos.map((t) => (
                <div key={t.id} className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${t.activo ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{t.nombre}</p>
                    <p className="text-xs text-gray-400">{t.codigo}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <label className="flex items-center gap-1.5 cursor-pointer" title="Descuenta del sueldo">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[#7B1FA2]"
                        checked={!!t.descuenta}
                        onChange={(e) => guardarCambio(t.id, { descuenta: e.target.checked })}
                      />
                      <span className="text-xs text-gray-600">Descuenta</span>
                    </label>
                    <button
                      onClick={() => guardarCambio(t.id, { activo: !t.activo })}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${t.activo ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {t.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all">
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
}

// Combobox tipo autocompletar: se escribe en el mismo input y filtra abajo.
function EmpleadoCombobox({ empleados, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [editando, setEditando] = useState(false);
  const contenedorRef = useRef(null);

  const seleccionado = empleados.find((e) => String(e.id) === String(value));
  const nombreSel = seleccionado ? `${seleccionado.nombres} ${seleccionado.apellidos}` : '';

  // Lo que se muestra en el input: mientras editas, el texto tipeado; si no, el seleccionado.
  const textoInput = editando ? query : nombreSel;

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!editando || !q) return empleados;
    return empleados.filter((e) =>
      `${e.nombres} ${e.apellidos}`.toLowerCase().includes(q) ||
      String(e.dni || '').includes(q)
    );
  }, [empleados, query, editando]);

  // Cerrar al hacer clic fuera.
  useEffect(() => {
    const onClickFuera = (ev) => {
      if (contenedorRef.current && !contenedorRef.current.contains(ev.target)) {
        setOpen(false);
        setEditando(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onClickFuera);
    return () => document.removeEventListener('mousedown', onClickFuera);
  }, []);

  const seleccionar = (emp) => {
    onChange(String(emp.id));
    setOpen(false);
    setEditando(false);
    setQuery('');
  };

  return (
    <div className="relative" ref={contenedorRef}>
      <div className="relative">
        <input
          type="text"
          value={textoInput}
          placeholder="Buscar empleado por nombre o DNI..."
          onFocus={() => { setOpen(true); setEditando(true); setQuery(''); }}
          onChange={(e) => { setQuery(e.target.value); setEditando(true); setOpen(true); if (value) onChange(''); }}
          className="w-full pr-9 pl-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] bg-white"
        />
        <ChevronUpDownIcon
          onClick={() => { setOpen((o) => !o); setEditando(true); setQuery(''); }}
          className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
        />
      </div>

      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {filtrados.length === 0 ? (
              <p className="px-3 py-4 text-sm text-gray-400 text-center">Sin resultados</p>
            ) : (
              filtrados.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => seleccionar(e)}
                  className={`w-full text-left px-3 py-2.5 text-sm hover:bg-purple-50 transition-colors flex items-center justify-between ${
                    String(e.id) === String(value) ? 'bg-purple-50 text-[#7B1FA2] font-semibold' : 'text-gray-700'
                  }`}
                >
                  <span>{e.nombres} {e.apellidos}</span>
                  {e.dni && <span className="text-xs text-gray-400">{e.dni}</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
