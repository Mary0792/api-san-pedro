import { getConnection, testConnection } from './connection.js';
import sql from 'mssql';

// Crear un objeto pool que sea compatible con la interfaz que esperan los controladores
export const pool = {
  query: async (text, params) => {
    try {
      const pool = await getConnection();
      const request = pool.request();
      
      // Agregar parámetros si existen
      if (params && Array.isArray(params)) {
        params.forEach((param, index) => {
          request.input(`param${index}`, param);
        });
      }
      
      // Reemplazar los marcadores de posición ? con @paramX
      let modifiedText = text;
      if (params && Array.isArray(params)) {
        params.forEach((_, index) => {
          modifiedText = modifiedText.replace('?', `@param${index}`);
        });
      }
      
      const result = await request.query(modifiedText);
      return [result.recordset, result];
    } catch (error) {
      console.error('Error en la consulta:', error);
      throw error;
    }
  },
  
  getConnection: async () => {
    return await getConnection();
  }
};

// Reexportar las funciones de connection.js
export { getConnection, testConnection };

// Exportar sql para utilidades
export { sql };
