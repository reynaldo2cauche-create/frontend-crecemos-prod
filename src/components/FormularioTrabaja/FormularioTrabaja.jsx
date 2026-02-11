import React, { useState, useEffect } from 'react';
import postulacionesService from '../../services/postulacionesService';
import { getDistritos } from '../../services/catalogoService';
import { getCargosPostulacion } from '../../services/cargoPostulacion';

const FormularioTrabaja = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    distrito: '',
    cargoPostuladoId: '',
  });
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [errores, setErrores] = useState({});
  const [mostrarModalExito, setMostrarModalExito] = useState(false);
  const [distritosDisponibles, setDistritosDisponibles] = useState([]);
  const [loadingDistritos, setLoadingDistritos] = useState(false);
  const [cargosDisponibles, setCargosDisponibles] = useState([]);
  const [loadingCargos, setLoadingCargos] = useState(false);

  // ✅ CORREGIDO: useEffect en lugar de useStatet
  useEffect(() => {
    const cargarCargos = async () => {
      try {
        setLoadingCargos(true);
        const response = await getCargosPostulacion();
        
        const cargos = response.data || response;
        setCargosDisponibles(Array.isArray(cargos) ? cargos : []);
        
   
      } catch (error) {
        console.error('❌ Error al cargar cargos:', error);
        setCargosDisponibles([]);
        setMensaje({
          tipo: 'error',
          texto: 'Error al cargar la lista de cargos'
        });
      } finally {
        setLoadingCargos(false);
      }
    };

    cargarCargos();
  }, []);

  useEffect(() => {
    const cargarDistritos = async () => {
      try {
        setLoadingDistritos(true);
        const distritos = await getDistritos();
        const distritosFiltrados= distritos.filter(distrito => distrito.id_provincia === 1);
        setDistritosDisponibles(distritosFiltrados || []);
      } catch (error) {
        console.error('Error al cargar distritos:', error);
        setDistritosDisponibles([]);
        setMensaje({
          tipo: 'error',
          texto: 'Error al cargar la lista de distritos'
        });
      } finally {
        setLoadingDistritos(false);
      }
    };

    cargarDistritos();
  }, []);




  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (name === 'telefono') {
      const soloNumeros = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: soloNumeros
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (errores.cv) {
      setErrores(prev => ({
        ...prev,
        cv: ''
      }));
    }
    
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrores(prev => ({
          ...prev,
          cv: 'Solo se permiten archivos PDF'
        }));
        e.target.value = '';
        setCvFile(null);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setErrores(prev => ({
          ...prev,
          cv: 'El archivo no debe superar los 5MB'
        }));
        e.target.value = '';
        setCvFile(null);
        return;
      }
      
      setCvFile(file);
      setMensaje({ tipo: '', texto: '' });
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.apellido.trim()) {
      nuevosErrores.apellido = 'El apellido es obligatorio';
    } else if (formData.apellido.trim().length < 2) {
      nuevosErrores.apellido = 'El apellido debe tener al menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      nuevosErrores.email = 'El correo electrónico es obligatorio';
    } else {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(formData.email)) {
        nuevosErrores.email = 'El correo electrónico no es válido';
      }
    }

    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = 'El número de teléfono es obligatorio';
    } else if (formData.telefono.length !== 9) {
      nuevosErrores.telefono = 'El número de teléfono debe tener exactamente 9 dígitos';
    } else if (!/^9\d{8}$/.test(formData.telefono)) {
      nuevosErrores.telefono = 'El número debe comenzar con 9';
    }

    if (!formData.cargoPostuladoId) {
      nuevosErrores.cargoPostuladoId = 'Debe seleccionar un cargo';
    }

    if (!formData.distrito) {
      nuevosErrores.distrito = 'Debe seleccionar un distrito';
    }

    if (!cvFile) {
      nuevosErrores.cv = 'Debe adjuntar su CV en formato PDF';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
  
    
    if (!validarFormulario()) {
      setMensaje({
        tipo: 'error',
        texto: 'Por favor, corrige los errores en el formulario'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('nombre', formData.nombre.trim());
      formDataToSend.append('apellido', formData.apellido.trim());
      formDataToSend.append('email', formData.email.trim().toLowerCase());
      formDataToSend.append('telefono', formData.telefono.trim());
      formDataToSend.append('distrito', formData.distrito);
      formDataToSend.append('cargo_postulado', formData.cargoPostuladoId);
      formDataToSend.append('cv', cvFile);

      const response = await postulacionesService.crearPostulacion(formDataToSend);
      
      setMostrarModalExito(true);
      
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        distrito: '',
        cargoPostuladoId: '',
      });
      setCvFile(null);
      setErrores({});
      
      const fileInput = document.getElementById('cv-file');
      if (fileInput) fileInput.value = '';
      

      
    } catch (error) {
      console.error('Mensaje:', error.message);
      
      setMensaje({
        tipo: 'error',
        texto: error.message || 'Ocurrió un error al enviar la postulación. Por favor, intenta nuevamente.'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const cerrarModalExito = () => {
    setMostrarModalExito(false);
  };

  return (
    <>
      <section className="formulario-trabaja-section">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="formulario-card">
                <div className="formulario-card-body">
                  <div className="text-center mb-5">
                    <h2 className="form-title">
                      Completa tu Postulación
                    </h2>
                    <p className="form-subtitle">
                      Llena el formulario y adjunta tu CV en formato PDF
                    </p>
                  </div>

                  {mensaje.texto && (
                    <div
                      className={`alert alert-${mensaje.tipo === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}
                      role="alert"
                    >
                      {mensaje.texto}
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setMensaje({ tipo: '', texto: '' })}
                      ></button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="nombre" className="form-label-trabaja">
                          Nombre <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control-trabaja ${errores.nombre ? 'is-invalid' : ''}`}
                          id="nombre"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleInputChange}
                          disabled={loading}
                          placeholder="Ingrese su nombre"
                        />
                        {errores.nombre && (
                          <div className="invalid-feedback d-block">
                            {errores.nombre}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="apellido" className="form-label-trabaja">
                          Apellido <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control-trabaja ${errores.apellido ? 'is-invalid' : ''}`}
                          id="apellido"
                          name="apellido"
                          value={formData.apellido}
                          onChange={handleInputChange}
                          disabled={loading}
                          placeholder="Ingrese su apellido"
                        />
                        {errores.apellido && (
                          <div className="invalid-feedback d-block">
                            {errores.apellido}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label-trabaja">
                          Correo Electrónico <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className={`form-control-trabaja ${errores.email ? 'is-invalid' : ''}`}
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="ejemplo@correo.com"
                          disabled={loading}
                        />
                        {errores.email && (
                          <div className="invalid-feedback d-block">
                            {errores.email}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="telefono" className="form-label-trabaja">
                          Teléfono (9 dígitos) <span className="text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          className={`form-control-trabaja ${errores.telefono ? 'is-invalid' : ''}`}
                          id="telefono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          maxLength="9"
                          placeholder="987654321"
                          disabled={loading}
                        />
                        {errores.telefono && (
                          <div className="invalid-feedback d-block">
                            {errores.telefono}
                          </div>
                        )}
                      </div>

                      {/* ✅ Select de Distrito con datos dinámicos */}
                      <div className="col-12 mb-3">
                        <label htmlFor="distrito" className="form-label-trabaja">
                          Distrito <span className="text-danger">*</span>
                        </label>
                        <select
                          className={`form-select-trabaja ${errores.distrito ? 'is-invalid' : ''}`}
                          id="distrito"
                          name="distrito"
                          value={formData.distrito}
                          onChange={handleInputChange}
                          disabled={loading || distritosDisponibles.length === 0}
                        >
                          <option value="">Seleccione su distrito</option>
                          {distritosDisponibles.map((distrito) => (
                            <option key={distrito.id} value={distrito.nombre}>
                              {distrito.nombre}
                            </option>
                          ))}
                        </select>
                        {errores.distrito && (
                          <div className="invalid-feedback d-block">
                            {errores.distrito}
                          </div>
                        )}
                      </div>

                      {/* ✅ Select de Cargo con datos dinámicos */}
                      <div className="col-12 mb-3">
                        <label htmlFor="cargoPostuladoId" className="form-label-trabaja">
                          Cargo al que postula <span className="text-danger">*</span>
                        </label>
                        <select
                          className={`form-select-trabaja ${errores.cargoPostuladoId ? 'is-invalid' : ''}`}
                          id="cargoPostuladoId"
                          name="cargoPostuladoId"
                          value={formData.cargoPostuladoId}
                          onChange={handleInputChange}
                          disabled={loading || cargosDisponibles.length === 0}
                        >
                          <option value="">Seleccione un cargo</option>
                          {cargosDisponibles.map((cargo) => (
                            <option key={cargo.id} value={cargo.descripcion}>
                              {cargo.descripcion}
                            </option>
                          ))}
                        </select>
                        {errores.cargoPostuladoId && (
                          <div className="invalid-feedback d-block">
                            {errores.cargoPostuladoId}
                          </div>
                        )}
                      </div>

                      <div className="col-12 mb-4">
                        <label htmlFor="cv-file" className="form-label-trabaja">
                          Adjuntar CV (PDF) <span className="text-danger">*</span>
                        </label>
                        <input
                          type="file"
                          className={`form-control-trabaja ${errores.cv ? 'is-invalid' : ''}`}
                          id="cv-file"
                          accept=".pdf,application/pdf"
                          onChange={handleFileChange}
                          disabled={loading}
                        />
                        <div className="form-text-trabaja">
                          Formato permitido: PDF. Tamaño máximo: 5MB
                        </div>
                        {errores.cv && (
                          <div className="invalid-feedback d-block">
                            {errores.cv}
                          </div>
                        )}
                        {cvFile && !errores.cv && (
                          <div className="mt-2 file-selected-trabaja">
                            <i className="bi bi-check-circle me-2"></i>
                            Archivo seleccionado: {cvFile.name} ({(cvFile.size / 1024 / 1024).toFixed(2)} MB)
                          </div>
                        )}
                      </div>

                      <div className="col-12">
                        <button
                          type="submit"
                          className="btn-submit-trabaja"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Enviando...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-send me-2"></i>
                              Enviar Postulación
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Éxito */}
      {mostrarModalExito && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-body text-center p-5">
                  <div className="mb-4">
                    <div className="success-checkmark mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                      <div className="check-icon" style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#d4edda',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'scaleIn 0.3s ease-in-out'
                      }}>
                        <i className="bi bi-check-circle-fill" style={{ fontSize: '50px', color: '#28a745' }}></i>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="mb-3" style={{ color: '#28a745', fontWeight: '700' }}>
                    ¡Postulación Enviada con Éxito!
                  </h3>
                  
                  <p className="text-muted mb-4" style={{ fontSize: '1.1rem' }}>
                    Gracias por tu interés en formar parte de nuestro equipo. 
                    Hemos recibido tu postulación correctamente.
                  </p>
                  
                  <div className="alert alert-info mx-auto" style={{ maxWidth: '400px' }}>
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Próximos pasos:</strong>
                    <p className="mb-0 mt-2 small">
                      Nuestro equipo de recursos humanos revisará tu perfil y 
                      nos pondremos en contacto contigo dentro de los próximos días.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-success btn-lg mt-4 px-5"
                    onClick={cerrarModalExito}
                    style={{ borderRadius: '50px', fontWeight: '600' }}
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          </div>
          <style>
            {`
              @keyframes scaleIn {
                0% { transform: scale(0); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
              }
            `}
          </style>
        </>
      )}
    </>
  );
};

export default FormularioTrabaja;