import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Cliente con clave anónima (para operaciones públicas)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Cliente con service role (para operaciones administrativas)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Verificar conexión
export async function verificarConexion() {
  try {
    const { data, error } = await supabase.from('_health_check').select('*').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = tabla no encontrada (normal si no existe)
      console.log('⚠️  Advertencia Supabase:', error.message);
    } else {
      console.log('✅ Conexión a Supabase establecida correctamente');
    }
  } catch (error) {
    console.error('❌ Error al conectar con Supabase:', error.message);
  }
}
