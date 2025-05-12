import sql from 'mssql';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();


// Configuración de la base de datos usando variables de entorno
const dbConfig = {
    server: "mibasedb.database.windows.net",
    user: "yonsn76",
    password: "76Yonsn7",
    database: "matricula",
    options: {
        encrypt: true, // Para conexiones Azure
        trustServerCertificate: false, // Cambiar a true para desarrollo local
        connectionTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '30000'),
        requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT || '30000'),
        pool: {
            max: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
            min: 0,
            idleTimeoutMillis: 30000
        }
    }
};

// Pool de conexiones global
let pool = null;

// Función para inicializar el pool de conexiones
const initPool = async () => {
    try {
        if (!pool) {
            pool = await new sql.ConnectionPool(dbConfig).connect();
            console.log('Pool de conexiones SQL Server inicializado');
        }
        return pool;
    } catch (error) {
        console.error('Error al inicializar el pool de conexiones:', error.message);
        throw error;
    }
};

// Función para obtener la conexión
export const getConnection = async () => {
    if (!pool) {
        await initPool();
    }
    return pool;
};

// Función para probar la conexión
export const testConnection = async () => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT 1 as test');
        console.log('Conexión a la base de datos exitosa');
        return true;
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
        return false;
    }
};

// Inicializar el pool al cargar el módulo
initPool().catch(err => {
    console.error('Error al inicializar el pool:', err.message);
});

// Exportamos funciones para que puedan ser usadas en toda la aplicación
export default {
    getConnection,
    testConnection,
    sql // Exportamos el módulo sql para usar sus utilidades
};