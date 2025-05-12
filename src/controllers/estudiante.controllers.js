import estudianteModel from '../models/estudiante.model.js';
import { pool } from '../database/db.js';
import { getConnection } from '../database/db.js';
import mssql from 'mssql';

/**
 * Obtiene todos los estudiantes
 */
export const getEstudiantes = async (req, res) => {
    try {
        const estudiantes = await estudianteModel.getAll();
        res.json(estudiantes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener estudiantes",
            error: error.message
        });
    }
};

/**
 * Obtiene un estudiante por su ID
 */
export const getEstudiante = async (req, res) => {
    try {
        const { id } = req.params;
        const estudiante = await estudianteModel.getById(parseInt(id));

        if (estudiante) {
            res.json(estudiante);
        } else {
            res.status(404).json({ message: "Estudiante no encontrado" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener el estudiante",
            error: error.message
        });
    }
};

/**
 * Crea un nuevo estudiante
 */
export const createEstudiante = async (req, res) => {
    try {
        const { nombre, dni, fecha_nacimiento, genero, grado, direccion } = req.body;

        // Validar campos requeridos
        if (!nombre || !dni || !fecha_nacimiento || !genero || !grado || !direccion) {
            return res.status(400).json({
                message: "Todos los campos son requeridos: nombre, dni, fecha_nacimiento, genero, grado, direccion"
            });
        }

        // Validar formato de DNI (8 dígitos)
        if (!/^\d{8}$/.test(dni)) {
            return res.status(400).json({ message: "El DNI debe tener 8 dígitos numéricos" });
        }

        // Validar género
        if (genero !== 'M' && genero !== 'F') {
            return res.status(400).json({ message: "El género debe ser 'M' o 'F'" });
        }

        // Validar que el grado sea un número
        if (isNaN(grado)) {
            return res.status(400).json({ message: "El grado debe ser un número" });
        }

        // Crear el estudiante
        const result = await estudianteModel.create({
            nombre,
            dni,
            fecha_nacimiento,
            genero,
            grado: parseInt(grado),
            direccion
        });

        res.status(201).json({
            id: result.id,
            message: "Estudiante creado con éxito"
        });
    } catch (error) {
        console.error(error);

        // Manejar errores específicos
        if (error.message.includes('Violation of UNIQUE KEY constraint') && error.message.includes('dni')) {
            return res.status(400).json({ message: "Ya existe un estudiante con ese DNI" });
        }

        res.status(500).json({
            message: "Error al crear el estudiante",
            error: error.message
        });
    }
};

/**
 * Actualiza un estudiante existente
 */
export const updateEstudiante = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, dni, fecha_nacimiento, genero, grado, direccion } = req.body;

        // Verificar que se envió al menos un campo para actualizar
        if (!nombre && !dni && !fecha_nacimiento && !genero && !grado && !direccion) {
            return res.status(400).json({ message: "No hay datos para actualizar" });
        }

        // Validar formato de DNI si se proporciona
        if (dni && !/^\d{8}$/.test(dni)) {
            return res.status(400).json({ message: "El DNI debe tener 8 dígitos numéricos" });
        }

        // Validar género si se proporciona
        if (genero && genero !== 'M' && genero !== 'F') {
            return res.status(400).json({ message: "El género debe ser 'M' o 'F'" });
        }

        // Validar que el grado sea un número si se proporciona
        if (grado && isNaN(grado)) {
            return res.status(400).json({ message: "El grado debe ser un número" });
        }

        // Preparar objeto con datos a actualizar
        const estudianteData = {};
        if (nombre) estudianteData.nombre = nombre;
        if (dni) estudianteData.dni = dni;
        if (fecha_nacimiento) estudianteData.fecha_nacimiento = fecha_nacimiento;
        if (genero) estudianteData.genero = genero;
        if (grado) estudianteData.grado = parseInt(grado);
        if (direccion) estudianteData.direccion = direccion;

        // Actualizar el estudiante
        const result = await estudianteModel.update(parseInt(id), estudianteData);

        if (result.affectedRows > 0) {
            res.json({ message: "Estudiante actualizado con éxito" });
        } else {
            res.status(404).json({ message: "Estudiante no encontrado o sin cambios" });
        }
    } catch (error) {
        console.error(error);

        // Manejar errores específicos
        if (error.message.includes('Violation of UNIQUE KEY constraint') && error.message.includes('dni')) {
            return res.status(400).json({ message: "Ya existe un estudiante con ese DNI" });
        }

        res.status(500).json({
            message: "Error al actualizar el estudiante",
            error: error.message
        });
    }
};

/**
 * Elimina un estudiante
 */
export const deleteEstudiante = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await estudianteModel.delete(parseInt(id));

        if (result.affectedRows > 0) {
            res.json({ message: "Estudiante eliminado con éxito" });
        } else {
            res.status(404).json({ message: "Estudiante no encontrado o ya fue eliminado" });
        }
    } catch (error) {
        console.error(error);

        // Manejar errores de restricción de clave foránea
        if (error.message.includes('REFERENCE constraint')) {
            return res.status(400).json({
                message: "No se puede eliminar el estudiante porque tiene registros asociados (matrículas o apoderados)"
            });
        }

        res.status(500).json({
            message: "Error al eliminar el estudiante",
            error: error.message
        });
    }
};

/**
 * Verifica si un estudiante puede ser promovido al siguiente grado
 */
export const verificarPromocion = async (req, res) => {
    try {
        const { dni } = req.query;

        if (!dni) {
            return res.status(400).json({ 
                success: false,
                message: "El DNI del estudiante es requerido" 
            });
        }

        // Validar formato de DNI (8 dígitos)
        if (!/^\d{8}$/.test(dni)) {
            return res.status(400).json({ 
                success: false,
                message: "El DNI debe tener 8 dígitos numéricos" 
            });
        }

        const resultado = await estudianteModel.verificarPromocion(dni);
        
        res.json({
            success: true,
            data: resultado
        });

    } catch (error) {
        console.error('Error al verificar la promoción del estudiante:', error);
        res.status(error.message === 'Estudiante no encontrado' ? 404 : 500).json({
            success: false,
            message: "Error al verificar la promoción del estudiante",
            error: error.message
        });
    }
};

/**
 * Obtiene un resumen del estudiante incluyendo información de promoción
 */
export const getResumenEstudiante = async (req, res) => {
    try {
        const { dni } = req.query;

        if (!dni) {
            return res.status(400).json({ message: "El DNI del estudiante es requerido" });
        }

        // Query para obtener información del estudiante y su apoderado
        const query = `
            SELECT 
                e.id, e.nombre, e.dni, e.grado_actual,
                e.genero, e.fecha_nacimiento, e.direccion,
                e.estado, e.fecha_ingreso,
                a.nombre AS nombre_apoderado,
                a.dni AS dni_apoderado,
                a.parentesco,
                ha.anio_escolar AS ultimo_anio,
                ha.seccion
            FROM estudiantes e
            LEFT JOIN relaciones_apoderado_estudiante r ON e.id = r.estudiante_id AND r.es_principal = 1
            LEFT JOIN apoderados a ON r.apoderado_id = a.id
            OUTER APPLY (
                SELECT TOP 1 
                    anio_escolar, 
                    seccion
                FROM historial_academico
                WHERE estudiante_id = e.id
                ORDER BY anio_escolar DESC
            ) ha
            WHERE e.dni = @dni`;

        const pool = await getConnection();
        const result = await pool.request()
            .input('dni', mssql.VarChar(8), dni)
            .query(query);

        if (!result.recordset || result.recordset.length === 0) {
            return res.status(404).json({ message: "Estudiante no encontrado" });
        }

        const estudiante = result.recordset[0];

        // Determinar si puede ser promovido basado en el grado actual y estado
        const puedePromocionar = estudiante.estado === 'activo' && estudiante.grado_actual < 6;

        // Formatear la respuesta
        const resumen = {
            estudiante: {
                id: estudiante.id,
                nombre: estudiante.nombre,
                dni: estudiante.dni,
                grado_actual: estudiante.grado_actual,
                genero: estudiante.genero,
                fecha_nacimiento: estudiante.fecha_nacimiento,
                direccion: estudiante.direccion
            },
            apoderado: estudiante.nombre_apoderado ? {
                nombre: estudiante.nombre_apoderado,
                dni: estudiante.dni_apoderado,
                parentesco: estudiante.parentesco
            } : null,
            historial: {
                ultimo_anio: estudiante.ultimo_anio,
                seccion: estudiante.seccion
            },
            promocion: {
                estado: puedePromocionar ? 'puede_pasar' : 
                        estudiante.estado !== 'activo' ? 'no_activo' : 
                        estudiante.grado_actual >= 6 ? 'ultimo_grado' : 'no_cumple_requisitos',
                puede_promocionar: puedePromocionar,
                mensaje: getPromocionMensaje(puedePromocionar, estudiante.estado, estudiante.grado_actual)
            }
        };

        res.json(resumen);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener el resumen del estudiante",
            error: error.message
        });
    }
};

// Función auxiliar para obtener el mensaje de promoción
function getPromocionMensaje(puedePromocionar, estado, gradoActual) {
    if (estado !== 'activo') {
        return 'El estudiante no está activo en el sistema';
    }
    if (gradoActual >= 6) {
        return 'El estudiante ya está en el último grado';
    }
    if (puedePromocionar) {
        return 'El estudiante cumple con los requisitos para pasar al siguiente grado';
    }
    return 'El estudiante no cumple con los requisitos mínimos para pasar al siguiente grado';
}
