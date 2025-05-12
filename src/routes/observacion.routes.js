import { Router } from 'express';
import * as observacionController from '../controllers/observacion.controller.js';

const router = Router();

/**
 * @route GET /api/observaciones
 * @desc Obtener todas las observaciones
 * @access Public
 */
router.get('/observaciones', observacionController.getAllObservaciones);

/**
 * @route GET /api/observaciones/:id
 * @desc Obtener una observación por su ID
 * @access Public
 */
router.get('/observaciones/:id', observacionController.getObservacionById);

/**
 * @route GET /api/solicitudes/:tipoSolicitud/:solicitudId/observaciones
 * @desc Obtener observaciones por tipo de solicitud y ID de solicitud
 * @access Public
 */
router.get('/solicitudes/:tipoSolicitud/:solicitudId/observaciones', observacionController.getObservacionesBySolicitud);

/**
 * @route POST /api/observaciones
 * @desc Crear una nueva observación
 * @access Public
 */
router.post('/observaciones', observacionController.createObservacion);

/**
 * @route PUT /api/observaciones/:id
 * @desc Actualizar una observación existente
 * @access Public
 */
router.put('/observaciones/:id', observacionController.updateObservacion);

/**
 * @route DELETE /api/observaciones/:id
 * @desc Eliminar una observación
 * @access Public
 */
router.delete('/observaciones/:id', observacionController.deleteObservacion);

export default router;
