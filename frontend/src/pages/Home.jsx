import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "./Home.css";

const Home = () => {
  const { t } = useTranslation();

  const user = JSON.parse(localStorage.getItem("user"));

  const isBankCustomer = user?.isBankCustomer;

  return (
    <main className="home-page">

      {/* ================= HERO SECTION ================= */}

      <section className="dashboard-hero">

        <div className="dashboard-hero-content">

          <span className="dashboard-badge">
            {isBankCustomer
              ? t("home.bankCustomer")
              : t("home.smartLoanJourney")}
          </span>

          <h1>
            {t("home.welcome")},{" "}
            <span>{user?.name || "User"}</span> 👋
          </h1>

          <p>
            {isBankCustomer
              ? t("home.bankCustomerDescription")
              : t("home.newCustomerDescription")}
          </p>

          <div className="dashboard-hero-actions">

            <Link
              to="/loan-types"
              className="dashboard-primary-btn"
            >
              {t("home.exploreLoans")} →
            </Link>

            <Link
              to="/eligibility"
              className="dashboard-secondary-btn"
            >
              {t("home.checkEligibility")}
            </Link>

          </div>

        </div>


        {/* Dashboard Summary */}

        <div className="dashboard-summary">

          <div className="summary-card">

            <span className="summary-icon">
              🏦
            </span>

            <div>

              <p>
                {t("home.availableLoans")}
              </p>

              <h3>4+</h3>

            </div>

          </div>


          <div className="summary-card">

            <span className="summary-icon">
              📊
            </span>

            <div>

              <p>
                {t("home.eligibility")}
              </p>

              <h3>{t("home.checkNow")}</h3>

            </div>

          </div>


          <div className="summary-card">

            <span className="summary-icon">
              ⭐
            </span>

            <div>

              <p>
                {t("home.cibilScore")}
              </p>

              <h3>{t("home.viewGuide")}</h3>

            </div>

          </div>

        </div>

      </section>


      {/* ================= QUICK ACTIONS ================= */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>

            <span className="section-label">
              {t("home.quickAccess")}
            </span>

            <h2>
              {t("home.everythingYouNeed")}
            </h2>

          </div>

        </div>


        <div className="quick-actions-grid">

          <Link
            to="/loan-types"
            className="quick-action-card"
          >

            <div className="quick-action-icon">
              💰
            </div>

            <h3>
              {t("home.exploreLoanTypes")}
            </h3>

            <p>
              {t("home.exploreLoanTypesDescription")}
            </p>

            <span>
              {t("home.explore")} →
            </span>

          </Link>


          <Link
            to="/eligibility"
            className="quick-action-card"
          >

            <div className="quick-action-icon">
              ✓
            </div>

            <h3>
              {t("home.checkEligibility")}
            </h3>

            <p>
              {t("home.eligibilityDescription")}
            </p>

            <span>
              {t("home.checkNow")} →
            </span>

          </Link>


          <Link
            to="/cibil-score"
            className="quick-action-card"
          >

            <div className="quick-action-icon">
              📈
            </div>

            <h3>
              {t("home.cibilScore")}
            </h3>

            <p>
              {t("home.cibilDescription")}
            </p>

            <span>
              {t("home.learnMore")} →
            </span>

          </Link>


          <Link
            to="/documents"
            className="quick-action-card"
          >

            <div className="quick-action-icon">
              📄
            </div>

            <h3>
              {t("home.documents")}
            </h3>

            <p>
              {t("home.documentsDescription")}
            </p>

            <span>
              {t("home.viewDocuments")} →
            </span>

          </Link>

        </div>

      </section>


      {/* ================= LOAN OPTIONS ================= */}

      <section className="dashboard-section">

        <div className="section-heading section-heading-row">

          <div>

            <span className="section-label">
              {t("home.loanOptions")}
            </span>

            <h2>
              {t("home.findRightLoan")}
            </h2>

          </div>

          <Link
            to="/loan-types"
            className="view-all-link"
          >
            {t("home.viewAll")} →
          </Link>

        </div>


        <div className="loan-preview-grid">

          <div className="loan-preview-card">

            <span className="loan-emoji">
              🏠
            </span>

            <h3>
              {t("loans.homeLoan")}
            </h3>

            <p>
              {t("loans.homeLoanDescription")}
            </p>

          </div>


          <div className="loan-preview-card">

            <span className="loan-emoji">
              🚗
            </span>

            <h3>
              {t("loans.vehicleLoan")}
            </h3>

            <p>
              {t("loans.vehicleLoanDescription")}
            </p>

          </div>


          <div className="loan-preview-card">

            <span className="loan-emoji">
              🎓
            </span>

            <h3>
              {t("loans.educationLoan")}
            </h3>

            <p>
              {t("loans.educationLoanDescription")}
            </p>

          </div>


          <div className="loan-preview-card">

            <span className="loan-emoji">
              💳
            </span>

            <h3>
              {t("loans.personalLoan")}
            </h3>

            <p>
              {t("loans.personalLoanDescription")}
            </p>

          </div>

        </div>

      </section>


      {/* ================= BANK CUSTOMER SECTION ================= */}

      {isBankCustomer && (

        <section className="customer-benefit-banner">

          <div>

            <span className="section-label">
              {t("home.customerBenefits")}
            </span>

            <h2>
              {t("home.exclusiveBenefits")}
            </h2>

            <p>
              {t("home.exclusiveBenefitsDescription")}
            </p>

          </div>

          <Link
            to="/loan-schemes"
            className="dashboard-primary-btn"
          >
            {t("home.viewOffers")} →
          </Link>

        </section>

      )}

    </main>
  );
};

export default Home;