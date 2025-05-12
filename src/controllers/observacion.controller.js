import { pool } from '../database/db.js';

/**
 * Obtener todas las observaciones
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
export const getAllObservaciones = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM observaciones ORDER BY fecha_creacion DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener observaciones:', error);
        res.status(500).json({ message: 'Error al obtener observaciones', error: error.message });
    }
};

/**
 * Obtener una observación por su ID
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
export const getObservacionById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM observaciones WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Observación no encontrada' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener observación:', error);
        res.status(500).json({ message: 'Error al obtener observación', error: error.message });
    }
};

/**
 * Obtener observaciones por tipo de solicitud y ID de solicitud
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
export const getObservacionesBySolicitud = async (req, res) => {
    try {
        const { tipoSolicitud, solicitudId } = req.params;
        
        // Validar tipo de solicitud
        const tiposValidos = ['nueva', 'traslado', 'siguiente'];
        if (!tiposValidos.includes(tipoSolicitud)) {
            return res.status(400).json({ message: 'Tipo de solicitud no válido' });
        }
        
        const [rows] = await pool.query(
            'SELECT * FROM observaciones WHERE tipo_solicitud = ? AND solicitud_id = ? ORDER BY fecha_creacion DESC',
            [tipoSolicitud, solicitudId]
        );
        
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener observaciones por solicitud:', error);
        res.status(500).json({ message: 'Error al obtener observaciones por solicitud', error: error.message });
    }
};

/**
 * Crear una nueva observación
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
export const createObservacion = async (req, res) => {
    try {
        const { tipo_solicitud, solicitud_id, tipo, descripcion, es_visible_para_padres } = req.body;
        
        // Validar campos requeridos
        if (!tipo_solicitud || !solicitud_id || !tipo || !descripcion) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }
        
        // Validar tipo de solicitud
        const tiposValidos = ['nueva', 'traslado', 'siguiente'];
        if (!tiposValidos.includes(tipo_solicitud)) {
            return res.status(400).json({ message: 'Tipo de solicitud no válido' });
        }
        
        // Validar tipo de observación
        const tiposObservacionValidos = ['ADMINISTRATIVA', 'ACADEMICA', 'DOCUMENTACION', 'OTRO'];
        if (!tiposObservacionValidos.includes(tipo)) {
            return res.status(400).json({ message: 'Tipo de observación no válido' });
        }
        
        const [result] = await pool.query(
            'INSERT INTO observaciones (tipo_solicitud, solicitud_id, tipo, descripcion, es_visible_para_padres) VALUES (?, ?, ?, ?, ?)',
            [tipo_solicitud, solicitud_id, tipo, descripcion, es_visible_para_padres || false]
        );
        
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'No se pudo crear la observación' });
        }
        
        res.status(201).json({
            id: result.insertId,
            tipo_solicitud,
            solicitud_id,
            tipo,
            descripcion,
            es_visible_para_padres: es_visible_para_padres || false,
            fecha_creacion: new Date()
        });
    } catch (error) {
        console.error('Error al crear observación:', error);
        res.status(500).json({ message: 'Error al crear observación', error: error.message });
    }
};

/**
 * Actualizar una observación existente
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
export const updateObservacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo, descripcion, es_visible_para_padres } = req.body;
        
        // Verificar si la observación existe
        const [existingRows] = await pool.query('SELECT * FROM observaciones WHERE id = ?', [id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ message: 'Observación no encontrada' });
        }
        
        // Construir la consulta de actualización
        let query = 'UPDATE observaciones SET ';
        const params = [];
        const updates = [];
        
        if (tipo !== undefined) {
            // Validar tipo de observación
            const tiposObservacionValidos = ['ADMINISTRATIVA', 'ACADEMICA', 'DOCUMENTACION', 'OTRO'];
            if (!tiposObservacionValidos.includes(tipo)) {
                return res.status(400).json({ message: 'Tipo de observación no válido' });
            }
            updates.push('tipo = ?');
            params.push(tipo);
        }
        
        if (descripcion !== undefined) {
            updates.push('descripcion = ?');
            params.push(descripcion);
        }
        
        if (es_visible_para_padres !== undefined) {
            updates.push('es_visible_para_padres = ?');
            params.push(es_visible_para_padres);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ message: 'No se proporcionaron campos para actualizar' });
        }
        
        query += updates.join(', ') + ' WHERE id = ?';
        params.push(id);
        
        const [result] = await pool.query(query, params);
        
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'No se pudo actualizar la observación' });
        }
        
        // Obtener la observación actualizada
        const [updatedRows] = await pool.query('SELECT * FROM observaciones WHERE id = ?', [id]);
        
        res.json(updatedRows[0]);
    } catch (error) {
        console.error('Error al actualizar observación:', error);
        res.status(500).json({ message: 'Error al actualizar observación', error: error.message });
    }
};

/**
 * Eliminar una observación
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
export const deleteObservacion = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si la observación existe
        const [existingRows] = await pool.query('SELECT * FROM observaciones WHERE id = ?', [id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ message: 'Observación no encontrada' });
        }
        
        const [result] = await pool.query('DELETE FROM observaciones WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'No se pudo eliminar la observación' });
        }
        
        res.json({ message: 'Observación eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar observación:', error);
        res.status(500).json({ message: 'Error al eliminar observación', error: error.message });
    }
};
