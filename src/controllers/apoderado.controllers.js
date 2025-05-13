import apoderadoModel from '../models/apoderado.model.js';

// Utilidades para validación
const isValidDni = dni => /^\d{8}$/.test(dni);
const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const requiredFields = [
    "nombre",
    "dni",
    "parentesco",
    "ocupacion",
    "grado_instruccion",
    "telefono",
    "email",
    "direccion"
];

const validateRequiredFields = body => {
    const missingFields = requiredFields.filter(field => !body[field]);
    return missingFields.length ? missingFields : null;
};

export const getApoderados = async (req, res) => {
    try {
        const apoderados = await apoderadoModel.getAll();
        res.json(apoderados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener apoderados", error: error.message });
    }
};

export const getApoderado = async (req, res) => {
    try {
        const apoderado = await apoderadoModel.getById(Number(req.params.id));
        apoderado 
            ? res.json(apoderado)
            : res.status(404).json({ message: "Apoderado no encontrado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el apoderado", error: error.message });
    }
};

export const createApoderado = async (req, res) => {
    try {
        const { dni, email } = req.body;

        const missingFields = validateRequiredFields(req.body);
        if (missingFields) {
            return res.status(400).json({ 
                message: `Faltan campos requeridos: ${missingFields.join(', ')}` 
            });
        }

        if (!isValidDni(dni)) {
            return res.status(400).json({ message: "El DNI debe tener 8 dígitos numéricos" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "El formato del email no es válido" });
        }

        const result = await apoderadoModel.create(req.body);

        res.status(201).json({ id: result.id, message: "Apoderado creado con éxito" });

    } catch (error) {
        console.error(error);
        if (error.message.includes('UNIQUE') && error.message.includes('dni')) {
            return res.status(400).json({ message: "Ya existe un apoderado con ese DNI" });
        }
        res.status(500).json({ message: "Error al crear el apoderado", error: error.message });
    }
};

export const updateApoderado = async (req, res) => {
    try {
        const { dni, email } = req.body;
        const { id } = req.params;

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "No hay datos para actualizar" });
        }

        if (dni && !isValidDni(dni)) {
            return res.status(400).json({ message: "El DNI debe tener 8 dígitos numéricos" });
        }

        if (email && !isValidEmail(email)) {
            return res.status(400).json({ message: "El formato del email no es válido" });
        }

        const result = await apoderadoModel.update(Number(id), req.body);

        result.affectedRows > 0
            ? res.json({ message: "Apoderado actualizado con éxito" })
            : res.status(404).json({ message: "Apoderado no encontrado o sin cambios" });

    } catch (error) {
        console.error(error);
        if (error.message.includes('UNIQUE') && error.message.includes('dni')) {
            return res.status(400).json({ message: "Ya existe un apoderado con ese DNI" });
        }
        res.status(500).json({ message: "Error al actualizar el apoderado", error: error.message });
    }
};

export const deleteApoderado = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await apoderadoModel.delete(Number(id));

        result.affectedRows > 0
            ? res.json({ message: "Apoderado eliminado con éxito" })
            : res.status(404).json({ message: "Apoderado no encontrado o ya fue eliminado" });

    } catch (error) {
        console.error(error);
        if (error.message.includes('REFERENCE')) {
            return res.status(400).json({
                message: "No se puede eliminar el apoderado porque tiene estudiantes asociados"
            });
        }
        res.status(500).json({ message: "Error al eliminar el apoderado", error: error.message });
    }
};

export const getApoderadoByDni = async (req, res) => {
    try {
        const { dni } = req.params;

        if (!isValidDni(dni)) {
            return res.status(400).json({ message: "El DNI debe tener 8 dígitos numéricos" });
        }

        const apoderado = await apoderadoModel.getByDni(dni);

        apoderado 
            ? res.json(apoderado)
            : res.status(404).json({ message: "Apoderado no encontrado" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al buscar el apoderado", error: error.message });
    }
};
