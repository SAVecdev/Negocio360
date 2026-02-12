import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/clientes
 * Obtener todos los clientes
 */
router.get('/', async (req, res, next) => {
  try {
    const { 
      activo, 
      tipo,
      buscar,
      limit = 50, 
      offset = 0,
      order = 'created_at.desc'
    } = req.query;

    let query = supabase.from('clientes').select('*', { count: 'exact' });

    // Aplicar filtros
    if (activo !== undefined) {
      query = query.eq('activo', activo === 'true');
    }
    
    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    // Búsqueda por texto
    if (buscar) {
      query = query.or(`nombre.ilike.%${buscar}%,apellido.ilike.%${buscar}%,email.ilike.%${buscar}%,documento_numero.ilike.%${buscar}%,codigo.ilike.%${buscar}%`);
    }

    // Paginación y ordenamiento
    query = query
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
      .order(...order.split('.'));

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: count
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/clientes/:id
 * Obtener un cliente específico
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: { message: 'Cliente no encontrado' }
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/clientes/:id/ventas
 * Obtener ventas de un cliente
 */
router.get('/:id/ventas', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .eq('cliente_id', id)
      .order('fecha', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) throw error;

    res.json({
      success: true,
      data,
      count: data?.length || 0
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/clientes/:id/saldo
 * Obtener saldo actual del cliente
 */
router.get('/:id/saldo', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('clientes')
      .select('saldo, limite_credito')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: {
        saldo: data.saldo || 0,
        limite_credito: data.limite_credito || 0,
        disponible: (data.limite_credito || 0) - (data.saldo || 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/clientes
 * Crear un nuevo cliente
 */
router.post('/', async (req, res, next) => {
  try {
    const datos = { ...req.body };

    // Convertir campos numéricos
    if (datos.limite_credito) datos.limite_credito = parseFloat(datos.limite_credito);
    if (datos.saldo) datos.saldo = parseFloat(datos.saldo);

    const { data, error } = await supabase
      .from('clientes')
      .insert(datos)
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0],
      message: 'Cliente creado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/clientes/:id
 * Actualizar un cliente
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const datos = { ...req.body };

    // Convertir campos numéricos
    if (datos.limite_credito) datos.limite_credito = parseFloat(datos.limite_credito);
    if (datos.saldo) datos.saldo = parseFloat(datos.saldo);

    const { data, error } = await supabase
      .from('clientes')
      .update(datos)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Cliente no encontrado' }
      });
    }

    res.json({
      success: true,
      data: data[0],
      message: 'Cliente actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/clientes/:id
 * Eliminar un cliente
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
