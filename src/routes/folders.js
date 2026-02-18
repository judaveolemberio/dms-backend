const express = require("express");
const router = express.Router();
const authenticateToken = require("./middleware/authMiddleware");
const authorizeRole = require("./middleware/roleMiddleware");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/* =========================================
   POST /folders
   Create folder (Admin only)
========================================= */
router.post(
  "/",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const { name } = req.body;

      const folder = await prisma.folders.create({
        data: { name }
      });

      res.status(201).json(folder);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to create folder" });
    }
  }
);

/* =========================================
   GET /folders
========================================= */
router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    const folders = await prisma.folders.findMany({
      include: {
        documents: true
      }
    });

    res.json(folders);
  }
);

module.exports = router;
