/**
 * 007_create_coupons.js
 * Creates coupons and coupon_usage tables.
 */

exports.up = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id                   INT             AUTO_INCREMENT PRIMARY KEY,
      code                 VARCHAR(50)     NOT NULL UNIQUE,
      discount_type        ENUM('percentage','fixed') NOT NULL DEFAULT 'percentage',
      discount_value       DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
      min_order_value      DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
      max_discount_limit   DECIMAL(10,2)   NULL,
      start_date           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expiry_date          DATETIME        NOT NULL,
      usage_limit_total    INT             NULL COMMENT 'NULL = unlimited',
      usage_limit_per_user INT             NOT NULL DEFAULT 1,
      used_count           INT             NOT NULL DEFAULT 0,
      status               ENUM('active','inactive') NOT NULL DEFAULT 'active',
      created_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_code       (code),
      INDEX idx_status     (status),
      INDEX idx_expiry     (expiry_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS coupon_usage (
      id         INT      AUTO_INCREMENT PRIMARY KEY,
      coupon_id  INT      NOT NULL,
      user_id    INT      NOT NULL,
      order_id   INT      NOT NULL,
      used_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_coupon_user_order (coupon_id, user_id, order_id),
      INDEX idx_coupon_id (coupon_id),
      INDEX idx_user_id   (user_id),
      CONSTRAINT fk_usage_coupon
        FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
      CONSTRAINT fk_usage_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_usage_order
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

exports.down = async (connection) => {
  await connection.query(`DROP TABLE IF EXISTS coupon_usage`);
  await connection.query(`DROP TABLE IF EXISTS coupons`);
};
