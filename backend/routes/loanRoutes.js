const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getAllLoanTypes,
  getSchemesByLoanType,
  getLoanSchemeById,
  createLoanApplication,
  submitLoanApplication,
  getApplicationById,
  deleteLoanApplication,
  verifyDocumentData,
  approveLoanApplication
} = require("../controllers/loanController");

const router = express.Router();

router.get("/types", getAllLoanTypes);
router.get("/types/:loanTypeId/schemes", getSchemesByLoanType);
router.get("/schemes/:schemeId", getLoanSchemeById);
router.post("/applications", protect, createLoanApplication);
router.patch("/applications/:applicationId/submit", protect, submitLoanApplication);
router.patch("/applications/:applicationId/verify-documents", protect, verifyDocumentData);
router.patch("/applications/:applicationId/approve", protect, approveLoanApplication);
router.get("/applications/:applicationId", protect, getApplicationById);
router.delete("/applications/:applicationId", protect, deleteLoanApplication);

module.exports = router;