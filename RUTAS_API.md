# 📚 Documentación de API - Negocio360

## 🚀 Rutas Disponibles

Base URL: `http://localhost:2018/api` o `https://localhost:2018/api`

---

## 📦 PRODUCTOS

### Obtener todos los productos
```http
GET /api/productos
```

**Query Parameters:**
- `activo` (boolean): Filtrar por estado activo
- `categoria_id` (number): Filtrar por categoría
- `destacado` (boolean): Filtrar productos destacados
- `buscar` (string): Buscar por nombre, descripción o código
- `limit` (number): Límite de resultados (default: 50)
- `offset` (number): Offset para paginación (default: 0)
- `order` (string): Ordenamiento (default: "created_at.desc")

**Ejemplo:**
```bash
curl "http://localhost:2018/api/productos?activo=true&limit=10"
```

### Obtener productos con stock bajo
```http
GET /api/productos/stock-bajo
```

### Obtener un producto específico
```http
GET /api/productos/:id
```

### Crear nuevo producto
```http
POST /api/productos
Content-Type: multipart/form-data
```

**Body (form-data):**
- `nombre` (string, requerido)
- `descripcion` (string)
- `codigo` (string)
- `categoria_id` (number)
- `precio` (number)
- `costo` (number)
- `stock` (number)
- `stock_minimo` (number)
- `imagen` (file): Imagen del producto (máx 10MB automáticamente comprimido)
- `tags` (string): Separado por comas
- `activo` (boolean)
- `destacado` (boolean)

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:2018/api/productos \
  -F "nombre=Laptop Dell" \
  -F "descripcion=Laptop alta gama" \
  -F "precio=1299.99" \
  -F "stock=10" \
  -F "categoria_id=1" \
  -F "imagen=@/ruta/a/imagen.jpg"
```

### Actualizar producto
```http
PUT /api/productos/:id
Content-Type: multipart/form-data
```

### Eliminar producto
```http
DELETE /api/productos/:id
```

### Agregar imágenes adicionales (galería)
```http
POST /api/productos/:id/imagenes
Content-Type: multipart/form-data
```

**Body:**
- `imagenes[]` (files): Hasta 5 imágenes

---

## 👥 CLIENTES

### Obtener todos los clientes
```http
GET /api/clientes
```

**Query Parameters:**
- `activo` (boolean)
- `tipo` (string): "persona" o "empresa"
- `buscar` (string)
- `limit` (number)
- `offset` (number)
- `order` (string)

### Obtener un cliente específico
```http
GET /api/clientes/:id
```

### Obtener ventas de un cliente
```http
GET /api/clientes/:id/ventas
```

### Obtener saldo del cliente
```http
GET /api/clientes/:id/saldo
```

### Crear nuevo cliente
```http
POST /api/clientes
Content-Type: application/json
```

**Body:**
```json
{
  "codigo": "CLI-001",
  "tipo": "persona",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@ejemplo.com",
  "telefono": "+54 11 1234-5678",
  "direccion": "Calle Falsa 123",
  "ciudad": "Buenos Aires",
  "pais": "Argentina",
  "limite_credito": 10000,
  "activo": true
}
```

### Actualizar cliente
```http
PUT /api/clientes/:id
```

### Eliminar cliente
```http
DELETE /api/clientes/:id
```

---

## 🛒 VENTAS

### Obtener todas las ventas
```http
GET /api/ventas
```

**Query Parameters:**
- `estado` (string): "pendiente", "pagada", "parcial", "cancelada", "anulada"
- `tipo` (string): "venta", "cotizacion", "pedido", "devolucion"
- `cliente_id` (number)
- `fecha_desde` (date): YYYY-MM-DD
- `fecha_hasta` (date): YYYY-MM-DD
- `limit` (number)
- `offset` (number)

### Obtener resumen de ventas
```http
GET /api/ventas/resumen
```

### Obtener estadísticas de ventas
```http
GET /api/ventas/estadisticas?fecha_desde=2024-01-01&fecha_hasta=2024-12-31
```

### Obtener una venta específica
```http
GET /api/ventas/:id
```

### Crear nueva venta
```http
POST /api/ventas
Content-Type: application/json
```

**Body:**
```json
{
  "numero": "V-0001",
  "cliente_id": 1,
  "tipo": "venta",
  "estado": "pendiente",
  "subtotal": 1000,
  "descuento": 50,
  "impuesto": 210,
  "total": 1160,
  "pagado": 500,
  "saldo": 660,
  "metodo_pago": "efectivo",
  "observaciones": "Primera compra",
  "detalles": [
    {
      "producto_id": 1,
      "cantidad": 2,
      "precio_unitario": 500,
      "descuento": 25,
      "impuesto": 105,
      "subtotal": 975,
      "total": 1080
    }
  ]
}
```

### Actualizar venta
```http
PUT /api/ventas/:id
```

### Anular venta
```http
DELETE /api/ventas/:id
```

---

## 📂 CATEGORÍAS

### Obtener todas las categorías
```http
GET /api/categorias
```

### Obtener productos de una categoría
```http
GET /api/categorias/:id/productos
```

### Crear nueva categoría
```http
POST /api/categorias
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Electrónica",
  "descripcion": "Productos electrónicos",
  "slug": "electronica",
  "icono": "💻",
  "color": "#3b82f6",
  "orden": 1,
  "activo": true
}
```

### Actualizar categoría
```http
PUT /api/categorias/:id
```

### Eliminar categoría
```http
DELETE /api/categorias/:id
```

---

## 🏢 PROVEEDORES

### Obtener todos los proveedores
```http
GET /api/proveedores
```

### Obtener compras de un proveedor
```http
GET /api/proveedores/:id/compras
```

### Crear nuevo proveedor
```http
POST /api/proveedores
Content-Type: application/json
```

**Body:**
```json
{
  "codigo": "PROV-001",
  "nombre": "Distribuidora Tech",
  "razon_social": "Distribuidora Tech SA",
  "email": "ventas@distribuidoratech.com",
  "telefono": "+54 11 1111-1111",
  "direccion": "Av. Principal 456",
  "ciudad": "Buenos Aires",
  "pais": "Argentina",
  "activo": true
}
```

---

## 📥 COMPRAS

### Obtener todas las compras
```http
GET /api/compras
```

**Query Parameters:**
- `estado` (string): "pendiente", "recibida", "parcial", "cancelada"
- `proveedor_id` (number)
- `fecha_desde` (date)
- `fecha_hasta` (date)

### Crear nueva compra
```http
POST /api/compras
Content-Type: application/json
```

**Body:**
```json
{
  "numero": "C-0001",
  "proveedor_id": 1,
  "estado": "recibida",
  "subtotal": 5000,
  "descuento": 0,
  "impuesto": 1050,
  "total": 6050,
  "pagado": 6050,
  "saldo": 0,
  "observaciones": "Compra de inventario",
  "detalles": [
    {
      "producto_id": 1,
      "cantidad": 10,
      "precio_unitario": 500,
      "descuento": 0,
      "impuesto": 105,
      "subtotal": 5000,
      "total": 5105
    }
  ]
}
```

---

## 💰 PAGOS

### Obtener todos los pagos
```http
GET /api/pagos
```

**Query Parameters:**
- `tipo` (string): "ingreso" o "egreso"
- `metodo` (string): "efectivo", "tarjeta_credito", "tarjeta_debito", "transferencia", "cheque", "otro"
- `fecha_desde` (date)
- `fecha_hasta` (date)
- `cliente_id` (number)
- `proveedor_id` (number)

### Obtener estadísticas de pagos
```http
GET /api/pagos/estadisticas?fecha_desde=2024-01-01&fecha_hasta=2024-12-31
```

### Registrar nuevo pago
```http
POST /api/pagos
Content-Type: application/json
```

**Body:**
```json
{
  "tipo": "ingreso",
  "referencia_tipo": "venta",
  "referencia_id": 1,
  "cliente_id": 1,
  "monto": 1000,
  "metodo": "efectivo",
  "referencia": "Pago Venta #001",
  "observaciones": "Pago completo"
}
```

---

## 📸 Manejo de Imágenes

El sistema incluye compresión automática de imágenes:

✅ **Características:**
- Acepta archivos de cualquier tamaño
- Comprime automáticamente a máximo 10 MB
- Convierte a formato WebP para mejor compresión
- Mantiene la calidad visual
- Redimensiona cuando es necesario

**Formatos aceptados:**
- JPEG/JPG
- PNG
- GIF
- WebP

**Ejemplo de subida de imagen:**
```bash
curl -X POST http://localhost:2018/api/productos \
  -F "nombre=Mi Producto" \
  -F "precio=99.99" \
  -F "imagen=@imagen-grande.jpg"
```

La imagen se comprimirá automáticamente y estará disponible en:
```
http://localhost:2018/uploads/imagenes/[uuid]-[timestamp].webp
```

---

## 🔧 Rutas Genéricas (Datos)

Para tablas no especificadas arriba, puedes usar las rutas genéricas:

### Obtener todos los registros
```http
GET /api/datos/:tabla
```

### Obtener un registro
```http
GET /api/datos/:tabla/:id
```

### Crear registro
```http
POST /api/datos/:tabla
```

### Actualizar registro
```http
PUT /api/datos/:tabla/:id
```

### Eliminar registro
```http
DELETE /api/datos/:tabla/:id
```

### Búsqueda avanzada
```http
POST /api/datos/:tabla/buscar
```

---

## 📊 Respuestas de la API

### Respuesta exitosa:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}
```

### Respuesta con error:
```json
{
  "success": false,
  "error": {
    "message": "Descripción del error"
  }
}
```

### Respuesta con paginación:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 150
  }
}
```

---

## 🧪 Probar la API

Puedes usar el archivo `api-examples.http` incluido con VS Code REST Client, o usar Postman/Insomnia importando estas rutas.

**Verificar que el servidor esté funcionando:**
```bash
curl http://localhost:2018/api/health
```

---

## 📝 Notas Importantes

1. **Autenticación:** Algunas rutas pueden requerir autenticación (implementar según necesidades)
2. **RLS de Supabase:** Asegúrate de configurar las políticas de seguridad en Supabase
3. **Validación:** Los datos se validan en el backend
4. **Transacciones:** Las ventas y compras manejan stock automáticamente
5. **Imágenes:** Se almacenan localmente en `/uploads/imagenes/`

---

## 🔄 Actualizar el servidor

```bash
# Instalar dependencias
npm install

# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

---

¡Listo para usar! 🎉
