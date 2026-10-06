import React from 'react';
import { ESCALA, SECCIONES_ESCALA, COL_COMENTARIOS } from '../../constants/fichaSeguimientoPsicologia';

// Cuerpo del formulario de la Ficha de Seguimiento Psicológico (Cuestionario para Maestros de Conners).
// `valores` es un objeto plano: una clave por columna de la BD (nada de JSON anidado).
// Cada reactivo se valora con la escala Nunca(0) · Sólo un poco(1) · Bastante(2) · Mucho(3).

const GRID = 'sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4';

// Color del valor seleccionado según intensidad (0 claro → 3 intenso)
const ESCALA_SEL = {
  0: 'bg-[#A3C644] text-white border-[#A3C644] shadow-sm',
  1: 'bg-amber-400 text-white border-amber-400 shadow-sm',
  2: 'bg-orange-500 text-white border-orange-500 shadow-sm',
  3: 'bg-red-500 text-white border-red-500 shadow-sm',
};

const SectionCard = ({ index, titulo, children }) => (
  <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
    <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-r from-[#7B1FA2] to-[#8E24AA]">
      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/20 text-white text-xs font-bold">
        {index}
      </span>
      <h3 className="!text-white text-sm font-semibold tracking-wide">{titulo}</h3>
    </div>
    <div className="p-4 sm:p-5">{children}</div>
  </div>
);

const FichaPsicologiaFormBody = ({ valores, setValores, readOnly = false }) => {
  const v = valores || {};

  const setCampo = (col, value) => setValores((prev) => ({ ...prev, [col]: value }));

  const BotonEscala = ({ col, value, activo }) => (
    <button
      type="button"
      disabled={readOnly}
      onClick={() => !readOnly && setCampo(col, activo ? '' : value)}
      title={ESCALA.find((e) => e.value === value)?.label}
      className={`h-9 w-10 rounded-lg text-xs font-bold border transition-all ${
        activo
          ? ESCALA_SEL[value]
          : 'bg-white text-gray-400 border-gray-200 hover:border-[#7B1FA2]/40 hover:text-gray-600'
      } ${readOnly && !activo ? 'opacity-30' : ''} ${readOnly ? 'cursor-default' : ''}`}
    >
      {value}
    </button>
  );

  const inputCls =
    'w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/25 focus:border-[#7B1FA2]/40 transition';

  // normaliza el valor guardado (number 0..3) para comparar con el botón
  const valorActual = (col) => {
    const raw = v[col];
    return raw === '' || raw === null || raw === undefined ? '' : Number(raw);
  };

  return (
    <div className="space-y-5">
      {/* Leyenda de la escala */}
      <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
        <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
          Escala de valoración
        </span>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-x-6">
          {ESCALA.map((e) => (
            <span key={e.value} className="inline-flex items-center gap-2 text-xs text-gray-600">
              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-[11px] font-bold flex-shrink-0 ${ESCALA_SEL[e.value]}`}>
                {e.corto}
              </span>
              {e.label}
            </span>
          ))}
        </div>
      </div>

      {/* Secciones con escala (formato tabular del cuestionario) */}
      {SECCIONES_ESCALA.map((seccion, i) => (
        <SectionCard key={seccion.id} index={i + 1} titulo={seccion.titulo}>
          {/* Encabezado de columnas (solo escritorio) */}
          <div className={`hidden ${GRID} px-1 pb-2 mb-1 border-b border-gray-100`}>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Reactivo</span>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">0&nbsp;·&nbsp;1&nbsp;·&nbsp;2&nbsp;·&nbsp;3</span>
          </div>

          <div className="divide-y divide-gray-100">
            {seccion.items.map((item, idx) => {
              const valor = valorActual(item.col);
              return (
                <div key={item.col} className={`py-3 first:pt-1 ${GRID}`}>
                  <p className="text-sm text-gray-700 leading-snug flex gap-2">
                    <span className="text-gray-300 font-semibold tabular-nums select-none">{idx + 1}.</span>
                    <span>{item.texto}</span>
                  </p>
                  <div className="flex gap-1.5 mt-2.5 sm:mt-0 sm:justify-center">
                    {ESCALA.map((e) => (
                      <BotonEscala key={e.value} col={item.col} value={e.value} activo={valor === e.value} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      ))}

      {/* Comentarios */}
      <SectionCard index={SECCIONES_ESCALA.length + 1} titulo="Comentarios">
        <textarea
          rows={4}
          value={v[COL_COMENTARIOS] || ''}
          onChange={(e) => setCampo(COL_COMENTARIOS, e.target.value)}
          readOnly={readOnly}
          placeholder={readOnly ? '' : 'Observaciones adicionales de la docente…'}
          className={inputCls}
        />
      </SectionCard>
    </div>
  );
};

export default FichaPsicologiaFormBody;
