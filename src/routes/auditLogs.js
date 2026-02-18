const express = require("express");
const router = express.Router();
const authenticateToken = require("./middleware/authMiddleware");
const authorizeRole = require("./middleware/roleMiddleware");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/* ADMIN ONLY */
router.get(
  "/",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    const logs = await prisma.audit_logs.findMany({
      include: {
        users: true
      },
      orderBy: { created_at: "desc" }
    });

    res.json(logs);
  }
);

module.exports = router;
