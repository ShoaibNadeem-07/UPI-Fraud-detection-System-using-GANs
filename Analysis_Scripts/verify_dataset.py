import pandas as pd

try:
    df = pd.read_csv('fraud_dataset_balanced.csv')
    print("Dataset loaded successfully.")
    print(f"Shape: {df.shape}")
    print("\nClass Distribution:")
    print(df['Label'].value_counts())
    
    print("\nData Types:")
    print(df.dtypes)
    
    print("\nSample Rows:")
    print(df.head())
    
    # Check for categorical columns
    categorical_cols = df.select_dtypes(include=['object']).columns
    print(f"\nCategorical Columns found: {list(categorical_cols)}")
    
    if len(categorical_cols) > 0:
        print("\nUnique values in first categorical column:")
        print(df[categorical_cols[0]].unique())
        
except Exception as e:
    print(f"Error: {e}")
