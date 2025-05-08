// src/seed/admin.seeder.js
const bcrypt = require('bcryptjs');
const User = require('../models/user.model'); // Import the model directly, not destructured

async function createDefaultAdmin() {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' }); // Check for existing admin
    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }

    const adminPassword = 'admin@123'; // Set the password
    const saltRounds = 10; // Number of salt rounds

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Create the default admin
    const newAdmin = new User({
      name: 'Admin',
      firstName: 'Super',
      email: 'admin@example.com',
      password: hashedPassword,
      isVerified: true,
      role: 'admin',
    });

    await newAdmin.save(); // Save the new admin
    console.log('Default admin created');
  } catch (err) {
    console.error('Error creating default admin:', err);
  }
}

module.exports = { createDefaultAdmin };
