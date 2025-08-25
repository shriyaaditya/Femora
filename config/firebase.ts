import { initializeApp } from 'firebase/app';
// @ts-ignore
import { getAuth, initializeAuth, getReactNativePersistence, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // 👈 add this
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyCgCULTXDJo43QuTKFGyZgg6aG9Aot9uQE',
  authDomain: 'femora-42d60.firebaseapp.com',
  projectId: 'femora-42d60',
  storageBucket: 'femora-42d60.appspot.com', // 👈 use appspot.com not firebasestorage.app
  messagingSenderId: '306245248691',
  appId: '1:306245248691:web:5d934110a39e3a4678b2c6',
  measurementId: 'G-6L8YPDCCCQ',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth setup
let auth: Auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// Firestore + Storage
export const db = getFirestore(app);
export const storage = getStorage(app); // 👈 export storage here
export { auth };

export default app;
