import db from '../database/connection.js';

/**
 * Modelo para la tabla de estudiantes
 */
export default {
    /**
     * Obtiene todos los estudiantes
     * @returns {Promise<Array>} Lista de estudiantes
     */
    getAll: async () => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request().query('SELECT * FROM estudiantes');
            return result.recordset;
        } catch (error) {
            console.error('Error al obtener estudiantes:', error.message);
            throw error;
        }
    },

    /**
     * Obtiene un estudiante por su ID
     * @param {number} id - ID del estudiante
     * @returns {Promise<Object>} Datos del estudiante
     */
    getById: async (id) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('id', db.sql.Int, id)
                .query('SELECT * FROM estudiantes WHERE id = @id');
            
            return result.recordset[0];
        } catch (error) {
            console.error(`Error al obtener estudiante con ID ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Crea un nuevo estudiante
     * @param {Object} estudiante - Datos del estudiante
     * @returns {Promise<Object>} Resultado de la operación
     */
    create: async (estudiante) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('nombre', db.sql.NVarChar(255), estudiante.nombre)
                .input('dni', db.sql.Char(8), estudiante.dni)
                .input('fecha_nacimiento', db.sql.Date, new Date(estudiante.fecha_nacimiento))
                .input('genero', db.sql.Char(1), estudiante.genero)
                .input('grado', db.sql.Int, estudiante.grado)
                .input('direccion', db.sql.NVarChar(255), estudiante.direccion)
                .query(`
                    INSERT INTO estudiantes (nombre, dni, fecha_nacimiento, genero, grado, direccion)
                    OUTPUT INSERTED.id
                    VALUES (@nombre, @dni, @fecha_nacimiento, @genero, @grado, @direccion)
                `);
            
            return { id: result.recordset[0].id };
        } catch (error) {
            console.error('Error al crear estudiante:', error.message);
            throw error;
        }
    },

    /**
     * Actualiza un estudiante existente
     * @param {number} id - ID del estudiante
     * @param {Object} estudiante - Datos actualizados del estudiante
     * @returns {Promise<Object>} Resultado de la operación
     */
    update: async (id, estudiante) => {
        try {
            const pool = await db.getConnection();
            const request = pool.request()
                .input('id', db.sql.Int, id);
            
            // Construir la consulta dinámicamente
            let query = 'UPDATE estudiantes SET ';
            const updateFields = [];
            
            if (estudiante.nombre !== undefined) {
                request.input('nombre', db.sql.NVarChar(255), estudiante.nombre);
                updateFields.push('nombre = @nombre');
            }
            
            if (estudiante.dni !== undefined) {
                request.input('dni', db.sql.Char(8), estudiante.dni);
                updateFields.push('dni = @dni');
            }
            
            if (estudiante.fecha_nacimiento !== undefined) {
                request.input('fecha_nacimiento', db.sql.Date, new Date(estudiante.fecha_nacimiento));
                updateFields.push('fecha_nacimiento = @fecha_nacimiento');
            }
            
            if (estudiante.genero !== undefined) {
                request.input('genero', db.sql.Char(1), estudiante.genero);
                updateFields.push('genero = @genero');
            }
            
            if (estudiante.grado !== undefined) {
                request.input('grado', db.sql.Int, estudiante.grado);
                updateFields.push('grado = @grado');
            }
            
            if (estudiante.direccion !== undefined) {
                request.input('direccion', db.sql.NVarChar(255), estudiante.direccion);
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
            console.error(`Error al actualizar estudiante con ID ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Elimina un estudiante
     * @param {number} id - ID del estudiante
     * @returns {Promise<Object>} Resultado de la operación
     */
    delete: async (id) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('id', db.sql.Int, id)
                .query('DELETE FROM estudiantes WHERE id = @id');
            
            return { affectedRows: result.rowsAffected[0] };
        } catch (error) {
            console.error(`Error al eliminar estudiante con ID ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Verifica si un estudiante puede ser promovido al siguiente grado
     * @param {string} dni - DNI del estudiante
     * @returns {Promise<Object>} Resultado de la verificación
     */
    verificarPromocion: async (dni) => {
        try {
            const pool = await db.getConnection();
            const result = await pool.request()
                .input('dni', db.sql.Char(8), dni)
                .query(`
                    SELECT 
                        e.id,
                        e.nombre,
                        e.dni,
                        e.fecha_nacimiento,
                        e.genero,
                        e.grado_actual,
                        e.direccion,
                        e.estado,
                        e.fecha_ingreso,
                        a.id as apoderado_id,
                        a.nombre as apoderado_nombre,
                        a.dni as apoderado_dni,
                        a.parentesco,
                        a.ocupacion,
                        a.grado_instruccion,
                        a.telefono as apoderado_telefono,
                        a.email as apoderado_email,
                        a.direccion as apoderado_direccion,
                        rae.es_principal,
                        CASE 
                            WHEN e.grado_actual < 6 AND e.estado = 'activo' THEN 1 
                            ELSE 0 
                        END as puede_promocionar
                    FROM estudiantes e
                    LEFT JOIN relaciones_apoderado_estudiante rae ON e.id = rae.estudiante_id
                    LEFT JOIN apoderados a ON rae.apoderado_id = a.id
                    WHERE e.dni = @dni
                `);
            
            if (result.recordset.length === 0) {
                throw new Error('Estudiante no encontrado');
            }

            const estudiante = result.recordset[0];
            
            // Preparar la información del apoderado si existe
            const apoderado = estudiante.apoderado_id ? {
                id: estudiante.apoderado_id,
                nombre: estudiante.apoderado_nombre,
                dni: estudiante.apoderado_dni,
                parentesco: estudiante.parentesco,
                ocupacion: estudiante.ocupacion,
                grado_instruccion: estudiante.grado_instruccion,
                telefono: estudiante.apoderado_telefono,
                email: estudiante.apoderado_email,
                direccion: estudiante.apoderado_direccion,
                es_principal: estudiante.es_principal
            } : null;

            // Verificar si el estudiante está activo
            if (estudiante.estado !== 'activo') {
                return {
                    puede_promocionar: false,
                    estudiante: {
                        id: estudiante.id,
                        nombre: estudiante.nombre,
                        dni: estudiante.dni,
                        fecha_nacimiento: estudiante.fecha_nacimiento,
                        genero: estudiante.genero,
                        grado_actual: estudiante.grado_actual,
                        direccion: estudiante.direccion,
                        estado: estudiante.estado,
                        fecha_ingreso: estudiante.fecha_ingreso
                    },
                    apoderado,
                    mensaje: `El estudiante no puede ser promovido porque su estado es ${estudiante.estado}`
                };
            }

            return {
                puede_promocionar: estudiante.puede_promocionar === 1,
                estudiante: {
                    id: estudiante.id,
                    nombre: estudiante.nombre,
                    dni: estudiante.dni,
                    fecha_nacimiento: estudiante.fecha_nacimiento,
                    genero: estudiante.genero,
                    grado_actual: estudiante.grado_actual,
                    grado_siguiente: estudiante.grado_actual < 6 ? estudiante.grado_actual + 1 : 6,
                    direccion: estudiante.direccion,
                    estado: estudiante.estado,
                    fecha_ingreso: estudiante.fecha_ingreso
                },
                apoderado,
                mensaje: estudiante.puede_promocionar === 1 
                    ? `El estudiante puede ser promovido al grado ${estudiante.grado_actual + 1}`
                    : estudiante.grado_actual >= 6 
                        ? 'El estudiante ya está en el último grado (6to)'
                        : 'El estudiante no cumple con los requisitos para ser promovido'
            };
        } catch (error) {
            console.error('Error al verificar promoción del estudiante:', error.message);
            throw error;
        }
    }
};
