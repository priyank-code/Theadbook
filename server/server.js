const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

// All Route Imports
const authRoutes = require("./routes/authRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const playlistRoutes = require("./routes/playlistRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const clientRoutes = require("./routes/clientRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const deviceLogRoutes = require("./routes/deviceLogRoutes");
const locationRoutes = require("./routes/locationRoutes");
const billingRoutes = require("./routes/billingRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const alertRoutes = require("./routes/alertRoutes");
const supportRoutes = require("./routes/supportRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// 1. Security & Middleware Configuration
app.use(helmet()); // Sets secure HTTP headers

// HTTP Request Logger
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(express.json({ limit: "50mb" })); // Increased body size limit for heavy assets
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// CORS Policy Configuration for Production Frontend
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL || "https://theadbook.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV === "development"
      ) {
        callback(null, true);
      } else {
        callback(
          new Error("Blocked by CORS policy - TheAdBook Security Engine"),
        );
      }
    },
    credentials: true,
  }),
);

// 3. Database Connection with Production Options
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/theadbook_cms";

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() =>
    console.log("MongoDB Connected Successfully to TheAdBook Production DB"),
  )
  .catch((err) => {
    console.error("MongoDB Connection Failed:", err.message);
    process.exit(1);
  });

// 4. API Routes Mounting (All modules integrated)
app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/logs", deviceLogRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Root Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    service: "TheAdBook DOOH CMS Core Engine",
    environment: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString(),
  });
});

// 5. Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[Error Handler]: ${err.stack}`);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 6. Start Server Listener & Vercel Export
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(
      `🚀 Production Server running securely on port ${PORT} (Unlimited Access Mode)`,
    );
  });
}

module.exports = app;