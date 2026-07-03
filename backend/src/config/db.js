const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

// ─── SSL Config (required for Aiven, optional for Railway/Hostinger) ────────
// Set DB_SSL=true in env vars when using Aiven MySQL
const sslConfig = process.env.DB_SSL === "true"
  ? { rejectUnauthorized: true }   // Aiven / any managed MySQL with SSL
  : false;                          // Railway / Hostinger (no SSL needed)

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     parseInt(process.env.DB_PORT) || 3306,

  // ─── Connection Pool Settings ──────────────────────────────────────────
  waitForConnections: true,
  connectionLimit: process.env.NODE_ENV === "production" ? 5 : 10,
  maxIdle: 0,            // Close idle connections immediately (serverless-safe)
  idleTimeout: 10000,    // 10s idle timeout
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  // ─── SSL (Aiven requires this, Railway/Hostinger don't) ──────────────
  ssl: sslConfig,
});

// ─── Catch connection errors ────────────────────────────────────────────────
pool.on("connection", (connection) => {
  connection.on("error", (err) => {
    console.error("MySQL Connection Error:", err.code);
    if (
      err.code === "PROTOCOL_CONNECTION_LOST" ||
      err.code === "ECONNRESET" ||
      err.code === "ENOTFOUND"
    ) {
      connection.destroy();
    }
  });
});

const promisePool = pool.promise();

module.exports = promisePool;
