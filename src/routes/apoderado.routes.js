import { Router } from "express";
import { 
    getApoderados, 
    getApoderado, 
    createApoderado, 
    updateApoderado, 
    deleteApoderado,
    getApoderadoByDni
} from "../controllers/apoderado.controllers.js";

// Crea una instancia del enrutador de Express
const router = Router();

// Ruta para obtener todos los apoderados
router.get("/apoderados", getApoderados);

// Ruta para obtener un apoderado específico por su ID
router.get("/apoderados/:id", getApoderado);

// Ruta para obtener un apoderado por su DNI
router.get("/buscar/:dni", getApoderadoByDni);

// Ruta para crear un nuevo apoderado
router.post("/apoderados", createApoderado);

// Ruta para actualizar un apoderado existente por su ID
router.put("/apoderados/:id", updateApoderado);

// Ruta para eliminar un apoderado por su ID
router.delete("/apoderados/:id", deleteApoderado);

// Exporta el enrutador para su uso en la aplicación principal
export default router;
