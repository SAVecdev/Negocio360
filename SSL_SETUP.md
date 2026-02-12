# Configuración SSL/HTTPS

Esta guía explica cómo configurar HTTPS en tu API Negocio360.

## 🔐 Opciones de SSL

### 1. Certificados Auto-firmados (Desarrollo)

Para desarrollo local, usa certificados auto-firmados:

```bash
# Linux/Mac
npm run generate:ssl

# Windows (requiere OpenSSL instalado)
generate-ssl.bat
```

Esto creará:
- `ssl/server.key` - Clave privada
- `ssl/server.cert` - Certificado

⚠️ **Nota**: Los navegadores mostrarán advertencia de seguridad (es normal para certificados auto-firmados).

### 2. Let's Encrypt (Producción)

Para producción con dominio público:

```bash
# Reemplaza "tu-dominio.com" con tu dominio real
sudo ./setup-letsencrypt.sh tu-dominio.com admin@tu-dominio.com
```

**Requisitos:**
- Dominio público apuntando a tu servidor
- Puerto 80 abierto (para validación)
- Puerto 443 abierto (para HTTPS)
- Ejecutar como root/sudo

## ⚙️ Configuración

### Archivo .env

```env
# Habilitar HTTPS
ENABLE_HTTPS=true

# Para certificados auto-firmados (desarrollo)
SSL_CERT_PATH=./ssl/server.cert
SSL_KEY_PATH=./ssl/server.key

# Para Let's Encrypt (producción)
# SSL_CERT_PATH=/etc/letsencrypt/live/tu-dominio.com/fullchain.pem
# SSL_KEY_PATH=/etc/letsencrypt/live/tu-dominio.com/privkey.pem
```

### Deshabilitar HTTPS

Si quieres usar HTTP normal:

```env
ENABLE_HTTPS=false
```

## 🚀 Iniciar servidor

```bash
# Desarrollo con HTTPS
npm run dev

# Producción con HTTPS
npm start
```

El servidor mostrará:
```
========================================
🔒 Servidor HTTPS corriendo en puerto 2018
📍 https://localhost:2018
🌍 Entorno: development
🔐 SSL/TLS: Habilitado
========================================
```

## 🌐 Acceder al servidor

### Desarrollo (certificado auto-firmado)

1. Abre `https://localhost:2018`
2. El navegador mostrará advertencia de seguridad
3. Haz clic en "Avanzado" → "Continuar a localhost"

### Producción (Let's Encrypt)

Accede normalmente a `https://tu-dominio.com:2018`

## 🔄 Renovación automática (Let's Encrypt)

Let's Encrypt certifica por 90 días. Configura renovación automática:

```bash
# Prueba la renovación (dry-run)
sudo certbot renew --dry-run

# Configurar cron job para renovación automática
sudo crontab -e

# Agregar esta línea (renueva dos veces al día)
0 0,12 * * * certbot renew --quiet
```

Después de renovar, reinicia el servidor:

```bash
# Opción 1: Agregar al cron
0 0,12 * * * certbot renew --quiet && systemctl restart negocio360-api

# Opción 2: Hook de renovación
sudo certbot renew --deploy-hook "systemctl restart negocio360-api"
```

## 🐳 Docker con HTTPS

Si usas Docker:

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 2018

CMD ["npm", "start"]
```

```bash
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "2018:2018"
    volumes:
      - ./ssl:/app/ssl
      - /etc/letsencrypt:/etc/letsencrypt:ro
    environment:
      - ENABLE_HTTPS=true
      - SSL_CERT_PATH=/etc/letsencrypt/live/tu-dominio.com/fullchain.pem
      - SSL_KEY_PATH=/etc/letsencrypt/live/tu-dominio.com/privkey.pem
```

## 🔧 Reverse Proxy (Nginx)

Alternativa recomendada: usar Nginx como reverse proxy para manejar SSL:

```nginx
# /etc/nginx/sites-available/negocio360

server {
    listen 80;
    server_name tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:2018;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

En este caso, configura la API en HTTP y deja que Nginx maneje SSL:

```env
ENABLE_HTTPS=false
PORT=2018
```

## 🔍 Verificar configuración SSL

```bash
# Verificar certificados
openssl x509 -in ssl/server.cert -text -noout

# Verificar que el servidor esté escuchando en HTTPS
ss -tlnp | grep 2018

# Test con curl
curl -k https://localhost:2018/api/health

# Test desde navegador
https://localhost:2018
```

## 📱 Frontend con HTTPS

Actualiza el cliente para usar HTTPS:

```javascript
// apiClient.js
const api = new ApiClient('https://localhost:2018/api');

// O con variable de entorno
const api = new ApiClient(process.env.VITE_API_URL || 'https://localhost:2018/api');
```

## ⚠️ Problemas comunes

### Error: EACCES (Permission denied) en puerto 443

Los puertos < 1024 requieren privilegios de superusuario:

```bash
# Opción 1: Usar un puerto > 1024
PORT=2018

# Opción 2: Dar permisos a Node.js
sudo setcap cap_net_bind_service=+ep $(which node)

# Opción 3: Ejecutar como root (NO RECOMENDADO)
sudo npm start
```

### Certificado expirado

```bash
# Renovar manualmente
sudo certbot renew

# Verificar fecha de expiración
openssl x509 -in /etc/letsencrypt/live/tu-dominio.com/cert.pem -noout -dates
```

### Error: UNABLE_TO_VERIFY_LEAF_SIGNATURE

Para desarrollo con certificados auto-firmados:

```javascript
// Deshabilitar verificación SSL (SOLO DESARROLLO)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
```

## 🔒 Mejores prácticas de seguridad

1. **Usa HTTPS en producción** - Siempre
2. **Mantén certificados actualizados** - Configura renovación automática
3. **Usa TLS 1.2+** - Deshabilita versiones antiguas
4. **HSTS Header** - Ya incluido con helmet.js
5. **Protege claves privadas** - Permisos 600, nunca en Git
6. **Usa Nginx/Apache** - Como reverse proxy en producción
7. **Monitorea vencimientos** - Configura alertas

## 📚 Recursos

- [Let's Encrypt](https://letsencrypt.org/)
- [Certbot](https://certbot.eff.org/)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- [Node.js HTTPS Docs](https://nodejs.org/api/https.html)
- [Nginx SSL Config](https://ssl-config.mozilla.org/)
