# Configuración Apache + HTTPS para 365smartnegocio.com

Esta guía explica cómo configurar Apache como proxy reverso para la API Negocio360 con HTTPS.

## 🎯 Objetivo

Configurar Apache para que:
- Reciba peticiones en `https://365smartnegocio.com`
- Redirija automáticamente HTTP a HTTPS
- Haga proxy a la API Node.js (puerto 2018)
- Use certificados SSL de Let's Encrypt

## 📋 Requisitos previos

1. **Dominio configurado**: 365smartnegocio.com debe apuntar a tu servidor
2. **Apache instalado**: `sudo apt install apache2`
3. **Puertos abiertos**: 80 (HTTP) y 443 (HTTPS)
4. **API corriendo**: En puerto 2018

## 🚀 Instalación automática

### Opción 1: Script automático (Recomendado)

```bash
cd /var/www/server/Negocio360
sudo ./setup-apache-https.sh
```

Este script hará automáticamente:
- ✅ Habilitar módulos de Apache necesarios
- ✅ Copiar configuración del sitio
- ✅ Obtener certificado SSL de Let's Encrypt
- ✅ Configurar renovación automática
- ✅ Recargar Apache

### Opción 2: Manual

#### Paso 1: Habilitar módulos de Apache

```bash
sudo a2enmod ssl
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
sudo a2enmod headers
```

#### Paso 2: Copiar configuración

```bash
sudo cp /var/www/server/Negocio360/apache-config/365smartnegocio.conf /etc/apache2/sites-available/
```

#### Paso 3: Habilitar el sitio

```bash
sudo a2ensite 365smartnegocio.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

#### Paso 4: Obtener certificado SSL

```bash
# Instalar certbot
sudo apt update
sudo apt install certbot python3-certbot-apache

# Obtener certificado
sudo certbot --apache -d 365smartnegocio.com -d www.365smartnegocio.com
```

## ⚙️ Configuración de la API

La API debe estar configurada para recibir conexiones del proxy:

### 1. Deshabilitar HTTPS en la API (Apache lo manejará)

Edita `/var/www/server/Negocio360/.env`:

```env
# Apache maneja SSL, la API solo HTTP
ENABLE_HTTPS=false
PORT=2018
```

### 2. Reiniciar la API

```bash
cd /var/www/server/Negocio360

# Detener proceso anterior
lsof -ti:2018 | xargs kill -9

# Iniciar en modo producción con PM2 (recomendado)
npm install -g pm2
pm2 start npm --name "negocio360-api" -- start
pm2 save
pm2 startup
```

## 🔍 Verificación

### Script de verificación

```bash
./verify-apache.sh
```

### Verificación manual

```bash
# 1. Estado de Apache
sudo systemctl status apache2

# 2. Módulos habilitados
sudo apache2ctl -M | grep -E 'ssl|proxy|rewrite'

# 3. API corriendo
ss -tlnp | grep 2018

# 4. Test de conectividad
curl -I https://365smartnegocio.com
curl https://365smartnegocio.com/api/health
```

## 📊 Arquitectura

```
[Internet] 
    ↓
[Firewall/Router]
    ↓ puerto 80/443
[Apache (Proxy Reverso)]
    ↓ puerto 2018
[API Node.js (Negocio360)]
    ↓
[Supabase]
```

## 🔒 Seguridad

### Firewall (ufw)

```bash
# Habilitar firewall
sudo ufw enable

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Bloquear acceso directo a la API (opcional)
# Solo permitir localhost
sudo ufw deny 2018/tcp
```

### Headers de seguridad

Ya incluidos en la configuración de Apache:
- ✅ HSTS (HTTP Strict Transport Security)
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection
- ✅ Referrer-Policy

## 🔄 Renovación automática de SSL

Certbot configura automáticamente la renovación. Verifica:

```bash
# Test de renovación
sudo certbot renew --dry-run

# Ver cron job
sudo systemctl status certbot.timer

# Forzar renovación (si es necesario)
sudo certbot renew --force-renewal
```

## 📝 Logs

### Logs de Apache

```bash
# Errores SSL
sudo tail -f /var/log/apache2/365smartnegocio-ssl-error.log

# Accesos
sudo tail -f /var/log/apache2/365smartnegocio-ssl-access.log

# Errores generales de Apache
sudo tail -f /var/log/apache2/error.log
```

### Logs de la API

```bash
# Con PM2
pm2 logs negocio360-api

# Sin PM2 (modo directo)
# Ver en la terminal donde se ejecutó
```

## 🚦 Comandos útiles

### Apache

```bash
# Recargar configuración
sudo systemctl reload apache2

# Reiniciar Apache
sudo systemctl restart apache2

# Ver estado
sudo systemctl status apache2

# Verificar sintaxis
sudo apache2ctl configtest

# Ver configuración activa
sudo apache2ctl -S
```

### Certbot

```bash
# Ver certificados
sudo certbot certificates

# Renovar
sudo certbot renew

# Revocar
sudo certbot revoke --cert-name 365smartnegocio.com
```

### PM2 (API)

```bash
# Estado
pm2 status

# Logs
pm2 logs negocio360-api

# Reiniciar
pm2 restart negocio360-api

# Detener
pm2 stop negocio360-api

# Eliminar
pm2 delete negocio360-api
```

## ⚠️ Problemas comunes

### 1. Error 502 Bad Gateway

**Causa**: La API no está corriendo en puerto 2018

**Solución**:
```bash
cd /var/www/server/Negocio360
pm2 start npm --name "negocio360-api" -- start
```

### 2. Error 503 Service Unavailable

**Causa**: Apache no puede conectar al backend

**Solución**:
```bash
# Verificar que la API esté escuchando
ss -tlnp | grep 2018

# Verificar firewall local
sudo ufw status
```

### 3. Certificado SSL no válido

**Causa**: El dominio no apunta al servidor

**Solución**:
```bash
# Verificar DNS
dig 365smartnegocio.com +short

# Debe mostrar la IP de tu servidor
```

### 4. Redireccionamiento infinito

**Causa**: Configuración incorrecta de proxy headers

**Solución**: Ya está configurado en el archivo .conf con:
```apache
RequestHeader set X-Forwarded-Proto "https"
```

## 🌐 URLs finales

Después de la configuración:

- 🏠 **Página principal**: https://365smartnegocio.com
- 📡 **API Health**: https://365smartnegocio.com/api/health
- 🔐 **Login**: https://365smartnegocio.com/api/auth/login
- 📦 **Datos**: https://365smartnegocio.com/api/datos/:tabla

## 📚 Recursos

- [Apache Proxy](https://httpd.apache.org/docs/2.4/mod/mod_proxy.html)
- [Let's Encrypt](https://letsencrypt.org/)
- [Certbot](https://certbot.eff.org/)
- [PM2 Process Manager](https://pm2.keymetrics.io/)
- [Apache SSL/TLS](https://httpd.apache.org/docs/2.4/ssl/)

## 🔧 Configuración adicional

### Límites de tasa (Rate Limiting)

Instala mod_evasive:

```bash
sudo apt install libapache2-mod-evasive
sudo a2enmod evasive
```

### Caché de Apache

```bash
sudo a2enmod cache
sudo a2enmod cache_disk
sudo systemctl restart apache2
```

### Compresión gzip

```bash
sudo a2enmod deflate
sudo systemctl restart apache2
```
