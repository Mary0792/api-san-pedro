import db from '../database/connection.js';

/**
 * Modelo para la tabla de apoderados
 */
export default {
    /**
     * Obtiene todos los apoderados
     * @returns {Promise<Array>} Lista de apoderados
     */
    getAll: async () => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request().query('SELECT * FROM apoderados');
            return result.recordset;
        } catch (error) {
            console.error('Error al obtener apoderados:', error.message);
            throw error;
        }
    },

    /**
     * Obtiene un apoderado por su ID
     * @param {number} id - ID del apoderado
     * @returns {Promise<Object>} Datos del apoderado
     */
    getById: async (id) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('id', db.sql.Int, id)
                .query('SELECT * FROM apoderados WHERE id = @id');
            
            return result.recordset[0];
        } catch (error) {
            console.error(`Error al obtener apoderado con ID ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Crea un nuevo apoderado
     * @param {Object} apoderado - Datos del apoderado
     * @returns {Promise<Object>} Resultado de la operación
     */
    create: async (apoderado) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('nombre', db.sql.NVarChar(255), apoderado.nombre)
                .input('dni', db.sql.Char(8), apoderado.dni)
                .input('parentesco', db.sql.NVarChar(50), apoderado.parentesco)
                .input('ocupacion', db.sql.NVarChar(100), apoderado.ocupacion)
                .input('grado_instruccion', db.sql.NVarChar(100), apoderado.grado_instruccion)
                .input('telefono', db.sql.NVarChar(15), apoderado.telefono)
                .input('email', db.sql.NVarChar(100), apoderado.email)
                .input('direccion', db.sql.NVarChar(255), apoderado.direccion)
                .query(`
                    INSERT INTO apoderados (nombre, dni, parentesco, ocupacion, grado_instruccion, telefono, email, direccion)
                    OUTPUT INSERTED.id
                    VALUES (@nombre, @dni, @parentesco, @ocupacion, @grado_instruccion, @telefono, @email, @direccion)
                `);
            
            return { id: result.recordset[0].id };
        } catch (error) {
            console.error('Error al crear apoderado:', error.message);
            throw error;
        }
    },

    /**
     * Actualiza un apoderado existente
     * @param {number} id - ID del apoderado
     * @param {Object} apoderado - Datos actualizados del apoderado
     * @returns {Promise<Object>} Resultado de la operación
     */
    update: async (id, apoderado) => {
        try {
            const pool = await db.getConnection();
            const request = pool.request()
                .input('id', db.sql.Int, id);
            
            // Construir la consulta dinámicamente
            let query = 'UPDATE apoderados SET ';
            const updateFields = [];
            
            if (apoderado.nombre !== undefined) {
                request.input('nombre', db.sql.NVarChar(255), apoderado.nombre);
                updateFields.push('nombre = @nombre');
            }
            
            if (apoderado.dni !== undefined) {
                request.input('dni', db.sql.Char(8), apoderado.dni);
                updateFields.push('dni = @dni');
            }
            
            if (apoderado.parentesco !== undefined) {
                request.input('parentesco', db.sql.NVarChar(50), apoderado.parentesco);
                updateFields.push('parentesco = @parentesco');
            }
            
            if (apoderado.ocupacion !== undefined) {
                request.input('ocupacion', db.sql.NVarChar(100), apoderado.ocupacion);
                updateFields.push('ocupacion = @ocupacion');
            }
            
            if (apoderado.grado_instruccion !== undefined) {
                request.input('grado_instruccion', db.sql.NVarChar(100), apoderado.grado_instruccion);
                updateFields.push('grado_instruccion = @grado_instruccion');
            }
            
            if (apoderado.telefono !== undefined) {
                request.input('telefono', db.sql.NVarChar(15), apoderado.telefono);
                updateFields.push('telefono = @telefono');
            }
            
            if (apoderado.email !== undefined) {
                request.input('email', db.sql.NVarChar(100), apoderado.email);
                updateFields.push('email = @email');
            }
            
            if (apoderado.direccion !== undefined) {
                request.input('direccion', db.sql.NVarChar(255), apoderado.direccion);
                updateFields.push('direccion = @direccion');
            }
            
            // Si no hay campos para actualizar, retornar
            if (updateFields.length === 0) {
                return { affectedRows: 0 };
            }
            
            query += updateFields.join(', ') + ' WHERE id = @id';
            
            const result = await request.query(query);
            return { affectedRows: result.rowsAffected[0] };
        } catch (error) {
            console.error(`Error al actualizar apoderado con ID ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Elimina un apoderado
     * @param {number} id - ID del apoderado
     * @returns {Promise<Object>} Resultado de la operación
     */
    delete: async (id) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('id', db.sql.Int, id)
                .query('DELETE FROM apoderados WHERE id = @id');
            
            return { affectedRows: result.rowsAffected[0] };
        } catch (error) {
            console.error(`Error al eliminar apoderado con ID ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Busca un apoderado por su DNI
     * @param {string} dni - DNI del apoderado
     * @returns {Promise<Object>} Datos del apoderado
     */
    getByDni: async (dni) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('dni', db.sql.Char(8), dni)
                .query('SELECT * FROM apoderados WHERE dni = @dni');
            
            return result.recordset[0];
        } catch (error) {
            console.error(`Error al buscar apoderado con DNI ${dni}:`, error.message);
            throw error;
        }
    }
};
