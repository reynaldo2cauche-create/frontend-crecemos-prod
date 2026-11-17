import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText, Plus, X, Save, Calendar, DollarSign, User, Receipt, Eye, Trash2,
  CheckCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, AlertCircle,
  Package, Clock, Banknote, Hash, Upload, Check, XCircle, FileCheck, Send,
  Download, Info,
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
import { getDocumentosTarifa } from '../../../../services/documentoTarifaService';
import { getServiciosPorPaciente } from '../../../../services/pacienteService';
import { API_BASE_URL } from '../../../../services/api';
import { ROLES } from '../../../../constants/roles';

// ─── Constantes ───────────────────────────────────────────────────────────────

const ESTADO = {
  PENDIENTE_SUBIDA: 1,
  PENDIENTE_REVISION: 2,
  RECHAZADO: 3,
  APROBADO: 4,
  ENTREGADO: 5,
};

const ESTADO_STYLE = {
  1: { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  label: 'Pendiente subida',   Icon: Clock },
  2: { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   label: 'Pendiente revisión', Icon: Eye },
  3: { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    label: 'Rechazado',          Icon: XCircle },
  4: { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  label: 'Aprobado',           Icon: CheckCircle },
  5: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', label: 'Entregado',          Icon: Package },
};
const ESTADO_DEFAULT = { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', label: '—', Icon: AlertCircle };

const ESTADO_PAGO_STYLE = {
  1: { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-400',   label: 'Pendiente' },
  2: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Pagado' },
};
const ESTADO_PAGO_DEFAULT = { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', dot: 'bg-gray-400', label: '—' };

const TIPO_ITEM_INFORME = 2;
const DIAS_ENTREGA = 5;
const ITEMS_POR_PAGINA = 5;
const MAX_ARCHIVO_MB = 20;
const TIPOS_ARCHIVO = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// ─── Clases y estilos reutilizables ───────────────────────────────────────────

const INPUT_CLS = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-[#7B1FA2]/15 transition-shadow placeholder:text-gray-300';
const LABEL_CLS = 'block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider';
const READONLY_CLS = 'bg-gray-50 cursor-not-allowed';
const BTN_PRIMARY = 'cx-glow inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] rounded-full shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed';
const BTN_SECONDARY = 'px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50';
const ICON_BADGE = 'w-9 h-9 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-500/20';
const HEADER_BG = {
  backgroundImage:
    'radial-gradient(70% 140% at 100% 0%, rgba(123,31,162,.07) 0%, rgba(123,31,162,0) 60%), linear-gradient(120deg, #ffffff 0%, #fdfbff 60%, #faf6fe 100%)',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const estadoStyle = (id) => ESTADO_STYLE[id] ?? ESTADO_DEFAULT;
const estadoPagoStyle = (id) => ESTADO_PAGO_STYLE[id] ?? ESTADO_PAGO_DEFAULT;

const fmtMoney = (v) => `S/ ${Number(v ?? 0).toFixed(2)}`;

const parseFechaLocal = (valor) => {
  const [year, month, day] = String(valor).split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
};

const toInputDate = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const fmtDate = (valor) => {
  if (!valor) return '—';
  return parseFechaLocal(valor).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
};

const addDays = (dateStr, days) => {
  const fecha = parseFechaLocal(dateStr);
  fecha.setDate(fecha.getDate() + days);
  return toInputDate(fecha);
};

const isPDF = (url) => url?.toLowerCase().endsWith('.pdf');
const isWord = (url) => /\.(doc|docx)$/i.test(url ?? '');

const buildArchivoUrl = (archivoUrl) => {
  if (!archivoUrl) return '';
  if (archivoUrl.startsWith('http')) return archivoUrl;
  return `${API_BASE_URL}/solicitudes-informe/archivo/${archivoUrl.split('/').pop()}`;
};

const getFormInitial = (user) => {
  const hoy = toInputDate(new Date());
  return {
    servicio_id: null,
    venta_servicio_id: '',
    documento_tarifa_id: '',
    linea_id: '',
    especialista_id: user?.id ?? '',
    user_crea_id: user?.id ?? '',
    fecha_solicitud: hoy,
    fecha_entrega: addDays(hoy, DIAS_ENTREGA),
    monto: '',
    nro_recibo: '',
    modalidad_pago_id: '',
    estado_pago_id: 1,
    nota: '',
    ventaPagos: [],
  };
};

// Datos de una línea de venta (el backend puede enviarlos en camelCase o snake_case)
const esLineaInforme = (d) => (d.tipoItemVenta ?? d.tipo_item_venta) === TIPO_ITEM_INFORME;
const docDeLinea = (d) => d?.documentoTarifaId ?? d?.documento_tarifa_id ?? d?.documento_tarifa?.id ?? '';
const montoDeLinea = (d) => Number(d?.subtotal ?? d?.precio_unitario ?? 0);
const nombreDeLinea = (d) => d?.descripcionLinea ?? d?.descripcion_linea;

// ─── Permisos ─────────────────────────────────────────────────────────────────

const esAdminOAdmision = (user) =>
  user?.rol?.id === ROLES.ADMINISTRADOR || user?.rol?.id === ROLES.ADMISION;

const puedeCrearSolicitud = esAdminOAdmision;
const puedeVerInformacionBancaria = esAdminOAdmision;
const puedeEliminarSolicitud = esAdminOAdmision;

/**
 * Acciones del workflow según estado y usuario:
 * - PENDIENTE_SUBIDA   → la terapeuta asignada sube el archivo
 * - PENDIENTE_REVISION → una jefa revisa
 * - RECHAZADO          → la terapeuta asignada corrige y re-sube
 * - APROBADO           → admisión/admin marca como entregado
 */
const resolverAcciones = (solicitud, user) => {
  if (!solicitud || !user) return {};
  const esAsignada = user.id === solicitud.especialista_id;
  const estado = solicitud.estado_solicitud_id;

  return {
    subir: esAsignada && estado === ESTADO.PENDIENTE_SUBIDA,
    reSubir: esAsignada && estado === ESTADO.RECHAZADO,
    revisar: Boolean(user.cargo?.es_jefe) && estado === ESTADO.PENDIENTE_REVISION,
    entregar: estado === ESTADO.APROBADO && esAdminOAdmision(user),
  };
};

/** Devuelve el id del servicio del paciente asignado (activo) a la terapeuta. */
const buscarServicioPorTerapeuta = (serviciosPaciente, terapeutaId) => {
  const item = (serviciosPaciente ?? []).find((s) =>
    (s.asignaciones ?? []).some(
      (a) => a.terapeuta?.id === Number(terapeutaId) && a.estado === 'ACTIVO' && a.activo
    )
  );
  return item?.servicio?.id ?? item?.servicio_id ?? item?.id ?? null;
};

/** Devuelve la primera alerta de validación, o null si el formulario es válido. */
const validarFormulario = (form) => {
  const requerido = (mensaje) => ({ titulo: 'Campo requerido', mensaje, tipo: 'warning' });
  const reglas = [
    [!form.venta_servicio_id, requerido('Selecciona una venta de informe.')],
    [!form.servicio_id, {
      titulo: 'Servicio no encontrado',
      mensaje: 'No se pudo obtener el servicio. Verifica que la terapeuta esté asignada al paciente.',
      tipo: 'error',
    }],
    [!form.documento_tarifa_id, requerido('Selecciona el tipo de informe.')],
    [!form.especialista_id, requerido('Selecciona un especialista.')],
    [form.monto === '' || Number(form.monto) < 0, { titulo: 'Monto inválido', mensaje: 'El monto no puede ser negativo.', tipo: 'error' }],
    [!form.nro_recibo?.trim(), requerido('Ingresa el número de recibo.')],
  ];
  return reglas.find(([falla]) => falla)?.[1] ?? null;
};

// ─── Componentes base ─────────────────────────────────────────────────────────

const AutoTag = ({ className = '' }) => (
  <span className={`text-[10px] font-semibold text-purple-400 bg-purple-50 px-1.5 py-0.5 rounded-md pointer-events-none ${className}`}>
    auto
  </span>
);

const FieldLabel = ({ icon: Icon, children, required }) => (
  <label className={LABEL_CLS}>
    <span className="flex items-center gap-1.5">
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
      {required && <span className="text-red-400">*</span>}
    </span>
  </label>
);

const Dato = ({ label, children }) => (
  <div>
    <p className={`${LABEL_CLS} !mb-1`}>{label}</p>
    <div className="text-sm font-semibold text-gray-800">{children}</div>
  </div>
);

const SectionTitle = ({ children }) => (
  <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">{children}</h5>
);

const Spinner = ({ className = 'w-4 h-4 border-white/40 border-t-white' }) => (
  <div className={`border-2 rounded-full animate-spin ${className}`} />
);

const Snackbar = ({ msg, tipo, onClose }) => (
  <div className={`fixed top-6 right-6 z-[99999] px-5 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 bg-white ${
    tipo === 'error' ? 'border-red-100' : 'border-gray-100'
  }`}>
    <div className={`w-1.5 h-1.5 rounded-full ${tipo === 'error' ? 'bg-red-500' : 'bg-[#A3C644]'}`} />
    <span className="text-xs font-medium text-gray-700">{msg}</span>
    <button onClick={onClose} className="ml-2">
      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
    </button>
  </div>
);

/** Contenedor de todos los modales: overlay + encabezado con degradado suave. */
const ModalShell = ({ title, subtitle, icon: Icon, onClose, maxWidth = 'max-w-md', z = 'z-[80000]', children }) =>
  createPortal(
    <div className={`fixed inset-0 ${z} flex items-center justify-center p-4`}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 z-10 px-6 py-4 border-b border-purple-100/60 flex items-center justify-between" style={HEADER_BG}>
          <div className="flex items-center gap-3">
            <span className={ICON_BADGE}><Icon className="w-[18px] h-[18px] text-white" /></span>
            <div>
              <h2 className="text-base font-extrabold text-[#2D0A4E] leading-tight">{title}</h2>
              {subtitle && <p className="text-xs text-[#7B1FA2] font-medium">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/70 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );

const ModalConfirmacion = ({ onClose, onConfirm, titulo, mensaje, tipo = 'danger', loading = false }) => {
  const icon = tipo === 'danger' ? Trash2 : CheckCircle;
  const confirmCls = tipo === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : null;

  return (
    <ModalShell title={titulo} icon={icon} onClose={onClose} z="z-[90000]">
      <div className="p-6">
        <p className="text-sm text-gray-600 leading-relaxed">{mensaje}</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} disabled={loading} className={BTN_SECONDARY}>Cancelar</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={confirmCls
              ? `px-5 py-2.5 text-sm font-semibold rounded-full disabled:opacity-50 flex items-center gap-2 transition-colors ${confirmCls}`
              : BTN_PRIMARY}
          >
            {loading ? <><Spinner /> Procesando...</> : <><CheckCircle className="w-4 h-4" /> Confirmar</>}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

const ALERTA_ICONOS = { error: XCircle, warning: AlertCircle, info: Info };

const ModalAlerta = ({ onClose, titulo, mensaje, tipo = 'error' }) => (
  <ModalShell title={titulo} icon={ALERTA_ICONOS[tipo] ?? XCircle} onClose={onClose} z="z-[90000]">
    <div className="p-6">
      <p className="text-sm text-gray-600 leading-relaxed">{mensaje}</p>
      <div className="flex justify-end mt-6">
        <button onClick={onClose} className={BTN_PRIMARY}>Entendido</button>
      </div>
    </div>
  </ModalShell>
);

const ModalFooter = ({ onCancel, children }) => (
  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
    <button type="button" onClick={onCancel} className={BTN_SECONDARY}>Cancelar</button>
    {children}
  </div>
);

// ─── Visor de archivo ─────────────────────────────────────────────────────────

const VisualizadorPDF = ({ url, onClose }) => {
  const fullUrl = buildArchivoUrl(url);

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[99990] bg-black/75 flex items-center justify-center"
    >
      <div className="bg-white rounded-2xl flex flex-col w-[95vw] max-w-[1100px] h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-purple-100/60 flex-shrink-0" style={HEADER_BG}>
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={ICON_BADGE}><FileText className="w-[18px] h-[18px] text-white" /></span>
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-[#2D0A4E] leading-tight">Vista previa</h3>
              <p className="text-[11px] text-gray-500 leading-tight truncate">{url?.split('/').pop()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={fullUrl} download className={`${BTN_PRIMARY} !py-2 no-underline`}>
              <Download className="w-4 h-4" /> Descargar
            </a>
            <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/70 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <iframe
          src={`${fullUrl}#toolbar=0&navpanes=0&scrollbar=1`}
          title="Previsualización del informe"
          className="flex-1 w-full border-none"
        />
      </div>
    </div>,
    document.body
  );
};

/** Botones para previsualizar (solo PDF) y descargar el archivo del informe. */
const AccionesArchivo = ({ archivoUrl, onPreview }) => (
  <div className="flex flex-wrap items-center gap-2">
    {isPDF(archivoUrl) && (
      <button type="button" onClick={onPreview} className={`${BTN_PRIMARY} !px-4 !py-2`}>
        <Eye className="w-4 h-4" /> Previsualizar
      </button>
    )}
    <a
      href={buildArchivoUrl(archivoUrl)}
      download
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#7B1FA2] border border-[#7B1FA2]/40 hover:bg-purple-50 rounded-full transition-colors"
    >
      <Download className="w-4 h-4" />
      {isWord(archivoUrl) ? 'Descargar Word' : 'Descargar PDF'}
    </a>
  </div>
);

// ─── Selector de venta ────────────────────────────────────────────────────────

const VentaOptionCard = ({ venta, selected, onClick }) => {
  const descripcion = (venta._informeLineas ?? venta.detalles ?? [])
    .filter(esLineaInforme)
    .map((d) => nombreDeLinea(d) ?? 'Informe')
    .join(', ');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
        selected ? 'border-[#7B1FA2] bg-purple-50' : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/40'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{venta.codigo_comprobante ?? `Venta #${venta.id}`}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{descripcion || 'Informe físico'}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-[#7B1FA2]">{fmtMoney(venta.total)}</p>
          <p className="text-xs text-gray-400">{fmtDate(venta.fecha_venta)}</p>
        </div>
      </div>
    </button>
  );
};

const VentaSelector = ({ ventas, value, onChange, loading }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const cerrarAlHacerClickFuera = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', cerrarAlHacerClickFuera);
    return () => document.removeEventListener('mousedown', cerrarAlHacerClickFuera);
  }, []);

  const selected = ventas.find((v) => String(v.id) === String(value));
  const placeholder = loading ? 'Cargando...' : ventas.length === 0 ? 'Sin ventas disponibles' : 'Seleccionar venta...';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${INPUT_CLS} text-left flex items-center justify-between ${selected ? 'text-gray-900' : 'text-gray-400'}`}
      >
        <span className="truncate">
          {selected ? `${selected.codigo_comprobante ?? `Venta #${selected.id}`} — ${fmtMoney(selected.total)}` : placeholder}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-xl">
          {ventas.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">No hay ventas disponibles</div>
          ) : (
            <div className="max-h-64 overflow-y-auto p-2 space-y-2">
              {ventas.map((v) => (
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

// ─── Formulario de solicitud ──────────────────────────────────────────────────

const FormularioSolicitud = ({
  onSubmit, onCancel, loading,
  ventasInforme, documentosTarifa, terapeutas, modalidadesPago, user,
  serviciosPaciente, onMostrarAlerta,
}) => {
  const [form, setForm] = useState(() => getFormInitial(user));
  const set = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const ventaSeleccionada = ventasInforme.find((v) => String(v.id) === String(form.venta_servicio_id));
  const lineasVenta = ventaSeleccionada?._informeLineas ?? [];
  const bloqueado = Boolean(ventaSeleccionada); // con venta elegida, los datos de pago son automáticos

  // El servicio se deduce de la terapeuta seleccionada
  useEffect(() => {
    if (!form.especialista_id) return;
    const servicioId = buscarServicioPorTerapeuta(serviciosPaciente, form.especialista_id);
    if (servicioId) set('servicio_id', servicioId);
  }, [form.especialista_id, serviciosPaciente]);

  // Fecha de entrega = fecha de solicitud + 5 días
  useEffect(() => {
    if (form.fecha_solicitud) set('fecha_entrega', addDays(form.fecha_solicitud, DIAS_ENTREGA));
  }, [form.fecha_solicitud]);

  // Con una sola venta disponible, se selecciona sola
  useEffect(() => {
    if (ventasInforme.length === 1 && !form.venta_servicio_id) seleccionarVenta(ventasInforme[0].id);
  }, [ventasInforme]);

  const aplicarLinea = (linea) => ({
    linea_id: linea.id,
    documento_tarifa_id: docDeLinea(linea),
    monto: montoDeLinea(linea).toFixed(2),
  });

  const seleccionarVenta = (ventaId) => {
    const venta = ventasInforme.find((v) => String(v.id) === String(ventaId));
    if (!venta) return set('venta_servicio_id', ventaId);

    const lineas = venta._informeLineas ?? [];
    const datosVenta = {
      venta_servicio_id: ventaId,
      nro_recibo: venta.codigo_comprobante ?? '',
      modalidad_pago_id: venta.modalidad_pago_id ?? venta.modalidad_pago?.id ?? '',
      ventaPagos: Array.isArray(venta.pagos) ? venta.pagos : [],
    };
    // Una sola línea se autoselecciona; con varias, el usuario elige cuál informe registrar
    const datosLinea = lineas.length === 1
      ? aplicarLinea(lineas[0])
      : { linea_id: '', documento_tarifa_id: '', monto: '' };

    setForm((prev) => ({ ...prev, ...datosVenta, ...datosLinea }));
  };

  const seleccionarLinea = (lineaId) => {
    const linea = lineasVenta.find((d) => String(d.id) === String(lineaId));
    if (linea) setForm((prev) => ({ ...prev, ...aplicarLinea(linea) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const alerta = validarFormulario(form);
    if (alerta) return onMostrarAlerta(alerta);

    const { ventaPagos, linea_id, ...datos } = form;
    onSubmit({
      ...datos,
      servicio_id: Number(form.servicio_id),
      venta_servicio_id: Number(form.venta_servicio_id),
      documento_tarifa_id: Number(form.documento_tarifa_id),
      especialista_id: Number(form.especialista_id),
      monto: parseFloat(form.monto),
      modalidad_pago_id: form.modalidad_pago_id ? Number(form.modalidad_pago_id) : null,
      estado_pago_id: Number(form.estado_pago_id) || 1,
      fecha_entrega: form.fecha_entrega || null,
      nota: form.nota || null,
    });
  };

  const formaPagoAuto = bloqueado && (form.ventaPagos.length > 0 || form.modalidad_pago_id);

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t border-gray-100 pt-5 space-y-5">
      {/* Venta */}
      <div>
        <FieldLabel icon={Receipt} required>Venta de informe</FieldLabel>
        <VentaSelector ventas={ventasInforme} value={form.venta_servicio_id} onChange={seleccionarVenta} loading={loading} />
        {ventaSeleccionada && (
          <p className="mt-1.5 text-xs text-purple-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Venta del {fmtDate(ventaSeleccionada.fecha_venta)} por {fmtMoney(ventaSeleccionada.total)}
          </p>
        )}
      </div>

      {/* Informe a solicitar (solo si la venta incluye varios) */}
      {lineasVenta.length > 1 && (
        <div>
          <FieldLabel icon={FileText} required>Informe a solicitar</FieldLabel>
          <div className="space-y-2">
            {lineasVenta.map((linea) => {
              const nombre = nombreDeLinea(linea)
                ?? documentosTarifa.find((d) => d.id === docDeLinea(linea))?.nombre
                ?? 'Informe';
              const activa = String(form.linea_id) === String(linea.id);
              return (
                <button
                  type="button"
                  key={linea.id}
                  onClick={() => seleccionarLinea(linea.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border transition-all flex items-center justify-between ${
                    activa ? 'border-[#7B1FA2] bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/40'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                    {activa && <CheckCircle className="w-3.5 h-3.5 text-[#7B1FA2]" />}
                    {nombre}
                  </span>
                  <span className="text-sm font-bold text-[#7B1FA2]">{fmtMoney(montoDeLinea(linea))}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-xs text-gray-400">
            Esta venta incluye varios informes. Elige cuál registrar; cada uno genera su propia solicitud.
          </p>
        </div>
      )}

      {/* Tipo + especialista */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel icon={FileText} required>Tipo de informe</FieldLabel>
          <div className="relative">
            <select
              value={form.documento_tarifa_id}
              onChange={(e) => set('documento_tarifa_id', e.target.value)}
              disabled={bloqueado && Boolean(form.documento_tarifa_id)}
              className={`cx-select ${INPUT_CLS} ${bloqueado && form.documento_tarifa_id ? READONLY_CLS : ''}`}
              required
            >
              <option value="">Seleccionar...</option>
              {documentosTarifa.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
            {bloqueado && form.documento_tarifa_id && <AutoTag className="absolute right-7 top-1/2 -translate-y-1/2" />}
          </div>
        </div>
        <div>
          <FieldLabel icon={User} required>Especialista</FieldLabel>
          <select
            value={form.especialista_id}
            onChange={(e) => set('especialista_id', e.target.value)}
            className={`cx-select ${INPUT_CLS}`}
            required
          >
            <option value="">Seleccionar...</option>
            {terapeutas.map((t) => <option key={t.id} value={t.id}>{t.nombres} {t.apellidos}</option>)}
          </select>
        </div>
      </div>

      {/* Monto + recibo + forma de pago */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <FieldLabel icon={DollarSign} required>Monto (S/)</FieldLabel>
          <div className="relative">
            <input
              type="number" step="0.01" min="0" placeholder="30.00" required
              value={form.monto}
              onChange={(e) => set('monto', e.target.value)}
              readOnly={bloqueado} disabled={bloqueado}
              className={`${INPUT_CLS} ${bloqueado ? READONLY_CLS : ''}`}
            />
            {bloqueado && form.monto && <AutoTag className="absolute right-3 top-1/2 -translate-y-1/2" />}
          </div>
        </div>
        <div>
          <FieldLabel icon={Hash} required>N° recibo</FieldLabel>
          <div className="relative">
            <input
              type="text" placeholder="REC-001" required
              value={form.nro_recibo}
              onChange={(e) => set('nro_recibo', e.target.value)}
              readOnly={bloqueado} disabled={bloqueado}
              className={`${INPUT_CLS} ${bloqueado ? READONLY_CLS : ''}`}
            />
            {bloqueado && form.nro_recibo && <AutoTag className="absolute right-3 top-1/2 -translate-y-1/2" />}
          </div>
        </div>
        <div>
          <label className={LABEL_CLS}>
            <span className="flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5" /> Forma de pago {formaPagoAuto && <AutoTag />}
            </span>
          </label>
          {bloqueado && form.ventaPagos.length > 0 ? (
            <div className="px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 space-y-1.5">
              {form.ventaPagos.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-gray-700">
                  <span className="font-medium">
                    {p.modalidad_pago?.nombre || '—'}
                    {p.referencia && <span className="text-gray-400"> · {p.referencia}</span>}
                  </span>
                  <span className="font-bold text-gray-800">{fmtMoney(p.monto)}</span>
                </div>
              ))}
            </div>
          ) : (
            <select
              value={form.modalidad_pago_id}
              onChange={(e) => set('modalidad_pago_id', e.target.value)}
              disabled={bloqueado}
              className={`cx-select ${INPUT_CLS} ${bloqueado ? READONLY_CLS : ''}`}
            >
              <option value="">Seleccionar...</option>
              {modalidadesPago.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel icon={Calendar} required>Fecha de solicitud</FieldLabel>
          <input type="date" value={form.fecha_solicitud} onChange={(e) => set('fecha_solicitud', e.target.value)} className={INPUT_CLS} required />
        </div>
        <div>
          <label className={LABEL_CLS}>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Fecha de entrega
              <span className="text-[10px] font-semibold text-purple-400 bg-purple-50 px-1.5 py-0.5 rounded-md normal-case">+{DIAS_ENTREGA} días auto</span>
            </span>
          </label>
          <input type="date" value={form.fecha_entrega} min={form.fecha_solicitud} onChange={(e) => set('fecha_entrega', e.target.value)} className={INPUT_CLS} />
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className={LABEL_CLS}>Observaciones</label>
        <textarea value={form.nota} onChange={(e) => set('nota', e.target.value)} rows={2} placeholder="Notas adicionales..." className={`${INPUT_CLS} resize-none`} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className={BTN_SECONDARY}>Cancelar</button>
        <button type="submit" disabled={loading} className={BTN_PRIMARY}>
          {loading ? <><Spinner /> Guardando...</> : <><Save className="w-4 h-4" /> Registrar solicitud</>}
        </button>
      </div>
    </form>
  );
};

// ─── Modal: subir archivo ─────────────────────────────────────────────────────

const ModalSubirArchivo = ({ solicitud, onClose, onSuccess }) => {
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!TIPOS_ARCHIVO.includes(file.type)) return setError('Solo se permiten archivos PDF o Word (.doc/.docx).');
    if (file.size > MAX_ARCHIVO_MB * 1024 * 1024) return setError(`El archivo no debe superar los ${MAX_ARCHIVO_MB} MB.`);
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
      setError(err.response?.data?.message || 'No se pudo subir el archivo. Inténtalo de nuevo.');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <ModalShell title="Subir informe" icon={Upload} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <FieldLabel required>Archivo del informe</FieldLabel>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className={INPUT_CLS} required />
          {archivo && (
            <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> {archivo.name} ({(archivo.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
          {error && (
            <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {error}
            </p>
          )}
        </div>

        <p className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
          <span className="font-semibold">Formatos permitidos:</span> PDF, Word (.doc, .docx) · máx. {MAX_ARCHIVO_MB} MB
        </p>

        <ModalFooter onCancel={onClose}>
          <button type="submit" disabled={subiendo || !archivo} className={BTN_PRIMARY}>
            {subiendo ? <><Spinner /> Subiendo...</> : <><Upload className="w-4 h-4" /> Subir archivo</>}
          </button>
        </ModalFooter>
      </form>
    </ModalShell>
  );
};

// ─── Modal: revisar informe ───────────────────────────────────────────────────

const OPCIONES_REVISION = [
  { id: 'aprobar',  label: 'Aprobar',  Icon: Check,   activa: 'border-green-500 bg-green-50 text-green-700', hover: 'hover:border-green-300' },
  { id: 'rechazar', label: 'Rechazar', Icon: XCircle, activa: 'border-red-500 bg-red-50 text-red-700',       hover: 'hover:border-red-300' },
];

const ModalRevisarInforme = ({ solicitud, user, onClose, onSuccess }) => {
  const [accion, setAccion] = useState(null);
  const [comentario, setComentario] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [verPDF, setVerPDF] = useState(false);

  const terapeutaEsJefa = Boolean(solicitud.especialista?.cargo?.es_jefe);
  const rechazando = accion === 'rechazar';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accion) return;
    if (rechazando && !comentario.trim()) return setError('El comentario es obligatorio al rechazar.');
    try {
      setGuardando(true);
      await revisarInforme(solicitud.id, {
        estado_id: rechazando ? ESTADO.RECHAZADO : ESTADO.APROBADO,
        comentario: comentario.trim() || null,
        revisor_id: user?.id,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo enviar la revisión. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      {verPDF && <VisualizadorPDF url={solicitud.archivo_url} onClose={() => setVerPDF(false)} />}
      <ModalShell
        title="Revisar informe"
        subtitle={terapeutaEsJefa ? 'Revisión propia: eres jefa asignada' : undefined}
        icon={FileCheck}
        onClose={onClose}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <Dato label="Tipo de informe">{solicitud.documento_tarifa?.nombre ?? '—'}</Dato>
              <Dato label="Terapeuta">
                {solicitud.especialista?.nombres} {solicitud.especialista?.apellidos}
                {terapeutaEsJefa && <span className="ml-1.5 text-[10px] font-bold text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded-md">JEFA</span>}
              </Dato>
            </div>
            {solicitud.archivo_url && (
              <div className="pt-3 border-t border-gray-100">
                <AccionesArchivo archivoUrl={solicitud.archivo_url} onPreview={() => setVerPDF(true)} />
              </div>
            )}
          </div>

          <div>
            <FieldLabel required>¿Qué deseas hacer?</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              {OPCIONES_REVISION.map(({ id, label, Icon, activa, hover }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setAccion(id); setError(null); }}
                  className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    accion === id ? activa : `border-gray-200 bg-white text-gray-600 ${hover}`
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" /> {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel required={rechazando}>Comentario</FieldLabel>
            <textarea
              value={comentario}
              onChange={(e) => { setComentario(e.target.value); setError(null); }}
              rows={4}
              required={rechazando}
              placeholder={rechazando ? 'Indica qué debe corregirse...' : 'Comentarios opcionales...'}
              className={`${INPUT_CLS} resize-none`}
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {error}
            </p>
          )}

          <ModalFooter onCancel={onClose}>
            <button type="submit" disabled={guardando || !accion} className={BTN_PRIMARY}>
              {guardando ? <><Spinner /> Enviando...</> : <><Send className="w-4 h-4" /> Enviar revisión</>}
            </button>
          </ModalFooter>
        </form>
      </ModalShell>
    </>
  );
};

// ─── Tarjeta de solicitud ─────────────────────────────────────────────────────

const EstadoBadge = ({ estadoId }) => {
  const { bg, text, border, label, Icon } = estadoStyle(estadoId);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${bg} ${text} ${border}`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
};

const JefaTag = () => (
  <span className="ml-1 text-[10px] font-bold text-purple-500 bg-purple-50 px-1 py-0.5 rounded">JEFA</span>
);

const ACCIONES_WORKFLOW = [
  { clave: 'subir',    accion: 'subir',    label: 'Subir archivo',        Icon: Upload,    cls: 'bg-[#7B1FA2] hover:bg-[#6A1B9A]' },
  { clave: 'reSubir',  accion: 'subir',    label: 'Corregir y re-subir',  Icon: Upload,    cls: 'bg-amber-500 hover:bg-amber-600' },
  { clave: 'revisar',  accion: 'revisar',  label: 'Revisar informe',      Icon: FileCheck, cls: 'bg-blue-500 hover:bg-blue-600' },
  { clave: 'entregar', accion: 'entregar', label: 'Marcar entregado',     Icon: Package,   cls: 'bg-green-500 hover:bg-green-600' },
];

const SolicitudCard = ({ solicitud, user, onVer, onEliminar, onAccion }) => {
  const acciones = resolverAcciones(solicitud, user);
  const accionesDisponibles = ACCIONES_WORKFLOW.filter(({ clave }) => acciones[clave]);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-[0_1px_3px_rgba(16,24,40,0.04)] hover:shadow-[0_6px_18px_rgba(16,24,40,0.06)] transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-500/20">
            <FileText className="w-5 h-5 text-white" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h4 className="text-sm font-bold text-gray-900 truncate">{solicitud.documento_tarifa?.nombre ?? '—'}</h4>
              <EstadoBadge estadoId={solicitud.estado_solicitud_id} />
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              {puedeVerInformacionBancaria(user) && (
                <span className="flex items-center gap-1">
                  <Receipt className="w-3.5 h-3.5" />
                  {solicitud.venta_servicio?.codigo_comprobante ?? `Venta #${solicitud.venta_servicio_id}`}
                </span>
              )}
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {solicitud.especialista?.nombres} {solicitud.especialista?.apellidos}
                {solicitud.especialista?.cargo?.es_jefe && <JefaTag />}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Solicitud: {fmtDate(solicitud.fecha_solicitud)}
              </span>
              <span className="flex items-center gap-1 font-semibold text-purple-700">
                <Clock className="w-3.5 h-3.5" /> Entrega: {fmtDate(solicitud.fecha_entrega)}
              </span>
            </div>

            {accionesDisponibles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {accionesDisponibles.map(({ clave, accion, label, Icon, cls }) => (
                  <button
                    key={clave}
                    onClick={() => onAccion(accion, solicitud)}
                    className={`px-3.5 py-1.5 text-xs font-semibold text-white rounded-full flex items-center gap-1.5 transition-colors ${cls}`}
                  >
                    <Icon className="w-3 h-3" /> {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onVer(solicitud)} className="p-2 hover:bg-purple-50 rounded-lg transition-colors group" title="Ver detalle">
            <Eye className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
          </button>
          {puedeEliminarSolicitud(user) && (
            <button onClick={() => onEliminar(solicitud.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors group" title="Eliminar">
              <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Modal: detalle de la solicitud ───────────────────────────────────────────

const PagosRealizados = ({ solicitud }) => {
  const pagos = solicitud.venta_servicio?.pagos ?? [];

  if (pagos.length > 0) {
    return (
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        {pagos.map((p, i) => (
          <div key={i} className={`flex items-center justify-between px-3 py-2 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-gray-800">{p.modalidad_pago?.nombre || '—'}</span>
              <span className="text-xs text-gray-400">
                {p.referencia && `Ref: ${p.referencia}`}
                {p.referencia && p.fecha_pago && ' · '}
                {p.fecha_pago && new Date(p.fecha_pago).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <span className="text-sm font-bold text-gray-900">{fmtMoney(p.monto)}</span>
          </div>
        ))}
      </div>
    );
  }
  if (solicitud.modalidad_pago?.nombre) {
    return <p className="text-sm font-semibold text-gray-800">{solicitud.modalidad_pago.nombre}</p>;
  }
  return <p className="text-sm text-gray-400 italic">Sin información</p>;
};

const HistorialRevisiones = ({ revisiones, cargando }) => {
  if (cargando) {
    return <div className="flex justify-center py-4"><Spinner className="w-6 h-6 border-gray-200 border-t-[#7B1FA2]" /></div>;
  }
  if (revisiones.length === 0) return <p className="text-sm text-gray-400 italic">Sin revisiones aún</p>;

  return (
    <div className="space-y-2">
      {revisiones.map((rev, idx) => {
        const aprobado = rev.estado_id === ESTADO.APROBADO;
        return (
          <div key={idx} className={`border rounded-xl p-3 ${aprobado ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              {aprobado ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
              <span className={`text-sm font-semibold ${aprobado ? 'text-green-700' : 'text-red-700'}`}>
                {aprobado ? 'Aprobado' : 'Rechazado'}
              </span>
              <span className="text-xs text-gray-400 ml-auto">{fmtDate(rev.fecha_revision)}</span>
            </div>
            <p className="text-xs text-gray-600"><strong>Revisor:</strong> {rev.revisor?.nombres} {rev.revisor?.apellidos}</p>
            {rev.comentario && (
              <p className="text-xs text-gray-700 mt-2 bg-white/60 rounded-lg p-2"><strong>Comentario:</strong> {rev.comentario}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ModalVer = ({ solicitud, user, onClose }) => {
  const [revisiones, setRevisiones] = useState([]);
  const [cargandoRevisiones, setCargandoRevisiones] = useState(false);
  const [verPDF, setVerPDF] = useState(false);

  useEffect(() => {
    setCargandoRevisiones(true);
    obtenerRevisionesInforme(solicitud.id)
      .then((data) => setRevisiones(data ?? []))
      .catch(() => setRevisiones([]))
      .finally(() => setCargandoRevisiones(false));
  }, [solicitud.id]);

  const sp = estadoPagoStyle(solicitud.estado_pago_id);
  const mostrarBancaria = puedeVerInformacionBancaria(user);

  return (
    <>
      {verPDF && <VisualizadorPDF url={solicitud.archivo_url} onClose={() => setVerPDF(false)} />}
      <ModalShell title="Detalle de solicitud" icon={FileText} onClose={onClose} maxWidth="max-w-2xl">
        <div className="p-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            <EstadoBadge estadoId={solicitud.estado_solicitud_id} />
            {mostrarBancaria && (
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${sp.bg} ${sp.text} ${sp.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sp.dot}`} />
                {solicitud.estado_pago?.nombre ?? sp.label}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Dato label="Tipo de informe">{solicitud.documento_tarifa?.nombre || '—'}</Dato>
            {mostrarBancaria && (
              <Dato label="Venta asociada">{solicitud.venta_servicio?.codigo_comprobante ?? `#${solicitud.venta_servicio_id}`}</Dato>
            )}
            <Dato label="Especialista">{solicitud.especialista?.nombres} {solicitud.especialista?.apellidos}</Dato>
            {mostrarBancaria && <Dato label="Monto">{fmtMoney(solicitud.monto)}</Dato>}
            {mostrarBancaria && <Dato label="N° recibo">{solicitud.nro_recibo || '—'}</Dato>}
            <Dato label="Fecha de solicitud">{fmtDate(solicitud.fecha_solicitud)}</Dato>
            <Dato label="Fecha máxima de entrega">{fmtDate(solicitud.fecha_entrega)}</Dato>
          </div>

          {mostrarBancaria && (
            <div>
              <SectionTitle>Pagos realizados</SectionTitle>
              <PagosRealizados solicitud={solicitud} />
            </div>
          )}

          {solicitud.archivo_url && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
              <SectionTitle>Archivo del informe</SectionTitle>
              <AccionesArchivo archivoUrl={solicitud.archivo_url} onPreview={() => setVerPDF(true)} />
              {solicitud.fecha_subida_archivo && (
                <p className="text-xs text-green-600">Subido el {fmtDate(solicitud.fecha_subida_archivo)}</p>
              )}
            </div>
          )}

          {solicitud.nota && (
            <div>
              <SectionTitle>Observaciones</SectionTitle>
              <p className="text-sm text-gray-700 bg-gray-50/70 border border-gray-100 rounded-xl p-3">{solicitud.nota}</p>
            </div>
          )}

          <div>
            <SectionTitle>Historial de revisiones</SectionTitle>
            <HistorialRevisiones revisiones={revisiones} cargando={cargandoRevisiones} />
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button onClick={onClose} className={`${BTN_PRIMARY} mt-4`}>Cerrar</button>
          </div>
        </div>
      </ModalShell>
    </>
  );
};

// ─── Paginación ───────────────────────────────────────────────────────────────

const Paginacion = ({ total, pagina, totalPaginas, onChange }) => (
  <div className="flex items-center justify-between pt-1">
    <span className="text-xs text-gray-400">{total} solicitudes</span>
    <div className="flex items-center gap-2">
      <button onClick={() => onChange(pagina - 1)} disabled={pagina === 0} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-xs text-gray-500 font-medium">{pagina + 1} / {totalPaginas}</span>
      <button onClick={() => onChange(pagina + 1)} disabled={pagina === totalPaginas - 1} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// ─── Vista principal ──────────────────────────────────────────────────────────

/**
 * Una venta puede incluir varias líneas de informe. Se descuentan las líneas que
 * ya tienen solicitud (por venta + documento) y solo quedan las disponibles.
 */
const calcularVentasDisponibles = (ventas, solicitudes) => {
  const usadasPorVentaDoc = new Map();
  solicitudes.forEach((s) => {
    if (!s.venta_servicio_id) return;
    const key = `${s.venta_servicio_id}-${s.documento_tarifa_id}`;
    usadasPorVentaDoc.set(key, (usadasPorVentaDoc.get(key) ?? 0) + 1);
  });

  return ventas
    .map((venta) => {
      const cubiertas = {};
      const disponibles = [];
      (venta.detalles ?? []).filter(esLineaInforme).forEach((linea) => {
        const docId = docDeLinea(linea);
        const yaUsadas = usadasPorVentaDoc.get(`${venta.id}-${docId}`) ?? 0;
        cubiertas[docId] = cubiertas[docId] ?? 0;
        if (cubiertas[docId] < yaUsadas) cubiertas[docId]++;
        else disponibles.push(linea);
      });
      return { ...venta, _informeLineas: disponibles };
    })
    .filter((venta) => venta._informeLineas.length > 0);
};

const extraerTerapeutasActivos = (serviciosPaciente) => {
  const mapa = new Map();
  serviciosPaciente.forEach((item) =>
    (item.asignaciones ?? []).forEach((a) => {
      if (a.estado === 'ACTIVO' && a.activo && a.terapeuta?.id) mapa.set(a.terapeuta.id, a.terapeuta);
    })
  );
  return [...mapa.values()];
};

const SolicitudInformeView = ({ paciente, user: userProp }) => {
  const user = userProp ?? JSON.parse(localStorage.getItem('user') ?? 'null');

  const [solicitudes, setSolicitudes] = useState([]);
  const [ventasInforme, setVentasInforme] = useState([]);
  const [documentosTarifa, setDocumentosTarifa] = useState([]);
  const [modalidadesPago, setModalidadesPago] = useState([]);
  const [terapeutas, setTerapeutas] = useState([]);
  const [serviciosPaciente, setServiciosPaciente] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [pagina, setPagina] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [snack, setSnack] = useState(null);

  const [modalVer, setModalVer] = useState(null);
  const [modalSubir, setModalSubir] = useState(null);
  const [modalRevisar, setModalRevisar] = useState(null);
  const [modalAlerta, setModalAlerta] = useState(null);
  const [idAEliminar, setIdAEliminar] = useState(null);
  const [solicitudAEntregar, setSolicitudAEntregar] = useState(null);

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
      const [solicitudesData, ventasData, documentosData, modalidadesData, serviciosData] = await Promise.all([
        obtenerSolicitudesInformePorPaciente(paciente.id),
        getVentasServicios({ pacienteId: paciente.id }),
        getDocumentosTarifa(),
        obtenerModalidadesPago(),
        getServiciosPorPaciente(paciente.id),
      ]);

      const listaSolicitudes = solicitudesData ?? [];
      const listaServicios = serviciosData ?? [];

      setSolicitudes(listaSolicitudes);
      setDocumentosTarifa(documentosData ?? []);
      setModalidadesPago(modalidadesData ?? []);
      setServiciosPaciente(listaServicios);
      setTerapeutas(extraerTerapeutasActivos(listaServicios));
      setVentasInforme(calcularVentasDisponibles(ventasData ?? [], listaSolicitudes));
    } catch (err) {
      console.error('Error al cargar solicitudes de informe:', err);
      toast('No se pudieron cargar los datos. Inténtalo de nuevo.', 'error');
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
      console.error('Error al registrar solicitud:', err);
      toast(err?.response?.data?.message ?? 'No se pudo registrar la solicitud.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /** Ejecuta una acción confirmada, cierra su modal y recarga el listado. */
  const ejecutarConfirmada = async ({ accion, mensajeOk, mensajeError, cerrar }) => {
    try {
      setLoadingConfirm(true);
      await accion();
      toast(mensajeOk);
      cerrar(null);
      cargarDatos();
    } catch (err) {
      console.error(mensajeError, err);
      toast(mensajeError, 'error');
    } finally {
      setLoadingConfirm(false);
    }
  };

  const confirmarEliminar = () =>
    ejecutarConfirmada({
      accion: () => eliminarSolicitudInforme(idAEliminar),
      mensajeOk: 'Solicitud eliminada',
      mensajeError: 'No se pudo eliminar la solicitud.',
      cerrar: setIdAEliminar,
    });

  const confirmarEntregar = () =>
    ejecutarConfirmada({
      accion: () => marcarInformeEntregado(solicitudAEntregar.id),
      mensajeOk: 'Informe marcado como entregado',
      mensajeError: 'No se pudo marcar el informe como entregado.',
      cerrar: setSolicitudAEntregar,
    });

  const handleAccion = (accion, solicitud) => {
    const abrir = { subir: setModalSubir, revisar: setModalRevisar, entregar: setSolicitudAEntregar };
    abrir[accion]?.(solicitud);
  };

  const puedeCrear = puedeCrearSolicitud(user);
  const totalPaginas = Math.ceil(solicitudes.length / ITEMS_POR_PAGINA);
  const solicitudesPagina = solicitudes.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA);

  return (
    <div className="space-y-4">
      {snack && <Snackbar msg={snack.msg} tipo={snack.tipo} onClose={() => setSnack(null)} />}

      {/* Modales */}
      {modalVer && <ModalVer solicitud={modalVer} user={user} onClose={() => setModalVer(null)} />}
      {modalSubir && <ModalSubirArchivo solicitud={modalSubir} onClose={() => setModalSubir(null)} onSuccess={cargarDatos} />}
      {modalRevisar && <ModalRevisarInforme solicitud={modalRevisar} user={user} onClose={() => setModalRevisar(null)} onSuccess={cargarDatos} />}
      {modalAlerta && <ModalAlerta {...modalAlerta} onClose={() => setModalAlerta(null)} />}
      {idAEliminar && (
        <ModalConfirmacion
          titulo="Eliminar solicitud"
          mensaje="¿Estás seguro de eliminar esta solicitud de informe? Esta acción no se puede deshacer."
          tipo="danger"
          loading={loadingConfirm}
          onClose={() => setIdAEliminar(null)}
          onConfirm={confirmarEliminar}
        />
      )}
      {solicitudAEntregar && (
        <ModalConfirmacion
          titulo="Marcar como entregado"
          mensaje="¿Confirmas que este informe fue entregado al paciente?"
          tipo="success"
          loading={loadingConfirm}
          onClose={() => setSolicitudAEntregar(null)}
          onConfirm={confirmarEntregar}
        />
      )}

      {/* Encabezado */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-100/60 px-5 py-4" style={HEADER_BG}>
        <div className="pointer-events-none absolute -top-10 right-10 w-28 h-28 rounded-full bg-[#7B1FA2]/[0.06] blur-2xl" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/30">
              <FileText className="w-5 h-5 text-white" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-[#2D0A4E] leading-tight">Solicitudes de informe</h3>
              <p className="text-[13px] text-gray-500">
                {solicitudes.length === 0 ? 'Sin solicitudes' : `${solicitudes.length} solicitud${solicitudes.length > 1 ? 'es' : ''}`}
              </p>
            </div>
          </div>

          {!mostrarFormulario && puedeCrear && (
            <button
              onClick={() => setMostrarFormulario(true)}
              disabled={ventasInforme.length === 0 && !loading}
              title={ventasInforme.length === 0 ? 'No hay ventas de informe disponibles' : ''}
              className={`${BTN_PRIMARY} flex-shrink-0 disabled:opacity-40`}
            >
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nueva solicitud</span>
            </button>
          )}
        </div>
      </div>

      {/* Formulario */}
      {mostrarFormulario && puedeCrear && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={ICON_BADGE}><FileText className="w-[18px] h-[18px] text-white" /></span>
              <h3 className="text-base font-extrabold text-[#2D0A4E]">Nueva solicitud de informe</h3>
            </div>
            <button onClick={() => setMostrarFormulario(false)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {ventasInforme.length === 0 ? (
            <div className="mt-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>No hay ventas con informe físico disponibles, o todas ya tienen una solicitud asociada.</p>
            </div>
          ) : (
            <FormularioSolicitud
              user={user}
              loading={loading}
              ventasInforme={ventasInforme}
              documentosTarifa={documentosTarifa}
              terapeutas={terapeutas}
              modalidadesPago={modalidadesPago}
              serviciosPaciente={serviciosPaciente}
              onSubmit={handleSubmit}
              onCancel={() => setMostrarFormulario(false)}
              onMostrarAlerta={setModalAlerta}
            />
          )}
        </div>
      )}

      {/* Listado */}
      {loading && solicitudes.length === 0 ? (
        <div className="py-12 flex justify-center">
          <Spinner className="w-8 h-8 border-gray-100 border-t-[#7B1FA2]" />
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No hay solicitudes de informe registradas</p>
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {solicitudesPagina.map((s) => (
              <SolicitudCard
                key={s.id}
                solicitud={s}
                user={user}
                onVer={setModalVer}
                onEliminar={setIdAEliminar}
                onAccion={handleAccion}
              />
            ))}
          </div>
          {totalPaginas > 1 && (
            <Paginacion total={solicitudes.length} pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
          )}
        </>
      )}
    </div>
  );
};

export default SolicitudInformeView;