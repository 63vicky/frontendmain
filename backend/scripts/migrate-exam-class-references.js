/**
 * Migration script to update exam class references from strings to ObjectIds
 * 
 * This script:
 * 1. Finds all exams with string class references
 * 2. Looks up the corresponding class by name
 * 3. Updates the exam with the class ObjectId
 * 
 * Run with: node scripts/migrate-exam-class-references.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Exam = require('../models/Exam_updated');
const Class = require('../models/Class');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school-management')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function migrateExamClassReferences() {
  try {
    console.log('Starting migration of exam class references...');
    
    // Get all classes for lookup
    const classes = await Class.find({});
    console.log(`Found ${classes.length} classes`);
    
    // Create a map of class names to class IDs for quick lookup
    const classMap = {};
    classes.forEach(cls => {
      // Use a combination of name and section as the key
      const key = `${cls.name}-${cls.section}`;
      classMap[key] = cls._id;
      
      // Also add just the name as a fallback
      classMap[cls.name] = cls._id;
    });
    
    // Find all exams
    const exams = await Exam.find({});
    console.log(`Found ${exams.length} exams to process`);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    // Process each exam
    for (const exam of exams) {
      try {
        // Skip if class is already an ObjectId
        if (typeof exam.class !== 'string') {
          console.log(`Skipping exam ${exam._id}: class is already an ObjectId`);
          skipped++;
          continue;
        }
        
        // Look up class ID by name
        const classId = classMap[exam.class];
        
        if (!classId) {
          console.log(`Warning: No class found with name "${exam.class}" for exam ${exam._id}`);
          errors++;
          continue;
        }
        
        // Update the exam with the class ObjectId
        exam.class = classId;
        await exam.save();
        console.log(`Updated exam ${exam._id} with class ID ${classId}`);
        updated++;
      } catch (err) {
        console.error(`Error processing exam ${exam._id}:`, err);
        errors++;
      }
    }
    
    console.log('\nMigration complete:');
    console.log(`- ${updated} exams updated`);
    console.log(`- ${skipped} exams skipped (already had ObjectId)`);
    console.log(`- ${errors} exams had errors`);
    
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the migration
migrateExamClassReferences();
