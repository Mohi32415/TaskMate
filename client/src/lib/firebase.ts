import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  signOut,
  User,
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyARmfkjzy-h7Bv4NxUYtvOCG-JGU90rGok",
  authDomain: "tasksmate.firebaseapp.com",
  projectId: "tasksmate",
  storageBucket: "tasksmate.firebasestorage.app",
  messagingSenderId: "24880064371",
  appId: "1:24880064371:web:3d723e72f398cde5d20706",
  measurementId: "G-QM8FFC5SQ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const registerWithEmailAndPassword = async (
  email: string,
  password: string,
  username: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with username as displayName
    if (user) {
      await updateProfile(user, {
        displayName: username,
      });
    }
    
    return user;
  } catch (error: any) {
    console.error("Error registering with email and password:", error);
    throw error;
  }
};

export const loginWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await firebaseSignInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Error logging in with email and password:", error);
    throw error;
  }
};

export const loginWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};