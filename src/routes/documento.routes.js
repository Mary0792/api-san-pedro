import { Router } from "express";
import {
    getDocumentos,
    getDocumento,
    getDocumentosBySolicitud,
    getDocumentosByEstudiante,
    createDocumento,
    updateDocumento,
    deleteDocumento
} from "../controllers/documento.controllers.js";
import upload from "../middleware/upload.js";

// Crea una instancia del enrutador de Express
const router = Router();

// Ruta para obtener todos los documentos
router.get("/documentos", getDocumentos);

// Ruta para obtener un documento específico por su ID
router.get("/documentos/:id", getDocumento);

// Ruta para obtener todos los documentos de una solicitud
router.get("/solicitudes/:tipoSolicitud/:solicitudId/documentos", getDocumentosBySolicitud);

// Ruta para obtener todos los documentos de un estudiante
router.get("/estudiantes/:estudianteId/documentos", getDocumentosByEstudiante);

// Ruta para crear un nuevo documento (con middleware de subida de archivos)
router.post("/documentos", upload.single('documento'), createDocumento);

// Ruta para actualizar un documento existente por su ID
router.put("/documentos/:id", updateDocumento);

// Ruta para eliminar un documento por su ID
router.delete("/documentos/:id", deleteDocumento);

// Exporta el enrutador para su uso en la aplicación principal
export default router;
