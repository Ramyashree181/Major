import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LanguageSelector from "../LanguageSelector/LanguageSelector";

import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
    window.location.reload();
  };

  return (
    <header className="navbar">
      <div className="container navbar-container">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">E</div>

          <div>
            <span className="logo-name">
                {t("brand.name")}
            </span>

            <span className="logo-tagline">
                {t("brand.tagline")}
            </span>
           </div>
        </Link>

        {/* Navigation */}
        <nav className="navbar-links">

          <Link to="/">
            {t("nav.home")}
          </Link>

          <Link to="/loan-types">
            {t("nav.loanTypes")}
          </Link>

          {/* <Link to="/loan-schemes">
            {t("nav.schemes")}
          </Link> */}

          <Link to="/eligibility">
            {t("nav.eligibility")}
          </Link>

          <Link to="/cibil-score">
            {t("nav.cibilScore")}
          </Link>

          <Link to="/documents">
            {t("nav.documents")}
          </Link>

          <Link to="/application-status">
            Application Status
          </Link>

        </nav>

        {/* Actions */}
        <div className="navbar-actions">

          <LanguageSelector />

          {!user ? (
            <>
              <Link
                to="/login"
                className="login-link"
              >
                {t("nav.login")}
              </Link>

              <Link
                to="/signup"
                className="btn btn-primary navbar-signup"
              >
                {t("nav.signup")}
              </Link>
            </>
          ) : (
            <>
              <span className="user-name">
                {t("nav.hello")}, {user.name}
              </span>

              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                {t("nav.logout")}
              </button>
            </>
          )}

        </div>

      </div>
    </header>
  );
};

export default Navbar;