"""
API Testing Script
==================
Test the diet recommendation API to ensure it's working correctly.

Usage:
    python test_api.py
"""

import requests
import json
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:5001/api"

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

def test_health_check():
    """Test the health check endpoint"""
    print_section("TEST 1: Health Check")
    
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print("✓ Health check passed!")
            print(f"  Status: {data.get('status')}")
            print(f"  Models Loaded: {data.get('models_loaded')}")
            print(f"  Timestamp: {data.get('timestamp')}")
            return True
        else:
            print(f"✗ Health check failed with status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to API server!")
        print("  Make sure the Flask server is running on http://localhost:5001")
        return False
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def test_meal_plans():
    """Test the meal plans endpoint"""
    print_section("TEST 2: Get Meal Plans")
    
    try:
        response = requests.get(f"{API_BASE_URL}/meal-plans", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                meal_plans = data.get('meal_plans', [])
                print(f"✓ Found {len(meal_plans)} meal plan types:")
                for plan in meal_plans:
                    print(f"  - {plan}")
                return True
            else:
                print("✗ API returned success=False")
                return False
        else:
            print(f"✗ Request failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def test_prediction():
    """Test the prediction endpoint with sample data"""
    print_section("TEST 3: Get Diet Recommendations")
    
    # Sample patient data
    test_data = {
        "name": "Test User",
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
    
    print("\nSending test data:")
    print(json.dumps(test_data, indent=2))
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/predict",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                print("\n✓ Prediction successful!")
                
                # User info
                print("\n📋 User Profile:")
                user_info = data.get('user_info', {})
                print(f"  Name: {user_info.get('name')}")
                print(f"  Age: {user_info.get('age')} years")
                print(f"  Gender: {user_info.get('gender')}")
                print(f"  BMI: {user_info.get('bmi')}")
                print(f"  Goal: {user_info.get('goal')}")
                
                # Recommendations
                print("\n🎯 Recommendations:")
                recs = data.get('recommendations', {})
                print(f"  Daily Calories: {recs.get('daily_calories')} kcal")
                print(f"  Protein: {recs.get('protein_grams')} g")
                print(f"  Carbs: {recs.get('carbs_grams')} g")
                print(f"  Fats: {recs.get('fats_grams')} g")
                print(f"  Meal Plan Type: {recs.get('meal_plan_type')}")
                
                # Macros
                print("\n📊 Macronutrient Distribution:")
                macros = data.get('macro_percentages', {})
                print(f"  Protein: {macros.get('protein')}%")
                print(f"  Carbs: {macros.get('carbs')}%")
                print(f"  Fats: {macros.get('fats')}%")
                
                # Meal breakdown
                print("\n🍽️ Meal Breakdown:")
                meals = data.get('meal_breakdown', [])
                for meal in meals:
                    print(f"  {meal.get('name')}: {meal.get('calories')} kcal")
                    print(f"    P: {meal.get('protein')}g | C: {meal.get('carbs')}g | F: {meal.get('fats')}g")
                
                # Health insights
                insights = data.get('health_insights', [])
                if insights:
                    print("\n💡 Health Insights:")
                    for i, insight in enumerate(insights, 1):
                        print(f"  {i}. {insight}")
                
                return True
            else:
                print("✗ API returned success=False")
                print(f"  Error: {data.get('error')}")
                return False
        else:
            print(f"✗ Request failed with status code: {response.status_code}")
            try:
                error_data = response.json()
                print(f"  Error: {error_data.get('error')}")
            except:
                print(f"  Response: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def test_different_scenarios():
    """Test various user scenarios"""
    print_section("TEST 4: Different User Scenarios")
    
    scenarios = [
        {
            "name": "Weight Loss Scenario",
            "data": {
                "name": "Sarah",
                "age": "30",
                "gender": "Female",
                "height": "165",
                "weight": "85",
                "bmi": "31.22",
                "diseases": ["Obesity"],
                "dietPreference": "Low-Carb",
                "activityLevel": "light",
                "goal": "Weight Loss",
                "allergies": "",
                "mealsPerDay": "4"
            }
        },
        {
            "name": "Muscle Building Scenario",
            "data": {
                "name": "Mike",
                "age": "22",
                "gender": "Male",
                "height": "180",
                "weight": "75",
                "bmi": "23.15",
                "diseases": ["None"],
                "dietPreference": "High-Protein",
                "activityLevel": "very",
                "goal": "Muscle Building",
                "allergies": "",
                "mealsPerDay": "5"
            }
        },
        {
            "name": "Diabetes Management Scenario",
            "data": {
                "name": "Robert",
                "age": "55",
                "gender": "Male",
                "height": "172",
                "weight": "88",
                "bmi": "29.75",
                "diseases": ["Diabetes"],
                "dietPreference": "Vegetarian",
                "activityLevel": "moderate",
                "goal": "Health Improvement",
                "allergies": "",
                "mealsPerDay": "3"
            }
        }
    ]
    
    results = []
    
    for scenario in scenarios:
        print(f"\n🔹 Testing: {scenario['name']}")
        
        try:
            response = requests.post(
                f"{API_BASE_URL}/predict",
                json=scenario['data'],
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    recs = data.get('recommendations', {})
                    print(f"  ✓ Calories: {recs.get('daily_calories')} kcal")
                    print(f"  ✓ Meal Plan: {recs.get('meal_plan_type')}")
                    results.append(True)
                else:
                    print(f"  ✗ Failed: {data.get('error')}")
                    results.append(False)
            else:
                print(f"  ✗ HTTP Error: {response.status_code}")
                results.append(False)
        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
            results.append(False)
    
    passed = sum(results)
    total = len(results)
    print(f"\n{'✓' if passed == total else '✗'} Passed {passed}/{total} scenarios")
    
    return passed == total

def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("  DIET RECOMMENDATION API TEST SUITE")
    print("=" * 60)
    print(f"\nTesting API at: {API_BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {
        "Health Check": test_health_check(),
        "Meal Plans": test_meal_plans(),
        "Prediction": test_prediction(),
        "Scenarios": test_different_scenarios()
    }
    
    # Summary
    print_section("TEST SUMMARY")
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = "✓ PASSED" if result else "✗ FAILED"
        print(f"{status}: {test_name}")
    
    print("\n" + "=" * 60)
    if passed == total:
        print(f"  ✅ ALL TESTS PASSED ({passed}/{total})")
        print("  Your API is working perfectly!")
    else:
        print(f"  ⚠️  SOME TESTS FAILED ({passed}/{total})")
        print("  Please check the errors above.")
    print("=" * 60)
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)