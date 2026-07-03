/**
 * 008_create_dynamic_modules.js
 * Creates all CMS/dynamic tables exactly as defined in Railway:
 *   banners, testimonials, posts, faqs, brands,
 *   teams, reviews, notifications, services, pages
 */

exports.up = async (connection) => {
  // ── banners ──────────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS banners (
      id                INT          AUTO_INCREMENT PRIMARY KEY,
      title             VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      subtitle          TEXT         CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      image_url         VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      mobile_image_url  VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      cta_1_text        VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      cta_1_link        VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '/collection',
      cta_2_text        VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      cta_2_link        VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '/collection',
      status            ENUM('active','inactive','draft') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
      display_order     INT          DEFAULT 0,
      created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // ── testimonials ─────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id                    INT          AUTO_INCREMENT PRIMARY KEY,
      user_name             VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      content               TEXT         CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      rating                INT          DEFAULT 5,
      is_verified_purchase  TINYINT(1)   DEFAULT 1,
      status                ENUM('active','inactive','draft') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
      created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // ── posts (blog) ──────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id                  INT          AUTO_INCREMENT PRIMARY KEY,
      title               VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      slug                VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      excerpt             TEXT         CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      content             LONGTEXT     CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      featured_image_url  VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      author_id           INT          DEFAULT NULL,
      category            VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'General',
      status              ENUM('published','draft','archived') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'draft',
      created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // ── faqs ──────────────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS faqs (
      id          INT          AUTO_INCREMENT PRIMARY KEY,
      question    TEXT         CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      answer      TEXT         CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      category    VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'General',
      status      ENUM('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
      created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // ── brands ────────────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS brands (
      id          INT          AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      logo_url    VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      is_premium  TINYINT(1)   DEFAULT 0,
      status      ENUM('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
      created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // ── teams ─────────────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS teams (
      id          INT          AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      role        VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      bio         TEXT         CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      avatar_url  VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      status      ENUM('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
      created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // ── reviews ───────────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id          INT           AUTO_INCREMENT PRIMARY KEY,
      product_id  INT           NOT NULL,
      user_id     INT           NOT NULL,
      rating      DECIMAL(2,1)  NOT NULL,
      comment     TEXT          CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      status      ENUM('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'approved',
      created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY product_id (product_id),
      KEY user_id (user_id),
      CONSTRAINT fk_reviews_product_id FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
      CONSTRAINT fk_reviews_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // ── notifications ─────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id          INT          AUTO_INCREMENT PRIMARY KEY,
      user_id     INT          NOT NULL,
      title       VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      message     TEXT         CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      is_read     TINYINT(1)   DEFAULT 0,
      action_url  VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY user_id (user_id),
      CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // ── services ──────────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS services (
      id            INT          AUTO_INCREMENT PRIMARY KEY,
      title         VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      description   TEXT         CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      icon_name     VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      status        ENUM('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
      display_order INT          DEFAULT 0,
      created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // ── pages ─────────────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS pages (
      id          INT          AUTO_INCREMENT PRIMARY KEY,
      title       VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      slug        VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      content     LONGTEXT     CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      status      ENUM('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
      created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
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
