/**
 * 002_create_categories.js
 * Creates the categories table.
 */

exports.up = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id          INT           AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(150)  NOT NULL,
      slug        VARCHAR(200)  NOT NULL UNIQUE,
      image       VARCHAR(500)  NULL,
      description TEXT          NULL,
      status      ENUM('active','inactive') NOT NULL DEFAULT 'active',
      created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_slug   (slug),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

exports.down = async (connection) => {
  await connection.query(`DROP TABLE IF EXISTS categories`);
};
