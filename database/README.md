# 📊 Schema SQL para Supabase - Negocio360

Este archivo contiene el esquema completo de la base de datos para el sistema Negocio360.

## 🗂️ Estructura de la base de datos

### Tablas principales

1. **usuarios** - Gestión de usuarios del sistema
2. **categorias** - Categorías de productos
3. **productos** - Catálogo de productos
4. **clientes** - Clientes del negocio
5. **proveedores** - Proveedores
6. **ventas** - Registro de ventas
7. **detalle_ventas** - Detalles de cada venta
8. **compras** - Registro de compras
9. **detalle_compras** - Detalles de cada compra
10. **pagos** - Ingresos y egresos
11. **movimientos_inventario** - Historial de inventario

## 🚀 Cómo usar

### Opción 1: Desde Supabase Dashboard

1. Ve a tu proyecto en [Supabase](https://app.supabase.com)
2. Clic en "SQL Editor" en el menú lateral
3. Clic en "New Query"
4. Copia y pega el contenido de `schema.sql`
5. Clic en "Run"

### Opción 2: Desde la terminal

```bash
# Usando psql (requiere URL de conexión de Supabase)
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < database/schema.sql
```

### Opción 3: Usando la API de Supabase

```bash
# Desde la carpeta del proyecto
cd /var/www/server/Negocio360

# Ejecutar el SQL
cat database/schema.sql | supabase db execute
```

## 📋 Características

### ✅ Incluye:

- **11 tablas** principales con relaciones
- **Row Level Security (RLS)** habilitado
- **Políticas de seguridad** por roles (admin, supervisor, vendedor, usuario)
- **Índices** optimizados para consultas rápidas
- **Triggers** para actualización automática de timestamps
- **Funciones auxiliares** reutilizables
- **Datos de ejemplo** para empezar a probar
- **Vistas** para consultas complejas
- **Extensiones** (uuid-ossp, pgcrypto)

### 🔒 Seguridad (RLS)

Políticas implementadas:

- **Usuarios**: Solo pueden ver/editar su propio perfil (admins ven todos)
- **Productos**: Lectura para todos, escritura para admin/supervisor
- **Ventas**: Solo ven sus propias ventas (admins ven todas)
- **Clientes**: Acceso completo para usuarios autenticados
- **Compras**: Solo admin y supervisor

### 📊 Roles disponibles:

- `admin` - Acceso completo
- `supervisor` - Gestión de productos, compras, reportes
- `vendedor` - Crear ventas, ver clientes
- `usuario` - Acceso básico

## 🎨 Diagrama de relaciones

```
usuarios
  ├── ventas (vendedor_id)
  ├── compras (recibido_por)
  ├── productos (created_by)
  └── clientes (created_by)

categorias
  └── productos (categoria_id)

productos
  ├── detalle_ventas (producto_id)
  ├── detalle_compras (producto_id)
  └── movimientos_inventario (producto_id)

clientes
  ├── ventas (cliente_id)
  └── pagos (cliente_id)

proveedores
  ├── compras (proveedor_id)
  └── pagos (proveedor_id)

ventas
  └── detalle_ventas (venta_id)

compras
  └── detalle_compras (compra_id)
```

## 📝 Datos de ejemplo

El schema incluye datos iniciales:

- **5 categorías**: Electrónica, Ropa, Alimentos, Hogar, Deportes
- **5 productos**: Laptops, Mouse, Teclado, Monitor, Camiseta
- **3 clientes**: 2 personas, 1 empresa
- **2 proveedores**: Distribuidoras

## 🔧 Personalización

### Agregar un campo personalizado

```sql
-- Ejemplo: Agregar campo a productos
ALTER TABLE public.productos 
ADD COLUMN marca TEXT;
```

### Crear una nueva política RLS

```sql
-- Ejemplo: Solo admins eliminan clientes
CREATE POLICY "Solo admins eliminan clientes" 
    ON public.clientes FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );
```

### Agregar índice

```sql
-- Ejemplo: Índice para búsquedas por nombre
CREATE INDEX idx_clientes_nombre_busqueda 
ON public.clientes USING GIN(to_tsvector('spanish', nombre || ' ' || COALESCE(apellido, '')));
```

## 📱 Integración con la API

Después de ejecutar el schema, tu API podrá:

```javascript
// Listar productos
GET https://365smartnegocio.com/api/datos/productos

// Crear cliente
POST https://365smartnegocio.com/api/datos/clientes
{
  "nombre": "Carlos López",
  "email": "carlos@ejemplo.com"
}

// Buscar productos por categoría
POST https://365smartnegocio.com/api/datos/productos/buscar
{
  "filtros": {
    "categoria_id": 1,
    "activo": true
  }
}
```

## 🧪 Verificación

### Verificar que todo se creó correctamente:

```sql
-- Ver todas las tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Ver políticas RLS
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Contar registros de ejemplo
SELECT 
    (SELECT COUNT(*) FROM public.categorias) as categorias,
    (SELECT COUNT(*) FROM public.productos) as productos,
    (SELECT COUNT(*) FROM public.clientes) as clientes,
    (SELECT COUNT(*) FROM public.proveedores) as proveedores;
```

## 🔄 Migraciones futuras

Para agregar cambios sin perder datos:

1. Crear archivo de migración: `database/migrations/001_agregar_campo.sql`
2. Usar `ALTER TABLE` en lugar de `CREATE TABLE`
3. Documentar los cambios

Ejemplo:

```sql
-- Migration: Agregar descuentos a clientes
-- Fecha: 2026-02-12
-- Autor: Admin

ALTER TABLE public.clientes 
ADD COLUMN descuento_porcentaje DECIMAL(5,2) DEFAULT 0;

COMMENT ON COLUMN public.clientes.descuento_porcentaje 
IS 'Porcentaje de descuento para este cliente';
```

## ⚠️ Importante

1. **Backup**: Haz backup antes de ejecutar en producción
2. **Credenciales**: Las políticas RLS usan `auth.uid()` de Supabase Auth
3. **Sincronización**: La tabla `usuarios` se sincroniza con `auth.users`
4. **Timezone**: Todos los timestamps usan `TIMESTAMP WITH TIME ZONE`

## 📚 Recursos

- [Documentación Supabase](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Solución de problemas

### Error: "relation already exists"
**Solución**: Algunas tablas ya existen. Usa `DROP TABLE` primero o modifica el schema para usar `CREATE TABLE IF NOT EXISTS`.

### Error: "permission denied for schema public"
**Solución**: Tu usuario necesita permisos. Contacta soporte de Supabase.

### Las políticas RLS no funcionan
**Solución**: Verifica que estás autenticado y que `auth.uid()` retorna un valor válido.

## ✅ Checklist post-instalación

- [ ] Schema ejecutado sin errores
- [ ] 11 tablas creadas
- [ ] Datos de ejemplo insertados
- [ ] RLS habilitado
- [ ] Políticas creadas
- [ ] Índices creados
- [ ] Test de API funcionando
- [ ] Usuarios sincronizados con auth.users

---

**¡Listo para usar!** 🚀
