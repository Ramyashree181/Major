import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import "./Documents.css";

const Documents = () => {
  const { t } = useTranslation();
  const token = localStorage.getItem("token");
  const applicationId = localStorage.getItem("lastApplicationId") || "";

  const [selectedLoan, setSelectedLoan] = useState("home");
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [loading, setLoading] = useState(Boolean(applicationId));
  const [message, setMessage] = useState("");

  const documentGroups = {
    home: [
      {
        id: "identity",
        icon: "🪪",
        title: t("documents.identityProof") || "Identity Proof",
        documents: [
          t("documents.identityDoc1") || "Aadhaar card",
          t("documents.identityDoc2") || "PAN card",
          t("documents.identityDoc3") || "Passport"
        ]
      },
      {
        id: "address",
        icon: "🏠",
        title: t("documents.addressProof") || "Address Proof",
        documents: [
          t("documents.addressDoc1") || "Utility bill",
          t("documents.addressDoc2") || "Rental agreement",
          t("documents.addressDoc3") || "Bank statement"
        ]
      },
      {
        id: "income",
        icon: "💰",
        title: t("documents.incomeProof") || "Income Proof",
        documents: [
          t("documents.incomeDoc1") || "Salary slips",
          t("documents.incomeDoc2") || "Form 16",
          t("documents.incomeDoc3") || "IT returns"
        ]
      },
      {
        id: "property",
        icon: "📄",
        title: t("documents.propertyDocuments") || "Property Documents",
        documents: [
          t("documents.propertyDoc1") || "Sale agreement",
          t("documents.propertyDoc2") || "Title deed",
          t("documents.propertyDoc3") || "Approved plan"
        ]
      }
    ],
    vehicle: [
      {
        id: "identity",
        icon: "🪪",
        title: t("documents.identityProof") || "Identity Proof",
        documents: [
          t("documents.identityDoc1") || "Aadhaar card",
          t("documents.identityDoc2") || "PAN card",
          t("documents.identityDoc3") || "Passport"
        ]
      },
      {
        id: "address",
        icon: "🏠",
        title: t("documents.addressProof") || "Address Proof",
        documents: [
          t("documents.addressDoc1") || "Utility bill",
          t("documents.addressDoc2") || "Rental agreement",
          t("documents.addressDoc3") || "Bank statement"
        ]
      },
      {
        id: "income",
        icon: "💰",
        title: t("documents.incomeProof") || "Income Proof",
        documents: [
          t("documents.incomeDoc1") || "Salary slips",
          t("documents.incomeDoc2") || "Form 16",
          t("documents.incomeDoc3") || "IT returns"
        ]
      },
      {
        id: "vehicle",
        icon: "🚗",
        title: t("documents.vehicleDocuments") || "Vehicle Documents",
        documents: [
          t("documents.vehicleDoc1") || "Vehicle quotation",
          t("documents.vehicleDoc2") || "Insurance copy"
        ]
      }
    ],
    education: [
      {
        id: "identity",
        icon: "🪪",
        title: t("documents.identityProof") || "Identity Proof",
        documents: [
          t("documents.identityDoc1") || "Aadhaar card",
          t("documents.identityDoc2") || "PAN card",
          t("documents.identityDoc3") || "Passport"
        ]
      },
      {
        id: "address",
        icon: "🏠",
        title: t("documents.addressProof") || "Address Proof",
        documents: [
          t("documents.addressDoc1") || "Utility bill",
          t("documents.addressDoc2") || "Rental agreement",
          t("documents.addressDoc3") || "Bank statement"
        ]
      },
      {
        id: "education",
        icon: "🎓",
        title: t("documents.educationDocuments") || "Education Documents",
        documents: [
          t("documents.educationDoc1") || "Admission letter",
          t("documents.educationDoc2") || "Fee receipt",
          t("documents.educationDoc3") || "Course details"
        ]
      }
    ],
    personal: [
      {
        id: "identity",
        icon: "🪪",
        title: t("documents.identityProof") || "Identity Proof",
        documents: [
          t("documents.identityDoc1") || "Aadhaar card",
          t("documents.identityDoc2") || "PAN card",
          t("documents.identityDoc3") || "Passport"
        ]
      },
      {
        id: "address",
        icon: "🏠",
        title: t("documents.addressProof") || "Address Proof",
        documents: [
          t("documents.addressDoc1") || "Utility bill",
          t("documents.addressDoc2") || "Rental agreement",
          t("documents.addressDoc3") || "Bank statement"
        ]
      },
      {
        id: "income",
        icon: "💰",
        title: t("documents.incomeProof") || "Income Proof",
        documents: [
          t("documents.incomeDoc1") || "Payslips",
          t("documents.incomeDoc2") || "Bank statement",
          t("documents.incomeDoc3") || "IT returns"
        ]
      }
    ]
  };

  const loanTypes = [
    { id: "home", icon: "🏠", label: t("loanTypes.homeLoan") || "Home Loan" },
    { id: "vehicle", icon: "🚗", label: t("loanTypes.vehicleLoan") || "Vehicle Loan" },
    { id: "education", icon: "🎓", label: t("loanTypes.educationLoan") || "Education Loan" },
    { id: "personal", icon: "💰", label: t("loanTypes.personalLoan") || "Personal Loan" }
  ];

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!token || !applicationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `http://localhost:5000/api/documents/required/${applicationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load required documents");
        }

        setRequiredDocuments(result.requiredDocuments || []);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [applicationId, token]);

  return (
    <main className="documents-page">
      <section className="documents-hero">
        <span className="section-label">{t("documents.badge") || "LOAN DOCUMENTS"}</span>
        <h1>{t("documents.title") || "Documents Required for Your Loan"}</h1>
        <p>{t("documents.subtitle") || "Track the documents needed for your selected loan."}</p>
      </section>

      <section className="documents-loan-selector">
        <h2>{t("documents.selectLoanTitle") || "Select a loan type"}</h2>

        <div className="documents-loan-options">
          {loanTypes.map((loan) => (
            <button
              key={loan.id}
              type="button"
              className={
                selectedLoan === loan.id
                  ? "document-loan-btn active"
                  : "document-loan-btn"
              }
              onClick={() => setSelectedLoan(loan.id)}
            >
              <span>{loan.icon}</span>
              {loan.label}
            </button>
          ))}
        </div>
      </section>

      <section className="documents-section">
        <div className="documents-section-heading">
          <span className="section-label">{t("documents.requiredDocuments") || "REQUIRED DOCUMENTS"}</span>
          <h2>{t("documents.documentsFor") || "Documents for"} {loanTypes.find((loan) => loan.id === selectedLoan)?.label}</h2>
          <p>{t("documents.documentsDescription") || "These are the standard documents you may need to prepare."}</p>
        </div>

        <div className="documents-grid">
          {documentGroups[selectedLoan].map((group) => (
            <article className="document-card" key={group.id}>
              <div className="document-card-icon">{group.icon}</div>
              <h3>{group.title}</h3>
              <ul>
                {group.documents.map((document, index) => (
                  <li key={index}>
                    <span>✓</span>
                    {document}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="documents-note">
        <div className="documents-note-icon">ℹ</div>
        <div>
          <h3>{t("documents.noteTitle") || "Important"}</h3>
          <p>{t("documents.noteDescription") || "Keep these documents ready before you proceed with verification and approval."}</p>
        </div>
      </section>

      <section className="documents-section">
        {message && <p className="loan-error">{message}</p>}

        {loading ? (
          <p className="loan-loading">Loading document requirements...</p>
        ) : (
          <>
            <div className="documents-section-heading">
              <span className="section-label">REQUIRED</span>
              <h2>Required for this application</h2>
            </div>

            <ul className="document-card">
              {(requiredDocuments.length ? requiredDocuments : ["Identity Proof", "Address Proof", "Income Proof"]).map((item, index) => (
                <li key={index}><span>✓</span>{item}</li>
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  );
};

export default Documents;
