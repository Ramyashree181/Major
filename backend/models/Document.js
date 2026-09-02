const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    loanApplicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
      default: null
    },

    documentType: {
      type: String,
      enum: ["Aadhaar", "PAN", "Bank Statement", "Income Proof"],
      required: true
    },

    fileName: {
      type: String,
      required: true,
      trim: true
    },

    extractedData: {
      name: {
        type: String,
        trim: true
      },

      dateOfBirth: {
        type: Date,
        default: null
      },

      address: {
        type: String,
        trim: true
      },

      documentNumber: {
        type: String,
        trim: true
      },

      monthlyIncome: {
        type: Number,
        default: null,
        min: 0
      }
    },

    extractionStatus: {
      type: String,
      enum: ["Pending", "Extracted", "Review Required", "Confirmed"],
      default: "Pending"
    },

    userReviewed: {
      type: Boolean,
      default: false
    },

    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Document = mongoose.model("Document", documentSchema);

module.exports = Document;