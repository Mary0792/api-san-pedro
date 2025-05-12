import anioEscolarModel from '../models/anio-escolar.model.js';

/**
 * Obtiene todos los años escolares
 */
export const getAniosEscolares = async (req, res) => {
    try {
        const aniosEscolares = await anioEscolarModel.getAll();
        res.json(aniosEscolares);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener años escolares",
            error: error.message
        });
    }
};

/**
 * Obtiene un año escolar por su ID
 */
export const getAnioEscolar = async (req, res) => {
    try {
        const { id } = req.params;
        const anioEscolar = await anioEscolarModel.getById(parseInt(id));
        
        if (anioEscolar) {
            res.json(anioEscolar);
        } else {
            res.status(404).json({ message: "Año escolar no encontrado" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener el año escolar",
            error: error.message
        });
    }
};

/**
 * Obtiene un año escolar por su valor de año
 */
export const getAnioEscolarByAnio = async (req, res) => {
    try {
        const { anio } = req.params;
        
        // Validar formato de año (4 dígitos)
        if (!/^\d{4}$/.test(anio)) {
            return res.status(400).json({ message: "El año debe tener 4 dígitos numéricos" });
        }
        
        const anioEscolar = await anioEscolarModel.getByAnio(anio);
        
        if (anioEscolar) {
            res.json(anioEscolar);
        } else {
            res.status(404).json({ message: "Año escolar no encontrado" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener el año escolar",
            error: error.message
        });
    }
};

/**
 * Obtiene el año escolar activo actual
 */
export const getAnioEscolarActivo = async (req, res) => {
    try {
        const anioEscolar = await anioEscolarModel.getActivo();
        
        if (anioEscolar) {
            res.json(anioEscolar);
        } else {
            res.status(404).json({ message: "No hay año escolar activo" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener el año escolar activo",
            error: error.message
        });
    }
};

/**
 * Crea un nuevo año escolar
 */
export const createAnioEscolar = async (req, res) => {
    try {
        const { anio, descripcion, fecha_inicio, fecha_fin, estado } = req.body;
        
        // Validar campos requeridos
        if (!anio || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({ 
                message: "Los campos anio, fecha_inicio y fecha_fin son requeridos" 
            });
        }
        
        // Validar formato de año (4 dígitos)
        if (!/^\d{4}$/.test(anio)) {
            return res.status(400).json({ message: "El año debe tener 4 dígitos numéricos" });
        }
        
        // Validar estado si se proporciona
        if (estado) {
            const estadosValidos = ['activo', 'finalizado', 'planificado'];
            if (!estadosValidos.includes(estado)) {
                return res.status(400).json({ 
                    message: "El estado debe ser uno de los siguientes: activo, finalizado, planificado" 
                });
            }
        }
        
        // Verificar que las fechas sean válidas
        const fechaInicio = new Date(fecha_inicio);
        const fechaFin = new Date(fecha_fin);
        
        if (isNaN(fechaInicio.getTime())) {
            return res.status(400).json({ message: "La fecha de inicio no es válida" });
        }
        
        if (isNaN(fechaFin.getTime())) {
            return res.status(400).json({ message: "La fecha de fin no es válida" });
        }
        
        if (fechaInicio >= fechaFin) {
            return res.status(400).json({ message: "La fecha de inicio debe ser anterior a la fecha de fin" });
        }
        
        // Crear el año escolar
        const result = await anioEscolarModel.create({
            anio,
            descripcion,
            fecha_inicio,
            fecha_fin,
            estado: estado || 'planificado'
        });
        
        res.status(201).json({
            id: result.id,
            message: "Año escolar creado con éxito"
        });
    } catch (error) {
        console.error(error);
        
        // Manejar errores específicos
        if (error.message.includes('Violation of UNIQUE KEY constraint') && error.message.includes('anio')) {
            return res.status(400).json({ message: "Ya existe un año escolar con ese año" });
        }
        
        res.status(500).json({
            message: "Error al crear el año escolar",
            error: error.message
        });
    }
};

/**
 * Actualiza un año escolar existente
 */
export const updateAnioEscolar = async (req, res) => {
    try {
        const { id } = req.params;
        const { anio, descripcion, fecha_inicio, fecha_fin, estado } = req.body;
        
        // Verificar que se envió al menos un campo para actualizar
        if (!anio && descripcion === undefined && !fecha_inicio && !fecha_fin && !estado) {
            return res.status(400).json({ message: "No hay datos para actualizar" });
        }
        
        // Validar formato de año si se proporciona
        if (anio && !/^\d{4}$/.test(anio)) {
            return res.status(400).json({ message: "El año debe tener 4 dígitos numéricos" });
        }
        
        // Validar estado si se proporciona
        if (estado) {
            const estadosValidos = ['activo', 'finalizado', 'planificado'];
            if (!estadosValidos.includes(estado)) {
                return res.status(400).json({ 
                    message: "El estado debe ser uno de los siguientes: activo, finalizado, planificado" 
                });
            }
        }
        
        // Verificar que las fechas sean válidas si se proporcionan
        if (fecha_inicio && fecha_fin) {
            const fechaInicio = new Date(fecha_inicio);
            const fechaFin = new Date(fecha_fin);
            
            if (isNaN(fechaInicio.getTime())) {
                return res.status(400).json({ message: "La fecha de inicio no es válida" });
            }
            
            if (isNaN(fechaFin.getTime())) {
                return res.status(400).json({ message: "La fecha de fin no es válida" });
            }
            
            if (fechaInicio >= fechaFin) {
                return res.status(400).json({ message: "La fecha de inicio debe ser anterior a la fecha de fin" });
            }
        }
        
        // Preparar objeto con datos a actualizar
        const anioEscolarData = {};
        if (anio) anioEscolarData.anio = anio;
        if (descripcion !== undefined) anioEscolarData.descripcion = descripcion;
        if (fecha_inicio) anioEscolarData.fecha_inicio = fecha_inicio;
        if (fecha_fin) anioEscolarData.fecha_fin = fecha_fin;
        if (estado) anioEscolarData.estado = estado;
        
        // Actualizar el año escolar
        const result = await anioEscolarModel.update(parseInt(id), anioEscolarData);
        
        if (result.affectedRows > 0) {
            res.json({ message: "Año escolar actualizado con éxito" });
        } else {
            res.status(404).json({ message: "Año escolar no encontrado o sin cambios" });
        }
    } catch (error) {
        console.error(error);
        
        // Manejar errores específicos
        if (error.message.includes('Violation of UNIQUE KEY constraint') && error.message.includes('anio')) {
            return res.status(400).json({ message: "Ya existe un año escolar con ese año" });
        }
        
        res.status(500).json({
            message: "Error al actualizar el año escolar",
            error: error.message
        });
    }
};

/**
 * Elimina un año escolar
 */
export const deleteAnioEscolar = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await anioEscolarModel.delete(parseInt(id));
        
        if (result.affectedRows > 0) {
            res.json({ message: "Año escolar eliminado con éxito" });
        } else {
            res.status(404).json({ message: "Año escolar no encontrado o ya fue eliminado" });
        }
    } catch (error) {
        console.error(error);
        
        // Manejar errores de restricción de clave foránea
        if (error.message.includes('REFERENCE constraint')) {
            return res.status(400).json({ 
                message: "No se puede eliminar el año escolar porque tiene registros asociados" 
            });
        }
        
        res.status(500).json({
            message: "Error al eliminar el año escolar",
            error: error.message
        });
    }
};
