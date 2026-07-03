/**
 * 006_create_orders.js
 * Creates orders and order_items tables.
 */

exports.up = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id               INT             AUTO_INCREMENT PRIMARY KEY,
      user_id          INT             NOT NULL,
      total_amount     DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
      discount_amount  DECIMAL(10,2)   NULL DEFAULT 0.00,
      shipping_address JSON            NULL,
      status           ENUM(
                         'payment_pending',
                         'pending',
                         'processing',
                         'shipped',
                         'delivered',
                         'cancelled',
                         'refunded'
                       ) NOT NULL DEFAULT 'payment_pending',
      payment_id       VARCHAR(100)    NULL,
      payment_method   VARCHAR(50)     NULL DEFAULT 'razorpay',
      coupon_code      VARCHAR(50)     NULL,
      cancel_reason    TEXT            NULL,
      tracking_number  VARCHAR(100)    NULL,
      notes            TEXT            NULL,
      created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_id    (user_id),
      INDEX idx_status     (status),
      INDEX idx_payment_id (payment_id),
      CONSTRAINT fk_order_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id          INT           AUTO_INCREMENT PRIMARY KEY,
      order_id    INT           NOT NULL,
      product_id  INT           NOT NULL,
      quantity    INT           NOT NULL DEFAULT 1,
      price       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_order_id   (order_id),
      INDEX idx_product_id (product_id),
      CONSTRAINT fk_order_item_order
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      CONSTRAINT fk_order_item_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

exports.down = async (connection) => {
  await connection.query(`DROP TABLE IF EXISTS order_items`);
  await connection.query(`DROP TABLE IF EXISTS orders`);
};
