# Instrucciones para Refactorizar Backend - Beneficios

## 📋 Resumen de Cambios

Se eliminó la tabla intermedia `beneficio_convenio` y se agregó la columna `convenio_id` directamente en la tabla `beneficios`, ya que **un beneficio pertenece a un solo convenio**.

---

## 🗄️ Paso 1: Ejecutar Migración SQL

Ejecuta el archivo `migration_beneficios.sql` en tu base de datos:

```bash
psql -U tu_usuario -d tu_database -f migration_beneficios.sql
```

O copia y pega el contenido del archivo en tu cliente SQL preferido (pgAdmin, DBeaver, etc.)

---

## 🔧 Paso 2: Modificar el Backend (Node.js/Express)

### 2.1. Actualizar Modelo de Beneficios

El modelo de `beneficios` ahora debe incluir `convenio_id`:

```javascript
// models/Beneficio.js o similar
{
  id: INTEGER,
  nombre: STRING,
  descripcion: STRING,
  categoria: STRING,
  descuento: STRING,
  convenio_id: INTEGER,  // ← NUEVA COLUMNA
  activo: BOOLEAN,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### 2.2. Eliminar Controladores/Rutas de beneficio_convenio

**Eliminar estas rutas:**
- `POST /convenios/beneficios-convenios`
- `GET /convenios/beneficios-convenios/por-convenio/:id`
- `GET /convenios/beneficios-convenios/por-beneficio/:id`
- `DELETE /convenios/beneficios-convenios/:id`
- `PUT /convenios/beneficios-convenios/:id/activar`
- `PUT /convenios/beneficios-convenios/:id/desactivar`

### 2.3. Modificar Endpoints de Beneficios

#### **GET /convenios/beneficios**
Ahora debe aceptar el parámetro `convenio_id` para filtrar:

```javascript
// Controlador: obtener beneficios
async obtenerBeneficios(req, res) {
  try {
    const { activo, convenio_id } = req.query;

    const where = {};

    if (activo !== undefined) {
      where.activo = activo === 'true' || activo === '1';
    }

    if (convenio_id) {
      where.convenio_id = parseInt(convenio_id);
    }

    const beneficios = await Beneficio.findAll({
      where,
      include: [
        {
          model: Convenio,
          as: 'convenio',
          attributes: ['id', 'nombre', 'activo']
        }
      ],
      order: [['id', 'ASC']]
    });

    return res.json(beneficios);
  } catch (error) {
    console.error('Error al obtener beneficios:', error);
    return res.status(500).json({ message: 'Error al obtener beneficios' });
  }
}
```

#### **POST /convenios/beneficios**
Debe aceptar `convenio_id` en el body:

```javascript
// Controlador: crear beneficio
async crearBeneficio(req, res) {
  try {
    const { nombre, descripcion, categoria, descuento, convenio_id, activo } = req.body;

    // Validaciones
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }

    if (!convenio_id) {
      return res.status(400).json({ message: 'El convenio_id es obligatorio' });
    }

    // Verificar que el convenio existe
    const convenio = await Convenio.findByPk(convenio_id);
    if (!convenio) {
      return res.status(404).json({ message: 'Convenio no encontrado' });
    }

    const beneficio = await Beneficio.create({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      categoria: categoria?.trim() || null,
      descuento: descuento?.trim() || null,
      convenio_id: parseInt(convenio_id),
      activo: activo !== undefined ? activo : true
    });

    // Devolver el beneficio con su convenio
    const beneficioCompleto = await Beneficio.findByPk(beneficio.id, {
      include: [
        {
          model: Convenio,
          as: 'convenio',
          attributes: ['id', 'nombre', 'activo']
        }
      ]
    });

    return res.status(201).json(beneficioCompleto);
  } catch (error) {
    console.error('Error al crear beneficio:', error);
    return res.status(500).json({ message: 'Error al crear beneficio' });
  }
}
```

#### **PATCH /convenios/beneficios/:id**
Debe permitir actualizar `convenio_id`:

```javascript
// Controlador: actualizar beneficio
async actualizarBeneficio(req, res) {
  try {
    const { id } = req.params;
    const { nombre, descripcion, categoria, descuento, convenio_id, activo } = req.body;

    const beneficio = await Beneficio.findByPk(id);

    if (!beneficio) {
      return res.status(404).json({ message: 'Beneficio no encontrado' });
    }

    // Si se está cambiando el convenio, verificar que existe
    if (convenio_id && convenio_id !== beneficio.convenio_id) {
      const convenio = await Convenio.findByPk(convenio_id);
      if (!convenio) {
        return res.status(404).json({ message: 'Convenio no encontrado' });
      }
    }

    await beneficio.update({
      nombre: nombre?.trim() || beneficio.nombre,
      descripcion: descripcion !== undefined ? descripcion?.trim() : beneficio.descripcion,
      categoria: categoria !== undefined ? categoria?.trim() : beneficio.categoria,
      descuento: descuento !== undefined ? descuento?.trim() : beneficio.descuento,
      convenio_id: convenio_id || beneficio.convenio_id,
      activo: activo !== undefined ? activo : beneficio.activo
    });

    // Devolver el beneficio actualizado con su convenio
    const beneficioActualizado = await Beneficio.findByPk(id, {
      include: [
        {
          model: Convenio,
          as: 'convenio',
          attributes: ['id', 'nombre', 'activo']
        }
      ]
    });

    return res.json(beneficioActualizado);
  } catch (error) {
    console.error('Error al actualizar beneficio:', error);
    return res.status(500).json({ message: 'Error al actualizar beneficio' });
  }
}
```

### 2.4. Actualizar Asociaciones en Sequelize (si usas Sequelize)

```javascript
// models/Beneficio.js
Beneficio.belongsTo(Convenio, {
  foreignKey: 'convenio_id',
  as: 'convenio'
});

// models/Convenio.js
Convenio.hasMany(Beneficio, {
  foreignKey: 'convenio_id',
  as: 'beneficios'
});
```

### 2.5. Actualizar Endpoint de Verificar Beneficios

El endpoint que usa `VerificarBeneficios.jsx` debe devolver los beneficios con la nueva estructura:

```javascript
// GET /pacientes/:id/beneficios o similar
async verificarPacienteYObtenerBeneficios(req, res) {
  try {
    const { dni } = req.params; // o req.query

    // Buscar paciente
    const paciente = await Paciente.findOne({
      where: { numero_documento: dni, activo: true }
    });

    if (!paciente) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    // Obtener convenios del paciente
    const pacienteConvenios = await PacienteConvenio.findAll({
      where: {
        paciente_id: paciente.id,
        activo: true
      },
      include: [
        {
          model: Convenio,
          as: 'convenio',
          where: { activo: true },
          required: true
        }
      ]
    });

    const convenioIds = pacienteConvenios.map(pc => pc.convenio_id);

    // Obtener beneficios de esos convenios
    const beneficios = await Beneficio.findAll({
      where: {
        convenio_id: convenioIds,
        activo: true
      },
      include: [
        {
          model: Convenio,
          as: 'convenio',
          attributes: ['id', 'nombre']
        }
      ]
    });

    // Formatear respuesta para el frontend
    const beneficiosFormateados = beneficios.map(b => ({
      id: b.id,
      nombre: b.nombre,
      descripcion: b.descripcion,
      categoria: b.categoria,
      descuento: b.descuento,
      proveedor: b.convenio.nombre, // ← El nombre del convenio es el proveedor
      activo: b.activo
    }));

    return res.json({
      paciente: {
        id: paciente.id,
        nombre_completo: paciente.nombre_completo,
        numero_documento: paciente.numero_documento
      },
      beneficios: beneficiosFormateados,
      total_beneficios: beneficiosFormateados.length
    });
  } catch (error) {
    console.error('Error al verificar beneficios:', error);
    return res.status(500).json({ message: 'Error al verificar beneficios' });
  }
}
```

---

## 📊 Paso 3: Verificar la Migración

Después de ejecutar la migración SQL, verifica:

1. **Beneficios sin convenio asignado:**
```sql
SELECT id, nombre FROM beneficios WHERE convenio_id IS NULL;
```
Si hay resultados, asigna manualmente un convenio a esos beneficios.

2. **Contar beneficios por convenio:**
```sql
SELECT
    c.nombre AS convenio,
    COUNT(b.id) AS cantidad_beneficios
FROM convenios c
LEFT JOIN beneficios b ON b.convenio_id = c.id
GROUP BY c.id, c.nombre
ORDER BY cantidad_beneficios DESC;
```

---

## ✅ Checklist

- [ ] Ejecutar `migration_beneficios.sql`
- [ ] Verificar que no hay beneficios sin `convenio_id`
- [ ] Actualizar modelo de Beneficio
- [ ] Eliminar tabla `beneficio_convenio` del código
- [ ] Eliminar rutas de `beneficio_convenio`
- [ ] Actualizar endpoint `GET /convenios/beneficios`
- [ ] Actualizar endpoint `POST /convenios/beneficios`
- [ ] Actualizar endpoint `PATCH /convenios/beneficios/:id`
- [ ] Actualizar asociaciones Sequelize
- [ ] Actualizar endpoint de verificar beneficios
- [ ] Probar crear beneficio desde el frontend
- [ ] Probar editar beneficio desde el frontend
- [ ] Probar listar beneficios desde el frontend
- [ ] Probar verificar beneficios por DNI

---

## 🎯 Resultado Final

Después de estos cambios:

✅ Un beneficio pertenece directamente a un convenio (relación 1:N)
✅ No hay tabla intermedia innecesaria
✅ El código es más simple y directo
✅ Mejor rendimiento en las consultas
✅ Más fácil de mantener

---

## 🆘 Soporte

Si tienes problemas con la migración:
1. Haz backup de la base de datos antes de ejecutar el SQL
2. Verifica que no hay relaciones circulares
3. Revisa los logs del backend para errores
