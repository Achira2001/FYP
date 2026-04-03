import joblib

# Load your old encoder (if possible)
label_encoders = joblib.load("models/label_encoders.joblib")

# Re-save with current environment
joblib.dump(label_encoders, "models/label_encoders.joblib")

print(" label_encoders fixed and saved")