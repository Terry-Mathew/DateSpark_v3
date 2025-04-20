# Setting Up OpenAI API for DateSpark

This document provides instructions for setting up the OpenAI API integration for DateSpark. The application uses OpenAI to power several key features, including dating profile analysis, bio generation, prompt improvement, and conversation starters.

## Prerequisites

1. An OpenAI account (https://platform.openai.com/)
2. Node.js (v16 or newer)
3. npm or yarn

## Getting an OpenAI API Key

1. Go to https://platform.openai.com/ and sign in or create an account
2. Navigate to the API Keys section in your account dashboard
3. Create a new API key (make sure to keep this secure and don't share it publicly)
4. Copy the generated API key for the next steps

## Environment Configuration

1. Create or edit the `.env` file in the root of the project:

```
# OpenAI API
OPENAI_API_KEY=your-api-key-here

# Backend server configuration
PORT=5001
```

2. Create a `.env.local` file in the root directory for frontend configuration:

```
# API Endpoint
VITE_OPENAI_API_ENDPOINT=http://localhost:5001/api
```

## Starting the Backend Server

The backend server handles all OpenAI API calls to avoid exposing your API key in the frontend code.

1. Navigate to the backend directory:
```
cd datespark-backend
```

2. Install dependencies:
```
npm install
```

3. Start the server:
```
node server.cjs
```

The server should start and display a message indicating it's running on port 5001.

## OpenAI Features Implementation

The app uses OpenAI for the following features:

### 1. Analyze My Profile

This feature uses OpenAI's capabilities to analyze dating profile photos and provide professional feedback.

**API Prompt:**
```
You are a dating profile photo analyst. The user has uploaded 3–4 photos for review. For each photo, provide the following:

1. Description: Describe the key elements — setting, lighting, facial expression, pose, outfit, and any standout features.
2. Verdict: Rate the photo for dating app use as either "Good," "Okay," or "Needs Improvement." Be honest and clear.
3. Suggestion: If needed, give one specific suggestion to improve it. Avoid vague or generic advice.

Be concise. Focus on effectiveness, not compliments. Prioritize clarity and practical feedback.
```

### 2. Build My Profile

This feature generates a natural, engaging dating profile bio based on user-provided information.

**API Prompt:**
```
You write dating bios based on user input. Use the following data:

- Age
- Job
- Interests
- Personality traits
- What they're looking for

Generate a dating bio under 250 characters. Keep it realistic, grounded, and readable. Focus on personality and lifestyle. Do not mention the user's name.

Avoid:
- Clichés or overused dating tropes
- Puns, emojis, or quirky exaggerations
- Slang or playful sarcasm

The goal is a bio that sounds authentic and confident.
```

### 3. Prompt Punch-Up

This feature improves dating app prompt answers by making them more engaging and authentic.

**API Prompt:**
```
You improve dating app prompt answers. The user submitted this response:

[Insert user response]

Your job:
- Polish the text while keeping the original message
- Make it more confident, specific, and natural
- Keep the user's tone (casual or serious)

Avoid:
- Clichés
- Wordplay or jokes
- Emojis
- Anything exaggerated or scripted

Return only the revised version.
```

### 4. Crush Conversation Starter

This feature generates personalized conversation starters based on information from a crush's profile.

**API Prompt:**
```
You write first messages for dating app conversations. Use the following:

- Crush's profile prompt: [Insert text]
- Crush's answer: [Insert answer]
- User inputs (optional): Crush's name, gender, cultural context

Write one message:
- Based on what the crush shared
- Flirty but respectful
- Personal, not generic
- No pickup lines, no jokes about dating apps or swiping

The message should feel human, direct, and relevant to the crush's answer.
```

## Testing Your Setup

To test if your OpenAI API integration is working correctly:

1. Start the backend server
2. Start the frontend application
3. Try using one of the features like "Build My Profile" or "Conversation Starters"
4. Check the console log for any error messages if the feature doesn't work as expected

## Troubleshooting

- **Error: API key not configured**: Make sure your `.env` file contains the correct OpenAI API key
- **Error: Cannot connect to API**: Ensure the backend server is running and accessible at the URL specified in `.env.local`
- **Error: Rate limit exceeded**: OpenAI has rate limits for API calls. Check your usage on the OpenAI dashboard
- **Error: Invalid prompt**: Ensure the data being sent to OpenAI follows their usage guidelines

## API Costs

Be aware that using the OpenAI API incurs costs based on the number of tokens processed. Monitor your usage on the OpenAI dashboard to avoid unexpected charges.

## Security Considerations

- Never expose your OpenAI API key in frontend code
- Use environment variables for sensitive information
- Consider implementing rate limiting to prevent abuse
- Secure user data and only send necessary information to the API 