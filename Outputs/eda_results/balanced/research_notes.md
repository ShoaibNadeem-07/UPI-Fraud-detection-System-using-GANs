# Research Notes: Balanced Fraud Dataset Analysis

This document outlines key findings from the EDA performed on `fraud_dataset_balanced.csv`.

## Dataset Overview
- **Total Records**: 20,000
- **Fraud Incidence**: 50.0% (10,000 cases)
- **Data Quality**: High (No null values)

## Key Fraud Predictors
1.  **Transaction Amount (Corr: 0.267)**: High transaction amounts are strongly associated with fraudulent activity in this balanced sample.
2.  **Past Fraudulent Behavior (Corr: 0.174)**: Users with previous flags are high-risk.
3.  **Recipient Blacklist Status (Corr: 0.141)**: Transactions to blacklisted accounts are a definitive risk marker.

## Other Observations
- **Negative Correlation - Geo-Location (-0.159)**: Unusual or high-risk locations are significant indicators.
- **Negative Correlation - Account Age (-0.135)**: Newer accounts have a higher statistical likelihood of fraud in this distribution.

## Recommendations
- **Preprocessing**: Scaling for `Transaction Amount` and encoding for `Geo-Location Flags` are essential.
- **Model Bias**: Since this dataset is balanced, traditional metrics like Accuracy are reliable, but F1-score should still be monitored.
