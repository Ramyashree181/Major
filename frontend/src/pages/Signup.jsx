import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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

    const mobileRegex = /^[0-9]{10}$/;

    if (!mobileRegex.test(formData.mobile)) {
      setError(t("signup.invalidMobile"));
      return;
    }

    if (formData.password.length < 6) {
      setError(t("signup.passwordLength"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            ...formData,
            email: formData.email.trim().toLowerCase(),
            mobile: formData.mobile.trim()
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || t("signup.registrationFailed")
        );
      }

      // Save authentication details
      localStorage.setItem("token", result.token);

      localStorage.setItem(
        "user",
        JSON.stringify(result.user)
      );

      setMessage(t("signup.accountCreated"));

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

      {/* LEFT BRANDING SECTION */}
      <div className="auth-brand-panel">

        <div className="auth-brand-content">

          <div className="auth-logo">
            <div className="auth-logo-icon">₹</div>

            <span>{t("app.name")}</span>
          </div>


          <div className="auth-hero">

            <span className="auth-badge">
              {t("signup.badge")}
            </span>

            <h1>
              {t("signup.heroTitle1")}
              <br />
              {t("signup.heroTitle2")}
            </h1>

            <p>
              {t("signup.heroDescription")}
            </p>

          </div>


          <div className="auth-feature-list">

            <div>
              <span>✓</span>
              {t("signup.feature1")}
            </div>

            <div>
              <span>✓</span>
              {t("signup.feature2")}
            </div>

            <div>
              <span>✓</span>
              {t("signup.feature3")}
            </div>

          </div>

        </div>

        <div className="auth-background-shape shape-one"></div>
        <div className="auth-background-shape shape-two"></div>

      </div>


      {/* RIGHT SIGNUP SECTION */}
      <div className="auth-form-panel">

        {/* LANGUAGE SELECTOR */}
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
              {t("signup.getStarted")}
            </span>

            <h2>
              {t("signup.createTitle")}
            </h2>

            <p>
              {t("signup.formDescription")}
            </p>

          </div>


          <form onSubmit={handleSubmit}>

            {/* FULL NAME */}
            <div className="form-group">

              <label>
                {t("signup.fullName")}
              </label>

              <input
                type="text"
                name="name"
                placeholder={t("signup.enterName")}
                value={formData.name}
                onChange={handleChange}
                required
              />

            </div>


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


            {/* MOBILE */}
            <div className="form-group">

              <label>
                {t("signup.mobileNumber")}
              </label>

              <input
                type="tel"
                name="mobile"
                placeholder={t("signup.enterMobile")}
                value={formData.mobile}
                onChange={handleChange}
                maxLength="10"
                inputMode="numeric"
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
                  placeholder={t("signup.createPassword")}
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


            {/* ERROR */}
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}


            {/* SUCCESS */}
            {message && (
              <div className="auth-success">
                {message}
              </div>
            )}


            {/* SUBMIT */}
            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading
                ? t("signup.creatingAccount")
                : t("auth.createAccount")
              }

              {!loading && <span>→</span>}

            </button>

          </form>


          <div className="auth-divider">
            <span>{t("welcome.or")}</span>
          </div>


          <p className="auth-switch">

            {t("signup.alreadyAccount")}

            <Link to="/login">
              {t("auth.signIn")}
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

export default Signup;