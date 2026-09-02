const mongoose = require("mongoose");

const creditProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    creditScore: {
      type: Number,
      required: true,
      min: 300,
      max: 900
    },

    creditHistoryLength: {
      type: Number,
      required: true,
      min: 0
    },

    repaymentHistory: {
      type: String,
      enum: ["Excellent", "Good", "Average", "Poor"],
      required: true
    },

    existingLoans: {
      type: Number,
      default: 0,
      min: 0
    },

    totalOutstandingAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    creditUtilization: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    recentCreditInquiries: {
      type: Number,
      default: 0,
      min: 0
    },

    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const CreditProfile = mongoose.model(
  "CreditProfile",
  creditProfileSchema
);

module.exports = CreditProfile;