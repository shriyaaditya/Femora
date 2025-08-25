import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession(); // 👈 required for Expo AuthSession

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// 🔑 Google OAuth discovery document
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect URI for OAuth
  const isExpoGo = Constants.appOwnership === 'expo';
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'myexpoapp', // must match app.json scheme
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    WebBrowser.warmUpAsync().catch(() => {});
    return () => {
      WebBrowser.coolDownAsync().catch(() => {});
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const signInWithGoogle = async () => {
    try {
      const expoClientId = require('../app.json').expo?.extra?.expoClientId as string | undefined;
      const iosClientId = require('../app.json').expo?.extra?.iosClientId as string | undefined;
      const androidClientId = require('../app.json').expo?.extra?.androidClientId as
        | string
        | undefined;

      const clientId = Platform.select({
        ios: iosClientId,
        android: androidClientId,
        default: expoClientId,
      });
      if (!clientId) {
        throw new Error('Google OAuth client ID is not configured in app.json');
      }

      // Create auth request (use OIDC implicit: id_token)
      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        responseType: AuthSession.ResponseType.IdToken,
        extraParams: {
          nonce: Math.random().toString(36).slice(2),
          prompt: 'consent',
        },
      });

      await request.promptAsync(discovery).then(async (result) => {
        if (result.type === 'success' && result.authentication?.idToken) {
          const credential = GoogleAuthProvider.credential(result.authentication.idToken);
          await signInWithCredential(auth, credential);
        } else {
          throw new Error('Google sign-in cancelled or failed');
        }
      });
    } catch (err) {
      console.error('Google sign-in error:', err);
      throw err as Error;
    }
  };

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, logout, signInWithGoogle }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
