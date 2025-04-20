const express = require('express');
const router = express.Router();
const { db } = require('../firebase.cjs');

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(userDoc.data());
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const userData = req.body;
    
    // Remove sensitive fields if present
    delete userData.password;
    
    await db.collection('users').doc(userId).update({
      ...userData,
      updatedAt: new Date()
    });
    
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 