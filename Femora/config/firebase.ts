import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, inMemoryPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyCgCULTXDJo43QuTKFGyZgg6aG9Aot9uQE',
  authDomain: 'femora-5d93e.firebaseapp.com',
  projectId: 'femora-5d93e',
  storageBucket: 'femora-5d93e.appspot.com',
  messagingSenderId: '306245248691',
  appId: '1:306245248691:web:5d934110a39e3a4678b2c6',
  measurementId: 'G-6L8YPDCCCQ',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth setup
let auth = getAuth(app);

// Initialize Firebase Auth with React Native persistence
// Temporarily disabled persistence to test logout
// setPersistence(auth, getReactNativePersistence(AsyncStorage));

// For now, use in-memory persistence to test logout
setPersistence(auth, inMemoryPersistence);

// Firestore + Storage
export const db = getFirestore(app);
export const storage = getStorage(app);   // 👈 export storage here
export { auth };

export default app;
