import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PalancaCasino = ({ onPull, disabled, ganadorNumero, totalGanadores }) => {
  const [isPulling, setIsPulling] = useState(false);

  const handlePull = () => {
    if (disabled || isPulling) return;

    setIsPulling(true);

    // Llamar al callback del sorteo
    onPull();

    // Resetear después de 5 segundos (duración del giro)
    setTimeout(() => {
      setIsPulling(false);
    }, 5000);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Contador de ganadores MORADO */}
      <div className="bg-gradient-to-b from-purple-600 to-purple-800 text-white px-10 py-4 rounded-2xl shadow-xl border-4 border-purple-300 relative overflow-hidden">
        {/* Efecto de brillo */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-10"></div>

        <div className="text-center relative z-10">
          <div className="text-xs font-black mb-1 tracking-widest text-purple-200">GANADOR</div>
          <div className="text-5xl font-black tabular-nums text-white" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.5)' }}>
            {ganadorNumero}<span className="text-2xl text-purple-200">/{totalGanadores}</span>
          </div>
        </div>
      </div>

      {/* Palanca lateral compacta */}
      <div className="relative">
        {/* Base/marco de la palanca */}
        <div className="relative bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-2xl p-6 shadow-2xl border-6 border-yellow-500">
          {/* Detalles decorativos dorados en las esquinas */}
          <div className="absolute top-2 left-2 w-4 h-4 bg-yellow-400 rounded-full shadow-lg border-2 border-yellow-200"></div>
          <div className="absolute top-2 right-2 w-4 h-4 bg-yellow-400 rounded-full shadow-lg border-2 border-yellow-200"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 bg-yellow-400 rounded-full shadow-lg border-2 border-yellow-200"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 bg-yellow-400 rounded-full shadow-lg border-2 border-yellow-200"></div>

          {/* Panel central donde va la palanca */}
          <div className="bg-gradient-to-br from-red-700 via-red-600 to-red-800 rounded-xl p-6 shadow-inner relative overflow-hidden">
            {/* Textura de fondo */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)'
            }}></div>

            {/* Palanca VERTICAL como máquina de casino */}
            <div className="relative cursor-pointer flex flex-col items-center" onClick={handlePull} style={{ width: '120px', height: '240px' }}>
              {/* Palanca completa - TODO SE MUEVE JUNTO */}
              <motion.div
                className="flex flex-col items-center relative"
                animate={isPulling ? {
                  rotate: [0, 30, 0],
                } : { rotate: 0 }}
                transition={isPulling ? {
                  duration: 0.8,
                  times: [0, 0.4, 1],
                  ease: "easeInOut"
                } : {}}
                style={{
                  transformOrigin: 'center 180px', // Gira desde abajo
                }}
              >
                {/* Bola roja ARRIBA */}
                <div
                  className={`w-20 h-20 rounded-full shadow-2xl flex items-center justify-center border-4 ${
                    disabled
                      ? 'bg-gray-400 border-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-br from-red-400 via-red-500 to-red-700 border-red-900'
                  }`}
                  style={{ zIndex: 10 }}
                >
                  {/* Brillo en la bola */}
                  <div className="absolute top-2 left-2 w-10 h-10 bg-white opacity-40 rounded-full blur-md"></div>
                  <div className="absolute top-3 left-3 w-5 h-5 bg-white opacity-60 rounded-full"></div>

                  {/* Icono en la bola */}
                  <div className="text-2xl relative z-10">
                    {isPulling ? '⚡' : '🎰'}
                  </div>
                </div>

                {/* Barra VERTICAL que conecta */}
                <div
                  className={`w-4 h-32 rounded-full shadow-2xl relative ${
                    disabled
                      ? 'bg-gradient-to-b from-gray-400 to-gray-600'
                      : 'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900'
                  }`}
                  style={{ marginTop: '-4px', zIndex: 8 }}
                >
                  {/* Detalles de madera */}
                  <div className="absolute inset-y-0 left-0.5 w-0.5 bg-amber-400 opacity-40 rounded-full"></div>
                  <div className="absolute inset-y-0 right-0.5 w-0.5 bg-black opacity-30 rounded-full"></div>

                  {/* Anillos dorados */}
                  <div className="absolute top-6 left-0 right-0 h-1 bg-gradient-to-r from-yellow-600 to-yellow-700 shadow-lg"></div>
                  <div className="absolute bottom-6 left-0 right-0 h-1 bg-gradient-to-r from-yellow-600 to-yellow-700 shadow-lg"></div>
                </div>

                {/* Círculo gris de la base (hueco) ABAJO */}
                <div
                  className="w-20 h-20 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 rounded-full shadow-2xl border-4 border-gray-700 flex items-center justify-center"
                  style={{ marginTop: '-4px', zIndex: 9 }}
                >
                  {/* Sombra interna del hueco */}
                  <div className="w-14 h-14 bg-black opacity-30 rounded-full blur-sm"></div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Panel de luces inferior */}
          <div className="flex justify-center gap-2 mt-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className={`w-3 h-3 rounded-full shadow-md ${
                  isPulling
                    ? 'bg-gradient-to-br from-yellow-300 to-yellow-500'
                    : disabled
                    ? 'bg-gray-700'
                    : 'bg-gradient-to-br from-red-600 to-red-800'
                }`}
                animate={isPulling ? {
                  opacity: [1, 0.2, 1],
                  scale: [1, 1.3, 1],
                } : {}}
                transition={{
                  duration: 0.6,
                  repeat: isPulling ? Infinity : 0,
                  delay: i * 0.08,
                }}
              />
            ))}
          </div>
        </div>

        {/* Sombra de la base */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-8 bg-black opacity-30 rounded-full blur-2xl"></div>
      </div>

      {/* Instrucciones compactas */}
      <motion.div
        className={`text-center ${disabled ? 'opacity-50' : ''}`}
        animate={!disabled && !isPulling ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1.5, repeat: !disabled && !isPulling ? Infinity : 0 }}
      >
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl px-6 py-3 shadow-lg border-2 border-white">
          <div className="flex items-center gap-2">
            <div className="text-2xl">
              {isPulling ? '🎲' : disabled ? '🔒' : '👉'}
            </div>
            <div className="text-left">
              <div className="text-base font-black" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                {isPulling ? '¡GIRANDO!' : disabled ? 'FINALIZADO' : '¡JALA!'}
              </div>
              <div className="text-xs font-bold text-yellow-100">
                {isPulling
                  ? 'Seleccionando...'
                  : disabled
                  ? 'Completado'
                  : 'Click en la bola'}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Efectos de partículas cuando está jalando */}
      {isPulling && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-yellow-400 rounded-full shadow-lg"
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 1
              }}
              animate={{
                x: Math.cos(i * Math.PI / 4) * 120,
                y: Math.sin(i * Math.PI / 4) * 120,
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeOut"
              }}
              style={{
                left: '50%',
                top: '50%',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PalancaCasino;
