import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration for project: femora-5d93e
// Using real values from google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyBS7iCE-rp1KBifOiKH2LPtZjyPywjEg28",
  authDomain: "femora-5d93e.firebaseapp.com",
  projectId: "femora-5d93e",
  storageBucket: "femora-5d93e.firebasestorage.app",
  messagingSenderId: "896975254795",
  appId: "1:896975254795:android:5e5eef01657bdc87c31e0e"
};

// Check if we have real Firebase credentials
const hasRealCredentials = firebaseConfig.apiKey !== "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" && 
                          firebaseConfig.projectId === "femora-5d93e";

if (hasRealCredentials) {
  console.log('✅ Firebase config loaded with real credentials!');
  console.log('✅ Project ID:', firebaseConfig.projectId);
  console.log('✅ API Key:', firebaseConfig.apiKey.substring(0, 10) + '...');
  console.log('✅ Auth Domain:', firebaseConfig.authDomain);
} else {
  console.warn('⚠️ WARNING: Firebase config still has placeholder values!');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
