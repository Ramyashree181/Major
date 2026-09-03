// const fs = require("fs");
// const path = require("path");
// const { execFile } = require("child_process");
// const { createWorker } = require("tesseract.js");
// const multer = require("multer");
// const Document = require("../models/Document");
// const LoanApplication = require("../models/LoanApplication");

// const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
// fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (_req, _file, callback) => callback(null, UPLOAD_DIR),
//   filename: (_req, file, callback) => {
//     const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
//     callback(null, safeName);
//   }
// });

// const upload = multer({
//   storage,
//   fileFilter: (_req, file, callback) => {
//     const allowedExtensions = [".jpg", ".jpeg", ".pdf"];
//     const extension = path.extname(file.originalname).toLowerCase();

//     if (allowedExtensions.includes(extension)) {
//       callback(null, true);
//       return;
//     }

//     callback(new Error("Unsupported file type. Please upload a JPG, JPEG, or PDF file for OCR."));
//   }
// });

// const cleanText = (value = "") => value.replace(/\s+/g, " ").trim();

// const readOCRText = async (filePath, originalName = "") => {
//   const extension = path.extname(
//     originalName || filePath || ""
//   ).toLowerCase();

//   console.log("OCR file:", filePath);
//   console.log("OCR extension:", extension);

//   // JPG / JPEG
//   if (extension === ".jpg" || extension === ".jpeg") {
//     console.log("Starting Tesseract.js...");

//     const worker = await createWorker("eng");

//     try {
//       const result = await worker.recognize(filePath);

//       console.log("Tesseract.js completed");

//       return result.data.text || "";
//     } finally {
//       await worker.terminate();
//     }
//   }

//   // PDF
//   if (extension === ".pdf") {
//     throw new Error(
//       "PDF OCR is not enabled yet. Please upload JPG or JPEG."
//     );
//   }

//   throw new Error(
//     "Unsupported document format. Please upload JPG or JPEG."
//   );
// };

// const parseDocumentText = (text, documentType) => {
//  const rawText = String(text || "")
//   .replace(/\r/g, "");

// const normalized = rawText
//   .replace(/[ \t]+/g, " ")
//   .replace(/\n{2,}/g, "\n")
//   .trim();

// const lines = normalized
//   .split("\n")
//   .map((line) => line.trim())
//   .filter(Boolean);

//   const parseValidDate = (value) => {
//     if (!value) return null;

//     const trimmed = String(value).trim();
//     const dateCandidates = [trimmed];

//     if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
//       dateCandidates.push(trimmed.replace(/-/g, "/"));
//     }

//     if (/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(trimmed)) {
//       const [day, month, year] = trimmed.split(/[/-]/);
//       dateCandidates.push(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
//     }

//     for (const candidate of dateCandidates) {
//       const parsed = new Date(candidate);
//       if (!Number.isNaN(parsed.getTime())) {
//         return parsed;
//       }
//     }

//     return null;
//   };

//   const isNoiseName = (value = "") => {
//     if (!value) return true;
//     const trimmed = value.trim();
//     return /^(government|unique|identification|authority|india|income|tax|department|aadhar|pan|card|signature|official|date|dob|male|female|enrolment|uid|www|govt)$/i.test(trimmed) || trimmed.length < 3;
//   };

//   const findName = () => {

//   // =========================
//   // PAN NAME
//   // =========================
//   if (documentType === "PAN") {
//     const panIndex = lines.findIndex((line) =>
//       /\b[A-Z]{5}[0-9]{4}[A-Z]\b/.test(line)
//     );

//     if (panIndex !== -1) {
//       for (
//         let i = panIndex + 1;
//         i < Math.min(panIndex + 8, lines.length);
//         i++
//       ) {
//         const candidate = lines[i]
//           .replace(/[^A-Za-z' .-]/g, " ")
//           .replace(/\s+/g, " ")
//           .trim();

//         if (
//           /^[A-Za-z][A-Za-z' .-]{2,60}$/.test(candidate) &&
//           !isNoiseName(candidate) &&
//           !/^(INCOME TAX|GOVT OF INDIA|PERMANENT ACCOUNT|NUMBER|CARD|FATHER|NAME|DATE|BIRTH|SIGNATURE)$/i.test(candidate)
//         ) {
//           return candidate;
//         }
//       }
//     }
//   }

//   // =========================
//   // EXPLICIT NAME LABEL
//   // =========================
//   for (const line of lines) {
//     const match = line.match(
//       /^(?:Name|नाम|Applicant|Customer Name|Holder|Resident Name|Beneficiary Name)\s*[:\-\/]?\s*(.+)$/i
//     );

//     if (match) {
//       const name = cleanText(match[1]);

//       if (
//         name &&
//         name.length >= 3 &&
//         name.length <= 80 &&
//         !/\d/.test(name) &&
//         !isNoiseName(name)
//       ) {
//         return name;
//       }
//     }
//   }

//   // =========================
//   // AADHAAR NAME
//   // Name usually appears before
//   // D/O, S/O, C/O or W/O
//   // =========================
//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];

//     if (/\b(?:D\/O|S\/O|C\/O|W\/O)\b/i.test(line)) {

//       const beforeRelation = line
//         .split(/\b(?:D\/O|S\/O|C\/O|W\/O)\b/i)[0]
//         .replace(/[^A-Za-z' .-]/g, " ")
//         .trim();

//       if (
//         beforeRelation.length >= 3 &&
//         beforeRelation.length <= 60 &&
//         /^[A-Za-z][A-Za-z' .-]*$/.test(beforeRelation) &&
//         !isNoiseName(beforeRelation)
//       ) {
//         return beforeRelation;
//       }

//       // Name may be on the previous line
//       if (i > 0) {
//         const previous = lines[i - 1]
//           .replace(/[^A-Za-z' .-]/g, " ")
//           .trim();

//         if (
//           previous.length >= 3 &&
//           previous.length <= 60 &&
//           /^[A-Za-z][A-Za-z' .-]*$/.test(previous) &&
//           !isNoiseName(previous)
//         ) {
//           return previous;
//         }
//       }
//     }
//   }

//   // =========================
//   // FALLBACK NAME
//   // =========================
//   for (const line of lines) {
//     const candidate = line.trim();

//     if (
//       /^[A-Za-z][A-Za-z' .-]{2,40}$/.test(candidate) &&
//       !isNoiseName(candidate) &&
//       !/^(GOVT|GOVERNMENT|INDIA|UNIQUE|IDENTIFICATION|AUTHORITY|TAX|DEPARTMENT|AADHAAR|AADHAR|PAN|CARD|SIGNATURE|OFFICIAL|INCOME|DOB|DATE|BIRTH)$/i.test(candidate)
//     ) {
//       return candidate;
//     }
//   }

//   return "Applicant";
// };

//   let documentNumber = null;
//   let panNumber = null;
//   let aadhaarNumber = null;

//   if (documentType === "PAN") {
//     const panMatch = normalized.match(/(?:PAN|Permanent Account Number|Permanent Account Number Card)\s*[:/\-]?\s*([A-Z]{5}[0-9]{4}[A-Z])/i) || normalized.match(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/);
//     panNumber = panMatch ? (panMatch[1] || panMatch[0]).toUpperCase() : null;
//     documentNumber = panNumber;
//   } else if (documentType === "Aadhaar") {
//   // Prefer the number appearing near "Your Aadhaar No."
//   const aadhaarLabelMatch = normalized.match(
//     /Your\s+Aadhaar\s+No\.?\s*:?\s*((?:\d[\s-]*){12})/i
//   );

//   // Find all possible 12-digit numbers
//   const candidates = normalized.match(
//     /(?:\d[\s-]*){12}/g
//   ) || [];

//   let candidate = null;

//   if (aadhaarLabelMatch) {
//     candidate = aadhaarLabelMatch[1];
//   } else if (candidates.length > 0) {
//     // Ignore enrollment-number area.
//     // Prefer the last 12-digit candidate because Aadhaar
//     // number appears near the bottom of this document.
//     candidate = candidates[candidates.length - 1];
//   }

//   if (candidate) {
//     const cleaned = String(candidate).replace(/\D/g, "");

//     if (cleaned.length === 12) {
//       aadhaarNumber = cleaned;
//     }
//   }

//   documentNumber = aadhaarNumber;
//   } else if (documentType === "Bank Statement") {
//     const accountMatch = normalized.match(/account\s*(?:no|number)?\s*[:/\-]?\s*([A-Z0-9]{6,20})/i);
//     documentNumber = accountMatch ? accountMatch[1] : null;
//   }

//   const incomeMatch = normalized.match(/(?:monthly\s+income|salary|net\s+salary|income)\s*[:/\-]?\s*(?:rs\.?\s*|inr\s*|₹\s*)?([0-9,]{3,})/i);
//   const monthlyIncome = incomeMatch ? Number(incomeMatch[1].replace(/,/g, "")) : null;

//   return {
//     name: findName(),
//     dateOfBirth: findDob(),
//     address: findAddress(),
//     documentNumber,
//     panNumber,
//     aadhaarNumber,
//     monthlyIncome
//   };
// };

// const uploadDocument = async (req, res) => {
//   console.log("🔥🔥🔥 UPLOAD DOCUMENT CONTROLLER HIT 🔥🔥🔥");
//   try {
//     const userId = req.userId;
//     const { loanApplicationId, documentType, fileName } = req.body;

//     if (!documentType) {
//       return res.status(400).json({
//         message: "Document type is required"
//       });
//     }

//     const providedFileName = fileName || req.file?.originalname || "document";

//     if (!providedFileName || !providedFileName.trim()) {
//       return res.status(400).json({
//         message: "Document file name is required"
//       });
//     }

//     if (loanApplicationId) {
//       const application = await LoanApplication.findById(loanApplicationId);

//       if (!application) {
//         return res.status(404).json({
//           message: "Loan application not found"
//         });
//       }

//       if (application.userId.toString() !== userId.toString()) {
//         return res.status(403).json({
//           message: "You are not authorized for this application"
//         });
//       }
//     }

//     let extractedData = { name: "Applicant", dateOfBirth: null, address: null, documentNumber: null, monthlyIncome: null };
//     let extractionStatus = "Pending";

//     if (req.file) {
//   console.log("Starting OCR...");

//   const text = await readOCRText(
//     req.file.path,
//     req.file.originalname
//   );
//   console.log("========== RAW OCR TEXT ==========");
// console.log(text);
// console.log("==================================");

//   console.log("OCR text length:", text.length);

//   const parsed = parseDocumentText(
//     text,
//     documentType
//   );
//   console.log("========== PARSED DATA ==========");
// console.log(parsed);
// console.log("=================================");

//   extractedData = parsed;

//   extractionStatus =
//     parsed.documentNumber ||
//     (parsed.name && parsed.name !== "Applicant")
//       ? "Extracted"
//       : "Review Required";

//   fs.unlinkSync(req.file.path);
// }

//     const document = await Document.create({
//       userId,
//       loanApplicationId: loanApplicationId || null,
//       documentType,
//       fileName: providedFileName,
//       extractedData,
//       extractionStatus,
//       userReviewed: false,
//       reviewedAt: null
//     });

//     return res.status(201).json({
//       message: "Document uploaded successfully",
//       document
//     });
//   } catch (error) {
//   console.error("====================================");
//   console.error("DOCUMENT UPLOAD ERROR");
//   console.error("Message:", error.message);
//   console.error("Name:", error.name);
//   console.error("Stack:", error.stack);
//   console.error("====================================");

//   return res.status(500).json({
//     message: "Failed to upload document",
//     error: error.message
//   });
// }
// };

// const getUserDocuments = async (req, res) => {
//   try {
//     const documents = await Document.find({ userId: req.userId })
//       .sort({ createdAt: -1 });

//     return res.status(200).json({
//       count: documents.length,
//       documents
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Failed to fetch documents",
//       error: error.message
//     });
//   }
// };

// const getRequiredDocumentsForApplication = async (req, res) => {
//   try {
//     const { applicationId } = req.params;
//     const userId = req.userId;

//     const application = await LoanApplication.findById(applicationId)
//       .populate("loanSchemeId");

//     if (!application) {
//       return res.status(404).json({
//         message: "Loan application not found"
//       });
//     }

//     if (application.userId.toString() !== userId.toString()) {
//       return res.status(403).json({
//         message: "You are not authorized to access this application"
//       });
//     }

//     const requiredDocuments = application.loanSchemeId?.requiredDocuments || [];
//     const uploadedDocuments = await Document.find({
//       userId,
//       loanApplicationId: applicationId
//     });

//     return res.status(200).json({
//       applicationId,
//       requiredDocuments,
//       uploadedDocuments
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Failed to fetch required documents",
//       error: error.message
//     });
//   }
// };

// module.exports = {
//   upload,
//   uploadDocument,
//   getUserDocuments,
//   getRequiredDocumentsForApplication
// };



const fs = require("fs");
const path = require("path");
const { createWorker } = require("tesseract.js");
const multer = require("multer");

const Document = require("../models/Document");
const LoanApplication = require("../models/LoanApplication");

// ============================================================
// UPLOAD DIRECTORY
// ============================================================

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ============================================================
// MULTER CONFIGURATION
// ============================================================

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, UPLOAD_DIR);
  },

  filename: (_req, file, callback) => {
    const safeName = `${Date.now()}-${file.originalname.replace(
      /\s+/g,
      "_"
    )}`;

    callback(null, safeName);
  }
});

const upload = multer({
  storage,

  fileFilter: (_req, file, callback) => {
    const allowedExtensions = [".jpg", ".jpeg", ".pdf"];

    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    if (allowedExtensions.includes(extension)) {
      callback(null, true);
      return;
    }

    callback(
      new Error(
        "Unsupported file type. Please upload a JPG, JPEG, or PDF file."
      )
    );
  }
});

// ============================================================
// TEXT HELPERS
// ============================================================

const cleanText = (value = "") => {
  return String(value)
    .replace(/[ \t]+/g, " ")
    .trim();
};

// ============================================================
// OCR
// ============================================================

const readOCRText = async (filePath, originalName = "") => {
  const extension = path
    .extname(originalName || filePath || "")
    .toLowerCase();

  console.log("OCR file:", filePath);
  console.log("OCR extension:", extension);

  // ----------------------------------------------------------
  // JPG / JPEG
  // ----------------------------------------------------------

  if (extension === ".jpg" || extension === ".jpeg") {
    console.log("Starting Tesseract.js...");

    const worker = await createWorker("eng");

    try {
      const result = await worker.recognize(filePath);

      console.log("Tesseract.js completed");

      return result?.data?.text || "";
    } finally {
      await worker.terminate();
    }
  }

  // ----------------------------------------------------------
  // PDF
  // ----------------------------------------------------------

  if (extension === ".pdf") {
    throw new Error(
      "PDF OCR is not enabled yet. Please upload JPG or JPEG."
    );
  }

  throw new Error(
    "Unsupported document format. Please upload JPG or JPEG."
  );
};

// ============================================================
// DOCUMENT PARSER
// ============================================================

const parseDocumentText = (text, documentType) => {
  // ----------------------------------------------------------
  // Preserve OCR line structure
  // ----------------------------------------------------------

  const rawText = String(text || "")
    .replace(/\r/g, "");

  const normalized = rawText
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();

  const lines = normalized
    .split("\n")
    .map((line) => cleanText(line))
    .filter(Boolean);

  // ==========================================================
  // NOISE NAME CHECK
  // ==========================================================

  const isNoiseName = (value = "") => {
    if (!value) return true;

    const trimmed = cleanText(value);

    if (trimmed.length < 3) {
      return true;
    }

    return /^(government|unique|identification|authority|india|income|tax|department|aadhar|aadhaar|pan|card|signature|official|date|dob|male|female|enrolment|enrollment|uid|www|govt|permanent|account|number)$/i.test(
      trimmed
    );
  };

  // ==========================================================
  // NAME EXTRACTION
  // ==========================================================

  const findName = () => {

    // --------------------------------------------------------
    // PAN
    // --------------------------------------------------------

    if (documentType === "PAN") {

      const panIndex = lines.findIndex((line) =>
        /\b[A-Z]{5}[0-9]{4}[A-Z]\b/.test(
          line.toUpperCase()
        )
      );

      if (panIndex !== -1) {

        // Look around the PAN number.
        // PAN cards normally contain the holder name nearby.

        for (
          let i = panIndex + 1;
          i < Math.min(panIndex + 10, lines.length);
          i++
        ) {

          const candidate = cleanText(
            lines[i]
              .replace(/[^A-Za-z' .-]/g, " ")
          );

          if (
            /^[A-Za-z][A-Za-z' .-]{2,60}$/.test(candidate) &&
            !isNoiseName(candidate) &&
            !/^(INCOME TAX|GOVT OF INDIA|PERMANENT ACCOUNT|NUMBER|CARD|FATHER|NAME|DATE|BIRTH|SIGNATURE)$/i.test(
              candidate
            )
          ) {
            return candidate;
          }
        }
      }
    }

    // --------------------------------------------------------
    // EXPLICIT NAME LABEL
    // --------------------------------------------------------

    for (const line of lines) {

      const match = line.match(
        /^(?:Name|नाम|Applicant|Customer Name|Holder|Resident Name|Beneficiary Name)\s*[:\-\/]?\s*(.+)$/i
      );

      if (match) {

        const name = cleanText(match[1]);

        if (
          name &&
          name.length >= 3 &&
          name.length <= 80 &&
          !/\d/.test(name) &&
          !isNoiseName(name)
        ) {
          return name;
        }
      }
    }

    // --------------------------------------------------------
    // AADHAAR
    // --------------------------------------------------------
    // Aadhaar commonly has:
    //
    // Ranjita
    // D/O Baburao Belle
    //
    // or:
    //
    // Ranjita
    // S/O ...
    //
    // --------------------------------------------------------

    for (let i = 0; i < lines.length; i++) {

      const line = lines[i];

      if (
        /\b(?:D\/O|S\/O|C\/O|W\/O)\b/i.test(line)
      ) {

        const beforeRelation = cleanText(
          line
            .split(
              /\b(?:D\/O|S\/O|C\/O|W\/O)\b/i
            )[0]
            .replace(/[^A-Za-z' .-]/g, " ")
        );

        if (
          beforeRelation.length >= 3 &&
          beforeRelation.length <= 60 &&
          /^[A-Za-z][A-Za-z' .-]*$/.test(
            beforeRelation
          ) &&
          !isNoiseName(beforeRelation)
        ) {
          return beforeRelation;
        }

        // ----------------------------------------------
        // Sometimes name is on previous line
        // ----------------------------------------------

        if (i > 0) {

          const previous = cleanText(
            lines[i - 1]
              .replace(/[^A-Za-z' .-]/g, " ")
          );

          if (
            previous.length >= 3 &&
            previous.length <= 60 &&
            /^[A-Za-z][A-Za-z' .-]*$/.test(
              previous
            ) &&
            !isNoiseName(previous)
          ) {
            return previous;
          }
        }
      }
    }

    // --------------------------------------------------------
    // Look for "To" followed by a person's name
    // --------------------------------------------------------

    for (let i = 0; i < lines.length - 1; i++) {

      if (/^To$/i.test(lines[i])) {

        const candidate = cleanText(
          lines[i + 1]
            .replace(/[^A-Za-z' .-]/g, " ")
        );

        if (
          candidate.length >= 3 &&
          candidate.length <= 60 &&
          /^[A-Za-z][A-Za-z' .-]*$/.test(
            candidate
          ) &&
          !isNoiseName(candidate)
        ) {
          return candidate;
        }
      }
    }

    // --------------------------------------------------------
    // General fallback
    // --------------------------------------------------------

    for (const line of lines) {

      const candidate = cleanText(line);

      if (
        /^[A-Za-z][A-Za-z' .-]{2,40}$/.test(
          candidate
        ) &&
        !isNoiseName(candidate) &&
        !/^(GOVT|GOVERNMENT|INDIA|UNIQUE|IDENTIFICATION|AUTHORITY|TAX|DEPARTMENT|AADHAAR|AADHAR|PAN|CARD|SIGNATURE|OFFICIAL|INCOME|DOB|DATE|BIRTH|FEMALE|MALE)$/i.test(
          candidate
        )
      ) {
        return candidate;
      }
    }

    return "Applicant";
  };

  // ==========================================================
  // DOB EXTRACTION
  // ==========================================================

  const findDob = () => {

    const dobMatch = normalized.match(
      /(?:Date of Birth|DOB|जन्म तिथि|Birth Date)\s*[:\-\/]?\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}-\d{2}-\d{2})/i
    );

    if (!dobMatch) {
      return null;
    }

    const value = dobMatch[1].trim();

    const parts = value.split(/[\/-]/);

    if (parts.length === 3) {

      let [day, month, year] = parts;

      if (year.length === 2) {
        year =
          Number(year) >= 50
            ? `19${year}`
            : `20${year}`;
      }

      return `${year}-${month.padStart(
        2,
        "0"
      )}-${day.padStart(2, "0")}`;
    }

    return value;
  };

  // ==========================================================
  // ADDRESS EXTRACTION
  // ==========================================================

  const findAddress = () => {

    const addressLines = [];

    // --------------------------------------------------------
    // Explicit address label
    // --------------------------------------------------------

    for (let i = 0; i < lines.length; i++) {

      const line = lines[i];

      if (
        /^(?:Address|Residential Address|Address of Applicant)\s*[:\-]?/i.test(
          line
        )
      ) {

        const firstLine = cleanText(
          line.replace(
            /^(?:Address|Residential Address|Address of Applicant)\s*[:\-]?\s*/i,
            ""
          )
        );

        if (firstLine) {
          addressLines.push(firstLine);
        }

        // Collect following lines
        for (
          let j = i + 1;
          j < Math.min(i + 8, lines.length);
          j++
        ) {

          if (
            /^(?:DOB|Date of Birth|PAN|Aadhaar|Aadhar|Mobile|Gender|Sex|Signature)\b/i.test(
              lines[j]
            )
          ) {
            break;
          }

          addressLines.push(lines[j]);
        }

        break;
      }
    }

    // --------------------------------------------------------
    // Aadhaar address
    // --------------------------------------------------------

    if (addressLines.length === 0) {

      for (const line of lines) {

        if (
          /^(?:C\/O|S\/O|D\/O|W\/O|VTC|PO|District|State|PIN Code|Village|Taluk)\s*:/i.test(
            line
          )
        ) {

          addressLines.push(line);
        }
      }
    }

    // --------------------------------------------------------
    // Remove unwanted mobile line
    // --------------------------------------------------------

    const filteredAddressLines =
      addressLines.filter(
        (line) =>
          !/^Mobile\s*:/i.test(line)
      );

    if (filteredAddressLines.length > 0) {

      const address = cleanText(
        filteredAddressLines.join(", ")
      );

      if (address.length >= 10) {
        return address;
      }
    }

    return null;
  };

  // ==========================================================
  // DOCUMENT NUMBERS
  // ==========================================================

  let documentNumber = null;
  let panNumber = null;
  let aadhaarNumber = null;

  // ==========================================================
  // PAN
  // ==========================================================

  if (documentType === "PAN") {

    const panMatch =
      normalized.match(
        /\b[A-Z]{5}[0-9]{4}[A-Z]\b/
      );

    if (panMatch) {
      panNumber =
        panMatch[0].toUpperCase();

      documentNumber = panNumber;
    }
  }

  // ==========================================================
  // AADHAAR
  // ==========================================================

  else if (documentType === "Aadhaar") {

    // --------------------------------------------------------
    // Find all 12-digit candidates
    // --------------------------------------------------------

    const aadhaarCandidates =
      normalized.match(
        /(?:\d[\s-]*){12}/g
      ) || [];

    const validCandidates =
      aadhaarCandidates
        .map((value) =>
          value.replace(/\D/g, "")
        )
        .filter(
          (value) => value.length === 12
        );

    // --------------------------------------------------------
    // Prefer the last valid 12-digit number.
    //
    // In your Aadhaar OCR:
    //
    // Enrollment No. -> earlier
    // Aadhaar number -> later
    //
    // --------------------------------------------------------

    if (validCandidates.length > 0) {

      aadhaarNumber =
        validCandidates[
          validCandidates.length - 1
        ];
    }

    documentNumber = aadhaarNumber;
  }

  // ==========================================================
  // BANK STATEMENT
  // ==========================================================

  else if (
    documentType === "Bank Statement"
  ) {

    const accountMatch =
      normalized.match(
        /account\s*(?:no|number)?\s*[:\/\-]?\s*([A-Z0-9]{6,20})/i
      );

    documentNumber =
      accountMatch
        ? accountMatch[1]
        : null;
  }

  // ==========================================================
  // MONTHLY INCOME
  // ==========================================================

  const incomeMatch =
    normalized.match(
      /(?:monthly\s+income|salary|net\s+salary|income)\s*[:\/\-]?\s*(?:rs\.?\s*|inr\s*|₹\s*)?([0-9,]{3,})/i
    );

  const monthlyIncome =
    incomeMatch
      ? Number(
          incomeMatch[1].replace(
            /,/g,
            ""
          )
        )
      : null;

  // ==========================================================
  // FINAL RESULT
  // ==========================================================

  return {
    name: findName(),

    dateOfBirth: findDob(),

    address: findAddress(),

    documentNumber,

    panNumber,

    aadhaarNumber,

    monthlyIncome
  };
};

// ============================================================
// UPLOAD DOCUMENT
// ============================================================

const uploadDocument = async (req, res) => {

  console.log(
    "🔥🔥🔥 UPLOAD DOCUMENT CONTROLLER HIT 🔥🔥🔥"
  );

  try {

    const userId = req.userId;

    const {
      loanApplicationId,
      documentType,
      fileName
    } = req.body;

    // --------------------------------------------------------
    // Validate document type
    // --------------------------------------------------------

    if (!documentType) {

      return res.status(400).json({
        message:
          "Document type is required"
      });
    }

    // --------------------------------------------------------
    // Validate filename
    // --------------------------------------------------------

    const providedFileName =
      fileName ||
      req.file?.originalname ||
      "document";

    if (
      !providedFileName ||
      !providedFileName.trim()
    ) {

      return res.status(400).json({
        message:
          "Document file name is required"
      });
    }

    // --------------------------------------------------------
    // Validate loan application ownership
    // --------------------------------------------------------

    if (loanApplicationId) {

      const application =
        await LoanApplication.findById(
          loanApplicationId
        );

      if (!application) {

        return res.status(404).json({
          message:
            "Loan application not found"
        });
      }

      if (
        application.userId.toString() !==
        userId.toString()
      ) {

        return res.status(403).json({
          message:
            "You are not authorized for this application"
        });
      }
    }

    // --------------------------------------------------------
    // Default extracted data
    // --------------------------------------------------------

    let extractedData = {
      name: "Applicant",
      dateOfBirth: null,
      address: null,
      documentNumber: null,
      panNumber: null,
      aadhaarNumber: null,
      monthlyIncome: null
    };

    let extractionStatus =
      "Pending";

    // --------------------------------------------------------
    // OCR
    // --------------------------------------------------------

    if (req.file) {

      console.log(
        "Starting OCR..."
      );

      const text =
        await readOCRText(
          req.file.path,
          req.file.originalname
        );

      // ------------------------------------------------------
      // RAW OCR LOG
      // ------------------------------------------------------

      console.log(
        "========== RAW OCR TEXT =========="
      );

      console.log(text);

      console.log(
        "=================================="
      );

      console.log(
        "OCR text length:",
        text.length
      );

      // ------------------------------------------------------
      // PARSE OCR
      // ------------------------------------------------------

      const parsed =
        parseDocumentText(
          text,
          documentType
        );

      // ------------------------------------------------------
      // PARSED DATA LOG
      // ------------------------------------------------------

      console.log(
        "========== PARSED DATA =========="
      );

      console.log(parsed);

      console.log(
        "================================="
      );

      extractedData = parsed;

      // ------------------------------------------------------
      // Extraction status
      // ------------------------------------------------------

      extractionStatus =
        parsed.documentNumber ||
        (
          parsed.name &&
          parsed.name !== "Applicant"
        )
          ? "Extracted"
          : "Review Required";

      // ------------------------------------------------------
      // Delete uploaded temporary file
      // ------------------------------------------------------

      try {

        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

      } catch (deleteError) {

        console.error(
          "Could not delete uploaded file:",
          deleteError.message
        );
      }
    }

    // ========================================================
    // SAVE DOCUMENT
    // ========================================================

    const document =
      await Document.create({

        userId,

        loanApplicationId:
          loanApplicationId || null,

        documentType,

        fileName:
          providedFileName,

        extractedData,

        extractionStatus,

        userReviewed: false,

        reviewedAt: null
      });

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(201).json({

      message:
        "Document uploaded successfully",

      document
    });

  } catch (error) {

    console.error(
      "===================================="
    );

    console.error(
      "DOCUMENT UPLOAD ERROR"
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "Name:",
      error.name
    );

    console.error(
      "Stack:",
      error.stack
    );

    console.error(
      "===================================="
    );

    return res.status(500).json({

      message:
        "Failed to upload document",

      error:
        error.message
    });
  }
};

// ============================================================
// GET USER DOCUMENTS
// ============================================================

const getUserDocuments = async (
  req,
  res
) => {

  try {

    const documents =
      await Document.find({
        userId: req.userId
      }).sort({
        createdAt: -1
      });

    return res.status(200).json({

      count: documents.length,

      documents
    });

  } catch (error) {

    return res.status(500).json({

      message:
        "Failed to fetch documents",

      error:
        error.message
    });
  }
};

// ============================================================
// GET REQUIRED DOCUMENTS
// ============================================================

const getRequiredDocumentsForApplication =
  async (req, res) => {

    try {

      const {
        applicationId
      } = req.params;

      const userId =
        req.userId;

      const application =
        await LoanApplication.findById(
          applicationId
        ).populate(
          "loanSchemeId"
        );

      if (!application) {

        return res.status(404).json({
          message:
            "Loan application not found"
        });
      }

      if (
        application.userId.toString() !==
        userId.toString()
      ) {

        return res.status(403).json({
          message:
            "You are not authorized to access this application"
        });
      }

      const requiredDocuments =
        application.loanSchemeId
          ?.requiredDocuments || [];

      const uploadedDocuments =
        await Document.find({
          userId,
          loanApplicationId:
            applicationId
        });

      return res.status(200).json({

        applicationId,

        requiredDocuments,

        uploadedDocuments
      });

    } catch (error) {

      return res.status(500).json({

        message:
          "Failed to fetch required documents",

        error:
          error.message
      });
    }
  };

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  upload,
  uploadDocument,
  getUserDocuments,
  getRequiredDocumentsForApplication
};