import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import Dense, BatchNormalization, LeakyReLU, Input
from tensorflow.keras.optimizers import Adam
from sklearn.preprocessing import StandardScaler
import os

# Configuration
DATA_PATH = r'c:\Users\shoai\Desktop\alternate 4\fraud_dataset_imbalanced_10_diverse.csv'
OUTPUT_PATH = r'c:\Users\shoai\Desktop\alternate 4\fraud_dataset_balanced_stdgan.csv'
LATENT_DIM = 100
EPOCHS = 1500  # Same as CGAN for fair comparison
BATCH_SIZE = 64

def load_data():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"File not found: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    return df

def build_generator(input_dim):
    """Standard GAN generator — takes ONLY noise, no class label."""
    noise = Input(shape=(LATENT_DIM,))
    
    x = Dense(128)(noise)
    x = BatchNormalization()(x)
    x = LeakyReLU(alpha=0.2)(x)
    
    x = Dense(256)(x)
    x = BatchNormalization()(x)
    x = LeakyReLU(alpha=0.2)(x)
    
    # Output layer matches feature dimension
    out = Dense(input_dim, activation='linear')(x)
    
    model = Model(noise, out)
    return model

def build_discriminator(input_dim):
    """Standard GAN discriminator — takes ONLY features, no class label."""
    features = Input(shape=(input_dim,))
    
    x = Dense(256)(features)
    x = LeakyReLU(alpha=0.2)(x)
    
    x = Dense(128)(x)
    x = LeakyReLU(alpha=0.2)(x)
    
    out = Dense(1, activation='sigmoid')(x)
    
    model = Model(features, out)
    model.compile(loss='binary_crossentropy', optimizer=Adam(0.0002, 0.5), metrics=['accuracy'])
    return model

def build_gan(generator, discriminator):
    """Standard GAN — no conditional label input."""
    discriminator.trainable = False
    
    noise = Input(shape=(LATENT_DIM,))
    gen_features = generator(noise)
    validity = discriminator(gen_features)
    
    model = Model(noise, validity)
    model.compile(loss='binary_crossentropy', optimizer=Adam(0.0002, 0.5))
    return model

def train_gan(df):
    print("Pre-processing data...")
    
    # Handle Categorical Features
    df_numeric = df.copy()
    from sklearn.preprocessing import LabelEncoder
    le_dict = {}
    for col in df_numeric.select_dtypes(include=['object']).columns:
        le = LabelEncoder()
        df_numeric[col] = le.fit_transform(df_numeric[col].astype(str))
        le_dict[col] = le
        print(f"Encoded {col}")

    # Separate features and label
    X = df_numeric.drop('Label', axis=1).values
    y = df_numeric['Label'].values
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    minority_class = 1
    majority_class = 0
    
    minority_count = int((y == minority_class).sum())
    majority_count = int((y == majority_class).sum())
    
    samples_to_generate = majority_count - minority_count
    
    if samples_to_generate <= 0:
        samples_to_generate = 1000
        
    print(f"Majority count: {majority_count}, Minority count: {minority_count}")
    print(f"Generating {samples_to_generate} samples for class {minority_class}...")
    
    input_dim = X.shape[1]
    
    # Build models — NO label conditioning
    discriminator = build_discriminator(input_dim)
    generator = build_generator(input_dim)
    gan = build_gan(generator, discriminator)
    
    # Training Loop
    valid = np.ones((BATCH_SIZE, 1))
    fake = np.zeros((BATCH_SIZE, 1))
    
    # KEY DIFFERENCE: Standard GAN trains on ALL data (both classes mixed)
    # It has no mechanism to separate class distributions, so it learns
    # a blended distribution that mixes fraud and legitimate patterns.
    print("Starting Standard GAN training on ALL data (no class conditioning)...")
    for epoch in range(EPOCHS):
        # -- Train Discriminator on ALL data (both classes) --
        idx = np.random.randint(0, len(X_scaled), BATCH_SIZE)
        real_features = X_scaled[idx]
        
        # Standard GAN: noise only, no label
        noise = np.random.normal(0, 1, (BATCH_SIZE, LATENT_DIM))
        fake_features = generator.predict(noise, verbose=0)
        
        d_loss_real = discriminator.train_on_batch(real_features, valid)
        d_loss_fake = discriminator.train_on_batch(fake_features, fake)
        d_loss = 0.5 * np.add(d_loss_real, d_loss_fake)
        
        # -- Train Generator --
        noise = np.random.normal(0, 1, (BATCH_SIZE, LATENT_DIM))
        g_loss = gan.train_on_batch(noise, valid)
        
        if epoch % 100 == 0:
            print(f"{epoch} [D loss: {d_loss[0]:.4f}, acc.: {100*d_loss[1]:.2f}%] [G loss: {g_loss:.4f}]")
            
    print("Training finished.")
    
    # Generate Synthetic Data
    noise = np.random.normal(0, 1, (samples_to_generate, LATENT_DIM))
    gen_features_scaled = generator.predict(noise, verbose=0)
    
    # Inverse transform
    gen_features = scaler.inverse_transform(gen_features_scaled)
    
    # Create DataFrame with generated features
    cols = df_numeric.columns.drop('Label')
    df_gen = pd.DataFrame(gen_features, columns=cols)
    
    # Round and clip categorical columns, then inverse transform to strings
    for col, le in le_dict.items():
        if col in df_gen.columns:
            vals = np.round(df_gen[col].values).astype(int)
            vals = np.clip(vals, 0, len(le.classes_) - 1)
            df_gen[col] = le.inverse_transform(vals)
            
    # Add Label column
    df_gen['Label'] = minority_class
    
    # Ensure datatypes match
    for col in df.columns:
        if col in df_gen.columns and col not in le_dict:
            if pd.api.types.is_integer_dtype(df[col]):
                df_gen[col] = df_gen[col].round().astype(df[col].dtype)

    df_balanced = pd.concat([df, df_gen], axis=0).sample(frac=1).reset_index(drop=True)
    return df_balanced

if __name__ == "__main__":
    try:
        df = load_data()
        
        # Check imbalance
        counts = df['Label'].value_counts()
        print("Initial distribution:")
        print(counts)
        
        print("Balancing with Standard GAN (no conditioning)...")
        df_balanced = train_gan(df)
        
        print(f"Original shape: {df.shape}")
        print(f"Balanced shape: {df_balanced.shape}")
        print("Balanced Class distribution:")
        print(df_balanced['Label'].value_counts())
        
        df_balanced.to_csv(OUTPUT_PATH, index=False)
        print(f"Saved balanced dataset to: {OUTPUT_PATH}")
        
    except Exception as e:
        print(f"Error: {e}")
