import { getConnection } from '../database/connection.js';
import mssql from 'mssql';

/**
 * Modelo para la tabla de solicitud_matricula_nueva
 */
export default {
    /**
     * Obtiene todas las solicitudes de matrícula nueva
     * @returns {Promise<Array>} Lista de solicitudes
     */
    getAll: async () => {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .query('SELECT * FROM solicitud_matricula_nueva');
            return result.recordset || [];
        } catch (error) {
            console.error('Error al obtener solicitudes de matrícula nueva:', error.message);
            throw error;
        }
    },

    /**
     * Obtiene una solicitud de matrícula nueva por su ID
     * @param {number} id - ID de la solicitud
     * @returns {Promise<Object>} Datos de la solicitud
     */
    getById: async (id) => {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('id', mssql.Int, id)
                .query('SELECT * FROM solicitud_matricula_nueva WHERE id = @id');
            return result.recordset[0] || null;
        } catch (error) {
            console.error(`Error al obtener solicitud de matrícula nueva con ID ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Obtiene solicitudes de matrícula nueva por año escolar
     * @param {string} anio - Año escolar (formato: YYYY)
     * @returns {Promise<Array>} Lista de solicitudes
     */
    getByAnio: async (anio) => {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('anio', mssql.VarChar(4), anio)
                .query('SELECT * FROM solicitud_matricula_nueva WHERE anio_escolar = @anio');
            return result.recordset || [];
        } catch (error) {
            console.error(`Error al obtener solicitudes de matrícula nueva del año ${anio}:`, error.message);
            throw error;
        }
    },


    /**
     * Obtiene solicitudes de matrícula nueva por DNI del estudiante
     * @param {string} dni - DNI del estudiante
     * @returns {Promise<Array>} Lista de solicitudes
     */
    getByDniEstudiante: async (dni) => {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('dni', mssql.VarChar(8), dni)
                .query('SELECT * FROM solicitud_matricula_nueva WHERE dni_estudiante = @dni');
            return result.recordset || [];
        } catch (error) {
            console.error(`Error al obtener solicitudes de matrícula nueva con DNI ${dni}:`, error.message);
            throw error;
        }
    },

    /**
     * Crea una nueva solicitud de matrícula nueva
     * @param {Object} solicitud - Datos de la solicitud
     * @returns {Promise<Object>} Resultado de la operación
     */
    create: async (solicitud) => {
        try {
            const pool = await getConnection();
            const request = pool.request();

            // Configurar los parámetros
            request.input('nombre_estudiante', mssql.VarChar(100), solicitud.nombre_estudiante);
            request.input('dni_estudiante', mssql.VarChar(8), solicitud.dni_estudiante);
            request.input('fecha_nacimiento', mssql.Date, solicitud.fecha_nacimiento);
            request.input('genero', mssql.VarChar(10), solicitud.genero);
            request.input('grado_solicitado', mssql.VarChar(10), solicitud.grado_solicitado);
            request.input('direccion', mssql.VarChar(200), solicitud.direccion);
            request.input('nombre_apoderado', mssql.VarChar(100), solicitud.nombre_apoderado);
            request.input('dni_apoderado', mssql.VarChar(8), solicitud.dni_apoderado);
            request.input('parentesco', mssql.VarChar(50), solicitud.parentesco);
            request.input('ocupacion', mssql.VarChar(100), solicitud.ocupacion);
            request.input('grado_instruccion', mssql.VarChar(50), solicitud.grado_instruccion);
            request.input('telefono', mssql.VarChar(15), solicitud.telefono);
            request.input('email', mssql.VarChar(100), solicitud.email || null);
            request.input('direccion_apoderado', mssql.VarChar(200), solicitud.direccion_apoderado);
            request.input('anio_escolar', mssql.VarChar(4), solicitud.anio_escolar);
            request.input('fecha_solicitud', mssql.Date, solicitud.fecha_solicitud);
            request.input('estado', mssql.VarChar(20), solicitud.estado || 'pendiente');
            request.input('comentarios', mssql.VarChar(500), solicitud.comentarios || null);

            // Ejecutar la consulta
            const sql = `INSERT INTO solicitud_matricula_nueva (
                nombre_estudiante, dni_estudiante, fecha_nacimiento, genero, grado_solicitado,
                direccion, nombre_apoderado, dni_apoderado, parentesco, ocupacion,
                grado_instruccion, telefono, email, direccion_apoderado, anio_escolar,
                fecha_solicitud, estado, comentarios
            ) VALUES (
                @nombre_estudiante, @dni_estudiante, @fecha_nacimiento, @genero, @grado_solicitado,
                @direccion, @nombre_apoderado, @dni_apoderado, @parentesco, @ocupacion,
                @grado_instruccion, @telefono, @email, @direccion_apoderado, @anio_escolar,
                @fecha_solicitud, @estado, @comentarios
            );
            SELECT SCOPE_IDENTITY() AS id;`;

            const result = await request.query(sql);
            return { id: result.recordset[0].id };
        } catch (error) {
            console.error('Error al crear solicitud de matrícula nueva:', error.message);
            throw error;
        }
    },

    /**
     * Actualiza una solicitud de matrícula nueva existente
     * @param {number} id - ID de la solicitud
     * @param {Object} solicitud - Datos actualizados de la solicitud
     * @returns {Promise<Object>} Resultado de la operación
     */
    update: async (id, solicitud) => {
        try {
            const pool = await getConnection();
            const request = pool.request();

            // Configurar los parámetros
            request.input('id', mssql.Int, id);

            // Construir la consulta SQL dinámicamente
            let sql = 'UPDATE solicitud_matricula_nueva SET ';
            const updateFields = [];

            if (solicitud.nombre_estudiante !== undefined) {
                request.input('nombre_estudiante', mssql.VarChar(100), solicitud.nombre_estudiante);
                updateFields.push('nombre_estudiante = @nombre_estudiante');
            }
            if (solicitud.dni_estudiante !== undefined) {
                request.input('dni_estudiante', mssql.VarChar(8), solicitud.dni_estudiante);
                updateFields.push('dni_estudiante = @dni_estudiante');
            }
            if (solicitud.fecha_nacimiento !== undefined) {
                request.input('fecha_nacimiento', mssql.Date, solicitud.fecha_nacimiento);
                updateFields.push('fecha_nacimiento = @fecha_nacimiento');
            }
            if (solicitud.genero !== undefined) {
                request.input('genero', mssql.VarChar(10), solicitud.genero);
                updateFields.push('genero = @genero');
            }
            if (solicitud.grado_solicitado !== undefined) {
                request.input('grado_solicitado', mssql.VarChar(10), solicitud.grado_solicitado);
                updateFields.push('grado_solicitado = @grado_solicitado');
            }
            if (solicitud.direccion !== undefined) {
                request.input('direccion', mssql.VarChar(200), solicitud.direccion);
                updateFields.push('direccion = @direccion');
            }
            if (solicitud.nombre_apoderado !== undefined) {
                request.input('nombre_apoderado', mssql.VarChar(100), solicitud.nombre_apoderado);
                updateFields.push('nombre_apoderado = @nombre_apoderado');
            }
            if (solicitud.dni_apoderado !== undefined) {
                request.input('dni_apoderado', mssql.VarChar(8), solicitud.dni_apoderado);
                updateFields.push('dni_apoderado = @dni_apoderado');
            }
            if (solicitud.parentesco !== undefined) {
                request.input('parentesco', mssql.VarChar(50), solicitud.parentesco);
                updateFields.push('parentesco = @parentesco');
            }
            if (solicitud.ocupacion !== undefined) {
                request.input('ocupacion', mssql.VarChar(100), solicitud.ocupacion);
                updateFields.push('ocupacion = @ocupacion');
            }
            if (solicitud.grado_instruccion !== undefined) {
                request.input('grado_instruccion', mssql.VarChar(50), solicitud.grado_instruccion);
                updateFields.push('grado_instruccion = @grado_instruccion');
            }
            if (solicitud.telefono !== undefined) {
                request.input('telefono', mssql.VarChar(15), solicitud.telefono);
                updateFields.push('telefono = @telefono');
            }
            if (solicitud.email !== undefined) {
                request.input('email', mssql.VarChar(100), solicitud.email);
                updateFields.push('email = @email');
            }
            if (solicitud.direccion_apoderado !== undefined) {
                request.input('direccion_apoderado', mssql.VarChar(200), solicitud.direccion_apoderado);
                updateFields.push('direccion_apoderado = @direccion_apoderado');
            }
            if (solicitud.anio_escolar !== undefined) {
                request.input('anio_escolar', mssql.VarChar(4), solicitud.anio_escolar);
                updateFields.push('anio_escolar = @anio_escolar');
            }
            if (solicitud.fecha_solicitud !== undefined) {
                request.input('fecha_solicitud', mssql.Date, solicitud.fecha_solicitud);
                updateFields.push('fecha_solicitud = @fecha_solicitud');
            }
            if (solicitud.estado !== undefined) {
                request.input('estado', mssql.VarChar(20), solicitud.estado);
                updateFields.push('estado = @estado');
            }
            if (solicitud.comentarios !== undefined) {
                request.input('comentarios', mssql.VarChar(500), solicitud.comentarios);
                updateFields.push('comentarios = @comentarios');
            }

            // Si no hay campos para actualizar, retornar
            if (updateFields.length === 0) {
                return { affectedRows: 0 };
            }

            // Completar la consulta SQL
            sql += updateFields.join(', ') + ' WHERE id = @id';

            // Ejecutar la consulta
            const result = await request.query(sql);
            return { affectedRows: result.rowsAffected[0] };
        } catch (error) {
            console.error(`Error al actualizar solicitud de matrícula nueva con ID ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Elimina una solicitud de matrícula nueva
     * @param {number} id - ID de la solicitud
     * @returns {Promise<Object>} Resultado de la operación
     */
    delete: async (id) => {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('id', mssql.Int, id)
                .query('DELETE FROM solicitud_matricula_nueva WHERE id = @id');
            return { affectedRows: result.rowsAffected[0] };
        } catch (error) {
            console.error(`Error al eliminar solicitud de matrícula nueva con ID ${id}:`, error.message);
            throw error;
        }
    }
};
