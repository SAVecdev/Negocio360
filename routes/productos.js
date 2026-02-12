import express from 'express';
import { supabase } from '../config/supabase.js';
import { upload, processImage, deleteImage } from '../middleware/imageUpload.js';

const router = express.Router();

/**
 * GET /api/productos
 * Obtener todos los productos con filtros opcionales
 */
router.get('/', async (req, res, next) => {
  try {
    const { 
      activo, 
      categoria_id, 
      destacado,
      buscar,
      limit = 50, 
      offset = 0,
      order = 'created_at.desc'
    } = req.query;

    let query = supabase
      .from('productos')
      .select(`
        *,
        categorias (
          id,
          nombre,
          slug,
          icono,
          color
        )
      `);

    // Aplicar filtros
    if (activo !== undefined) {
      query = query.eq('activo', activo === 'true');
    }
    
    if (categoria_id) {
      query = query.eq('categoria_id', categoria_id);
    }
    
    if (destacado !== undefined) {
      query = query.eq('destacado', destacado === 'true');
    }

    // Búsqueda por texto
    if (buscar) {
      query = query.or(`nombre.ilike.%${buscar}%,descripcion.ilike.%${buscar}%,codigo.ilike.%${buscar}%`);
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
        total: data?.length || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/productos/stock-bajo
 * Obtener productos con stock bajo
 */
router.get('/stock-bajo', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('productos_stock_bajo')
      .select('*');

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
 * GET /api/productos/:id
 * Obtener un producto específico
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categorias (
          id,
          nombre,
          slug,
          icono,
          color
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: { message: 'Producto no encontrado' }
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
 * POST /api/productos
 * Crear un nuevo producto (con imagen opcional)
 */
router.post('/', upload.single('imagen'), processImage, async (req, res, next) => {
  try {
    const datos = { ...req.body };

    // Si se subió una imagen, agregar la URL
    if (req.file && req.file.processedUrl) {
      datos.imagen_url = req.file.processedUrl;
    }

    // Convertir campos numéricos
    if (datos.precio) datos.precio = parseFloat(datos.precio);
    if (datos.costo) datos.costo = parseFloat(datos.costo);
    if (datos.stock) datos.stock = parseInt(datos.stock);
    if (datos.stock_minimo) datos.stock_minimo = parseInt(datos.stock_minimo);
    if (datos.categoria_id) datos.categoria_id = parseInt(datos.categoria_id);

    // Manejar tags como array
    if (typeof datos.tags === 'string') {
      datos.tags = datos.tags.split(',').map(t => t.trim());
    }

    const { data, error } = await supabase
      .from('productos')
      .insert(datos)
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0],
      message: 'Producto creado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/productos/:id
 * Actualizar un producto
 */
router.put('/:id', upload.single('imagen'), processImage, async (req, res, next) => {
  try {
    const { id } = req.params;
    const datos = { ...req.body };

    // Obtener producto actual para eliminar imagen anterior si hay nueva
    if (req.file && req.file.processedUrl) {
      const { data: productoActual } = await supabase
        .from('productos')
        .select('imagen_url')
        .eq('id', id)
        .single();

      if (productoActual?.imagen_url) {
        await deleteImage(productoActual.imagen_url);
      }

      datos.imagen_url = req.file.processedUrl;
    }

    // Convertir campos numéricos
    if (datos.precio) datos.precio = parseFloat(datos.precio);
    if (datos.costo) datos.costo = parseFloat(datos.costo);
    if (datos.stock) datos.stock = parseInt(datos.stock);
    if (datos.stock_minimo) datos.stock_minimo = parseInt(datos.stock_minimo);
    if (datos.categoria_id) datos.categoria_id = parseInt(datos.categoria_id);

    // Manejar tags como array
    if (typeof datos.tags === 'string') {
      datos.tags = datos.tags.split(',').map(t => t.trim());
    }

    const { data, error } = await supabase
      .from('productos')
      .update(datos)
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      data: data[0],
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/productos/:id
 * Eliminar un producto
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Obtener producto para eliminar imagen
    const { data: producto } = await supabase
      .from('productos')
      .select('imagen_url')
      .eq('id', id)
      .single();

    if (producto?.imagen_url) {
      await deleteImage(producto.imagen_url);
    }

    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/productos/:id/imagenes
 * Agregar imágenes adicionales a un producto (galería)
 */
router.post('/:id/imagenes', upload.array('imagenes', 5), processImage, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'No se proporcionaron imágenes' }
      });
    }

    // Obtener producto actual
    const { data: producto } = await supabase
      .from('productos')
      .select('imagenes')
      .eq('id', id)
      .single();

    // Agregar nuevas URLs a la galería
    const nuevasUrls = req.files.map(f => f.processedUrl);
    const imagenesActuales = producto?.imagenes || [];
    const imagenesActualizadas = [...imagenesActuales, ...nuevasUrls];

    const { data, error } = await supabase
      .from('productos')
      .update({ imagenes: imagenesActualizadas })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      data: data[0],
      message: `${req.files.length} imagen(es) agregada(s) exitosamente`
    });
  } catch (error) {
    next(error);
  }
});

export default router;
