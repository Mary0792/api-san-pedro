import documentoModel from '../models/documento.model.js';
import path from 'path';
import fs from 'fs';

// Definir los tipos de documentos permitidos por tipo de solicitud
const TIPOS_DOCUMENTO_POR_SOLICITUD = {
    nueva: [
        'partida_nacimiento',
        'copia_dni_estudiante',
        'copia_dni_apoderado',
        'certificado_vacunacion',
        'foto_estudiante'
    ],
    traslado: [
        'constancia_matricula',
        'libreta_notas',
        'partida_nacimiento',
        'copia_dni_estudiante',
        'copia_dni_apoderado'
    ],
    siguiente: [
        'libreta_notas',
        'comprobante_apafa'
    ]
};

// Obtener todos los tipos de documentos permitidos
const TODOS_TIPOS_DOCUMENTOS = [
    ...new Set(
        Object.values(TIPOS_DOCUMENTO_POR_SOLICITUD)
            .flat()
    )
];

/**
 * Obtiene todos los documentos con filtros opcionales
 */
export const getDocumentos = async (req, res) => {
    try {
        const { tipo_solicitud, solicitud_id, tipo_documento } = req.query;

        // Crear objeto de filtros
        const filtros = {};

        // Añadir filtros si están presentes
        if (tipo_solicitud) {
            // Validar tipo de solicitud
            if (!['nueva', 'traslado', 'siguiente'].includes(tipo_solicitud)) {
                return res.status(400).json({
                    message: "Tipo de solicitud no válido. Debe ser 'nueva', 'traslado' o 'siguiente'"
                });
            }
            filtros.tipo_solicitud = tipo_solicitud;
        }

        if (solicitud_id) {
            filtros.solicitud_id = parseInt(solicitud_id);
        }

        if (tipo_documento) {
            filtros.tipo_documento = tipo_documento;
        }

        // Log para depuración
        console.log('Consultando documentos con filtros:', filtros);

        // Obtener documentos con filtros
        const documentos = Object.keys(filtros).length > 0
            ? await documentoModel.getByFilters(filtros)
            : await documentoModel.getAll();

        res.json(documentos);
    } catch (error) {
        console.error('Error al obtener documentos:', error);
        res.status(500).json({
            message: "Error al obtener documentos",
            error: error.message
        });
    }
};

/**
 * Obtiene un documento por su ID
 */
export const getDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const documento = await documentoModel.getById(parseInt(id));

        if (documento) {
            res.json(documento);
        } else {
            res.status(404).json({ message: "Documento no encontrado" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener el documento",
            error: error.message
        });
    }
};

/**
 * Obtiene todos los documentos de una solicitud
 */
export const getDocumentosBySolicitud = async (req, res) => {
    try {
        const { tipoSolicitud, solicitudId } = req.params;

        // Validar tipo de solicitud
        if (!['nueva', 'traslado', 'siguiente'].includes(tipoSolicitud)) {
            return res.status(400).json({
                message: "Tipo de solicitud no válido. Debe ser 'nueva', 'traslado' o 'siguiente'"
            });
        }

        const documentos = await documentoModel.getBySolicitud(tipoSolicitud, parseInt(solicitudId));
        res.json(documentos);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener los documentos de la solicitud",
            error: error.message
        });
    }
};

/**
 * Obtiene todos los documentos de un estudiante
 */
export const getDocumentosByEstudiante = async (req, res) => {
    try {
        const { estudianteId } = req.params;
        const documentos = await documentoModel.getByEstudiante(parseInt(estudianteId));
        res.json(documentos);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener los documentos del estudiante",
            error: error.message
        });
    }
};

/**
 * Crea un nuevo documento
 */
export const createDocumento = async (req, res) => {
    try {
        // Verificar si hay un archivo
        if (!req.file) {
            return res.status(400).json({
                message: "No se ha proporcionado ningún archivo"
            });
        }

        const { solicitud_id, tipo_documento, tipo_solicitud } = req.body;

        // Validar campos requeridos
        if (!solicitud_id || !tipo_documento || !tipo_solicitud) {
            return res.status(400).json({
                message: "Todos los campos son requeridos: solicitud_id, tipo_documento y tipo_solicitud"
            });
        }

        // Validar tipo de solicitud
        if (!['nueva', 'traslado', 'siguiente'].includes(tipo_solicitud)) {
            return res.status(400).json({
                message: "Tipo de solicitud no válido. Debe ser 'nueva', 'traslado' o 'siguiente'"
            });
        }

        // Validar el tipo de documento (comentado para ser más flexible)
        // const tiposPermitidos = TIPOS_DOCUMENTO_POR_SOLICITUD[tipo_solicitud];
        // if (!tiposPermitidos.includes(tipo_documento)) {
        //     return res.status(400).json({
        //         message: `Tipo de documento no válido para ${tipo_solicitud}. Tipos permitidos: ${tiposPermitidos.join(', ')}`
        //     });
        // }

        // Log para depuración
        console.log('Recibiendo documento:', {
            solicitud_id,
            tipo_documento,
            tipo_solicitud,
            file: req.file ? {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                filename: req.file.filename
            } : 'No file'
        });

        // Usar el nombre de archivo generado por multer
        const uploadPath = `/uploads/${req.file.filename}`;

        // Crear el documento con la información del archivo
        const documentoData = {
            solicitud_id: parseInt(solicitud_id),
            tipo_solicitud,
            tipo_documento,
            nombre_archivo: req.file.originalname,
            ruta_archivo: uploadPath
        };

        const result = await documentoModel.create(documentoData);

        if (!result || !result.id) {
            throw new Error('Error al crear el documento en la base de datos');
        }

        res.status(201).json({
            id: result.id,
            message: "Documento creado con éxito",
            file: {
                originalname: req.file.originalname,
                filename: req.file.filename,
                path: uploadPath,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    } catch (error) {
        console.error('Error en createDocumento:', error);
        console.error('Stack trace:', error.stack);

        // Si hay un error, intentar eliminar el archivo si se subió
        if (req.file) {
            try {
                const filePath = path.join(process.cwd(), 'public/uploads', req.file.filename);
                await fs.promises.unlink(filePath);
                console.log('Archivo eliminado después del error:', filePath);
            } catch (unlinkError) {
                console.error('Error al eliminar el archivo después del error:', unlinkError);
            }
        }

        // Manejar errores específicos
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                message: "El archivo es demasiado grande. El tamaño máximo permitido es 5MB",
                error: error.message
            });
        } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                message: "Campo de archivo inesperado. Utilice 'documento' como nombre del campo",
                error: error.message
            });
        } else if (error.message.includes('Invalid object name')) {
            return res.status(500).json({
                message: "Error en la base de datos: Tabla no encontrada",
                error: error.message,
                details: "Es posible que la tabla 'documentos' no exista en la base de datos"
            });
        }

        res.status(500).json({
            message: "Error al crear el documento",
            error: error.message,
            stack: error.stack
        });
    }
};

/**
 * Actualiza un documento existente
 */
export const updateDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo_solicitud, solicitud_id, tipo_documento, nombre_archivo, ruta_archivo } = req.body;

        // Verificar que se envió al menos un campo para actualizar
        if (!tipo_solicitud && !solicitud_id && !tipo_documento && !nombre_archivo && !ruta_archivo) {
            return res.status(400).json({ message: "No hay datos para actualizar" });
        }

        // Validar tipo de solicitud si se proporciona
        if (tipo_solicitud && !['nueva', 'traslado', 'siguiente'].includes(tipo_solicitud)) {
            return res.status(400).json({
                message: "Tipo de solicitud no válido. Debe ser 'nueva', 'traslado' o 'siguiente'"
            });
        }

        // Preparar objeto con datos a actualizar
        const documentoData = {};
        if (tipo_solicitud) documentoData.tipo_solicitud = tipo_solicitud;
        if (solicitud_id) documentoData.solicitud_id = parseInt(solicitud_id);
        if (tipo_documento) documentoData.tipo_documento = tipo_documento;
        if (nombre_archivo) documentoData.nombre_archivo = nombre_archivo;
        if (ruta_archivo) documentoData.ruta_archivo = ruta_archivo;

        // Actualizar el documento
        const result = await documentoModel.update(parseInt(id), documentoData);

        if (result.affectedRows > 0) {
            res.json({ message: "Documento actualizado con éxito" });
        } else {
            res.status(404).json({ message: "Documento no encontrado o sin cambios" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al actualizar el documento",
            error: error.message
        });
    }
};

/**
 * Elimina un documento
 */
export const deleteDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await documentoModel.delete(parseInt(id));

        if (result.affectedRows > 0) {
            res.json({ message: "Documento eliminado con éxito" });
        } else {
            res.status(404).json({ message: "Documento no encontrado o ya fue eliminado" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al eliminar el documento",
            error: error.message
        });
    }
};
