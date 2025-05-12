// connect.js
import sql from 'mssql';
import { config } from './config.js';

async function testConnection() {
  try {
    await sql.connect(config);
    console.log('✅ Conexión exitosa a Azure SQL Database');
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
  } finally {
    await sql.close();
  }
}

testConnection();
