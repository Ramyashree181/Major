import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "./LoanSchemes.css";

const LoanSchemes = () => {
  const { t } = useTranslation();

  const user = JSON.parse(localStorage.getItem("user"));

  const isBankCustomer = user?.isBankCustomer;

  const schemes = [
    {
      id: "home",
      icon: "🏠",
      title: t("loanSchemes.homeScheme"),
      description: t("loanSchemes.homeSchemeDescription"),
      benefits: [
        t("loanSchemes.homeBenefit1"),
        t("loanSchemes.homeBenefit2"),
        t("loanSchemes.homeBenefit3")
      ]
    },
    {
      id: "vehicle",
      icon: "🚗",
      title: t("loanSchemes.vehicleScheme"),
      description: t("loanSchemes.vehicleSchemeDescription"),
      benefits: [
        t("loanSchemes.vehicleBenefit1"),
        t("loanSchemes.vehicleBenefit2"),
        t("loanSchemes.vehicleBenefit3")
      ]
    },
    {
      id: "education",
      icon: "🎓",
      title: t("loanSchemes.educationScheme"),
      description: t("loanSchemes.educationSchemeDescription"),
      benefits: [
        t("loanSchemes.educationBenefit1"),
        t("loanSchemes.educationBenefit2"),
        t("loanSchemes.educationBenefit3")
      ]
    },
    {
      id: "personal",
      icon: "💳",
      title: t("loanSchemes.personalScheme"),
      description: t("loanSchemes.personalSchemeDescription"),
      benefits: [
        t("loanSchemes.personalBenefit1"),
        t("loanSchemes.personalBenefit2"),
        t("loanSchemes.personalBenefit3")
      ]
    }
  ];

  return (
    <main className="loan-schemes-page">

      {/* ================= HERO ================= */}

      <section className="loan-schemes-hero">

        <span className="section-label">
          {t("loanSchemes.badge")}
        </span>

        <h1>
          {t("loanSchemes.title")}
        </h1>

        <p>
          {t("loanSchemes.subtitle")}
        </p>

      </section>


      {/* ================= CUSTOMER STATUS ================= */}

      <section
        className={
          isBankCustomer
            ? "scheme-customer-status customer"
            : "scheme-customer-status non-customer"
        }
      >

        <div className="scheme-status-content">

          <span className="scheme-status-icon">
            {isBankCustomer ? "✓" : "ℹ"}
          </span>

          <div>

            <h3>
              {isBankCustomer
                ? t("loanSchemes.customerTitle")
                : t("loanSchemes.nonCustomerTitle")}
            </h3>

            <p>
              {isBankCustomer
                ? t("loanSchemes.customerDescription")
                : t("loanSchemes.nonCustomerDescription")}
            </p>

          </div>

        </div>

      </section>


      {/* ================= SCHEME CARDS ================= */}

      <section className="loan-schemes-section">

        <div className="loan-schemes-grid">

          {schemes.map((scheme) => (

            <article
              className="loan-scheme-card"
              key={scheme.id}
            >

              <div className="scheme-card-icon">
                {scheme.icon}
              </div>

              <h2>
                {scheme.title}
              </h2>

              <p className="scheme-description">
                {scheme.description}
              </p>


              {/* BENEFITS */}

              <div className="scheme-benefits">

                <h4>
                  {t("loanSchemes.keyBenefits")}
                </h4>

                {scheme.benefits.map((benefit, index) => (

                  <div key={index}>

                    <span>✓</span>

                    {benefit}

                  </div>

                ))}

              </div>


              {/* ACTIONS */}

              <div className="scheme-card-actions">

                <Link
                  to={`/loan-types/${scheme.id}`}
                  className="scheme-details-btn"
                >
                  {t("loanSchemes.learnMore")} →
                </Link>


                {isBankCustomer ? (

                  <Link
                    to="/eligibility"
                    className="scheme-apply-btn"
                  >
                    {t("loanSchemes.checkEligibility")} →
                  </Link>

                ) : (

                  <button
                    className="scheme-disabled-btn"
                    disabled
                  >
                    🔒 {t("loanSchemes.bankCustomerOnly")}
                  </button>

                )}

              </div>

            </article>

          ))}

        </div>

      </section>


      {/* ================= BOTTOM SECTION ================= */}

      {!isBankCustomer && (

        <section className="scheme-non-customer-info">

          <div className="scheme-info-content">

            <span className="scheme-info-icon">
              🏦
            </span>

            <div>

              <h2>
                {t("loanSchemes.wantToApply")}
              </h2>

              <p>
                {t("loanSchemes.wantToApplyDescription")}
              </p>

            </div>

          </div>

          <Link
            to="/eligibility"
            className="dashboard-primary-btn"
          >
            {t("loanSchemes.exploreEligibility")} →
          </Link>

        </section>

      )}

    </main>
  );
};

export default LoanSchemes;