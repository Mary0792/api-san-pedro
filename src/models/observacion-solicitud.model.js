import db from '../database/connection.js';

/**
 * Modelo para la tabla de observaciones_solicitud
 */
export default {
    /**
     * Obtiene todas las observaciones
     * @returns {Promise<Array>} Lista de observaciones
     */
    getAll: async () => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request().query('SELECT * FROM observaciones_solicitud ORDER BY fecha DESC');
            return result.recordset;
        } catch (error) {
            console.error('Error al obtener observaciones de solicitud:', error.message);
            throw error;
        }
    },

    /**
     * Obtiene una observación por su ID
     * @param {number} id - ID de la observación
     * @returns {Promise<Object>} Datos de la observación
     */
    getById: async (id) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('id', db.sql.Int, id)
                .query('SELECT * FROM observaciones_solicitud WHERE id = @id');
            
            return result.recordset[0];
        } catch (error) {
            console.error(`Error al obtener observación con ID ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Obtiene observaciones por tipo de solicitud y ID de solicitud
     * @param {string} tipoSolicitud - Tipo de solicitud ('nueva', 'traslado', 'siguiente')
     * @param {number} solicitudId - ID de la solicitud
     * @returns {Promise<Array>} Lista de observaciones
     */
    getBySolicitud: async (tipoSolicitud, solicitudId) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('tipoSolicitud', db.sql.VarChar(10), tipoSolicitud)
                .input('solicitudId', db.sql.Int, solicitudId)
                .query(`
                    SELECT * FROM observaciones_solicitud 
                    WHERE tipo_solicitud = @tipoSolicitud AND solicitud_id = @solicitudId
                    ORDER BY fecha DESC
                `);
            
            return result.recordset;
        } catch (error) {
            console.error(`Error al obtener observaciones de la solicitud ${tipoSolicitud} ${solicitudId}:`, error.message);
            throw error;
        }
    },

    /**
     * Obtiene observaciones visibles para padres por tipo de solicitud y ID de solicitud
     * @param {string} tipoSolicitud - Tipo de solicitud ('nueva', 'traslado', 'siguiente')
     * @param {number} solicitudId - ID de la solicitud
     * @returns {Promise<Array>} Lista de observaciones
     */
    getVisiblesPadresBySolicitud: async (tipoSolicitud, solicitudId) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('tipoSolicitud', db.sql.VarChar(10), tipoSolicitud)
                .input('solicitudId', db.sql.Int, solicitudId)
                .query(`
                    SELECT * FROM observaciones_solicitud 
                    WHERE tipo_solicitud = @tipoSolicitud 
                    AND solicitud_id = @solicitudId
                    AND es_visible_para_padres = 1
                    ORDER BY fecha DESC
                `);
            
            return result.recordset;
        } catch (error) {
            console.error(`Error al obtener observaciones visibles para padres de la solicitud ${tipoSolicitud} ${solicitudId}:`, error.message);
            throw error;
        }
    },

    /**
     * Crea una nueva observación
     * @param {Object} observacion - Datos de la observación
     * @returns {Promise<Object>} Resultado de la operación
     */
    create: async (observacion) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('tipo_solicitud', db.sql.VarChar(10), observacion.tipo_solicitud)
                .input('solicitud_id', db.sql.Int, observacion.solicitud_id)
                .input('fecha', db.sql.DateTime, observacion.fecha || new Date())
                .input('tipo', db.sql.VarChar(30), observacion.tipo)
                .input('descripcion', db.sql.VarChar(db.sql.MAX), observacion.descripcion)
                .input('es_visible_para_padres', db.sql.Bit, observacion.es_visible_para_padres !== undefined ? observacion.es_visible_para_padres : 1)
                .query(`
                    INSERT INTO observaciones_solicitud (
                        tipo_solicitud, solicitud_id, fecha, tipo, descripcion, es_visible_para_padres
                    )
                    OUTPUT INSERTED.id
                    VALUES (
                        @tipo_solicitud, @solicitud_id, @fecha, @tipo, @descripcion, @es_visible_para_padres
                    )
                `);
            
            return { id: result.recordset[0].id };
        } catch (error) {
            console.error('Error al crear observación de solicitud:', error.message);
            throw error;
        }
    },

    /**
     * Actualiza una observación existente
     * @param {number} id - ID de la observación
     * @param {Object} observacion - Datos actualizados de la observación
     * @returns {Promise<Object>} Resultado de la operación
     */
    update: async (id, observacion) => {
        try {
            const pool = await db.getConnection();
            const request = pool.request()
                .input('id', db.sql.Int, id);
            
            // Construir la consulta dinámicamente
            let query = 'UPDATE observaciones_solicitud SET ';
            const updateFields = [];
            
            if (observacion.tipo_solicitud !== undefined) {
                request.input('tipo_solicitud', db.sql.VarChar(10), observacion.tipo_solicitud);
                updateFields.push('tipo_solicitud = @tipo_solicitud');
            }
            
            if (observacion.solicitud_id !== undefined) {
                request.input('solicitud_id', db.sql.Int, observacion.solicitud_id);
                updateFields.push('solicitud_id = @solicitud_id');
            }
            
            if (observacion.fecha !== undefined) {
                request.input('fecha', db.sql.DateTime, new Date(observacion.fecha));
                updateFields.push('fecha = @fecha');
            }
            
            if (observacion.tipo !== undefined) {
                request.input('tipo', db.sql.VarChar(30), observacion.tipo);
                updateFields.push('tipo = @tipo');
            }
            
            if (observacion.descripcion !== undefined) {
                request.input('descripcion', db.sql.VarChar(db.sql.MAX), observacion.descripcion);
                updateFields.push('descripcion = @descripcion');
            }
            
            if (observacion.es_visible_para_padres !== undefined) {
                request.input('es_visible_para_padres', db.sql.Bit, observacion.es_visible_para_padres);
                updateFields.push('es_visible_para_padres = @es_visible_para_padres');
            }
            
            // Si no hay campos para actualizar, retornar
            if (updateFields.length === 0) {
                return { affectedRows: 0 };
            }
            
            query += updateFields.join(', ') + ' WHERE id = @id';
            
            const result = await request.query(query);
            return { affectedRows: result.rowsAffected[0] };
        } catch (error) {
            console.error(`Error al actualizar observación con ID ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Elimina una observación
     * @param {number} id - ID de la observación
     * @returns {Promise<Object>} Resultado de la operación
     */
    delete: async (id) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('id', db.sql.Int, id)
                .query('DELETE FROM observaciones_solicitud WHERE id = @id');
            
            return { affectedRows: result.rowsAffected[0] };
        } catch (error) {
            console.error(`Error al eliminar observación con ID ${id}:`, error.message);
            throw error;
        }
    }
};
