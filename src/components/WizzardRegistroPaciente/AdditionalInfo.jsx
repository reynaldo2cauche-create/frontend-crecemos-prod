import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col, Spinner, Alert, Card } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { getRelacionesResponsable, getTiposDocumento, getServicios } from '../../services/catalogoService';
import { getProcesosLegalesInfantiles } from '../../services/pacienteService';
import '../../styles/global.css';

const AdditionalInfo = ({ onNext, onBack }) => {
  const { register, formState: { errors }, setValue, watch, handleSubmit } = useFormContext();
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relaciones, setRelaciones] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [procesosLegales, setProcesosLegales] = useState([]);
  const [responsables, setResponsables] = useState([{ id: 0 }]);

  const fechaNacimiento = watch('fechaNacimiento');
  const calcularEdad = (fecha) => {
    if (!fecha) return null;
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const edad = calcularEdad(fechaNacimiento);
  const showResponsible = edad !== null && edad < 18;

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [serviciosData, relacionesData, tiposDocData, procesosLegalesData] = await Promise.all([
          getServicios(),
          getRelacionesResponsable(),
          getTiposDocumento(),
          getProcesosLegalesInfantiles()
        ]);

        setServicios(Array.isArray(serviciosData) ? serviciosData : []);
        setRelaciones(Array.isArray(relacionesData) ? relacionesData : []);
        setTiposDocumento(Array.isArray(tiposDocData) ? tiposDocData : []);
        setProcesosLegales(Array.isArray(procesosLegalesData) ? procesosLegalesData : []);
        setError(null);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setError("Error al cargar los datos. Por favor, recarga la página.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleTelefonoChange = (e, fieldName) => {
    let value = e.target.value;
    value = value.replace(/[^0-9]/g, '');
    if (value.length > 0 && value[0] !== '9') {
      value = value.slice(0, 0);
    }
    value = value.slice(0, 9);
    setValue(fieldName, value);
  };

  const handleNumeroDocumentoResponsableChange = (e, responsableId) => {
    let value = e.target.value;
    value = value.replace(/[^0-9]/g, '');

    const tipoDocumento = watch(`responsableTipoDocumento_${responsableId}`);

    // Limitar longitud según tipo de documento
    if (tipoDocumento === '1') { // DNI
      value = value.slice(0, 8);
    } else if (tipoDocumento === '3') { // Carnet Extranjería
      value = value.slice(0, 12);
    }

    setValue(`responsableNumeroDocumento_${responsableId}`, value);
  };

  const agregarResponsable = () => {
    const nuevoId = responsables.length > 0 ? Math.max(...responsables.map(r => r.id)) + 1 : 0;
    setResponsables([...responsables, { id: nuevoId }]);
  };

  const eliminarResponsable = (index) => {
    if (responsables.length > 1) {
      const nuevosResponsables = responsables.filter((_, i) => i !== index);
      setResponsables(nuevosResponsables);

      // Limpiar valores del formulario para este responsable
      const responsableId = responsables[index].id;
      setValue(`responsableNombre_${responsableId}`, '');
      setValue(`responsableApellidoPaterno_${responsableId}`, '');
      setValue(`responsableApellidoMaterno_${responsableId}`, '');
      setValue(`responsableTipoDocumento_${responsableId}`, '');
      setValue(`responsableNumeroDocumento_${responsableId}`, '');
      setValue(`responsableRelacion_${responsableId}`, '');
      setValue(`responsableTelefono_${responsableId}`, '');
      setValue(`responsableEmail_${responsableId}`, '');
      setValue(`responsableProcesoLegal_${responsableId}`, '');
      setValue(`responsableProcesoLegalTipo_${responsableId}`, '');
    }
  };

  const onSubmit = (data) => {
    onNext(data);
  };

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Filtrar servicios según edad
  let serviciosFiltrados = servicios;
  if (edad !== null) {
    if (edad < 18) {
      serviciosFiltrados = servicios.filter(s => s.area?.nombre === "Área Infantil");
    } else {
      serviciosFiltrados = servicios.filter(s => s.area?.nombre === "Área Adolescentes y Adultos");
    }
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="additional-info-form">
      <div className="form-section">
        <h5 className="form-section-title">
          <i className="bi bi-clipboard-heart me-2"></i>
          Información de Servicio
        </h5>

        {/* Motivo de Consulta */}
        <Form.Group className="mb-3">
          <Form.Label>Motivo de Consulta <span className="text-danger">*</span></Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            {...register('motivoConsulta', { required: 'Campo obligatorio' })}
            isInvalid={!!errors.motivoConsulta}
            value={watch('motivoConsulta') || ''}
            onChange={e => setValue('motivoConsulta', e.target.value.toUpperCase())}
            className="text-uppercase"
            placeholder="Describe brevemente el motivo de tu consulta..."
          />
          <Form.Control.Feedback type="invalid">
            {errors.motivoConsulta?.message}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Servicios Requeridos */}
        <Form.Group className="mb-3">
          <Form.Label>Servicio que Requieres <span className="text-danger">*</span></Form.Label>
          <Form.Select
            {...register('serviciosRequeridos', { required: 'Campo obligatorio' })}
            isInvalid={!!errors.serviciosRequeridos}
            value={watch('serviciosRequeridos') || ''}
            onChange={(e) => setValue('serviciosRequeridos', e.target.value)}
          >
            <option value="">Selecciona un servicio...</option>
            {serviciosFiltrados.map((servicio) => (
              <option key={servicio.id} value={servicio.id}>
                {servicio.nombre} - {servicio.area?.nombre}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.serviciosRequeridos?.message}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Referido Por */}
        <Form.Group className="mb-0">
          <Form.Label>¿Cómo nos conociste? <span className="text-danger">*</span></Form.Label>
          <Form.Control
            type="text"
            {...register('referidoPor', { required: 'Campo obligatorio' })}
            isInvalid={!!errors.referidoPor}
            value={watch('referidoPor') || ''}
            onChange={e => setValue('referidoPor', e.target.value.toUpperCase())}
            className="text-uppercase"
            placeholder="Ej: Redes sociales, recomendación, búsqueda en Google..."
          />
          <Form.Control.Feedback type="invalid">
            {errors.referidoPor?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </div>

      {/* Información de los Responsables (solo si es menor de edad) */}
      {showResponsible && (
        <div className="form-section" style={{ paddingTop: '0px' }}>
          <div className="responsable-alert">
            <i className="bi bi-info-circle-fill me-2"></i>
            <span>Como el paciente es menor de edad, necesitamos los datos de al menos un responsable</span>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
            <h5 className="form-section-title mb-0">
              <i className="bi bi-person-check me-2"></i>
              Datos de los Responsables
            </h5>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={agregarResponsable}
              className="btn-add-responsable"
            >
              <i className="bi bi-plus-circle me-2"></i>
              Agregar Responsable
            </Button>
          </div>

          {responsables.map((responsable, index) => (
            <Card key={responsable.id} className="responsable-card mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="responsable-card-title mb-0">
                    <i className="bi bi-person-badge me-2"></i>
                    Responsable #{index + 1}
                    {index === 0 && <span className="badge bg-primary ms-2">Principal</span>}
                  </h6>
                  {responsables.length > 1 && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => eliminarResponsable(index)}
                      className="btn-remove-responsable"
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  )}
                </div>

                {/* Nombres del Responsable */}
                <Form.Group className="mb-3">
                  <Form.Label>Nombres del Responsable <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    {...register(`responsableNombre_${responsable.id}`, {
                      required: showResponsible ? 'Campo obligatorio' : false
                    })}
                    isInvalid={!!errors[`responsableNombre_${responsable.id}`]}
                    value={watch(`responsableNombre_${responsable.id}`) || ''}
                    onChange={e => {
                      const value = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ ]/g, '');
                      setValue(`responsableNombre_${responsable.id}`, value.toUpperCase());
                    }}
                    className="text-uppercase"
                    placeholder="Nombres completos"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`responsableNombre_${responsable.id}`]?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Apellidos del Responsable */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Apellido Paterno <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        {...register(`responsableApellidoPaterno_${responsable.id}`, {
                          required: showResponsible ? 'Campo obligatorio' : false
                        })}
                        isInvalid={!!errors[`responsableApellidoPaterno_${responsable.id}`]}
                        value={watch(`responsableApellidoPaterno_${responsable.id}`) || ''}
                        onChange={e => {
                          const value = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ ]/g, '');
                          setValue(`responsableApellidoPaterno_${responsable.id}`, value.toUpperCase());
                        }}
                        className="text-uppercase"
                        placeholder="Apellido paterno"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`responsableApellidoPaterno_${responsable.id}`]?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Apellido Materno <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        {...register(`responsableApellidoMaterno_${responsable.id}`, {
                          required: showResponsible ? 'Campo obligatorio' : false
                        })}
                        isInvalid={!!errors[`responsableApellidoMaterno_${responsable.id}`]}
                        value={watch(`responsableApellidoMaterno_${responsable.id}`) || ''}
                        onChange={e => {
                          const value = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ ]/g, '');
                          setValue(`responsableApellidoMaterno_${responsable.id}`, value.toUpperCase());
                        }}
                        className="text-uppercase"
                        placeholder="Apellido materno"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`responsableApellidoMaterno_${responsable.id}`]?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Documento del Responsable */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo de Documento <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        {...register(`responsableTipoDocumento_${responsable.id}`, {
                          required: showResponsible ? 'Campo obligatorio' : false
                        })}
                        isInvalid={!!errors[`responsableTipoDocumento_${responsable.id}`]}
                        value={watch(`responsableTipoDocumento_${responsable.id}`) || ''}
                        onChange={(e) => {
                          setValue(`responsableTipoDocumento_${responsable.id}`, e.target.value);
                          setValue(`responsableNumeroDocumento_${responsable.id}`, ''); // Limpiar el número al cambiar tipo
                        }}
                      >
                        <option value="">Seleccione...</option>
                        {tiposDocumento.map((tipo) => (
                          <option key={tipo.id} value={String(tipo.id)}>
                            {tipo.nombre}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors[`responsableTipoDocumento_${responsable.id}`]?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Número de Documento <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        {...register(`responsableNumeroDocumento_${responsable.id}`, {
                          required: showResponsible ? 'Campo obligatorio' : false,
                          validate: {
                            formatoValido: (value) => {
                              if (!value && showResponsible) return 'Campo obligatorio';
                              const tipoDoc = watch(`responsableTipoDocumento_${responsable.id}`);
                              if (tipoDoc === '1') {
                                return value.length === 8 || 'El DNI debe tener exactamente 8 dígitos';
                              }
                              if (tipoDoc === '3') {
                                return (value.length >= 9 && value.length <= 12) || 'El Carnet de Extranjería debe tener entre 9 y 12 dígitos';
                              }
                              return true;
                            }
                          }
                        })}
                        isInvalid={!!errors[`responsableNumeroDocumento_${responsable.id}`]}
                        value={watch(`responsableNumeroDocumento_${responsable.id}`) || ''}
                        onChange={(e) => handleNumeroDocumentoResponsableChange(e, responsable.id)}
                        disabled={!watch(`responsableTipoDocumento_${responsable.id}`)}
                        inputMode="numeric"
                        placeholder="Número de documento"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`responsableNumeroDocumento_${responsable.id}`]?.message}
                      </Form.Control.Feedback>
                      {!errors[`responsableNumeroDocumento_${responsable.id}`] && watch(`responsableTipoDocumento_${responsable.id}`) && (
                        <Form.Text className="text-muted">
                          {watch(`responsableTipoDocumento_${responsable.id}`) === '1' ?
                            'El DNI debe tener exactamente 8 dígitos' :
                            watch(`responsableTipoDocumento_${responsable.id}`) === '3' ?
                              'El Carnet de Extranjería debe tener entre 9 y 12 dígitos' :
                              ''}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                {/* Relación */}
                <Form.Group className="mb-3">
                  <Form.Label>Relación con el Paciente <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    {...register(`responsableRelacion_${responsable.id}`, {
                      required: showResponsible ? 'Campo obligatorio' : false
                    })}
                    isInvalid={!!errors[`responsableRelacion_${responsable.id}`]}
                    value={watch(`responsableRelacion_${responsable.id}`) || ''}
                    onChange={(e) => setValue(`responsableRelacion_${responsable.id}`, e.target.value)}
                  >
                    <option value="">Seleccione...</option>
                    {relaciones.map((relacion) => (
                      <option key={relacion.id} value={relacion.id}>
                        {relacion.nombre}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors[`responsableRelacion_${responsable.id}`]?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Teléfono del Responsable */}
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono del Responsable <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    {...register(`responsableTelefono_${responsable.id}`, {
                      required: showResponsible ? 'Campo obligatorio' : false,
                      pattern: {
                        value: /^9\d{8}$/,
                        message: 'El celular debe tener 9 dígitos y comenzar con 9'
                      }
                    })}
                    onChange={(e) => handleTelefonoChange(e, `responsableTelefono_${responsable.id}`)}
                    value={watch(`responsableTelefono_${responsable.id}`) || ''}
                    isInvalid={!!errors[`responsableTelefono_${responsable.id}`]}
                    inputMode="numeric"
                    placeholder="9XXXXXXXX"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`responsableTelefono_${responsable.id}`]?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Email del Responsable */}
                <Form.Group className="mb-3">
                  <Form.Label>Email del Responsable <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    {...register(`responsableEmail_${responsable.id}`, {
                      required: showResponsible ? 'Campo obligatorio' : false,
                      pattern: {
                        value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                        message: 'Correo inválido'
                      }
                    })}
                    isInvalid={!!errors[`responsableEmail_${responsable.id}`]}
                    value={watch(`responsableEmail_${responsable.id}`) || ''}
                    onChange={e => setValue(`responsableEmail_${responsable.id}`, e.target.value.toUpperCase())}
                    className="text-uppercase"
                    placeholder="correo@ejemplo.com"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`responsableEmail_${responsable.id}`]?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Proceso Legal */}
                <Form.Group className="mb-3">
                  <Form.Label>¿Tiene algún proceso legal con respecto al menor? <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    {...register(`responsableProcesoLegal_${responsable.id}`, {
                      required: showResponsible ? 'Campo obligatorio' : false
                    })}
                    isInvalid={!!errors[`responsableProcesoLegal_${responsable.id}`]}
                    value={watch(`responsableProcesoLegal_${responsable.id}`) || ''}
                    onChange={(e) => {
                      setValue(`responsableProcesoLegal_${responsable.id}`, e.target.value);
                      if (e.target.value === 'NO') {
                        setValue(`responsableProcesoLegalTipo_${responsable.id}`, '');
                      }
                    }}
                  >
                    <option value="">Seleccione...</option>
                    <option value="SI">Sí</option>
                    <option value="NO">No</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors[`responsableProcesoLegal_${responsable.id}`]?.message}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Indique si existe algún proceso legal (custodia, régimen de visitas, tutela, etc.)
                  </Form.Text>
                </Form.Group>

                {/* Tipo de Proceso Legal (solo si tiene proceso legal) */}
                {watch(`responsableProcesoLegal_${responsable.id}`) === 'SI' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo de Proceso Legal <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      {...register(`responsableProcesoLegalTipo_${responsable.id}`, {
                        required: watch(`responsableProcesoLegal_${responsable.id}`) === 'SI' ? 'Campo obligatorio' : false
                      })}
                      isInvalid={!!errors[`responsableProcesoLegalTipo_${responsable.id}`]}
                      value={watch(`responsableProcesoLegalTipo_${responsable.id}`) || ''}
                      onChange={(e) => setValue(`responsableProcesoLegalTipo_${responsable.id}`, e.target.value)}
                    >
                      <option value="">Seleccione el tipo...</option>
                      {procesosLegales.map((proceso) => (
                        <option key={proceso.id} value={proceso.id}>
                          {proceso.nombre}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors[`responsableProcesoLegalTipo_${responsable.id}`]?.message}
                    </Form.Control.Feedback>
                    {watch(`responsableProcesoLegalTipo_${responsable.id}`) && (
                      <Form.Text className="text-muted">
                        {procesosLegales.find(p => p.id === parseInt(watch(`responsableProcesoLegalTipo_${responsable.id}`)))?.descripcion}
                      </Form.Text>
                    )}
                  </Form.Group>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

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

export default AdditionalInfo;
