-- ============================================
-- Schema SQL para Supabase - Negocio360
-- Sistema completo de gestión de negocios
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- TABLA: usuarios (sincronizada con auth.users)
-- ============================================

CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT,
    apellido TEXT,
    telefono TEXT,
    avatar_url TEXT,
    rol TEXT DEFAULT 'usuario' CHECK (rol IN ('admin', 'supervisor', 'vendedor', 'usuario')),
    activo BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON public.usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON public.usuarios(activo);

-- Trigger para updated_at
CREATE TRIGGER update_usuarios_updated_at 
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: categorias
-- ============================================

CREATE TABLE IF NOT EXISTS public.categorias (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    slug TEXT UNIQUE,
    icono TEXT,
    color TEXT,
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categorias_slug ON public.categorias(slug);
CREATE INDEX IF NOT EXISTS idx_categorias_activo ON public.categorias(activo);

CREATE TRIGGER update_categorias_updated_at 
    BEFORE UPDATE ON public.categorias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: productos
-- ============================================

CREATE TABLE IF NOT EXISTS public.productos (
    id BIGSERIAL PRIMARY KEY,
    codigo TEXT UNIQUE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    categoria_id BIGINT REFERENCES public.categorias(id) ON DELETE SET NULL,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0,
    costo DECIMAL(10,2) DEFAULT 0,
    stock INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 0,
    unidad_medida TEXT DEFAULT 'unidad',
    imagen_url TEXT,
    imagenes JSONB DEFAULT '[]'::jsonb,
    activo BOOLEAN DEFAULT true,
    destacado BOOLEAN DEFAULT false,
    tags TEXT[],
    metadata JSONB,
    created_by UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON public.productos(codigo);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON public.productos(nombre);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON public.productos(activo);
CREATE INDEX IF NOT EXISTS idx_productos_destacado ON public.productos(destacado);
CREATE INDEX IF NOT EXISTS idx_productos_tags ON public.productos USING GIN(tags);

CREATE TRIGGER update_productos_updated_at 
    BEFORE UPDATE ON public.productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: clientes
-- ============================================

CREATE TABLE IF NOT EXISTS public.clientes (
    id BIGSERIAL PRIMARY KEY,
    codigo TEXT UNIQUE,
    tipo TEXT DEFAULT 'persona' CHECK (tipo IN ('persona', 'empresa')),
    nombre TEXT NOT NULL,
    apellido TEXT,
    razon_social TEXT,
    documento_tipo TEXT,
    documento_numero TEXT,
    email TEXT,
    telefono TEXT,
    celular TEXT,
    direccion TEXT,
    ciudad TEXT,
    estado TEXT,
    codigo_postal TEXT,
    pais TEXT DEFAULT 'Argentina',
    fecha_nacimiento DATE,
    notas TEXT,
    limite_credito DECIMAL(10,2) DEFAULT 0,
    saldo DECIMAL(10,2) DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    metadata JSONB,
    created_by UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_clientes_codigo ON public.clientes(codigo);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON public.clientes(nombre);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_documento ON public.clientes(documento_numero);
CREATE INDEX IF NOT EXISTS idx_clientes_activo ON public.clientes(activo);

CREATE TRIGGER update_clientes_updated_at 
    BEFORE UPDATE ON public.clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: proveedores
-- ============================================

CREATE TABLE IF NOT EXISTS public.proveedores (
    id BIGSERIAL PRIMARY KEY,
    codigo TEXT UNIQUE,
    nombre TEXT NOT NULL,
    razon_social TEXT,
    rut TEXT,
    email TEXT,
    telefono TEXT,
    direccion TEXT,
    ciudad TEXT,
    pais TEXT DEFAULT 'Argentina',
    contacto_nombre TEXT,
    contacto_cargo TEXT,
    contacto_telefono TEXT,
    contacto_email TEXT,
    condiciones_pago TEXT,
    notas TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proveedores_codigo ON public.proveedores(codigo);
CREATE INDEX IF NOT EXISTS idx_proveedores_nombre ON public.proveedores(nombre);
CREATE INDEX IF NOT EXISTS idx_proveedores_activo ON public.proveedores(activo);

CREATE TRIGGER update_proveedores_updated_at 
    BEFORE UPDATE ON public.proveedores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: ventas
-- ============================================

CREATE TABLE IF NOT EXISTS public.ventas (
    id BIGSERIAL PRIMARY KEY,
    numero TEXT UNIQUE NOT NULL,
    cliente_id BIGINT REFERENCES public.clientes(id) ON DELETE SET NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tipo TEXT DEFAULT 'venta' CHECK (tipo IN ('venta', 'cotizacion', 'pedido', 'devolucion')),
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'parcial', 'cancelada', 'anulada')),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    descuento DECIMAL(10,2) DEFAULT 0,
    impuesto DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    pagado DECIMAL(10,2) DEFAULT 0,
    saldo DECIMAL(10,2) DEFAULT 0,
    metodo_pago TEXT,
    observaciones TEXT,
    vendedor_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para ventas
CREATE INDEX IF NOT EXISTS idx_ventas_numero ON public.ventas(numero);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON public.ventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON public.ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_estado ON public.ventas(estado);
CREATE INDEX IF NOT EXISTS idx_ventas_vendedor ON public.ventas(vendedor_id);

CREATE TRIGGER update_ventas_updated_at 
    BEFORE UPDATE ON public.ventas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: detalle_ventas
-- ============================================

CREATE TABLE IF NOT EXISTS public.detalle_ventas (
    id BIGSERIAL PRIMARY KEY,
    venta_id BIGINT REFERENCES public.ventas(id) ON DELETE CASCADE,
    producto_id BIGINT REFERENCES public.productos(id) ON DELETE SET NULL,
    cantidad DECIMAL(10,2) NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0,
    impuesto DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_detalle_ventas_venta ON public.detalle_ventas(venta_id);
CREATE INDEX IF NOT EXISTS idx_detalle_ventas_producto ON public.detalle_ventas(producto_id);

-- ============================================
-- TABLA: compras
-- ============================================

CREATE TABLE IF NOT EXISTS public.compras (
    id BIGSERIAL PRIMARY KEY,
    numero TEXT UNIQUE NOT NULL,
    proveedor_id BIGINT REFERENCES public.proveedores(id) ON DELETE SET NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'recibida', 'parcial', 'cancelada')),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    descuento DECIMAL(10,2) DEFAULT 0,
    impuesto DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    pagado DECIMAL(10,2) DEFAULT 0,
    saldo DECIMAL(10,2) DEFAULT 0,
    observaciones TEXT,
    recibido_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compras_numero ON public.compras(numero);
CREATE INDEX IF NOT EXISTS idx_compras_proveedor ON public.compras(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_compras_fecha ON public.compras(fecha);
CREATE INDEX IF NOT EXISTS idx_compras_estado ON public.compras(estado);

CREATE TRIGGER update_compras_updated_at 
    BEFORE UPDATE ON public.compras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: detalle_compras
-- ============================================

CREATE TABLE IF NOT EXISTS public.detalle_compras (
    id BIGSERIAL PRIMARY KEY,
    compra_id BIGINT REFERENCES public.compras(id) ON DELETE CASCADE,
    producto_id BIGINT REFERENCES public.productos(id) ON DELETE SET NULL,
    cantidad DECIMAL(10,2) NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0,
    impuesto DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_detalle_compras_compra ON public.detalle_compras(compra_id);
CREATE INDEX IF NOT EXISTS idx_detalle_compras_producto ON public.detalle_compras(producto_id);

-- ============================================
-- TABLA: pagos
-- ============================================

CREATE TABLE IF NOT EXISTS public.pagos (
    id BIGSERIAL PRIMARY KEY,
    tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    referencia_tipo TEXT CHECK (referencia_tipo IN ('venta', 'compra', 'otro')),
    referencia_id BIGINT,
    cliente_id BIGINT REFERENCES public.clientes(id) ON DELETE SET NULL,
    proveedor_id BIGINT REFERENCES public.proveedores(id) ON DELETE SET NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    monto DECIMAL(10,2) NOT NULL,
    metodo TEXT NOT NULL CHECK (metodo IN ('efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia', 'cheque', 'otro')),
    referencia TEXT,
    observaciones TEXT,
    recibido_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagos_tipo ON public.pagos(tipo);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON public.pagos(fecha);
CREATE INDEX IF NOT EXISTS idx_pagos_cliente ON public.pagos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pagos_proveedor ON public.pagos(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_pagos_metodo ON public.pagos(metodo);

-- ============================================
-- TABLA: movimientos_inventario
-- ============================================

CREATE TABLE IF NOT EXISTS public.movimientos_inventario (
    id BIGSERIAL PRIMARY KEY,
    producto_id BIGINT REFERENCES public.productos(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
    cantidad DECIMAL(10,2) NOT NULL,
    stock_anterior DECIMAL(10,2),
    stock_nuevo DECIMAL(10,2),
    motivo TEXT,
    referencia_tipo TEXT,
    referencia_id BIGINT,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movimientos_producto ON public.movimientos_inventario(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_tipo ON public.movimientos_inventario(tipo);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON public.movimientos_inventario(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_inventario ENABLE ROW LEVEL SECURITY;

-- Políticas para USUARIOS
CREATE POLICY "Usuarios pueden ver su propio perfil" 
    ON public.usuarios FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
    ON public.usuarios FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Admins pueden ver todos los usuarios" 
    ON public.usuarios FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

CREATE POLICY "Admins pueden insertar usuarios" 
    ON public.usuarios FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Políticas para CATEGORIAS (lectura pública, escritura admin)
CREATE POLICY "Cualquiera puede ver categorías activas" 
    ON public.categorias FOR SELECT 
    USING (activo = true OR auth.role() = 'authenticated');

CREATE POLICY "Solo admins pueden crear categorías" 
    ON public.categorias FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

CREATE POLICY "Solo admins pueden actualizar categorías" 
    ON public.categorias FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Políticas para PRODUCTOS
CREATE POLICY "Usuarios autenticados pueden ver productos" 
    ON public.productos FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins y supervisores pueden crear productos" 
    ON public.productos FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND rol IN ('admin', 'supervisor')
        )
    );

CREATE POLICY "Admins y supervisores pueden actualizar productos" 
    ON public.productos FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND rol IN ('admin', 'supervisor')
        )
    );

CREATE POLICY "Solo admins pueden eliminar productos" 
    ON public.productos FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Políticas para CLIENTES
CREATE POLICY "Usuarios autenticados pueden ver clientes" 
    ON public.clientes FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios pueden crear clientes" 
    ON public.clientes FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios pueden actualizar clientes" 
    ON public.clientes FOR UPDATE 
    USING (auth.role() = 'authenticated');

-- Políticas para VENTAS
CREATE POLICY "Usuarios pueden ver sus ventas" 
    ON public.ventas FOR SELECT 
    USING (
        vendedor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND rol IN ('admin', 'supervisor')
        )
    );

CREATE POLICY "Usuarios pueden crear ventas" 
    ON public.ventas FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios pueden actualizar sus ventas" 
    ON public.ventas FOR UPDATE 
    USING (
        vendedor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND rol IN ('admin', 'supervisor')
        )
    );

-- Políticas para DETALLE_VENTAS
CREATE POLICY "Ver detalles de ventas permitidas" 
    ON public.detalle_ventas FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.ventas 
            WHERE id = venta_id AND (
                vendedor_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.usuarios 
                    WHERE id = auth.uid() AND rol IN ('admin', 'supervisor')
                )
            )
        )
    );

CREATE POLICY "Crear detalles de ventas" 
    ON public.detalle_ventas FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Políticas similares para COMPRAS, PROVEEDORES, PAGOS, etc.
-- (Ajusta según tus necesidades de seguridad)

CREATE POLICY "Admins y supervisores pueden ver compras" 
    ON public.compras FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND rol IN ('admin', 'supervisor')
        )
    );

CREATE POLICY "Admins y supervisores pueden crear compras" 
    ON public.compras FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND rol IN ('admin', 'supervisor')
        )
    );

-- ============================================
-- DATOS DE EJEMPLO
-- ============================================

-- Insertar categorías
INSERT INTO public.categorias (nombre, descripcion, slug, icono, color) VALUES
('Electrónica', 'Productos electrónicos', 'electronica', '💻', '#3b82f6'),
('Ropa', 'Prendas de vestir', 'ropa', '👕', '#ef4444'),
('Alimentos', 'Productos alimenticios', 'alimentos', '🍕', '#10b981'),
('Hogar', 'Artículos para el hogar', 'hogar', '🏠', '#f59e0b'),
('Deportes', 'Artículos deportivos', 'deportes', '⚽', '#8b5cf6')
ON CONFLICT (slug) DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO public.productos (codigo, nombre, descripcion, categoria_id, precio, costo, stock, stock_minimo) VALUES
('PROD-001', 'Laptop Dell XPS 13', 'Laptop ultraportátil de alta gama', 1, 1299.99, 950.00, 15, 5),
('PROD-002', 'Mouse Logitech MX Master 3', 'Mouse ergonómico inalámbrico', 1, 99.99, 65.00, 50, 10),
('PROD-003', 'Teclado Mecánico Keychron K2', 'Teclado mecánico inalámbrico', 1, 79.99, 50.00, 30, 10),
('PROD-004', 'Monitor LG 27" 4K', 'Monitor 4K IPS 27 pulgadas', 1, 399.99, 280.00, 20, 5),
('PROD-005', 'Camiseta Nike Deportiva', 'Camiseta deportiva Dri-FIT', 2, 29.99, 15.00, 100, 20)
ON CONFLICT (codigo) DO NOTHING;

-- Insertar clientes de ejemplo
INSERT INTO public.clientes (codigo, tipo, nombre, apellido, email, telefono, ciudad, pais) VALUES
('CLI-001', 'persona', 'Juan', 'Pérez', 'juan.perez@ejemplo.com', '+54 11 1234-5678', 'Buenos Aires', 'Argentina'),
('CLI-002', 'persona', 'María', 'García', 'maria.garcia@ejemplo.com', '+54 11 8765-4321', 'Córdoba', 'Argentina'),
('CLI-003', 'empresa', 'Tech Solutions SA', NULL, 'contacto@techsolutions.com', '+54 11 5555-5555', 'Rosario', 'Argentina')
ON CONFLICT (codigo) DO NOTHING;

-- Insertar proveedores de ejemplo
INSERT INTO public.proveedores (codigo, nombre, razon_social, email, telefono, ciudad, pais) VALUES
('PROV-001', 'Distribuidora Tech', 'Distribuidora Tech SA', 'ventas@distribuidoratech.com', '+54 11 1111-1111', 'Buenos Aires', 'Argentina'),
('PROV-002', 'Import Electro', 'Import Electro SRL', 'info@importelectro.com', '+54 11 2222-2222', 'Mendoza', 'Argentina')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de productos con stock bajo
CREATE OR REPLACE VIEW productos_stock_bajo AS
SELECT 
    p.id,
    p.codigo,
    p.nombre,
    p.stock,
    p.stock_minimo,
    c.nombre as categoria,
    (p.stock - p.stock_minimo) as diferencia
FROM public.productos p
LEFT JOIN public.categorias c ON p.categoria_id = c.id
WHERE p.activo = true AND p.stock <= p.stock_minimo
ORDER BY (p.stock - p.stock_minimo) ASC;

-- Vista de ventas con totales
CREATE OR REPLACE VIEW ventas_resumen AS
SELECT 
    v.id,
    v.numero,
    v.fecha,
    v.tipo,
    v.estado,
    c.nombre || ' ' || COALESCE(c.apellido, '') as cliente,
    u.nombre as vendedor,
    v.subtotal,
    v.descuento,
    v.impuesto,
    v.total,
    v.pagado,
    v.saldo,
    COUNT(dv.id) as cantidad_items
FROM public.ventas v
LEFT JOIN public.clientes c ON v.cliente_id = c.id
LEFT JOIN public.usuarios u ON v.vendedor_id = u.id
LEFT JOIN public.detalle_ventas dv ON v.id = dv.venta_id
GROUP BY v.id, v.numero, v.fecha, v.tipo, v.estado, c.nombre, c.apellido, u.nombre, v.subtotal, v.descuento, v.impuesto, v.total, v.pagado, v.saldo;

-- ============================================
-- COMENTARIOS EN TABLAS
-- ============================================

COMMENT ON TABLE public.usuarios IS 'Usuarios del sistema sincronizados con auth.users';
COMMENT ON TABLE public.productos IS 'Catálogo de productos';
COMMENT ON TABLE public.clientes IS 'Clientes del negocio';
COMMENT ON TABLE public.ventas IS 'Registro de ventas';
COMMENT ON TABLE public.detalle_ventas IS 'Detalle de items de cada venta';
COMMENT ON TABLE public.compras IS 'Registro de compras a proveedores';
COMMENT ON TABLE public.pagos IS 'Registro de ingresos y egresos';
COMMENT ON TABLE public.movimientos_inventario IS 'Historial de movimientos de inventario';

-- ============================================
-- FIN DEL SCHEMA
-- ============================================

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Schema de Negocio360 creado exitosamente';
    RAISE NOTICE '📊 Tablas: usuarios, categorias, productos, clientes, proveedores, ventas, compras, pagos';
    RAISE NOTICE '🔒 RLS habilitado en todas las tablas';
    RAISE NOTICE '📝 Datos de ejemplo insertados';
    RAISE NOTICE '🎯 Listo para usar con la API';
END $$;
