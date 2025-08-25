import React from 'react';
import { View, TouchableOpacity, Dimensions, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;

interface BottomBarProps {
  onScanPress?: () => void;
  onHomePress?: () => void;
  onAIChatPress?: () => void;
  onDoctorPress?: () => void;
  onCalendarPress?: () => void;
  activeTab?: 'scan' | 'home' | 'ai' | 'doctor' | 'calendar';
}

const BottomBar: React.FC<BottomBarProps> = ({
  onScanPress,
  onHomePress,
  onAIChatPress,
  onDoctorPress,
  onCalendarPress,
  activeTab = 'home',
}) => {
  const iconSize = isSmallDevice ? 20 : 22;
  const activeIconSize = isSmallDevice ? 22 : 24;

  const renderIcon = (name: string, label: string, isActive: boolean, onPress: () => void) => {
    const iconColor = isActive ? '#ffffff' : '#333333';
    const backgroundColor = isActive ? '#ff66cc' : 'transparent';

    return (
      <TouchableOpacity
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: isSmallDevice ? 4 : 6,
          paddingHorizontal: isSmallDevice ? 4 : 8,
          minWidth: isSmallDevice ? 55 : 65,
          flex: 1,
        }}
        onPress={onPress}>
        {/* Active Icon with Floating Circle */}
        {isActive ? (
          <View
            style={{
              width: isSmallDevice ? 40 : 44,
              height: isSmallDevice ? 40 : 44,
              borderRadius: isSmallDevice ? 20 : 22,
              backgroundColor: backgroundColor,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#ff66cc',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.4,
              shadowRadius: 6,
              elevation: 6,
              marginBottom: 2,
            }}>
            <Ionicons name={name as any} size={activeIconSize} color="white" />
          </View>
        ) : (
          <View
            style={{
              width: isSmallDevice ? 32 : 36,
              height: isSmallDevice ? 32 : 36,
              borderRadius: isSmallDevice ? 16 : 18,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 2,
              backgroundColor: 'rgba(51, 51, 51, 0.05)',
            }}>
            <Ionicons name={name as any} size={iconSize} color={iconColor} />
          </View>
        )}

        {/* Label */}
        <Text
          style={{
            fontSize: isSmallDevice ? 8 : 9,
            fontWeight: isActive ? '700' : '600',
            color: isActive ? '#ff66cc' : '#333333',
            textAlign: 'center',
            opacity: isActive ? 1 : 0.8,
            marginTop: 1,
          }}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Adjust bottom position based on platform and device
  const getBottomPosition = () => {
    if (Platform.OS === 'ios') {
      return 12; // iOS has home indicator
    } else {
      // Android - account for navigation bar
      return 8;
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: getBottomPosition(),
        left: 8,
        right: 8,
        height: isSmallDevice ? 65 : 70,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 35,
        borderWidth: 1,
        borderColor: 'rgba(210, 170, 247, 0.3)',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        paddingHorizontal: isSmallDevice ? 8 : 12,
        paddingVertical: isSmallDevice ? 6 : 8,
        zIndex: 1000, // Ensure it stays on top
      }}>
      {/* Subtle gradient overlay */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 35,
          backgroundColor:
            'linear-gradient(135deg, rgba(230, 230, 250, 0.1) 0%, rgba(242, 198, 255, 0.05) 100%)',
        }}
      />

      {/* Navigation Icons */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        }}>
        {/* Left side: Scan and Calendar */}
        <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'flex-start' }}>
          {renderIcon('scan-outline', 'Scan', activeTab === 'scan', onScanPress || (() => {}))}
          {renderIcon(
            'calendar-outline',
            'Calendar',
            activeTab === 'calendar',
            onCalendarPress || (() => {})
          )}
        </View>

        {/* Center: Home */}
        <View style={{ flex: 0, alignItems: 'center', justifyContent: 'center' }}>
          {renderIcon('home-outline', 'Home', activeTab === 'home', onHomePress || (() => {}))}
        </View>

        {/* Right side: AI Chat and Doctor */}
        <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'flex-end' }}>
          {renderIcon(
            'chatbubble-ellipses-outline',
            'AI Chat',
            activeTab === 'ai',
            onAIChatPress || (() => {})
          )}
          {renderIcon(
            'medical-outline',
            'Doctor',
            activeTab === 'doctor',
            onDoctorPress || (() => {})
          )}
        </View>
      </View>
    </View>
  );
};

export default BottomBar;
