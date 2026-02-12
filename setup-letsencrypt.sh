#!/bin/bash

# Script para configurar HTTPS con Let's Encrypt (Certbot)
# Requiere: dominio público y puerto 80/443 accesibles

echo "=========================================="
echo "Configuración de Let's Encrypt (Certbot)"
echo "=========================================="

# Verificar si se proporcionó un dominio
if [ -z "$1" ]; then
  echo "❌ Error: Debes proporcionar un dominio"
  echo ""
  echo "Uso: ./setup-letsencrypt.sh tu-dominio.com"
  echo ""
  exit 1
fi

DOMAIN=$1
EMAIL=${2:-"admin@$DOMAIN"}

echo "📋 Configuración:"
echo "   Dominio: $DOMAIN"
echo "   Email: $EMAIL"
echo ""

# Verificar si certbot está instalado
if ! command -v certbot &> /dev/null; then
  echo "📦 Instalando Certbot..."
  
  # Detectar sistema operativo
  if [ -f /etc/debian_version ]; then
    # Debian/Ubuntu
    sudo apt-get update
    sudo apt-get install -y certbot
  elif [ -f /etc/redhat-release ]; then
    # CentOS/RHEL
    sudo yum install -y certbot
  else
    echo "❌ Sistema operativo no soportado. Instala Certbot manualmente:"
    echo "   https://certbot.eff.org/"
    exit 1
  fi
fi

echo ""
echo "🔐 Generando certificados con Let's Encrypt..."
echo ""

# Generar certificados
sudo certbot certonly --standalone \
  -d $DOMAIN \
  --non-interactive \
  --agree-tos \
  --email $EMAIL \
  --http-01-port 80

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Certificados generados exitosamente"
  echo ""
  echo "📝 Actualiza tu archivo .env con:"
  echo "   ENABLE_HTTPS=true"
  echo "   SSL_CERT_PATH=/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
  echo "   SSL_KEY_PATH=/etc/letsencrypt/live/$DOMAIN/privkey.pem"
  echo ""
  echo "⚙️  Configurar renovación automática:"
  echo "   sudo certbot renew --dry-run"
  echo ""
  echo "🔄 Los certificados se renovarán automáticamente cada 90 días"
else
  echo ""
  echo "❌ Error al generar certificados"
  echo ""
  echo "Verifica:"
  echo "   1. El dominio apunta a este servidor"
  echo "   2. El puerto 80 está abierto"
  echo "   3. No hay otro servicio usando el puerto 80"
  exit 1
fi
