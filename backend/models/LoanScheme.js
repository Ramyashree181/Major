const mongoose = require("mongoose");

const loanSchemeSchema = new mongoose.Schema(
  {
    schemeName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    loanTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanType",
      required: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    interestRate: {
      min: {
        type: Number,
        required: true,
        min: 0
      },
      max: {
        type: Number,
        required: true,
        min: 0
      }
    },

    minLoanAmount: {
      type: Number,
      required: true,
      min: 0
    },

    maxLoanAmount: {
      type: Number,
      required: true,
      min: 0
    },

    minRepaymentYears: {
      type: Number,
      required: true,
      min: 1
    },

    maxRepaymentYears: {
      type: Number,
      required: true,
      min: 1
    },

    processingFee: {
      type: Number,
      default: 0,
      min: 0
    },

    eligibilityRequirements: {
      minimumAge: {
        type: Number,
        min: 18
      },

      maximumAge: {
        type: Number
      },

      minimumCreditScore: {
        type: Number,
        min: 0,
        max: 900,
        default: 0
      },

      minimumMonthlyIncome: {
        type: Number,
        default: 0,
        min: 0
      },

      allowedEmploymentTypes: [
        {
          type: String,
          enum: [
            "Salaried",
            "Self-Employed",
            "Business",
            "Student",
            "Other"
          ]
        }
      ],

      minimumEmploymentYears: {
        type: Number,
        default: 0,
        min: 0
      },

      maximumDebtToIncomeRatio: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
      },

      collateralRequired: {
        type: Boolean,
        default: false
      },

      additionalConditions: [
        {
          type: String,
          trim: true
        }
      ]
    },

    governmentSupported: {
      type: Boolean,
      default: false
    },

    requiredDocuments: [
      {
        type: String,
        trim: true
      }
    ],

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const LoanScheme = mongoose.model("LoanScheme", loanSchemeSchema);

module.exports = LoanScheme;