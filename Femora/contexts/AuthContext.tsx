import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "../config/firebase";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Crypto from 'expo-crypto';

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
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// 🔑 Google OAuth discovery document
const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect URI for OAuth
  const isExpoGo = Constants.appOwnership === "expo";
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "myexpoapp", // must match app.json scheme
  });

  useEffect(() => {
    console.log('🔐 [AuthContext] Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('🔐 [AuthContext] Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
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
    try {
      console.log('🔐 [AuthContext] Starting logout process...');
      
      // Clear any persisted auth state
      await auth.signOut();
      console.log('🔐 [AuthContext] Firebase signOut completed');
      
      // Force clear the user state immediately
      setUser(null);
      console.log('🔐 [AuthContext] User state cleared');
      
      // Clear any stored tokens or auth data
      if (Platform.OS === 'web') {
        // Clear localStorage/auth cookies on web
        localStorage.removeItem('firebase:authUser:AIzaSyCgCULTXDJo43QuTKFGyZgg6aG9Aot9uQE:[DEFAULT]');
        sessionStorage.clear();
        
        // Clear all Firebase-related items
        Object.keys(localStorage).forEach(key => {
          if (key.includes('firebase') || key.includes('auth')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Force a re-render by updating loading state
      setLoading(true);
      setTimeout(() => setLoading(false), 100);
      
      console.log('🔐 [AuthContext] Logout completed successfully');
    } catch (error) {
      console.error('❌ [AuthContext] Logout error:', error);
      // Even if Firebase signOut fails, clear the local state
      setUser(null);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const expoClientId = (require("../app.json").expo?.extra?.expoClientId) as string | undefined;
      const iosClientId = (require("../app.json").expo?.extra?.iosClientId) as string | undefined;
      const androidClientId = (require("../app.json").expo?.extra?.androidClientId) as string | undefined;

      const clientId = Platform.select({ ios: iosClientId, android: androidClientId, default: expoClientId });
      if (!clientId) {
        throw new Error("Google OAuth client ID is not configured in app.json");
      }

      console.log('🔐 [AuthContext] Using client ID:', clientId);
      console.log('🔐 [AuthContext] Platform:', Platform.OS);

      // Generate PKCE code verifier - FIXED: Use proper random string instead of makeRedirectUri
      const codeVerifier = Math.random().toString(36).substring(2, 128);
      const codeChallenge = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        codeVerifier,
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );

      console.log('🔐 [AuthContext] Generated PKCE code verifier and challenge');

      // Create auth request using OAuth 2.0 authorization code flow with PKCE
      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ["openid", "profile", "email"],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        codeChallenge,
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
        extraParams: {
          prompt: "consent",
        },
      });

      console.log('🔐 [AuthContext] Auth request created, prompting user...');
      const result = await request.promptAsync(discovery);
      
      if (result.type === "success" && result.params.code) {
        console.log('🔐 [AuthContext] Authorization code received, exchanging for tokens...');
        
        // Exchange authorization code for tokens
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            clientId,
            code: result.params.code,
            redirectUri,
            extraParams: {
              code_verifier: codeVerifier, // Include codeVerifier in extraParams
            },
          },
          discovery
        );

        console.log('🔐 [AuthContext] Token exchange completed');

        if (tokenResult.idToken) {
          console.log('🔐 [AuthContext] ID token received, signing in with Firebase...');
          const credential = GoogleAuthProvider.credential(tokenResult.idToken);
          await signInWithCredential(auth, credential);
          console.log('🔐 [AuthContext] Firebase sign-in completed successfully');
        } else {
          throw new Error("Failed to get ID token from Google");
        }
      } else {
        throw new Error("Google sign-in cancelled or failed");
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      throw err as Error;
    }
  };

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, logout, signInWithGoogle }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
