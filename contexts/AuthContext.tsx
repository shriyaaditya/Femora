import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name?: string;
  hasCompletedOnboarding?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
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
    // Check for existing user in local storage
    const checkUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error reading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Simple validation - in a real app, you'd verify against a backend
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Check if user already exists
      const existingUserData = await AsyncStorage.getItem('user');
      if (existingUserData) {
        const existingUser = JSON.parse(existingUserData);
        // For existing users signing in, always mark onboarding as complete
        existingUser.hasCompletedOnboarding = true;
        await AsyncStorage.setItem('user', JSON.stringify(existingUser));
        setUser(existingUser);
        return;
      }

      // Create a mock user (in a real app, this would come from your backend)
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0], // Use email prefix as name
        hasCompletedOnboarding: true, // Existing users signing in should never see onboarding
      };

      // Store user data locally
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Simple validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Create a new user
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        hasCompletedOnboarding: false, // New users haven't completed onboarding
      };

      // Store user data locally
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const markOnboardingComplete = async () => {
    if (user) {
      const updatedUser = { ...user, hasCompletedOnboarding: true };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout, markOnboardingComplete }}>
      {children}
    </AuthContext.Provider>
  );
};
