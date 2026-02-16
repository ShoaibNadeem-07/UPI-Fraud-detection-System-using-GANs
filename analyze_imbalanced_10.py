import pandas as pd

try:
    df = pd.read_csv(r'c:\Users\shoai\Desktop\alternate 4\fraud_dataset_imbalanced_10_diverse.csv')
    if 'Label' not in df.columns:
        print("Error: 'Label' column not found.")
        print(f"Available columns: {df.columns.tolist()}")
    else:
        counts = df['Label'].value_counts()
        total = len(df)
        print("Class Distribution:")
        print(counts)
        print("\nPercentage:")
        print(counts / total * 100)
        
        is_balanced = True
        min_class_ratio = counts.min() / total
        # Generally, < 20% or > 80% is considered imbalanced, strict balance is close to 50/50
        if min_class_ratio < 0.4: 
             is_balanced = False
        
        print(f"\nIs Balanced: {'Yes' if is_balanced else 'No'}")

except Exception as e:
    print(f"An error occurred: {e}")
