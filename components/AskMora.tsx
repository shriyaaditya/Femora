import { useState, useEffect, useRef } from 'react';
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
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from './Navbar';
import BottomBar from './BottomBar';
import { useAuth } from '../contexts/AuthContext';
import MoraService from '../services/moraService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AskMoraProps {
  onNavigateToHome?: () => void;
  onNavigateToAskMora?: () => void;
  onNavigateToUserProfile?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToScan?: () => void;
}

const AskMora: React.FC<AskMoraProps> = ({
  onNavigateToHome,
  onNavigateToAskMora,
  onNavigateToUserProfile,
  onNavigateToCalendar,
  onNavigateToScan,
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { user } = useAuth();
  const moraService = useRef(new MoraService()).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    console.log('AskMora component mounted');
    // Check if Mora backend is available
    const checkMoraHealth = async () => {
      try {
        const isHealthy = await moraService.checkHealth();
        if (!isHealthy) {
          setError('Mora backend is not available. You can still chat, but responses may be limited.');
        }
      } catch (err) {
        setError('Unable to connect to Mora backend. You can still chat, but responses may be limited.');
      }
    };
    checkMoraHealth();

    // Add keyboard event listeners
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    // Cleanup listeners
    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const startNewChat = () => {
    setShowChat(true);
    setMessages([]);
    setCurrentChatId(`chat_${Date.now()}`);
    setError(null);
  };

  const sendMessage = async () => {
    if (message.trim() && !loading && showChat) {
      setLoading(true);
      setError(null);
      try {
        const userMessageText = message.trim();
        const newUserMessage: Message = {
          id: Date.now().toString(),
          text: userMessageText,
          isUser: true,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setMessage('');

        // Show typing indicator
        setTyping(true);

        // Send message to Mora and get response
        const moraResponse = await moraService.sendMessage(userMessageText, user?.id);

        // Hide typing indicator
        setTyping(false);

        // Add Mora's response
        const newMoraMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: moraResponse,
          isUser: false,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMoraMessage]);
      } catch (err) {
        console.error('Error sending message:', err);
        setError('Failed to send message. Please try again.');
        Alert.alert('Error', 'Failed to send message. Please try again.');
      } finally {
        setLoading(false);
        setTyping(false);
      }
    }
  };

  const handleInputSubmit = () => {
    if (message.trim()) {
      if (!showChat) {
        // Start new chat and send the first message
        startNewChat();
        // Send the first message after starting the chat
        setTimeout(() => {
          sendMessage();
        }, 100);
      } else {
        sendMessage();
      }
    }
  };

  const handleInputPress = () => {
    if (message.trim()) {
      startNewChat();
      // Send the first message after starting the chat
      setTimeout(() => {
        sendMessage();
      }, 100);
    }
  };

  const goBackToHome = () => {
    setShowChat(false);
    setMessages([]);
    setCurrentChatId('');
    setMessage('');
    setError(null);
  };

  const renderMessage = (msg: Message) => (
    <View key={msg.id} style={{ marginBottom: 16, flexDirection: 'row', justifyContent: msg.isUser ? 'flex-end' : 'flex-start' }}>
      <View
        style={{
          maxWidth: '70%',
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: msg.isUser ? '#E8D5FF' : 'white',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2
        }}>
        <Text style={{ 
          fontSize: 16, 
          color: msg.isUser ? '#2D1B3D' : '#2D1B3D',
          lineHeight: 22
        }}>
          {msg.text}
        </Text>
      </View>
    </View>
  );

  const renderMessageInfo = (msg: Message) => (
    <View key={`${msg.id}_info`} style={{ 
      marginBottom: 8, 
      flexDirection: 'row', 
      justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
      paddingHorizontal: 4
    }}>
      <Text style={{ 
        fontSize: 12, 
        color: '#9CA3AF',
        fontWeight: '500'
      }}>
        {msg.isUser ? 'You' : 'Mora'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={{ marginBottom: 16, flexDirection: 'row', justifyContent: 'flex-start' }}>
      <View style={{ 
        backgroundColor: 'white', 
        maxWidth: '70%', 
        borderRadius: 20, 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#E8D5FF" />
          <Text style={{ color: '#9CA3AF', fontSize: 14, marginLeft: 8 }}>Mora is typing...</Text>
        </View>
      </View>
    </View>
  );

  const renderErrorBanner = () => {
    if (!error) return null;
    
    return (
      <View style={{
        backgroundColor: '#FEE2E2',
        borderColor: '#FCA5A5',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 10
      }}>
        <Text style={{ color: '#DC2626', fontSize: 14, textAlign: 'center' }}>
          {error}
        </Text>
        <TouchableOpacity 
          style={{ alignSelf: 'flex-end', marginTop: 8 }}
          onPress={() => setError(null)}
        >
          <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: '600' }}>
            Dismiss
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: showChat ? '#F8F9FA' : '#f8f9fa' }}>
      <StatusBar barStyle="dark-content" backgroundColor={showChat ? '#E8D5FF' : '#f8f9fa'} />

      {showChat ? (
        // Chat Interface
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Chat Header */}
          <View style={{ 
            backgroundColor: '#E8D5FF', 
            paddingTop: 20, 
            paddingBottom: 16,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity 
                style={{ 
                  backgroundColor: 'white', 
                  width: 40, 
                  height: 40, 
                  borderRadius: 12, 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2
                }}
                onPress={goBackToHome}
              >
                <Ionicons name="chevron-back" size={24} color="#2D1B3D" />
              </TouchableOpacity>
              
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#2D1B3D' }}>
                  Chat with Mora
                </Text>
                <Text style={{ fontSize: 14, color: '#8B5CF6', marginTop: 2 }}>
                  Online
                </Text>
              </View>
              
              <TouchableOpacity style={{ padding: 8 }}>
                <Ionicons name="ellipsis-vertical" size={24} color="#2D1B3D" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Banner */}
          {renderErrorBanner()}

          {/* Chat Messages */}
          <ScrollView 
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 }}
            ref={scrollViewRef}
          >
            {messages.length === 0 && (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <View style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: 40, 
                  backgroundColor: 'white', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4
                }}>
                  <Image
                    source={require('../assets/mora.png')}
                    style={{ width: 60, height: 60 }}
                    resizeMode="contain"
                  />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#2D1B3D', textAlign: 'center', marginBottom: 8 }}>
                  Hi! I'm Mora, Your AI assistant
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
                  How may I help you today?
                </Text>
              </View>
            )}
            
            {messages.map((msg) => (
              <View key={msg.id}>
                {renderMessageInfo(msg)}
                {renderMessage(msg)}
              </View>
            ))}
            
            {typing && renderTypingIndicator()}
          </ScrollView>

          {/* Chat Input */}
          <View style={{ 
            backgroundColor: 'white', 
            paddingHorizontal: 20, 
            paddingVertical: 16,
            paddingBottom: 20,
            marginBottom: keyboardVisible ? 20 : 80,
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
            position: 'relative',
            zIndex: 1000
          }}>
            <View style={{ 
              backgroundColor: '#F3F4F6', 
              borderRadius: 24, 
              paddingHorizontal: 16, 
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <TextInput
                style={{ flex: 1, fontSize: 16, color: '#2D1B3D' }}
                placeholder="Type your message..."
                placeholderTextColor="#9CA3AF"
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleInputSubmit}
                returnKeyType="send"
                multiline={false}
              />
              <TouchableOpacity style={{ marginLeft: 12, padding: 8 }}>
                <Ionicons name="attach" size={20} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ 
                  marginLeft: 8, 
                  padding: 8,
                  backgroundColor: message.trim() ? '#E8D5FF' : '#F3F4F6',
                  borderRadius: 20
                }}
                onPress={handleInputSubmit}
                disabled={!message.trim() || loading}
              >
                <Ionicons 
                  name="paper-plane" 
                  size={20} 
                  color={message.trim() ? '#2D1B3D' : '#9CA3AF'} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      ) : (
        // Home Interface
        <ScrollView 
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Navbar */}
          <Navbar title="Dashboard" />

          {/* Error Banner */}
          {renderErrorBanner()}

          {/* Header with AI Icon */}
          <View style={{ alignItems: 'center', paddingTop: 20, paddingBottom: 30 }}>
            <View style={{ 
              width: 60, 
              height: 60, 
              borderRadius: 30, 
              backgroundColor: 'white', 
              alignItems: 'center', 
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
              overflow: 'hidden'
            }}>
              <Image
                source={require('../assets/mora.png')}
                style={{ width: 50, height: 50 }}
                resizeMode="contain"
              />
            </View>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: '600', 
              color: '#2d3748', 
              marginTop: 16,
              textAlign: 'center'
            }}>
              How may I assist you today?
            </Text>
          </View>

          {/* Chat Input Area */}
          <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
            <View style={{ 
              backgroundColor: 'white', 
              borderRadius: 16, 
              paddingHorizontal: 16, 
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4
            }}>
              <TextInput
                style={{ flex: 1, fontSize: 16, color: '#2d3748' }}
                placeholder="Message Mora AI"
                placeholderTextColor="#a0aec0"
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleInputSubmit}
                returnKeyType="send"
                multiline={false}
              />
              <TouchableOpacity style={{ marginLeft: 12, padding: 8 }}>
                <Ionicons name="images-outline" size={24} color="#FF69B4" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ 
                  marginLeft: 8, 
                  padding: 8,
                  backgroundColor: message.trim() ? '#FF69B4' : '#F3F4F6',
                  borderRadius: 20
                }}
                onPress={handleInputSubmit}
                disabled={!message.trim() || loading}
              >
                <Ionicons 
                  name="paper-plane" 
                  size={20} 
                  color={message.trim() ? 'white' : '#9CA3AF'} 
                />
              </TouchableOpacity>
            </View>

            {/* Quick Action Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 20 }}>
              <TouchableOpacity style={{ 
                backgroundColor: 'white', 
                paddingHorizontal: 16, 
                paddingVertical: 10, 
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2
              }}>
                <Ionicons name="bulb-outline" size={16} color="#FF69B4" style={{ marginRight: 6 }} />
                <Text style={{ color: '#2d3748', fontSize: 14, fontWeight: '500' }}>Brainstorm</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={{ 
                backgroundColor: 'white', 
                paddingHorizontal: 16, 
                paddingVertical: 10, 
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2
              }}>
                <Ionicons name="image-outline" size={16} color="#FF69B4" style={{ marginRight: 6 }} />
                <Text style={{ color: '#2d3748', fontSize: 14, fontWeight: '500' }}>Image</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={{ 
                backgroundColor: 'white', 
                paddingHorizontal: 16, 
                paddingVertical: 10, 
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2
              }}>
                <Ionicons name="code-outline" size={16} color="#FF69B4" style={{ marginRight: 6 }} />
                <Text style={{ color: '#2d3748', fontSize: 14, fontWeight: '500' }}>Code</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Automation Section */}
          <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#2d3748' }}>Automation</Text>
              <TouchableOpacity>
                <Text style={{ color: '#FF69B4', fontSize: 14, fontWeight: '500' }}>See all</Text>
              </TouchableOpacity>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ 
                flex: 1, 
                backgroundColor: 'white', 
                borderRadius: 16, 
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: 16, 
                    backgroundColor: '#FF69B4', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginRight: 8
                  }}>
                    <Ionicons name="chatbubble-outline" size={18} color="white" />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#2d3748' }}>Understanding of AI:</Text>
                </View>
                <Text style={{ fontSize: 12, color: '#718096', marginBottom: 12, fontStyle: 'italic' }}>
                  "Tell me what Artificial Intelligence?"
                </Text>
                <TouchableOpacity style={{ 
                  backgroundColor: '#FF69B4', 
                  paddingVertical: 8, 
                  paddingHorizontal: 16, 
                  borderRadius: 12,
                  alignSelf: 'flex-start'
                }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Generate</Text>
                </TouchableOpacity>
              </View>

              <View style={{ 
                flex: 1, 
                backgroundColor: 'white', 
                borderRadius: 16, 
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: 16, 
                    backgroundColor: '#FF69B4', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginRight: 8
                  }}>
                    <Ionicons name="chatbubble-outline" size={18} color="white" />
                </View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#2d3748' }}>Social Algorithms:</Text>
                </View>
                <Text style={{ fontSize: 12, color: '#718096', marginBottom: 12, fontStyle: 'italic' }}>
                  "How do social media algorithms work?"
                </Text>
                <TouchableOpacity style={{ 
                  backgroundColor: '#FF69B4', 
                  paddingVertical: 8, 
                  paddingHorizontal: 16, 
                  borderRadius: 12,
                  alignSelf: 'flex-start'
                }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Generate</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Recently Chat Section */}
          <View style={{ paddingHorizontal: 20, marginBottom: 100 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#2d3748' }}>Recently Chat</Text>
              <TouchableOpacity>
                <Text style={{ color: '#FF69B4', fontSize: 14, fontWeight: '500' }}>See all</Text>
              </TouchableOpacity>
            </View>
            
            <View style={{ 
              backgroundColor: 'white', 
              borderRadius: 16, 
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: 16, 
                  backgroundColor: '#FF69B4', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: 12
                }}>
                  <Ionicons name="chatbubble-outline" size={18} color="white" />
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#2d3748' }}>The Value of Reading Books:</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {!keyboardVisible && (
        <BottomBar
          onScanPress={onNavigateToScan}
          onHomePress={onNavigateToHome}
          onAIChatPress={onNavigateToAskMora}
          onDoctorPress={onNavigateToUserProfile}
          onCalendarPress={onNavigateToCalendar}
          activeTab="ai"
        />
      )}
    </SafeAreaView>
  );
};

export default AskMora;
