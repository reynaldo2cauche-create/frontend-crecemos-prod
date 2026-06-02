# 📝 Guía para Agregar Nuevos Blogs

## 🚀 Pasos rápidos (3 minutos)

### 1. Crear el componente del blog

Crea un nuevo archivo en la carpeta de la categoría correspondiente:

```
src/pages/blogs/[categoria]/NombreBlog.jsx
```

**Categorías disponibles:**
- `nutricion/` - Artículos de nutrición
- `desarrollo-infantil/` - Desarrollo infantil
- `psicologia/` - Psicología y bienestar
- `terapias/` - Terapias
- `familia/` - Familia y crianza
- `educacion/` - Educación

**Ejemplo:** Para un blog sobre "Maca" en nutrición:
```
src/pages/blogs/nutricion/MacaBlog.jsx
```

**Contenido del archivo:**
```jsx
import React from 'react';

export default function MacaBlog() {
  return (
    <>
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        Tu introducción aquí...
      </div>

      <ul className="feature-list mb-5">
        <li><i className="bi bi-check-circle-fill"></i> Beneficio 1</li>
        <li><i className="bi bi-check-circle-fill"></i> Beneficio 2</li>
      </ul>

      <hr className="my-5" />

      <h2 className="section-title">Tu título de sección</h2>

      {/* Aquí va tu contenido... */}
      {/* Puedes copiar la estructura de CushuroBlog.jsx o QuinuaBlog.jsx */}
    </>
  );
}
```

---

### 2. Agregar metadata del blog

Abre `src/data/blogMetadata.js` y agrega un nuevo objeto al array:

```js
{
  id: 3, // Siguiente número disponible
  slug: 'maca-superalimento-peruano-ninos', // URL amigable (sin espacios)
  title: 'Maca: El superalimento energético para niños',
  excerpt: 'Resumen corto del blog (1-2 oraciones)',
  image: '/assets/img/blog/maca.webp', // Imagen para el listado
  date: '25 Enero 2025',
  category: 'nutricion', // nutricion, desarrollo-infantil, psicologia, terapias, familia, educacion
  categoryName: 'Nutrición',
  readTime: '7 min lectura',
  author: 'Centro Crecemos',
  heroImage: '/assets/img/blog/maca.webp' // Imagen grande del blog
}
```

---

### 3. Registrar el componente

Abre `src/pages/blogs/index.js` y:

**a) Importa el componente:**
```js
import MacaBlog from './nutricion/MacaBlog';
```

**b) Agrégalo al mapa:**
```js
export const blogComponents = {
  'cushuro-superalimiento-peruano-ninos-neurodivergentes': CushuroBlog,
  'quinua-superalimento-peruano-ninos-neurodivergentes': QuinuaBlog,
  'maca-superalimento-peruano-ninos': MacaBlog, // ← Agregar aquí
};
```

**c) Exporta el componente (opcional):**
```js
export {
  CushuroBlog,
  QuinuaBlog,
  MacaBlog, // ← Agregar aquí
};
```

---

## ✅ ¡Listo!

Tu blog ya está disponible en:
- **Listado**: `http://localhost:5174/blog`
- **Detalle**: `http://localhost:5174/blog/tu-slug`

---

## 🎨 Componentes disponibles para usar

### Tarjetas de beneficios
```jsx
<div className="row gy-4 mb-5">
  <div className="col-md-6" data-aos="fade-up">
    <div className="benefit-card">
      <div className="benefit-icon">
        <i className="bi bi-icon-name"></i>
      </div>
      <h3>Título del beneficio</h3>
      <p>Descripción</p>
    </div>
  </div>
</div>
```

### Secciones de recetas
```jsx
<div className="recipe-section mb-5" data-aos="fade-up">
  <div className="recipe-number">1</div>
  <h3 className="recipe-title">Nombre de la receta</h3>
  <div className="recipe-content">
    <p>Contenido...</p>
  </div>
</div>
```

### Tips importantes
```jsx
<div className="tips-box mb-5" data-aos="fade-up">
  <i className="bi bi-lightbulb-fill"></i>
  <ul>
    <li>Tip 1</li>
    <li>Tip 2</li>
  </ul>
</div>
```

### Advertencias
```jsx
<div className="warning-box mb-5" data-aos="fade-up">
  <i className="bi bi-exclamation-triangle-fill"></i>
  <div>
    <p className="mb-2"><strong>Importante:</strong></p>
    <ul className="mb-0">
      <li>Punto 1</li>
      <li>Punto 2</li>
    </ul>
  </div>
</div>
```

---

## 📦 Iconos de Bootstrap disponibles

Algunos iconos útiles:
- `bi-egg-fill` - Proteínas
- `bi-lightning-fill` - Energía
- `bi-heart-pulse-fill` - Salud
- `bi-droplet-fill` - Hidratación
- `bi-shield-check` - Protección
- `bi-graph-up-arrow` - Crecimiento
- `bi-capsule` - Vitaminas
- `bi-apple` - Frutas
- `bi-lightbulb-fill` - Ideas
- `bi-exclamation-triangle-fill` - Advertencia

Ver todos en: https://icons.getbootstrap.com/

---

## 💡 Consejos

1. **Copia de plantilla**: Duplica `CushuroBlog.jsx` o `QuinuaBlog.jsx` y modifica el contenido
2. **Slug único**: El slug debe ser único y coincidir en metadata e index.js
3. **Imágenes**: Coloca las imágenes en `public/assets/img/blog/`
4. **Diseño personalizado**: Puedes cambiar completamente el diseño de cada blog
5. **Categorías**: Usa las carpetas para organizar por categoría

---

## 🐛 Problemas comunes

**Blog no aparece en el listado:**
- Verifica que agregaste la metadata en `blogMetadata.js`

**Error 404 al abrir el blog:**
- Verifica que el slug en metadata coincida con el slug en `blogComponents`

**Blog aparece vacío:**
- Verifica que importaste y exportaste el componente correctamente en `index.js`

---

## 📁 Estructura final

```
src/
├── data/
│   └── blogMetadata.js          # ← Agrega metadata aquí
├── pages/
│   ├── BlogPage.jsx             # Listado (no tocar)
│   ├── BlogDetailPage.jsx       # Detalle (no tocar)
│   └── blogs/
│       ├── index.js             # ← Registra componente aquí
│       ├── nutricion/
│       │   ├── CushuroBlog.jsx
│       │   ├── QuinuaBlog.jsx
│       │   └── TuBlog.jsx       # ← Crea aquí
│       ├── psicologia/
│       ├── desarrollo-infantil/
│       └── ...
```

---

¡Feliz blogging! 🎉
