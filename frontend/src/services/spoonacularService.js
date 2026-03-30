const SPOONACULAR_API_KEY = '3368455df45845ed9674a78c2c8c818a';
const BASE_URL = 'https://api.spoonacular.com';

// ─────────────────────────────────────────────────────────
//  DIET TYPE MAPPING
//  Maps ML model's diet names -> Spoonacular diet tags
// ─────────────────────────────────────────────────────────
const DIET_TYPE_MAP = {
  'Balanced Diet':      { diet: '',              tag: 'balanced' },
  'High-Protein Diet':  { diet: 'paleo',         tag: 'high-protein' },
  'Low-Carb Diet':      { diet: 'low carb',      tag: 'low-carb' },
  'Low-Fat Diet':       { diet: '',              tag: 'low-fat' },
};

// Disease -> intolerances/exclude ingredients for Spoonacular
const DISEASE_INTOLERANCES = {
  'Gluten Intolerance': 'gluten',
  'Lactose Intolerance': 'dairy',
  'Nut Allergy':        'peanut,tree nut',
};

// Meal-type to Spoonacular mealType param
const MEAL_TYPE_MAP = {
  breakfast: 'breakfast',
  lunch:     'main course',
  dinner:    'main course',
  snack:     'snack',
};


//  SIMPLE IN-MEMORY CACHE
//  Prevents hitting API twice for the same query in a session

const cache = new Map();

function cacheKey(...args) {
  return args.join('|');
}


//  CORE FETCH HELPER

async function spoonacularFetch(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('apiKey', SPOONACULAR_API_KEY);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, v);
    }
  });

  const key = url.toString();
  if (cache.has(key)) return cache.get(key);

  const response = await fetch(url.toString());

  if (!response.ok) {
    if (response.status === 402) {
      throw new Error('API_LIMIT_REACHED');
    }
    if (response.status === 401) {
      throw new Error('INVALID_API_KEY');
    }
    throw new Error(`Spoonacular API error: ${response.status}`);
  }

  const data = await response.json();
  cache.set(key, data);
  return data;
}


//  BUILD INTOLERANCES STRING FROM DISEASES

function getIntolerances(diseases = [], allergies = '') {
  const parts = [];

  diseases.forEach(d => {
    if (DISEASE_INTOLERANCES[d]) {
      parts.push(DISEASE_INTOLERANCES[d]);
    }
  });

  // Also parse custom allergy text
  if (allergies) {
    const lower = allergies.toLowerCase();
    if (lower.includes('gluten') || lower.includes('wheat')) parts.push('gluten');
    if (lower.includes('dairy') || lower.includes('milk') || lower.includes('lactose')) parts.push('dairy');
    if (lower.includes('nut') || lower.includes('peanut')) parts.push('peanut');
    if (lower.includes('egg')) parts.push('egg');
    if (lower.includes('shellfish') || lower.includes('shrimp')) parts.push('shellfish');
    if (lower.includes('fish') || lower.includes('salmon')) parts.push('seafood');
    if (lower.includes('soy')) parts.push('soy');
    if (lower.includes('sesame')) parts.push('sesame');
  }

  return [...new Set(parts)].join(',');
}


//  EXCLUDED INGREDIENTS based on avoid-foods for each diet

const DIET_EXCLUDED_INGREDIENTS = {
  'Low-Carb Diet':     'bread,pasta,rice,sugar,potato,corn',
  'Low-Fat Diet':      'butter,cream,lard,bacon',
  'High-Protein Diet': '',
  'Balanced Diet':     '',
};


//  MAX FAT / CARBS params for low-fat / low-carb

function getNutrientParams(dietType) {
  switch (dietType) {
    case 'Low-Carb Diet':
      return { maxCarbs: 25 };  // per serving
    case 'Low-Fat Diet':
      return { maxFat: 15 };
    case 'High-Protein Diet':
      return { minProtein: 25 };
    default:
      return {};
  }
}


//  SEARCH RECIPES BY MEAL TYPE

export async function searchRecipes({
  dietType,
  mealType,       // 'breakfast' | 'lunch' | 'dinner' | 'snack'
  diseases = [],
  allergies = '',
  number = 3,
  calories,       // target per meal
}) {
  const dietConfig = DIET_TYPE_MAP[dietType] || {};
  const intolerances = getIntolerances(diseases, allergies);
  const excludeIngredients = DIET_EXCLUDED_INGREDIENTS[dietType] || '';
  const nutrientParams = getNutrientParams(dietType);

  // Calorie range ±20% around target
  const calorieBudget = calories
    ? { minCalories: Math.round(calories * 0.8), maxCalories: Math.round(calories * 1.2) }
    : {};

  const params = {
    type:             MEAL_TYPE_MAP[mealType] || 'main course',
    diet:             dietConfig.diet || '',
    intolerances,
    excludeIngredients,
    number,
    addRecipeNutrition: true,
    addRecipeInformation: true,
    fillIngredients: false,
    instructionsRequired: true,
    sort:             'popularity',
    ...calorieBudget,
    ...nutrientParams,
  };

  try {
    const data = await spoonacularFetch('/recipes/complexSearch', params);
    return (data.results || []).map(normalizeRecipe);
  } catch (err) {
    console.error(`Spoonacular error [${mealType}]:`, err.message);
    throw err;
  }
}


//  GET FULL RECIPE DETAILS (for detailed page)

export async function getRecipeDetails(recipeId) {
  try {
    const data = await spoonacularFetch(
      `/recipes/${recipeId}/information`,
      { includeNutrition: true }
    );
    return normalizeRecipeDetail(data);
  } catch (err) {
    console.error('Recipe details error:', err.message);
    throw err;
  }
}


//  GET RECIPE NUTRITION WIDGET DATA

export async function getRecipeNutrition(recipeId) {
  try {
    return await spoonacularFetch(`/recipes/${recipeId}/nutritionWidget.json`);
  } catch (err) {
    console.error('Nutrition widget error:', err.message);
    return null;
  }
}


//  FOODS TO AVOID 
export const AVOID_FOODS_BY_DIET = {
  'Balanced Diet': [
    { name: 'Sugary Sodas',        reason: 'Empty calories, spikes blood sugar',           emoji: '🥤', avoid: true },
    { name: 'Deep-fried foods',    reason: 'Trans fats, excess saturated fat',             emoji: '🍟', avoid: true },
    { name: 'White bread',         reason: 'Low fibre, rapid glucose rise',                emoji: '🍞', avoid: true },
    { name: 'Processed snacks',    reason: 'High sodium, artificial additives',            emoji: '🍪', avoid: true },
    { name: 'Excess alcohol',      reason: 'Empty calories, disrupts metabolism',          emoji: '🍺', avoid: true },
  ],
  'High-Protein Diet': [
    { name: 'Sugary desserts',     reason: 'High calorie, no protein value',               emoji: '🍰', avoid: true },
    { name: 'Sugary drinks',       reason: 'Spikes insulin, promotes fat storage',         emoji: '🧃', avoid: true },
    { name: 'White rice (excess)', reason: 'High carb-to-protein ratio',                  emoji: '🍚', avoid: true },
    { name: 'Processed meats',     reason: 'High sodium, low quality protein',             emoji: '🌭', avoid: true },
    { name: 'Alcohol',             reason: 'Inhibits muscle protein synthesis',            emoji: '🍺', avoid: true },
  ],
  'Low-Carb Diet': [
    { name: 'White rice & pasta',  reason: 'High glycemic — spikes blood sugar rapidly',  emoji: '🍚', avoid: true },
    { name: 'Potatoes & corn',     reason: 'High starch content',                          emoji: '🥔', avoid: true },
    { name: 'Sugary fruits',       reason: 'Mango, grapes, banana — high natural sugar',  emoji: '🍇', avoid: true },
    { name: 'Soft drinks & juices',reason: 'Very high sugar content',                     emoji: '🥤', avoid: true },
    { name: 'Cakes & pastries',    reason: 'Refined flour + sugar = carb overload',       emoji: '🎂', avoid: true },
    { name: 'Sweetened yogurt',    reason: 'Hidden sugars spike blood sugar',             emoji: '🍮', avoid: true },
  ],
  'Low-Fat Diet': [
    { name: 'Fried foods',         reason: 'High in saturated & trans fats',              emoji: '🍟', avoid: true },
    { name: 'Full-fat dairy',      reason: 'Raises LDL cholesterol',                     emoji: '🧈', avoid: true },
    { name: 'Fatty red meat',      reason: 'Saturated fat harmful for heart health',      emoji: '🥩', avoid: true },
    { name: 'Coconut & palm oil',  reason: 'High in saturated fatty acids',              emoji: '🫙', avoid: true },
    { name: 'Pastries & biscuits', reason: 'Trans fats, calorie dense',                  emoji: '🍰', avoid: true },
    { name: 'Packaged snacks',     reason: 'Hidden trans fats, high sodium',             emoji: '🍪', avoid: true },
  ],
};


//  EXERCISES BY DIET TYPE

export const EXERCISES_BY_DIET = {
  'Balanced Diet': [
    { name: 'Brisk Walking',       duration: '30 min', frequency: 'Daily',    calories: 150, emoji: '🚶', type: 'Cardio',    intensity: 'Low' },
    { name: 'Swimming',            duration: '30 min', frequency: '3×/week',  calories: 250, emoji: '🏊', type: 'Full Body', intensity: 'Moderate' },
    { name: 'Yoga',                duration: '45 min', frequency: '3×/week',  calories: 180, emoji: '🧘', type: 'Flexibility', intensity: 'Low' },
    { name: 'Cycling',             duration: '30 min', frequency: '3×/week',  calories: 220, emoji: '🚴', type: 'Cardio',    intensity: 'Moderate' },
    { name: 'Bodyweight Circuit',  duration: '20 min', frequency: '3×/week',  calories: 160, emoji: '💪', type: 'Strength',  intensity: 'Moderate' },
  ],
  'High-Protein Diet': [
    { name: 'Weight Training',     duration: '45–60 min', frequency: '4×/week', calories: 300, emoji: '🏋️', type: 'Strength', intensity: 'High' },
    { name: 'HIIT',                duration: '25 min',    frequency: '3×/week', calories: 350, emoji: '⚡', type: 'Cardio',   intensity: 'High' },
    { name: 'Pull-ups & Push-ups', duration: '20 min',    frequency: 'Daily',   calories: 150, emoji: '🤸', type: 'Bodyweight', intensity: 'Moderate' },
    { name: 'Sprint Intervals',    duration: '20 min',    frequency: '2×/week', calories: 280, emoji: '🏃', type: 'Cardio',   intensity: 'High' },
    { name: 'Resistance Bands',    duration: '30 min',    frequency: '3×/week', calories: 200, emoji: '💪', type: 'Strength', intensity: 'Moderate' },
  ],
  'Low-Carb Diet': [
    { name: 'Post-meal Walking',   duration: '15–20 min', frequency: 'After each meal', calories: 80,  emoji: '🚶', type: 'Blood Sugar', intensity: 'Low' },
    { name: 'Low-Impact Cardio',   duration: '30 min',    frequency: 'Daily',           calories: 180, emoji: '🚴', type: 'Cardio',      intensity: 'Low' },
    { name: 'Resistance Training', duration: '30 min',    frequency: '3×/week',         calories: 220, emoji: '🏋️', type: 'Strength',    intensity: 'Moderate' },
    { name: 'Swimming',            duration: '30 min',    frequency: '3×/week',         calories: 250, emoji: '🏊', type: 'Full Body',   intensity: 'Moderate' },
    { name: 'Yoga / Tai Chi',      duration: '40 min',    frequency: '3×/week',         calories: 140, emoji: '🧘', type: 'Stress',      intensity: 'Low' },
  ],
  'Low-Fat Diet': [
    { name: 'Brisk Walking/Jog',   duration: '30–45 min', frequency: '5×/week', calories: 200, emoji: '🏃', type: 'Cardio',     intensity: 'Moderate' },
    { name: 'Cycling',             duration: '30 min',    frequency: '4×/week', calories: 250, emoji: '🚴', type: 'Cardio',     intensity: 'Moderate' },
    { name: 'Water Aerobics',      duration: '45 min',    frequency: '3×/week', calories: 220, emoji: '🏊', type: 'Low Impact', intensity: 'Low' },
    { name: 'Yoga',                duration: '40 min',    frequency: '3×/week', calories: 150, emoji: '🧘', type: 'Flexibility', intensity: 'Low' },
    { name: 'Light Resistance',    duration: '30 min',    frequency: '3×/week', calories: 180, emoji: '🏋️', type: 'Strength',   intensity: 'Low' },
  ],
};


//  NORMALISE RECIPE from complexSearch result

function normalizeRecipe(r) {
  const nutrition = r.nutrition || {};
  const nutrients = nutrition.nutrients || [];

  const getNutrient = (name) => {
    const n = nutrients.find(x => x.name === name);
    return n ? Math.round(n.amount) : 0;
  };

  return {
    id:           r.id,
    title:        r.title,
    image:        r.image,
    sourceUrl:    r.sourceUrl,
    readyInMinutes: r.readyInMinutes || 30,
    servings:     r.servings || 1,
    calories:     getNutrient('Calories'),
    protein:      getNutrient('Protein'),
    carbs:        getNutrient('Carbohydrates'),
    fat:          getNutrient('Fat'),
    fiber:        getNutrient('Fiber'),
    sodium:       getNutrient('Sodium'),
    diets:        r.diets || [],
    dishTypes:    r.dishTypes || [],
    summary:      r.summary ? r.summary.replace(/<[^>]*>/g, '').slice(0, 120) + '...' : '',
  };
}


//  NORMALISE RECIPE DETAIL (full info page)

function normalizeRecipeDetail(r) {
  const base = normalizeRecipe(r);
  const nutrition = r.nutrition || {};
  const nutrients = nutrition.nutrients || [];

  return {
    ...base,
    ingredients: (r.extendedIngredients || []).map(ing => ({
      name:     ing.nameClean || ing.name,
      amount:   ing.amount,
      unit:     ing.unit,
      original: ing.original,
    })),
    instructions: (r.analyzedInstructions || [])
      .flatMap(block => block.steps || [])
      .map(s => ({ number: s.number, step: s.step })),
    summary:  r.summary ? r.summary.replace(/<[^>]*>/g, '') : '',
    nutrients: nutrients.slice(0, 12),
    diets:    r.diets || [],
    cuisines: r.cuisines || [],
    dishTypes:r.dishTypes || [],
  };
}


//  FETCH ALL MEALS FOR A PATIENT IN ONE CALL

export async function fetchMealPlan({
  dietType,
  diseases,
  allergies,
  dailyCalories,
}) {
  const mealSplit = {
    breakfast: Math.round(dailyCalories * 0.25),
    lunch:     Math.round(dailyCalories * 0.35),
    dinner:    Math.round(dailyCalories * 0.30),
    snack:     Math.round(dailyCalories * 0.10),
  };

  const opts = { dietType, diseases, allergies };

  // Run all 4 fetches in parallel
  const [breakfast, lunch, dinner, snacks] = await Promise.all([
    searchRecipes({ ...opts, mealType: 'breakfast', number: 3, calories: mealSplit.breakfast }),
    searchRecipes({ ...opts, mealType: 'lunch',     number: 3, calories: mealSplit.lunch }),
    searchRecipes({ ...opts, mealType: 'dinner',    number: 3, calories: mealSplit.dinner }),
    searchRecipes({ ...opts, mealType: 'snack',     number: 4, calories: mealSplit.snack }),
  ]);

  return { breakfast, lunch, dinner, snacks, mealSplit };
}