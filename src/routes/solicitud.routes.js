import { Router } from "express";
import {
    getSolicitudesNueva,
    getSolicitudNueva,
    getSolicitudesNuevaByAnio,
    getSolicitudesNuevaByDni,
    createSolicitudNueva,
    updateSolicitudNueva,
    deleteSolicitudNueva,

    getSolicitudesTraslado,
    getSolicitudTraslado,
    getSolicitudesTrasladoByAnio,
    getSolicitudesTrasladoByDni,
    createSolicitudTraslado,
    updateSolicitudTraslado,
    deleteSolicitudTraslado,

    getSolicitudesSiguiente,
    getSolicitudSiguiente,
    getSolicitudesSiguienteByAñoActual,
    getSolicitudesSiguienteByAñoSiguiente,
    getSolicitudesSiguienteByEstudiante,
    getSolicitudesSiguienteByDni,
    createSolicitudSiguiente,
    updateSolicitudSiguiente,
    deleteSolicitudSiguiente,

    getObservaciones,
    getObservacion,
    getObservacionesBySolicitud,
    getObservacionesVisiblesPadresBySolicitud,
    createObservacion,
    updateObservacion,
    deleteObservacion
} from "../controllers/solicitud.controllers.js";

// Crea una instancia del enrutador de Express
const router = Router();

// Rutas para solicitudes de matrícula nueva
router.get("/solicitudes/nueva", getSolicitudesNueva);
router.get("/solicitudes/nueva/dni", getSolicitudesNuevaByDni);
router.get("/solicitudes/nueva/año/:anio", getSolicitudesNuevaByAnio);
router.get("/solicitudes/nueva/:id", getSolicitudNueva);
router.post("/solicitudes/nueva", createSolicitudNueva);
router.put("/solicitudes/nueva/:id", updateSolicitudNueva);
router.delete("/solicitudes/nueva/:id", deleteSolicitudNueva);

// Rutas para solicitudes de traslado
router.get("/solicitudes/traslado", getSolicitudesTraslado);
router.get("/solicitudes/traslado/dni", getSolicitudesTrasladoByDni);
router.get("/solicitudes/traslado/año/:anio", getSolicitudesTrasladoByAnio);
router.get("/solicitudes/traslado/:id", getSolicitudTraslado);
router.post("/solicitudes/traslado", createSolicitudTraslado);
router.put("/solicitudes/traslado/:id", updateSolicitudTraslado);
router.delete("/solicitudes/traslado/:id", deleteSolicitudTraslado);

// Rutas para solicitudes de siguiente grado
router.get("/solicitudes/siguiente", getSolicitudesSiguiente);
router.get("/solicitudes/siguiente/dni", getSolicitudesSiguienteByDni);
router.get("/solicitudes/siguiente/año-actual/:anio", getSolicitudesSiguienteByAñoActual);
router.get("/solicitudes/siguiente/año-siguiente/:anio", getSolicitudesSiguienteByAñoSiguiente);
router.get("/estudiantes/:estudianteId/solicitudes/siguiente", getSolicitudesSiguienteByEstudiante);
router.get("/solicitudes/siguiente/:id", getSolicitudSiguiente);
router.post("/solicitudes/siguiente", createSolicitudSiguiente);
router.put("/solicitudes/siguiente/:id", updateSolicitudSiguiente);
router.delete("/solicitudes/siguiente/:id", deleteSolicitudSiguiente);

// Rutas para observaciones de solicitudes
router.get("/observaciones", getObservaciones);
router.get("/observaciones/:id", getObservacion);
router.get("/solicitudes/:tipoSolicitud/:solicitudId/observaciones", getObservacionesBySolicitud);
router.get("/solicitudes/:tipoSolicitud/:solicitudId/observaciones/visibles", getObservacionesVisiblesPadresBySolicitud);
router.post("/observaciones", createObservacion);
router.put("/observaciones/:id", updateObservacion);
router.delete("/observaciones/:id", deleteObservacion);

// Exporta el enrutador para su uso en la aplicación principal
export default router;
