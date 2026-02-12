#!/bin/bash

# Script rápido para verificar configuración de Apache y SSL

echo "=========================================="
echo "  🔍 Verificación Apache + SSL"
echo "=========================================="
echo ""

# 1. Estado de Apache
echo "1️⃣ Estado de Apache:"
systemctl status apache2 --no-pager | head -5
echo ""

# 2. Módulos habilitados
echo "2️⃣ Módulos críticos:"
for mod in ssl rewrite proxy proxy_http headers; do
    if apache2ctl -M 2>/dev/null | grep -q $mod; then
        echo "   ✅ $mod"
    else
        echo "   ❌ $mod (no habilitado)"
    fi
done
echo ""

# 3. Sitio habilitado
echo "3️⃣ Configuración del sitio:"
if [ -f /etc/apache2/sites-enabled/365smartnegocio.conf ]; then
    echo "   ✅ Sitio habilitado"
else
    echo "   ❌ Sitio NO habilitado"
fi
echo ""

# 4. Puertos escuchando
echo "4️⃣ Puertos de Apache:"
ss -tlnp | grep apache2 | grep -E ':(80|443)' || echo "   ⚠️  Apache no está escuchando en 80/443"
echo ""

# 5. API backend
echo "5️⃣ API Backend (Node.js):"
if ss -tlnp | grep -q ':2018'; then
    echo "   ✅ API corriendo en puerto 2018"
else
    echo "   ❌ API NO está corriendo (puerto 2018)"
    echo "      Inicia con: cd /var/www/server/Negocio360 && npm start"
fi
echo ""

# 6. Certificados SSL
echo "6️⃣ Certificados SSL:"
if command -v certbot &> /dev/null; then
    certbot certificates 2>/dev/null | grep -A 3 "365smartnegocio.com" || echo "   ⚠️  No hay certificados para 365smartnegocio.com"
else
    echo "   ⚠️  Certbot no instalado"
fi
echo ""

# 7. Test de conectividad
echo "7️⃣ Test de conectividad:"
if command -v curl &> /dev/null; then
    echo "   Probando HTTPS..."
    response=$(curl -s -o /dev/null -w "%{http_code}" https://365smartnegocio.com 2>/dev/null)
    if [ "$response" = "200" ] || [ "$response" = "301" ] || [ "$response" = "302" ]; then
        echo "   ✅ HTTPS responde (código: $response)"
    else
        echo "   ⚠️  HTTPS no responde o hay error (código: $response)"
    fi
else
    echo "   ⚠️  curl no disponible"
fi

echo ""
echo "=========================================="
echo "  📋 Comandos útiles"
echo "=========================================="
echo ""
echo "Ver logs de Apache:"
echo "   tail -f /var/log/apache2/365smartnegocio-ssl-error.log"
echo ""
echo "Recargar Apache:"
echo "   sudo systemctl reload apache2"
echo ""
echo "Verificar configuración:"
echo "   sudo apache2ctl configtest"
echo ""
echo "Renovar SSL:"
echo "   sudo certbot renew"
echo ""
