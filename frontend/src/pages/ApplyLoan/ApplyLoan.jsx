import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import "./ApplyLoan.css";

const ApplyLoan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loanId } = useParams();
  const token = localStorage.getItem("token");

  const queryParams = new URLSearchParams(location.search);
  const preselectedSchemeId = queryParams.get("scheme") || "";

  const [loanTypes, setLoanTypes] = useState([]);
  const [loanSchemes, setLoanSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [applicationId, setApplicationId] = useState("");

  const [ocrData, setOcrData] = useState(null);

  const [formData, setFormData] = useState({
    loanTypeId: loanId || "",
    loanSchemeId: preselectedSchemeId,
    employmentType: "",
    monthlyIncome: "",
    requestedAmount: "",
    tenureMonths: ""
  });

  useEffect(() => {
    const loadOcrDetails = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/documents/my-documents", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load uploaded documents");
        }

        const latestRelevantDocument = (result.documents || []).find((document) => {
          const sameApplication = localStorage.getItem("lastApplicationId");
          return !sameApplication || document.loanApplicationId === sameApplication || !document.loanApplicationId;
        });

        if (latestRelevantDocument?.extractedData) {
          const extracted = latestRelevantDocument.extractedData;
          setOcrData(extracted);
          setFormData((prev) => ({
            ...prev,
            monthlyIncome: prev.monthlyIncome || extracted.monthlyIncome || "",
            employmentType: prev.employmentType || "Salaried"
          }));
        }
      } catch (loadError) {
        console.warn(loadError.message);
      }
    };

    loadOcrDetails();
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchLoanTypes = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/loans/types",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to fetch loan types"
          );
        }

        setLoanTypes(result.loanTypes || []);

        if (loanId) {
          const selectedType = (result.loanTypes || []).find(
            (type) => type._id === loanId
          );

          if (selectedType) {
            setFormData((prev) => ({
              ...prev,
              loanTypeId: selectedType._id
            }));
          }
        }
      } catch (fetchError) {
        setError(fetchError.message);
      }
    };

    fetchLoanTypes();
  }, [loanId, navigate, token]);

  useEffect(() => {
    const selectedLoanTypeId = formData.loanTypeId;

    if (!selectedLoanTypeId) {
      setLoanSchemes([]);
      return;
    }

    const fetchLoanSchemes = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `http://localhost:5000/api/loans/types/${selectedLoanTypeId}/schemes`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to fetch loan schemes"
          );
        }

        const schemes = result.loanSchemes || [];
        setLoanSchemes(schemes);

        if (preselectedSchemeId) {
          const validScheme = schemes.some(
            (scheme) => scheme._id === preselectedSchemeId
          );

          setFormData((prev) => ({
            ...prev,
            loanSchemeId: validScheme ? preselectedSchemeId : ""
          }));
        } else if (schemes.length > 0) {
          setFormData((prev) => ({
            ...prev,
            loanSchemeId: schemes[0]._id
          }));
        }
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanSchemes();
  }, [formData.loanTypeId, preselectedSchemeId, token]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.loanTypeId || !formData.loanSchemeId) {
      setError("Please select a valid loan type and scheme.");
      return;
    }

    if (
      !formData.employmentType ||
      !formData.monthlyIncome ||
      !formData.requestedAmount ||
      !formData.tenureMonths
    ) {
      setError("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const resolvedMonthlyIncome = Number(
        formData.monthlyIncome || ocrData?.monthlyIncome || 0
      );

      const response = await fetch(
        "http://localhost:5000/api/loans/applications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            loanTypeId: formData.loanTypeId,
            loanSchemeId: formData.loanSchemeId,
            employmentType: formData.employmentType || "Salaried",
            monthlyIncome: resolvedMonthlyIncome,
            requestedAmount: Number(formData.requestedAmount),
            tenureMonths: Number(formData.tenureMonths),
            additionalDetails: {
              ...(ocrData || {}),
              source: "OCR"
            }
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to create loan application"
        );
      }

      const createdApplication = result.loanApplication;
      setApplicationId(createdApplication._id);
      localStorage.setItem("lastApplicationId", createdApplication._id);
      setSuccessMessage(
        "Loan application created successfully. You can now continue to the eligibility check."
      );

      navigate("/eligibility", {
        state: {
          applicationId: createdApplication._id,
          loanTypeId: createdApplication.loanTypeId,
          loanSchemeId: createdApplication.loanSchemeId
        }
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <main className="apply-loan-page">
      <section className="apply-loan-header">
        <span className="section-label">Application</span>
        <h1>Apply for a Loan</h1>
        <p>
          Complete your loan details and continue to the eligibility check.
        </p>
      </section>

      <section className="apply-loan-card">
        <form onSubmit={handleSubmit} className="apply-loan-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Loan Type</label>
              <select
                name="loanTypeId"
                value={formData.loanTypeId}
                onChange={handleChange}
                required
              >
                <option value="">Select a loan type</option>
                {loanTypes.map((loanType) => (
                  <option key={loanType._id} value={loanType._id}>
                    {loanType.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Loan Scheme</label>
              <select
                name="loanSchemeId"
                value={formData.loanSchemeId}
                onChange={handleChange}
                required
                disabled={loading || loanSchemes.length === 0}
              >
                <option value="">Select a loan scheme</option>
                {loanSchemes.map((scheme) => (
                  <option key={scheme._id} value={scheme._id}>
                    {scheme.schemeName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Employment Type</label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                required
              >
                <option value="">Select employment type</option>
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Business">Business</option>
                <option value="Student">Student</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Monthly Income</label>
              <input
                type="number"
                name="monthlyIncome"
                min="0"
                value={formData.monthlyIncome}
                onChange={handleChange}
                placeholder="Enter monthly income"
                required
              />
            </div>

            <div className="form-group">
              <label>Requested Loan Amount</label>
              <input
                type="number"
                name="requestedAmount"
                min="1"
                value={formData.requestedAmount}
                onChange={handleChange}
                placeholder="Enter requested amount"
                required
              />
            </div>

            <div className="form-group">
              <label>Tenure in Months</label>
              <input
                type="number"
                name="tenureMonths"
                min="1"
                value={formData.tenureMonths}
                onChange={handleChange}
                placeholder="Enter tenure in months"
                required
              />
            </div>
          </div>

          {error && <div className="form-message error">{error}</div>}
          {successMessage && (
            <div className="form-message success">{successMessage}</div>
          )}

          <div className="apply-actions">
            <Link to="/loan-types" className="secondary-btn">
              Back to Loan Types
            </Link>

            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Creating Application..." : "Create Application"}
            </button>
          </div>

          {applicationId && (
            <div className="continue-row">
              <Link to="/eligibility" className="primary-btn">
                Continue to Eligibility
              </Link>
            </div>
          )}
        </form>
      </section>
    </main>
  );
};

export default ApplyLoan;
