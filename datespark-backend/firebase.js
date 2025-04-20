const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env';

dotenv.config({ path: path.resolve(__dirname, envFile) });

// Use service account from environment
let serviceAccount;
try {
  serviceAccount = require('./firebase-key.json');
  console.log(`Loaded Firebase service account for ${process.env.NODE_ENV} environment`);
} catch (error) {
  console.error('Error loading Firebase service account:', error);
  throw error;
}

// Check if Firebase is already initialized
let db, auth, storage;

if (!admin.apps.length) {
  // Initialize Firebase Admin only if not already initialized
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'datespark-bb39a.appspot.com'
  });

  console.log(`Firebase Admin initialized for ${process.env.NODE_ENV} environment`);
  console.log(`Using Firestore project: ${serviceAccount.project_id}`);
} else {
  console.log('Firebase Admin SDK already initialized, reusing existing instance');
}

// Get services from the default app
db = admin.firestore();
auth = admin.auth();
storage = admin.storage();

module.exports = { admin, db, auth, storage };
