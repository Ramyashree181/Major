const express = require("express");
const router = express.Router();

const {
  sendMessage
} = require("../controllers/chatbotController");


// ============================================
// CHATBOT ROUTE
// ============================================

// POST /api/chatbot/message
router.post("/message", sendMessage);


module.exports = router;