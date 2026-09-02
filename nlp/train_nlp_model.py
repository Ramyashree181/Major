import json
import os
import re
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report


# ============================================
# 1. LOAD TRAINING DATA
# ============================================

DATA_PATH = "data/intents.json"
MODEL_DIR = "models"

with open(DATA_PATH, "r", encoding="utf-8") as file:
    data = json.load(file)

texts = []
labels = []

for intent in data["intents"]:
    for pattern in intent["patterns"]:
        texts.append(pattern)
        labels.append(intent["tag"])

print("Dataset loaded successfully")
print("Total training examples:", len(texts))
print("Total intents:", len(set(labels)))


# ============================================
# 2. TEXT PREPROCESSING
# ============================================

def preprocess_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text


texts = [preprocess_text(text) for text in texts]


# ============================================
# 3. TRAIN / TEST SPLIT
# ============================================

X_train, X_test, y_train, y_test = train_test_split(
    texts,
    labels,
    test_size=0.20,
    random_state=42,
    stratify=labels
)


# ============================================
# 4. CREATE NLP MODEL
# ============================================

model = Pipeline([
    (
        "tfidf",
        TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words="english",
            sublinear_tf=True
        )
    ),
    (
        "classifier",
        LogisticRegression(
            max_iter=3000,
            class_weight="balanced",
            random_state=42
        )
    )
])


# ============================================
# 5. CROSS VALIDATION
# ============================================

print("\nRunning 5-fold cross-validation...")

scores = cross_val_score(
    model,
    texts,
    labels,
    cv=5,
    scoring="accuracy"
)

print(f"Cross-validation Accuracy: {scores.mean() * 100:.2f}%")


# ============================================
# 6. TRAIN MODEL
# ============================================

print("\nTraining model...")

model.fit(X_train, y_train)


# ============================================
# 7. EVALUATE MODEL
# ============================================

predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print("\nTest Set Evaluation")
print("-" * 40)
print(f"Accuracy: {accuracy * 100:.2f}%")

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)


# ============================================
# 8. TRAIN FINAL MODEL
# ============================================

print("\nTraining final model on complete dataset...")

model.fit(texts, labels)


# ============================================
# 9. SAVE MODEL
# ============================================

os.makedirs(MODEL_DIR, exist_ok=True)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "loan_chatbot_nlp_model.pkl"
)

joblib.dump(model, MODEL_PATH)

print("\nModel saved successfully:")
print(MODEL_PATH)

print("\nTraining completed successfully!")