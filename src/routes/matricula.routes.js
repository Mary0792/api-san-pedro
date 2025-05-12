import { Router } from "express";
import { 
    getMatriculas, 
    getMatricula, 
    getMatriculasByEstudiante,
    getMatriculasByAño,
    createMatriculaNueva,
    createMatriculaTraslado,
    createMatriculaSiguiente,
    updateMatricula, 
    deleteMatricula 
} from "../controllers/matricula.controllers.js";

// Crea una instancia del enrutador de Express
const router = Router();

// Ruta para obtener todas las matrículas
router.get("/matriculas", getMatriculas);

// Ruta para obtener una matrícula específica por su ID
router.get("/matriculas/:id", getMatricula);

// Ruta para obtener todas las matrículas de un estudiante
router.get("/estudiantes/:estudianteId/matriculas", getMatriculasByEstudiante);

// Ruta para obtener matrículas por año escolar
router.get("/matriculas/año/:año", getMatriculasByAño);

// Rutas específicas para cada tipo de matrícula
router.post("/matriculas/nueva", createMatriculaNueva);
router.post("/matriculas/traslado", createMatriculaTraslado);
router.post("/matriculas/siguiente", createMatriculaSiguiente);

// Ruta para actualizar una matrícula existente por su ID
router.put("/matriculas/:id", updateMatricula);

// Ruta para eliminar una matrícula por su ID
router.delete("/matriculas/:id", deleteMatricula);

// Exporta el enrutador para su uso en la aplicación principal
export default router;
