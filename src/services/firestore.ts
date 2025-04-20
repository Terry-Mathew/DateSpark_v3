import { db } from '../firebase.js';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  DocumentReference
} from 'firebase/firestore';
import { User } from 'firebase/auth';

// Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  profilePhotos?: string[];
  bioDescription?: string;
  interests?: string[];
  preferredMatches?: string[];
  subscription?: {
    plan: 'free' | 'premium';
    expiresAt?: Timestamp;
  };
}

export interface ProfileAnalysis {
  id: string;
  userId: string;
  photoUrls: string[];
  analysisResults: {
    overallScore?: number;
    recommendations?: string[];
    photoScores?: { [photoUrl: string]: number };
    feedback?: string;
  };
  createdAt: Timestamp | null;
}

export interface ConversationStarter {
  id: string;
  userId: string;
  matchProfile?: {
    interests?: string[];
    bio?: string;
    imageUrl?: string;
  };
  suggestions: string[];
  createdAt: Timestamp | null;
}

export interface PromptPunchUp {
  id: string;
  userId: string;
  prompt: string;
  responses: string[];
  tone?: string;
  createdAt: Timestamp | null;
}

// Collection names
const USERS = 'users';
const PROFILE_ANALYSES = 'profileAnalyses';
const CONVERSATION_STARTERS = 'conversationStarters';
const PROMPT_PUNCH_UPS = 'promptResponses';

// User profile methods
export const createUserProfile = async (user: User, name: string): Promise<void> => {
  const userProfile: UserProfile = {
    id: user.uid,
    email: user.email || '',
    name: name,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp
  };
  
  await setDoc(doc(db, USERS, user.uid), userProfile);
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const docRef = doc(db, USERS, userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  } else {
    return null;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
  const docRef = doc(db, USERS, userId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

// Profile analysis methods
export const saveProfileAnalysis = async (userId: string, photoUrls: string[], analysisResults: ProfileAnalysis['analysisResults']): Promise<string> => {
  const analysisRef = doc(collection(db, PROFILE_ANALYSES));
  
  const analysis: ProfileAnalysis = {
    id: analysisRef.id,
    userId,
    photoUrls,
    analysisResults,
    createdAt: serverTimestamp() as Timestamp
  };
  
  await setDoc(analysisRef, analysis);
  return analysisRef.id;
};

export const getProfileAnalyses = async (userId: string): Promise<ProfileAnalysis[]> => {
  const q = query(
    collection(db, PROFILE_ANALYSES),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as ProfileAnalysis);
};

// Conversation starter methods
export const saveConversationStarter = async (userId: string, matchProfile: ConversationStarter['matchProfile'], suggestions: string[]): Promise<string> => {
  const starterRef = doc(collection(db, CONVERSATION_STARTERS));
  
  const starter: ConversationStarter = {
    id: starterRef.id,
    userId,
    matchProfile,
    suggestions,
    createdAt: serverTimestamp() as Timestamp
  };
  
  await setDoc(starterRef, starter);
  return starterRef.id;
};

export const getConversationStarters = async (userId: string): Promise<ConversationStarter[]> => {
  const q = query(
    collection(db, CONVERSATION_STARTERS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as ConversationStarter);
};

// Prompt punch up methods
export const savePromptPunchUp = async (userId: string, prompt: string, responses: string[], tone?: string): Promise<string> => {
  const punchUpRef = doc(collection(db, PROMPT_PUNCH_UPS));
  
  const punchUp: PromptPunchUp = {
    id: punchUpRef.id,
    userId,
    prompt,
    responses,
    tone,
    createdAt: serverTimestamp() as Timestamp
  };
  
  await setDoc(punchUpRef, punchUp);
  return punchUpRef.id;
};

export const getPromptPunchUps = async (userId: string): Promise<PromptPunchUp[]> => {
  const q = query(
    collection(db, PROMPT_PUNCH_UPS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as PromptPunchUp);
};

// Check if user has premium access
export const hasUserPremiumAccess = (userProfile: UserProfile | null): boolean => {
  if (!userProfile || !userProfile.subscription) {
    return false;
  }
  
  if (userProfile.subscription.plan !== 'premium') {
    return false;
  }
  
  // Check if subscription is expired
  if (userProfile.subscription.expiresAt) {
    const now = new Date();
    const expiresAt = userProfile.subscription.expiresAt.toDate();
    if (expiresAt < now) {
      return false;
    }
  }
  
  return true;
}; 