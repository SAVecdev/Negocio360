import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/compras
 * Obtener todas las compras
 */
router.get('/', async (req, res, next) => {
  try {
    const { 
      estado, 
      proveedor_id,
      fecha_desde,
      fecha_hasta,
      limit = 50, 
      offset = 0,
      order = 'fecha.desc'
    } = req.query;

    let query = supabase
      .from('compras')
      .select(`
        *,
        proveedores (
          id,
          codigo,
          nombre,
          razon_social,
          email
        )
      `, { count: 'exact' });

    if (estado) {
      query = query.eq('estado', estado);
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
 * GET /api/compras/:id
 * Obtener una compra específica con detalles
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: compra, error: compraError } = await supabase
      .from('compras')
      .select(`
        *,
        proveedores (
          id,
          codigo,
          nombre,
          razon_social,
          email,
          telefono
        )
      `)
      .eq('id', id)
      .single();

    if (compraError) {
      return res.status(404).json({
        success: false,
        error: { message: 'Compra no encontrada' }
      });
    }

    const { data: detalles, error: detallesError } = await supabase
      .from('detalle_compras')
      .select(`
        *,
        productos (
          id,
          codigo,
          nombre,
          descripcion
        )
      `)
      .eq('compra_id', id);

    if (detallesError) throw detallesError;

    res.json({
      success: true,
      data: {
        ...compra,
        detalles: detalles || []
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/compras
 * Crear una nueva compra con sus detalles
 */
router.post('/', async (req, res, next) => {
  try {
    const { detalles, ...compraData } = req.body;

    if (!detalles || detalles.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'La compra debe tener al menos un producto' }
      });
    }

    // Convertir campos numéricos
    if (compraData.subtotal) compraData.subtotal = parseFloat(compraData.subtotal);
    if (compraData.descuento) compraData.descuento = parseFloat(compraData.descuento);
    if (compraData.impuesto) compraData.impuesto = parseFloat(compraData.impuesto);
    if (compraData.total) compraData.total = parseFloat(compraData.total);
    if (compraData.pagado) compraData.pagado = parseFloat(compraData.pagado);
    if (compraData.saldo) compraData.saldo = parseFloat(compraData.saldo);
    if (compraData.proveedor_id) compraData.proveedor_id = parseInt(compraData.proveedor_id);

    // Crear compra
    const { data: compra, error: compraError } = await supabase
      .from('compras')
      .insert(compraData)
      .select()
      .single();

    if (compraError) throw compraError;

    // Preparar detalles
    const detallesConCompraId = detalles.map(detalle => ({
      compra_id: compra.id,
      producto_id: parseInt(detalle.producto_id),
      cantidad: parseFloat(detalle.cantidad),
      precio_unitario: parseFloat(detalle.precio_unitario),
      descuento: parseFloat(detalle.descuento || 0),
      impuesto: parseFloat(detalle.impuesto || 0),
      subtotal: parseFloat(detalle.subtotal),
      total: parseFloat(detalle.total)
    }));

    // Insertar detalles
    const { data: detallesInsertados, error: detallesError } = await supabase
      .from('detalle_compras')
      .insert(detallesConCompraId)
      .select();

    if (detallesError) {
      await supabase.from('compras').delete().eq('id', compra.id);
      throw detallesError;
    }

    // Actualizar stock de productos (si la compra está recibida)
    if (compra.estado === 'recibida') {
      for (const detalle of detallesConCompraId) {
        const { data: producto } = await supabase
          .from('productos')
          .select('stock')
          .eq('id', detalle.producto_id)
          .single();

        if (producto) {
          const nuevoStock = producto.stock + detalle.cantidad;
          await supabase
            .from('productos')
            .update({ stock: nuevoStock })
            .eq('id', detalle.producto_id);

          // Registrar movimiento
          await supabase
            .from('movimientos_inventario')
            .insert({
              producto_id: detalle.producto_id,
              tipo: 'entrada',
              cantidad: detalle.cantidad,
              stock_anterior: producto.stock,
              stock_nuevo: nuevoStock,
              motivo: 'Compra',
              referencia_tipo: 'compra',
              referencia_id: compra.id
            });
        }
      }
    }

    res.status(201).json({
      success: true,
      data: {
        ...compra,
        detalles: detallesInsertados
      },
      message: 'Compra creada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/compras/:id
 * Actualizar una compra
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const datos = { ...req.body };

    if (datos.subtotal) datos.subtotal = parseFloat(datos.subtotal);
    if (datos.descuento) datos.descuento = parseFloat(datos.descuento);
    if (datos.impuesto) datos.impuesto = parseFloat(datos.impuesto);
    if (datos.total) datos.total = parseFloat(datos.total);
    if (datos.pagado) datos.pagado = parseFloat(datos.pagado);
    if (datos.saldo) datos.saldo = parseFloat(datos.saldo);

    const { data, error } = await supabase
      .from('compras')
      .update(datos)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Compra no encontrada' }
      });
    }

    res.json({
      success: true,
      data: data[0],
      message: 'Compra actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/compras/:id
 * Eliminar una compra
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('compras')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Compra eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
