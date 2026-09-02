import random
import pandas as pd

# Number of training examples
NUM_SAMPLES = 20000

loan_types = [
    "Personal Loan",
    "Home Loan",
    "Education Loan",
    "Business Loan"
]

employment_types = [
    "Salaried",
    "Self-Employed",
    "Business",
    "Student",
    "Other"
]

repayment_histories = [
    "Excellent",
    "Good",
    "Average",
    "Poor"
]


def generate_record():
    loan_type = random.choice(loan_types)

    # Generate employment type
    employment_type = random.choice(employment_types)

    # Income range depends somewhat on employment type
    if employment_type == "Student":
        monthly_income = random.randint(0, 30000)
    elif employment_type == "Salaried":
        monthly_income = random.randint(15000, 200000)
    elif employment_type == "Self-Employed":
        monthly_income = random.randint(20000, 300000)
    elif employment_type == "Business":
        monthly_income = random.randint(25000, 500000)
    else:
        monthly_income = random.randint(10000, 100000)

    # Loan amount based on loan type
    if loan_type == "Personal Loan":
        requested_amount = random.randint(10000, 1000000)

    elif loan_type == "Home Loan":
        requested_amount = random.randint(500000, 10000000)

    elif loan_type == "Education Loan":
        requested_amount = random.randint(50000, 5000000)

    else:  # Business Loan
        requested_amount = random.randint(100000, 10000000)

    # Tenure
    if loan_type == "Personal Loan":
        tenure_months = random.randint(6, 84)

    elif loan_type == "Home Loan":
        tenure_months = random.randint(60, 360)

    elif loan_type == "Education Loan":
        tenure_months = random.randint(12, 180)

    else:
        tenure_months = random.randint(12, 120)

    # Credit-related information
    credit_score = random.randint(300, 900)
    credit_history_length = random.randint(0, 25)
    existing_loans = random.randint(0, 6)
    total_outstanding_amount = random.randint(
        0,
        max(50000, requested_amount)
    )
    credit_utilization = random.randint(0, 100)
    recent_credit_inquiries = random.randint(0, 10)
    repayment_history = random.choice(repayment_histories)

    # Derived features
    income_to_loan_ratio = (
        requested_amount / monthly_income
        if monthly_income > 0
        else requested_amount
    )

    debt_to_income_ratio = (
        total_outstanding_amount / monthly_income
        if monthly_income > 0
        else total_outstanding_amount
    )

    # Eligibility score used for controlled dataset labeling
    score = 0

    # Credit score
    if credit_score >= 750:
        score += 3
    elif credit_score >= 650:
        score += 2
    elif credit_score >= 550:
        score += 1
    else:
        score -= 3

    # Repayment history
    if repayment_history == "Excellent":
        score += 3
    elif repayment_history == "Good":
        score += 2
    elif repayment_history == "Average":
        score += 0
    else:
        score -= 3

    # Income-to-loan ratio
    if income_to_loan_ratio <= 20:
        score += 2
    elif income_to_loan_ratio <= 50:
        score += 1
    else:
        score -= 2

    # Debt-to-income ratio
    if debt_to_income_ratio <= 10:
        score += 2
    elif debt_to_income_ratio <= 30:
        score += 1
    else:
        score -= 2

    # Credit utilization
    if credit_utilization <= 30:
        score += 2
    elif credit_utilization <= 60:
        score += 1
    elif credit_utilization >= 85:
        score -= 2

    # Existing loans
    if existing_loans <= 1:
        score += 1
    elif existing_loans >= 4:
        score -= 2

    # Recent inquiries
    if recent_credit_inquiries >= 7:
        score -= 2

    # Basic loan-type conditions
    if loan_type == "Home Loan" and monthly_income < 30000:
        score -= 2

    if loan_type == "Business Loan" and employment_type == "Student":
        score -= 3

    if loan_type == "Education Loan" and employment_type not in [
        "Student",
        "Salaried"
    ]:
        score -= 1

    # Final label
    eligible = 1 if score >= 4 else 0

    return {
        "loanType": loan_type,
        "employmentType": employment_type,
        "monthlyIncome": monthly_income,
        "requestedAmount": requested_amount,
        "tenureMonths": tenure_months,
        "creditScore": credit_score,
        "creditHistoryLength": credit_history_length,
        "repaymentHistory": repayment_history,
        "existingLoans": existing_loans,
        "totalOutstandingAmount": total_outstanding_amount,
        "creditUtilization": credit_utilization,
        "recentCreditInquiries": recent_credit_inquiries,
        "incomeToLoanRatio": round(income_to_loan_ratio, 2),
        "debtToIncomeRatio": round(debt_to_income_ratio, 2),
        "eligible": eligible
    }


records = []

for _ in range(NUM_SAMPLES):
    records.append(generate_record())

df = pd.DataFrame(records)

# Shuffle the dataset
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

# Save CSV
output_path = "../data/loan_eligibility_dataset.csv"
df.to_csv(output_path, index=False)

print(f"Dataset created successfully: {output_path}")
print(f"Total records: {len(df)}")

print("\nEligibility distribution:")
print(df["eligible"].value_counts())

print("\nFirst 5 records:")
print(df.head())