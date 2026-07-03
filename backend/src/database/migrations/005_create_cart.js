/**
 * 005_create_cart.js
 * Creates cart and cart_items tables.
 *
 * Note: Your codebase uses both `cart` (cartModel.js) and `cart_items`
 * (orderController.js). Both are created here for full compatibility.
 */

exports.up = async (connection) => {
  // Main cart table (used by cartModel.js)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS cart (
      id          INT      AUTO_INCREMENT PRIMARY KEY,
      user_id     INT      NOT NULL,
      product_id  INT      NOT NULL,
      quantity    INT      NOT NULL DEFAULT 1,
      created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_user_product (user_id, product_id),
      INDEX idx_user_id    (user_id),
      INDEX idx_product_id (product_id),
      CONSTRAINT fk_cart_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_cart_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // cart_items alias (used in orderController.js DELETE query)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id          INT      AUTO_INCREMENT PRIMARY KEY,
      user_id     INT      NOT NULL,
      product_id  INT      NOT NULL,
      quantity    INT      NOT NULL DEFAULT 1,
      created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_user_product_ci (user_id, product_id),
      INDEX idx_ci_user_id    (user_id),
      INDEX idx_ci_product_id (product_id),
      CONSTRAINT fk_cart_items_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_cart_items_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

exports.down = async (connection) => {
  await connection.query(`DROP TABLE IF EXISTS cart_items`);
  await connection.query(`DROP TABLE IF EXISTS cart`);
};
