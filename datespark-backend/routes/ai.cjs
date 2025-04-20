const express = require('express');
const OpenAI = require('openai');
const router = express.Router();
const firebase = require('../firebase.cjs');
const db = firebase.firestore;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with original extension
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    cb(null, fileName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

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
 * Upload photo endpoint
 * This endpoint accepts image files and returns URLs that can be used for analysis
 */
router.post('/upload', verifyAuth, upload.single('file'), async (req, res) => {
  const userId = req.user.uid;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  try {
    // Generate the public URL for the file
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5002}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    // Store the file info in Firestore
    await db.collection('userFiles').add({
      userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: fileUrl,
      mimeType: req.file.mimetype,
      size: req.file.size,
      createdAt: firebase.FieldValue.serverTimestamp()
    });
    
    // Return the file URL to the client
    res.status(200).json({
      success: true,
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

/**
 * Analyze dating profile photos and bio
 */
router.post('/analyze-profile', verifyAuth, async (req, res) => {
  try {
    const { photos, bio, goals, preferences } = req.body;
    
    // Validate request
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ error: 'No photos provided for analysis' });
    }
    
    // Get user info for personalization
    const uid = req.user.uid;
    
    console.log(`Processing profile analysis for user ${uid} with ${photos.length} photos`);
    
    // Prepare the prompt for OpenAI
    let prompt = `Analyze these ${photos.length} dating profile photos`;
    
    if (bio) prompt += ` and the following bio: "${bio}"`;
    if (goals) prompt += `. The user's dating goals are: "${goals}"`;
    if (preferences) prompt += `. Their preferences are: "${preferences}"`;
    
    prompt += `\n\nFor each photo, provide:
1. A brief description of what's in the photo
2. A verdict on whether it's a good dating profile photo
3. A specific suggestion to improve it

Then, provide:
1. An overall first impression score (1-10)
2. Whether you would "swipe right" or "swipe left" on this profile and why
3. Key strengths of the profile
4. Specific improvement suggestions

Format the response as a JSON object with these fields:
{
  "photoAnalysis": [
    { "description": "", "verdict": "", "suggestion": "" },
    ...
  ],
  "overallScore": 7.5,
  "firstImpression": {
    "would_swipe": "right | left",
    "reason": ""
  },
  "strengths": ["", "", ""],
  "improvements": ["", "", ""]
}`;

    // Call OpenAI for analysis
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    const messages = [
      {
        role: "system",
        content: "You are a dating profile consultant who helps people improve their dating profiles. You analyze profile photos and bios, then provide constructive feedback and suggestions."
      },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          ...photos.map(photo => ({ type: "image_url", image_url: { url: photo } }))
        ]
      }
    ];
    
    console.log("Sending analysis request to OpenAI...");
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: messages,
      max_tokens: 1500
    });
    
    console.log("Received response from OpenAI");
    
    // Parse the response
    let analysisResult;
    try {
      const responseText = completion.choices[0].message.content;
      
      // Try to extract JSON from the response text
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                        responseText.match(/{[\s\S]*}/);
                        
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        analysisResult = JSON.parse(jsonStr);
      } else {
        analysisResult = { error: "Could not parse AI response", rawResponse: responseText };
      }
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      analysisResult = { 
        error: "Error parsing analysis result", 
        message: completion.choices[0].message.content 
      };
    }
    
    // Store the result in Firestore
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const analysisRef = await db.collection('profile_analyses').add({
      userId: uid,
      result: analysisResult,
      timestamp,
      photoCount: photos.length
    });
    
    // Return the analysis result
    return res.json({ 
      id: analysisRef.id,
      ...analysisResult
    });
    
  } catch (error) {
    console.error('Error analyzing profile:', error);
    return res.status(500).json({ error: 'Failed to analyze profile', message: error.message });
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