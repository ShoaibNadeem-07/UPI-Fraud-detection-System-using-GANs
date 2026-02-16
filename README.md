# SafePayAI - Real-Time UPI Fraud Detection System

A full-stack fintech application for real-time UPI fraud detection using ML models with SHAP explainability.

## 🚀 Features

- **Dataset Fraud Analyzer** - Upload CSV datasets for batch fraud analysis with SHAP explanations
- **UPI Transaction Simulator** - Simulate real UPI payments with instant fraud risk assessment
- **XGBoost + NGBoost** - Dual ML models for accurate fraud detection (82-85% accuracy)
- **SHAP Explainability** - Transparent AI decisions with feature contribution visualization
- **Firebase Authentication** - Secure Google sign-in for user management

## 📁 Project Structure

```
Alternate two/
├── AI_model_server_Flask/     # Flask Backend
│   ├── app.py                 # Main API server
│   ├── feature_aggregator.py  # Feature engineering
│   ├── models/                # Trained ML models
│   └── requirements.txt       # Python dependencies
│
├── AI_model_Py_Scripts/       # ML Training Scripts
│   ├── train_xgboost.py       # XGBoost training
│   ├── train_ngboost.py       # NGBoost training
│   ├── cgan_model.py          # Conditional GAN for data augmentation
│   └── requirements.txt       # Training dependencies
│
├── fraudAI_Frontend_React/    # React Frontend
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── firebase/          # Firebase config
│   │   └── services/          # API services
│   └── package.json
│
├── fraud_dataset.csv          # Training dataset (20,000+ records)
├── verify_api.py              # API testing script
└── demo_autopay.py            # Netflix autopay demo
```

## 🛠️ Setup Instructions

### 1. Install Backend Dependencies

```bash
cd AI_model_server_Flask
pip install -r requirements.txt
```

### 2. Train ML Models

```bash
cd AI_model_Py_Scripts
pip install -r requirements.txt
python train_xgboost.py    # Train primary model
python train_ngboost.py    # Train probabilistic model (optional)
```

### 3. Start Backend Server

```bash
cd AI_model_server_Flask
python app.py
# Server runs on http://localhost:5000
```

### 4. Setup Frontend

```bash
cd fraudAI_Frontend_React
npm install
```

### 5. Configure Firebase

Edit `src/firebase/config.js` with your Firebase project credentials.

### 6. Start Frontend

```bash
npm run dev
# App runs on http://localhost:5173
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/predict` | Fraud prediction (dataset or UPI mode) |
| POST | `/analyze-dataset` | Batch CSV analysis |
| POST | `/feedback` | User feedback submission |
| GET | `/alerts` | Fetch fraud alerts |

## 📊 Risk Levels

| Score | Risk Level | Action |
|-------|------------|--------|
| ≥ 0.85 | HIGH | Block Transaction |
| ≥ 0.60 | MEDIUM | Request Verification |
| < 0.60 | LOW | Allow Transaction |

## 🧪 Testing

```bash
# Test API endpoints
python verify_api.py

# Run autopay fraud demo
python demo_autopay.py
```

## 🔧 Tech Stack

- **Backend**: Python, Flask, SHAP, XGBoost, NGBoost
- **Frontend**: React 18, Vite, TailwindCSS, Framer Motion
- **ML**: TensorFlow (CGAN), scikit-learn
- **Auth**: Firebase Authentication
- **Visualization**: Recharts

## 📝 License

MIT License
