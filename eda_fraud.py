import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import argparse

# Set style
sns.set(style="whitegrid")

def perform_eda(file_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    print(f"Loading dataset from {file_path}...")
    df = pd.read_csv(file_path)
    
    # 1. Basic Info
    print("\n--- Basic Information ---")
    print(f"Shape: {df.shape}")
    print("\nColumn Data Types:")
    print(df.dtypes)
    
    print("\nMissing Values:")
    print(df.isnull().sum())
    
    # 2. Target Variable Distribution
    print("\n--- Label Distribution ---")
    label_counts = df['Label'].value_counts()
    print(label_counts)
    
    plt.figure(figsize=(6, 4))
    sns.countplot(x='Label', data=df, palette='viridis')
    plt.title(f'Label Distribution ({os.path.basename(file_path)})')
    plt.savefig(os.path.join(output_dir, 'label_distribution.png'))
    plt.close()
    
    # 3. Summary Statistics
    print("\n--- Summary Statistics (Numerical) ---")
    print(df.describe())
    
    # 4. Correlation Matrix
    # Encode categorical columns for correlation
    df_encoded = df.copy()
    for col in df_encoded.select_dtypes(include=['object']).columns:
        df_encoded[col] = df_encoded[col].astype('category').cat.codes
        
    print("\n--- Correlation Analysis ---")
    corr = df_encoded.corr()
    print("\nCorrelations with Label:")
    print(corr['Label'].sort_values(ascending=False))
    
    plt.figure(figsize=(12, 10))
    sns.heatmap(corr, annot=False, cmap='coolwarm', linewidths=0.5)
    plt.title('Feature Correlation Heatmap')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'correlation_heatmap.png'))
    plt.close()
    
    # 5. Key Feature Analysis: Transaction Amount
    plt.figure(figsize=(10, 6))
    if 0 in df['Label'].values:
        sns.kdeplot(df[df['Label'] == 0]['Transaction Amount'], label='Normal', fill=True)
    if 1 in df['Label'].values:
        sns.kdeplot(df[df['Label'] == 1]['Transaction Amount'], label='Fraud', fill=True)
    plt.title('Distribution of Transaction Amount (Normal vs Fraud)')
    plt.legend()
    plt.savefig(os.path.join(output_dir, 'amount_distribution.png'))
    plt.close()
    
    # 6. Key Feature Analysis: Transaction Frequency
    plt.figure(figsize=(10, 6))
    sns.boxplot(x='Label', y='Transaction Frequency', data=df)
    plt.title('Transaction Frequency by Label')
    plt.savefig(os.path.join(output_dir, 'frequency_boxplot.png'))
    plt.close()

    # 7. categorical analysis: Recipient Verification Status
    plt.figure(figsize=(10, 6))
    sns.countplot(x='Recipient Verification Status', hue='Label', data=df)
    plt.title('Fraud by Recipient Verification Status')
    plt.savefig(os.path.join(output_dir, 'verification_status_analysis.png'))
    plt.close()

    print(f"\nAnalysis complete for {file_path}. Charts saved in {output_dir}.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Perform EDA on fraud dataset.')
    parser.add_argument('--input', type=str, required=True, help='Path to input CSV file')
    parser.add_argument('--output', type=str, required=True, help='Directory to save results')
    args = parser.parse_args()

    if os.path.exists(args.input):
        perform_eda(args.input, args.output)
    else:
        print(f"Error: {args.input} not found.")
