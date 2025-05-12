import { getConnection } from '../database/connection.js';
import mssql from 'mssql';

export default {
    /**
     * Obtiene todas las solicitudes de siguiente grado
     * @returns {Promise<Array>} Lista de solicitudes
     */
    getAll: async () => {
        try {
            const pool = await getConnection();
            const result = await pool.request().query(`
                SELECT s.*, e.nombre as estudiante_nombre
                FROM solicitud_siguiente_grado s
                JOIN estudiantes e ON s.estudiante_id = e.id
            `);
            return result.recordset || [];
        } catch (error) {
            console.error('Error al obtener solicitudes de siguiente grado:', error.message);
            throw error;
        }
    },

    /**
     * Obtiene una solicitud de siguiente grado por su ID
     * @param {number} id - ID de la solicitud
     * @returns {Promise<Object>} Datos de la solicitud
     */
    getById: async (id) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('id', db.sql.Int, id)
                .query(`
                    SELECT s.*, e.nombre as estudiante_nombre
                    FROM solicitud_siguiente_grado s
                    JOIN estudiantes e ON s.estudiante_id = e.id
                    WHERE s.id = @id
                `);

            return result.recordset[0];
        } catch (error) {
            console.error(`Error al obtener solicitud de siguiente grado con ID ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Obtiene solicitudes de siguiente grado por año escolar actual
     * @param {string} año - Año escolar actual (formato: YYYY)
     * @returns {Promise<Array>} Lista de solicitudes
     */
    getByAñoActual: async (año) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('año', db.sql.Char(4), año)
                .query(`
                    SELECT s.*, e.nombre as estudiante_nombre
                    FROM solicitud_siguiente_grado s
                    JOIN estudiantes e ON s.estudiante_id = e.id
                    WHERE s.año_escolar_actual = @año
                `);

            return result.recordset;
        } catch (error) {
            console.error(`Error al obtener solicitudes de siguiente grado del año actual ${año}:`, error.message);
            throw error;
        }
    },

    /**
     * Obtiene solicitudes de siguiente grado por año escolar siguiente
     * @param {string} año - Año escolar siguiente (formato: YYYY)
     * @returns {Promise<Array>} Lista de solicitudes
     */
    getByAñoSiguiente: async (año) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('año', db.sql.Char(4), año)
                .query(`
                    SELECT s.*, e.nombre as estudiante_nombre
                    FROM solicitud_siguiente_grado s
                    JOIN estudiantes e ON s.estudiante_id = e.id
                    WHERE s.año_escolar_siguiente = @año
                `);

            return result.recordset;
        } catch (error) {
            console.error(`Error al obtener solicitudes de siguiente grado del año siguiente ${año}:`, error.message);
            throw error;
        }
    },

    /**
     * Obtiene solicitudes de siguiente grado por estudiante
     * @param {number} estudianteId - ID del estudiante
     * @returns {Promise<Array>} Lista de solicitudes
     */
    getByEstudiante: async (estudianteId) => {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('estudianteId', mssql.Int, estudianteId)
                .query(`
                    SELECT s.*, e.nombre as estudiante_nombre
                    FROM solicitud_siguiente_grado s
                    JOIN estudiantes e ON s.estudiante_id = e.id
                    WHERE s.estudiante_id = @estudianteId
                `);

            return result.recordset || [];
        } catch (error) {
            console.error(`Error al obtener solicitudes de siguiente grado del estudiante ${estudianteId}:`, error.message);
            throw error;
        }
    },

    /**
     * Obtiene solicitudes de siguiente grado por DNI del estudiante
     * @param {string} dni - DNI del estudiante
     * @returns {Promise<Array>} Lista de solicitudes
     */
    getByDniEstudiante: async (dni) => {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('dni', mssql.VarChar(8), dni)
                .query(`
                    SELECT s.*, e.nombre as estudiante_nombre, e.dni as estudiante_dni
                    FROM solicitud_siguiente_grado s
                    JOIN estudiantes e ON s.estudiante_id = e.id
                    WHERE e.dni = @dni
                `);

            return result.recordset || [];
        } catch (error) {
            console.error(`Error al obtener solicitudes de siguiente grado con DNI ${dni}:`, error.message);
            throw error;
        }
    },

    /**
     * Crea una nueva solicitud de siguiente grado
     * @param {Object} solicitud - Datos de la solicitud
     * @returns {Promise<Object>} Resultado de la operación
     */
    create: async (solicitud) => {
        try {
            const pool = await db.getConnection();

            // Ensure all required fields are present and of correct type
            const requiredFields = {
                estudiante_id: 'number',
                grado_actual: 'number',
                grado_siguiente: 'number',
                anio_escolar_actual: 'string',
                anio_escolar_siguiente: 'string',
                fecha_solicitud: 'string'
            };

            // Map año_escolar to anio_escolar if present
            if (solicitud.año_escolar_actual) {
                solicitud.anio_escolar_actual = solicitud.año_escolar_actual;
                delete solicitud.año_escolar_actual;
            }
            if (solicitud.año_escolar_siguiente) {
                solicitud.anio_escolar_siguiente = solicitud.año_escolar_siguiente;
                delete solicitud.año_escolar_siguiente;
            }

            for (const [field, type] of Object.entries(requiredFields)) {
                if (!solicitud[field]) {
                    throw new Error(`Campo requerido faltante: ${field}`);
                }
                if (typeof solicitud[field] !== type) {
                    throw new Error(`Tipo de dato inválido para ${field}. Se esperaba ${type}`);
                }
            }

            // Validate year format
            const yearRegex = /^\d{4}$/;
            if (!yearRegex.test(solicitud.anio_escolar_actual) || !yearRegex.test(solicitud.anio_escolar_siguiente)) {
                throw new Error('Los años escolares deben tener 4 dígitos numéricos');
            }

            // Parse and validate date
            let fechaSolicitud;
            try {
                fechaSolicitud = new Date(solicitud.fecha_solicitud);
                if (isNaN(fechaSolicitud.getTime())) {
                    throw new Error('Fecha inválida');
                }
            } catch (error) {
                throw new Error('Formato de fecha inválido');
            }

            const result = await pool.request()
                .input('estudiante_id', db.sql.Int, solicitud.estudiante_id)
                .input('grado_actual', db.sql.Int, solicitud.grado_actual)
                .input('grado_siguiente', db.sql.Int, solicitud.grado_siguiente)
                .input('anio_escolar_actual', db.sql.Char(4), solicitud.anio_escolar_actual)
                .input('anio_escolar_siguiente', db.sql.Char(4), solicitud.anio_escolar_siguiente)
                .input('fecha_solicitud', db.sql.Date, fechaSolicitud)
                .input('estado', db.sql.VarChar(10), solicitud.estado || 'pendiente')
                .input('comentarios', db.sql.NVarChar(db.sql.MAX), solicitud.comentarios || null)
                .query(`
                    INSERT INTO solicitud_siguiente_grado (
                        estudiante_id, grado_actual, grado_siguiente, anio_escolar_actual,
                        anio_escolar_siguiente, fecha_solicitud, estado, comentarios
                    )
                    OUTPUT INSERTED.id
                    VALUES (
                        @estudiante_id, @grado_actual, @grado_siguiente, @anio_escolar_actual,
                        @anio_escolar_siguiente, @fecha_solicitud, @estado, @comentarios
                    )
                `);

            if (!result.recordset || !result.recordset[0]) {
                throw new Error('Error al crear la solicitud: no se recibió ID');
            }

            return { id: result.recordset[0].id };
        } catch (error) {
            console.error('Error al crear solicitud de siguiente grado:', error);
            throw error;
        }
    },

    /**
     * Actualiza una solicitud de siguiente grado existente
     * @param {number} id - ID de la solicitud
     * @param {Object} solicitud - Datos actualizados de la solicitud
     * @returns {Promise<Object>} Resultado de la operación
     */
    update: async (id, solicitud) => {
        try {
            const pool = await db.getConnection();
            const request = pool.request()
                .input('id', db.sql.Int, id);

            // Construir la consulta dinámicamente
            let query = 'UPDATE solicitud_siguiente_grado SET ';
            const updateFields = [];

            if (solicitud.estudiante_id !== undefined) {
                request.input('estudiante_id', db.sql.Int, solicitud.estudiante_id);
                updateFields.push('estudiante_id = @estudiante_id');
            }

            if (solicitud.grado_actual !== undefined) {
                request.input('grado_actual', db.sql.Int, solicitud.grado_actual);
                updateFields.push('grado_actual = @grado_actual');
            }

            if (solicitud.grado_siguiente !== undefined) {
                request.input('grado_siguiente', db.sql.Int, solicitud.grado_siguiente);
                updateFields.push('grado_siguiente = @grado_siguiente');
            }

            if (solicitud.anio_escolar_actual !== undefined) {
                request.input('anio_escolar_actual', db.sql.Char(4), solicitud.anio_escolar_actual);
                updateFields.push('anio_escolar_actual = @anio_escolar_actual');
            }

            if (solicitud.anio_escolar_siguiente !== undefined) {
                request.input('anio_escolar_siguiente', db.sql.Char(4), solicitud.anio_escolar_siguiente);
                updateFields.push('anio_escolar_siguiente = @anio_escolar_siguiente');
            }

            if (solicitud.fecha_solicitud !== undefined) {
                request.input('fecha_solicitud', db.sql.Date, new Date(solicitud.fecha_solicitud));
                updateFields.push('fecha_solicitud = @fecha_solicitud');
            }

            if (solicitud.estado !== undefined) {
                request.input('estado', db.sql.VarChar(10), solicitud.estado);
                updateFields.push('estado = @estado');
            }

            if (solicitud.comentarios !== undefined) {
                request.input('comentarios', db.sql.VarChar(db.sql.MAX), solicitud.comentarios);
                updateFields.push('comentarios = @comentarios');
            }

            // Si no hay campos para actualizar, retornar
            if (updateFields.length === 0) {
                return { affectedRows: 0 };
            }

            query += updateFields.join(', ') + ', updated_at = GETDATE() WHERE id = @id';

            const result = await request.query(query);
            return { affectedRows: result.rowsAffected[0] };
        } catch (error) {
            console.error(`Error al actualizar solicitud de siguiente grado con ID ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Elimina una solicitud de siguiente grado
     * @param {number} id - ID de la solicitud
     * @returns {Promise<Object>} Resultado de la operación
     */
    delete: async (id) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('id', db.sql.Int, id)
                .query('DELETE FROM solicitud_siguiente_grado WHERE id = @id');

            return { affectedRows: result.rowsAffected[0] };
        } catch (error) {
            console.error(`Error al eliminar solicitud de siguiente grado con ID ${id}:`, error.message);
            throw error;
        }
    }
};
