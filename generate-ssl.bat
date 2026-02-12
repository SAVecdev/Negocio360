@echo off
REM Script para generar certificados SSL auto-firmados en Windows

echo ==========================================
echo Generando certificados SSL auto-firmados
echo ==========================================

REM Crear directorio ssl si no existe
if not exist ssl mkdir ssl

REM Generar certificados con OpenSSL (debe estar instalado)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl\server.key -out ssl\server.cert -subj "/C=AR/ST=BuenosAires/L=CABA/O=Negocio360/CN=localhost"

echo.
echo Certificados generados exitosamente:
echo    Clave privada: ssl\server.key
echo    Certificado: ssl\server.cert
echo.
echo ADVERTENCIA: Estos certificados son AUTO-FIRMADOS
echo    - Solo para desarrollo/testing
echo    - Los navegadores mostraran advertencia de seguridad
echo    - Para produccion usa Let's Encrypt
echo.
echo Ahora puedes iniciar el servidor con HTTPS:
echo    npm run dev
pause
