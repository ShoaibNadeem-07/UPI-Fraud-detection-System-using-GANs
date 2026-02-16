from flask import Flask, request, jsonify
from flask_cors import CORS
import xgboost as xgb
import shap
import os
import joblib
import pandas as pd
import numpy as np
from feature_aggregator import FeatureAggregator

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173",
    "http://localhost:3000",
    os.environ.get("FRONTEND_URL", "http://localhost:5173"),
])

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'models')
XGB_PATH = os.path.join(MODEL_DIR, 'xgboost_model.json')
NGB_PATH = os.path.join(MODEL_DIR, 'ngboost_model.pkl')

# Global variables
xgboost_model = None
ngboost_model = None
shap_explainer = None
aggregator = FeatureAggregator()

def load_models():
    global xgboost_model, ngboost_model, shap_explainer
    try:
        # Load XGBoost
        xgboost_model = xgb.XGBClassifier()
        xgboost_model.load_model(XGB_PATH)
        print("XGBoost model loaded.")
        
        # Create SHAP TreeExplainer
        shap_explainer = shap.TreeExplainer(xgboost_model)
        print("SHAP TreeExplainer initialized.")
    except Exception as e:
        print(f"Error loading XGBoost: {e}")

    try:
        # Load NGBoost (joblib)
        if os.path.exists(NGB_PATH):
            ngboost_model = joblib.load(NGB_PATH)
            print("NGBoost model loaded.")
        else:
            print("NGBoost model not found.")
    except Exception as e:
        print(f"Error loading NGBoost: {e}")

def get_shap_contributors(shap_values_row, feature_names, top_n=5):
    """Convert SHAP values for a single row into sorted contributor list."""
    contributors = []
    # Pair each feature with its SHAP value
    indexed = list(zip(feature_names, shap_values_row))
    # Sort by absolute impact, descending
    indexed.sort(key=lambda x: abs(x[1]), reverse=True)
    
    for feature, value in indexed[:top_n]:
        contributors.append({
            "feature": feature,
            "impact": round(float(value), 4),
            "direction": "increases" if value > 0 else "decreases"
        })
    return contributors

load_models()

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "active", "models": {
        "xgboost": xgboost_model is not None,
        "ngboost": ngboost_model is not None
    }}), 200

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No input data provided"}), 400
        
        mode = data.get('mode', 'dataset')
        
        if mode == 'upi':
            return predict_upi(data)
        else:
            return predict_dataset(data)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def predict_upi(data):
    """Handle UPI transaction prediction with recipient lookup."""
    sender_upi = data.get('sender_upi', '')
    recipient_upi = data.get('recipient_upi', '')
    amount = float(data.get('amount', 0))
    
    # Load UPI database
    upi_db_path = os.path.join(BASE_DIR, 'upi_database.json')
    recipient_info = None
    recipient_category = 'unknown'
    
    if os.path.exists(upi_db_path):
        import json
        with open(upi_db_path, 'r') as f:
            upi_db = json.load(f)
        
        # Search for recipient in all categories
        for category in ['verified', 'recently_registered']:
            for merchant in upi_db.get('merchants', {}).get(category, []):
                if merchant['upi_id'] == recipient_upi:
                    recipient_info = merchant
                    recipient_category = category
                    break
        
        if not recipient_info:
            for category in ['trusted', 'new_users']:
                for person in upi_db.get('individuals', {}).get(category, []):
                    if person['upi_id'] == recipient_upi:
                        recipient_info = person
                        recipient_category = category
                        break
        
        if not recipient_info:
            for category in ['phishing_ids', 'blacklisted', 'high_risk']:
                for suspect in upi_db.get('suspicious', {}).get(category, []):
                    if suspect['upi_id'] == recipient_upi:
                        recipient_info = suspect
                        recipient_category = category
                        break
    
    # Build model features from UPI context
    # Map recipient info to the 20 training features
    verification_status = 'verified'
    blacklist_status = 0
    device_fingerprinting = 0
    vpn_usage = 0
    geo_flags = 'normal'
    trust_score = 50
    account_age = 2.5  # Default mid-range
    fraud_flags = 0
    complaints = 0
    merchant_mismatch = 0
    limit_exceeded = 0
    high_value_flags = 0
    high_risk_times = 0
    location_inconsistent = 0
    
    if recipient_info:
        if recipient_category == 'verified':
            verification_status = 'verified'
            trust_score = 85
            account_age = 4.0
            complaints = recipient_info.get('complaints', 0)
        elif recipient_category == 'recently_registered':
            verification_status = 'recently_registered'
            trust_score = 40
            account_age = min(recipient_info.get('account_age_days', 30) / 365.0, 5.0)
            complaints = recipient_info.get('complaints', 0)
        elif recipient_category == 'trusted':
            verification_status = 'verified'
            trust_score = recipient_info.get('trust_score', 80)
            account_age = min(recipient_info.get('account_age_days', 500) / 365.0, 5.0)
            fraud_flags = recipient_info.get('fraud_flags', 0)
        elif recipient_category == 'new_users':
            verification_status = 'recently_registered'
            trust_score = recipient_info.get('trust_score', 40)
            account_age = min(recipient_info.get('account_age_days', 7) / 365.0, 5.0)
        elif recipient_category in ['phishing_ids', 'blacklisted', 'high_risk']:
            verification_status = 'suspicious'
            blacklist_status = 1 if recipient_category == 'blacklisted' else 0
            trust_score = max(5, 100 - recipient_info.get('risk_score', 0.9) * 100)
            account_age = 0.1
            complaints = recipient_info.get('complaints', 10)
            fraud_flags = 1 if recipient_info.get('fraud_count', 0) > 0 else 0
            geo_flags = 'high-risk'
            location_inconsistent = 1
    else:
        # Unknown recipient — treat as moderately risky
        verification_status = 'recently_registered'
        trust_score = 30
        account_age = 0.5
    
    # Amount-based signals
    normalized_amount = amount / 1000.0  # Rough normalization
    if amount > 10000:
        high_value_flags = 1
    if amount > 50000:
        limit_exceeded = 1
        
    # Build feature dict matching training columns
    feature_dict = {
        'Transaction Amount': amount,
        'Transaction Frequency': 3,  # Default
        'Recipient Verification Status': verification_status,
        'Recipient Blacklist Status': blacklist_status,
        'Device Fingerprinting': device_fingerprinting,
        'VPN or Proxy Usage': vpn_usage,
        'Geo-Location Flags': geo_flags,
        'Behavioral Biometrics': 0.5,  # Default
        'Time Since Last Transaction': 15,  # Default
        'Social Trust Score': trust_score,
        'Account Age': account_age,
        'High-Risk Transaction Times': high_risk_times,
        'Past Fraudulent Behavior Flags': fraud_flags,
        'Location-Inconsistent Transactions': location_inconsistent,
        'Normalized Transaction Amount': min(normalized_amount, 5.0),
        'Transaction Context Anomalies': min(complaints / 10.0, 3.0),
        'Fraud Complaints Count': min(complaints, 6),
        'Merchant Category Mismatch': merchant_mismatch,
        'User Daily Limit Exceeded': limit_exceeded,
        'Recent High-Value Transaction Flags': high_value_flags
    }
    
    features = aggregator.preprocess(feature_dict)
    feature_names = aggregator.feature_names or [f'Feature_{i}' for i in range(features.shape[1])]
    
    # Predict
    if xgboost_model:
        prob = float(xgboost_model.predict_proba(features)[:, 1][0])
    elif ngboost_model:
        prob = float(ngboost_model.predict_proba(features)[:, 1][0])
    else:
        return jsonify({"error": "No models loaded"}), 500
    
    # Rule-based score boosting for known bad actors
    # The ML model was trained on subtle statistical patterns, not UPI context.
    # We boost the score for recipients flagged in our database.
    if recipient_info:
        if recipient_category == 'blacklisted':
            prob = max(prob, 0.95)
        elif recipient_category == 'phishing_ids':
            prob = max(prob, 0.88)
        elif recipient_category == 'high_risk':
            risk_boost = recipient_info.get('risk_score', 0.5)
            prob = max(prob, risk_boost)
        elif recipient_category == 'recently_registered':
            # Slight boost for new/unverified merchants
            prob = max(prob, prob + 0.1)
    
    risk_level = "HIGH" if prob >= 0.75 else "MEDIUM" if prob >= 0.45 else "LOW"
    status = "BLOCKED" if risk_level == "HIGH" else "VERIFY" if risk_level == "MEDIUM" else "ALLOWED"
    
    # SHAP
    shap_contributors = []
    if shap_explainer:
        shap_vals = shap_explainer.shap_values(features)
        shap_contributors = get_shap_contributors(shap_vals[0], feature_names)
    
    # Build explanation
    if recipient_info and recipient_category in ['phishing_ids', 'blacklisted']:
        explanation = f"Recipient '{recipient_upi}' is flagged as {recipient_info.get('fraud_type', 'suspicious')}. {recipient_info.get('complaints', 0)} complaints reported."
    elif recipient_info and recipient_category == 'high_risk':
        explanation = f"Recipient has elevated risk ({recipient_info.get('fraud_type', 'unknown')}). Exercise caution."
    elif prob >= 0.75:
        top_feat = shap_contributors[0]['feature'] if shap_contributors else 'multiple factors'
        explanation = f"High fraud probability detected. Primary factor: {top_feat}."
    elif prob >= 0.45:
        explanation = "Moderate risk detected. Additional verification recommended."
    else:
        explanation = "Transaction appears safe based on recipient profile and amount."
    
    return jsonify({
        "fraud_score": prob,
        "risk_level": risk_level,
        "status": status,
        "prediction": 1 if prob > 0.5 else 0,
        "explanation": explanation,
        "shap_contributors": shap_contributors,
        "recipient_info": {
            "name": recipient_info.get('name', 'Unknown') if recipient_info else 'Unknown',
            "category": recipient_category
        }
    }), 200

def predict_dataset(data):
    """Handle raw feature prediction (dataset mode)."""
    features = aggregator.preprocess(data)
    feature_names = aggregator.feature_names or [f'Feature_{i}' for i in range(features.shape[1])]
    
    response = {}
    
    if xgboost_model:
        prob_xgb = xgboost_model.predict_proba(features)[:, 1][0]
        response['xgboost'] = {
            'fraud_probability': float(prob_xgb),
            'is_fraud': bool(int(prob_xgb > 0.5))
        }
        
    if ngboost_model:
        prob_ngb = ngboost_model.predict_proba(features)[:, 1][0]
        response['ngboost'] = {
            'fraud_probability': float(prob_ngb),
            'is_fraud': bool(int(prob_ngb > 0.5))
        }
        
    if 'xgboost' in response:
        final_score = response['xgboost']['fraud_probability']
    elif 'ngboost' in response:
        final_score = response['ngboost']['fraud_probability']
    else:
        return jsonify({"error": "Models not loaded"}), 500
        
    response['final_risk_score'] = final_score
    response['risk_level'] = "HIGH" if final_score >= 0.85 else "MEDIUM" if final_score >= 0.60 else "LOW"
    
    if shap_explainer:
        shap_values = shap_explainer.shap_values(features)
        response['shap_contributors'] = get_shap_contributors(shap_values[0], feature_names)
    else:
        response['shap_contributors'] = []
    
    return jsonify(response), 200

@app.route('/analyze-dataset', methods=['POST'])
def analyze_dataset():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    try:
        df = pd.read_csv(file)
        
        # Preprocess
        # We might need to drop 'Label' if it exists in the uploaded file
        if 'Label' in df.columns:
            df_for_pred = df.drop('Label', axis=1)
        else:
            df_for_pred = df.copy()
            
        features = aggregator.preprocess(df_for_pred)
        feature_names = aggregator.feature_names or [f'Feature_{i}' for i in range(features.shape[1])]
        
        # Batch Prediction
        probs_xgb = np.zeros(len(df))
        probs_ngb = np.zeros(len(df))
        
        if xgboost_model:
            probs_xgb = xgboost_model.predict_proba(features)[:, 1]
            
        if ngboost_model:
            probs_ngb = ngboost_model.predict_proba(features)[:, 1]
        
        # Compute SHAP values for all rows at once (efficient batch)
        shap_values_all = None
        if shap_explainer and xgboost_model:
            shap_values_all = shap_explainer.shap_values(features)
            
        results = []
        fraud_count = 0
        high_risk = 0
        medium_risk = 0
        low_risk = 0
        
        for i in range(len(df)):
            row_result = df.iloc[i].to_dict()
            
            # Decision Logic (Prioritize XGBoost)
            final_score = probs_xgb[i] if xgboost_model else probs_ngb[i]
            
            risk_level = "HIGH" if final_score >= 0.85 else "MEDIUM" if final_score >= 0.60 else "LOW"
            
            if final_score > 0.5:
                fraud_count += 1
                
            if risk_level == "HIGH":
                high_risk += 1
            elif risk_level == "MEDIUM":
                medium_risk += 1
            else:
                low_risk += 1
            
            row_result['fraud_probability'] = float(final_score)
            row_result['is_fraud'] = bool(final_score > 0.5)
            row_result['prediction'] = 1 if final_score > 0.5 else 0
            row_result['fraud_score'] = float(final_score)
            row_result['risk_level'] = risk_level
            row_result['row_index'] = i
            
            # SHAP Explanations
            if shap_values_all is not None:
                contributors = get_shap_contributors(shap_values_all[i], feature_names)
                row_result['shap_contributors'] = contributors
                # Generate human-readable explanation from top contributors
                top = contributors[0] if contributors else None
                if top:
                    direction_text = 'increasing' if top['direction'] == 'increases' else 'decreasing'
                    row_result['explanation'] = f"Top factor: {top['feature']} ({direction_text} fraud risk by {abs(top['impact']):.3f})"
                else:
                    row_result['explanation'] = 'Analysis complete'
            else:
                row_result['shap_contributors'] = []
                row_result['explanation'] = 'Analysis complete'
            
            results.append(row_result)
            
        response_data = {
            "summary": {
                "total_rows": len(df),
                "fraud_count": fraud_count,
                "non_fraud_count": len(df) - fraud_count,
                "high_risk_count": high_risk,
                "medium_risk_count": medium_risk,
                "low_risk_count": low_risk
            },
            "results": results
        }
            
        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
