from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os
from pathlib import Path

app = Flask(__name__)

# Load the trained model
MODEL_PATH = Path(__file__).resolve().parent / "models" / "loan_eligibility_model.pkl"
model = joblib.load(MODEL_PATH)


@app.route("/predict", methods=["POST"])
def predict():

    try:
        data = request.get_json()

        # Required fields expected by the trained model
        required_fields = [
            "loanType",
            "employmentType",
            "monthlyIncome",
            "requestedAmount",
            "tenureMonths",
            "creditScore",
            "creditHistoryLength",
            "repaymentHistory",
            "existingLoans",
            "totalOutstandingAmount",
            "creditUtilization",
            "recentCreditInquiries"
        ]

        # Check for missing fields
        missing_fields = [
            field for field in required_fields
            if field not in data
        ]

        if missing_fields:
            return jsonify({
                "message": "Missing required fields",
                "missingFields": missing_fields
            }), 400

        # Calculate the same derived features
        # that were used while training
        monthly_income = data["monthlyIncome"]
        requested_amount = data["requestedAmount"]
        outstanding_amount = data["totalOutstandingAmount"]

        income_to_loan_ratio = (
            requested_amount / monthly_income
            if monthly_income > 0
            else requested_amount
        )

        debt_to_income_ratio = (
            outstanding_amount / monthly_income
            if monthly_income > 0
            else outstanding_amount
        )

        # Create model input
        input_data = {
            "loanType": data["loanType"],
            "employmentType": data["employmentType"],
            "monthlyIncome": monthly_income,
            "requestedAmount": requested_amount,
            "tenureMonths": data["tenureMonths"],
            "creditScore": data["creditScore"],
            "creditHistoryLength": data["creditHistoryLength"],
            "repaymentHistory": data["repaymentHistory"],
            "existingLoans": data["existingLoans"],
            "totalOutstandingAmount": outstanding_amount,
            "creditUtilization": data["creditUtilization"],
            "recentCreditInquiries": data["recentCreditInquiries"],
            "incomeToLoanRatio": round(income_to_loan_ratio, 2),
            "debtToIncomeRatio": round(debt_to_income_ratio, 2)
        }

        # Convert to DataFrame
        input_df = pd.DataFrame([input_data])

        # Prediction
        prediction = model.predict(input_df)[0]

        # Prediction probabilities
        probabilities = model.predict_proba(input_df)[0]

        confidence = float(max(probabilities))

        result = (
            "ELIGIBLE"
            if int(prediction) == 1
            else "NOT_ELIGIBLE"
        )

        return jsonify({
            "prediction": result,
            "confidence": round(confidence, 4)
        })

    except Exception as error:
        return jsonify({
            "message": "Prediction failed",
            "error": str(error)
        }), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "message": "ML prediction service is running"
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "5001")),
        debug=False
    )