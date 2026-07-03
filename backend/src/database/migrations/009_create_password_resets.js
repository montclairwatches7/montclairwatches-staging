/**
 * 009_create_password_resets.js
 * Creates the password_resets table exactly as defined in Railway.
 */

exports.up = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id          INT          AUTO_INCREMENT PRIMARY KEY,
      email       VARCHAR(255) NOT NULL,
      otp         VARCHAR(6)   NOT NULL,
      expires_at  TIMESTAMP    NOT NULL,
      created_at  TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
      KEY email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);
};

exports.down = async (connection) => {
  await connection.query(`DROP TABLE IF EXISTS password_resets`);
};
