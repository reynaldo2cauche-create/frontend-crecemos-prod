import React from 'react';
import { motion } from 'framer-motion';

const DIRS = {
  up: { x: 0, y: 46 },
  down: { x: 0, y: -46 },
  left: { x: 64, y: 0 },
  right: { x: -64, y: 0 },
  none: { x: 0, y: 0 },
};

// Easing tipo webflow (expo-out): arranca rápido y asienta suave.
const EASE = [0.16, 1, 0.3, 1];

/**
 * Aparición premium al hacer scroll: opacidad + desplazamiento +
 * desenfoque → nítido + micro-escala. Muy por encima de un fade plano.
 *
 *  direction: 'up' | 'down' | 'left' | 'right' | 'none'
 *  blur / scale: activan esos matices (por defecto sí)
 */
export default function Reveal({
  children,
  as = 'div',
  delay = 0,
  y,
  direction = 'up',
  className,
  style,
  once = true,
  amount = 0.2,
  duration = 1,
  blur = true,
  scale = true,
  ...rest
}) {
  const MotionTag = motion[as] || motion.div;
  const off = DIRS[direction] || DIRS.up;
  const oy = y != null ? y : off.y;

  return (
    <MotionTag
      className={className}
      style={style}
      initial={{
        opacity: 0,
        x: off.x,
        y: oy,
        filter: blur ? 'blur(12px)' : 'blur(0px)',
        scale: scale ? 0.96 : 1,
      }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)', scale: 1 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
