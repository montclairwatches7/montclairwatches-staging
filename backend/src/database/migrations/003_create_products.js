/**
 * 003_create_products.js
 * Creates the products table with category FK.
 */

exports.up = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS products (
      id            INT             AUTO_INCREMENT PRIMARY KEY,
      name          VARCHAR(255)    NOT NULL,
      slug          VARCHAR(300)    NULL,
      description   TEXT            NULL,
      price         DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
      original_price DECIMAL(10,2)  NULL,
      stock         INT             NOT NULL DEFAULT 0,
      category      INT             NULL,
      brand         VARCHAR(150)    NULL,
      image         VARCHAR(500)    NULL,
      images        JSON            NULL,
      sku           VARCHAR(100)    NULL UNIQUE,
      weight        DECIMAL(8,2)    NULL,
      status        ENUM('active','inactive','out_of_stock') NOT NULL DEFAULT 'active',
      is_featured   TINYINT(1)      NOT NULL DEFAULT 0,
      rating        DECIMAL(3,2)    NULL DEFAULT 0.00,
      review_count  INT             NOT NULL DEFAULT 0,
      created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status      (status),
      INDEX idx_category    (category),
      INDEX idx_is_featured (is_featured),
      CONSTRAINT fk_product_category
        FOREIGN KEY (category) REFERENCES categories(id)
        ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

exports.down = async (connection) => {
  await connection.query(`DROP TABLE IF EXISTS products`);
};
