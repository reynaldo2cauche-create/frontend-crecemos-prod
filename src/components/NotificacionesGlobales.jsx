// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   BellIcon,
//   XMarkIcon,
//   ExclamationTriangleIcon,
//   InformationCircleIcon,
//   CalendarIcon,
//   CakeIcon,
//   TrashIcon,
//   ClockIcon,
// } from '@heroicons/react/24/outline';
// import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
// import {
//   contarNotificacionesNoLeidas,
//   obtenerNotificacionesNoLeidas,
//   marcarNotificacionLeida,
//   marcarTodasNotificacionesLeidas,
// } from '../services/notificacionesService';
// import { useSSE } from '../hooks/useSSE';

// const NotificacionesGlobales = () => {
//   const [totalNotificaciones, setTotalNotificaciones] = useState(0);
//   const [notificaciones, setNotificaciones] = useState([]);
//   const [mostrarPanel, setMostrarPanel] = useState(false);
//   const [cargando, setCargando] = useState(false);
//   const navigate = useNavigate();

//   // Conexión SSE para notificaciones en tiempo real
//   // SSE (Server-Sent Events) funciona en cPanel y hosting compartido
//   const { data: sseData, isConnected } = useSSE('/notificaciones/stream', {
//     enabled: true,
//     onMessage: (data) => {
//       console.log('📨 Nueva actualización de notificaciones:', data);
//       console.log('   - Total anterior:', totalNotificaciones);
//       console.log('   - Total nuevo:', data.total);

//       // Actualizar el contador SIEMPRE que venga en el mensaje
//       if (data.total !== undefined) {
//         console.log('   ✅ Actualizando contador de', totalNotificaciones, 'a', data.total);
//         setTotalNotificaciones(data.total);
//       } else {
//         console.warn('   ⚠️ El mensaje SSE no contiene el campo "total"');
//       }

//       // Si el panel está abierto, actualizar también la lista
//       if (mostrarPanel && data.notificaciones && Array.isArray(data.notificaciones)) {
//         console.log('   ✅ Actualizando lista de notificaciones');
//         setNotificaciones(data.notificaciones);
//       }
//     },
//     onError: (error) => {
//       console.error('❌ Error en SSE:', error);
//     },
//     onOpen: () => {
//       console.log('✅ Conectado a notificaciones en tiempo real (SSE)');
//       console.log('   - Estado de conexión:', isConnected);
//     },
//   });

//   // Log del estado de conexión
//   useEffect(() => {
//     console.log('🔄 Estado SSE cambió - isConnected:', isConnected);
//   }, [isConnected]);

//   // Cargar notificaciones iniciales
//   useEffect(() => {
//     cargarConteoNotificaciones();
//   }, []);

//   useEffect(() => {
//     if (mostrarPanel) {
//       cargarNotificaciones();
//     }
//   }, [mostrarPanel]);

//   const cargarConteoNotificaciones = async () => {
//     try {
//       const { total } = await contarNotificacionesNoLeidas();
//       setTotalNotificaciones(total);
//     } catch (error) {
//       console.error('Error al cargar conteo de notificaciones:', error);
//     }
//   };

//   const cargarNotificaciones = async () => {
//     setCargando(true);
//     try {
//       const data = await obtenerNotificacionesNoLeidas(15);
//       setNotificaciones(data || []);
//     } catch (error) {
//       console.error('Error al cargar notificaciones:', error);
//       setNotificaciones([]);
//     } finally {
//       setCargando(false);
//     }
//   };

//   const handleMarcarLeida = async (id) => {
//     try {
//       await marcarNotificacionLeida(id);
//       setNotificaciones(prev => prev.filter(n => n.id !== id));
//       cargarConteoNotificaciones();
//     } catch (error) {
//       console.error('Error al marcar notificación como leída:', error);
//     }
//   };

//   const handleMarcarTodasLeidas = async () => {
//     try {
//       await marcarTodasNotificacionesLeidas();
//       setNotificaciones([]);
//       setTotalNotificaciones(0);
//     } catch (error) {
//       console.error('Error al marcar todas como leídas:', error);
//     }
//   };

//   const getIconoTipo = (tipo) => {
//     const iconos = {
//       CUMPLEANOS_PACIENTE: <CakeIcon className="w-5 h-5 text-pink-600" />,
//       ANIVERSARIO_EMPLEADO: <CalendarIcon className="w-5 h-5 text-blue-600" />,
//       LOGIN_FUERA_HORARIO: <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />,
//       CITA_ELIMINADA: <TrashIcon className="w-5 h-5 text-red-600" />,
//     };
//     return iconos[tipo] || <InformationCircleIcon className="w-5 h-5 text-gray-600" />;
//   };

//   const getColorTipo = (tipo) => {
//     const colores = {
//       CUMPLEANOS_PACIENTE: 'bg-pink-50 border-pink-300',
//       ANIVERSARIO_EMPLEADO: 'bg-blue-50 border-blue-300',
//       LOGIN_FUERA_HORARIO: 'bg-orange-50 border-orange-300',
//       CITA_ELIMINADA: 'bg-red-50 border-red-300',
//     };
//     return colores[tipo] || 'bg-gray-50 border-gray-300';
//   };

//   const formatearTiempo = (fecha) => {
//     const ahora = new Date();
//     const fechaNotif = new Date(fecha);
//     const diff = Math.floor((ahora - fechaNotif) / 1000);

//     if (diff < 60) return 'Hace un momento';
//     if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
//     if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
//     return `Hace ${Math.floor(diff / 86400)} días`;
//   };

//   const formatearHoraConexion = (fechaHora) => {
//     const fecha = new Date(fechaHora);
//     return fecha.toLocaleString('es-PE', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     });
//   };

//   const getMensajeCompleto = (notif) => {
//     if (notif.tipo === 'LOGIN_FUERA_HORARIO' && notif.datosAdicionales?.fecha_hora) {
//       return `${notif.mensaje} - Hora de conexión: ${formatearHoraConexion(notif.datosAdicionales.fecha_hora)}`;
//     }
//     return notif.mensaje;
//   };

//   return (
//     <div className="relative inline-block">
//       <button
//         onClick={() => setMostrarPanel(!mostrarPanel)}
//         className="relative p-2 rounded-lg hover:bg-purple-50 transition-colors"
//         title={`${totalNotificaciones} notificación${totalNotificaciones !== 1 ? 'es' : ''} sin leer`}
//       >
//         {totalNotificaciones > 0 ? (
//           <BellSolidIcon className="w-6 h-6 text-purple-600 animate-pulse" />
//         ) : (
//           <BellIcon className="w-6 h-6 text-gray-600" />
//         )}

//         {totalNotificaciones > 0 && (
//           <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center animate-pulse">
//             {totalNotificaciones > 99 ? '99+' : totalNotificaciones}
//           </span>
//         )}
//       </button>

//       {mostrarPanel && (
//         <>
//           <div
//             className="fixed inset-0 z-40"
//             onClick={() => setMostrarPanel(false)}
//           />

//           <div className="absolute left-full top-0 ml-2 w-96 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 max-h-[500px] flex flex-col">
//             <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <BellSolidIcon className="w-5 h-5 text-purple-600" />
//                   <h3 className="font-semibold text-gray-800">
//                     Notificaciones ({totalNotificaciones})
//                   </h3>
//                   {/* Indicador de conexión SSE */}
//                   {isConnected && (
//                     <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
//                       <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
//                       En tiempo real
//                     </span>
//                   )}
//                 </div>
//                 <button
//                   onClick={() => setMostrarPanel(false)}
//                   className="text-gray-500 hover:text-gray-700 transition-colors"
//                 >
//                   <XMarkIcon className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>

//             <div className="flex-1 overflow-y-auto">
//               {cargando ? (
//                 <div className="p-8 text-center text-gray-500">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
//                   Cargando notificaciones...
//                 </div>
//               ) : notificaciones.length === 0 ? (
//                 <div className="p-8 text-center text-gray-500">
//                   <BellIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
//                   <p>No hay notificaciones</p>
//                 </div>
//               ) : (
//                 <div className="divide-y divide-gray-200">
//                   {notificaciones.map((notif) => (
//                     <div
//                       key={notif.id}
//                       className={`p-4 hover:bg-gray-50 transition-colors relative ${getColorTipo(notif.tipo)} border-l-4`}
//                     >
//                       <div className="flex gap-3">
//                         <div className="flex-shrink-0 pt-1">
//                           {getIconoTipo(notif.tipo)}
//                         </div>

//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-start justify-between gap-2 mb-1">
//                             <h4 className="font-semibold text-sm text-gray-800 line-clamp-1">
//                               {notif.titulo}
//                             </h4>
//                             <button
//                               onClick={() => handleMarcarLeida(notif.id)}
//                               className="text-gray-400 hover:text-gray-600 transition-colors"
//                               title="Marcar como leída"
//                             >
//                               <XMarkIcon className="w-4 h-4" />
//                             </button>
//                           </div>

//                           <p className="text-xs text-gray-600 mb-2" style={{ lineHeight: '1.4' }}>
//                             {getMensajeCompleto(notif)}
//                           </p>

//                           <div className="flex items-center justify-between">
//                             <span className="text-xs text-gray-500 flex items-center gap-1">
//                               <ClockIcon className="w-3 h-3" />
//                               {formatearTiempo(notif.fechaCreacion)}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {notificaciones.length > 0 && (
//               <div className="p-3 border-t border-gray-200 bg-gray-50">
//                 <button
//                   onClick={handleMarcarTodasLeidas}
//                   className="w-full px-3 py-2 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors font-medium"
//                 >
//                   Marcar todas como leídas
//                 </button>
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default NotificacionesGlobales;
