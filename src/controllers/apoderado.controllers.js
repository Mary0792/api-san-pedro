import apoderadoModel from '../models/apoderado.model.js';

/**
 * Obtiene todos los apoderados
 */
export const getApoderados = async (req, res) => {
    try {
        const apoderados = await apoderadoModel.getAll();
        res.json(apoderados);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener apoderados",
            error: error.message
        });
    }
};

/**
 * Obtiene un apoderado por su ID
 */
export const getApoderado = async (req, res) => {
    try {
        const { id } = req.params;
        const apoderado = await apoderadoModel.getById(parseInt(id));
        
        if (apoderado) {
            res.json(apoderado);
        } else {
            res.status(404).json({ message: "Apoderado no encontrado" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener el apoderado",
            error: error.message
        });
    }
};

/**
 * Crea un nuevo apoderado
 */
export const createApoderado = async (req, res) => {
    try {
        const { nombre, dni, parentesco, ocupacion, grado_instruccion, telefono, email, direccion } = req.body;
        
        // Validar campos requeridos
        if (!nombre || !dni || !parentesco || !ocupacion || !grado_instruccion || !telefono || !email || !direccion) {
            return res.status(400).json({ 
                message: "Todos los campos son requeridos: nombre, dni, parentesco, ocupacion, grado_instruccion, telefono, email, direccion" 
            });
        }
        
        // Validar formato de DNI (8 dígitos)
        if (!/^\d{8}$/.test(dni)) {
            return res.status(400).json({ message: "El DNI debe tener 8 dígitos numéricos" });
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "El formato del email no es válido" });
        }
        
        // Crear el apoderado
        const result = await apoderadoModel.create({
            nombre,
            dni,
            parentesco,
            ocupacion,
            grado_instruccion,
            telefono,
            email,
            direccion
        });
        
        res.status(201).json({
            id: result.id,
            message: "Apoderado creado con éxito"
        });
    } catch (error) {
        console.error(error);
        
        // Manejar errores específicos
        if (error.message.includes('Violation of UNIQUE KEY constraint') && error.message.includes('dni')) {
            return res.status(400).json({ message: "Ya existe un apoderado con ese DNI" });
        }
        
        res.status(500).json({
            message: "Error al crear el apoderado",
            error: error.message
        });
    }
};

/**
 * Actualiza un apoderado existente
 */
export const updateApoderado = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, dni, parentesco, ocupacion, grado_instruccion, telefono, email, direccion } = req.body;
        
        // Verificar que se envió al menos un campo para actualizar
        if (!nombre && !dni && !parentesco && !ocupacion && !grado_instruccion && !telefono && !email && !direccion) {
            return res.status(400).json({ message: "No hay datos para actualizar" });
        }
        
        // Validar formato de DNI si se proporciona
        if (dni && !/^\d{8}$/.test(dni)) {
            return res.status(400).json({ message: "El DNI debe tener 8 dígitos numéricos" });
        }
        
        // Validar formato de email si se proporciona
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "El formato del email no es válido" });
            }
        }
        
        // Preparar objeto con datos a actualizar
        const apoderadoData = {};
        if (nombre) apoderadoData.nombre = nombre;
        if (dni) apoderadoData.dni = dni;
        if (parentesco) apoderadoData.parentesco = parentesco;
        if (ocupacion) apoderadoData.ocupacion = ocupacion;
        if (grado_instruccion) apoderadoData.grado_instruccion = grado_instruccion;
        if (telefono) apoderadoData.telefono = telefono;
        if (email) apoderadoData.email = email;
        if (direccion) apoderadoData.direccion = direccion;
        
        // Actualizar el apoderado
        const result = await apoderadoModel.update(parseInt(id), apoderadoData);
        
        if (result.affectedRows > 0) {
            res.json({ message: "Apoderado actualizado con éxito" });
        } else {
            res.status(404).json({ message: "Apoderado no encontrado o sin cambios" });
        }
    } catch (error) {
        console.error(error);
        
        // Manejar errores específicos
        if (error.message.includes('Violation of UNIQUE KEY constraint') && error.message.includes('dni')) {
            return res.status(400).json({ message: "Ya existe un apoderado con ese DNI" });
        }
        
        res.status(500).json({
            message: "Error al actualizar el apoderado",
            error: error.message
        });
    }
};

/**
 * Elimina un apoderado
 */
export const deleteApoderado = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await apoderadoModel.delete(parseInt(id));
        
        if (result.affectedRows > 0) {
            res.json({ message: "Apoderado eliminado con éxito" });
        } else {
            res.status(404).json({ message: "Apoderado no encontrado o ya fue eliminado" });
        }
    } catch (error) {
        console.error(error);
        
        // Manejar errores de restricción de clave foránea
        if (error.message.includes('REFERENCE constraint')) {
            return res.status(400).json({ 
                message: "No se puede eliminar el apoderado porque tiene estudiantes asociados" 
            });
        }
        
        res.status(500).json({
            message: "Error al eliminar el apoderado",
            error: error.message
        });
    }
};

/**
 * Busca un apoderado por su DNI
 */
export const getApoderadoByDni = async (req, res) => {
    try {
        const { dni } = req.params;

        // Validar formato de DNI (8 dígitos)
        if (!/^\d{8}$/.test(dni)) {
            return res.status(400).json({ message: "El DNI debe tener 8 dígitos numéricos" });
        }

        const apoderado = await apoderadoModel.getByDni(dni);
        
        if (apoderado) {
            res.json(apoderado);
        } else {
            res.status(404).json({ message: "Apoderado no encontrado" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al buscar el apoderado",
            error: error.message
        });
    }
};
