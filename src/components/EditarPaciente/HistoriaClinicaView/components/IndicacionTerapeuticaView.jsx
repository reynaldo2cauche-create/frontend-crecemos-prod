import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ClipboardList, Plus, X, Save, Calendar, FileText,
  ChevronDown, ChevronUp, Trash2, Download, Eye,
} from 'lucide-react';
import { crearIndicacionTerapeutica, obtenerIndicacionesPorPaciente, eliminarIndicacionTerapeutica } from '../../../../services/indicacionTerapeuticaService';
import { getServicios, getModalidades, getFrecuencias } from '../../../../services/catalogoService';
import { getMotivoCita } from '../../../../services/citaService';
import { getEspecialidades } from '../../../../services/trabajadorService';
import { calcularEdad } from '../../../../utils/date';
import { ROLES } from '../../../../constants/roles';
import { generarIndicacionPDF, obtenerPreviewIndicacionURL } from '../../../../utils/generarIndicacionPDF';

// ─────────────────────────────────────────────
// Configuración de campos por servicio
// El nombre del servicio se compara en lowercase con includes()
// ─────────────────────────────────────────────

// El objeto servicio tiene estructura: { id, nombre, activo, area: { id, nombre } }
// NO tiene especialidad_id ni especialidad anidada.
// Mapeamos por s.id (id del servicio) y s.area?.id como fallback
// IDs conocidos: 1=TL Infantil, 2=T.Ocup, 10=TL Adultos(area2), 7=Psicoterapia, 8=Pareja, 9=Familiar
// area.id: 1=Infantil, 2=Adultos
const SERVICIO_CONFIG = {
  // ── TERAPIA DE APRENDIZAJE (area=1) — usa la misma config que Terapia de Lenguaje Infantil ──
  aprendizaje: {
    match: (s) => s.nombre?.toLowerCase().includes('aprendizaje'),
    referencias: {
      internas: [
        { key: 'refInterTerapiaLenguaje',    label: 'Terapia de lenguaje' },
        { key: 'refInterTerapiaOcupacional', label: 'Terapia ocupacional' },
        { key: 'refInterPsicologia',         label: 'Psicología (Conducta / aprendizaje)' },
        { key: 'refInterPsicoterapiaInd',    label: 'Psicoterapia individual' },
        { key: 'refInterTerapiaParejaFam',   label: 'Terapia de pareja / T.Familiar' },
      ],
      externas: [
        { key: 'refExterNeuropediatra',   label: 'Neuropediatra' },
        { key: 'refExterNeuropsicologia', label: 'Neuropsicología' },
        { key: 'refExterPsiquiatria',     label: 'Psiquiatría' },
      ],
    },
    recomendaciones: [
      { key: 'dedicar1520MinDiarios',     label: 'Dedicar al menos 15-20 minutos diarios para estimular el lenguaje en casa mediante juegos.' },
      { key: 'evitarCorregirBruscamente', label: 'Evitar corregir bruscamente al niño; usar el modelado positivo repitiendo la palabra correcta sin regañar.' },
      { key: 'crearAmbienteRico',         label: 'Crear un ambiente rico en lenguaje: leer cuentos, cantar canciones, conversar frecuentemente.' },
      { key: 'informarCambios',           label: 'Informar sobre cualquier cambio emocional, médico o escolar relevante que pueda influir en el proceso terapéutico.' },
      { key: 'evitarPantallasExcesivas',  label: 'Evitar el uso excesivo de pantallas (TV, tablets, celulares), especialmente si se trata de contenido pasivo.' },
    ],
    materiales: [
      'hojasBond','plumones','lapizBorrador','cartulinaDuplex','siliconaLiquida',
      'limpiatipo','velcro','cartulinaColores','cuaderno','folder','fotos',
      'guantesBajalenguaHisoposCrema','cintaEmbalaje','botellaAgua','plumonIndeleble',
    ],
  },

  // ── TERAPIA DE LENGUAJE INFANTIL (area=1) ──
  // El área 3 (adolescentes) se maneja en lenguaje_adolescente
  lenguaje_infantil: {
    match: (s) => s.nombre?.toLowerCase().includes('lenguaje') && s.area?.id == 1,
    referencias: {
      internas: [
        { key: 'refInterTerapiaLenguaje',    label: 'Terapia de lenguaje' },
        { key: 'refInterTerapiaOcupacional', label: 'Terapia ocupacional' },
        { key: 'refInterPsicologia',         label: 'Psicología (Conducta / aprendizaje)' },
        { key: 'refInterPsicoterapiaInd',    label: 'Psicoterapia individual' },
        { key: 'refInterTerapiaParejaFam',   label: 'Terapia de pareja / T.Familiar' },
      ],
      externas: [
        { key: 'refExterNeuropediatra',   label: 'Neuropediatra' },
        { key: 'refExterNeuropsicologia', label: 'Neuropsicología' },
        { key: 'refExterPsiquiatria',     label: 'Psiquiatría' },
      ],
    },
    recomendaciones: [
      { key: 'dedicar1520MinDiarios',     label: 'Dedicar al menos 15-20 minutos diarios para estimular el lenguaje en casa mediante juegos.' },
      { key: 'evitarCorregirBruscamente', label: 'Evitar corregir bruscamente al niño; usar el modelado positivo repitiendo la palabra correcta sin regañar.' },
      { key: 'crearAmbienteRico',         label: 'Crear un ambiente rico en lenguaje: leer cuentos, cantar canciones, conversar frecuentemente.' },
      { key: 'informarCambios',           label: 'Informar sobre cualquier cambio emocional, médico o escolar relevante que pueda influir en el proceso terapéutico.' },
      { key: 'evitarPantallasExcesivas',  label: 'Evitar el uso excesivo de pantallas (TV, tablets, celulares), especialmente si se trata de contenido pasivo.' },
    ],
    materiales: [
      'hojasBond','plumones','lapizBorrador','cartulinaDuplex','siliconaLiquida',
      'limpiatipo','velcro','cartulinaColores','cuaderno','folder','fotos',
      'guantesBajalenguaHisoposCrema','cintaEmbalaje','botellaAgua','plumonIndeleble',
    ],
  },

  // ── TERAPIA OCUPACIONAL (id=2) ────────────────────────────
  terapia_ocupacional: {
    match: (s) => s.id == 2,
    referencias: {
      internas: [
        { key: 'refInterTerapiaLenguaje',    label: 'Terapia de lenguaje' },
        { key: 'refInterTerapiaOcupacional', label: 'Terapia ocupacional' },
        { key: 'refInterPsicologia',         label: 'Psicología (Conducta / aprendizaje)' },
        { key: 'refInterPsicoterapiaInd',    label: 'Psicoterapia individual' },
        { key: 'refInterTerapiaParejaFam',   label: 'Terapia de pareja / T.Familiar' },
      ],
      externas: [
        { key: 'refExterNeuropediatra',   label: 'Neuropediatra' },
        { key: 'refExterNeuropsicologia', label: 'Neuropsicología' },
        { key: 'refExterPsiquiatria',     label: 'Psiquiatría' },
      ],
    },
    recomendaciones: [
      { key: 'dedicar1520MinActividades',    label: 'Dedicar al menos 15-20 minutos diarios para realizar las actividades de terapia en casa.' },
      { key: 'establecerRutinaEstructurada', label: 'Establecer una rutina diaria estructurada con horarios predecibles.' },
      { key: 'favorecerAutonomia',           label: 'Favorecer la autonomía en actividades cotidianas (vestirse, comer, lavarse las manos).' },
      { key: 'informarCambios',              label: 'Informar sobre cualquier cambio emocional, médico o escolar relevante que pueda influir en el proceso terapéutico.' },
      { key: 'evitarPantallasExcesivas',     label: 'Evitar el uso excesivo de pantallas (TV, tablets, celulares), especialmente si se trata de contenido pasivo.' },
      { key: 'realizarActividadesMotricidad',label: 'Realizar actividades como ensartar cuentas grandes, rasgar papel, enroscar tapas o jugar con plastilina para fortalecer músculos de las manos y mejorar la coordinación ojo-mano.' },
    ],
    materiales: [
      'hojasBond','plumones','lapizBorrador','cartulinaDuplex','siliconaLiquida',
      'limpiatipo','velcro','cartulinaColores','cuaderno','folder','fotos',
      'guantesBajalenguaHisoposCrema','cintaEmbalaje','botellaAgua','plumonIndeleble',
    ],
  },

  // ── TERAPIA DE LENGUAJE ADOLESCENTE (area=3) — mismas indicaciones que adultos ──
  // El área 3 = Adolescentes. El servicio se llama "Terapia de Lenguaje" igual que el
  // infantil (area 1) y el de adultos (area 2); se distingue por area.id == 3.
  // Debe ir ANTES de lenguaje_adultos y psicologia_adolescentes para ganar el match.
  lenguaje_adolescente: {
    match: (s) => s.nombre?.toLowerCase().includes('lenguaje') && s.area?.id == 3,
    referencias: {
      internas: [
        { key: 'refInterTerapiaLenguaje',    label: 'Terapia de lenguaje' },
        { key: 'refInterTerapiaOcupacional', label: 'Terapia ocupacional' },
        { key: 'refInterPsicologia',         label: 'Psicología (Conducta / aprendizaje)' },
        { key: 'refInterPsicoterapiaInd',    label: 'Psicoterapia individual' },
        { key: 'refInterTerapiaParejaFam',   label: 'Terapia de pareja / T.Familiar' },
      ],
      externas: [
        { key: 'refExterNeurologia',      label: 'Neurología' },
        { key: 'refExterNeuropsicologia', label: 'Neuropsicología' },
        { key: 'refExterPsiquiatria',     label: 'Psiquiatría' },
      ],
    },
    recomendaciones: [
      { key: 'evitarCorregirseConFrustracion', label: 'Evitar corregirse con frustración durante el habla; intente comunicarse con calma y claridad.' },
      { key: 'evitarDistraccionesPractica',    label: 'Evitar distracciones durante la práctica (TV, ruido, celular) para una mejor concentración.' },
      { key: 'notificarCambiosSalud',          label: 'Notificar al terapeuta sobre cambios en el estado de salud neurológico o emocional.' },
      { key: 'realizarEjerciciosEnsenados',    label: 'Realizar los ejercicios enseñados por el terapeuta.' },
      { key: 'involucrarFamiliarCuidador',     label: 'Involucrar a un familiar o cuidador en el proceso, si el terapeuta lo considera necesario.' },
    ],
    materiales: [
      'hojasBond','plumones','lapizBorrador','cartulinaDuplex','siliconaLiquida',
      'limpiatipo','velcro','cartulinaColores','cuaderno','folder','fotos',
      'guantesBajalenguaHisoposCrema','cintaEmbalaje','botellaAgua','plumonIndeleble',
    ],
  },

  // ── TERAPIA DE LENGUAJE ADULTOS (id=10, area=2) ──────────
  lenguaje_adultos: {
    match: (s) => s.id == 10 || (s.nombre?.toLowerCase().includes('lenguaje') && s.area?.id == 2),
    referencias: {
      internas: [
        { key: 'refInterTerapiaLenguaje',    label: 'Terapia de lenguaje' },
        { key: 'refInterTerapiaOcupacional', label: 'Terapia ocupacional' },
        { key: 'refInterPsicologia',         label: 'Psicología (Conducta / aprendizaje)' },
        { key: 'refInterPsicoterapiaInd',    label: 'Psicoterapia individual' },
        { key: 'refInterTerapiaParejaFam',   label: 'Terapia de pareja / T.Familiar' },
      ],
      externas: [
        { key: 'refExterNeurologia',      label: 'Neurología' },
        { key: 'refExterNeuropsicologia', label: 'Neuropsicología' },
        { key: 'refExterPsiquiatria',     label: 'Psiquiatría' },
      ],
    },
    recomendaciones: [
      { key: 'evitarCorregirseConFrustracion', label: 'Evitar corregirse con frustración durante el habla; intente comunicarse con calma y claridad.' },
      { key: 'evitarDistraccionesPractica',    label: 'Evitar distracciones durante la práctica (TV, ruido, celular) para una mejor concentración.' },
      { key: 'notificarCambiosSalud',          label: 'Notificar al terapeuta sobre cambios en el estado de salud neurológico o emocional.' },
      { key: 'realizarEjerciciosEnsenados',    label: 'Realizar los ejercicios enseñados por el terapeuta.' },
      { key: 'involucrarFamiliarCuidador',     label: 'Involucrar a un familiar o cuidador en el proceso, si el terapeuta lo considera necesario.' },
    ],
    materiales: [
      'hojasBond','plumones','lapizBorrador','cartulinaDuplex','siliconaLiquida',
      'limpiatipo','velcro','cartulinaColores','cuaderno','folder','fotos',
      'guantesBajalenguaHisoposCrema','cintaEmbalaje','botellaAgua','plumonIndeleble',
    ],
  },

  // ── TERAPIA DEGLUTORIA (sin id propio aún, fallback por nombre) ──
  terapia_deglutoria: {
    match: (s) => s.nombre?.toLowerCase().includes('deglut'),
    referencias: {
      internas: [
        { key: 'refInterTerapiaLenguaje',     label: 'Terapia de lenguaje' },
        { key: 'refInterTerapiaOcupacional',  label: 'Terapia ocupacional' },
        { key: 'refInterPsicologia',          label: 'Psicología (Conducta / aprendizaje)' },
        { key: 'refInterPsicoterapiaInd',     label: 'Psicoterapia individual' },
        { key: 'refInterTerapiaParejaFam',    label: 'Terapia de pareja / T.Familiar' },
        { key: 'refInterTerapiaFisica',       label: 'Terapia física' },
        { key: 'refInterTerapiaRespiratoria', label: 'Terapia respiratoria' },
      ],
      externas: [
        { key: 'refExterNeurologia',           label: 'Neurología' },
        { key: 'refExterNeuropsicologia',      label: 'Neuropsicología' },
        { key: 'refExterPsiquiatria',          label: 'Psiquiatría' },
        { key: 'refExterGastroenterologo',     label: 'Gastroenterólogo' },
        { key: 'refExterNutricion',            label: 'Nutrición' },
        { key: 'refExterOtorrinolaringologia', label: 'Otorrinolaringología' },
        { key: 'refExterGeriatria',            label: 'Geriatría' },
      ],
    },
    recomendaciones: [
      { key: 'mantenerSentado90Grados',    label: 'Mantener al paciente sentado a 90° durante la ingesta y al menos 20-30 minutos después de comer.' },
      { key: 'evitarComerAcostado',        label: 'Evitar comer acostado o reclinado.' },
      { key: 'ofrecerPorcionesPequenas',   label: 'Ofrecer porciones pequeñas.' },
      { key: 'verificarTragoCompleto',     label: 'Verificar que el paciente haya terminado de tragar antes de ofrecer otro bocado.' },
      { key: 'permitirTiempoEntreBocados', label: 'Permitir tiempo suficiente entre cada bocado.' },
      { key: 'evitarHablarConAlimento',    label: 'Evitar hablar mientras el paciente tenga alimento en la boca.' },
      { key: 'evitarApresurarAlimentacion',label: 'Evitar apresurar al paciente durante la alimentación.' },
      { key: 'dietaTipoPure',              label: 'Dieta tipo puré.' },
      { key: 'usarEspesanteLiquidos',      label: 'Usar espesante en líquidos.' },
    ],
    materiales: [
      'hojasBond','plumones','lapizBorrador','cartulinaDuplex','siliconaLiquida',
      'limpiatipo','velcro','cartulinaColores','cuaderno','folder','fotos',
      'guantesBajalenguaHisoposCrema','cintaEmbalaje','botellaAgua','plumonIndeleble',
    ],
  },

  // ── PSICOLOGÍA INFANTIL (nombre contiene psicolog + área infantil, sin adolescente) ───────────────────
  psicologia_infantil: {
    match: (s) => s.nombre?.toLowerCase().includes('psicolog') && s.area?.id == 1 && !s.nombre?.toLowerCase().includes('adolescent'),
    referencias: {
      internas: [
        { key: 'refInterTerapiaLenguaje',    label: 'Terapia de lenguaje' },
        { key: 'refInterTerapiaOcupacional', label: 'Terapia ocupacional' },
        { key: 'refInterPsicologia',         label: 'Psicología (Conducta / aprendizaje)' },
        { key: 'refInterTerapiaParejaFam',   label: 'Terapia de pareja / T.Familiar' },
        { key: 'refInterPsicoterapiaInd',    label: 'Psicoterapia individual' },
      ],
      externas: [
        { key: 'refExterNeuropediatra',   label: 'Neuropediatra' },
        { key: 'refExterNeuropsicologia', label: 'Neuropsicología' },
        { key: 'refExterPsiquiatria',     label: 'Psiquiatría' },
      ],
    },
    recomendaciones: [
      { key: 'fomentarAmbienteConfianza',           label: 'Fomentar un ambiente de confianza y seguridad emocional en casa.' },
      { key: 'evitarEtiquetasNegativas',            label: 'Evitar el uso de etiquetas negativas o críticas constantes hacia el niño; reforzar siempre con respeto y empatía.' },
      { key: 'tenerPacienciaExpectativasRealistas', label: 'Tener paciencia y expectativas realistas; los cambios emocionales y conductuales son graduales.' },
      { key: 'informarCambios',                     label: 'Informar sobre cualquier cambio emocional, médico o escolar relevante que pueda influir en el proceso terapéutico.' },
      { key: 'evitarPantallasExcesivas',            label: 'Evitar el uso excesivo de pantallas (TV, tablets, celulares), especialmente si se trata de contenido pasivo.' },
    ],
    materiales: [
      'hojasBond','plumones','lapizBorrador','cartulinaDuplex','siliconaLiquida',
      'limpiatipo','velcro','cartulinaColores','cuaderno','folder','fotos','munecos',
      'cintaEmbalaje','botellaAgua',
    ],
  },

  // ── PSICOLOGÍA ADOLESCENTES (nombre contiene adolescente) ──
  psicologia_adolescentes: {
    match: (s) => s.nombre?.toLowerCase().includes('adolescente'),
    referencias: {
      internas: [
        { key: 'refInterTerapiaLenguaje',    label: 'Terapia de lenguaje' },
        { key: 'refInterTerapiaOcupacional', label: 'Terapia ocupacional' },
        { key: 'refInterPsicologia',         label: 'Psicología (Conducta / aprendizaje)' },
        { key: 'refInterTerapiaParejaFam',   label: 'Terapia de pareja / T.Familiar' },
        { key: 'refInterPsicoterapiaInd',    label: 'Psicoterapia individual' },
      ],
      externas: [
        { key: 'refExterNeuropediatra',   label: 'Neuropediatra' },
        { key: 'refExterNeuropsicologia', label: 'Neuropsicología' },
        { key: 'refExterPsiquiatria',     label: 'Psiquiatría' },
      ],
    },
    recomendaciones: [
      { key: 'evitarConfrontacionesInmediatas', label: 'Evitar confrontaciones inmediatas después de la terapia; darle espacio para procesar la sesión.' },
      { key: 'respetarEspacioTerapeutico',      label: 'Respetar el espacio terapéutico del adolescente, evitando presionarlo a contar lo que trabaja en consulta.' },
      { key: 'tenerPacienciaExpectativasRealistas', label: 'Tener paciencia y expectativas realistas; los cambios emocionales y conductuales son graduales.' },
      { key: 'informarCambios',                 label: 'Informar sobre cualquier cambio emocional, médico o escolar relevante que pueda influir en el proceso terapéutico.' },
      { key: 'cumplirTareasFamilia',            label: 'Cumplir con las tareas o pautas sugeridas por el terapeuta, cuando estas involucren a la familia.' },
    ],
    materiales: [
      'hojasBond','plumones','lapizBorrador','cartulinaDuplex','cuaderno','folder','fotos','botellaAgua',
    ],
  },

  // ── TERAPIA DE PAREJA Y FAMILIAR (id=8, 9) ───────────────
  terapia_pareja_familiar: {
    match: (s) => s.id == 8 || s.id == 9,
    referencias: {
      internas: [
        { key: 'refInterTerapiaLenguaje',    label: 'Terapia de lenguaje' },
        { key: 'refInterTerapiaOcupacional', label: 'Terapia ocupacional' },
        { key: 'refInterPsicologia',         label: 'Psicología (Conducta / aprendizaje)' },
        { key: 'refInterTerapiaParejaFam',   label: 'Terapia de pareja / T.Familiar' },
        { key: 'refInterPsicoterapiaInd',    label: 'Psicoterapia individual' },
      ],
      externas: [
        { key: 'refExterNeurologia',      label: 'Neurología' },
        { key: 'refExterNeuropsicologia', label: 'Neuropsicología' },
        { key: 'refExterPsiquiatria',     label: 'Psiquiatría' },
      ],
    },
    recomendaciones: [
      { key: 'ambosAsistirSesiones',         label: 'Ambos miembros deben asistir a las sesiones, salvo que el terapeuta indique lo contrario.' },
      { key: 'evitarDiscutirTemasSensibles', label: 'Eviten discutir temas sensibles antes o después de la sesión; guárdenlos para trabajarlos en el espacio terapéutico.' },
      { key: 'actitudAperturaRespeto',       label: 'Asuman una actitud de apertura y respeto mutuo, incluso durante el desacuerdo.' },
      { key: 'comprometerSeBuscarCulpables', label: 'Comprométanse con el proceso sin buscar culpables, sino soluciones conjuntas.' },
      { key: 'noDecisionesImpulsivas',       label: 'No tomen decisiones importantes de manera impulsiva durante el proceso terapéutico.' },
    ],
    materiales: [
      'hojasBond','lapizBorrador','cartulinaDuplex','cuaderno','folder','fotos','botellaAgua',
    ],
  },

  // ── PSICOTERAPIA (id=7) ──────────────────────────────────
  psicoterapia: {
    match: (s) => s.id == 7,
    referencias: {
      internas: [
        { key: 'refInterTerapiaLenguaje',    label: 'Terapia de lenguaje' },
        { key: 'refInterTerapiaOcupacional', label: 'Terapia ocupacional' },
        { key: 'refInterPsicologia',         label: 'Psicología (Conducta / aprendizaje)' },
        { key: 'refInterTerapiaParejaFam',   label: 'Terapia de pareja / T.Familiar' },
        { key: 'refInterPsicoterapiaInd',    label: 'Psicoterapia individual' },
      ],
      externas: [
        { key: 'refExterNeurologia',      label: 'Neurología' },
        { key: 'refExterNeuropsicologia', label: 'Neuropsicología' },
        { key: 'refExterPsiquiatria',     label: 'Psiquiatría' },
      ],
    },
    recomendaciones: [
      { key: 'serHonestoTerapeuta',            label: 'Ser honesto consigo mismo y con el terapeuta, dentro de lo que se sienta cómodo compartir.' },
      { key: 'evitarJuzgarse',                 label: 'Evitar juzgarse durante las sesiones; el espacio terapéutico es libre de críticas.' },
      { key: 'tenerPacienciaExpectativasRealistas', label: 'Tener paciencia y expectativas realistas; los cambios emocionales y conductuales son graduales.' },
      { key: 'registrarPensamientosEmociones', label: 'Registrar pensamientos o emociones importantes entre sesiones, si se desea llevar un seguimiento personal.' },
      { key: 'informarEventosImportantes',     label: 'Informar sobre cualquier evento importante o cambio significativo en el estado emocional o en la vida diaria.' },
    ],
    materiales: [
      'hojasBond','lapizBorrador','cartulinaDuplex','cuaderno','folder','fotos','botellaAgua',
    ],
  },
};

// Labels para mostrar materiales
const MATERIAL_LABELS = {
  hojasBond:                     'Hojas bond',
  plumones:                      'Plumones',
  lapizBorrador:                 'Lápiz y borrador',
  cartulinaDuplex:               'Cartulina Duplex',
  siliconaLiquida:               'Silicona Líquida',
  limpiatipo:                    'Limpiatipo',
  velcro:                        'Velcro',
  cartulinaColores:              'Cartulina de colores',
  cuaderno:                      'Cuaderno',
  folder:                        'Folder',
  fotos:                         'Fotos',
  guantesBajalenguaHisoposCrema: 'Guantes/bajalengua/hisopos/crema',
  cintaEmbalaje:                 'Cinta de embalaje',
  botellaAgua:                   'Botella con agua',
  plumonIndeleble:               'Plumón indeleble',
  munecos:                       'Muñecos',
};

// Recomendaciones preimpresas (always true por defecto)
const RECOMENDACIONES_FIJAS = [
  { key: 'asistirPuntualmente',  label: 'Asistir puntualmente a todas las sesiones para garantizar el progreso continuo.' },
  { key: 'evitarFaltarSinAviso', label: 'Evitar faltar sin previo aviso; las inasistencias afectan el ritmo del tratamiento.' },
  { key: 'practicarEnCasa',      label: 'Practicar en casa los ejercicios o actividades recomendadas por el terapeuta.' },
];

// ─────────────────────────────────────────────
// Función helper: detectar config por objeto servicio (usa id, especialidad_id, area_id)
// ─────────────────────────────────────────────
const detectarConfigServicio = (servicio) => {
  if (!servicio) return null;

  // DEBUG: ver qué servicios llegan y si matchean
  console.log('🔍 detectarConfigServicio - servicio recibido:', {
    id: servicio.id,
    nombre: servicio.nombre,
    area: servicio.area,
    especialidad: servicio.especialidad,
  });

  const matched = Object.entries(SERVICIO_CONFIG).find(([key, cfg]) => {
    const result = cfg.match(servicio);
    console.log(`  Probando ${key}: ${result ? '✅ MATCH' : '❌ no match'}`);
    return result;
  });

  if (matched) {
    console.log('✅ CONFIGURACIÓN ENCONTRADA:', matched[0]);
    return matched[1];
  } else {
    console.log('❌ NO SE ENCONTRÓ CONFIGURACIÓN');
    return null;
  }
};

// ─────────────────────────────────────────────
// Estado inicial de formulario vacío
// ─────────────────────────────────────────────
const buildFormInicial = () => ({
  fecha:          new Date().toISOString().split('T')[0],
  especialidad_id: '',
  servicio_id:    '',
  citas: [],
  referencias: {
    refInterTerapiaLenguaje: false, refInterTerapiaOcupacional: false,
    refInterPsicologia: false, refInterPsicoterapiaInd: false,
    refInterTerapiaParejaFam: false, refInterTerapiaFisica: false,
    refInterTerapiaRespiratoria: false,
    refExterNeuropediatra: false, refExterNeuropsicologia: false,
    refExterPsiquiatria: false, refExterNeurologia: false,
    refExterGastroenterologo: false, refExterNutricion: false,
    refExterOtorrinolaringologia: false, refExterGeriatria: false,
    refExterOtros: '',
  },
  recomendaciones: {
    asistirPuntualmente: true, evitarFaltarSinAviso: true, practicarEnCasa: true,
    dedicar1520MinDiarios: false, evitarCorregirBruscamente: false,
    crearAmbienteRico: false, informarCambios: false, evitarPantallasExcesivas: false,
    dedicar1520MinActividades: false, establecerRutinaEstructurada: false,
    favorecerAutonomia: false, realizarActividadesMotricidad: false,
    evitarCorregirseConFrustracion: false, evitarDistraccionesPractica: false,
    notificarCambiosSalud: false, realizarEjerciciosEnsenados: false,
    involucrarFamiliarCuidador: false,
    mantenerSentado90Grados: false, evitarComerAcostado: false,
    ofrecerPorcionesPequenas: false, verificarTragoCompleto: false,
    permitirTiempoEntreBocados: false, evitarHablarConAlimento: false,
    evitarApresurarAlimentacion: false, dietaTipoPure: false, usarEspesanteLiquidos: false,
    fomentarAmbienteConfianza: false, evitarEtiquetasNegativas: false,
    tenerPacienciaExpectativasRealistas: false,
    evitarConfrontacionesInmediatas: false, respetarEspacioTerapeutico: false,
    cumplirTareasFamilia: false,
    ambosAsistirSesiones: false, evitarDiscutirTemasSensibles: false,
    actitudAperturaRespeto: false, comprometerSeBuscarCulpables: false,
    noDecisionesImpulsivas: false,
    serHonestoTerapeuta: false, evitarJuzgarse: false,
    registrarPensamientosEmociones: false, informarEventosImportantes: false,
    otros: '',
  },
  materiales: {
    hojasBond: false, plumones: false, lapizBorrador: false, cartulinaDuplex: false,
    siliconaLiquida: false, limpiatipo: false, velcro: false, cartulinaColores: false,
    cuaderno: false, folder: false, fotos: false, guantesBajalenguaHisoposCrema: false,
    cintaEmbalaje: false, botellaAgua: false, plumonIndeleble: false, munecos: false,
    otros: '',
  },
});

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────
const IndicacionTerapeuticaView = ({ paciente, user }) => {
  const [indicaciones, setIndicaciones]           = useState([]);
  const [loading, setLoading]                     = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando]                 = useState(false);
  const [imprimiendoId, setImprimiendoId]         = useState(null);
  const [previendoId, setPreviendoId]             = useState(null);
  const [previewUrl, setPreviewUrl]               = useState(null);
  const [eliminandoId, setEliminandoId]           = useState(null);
  const [modalEliminar, setModalEliminar]         = useState({ open: false, indicacionId: null });
  const [showSnackbar, setShowSnackbar]           = useState(false);
  const [snackbarMessage, setSnackbarMessage]     = useState('');
  const [snackbarSeverity, setSnackbarSeverity]   = useState('success');
  const [expandedIndicaciones, setExpandedIndicaciones] = useState({});

  const [servicios, setServicios]         = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [modalidades, setModalidades]     = useState([]);
  const [frecuencias, setFrecuencias]     = useState([]);
  const [tiposCita, setTiposCita]         = useState([]);

  const [formData, setFormData] = useState(buildFormInicial());

  const edad       = calcularEdad(paciente?.fecha_nacimiento);
  const esInfantil = edad < 18;
  const puedeEditar = user?.rol?.id === ROLES.ADMINISTRADOR || user?.rol?.id === ROLES.TERAPEUTA;

  // Servicio seleccionado y su config
  const servicioSeleccionado = servicios.find(s => String(s.id) === String(formData.servicio_id));
  const configServicio = detectarConfigServicio(servicioSeleccionado);

  // DEBUG — eliminar cuando funcione
  if (formData.servicio_id) {
    console.log('[Indicacion] servicio_id seleccionado:', formData.servicio_id);
    console.log('[Indicacion] servicioSeleccionado:', servicioSeleccionado);
    console.log('[Indicacion] configServicio:', configServicio);
  }

  const formatearFecha = (fechaString) => {
    if (!fechaString) return '';
    const [year, month, day] = fechaString.split('T')[0].split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      .toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  useEffect(() => { cargarDatos(); }, [paciente?.id]);

  const cargarDatos = async () => {
    if (!paciente?.id) return;
    try {
      setLoading(true);
      const [indicacionesData, serviciosData, especialidadesData, modalidadesData, frecuenciasData, tiposCitaData] =
        await Promise.all([
          obtenerIndicacionesPorPaciente(paciente.id),
          getServicios(), getEspecialidades(), getModalidades(), getFrecuencias(), getMotivoCita(),
        ]);

      let filtradas = indicacionesData || [];
      if (user?.rol?.id === ROLES.TERAPEUTA) {
        filtradas = filtradas.filter(ind => ind.trabajador?.id === user.id);
      }

      setIndicaciones(filtradas);
      setServicios(serviciosData || []);
      setEspecialidades(especialidadesData || []);
      setModalidades(modalidadesData || []);
      setFrecuencias(frecuenciasData || []);
      setTiposCita(tiposCitaData || []);

      // ✅ PRE-SELECCIÓN AUTOMÁTICA para TERAPEUTAS
      // Busca en asignacion-terapeuta el servicio asignado al paciente con este terapeuta
      // y de ahí obtiene la especialidad del servicio (NO del terapeuta)
      if (user?.rol?.id === ROLES.TERAPEUTA) {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🔍 INICIANDO PRE-SELECCIÓN AUTOMÁTICA');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('👤 Usuario logueado:', {
          id: user.id,
          nombre: `${user.nombres} ${user.apellidos}`,
          rol: user.rol?.nombre
        });
        console.log('🏥 Paciente:', {
          id: paciente.id,
          nombre: `${paciente.nombres} ${paciente.apellido_paterno}`,
          servicios: paciente.servicios
        });
        console.log('───────────────────────────────────────────────────────────');

        let servicioAsignado = null;

        // Buscar en paciente.servicios el servicio asignado a este terapeuta
        // SOLO asignaciones ACTIVAS (estado='ACTIVO', activo=true, servicio activo)
        if (paciente.servicios && Array.isArray(paciente.servicios)) {
          console.log(`📋 Total de servicios del paciente: ${paciente.servicios.length}`);

          paciente.servicios.forEach((servicioItem, index) => {
            console.log(`\n🔸 Servicio ${index + 1}:`, {
              id: servicioItem.id,
              nombre: servicioItem.servicio?.nombre,
              activo: servicioItem.activo,
              asignaciones: servicioItem.asignaciones?.map(asig => ({
                id: asig.id,
                estado: asig.estado,
                activo: asig.activo,
                terapeuta: `${asig.terapeuta?.nombres} ${asig.terapeuta?.apellidos} (ID: ${asig.terapeuta?.id})`
              }))
            });
          });

          for (const servicioItem of paciente.servicios) {
            console.log(`\n🔍 Evaluando servicio: ${servicioItem.servicio?.nombre}`);

            // Verificar que el servicio también esté activo
            if (servicioItem.activo === false) {
              console.log('  ❌ Servicio NO activo, saltando...');
              continue;
            }

            console.log('  ✅ Servicio está activo');
            console.log('  🔎 Buscando asignación activa para terapeuta ID:', user.id);

            const asignacionActiva = servicioItem.asignaciones?.find(
              asig => {
                const match = asig.estado === 'ACTIVO' &&
                             asig.activo === true &&
                             asig.terapeuta?.id === user.id;

                console.log(`    Evaluando asignación:`, {
                  terapeutaId: asig.terapeuta?.id,
                  terapeutaNombre: `${asig.terapeuta?.nombres} ${asig.terapeuta?.apellidos}`,
                  estado: asig.estado,
                  activo: asig.activo,
                  coincide: match ? '✅' : '❌'
                });

                return match;
              }
            );

            if (asignacionActiva) {
              servicioAsignado = servicioItem.servicio;
              console.log('\n🎯 ¡ASIGNACIÓN ACTIVA ENCONTRADA!');
              console.log('  📌 Servicio:', servicioAsignado?.nombre);
              console.log('  📌 Estado:', asignacionActiva.estado);
              console.log('  📌 Activo:', asignacionActiva.activo);
              console.log('  📌 Terapeuta:', `${asignacionActiva.terapeuta?.nombres} ${asignacionActiva.terapeuta?.apellidos}`);
              break;
            }
          }
        }

        console.log('\n───────────────────────────────────────────────────────────');

        // Pre-seleccionar especialidad y servicio
        if (servicioAsignado) {
          console.log('🔄 Buscando servicio completo en catálogo...');

          // Buscar el servicio completo en el catálogo para obtener la especialidad
          const servicioCompleto = serviciosData.find(s => s.id === servicioAsignado.id);

          console.log('📦 Servicio del catálogo:', servicioCompleto);
          console.log('📦 Servicios disponibles en catálogo:', serviciosData.length);

          // Obtener especialidad_id del servicio (ahora el backend lo trae)
          const espId = servicioCompleto?.especialidad?.id ||
                        servicioCompleto?.especialidad_id ||
                        servicioAsignado.especialidad?.id ||
                        servicioAsignado.especialidad_id;

          console.log('\n✨ RESULTADO FINAL:');
          console.log('  🎯 Servicio ID:', servicioAsignado.id);
          console.log('  🎯 Servicio Nombre:', servicioAsignado.nombre);
          console.log('  🎯 Especialidad ID:', espId);
          console.log('  🎯 Especialidad (del catálogo):', servicioCompleto?.especialidad);

          setFormData(prev => ({
            ...prev,
            especialidad_id: espId ? String(espId) : '',
            servicio_id: String(servicioAsignado.id),
          }));

          console.log('\n✅ FormData actualizado con:', {
            especialidad_id: espId ? String(espId) : '',
            servicio_id: String(servicioAsignado.id)
          });
        } else {
          console.log('🔴 NO SE ENCONTRÓ SERVICIO ASIGNADO ACTIVO');
          console.log('  Posibles razones:');
          console.log('  - No hay servicios asignados al paciente');
          console.log('  - Ninguna asignación está ACTIVA');
          console.log('  - El terapeuta no está asignado a ningún servicio de este paciente');
        }

        console.log('═══════════════════════════════════════════════════════════');
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
  };

  const handleAgregarCita = () => {
    setFormData(prev => ({
      ...prev,
      citas: [...prev.citas, { tipoId: '', modalidadId: '', frecuenciaId: '', cantidadCitas: '', informeFisico: false, informeVerbal: false }],
    }));
  };

  const handleEliminarCita = (index) => {
    setFormData(prev => ({ ...prev, citas: prev.citas.filter((_, i) => i !== index) }));
  };

  const handleCitaChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      citas: prev.citas.map((cita, i) => i === index ? { ...cita, [field]: value } : cita),
    }));
  };

  const handleCheckboxChange = (category, field, value) => {
    setFormData(prev => ({ ...prev, [category]: { ...prev[category], [field]: value } }));
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      if (!formData.fecha)           return showMsg('Debe seleccionar una fecha', 'error');
      if (!formData.especialidad_id) return showMsg('Debe seleccionar una especialidad', 'error');
      if (!formData.servicio_id)     return showMsg('Debe seleccionar un servicio', 'error');
      if (!formData.citas.length)    return showMsg('Debe agregar al menos una cita', 'error');

      const payload = {
        fecha:          formData.fecha,
        pacienteId:     paciente.id,
        trabajadorId:   user.id,
        especialidadId: parseInt(formData.especialidad_id),
        servicioId:     parseInt(formData.servicio_id),
        citas: formData.citas.map(c => ({
          tipoId:       parseInt(c.tipoId),
          modalidadId:  parseInt(c.modalidadId),
          frecuenciaId: parseInt(c.frecuenciaId),
          cantidadCitas: c.cantidadCitas ? parseInt(c.cantidadCitas) : null,
          informeFisico: c.informeFisico || false,
          informeVerbal: c.informeVerbal || false,
        })),
        referencias:     formData.referencias,
        recomendaciones: formData.recomendaciones,
        materiales:      formData.materiales,
      };

      await crearIndicacionTerapeutica(payload);
      showMsg('Indicación terapéutica guardada exitosamente');
      setMostrarFormulario(false);
      setFormData(buildFormInicial());
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar:', error);
      showMsg(error.response?.data?.message || 'Error al guardar la indicación terapéutica', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const toggleExpandedIndicacion = (id) => {
    setExpandedIndicaciones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDescargarIndicacion = async (indicacion) => {
    try {
      setImprimiendoId(indicacion.id);
      await generarIndicacionPDF(indicacion, esInfantil);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      showMsg('Error al generar el PDF', 'error');
    } finally {
      setImprimiendoId(null);
    }
  };

  const handlePreviewIndicacion = async (indicacion) => {
    try {
      setPreviendoId(indicacion.id);
      const url = await obtenerPreviewIndicacionURL(indicacion, esInfantil);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Error al previsualizar PDF:', error);
      showMsg('Error al previsualizar el PDF', 'error');
    } finally {
      setPreviendoId(null);
    }
  };

  const cerrarPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const abrirModalEliminar = (indicacionId) => setModalEliminar({ open: true, indicacionId });
  const cerrarModalEliminar = () => setModalEliminar({ open: false, indicacionId: null });

  const confirmarEliminarIndicacion = async () => {
    const indicacionId = modalEliminar.indicacionId;
    if (!indicacionId) return;
    try {
      setEliminandoId(indicacionId);
      cerrarModalEliminar();
      await eliminarIndicacionTerapeutica(indicacionId);
      showMsg('Indicación terapéutica eliminada exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar indicación:', error);
      showMsg('Error al eliminar la indicación terapéutica', 'error');
    } finally {
      setEliminandoId(null);
    }
  };

  // ── Spinner de carga ───────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <div className="absolute inset-0 border-2 border-gray-100 rounded-full" />
            <div className="absolute inset-0 border-2 border-transparent border-t-[#7B1FA2] rounded-full animate-spin" />
          </div>
          <p className="text-gray-400 text-xs font-medium">Cargando indicaciones...</p>
        </div>
      </div>
    );
  }

  // ── Sub-componente: bloque de checkbox ────────────────────
  const CheckItem = ({ category, field, label, checked }) => (
    <label className="flex items-start gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => handleCheckboxChange(category, field, e.target.checked)}
        className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#7B1FA2] focus:ring-[#7B1FA2] flex-shrink-0"
      />
      <span className="text-sm text-gray-700 leading-snug">{label}</span>
    </label>
  );

  return (
    <div className="space-y-4">

      {/* ── Snackbar ─────────────────────────────────────── */}
      {showSnackbar && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 bg-white ${
          snackbarSeverity === 'success' ? 'border-gray-100' : 'border-red-100'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${snackbarSeverity === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`} />
          <span className="text-xs font-medium text-gray-700">{snackbarMessage}</span>
          <button onClick={() => setShowSnackbar(false)} className="ml-2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      )}

      {/* ── Botón nueva indicación ──────────────────────── */}
      {puedeEditar && !mostrarFormulario && (
        <button
          onClick={() => setMostrarFormulario(true)}
          className="w-full px-4 py-3 bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] text-white rounded-xl hover:from-[#6A1B9A] hover:to-[#5E1690] transition-all flex items-center justify-center gap-2 font-medium shadow-lg shadow-[#7B1FA2]/20"
        >
          <Plus className="w-5 h-5" />
          Nueva Indicación Terapéutica
        </button>
      )}

      {/* ── Formulario ──────────────────────────────────── */}
      {mostrarFormulario && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              Nueva Indicación Terapéutica
            </h3>
            <button onClick={() => setMostrarFormulario(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Datos generales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Fecha de Indicación <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" value={formData.fecha}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Especialidad <span className="text-red-500">*</span>
              </label>
              <select value={formData.especialidad_id}
                onChange={(e) => setFormData(prev => ({ ...prev, especialidad_id: e.target.value }))}
                disabled={user?.rol?.id === ROLES.TERAPEUTA}
                className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all ${
                  user?.rol?.id === ROLES.TERAPEUTA ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}>
                <option value="">Seleccionar...</option>
                {especialidades.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Servicio <span className="text-red-500">*</span>
              </label>
              <select value={formData.servicio_id}
                onChange={(e) => setFormData(prev => ({ ...prev, servicio_id: e.target.value }))}
                disabled={user?.rol?.id === ROLES.TERAPEUTA}
                className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all ${
                  user?.rol?.id === ROLES.TERAPEUTA ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}>
                <option value="">Seleccionar...</option>
                {servicios.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}{s.area?.nombre ? ` — ${s.area.nombre}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Citas ─────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-gray-900">Citas</h4>
              <button onClick={handleAgregarCita}
                className="px-3 py-1.5 bg-[#7B1FA2] text-white rounded-lg hover:bg-[#6A1B9A] transition-all flex items-center gap-1.5 text-sm">
                <Plus className="w-4 h-4" /> Agregar Cita
              </button>
            </div>
            <div className="space-y-4">
              {formData.citas.map((cita, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-end mb-3">
                    <button onClick={() => handleEliminarCita(index)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-2">Tipo</label>
                      <select value={cita.tipoId} onChange={(e) => handleCitaChange(index, 'tipoId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2]">
                        <option value="">Seleccionar...</option>
                        {tiposCita.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-2">Modalidad</label>
                      <select value={cita.modalidadId} onChange={(e) => handleCitaChange(index, 'modalidadId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2]">
                        <option value="">Seleccionar...</option>
                        {modalidades.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-2">Cantidad de Citas</label>
                      <input type="number" value={cita.cantidadCitas}
                        onChange={(e) => handleCitaChange(index, 'cantidadCitas', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2]"
                        min="1" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-2">Frecuencia</label>
                      <select value={cita.frecuenciaId} onChange={(e) => handleCitaChange(index, 'frecuenciaId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2]">
                        <option value="">Seleccionar...</option>
                        {frecuencias.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2 flex gap-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={cita.informeFisico}
                          onChange={(e) => handleCitaChange(index, 'informeFisico', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-[#7B1FA2] focus:ring-[#7B1FA2]" />
                        <span className="text-sm text-gray-700">Informe Físico</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={cita.informeVerbal}
                          onChange={(e) => handleCitaChange(index, 'informeVerbal', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-[#7B1FA2] focus:ring-[#7B1FA2]" />
                        <span className="text-sm text-gray-700">Informe Verbal</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              {formData.citas.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
                  No hay citas agregadas. Haga clic en "Agregar Cita" para empezar.
                </div>
              )}
            </div>
          </div>

          {/* ── Referencias (depende del servicio) ──────── */}
          {formData.servicio_id && (
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4">Referencias</h4>
              {configServicio ? (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Internas</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {configServicio.referencias.internas.map(({ key, label }) => (
                        <CheckItem key={key} category="referencias" field={key} label={label}
                          checked={formData.referencias[key]} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Externas</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {configServicio.referencias.externas.map(({ key, label }) => (
                        <CheckItem key={key} category="referencias" field={key} label={label}
                          checked={formData.referencias[key]} />
                      ))}
                    </div>
                    <input type="text" value={formData.referencias.refExterOtros}
                      onChange={(e) => handleCheckboxChange('referencias', 'refExterOtros', e.target.value)}
                      placeholder="Otros..."
                      className="mt-3 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2]" />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Seleccione un servicio reconocido para ver las referencias correspondientes.</p>
              )}
            </div>
          )}

          {/* ── Recomendaciones (depende del servicio) ─── */}
          {formData.servicio_id && (
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4">Recomendaciones</h4>
              <div className="space-y-4">
                {/* Preimpresas */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-green-800 mb-3 uppercase tracking-wide">Preimpresas (siempre activas)</p>
                  <div className="space-y-2.5">
                    {RECOMENDACIONES_FIJAS.map(({ key, label }) => (
                      <label key={key} className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.recomendaciones[key]}
                          onChange={(e) => handleCheckboxChange('recomendaciones', key, e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded border-green-400 text-green-600 focus:ring-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 leading-snug">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Específicas del servicio */}
                {configServicio && configServicio.recomendaciones.length > 0 && (
                  <div className="grid grid-cols-1 gap-3">
                    {configServicio.recomendaciones.map(({ key, label }) => (
                      <CheckItem key={key} category="recomendaciones" field={key} label={label}
                        checked={formData.recomendaciones[key]} />
                    ))}
                  </div>
                )}

                <input type="text" value={formData.recomendaciones.otros}
                  onChange={(e) => handleCheckboxChange('recomendaciones', 'otros', e.target.value)}
                  placeholder="Otros..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2]" />
              </div>
            </div>
          )}

          {/* ── Materiales (depende del servicio) ────────── */}
          {formData.servicio_id && (
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4">Materiales</h4>
              {configServicio ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {configServicio.materiales.map((key) => (
                    <label key={key}
                      className={`flex items-start gap-2 cursor-pointer ${key === 'guantesBajalenguaHisoposCrema' ? 'col-span-2' : ''}`}>
                      <input type="checkbox" checked={formData.materiales[key]}
                        onChange={(e) => handleCheckboxChange('materiales', key, e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#7B1FA2] focus:ring-[#7B1FA2] flex-shrink-0" />
                      <span className="text-sm text-gray-700 leading-snug">{MATERIAL_LABELS[key]}</span>
                    </label>
                  ))}
                  <div className="col-span-2 md:col-span-3">
                    <input type="text" value={formData.materiales.otros}
                      onChange={(e) => handleCheckboxChange('materiales', 'otros', e.target.value)}
                      placeholder="Otros..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2]" />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Seleccione un servicio reconocido para ver los materiales correspondientes.</p>
              )}
            </div>
          )}

          {/* ── Botones ──────────────────────────────────── */}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setMostrarFormulario(false)}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
              Cancelar
            </button>
            <button onClick={handleGuardar} disabled={guardando}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] rounded-xl hover:from-[#6A1B9A] hover:to-[#5E1690] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#7B1FA2]/30 flex items-center gap-2">
              {guardando
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Guardando...</>
                : <><Save className="w-4 h-4" />Guardar Indicación</>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── Listado de indicaciones ─────────────────────── */}
      <div className="space-y-3">
        {indicaciones.length === 0 && !mostrarFormulario && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No hay indicaciones terapéuticas registradas</p>
          </div>
        )}

        {indicaciones.map((indicacion) => {
          const cfgVista = detectarConfigServicio(indicacion.servicio);
          const ref  = indicacion.referencias?.[0];
          const rec  = indicacion.recomendaciones?.[0];
          const mat  = indicacion.materiales?.[0];

          // DEBUG: ver por qué no hace match
          if (!cfgVista && indicacion.servicio) {
            console.log('❌ NO SE ENCONTRÓ CONFIGURACIÓN para servicio:', {
              id: indicacion.servicio.id,
              nombre: indicacion.servicio.nombre,
              area: indicacion.servicio.area,
              especialidad: indicacion.servicio.especialidad,
            });
          }

          return (
            <div key={indicacion.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Fila de cabecera */}
              <div className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <button onClick={() => toggleExpandedIndicacion(indicacion.id)} className="flex items-center gap-4 flex-1 text-left">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {formatearFecha(indicacion.fecha)} — {indicacion.servicio?.nombre}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {indicacion.trabajador?.nombres} {indicacion.trabajador?.apellidos}
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => handlePreviewIndicacion(indicacion)} disabled={previendoId === indicacion.id}
                    className="p-2 hover:bg-purple-50 rounded-lg transition-colors group disabled:opacity-50" title="Vista previa PDF">
                    {previendoId === indicacion.id
                      ? <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                      : <Eye className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />}
                  </button>
                  <button onClick={() => handleDescargarIndicacion(indicacion)} disabled={imprimiendoId === indicacion.id}
                    className="p-2 hover:bg-purple-50 rounded-lg transition-colors group disabled:opacity-50" title="Descargar PDF">
                    {imprimiendoId === indicacion.id
                      ? <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                      : <Download className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />}
                  </button>
                  {user?.rol?.id === ROLES.ADMINISTRADOR && (
                    <button onClick={() => abrirModalEliminar(indicacion.id)} disabled={eliminandoId === indicacion.id}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors group disabled:opacity-50" title="Eliminar">
                      {eliminandoId === indicacion.id
                        ? <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                        : <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-600" />}
                    </button>
                  )}
                  <button onClick={() => toggleExpandedIndicacion(indicacion.id)} className="p-2">
                    {expandedIndicaciones[indicacion.id]
                      ? <ChevronUp className="w-5 h-5 text-gray-400" />
                      : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              {/* Detalle expandido */}
              {expandedIndicaciones[indicacion.id] && (
                <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-5">
                  {/* Datos generales */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-semibold text-gray-700">Fecha:</span><p className="text-gray-600">{formatearFecha(indicacion.fecha)}</p></div>
                    <div><span className="font-semibold text-gray-700">Hora:</span><p className="text-gray-600">{indicacion.hora}</p></div>
                    <div><span className="font-semibold text-gray-700">Especialidad:</span><p className="text-gray-600">{indicacion.especialidad?.nombre}</p></div>
                    <div><span className="font-semibold text-gray-700">Servicio:</span><p className="text-gray-600">{indicacion.servicio?.nombre}</p></div>
                  </div>

                  {/* Citas */}
                  {indicacion.citas?.length > 0 && (
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 mb-2">Citas</h5>
                      <div className="space-y-2">
                        {indicacion.citas.map((cita) => (
                          <div key={cita.id} className="bg-white border border-gray-200 rounded-lg p-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div><span className="font-semibold text-gray-700">Tipo:</span> {cita.tipo?.nombre}</div>
                              <div><span className="font-semibold text-gray-700">Modalidad:</span> {cita.modalidad?.nombre}</div>
                              <div><span className="font-semibold text-gray-700">Cantidad:</span> {cita.cantidadCitas || 'N/A'}</div>
                              <div><span className="font-semibold text-gray-700">Frecuencia:</span> {cita.frecuencia?.nombre}</div>
                            </div>
                            {(cita.informeFisico || cita.informeVerbal) && (
                              <div className="mt-2 flex gap-2">
                                {cita.informeFisico && <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">Informe Físico</span>}
                                {cita.informeVerbal && <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">Informe Verbal</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Referencias */}
                  {ref && cfgVista && (
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 mb-2">Referencias</h5>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 text-sm">
                        {/* Internas */}
                        {cfgVista.referencias.internas.some(({ key }) => ref[key]) && (
                          <div>
                            <p className="font-semibold text-gray-700 mb-1">Internas:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 pl-3">
                              {cfgVista.referencias.internas
                                .filter(({ key }) => ref[key])
                                .map(({ key, label }) => (
                                  <p key={key} className="text-gray-600">• {label}</p>
                                ))}
                            </div>
                          </div>
                        )}
                        {/* Externas */}
                        {(cfgVista.referencias.externas.some(({ key }) => ref[key]) || ref.refExterOtros) && (
                          <div>
                            <p className="font-semibold text-gray-700 mb-1">Externas:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 pl-3">
                              {cfgVista.referencias.externas
                                .filter(({ key }) => ref[key])
                                .map(({ key, label }) => (
                                  <p key={key} className="text-gray-600">• {label}</p>
                                ))}
                              {ref.refExterOtros && <p className="text-gray-600">• Otros: {ref.refExterOtros}</p>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recomendaciones */}
                  {rec && (
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 mb-2">Recomendaciones</h5>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-1 text-sm">
                        {/* Fijas */}
                        {RECOMENDACIONES_FIJAS.filter(({ key }) => rec[key]).map(({ key, label }) => (
                          <p key={key} className="text-gray-600">• {label}</p>
                        ))}
                        {/* Específicas del servicio */}
                        {cfgVista && cfgVista.recomendaciones
                          .filter(({ key }) => rec[key])
                          .map(({ key, label }) => (
                            <p key={key} className="text-gray-600">• {label}</p>
                          ))}
                        {rec.otros && <p className="text-gray-600">• Otros: {rec.otros}</p>}
                      </div>
                    </div>
                  )}

                  {/* Materiales */}
                  {mat && cfgVista && cfgVista.materiales.some(key => mat[key]) && (
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 mb-2">Materiales</h5>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          {cfgVista.materiales
                            .filter(key => mat[key])
                            .map(key => (
                              <p key={key} className={`text-gray-600 ${key === 'guantesBajalenguaHisoposCrema' ? 'col-span-2' : ''}`}>
                                • {MATERIAL_LABELS[key]}
                              </p>
                            ))}
                          {mat.otros && (
                            <p className="text-gray-600 col-span-2 md:col-span-3">• Otros: {mat.otros}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Modal preview PDF ──────────────────────────── */}
      {previewUrl && createPortal(
        <div onClick={(e) => { if (e.target === e.currentTarget) cerrarPreview(); }}
          style={{ position:'fixed', inset:0, zIndex:99999, backgroundColor:'rgba(0,0,0,0.75)',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'white', borderRadius:'16px', display:'flex', flexDirection:'column',
            width:'95vw', maxWidth:'1100px', height:'95vh', overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'12px 20px', borderBottom:'1px solid #e5e7eb', flexShrink:0 }}>
              <span style={{ fontWeight:600, fontSize:'14px', color:'#1f2937' }}>
                Vista previa — Indicación Terapéutica
              </span>
              <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                <a href={previewUrl} download="IndicacionTerapeutica.pdf"
                  style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 14px',
                    background:'#7B1FA2', color:'white', fontSize:'12px', fontWeight:600,
                    borderRadius:'8px', textDecoration:'none' }}>
                  <Download size={14} /> Descargar
                </a>
                <button onClick={cerrarPreview}
                  style={{ padding:'6px', borderRadius:'8px', border:'none', background:'transparent', cursor:'pointer', display:'flex' }}>
                  <X size={20} color="#6b7280" />
                </button>
              </div>
            </div>
            <iframe src={previewUrl} style={{ flex:1, width:'100%', border:'none' }} title="Preview Indicación Terapéutica" />
          </div>
        </div>,
        document.body
      )}

      {/* ── Modal confirmar eliminación ─────────────────── */}
      {modalEliminar.open && createPortal(
        <div onClick={cerrarModalEliminar}
          style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)',
            zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background:'white', borderRadius:'12px', padding:'24px', maxWidth:'500px', width:'100%',
              boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
            <div style={{ display:'flex', alignItems:'flex-start', marginBottom:'16px' }}>
              <div style={{ background:'#FEE2E2', borderRadius:'50%', padding:'12px', marginRight:'16px', flexShrink:0 }}>
                <Trash2 size={24} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ margin:0, fontSize:'18px', fontWeight:600, color:'#111827', marginBottom:'8px' }}>
                  Eliminar Indicación Terapéutica
                </h3>
                <p style={{ margin:0, fontSize:'14px', color:'#6B7280', lineHeight:'1.5' }}>
                  ¿Está seguro de eliminar esta indicación? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end', marginTop:'24px' }}>
              <button onClick={cerrarModalEliminar}
                style={{ padding:'10px 20px', borderRadius:'8px', border:'1px solid #D1D5DB',
                  background:'white', color:'#374151', fontSize:'14px', fontWeight:500, cursor:'pointer' }}
                onMouseEnter={(e) => e.target.style.background = '#F9FAFB'}
                onMouseLeave={(e) => e.target.style.background = 'white'}>
                Cancelar
              </button>
              <button onClick={confirmarEliminarIndicacion}
                style={{ padding:'10px 20px', borderRadius:'8px', border:'none',
                  background:'#DC2626', color:'white', fontSize:'14px', fontWeight:500, cursor:'pointer' }}
                onMouseEnter={(e) => e.target.style.background = '#B91C1C'}
                onMouseLeave={(e) => e.target.style.background = '#DC2626'}>
                Eliminar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default IndicacionTerapeuticaView;