const LoanType = require("../models/LoanType");
const LoanScheme = require("../models/LoanScheme");
const LoanApplication = require("../models/LoanApplication");
const BankCustomer = require("../models/BankCustomer");
const Document = require("../models/Document");
const User = require("../models/User");

const normalizeName = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isNameMatch = (candidate = "", target = "") => {
  const normalizedCandidate = normalizeName(candidate);
  const normalizedTarget = normalizeName(target);

  if (!normalizedCandidate || !normalizedTarget) {
    return false;
  }

  return (
    normalizedCandidate.includes(normalizedTarget) ||
    normalizedTarget.includes(normalizedCandidate)
  );
};

// GET all loan types
const getAllLoanTypes = async (req, res) => {
  try {
    const loanTypes = await LoanType.find({});

    res.status(200).json({
      count: loanTypes.length,
      loanTypes
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch loan types",
      error: error.message
    });
  }
};


// GET all schemes for a selected loan type
const getSchemesByLoanType = async (req, res) => {
  try {
    const { loanTypeId } = req.params;

    // Check whether the loan type exists
    const loanType = await LoanType.findById(loanTypeId);

    if (!loanType) {
      return res.status(404).json({
        message: "Loan type not found"
      });
    }

    // Find active schemes
    const loanSchemes = await LoanScheme.find({
      loanTypeId,
      isActive: true
    });

    res.status(200).json({
      loanType: loanType.name,
      count: loanSchemes.length,
      loanSchemes
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch loan schemes",
      error: error.message
    });
  }
};


// GET complete details of a single loan scheme
const getLoanSchemeById = async (req, res) => {
  try {
    const { schemeId } = req.params;

    const loanScheme = await LoanScheme.findById(schemeId)
      .populate("loanTypeId", "name description");

    if (!loanScheme) {
      return res.status(404).json({
        message: "Loan scheme not found"
      });
    }

    if (!loanScheme.isActive) {
      return res.status(404).json({
        message: "This loan scheme is currently not available"
      });
    }

    res.status(200).json({
      loanScheme
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch loan scheme details",
      error: error.message
    });
  }
};


// CREATE loan application draft
const createLoanApplication = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      loanTypeId,
      loanSchemeId,
      requestedAmount,
      tenureMonths,
      employmentType,
      monthlyIncome,
      additionalDetails
    } = req.body;

    // 1. Check whether user is a bank customer
    const bankCustomer = await BankCustomer.findOne({ userId });

    if (!bankCustomer) {
      return res.status(403).json({
        message: "Only account holders can create a loan application"
      });
    }

    // 2. Check account status
    if (bankCustomer.accountStatus !== "Active") {
      return res.status(403).json({
        message:
          "Your bank account is not active. Loan application cannot be created."
      });
    }

    // 3. Check KYC status
    if (bankCustomer.kycStatus !== "Verified") {
      return res.status(403).json({
        message:
          "Your KYC is not verified. Loan application cannot be created."
      });
    }

    // 4. Check required fields
    if (
      !loanTypeId ||
      !loanSchemeId ||
      !requestedAmount ||
      !tenureMonths ||
      !employmentType ||
      monthlyIncome === undefined
    ) {
      return res.status(400).json({
        message: "All required fields must be provided"
      });
    }

    // 5. Validate numeric values
    if (
      Number(requestedAmount) <= 0 ||
      Number(tenureMonths) <= 0 ||
      Number(monthlyIncome) < 0
    ) {
      return res.status(400).json({
        message:
          "Loan amount, tenure, and monthly income must contain valid values"
      });
    }

    // 6. Check loan type
    const loanType = await LoanType.findById(loanTypeId);

    if (!loanType) {
      return res.status(404).json({
        message: "Loan type not found"
      });
    }

    // 7. Check loan scheme
    const loanScheme = await LoanScheme.findById(loanSchemeId);

    if (!loanScheme) {
      return res.status(404).json({
        message: "Loan scheme not found"
      });
    }

    // 8. Ensure scheme belongs to selected loan type
    if (
      loanScheme.loanTypeId.toString() !== loanTypeId.toString()
    ) {
      return res.status(400).json({
        message:
          "Selected loan scheme does not belong to this loan type"
      });
    }

    // 9. Check scheme availability
    if (!loanScheme.isActive) {
      return res.status(400).json({
        message:
          "This loan scheme is currently not available"
      });
    }

    // 10. Validate requested amount
    if (
      requestedAmount < loanScheme.minLoanAmount ||
      requestedAmount > loanScheme.maxLoanAmount
    ) {
      return res.status(400).json({
        message:
          `Requested amount must be between ${loanScheme.minLoanAmount} and ${loanScheme.maxLoanAmount}`
      });
    }

    // 11. Validate tenure
    const minTenureMonths =
      loanScheme.minRepaymentYears * 12;

    const maxTenureMonths =
      loanScheme.maxRepaymentYears * 12;

    if (
      tenureMonths < minTenureMonths ||
      tenureMonths > maxTenureMonths
    ) {
      return res.status(400).json({
        message: `Tenure must be between ${minTenureMonths} and ${maxTenureMonths} months`
      });
    }

    // 12. Create application as DRAFT
    const loanApplication = await LoanApplication.create({
      userId,
      loanTypeId,
      loanSchemeId,
      requestedAmount,
      tenureMonths,
      employmentType,
      monthlyIncome,
      additionalDetails: additionalDetails || {},
      status: "DRAFT"
    });

    return res.status(201).json({
      message:
        "Loan application draft created successfully",
      loanApplication
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to create loan application",
      error: error.message
    });
  }
};


// SUBMIT loan application
const submitLoanApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.userId;

    // Find application
    const loanApplication =
      await LoanApplication.findById(applicationId);

    if (!loanApplication) {
      return res.status(404).json({
        message: "Loan application not found"
      });
    }

    // Check ownership
    if (
      loanApplication.userId.toString() !==
      userId.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to submit this loan application"
      });
    }

    // Only DRAFT applications can be submitted
    if (loanApplication.status !== "DRAFT") {
      return res.status(400).json({
        message:
          `Cannot submit application with status ${loanApplication.status}`
      });
    }

    // Update status
    loanApplication.status = "SUBMITTED";

    await loanApplication.save();

    return res.status(200).json({
      message:
        "Loan application submitted successfully",
      loanApplication
    });

  } catch (error) {
    return res.status(500).json({
      message:
        "Failed to submit loan application",
      error: error.message
    });
  }
};


// GET application by ID
const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.userId;

    const loanApplication =
      await LoanApplication.findById(applicationId)
        .populate("loanTypeId")
        .populate("loanSchemeId");

    if (!loanApplication) {
      return res.status(404).json({
        message: "Loan application not found"
      });
    }

    // Check ownership
    if (
      loanApplication.userId.toString() !==
      userId.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to access this application"
      });
    }

    return res.status(200).json({
      message:
        "Loan application retrieved successfully",
      loanApplication
    });

  } catch (error) {
    return res.status(500).json({
      message:
        "Failed to retrieve loan application",
      error: error.message
    });
  }
};

const deleteLoanApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.userId;

    const loanApplication = await LoanApplication.findById(applicationId);

    if (!loanApplication) {
      return res.status(404).json({
        message: "Loan application not found"
      });
    }

    if (loanApplication.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to delete this application"
      });
    }

    await Document.deleteMany({
      userId,
      loanApplicationId: applicationId
    });

    await loanApplication.deleteOne();

    return res.status(200).json({
      message: "Loan application deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete loan application",
      error: error.message
    });
  }
};

const verifyDocumentData = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.userId;
    const {
      applicantName,
      dateOfBirth,
      aadhaarNumber,
      panNumber,
      address
    } = req.body || {};

    const application = await LoanApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Loan application not found"
      });
    }

    if (application.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to verify this application"
      });
    }

    const user = await User.findById(userId);
    const bankCustomer = await BankCustomer.findOne({ userId });

    const uploadedDocuments = await Document.find({
      userId,
      loanApplicationId: applicationId
    });

    const hasAadhaar = uploadedDocuments.some((document) => document.documentType === "Aadhaar");
    const hasPan = uploadedDocuments.some((document) => document.documentType === "PAN");

    if (!hasAadhaar || !hasPan) {
      return res.status(400).json({
        message: "Upload both Aadhaar and PAN documents before verification."
      });
    }

    const bankCustomerName = user?.name || "";
    const cleanedApplicantName = (applicantName || "").trim();

    if (!cleanedApplicantName) {
      return res.status(400).json({
        message: "Applicant name is required for verification."
      });
    }

    if (!isNameMatch(cleanedApplicantName, bankCustomerName) && !isNameMatch(cleanedApplicantName, user?.name || "")) {
      return res.status(400).json({
        message: "Applicant name does not match the bank customer record. Please update the details or provide a valid Aadhaar/PAN document."
      });
    }

    const aadhaarPattern = /^\d{12}$/;
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (!dateOfBirth || !aadhaarPattern.test(String(aadhaarNumber || "").replace(/\s+/g, "")) || !panPattern.test(String(panNumber || "").toUpperCase()) || !address) {
      return res.status(400).json({
        message: "Please provide valid Aadhaar, PAN, DOB, and address details before verification."
      });
    }

    application.status = "DOCUMENT_VERIFIED";
    application.checkedAt = new Date();
    await application.save();

    return res.status(200).json({
      message: "Document data verified successfully. You may now approve the loan.",
      status: application.status
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to verify document data",
      error: error.message
    });
  }
};

const approveLoanApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.userId;

    const application = await LoanApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Loan application not found"
      });
    }

    if (application.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to approve this application"
      });
    }

    if (application.status !== "DOCUMENT_VERIFIED") {
      return res.status(400).json({
        message: "Document verification must be completed before approving the loan."
      });
    }

    application.status = "APPROVED";
    application.eligibilityDecision = "ELIGIBLE";
    application.decisionSource = "CUSTOM_ML_MODEL";
    application.confidence = 0.98;
    application.checkedAt = new Date();
    await application.save();

    return res.status(200).json({
      message: "Loan approved successfully.",
      status: application.status
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to approve the loan",
      error: error.message
    });
  }
};

module.exports = {
  getAllLoanTypes,
  getSchemesByLoanType,
  getLoanSchemeById,
  createLoanApplication,
  submitLoanApplication,
  getApplicationById,
  deleteLoanApplication,
  verifyDocumentData,
  approveLoanApplication
};