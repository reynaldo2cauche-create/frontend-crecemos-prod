import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col, Spinner, Alert, Card } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { getRelacionesResponsable, getTiposDocumento, getServicios } from '../../services/catalogoService';
import { getProcesosLegalesInfantiles, buscarResponsablePorDni } from '../../services/pacienteService';
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
  const [buscandoDni, setBuscandoDni] = useState({});
  const [mensajeBusqueda, setMensajeBusqueda] = useState({});
  // { [responsableId]: { existe: true, id: 42 } | { existe: false } }
  const [responsableExistente, setResponsableExistente] = useState({});

  const fechaNacimiento = watch('fechaNacimiento');

  const calcularEdad = (fecha) => {
    if (!fecha) return null;
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
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
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar los datos. Por favor, recarga la página.");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const handleTelefonoChange = (e, fieldName) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 0 && value[0] !== '9') value = '';
    setValue(fieldName, value.slice(0, 9));
  };

  const handleNumeroDocumentoChange = async (e, responsableId) => {
    // 🔧 Prevenir cualquier acción por defecto (importante para iOS)
    e.preventDefault();
    e.stopPropagation();

    let value = e.target.value.replace(/[^0-9]/g, '');
    const tipoDocumento = watch(`responsableTipoDocumento_${responsableId}`);

    if (tipoDocumento === '1') value = value.slice(0, 8);
    else if (tipoDocumento === '3') value = value.slice(0, 12);

    setValue(`responsableNumeroDocumento_${responsableId}`, value, { shouldValidate: false });

    // Limpiar estado previo al cambiar el número
    setResponsableExistente(prev => ({ ...prev, [responsableId]: undefined }));
    setMensajeBusqueda(prev => ({ ...prev, [responsableId]: '' }));

    if (tipoDocumento === '1' && value.length === 8) {
      setBuscandoDni(prev => ({ ...prev, [responsableId]: true }));
      setMensajeBusqueda(prev => ({ ...prev, [responsableId]: 'Buscando...' }));

      const resultado = await buscarResponsablePorDni(1, value);

      if (resultado.success && resultado.data) {
        if (resultado.data.ya_existe) {
          // ✅ Responsable ya existe → mostrar nombres (read-only) para que confirme identidad
          setResponsableExistente(prev => ({
            ...prev,
            [responsableId]: { existe: true, id: resultado.data.id }
          }));
          // 🆕 Mostrar nombres/apellidos para que el usuario confirme que es la misma persona
          setValue(`responsableNombre_${responsableId}`, resultado.data.nombres);
          setValue(`responsableApellidoPaterno_${responsableId}`, resultado.data.apellido_paterno);
          setValue(`responsableApellidoMaterno_${responsableId}`, resultado.data.apellido_materno || '');
          setMensajeBusqueda(prev => ({
            ...prev,
            [responsableId]: '✓ Responsable encontrado. Verifica que sea la persona correcta y completa la relación con el paciente.'
          }));
        } else {
          // ✅ Responsable nuevo → autocompletar nombre y apellidos
          setResponsableExistente(prev => ({ ...prev, [responsableId]: { existe: false } }));
          setValue(`responsableNombre_${responsableId}`, resultado.data.nombres);
          setValue(`responsableApellidoPaterno_${responsableId}`, resultado.data.apellido_paterno);
          setValue(`responsableApellidoMaterno_${responsableId}`, resultado.data.apellido_materno || '');
          setMensajeBusqueda(prev => ({
            ...prev,
            [responsableId]: '✓ Datos encontrados. Complete teléfono, email y relación.'
          }));
          setTimeout(() => {
            setMensajeBusqueda(prev => ({ ...prev, [responsableId]: '' }));
          }, 3000);
        }
      } else {
        setResponsableExistente(prev => ({ ...prev, [responsableId]: { existe: false } }));
        setMensajeBusqueda(prev => ({ ...prev, [responsableId]: '' }));
      }

      setBuscandoDni(prev => ({ ...prev, [responsableId]: false }));
    }
  };

  const agregarResponsable = () => {
    const nuevoId = responsables.length > 0 ? Math.max(...responsables.map(r => r.id)) + 1 : 0;
    setResponsables(prev => [...prev, { id: nuevoId }]);
  };

  const eliminarResponsable = (index) => {
    if (responsables.length <= 1) return;
    const responsableId = responsables[index].id;
    setResponsables(prev => prev.filter((_, i) => i !== index));
    setResponsableExistente(prev => { const s = { ...prev }; delete s[responsableId]; return s; });
    // Limpiar campos del form
    [
      'Nombre', 'ApellidoPaterno', 'ApellidoMaterno',
      'TipoDocumento', 'NumeroDocumento', 'Relacion',
      'Telefono', 'Email', 'ProcesoLegal', 'ProcesoLegalTipo'
    ].forEach(campo => setValue(`responsable${campo}_${responsableId}`, ''));
  };

  const onSubmit = (data) => {
    // Construir payload diferenciando responsables nuevos vs existentes
    const responsablesPayload = responsables.map(r => {
      const existente = responsableExistente[r.id];
      if (existente?.existe) {
        // Solo enviar ID y relación, sin datos personales
        return {
          responsable_id: existente.id,
          relacion: data[`responsableRelacion_${r.id}`],
          proceso_legal: data[`responsableProcesoLegal_${r.id}`],
          proceso_legal_tipo: data[`responsableProcesoLegalTipo_${r.id}`] || null,
        };
      }
      return {
        responsable_id: null,
        nombres: data[`responsableNombre_${r.id}`],
        apellido_paterno: data[`responsableApellidoPaterno_${r.id}`],
        apellido_materno: data[`responsableApellidoMaterno_${r.id}`],
        tipo_documento: data[`responsableTipoDocumento_${r.id}`],
        numero_documento: data[`responsableNumeroDocumento_${r.id}`],
        relacion: data[`responsableRelacion_${r.id}`],
        telefono: data[`responsableTelefono_${r.id}`],
        email: data[`responsableEmail_${r.id}`],
        proceso_legal: data[`responsableProcesoLegal_${r.id}`],
        proceso_legal_tipo: data[`responsableProcesoLegalTipo_${r.id}`] || null,
      };
    });

    onNext({ ...data, responsables: responsablesPayload });
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

  if (error) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
      <Alert variant="danger">{error}</Alert>
    </div>
  );

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  const serviciosFiltrados = edad === null ? servicios
    : edad < 18
      ? servicios.filter(s => s.area?.nombre === "Área Infantil")
      : servicios.filter(s => s.area?.nombre === "Área Adolescentes y Adultos");

  const esExistente = (responsableId) => responsableExistente[responsableId]?.existe === true;

  return (
    <Form onSubmit={handleFormSubmit} onKeyDown={handleFormKeyDown} className="additional-info-form">
      {/* Botón hidden para prevenir auto-submit en iOS */}
      <button type="submit" disabled style={{ display: 'none' }} aria-hidden="true" />

      <div className="form-section">
        <h5 className="form-section-title">
          <i className="bi bi-clipboard-heart me-2"></i>
          Información de Servicio
        </h5>

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
          <Form.Control.Feedback type="invalid">{errors.motivoConsulta?.message}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Servicio que Requieres <span className="text-danger">*</span></Form.Label>
          <Form.Select
            {...register('serviciosRequeridos', { required: 'Campo obligatorio' })}
            isInvalid={!!errors.serviciosRequeridos}
            value={watch('serviciosRequeridos') || ''}
            onChange={e => setValue('serviciosRequeridos', e.target.value)}
          >
            <option value="">Selecciona un servicio...</option>
            {serviciosFiltrados.map(s => (
              <option key={s.id} value={s.id}>{s.nombre} - {s.area?.nombre}</option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.serviciosRequeridos?.message}</Form.Control.Feedback>
        </Form.Group>

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
          <Form.Control.Feedback type="invalid">{errors.referidoPor?.message}</Form.Control.Feedback>
        </Form.Group>
      </div>

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
            <Button variant="outline-primary" size="sm" onClick={agregarResponsable} className="btn-add-responsable">
              <i className="bi bi-plus-circle me-2"></i>Agregar Responsable
            </Button>
          </div>

          {responsables.map((responsable, index) => {
            const rid = responsable.id;
            const yaExiste = esExistente(rid);

            return (
              <Card key={rid} className="responsable-card mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="responsable-card-title mb-0">
                      <i className="bi bi-person-badge me-2"></i>
                      Responsable #{index + 1}
                      {index === 0 && <span className="badge bg-primary ms-2">Principal</span>}
                    </h6>
                    {responsables.length > 1 && (
                      <Button variant="outline-danger" size="sm" onClick={() => eliminarResponsable(index)} className="btn-remove-responsable">
                        <i className="bi bi-trash"></i>
                      </Button>
                    )}
                  </div>

                  {/* Tipo y Número de Documento — siempre visible */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tipo de Documento <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          {...register(`responsableTipoDocumento_${rid}`, {
                            required: showResponsible ? 'Campo obligatorio' : false
                          })}
                          isInvalid={!!errors[`responsableTipoDocumento_${rid}`]}
                          value={watch(`responsableTipoDocumento_${rid}`) || ''}
                          onChange={e => {
                            setValue(`responsableTipoDocumento_${rid}`, e.target.value);
                            setValue(`responsableNumeroDocumento_${rid}`, '');
                            setResponsableExistente(prev => ({ ...prev, [rid]: undefined }));
                          }}
                        >
                          <option value="">Seleccione...</option>
                          {tiposDocumento.map(tipo => (
                            <option key={tipo.id} value={String(tipo.id)}>{tipo.nombre}</option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors[`responsableTipoDocumento_${rid}`]?.message}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Número de Documento <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          {...register(`responsableNumeroDocumento_${rid}`, {
                            required: showResponsible ? 'Campo obligatorio' : false,
                            validate: {
                              formatoValido: (value) => {
                                if (!value && showResponsible) return 'Campo obligatorio';
                                const tipoDoc = watch(`responsableTipoDocumento_${rid}`);
                                if (tipoDoc === '1') return value.length === 8 || 'El DNI debe tener exactamente 8 dígitos';
                                if (tipoDoc === '3') return (value.length >= 9 && value.length <= 12) || 'El Carnet de Extranjería debe tener entre 9 y 12 dígitos';
                                return true;
                              }
                            }
                          })}
                          isInvalid={!!errors[`responsableNumeroDocumento_${rid}`]}
                          value={watch(`responsableNumeroDocumento_${rid}`) || ''}
                          onChange={e => handleNumeroDocumentoChange(e, rid)}
                          onBlur={(e) => e.preventDefault()}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.stopPropagation();
                            }
                          }}
                          disabled={!watch(`responsableTipoDocumento_${rid}`)}
                          inputMode="numeric"
                          placeholder="Número de documento"
                          autoComplete="off"
                        />
                        <Form.Control.Feedback type="invalid">{errors[`responsableNumeroDocumento_${rid}`]?.message}</Form.Control.Feedback>
                        {buscandoDni[rid] && (
                          <Form.Text className="text-primary d-flex align-items-center gap-2">
                            <Spinner animation="border" size="sm" />
                            <span>Buscando responsable...</span>
                          </Form.Text>
                        )}
                        {!buscandoDni[rid] && mensajeBusqueda[rid] && (
                          <Form.Text className="text-success fw-bold">{mensajeBusqueda[rid]}</Form.Text>
                        )}
                        {!errors[`responsableNumeroDocumento_${rid}`] && !mensajeBusqueda[rid] && watch(`responsableTipoDocumento_${rid}`) && (
                          <Form.Text className="text-muted">
                            {watch(`responsableTipoDocumento_${rid}`) === '1'
                              ? 'El DNI debe tener exactamente 8 dígitos'
                              : watch(`responsableTipoDocumento_${rid}`) === '3'
                                ? 'El Carnet de Extranjería debe tener entre 9 y 12 dígitos'
                                : ''}
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* ✅ Si ya existe: mostrar nombres (read-only) + mensaje informativo */}
                  {yaExiste && (
                    <Alert variant="success" className="mb-3" style={{
                      borderLeft: '4px solid #28a745',
                      backgroundColor: '#d4edda'
                    }}>
                      <div className="d-flex align-items-start">
                        <i className="bi bi-check-circle-fill me-2 mt-1" style={{ fontSize: '1.2rem', color: '#155724' }}></i>
                        <div>
                          <strong style={{ color: '#155724' }}>Responsable encontrado en el sistema</strong>
                          <p className="mb-0 mt-1" style={{ fontSize: '0.9rem', color: '#155724' }}>
                            Este responsable ya fue registrado anteriormente. Verifica que los datos sean correctos y completa la relación con el paciente.
                          </p>
                        </div>
                      </div>
                    </Alert>
                  )}

                  {/* Nombres del Responsable — Siempre visible, bloqueado si ya existe */}
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Nombres del Responsable <span className="text-danger">*</span>
                      {yaExiste && <span className="badge bg-secondary ms-2" style={{ fontSize: '0.7rem' }}>Bloqueado</span>}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      {...register(`responsableNombre_${rid}`, {
                        required: showResponsible && !yaExiste ? 'Campo obligatorio' : false
                      })}
                      isInvalid={!!errors[`responsableNombre_${rid}`]}
                      value={watch(`responsableNombre_${rid}`) || ''}
                      onChange={e => setValue(`responsableNombre_${rid}`, e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ ]/g, '').toUpperCase())}
                      className="text-uppercase"
                      placeholder="Nombres completos"
                      disabled={yaExiste}
                      style={yaExiste ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                    />
                    <Form.Control.Feedback type="invalid">{errors[`responsableNombre_${rid}`]?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Apellido Paterno <span className="text-danger">*</span>
                          {yaExiste && <span className="badge bg-secondary ms-2" style={{ fontSize: '0.7rem' }}>Bloqueado</span>}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          {...register(`responsableApellidoPaterno_${rid}`, {
                            required: showResponsible && !yaExiste ? 'Campo obligatorio' : false
                          })}
                          isInvalid={!!errors[`responsableApellidoPaterno_${rid}`]}
                          value={watch(`responsableApellidoPaterno_${rid}`) || ''}
                          onChange={e => setValue(`responsableApellidoPaterno_${rid}`, e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ ]/g, '').toUpperCase())}
                          className="text-uppercase"
                          placeholder="Apellido paterno"
                          disabled={yaExiste}
                          style={yaExiste ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                        />
                        <Form.Control.Feedback type="invalid">{errors[`responsableApellidoPaterno_${rid}`]?.message}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Apellido Materno <span className="text-danger">*</span>
                          {yaExiste && <span className="badge bg-secondary ms-2" style={{ fontSize: '0.7rem' }}>Bloqueado</span>}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          {...register(`responsableApellidoMaterno_${rid}`, {
                            required: showResponsible && !yaExiste ? 'Campo obligatorio' : false
                          })}
                          isInvalid={!!errors[`responsableApellidoMaterno_${rid}`]}
                          value={watch(`responsableApellidoMaterno_${rid}`) || ''}
                          onChange={e => setValue(`responsableApellidoMaterno_${rid}`, e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ ]/g, '').toUpperCase())}
                          className="text-uppercase"
                          placeholder="Apellido materno"
                          disabled={yaExiste}
                          style={yaExiste ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                        />
                        <Form.Control.Feedback type="invalid">{errors[`responsableApellidoMaterno_${rid}`]?.message}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Teléfono y Email — Solo si es nuevo responsable */}
                  {!yaExiste && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Teléfono del Responsable <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          {...register(`responsableTelefono_${rid}`, {
                            required: showResponsible && !yaExiste ? 'Campo obligatorio' : false,
                            pattern: { value: /^9\d{8}$/, message: 'El celular debe tener 9 dígitos y comenzar con 9' }
                          })}
                          onChange={e => handleTelefonoChange(e, `responsableTelefono_${rid}`)}
                          value={watch(`responsableTelefono_${rid}`) || ''}
                          isInvalid={!!errors[`responsableTelefono_${rid}`]}
                          inputMode="numeric"
                          placeholder="9XXXXXXXX"
                        />
                        <Form.Control.Feedback type="invalid">{errors[`responsableTelefono_${rid}`]?.message}</Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Email del Responsable <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="email"
                          {...register(`responsableEmail_${rid}`, {
                            required: showResponsible && !yaExiste ? 'Campo obligatorio' : false,
                            pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Correo inválido' }
                          })}
                          isInvalid={!!errors[`responsableEmail_${rid}`]}
                          value={watch(`responsableEmail_${rid}`) || ''}
                          onChange={e => setValue(`responsableEmail_${rid}`, e.target.value.toLowerCase())}
                          placeholder="correo@ejemplo.com"
                        />
                        <Form.Control.Feedback type="invalid">{errors[`responsableEmail_${rid}`]?.message}</Form.Control.Feedback>
                      </Form.Group>
                    </>
                  )}

                  {/* Relación — siempre requerida */}
                  <Form.Group className="mb-3">
                    <Form.Label>Relación con el Paciente <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      {...register(`responsableRelacion_${rid}`, {
                        required: showResponsible ? 'Campo obligatorio' : false
                      })}
                      isInvalid={!!errors[`responsableRelacion_${rid}`]}
                      value={watch(`responsableRelacion_${rid}`) || ''}
                      onChange={e => setValue(`responsableRelacion_${rid}`, e.target.value)}
                    >
                      <option value="">Seleccione...</option>
                      {relaciones.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors[`responsableRelacion_${rid}`]?.message}</Form.Control.Feedback>
                  </Form.Group>

                  {/* Proceso Legal — siempre requerido */}
                  <Form.Group className="mb-3">
                    <Form.Label>¿Tiene algún proceso legal con respecto al menor? <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      {...register(`responsableProcesoLegal_${rid}`, {
                        required: showResponsible ? 'Campo obligatorio' : false
                      })}
                      isInvalid={!!errors[`responsableProcesoLegal_${rid}`]}
                      value={watch(`responsableProcesoLegal_${rid}`) || ''}
                      onChange={e => {
                        setValue(`responsableProcesoLegal_${rid}`, e.target.value);
                        if (e.target.value === 'NO') setValue(`responsableProcesoLegalTipo_${rid}`, '');
                      }}
                    >
                      <option value="">Seleccione...</option>
                      <option value="SI">Sí</option>
                      <option value="NO">No</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors[`responsableProcesoLegal_${rid}`]?.message}</Form.Control.Feedback>
                    <Form.Text className="text-muted">Indique si existe algún proceso legal (custodia, régimen de visitas, tutela, etc.)</Form.Text>
                  </Form.Group>

                  {watch(`responsableProcesoLegal_${rid}`) === 'SI' && (
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo de Proceso Legal <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        {...register(`responsableProcesoLegalTipo_${rid}`, {
                          required: watch(`responsableProcesoLegal_${rid}`) === 'SI' ? 'Campo obligatorio' : false
                        })}
                        isInvalid={!!errors[`responsableProcesoLegalTipo_${rid}`]}
                        value={watch(`responsableProcesoLegalTipo_${rid}`) || ''}
                        onChange={e => setValue(`responsableProcesoLegalTipo_${rid}`, e.target.value)}
                      >
                        <option value="">Seleccione el tipo...</option>
                        {procesosLegales.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors[`responsableProcesoLegalTipo_${rid}`]?.message}</Form.Control.Feedback>
                      {watch(`responsableProcesoLegalTipo_${rid}`) && (
                        <Form.Text className="text-muted">
                          {procesosLegales.find(p => p.id === parseInt(watch(`responsableProcesoLegalTipo_${rid}`)))?.descripcion}
                        </Form.Text>
                      )}
                    </Form.Group>
                  )}
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}

      <Row className="mt-4">
        <Col xs={6}>
          <Button variant="outline-secondary" onClick={onBack} size="lg" className="w-100 btn-back">
            <i className="bi bi-arrow-left me-2"></i>Atrás
          </Button>
        </Col>
        <Col xs={6}>
          <Button variant="primary" type="submit" size="lg" className="w-100 btn-next">
            Siguiente<i className="bi bi-arrow-right ms-2"></i>
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default AdditionalInfo;