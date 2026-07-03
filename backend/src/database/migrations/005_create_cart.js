/**
 * 005_create_cart.js
 * Creates the cart_items table exactly as defined in Railway.
 */

exports.up = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id          INT      AUTO_INCREMENT PRIMARY KEY,
      user_id     INT      NOT NULL,
      product_id  INT      NOT NULL,
      quantity    INT      DEFAULT 1,
      created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY user_product_cart (user_id, product_id),
      KEY product_id (product_id),
      CONSTRAINT fk_cart_items_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      CONSTRAINT fk_cart_items_product_id FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);
};

exports.down = async (connection) => {
  await connection.query(`DROP TABLE IF EXISTS cart_items`);
};
