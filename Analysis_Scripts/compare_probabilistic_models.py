import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score, f1_score, log_loss, precision_score, recall_score
import joblib
import os
import warnings

warnings.filterwarnings('ignore')

# Configuration
BASE_DIR = r"c:\Users\shoai\OneDrive\Desktop\Mini project\SafePay-AI"
DATA_PATH = os.path.join(BASE_DIR, "fraud_dataset_balanced.csv")
MODEL_PATH = os.path.join(BASE_DIR, "AI_model_server_Flask", "models", "ngboost_model.pkl")
OUTPUT_DIR = os.path.join(BASE_DIR, "comparison_charts")

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def main():
    print(f"Loading dataset from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    
    X = df.drop('Label', axis=1)
    y = df['Label']
    
    print("Preprocessing data...")
    for col in X.select_dtypes(include=['object']).columns:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
        
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 1. Train Naive Bayes
    print("Training Naive Bayes (GaussianNB)...")
    nb_model = GaussianNB()
    nb_model.fit(X_train, y_train)
    
    nb_preds = nb_model.predict(X_test)
    nb_probs = nb_model.predict_proba(X_test)[:, 1]
    
    # 2. Load NGBoost
    print(f"Loading NGBoost model from: {MODEL_PATH}")
    ngb_model = joblib.load(MODEL_PATH)
    
    print("Evaluating NGBoost...")
    ngb_preds = ngb_model.predict(X_test)
    # NGBoost predict_proba outputs probabilities since it uses Bernoulli distribution
    ngb_probs = ngb_model.predict_proba(X_test)[:, 1]
    
    # 3. Calculate Metrics
    models = ['Gaussian Naive Bayes', 'NGBoost']
    
    acc = [accuracy_score(y_test, nb_preds), accuracy_score(y_test, ngb_preds)]
    f1 = [f1_score(y_test, nb_preds), f1_score(y_test, ngb_preds)]
    prec = [precision_score(y_test, nb_preds), precision_score(y_test, ngb_preds)]
    rec = [recall_score(y_test, nb_preds), precision_score(y_test, ngb_preds)] # Oops, fixing recall
    rec[1] = recall_score(y_test, ngb_preds)
    
    # Log loss (lower is better, measures probabilistic calibration)
    ll = [log_loss(y_test, nb_probs), log_loss(y_test, ngb_probs)]
    
    print("\n--- Performance Metrics ---")
    print(f"Naive Bayes -> Accuracy: {acc[0]:.4f}, F1: {f1[0]:.4f}, Log-Loss: {ll[0]:.4f}")
    print(f"NGBoost     -> Accuracy: {acc[1]:.4f}, F1: {f1[1]:.4f}, Log-Loss: {ll[1]:.4f}")
    
    # 4. Generate Charts
    print("Generating charts...")
    
    # Chart 1: Performance Bar Chart (Accuracy, F1, Precision, Recall)
    fig, ax = plt.subplots(figsize=(10, 6))
    x = np.arange(len(models))
    width = 0.2
    
    rects1 = ax.bar(x - 1.5*width, acc, width, label='Accuracy', color='#4CAF50')
    rects2 = ax.bar(x - 0.5*width, f1, width, label='F1-Score', color='#2196F3')
    rects3 = ax.bar(x + 0.5*width, prec, width, label='Precision', color='#FFC107')
    rects4 = ax.bar(x + 1.5*width, rec, width, label='Recall', color='#9C27B0')
    
    ax.set_ylabel('Score')
    ax.set_title('Performance Metrics Comparison: Naive Bayes vs NGBoost')
    ax.set_xticks(x)
    ax.set_xticklabels(models, fontweight='bold')
    ax.legend(loc='lower center', bbox_to_anchor=(0.5, -0.2), ncol=4)
    ax.set_ylim(0, 1.15)
    
    def autolabel(rects):
        for rect in rects:
            height = rect.get_height()
            ax.annotate(f'{height:.2f}',
                        xy=(rect.get_x() + rect.get_width() / 2, height),
                        xytext=(0, 3), 
                        textcoords="offset points",
                        ha='center', va='bottom', fontsize=9)
                        
    autolabel(rects1)
    autolabel(rects2)
    autolabel(rects3)
    autolabel(rects4)
    
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "nb_vs_ngb_performance.png"), dpi=150)
    plt.close()
    
    # Chart 2: Probabilistic Quality (Log-Loss)
    fig, ax = plt.subplots(figsize=(7, 5))
    rects_ll = ax.bar(models, ll, width=0.5, color=['#EF5350', '#66BB6A'])
    ax.set_ylabel('Log-Loss (Lower is Better)')
    ax.set_title('Probabilistic Calibration (Log-Loss)')
    
    for rect in rects_ll:
        height = rect.get_height()
        ax.annotate(f'{height:.3f}',
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3), 
                    textcoords="offset points",
                    ha='center', va='bottom', fontweight='bold')
                    
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "nb_vs_ngb_logloss.png"), dpi=150)
    plt.close()
    
    print(f"Charts successfully generated in: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
