import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Plus, X, Save, Calendar, DollarSign, User, Receipt,
  Eye, Trash2, CheckCircle, ChevronDown, ChevronUp, AlertCircle,
  Package, Clock, Banknote, Hash
} from 'lucide-react';
import {
  crearSolicitudInforme,
  obtenerSolicitudesInformePorPaciente,
  eliminarSolicitudInforme,
  obtenerModalidadesPago,
  obtenerEstadosPago
} from '../../../../services/solicitudInformeService';
import { getVentasServicios } from '../../../../services/ventasService';
import { getTiposDocumento } from '../../../../services/tiposArchivoService';
import { getServiciosPorPaciente } from '../../../../services/pacienteService';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmtMoney = (v) => `S/ ${Number(v ?? 0).toFixed(2)}`;
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// Calcular fecha + N días (formato YYYY-MM-DD para input type="date")
const addDays = (dateStr, days) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const ESTADO_COLOR = {
  1: { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-400',  label: 'Pendiente' },
  2: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Pagado' },
};
const estadoStyle = (id) => ESTADO_COLOR[id] ?? { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', dot: 'bg-gray-400', label: '—' };

const getFormInitial = () => {
  const fechaSolicitud = new Date().toISOString().split('T')[0];
  const fechaEntrega = addDays(fechaSolicitud, 5); // 5 días después

  return {
    servicio_id:       null,
    venta_servicio_id: '',
    tipo_archivo_id:   '',
    especialista_id:   '',
    fecha_solicitud:   fechaSolicitud,
    fecha_entrega:     fechaEntrega,
    monto:             '',
    nro_recibo:        '',
    modalidad_pago_id: '',
    estado_pago_id:    1,
    nota:              '',
  };
};

// ─── Snackbar ────────────────────────────────────────────────────────────────

const Snackbar = ({ msg, tipo, onClose }) => (
  <div className={`
    fixed top-5 right-5 z-[99999] flex items-center gap-3
    px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
    transition-all duration-300
    ${tipo === 'error' ? 'bg-white border-red-200 text-red-700' : 'bg-white border-emerald-200 text-emerald-700'}
  `}>
    {tipo === 'error'
      ? <AlertCircle className="w-4 h-4 shrink-0" />
      : <CheckCircle className="w-4 h-4 shrink-0" />
    }
    <span>{msg}</span>
    <button onClick={onClose} className="ml-1 opacity-50 hover:opacity-100">
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
);

// ─── VentaCard (opción del select de venta) ──────────────────────────────────
// Muestra la info relevante de cada venta para que el usuario entienda qué está eligiendo

const VentaOptionCard = ({ venta, selected, onClick }) => {
  // Extraer ítems de informe físico (tipo_item_venta === 2) del detalle
  const itemsInforme = (venta.detalles ?? []).filter(d => d.tipoItemVenta === 2 || d.tipo_item_venta === 2);
  const descripcion  = itemsInforme.map(d => d.descripcionLinea ?? d.descripcion_linea ?? 'Informe').join(', ');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left px-4 py-3 rounded-xl border-2 transition-all
        ${selected
          ? 'border-[#7B1FA2] bg-purple-50'
          : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/40'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {venta.codigo_comprobante ?? `Venta #${venta.id}`}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{descripcion || 'Informe físico'}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-[#7B1FA2]">{fmtMoney(venta.total)}</p>
          <p className="text-xs text-gray-400">{fmtDate(venta.fecha_venta)}</p>
        </div>
      </div>
      {selected && (
        <div className="mt-2 flex items-center gap-1.5 text-[#7B1FA2]">
          <CheckCircle className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Seleccionada</span>
        </div>
      )}
    </button>
  );
};

// ─── VentaSelector ──────────────────────────────────────────────────────────
// Desplegable personalizado con tarjetas de venta

const VentaSelector = ({ ventas, value, onChange, loading }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = ventas.find(v => String(v.id) === String(value));

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          w-full px-4 py-2.5 border-2 rounded-xl text-sm text-left flex items-center justify-between
          transition-all focus:outline-none
          ${open ? 'border-[#7B1FA2] ring-2 ring-purple-100' : 'border-gray-200 hover:border-gray-300'}
          ${!selected ? 'text-gray-400' : 'text-gray-900'}
        `}
      >
        <span className="truncate">
          {selected
            ? `${selected.codigo_comprobante ?? `Venta #${selected.id}`} — ${fmtMoney(selected.total)}`
            : loading ? 'Cargando ventas...' : ventas.length === 0 ? 'Sin ventas con informe pendiente' : 'Seleccionar venta de informe...'
          }
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {ventas.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No hay ventas de informe disponibles
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto p-2 space-y-2">
              {ventas.map(v => (
                <VentaOptionCard
                  key={v.id}
                  venta={v}
                  selected={String(v.id) === String(value)}
                  onClick={() => { onChange(v.id); setOpen(false); }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Formulario inline ───────────────────────────────────────────────────────

const FormularioSolicitud = ({ onSubmit, onCancel, loading, ventasInforme, tiposArchivo, terapeutas, modalidadesPago, user }) => {
  const [form, setForm] = useState({ ...getFormInitial(), especialista_id: user?.id ?? '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const ventaSeleccionada = ventasInforme.find(v => String(v.id) === String(form.venta_servicio_id));

  // Si hay una sola venta disponible, preseleccionar
  useEffect(() => {
    if (ventasInforme.length === 1 && !form.venta_servicio_id) {
      seleccionarVenta(ventasInforme[0].id);
    }
  }, [ventasInforme]);

  // Actualizar fecha_entrega automáticamente cuando cambia fecha_solicitud
  useEffect(() => {
    if (form.fecha_solicitud) {
      const nuevaFechaEntrega = addDays(form.fecha_solicitud, 5);
      setForm(p => ({ ...p, fecha_entrega: nuevaFechaEntrega }));
    }
  }, [form.fecha_solicitud]);

  // Al elegir una venta: autocompletar monto, nro_recibo y derivar servicio_id (requerido por DTO)
  const seleccionarVenta = (ventaId) => {
    const venta = ventasInforme.find(v => String(v.id) === String(ventaId));
    if (!venta) { set('venta_servicio_id', ventaId); return; }

    // Monto: suma de ítems tipo informe físico (tipoItemVenta === 2)
    const itemsInforme = (venta.detalles ?? []).filter(
      d => d.tipoItemVenta === 2 || d.tipo_item_venta === 2
    );
    const montoInforme = itemsInforme.reduce(
      (acc, d) => acc + Number(d.subtotal ?? d.precio_unitario ?? 0), 0
    );

    // servicio_id: tomarlo del primer detalle de sesión (tipoItemVenta === 1)
    const detalleConServicio = (venta.detalles ?? []).find(
      d => (d.tipoItemVenta === 1 || d.tipo_item_venta === 1)
    ) ?? (venta.detalles ?? [])[0];
    const servicioId =
      detalleConServicio?.servicio_tarifa?.servicio?.id ??
      detalleConServicio?.servicio?.id ??
      null;

    setForm(p => ({
      ...p,
      venta_servicio_id: ventaId,
      servicio_id:       servicioId,
      monto:             montoInforme > 0 ? montoInforme.toFixed(2) : p.monto,
      nro_recibo:        venta.codigo_comprobante ?? p.nro_recibo,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validación mínima
    if (!form.venta_servicio_id) return;
    if (!form.servicio_id)       return;
    if (!form.tipo_archivo_id)   return;
    if (!form.especialista_id)   return;
    if (!form.monto || Number(form.monto) <= 0) return;
    if (!form.nro_recibo.trim()) return;

    onSubmit({
      ...form,
      servicio_id:   Number(form.servicio_id),
      monto:         parseFloat(form.monto),
      fecha_entrega: form.fecha_entrega || null,  // MySQL no acepta '' en columna date
      nota:          form.nota || null,
    });
  };

  const inputClass = "w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-purple-50 transition-all placeholder:text-gray-300";
  const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide";
  const required   = <span className="text-red-400 ml-0.5">*</span>;

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t border-gray-100 pt-5 space-y-5">

      {/* Step 1: Venta */}
      <div>
        <label className={labelClass}>
          <span className="flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5" /> Venta de informe {required}
          </span>
        </label>
        <VentaSelector
          ventas={ventasInforme}
          value={form.venta_servicio_id}
          onChange={seleccionarVenta}
          loading={loading}
        />
        {ventaSeleccionada && (
          <p className="mt-1.5 text-xs text-purple-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Venta del {fmtDate(ventaSeleccionada.fecha_venta)} por {fmtMoney(ventaSeleccionada.total)}
          </p>
        )}
      </div>

      {/* Step 2: Tipo de informe + especialista */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Tipo de informe {required}</span>
          </label>
          <select
            value={form.tipo_archivo_id}
            onChange={e => set('tipo_archivo_id', e.target.value)}
            className={inputClass}
            required
          >
            <option value="">Seleccionar...</option>
            {tiposArchivo.map(t => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Especialista {required}</span>
          </label>
          <select
            value={form.especialista_id}
            onChange={e => set('especialista_id', e.target.value)}
            className={inputClass}
            required
          >
            <option value="">Seleccionar...</option>
            {terapeutas.map(t => (
              <option key={t.id} value={t.id}>{t.nombres} {t.apellidos}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Step 3: Pago */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Monto (S/) {required}</span>
          </label>
          <div className="relative">
            <input
              type="number" step="0.01" min="0.01"
              value={form.monto}
              onChange={e => set('monto', e.target.value)}
              className={`${inputClass} ${ventaSeleccionada ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="30.00"
              required
              readOnly={ventaSeleccionada}
              disabled={ventaSeleccionada}
            />
            {ventaSeleccionada && form.monto && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-purple-400 bg-purple-50 px-1.5 py-0.5 rounded-md pointer-events-none">
                auto
              </span>
            )}
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> N° Recibo {required}</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={form.nro_recibo}
              onChange={e => set('nro_recibo', e.target.value)}
              className={`${inputClass} ${ventaSeleccionada ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="REC-001"
              required
              readOnly={ventaSeleccionada}
              disabled={ventaSeleccionada}
            />
            {ventaSeleccionada && form.nro_recibo && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-purple-400 bg-purple-50 px-1.5 py-0.5 rounded-md pointer-events-none">
                auto
              </span>
            )}
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5"><Banknote className="w-3.5 h-3.5" /> Modalidad</span>
          </label>
          <select
            value={form.modalidad_pago_id}
            onChange={e => set('modalidad_pago_id', e.target.value)}
            className={inputClass}
          >
            <option value="">Seleccionar...</option>
            {modalidadesPago.map(m => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Step 4: Fechas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Fecha solicitud {required}</span>
          </label>
          <input
            type="date"
            value={form.fecha_solicitud}
            onChange={e => set('fecha_solicitud', e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Fecha entrega
              <span className="text-[10px] font-semibold text-purple-400 bg-purple-50 px-1.5 py-0.5 rounded-md normal-case">
                +5 días auto
              </span>
            </span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={form.fecha_entrega}
              onChange={e => set('fecha_entrega', e.target.value)}
              className={inputClass}
              min={form.fecha_solicitud}
            />
          </div>
        </div>
      </div>

      {/* Nota */}
      <div>
        <label className={labelClass}>Observaciones</label>
        <textarea
          value={form.nota}
          onChange={e => set('nota', e.target.value)}
          className={`${inputClass} resize-none`}
          rows={2}
          placeholder="Notas adicionales..."
        />
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] disabled:opacity-50 flex items-center gap-2 transition-all"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Guardando...' : 'Registrar solicitud'}
        </button>
      </div>
    </form>
  );
};

// ─── Tarjeta de solicitud ─────────────────────────────────────────────────────

const SolicitudCard = ({ solicitud, onVer, onEliminar }) => {
  const style = estadoStyle(solicitud.estado_pago_id);
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Fila 1: servicio + estado */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {solicitud.tipo_archivo?.nombre ?? '—'}
            </span>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              {solicitud.estado_pago?.nombre ?? style.label}
            </span>
          </div>

          {/* Fila 2: metadatos */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5" />
              {solicitud.venta_servicio?.codigo_comprobante ?? `Venta #${solicitud.venta_servicio_id}`}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {solicitud.especialista?.nombres} {solicitud.especialista?.apellidos}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {fmtDate(solicitud.fecha_solicitud)}
            </span>
            <span className="flex items-center gap-1 font-semibold text-gray-700">
              <DollarSign className="w-3.5 h-3.5" />
              {fmtMoney(solicitud.monto)}
            </span>
            {solicitud.fecha_entrega && (
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle className="w-3.5 h-3.5" />
                Entregado {fmtDate(solicitud.fecha_entrega)}
              </span>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onVer(solicitud)}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
            title="Ver detalle"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEliminar(solicitud.id)}
            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modal Ver Detalles ───────────────────────────────────────────────────────

const ModalVer = ({ solicitud, onClose }) => {
  if (!solicitud) return null;
  const style = estadoStyle(solicitud.estado_pago_id);

  return (
    <div className="fixed inset-0 z-[80000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-white" />
            </div>
            <h2 className="text-base font-bold text-white">Detalle de Solicitud</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['Tipo de informe',  solicitud.tipo_archivo?.nombre],
              ['Venta asociada',   solicitud.venta_servicio?.codigo_comprobante ?? `#${solicitud.venta_servicio_id}`],
              ['Especialista',     `${solicitud.especialista?.nombres ?? ''} ${solicitud.especialista?.apellidos ?? ''}`],
              ['Monto',            fmtMoney(solicitud.monto)],
              ['N° Recibo',        solicitud.nro_recibo],
              ['Modalidad de pago', solicitud.modalidad_pago?.nombre ?? '—'],
              ['Fecha solicitud',  fmtDate(solicitud.fecha_solicitud)],
              ['Fecha entrega',    fmtDate(solicitud.fecha_entrega)],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-gray-900 font-medium">{val || '—'}</p>
              </div>
            ))}

            <div className="col-span-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Estado</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
                <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                {solicitud.estado_pago?.nombre ?? style.label}
              </span>
            </div>
          </div>

          {solicitud.nota && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Observaciones</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{solicitud.nota}</p>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] transition-all">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────

const SolicitudInformeView = ({ paciente, user }) => {
  const [solicitudes,       setSolicitudes]       = useState([]);
  const [ventasInforme,     setVentasInforme]     = useState([]);
  const [tiposArchivo,      setTiposArchivo]      = useState([]);
  const [modalidadesPago,   setModalidadesPago]   = useState([]);
  const [terapeutas,        setTerapeutas]        = useState([]);  // solo los asignados al paciente
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modalVer,          setModalVer]          = useState(null);
  const [loading,           setLoading]           = useState(false);
  const [snack,             setSnack]             = useState(null);

  // ── Snack helper ──
  const toast = (msg, tipo = 'success') => {
    setSnack({ msg, tipo });
    setTimeout(() => setSnack(null), 3500);
  };

  // ── Carga inicial ──
  useEffect(() => {
    if (paciente?.id) cargarDatos();
  }, [paciente?.id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const [solicitudesData, ventasData, tiposData, modalidadesData, serviciosPaciente] = await Promise.all([
        obtenerSolicitudesInformePorPaciente(paciente.id),
        getVentasServicios({ pacienteId: paciente.id }),
        getTiposDocumento(),
        obtenerModalidadesPago(),
        getServiciosPorPaciente(paciente.id),
      ]);

      setSolicitudes(solicitudesData ?? []);
      setTiposArchivo(tiposData ?? []);
      setModalidadesPago(modalidadesData ?? []);

      // Extraer terapeutas únicos asignados al paciente
      // Estructura: [{ asignaciones: [{ estado, activo, terapeuta: {...} }] }]
      const terapeutasMap = new Map();
      (serviciosPaciente ?? []).forEach(item => {
        (item.asignaciones ?? []).forEach(asignacion => {
          if (asignacion.estado === 'ACTIVO' && asignacion.activo && asignacion.terapeuta?.id) {
            terapeutasMap.set(asignacion.terapeuta.id, asignacion.terapeuta);
          }
        });
      });
      setTerapeutas([...terapeutasMap.values()]);

      // ── Filtrar ventas aptas para solicitud de informe ──
      // Regla: deben tener al menos 1 detalle con tipoItemVenta === 2 (cobro puntual/informe físico)
      // y no haber sido ya usadas en una solicitud existente
      const ventaIdsYaUsadas = new Set(
        (solicitudesData ?? []).map(s => s.venta_servicio_id).filter(Boolean)
      );

      const ventasFiltradas = (ventasData ?? []).filter(v => {
        const tieneInforme = (v.detalles ?? []).some(
          d => d.tipoItemVenta === 2 || d.tipo_item_venta === 2
        );
        const noUsada = !ventaIdsYaUsadas.has(v.id);
        return tieneInforme && noUsada;
      });

      setVentasInforme(ventasFiltradas);
    } catch (err) {
      console.error(err);
      toast('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Submit ──
  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      await crearSolicitudInforme(formData);
      toast('Solicitud registrada correctamente');
      setMostrarFormulario(false);
      await cargarDatos();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message ?? 'Error al registrar la solicitud';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Eliminar ──
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta solicitud?')) return;
    try {
      await eliminarSolicitudInforme(id);
      toast('Solicitud eliminada');
      cargarDatos();
    } catch (err) {
      toast('Error al eliminar', 'error');
    }
  };

  // ── Render ──
  return (
    <div className="space-y-4">
      {snack && <Snackbar msg={snack.msg} tipo={snack.tipo} onClose={() => setSnack(null)} />}
      {modalVer && <ModalVer solicitud={modalVer} onClose={() => setModalVer(null)} />}

      {/* Header del acordión */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
            <FileText className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Solicitudes de Informe</h3>
            <p className="text-xs text-gray-400">
              {solicitudes.length === 0 ? 'Sin solicitudes' : `${solicitudes.length} solicitud${solicitudes.length > 1 ? 'es' : ''}`}
            </p>
          </div>
        </div>

        {!mostrarFormulario && (
          <button
            onClick={() => setMostrarFormulario(true)}
            disabled={ventasInforme.length === 0 && !loading}
            title={ventasInforme.length === 0 ? 'No hay ventas de informe disponibles' : ''}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#7B1FA2] text-white rounded-xl text-xs font-semibold hover:bg-[#6A1B9A] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Nueva solicitud
          </button>
        )}
      </div>

      {/* Formulario inline (se abre/cierra en el acordión) */}
      {mostrarFormulario && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold text-gray-800">Nueva solicitud de informe</p>
            <button
              onClick={() => setMostrarFormulario(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Aviso si no hay ventas disponibles */}
          {ventasInforme.length === 0 ? (
            <div className="mt-3 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>No hay ventas con informe físico disponibles para este paciente, o todas ya tienen solicitud asociada.</p>
            </div>
          ) : (
            <FormularioSolicitud
              onSubmit={handleSubmit}
              onCancel={() => setMostrarFormulario(false)}
              loading={loading}
              ventasInforme={ventasInforme}
              tiposArchivo={tiposArchivo}
              terapeutas={terapeutas}
              modalidadesPago={modalidadesPago}
              user={user}
            />
          )}
        </div>
      )}

      {/* Lista de solicitudes */}
      {loading && solicitudes.length === 0 ? (
        <div className="py-8 flex justify-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin" />
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No hay solicitudes registradas</p>
        </div>
      ) : (
        <div className="space-y-2">
          {solicitudes.map(s => (
            <SolicitudCard
              key={s.id}
              solicitud={s}
              onVer={setModalVer}
              onEliminar={handleEliminar}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SolicitudInformeView;