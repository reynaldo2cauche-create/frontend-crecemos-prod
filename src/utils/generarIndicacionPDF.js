/**
 * generarIndicacionPDF.js
 */

import { jsPDF } from 'jspdf';
import logoUrl from '/logo-text-short.png';
import wmUrl   from '/videologo.png';

// ─── Layout ───────────────────────────────────────────────────────────────────
const M      = 14;
const PAGE_W = 210;
const PAGE_H = 297;
const TEXT_W = PAGE_W - M * 2;
const COL2   = PAGE_W / 2 + 2;

const PAC_L_BOX_X  = M + 30;
const PAC_R_BOX_X  = COL2 + 24;
const CITA_BOX_X   = M + 26;

// ─── Alturas y offsets ────────────────────────────────────────────────────────
const BOX_H_PAC  = 5.5;
const BOX_H_CITA = 5.0;
const tOff7      = 3.6;
const tOff6      = 3.3;
const ROW_GAP    = 2;

// ─── Colores ──────────────────────────────────────────────────────────────────
const PRIMARY   = [123, 31, 162];
const BLACK     = [30, 30, 30];
const GRAY      = [110, 110, 110];
const LIGHTGRAY = [210, 210, 210];

const FS_BODY    = 10.5;
const FS_SECTION = 11.5;

// ─── Cache imágenes ───────────────────────────────────────────────────────────
let _logoCache = null;
let _wmCache   = null;

const _loadImg = (src, getCache, setCache) =>
  new Promise((resolve) => {
    if (getCache()) return resolve(getCache());
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext('2d').drawImage(img, 0, 0);
        const val = { dataUrl: c.toDataURL('image/png'), w: img.naturalWidth, h: img.naturalHeight };
        setCache(val); resolve(val);
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });

const cargarLogo = () => _loadImg(logoUrl, () => _logoCache, v => { _logoCache = v; });
const cargarWm   = () => _loadImg(wmUrl,   () => _wmCache,   v => { _wmCache   = v; });

// ─── Utilidades ───────────────────────────────────────────────────────────────
const formatFecha = (str) => {
  if (!str) return '';
  const [y, m, d] = str.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
};

// Capitaliza la primera letra (para los campos "Otros" escritos por el usuario).
const capitalizar = (txt) => (txt ? txt.charAt(0).toUpperCase() + txt.slice(1) : txt);

// "otros" puede contener varios ítems separados por salto de línea; devuelve
// cada uno limpio y con la primera letra en mayúscula.
const parsearOtros = (valor) =>
  typeof valor === 'string'
    ? valor.split('\n').map(s => capitalizar(s.trim())).filter(Boolean)
    : [];

const drawWatermark = (doc, wm) => {
  if (!wm) return;
  const wW = Math.min(160, PAGE_W * 0.75);
  const wH = wW * (wm.h / wm.w);
  doc.saveGraphicsState();
  try { doc.setGState(new doc.GState({ opacity: 0.12 })); } catch (_) {}
  doc.addImage(wm.dataUrl, 'PNG', (PAGE_W - wW) / 2, (PAGE_H - wH) / 2, wW, wH);
  doc.restoreGraphicsState();
};

const addPage  = (doc, wm) => { doc.addPage(); drawWatermark(doc, wm); return 15; };
const checkY   = (doc, wm, y, needed = 14) => y + needed > PAGE_H - M ? addPage(doc, wm) : y;

// ─── Primitiva: label + rect alineado ────────────────────────────────────────
const field = (doc, label, value, xLabel, xBox, yRow, boxW, boxH, tOff) => {
  doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(...GRAY);
  doc.text(`${label}:`, xLabel, yRow + tOff);
  doc.setDrawColor(...GRAY).setLineWidth(0.3).rect(xBox, yRow, boxW, boxH);
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...BLACK);
  doc.text(String(value ?? ''), xBox + 2, yRow + tOff, { maxWidth: boxW - 4 });
};

// ─── Header ───────────────────────────────────────────────────────────────────
const drawHeader = (doc, logo, wm, fecha, hora, especialidad) => {
  drawWatermark(doc, wm);
  if (logo) {
    const lH = 12, lW = lH * (logo.w / logo.h);
    doc.addImage(logo.dataUrl, 'PNG', M, 9, lW, lH);
  }
  doc.setFont('helvetica', 'bold').setFontSize(16).setTextColor(...BLACK);
  doc.text('INDICACIÓN TERAPÉUTICA', PAGE_W / 2, 17, { align: 'center' });

  doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(...PRIMARY);
  doc.text(especialidad || '', PAGE_W / 2, 23, { align: 'center' });

  const lX = PAGE_W - 52, bX = PAGE_W - 38, bW = 24, bH = 6, tO = 4;
  let yP = 8;
  doc.setFont('helvetica', 'bold').setFontSize(8.5).setTextColor(...GRAY);
  doc.text('Fecha:', lX, yP + tO);
  doc.setDrawColor(...GRAY).setLineWidth(0.3).rect(bX, yP, bW, bH);
  doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...BLACK);
  doc.text(fecha, bX + 1.5, yP + tO);
  yP += bH + 1;
  doc.setFont('helvetica', 'bold').setFontSize(8.5).setTextColor(...GRAY);
  doc.text('Hora:', lX, yP + tO);
  doc.setDrawColor(...GRAY).setLineWidth(0.3).rect(bX, yP, bW, bH);
  doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...BLACK);
  doc.text(hora, bX + 1.5, yP + tO);
  return 28;
};

const calcularEdad = (fn) => {
  if (!fn) return '';
  try {
    const hoy = new Date(), nac = new Date(fn);
    let e = hoy.getFullYear() - nac.getFullYear();
    const mes = hoy.getMonth() - nac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) e--;
    return `${e} años`;
  } catch { return ''; }
};

// ─── Datos paciente ───────────────────────────────────────────────────────────
const drawDatosPaciente = (doc, paciente, terapeuta, especialidad, y) => {
  const nombre = `${paciente?.nombres || ''} ${paciente?.apellido_paterno || ''} ${paciente?.apellido_materno || ''}`.trim();
  const edad   = calcularEdad(paciente?.fecha_nacimiento);
  const dni    = paciente?.numero_documento || '';

  field(doc, 'Paciente', nombre,
    M, PAC_L_BOX_X, y, PAGE_W - M - PAC_L_BOX_X, BOX_H_PAC, tOff7);
  y += BOX_H_PAC + ROW_GAP;

  field(doc, 'DNI', dni,
    M, PAC_L_BOX_X, y, COL2 - PAC_L_BOX_X - 2, BOX_H_PAC, tOff7);
  field(doc, 'Edad', edad,
    COL2, PAC_R_BOX_X, y, PAGE_W - M - PAC_R_BOX_X, BOX_H_PAC, tOff7);
  y += BOX_H_PAC + ROW_GAP;

  field(doc, 'Especialidad', especialidad,
    M, PAC_L_BOX_X, y, COL2 - PAC_L_BOX_X - 2, BOX_H_PAC, tOff7);
  field(doc, 'Terapeuta', terapeuta,
    COL2, PAC_R_BOX_X, y, PAGE_W - M - PAC_R_BOX_X, BOX_H_PAC, tOff7);
  y += BOX_H_PAC + ROW_GAP;

  return y + 2;
};

// ─── Título de sección ────────────────────────────────────────────────────────
const drawSection = (doc, title, y) => {
  y += 6;
  doc.setFont('helvetica', 'bold').setFontSize(FS_SECTION).setTextColor(...PRIMARY);
  doc.text(title, M, y);
  const lineY = y + 3;
  doc.setDrawColor(...LIGHTGRAY).setLineWidth(0.4).line(M, lineY, PAGE_W - M, lineY);
  return lineY + 5;
};

// ─── Cita block ───────────────────────────────────────────────────────────────
const drawCitaBlock = (doc, cita, colX, y, colW) => {
  const boxX = colX + (CITA_BOX_X - M);
  const boxW = colW - (boxX - colX);

  const row = (lbl, val) => {
    if (!val) return y;
    field(doc, lbl, val, colX, boxX, y, boxW, BOX_H_CITA, tOff6);
    y += BOX_H_CITA + 1.2;
    return y;
  };

  if (cita.tipo?.nombre)       y = row('Tipo',        cita.tipo.nombre);
  if (cita.modalidad?.nombre)  y = row('Modalidad',   cita.modalidad.nombre);
  if (cita.cantidadCitas)      y = row('Cant. citas', String(cita.cantidadCitas));
  if (cita.frecuencia?.nombre) y = row('Frecuencia',  cita.frecuencia.nombre);

  const informes = [cita.informeFisico && 'Físico', cita.informeVerbal && 'Verbal'].filter(Boolean);
  if (informes.length > 0) y = row('Informe', informes.join(' / '));

  return y;
};

// ─── Text box (para referencias en 2 columnas) ────────────────────────────────
const drawReferenciasBox = (doc, internas, externas, y) => {
  const p = 2.0, lh = 4.5, headerH = 5;
  const grupos = [];
  if (internas.length > 0) grupos.push({ label: 'INTERNAS:', items: internas });
  if (externas.length > 0) grupos.push({ label: 'EXTERNAS:', items: externas });

  if (grupos.length === 0) return y;

  const cols   = grupos.length; // 1 o 2 columnas según cuántos grupos haya
  const colW   = (TEXT_W - p * 2) / cols;

  // Pre-calcular las líneas reales (con salto de línea) de cada ítem, para que
  // la caja crezca según el contenido y los ítems no se superpongan.
  doc.setFont('helvetica', 'normal').setFontSize(9);
  grupos.forEach(g => {
    g.lineas = g.items.map(item => doc.splitTextToSize(String(item ?? ''), colW - 6));
    g.totalLineas = g.lineas.reduce((s, l) => s + l.length, 0);
  });
  const maxLineas = Math.max(...grupos.map(g => g.totalLineas));
  const boxH   = Math.max(headerH + maxLineas * lh + p * 2 + 2, 15);

  doc.setDrawColor(...GRAY).setLineWidth(0.3).rect(M, y, TEXT_W, boxH);

  grupos.forEach((grupo, col) => {
    const xBase = M + p + col * colW;
    let yT = y + p + 3.3;

    doc.setFont('helvetica', 'bold').setFontSize(8.5).setTextColor(...BLACK);
    doc.text(grupo.label, xBase, yT);
    yT += headerH;

    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...BLACK);
    grupo.lineas.forEach(lineas => {
      doc.text('•', xBase, yT);
      lineas.forEach((ln, i) => doc.text(ln, xBase + 4, yT + i * lh));
      yT += lineas.length * lh;
    });
  });

  return y + boxH + 1.5;
};

// ─── List box (con soporte de múltiples columnas) ─────────────────────────────
const drawListBox = (doc, items, y, minH = 10, cols = 1) => {
  if (!items?.length) return y;
  const p = 2.0, lh = 4.5;

  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...BLACK);

  const colW = (TEXT_W - p * 2) / cols;

  // Una columna: soporta textos largos (multi-línea) sin superponer; la caja crece.
  if (cols === 1) {
    const lineasPorItem = items.map(item => doc.splitTextToSize(String(item ?? ''), colW - 6));
    const totalLineas = lineasPorItem.reduce((s, l) => s + l.length, 0);
    const boxH = Math.max(totalLineas * lh + p * 2 + 1, minH);
    doc.setDrawColor(...GRAY).setLineWidth(0.3).rect(M, y, TEXT_W, boxH);
    let yT = y + p + 3.3;
    lineasPorItem.forEach(lineas => {
      doc.text('•', M + p, yT);
      lineas.forEach((ln, i) => doc.text(ln, M + p + 4, yT + i * lh));
      yT += lineas.length * lh;
    });
    return y + boxH + 1.5;
  }

  // Varias columnas (ítems cortos, p. ej. materiales): grilla de filas fijas.
  const perCol = Math.ceil(items.length / cols);
  const boxH   = Math.max(perCol * lh + p * 2 + 1, minH);

  doc.setDrawColor(...GRAY).setLineWidth(0.3).rect(M, y, TEXT_W, boxH);

  items.forEach((item, idx) => {
    const col  = Math.floor(idx / perCol);
    const row  = idx % perCol;
    const xBase = M + p + col * colW;
    const yT   = y + p + 3.3 + row * lh;
    doc.text('•', xBase, yT);
    doc.text(item, xBase + 4, yT, { maxWidth: colW - 6 });
  });

  return y + boxH + 1.5;
};

// ─── Extraer referencias dinámicamente ───────────────────────────────────────
const extraerReferencias = (ref) => {
  if (!ref) return { internas: [], externas: [] };

  const internas = [
    ref.refInterTerapiaLenguaje        && 'Terapia de lenguaje',
    ref.refInterTerapiaOcupacional     && 'Terapia ocupacional',
    ref.refInterPsicologia             && 'Psicología (Conducta / aprendizaje)',
    ref.refInterPsicoterapiaInd        && 'Psicoterapia individual',
    ref.refInterTerapiaParejaFam       && 'Terapia de pareja / T.Familiar',
    ref.refInterTerapiaFisica          && 'Terapia física',
    ref.refInterTerapiaRespiratoria    && 'Terapia respiratoria',
  ].filter(Boolean);

  const externas = [
    ref.refExterNeuropediatra          && 'Neuropediatra',
    ref.refExterNeuropsicologia        && 'Neuropsicología',
    ref.refExterPsiquiatria            && 'Psiquiatría',
    ref.refExterNeurologia             && 'Neurología',
    ref.refExterGastroenterologo       && 'Gastroenterólogo',
    ref.refExterNutricion              && 'Nutrición',
    ref.refExterOtorrinolaringologia   && 'Otorrinolaringología',
    ref.refExterGeriatria              && 'Geriatría',
  ].filter(Boolean);

  // "Otros" puede contener varias referencias separadas por salto de línea.
  parsearOtros(ref.refExterOtros).forEach(item => externas.push(item));

  return { internas, externas };
};

// ─── Extraer recomendaciones dinámicamente ───────────────────────────────────
const extraerRecomendaciones = (rec) => {
  if (!rec) return [];

  const mapaRecomendaciones = {
    // Fijas
    asistirPuntualmente:               'Asistir puntualmente a todas las sesiones para garantizar el progreso continuo.',
    evitarFaltarSinAviso:              'Evitar faltar sin previo aviso; las inasistencias afectan el ritmo del tratamiento.',
    practicarEnCasa:                   'Practicar en casa los ejercicios o actividades recomendadas por el terapeuta.',
    // Lenguaje
    dedicar1520MinDiarios:             'Dedicar al menos 15-20 minutos diarios para estimular el lenguaje en casa mediante juegos.',
    evitarCorregirBruscamente:         'Evitar corregir bruscamente; usar el modelado positivo repitiendo la palabra correcta sin regañar.',
    crearAmbienteRico:                 'Crear un ambiente rico en lenguaje: leer cuentos, cantar canciones, conversar frecuentemente.',
    informarCambios:                   'Informar sobre cualquier cambio emocional, médico o escolar relevante.',
    evitarPantallasExcesivas:          'Evitar el uso excesivo de pantallas (TV, tablets, celulares).',
    // Terapia Ocupacional
    dedicar1520MinActividades:         'Dedicar al menos 15-20 minutos diarios para realizar las actividades de terapia en casa.',
    establecerRutinaEstructurada:      'Establecer una rutina diaria estructurada con horarios predecibles.',
    favorecerAutonomia:                'Favorecer la autonomía en actividades cotidianas (vestirse, comer, lavarse las manos).',
    realizarActividadesMotricidad:     'Realizar actividades como ensartar cuentas grandes, rasgar papel, enroscar tapas o jugar con plastilina.',
    // Lenguaje Adultos
    evitarCorregirseConFrustracion:    'Evitar corregirse con frustración durante el habla; intente comunicarse con calma y claridad.',
    evitarDistraccionesPractica:       'Evitar distracciones durante la práctica (TV, ruido, celular).',
    notificarCambiosSalud:             'Notificar al terapeuta sobre cambios en el estado de salud neurológico o emocional.',
    realizarEjerciciosEnsenados:       'Realizar los ejercicios enseñados por el terapeuta.',
    involucrarFamiliarCuidador:        'Involucrar a un familiar o cuidador en el proceso, si el terapeuta lo considera necesario.',
    // Terapia Deglutoria
    mantenerSentado90Grados:           'Mantener al paciente sentado a 90° durante la ingesta y al menos 20-30 minutos después de comer.',
    evitarComerAcostado:               'Evitar comer acostado o reclinado.',
    ofrecerPorcionesPequenas:          'Ofrecer porciones pequeñas.',
    verificarTragoCompleto:            'Verificar que el paciente haya terminado de tragar antes de ofrecer otro bocado.',
    permitirTiempoEntreBocados:        'Permitir tiempo suficiente entre cada bocado.',
    evitarHablarConAlimento:           'Evitar hablar mientras el paciente tenga alimento en la boca.',
    evitarApresurarAlimentacion:       'Evitar apresurar al paciente durante la alimentación.',
    dietaTipoPure:                     'Dieta tipo puré.',
    usarEspesanteLiquidos:             'Usar espesante en líquidos.',
    // Psicología
    fomentarAmbienteConfianza:         'Fomentar un ambiente de confianza y seguridad emocional en casa.',
    evitarEtiquetasNegativas:          'Evitar el uso de etiquetas negativas o críticas constantes.',
    tenerPacienciaExpectativasRealistas: 'Tener paciencia y expectativas realistas; los cambios emocionales y conductuales son graduales.',
    // Psicología Adolescentes
    evitarConfrontacionesInmediatas:   'Evitar confrontaciones inmediatas después de la terapia; darle espacio para procesar la sesión.',
    respetarEspacioTerapeutico:        'Respetar el espacio terapéutico del adolescente, evitando presionarlo a contar lo que trabaja en consulta.',
    cumplirTareasFamilia:              'Cumplir con las tareas o pautas sugeridas por el terapeuta, cuando estas involucren a la familia.',
    // Terapia de Pareja/Familiar
    ambosAsistirSesiones:              'Ambos miembros deben asistir a las sesiones, salvo que el terapeuta indique lo contrario.',
    evitarDiscutirTemasSensibles:      'Eviten discutir temas sensibles antes o después de la sesión; guárdenlos para trabajarlos en el espacio terapéutico.',
    actitudAperturaRespeto:            'Asuman una actitud de apertura y respeto mutuo, incluso durante el desacuerdo.',
    comprometerSeBuscarCulpables:      'Comprométanse con el proceso sin buscar culpables, sino soluciones conjuntas.',
    noDecisionesImpulsivas:            'No tomen decisiones importantes de manera impulsiva durante el proceso terapéutico.',
    // Psicoterapia
    serHonestoTerapeuta:               'Ser honesto consigo mismo y con el terapeuta, dentro de lo que se sienta cómodo compartir.',
    evitarJuzgarse:                    'Evitar juzgarse durante las sesiones; el espacio terapéutico es libre de críticas.',
    registrarPensamientosEmociones:    'Registrar pensamientos o emociones importantes entre sesiones, si se desea llevar un seguimiento personal.',
    informarEventosImportantes:        'Informar sobre cualquier evento importante o cambio significativo en el estado emocional o en la vida diaria.',
  };

  const activas = [];
  Object.keys(rec).forEach(key => {
    if (rec[key] === true && mapaRecomendaciones[key]) {
      activas.push(mapaRecomendaciones[key]);
    } else if (key === 'otros' && rec[key] && typeof rec[key] === 'string') {
      // "otros" puede contener varias recomendaciones separadas por salto de línea;
      // cada una se agrega como viñeta independiente.
      parsearOtros(rec[key]).forEach(item => activas.push(item));
    }
  });

  return activas;
};

// ─── Extraer materiales dinámicamente ────────────────────────────────────────
// Lista EXACTA y ordenada de materiales para Terapia de Lenguaje (Infantil,
// Adolescentes y Adultos). El orden y el texto deben figurar tal cual.
const MATERIALES_LENGUAJE = [
  ['hojasBond',             '100 hojas bond'],
  ['cartulinaDuplex',       '2 pliegos de cartulina dúplex'],
  ['velcro',                '100 unidades Velcro adhesivo'],
  ['folder',                '1 folder'],
  ['guantes',               'Guantes por sesión'],
  ['bajalengua',            'Paquete de bajalengua'],
  ['hisoposPequenos',       'Paquete de hisopos pequeños'],
  ['hisoposLargos',         'Paquete de hisopos largos'],
  ['plumonesGruesos',       'Estuche plumones gruesos'],
  ['siliconaLiquida',       '1 silicona líquida mediana'],
  ['cartulinaColores',      '1 pliego de cartulina color'],
  ['fotos',                 'Fotos'],
  ['plumonIndeleble',       '1 plumón indeleble negro'],
  ['cuadernoCuadriculado',  '1 cuaderno cuadriculado A4'],
  ['cuadernoDecroly',       '1 cuaderno decroly'],
  ['limpiatipo',            '1 limpia tipo'],
  ['cintaEmbalaje',         '1 cinta de embalaje'],
];

const esServicioLenguaje = (servicio) =>
  !!servicio?.nombre && servicio.nombre.toLowerCase().includes('lenguaje');

const extraerMateriales = (mat, servicio) => {
  if (!mat) return [];

  const activos = [];

  // Terapia de Lenguaje: lista con orden y etiquetas exactas.
  if (esServicioLenguaje(servicio)) {
    MATERIALES_LENGUAJE.forEach(([key, label]) => {
      if (mat[key] === true) activos.push(label);
    });
    if (mat.otros && typeof mat.otros === 'string') {
      parsearOtros(mat.otros).forEach(item => activos.push(item));
    }
    return activos;
  }

  // Resto de servicios: etiquetas genéricas.
  const mapaMateriales = {
    hojasBond:                      'Hojas bond (100 hojas)',
    plumones:                       'Plumones',
    lapizBorrador:                  'Lápiz y borrador',
    cartulinaDuplex:                 'Cartulina Duplex',
    siliconaLiquida:                 'Silicona Líquida',
    limpiatipo:                      'Limpiatipo',
    velcro:                          'Velcro',
    cartulinaColores:                'Cartulina de colores',
    cuaderno:                        'Cuaderno',
    folder:                          'Folder',
    fotos:                           'Fotos',
    guantesBajalenguaHisoposCrema:  'Guantes/bajalengua/hisopos/crema',
    cintaEmbalaje:                   'Cinta de embalaje',
    botellaAgua:                     'Botella con agua',
    plumonIndeleble:                 'Plumón indeleble',
    munecos:                         'Muñecos',
  };

  Object.keys(mat).forEach(key => {
    if (mat[key] === true && mapaMateriales[key]) {
      activos.push(mapaMateriales[key]);
    } else if (key === 'otros' && mat[key] && typeof mat[key] === 'string') {
      // "otros" puede contener varios materiales separados por salto de línea;
      // cada uno se agrega como ítem independiente.
      parsearOtros(mat[key]).forEach(item => activos.push(item));
    }
  });

  return activos;
};

// ─── Footer ───────────────────────────────────────────────────────────────────
const drawFooter = (doc, wm, y, user) => {
  y += 8;
  y = checkY(doc, wm, y, 50);

  doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...BLACK);
  doc.text('Información importante:', M, y);
  y += 6;

  doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...BLACK);

  const textoReeval = '• Reevaluación: Al finalizar las sesiones recomendadas, el paciente deberá realizar una reevaluación para determinar el alta terapéutica o la continuidad del tratamiento, según su evolución y la recomendación del profesional y/o médico tratante.';
  doc.splitTextToSize(textoReeval, TEXT_W).forEach(linea => {
    y = checkY(doc, wm, y);
    doc.text(linea, M, y);
    y += 4.2;
  });

  y += 2;

  const textoVigencia = '• Vigencia de la indicación terapéutica: 2 meses a partir de la fecha de emisión.';
  doc.splitTextToSize(textoVigencia, TEXT_W).forEach(linea => {
    y = checkY(doc, wm, y);
    doc.text(linea, M, y);
    y += 4;
  });

  y += 6;

  const emitidoPor = user ? `${user.nombres || ''} ${user.apellidos || ''}`.trim() : 'Sistema';
  const firmaW = 70, firmaH = 18;
  const firmaX = PAGE_W - M - firmaW;

  doc.setDrawColor(...GRAY).setLineWidth(0.3).rect(firmaX, y, firmaW, firmaH);

  const cx = firmaX + firmaW / 2;
  let yF = y + 5;

  doc.setFont('helvetica', 'bold').setFontSize(8.5).setTextColor(...BLACK);
  doc.text('Documento Emitido por', cx, yF, { align: 'center' });
  yF += 4.5;

  doc.setFont('helvetica', 'bold').setFontSize(8.5).setTextColor(...PRIMARY);
  doc.text('Centro de Terapias Crecemos', cx, yF, { align: 'center' });
  yF += 4.5;

  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...GRAY);
  doc.text(emitidoPor, cx, yF, { align: 'center' });
};

// ─── Función para generar título del servicio ────────────────────────────────
const generarTituloServicio = (servicio, esInfantil) => {
  if (!servicio) return '';
  const nombreServicio = servicio.nombre || '';
  if (nombreServicio.toLowerCase().includes('lenguaje')) {
    if (servicio.area?.id == 3) return `${nombreServicio} Adolescente`;
    return esInfantil ? `${nombreServicio} Infantil` : `${nombreServicio} Adultos`;
  }
  return nombreServicio;
};

// ─── Bloque compartido: citas + referencias + recomendaciones + materiales ────
const drawContenido = (doc, indicacion, wm, y) => {
  const citas = indicacion.citas || [];
  if (citas.length > 0) {
    y = checkY(doc, wm, y, 45);
    y = drawSection(doc, 'Citas:', y);
    if (citas.length === 1) {
      y = drawCitaBlock(doc, citas[0], M, y, TEXT_W) + 4;
    } else {
      for (let i = 0; i < citas.length; i += 2) {
        y = checkY(doc, wm, y, 30);
        const yIni  = y;
        const COL_W = (TEXT_W - 8) / 2;
        const yL    = drawCitaBlock(doc, citas[i],       M,              yIni, COL_W);
        const yR    = citas[i + 1] ? drawCitaBlock(doc, citas[i + 1], M + COL_W + 8, yIni, COL_W) : yIni;
        y = Math.max(yL, yR) + 4;
        if (i + 2 < citas.length)
          doc.setDrawColor(...LIGHTGRAY).setLineWidth(0.2).line(M, y - 2, PAGE_W - M, y - 2);
      }
    }
  }

  const ref = (indicacion.referencias || [])[0] || {};
  const { internas, externas } = extraerReferencias(ref);

  const rec = (indicacion.recomendaciones || [])[0] || {};
  const recsActivas = extraerRecomendaciones(rec);

  const mat = (indicacion.materiales || [])[0] || {};
  const matsActivos = extraerMateriales(mat, indicacion.servicio);

  // Referencias — 2 columnas (internas | externas)
  if (internas.length > 0 || externas.length > 0) {
    y = checkY(doc, wm, y, 45);
    y = drawSection(doc, 'Referencias:', y);
    y = drawReferenciasBox(doc, internas, externas, y);
  }

  // Recomendaciones — 1 columna (textos largos)
  if (recsActivas.length > 0) {
    y = checkY(doc, wm, y, 45);
    y = drawSection(doc, 'Recomendaciones:', y);
    y = drawListBox(doc, recsActivas, y, 10, 1);
  }

  // Materiales — columnas dinámicas según cantidad
  if (matsActivos.length > 0) {
    y = checkY(doc, wm, y, 45);
    y = drawSection(doc, 'Materiales:', y);
    const cols = matsActivos.length >= 9 ? 3 : matsActivos.length >= 5 ? 2 : 1;
    y = drawListBox(doc, matsActivos, y, 10, cols);
  }

  return y;
};

// ─── Builder Infantil ─────────────────────────────────────────────────────────
const buildInfantil = (doc, indicacion, logo, wm, user) => {
  const fecha          = formatFecha(indicacion.fecha);
  const hora           = indicacion.hora || '';
  const terapeuta      = `${indicacion.trabajador?.nombres || ''} ${indicacion.trabajador?.apellidos || ''}`.trim();
  const especialidad   = indicacion.especialidad?.nombre || '';
  const tituloServicio = generarTituloServicio(indicacion.servicio, true);

  let y = drawHeader(doc, logo, wm, fecha, hora, tituloServicio) + 3;
  y = drawDatosPaciente(doc, indicacion.paciente, terapeuta, especialidad, y);
  y = drawContenido(doc, indicacion, wm, y);
  drawFooter(doc, wm, y, user);
};

// ─── Builder Adultos ──────────────────────────────────────────────────────────
const buildAdultos = (doc, indicacion, logo, wm, user) => {
  const fecha          = formatFecha(indicacion.fecha);
  const hora           = indicacion.hora || '';
  const terapeuta      = `${indicacion.trabajador?.nombres || ''} ${indicacion.trabajador?.apellidos || ''}`.trim();
  const especialidad   = indicacion.especialidad?.nombre || '';
  const tituloServicio = generarTituloServicio(indicacion.servicio, false);

  let y = drawHeader(doc, logo, wm, fecha, hora, tituloServicio) + 3;
  y = drawDatosPaciente(doc, indicacion.paciente, terapeuta, especialidad, y);
  y = drawContenido(doc, indicacion, wm, y);
  drawFooter(doc, wm, y, user);
};

// ─── API Pública ──────────────────────────────────────────────────────────────
export const generarIndicacionPDF = async (indicacion, esInfantil) => {
  const [logo, wm] = await Promise.all([cargarLogo(), cargarWm()]);
  const doc        = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user')); } catch {}
  if (esInfantil) buildInfantil(doc, indicacion, logo, wm, user);
  else            buildAdultos(doc, indicacion, logo, wm, user);
  const nombre   = `${indicacion.paciente?.nombres || ''}_${indicacion.paciente?.apellido_paterno || ''}_${indicacion.paciente?.apellido_materno || ''}`.trim().replace(/\s+/g, '_');
  const fechaStr = formatFecha(indicacion.fecha).replace(/\//g, '-');
  doc.save(`IndicacionTerapeutica_${nombre}_${fechaStr}.pdf`);
};

export const obtenerPreviewIndicacionURL = async (indicacion, esInfantil) => {
  const [logo, wm] = await Promise.all([cargarLogo(), cargarWm()]);
  const doc        = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user')); } catch {}
  if (esInfantil) buildInfantil(doc, indicacion, logo, wm, user);
  else            buildAdultos(doc, indicacion, logo, wm, user);
  return doc.output('bloburl');
};