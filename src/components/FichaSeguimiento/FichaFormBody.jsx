import React from 'react';
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
// Diseño tabular fiel al formato oficial (.docx): Conducta | L | EP | N | Observaciones.

const GRID = 'sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4';

// Colores del estado seleccionado por valor de escala (alto contraste, blanco sobre color)
const ESCALA_SEL = {
  L: 'bg-[#A3C644] text-white border-[#A3C644] shadow-sm',
  EP: 'bg-amber-400 text-white border-amber-400 shadow-sm',
  N: 'bg-slate-400 text-white border-slate-400 shadow-sm',
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

const FichaFormBody = ({ valores, setValores, readOnly = false }) => {
  const v = valores || {};

  const setCampo = (col, value) => setValores((prev) => ({ ...prev, [col]: value }));
  const toggleBool = (col) => setValores((prev) => ({ ...prev, [col]: !prev[col] }));

  const BotonEscala = ({ col, value, activo }) => (
    <button
      type="button"
      disabled={readOnly}
      onClick={() => !readOnly && setCampo(col, activo ? '' : value)}
      title={ESCALA.find((e) => e.value === value)?.full}
      className={`h-9 w-11 rounded-lg text-xs font-bold border transition-all ${
        activo
          ? ESCALA_SEL[value]
          : 'bg-white text-gray-400 border-gray-200 hover:border-[#7B1FA2]/40 hover:text-gray-600'
      } ${readOnly && !activo ? 'opacity-30' : ''} ${readOnly ? 'cursor-default' : ''}`}
    >
      {value}
    </button>
  );

  const OpcionCheck = ({ col, label }) => {
    const activo = !!v[col];
    return (
      <button
        type="button"
        disabled={readOnly}
        onClick={() => !readOnly && toggleBool(col)}
        className={`w-full flex items-start gap-3 text-left px-3.5 py-2.5 rounded-xl border transition-all ${
          activo
            ? 'bg-[#7B1FA2]/5 border-[#7B1FA2]/50'
            : 'bg-white border-gray-200 hover:border-gray-300'
        } ${readOnly ? 'cursor-default' : ''}`}
      >
        <span
          className={`mt-0.5 w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-colors ${
            activo ? 'bg-[#7B1FA2] border-[#7B1FA2]' : 'border-gray-300 bg-white'
          }`}
        >
          {activo && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.3 3.3 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
            </svg>
          )}
        </span>
        <span className={`text-sm leading-snug ${activo ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{label}</span>
      </button>
    );
  };

  const inputCls =
    'w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/25 focus:border-[#7B1FA2]/40 transition';

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
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Conducta observada</span>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">L&nbsp;·&nbsp;EP&nbsp;·&nbsp;N</span>
          </div>

          <div className="divide-y divide-gray-100">
            {seccion.items.map((item, idx) => {
              const valor = v[item.col] || '';
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

      {/* Registro de lenguaje espontáneo */}
      <SectionCard index={SECCIONES_ESCALA.length + 1} titulo="Registro de Lenguaje Espontáneo">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Palabras que utiliza espontáneamente en el colegio
            </label>
            <textarea
              rows={2}
              value={v[COL_PALABRAS_ESPONTANEAS] || ''}
              onChange={(e) => setCampo(COL_PALABRAS_ESPONTANEAS, e.target.value)}
              readOnly={readOnly}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Frases o aproximaciones verbales que ha escuchado la docente
            </label>
            <textarea
              rows={2}
              value={v[COL_FRASES_ESCUCHADAS] || ''}
              onChange={(e) => setCampo(COL_FRASES_ESCUCHADAS, e.target.value)}
              readOnly={readOnly}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">
              ¿Para qué utiliza principalmente el lenguaje?
            </label>
            <div className="grid sm:grid-cols-2 gap-2">
              {PARA_QUE_USA.map((op) => (
                <OpcionCheck key={op.col} col={op.col} label={op.label} />
              ))}
            </div>
            <input
              type="text"
              value={v[COL_USA_OTRO] || ''}
              onChange={(e) => setCampo(COL_USA_OTRO, e.target.value)}
              readOnly={readOnly}
              placeholder="Otro (especifique)"
              className={`mt-2 ${inputCls}`}
            />
          </div>
        </div>
      </SectionCard>

      {/* Interacción con compañeros */}
      <SectionCard index={SECCIONES_ESCALA.length + 2} titulo="Interacción con Compañeros">
        <label className="block text-xs font-semibold text-gray-500 mb-2">
          Durante el juego libre, generalmente:
        </label>
        <div className="space-y-2">
          {JUEGO_LIBRE.map((op) => (
            <OpcionCheck key={op.col} col={op.col} label={op.label} />
          ))}
        </div>
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ejemplo observado</label>
          <textarea
            rows={2}
            value={v[COL_JL_EJEMPLO] || ''}
            onChange={(e) => setCampo(COL_JL_EJEMPLO, e.target.value)}
            readOnly={readOnly}
            className={inputCls}
          />
        </div>
      </SectionCard>

      {/* Estrategias que mejor funcionan */}
      <SectionCard index={SECCIONES_ESCALA.length + 3} titulo="Estrategias que Mejor Funcionan">
        <label className="block text-xs font-semibold text-gray-500 mb-2">
          Marque las estrategias con las que observa una mejor respuesta:
        </label>
        <div className="grid sm:grid-cols-2 gap-2">
          {ESTRATEGIAS.map((op) => (
            <OpcionCheck key={op.col} col={op.col} label={op.label} />
          ))}
        </div>
        <input
          type="text"
          value={v[COL_EST_OTRO] || ''}
          onChange={(e) => setCampo(COL_EST_OTRO, e.target.value)}
          readOnly={readOnly}
          placeholder="Otro (especifique)"
          className={`mt-2 ${inputCls}`}
        />
      </SectionCard>
    </div>
  );
};

export default FichaFormBody;
