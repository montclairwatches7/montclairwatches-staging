/**
 * netlify/functions/api.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Netlify Serverless Function — wraps the Express app for staging.
 *
 * How it works:
 *   1. Imports the Express app from backend/src/server.js
 *   2. On first cold start: runs DB migrations automatically
 *   3. On every request: serverless-http converts Lambda event → Express request
 *
 * Branch:  staging only
 * DB:      Railway MySQL (staging) — set via Netlify env vars
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use strict";

const serverless = require("serverless-http");
const { app, runMigrations } = require("../../backend/src/server");

// ─── Cold-start migration flag ─────────────────────────────────────────────
// Netlify Functions share a process per warm instance.
// This ensures migrations run only once per cold start, not on every request.
let migrationsInitialized = false;

const handler = async (event, context) => {
  // Prevent Lambda from waiting for MySQL connection pool to drain
  context.callbackWaitsForEmptyEventLoop = false;

  // Run migrations on cold start (first invocation)
  if (!migrationsInitialized) {
    try {
      await runMigrations();
      migrationsInitialized = true;
    } catch (error) {
      console.error("Migration failed on cold start:", error.message);
      // Don't crash the function — DB might already be set up
      migrationsInitialized = true;
    }
  }

  // Hand off to Express via serverless-http
  return serverless(app)(event, context);
};

module.exports = { handler };
