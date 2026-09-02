const express = require("express");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/protected", protect, (req, res) => {
  res.status(200).json({
    message: "Protected route accessed successfully",
    userId: req.userId
  });
});

module.exports = router;