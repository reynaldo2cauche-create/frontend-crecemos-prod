import React from 'react';

/**
 * Capa decorativa suave: solo manchas de degradado difuminadas que aportan
 * color ambiental al fondo. Sin formas duras (anillos/cruces) para mantener
 * un look premium y no "cargado".
 *
 *  variant: combinación de posiciones ('a' | 'b' | 'c')
 */
export default function Decor({ variant = 'a', className = '' }) {
  return (
    <div className={`cx-decor cx-decor--${variant} ${className}`} aria-hidden="true">
      <span className="cx-shape cx-shape--blob cx-s1" />
      <span className="cx-shape cx-shape--blob cx-s6" />
    </div>
  );
}
