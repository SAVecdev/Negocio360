#!/bin/bash

# Script para configurar Apache con HTTPS para 365smartnegocio.com

echo "=========================================="
echo "  🌐 Configuración Apache + HTTPS"
echo "  Dominio: 365smartnegocio.com"
echo "=========================================="
echo ""

# Verificar si se ejecuta como root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Este script debe ejecutarse como root"
    echo "   Usa: sudo ./setup-apache-https.sh"
    exit 1
fi

DOMAIN="365smartnegocio.com"
EMAIL="admin@365smartnegocio.com"

echo "📋 Información:"
echo "   Dominio: $DOMAIN"
echo "   Email: $EMAIL"
echo "   Puerto API: 2018"
echo ""

# Paso 1: Habilitar módulos de Apache necesarios
echo "1️⃣ Habilitando módulos de Apache..."
a2enmod ssl
a2enmod rewrite
a2enmod proxy
a2enmod proxy_http
a2enmod proxy_wstunnel
a2enmod headers

echo ""

# Paso 2: Copiar configuración de Apache
echo "2️⃣ Creando configuración de Apache..."
cp /var/www/server/Negocio360/apache-config/365smartnegocio.conf /etc/apache2/sites-available/

echo ""

# Paso 3: Verificar configuración
echo "3️⃣ Verificando configuración de Apache..."
apache2ctl configtest

if [ $? -ne 0 ]; then
    echo "❌ Error en la configuración de Apache"
    exit 1
fi

echo ""

# Paso 4: Habilitar el sitio
echo "4️⃣ Habilitando sitio..."
a2ensite 365smartnegocio.conf

echo ""

# Paso 5: Recargar Apache
echo "5️⃣ Recargando Apache..."
systemctl reload apache2

echo ""

# Paso 6: Instalar Certbot si no está instalado
echo "6️⃣ Verificando Certbot..."
if ! command -v certbot &> /dev/null; then
    echo "   📦 Instalando Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-apache
else
    echo "   ✅ Certbot ya está instalado"
fi

echo ""

# Paso 7: Obtener certificado SSL
echo "7️⃣ Obteniendo certificado SSL de Let's Encrypt..."
echo "   ⚠️  Asegúrate de que el dominio apunte a este servidor"
echo ""

read -p "   ¿Continuar con la obtención del certificado SSL? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    certbot --apache -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Certificado SSL obtenido exitosamente"
        echo ""
        echo "🔄 Configurando renovación automática..."
        
        # Verificar renovación automática
        certbot renew --dry-run
        
        echo ""
        echo "=========================================="
        echo "  ✅ CONFIGURACIÓN COMPLETADA"
        echo "=========================================="
        echo ""
        echo "🌐 Tu sitio está disponible en:"
        echo "   https://365smartnegocio.com"
        echo "   https://www.365smartnegocio.com"
        echo ""
        echo "📡 La API responde en:"
        echo "   https://365smartnegocio.com/api"
        echo ""
        echo "🔐 Certificado SSL:"
        echo "   Emisor: Let's Encrypt"
        echo "   Renovación: Automática cada 90 días"
        echo ""
        echo "📋 Comandos útiles:"
        echo "   systemctl status apache2    - Ver estado"
        echo "   certbot renew              - Renovar certificado"
        echo "   certbot certificates       - Ver certificados"
        echo ""
    else
        echo ""
        echo "❌ Error al obtener el certificado SSL"
        echo ""
        echo "Verifica:"
        echo "   1. El dominio apunta a este servidor (DNS)"
        echo "   2. Los puertos 80 y 443 están abiertos en el firewall"
        echo "   3. No hay otros servicios usando esos puertos"
        echo ""
        exit 1
    fi
else
    echo ""
    echo "⚠️  Certificado SSL no configurado"
    echo ""
    echo "Para obtenerlo después, ejecuta:"
    echo "   sudo certbot --apache -d $DOMAIN -d www.$DOMAIN"
    echo ""
fi

echo "=========================================="
