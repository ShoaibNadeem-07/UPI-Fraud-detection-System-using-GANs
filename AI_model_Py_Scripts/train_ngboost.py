import pandas as pd
import numpy as np
from ngboost import NGBClassifier
from ngboost.distns import Bernoulli
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os

# Configuration
DATA_PATH = r'c:\Users\shoai\Desktop\alternate 4\fraud_dataset_balanced.csv'
MODEL_DIR = r'c:\Users\shoai\Desktop\alternate 4\AI_model_server_Flask\models'
MODEL_PATH = os.path.join(MODEL_DIR, 'ngboost_model.pkl')
REPORT_PATH = r'c:\Users\shoai\Desktop\alternate 4\ngboost_report.txt'

if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

from sklearn.preprocessing import LabelEncoder

def train_model():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Balanced dataset not found at {DATA_PATH}")
        
    print("Loading balanced dataset...")
    df = pd.read_csv(DATA_PATH)
    
    # Preprocessing: Label Encoding for Categorical Variables
    X = df.drop('Label', axis=1)
    y = df['Label']
    
    print("Encoding categorical features...")
    for col in X.select_dtypes(include=['object']).columns:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
        print(f"Encoded {col}")
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train
    print("Training NGBoost...")
    # NGBClassifier parameters tuned for reasonable performance/speed
    ngb = NGBClassifier(
        Dist=Bernoulli, 
        n_estimators=100,  # Reduced from default 500 for speed in restoration
        learning_rate=0.01,
        verbose=True,
        verbose_eval=10
    )
    
    ngb.fit(X_train, y_train)
    
    # Predict
    y_pred = ngb.predict(X_test)
    
    # Evaluate
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)
    
    print(f"Accuracy: {acc * 100:.2f}%")
    print("Classification Report:")
    print(report)
    
    # Save Report
    with open(REPORT_PATH, 'w') as f:
        f.write(f"NGBoost Accuracy: {acc * 100:.2f}%\n")
        f.write("\nClassification Report:\n")
        f.write(report)
        f.write("\nConfusion Matrix:\n")
        f.write(str(cm))
        
    print(f"Saved report to {REPORT_PATH}")
    
    # Save Model
    joblib.dump(ngb, MODEL_PATH)
    print(f"Saved model to {MODEL_PATH}")

if __name__ == "__main__":
    train_model()
