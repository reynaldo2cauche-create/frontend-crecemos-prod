import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Divider, Grid, TextField, Typography, styled, useMediaQuery, useTheme } from '@mui/material'
import { FontSize, ThemePalette } from '../theme/theme'
import { AccessTime, Edit, LocationOn, MailOutline, PhoneInTalk } from '@mui/icons-material';
import { CButton } from '../components/Button';
import emailjs from '@emailjs/browser';
import { initializePageScripts } from '../utils/initScripts';

export const ContactUs = () => {
  
   useEffect(() => {
    initializePageScripts();
    emailjs.init("89VA2AX2iodlkfUDp"); // tu Public Key
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    subject: '',
    message: ''
  });

  
 const [errors, setErrors] = useState({}); // Para mensajes de error inline
  const [formStatus, setFormStatus] = useState({
    loading: false,
    success: false
  });

  const [showModal, setShowModal] = useState(false);

  // Validación inline
  const validateField = (name, value) => {
    switch(name){
      case 'name':
        if(!value.trim()) return "El nombre es obligatorio.";
        break;
      case 'email':
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Por favor ingresa un correo válido.";
        break;
      case 'phone':
        if(!/^\d{9}$/.test(value))
          return "El número debe tener exactamente 9 dígitos.";
        break;
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validación al escribir
    const errorMsg = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar todos los campos obligatorios antes de enviar
    const newErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      phone: validateField('phone', formData.phone)
    };

    setErrors(newErrors);

    // Si hay errores, no enviar
    if(Object.values(newErrors).some(msg => msg)) return;

    setFormStatus({ loading: true, success: false });

    try {
      const templateParams = {
        to_email: 'info@crecemos.com.pe',
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone,
        service: formData.service,
        subject: formData.subject,
        message: formData.message,
        reply_to: formData.email
      };

      const response = await emailjs.send(
        'service_4z5rxtl',
        'template_6asz72w',
        templateParams
      );

      if(response.status === 200){
        setFormStatus({ loading: false, success: true });
        setFormData({ name: '', email: '', phone: '', service: '', subject: '', message: '' });
        setErrors({});
        setShowModal(true);
      }
    } catch (error) {
      console.error(error);
      setFormStatus({ loading: false, success: false });
      alert("Error al enviar el mensaje. Intenta nuevamente.");
    }
  };


  return (
    <main className="main">
      <div className="page-title" data-aos="fade">
        <div className="container">
          <h1>Contáctanos</h1>
          <p className="page-subtitle">
            Estamos aquí para resolver tus dudas y brindarte la mejor atención. Escríbenos o visítanos.
          </p>
          <nav className="breadcrumbs">
            <ol>
              <li><a href="/">Inicio</a></li>
              <li className="current">Contacto</li>
            </ol>
          </nav>
        </div>
      </div>

      <section id="contact" className="contact section light-background">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row g-4 g-lg-5">
            <div className="col-lg-5">
              <div className="info-box" data-aos="fade-up" data-aos-delay="200">
                <h3>Información de Contacto</h3>
                <p>
                  En Centro Crecemos brindamos atención especializada en terapias de rehabilitación 
                  y desarrollo integral para niños y adultos.
                </p>

                <div className="info-item" data-aos="fade-up" data-aos-delay="300">
                  <div className="icon-box">
                    <i className="bi bi-geo-alt"></i>
                  </div>
                  <div className="content">
                    <h4>Nuestra Ubicación</h4>
                    <p>Calle 48 Nro. 234</p>
                    <p>Urbanización El Pinar, Comas 15316</p>
                    <p>Lima, Perú</p>
                  </div>
                </div>

                <div className="info-item" data-aos="fade-up" data-aos-delay="400">
                  <div className="icon-box">
                    <i className="bi bi-telephone"></i>
                  </div>
                  <div className="content">
                    <h4>Teléfonos</h4>
                    <p><strong>WhatsApp:</strong> +51 957 064 401</p>
                  </div>
                </div>

                <div className="info-item" data-aos="fade-up" data-aos-delay="500">
                  <div className="icon-box">
                    <i className="bi bi-envelope"></i>
                  </div>
                  <div className="content">
                    <h4>Correo Electrónico</h4>
                    <p>info@crecemos.com.pe</p>
                  </div>
                </div>

                <div className="info-item" data-aos="fade-up" data-aos-delay="600">
                  <div className="icon-box">
                    <i className="bi bi-clock"></i>
                  </div>
                  <div className="content">
                    <h4>Horarios de Atención</h4>
                    <p><strong>Lunes - Viernes:</strong> 11:00 AM - 8:00 PM</p>
                    <p><strong>Sábados:</strong> 8:00 AM - 2:00 PM</p>
                    <p><strong>Domingos:</strong> Cerrado</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="contact-form" data-aos="fade-up" data-aos-delay="300">
                <h3>Ponte en Contacto</h3>
                <p>
                  Completa el formulario y te contactaremos a la brevedad para brindarte información 
                  sobre nuestros servicios de terapia y rehabilitación.
                </p>

                <form className="php-email-form" data-aos="fade-up" data-aos-delay="200" onSubmit={handleSubmit}>
                  <div className="row gy-4">
                    <div className="col-md-6">
                      <input 
                        type="text" 
                        name="name" 
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        placeholder="Tu Nombre Completo" 
                   
                        value={formData.name}
                        onChange={handleChange}
                      />
                       {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>

                    <div className="col-md-6">
                      <input 
                        type="text" 
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                        name="email" 
                        placeholder="Tu Correo Electrónico" 
                        
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>

                    <div className="col-md-6">
                      <input 
                        type="tel" 
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        name="phone" 
                        placeholder="Tu Número de Teléfono" 
                       
                        value={formData.phone}
                        onChange={handleChange}
                      />
                      {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                    </div>

                    <div className="col-md-6">
                      <select 
                        className="form-control" 
                        name="service" 
                      
                        value={formData.service}
                        onChange={handleChange}
                      >
                        <option value="">Servicio de Interés</option>
                        <option value="Psicología Infantil">Psicología Infantil</option>
                        <option value="Fisioterapia">Fisioterapia</option>
                        <option value="Terapia de Lenguaje">Terapia de Lenguaje</option>
                        <option value="Terapia Ocupacional">Terapia Ocupacional</option>
                        <option value="Estimulación Temprana">Estimulación Temprana</option>
                        <option value="Terapia Familiar">Terapia Familiar</option>
                        <option value="Talleres Terapéuticos">Talleres Terapéuticos</option>
                        <option value="Consulta General">Consulta General</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <input 
                        type="text" 
                        className="form-control" 
                        name="subject" 
                        placeholder="Asunto del Mensaje" 
                      
                        value={formData.subject}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12">
                      <textarea 
                        className="form-control" 
                        name="message" 
                        rows="6" 
                        placeholder="Cuéntanos sobre tu consulta o necesidad específica..." 
                       
                        value={formData.message}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                   
                     <div className="col-12 text-center">
                      {formStatus.error && (
                        <div className="alert alert-danger">{formStatus.error}</div>
                      )}
                      {formStatus.success && !showModal && (
                        <div className="alert alert-success">
                          ¡Tu mensaje ha sido enviado exitosamente!
                        </div>
                      )}


                       <button
                        type="submit"
                        className="btn"
                        disabled={formStatus.loading}
                      >
                        {formStatus.loading ? 'Enviando...' : 'Enviar Mensaje'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="row mt-5">
              <div className="col-12" data-aos="fade-up" data-aos-delay="400">
                <div 
                  className="map-container" 
                  style={{ 
                    borderRadius: '15px', 
                    overflow: 'hidden', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)' 
                  }}
                >
                  <iframe 
                    src="https://maps.google.com/maps?q=Centro+de+Terapias+Crecemos,+Calle+48,+Urbanización+El+Pinar,+Comas+15316,+Lima,+Peru&t=&z=18&ie=UTF8&iwloc=&output=embed"
                    width="100%" 
                    height="400" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación Centro Crecemos - Calle 48, Urbanización El Pinar, Comas"
                  ></iframe>
                </div>
                <div className="text-center mt-3">
                  <p className="text-muted">
                    <i className="bi bi-geo-alt-fill"></i> 
                    <strong>Centro Crecemos:</strong> Calle 48 Nro. 234, Urbanización El Pinar, Comas 15316, Lima - Perú
                  </p>
                  <a 
                    href="https://www.google.com/maps/search/Centro+de+Terapias+Crecemos+Calle+48+Urbanización+El+Pinar+Comas+Lima" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    <i className="bi bi-map"></i> Ver en Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
{showModal && (
  <div 
    className="modal fade show" 
    style={{ display: "block", background: "rgba(0,0,0,0.6)" }}
  >
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content" style={{ borderRadius: "20px", textAlign: "center", padding: "30px" }}>
        
        {/* Ícono check minimal */}
        <div 
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "#4caf50",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px"
          }}
        >
          <i className="bi bi-check2" style={{ fontSize: "40px", color: "#fff" }}></i>
        </div>

        <h4 style={{ marginBottom: "10px", color: "#2e7d32" }}>¡Enviado con éxito!</h4>
        <p style={{ color: "#555", fontSize: "15px" }}>
          Hemos recibido tu mensaje y te contactaremos pronto.
        </p>

        <button 
          className="btn btn-success mt-3 px-4"
          style={{ borderRadius: "10px" }}
          onClick={() => setShowModal(false)}
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}
    </main>
  );
}