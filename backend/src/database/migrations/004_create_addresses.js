/**
 * 004_create_addresses.js
 * Creates the addresses table exactly as defined in Railway.
 */

exports.up = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS addresses (
      id          INT          AUTO_INCREMENT PRIMARY KEY,
      user_id     INT          NOT NULL,
      full_name   VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      street      VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      city        VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      zip         VARCHAR(20)  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      is_default  TINYINT(1)   DEFAULT 0,
      phone       VARCHAR(20)  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      KEY user_id (user_id),
      CONSTRAINT fk_addresses_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);
};

exports.down = async (connection) => {
  await connection.query(`DROP TABLE IF EXISTS addresses`);
};
