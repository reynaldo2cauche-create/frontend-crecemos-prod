# 📍 Sistema de Geofencing - Centro Crecemos

## ¿Qué es?

El sistema de **geofencing** (geolocalización) es una medida de seguridad que restringe el acceso a ciertas secciones del sistema según la ubicación física del usuario.

## 🎯 Objetivo

Proteger la información sensible de los pacientes permitiendo el acceso completo solo cuando el usuario está físicamente en el centro de labores.

## 📋 ¿A quién aplica?

- ✅ **Terapeutas** (rol_id = 4)
- ✅ **Personal de Admisión** (rol_id = 2)
- ❌ **Administradores** (sin restricciones)
- ❌ **Otros roles** (sin restricciones)

## 🏢 Ubicación del Centro

**Dirección**: Calle 48 Nro. 234 Urbanización El Pinar, Comas 15316 Lima, Perú

**Coordenadas GPS**:
- Latitud: `-11.9389`
- Longitud: `-77.0445`

**Radio permitido**: 100 metros

## 🔒 Secciones Restringidas (solo dentro del perímetro)

Cuando un terapeuta o personal de admisión está **FUERA** del centro (más de 100 metros):

### ❌ NO pueden acceder a:
- Lista de Pacientes
- Reportes y Evaluaciones
- Perfil del Paciente (información detallada)
- Historia Clínica
- Archivos Oficiales
- Gestión de Personal
- Cualquier información sensible del paciente

### ✅ SÍ pueden acceder a:
- **Agenda de Citas** (pueden ver sus citas del día)
- **Webmail / Correo**
- Login / Logout

## 🛠️ Tecnología Utilizada

### API de Geolocalización del Navegador
- **Gratis** (nativa del navegador)
- **No requiere API keys**
- **Alta precisión** con GPS

### Fórmula de Haversine
Calcula la distancia en línea recta entre dos puntos GPS considerando la curvatura de la Tierra.

```javascript
distancia = 2 * R * arcsin(√[sin²(Δφ/2) + cos(φ1) * cos(φ2) * sin²(Δλ/2)])
```

Donde:
- R = Radio de la Tierra (6,371 km)
- φ = Latitud
- λ = Longitud

## 📂 Archivos del Sistema

### 1. `src/services/geolocationService.js`
Servicio principal con las funciones de geolocalización:
- `obtenerUbicacionActual()`: Obtiene la ubicación GPS del usuario
- `verificarPerimetro()`: Verifica si está dentro de los 100 metros
- `calcularDistancia()`: Calcula distancia con Haversine
- `monitorearUbicacion()`: Monitoreo continuo en tiempo real

### 2. `src/hooks/useGeofencing.js`
Hook de React para usar geofencing fácilmente:
- `useGeofencing()`: Verificación periódica (cada 1 minuto)
- `useGeofencingContinuo()`: Monitoreo en tiempo real

### 3. `src/components/GeofencingGuard.jsx`
Componente que envuelve rutas y las protege según ubicación:
- Muestra pantalla de carga mientras verifica
- Bloquea acceso si está fuera del perímetro
- Permite acceso solo a rutas permitidas

## 🚀 Cómo Funciona

### Flujo de verificación:

1. **Usuario intenta acceder a una ruta protegida**
   ```
   Usuario → /intranet/lista-pacientes
   ```

2. **PrivateRoute verifica autenticación**
   ```
   ¿Tiene token? ✅ Continúa
   ```

3. **GeofencingGuard verifica rol**
   ```
   ¿Es terapeuta o admisión? ✅ Verifica ubicación
   ```

4. **Sistema solicita ubicación GPS**
   ```
   Navegador solicita permiso al usuario
   ```

5. **Calcula distancia al centro**
   ```
   Distancia = 150 metros
   ```

6. **Decide acceso según distancia**
   ```
   150m > 100m → ❌ ACCESO DENEGADO
   ```

7. **Muestra pantalla de restricción**
   ```
   "Acceso Restringido por Ubicación"
   + Muestra distancia actual
   + Ofrece ir a Agenda
   ```

## 📱 Experiencia del Usuario

### Dentro del Centro (< 100 metros)
```
✅ Acceso completo a todas las secciones
📍 Distancia: 45 metros
```

### Fuera del Centro (> 100 metros)
```
⚠️ Acceso restringido
📍 Distancia: 250 metros

Solo disponible:
- Agenda de Citas
- Webmail

Para acceder a otras secciones, dirígete al centro.
```

## ⚙️ Configuración

### Cambiar radio permitido:
```javascript
// src/services/geolocationService.js
const RADIO_PERMITIDO = 100; // Cambiar a los metros deseados
```

### Cambiar coordenadas del centro:
```javascript
// src/services/geolocationService.js
const CENTRO_COORDENADAS = {
  lat: -11.9389, // Nueva latitud
  lng: -77.0445  // Nueva longitud
};
```

### Cambiar intervalo de verificación:
```javascript
// En el componente que usa el hook
const { dentroDelPerimetro } = useGeofencing(
  true,
  60000 // Cambiar a los milisegundos deseados (60000 = 1 minuto)
);
```

## 🔧 Agregar Protección a Nuevas Rutas

Para proteger una nueva ruta sensible:

```jsx
// src/routes/AppRouter.jsx
<Route path="/intranet/nueva-seccion" element={
  <PrivateRoute>
    <GeofencingGuard>  {/* Agregar esta línea */}
      <SidebarProvider>
        <Sidebar />
        <SidebarContentWrapper>
          <NuevaSeccion />
        </SidebarContentWrapper>
      </SidebarProvider>
    </GeofencingGuard>  {/* Y esta */}
  </PrivateRoute>
} />
```

## ✅ Rutas SIN Geofencing (siempre accesibles)

```jsx
// NO envolver con GeofencingGuard
<Route path="/intranet/agenda" element={
  <PrivateRoute>
    <SidebarProvider>
      <Sidebar />
      <SidebarContentWrapper>
        <Agenda />
      </SidebarContentWrapper>
    </SidebarProvider>
  </PrivateRoute>
} />
```

## 🐛 Manejo de Errores

### Usuario no da permiso de ubicación
```
⚠️ Mostrar advertencia
✅ Permitir acceso (para no bloquear completamente)
```

### GPS no disponible
```
⚠️ Mostrar advertencia
✅ Permitir acceso (con advertencia de seguridad)
```

### Error de red/timeout
```
⚠️ Reintentar
✅ Permitir acceso si falla varias veces
```

## 📊 Logs en Consola

El sistema muestra información útil en la consola:

```
📍 Ubicación actual: -11.9389, -77.0445
📏 Distancia al centro: 45.23 metros
✅ Dentro del perímetro: true
```

## 🔐 Seguridad

- ✅ Las coordenadas se verifican en el cliente (navegador)
- ✅ El usuario puede ver su ubicación y distancia
- ✅ Sistema transparente y amigable
- ⚠️ Para mayor seguridad, considerar validación en backend

## 🎓 Notas Técnicas

1. **Precisión GPS**: Varía entre 5-50 metros según el dispositivo
2. **Batería**: El monitoreo continuo consume más batería
3. **Permisos**: El usuario debe permitir acceso a ubicación
4. **HTTPS**: Requerido para usar geolocalización
5. **Fallback**: Si hay errores, se permite acceso con advertencia

## 📞 Soporte

Si tienes problemas con el geofencing:

1. Verifica que el GPS esté activado
2. Permite acceso a ubicación en el navegador
3. Verifica que estés usando HTTPS
4. Revisa la consola para mensajes de error
5. Intenta recargar la página

---

**Última actualización**: Febrero 2026
**Versión**: 1.0.0
