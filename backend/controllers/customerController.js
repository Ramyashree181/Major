const User = require("../models/User");
const BankCustomer = require("../models/BankCustomer");
const CreditProfile = require("../models/CreditProfile");

const checkCustomerStatus = async (req, res) => {
  try {
    // Get logged-in user
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Check BankCustomer collection
    const bankCustomer = await BankCustomer.findOne({
      userId: req.userId
    });

    // No bank customer record found
    if (!bankCustomer) {
      return res.status(200).json({
        isBankCustomer: false,
        isEligibleBankCustomer: false,
        message: "User is not an account holder",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile
        }
      });
    }

    // Check whether the bank account is active
    const isActiveAccount =
      bankCustomer.accountStatus === "Active";

    // Check whether KYC is verified
    const isKycVerified =
      bankCustomer.kycStatus === "Verified";

    // User can use bank-customer-specific features
    const isEligibleBankCustomer =
      isActiveAccount && isKycVerified;

    return res.status(200).json({
      isBankCustomer: true,
      isEligibleBankCustomer,

      message: isEligibleBankCustomer
        ? "User is an active verified bank customer"
        : "Bank customer account requires attention",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile
      },

      customer: {
        customerId: bankCustomer.customerId,
        accountNumber: bankCustomer.accountNumber,
        accountType: bankCustomer.accountType,
        accountStatus: bankCustomer.accountStatus,
        kycStatus: bankCustomer.kycStatus
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to check customer status",
      error: error.message
    });
  }
};

const getCreditProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const creditProfile = await CreditProfile.findOne({ userId });

    if (!creditProfile) {
      return res.status(404).json({
        message: "Credit profile not found for this user"
      });
    }

    return res.status(200).json({
      message: "Credit profile retrieved successfully",
      creditProfile
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch credit profile",
      error: error.message
    });
  }
};

module.exports = {
  checkCustomerStatus,
  getCreditProfile
};