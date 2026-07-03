/**
 * 004_create_addresses.js
 * Creates the addresses table with user FK.
 */

exports.up = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS addresses (
      id          INT          AUTO_INCREMENT PRIMARY KEY,
      user_id     INT          NOT NULL,
      full_name   VARCHAR(150) NOT NULL,
      street      VARCHAR(300) NOT NULL,
      city        VARCHAR(100) NOT NULL,
      state       VARCHAR(100) NULL,
      zip         VARCHAR(20)  NOT NULL,
      country     VARCHAR(100) NOT NULL DEFAULT 'India',
      phone       VARCHAR(20)  NULL,
      is_default  TINYINT(1)   NOT NULL DEFAULT 0,
      created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_id   (user_id),
      INDEX idx_is_default (is_default),
      CONSTRAINT fk_address_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

exports.down = async (connection) => {
  await connection.query(`DROP TABLE IF EXISTS addresses`);
};
