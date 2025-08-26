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

  const handleMenuPress = (action: string) => {
    switch (action) {
      case 'account':
        Alert.alert('Account Information', 'Account information functionality coming soon!');
        break;
      case 'password':
        Alert.alert('Password', 'Password change functionality coming soon!');
        break;
      case 'settings':
        Alert.alert('Settings', 'Settings functionality coming soon!');
        break;
      case 'help':
        Alert.alert('Help & Support', 'Help and support functionality coming soon!');
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  const MenuItem = ({
    icon,
    title,
    action,
    isDestructive = false,
  }: {
    icon: string;
    title: string;
    action: string;
    isDestructive?: boolean;
  }) => (
    <TouchableOpacity
      className="mb-3 rounded-2xl bg-gray-50 p-4 shadow-sm"
      onPress={() => handleMenuPress(action)}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
      <View className="flex-row items-center">
        <Ionicons name={icon as any} size={24} color={isDestructive ? '#EF4444' : '#6B7280'} />
        <Text
          className={`ml-3 text-base font-medium ${
            isDestructive ? 'text-red-500' : 'text-gray-700'
          }`}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
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
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#87CEEB" />

      {/* Header with back button */}
      <View className="flex-row items-center justify-between bg-[#87CEEB] px-4 py-3">
        <TouchableOpacity onPress={onNavigateToHome}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-medium text-gray-800">profile</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header with Wave Design */}
        <View className="relative bg-[#87CEEB] pb-8">
          {/* Wave-like curve at bottom */}
          <View className="absolute bottom-0 left-0 right-0 h-8 rounded-t-full bg-white" />

          {/* Profile Picture Section */}
          <View className="items-center pt-6">
            <View className="relative">
              <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                {userProfile?.profileImage ? (
                  <Image
                    source={{ uri: userProfile.profileImage }}
                    className="h-full w-full rounded-full"
                  />
                ) : (
                  <Ionicons name="person" size={48} color="#9CA3AF" />
                )}
              </View>
              {/* Camera Icon */}
              <TouchableOpacity
                className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-gray-300"
                onPress={() =>
                  Alert.alert(
                    'Profile Picture',
                    'Change profile picture functionality coming soon!'
                  )
                }>
                <Ionicons name="camera" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Name */}
            <Text className="mt-4 text-2xl font-bold text-gray-800">
              {userProfile?.name || 'User'}
            </Text>

            {/* View Full Profile Link */}
            <TouchableOpacity
              className="mt-2"
              onPress={() => {
                Alert.alert('Full Profile', 'View full profile functionality coming soon!');
              }}>
              <Text className="text-sm text-gray-600">View full profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Options */}
        <View className="px-4 pb-8 pt-6">
          <MenuItem icon="person-outline" title="Account Information" action="account" />
          <MenuItem icon="lock-closed-outline" title="Password" action="password" />
          <MenuItem icon="settings-outline" title="Settings" action="settings" />
          <MenuItem icon="call-outline" title="Help & Support" action="help" />
          <MenuItem icon="log-out-outline" title="Log out" action="logout" isDestructive={true} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfile;
