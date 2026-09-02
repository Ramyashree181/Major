const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const connectDB = require("../config/db");

const User = require("../models/User");
const BankCustomer = require("../models/BankCustomer");
const CreditProfile = require("../models/CreditProfile");
const LoanType = require("../models/LoanType");
const LoanScheme = require("../models/LoanScheme");

const {
  users,
  bankCustomers,
  creditProfiles,
  loanTypes,
  loanSchemes
} = require("./seedData");

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    console.log("Starting database seeding...");

    // Clear old data
    await User.deleteMany();
    await BankCustomer.deleteMany();
    await CreditProfile.deleteMany();
    await LoanType.deleteMany();
    await LoanScheme.deleteMany();

    // =========================
    // 1. CREATE USERS
    // =========================

    const createdUsers = [];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const createdUser = await User.create({
        ...user,
        password: hashedPassword,
        isBankCustomer: false
      });

      createdUsers.push(createdUser);
    }

    console.log(`${createdUsers.length} users created`);

    // Create email → user mapping
    const userMap = {};

    createdUsers.forEach((user) => {
      userMap[user.email] = user;
    });

    // =========================
    // 2. CREATE BANK CUSTOMERS
    // =========================

    for (const customer of bankCustomers) {
      const user = userMap[customer.email];

      if (!user) {
        throw new Error(
          `User not found for bank customer: ${customer.email}`
        );
      }

      await BankCustomer.create({
        userId: user._id,
        customerId: customer.customerId,
        accountNumber: customer.accountNumber,
        accountType: customer.accountType,
        accountStatus: customer.accountStatus,
        kycStatus: customer.kycStatus,
        basicProfile: customer.basicProfile
      });

      // Update user as bank customer
      user.isBankCustomer = true;
      await user.save();
    }

    console.log(`${bankCustomers.length} bank customers created`);

    // =========================
    // 3. CREATE CREDIT PROFILES
    // =========================

    for (const profile of creditProfiles) {
      const user = userMap[profile.email];

      if (!user) {
        throw new Error(
          `User not found for credit profile: ${profile.email}`
        );
      }

      await CreditProfile.create({
        userId: user._id,
        creditScore: profile.creditScore,
        creditHistoryLength: profile.creditHistoryLength,
        repaymentHistory: profile.repaymentHistory,
        existingLoans: profile.existingLoans,
        totalOutstandingAmount: profile.totalOutstandingAmount,
        creditUtilization: profile.creditUtilization,
        recentCreditInquiries: profile.recentCreditInquiries
      });
    }

    console.log(`${creditProfiles.length} credit profiles created`);

    // =========================
    // 4. CREATE LOAN TYPES
    // =========================

    const createdLoanTypes = [];

    for (const loanType of loanTypes) {
      const createdLoanType = await LoanType.create(loanType);
      createdLoanTypes.push(createdLoanType);
    }

    console.log(`${createdLoanTypes.length} loan types created`);

    // Create name → loan type mapping
    const loanTypeMap = {};

    createdLoanTypes.forEach((loanType) => {
      loanTypeMap[loanType.name] = loanType;
    });

    // =========================
    // 5. CREATE LOAN SCHEMES
    // =========================

    for (const scheme of loanSchemes) {
      const loanType = loanTypeMap[scheme.loanType];

      if (!loanType) {
        throw new Error(
          `Loan type not found for scheme: ${scheme.schemeName}`
        );
      }

      const { loanType: loanTypeName, ...schemeData } = scheme;

      await LoanScheme.create({
        ...schemeData,
        loanTypeId: loanType._id
      });
    }

    console.log(`${loanSchemes.length} loan schemes created`);

    console.log("Database seeding completed successfully!");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error.message);

    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();