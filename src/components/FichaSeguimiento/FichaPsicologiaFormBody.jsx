import React from 'react';
import { ESCALA, SECCIONES_ESCALA, COL_COMENTARIOS } from '../../constants/fichaSeguimientoPsicologia';

// Cuerpo del formulario de la Ficha de Seguimiento Psicológico (Cuestionario para Maestros de Conners).
// `valores` es un objeto plano: una clave por columna de la BD (nada de JSON anidado).
// Cada reactivo se valora con la escala Nunca(0) · Sólo un poco(1) · Bastante(2) · Mucho(3).
// Modo `readOnly`: muestra solo lo que respondió la docente (sin controles deshabilitados).

const GRID = 'sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4';

// Color del valor seleccionado según intensidad (0 claro → 3 intenso)
const ESCALA_SEL = {
  0: 'bg-[#A3C644] text-white border-[#A3C644] shadow-sm shadow-[#A3C644]/30',
  1: 'bg-amber-400 text-white border-amber-400 shadow-sm shadow-amber-400/30',
  2: 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/30',
  3: 'bg-red-500 text-white border-red-500 shadow-sm shadow-red-500/30',
};

const LABEL = 'block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider';
const INPUT =
  'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 bg-white focus:outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-[#7B1FA2]/15 transition-shadow';

// ─────────────────────────────────────────────
// Piezas de UI
// ─────────────────────────────────────────────
const SectionCard = ({ index, titulo, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
    <div
      className="flex items-center gap-3 px-5 py-3 border-b border-purple-100/60"
      style={{ backgroundImage: 'radial-gradient(70% 140% at 100% 0%, rgba(123,31,162,.07) 0%, rgba(123,31,162,0) 60%), linear-gradient(120deg, #ffffff 0%, #fdfbff 60%, #faf6fe 100%)' }}
    >
      <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-purple-500/20 flex-shrink-0">
        {index}
      </span>
      <h3 className="!text-[#2D0A4E] text-sm font-extrabold leading-tight">{titulo}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const BotonEscala = ({ value, label, activo, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    className={`h-9 w-10 rounded-xl text-xs font-bold border transition-all ${
      activo
        ? ESCALA_SEL[value]
        : 'bg-white text-gray-400 border-gray-200 hover:border-[#7B1FA2]/40 hover:text-gray-600'
    }`}
  >
    {value}
  </button>
);

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────
const FichaPsicologiaFormBody = ({ valores, setValores, readOnly = false }) => {
  const v = valores || {};

  const setCampo = (col, value) => setValores((prev) => ({ ...prev, [col]: value }));

  // normaliza el valor guardado (number 0..3) para comparar con el botón
  const valorActual = (col) => {
    const raw = v[col];
    return raw === '' || raw === null || raw === undefined ? '' : Number(raw);
  };

  return (
    <div className="space-y-5">
      {/* Leyenda de la escala */}
      <div className="rounded-2xl bg-gray-50/70 border border-gray-100 px-5 py-4">
        <span className={`${LABEL} !mb-2.5`}>Escala de valoración</span>
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
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Reactivo</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center">
              {readOnly ? 'Valoración' : '0\u00A0·\u00A01\u00A0·\u00A02\u00A0·\u00A03'}
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {seccion.items.map((item, idx) => {
              const valor = valorActual(item.col);
              const escalaSel = valor === '' ? null : ESCALA.find((e) => e.value === valor);
              return (
                <div key={item.col} className={`py-3 first:pt-1 ${GRID}`}>
                  <p className="text-sm text-gray-700 leading-snug flex gap-2">
                    <span className="text-gray-300 font-semibold tabular-nums select-none">{idx + 1}.</span>
                    <span>{item.texto}</span>
                  </p>

                  <div className="flex gap-1.5 mt-2.5 sm:mt-0 sm:justify-center">
                    {readOnly ? (
                      escalaSel ? (
                        <span className={`inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full text-xs font-semibold border ${ESCALA_SEL[escalaSel.value]}`}>
                          <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-[11px] font-bold">
                            {escalaSel.value}
                          </span>
                          {escalaSel.label}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300 px-3">—</span>
                      )
                    ) : (
                      ESCALA.map((e) => (
                        <BotonEscala
                          key={e.value}
                          value={e.value}
                          label={e.label}
                          activo={valor === e.value}
                          onClick={() => setCampo(item.col, valor === e.value ? '' : e.value)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      ))}

      {/* Comentarios */}
      <SectionCard index={SECCIONES_ESCALA.length + 1} titulo="Comentarios">
        {readOnly ? (
          <div className="bg-gray-50/70 border border-gray-100 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[2.5rem]">
            {v[COL_COMENTARIOS] ? v[COL_COMENTARIOS] : <span className="text-gray-400 italic">Sin comentarios</span>}
          </div>
        ) : (
          <textarea
            rows={4}
            value={v[COL_COMENTARIOS] || ''}
            onChange={(e) => setCampo(COL_COMENTARIOS, e.target.value)}
            placeholder="Observaciones adicionales de la docente…"
            className={INPUT}
          />
        )}
      </SectionCard>
    </div>
  );
};

export default FichaPsicologiaFormBody;