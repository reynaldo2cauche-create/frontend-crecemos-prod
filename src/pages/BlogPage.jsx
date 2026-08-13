import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { blogMetadata, getBlogsByCategory } from '../data/blogMetadata';
import { initializePageScripts } from '../utils/initScripts';
import Reveal from '../components/public/Reveal';
import RevealText from '../components/public/RevealText';
import Decor from '../components/public/Decor';

// Convierte "30 Julio 2026" / "24 de Noviembre 2025" a timestamp para ordenar por fecha.
const MESES_BLOG = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9,
  noviembre: 10, diciembre: 11,
};
const parseFechaBlog = (s) => {
  const parts = String(s).toLowerCase().replace(/\s+de\s+/g, ' ').trim().split(/\s+/);
  if (parts.length < 3) return 0;
  const day = parseInt(parts[0], 10);
  const mes = MESES_BLOG[parts[1]];
  const year = parseInt(parts[parts.length - 1], 10);
  if (isNaN(day) || mes === undefined || isNaN(year)) return 0;
  return new Date(year, mes, day).getTime();
};

export default function BlogPage() {
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const postsPorPagina = 9; // 3 filas x 3 columnas

  useEffect(() => {
    initializePageScripts();
    window.scrollTo(0, 0);
  }, []);

  // Reset a página 1 cuando cambia la categoría
  useEffect(() => {
    setPaginaActual(1);
  }, [categoriaActiva]);

  const categoriasBlog = [
    { id: 'todos', nombre: 'Todos', icon: 'bi-grid-3x3-gap', color: '#c263f9' },
    { id: 'nutricion', nombre: 'Nutrición', icon: 'bi-apple', color: '#50C878' },
    { id: 'desarrollo-infantil', nombre: 'Desarrollo Infantil', icon: 'bi-stars', color: '#FF6B9D' },
    { id: 'psicologia', nombre: 'Psicología y Bienestar', icon: 'bi-heart-pulse', color: '#4A90E2' },
    { id: 'terapias', nombre: 'Terapias', icon: 'bi-chat-dots', color: '#9B59B6' },
    { id: 'familia', nombre: 'Familia y Crianza', icon: 'bi-people', color: '#E74C3C' },
    { id: 'educacion', nombre: 'Educación', icon: 'bi-book', color: '#F39C12' },
    { id: 'efemerides', nombre: 'Eventos Conmemorativos', icon: 'bi-calendar-event', color: '#c263f9' }
  ];

  // Artículo destacado = el más reciente por fecha de publicación.
  // Cambia solo cuando publicas uno con fecha posterior.
  const featured = [...blogMetadata].sort(
    (a, b) => parseFechaBlog(b.date) - parseFechaBlog(a.date) || b.id - a.id
  )[0];

  // Posts filtrados por categoría (excluyo el destacado en "todos" para no duplicar)
  const postsBase = getBlogsByCategory(categoriaActiva);
  const postsFiltrados = categoriaActiva === 'todos'
    ? postsBase.filter(p => p.id !== featured.id)
    : postsBase;

  // Paginación
  const totalPaginas = Math.ceil(postsFiltrados.length / postsPorPagina);
  const indexUltimoPost = paginaActual * postsPorPagina;
  const indexPrimerPost = indexUltimoPost - postsPorPagina;
  const postsPaginados = postsFiltrados.slice(indexPrimerPost, indexUltimoPost);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    const element = document.getElementById('blog-posts');
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  const categoriaActivaData = categoriasBlog.find(c => c.id === categoriaActiva);
  const totalCategorias = categoriasBlog.filter(c => c.id !== 'todos').length;

  return (
    <main className="cx-page">
      {/* ===================== HERO tipo revista ===================== */}
      <section className="cx-blog-hero">
        <Decor variant="a" />
        <div className="cx-container">
          <div className="cx-blog-hero-grid">
            <Reveal className="cx-bloghero-copy" y={26}>
              <span className="cx-eyebrow"><i className="bi bi-journal-text" /> Blog Centro Crecemos</span>
              <RevealText as="h1" text="Recursos y guías para el desarrollo" />
              <p>
                Consejos prácticos, información nutricional y recursos especializados para acompañar
                el crecimiento y bienestar de tus hijos.
              </p>

              <div className="cx-bloghero-stats">
                <div className="cx-bloghero-stat">
                  <b>{blogMetadata.length}</b>
                  <span>Artículos publicados</span>
                </div>
                <div className="cx-bloghero-stat">
                  <b>{totalCategorias}</b>
                  <span>Categorías temáticas</span>
                </div>
              </div>

              <nav className="cx-breadcrumb">
                <Link to="/">Inicio</Link>
                <i className="bi bi-chevron-right" />
                <span>Blog</span>
              </nav>
            </Reveal>

            {/* Artículo destacado */}
            <Reveal className="cx-bloghero-feat-wrap" direction="left" y={26} delay={0.1}>
              <Link to={`/blog/${featured.slug}`} className="cx-bloghero-feat">
                <div className="cx-bloghero-feat-media">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <span className="cx-bloghero-ribbon"><i className="bi bi-stars" /> Artículo destacado</span>
                </div>
                <div className="cx-bloghero-feat-body">
                  <span className="cx-bloghero-feat-cat"><i className="bi bi-bookmark-fill" /> {featured.categoryName}</span>
                  <h2>{featured.title}</h2>
                  <div className="cx-bloghero-feat-meta">
                    <span><i className="bi bi-calendar3" /> {featured.date}</span>
                    <span><i className="bi bi-clock" /> {featured.readTime}</span>
                  </div>
                  <span className="cx-bloghero-feat-link">Leer artículo <i className="bi bi-arrow-right" /></span>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================== Filtro por categoría ===================== */}
      <section className="cx-blog-filterband">
        <div className="cx-container">
          <Reveal className="cx-blog-chips" y={16}>
            {categoriasBlog.map((categoria) => {
              const count = categoria.id === 'todos'
                ? blogMetadata.length
                : blogMetadata.filter(post => post.category === categoria.id).length;
              return (
                <button
                  key={categoria.id}
                  onClick={() => setCategoriaActiva(categoria.id)}
                  className={`cx-blog-chip ${categoriaActiva === categoria.id ? 'is-active' : ''}`}
                  style={{ '--cx-cat': categoria.color }}
                >
                  <i className={`bi ${categoria.icon}`} />
                  {categoria.nombre}
                  <span className="cx-blog-chip-count">{count}</span>
                </button>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* ===================== Grilla de artículos ===================== */}
      <section id="blog-posts" className="cx-section cx-section--deco cx-section--soft">
        <Decor variant="b" />
        <div className="cx-container">
          <Reveal className="cx-blog-resultbar" y={16}>
            <div>
              <h2 className="cx-blog-resulttitle">
                {categoriaActiva === 'todos' ? 'Todos los artículos' : categoriaActivaData?.nombre}
              </h2>
              <span className="cx-blog-count">
                {postsBase.length} {postsBase.length === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>
            {categoriaActiva !== 'todos' && (
              <button className="cx-blog-clear" onClick={() => setCategoriaActiva('todos')}>
                <i className="bi bi-arrow-counterclockwise" /> Ver todos
              </button>
            )}
          </Reveal>

          <div className="cx-blog-grid">
            {postsPaginados.length > 0 ? (
              postsPaginados.map((post, index) => (
                <Reveal
                  as="article"
                  className="cx-blog-card"
                  key={post.id}
                  y={22}
                  delay={(index % 3) * 0.06}
                >
                  <Link to={`/blog/${post.slug}`} className="cx-blog-media">
                    <img
                      src={post.image}
                      alt={post.title}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span className="cx-blog-cat">
                      <i className="bi bi-bookmark-fill" />
                      {post.categoryName}
                    </span>
                  </Link>

                  <div className="cx-blog-body">
                    <div className="cx-blog-meta">
                      <span><i className="bi bi-calendar3" /> {post.date}</span>
                      <span><i className="bi bi-clock" /> {post.readTime}</span>
                    </div>

                    <h3 className="cx-blog-title">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="cx-blog-excerpt">{post.excerpt}</p>

                    <div className="cx-blog-foot">
                      <span className="cx-blog-author">
                        <i className="bi bi-person-circle" /> {post.author}
                      </span>
                      <Link to={`/blog/${post.slug}`} className="cx-blog-link">
                        Leer <i className="bi bi-arrow-right" />
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))
            ) : (
              <Reveal className="cx-blog-empty" y={18}>
                <span className="cx-blog-empty-ic"><i className="bi bi-journal-x" /></span>
                <h3>Todavía no hay artículos aquí</h3>
                <p>
                  Aún no publicamos contenido en la categoría
                  {' '}<strong>{categoriaActivaData?.nombre}</strong>. Explora otras categorías
                  o vuelve pronto: subimos contenido nuevo constantemente.
                </p>
                <div className="cx-blog-empty-actions">
                  <button className="cx-btn cx-btn-primary" onClick={() => setCategoriaActiva('todos')}>
                    <i className="bi bi-grid-3x3-gap" /> Ver todos los artículos
                  </button>
                  <Link to="/contactanos" className="cx-btn cx-btn-ghost">
                    <i className="bi bi-chat-heart" /> Sugerir un tema
                  </Link>
                </div>
              </Reveal>
            )}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <nav aria-label="Paginación del blog">
              <ul className="cx-pagination">
                <li>
                  <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    aria-label="Página anterior"
                  >
                    <i className="bi bi-chevron-left" />
                  </button>
                </li>

                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => {
                  if (
                    numero === 1 ||
                    numero === totalPaginas ||
                    (numero >= paginaActual - 1 && numero <= paginaActual + 1)
                  ) {
                    return (
                      <li key={numero} className={paginaActual === numero ? 'is-active' : ''}>
                        <button
                          onClick={() => cambiarPagina(numero)}
                          aria-label={`Página ${numero}`}
                          aria-current={paginaActual === numero ? 'page' : undefined}
                        >
                          {numero}
                        </button>
                      </li>
                    );
                  } else if (numero === paginaActual - 2 || numero === paginaActual + 2) {
                    return <li key={numero} className="cx-pagination-ellipsis">…</li>;
                  }
                  return null;
                })}

                <li>
                  <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    aria-label="Página siguiente"
                  >
                    <i className="bi bi-chevron-right" />
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </section>

      {/* ===================== CTA final ===================== */}
      <section className="cx-section">
        <div className="cx-container">
          <Reveal className="cx-cta-band" y={30}>
            <span className="cx-cta-glow" aria-hidden="true" />
            <span className="cx-cta-glow cx-cta-glow--2" aria-hidden="true" />
            <div className="cx-cta-content">
              <span className="cx-cta-eyebrow"><i className="bi bi-chat-heart" /> ¿Tienes dudas?</span>
              <RevealText as="h2" text="Conversemos sobre el bienestar de tu familia" />
              <p>Nuestro equipo de especialistas está listo para acompañarte. Escríbenos o revisa todos nuestros servicios.</p>
              <div className="cx-cta-actions">
                <Link to="/contactanos" className="cx-btn cx-cta-btn">
                  <span>Contáctanos</span>
                  <i className="bi bi-arrow-right" />
                </Link>
                <Link to="/servicios" className="cx-btn cx-cta-btn-ghost">
                  Ver servicios
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
