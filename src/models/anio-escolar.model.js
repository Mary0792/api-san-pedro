import db from '../database/connection.js';

/**
 * Modelo para la tabla de anios_escolares
 */
export default {
    /**
     * Obtiene todos los años escolares
     * @returns {Promise<Array>} Lista de años escolares
     */
    getAll: async () => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request().query('SELECT * FROM anios_escolares ORDER BY anio DESC');
            return result.recordset;
        } catch (error) {
            console.error('Error al obtener años escolares:', error.message);
            throw error;
        }
    },

    /**
     * Obtiene un año escolar por su ID
     * @param {number} id - ID del año escolar
     * @returns {Promise<Object>} Datos del año escolar
     */
    getById: async (id) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('id', db.sql.Int, id)
                .query('SELECT * FROM anios_escolares WHERE id = @id');

            return result.recordset[0];
        } catch (error) {
            console.error(`Error al obtener año escolar con ID ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Obtiene un año escolar por su valor de año
     * @param {string} anio - Año escolar (formato: YYYY)
     * @returns {Promise<Object>} Datos del año escolar
     */
    getByAnio: async (anio) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('anio', db.sql.Char(4), anio)
                .query('SELECT * FROM anios_escolares WHERE anio = @anio');

            return result.recordset[0];
        } catch (error) {
            console.error(`Error al obtener año escolar ${anio}:`, error.message);
            throw error;
        }
    },

    /**
     * Obtiene el año escolar activo actual
     * @returns {Promise<Object>} Datos del año escolar activo
     */
    getActivo: async () => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .query("SELECT * FROM anios_escolares WHERE estado = 'activo'");

            return result.recordset[0];
        } catch (error) {
            console.error('Error al obtener año escolar activo:', error.message);
            throw error;
        }
    },

    /**
     * Crea un nuevo año escolar
     * @param {Object} anioEscolar - Datos del año escolar
     * @returns {Promise<Object>} Resultado de la operación
     */
    create: async (anioEscolar) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('anio', db.sql.Char(4), anioEscolar.anio)
                .input('descripcion', db.sql.VarChar(100), anioEscolar.descripcion || null)
                .input('fecha_inicio', db.sql.Date, new Date(anioEscolar.fecha_inicio))
                .input('fecha_fin', db.sql.Date, new Date(anioEscolar.fecha_fin))
                .input('estado', db.sql.VarChar(20), anioEscolar.estado || 'planificado')
                .query(`
                    INSERT INTO anios_escolares (anio, descripcion, fecha_inicio, fecha_fin, estado)
                    OUTPUT INSERTED.id
                    VALUES (@anio, @descripcion, @fecha_inicio, @fecha_fin, @estado)
                `);

            return { id: result.recordset[0].id };
        } catch (error) {
            console.error('Error al crear año escolar:', error.message);
            throw error;
        }
    },

    /**
     * Actualiza un año escolar existente
     * @param {number} id - ID del año escolar
     * @param {Object} anioEscolar - Datos actualizados del año escolar
     * @returns {Promise<Object>} Resultado de la operación
     */
    update: async (id, anioEscolar) => {
        try {
            const pool = await db.getConnection();
            const request = pool.request()
                .input('id', db.sql.Int, id);

            // Construir la consulta dinámicamente
            let query = 'UPDATE anios_escolares SET ';
            const updateFields = [];

            if (anioEscolar.anio !== undefined) {
                request.input('anio', db.sql.Char(4), anioEscolar.anio);
                updateFields.push('anio = @anio');
            }

            if (anioEscolar.descripcion !== undefined) {
                request.input('descripcion', db.sql.VarChar(100), anioEscolar.descripcion);
                updateFields.push('descripcion = @descripcion');
            }

            if (anioEscolar.fecha_inicio !== undefined) {
                request.input('fecha_inicio', db.sql.Date, new Date(anioEscolar.fecha_inicio));
                updateFields.push('fecha_inicio = @fecha_inicio');
            }

            if (anioEscolar.fecha_fin !== undefined) {
                request.input('fecha_fin', db.sql.Date, new Date(anioEscolar.fecha_fin));
                updateFields.push('fecha_fin = @fecha_fin');
            }

            if (anioEscolar.estado !== undefined) {
                request.input('estado', db.sql.VarChar(20), anioEscolar.estado);
                updateFields.push('estado = @estado');
            }

            // Si no hay campos para actualizar, retornar
            if (updateFields.length === 0) {
                return { affectedRows: 0 };
            }

            query += updateFields.join(', ') + ', updated_at = GETDATE() WHERE id = @id';

            const result = await request.query(query);
            return { affectedRows: result.rowsAffected[0] };
        } catch (error) {
            console.error(`Error al actualizar año escolar con ID ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Elimina un año escolar
     * @param {number} id - ID del año escolar
     * @returns {Promise<Object>} Resultado de la operación
     */
    delete: async (id) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('id', db.sql.Int, id)
                .query('DELETE FROM anios_escolares WHERE id = @id');

            return { affectedRows: result.rowsAffected[0] };
        } catch (error) {
            console.error(`Error al eliminar año escolar con ID ${id}:`, error.message);
            throw error;
        }
    }
};
