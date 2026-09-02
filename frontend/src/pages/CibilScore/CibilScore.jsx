import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import "./CibilScore.css";

const CibilScore = () => {
  const { t } = useTranslation();
  const token = localStorage.getItem("token");

  const [score, setScore] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchCreditProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch("http://localhost:5000/api/customer/credit-profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const result = await response.json();

        if (!response.ok) {
          if (result.message && result.message.toLowerCase().includes("not found")) {
            setScore("");
            setShowResult(false);
            return;
          }

          throw new Error(result.message || "Unable to load credit profile");
        }

        const currentScore = result.creditProfile?.creditScore;

        if (currentScore !== undefined && currentScore !== null) {
          setScore(String(currentScore));
          setShowResult(true);
        }
      } catch (fetchError) {
        setError(fetchError.message || "Unable to load credit profile");
      } finally {
        setLoading(false);
      }
    };

    fetchCreditProfile();
  }, [token]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const numericScore = Number(score);

    if (!score || Number.isNaN(numericScore) || numericScore < 300 || numericScore > 900) {
      setError(t("cibil.invalidScore"));
      setShowResult(false);
      return;
    }

    setError("");
    setShowResult(true);
  };

  const getScoreStatus = () => {
    const numericScore = Number(score);

    if (!score) {
      return null;
    }

    if (numericScore >= 750) {
      return {
        type: "excellent",
        title: t("cibil.excellent"),
        description: t("cibil.excellentMessage")
      };
    }

    if (numericScore >= 650) {
      return {
        type: "good",
        title: t("cibil.good"),
        description: t("cibil.goodMessage")
      };
    }

    return {
      type: "poor",
      title: t("cibil.needsImprovement"),
      description: t("cibil.improvementMessage")
    };
  };

  const scoreStatus = getScoreStatus();

  return (
    <main className="cibil-page">
      <section className="cibil-hero">
        <span className="section-label">{t("cibil.badge")}</span>
        <h1>{t("cibil.title")}</h1>
        <p>{t("cibil.subtitle")}</p>
      </section>

      <section className="cibil-container">
        <div className="cibil-info">
          <div className="cibil-icon">📊</div>
          <h2>{t("cibil.understandTitle")}</h2>
          <p>{t("cibil.understandDescription")}</p>

          <div className="cibil-range-list">
            <div className="cibil-range excellent-range">
              <span>750+</span>
              <div>
                <h4>{t("cibil.excellent")}</h4>
                <p>{t("cibil.excellentRange")}</p>
              </div>
            </div>

            <div className="cibil-range good-range">
              <span>650 - 749</span>
              <div>
                <h4>{t("cibil.good")}</h4>
                <p>{t("cibil.goodRange")}</p>
              </div>
            </div>

            <div className="cibil-range improvement-range">
              <span>300 - 649</span>
              <div>
                <h4>{t("cibil.needsImprovement")}</h4>
                <p>{t("cibil.improvementRange")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="cibil-checker">
          <h2>{t("cibil.checkTitle")}</h2>
          <p>{t("cibil.checkDescription")}</p>

          <form onSubmit={handleSubmit}>
            <div className="cibil-form-group">
              <label>{t("cibil.enterScore")}</label>
              <input
                type="number"
                min="300"
                max="900"
                placeholder={t("cibil.enterScore")}
                value={score}
                onChange={(event) => {
                  setScore(event.target.value);
                  setShowResult(false);
                }}
                required
              />
            </div>

            <button type="submit" className="cibil-check-btn">
              {t("cibil.checkScore")} →
            </button>
          </form>

          {loading && <p className="loan-loading">Loading your credit profile...</p>}
          {error && <p className="form-message error">{error}</p>}

          {showResult && scoreStatus && (
            <div className={`cibil-result ${scoreStatus.type}`}>
              <span className="result-score">{score}</span>
              <div>
                <h3>{scoreStatus.title}</h3>
                <p>{scoreStatus.description}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="cibil-tips-section">
        <div className="cibil-tips-heading">
          <span className="section-label">{t("cibil.improveBadge")}</span>
          <h2>{t("cibil.improveTitle")}</h2>
        </div>

        <div className="cibil-tips-grid">
          <div className="cibil-tip-card">
            <span>💳</span>
            <h3>{t("cibil.payEmiTitle")}</h3>
            <p>{t("cibil.payEmiDescription")}</p>
          </div>

          <div className="cibil-tip-card">
            <span>📉</span>
            <h3>{t("cibil.creditUsageTitle")}</h3>
            <p>{t("cibil.creditUsageDescription")}</p>
          </div>

          <div className="cibil-tip-card">
            <span>🧾</span>
            <h3>{t("cibil.trackBillsTitle")}</h3>
            <p>{t("cibil.trackBillsDescription")}</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CibilScore;