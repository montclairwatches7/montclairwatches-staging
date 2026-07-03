/**
 * migrator.js — Safe Database Migration Runner
 *
 * How it works:
 * 1. Creates `migrations` table if not exists (tracks what's already run)
 * 2. Reads all migration files in order (001_, 002_, ...)
 * 3. Skips any already-run migrations
 * 4. Runs new migrations inside a transaction (rollback on failure)
 * 5. Logs each migration with timestamp
 *
 * Usage:
 *   node src/database/migrator.js        ← run manually
 *   Auto-called from server.js on start  ← automatic on deploy
 */

require("dotenv").config();
const db = require("../config/db");
const fs = require("fs");
const path = require("path");

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

// ─── Ensure migrations tracking table exists ───────────────────────────────
const ensureMigrationsTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(255) NOT NULL UNIQUE,
      run_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      batch       INT          NOT NULL DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

// ─── Get list of already-run migrations ────────────────────────────────────
const getRanMigrations = async () => {
  const [rows] = await db.query("SELECT name FROM migrations ORDER BY id ASC");
  return new Set(rows.map((r) => r.name));
};

// ─── Get next batch number ─────────────────────────────────────────────────
const getNextBatch = async () => {
  const [[{ maxBatch }]] = await db.query(
    "SELECT COALESCE(MAX(batch), 0) as maxBatch FROM migrations"
  );
  return maxBatch + 1;
};

// ─── Run all pending migrations ────────────────────────────────────────────
const runMigrations = async () => {
  try {
    console.log("🗄️  Running database migrations...");

    await ensureMigrationsTable();

    const ranMigrations = await getRanMigrations();

    // Read and sort migration files (001_, 002_, ...)
    const migrationFiles = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".js") && /^\d{3}_/.test(f))
      .sort();

    // Filter only pending migrations
    const pending = migrationFiles.filter((f) => !ranMigrations.has(f));

    if (pending.length === 0) {
      console.log("✅ Database is up to date. No migrations to run.");
      return;
    }

    console.log(`📋 Found ${pending.length} pending migration(s):`);
    pending.forEach((f) => console.log(`   → ${f}`));

    const batch = await getNextBatch();

    for (const file of pending) {
      const migration = require(path.join(MIGRATIONS_DIR, file));
      const connection = await db.getConnection();

      try {
        await connection.beginTransaction();

        console.log(`⏳ Running: ${file}`);
        await migration.up(connection);

        // Record as complete
        await connection.query(
          "INSERT INTO migrations (name, batch) VALUES (?, ?)",
          [file, batch]
        );

        await connection.commit();
        console.log(`✅ Done:    ${file}`);
      } catch (error) {
        await connection.rollback();
        console.error(`❌ Failed:  ${file}`);
        console.error(`   Error:   ${error.message}`);
        throw error; // Stop all further migrations on failure
      } finally {
        connection.release();
      }
    }

    console.log(`🎉 All migrations complete! (Batch #${batch})`);
  } catch (error) {
    console.error("💥 Migration runner failed:", error.message);
    throw error;
  }
};

// ─── Rollback last batch ───────────────────────────────────────────────────
const rollbackLastBatch = async () => {
  try {
    await ensureMigrationsTable();

    const [[{ maxBatch }]] = await db.query(
      "SELECT COALESCE(MAX(batch), 0) as maxBatch FROM migrations"
    );

    if (maxBatch === 0) {
      console.log("ℹ️  Nothing to rollback.");
      return;
    }

    const [toRollback] = await db.query(
      "SELECT name FROM migrations WHERE batch = ? ORDER BY id DESC",
      [maxBatch]
    );

    console.log(`🔄 Rolling back batch #${maxBatch} (${toRollback.length} migration(s)):`);

    for (const { name } of toRollback) {
      const migration = require(path.join(MIGRATIONS_DIR, name));
      const connection = await db.getConnection();

      try {
        await connection.beginTransaction();

        if (typeof migration.down === "function") {
          console.log(`⏳ Rolling back: ${name}`);
          await migration.down(connection);
        } else {
          console.log(`⚠️  No down() for: ${name} — skipping`);
        }

        await connection.query("DELETE FROM migrations WHERE name = ?", [name]);
        await connection.commit();
        console.log(`✅ Rolled back: ${name}`);
      } catch (error) {
        await connection.rollback();
        console.error(`❌ Rollback failed for: ${name} — ${error.message}`);
        throw error;
      } finally {
        connection.release();
      }
    }

    console.log("✅ Rollback complete.");
  } catch (error) {
    console.error("💥 Rollback failed:", error.message);
    throw error;
  }
};

// ─── CLI Support: node migrator.js rollback ────────────────────────────────
if (require.main === module) {
  const cmd = process.argv[2];

  const run = cmd === "rollback" ? rollbackLastBatch : runMigrations;

  run()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runMigrations, rollbackLastBatch };
