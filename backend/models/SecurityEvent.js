const mongoose = require("mongoose");

const securityEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    eventType: {
      type: String,
      enum: [
        "Failed Login",
        "Multiple Loan Applications",
        "Mismatched Details",
        "Suspicious Activity"
      ],
      required: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low"
    },

    status: {
      type: String,
      enum: ["Open", "Reviewed", "Resolved"],
      default: "Open"
    }
  },
  {
    timestamps: true
  }
);

const SecurityEvent = mongoose.model(
  "SecurityEvent",
  securityEventSchema
);

module.exports = SecurityEvent;