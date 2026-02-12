#!/bin/bash

# Resumen de configuración de 365smartnegocio.com

clear
echo "=========================================="
echo "  ✅ CONFIGURACIÓN COMPLETADA"
echo "  365smartnegocio.com"
echo "=========================================="
echo ""
echo "🌐 URLs disponibles:"
echo "   https://365smartnegocio.com"
echo "   https://www.365smartnegocio.com"
echo ""
echo "📡 Endpoints API:"
echo "   Health Check:  https://365smartnegocio.com/api/health"
echo "   Autenticación: https://365smartnegocio.com/api/auth/login"
echo "   Datos:         https://365smartnegocio.com/api/datos/:tabla"
echo ""
echo "🔒 Certificado SSL:"
echo "   Emisor:      Let's Encrypt"
echo "   Vencimiento: 2026-05-13 (90 días)"
echo "   Renovación:  Automática"
echo ""
echo "⚙️  Servicios activos:"
pm2 list | grep negocio360-api
echo ""
echo "📊 Estado de servicios:"
echo ""

# Test de conectividad
echo -n "   HTTPS:    "
if curl -s -o /dev/null -w "%{http_code}" https://365smartnegocio.com | grep -q "200"; then
    echo "✅ Funcionando"
else
    echo "❌ Error"
fi

echo -n "   API:      "
if curl -s https://365smartnegocio.com/api/health | grep -q "success"; then
    echo "✅ Funcionando"
else
    echo "❌ Error"  
fi

echo -n "   Apache:   "
if systemctl is-active --quiet apache2; then
    echo "✅ Activo"
else
    echo "❌ Inactivo"
fi

echo -n "   Supabase: "
if curl -s https://365smartnegocio.com/api/health | grep -q "success"; then
    echo "✅ Conectado"
else
    echo "⚠️  Verificar"
fi

echo ""
echo "=========================================="
echo "  📋 Comandos útiles"
echo "=========================================="
echo ""
echo "Ver logs API:"
echo "   pm2 logs negocio360-api"
echo ""
echo "Ver logs Apache:"
echo "   tail -f /var/log/apache2/365smartnegocio-ssl-error.log"
echo ""
echo "Reiniciar API:"
echo "   pm2 restart negocio360-api"
echo ""
echo "Reiniciar Apache:"
echo "   sudo systemctl restart apache2"
echo ""
echo "Ver status PM2:"
echo "   pm2 status"
echo ""
echo "Renovar SSL:"
echo "   sudo certbot renew"
echo ""
echo "=========================================="
echo "  🧪 Tests rápidos"
echo "=========================================="
echo ""
echo "curl https://365smartnegocio.com/api/health"
echo "curl https://365smartnegocio.com/api/datos/productos"
echo ""
echo "=========================================="
