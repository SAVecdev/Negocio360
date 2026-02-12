import { supabase } from '../config/supabase.js';

// Middleware para verificar autenticación
export const verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token no proporcionado' }
      });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token inválido o expirado' }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error en verificación de token:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error al verificar autenticación' }
    });
  }
};
