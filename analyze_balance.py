import pandas as pd

try:
    df = pd.read_csv(r'c:\Users\shoai\Desktop\alternate 4\fraud_dataset.csv')
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
        if min_class_ratio < 0.4: # Assuming 40-60 split is balanced enough
             is_balanced = False
        
        print(f"\nIs Balanced: {'Yes' if is_balanced else 'No'}")

except Exception as e:
    print(f"An error occurred: {e}")
