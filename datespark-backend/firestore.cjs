const { db } = require('./firebase.cjs');

// Function to save a conversation starter
const saveConversationStarter = async (data) => {
  try {
    const docRef = await db.collection('conversationStarters').add(data);
    console.log('Conversation starter saved with ID:', docRef.id);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Error saving conversation starter:', error);
    throw error;
  }
};

// Function to get all conversation starters for a user
const getConversationStarters = async (userId) => {
  try {
    const snapshot = await db.collection('conversationStarters')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting conversation starters:', error);
    throw error;
  }
};

// Export functions
module.exports = {
  saveConversationStarter,
  getConversationStarters
}; 