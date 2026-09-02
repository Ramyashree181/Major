import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix


# 1. Load dataset
data_path = "../data/loan_eligibility_dataset.csv"

df = pd.read_csv(data_path)

print("Dataset loaded successfully")
print("Total records:", len(df))


# 2. Separate input features and target
X = df.drop("eligible", axis=1)
y = df["eligible"]


# 3. Define categorical columns
categorical_features = [
    "loanType",
    "employmentType",
    "repaymentHistory"
]


# 4. Define numerical columns
numerical_features = [
    "monthlyIncome",
    "requestedAmount",
    "tenureMonths",
    "creditScore",
    "creditHistoryLength",
    "existingLoans",
    "totalOutstandingAmount",
    "creditUtilization",
    "recentCreditInquiries",
    "incomeToLoanRatio",
    "debtToIncomeRatio"
]


# 5. Convert categorical values into numbers
preprocessor = ColumnTransformer(
    transformers=[
        (
            "cat",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        ),
        (
            "num",
            "passthrough",
            numerical_features
        )
    ]
)


# 6. Create the model
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    min_samples_split=5,
    random_state=42
)


# 7. Combine preprocessing and model
pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ]
)


# 8. Split data into training and testing data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# 9. Train the model
print("\nTraining model...")

pipeline.fit(X_train, y_train)


# 10. Make predictions
y_pred = pipeline.predict(X_test)


# 11. Evaluate model
accuracy = accuracy_score(y_test, y_pred)

print("\nModel Evaluation")
print("----------------")
print("Accuracy:", round(accuracy * 100, 2), "%")

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred,
        target_names=["NOT_ELIGIBLE", "ELIGIBLE"]
    )
)

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))


# 12. Save the complete pipeline
model_path = "../models/loan_eligibility_model.pkl"

joblib.dump(pipeline, model_path)

print(f"\nModel saved successfully: {model_path}")