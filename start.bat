@echo off
REM Script para iniciar la API Negocio360 en Windows

echo ==========================================
echo Iniciando API Negocio360
echo ==========================================

REM Verificar si existe el archivo .env
if not exist .env (
    echo Error: Archivo .env no encontrado
    echo Copiando .env.example a .env...
    copy .env.example .env
    echo Por favor, configura tus credenciales de Supabase en .env
    pause
    exit /b 1
)

REM Verificar si node_modules existe
if not exist node_modules (
    echo Instalando dependencias...
    call npm install
)

REM Iniciar el servidor
echo Iniciando servidor...
call npm run dev
