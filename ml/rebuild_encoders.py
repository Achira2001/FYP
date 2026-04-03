import json
import joblib
import numpy as np
from sklearn.preprocessing import LabelEncoder

with open("models/label_encoders_classes.json", "r", encoding="utf-8") as f:
    export_data = json.load(f)

label_encoders = {}

for key, classes_list in export_data.items():
    le = LabelEncoder()
    le.classes_ = np.array(classes_list, dtype=object)
    label_encoders[key] = le

joblib.dump(label_encoders, "models/label_encoders.joblib")
print("Rebuilt models/label_encoders.joblib successfully")