import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/pagos
 * Obtener todos los pagos
 */
router.get('/', async (req, res, next) => {
  try {
    const { 
      tipo,
      metodo,
      fecha_desde,
      fecha_hasta,
      cliente_id,
      proveedor_id,
      limit = 50, 
      offset = 0,
      order = 'fecha.desc'
    } = req.query;

    let query = supabase
      .from('pagos')
      .select(`
        *,
        clientes (
          id,
          nombre,
          apellido
        ),
        proveedores (
          id,
          nombre
        )
      `, { count: 'exact' });

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    if (metodo) {
      query = query.eq('metodo', metodo);
    }

    if (cliente_id) {
      query = query.eq('cliente_id', cliente_id);
    }

    if (proveedor_id) {
      query = query.eq('proveedor_id', proveedor_id);
    }

    if (fecha_desde) {
      query = query.gte('fecha', fecha_desde);
    }

    if (fecha_hasta) {
      query = query.lte('fecha', fecha_hasta);
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
 * GET /api/pagos/estadisticas
 * Obtener estadísticas de pagos
 */
router.get('/estadisticas', async (req, res, next) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;

    let query = supabase.from('pagos').select('monto, tipo, fecha');

    if (fecha_desde) {
      query = query.gte('fecha', fecha_desde);
    }

    if (fecha_hasta) {
      query = query.lte('fecha', fecha_hasta);
    }

    const { data, error } = await query;

    if (error) throw error;

    const ingresos = data
      .filter(p => p.tipo === 'ingreso')
      .reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);

    const egresos = data
      .filter(p => p.tipo === 'egreso')
      .reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);

    res.json({
      success: true,
      data: {
        total_ingresos: ingresos.toFixed(2),
        total_egresos: egresos.toFixed(2),
        balance: (ingresos - egresos).toFixed(2),
        cantidad_pagos: data.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pagos/:id
 * Obtener un pago específico
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('pagos')
      .select(`
        *,
        clientes (
          id,
          nombre,
          apellido,
          email
        ),
        proveedores (
          id,
          nombre,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: { message: 'Pago no encontrado' }
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
 * POST /api/pagos
 * Registrar un nuevo pago
 */
router.post('/', async (req, res, next) => {
  try {
    const datos = { ...req.body };

    // Convertir campos numéricos
    if (datos.monto) datos.monto = parseFloat(datos.monto);
    if (datos.referencia_id) datos.referencia_id = parseInt(datos.referencia_id);
    if (datos.cliente_id) datos.cliente_id = parseInt(datos.cliente_id);
    if (datos.proveedor_id) datos.proveedor_id = parseInt(datos.proveedor_id);

    const { data, error } = await supabase
      .from('pagos')
      .insert(datos)
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0],
      message: 'Pago registrado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/pagos/:id
 * Actualizar un pago
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const datos = { ...req.body };

    if (datos.monto) datos.monto = parseFloat(datos.monto);

    const { data, error } = await supabase
      .from('pagos')
      .update(datos)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Pago no encontrado' }
      });
    }

    res.json({
      success: true,
      data: data[0],
      message: 'Pago actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/pagos/:id
 * Eliminar un pago
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('pagos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Pago eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
