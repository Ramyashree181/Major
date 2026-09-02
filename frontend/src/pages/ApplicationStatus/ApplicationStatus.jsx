import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./ApplicationStatus.css";

const ApplicationStatus = () => {
  const token = localStorage.getItem("token");
  const applicationId = localStorage.getItem("lastApplicationId") || "";

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(Boolean(applicationId));
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const clearApplicationState = () => {
    localStorage.removeItem("lastApplicationId");
    setApplication(null);
    setError("");
  };

  const handleDeleteApplication = async () => {
    if (!token || !applicationId) {
      clearApplicationState();
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/loans/applications/${applicationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete application");
      }

      clearApplicationState();
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete application");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const fetchApplication = async () => {
      if (!token || !applicationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/loans/applications/${applicationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load application status");
        }

        setApplication(result.loanApplication || null);
      } catch (fetchError) {
        setError(fetchError.message || "Unable to load application status");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId, token]);

  if (!applicationId && !loading) {
    return (
      <main className="application-status-page empty-state">
        <div className="status-card">
          <span className="status-icon">ℹ</span>
          <h1>No application found</h1>
          <p>Submit a loan application first and then come back to track its status.</p>
          <Link to="/loan-types" className="dashboard-primary-btn">
            Browse loan types →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="application-status-page">
      <section className="status-header">
        <span className="section-label">Application Status</span>
        <h1>Loan Application Dashboard</h1>
        <p>Track the latest update for your submitted application.</p>
      </section>

      {loading ? (
        <div className="status-card">
          <p className="loan-loading">Loading your application status...</p>
        </div>
      ) : error ? (
        <div className="status-card error-card">
          <span className="status-icon">!</span>
          <h2>Unable to load status</h2>
          <p>{error}</p>
        </div>
      ) : application ? (
        <section className="status-grid">
          <div className="status-card primary-card">
            <span className="status-badge">{application.status}</span>
            <h2>Application Overview</h2>
            <ul>
              <li><strong>Application ID:</strong> {application._id}</li>
              <li><strong>Loan type:</strong> {application.loanTypeId?.name || "Loan Type"}</li>
              <li><strong>Scheme:</strong> {application.loanSchemeId?.schemeName || "Loan Scheme"}</li>
              <li><strong>Requested amount:</strong> ₹{Number(application.requestedAmount || 0).toLocaleString()}</li>
              <li><strong>Tenure:</strong> {application.tenureMonths} months</li>
              <li><strong>Employment:</strong> {application.employmentType}</li>
              <li><strong>Monthly income:</strong> ₹{Number(application.monthlyIncome || 0).toLocaleString()}</li>
            </ul>
          </div>

          <div className="status-card">
            <h2>Decision Summary</h2>
            <div className={`decision-pill ${application.eligibilityDecision === "ELIGIBLE" ? "eligible" : application.eligibilityDecision ? "not-eligible" : "pending"}`}>
              {application.eligibilityDecision || "Pending"}
            </div>
            <p>
              {application.rejectionReason ||
                "Your application is being processed. Decision details will appear here once the review is complete."}
            </p>
            <p><strong>Decision source:</strong> {application.decisionSource || "Not available yet"}</p>
            <p><strong>Confidence:</strong> {application.confidence ?? "N/A"}</p>
          </div>
        </section>
      ) : null}

      <div className="status-actions">
        <button
          type="button"
          className="dashboard-secondary-btn"
          onClick={handleDeleteApplication}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete application"}
        </button>
        <Link to="/documents" className="dashboard-secondary-btn">
          View documents
        </Link>
        <Link to="/loan-types" className="dashboard-primary-btn">
          Explore more loans
        </Link>
      </div>
    </main>
  );
};

export default ApplicationStatus;
