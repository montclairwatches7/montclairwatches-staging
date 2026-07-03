/**
 * initDb.js — Legacy entry point, now delegates to the migration system.
 * Run with: node src/config/initDb.js
 */
const { runMigrations } = require("../database/migrator");

runMigrations()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
