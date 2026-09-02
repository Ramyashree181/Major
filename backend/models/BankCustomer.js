const mongoose = require("mongoose");

const bankCustomerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    customerId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    accountNumber: {
      type: String,
      required: true,
      unique: true
    },

    accountType: {
      type: String,
      enum: ["Savings", "Current"],
      required: true
    },

    accountStatus: {
      type: String,
      enum: ["Active", "Inactive", "Blocked"],
      default: "Active"
    },

    kycStatus: {
      type: String,
      enum: ["Verified", "Pending", "Incomplete"],
      default: "Verified"
    },

    basicProfile: {
      dateOfBirth: {
        type: Date
      },

      address: {
        type: String,
        trim: true
      }
    }
  },
  {
    timestamps: true
  }
);

const BankCustomer = mongoose.model(
  "BankCustomer",
  bankCustomerSchema
);

module.exports = BankCustomer;