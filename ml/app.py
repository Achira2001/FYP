"""
Diet Recommendation API Server
==============================
Flask API that serves the trained XGBoost models for personalized
diet recommendations.

Endpoints:
- GET  /api/health          - Health check
- POST /api/predict         - Get diet recommendations
- GET  /api/meal-plans      - Get available meal plans
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import json
import numpy as np
import pandas as pd
import os
from datetime import datetime
from werkzeug.utils import secure_filename
import requests  # Add this for calling Node.js API

# Import OCR processor
from ocr_processor import process_medical_report

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# File upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Node.js backend URL for MongoDB storage
NODEJS_API_URL = 'http://localhost:5000/api/diet-plans'

# Load models and metadata at startup
MODELS_DIR = '../models'
models = {}
metadata = {}
label_encoders = {}

def allowed_file(filename):
    """Check if uploaded file has allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_to_mongodb(user_data, predictions, data_source='manual', report_data=None):
    """
    Save diet plan to MongoDB through Node.js API
    
    Args:
        user_data: Original form data from user
        predictions: ML model predictions
        data_source: 'manual' or 'report'
        report_data: OCR extracted data (if applicable)
    
    Returns:
        MongoDB document ID if successful, None otherwise
    """
    try:
        # Prepare data for MongoDB
        diet_plan_data = {
            'userInfo': {
                'name': user_data.get('name', 'User'),
                'age': int(user_data.get('age', 0)),
                'gender': user_data.get('gender', 'Other'),
                'height': float(user_data.get('height', 0)),
                'weight': float(user_data.get('weight', 0)),
                'bmi': float(user_data.get('bmi', 0)),
                'goal': user_data.get('goal', 'Maintenance')
            },
            'healthInfo': {
                'diseases': user_data.get('diseases', []),
                'allergies': user_data.get('allergies', ''),
                'activityLevel': user_data.get('activityLevel', 'moderate'),
                'dietPreference': user_data.get('dietPreference', 'Regular'),
                'mealsPerDay': int(user_data.get('mealsPerDay', 3))
            },
            'recommendations': {
                'dailyCalories': int(predictions['recommended_calories']),
                'proteinGrams': int(predictions['recommended_protein']),
                'carbsGrams': int(predictions['recommended_carbs']),
                'fatsGrams': int(predictions['recommended_fats']),
                'mealPlanType': predictions['recommended_meal_plan']
            },
            'macroPercentages': predictions.get('macro_percentages', {}),
            'mealBreakdown': predictions.get('meal_breakdown', []),
            'healthInsights': predictions.get('health_insights', []),
            'dataSource': data_source
        }
        
        # Add report data if available
        if report_data:
            diet_plan_data['reportData'] = {
                'fileName': report_data.get('fileName', ''),
                'uploadDate': datetime.now().isoformat(),
                'extractedData': {
                    'patientDetails': report_data.get('patient_details', {}),
                    'diseases': report_data.get('diseases', []),
                    'allergies': report_data.get('allergies', ''),
                    'numericalInfo': report_data.get('numerical_info', {})
                }
            }
        
        # Send to Node.js API
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
                print(f"✓ Diet plan saved to MongoDB!")
                print(f"  ID: {diet_plan_id}")
                return diet_plan_id
            else:
                print(f"✗ MongoDB save failed: {result.get('message')}")
                return None
        else:
            print(f"✗ MongoDB API error: {response.status_code}")
            print(f"  Response: {response.text}")
            return None
    
    except requests.exceptions.ConnectionError:
        print("✗ Could not connect to Node.js backend (MongoDB storage)")
        print("  Make sure Node.js server is running on port 5000")
        return None
    except Exception as e:
        print(f"✗ Error saving to MongoDB: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def load_models():
    """Load all trained models and metadata"""
    global models, metadata, label_encoders
    
    try:
        # Load regression models
        models['calories'] = joblib.load(os.path.join(MODELS_DIR, 'calories_model.joblib'))
        models['protein'] = joblib.load(os.path.join(MODELS_DIR, 'protein_model.joblib'))
        models['carbs'] = joblib.load(os.path.join(MODELS_DIR, 'carbs_model.joblib'))
        models['fats'] = joblib.load(os.path.join(MODELS_DIR, 'fats_model.joblib'))
        
        # Load classification model
        models['meal_plan'] = joblib.load(os.path.join(MODELS_DIR, 'meal_plan_model.joblib'))
        
        # Load metadata
        with open(os.path.join(MODELS_DIR, 'metadata.json'), 'r') as f:
            metadata = json.load(f)
        
        # Load label encoders
        label_encoders = joblib.load(os.path.join(MODELS_DIR, 'label_encoders.joblib'))
        
        print("✓ Models loaded successfully!")
        return True
    except Exception as e:
        print(f"✗ Error loading models: {str(e)}")
        return False

def map_frontend_to_model(frontend_data):
    """
    Map frontend form data to model features
    
    Frontend sends:
    - name, age, gender, height, weight, bmi
    - diseases (array), dietPreference, activityLevel, goal
    - allergies, mealsPerDay
    
    Model expects:
    - All features from the training dataset
    """
    
    # Initialize with default values
    model_input = {}
    
    # Direct mappings
    model_input['Age'] = int(frontend_data.get('age', 30))
    model_input['Height_cm'] = float(frontend_data.get('height', 170))
    model_input['Weight_kg'] = float(frontend_data.get('weight', 70))
    model_input['BMI'] = float(frontend_data.get('bmi', 24.0))
    
    # Gender mapping
    gender = frontend_data.get('gender', 'Other')
    try:
        model_input['Gender'] = label_encoders['Gender'].transform([gender])[0]
    except ValueError:
        # Gender not in training data, use 'Other' as fallback
        model_input['Gender'] = label_encoders['Gender'].transform(['Other'])[0]
    
    # Chronic Disease (take first disease or 'None')
    diseases = frontend_data.get('diseases', [])
    chronic_disease = diseases[0] if diseases and diseases[0] != 'None' else 'None'
    
    # Handle unknown diseases - use 'None' if not in encoder
    try:
        model_input['Chronic_Disease'] = label_encoders['Chronic_Disease'].transform([chronic_disease])[0]
    except ValueError:
        # Disease not in training data, use 'None' as fallback
        model_input['Chronic_Disease'] = label_encoders['Chronic_Disease'].transform(['None'])[0]
    
    # Allergies
    allergies = frontend_data.get('allergies', '').strip()
    if not allergies:
        allergies = 'None'
    try:
        model_input['Allergies'] = label_encoders['Allergies'].transform([allergies])[0]
    except:
        model_input['Allergies'] = label_encoders['Allergies'].transform(['None'])[0]
    
    # Dietary Habits (from dietPreference)
    diet_pref = frontend_data.get('dietPreference', 'Regular')
    try:
        model_input['Dietary_Habits'] = label_encoders['Dietary_Habits'].transform([diet_pref])[0]
    except ValueError:
        # Diet preference not in training data, use 'Regular' as fallback
        model_input['Dietary_Habits'] = label_encoders['Dietary_Habits'].transform(['Regular'])[0]
    
    # Activity Level - map to Exercise Frequency (0-6 days/week)
    activity_mapping = {
        'sedentary': 0,
        'light': 2,
        'moderate': 4,
        'very': 6,
        'extra': 6
    }
    activity = frontend_data.get('activityLevel', 'moderate')
    model_input['Exercise_Frequency'] = activity_mapping.get(activity, 3)
    
    # Estimated defaults for other features
    # In a real application, you might want to collect these or use population averages
    
    # Blood Pressure (systolic, diastolic)
    model_input['Blood_Pressure_Systolic'] = 120
    model_input['Blood_Pressure_Diastolic'] = 80
    
    # Adjust BP for hypertension
    if chronic_disease == 'Hypertension':
        model_input['Blood_Pressure_Systolic'] = 140
        model_input['Blood_Pressure_Diastolic'] = 90
    
    # Cholesterol (normal: ~200, high: >240)
    model_input['Cholesterol_Level'] = 200
    if chronic_disease == 'High Cholesterol' or chronic_disease == 'Heart Disease':
        model_input['Cholesterol_Level'] = 250
    
    # Blood Sugar (normal: 70-100, diabetes: >126 fasting)
    model_input['Blood_Sugar_Level'] = 95
    if chronic_disease == 'Diabetes':
        model_input['Blood_Sugar_Level'] = 180
    
    # Genetic Risk Factor
    genetic_risk = 'Yes' if chronic_disease in ['Heart Disease', 'Diabetes', 'Hypertension'] else 'No'
    model_input['Genetic_Risk_Factor'] = label_encoders['Genetic_Risk_Factor'].transform([genetic_risk])[0]
    
    # Daily Steps - estimate from activity level
    steps_mapping = {
        'sedentary': 3000,
        'light': 6000,
        'moderate': 9000,
        'very': 12000,
        'extra': 15000
    }
    model_input['Daily_Steps'] = steps_mapping.get(activity, 7000)
    
    # Sleep Hours (average 7)
    model_input['Sleep_Hours'] = 7.0
    
    # Lifestyle factors
    model_input['Alcohol_Consumption'] = label_encoders['Alcohol_Consumption'].transform(['No'])[0]
    model_input['Smoking_Habit'] = label_encoders['Smoking_Habit'].transform(['No'])[0]
    
    # Current intake - estimate based on BMI and activity
    # Sedentary TDEE ≈ BMR × 1.2, Active ≈ BMR × 1.8
    # Rough BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5 (male) or -161 (female)
    bmr = (10 * model_input['Weight_kg'] + 
           6.25 * model_input['Height_cm'] - 
           5 * model_input['Age'])
    if gender == 'Male':
        bmr += 5
    else:
        bmr -= 161
    
    activity_multiplier = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'very': 1.725,
        'extra': 1.9
    }
    tdee = bmr * activity_multiplier.get(activity, 1.55)
    
    model_input['Caloric_Intake'] = int(tdee)
    model_input['Protein_Intake'] = int(tdee * 0.25 / 4)  # 25% of calories, 4 cal/g
    model_input['Carbohydrate_Intake'] = int(tdee * 0.45 / 4)  # 45% of calories
    model_input['Fat_Intake'] = int(tdee * 0.30 / 9)  # 30% of calories, 9 cal/g
    
    # Preferred Cuisine (default to Western)
    try:
        model_input['Preferred_Cuisine'] = label_encoders['Preferred_Cuisine'].transform(['Western'])[0]
    except ValueError:
        # If 'Western' doesn't exist, use first available cuisine
        first_cuisine = label_encoders['Preferred_Cuisine'].classes_[0]
        model_input['Preferred_Cuisine'] = label_encoders['Preferred_Cuisine'].transform([first_cuisine])[0]
    
    # Food Aversions
    model_input['Food_Aversions'] = label_encoders['Food_Aversions'].transform(['None'])[0]
    
    return model_input

def create_feature_vector(model_input, feature_columns):
    """
    Create a feature vector in the correct order for the model
    """
    features = []
    for col in feature_columns:
        features.append(model_input.get(col, 0))
    
    return np.array(features).reshape(1, -1)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'models_loaded': len(models) > 0
    })

@app.route('/api/meal-plans', methods=['GET'])
def get_meal_plans():
    """Get list of available meal plans"""
    try:
        meal_plan_encoder = label_encoders.get('Recommended_Meal_Plan')
        if meal_plan_encoder:
            meal_plans = meal_plan_encoder.classes_.tolist()
        else:
            meal_plans = ['Balanced Diet', 'High-Protein Diet', 'Low-Carb Diet', 
                         'Low-Fat Diet', 'Mediterranean Diet']
        
        return jsonify({
            'success': True,
            'meal_plans': meal_plans
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/process-report', methods=['POST'])
def process_report():
    """
    Process uploaded medical report with OCR
    Extract diseases and allergies from the document
    """
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file uploaded'
            }), 400
        
        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Validate file type
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': f'File type not allowed. Supported: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400
        
        # Process the medical report
        print(f"\n{'='*60}")
        print(f"Processing medical report: {file.filename}")
        print(f"{'='*60}")
        
        result = process_medical_report(file)
        
        if result.get('success'):
            print(f"\n✓ Successfully processed report")
            print(f"  Diseases: {result.get('diseases', [])}")
            print(f"  Allergies: {result.get('allergies', 'None')}")
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Error processing report: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint
    
    Accepts either:
    1. JSON data only (Content-Type: application/json)
    2. Form data with optional file upload (Content-Type: multipart/form-data)
    
    Expected JSON format:
    {
        "name": "John Doe",
        "age": "25",
        "gender": "Male",
        "height": "175",
        "weight": "70",
        "bmi": "22.86",
        "diseases": ["None"],
        "dietPreference": "Regular",
        "activityLevel": "moderate",
        "goal": "Maintenance",
        "allergies": "",
        "mealsPerDay": "3"
    }
    
    For form data, send the JSON as 'data' field and file as 'file' field
    """
    try:
        # Check if this is a file upload (multipart/form-data)
        if request.files and 'file' in request.files:
            # Get JSON data from form
            if 'data' in request.form:
                data = json.loads(request.form['data'])
            else:
                return jsonify({
                    'success': False,
                    'error': 'Missing data field in form'
                }), 400
            
            # Process uploaded file
            file = request.files['file']
            if file.filename and allowed_file(file.filename):
                print(f"\n{'='*60}")
                print(f"Processing uploaded medical report: {file.filename}")
                print(f"{'='*60}")
                
                ocr_result = process_medical_report(file)
                
                if ocr_result.get('success'):
                    # Merge OCR results with form data
                    print(f"\n✓ OCR extraction successful!")
                    print(f"  Extracted diseases: {ocr_result.get('diseases', [])}")
                    print(f"  Extracted allergies: {ocr_result.get('allergies', '')}")
                    
                    # Update diseases - merge with existing
                    ocr_diseases = ocr_result.get('diseases', [])
                    if ocr_diseases and ocr_diseases != ['None']:
                        existing_diseases = data.get('diseases', [])
                        # Combine and remove duplicates
                        combined_diseases = list(set(existing_diseases + ocr_diseases))
                        # Remove 'None' if other diseases exist
                        if len(combined_diseases) > 1 and 'None' in combined_diseases:
                            combined_diseases.remove('None')
                        data['diseases'] = combined_diseases
                    
                    # Update allergies - append to existing
                    ocr_allergies = ocr_result.get('allergies', '')
                    if ocr_allergies:
                        existing_allergies = data.get('allergies', '')
                        if existing_allergies:
                            data['allergies'] = f"{existing_allergies}, {ocr_allergies}"
                        else:
                            data['allergies'] = ocr_allergies
                    
                    print(f"\n✓ Final merged data:")
                    print(f"  Diseases: {data.get('diseases', [])}")
                    print(f"  Allergies: {data.get('allergies', '')}")
                else:
                    print(f"\n⚠ OCR processing failed: {ocr_result.get('error', 'Unknown error')}")
                    # Continue with form data only
        else:
            # Regular JSON request
            data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Validate required fields
        required_fields = ['age', 'gender', 'height', 'weight', 'bmi', 'activityLevel']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Map frontend data to model features
        model_input = map_frontend_to_model(data)
        
        # Create feature vector
        feature_vector = create_feature_vector(model_input, metadata['feature_columns'])
        
        # Make predictions
        predictions = {}
        
        # Regression predictions
        predictions['recommended_calories'] = int(models['calories'].predict(feature_vector)[0])
        predictions['recommended_protein'] = int(models['protein'].predict(feature_vector)[0])
        predictions['recommended_carbs'] = int(models['carbs'].predict(feature_vector)[0])
        predictions['recommended_fats'] = int(models['fats'].predict(feature_vector)[0])
        
        # Classification prediction
        meal_plan_encoded = models['meal_plan'].predict(feature_vector)[0]
        meal_plan_name = label_encoders['Recommended_Meal_Plan'].inverse_transform([meal_plan_encoded])[0]
        predictions['recommended_meal_plan'] = meal_plan_name
        
        # Get prediction probabilities for meal plan
        meal_plan_probs = models['meal_plan'].predict_proba(feature_vector)[0]
        meal_plan_classes = label_encoders['Recommended_Meal_Plan'].classes_
        
        # Get top 3 meal plans with probabilities
        top_indices = np.argsort(meal_plan_probs)[-3:][::-1]
        alternative_plans = [
            {
                'name': meal_plan_classes[idx],
                'confidence': float(meal_plan_probs[idx])
            }
            for idx in top_indices
        ]
        
        # Calculate macronutrient percentages
        total_calories = predictions['recommended_calories']
        protein_cals = predictions['recommended_protein'] * 4
        carbs_cals = predictions['recommended_carbs'] * 4
        fats_cals = predictions['recommended_fats'] * 9
        
        macro_percentages = {
            'protein': round((protein_cals / total_calories) * 100, 1) if total_calories > 0 else 0,
            'carbs': round((carbs_cals / total_calories) * 100, 1) if total_calories > 0 else 0,
            'fats': round((fats_cals / total_calories) * 100, 1) if total_calories > 0 else 0
        }
        
        # Create meal breakdown based on mealsPerDay
        meals_per_day = int(data.get('mealsPerDay', 3))
        calories_per_meal = total_calories // meals_per_day
        
        meal_breakdown = []
        meal_names = ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Evening Snack']
        
        for i in range(meals_per_day):
            meal_breakdown.append({
                'name': meal_names[i] if i < len(meal_names) else f'Meal {i+1}',
                'calories': calories_per_meal,
                'protein': predictions['recommended_protein'] // meals_per_day,
                'carbs': predictions['recommended_carbs'] // meals_per_day,
                'fats': predictions['recommended_fats'] // meals_per_day
            })
        
        # Create response
        response = {
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'user_info': {
                'name': data.get('name', 'User'),
                'age': data.get('age'),
                'gender': data.get('gender'),
                'bmi': float(data.get('bmi')),
                'goal': data.get('goal', 'Maintenance')
            },
            'recommendations': {
                'daily_calories': predictions['recommended_calories'],
                'protein_grams': predictions['recommended_protein'],
                'carbs_grams': predictions['recommended_carbs'],
                'fats_grams': predictions['recommended_fats'],
                'meal_plan_type': predictions['recommended_meal_plan']
            },
            'macro_percentages': macro_percentages,
            'meal_breakdown': meal_breakdown,
            'alternative_plans': alternative_plans,
            'health_insights': generate_health_insights(data, predictions)
        }
        
        # Save to MongoDB through Node.js API
        data_source = 'report' if (request.files and 'file' in request.files) else 'manual'
        report_data_for_mongo = None
        
        if data_source == 'report' and ocr_result and ocr_result.get('success'):
            report_data_for_mongo = {
                'fileName': file.filename if file else '',
                'patient_details': ocr_result.get('patient_details', {}),
                'diseases': ocr_result.get('diseases', []),
                'allergies': ocr_result.get('allergies', ''),
                'numerical_info': ocr_result.get('numerical_info', {})
            }
        
        # Try to save to MongoDB
        diet_plan_id = save_to_mongodb(data, predictions, data_source, report_data_for_mongo)
        
        # Add MongoDB ID to response if successful
        if diet_plan_id:
            response['diet_plan_id'] = diet_plan_id
            response['saved_to_database'] = True
        else:
            response['saved_to_database'] = False
            response['note'] = 'Diet plan generated but not saved to database'
        
        return jsonify(response)
    
    except ValueError as e:
        print(f"Validation error in prediction: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Validation error: {str(e)}'
        }), 400
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

def generate_health_insights(user_data, predictions):
    """Generate personalized health insights based on user data"""
    insights = []
    
    bmi = float(user_data.get('bmi', 0))
    goal = user_data.get('goal', '')
    diseases = user_data.get('diseases', [])
    activity = user_data.get('activityLevel', '')
    
    # BMI insights
    if bmi < 18.5:
        insights.append("Your BMI indicates you're underweight. Focus on nutrient-dense, calorie-rich foods to reach a healthy weight.")
    elif bmi >= 25 and bmi < 30:
        insights.append("Your BMI indicates you're overweight. A combination of balanced nutrition and regular exercise can help you reach your goals.")
    elif bmi >= 30:
        insights.append("Your BMI indicates obesity. Consider consulting with a healthcare provider for a comprehensive weight management plan.")
    else:
        insights.append("Your BMI is in the healthy range. Maintain your current lifestyle with balanced nutrition and regular activity.")
    
    # Activity insights
    if activity == 'sedentary':
        insights.append("Try to increase your physical activity gradually. Even 30 minutes of walking daily can make a significant difference.")
    elif activity in ['very', 'extra']:
        insights.append("Great job staying active! Make sure you're consuming enough calories and protein to support your activity level.")
    
    # Disease-specific insights
    if diseases:
        for disease in diseases:
            if disease == 'Diabetes':
                insights.append("Monitor your carbohydrate intake and focus on low-glycemic foods to help manage blood sugar levels.")
            elif disease == 'Hypertension':
                insights.append("Reduce sodium intake and increase potassium-rich foods like bananas and leafy greens.")
            elif disease == 'Heart Disease':
                insights.append("Focus on heart-healthy fats like omega-3s and limit saturated fats and cholesterol.")
            elif disease == 'High Cholesterol':
                insights.append("Increase fiber intake and choose lean proteins to help manage cholesterol levels.")
    
    # Goal insights
    if goal == 'Weight Loss':
        insights.append("Create a sustainable calorie deficit while ensuring adequate protein intake to preserve muscle mass.")
    elif goal == 'Muscle Building':
        insights.append("Prioritize protein intake (1.6-2.2g per kg body weight) and ensure you're eating enough calories to support muscle growth.")
    elif goal == 'Weight Gain':
        insights.append("Focus on calorie-dense, nutritious foods and consider eating more frequently throughout the day.")
    
    return insights

# Initialize models on startup
if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("🚀 Starting Diet Recommendation API Server")
    print("=" * 50)
    
    if load_models():
        print("\n✓ Server is ready!")
        print("  - Calories Model: Loaded")
        print("  - Protein Model: Loaded")
        print("  - Carbs Model: Loaded")
        print("  - Fats Model: Loaded")
        print("  - Meal Plan Model: Loaded")
        print("\n" + "=" * 50)
        
        # Run the server
        app.run(
            host='0.0.0.0',
            port=5001,  # Use port 5001 (different from your Node.js backend)
            debug=True
        )
    else:
        print("\n✗ Failed to load models. Please run train_model.py first!")
        print("  Command: python train_model.py")