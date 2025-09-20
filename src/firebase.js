// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat and later, measurementId is optional
const firebaseConfig = {
  // These will be your actual Firebase project credentials
  // For now, using placeholder values - you'll need to replace these with your actual Firebase project config
  apiKey: "your-api-key-here",
  authDomain: "precision-cabling-automation.firebaseapp.com",
  projectId: "precision-cabling-automation",
  storageBucket: "precision-cabling-automation.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id-here",
  measurementId: "your-measurement-id-here"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
