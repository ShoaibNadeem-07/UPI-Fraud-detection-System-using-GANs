# Research Notes: Imbalanced Fraud Dataset Analysis

This document outlines key findings from the EDA performed on `fraud_dataset_imbalanced_10_diverse.csv`.

## Dataset Overview
- **Total Records**: 11,000
- **Fraud Incidence**: ~9.1% (1,000 cases)
- **Distribution Type**: High imbalance (common in real-world fraud detection).

## Key Fraud Predictors
1.  **Past Fraudulent Behavior (Corr: 0.130)**: Even in an imbalanced set, user history remains a robust predictor.
2.  **Recipient Blacklist Status (Corr: 0.119)**: Very reliable indicator regardless of class distribution.
3.  **Transaction Amount (Corr: 0.114)**: Still positive, but notably weaker signal than in the balanced dataset.

## Other Observations
- **Geo-Location Resilience (Corr: -0.157)**: This feature is remarkably consistent across both datasets, making it a critical feature for the ML pipeline.
- **Account Age (Corr: 0.010)**: The relationship with account age becomes statistically negligible in this imbalanced sample.

## Recommendations
- **Sampling Strategy**: Use oversampling (SMOTE) or data generation (GANs) to address the class imbalance before training models.
- **Evaluation Metrics**: **Do not use Accuracy.** Precision-Recall curves and F1-score are the only reliable metrics for this dataset distribution.
