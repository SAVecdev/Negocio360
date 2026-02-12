#!/bin/bash

# Script de diagnóstico SSL/HTTPS para 365smartnegocio.com

DOMAIN="365smartnegocio.com"

echo "=========================================="
echo "  🔍 Diagnóstico SSL/HTTPS"
echo "  $DOMAIN"
echo "=========================================="
echo ""

# 1. Verificar que el dominio resuelva
echo "1️⃣ Resolución DNS:"
IP=$(dig +short $DOMAIN | head -1)
echo "   IP: $IP"
SERVER_IP=$(curl -4 -s ifconfig.me)
if [ "$IP" = "$SERVER_IP" ]; then
    echo "   ✅ Dominio apunta a este servidor"
else
    echo "   ⚠️  Dominio apunta a: $IP"
    echo "   ⚠️  IP del servidor: $SERVER_IP"
fi
echo ""

# 2. Verificar certificado
echo "2️⃣ Certificado SSL:"
CERT_INFO=$(echo | openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -dates -issuer -subject 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "$CERT_INFO" | while read line; do
        echo "   $line"
    done
    echo "   ✅ Certificado válido"
else
    echo "   ❌ No se pudo verificar el certificado"
fi
echo ""

# 3. Verificar código de verificación
echo "3️⃣ Validación del certificado:"
VERIFY_CODE=$(echo "Q" | openssl s_client -connect $DOMAIN:443 -showcerts 2>/dev/null | grep "Verify return code" | cut -d: -f2)
echo "   Código de verificación:$VERIFY_CODE"
if echo "$VERIFY_CODE" | grep -q "0 (ok)"; then
    echo "   ✅ Certificado confiable"
else
    echo "   ❌ Problema con la cadena de certificados"
fi
echo ""

# 4. Verificar protocolo TLS
echo "4️⃣ Protocolo TLS:"
TLS_VERSION=$(echo | openssl s_client -connect $DOMAIN:443 2>/dev/null | grep "Protocol" | cut -d: -f2)
echo "   Versión:$TLS_VERSION"
if echo "$TLS_VERSION" | grep -qE "TLSv1\.[23]"; then
    echo "   ✅ Usando TLS moderno"
else
    echo "   ⚠️  TLS antiguo o no detectado"
fi
echo ""

# 5. Verificar headers de seguridad
echo "5️⃣ Headers de seguridad:"
HEADERS=$(curl -sI https://$DOMAIN 2>/dev/null)

check_header() {
    local header=$1
    if echo "$HEADERS" | grep -qi "$header"; then
        echo "   ✅ $header"
    else
        echo "   ❌ $header (no encontrado)"
    fi
}

check_header "Strict-Transport-Security"
check_header "X-Content-Type-Options"
check_header "X-Frame-Options"
echo ""

# 6. Test de conectividad
echo "6️⃣ Test de conectividad:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN)
echo "   Código HTTP: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Sitio accesible"
else
    echo "   ⚠️  Código inesperado"
fi
echo ""

# 7. Test de redirección HTTP -> HTTPS
echo "7️⃣ Redirección HTTP -> HTTPS:"
REDIRECT=$(curl -sI http://$DOMAIN | grep -i "location:")
if echo "$REDIRECT" | grep -q "https://"; then
    echo "   ✅ Redirección a HTTPS activa"
    echo "   $REDIRECT"
else
    echo "   ❌ Sin redirección automática"
fi
echo ""

# 8. Test SSL Labs (simulado)
echo "8️⃣ Análisis de seguridad:"
CIPHER=$(echo | openssl s_client -connect $DOMAIN:443 2>/dev/null | grep "Cipher" | cut -d: -f2)
echo "   Cipher:$CIPHER"
if echo "$CIPHER" | grep -qE "ECDHE|AES"; then
    echo "   ✅ Cifrado fuerte"
else
    echo "   ⚠️  Verificar cifrado"
fi
echo ""

# 9. Verificar cadena de certificados
echo "9️⃣ Cadena de certificados:"
CHAIN_LEN=$(echo | openssl s_client -connect $DOMAIN:443 -showcerts 2>/dev/null | grep -c "BEGIN CERTIFICATE")
echo "   Certificados en la cadena: $CHAIN_LEN"
if [ "$CHAIN_LEN" -ge 2 ]; then
    echo "   ✅ Cadena completa"
else
    echo "   ⚠️  Posible problema con la cadena"
fi
echo ""

# 10. Test desde navegador común
echo "🔟 Prueba final:"
RESPONSE=$(curl -s https://$DOMAIN/api/health | jq -r '.success' 2>/dev/null)
if [ "$RESPONSE" = "true" ]; then
    echo "   ✅ API respondiendo correctamente"
else
    echo "   ❌ Problema con la API"
fi
echo ""

echo "=========================================="
echo "  📋 Resumen"
echo "=========================================="
echo ""
echo "🌐 Accede a tu sitio:"
echo "   https://$DOMAIN"
echo ""
echo "🔍 Verifica SSL online:"
echo "   https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo ""
echo "🛠️  Si ves 'No seguro' en el navegador:"
echo "   1. Limpia caché: Ctrl+Shift+Del"
echo "   2. Abre en modo incógnito"
echo "   3. Verifica la barra de dirección (debe mostrar 🔒)"
echo "   4. Haz clic en el candado para ver detalles"
echo ""
echo "📝 Posibles causas de 'No seguro':"
echo "   • Contenido mixto (HTTP en página HTTPS)"
echo "   • Caché del navegador"
echo "   • Extensiones del navegador bloqueando"
echo "   • Antivirus/Firewall interceptando SSL"
echo ""
echo "=========================================="
