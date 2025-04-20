import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { toast } from 'sonner'; // Ensure you have this for notifications

const auth = getAuth();

export const registerUser = async (userData: { fullName: string, email: string, password: string, gender?: string }) => {
  const { fullName, email, password, gender } = userData;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Optionally, store additional user data in Firestore
    // await setDoc(doc(db, "users", user.uid), { fullName, email, gender });

    return user;
  } catch (error: any) {
    toast.error(error.message || 'Error creating account');
    throw error;
  }
};

export const signInUser = async (userData: { email: string, password: string }) => {
  const { email, password } = userData;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return user;
  } catch (error: any) {
    toast.error(error.message || 'Error signing in');
    throw error;
  }
};
