import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Navbar from './Navbar';
import BottomBar from './BottomBar';
import moraService, { ChatResponse } from '../services/moraService';
import UserService, { ChatMessage, ChatSession } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AskMoraPageProps {
  onNavigateToHome?: () => void;
  onNavigateToUserProfile?: () => void;
}

const AskMoraPage: React.FC<AskMoraPageProps> = ({ onNavigateToHome, onNavigateToUserProfile }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize with welcome message and set user ID
  useEffect(() => {
    if (user) {
      moraService.setUserId(user.uid);
      initializeChat();
    }
  }, [user]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      const welcomeMessage = await moraService.getWelcomeMessage();
      
      const botMessage: Message = {
        id: Date.now().toString(),
        text: welcomeMessage,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages([botMessage]);
    } catch (error) {
      console.error('Error initializing chat:', error);
      // Fallback welcome message
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        text: "Hey there! I'm Mora, your fabulous piggy assistant! 🐷 How can I help you today?",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (message.trim() && !isLoading && !isTyping) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      const userInput = message.trim();
      setMessage('');
      setIsTyping(true);

      try {
        const response: ChatResponse = await moraService.sendMessage(userInput);
        
        if (response.error) {
          console.warn('Mora service returned error:', response.error);
        }

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.response,
          isUser: false,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);

        // Save chat session to user's profile
        if (user) {
          try {
            console.log(`🔍 [AskMora] Attempting to save chat session for user: ${user.uid}`);
            console.log(`🔍 [AskMora] Session ID: ${moraService.getSessionId()}`);
            
            // Create the messages array directly from the new messages to avoid stale state
            const messagesToSave = [userMessage, botMessage];
            console.log(`🔍 [AskMora] Messages count: ${messagesToSave.length}`);
            console.log(`🔍 [AskMora] Messages to save:`, messagesToSave.map(m => ({ text: m.text, isUser: m.isUser })));
            
            await UserService.saveChatSession(
              user.uid,
              moraService.getSessionId(),
              messagesToSave
            );
            console.log('✅ [AskMora] Chat session saved successfully');
          } catch (saveError) {
            console.error('❌ [AskMora] Error saving chat session:', saveError);
            console.error('❌ [AskMora] Error details:', {
              userId: user.uid,
              sessionId: moraService.getSessionId(),
              errorMessage: saveError instanceof Error ? saveError.message : String(saveError),
              errorStack: saveError instanceof Error ? saveError.stack : 'No stack trace'
            });
            // Don't show error to user, just log it
            // The chat still works, just won't be saved
          }
        } else {
          console.warn('⚠️ [AskMora] No user object available, cannot save chat session');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm having trouble connecting right now. Please try again later.",
          isUser: false,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
        
        Alert.alert(
          'Connection Error',
          'Unable to connect to Mora. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsTyping(false);
      }
    }
  };

  const renderMessage = (msg: Message) => (
    <View key={msg.id} className={`mb-3 flex-row ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
      {!msg.isUser && (
        <View className="bg-femora-light-pink mr-2 h-8 w-8 items-center justify-center rounded-full">
          <Text className="text-sm">🐷</Text>
        </View>
      )}
      <View
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          msg.isUser ? 'bg-femora-pink' : 'bg-gray-100'
        }`}>
        <Text className={`text-base ${msg.isUser ? 'text-white' : 'text-black'}`}>{msg.text}</Text>
      </View>
      {msg.isUser && (
        <View className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-blue-500">
          <Text className="text-sm text-white">You</Text>
        </View>
      )}
    </View>
  );

  const renderTypingIndicator = () => (
    <View className="mb-3 flex-row justify-start">
      <View className="bg-femora-light-pink mr-2 h-8 w-8 items-center justify-center rounded-full">
        <Text className="text-sm">🐷</Text>
      </View>
      <View className="bg-gray-100 rounded-2xl px-4 py-2">
        <View className="flex-row items-center space-x-1">
          <ActivityIndicator size="small" color="#9CA3AF" />
          <Text className="text-gray-500 text-sm ml-2">Mora is typing...</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <Navbar title="Ask Mora" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        
        {/* Chat Area */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center px-5">
            <ActivityIndicator size="large" color="#f471b5" />
            <Text className="mt-4 text-gray-600">Connecting to Mora...</Text>
          </View>
        ) : messages.length > 0 ? (
          <ScrollView className="flex-1 px-5 pt-4">
            {messages.map(renderMessage)}
            {isTyping && renderTypingIndicator()}
          </ScrollView>
        ) : (
          // Welcome Screen (fallback)
          <View className="flex-1 items-center justify-center px-5">
            <View className="items-center">
              {/* Pig Character */}
              <Image
                source={require('../assets/moraHi.png')}
                style={{ width: 250, height: 250 }}
                resizeMode="contain"
              />

              {/* Greeting Text */}
              <View className="mt-4 items-center">
                <Text className=" mb-2 text-xl font-semibold">
                  Hey there!
                </Text>
                <Text className="text-center text-base leading-5 text-black">
                  Mora here – your slightly fabulous piggy assistant!
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Input Field - Fixed at bottom */}
        <View className="border-t border-gray-100 bg-white px-5 pb-4 pt-2">
          <View className="border-femora-pink flex-row items-center rounded-full border bg-white px-4 py-3">
            {/* Pig Icon */}
            <View className="bg-femora-light-pink mr-3 h-8 w-8 items-center justify-center rounded-full">
              <Text className="text-sm">🐷</Text>
            </View>

            <TextInput
              className="flex-1 text-base text-black"
              placeholder="Ask Mora..."
              placeholderTextColor="#9CA3AF"
              value={message}
              onChangeText={setMessage}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              multiline={false}
              editable={!isLoading && !isTyping}
            />

            {/* Send Button */}
            <TouchableOpacity
              onPress={sendMessage}
              disabled={isLoading || isTyping || !message.trim()}
              className={`ml-2 h-8 w-8 items-center justify-center rounded-full ${
                isLoading || isTyping || !message.trim() 
                  ? 'bg-gray-300' 
                  : 'bg-femora-pink'
              }`}>
              {isLoading || isTyping ? (
                <ActivityIndicator size="small" color="#9CA3AF" />
              ) : (
                <Text className="text-lg font-bold text-white">→</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <BottomBar
        onScanPress={() => {}} // Scan is not active here
        onHomePress={onNavigateToHome}
        onProfilePress={onNavigateToUserProfile}
        activeTab="home"
      />
    </SafeAreaView>
  );
};

export default AskMoraPage;
