import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializePageScripts } from '../utils/initScripts';

const LibroReclamaciones: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    initializePageScripts();
  }, []);

  return (
    <>
      <style>{`
        .lr-page-header {
          position: relative;
          background: linear-gradient(135deg, rgba(45, 70, 94, 0.5), rgba(13, 131, 253, 0.9)),
                      url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070') center/cover no-repeat;
          padding: 150px 20px 80px;
          color: #fff;
          overflow: hidden;
        }
        .lr-page-header::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.2);
          z-index: 1;
        }
        .lr-page-header .container { position: relative; z-index: 2; max-width: 1100px; }
        .lr-page-header h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 10px; color: #fff; line-height: 1.2; }
        .lr-page-header .subtitle { font-size: 1rem; color: #fff; opacity: 0.95; margin: 0; }
        .lr-section { padding: 40px 0; background-color: #ffffff; }
        .lr-wrapper { max-width: 1100px; margin: 0 auto; }
        .lr-intro { font-size: 0.95rem; line-height: 1.6; color: #333; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #e0e0e0; }
        .lr-item { margin-bottom: 25px; }
        .lr-item h3 { color: #000; font-size: 1.15rem; font-weight: 700; margin-bottom: 10px; line-height: 1.3; }
        .lr-item h3::before { content: attr(data-numero) ". "; color: #000; }
        .lr-item p { color: #333; font-size: 0.95rem; line-height: 1.6; margin-bottom: 8px; }
        .lr-list { list-style: none; padding: 0; margin: 8px 0 8px 20px; }
        .lr-list li { position: relative; padding: 3px 0 3px 15px; color: #333; font-size: 0.95rem; line-height: 1.6; }
        .lr-list li::before { content: "•"; position: absolute; left: 0; color: #000; }
        .lr-nota { padding-left: 15px; border-left: 2px solid #ccc; font-style: italic; color: #666; font-size: 0.9rem; line-height: 1.5; }
        .lr-acciones { display: flex; flex-direction: column; gap: 14px; margin-top: 10px; }
        .lr-accion-fila { display: flex; align-items: center; gap: 20px; padding: 16px 0; border-bottom: 1px solid #f0f0f0; flex-wrap: wrap; }
        .lr-accion-fila:last-child { border-bottom: none; }
        .lr-accion-texto { flex: 1; min-width: 220px; }
        .lr-accion-texto strong { display: block; font-size: 0.95rem; color: #111; margin-bottom: 3px; }
        .lr-accion-texto span { font-size: 0.85rem; color: #6b7280; line-height: 1.4; }
        .lr-btn-secundario { display: inline-flex; align-items: center; padding: 9px 20px; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; color: #374151; font-size: 0.88rem; font-weight: 500; cursor: pointer; transition: border-color 0.2s, color 0.2s; font-family: inherit; white-space: nowrap; text-decoration: none; }
        .lr-btn-secundario:hover { border-color: var(--accent-color, #7B1FA2); color: var(--accent-color, #7B1FA2); }
        @media (max-width: 768px) {
          .lr-page-header { padding: 120px 20px 60px; }
          .lr-page-header h1 { font-size: 1.8rem; }
          .lr-accion-fila { flex-direction: column; align-items: flex-start; gap: 10px; }
        }
      `}</style>
      <main className="main">

        {/* Header igual que PoliticaPrivacidad */}
        <div className="lr-page-header">
          <div className="container text-center">
            <h1 data-aos="fade-down">Libro de Reclamaciones</h1>
            <p className="subtitle" data-aos="fade-up" data-aos-delay="100">
              Crecemos – Centro Integral de Terapias
            </p>
          </div>
        </div>

        {/* Contenido */}
        <section className="lr-section">
          <div className="container">
            <div className="lr-wrapper">

              {/* Intro */}
              <div className="lr-intro" data-aos="fade-up">
                <p>
                  De acuerdo con el <strong>Código de Protección y Defensa del Consumidor (Ley N° 29571)</strong>,
                  todos los establecimientos comerciales deben contar con un Libro de Reclamaciones a
                  disposición de los consumidores. Su reclamo o queja será atendido en un plazo no mayor
                  a <strong>quince (15) días hábiles</strong>, el cual es improrrogable.
                </p>
              </div>

              {/* 1. Proveedor */}
              <div className="lr-item" data-aos="fade-up" data-aos-delay="60">
                <h3 data-numero="1">Datos del Proveedor</h3>
                <ul className="lr-list">
                  <li><strong>Razón Social:</strong> CONTIGO CRECEMOS E.I.R.L.</li>
                  <li><strong>RUC:</strong> 20601074380</li>
                  <li><strong>Domicilio:</strong> Calle 48 Nro. 234, Urb. El Pinar, Comas 15316, Lima, Perú</li>
                </ul>
              </div>

              {/* 2. Reclamo vs Queja */}
              <div className="lr-item" data-aos="fade-up" data-aos-delay="80">
                <h3 data-numero="2">¿Reclamo o Queja?</h3>
                <ul className="lr-list">
                  <li>
                    <strong>Reclamo:</strong> Disconformidad relacionada con los productos o servicios
                    prestados por el proveedor.
                  </li>
                  <li>
                    <strong>Queja:</strong> Malestar o descontento respecto a la atención al público,
                    no relacionada directamente con los productos o servicios.
                  </li>
                </ul>
                <div className="lr-nota">
                  La formulación del reclamo no impide acudir a otras vías de solución de controversias
                  ni es requisito previo para interponer una denuncia ante el INDECOPI.
                </div>
              </div>

              {/* 3. Acciones */}
              <div className="lr-item" data-aos="fade-up" data-aos-delay="100">
                <h3 data-numero="3">¿Qué desea hacer?</h3>
                <div className="lr-acciones">
                  <div className="lr-accion-fila">
                    <div className="lr-accion-texto">
                      <strong>Registrar un Reclamo o Queja</strong>
                      <span>
                        Complete el formulario oficial con sus datos y el detalle de su disconformidad.
                        Recibirá un código de seguimiento al finalizar.
                      </span>
                    </div>
                    <button className="btn-custom" onClick={() => navigate('/libro-reclamaciones/registrar')}>
                      Registrar Reclamo
                    </button>
                  </div>
                  <div className="lr-accion-fila">
                    <div className="lr-accion-texto">
                      <strong>Consultar el Estado de un Reclamo</strong>
                      <span>
                        Ingrese su código de reclamo y número de documento para ver el estado
                        y la respuesta del proveedor.
                      </span>
                    </div>
                    <button className="lr-btn-secundario" onClick={() => navigate('/libro-reclamaciones/consultar')}>
                      Consultar Estado
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Marco legal */}
              <div className="lr-item" data-aos="fade-up" data-aos-delay="120">
                <h3 data-numero="4">Marco Legal</h3>
                <ul className="lr-list">
                  <li>Ley N° 29571 – Código de Protección y Defensa del Consumidor</li>
                  <li>Ley N° 29733 – Ley de Protección de Datos Personales y su Reglamento D.S. N° 003-2013-JUS</li>
                  <li>D.S. N° 011-2011-PCM – Reglamento del Libro de Reclamaciones del Código de Protección</li>
                </ul>
              </div>

            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default LibroReclamaciones;