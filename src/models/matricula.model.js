import { getConnection } from '../database/connection.js';
import mssql from 'mssql';

/**
 * Modelo para la tabla de matrículas
 */
export default {
    /**
     * Obtiene todas las matrículas
     * @returns {Promise<Array>} Lista de matrículas
     */
    getAll: async () => {
        try {
            const pool = await getConnection();

            // Consultar solicitudes de matrícula nueva
            const nuevaResult = await pool.request().query(`
                SELECT
                    id,
                    'nueva' as tipo_matricula,
                    nombre_estudiante as estudiante_nombre,
                    dni_estudiante,
                    grado_solicitado,
                    anio_escolar,
                    fecha_solicitud,
                    estado,
                    created_at,
                    updated_at
                FROM solicitud_matricula_nueva
            `);

            // Consultar solicitudes de traslado
            const trasladoResult = await pool.request().query(`
                SELECT
                    id,
                    'traslado' as tipo_matricula,
                    nombre_estudiante as estudiante_nombre,
                    dni_estudiante,
                    grado_solicitado,
                    anio_escolar,
                    fecha_solicitud,
                    estado,
                    colegio_anterior,
                    created_at,
                    updated_at
                FROM solicitud_traslado
            `);

            // Consultar solicitudes de siguiente grado
            const siguienteResult = await pool.request().query(`
                SELECT
                    s.id,
                    'siguiente' as tipo_matricula,
                    e.nombre as estudiante_nombre,
                    e.dni as dni_estudiante,
                    s.grado_siguiente as grado_solicitado,
                    s.anio_escolar_siguiente as anio_escolar,
                    s.fecha_solicitud,
                    s.estado,
                    s.created_at,
                    s.updated_at
                FROM solicitud_siguiente_grado s
                JOIN estudiantes e ON s.estudiante_id = e.id
            `);

            // Combinar los resultados
            const matriculas = [
                ...(nuevaResult.recordset || []),
                ...(trasladoResult.recordset || []),
                ...(siguienteResult.recordset || [])
            ];

            // Ordenar por fecha de solicitud (más reciente primero)
            matriculas.sort((a, b) => new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud));

            return matriculas;
        } catch (error) {
            console.error('Error al obtener matrículas:', error.message);
            throw error;
        }
    },

    /**
     * Obtiene una matrícula por su ID y tipo
     * @param {number} id - ID de la matrícula
     * @param {string} tipo - Tipo de matrícula ('nueva', 'traslado', 'siguiente')
     * @returns {Promise<Object>} Datos de la matrícula
     */
    getById: async (id, tipo = null) => {
        try {
            const pool = await getConnection();
            let result = null;

            // Si no se especifica el tipo, intentar buscar en todas las tablas
            if (!tipo) {
                // Intentar buscar en solicitud_matricula_nueva
                const nuevaResult = await pool.request()
                    .input('id', mssql.Int, id)
                    .query(`
                        SELECT
                            id,
                            'nueva' as tipo_matricula,
                            nombre_estudiante as estudiante_nombre,
                            dni_estudiante,
                            grado_solicitado,
                            anio_escolar,
                            fecha_solicitud,
                            estado,
                            created_at,
                            updated_at
                        FROM solicitud_matricula_nueva
                        WHERE id = @id
                    `);

                if (nuevaResult.recordset && nuevaResult.recordset.length > 0) {
                    return nuevaResult.recordset[0];
                }

                // Intentar buscar en solicitud_traslado
                const trasladoResult = await pool.request()
                    .input('id', mssql.Int, id)
                    .query(`
                        SELECT
                            id,
                            'traslado' as tipo_matricula,
                            nombre_estudiante as estudiante_nombre,
                            dni_estudiante,
                            grado_solicitado,
                            anio_escolar,
                            fecha_solicitud,
                            estado,
                            colegio_anterior,
                            created_at,
                            updated_at
                        FROM solicitud_traslado
                        WHERE id = @id
                    `);

                if (trasladoResult.recordset && trasladoResult.recordset.length > 0) {
                    return trasladoResult.recordset[0];
                }

                // Intentar buscar en solicitud_siguiente_grado
                const siguienteResult = await pool.request()
                    .input('id', mssql.Int, id)
                    .query(`
                        SELECT
                            s.id,
                            'siguiente' as tipo_matricula,
                            e.nombre as estudiante_nombre,
                            e.dni as dni_estudiante,
                            s.grado_siguiente as grado_solicitado,
                            s.anio_escolar_siguiente as anio_escolar,
                            s.fecha_solicitud,
                            s.estado,
                            s.created_at,
                            s.updated_at
                        FROM solicitud_siguiente_grado s
                        JOIN estudiantes e ON s.estudiante_id = e.id
                        WHERE s.id = @id
                    `);

                if (siguienteResult.recordset && siguienteResult.recordset.length > 0) {
                    return siguienteResult.recordset[0];
                }

                // No se encontró en ninguna tabla
                return null;
            }

            // Si se especifica el tipo, buscar solo en la tabla correspondiente
            switch (tipo.toLowerCase()) {
                case 'nueva':
                    result = await pool.request()
                        .input('id', mssql.Int, id)
                        .query(`
                            SELECT
                                id,
                                'nueva' as tipo_matricula,
                                nombre_estudiante as estudiante_nombre,
                                dni_estudiante,
                                grado_solicitado,
                                anio_escolar,
                                fecha_solicitud,
                                estado,
                                created_at,
                                updated_at
                            FROM solicitud_matricula_nueva
                            WHERE id = @id
                        `);
                    break;
                case 'traslado':
                    result = await pool.request()
                        .input('id', mssql.Int, id)
                        .query(`
                            SELECT
                                id,
                                'traslado' as tipo_matricula,
                                nombre_estudiante as estudiante_nombre,
                                dni_estudiante,
                                grado_solicitado,
                                anio_escolar,
                                fecha_solicitud,
                                estado,
                                colegio_anterior,
                                created_at,
                                updated_at
                            FROM solicitud_traslado
                            WHERE id = @id
                        `);
                    break;
                case 'siguiente':
                    result = await pool.request()
                        .input('id', mssql.Int, id)
                        .query(`
                            SELECT
                                s.id,
                                'siguiente' as tipo_matricula,
                                e.nombre as estudiante_nombre,
                                e.dni as dni_estudiante,
                                s.grado_siguiente as grado_solicitado,
                                s.anio_escolar_siguiente as anio_escolar,
                                s.fecha_solicitud,
                                s.estado,
                                s.created_at,
                                s.updated_at
                            FROM solicitud_siguiente_grado s
                            JOIN estudiantes e ON s.estudiante_id = e.id
                            WHERE s.id = @id
                        `);
                    break;
                default:
                    throw new Error(`Tipo de matrícula no válido: ${tipo}`);
            }

            return result.recordset[0] || null;
        } catch (error) {
            console.error(`Error al obtener matrícula con ID ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Obtiene todas las matrículas de un estudiante
     * @param {number} estudianteId - ID del estudiante
     * @returns {Promise<Array>} Lista de matrículas
     */
    getByEstudiante: async (estudianteId) => {
        try {
            const pool = await getConnection();

            // Primero obtenemos el DNI del estudiante
            const estudianteResult = await pool.request()
                .input('estudianteId', mssql.Int, estudianteId)
                .query('SELECT dni FROM estudiantes WHERE id = @estudianteId');

            if (!estudianteResult.recordset || estudianteResult.recordset.length === 0) {
                console.error(`No se encontró estudiante con ID ${estudianteId}`);
                return [];
            }

            const dniEstudiante = estudianteResult.recordset[0].dni;

            // Consultar solicitudes de matrícula nueva
            const nuevaResult = await pool.request()
                .input('dniEstudiante', mssql.VarChar(20), dniEstudiante)
                .query(`
                    SELECT
                        id,
                        'nueva' as tipo_matricula,
                        nombre_estudiante as estudiante_nombre,
                        dni_estudiante,
                        grado_solicitado,
                        anio_escolar,
                        fecha_solicitud,
                        estado,
                        created_at,
                        updated_at
                    FROM solicitud_matricula_nueva
                    WHERE dni_estudiante = @dniEstudiante
                `);

            // Consultar solicitudes de traslado
            const trasladoResult = await pool.request()
                .input('dniEstudiante', mssql.VarChar(20), dniEstudiante)
                .query(`
                    SELECT
                        id,
                        'traslado' as tipo_matricula,
                        nombre_estudiante as estudiante_nombre,
                        dni_estudiante,
                        grado_solicitado,
                        anio_escolar,
                        fecha_solicitud,
                        estado,
                        colegio_anterior,
                        created_at,
                        updated_at
                    FROM solicitud_traslado
                    WHERE dni_estudiante = @dniEstudiante
                `);

            // Consultar solicitudes de siguiente grado
            const siguienteResult = await pool.request()
                .input('estudianteId', mssql.Int, estudianteId)
                .query(`
                    SELECT
                        s.id,
                        'siguiente' as tipo_matricula,
                        e.nombre as estudiante_nombre,
                        e.dni as dni_estudiante,
                        s.grado_siguiente as grado_solicitado,
                        s.anio_escolar_siguiente as anio_escolar,
                        s.fecha_solicitud,
                        s.estado,
                        s.created_at,
                        s.updated_at
                    FROM solicitud_siguiente_grado s
                    JOIN estudiantes e ON s.estudiante_id = e.id
                    WHERE s.estudiante_id = @estudianteId
                `);

            // Combinar los resultados
            const matriculas = [
                ...(nuevaResult.recordset || []),
                ...(trasladoResult.recordset || []),
                ...(siguienteResult.recordset || [])
            ];

            // Ordenar por fecha de solicitud (más reciente primero)
            matriculas.sort((a, b) => new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud));

            return matriculas;
        } catch (error) {
            console.error(`Error al obtener matrículas del estudiante ${estudianteId}:`, error.message);
            throw error;
        }
    },

    /**
     * Obtiene matrículas por año escolar
     * @param {string} anio - Año escolar (formato: YYYY)
     * @returns {Promise<Array>} Lista de matrículas
     */
    getByAño: async (anio) => {
        try {
            const pool = await getConnection();

            // Consultar solicitudes de matrícula nueva
            const nuevaResult = await pool.request()
                .input('anio', mssql.VarChar(4), anio)
                .query(`
                    SELECT
                        id,
                        'nueva' as tipo_matricula,
                        nombre_estudiante as estudiante_nombre,
                        dni_estudiante,
                        grado_solicitado,
                        anio_escolar,
                        fecha_solicitud,
                        estado,
                        created_at,
                        updated_at
                    FROM solicitud_matricula_nueva
                    WHERE anio_escolar = @anio
                `);

            // Consultar solicitudes de traslado
            const trasladoResult = await pool.request()
                .input('anio', mssql.VarChar(4), anio)
                .query(`
                    SELECT
                        id,
                        'traslado' as tipo_matricula,
                        nombre_estudiante as estudiante_nombre,
                        dni_estudiante,
                        grado_solicitado,
                        anio_escolar,
                        fecha_solicitud,
                        estado,
                        colegio_anterior,
                        created_at,
                        updated_at
                    FROM solicitud_traslado
                    WHERE anio_escolar = @anio
                `);

            // Consultar solicitudes de siguiente grado
            const siguienteResult = await pool.request()
                .input('anio', mssql.VarChar(4), anio)
                .query(`
                    SELECT
                        s.id,
                        'siguiente' as tipo_matricula,
                        e.nombre as estudiante_nombre,
                        e.dni as dni_estudiante,
                        s.grado_siguiente as grado_solicitado,
                        s.anio_escolar_siguiente as anio_escolar,
                        s.fecha_solicitud,
                        s.estado,
                        s.created_at,
                        s.updated_at
                    FROM solicitud_siguiente_grado s
                    JOIN estudiantes e ON s.estudiante_id = e.id
                    WHERE s.anio_escolar_siguiente = @anio
                `);

            // Combinar los resultados
            const matriculas = [
                ...(nuevaResult.recordset || []),
                ...(trasladoResult.recordset || []),
                ...(siguienteResult.recordset || [])
            ];

            // Ordenar por fecha de solicitud (más reciente primero)
            matriculas.sort((a, b) => new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud));

            return matriculas;
        } catch (error) {
            console.error(`Error al obtener matrículas del año ${anio}:`, error.message);
            throw error;
        }
    },

    /**
     * Crea una nueva matrícula
     * @param {Object} matricula - Datos de la matrícula
     * @returns {Promise<Object>} Resultado de la operación
     */
    create: async (matricula) => {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('estudiante_id', mssql.Int, matricula.estudiante_id)
                .input('tipo_matricula', mssql.NVarChar(20), matricula.tipo_matricula)
                .input('año_escolar', mssql.VarChar(4), matricula.año_escolar)
                .input('fecha_matricula', mssql.Date, new Date(matricula.fecha_matricula))
                .input('estado', mssql.NVarChar(20), matricula.estado || 'pendiente')
                .input('colegio_anterior', mssql.NVarChar(255), matricula.colegio_anterior || null)
                .query(`
                    INSERT INTO matriculas (estudiante_id, tipo_matricula, año_escolar, fecha_matricula, estado, colegio_anterior)
                    OUTPUT INSERTED.id
                    VALUES (@estudiante_id, @tipo_matricula, @año_escolar, @fecha_matricula, @estado, @colegio_anterior)
                `);

            return { id: result.recordset[0].id };
        } catch (error) {
            console.error('Error al crear matrícula:', error.message);
            throw error;
        }
    },

    /**
     * Actualiza una matrícula existente
     * @param {number} id - ID de la matrícula
     * @param {Object} matricula - Datos actualizados de la matrícula
     * @returns {Promise<Object>} Resultado de la operación
     */
    update: async (id, matricula) => {
        try {
            const pool = await getConnection();
            const request = pool.request()
                .input('id', mssql.Int, id);

            // Construir la consulta dinámicamente
            let query = 'UPDATE matriculas SET ';
            const updateFields = [];

            if (matricula.estudiante_id !== undefined) {
                request.input('estudiante_id', mssql.Int, matricula.estudiante_id);
                updateFields.push('estudiante_id = @estudiante_id');
            }

            if (matricula.tipo_matricula !== undefined) {
                request.input('tipo_matricula', mssql.NVarChar(20), matricula.tipo_matricula);
                updateFields.push('tipo_matricula = @tipo_matricula');
            }

            if (matricula.año_escolar !== undefined) {
                request.input('año_escolar', mssql.VarChar(4), matricula.año_escolar);
                updateFields.push('año_escolar = @año_escolar');
            }

            if (matricula.fecha_matricula !== undefined) {
                request.input('fecha_matricula', mssql.Date, new Date(matricula.fecha_matricula));
                updateFields.push('fecha_matricula = @fecha_matricula');
            }

            if (matricula.estado !== undefined) {
                request.input('estado', mssql.NVarChar(20), matricula.estado);
                updateFields.push('estado = @estado');
            }

            if (matricula.colegio_anterior !== undefined) {
                request.input('colegio_anterior', mssql.NVarChar(255), matricula.colegio_anterior);
                updateFields.push('colegio_anterior = @colegio_anterior');
            }

            // Si no hay campos para actualizar, retornar
            if (updateFields.length === 0) {
                return { affectedRows: 0 };
            }

            query += updateFields.join(', ') + ' WHERE id = @id';

            const result = await request.query(query);
            return { affectedRows: result.rowsAffected[0] };
        } catch (error) {
            console.error(`Error al actualizar matrícula con ID ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Elimina una matrícula
     * @param {number} id - ID de la matrícula
     * @returns {Promise<Object>} Resultado de la operación
     */
    delete: async (id) => {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('id', mssql.Int, id)
                .query('DELETE FROM matriculas WHERE id = @id');

            return { affectedRows: result.rowsAffected[0] };
        } catch (error) {
            console.error(`Error al eliminar matrícula con ID ${id}:`, error.message);
            throw error;
        }
    }
};
