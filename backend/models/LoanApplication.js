const mongoose = require("mongoose");

const loanApplicationSchema = new mongoose.Schema(
  {
    // User who submitted the application
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Selected loan type
    loanTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanType",
      required: true
    },

    // Selected loan scheme
    loanSchemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanScheme",
      required: true
    },

    // Requested loan amount
    requestedAmount: {
      type: Number,
      required: true,
      min: 1
    },

    // Requested repayment tenure in months
    tenureMonths: {
      type: Number,
      required: true,
      min: 1
    },

    // Application status
    status: {
      type: String,
      enum: [
        "DRAFT",
        "SUBMITTED",
        "UNDER_REVIEW",
        "ELIGIBLE",
        "NOT_ELIGIBLE",
        "DOCUMENT_PENDING",
        "DOCUMENT_VERIFIED",
        "APPROVED",
        "REJECTED"
      ],
      default: "DRAFT"
    },

    // Additional applicant information
    employmentType: {
      type: String,
      enum: [
        "Salaried",
        "Self-Employed",
        "Business",
        "Student",
        "Other"
      ],
      required: true
    },

    monthlyIncome: {
      type: Number,
      required: true,
      min: 0
    },

    additionalDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    eligibilityDecision: {
      type: String,
      enum: ["ELIGIBLE", "NOT_ELIGIBLE"],
      default: null
    },

    confidence: {
      type: Number,
      default: null
    },

    decisionSource: {
      type: String,
      enum: ["BUSINESS_RULE", "CUSTOM_ML_MODEL"],
      default: null
    },

    rejectionReason: {
      type: String,
      default: null
    },

    checkedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  },
);

module.exports = mongoose.model(
  "LoanApplication",
  loanApplicationSchema
);