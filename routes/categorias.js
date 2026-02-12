import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/categorias
 * Obtener todas las categorías
 */
router.get('/', async (req, res, next) => {
  try {
    const { activo, order = 'orden.asc' } = req.query;

    let query = supabase.from('categorias').select('*');

    if (activo !== undefined) {
      query = query.eq('activo', activo === 'true');
    }

    query = query.order(...order.split('.'));

    const { data, error } = await query;

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
 * GET /api/categorias/:id
 * Obtener una categoría específica
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: { message: 'Categoría no encontrada' }
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
 * GET /api/categorias/:id/productos
 * Obtener productos de una categoría
 */
router.get('/:id/productos', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activo, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('productos')
      .select('*')
      .eq('categoria_id', id);

    if (activo !== undefined) {
      query = query.eq('activo', activo === 'true');
    }

    query = query
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
      .order('nombre');

    const { data, error } = await query;

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
 * POST /api/categorias
 * Crear una nueva categoría
 */
router.post('/', async (req, res, next) => {
  try {
    const datos = { ...req.body };

    if (datos.orden) datos.orden = parseInt(datos.orden);

    const { data, error } = await supabase
      .from('categorias')
      .insert(datos)
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0],
      message: 'Categoría creada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/categorias/:id
 * Actualizar una categoría
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const datos = { ...req.body };

    if (datos.orden) datos.orden = parseInt(datos.orden);

    const { data, error } = await supabase
      .from('categorias')
      .update(datos)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Categoría no encontrada' }
      });
    }

    res.json({
      success: true,
      data: data[0],
      message: 'Categoría actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/categorias/:id
 * Eliminar una categoría
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
