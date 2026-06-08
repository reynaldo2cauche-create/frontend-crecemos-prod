import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
  const [mobileNavActive, setMobileNavActive] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const toggleMobileNav = () => {
    setMobileNavActive(!mobileNavActive);
    document.body.classList.toggle('mobile-nav-active');
  };

  const closeMobileNav = () => {
    setMobileNavActive(false);
    document.body.classList.remove('mobile-nav-active');
    setDropdownOpen(false);
  };

  const handleMouseEnter = () => {
    if (window.innerWidth >= 1200) {
      setDropdownOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 1200) {
      setDropdownOpen(false);
    }
  };

  const handleDropdownToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.innerWidth < 1200) {
      setDropdownOpen(!dropdownOpen);
    }
  };

  const handleServiciosClick = (e) => {
    if (window.innerWidth < 1200) {
      e.preventDefault();
      setDropdownOpen(!dropdownOpen);
    } else {
      closeMobileNav();
    }
  };

  useEffect(() => {
    return () => {
      document.body.classList.remove('mobile-nav-active');
    };
  }, []);

  useEffect(() => {
    closeMobileNav();
  }, [location]);

  const isServiciosActive = location.pathname === '/servicios' || 
                           location.pathname.includes('/infantil-') || 
                           location.pathname.includes('/adulto-');

  return (
    <header id="header" className="header d-flex align-items-center fixed-top">
      <div className="container-fluid container-xl position-relative d-flex align-items-center">
        <div className="header-container">
          
          {/* Logo */}
          <Link to="/" className="logo d-flex align-items-center me-auto me-xl-0">
            <img src="/synap-logo.png" alt="Synap Logo" />
          </Link>

          {/* Menú de Navegación */}
          <nav id="navmenu" className="navmenu">
            <ul>
              <li>
                <Link 
                  to="/" 
                  className={location.pathname === '/' ? 'active' : ''}
                  onClick={closeMobileNav}
                >
                  Inicio
                </Link>
              </li>
              
              <li>
                <Link 
                  to="/nosotros" 
                  className={location.pathname === '/nosotros' ? 'active' : ''}
                  onClick={closeMobileNav}
                >
                  Nosotros
                </Link>
              </li>
              
              <li 
                className={`dropdown ${dropdownOpen ? 'dropdown-active' : ''}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link 
                  to="/servicios"
                  className={isServiciosActive ? 'active' : ''}
                  onClick={handleServiciosClick}
                >
                  <span>Servicios</span>
                  <i 
                    className="bi bi-chevron-down toggle-dropdown"
                    onClick={handleDropdownToggle}
                  />
                </Link>
                <ul>
                  <li className="dropdown-header">
                    <strong>Área Infantil y Adolescentes</strong>
                  </li>
                  <li>
                    <Link to="/infantil-terapia-lenguaje" onClick={closeMobileNav}>
                      Terapia de Lenguaje
                    </Link>
                  </li>
                  <li>
                    <Link to="/infantil-terapia-ocupacional" onClick={closeMobileNav}>
                      Terapia Ocupacional
                    </Link>
                  </li>
                  <li>
                    <Link to="/infantil-terapia-aprendizaje" onClick={closeMobileNav}>
                      Terapia de Aprendizaje
                    </Link>
                  </li>
                  <li>
                    <Link to="/infantil-psicologia-infantil" onClick={closeMobileNav}>
                      Psicología Infantil
                    </Link>
                  </li>
                  <li>
                    <Link to="/infantil-evaluacion-psicologica-colegio" onClick={closeMobileNav}>
                      Evaluación Psicológica para el Colegio
                    </Link>
                  </li>
                  <li>
                    <Link to="/infantil-orientacion-vocacional" onClick={closeMobileNav}>
                      Orientación Vocacional
                    </Link>
                  </li>
                  
                  <li className="dropdown-divider" />
                  
                  <li className="dropdown-header">
                    <strong>Área Adultos</strong>
                  </li>
                  <li>
                    <Link to="/adulto-psicologia-individual" onClick={closeMobileNav}>
                      Psicoterapia Individual
                    </Link>
                  </li>
                  <li>
                    <Link to="/adulto-terapia-pareja" onClick={closeMobileNav}>
                      Terapia de Pareja
                    </Link>
                  </li>
                  <li>
                    <Link to="/adulto-terapia-familiar" onClick={closeMobileNav}>
                      Terapia Familiar
                    </Link>
                  </li>
                  <li>
                    <Link to="/adulto-terapia-lenguaje" onClick={closeMobileNav}>
                      Terapia de Lenguaje
                    </Link>
                  </li>
                  <li>
                    <Link to="/adulto-evaluacion-psicologica-universidad" onClick={closeMobileNav}>
                      Evaluación Psicológica para Universidad
                    </Link>
                  </li>
                </ul>
              </li>
              
              <li>
                <Link
                  to="/staff"
                  className={location.pathname === '/staff' ? 'active' : ''}
                  onClick={closeMobileNav}
                >
                  Especialistas
                </Link>
              </li>

              <li>
                <Link
                  to="/blog"
                  className={location.pathname === '/blog' || location.pathname.includes('/blog/') ? 'active' : ''}
                  onClick={closeMobileNav}
                >
                  Blog
                </Link>
              </li>

              <li>
                <Link
                  to="/contactanos"
                  className={location.pathname === '/contactanos' ? 'active' : ''}
                  onClick={closeMobileNav}
                >
                  Contacto
                </Link>
              </li>
            </ul>
            
            <i 
              className={`mobile-nav-toggle d-xl-none bi ${mobileNavActive ? 'bi-x' : 'bi-list'}`}
              onClick={toggleMobileNav}
            />
          </nav>

          {/* Botón CTA */}
          <Link className="btn-getstarted" to="/contactanos" onClick={closeMobileNav}>
            Agenda tu cita
          </Link>

        </div>
      </div>
    </header>
  );
}