import React from 'react';
import { Check } from 'lucide-react';
import {
  ESCALA,
  SECCIONES_ESCALA,
  PARA_QUE_USA,
  JUEGO_LIBRE,
  ESTRATEGIAS,
  COL_PALABRAS_ESPONTANEAS,
  COL_FRASES_ESCUCHADAS,
  COL_JL_EJEMPLO,
  COL_USA_OTRO,
  COL_EST_OTRO,
} from '../../constants/fichaSeguimientoEscolar';

// Cuerpo del formulario de la Ficha de Seguimiento Escolar.
// `valores` es un objeto plano: una clave por columna de la BD (nada de JSON anidado).
// Diseño tabular fiel al formato oficial (.docx): Conducta | L | EP | N.
// Modo `readOnly`: muestra solo lo que respondió la docente (sin controles deshabilitados).

const GRID = 'sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4';

// Estilo del valor de escala seleccionado
const ESCALA_SEL = {
  L: 'bg-[#A3C644] text-white border-[#A3C644] shadow-sm shadow-[#A3C644]/30',
  EP: 'bg-amber-400 text-white border-amber-400 shadow-sm shadow-amber-400/30',
  N: 'bg-slate-400 text-white border-slate-400 shadow-sm shadow-slate-400/30',
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

const Viñeta = ({ children }) => (
  <span className="inline-flex items-start gap-2 text-sm text-gray-700 leading-snug">
    <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#7B1FA2] flex-shrink-0" />
    <span>{children}</span>
  </span>
);

const SinRespuesta = () => <p className="text-sm text-gray-400 italic">Sin respuesta</p>;

const BotonEscala = ({ value, activo, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={ESCALA.find((e) => e.value === value)?.full}
    className={`h-9 w-11 rounded-xl text-xs font-bold border transition-all ${
      activo
        ? ESCALA_SEL[value]
        : 'bg-white text-gray-400 border-gray-200 hover:border-[#7B1FA2]/40 hover:text-gray-600'
    }`}
  >
    {value}
  </button>
);

const OpcionCheck = ({ activo, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-start gap-3 text-left px-3.5 py-2.5 rounded-xl border transition-all ${
      activo
        ? 'bg-[#7B1FA2]/5 border-[#7B1FA2]/50'
        : 'bg-white border-gray-200 hover:border-purple-200'
    }`}
  >
    <span
      className={`mt-0.5 w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-colors ${
        activo ? 'bg-[#7B1FA2] border-[#7B1FA2]' : 'border-gray-300 bg-white'
      }`}
    >
      {activo && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
    </span>
    <span className={`text-sm leading-snug ${activo ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{label}</span>
  </button>
);

// Campo de texto largo: textarea al editar, bloque de lectura al ver
const CampoTexto = ({ label, value, onChange, readOnly }) => (
  <div>
    <label className={LABEL}>{label}</label>
    {readOnly ? (
      <div className="bg-gray-50/70 border border-gray-100 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[2.5rem]">
        {value ? value : <span className="text-gray-400 italic">Sin respuesta</span>}
      </div>
    ) : (
      <textarea rows={2} value={value || ''} onChange={(e) => onChange(e.target.value)} className={INPUT} />
    )}
  </div>
);

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────
const FichaFormBody = ({ valores, setValores, readOnly = false }) => {
  const v = valores || {};

  const setCampo = (col, value) => setValores((prev) => ({ ...prev, [col]: value }));
  const toggleBool = (col) => setValores((prev) => ({ ...prev, [col]: !prev[col] }));

  // Lista de opciones marcables (+ campo "Otro")
  const renderOpciones = (opciones, colOtro, layout = 'grid sm:grid-cols-2 gap-2') => {
    if (readOnly) {
      const marcadas = opciones.filter((op) => v[op.col]);
      const otro = v[colOtro];
      if (!marcadas.length && !otro) return <SinRespuesta />;
      return (
        <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          {marcadas.map((op) => <Viñeta key={op.col}>{op.label}</Viñeta>)}
          {otro && <Viñeta>Otro: {otro}</Viñeta>}
        </div>
      );
    }
    return (
      <>
        <div className={layout}>
          {opciones.map((op) => (
            <OpcionCheck key={op.col} activo={!!v[op.col]} label={op.label} onClick={() => toggleBool(op.col)} />
          ))}
        </div>
        {colOtro && (
          <input
            type="text"
            value={v[colOtro] || ''}
            onChange={(e) => setCampo(colOtro, e.target.value)}
            placeholder="Otro (especifique)"
            className={`mt-2 ${INPUT}`}
          />
        )}
      </>
    );
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
                {e.label}
              </span>
              {e.full}
            </span>
          ))}
        </div>
      </div>

      {/* Secciones con escala (formato tabular del Word) */}
      {SECCIONES_ESCALA.map((seccion, i) => (
        <SectionCard key={seccion.id} index={i + 1} titulo={seccion.titulo}>
          {/* Encabezado de columnas (solo escritorio) */}
          <div className={`hidden ${GRID} px-1 pb-2 mb-1 border-b border-gray-100`}>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Conducta observada</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center">
              {readOnly ? 'Valoración' : 'L\u00A0·\u00A0EP\u00A0·\u00A0N'}
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {seccion.items.map((item, idx) => {
              const valor = v[item.col] || '';
              const escalaSel = ESCALA.find((e) => e.value === valor);
              return (
                <div key={item.col} className={`py-3 first:pt-1 ${GRID}`}>
                  <p className="text-sm text-gray-700 leading-snug flex gap-2">
                    <span className="text-gray-300 font-semibold tabular-nums select-none">{idx + 1}.</span>
                    <span>{item.texto}</span>
                  </p>

                  <div className="flex gap-1.5 mt-2.5 sm:mt-0 sm:justify-center">
                    {readOnly ? (
                      escalaSel ? (
                        <span className={`inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full text-xs font-semibold border ${ESCALA_SEL[valor]}`}>
                          <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-[11px] font-bold">
                            {escalaSel.label}
                          </span>
                          {escalaSel.full}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300 px-3">—</span>
                      )
                    ) : (
                      ESCALA.map((e) => (
                        <BotonEscala
                          key={e.value}
                          value={e.value}
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

      {/* Registro de lenguaje espontáneo */}
      <SectionCard index={SECCIONES_ESCALA.length + 1} titulo="Registro de Lenguaje Espontáneo">
        <div className="space-y-4">
          <CampoTexto
            label="Palabras que utiliza espontáneamente en el colegio"
            value={v[COL_PALABRAS_ESPONTANEAS]}
            onChange={(val) => setCampo(COL_PALABRAS_ESPONTANEAS, val)}
            readOnly={readOnly}
          />
          <CampoTexto
            label="Frases o aproximaciones verbales que ha escuchado la docente"
            value={v[COL_FRASES_ESCUCHADAS]}
            onChange={(val) => setCampo(COL_FRASES_ESCUCHADAS, val)}
            readOnly={readOnly}
          />
          <div>
            <label className={LABEL}>¿Para qué utiliza principalmente el lenguaje?</label>
            {renderOpciones(PARA_QUE_USA, COL_USA_OTRO)}
          </div>
        </div>
      </SectionCard>

      {/* Interacción con compañeros */}
      <SectionCard index={SECCIONES_ESCALA.length + 2} titulo="Interacción con Compañeros">
        <div className="space-y-4">
          <div>
            <label className={LABEL}>Durante el juego libre, generalmente:</label>
            {renderOpciones(JUEGO_LIBRE, null, 'space-y-2')}
          </div>
          <CampoTexto
            label="Ejemplo observado"
            value={v[COL_JL_EJEMPLO]}
            onChange={(val) => setCampo(COL_JL_EJEMPLO, val)}
            readOnly={readOnly}
          />
        </div>
      </SectionCard>

      {/* Estrategias que mejor funcionan */}
      <SectionCard index={SECCIONES_ESCALA.length + 3} titulo="Estrategias que Mejor Funcionan">
        <label className={LABEL}>Marque las estrategias con las que observa una mejor respuesta:</label>
        {renderOpciones(ESTRATEGIAS, COL_EST_OTRO)}
      </SectionCard>
    </div>
  );
};

export default FichaFormBody;