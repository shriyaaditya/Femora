import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
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
  onStartBreastScan?: () => void;
  onLogout?: () => void;
  onNavigateToUserProfile?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
  onNavigateToAskMora,
  onNavigateToHistory,
  onStartScan,
  onStartBreastScan,
  onLogout,
  onNavigateToUserProfile,
}) => {
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        if (!user) return;
        const snap = await getDoc(doc(db, 'users', user.uid));
        const name = snap.data()?.profile?.name as string | undefined;
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

      {/* Greeting Section with Animated Background */}
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: isSmallDevice ? 16 : isMediumDevice ? 20 : 24,
          paddingTop: isSmallDevice ? 20 : 24,
        }}>
        {/* Container for greeting text with animated background */}
        <View
          style={{
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
          }}>

          {/* Greeting Text */}
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                marginBottom: isSmallDevice ? 6 : 10,
                textAlign: 'center',
                fontSize: isSmallDevice ? 18 : isMediumDevice ? 20 : 22,
                fontWeight: '600',
                color: 'black',
              }}>
              Hi <Text style={{ color: '#FF9DF1' }}>{displayName || user?.email?.split('@')[0] || 'User'}!</Text>
            </Text>
            <Text
              style={{
                marginBottom: isSmallDevice ? 6 : 10,
                textAlign: 'center',
                fontSize: isSmallDevice ? 12 : 14,
                color: 'black',
              }}>
              Your past scan showed no concerns.
            </Text>
            <Text
              style={{
                textAlign: 'center',
                fontSize: isSmallDevice ? 12 : 14,
                fontWeight: '500',
                color: '#FF9DF1',
              }}>
              Ready for today&apos;s quick check?
            </Text>
          </View>
        </View>
      </View>

      {/* Divider Lines */}
      <View
        style={{
          marginVertical: isSmallDevice ? 8 : 12,
          paddingHorizontal: isSmallDevice ? 16 : isMediumDevice ? 20 : 24,
        }}>
        <View
          style={{
            marginBottom: 2,
            height: 2,
            backgroundColor: '#BFC3E9',
            borderRadius: 1,
          }}></View>
        <View
          style={{
            height: 2,
            backgroundColor: '#BFC3E9',
            borderRadius: 1,
          }}></View>
      </View>

      {/* Action Buttons */}
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: isSmallDevice ? 16 : isMediumDevice ? 20 : 24,
          gap: isSmallDevice ? 10 : 14,
        }}>
        {/* Start Scan */}
        <TouchableOpacity
          style={{
            alignItems: 'center',
            borderRadius: 24,
            borderWidth: 1,
            borderColor: '#000000',
            backgroundColor: '#D2AAF7',
            paddingHorizontal: isSmallDevice ? 16 : isMediumDevice ? 18 : 20,
            paddingVertical: isSmallDevice ? 10 : 12,
            shadowColor: '#D2AAF7',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.25,
            shadowRadius: 6,
            elevation: 6,
          }}
          onPress={onStartScan}>
          <Text
            style={{
              fontSize: isSmallDevice ? 12 : 14,
              fontWeight: '600',
              color: '#111',
            }}>
            Start Self Scan
          </Text>
        </TouchableOpacity>

        {/* Start Breast Scan */}
        <TouchableOpacity
          style={{
            alignItems: 'center',
            borderRadius: 24,
            borderWidth: 1,
            borderColor: '#000000',
            backgroundColor: '#14b8a6',
            paddingHorizontal: isSmallDevice ? 16 : isMediumDevice ? 18 : 20,
            paddingVertical: isSmallDevice ? 10 : 12,
            shadowColor: '#14b8a6',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.25,
            shadowRadius: 6,
            elevation: 6,
          }}
          onPress={onStartBreastScan}>
          <Text
            style={{
              fontSize: isSmallDevice ? 12 : 14,
              fontWeight: '600',
              color: '#fff',
            }}>
            🔬 Start Breast Scan
          </Text>
        </TouchableOpacity>

        {/* View History */}
        <TouchableOpacity
          style={{
            alignItems: 'center',
            borderRadius: 24,
            borderWidth: 1,
            borderColor: '#000000',
            backgroundColor: '#E7B8FF',
            paddingHorizontal: isSmallDevice ? 16 : isMediumDevice ? 18 : 20,
            paddingVertical: isSmallDevice ? 10 : 12,
            shadowColor: '#E7B8FF',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.25,
            shadowRadius: 6,
            elevation: 6,
          }}
          onPress={onNavigateToHistory}>
          <Text
            style={{
              fontSize: isSmallDevice ? 12 : 14,
              fontWeight: '600',
              color: '#111',
            }}>
            View my History
          </Text>
        </TouchableOpacity>

        {/* Ask Mora */}
        <TouchableOpacity
          style={{
            alignItems: 'center',
            borderRadius: 24,
            borderWidth: 1,
            borderColor: '#000000',
            backgroundColor: '#F2C6FF',
            paddingHorizontal: isSmallDevice ? 16 : isMediumDevice ? 18 : 20,
            paddingVertical: isSmallDevice ? 10 : 12,
            shadowColor: '#F2C6FF',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.25,
            shadowRadius: 6,
            elevation: 6,
          }}
          onPress={onNavigateToAskMora}>
          <Text
            style={{
              fontSize: isSmallDevice ? 12 : 14,
              fontWeight: '600',
              color: '#111',
            }}>
            Ask Mora
          </Text>
        </TouchableOpacity>
      </View>

      <BottomBar
        onScanPress={onStartScan}
        onHomePress={() => {}}
        onProfilePress={onNavigateToUserProfile}
        activeTab="home"
      />
    </SafeAreaView>
  );
};

export default HomePage;
