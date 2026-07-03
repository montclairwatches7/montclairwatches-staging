/**
 * 002_create_categories.js
 * Creates the categories table exactly as defined in Railway.
 */

exports.up = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id          INT           AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(255)  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      slug        VARCHAR(255)  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      status      ENUM('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
      created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      image_url   VARCHAR(500)  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      UNIQUE KEY name (name),
      UNIQUE KEY slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);
};

exports.down = async (connection) => {
  await connection.query(`DROP TABLE IF EXISTS categories`);
};
