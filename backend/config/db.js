const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'srm_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL Database connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Failed:', err.message);
    console.error('   Make sure MySQL is running and credentials are correct in backend/config/db.js');
  });

module.exports = pool;
