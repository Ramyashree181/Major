const mongoose = require("mongoose");

const loanTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
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

    minInterestRate: {
      type: Number,
      required: true,
      min: 0
    },

    maxInterestRate: {
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

    basicRequirements: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true
  }
);

// Validate minimum and maximum values
loanTypeSchema.pre("validate", function () {
  if (this.maxLoanAmount < this.minLoanAmount) {
    throw new Error("Maximum loan amount cannot be less than minimum loan amount");
  }

  if (this.maxInterestRate < this.minInterestRate) {
    throw new Error("Maximum interest rate cannot be less than minimum interest rate");
  }

  if (this.maxRepaymentYears < this.minRepaymentYears) {
    throw new Error("Maximum repayment years cannot be less than minimum repayment years");
  }
});

const LoanType = mongoose.model("LoanType", loanTypeSchema);

module.exports = LoanType;