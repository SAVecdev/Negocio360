#!/bin/bash

# Script para iniciar la API Negocio360

echo "=========================================="
echo "Iniciando API Negocio360"
echo "=========================================="

# Verificar si existe el archivo .env
if [ ! -f .env ]; then
    echo "❌ Error: Archivo .env no encontrado"
    echo "📋 Copiando .env.example a .env..."
    cp .env.example .env
    echo "⚠️  Por favor, configura tus credenciales de Supabase en .env"
    exit 1
fi

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Iniciar el servidor
echo "🚀 Iniciando servidor..."
npm run dev
