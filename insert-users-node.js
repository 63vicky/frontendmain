/**
 * Node.js script to insert users into MongoDB with proper password hashing
 * 
 * Run with: node insert-users-node.js
 * 
 * Prerequisites:
 * - MongoDB server running
 * - Node.js installed
 * - Required packages: mongoose, bcryptjs
 * 
 * Install dependencies with:
 * npm install mongoose bcryptjs
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/exam-system';

// User schema definition based on your application's model
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'teacher', 'principal']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  // Teacher specific fields
  subject: {
    type: String,
    required: function() { return this.role === 'teacher' }
  },
  classes: [{
    type: String
  }],
  // Student specific fields
  class: {
    type: String,
    default: ""
  },
  rollNo: {
    type: String,
    required: function() { return this.role === 'student' }
  },
  subjects: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Sample users data
const users = [
  // Principal
  {
    name: 'Principal Admin',
    email: 'principal@school.com',
    password: 'principal123',
    role: 'principal',
    status: 'active'
  },
  
  // Teachers
  {
    name: 'Math Teacher',
    email: 'math@school.com',
    password: 'teacher123',
    role: 'teacher',
    subject: 'Mathematics',
    classes: ['10A', '10B', '11A'],
    status: 'active'
  },
  {
    name: 'Science Teacher',
    email: 'science@school.com',
    password: 'teacher123',
    role: 'teacher',
    subject: 'Science',
    classes: ['9A', '9B', '10A'],
    status: 'active'
  },
  {
    name: 'English Teacher',
    email: 'english@school.com',
    password: 'teacher123',
    role: 'teacher',
    subject: 'English',
    classes: ['8A', '8B', '9A'],
    status: 'active'
  },
  
  // Students
  {
    name: 'John Student',
    email: 'john@student.com',
    password: 'student123',
    role: 'student',
    class: '10A',
    rollNo: '10001',
    subjects: ['Mathematics', 'Science', 'English'],
    status: 'active'
  },
  {
    name: 'Jane Student',
    email: 'jane@student.com',
    password: 'student123',
    role: 'student',
    class: '10B',
    rollNo: '10002',
    subjects: ['Mathematics', 'Science', 'English'],
    status: 'active'
  },
  {
    name: 'Sam Student',
    email: 'sam@student.com',
    password: 'student123',
    role: 'student',
    class: '9A',
    rollNo: '9001',
    subjects: ['Mathematics', 'Science', 'English'],
    status: 'active'
  },
  {
    name: 'Alex Student',
    email: 'alex@student.com',
    password: 'student123',
    role: 'student',
    class: '9B',
    rollNo: '9002',
    subjects: ['Mathematics', 'Science', 'English'],
    status: 'active'
  },
  {
    name: 'Taylor Student',
    email: 'taylor@student.com',
    password: 'student123',
    role: 'student',
    class: '8A',
    rollNo: '8001',
    subjects: ['Mathematics', 'Science', 'English'],
    status: 'active'
  }
];

// Function to hash a password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Function to insert users with hashed passwords
async function insertUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    let insertedCount = 0;
    let skippedCount = 0;
    
    // Process each user
    for (const userData of users) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`User with email ${userData.email} already exists. Skipping...`);
        skippedCount++;
        continue;
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create new user with hashed password
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      // Save the user
      await user.save();
      console.log(`Inserted user: ${userData.name} (${userData.role})`);
      insertedCount++;
    }
    
    // Display summary
    console.log('\nInsertion Summary:');
    console.log(`Total processed: ${users.length}`);
    console.log(`Inserted: ${insertedCount}`);
    console.log(`Skipped (already exist): ${skippedCount}`);
    
    // Display database counts
    const principalCount = await User.countDocuments({ role: 'principal' });
    const teacherCount = await User.countDocuments({ role: 'teacher' });
    const studentCount = await User.countDocuments({ role: 'student' });
    const totalCount = await User.countDocuments();
    
    console.log('\nDatabase Summary:');
    console.log(`Total Users: ${totalCount}`);
    console.log(`Principals: ${principalCount}`);
    console.log(`Teachers: ${teacherCount}`);
    console.log(`Students: ${studentCount}`);
    
  } catch (error) {
    console.error('Error inserting users:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the insertion function
insertUsers();
