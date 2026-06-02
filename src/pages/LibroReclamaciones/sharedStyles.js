// Estilos compartidos para Libro de Reclamaciones
export const libroReclamacionesStyles = `
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

.lr-page-header .container {
  position: relative;
  z-index: 2;
  max-width: 1100px;
}

.lr-page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #fff;
  line-height: 1.2;
}

.lr-page-header .subtitle {
  font-size: 1rem;
  color: #fff;
  opacity: 0.95;
  margin: 0;
}

.lr-section {
  padding: 40px 0;
  background-color: #ffffff;
}

.lr-wrapper {
  max-width: 1100px;
  margin: 0 auto;
}

.lr-intro {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #333;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.lr-item {
  margin-bottom: 25px;
}

.lr-item h3 {
  color: #000;
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 10px;
  line-height: 1.3;
}

.lr-item h3::before {
  content: attr(data-numero) ". ";
  color: #000;
}

.lr-item p {
  color: #333;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 8px;
}

.lr-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 8px 20px;
}

.lr-list li {
  position: relative;
  padding: 3px 0 3px 15px;
  color: #333;
  font-size: 0.95rem;
  line-height: 1.6;
}

.lr-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #000;
}

.lr-nota {
  padding-left: 15px;
  border-left: 2px solid #ccc;
  font-style: italic;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
}

.lr-pending-box {
  background: #fffbeb;
  border: 1px solid #fde68a;
  padding: 16px;
  border-radius: 8px;
  margin: 10px 0;
}

.lr-pending-box p {
  margin-bottom: 10px;
  color: #92400e;
  font-size: 0.92rem;
  line-height: 1.6;
}

.lr-pending-box p:last-child {
  margin-bottom: 0;
}

.lr-info-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 25px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.lr-info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.lr-codigo-grande {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--accent-color, #7B1FA2);
  margin: 5px 0 0;
  line-height: 1;
}

.lr-estado-badge-grande {
  padding: 8px 20px;
  border-radius: 30px;
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.lr-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.lr-info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lr-info-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.lr-info-value {
  font-size: 1.05rem;
  font-weight: 600;
  color: #111;
}

.lr-timeline {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin: 30px 0;
}

.lr-timeline::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 40px;
  right: 40px;
  height: 3px;
  background: #e5e7eb;
  z-index: 0;
}

.lr-timeline-step {
  flex: 1;
  position: relative;
  text-align: center;
  opacity: 0.4;
  transition: opacity 0.3s;
}

.lr-timeline-step.active {
  opacity: 1;
}

.lr-timeline-marker {
  width: 40px;
  height: 40px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #e5e7eb;
  border: 3px solid #fff;
  position: relative;
  z-index: 1;
  transition: all 0.3s;
}

.lr-timeline-step.active .lr-timeline-marker {
  background: var(--accent-color, #7B1FA2);
  box-shadow: 0 0 0 4px rgba(123, 31, 162, 0.15);
}

.lr-timeline-content h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 4px;
  line-height: 1.2;
}

.lr-timeline-content p {
  font-size: 0.82rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.lr-label {
  display: block;
  font-size: 0.88rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 5px;
}

.lr-req {
  color: #dc2626;
  font-weight: 700;
}

.lr-input {
  width: 100%;
  padding: 9px 13px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.92rem;
  color: #111;
  background: #fff;
  transition: border-color 0.2s;
  outline: none;
  font-family: inherit;
  resize: vertical;
}

.lr-input:focus {
  border-color: var(--accent-color, #7B1FA2);
  box-shadow: 0 0 0 2px rgba(123, 31, 162, 0.08);
}

.lr-hint-text {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

.lr-tipo-grupo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 6px;
}

.lr-tipo-opcion {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px 15px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.lr-tipo-opcion:hover { border-color: var(--accent-color, #7B1FA2); }

.lr-tipo-opcion.activo {
  border-color: var(--accent-color, #7B1FA2);
  background: #faf5ff;
}

.lr-tipo-opcion input[type="radio"] {
  margin-top: 3px;
  accent-color: var(--accent-color, #7B1FA2);
  flex-shrink: 0;
}

.lr-tipo-opcion div { display: flex; flex-direction: column; gap: 2px; }
.lr-tipo-opcion strong { font-size: 0.92rem; color: #111; }
.lr-tipo-opcion span  { font-size: 0.8rem; color: #6b7280; line-height: 1.3; }

.lr-check-wrap {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}

.lr-check-wrap input[type="checkbox"] {
  width: 16px; height: 16px;
  margin-top: 3px; flex-shrink: 0;
  accent-color: var(--accent-color, #7B1FA2);
}

.lr-check-wrap span {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.5;
}

.lr-archivos-lista {
  list-style: none;
  padding: 0;
  margin: 10px 0 0;
  border-top: 1px solid #e0e0e0;
}

.lr-archivos-lista li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.88rem;
  color: #374151;
}

.lr-archivos-lista small { color: #9ca3af; margin-left: 6px; }

.lr-quitar {
  background: none; border: none;
  color: #dc2626; font-size: 0.82rem;
  cursor: pointer; padding: 0;
  font-family: inherit;
  transition: color 0.2s;
}
.lr-quitar:hover { color: #991b1b; }

.lr-error {
  background: #fef2f2;
  border-left: 3px solid #dc2626;
  padding: 12px 16px;
  color: #dc2626;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.lr-submit { margin-top: 10px; }

.lr-codigo-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 18px 20px;
  border-left: 3px solid var(--accent-color, #7B1FA2);
  background: #faf5ff;
  margin: 14px 0;
}

.lr-codigo-label {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
}

.lr-codigo-valor {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--accent-color, #7B1FA2);
  letter-spacing: 0.04em;
}

.lr-codigo-hint {
  font-size: 0.82rem;
  color: #9ca3af;
}

.lr-acciones-finales {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.lr-resultado-header {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.lr-resultado-header h3 {
  color: #000;
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
}

.lr-resultado-header h3::before {
  content: attr(data-numero) ". ";
  color: #000;
}

.lr-estado-badge {
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
}

.lr-codigo-inline {
  font-weight: 700;
  color: var(--accent-color, #7B1FA2);
  font-size: 1rem;
}

.lr-texto-largo {
  font-size: 0.92rem;
  color: #374151;
  line-height: 1.65;
  white-space: pre-wrap;
  margin: 6px 0 0;
  padding-left: 15px;
  border-left: 2px solid #e5e7eb;
}

.lr-acciones {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 10px;
}

.lr-accion-fila {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
}

.lr-accion-fila:last-child {
  border-bottom: none;
}

.lr-accion-texto {
  flex: 1;
  min-width: 220px;
}

.lr-accion-texto strong {
  display: block;
  font-size: 0.95rem;
  color: #111;
  margin-bottom: 3px;
}

.lr-accion-texto span {
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.4;
}

.lr-btn-secundario {
  display: inline-flex;
  align-items: center;
  padding: 9px 20px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
  font-family: inherit;
  white-space: nowrap;
  text-decoration: none;
}

.lr-btn-secundario:hover {
  border-color: var(--accent-color, #7B1FA2);
  color: var(--accent-color, #7B1FA2);
}

@media (max-width: 768px) {
  .lr-page-header {
    padding: 120px 20px 60px;
  }

  .lr-page-header h1 {
    font-size: 1.8rem;
  }

  .lr-codigo-grande {
    font-size: 1.4rem;
  }

  .lr-info-header {
    flex-direction: column;
    align-items: stretch;
  }

  .lr-estado-badge-grande {
    text-align: center;
  }

  .lr-timeline {
    flex-direction: column;
  }

  .lr-timeline::before {
    top: 20px;
    bottom: 20px;
    left: 19px;
    right: auto;
    width: 3px;
    height: auto;
  }

  .lr-timeline-step {
    text-align: left;
    padding-left: 60px;
    margin-bottom: 30px;
  }

  .lr-timeline-step:last-child {
    margin-bottom: 0;
  }

  .lr-timeline-marker {
    position: absolute;
    left: 0;
    top: 0;
  }

  .lr-accion-fila {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .lr-tipo-grupo { grid-template-columns: 1fr; }
  .lr-acciones-finales { flex-direction: column; align-items: stretch; }
  .lr-btn-secundario { justify-content: center; }
}
`;
