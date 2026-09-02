import joblib
import re
import os


# ============================================
# LOAD TRAINED MODEL
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
# PREDICT INTENT
# ============================================

def predict_intent(message, threshold=0.15):

    processed_message = preprocess_text(message)

    # Get probabilities for all intents
    probabilities = model.predict_proba(
        [processed_message]
    )[0]

    # Find highest probability
    max_probability = max(probabilities)

    # Get index of highest probability
    predicted_index = probabilities.argmax()

    # Get intent name
    predicted_intent = model.classes_[predicted_index]

    # Confidence
    confidence = float(max_probability)

    # Low confidence = fallback
    if confidence < threshold:

        return {
            "intent": "fallback",
            "confidence": round(confidence, 4)
        }

    return {
        "intent": predicted_intent,
        "confidence": round(confidence, 4)
    }


# ============================================
# TEST CHATBOT
# ============================================

if __name__ == "__main__":

    print("\nLoan Chatbot NLP Test")
    print("-" * 40)

    while True:

        message = input("\nYou: ")

        if message.lower() == "quit":
            break

        result = predict_intent(message)

        print("Intent:", result["intent"])
        print("Confidence:", result["confidence"])