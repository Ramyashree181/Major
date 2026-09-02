import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "./LoanDetails.css";

const getLoanIcon = (loanName) => {
  switch (loanName) {
    case "Home Loan":
      return "🏠";
    case "Personal Loan":
      return "💰";
    case "Education Loan":
      return "🎓";
    case "Business Loan":
      return "💼";
    default:
      return "🏦";
  }
};

const LoanDetails = () => {
  const { loanId } = useParams();
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isBankCustomer = user?.isBankCustomer === true;

  const [loan, setLoan] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLoanData = async () => {
      try {
        setLoading(true);
        setError("");

        const typesResponse = await fetch("http://localhost:5000/api/loans/types");
        const typesResult = await typesResponse.json();

        if (!typesResponse.ok) {
          throw new Error(typesResult.message || "Failed to load loan details");
        }

        const foundLoan = (typesResult.loanTypes || []).find((type) => type._id === loanId);

        if (!foundLoan) {
          setLoan(null);
          setSchemes([]);
          return;
        }

        setLoan(foundLoan);

        const schemesResponse = await fetch(
          `http://localhost:5000/api/loans/types/${loanId}/schemes`
        );

        const schemesResult = await schemesResponse.json();

        if (!schemesResponse.ok) {
          throw new Error(schemesResult.message || "Failed to load loan schemes");
        }

        setSchemes(schemesResult.loanSchemes || []);
      } catch (fetchError) {
        console.error("Loan details error:", fetchError);
        setError(fetchError.message || "Unable to load loan details");
      } finally {
        setLoading(false);
      }
    };

    if (loanId) {
      fetchLoanData();
    }
  }, [loanId]);

  if (!loanId) {
    return <Navigate to="/loan-types" replace />;
  }

  if (loading) {
    return (
      <main className="loan-details-page">
        <p className="loan-loading">Loading loan details...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="loan-details-page">
        <p className="loan-error">{error}</p>
        <Link to="/loan-types" className="back-to-loans">← Back to loan types</Link>
      </main>
    );
  }

  if (!loan) {
    return <Navigate to="/loan-types" replace />;
  }

  const loanRequirements = Array.isArray(loan.basicRequirements) && loan.basicRequirements.length > 0
    ? loan.basicRequirements
    : [
        "Minimum age requirement",
        "Stable income source",
        "Valid identity and address proof"
      ];

  const loanBenefits = [
    "Competitive interest rates",
    "Flexible repayment terms",
    "Fast application processing"
  ];

  return (
    <main className="loan-details-page">
      <section className="loan-details-hero">
        <div className="loan-details-icon">{getLoanIcon(loan.name)}</div>

        <div className="loan-details-content">
          <span className="section-label">{t("loanDetails.badge")}</span>
          <h1>{loan.name}</h1>
          <p>{loan.description}</p>
        </div>
      </section>

      <section className="loan-details-section">
        <h2>{t("loanDetails.keyBenefits")}</h2>
        <div className="details-grid">
          {loanBenefits.map((benefit, index) => (
            <div className="detail-card" key={index}>
              <span>✓</span>
              <p>{benefit}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="loan-details-section">
        <h2>{t("loanDetails.basicEligibility")}</h2>
        <div className="details-list">
          {loanRequirements.map((item, index) => (
            <div key={index}>
              <span>✓</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="loan-details-section">
        <h2>{t("loanDetails.requiredDocuments")}</h2>
        <div className="details-list">
          {[
            "Identity proof",
            "Address proof",
            "Income proof",
            "Bank statements"
          ].map((document, index) => (
            <div key={index}>
              <span>📄</span>
              <p>{document}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="loan-schemes-section">
        <div className="loan-schemes-heading">
          <span className="section-label">{t("loanDetails.schemes.badge")}</span>
          <h2>{t("loanDetails.schemes.title")}</h2>
          <p>{t("loanDetails.schemes.description")}</p>
        </div>

        <div className="loan-schemes-grid">
          {schemes.map((scheme) => {
            const eligible = scheme.governmentSupported || isBankCustomer;
            const schemeType = scheme.governmentSupported ? "government" : "bank";
            const minimumRate = scheme.interestRate?.min ?? 0;
            const maximumRate = scheme.interestRate?.max ?? 0;
            const requirementList = scheme.eligibilityRequirements
              ? [
                  `Minimum age: ${scheme.eligibilityRequirements.minimumAge || "N/A"}`,
                  `Credit score: ${scheme.eligibilityRequirements.minimumCreditScore || "N/A"}`,
                  `Monthly income: ₹${(scheme.eligibilityRequirements.minimumMonthlyIncome || 0).toLocaleString()}`
                ]
              : ["Standard eligibility terms apply"];

            return (
              <article className="loan-scheme-card" key={scheme._id}>
                <span className={`scheme-type ${schemeType}`}>
                  {schemeType === "government"
                    ? t("loanDetails.schemes.government")
                    : t("loanDetails.schemes.bank")}
                </span>

                <h3>{scheme.schemeName}</h3>
                <p className="scheme-description">{scheme.description}</p>

                <div className="scheme-benefits">
                  <div>
                    <span>✓</span>
                    <p>Loan amount: ₹{(scheme.minLoanAmount || 0).toLocaleString()} - ₹{(scheme.maxLoanAmount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span>✓</span>
                    <p>Interest: {minimumRate}% - {maximumRate}%</p>
                  </div>
                  <div>
                    <span>✓</span>
                    <p>Tenure: {scheme.minRepaymentYears || 0} - {scheme.maxRepaymentYears || 0} years</p>
                  </div>
                </div>

                <div className={`scheme-eligibility ${eligible ? "eligible" : "not-eligible"}`}>
                  <span>{eligible ? "✓" : "!"}</span>
                  <strong>{eligible ? t("loanDetails.schemes.eligible") : t("loanDetails.schemes.notEligible")}</strong>
                </div>

                <div className="details-list" style={{ marginTop: "1rem" }}>
                  {requirementList.map((item, index) => (
                    <div key={index}>
                      <span>✓</span>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>

                {eligible ? (
                  <Link to={`/apply/${loanId}?scheme=${scheme._id}`} className="scheme-apply-btn">
                    {t("loanDetails.applyNow")} →
                  </Link>
                ) : (
                  <Link to="/eligibility" className="scheme-check-btn">
                    {t("loanDetails.checkEligibility")} →
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="loan-details-action">
        <div>
          <h2>{isBankCustomer ? t("loanDetails.readyToApply") : t("loanDetails.exploreMore")}</h2>
          <p>{isBankCustomer ? t("loanDetails.readyToApplyDescription") : t("loanDetails.nonCustomerMessage")}</p>
        </div>

        {isBankCustomer ? (
          <Link to={`/apply/${loanId}`} className="loan-apply-btn">
            {t("loanDetails.applyNow")} →
          </Link>
        ) : (
          <Link to="/eligibility" className="loan-details-btn">
            {t("loanDetails.checkEligibility")} →
          </Link>
        )}
      </section>

      <Link to="/loan-types" className="back-to-loans">
        ← {t("loanDetails.backToLoans")}
      </Link>
    </main>
  );
};

export default LoanDetails;