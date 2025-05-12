import sql from 'mssql';
import { config } from './config.js';

async function showTablesAndColumns() {
  try {
    // Conexión
    await sql.connect(config);
    console.log('✅ Conexión exitosa a Azure SQL Database');

    // Consulta de tablas
    const tablesResult = await sql.query`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`;
    console.log('📋 Tablas encontradas:');
    for (const row of tablesResult.recordset) {
      console.log(`- ${row.TABLE_NAME}`);
    }

    // Consulta de columnas
    const columnsResult = await sql.query`SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS ORDER BY TABLE_NAME, ORDINAL_POSITION`;
    console.log('\n🧩 Columnas por tabla:');
    for (const row of columnsResult.recordset) {
      console.log(`${row.TABLE_NAME} → ${row.COLUMN_NAME} (${row.DATA_TYPE})`);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await sql.close();
  }
}

showTablesAndColumns();
