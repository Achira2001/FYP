"""
Medical Report OCR and Disease Extraction Module
================================================
This module handles:
- OCR text extraction from PDF and image files
- Disease/medical condition identification
- Medical term extraction using NLP

Dependencies:
- Tesseract OCR (must be installed on system)
- pytesseract, pdf2image, PyPDF2, Pillow
"""

import os
import re
import io
from PIL import Image
import pytesseract
import PyPDF2
from pdf2image import convert_from_bytes
import cv2
import numpy as np
from fuzzywuzzy import fuzz, process

# ============================================
# CONFIGURATION
# ============================================

# Common medical conditions and their variations
DISEASE_KEYWORDS = {
    'Diabetes': [
        'diabetes', 'diabetic', 'dm type', 'type 1 diabetes', 'type 2 diabetes',
        'diabetes mellitus', 't1dm', 't2dm', 'insulin dependent', 'niddm', 'iddm',
        'high blood sugar', 'hyperglycemia', 'glucose intolerance'
    ],
    'Hypertension': [
        'hypertension', 'high blood pressure', 'hbp', 'elevated bp',
        'high bp', 'arterial hypertension', 'essential hypertension'
    ],
    'Heart Disease': [
        'heart disease', 'cardiac', 'cardiovascular disease', 'cvd', 'coronary',
        'heart attack', 'myocardial infarction', 'angina', 'coronary artery disease',
        'cad', 'heart failure', 'chf', 'arrhythmia'
    ],
    'Obesity': [
        'obesity', 'obese', 'overweight', 'morbid obesity', 'bmi >30',
        'excess weight', 'adiposity'
    ],
    'High Cholesterol': [
        'high cholesterol', 'hypercholesterolemia', 'hyperlipidemia',
        'elevated cholesterol', 'high ldl', 'dyslipidemia', 'cholesterol >240'
    ],
    'Kidney Disease': [
        'kidney disease', 'renal disease', 'ckd', 'chronic kidney disease',
        'renal failure', 'kidney failure', 'nephropathy', 'renal impairment'
    ],
    'Liver Disease': [
        'liver disease', 'hepatic', 'cirrhosis', 'hepatitis', 'fatty liver',
        'nafld', 'liver failure', 'hepatic dysfunction'
    ],
    'Thyroid Disorder': [
        'thyroid', 'hypothyroid', 'hyperthyroid', 'thyroid disease',
        'hashimoto', 'graves disease', 'thyroid dysfunction', 'tsh abnormal'
    ],
    'PCOS': [
        'pcos', 'polycystic ovary', 'polycystic ovarian syndrome',
        'ovarian cysts', 'pcod'
    ],
    'Anemia': [
        'anemia', 'anaemia', 'iron deficiency', 'low hemoglobin',
        'low hb', 'hemoglobin <12', 'anemic'
    ],
    'Gluten Intolerance': [
        'gluten intolerance', 'celiac', 'coeliac', 'gluten sensitivity',
        'wheat allergy', 'gluten allergy'
    ],
    'Lactose Intolerance': [
        'lactose intolerance', 'lactose malabsorption', 'dairy intolerance',
        'milk intolerance'
    ],
    'Nut Allergy': [
        'nut allergy', 'peanut allergy', 'tree nut allergy',
        'allergic to nuts', 'nut sensitivity'
    ],
    'Osteoporosis': [
        'osteoporosis', 'bone density loss', 'low bone density',
        'osteopenia', 'brittle bones'
    ]
}

# Allergy keywords
ALLERGY_KEYWORDS = [
    'peanut', 'peanuts', 'tree nut', 'nuts', 'walnut', 'almond', 'cashew',
    'shellfish', 'shrimp', 'crab', 'lobster', 'fish',
    'milk', 'dairy', 'lactose', 'cheese', 'butter',
    'egg', 'eggs',
    'wheat', 'gluten',
    'soy', 'soya',
    'sesame',
    'penicillin', 'aspirin', 'sulfa'
]

# ============================================
# TESSERACT PATH CONFIGURATION
# ============================================

def setup_tesseract():
    """
    Configure Tesseract OCR path based on operating system
    """
    # Common Tesseract paths
    common_paths = [
        r'C:\Program Files\Tesseract-OCR\tesseract.exe',  # Windows default
        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
        '/usr/bin/tesseract',  # Linux default
        '/usr/local/bin/tesseract',  # MacOS with Homebrew
        '/opt/homebrew/bin/tesseract'  # MacOS M1/M2
    ]
    
    # Try to find Tesseract
    for path in common_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            return True
    
    # If not found, assume it's in PATH
    return True

# Initialize Tesseract
setup_tesseract()

# ============================================
# IMAGE PREPROCESSING
# ============================================

def preprocess_image(image):
    """
    Preprocess image for better OCR accuracy
    - Convert to grayscale
    - Apply thresholding
    - Denoise
    """
    # Convert PIL Image to numpy array
    img_array = np.array(image)
    
    # Convert to grayscale if needed
    if len(img_array.shape) == 3:
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    else:
        gray = img_array
    
    # Apply thresholding to get black text on white background
    _, threshold = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Denoise
    denoised = cv2.fastNlMeansDenoising(threshold, None, 10, 7, 21)
    
    # Convert back to PIL Image
    return Image.fromarray(denoised)

# ============================================
# TEXT EXTRACTION
# ============================================

def extract_text_from_image(image_file):
    """
    Extract text from image file using OCR
    """
    try:
        print("\n→ Opening image file...")
        # Open image
        image = Image.open(image_file)
        print(f"  Image size: {image.size}")
        print(f"  Image mode: {image.mode}")
        
        # Check if Tesseract is available
        try:
            version = pytesseract.get_tesseract_version()
            print(f"  Tesseract version: {version}")
        except Exception as e:
            print(f"  ⚠️  WARNING: Tesseract not found!")
            print(f"     Error: {str(e)}")
            print(f"     Please install Tesseract OCR:")
            print(f"       Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki")
            print(f"       Mac: brew install tesseract")
            print(f"       Linux: sudo apt-get install tesseract-ocr")
            return ""
        
        print("\n→ Preprocessing image...")
        # Preprocess for better OCR
        processed_image = preprocess_image(image)
        
        print("\n→ Running Tesseract OCR...")
        # Extract text using Tesseract
        text = pytesseract.image_to_string(processed_image, config='--psm 6')
        
        print(f"\n✓ Extracted {len(text)} characters")
        if len(text) > 0:
            print(f"  First 200 chars: {text[:200]}")
        else:
            print("  ⚠️  No text extracted! Image may be:")
            print("     - Too blurry or low quality")
            print("     - Handwritten text (not supported)")
            print("     - Wrong format/encoding")
        
        return text.strip()
    
    except Exception as e:
        print(f"\n✗ Error extracting text from image: {str(e)}")
        import traceback
        traceback.print_exc()
        return ""

def extract_text_from_pdf(pdf_file):
    """
    Extract text from PDF file
    - First try PyPDF2 for text-based PDFs
    - If that fails, use OCR on images
    """
    try:
        # Try reading as text-based PDF first
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        
        # If we got substantial text, return it
        if len(text.strip()) > 100:
            return text.strip()
        
        # Otherwise, PDF is image-based, use OCR
        print("PDF appears to be image-based, using OCR...")
        pdf_file.seek(0)  # Reset file pointer
        
        # Convert PDF pages to images
        images = convert_from_bytes(pdf_file.read())
        
        text = ""
        for i, image in enumerate(images):
            print(f"  Processing page {i+1}/{len(images)}...")
            processed_image = preprocess_image(image)
            page_text = pytesseract.image_to_string(processed_image)
            text += page_text + "\n"
        
        return text.strip()
    
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        return ""

def extract_text_from_file(file):
    """
    Main function to extract text from uploaded file
    Supports: PDF, JPG, JPEG, PNG
    """
    filename = file.filename.lower()
    
    print(f"\n{'='*50}")
    print(f"Extracting text from: {file.filename}")
    print(f"{'='*50}")
    
    # Reset file pointer
    file.seek(0)
    
    if filename.endswith('.pdf'):
        text = extract_text_from_pdf(file)
    elif filename.endswith(('.jpg', '.jpeg', '.png')):
        text = extract_text_from_image(file)
    else:
        print(f"Unsupported file type: {filename}")
        return ""
    
    print(f"\nExtracted {len(text)} characters of text")
    return text

# ============================================
# DISEASE EXTRACTION
# ============================================

def find_diseases_in_text(text):
    """
    Find disease mentions in extracted text using fuzzy matching
    """
    text_lower = text.lower()
    found_diseases = set()
    
    # Check each disease and its variations
    for disease, keywords in DISEASE_KEYWORDS.items():
        for keyword in keywords:
            # Use fuzzy matching for flexibility
            if keyword.lower() in text_lower:
                found_diseases.add(disease)
                break
            
            # Also try fuzzy matching for misspellings
            words = text_lower.split()
            for word in words:
                if len(word) > 3:  # Only check substantial words
                    similarity = fuzz.ratio(keyword.lower(), word)
                    if similarity > 85:  # 85% similarity threshold
                        found_diseases.add(disease)
                        break
    
    return list(found_diseases)

def find_allergies_in_text(text):
    """
    Find allergy mentions in extracted text
    """
    text_lower = text.lower()
    found_allergies = []
    
    # Look for allergy section
    allergy_patterns = [
        r'allergies?:\s*([^\n]+)',
        r'allergic to:\s*([^\n]+)',
        r'known allergies?:\s*([^\n]+)',
        r'drug allergies?:\s*([^\n]+)',
        r'food allergies?:\s*([^\n]+)'
    ]
    
    for pattern in allergy_patterns:
        matches = re.finditer(pattern, text_lower)
        for match in matches:
            allergy_text = match.group(1)
            
            # Check for specific allergy keywords
            for allergy_keyword in ALLERGY_KEYWORDS:
                if allergy_keyword in allergy_text:
                    found_allergies.append(allergy_keyword.title())
    
    # Also check for "allergic to X" patterns
    allergic_pattern = r'allergic to ([a-z\s,]+)'
    matches = re.finditer(allergic_pattern, text_lower)
    for match in matches:
        items = match.group(1).split(',')
        for item in items:
            item = item.strip()
            if item and len(item) > 2:
                found_allergies.append(item.title())
    
    return list(set(found_allergies))  # Remove duplicates

def extract_patient_details(text):
    """
    Extract basic patient information from medical report text
    Returns: dict with name, age, gender, and other details
    """
    info = {}
    text_lower = text.lower()
    
    # Extract Name
    name_patterns = [
        r'name\s*[-:–]?\s*([a-zA-Z][a-zA-Z\s\.]+?)(?:\n|$)',
        r'patient\s*name\s*[-:–]?\s*([a-zA-Z][a-zA-Z\s\.]+?)(?:\n|age|dob)',
        r'name\s*[-:–]?\s*([a-zA-Z][a-zA-Z\s\.]+?)(?:\n|age|dob)',
        r'patient\s*[-:–]?\s*([a-zA-Z][a-zA-Z\s\.]+?)(?:\n|age|dob)',
        r'mr\.\s*([a-zA-Z]+)',
        r'mrs\.\s*([a-zA-Z]+)',
        r'ms\.\s*([a-zA-Z]+)',
    ]
    for pattern in name_patterns:
        match = re.search(pattern, text_lower, re.IGNORECASE)
        if match:
            name = match.group(1).strip()
            # Clean up the name
            name = re.sub(r'\s+', ' ', name)  # Remove multiple spaces
            name = name.replace('.', '').strip()
            if len(name) > 2 and len(name) < 50:  # Reasonable name length
                info['name'] = name.title()
                break
    
    # Extract Age
    age_patterns = [
        r'age\s*[-:–]?\s*(\d{1,3})\s*(?:years?|yrs?)?',
        r'(\d{1,3})\s*(?:years?|yrs?)\s*old',
        r'age\s*[-:–]\s*(\d{1,3})',
        r'[-–]\s*(\d{1,3})\s*years?',  # Handles "- 56 years"
    ]
    for pattern in age_patterns:
        match = re.search(pattern, text_lower)
        if match:
            age = int(match.group(1))
            if 1 <= age <= 120:  # Reasonable age range
                info['age'] = age
                break
    
    # Extract Gender
    gender_patterns = [
        r'gender\s*:?\s*(male|female|m\/f|m|f)',
        r'sex\s*:?\s*(male|female|m\/f|m|f)',
        r'\b(male|female)\b',
    ]
    for pattern in gender_patterns:
        match = re.search(pattern, text_lower)
        if match:
            gender_text = match.group(1).lower()
            if gender_text in ['male', 'm']:
                info['gender'] = 'Male'
            elif gender_text in ['female', 'f']:
                info['gender'] = 'Female'
            else:
                info['gender'] = 'Other'
            break
    
    # Extract Height (if present)
    height_patterns = [
        r'height\s*:?\s*(\d{2,3})\s*cm',
        r'height\s*:?\s*(\d)\s*[\']\s*(\d{1,2})',  # feet'inches
    ]
    for pattern in height_patterns:
        match = re.search(pattern, text_lower)
        if match:
            if 'cm' in pattern:
                info['height'] = int(match.group(1))
            else:
                # Convert feet'inches to cm
                feet = int(match.group(1))
                inches = int(match.group(2))
                height_cm = int((feet * 12 + inches) * 2.54)
                info['height'] = height_cm
            break
    
    # Extract Weight (if present)
    weight_patterns = [
        r'weight\s*:?\s*(\d{2,3})\s*kg',
        r'weight\s*:?\s*(\d{2,3})\s*lbs?',
    ]
    for pattern in weight_patterns:
        match = re.search(pattern, text_lower)
        if match:
            weight = int(match.group(1))
            if 'lb' in pattern:
                # Convert lbs to kg
                weight = int(weight * 0.453592)
            info['weight'] = weight
            break
    
    return info
def extract_medical_info(text):
    """
    Extract key medical information from text
    Returns: dict with patient details, diseases, allergies, and other info
    """
    print(f"\n{'='*50}")
    print("Analyzing medical text...")
    print(f"{'='*50}")
    
    # Extract patient details (name, age, gender, height, weight)
    patient_details = extract_patient_details(text)
    print(f"\n✓ Patient Details:")
    for key, value in patient_details.items():
        print(f"  - {key.title()}: {value}")
    
    # Extract numerical values first
    numerical_info = extract_numerical_values(text)
    if numerical_info:
        print(f"\n✓ Extracted Lab Values:")
        for key, value in numerical_info.items():
            print(f"  - {key.replace('_', ' ').title()}: {value}")
    
    # Detect diseases from lab values
    diseases_from_labs = detect_diseases_from_lab_values(numerical_info)
    
    # Extract diseases from text
    diseases_from_text = find_diseases_in_text(text)
    
    # Combine both sources, remove duplicates
    all_diseases = list(set(diseases_from_text + diseases_from_labs))
    
    print(f"\n✓ Found {len(all_diseases)} disease(s):")
    for disease in all_diseases:
        source = "from lab values" if disease in diseases_from_labs else "from text"
        print(f"  - {disease} ({source})")
    
    # Extract allergies
    allergies = find_allergies_in_text(text)
    print(f"\n✓ Found {len(allergies)} allergy/ies:")
    for allergy in allergies:
        print(f"  - {allergy}")
    
    result = {
        'patient_details': patient_details,
        'diseases': all_diseases if all_diseases else ['None'],
        'allergies': ', '.join(allergies) if allergies else '',
        'numerical_info': numerical_info,
        'raw_text': text[:500] + '...' if len(text) > 500 else text
    }
    
    return result

def extract_numerical_values(text):
    """Extract numerical health values from text"""
    values = {}
    text_lower = text.lower()
    
    # Blood Pressure (systolic/diastolic)
    bp_patterns = [
        r'blood\s*pressure[:\s-]*(\d{2,3})[/\\](\d{2,3})',
        r'bp[:\s-]*(\d{2,3})[/\\](\d{2,3})',
    ]
    for pattern in bp_patterns:
        match = re.search(pattern, text_lower)
        if match:
            values['blood_pressure_systolic'] = int(match.group(1))
            values['blood_pressure_diastolic'] = int(match.group(2))
            break
    
    # Cholesterol - more flexible patterns
    cholesterol_patterns = [
        r'total\s*cholesterol[:\s-]*(\d{2,3}\.?\d*)\s*mg',
        r'cholesterol[:\s-]*(\d{2,3}\.?\d*)\s*mg',
        r'total\s*chol[:\s-]*(\d{2,3}\.?\d*)',
    ]
    for pattern in cholesterol_patterns:
        match = re.search(pattern, text_lower)
        if match:
            values['total_cholesterol'] = float(match.group(1))
            break
    
    # LDL Cholesterol
    ldl_patterns = [
        r'ldl[:\s-]*(\d{2,3}\.?\d*)\s*mg',
        r'ldl\s*cholesterol[:\s-]*(\d{2,3}\.?\d*)',
    ]
    for pattern in ldl_patterns:
        match = re.search(pattern, text_lower)
        if match:
            values['ldl_cholesterol'] = float(match.group(1))
            break
    
    # HDL Cholesterol
    hdl_patterns = [
        r'hdl[:\s-]*(\d{1,3}\.?\d*)\s*mg',
        r'hdl\s*cholesterol[:\s-]*(\d{1,3}\.?\d*)',
    ]
    for pattern in hdl_patterns:
        match = re.search(pattern, text_lower)
        if match:
            values['hdl_cholesterol'] = float(match.group(1))
            break
    
    # Triglycerides
    trig_patterns = [
        r'triglycerides?[:\s-]*(\d{2,3}\.?\d*)\s*mg',
        r'tg[:\s-]*(\d{2,3}\.?\d*)\s*mg',
    ]
    for pattern in trig_patterns:
        match = re.search(pattern, text_lower)
        if match:
            values['triglycerides'] = float(match.group(1))
            break
    
    # Blood Sugar / Glucose - more flexible
    sugar_patterns = [
        r'fasting\s*blood\s*sugar[:\s-]*(\d{2,3}\.?\d*)\s*mg',
        r'fbs[:\s-]*(\d{2,3}\.?\d*)\s*mg',
        r'blood\s*sugar[:\s-]*(\d{2,3}\.?\d*)\s*mg',
        r'glucose[:\s-]*(\d{2,3}\.?\d*)\s*mg',
        r'blood\s*glucose[:\s-]*(\d{2,3}\.?\d*)',
    ]
    for pattern in sugar_patterns:
        match = re.search(pattern, text_lower)
        if match:
            values['blood_sugar'] = float(match.group(1))
            break
    
    # HbA1c
    hba1c_patterns = [
        r'hba1c[:\s-]*(\d{1,2}\.?\d*)\s*%',
        r'a1c[:\s-]*(\d{1,2}\.?\d*)',
    ]
    for pattern in hba1c_patterns:
        match = re.search(pattern, text_lower)
        if match:
            values['hba1c'] = float(match.group(1))
            break
    
    return values


def detect_diseases_from_lab_values(lab_values):
    """
    Analyze lab values and detect diseases
    Returns list of detected diseases
    """
    detected = []
    
    # High Cholesterol
    if 'total_cholesterol' in lab_values:
        if lab_values['total_cholesterol'] >= 200:  # 200+ is borderline high
            detected.append('High Cholesterol')
    
    if 'ldl_cholesterol' in lab_values:
        if lab_values['ldl_cholesterol'] >= 130:  # 130+ is borderline high
            if 'High Cholesterol' not in detected:
                detected.append('High Cholesterol')
    
    # Diabetes / Pre-diabetes
    if 'blood_sugar' in lab_values:
        if lab_values['blood_sugar'] >= 126:  # Diabetes
            detected.append('Diabetes')
        elif lab_values['blood_sugar'] >= 100:  # Pre-diabetes
            if 'Diabetes' not in detected:
                detected.append('Diabetes')
    
    if 'hba1c' in lab_values:
        if lab_values['hba1c'] >= 6.5:  # Diabetes
            if 'Diabetes' not in detected:
                detected.append('Diabetes')
    
    # Hypertension
    if 'blood_pressure_systolic' in lab_values:
        systolic = lab_values['blood_pressure_systolic']
        diastolic = lab_values.get('blood_pressure_diastolic', 0)
        
        if systolic >= 140 or diastolic >= 90:  # Hypertension
            detected.append('Hypertension')
    
    # High Triglycerides
    if 'triglycerides' in lab_values:
        if lab_values['triglycerides'] >= 150:  # Borderline high
            detected.append('High Cholesterol')  # Group with cholesterol issues
    
    return detected


def extract_numerical_values_old(text):
    """
    Extract numerical health values from text
    (Blood pressure, cholesterol, blood sugar, etc.)
    """
    info = {}
    
    # Blood pressure pattern (e.g., 120/80, BP: 140/90)
    bp_pattern = r'(?:bp|blood pressure)?\s*:?\s*(\d{2,3})\s*/\s*(\d{2,3})'
    bp_match = re.search(bp_pattern, text.lower())
    if bp_match:
        info['blood_pressure_systolic'] = int(bp_match.group(1))
        info['blood_pressure_diastolic'] = int(bp_match.group(2))
    
    # Cholesterol (e.g., Cholesterol: 240, Total cholesterol 220 mg/dL)
    chol_pattern = r'(?:total\s)?cholesterol\s*:?\s*(\d{2,3})'
    chol_match = re.search(chol_pattern, text.lower())
    if chol_match:
        info['cholesterol'] = int(chol_match.group(1))
    
    # Blood sugar (e.g., Blood sugar: 180, Glucose 120 mg/dL, HbA1c 7.5%)
    sugar_pattern = r'(?:blood sugar|glucose|fasting glucose)\s*:?\s*(\d{2,3})'
    sugar_match = re.search(sugar_pattern, text.lower())
    if sugar_match:
        info['blood_sugar'] = int(sugar_match.group(1))
    
    # HbA1c
    hba1c_pattern = r'hba1c\s*:?\s*(\d+\.?\d*)\s*%?'
    hba1c_match = re.search(hba1c_pattern, text.lower())
    if hba1c_match:
        info['hba1c'] = float(hba1c_match.group(1))
    
    return info

# ============================================
# MAIN PROCESSING FUNCTION
# ============================================

def process_medical_report(file):
    """
    Main function to process uploaded medical report
    
    Args:
        file: FileStorage object from Flask request
    
    Returns:
        dict: Extracted medical information
    """
    try:
        # Extract text from file
        text = extract_text_from_file(file)
        
        if not text or len(text) < 10:
            return {
                'success': False,
                'error': 'Could not extract text from file. Please ensure the file is readable and contains text.',
                'diseases': [],
                'allergies': ''
            }
        
        # Extract medical information
        medical_info = extract_medical_info(text)
        medical_info['success'] = True
        
        return medical_info
    
    except Exception as e:
        print(f"Error processing medical report: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            'success': False,
            'error': f'Error processing file: {str(e)}',
            'diseases': [],
            'allergies': ''
        }

# ============================================
# UTILITY FUNCTIONS
# ============================================

def get_supported_diseases():
    """Get list of diseases that can be detected"""
    return list(DISEASE_KEYWORDS.keys())

def test_ocr():
    """Test if OCR is working properly"""
    try:
        # Create a simple test image
        test_image = Image.new('RGB', (200, 50), color='white')
        
        # Try to extract text (will be empty, but tests if OCR works)
        pytesseract.image_to_string(test_image)
        
        return True, "OCR is working!"
    except Exception as e:
        return False, f"OCR test failed: {str(e)}"

if __name__ == "__main__":
    # Test OCR setup
    success, message = test_ocr()
    print(f"\n{'='*50}")
    print(f"OCR Test: {'✓ PASSED' if success else '✗ FAILED'}")
    print(f"Message: {message}")
    print(f"{'='*50}")
    
    # Display supported diseases
    print(f"\nSupported diseases ({len(get_supported_diseases())}):")
    for disease in get_supported_diseases():
        print(f"  - {disease}")