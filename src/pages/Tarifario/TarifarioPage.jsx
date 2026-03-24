import React, { useState, useEffect, useMemo } from 'react';
import { getTarifas } from '../../services/inventarioService';
import { getServicios } from '../../services/serviciosService';
import { getMotivosCita } from '../../services/citaService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n) => (n != null ? `S/ ${parseFloat(n).toFixed(0)}` : null);

const esEntrevista = (nombre = '') => nombre.toLowerCase().includes('entrevista');
const esEvaluacion = (nombre = '') => nombre.toLowerCase().includes('evaluaci');
const esPagoTotal  = (nombre = '') => nombre.toLowerCase().includes('total');

const ORDEN_AREAS = ['Infantil y Adolescentes', 'Adultos'];

// ─── Badge de descuento ───────────────────────────────────────────────────────

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
    const paquete   = p.paquete;
    const sesiones  = paquete?.cantidadSesiones ?? paquete?.cantidad_sesiones ?? '?';
    let precioTotal = null;
    let unitario    = null;
    let ahorro      = null;

    if (p.tipo_calculo === 'precio_total') {
      precioTotal = parseFloat(p.valor);
      unitario    = precioTotal / sesiones;
      if (precioBase != null) ahorro = precioBase * sesiones - precioTotal;
    } else if (p.tipo_calculo === 'descuento_porcentaje' && precioBase != null) {
      const pct   = parseFloat(p.valor) / 100;
      unitario    = precioBase * (1 - pct);
      precioTotal = unitario * sesiones;
      ahorro      = precioBase * sesiones - precioTotal;
    }

    return { sesiones, precioTotal, unitario, ahorro };
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Paquetes disponibles
      </p>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))' }}>
        {/* Sesión suelta como referencia */}
        {precioBase != null && (
          <div className="bg-white border border-gray-200 rounded-lg p-2.5 text-center">
            <p className="text-xs text-gray-400 mb-1">1 sesión</p>
            <p className="text-base font-semibold text-gray-900">{fmt(precioBase)}</p>
            <p className="text-xs text-gray-400">{fmt(precioBase)} c/u</p>
          </div>
        )}
        {cards.map((c, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-2.5 text-center">
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

// ─── Panel de detalle de un servicio ─────────────────────────────────────────

const DetalleServicio = ({ servicio, tarifas, motivosMap }) => {
  const rowsEval    = [];
  const rowsTerapia = [];
  let precioBase    = null;
  let paquetes      = [];

  tarifas.forEach((t) => {
    const nombre = motivosMap[t.motivo_cita_id] ?? `Motivo #${t.motivo_cita_id}`;
    const precio = parseFloat(t.precio);

    if (esEntrevista(nombre)) {
      rowsEval.push({ label: nombre, descuento: 'vigencia', precio });
    } else if (esEvaluacion(nombre)) {
      if (esPagoTotal(nombre)) {
        rowsEval.push({
          label: 'Pago total evaluación',
          descuento: '5pct',
          precio: null,
          nota: 'Incluye informe de evaluación',
        });
      } else {
        rowsEval.push({ label: nombre, descuento: false, precio });
      }
    } else {
      const tienePaquetes = (t.precios_paquetes ?? []).length > 0;
      rowsTerapia.push({ label: nombre, descuento: tienePaquetes, precio });
      if (precioBase === null || precio < precioBase) precioBase = precio;
      if (tienePaquetes) paquetes = t.precios_paquetes;
    }
  });

  return (
    <div className="h-full overflow-y-auto p-6 max-w-2xl">

      {/* Cabecera del servicio */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7B1FA2] inline-block" />
          <span className="text-xs font-semibold text-[#7B1FA2] uppercase tracking-wide">
            {servicio.area?.nombre ?? 'Área'}
          </span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">{servicio.nombre}</h2>
      </div>

      {/* Evaluación */}
      {rowsEval.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Evaluación
          </p>
          <TarifaTable rows={rowsEval} />
        </div>
      )}

      {/* Terapia */}
      {rowsTerapia.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Terapia
          </p>
          <TarifaTable rows={rowsTerapia} />
        </div>
      )}

      {/* Paquetes */}
      {paquetes.length > 0 && (
        <div className="mb-4">
          <PaquetesGrid paquetes={paquetes} precioBase={precioBase} />
        </div>
      )}

      {/* Nota */}
      <p className="text-xs text-gray-400">
        * Aplica el 5% de dsct adicional a partir de 8 sesiones
      </p>
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────

const TarifarioPage = () => {
  const [tarifas, setTarifas]     = useState([]);
  const [servicios, setServicios] = useState([]);
  const [motivos, setMotivos]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activoId, setActivoId]   = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [tarifasRes, serviciosRes, motivosRes] = await Promise.all([
          getTarifas(),
          getServicios(),
          getMotivosCita(),
        ]);
        setTarifas(tarifasRes.filter((t) => t.flg_activo === 1 || t.activo));
        setServicios(serviciosRes);
        setMotivos(motivosRes);
      } catch (e) {
        setError('No se pudo cargar el tarifario.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // Mapa motivoId → nombre
  const motivosMap = useMemo(
    () => Object.fromEntries(motivos.map((m) => [m.id, m.nombre])),
    [motivos],
  );

  // Mapa servicioId → tarifas[]
  const tarifasMap = useMemo(() => {
    const map = {};
    tarifas.forEach((t) => {
      if (!map[t.servicio_id]) map[t.servicio_id] = [];
      map[t.servicio_id].push(t);
    });
    return map;
  }, [tarifas]);

  // Servicios agrupados por área, ordenados, solo los que tienen tarifas activas
  const areas = useMemo(() => {
    const grupos = {};
    servicios
      .filter((s) => (tarifasMap[s.id] ?? []).length > 0)
      .forEach((s) => {
        const area = s.area?.nombre || 'Otros';
        if (!grupos[area]) grupos[area] = [];
        grupos[area].push(s);
      });

    return Object.keys(grupos)
      .sort((a, b) => {
        const ia = ORDEN_AREAS.indexOf(a);
        const ib = ORDEN_AREAS.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      })
      .map((nombre) => ({ nombre, servicios: grupos[nombre] }));
  }, [servicios, tarifasMap]);

  // Seleccionar primer servicio por defecto cuando cargan
  useEffect(() => {
    if (areas.length > 0 && activoId === null) {
      setActivoId(areas[0].servicios[0]?.id ?? null);
    }
  }, [areas]);

  const servicioActivo = servicios.find((s) => s.id === activoId) ?? null;
  const tarifasActivo  = tarifasMap[activoId] ?? [];

  // ── Loading ──
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

  // ── Error ──
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

  // ── Layout principal ──
  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#7B1FA2]/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[#7B1FA2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Tarifario de Servicios</h1>
            <p className="text-xs text-gray-400">Crecemos · Centro Integral de Terapias</p>
          </div>
        </div>
      </div>

      {/* Body: sidebar + detalle */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar: lista de servicios agrupados por área ── */}
        <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Servicios</p>
          </div>

          {areas.map((area) => (
            <div key={area.nombre} className="mb-1">
              {/* Etiqueta de área */}
              <div className="px-4 pt-4 pb-1.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {area.nombre}
                </p>
              </div>

              {/* Botones de servicio */}
              {area.servicios.map((svc) => {
                const isActive = svc.id === activoId;
                return (
                  <button
                    key={svc.id}
                    onClick={() => setActivoId(svc.id)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors border-l-2 ${
                      isActive
                        ? 'border-[#7B1FA2] bg-purple-50 text-[#7B1FA2]'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
                        isActive ? 'bg-[#7B1FA2]' : 'bg-gray-300'
                      }`}
                    />
                    <span className={`text-sm leading-snug ${isActive ? 'font-medium' : ''}`}>
                      {svc.nombre}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        {/* ── Panel derecho: detalle del servicio seleccionado ── */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {servicioActivo ? (
            <DetalleServicio
              key={activoId}
              servicio={servicioActivo}
              tarifas={tarifasActivo}
              motivosMap={motivosMap}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">Selecciona un servicio</p>
              </div>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default TarifarioPage;