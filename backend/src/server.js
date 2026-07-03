require("dotenv").config();
const express = require("express");
const cors = require("cors");
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

const app = express();
const PORT = process.env.PORT || 5005;

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
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
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/upload", uploadRoutes);

const dynamicModules = ['banners', 'testimonials', 'posts', 'faqs', 'brands', 'teams', 'reviews', 'notifications', 'services', 'pages'];
dynamicModules.forEach((moduleName) => {
  const controller = createGenericController(moduleName);
  const validationMiddleware = [validateRequestPayload(moduleName)];
  const router = createGenericRouter(controller, validationMiddleware);
  app.use(`/api/${moduleName}`, router);
});

app.get("/", (req, res) => {
  res.send("Montclair Luxury API is running...");
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Montclair Server Securely Dispatched on Port ${PORT}`);
    console.log(`🔗 API Endpoint: http://localhost:${PORT}/api`);
  });
}

module.exports = app;
