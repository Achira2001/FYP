

 
MEAL_PLAN_CLASSES = ['Balanced Diet', 'High-Protein Diet', 'Low-Carb Diet', 'Low-Fat Diet']
 
def predict_meal_plan(row: dict) -> str:

    disease  = str(row.get('Chronic_Disease', ''))
    diet     = str(row.get('Dietary_Habits', ''))
    chol     = float(row.get('Cholesterol_Level', 0))
    sugar    = float(row.get('Blood_Sugar_Level', 0))
    bmi      = float(row.get('BMI', 0))
    exercise = float(row.get('Exercise_Frequency', 0))
    bp_sys   = float(row.get('Blood_Pressure_Systolic', 0))
 
    if diet == 'Keto':                                         return 'Low-Carb Diet'
    if diet in ('Vegan', 'Vegetarian', 'Mediterranean'):       return 'Balanced Diet'
    if 'Diabetes' in disease or sugar > 180:                   return 'Low-Carb Diet'
    if 'Heart Disease' in disease or chol > 240:               return 'Low-Fat Diet'
    if 'Obesity' in disease or (bmi > 30 and exercise >= 3):  return 'High-Protein Diet'
    if 'Hypertension' in disease or bp_sys > 140:             return 'Balanced Diet'
    if exercise >= 4:                                          return 'High-Protein Diet'
    return 'Balanced Diet'
