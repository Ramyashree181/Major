const express = require("express");

const {
  checkEligibility
} = require("../controllers/eligibilityController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/:applicationId",
  protect,
  checkEligibility
);

module.exports = router;