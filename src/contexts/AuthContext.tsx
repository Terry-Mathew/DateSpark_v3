import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendEmailVerification,
  applyActionCode,
  sendPasswordResetEmail,
  User as FirebaseUser,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { auth } from "@/firebase";

interface User {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        // Create our app user object
        const appUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
          isPremium: false, // This should be fetched from Firestore or your backend
          emailVerified: firebaseUser.emailVerified
        };
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get token for API calls
      const token = await firebaseUser.getIdToken();
      localStorage.setItem('auth_token', token);
      
      navigate('/');
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update profile with name
      await updateProfile(firebaseUser, {
        displayName: name
      });
      
      // Send verification email
      await sendEmailVerification(firebaseUser);
      
      // Get token for API calls
      const token = await firebaseUser.getIdToken();
      localStorage.setItem('auth_token', token);
      
      navigate('/email-verification');
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('auth_token');
      navigate('/');
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const verifyEmail = async (code: string) => {
    try {
      setLoading(true);
      await applyActionCode(auth, code);
      
      // Refresh the current user
      if (auth.currentUser) {
        await auth.currentUser.reload();
        
        // Update local user state
        const updatedUser = { ...user, emailVerified: auth.currentUser.emailVerified };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Email verification error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    try {
      setLoading(true);
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      } else {
        throw new Error("No user is currently signed in");
      }
    } catch (error) {
      console.error("Resend verification email error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        signIn, 
        signUp, 
        signOut,
        verifyEmail,
        resendVerificationEmail 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 