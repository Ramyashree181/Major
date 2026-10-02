import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "./LoanTypes.css";
import API_BASE_URL from "../api";

const LoanTypes = () => {
  const { t } = useTranslation();

  // ================= CUSTOMER DETAILS =================

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const isBankCustomer =
    user?.isBankCustomer === true;


  // ================= LOAN TYPES STATE =================

  const [loans, setLoans] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ================= FETCH LOAN TYPES =================

  useEffect(() => {
    const fetchLoanTypes = async () => {
      try {

        const response = await fetch(
          `${API_BASE_URL}/api/loans/types`
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
            "Failed to fetch loan types"
          );
        }

        setLoans(result.loanTypes);

      } catch (error) {

        console.error(
          "Loan types error:",
          error
        );

        setError(
          "Unable to load loan types. Please try again later."
        );

      } finally {

        setLoading(false);

      }
    };

    fetchLoanTypes();

  }, []);


  // ================= LOAN ICON =================

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


  return (
    <main className="loan-types-page">

      {/* ================= HERO SECTION ================= */}

      <section className="loan-types-hero">

        <span className="section-label">
          {t("loanTypes.badge")}
        </span>

        <h1>
          {t("loanTypes.title")}
        </h1>

        <p>
          {t("loanTypes.subtitle")}
        </p>

      </section>


      {/* ================= CUSTOMER STATUS ================= */}

      <section
        className={
          isBankCustomer
            ? "customer-status customer"
            : "customer-status non-customer"
        }
      >

        <div className="customer-status-content">

          <span className="status-icon">
            {isBankCustomer ? "✓" : "ℹ"}
          </span>

          <div>

            <h3>
              {isBankCustomer
                ? t("loanTypes.bankCustomerTitle")
                : t("loanTypes.nonCustomerTitle")}
            </h3>

            <p>
              {isBankCustomer
                ? t("loanTypes.bankCustomerDescription")
                : t("loanTypes.nonCustomerDescription")}
            </p>

          </div>

        </div>

      </section>


      {/* ================= LOAN TYPES ================= */}

      <section className="loan-types-section">

        {/* Loading */}

        {loading && (
          <p className="loan-loading">
            Loading loan types...
          </p>
        )}


        {/* Error */}

        {error && (
          <p className="loan-error">
            {error}
          </p>
        )}


        {/* Loan Cards */}

        {!loading && !error && (

          <div className="loan-types-grid">

            {loans.map((loan) => (

              <article
                className="loan-type-card"
                key={loan._id}
              >

                {/* Loan Icon */}

                <div className="loan-card-icon">
                  {getLoanIcon(loan.name)}
                </div>


                {/* Loan Name */}

                <h2>
                  {loan.name}
                </h2>


                {/* Loan Description */}

                <p className="loan-description">
                  {loan.description}
                </p>


                {/* Loan Features */}

                <div className="loan-features">

                  <div>
                    <span>✓</span>

                    <p>
                      Loan Amount: ₹
                      {loan.minLoanAmount?.toLocaleString()}
                      {" - "}₹
                      {loan.maxLoanAmount?.toLocaleString()}
                    </p>
                  </div>


                  <div>
                    <span>✓</span>

                    <p>
                      Interest Rate:{" "}
                      {loan.minInterestRate}% -{" "}
                      {loan.maxInterestRate}%
                    </p>
                  </div>


                  <div>
                    <span>✓</span>

                    <p>
                      Repayment:{" "}
                      {loan.minRepaymentYears} -{" "}
                      {loan.maxRepaymentYears} years
                    </p>
                  </div>

                </div>


                {/* ================= ACTION BUTTONS ================= */}

                <div className="loan-card-actions">

                  {/* Loan Details */}

                  <Link
                    to={`/loan-types/${loan._id}`}
                    className="loan-details-btn"
                  >
                    {t("loanTypes.learnMore")} →
                  </Link>


                  {/* Apply Button */}

                  {isBankCustomer ? (

                    <Link
                      to={`/loan-types/${loan._id}`}
                      className="loan-apply-btn"
                    >
                      {t("loanTypes.applyNow")} →
                    </Link>

                  ) : (

                    <button
                      type="button"
                      className="loan-disabled-btn"
                      disabled
                    >
                      🔒 {t("loanTypes.bankCustomerOnly")}
                    </button>

                  )}

                </div>

              </article>

            ))}

          </div>

        )}

      </section>


      {/* ================= NON-CUSTOMER MESSAGE ================= */}

      {!isBankCustomer && (

        <section className="non-customer-info">

          <div className="non-customer-content">

            <span className="non-customer-icon">
              🏦
            </span>

            <div>

              <h2>
                {t("loanTypes.wantToApply")}
              </h2>

              <p>
                {t("loanTypes.wantToApplyDescription")}
              </p>

            </div>

          </div>


          <Link
            to="/eligibility"
            className="dashboard-primary-btn"
          >
            {t("loanTypes.checkEligibility")} →
          </Link>

        </section>

      )}

    </main>
  );
};

export default LoanTypes;