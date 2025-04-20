const OpenAI = require('openai');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env';

console.log(`Loading environment from ${envFile}`);
dotenv.config({ path: path.resolve(__dirname, envFile) });

async function verifyOpenAIKey() {
  try {
    console.log('Verifying OpenAI API key...');
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY is missing in environment variables');
      return;
    }
    
    console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
    
    if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
      console.error('❌ Invalid API key format. Key should start with "sk-"');
      console.error('Current key prefix:', process.env.OPENAI_API_KEY.substring(0, 7));
      return;
    }
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Simple test call to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, this is a test message to verify the API connection." }],
      max_tokens: 10
    });
    
    if (response && response.choices && response.choices.length > 0) {
      console.log('✅ OpenAI API key is valid and working!');
      console.log('Sample response:', response.choices[0].message.content);
    } else {
      console.error('❌ Response format unexpected:', response);
    }
  } catch (error) {
    console.error('❌ Error verifying OpenAI API key:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

verifyOpenAIKey(); 