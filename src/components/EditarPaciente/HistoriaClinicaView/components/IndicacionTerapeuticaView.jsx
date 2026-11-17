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

// Lista EXACTA de materiales para Terapia de Lenguaje (Infantil, Adolescentes y
// Adultos). El orden y el texto de cada label deben figurar tal cual en el
// formulario, la vista guardada y el PDF. Cada entrada lleva su propio label
// para no alterar los demás servicios (que siguen usando MATERIAL_LABELS global).
const MATERIALES_LENGUAJE = [
  { key: 'hojasBond',             label: '100 hojas bond' },
  { key: 'cartulinaDuplex',       label: '2 pliegos de cartulina dúplex' },
  { key: 'velcro',                label: '100 unidades Velcro adhesivo' },
  { key: 'folder',                label: '1 folder' },
  { key: 'guantes',               label: 'Guantes por sesión' },
  { key: 'bajalengua',            label: 'Paquete de bajalengua' },
  { key: 'hisoposPequenos',       label: 'Paquete de hisopos pequeños' },
  { key: 'hisoposLargos',         label: 'Paquete de hisopos largos' },
  { key: 'plumonesGruesos',       label: 'Estuche plumones gruesos' },
  { key: 'siliconaLiquida',       label: '1 silicona líquida mediana' },
  { key: 'cartulinaColores',      label: '1 pliego de cartulina color' },
  { key: 'fotos',                 label: 'Fotos' },
  { key: 'plumonIndeleble',       label: '1 plumón indeleble negro' },
  { key: 'cuadernoCuadriculado',  label: '1 cuaderno cuadriculado A4' },
  { key: 'cuadernoDecroly',       label: '1 cuaderno decroly' },
  { key: 'limpiatipo',            label: '1 limpia tipo' },
  { key: 'cintaEmbalaje',         label: '1 cinta de embalaje' },
];

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

  // ── TERAPIA DE LENGUAJE INFANTIL (area=1) — usa lista exacta de lenguaje ──
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
    materiales: MATERIALES_LENGUAJE,
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
    materiales: MATERIALES_LENGUAJE,
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
    materiales: MATERIALES_LENGUAJE,
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

  // ── ORIENTACIÓN VOCACIONAL / EVALUACIONES PSICOLÓGICAS ──
  // Cubre "Orientación Vocacional" (area Adolescentes id=6 y Adultos id=16),
  // "Evaluación para la Universidad" y "Evaluación Psicológica para Colegio".
  // No matcheaban ninguna config (el nombre no contiene 'psicolog'/'adolescente'),
  // por eso al terapeuta —con el servicio bloqueado— no le salían las opciones.
  // Usa el mismo contenido que Psicología Adolescentes. Todas las claves ya están
  // en buildFormInicial, así que no hay inputs no controlados.
  orientacion_vocacional: {
    match: (s) => {
      const n = s.nombre?.toLowerCase() || '';
      return n.includes('vocacional') || n.includes('evaluación') || n.includes('evaluacion');
    },
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
      { key: 'evitarConfrontacionesInmediatas', label: 'Evitar confrontaciones inmediatas después de la sesión; darle espacio para procesar lo trabajado.' },
      { key: 'respetarEspacioTerapeutico',      label: 'Respetar el espacio del evaluado, evitando presionarlo a contar lo que trabaja en consulta.' },
      { key: 'tenerPacienciaExpectativasRealistas', label: 'Tener paciencia y expectativas realistas; los resultados del proceso son graduales.' },
      { key: 'informarCambios',                 label: 'Informar sobre cualquier cambio emocional, médico o escolar relevante que pueda influir en el proceso.' },
      { key: 'cumplirTareasFamilia',            label: 'Cumplir con las tareas o pautas sugeridas por el profesional, cuando estas involucren a la familia.' },
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
  hojasBond:                     'Hojas bond (100 hojas)',
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
  // Materiales granulares de Terapia de Lenguaje (etiquetas exactas en MATERIALES_LENGUAJE)
  guantes:                       'Guantes por sesión',
  bajalengua:                    'Paquete de bajalengua',
  hisoposPequenos:               'Paquete de hisopos pequeños',
  hisoposLargos:                 'Paquete de hisopos largos',
  plumonesGruesos:               'Estuche plumones gruesos',
  cuadernoCuadriculado:          'Cuaderno cuadriculado A4',
  cuadernoDecroly:               'Cuaderno decroly',
};

// Las listas de materiales pueden ser strings (key con label global) u objetos
// { key, label } (label exacto por servicio, p. ej. Terapia de Lenguaje).
const matKey   = (m) => (typeof m === 'string' ? m : m.key);
const matLabel = (m) => (typeof m === 'string' ? MATERIAL_LABELS[m] : m.label);

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
    // Materiales granulares de Terapia de Lenguaje
    guantes: false, bajalengua: false, hisoposPequenos: false, hisoposLargos: false,
    plumonesGruesos: false, cuadernoCuadriculado: false, cuadernoDecroly: false,
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
  // Texto en escritura de cada campo "Otros" antes de agregarlo (uno por categoría/campo).
  const [nuevoOtro, setNuevoOtro] = useState({});

  // Los campos "Otros" se guardan como string con cada ítem separado por salto de
  // línea, para que en el PDF y la vista salga uno por línea.
  const splitOtros = (valor) => (valor ? valor.split('\n').filter(Boolean) : []);

  const otroKey = (category, field) => `${category}.${field}`;

  const agregarOtro = (category, field) => {
    const texto = (nuevoOtro[otroKey(category, field)] || '').trim();
    if (!texto) return;
    const actuales = splitOtros(formData[category][field]);
    handleCheckboxChange(category, field, [...actuales, texto].join('\n'));
    setNuevoOtro(prev => ({ ...prev, [otroKey(category, field)]: '' }));
  };

  const eliminarOtro = (category, field, idx) => {
    const actuales = splitOtros(formData[category][field]);
    handleCheckboxChange(category, field, actuales.filter((_, i) => i !== idx).join('\n'));
  };

  // Bloque "Otros": se agregan uno por uno y cada uno sale en su propia línea.
  const renderOtros = (category, field, placeholder = 'Otros...') => {
    const items = splitOtros(formData[category][field]);
    const key   = otroKey(category, field);
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <input type="text" value={nuevoOtro[key] || ''}
            onChange={(e) => setNuevoOtro(prev => ({ ...prev, [key]: e.target.value }))}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarOtro(category, field); } }}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-[#7B1FA2]/15 transition-shadow" />
          <button type="button" onClick={() => agregarOtro(category, field)}
            className="px-3 py-2 bg-[#7B1FA2] text-white rounded-lg hover:bg-[#6A1B9A] transition-all flex items-center gap-1.5 text-sm flex-shrink-0">
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>
        {items.length > 0 && (
          <ul className="space-y-1.5">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <span className="flex-1 text-sm text-gray-700 leading-snug">{item}</span>
                <button type="button" onClick={() => eliminarOtro(category, field, idx)}
                  className="p-1 hover:bg-red-50 rounded transition-colors flex-shrink-0">
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

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
      if (!formData.fecha)           return showMsg('Por favor selecciona la fecha de la indicación.', 'error');
      if (!formData.especialidad_id) return showMsg('Por favor selecciona la especialidad.', 'error');
      if (!formData.servicio_id)     return showMsg('Por favor selecciona el servicio.', 'error');
      if (!formData.citas.length)    return showMsg('Agrega al menos una cita antes de guardar.', 'error');

      // Validar que cada cita tenga sus campos obligatorios completos.
      for (let i = 0; i < formData.citas.length; i++) {
        const c = formData.citas[i];
        const numero = formData.citas.length > 1 ? ` ${i + 1}` : '';
        if (!c.tipoId)       return showMsg(`Falta seleccionar el tipo en la cita${numero}.`, 'error');
        if (!c.modalidadId)  return showMsg(`Falta seleccionar la modalidad en la cita${numero}.`, 'error');
        if (!c.frecuenciaId) return showMsg(`Falta seleccionar la frecuencia en la cita${numero}.`, 'error');
        if (!c.cantidadCitas) return showMsg(`Falta indicar la cantidad de citas en la cita${numero}.`, 'error');
      }

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
      // Detalle técnico solo en consola (para el desarrollador).
      console.error('Error al guardar indicación terapéutica:', error?.response?.data || error);

      // Mensaje amable para el usuario según el tipo de error.
      let mensaje = 'No se pudo guardar la indicación terapéutica. Por favor, inténtalo de nuevo.';
      if (error?.response?.status === 400) {
        mensaje = 'Hay datos incompletos o incorrectos en la indicación. Revisa los campos e inténtalo de nuevo.';
      } else if (error?.response?.status === 401 || error?.response?.status === 403) {
        mensaje = 'Tu sesión expiró o no tienes permiso para esta acción. Vuelve a iniciar sesión.';
      } else if (error?.response?.status >= 500) {
        mensaje = 'Ocurrió un problema en el servidor. Intenta nuevamente en unos minutos.';
      } else if (!error?.response) {
        mensaje = 'No se pudo conectar con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.';
      }
      showMsg(mensaje, 'error');
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
      showMsg('No se pudo generar el PDF. Por favor, inténtalo de nuevo.', 'error');
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
      showMsg('No se pudo mostrar la vista previa del PDF. Por favor, inténtalo de nuevo.', 'error');
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
      showMsg('No se pudo eliminar la indicación terapéutica. Por favor, inténtalo de nuevo.', 'error');
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
          className="w-full px-4 py-3 cx-glow bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-full flex items-center justify-center gap-2 font-semibold text-sm shadow-lg shadow-purple-500/30"
        >
          <Plus className="w-5 h-5" />
          Nueva Indicación Terapéutica
        </button>
      )}

      {/* ── Formulario ──────────────────────────────────── */}
      {mostrarFormulario && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-500/20">
                <ClipboardList className="w-[18px] h-[18px] text-white" />
              </span>
              <h3 className="text-base font-extrabold text-[#2D0A4E]">Nueva Indicación Terapéutica</h3>
            </div>
            <button onClick={() => setMostrarFormulario(false)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Datos generales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                Fecha de Indicación <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" value={formData.fecha}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-[#7B1FA2]/15 transition-shadow" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                Especialidad <span className="text-red-400">*</span>
              </label>
              <select value={formData.especialidad_id}
                onChange={(e) => setFormData(prev => ({ ...prev, especialidad_id: e.target.value }))}
                disabled={user?.rol?.id === ROLES.TERAPEUTA}
                className={`cx-select w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-[#7B1FA2]/15 transition-shadow ${
                  user?.rol?.id === ROLES.TERAPEUTA ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}>
                <option value="">Seleccionar...</option>
                {especialidades.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                Servicio <span className="text-red-400">*</span>
              </label>
              <select value={formData.servicio_id}
                onChange={(e) => setFormData(prev => ({ ...prev, servicio_id: e.target.value }))}
                disabled={user?.rol?.id === ROLES.TERAPEUTA}
                className={`cx-select w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-[#7B1FA2]/15 transition-shadow ${
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
              <h4 className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                <span className="w-1 h-4 rounded-full bg-gradient-to-b from-[#7B1FA2] to-[#9C27B0]" />
                Citas
              </h4>
              <button onClick={handleAgregarCita}
                className="px-4 py-2 bg-[#7B1FA2]/10 text-[#7B1FA2] rounded-full hover:bg-[#7B1FA2]/15 transition-all flex items-center gap-1.5 text-sm font-semibold">
                <Plus className="w-4 h-4" /> Agregar Cita
              </button>
            </div>
            <div className="space-y-4">
              {formData.citas.map((cita, index) => (
                <div key={index} className="bg-gray-50/70 border border-gray-100 rounded-xl p-4">
                  <div className="flex justify-end mb-3">
                    <button onClick={() => handleEliminarCita(index)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Tipo</label>
                      <select value={cita.tipoId} onChange={(e) => handleCitaChange(index, 'tipoId', e.target.value)}
                        className="cx-select w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-[#7B1FA2]/15 transition-shadow">
                        <option value="">Seleccionar...</option>
                        {tiposCita.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Modalidad</label>
                      <select value={cita.modalidadId} onChange={(e) => handleCitaChange(index, 'modalidadId', e.target.value)}
                        className="cx-select w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-[#7B1FA2]/15 transition-shadow">
                        <option value="">Seleccionar...</option>
                        {modalidades.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Cantidad de Citas</label>
                      <input type="number" value={cita.cantidadCitas}
                        onChange={(e) => handleCitaChange(index, 'cantidadCitas', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-[#7B1FA2]/15 transition-shadow"
                        min="1" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Frecuencia</label>
                      <select value={cita.frecuenciaId} onChange={(e) => handleCitaChange(index, 'frecuenciaId', e.target.value)}
                        className="cx-select w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-[#7B1FA2]/15 transition-shadow">
                        <option value="">Seleccionar...</option>
                        {frecuencias.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2 flex flex-wrap gap-3">
                      <label className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border cursor-pointer transition-colors ${cita.informeFisico ? 'border-[#7B1FA2] bg-purple-50 text-[#7B1FA2]' : 'border-gray-200 text-gray-600 hover:border-purple-200'}`}>
                        <input type="checkbox" checked={cita.informeFisico}
                          onChange={(e) => handleCitaChange(index, 'informeFisico', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 accent-[#7B1FA2]" />
                        <span className="text-sm font-semibold">Informe Físico</span>
                      </label>
                      <label className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border cursor-pointer transition-colors ${cita.informeVerbal ? 'border-[#7B1FA2] bg-purple-50 text-[#7B1FA2]' : 'border-gray-200 text-gray-600 hover:border-purple-200'}`}>
                        <input type="checkbox" checked={cita.informeVerbal}
                          onChange={(e) => handleCitaChange(index, 'informeVerbal', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 accent-[#7B1FA2]" />
                        <span className="text-sm font-semibold">Informe Verbal</span>
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
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-4">Referencias</h4>
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
                    <div className="mt-3">
                      {renderOtros('referencias', 'refExterOtros', 'Otra referencia...')}
                    </div>
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
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-4">Recomendaciones</h4>
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

                {/* Otros — se agregan uno por uno; cada uno sale en su propia línea en el PDF */}
                {renderOtros('recomendaciones', 'otros', 'Otra recomendación...')}
              </div>
            </div>
          )}

          {/* ── Materiales (depende del servicio) ────────── */}
          {formData.servicio_id && (
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-4">Materiales</h4>
              {configServicio ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {configServicio.materiales.map((m) => {
                    const key = matKey(m);
                    return (
                      <label key={key}
                        className={`flex items-start gap-2 cursor-pointer ${key === 'guantesBajalenguaHisoposCrema' ? 'col-span-2' : ''}`}>
                        <input type="checkbox" checked={formData.materiales[key]}
                          onChange={(e) => handleCheckboxChange('materiales', key, e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#7B1FA2] focus:ring-[#7B1FA2] flex-shrink-0" />
                        <span className="text-sm text-gray-700 leading-snug">{matLabel(m)}</span>
                      </label>
                    );
                  })}
                  <div className="col-span-2 md:col-span-3">
                    {renderOtros('materiales', 'otros', 'Otro material...')}
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
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
              Cancelar
            </button>
            <button onClick={handleGuardar} disabled={guardando}
              className="cx-glow px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] rounded-full disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 flex items-center gap-2">
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
            <div key={indicacion.id} className={`bg-white rounded-2xl overflow-hidden border transition-all ${
              expandedIndicaciones[indicacion.id]
                ? 'border-purple-200/70 shadow-[0_8px_24px_rgba(123,31,162,0.08)]'
                : 'border-gray-100 shadow-[0_1px_3px_rgba(16,24,40,0.04)] hover:shadow-[0_6px_18px_rgba(16,24,40,0.06)]'
            }`}>
              {/* Fila de cabecera */}
              <div className={`w-full p-4 flex items-center justify-between transition-colors ${expandedIndicaciones[indicacion.id] ? 'bg-purple-50/40' : 'hover:bg-gray-50/60'}`}>
                <button onClick={() => toggleExpandedIndicacion(indicacion.id)} className="flex items-center gap-3.5 flex-1 text-left min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-500/20">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                      {formatearFecha(indicacion.fecha)} — {indicacion.servicio?.nombre}
                    </h4>
                    <p className="text-xs text-gray-400">
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
                <div className="border-t border-gray-100 p-6 bg-white space-y-5">
                  {/* Datos generales */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Fecha</p>
                      <p className="text-sm font-semibold text-gray-800">{formatearFecha(indicacion.fecha)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Hora</p>
                      <p className="text-sm font-semibold text-gray-800">{indicacion.hora}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Especialidad</p>
                      <p className="text-sm font-semibold text-gray-800">{indicacion.especialidad?.nombre}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Servicio</p>
                      <p className="text-sm font-semibold text-gray-800">{indicacion.servicio?.nombre}</p>
                    </div>
                  </div>

                  {/* Citas */}
                  {indicacion.citas?.length > 0 && (
                    <div>
                      <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Citas</h5>
                      <div className="space-y-2">
                        {indicacion.citas.map((cita) => (
                          <div key={cita.id} className="bg-gray-50/70 border border-gray-100 rounded-xl p-3.5 text-sm">
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
                      <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Referencias</h5>
                      <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 space-y-3 text-sm">
                        {/* Internas */}
                        {cfgVista.referencias.internas.some(({ key }) => ref[key]) && (
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Internas</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                              {cfgVista.referencias.internas
                                .filter(({ key }) => ref[key])
                                .map(({ key, label }) => (
                                  <span key={key} className="inline-flex items-center gap-2 text-sm text-gray-700"><span className="w-1.5 h-1.5 rounded-full bg-[#7B1FA2] flex-shrink-0" />{label}</span>
                                ))}
                            </div>
                          </div>
                        )}
                        {/* Externas */}
                        {(cfgVista.referencias.externas.some(({ key }) => ref[key]) || ref.refExterOtros) && (
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Externas</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                              {cfgVista.referencias.externas
                                .filter(({ key }) => ref[key])
                                .map(({ key, label }) => (
                                  <span key={key} className="inline-flex items-center gap-2 text-sm text-gray-700"><span className="w-1.5 h-1.5 rounded-full bg-[#7B1FA2] flex-shrink-0" />{label}</span>
                                ))}
                              {ref.refExterOtros && ref.refExterOtros.split('\n').filter(Boolean).map((item, idx) => (
                                <span key={idx} className="inline-flex items-center gap-2 text-sm text-gray-700"><span className="w-1.5 h-1.5 rounded-full bg-[#7B1FA2] flex-shrink-0" />{item}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recomendaciones */}
                  {rec && (
                    <div>
                      <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Recomendaciones</h5>
                      <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        {/* Fijas */}
                        {RECOMENDACIONES_FIJAS.filter(({ key }) => rec[key]).map(({ key, label }) => (
                          <span key={key} className="inline-flex items-center gap-2 text-sm text-gray-700"><span className="w-1.5 h-1.5 rounded-full bg-[#7B1FA2] flex-shrink-0" />{label}</span>
                        ))}
                        {/* Específicas del servicio */}
                        {cfgVista && cfgVista.recomendaciones
                          .filter(({ key }) => rec[key])
                          .map(({ key, label }) => (
                            <span key={key} className="inline-flex items-center gap-2 text-sm text-gray-700"><span className="w-1.5 h-1.5 rounded-full bg-[#7B1FA2] flex-shrink-0" />{label}</span>
                          ))}
                        {rec.otros && rec.otros.split('\n').filter(Boolean).map((item, idx) => (
                          <span key={idx} className="inline-flex items-center gap-2 text-sm text-gray-700"><span className="w-1.5 h-1.5 rounded-full bg-[#7B1FA2] flex-shrink-0" />{item}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Materiales */}
                  {mat && cfgVista && (cfgVista.materiales.some(m => mat[matKey(m)]) || mat.otros) && (
                    <div>
                      <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Materiales</h5>
                      <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                          {cfgVista.materiales
                            .filter(m => mat[matKey(m)])
                            .map(m => (
                              <span key={matKey(m)} className="inline-flex items-center gap-2 text-sm text-gray-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#7B1FA2] flex-shrink-0" />
                                {matLabel(m)}
                              </span>
                            ))}
                          {mat.otros && mat.otros.split('\n').filter(Boolean).map((item, idx) => (
                            <span key={idx} className="inline-flex items-center gap-2 text-sm text-gray-700"><span className="w-1.5 h-1.5 rounded-full bg-[#7B1FA2] flex-shrink-0" />{item}</span>
                          ))}
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
            <div
              className="flex items-center justify-between px-5 py-3 border-b border-purple-100/60 flex-shrink-0"
              style={{ backgroundImage: 'radial-gradient(70% 140% at 100% 0%, rgba(123,31,162,.07) 0%, rgba(123,31,162,0) 60%), linear-gradient(120deg, #ffffff 0%, #fdfbff 60%, #faf6fe 100%)' }}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center shadow-sm shadow-purple-500/20 flex-shrink-0">
                  <FileText className="w-[18px] h-[18px] text-white" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-[#2D0A4E] leading-tight">Vista previa</h3>
                  <p className="text-[11px] text-gray-500 leading-tight">Indicación Terapéutica</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={previewUrl} download="IndicacionTerapeutica.pdf"
                  className="inline-flex items-center gap-2 cx-glow bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg shadow-purple-500/30 no-underline">
                  <Download size={16} /> Descargar
                </a>
                <button onClick={cerrarPreview}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/70 transition-colors">
                  <X size={20} />
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