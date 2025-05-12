import { Router } from "express";
import {
    getAniosEscolares,
    getAnioEscolar,
    getAnioEscolarByAnio,
    getAnioEscolarActivo,
    createAnioEscolar,
    updateAnioEscolar,
    deleteAnioEscolar
} from "../controllers/anio-escolar.controllers.js";

// Crea una instancia del enrutador de Express
const router = Router();

// Ruta para obtener todos los años escolares
router.get("/anios-escolares", getAniosEscolares);

// Ruta para obtener el año escolar activo
router.get("/anios-escolares/activo", getAnioEscolarActivo);

// Ruta para obtener un año escolar por su valor de año
router.get("/anios-escolares/anio/:anio", getAnioEscolarByAnio);

// Ruta para obtener un año escolar específico por su ID
router.get("/anios-escolares/:id", getAnioEscolar);

// Ruta para crear un nuevo año escolar
router.post("/anios-escolares", createAnioEscolar);

// Ruta para actualizar un año escolar existente por su ID
router.put("/anios-escolares/:id", updateAnioEscolar);

// Ruta para eliminar un año escolar por su ID
router.delete("/anios-escolares/:id", deleteAnioEscolar);

// Exporta el enrutador para su uso en la aplicación principal
export default router;
