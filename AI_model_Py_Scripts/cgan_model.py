import pandas as pd
import numpy as np
import tensorflow as pd_tf
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import Dense, BatchNormalization, LeakyReLU, Input, Concatenate
from tensorflow.keras.optimizers import Adam
from sklearn.preprocessing import StandardScaler
import os

# Configuration
DATA_PATH = r'c:\Users\shoai\Desktop\alternate 4\fraud_dataset_imbalanced_10_diverse.csv'
OUTPUT_PATH = r'c:\Users\shoai\Desktop\alternate 4\fraud_dataset_balanced.csv'
LATENT_DIM = 100
EPOCHS = 1500  # Reduced for demo/speed, increase for better quality
BATCH_SIZE = 64

def load_data():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"File not found: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    return df

def build_generator(input_dim):
    # Noise input
    noise = Input(shape=(LATENT_DIM,))
    # Label input (conditional)
    label = Input(shape=(1,))
    
    model_input = Concatenate()([noise, label])
    
    x = Dense(128)(model_input)
    x = BatchNormalization()(x)
    x = LeakyReLU(alpha=0.2)(x)
    
    x = Dense(256)(x)
    x = BatchNormalization()(x)
    x = LeakyReLU(alpha=0.2)(x)
    
    # Output layer matches feature dimension
    out = Dense(input_dim, activation='linear')(x)
    
    model = Model([noise, label], out)
    return model

def build_discriminator(input_dim):
    # Feature input
    features = Input(shape=(input_dim,))
    # Label input
    label = Input(shape=(1,))
    
    model_input = Concatenate()([features, label])
    
    x = Dense(256)(model_input)
    x = LeakyReLU(alpha=0.2)(x)
    
    x = Dense(128)(x)
    x = LeakyReLU(alpha=0.2)(x)
    
    out = Dense(1, activation='sigmoid')(x)
    
    model = Model([features, label], out)
    model.compile(loss='binary_crossentropy', optimizer=Adam(0.0002, 0.5), metrics=['accuracy'])
    return model

def build_cgan(generator, discriminator):
    discriminator.trainable = False
    
    noise = Input(shape=(LATENT_DIM,))
    label = Input(shape=(1,))
    
    gen_features = generator([noise, label])
    validity = discriminator([gen_features, label])
    
    model = Model([noise, label], validity)
    model.compile(loss='binary_crossentropy', optimizer=Adam(0.0002, 0.5))
    return model

def train_cgan(df):
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
    
    X_minority = X_scaled[y == minority_class]
    y_minority = y[y == minority_class]
    
    X_majority = X_scaled[y == majority_class]
    y_majority = y[y == majority_class]
    
    minority_count = len(X_minority)
    majority_count = len(X_majority)
    
    if minority_count >= majority_count:
        print("Note: Minority class count is not smaller than majority class count.")
        # Proceeding anyway as logic might handle it or just training on 'minority' class 1
    
    samples_to_generate = majority_count - minority_count
    
    # If already balanced or minority > majority, generate a fixed amount or skip
    if samples_to_generate <= 0:
        samples_to_generate = 1000 # Default add some
        
    print(f"Majority count: {majority_count}, Minority count: {minority_count}")
    print(f"Generating {samples_to_generate} samples for class {minority_class}...")
    
    input_dim = X.shape[1]
    
    # Build models
    discriminator = build_discriminator(input_dim)
    generator = build_generator(input_dim)
    cgan = build_cgan(generator, discriminator)
    
    # Training Loop
    valid = np.ones((BATCH_SIZE, 1))
    fake = np.zeros((BATCH_SIZE, 1))
    
    print("Starting CGAN training on ALL data (with class conditioning)...")
    for epoch in range(EPOCHS):
        # -- Train Discriminator on ALL data with labels --
        # CGAN advantage: discriminator sees BOTH classes with their labels,
        # learning the conditional distribution P(X|Y) for each class.
        idx = np.random.randint(0, len(X_scaled), BATCH_SIZE)
        real_features = X_scaled[idx]
        real_labels = y[idx].reshape(-1, 1)
        
        noise = np.random.normal(0, 1, (BATCH_SIZE, LATENT_DIM))
        # Generate specifically for minority class (fraud)
        fake_labels = np.full((BATCH_SIZE, 1), minority_class) 
        fake_features = generator.predict([noise, fake_labels], verbose=0)
        
        d_loss_real = discriminator.train_on_batch([real_features, real_labels], valid)
        d_loss_fake = discriminator.train_on_batch([fake_features, fake_labels], fake)
        d_loss = 0.5 * np.add(d_loss_real, d_loss_fake)
        
        # -- Train Generator --
        noise = np.random.normal(0, 1, (BATCH_SIZE, LATENT_DIM))
        target_labels = np.full((BATCH_SIZE, 1), minority_class)
        
        g_loss = cgan.train_on_batch([noise, target_labels], valid)
        
        if epoch % 100 == 0:
            print(f"{epoch} [D loss: {d_loss[0]:.4f}, acc.: {100*d_loss[1]:.2f}%] [G loss: {g_loss:.4f}]")
            
    print("Training finished.")
    
    # Generate Synthetic Data
    noise = np.random.normal(0, 1, (samples_to_generate, LATENT_DIM))
    labels_to_gen = np.full((samples_to_generate, 1), minority_class)
    gen_features_scaled = generator.predict([noise, labels_to_gen], verbose=0)
    
    # Inverse transform
    gen_features = scaler.inverse_transform(gen_features_scaled)
    
    # Create DataFrame with generated features
    cols = df_numeric.columns.drop('Label')
    df_gen = pd.DataFrame(gen_features, columns=cols)
    
    # Round and clip categorical columns, then inverse transform to strings
    for col, le in le_dict.items():
        if col in df_gen.columns:
            # Round to nearest integer
            vals = np.round(df_gen[col].values).astype(int)
            # Clip to valid range
            vals = np.clip(vals, 0, len(le.classes_) - 1)
            # Inverse transform to original strings
            df_gen[col] = le.inverse_transform(vals)
            
    # Add Label column
    df_gen['Label'] = minority_class
    
    # Concatenate with ORIGINAL dataframe (df) which has strings, not df_numeric
    # We need to ensure we only take the columns that are common+Label, or just use df.
    # df has the original data with string categories.
    
    # Ensure datatypes of other columns match if possible (e.g. ints)
    for col in df.columns:
        if col in df_gen.columns and col not in le_dict:
            # Try to cast to original type if numeric
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
        
        # Balance regardless of strict threshold if requested, but logic below checks
        # Assuming we want to balance class 1 to match class 0
        if True: # Force run for demo/restoration
            print("Balancing with CGAN...")
            df_balanced = train_cgan(df)
            
            print(f"Original shape: {df.shape}")
            print(f"Balanced shape: {df_balanced.shape}")
            print("Balanced Class distribution:")
            print(df_balanced['Label'].value_counts())
            
            df_balanced.to_csv(OUTPUT_PATH, index=False)
            print(f"Saved balanced dataset to: {OUTPUT_PATH}")
            
    except Exception as e:
        print(f"Error: {e}")
