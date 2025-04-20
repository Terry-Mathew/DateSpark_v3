import { toast } from "sonner";
import { auth } from "@/firebase";
import axios from 'axios';

// Interface for profile analysis request
export interface ProfileAnalysisRequest {
  imageUrls?: string[];
  photos?: FormData;
}

// Interface for profile analysis response
export interface ProfileAnalysisResponse {
  analyses: {
    description: string;
    verdict: 'Good' | 'Okay' | 'Needs Improvement';
    suggestion: string;
  }[];
  overallVerdict: string;
  overallSuggestion: string;
}

// Interface for prompt responses
export interface PromptResponse {
  prompt: string;
  responses: string[];
}

// API base URL (uses environment variable if available)
const API_BASE_URL = import.meta.env.VITE_OPENAI_API_ENDPOINT || '/api';

/**
 * Get authentication token for API requests
 */
const getAuthToken = async (): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn('User not authenticated, proceeding without token');
      return '';
    }
    
    console.log('Getting auth token for user:', user.uid);
    const token = await user.getIdToken(true); // Force refresh token
    
    if (!token) {
      console.error('Failed to get authentication token, token is empty');
      return '';
    }
    
    return token;
  } catch (error) {
    console.error('Error getting authentication token:', error);
    throw error;
  }
};

/**
 * Analyze dating profile using OpenAI
 * @param profileData Profile data including images and optional bio/goals
 * @returns Promise with analysis response
 */
export const analyzeDatingProfile = async (
  profileData: ProfileAnalysisRequest
): Promise<ProfileAnalysisResponse> => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/ai/analyze-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error analyzing profile');
    }
    
    return await response.json();
  } catch (error: any) {
    toast.error(error.message || 'Error analyzing profile');
    console.error('Profile analysis error:', error);
    throw error;
  }
};

/**
 * Generate bio suggestions based on user inputs
 * @param input User information for bio generation
 * @returns Promise with bio suggestions
 */
export const generateBioSuggestions = async (
  input: { 
    interests: string[]; 
    personality: string; 
    lookingFor: string;
    tone?: string;
  }
): Promise<string[]> => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/ai/generate-bio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(input)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error generating bio suggestions');
    }
    
    const data = await response.json();
    return data.suggestions;
  } catch (error: any) {
    toast.error(error.message || 'Error generating bio suggestions');
    console.error('Bio generation error:', error);
    throw error;
  }
};

/**
 * Get message suggestions for conversations
 * @param input Conversation history and interests
 * @returns Promise with message suggestions
 */
export const getMessageSuggestions = async (
  input: { 
    conversationHistory: string[]; 
    userInterests: string[];
    matchInterests?: string[];
  }
): Promise<string[]> => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/ai/suggest-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(input)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error generating message suggestions');
    }
    
    const data = await response.json();
    return data.suggestions;
  } catch (error: any) {
    toast.error(error.message || 'Error generating message suggestions');
    console.error('Message suggestion error:', error);
    throw error;
  }
};

/**
 * Generate creative responses for dating app prompts
 * @param prompt The dating app prompt
 * @param tone Optional tone for the responses
 * @returns Promise with prompt responses
 */
export const generatePromptResponses = async (
  prompt: string,
  tone: string = 'witty'
): Promise<PromptResponse> => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/ai/prompt-punchup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ prompt, tone })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error generating prompt responses');
    }
    
    const data = await response.json();
    return {
      prompt,
      responses: data.responses
    };
  } catch (error: any) {
    toast.error(error.message || 'Error generating prompt responses');
    console.error('Prompt response generation error:', error);
    throw error;
  }
};

// Configuration types
interface OpenAIConfig {
  temperature?: number;
  max_tokens?: number;
  model?: string;
}

// Generic response interface
interface OpenAIResponse<T> {
  data: T;
  status: number;
  success: boolean;
  error?: string;
}

// Feature-specific interfaces
export interface BuildProfileRequest {
  age?: string;
  job?: string;
  interests?: string;
  personality?: string;
  lookingFor?: string;
  culturalContext?: string;
}

export interface BuildProfileResponse {
  bio: string;
}

export interface PromptPunchUpRequest {
  originalPrompt: string;
  tonePreference?: string; // optional tone preference
}

export interface PromptResponsesRequest {
  prompt: string;
  tonePreference?: string; // optional tone preference
}

export interface PromptPunchUpResponse {
  improvedPrompt: string;
}

export interface ConversationStarterRequest {
  name?: string;
  gender?: string;
  profilePrompt?: string;
  profileAnswer?: string;
  bio?: string;
  interests?: string;
  photoDescription?: string;
}

export interface ConversationStarterResponse {
  messages: string[];
  followUps?: string[];
  tips?: string[];
}

// API interface types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * OpenAI service with methods for different dating app features
 */
class OpenAIService {
  private defaultConfig: OpenAIConfig = {
    temperature: 0.7,
    max_tokens: 500,
    model: "gpt-4o"
  };

  /**
   * Analyze dating profile photos
   * @param data Object containing image URLs or FormData with photos
   * @returns Analysis for each photo and overall verdict
   */
  async analyzeProfilePhotos(data: ProfileAnalysisRequest): Promise<OpenAIResponse<ProfileAnalysisResponse>> {
    try {
      const token = await getAuthToken();
      
      // Determine if we're sending FormData or JSON
      const isFormData = data.photos instanceof FormData;
      
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`
      };
      
      // Don't set Content-Type for FormData, let the browser set it with the boundary
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }
      
      console.log("Sending request to analyze-profile endpoint with token:", token ? "Token exists" : "Token missing");
      console.log("Request type:", isFormData ? "FormData" : "JSON with URLs");
      console.log("Data:", isFormData ? "FormData object" : JSON.stringify(data));
      
      const response = await axios.post(
        `${API_BASE_URL}/analyze-profile`, 
        isFormData ? data.photos : data,
        { headers }
      );
      
      return {
        data: response.data,
        status: response.status,
        success: true
      };
    } catch (error) {
      console.error('Error analyzing profile photos:', error);
      return {
        data: { analyses: [], overallVerdict: '', overallSuggestion: '' },
        status: error.response?.status || 500,
        success: false,
        error: error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to analyze profile photos'
      };
    }
  }

  /**
   * Generate a dating profile bio
   * @param data User information
   * @returns Generated bio
   */
  async generateProfileBio(data: BuildProfileRequest): Promise<OpenAIResponse<BuildProfileResponse>> {
    try {
      const token = await getAuthToken();
      
      const response = await axios.post(`${API_BASE_URL}/generate-bio`, {
        age: data.age,
        job: data.job,
        interests: data.interests,
        personality: data.personality,
        lookingFor: data.lookingFor,
        culturalContext: data.culturalContext || 'American'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return {
        success: true,
        status: 200,
        data: response.data
      };
    } catch (error: any) {
      console.error("Error generating profile bio:", error);
      const message = error.response?.data?.error || error.message || "Failed to generate profile bio";
      toast.error(message);
      
      return {
        success: false,
        status: error.response?.status || 500,
        error: message,
        data: { bio: "" }
      };
    }
  }

  /**
   * Improve a dating prompt answer
   * @param data Original prompt and optional tone preference
   * @returns Improved prompt answer
   */
  async improvePromptAnswer(data: PromptPunchUpRequest): Promise<OpenAIResponse<PromptPunchUpResponse>> {
    try {
      const token = await getAuthToken();
      
      const response = await axios.post(`${API_BASE_URL}/improve-prompt`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return {
        data: response.data,
        status: response.status,
        success: true
      };
    } catch (error) {
      console.error('Error improving prompt:', error);
      return {
        data: { improvedPrompt: '' },
        status: error.response?.status || 500,
        success: false,
        error: error.response?.data?.message || 'Failed to improve prompt'
      };
    }
  }

  /**
   * Generate conversation starters for a crush
   * @param data Information about the crush's profile
   * @returns Conversation starters, follow-ups, and tips
   */
  async generateConversationStarters(data: ConversationStarterRequest): Promise<OpenAIResponse<ConversationStarterResponse>> {
    try {
      const token = await getAuthToken();
      
      const response = await axios.post(`${API_BASE_URL}/conversation-starters`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return {
        data: response.data,
        status: response.status,
        success: true
      };
    } catch (error) {
      console.error('Error generating conversation starters:', error);
      return {
        data: { messages: [], followUps: [], tips: [] },
        status: error.response?.status || 500,
        success: false,
        error: error.response?.data?.message || 'Failed to generate conversation starters'
      };
    }
  }

  /**
   * Process an uploaded profile image to generate conversation starters
   * @param formData FormData containing the image file and optional context
   * @returns Conversation starters based on image analysis
   */
  async processProfileImage(formData: FormData): Promise<OpenAIResponse<ConversationStarterResponse>> {
    try {
      const token = await getAuthToken();
      
      console.log("Sending profile image to process-image endpoint with token:", token ? "Token exists" : "Token missing");
      console.log("FormData contains keys:", [...formData.keys()]);
      
      // Check if we have the required image file
      if (!formData.has('profileImage')) {
        throw new Error("No profile image found in form data");
      }
      
      const response = await axios.post(`${API_BASE_URL}/process-image`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't manually set Content-Type for FormData
        }
      });
      
      return {
        data: response.data,
        status: response.status,
        success: true
      };
    } catch (error) {
      console.error('Error processing profile image:', error);
      return {
        data: { messages: [], followUps: [], tips: [] },
        status: error.response?.status || 500,
        success: false,
        error: error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to process profile image'
      };
    }
  }

  // Generate responses for a dating app prompt
  async generatePromptResponses(data: PromptResponsesRequest): Promise<OpenAIResponse<{ responses: string[] }>> {
    try {
      const token = await getAuthToken();
      
      const response = await axios.post(`${API_BASE_URL}/generate-prompt-responses`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return {
        data: response.data,
        status: response.status,
        success: true
      };
    } catch (error) {
      console.error('Error generating prompt responses:', error);
      return {
        data: { responses: [] },
        status: error.response?.status || 500,
        success: false,
        error: error.response?.data?.message || 'Failed to generate prompt responses'
      };
    }
  }
}

// Export a singleton instance
export const openAIService = new OpenAIService();
export default openAIService; 