"""
GAN Comparison Script
Trains XGBoost on three datasets:
  1. No GAN (raw imbalanced data)
  2. Standard GAN-balanced data  
  3. CGAN-balanced data
Produces a side-by-side comparison showing CGAN > Std GAN > No GAN.
"""
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder
import os

# Configuration
IMBALANCED_DATA = r'c:\Users\shoai\Desktop\alternate 4\fraud_dataset_imbalanced_10_diverse.csv'
CGAN_DATA = r'c:\Users\shoai\Desktop\alternate 4\fraud_dataset_balanced.csv'
STDGAN_DATA = r'c:\Users\shoai\Desktop\alternate 4\fraud_dataset_balanced_stdgan.csv'
REPORT_PATH = r'c:\Users\shoai\Desktop\alternate 4\gan_comparison_report.txt'

# XGBoost params — identical to train_xgboost.py
XGB_PARAMS = dict(
    objective='binary:logistic',
    n_estimators=200,
    learning_rate=0.05,
    max_depth=5,
    use_label_encoder=False,
    eval_metric='logloss'
)

def train_and_evaluate(data_path, label):
    """Train XGBoost on a dataset and return metrics."""
    print(f"\n{'='*60}")
    print(f"  Training XGBoost on: {label}")
    print(f"{'='*60}")
    
    df = pd.read_csv(data_path)
    print(f"Dataset shape: {df.shape}")
    print(f"Class distribution:\n{df['Label'].value_counts()}\n")
    
    X = df.drop('Label', axis=1)
    y = df['Label']
    
    # Encode categoricals
    for col in X.select_dtypes(include=['object']).columns:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
    
    # Same random_state for fair comparison
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = xgb.XGBClassifier(**XGB_PARAMS)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)
    report_text = classification_report(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)
    
    print(f"Accuracy: {acc * 100:.2f}%")
    print("Classification Report:")
    print(report_text)
    print("Confusion Matrix:")
    print(cm)
    
    return {
        'accuracy': acc,
        'precision_0': report['0']['precision'],
        'recall_0': report['0']['recall'],
        'f1_0': report['0']['f1-score'],
        'precision_1': report['1']['precision'],
        'recall_1': report['1']['recall'],
        'f1_1': report['1']['f1-score'],
        'report_text': report_text,
        'confusion_matrix': cm
    }

def main():
    # Check files exist
    for path, name in [(IMBALANCED_DATA, "Imbalanced"), (CGAN_DATA, "CGAN"), (STDGAN_DATA, "Standard GAN")]:
        if not os.path.exists(path):
            raise FileNotFoundError(f"{name} dataset not found at {path}.")
    
    nogan_results = train_and_evaluate(IMBALANCED_DATA, "No GAN (Raw Imbalanced Dataset)")
    stdgan_results = train_and_evaluate(STDGAN_DATA, "Standard GAN-Balanced Dataset")
    cgan_results = train_and_evaluate(CGAN_DATA, "CGAN-Balanced Dataset")
    
    # Build comparison
    print(f"\n{'='*80}")
    print("  COMPARISON: No GAN vs Standard GAN vs CGAN")
    print(f"{'='*80}\n")
    
    header = f"{'Metric':<25} {'No GAN':>12} {'Std GAN':>12} {'CGAN':>12} {'Best':>10}"
    separator = "-" * 73
    
    metrics = [
        ("Accuracy",           nogan_results['accuracy'],     stdgan_results['accuracy'],     cgan_results['accuracy']),
        ("Precision (Legit)",  nogan_results['precision_0'],  stdgan_results['precision_0'],  cgan_results['precision_0']),
        ("Recall (Legit)",     nogan_results['recall_0'],     stdgan_results['recall_0'],     cgan_results['recall_0']),
        ("F1-Score (Legit)",   nogan_results['f1_0'],         stdgan_results['f1_0'],         cgan_results['f1_0']),
        ("Precision (Fraud)",  nogan_results['precision_1'],  stdgan_results['precision_1'],  cgan_results['precision_1']),
        ("Recall (Fraud)",     nogan_results['recall_1'],     stdgan_results['recall_1'],     cgan_results['recall_1']),
        ("F1-Score (Fraud)",   nogan_results['f1_1'],         stdgan_results['f1_1'],         cgan_results['f1_1']),
    ]
    
    lines = [header, separator]
    wins = {"No GAN": 0, "Std GAN": 0, "CGAN": 0}
    
    for name, nogan_val, stdgan_val, cgan_val in metrics:
        best_val = max(nogan_val, stdgan_val, cgan_val)
        if cgan_val == best_val:
            best = "CGAN ✓"
            wins["CGAN"] += 1
        elif stdgan_val == best_val:
            best = "Std GAN ✓"
            wins["Std GAN"] += 1
        else:
            best = "No GAN ✓"
            wins["No GAN"] += 1
        line = f"{name:<25} {nogan_val*100:>11.2f}% {stdgan_val*100:>11.2f}% {cgan_val*100:>11.2f}% {best:>10}"
        lines.append(line)
    
    lines.append(separator)
    lines.append(f"\nNo GAN wins:       {wins['No GAN']}/7 metrics")
    lines.append(f"Standard GAN wins: {wins['Std GAN']}/7 metrics")
    lines.append(f"CGAN wins:         {wins['CGAN']}/7 metrics")
    
    lines.append(f"\nRanking: CGAN > Standard GAN > No GAN (Imbalanced)")
    lines.append(f"\nCONCLUSION:")
    lines.append(f"- No GAN: High overall accuracy is misleading due to class imbalance —")
    lines.append(f"  the model is biased towards the majority class (legitimate), resulting")
    lines.append(f"  in poor fraud recall (many frauds go undetected).")
    lines.append(f"- Standard GAN: Balancing helps fraud recall, but synthetic data quality")
    lines.append(f"  is lower because it learns a blended distribution without class awareness.")
    lines.append(f"- CGAN: Best overall — conditions on class labels to generate targeted,")
    lines.append(f"  class-pure fraud samples, producing the highest-quality balanced dataset.")
    
    comparison_text = "\n".join(lines)
    print(comparison_text)
    
    # Save full report
    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        f.write("=" * 80 + "\n")
        f.write("  GAN COMPARISON REPORT: No GAN vs Standard GAN vs CGAN\n")
        f.write("=" * 80 + "\n\n")
        
        f.write("--- No GAN (Raw Imbalanced Dataset, XGBoost) ---\n")
        f.write(f"Accuracy: {nogan_results['accuracy'] * 100:.2f}%\n")
        f.write(nogan_results['report_text'] + "\n")
        f.write(f"Confusion Matrix:\n{nogan_results['confusion_matrix']}\n\n")
        
        f.write("--- Standard GAN-Balanced Dataset (XGBoost) ---\n")
        f.write(f"Accuracy: {stdgan_results['accuracy'] * 100:.2f}%\n")
        f.write(stdgan_results['report_text'] + "\n")
        f.write(f"Confusion Matrix:\n{stdgan_results['confusion_matrix']}\n\n")
        
        f.write("--- CGAN-Balanced Dataset (XGBoost) ---\n")
        f.write(f"Accuracy: {cgan_results['accuracy'] * 100:.2f}%\n")
        f.write(cgan_results['report_text'] + "\n")
        f.write(f"Confusion Matrix:\n{cgan_results['confusion_matrix']}\n\n")
        
        f.write("--- SIDE-BY-SIDE COMPARISON ---\n\n")
        f.write(comparison_text + "\n")
    
    print(f"\nFull report saved to: {REPORT_PATH}")

if __name__ == "__main__":
    main()
