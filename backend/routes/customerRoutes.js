const express = require("express");

const {
  checkCustomerStatus,
  getCreditProfile
} = require("../controllers/customerController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/status", protect, checkCustomerStatus);
router.get("/credit-profile", protect, getCreditProfile);

module.exports = router;