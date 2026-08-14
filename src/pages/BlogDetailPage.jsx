import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { initializePageScripts } from '../utils/initScripts';
import { getBlogBySlug } from '../data/blogMetadata';
import { blogComponents } from './blogs';
import Reveal from '../components/public/Reveal';
import RevealText from '../components/public/RevealText';
import Decor from '../components/public/Decor';

export default function BlogDetailPage() {
  const { slug } = useParams();

  useEffect(() => {
    initializePageScripts();
    window.scrollTo(0, 0);
  }, [slug]);

  const post = getBlogBySlug(slug);
  const BlogContent = blogComponents[slug];

  if (!post || !BlogContent) {
    return (
      <main className="cx-page">
        <section className="cx-subhero">
          <Decor variant="a" />
          <div className="cx-container">
            <div className="cx-subhero-inner">
              <span className="cx-eyebrow"><i className="bi bi-journal-x" /> Blog</span>
              <h1>Artículo no encontrado</h1>
              <p>El artículo que buscas no existe o fue movido.</p>
              <div style={{ marginTop: 22 }}>
                <Link to="/blog" className="cx-btn cx-btn-primary">
                  <i className="bi bi-arrow-left" /> Volver al Blog
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <main className="cx-page cx-blogpost">
      {/* ============================ HERO =============================== */}
      <section className="cx-subhero cx-blogpost-hero">
        <Decor variant="a" />
        <div className="cx-container">
          <Reveal className="cx-blogpost-head">
            <span className="cx-eyebrow"><i className="bi bi-bookmark-fill" /> {post.categoryName}</span>
            <RevealText as="h1" text={post.title} />
            <div className="cx-blogpost-meta">
              <span><i className="bi bi-person-circle" /> {post.author}</span>
              <span><i className="bi bi-calendar3" /> {post.date}</span>
              <span><i className="bi bi-clock" /> {post.readTime}</span>
            </div>
            <nav className="cx-breadcrumb">
              <Link to="/">Inicio</Link>
              <i className="bi bi-chevron-right" />
              <Link to="/blog">Blog</Link>
              <i className="bi bi-chevron-right" />
              <span>{post.categoryName}</span>
            </nav>
          </Reveal>
        </div>
      </section>

      {/* ============================ CONTENIDO ========================== */}
      <section className="cx-section cx-section--soft cx-blogpost-section">
        <Decor variant="b" />
        <div className="cx-container">
          <div className="cx-blogpost-wrap">
            {/* Portada */}
            <Reveal className="cx-blogpost-cover" y={26}>
              <img
                src={post.heroImage}
                alt={post.title}
                onError={(e) => { e.target.closest('.cx-blogpost-cover').style.display = 'none'; }}
              />
            </Reveal>

            {/* Cuerpo del artículo */}
            <article className="blog-content cx-blogpost-article">
              <BlogContent />
            </article>

            {/* Compartir */}
            <div className="cx-blogpost-share">
              <span className="cx-blogpost-share-title"><i className="bi bi-share-fill" /> Compartir este artículo</span>
              <div className="cx-blogpost-share-links">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="cx-share cx-share--fb" aria-label="Compartir en Facebook">
                  <i className="bi bi-facebook" /> Facebook
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="cx-share cx-share--tw" aria-label="Compartir en X">
                  <i className="bi bi-twitter-x" /> Twitter
                </a>
                <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="cx-share cx-share--wa" aria-label="Compartir en WhatsApp">
                  <i className="bi bi-whatsapp" /> WhatsApp
                </a>
              </div>
            </div>

            {/* Volver */}
            <div className="cx-blogpost-back">
              <Link to="/blog" className="cx-btn cx-btn-ghost">
                <i className="bi bi-arrow-left" /> Volver al Blog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== CTA FINAL ======================== */}
      <section className="cx-section cx-section--pt-sm">
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
                <Link to="/blog" className="cx-btn cx-cta-btn-ghost">
                  Más artículos
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
