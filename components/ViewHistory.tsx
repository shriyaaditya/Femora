import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import BottomBar from './BottomBar';

interface ViewHistoryProps {
  onNavigateToHome: () => void;
  onNavigateToUserProfile: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToAskMora?: () => void;
  onNavigateToScan?: () => void;
}

const ViewHistory: React.FC<ViewHistoryProps> = ({
  onNavigateToHome,
  onNavigateToUserProfile,
  onNavigateToCalendar,
  onNavigateToAskMora,
  onNavigateToScan,
}) => {
  const { user } = useAuth();

  // Mock data for reports - replace with actual data from Firebase
  const reports = [
    { id: 1, date: '25-11-2025', type: 'Report' },
    { id: 2, date: '20-11-2025', type: 'Report' },
    { id: 3, date: '15-11-2025', type: 'Report' },
    { id: 4, date: '10-11-2025', type: 'Report' },
    { id: 5, date: '05-11-2025', type: 'Report' },
  ];

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
          <Text className="text-sm text-black">Age - 20 yrs</Text>
        </View>
      </View>

      {/* Reports List */}
      <ScrollView className="flex-1 px-5 py-4" showsVerticalScrollIndicator={false}>
        <View className="space-y-3">
          {reports.map((report) => (
            <TouchableOpacity
              key={report.id}
              className="mb-4 rounded-2xl border border-[#000] bg-[#E7B8FF] px-4 py-3"
              onPress={() => {
                // TODO: Navigate to detailed report view
                console.log('View report:', report.id);
              }}>
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-medium text-black">{report.date}</Text>
                <Text className="text-base font-medium text-black">{report.type}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomBar
        onScanPress={onNavigateToScan}
        onHomePress={onNavigateToHome}
        onCalendarPress={onNavigateToCalendar}
        onAIChatPress={onNavigateToAskMora}
        onDoctorPress={onNavigateToUserProfile}
        activeTab="home"
      />
    </SafeAreaView>
  );
};

export default ViewHistory;
