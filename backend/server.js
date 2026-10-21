require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const storeRoutes = require("./routes/stores");

if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL and JWT_SECRET must be set in the backend environment.");
}

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

// Confirm the API process is available without requiring authentication.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stores", storeRoutes);

// Return a consistent JSON response for routes that do not exist.
app.use((req, res) => {
  res.status(404).json({ error: "The requested endpoint was not found." });
});

// Return malformed request and unexpected Express errors as JSON.
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must contain valid JSON." });
  }
  console.error("Unhandled API error:", error.message);
  return res.status(500).json({ error: "An unexpected server error occurred." });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Store Rating API listening on port ${port}`);
});
