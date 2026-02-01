"""
Diet Recommendation Model Training Script
=========================================
This script trains an XGBoost model to recommend personalized diet plans
based on patient health data and preferences.

Features:
- Data preprocessing and feature engineering
- Multiple target prediction (calories, protein, carbs, fats, meal plan)
- Model evaluation and saving
- Feature importance analysis
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, accuracy_score, classification_report
import xgboost as xgb
import joblib
import json
import os

# Set random seed for reproducibility
RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)

def load_and_explore_data(file_path):
    """Load the dataset and display basic information"""
    print("=" * 50)
    print("LOADING DATA")
    print("=" * 50)
    
    df = pd.read_csv(file_path)
    print(f"\n✓ Dataset loaded successfully!")
    print(f"  - Total records: {len(df)}")
    print(f"  - Total features: {len(df.columns)}")
    print(f"\n✓ First few rows:")
    print(df.head())
    
    print(f"\n✓ Dataset info:")
    print(df.info())
    
    print(f"\n✓ Missing values:")
    print(df.isnull().sum())
    
    return df

def preprocess_data(df):
    """
    Preprocess the data:
    - Handle missing values
    - Encode categorical variables
    - Create feature mappings for frontend
    """
    print("\n" + "=" * 50)
    print("PREPROCESSING DATA")
    print("=" * 50)
    
    # Make a copy
    df = df.copy()
    
    # Drop Patient_ID as it's not a feature
    if 'Patient_ID' in df.columns:
        df = df.drop('Patient_ID', axis=1)
    
    # Handle missing values (fill with 'None' for categorical, median for numerical)
    # First, identify numerical and categorical columns
    numerical_cols = df.select_dtypes(include=['int64', 'float64']).columns
    categorical_cols = df.select_dtypes(include=['object']).columns
    
    # Fill categorical columns with 'None'
    for col in categorical_cols:
        df[col] = df[col].fillna('None')
    
    # Fill numerical columns with median
    for col in numerical_cols:
        df[col] = df[col].fillna(df[col].median())
    
    print("✓ Missing values handled")
    
    # Create label encoders for categorical features
    label_encoders = {}
    categorical_columns = df.select_dtypes(include=['object']).columns
    
    for col in categorical_columns:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le
        print(f"✓ Encoded '{col}': {len(le.classes_)} unique values")
    
    # Save the label encoders and their mappings
    encoder_info = {}
    for col, encoder in label_encoders.items():
        encoder_info[col] = {
            'classes': encoder.classes_.tolist(),
            'mapping': {str(cls): int(idx) for idx, cls in enumerate(encoder.classes_)}
        }
    
    return df, label_encoders, encoder_info

def prepare_features_and_targets(df):
    """
    Separate features (X) and targets (y)
    """
    print("\n" + "=" * 50)
    print("PREPARING FEATURES AND TARGETS")
    print("=" * 50)
    
    # Define target columns
    target_columns = [
        'Recommended_Calories',
        'Recommended_Protein',
        'Recommended_Carbs',
        'Recommended_Fats',
        'Recommended_Meal_Plan'
    ]
    
    # Check if all targets exist
    for col in target_columns:
        if col not in df.columns:
            raise ValueError(f"Target column '{col}' not found in dataset!")
    
    # Features are all columns except targets
    feature_columns = [col for col in df.columns if col not in target_columns]
    
    X = df[feature_columns]
    y_calories = df['Recommended_Calories']
    y_protein = df['Recommended_Protein']
    y_carbs = df['Recommended_Carbs']
    y_fats = df['Recommended_Fats']
    y_meal_plan = df['Recommended_Meal_Plan']
    
    print(f"✓ Features shape: {X.shape}")
    print(f"✓ Feature columns ({len(feature_columns)}):")
    for col in feature_columns:
        print(f"  - {col}")
    
    print(f"\n✓ Target variables:")
    print(f"  - Recommended_Calories (regression)")
    print(f"  - Recommended_Protein (regression)")
    print(f"  - Recommended_Carbs (regression)")
    print(f"  - Recommended_Fats (regression)")
    print(f"  - Recommended_Meal_Plan (classification)")
    
    return X, y_calories, y_protein, y_carbs, y_fats, y_meal_plan, feature_columns

def train_regression_model(X_train, X_test, y_train, y_test, target_name):
    """
    Train an XGBoost regression model for a specific target
    """
    print(f"\n  Training model for {target_name}...")
    
    # Define XGBoost parameters
    params = {
        'objective': 'reg:squarederror',
        'max_depth': 6,
        'learning_rate': 0.1,
        'n_estimators': 200,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'random_state': RANDOM_STATE,
        'n_jobs': -1
    }
    
    # Train model
    model = xgb.XGBRegressor(**params)
    model.fit(X_train, y_train, 
              eval_set=[(X_test, y_test)],
              verbose=False)
    
    # Make predictions
    y_pred = model.predict(X_test)
    
    # Evaluate
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    print(f"    ✓ MAE:  {mae:.2f}")
    print(f"    ✓ RMSE: {rmse:.2f}")
    print(f"    ✓ R²:   {r2:.4f}")
    
    return model, {'mae': mae, 'rmse': rmse, 'r2': r2}

def train_classification_model(X_train, X_test, y_train, y_test, target_name):
    """
    Train an XGBoost classification model for meal plan recommendation
    """
    print(f"\n  Training model for {target_name}...")
    
    # Define XGBoost parameters
    params = {
        'objective': 'multi:softmax',
        'max_depth': 6,
        'learning_rate': 0.1,
        'n_estimators': 200,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'random_state': RANDOM_STATE,
        'n_jobs': -1,
        'num_class': len(np.unique(y_train))
    }
    
    # Train model
    model = xgb.XGBClassifier(**params)
    model.fit(X_train, y_train,
              eval_set=[(X_test, y_test)],
              verbose=False)
    
    # Make predictions
    y_pred = model.predict(X_test)
    
    # Evaluate
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"    ✓ Accuracy: {accuracy:.4f}")
    print(f"    ✓ Classification Report:")
    print(classification_report(y_test, y_pred))
    
    return model, {'accuracy': accuracy}

def get_feature_importance(model, feature_names, top_n=10):
    """
    Get top N most important features
    """
    importance_dict = dict(zip(feature_names, model.feature_importances_))
    sorted_importance = sorted(importance_dict.items(), key=lambda x: x[1], reverse=True)
    return sorted_importance[:top_n]

def main():
    """Main training pipeline"""
    print("\n" + "=" * 50)
    print("🍎 DIET RECOMMENDATION MODEL TRAINING")
    print("=" * 50)
    
    # Paths
    data_path = '../data/diet_data.csv'
    models_dir = '../models'
    
    # Create models directory if it doesn't exist
    os.makedirs(models_dir, exist_ok=True)
    
    # 1. Load data
    df = load_and_explore_data(data_path)
    
    # 2. Preprocess data
    df_processed, label_encoders, encoder_info = preprocess_data(df)
    
    # 3. Prepare features and targets
    X, y_calories, y_protein, y_carbs, y_fats, y_meal_plan, feature_columns = \
        prepare_features_and_targets(df_processed)
    
    # 4. Split data (80% train, 20% test)
    print("\n" + "=" * 50)
    print("SPLITTING DATA")
    print("=" * 50)
    
    X_train, X_test, \
    y_cal_train, y_cal_test, \
    y_prot_train, y_prot_test, \
    y_carb_train, y_carb_test, \
    y_fat_train, y_fat_test, \
    y_meal_train, y_meal_test = train_test_split(
        X, y_calories, y_protein, y_carbs, y_fats, y_meal_plan,
        test_size=0.2,
        random_state=RANDOM_STATE
    )
    
    print(f"✓ Training set: {len(X_train)} samples ({len(X_train)/len(X)*100:.1f}%)")
    print(f"✓ Testing set:  {len(X_test)} samples ({len(X_test)/len(X)*100:.1f}%)")
    
    # 5. Train models
    print("\n" + "=" * 50)
    print("TRAINING MODELS")
    print("=" * 50)
    
    models = {}
    metrics = {}
    
    # Train regression models
    print("\n🔸 Regression Models:")
    
    models['calories'], metrics['calories'] = train_regression_model(
        X_train, X_test, y_cal_train, y_cal_test, 'Recommended_Calories'
    )
    
    models['protein'], metrics['protein'] = train_regression_model(
        X_train, X_test, y_prot_train, y_prot_test, 'Recommended_Protein'
    )
    
    models['carbs'], metrics['carbs'] = train_regression_model(
        X_train, X_test, y_carb_train, y_carb_test, 'Recommended_Carbs'
    )
    
    models['fats'], metrics['fats'] = train_regression_model(
        X_train, X_test, y_fat_train, y_fat_test, 'Recommended_Fats'
    )
    
    # Train classification model
    print("\n🔸 Classification Model:")
    
    models['meal_plan'], metrics['meal_plan'] = train_classification_model(
        X_train, X_test, y_meal_train, y_meal_test, 'Recommended_Meal_Plan'
    )
    
    # 6. Feature importance analysis
    print("\n" + "=" * 50)
    print("FEATURE IMPORTANCE ANALYSIS")
    print("=" * 50)
    
    for model_name, model in models.items():
        print(f"\n🔸 Top 10 features for {model_name}:")
        importance = get_feature_importance(model, feature_columns, top_n=10)
        for i, (feat, imp) in enumerate(importance, 1):
            print(f"  {i:2d}. {feat:30s} {imp:.4f}")
    
    # 7. Save models
    print("\n" + "=" * 50)
    print("SAVING MODELS")
    print("=" * 50)
    
    for model_name, model in models.items():
        model_path = os.path.join(models_dir, f'{model_name}_model.joblib')
        joblib.dump(model, model_path)
        print(f"✓ Saved {model_name} model to {model_path}")
    
    # 8. Save encoders and metadata
    metadata = {
        'feature_columns': feature_columns,
        'encoder_info': encoder_info,
        'metrics': metrics,
        'random_state': RANDOM_STATE
    }
    
    metadata_path = os.path.join(models_dir, 'metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"✓ Saved metadata to {metadata_path}")
    
    # Save label encoders
    encoders_path = os.path.join(models_dir, 'label_encoders.joblib')
    joblib.dump(label_encoders, encoders_path)
    print(f"✓ Saved label encoders to {encoders_path}")
    
    print("\n" + "=" * 50)
    print("✅ TRAINING COMPLETED SUCCESSFULLY!")
    print("=" * 50)
    print("\nYour models are ready to use!")
    print(f"Location: {os.path.abspath(models_dir)}/")
    
    return models, metadata

if __name__ == "__main__":
    models, metadata = main()