import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "./Eligibility.css";
import API_BASE_URL from "../../api";

const Eligibility = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const applicationId = location.state?.applicationId || localStorage.getItem("lastApplicationId") || "";

  if (applicationId) {
    localStorage.setItem("lastApplicationId", applicationId);
  }

  const [processing, setProcessing] = useState(Boolean(applicationId));
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [documentUploading, setDocumentUploading] = useState(false);
  const [documentMessage, setDocumentMessage] = useState("");
  const [selectedDocumentFile, setSelectedDocumentFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    documentType: "Aadhaar",
    fileName: ""
  });
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [aadhaarFileName, setAadhaarFileName] = useState("");
  const [panFileName, setPanFileName] = useState("");
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [verificationForm, setVerificationForm] = useState({
    applicantName: "",
    dateOfBirth: "",
    aadhaarNumber: "",
    panNumber: "",
    address: ""
  });
  const [verificationStatus, setVerificationStatus] = useState({
    verifying: false,
    passed: false,
    message: ""
  });
  const [loanApprovalStatus, setLoanApprovalStatus] = useState("");

  const formatDob = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const formatted = new Date(dateValue);
    if (Number.isNaN(formatted.getTime())) {
      return "";
    }

    return formatted.toISOString().split("T")[0];
  };

  const fetchUploadedDocuments = async () => {
    if (!token || !applicationId) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/my-documents`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to load uploaded documents");
      }

      const filteredDocuments = (data.documents || []).filter((document) => {
        if (!document.loanApplicationId) {
          return true;
        }

        return document.loanApplicationId === applicationId;
      });

      setUploadedDocuments(filteredDocuments);
    } catch (fetchError) {
      console.warn(fetchError.message);
    }
  };

  useEffect(() => {
    if (uploadedDocuments.length === 0) {
      return;
    }

    const aadhaarDocument = uploadedDocuments.find((document) => document.documentType === "Aadhaar");
    const panDocument = uploadedDocuments.find((document) => document.documentType === "PAN");

    const aadhaarData = aadhaarDocument?.extractedData || {};
    const panData = panDocument?.extractedData || {};

    const extractedName =
  [aadhaarData.name, panData.name]
    .find((name) => name && name !== "Applicant") || "";

const extractedDob =
  formatDob(
    aadhaarData.dateOfBirth ||
    panData.dateOfBirth
  );

const extractedAadhaar =
  aadhaarData.aadhaarNumber ||
  aadhaarData.documentNumber ||
  "";

const extractedPan =
  panData.panNumber ||
  panData.documentNumber ||
  "";

const extractedAddress =
  aadhaarData.address ||
  panData.address ||
  "";

setVerificationForm((prev) => ({
  applicantName:
    prev.applicantName && prev.applicantName !== "Applicant"
      ? prev.applicantName
      : extractedName,

  dateOfBirth:
    prev.dateOfBirth || extractedDob,

  aadhaarNumber:
    prev.aadhaarNumber || extractedAadhaar,

  panNumber:
    prev.panNumber || extractedPan,

  address:
    prev.address || extractedAddress
}));
  }, [uploadedDocuments]);

  const handleDocumentUpload = async (event, documentType) => {
    event.preventDefault();

    if (!token || !applicationId) {
      setDocumentMessage("Complete a loan application first before uploading files.");
      return;
    }

    const selectedFile = documentType === "Aadhaar" ? aadhaarFile : panFile;
    const fileLabel = documentType === "Aadhaar" ? aadhaarFileName : panFileName;

    if (!selectedFile && !fileLabel.trim()) {
      setDocumentMessage(`Please choose a ${documentType} file before uploading.`);
      return;
    }

    try {
      setDocumentUploading(true);
      setDocumentMessage("");

      const formData = new FormData();
      formData.append("loanApplicationId", applicationId);
      formData.append("documentType", documentType);
      formData.append("fileName", fileLabel.trim() || (selectedFile ? selectedFile.name : ""));

      if (selectedFile) {
        formData.append("documentFile", selectedFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Document upload failed");
      }

      setDocumentMessage(`${documentType} uploaded successfully and OCR processing has started.`);

      if (documentType === "Aadhaar") {
        setAadhaarFile(null);
        setAadhaarFileName("");
      } else {
        setPanFile(null);
        setPanFileName("");
      }

      await fetchUploadedDocuments();
    } catch (uploadError) {
      setDocumentMessage(uploadError.message || "Unable to upload document");
    } finally {
      setDocumentUploading(false);
    }
  };

  const handleVerificationInputChange = (event) => {
    const { name, value } = event.target;
    setVerificationForm((prev) => ({
      ...prev,
      [name]: value
    }));
    setVerificationStatus({
      verifying: false,
      passed: false,
      message: ""
    });
  };

  const handleVerifyDocuments = async (event) => {
    event.preventDefault();

    if (!token || !applicationId) {
      setVerificationStatus({
        verifying: false,
        passed: false,
        message: "Complete your loan application before document verification."
      });
      return;
    }

    try {
      setVerificationStatus({ verifying: true, passed: false, message: "" });

      const response = await fetch(
        `${API_BASE_URL}/api/loans/applications/${applicationId}/verify-documents`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(verificationForm)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Document verification failed");
      }

      setVerificationStatus({
        verifying: false,
        passed: true,
        message: data.message || "Document verification passed."
      });
      setLoanApprovalStatus("DOCUMENT_VERIFIED");
    } catch (verificationError) {
      setVerificationStatus({
        verifying: false,
        passed: false,
        message: verificationError.message || "Unable to verify the document data."
      });
    }
  };

  const handleApproveLoan = async () => {
    if (!token || !applicationId) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/loans/applications/${applicationId}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Loan approval failed");
      }

      setLoanApprovalStatus("APPROVED");
      setVerificationStatus({
        verifying: false,
        passed: true,
        message: data.message || "Loan approved successfully."
      });
    } catch (approvalError) {
      setVerificationStatus({
        verifying: false,
        passed: false,
        message: approvalError.message || "Unable to approve loan."
      });
    }
  };

  useEffect(() => {
  if (!token) {
    navigate("/login", { replace: true });
    return;
  }

  if (!applicationId) {
    setProcessing(false);
    return;
  }

  const loadApplicationAndCheckEligibility = async () => {
    try {
      setProcessing(true);
      setError("");

      // 1. Get the current application state
      const applicationResponse = await fetch(
        `${API_BASE_URL}/api/loans/applications/${applicationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const applicationData = await applicationResponse.json();

      if (!applicationResponse.ok) {
        throw new Error(
          applicationData.message || "Unable to load loan application"
        );
      }

      const application = applicationData.loanApplication;

      // 2. If the application is still a DRAFT,
      // submit it first.
      if (application.status === "DRAFT") {
        const submitResponse = await fetch(
          `${API_BASE_URL}/api/loans/applications/${applicationId}/submit`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const submitData = await submitResponse.json();

        if (!submitResponse.ok) {
          throw new Error(
            submitData.message || "Unable to submit loan application"
          );
        }

        // After submitting, run eligibility.
        const eligibilityResponse = await fetch(
          `${API_BASE_URL}/api/eligibility/${applicationId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const eligibilityData = await eligibilityResponse.json();

        if (!eligibilityResponse.ok) {
          throw new Error(
            eligibilityData.message || "Eligibility check failed"
          );
        }

        const eligible = eligibilityData.decision === "ELIGIBLE";

        setResult({
          eligible,
          reason:
            eligibilityData.reason ||
            (eligible
              ? "You are eligible for this loan."
              : "You are not eligible for this loan."),
          confidence: eligibilityData.confidence ?? null,
          source:
            eligibilityData.source || "CUSTOM_ML_MODEL"
        });

        await fetchUploadedDocuments();
        return;
      }

      // 3. If already SUBMITTED, run eligibility.
      if (application.status === "SUBMITTED") {
        const eligibilityResponse = await fetch(
          `${API_BASE_URL}/api/eligibility/${applicationId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const eligibilityData = await eligibilityResponse.json();

        if (!eligibilityResponse.ok) {
          throw new Error(
            eligibilityData.message || "Eligibility check failed"
          );
        }

        const eligible = eligibilityData.decision === "ELIGIBLE";

        setResult({
          eligible,
          reason:
            eligibilityData.reason ||
            (eligible
              ? "You are eligible for this loan."
              : "You are not eligible for this loan."),
          confidence: eligibilityData.confidence ?? null,
          source:
            eligibilityData.source || "CUSTOM_ML_MODEL"
        });

        await fetchUploadedDocuments();
        return;
      }

      // 4. Already checked by ML.
      // DO NOT call eligibility again.
      if (
        application.status === "ELIGIBLE" ||
        application.status === "DOCUMENT_PENDING" ||
        application.status === "DOCUMENT_VERIFIED" ||
        application.status === "APPROVED"
      ) {
        setResult({
          eligible: true,
          reason: "You are eligible for this loan.",
          confidence: application.confidence ?? null,
          source:
            application.decisionSource || "CUSTOM_ML_MODEL"
        });

        await fetchUploadedDocuments();
        return;
      }

      // 5. Already rejected by ML.
      if (
        application.status === "NOT_ELIGIBLE" ||
        application.status === "REJECTED"
      ) {
        setResult({
          eligible: false,
          reason:
            application.rejectionReason ||
            "You are not eligible for this loan.",
          confidence: application.confidence ?? null,
          source:
            application.decisionSource || "CUSTOM_ML_MODEL"
        });

        await fetchUploadedDocuments();
        return;
      }

      throw new Error(
        `Unsupported application status: ${application.status}`
      );
    } catch (checkError) {
      setError(checkError.message);
    } finally {
      setProcessing(false);
    }
  };

  loadApplicationAndCheckEligibility();
}, [applicationId, navigate, token]);

  const hasAadhaar = uploadedDocuments.some((document) => document.documentType === "Aadhaar");
  const hasPan = uploadedDocuments.some((document) => document.documentType === "PAN");

  return (
    <main className="eligibility-page">
      <section className="eligibility-hero">
        <span className="section-label">{t("eligibility.badge")}</span>

        <h1>{t("eligibility.title")}</h1>

        <p>{t("eligibility.subtitle")}</p>
      </section>

      <section className="eligibility-container">
        <div className="eligibility-info">
          <span className="eligibility-icon">✓</span>

          <h2>{t("eligibility.checkTitle")}</h2>

          <p>{t("eligibility.checkDescription")}</p>

          <div className="eligibility-points">
            <div>
              <span>✓</span>
              {t("eligibility.point1")}
            </div>

            <div>
              <span>✓</span>
              {t("eligibility.point2")}
            </div>

            <div>
              <span>✓</span>
              {t("eligibility.point3")}
            </div>
          </div>
        </div>

        <div className="eligibility-form">
          {!applicationId && !result && (
            <div className="eligibility-result not-eligible">
              <span>ℹ</span>
              <div>
                <h3>No active application selected</h3>
                <p>
                  Start from the loan application flow and continue to
                  eligibility from there.
                </p>
              </div>
            </div>
          )}

          {processing && (
            <div className="eligibility-result eligible">
              <span>⏳</span>
              <div>
                <h3>Checking eligibility...</h3>
                <p>
                  The backend is validating your application against the
                  business rules and ML model.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="eligibility-result not-eligible">
              <span>!</span>
              <div>
                <h3>Eligibility check failed</h3>
                <p>{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div
              className={
                result.eligible
                  ? "eligibility-result eligible"
                  : "eligibility-result not-eligible"
              }
            >
              <span>{result.eligible ? "✓" : "!"}</span>

              <div>
                <h3>
                  {result.eligible
                    ? t("eligibility.eligibleTitle")
                    : t("eligibility.notEligibleTitle")}
                </h3>

                <p>{result.reason}</p>

                {result.confidence !== null && (
                  <p>
                    <strong>Confidence:</strong> {result.confidence}
                  </p>
                )}

                <p>
                  <strong>Decision source:</strong> {result.source}
                </p>
              </div>
            </div>
          )}

          {result?.eligible && applicationId && (
            <div className="eligibility-result eligible">
              <span>📄</span>
              <div>
                <h3>Upload Aadhaar and PAN documents</h3>
                <p>Upload both documents to continue. The app will compare the extracted applicant name against your bank-customer record and let you review the details before final approval.</p>

                <div className="document-upload-grid">
                  <form onSubmit={(event) => handleDocumentUpload(event, "Aadhaar")} className="document-upload-box">
                    <h4>Aadhaar card</h4>

                    <div className="eligibility-form-group">
                      <label>Choose Aadhaar file</label>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.pdf"
                        onChange={(event) => setAadhaarFile(event.target.files?.[0] || null)}
                      />
                    </div>

                    <div className="eligibility-form-group">
                      <label>Optional file label</label>
                      <input
                        type="text"
                        value={aadhaarFileName}
                        placeholder="e.g. Aadhaar_Ramya"
                        onChange={(event) => setAadhaarFileName(event.target.value)}
                      />
                    </div>

                    <button type="submit" className="primary-btn" disabled={documentUploading}>
                      {documentUploading ? "Uploading..." : "Upload Aadhaar"}
                    </button>
                  </form>

                  <form onSubmit={(event) => handleDocumentUpload(event, "PAN")} className="document-upload-box">
                    <h4>PAN card</h4>

                    <div className="eligibility-form-group">
                      <label>Choose PAN file</label>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.pdf"
                        onChange={(event) => setPanFile(event.target.files?.[0] || null)}
                      />
                    </div>

                    <div className="eligibility-form-group">
                      <label>Optional file label</label>
                      <input
                        type="text"
                        value={panFileName}
                        placeholder="e.g. PAN_Ramya"
                        onChange={(event) => setPanFileName(event.target.value)}
                      />
                    </div>

                    <button type="submit" className="primary-btn" disabled={documentUploading}>
                      {documentUploading ? "Uploading..." : "Upload PAN"}
                    </button>
                  </form>
                </div>

                {documentMessage && <p className="loan-error">{documentMessage}</p>}

                {(hasAadhaar || hasPan) && (
                  <form onSubmit={handleVerifyDocuments} className="verification-form-wrapper">
                    <h4>Review extracted KYC details</h4>
                    <p>The system compares the applicant name from the uploaded Aadhaar/PAN documents with the bank customer record. You can edit any values before final verification.</p>

                    <div className="eligibility-form-group">
                      <label>Applicant name</label>
                      <input
                        type="text"
                        name="applicantName"
                        value={verificationForm.applicantName}
                        onChange={handleVerificationInputChange}
                      />
                    </div>

                    <div className="eligibility-form-group">
                      <label>Date of birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={verificationForm.dateOfBirth}
                        onChange={handleVerificationInputChange}
                      />
                    </div>

                    <div className="eligibility-form-group">
                      <label>Aadhaar number</label>
                      <input
                        type="text"
                        name="aadhaarNumber"
                        value={verificationForm.aadhaarNumber}
                        onChange={handleVerificationInputChange}
                      />
                    </div>

                    <div className="eligibility-form-group">
                      <label>PAN number</label>
                      <input
                        type="text"
                        name="panNumber"
                        value={verificationForm.panNumber}
                        onChange={handleVerificationInputChange}
                      />
                    </div>

                    <div className="eligibility-form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        name="address"
                        value={verificationForm.address}
                        onChange={handleVerificationInputChange}
                      />
                    </div>

                    <div className="status-action-row">
                      <button type="submit" className="primary-btn" disabled={verificationStatus.verifying}>
                        {verificationStatus.verifying ? "Verifying..." : "Verify details"}
                      </button>

                      {verificationStatus.passed && !loanApprovalStatus && (
                        <button type="button" className="primary-btn" onClick={handleApproveLoan}>
                          Approve loan
                        </button>
                      )}
                    </div>

                    {verificationStatus.message && (
                      <p className={verificationStatus.passed ? "loan-success" : "loan-error"}>
                        {verificationStatus.message}
                      </p>
                    )}

                    {loanApprovalStatus === "APPROVED" && (
                      <p className="loan-success">Loan approved successfully.</p>
                    )}
                  </form>
                )}

                {!hasAadhaar && !hasPan && (
                  <p className="loan-error">Upload both Aadhaar and PAN documents to continue.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Eligibility;
