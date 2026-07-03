/**
 * 001_create_users.js
 * Creates the users table with all required fields.
 */

exports.up = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            INT           AUTO_INCREMENT PRIMARY KEY,
      name          VARCHAR(150)  NOT NULL,
      email         VARCHAR(255)  NOT NULL UNIQUE,
      password      VARCHAR(255)  NULL,
      phone         VARCHAR(20)   NULL,
      avatar        VARCHAR(500)  NULL,
      role          ENUM('user','admin') NOT NULL DEFAULT 'user',
      is_blocked    TINYINT(1)    NOT NULL DEFAULT 0,
      google_id     VARCHAR(255)  NULL,
      reset_token   VARCHAR(255)  NULL,
      reset_token_expiry DATETIME NULL,
      created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_role  (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

exports.down = async (connection) => {
  await connection.query(`DROP TABLE IF EXISTS users`);
};
