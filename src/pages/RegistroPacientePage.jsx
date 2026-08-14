import React, { useState } from 'react';
import WizardRegistroPaciente from '../components/WizzardRegistroPaciente/WizzardRegistroPaciente';
import Reveal from '../components/public/Reveal';
import RevealText from '../components/public/RevealText';
import Decor from '../components/public/Decor';

const RegistroPacientePage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const nombrePaso = (n) => (
    n === 1 ? 'Datos Personales' :
    n === 2 ? 'Información de Contacto' :
    n === 3 ? 'Datos Médicos' :
    'Confirmación'
  );

  // Mensaje predeterminado para WhatsApp
  const mensajeWhatsApp = encodeURIComponent(
    `Hola, necesito ayuda con el registro de paciente.
Estoy en el Paso ${currentStep} de ${totalSteps} (${nombrePaso(currentStep)}).

¿Podrían asistirme?`
  );
  const urlWhatsApp = `https://wa.me/51957064401?text=${mensajeWhatsApp}`;

  const steps = [
    { num: 1, label: 'Datos Personales', icon: 'person-fill' },
    { num: 2, label: 'Contacto', icon: 'telephone-fill' },
    { num: 3, label: 'Información Médica', icon: 'heart-pulse' },
    { num: 4, label: 'Confirmar', icon: 'check-circle-fill' },
  ];

  const features = [
    { icon: 'bi-clipboard2-pulse-fill', title: 'Historia Clínica Digital', desc: 'Tu expediente médico seguro y organizado' },
    { icon: 'bi-calendar-check-fill', title: 'Seguimiento Continuo', desc: 'Control de tu evolución y citas programadas' },
    { icon: 'bi-person-fill-check', title: 'Atención Profesional', desc: 'Equipo especializado para tu tratamiento' },
  ];

  const HelpCard = ({ variant }) => (
    <div className={`rp-help rp-help--${variant}`}>
      <div className="rp-help-ic"><i className="bi bi-headset" /></div>
      <div className="rp-help-body">
        <strong>¿Necesitas ayuda?</strong>
        <span>Nuestro equipo está disponible para asistirte</span>
        <a href={urlWhatsApp} className="rp-help-btn" target="_blank" rel="noopener noreferrer">
          <i className="bi bi-whatsapp" /> Contactar por WhatsApp
        </a>
      </div>
    </div>
  );

  return (
    <main className="cx-page rp-page">
      {/* ===== Hero ===== */}
      <section className="cx-subhero rp-hero">
        <Decor variant="a" />
        <div className="cx-container">
          <Reveal className="cx-subhero-inner">
            <span className="cx-eyebrow"><i className="bi bi-shield-check" /> Información 100% segura</span>
            <RevealText as="h1" text="Registro de Paciente" />
            <p>Crea tu historia clínica en 4 pasos sencillos y seguros.</p>
            <div className="cx-contact-chips">
              <span><i className="bi bi-lock-fill" /> Datos protegidos</span>
              <span><i className="bi bi-list-check" /> Solo 4 pasos</span>
              <span><i className="bi bi-person-hearts" /> Atención humana</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== Cuerpo ===== */}
      <section className="cx-section rp-body">
        <div className="cx-container">
          <div className="rp-grid">

          {/* ===== Columna izquierda — beneficios (desktop) ===== */}
          <aside className="rp-intro">
            <Reveal>
              <span className="cx-eyebrow"><i className="bi bi-stars" /> Por qué registrarte</span>

              <div className="rp-highlight">
                <i className="bi bi-heart-pulse-fill" />
                <span>Da el primer paso hacia tu bienestar</span>
              </div>

              <ul className="rp-features">
                {features.map((f) => (
                  <li className="rp-feature" key={f.title}>
                    <span className="rp-feature-ic"><i className={`bi ${f.icon}`} /></span>
                    <div className="rp-feature-txt">
                      <h6>{f.title}</h6>
                      <p>{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <HelpCard variant="desktop" />
            </Reveal>
          </aside>

          {/* ===== Columna derecha — formulario ===== */}
          <section className="rp-form">
            {/* Progreso móvil */}
            <div className="rp-mhead">
              <div className="rp-mprogress">
                <div className="rp-mprogress-top">
                  <span className="rp-mstep">Paso {currentStep} <em>/ {totalSteps}</em></span>
                  <span className="rp-mlabel">{nombrePaso(currentStep)}</span>
                </div>
                <div className="rp-mbar">
                  <div className="rp-mbar-fill" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Panel glass del formulario */}
            <div className="rp-card">
              <span className="rp-card-glow" aria-hidden="true" />

              <div className="rp-form-head">
                <span className="rp-form-badge"><i className="bi bi-clipboard2-pulse-fill" /></span>
                <div>
                  <h3>Completa tu registro</h3>
                  <p>Paso {currentStep} de {totalSteps} · {nombrePaso(currentStep)}</p>
                </div>
              </div>

              {/* Progreso de pasos (desktop) */}
              <div className="rp-steps">
                {steps.map((step, index) => (
                  <React.Fragment key={step.num}>
                    <div className={`rp-step ${currentStep >= step.num ? 'is-done' : ''} ${currentStep === step.num ? 'is-current' : ''}`}>
                      <span className="rp-step-circle">
                        <i className={`bi bi-${step.icon}`} />
                      </span>
                      <span className="rp-step-label">{step.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <span className={`rp-step-line ${currentStep > step.num ? 'is-done' : ''}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <WizardRegistroPaciente
                onClose={() => {}}
                isPageView={true}
                onStepChange={setCurrentStep}
              />
            </div>

            {/* Ayuda (móvil) */}
            <HelpCard variant="mobile" />
          </section>

          </div>
        </div>
      </section>

      <style>{`
        /* ===== Base: fondo continuo glass + grano ===== */
        .cx-site .cx-page.rp-page {
          position: relative; min-height: 100vh;
          background:
            radial-gradient(96% 54% at 50% -8%, rgba(194, 99, 249, .13) 0%, transparent 58%),
            radial-gradient(80% 46% at 50% 108%, rgba(61, 123, 214, .10) 0%, transparent 60%),
            var(--cx-bg);
        }
        .cx-page.rp-page::after {
          content: ''; position: fixed; inset: 0; z-index: 50; pointer-events: none;
          opacity: .05; mix-blend-mode: soft-light;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .rp-hero { padding-bottom: clamp(18px, 3vw, 32px); }
        .cx-site .rp-hero .cx-subhero-inner { text-align: center; }
        .cx-site .rp-hero .cx-subhero-inner > p {
          color: var(--cx-ink-2); text-align: center; max-width: 600px; margin-left: auto; margin-right: auto;
        }
        .cx-page .rp-body { position: relative; z-index: 1; padding-top: clamp(16px, 2.5vw, 30px); padding-bottom: clamp(48px, 7vw, 84px); }
        .rp-grid { display: grid; grid-template-columns: 1fr; gap: clamp(24px, 4vw, 44px); align-items: start; }

        /* ===== Tipografía compartida ===== */
        .cx-site .rp-page .rp-title { font-size: clamp(1.9rem, 4vw, 2.9rem); line-height: 1.12; margin: 12px 0 14px; }
        .rp-accent {
          background: linear-gradient(120deg, #174ea6, #c263f9);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        .cx-site .rp-page .rp-lead { color: var(--cx-ink-2); font-size: 1.02rem; max-width: 560px; }

        /* ===== Columna intro (solo desktop) ===== */
        .rp-intro { display: none; }
        .rp-highlight {
          display: inline-flex; align-items: center; gap: 10px; margin: 22px 0 26px;
          padding: 11px 18px; border-radius: var(--cx-r-pill);
          background: rgba(255, 255, 255, .55);
          backdrop-filter: saturate(160%) blur(10px); -webkit-backdrop-filter: saturate(160%) blur(10px);
          border: 1px solid rgba(255, 255, 255, .6);
          box-shadow: 0 10px 24px -16px rgba(50, 20, 80, .34), inset 0 1px 0 rgba(255, 255, 255, .5);
          color: var(--cx-ink); font-weight: 700; font-size: .92rem;
        }
        .rp-highlight i { color: #e0912a; font-size: 1.1rem; }

        .rp-features { list-style: none; margin: 0 0 26px; padding: 0; display: flex; flex-direction: column; gap: 14px; }
        .rp-feature {
          display: flex; align-items: center; gap: 15px;
          padding: 16px 18px; border-radius: var(--cx-r-md);
          background: rgba(255, 255, 255, .5);
          backdrop-filter: saturate(160%) blur(12px); -webkit-backdrop-filter: saturate(160%) blur(12px);
          border: 1px solid rgba(255, 255, 255, .6);
          box-shadow: 0 1px 2px rgba(50, 20, 80, .05), 0 12px 28px -20px rgba(50, 20, 80, .28), inset 0 1px 0 rgba(255, 255, 255, .5);
          transition: transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s, border-color .3s;
        }
        .rp-feature:hover { transform: translateY(-4px); border-color: rgba(255, 255, 255, .9); box-shadow: 0 2px 4px rgba(50, 20, 80, .06), 0 22px 44px -22px rgba(50, 20, 80, .4), inset 0 1px 0 rgba(255, 255, 255, .6); }
        .rp-feature-ic {
          flex: 0 0 auto; width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center;
          color: #fff; font-size: 1.3rem; box-shadow: 0 10px 20px -10px rgba(50, 20, 80, .5);
        }
        .rp-feature:nth-child(1) .rp-feature-ic { background: linear-gradient(135deg, #3d7bd6, #174ea6); }
        .rp-feature:nth-child(2) .rp-feature-ic { background: linear-gradient(135deg, #c263f9, #a93ef0); }
        .rp-feature:nth-child(3) .rp-feature-ic { background: linear-gradient(135deg, #4fc08a, #2fa37a); }
        .cx-site .rp-feature-txt h6 { font-family: var(--cx-font); font-size: 1rem; font-weight: 700; color: var(--cx-ink); margin: 0 0 3px; }
        .rp-feature-txt p { margin: 0; color: var(--cx-muted); font-size: .88rem; line-height: 1.5; }

        /* ===== Tarjeta de ayuda (WhatsApp) ===== */
        .rp-help {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 18px 20px; border-radius: var(--cx-r-md);
          background: linear-gradient(135deg, rgba(37, 211, 102, .12), rgba(255, 255, 255, .5) 60%);
          backdrop-filter: saturate(160%) blur(12px); -webkit-backdrop-filter: saturate(160%) blur(12px);
          border: 1px solid rgba(255, 255, 255, .6);
          box-shadow: 0 14px 32px -22px rgba(50, 20, 80, .34), inset 0 1px 0 rgba(255, 255, 255, .5);
        }
        .rp-help-ic {
          flex: 0 0 auto; width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center;
          background: linear-gradient(135deg, #25d366, #128c4b); color: #fff; font-size: 1.25rem;
          box-shadow: 0 10px 20px -10px rgba(18, 140, 75, .7);
        }
        .rp-help-body { display: flex; flex-direction: column; gap: 3px; }
        .rp-help-body strong { color: var(--cx-ink); font-size: .98rem; font-weight: 700; }
        .rp-help-body span { color: var(--cx-muted); font-size: .86rem; }
        .rp-help-btn {
          display: inline-flex; align-items: center; gap: 8px; margin-top: 10px; align-self: flex-start;
          padding: 10px 18px; border-radius: var(--cx-r-pill);
          background: linear-gradient(120deg, #25d366, #128c4b); color: #fff; font-weight: 700; font-size: .88rem;
          box-shadow: 0 12px 24px -12px rgba(18, 140, 75, .7); transition: transform .25s, box-shadow .25s;
        }
        .rp-help-btn:hover { transform: translateY(-2px); box-shadow: 0 18px 32px -12px rgba(18, 140, 75, .8); }
        .rp-help--mobile { margin-top: 20px; }

        /* ===== Columna formulario ===== */
        .rp-mhead { text-align: center; margin-bottom: 20px; }
        .cx-site .rp-mhead .cx-eyebrow { justify-content: center; }
        .cx-site .rp-mhead .rp-lead { margin: 0 auto; }
        .rp-mprogress { max-width: 420px; margin: 18px auto 0; }
        .rp-mprogress-top { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px; }
        .rp-mstep { font-weight: 800; color: var(--cx-primary-700); font-size: 1.05rem; }
        .rp-mstep em { font-style: normal; color: var(--cx-muted); font-weight: 700; font-size: .9rem; }
        .rp-mlabel { color: var(--cx-ink-2); font-weight: 600; font-size: .86rem; }
        .rp-mbar { height: 8px; border-radius: var(--cx-r-pill); background: var(--cx-primary-100); overflow: hidden; }
        .rp-mbar-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #174ea6, #c263f9); transition: width .4s cubic-bezier(.2,.8,.2,1); }

        .rp-card {
          position: relative; z-index: 1; overflow: hidden;
          background:
            radial-gradient(120% 62% at 50% -8%, rgba(194, 99, 249, .2), transparent 62%),
            radial-gradient(120% 80% at 0% 100%, rgba(61, 123, 214, .15), transparent 60%),
            linear-gradient(180deg, rgba(255, 255, 255, .4), rgba(247, 243, 251, .5));
          backdrop-filter: saturate(180%) blur(22px); -webkit-backdrop-filter: saturate(180%) blur(22px);
          border: 1px solid rgba(255, 255, 255, .6); border-radius: var(--cx-r-xl);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, .7), 0 40px 84px -36px rgba(90, 70, 110, .3);
          padding: clamp(22px, 3vw, 38px);
          transition: transform .3s, box-shadow .3s;
        }
        .rp-card:focus-within { box-shadow: inset 0 1px 0 rgba(255, 255, 255, .85), 0 44px 84px -32px rgba(169, 62, 240, .42); }
        .rp-card > * { position: relative; z-index: 1; }
        /* Glow que reacciona al enfocar un campo (como en Contacto) */
        .rp-card-glow {
          position: absolute; top: -90px; right: -70px; width: 280px; height: 280px; border-radius: 50%; z-index: 0;
          background: radial-gradient(circle, rgba(194, 99, 249, .16), transparent 70%); pointer-events: none;
          transition: transform .6s ease, opacity .6s ease; opacity: .7;
        }
        .rp-card:focus-within .rp-card-glow { transform: scale(1.25) translate(-20px, 20px); opacity: 1; }

        /* Cabecera del panel (badge + título) — igual que Contacto */
        .rp-form-head { display: flex; align-items: center; gap: 15px; margin-bottom: 24px; }
        .rp-form-badge {
          flex: 0 0 auto; width: 52px; height: 52px; border-radius: 16px; display: grid; place-items: center;
          font-size: 1.4rem; color: #fff; background: linear-gradient(135deg, var(--cx-primary), var(--cx-primary-600));
          box-shadow: 0 14px 26px -12px rgba(169, 62, 240, .65);
        }
        .cx-site .rp-form-head h3 { font-family: var(--cx-font); font-weight: 700; font-size: 1.22rem; color: var(--cx-ink); margin: 0 0 4px; }
        .rp-form-head p { color: var(--cx-muted); font-size: .92rem; margin: 0; }

        .rp-form { position: relative; }

        /* Progreso de pasos (desktop) */
        .rp-steps { display: none; align-items: center; margin-bottom: 26px; }
        .rp-step { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 0 0 auto; }
        .rp-step-circle {
          width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center;
          background: rgba(255, 255, 255, .7); border: 1.5px solid var(--cx-line); color: var(--cx-muted); font-size: 1.15rem;
          transition: all .35s cubic-bezier(.2,.8,.2,1);
        }
        .rp-step.is-done .rp-step-circle {
          background: linear-gradient(135deg, #174ea6, #c263f9); border-color: transparent; color: #fff;
          box-shadow: 0 12px 24px -10px rgba(120, 40, 160, .55);
        }
        .rp-step.is-current .rp-step-circle { transform: scale(1.08); box-shadow: 0 0 0 6px rgba(194, 99, 249, .18), 0 12px 24px -10px rgba(120, 40, 160, .55); }
        .rp-step-label { font-size: .8rem; font-weight: 700; color: var(--cx-muted); white-space: nowrap; transition: color .3s; }
        .rp-step.is-current .rp-step-label { color: var(--cx-primary-700); }
        .rp-step.is-done .rp-step-label { color: var(--cx-ink); }
        .rp-step-line { flex: 1; height: 2.5px; margin: 0 10px 24px; border-radius: var(--cx-r-pill); background: var(--cx-line); transition: background .4s; }
        .rp-step-line.is-done { background: linear-gradient(90deg, #174ea6, #c263f9); }

        /* ===== Renovación del formulario (wizard) — estética de Contacto =====
           Scopeado a la página: NO toca global.css ni otros formularios del sitio. */
        /* 1) Sin tarjeta blanca interna: el panel es .rp-card */
        .cx-site .rp-page .wizard-registro-container .personal-data-form,
        .cx-site .rp-page .wizard-registro-container .additional-info-form,
        .cx-site .rp-page .wizard-registro-container .medical-info-form,
        .cx-site .rp-page .wizard-registro-container .consent-form {
          background: transparent; border: 0; box-shadow: none; padding: 0; border-radius: 0;
        }
        .cx-site .rp-page .wizard-registro-container .form-section { padding: 0; }

        /* 2) Títulos de sección */
        .cx-site .rp-page .wizard-registro-container .form-section-title {
          font-family: var(--cx-font); font-weight: 700; font-size: 1.05rem; color: var(--cx-ink); margin-bottom: 1.1rem;
        }
        .cx-site .rp-page .wizard-registro-container .form-section-title i { color: var(--cx-primary-700); }

        /* 3) Labels */
        .cx-site .rp-page .wizard-registro-container .form-label {
          font-family: var(--cx-font); font-size: .84rem; font-weight: 600; color: var(--cx-ink); margin-bottom: 7px;
        }

        /* 4) Inputs, selects y textareas (receta cx-input) */
        .cx-site .rp-page .wizard-registro-container .form-control,
        .cx-site .rp-page .wizard-registro-container .form-select {
          background: rgba(255, 255, 255, .7);
          border: 1.5px solid rgba(236, 227, 216, .9);
          border-radius: var(--cx-r-sm);
          padding: 12px 15px; font-size: .95rem; font-family: var(--cx-font); color: var(--cx-ink);
          transition: border-color .2s, box-shadow .2s, background-color .2s;
        }
        .cx-site .rp-page .wizard-registro-container .form-control::placeholder { color: var(--cx-muted); }
        .cx-site .rp-page .wizard-registro-container .form-control:focus,
        .cx-site .rp-page .wizard-registro-container .form-select:focus {
          border-color: var(--cx-primary); background-color: #fff; box-shadow: var(--cx-ring); outline: 0;
        }
        .cx-site .rp-page .wizard-registro-container .form-select {
          appearance: none; -webkit-appearance: none; cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%238d288f'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center; background-size: 14px; padding-right: 40px;
        }
        .cx-site .rp-page .wizard-registro-container textarea.form-control { min-height: 120px; line-height: 1.6; resize: vertical; }

        /* 5) Botones de navegación */
        .cx-site .rp-page .wizard-registro-container .btn-next,
        .cx-site .rp-page .wizard-registro-container .btn-back,
        .cx-site .rp-page .wizard-registro-container .btn-finish {
          border-radius: var(--cx-r-pill); padding: 12px 26px; font-family: var(--cx-font); font-weight: 700; font-size: .95rem;
          transition: transform .25s, box-shadow .25s, background-color .25s, border-color .25s, color .25s;
        }
        .cx-site .rp-page .wizard-registro-container .btn-next {
          background: linear-gradient(120deg, var(--cx-primary), var(--cx-primary-600)); border: 0; color: #fff;
          box-shadow: 0 12px 24px -12px rgba(169, 62, 240, .6);
        }
        .cx-site .rp-page .wizard-registro-container .btn-next:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 18px 34px -12px rgba(169, 62, 240, .72); }
        .cx-site .rp-page .wizard-registro-container .btn-back {
          background: rgba(255, 255, 255, .7); border: 1.5px solid var(--cx-line); color: var(--cx-ink);
        }
        .cx-site .rp-page .wizard-registro-container .btn-back:hover { border-color: var(--cx-primary-200); color: var(--cx-primary-700); background: #fff; transform: translateY(-2px); }
        .cx-site .rp-page .wizard-registro-container .btn-finish {
          background: linear-gradient(135deg, #34c77b, #2fa37a); border: 0; color: #fff;
          box-shadow: 0 12px 24px -12px rgba(47, 163, 122, .6);
        }
        .cx-site .rp-page .wizard-registro-container .btn-finish:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 18px 34px -12px rgba(47, 163, 122, .72); }

        /* ===== Desktop: dos columnas ===== */
        @media (min-width: 992px) {
          .rp-grid { grid-template-columns: minmax(0, 380px) minmax(0, 1fr); gap: clamp(28px, 3.5vw, 48px); }
          .rp-intro { display: block; position: sticky; top: 108px; }
          .rp-mhead { display: none; }
          .rp-help--mobile { display: none; }
          .rp-steps { display: flex; }
        }
        @media (min-width: 1200px) {
          .cx-site .rp-body .cx-container { max-width: 1200px; }
        }

        @media (max-width: 380px) {
          .rp-card { padding: 16px; }
        }
      `}</style>
    </main>
  );
};

export default RegistroPacientePage;
