const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const multer = require("multer");
const Document = require("../models/Document");
const LoanApplication = require("../models/LoanApplication");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, UPLOAD_DIR),
  filename: (_req, file, callback) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    callback(null, safeName);
  }
});

const upload = multer({
  storage,
  fileFilter: (_req, file, callback) => {
    const allowedExtensions = [".jpg", ".jpeg", ".pdf"];
    const extension = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(extension)) {
      callback(null, true);
      return;
    }

    callback(new Error("Unsupported file type. Please upload a JPG, JPEG, or PDF file for OCR."));
  }
});

const cleanText = (value = "") => value.replace(/\s+/g, " ").trim();

const readOCRText = (filePath, originalName = "") => new Promise((resolve, reject) => {
  const extension = path.extname(originalName || filePath || "").toLowerCase();

  const runTesseract = (sourcePath) => {
    execFile("tesseract", [sourcePath, "stdout", "--psm", "6"], { maxBuffer: 1024 * 1024 * 10 }, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(stdout || "");
    });
  };

  if (extension === ".pdf") {
    const tempDir = path.join(__dirname, "..", "uploads", "pdf-temp");
    fs.mkdirSync(tempDir, { recursive: true });
    const outputBase = path.join(tempDir, `${Date.now()}-page`);

    execFile("pdftoppm", ["-png", "-r", "300", filePath, outputBase], (pdfError) => {
      if (pdfError) {
        reject(new Error("PDF conversion is not available on this server. Please upload a JPG or JPEG for accurate OCR."));
        return;
      }

      const generatedPages = fs.readdirSync(tempDir)
        .filter((entry) => entry.startsWith(`${path.basename(outputBase)}`) && entry.endsWith(".png"))
        .sort();

      if (!generatedPages.length) {
        reject(new Error("PDF could not be converted to images for OCR. Please upload a JPG or JPEG file instead."));
        return;
      }

      const pagePaths = generatedPages.map((entry) => path.join(tempDir, entry));
      let combinedText = "";

      const processNextPage = (index) => {
        if (index >= pagePaths.length) {
          pagePaths.forEach((pagePath) => {
            if (fs.existsSync(pagePath)) fs.unlinkSync(pagePath);
          });
          resolve(combinedText);
          return;
        }

        execFile("tesseract", [pagePaths[index], "stdout", "--psm", "6"], { maxBuffer: 1024 * 1024 * 10 }, (tesseractError, stdout) => {
          if (tesseractError) {
            if (fs.existsSync(pagePaths[index])) fs.unlinkSync(pagePaths[index]);
            reject(tesseractError);
            return;
          }

          combinedText += `\n${stdout || ""}`;
          if (fs.existsSync(pagePaths[index])) fs.unlinkSync(pagePaths[index]);
          processNextPage(index + 1);
        });
      };

      processNextPage(0);
    });

    return;
  }

  runTesseract(filePath);
});

const parseDocumentText = (text, documentType) => {
  const normalized = cleanText(text || "");
  const lines = normalized
    .split(/\n+/)
    .map((line) => cleanText(line))
    .filter(Boolean);

  const parseValidDate = (value) => {
    if (!value) return null;

    const trimmed = String(value).trim();
    const dateCandidates = [trimmed];

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      dateCandidates.push(trimmed.replace(/-/g, "/"));
    }

    if (/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(trimmed)) {
      const [day, month, year] = trimmed.split(/[/-]/);
      dateCandidates.push(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
    }

    for (const candidate of dateCandidates) {
      const parsed = new Date(candidate);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return null;
  };

  const isNoiseName = (value = "") => {
    if (!value) return true;
    const trimmed = value.trim();
    return /^(government|unique|identification|authority|india|income|tax|department|aadhar|pan|card|signature|official|date|dob|male|female|enrolment|uid|www|govt)$/i.test(trimmed) || trimmed.length < 3;
  };

  const findName = () => {
    const directNamePatterns = [
      /(?:Name|नाम\/Name|नाम|Name\s*\/?\s*[:/\-])\s*([A-Z][A-Za-z' .-]{2,80})/i,
      /(?:Applicant|Customer Name|Holder)\s*[:/\-]?\s*([A-Z][A-Za-z' .-]{2,80})/i,
      /(?:Resident\s+Name|Beneficiary\s+Name)\s*[:/\-]?\s*([A-Z][A-Za-z' .-]{2,80})/i
    ];

    for (const pattern of directNamePatterns) {
      const match = normalized.match(pattern);
      if (match) {
        const name = cleanText(match[1]);
        if (!isNoiseName(name)) {
          return name;
        }
      }
    }

    const fallbackName = lines.find((line) => {
      if (!/^[A-Z][A-Za-z' .-]{3,60}$/.test(line)) {
        return false;
      }

      if (/\d/.test(line)) {
        return false;
      }

      return !isNoiseName(line) && !/^(GOVT|GOVERNMENT|INDIA|UNIQUE|IDENTIFICATION|AUTHORITY|TAX|DEPARTMENT|AADHAAR|PAN|CARD|SIGNATURE|OFFICIAL|INCOME)$/i.test(line);
    });

    return fallbackName || "Applicant";
  };

  const findDob = () => {
    const datePattern = /(Date of Birth|DOB|जन्म तिथि|Birth Date)\s*[:/\-]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})/i;
    const directMatch = normalized.match(datePattern);
    if (directMatch) {
      return parseValidDate(directMatch[2]);
    }

    for (const line of lines) {
      const match = line.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})/);
      if (match && /Date|DOB|Birth|जन्म|तिथि/i.test(line)) {
        return parseValidDate(match[1]);
      }
    }

    return null;
  };

  const findAddress = () => {
    const addressPatterns = [
      /(?:Address|Residential Address|Address of Applicant|C\/O|To)\s*[:/\-]?\s*([A-Za-z0-9,./\-\s]{10,200})/i,
      /([A-Za-z0-9][A-Za-z0-9,./\-\s]{20,180}(?:Hassan|Bengaluru|Belagavi|Hubballi|Dharwad|Karnataka|Gowda|Honnenahalli|Village|Gram|Street|Road|District|Taluk|State|India))/i
    ];

    for (const pattern of addressPatterns) {
      const match = normalized.match(pattern);
      if (match) {
        const result = match[1] || match[0];
        const cleaned = cleanText(result).replace(/^(Address|To|C\/O)\s*[:/\-]?\s*/i, "");
        if (cleaned.length > 12 && !/^(Government|Unique|Identification|Authority|India|Aadhaar|PAN)$/i.test(cleaned)) {
          return cleaned;
        }
      }
    }

    const addressLine = lines.find((line) => line.includes("Honnenahalli") || line.includes("Gowda") || line.includes("Karnataka") || /\b(?:Street|Road|Village|House|No|Gram|Taluk|District|State)\b/i.test(line));
    if (addressLine) {
      return addressLine;
    }

    return null;
  };

  let documentNumber = null;
  let panNumber = null;
  let aadhaarNumber = null;

  if (documentType === "PAN") {
    const panMatch = normalized.match(/(?:PAN|Permanent Account Number|Permanent Account Number Card)\s*[:/\-]?\s*([A-Z]{5}[0-9]{4}[A-Z])/i) || normalized.match(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/);
    panNumber = panMatch ? (panMatch[1] || panMatch[0]).toUpperCase() : null;
    documentNumber = panNumber;
  } else if (documentType === "Aadhaar") {
    const aadhaarMatch = normalized.match(/(?:Your\s+Aadhaar\s+No\.?|Aadhaar\s+No\.?|Aadhaar\s*No\s*[:/\-]?)\s*(\d{4}[\s-]?\d{4}[\s-]?\d{4})/i) || normalized.match(/\b(?:\d[ -]?){12}\b/);
    aadhaarNumber = aadhaarMatch ? String(aadhaarMatch[1] || aadhaarMatch[0]).replace(/\s+/g, "").replace(/-/g, "") : null;
    documentNumber = aadhaarNumber;
  } else if (documentType === "Bank Statement") {
    const accountMatch = normalized.match(/account\s*(?:no|number)?\s*[:/\-]?\s*([A-Z0-9]{6,20})/i);
    documentNumber = accountMatch ? accountMatch[1] : null;
  }

  const incomeMatch = normalized.match(/(?:monthly\s+income|salary|net\s+salary|income)\s*[:/\-]?\s*(?:rs\.?\s*|inr\s*|₹\s*)?([0-9,]{3,})/i);
  const monthlyIncome = incomeMatch ? Number(incomeMatch[1].replace(/,/g, "")) : null;

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

const uploadDocument = async (req, res) => {
  try {
    const userId = req.userId;
    const { loanApplicationId, documentType, fileName } = req.body;

    if (!documentType) {
      return res.status(400).json({
        message: "Document type is required"
      });
    }

    const providedFileName = fileName || req.file?.originalname || "document";

    if (!providedFileName || !providedFileName.trim()) {
      return res.status(400).json({
        message: "Document file name is required"
      });
    }

    if (loanApplicationId) {
      const application = await LoanApplication.findById(loanApplicationId);

      if (!application) {
        return res.status(404).json({
          message: "Loan application not found"
        });
      }

      if (application.userId.toString() !== userId.toString()) {
        return res.status(403).json({
          message: "You are not authorized for this application"
        });
      }
    }

    let extractedData = { name: "Applicant", dateOfBirth: null, address: null, documentNumber: null, monthlyIncome: null };
    let extractionStatus = "Pending";

    if (req.file) {
      const text = await readOCRText(req.file.path);
      const parsed = parseDocumentText(text, documentType);
      extractedData = parsed;
      extractionStatus = parsed.documentNumber || (parsed.name && parsed.name !== "Applicant") ? "Extracted" : "Review Required";
      fs.unlinkSync(req.file.path);
    } else {
      const fallback = parseDocumentData(providedFileName, documentType);
      extractedData = fallback.extractedData;
      extractionStatus = "Extracted";
    }

    const document = await Document.create({
      userId,
      loanApplicationId: loanApplicationId || null,
      documentType,
      fileName: providedFileName,
      extractedData,
      extractionStatus,
      userReviewed: false,
      reviewedAt: null
    });

    return res.status(201).json({
      message: "Document uploaded successfully",
      document
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to upload document",
      error: error.message
    });
  }
};

const getUserDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: documents.length,
      documents
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch documents",
      error: error.message
    });
  }
};

const getRequiredDocumentsForApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.userId;

    const application = await LoanApplication.findById(applicationId)
      .populate("loanSchemeId");

    if (!application) {
      return res.status(404).json({
        message: "Loan application not found"
      });
    }

    if (application.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to access this application"
      });
    }

    const requiredDocuments = application.loanSchemeId?.requiredDocuments || [];
    const uploadedDocuments = await Document.find({
      userId,
      loanApplicationId: applicationId
    });

    return res.status(200).json({
      applicationId,
      requiredDocuments,
      uploadedDocuments
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch required documents",
      error: error.message
    });
  }
};

module.exports = {
  upload,
  uploadDocument,
  getUserDocuments,
  getRequiredDocumentsForApplication
};
