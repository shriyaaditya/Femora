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

interface LoginProps {
  onShowProfileForm: () => void;
}

const Login: React.FC<LoginProps> = ({ onShowProfileForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

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
        // For sign-in, don't show onboarding - user will go directly to home if they've completed it
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
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
          <View className="mb-6 space-y-4">
            <TextInput
              className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Auth Button */}
          <TouchableOpacity
            className={`mb-4 rounded-2xl py-3 ${loading ? 'bg-gray-400' : 'bg-[#FFB0D9]'}`}
            onPress={handleAuth}
            disabled={loading}>
            <Text className="text-center text-base font-semibold text-white">
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Toggle Sign Up/Sign In */}
          <TouchableOpacity className="items-center" onPress={() => setIsSignUp(!isSignUp)}>
            <Text className="text-[#FFB0D9]">
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>

          {/* Demo Note */}
          <View className="mt-8 rounded-lg bg-blue-50 p-4">
            <Text className="text-center text-sm text-blue-600">
              💡 Demo Mode: Any email/password combination will work for testing
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;
