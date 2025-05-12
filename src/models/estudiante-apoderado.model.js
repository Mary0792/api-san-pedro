import db from '../database/connection.js';

/**
 * Modelo para la tabla de relación estudiante-apoderado
 */
export default {
    /**
     * Obtiene todas las relaciones estudiante-apoderado
     * @returns {Promise<Array>} Lista de relaciones
     */
    getAll: async () => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request().query(`
                SELECT ea.id, ea.estudiante_id, ea.apoderado_id, 
                       e.nombre as estudiante_nombre, a.nombre as apoderado_nombre
                FROM estudiante_apoderado ea
                JOIN estudiantes e ON ea.estudiante_id = e.id
                JOIN apoderados a ON ea.apoderado_id = a.id
            `);
            return result.recordset;
        } catch (error) {
            console.error('Error al obtener relaciones estudiante-apoderado:', error.message);
            throw error;
        }
    },

    /**
     * Obtiene una relación estudiante-apoderado por su ID
     * @param {number} id - ID de la relación
     * @returns {Promise<Object>} Datos de la relación
     */
    getById: async (id) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('id', db.sql.Int, id)
                .query(`
                    SELECT ea.id, ea.estudiante_id, ea.apoderado_id, 
                           e.nombre as estudiante_nombre, a.nombre as apoderado_nombre
                    FROM estudiante_apoderado ea
                    JOIN estudiantes e ON ea.estudiante_id = e.id
                    JOIN apoderados a ON ea.apoderado_id = a.id
                    WHERE ea.id = @id
                `);
            
            return result.recordset[0];
        } catch (error) {
            console.error(`Error al obtener relación con ID ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Obtiene todos los apoderados de un estudiante
     * @param {number} estudianteId - ID del estudiante
     * @returns {Promise<Array>} Lista de apoderados
     */
    getApoderadosByEstudiante: async (estudianteId) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('estudianteId', db.sql.Int, estudianteId)
                .query(`
                    SELECT a.*, ea.id as relacion_id
                    FROM apoderados a
                    JOIN estudiante_apoderado ea ON a.id = ea.apoderado_id
                    WHERE ea.estudiante_id = @estudianteId
                `);
            
            return result.recordset;
        } catch (error) {
            console.error(`Error al obtener apoderados del estudiante ${estudianteId}:`, error.message);
            throw error;
        }
    },

    /**
     * Obtiene todos los estudiantes de un apoderado
     * @param {number} apoderadoId - ID del apoderado
     * @returns {Promise<Array>} Lista de estudiantes
     */
    getEstudiantesByApoderado: async (apoderadoId) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('apoderadoId', db.sql.Int, apoderadoId)
                .query(`
                    SELECT e.*, ea.id as relacion_id
                    FROM estudiantes e
                    JOIN estudiante_apoderado ea ON e.id = ea.estudiante_id
                    WHERE ea.apoderado_id = @apoderadoId
                `);
            
            return result.recordset;
        } catch (error) {
            console.error(`Error al obtener estudiantes del apoderado ${apoderadoId}:`, error.message);
            throw error;
        }
    },

    /**
     * Crea una nueva relación estudiante-apoderado
     * @param {Object} relacion - Datos de la relación
     * @returns {Promise<Object>} Resultado de la operación
     */
    create: async (relacion) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('estudiante_id', db.sql.Int, relacion.estudiante_id)
                .input('apoderado_id', db.sql.Int, relacion.apoderado_id)
                .query(`
                    INSERT INTO estudiante_apoderado (estudiante_id, apoderado_id)
                    OUTPUT INSERTED.id
                    VALUES (@estudiante_id, @apoderado_id)
                `);
            
            return { id: result.recordset[0].id };
        } catch (error) {
            console.error('Error al crear relación estudiante-apoderado:', error.message);
            throw error;
        }
    },

    /**
     * Elimina una relación estudiante-apoderado
     * @param {number} id - ID de la relación
     * @returns {Promise<Object>} Resultado de la operación
     */
    delete: async (id) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('id', db.sql.Int, id)
                .query('DELETE FROM estudiante_apoderado WHERE id = @id');
            
            return { affectedRows: result.rowsAffected[0] };
        } catch (error) {
            console.error(`Error al eliminar relación con ID ${id}:`, error.message);
            throw error;
        }
    }
};
