import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar rutas
import estudianteRoutes from "./routes/estudiante.routes.js";
import apoderadoRoutes from "./routes/apoderado.routes.js";
import relacionRoutes from "./routes/estudiante-apoderado.routes.js";
import documentoRoutes from "./routes/documento.routes.js";
import solicitudRoutes from "./routes/solicitud.routes.js";
import anioEscolarRoutes from "./routes/anio-escolar.routes.js";
import observacionRoutes from "./routes/observacion.routes.js";
import matriculaRoutes from "./routes/matricula.routes.js";

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Crea una instancia de la aplicación Express
const app = express();

// Configurar CORS - Permitir todas las solicitudes para pruebas con Postman
const corsOptions = {
    origin: '*', // Permitir todas las solicitudes (para desarrollo y pruebas con Postman)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cache-Control', 'cache-control'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    credentials: true,
    maxAge: 86400 // Caché de preflight por 24 horas
};

// Aplicar middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Configurar Morgan según el entorno
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')); // Más detallado para producción
} else {
  app.use(morgan('dev')); // Más compacto para desarrollo
}

// Configurar archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Ruta principal - sirve el index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Ruta para la página de subida de documentos
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/upload.html'));
});

// Ruta de healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Servicio funcionando correctamente' });
});

// Ruta de prueba para Postman
app.get('/api/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API funcionando correctamente para pruebas con Postman',
    timestamp: new Date().toISOString(),
    endpoints: {
      estudiantes: '/api/estudiantes',
      apoderados: '/api/apoderados',
      relaciones: '/api/relaciones',
      documentos: '/api/documentos',
      solicitudes: {
        nueva: '/api/solicitudes/nueva',
        traslado: '/api/solicitudes/traslado',
        siguiente: '/api/solicitudes/siguiente'
      },
      observaciones: '/api/observaciones',
      añosEscolares: '/api/anios-escolares'
    }
  });
});
// Mensaje de prueba al entrar en /api
app.get('/api', (req, res) => {
  res.send('API ejecutándose correctamente');
});
// Usa las rutas definidas con el prefijo 'api' para todos los métodos (GET, POST, PUT, DELETE)
// Rutas para gestión de estudiantes - CRUD completo
app.use('/api', estudianteRoutes); // GET, POST, PUT, DELETE para /api/estudiantes

// Rutas para gestión de apoderados - CRUD completo
app.use('/api', apoderadoRoutes); // GET, POST, PUT, DELETE para /api/apoderados

// Rutas para gestión de relaciones entre estudiantes y apoderados
app.use('/api', relacionRoutes); // GET, POST, DELETE para /api/relaciones

// Rutas para gestión de documentos - Subida, descarga y listado
app.use('/api', documentoRoutes); // GET, POST, DELETE para /api/documentos

// Rutas para gestión de solicitudes - Matrícula nueva, traslado y siguiente grado
app.use('/api', solicitudRoutes); // GET, POST, PUT, DELETE para /api/solicitudes/[nueva|traslado|siguiente]

// Rutas para gestión de años escolares
app.use('/api', anioEscolarRoutes); // GET, POST, PUT, DELETE para /api/anios-escolares

// Rutas para gestión de observaciones de solicitudes
app.use('/api', observacionRoutes); // GET, POST, PUT, DELETE para /api/observaciones

// Rutas para gestión de matrículas
app.use('/api', matriculaRoutes);

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  // Para solicitudes API, devolver JSON
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'Ruta no encontrada' });
  }
  // Para otras solicitudes, redirigir a la página principal
  res.redirect('/');
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Exporta la aplicación para su uso en otros módulos
export default app;