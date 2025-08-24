import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface LoginProps {
  onShowProfileForm: () => void;
}

const Login: React.FC<LoginProps> = ({ onShowProfileForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        Alert.alert('Success', 'Account created successfully! Please complete your profile.', [
          { text: 'OK', onPress: onShowProfileForm },
        ]);
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const ensureUserDoc = async (uid: string, email?: string | null) => {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid,
        email: email || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // After Firebase sign-in, currentUser is available via auth
      const { auth } = await import('../config/firebase');
      const uid = auth.currentUser?.uid;
      const email = auth.currentUser?.email;
      if (uid) {
        await ensureUserDoc(uid, email ?? undefined);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F9F8F2]">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <View className="flex-1 justify-center px-6">
          {/* Header */}
          <View className="mb-8 items-center">
            <Text className="mb-2 text-3xl font-bold text-[#FFB0D9]">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text className="text-center text-gray-600">
              {isSignUp
                ? 'Sign up to start your breast health journey'
                : 'Sign in to continue your breast health journey'}
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="mb-2 font-medium text-gray-700">Email</Text>
              <TextInput
                className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View>
              <Text className="mb-2 font-medium text-gray-700">Password</Text>
              <TextInput
                className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              className={`mt-6 rounded-2xl py-4 ${loading ? 'opacity-50' : ''}`}
              style={{
                backgroundColor: '#FFB0D9',
                shadowColor: '#FFB0D9',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
              onPress={handleAuth}
              disabled={loading}>
              <Text className="text-center text-lg font-semibold text-white">
                {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Google Sign-In */}
            <TouchableOpacity
              className={`mt-3 rounded-2xl py-4 border border-gray-300 bg-white ${loading ? 'opacity-50' : ''}`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 4,
              }}
              onPress={handleGoogleSignIn}
              disabled={loading}>
              <Text className="text-center text-lg font-semibold text-black">Continue with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Toggle Sign In/Sign Up */}
          <View className="mt-6 items-center">
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text className="font-medium text-[#f471b5]">
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;
