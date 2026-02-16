import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os

# Configuration
DATA_PATH = r'c:\Users\shoai\Desktop\alternate 4\fraud_dataset_balanced.csv'
MODEL_DIR = r'c:\Users\shoai\Desktop\alternate 4\AI_model_server_Flask\models'
MODEL_PATH = os.path.join(MODEL_DIR, 'xgboost_model.json')
REPORT_PATH = r'c:\Users\shoai\Desktop\alternate 4\xgboost_report.txt'

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
    
    label_encoders = {}
    print("Encoding categorical features...")
    for col in X.select_dtypes(include=['object']).columns:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
        label_encoders[col] = le
        print(f"Encoded {col}")
        
    # Save Label Encoders for Inference
    encoders_path = os.path.join(MODEL_DIR, 'label_encoders.pkl')
    joblib.dump(label_encoders, encoders_path)
    print(f"Saved label encoders to {encoders_path}")

    # Save Feature Names for Inference (CRITICAL for column ordering)
    feature_names = X.columns.tolist()
    features_path = os.path.join(MODEL_DIR, 'feature_names.pkl')
    joblib.dump(feature_names, features_path)
    print(f"Saved feature names to {features_path}")
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train
    print("Training XGBoost...")
    # Using typical params, tuning max_depth or n_estimators can adjust accuracy
    model = xgb.XGBClassifier(
        objective='binary:logistic',
        n_estimators=200,
        learning_rate=0.05,
        max_depth=5,
        use_label_encoder=False,
        eval_metric='logloss'
    )
    
    model.fit(X_train, y_train)
    
    # Predict
    y_pred = model.predict(X_test)
    
    # Evaluate
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)
    
    print(f"Accuracy: {acc * 100:.2f}%")
    print("Classification Report:")
    print(report)
    
    # Save Report
    with open(REPORT_PATH, 'w') as f:
        f.write(f"XGBoost Accuracy: {acc * 100:.2f}%\n")
        f.write("\nClassification Report:\n")
        f.write(report)
        f.write("\nConfusion Matrix:\n")
        f.write(str(cm))
        
    print(f"Saved report to {REPORT_PATH}")
    
    # Save Model
    model.save_model(MODEL_PATH)
    print(f"Saved model to {MODEL_PATH}")

if __name__ == "__main__":
    train_model()
