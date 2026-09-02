const LoanApplication = require("../models/LoanApplication");
const BankCustomer = require("../models/BankCustomer");
const CreditProfile = require("../models/CreditProfile");
const LoanScheme = require("../models/LoanScheme");

const checkEligibility = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.userId;

    // 1. Find application
    const loanApplication =
      await LoanApplication.findById(applicationId);

    if (!loanApplication) {
      return res.status(404).json({
        message: "Loan application not found"
      });
    }

    // 2. Check ownership
    if (loanApplication.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to access this application"
      });
    }

    // 3. Application must be SUBMITTED
    if (loanApplication.status !== "SUBMITTED") {
      return res.status(400).json({
        message: `Eligibility can only be checked for SUBMITTED applications. Current status: ${loanApplication.status}`
      });
    }

    // 4. Get bank customer data
    const bankCustomer = await BankCustomer.findOne({ userId });

    if (!bankCustomer) {
      return res.status(403).json({
        message: "Bank customer information not found"
      });
    }

    // 5. Get credit profile
    const creditProfile = await CreditProfile.findOne({ userId });

    if (!creditProfile) {
      return res.status(404).json({
        message: "Credit profile not found"
      });
    }

    // 6. Get selected loan scheme
    const loanScheme = await LoanScheme.findById(
      loanApplication.loanSchemeId
    );

    if (!loanScheme) {
      return res.status(404).json({
        message: "Loan scheme not found"
      });
    }

    // =================================================
    // HARD BUSINESS RULES
    // =================================================

    // Rule 1: Account must be active
    if (bankCustomer.accountStatus !== "Active") {
      loanApplication.status = "NOT_ELIGIBLE";
      loanApplication.eligibilityDecision = "NOT_ELIGIBLE";
      loanApplication.confidence = null;
      loanApplication.decisionSource = "BUSINESS_RULE";
      loanApplication.rejectionReason = "Bank account is not active";
      loanApplication.checkedAt = new Date();

      await loanApplication.save();

      return res.status(200).json({
        decision: "NOT_ELIGIBLE",
        reason: "Bank account is not active",
        source: "BUSINESS_RULE"
      });
    }

    // Rule 2: KYC must be verified
    if (bankCustomer.kycStatus !== "Verified") {
      loanApplication.status = "NOT_ELIGIBLE";
      loanApplication.eligibilityDecision = "NOT_ELIGIBLE";
      loanApplication.confidence = null;
      loanApplication.decisionSource = "BUSINESS_RULE";
      loanApplication.rejectionReason =
        "KYC verification is incomplete";
      loanApplication.checkedAt = new Date();

      await loanApplication.save();

      return res.status(200).json({
        decision: "NOT_ELIGIBLE",
        reason: "KYC verification is incomplete",
        source: "BUSINESS_RULE"
      });
    }

    // Rule 3: Scheme must be active
    if (!loanScheme.isActive) {
      loanApplication.status = "NOT_ELIGIBLE";
      loanApplication.eligibilityDecision = "NOT_ELIGIBLE";
      loanApplication.confidence = null;
      loanApplication.decisionSource = "BUSINESS_RULE";
      loanApplication.rejectionReason =
        "Selected loan scheme is currently unavailable";
      loanApplication.checkedAt = new Date();

      await loanApplication.save();

      return res.status(200).json({
        decision: "NOT_ELIGIBLE",
        reason: "Selected loan scheme is currently unavailable",
        source: "BUSINESS_RULE"
      });
    }

    // Rule 4: Validate employment type
    const allowedEmploymentTypes =
      loanScheme.eligibilityRequirements.allowedEmploymentTypes;

    if (
      allowedEmploymentTypes.length > 0 &&
      !allowedEmploymentTypes.includes(
        loanApplication.employmentType
      )
    ) {
      loanApplication.status = "NOT_ELIGIBLE";
      loanApplication.eligibilityDecision = "NOT_ELIGIBLE";
      loanApplication.confidence = null;
      loanApplication.decisionSource = "BUSINESS_RULE";
      loanApplication.rejectionReason =
        "Employment type is not eligible for this loan scheme";
      loanApplication.checkedAt = new Date();

      await loanApplication.save();

      return res.status(200).json({
        decision: "NOT_ELIGIBLE",
        reason:
          "Employment type is not eligible for this loan scheme",
        source: "BUSINESS_RULE"
      });
    }

    // Rule 5: Validate requested amount
    if (
      loanApplication.requestedAmount < loanScheme.minLoanAmount ||
      loanApplication.requestedAmount > loanScheme.maxLoanAmount
    ) {
      loanApplication.status = "NOT_ELIGIBLE";
      loanApplication.eligibilityDecision = "NOT_ELIGIBLE";
      loanApplication.confidence = null;
      loanApplication.decisionSource = "BUSINESS_RULE";
      loanApplication.rejectionReason =
        "Requested loan amount is outside the scheme limits";
      loanApplication.checkedAt = new Date();

      await loanApplication.save();

      return res.status(200).json({
        decision: "NOT_ELIGIBLE",
        reason: "Requested loan amount is outside the scheme limits",
        source: "BUSINESS_RULE"
      });
    }

    // Rule 6: Validate tenure

    const minTenureMonths =
      loanScheme.minRepaymentYears * 12;

    const maxTenureMonths =
      loanScheme.maxRepaymentYears * 12;

    if (
      loanApplication.tenureMonths < minTenureMonths ||
      loanApplication.tenureMonths > maxTenureMonths
    ) {
      loanApplication.status = "NOT_ELIGIBLE";
      loanApplication.eligibilityDecision = "NOT_ELIGIBLE";
      loanApplication.confidence = null;
      loanApplication.decisionSource = "BUSINESS_RULE";
      loanApplication.rejectionReason =
        "Requested tenure is outside the scheme limits";
      loanApplication.checkedAt = new Date();

      await loanApplication.save();

      return res.status(200).json({
        decision: "NOT_ELIGIBLE",
        reason: "Requested tenure is outside the scheme limits",
        source: "BUSINESS_RULE"
      });
    }

    // =================================================
    // PREPARE DATA FOR OUR CUSTOM ML MODEL
    // =================================================

    const modelInput = {
      loanType: loanApplication.loanTypeId
        ? (await loanApplication.populate("loanTypeId")).loanTypeId.name
        : "",

      employmentType: loanApplication.employmentType,
      monthlyIncome: loanApplication.monthlyIncome,
      requestedAmount: loanApplication.requestedAmount,
      tenureMonths: loanApplication.tenureMonths,

      creditScore: creditProfile.creditScore,
      creditHistoryLength: creditProfile.creditHistoryLength,
      repaymentHistory: creditProfile.repaymentHistory,
      existingLoans: creditProfile.existingLoans,
      totalOutstandingAmount:
        creditProfile.totalOutstandingAmount,
      creditUtilization: creditProfile.creditUtilization,
      recentCreditInquiries:
        creditProfile.recentCreditInquiries
    };

    // =================================================
    // CALL PYTHON ML SERVICE
    // =================================================

    const mlResponse = await fetch(
      "http://127.0.0.1:5001/predict",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(modelInput)
      }
    );

    const mlResult = await mlResponse.json();

    if (!mlResponse.ok) {
      return res.status(500).json({
        message: "ML prediction service failed",
        mlError: mlResult
      });
    }

    // =================================================
    // SAVE FINAL DECISION
    // =================================================

    // Save ML prediction result

      loanApplication.status = mlResult.prediction;

      loanApplication.eligibilityDecision =
        mlResult.prediction;

      loanApplication.confidence =
        mlResult.confidence;

      loanApplication.decisionSource =
        "CUSTOM_ML_MODEL";

      // Add rejection reason only when the model says NOT_ELIGIBLE
      loanApplication.rejectionReason =
        mlResult.prediction === "NOT_ELIGIBLE"
          ? "Loan application does not meet the model eligibility criteria"
          : null;

      loanApplication.checkedAt = new Date();

      await loanApplication.save();

    return res.status(200).json({
      message: "Eligibility check completed",

      decision: mlResult.prediction,

      confidence: mlResult.confidence,

      source: "CUSTOM_ML_MODEL",

      applicationId: loanApplication._id
    });

  } catch (error) {
    return res.status(500).json({
      message: "Eligibility check failed",
      error: error.message
    });
  }
};

module.exports = {
  checkEligibility
};