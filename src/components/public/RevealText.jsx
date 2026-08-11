import React from 'react';
import { motion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1];

/**
 * Título con reveal por palabras: cada palabra sube desde detrás de una
 * máscara (overflow hidden), en cascada. El efecto premium de Webflow.
 *
 *  text: string a animar
 *  parts: alternativa a `text` — array de { t, className } para resaltar
 *         palabras (ej. la itálica de marca).
 */
export default function RevealText({
  text,
  parts,
  as = 'h2',
  className,
  delay = 0,
  stagger = 0.07,
  once = true,
  amount = 0.5,
}) {
  const Tag = motion[as] || motion.h2;
  const words = parts
    ? parts
    : String(text).split(' ').map((t) => ({ t }));

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const word = {
    hidden: { y: '115%' },
    show: { y: '0%', transition: { duration: 0.8, ease: EASE } },
  };

  return (
    <Tag
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
    >
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <span className="cx-word-mask">
            <motion.span
              className={`cx-word ${w.className || ''}`}
              variants={word}
            >
              {w.t}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </Tag>
  );
}
