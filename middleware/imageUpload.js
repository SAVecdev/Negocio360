import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Directorio para almacenar imágenes
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'imagenes');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB en bytes
const MAX_OUTPUT_SIZE = 10 * 1024 * 1024; // Tamaño máximo después de compresión

// Crear directorio si no existe
async function ensureUploadsDir() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

// Configuración de multer para almacenamiento temporal
const storage = multer.memoryStorage();

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, GIF, WebP)'), false);
  }
};

// Instancia de multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB inicial (se comprimirá después)
  }
});

/**
 * Middleware para procesar y comprimir imágenes
 * Acepta imágenes de cualquier tamaño y las comprime a máximo 10 MB
 */
export async function processImage(req, res, next) {
  try {
    await ensureUploadsDir();

    if (!req.file && !req.files) {
      return next();
    }

    // Procesar archivo único
    if (req.file) {
      const processedFile = await compressAndSaveImage(req.file);
      req.file.processedPath = processedFile.path;
      req.file.processedUrl = processedFile.url;
      req.file.compressedSize = processedFile.size;
    }

    // Procesar múltiples archivos
    if (req.files && Array.isArray(req.files)) {
      const processed = await Promise.all(
        req.files.map(file => compressAndSaveImage(file))
      );
      
      req.files.forEach((file, index) => {
        file.processedPath = processed[index].path;
        file.processedUrl = processed[index].url;
        file.compressedSize = processed[index].size;
      });
    }

    // Procesar archivos agrupados (req.files es un objeto)
    if (req.files && !Array.isArray(req.files)) {
      for (const fieldName in req.files) {
        const files = req.files[fieldName];
        const processed = await Promise.all(
          files.map(file => compressAndSaveImage(file))
        );
        
        files.forEach((file, index) => {
          file.processedPath = processed[index].path;
          file.processedUrl = processed[index].url;
          file.compressedSize = processed[index].size;
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error procesando imagen:', error);
    next(error);
  }
}

/**
 * Comprimir y guardar imagen asegurando que no supere 10 MB
 */
async function compressAndSaveImage(file) {
  const filename = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
  const filepath = path.join(UPLOADS_DIR, filename);
  const url = `/uploads/imagenes/${filename}`;

  // Obtener información de la imagen original
  const image = sharp(file.buffer);
  const metadata = await image.metadata();
  
  // Determinar formato de salida (preferir WebP para mejor compresión)
  const outputFormat = 'webp';
  const filenameWebp = `${uuidv4()}-${Date.now()}.webp`;
  const filepathWebp = path.join(UPLOADS_DIR, filenameWebp);
  const urlWebp = `/uploads/imagenes/${filenameWebp}`;

  // Estrategia de compresión
  let quality = 85;
  let width = metadata.width;
  let buffer;
  let iterations = 0;
  const MAX_ITERATIONS = 10;

  do {
    let sharpInstance = sharp(file.buffer);

    // Redimensionar si es necesario
    if (width < metadata.width) {
      sharpInstance = sharpInstance.resize(Math.floor(width), null, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convertir a WebP con calidad ajustada
    buffer = await sharpInstance
      .webp({ quality })
      .toBuffer();

    // Si el archivo es menor a 10 MB, salir del bucle
    if (buffer.length <= MAX_OUTPUT_SIZE) {
      break;
    }

    // Ajustar parámetros para siguiente iteración
    if (quality > 50) {
      quality -= 10;
    } else {
      width = Math.floor(width * 0.9); // Reducir dimensiones 10%
    }

    iterations++;

  } while (buffer.length > MAX_OUTPUT_SIZE && iterations < MAX_ITERATIONS);

  // Guardar archivo comprimido
  await fs.writeFile(filepathWebp, buffer);

  const finalSize = buffer.length;
  const compressionRatio = ((1 - (finalSize / file.size)) * 100).toFixed(2);

  console.log(`✅ Imagen procesada: ${file.originalname}`);
  console.log(`   Original: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Comprimida: ${(finalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Reducción: ${compressionRatio}%`);
  console.log(`   Calidad final: ${quality}, Ancho: ${width}px`);

  return {
    path: filepathWebp,
    url: urlWebp,
    size: finalSize,
    originalSize: file.size,
    compressionRatio,
    filename: filenameWebp
  };
}

/**
 * Middleware para eliminar una imagen del servidor
 */
export async function deleteImage(imagePath) {
  try {
    if (!imagePath) return;
    
    // Convertir URL a ruta del sistema
    const filename = path.basename(imagePath);
    const filepath = path.join(UPLOADS_DIR, filename);
    
    await fs.unlink(filepath);
    console.log(`🗑️  Imagen eliminada: ${filename}`);
  } catch (error) {
    console.error('Error eliminando imagen:', error.message);
  }
}

/**
 * Middleware para validar y restringir el tamaño de subida
 */
export function validateUpload(req, res, next) {
  if (!req.file && (!req.files || req.files.length === 0)) {
    return res.status(400).json({
      success: false,
      error: { message: 'No se ha proporcionado ninguna imagen' }
    });
  }

  next();
}

/**
 * Obtener información de almacenamiento
 */
export async function getStorageInfo() {
  try {
    await ensureUploadsDir();
    const files = await fs.readdir(UPLOADS_DIR);
    
    let totalSize = 0;
    for (const file of files) {
      const filepath = path.join(UPLOADS_DIR, file);
      const stats = await fs.stat(filepath);
      totalSize += stats.size;
    }
    
    return {
      totalFiles: files.length,
      totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      directory: UPLOADS_DIR
    };
  } catch (error) {
    console.error('Error obteniendo info de almacenamiento:', error);
    return null;
  }
}
