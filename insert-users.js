// // MongoDB script to insert users into MongoDB Atlas database with pre-hashed passwords
// // Run this script with mongosh:
// // mongosh "mongodb+srv://<username>:<password>@<cluster-url>/<database>" --apiVersion 1 insert-users.js
// //
// // Replace:
// // - <username> with your MongoDB Atlas username
// // - <password> with your MongoDB Atlas password
// // - <cluster-url> with your cluster URL (e.g., cluster0.abc123.mongodb.net)
// // - <database> with your database name (e.g., exam-system)
// //
// // Example:
// // mongosh "mongodb+srv://admin:pass123@cluster0.abc123.mongodb.net/exam-system" --apiVersion 1 insert-users.js
// //
// // Note: If you have special characters in your password, you may need to URL encode them
// //
// // IMPORTANT: This script inserts users with pre-hashed bcrypt passwords
// // The passwords are already hashed and will work with your application's authentication system
// // Plain text passwords used to generate these hashes:
// // - principal123 (for principal users)
// // - teacher123 (for teacher users)
// // - student123 (for student users)
// //
// // Database connection - this is handled automatically by mongosh
// // when you specify the database in the connection string

// // Helper function to generate ObjectId
// function generateObjectId() {
//   return new ObjectId();
// }

// // Current timestamp for createdAt and updatedAt fields
// const now = new Date();

// // Helper function to provide pre-hashed bcrypt passwords
// // Since we can't use bcrypt directly in mongosh, we're using pre-generated hashed passwords
// // These passwords were generated using bcrypt with a salt round of 10
// // DO NOT use these exact hashes in production - they are provided as examples
// function getHashedPassword(plainPassword) {
//   // Map of plain passwords to their bcrypt hashes (salt round 10)
//   const passwordHashes = {
//     'principal123': '$2a$10$XFE0glcJwRruxXS8/LHM9.d/QhOlHAZQQmD2Eg6E3ioLKY1vMpVoO',
//     'teacher123': '$2a$10$5RD9gjYmAMbQ8Bh0.Z9tTe1yKYXp5jj7R7yXKcbZOZJtS.LWP3GDC',
//     'student123': '$2a$10$n7CrE8Q2MR8UVL7LjJkQyeUEZbSZn9YC5yIh1oeK5PwWvUqxZzYwO'
//   };

//   // Return the hash for the given password, or a default hash if not found
//   return passwordHashes[plainPassword] ||
//     // Default hash for 'password123' if the requested password isn't in our map
//     '$2a$10$JwUD.Zy5MzJnrk0TTUYPguGQiS0n4t3jkYjXpdSEHYIFDCCgEGJFW';
// }

// // Sample users data
// const users = [
//   // Principal
//   {
//     name: 'Principal Admin',
//     email: 'principal@school.com',
//     password: getHashedPassword('principal123'),
//     role: 'principal',
//     status: 'active',
//     createdAt: now,
//     updatedAt: now
//   },

//   // Teachers
//   {
//     name: 'Math Teacher',
//     email: 'math@school.com',
//     password: getHashedPassword('teacher123'),
//     role: 'teacher',
//     subject: 'Mathematics',
//     classes: ['10A', '10B', '11A'],
//     status: 'active',
//     createdAt: now,
//     updatedAt: now
//   },
//   {
//     name: 'Science Teacher',
//     email: 'science@school.com',
//     password: getHashedPassword('teacher123'),
//     role: 'teacher',
//     subject: 'Science',
//     classes: ['9A', '9B', '10A'],
//     status: 'active',
//     createdAt: now,
//     updatedAt: now
//   },
//   {
//     name: 'English Teacher',
//     email: 'english@school.com',
//     password: getHashedPassword('teacher123'),
//     role: 'teacher',
//     subject: 'English',
//     classes: ['8A', '8B', '9A'],
//     status: 'active',
//     createdAt: now,
//     updatedAt: now
//   },

//   // Students
//   {
//     name: 'John Student',
//     email: 'john@student.com',
//     password: getHashedPassword('student123'),
//     role: 'student',
//     class: '10A',
//     rollNo: '10001',
//     subjects: ['Mathematics', 'Science', 'English'],
//     status: 'active',
//     createdAt: now,
//     updatedAt: now
//   },
//   {
//     name: 'Jane Student',
//     email: 'jane@student.com',
//     password: getHashedPassword('student123'),
//     role: 'student',
//     class: '10B',
//     rollNo: '10002',
//     subjects: ['Mathematics', 'Science', 'English'],
//     status: 'active',
//     createdAt: now,
//     updatedAt: now
//   },
//   {
//     name: 'Sam Student',
//     email: 'sam@student.com',
//     password: getHashedPassword('student123'),
//     role: 'student',
//     class: '9A',
//     rollNo: '9001',
//     subjects: ['Mathematics', 'Science', 'English'],
//     status: 'active',
//     createdAt: now,
//     updatedAt: now
//   },
//   {
//     name: 'Alex Student',
//     email: 'alex@student.com',
//     password: getHashedPassword('student123'),
//     role: 'student',
//     class: '9B',
//     rollNo: '9002',
//     subjects: ['Mathematics', 'Science', 'English'],
//     status: 'active',
//     createdAt: now,
//     updatedAt: now
//   },
//   {
//     name: 'Taylor Student',
//     email: 'taylor@student.com',
//     password: getHashedPassword('student123'),
//     role: 'student',
//     class: '8A',
//     rollNo: '8001',
//     subjects: ['Mathematics', 'Science', 'English'],
//     status: 'active',
//     createdAt: now,
//     updatedAt: now
//   }
// ];

// // Insert users into the database
// print("Starting user insertion...");

// // Check if users already exist to avoid duplicates
// for (const user of users) {
//   const existingUser = db.users.findOne({ email: user.email });

//   if (existingUser) {
//     print(`User with email ${user.email} already exists. Skipping...`);
//   } else {
//     const result = db.users.insertOne(user);
//     print(`Inserted user: ${user.name} (${user.role}) with ID: ${result.insertedId}`);
//   }
// }

// print("User insertion completed!");

// // Display summary of users in the database
// const principalCount = db.users.countDocuments({ role: 'principal' });
// const teacherCount = db.users.countDocuments({ role: 'teacher' });
// const studentCount = db.users.countDocuments({ role: 'student' });
// const totalCount = db.users.countDocuments();

// print("\nDatabase Summary:");
// print(`Total Users: ${totalCount}`);
// print(`Principals: ${principalCount}`);
// print(`Teachers: ${teacherCount}`);
// print(`Students: ${studentCount}`);

// print("\nScript completed successfully!");
// print("Note: If you're using MongoDB Atlas, make sure your IP address is whitelisted in the Atlas Security settings.");
// print("If you encounter connection issues, check your Network Access settings in the Atlas dashboard.");
