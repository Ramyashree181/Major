const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  upload,
  uploadDocument,
  getUserDocuments,
  getRequiredDocumentsForApplication
} = require("../controllers/documentController");

const router = express.Router();

router.post("/upload", protect, upload.single("documentFile"), uploadDocument);
router.get("/my-documents", protect, getUserDocuments);
router.get("/required/:applicationId", protect, getRequiredDocumentsForApplication);

module.exports = router;
