const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const dns = require("node:dns");

const connectDB = require("./config/db");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be configured with at least 32 characters");
}
connectDB();

const app = express();

// Middleware
const allowedOrigins = new Set(
  (
    process.env.CORS_ORIGINS ||
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,https://donor-x-delta.vercel.app"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by CORS"));
    },
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/donors", require("./routes/donorRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/blood-banks", require("./routes/bankRoutes"));
app.use("/api/surveys", require("./routes/surveyRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Serve the built frontend from the same origin when deployed as one service.
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendDist));
app.get("/{*path}", (req, res, next) => {
  if (req.path.startsWith("/api/") || req.path === "/health") return next();
  res.sendFile(path.join(frontendDist, "index.html"), (error) => {
    if (error) next();
  });
});

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "🩸 Blood Donor API - Chhatrapati Sambhaji Nagar is running!",
  });
});
app.get("/health", (req, res) => {
  const connected = require("mongoose").connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "unavailable",
    database: connected ? "connected" : "disconnected",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
