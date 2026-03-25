import React, { useState, useEffect, useMemo } from 'react';
import { getTarifas } from '../../services/inventarioService';
import { getServicios } from '../../services/serviciosService';
import { getMotivosCita } from '../../services/citaService';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => (n != null ? `S/ ${parseFloat(n).toFixed(0)}` : null);

const esEntrevista = (nombre = '') => nombre.toLowerCase().includes('entrevista');
const esEvaluacion = (nombre = '') => nombre.toLowerCase().includes('evaluaci');
const esPagoTotal = (nombre = '') => nombre.toLowerCase().includes('total');

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

// ─── Tarjeta de servicio (versión minimalista moderna) ─────────────────────────
const ServicioCard = ({ servicio, tarifas, motivosMap, onClick, isSelected }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Obtener el precio base más bajo (terapia individual)
  let precioBase = null;
  let tienePaquetes = false;
  let tiposServicio = new Set();
  
  tarifas.forEach((t) => {
    const nombre = motivosMap[t.motivo_cita_id] ?? '';
    const precio = parseFloat(t.precio);
    
    if (!esEntrevista(nombre) && !esEvaluacion(nombre)) {
      if (precioBase === null || precio < precioBase) precioBase = precio;
    }
    
    if (esEntrevista(nombre)) tiposServicio.add('Entrevista');
    if (esEvaluacion(nombre)) tiposServicio.add('Evaluación');
    if (!esEntrevista(nombre) && !esEvaluacion(nombre)) tiposServicio.add('Terapia');
    
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
      {/* Nombre del servicio */}
      <h3 className="text-lg font-bold text-gray-800 mb-2 pr-8 group-hover:text-[#7B1FA2] transition-colors">
        {servicio.nombre}
      </h3>

      {/* Tipos de servicio como badges */}
      {tiposArray.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tiposArray.map((tipo, idx) => (
            <span 
              key={idx}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium"
            >
              {tipo}
            </span>
          ))}
        </div>
      )}

      {/* Precio */}
      {precioBase && (
        <div className="mt-2 pt-3 border-t border-gray-100 flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">Desde</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#7B1FA2]">
                {fmt(precioBase)}
              </span>
              <span className="text-xs text-gray-400">/ sesión</span>
            </div>
          </div>
          
          {/* Indicador de click */}
          <div className={`transform transition-all duration-300 ${isHovered ? 'translate-x-1' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <svg className="w-4 h-4 text-gray-400 group-hover:text-[#7B1FA2] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Badge de paquetes */}
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

// ─── Panel lateral de detalle ────────────────────────────────────────────────
const DetallePanel = ({ servicio, tarifas, motivosMap, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const rowsEval = [];
  const rowsTerapia = [];
  let precioBase = null;
  let paquetes = [];

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

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 300);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      {/* Panel lateral */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-all duration-300 ${
        isClosing ? 'translate-x-full' : 'translate-x-0'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 border-b border-gray-200">
            <div className="p-6">
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
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {rowsEval.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Evaluación
                </p>
                <TarifaTable rows={rowsEval} />
              </div>
            )}

            {rowsTerapia.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Terapia
                </p>
                <TarifaTable rows={rowsTerapia} />
              </div>
            )}

            {paquetes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Paquetes
                </p>
                <PaquetesGrid paquetes={paquetes} precioBase={precioBase} />
              </div>
            )}

            {/* Nota */}
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

// ─── Componente principal ─────────────────────────────────────────────────────
const TarifarioPage = () => {
  const [tarifas, setTarifas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [motivos, setMotivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

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

  const serviciosConTarifas = useMemo(() => {
    return servicios.filter((s) => (tarifasMap[s.id] ?? []).length > 0);
  }, [servicios, tarifasMap]);

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
    setSelectedServicio(servicio);
    setPanelOpen(true);
  };

  const handleClosePanel = () => {
    setPanelOpen(false);
    setTimeout(() => setSelectedServicio(null), 300);
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

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#7B1FA2]/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[#7B1FA2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Tarifario de Servicios</h1>
            <p className="text-xs text-gray-400">Selecciona un servicio para ver sus tarifas</p>
          </div>
        </div>
      </div>

      {/* Grid de servicios */}
      <div className="p-6">
        {Object.entries(serviciosAgrupados).map(([areaNombre, areaServicios]) => (
          <div key={areaNombre} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-[#7B1FA2] rounded-full" />
              <h2 className="text-lg font-semibold text-gray-800">{areaNombre}</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {areaServicios.length}
              </span>
            </div>
            
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
        ))}

        {serviciosConTarifas.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-400">No hay servicios disponibles</p>
          </div>
        )}
      </div>

      {/* Panel lateral */}
      {panelOpen && selectedServicio && (
        <DetallePanel
          servicio={selectedServicio}
          tarifas={tarifasMap[selectedServicio.id] ?? []}
          motivosMap={motivosMap}
          onClose={handleClosePanel}
        />
      )}
    </div>
  );
};

export default TarifarioPage;