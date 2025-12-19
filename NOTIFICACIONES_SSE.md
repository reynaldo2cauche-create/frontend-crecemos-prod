# 📡 Sistema de Notificaciones en Tiempo Real con SSE

## ¿Qué es SSE (Server-Sent Events)?

**SSE** es una tecnología que permite que el servidor envíe actualizaciones automáticas al cliente a través de una conexión HTTP persistente. Es una alternativa más simple a WebSockets que funciona perfectamente en hosting compartido como cPanel.

### Ventajas de SSE sobre WebSockets:

✅ **Compatible con cPanel** - Funciona en hosting compartido sin configuración especial
✅ **HTTP estándar** - No requiere protocolo especial ni puertos adicionales
✅ **Reconexión automática** - Si se pierde la conexión, se reconecta automáticamente
✅ **Más simple** - Usa una conexión HTTP unidireccional (servidor → cliente)
✅ **Menos recursos** - Consume menos memoria y CPU que WebSockets

### Comparación: SSE vs Polling vs WebSockets

| Característica | SSE | Polling | WebSockets |
|----------------|-----|---------|------------|
| Funciona en cPanel | ✅ Sí | ✅ Sí | ❌ No |
| Tiempo real | ✅ Sí | ⚠️ Casi | ✅ Sí |
| Carga del servidor | 🟢 Baja | 🔴 Alta | 🟡 Media |
| Bidireccional | ❌ No | ✅ Sí | ✅ Sí |
| Reconexión automática | ✅ Sí | N/A | ⚠️ Manual |

---

## 🏗️ Arquitectura de la Implementación

### Backend (NestJS)

1. **Endpoint SSE**: `/backend_api/notificaciones/stream`
   - Envía actualizaciones cada 5 segundos
   - Retorna: `{ total, notificaciones[], timestamp }`
   - Autenticado con JWT

2. **Servicio de Notificaciones** (`notificaciones.service.ts`)
   - Crea notificaciones en la base de datos
   - Tipos de notificaciones:
     - 🎂 Cumpleaños de pacientes
     - 📅 Aniversarios laborales
     - ⚠️ Login fuera de horario
     - 🗑️ Citas eliminadas

3. **Cron Jobs**
   - Se ejecutan diariamente a las 8:00 AM
   - Generan notificaciones automáticas

### Frontend (React)

1. **Hook personalizado** (`useSSE.js`)
   - Maneja la conexión SSE
   - Reconexión automática
   - Callbacks para eventos (onMessage, onError, onOpen)

2. **Componente** (`NotificacionesGlobales.jsx`)
   - Muestra el ícono de campana con badge
   - Panel deslizable con lista de notificaciones
   - Indicador visual "En tiempo real" cuando está conectado

---

## 🔧 Cómo Funciona

### 1. Conexión SSE

```javascript
// El frontend se conecta al endpoint SSE
const { data, isConnected } = useSSE('/notificaciones/stream', {
  enabled: true,
  onMessage: (data) => {
    // Se ejecuta cada vez que el servidor envía datos
    setTotalNotificaciones(data.total);
  }
});
```

### 2. Servidor Envía Actualizaciones INSTANTÁNEAS

```typescript
// Backend emite eventos AL MOMENTO cuando se crea una notificación
async crearYNotificar(notificacionData) {
  // 1. Guardar en BD
  const notificacion = await this.save(notificacionData);

  // 2. Emitir evento INMEDIATO
  this.eventEmitter.emit('notificacion.nueva', {
    usuarioId: notificacionData.usuarioId,
    notificacion
  });
}

// SSE escucha eventos y envía al cliente instantáneamente
@Sse('stream')
sseNotificaciones() {
  return fromEvent(this.eventEmitter, 'notificacion.nueva').pipe(
    filter(event => event.usuarioId === usuarioId),
    // Envía datos AL MOMENTO del evento
  );
}
```

### 3. Cliente Recibe y Actualiza UI

- ⚡ **Notificaciones INSTANTÁNEAS** - Se reciben al momento de crearse
- 🚀 **Sin esperas ni polling** - No hay intervalos de 5 segundos
- 🔄 **Actualizaciones en tiempo real** - El contador se actualiza automáticamente
- 💨 **Sin recargas** - Todo funciona sin recargar la página

---

## 📝 Uso en Producción

### Configuración para Producción

El sistema está configurado para funcionar tanto en desarrollo local como en producción:

#### Backend (`notificaciones.gateway.ts`)
```typescript
const allowedOrigins = [
  'http://localhost:5173',          // Desarrollo
  'https://www.crecemos.com.pe',    // Producción
];
```

#### Frontend (`api.js`)
```javascript
export const SERVER_BASE_URL = 'http://localhost:3001';
// export const SERVER_BASE_URL = 'https://www.crecemos.com.pe';
```

**Para cambiar entre local y producción:**
- Comenta/descomenta la línea correspondiente en `api.js`
- El sistema detectará automáticamente el origin y funcionará

---

## 🧪 Cómo Probar

### 1. Prueba de Login Fuera de Horario

1. Inicia sesión fuera del horario laboral
2. Verás una notificación en tiempo real
3. El badge del ícono de campana se actualizará automáticamente

### 2. Prueba Manual de Cron Jobs

```bash
# En el backend, puedes ejecutar manualmente:
# Edita notificaciones.service.ts y cambia el cron a:
@Cron('*/10 * * * * *') // Cada 10 segundos para pruebas
```

### 3. Verificar Conexión SSE

Abre la consola del navegador (F12) y busca:
- ✅ `"SSE conectado"`
- 📨 `"SSE mensaje recibido: {...}"`

---

## 🐛 Troubleshooting

### Problema: No recibo notificaciones

**Solución:**
1. Verifica que estés logueado
2. Abre la consola y busca errores de SSE
3. Verifica que el backend esté corriendo
4. Comprueba que la URL del servidor sea correcta

### Problema: Error CORS en SSE

**Solución:**
1. Verifica que tu dominio esté en `allowedOrigins` del Gateway
2. Asegúrate de que el servidor esté configurado para aceptar tu origin

### Problema: Conexión se cierra constantemente

**Solución:**
- EventSource se reconecta automáticamente
- Si persiste, verifica timeouts del servidor/proxy
- En cPanel, algunos proxies tienen timeout de 60s (normal)

---

## 📊 Flujo Completo de una Notificación (INSTANTÁNEO)

1. **Evento ocurre** (ej: empleado hace login fuera de horario) ⏱️ 0ms
2. **Backend crea notificación** en la base de datos ⏱️ ~50ms
3. **EventEmitter emite evento** 'notificacion.nueva' ⏱️ ~1ms
4. **SSE envía actualización INMEDIATA** al cliente conectado ⏱️ ~10ms
5. **Frontend recibe datos** vía `useSSE` hook ⏱️ ~5ms
6. **UI se actualiza automáticamente** (badge + contador) ⏱️ ~1ms
7. **Usuario ve la notificación** ⚡ **Total: ~67ms** - ¡INSTANTÁNEO!

**No hay esperas ni intervalos** - Todo sucede en menos de 100 milisegundos

---

## 🎯 Próximas Mejoras

- [ ] Sonido/vibración al recibir notificación nueva
- [ ] Notificaciones del navegador (Browser Notifications API)
- [ ] Filtros por tipo de notificación
- [ ] Histórico de notificaciones leídas
- [ ] Configuración de intervalos personalizados

---

## 👨‍💻 Mantenimiento

### Sistema de Eventos

El sistema ahora usa **EventEmitter2** para notificaciones instantáneas:

**No necesitas configurar intervalos** - Las notificaciones se envían automáticamente cuando ocurren.

**Cómo funciona:**
1. Al crear una notificación, se llama a `crearYNotificar()`
2. Este método emite el evento `'notificacion.nueva'`
3. SSE escucha el evento y envía datos al cliente instantáneamente

**Sin polling, sin esperas, 100% en tiempo real** ⚡

### Agregar Nuevo Tipo de Notificación

1. Agregar en `notificacion.entity.ts`:
```typescript
export enum TipoNotificacion {
  NUEVO_TIPO = 'NUEVO_TIPO',
  // ...
}
```

2. Crear método en `notificaciones.service.ts`
3. Agregar ícono/color en `NotificacionesGlobales.jsx`

---

**Desarrollado con ❤️ usando NestJS + React + SSE**
