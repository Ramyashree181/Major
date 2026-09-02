from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import re


# ============================================
# CREATE FLASK APP
# ============================================

app = Flask(__name__)
CORS(app)


# ============================================
# LOAD NLP MODEL
# ============================================

MODEL_PATH = os.path.join(
    "models",
    "loan_chatbot_nlp_model.pkl"
)

model = joblib.load(MODEL_PATH)

print("Loan NLP model loaded successfully")


# ============================================
# TEXT PREPROCESSING
# ============================================

def preprocess_text(text):

    text = text.lower()

    # Remove special characters
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text).strip()

    return text


# ============================================
# INTENT → WEBSITE ACTION
# ============================================

intent_actions = {
    "greeting": "SHOW_HOME",
    "loan_types": "SHOW_LOAN_TYPES",
    "loan_schemes": "SHOW_SCHEMES",
    "loan_information": "SHOW_LOAN_TYPES",
    "eligibility_check": "SHOW_ELIGIBILITY",
    "loan_amount": "SHOW_SCHEMES",
    "loan_tenure": "SHOW_SCHEMES",
    "interest_rate": "SHOW_SCHEMES",
    "required_documents": "SHOW_DOCUMENTS",
    "application_status": "SHOW_APPLICATION_STATUS",
    "account_holder_check": "CHECK_ACCOUNT_HOLDER",
    "apply_loan": "OPEN_APPLICATION_FORM",
    "goodbye": "END_CHAT",
    "fallback": "SHOW_HELP"
}


# ============================================
# PREDICT INTENT
# ============================================

def predict_intent(message, threshold=0.15):

    processed_message = preprocess_text(message)

    probabilities = model.predict_proba(
        [processed_message]
    )[0]

    predicted_index = probabilities.argmax()

    predicted_intent = model.classes_[predicted_index]

    confidence = float(
        probabilities[predicted_index]
    )

    # Low confidence → fallback
    if confidence < threshold:

        return {
            "intent": "fallback",
            "confidence": round(confidence, 4),
            "action": intent_actions["fallback"]
        }

    return {
        "intent": predicted_intent,
        "confidence": round(confidence, 4),
        "action": intent_actions[predicted_intent]
    }


# ============================================
# PREDICT API
# ============================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json()

        # Validate request
        if not data or "message" not in data:
            return jsonify({
                "message": "Message is required"
            }), 400

        message = data["message"]

        if not isinstance(message, str):
            return jsonify({
                "message": "Message must be a string"
            }), 400

        if not message.strip():
            return jsonify({
                "message": "Message cannot be empty"
            }), 400

        # NLP Prediction
        result = predict_intent(message)

        return jsonify({
            "message": "Intent predicted successfully",
            **result
        })

    except Exception as error:

        print("Prediction error:", error)

        return jsonify({
            "message": "Failed to predict intent"
        }), 500


# ============================================
# HEALTH CHECK
# ============================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "Loan Chatbot NLP API is running"
    })


# ============================================
# RUN SERVER
# ============================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5002,
        debug=True
    )