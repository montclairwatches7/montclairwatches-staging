const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 0, // Immediately close idle connections in serverless environments to prevent "Connection lost" errors
  idleTimeout: 10000, // Idle connection timeout of 10 seconds
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Catch connection errors and destroy dead connections to prevent them from remaining in the pool
pool.on('connection', (connection) => {
  connection.on('error', (err) => {
    console.error('MySQL Connection Error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
      connection.destroy();
    }
  });
});

// Convert pool to use promises
const promisePool = pool.promise();

module.exports = promisePool;
