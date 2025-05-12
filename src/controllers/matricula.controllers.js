import matriculaModel from '../models/matricula.model.js';
import estudianteModel from '../models/estudiante.model.js';
import { getConnection } from '../database/db.js';
import mssql from 'mssql';

/**
 * Obtiene todas las matrículas
 */
export const getMatriculas = async (req, res) => {
    try {
        const matriculas = await matriculaModel.getAll();
        res.json(matriculas);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener matrículas",
            error: error.message
        });
    }
};

/**
 * Obtiene una matrícula por su ID
 */
export const getMatricula = async (req, res) => {
    try {
        const { id } = req.params;
        const matricula = await matriculaModel.getById(parseInt(id));

        if (matricula) {
            res.json(matricula);
        } else {
            res.status(404).json({ message: "Matrícula no encontrada" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener la matrícula",
            error: error.message
        });
    }
};

/**
 * Obtiene todas las matrículas de un estudiante
 */
export const getMatriculasByEstudiante = async (req, res) => {
    try {
        const { estudianteId } = req.params;

        // Verificar que el estudiante existe
        const estudiante = await estudianteModel.getById(parseInt(estudianteId));
        if (!estudiante) {
            return res.status(404).json({ message: "Estudiante no encontrado" });
        }

        const matriculas = await matriculaModel.getByEstudiante(parseInt(estudianteId));
        res.json(matriculas);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener las matrículas del estudiante",
            error: error.message
        });
    }
};

/**
 * Obtiene matrículas por año escolar
 */
export const getMatriculasByAño = async (req, res) => {
    try {
        const { año } = req.params;

        // Validar formato de año (4 dígitos)
        if (!/^\d{4}$/.test(año)) {
            return res.status(400).json({ message: "El año debe tener 4 dígitos numéricos" });
        }

        const matriculas = await matriculaModel.getByAño(año);
        res.json(matriculas);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener las matrículas por año",
            error: error.message
        });
    }
};

/**
 * Crea una matrícula nueva
 */
export const createMatriculaNueva = async (req, res) => {
    try {
        const {
            nombre_estudiante,
            dni_estudiante,
            fecha_nacimiento,
            genero,
            grado_solicitado,
            direccion,
            nombre_apoderado,
            dni_apoderado,
            parentesco,
            ocupacion,
            grado_instruccion,
            telefono,
            email,
            direccion_apoderado,
            anio_escolar,
            fecha_solicitud,
            comentarios
        } = req.body;

        // Validar campos requeridos
        if (!nombre_estudiante || !dni_estudiante || !fecha_nacimiento || !genero ||
            !grado_solicitado || !direccion || !nombre_apoderado || !dni_apoderado ||
            !parentesco || !ocupacion || !grado_instruccion || !telefono ||
            !direccion_apoderado || !anio_escolar || !fecha_solicitud) {
            return res.status(400).json({
                message: "Todos los campos son requeridos excepto email y comentarios"
            });
        }

        // Insertar en la tabla solicitud_matricula_nueva
        const pool = await getConnection();
        const result = await pool.request()
            .input('nombre_estudiante', mssql.VarChar(100), nombre_estudiante)
            .input('dni_estudiante', mssql.VarChar(20), dni_estudiante)
            .input('fecha_nacimiento', mssql.Date, fecha_nacimiento)
            .input('genero', mssql.VarChar(10), genero)
            .input('grado_solicitado', mssql.Int, grado_solicitado)
            .input('direccion', mssql.NVarChar(mssql.MAX), direccion)
            .input('nombre_apoderado', mssql.VarChar(100), nombre_apoderado)
            .input('dni_apoderado', mssql.VarChar(20), dni_apoderado)
            .input('parentesco', mssql.VarChar(50), parentesco)
            .input('ocupacion', mssql.VarChar(100), ocupacion)
            .input('grado_instruccion', mssql.VarChar(50), grado_instruccion)
            .input('telefono', mssql.VarChar(20), telefono)
            .input('email', mssql.VarChar(100), email || null)
            .input('direccion_apoderado', mssql.NVarChar(mssql.MAX), direccion_apoderado)
            .input('anio_escolar', mssql.VarChar(4), anio_escolar)
            .input('fecha_solicitud', mssql.Date, new Date(fecha_solicitud))
            .input('comentarios', mssql.NVarChar(mssql.MAX), comentarios || null)
            .query(`
                INSERT INTO solicitud_matricula_nueva (
                    nombre_estudiante, dni_estudiante, fecha_nacimiento, genero,
                    grado_solicitado, direccion, nombre_apoderado, dni_apoderado,
                    parentesco, ocupacion, grado_instruccion, telefono, email,
                    direccion_apoderado, anio_escolar, fecha_solicitud, comentarios
                )
                VALUES (
                    @nombre_estudiante, @dni_estudiante, @fecha_nacimiento, @genero,
                    @grado_solicitado, @direccion, @nombre_apoderado, @dni_apoderado,
                    @parentesco, @ocupacion, @grado_instruccion, @telefono, @email,
                    @direccion_apoderado, @anio_escolar, @fecha_solicitud, @comentarios
                );
                SELECT SCOPE_IDENTITY() AS id;
            `);

        res.status(201).json({
            message: "Solicitud de matrícula nueva creada con éxito",
            id: result.recordset[0].id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al crear la solicitud de matrícula nueva",
            error: error.message
        });
    }
};

/**
 * Crea una matrícula de traslado
 */
export const createMatriculaTraslado = async (req, res) => {
    try {
        // Verificar si la tabla existe
        try {
            const pool = await getConnection();
            const tablesResult = await pool.request().query(`
                SELECT TABLE_NAME
                FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_TYPE = 'BASE TABLE'
            `);

            console.log('Tablas disponibles en la base de datos:', tablesResult.recordset.map(t => t.TABLE_NAME));

            // Verificar si la tabla solicitud_traslado existe
            const tableExists = tablesResult.recordset.some(t => t.TABLE_NAME.toLowerCase() === 'solicitud_traslado');
            console.log('¿Existe la tabla solicitud_traslado?', tableExists);

            if (!tableExists) {
                return res.status(500).json({
                    message: "La tabla 'solicitud_traslado' no existe en la base de datos",
                    availableTables: tablesResult.recordset.map(t => t.TABLE_NAME)
                });
            }
        } catch (error) {
            console.error('Error al verificar la existencia de la tabla:', error);
        }

        const {
            nombre_estudiante,
            dni_estudiante,
            fecha_nacimiento,
            genero,
            grado_solicitado,
            direccion,
            nombre_apoderado,
            dni_apoderado,
            parentesco,
            ocupacion,
            grado_instruccion,
            telefono,
            email,
            direccion_apoderado,
            colegio_anterior,
            motivo_traslado,
            anio_escolar,
            fecha_solicitud,
            comentarios
        } = req.body;

        // Validar campos requeridos
        if (!nombre_estudiante || !dni_estudiante || !fecha_nacimiento || !genero ||
            !grado_solicitado || !direccion || !nombre_apoderado || !dni_apoderado ||
            !parentesco || !ocupacion || !grado_instruccion || !telefono ||
            !direccion_apoderado || !anio_escolar || !fecha_solicitud || !colegio_anterior) {
            return res.status(400).json({
                message: "Todos los campos son requeridos excepto email, motivo_traslado y comentarios"
            });
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('nombre_estudiante', mssql.VarChar(100), nombre_estudiante)
            .input('dni_estudiante', mssql.VarChar(20), dni_estudiante)
            .input('fecha_nacimiento', mssql.Date, fecha_nacimiento)
            .input('genero', mssql.VarChar(10), genero)
            .input('grado_solicitado', mssql.Int, grado_solicitado)
            .input('direccion', mssql.NVarChar(mssql.MAX), direccion)
            .input('nombre_apoderado', mssql.VarChar(100), nombre_apoderado)
            .input('dni_apoderado', mssql.VarChar(20), dni_apoderado)
            .input('parentesco', mssql.VarChar(50), parentesco)
            .input('ocupacion', mssql.VarChar(100), ocupacion)
            .input('grado_instruccion', mssql.VarChar(50), grado_instruccion)
            .input('telefono', mssql.VarChar(20), telefono)
            .input('email', mssql.VarChar(100), email || null)
            .input('direccion_apoderado', mssql.NVarChar(mssql.MAX), direccion_apoderado)
            .input('colegio_anterior', mssql.VarChar(255), colegio_anterior)
            .input('motivo_traslado', mssql.VarChar(255), motivo_traslado || '')
            .input('anio_escolar', mssql.VarChar(4), anio_escolar)
            .input('fecha_solicitud', mssql.Date, new Date(fecha_solicitud))
            .input('comentarios', mssql.VarChar(mssql.MAX), comentarios || null)
            .query(`
                INSERT INTO solicitud_traslado (
                    nombre_estudiante, dni_estudiante, fecha_nacimiento, genero,
                    grado_solicitado, direccion, nombre_apoderado, dni_apoderado,
                    parentesco, ocupacion, grado_instruccion, telefono, email,
                    direccion_apoderado, colegio_anterior, motivo_traslado, anio_escolar, fecha_solicitud, comentarios
                )
                VALUES (
                    @nombre_estudiante, @dni_estudiante, @fecha_nacimiento, @genero,
                    @grado_solicitado, @direccion, @nombre_apoderado, @dni_apoderado,
                    @parentesco, @ocupacion, @grado_instruccion, @telefono, @email,
                    @direccion_apoderado, @colegio_anterior, @motivo_traslado, @anio_escolar, @fecha_solicitud, @comentarios
                );
                SELECT SCOPE_IDENTITY() AS id;
            `);

        res.status(201).json({
            message: "Solicitud de matrícula de traslado creada con éxito",
            id: result.recordset[0].id
        });
    } catch (error) {
        console.error('Error detallado en traslado:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            message: "Error al crear la solicitud de matrícula de traslado",
            error: error.message,
            details: error.stack
        });
    }
};

/**
 * Crea una matrícula para siguiente grado
 */
export const createMatriculaSiguiente = async (req, res) => {
    try {
        const {
            estudiante_id,
            grado_actual,
            grado_siguiente,
            anio_escolar_actual,
            anio_escolar_siguiente,
            fecha_solicitud,
            comentarios
        } = req.body;

        // Log request data for debugging
        console.log('Datos recibidos:', req.body);

        // Validar campos requeridos
        if (!estudiante_id || !grado_actual || !grado_siguiente ||
            !anio_escolar_actual || !anio_escolar_siguiente || !fecha_solicitud) {
            const missingFields = [];
            if (!estudiante_id) missingFields.push('estudiante_id');
            if (!grado_actual) missingFields.push('grado_actual');
            if (!grado_siguiente) missingFields.push('grado_siguiente');
            if (!anio_escolar_actual) missingFields.push('anio_escolar_actual');
            if (!anio_escolar_siguiente) missingFields.push('anio_escolar_siguiente');
            if (!fecha_solicitud) missingFields.push('fecha_solicitud');

            return res.status(400).json({
                message: "Campos requeridos faltantes",
                details: `Los siguientes campos son requeridos: ${missingFields.join(', ')}`
            });
        }

        // Validar formato de años escolares (4 dígitos)
        if (!/^\d{4}$/.test(anio_escolar_actual) || !/^\d{4}$/.test(anio_escolar_siguiente)) {
            return res.status(400).json({
                message: "Formato de año inválido",
                details: "Los años escolares deben tener 4 dígitos numéricos"
            });
        }

        // Verificar que el estudiante existe
        const estudiante = await estudianteModel.getById(parseInt(estudiante_id));
        if (!estudiante) {
            return res.status(404).json({
                message: "Estudiante no encontrado",
                details: `No se encontró un estudiante con ID ${estudiante_id}`
            });
        }

        // Validar fecha
        let fechaSolicitudObj;
        try {
            fechaSolicitudObj = new Date(fecha_solicitud);
            if (isNaN(fechaSolicitudObj.getTime())) {
                throw new Error('Fecha inválida');
            }
        } catch (error) {
            return res.status(400).json({
                message: "Formato de fecha inválido",
                details: "La fecha debe estar en formato YYYY-MM-DD"
            });
        }

        // Insertar en la tabla solicitud_siguiente_grado
        const pool = await getConnection();
        const result = await pool.request()
            .input('estudiante_id', mssql.Int, parseInt(estudiante_id))
            .input('grado_actual', mssql.Int, parseInt(grado_actual))
            .input('grado_siguiente', mssql.Int, parseInt(grado_siguiente))
            .input('anio_escolar_actual', mssql.VarChar(4), anio_escolar_actual)
            .input('anio_escolar_siguiente', mssql.VarChar(4), anio_escolar_siguiente)
            .input('fecha_solicitud', mssql.Date, fechaSolicitudObj)
            .input('comentarios', mssql.NVarChar(mssql.MAX), comentarios || null)
            .query(`
                INSERT INTO solicitud_siguiente_grado (
                    estudiante_id, grado_actual, grado_siguiente,
                    anio_escolar_actual, anio_escolar_siguiente,
                    fecha_solicitud, comentarios
                )
                OUTPUT INSERTED.id
                VALUES (
                    @estudiante_id, @grado_actual, @grado_siguiente,
                    @anio_escolar_actual, @anio_escolar_siguiente,
                    @fecha_solicitud, @comentarios
                );
            `);

        res.status(201).json({
            message: "Solicitud de siguiente grado creada con éxito",
            id: result.recordset[0].id
        });
    } catch (error) {
        console.error('Error detallado:', error);
        res.status(500).json({
            message: "Error al crear la solicitud de siguiente grado",
            error: error.message,
            details: error.stack
        });
    }
};

/**
 * Actualiza una matrícula existente
 */
export const updateMatricula = async (req, res) => {
    try {
        const { id } = req.params;
        const { estudiante_id, tipo_matricula, año_escolar, fecha_matricula, estado, colegio_anterior } = req.body;

        // Verificar que se envió al menos un campo para actualizar
        if (!estudiante_id && !tipo_matricula && !año_escolar && !fecha_matricula && !estado && colegio_anterior === undefined) {
            return res.status(400).json({ message: "No hay datos para actualizar" });
        }

        // Validar formato de año escolar si se proporciona
        if (año_escolar && !/^\d{4}$/.test(año_escolar)) {
            return res.status(400).json({ message: "El año escolar debe tener 4 dígitos numéricos" });
        }

        // Validar tipo de matrícula si se proporciona
        if (tipo_matricula) {
            const tiposValidos = ['nuevo', 'traslado', 'siguiente'];
            if (!tiposValidos.includes(tipo_matricula)) {
                return res.status(400).json({
                    message: "El tipo de matrícula debe ser uno de los siguientes: nuevo, traslado, siguiente"
                });
            }
        }

        // Validar estado si se proporciona
        if (estado) {
            const estadosValidos = ['pendiente', 'aprobada', 'rechazada'];
            if (!estadosValidos.includes(estado)) {
                return res.status(400).json({
                    message: "El estado debe ser uno de los siguientes: pendiente, aprobada, rechazada"
                });
            }
        }

        // Verificar que el estudiante existe si se proporciona
        if (estudiante_id) {
            const estudiante = await estudianteModel.getById(parseInt(estudiante_id));
            if (!estudiante) {
                return res.status(404).json({ message: "Estudiante no encontrado" });
            }
        }

        // Preparar objeto con datos a actualizar
        const matriculaData = {};
        if (estudiante_id) matriculaData.estudiante_id = parseInt(estudiante_id);
        if (tipo_matricula) matriculaData.tipo_matricula = tipo_matricula;
        if (año_escolar) matriculaData.año_escolar = año_escolar;
        if (fecha_matricula) matriculaData.fecha_matricula = fecha_matricula;
        if (estado) matriculaData.estado = estado;
        if (colegio_anterior !== undefined) matriculaData.colegio_anterior = colegio_anterior;

        // Actualizar la matrícula
        const result = await matriculaModel.update(parseInt(id), matriculaData);

        if (result.affectedRows > 0) {
            res.json({ message: "Matrícula actualizada con éxito" });
        } else {
            res.status(404).json({ message: "Matrícula no encontrada o sin cambios" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al actualizar la matrícula",
            error: error.message
        });
    }
};

/**
 * Elimina una matrícula
 */
export const deleteMatricula = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await matriculaModel.delete(parseInt(id));

        if (result.affectedRows > 0) {
            res.json({ message: "Matrícula eliminada con éxito" });
        } else {
            res.status(404).json({ message: "Matrícula no encontrada o ya fue eliminada" });
        }
    } catch (error) {
        console.error(error);

        // Manejar errores de restricción de clave foránea
        if (error.message.includes('REFERENCE constraint')) {
            return res.status(400).json({
                message: "No se puede eliminar la matrícula porque tiene documentos asociados"
            });
        }

        res.status(500).json({
            message: "Error al eliminar la matrícula",
            error: error.message
        });
    }
};
