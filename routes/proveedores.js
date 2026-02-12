import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/proveedores
 * Obtener todos los proveedores
 */
router.get('/', async (req, res, next) => {
  try {
    const { 
      activo, 
      buscar,
      limit = 50, 
      offset = 0,
      order = 'created_at.desc'
    } = req.query;

    let query = supabase.from('proveedores').select('*', { count: 'exact' });

    if (activo !== undefined) {
      query = query.eq('activo', activo === 'true');
    }

    if (buscar) {
      query = query.or(`nombre.ilike.%${buscar}%,razon_social.ilike.%${buscar}%,email.ilike.%${buscar}%,codigo.ilike.%${buscar}%`);
    }

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
 * GET /api/proveedores/:id
 * Obtener un proveedor específico
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: { message: 'Proveedor no encontrado' }
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
 * GET /api/proveedores/:id/compras
 * Obtener compras de un proveedor
 */
router.get('/:id/compras', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('compras')
      .select('*')
      .eq('proveedor_id', id)
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
 * POST /api/proveedores
 * Crear un nuevo proveedor
 */
router.post('/', async (req, res, next) => {
  try {
    const datos = { ...req.body };

    const { data, error } = await supabase
      .from('proveedores')
      .insert(datos)
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0],
      message: 'Proveedor creado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/proveedores/:id
 * Actualizar un proveedor
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const datos = { ...req.body };

    const { data, error } = await supabase
      .from('proveedores')
      .update(datos)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Proveedor no encontrado' }
      });
    }

    res.json({
      success: true,
      data: data[0],
      message: 'Proveedor actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/proveedores/:id
 * Eliminar un proveedor
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('proveedores')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Proveedor eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
