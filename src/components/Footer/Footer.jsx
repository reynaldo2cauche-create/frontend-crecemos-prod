import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider
} from '@mui/material';
import {
  Facebook,
  Instagram,
  YouTube,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  
  // Función mejorada con smooth scroll compatible con iOS/Mac
  const handleNavigate = (path) => {
    navigate(path);
    
    // Esperar a que React Router termine de renderizar
    setTimeout(() => {
      // Usar smooth behavior pero con fallback para iOS
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      } catch (error) {
        // Fallback para navegadores que no soporten behavior smooth
        window.scrollTo(0, 0);
      }
    }, 50);
  };
 
  return (
    <footer id="footer" className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="row gy-4">
            
            {/* Columna 1: Información */}
            <div className="col-lg-3 col-md-6 footer-about">
              <a href="/" className="logo d-flex align-items-center">
                <img src="/logo-text-short.png" alt="Crecemos Logo"/>
              </a>
              <div className="footer-contact pt-3">
                <p>Calle 48 Nro. 234 Urbanización El Pinar, Comas 15316</p>
                <p>Lima, Perú</p>
                <p>
                  <strong>WhatsApp:</strong>{' '}
                  <a href="tel:+51957064401">
                    <span>+51 957 064 401</span>
                  </a>
                </p>
                <p>
                  <strong>Email:</strong>
                  <a href="mailto:info@crecemos.com.pe?subject=Consulta%20desde%20la%20web&body=Hola,%20quisiera%20más%20información%20sobre...">
                    {' '}<span>info@crecemos.com.pe</span>
                  </a>
                </p>
              </div>
              <div className="social-links d-flex mt-4">
                <a href="https://www.facebook.com/crecemos" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-facebook" />
                </a>
                <a href="https://www.instagram.com/centro_crecemos/" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-instagram" />
                </a>
                <a href="https://www.youtube.com/@centrodeterapiacrecemos677" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-youtube" />
                </a>
                <a href="https://www.tiktok.com/@centrocrecemos" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-tiktok" />
                </a>
              </div>
            </div>

            {/* Columna 2: Enlaces */}
            <div className="col-lg-3 col-md-6 footer-links">
              <h4>Enlaces Útiles</h4>
              <ul>
                <li><a href="/">Inicio</a></li>
                <li><a href="/nosotros">Nosotros</a></li>
                <li><a href="/servicios">Servicios</a></li>
                <li><a href="/staff">Especialistas</a></li>
                <li><a href="/blog">Blog</a></li>
                <li><a href="/contactanos">Contacto</a></li>
                <li><a href="/verificar-beneficios">Consultar Beneficios</a></li>
                <li><a href="/verificar-documento">Verificar Documentos</a></li>
              </ul>
            </div>

            {/* Columna 3: Horarios y Libro de Reclamaciones */}
            <div className="col-lg-3 col-md-6 footer-links">
              <h4>Horarios de Atención</h4>
              <ul>
                <li>Lunes - Viernes: 11:00 AM - 8:00 PM</li>
                <li>Sábados: 8:00 AM - 2:00 PM</li>
                <li>Domingos: Cerrado</li>
              </ul>
              
              {/* Sección Libro de Reclamaciones */}
              <div className="libro-reclamaciones mt-4" style={{ textAlign: 'left' }}>
                <h4>Libro de Reclamaciones</h4>
                <div>
                  <a 
                    href="#" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      handleNavigate('/libro-reclamaciones');
                    }}
                    style={{ 
                      display: 'inline-block', 
                      textDecoration: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <img 
                      src="/assets/img/libro-reclamaciones.webp" 
                      alt="Libro de Reclamaciones" 
                      style={{
                        width: '100px',
                        height: 'auto',
                        borderRadius: '6px',
                        transition: 'transform 0.3s ease',
                        marginLeft: '0'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    />
                  </a>
                </div>
              </div>
            </div>

            {/* Columna 4: Legales */}
            <div className="col-lg-3 col-md-6 footer-links">
              <h4>Legales</h4>
              <ul>
                <li>
                  <a href="#" onClick={(e) => { 
                    e.preventDefault(); 
                    handleNavigate('/registro-paciente');
                  }}>
                    Registro de Paciente
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { 
                    e.preventDefault(); 
                    handleNavigate('/trabaja-nosotros');
                  }}>
                    Trabaja con Nosotros
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { 
                    e.preventDefault(); 
                    handleNavigate('/terminos-condiciones');
                  }}>
                    Términos y Condiciones
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { 
                    e.preventDefault(); 
                    handleNavigate('/politica-privacidad');
                  }}>
                    Política de Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { 
                    e.preventDefault(); 
                    handleNavigate('/reglamento-interno');
                  }}>
                    Reglamento Interno para Clientes
                  </a>
                </li>
                  <li>
                  <a href="#" onClick={(e) => { 
                    e.preventDefault(); 
                    handleNavigate('/campanas');
                  }}>
                    Campañas
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      <div className="container copyright text-center mt-4">
        <p>
          © <span>Copyright</span> <strong className="px-1 sitename">Centro Crecemos</strong>{' '}
          <span>Todos los derechos reservados</span>
        </p>
        <div className="credits">
          Desarrollado por Vaxa |{' '}
          <a href="https://www.vaxasys.com" target="_blank" rel="noopener noreferrer">
            www.vaxasys.com
          </a>
        </div>
      </div>
    </footer>
  );
}