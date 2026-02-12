import express from 'express';
import datosRoutes from './datos.js';
import authRoutes from './auth.js';
import productosRoutes from './productos.js';
import clientesRoutes from './clientes.js';
import ventasRoutes from './ventas.js';
import categoriasRoutes from './categorias.js';
import proveedoresRoutes from './proveedores.js';
import comprasRoutes from './compras.js';
import pagosRoutes from './pagos.js';

const router = express.Router();

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Negocio360 funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas específicas de cada módulo
router.use('/productos', productosRoutes);
router.use('/clientes', clientesRoutes);
router.use('/ventas', ventasRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/proveedores', proveedoresRoutes);
router.use('/compras', comprasRoutes);
router.use('/pagos', pagosRoutes);

// Rutas genéricas de datos (para tablas no específicas)
router.use('/datos', datosRoutes);

export default router;
