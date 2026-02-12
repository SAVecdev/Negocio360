#!/bin/bash

# Script para generar certificados SSL auto-firmados para desarrollo

echo "=========================================="
echo "Generando certificados SSL auto-firmados"
echo "=========================================="

# Crear directorio ssl si no existe
mkdir -p ssl

# Generar clave privada y certificado
openssl req -x509 \
  -nodes \
  -days 365 \
  -newkey rsa:2048 \
  -keyout ssl/server.key \
  -out ssl/server.cert \
  -subj "/C=AR/ST=BuenosAires/L=CABA/O=Negocio360/CN=localhost"

echo ""
echo "✅ Certificados generados exitosamente:"
echo "   🔑 Clave privada: ssl/server.key"
echo "   📄 Certificado: ssl/server.cert"
echo ""
echo "⚠️  ADVERTENCIA: Estos certificados son AUTO-FIRMADOS"
echo "   - Solo para desarrollo/testing"
echo "   - Los navegadores mostrarán advertencia de seguridad"
echo "   - Para producción usa Let's Encrypt (ver SSL_SETUP.md)"
echo ""
echo "🚀 Ahora puedes iniciar el servidor con HTTPS:"
echo "   npm run dev"
