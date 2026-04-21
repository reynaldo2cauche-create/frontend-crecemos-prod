# 📊 Documentación: Reportes de Ventas

## 📋 Descripción General

El módulo de **Reportes de Ventas** proporciona un análisis completo del desempeño comercial del centro, mostrando métricas clave, tendencias y detalles sobre ventas de productos y servicios.

---

## 🎛️ Filtros Disponibles

### 1. **Fecha Inicio / Fecha Fin**
- Permite seleccionar el rango de fechas a analizar
- **Por defecto**: Muestra el mes actual completo (desde el día 1 hasta el último día del mes)
- Ejemplo: Si estamos en abril 2026, mostrará del 1 al 30 de abril

### 2. **Tipo de Reporte**
- **General**: Muestra todas las ventas (productos + servicios)
- **Productos**: Muestra solo ventas de productos
- **Servicios**: Muestra solo ventas de servicios

---

## 📈 Métricas Principales (Tarjetas Superiores)

### 1. **Total Ventas** 🛒
- **Qué muestra**: Número total de transacciones/ventas realizadas
- **Detalle**:
  - Productos: Cantidad de ventas de productos
  - Servicios: Cantidad de ventas de servicios
- **Ejemplo**: "29 ventas" significa que se realizaron 29 transacciones (5 de productos + 24 de servicios)

### 2. **Total Ingresos** 💰
- **Qué muestra**: Suma total de dinero recaudado (después de descuentos)
- **Detalle**:
  - Ticket promedio: Ingreso promedio por venta
- **Cálculo**: Total ingresos ÷ Total ventas
- **Ejemplo**: "S/ 17,136.35" con ticket promedio de "S/ 591.08"

### 3. **Crecimiento** 📊
- **Qué muestra**: Porcentaje de crecimiento comparado con el período anterior
- **Cómo se calcula**:
  - Compara el período actual vs un período anterior del mismo tamaño
  - Si consultas del 1 al 30 de abril (30 días), compara vs los 30 días anteriores (1 al 31 de marzo)
  - Fórmula: `((Ingresos actuales - Ingresos anteriores) / Ingresos anteriores) × 100`
- **Interpretación**:
  - **Positivo (+)**: Las ventas mejoraron respecto al período anterior
  - **Negativo (-)**: Las ventas disminuyeron respecto al período anterior
  - **0%**: No hay datos del período anterior o no hubo cambio

### 4. **Sesiones Pendientes** 📅
- **Qué muestra**: Sesiones de servicios que han sido vendidas pero aún no se han usado
- **Detalle**:
  - Vendidas: Total de sesiones vendidas en el período
  - Usadas: Sesiones que ya se registraron en el sistema
  - Pendientes: Vendidas - Usadas
- **Nota**: Solo aplica para servicios, no para productos

### 5. **Total Descontado** 🏷️
- **Qué muestra**: Suma total de todos los descuentos aplicados
- **Incluye**:
  - Descuentos generales de la venta (cabecera)
  - Descuentos específicos de cada producto/servicio (detalle)
  - Descuentos promocionales
- **Detalle**:
  - Promos: Descuentos específicos por promociones

---

## 📊 Gráficos

### 1. **Tendencia de Ventas** (Gráfico de Líneas)
- **Qué muestra**: Evolución diaria de las ventas durante el período seleccionado
- **Línea Morada**: Cantidad de transacciones por día
- **Línea Verde**: Ingresos totales por día (en soles)
- **Utilidad**: Identificar días con mayor actividad comercial y patrones de venta

### 2. **Top 5 Productos/Servicios** (Gráfico de Barras Horizontal)
- **Qué muestra**: Los 5 productos o servicios más vendidos
- **Cantidad para productos**: Número de unidades vendidas
  - Ejemplo: 25 shampoos vendidos
- **Cantidad para servicios**: Número de sesiones totales vendidas
  - Ejemplo: 40 sesiones de "Terapia de Lenguaje"
- **Utilidad**: Identificar qué productos/servicios tienen mayor demanda

### 3. **Distribución por Tipo** (Gráfico Circular)
- **Qué muestra**: Proporción entre ventas de productos vs servicios
- **Cantidad**: Número de TRANSACCIONES, no de items
  - Productos: 5 significa 5 ventas de productos
  - Servicios: 24 significa 24 ventas de servicios
- **Porcentaje**: Proporción del total
- **Utilidad**: Ver qué tipo de venta predomina en el negocio

### 4. **Ingresos por Responsable** (Gráfico de Barras Horizontal)
- **Qué muestra**: Ingresos generados por cada vendedor/trabajador
- **Ordenado**: De mayor a menor ingreso
- **Utilidad**: Evaluar el desempeño comercial de cada trabajador

---

## 📋 Tablas Detalladas


### 1. **Descuentos Aplicados por Tipo**
Muestra el resumen de todos los descuentos aplicados durante el período.

**Columnas**:
- **Tipo**: Categoría del descuento (Porcentaje, Monto fijo, Promoción, etc.)
- **Cantidad**: Número de veces que se aplicó ese tipo de descuento
- **Monto Total**: Suma total descontada de ese tipo

**Incluye**:
- Descuentos generales de la venta
- Descuentos específicos de cada producto/servicio vendido
- Fila de total al final

**Utilidad**: Controlar el impacto de los descuentos en los ingresos

---

## 💡 Casos de Uso Comunes

### Análisis Mensual
1. Dejar el filtro por defecto (mes actual completo)
2. Seleccionar "General" para ver todo
3. Revisar el crecimiento vs mes anterior
4. Identificar los días de mayor venta

### Comparar Productos vs Servicios
1. Generar reporte "General" del mes
2. Revisar el gráfico "Distribución por tipo"
3. Luego filtrar solo "Productos" para ver detalles
4. Luego filtrar solo "Servicios" para comparar

### Evaluar Desempeño de Vendedores
1. Seleccionar el período deseado
2. Revisar el gráfico "Ingresos por responsable"
3. Identificar quién genera más ingresos

### Auditar Descuentos
1. Seleccionar el período
2. Revisar la tarjeta "Total descontado"
3. Ver detalle en la tabla "Descuentos aplicados por tipo"
4. Verificar si el nivel de descuentos es apropiado

---

## ⚠️ Notas Importantes

1. **Fechas**: Todos los reportes usan la fecha de venta, no la fecha de creación del registro
2. **Moneda**: Todos los montos están en Soles Peruanos (PEN)
3. **Sesiones**: Solo aplican para servicios, los productos no tienen sesiones
4. **Crecimiento**: Requiere datos del período anterior para calcularse
5. **Descuentos**: Incluye todos los niveles de descuento (venta completa + items individuales)

---

## 🔄 Actualización de Datos

- Los reportes se generan en tiempo real al seleccionar fechas o cambiar el tipo
- Click en "Generar reporte" para recargar manualmente
- Los datos reflejan el estado actual de la base de datos

---

## 📞 Soporte

Para dudas o problemas con los reportes, contactar al administrador del sistema.

**Fecha de última actualización**: Abril 2026
