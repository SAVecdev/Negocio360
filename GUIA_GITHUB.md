# 📤 Conectar Negocio360 a GitHub

Tu proyecto ya está listo con Git. Aquí tienes los pasos para subirlo a GitHub:

## ✅ Estado Actual

```bash
✓ Repositorio Git inicializado
✓ Rama principal: main
✓ Commit inicial creado (45 archivos)
✓ .gitignore configurado
```

---

## 🚀 Opción 1: GitHub CLI (Recomendado - Más Rápido)

### Instalar GitHub CLI

```bash
# Instalar GitHub CLI en Debian/Ubuntu
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

### Autenticar y Subir

```bash
# Autenticar con GitHub
gh auth login

# Crear repositorio y hacer push en un solo comando
gh repo create Negocio360 --public --source=. --remote=origin --push

# O si prefieres repositorio privado
gh repo create Negocio360 --private --source=. --remote=origin --push
```

---

## 🔧 Opción 2: Configuración Manual

### 1. Crear Repositorio en GitHub

1. Ve a: https://github.com/new
2. Nombre del repositorio: **Negocio360**
3. Descripción: `API REST completa para gestión de negocios con Node.js, Express y Supabase`
4. Elige **Público** o **Privado**
5. **NO** inicialices con README, .gitignore o license (ya los tienes)
6. Click en **"Create repository"**

### 2. Conectar tu Repositorio Local

Copia y ejecuta los comandos que GitHub te muestra (algo como):

```bash
cd /var/www/server/Negocio360

# Agregar el repositorio remoto
git remote add origin https://github.com/TU-USUARIO/Negocio360.git

# O si usas SSH (recomendado)
git remote add origin git@github.com:TU-USUARIO/Negocio360.git

# Hacer push del commit inicial
git push -u origin main
```

---

## 🔑 Configurar SSH (Si usas la opción SSH)

### 1. Generar clave SSH (si no tienes una)

```bash
ssh-keygen -t ed25519 -C "soporte@365smartnegocio.com"
# Presiona Enter para aceptar la ubicación por defecto
# Opcionalmente agrega una contraseña
```

### 2. Copiar la clave pública

```bash
cat ~/.ssh/id_ed25519.pub
```

### 3. Agregar a GitHub

1. Ve a: https://github.com/settings/keys
2. Click en **"New SSH key"**
3. Título: `Servidor Negocio360`
4. Pega la clave pública
5. Click en **"Add SSH key"**

### 4. Probar la conexión

```bash
ssh -T git@github.com
# Deberías ver: "Hi TU-USUARIO! You've successfully authenticated..."
```

---

## 📝 Workflow de Git Básico

Después de subir tu proyecto, usa estos comandos para actualizaciones:

```bash
# Ver estado de cambios
git status

# Agregar archivos modificados
git add .

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir a GitHub
git push origin main

# Ver historial
git log --oneline

# Crear una nueva rama
git checkout -b feature/nueva-funcionalidad

# Cambiar de rama
git checkout main

# Fusionar rama
git merge feature/nueva-funcionalidad
```

---

## ⚠️ Archivos Excluidos (por seguridad)

Estos archivos NO se subirán a GitHub (definidos en .gitignore):

- ✅ `.env` - Variables de entorno con credenciales
- ✅ `node_modules/` - Dependencias (se instalan con npm)
- ✅ `uploads/` - Imágenes subidas por usuarios
- ✅ `ssl/*.key` - Claves privadas SSL
- ✅ `*.log` - Archivos de logs

---

## 🎨 Personalizar el Repositorio

### Agregar Topics en GitHub

Ve a tu repositorio y agrega estos topics para mejor visibilidad:

```
nodejs, express, supabase, api, rest-api, pos, inventory-management, 
business-management, webp, image-compression, sales-management
```

### Badges Adicionales

Agrega al README.md:

```markdown
[![GitHub](https://img.shields.io/github/license/TU-USUARIO/Negocio360)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![GitHub stars](https://img.shields.io/github/stars/TU-USUARIO/Negocio360?style=social)](https://github.com/TU-USUARIO/Negocio360/stargazers)
```

---

## 🔒 Proteger Rama Principal

Después de crear el repositorio en GitHub:

1. Ve a: **Settings → Branches**
2. Click en **"Add rule"**
3. Branch name pattern: `main`
4. Activa:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging

---

## 🤝 Colaborar

Para agregar colaboradores:

1. Ve a: **Settings → Collaborators**
2. Click en **"Add people"**
3. Ingresa el usuario de GitHub
4. Selecciona el nivel de acceso

---

## 📦 Crear Releases

Cuando tengas una versión estable:

```bash
# Crear tag
git tag -a v1.0.0 -m "Release v1.0.0 - Primera versión estable"

# Subir tag
git push origin v1.0.0
```

Luego ve a GitHub: **Releases → Create a new release**

---

## ✨ Próximos Pasos

1. Sube el proyecto a GitHub usando cualquiera de las opciones
2. Agrega un archivo `LICENSE` si quieres especificar la licencia
3. Configura GitHub Actions para CI/CD (opcional)
4. Crea un proyecto en GitHub Projects para gestionar tareas

---

## 🆘 Solución de Problemas

### Error: "Permission denied (publickey)"
- Configura SSH correctamente o usa HTTPS

### Error: "Repository not found"
- Verifica que el nombre del repositorio sea correcto
- Asegúrate de tener permisos

### Error: "Failed to push some refs"
- Primero haz pull: `git pull origin main --rebase`

---

**¿Necesitas ayuda?** Ejecuta cualquiera de estos comandos y déjame saber si encuentras algún problema.
