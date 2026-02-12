#!/bin/bash

echo "=========================================="
echo "  🔒 Verificación de Servidor HTTPS"
echo "=========================================="
echo ""

# Verificar si el servidor está corriendo
if ss -tlnp | grep -q 2018; then
    echo "✅ Servidor activo en puerto 2018"
else
    echo "❌ Servidor no está corriendo"
    echo "   Inicia con: npm run dev"
    exit 1
fi

echo ""
echo "🔍 Probando conexión HTTPS..."
echo ""

# Test 1: Health check
echo "1️⃣ Health Check:"
response=$(curl -k -s https://localhost:2018/api/health)
if echo "$response" | grep -q "success"; then
    echo "   ✅ Respuesta exitosa"
    echo "   📄 $response"
else
    echo "   ❌ Error en la respuesta"
    echo "   $response"
fi

echo ""
echo "2️⃣ Endpoint raíz:"
curl -k -s https://localhost:2018/ | jq '.message' 2>/dev/null || curl -k -s https://localhost:2018/

echo ""
echo "=========================================="
echo "  📋 Información del servidor"
echo "=========================================="
echo ""
echo "🔗 URL HTTPS: https://localhost:2018"
echo "🔗 URL API:   https://localhost:2018/api"
echo ""
echo "📚 Endpoints disponibles:"
echo "   GET  https://localhost:2018/api/health"
echo "   POST https://localhost:2018/api/auth/login"
echo "   POST https://localhost:2018/api/auth/registro"
echo "   GET  https://localhost:2018/api/datos/:tabla"
echo ""
echo "🌐 Acceso desde navegador:"
echo "   1. Abre: https://localhost:2018"
echo "   2. Acepta el certificado auto-firmado"
echo "   3. Demo interactivo: file://$(pwd)/examples/demo.html"
echo ""
echo "✅ HTTPS configurado correctamente!"
echo "=========================================="
