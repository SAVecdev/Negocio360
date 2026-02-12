import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Verificando conexión a Supabase...\n');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function verificarConexion() {
  try {
    console.log('📡 URL:', process.env.SUPABASE_URL);
    console.log('🔑 Clave configurada:', process.env.SUPABASE_ANON_KEY ? '✓' : '✗');
    console.log('');

    // Test 1: Verificar autenticación
    console.log('1️⃣ Test de autenticación...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.log('   ⚠️  No hay sesión activa (normal si no has iniciado sesión)');
    } else {
      console.log('   ✅ Autenticación funcionando');
    }

    // Test 2: Listar tablas (intentar consultar)
    console.log('\n2️⃣ Test de consulta básica...');
    const { data, error } = await supabase
      .from('productos')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('   ⚠️  Tabla "productos" no existe. Crea las tablas siguiendo SUPABASE_SETUP.md');
      } else if (error.code === '42501') {
        console.log('   ⚠️  Permiso denegado. Configura las políticas RLS o deshabilita RLS para desarrollo');
      } else {
        console.log('   ❌ Error:', error.message);
      }
    } else {
      console.log('   ✅ Consulta exitosa');
      console.log('   📊 Datos:', data);
    }

    // Test 3: Health check general
    console.log('\n3️⃣ Test de conectividad general...');
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY
      }
    });
    
    if (response.ok || response.status === 404) {
      console.log('   ✅ Conexión a Supabase exitosa');
    } else {
      console.log('   ❌ Error de conexión:', response.status);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ CONEXIÓN VERIFICADA');
    console.log('='.repeat(50));
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Inicia el servidor: npm run dev');
    console.log('   2. Prueba la API: http://localhost:' + (process.env.PORT || 3000));
    console.log('   3. Abre el demo: examples/demo.html');

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error.message);
    console.error('\n🔧 Verifica:');
    console.error('   1. Que el archivo .env existe (copia .env.example a .env)');
    console.error('   2. Que las credenciales son correctas');
    console.error('   3. Que tienes conexión a internet');
    process.exit(1);
  }
}

verificarConexion();
