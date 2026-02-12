#!/usr/bin/env node

/**
 * Script para ejecutar el schema.sql en Supabase
 * 
 * Hay dos formas de usarlo:
 * 1. Con psql: node create-schema.js --psql [password]
 * 2. Manualmente: el script mostrará instrucciones
 */

import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const args = process.argv.slice(2);
const usePsql = args.includes('--psql');
const password = usePsql ? args[args.indexOf('--psql') + 1] : null;

// Extraer el project ref de la URL
const projectRef = process.env.SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

function mostrarInstrucciones() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     📋 INSTRUCCIONES PARA EJECUTAR EL SCHEMA EN SUPABASE      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  console.log('🔧 Opción 1: Usando psql (recomendado)');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard');
  console.log(`2. Abre tu proyecto (ref: ${projectRef})`);
  console.log('3. Ve a Settings → Database → Connection string');
  console.log('4. Copia la contraseña de la base de datos');
  console.log('5. Ejecuta:\n');
  console.log('   node create-schema.js --psql [TU_PASSWORD]\n');
  
  console.log('🌐 Opción 2: Usando el SQL Editor (más simple)');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('1. Ve a: https://supabase.com/dashboard/project/' + projectRef + '/sql');
  console.log('2. Haz clic en "New query"');
  console.log('3. Copia todo el contenido del archivo: database/schema.sql');
  console.log('4. Pégalo en el editor');
  console.log('5. Haz clic en "Run" (o presiona Ctrl+Enter)\n');
  
  console.log('📁 Ubicación del archivo schema.sql:');
  console.log(`   ${join(__dirname, 'database', 'schema.sql')}\n`);
  
  console.log('💡 Tip: La opción 2 es más simple si es tu primera vez.\n');
}

async function ejecutarConPsql(password) {
  if (!password) {
    console.error('❌ Error: Debes proporcionar la contraseña de la base de datos');
    console.log('Uso: node create-schema.js --psql [PASSWORD]\n');
    mostrarInstrucciones();
    process.exit(1);
  }

  const schemaPath = join(__dirname, 'database', 'schema.sql');
  const connectionString = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`;

  console.log('🚀 Ejecutando schema en Supabase...\n');
  console.log('📋 Archivo:', schemaPath);
  console.log('🔗 Proyecto:', projectRef);
  console.log('');

  const psql = spawn('psql', [connectionString, '-f', schemaPath], {
    stdio: 'inherit'
  });

  psql.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ ¡Schema ejecutado exitosamente!');
      console.log('🎉 Las tablas están listas para usar');
      console.log('\n📊 Puedes verificar las tablas en:');
      console.log(`   https://supabase.com/dashboard/project/${projectRef}/editor\n`);
    } else {
      console.log('\n⚠️  Hubo algunos errores durante la ejecución');
      console.log('💡 Revisa los mensajes arriba o intenta usar el SQL Editor manualmente\n');
      process.exit(code);
    }
  });

  psql.on('error', (err) => {
    console.error('❌ Error al ejecutar psql:', err.message);
    console.log('\n💡 Asegúrate de que postgresql-client esté instalado:');
    console.log('   apt-get install postgresql-client\n');
    process.exit(1);
  });
}

// Script principal
if (!projectRef) {
  console.error('❌ Error: No se pudo encontrar SUPABASE_URL en el archivo .env');
  process.exit(1);
}

if (usePsql) {
  ejecutarConPsql(password);
} else {
  mostrarInstrucciones();
}
