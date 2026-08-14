// Estilos compartidos para Libro de Reclamaciones — renovados al lenguaje glass/cx
export const libroReclamacionesStyles = `
/* Unifica el acento con la paleta del sitio */
.lr-page-header, .lr-section { --accent-color: #a93ef0; }

/* ===== Header / Hero ===== */
.lr-page-header {
  position: relative;
  text-align: center;
  padding: clamp(118px, 15vw, 168px) 20px clamp(38px, 6vw, 60px);
  overflow: clip;
  color: var(--cx-ink, #3a2b4a);
  background:
    radial-gradient(78% 120% at 50% -12%, var(--cx-primary-050, #f7f3fb), transparent 62%),
    linear-gradient(180deg, var(--cx-bg-alt, #f2ecf5) 0%, var(--cx-bg, #fbf8f3) 100%);
}
.lr-page-header::before { display: none; }
.lr-page-header .container { position: relative; z-index: 2; max-width: 900px; }
.lr-page-header h1 {
  font-family: var(--cx-display, 'Fraunces', serif); font-weight: 400;
  font-size: clamp(2rem, 4vw, 3rem); letter-spacing: -0.01em; line-height: 1.14;
  margin-bottom: 12px; color: var(--cx-ink, #3a2b4a);
}
.lr-page-header .subtitle { font-size: 1.05rem; color: var(--cx-muted, #8a7f96); margin: 0; opacity: 1; }

/* ===== Sección de contenido ===== */
.lr-section {
  position: relative;
  padding: clamp(28px, 4vw, 50px) 0 clamp(48px, 7vw, 84px);
  background:
    radial-gradient(70% 42% at 50% 118%, rgba(61, 123, 214, .08), transparent 60%),
    var(--cx-bg, #fbf8f3);
}
.lr-wrapper { max-width: 920px; margin: 0 auto; }

/* ===== Nota intro ===== */
.lr-intro {
  font-size: .95rem; line-height: 1.65; color: var(--cx-ink-2, #5a4e66);
  background: var(--cx-primary-050, #f7f3fb); border: 1px solid var(--cx-primary-100, #efe7f5);
  border-radius: var(--cx-r-md, 20px); padding: 18px 22px; margin-bottom: clamp(22px, 3vw, 34px);
}
.lr-intro strong { color: var(--cx-ink, #3a2b4a); font-weight: 700; }

/* ===== Bloques (tarjetas glass) ===== */
.lr-item {
  margin-bottom: 20px; padding: clamp(20px, 2.6vw, 30px);
  background: rgba(255, 255, 255, .5);
  -webkit-backdrop-filter: saturate(160%) blur(14px); backdrop-filter: saturate(160%) blur(14px);
  border: 1px solid rgba(255, 255, 255, .6); border-radius: var(--cx-r-lg, 28px);
  box-shadow: 0 1px 2px rgba(50, 20, 80, .05), 0 12px 28px -18px rgba(50, 20, 80, .2), inset 0 1px 0 rgba(255, 255, 255, .5);
}
.lr-item h3 {
  display: flex; align-items: center; gap: 11px;
  font-family: var(--cx-font, sans-serif); color: var(--cx-ink, #3a2b4a);
  font-size: 1.12rem; font-weight: 700; margin: 0 0 16px; line-height: 1.3;
}
.lr-item h3::before {
  content: attr(data-numero); flex: 0 0 auto;
  display: inline-grid; place-items: center; width: 32px; height: 32px; border-radius: 10px;
  background: linear-gradient(135deg, var(--cx-primary, #c263f9), var(--cx-primary-600, #a93ef0));
  color: #fff; font-size: .92rem; font-weight: 800;
  box-shadow: 0 8px 16px -8px rgba(169, 62, 240, .55);
}
.lr-item p { color: var(--cx-ink-2, #5a4e66); font-size: .93rem; line-height: 1.6; margin-bottom: 8px; }

/* ===== Formulario multi-sección = UN SOLO panel (enumerado pero unificado) ===== */
.lr-wrapper > form {
  position: relative; overflow: hidden;
  background:
    radial-gradient(120% 55% at 50% -6%, rgba(194, 99, 249, .16), transparent 60%),
    radial-gradient(120% 80% at 0% 100%, rgba(61, 123, 214, .12), transparent 60%),
    linear-gradient(180deg, rgba(255, 255, 255, .42), rgba(247, 243, 251, .5));
  -webkit-backdrop-filter: saturate(180%) blur(20px); backdrop-filter: saturate(180%) blur(20px);
  border: 1px solid rgba(255, 255, 255, .6); border-radius: var(--cx-r-xl, 36px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .7), 0 40px 84px -36px rgba(90, 70, 110, .3);
  padding: clamp(22px, 3vw, 38px);
}
/* Las secciones dejan de ser cards: quedan como partes de un mismo panel, con divisor sutil */
.lr-wrapper > form > .lr-item {
  background: none; -webkit-backdrop-filter: none; backdrop-filter: none;
  border: 0; box-shadow: none; border-radius: 0; padding: 0; margin: 0;
  padding-top: clamp(22px, 3vw, 30px); margin-top: clamp(22px, 3vw, 30px);
  border-top: 1px solid var(--cx-line, #ece3d8);
}
.lr-wrapper > form > .lr-item:first-child { padding-top: 0; margin-top: 0; border-top: 0; }
.lr-wrapper > form > .lr-error { margin-top: 22px; margin-bottom: 0; }
.lr-wrapper > form > .lr-submit { margin-top: 24px; }

/* ===== Panel unificado (consulta / resultado) ===== */
.lr-panel {
  position: relative; overflow: hidden; margin-bottom: 20px;
  background:
    radial-gradient(120% 55% at 50% -6%, rgba(194, 99, 249, .16), transparent 60%),
    radial-gradient(120% 80% at 0% 100%, rgba(61, 123, 214, .12), transparent 60%),
    linear-gradient(180deg, rgba(255, 255, 255, .42), rgba(247, 243, 251, .5));
  -webkit-backdrop-filter: saturate(180%) blur(20px); backdrop-filter: saturate(180%) blur(20px);
  border: 1px solid rgba(255, 255, 255, .6); border-radius: var(--cx-r-xl, 36px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .7), 0 40px 84px -36px rgba(90, 70, 110, .3);
  padding: clamp(22px, 3vw, 38px);
}
/* Los bloques internos dejan de ser cards: son secciones del mismo panel */
.lr-panel > .lr-resultado-header,
.lr-panel > .lr-info-card,
.lr-panel > .lr-item {
  background: none; -webkit-backdrop-filter: none; backdrop-filter: none;
  border: 0; box-shadow: none; border-radius: 0; padding: 0; margin: 0;
}
.lr-panel > * + * { margin-top: clamp(20px, 3vw, 28px); padding-top: clamp(20px, 3vw, 28px); border-top: 1px solid var(--cx-line, #ece3d8); }
.lr-panel .lr-resultado-header { margin: 0; }

/* Encabezados sin número: sin chip vacío */
.lr-item h3:not([data-numero])::before,
.lr-resultado-header h3:not([data-numero])::before { content: none; }
.lr-panel .lr-resultado-header h3 { font-size: 1.25rem; }

/* ===== Listas ===== */
.lr-list { list-style: none; padding: 0; margin: 8px 0; display: flex; flex-direction: column; gap: 8px; }
.lr-list li { position: relative; padding: 0 0 0 18px; color: var(--cx-ink-2, #5a4e66); font-size: .93rem; line-height: 1.55; }
.lr-list li::before {
  content: ''; position: absolute; left: 0; top: 8px; width: 7px; height: 7px; border-radius: 50%;
  background: linear-gradient(135deg, var(--cx-primary, #c263f9), var(--cx-peach, #f0d6c4));
}
.lr-list strong { color: var(--cx-ink, #3a2b4a); font-weight: 700; }

.lr-nota {
  padding-left: 14px; border-left: 2px solid var(--cx-primary-200, #e3d5ef);
  font-style: italic; color: var(--cx-muted, #8a7f96); font-size: .87rem; line-height: 1.5;
}

.lr-pending-box { background: #fffbeb; border: 1px solid #fde68a; padding: 16px; border-radius: var(--cx-r-sm, 14px); margin: 10px 0; }
.lr-pending-box p { margin-bottom: 10px; color: #92400e; font-size: .92rem; line-height: 1.6; }
.lr-pending-box p:last-child { margin-bottom: 0; }

/* ===== Tarjeta de info (consultar) ===== */
.lr-info-card {
  background: rgba(255, 255, 255, .5);
  -webkit-backdrop-filter: saturate(160%) blur(14px); backdrop-filter: saturate(160%) blur(14px);
  border: 1px solid rgba(255, 255, 255, .6); border-radius: var(--cx-r-lg, 28px);
  padding: clamp(20px, 2.6vw, 28px); margin-bottom: 22px;
  box-shadow: 0 1px 2px rgba(50, 20, 80, .05), 0 12px 28px -18px rgba(50, 20, 80, .2), inset 0 1px 0 rgba(255, 255, 255, .5);
}
.lr-info-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 1px solid var(--cx-line, #ece3d8); margin-bottom: 20px; flex-wrap: wrap; gap: 15px; }
.lr-codigo-grande { font-size: 1.8rem; font-weight: 800; color: var(--cx-primary-700, #8d288f); margin: 5px 0 0; line-height: 1; letter-spacing: .02em; }
.lr-estado-badge-grande { padding: 8px 20px; border-radius: var(--cx-r-pill, 999px); font-size: .95rem; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; }
.lr-info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
.lr-info-item { display: flex; flex-direction: column; gap: 6px; }
.lr-info-label { font-size: .78rem; font-weight: 700; color: var(--cx-muted, #8a7f96); text-transform: uppercase; letter-spacing: .05em; }
.lr-info-value { font-size: 1.02rem; font-weight: 700; color: var(--cx-ink, #3a2b4a); }

/* ===== Timeline ===== */
.lr-timeline { display: flex; justify-content: space-between; position: relative; margin: 30px 0; }
.lr-timeline::before { content: ''; position: absolute; top: 20px; left: 40px; right: 40px; height: 3px; background: var(--cx-line, #ece3d8); z-index: 0; }
.lr-timeline-step { flex: 1; position: relative; text-align: center; opacity: .4; transition: opacity .3s; }
.lr-timeline-step.active { opacity: 1; }
.lr-timeline-marker { width: 40px; height: 40px; margin: 0 auto 12px; border-radius: 50%; background: var(--cx-line, #ece3d8); border: 3px solid #fff; position: relative; z-index: 1; transition: all .3s; }
.lr-timeline-step.active .lr-timeline-marker { background: linear-gradient(135deg, var(--cx-primary, #c263f9), var(--cx-primary-600, #a93ef0)); box-shadow: 0 0 0 5px rgba(194, 99, 249, .18); }
.lr-timeline-content h4 { font-family: var(--cx-font, sans-serif); font-size: .95rem; font-weight: 700; color: var(--cx-ink, #3a2b4a); margin: 0 0 4px; line-height: 1.2; }
.lr-timeline-content p { font-size: .82rem; color: var(--cx-muted, #8a7f96); margin: 0; line-height: 1.4; }

/* ===== Campos de formulario (receta cx-input) ===== */
.lr-label { display: block; font-family: var(--cx-font, sans-serif); font-size: .84rem; font-weight: 600; color: var(--cx-ink, #3a2b4a); margin-bottom: 7px; }
.lr-req { color: #d6446b; font-weight: 700; }
.lr-input {
  width: 100%; padding: 12px 15px; border: 1.5px solid rgba(236, 227, 216, .9);
  border-radius: var(--cx-r-sm, 14px); font-size: .94rem; color: var(--cx-ink, #3a2b4a);
  background: rgba(255, 255, 255, .7); font-family: var(--cx-font, sans-serif);
  transition: border-color .2s, box-shadow .2s, background-color .2s; outline: none; resize: vertical;
}
.lr-input::placeholder { color: var(--cx-muted, #8a7f96); }
.lr-input:focus { border-color: var(--cx-primary, #c263f9); background-color: #fff; box-shadow: var(--cx-ring, 0 0 0 6px rgba(185,166,207,.18)); }
.lr-input[type="file"] { padding: 10px 14px; cursor: pointer; }
.lr-hint-text { font-size: .85rem; color: var(--cx-muted, #8a7f96); margin: 0; }

/* ===== Selector Reclamo/Queja ===== */
.lr-tipo-grupo { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 6px; }
.lr-tipo-opcion {
  display: flex; align-items: flex-start; gap: 11px; padding: 14px 16px;
  border: 1.5px solid rgba(236, 227, 216, .9); border-radius: var(--cx-r-sm, 14px);
  background: rgba(255, 255, 255, .55); cursor: pointer; transition: border-color .2s, background .2s, box-shadow .2s;
}
.lr-tipo-opcion:hover { border-color: var(--cx-primary-200, #e3d5ef); }
.lr-tipo-opcion.activo { border-color: var(--cx-primary, #c263f9); background: var(--cx-primary-050, #f7f3fb); box-shadow: var(--cx-ring, 0 0 0 6px rgba(185,166,207,.18)); }
.lr-tipo-opcion input[type="radio"] { margin-top: 3px; accent-color: var(--cx-primary-600, #a93ef0); flex-shrink: 0; }
.lr-tipo-opcion div { display: flex; flex-direction: column; gap: 2px; }
.lr-tipo-opcion strong { font-size: .92rem; color: var(--cx-ink, #3a2b4a); }
.lr-tipo-opcion span { font-size: .8rem; color: var(--cx-muted, #8a7f96); line-height: 1.35; }

/* ===== Checkboxes de consentimiento ===== */
.lr-check-wrap { display: flex; align-items: flex-start; gap: 11px; cursor: pointer; }
.lr-check-wrap input[type="checkbox"] { width: 17px; height: 17px; margin-top: 3px; flex-shrink: 0; accent-color: var(--cx-primary-600, #a93ef0); }
.lr-check-wrap span { font-size: .9rem; color: var(--cx-ink-2, #5a4e66); line-height: 1.55; }
.lr-check-wrap strong { color: var(--cx-ink, #3a2b4a); }

/* ===== Archivos ===== */
.lr-archivos-lista { list-style: none; padding: 0; margin: 12px 0 0; border-top: 1px solid var(--cx-line, #ece3d8); }
.lr-archivos-lista li { display: flex; align-items: center; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid var(--cx-line, #ece3d8); font-size: .88rem; color: var(--cx-ink-2, #5a4e66); }
.lr-archivos-lista small { color: var(--cx-muted, #8a7f96); margin-left: 6px; }
.lr-quitar { background: none; border: none; color: #d6446b; font-size: .82rem; cursor: pointer; padding: 0; font-family: inherit; font-weight: 600; transition: color .2s; }
.lr-quitar:hover { color: #a3312f; }

/* ===== Error ===== */
.lr-error { background: #fbe4e4; border-left: 3px solid #d6446b; padding: 13px 18px; border-radius: var(--cx-r-sm, 14px); color: #8a2a28; font-size: .9rem; margin-bottom: 20px; }

/* ===== Submit ===== */
.lr-submit { margin-top: 12px; }

/* ===== Botón primario (dentro del Libro) ===== */
.lr-section .btn-custom, .lr-item .btn-custom, .lr-acciones-finales .btn-custom, .lr-submit .btn-custom {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  border: 0; border-radius: var(--cx-r-pill, 999px); padding: 13px 26px; cursor: pointer;
  background: linear-gradient(120deg, var(--cx-primary, #c263f9), var(--cx-primary-600, #a93ef0)); color: #fff;
  font-family: var(--cx-font, sans-serif); font-weight: 700; font-size: .95rem;
  box-shadow: 0 12px 24px -12px rgba(169, 62, 240, .6); transition: transform .25s, box-shadow .25s;
}
.lr-section .btn-custom:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 18px 34px -12px rgba(169, 62, 240, .72); }
.lr-section .btn-custom:disabled { opacity: .7; cursor: not-allowed; }

/* ===== Código de reclamo ===== */
.lr-codigo-box {
  display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center;
  padding: 22px 20px; border-radius: var(--cx-r-md, 20px); margin: 16px 0;
  background: var(--cx-primary-050, #f7f3fb); border: 1px dashed var(--cx-primary-200, #e3d5ef);
}
.lr-codigo-label { font-size: .76rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--cx-muted, #8a7f96); }
.lr-codigo-valor { font-family: 'Courier New', monospace; font-size: 1.8rem; font-weight: 800; color: var(--cx-primary-700, #8d288f); letter-spacing: .06em; }
.lr-codigo-hint { font-size: .82rem; color: var(--cx-muted, #8a7f96); }

.lr-acciones-finales { margin-top: 20px; display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }

.lr-resultado-header { display: flex; align-items: baseline; gap: 14px; margin-bottom: 20px; flex-wrap: wrap; }
.lr-resultado-header h3 { font-family: var(--cx-font, sans-serif); color: var(--cx-ink, #3a2b4a); font-size: 1.15rem; font-weight: 700; margin: 0; line-height: 1.3; }
.lr-estado-badge { padding: 4px 14px; border-radius: var(--cx-r-pill, 999px); font-size: .82rem; font-weight: 700; }
.lr-codigo-inline { font-weight: 800; color: var(--cx-primary-700, #8d288f); font-size: 1rem; }
.lr-texto-largo { font-size: .92rem; color: var(--cx-ink-2, #5a4e66); line-height: 1.65; white-space: pre-wrap; margin: 6px 0 0; padding-left: 14px; border-left: 2px solid var(--cx-primary-200, #e3d5ef); }

/* ===== Acciones (filas con botón) ===== */
.lr-acciones { display: flex; flex-direction: column; gap: 4px; margin-top: 10px; }
.lr-accion-fila { display: flex; align-items: center; gap: 20px; padding: 16px 0; border-bottom: 1px solid var(--cx-line, #ece3d8); flex-wrap: wrap; }
.lr-accion-fila:last-child { border-bottom: none; }
.lr-accion-texto { flex: 1; min-width: 220px; }
.lr-accion-texto strong { display: block; font-size: .96rem; color: var(--cx-ink, #3a2b4a); margin-bottom: 3px; }
.lr-accion-texto span { font-size: .85rem; color: var(--cx-muted, #8a7f96); line-height: 1.45; }

/* ===== Botón secundario ===== */
.lr-btn-secundario {
  display: inline-flex; align-items: center; gap: 7px; padding: 11px 22px;
  border: 1.5px solid var(--cx-line, #ece3d8); border-radius: var(--cx-r-pill, 999px);
  background: rgba(255, 255, 255, .7); color: var(--cx-ink, #3a2b4a);
  font-size: .9rem; font-weight: 700; cursor: pointer; font-family: var(--cx-font, sans-serif);
  white-space: nowrap; text-decoration: none; transition: border-color .2s, color .2s, transform .2s, background .2s;
}
.lr-btn-secundario:hover { border-color: var(--cx-primary-200, #e3d5ef); color: var(--cx-primary-700, #8d288f); background: #fff; transform: translateY(-2px); }

@media (max-width: 768px) {
  .lr-page-header { padding: clamp(104px, 22vw, 128px) 20px 52px; }
  .lr-page-header h1 { font-size: 1.9rem; }
  .lr-codigo-grande { font-size: 1.4rem; }
  .lr-info-header { flex-direction: column; align-items: stretch; }
  .lr-estado-badge-grande { text-align: center; }
  .lr-timeline { flex-direction: column; }
  .lr-timeline::before { top: 20px; bottom: 20px; left: 19px; right: auto; width: 3px; height: auto; }
  .lr-timeline-step { text-align: left; padding-left: 60px; margin-bottom: 30px; }
  .lr-timeline-step:last-child { margin-bottom: 0; }
  .lr-timeline-marker { position: absolute; left: 0; top: 0; }
  .lr-accion-fila { flex-direction: column; align-items: flex-start; gap: 10px; }
  .lr-tipo-grupo { grid-template-columns: 1fr; }
  .lr-acciones-finales { flex-direction: column; align-items: stretch; }
  .lr-btn-secundario { justify-content: center; }
}
`;
