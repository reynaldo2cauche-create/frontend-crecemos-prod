import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import '../../styles/global.css';

const MedicalInfo = ({ onNext, onBack }) => {
  const { register, formState: { errors }, handleSubmit, watch, setValue } = useFormContext();

  const onSubmit = (data) => {
    console.log('Datos médicos enviados:', data);
    onNext(data);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="medical-info-form">
      <div className="form-section">
        <h5 className="form-section-title">
          <i className="bi bi-heart-pulse-fill me-2"></i>
          Información Médica
        </h5>

        <p className="form-subtitle">
          Esta información nos ayuda a brindarte una mejor atención personalizada
        </p>

        {/* Diagnóstico Médico */}
        <Form.Group className="mb-3">
          <Form.Label>
            Diagnóstico Médico
            <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            {...register('diagnosticoMedico', { required: 'Campo obligatorio' })}
            isInvalid={!!errors.diagnosticoMedico}
            value={watch('diagnosticoMedico') || ''}
            onChange={e => setValue('diagnosticoMedico', e.target.value.toUpperCase())}
            className="text-uppercase"
            placeholder="Indica si tienes algún diagnóstico médico previo (ej: ansiedad, depresión, TDAH, etc.) o escribe 'NINGUNO'"
          />
          <Form.Control.Feedback type="invalid">
            {errors.diagnosticoMedico?.message}
          </Form.Control.Feedback>
          <Form.Text className="text-muted">
            Si no tienes ningún diagnóstico, escribe "NINGUNO"
          </Form.Text>
        </Form.Group>

        {/* Alergias */}
        <Form.Group className="mb-3">
          <Form.Label>
            Alergias Conocidas
            <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            {...register('alergias', { required: 'Campo obligatorio' })}
            isInvalid={!!errors.alergias}
            value={watch('alergias') || ''}
            onChange={e => setValue('alergias', e.target.value.toUpperCase())}
            className="text-uppercase"
            placeholder="Indica si tienes alguna alergia (medicamentos, alimentos, etc.) o escribe 'NINGUNA'"
          />
          <Form.Control.Feedback type="invalid">
            {errors.alergias?.message}
          </Form.Control.Feedback>
          <Form.Text className="text-muted">
            Si no tienes alergias, escribe "NINGUNA"
          </Form.Text>
        </Form.Group>

        {/* Medicamentos Actuales */}
        <Form.Group className="mb-3">
          <Form.Label>
            Medicamentos Actuales
            <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            {...register('medicamentos', { required: 'Campo obligatorio' })}
            isInvalid={!!errors.medicamentos}
            value={watch('medicamentos') || ''}
            onChange={e => setValue('medicamentos', e.target.value.toUpperCase())}
            className="text-uppercase"
            placeholder="Lista los medicamentos que tomas actualmente (nombre y dosis) o escribe 'NINGUNO'"
          />
          <Form.Control.Feedback type="invalid">
            {errors.medicamentos?.message}
          </Form.Control.Feedback>
          <Form.Text className="text-muted">
            Si no tomas medicamentos, escribe "NINGUNO"
          </Form.Text>
        </Form.Group>

        <div className="info-box">
          <i className="bi bi-shield-lock-fill me-2"></i>
          <span>Tu información médica está protegida y será tratada con total confidencialidad</span>
        </div>
      </div>

      {/* Botones de navegación */}
      <Row className="mt-4">
        <Col xs={6}>
          <Button variant="outline-secondary" onClick={onBack} size="lg" className="w-100 btn-back">
            <i className="bi bi-arrow-left me-2"></i>
            Atrás
          </Button>
        </Col>
        <Col xs={6}>
          <Button variant="primary" type="submit" size="lg" className="w-100 btn-next">
            Siguiente
            <i className="bi bi-arrow-right ms-2"></i>
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default MedicalInfo;
