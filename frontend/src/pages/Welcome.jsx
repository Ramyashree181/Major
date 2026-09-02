import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Welcome.css";

const Welcome = () => {
  const { t, i18n } = useTranslation();

  const token = localStorage.getItem("token");

  // If already logged in, go to home
  if (token) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="welcome-page">

      <div className="welcome-language-selector">

        <button
          type="button"
          onClick={() => i18n.changeLanguage("en")}
          className={
            i18n.language === "en"
              ? "active-language"
              : ""
          }
        >
          EN
        </button>

        <button
          type="button"
          onClick={() => i18n.changeLanguage("hi")}
          className={
            i18n.language === "hi"
              ? "active-language"
              : ""
          }
        >
          हिं
        </button>

        <button
          type="button"
          onClick={() => i18n.changeLanguage("kn")}
          className={
            i18n.language === "kn"
              ? "active-language"
              : ""
          }
        >
          ಕಂ
        </button>

      </div>

      {/* LEFT SECTION */}
      <div className="welcome-left">

        <div className="welcome-logo">
          <div className="welcome-logo-icon">₹</div>

          <span>
            {t("app.name")}
          </span>
        </div>


        <div className="welcome-content">

          <span className="welcome-badge">
            {t("welcome.tag")}
          </span>


          <h1>
            {t("welcome.title1")}

            <span>
              {" "}
              {t("welcome.title2")}
            </span>
          </h1>


          <p>
            {t("welcome.description")}
          </p>


          <div className="welcome-features">

            <div>
              <span>✓</span>

              {t("welcome.feature1")}
            </div>


            <div>
              <span>✓</span>

              {t("welcome.feature2")}
            </div>


            <div>
              <span>✓</span>

              {t("welcome.feature3")}
            </div>

          </div>

        </div>

      </div>


      {/* RIGHT SECTION */}
      <div className="welcome-right">

        <div className="welcome-card">

          <span className="welcome-card-label">
            {t("welcome.getStarted")}
          </span>


          <h2>
            {t("welcome.welcomeTitle")}
          </h2>


          <p>
            {t("auth.startJourney")}
          </p>


          {/* CREATE ACCOUNT */}
          <Link
            to="/signup"
            className="welcome-primary-button"
          >
            {t("auth.createAccount")} →
          </Link>


          <div className="welcome-divider">
            <span>
              {t("welcome.or")}
            </span>
          </div>


          <p className="welcome-login-text">
            {t("welcome.alreadyAccount")}
          </p>


          {/* SIGN IN */}
          <Link
            to="/login"
            className="welcome-secondary-button"
          >
            {t("auth.signIn")}
          </Link>


          <p className="welcome-security">
            🔒 {t("welcome.security")}
          </p>

        </div>

      </div>

    </div>
  );
};

export default Welcome;