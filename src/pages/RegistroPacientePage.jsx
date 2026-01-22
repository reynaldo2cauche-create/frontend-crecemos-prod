import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import WizardRegistroPaciente from '../components/WizzardRegistroPaciente/WizzardRegistroPaciente';
import '../styles/global.css';

const RegistroPacientePage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  return (
    <div className="registro-paciente-page">
      {/* Partículas decorativas de fondo */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      <Container fluid>
        <Row className="g-0 min-vh-100">
          
          {/* Columna izquierda - Información (Solo Desktop) */}
          <Col lg={5} className="d-none d-lg-flex position-relative intro-column">
            <div className="intro-section">
              
              {/* Badge animado */}
              <div className="company-badge mb-4">
                <div className="badge-glow"></div>
                <i className="bi bi-shield-check me-2"></i>
                <span>Información 100% Segura</span>
              </div>

              {/* Título principal con efecto gradient */}
              <h1 className="intro-title mb-4">
                Registro de <br />
                <span className="accent-text">
                  Paciente
                  <svg className="title-underline" viewBox="0 0 200 12">
                    <path d="M0,6 Q50,0 100,6 T200,6" stroke="url(#gradient)" strokeWidth="3" fill="none"/>
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#174ea6" />
                        <stop offset="100%" stopColor="#c263f9" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              {/* Descripción con mejor formato */}
              <div className="intro-description mb-5">
                <p className="intro-text mb-3">
                  Bienvenido al Registro de Paciente.
                  Para iniciar su atención, complete el formulario con sus datos.
                  Si requiere apoyo especial durante el registro, indíquelo para brindarle una atención adecuada.
                </p>
                <div className="highlight-box">
                  <i className="bi bi-stars"></i>
                  <span>Da el primer paso hacia tu bienestar</span>
                </div>
              </div>

             {/* Features mejoradas con animación - ICONOS CORREGIDOS */}
              <div className="features-list mb-5">
                <div className="feature-item">
                  <div className="feature-icon">
                    <div className="icon-bg"></div>
                    <i className="bi bi-clipboard2-pulse-fill"></i>
                  </div>
                  <div className="feature-content">
                    <h6>Historia Clínica Digital</h6>
                    <p>Tu expediente médico seguro y organizado</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">
                    <div className="icon-bg"></div>
                    <i className="bi bi-calendar-check-fill"></i>
                  </div>
                  <div className="feature-content">
                    <h6>Seguimiento Continuo</h6>
                    <p>Control de tu evolución y citas programadas</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">
                    <div className="icon-bg"></div>
                    <i className="bi bi-person-fill-check"></i>

                  </div>
                  <div className="feature-content">
                    <h6>Atención Profesional</h6>
                    <p>Equipo especializado para tu tratamiento</p>
                  </div>
                </div>
              </div>

              {/* Call to Action - EN LA IZQUIERDA */}
              <div className="help-card-left">
                <div className="help-icon-wrapper">
                  <i className="bi bi-headset"></i>
                </div>
                <div className="help-content-left">
                  <p className="help-title-left">¿Necesitas ayuda?</p>
                  <p className="help-text-left">Nuestro equipo está disponible para asistirte</p>
                  <a href="https://wa.me/51999999999" className="help-button-left" target="_blank" rel="noopener noreferrer">
                    <i className="bi bi-whatsapp me-2"></i>
                    Contactar por WhatsApp
                  </a>
                </div>
              </div>

            </div>
          </Col>

          {/* Columna derecha - Formulario */}
          <Col xs={12} lg={7} className="d-flex align-items-center form-column">
            <div className="form-section w-100">
              
              {/* Header Mobile mejorado */}
              <div className="d-lg-none mobile-header text-center mb-4">
                <div className="mobile-badge mb-3">
                  <i className="bi bi-clipboard2-pulse me-2"></i>
                  <span>Registro en el Sistema</span>
                </div>
                <h2 className="mobile-title mb-2">
                  Registro de Paciente
                </h2>
                <p className="mobile-subtitle mb-4">
                  Crea tu historia clínica en 4 pasos
                </p>
                
                {/* Progress Mobile - Solo muestra paso actual */}
                <div className="mobile-progress">
                  <div className="progress-step-indicator">
                    <span className="step-number">{currentStep}</span>
                    <span className="step-separator">/</span>
                    <span className="step-total">{totalSteps}</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    ></div>
                  </div>
                  <p className="progress-label">Paso {currentStep}: 
                    {currentStep === 1 && " Datos Personales"}
                    {currentStep === 2 && " Información de Contacto"}
                    {currentStep === 3 && " Datos Médicos"}
                    {currentStep === 4 && " Confirmación"}
                  </p>
                </div>
              </div>

              {/* Contenedor del formulario con diseño mejorado */}
              <div className="form-container">
                <div className="form-glow"></div>
                
                {/* Progress Desktop - ARRIBA DEL FORMULARIO CON INDICADOR UNIFICADO */}
                <div className="d-none d-lg-block desktop-progress-unified mb-4">
                  {/* Indicador de paso actual */}
                  <div className="current-step-indicator mb-3">
                    <span className="step-badge">Paso {currentStep} de {totalSteps}</span>
                  </div>
                  
                  {/* Barra de progreso con pasos */}
                  <div className="steps-container">
                    {[
                      { num: 1, label: 'Datos Personales', icon: 'person-fill' },
                      { num: 2, label: 'Contacto', icon: 'telephone-fill' },
                      { num: 3, label: 'Información Médica', icon: 'heart-pulse' },
                      { num: 4, label: 'Confirmar', icon: 'check-circle-fill' }
                    ].map((step, index) => (
                      <React.Fragment key={step.num}>
                        <div className={`step-item ${currentStep >= step.num ? 'active' : ''} ${currentStep === step.num ? 'current' : ''}`}>
                          <div className="step-circle">
                            <i className={`bi bi-${step.icon}`}></i>
                            <div className="step-pulse"></div>
                          </div>
                          <span className="step-label">{step.label}</span>
                        </div>
                        {index < 3 && (
                          <div className={`step-connector ${currentStep > step.num ? 'active' : ''}`}></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <WizardRegistroPaciente
                  onClose={() => {}}
                  isPageView={true}
                  onStepChange={setCurrentStep}
                />
              </div>

              {/* Footer de ayuda mejorado - SOLO MOBILE */}
              <div className="d-lg-none text-center mt-4 help-section">
                <div className="help-card">
                  <i className="bi bi-headset"></i>
                  <div className="help-content">
                    <p className="help-title">¿Necesitas ayuda?</p>
                    <p className="help-text">Nuestro equipo está disponible para asistirte</p>
                    <a href="https://wa.me/51999999999" className="help-button" target="_blank" rel="noopener noreferrer">
                      <i className="bi bi-whatsapp me-2"></i>
                      Contactar por WhatsApp
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </Col>

        </Row>
      </Container>
    </div>
  );
};

export default RegistroPacientePage;