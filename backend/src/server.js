require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const storeRoutes = require("./routes/storeRoutes");
const orderRoutes = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const { createGenericController } = require("./controllers/genericController");
const { createGenericRouter } = require("./routes/genericRouter");
const { validateRequestPayload } = require("./validators/schemas");
const uploadRoutes = require("./routes/uploadRoutes");
const { runMigrations } = require("./database/migrator");


const app = express();
const PORT = process.env.PORT || 5005;

// ─── Security Headers (helmet) ─────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow image serving
  })
);

// ─── CORS — Restrict to allowed origins only ───────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,       // e.g. https://montclairwatches.com (set in hPanel)
  "http://localhost:8080",         // local dev (frontend)
  "http://localhost:5173",         // local dev (Vite alt port)
  "http://127.0.0.1:8080",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);

// ─── Rate Limiting ──────────────────────────────────────────────────────────
// General API limiter: 200 requests per 15 min per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Strict auth limiter: 10 requests per 15 min per IP (prevents brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again in 15 minutes." },
});

// Payment limiter: 30 requests per 15 min per IP
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many payment requests, please slow down." },
});

app.use("/api/", generalLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/payment", paymentLimiter);

// ─── Body Parsers ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ─── Static Uploads ─────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/upload", uploadRoutes);

// ─── Dynamic Generic Modules ─────────────────────────────────────────────────
const dynamicModules = [
  "banners", "testimonials", "posts", "faqs",
  "brands", "teams", "reviews", "notifications",
  "services", "pages",
];

dynamicModules.forEach((moduleName) => {
  const controller = createGenericController(moduleName);
  const validationMiddleware = [validateRequestPayload(moduleName)];
  const router = createGenericRouter(controller, validationMiddleware);
  app.use(`/api/${moduleName}`, router);
});

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/api", (req, res) => {
  res.json({ status: "ok", message: "Montclair Luxury API is running." });
});

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Montclair Luxury API is running." });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith("CORS")) {
    return res.status(403).json({ message: err.message });
  }
  console.error("Server Error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

// ─── Start Server (Regular mode — Hostinger / local dev) ─────────────────────
const startServer = async () => {
  try {
    await runMigrations();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Montclair Server running on Port ${PORT}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("💥 Failed to start server:", error.message);
    process.exit(1);
  }
};

// ─── Dual Mode Export ─────────────────────────────────────────────────────────
// When run directly (node server.js → Hostinger / local dev): start the server
// When required by Netlify Functions: just export the app
if (require.main === module) {
  startServer();
}

module.exports = { app, runMigrations };
