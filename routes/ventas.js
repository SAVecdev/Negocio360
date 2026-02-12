import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/ventas
 * Obtener todas las ventas
 */
router.get('/', async (req, res, next) => {
  try {
    const { 
      estado, 
      tipo,
      cliente_id,
      fecha_desde,
      fecha_hasta,
      limit = 50, 
      offset = 0,
      order = 'fecha.desc'
    } = req.query;

    let query = supabase
      .from('ventas')
      .select(`
        *,
        clientes (
          id,
          codigo,
          nombre,
          apellido,
          email,
          telefono
        )
      `, { count: 'exact' });

    // Aplicar filtros
    if (estado) {
      query = query.eq('estado', estado);
    }
    
    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    if (cliente_id) {
      query = query.eq('cliente_id', cliente_id);
    }

    if (fecha_desde) {
      query = query.gte('fecha', fecha_desde);
    }

    if (fecha_hasta) {
      query = query.lte('fecha', fecha_hasta);
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
 * GET /api/ventas/resumen
 * Obtener resumen de ventas
 */
router.get('/resumen', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('ventas_resumen')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ventas/estadisticas
 * Obtener estadísticas de ventas
 */
router.get('/estadisticas', async (req, res, next) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;

    let query = supabase.from('ventas').select('total, estado, fecha');

    if (fecha_desde) {
      query = query.gte('fecha', fecha_desde);
    }

    if (fecha_hasta) {
      query = query.lte('fecha', fecha_hasta);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calcular estadísticas
    const totalVentas = data.length;
    const totalMonto = data.reduce((sum, v) => sum + parseFloat(v.total || 0), 0);
    const ventasPagadas = data.filter(v => v.estado === 'pagada').length;
    const ventasPendientes = data.filter(v => v.estado === 'pendiente').length;

    res.json({
      success: true,
      data: {
        total_ventas: totalVentas,
        total_monto: totalMonto.toFixed(2),
        ventas_pagadas: ventasPagadas,
        ventas_pendientes: ventasPendientes,
        promedio_venta: totalVentas > 0 ? (totalMonto / totalVentas).toFixed(2) : 0
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ventas/:id
 * Obtener una venta específica con detalles
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Obtener venta
    const { data: venta, error: ventaError } = await supabase
      .from('ventas')
      .select(`
        *,
        clientes (
          id,
          codigo,
          nombre,
          apellido,
          email,
          telefono,
          direccion
        )
      `)
      .eq('id', id)
      .single();

    if (ventaError) {
      return res.status(404).json({
        success: false,
        error: { message: 'Venta no encontrada' }
      });
    }

    // Obtener detalles de la venta
    const { data: detalles, error: detallesError } = await supabase
      .from('detalle_ventas')
      .select(`
        *,
        productos (
          id,
          codigo,
          nombre,
          descripcion,
          imagen_url
        )
      `)
      .eq('venta_id', id);

    if (detallesError) throw detallesError;

    res.json({
      success: true,
      data: {
        ...venta,
        detalles: detalles || []
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ventas
 * Crear una nueva venta con sus detalles
 */
router.post('/', async (req, res, next) => {
  try {
    const { detalles, ...ventaData } = req.body;

    if (!detalles || detalles.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'La venta debe tener al menos un producto' }
      });
    }

    // Convertir campos numéricos de la venta
    if (ventaData.subtotal) ventaData.subtotal = parseFloat(ventaData.subtotal);
    if (ventaData.descuento) ventaData.descuento = parseFloat(ventaData.descuento);
    if (ventaData.impuesto) ventaData.impuesto = parseFloat(ventaData.impuesto);
    if (ventaData.total) ventaData.total = parseFloat(ventaData.total);
    if (ventaData.pagado) ventaData.pagado = parseFloat(ventaData.pagado);
    if (ventaData.saldo) ventaData.saldo = parseFloat(ventaData.saldo);
    if (ventaData.cliente_id) ventaData.cliente_id = parseInt(ventaData.cliente_id);

    // Crear venta
    const { data: venta, error: ventaError } = await supabase
      .from('ventas')
      .insert(ventaData)
      .select()
      .single();

    if (ventaError) throw ventaError;

    // Preparar detalles con el ID de la venta
    const detallesConVentaId = detalles.map(detalle => ({
      venta_id: venta.id,
      producto_id: parseInt(detalle.producto_id),
      cantidad: parseFloat(detalle.cantidad),
      precio_unitario: parseFloat(detalle.precio_unitario),
      descuento: parseFloat(detalle.descuento || 0),
      impuesto: parseFloat(detalle.impuesto || 0),
      subtotal: parseFloat(detalle.subtotal),
      total: parseFloat(detalle.total),
      notas: detalle.notas || null
    }));

    // Insertar detalles
    const { data: detallesInsertados, error: detallesError } = await supabase
      .from('detalle_ventas')
      .insert(detallesConVentaId)
      .select();

    if (detallesError) {
      // Si hay error, eliminar la venta creada
      await supabase.from('ventas').delete().eq('id', venta.id);
      throw detallesError;
    }

    // Actualizar stock de productos
    for (const detalle of detallesConVentaId) {
      const { data: producto } = await supabase
        .from('productos')
        .select('stock')
        .eq('id', detalle.producto_id)
        .single();

      if (producto) {
        const nuevoStock = producto.stock - detalle.cantidad;
        await supabase
          .from('productos')
          .update({ stock: nuevoStock })
          .eq('id', detalle.producto_id);

        // Registrar movimiento de inventario
        await supabase
          .from('movimientos_inventario')
          .insert({
            producto_id: detalle.producto_id,
            tipo: 'salida',
            cantidad: detalle.cantidad,
            stock_anterior: producto.stock,
            stock_nuevo: nuevoStock,
            motivo: 'Venta',
            referencia_tipo: 'venta',
            referencia_id: venta.id
          });
      }
    }

    res.status(201).json({
      success: true,
      data: {
        ...venta,
        detalles: detallesInsertados
      },
      message: 'Venta creada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/ventas/:id
 * Actualizar una venta
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const datos = { ...req.body };

    // Convertir campos numéricos
    if (datos.subtotal) datos.subtotal = parseFloat(datos.subtotal);
    if (datos.descuento) datos.descuento = parseFloat(datos.descuento);
    if (datos.impuesto) datos.impuesto = parseFloat(datos.impuesto);
    if (datos.total) datos.total = parseFloat(datos.total);
    if (datos.pagado) datos.pagado = parseFloat(datos.pagado);
    if (datos.saldo) datos.saldo = parseFloat(datos.saldo);

    const { data, error } = await supabase
      .from('ventas')
      .update(datos)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Venta no encontrada' }
      });
    }

    res.json({
      success: true,
      data: data[0],
      message: 'Venta actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/ventas/:id
 * Anular una venta (cambiar estado a 'anulada')
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Cambiar estado a anulada en lugar de eliminar
    const { data, error } = await supabase
      .from('ventas')
      .update({ estado: 'anulada' })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      data: data[0],
      message: 'Venta anulada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
