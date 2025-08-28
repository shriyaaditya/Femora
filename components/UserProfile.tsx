import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from './Navbar';
import BottomBar from './BottomBar';

interface UserProfileProps {
  onNavigateToHome: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToAskMora?: () => void;
  onNavigateToScan?: () => void;
}

interface UserProfileData {
  name: string;
  age: string;
  email: string;
  profileImage?: string;
  onboarding?: {
    name?: string;
    age?: string;
    pastScan?: string;
    familyHistory?: string;
    pastConditions?: string;
    periodStartAge?: string;
    status?: string;
    hormonalMeds?: string;
    smokeAlcohol?: string;
    chronic?: string;
  };
}

const UserProfile: React.FC<UserProfileProps> = ({
  onNavigateToHome,
  onNavigateToCalendar,
  onNavigateToAskMora,
  onNavigateToScan,
}) => {
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          // Try to get onboarding data from local storage
          const onboardingData = await AsyncStorage.getItem(`onboarding_${user.id}`);
          if (onboardingData) {
            const parsed = JSON.parse(onboardingData);
            setUserProfile({
              name: parsed.onboarding?.name || user.name || 'User',
              age: parsed.onboarding?.age || 'N/A',
              email: user.email || '',
              profileImage: undefined,
              onboarding: parsed.onboarding || {},
            });
          } else {
            // Fallback to basic user data
            setUserProfile({
              name: user.name || user.email?.split('@')[0] || 'User',
              age: 'N/A',
              email: user.email || '',
              profileImage: undefined,
              onboarding: {},
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to basic user data
          setUserProfile({
            name: user.name || user.email?.split('@')[0] || 'User',
            age: 'N/A',
            email: user.email || '',
            profileImage: undefined,
            onboarding: {},
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await logout();
        },
        style: 'destructive',
      },
    ]);
  };

  const InfoField = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
    <View className="mb-3">
      <Text className="mb-1 text-xs font-medium text-gray-500">{label}</Text>
      <View className="flex-row items-center rounded-lg bg-gray-100 px-3 py-2">
        <Text className="flex-1 text-sm text-gray-700">{value}</Text>
        <Ionicons name={icon as any} size={16} color="#9CA3AF" />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#87CEEB" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FF]">
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />

      <Navbar 
        title="Profile" 
        onBack={onNavigateToHome}
        userProfile={{
          name: userProfile?.name || 'User',
          image: userProfile?.profileImage,
          onPress: () => {},
        }}
        rightAction={{
          label: 'Logout',
          onPress: handleLogout,
          style: 'destructive',
        }}
      />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        scrollEventThrottle={16}
      >
        {/* Profile Section */}
        <View className="mx-4 mb-6 rounded-3xl bg-white p-6 shadow-sm">
          {/* Profile Picture */}
          <View className="items-center mb-4">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-[#e5d0f2] mb-3">
              {userProfile?.profileImage ? (
                <Image
                  source={{ uri: userProfile.profileImage }}
                  className="h-full w-full rounded-full"
                />
              ) : (
                <Ionicons name="person" size={40} color="white" />
              )}
            </View>
            
            {/* Name */}
            <Text className="text-xl font-semibold text-[#090809] mb-1">
              {userProfile?.name || 'User'}
            </Text>
            
            {/* Age */}
            <Text className="text-sm text-[#D1A9F7]">
              Age: {userProfile?.age || 'N/A'} years
            </Text>
          </View>
        </View>

        {/* Information Fields */}
        <View className="mx-4 mb-6">
          <InfoField 
            label="Past Breast Scans" 
            value={userProfile?.onboarding?.pastScan || 'Not specified'} 
            icon="scan-outline" 
          />
          
          <InfoField 
            label="Family History" 
            value={userProfile?.onboarding?.familyHistory || 'Not specified'} 
            icon="people-outline" 
          />
          
          <InfoField 
            label="Past Conditions" 
            value={userProfile?.onboarding?.pastConditions || 'None'} 
            icon="medical-outline" 
          />
          
          <InfoField 
            label="Period Start Age" 
            value={userProfile?.onboarding?.periodStartAge ? `${userProfile.onboarding.periodStartAge} years` : 'Not specified'} 
            icon="calendar-outline" 
          />
          
          <InfoField 
            label="Current Status" 
            value={userProfile?.onboarding?.status || 'Not specified'} 
            icon="information-circle-outline" 
          />
          
          <InfoField 
            label="Hormonal Medication" 
            value={userProfile?.onboarding?.hormonalMeds || 'Not specified'} 
            icon="medical-outline" 
          />
          
          <InfoField 
            label="Smoking/Alcohol" 
            value={userProfile?.onboarding?.smokeAlcohol || 'Not specified'} 
            icon="warning-outline" 
          />
          
          <InfoField 
            label="Chronic Conditions" 
            value={userProfile?.onboarding?.chronic || 'None'} 
            icon="heart-outline" 
          />
        </View>

        {/* Logout Button */}
        <View className="mx-4 mb-6">
          <TouchableOpacity
            className="rounded-xl bg-[#e66a83] py-4 px-6 shadow-sm"
            onPress={handleLogout}
            activeOpacity={0.8}>
            <View className="flex-row items-center justify-center">
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text className="ml-2 text-base font-semibold text-white">Logout</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Extra spacing for better scroll experience */}
        <View className="h-8" />


      </ScrollView>

      <BottomBar
        onScanPress={onNavigateToScan}
        onHomePress={onNavigateToHome}
        onCalendarPress={onNavigateToCalendar}
        onAIChatPress={onNavigateToAskMora}
        onDoctorPress={() => {}}
        activeTab="home"
      />
    </SafeAreaView>
  );
};

export default UserProfile;
