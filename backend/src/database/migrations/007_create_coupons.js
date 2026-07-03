/**
 * 007_create_coupons.js
 * Creates coupons and coupon_usage tables exactly as defined in Railway.
 */

exports.up = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id                    INT             AUTO_INCREMENT PRIMARY KEY,
      code                  VARCHAR(50)     CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      discount_type         ENUM('percentage','fixed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      discount_value        DECIMAL(10,2)   NOT NULL,
      min_order_value       DECIMAL(10,2)   DEFAULT 0.00,
      max_discount_limit    DECIMAL(10,2)   DEFAULT NULL,
      start_date            DATETIME        DEFAULT CURRENT_TIMESTAMP,
      expiry_date           DATETIME        NOT NULL,
      usage_limit_total     INT             DEFAULT NULL,
      usage_limit_per_user  INT             DEFAULT 1,
      used_count            INT             DEFAULT 0,
      status                ENUM('active','inactive','disabled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
      created_at            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY code (code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS coupon_usage (
      id                INT             AUTO_INCREMENT PRIMARY KEY,
      coupon_id         INT             NOT NULL,
      user_id           INT             NOT NULL,
      order_id          INT             NOT NULL,
      discount_amount   DECIMAL(10,2)   NOT NULL,
      used_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY coupon_id (coupon_id),
      KEY user_id (user_id),
      KEY order_id (order_id),
      CONSTRAINT fk_coupon_usage_coupon_id FOREIGN KEY (coupon_id) REFERENCES coupons (id) ON DELETE CASCADE,
      CONSTRAINT fk_coupon_usage_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      CONSTRAINT fk_coupon_usage_order_id FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);
};

exports.down = async (connection) => {
  await connection.query(`DROP TABLE IF EXISTS coupon_usage`);
  await connection.query(`DROP TABLE IF EXISTS coupons`);
};
