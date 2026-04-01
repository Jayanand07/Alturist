import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut as firebaseSignOut,
  sendEmailVerification
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase with guard
const app = firebaseConfig.apiKey 
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0])
  : null;

// Export Auth with safety
export const auth = app ? getAuth(app) : (null as any); 

// Providers
const googleProvider = new GoogleAuthProvider();

// Google Auth
const signInWithGoogle = () => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  return signInWithPopup(auth, googleProvider);
};

// Email/Password Auth
const signInWithEmail = (email: string, pass: string) => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  return signInWithEmailAndPassword(auth, email, pass);
};

const signUpWithEmail = (email: string, pass: string) => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  return createUserWithEmailAndPassword(auth, email, pass);
};

// Phone Auth
const signInWithPhone = (phoneNumber: string) => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'invisible',
  });
  return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};

// Sign Out
const signOut = () => {
  if (!auth) return;
  return firebaseSignOut(auth);
};

export { 
  app, 
  googleProvider, 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithPhone, 
  signOut,
  RecaptchaVerifier,
  sendEmailVerification
};
