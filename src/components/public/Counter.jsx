import React, { useEffect, useRef, useState } from 'react';
import { useInView, animate } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1];

/**
 * Número que sube de 0 → `to` cuando entra en pantalla.
 *  suffix: '+', '%', etc.  ·  separator: agrupa miles (1,000)
 */
export default function Counter({ to, duration = 2, suffix = '', separator = false, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  const shown = separator ? val.toLocaleString('es-PE') : val;
  return (
    <span ref={ref} className={className}>
      {shown}{suffix}
    </span>
  );
}
