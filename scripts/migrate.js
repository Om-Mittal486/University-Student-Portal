const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'passwordledhubro@2007',
  multipleStatements: true // VERY IMPORTANT for running script
};

async function migrate() {
  try {
    const sqlPath = path.join(__dirname, '../database/complete_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Connecting to MySQL...');
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('Executing schema...');
    await connection.query(sql);
    
    console.log('Schema applied successfully!');
    await connection.end();
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

migrate();
