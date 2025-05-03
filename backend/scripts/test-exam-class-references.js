/**
 * Test script to verify the exam-class reference implementation
 * 
 * This script:
 * 1. Creates a test class
 * 2. Creates a test exam with the class reference
 * 3. Retrieves the exam and verifies the class reference is populated correctly
 * 4. Cleans up by deleting the test exam and class
 * 
 * Run with: node scripts/test-exam-class-references.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Exam = require('../backend/models/Exam_updated');
const Class = require('../backend/models/Class');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school-management')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function testExamClassReferences() {
  let testClass = null;
  let testExam = null;
  
  try {
    console.log('Starting exam-class reference test...');
    
    // Step 1: Create a test class
    testClass = new Class({
      name: 'Test Class',
      section: 'Test Section',
      subject: new mongoose.Types.ObjectId(), // Mock subject ID
      schedule: 'Test Schedule',
      status: 'Active'
    });
    
    await testClass.save();
    console.log(`Created test class with ID: ${testClass._id}`);
    
    // Step 2: Create a test exam with the class reference
    testExam = new Exam({
      title: 'Test Exam',
      subject: 'Test Subject',
      class: testClass._id, // Use the class ObjectId
      chapter: 'Test Chapter',
      status: 'draft',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      duration: 60,
      attempts: {
        max: 1
      },
      createdBy: new mongoose.Types.ObjectId() // Mock user ID
    });
    
    await testExam.save();
    console.log(`Created test exam with ID: ${testExam._id}`);
    
    // Step 3: Retrieve the exam and verify the class reference
    const retrievedExam = await Exam.findById(testExam._id).populate('class');
    
    console.log('\nRetrieved exam:');
    console.log(`- Title: ${retrievedExam.title}`);
    console.log(`- Class ID: ${retrievedExam.class._id}`);
    console.log(`- Class Name: ${retrievedExam.class.name}`);
    console.log(`- Class Section: ${retrievedExam.class.section}`);
    
    // Verify the class reference
    if (retrievedExam.class._id.toString() === testClass._id.toString() &&
        retrievedExam.class.name === testClass.name &&
        retrievedExam.class.section === testClass.section) {
      console.log('\n✅ Test PASSED: Class reference is correctly populated');
    } else {
      console.log('\n❌ Test FAILED: Class reference is not correctly populated');
    }
    
  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    // Step 4: Clean up by deleting the test exam and class
    try {
      if (testExam) {
        await Exam.findByIdAndDelete(testExam._id);
        console.log(`\nDeleted test exam with ID: ${testExam._id}`);
      }
      
      if (testClass) {
        await Class.findByIdAndDelete(testClass._id);
        console.log(`Deleted test class with ID: ${testClass._id}`);
      }
    } catch (cleanupErr) {
      console.error('Error during cleanup:', cleanupErr);
    }
    
    // Close the MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the test
testExamClassReferences();
