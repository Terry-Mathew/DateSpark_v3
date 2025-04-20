const express = require('express');
const cors = require('cors');
const multer = require('multer');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const { validationResult, check } = require('express-validator');
const firebase = require('firebase-admin');
const firestore = require('./firestore.cjs');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env';

console.log(`Loading environment from ${envFile} for ${process.env.NODE_ENV || 'development'} environment`);
dotenv.config({ path: path.resolve(__dirname, envFile) });

// Validate environment
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is undefined. Check your environment configuration.');
} else {
  console.log('OPENAI_API_KEY is defined. Length:', process.env.OPENAI_API_KEY.length);
  console.log('OPENAI_API_KEY starts with:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
}

console.log(`Server starting in ${process.env.NODE_ENV || 'development'} mode`);
console.log(`Using Firebase project: ${process.env.FIREBASE_PROJECT_ID}`);

// Import routes
const authRoutes = require('./routes/auth.cjs');
const profileRoutes = require('./routes/profile.cjs');
const aiRoutes = require('./routes/ai.cjs');

const app = express();
const PORT = process.env.PORT || 5002;

// Security middleware
app.use(helmet()); // Set various HTTP headers for security
app.use(xss()); // Sanitize user input

// Configure CORS
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:8080'];
for (let i = 8080; i <= 8100; i++) {
  allowedOrigins.push(`http://localhost:${i}`);
}

if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(',').forEach(origin => {
    allowedOrigins.push(origin.trim());
  });
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to AI routes
app.use('/api/ai', apiLimiter);
app.use('/api/generate-bio', apiLimiter);
app.use('/api/analyze-profile', apiLimiter);
app.use('/api/improve-prompt', apiLimiter);
app.use('/api/conversation-starters', apiLimiter);
app.use('/api/process-image', apiLimiter);

// Express middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image file!'), false);
    }
  }
});

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Check OpenAI API Key at startup
if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith('sk-')) {
  console.error('⚠️ WARNING: Invalid OpenAI API key. API calls will fail.');
  console.error('Current key format: ', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 7) + '...' : 'undefined');
} else {
  console.log('✅ OpenAI API key loaded successfully');
}

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Firebase auth verification middleware (assuming this is imported from a firebase admin SDK setup)
// For a complete implementation, you'd need to set up firebase-admin and verify tokens
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // UNCOMMENT THIS FOR PRODUCTION:
    const decodedToken = await firebase.auth().verifyIdToken(token);
    req.user = decodedToken;
    
    // DELETE THIS FOR PRODUCTION:
    // req.user = { uid: 'demo-user-id' };
    
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Welcome route
app.get('/', (req, res) => {
  res.send('DateSpark API is running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);

/**
 * Analyzes dating profile photos and provides feedback
 */
app.post('/api/analyze-profile', 
  upload.array('photos', 4), 
  [
    check('imageUrls').optional().isArray(),
    check('imageUrls.*').optional().isURL()
  ],
  validateRequest,
  async (req, res) => {
  try {
    console.log('Received analyze-profile request');
    console.log('Files:', req.files ? req.files.length : 'No files');
    console.log('Body imageUrls:', req.body.imageUrls ? req.body.imageUrls.length : 'No imageUrls');
    
    // Check if API key is properly set
    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith('sk-')) {
      console.error('Invalid OpenAI API key format or missing key');
      return res.status(500).json({ error: 'Server configuration error: Missing or invalid API key' });
    }
    
    // Re-initialize OpenAI client within the handler to ensure the key is fresh
    const requestSpecificOpenai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    if ((!req.files || req.files.length === 0) && (!req.body.imageUrls || req.body.imageUrls.length === 0)) {
      return res.status(400).json({ error: 'No photos uploaded' });
    }
    
    let photoUrls = [];
    
    // If files were uploaded directly, store them locally
    if (req.files && req.files.length > 0) {
      // Use local server URLs as fallback
      photoUrls = req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
      console.log('Local photoUrls:', photoUrls);
    } else if (req.body.imageUrls && req.body.imageUrls.length > 0) {
      // Use the provided image URLs
      photoUrls = req.body.imageUrls;
      console.log('Provided imageUrls:', photoUrls);
    }
    
    const analyses = [];
    
    // Analyze each photo
    for (const [index, photoUrl] of photoUrls.entries()) {
      console.log(`Analyzing photo ${index + 1}:`, photoUrl);
      
      const prompt = `
You are a dating profile photo analyst. The user has uploaded the following photo for review. Provide the following:

1. Description: Describe the key elements — setting, lighting, facial expression, pose, outfit, and any standout features.
2. Verdict: Rate the photo for dating app use as either "Good," "Okay," or "Needs Improvement." Be honest and clear.
3. Suggestion: If needed, give one specific suggestion to improve it. Avoid vague or generic advice.

Be concise. Focus on effectiveness, not compliments. Prioritize clarity and practical feedback.

This is photo #${index + 1} of ${photoUrls.length}.
      `;
      
      try {
        const completion = await requestSpecificOpenai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: prompt },
            { 
              role: "user", 
              content: [
                { type: "text", text: "Please analyze this dating profile photo:" },
                { type: "image_url", image_url: { url: photoUrl } }
              ]
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        });
        
        const response = completion.choices[0].message.content;
        console.log('OpenAI response:', response);
        
        // Parse the response
        const sections = response.split(/\d\.\s+/); // Split by numbered sections
        
        if (sections.length >= 4) { // Account for the first empty section
          const description = sections[1].trim();
          const verdict = sections[2].trim();
          const suggestion = sections[3].trim();
          
          analyses.push({
            description,
            verdict: verdict.startsWith("Good") ? "Good" : 
                    verdict.startsWith("Okay") ? "Okay" : "Needs Improvement",
            suggestion
          });
        } else {
          // Fallback if parsing fails
          analyses.push({
            description: "Unable to analyze image properly",
            verdict: "Needs Improvement",
            suggestion: "Please upload a clearer photo with better lighting"
          });
        }
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError.message);
        analyses.push({
          description: "Error analyzing this image",
          verdict: "Needs Improvement",
          suggestion: "There was an error analyzing this image. Please try a different photo."
        });
      }
    }
    
    // Generate overall verdict and suggestion
    let overallVerdict = "Review your photo selection";
    let overallSuggestion = "Consider adding more diverse photos";
    
    if (analyses.length > 0) {
      try {
        const overallPrompt = `
Based on the analysis of ${photoUrls.length} dating profile photos, provide:
1. An overall verdict on the user's photo selection
2. One key suggestion to improve their photo selection as a whole

Be direct and actionable in your feedback.
        `;
        
        const overallCompletion = await requestSpecificOpenai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: overallPrompt },
            { role: "user", content: JSON.stringify(analyses) }
          ],
          temperature: 0.7,
          max_tokens: 200,
        });
        
        const overallResponse = overallCompletion.choices[0].message.content;
        const overallSections = overallResponse.split(/\d\.\s+/);
        
        if (overallSections.length > 1) {
          overallVerdict = overallSections[1].trim();
        }
        
        if (overallSections.length > 2) {
          overallSuggestion = overallSections[2].trim();
        }
      } catch (overallError) {
        console.error('Error generating overall assessment:', overallError.message);
        // Fall back to defaults set above
      }
    }
    
    res.status(200).json({
      analyses,
      overallVerdict,
      overallSuggestion
    });
    
  } catch (error) {
    console.error('Error analyzing profile:', error);
    res.status(500).json({ error: 'Failed to analyze profile', details: error.message });
  }
});

/**
 * Build My Profile - API Endpoint
 * Generates a dating profile bio based on user input
 */
app.post('/api/generate-bio',
  verifyFirebaseToken,
  [
    check('age').optional().isString().trim().escape(),
    check('job').optional().isString().trim().escape(),
    check('interests').optional().isString().trim().escape(),
    check('personality').optional().isString().trim().escape(),
    check('lookingFor').optional().isString().trim().escape(),
    check('culturalContext').optional().isString().trim().escape()
  ],
  validateRequest,
  async (req, res) => {
  try {
    const { age, job, interests, personality, lookingFor, culturalContext } = req.body;
    
    // Ensure at least one field is provided
    if (!age && !job && !interests && !personality && !lookingFor) {
      return res.status(400).json({ error: 'At least one field is required' });
    }
    
    // Construct the prompt
    const prompt = `
You write dating bios based on user input. Use the following data:

${age ? `- Age: ${age}` : ''}
${job ? `- Job: ${job}` : ''}
${interests ? `- Interests: ${interests}` : ''}
${personality ? `- Personality traits: ${personality}` : ''}
${lookingFor ? `- What they're looking for: ${lookingFor}` : ''}
${culturalContext ? `- Cultural context: ${culturalContext}` : '- Cultural context: American'}

Generate a dating bio under 250 characters. Keep it realistic, grounded, and readable. Focus on personality and lifestyle. Do not mention the user's name.

Avoid:
- Clichés or overused dating tropes
- Puns, emojis, or quirky exaggerations
- Slang or playful sarcasm

The goal is a bio that sounds authentic and confident.
    `;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });
    
    const bio = completion.choices[0].message.content.trim();
    
    res.status(200).json({ bio });
    
  } catch (error) {
    console.error('Error generating bio:', error);
    res.status(500).json({ error: 'Failed to generate bio' });
  }
});

/**
 * Prompt Punch-Up - API Endpoint
 * Improves dating app prompt answers
 */
app.post('/api/improve-prompt',
  verifyFirebaseToken,
  [
    check('originalPrompt').isString().trim().notEmpty(),
    check('tonePreference').optional().isString().trim().escape()
  ],
  validateRequest,
  async (req, res) => {
  try {
    const { originalPrompt, tonePreference } = req.body;
    
    if (!originalPrompt) {
      return res.status(400).json({ error: 'Original prompt is required' });
    }
    
    // Construct the prompt
    const prompt = `
You improve dating app prompt answers. The user submitted this response:

"${originalPrompt}"

Your job:
- Polish the text while keeping the original message
- Make it more confident, specific, and natural
- Keep the user's tone (${tonePreference || 'casual or serious'})

Avoid:
- Clichés
- Wordplay or jokes
- Emojis
- Anything exaggerated or scripted

Return only the revised version.
    `;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });
    
    const improvedPrompt = completion.choices[0].message.content.trim();
    
    res.status(200).json({ improvedPrompt });
    
  } catch (error) {
    console.error('Error improving prompt:', error);
    res.status(500).json({ error: 'Failed to improve prompt' });
  }
});

/**
 * Crush Conversation Starter - API Endpoint
 * Generates personalized conversation starters
 */
app.post('/api/conversation-starters',
  verifyFirebaseToken,
  [
    check('profilePrompt').optional().isString().trim().escape(),
    check('profileAnswer').optional().isString().trim().escape(),
    check('name').optional().isString().trim().escape(),
    check('gender').optional().isString().trim().escape(),
    check('bio').optional().isString().trim().escape(),
    check('interests').optional().isString().trim().escape(),
    check('photoDescription').optional().isString().trim().escape()
  ],
  validateRequest,
  async (req, res) => {
  try {
    const { profilePrompt, profileAnswer, name, gender, bio, interests, photoDescription } = req.body;
    
    // Construct the prompt
    let prompt = `You write first messages for dating app conversations. Use the following:\n\n`;
    
    if (profilePrompt) {
      prompt += `- Crush's profile prompt: ${profilePrompt}\n`;
    }
    
    if (profileAnswer) {
      prompt += `- Crush's answer: ${profileAnswer}\n`;
    }
    
    if (name || gender) {
      prompt += `- User inputs: `;
      if (name) prompt += `Crush's name: ${name}, `;
      if (gender) prompt += `gender: ${gender}, `;
      prompt = prompt.slice(0, -2) + '\n';
    }
    
    // Add additional context if available
    if (bio) {
      prompt += `- Additional context - Bio: ${bio}\n`;
    }
    
    if (interests) {
      prompt += `- Additional context - Interests: ${interests}\n`;
    }
    
    if (photoDescription) {
      prompt += `- Additional context - Photos: ${photoDescription}\n`;
    }
    
    prompt += `\nWrite three messages:
- Based on what the crush shared
- Flirty but respectful
- Personal, not generic
- No pickup lines, no jokes about dating apps or swiping

Then, write three follow-up messages that could be sent after a response.

Finally, provide three tips for messaging this person successfully.

The message should feel human, direct, and relevant to the crush's answer.`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 600,
    });
    
    const response = completion.choices[0].message.content;
    
    // Parse the response to extract messages, follow-ups, and tips
    const sections = response.split(/\n\n+/);
    
    let messages = [];
    let followUps = [];
    let tips = [];
    
    // Extract messages, follow-ups, and tips using regex patterns
    const messageRegex = /^\d+\.\s+(.+)$/;
    
    for (const section of sections) {
      if (section.toLowerCase().includes('message') && !section.toLowerCase().includes('follow-up')) {
        const lines = section.split('\n').filter(line => messageRegex.test(line));
        messages = lines.map(line => line.match(messageRegex)[1].trim());
      } else if (section.toLowerCase().includes('follow-up')) {
        const lines = section.split('\n').filter(line => messageRegex.test(line));
        followUps = lines.map(line => line.match(messageRegex)[1].trim());
      } else if (section.toLowerCase().includes('tip')) {
        const lines = section.split('\n').filter(line => messageRegex.test(line));
        tips = lines.map(line => line.match(messageRegex)[1].trim());
      }
    }
    
    // If parsing fails, extract any numbered lists
    if (messages.length === 0) {
      const allNumberedItems = response.match(/\d+\.\s+([^\n]+)/g) || [];
      if (allNumberedItems.length >= 3) {
        messages = allNumberedItems.slice(0, 3).map(item => item.replace(/^\d+\.\s+/, '').trim());
        if (allNumberedItems.length >= 6) {
          followUps = allNumberedItems.slice(3, 6).map(item => item.replace(/^\d+\.\s+/, '').trim());
          if (allNumberedItems.length >= 9) {
            tips = allNumberedItems.slice(6, 9).map(item => item.replace(/^\d+\.\s+/, '').trim());
          }
        }
      }
    }
    
    res.status(200).json({
      messages: messages.length > 0 ? messages : ["Hi there! I noticed you enjoy [interest]. What's your favorite part about it?"],
      followUps: followUps.length > 0 ? followUps : ["What's been keeping you busy lately?"],
      tips: tips.length > 0 ? tips : ["Be genuine and reference specific details from their profile"]
    });
    
  } catch (error) {
    console.error('Error generating conversation starters:', error);
    res.status(500).json({ error: 'Failed to generate conversation starters' });
  }
});

/**
 * Process Profile Image - API Endpoint
 * Analyzes a profile screenshot and generates conversation starters
 */
app.post('/api/process-image',
  verifyFirebaseToken,
  upload.single('profileImage'),
  [
    check('name').optional().isString().trim().escape(),
    check('gender').optional().isString().trim().escape(),
    check('imageUrl').optional().isURL()
  ],
  validateRequest,
  async (req, res) => {
  try {
    if (!req.file && !req.body.imageUrl) {
      return res.status(400).json({ error: 'No profile image uploaded or provided' });
    }
    
    let imageUrl = req.body.imageUrl; // Use the provided URL if there is one
    
    // If a file was uploaded and we have an authenticated user, store in Firebase Storage
    if (req.file && req.user) {
      try {
        const userId = req.user.uid;
        const bucket = firebase.storage.bucket();
        
        // Upload to Firebase Storage
        const destination = `users/${userId}/conversationStarters/${Date.now()}_${req.file.filename}`;
        
        await bucket.upload(req.file.path, {
          destination,
          metadata: {
            contentType: req.file.mimetype,
          }
        });
        
        // Get public URL
        const [url] = await bucket.file(destination).getSignedUrl({
          action: 'read',
          expires: '01-01-2100'
        });
        
        // Use the Firebase URL
        imageUrl = url;
        console.log("File stored in Firebase Storage:", imageUrl);
      } catch (firebaseError) {
        console.error("Error uploading to Firebase Storage:", firebaseError);
        // If Firebase upload fails, fall back to local URL
        imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      }
    } else if (req.file) {
      // If no user, just use local URL
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }
    
    // Use the determined image URL
    const { name, gender } = req.body;
    
    // First, use vision model to extract information from the image
    const visionPrompt = `
You are analyzing a screenshot of a dating profile. Extract the following information in detail:
1. Bio text - capture the exact wording
2. Profile prompts and answers - include all visible prompts and full answers
3. Interests and hobbies - list everything you can identify
4. Description of any visible photos - describe what you see in each photo in detail, including the person, setting, activities
5. Any other relevant details from the profile that could be used for conversation starters

Format your response as detailed bullet points under each category. Be specific and thorough in your analysis.
    `;
    
    const visionCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: visionPrompt },
        { 
          role: "user", 
          content: [
            { type: "text", text: "Please analyze this dating profile screenshot thoroughly:" },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 800,
    });
    
    const profileAnalysis = visionCompletion.choices[0].message.content;
    
    // Now generate conversation starters based on the extracted profile information
    const conversationPrompt = `
You write first messages for dating app conversations. I'll provide information extracted from a dating profile:

${profileAnalysis}

${name ? `- Crush's name: ${name}` : ''}
${gender ? `- Crush's gender: ${gender}` : ''}

Write three highly personalized first messages:
- Each message should clearly reference specific details from the profile analysis
- Make them flirty but respectful
- Ensure they are personal, not generic
- Avoid pickup lines, jokes about dating apps, or references to swiping
- Each message should end with a natural question to encourage a response

Then, write three follow-up messages that could be sent after a response, again referencing profile details.

Finally, provide three specific tips for messaging this person successfully based on their profile.

The messages should feel authentic, direct, and clearly relevant to what you learned from their profile.
    `;
    
    const starterCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: conversationPrompt }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });
    
    const response = starterCompletion.choices[0].message.content;
    
    // Parse the response to extract messages, follow-ups, and tips (same as above)
    const sections = response.split(/\n\n+/);
    
    let messages = [];
    let followUps = [];
    let tips = [];
    
    const messageRegex = /^\d+\.\s+(.+)$/;
    
    for (const section of sections) {
      if (section.toLowerCase().includes('message') && !section.toLowerCase().includes('follow-up')) {
        const lines = section.split('\n').filter(line => messageRegex.test(line));
        messages = lines.map(line => line.match(messageRegex)[1].trim());
      } else if (section.toLowerCase().includes('follow-up')) {
        const lines = section.split('\n').filter(line => messageRegex.test(line));
        followUps = lines.map(line => line.match(messageRegex)[1].trim());
      } else if (section.toLowerCase().includes('tip')) {
        const lines = section.split('\n').filter(line => messageRegex.test(line));
        tips = lines.map(line => line.match(messageRegex)[1].trim());
      }
    }
    
    // If parsing fails, extract any numbered lists
    if (messages.length === 0) {
      const allNumberedItems = response.match(/\d+\.\s+([^\n]+)/g) || [];
      if (allNumberedItems.length >= 3) {
        messages = allNumberedItems.slice(0, 3).map(item => item.replace(/^\d+\.\s+/, '').trim());
        if (allNumberedItems.length >= 6) {
          followUps = allNumberedItems.slice(3, 6).map(item => item.replace(/^\d+\.\s+/, '').trim());
          if (allNumberedItems.length >= 9) {
            tips = allNumberedItems.slice(6, 9).map(item => item.replace(/^\d+\.\s+/, '').trim());
          }
        }
      }
    }
    
    // Save to Firestore if user is authenticated
    if (req.user) {
      const conversationStarterData = {
        name: name || '',
        gender: gender || '',
        imageUrl: imageUrl, // Now using the Firebase Storage URL when available
        userId: req.user.uid,
        analysisResults: {
          messages,
          followUps,
          tips
        },
        createdAt: new Date()
      };
      
      await firestore.saveConversationStarter(conversationStarterData);
    }
    
    return res.status(200).json({
      success: true,
      imageUrl: imageUrl, // Return the image URL (will be Firebase URL if uploaded)
      results: {
        messages,
        followUps,
        tips
      }
    });
  } catch (error) {
    console.error('Error processing profile image:', error);
    return res.status(500).json({ error: 'Failed to process profile image', details: error.message });
  }
});

// Generate dating app prompt responses
app.post('/api/generate-prompt-responses', verifyFirebaseToken, async (req, res) => {
  try {
    const { prompt, tonePreference } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Create a system message for the type of response
    const systemMessage = `You are a dating profile assistant helping users create engaging responses to dating app prompts.
Generate 3 unique, creative responses for the prompt "${prompt}".
Tone: ${tonePreference || 'witty'}
Make each response authentic, engaging, and reflective of someone with an interesting personality.
Each response should be 1-3 sentences, distinct from the others.`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `Create 3 unique responses for the dating app prompt: "${prompt}"` }
      ],
      temperature: 0.8,
      max_tokens: 500
    });
    
    // Extract the response text
    const content = response.choices[0].message.content;
    
    // Parse the 3 responses from the generated text
    const responses = content.split(/\d+\.\s/).filter(Boolean).map(r => r.trim());
    
    res.json({ responses });
  } catch (error) {
    console.error('Error generating prompt responses:', error);
    res.status(500).json({ error: 'Failed to generate prompt responses' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api/`);
});