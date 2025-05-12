import { Router } from "express";
import {
    getEstudiantes,
    getEstudiante,
    createEstudiante,
    updateEstudiante,
    deleteEstudiante,
    verificarPromocion,
    getResumenEstudiante
} from "../controllers/estudiante.controllers.js";

// Crea una instancia del enrutador de Express
const router = Router();

// Ruta para obtener todos los estudiantes
router.get("/estudiantes", getEstudiantes);

// Ruta para verificar si un estudiante puede ser promovido al siguiente grado
router.get("/estudiantes/verificar-promocion", verificarPromocion);

// Ruta para obtener el resumen de un estudiante incluyendo información de promoción
router.get("/estudiantes/resumen", getResumenEstudiante);

// Ruta para obtener un estudiante específico por su ID
router.get("/estudiantes/:id", getEstudiante);

// Ruta para crear un nuevo estudiante
router.post("/estudiantes", createEstudiante);

// Ruta para actualizar un estudiante existente por su ID
router.put("/estudiantes/:id", updateEstudiante);

// Ruta para eliminar un estudiante por su ID
router.delete("/estudiantes/:id", deleteEstudiante);

// Exporta el enrutador para su uso en la aplicación principal
export default router;
