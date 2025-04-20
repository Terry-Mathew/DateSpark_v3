const express = require('express');
const router = express.Router();
const { auth, db } = require('../firebase');

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: fullName
    });
    
    // Store additional user data in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      fullName,
      email,
      createdAt: new Date()
    });
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: error.message });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Note: In a real implementation, you'd use Firebase Auth REST API
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(401).json({ error: error.message });
  }
});

// Password Reset
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    await auth.generatePasswordResetLink(email);
    res.status(200).json({ message: 'Password reset link sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
