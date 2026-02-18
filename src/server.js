require("dotenv").config();
const express = require("express");

const app = express();

// ✅ Parse JSON body
app.use(express.json());

/* ===============================
   ROUTES
================================= */

// Auth routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const documentRoutes = require("./routes/documents");
app.use("/documents", documentRoutes);

app.use("/uploads", express.static("uploads"));

const folderRoutes = require("./routes/folders");
app.use("/folders", folderRoutes);

const auditLogsRoutes = require("./routes/auditLogs");
app.use("/audit", auditLogsRoutes);

// Middlewares
const authenticateToken = require("./routes/middleware/authMiddleware");
const authorizeRole = require("./routes/middleware/roleMiddleware");

/* ===============================
   PROTECTED ADMIN ROUTE
================================= */

app.get(
  "/admin/dashboard",
  authenticateToken,
  authorizeRole("admin"),
  (req, res) => {
    res.json({
      message: "Welcome Admin Dashboard",
      user: req.user
    });
  }
);

/* ===============================
   TEST ROOT ROUTE (OPTIONAL)
================================= */

app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

/* ===============================
   START SERVER
================================= */

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
