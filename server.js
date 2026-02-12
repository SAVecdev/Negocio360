import express from 'express';
import https from 'https';
import http from 'http';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { verificarConexion } from './config/supabase.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Deshabilitamos CSP restrictivo de helmet
  crossOriginEmbedderPolicy: false
}));
app.use(cors()); // Habilitar CORS
app.use(morgan('dev')); // Logging de requests
app.use(express.json()); // Parser de JSON
app.use(express.urlencoded({ extended: true })); // Parser de URL encoded
app.use(express.static('public')); // Servir archivos estáticos
app.use('/uploads', express.static('uploads')); // Servir imágenes subidas

// Ruta raíz - servir página HTML
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: './public' });
});

// Rutas API
app.use('/api', routes);

// Manejo de errores
app.use(notFound);
app.use(errorHandler);

// Iniciar servidor
const iniciarServidor = async () => {
  try {
    // Verificar conexión a Supabase
    await verificarConexion();

    const enableHttps = process.env.ENABLE_HTTPS === 'true';

    if (enableHttps) {
      // Configuración HTTPS
      const sslCertPath = process.env.SSL_CERT_PATH || './ssl/server.cert';
      const sslKeyPath = process.env.SSL_KEY_PATH || './ssl/server.key';

      // Verificar si existen los certificados
      if (!fs.existsSync(sslCertPath) || !fs.existsSync(sslKeyPath)) {
        console.error('❌ Error: Certificados SSL no encontrados');
        console.error(`📄 Certificado esperado en: ${sslCertPath}`);
        console.error(`🔑 Clave esperada en: ${sslKeyPath}`);
        console.error('\n💡 Genera certificados con: npm run generate:ssl');
        process.exit(1);
      }

      const httpsOptions = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath)
      };

      https.createServer(httpsOptions, app).listen(PORT, () => {
        console.log('========================================')
        console.log(`🔒 Servidor HTTPS corriendo en puerto ${PORT}`);
        console.log(`📍 https://localhost:${PORT}`);
        console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
        console.log('🔐 SSL/TLS: Habilitado');
        console.log('========================================')
      });
    } else {
      // Configuración HTTP estándar
      http.createServer(app).listen(PORT, () => {
        console.log('========================================')
        console.log(`🚀 Servidor HTTP corriendo en puerto ${PORT}`);
        console.log(`📍 http://localhost:${PORT}`);
        console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
        console.log('⚠️  SSL/TLS: Deshabilitado');
        console.log('========================================')
      });
    }
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();
