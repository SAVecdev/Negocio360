# Configuración de Supabase para Negocio360

## 📋 Pasos para configurar Supabase

### 1. Crear cuenta y proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Guarda las credenciales que te proporciona

### 2. Obtener las credenciales

En el dashboard de tu proyecto:
- Ve a **Settings** → **API**
- Copia:
  - **Project URL** (SUPABASE_URL)
  - **anon public** key (SUPABASE_ANON_KEY)
  - **service_role** key (SUPABASE_SERVICE_ROLE_KEY)

### 3. Configurar el archivo .env

Copia `.env.example` a `.env` y completa:

```env
SUPABASE_URL=https://tu-proyecto-id.supabase.co
SUPABASE_ANON_KEY=tu-clave-anonima-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role-aqui
```

### 4. Crear tablas de ejemplo

#### Tabla de productos

```sql
-- Tabla productos
CREATE TABLE productos (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  categoria TEXT,
  imagen_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_productos_activo ON productos(activo);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_productos_updated_at
    BEFORE UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### Tabla de clientes

```sql
-- Tabla clientes
CREATE TABLE clientes (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT,
  direccion TEXT,
  ciudad TEXT,
  pais TEXT DEFAULT 'Argentina',
  activo BOOLEAN DEFAULT true,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_nombre ON clientes(nombre);

CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### Tabla de ventas

```sql
-- Tabla ventas
CREATE TABLE ventas (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT REFERENCES clientes(id) ON DELETE SET NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  estado TEXT DEFAULT 'pendiente',
  fecha_venta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ventas_cliente_id ON ventas(cliente_id);
CREATE INDEX idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX idx_ventas_estado ON ventas(estado);

CREATE TRIGGER update_ventas_updated_at
    BEFORE UPDATE ON ventas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### Tabla de detalle de ventas

```sql
-- Tabla detalle_ventas
CREATE TABLE detalle_ventas (
  id BIGSERIAL PRIMARY KEY,
  venta_id BIGINT REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id BIGINT REFERENCES productos(id) ON DELETE SET NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_detalle_ventas_venta_id ON detalle_ventas(venta_id);
CREATE INDEX idx_detalle_ventas_producto_id ON detalle_ventas(producto_id);
```

### 5. Configurar políticas de seguridad (RLS)

Por defecto, las tablas están protegidas. Necesitas crear políticas:

#### Opción 1: Deshabilitar RLS (solo para desarrollo)

```sql
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE ventas DISABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_ventas DISABLE ROW LEVEL SECURITY;
```

#### Opción 2: Crear políticas (recomendado para producción)

```sql
-- Habilitar RLS
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública
CREATE POLICY "Permitir lectura pública de productos"
ON productos FOR SELECT
USING (true);

-- Permitir escritura solo a usuarios autenticados
CREATE POLICY "Permitir escritura a usuarios autenticados"
ON productos FOR ALL
USING (auth.role() = 'authenticated');
```

### 6. Insertar datos de prueba

```sql
-- Productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, stock, categoria) VALUES
('Laptop Dell XPS 13', 'Laptop ultraportátil de alta gama', 1299.99, 15, 'Electrónica'),
('Mouse Logitech MX Master 3', 'Mouse ergonómico inalámbrico', 99.99, 50, 'Accesorios'),
('Teclado Mecánico Keychron K2', 'Teclado mecánico inalámbrico', 79.99, 30, 'Accesorios'),
('Monitor LG 27" 4K', 'Monitor 4K IPS 27 pulgadas', 399.99, 20, 'Electrónica'),
('Webcam Logitech C920', 'Webcam Full HD 1080p', 69.99, 40, 'Accesorios');

-- Clientes de ejemplo
INSERT INTO clientes (nombre, email, telefono, ciudad) VALUES
('Juan Pérez', 'juan@ejemplo.com', '+54 11 1234-5678', 'Buenos Aires'),
('María García', 'maria@ejemplo.com', '+54 11 8765-4321', 'Córdoba'),
('Carlos Rodríguez', 'carlos@ejemplo.com', '+54 11 5555-5555', 'Rosario');
```

### 7. Verificar la conexión

Inicia la API y verifica que se conecte correctamente:

```bash
npm run dev
```

Deberías ver:
```
✅ Conexión a Supabase establecida correctamente
🚀 Servidor corriendo en puerto 3000
```

### 8. Probar los endpoints

Usa el archivo `api-examples.http` o abre `examples/demo.html` en tu navegador.

## 🔒 Seguridad

### Mejores prácticas:

1. **Nunca expongas** el `service_role` key en el frontend
2. **Habilita RLS** (Row Level Security) en producción
3. **Usa políticas** específicas para cada tabla
4. **Valida datos** en el backend antes de enviarlos a Supabase
5. **Usa HTTPS** en producción
6. **Implementa rate limiting** para prevenir abuso
7. **Audita logs** regularmente

### Variables de entorno en producción:

- Usa servicios como Vercel, Railway, o Render que soportan variables de entorno
- Nunca subas el archivo `.env` a Git
- Rota las claves periódicamente

## 📚 Recursos útiles

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

## ❓ Troubleshooting

### Error: "relation does not exist"
→ La tabla no existe en Supabase. Créala usando SQL Editor.

### Error: "new row violates row-level security policy"
→ Deshabilita RLS o crea políticas apropiadas.

### Error: "Invalid API key"
→ Verifica que las credenciales en `.env` sean correctas.

### Error: CORS
→ Verifica que CORS esté habilitado en tu proyecto de Supabase (lo está por defecto).
