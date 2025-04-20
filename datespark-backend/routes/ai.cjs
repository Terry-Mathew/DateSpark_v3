const express = require('express');
const OpenAI = require('openai');
const router = express.Router();
const firebase = require('../firebase.cjs');
const db = firebase.firestore;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware to verify Firebase authentication
const verifyAuth = async (req, res, next) => {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decodedToken = await firebase.auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

/**
 * Analyze dating profile photos and bio
 */
router.post('/analyze-profile', verifyAuth, async (req, res) => {
  const { images, bio, goals, preferences } = req.body;
  const userId = req.user.uid;
  
  if (!images || !images.length) {
    return res.status(400).json({ error: 'At least one image is required' });
  }
  
  try {
    // Prepare the prompt with all the available information
    let prompt = `Analyze this dating profile:\n\nPhotos: ${images.length} photos provided`;
    
    if (bio) {
      prompt += `\n\nBio: ${bio}`;
    }
    
    if (goals) {
      prompt += `\n\nRelationship Goals: ${goals}`;
    }
    
    if (preferences) {
      prompt += `\n\nPreferences: ${preferences}`;
    }
    
    prompt += `\n\nProvide a detailed analysis with the following sections:
    1. Overall Score (1-10)
    2. Strengths (3-5 bullet points)
    3. Areas for Improvement (3-5 bullet points)
    4. Specific Suggestions for Improvement
    5. Detailed Photo Analysis
    6. Bio Feedback (if provided)
    
    Format the response as JSON with the following structure:
    {
      "overallScore": number,
      "strengths": string[],
      "weaknesses": string[],
      "improvementSuggestions": string[],
      "detailedAnalysis": {
        "photoQuality": {
          "score": number,
          "feedback": string
        },
        "diversity": {
          "score": number,
          "feedback": string
        },
        "impression": {
          "score": number,
          "feedback": string
        },
        "bioFeedback": {
          "score": number,
          "feedback": string
        }
      }
    }`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            ...images.map(imageUrl => ({
              type: "image_url",
              image_url: { url: imageUrl }
            }))
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000
    });
    
    const response = JSON.parse(completion.choices[0].message.content);
    
    // Store the analysis in Firestore
    await db.collection('profileAnalyses').doc(userId).set({
      userId,
      analysis: response,
      createdAt: firebase.FieldValue.serverTimestamp(),
      images,
      bio,
      goals,
      preferences
    });
    
    res.json(response);
  } catch (error) {
    console.error('Profile analysis error:', error);
    res.status(500).json({ error: 'Error analyzing profile' });
  }
});

/**
 * Generate bio suggestions based on user inputs
 */
router.post('/generate-bio', verifyAuth, async (req, res) => {
  const { interests, personality, lookingFor, tone = 'friendly' } = req.body;
  const userId = req.user.uid;
  
  if (!interests || !personality || !lookingFor) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  try {
    const prompt = `Generate 3 dating profile bio options for a person with the following characteristics:
    - Interests: ${interests.join(', ')}
    - Personality: ${personality}
    - Looking for: ${lookingFor}
    - Tone: ${tone}
    
    Each bio should be approximately 150-200 characters and have a different style or focus.
    Format the response as a JSON array of strings, each string being a bio option.`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a dating profile expert who helps users create compelling bios." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000
    });
    
    const response = JSON.parse(completion.choices[0].message.content);
    
    // Store the bio suggestions in Firestore
    await db.collection('bioSuggestions').add({
      userId,
      suggestions: response.suggestions,
      createdAt: firebase.FieldValue.serverTimestamp(),
      input: { interests, personality, lookingFor, tone }
    });
    
    res.json(response);
  } catch (error) {
    console.error('Bio generation error:', error);
    res.status(500).json({ error: 'Error generating bio suggestions' });
  }
});

/**
 * Generate message suggestions for conversations
 */
router.post('/suggest-messages', verifyAuth, async (req, res) => {
  const { conversationHistory, userInterests, matchInterests } = req.body;
  const userId = req.user.uid;
  
  if (!conversationHistory || !userInterests) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  try {
    const prompt = `Generate 3 message suggestions for the next response in this dating app conversation:
    
    Conversation history:
    ${conversationHistory.join('\n')}
    
    My interests: ${userInterests.join(', ')}
    ${matchInterests ? `Their interests: ${matchInterests.join(', ')}` : ''}
    
    Provide 3 different suggestions that are engaging, authentic, and likely to get a positive response.
    Format the response as a JSON array of strings, each string being a message suggestion.`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a dating conversation expert who helps users craft engaging messages." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800
    });
    
    const response = JSON.parse(completion.choices[0].message.content);
    
    res.json(response);
  } catch (error) {
    console.error('Message suggestion error:', error);
    res.status(500).json({ error: 'Error generating message suggestions' });
  }
});

/**
 * Generate creative responses for dating app prompts
 */
router.post('/prompt-punchup', verifyAuth, async (req, res) => {
  const { prompt, tone = 'witty' } = req.body;
  const userId = req.user.uid;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  try {
    const promptText = `Generate 3 creative, ${tone} responses for the following dating app prompt:
    
    PROMPT: "${prompt}"
    
    The responses should be:
    - Unique and attention-grabbing
    - Between 100-150 characters each
    - Showcasing personality and humor
    - Avoiding clichés and generic answers
    - Each response should have a different approach or angle
    
    Format the response as a JSON object with a "responses" array containing 3 strings.`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are a dating profile expert who specializes in creating witty, engaging prompt responses that help people stand out and showcase their personality on dating apps."
        },
        { role: "user", content: promptText }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000
    });
    
    const response = JSON.parse(completion.choices[0].message.content);
    
    // Store the prompt responses in Firestore
    await db.collection('promptResponses').add({
      userId,
      prompt,
      responses: response.responses,
      tone,
      createdAt: firebase.FieldValue.serverTimestamp()
    });
    
    res.json(response);
  } catch (error) {
    console.error('Prompt response generation error:', error);
    res.status(500).json({ error: 'Error generating prompt responses' });
  }
});

module.exports = router; 