import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { initializePageScripts } from '../utils/initScripts';
import Reveal from '../components/public/Reveal';
import RevealText from '../components/public/RevealText';
import Decor from '../components/public/Decor';

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
    switch (name) {
      case 'name':
        if (!value.trim()) return "El nombre es obligatorio.";
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Por favor ingresa un correo válido.";
        break;
      case 'phone':
        if (!/^\d{9}$/.test(value))
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
    if (Object.values(newErrors).some(msg => msg)) return;

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

      if (response.status === 200) {
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

  const infoItems = [
    {
      icon: 'bi-geo-alt-fill',
      title: 'Nuestra ubicación',
      lines: ['Calle 48 Nro. 234', 'Urb. El Pinar, Comas 15316', 'Lima, Perú'],
    },
    {
      icon: 'bi-whatsapp',
      title: 'WhatsApp',
      lines: ['+51 957 064 401'],
    },
    {
      icon: 'bi-envelope-fill',
      title: 'Correo electrónico',
      lines: ['info@crecemos.com.pe'],
    },
    {
      icon: 'bi-clock-fill',
      title: 'Horarios de atención',
      lines: ['Lun - Vie: 11:00 AM - 8:00 PM', 'Sábados: 8:00 AM - 2:00 PM', 'Domingos: Cerrado'],
    },
  ];

  return (
    <main className="cx-page">
      {/* Encabezado premium */}
      <section className="cx-subhero">
        <Decor variant="a" />
        <div className="cx-container">
          <Reveal className="cx-subhero-inner">
            <span className="cx-eyebrow"><i className="bi bi-envelope-heart-fill" /> Contacto</span>
            <RevealText as="h1" text="Contáctanos" />
            <p>Estamos aquí para resolver tus dudas y brindarte la mejor atención. Escríbenos o visítanos.</p>
            <div className="cx-contact-chips">
              <span><i className="bi bi-lightning-charge-fill" /> Respuesta en 24h</span>
              <span><i className="bi bi-person-hearts" /> Atención personalizada</span>
              <span><i className="bi bi-patch-check-fill" /> Terapeutas certificados</span>
            </div>
            <nav className="cx-breadcrumb">
              <Link to="/">Inicio</Link>
              <i className="bi bi-chevron-right" />
              <span>Contacto</span>
            </nav>
          </Reveal>
        </div>
      </section>

      <section className="cx-section cx-section--deco cx-contact-section">
        <Decor variant="b" />
        <span className="cx-contact-aurora" aria-hidden="true" />
        <div className="cx-container">
          <div className="cx-contact-grid">
            {/* IZQUIERDA — información */}
            <Reveal className="cx-contact-aside" direction="right" y={24}>
              <span className="cx-eyebrow"><i className="bi bi-headset" /> Estamos para ayudarte</span>
              <h2 className="cx-contact-aside-title">Conversemos sobre tu bienestar</h2>
              <p className="cx-contact-aside-lead">
                Escríbenos por el medio que prefieras. Nuestro equipo te responderá lo antes posible
                para orientarte sobre nuestros servicios de terapia y rehabilitación.
              </p>

              <ul className="cx-contact-list">
                {infoItems.map((item, idx) => (
                  <li className="cx-contact-litem" key={idx}>
                    <span className="cx-contact-lic"><i className={`bi ${item.icon}`} /></span>
                    <div className="cx-contact-lbody">
                      <h4>{item.title}</h4>
                      {item.lines.map((l, i) => <p key={i}>{l}</p>)}
                    </div>
                  </li>
                ))}
              </ul>

              <a
                href="https://wa.me/51957064401"
                target="_blank"
                rel="noopener noreferrer"
                className="cx-btn cx-btn-primary cx-contact-wa"
              >
                <i className="bi bi-whatsapp" /> Escríbenos por WhatsApp
              </a>

              <div className="cx-contact-socials">
                <span>Síguenos</span>
                <div className="cx-contact-social-links">
                  <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="bi bi-facebook" /></a>
                  <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="bi bi-instagram" /></a>
                  <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><i className="bi bi-tiktok" /></a>
                  <a href="https://wa.me/51957064401" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i className="bi bi-whatsapp" /></a>
                </div>
              </div>
            </Reveal>

            {/* DERECHA — formulario */}
            <Reveal className="cx-contact-form" direction="left" y={24} delay={0.08}>
              <span className="cx-contact-form-glow" aria-hidden="true" />
              <div className="cx-form-head">
                <span className="cx-form-badge"><i className="bi bi-chat-heart-fill" /></span>
                <div className="cx-form-head-txt">
                  <h3>Envíanos un mensaje</h3>
                  <p>Completa el formulario y te contactaremos a la brevedad.</p>
                </div>
              </div>

              <form className="cx-form" onSubmit={handleSubmit} noValidate>
                <div className="cx-form-grid">
                  <div className="cx-field">
                    <label htmlFor="name">Nombre completo <span>*</span></label>
                    <div className={`cx-input-wrap ${errors.name ? 'is-error' : ''}`}>
                      <i className="bi bi-person-fill" />
                      <input
                        id="name" type="text" name="name" className="cx-input"
                        placeholder="Tu nombre completo"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.name && <span className="cx-field-error"><i className="bi bi-exclamation-circle" /> {errors.name}</span>}
                  </div>

                  <div className="cx-field">
                    <label htmlFor="email">Correo electrónico <span>*</span></label>
                    <div className={`cx-input-wrap ${errors.email ? 'is-error' : ''}`}>
                      <i className="bi bi-envelope-fill" />
                      <input
                        id="email" type="email" name="email" className="cx-input"
                        placeholder="tucorreo@ejemplo.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.email && <span className="cx-field-error"><i className="bi bi-exclamation-circle" /> {errors.email}</span>}
                  </div>

                  <div className="cx-field">
                    <label htmlFor="phone">Teléfono <span>*</span></label>
                    <div className={`cx-input-wrap ${errors.phone ? 'is-error' : ''}`}>
                      <i className="bi bi-telephone-fill" />
                      <input
                        id="phone" type="tel" name="phone" className="cx-input"
                        placeholder="9 dígitos"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.phone && <span className="cx-field-error"><i className="bi bi-exclamation-circle" /> {errors.phone}</span>}
                  </div>

                  <div className="cx-field">
                    <label htmlFor="service">Servicio de interés</label>
                    <div className="cx-input-wrap">
                      <i className="bi bi-heart-pulse-fill" />
                      <select
                        id="service" name="service" className="cx-input cx-select"
                        value={formData.service}
                        onChange={handleChange}
                      >
                        <option value="">Selecciona un servicio</option>
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
                  </div>

                  <div className="cx-field cx-field--full">
                    <label htmlFor="subject">Asunto</label>
                    <div className="cx-input-wrap">
                      <i className="bi bi-chat-left-text-fill" />
                      <input
                        id="subject" type="text" name="subject" className="cx-input"
                        placeholder="Asunto del mensaje"
                        value={formData.subject}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="cx-field cx-field--full">
                    <label htmlFor="message">Mensaje</label>
                    <div className="cx-input-wrap cx-input-wrap--area">
                      <i className="bi bi-pencil-fill" />
                      <textarea
                        id="message" name="message" rows="6" className="cx-input cx-textarea"
                        placeholder="Cuéntanos sobre tu consulta o necesidad específica..."
                        value={formData.message}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {formStatus.success && !showModal && (
                  <div className="cx-form-alert cx-form-alert--ok">
                    <i className="bi bi-check-circle-fill" /> ¡Tu mensaje ha sido enviado exitosamente!
                  </div>
                )}

                <button type="submit" className="cx-btn cx-btn-primary cx-form-submit" disabled={formStatus.loading}>
                  {formStatus.loading ? (
                    <><span className="cx-btn-spinner" /> Enviando...</>
                  ) : (
                    <><i className="bi bi-send-fill" /> Enviar mensaje</>
                  )}
                </button>
              </form>
            </Reveal>
          </div>

          {/* Mapa */}
          <Reveal className="cx-contact-map" y={30}>
            <div className="cx-contact-map-frame">
              <iframe
                src="https://maps.google.com/maps?q=Centro+de+Terapias+Crecemos,+Calle+48,+Urbanización+El+Pinar,+Comas+15316,+Lima,+Peru&t=&z=18&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="420"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Centro Crecemos - Calle 48, Urbanización El Pinar, Comas"
              />
            </div>
            <div className="cx-contact-map-foot">
              <p><i className="bi bi-geo-alt-fill" /> <strong>Centro Crecemos:</strong> Calle 48 Nro. 234, Urb. El Pinar, Comas 15316, Lima - Perú</p>
              <a
                href="https://www.google.com/maps/search/Centro+de+Terapias+Crecemos+Calle+48+Urbanización+El+Pinar+Comas+Lima"
                target="_blank"
                rel="noopener noreferrer"
                className="cx-btn cx-btn-ghost"
              >
                <i className="bi bi-map" /> Ver en Google Maps
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA final */}
      <section className="cx-section">
        <div className="cx-container">
          <Reveal className="cx-cta-band" y={30}>
            <span className="cx-cta-glow" aria-hidden="true" />
            <span className="cx-cta-glow cx-cta-glow--2" aria-hidden="true" />
            <div className="cx-cta-content">
              <span className="cx-cta-eyebrow"><i className="bi bi-calendar-heart" /> Da el primer paso</span>
              <RevealText as="h2" text="¿Prefieres agendar tu cita de una vez?" />
              <p>Nuestro equipo está listo para acompañarte. Escríbenos por WhatsApp o revisa todos nuestros servicios.</p>
              <div className="cx-cta-actions">
                <a href="https://wa.me/51957064401" target="_blank" rel="noopener noreferrer" className="cx-btn cx-cta-btn">
                  <span>Agendar por WhatsApp</span>
                  <i className="bi bi-whatsapp" />
                </a>
                <Link to="/servicios" className="cx-btn cx-cta-btn-ghost">
                  Ver servicios
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Modal de éxito */}
      {showModal && (
        <div className="cx-ok-backdrop" onClick={() => setShowModal(false)}>
          <div className="cx-ok-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cx-ok-icon"><i className="bi bi-check2" /></div>
            <h4>¡Enviado con éxito!</h4>
            <p>Hemos recibido tu mensaje y te contactaremos pronto.</p>
            <button className="cx-btn cx-btn-primary" onClick={() => setShowModal(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
