const users = [
  {
    name: "Ramya",
    email: "ramya@gmail.com",
    mobile: "6363942441",
    password: "Ramya@123",
    isBankCustomer: false
  },
  {
    name: "Ranjita",
    email: "ranjita@gmail.com",
    mobile: "9876543211",
    password: "Ranjita@123",
    isBankCustomer: false
  },
  {
    name: "Shreyas",
    email: "shreyas@gmail.com",
    mobile: "9876543212",
    password: "Shreyas@123",
    isBankCustomer: false
  },
  {
    name: "Shobha",
    email: "shobha@gmail.com",
    mobile: "9591045229",
    password: "Shobha@123",
    isBankCustomer: false
  },
  {
    name: "Divya",
    email: "divya@gmail.com",
    mobile: "7975872453",
    password: "Divya@123",
    isBankCustomer: false
  },
  {
    name: "Anusha",
    email: "anusha@gmail.com",
    mobile: "9876543215",
    password: "Anusha@123",
    isBankCustomer: false
  }
];

const bankCustomers = [
  {
    email: "ramya@gmail.com",
    customerId: "EMP1001",
    accountNumber: "123456789012",
    accountType: "Savings",
    accountStatus: "Active",
    kycStatus: "Verified",
    basicProfile: {
      dateOfBirth: "1998-05-15",
      address: "Bengaluru, Karnataka"
    }
  },
  {
    email: "ranjita@gmail.com",
    customerId: "EMP1002",
    accountNumber: "234567890123",
    accountType: "Savings",
    accountStatus: "Active",
    kycStatus: "Verified",
    basicProfile: {
      dateOfBirth: "1996-08-22",
      address: "Belagavi, Karnataka"
    }
  },
  {
    email: "shreyas@gmail.com",
    customerId: "EMP1003",
    accountNumber: "345678901234",
    accountType: "Savings",
    accountStatus: "Active",
    kycStatus: "Verified",
    basicProfile: {
      dateOfBirth: "1995-02-10",
      address: "Hubballi, Karnataka"
    }
  },
  {
    email: "shobha@gmail.com",
    customerId: "EMP1004",
    accountNumber: "456789012345",
    accountType: "Current",
    accountStatus: "Active",
    kycStatus: "Verified",
    basicProfile: {
      dateOfBirth: "1989-11-30",
      address: "Dharwad, Karnataka"
    }
  }
];

const creditProfiles = [
  {
    email: "ramya@gmail.com",
    creditScore: 780,
    creditHistoryLength: 6,
    repaymentHistory: "Excellent",
    existingLoans: 1,
    totalOutstandingAmount: 150000,
    creditUtilization: 22,
    recentCreditInquiries: 1
  },
  {
    email: "ranjita@gmail.com",
    creditScore: 730,
    creditHistoryLength: 5,
    repaymentHistory: "Good",
    existingLoans: 1,
    totalOutstandingAmount: 280000,
    creditUtilization: 35,
    recentCreditInquiries: 2
  },
  {
    email: "shreyas@gmail.com",
    creditScore: 680,
    creditHistoryLength: 3,
    repaymentHistory: "Average",
    existingLoans: 2,
    totalOutstandingAmount: 450000,
    creditUtilization: 58,
    recentCreditInquiries: 3
  },
  {
    email: "shobha@gmail.com",
    creditScore: 755,
    creditHistoryLength: 9,
    repaymentHistory: "Excellent",
    existingLoans: 0,
    totalOutstandingAmount: 0,
    creditUtilization: 18,
    recentCreditInquiries: 0
  },
  {
    email: "divya@gmail.com",
    creditScore: 640,
    creditHistoryLength: 2,
    repaymentHistory: "Average",
    existingLoans: 2,
    totalOutstandingAmount: 320000,
    creditUtilization: 72,
    recentCreditInquiries: 4
  },
  {
    email: "anusha@gmail.com",
    creditScore: 590,
    creditHistoryLength: 1,
    repaymentHistory: "Poor",
    existingLoans: 1,
    totalOutstandingAmount: 180000,
    creditUtilization: 85,
    recentCreditInquiries: 5
  }
];

const loanTypes = [
  {
    name: "Personal Loan",
    description:
      "An unsecured loan for personal expenses such as medical emergencies, travel, home improvement, or other financial needs.",
    minLoanAmount: 50000,
    maxLoanAmount: 2500000,
    minInterestRate: 10.5,
    maxInterestRate: 18,
    minRepaymentYears: 1,
    maxRepaymentYears: 5,
    basicRequirements: [
      "Minimum age of 21 years",
      "Regular source of income",
      "Satisfactory credit profile",
      "Valid identity and address proof"
    ]
  },

  {
    name: "Home Loan",
    description:
      "A secured loan to purchase, construct, renovate, or improve a residential property.",
    minLoanAmount: 500000,
    maxLoanAmount: 10000000,
    minInterestRate: 8,
    maxInterestRate: 10.5,
    minRepaymentYears: 5,
    maxRepaymentYears: 30,
    basicRequirements: [
      "Minimum age of 21 years",
      "Stable income source",
      "Satisfactory credit profile",
      "Property-related documents",
      "Collateral or property security as applicable"
    ]
  },

  {
    name: "Education Loan",
    description:
      "A loan designed to support higher education expenses, including tuition fees and other approved educational costs.",
    minLoanAmount: 50000,
    maxLoanAmount: 5000000,
    minInterestRate: 8.5,
    maxInterestRate: 12,
    minRepaymentYears: 1,
    maxRepaymentYears: 15,
    basicRequirements: [
      "Admission to a recognized educational institution",
      "Valid identity documents",
      "Academic or admission documents",
      "Co-applicant or guarantor where applicable"
    ]
  },

  {
    name: "Business Loan",
    description:
      "A loan to support business expansion, working capital, equipment purchase, or other eligible business requirements.",
    minLoanAmount: 100000,
    maxLoanAmount: 5000000,
    minInterestRate: 9.5,
    maxInterestRate: 16,
    minRepaymentYears: 1,
    maxRepaymentYears: 10,
    basicRequirements: [
      "Minimum age of 21 years",
      "Valid business details",
      "Business income or financial records",
      "Satisfactory credit profile",
      "Business documents as applicable"
    ]
  }
];

const loanSchemes = [
  // ================= PERSONAL LOANS =================

  {
    schemeName: "Personal Flex",
    loanType: "Personal Loan",
    description:
      "A flexible personal loan for salaried and self-employed individuals with stable income.",
    interestRate: { min: 10.5, max: 14 },
    minLoanAmount: 50000,
    maxLoanAmount: 500000,
    minRepaymentYears: 1,
    maxRepaymentYears: 5,
    processingFee: 1500,

    eligibilityRequirements: {
      minimumAge: 21,
      maximumAge: 60,
      minimumCreditScore: 700,
      minimumMonthlyIncome: 25000,
      allowedEmploymentTypes: ["Salaried", "Self-Employed"],
        allowedEmploymentTypes: ["Salaried", "Self-Employed", "Business"],
      maximumDebtToIncomeRatio: 45,
      collateralRequired: false,
      additionalConditions: [
        "Stable repayment history",
        "Valid identity and income documents"
      ]
    },

    governmentSupported: false,

    requiredDocuments: [
      "Identity Proof",
      "Address Proof",
      "Income Proof",
      "Bank Statement"
    ],

    isActive: true
  },

  {
    schemeName: "Personal Easy",
    loanType: "Personal Loan",
    description:
      "A personal loan designed for applicants with moderate income and credit profiles.",
    interestRate: { min: 13, max: 18 },
    minLoanAmount: 50000,
    maxLoanAmount: 300000,
    minRepaymentYears: 1,
    maxRepaymentYears: 4,
    processingFee: 1000,

    eligibilityRequirements: {
      minimumAge: 21,
      maximumAge: 60,
      minimumCreditScore: 620,
      minimumMonthlyIncome: 18000,
        allowedEmploymentTypes: [
          "Salaried",
          "Self-Employed",
          "Business"
        ],
      minimumEmploymentYears: 0.5,
      maximumDebtToIncomeRatio: 55,
      collateralRequired: false,
      additionalConditions: [
        "Applicant should have a regular income source"
      ]
    },

    governmentSupported: false,

    requiredDocuments: [
      "Identity Proof",
      "Address Proof",
      "Income Proof"
    ],

    isActive: true
  },

  {
    schemeName: "Personal Premium",
    loanType: "Personal Loan",
    description:
      "A higher-value personal loan for applicants with strong income and credit profiles.",
    interestRate: { min: 10, max: 12.5 },
    minLoanAmount: 500000,
    maxLoanAmount: 1500000,
    minRepaymentYears: 2,
    maxRepaymentYears: 5,
    processingFee: 2500,

    eligibilityRequirements: {
      minimumAge: 25,
      maximumAge: 58,
      minimumCreditScore: 750,
      minimumMonthlyIncome: 60000,
      allowedEmploymentTypes: ["Salaried", "Self-Employed"],
      minimumEmploymentYears: 3,
      maximumDebtToIncomeRatio: 40,
      collateralRequired: false,
      additionalConditions: [
        "Strong repayment history required",
        "Higher loan amount subject to profile assessment"
      ]
    },

    governmentSupported: false,

    requiredDocuments: [
      "Identity Proof",
      "Address Proof",
      "Income Proof",
      "Bank Statement"
    ],

    isActive: true
  },

  // ================= HOME LOANS =================

  {
    schemeName: "Home Dream",
    loanType: "Home Loan",
    description:
      "A home loan for purchasing or constructing a residential property.",
    interestRate: { min: 8, max: 9.5 },
    minLoanAmount: 500000,
    maxLoanAmount: 5000000,
    minRepaymentYears: 5,
    maxRepaymentYears: 25,
    processingFee: 5000,

    eligibilityRequirements: {
      minimumAge: 21,
      maximumAge: 65,
      minimumCreditScore: 680,
      minimumMonthlyIncome: 30000,
        allowedEmploymentTypes: [
          "Salaried",
          "Self-Employed",
          "Business"
        ],
      minimumEmploymentYears: 2,
      maximumDebtToIncomeRatio: 50,
      collateralRequired: true,
      additionalConditions: [
        "Property documents are required",
        "Property valuation may be required"
      ]
    },

    governmentSupported: false,

    requiredDocuments: [
      "Identity Proof",
      "Address Proof",
      "Income Proof",
      "Bank Statement",
      "Property Documents"
    ],

    isActive: true
  },

  {
    schemeName: "Home First",
    loanType: "Home Loan",
    description:
      "A home loan scheme designed for first-time home buyers with flexible repayment options.",
    interestRate: { min: 8.25, max: 10 },
    minLoanAmount: 500000,
    maxLoanAmount: 3000000,
    minRepaymentYears: 5,
    maxRepaymentYears: 30,
    processingFee: 3000,

    eligibilityRequirements: {
      minimumAge: 21,
      maximumAge: 65,
      minimumCreditScore: 650,
      minimumMonthlyIncome: 25000,
      allowedEmploymentTypes: [
        "Salaried",
        "Self-Employed",
        "Business"
      ],
      minimumEmploymentYears: 1,
      maximumDebtToIncomeRatio: 55,
      collateralRequired: true,
      additionalConditions: [
        "Applicant must be purchasing their first residential property"
      ]
    },

    governmentSupported: false,

    requiredDocuments: [
      "Identity Proof",
      "Address Proof",
      "Income Proof",
      "Property Documents"
    ],

    isActive: true
  },

  {
    schemeName: "Home Advantage",
    loanType: "Home Loan",
    description:
      "A premium home loan for applicants seeking a higher loan amount with a strong financial profile.",
    interestRate: { min: 8, max: 9 },
    minLoanAmount: 3000000,
    maxLoanAmount: 10000000,
    minRepaymentYears: 10,
    maxRepaymentYears: 30,
    processingFee: 7500,

    eligibilityRequirements: {
      minimumAge: 25,
      maximumAge: 60,
      minimumCreditScore: 750,
      minimumMonthlyIncome: 100000,
        allowedEmploymentTypes: [
          "Salaried",
          "Self-Employed",
          "Business"
        ],
      minimumEmploymentYears: 3,
      maximumDebtToIncomeRatio: 40,
      collateralRequired: true,
      additionalConditions: [
        "Strong financial profile required",
        "Property and income verification required"
      ]
    },

    governmentSupported: false,

    requiredDocuments: [
      "Identity Proof",
      "Address Proof",
      "Income Proof",
      "Bank Statement",
      "Property Documents"
    ],

    isActive: true
  },

  // ================= EDUCATION LOANS =================

  {
    schemeName: "Education Future",
    loanType: "Education Loan",
    description:
      "An education loan for students pursuing higher education in recognized institutions.",
    interestRate: { min: 8.5, max: 10.5 },
    minLoanAmount: 50000,
    maxLoanAmount: 2000000,
    minRepaymentYears: 1,
    maxRepaymentYears: 10,
    processingFee: 500,

    eligibilityRequirements: {
      minimumAge: 18,
      maximumAge: 35,
      minimumCreditScore: 0,
      minimumMonthlyIncome: 0,
      allowedEmploymentTypes: ["Student"],
      minimumEmploymentYears: 0,
      maximumDebtToIncomeRatio: 100,
      collateralRequired: false,
      additionalConditions: [
        "Admission to a recognized educational institution is required",
        "Co-applicant may be required depending on loan amount"
      ]
    },

    governmentSupported: true,

    requiredDocuments: [
      "Identity Proof",
      "Address Proof",
      "Admission Letter",
      "Academic Documents"
    ],

    isActive: true
  },

  {
    schemeName: "Education Global",
    loanType: "Education Loan",
    description:
      "A higher-value education loan designed for students pursuing approved international education.",
    interestRate: { min: 9, max: 12 },
    minLoanAmount: 500000,
    maxLoanAmount: 5000000,
    minRepaymentYears: 5,
    maxRepaymentYears: 15,
    processingFee: 2000,

    eligibilityRequirements: {
      minimumAge: 18,
      maximumAge: 35,
      minimumCreditScore: 0,
      minimumMonthlyIncome: 0,
      allowedEmploymentTypes: ["Student"],
      minimumEmploymentYears: 0,
      maximumDebtToIncomeRatio: 100,
      collateralRequired: false,
      additionalConditions: [
        "Admission to an approved international institution is required",
        "Financial co-applicant may be required"
      ]
    },

    governmentSupported: false,

    requiredDocuments: [
      "Identity Proof",
      "Passport",
      "Admission Letter",
      "Academic Documents",
      "Financial Documents of Co-applicant"
    ],

    isActive: true
  },

  // ================= BUSINESS LOANS =================

  {
    schemeName: "Business Growth",
    loanType: "Business Loan",
    description:
      "A business loan for working capital, expansion, equipment, or other approved business needs.",
    interestRate: { min: 10, max: 14 },
    minLoanAmount: 200000,
    maxLoanAmount: 2500000,
    minRepaymentYears: 1,
    maxRepaymentYears: 7,
    processingFee: 3000,

    eligibilityRequirements: {
      minimumAge: 21,
      maximumAge: 65,
      minimumCreditScore: 680,
      minimumMonthlyIncome: 40000,
      allowedEmploymentTypes: [
        "Self-Employed",
        "Business"
      ],
      minimumEmploymentYears: 2,
      maximumDebtToIncomeRatio: 50,
      collateralRequired: false,
      additionalConditions: [
        "Valid business details are required",
        "Business income records may be reviewed"
      ]
    },

    governmentSupported: false,

    requiredDocuments: [
      "Identity Proof",
      "Address Proof",
      "Business Registration",
      "Business Financial Records",
      "Bank Statement"
    ],

    isActive: true
  },

  {
    schemeName: "Business Expansion",
    loanType: "Business Loan",
    description:
      "A higher-value business loan for established businesses planning expansion or major investment.",
    interestRate: { min: 9.5, max: 13 },
    minLoanAmount: 1000000,
    maxLoanAmount: 5000000,
    minRepaymentYears: 3,
    maxRepaymentYears: 10,
    processingFee: 6000,

    eligibilityRequirements: {
      minimumAge: 25,
      maximumAge: 65,
      minimumCreditScore: 720,
      minimumMonthlyIncome: 80000,
      allowedEmploymentTypes: [
        "Self-Employed",
        "Business"
      ],
      minimumEmploymentYears: 3,
      maximumDebtToIncomeRatio: 45,
      collateralRequired: true,
      additionalConditions: [
        "Established business history required",
        "Business expansion plan may be required",
        "Collateral or business asset verification may be required"
      ]
    },

    governmentSupported: false,

    requiredDocuments: [
      "Identity Proof",
      "Address Proof",
      "Business Registration",
      "Business Financial Records",
      "Bank Statement",
      "Collateral Documents"
    ],

    isActive: true
  }
];

module.exports = {
  users, bankCustomers, creditProfiles, loanTypes, loanSchemes};