import React, { useState } from 'react';
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
import Navbar from './Navbar';
import BottomBar from './BottomBar';

interface UserProfileProps {
  onNavigateToHome: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToAskMora?: () => void;
  onNavigateToScan?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  onNavigateToHome,
  onNavigateToCalendar,
  onNavigateToAskMora,
  onNavigateToScan,
}) => {
  const { user, logout } = useAuth();

  // Mock user profile data - replace with actual data from Firebase
  const [userProfile] = useState({
    name: 'Shriya',
    age: '20',
    contact: '+91 98765 43210',
    email: user?.email || 'user@example.com',
    pastBreastDisease: 'No',
    otherIllnesses: 'No',
    familyCancerHistory: 'No',
    firstPeriodAge: '13',
    menopause: 'No',
    pregnancies: '0',
    breastfeeding: 'No',
    smokingAlcohol: 'No',
    physicalActivity: 'Moderate',
  });

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
        {/* Profile Picture Section */}
        <View className="mb-6 items-center">
          <View className="mb-4 h-24 w-24 items-center justify-center">
            <Text className="text-3xl text-white">👤</Text>
          </View>
          <Text className="text-2xl font-bold text-black">{userProfile.name}</Text>
          <Text className="text-gray-600">{userProfile.email}</Text>
        </View>

        {/* Personal Information */}
        <ProfileSection title="Personal Information">
          <ProfileItem label="Full Name" value={userProfile.name} />
          <ProfileItem label="Age" value={`${userProfile.age} years`} />
          <ProfileItem label="Contact" value={userProfile.contact} />
          <ProfileItem label="Email" value={userProfile.email} />
        </ProfileSection>

        {/* Medical History */}
        <ProfileSection title="Medical History">
          <ProfileItem label="Past Breast Disease/Surgery" value={userProfile.pastBreastDisease} />
          <ProfileItem label="Other Major Illnesses" value={userProfile.otherIllnesses} />
          <ProfileItem label="Family Cancer History" value={userProfile.familyCancerHistory} />
        </ProfileSection>

        {/* Women's Health */}
        <ProfileSection title="Women's Health">
          <ProfileItem label="Age at First Period" value={`${userProfile.firstPeriodAge} years`} />
          <ProfileItem label="Menopause" value={userProfile.menopause} />
          <ProfileItem label="Number of Pregnancies" value={userProfile.pregnancies} />
          <ProfileItem label="Breastfeeding History" value={userProfile.breastfeeding} />
        </ProfileSection>

        {/* Lifestyle */}
        <ProfileSection title="Lifestyle">
          <ProfileItem label="Smoking/Alcohol" value={userProfile.smokingAlcohol} />
          <ProfileItem label="Physical Activity" value={userProfile.physicalActivity} />
        </ProfileSection>

        {/* Action Buttons */}
        <View className="mb-6 space-y-3">
          <TouchableOpacity
            className="mb-4 rounded-2xl bg-[#EB9DED] py-3"
            onPress={() => {
              // TODO: Navigate to edit profile
              Alert.alert('Edit Profile', 'Edit profile functionality coming soon!');
            }}>
            <Text className="text-center font-medium text-white">Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mb-4 rounded-2xl border border-[#EB9DED] bg-white py-3"
            onPress={() => {
              // TODO: Navigate to privacy settings
              Alert.alert('Privacy Settings', 'Privacy settings coming soon!');
            }}>
            <Text className="text-center font-medium text-[#EB9DED]">Privacy Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mb-4 rounded-2xl border border-[#EB9DED] bg-white py-3"
            onPress={() => {
              // TODO: Navigate to help/support
              Alert.alert('Help & Support', 'Help and support coming soon!');
            }}>
            <Text className="text-center font-medium text-[#EB9DED]">Help & Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomBar
        onScanPress={onNavigateToScan}
        onHomePress={onNavigateToHome}
        onCalendarPress={onNavigateToCalendar}
        onAIChatPress={onNavigateToAskMora}
        onDoctorPress={() => {}}
        activeTab="doctor"
      />
    </SafeAreaView>
  );
};

export default UserProfile;
