// Estructura de la Ficha de Seguimiento Escolar – Psicología (Cuestionario para Maestros de Conners).
// Réplica del formato oficial (Sattler, Evaluación Infantil). Cada reactivo corresponde a UNA
// columna en la tabla `ficha_seguimiento_psicologia` del backend (nada de JSON): el `col` de
// cada ítem es el nombre exacto de la columna. La usan el formulario público
// (src/pages/FichaSeguimientoPsicologia.jsx) y la vista de lectura (SeguimientoPsicologiaView.jsx).

// Escala de valoración Conners (columna TINYINT 0..3)
export const ESCALA = [
  { value: 0, label: 'Nunca', corto: '0' },
  { value: 1, label: 'Sólo un poco', corto: '1' },
  { value: 2, label: 'Bastante', corto: '2' },
  { value: 3, label: 'Mucho', corto: '3' },
];

// Secciones con reactivos valorados por la escala Conners
export const SECCIONES_ESCALA = [
  {
    id: 'salon_clases',
    titulo: 'Conducta en el salón de clases',
    items: [
      { col: 'sc1', texto: 'Presenta nerviosismo constante.' },
      { col: 'sc2', texto: 'Gruñe y hace otros ruidos extraños.' },
      { col: 'sc3', texto: 'Sus demandas se deben satisfacer de manera inmediata, se frustra con facilidad.' },
      { col: 'sc4', texto: 'Coordinación deficiente.' },
      { col: 'sc5', texto: 'Inquieto o demasiado activo.' },
      { col: 'sc6', texto: 'Excitable, impulsivo.' },
      { col: 'sc7', texto: 'No presta atención, se distrae con facilidad.' },
      { col: 'sc8', texto: 'No termina las cosas que empieza (períodos cortos de atención).' },
      { col: 'sc9', texto: 'Demasiado sensible.' },
      { col: 'sc10', texto: 'Demasiado serio o triste.' },
      { col: 'sc11', texto: 'Soñador.' },
      { col: 'sc12', texto: 'Hosco o malhumorado.' },
      { col: 'sc13', texto: 'Llora con frecuencia y fácilmente.' },
      { col: 'sc14', texto: 'Molesta a otros niños.' },
      { col: 'sc15', texto: 'Es pendenciero (propenso a buscar riñas).' },
      { col: 'sc16', texto: 'Su estado de ánimo cambia de manera rápida y drástica.' },
      { col: 'sc17', texto: 'Es respondón.' },
      { col: 'sc18', texto: 'Es destructivo.' },
      { col: 'sc19', texto: 'Roba.' },
      { col: 'sc20', texto: 'Miente.' },
      { col: 'sc21', texto: 'Hace berrinches, tiene conducta explosiva o difícil de predecir.' },
    ],
  },
  {
    id: 'participacion_grupo',
    titulo: 'Participación en grupo',
    items: [
      { col: 'pg1', texto: 'Se aísla de otros niños.' },
      { col: 'pg2', texto: 'Parece que el grupo no lo acepta.' },
      { col: 'pg3', texto: 'Parece que lo dominan con facilidad.' },
      { col: 'pg4', texto: 'No tiene sentido de juego limpio.' },
      { col: 'pg5', texto: 'Parece carecer de liderazgo.' },
      { col: 'pg6', texto: 'No se lleva bien con personas del sexo opuesto.' },
      { col: 'pg7', texto: 'No se lleva bien con personas del mismo sexo.' },
      { col: 'pg8', texto: 'Fastidia a otros niños o interfiere con sus actividades.' },
    ],
  },
  {
    id: 'actitud_autoridad',
    titulo: 'Actitud hacia la autoridad',
    items: [
      { col: 'aa1', texto: 'Sumiso.' },
      { col: 'aa2', texto: 'Desafiante.' },
      { col: 'aa3', texto: 'Descarado.' },
      { col: 'aa4', texto: 'Tímido.' },
      { col: 'aa5', texto: 'Temeroso.' },
      { col: 'aa6', texto: 'Demanda de manera excesiva la atención del maestro.' },
      { col: 'aa7', texto: 'Es terco.' },
      { col: 'aa8', texto: 'Demasiado ansioso de complacer.' },
      { col: 'aa9', texto: 'Poco cooperador.' },
      { col: 'aa10', texto: 'Tiene problemas de asistencia.' },
    ],
  },
];

// Campo de texto libre
export const COL_COMENTARIOS = 'comentarios';

// Estado inicial: un valor por columna (escala '' , comentarios '')
export const valoresVacios = () => {
  const v = {};
  SECCIONES_ESCALA.forEach((s) =>
    s.items.forEach((it) => {
      v[it.col] = '';
    }),
  );
  v[COL_COMENTARIOS] = '';
  return v;
};
