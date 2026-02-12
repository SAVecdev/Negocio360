import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Registro de usuario
router.post('/registro', async (req, res, next) => {
  try {
    const { email, password, datos_usuario } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email y contraseña son requeridos' }
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: datos_usuario
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }

    res.status(201).json({
      success: true,
      data: {
        user: data.user,
        session: data.session
      },
      message: 'Usuario registrado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email y contraseña son requeridos' }
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: { message: error.message }
      });
    }

    res.json({
      success: true,
      data: {
        user: data.user,
        session: data.session,
        access_token: data.session.access_token
      },
      message: 'Login exitoso'
    });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', async (req, res, next) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
