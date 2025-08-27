import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { getUserCompleteData } from '../utils/firestoreHelpers';
import { UserData } from '../services/firestoreService';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;

interface UserProfileProps {
  onNavigateToHome: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToAskMora?: () => void;
  onNavigateToScan?: () => void;
}

interface UserProfileData {
  name: string;
  age: string | number;
  email: string;
  profileImage?: string;
  onboarding: {
    name?: string;
    age?: number;
    pastScan?: string;
    familyHistory?: string;
    pastConditions?: string[];
    periodStartAge?: number;
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
          // Try to get user data from Firebase
          const userData = await getUserCompleteData(user.id);
          if (userData) {
            setUserProfile({
              name: userData.onboarding?.name || user.name || 'User',
              age: userData.onboarding?.age || 'N/A',
              email: user.email || '',
              profileImage: undefined,
              onboarding: userData.onboarding || {},
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
          console.error('Error fetching user profile from Firebase:', error);
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
    logout();
    onNavigateToHome();
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#87CEEB' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: 'white' }}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#87CEEB' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: 'white' }}>Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#87CEEB' }}>
      <StatusBar barStyle="light-content" backgroundColor="#87CEEB" />
      
      {/* Header with wave-like curve */}
      <View style={{ height: 200, backgroundColor: '#87CEEB', position: 'relative' }}>
        <TouchableOpacity
          onPress={onNavigateToHome}
          style={{
            position: 'absolute',
            top: 50,
            left: 20,
            zIndex: 10,
          }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text
          style={{
            position: 'absolute',
            top: 50,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 24,
            fontWeight: 'bold',
            color: 'white',
          }}>
          profile
        </Text>
        
        {/* Wave-like curve */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 40,
            backgroundColor: 'white',
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
          }}
        />
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
        {/* Profile Picture Section */}
        <View style={{ alignItems: 'center', marginTop: -50, marginBottom: 30 }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: '#E7B8FF',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
              position: 'relative',
            }}>
            {userProfile.profileImage ? (
              <Image
                source={{ uri: userProfile.profileImage }}
                style={{ width: 96, height: 96, borderRadius: 48 }}
              />
            ) : (
              <Ionicons name="person" size={48} color="white" />
            )}
            
            <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#E7B8FF',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: 'white',
              }}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
            {userProfile.name}
          </Text>
          
          <TouchableOpacity>
            <Text style={{ color: '#E7B8FF', fontSize: 16, textDecorationLine: 'underline' }}>
              View full profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Menu Options */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              backgroundColor: 'white',
              borderRadius: 16,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
            <Ionicons name="person-outline" size={24} color="#E7B8FF" style={{ marginRight: 16 }} />
            <Text style={{ fontSize: 16, fontWeight: '500' }}>Account Information</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              backgroundColor: 'white',
              borderRadius: 16,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
            <Ionicons name="lock-closed-outline" size={24} color="#E7B8FF" style={{ marginRight: 16 }} />
            <Text style={{ fontSize: 16, fontWeight: '500' }}>Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              backgroundColor: 'white',
              borderRadius: 16,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
            <Ionicons name="settings-outline" size={24} color="#E7B8FF" style={{ marginRight: 16 }} />
            <Text style={{ fontSize: 16, fontWeight: '500' }}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              backgroundColor: 'white',
              borderRadius: 16,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
            <Ionicons name="help-circle-outline" size={24} color="#E7B8FF" style={{ marginRight: 16 }} />
            <Text style={{ fontSize: 16, fontWeight: '500' }}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              backgroundColor: '#ffebee',
              borderRadius: 16,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
            <Ionicons name="log-out-outline" size={24} color="#f44336" style={{ marginRight: 16 }} />
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#f44336' }}>Log out</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfile;
