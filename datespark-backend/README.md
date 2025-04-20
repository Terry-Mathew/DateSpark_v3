# DateSpark Backend

This is the backend server for the DateSpark application, providing APIs for authentication, profile management, and AI-powered profile analysis and suggestions.

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Firebase project (with Auth, Firestore, and Storage enabled)
- OpenAI API key

### Environment Variables

Create a `.env` file in the root of the backend directory with the following variables:

```
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_DATABASE_URL=https://your-firebase-project-id.firebaseio.com
OPENAI_API_KEY=your-openai-api-key
```

### Firebase Setup

1. Download your Firebase service account key from the Firebase Console
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `firebase-key.json` in the root of the backend directory

2. Ensure your Firebase project has the following services enabled:
   - Authentication (with Email/Password provider)
   - Firestore Database
   - Storage

### Installation

1. Install dependencies
   ```
   npm install
   ```

2. Start the server
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in an existing user

### Profile Management

- `GET /api/profile/:userId` - Get a user's profile
- `POST /api/profile/:userId` - Update a user's profile

### AI Features

- `POST /api/ai/analyze-profile` - Analyze dating profile photos and bio
- `POST /api/ai/generate-bio` - Generate bio suggestions based on user inputs
- `POST /api/ai/suggest-messages` - Generate message suggestions for conversations

## OpenAI Integration

The application uses OpenAI's GPT-4 model to:

1. Analyze dating profile photos and provide feedback
2. Generate bio suggestions
3. Provide conversation starters and message suggestions

## Security

- All API endpoints that access user data require Firebase authentication
- OpenAI API key is stored securely on the server
- User data is stored securely in Firebase Firestore
- Images are stored in Firebase Storage with secure access controls 