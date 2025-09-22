import React, { useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Dimensions, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;

interface BottomBarProps {
  onScanPress?: () => void;
  onHomePress: () => void;
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

  // Memoize styles to prevent recalculation on re-renders
  const containerStyle = useMemo(() => ({
    position: 'absolute' as const,
    bottom: Platform.OS === 'ios' ? 34 : Platform.OS === 'web' ? 20 : 16,
    left: 16,
    right: 16,
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
  }), []);

  const gradientOverlayStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 35,
    backgroundColor:
      'linear-gradient(135deg, rgba(230, 230, 250, 0.1) 0%, rgba(242, 198, 255, 0.05) 100%)',
  }), []);

  const navigationContainerStyle = useMemo(() => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  }), []);

  const leftSideStyle = useMemo(() => ({
    flexDirection: 'row' as const,
    flex: 1,
    justifyContent: 'flex-start' as const,
  }), []);

  const centerStyle = useMemo(() => ({
    flex: 0,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  }), []);

  const rightSideStyle = useMemo(() => ({
    flexDirection: 'row' as const,
    flex: 1,
    justifyContent: 'flex-end' as const,
  }), []);

  // Memoize icon container styles
  const iconContainerStyle = useMemo(() => ({
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: isSmallDevice ? 4 : 6,
    paddingHorizontal: isSmallDevice ? 4 : 8,
    minWidth: isSmallDevice ? 55 : 65,
    flex: 1,
  }), []);

  const activeIconContainerStyle = useMemo(() => ({
    width: isSmallDevice ? 40 : 44,
    height: isSmallDevice ? 40 : 44,
    borderRadius: isSmallDevice ? 20 : 22,
    backgroundColor: '#ff66cc',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#ff66cc',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 2,
  }), []);

  const inactiveIconContainerStyle = useMemo(() => ({
    width: isSmallDevice ? 32 : 36,
    height: isSmallDevice ? 32 : 36,
    borderRadius: isSmallDevice ? 16 : 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 2,
    backgroundColor: 'rgba(51, 51, 51, 0.05)',
  }), []);

  const labelStyle = useMemo(() => ({
    fontSize: isSmallDevice ? 8 : 9,
    fontWeight: '600' as const,
    color: '#333333',
    textAlign: 'center' as const,
    opacity: 0.8,
    marginTop: 1,
  }), []);

  const activeLabelStyle = useMemo(() => ({
    fontSize: isSmallDevice ? 8 : 9,
    fontWeight: '700' as const,
    color: '#ff66cc',
    textAlign: 'center' as const,
    opacity: 1,
    marginTop: 1,
  }), []);

  // Memoize callback functions
  const handleScanPress = useCallback(() => {
    onScanPress?.();
  }, [onScanPress]);

  const handleHomePress = useCallback(() => {
    onHomePress?.();
  }, [onHomePress]);

  const handleAIChatPress = useCallback(() => {
    onAIChatPress?.();
  }, [onAIChatPress]);

  const handleDoctorPress = useCallback(() => {
    onDoctorPress?.();
  }, [onDoctorPress]);

  const handleCalendarPress = useCallback(() => {
    onCalendarPress?.();
  }, [onCalendarPress]);

  const renderIcon = useCallback((name: string, label: string, isActive: boolean, onPress: () => void) => {
    const iconColor = isActive ? '#ffffff' : '#333333';

    return (
      <TouchableOpacity
        style={iconContainerStyle}
        onPress={onPress}>
        {/* Active Icon with Floating Circle */}
        {isActive ? (
          <View style={activeIconContainerStyle}>
            <Ionicons name={name as any} size={activeIconSize} color="white" />
          </View>
        ) : (
          <View style={inactiveIconContainerStyle}>
            <Ionicons name={name as any} size={iconSize} color={iconColor} />
          </View>
        )}

        {/* Label */}
        <Text style={isActive ? activeLabelStyle : labelStyle}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }, [iconContainerStyle, activeIconContainerStyle, inactiveIconContainerStyle, activeLabelStyle, labelStyle, iconSize, activeIconSize]);

  return (
    <View style={containerStyle}>
      {/* Subtle gradient overlay */}
      <View style={gradientOverlayStyle} />

      {/* Navigation Icons */}
      <View style={navigationContainerStyle}>
        {/* Left side: Scan and Calendar */}
        <View style={leftSideStyle}>
          {renderIcon('scan-outline', 'Scan', activeTab === 'scan', handleScanPress)}
          {renderIcon('calendar-outline', 'Calendar', activeTab === 'calendar', handleCalendarPress)}
        </View>

        {/* Center: Home */}
        <View style={centerStyle}>
          {renderIcon('home-outline', 'Home', activeTab === 'home', handleHomePress)}
        </View>

        {/* Right side: AI Chat and Doctor */}
        <View style={rightSideStyle}>
          {renderIcon('chatbubble-ellipses-outline', 'AI Chat', activeTab === 'ai', handleAIChatPress)}
          {renderIcon('medical-outline', 'Doctor', activeTab === 'doctor', handleDoctorPress)}
        </View>
      </View>
    </View>
  );
};

export default BottomBar;
