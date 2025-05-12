import db from '../database/connection.js';

/**
 * Modelo para la tabla de documentos
 */
export default {
    /**
     * Obtiene todos los documentos
     * @returns {Promise<Array>} Lista de documentos
     */
    getAll: async () => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request().query(`
                SELECT * FROM documentos
            `);
            return result.recordset;
        } catch (error) {
            console.error('Error al obtener documentos:', error.message);
            throw error;
        }
    },

    /**
     * Obtiene un documento por su ID
     * @param {number} id - ID del documento
     * @returns {Promise<Object>} Datos del documento
     */
    getById: async (id) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('id', db.sql.Int, id)
                .query(`
                    SELECT * FROM documentos
                    WHERE id = @id
                `);

            return result.recordset[0];
        } catch (error) {
            console.error(`Error al obtener documento con ID ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Obtiene todos los documentos de una solicitud
     * @param {string} tipoSolicitud - Tipo de solicitud ('nueva', 'traslado', 'siguiente')
     * @param {number} solicitudId - ID de la solicitud
     * @returns {Promise<Array>} Lista de documentos
     */
    getBySolicitud: async (tipoSolicitud, solicitudId) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('solicitudId', db.sql.Int, solicitudId)
                .query(`
                    SELECT * FROM documentos
                    WHERE solicitud_id = @solicitudId
                `);

            return result.recordset;
        } catch (error) {
            console.error(`Error al obtener documentos de la solicitud ${solicitudId}:`, error.message);
            throw error;
        }
    },

    /**
     * Obtiene todos los documentos de un estudiante
     * @param {number} estudianteId - ID del estudiante
     * @returns {Promise<Array>} Lista de documentos
     */
    getByEstudiante: async (estudianteId) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('estudianteId', db.sql.Int, estudianteId)
                .query(`
                    SELECT d.* FROM documentos d
                    JOIN solicitud_siguiente_grado s ON d.solicitud_id = s.id AND d.tipo_solicitud = 'siguiente'
                    WHERE s.estudiante_id = @estudianteId
                    UNION
                    SELECT d.* FROM documentos d
                    JOIN solicitud_matricula_nueva sn ON d.solicitud_id = sn.id AND d.tipo_solicitud = 'nueva'
                    JOIN estudiantes e ON e.dni = sn.dni_estudiante
                    WHERE e.id = @estudianteId
                    UNION
                    SELECT d.* FROM documentos d
                    JOIN solicitud_traslado st ON d.solicitud_id = st.id AND d.tipo_solicitud = 'traslado'
                    JOIN estudiantes e ON e.dni = st.dni_estudiante
                    WHERE e.id = @estudianteId
                `);

            return result.recordset;
        } catch (error) {
            console.error(`Error al obtener documentos del estudiante ${estudianteId}:`, error.message);
            throw error;
        }
    },

    /**
     * Obtiene documentos aplicando filtros
     * @param {Object} filtros - Filtros a aplicar (tipo_solicitud, solicitud_id, tipo_documento)
     * @returns {Promise<Array>} Lista de documentos filtrados
     */
    getByFilters: async (filtros) => {
        try {
            const pool = await db.getConnection();
            const request = pool.request();

            // Construir la consulta dinámicamente
            let query = 'SELECT * FROM documentos WHERE 1=1';

            if (filtros.tipo_solicitud) {
                request.input('tipo_solicitud', db.sql.NVarChar(10), filtros.tipo_solicitud);
                query += ' AND tipo_solicitud = @tipo_solicitud';
            }

            if (filtros.solicitud_id) {
                request.input('solicitud_id', db.sql.Int, filtros.solicitud_id);
                query += ' AND solicitud_id = @solicitud_id';
            }

            if (filtros.tipo_documento) {
                request.input('tipo_documento', db.sql.NVarChar(50), filtros.tipo_documento);
                query += ' AND tipo_documento = @tipo_documento';
            }

            // Ordenar por ID descendente (más recientes primero)
            query += ' ORDER BY id DESC';

            console.log('Ejecutando consulta:', query);
            const result = await request.query(query);
            return result.recordset;
        } catch (error) {
            console.error('Error al obtener documentos con filtros:', error.message);
            throw error;
        }
    },

    /**
     * Crea un nuevo documento
     * @param {Object} documento - Datos del documento
     * @returns {Promise<Object>} Resultado de la operación
     */
    create: async (documento) => {
        try {
            const pool = await db.getConnection();
            const now = new Date().toISOString();

            console.log('Insertando documento en la base de datos:', documento);

            const result = await pool.request()
                .input('tipo_solicitud', db.sql.NVarChar(10), documento.tipo_solicitud)
                .input('solicitud_id', db.sql.Int, documento.solicitud_id)
                .input('tipo_documento', db.sql.NVarChar(50), documento.tipo_documento)
                .input('nombre_archivo', db.sql.NVarChar(255), documento.nombre_archivo)
                .input('ruta_archivo', db.sql.NVarChar(255), documento.ruta_archivo)
                .input('created_at', db.sql.DateTime, now)
                .input('updated_at', db.sql.DateTime, now)
                .query(`
                    INSERT INTO documentos (tipo_solicitud, solicitud_id, tipo_documento, nombre_archivo, ruta_archivo, created_at, updated_at)
                    OUTPUT INSERTED.id
                    VALUES (@tipo_solicitud, @solicitud_id, @tipo_documento, @nombre_archivo, @ruta_archivo, @created_at, @updated_at)
                `);

            return { id: result.recordset[0].id };
        } catch (error) {
            console.error('Error al crear documento:', error.message);
            throw error;
        }
    },

    /**
     * Actualiza un documento existente
     * @param {number} id - ID del documento
     * @param {Object} documento - Datos actualizados del documento
     * @returns {Promise<Object>} Resultado de la operación
     */
    update: async (id, documento) => {
        try {
            const pool = await db.getConnection();
            const request = pool.request()
                .input('id', db.sql.Int, id);

            // Construir la consulta dinámicamente
            let query = 'UPDATE documentos SET ';
            const updateFields = [];

            if (documento.tipo_solicitud !== undefined) {
                request.input('tipo_solicitud', db.sql.VarChar(10), documento.tipo_solicitud);
                updateFields.push('tipo_solicitud = @tipo_solicitud');
            }

            if (documento.solicitud_id !== undefined) {
                request.input('solicitud_id', db.sql.Int, documento.solicitud_id);
                updateFields.push('solicitud_id = @solicitud_id');
            }

            if (documento.tipo_documento !== undefined) {
                request.input('tipo_documento', db.sql.NVarChar(50), documento.tipo_documento);
                updateFields.push('tipo_documento = @tipo_documento');
            }

            if (documento.nombre_archivo !== undefined) {
                request.input('nombre_archivo', db.sql.NVarChar(255), documento.nombre_archivo);
                updateFields.push('nombre_archivo = @nombre_archivo');
            }

            if (documento.ruta_archivo !== undefined) {
                request.input('ruta_archivo', db.sql.NVarChar(255), documento.ruta_archivo);
                updateFields.push('ruta_archivo = @ruta_archivo');
            }

            // Si no hay campos para actualizar, retornar
            if (updateFields.length === 0) {
                return { affectedRows: 0 };
            }

            query += updateFields.join(', ') + ' WHERE id = @id';

            const result = await request.query(query);
            return { affectedRows: result.rowsAffected[0] };
        } catch (error) {
            console.error(`Error al actualizar documento con ID ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Elimina un documento
     * @param {number} id - ID del documento
     * @returns {Promise<Object>} Resultado de la operación
     */
    delete: async (id) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('id', db.sql.Int, id)
                .query('DELETE FROM documentos WHERE id = @id');

            return { affectedRows: result.rowsAffected[0] };
        } catch (error) {
            console.error(`Error al eliminar documento con ID ${id}:`, error.message);
            throw error;
        }
    }
};
