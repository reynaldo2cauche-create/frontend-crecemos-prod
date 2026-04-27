import React, { useState } from 'react';
import { Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import ReCAPTCHA from 'react-google-recaptcha';
import '../../styles/global.css';

const SITE_KEY = '6Lck2jErAAAAAPqJ463t1EaXqMjlyTO15JMVZSqs';

const ConsentForm = ({ onSubmit, onBack, captchaValue, setCaptchaValue }) => {
  const { register, formState: { errors }, watch, setValue, handleSubmit } = useFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaError, setCaptchaError] = useState('');

  const handleFormSubmit = async (data) => {
    setCaptchaError('');
    if (!captchaValue) {
      setCaptchaError('Por favor completa la verificación reCAPTCHA antes de continuar.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit(handleFormSubmit)} className="consent-form">
      <div className="form-section">
        <div className="success-header">
          <div className="success-icon-wrapper">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <h5 className="form-section-title text-center mb-2">
            ¡Último Paso!
          </h5>
          <p className="success-subtitle">
            Por favor, revisa y acepta los términos para completar tu registro
          </p>
        </div>

        {/* Términos y Condiciones */}
        <div className="consent-box">
          <div className="consent-header">
            <i className="bi bi-file-earmark-text me-2"></i>
            <span>Términos y Condiciones</span>
          </div>
          <div className="consent-content">
            <p>Al registrarte, aceptas que:</p>
            <ul>
              <li>La información proporcionada es verídica y actualizada</li>
              <li>Autorizas el tratamiento de tus datos personales según nuestra política de privacidad</li>
              <li>Comprendes que la información médica será manejada de forma confidencial</li>
              <li>Aceptas recibir comunicaciones relacionadas con tu tratamiento</li>
            </ul>
          </div>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="aceptaTerminos"
              label={
                <span className="consent-label">
                  <strong>Acepto los términos y condiciones</strong>
                  <span className="text-danger ms-1">*</span>
                </span>
              }
              {...register('aceptaTerminos', { required: 'Debes aceptar los términos y condiciones' })}
              isInvalid={!!errors.aceptaTerminos}
              checked={watch('aceptaTerminos') || false}
              onChange={(e) => setValue('aceptaTerminos', e.target.checked)}
              className="consent-checkbox"
            />
            <Form.Control.Feedback type="invalid">
              {errors.aceptaTerminos?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </div>

        {/* Información Comercial */}
        <div className="consent-box marketing-box">
          <div className="consent-header">
            <i className="bi bi-envelope-heart me-2"></i>
            <span>Información Comercial (Opcional)</span>
          </div>
          <Form.Group className="mb-0">
            <Form.Check
              type="checkbox"
              id="autorizaInformacion"
              label={
                <span className="consent-label">
                  Deseo recibir información sobre promociones, eventos y novedades de Crecemos
                </span>
              }
              checked={watch('autorizaInformacion') || false}
              onChange={(e) => setValue('autorizaInformacion', e.target.checked)}
              className="consent-checkbox"
            />
          </Form.Group>
        </div>

        {/* reCAPTCHA */}
        <div className="captcha-wrapper">
          <ReCAPTCHA
            sitekey={SITE_KEY}
            onChange={value => {
              setCaptchaValue(value);
              setCaptchaError('');
            }}
            theme="light"
          />
          {captchaError && (
            <Alert variant="danger" className="mt-2 mb-0">
              {captchaError}
            </Alert>
          )}
        </div>

        {/* Info de seguridad */}
        <div className="security-badge">
          <i className="bi bi-shield-fill-check me-2"></i>
          <span>Tu información está protegida con encriptación SSL</span>
        </div>
      </div>

      {/* Botones de navegación */}
      <Row className="mt-4">
        <Col xs={6}>
          <Button
            variant="outline-secondary"
            onClick={onBack}
            size="lg"
            className="w-100 btn-back"
            disabled={isSubmitting}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Atrás
          </Button>
        </Col>
        <Col xs={6}>
          <Button
            variant="success"
            type="submit"
            size="lg"
            className="w-100 btn-finish"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Procesando...
              </>
            ) : (
              <>
                Finalizar
                <i className="bi bi-check-lg ms-2"></i>
              </>
            )}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default ConsentForm;
