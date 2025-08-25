import React, { useState } from 'react';
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
} from 'react-native';
import Navbar from './Navbar';
import BottomBar from './BottomBar';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AskMoraPageProps {
  onNavigateToHome?: () => void;
  onNavigateToAskMora?: () => void;
  onNavigateToUserProfile?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToScan?: () => void;
}

const AskMoraPage: React.FC<AskMoraPageProps> = ({
  onNavigateToHome,
  onNavigateToAskMora,
  onNavigateToUserProfile,
  onNavigateToCalendar,
  onNavigateToScan,
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = () => {
    if (message.trim()) {
      const newUserMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newUserMessage]);
      setMessage('');
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <Navbar title="Dashboard" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Chat Area */}
        {messages.length > 0 ? (
          <ScrollView className="flex-1 px-5 pt-4">{messages.map(renderMessage)}</ScrollView>
        ) : (
          // Welcome Screen
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
                <Text className=" mb-2 text-xl font-semibold">Hey there!</Text>
                <Text className="text-center text-base leading-5 text-black">
                  Mora here &ndash; your slightly fabulous piggy assistant!
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
            />

            {/* Send Button */}
            <TouchableOpacity
              onPress={sendMessage}
              className="bg-femora-pink ml-2 h-8 w-8 items-center justify-center rounded-full">
              <Text className="text-lg font-bold text-white">→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <BottomBar
        onScanPress={onNavigateToScan}
        onHomePress={onNavigateToHome}
        onAIChatPress={onNavigateToAskMora}
        onDoctorPress={onNavigateToUserProfile}
        onCalendarPress={onNavigateToCalendar}
        activeTab="ai"
      />
    </SafeAreaView>
  );
};

export default AskMoraPage;
