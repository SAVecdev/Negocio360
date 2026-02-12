# 🚀 Negocio360 API

API REST completa para la gestión integral de negocios con Node.js, Express y Supabase.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#%EF%B8%8F-configuración)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Autenticación](#-autenticación)
- [Manejo de Imágenes](#-manejo-de-imágenes)
- [Ejemplos de Uso](#-ejemplos-de-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Base de Datos](#-base-de-datos)
- [Despliegue](#-despliegue)
- [Solución de Problemas](#-solución-de-problemas)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## 📖 Descripción

**Negocio360** es una API REST robusta y escalable diseñada para la gestión completa de negocios. Incluye módulos para productos, clientes, ventas, compras, inventario, pagos y más. Construida con las mejores prácticas y tecnologías modernas.

### 🎯 Caso de Uso

Ideal para:
- 🏪 Tiendas de retail
- 📦 Gestión de inventarios
- 💰 Puntos de venta (POS)
- 👥 Administración de clientes
- 📊 Reportes y análisis de ventas

---

## ✨ Características

- ✅ **CRUD Completo**: Productos, Clientes, Ventas, Compras, Proveedores, Pagos
- 🖼️ **Gestión de Imágenes**: Compresión automática a WebP, máximo 10MB
- 🔐 **Autenticación**: Sistema completo con Supabase Auth
- 📊 **Inventario en Tiempo Real**: Control automático de stock
- 💳 **Sistema de Pagos**: Registro de ingresos y egresos
- 📈 **Reportes y Estadísticas**: Ventas, compras y análisis financiero
- 🔒 **Seguridad**: RLS (Row Level Security) en Supabase
- 🌐 **API RESTful**: Diseño limpio y estandarizado
- 📱 **Responsive**: Optimizado para aplicaciones móviles
- ☁️ **Cloud Ready**: Listo para desplegar en producción

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Cuenta en Supabase** (gratuita)
- **PM2** (opcional, para producción)

```bash
# Verificar versiones
node --version
npm --version
```

---

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
cd /var/www/server
git clone https://github.com/tu-usuario/Negocio360.git
cd Negocio360
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Puerto del servidor
PORT=2018

# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-clave-anonima
SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role

# Configuración adicional
NODE_ENV=production

# Configuración SSL/HTTPS (false cuando se usa con Apache/Nginx)
ENABLE_HTTPS=false
SSL_CERT_PATH=./ssl/server.cert
SSL_KEY_PATH=./ssl/server.key
```

### 4. Crear la base de datos en Supabase

Ejecuta el script SQL en Supabase SQL Editor:

```bash
# El archivo está en database/schema.sql
```

O usa el script de ayuda:

```bash
node create-schema.js
```

### 5. Iniciar el servidor

**Modo desarrollo:**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

**Con PM2:**
```bash
pm2 start ecosystem.config.json
pm2 save
```

---

## ⚙️ Configuración

### Estructura del archivo `.env`

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `PORT` | Puerto del servidor | Sí |
| `SUPABASE_URL` | URL de tu proyecto Supabase | Sí |
| `SUPABASE_ANON_KEY` | Clave anónima de Supabase | Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio de Supabase | Sí |
| `NODE_ENV` | Entorno (development/production) | No |
| `ENABLE_HTTPS` | Habilitar HTTPS directo | No |

### Configurar Supabase

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a **Settings → API** y copia:
   - Project URL
   - anon/public key
   - service_role key
4. Ve a **SQL Editor** y ejecuta `database/schema.sql`

---

## 🎮 Uso

### URL Base

```
http://localhost:2018/api
```

En producción:
```
https://365smartnegocio.com/api
```

### Health Check

```bash
curl http://localhost:2018/api/health
```

Respuesta:
```json
{
  "success": true,
  "message": "API Negocio360 funcionando correctamente",
  "timestamp": "2026-02-12T19:30:00.000Z",
  "version": "1.0.0"
}
```

---

## 🌐 API Endpoints

### 📦 Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/productos` | Listar todos los productos |
| GET | `/api/productos/:id` | Obtener un producto |
| GET | `/api/productos/stock-bajo` | Productos con stock bajo |
| POST | `/api/productos` | Crear producto (con imagen) |
| PUT | `/api/productos/:id` | Actualizar producto |
| DELETE | `/api/productos/:id` | Eliminar producto |
| POST | `/api/productos/:id/imagenes` | Agregar imágenes (galería) |

**Query Parameters para GET /api/productos:**
- `activo` (boolean)
- `categoria_id` (number)
- `destacado` (boolean)
- `buscar` (string)
- `limit` (number) - Default: 50
- `offset` (number) - Default: 0
- `order` (string) - Default: "created_at.desc"

**Ejemplo:**
```bash
curl "http://localhost:2018/api/productos?activo=true&limit=10"
```

### 👥 Clientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/clientes` | Listar clientes |
| GET | `/api/clientes/:id` | Obtener un cliente |
| GET | `/api/clientes/:id/ventas` | Ventas del cliente |
| GET | `/api/clientes/:id/saldo` | Saldo del cliente |
| POST | `/api/clientes` | Crear cliente |
| PUT | `/api/clientes/:id` | Actualizar cliente |
| DELETE | `/api/clientes/:id` | Eliminar cliente |

**Ejemplo:**
```bash
curl -X POST http://localhost:2018/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "CLI-001",
    "tipo": "persona",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@ejemplo.com",
    "telefono": "+54 11 1234-5678",
    "ciudad": "Buenos Aires",
    "activo": true
  }'
```

### 🛒 Ventas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/ventas` | Listar ventas |
| GET | `/api/ventas/:id` | Obtener venta con detalles |
| GET | `/api/ventas/resumen` | Resumen de ventas |
| GET | `/api/ventas/estadisticas` | Estadísticas de ventas |
| POST | `/api/ventas` | Crear venta |
| PUT | `/api/ventas/:id` | Actualizar venta |
| DELETE | `/api/ventas/:id` | Anular venta |

**Query Parameters:**
- `estado` (string): pendiente, pagada, parcial, cancelada, anulada
- `tipo` (string): venta, cotizacion, pedido, devolucion
- `cliente_id` (number)
- `fecha_desde` (date): YYYY-MM-DD
- `fecha_hasta` (date): YYYY-MM-DD

### 📂 Categorías

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/categorias` | Listar categorías |
| GET | `/api/categorias/:id` | Obtener categoría |
| GET | `/api/categorias/:id/productos` | Productos de la categoría |
| POST | `/api/categorias` | Crear categoría |
| PUT | `/api/categorias/:id` | Actualizar categoría |
| DELETE | `/api/categorias/:id` | Eliminar categoría |

### 🏢 Proveedores

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/proveedores` | Listar proveedores |
| GET | `/api/proveedores/:id` | Obtener proveedor |
| GET | `/api/proveedores/:id/compras` | Compras del proveedor |
| POST | `/api/proveedores` | Crear proveedor |
| PUT | `/api/proveedores/:id` | Actualizar proveedor |
| DELETE | `/api/proveedores/:id` | Eliminar proveedor |

### 📥 Compras

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/compras` | Listar compras |
| GET | `/api/compras/:id` | Obtener compra con detalles |
| POST | `/api/compras` | Crear compra |
| PUT | `/api/compras/:id` | Actualizar compra |
| DELETE | `/api/compras/:id` | Eliminar compra |

### 💰 Pagos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/pagos` | Listar pagos |
| GET | `/api/pagos/:id` | Obtener pago |
| GET | `/api/pagos/estadisticas` | Estadísticas de pagos |
| POST | `/api/pagos` | Registrar pago |
| PUT | `/api/pagos/:id` | Actualizar pago |
| DELETE | `/api/pagos/:id` | Eliminar pago |

### 🗂️ Datos Genéricos

Para cualquier otra tabla:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/datos/:tabla` | Listar registros |
| GET | `/api/datos/:tabla/:id` | Obtener registro |
| POST | `/api/datos/:tabla` | Crear registro |
| PUT | `/api/datos/:tabla/:id` | Actualizar registro |
| DELETE | `/api/datos/:tabla/:id` | Eliminar registro |
| POST | `/api/datos/:tabla/buscar` | Búsqueda avanzada |

---

## 🔐 Autenticación

Actualmente la API utiliza Supabase Auth. Puedes implementar autenticación JWT siguiendo estos endpoints:

```javascript
// Registro
POST /api/auth/registro
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "nombre": "Juan",
  "apellido": "Pérez"
}

// Login
POST /api/auth/login
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}

// Logout
POST /api/auth/logout
```

Para proteger rutas, usa el middleware `verificarToken`:

```javascript
import { verificarToken } from './middleware/auth.js';

router.get('/ruta-protegida', verificarToken, (req, res) => {
  // Solo usuarios autenticados pueden acceder
  res.json({ usuario: req.usuario });
});
```

---

## 🖼️ Manejo de Imágenes

La API incluye un sistema avanzado de manejo de imágenes:

### Características:

- ✅ **Compresión automática** a máximo 10MB
- ✅ **Conversión a WebP** para mejor compresión
- ✅ **Calidad adaptativa** según tamaño
- ✅ **Redimensionamiento inteligente**
- ✅ **Múltiples imágenes** (galería)

### Formatos aceptados:
- JPEG/JPG
- PNG
- GIF
- WebP

### Ejemplo de subida:

```bash
curl -X POST http://localhost:2018/api/productos \
  -F "nombre=Laptop Dell" \
  -F "descripcion=Laptop alta gama" \
  -F "precio=1299.99" \
  -F "stock=10" \
  -F "categoria_id=1" \
  -F "imagen=@/ruta/a/imagen.jpg"
```

### Ejemplo con galería:

```bash
curl -X POST http://localhost:2018/api/productos/1/imagenes \
  -F "imagenes=@imagen1.jpg" \
  -F "imagenes=@imagen2.jpg" \
  -F "imagenes=@imagen3.jpg"
```

### Acceder a imágenes:

```
http://localhost:2018/uploads/imagenes/uuid-timestamp.webp
```

---

## 💻 Ejemplos de Uso

### Crear una Venta Completa

```javascript
const venta = {
  numero: "V-0001",
  cliente_id: 1,
  tipo: "venta",
  estado: "pendiente",
  subtotal: 1000,
  descuento: 50,
  impuesto: 210,
  total: 1160,
  pagado: 500,
  saldo: 660,
  metodo_pago: "efectivo",
  observaciones: "Primera compra",
  detalles: [
    {
      producto_id: 1,
      cantidad: 2,
      precio_unitario: 500,
      descuento: 25,
      impuesto: 105,
      subtotal: 975,
      total: 1080
    }
  ]
};

fetch('http://localhost:2018/api/ventas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(venta)
})
.then(res => res.json())
.then(data => console.log(data));
```

### Búsqueda Avanzada

```javascript
const filtros = {
  filtros: {
    activo: true,
    categoria_id: { operador: 'eq', valor: 1 },
    precio: { operador: 'gte', valor: 100 }
  },
  select: '*',
  limit: 20,
  order: 'precio.asc'
};

fetch('http://localhost:2018/api/datos/productos/buscar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(filtros)
})
.then(res => res.json())
.then(data => console.log(data));
```

### Cliente con JavaScript

```javascript
class Negocio360Client {
  constructor(baseURL = 'http://localhost:2018/api') {
    this.baseURL = baseURL;
  }

  async getProductos(params = {}) {
    const query = new URLSearchParams(params);
    const res = await fetch(`${this.baseURL}/productos?${query}`);
    return res.json();
  }

  async crearProducto(producto, imagen) {
    const formData = new FormData();
    Object.keys(producto).forEach(key => {
      formData.append(key, producto[key]);
    });
    if (imagen) formData.append('imagen', imagen);

    const res = await fetch(`${this.baseURL}/productos`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  }

  async getEstadisticasVentas(fechaDesde, fechaHasta) {
    const query = new URLSearchParams({ fecha_desde: fechaDesde, fecha_hasta: fechaHasta });
    const res = await fetch(`${this.baseURL}/ventas/estadisticas?${query}`);
    return res.json();
  }
}

// Uso
const client = new Negocio360Client();
const productos = await client.getProductos({ activo: true, limit: 10 });
console.log(productos);
```

---

## 📁 Estructura del Proyecto

```
Negocio360/
├── config/
│   └── supabase.js          # Configuración de Supabase
├── database/
│   ├── schema.sql           # Schema completo de la BD
│   └── README.md            # Documentación de BD
├── middleware/
│   ├── auth.js              # Middleware de autenticación
│   ├── errorHandler.js      # Manejo de errores
│   └── imageUpload.js       # Compresión de imágenes
├── routes/
│   ├── index.js             # Router principal
│   ├── auth.js              # Rutas de autenticación
│   ├── productos.js         # Rutas de productos
│   ├── clientes.js          # Rutas de clientes
│   ├── ventas.js            # Rutas de ventas
│   ├── categorias.js        # Rutas de categorías
│   ├── proveedores.js       # Rutas de proveedores
│   ├── compras.js           # Rutas de compras
│   ├── pagos.js             # Rutas de pagos
│   └── datos.js             # Rutas genéricas
├── public/
│   └── index.html           # Landing page
├── uploads/
│   └── imagenes/            # Almacenamiento de imágenes
├── ssl/
│   ├── server.cert          # Certificado SSL
│   └── server.key           # Clave privada SSL
├── .env                     # Variables de entorno
├── .env.example             # Ejemplo de variables
├── server.js                # Servidor principal
├── ecosystem.config.json    # Configuración PM2
├── package.json             # Dependencias
└── README.md                # Este archivo
```

---

## 🗄️ Base de Datos

### Tablas Principales

1. **usuarios** - Usuarios del sistema
2. **categorias** - Categorías de productos
3. **productos** - Catálogo de productos
4. **clientes** - Base de clientes
5. **proveedores** - Proveedores
6. **ventas** - Registro de ventas
7. **detalle_ventas** - Líneas de venta
8. **compras** - Registro de compras
9. **detalle_compras** - Líneas de compra
10. **pagos** - Ingresos y egresos
11. **movimientos_inventario** - Historial de stock

### Vistas Útiles

- `productos_stock_bajo` - Productos con stock menor al mínimo
- `ventas_resumen` - Vista consolidada de ventas

### Políticas de Seguridad (RLS)

La base de datos utiliza Row Level Security de Supabase. Para desarrollo, puedes deshabilitarlo:

```sql
ALTER TABLE public.ventas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras DISABLE ROW LEVEL SECURITY;
```

---

## 🚀 Despliegue

### Opción 1: Con PM2

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicación
pm2 start ecosystem.config.json

# Ver logs
pm2 logs negocio360-api

# Guardar configuración
pm2 save

# Iniciar al arrancar el sistema
pm2 startup
```

### Opción 2: Con Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 2018
CMD ["npm", "start"]
```

```bash
docker build -t negocio360-api .
docker run -p 2018:2018 --env-file .env negocio360-api
```

### Opción 3: Con Apache (Proxy Reverso)

El proyecto incluye configuración para Apache:

```bash
# Copiar configuración
sudo cp apache-config/365smartnegocio.conf /etc/apache2/sites-available/

# Habilitar sitio
sudo a2ensite 365smartnegocio.conf
sudo systemctl reload apache2
```

---

## 🔍 Solución de Problemas

### Error: "Could not find table in schema cache"

**Solución:** La tabla no existe. Ejecuta el schema SQL en Supabase.

```bash
node create-schema.js
```

### Error: "Row Level Security policy violation"

**Solución:** Deshabilita RLS en desarrollo:

```sql
ALTER TABLE nombre_tabla DISABLE ROW LEVEL SECURITY;
```

### Error: "EADDRINUSE: address already in use"

**Solución:** El puerto está ocupado:

```bash
# Encontrar proceso
lsof -ti:2018

# Matar proceso
kill -9 $(lsof -ti:2018)

# O cambiar puerto en .env
PORT=3000
```

### Imágenes no se muestran

**Solución:** Verifica permisos de la carpeta uploads:

```bash
chmod -R 755 uploads/
```

### Apache devuelve "Proxy Error"

**Solución:** Asegúrate de que Node.js esté en HTTP (no HTTPS) cuando uses Apache:

```env
ENABLE_HTTPS=false
```

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📞 Soporte

- **Email:** soporte@365smartnegocio.com
- **Website:** https://365smartnegocio.com
- **Issues:** [GitHub Issues](https://github.com/tu-usuario/Negocio360/issues)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) - Backend as a Service
- [Express](https://expressjs.com) - Framework web
- [Sharp](https://sharp.pixelplumbing.com) - Procesamiento de imágenes
- [Node.js](https://nodejs.org) - Runtime

---

<div align="center">

**Hecho con ❤️ por el equipo de 365smartnegocio.com**

[⬆ Volver arriba](#-negocio360-api)

</div>
