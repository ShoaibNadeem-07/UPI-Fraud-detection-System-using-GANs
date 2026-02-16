import pandas as pd
import numpy as np
import joblib
import os

class FeatureAggregator:
    def __init__(self):
        # Load encoders
        self.encoders_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models', 'label_encoders.pkl')
        self.label_encoders = {}
        try:
            if os.path.exists(self.encoders_path):
                self.label_encoders = joblib.load(self.encoders_path)
                print(f"Loaded label encoders from {self.encoders_path}")
            else:
                print("Label encoders not found, using fallback dictionary.")
        except Exception as e:
            print(f"Error loading encoders: {e}")

        # Load feature names
        self.features_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models', 'feature_names.pkl')
        self.feature_names = None
        try:
            if os.path.exists(self.features_path):
                self.feature_names = joblib.load(self.features_path)
                print(f"Loaded feature names from {self.features_path}")
            else:
                print("Feature names not found. Models might rely on implicit ordering.")
        except Exception as e:
            print(f"Error loading feature names: {e}")

        # Fallback mapping for unknown categorical columns
        self.label_mappings = {
            'verified': 1, 'not verified': 0, 'pending': 2,
            'recently_registered': 3, 'suspicious': 4,
            'normal': 0, 'high-risk': 1, 'unusual': 2
        }

    def preprocess(self, data):
        """
        Preprocess input dictionary or dataframe for prediction
        """
        if isinstance(data, dict):
            df = pd.DataFrame([data])
        else:
            df = data.copy()
            
        # Handle Categorical
        for col in df.columns:
            # Check if we have an encoder for this column
            if col in self.label_encoders:
                le = self.label_encoders[col]
                # Handle unknown labels via safe transform
                # Map to a default or transform if known
                df[col] = df[col].astype(str).map(lambda x: le.transform([x])[0] if x in le.classes_ else 0)
            elif df[col].dtype == 'object':
                 # Fallback
                df[col] = df[col].map(lambda x: self.label_mappings.get(str(x).lower(), 0))
                
        # Ensure column order matches model
        if self.feature_names:
            # Add missing columns with 0
            for col in self.feature_names:
                if col not in df.columns:
                    df[col] = 0
            
            # Reorder
            df = df[self.feature_names]
            
        return df.values
