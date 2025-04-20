# DateSpark OpenAI Integration Guide

This guide explains how to set up and use the OpenAI integration in the DateSpark application.

## Setup Instructions

### Backend Configuration

1. Navigate to the `datespark-backend` directory and install dependencies:
   ```
   cd datespark-backend
   npm install
   ```

2. Add your OpenAI API key to the `.env` file:
   ```
   OPENAI_API_KEY=your-actual-openai-api-key
   ```

3. Install the OpenAI package if not already installed:
   ```
   npm install openai@3.3.0
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Configuration

The frontend is already configured to communicate with the backend services. Just make sure the frontend is connected to the same Firebase project.

## Available OpenAI Features

### 1. Profile Analysis

The Profile Analysis feature uses OpenAI's GPT-4 Vision model to analyze dating profile photos and provide detailed feedback.

**Frontend Component:** `src/pages/ProfileAnalysis.tsx`
**API Service:** `src/services/openai.ts` - `analyzeDatingProfile()`
**Backend Endpoint:** `POST /api/ai/analyze-profile`

**How to Use:**
- Upload profile photos
- Optionally add bio text and relationship goals
- Click "Analyze My Profile"
- View detailed AI feedback on your dating profile

### 2. Bio Generation

Generate personalized dating profile bio suggestions based on your interests, personality, and relationship goals.

**Frontend Service:** `src/services/openai.ts` - `generateBioSuggestions()`
**Backend Endpoint:** `POST /api/ai/generate-bio`

**Sample Usage:**
```typescript
import { generateBioSuggestions } from '@/services/openai';

const bioSuggestions = await generateBioSuggestions({
  interests: ['hiking', 'photography', 'cooking'],
  personality: 'outgoing and adventurous',
  lookingFor: 'meaningful connection',
  tone: 'playful'
});
```

### 3. Message Suggestions

Get AI-powered conversation starter and message suggestions based on your match's profile and previous messages.

**Frontend Service:** `src/services/openai.ts` - `getMessageSuggestions()`
**Backend Endpoint:** `POST /api/ai/suggest-messages`

**Sample Usage:**
```typescript
import { getMessageSuggestions } from '@/services/openai';

const messageSuggestions = await getMessageSuggestions({
  conversationHistory: [
    'Hi there! I noticed you like hiking too.',
    'Yes! I love hiking the local trails. What's your favorite trail?'
  ],
  userInterests: ['hiking', 'photography', 'cooking'],
  matchInterests: ['hiking', 'travel', 'movies']
});
```

## Security Considerations

- The OpenAI API key is stored only on the backend and never exposed to the client
- All API requests are authenticated using Firebase Auth
- User data and analysis results are stored securely in Firebase Firestore
- Profile images are stored in Firebase Storage with proper security rules

## Troubleshooting

- If you encounter an "API key not valid" error, make sure your OpenAI API key is properly set in the backend `.env` file
- If profile analysis is not working, check that the backend server is running and properly configured
- For any issues with image uploads, check your Firebase Storage rules and configurations

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Storage Rules](https://firebase.google.com/docs/storage/security) 