import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import BottomBar from './BottomBar';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;

interface HomePageProps {
  onNavigateToAskMora?: () => void;
  onNavigateToHistory?: () => void;
  onStartScan?: () => void;
  onLogout?: () => void;
  onNavigateToUserProfile?: () => void;
  onNavigateToCalendar?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
  onNavigateToAskMora,
  onNavigateToHistory,
  onStartScan,
  onLogout,
  onNavigateToUserProfile,
  onNavigateToCalendar,
}) => {
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [streakCount, setStreakCount] = useState<number>(7); // Default streak count

  // Breast Health Care Cards Data
  const breastHealthCards = [
    {
      id: 1,
      title: 'Breast Care Tips',
      description: 'Regular self-exams and healthy lifestyle choices',
      image: require('../assets/love.png'),
      backgroundColor: '#FFE5F0',
      titleColor: '#D63384',
      shadowColor: '#FFB6C1',
    },
    {
      id: 2,
      title: 'Wellness Practices',
      description: 'Balanced nutrition, exercise, and stress management',
      image: require('../assets/fruits.png'),
      backgroundColor: '#E6F7FF',
      titleColor: '#0066CC',
      shadowColor: '#87CEEB',
    },
    {
      id: 3,
      title: 'Early Detection',
      description: 'Monthly self-exams and annual check-ups',
      image: require('../assets/breast.png'),
      backgroundColor: '#F0F8FF',
      titleColor: '#8A2BE2',
      shadowColor: '#DDA0DD',
    },
    {
      id: 4,
      title: 'Healthy Habits',
      description: 'Limit alcohol, maintain weight, stay active',
      image: require('../assets/alcohol.png'),
      backgroundColor: '#FFF5EE',
      titleColor: '#FF8C00',
      shadowColor: '#FFB347',
    },
  ];

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        if (!user) return;
        const snap = await getDoc(doc(db, 'users', user.uid));
        const name = snap.data()?.onboarding?.name as string | undefined;
        if (mounted) setDisplayName(name ?? null);
      } catch {}
    };
    fetchProfile();
    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Navbar
        title=" "
        showLogo={true}
        userProfile={{
          name: displayName || user?.email?.split('@')[0] || 'User',
          image: undefined, // You can add user profile image here later
          onPress: onNavigateToUserProfile,
        }}
        onNotificationPress={() => {
          // Handle notification press - you can implement this later
          console.log('Notification pressed');
        }}
        rightAction={{
          label: 'Logout',
          onPress: () => {
            Alert.alert('Logout', 'Are you sure you want to logout?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Logout',
                onPress: async () => {
                  await logout();
                  onLogout?.();
                },
                style: 'destructive',
              },
            ]);
          },
          style: 'destructive',
        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Arbitrary Shaped Background Bubble */}
        <View
          style={{
            position: 'absolute',
            top: 120,
            right: -50,
            width: 200,
            height: 250,
            backgroundColor: '#f3e3fc',
            borderRadius: 100,
            transform: [{ rotate: '25deg' }, { scaleX: 1.5 }, { scaleY: 0.8 }],
            opacity: 0.7,
            zIndex: 0,
          }}
        />

        {/* Another decorative bubble */}
        <View
          style={{
            position: 'absolute',
            top: 300,
            left: -30,
            width: 150,
            height: 180,
            backgroundColor: '#f3e3fc',
            borderRadius: 75,
            transform: [{ rotate: '-15deg' }, { scaleX: 0.8 }, { scaleY: 1.2 }],
            opacity: 0.5,
            zIndex: 0,
          }}
        />

        {/* Enhanced Horizontal Streak Counter - positioned below navbar */}
        <View
          style={{
            marginHorizontal: isSmallDevice ? 16 : isMediumDevice ? 20 : 24,
            marginTop: isSmallDevice ? 20 : 24,
            marginBottom: isSmallDevice ? 24 : 28,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: isSmallDevice ? 20 : 24,
              paddingVertical: isSmallDevice ? 16 : 20,
              backgroundColor: '#E6E6FA',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#D2AAF7',
              shadowColor: '#D2AAF7',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}>
            {/* Left side - Streak info */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Image
                  source={require('../assets/fire.png')}
                  style={{ width: 24, height: 24, marginRight: 8 }}
                  resizeMode="contain"
                />
                <Text className="font-denis text-lg font-bold text-[#8B5CF6]">
                  {streakCount} Day Streak
                </Text>
              </View>
              <Text className="font-denis text-sm text-[#6B7280]">
                Keep up the great work! 🔥
              </Text>
            </View>

            {/* Right side - Progress section */}
            <View style={{ alignItems: 'center', minWidth: isSmallDevice ? 100 : 120 }}>
              {/* Circular progress indicator */}
              <View
                style={{
                  width: isSmallDevice ? 48 : 56,
                  height: isSmallDevice ? 48 : 56,
                  borderRadius: isSmallDevice ? 24 : 28,
                  borderWidth: 4,
                  borderColor: '#9992E1',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                  position: 'relative',
                }}>
                {/* Progress circle */}
                <View
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    overflow: 'visible',
                    borderRadius: isSmallDevice ? 24 : 28,
                    borderWidth: 4,
                    borderColor: 'transparent',
                    borderTopColor: '#EB9DED',
                    borderRightColor: '#EB9DED',
                    borderBottomColor: screenWidth > 400 ? '#EB9DED' : 'transparent', // 70% progress
                    transform: [{ rotate: '-90deg' }],
                  }}
                />
                <Text
                  style={{
                    fontSize: isSmallDevice ? 12 : 14,
                    fontWeight: '700',
                    color: '#9992E1',
                  }}>
                  70%
                </Text>
              </View>

              <Text
                style={{
                  fontSize: isSmallDevice ? 10 : 12,
                  fontWeight: '600',
                  color: '#666',
                  textAlign: 'center',
                }}>
                7/10 days
              </Text>
            </View>
          </View>
        </View>

        {/* Greeting Section - Left aligned below streak counter */}
        <View
          style={{
            marginHorizontal: isSmallDevice ? 16 : isMediumDevice ? 20 : 24,
            marginBottom: isSmallDevice ? 24 : 28,
          }}>
          <Text
            className="font-denis text-2xl font-bold text-[#333]"
            style={{
              fontSize: isSmallDevice ? 20 : 24,
              marginBottom: 8,
            }}>
            Hello, {displayName || user?.email?.split('@')[0] || 'User'}! 👋
          </Text>
          <Text
            className="font-denis text-base text-[#666]"
            style={{
              fontSize: isSmallDevice ? 14 : 16,
              lineHeight: isSmallDevice ? 20 : 22,
            }}>
            Ready for your breast health check today?
          </Text>
        </View>

        {/* Main Content Area */}
        <View
          style={{
            justifyContent: 'center',
            paddingHorizontal: isSmallDevice ? 16 : isMediumDevice ? 20 : 24,
            marginBottom: isSmallDevice ? 24 : 28,
            marginTop: isSmallDevice ? 20 : 24,
          }}>
          {/* Enhanced Action Buttons */}
          <View
            style={{
              paddingHorizontal: isSmallDevice ? 16 : isMediumDevice ? 20 : 24,
              paddingBottom: isSmallDevice ? 20 : 24,
              gap: isSmallDevice ? 16 : 20,
            }}>
            {/* Start Scan - Primary Action */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 20,
                borderColor: '#33333',
                borderWidth: 1,
                backgroundColor: '#F7ECFD',
                paddingHorizontal: isSmallDevice ? 20 : 24,
                paddingVertical: isSmallDevice ? 16 : 18,
                shadowColor: '#F7ECFD',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 8,
              }}
              onPress={onStartScan}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: isSmallDevice ? 16 : 18,
                    fontWeight: '700',
                    color: '#333',
                    marginBottom: 2,
                  }}>
                  Start Self Scan
                </Text>
                <Text
                  style={{
                    fontSize: isSmallDevice ? 12 : 13,
                    fontWeight: '400',
                    color: '#333',
                    opacity: 0.9,
                  }}>
                  Quick 2-minute health check
                </Text>
              </View>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#333333',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            {/* View History */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 20,
                borderColor: '#33333',
                backgroundColor: '#F7ECFD',
                paddingHorizontal: isSmallDevice ? 20 : 24,
                paddingVertical: isSmallDevice ? 16 : 18,
                shadowColor: '#F7ECFD',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
                borderWidth: 1,
              }}
              onPress={onNavigateToHistory}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: isSmallDevice ? 16 : 18,
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: 2,
                  }}>
                  View my History
                </Text>
                <Text
                  style={{
                    fontSize: isSmallDevice ? 12 : 13,
                    fontWeight: '400',
                    color: '#666',
                  }}>
                  Track your health journey
                </Text>
              </View>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#333333',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Ionicons name="time-outline" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            {/* Ask Mora */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 20,
                borderColor: '#33333',
                backgroundColor: '#F7ECFD',
                paddingHorizontal: isSmallDevice ? 20 : 24,
                paddingVertical: isSmallDevice ? 16 : 18,
                shadowColor: '#F7ECFD',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
                borderWidth: 1,
              }}
              onPress={onNavigateToAskMora}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: isSmallDevice ? 16 : 18,
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: 2,
                  }}>
                  Ask Mora
                </Text>
                <Text
                  style={{
                    fontSize: isSmallDevice ? 12 : 13,
                    fontWeight: '400',
                    color: '#666',
                  }}>
                  Get personalized health advice
                </Text>
              </View>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#333333',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Breast Health Care Cards Section */}
        <View
          style={{
            marginHorizontal: isSmallDevice ? 16 : isMediumDevice ? 20 : 24,
            marginBottom: isSmallDevice ? 24 : 28,
          }}>
          <Text
            style={{
              fontSize: isSmallDevice ? 18 : 20,
              fontWeight: '700',
              color: '#333',
              marginBottom: isSmallDevice ? 20 : 24,
              textAlign: 'center',
            }}>
            Breast Health Care
          </Text>

          <View style={{ height: 140 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 8,
                gap: 16,
              }}
              decelerationRate="fast"
              snapToInterval={200}
              snapToAlignment="start">
              {breastHealthCards.map((card) => (
                <View
                  key={card.id}
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: 16,
                    overflow: 'hidden',
                    shadowColor: card.shadowColor,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                    backgroundColor: card.backgroundColor,
                  }}>
                  <Image
                    source={card.image}
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                    resizeMode="cover"
                  />
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: 12,
                      borderBottomLeftRadius: 16,
                      borderBottomRightRadius: 16,
                    }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: '#333',
                        marginBottom: 4,
                       
                      }}>
                      {card.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '500',
                        color: '#333333',
                        lineHeight: 14,
                      
                      }}>
                      {card.description}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      <BottomBar
        onScanPress={onStartScan}
        onHomePress={() => {}}
        onCalendarPress={onNavigateToCalendar}
        onAIChatPress={onNavigateToAskMora}
        onDoctorPress={onNavigateToUserProfile}
        activeTab="home"
      />
    </SafeAreaView>
  );
};

export default HomePage;
