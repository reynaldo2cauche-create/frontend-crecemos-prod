import React, { useEffect, useState, useRef } from 'react';
import { Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { getDistritos, getGeneros, getTiposDocumento } from '../../services/catalogoService';
import { checkDocumentoExists } from '../../services/pacienteService';
import '../../styles/global.css';

const PersonalDataForm = ({ onNext, setSnackbar }) => {
  const { register, formState: { errors }, setValue, watch, handleSubmit } = useFormContext();

  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [distritos, setDistritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tipoDocumento = watch('tipoDocumento') || '';
  const [checkingDocumento, setCheckingDocumento] = useState(false);
  const [documentoExistente, setDocumentoExistente] = useState(false);
  const validationTimeoutRef = useRef(null);

  // Calcular edad y si es mayor de edad
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
  const esMayorDeEdad = edad !== null && edad >= 18;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [documentosData, generosData, distritosData] = await Promise.all([
          getTiposDocumento(),
          getGeneros(),
          getDistritos()
        ]);

        const formatDocumentos = Array.isArray(documentosData) ? documentosData : [];
        const formatGeneros = Array.isArray(generosData) ? generosData : [];
        const formatDistritos = Array.isArray(distritosData) ? distritosData : [];

        const distritosFiltrados = formatDistritos.filter(distrito => distrito.id_provincia === 1);

        setTiposDocumento(formatDocumentos);
        setGeneros(formatGeneros);
        setDistritos(distritosFiltrados);
        setError(null);
      } catch (error) {
        console.error("Error al cargar datos del formulario:", error);
        setError("Error al cargar los datos. Por favor, recarga la página.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Cleanup del timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  const handleNumeroDocumentoChange = (e) => {
    // 🔧 Prevenir cualquier acción por defecto (importante para iOS)
    e.preventDefault();
    e.stopPropagation();

    const rawValue = e.target.value;
    let value = rawValue.replace(/[^0-9]/g, '');

    if (tipoDocumento === '1') {
      value = value.slice(0, 8);
    } else if (tipoDocumento === '3') {
      value = value.slice(0, 12);
    }

    // ✅ Actualizar react-hook-form con setValue
    setValue('numeroDocumento', value, { shouldValidate: false });

    // Limpiar timeout anterior si existe
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
      validationTimeoutRef.current = null;
    }

    setDocumentoExistente(false);

    // Validar solo cuando llegue a 8 dígitos (DNI completo)
    if (tipoDocumento === '1' && value.length === 8) {
      validationTimeoutRef.current = setTimeout(async () => {
        setCheckingDocumento(true);
        try {
          const result = await checkDocumentoExists(value);
          if (result.exists) {
            setDocumentoExistente(true);
            if (setSnackbar) {
              setSnackbar({
                open: true,
                message: `El DNI ${value} ya está registrado en el sistema. Por favor, verifique el número ingresado.`,
                severity: 'error'
              });
            }
          }
        } catch (error) {
          console.error('Error al verificar documento:', error);
          if (setSnackbar) {
            setSnackbar({
              open: true,
              message: 'Error al verificar el documento. Por favor, intente nuevamente.',
              severity: 'error'
            });
          }
        } finally {
          setCheckingDocumento(false);
        }
      }, 500);
    }
  };

  const handleTelefonoChange = (e, fieldName) => {
    let value = e.target.value;
    value = value.replace(/[^0-9]/g, '');

    if (value.length > 0 && value[0] !== '9') {
      value = value.slice(0, 0);
    }

    value = value.slice(0, 9);
    setValue(fieldName, value);
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

  const onSubmit = (data) => {
    // ❌ Bloquear si el documento ya está registrado
    if (documentoExistente) {
      if (setSnackbar) {
        setSnackbar({
          open: true,
          message: 'No se puede continuar. El número de documento ya está registrado en el sistema.',
          severity: 'error'
        });
      }
      return; // NO permite avanzar
    }

    // ❌ Bloquear si aún está verificando el documento
    if (checkingDocumento) {
      if (setSnackbar) {
        setSnackbar({
          open: true,
          message: 'Espere mientras verificamos el número de documento...',
          severity: 'warning'
        });
      }
      return;
    }

    // ✅ Todo OK, permitir avanzar
    onNext(data);
  };

  // 🔧 Prevenir submit automático del formulario (fix para iOS)
  const handleFormKeyDown = (e) => {
    // Prevenir submit al presionar Enter en cualquier input
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  // 🔧 Prevenir submit no intencional (fix para iOS)
  const handleFormSubmit = (e) => {
    // Solo permitir submit si viene del botón "Siguiente"
    if (e.nativeEvent.submitter?.type !== 'submit' && e.nativeEvent.submitter?.className?.includes('btn-next')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    return handleSubmit(onSubmit)(e);
  };

  return (
    <Form onSubmit={handleFormSubmit} onKeyDown={handleFormKeyDown} className="personal-data-form">
      {/* Botón hidden para prevenir auto-submit en iOS */}
      <button type="submit" disabled style={{ display: 'none' }} aria-hidden="true" />

      <div className="form-section">
        <h5 className="form-section-title">
          <i className="bi bi-person-badge me-2"></i>
          Datos Personales
        </h5>

        {/* Nombres */}
        <Form.Group className="mb-3">
          <Form.Label>Nombres <span className="text-danger">*</span></Form.Label>
          <Form.Control
            type="text"
            {...register('nombre', { required: 'Campo obligatorio' })}
            isInvalid={!!errors.nombre}
            value={watch('nombre') || ''}
            onChange={e => {
              const value = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ ]/g, '');
              setValue('nombre', value.toUpperCase());
            }}
            className="text-uppercase"
            placeholder="Ingrese los nombres"
          />
          <Form.Control.Feedback type="invalid">
            {errors.nombre?.message}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Apellidos */}
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Apellido Paterno <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                {...register('apellidoPaterno', { required: 'Campo obligatorio' })}
                isInvalid={!!errors.apellidoPaterno}
                value={watch('apellidoPaterno') || ''}
                onChange={e => {
                  const value = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ ]/g, '');
                  setValue('apellidoPaterno', value.toUpperCase());
                }}
                className="text-uppercase"
                placeholder="Apellido paterno"
              />
              <Form.Control.Feedback type="invalid">
                {errors.apellidoPaterno?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Apellido Materno <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                {...register('apellidoMaterno', { required: 'Campo obligatorio' })}
                isInvalid={!!errors.apellidoMaterno}
                value={watch('apellidoMaterno') || ''}
                onChange={e => {
                  const value = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ ]/g, '');
                  setValue('apellidoMaterno', value.toUpperCase());
                }}
                className="text-uppercase"
                placeholder="Apellido materno"
              />
              <Form.Control.Feedback type="invalid">
                {errors.apellidoMaterno?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        {/* Fecha de Nacimiento */}
        <Form.Group className="mb-3">
          <Form.Label>Fecha de Nacimiento <span className="text-danger">*</span></Form.Label>
          <Form.Control
            type="date"
            {...register('fechaNacimiento', { required: 'Campo obligatorio' })}
            isInvalid={!!errors.fechaNacimiento}
          />
          <Form.Control.Feedback type="invalid">
            {errors.fechaNacimiento?.message}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Tipo y Número de Documento */}
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Documento <span className="text-danger">*</span></Form.Label>
              <Form.Select
                {...register('tipoDocumento', { required: 'Campo obligatorio' })}
                isInvalid={!!errors.tipoDocumento}
                value={tipoDocumento}
                onChange={e => {
                  setValue('tipoDocumento', e.target.value);
                  setValue('numeroDocumento', '');
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
                {errors.tipoDocumento?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Número de Documento <span className="text-danger">*</span></Form.Label>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  {...register('numeroDocumento', {
                    required: 'Campo obligatorio',
                    validate: {
                      formatoValido: (value) => {
                        if (!value) return 'Campo obligatorio';
                        if (tipoDocumento === '1') {
                          return value.length === 8 || 'El DNI debe tener exactamente 8 dígitos';
                        }
                        if (tipoDocumento === '3') {
                          return (value.length >= 9 && value.length <= 12) || 'El Carnet de Extranjería debe tener entre 9 y 12 dígitos';
                        }
                        return true;
                      }
                    }
                  })}
                  value={watch('numeroDocumento') || ''}
                  onChange={handleNumeroDocumentoChange}
                  onBlur={(e) => e.preventDefault()}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  isInvalid={!!errors.numeroDocumento || documentoExistente}
                  disabled={!tipoDocumento || checkingDocumento}
                  inputMode="numeric"
                  placeholder="Número de documento"
                  autoComplete="off"
                />
                {checkingDocumento && (
                  <Spinner
                    animation="border"
                    size="sm"
                    className="position-absolute end-0 top-50 translate-middle-y me-3"
                  />
                )}
              </div>
              <Form.Control.Feedback type="invalid">
                {errors.numeroDocumento?.message}
              </Form.Control.Feedback>
              {documentoExistente && (
                <Alert variant="danger" className="mt-2 mb-0 py-2 px-3">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <strong>Documento duplicado:</strong> Este {tipoDocumento === '1' ? 'DNI' : 'documento'} ya está registrado en el sistema.
                  Por favor, verifique el número ingresado o contacte al administrador si considera que esto es un error.
                </Alert>
              )}
              {!errors.numeroDocumento && !documentoExistente && tipoDocumento && (
                <Form.Text className="text-muted">
                  {tipoDocumento === '1' ?
                    'El DNI debe tener exactamente 8 dígitos' :
                    tipoDocumento === '3' ?
                      'El Carnet de Extranjería debe tener entre 9 y 12 dígitos' :
                      ''}
                </Form.Text>
              )}
            </Form.Group>
          </Col>
        </Row>

        {/* Sexo */}
        <Form.Group className="mb-3">
          <Form.Label>Sexo <span className="text-danger">*</span></Form.Label>
          <Form.Select
            {...register('sexo', { required: 'Campo obligatorio' })}
            isInvalid={!!errors.sexo}
            value={watch('sexo') || ''}
            onChange={(e) => setValue('sexo', e.target.value)}
          >
            <option value="">Seleccione...</option>
            {generos.map((genero) => (
              <option key={genero.id} value={genero.id}>
                {genero.nombre}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.sexo?.message}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Distrito */}
        <Form.Group className="mb-3">
          <Form.Label>Distrito <span className="text-danger">*</span></Form.Label>
          <Form.Select
            {...register('distrito', { required: 'Campo obligatorio' })}
            isInvalid={!!errors.distrito}
            value={watch('distrito') || ''}
            onChange={(e) => setValue('distrito', e.target.value)}
          >
            <option value="">Seleccione...</option>
            {distritos.map((distrito) => (
              <option key={distrito.id} value={distrito.id}>
                {distrito.nombre}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.distrito?.message}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Dirección */}
        <Form.Group className="mb-3">
          <Form.Label>Dirección Completa <span className="text-danger">*</span></Form.Label>
          <Form.Control
            type="text"
            {...register('direccion', { required: 'Campo obligatorio' })}
            isInvalid={!!errors.direccion}
            value={watch('direccion') || ''}
            onChange={e => setValue('direccion', e.target.value.toUpperCase())}
            className="text-uppercase"
            placeholder="Ingrese la dirección completa"
          />
          <Form.Control.Feedback type="invalid">
            {errors.direccion?.message}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Contacto (solo para mayores de edad) */}
        {esMayorDeEdad && (
          <>
            <h5 className="form-section-title mt-4">
              <i className="bi bi-telephone me-2"></i>
              Información de Contacto
            </h5>

            <Form.Group className="mb-3">
              <Form.Label>Celular 1 <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                {...register('celular', {
                  required: 'Campo obligatorio',
                  pattern: {
                    value: /^9\d{8}$/,
                    message: 'El celular debe tener 9 dígitos y comenzar con 9'
                  }
                })}
                onChange={(e) => handleTelefonoChange(e, 'celular')}
                value={watch('celular') || ''}
                isInvalid={!!errors.celular}
                inputMode="numeric"
                placeholder="9XXXXXXXX"
              />
              <Form.Control.Feedback type="invalid">
                {errors.celular?.message}
              </Form.Control.Feedback>
              {!errors.celular && (
                <Form.Text className="text-muted">
                  El número debe tener 9 dígitos y comenzar con 9
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Celular 2 </Form.Label>
              <Form.Control
                type="text"
                {...register('celular2', {

                  pattern: {
                    value: /^9\d{8}$/,
                    message: 'El celular debe tener 9 dígitos y comenzar con 9'
                  }
                })}
                onChange={(e) => handleTelefonoChange(e, 'celular2')}
                value={watch('celular2') || ''}
                isInvalid={!!errors.celular2}
                inputMode="numeric"
                placeholder="9XXXXXXXX"
              />
              <Form.Control.Feedback type="invalid">
                {errors.celular2?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Correo Electrónico <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                {...register('correo', {
                  required: 'Campo obligatorio',
                  pattern: {
                    value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                    message: 'Correo inválido'
                  }
                })}
                isInvalid={!!errors.correo}
                value={watch('correo') || ''}
                onChange={e => setValue('correo', e.target.value.toUpperCase())}
                className="text-uppercase"
                placeholder="correo@ejemplo.com"
              />
              <Form.Control.Feedback type="invalid">
                {errors.correo?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </>
        )}
      </div>

      {/* Botón Siguiente */}
      <div className="d-grid mt-4">
        <Button
          variant="primary"
          type="submit"
          size="lg"
          className="btn-next"
          disabled={documentoExistente || checkingDocumento}
        >
          {checkingDocumento ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Verificando documento...
            </>
          ) : documentoExistente ? (
            <>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Documento duplicado
            </>
          ) : (
            <>
              Siguiente
              <i className="bi bi-arrow-right ms-2"></i>
            </>
          )}
        </Button>
      </div>
    </Form>
  );
};

export default PersonalDataForm;
