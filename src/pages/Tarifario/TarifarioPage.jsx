import React, { useState, useEffect, useMemo } from 'react';
import { getTarifas, getPaquetesCombo } from '../../services/inventarioService';
import { getServicios } from '../../services/serviciosService';
import { getMotivosCita } from '../../services/citaService';
import { getDocumentosTarifa } from '../../services/documentoTarifaService';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => (n != null ? `S/ ${parseFloat(n).toFixed(0)}` : null);

const esEntrevista = (nombre = '') => nombre.toLowerCase().includes('entrevista');
const esEvaluacion = (nombre = '') => nombre.toLowerCase().includes('evaluaci');
const esPagoTotal = (nombre = '') => nombre.toLowerCase().includes('total');
const esInformeVerbal = (nombre = '') => nombre.toLowerCase().includes('informe verbal');
const esInforme = (nombre = '') => nombre.toLowerCase().includes('informe');
const esInformeEvolucion = (nombre = '') =>
  nombre.toLowerCase().includes('informe de evolución') ||
  nombre.toLowerCase().includes('informe de evolucion');

// ─── Badge ───────────────────────────────────────────────────────────────────
const Badge = ({ tipo }) => {
  if (tipo === 'vigencia')
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
        Según vigencia
      </span>
    );
  if (tipo === '5pct')
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200 whitespace-nowrap">
        5% Dsct
      </span>
    );
  if (tipo === true)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
        Aplica
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
      No aplica
    </span>
  );
};

// ─── Tabla de tarifas ─────────────────────────────────────────────────────────
const TarifaTable = ({ rows }) => (
  <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
    <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tipo de sesión</span>
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Descuento</span>
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Tarifa</span>
    </div>
    {rows.map((row, i) => (
      <div
        key={i}
        className={`grid grid-cols-[1fr_auto_auto] gap-3 px-4 py-3 items-center ${
          i < rows.length - 1 ? 'border-b border-gray-100' : ''
        }`}
      >
        <div>
          <p className="text-sm font-medium text-gray-900">{row.label}</p>
          {row.nota && <p className="text-xs text-gray-400 mt-0.5">{row.nota}</p>}
        </div>
        <div className="flex justify-center">
          <Badge tipo={row.descuento} />
        </div>
        <div className="text-right">
          {row.precio != null ? (
            <span className="text-sm font-semibold text-gray-900">{fmt(row.precio)}</span>
          ) : (
            <span className="text-xs text-gray-400 italic">Ver cálculo</span>
          )}
        </div>
      </div>
    ))}
  </div>
);

// ─── Grid de paquetes ─────────────────────────────────────────────────────────
const PaquetesGrid = ({ paquetes, precioBase }) => {
  if (!paquetes || paquetes.length === 0) return null;

  const cards = paquetes.map((p) => {
    const paquete = p.paquete;
    const sesiones = paquete?.cantidadSesiones ?? paquete?.cantidad_sesiones ?? '?';
    let precioTotal = null;
    let unitario = null;
    let ahorro = null;

    if (p.tipo_calculo === 'precio_total') {
      precioTotal = parseFloat(p.valor);
      unitario = precioTotal / sesiones;
      if (precioBase != null) ahorro = precioBase * sesiones - precioTotal;
    } else if (p.tipo_calculo === 'descuento_porcentaje' && precioBase != null) {
      const pct = parseFloat(p.valor) / 100;
      unitario = precioBase * (1 - pct);
      precioTotal = unitario * sesiones;
      ahorro = precioBase * sesiones - precioTotal;
    }

    return { sesiones, precioTotal, unitario, ahorro };
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Paquetes disponibles
      </p>
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {precioBase != null && (
          <div className="bg-white border border-gray-200 rounded-lg p-2.5 text-center hover:shadow-md transition-shadow">
            <p className="text-xs text-gray-400 mb-1">1 sesión</p>
            <p className="text-base font-semibold text-gray-900">{fmt(precioBase)}</p>
            <p className="text-xs text-gray-400">{fmt(precioBase)} c/u</p>
          </div>
        )}
        {cards.map((c, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-2.5 text-center hover:shadow-md transition-shadow">
            <p className="text-xs text-gray-400 mb-1">{c.sesiones} sesiones</p>
            <p className="text-base font-semibold text-gray-900">
              {c.precioTotal != null ? fmt(c.precioTotal) : '—'}
            </p>
            {c.unitario != null && (
              <p className="text-xs text-gray-400">{fmt(c.unitario)} c/u</p>
            )}
            {c.ahorro > 0 && (
              <p className="text-xs text-green-600 font-medium mt-0.5">
                Ahorras {fmt(c.ahorro)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Tarjeta de servicio ──────────────────────────────────────────────────────
const ServicioCard = ({ servicio, tarifas, motivosMap, onClick, isSelected }) => {
  const [isHovered, setIsHovered] = useState(false);

  let precioBase = null;
  let tienePaquetes = false;
  const tiposServicio = new Set();

  tarifas.forEach((t) => {
    const nombre = motivosMap[t.motivo_cita_id] ?? '';
    const precio = parseFloat(t.precio);

    if (!esEntrevista(nombre) && !esEvaluacion(nombre) && !esInforme(nombre)) {
      if (precioBase === null || precio < precioBase) precioBase = precio;
    }

    if (esEntrevista(nombre)) tiposServicio.add('Entrevista');
    if (esEvaluacion(nombre) || esInforme(nombre)) tiposServicio.add('Evaluación');
    if (!esEntrevista(nombre) && !esEvaluacion(nombre) && !esInforme(nombre)) tiposServicio.add('Terapia');
    if ((t.precios_paquetes ?? []).length > 0) tienePaquetes = true;
  });

  const tiposArray = Array.from(tiposServicio);

  return (
    <button
      onClick={() => onClick(servicio)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative p-5 rounded-2xl transition-all duration-300 text-left ${
        isSelected
          ? 'bg-purple-50 border-2 border-[#7B1FA2] shadow-xl scale-[1.02]'
          : 'bg-white border border-gray-100 hover:border-[#7B1FA2]/30 hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      <h3 className="text-lg font-bold text-gray-800 mb-2 pr-8 group-hover:text-[#7B1FA2] transition-colors">
        {servicio.nombre}
      </h3>

      {tiposArray.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tiposArray.map((tipo, idx) => (
            <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
              {tipo}
            </span>
          ))}
        </div>
      )}

      {precioBase && (
        <div className="mt-2 pt-3 border-t border-gray-100 flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">Desde</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#7B1FA2]">{fmt(precioBase)}</span>
              <span className="text-xs text-gray-400">/ sesión</span>
            </div>
          </div>
          <div className={`transform transition-all duration-300 ${isHovered ? 'translate-x-1' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <svg className="w-4 h-4 text-gray-400 group-hover:text-[#7B1FA2] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {tienePaquetes && (
        <div className={`absolute top-4 right-4 transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Paquetes
          </span>
        </div>
      )}
    </button>
  );
};

// ─── Panel lateral de detalle (servicios) ────────────────────────────────────
const DetallePanel = ({ servicio, tarifas, motivosMap, combos = [], onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const rowsEval = [];
  const rowsTerapia = [];
  let precioBase = null;
  let paquetes = [];

  const esTLInfantil =
    servicio.nombre?.toLowerCase().includes('lenguaje') &&
    servicio.area?.nombre?.toLowerCase().includes('infantil');

  const combosDelServicio = esTLInfantil
    ? combos.filter((c) =>
        (c.items ?? []).some((item) => item.servicioTarifa?.servicio?.id === servicio.id)
      )
    : [];

  tarifas.forEach((t) => {
    const nombre = motivosMap[t.motivo_cita_id] ?? `Motivo #${t.motivo_cita_id}`;
    const precio = parseFloat(t.precio);

    if (esEntrevista(nombre)) {
      rowsEval.push({ label: nombre, descuento: 'vigencia', precio });
    } else if (esEvaluacion(nombre) || esInforme(nombre)) {
      if (esPagoTotal(nombre)) {
        rowsEval.push({
          label: esTLInfantil
            ? 'Evaluación + Informe de evaluación'
            : 'Pago total evaluación',
          descuento: '5pct',
          precio: esTLInfantil ? precio : null,
          nota: 'Incluye informe de evaluación',
        });
      } else {
        rowsEval.push({ label: nombre, descuento: esInforme(nombre), precio });
      }
    } else {
      const tienePaquetes = (t.precios_paquetes ?? []).length > 0;
      rowsTerapia.push({ label: nombre, descuento: tienePaquetes, precio });
      if (precioBase === null || precio < precioBase) precioBase = precio;
      if (tienePaquetes) paquetes = t.precios_paquetes;
    }
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 300);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-all duration-300 ${
          isClosing ? 'translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex-shrink-0 border-b border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{servicio.nombre}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {servicio.area?.nombre ?? 'Área no especificada'}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {(rowsEval.length > 0 || combosDelServicio.length > 0) && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Evaluación
                </p>
                {rowsEval.length > 0 && <TarifaTable rows={rowsEval} />}
                {combosDelServicio.length > 0 && (
                  <div className={rowsEval.length > 0 ? 'mt-2' : ''}>
                    <TarifaTable
                      rows={combosDelServicio.map((c) => ({
                        label: 'Evaluación c/ informe',
                        nota: c.descripcion || null,
                        descuento: true,
                        precio: parseFloat(c.precioTotal),
                      }))}
                    />
                  </div>
                )}
                {servicio.nombre?.toLowerCase().includes('psicolog') &&
                  servicio.nombre?.toLowerCase().includes('infantil') && (
                    <div className="mt-2 flex items-start gap-2 px-3 py-2 bg-green-50 border border-green-100 rounded-xl">
                      <svg
                        className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      <p className="text-xs text-green-700 font-medium">
                        Aplica 5% de descuento en el pago total de la Evaluación
                      </p>
                    </div>
                  )}
              </div>
            )}
            {rowsTerapia.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Terapia</p>
                <TarifaTable rows={rowsTerapia} />
              </div>
            )}
            {paquetes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Paquetes</p>
                <PaquetesGrid paquetes={paquetes} precioBase={precioBase} />
              </div>
            )}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500">
                * Aplica el 5% de descuento adicional a partir de 8 sesiones
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Panel lateral de detalle (documentos) ───────────────────────────────────
const DetallePanelDocumento = ({ doc, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const informeEvolucion = esInformeEvolucion(doc.nombre);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 300);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-all duration-300 ${
          isClosing ? 'translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex-shrink-0 border-b border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{doc.nombre}</h2>
                {doc.tipoArchivo?.nombre && doc.tipoArchivo.nombre !== doc.nombre && (
                  <p className="text-sm text-gray-500 mt-1">{doc.tipoArchivo.nombre}</p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Precio</p>
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                <div className="px-4 py-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{doc.nombre}</p>
                  <span className="text-xl font-bold text-gray-900">{fmt(doc.precio)}</span>
                </div>
              </div>
            </div>

            {doc.descripcion && doc.descripcion !== doc.nombre && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Descripción</p>
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <p className="text-sm text-gray-700">{doc.descripcion}</p>
                </div>
              </div>
            )}

            {informeEvolucion && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 flex gap-3">
                <svg
                  className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-blue-700">
                  Este documento se emite únicamente después de haber completado{' '}
                  <span className="font-semibold">16 sesiones</span>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Tarjeta de documento tarifado ───────────────────────────────────────────
const DocumentoTarifaCard = ({ doc, onClick, isSelected }) => {
  const [isHovered, setIsHovered] = useState(false);
  const informeEvolucion = esInformeEvolucion(doc.nombre);

  return (
    <button
      onClick={() => onClick(doc)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative p-5 rounded-2xl transition-all duration-300 text-left ${
        isSelected
          ? 'bg-purple-50 border-2 border-[#7B1FA2] shadow-xl scale-[1.02]'
          : 'bg-white border border-gray-100 hover:border-[#7B1FA2]/30 hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      <h3 className="text-lg font-bold text-gray-800 mb-2 pr-8 group-hover:text-[#7B1FA2] transition-colors">
        {doc.nombre}
      </h3>

      {informeEvolucion && (
        <div className="mb-3">
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium border border-blue-100">
            Desde sesión 16
          </span>
        </div>
      )}

      <div className="mt-2 pt-3 border-t border-gray-100 flex items-end justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">Precio</p>
          <span className="text-2xl font-bold text-[#7B1FA2]">{fmt(doc.precio)}</span>
        </div>
        <div className={`transform transition-all duration-300 ${isHovered ? 'translate-x-1' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-[#7B1FA2] transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
};

// ─── Convenio Aldeas Infantiles SOS ──────────────────────────────────────────
const ALDEAS_DESCUENTOS = [
  {
    categoria: 'Evaluaciones y Entrevistas',
    color: 'amber',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    ),
    items: [
      { label: 'Evaluación en Terapia de Lenguaje', descuento: '50%' },
      { label: 'Evaluación en Terapia Ocupacional', descuento: '50%' },
      { label: 'Entrevista psicológica para padres o cuidadores', descuento: '50%' },
    ],
  },
  {
    categoria: 'Informes Terapéuticos',
    color: 'blue',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
    items: [
      { label: 'Informes de evaluación', descuento: '100%', nota: 'Gratuito' },
      { label: 'Informes de avance o evolución terapéutica', descuento: '50%' },
    ],
  },
  {
    categoria: 'Servicios Terapéuticos',
    color: 'green',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    ),
    items: [
      {
        label: 'Terapia de Lenguaje',
        descuento: '10%',
        nota: 'En paquetes de 4 sesiones a más',
      },
      {
        label: 'Terapia Ocupacional',
        descuento: '10%',
        nota: 'En paquetes de 4 sesiones a más',
      },
      {
        label: 'Psicología (infantil, adolescente o adulto)',
        descuento: '10%',
        nota: 'En paquetes de 4 sesiones a más',
      },
    ],
  },
];

const colorMap = {
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    titleColor: 'text-amber-800',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    titleColor: 'text-blue-800',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-700',
    titleColor: 'text-green-800',
  },
};

const AldeasConvenioSection = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-8">
      {/* Banner principal */}
      <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 via-white to-red-50 overflow-hidden">
        {/* Header del convenio */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-red-100">
          <div className="flex items-center gap-3">
            {/* Logo/ícono representativo */}
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">Convenio Aldeas Infantiles SOS Perú</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                  Convenio especial
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Descuentos exclusivos para beneficiarios — Centro de Terapias Crecemos
              </p>
            </div>
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
          >
            {expanded ? 'Ocultar' : 'Ver descuentos'}
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Contenido expandible */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {ALDEAS_DESCUENTOS.map((grupo) => {
              const c = colorMap[grupo.color];
              return (
                <div
                  key={grupo.categoria}
                  className={`rounded-xl border ${c.border} ${c.bg} p-4`}
                >
                  {/* Cabecera de categoría */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-7 h-7 rounded-lg ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <svg
                        className={`w-4 h-4 ${c.iconColor}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {grupo.icon}
                      </svg>
                    </div>
                    <p className={`text-xs font-bold uppercase tracking-wide ${c.titleColor}`}>
                      {grupo.categoria}
                    </p>
                  </div>

                  {/* Items */}
                  <ul className="space-y-2.5">
                    {grupo.items.map((item, idx) => (
                      <li key={idx} className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 leading-tight">
                            {item.label}
                          </p>
                          {item.nota && (
                            <p className="text-xs text-gray-500 mt-0.5 italic">{item.nota}</p>
                          )}
                        </div>
                        <span
                          className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${c.badgeBg} ${c.badgeText} border ${c.border}`}
                        >
                          {item.descuento === '100%' ? 'Gratis' : `${item.descuento} dto.`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Nota al pie */}
          <div className="px-5 pb-4">
            <div className="flex items-start gap-2 bg-white rounded-xl border border-gray-100 px-4 py-3">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs text-gray-500">
                Los descuentos aplican exclusivamente a beneficiarios del convenio con Aldeas Infantiles SOS Perú.
                Para consultas sobre la aplicación del convenio, comuníquese con administración.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Convenio Colegio Sor Ana de los Ángeles ─────────────────────────────────
const SOR_ANA_DESCUENTOS = [
  {
    categoria: 'Beneficios para estudiantes',
    color: 'purple',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
      />
    ),
    items: [
      { label: 'Primera cita de evaluación o entrevista inicial', descuento: '50%' },
      { label: 'Primera cita para estudiantes con necesidad de apoyo económico', descuento: '100%', nota: 'Gratuita — previa identificación por el colegio' },
      { label: 'Paquetes terapéuticos (apoyo económico)', descuento: '10%' },
    ],
  },
  {
    categoria: 'Beneficios para padres de familia',
    color: 'blue',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    ),
    items: [
      { label: 'Primera cita de evaluación o entrevista inicial', descuento: '50%' },
      { label: 'Paquetes terapéuticos', descuento: '10%', nota: 'Cuando corresponda' },
    ],
  },
  {
    categoria: 'Colaboradores del colegio',
    color: 'green',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    ),
    items: [
      { label: 'Entrevista psicológica inicial', descuento: '50%', nota: 'Exclusivo servicio de Psicología' },
      { label: 'Paquetes de sesiones psicológicas', descuento: '25%', nota: 'Exclusivo servicio de Psicología' },
    ],
  },
];

const sorAnaColorMap = {
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    titleColor: 'text-purple-800',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    titleColor: 'text-blue-800',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-700',
    titleColor: 'text-green-800',
  },
};

const SorAnaConvenioSection = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-8">
      <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 via-white to-purple-50 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">I.E.P. Colegio Sor Ana de los Ángeles</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                  Convenio especial
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Descuentos ofrecidos en el convenio — Centro de Terapias Crecemos
              </p>
            </div>
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-600 hover:bg-purple-100 transition-colors"
          >
            {expanded ? 'Ocultar' : 'Ver descuentos'}
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {SOR_ANA_DESCUENTOS.map((grupo) => {
              const c = sorAnaColorMap[grupo.color];
              return (
                <div key={grupo.categoria} className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-7 h-7 rounded-lg ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <svg className={`w-4 h-4 ${c.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {grupo.icon}
                      </svg>
                    </div>
                    <p className={`text-xs font-bold uppercase tracking-wide ${c.titleColor}`}>
                      {grupo.categoria}
                    </p>
                  </div>
                  <ul className="space-y-2.5">
                    {grupo.items.map((item, idx) => (
                      <li key={idx} className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 leading-tight">{item.label}</p>
                          {item.nota && (
                            <p className="text-xs text-gray-500 mt-0.5 italic">{item.nota}</p>
                          )}
                        </div>
                        <span
                          className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${c.badgeBg} ${c.badgeText} border ${c.border}`}
                        >
                          {item.descuento === '100%' ? 'Gratis' : `${item.descuento} dto.`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="px-5 pb-4">
            <div className="flex items-start gap-2 bg-white rounded-xl border border-gray-100 px-4 py-3">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-gray-500">
                Los descuentos aplican exclusivamente a estudiantes, padres de familia y colaboradores del I.E.P. Colegio Sor Ana de los Ángeles.
                Para consultas sobre la aplicación del convenio, comuníquese con administración.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Mapeo de rangos de edad por área ────────────────────────────────────────
const RANGOS_EDAD = {
  'Área Infantil': [
    { label: 'Infantil', rango: '1 a 12 años', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  ],
  'Área Adolescentes': [
    { label: 'Adolescentes', rango: '13 a 17 años', color: 'bg-orange-50 text-orange-600 border-orange-100' },
  ],
  'Área Adultos': [
    { label: 'Adultos', rango: '18 años a más', color: 'bg-green-50 text-green-600 border-green-100' },
  ],
};

const ORDEN_AREAS = ['Área Infantil', 'Área Adolescentes', 'Área Adultos'];

// ─── Sección header ───────────────────────────────────────────────────────────
const SeccionHeader = ({ titulo, cantidad }) => {
  const rangos = RANGOS_EDAD[titulo] ?? [];
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="w-1 h-5 bg-[#7B1FA2] rounded-full flex-shrink-0" />
      <h2 className="text-lg font-semibold text-gray-800">{titulo}</h2>
      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{cantidad}</span>
      {rangos.length > 0 && (
        <div className="flex items-center gap-1.5 ml-1">
          <span className="text-gray-300 text-xs">—</span>
          {rangos.map((r) => (
            <span
              key={r.label}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-medium ${r.color}`}
            >
              <span className="font-semibold">{r.label}</span>
              <span className="opacity-75">{r.rango}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const TarifarioPage = () => {
  const [tarifas, setTarifas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [motivos, setMotivos] = useState([]);
  const [documentosTarifa, setDocumentosTarifa] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [selectedDocumento, setSelectedDocumento] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelDocOpen, setPanelDocOpen] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [tarifasRes, serviciosRes, motivosRes, docsRes, combosRes] = await Promise.all([
          getTarifas(),
          getServicios(),
          getMotivosCita(),
          getDocumentosTarifa(),
          getPaquetesCombo(),
        ]);
        setTarifas(tarifasRes.filter((t) => t.flg_activo === 1 || t.activo));
        setServicios(serviciosRes);
        setMotivos(motivosRes);
        setDocumentosTarifa(docsRes.filter((d) => d.flgActivo === 1));
        setCombos(Array.isArray(combosRes) ? combosRes : []);
      } catch (e) {
        setError('No se pudo cargar el tarifario.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const motivosMap = useMemo(
    () => Object.fromEntries(motivos.map((m) => [m.id, m.nombre])),
    [motivos]
  );

  const tarifasMap = useMemo(() => {
    const map = {};
    tarifas.forEach((t) => {
      if (!map[t.servicio_id]) map[t.servicio_id] = [];
      map[t.servicio_id].push(t);
    });
    return map;
  }, [tarifas]);

  const serviciosConTarifas = useMemo(
    () => servicios.filter((s) => (tarifasMap[s.id] ?? []).length > 0),
    [servicios, tarifasMap]
  );

  const serviciosAgrupados = useMemo(() => {
    const grupos = {};
    serviciosConTarifas.forEach((s) => {
      const area = s.area?.nombre || 'Otros';
      if (!grupos[area]) grupos[area] = [];
      grupos[area].push(s);
    });
    return grupos;
  }, [serviciosConTarifas]);

  const handleServicioClick = (servicio) => {
    setSelectedDocumento(null);
    setPanelDocOpen(false);
    setSelectedServicio(servicio);
    setPanelOpen(true);
  };

  const handleDocumentoClick = (doc) => {
    setSelectedServicio(null);
    setPanelOpen(false);
    setSelectedDocumento(doc);
    setPanelDocOpen(true);
  };

  const handleClosePanel = () => {
    setPanelOpen(false);
    setTimeout(() => setSelectedServicio(null), 300);
  };

  const handleClosePanelDoc = () => {
    setPanelDocOpen(false);
    setTimeout(() => setSelectedDocumento(null), 300);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 mx-auto border-4 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Cargando tarifario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <p className="text-sm text-red-500 font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="text-xs text-gray-400 underline">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const hayContenido = serviciosConTarifas.length > 0 || documentosTarifa.length > 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#7B1FA2]/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[#7B1FA2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Tarifario de Servicios</h1>
            <p className="text-xs text-gray-400">Selecciona un servicio para ver sus tarifas</p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* ── Convenio Aldeas Infantiles SOS ── */}
        <AldeasConvenioSection />

        {/* ── Convenio Colegio Sor Ana de los Ángeles ── */}
        <SorAnaConvenioSection />

        {/* ── Servicios por área ── */}
        {[
          ...ORDEN_AREAS,
          ...Object.keys(serviciosAgrupados).filter((a) => !ORDEN_AREAS.includes(a)),
        ]
          .filter((areaNombre) => serviciosAgrupados[areaNombre])
          .map((areaNombre) => {
            const areaServicios = serviciosAgrupados[areaNombre];
            return (
              <div key={areaNombre} className="mb-8">
                <SeccionHeader titulo={areaNombre} cantidad={areaServicios.length} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {areaServicios.map((servicio) => (
                    <ServicioCard
                      key={servicio.id}
                      servicio={servicio}
                      tarifas={tarifasMap[servicio.id] ?? []}
                      motivosMap={motivosMap}
                      onClick={handleServicioClick}
                      isSelected={selectedServicio?.id === servicio.id && panelOpen}
                    />
                  ))}
                </div>
              </div>
            );
          })}

        {documentosTarifa.length > 0 && (
          <div className="mb-8">
            <SeccionHeader titulo="Documentos" cantidad={documentosTarifa.length} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {documentosTarifa.map((doc) => (
                <DocumentoTarifaCard
                  key={doc.id}
                  doc={doc}
                  onClick={handleDocumentoClick}
                  isSelected={selectedDocumento?.id === doc.id && panelDocOpen}
                />
              ))}
            </div>
          </div>
        )}

        {!hayContenido && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-400">No hay servicios disponibles</p>
          </div>
        )}
      </div>

      {panelOpen && selectedServicio && (
        <DetallePanel
          servicio={selectedServicio}
          tarifas={tarifasMap[selectedServicio.id] ?? []}
          motivosMap={motivosMap}
          combos={combos}
          onClose={handleClosePanel}
        />
      )}

      {panelDocOpen && selectedDocumento && (
        <DetallePanelDocumento doc={selectedDocumento} onClose={handleClosePanelDoc} />
      )}
    </div>
  );
};

export default TarifarioPage;