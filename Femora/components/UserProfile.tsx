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
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import BottomBar from './BottomBar';
import UserService, { UserProfile as UserProfileData, OnboardingData } from '../services/userService';

interface UserProfileProps {
  onNavigateToHome: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onNavigateToHome }) => {
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [profile, onboarding] = await Promise.all([
        UserService.getUserProfile(user!),
        UserService.getOnboardingData(user!.uid),
      ]);
      
      setUserProfile(profile);
      setOnboardingData(onboarding);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View className="mb-6">
      <Text className="mb-3 text-lg font-bold text-[#EB9DED]">{title}</Text>
      <View className="rounded-2xl bg-white p-4 shadow-sm">{children}</View>
    </View>
  );

  const ProfileItem = ({ label, value }: { label: string; value: string }) => (
    <View className="mb-3 flex-row justify-between">
      <Text className="text-gray-600">{label}</Text>
      <Text className="font-medium text-black">{value}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F9F8F2]">
      <StatusBar barStyle="dark-content" backgroundColor="#EB9DED" />

      <Navbar
        title="Profile"
        onBack={onNavigateToHome}
        rightAction={{
          label: 'Logout',
          onPress: handleLogout,
          style: 'danger',
        }}
      />

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="flex-1 items-center justify-center py-8">
            <ActivityIndicator size="large" color="#EB9DED" />
            <Text className="mt-4 text-gray-600">Loading your profile...</Text>
          </View>
        ) : userProfile ? (
          <>
            {/* Profile Picture Section */}
            <View className="mb-6 items-center">
              <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-gray-200">
                {userProfile.photoURL ? (
                  <Image 
                    source={{ uri: userProfile.photoURL }} 
                    className="h-24 w-24 rounded-full"
                  />
                ) : (
                  <Text className="text-3xl text-gray-600">👤</Text>
                )}
              </View>
              <Text className="text-2xl font-bold text-black">
                {userProfile.displayName || userProfile.email?.split('@')[0] || 'User'}
              </Text>
              <Text className="text-gray-600">{userProfile.email}</Text>
            </View>

            {/* Personal Information */}
            <ProfileSection title="Personal Information">
              <ProfileItem 
                label="Full Name" 
                value={userProfile.displayName || 'Not set'} 
              />
              <ProfileItem 
                label="Age" 
                value={onboardingData?.age ? `${onboardingData.age} years` : 'Not set'} 
              />
              <ProfileItem 
                label="Email" 
                value={userProfile.email} 
              />
              <ProfileItem 
                label="Member Since" 
                value={userProfile.createdAt.toLocaleDateString()} 
              />
            </ProfileSection>

            {/* Medical History */}
            <ProfileSection title="Medical History">
              <ProfileItem 
                label="Past Breast Disease/Surgery" 
                value={onboardingData?.pastConditions?.join(', ') || 'None'} 
              />
              <ProfileItem 
                label="Family Cancer History" 
                value={onboardingData?.familyHistory || 'Not specified'} 
              />
              <ProfileItem 
                label="Past Scans" 
                value={onboardingData?.pastScan || 'Not specified'} 
              />
            </ProfileSection>

            {/* Women's Health */}
            <ProfileSection title="Women's Health">
              <ProfileItem 
                label="Age at First Period" 
                value={onboardingData?.periodStartAge ? `${onboardingData.periodStartAge} years` : 'Not set'} 
              />
              <ProfileItem 
                label="Current Status" 
                value={onboardingData?.status || 'Not specified'} 
              />
              <ProfileItem 
                label="Hormonal Medication" 
                value={onboardingData?.hormonalMeds || 'Not specified'} 
              />
            </ProfileSection>

            {/* Lifestyle */}
            <ProfileSection title="Lifestyle">
              <ProfileItem 
                label="Smoking/Alcohol" 
                value={onboardingData?.smokeAlcohol || 'Not specified'} 
              />
              <ProfileItem 
                label="Chronic Conditions" 
                value={onboardingData?.chronic?.join(', ') || 'None'} 
              />
            </ProfileSection>
          </>
        ) : (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-lg text-gray-600 text-center mb-2">Profile not found</Text>
            <Text className="text-sm text-gray-500 text-center">
              Please complete your onboarding to see your profile
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="mb-6 space-y-3">
          <TouchableOpacity
            className="rounded-2xl bg-[#EB9DED] py-3 mb-4"
            onPress={() => {
              // TODO: Navigate to edit profile
              Alert.alert('Edit Profile', 'Edit profile functionality coming soon!');
            }}>
            <Text className="text-center font-medium text-white">Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-2xl border border-[#EB9DED] bg-white py-3 mb-4"
            onPress={() => {
              // TODO: Navigate to privacy settings
              Alert.alert('Privacy Settings', 'Privacy settings coming soon!');
            }}>
            <Text className="text-center font-medium text-[#EB9DED]">Privacy Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-2xl border border-[#EB9DED] bg-white py-3 mb-4"
            onPress={() => {
              // TODO: Navigate to help/support
              Alert.alert('Help & Support', 'Help and support coming soon!');
            }}>
            <Text className="text-center font-medium text-[#EB9DED]">Help & Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomBar
        onScanPress={() => {}} // Scan is not active here
        onHomePress={onNavigateToHome}
        onProfilePress={() => {}} // Profile is already active
        activeTab="profile"
      />
    </SafeAreaView>
  );
};

export default UserProfile;
