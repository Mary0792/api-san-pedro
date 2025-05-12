import relacionModel from '../models/estudiante-apoderado.model.js';
import estudianteModel from '../models/estudiante.model.js';
import apoderadoModel from '../models/apoderado.model.js';

/**
 * Obtiene todas las relaciones estudiante-apoderado
 */
export const getRelaciones = async (req, res) => {
    try {
        const relaciones = await relacionModel.getAll();
        res.json(relaciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener relaciones estudiante-apoderado",
            error: error.message
        });
    }
};

/**
 * Obtiene una relación estudiante-apoderado por su ID
 */
export const getRelacion = async (req, res) => {
    try {
        const { id } = req.params;
        const relacion = await relacionModel.getById(parseInt(id));
        
        if (relacion) {
            res.json(relacion);
        } else {
            res.status(404).json({ message: "Relación estudiante-apoderado no encontrada" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener la relación estudiante-apoderado",
            error: error.message
        });
    }
};

/**
 * Obtiene todos los apoderados de un estudiante
 */
export const getApoderadosByEstudiante = async (req, res) => {
    try {
        const { estudianteId } = req.params;
        
        // Verificar que el estudiante existe
        const estudiante = await estudianteModel.getById(parseInt(estudianteId));
        if (!estudiante) {
            return res.status(404).json({ message: "Estudiante no encontrado" });
        }
        
        const apoderados = await relacionModel.getApoderadosByEstudiante(parseInt(estudianteId));
        res.json(apoderados);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener los apoderados del estudiante",
            error: error.message
        });
    }
};

/**
 * Obtiene todos los estudiantes de un apoderado
 */
export const getEstudiantesByApoderado = async (req, res) => {
    try {
        const { apoderadoId } = req.params;
        
        // Verificar que el apoderado existe
        const apoderado = await apoderadoModel.getById(parseInt(apoderadoId));
        if (!apoderado) {
            return res.status(404).json({ message: "Apoderado no encontrado" });
        }
        
        const estudiantes = await relacionModel.getEstudiantesByApoderado(parseInt(apoderadoId));
        res.json(estudiantes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener los estudiantes del apoderado",
            error: error.message
        });
    }
};

/**
 * Crea una nueva relación estudiante-apoderado
 */
export const createRelacion = async (req, res) => {
    try {
        const { estudiante_id, apoderado_id } = req.body;
        
        // Validar campos requeridos
        if (!estudiante_id || !apoderado_id) {
            return res.status(400).json({ 
                message: "Todos los campos son requeridos: estudiante_id, apoderado_id" 
            });
        }
        
        // Verificar que el estudiante existe
        const estudiante = await estudianteModel.getById(parseInt(estudiante_id));
        if (!estudiante) {
            return res.status(404).json({ message: "Estudiante no encontrado" });
        }
        
        // Verificar que el apoderado existe
        const apoderado = await apoderadoModel.getById(parseInt(apoderado_id));
        if (!apoderado) {
            return res.status(404).json({ message: "Apoderado no encontrado" });
        }
        
        // Crear la relación
        const result = await relacionModel.create({
            estudiante_id: parseInt(estudiante_id),
            apoderado_id: parseInt(apoderado_id)
        });
        
        res.status(201).json({
            id: result.id,
            message: "Relación estudiante-apoderado creada con éxito"
        });
    } catch (error) {
        console.error(error);
        
        // Manejar errores específicos
        if (error.message.includes('Violation of UNIQUE KEY constraint')) {
            return res.status(400).json({ message: "Ya existe esta relación estudiante-apoderado" });
        }
        
        res.status(500).json({
            message: "Error al crear la relación estudiante-apoderado",
            error: error.message
        });
    }
};

/**
 * Elimina una relación estudiante-apoderado
 */
export const deleteRelacion = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await relacionModel.delete(parseInt(id));
        
        if (result.affectedRows > 0) {
            res.json({ message: "Relación estudiante-apoderado eliminada con éxito" });
        } else {
            res.status(404).json({ message: "Relación estudiante-apoderado no encontrada o ya fue eliminada" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al eliminar la relación estudiante-apoderado",
            error: error.message
        });
    }
};
