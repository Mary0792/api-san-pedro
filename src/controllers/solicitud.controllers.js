import solicitudNuevaModel from '../models/solicitud-matricula-nueva.model.js';
import solicitudTrasladoModel from '../models/solicitud-traslado.model.js';
import solicitudSiguienteModel from '../models/solicitud-siguiente-grado.model.js';
import observacionModel from '../models/observacion-solicitud.model.js';
import estudianteModel from '../models/estudiante.model.js';
import { getConnection } from '../database/db.js';
import mssql from 'mssql';

// ==================== SOLICITUD MATRÍCULA NUEVA ====================

/**
 * Obtiene todas las solicitudes de matrícula nueva
 */
export const getSolicitudesNueva = async (req, res) => {
    try {
        const solicitudes = await solicitudNuevaModel.getAll();
        res.json(solicitudes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener solicitudes de matrícula nueva",
            error: error.message
        });
    }
};

/**
 * Obtiene una solicitud de matrícula nueva por su ID
 */
export const getSolicitudNueva = async (req, res) => {
    try {
        const { id } = req.params;
        const solicitud = await solicitudNuevaModel.getById(parseInt(id));

        if (solicitud) {
            res.json(solicitud);
        } else {
            res.status(404).json({ message: "Solicitud de matrícula nueva no encontrada" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener la solicitud de matrícula nueva",
            error: error.message
        });
    }
};

/**
 * Obtiene solicitudes de matrícula nueva por año escolar
 */
export const getSolicitudesNuevaByAnio = async (req, res) => {
    try {
        const { anio } = req.params;

        // Validar formato de año (4 dígitos)
        if (!/^\d{4}$/.test(anio)) {
            return res.status(400).json({ message: "El año debe tener 4 dígitos numéricos" });
        }

        const solicitudes = await solicitudNuevaModel.getByAnio(anio);
        res.json(solicitudes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener las solicitudes de matrícula nueva por año",
            error: error.message
        });
    }
};

/**
 * Crea una nueva solicitud de matrícula nueva
 */
export const createSolicitudNueva = async (req, res) => {
    try {
        const {
            nombre_estudiante, dni_estudiante, fecha_nacimiento, genero, grado_solicitado,
            direccion, nombre_apoderado, dni_apoderado, parentesco, ocupacion,
            grado_instruccion, telefono, email, direccion_apoderado, anio_escolar,
            fecha_solicitud, estado, comentarios
        } = req.body;

        // Validar campos requeridos
        if (!nombre_estudiante || !dni_estudiante || !fecha_nacimiento || !genero || !grado_solicitado ||
            !direccion || !nombre_apoderado || !dni_apoderado || !parentesco || !ocupacion ||
            !grado_instruccion || !telefono || !direccion_apoderado || !anio_escolar || !fecha_solicitud) {
            return res.status(400).json({
                message: "Todos los campos son requeridos excepto email, estado y comentarios"
            });
        }

        // Validar formato de año escolar (4 dígitos)
        if (!/^\d{4}$/.test(anio_escolar)) {
            return res.status(400).json({ message: "El año escolar debe tener 4 dígitos numéricos" });
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

        // Crear la solicitud
        const result = await solicitudNuevaModel.create({
            nombre_estudiante,
            dni_estudiante,
            fecha_nacimiento,
            genero,
            grado_solicitado: parseInt(grado_solicitado),
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
            estado: estado || 'pendiente',
            comentarios
        });

        res.status(201).json({
            id: result.id,
            message: "Solicitud de matrícula nueva creada con éxito"
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
 * Actualiza una solicitud de matrícula nueva existente
 */
export const updateSolicitudNueva = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre_estudiante, dni_estudiante, fecha_nacimiento, genero, grado_solicitado,
            direccion, nombre_apoderado, dni_apoderado, parentesco, ocupacion,
            grado_instruccion, telefono, email, direccion_apoderado, anio_escolar,
            fecha_solicitud, estado, comentarios
        } = req.body;

        // Verificar que se envió al menos un campo para actualizar
        if (!nombre_estudiante && !dni_estudiante && !fecha_nacimiento && !genero && !grado_solicitado &&
            !direccion && !nombre_apoderado && !dni_apoderado && !parentesco && !ocupacion &&
            !grado_instruccion && !telefono && email === undefined && !direccion_apoderado && !anio_escolar &&
            !fecha_solicitud && !estado && comentarios === undefined) {
            return res.status(400).json({ message: "No hay datos para actualizar" });
        }

        // Validar formato de año escolar si se proporciona
        if (anio_escolar && !/^\d{4}$/.test(anio_escolar)) {
            return res.status(400).json({ message: "El año escolar debe tener 4 dígitos numéricos" });
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

        // Preparar objeto con datos a actualizar
        const solicitudData = {};
        if (nombre_estudiante) solicitudData.nombre_estudiante = nombre_estudiante;
        if (dni_estudiante) solicitudData.dni_estudiante = dni_estudiante;
        if (fecha_nacimiento) solicitudData.fecha_nacimiento = fecha_nacimiento;
        if (genero) solicitudData.genero = genero;
        if (grado_solicitado) solicitudData.grado_solicitado = parseInt(grado_solicitado);
        if (direccion) solicitudData.direccion = direccion;
        if (nombre_apoderado) solicitudData.nombre_apoderado = nombre_apoderado;
        if (dni_apoderado) solicitudData.dni_apoderado = dni_apoderado;
        if (parentesco) solicitudData.parentesco = parentesco;
        if (ocupacion) solicitudData.ocupacion = ocupacion;
        if (grado_instruccion) solicitudData.grado_instruccion = grado_instruccion;
        if (telefono) solicitudData.telefono = telefono;
        if (email !== undefined) solicitudData.email = email;
        if (direccion_apoderado) solicitudData.direccion_apoderado = direccion_apoderado;
        if (anio_escolar) solicitudData.anio_escolar = anio_escolar;
        if (fecha_solicitud) solicitudData.fecha_solicitud = fecha_solicitud;
        if (estado) solicitudData.estado = estado;
        if (comentarios !== undefined) solicitudData.comentarios = comentarios;

        // Actualizar la solicitud
        const result = await solicitudNuevaModel.update(parseInt(id), solicitudData);

        if (result.affectedRows > 0) {
            res.json({ message: "Solicitud de matrícula nueva actualizada con éxito" });
        } else {
            res.status(404).json({ message: "Solicitud de matrícula nueva no encontrada o sin cambios" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al actualizar la solicitud de matrícula nueva",
            error: error.message
        });
    }
};

/**
 * Elimina una solicitud de matrícula nueva
 */
export const deleteSolicitudNueva = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await solicitudNuevaModel.delete(parseInt(id));

        if (result.affectedRows > 0) {
            res.json({ message: "Solicitud de matrícula nueva eliminada con éxito" });
        } else {
            res.status(404).json({ message: "Solicitud de matrícula nueva no encontrada o ya fue eliminada" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al eliminar la solicitud de matrícula nueva",
            error: error.message
        });
    }
};

// ==================== SOLICITUD TRASLADO ====================

/**
 * Obtiene todas las solicitudes de traslado
 */
export const getSolicitudesTraslado = async (req, res) => {
    try {
        const solicitudes = await solicitudTrasladoModel.getAll();
        res.json(solicitudes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener solicitudes de traslado",
            error: error.message
        });
    }
};

/**
 * Obtiene una solicitud de traslado por su ID
 */
export const getSolicitudTraslado = async (req, res) => {
    try {
        const { id } = req.params;
        const solicitud = await solicitudTrasladoModel.getById(parseInt(id));

        if (solicitud) {
            res.json(solicitud);
        } else {
            res.status(404).json({ message: "Solicitud de traslado no encontrada" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener la solicitud de traslado",
            error: error.message
        });
    }
};

/**
 * Obtiene solicitudes de traslado por año escolar
 */
export const getSolicitudesTrasladoByAnio = async (req, res) => {
    try {
        const { anio } = req.params;

        // Validar formato de año (4 dígitos)
        if (!/^\d{4}$/.test(anio)) {
            return res.status(400).json({ message: "El año debe tener 4 dígitos numéricos" });
        }

        const solicitudes = await solicitudTrasladoModel.getByAnio(anio);
        res.json(solicitudes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener las solicitudes de traslado por año",
            error: error.message
        });
    }
};

/**
 * Crea una nueva solicitud de traslado
 */
export const createSolicitudTraslado = async (req, res) => {
    try {
        const {
            nombre_estudiante, dni_estudiante, fecha_nacimiento, genero, grado_solicitado,
            direccion, nombre_apoderado, dni_apoderado, parentesco, ocupacion,
            grado_instruccion, telefono, email, direccion_apoderado, colegio_anterior,
            motivo_traslado, anio_escolar, fecha_solicitud, estado, comentarios
        } = req.body;

        // Validar campos requeridos
        if (!nombre_estudiante || !dni_estudiante || !fecha_nacimiento || !genero || !grado_solicitado ||
            !direccion || !nombre_apoderado || !dni_apoderado || !parentesco || !ocupacion ||
            !grado_instruccion || !telefono || !direccion_apoderado || !colegio_anterior ||
            !anio_escolar || !fecha_solicitud) {
            return res.status(400).json({
                message: "Todos los campos son requeridos excepto email, motivo_traslado, estado y comentarios"
            });
        }

        // Validar formato de año escolar (4 dígitos)
        if (!/^\d{4}$/.test(anio_escolar)) {
            return res.status(400).json({ message: "El año escolar debe tener 4 dígitos numéricos" });
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

        // Crear la solicitud
        const result = await solicitudTrasladoModel.create({
            nombre_estudiante,
            dni_estudiante,
            fecha_nacimiento,
            genero,
            grado_solicitado: parseInt(grado_solicitado),
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
            estado: estado || 'pendiente',
            comentarios
        });

        res.status(201).json({
            id: result.id,
            message: "Solicitud de traslado creada con éxito"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al crear la solicitud de traslado",
            error: error.message
        });
    }
};

/**
 * Actualiza una solicitud de traslado existente
 */
export const updateSolicitudTraslado = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre_estudiante, dni_estudiante, fecha_nacimiento, genero, grado_solicitado,
            direccion, nombre_apoderado, dni_apoderado, parentesco, ocupacion,
            grado_instruccion, telefono, email, direccion_apoderado, colegio_anterior,
            motivo_traslado, anio_escolar, fecha_solicitud, estado, comentarios
        } = req.body;

        // Verificar que se envió al menos un campo para actualizar
        if (!nombre_estudiante && !dni_estudiante && !fecha_nacimiento && !genero && !grado_solicitado &&
            !direccion && !nombre_apoderado && !dni_apoderado && !parentesco && !ocupacion &&
            !grado_instruccion && !telefono && email === undefined && !direccion_apoderado && !colegio_anterior &&
            motivo_traslado === undefined && !anio_escolar && !fecha_solicitud && !estado && comentarios === undefined) {
            return res.status(400).json({ message: "No hay datos para actualizar" });
        }

        // Validar formato de año escolar si se proporciona
        if (anio_escolar && !/^\d{4}$/.test(anio_escolar)) {
            return res.status(400).json({ message: "El año escolar debe tener 4 dígitos numéricos" });
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

        // Preparar objeto con datos a actualizar
        const solicitudData = {};
        if (nombre_estudiante) solicitudData.nombre_estudiante = nombre_estudiante;
        if (dni_estudiante) solicitudData.dni_estudiante = dni_estudiante;
        if (fecha_nacimiento) solicitudData.fecha_nacimiento = fecha_nacimiento;
        if (genero) solicitudData.genero = genero;
        if (grado_solicitado) solicitudData.grado_solicitado = parseInt(grado_solicitado);
        if (direccion) solicitudData.direccion = direccion;
        if (nombre_apoderado) solicitudData.nombre_apoderado = nombre_apoderado;
        if (dni_apoderado) solicitudData.dni_apoderado = dni_apoderado;
        if (parentesco) solicitudData.parentesco = parentesco;
        if (ocupacion) solicitudData.ocupacion = ocupacion;
        if (grado_instruccion) solicitudData.grado_instruccion = grado_instruccion;
        if (telefono) solicitudData.telefono = telefono;
        if (email !== undefined) solicitudData.email = email;
        if (direccion_apoderado) solicitudData.direccion_apoderado = direccion_apoderado;
        if (colegio_anterior) solicitudData.colegio_anterior = colegio_anterior;
        if (motivo_traslado !== undefined) solicitudData.motivo_traslado = motivo_traslado;
        if (anio_escolar) solicitudData.anio_escolar = anio_escolar;
        if (fecha_solicitud) solicitudData.fecha_solicitud = fecha_solicitud;
        if (estado) solicitudData.estado = estado;
        if (comentarios !== undefined) solicitudData.comentarios = comentarios;

        // Actualizar la solicitud
        const result = await solicitudTrasladoModel.update(parseInt(id), solicitudData);

        if (result.affectedRows > 0) {
            res.json({ message: "Solicitud de traslado actualizada con éxito" });
        } else {
            res.status(404).json({ message: "Solicitud de traslado no encontrada o sin cambios" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al actualizar la solicitud de traslado",
            error: error.message
        });
    }
};

/**
 * Elimina una solicitud de traslado
 */
export const deleteSolicitudTraslado = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await solicitudTrasladoModel.delete(parseInt(id));

        if (result.affectedRows > 0) {
            res.json({ message: "Solicitud de traslado eliminada con éxito" });
        } else {
            res.status(404).json({ message: "Solicitud de traslado no encontrada o ya fue eliminada" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al eliminar la solicitud de traslado",
            error: error.message
        });
    }
};

// ==================== SOLICITUD SIGUIENTE GRADO ====================

/**
 * Obtiene todas las solicitudes de siguiente grado
 */
export const getSolicitudesSiguiente = async (req, res) => {
    try {
        const solicitudes = await solicitudSiguienteModel.getAll();
        res.json(solicitudes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener solicitudes de siguiente grado",
            error: error.message
        });
    }
};

/**
 * Obtiene una solicitud de siguiente grado por su ID
 */
export const getSolicitudSiguiente = async (req, res) => {
    try {
        const { id } = req.params;
        const solicitud = await solicitudSiguienteModel.getById(parseInt(id));

        if (solicitud) {
            res.json(solicitud);
        } else {
            res.status(404).json({ message: "Solicitud de siguiente grado no encontrada" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener la solicitud de siguiente grado",
            error: error.message
        });
    }
};

/**
 * Obtiene solicitudes de siguiente grado por año escolar actual
 */
export const getSolicitudesSiguienteByAñoActual = async (req, res) => {
    try {
        const { año } = req.params;

        // Validar formato de año (4 dígitos)
        if (!/^\d{4}$/.test(año)) {
            return res.status(400).json({ message: "El año debe tener 4 dígitos numéricos" });
        }

        const solicitudes = await solicitudSiguienteModel.getByAñoActual(año);
        res.json(solicitudes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener las solicitudes de siguiente grado por año actual",
            error: error.message
        });
    }
};

/**
 * Obtiene solicitudes de siguiente grado por año escolar siguiente
 */
export const getSolicitudesSiguienteByAñoSiguiente = async (req, res) => {
    try {
        const { año } = req.params;

        // Validar formato de año (4 dígitos)
        if (!/^\d{4}$/.test(año)) {
            return res.status(400).json({ message: "El año debe tener 4 dígitos numéricos" });
        }

        const solicitudes = await solicitudSiguienteModel.getByAñoSiguiente(año);
        res.json(solicitudes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener las solicitudes de siguiente grado por año siguiente",
            error: error.message
        });
    }
};

/**
 * Obtiene solicitudes de siguiente grado por estudiante
 */
export const getSolicitudesSiguienteByEstudiante = async (req, res) => {
    try {
        const { estudianteId } = req.params;

        // Verificar que el estudiante existe
        const estudiante = await estudianteModel.getById(parseInt(estudianteId));
        if (!estudiante) {
            return res.status(404).json({ message: "Estudiante no encontrado" });
        }

        const solicitudes = await solicitudSiguienteModel.getByEstudiante(parseInt(estudianteId));
        res.json(solicitudes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener las solicitudes de siguiente grado del estudiante",
            error: error.message
        });
    }
};

/**
 * Crea una nueva solicitud de siguiente grado
 */
export const createSolicitudSiguiente = async (req, res) => {
    try {
        const {
            estudiante_id, grado_actual, grado_siguiente, anio_escolar_actual,
            anio_escolar_siguiente, fecha_solicitud, estado, comentarios
        } = req.body;

        // Log request data for debugging
        console.log('Datos recibidos:', {
            estudiante_id, grado_actual, grado_siguiente, anio_escolar_actual,
            anio_escolar_siguiente, fecha_solicitud, estado, comentarios
        });

        // Validar campos requeridos
        if (!estudiante_id || !grado_actual || !grado_siguiente || !anio_escolar_actual ||
            !anio_escolar_siguiente || !fecha_solicitud) {
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

        // Validar estado si se proporciona
        if (estado) {
            const estadosValidos = ['pendiente', 'aprobada', 'rechazada'];
            if (!estadosValidos.includes(estado)) {
                return res.status(400).json({
                    message: "Estado inválido",
                    details: `El estado debe ser uno de los siguientes: ${estadosValidos.join(', ')}`
                });
            }
        }

        // Validar fecha
        try {
            const fechaObj = new Date(fecha_solicitud);
            if (isNaN(fechaObj.getTime())) {
                throw new Error('Fecha inválida');
            }
        } catch (error) {
            return res.status(400).json({
                message: "Formato de fecha inválido",
                details: "La fecha debe estar en formato YYYY-MM-DD"
            });
        }

        // Crear la solicitud
        const result = await solicitudSiguienteModel.create({
            estudiante_id: parseInt(estudiante_id),
            grado_actual: parseInt(grado_actual),
            grado_siguiente: parseInt(grado_siguiente),
            anio_escolar_actual,
            anio_escolar_siguiente,
            fecha_solicitud,
            estado: estado || 'pendiente',
            comentarios
        });

        res.status(201).json({
            message: "Solicitud de siguiente grado creada con éxito",
            id: result.id
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
 * Actualiza una solicitud de siguiente grado existente
 */
export const updateSolicitudSiguiente = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            estudiante_id, grado_actual, grado_siguiente, año_escolar_actual,
            año_escolar_siguiente, fecha_solicitud, estado, comentarios
        } = req.body;

        // Verificar que se envió al menos un campo para actualizar
        if (!estudiante_id && grado_actual === undefined && grado_siguiente === undefined &&
            !año_escolar_actual && !año_escolar_siguiente && !fecha_solicitud &&
            !estado && comentarios === undefined) {
            return res.status(400).json({ message: "No hay datos para actualizar" });
        }

        // Validar formato de años escolares si se proporcionan
        if ((año_escolar_actual && !/^\d{4}$/.test(año_escolar_actual)) ||
            (año_escolar_siguiente && !/^\d{4}$/.test(año_escolar_siguiente))) {
            return res.status(400).json({ message: "Los años escolares deben tener 4 dígitos numéricos" });
        }

        // Verificar que el estudiante existe si se proporciona
        if (estudiante_id) {
            const estudiante = await estudianteModel.getById(parseInt(estudiante_id));
            if (!estudiante) {
                return res.status(404).json({ message: "Estudiante no encontrado" });
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

        // Preparar objeto con datos a actualizar
        const solicitudData = {};
        if (estudiante_id) solicitudData.estudiante_id = parseInt(estudiante_id);
        if (grado_actual !== undefined) solicitudData.grado_actual = parseInt(grado_actual);
        if (grado_siguiente !== undefined) solicitudData.grado_siguiente = parseInt(grado_siguiente);
        if (año_escolar_actual) solicitudData.año_escolar_actual = año_escolar_actual;
        if (año_escolar_siguiente) solicitudData.año_escolar_siguiente = año_escolar_siguiente;
        if (fecha_solicitud) solicitudData.fecha_solicitud = fecha_solicitud;
        if (estado) solicitudData.estado = estado;
        if (comentarios !== undefined) solicitudData.comentarios = comentarios;

        // Actualizar la solicitud
        const result = await solicitudSiguienteModel.update(parseInt(id), solicitudData);

        if (result.affectedRows > 0) {
            res.json({ message: "Solicitud de siguiente grado actualizada con éxito" });
        } else {
            res.status(404).json({ message: "Solicitud de siguiente grado no encontrada o sin cambios" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al actualizar la solicitud de siguiente grado",
            error: error.message
        });
    }
};

/**
 * Elimina una solicitud de siguiente grado
 */
export const deleteSolicitudSiguiente = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await solicitudSiguienteModel.delete(parseInt(id));

        if (result.affectedRows > 0) {
            res.json({ message: "Solicitud de siguiente grado eliminada con éxito" });
        } else {
            res.status(404).json({ message: "Solicitud de siguiente grado no encontrada o ya fue eliminada" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al eliminar la solicitud de siguiente grado",
            error: error.message
        });
    }
};

// ==================== OBSERVACIONES DE SOLICITUD ====================

/**
 * Obtiene todas las observaciones
 */
export const getObservaciones = async (req, res) => {
    try {
        const observaciones = await observacionModel.getAll();
        res.json(observaciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener observaciones",
            error: error.message
        });
    }
};

/**
 * Obtiene una observación por su ID
 */
export const getObservacion = async (req, res) => {
    try {
        const { id } = req.params;
        const observacion = await observacionModel.getById(parseInt(id));

        if (observacion) {
            res.json(observacion);
        } else {
            res.status(404).json({ message: "Observación no encontrada" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener la observación",
            error: error.message
        });
    }
};

/**
 * Obtiene observaciones por tipo de solicitud y ID de solicitud
 */
export const getObservacionesBySolicitud = async (req, res) => {
    try {
        const { tipoSolicitud, solicitudId } = req.params;

        // Validar tipo de solicitud
        if (!['nueva', 'traslado', 'siguiente'].includes(tipoSolicitud)) {
            return res.status(400).json({
                message: "Tipo de solicitud no válido. Debe ser 'nueva', 'traslado' o 'siguiente'"
            });
        }

        const observaciones = await observacionModel.getBySolicitud(tipoSolicitud, parseInt(solicitudId));
        res.json(observaciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener las observaciones de la solicitud",
            error: error.message
        });
    }
};

/**
 * Obtiene observaciones visibles para padres por tipo de solicitud y ID de solicitud
 */
export const getObservacionesVisiblesPadresBySolicitud = async (req, res) => {
    try {
        const { tipoSolicitud, solicitudId } = req.params;

        // Validar tipo de solicitud
        if (!['nueva', 'traslado', 'siguiente'].includes(tipoSolicitud)) {
            return res.status(400).json({
                message: "Tipo de solicitud no válido. Debe ser 'nueva', 'traslado' o 'siguiente'"
            });
        }

        const observaciones = await observacionModel.getVisiblesPadresBySolicitud(tipoSolicitud, parseInt(solicitudId));
        res.json(observaciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener las observaciones visibles para padres de la solicitud",
            error: error.message
        });
    }
};

/**
 * Crea una nueva observación
 */
export const createObservacion = async (req, res) => {
    try {
        const { tipo_solicitud, solicitud_id, fecha, tipo, descripcion, es_visible_para_padres } = req.body;

        // Validar campos requeridos
        if (!tipo_solicitud || !solicitud_id || !tipo || !descripcion) {
            return res.status(400).json({
                message: "Los campos tipo_solicitud, solicitud_id, tipo y descripcion son requeridos"
            });
        }

        // Validar tipo de solicitud
        if (!['nueva', 'traslado', 'siguiente'].includes(tipo_solicitud)) {
            return res.status(400).json({
                message: "Tipo de solicitud no válido. Debe ser 'nueva', 'traslado' o 'siguiente'"
            });
        }

        // Validar tipo de observación
        const tiposValidos = ['comentario', 'rechazo', 'aprobación', 'petición_documentos'];
        if (!tiposValidos.includes(tipo)) {
            return res.status(400).json({
                message: `Tipo de observación no válido. Debe ser uno de los siguientes: ${tiposValidos.join(', ')}`
            });
        }

        // Crear la observación
        const result = await observacionModel.create({
            tipo_solicitud,
            solicitud_id: parseInt(solicitud_id),
            fecha: fecha || new Date(),
            tipo,
            descripcion,
            es_visible_para_padres: es_visible_para_padres !== undefined ? es_visible_para_padres : true
        });

        res.status(201).json({
            id: result.id,
            message: "Observación creada con éxito"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al crear la observación",
            error: error.message
        });
    }
};

/**
 * Actualiza una observación existente
 */
export const updateObservacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo_solicitud, solicitud_id, fecha, tipo, descripcion, es_visible_para_padres } = req.body;

        // Verificar que se envió al menos un campo para actualizar
        if (!tipo_solicitud && !solicitud_id && !fecha && !tipo && !descripcion && es_visible_para_padres === undefined) {
            return res.status(400).json({ message: "No hay datos para actualizar" });
        }

        // Validar tipo de solicitud si se proporciona
        if (tipo_solicitud && !['nueva', 'traslado', 'siguiente'].includes(tipo_solicitud)) {
            return res.status(400).json({
                message: "Tipo de solicitud no válido. Debe ser 'nueva', 'traslado' o 'siguiente'"
            });
        }

        // Validar tipo de observación si se proporciona
        if (tipo) {
            const tiposValidos = ['comentario', 'rechazo', 'aprobación', 'petición_documentos'];
            if (!tiposValidos.includes(tipo)) {
                return res.status(400).json({
                    message: `Tipo de observación no válido. Debe ser uno de los siguientes: ${tiposValidos.join(', ')}`
                });
            }
        }

        // Preparar objeto con datos a actualizar
        const observacionData = {};
        if (tipo_solicitud) observacionData.tipo_solicitud = tipo_solicitud;
        if (solicitud_id) observacionData.solicitud_id = parseInt(solicitud_id);
        if (fecha) observacionData.fecha = new Date(fecha);
        if (tipo) observacionData.tipo = tipo;
        if (descripcion) observacionData.descripcion = descripcion;
        if (es_visible_para_padres !== undefined) observacionData.es_visible_para_padres = es_visible_para_padres;

        // Actualizar la observación
        const result = await observacionModel.update(parseInt(id), observacionData);

        if (result.affectedRows > 0) {
            res.json({ message: "Observación actualizada con éxito" });
        } else {
            res.status(404).json({ message: "Observación no encontrada o sin cambios" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al actualizar la observación",
            error: error.message
        });
    }
};

/**
 * Elimina una observación
 */
export const deleteObservacion = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await observacionModel.delete(parseInt(id));

        if (result.affectedRows > 0) {
            res.json({ message: "Observación eliminada con éxito" });
        } else {
            res.status(404).json({ message: "Observación no encontrada o ya fue eliminada" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al eliminar la observación",
            error: error.message
        });
    }
};

/**
 * Obtiene solicitudes de traslado por DNI del estudiante
 */
export const getSolicitudesTrasladoByDni = async (req, res) => {
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

        console.log(`Buscando solicitudes de traslado para DNI: ${dni}`);

        // Buscar solicitudes de traslado
        const solicitudes = await solicitudTrasladoModel.getByDniEstudiante(dni);

        console.log(`Solicitudes encontradas: ${solicitudes ? solicitudes.length : 0}`);

        // Si no hay solicitudes, intentar buscar información del estudiante para crear una respuesta más informativa
        if (!solicitudes || solicitudes.length === 0) {
            try {
                // Intentar obtener información del estudiante desde la base de datos
                const pool = await getConnection();
                const estudianteResult = await pool.request()
                    .input('dni', mssql.VarChar(8), dni)
                    .query('SELECT id, nombre, apellido FROM estudiantes WHERE dni = @dni');

                if (estudianteResult.recordset && estudianteResult.recordset.length > 0) {
                    const estudiante = estudianteResult.recordset[0];
                    const nombreCompleto = `${estudiante.nombre} ${estudiante.apellido}`.trim();

                    // Devolver respuesta con información del estudiante pero sin solicitudes
                    return res.json({
                        success: true,
                        dni_estudiante: dni,
                        nombre_estudiante: nombreCompleto,
                        total_solicitudes: 0,
                        solicitudes: [],
                        mensaje: "El estudiante existe en el sistema pero no tiene solicitudes de traslado registradas"
                    });
                }
            } catch (estudianteError) {
                console.error('Error al buscar información del estudiante:', estudianteError);
                // Continuar con la respuesta normal si hay error
            }
        }

        // Ordenar por fecha de solicitud (más reciente primero) si hay solicitudes
        if (solicitudes && solicitudes.length > 0) {
            solicitudes.sort((a, b) => new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud));
        }

        // Crear el objeto de respuesta
        const respuesta = {
            success: true,
            dni_estudiante: dni,
            nombre_estudiante: solicitudes && solicitudes.length > 0 ? solicitudes[0].nombre_estudiante : null,
            total_solicitudes: solicitudes ? solicitudes.length : 0,
            solicitudes: solicitudes || []
        };

        res.json(respuesta);
    } catch (error) {
        console.error('Error al obtener solicitudes de traslado por DNI:', error);
        res.status(500).json({
            success: false,
            message: "Error al obtener solicitudes de traslado",
            error: error.message
        });
    }
};

/**
 * Obtiene solicitudes de matrícula nueva por DNI del estudiante
 */
export const getSolicitudesNuevaByDni = async (req, res) => {
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

        console.log(`Buscando solicitudes de matrícula nueva para DNI: ${dni}`);

        // Buscar solicitudes de matrícula nueva
        const solicitudes = await solicitudNuevaModel.getByDniEstudiante(dni);

        console.log(`Solicitudes encontradas: ${solicitudes ? solicitudes.length : 0}`);

        // Si no hay solicitudes, intentar buscar información del estudiante para crear una respuesta más informativa
        if (!solicitudes || solicitudes.length === 0) {
            try {
                // Intentar obtener información del estudiante desde la base de datos
                const pool = await getConnection();
                const estudianteResult = await pool.request()
                    .input('dni', mssql.VarChar(8), dni)
                    .query('SELECT id, nombre, apellido FROM estudiantes WHERE dni = @dni');

                if (estudianteResult.recordset && estudianteResult.recordset.length > 0) {
                    const estudiante = estudianteResult.recordset[0];
                    const nombreCompleto = `${estudiante.nombre || ''} ${estudiante.apellido || ''}`.trim();

                    // Devolver respuesta con información del estudiante pero sin solicitudes
                    return res.json({
                        success: true,
                        dni_estudiante: dni,
                        nombre_estudiante: nombreCompleto,
                        total_solicitudes: 0,
                        solicitudes: [],
                        mensaje: "El estudiante existe en el sistema pero no tiene solicitudes de matrícula nueva registradas"
                    });
                }
            } catch (estudianteError) {
                console.error('Error al buscar información del estudiante:', estudianteError);
                // Continuar con la respuesta normal si hay error
            }
        }

        // Ordenar por fecha de solicitud (más reciente primero) si hay solicitudes
        if (solicitudes && solicitudes.length > 0) {
            solicitudes.sort((a, b) => new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud));
        }

        // Crear el objeto de respuesta
        const respuesta = {
            success: true,
            dni_estudiante: dni,
            nombre_estudiante: solicitudes && solicitudes.length > 0 ? solicitudes[0].nombre_estudiante : null,
            total_solicitudes: solicitudes ? solicitudes.length : 0,
            solicitudes: solicitudes || []
        };

        res.json(respuesta);
    } catch (error) {
        console.error('Error al obtener solicitudes de matrícula nueva por DNI:', error);
        res.status(500).json({
            success: false,
            message: "Error al obtener solicitudes de matrícula nueva",
            error: error.message
        });
    }
};

/**
 * Obtiene solicitudes de siguiente grado por DNI del estudiante
 */
export const getSolicitudesSiguienteByDni = async (req, res) => {
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

        console.log(`Buscando solicitudes de siguiente grado para DNI: ${dni}`);

        // Buscar solicitudes de siguiente grado
        const solicitudes = await solicitudSiguienteModel.getByDniEstudiante(dni);

        console.log(`Solicitudes encontradas: ${solicitudes ? solicitudes.length : 0}`);

        // Si no hay solicitudes, intentar buscar información del estudiante para crear una respuesta más informativa
        if (!solicitudes || solicitudes.length === 0) {
            try {
                // Intentar obtener información del estudiante desde la base de datos
                const pool = await getConnection();
                const estudianteResult = await pool.request()
                    .input('dni', mssql.VarChar(8), dni)
                    .query('SELECT id, nombre, apellido FROM estudiantes WHERE dni = @dni');

                if (estudianteResult.recordset && estudianteResult.recordset.length > 0) {
                    const estudiante = estudianteResult.recordset[0];
                    const nombreCompleto = `${estudiante.nombre || ''} ${estudiante.apellido || ''}`.trim();

                    // Devolver respuesta con información del estudiante pero sin solicitudes
                    return res.json({
                        success: true,
                        dni_estudiante: dni,
                        nombre_estudiante: nombreCompleto,
                        total_solicitudes: 0,
                        solicitudes: [],
                        mensaje: "El estudiante existe en el sistema pero no tiene solicitudes de siguiente grado registradas"
                    });
                }
            } catch (estudianteError) {
                console.error('Error al buscar información del estudiante:', estudianteError);
                // Continuar con la respuesta normal si hay error
            }
        }

        // Ordenar por fecha de solicitud (más reciente primero) si hay solicitudes
        if (solicitudes && solicitudes.length > 0) {
            solicitudes.sort((a, b) => new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud));
        }

        // Crear el objeto de respuesta
        const respuesta = {
            success: true,
            dni_estudiante: dni,
            nombre_estudiante: solicitudes && solicitudes.length > 0 ? solicitudes[0].estudiante_nombre : null,
            total_solicitudes: solicitudes ? solicitudes.length : 0,
            solicitudes: solicitudes || []
        };

        res.json(respuesta);
    } catch (error) {
        console.error('Error al obtener solicitudes de siguiente grado por DNI:', error);
        res.status(500).json({
            success: false,
            message: "Error al obtener solicitudes de siguiente grado",
            error: error.message
        });
    }
};