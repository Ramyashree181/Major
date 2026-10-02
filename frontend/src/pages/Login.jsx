import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Signup.css";
import API_BASE_URL from "../api";

const Login = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: formData.email.trim().toLowerCase(),
            password: formData.password
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || t("auth.loginFailed")
        );
      }

      // Save authentication details
      localStorage.setItem("token", result.token);

      localStorage.setItem(
        "user",
        JSON.stringify(result.user)
      );

      setMessage(t("auth.loginSuccess"));

      setTimeout(() => {
        navigate("/home");
      }, 800);

    } catch (error) {

      setError(error.message);

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="auth-page">

      {/* LEFT SIDE */}
      <div className="auth-brand-panel">

        <div className="auth-brand-content">

          <div className="auth-logo">
            <div className="auth-logo-icon">₹</div>

            <span>{t("app.name")}</span>
          </div>


          <div className="auth-hero">

            <span className="auth-badge">
              {t("login.welcomeBackLabel")}
            </span>

            <h1>
              {t("login.heroTitle1")}
              <br />
              {t("login.heroTitle2")}
            </h1>

            <p>
              {t("login.heroDescription")}
            </p>

          </div>


          <div className="auth-feature-list">

            <div>
              <span>✓</span>
              {t("login.feature1")}
            </div>

            <div>
              <span>✓</span>
              {t("login.feature2")}
            </div>

            <div>
              <span>✓</span>
              {t("login.feature3")}
            </div>

          </div>

        </div>

        <div className="auth-background-shape shape-one"></div>
        <div className="auth-background-shape shape-two"></div>

      </div>


      {/* RIGHT SIDE */}
      <div className="auth-form-panel">

        {/* Language Selector */}
        <div className="language-mini-selector">

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


        <div className="auth-form-container">

          <div className="auth-form-heading">

            <span className="auth-small-label">
              {t("login.welcomeBackLabel")}
            </span>

            <h2>
              {t("login.signInTo")} {t("app.name")}
            </h2>

            <p>
              {t("login.formDescription")}
            </p>

          </div>


          <form onSubmit={handleSubmit}>

            {/* EMAIL */}
            <div className="form-group">

              <label>
                {t("auth.email")}
              </label>

              <input
                type="email"
                name="email"
                placeholder={t("auth.enterEmail")}
                value={formData.email}
                onChange={handleChange}
                required
              />

            </div>


            {/* PASSWORD */}
            <div className="form-group">

              <label>
                {t("auth.password")}
              </label>

              <div className="password-wrapper">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder={t("auth.enterPassword")}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword
                    ? t("auth.hide")
                    : t("auth.show")}
                </button>

              </div>

            </div>


            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {message && (
              <div className="auth-success">
                {message}
              </div>
            )}


            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading
                ? t("auth.signingIn")
                : t("auth.signIn")
              }

              {!loading && <span>→</span>}

            </button>

          </form>


          <div className="auth-divider">
            <span>
              {t("welcome.or")}
            </span>
          </div>


          <p className="auth-switch">

            {t("auth.dontHaveAccount")}

            <Link to="/signup">
              {t("auth.createAccount")}
            </Link>

          </p>


          <p className="auth-security-text">
            🔒 {t("auth.security")}
          </p>

        </div>

      </div>

    </div>
  );
};

export default Login;