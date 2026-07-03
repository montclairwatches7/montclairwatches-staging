/**
 * 008_create_dynamic_modules.js
 * Creates all tables used by the generic CRUD module system in server.js:
 *   banners, testimonials, posts, faqs, brands,
 *   teams, reviews, notifications, services, pages
 */

exports.up = async (connection) => {
  // ── banners ──────────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS banners (
      id          INT          AUTO_INCREMENT PRIMARY KEY,
      title       VARCHAR(255) NOT NULL,
      subtitle    VARCHAR(500) NULL,
      image       VARCHAR(500) NULL,
      link        VARCHAR(500) NULL,
      position    INT          NOT NULL DEFAULT 0,
      status      ENUM('active','inactive') NOT NULL DEFAULT 'active',
      created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // ── testimonials ─────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id          INT          AUTO_INCREMENT PRIMARY KEY,
      user_name   VARCHAR(150) NOT NULL,
      user_avatar VARCHAR(500) NULL,
      rating      TINYINT      NOT NULL DEFAULT 5,
      message     TEXT         NOT NULL,
      designation VARCHAR(150) NULL,
      status      ENUM('active','inactive') NOT NULL DEFAULT 'active',
      created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // ── posts (blog) ──────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id          INT          AUTO_INCREMENT PRIMARY KEY,
      title       VARCHAR(255) NOT NULL,
      slug        VARCHAR(300) NULL UNIQUE,
      content     LONGTEXT     NULL,
      excerpt     TEXT         NULL,
      image       VARCHAR(500) NULL,
      author      VARCHAR(150) NULL,
      tags        JSON         NULL,
      status      ENUM('active','inactive','draft') NOT NULL DEFAULT 'draft',
      created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_slug   (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // ── faqs ──────────────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS faqs (
      id          INT          AUTO_INCREMENT PRIMARY KEY,
      question    TEXT         NOT NULL,
      answer      TEXT         NOT NULL,
      position    INT          NOT NULL DEFAULT 0,
      status      ENUM('active','inactive') NOT NULL DEFAULT 'active',
      created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // ── brands ────────────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS brands (
      id          INT          AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(150) NOT NULL,
      logo        VARCHAR(500) NULL,
      website     VARCHAR(500) NULL,
      position    INT          NOT NULL DEFAULT 0,
      status      ENUM('active','inactive') NOT NULL DEFAULT 'active',
      created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // ── teams ─────────────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS teams (
      id          INT          AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(150) NOT NULL,
      role        VARCHAR(150) NULL,
      bio         TEXT         NULL,
      avatar      VARCHAR(500) NULL,
      social      JSON         NULL,
      position    INT          NOT NULL DEFAULT 0,
      status      ENUM('active','inactive') NOT NULL DEFAULT 'active',
      created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // ── reviews ───────────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id          INT           AUTO_INCREMENT PRIMARY KEY,
      user_id     INT           NULL,
      product_id  INT           NULL,
      user_name   VARCHAR(150)  NULL,
      rating      TINYINT       NOT NULL DEFAULT 5,
      comment     TEXT          NULL,
      status      ENUM('active','inactive','pending') NOT NULL DEFAULT 'pending',
      created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_product_id (product_id),
      INDEX idx_status     (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // ── notifications ─────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id          INT          AUTO_INCREMENT PRIMARY KEY,
      title       VARCHAR(255) NOT NULL,
      message     TEXT         NOT NULL,
      type        VARCHAR(50)  NULL DEFAULT 'info',
      user_id     INT          NULL COMMENT 'NULL = broadcast to all',
      is_read     TINYINT(1)   NOT NULL DEFAULT 0,
      status      ENUM('active','inactive') NOT NULL DEFAULT 'active',
      created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_status  (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // ── services ──────────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS services (
      id          INT          AUTO_INCREMENT PRIMARY KEY,
      title       VARCHAR(255) NOT NULL,
      description TEXT         NULL,
      icon        VARCHAR(100) NULL,
      image       VARCHAR(500) NULL,
      position    INT          NOT NULL DEFAULT 0,
      status      ENUM('active','inactive') NOT NULL DEFAULT 'active',
      created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // ── pages (static CMS pages) ──────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS pages (
      id          INT          AUTO_INCREMENT PRIMARY KEY,
      title       VARCHAR(255) NOT NULL,
      slug        VARCHAR(300) NOT NULL UNIQUE,
      content     LONGTEXT     NULL,
      meta_title  VARCHAR(255) NULL,
      meta_desc   TEXT         NULL,
      status      ENUM('active','inactive') NOT NULL DEFAULT 'active',
      created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_slug   (slug),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

exports.down = async (connection) => {
  const tables = [
    "pages", "services", "notifications", "reviews",
    "teams", "brands", "faqs", "posts", "testimonials", "banners",
  ];
  for (const table of tables) {
    await connection.query(`DROP TABLE IF EXISTS ${table}`);
  }
};
