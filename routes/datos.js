import express from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

// OBTENER datos de una tabla
// GET /api/datos/:tabla
router.get('/:tabla', async (req, res, next) => {
  try {
    const { tabla } = req.params;
    const { select = '*', limit, offset, order } = req.query;

    let query = supabase.from(tabla).select(select);

    // Aplicar filtros opcionales
    if (limit) query = query.limit(parseInt(limit));
    if (offset) query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit || 10) - 1);
    if (order) query = query.order(order);

    const { data, error, count } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }

    res.json({
      success: true,
      data,
      count: data?.length || 0
    });
  } catch (error) {
    next(error);
  }
});

// OBTENER un registro específico por ID
// GET /api/datos/:tabla/:id
router.get('/:tabla/:id', async (req, res, next) => {
  try {
    const { tabla, id } = req.params;

    const { data, error } = await supabase
      .from(tabla)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: { message: error.message }
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

// CREAR un nuevo registro
// POST /api/datos/:tabla
router.post('/:tabla', async (req, res, next) => {
  try {
    const { tabla } = req.params;
    const datos = req.body;

    const { data, error } = await supabase
      .from(tabla)
      .insert(datos)
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }

    res.status(201).json({
      success: true,
      data,
      message: 'Registro creado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ACTUALIZAR un registro
// PUT /api/datos/:tabla/:id
router.put('/:tabla/:id', async (req, res, next) => {
  try {
    const { tabla, id } = req.params;
    const datos = req.body;

    const { data, error } = await supabase
      .from(tabla)
      .update(datos)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }

    res.json({
      success: true,
      data,
      message: 'Registro actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ELIMINAR un registro
// DELETE /api/datos/:tabla/:id
router.delete('/:tabla/:id', async (req, res, next) => {
  try {
    const { tabla, id } = req.params;

    const { error } = await supabase
      .from(tabla)
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }

    res.json({
      success: true,
      message: 'Registro eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// BÚSQUEDA con filtros personalizados
// POST /api/datos/:tabla/buscar
router.post('/:tabla/buscar', async (req, res, next) => {
  try {
    const { tabla } = req.params;
    const { filtros, select = '*', limit, order } = req.body;

    let query = supabase.from(tabla).select(select);

    // Aplicar filtros dinámicos
    if (filtros && typeof filtros === 'object') {
      Object.entries(filtros).forEach(([campo, valor]) => {
        if (typeof valor === 'object' && valor.operador) {
          // Filtros avanzados: { campo: { operador: 'eq', valor: 'X' } }
          const { operador, valor: val } = valor;
          query = query[operador](campo, val);
        } else {
          // Filtro simple: { campo: valor }
          query = query.eq(campo, valor);
        }
      });
    }

    if (limit) query = query.limit(limit);
    if (order) query = query.order(order);

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }

    res.json({
      success: true,
      data,
      count: data?.length || 0
    });
  } catch (error) {
    next(error);
  }
});

export default router;
