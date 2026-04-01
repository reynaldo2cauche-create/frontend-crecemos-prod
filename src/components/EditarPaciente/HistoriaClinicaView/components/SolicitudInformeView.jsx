import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Plus, X, Save, Calendar, DollarSign, User, Receipt,
  Eye, Trash2, CheckCircle, ChevronDown, ChevronUp, AlertCircle,
  Package, Clock, Banknote, Hash, Upload, Check, XCircle, FileCheck,
  Send, Download, ZoomIn, ZoomOut, RotateCw, Info,
} from 'lucide-react';
import {
  crearSolicitudInforme,
  obtenerSolicitudesInformePorPaciente,
  eliminarSolicitudInforme,
  obtenerModalidadesPago,
  subirArchivoInforme,
  revisarInforme,
  marcarInformeEntregado,
  obtenerRevisionesInforme,
} from '../../../../services/solicitudInformeService';
import { getVentasServicios } from '../../../../services/ventasService';
import { getTiposDocumento } from '../../../../services/tiposArchivoService';
import { getServiciosPorPaciente } from '../../../../services/pacienteService';
import { SERVER_BASE_URL } from '../../../../services/api';
import { ROLES } from '../../../../constants/roles';

// ─── Constantes ───────────────────────────────────────────────────────────────

const ESTADO = {
  PENDIENTE_SUBIDA:   1,
  PENDIENTE_REVISION: 2,
  RECHAZADO:          3,
  APROBADO:           4,
  ENTREGADO:          5,
};

const ESTADO_STYLE = {
  1: { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-400',   label: 'Pendiente Subida',    Icon: Clock },
  2: { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    dot: 'bg-blue-500',    label: 'Pendiente Revisión',  Icon: Eye },
  3: { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     dot: 'bg-red-500',     label: 'Rechazado',           Icon: XCircle },
  4: { bg: 'bg-green-50',   border: 'border-green-200',   text: 'text-green-700',   dot: 'bg-green-500',   label: 'Aprobado',            Icon: CheckCircle },
  5: { bg: 'bg-purple-50',  border: 'border-purple-200',  text: 'text-purple-700',  dot: 'bg-purple-500',  label: 'Entregado',           Icon: Package },
};

const ESTADO_PAGO_STYLE = {
  1: { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-400',   label: 'Pendiente' },
  2: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Pagado' },
};

const estadoStyle     = (id) => ESTADO_STYLE[id]      ?? { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', dot: 'bg-gray-400', label: '—', Icon: AlertCircle };
const estadoPagoStyle = (id) => ESTADO_PAGO_STYLE[id] ?? { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', dot: 'bg-gray-400', label: '—' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtMoney = (v) => `S/ ${Number(v ?? 0).toFixed(2)}`;

/**
 * Formatea una fecha evitando problemas de zona horaria.
 * Si la fecha viene como "2024-04-01T00:00:00Z", la trata como fecha local.
 */
const fmtDate = (d) => {
  if (!d) return '—';

  // Si viene en formato ISO, extraer solo la parte de fecha (YYYY-MM-DD)
  const dateStr = typeof d === 'string' ? d.split('T')[0] : d;

  // Crear fecha como local (sin conversión de zona horaria)
  const [year, month, day] = dateStr.split('-').map(Number);
  const fecha = new Date(year, month - 1, day); // month - 1 porque los meses van de 0-11

  return fecha.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Lima'
  });
};

const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const isPDF  = (url) => url?.toLowerCase().endsWith('.pdf');
const isWord = (url) => /\.(doc|docx)$/i.test(url ?? '');

const getFormInitial = () => {
  const hoy = new Date().toISOString().split('T')[0];
  return {
    servicio_id: null, venta_servicio_id: '', tipo_archivo_id: '',
    especialista_id: '', fecha_solicitud: hoy, fecha_entrega: addDays(hoy, 5),
    monto: '', nro_recibo: '', modalidad_pago_id: '', estado_pago_id: 1, nota: '',
  };
};

/**
 * Verifica permisos según roles
 */
const puedeCrearSolicitud = (user) => {
  if (!user?.rol?.id) return false;
  return user.rol.id === ROLES.ADMINISTRADOR || user.rol.id === ROLES.ADMISION;
};

const puedeVerInformacionBancaria = (user, solicitud) => {
  if (!user?.rol?.id) return false;
  // Solo Admisión y Administrador pueden ver información de venta/bancaria
  return user.rol.id === ROLES.ADMINISTRADOR || user.rol.id === ROLES.ADMISION;
};

const puedeEliminarSolicitud = (user) => {
  if (!user?.rol?.id) return false;
  // Solo Admisión y Administrador pueden eliminar
  return user.rol.id === ROLES.ADMINISTRADOR || user.rol.id === ROLES.ADMISION;
};

/**
 * Lógica de permisos del workflow.
 *
 * Quién puede hacer qué en cada estado:
 * - PENDIENTE_SUBIDA   → la terapeuta asignada sube el archivo
 * - PENDIENTE_REVISION → la jefa de la terapeuta (o la misma terapeuta si es_jefe) revisa
 * - RECHAZADO          → la terapeuta asignada corrige y re-sube
 * - APROBADO           → admision/admin marca como entregado
 * - ENTREGADO          → flujo cerrado
 */
const resolverAcciones = (solicitud, user) => {
  if (!solicitud || !user) return {};

  const esAsignada   = user.id === solicitud.especialista_id;
  const especialista = solicitud.especialista ?? {};

  // cargo.es_jefe viene del backend (trabajador_centro → cargo → es_jefe)
  const terapeutaEsJefa = Boolean(especialista.cargo?.es_jefe);
  const userEsJefa = Boolean(user.cargo?.es_jefe);

  // 🔍 DEBUG: Log de permisos
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 DEBUG - Resolver Acciones para solicitud #' + solicitud.id);
  console.log('👤 Usuario logueado:', { id: user.id, nombre: user.nombres, rol: user.rol, cargo: user.cargo });
  console.log('📋 Solicitud estado:', solicitud.estado_solicitud_id, ESTADO_STYLE[solicitud.estado_solicitud_id]?.label);
  console.log('👩‍⚕️ Especialista asignada:', { id: especialista.id, nombre: especialista.nombres, cargo: especialista.cargo });
  console.log('✅ Es asignada?:', esAsignada);
  console.log('👔 Usuario es jefe?:', userEsJefa);
  console.log('👔 Terapeuta es jefa?:', terapeutaEsJefa);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const estado = solicitud.estado_solicitud_id;

  // Si la terapeuta asignada es jefa, puede subir directamente sin revisión
  // En ese caso, cuando sube el archivo, el backend debería aprobar automáticamente

  // La terapeuta asignada puede subir
  const puedeSubir = esAsignada && estado === ESTADO.PENDIENTE_SUBIDA;
  const puedeReSubir = esAsignada && estado === ESTADO.RECHAZADO;

  // La jefa puede revisar si:
  // 1. Es jefa Y NO es la terapeuta asignada (revisa el trabajo de otras)
  // 2. O es la terapeuta asignada Y es jefa (auto-revisa su propio trabajo)
  const puedeRevisar = userEsJefa && estado === ESTADO.PENDIENTE_REVISION;

  // Solo Admisión y Administrador pueden marcar como entregado
  const puedeEntregar = estado === ESTADO.APROBADO &&
                        (user.rol?.id === ROLES.ADMINISTRADOR || user.rol?.id === ROLES.ADMISION);

  const acciones = {
    subir:    puedeSubir,
    reSubir:  puedeReSubir,
    revisar:  puedeRevisar,
    entregar: puedeEntregar,
  };

  console.log('🎯 Acciones permitidas:', acciones);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return acciones;
};

// ─── Clases reutilizables ─────────────────────────────────────────────────────

const INPUT_CLS = 'w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-purple-50 transition-all placeholder:text-gray-300';
const LABEL_CLS = 'block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide';

// ─── Snackbar ─────────────────────────────────────────────────────────────────

const Snackbar = ({ msg, tipo, onClose }) => (
  <div className={`
    fixed top-5 right-5 z-[99999] flex items-center gap-3
    px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
    ${tipo === 'error' ? 'bg-white border-red-200 text-red-700' : 'bg-white border-emerald-200 text-emerald-700'}
  `}>
    {tipo === 'error'
      ? <AlertCircle className="w-4 h-4 shrink-0" />
      : <CheckCircle className="w-4 h-4 shrink-0" />}
    <span>{msg}</span>
    <button onClick={onClose} className="ml-1 opacity-50 hover:opacity-100">
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
);

// ─── Modal de Confirmación ────────────────────────────────────────────────────

const ModalConfirmacion = ({ isOpen, onClose, onConfirm, titulo, mensaje, tipo = 'danger', loading = false }) => {
  if (!isOpen) return null;

  const configs = {
    danger: {
      color: 'red',
      icon: Trash2,
      bgGradient: 'from-red-500 to-red-600',
      btnClass: 'bg-red-500 hover:bg-red-600',
    },
    warning: {
      color: 'amber',
      icon: AlertCircle,
      bgGradient: 'from-amber-500 to-amber-600',
      btnClass: 'bg-amber-500 hover:bg-amber-600',
    },
    success: {
      color: 'green',
      icon: CheckCircle,
      bgGradient: 'from-green-500 to-green-600',
      btnClass: 'bg-green-500 hover:bg-green-600',
    },
  };

  const config = configs[tipo] || configs.danger;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[90000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className={`bg-gradient-to-r ${config.bgGradient} px-6 py-4 rounded-t-2xl flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base font-bold text-white">{titulo}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-700 leading-relaxed">{mensaje}</p>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-5 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50 flex items-center gap-2 transition-all ${config.btnClass}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirmar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Modal de Alerta ──────────────────────────────────────────────────────────

const ModalAlerta = ({ isOpen, onClose, titulo, mensaje, tipo = 'error' }) => {
  if (!isOpen) return null;

  const configs = {
    error: {
      color: 'red',
      icon: XCircle,
      bgGradient: 'from-red-500 to-red-600',
    },
    warning: {
      color: 'amber',
      icon: AlertCircle,
      bgGradient: 'from-amber-500 to-amber-600',
    },
    info: {
      color: 'blue',
      icon: Info,
      bgGradient: 'from-blue-500 to-blue-600',
    },
  };

  const config = configs[tipo] || configs.error;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[90000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className={`bg-gradient-to-r ${config.bgGradient} px-6 py-4 rounded-t-2xl flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base font-bold text-white">{titulo}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-700 leading-relaxed">{mensaje}</p>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-white bg-gray-600 rounded-xl hover:bg-gray-700 transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── VentaOptionCard ──────────────────────────────────────────────────────────

const VentaOptionCard = ({ venta, selected, onClick }) => {
  const itemsInforme = (venta.detalles ?? []).filter(
    d => d.tipoItemVenta === 2 || d.tipo_item_venta === 2
  );
  const descripcion = itemsInforme
    .map(d => d.descripcionLinea ?? d.descripcion_linea ?? 'Informe')
    .join(', ');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all
        ${selected
          ? 'border-[#7B1FA2] bg-purple-50'
          : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/40'
        }`}
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

// ─── VentaSelector ────────────────────────────────────────────────────────────

const VentaSelector = ({ ventas, value, onChange, loading }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = ventas.find(v => String(v.id) === String(value));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm text-left flex items-center justify-between
          transition-all focus:outline-none
          ${open ? 'border-[#7B1FA2] ring-2 ring-purple-100' : 'border-gray-200 hover:border-gray-300'}
          ${!selected ? 'text-gray-400' : 'text-gray-900'}`}
      >
        <span className="truncate">
          {selected
            ? `${selected.codigo_comprobante ?? `Venta #${selected.id}`} — ${fmtMoney(selected.total)}`
            : loading ? 'Cargando...' : ventas.length === 0 ? 'Sin ventas disponibles' : 'Seleccionar venta...'}
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {ventas.length === 0
            ? <div className="px-4 py-6 text-center text-sm text-gray-400">No hay ventas disponibles</div>
            : (
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

// ─── FormularioSolicitud ──────────────────────────────────────────────────────

const FormularioSolicitud = ({
  onSubmit, onCancel, loading,
  ventasInforme, tiposArchivo, terapeutas, modalidadesPago, user,
  serviciosPaciente, // 👈 Nuevo: para buscar servicio_id por terapeuta
  onMostrarAlerta, // 👈 Callback para mostrar alertas
}) => {
  const [form, setForm] = useState({ ...getFormInitial(), especialista_id: user?.id ?? '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  /**
   * Busca el servicio_id del paciente que está asignado a la terapeuta seleccionada
   */
  const buscarServicioPorTerapeuta = (terapeutaId) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 Buscando servicio para terapeuta ID:', terapeutaId);
    console.log('📦 Total de servicios del paciente:', serviciosPaciente?.length);

    for (const servicio of serviciosPaciente) {
      console.log('\n🔍 Analizando servicio:', {
        id: servicio.id,
        servicio_id: servicio.servicio_id,
        servicio: servicio.servicio,
        'servicio.id': servicio.servicio?.id,
        asignaciones: servicio.asignaciones?.length,
      });

      const asignacion = (servicio.asignaciones ?? []).find(
        a => a.terapeuta?.id === Number(terapeutaId) && a.estado === 'ACTIVO' && a.activo
      );

      if (asignacion) {
        console.log('✅ ¡MATCH! Asignación encontrada:', {
          terapeuta: asignacion.terapeuta?.nombres,
          estado: asignacion.estado,
          activo: asignacion.activo,
        });

        // Mostrar todas las opciones posibles de servicio_id
        const opciones = {
          'servicio.servicio_id': servicio.servicio_id,
          'servicio.id': servicio.id,
          'servicio.servicio?.id': servicio.servicio?.id,
          'servicio.servicio?.servicio_id': servicio.servicio?.servicio_id,
          'asignacion.servicio_id': asignacion.servicio_id,
        };
        console.log('🎯 Opciones de servicio_id disponibles:', opciones);

        // Intentar múltiples ubicaciones
        let servicioIdFinal = null;

        if (servicio.servicio?.id) {
          servicioIdFinal = servicio.servicio.id;
          console.log('✅ Usando: servicio.servicio.id =', servicioIdFinal);
        } else if (servicio.servicio_id) {
          servicioIdFinal = servicio.servicio_id;
          console.log('✅ Usando: servicio.servicio_id =', servicioIdFinal);
        } else if (servicio.id) {
          servicioIdFinal = servicio.id;
          console.log('⚠️ Usando: servicio.id =', servicioIdFinal, '(puede no ser correcto)');
        } else {
          console.error('❌ No se pudo determinar servicio_id');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return servicioIdFinal;
      }
    }

    console.error('❌ No se encontró servicio asignado para terapeuta:', terapeutaId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return null;
  };

  const ventaSeleccionada = ventasInforme.find(v => String(v.id) === String(form.venta_servicio_id));

  // Auto-seleccionar si solo hay una venta
  useEffect(() => {
    if (ventasInforme.length === 1 && !form.venta_servicio_id) seleccionarVenta(ventasInforme[0].id);
  }, [ventasInforme]);

  // Fecha entrega = fecha solicitud + 5 días (auto)
  useEffect(() => {
    if (form.fecha_solicitud) set('fecha_entrega', addDays(form.fecha_solicitud, 5));
  }, [form.fecha_solicitud]);

  const seleccionarVenta = (ventaId) => {
    const venta = ventasInforme.find(v => String(v.id) === String(ventaId));
    if (!venta) { set('venta_servicio_id', ventaId); return; }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💳 Venta seleccionada:', venta.codigo_comprobante);

    // Calcular monto del informe (ítems de tipo 2)
    const itemsInforme = (venta.detalles ?? []).filter(
      d => d.tipoItemVenta === 2 || d.tipo_item_venta === 2
    );
    const montoInforme = itemsInforme.reduce(
      (acc, d) => acc + Number(d.subtotal ?? d.precio_unitario ?? 0), 0
    );

    console.log('💰 Monto del informe:', montoInforme);
    console.log('📋 N° Recibo:', venta.codigo_comprobante);
    console.log('ℹ️ servicio_id se asignará cuando selecciones la terapeuta');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    setForm(p => ({
      ...p,
      venta_servicio_id: ventaId,
      // servicio_id se llenará cuando se seleccione el especialista
      monto: montoInforme > 0 ? montoInforme.toFixed(2) : p.monto,
      nro_recibo: venta.codigo_comprobante ?? p.nro_recibo,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Intentando guardar solicitud de informe');
    console.log('📋 Datos del formulario:', form);

    // Validación con mensajes de error específicos
    if (!form.venta_servicio_id) {
      console.error('❌ Error: Falta venta_servicio_id');
      // Usar prop onMostrarAlerta pasada desde el componente padre
      if (onMostrarAlerta) {
        onMostrarAlerta({
          titulo: 'Campo requerido',
          mensaje: 'Por favor selecciona una venta de informe',
          tipo: 'warning'
        });
      }
      return;
    }
    if (!form.servicio_id) {
      console.error('❌ Error: Falta servicio_id (debe auto-llenarse de la venta)');
      if (onMostrarAlerta) {
        onMostrarAlerta({
          titulo: 'Error de configuración',
          mensaje: 'No se pudo obtener el servicio de la venta seleccionada. Por favor, verifica que la terapeuta esté asignada al paciente.',
          tipo: 'error'
        });
      }
      return;
    }
    if (!form.tipo_archivo_id) {
      console.error('❌ Error: Falta tipo_archivo_id');
      if (onMostrarAlerta) {
        onMostrarAlerta({
          titulo: 'Campo requerido',
          mensaje: 'Por favor selecciona el tipo de informe',
          tipo: 'warning'
        });
      }
      return;
    }
    if (!form.especialista_id) {
      console.error('❌ Error: Falta especialista_id');
      if (onMostrarAlerta) {
        onMostrarAlerta({
          titulo: 'Campo requerido',
          mensaje: 'Por favor selecciona un especialista',
          tipo: 'warning'
        });
      }
      return;
    }
    if (!form.monto || Number(form.monto) <= 0) {
      console.error('❌ Error: Monto inválido:', form.monto);
      if (onMostrarAlerta) {
        onMostrarAlerta({
          titulo: 'Monto inválido',
          mensaje: 'El monto debe ser mayor a 0',
          tipo: 'error'
        });
      }
      return;
    }
    if (!form.nro_recibo || !form.nro_recibo.trim()) {
      console.error('❌ Error: Falta nro_recibo');
      if (onMostrarAlerta) {
        onMostrarAlerta({
          titulo: 'Campo requerido',
          mensaje: 'Por favor ingresa el número de recibo',
          tipo: 'warning'
        });
      }
      return;
    }

    console.log('✅ Validación exitosa, enviando datos...');

    onSubmit({
      ...form,
      servicio_id:       Number(form.servicio_id),
      venta_servicio_id: Number(form.venta_servicio_id),
      tipo_archivo_id:   Number(form.tipo_archivo_id),
      especialista_id:   Number(form.especialista_id),
      monto:             parseFloat(form.monto),
      modalidad_pago_id: form.modalidad_pago_id ? Number(form.modalidad_pago_id) : null,
      estado_pago_id:    form.estado_pago_id ? Number(form.estado_pago_id) : 1,
      fecha_entrega:     form.fecha_entrega || null,
      nota:              form.nota || null,
    });
  };

  const required = <span className="text-red-400 ml-0.5">*</span>;

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t border-gray-100 pt-5 space-y-5">
      {/* Venta */}
      <div>
        <label className={LABEL_CLS}>
          <span className="flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5" /> Venta de informe {required}</span>
        </label>
        <VentaSelector ventas={ventasInforme} value={form.venta_servicio_id} onChange={seleccionarVenta} loading={loading} />
        {ventaSeleccionada && (
          <p className="mt-1.5 text-xs text-purple-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Venta del {fmtDate(ventaSeleccionada.fecha_venta)} por {fmtMoney(ventaSeleccionada.total)}
          </p>
        )}
      </div>

      {/* Tipo + Especialista */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLS}>
            <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Tipo de informe {required}</span>
          </label>
          <select value={form.tipo_archivo_id} onChange={e => set('tipo_archivo_id', e.target.value)} className={INPUT_CLS} required>
            <option value="">Seleccionar...</option>
            {tiposArchivo.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL_CLS}>
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Especialista {required}</span>
          </label>
          <select
            value={form.especialista_id}
            onChange={e => {
              const terapeutaId = e.target.value;
              set('especialista_id', terapeutaId);

              // Buscar servicio_id automáticamente cuando se selecciona terapeuta
              if (terapeutaId) {
                const servicioId = buscarServicioPorTerapeuta(terapeutaId);
                if (servicioId) {
                  set('servicio_id', servicioId);
                  console.log('✅ servicio_id asignado automáticamente:', servicioId);
                }
              }
            }}
            className={INPUT_CLS}
            required
          >
            <option value="">Seleccionar...</option>
            {terapeutas.map(t => <option key={t.id} value={t.id}>{t.nombres} {t.apellidos}</option>)}
          </select>
        </div>
      </div>

      {/* Monto + Recibo + Modalidad */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={LABEL_CLS}>
            <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Monto (S/) {required}</span>
          </label>
          <div className="relative">
            <input
              type="number" step="0.01" min="0.01"
              value={form.monto}
              onChange={e => set('monto', e.target.value)}
              className={`${INPUT_CLS} ${ventaSeleccionada ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="30.00" required
              readOnly={!!ventaSeleccionada} disabled={!!ventaSeleccionada}
            />
            {ventaSeleccionada && form.monto && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-purple-400 bg-purple-50 px-1.5 py-0.5 rounded-md pointer-events-none">auto</span>
            )}
          </div>
        </div>
        <div>
          <label className={LABEL_CLS}>
            <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> N° Recibo {required}</span>
          </label>
          <div className="relative">
            <input
              type="text" value={form.nro_recibo}
              onChange={e => set('nro_recibo', e.target.value)}
              className={`${INPUT_CLS} ${ventaSeleccionada ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="REC-001" required
              readOnly={!!ventaSeleccionada} disabled={!!ventaSeleccionada}
            />
            {ventaSeleccionada && form.nro_recibo && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-purple-400 bg-purple-50 px-1.5 py-0.5 rounded-md pointer-events-none">auto</span>
            )}
          </div>
        </div>
        <div>
          <label className={LABEL_CLS}>
            <span className="flex items-center gap-1.5"><Banknote className="w-3.5 h-3.5" /> Modalidad</span>
          </label>
          <select value={form.modalidad_pago_id} onChange={e => set('modalidad_pago_id', e.target.value)} className={INPUT_CLS}>
            <option value="">Seleccionar...</option>
            {modalidadesPago.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLS}>
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Fecha solicitud {required}</span>
          </label>
          <input type="date" value={form.fecha_solicitud} onChange={e => set('fecha_solicitud', e.target.value)} className={INPUT_CLS} required />
        </div>
        <div>
          <label className={LABEL_CLS}>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Fecha entrega
              <span className="text-[10px] font-semibold text-purple-400 bg-purple-50 px-1.5 py-0.5 rounded-md normal-case">+5 días auto</span>
            </span>
          </label>
          <input type="date" value={form.fecha_entrega} onChange={e => set('fecha_entrega', e.target.value)} className={INPUT_CLS} min={form.fecha_solicitud} />
        </div>
      </div>

      {/* Nota */}
      <div>
        <label className={LABEL_CLS}>Observaciones</label>
        <textarea value={form.nota} onChange={e => set('nota', e.target.value)} className={`${INPUT_CLS} resize-none`} rows={2} placeholder="Notas adicionales..." />
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] disabled:opacity-50 flex items-center gap-2 transition-all">
          <Save className="w-4 h-4" />
          {loading ? 'Guardando...' : 'Registrar solicitud'}
        </button>
      </div>
    </form>
  );
};

// ─── VisualizadorPDF ──────────────────────────────────────────────────────────

const VisualizadorPDF = ({ url, onClose }) => {
  const [scale, setScale] = useState(1);

  // La URL puede ser relativa (/uploads/...) — la completamos con la base del servidor (backend)
  const fullUrl = url?.startsWith('http') ? url : `${SERVER_BASE_URL}${url}`;

  return (
    <div className="fixed inset-0 z-[90000] flex flex-col bg-black/90 backdrop-blur-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-900 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-white truncate max-w-[300px]">{url?.split('/').pop()}</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={fullUrl}
            download
            className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Descargar
          </a>
          <button onClick={onClose} className="ml-1 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Iframe del PDF - SIN scrolls anidados */}
      <div className="flex-1 bg-gray-800 relative">
        <iframe
          src={`${fullUrl}#toolbar=0&navpanes=0&scrollbar=1`}
          title="Previsualización PDF"
          className="absolute inset-0 w-full h-full border-none"
        />
      </div>
    </div>
  );
};

// ─── ModalSubirArchivo ────────────────────────────────────────────────────────

const ModalSubirArchivo = ({ solicitud, onClose, onSuccess }) => {
  const [archivo, setArchivo]   = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError]       = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const tiposPermitidos = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!tiposPermitidos.includes(file.type)) {
      setError('Solo se permiten archivos PDF o Word (.doc/.docx)');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('El archivo no debe superar los 20 MB');
      return;
    }
    setError(null);
    setArchivo(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) return;
    try {
      setSubiendo(true);
      await subirArchivoInforme(solicitud.id, archivo);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir el archivo');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base font-bold text-white">Subir Informe</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`${LABEL_CLS} mb-2`}>Archivo del informe *</label>
            <input
              type="file" accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className={INPUT_CLS} required
            />
            {archivo && (
              <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {archivo.name} ({(archivo.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            {error && (
              <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {error}
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
            <p className="font-semibold mb-1">Formatos permitidos:</p>
            <p>PDF (.pdf) · Word (.doc, .docx) · Máx. 20 MB</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={subiendo || !archivo} className="px-5 py-2 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] disabled:opacity-50 flex items-center gap-2 transition-all">
              <Upload className="w-4 h-4" />
              {subiendo ? 'Subiendo...' : 'Subir archivo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── ModalRevisarInforme ──────────────────────────────────────────────────────

const ModalRevisarInforme = ({ solicitud, user, onClose, onSuccess }) => {
  const [accion,    setAccion]    = useState(null); // 'aprobar' | 'rechazar'
  const [comentario, setComentario] = useState('');
  const [guardando,  setGuardando]  = useState(false);
  const [error,      setError]      = useState(null);
  const [verPDF,     setVerPDF]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accion) return;
    if (accion === 'rechazar' && !comentario.trim()) {
      setError('El comentario es obligatorio al rechazar');
      return;
    }
    try {
      setGuardando(true);
      await revisarInforme(solicitud.id, {
        estado_id: accion === 'aprobar' ? ESTADO.APROBADO : ESTADO.RECHAZADO,
        comentario: comentario.trim() || null,
        revisor_id: user?.id,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al revisar el informe');
    } finally {
      setGuardando(false);
    }
  };

  const terapeutaEsJefa = Boolean(solicitud.especialista?.cargo?.es_jefe);

  return (
    <>
      {verPDF && solicitud.archivo_url && (
        <VisualizadorPDF url={solicitud.archivo_url} onClose={() => setVerPDF(false)} />
      )}

      <div className="fixed inset-0 z-[80000] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
          <div className="bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Revisar Informe</h2>
                {terapeutaEsJefa && (
                  <p className="text-xs text-purple-200">Revisión propia — eres jefa asignada</p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Info solicitud */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Tipo de informe</p>
                  <p className="text-gray-900 font-medium">{solicitud.tipo_archivo?.nombre ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Terapeuta</p>
                  <p className="text-gray-900 font-medium">
                    {solicitud.especialista?.nombres} {solicitud.especialista?.apellidos}
                    {terapeutaEsJefa && <span className="ml-1 text-[10px] font-bold text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded-md">JEFA</span>}
                  </p>
                </div>
              </div>

              {/* Archivo */}
              {solicitud.archivo_url && (
                <div className="pt-3 border-t border-gray-200 flex items-center gap-3">
                  {isPDF(solicitud.archivo_url) && (
                    <button
                      type="button"
                      onClick={() => setVerPDF(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#7B1FA2] hover:bg-[#6A1B9A] rounded-lg transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> Previsualizar PDF
                    </button>
                  )}
                  <a
                    href={solicitud.archivo_url?.startsWith('http') ? solicitud.archivo_url : `${SERVER_BASE_URL}${solicitud.archivo_url}`}
                    download
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#7B1FA2] border border-[#7B1FA2] hover:bg-purple-50 rounded-lg transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {isWord(solicitud.archivo_url) ? 'Descargar Word' : 'Descargar'}
                  </a>
                </div>
              )}
            </div>

            {/* Acción */}
            <div>
              <label className={`${LABEL_CLS} mb-2`}>¿Qué deseas hacer? *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setAccion('aprobar'); setError(null); }}
                  className={`px-4 py-3 rounded-xl border-2 transition-all text-sm font-semibold
                    ${accion === 'aprobar'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'}`}
                >
                  <Check className="w-5 h-5 mx-auto mb-1" /> Aprobar
                </button>
                <button
                  type="button"
                  onClick={() => { setAccion('rechazar'); setError(null); }}
                  className={`px-4 py-3 rounded-xl border-2 transition-all text-sm font-semibold
                    ${accion === 'rechazar'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-red-300'}`}
                >
                  <XCircle className="w-5 h-5 mx-auto mb-1" /> Rechazar
                </button>
              </div>
            </div>

            {/* Comentario */}
            <div>
              <label className={`${LABEL_CLS} mb-2`}>
                Comentario {accion === 'rechazar' && <span className="text-red-400">*</span>}
              </label>
              <textarea
                value={comentario}
                onChange={e => { setComentario(e.target.value); setError(null); }}
                className={`${INPUT_CLS} resize-none`}
                rows={4}
                placeholder={accion === 'rechazar' ? 'Indica qué debe corregirse...' : 'Comentarios opcionales...'}
                required={accion === 'rechazar'}
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                Cancelar
              </button>
              <button type="submit" disabled={guardando || !accion} className="px-5 py-2 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] disabled:opacity-50 flex items-center gap-2 transition-all">
                <Send className="w-4 h-4" />
                {guardando ? 'Enviando...' : 'Enviar revisión'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// ─── SolicitudCard ────────────────────────────────────────────────────────────

const SolicitudCard = ({ solicitud, user, onVer, onEliminar, onAccion }) => {
  const sw    = estadoStyle(solicitud.estado_solicitud_id);
  const sp    = estadoPagoStyle(solicitud.estado_pago_id);
  const { Icon } = sw;
  const acciones = resolverAcciones(solicitud, user);
  const mostrarInfoBancaria = puedeVerInformacionBancaria(user, solicitud);
  const puedeEliminar = puedeEliminarSolicitud(user);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Fila 1: tipo + badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {solicitud.tipo_archivo?.nombre ?? '—'}
            </span>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${sw.bg} ${sw.text} ${sw.border}`}>
              <Icon className="w-3 h-3" /> {sw.label}
            </span>
            {mostrarInfoBancaria && solicitud.estado_pago_id && (
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${sp.bg} ${sp.text} ${sp.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sp.dot}`} />
                {solicitud.estado_pago?.nombre ?? sp.label}
              </span>
            )}
          </div>

          {/* Fila 2: metadatos */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            {mostrarInfoBancaria && (
              <span className="flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5" />
                {solicitud.venta_servicio?.codigo_comprobante ?? `Venta #${solicitud.venta_servicio_id}`}
              </span>
            )}
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {solicitud.especialista?.nombres} {solicitud.especialista?.apellidos}
              {solicitud.especialista?.cargo?.es_jefe && (
                <span className="ml-1 text-[10px] font-bold text-purple-500 bg-purple-50 px-1 py-0.5 rounded">JEFA</span>
              )}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Solicitud: {fmtDate(solicitud.fecha_solicitud)}
            </span>
            <span className="flex items-center gap-1 font-semibold text-purple-700">
              <Clock className="w-3.5 h-3.5" /> Entrega: {fmtDate(solicitud.fecha_entrega)}
            </span>
            {mostrarInfoBancaria && (
              <span className="flex items-center gap-1 font-semibold text-gray-700">
                <DollarSign className="w-3.5 h-3.5" /> {fmtMoney(solicitud.monto)}
              </span>
            )}
          </div>

          {/* Botones de workflow */}
          {(acciones.subir || acciones.reSubir || acciones.revisar || acciones.entregar) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {acciones.subir && (
                <button onClick={() => onAccion('subir', solicitud)}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#7B1FA2] text-white rounded-lg hover:bg-[#6A1B9A] flex items-center gap-1 transition-all">
                  <Upload className="w-3 h-3" /> Subir archivo
                </button>
              )}
              {acciones.reSubir && (
                <button onClick={() => onAccion('subir', solicitud)}
                  className="px-3 py-1.5 text-xs font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-1 transition-all">
                  <Upload className="w-3 h-3" /> Corregir y re-subir
                </button>
              )}
              {acciones.revisar && (
                <button onClick={() => onAccion('revisar', solicitud)}
                  className="px-3 py-1.5 text-xs font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-1 transition-all">
                  <FileCheck className="w-3 h-3" /> Revisar informe
                </button>
              )}
              {acciones.entregar && (
                <button onClick={() => onAccion('entregar', solicitud)}
                  className="px-3 py-1.5 text-xs font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-1 transition-all">
                  <Package className="w-3 h-3" /> Marcar entregado
                </button>
              )}
            </div>
          )}
        </div>

        {/* Acciones secundarias */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onVer(solicitud)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Ver detalle">
            <Eye className="w-4 h-4" />
          </button>
          {puedeEliminar && (
            <button onClick={() => onEliminar(solicitud.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── ModalVer ─────────────────────────────────────────────────────────────────

const ModalVer = ({ solicitud, user, onClose }) => {
  const [revisiones,         setRevisiones]         = useState([]);
  const [cargandoRevisiones, setCargandoRevisiones] = useState(false);
  const [verPDF,             setVerPDF]             = useState(false);

  useEffect(() => {
    if (!solicitud?.id) return;
    setCargandoRevisiones(true);
    obtenerRevisionesInforme(solicitud.id)
      .then(data => setRevisiones(data ?? []))
      .catch(() => {})
      .finally(() => setCargandoRevisiones(false));
  }, [solicitud?.id]);

  if (!solicitud) return null;

  const sw = estadoStyle(solicitud.estado_solicitud_id);
  const sp = estadoPagoStyle(solicitud.estado_pago_id);
  const { Icon } = sw;
  const mostrarInfoBancaria = puedeVerInformacionBancaria(user, solicitud);

  return (
    <>
      {verPDF && solicitud.archivo_url && (
        <VisualizadorPDF url={solicitud.archivo_url} onClose={() => setVerPDF(false)} />
      )}

      <div className="fixed inset-0 z-[80000] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
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

          <div className="p-6 space-y-5">
            {/* Badges de estado */}
            <div className="flex flex-wrap gap-2">
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${sw.bg} ${sw.text} ${sw.border}`}>
                <Icon className="w-4 h-4" /> {sw.label}
              </span>
              {mostrarInfoBancaria && (
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${sp.bg} ${sp.text} ${sp.border}`}>
                  <span className={`w-2 h-2 rounded-full ${sp.dot}`} />
                  {solicitud.estado_pago?.nombre ?? sp.label}
                </span>
              )}
            </div>

            {/* Datos principales */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Tipo de informe</p>
                <p className="text-gray-900 font-medium">{solicitud.tipo_archivo?.nombre || '—'}</p>
              </div>
              {mostrarInfoBancaria && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Venta asociada</p>
                  <p className="text-gray-900 font-medium">{solicitud.venta_servicio?.codigo_comprobante ?? `#${solicitud.venta_servicio_id}`}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Especialista</p>
                <p className="text-gray-900 font-medium">{`${solicitud.especialista?.nombres ?? ''} ${solicitud.especialista?.apellidos ?? ''}`}</p>
              </div>
              {mostrarInfoBancaria && (
                <>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Monto</p>
                    <p className="text-gray-900 font-medium">{fmtMoney(solicitud.monto)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">N° Recibo</p>
                    <p className="text-gray-900 font-medium">{solicitud.nro_recibo || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Modalidad de pago</p>
                    <p className="text-gray-900 font-medium">{solicitud.modalidad_pago?.nombre ?? '—'}</p>
                  </div>
                </>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Fecha solicitud</p>
                <p className="text-gray-900 font-medium">{fmtDate(solicitud.fecha_solicitud)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Fecha entrega máxima</p>
                <p className="text-gray-900 font-medium">{fmtDate(solicitud.fecha_entrega)}</p>
              </div>
            </div>

            {/* Archivo subido */}
            {solicitud.archivo_url && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Archivo del informe</p>
                <div className="flex flex-wrap items-center gap-3">
                  {isPDF(solicitud.archivo_url) && (
                    <button
                      onClick={() => setVerPDF(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#7B1FA2] hover:bg-[#6A1B9A] rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4" /> Previsualizar PDF
                    </button>
                  )}
                  <a
                    href={solicitud.archivo_url?.startsWith('http') ? solicitud.archivo_url : `${SERVER_BASE_URL}${solicitud.archivo_url}`}
                    download
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-green-700 border border-green-400 hover:bg-green-100 rounded-lg transition-all"
                  >
                    <Download className="w-4 h-4" />
                    {isWord(solicitud.archivo_url) ? 'Descargar Word' : 'Descargar PDF'}
                  </a>
                </div>
                {solicitud.fecha_subida_archivo && (
                  <p className="text-xs text-green-600 mt-2">
                    Subido el {fmtDate(solicitud.fecha_subida_archivo)}
                  </p>
                )}
              </div>
            )}

            {/* Notas */}
            {solicitud.nota && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Observaciones</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{solicitud.nota}</p>
              </div>
            )}

            {/* Historial de revisiones */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Historial de revisiones</p>
              {cargandoRevisiones ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin" />
                </div>
              ) : revisiones.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Sin revisiones aún</p>
              ) : (
                <div className="space-y-2">
                  {revisiones.map((rev, idx) => {
                    const aprobado = rev.estado_id === ESTADO.APROBADO;
                    return (
                      <div key={idx} className={`border-2 rounded-xl p-3 ${aprobado ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {aprobado
                            ? <CheckCircle className="w-4 h-4 text-green-600" />
                            : <XCircle className="w-4 h-4 text-red-600" />}
                          <span className={`text-sm font-semibold ${aprobado ? 'text-green-700' : 'text-red-700'}`}>
                            {aprobado ? 'Aprobado' : 'Rechazado'}
                          </span>
                          <span className="text-xs text-gray-400 ml-auto">{fmtDate(rev.fecha_revision)}</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          <strong>Revisor:</strong> {rev.revisor?.nombres} {rev.revisor?.apellidos}
                        </p>
                        {rev.comentario && (
                          <p className="text-xs text-gray-700 mt-2 bg-white/60 rounded p-2">
                            <strong>Comentario:</strong> {rev.comentario}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 pb-6 flex justify-end">
            <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-white bg-[#7B1FA2] rounded-xl hover:bg-[#6A1B9A] transition-all">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── SolicitudInformeView (Componente principal) ──────────────────────────────


  const SolicitudInformeView = ({ paciente, user: userProp }) => {
  const user = userProp ?? JSON.parse(localStorage.getItem('user') ?? 'null');

  // 🔍 DEBUG: Log del usuario al inicio
  console.log('\n🚀 SolicitudInformeView - Usuario cargado:', {
    id: user?.id,
    nombre: user?.nombres,
    apellidos: user?.apellidos,
    cargo: user?.cargo,
    'cargo.es_jefe': user?.cargo?.es_jefe,
  });

  const [solicitudes,       setSolicitudes]       = useState([]);
  const [ventasInforme,     setVentasInforme]     = useState([]);
  const [tiposArchivo,      setTiposArchivo]      = useState([]);
  const [modalidadesPago,   setModalidadesPago]   = useState([]);
  const [terapeutas,        setTerapeutas]        = useState([]);
  const [serviciosPaciente, setServiciosPaciente] = useState([]); // Para buscar servicio_id por terapeuta
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modalVer,          setModalVer]          = useState(null);
  const [modalSubir,        setModalSubir]        = useState(null);
  const [modalRevisar,      setModalRevisar]      = useState(null);
  const [loading,           setLoading]           = useState(false);
  const [snack,             setSnack]             = useState(null);

  // Estados para modales de confirmación y alerta
  const [modalAlerta, setModalAlerta] = useState(null);
  const [modalConfirmEliminar, setModalConfirmEliminar] = useState(null);
  const [modalConfirmEntregar, setModalConfirmEntregar] = useState(null);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  const toast = (msg, tipo = 'success') => {
    setSnack({ msg, tipo });
    setTimeout(() => setSnack(null), 3500);
  };

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
      setServiciosPaciente(serviciosPaciente ?? []); // Guardar servicios para luego buscar por terapeuta

      // 🔍 DEBUG: Log de solicitudes cargadas
      console.log('📋 Solicitudes cargadas:', solicitudesData?.length ?? 0);
      console.log('📦 Servicios del paciente:', serviciosPaciente);
      if (solicitudesData?.length > 0) {
        console.log('Primera solicitud (muestra):', {
          id: solicitudesData[0].id,
          estado: solicitudesData[0].estado_solicitud_id,
          estado_nombre: solicitudesData[0].estado_solicitud?.nombre,
          especialista: solicitudesData[0].especialista,
          'especialista.cargo': solicitudesData[0].especialista?.cargo,
        });
      }

      // Terapeutas activos del paciente (deduplicados)
      const terapeutasMap = new Map();
      (serviciosPaciente ?? []).forEach(item => {
        (item.asignaciones ?? []).forEach(a => {
          if (a.estado === 'ACTIVO' && a.activo && a.terapeuta?.id) {
            terapeutasMap.set(a.terapeuta.id, a.terapeuta);
          }
        });
      });
      setTerapeutas([...terapeutasMap.values()]);

      // Ventas con informe que aún no tienen solicitud
      const ventaIdsUsadas = new Set(
        (solicitudesData ?? []).map(s => s.venta_servicio_id).filter(Boolean)
      );
      const ventasFiltradas = (ventasData ?? []).filter(v =>
        (v.detalles ?? []).some(d => d.tipoItemVenta === 2 || d.tipo_item_venta === 2) &&
        !ventaIdsUsadas.has(v.id)
      );
      setVentasInforme(ventasFiltradas);
    } catch (err) {
      console.error(err);
      toast('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      await crearSolicitudInforme(formData);
      toast('Solicitud registrada correctamente');
      setMostrarFormulario(false);
      await cargarDatos();
    } catch (err) {
      console.error(err);
      toast(err?.response?.data?.message ?? 'Error al registrar la solicitud', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = (id) => {
    setModalConfirmEliminar(id);
  };

  const confirmarEliminar = async () => {
    const id = modalConfirmEliminar;
    try {
      setLoadingConfirm(true);
      await eliminarSolicitudInforme(id);
      toast('Solicitud eliminada');
      setModalConfirmEliminar(null);
      cargarDatos();
    } catch {
      toast('Error al eliminar', 'error');
    } finally {
      setLoadingConfirm(false);
    }
  };

  const handleAccion = (accion, solicitud) => {
    if (accion === 'subir') {
      setModalSubir(solicitud);
    } else if (accion === 'revisar') {
      setModalRevisar(solicitud);
    } else if (accion === 'entregar') {
      setModalConfirmEntregar(solicitud);
    }
  };

  const confirmarEntregar = async () => {
    const solicitud = modalConfirmEntregar;
    try {
      setLoadingConfirm(true);
      await marcarInformeEntregado(solicitud.id);
      toast('Informe marcado como entregado');
      setModalConfirmEntregar(null);
      cargarDatos();
    } catch {
      toast('Error al marcar como entregado', 'error');
    } finally {
      setLoadingConfirm(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Notificación flotante */}
      {snack && <Snackbar msg={snack.msg} tipo={snack.tipo} onClose={() => setSnack(null)} />}

      {/* Modales */}
      {modalVer     && <ModalVer solicitud={modalVer} user={user} onClose={() => setModalVer(null)} />}
      {modalSubir   && <ModalSubirArchivo solicitud={modalSubir} onClose={() => setModalSubir(null)} onSuccess={cargarDatos} />}
      {modalRevisar && <ModalRevisarInforme solicitud={modalRevisar} user={user} onClose={() => setModalRevisar(null)} onSuccess={cargarDatos} />}

      {/* Modal de Alerta */}
      {modalAlerta && (
        <ModalAlerta
          isOpen={true}
          onClose={() => setModalAlerta(null)}
          titulo={modalAlerta.titulo}
          mensaje={modalAlerta.mensaje}
          tipo={modalAlerta.tipo}
        />
      )}

      {/* Modal de Confirmación - Eliminar */}
      {modalConfirmEliminar && (
        <ModalConfirmacion
          isOpen={true}
          onClose={() => setModalConfirmEliminar(null)}
          onConfirm={confirmarEliminar}
          titulo="Eliminar solicitud"
          mensaje="¿Estás seguro de que deseas eliminar esta solicitud de informe? Esta acción no se puede deshacer."
          tipo="danger"
          loading={loadingConfirm}
        />
      )}

      {/* Modal de Confirmación - Marcar como Entregado */}
      {modalConfirmEntregar && (
        <ModalConfirmacion
          isOpen={true}
          onClose={() => setModalConfirmEntregar(null)}
          onConfirm={confirmarEntregar}
          titulo="Marcar como entregado"
          mensaje="¿Confirmas que este informe ha sido entregado al paciente?"
          tipo="success"
          loading={loadingConfirm}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
            <FileText className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Solicitudes de Informe</h3>
            <p className="text-xs text-gray-400">
              {solicitudes.length === 0
                ? 'Sin solicitudes'
                : `${solicitudes.length} solicitud${solicitudes.length > 1 ? 'es' : ''}`}
            </p>
          </div>
        </div>

        {!mostrarFormulario && puedeCrearSolicitud(user) && (
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

      {/* Formulario */}
      {mostrarFormulario && puedeCrearSolicitud(user) && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold text-gray-800">Nueva solicitud de informe</p>
            <button onClick={() => setMostrarFormulario(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          {ventasInforme.length === 0 ? (
            <div className="mt-3 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>No hay ventas con informe físico disponibles o todas tienen solicitud asociada.</p>
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
              serviciosPaciente={serviciosPaciente}
              onMostrarAlerta={setModalAlerta}
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
              user={user}
              onVer={setModalVer}
              onEliminar={handleEliminar}
              onAccion={handleAccion}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SolicitudInformeView;