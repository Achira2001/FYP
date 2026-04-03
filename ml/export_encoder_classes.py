import json
import joblib

label_encoders = joblib.load("models/label_encoders.joblib")

export_data = {}
for key, encoder in label_encoders.items():
    export_data[key] = encoder.classes_.tolist()

with open("models/label_encoders_classes.json", "w", encoding="utf-8") as f:
    json.dump(export_data, f, indent=2)

print("Exported encoder classes to models/label_encoders_classes.json")