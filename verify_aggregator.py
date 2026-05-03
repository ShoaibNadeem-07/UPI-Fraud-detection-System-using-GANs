from AI_model_server_Flask.feature_aggregator import FeatureAggregator
import pandas as pd
import os

try:
    print("Initializing Aggregator...")
    agg = FeatureAggregator()
    
    encoded_path = agg.encoders_path
    print(f"Encoders path: {encoded_path}")
    print(f"Exists: {os.path.exists(encoded_path)}")
    print(f"Encoders loaded: {list(agg.label_encoders.keys())}")
    
    # Test sample
    sample_data = {
        'Transaction Amount': 100.0,
        'Recipient Verification Status': 'verified',
        'Geo-Location Flags': 'normal',
        'Some Numeric Col': 123
        # Add other cols as needed, aggregator handles extras gracefully if not using strict schema
    }
    
    print("\nProcessing sample:")
    result = agg.preprocess(sample_data)
    print("Result shape:", result.shape)
    print("Result (first 5 vals):", result[0][:5])
    
    print("\nVerification Successful.")
    
except Exception as e:
    print(f"Error: {e}")
