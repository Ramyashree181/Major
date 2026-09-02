const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    language: {
      type: String,
      enum: ["en", "hi", "kn"],
      default: "en"
    },

    messages: [
      {
        sender: {
          type: String,
          enum: ["user", "bot"],
          required: true
        },

        text: {
          type: String,
          required: true
        },

        intent: {
          type: String,
          default: null
        },

        action: {
          type: String,
          default: null
        },

        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    // Important for follow-up questions
    lastIntent: {
      type: String,
      default: null
    },

    lastAction: {
      type: String,
      default: null
    },

    lastLoanTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanType",
      default: null
    },

    lastLoanSchemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanScheme",
      default: null
    },

    lastDisplayedLoanTypes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LoanType"
      }
    ]
  },
  {
    timestamps: true
  }
);

const Conversation = mongoose.model(
  "Conversation",
  conversationSchema
);

module.exports = Conversation;