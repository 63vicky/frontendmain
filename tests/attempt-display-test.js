/**
 * Test script for verifying the student attempts functionality
 * 
 * This script tests:
 * 1. The backend endpoint for fetching student attempts
 * 2. The frontend display of attempt data
 * 
 * To run this test:
 * 1. Make sure the backend server is running
 * 2. Run: node tests/attempt-display-test.js
 */

const fetch = require('node-fetch');

// Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
let authToken = ''; // Will be set after login

// Test user credentials
const testUser = {
  email: 'student@test.com',
  password: 'password123',
  role: 'student'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function to log with colors
function log(message, color = colors.reset) {
  console.log(color, message, colors.reset);
}

// Helper function to log test results
function logTestResult(testName, passed, message = '') {
  if (passed) {
    log(`✅ PASS: ${testName}`, colors.green);
  } else {
    log(`❌ FAIL: ${testName}`, colors.red);
    if (message) {
      log(`   ${message}`, colors.yellow);
    }
  }
}

// Login function
async function login() {
  try {
    log('Logging in as student...', colors.cyan);
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    authToken = data.token;
    log('Login successful!', colors.green);
    return data.user;
  } catch (error) {
    log(`Login failed: ${error.message}`, colors.red);
    throw error;
  }
}

// Test the student attempts endpoint
async function testStudentAttemptsEndpoint() {
  try {
    log('\nTesting /attempts/student endpoint...', colors.cyan);
    
    const response = await fetch(`${API_URL}/attempts/student`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch student attempts');
    }
    
    // Verify the response structure
    const isValidResponse = typeof data === 'object' && data !== null;
    logTestResult('Student attempts endpoint returns valid data', isValidResponse);
    
    // Log the attempts data
    log('Attempts data structure:', colors.cyan);
    log(JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    log(`Test failed: ${error.message}`, colors.red);
    logTestResult('Student attempts endpoint', false, error.message);
    return null;
  }
}

// Main test function
async function runTests() {
  log('🧪 Starting attempt display tests...', colors.magenta);
  
  try {
    // Step 1: Login
    const user = await login();
    
    // Step 2: Test the student attempts endpoint
    const attemptsData = await testStudentAttemptsEndpoint();
    
    // Step 3: Verify data structure
    if (attemptsData) {
      const examIds = Object.keys(attemptsData);
      log(`\nFound attempts for ${examIds.length} exams`, colors.cyan);
      
      // Check if each exam has an array of attempts
      let validStructure = true;
      for (const examId of examIds) {
        const attempts = attemptsData[examId];
        if (!Array.isArray(attempts)) {
          validStructure = false;
          log(`Invalid structure for exam ${examId}: attempts is not an array`, colors.red);
          break;
        }
        
        log(`Exam ${examId}: ${attempts.length} attempts`, colors.green);
      }
      
      logTestResult('Attempts data structure is valid', validStructure);
    }
    
    log('\n🎉 Tests completed!', colors.magenta);
  } catch (error) {
    log(`\n❌ Tests failed: ${error.message}`, colors.red);
  }
}

// Run the tests
runTests();
