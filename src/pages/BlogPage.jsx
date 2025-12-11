import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { blogMetadata, getBlogsByCategory } from '../data/blogMetadata';
import { initializePageScripts } from '../utils/initScripts';

export default function BlogPage() {
  const [categoriaActiva, setCategoriaActiva] = useState('todos');

  useEffect(() => {
    initializePageScripts();
    window.scrollTo(0, 0);
  }, []);

  const categoriasBlog = [
    {
      id: 'todos',
      nombre: 'Todos',
      icon: 'bi-grid-3x3-gap',
      color: '#6c757d'
    },
    {
      id: 'nutricion',
      nombre: 'Nutrición',
      icon: 'bi-apple',
      color: '#50C878'
    },
    {
      id: 'desarrollo-infantil',
      nombre: 'Desarrollo Infantil',
      icon: 'bi-stars',
      color: '#FF6B9D'
    },
    {
      id: 'psicologia',
      nombre: 'Psicología y Bienestar',
      icon: 'bi-heart-pulse',
      color: '#4A90E2'
    },
    {
      id: 'terapias',
      nombre: 'Terapias',
      icon: 'bi-chat-dots',
      color: '#9B59B6'
    },
    {
      id: 'familia',
      nombre: 'Familia y Crianza',
      icon: 'bi-people',
      color: '#E74C3C'
    },
    {
      id: 'educacion',
      nombre: 'Educación',
      icon: 'bi-book',
      color: '#F39C12'
    },
    {
      id: 'efemerides',
      nombre: 'Eventos Conmemorativos',
      icon: 'bi-calendar-event',
      color: '#c263f9'
    }
  ];

  // Obtener posts filtrados por categoría
  const postsFiltrados = getBlogsByCategory(categoriaActiva);

  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section" style={{ paddingTop: '140px', paddingBottom: '80px', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7" data-aos="fade-right">
              <div className="company-badge mb-4" style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '10px 24px',
                background: 'white',
                border: '2px solid #c263f9',
                borderRadius: '30px',
                color: '#c263f9',
                fontWeight: '600',
                fontSize: '0.95rem',
                boxShadow: '0 4px 12px rgba(194, 99, 249, 0.15)'
              }}>
                <i className="bi bi-journal-text me-2"></i>
                Blog Centro Crecemos
              </div>

              <h1 className="mb-4" style={{
                color: '#2d465e',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: '700',
                lineHeight: '1.2'
              }}>
                Recursos y Guías <br />
                para el Desarrollo <br />
                <span style={{
                  background: 'linear-gradient(135deg, #c263f9 0%, #d99ffd 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Infantil y Familiar</span>
              </h1>

              <p className="mb-5" style={{
                fontSize: '1.15rem',
                color: '#555',
                lineHeight: '1.7',
                maxWidth: '600px'
              }}>
                Consejos prácticos, información nutricional y recursos especializados para acompañar
                el crecimiento y bienestar de tus hijos.
              </p>

              <div className="hero-buttons">
                <a href="#blog-posts" className="btn btn-primary me-3" style={{
                  background: 'linear-gradient(135deg, #c263f9 0%, #d99ffd 100%)',
                  border: 'none',
                  padding: '14px 35px',
                  borderRadius: '30px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: '0 6px 20px rgba(194, 99, 249, 0.3)',
                  transition: 'all 0.3s ease'
                }}>
                  <i className="bi bi-arrow-down-circle me-2"></i>
                  Ver Artículos
                </a>
              </div>
            </div>

            <div className="col-lg-5" data-aos="fade-left" data-aos-delay="100">
              <div className="position-relative" style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: '24px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
              }}>
                <div className="mb-4 pb-4" style={{ borderBottom: '2px solid #f0f0f0' }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: 'linear-gradient(135deg, #c263f9 0%, #d99ffd 100%)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <i className="bi bi-lightbulb" style={{ fontSize: '2.2rem', color: 'white' }}></i>
                  </div>
                  <h3 style={{ color: '#2d465e', fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: '700' }}>
                    Aprende con nosotros
                  </h3>
                  <p style={{ color: '#666', marginBottom: '0', fontSize: '1rem' }}>
                    Contenido especializado para el desarrollo integral
                  </p>
                </div>

                <div className="d-flex align-items-center gap-3 mb-3">
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: 'rgba(194, 99, 249, 0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="bi bi-book" style={{ fontSize: '1.5rem', color: '#c263f9' }}></i>
                  </div>
                  <div>
                    <h5 style={{ color: '#2d465e', marginBottom: '0.2rem', fontSize: '1.1rem' }}>Guías Prácticas</h5>
                    <p style={{ color: '#888', marginBottom: '0', fontSize: '0.9rem' }}>Recursos descargables</p>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3 mb-3">
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: 'rgba(194, 99, 249, 0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="bi bi-heart-pulse" style={{ fontSize: '1.5rem', color: '#c263f9' }}></i>
                  </div>
                  <div>
                    <h5 style={{ color: '#2d465e', marginBottom: '0.2rem', fontSize: '1.1rem' }}>Nutrición Infantil</h5>
                    <p style={{ color: '#888', marginBottom: '0', fontSize: '0.9rem' }}>Alimentación saludable</p>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: 'rgba(194, 99, 249, 0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="bi bi-people" style={{ fontSize: '1.5rem', color: '#c263f9' }}></i>
                  </div>
                  <div>
                    <h5 style={{ color: '#2d465e', marginBottom: '0.2rem', fontSize: '1.1rem' }}>Apoyo Familiar</h5>
                    <p style={{ color: '#888', marginBottom: '0', fontSize: '0.9rem' }}>Desarrollo integral</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías Section */}
      <section className="section" style={{ paddingTop: '60px', paddingBottom: '30px', background: '#fff' }}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h3 className="text-center mb-4" style={{ color: '#2d465e', fontWeight: '700', fontSize: '1.5rem' }} data-aos="fade-up">
                Explora por Categoría
              </h3>
              <div className="categories-filter" data-aos="fade-up" data-aos-delay="100">
                {categoriasBlog.map((categoria, index) => (
                  <button
                    key={categoria.id}
                    onClick={() => setCategoriaActiva(categoria.id)}
                    className={`category-btn ${categoriaActiva === categoria.id ? 'active' : ''}`}
                    style={{
                      '--category-color': categoria.color
                    }}
                  >
                    <i className={`bi ${categoria.icon} me-2`}></i>
                    {categoria.nombre}
                    {categoria.id === 'todos' && (
                      <span className="badge-count">{blogMetadata.length}</span>
                    )}
                    {categoria.id !== 'todos' && (
                      <span className="badge-count">
                        {blogMetadata.filter(post => post.category === categoria.id).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Section */}
      <section id="blog-posts" className="section light-background">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-header text-center mb-5" data-aos="fade-up">
                <h2 style={{ color: '#2d465e' }}>
                  {categoriaActiva === 'todos' 
                    ? 'Todos los Artículos' 
                    : `Artículos de ${categoriasBlog.find(c => c.id === categoriaActiva)?.nombre}`}
                </h2>
                <p style={{ color: '#666' }}>
                  {postsFiltrados.length} {postsFiltrados.length === 1 ? 'artículo' : 'artículos'} {postsFiltrados.length === 1 ? 'encontrado' : 'encontrados'}
                </p>
              </div>
            </div>
          </div>

          <div className="row gy-4">
            {postsFiltrados.length > 0 ? (
              postsFiltrados.map((post, index) => (
                <div className="col-lg-4 col-md-6" key={post.id} data-aos="fade-up" data-aos-delay={index * 100}>
                  <article className="blog-card">
                    <div className="blog-card-img">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="img-fluid"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.style.background = 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)';
                          e.target.parentElement.style.minHeight = '250px';
                        }}
                      />
                      <div className="blog-card-category">{post.categoryName}</div>
                    </div>

                    <div className="blog-card-content">
                      <div className="blog-card-meta mb-3">
                        <span className="me-3">
                          <i className="bi bi-calendar3 me-1"></i>
                          {post.date}
                        </span>
                        <span>
                          <i className="bi bi-clock me-1"></i>
                          {post.readTime}
                        </span>
                      </div>

                      <h3 className="blog-card-title">
                        <Link to={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>

                      <p className="blog-card-excerpt">{post.excerpt}</p>

                      <Link to={`/blog/${post.slug}`} className="blog-card-link">
                        Leer más
                        <i className="bi bi-arrow-right ms-2"></i>
                      </Link>
                    </div>
                  </article>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="text-center py-5">
                  <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#ccc' }}></i>
                  <h3 className="mt-3" style={{ color: '#666' }}>No hay artículos en esta categoría</h3>
                  <p style={{ color: '#999' }}>Pronto agregaremos más contenido</p>
                  <button 
                    onClick={() => setCategoriaActiva('todos')}
                    className="btn btn-primary mt-3"
                    style={{
                      background: 'linear-gradient(135deg, #c263f9 0%, #d99ffd 100%)',
                      border: 'none',
                      padding: '12px 30px',
                      borderRadius: '30px'
                    }}
                  >
                    Ver todos los artículos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .categories-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          padding: 0 20px;
        }

        .category-btn {
          display: inline-flex;
          align-items: center;
          padding: 12px 24px;
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 50px;
          color: #666;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .category-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
          border-color: var(--category-color);
          color: var(--category-color);
        }

        .category-btn.active {
          background: var(--category-color);
          border-color: var(--category-color);
          color: white;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .category-btn i {
          font-size: 1.1rem;
        }

        .badge-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 24px;
          margin-left: 8px;
          padding: 0 8px;
          background: rgba(0,0,0,0.1);
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .category-btn.active .badge-count {
          background: rgba(255,255,255,0.3);
        }

        .blog-card {
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .blog-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 16px 48px rgba(194, 99, 249, 0.2);
        }

        .blog-card-img {
          position: relative;
          width: 100%;
          height: 250px;
          overflow: hidden;
          background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
        }

        .blog-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .blog-card:hover .blog-card-img img {
          transform: scale(1.15) rotate(1deg);
        }

        .blog-card-category {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #c263f9;
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .blog-card-content {
          padding: 2rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .blog-card-meta {
          color: #8b8b8b;
          font-size: 0.9rem;
        }

        .blog-card-meta i {
          color: #c263f9;
        }

        .blog-card-title {
          font-size: 1.3rem;
          font-weight: 700;
          line-height: 1.4;
          margin-bottom: 1rem;
          color: #2d465e;
        }

        .blog-card-title a {
          color: #2d465e;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .blog-card-title a:hover {
          color: #c263f9;
        }

        .blog-card-excerpt {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          flex: 1;
        }

        .blog-card-link {
          display: inline-flex;
          align-items: center;
          color: #c263f9;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .blog-card-link:hover {
          transform: translateX(4px);
          color: #c263f9;
        }

        .blog-card-link i {
          transition: transform 0.3s ease;
        }

        .blog-card-link:hover i {
          transform: translateX(4px);
        }

        @media (max-width: 768px) {
          .categories-filter {
            gap: 8px;
          }

          .category-btn {
            padding: 10px 18px;
            font-size: 0.85rem;
          }

          .category-btn i {
            font-size: 1rem;
          }

          .badge-count {
            min-width: 20px;
            height: 20px;
            font-size: 0.75rem;
          }

          .blog-card-content {
            padding: 1.5rem;
          }

          .blog-card-title {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </main>
  );
}