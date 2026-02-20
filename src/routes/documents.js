const express = require("express");
const router = express.Router();

const upload = require("../config/multer");
const authenticateToken = require("./middleware/authMiddleware");
const authorizeRole = require("./middleware/roleMiddleware");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/* ===============================
   UPLOAD DOCUMENT
================================ */
router.post(
  "/upload",
  authenticateToken,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { folder_id } = req.body;

      const savedDocument = await prisma.documents.create({
        data: {
          title: req.file.originalname,
          file_path: req.file.path || req.file.secure_url,
          uploaded_by: req.user.id,
          folder_id: folder_id ? parseInt(folder_id) : null
        }
      });

      // Audit log
      await prisma.audit_logs.create({
        data: {
          action: "UPLOAD",
          entity: "DOCUMENT",
          entity_id: savedDocument.id,
          user_id: req.user.id
        }
      });

      res.status(201).json(savedDocument);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

/* ===============================
   GET ALL DOCUMENTS
================================ */
router.get("/", authenticateToken, async (req, res) => {
  const documents = await prisma.documents.findMany({
    include: {
      users: true,
      folder: true
    },
    orderBy: { uploaded_at: "desc" }
  });

  res.json(documents);
});

/* ===============================
   DOWNLOAD DOCUMENT
================================ */
router.get("/download/:id", authenticateToken, async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);

    const document = await prisma.documents.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Redirect to Cloudinary file URL
    return res.redirect(document.file_path);

  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Download failed" });
  }
});

/* ===============================
   DELETE DOCUMENT (ADMIN)
================================ */
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);

      const document = await prisma.documents.findUnique({
        where: { id: documentId }
      });

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Delete only from database
      await prisma.documents.delete({
        where: { id: documentId }
      });

      await prisma.audit_logs.create({
        data: {
          action: "DELETE",
          entity: "DOCUMENT",
          entity_id: documentId,
          user_id: req.user.id
        }
      });

      res.json({ message: "Document deleted successfully" });

    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ message: "Delete failed" });
    }
  }
);

/* ===============================
   UPDATE DOCUMENT (Rename / Move)
================================ */
router.put(
  "/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const { title, folder_id } = req.body;

      const document = await prisma.documents.findUnique({
        where: { id: documentId }
      });

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Permission check
      if (
        req.user.role !== "admin" &&
        document.uploaded_by !== req.user.id
      ) {
        return res.status(403).json({ message: "Not authorized to update this document" });
      }

      const updatedDocument = await prisma.documents.update({
        where: { id: documentId },
        data: {
          title: title ? title : document.title,
          folder_id: folder_id !== undefined
            ? (folder_id ? parseInt(folder_id) : null)
            : document.folder_id,
          updated_at: new Date()
        }
      });

      // Audit log
      await prisma.audit_logs.create({
        data: {
          action: "UPDATE",
          entity: "DOCUMENT",
          entity_id: documentId,
          user_id: req.user.id
        }
      });

      res.json({
        message: "Document updated successfully",
        document: updatedDocument
      });

    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ message: "Update failed" });
    }
  }
);

module.exports = router;
