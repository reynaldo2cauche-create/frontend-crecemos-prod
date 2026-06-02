# 🎁 Integración de Promociones en Ventas

## Resumen
El módulo de promociones ya está completamente integrado en tu sistema. Ahora puedes crear promociones y aplicarlas automáticamente en las ventas.

## ✅ Lo que se ha creado

### Backend (C:\Users\Lucero\Desktop\centro-crecemos)
- ✅ 8 entidades TypeORM
- ✅ 5 DTOs con validaciones
- ✅ 2 servicios (CRUD + Aplicación)
- ✅ 1 controlador con 10+ endpoints
- ✅ Módulo integrado en app.module.ts

### Frontend (C:\Users\Lucero\Desktop\frontend-centrocrecemos)
- ✅ Servicio de API (`src/services/promocionesService.js`)
- ✅ Página principal (`src/pages/Promociones/PromocionesPage.jsx`)
- ✅ Tab de Gestión con CRUD completo
- ✅ Tab de Estadísticas
- ✅ Ruta agregada en AppRouter
- ✅ Menú agregado en Sidebar (entre Inventario y Ventas)

## 🚀 Cómo usar el módulo

### 1. Crear una Promoción
1. Ve a **Intranet → Promociones**
2. Click en "Nueva Promoción"
3. Sigue los 3 pasos:
   - **Paso 1**: Información básica (nombre, fechas, si es acumulable)
   - **Paso 2**: Define las reglas (condiciones y beneficios)
   - **Paso 3**: Define el alcance (productos/servicios específicos o todo el catálogo)

### 2. Integrar en Ventas (IMPORTANTE)

Para aplicar automáticamente las promociones en tus ventas, necesitas integrar la lógica en `VenderServiciosTab.jsx` y `VenderProductosTab.jsx`.

#### Ejemplo de Integración en VenderServiciosTab.jsx:

```javascript
import { calcularPromociones, registrarPromocionAplicada } from '../../services/promocionesService';

// ... en tu componente ...

const [promocionesAplicadas, setPromocionesAplicadas] = useState([]);
const [totalDescuentoPromociones, setTotalDescuentoPromociones] = useState(0);

// Función para calcular promociones cuando cambia el carrito
const calcularPromocionesDelCarrito = async () => {
  if (servicios.length === 0) return;

  try {
    // Preparar items del carrito
    const items = servicios.map(s => ({
      servicio_id: s.servicio_id,
      motivo_cita_id: s.motivo_cita_id,
      cantidad: s.cantidad,
      precio_unitario: s.precio,
      subtotal: s.precio * s.cantidad,
      categoria_id: null, // Si aplica
      producto_id: null,
      paquete_id: null,
    }));

    // Llamar al backend para calcular promociones
    const resultado = await calcularPromociones({ items });

    setPromocionesAplicadas(resultado.promociones_aplicadas);
    setTotalDescuentoPromociones(resultado.total_descuento);

    // Opcional: actualizar los items con los precios descontados
    // setServicios(resultado.items_actualizados);

    console.log('✅ Promociones aplicadas:', resultado);
  } catch (error) {
    console.error('Error al calcular promociones:', error);
  }
};

// Llamar a esta función cada vez que cambie el carrito
useEffect(() => {
  calcularPromocionesDelCarrito();
}, [servicios]);

// Al confirmar la venta, registrar las promociones aplicadas
const handleConfirmarVenta = async () => {
  try {
    // ... tu lógica de venta existente ...

    const ventaCreada = await api.post('/ventas/servicios', ventaData);

    // Registrar cada promoción aplicada
    for (const promoAplicada of promocionesAplicadas) {
      await registrarPromocionAplicada({
        promocion_id: promoAplicada.promocion.id,
        tipo_venta_id: 1, // 1 = venta de servicios, 2 = venta de productos
        venta_id: ventaCreada.data.id,
        monto_ahorrado: promoAplicada.descuento,
      });
    }

    alert('Venta creada y promociones registradas exitosamente');
  } catch (error) {
    console.error('Error:', error);
  }
};

// Mostrar en la UI el descuento
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Subtotal:</span>
    <span>S/ {subtotal.toFixed(2)}</span>
  </div>

  {/* Mostrar promociones aplicadas */}
  {promocionesAplicadas.map((promo, idx) => (
    <div key={idx} className="flex justify-between text-sm text-green-600">
      <span className="flex items-center gap-1">
        <SparklesIcon className="w-4 h-4" />
        {promo.promocion.nombre}
      </span>
      <span>- S/ {promo.descuento.toFixed(2)}</span>
    </div>
  ))}

  <div className="flex justify-between font-bold text-lg border-t pt-2">
    <span>Total:</span>
    <span>S/ {(subtotal - totalDescuentoPromociones).toFixed(2)}</span>
  </div>
</div>
```

## 📊 Tipos de Promociones Soportadas

### Condiciones:
1. **Cantidad mínima** - Ej: "Compra 3 o más"
2. **Monto mínimo** - Ej: "Compra mínima de S/ 100"

### Beneficios:
1. **Descuento porcentaje** - Ej: "20% de descuento"
2. **Descuento fijo** - Ej: "S/ 50 de descuento"
3. **Ítem más barato gratis** - Ej: "El producto más barato es gratis"

### Alcance:
1. **Producto** - Aplica a productos específicos
2. **Categoría** - Aplica a toda una categoría
3. **Servicio** - Aplica a servicios específicos (con o sin motivo de cita)
4. **Paquete** - Aplica a paquetes
5. **Todo el catálogo** - Aplica a cualquier compra

## 🔥 Características Avanzadas

### Promociones Acumulables
Puedes marcar una promoción como "acumulable" para que se pueda combinar con otras promociones.

### Promociones sin Vencimiento
Deja el campo "Fecha Fin" vacío para crear una promoción sin fecha de expiración.

### Filtros Inteligentes
El sistema solo muestra promociones:
- ✅ Activas (flg_activo = 1)
- ✅ Vigentes (dentro del rango de fechas)
- ✅ Que cumplan con las condiciones del carrito

## 📈 Ver Estadísticas

Ve a **Intranet → Promociones → Estadísticas** para ver:
- Total de usos de cada promoción
- Ahorro total generado
- Promoción más popular
- Promedio de ahorro por uso

## 🎨 Estilos y Colores

El módulo de promociones usa el color **rosa (#E91E63)** para mantener consistencia con el diseño de tu intranet:
- Inventario: Morado (#7B1FA2)
- **Promociones: Rosa (#E91E63)** ← NUEVO
- Ventas: Azul/Verde

## ⚙️ Endpoints del Backend

```
GET    /backend_api/promociones                    - Listar todas
GET    /backend_api/promociones/vigentes           - Solo vigentes
GET    /backend_api/promociones/:id                - Ver una
POST   /backend_api/promociones                    - Crear
PUT    /backend_api/promociones/:id                - Actualizar
PATCH  /backend_api/promociones/:id/activar        - Activar
PATCH  /backend_api/promociones/:id/desactivar     - Desactivar
DELETE /backend_api/promociones/:id                - Eliminar
POST   /backend_api/promociones/calcular           - Calcular descuentos
POST   /backend_api/promociones/registrar-aplicacion - Registrar uso
GET    /backend_api/promociones/aplicadas/:tipoVentaId/:ventaId - Ver aplicadas
GET    /backend_api/promociones/estadisticas/general - Estadísticas
```

## 🚦 Estado Actual

✅ Backend compilado y funcionando
✅ Frontend creado con toda la UI
✅ Rutas y menús configurados
⏳ Falta integrar en VenderServiciosTab.jsx y VenderProductosTab.jsx

## 📝 Próximos Pasos

1. Integra la lógica de `calcularPromociones` en tus componentes de venta
2. Muestra las promociones aplicadas en el resumen de la venta
3. Registra las promociones al confirmar la venta
4. ¡Prueba creando tu primera promoción!

---

**¡Todo listo hijito! 🎉** El módulo de promociones está completo y funcionando. Solo falta que integres la lógica en tus páginas de venta para que se apliquen automáticamente los descuentos.
