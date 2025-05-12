import { Router } from "express";
import { 
    getRelaciones, 
    getRelacion, 
    getApoderadosByEstudiante,
    getEstudiantesByApoderado,
    createRelacion, 
    deleteRelacion 
} from "../controllers/estudiante-apoderado.controllers.js";

// Crea una instancia del enrutador de Express
const router = Router();

// Ruta para obtener todas las relaciones estudiante-apoderado
router.get("/relaciones", getRelaciones);

// Ruta para obtener una relación específica por su ID
router.get("/relaciones/:id", getRelacion);

// Ruta para obtener todos los apoderados de un estudiante
router.get("/estudiantes/:estudianteId/apoderados", getApoderadosByEstudiante);

// Ruta para obtener todos los estudiantes de un apoderado
router.get("/apoderados/:apoderadoId/estudiantes", getEstudiantesByApoderado);

// Ruta para crear una nueva relación estudiante-apoderado
router.post("/relaciones", createRelacion);

// Ruta para eliminar una relación estudiante-apoderado por su ID
router.delete("/relaciones/:id", deleteRelacion);

// Exporta el enrutador para su uso en la aplicación principal
export default router;
