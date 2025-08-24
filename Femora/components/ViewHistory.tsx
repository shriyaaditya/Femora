import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import UserService, { ScanSession, OnboardingData } from '../services/userService';

interface ViewHistoryProps {
  onNavigateToHome: () => void;
  onNavigateToUserProfile?: () => void;
}

const ViewHistory: React.FC<ViewHistoryProps> = ({ onNavigateToHome, onNavigateToUserProfile }) => {
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanSession[]>([]);
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
      const [scanData, onboarding] = await Promise.all([
        UserService.getScanSessions(user!.uid),
        UserService.getOnboardingData(user!.uid),
      ]);
      
      setScans(scanData);
      setOnboardingData(onboarding);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const interpolateColor = (start: string, end: string, factor: number) => {
  const hexToRgb = (hex: string) => {
    hex = hex.replace('#', '');
    return hex.length === 3
      ? hex.split('').map((x) => parseInt(x + x, 16))
      : [0, 0, 0].map((_, i) => parseInt(hex.substr(i * 2, 2), 16));
  };
  const rgbToHex = (r: number, g: number, b: number) =>
    `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;

  const startRgb = hexToRgb(start);
  const endRgb = hexToRgb(end);

  const result = startRgb.map((startVal, i) =>
    Math.round(startVal + factor * (endRgb[i] - startVal))
  );
  return rgbToHex(result[0], result[1], result[2]);
};


  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#f471b5" />

      {/* Header */}
      <View className="bg-[#f471b5]">
        <View className="flex-row items-center justify-between px-5 py-4">
          {/* Left: Logo */}
          <View className="flex-row items-center space-x-3">
            <Image
              source={require('../assets/logo.png')}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
            <Text className="text-xl font-bold text-white">Femora</Text>
          </View>

          {/* Right: Hamburger Menu */}
          <TouchableOpacity onPress={onNavigateToHome}>
            <Text className="text-2xl text-black">☰</Text>
          </TouchableOpacity>
        </View>

        {/* User Info Section */}
        <View className="bg-white px-5 py-4">
          <Text className="text-lg font-semibold text-[#EB9DED]">
            {user?.email?.split('@')[0] || 'User'}
          </Text>
          <Text className="text-sm text-black">
            Age - {onboardingData?.age || 'N/A'} yrs
          </Text>
        </View>
      </View>

      {/* Reports List */}
      <ScrollView className="flex-1 px-5 py-4" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="flex-1 items-center justify-center py-8">
            <ActivityIndicator size="large" color="#EB9DED" />
            <Text className="mt-4 text-gray-600">Loading your scan history...</Text>
          </View>
        ) : scans.length === 0 ? (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-lg text-gray-600 text-center mb-2">No scans yet</Text>
            <Text className="text-sm text-gray-500 text-center">
              Complete your first breast scan to see results here
            </Text>
          </View>
        ) : (
          <View className="space-y-3">
            {scans.map((scan) => (
              <TouchableOpacity
                key={scan.id}
                className="rounded-2xl border border-[#000] bg-[#E7B8FF] px-4 py-3 mb-4"
                onPress={() => {
                  // TODO: Navigate to detailed report view
                  console.log('View scan:', scan.id);
                }}>
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-medium text-black">
                    {formatDate(scan.scanTime)}
                  </Text>
                  <Text className="text-base font-medium text-black">
                    {scan.scanType === 'breast-scan' ? 'Breast Scan' : scan.scanType}
                  </Text>
                </View>
                <View className="mt-2">
                  <Text className="text-sm text-gray-600">
                    Status: {scan.status}
                  </Text>
                  {scan.analysisResults && (
                    <Text className="text-sm text-gray-600">
                      Risk Level: {scan.analysisResults.riskLevel}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="flex-row items-center justify-around bg-[#FFB0D9] px-5 py-4">
        <TouchableOpacity className="p-2">
          <Text className="text-xl text-black">+</Text>
        </TouchableOpacity>

        <TouchableOpacity className="p-2" onPress={onNavigateToHome}>
          <Text className="text-xl text-black">🏠</Text>
        </TouchableOpacity>

        <TouchableOpacity className="p-2" onPress={onNavigateToUserProfile}>
          <Text className="text-xl text-black">👤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ViewHistory;
