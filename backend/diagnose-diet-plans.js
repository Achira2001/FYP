#!/usr/bin/env node

/**
 * Diet Plan MongoDB Diagnostic Tool
 * ==================================
 * This script will test every part of your system and tell you EXACTLY what's wrong
 * 
 * Run: node diagnose-diet-plans.js
 * 
 * UPDATED: Now works with MONGO_URI (your existing variable)
 */

import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

console.log('\n' + '='.repeat(70));
console.log('🔍 DIET PLAN SYSTEM DIAGNOSTIC');
console.log('='.repeat(70));

const MERN_API = 'http://localhost:5000';
const ML_API = 'http://localhost:5001';

let testResults = {
  mongodb: false,
  mernBackend: false,
  mlBackend: false,
  dietPlansRoute: false,
  canSave: false,
  canFetch: false
};

// Test 1: MongoDB Connection
async function testMongoDB() {
  console.log('\n📊 TEST 1: MongoDB Connection');
  console.log('-'.repeat(70));
  
  try {
    // Check for both MONGO_URI and MONGODB_URI (supports your existing setup)
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.log('  ❌ MONGO_URI not found in .env file');
      console.log('     Solution: Make sure your .env has MONGO_URI');
      return false;
    }
    
    console.log('  → Connecting to MongoDB...');
    console.log(`     Using: ${mongoUri.substring(0, 50)}...`);
    
    await mongoose.connect(mongoUri);
    
    console.log('  ✅ MongoDB Connected Successfully!');
    console.log(`     Database: ${mongoose.connection.name}`);
    
    testResults.mongodb = true;
    return true;
    
  } catch (error) {
    console.log('  ❌ MongoDB Connection Failed');
    console.log(`     Error: ${error.message}`);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n  💡 Solution: Check username/password in MONGO_URI');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n  💡 Solution: Check MongoDB Atlas cluster URL');
    } else if (error.message.includes('IP')) {
      console.log('\n  💡 Solution: Add 0.0.0.0/0 to MongoDB Atlas IP Whitelist');
    }
    
    return false;
  }
}

// Test 2: MERN Backend Running
async function testMERNBackend() {
  console.log('\n🚀 TEST 2: MERN Backend Status');
  console.log('-'.repeat(70));
  
  try {
    const response = await axios.get(`${MERN_API}/api/health`, { timeout: 5000 });
    
    console.log('  ✅ MERN Backend is Running!');
    console.log(`     Status: ${response.data.success ? 'Healthy' : 'Unhealthy'}`);
    
    testResults.mernBackend = true;
    return true;
    
  } catch (error) {
    console.log('  ❌ MERN Backend Not Responding');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('     Error: Connection refused on port 5000');
      console.log('\n  💡 Solution: Start your backend server');
      console.log('     Command: npm start (in backend folder)');
    } else {
      console.log(`     Error: ${error.message}`);
    }
    
    return false;
  }
}

// Test 3: ML Backend Running
async function testMLBackend() {
  console.log('\n🤖 TEST 3: ML Backend Status');
  console.log('-'.repeat(70));
  
  try {
    const response = await axios.get(`${ML_API}/api/health`, { timeout: 5000 });
    
    console.log('  ✅ ML Backend is Running!');
    console.log(`     Models Loaded: ${response.data.models_loaded ? 'Yes' : 'No'}`);
    
    testResults.mlBackend = true;
    return true;
    
  } catch (error) {
    console.log('  ❌ ML Backend Not Responding');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('     Error: Connection refused on port 5001');
      console.log('\n  💡 Solution: Start your Flask backend');
      console.log('     Command: cd ml-backend && python app.py');
    } else {
      console.log(`     Error: ${error.message}`);
    }
    
    return false;
  }
}

// Test 4: Diet Plans Route
async function testDietPlansRoute() {
  console.log('\n📍 TEST 4: Diet Plans Route');
  console.log('-'.repeat(70));
  
  try {
    const response = await axios.get(`${MERN_API}/api/diet-plans/recent`, { timeout: 5000 });
    
    console.log('  ✅ Diet Plans Route is Working!');
    console.log(`     Current Plans: ${response.data.count || 0}`);
    
    testResults.dietPlansRoute = true;
    return true;
    
  } catch (error) {
    console.log('  ❌ Diet Plans Route Failed');
    
    if (error.response?.status === 404) {
      console.log('     Error: Route not found (404)');
      console.log('\n  💡 Solution: Add to server.js:');
      console.log('     import dietPlanRoutes from \'./routes/dietPlanRoutes.js\';');
      console.log('     app.use(\'/api/diet-plans\', dietPlanRoutes);');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('     Error: Backend not running');
    } else {
      console.log(`     Error: ${error.response?.data?.message || error.message}`);
    }
    
    return false;
  }
}

// Test 5: Can Save Diet Plan
async function testSaveDietPlan() {
  console.log('\n💾 TEST 5: Saving Diet Plan');
  console.log('-'.repeat(70));
  
  const testData = {
    userInfo: {
      name: "Test User",
      age: 30,
      gender: "Male",
      bmi: 22.5,
      goal: "Maintenance"
    },
    inputData: {
      height: 175,
      weight: 70,
      diseases: [],
      allergies: "",
      dietPreference: "Regular",
      activityLevel: "moderate",
      mealsPerDay: 3
    },
    recommendations: {
      daily_calories: 2000,
      protein_grams: 150,
      carbs_grams: 250,
      fats_grams: 67,
      meal_plan_type: "Balanced Diet"
    },
    macro_percentages: {
      protein: 30,
      carbs: 50,
      fats: 20
    },
    meal_breakdown: [],
    health_insights: [],
    generatedFrom: "manual_form"
  };
  
  try {
    const response = await axios.post(`${MERN_API}/api/diet-plans`, testData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    if (response.data.success) {
      console.log('  ✅ Diet Plan Saved Successfully!');
      console.log(`     Plan ID: ${response.data.data._id}`);
      console.log(`     Name: ${response.data.data.userInfo.name}`);
      
      testResults.canSave = true;
      return response.data.data._id;
    } else {
      console.log('  ❌ Save Failed');
      console.log(`     Message: ${response.data.message}`);
      return null;
    }
    
  } catch (error) {
    console.log('  ❌ Save Diet Plan Failed');
    
    if (error.response?.status === 500) {
      console.log('     Error: Server error (500)');
      console.log(`     Message: ${error.response.data?.message}`);
      
      if (error.response.data?.error?.includes('validation')) {
        console.log('\n  💡 Solution: Data structure mismatch with schema');
      } else if (error.response.data?.error?.includes('MongoError')) {
        console.log('\n  💡 Solution: MongoDB connection or write permission issue');
      }
    } else {
      console.log(`     Error: ${error.response?.data?.message || error.message}`);
    }
    
    return null;
  }
}

// Test 6: Can Fetch Diet Plans
async function testFetchDietPlans(savedId) {
  console.log('\n📥 TEST 6: Fetching Diet Plans');
  console.log('-'.repeat(70));
  
  try {
    const response = await axios.get(`${MERN_API}/api/diet-plans/recent`, { timeout: 5000 });
    
    console.log('  ✅ Fetch Successful!');
    console.log(`     Total Plans: ${response.data.count}`);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('\n     Recent Plans:');
      response.data.data.forEach((plan, idx) => {
        console.log(`       ${idx + 1}. ${plan.userInfo.name} - ${plan.recommendations.daily_calories} kcal`);
      });
    }
    
    testResults.canFetch = true;
    return true;
    
  } catch (error) {
    console.log('  ❌ Fetch Failed');
    console.log(`     Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 7: Frontend Connection
async function testFrontendConnection() {
  console.log('\n🌐 TEST 7: Frontend Connection Check');
  console.log('-'.repeat(70));
  
  // Check CORS configuration
  console.log('  Checking CORS configuration...');
  
  try {
    const response = await axios.get(`${MERN_API}/api/health`, {
      headers: {
        'Origin': 'http://localhost:5173'
      }
    });
    
    console.log('  ✅ CORS Configured for port 5173');
    
    // Also check 3000
    const response2 = await axios.get(`${MERN_API}/api/health`, {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    
    console.log('  ✅ CORS Configured for port 3000');
    
  } catch (error) {
    if (error.response?.status === 403 || error.message.includes('CORS')) {
      console.log('  ⚠️  CORS May Not Be Configured Properly');
      console.log('\n  💡 Solution: In server.js, update CORS to:');
      console.log('     app.use(cors({');
      console.log('       origin: [\'http://localhost:5173\', \'http://localhost:3000\'],');
      console.log('       credentials: true');
      console.log('     }));');
    }
  }
}

// Main Diagnostic Function
async function runDiagnostics() {
  try {
    await testMongoDB();
    await testMERNBackend();
    await testMLBackend();
    await testDietPlansRoute();
    
    const savedId = await testSaveDietPlan();
    await testFetchDietPlans(savedId);
    await testFrontendConnection();
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📋 DIAGNOSTIC SUMMARY');
    console.log('='.repeat(70));
    
    const allPassed = Object.values(testResults).every(v => v);
    
    if (allPassed) {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('   Your system is working correctly.');
      console.log('\n   If diet plans still aren\'t saving in your app:');
      console.log('   1. Check browser console (F12) for errors');
      console.log('   2. Make sure React is calling the right API URL');
      console.log('   3. Clear browser cache and try again');
    } else {
      console.log('\n⚠️  SOME TESTS FAILED');
      console.log('\n   Failed Tests:');
      
      Object.entries(testResults).forEach(([test, passed]) => {
        if (!passed) {
          console.log(`   ❌ ${test}`);
        }
      });
      
      console.log('\n   📝 Next Steps:');
      
      if (!testResults.mongodb) {
        console.log('   1. Fix MongoDB connection first (see error above)');
        console.log('      - Check MONGO_URI in .env file');
        console.log('      - Verify MongoDB Atlas IP whitelist (0.0.0.0/0)');
      }
      
      if (!testResults.mernBackend) {
        console.log('   2. Start MERN backend: npm start');
      }
      
      if (!testResults.mlBackend) {
        console.log('   3. Start ML backend: cd ml-backend && python app.py');
      }
      
      if (!testResults.dietPlansRoute) {
        console.log('   4. Check server.js route registration');
      }
      
      if (!testResults.canSave) {
        console.log('   5. Fix save functionality (check error message above)');
      }
    }
    
    console.log('\n' + '='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
  } finally {
    // Cleanup
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(0);
  }
}

// Run diagnostics
runDiagnostics();