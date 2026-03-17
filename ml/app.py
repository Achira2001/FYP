"""
Diet Recommendation API Server
==============================
Flask API that serves the trained XGBoost models for personalized
diet recommendations.

Endpoints:
- GET  /api/health          - Health check
- POST /api/predict         - Get diet recommendations
- GET  /api/meal-plans      - Get available meal plans
- POST /api/process-report  - OCR extract from medical report
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import json
import numpy as np
import pandas as pd
import os
import warnings
from datetime import datetime
from werkzeug.utils import secure_filename
import requests
import xgboost as xgb          # needed for native model loading

# Suppress residual sklearn version warnings for label encoders that were
# pickled on a slightly different sklearn build. They are safe to load.
warnings.filterwarnings(
    'ignore',
    message='.*InconsistentVersionWarning.*',
    category=UserWarning
)
warnings.filterwarnings(
    'ignore',
    message='.*Trying to unpickle estimator.*',
    category=UserWarning
)

# Import OCR processor (unchanged)
from ocr_processor import process_medical_report

# ============================================
# APP SETUP
# ============================================

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
MAX_FILE_SIZE = 10 * 1024 * 1024   # 10 MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

NODEJS_API_URL = 'http://localhost:5000/api/diet-plans'

# ============================================
# GLOBALS
# ============================================

models         = {}
metadata       = {}
label_encoders = {}

# ============================================
# HELPERS
# ============================================

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def load_models():
    """
    Load all trained models and metadata.

    XGBoost models are loaded using the native .ubj format via
    xgb.XGBRegressor().load_model() — this completely avoids the
    pickle-based XGBoost serialisation warning.

    Label encoders are plain joblib pickles.  They are safe to load
    across minor sklearn versions; the InconsistentVersionWarning
    filter above silences the cosmetic warning.
    """
    global models, metadata, label_encoders

    MODELS_DIR = '../models'

    try:
        # ── Regression models (native XGBoost .ubj — zero pickle warnings)
        for name in ['calories', 'protein', 'carbs', 'fats']:
            path = os.path.join(MODELS_DIR, f'{name}_model.ubj')
            m = xgb.XGBRegressor()
            m.load_model(path)
            models[name] = m
            print(f"  ✓ Loaded {name}_model.ubj")

        # ── Classification model
        path = os.path.join(MODELS_DIR, 'meal_plan_model.ubj')
        meal_m = xgb.XGBClassifier()
        meal_m.load_model(path)
        models['meal_plan'] = meal_m
        print("  ✓ Loaded meal_plan_model.ubj")

        # ── Metadata
        with open(os.path.join(MODELS_DIR, 'metadata.json'), 'r') as f:
            metadata = json.load(f)
        print("  ✓ Loaded metadata.json")

        # ── Label encoders
        label_encoders = joblib.load(os.path.join(MODELS_DIR, 'label_encoders.joblib'))
        print("  ✓ Loaded label_encoders.joblib")

        # Log the versions the models were trained with
        saved_sklearn = metadata.get('sklearn_version', 'unknown')
        saved_xgb     = metadata.get('xgboost_version', 'unknown')
        import sklearn
        print(f"\n  Trained with  sklearn={saved_sklearn}  xgboost={saved_xgb}")
        print(f"  Running with  sklearn={sklearn.__version__}  xgboost={xgb.__version__}")

        return True

    except FileNotFoundError as e:
        print(f"\n✗ Model file not found: {e}")
        print("  Make sure you extracted diet_models.zip into the models/ folder.")
        print("  Expected files: calories_model.ubj, protein_model.ubj,")
        print("                  carbs_model.ubj, fats_model.ubj,")
        print("                  meal_plan_model.ubj, label_encoders.joblib, metadata.json")
        return False
    except Exception as e:
        print(f"✗ Error loading models: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


# ============================================
# MONGODB SAVE
# ============================================

def save_to_mongodb(user_data, predictions, data_source='manual', report_data=None):
    """
    Save diet plan to MongoDB through Node.js API
    """
    try:
        diet_plan_data = {
            'userInfo': {
                'name':   user_data.get('name', 'User'),
                'age':    int(user_data.get('age', 0)),
                'gender': user_data.get('gender', 'Other'),
                'height': float(user_data.get('height', 0)),
                'weight': float(user_data.get('weight', 0)),
                'bmi':    float(user_data.get('bmi', 0)),
                'goal':   user_data.get('goal', 'Maintenance')
            },
            'healthInfo': {
                'diseases':      user_data.get('diseases', []),
                'allergies':     user_data.get('allergies', ''),
                'activityLevel': user_data.get('activityLevel', 'moderate'),
                'dietPreference':user_data.get('dietPreference', 'Regular'),
                'mealsPerDay':   int(user_data.get('mealsPerDay', 3))
            },
            'recommendations': {
                'dailyCalories': int(predictions['recommended_calories']),
                'proteinGrams':  int(predictions['recommended_protein']),
                'carbsGrams':    int(predictions['recommended_carbs']),
                'fatsGrams':     int(predictions['recommended_fats']),
                'mealPlanType':  predictions['recommended_meal_plan']
            },
            'macroPercentages': predictions.get('macro_percentages', {}),
            'mealBreakdown':    predictions.get('meal_breakdown', []),
            'healthInsights':   predictions.get('health_insights', []),
            'dataSource':       data_source
        }

        if report_data:
            diet_plan_data['reportData'] = {
                'fileName':    report_data.get('fileName', ''),
                'uploadDate':  datetime.now().isoformat(),
                'extractedData': {
                    'patientDetails': report_data.get('patient_details', {}),
                    'diseases':       report_data.get('diseases', []),
                    'allergies':      report_data.get('allergies', ''),
                    'numericalInfo':  report_data.get('numerical_info', {})
                }
            }

        print(f"\n{'='*60}")
        print("Saving diet plan to MongoDB...")
        print(f"{'='*60}")

        response = requests.post(
            NODEJS_API_URL,
            json=diet_plan_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )

        if response.status_code in [200, 201]:
            result = response.json()
            if result.get('success'):
                diet_plan_id = result.get('data', {}).get('_id')
                print(f"✓ Diet plan saved to MongoDB!  ID: {diet_plan_id}")
                return diet_plan_id
            else:
                print(f"✗ MongoDB save failed: {result.get('message')}")
                return None
        else:
            print(f"✗ MongoDB API error: {response.status_code}  {response.text}")
            return None

    except requests.exceptions.ConnectionError:
        print("✗ Could not connect to Node.js backend — MongoDB storage skipped.")
        print("  Make sure Node.js server is running on port 5000.")
        return None
    except Exception as e:
        print(f"✗ Error saving to MongoDB: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


# ============================================
# FEATURE MAPPING
# ============================================

def map_frontend_to_model(frontend_data):
    """
    Map frontend form data to model features.
    """
    model_input = {}

    model_input['Age']        = int(frontend_data.get('age', 30))
    model_input['Height_cm']  = float(frontend_data.get('height', 170))
    model_input['Weight_kg']  = float(frontend_data.get('weight', 70))
    model_input['BMI']        = float(frontend_data.get('bmi', 24.0))

    gender = frontend_data.get('gender', 'Other')
    try:
        model_input['Gender'] = label_encoders['Gender'].transform([gender])[0]
    except ValueError:
        model_input['Gender'] = label_encoders['Gender'].transform(['Other'])[0]

    diseases = frontend_data.get('diseases', [])
    chronic_disease = diseases[0] if diseases and diseases[0] != 'None' else 'None'
    try:
        model_input['Chronic_Disease'] = label_encoders['Chronic_Disease'].transform([chronic_disease])[0]
    except ValueError:
        model_input['Chronic_Disease'] = label_encoders['Chronic_Disease'].transform(['None'])[0]

    allergies = frontend_data.get('allergies', '').strip() or 'None'
    try:
        model_input['Allergies'] = label_encoders['Allergies'].transform([allergies])[0]
    except:
        model_input['Allergies'] = label_encoders['Allergies'].transform(['None'])[0]

    diet_pref = frontend_data.get('dietPreference', 'Regular')
    try:
        model_input['Dietary_Habits'] = label_encoders['Dietary_Habits'].transform([diet_pref])[0]
    except ValueError:
        model_input['Dietary_Habits'] = label_encoders['Dietary_Habits'].transform(['Regular'])[0]

    activity_mapping = {
        'sedentary': 0, 'light': 2, 'moderate': 4, 'very': 6, 'extra': 6
    }
    activity = frontend_data.get('activityLevel', 'moderate')
    model_input['Exercise_Frequency'] = activity_mapping.get(activity, 3)

    model_input['Blood_Pressure_Systolic']  = 120
    model_input['Blood_Pressure_Diastolic'] = 80
    if chronic_disease == 'Hypertension':
        model_input['Blood_Pressure_Systolic']  = 140
        model_input['Blood_Pressure_Diastolic'] = 90

    model_input['Cholesterol_Level'] = 200
    if chronic_disease in ['High Cholesterol', 'Heart Disease']:
        model_input['Cholesterol_Level'] = 250

    model_input['Blood_Sugar_Level'] = 95
    if chronic_disease == 'Diabetes':
        model_input['Blood_Sugar_Level'] = 180

    genetic_risk = 'Yes' if chronic_disease in ['Heart Disease', 'Diabetes', 'Hypertension'] else 'No'
    model_input['Genetic_Risk_Factor'] = label_encoders['Genetic_Risk_Factor'].transform([genetic_risk])[0]

    steps_mapping = {
        'sedentary': 3000, 'light': 6000, 'moderate': 9000, 'very': 12000, 'extra': 15000
    }
    model_input['Daily_Steps']  = steps_mapping.get(activity, 7000)
    model_input['Sleep_Hours']  = 7.0
    model_input['Alcohol_Consumption'] = label_encoders['Alcohol_Consumption'].transform(['No'])[0]
    model_input['Smoking_Habit']       = label_encoders['Smoking_Habit'].transform(['No'])[0]

    bmr = (10 * model_input['Weight_kg'] +
           6.25 * model_input['Height_cm'] -
           5   * model_input['Age'])
    bmr += 5 if gender == 'Male' else -161

    activity_multiplier = {
        'sedentary': 1.2, 'light': 1.375, 'moderate': 1.55, 'very': 1.725, 'extra': 1.9
    }
    tdee = bmr * activity_multiplier.get(activity, 1.55)

    model_input['Caloric_Intake']        = int(tdee)
    model_input['Protein_Intake']        = int(tdee * 0.25 / 4)
    model_input['Carbohydrate_Intake']   = int(tdee * 0.45 / 4)
    model_input['Fat_Intake']            = int(tdee * 0.30 / 9)

    try:
        model_input['Preferred_Cuisine'] = label_encoders['Preferred_Cuisine'].transform(['Western'])[0]
    except ValueError:
        first_cuisine = label_encoders['Preferred_Cuisine'].classes_[0]
        model_input['Preferred_Cuisine'] = label_encoders['Preferred_Cuisine'].transform([first_cuisine])[0]

    model_input['Food_Aversions'] = label_encoders['Food_Aversions'].transform(['None'])[0]

    return model_input


def create_feature_vector(model_input, feature_columns):
    features = [model_input.get(col, 0) for col in feature_columns]
    return np.array(features).reshape(1, -1)


# ============================================
# HEALTH INSIGHTS
# ============================================

def generate_health_insights(user_data, predictions):
    insights = []
    bmi      = float(user_data.get('bmi', 0))
    goal     = user_data.get('goal', '')
    diseases = user_data.get('diseases', [])
    activity = user_data.get('activityLevel', '')

    if bmi < 18.5:
        insights.append("Your BMI indicates you're underweight. Focus on nutrient-dense, calorie-rich foods to reach a healthy weight.")
    elif 25 <= bmi < 30:
        insights.append("Your BMI indicates you're overweight. A combination of balanced nutrition and regular exercise can help you reach your goals.")
    elif bmi >= 30:
        insights.append("Your BMI indicates obesity. Consider consulting with a healthcare provider for a comprehensive weight management plan.")
    else:
        insights.append("Your BMI is in the healthy range. Maintain your current lifestyle with balanced nutrition and regular activity.")

    if activity == 'sedentary':
        insights.append("Try to increase your physical activity gradually. Even 30 minutes of walking daily can make a significant difference.")
    elif activity in ['very', 'extra']:
        insights.append("Great job staying active! Make sure you're consuming enough calories and protein to support your activity level.")

    disease_tips = {
        'Diabetes':         "Monitor your carbohydrate intake and focus on low-glycemic foods to help manage blood sugar levels.",
        'Hypertension':     "Reduce sodium intake and increase potassium-rich foods like bananas and leafy greens.",
        'Heart Disease':    "Focus on heart-healthy fats like omega-3s and limit saturated fats and cholesterol.",
        'High Cholesterol': "Increase fiber intake and choose lean proteins to help manage cholesterol levels."
    }
    for disease in diseases:
        if disease in disease_tips:
            insights.append(disease_tips[disease])

    goal_tips = {
        'Weight Loss':     "Create a sustainable calorie deficit while ensuring adequate protein intake to preserve muscle mass.",
        'Muscle Building': "Prioritize protein intake (1.6-2.2g per kg body weight) and ensure you're eating enough calories to support muscle growth.",
        'Weight Gain':     "Focus on calorie-dense, nutritious foods and consider eating more frequently throughout the day."
    }
    if goal in goal_tips:
        insights.append(goal_tips[goal])

    return insights


# ============================================
# ROUTES
# ============================================

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status':        'healthy',
        'timestamp':     datetime.now().isoformat(),
        'models_loaded': len(models) > 0
    })


@app.route('/api/meal-plans', methods=['GET'])
def get_meal_plans():
    try:
        meal_plan_encoder = label_encoders.get('Recommended_Meal_Plan')
        if meal_plan_encoder:
            meal_plans = meal_plan_encoder.classes_.tolist()
        else:
            meal_plans = ['Balanced Diet', 'High-Protein Diet', 'Low-Carb Diet', 'Low-Fat Diet']
        return jsonify({'success': True, 'meal_plans': meal_plans})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/process-report', methods=['POST'])
def process_report():
    """
    Process uploaded medical report with OCR.
    Extract diseases and allergies from the document.
    """
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400

        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error':   f'File type not allowed. Supported: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400

        print(f"\n{'='*60}")
        print(f"Processing medical report: {file.filename}")
        print(f"{'='*60}")

        result = process_medical_report(file)

        if result.get('success'):
            print(f"\n✓ Successfully processed report")
            print(f"  Diseases:  {result.get('diseases', [])}")
            print(f"  Allergies: {result.get('allergies', 'None')}")

        return jsonify(result)

    except Exception as e:
        print(f"Error processing report: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Server error: {str(e)}'}), 500


@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint.

    Accepts either:
    1. JSON body  (Content-Type: application/json)
    2. Multipart form with optional file  (Content-Type: multipart/form-data)
       - 'data' field = JSON string of user inputs
       - 'file' field = optional medical report (pdf/jpg/png)

    Expected JSON fields:
        name, age, gender, height, weight, bmi,
        diseases (array), dietPreference, activityLevel,
        goal, allergies, mealsPerDay
    """
    ocr_result  = None
    data_source = 'manual'
    file        = None

    try:
        # ── Determine input mode ──────────────────────────────────────
        if request.files and 'file' in request.files:
            if 'data' not in request.form:
                return jsonify({'success': False, 'error': 'Missing data field in form'}), 400

            data = json.loads(request.form['data'])
            file = request.files['file']

            if file.filename and allowed_file(file.filename):
                data_source = 'report'
                print(f"\n{'='*60}")
                print(f"Processing uploaded medical report: {file.filename}")
                print(f"{'='*60}")

                ocr_result = process_medical_report(file)

                if ocr_result.get('success'):
                    print(f"\n✓ OCR extraction successful!")
                    print(f"  Extracted diseases:  {ocr_result.get('diseases', [])}")
                    print(f"  Extracted allergies: {ocr_result.get('allergies', '')}")

                    # Merge OCR diseases with form diseases
                    ocr_diseases = ocr_result.get('diseases', [])
                    if ocr_diseases and ocr_diseases != ['None']:
                        combined = list(set(data.get('diseases', []) + ocr_diseases))
                        if len(combined) > 1 and 'None' in combined:
                            combined.remove('None')
                        data['diseases'] = combined

                    # Append OCR allergies
                    ocr_allergies = ocr_result.get('allergies', '')
                    if ocr_allergies:
                        existing = data.get('allergies', '')
                        data['allergies'] = f"{existing}, {ocr_allergies}" if existing else ocr_allergies

                    print(f"\n✓ Final merged data:")
                    print(f"  Diseases:  {data.get('diseases', [])}")
                    print(f"  Allergies: {data.get('allergies', '')}")
                else:
                    print(f"\n⚠ OCR processing failed: {ocr_result.get('error', 'Unknown error')}")
        else:
            data = request.get_json()

        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        # ── Validate required fields ──────────────────────────────────
        required_fields = ['age', 'gender', 'height', 'weight', 'bmi', 'activityLevel']
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({
                'success': False,
                'error':   f'Missing required fields: {", ".join(missing)}'
            }), 400

        # ── Build feature vector ──────────────────────────────────────
        model_input    = map_frontend_to_model(data)
        feature_vector = create_feature_vector(model_input, metadata['feature_columns'])

        # ── Predictions ───────────────────────────────────────────────
        predictions = {
            'recommended_calories': int(models['calories'].predict(feature_vector)[0]),
            'recommended_protein':  int(models['protein'].predict(feature_vector)[0]),
            'recommended_carbs':    int(models['carbs'].predict(feature_vector)[0]),
            'recommended_fats':     int(models['fats'].predict(feature_vector)[0]),
        }

        meal_plan_encoded = models['meal_plan'].predict(feature_vector)[0]
        predictions['recommended_meal_plan'] = label_encoders['Recommended_Meal_Plan'].inverse_transform(
            [meal_plan_encoded]
        )[0]

        # Top-3 alternative plans with probabilities
        meal_plan_probs   = models['meal_plan'].predict_proba(feature_vector)[0]
        meal_plan_classes = label_encoders['Recommended_Meal_Plan'].classes_
        top_indices       = np.argsort(meal_plan_probs)[-3:][::-1]
        alternative_plans = [
            {'name': meal_plan_classes[i], 'confidence': float(meal_plan_probs[i])}
            for i in top_indices
        ]

        # Macro percentages
        total_cal   = predictions['recommended_calories']
        protein_cal = predictions['recommended_protein'] * 4
        carbs_cal   = predictions['recommended_carbs']   * 4
        fats_cal    = predictions['recommended_fats']    * 9
        macro_percentages = {
            'protein': round((protein_cal / total_cal) * 100, 1) if total_cal else 0,
            'carbs':   round((carbs_cal   / total_cal) * 100, 1) if total_cal else 0,
            'fats':    round((fats_cal    / total_cal) * 100, 1) if total_cal else 0,
        }

        # Meal breakdown
        meals_per_day    = int(data.get('mealsPerDay', 3))
        cals_per_meal    = total_cal // meals_per_day
        meal_names       = ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Evening Snack']
        meal_breakdown   = [
            {
                'name':    meal_names[i] if i < len(meal_names) else f'Meal {i+1}',
                'calories': cals_per_meal,
                'protein':  predictions['recommended_protein'] // meals_per_day,
                'carbs':    predictions['recommended_carbs']   // meals_per_day,
                'fats':     predictions['recommended_fats']    // meals_per_day,
            }
            for i in range(meals_per_day)
        ]

        health_insights = generate_health_insights(data, predictions)

        # ── Build response ────────────────────────────────────────────
        response = {
            'success':   True,
            'timestamp': datetime.now().isoformat(),
            'user_info': {
                'name':   data.get('name', 'User'),
                'age':    data.get('age'),
                'gender': data.get('gender'),
                'bmi':    float(data.get('bmi')),
                'goal':   data.get('goal', 'Maintenance')
            },
            'recommendations': {
                'daily_calories':  predictions['recommended_calories'],
                'protein_grams':   predictions['recommended_protein'],
                'carbs_grams':     predictions['recommended_carbs'],
                'fats_grams':      predictions['recommended_fats'],
                'meal_plan_type':  predictions['recommended_meal_plan']
            },
            'macro_percentages': macro_percentages,
            'meal_breakdown':    meal_breakdown,
            'alternative_plans': alternative_plans,
            'health_insights':   health_insights
        }

        # ── Save to MongoDB ───────────────────────────────────────────
        report_data_for_mongo = None
        if data_source == 'report' and ocr_result and ocr_result.get('success'):
            report_data_for_mongo = {
                'fileName':       file.filename if file else '',
                'patient_details': ocr_result.get('patient_details', {}),
                'diseases':        ocr_result.get('diseases', []),
                'allergies':       ocr_result.get('allergies', ''),
                'numerical_info':  ocr_result.get('numerical_info', {})
            }

        diet_plan_id = save_to_mongodb(data, predictions, data_source, report_data_for_mongo)
        response['diet_plan_id']       = diet_plan_id
        response['saved_to_database']  = diet_plan_id is not None
        if not diet_plan_id:
            response['note'] = 'Diet plan generated but not saved to database'

        return jsonify(response)

    except ValueError as e:
        print(f"Validation error: {str(e)}")
        import traceback; traceback.print_exc()
        return jsonify({'success': False, 'error': f'Validation error: {str(e)}'}), 400
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        import traceback; traceback.print_exc()
        return jsonify({'success': False, 'error': f'Internal server error: {str(e)}'}), 500


# ============================================
# STARTUP
# ============================================

if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("🚀 Starting Diet Recommendation API Server")
    print("=" * 50)

    if load_models():
        print("\n✓ Server is ready!")
        print("  - Calories Model  : Loaded")
        print("  - Protein Model   : Loaded")
        print("  - Carbs Model     : Loaded")
        print("  - Fats Model      : Loaded")
        print("  - Meal Plan Model : Loaded")
        print("\n" + "=" * 50)

        app.run(host='0.0.0.0', port=5001, debug=True)
    else:
        print("\n✗ Failed to load models.")
        print("  Steps to fix:")
        print("  1. Open train_model.py in Google Colab and run all cells.")
        print("  2. Download diet_models.zip when prompted.")
        print("  3. Extract it into the models/ folder next to app.py.")
        print("  4. Run app.py again.")