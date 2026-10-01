// Estructura de la Ficha de Seguimiento Escolar – Terapia de Lenguaje.
// Réplica del formato oficial (.docx). Cada pregunta corresponde a UNA columna en la
// tabla `ficha_seguimiento_escolar` del backend (nada de JSON): el `col` de cada ítem/opción
// es el nombre exacto de la columna. La usan el formulario público
// (src/pages/FichaSeguimientoEscolar.jsx) y la vista de lectura (SeguimientoEscolarView.jsx).

// Escala de valoración por ítem (columna ENUM 'L' | 'EP' | 'N')
export const ESCALA = [
  { value: 'L', label: 'L', full: 'Lo realiza' },
  { value: 'EP', label: 'EP', full: 'Lo realiza con apoyo' },
  { value: 'N', label: 'N', full: 'Aún no se observa' },
];

// Nombre de la columna de observación asociada a un ítem de escala
export const obsCol = (col) => `${col}_obs`;

// Secciones con ítems valorados por escala. Cada ítem: columna `col` (ENUM) + `col`_obs (texto)
export const SECCIONES_ESCALA = [
  {
    id: 'comunicacion_funcional',
    titulo: 'Comunicación Funcional',
    items: [
      { col: 'cf1', texto: 'Utiliza palabras o aproximaciones verbales para pedir algo que desea.' },
      { col: 'cf2', texto: 'Utiliza "dame" o una aproximación verbal para realizar solicitudes.' },
      { col: 'cf3', texto: 'Responde "sí" cuando desea o acepta algo.' },
      { col: 'cf4', texto: 'Expresa rechazo mediante palabra, gesto o una respuesta comunicativa comprensible.' },
      { col: 'cf5', texto: 'Busca al adulto para comunicar una necesidad o solicitar ayuda.' },
      { col: 'cf6', texto: 'Inicia espontáneamente alguna interacción con la docente o compañeros.' },
    ],
  },
  {
    id: 'comprension_lenguaje',
    titulo: 'Comprensión del Lenguaje',
    items: [
      { col: 'cl1', texto: 'Responde adecuadamente a "¿Quieres?".' },
      { col: 'cl2', texto: 'Comprende "¿Cuál quieres?" cuando se le presentan alternativas.' },
      { col: 'cl3', texto: 'Comprende indicaciones sencillas como dame, toma, saca, mete, guarda, abre, cierra, ven o siéntate.' },
      { col: 'cl4', texto: 'Puede ejecutar una indicación verbal sin necesitar que el adulto le muestre inmediatamente qué hacer.' },
      { col: 'cl5', texto: 'Responde mejor cuando la indicación es breve y concreta.' },
    ],
  },
  {
    id: 'vocabulario_expresivo',
    titulo: 'Vocabulario y Lenguaje Expresivo',
    items: [
      { col: 've1', texto: 'Utiliza espontáneamente palabras aprendidas previamente.' },
      { col: 've2', texto: 'Nombra o intenta nombrar objetos de uso frecuente del aula.' },
      { col: 've3', texto: 'Utiliza palabras relacionadas con alimentos, frutas, juguetes o materiales escolares.' },
      { col: 've4', texto: 'Imita palabras nuevas cuando aparecen dentro de actividades significativas.' },
      { col: 've5', texto: 'Combina dos palabras o realiza aproximaciones de frases sencillas.' },
    ],
  },
  {
    id: 'interaccion_social',
    titulo: 'Interacción y Comunicación Social',
    items: [
      { col: 'is1', texto: 'Comparte momentos de juego con un adulto.' },
      { col: 'is2', texto: 'Acepta progresivamente la participación de otro niño en una actividad.' },
      { col: 'is3', texto: 'Alterna la mirada entre un objeto de interés y otra persona durante una interacción.' },
      { col: 'is4', texto: 'Participa en actividades sencillas por turnos.' },
      { col: 'is5', texto: 'Comprende expresiones como "mi turno" / "tu turno".' },
      { col: 'is6', texto: 'Entrega o comparte un material cuando corresponde el turno de otra persona.' },
    ],
  },
  {
    id: 'juego_imitacion',
    titulo: 'Juego e Imitación',
    items: [
      { col: 'ji1', texto: 'Imita acciones realizadas por la docente.' },
      { col: 'ji2', texto: 'Imita acciones realizadas por otros niños.' },
      { col: 'ji3', texto: 'Utiliza los juguetes de acuerdo con su función.' },
      { col: 'ji4', texto: 'Realiza acciones sencillas de juego simbólico (dar de comer, hacer dormir, servir, etc.).' },
      { col: 'ji5', texto: 'Acepta pequeñas variaciones propuestas por el adulto dentro del juego.' },
    ],
  },
];

// Columnas de texto libre
export const COL_PALABRAS_ESPONTANEAS = 'palabras_espontaneas';
export const COL_FRASES_ESCUCHADAS = 'frases_escuchadas';
export const COL_JL_EJEMPLO = 'jl_ejemplo';
export const COL_USA_OTRO = 'usa_otro';
export const COL_EST_OTRO = 'est_otro';

// "¿Para qué utiliza principalmente el lenguaje?" — cada opción es una columna booleana
export const PARA_QUE_USA = [
  { col: 'usa_pedir_objetos', label: 'Pedir objetos' },
  { col: 'usa_pedir_ayuda', label: 'Pedir ayuda' },
  { col: 'usa_rechazar', label: 'Rechazar' },
  { col: 'usa_elegir', label: 'Elegir' },
  { col: 'usa_llamar_persona', label: 'Llamar a una persona' },
  { col: 'usa_responder_preguntas', label: 'Responder preguntas' },
  { col: 'usa_comentar_espontaneo', label: 'Comentar algo espontáneamente' },
];

// "Durante el juego libre, generalmente…" — cada opción es una columna booleana
export const JUEGO_LIBRE = [
  { col: 'jl_juega_solo', label: 'Juega principalmente solo.' },
  { col: 'jl_cerca_otros', label: 'Permanece cerca de otros niños, pero realiza su propia actividad.' },
  { col: 'jl_observa_imita', label: 'Observa o imita el juego de otros niños.' },
  { col: 'jl_permite_otros', label: 'Permite que otros niños participen en su juego.' },
  { col: 'jl_busca_otros', label: 'Busca espontáneamente a otros niños para jugar.' },
  { col: 'jl_juegos_turnos', label: 'Participa en juegos sencillos por turnos.' },
];

// "Estrategias que mejor funcionan" — cada opción es una columna booleana
export const ESTRATEGIAS = [
  { col: 'est_pausa_expectante', label: 'Darle algunos segundos para responder (pausa expectante).' },
  { col: 'est_frases_breves', label: 'Utilizar frases breves y concretas.' },
  { col: 'est_una_indicacion', label: 'Dar una indicación a la vez.' },
  { col: 'est_mostrar_visual', label: 'Mostrarle visualmente lo que debe realizar.' },
  { col: 'est_modelar_palabra', label: 'Modelar una palabra o frase sin exigir repetición.' },
  { col: 'est_materiales_interes', label: 'Utilizar materiales de su interés.' },
  { col: 'est_dos_alternativas', label: 'Ofrecer dos alternativas para facilitar una elección.' },
  { col: 'est_incorporarse_juego', label: 'Incorporarse primero a su juego antes de proponer un cambio.' },
  { col: 'est_canciones_movimiento', label: 'Utilizar canciones o actividades con movimiento.' },
];

// Estado inicial: un valor por columna (escala '' , observación '' , booleanos false, textos '')
export const valoresVacios = () => {
  const v = {};
  SECCIONES_ESCALA.forEach((s) =>
    s.items.forEach((it) => {
      v[it.col] = '';
      v[obsCol(it.col)] = '';
    }),
  );
  [...PARA_QUE_USA, ...JUEGO_LIBRE, ...ESTRATEGIAS].forEach((o) => {
    v[o.col] = false;
  });
  v[COL_PALABRAS_ESPONTANEAS] = '';
  v[COL_FRASES_ESCUCHADAS] = '';
  v[COL_JL_EJEMPLO] = '';
  v[COL_USA_OTRO] = '';
  v[COL_EST_OTRO] = '';
  return v;
};
