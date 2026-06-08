# Cálculo de progreso — Plan de Tratamiento

Documento para definir, junto a la jefatura, **cómo se calcula el porcentaje de avance** en cada nivel
(por bloque → por objetivo → por objetivo general → plan completo).
La parte **por bloque ya está definida**; falta cerrar la **estadística general**.

---

## 1. Modelo POR BLOQUE (ya definido ✔)

Cada **bloque** agrupa **4 sesiones** y vale **100%**. En cada sesión, para cada objetivo:

| Resultado de la sesión | Aporte al bloque |
|------------------------|------------------|
| Logrado                | **25%**          |
| En proceso             | **12.5%**        |
| No logrado             | **0%**           |

`progreso del objetivo en el bloque = (Logrados × 25) + (En proceso × 12.5)`  → máximo **100%**.

> Nota: las 4 sesiones **siempre** dividen. Una sesión sin marcar cuenta como **0%**.

**Ejemplo:** en un bloque, un objetivo tiene 3 "Logrado" + 1 "En proceso" → 75 + 12.5 = **87.5%**.

---

## 2. Lo que falta decidir: ESTADÍSTICA GENERAL

Un mismo objetivo se trabaja en **varios bloques**. Necesitamos **un solo % general** del objetivo.
Ejemplo base: Objetivo "Comprensión" → Bloque 1 = **87.5%**, Bloque 2 = **50%**.

### PREGUNTA 1 — ¿Cómo se obtiene el % general de un objetivo?

- [ ] **Opción A — Promedio de los bloques trabajados**
  (87.5 + 50) ÷ 2 = **68.75%**. Todos los bloques pesan igual.

- [ ] **Opción B — Solo el último bloque trabajado**
  = **50%**. Refleja el estado actual del paciente, no el histórico.

- [ ] **Opción C — Ponderado por número de sesiones evaluadas**
  Un bloque con más sesiones evaluadas pesa más. (Coincide con A si todos los bloques tienen 4 sesiones.)

### PREGUNTA 2 — Si un objetivo NO se trabajó en un bloque

- [ ] Ese bloque **no cuenta** (recomendado).
- [ ] Cuenta como **0%**.

### PREGUNTA 3 — Niveles superiores

**% del Objetivo General** (agrupa varios objetivos específicos):
- [ ] Promedio simple de sus objetivos específicos.
- [ ] Ponderado (algún objetivo pesa más). ¿Cuál criterio? ____________________

**% del Plan completo** (agrupa los objetivos generales):
- [ ] Promedio simple de los objetivos generales.
- [ ] Ponderado. ¿Cuál criterio? ____________________

### PREGUNTA 4 — Detalles de presentación

- Umbrales de color: hoy **0–39 rojo / 40–79 ámbar / 80–100 verde**.
  - [ ] Se mantienen.  - [ ] Cambiar a: ______ / ______
- Objetivo aún **sin evaluar**:
  - [ ] Mostrar **0%**.  - [ ] Mostrar **"Sin datos / N/A"** (recomendado, evita que aparezca en rojo sin haberse trabajado).

---

## 3. Casos para conversar con la jefa

- **Recaída:** Sesión 1 Logrado, Sesión 2 No logrado → ¿el % debe bajar (estado actual) o promediar?
  Esto se resuelve con la elección de la PREGUNTA 1 (B refleja recaída; A la promedia).
- **Objetivo nuevo:** recién creado, sin sesiones evaluadas → relacionado con PREGUNTA 4.
- **Quitar un objetivo de un bloque:** hoy borra sus registros de ese bloque y el % cambia.
  - [ ] Está bien.  - [ ] Debe conservarse el histórico.

---

## 4. Resumen de decisiones (llenar con la jefa)

| Pregunta | Decisión |
|----------|----------|
| 1. % general por objetivo | A / B / C |
| 2. Bloque no trabajado | No cuenta / Cuenta como 0 |
| 3a. Objetivo general | Simple / Ponderado |
| 3b. Plan completo | Simple / Ponderado |
| 4. Color | Mantener / Cambiar |
| 4. Sin evaluar | 0% / N.A. |
| Quitar objetivo | Borra / Conserva |

> Una vez marcadas estas casillas, se implementa el cálculo exacto en `plan-terapeutico.service.ts`
> (por bloque, por objetivo, por objetivo general y plan completo) tal como lo defina la jefatura.
