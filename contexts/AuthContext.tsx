import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { FirestoreService } from '../services/firestoreService';

interface User {
  id: string;
  email: string;
  name?: string;
  hasCompletedOnboarding?: boolean;
  isAnonymous?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  logout: () => Promise<void>;
  markOnboardingComplete: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Check if user has completed onboarding from Firestore
          const firestoreService = FirestoreService.getInstance();
          const userDataFromFirestore = await firestoreService.getUserData(firebaseUser.uid);
          const hasCompletedOnboarding = userDataFromFirestore?.profile?.onboardingCompleted || false;
          
          // User is signed in
          const userData: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || 'anonymous@femora.com',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            hasCompletedOnboarding: hasCompletedOnboarding,
            isAnonymous: firebaseUser.isAnonymous
          };
          
          console.log('🔍 Firebase user authenticated:', userData);
          setUser(userData);
        } catch (error) {
          console.error('Error checking onboarding completion:', error);
          // Fallback to assuming onboarding is not complete
          const userData: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || 'anonymous@femora.com',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            hasCompletedOnboarding: false,
            isAnonymous: firebaseUser.isAnonymous
          };
          setUser(userData);
        }
      } else {
        // User is signed out
        console.log('🔍 No Firebase user authenticated');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignInAnonymously = async () => {
    try {
      console.log('🔍 Attempting anonymous sign in...');
      const result = await signInAnonymously(auth);
      console.log('🔍 Anonymous sign in successful:', result.user.uid);
    } catch (error: any) {
      console.error('Anonymous sign in error:', error);
      throw new Error('Failed to sign in anonymously: ' + error.message);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      console.log('🔍 Attempting email sign in...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('🔍 Email sign in successful:', result.user.uid);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error('Sign in failed: ' + error.message);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      console.log('🔍 Attempting email sign up...');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('🔍 Email sign up successful:', result.user.uid);
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error('Sign up failed: ' + error.message);
    }
  };

  const markOnboardingComplete = async () => {
    if (user) {
      try {
        // Update onboarding completion in Firestore
        const firestoreService = FirestoreService.getInstance();
        await firestoreService.markOnboardingCompleted(user.id);
        
        // Update local state
        const updatedUser = { ...user, hasCompletedOnboarding: true };
        setUser(updatedUser);
        console.log('🔍 Onboarding marked as complete for user:', user.id);
      } catch (error) {
        console.error('Error marking onboarding complete:', error);
        throw new Error('Failed to mark onboarding as complete: ' + error);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log('🔍 User signed out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Logout failed: ' + error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signInAnonymously: handleSignInAnonymously,
      logout, 
      markOnboardingComplete 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
