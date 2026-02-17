import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';

const Ruleta = ({ pacientes, cantidadGanadores, isSpinning, ganadores, ganadoresRevelados, ganadoresEliminados, eliminandoGanador }) => {
  const [rotation, setRotation] = useState(0);
  const [currentSpinRotation, setCurrentSpinRotation] = useState(0);

  // Colores vibrantes para las secciones
  const colors = [
    '#FF6B6B', '#4ECDC4', '#FFD93D', '#C490E4', '#95E1D3',
    '#F38181', '#6C5CE7', '#A8E6CF', '#FFB6B9', '#FFA07A',
    '#FF85A2', '#5DADE2', '#F8B500', '#FF6B9D', '#00D9FF',
  ];

  // ==================== FILTRAR PACIENTES ====================
  // CRITICAL: La ruleta muestra TODOS los pacientes EXCEPTO los que están en ganadoresEliminados
  // Los ganadores que ya fueron seleccionados pero AÚN NO eliminados siguen visibles
  const pacientesDisponibles = React.useMemo(() => {
    // Filtrar solo por los IDs de ganadores que fueron ELIMINADOS
    if (!ganadoresEliminados || ganadoresEliminados.length === 0) {
      return pacientes;
    }

    return pacientes.filter(p => !ganadoresEliminados.includes(p.paciente_id));
  }, [pacientes, ganadoresEliminados]);

  // Ángulo por sección
  const sectionAngle = pacientesDisponibles.length > 0 ? 360 / pacientesDisponibles.length : 360;

  // EFECTO: Cuando se selecciona un ganador, calcular la rotación
  useEffect(() => {
    if (isSpinning && ganadores.length > 0) {
      // Obtener el último ganador
      const ganador = ganadores[ganadores.length - 1];

      console.log('🎲 GANADOR SELECCIONADO:', getNombreCompleto(ganador), 'Paciente ID:', ganador.paciente_id);
      console.log('📋 PACIENTES DISPONIBLES EN LA RULETA:', pacientesDisponibles.map((p, i) => `${i}: ${getNombreCompleto(p)} (Paciente ID: ${p.paciente_id})`));

      // Encontrar su índice en la lista de pacientes DISPONIBLES (no en todos)
      const ganadorIndex = pacientesDisponibles.findIndex(p => p.paciente_id === ganador.paciente_id);

      console.log('📍 ÍNDICE DEL GANADOR EN EL ARRAY:', ganadorIndex);

      if (ganadorIndex === -1) {
        console.error('❌ ERROR: Ganador no encontrado en la lista de pacientes disponibles!');
        console.log('Ganador:', ganador);
        console.log('Pacientes disponibles:', pacientesDisponibles);
        return;
      }

      // DEBUGGING: Ver dónde está cada sección
      console.log('🎨 MAPA DE SECCIONES:');
      pacientesDisponibles.forEach((p, i) => {
        const start = i * sectionAngle - 90;
        const center = start + sectionAngle / 2;
        const end = start + sectionAngle;
        console.log(`  ${i}: ${getNombreCompleto(p)} -> Start: ${start}°, Center: ${center}°, End: ${end}°`);
      });

      // CÁLCULO DE ROTACIÓN:
      const startAngle = ganadorIndex * sectionAngle - 90;
      const centroSeccionGanador = startAngle + sectionAngle / 2;

      console.log(`🎯 SECCIÓN DEL GANADOR ${ganadorIndex}:`);
      console.log(`   Start: ${startAngle}°`);
      console.log(`   Center: ${centroSeccionGanador}°`);
      console.log(`   End: ${startAngle + sectionAngle}°`);

      // EL INDICADOR ESTÁ ARRIBA = -90° (no 0°!)
      // Para que el centro del ganador quede en -90° (arriba):
      const indicadorPosicion = -90;
      const targetAngle = indicadorPosicion - centroSeccionGanador;

      console.log(`🔄 ROTACIÓN NECESARIA: ${targetAngle}° (para poner el centro en -90° donde está el indicador)`);

      // Vueltas extras
      const extraSpins = (5 + Math.floor(Math.random() * 3)) * 360;

      // Rotación total
      const currentNormalized = rotation % 360;
      const totalRotation = rotation + extraSpins + (targetAngle - currentNormalized);

      console.log(`📊 RESUMEN:`);
      console.log(`   Rotación actual normalizada: ${currentNormalized}°`);
      console.log(`   Vueltas extras: ${extraSpins}°`);
      console.log(`   Rotación total final: ${totalRotation}°`);
      console.log(`   Después de rotar, la sección ${ganadorIndex} debería estar en 0°`);

      setCurrentSpinRotation(totalRotation);
    }
  }, [isSpinning, ganadores, pacientesDisponibles, sectionAngle]);

  // EFECTO: Aplicar la rotación
  useEffect(() => {
    if (isSpinning) {
      setRotation(currentSpinRotation);
    }
  }, [isSpinning, currentSpinRotation]);

  // Función para obtener nombre completo
  const getNombreCompleto = (paciente) => {
    if (paciente.nombre_completo) return paciente.nombre_completo;
    const nombres = paciente.nombres || paciente.nombre || '';
    const paterno = paciente.apellido_paterno || paciente.apellidoPaterno || '';
    const materno = paciente.apellido_materno || paciente.apellidoMaterno || '';
    return `${nombres} ${paterno} ${materno}`.trim() || 'Sin nombre';
  };

  // Función para truncar texto
  const truncateText = (text, maxLength = 16) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  // Si no hay pacientes disponibles, mostrar mensaje
  if (pacientesDisponibles.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-gray-900">
                ¡Sorteo Completado! 🎉
              </h3>
              <p className="text-sm text-gray-600">
                {ganadores.length} {ganadores.length === 1 ? 'ganador seleccionado' : 'ganadores seleccionados'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      {/* Contenedor de la ruleta */}
      <div className="relative">
        {/* Indicador SUPERIOR - Flecha MORADA apuntando HACIA ABAJO */}
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-30">
          <motion.div
            animate={isSpinning ? {
              scale: [1, 1.2, 1],
              rotate: [0, -10, 10, -10, 0],
            } : {}}
            transition={{
              duration: 0.5,
              repeat: isSpinning ? Infinity : 0,
            }}
          >
            {/* Flecha grande apuntando hacia abajo - COLOR MORADO */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-2xl border-6 border-white relative">
                <Trophy className="w-10 h-10 text-white" />
                {/* Brillo animado */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white opacity-40 rounded-full"></div>
              </div>
              {/* Flecha apuntando hacia abajo - MORADA */}
              <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-purple-600 filter drop-shadow-lg"></div>
            </div>
          </motion.div>
        </div>

        {/* Marco dorado exterior */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-600 opacity-50 blur-xl"></div>
        <div className="absolute -inset-3 rounded-full border-8 border-yellow-400 shadow-2xl"></div>
        <div className="absolute -inset-1 rounded-full border-4 border-white shadow-xl"></div>

        {/* Logo ESTÁTICO en el centro - FUERA del motion.div para que NO gire */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="w-24 h-24 bg-white rounded-full border-4 border-yellow-400 shadow-2xl flex items-center justify-center overflow-hidden">
            <img
              src="/videologo.png"
              alt="Logo"
              className="w-20 h-20 object-contain"
            />
          </div>
        </div>

        {/* Ruleta SVG con animación */}
        <motion.div
          animate={{ rotate: rotation }}
          transition={{
            duration: isSpinning ? 5 : 0,
            ease: isSpinning ? [0.43, 0.13, 0.23, 0.96] : 'linear',
          }}
          style={{ width: 600, height: 600 }}
          className="relative z-10"
        >
          <svg width="600" height="600" viewBox="0 0 600 600">
            {/* Definir gradientes */}
            <defs>
              {colors.map((color, index) => (
                <linearGradient key={`grad-${index}`} id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.7 }} />
                </linearGradient>
              ))}

              {/* Gradiente para el centro */}
              <radialGradient id="centerGrad">
                <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
              </radialGradient>
            </defs>

            {/* Dibujar las secciones de la ruleta - SOLO PACIENTES DISPONIBLES */}
            {pacientesDisponibles.map((paciente, index) => {
              // Ángulo de inicio (empezamos desde arriba = -90°)
              const startAngle = index * sectionAngle - 90;
              const endAngle = startAngle + sectionAngle;

              // Convertir a radianes
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;

              // Calcular coordenadas del arco (radio = 250)
              const x1 = 300 + 250 * Math.cos(startRad);
              const y1 = 300 + 250 * Math.sin(startRad);
              const x2 = 300 + 250 * Math.cos(endRad);
              const y2 = 300 + 250 * Math.sin(endRad);

              const largeArcFlag = sectionAngle > 180 ? 1 : 0;

              // Path de la sección
              const pathData = `M 300 300 L ${x1} ${y1} A 250 250 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

              // Posición del texto (en el medio del arco)
              const midAngle = startAngle + sectionAngle / 2;
              const textRadius = 170;
              const textX = 300 + textRadius * Math.cos((midAngle * Math.PI) / 180);
              const textY = 300 + textRadius * Math.sin((midAngle * Math.PI) / 180);

              const colorIndex = index % colors.length;

              // Verificar si esta sección es del ganador que se está eliminando
              const estaEliminandose = eliminandoGanador && paciente.paciente_id === eliminandoGanador.paciente_id;

              return (
                <g key={`${paciente.id}-${index}`}>
                  {/* Sección */}
                  <path
                    d={pathData}
                    fill={`url(#grad-${colorIndex})`}
                    stroke="white"
                    strokeWidth="4"
                    style={{
                      opacity: estaEliminandose ? 0.3 : 1,
                      transition: 'opacity 0.5s ease-out',
                    }}
                  />

                  {/* Texto del nombre - HORIZONTAL siguiendo el arco */}
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                    style={{
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      filter: 'drop-shadow(0px 0px 3px rgba(0,0,0,0.9))',
                      pointerEvents: 'none',
                      opacity: estaEliminandose ? 0.3 : 1,
                      transition: 'opacity 0.5s ease-out',
                    }}
                  >
                    {truncateText(getNombreCompleto(paciente), 12)}
                  </text>

                  {/* Ícono de eliminación sobre la sección */}
                  {estaEliminandose && (
                    <>
                      <circle
                        cx={textX}
                        cy={textY}
                        r="35"
                        fill="rgba(239, 68, 68, 0.9)"
                        stroke="white"
                        strokeWidth="3"
                      >
                        <animate
                          attributeName="r"
                          values="30;35;30"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.8;1;0.8"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <text
                        x={textX}
                        y={textY}
                        fontSize="24"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontWeight="bold"
                      >
                        ✕
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Centro de la ruleta - SOLO círculos, SIN logo (el logo está fuera) */}
            <g>
              {/* Círculo dorado exterior */}
              <circle cx="300" cy="300" r="80" fill="url(#centerGrad)" />
              <circle cx="300" cy="300" r="75" fill="white" stroke="#FFD700" strokeWidth="4" />
            </g>
          </svg>
        </motion.div>

        {/* Luces decorativas en las esquinas */}
        <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg border-4 border-white animate-pulse"></div>
        <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full shadow-lg border-4 border-white animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-full shadow-lg border-4 border-white animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full shadow-lg border-4 border-white animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* GANADOR ACTUAL - Se muestra debajo de la ruleta */}
      {ganadoresRevelados > 0 && (
        <motion.div
          key={ganadoresRevelados}
          initial={{ scale: 0, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 border-4 border-purple-400 rounded-2xl p-6 shadow-2xl max-w-md w-full mt-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-xl flex-shrink-0 border-4 border-white">
              {ganadoresRevelados}°
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-black text-gray-900 mb-1 truncate">
                {getNombreCompleto(ganadores[ganadoresRevelados - 1])}
              </h4>
              <p className="text-sm font-semibold text-gray-600">
                DNI: {ganadores[ganadoresRevelados - 1].numero_documento || ganadores[ganadoresRevelados - 1].numeroDocumento || '-'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Lista de todos los ganadores - Solo si hay más de 1 */}
      {ganadoresRevelados > 1 && (
        <div className="w-full max-w-2xl mt-6">
          <h4 className="text-center text-sm font-bold text-gray-700 mb-3 flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4 text-purple-600" />
            Todos los Ganadores ({ganadoresRevelados})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ganadores.slice(0, ganadoresRevelados).map((ganador, index) => (
              <div
                key={`${ganador.id}-winner-${index}`}
                className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border-2 border-purple-200 hover:border-purple-400 transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {index + 1}°
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {getNombreCompleto(ganador)}
                  </p>
                  <p className="text-xs text-gray-500">
                    DNI: {ganador.numero_documento || ganador.numeroDocumento || '-'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Ruleta;