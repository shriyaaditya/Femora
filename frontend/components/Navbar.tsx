import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;

interface NavbarProps {
  title: string;
  onBack?: () => void;
  rightAction?: {
    label: string;
    onPress: () => void;
    style?: 'primary' | 'secondary' | 'danger' | 'destructive';
  };
  showLogo?: boolean;
  userProfile?: {
    name: string;
    image?: string;
    onPress?: () => void;
  };
  onNotificationPress?: () => void;
  notificationCount?: number;
}

const Navbar: React.FC<NavbarProps> = ({
  title,
  onBack,
  rightAction,
  showLogo = false,
  userProfile,
  onNotificationPress,
  notificationCount = 0,
}) => {
  // Memoize styles to prevent recalculation on re-renders
  const containerStyle = useMemo(() => ({
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: Platform.OS === 'ios' ? 'rgba(0,0,0,0.15)' : '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === 'ios' ? 1 : 0.25,
    shadowRadius: 12,
    elevation: 16,
  }), []);

  const overlayStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  }), []);

  const mainContainerStyle = useMemo(() => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: isSmallDevice ? 18 : isMediumDevice ? 22 : 26,
    paddingTop: Platform.OS === 'ios' ? 44 : Platform.OS === 'web' ? 20 : 16,
    paddingBottom: isSmallDevice ? 16 : 20,
  }), []);

  const leftSectionStyle = useMemo(() => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 0.25,
  }), []);

  const centerSectionStyle = useMemo(() => ({
    flex: 0.5,
    alignItems: 'center' as const,
  }), []);

  const rightSectionStyle = useMemo(() => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    flex: 0.25,
    justifyContent: 'flex-end' as const,
  }), []);

  // Memoize button styles
  const backButtonStyle = useMemo(() => ({
    height: isSmallDevice ? 38 : 42,
    width: isSmallDevice ? 38 : 42,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  }), []);

  const logoContainerStyle = useMemo(() => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: isSmallDevice ? 10 : 14,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  }), []);

  const logoImageContainerStyle = useMemo(() => ({
    width: isSmallDevice ? 32 : 36,
    height: isSmallDevice ? 32 : 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  }), []);

  const logoTextStyle = useMemo(() => ({
    fontSize: isSmallDevice ? 17 : isMediumDevice ? 19 : 21,
    fontWeight: '700' as const,
    color: '#2D1B3D',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  }), []);

  const titleStyle = useMemo(() => ({
    fontSize: isSmallDevice ? 17 : isMediumDevice ? 19 : 21,
    fontWeight: '600' as const,
    color: '#2D1B3D',
    letterSpacing: -0.3,
    textAlign: 'center' as const,
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  }), []);

  // Memoize notification button style
  const notificationButtonStyle = useMemo(() => ({
    height: isSmallDevice ? 42 : 46,
    width: isSmallDevice ? 42 : 46,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  }), []);

  const notificationBadgeStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 4,
  }), []);

  const badgeTextStyle = useMemo(() => ({
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
  }), []);

  // Memoize profile button styles
  const profileButtonStyle = useMemo(() => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingLeft: 6,
    paddingRight: 14,
    paddingVertical: 8,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 120,
  }), []);

  const profileImageContainerStyle = useMemo(() => ({
    width: isSmallDevice ? 30 : 34,
    height: isSmallDevice ? 30 : 34,
    borderRadius: 17,
    overflow: 'hidden' as const,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  }), []);

  const profileTextStyle = useMemo(() => ({
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600' as const,
    color: '#2D1B3D',
    letterSpacing: -0.2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  }), []);

  // Memoize right action button style
  const rightActionButtonStyle = useMemo(() => ({
    paddingHorizontal: isSmallDevice ? 14 : 18,
    paddingVertical: isSmallDevice ? 10 : 12,
    borderRadius: 22,
    backgroundColor: getRightActionBackgroundColor(rightAction?.style),
    borderWidth: 1,
    borderColor: getRightActionBorderColor(rightAction?.style),
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  }), [rightAction?.style]);

  const rightActionTextStyle = useMemo(() => ({
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '600' as const,
    color: getRightActionTextColor(rightAction?.style),
    letterSpacing: -0.2,
  }), [rightAction?.style]);

  // Memoize callback functions
  const handleBackPress = useCallback(() => {
    onBack?.();
  }, [onBack]);

  const handleNotificationPress = useCallback(() => {
    onNotificationPress?.();
  }, [onNotificationPress]);

  const handleProfilePress = useCallback(() => {
    userProfile?.onPress?.();
  }, [userProfile?.onPress]);

  const handleRightActionPress = useCallback(() => {
    rightAction?.onPress?.();
  }, [rightAction?.onPress]);

  return (
    <LinearGradient
      colors={['#E8D5FF', '#D2AAF7', '#C490F5']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={containerStyle}>
      {/* Subtle overlay for depth */}
      <View style={overlayStyle} />

      <View style={mainContainerStyle}>
        {/* Left Section: Back Button or Logo */}
        <View style={leftSectionStyle}>
          {onBack ? (
            <TouchableOpacity
              style={backButtonStyle}
              onPress={handleBackPress}
              activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={isSmallDevice ? 20 : 22} color="#2D1B3D" />
            </TouchableOpacity>
          ) : showLogo ? (
            <View style={logoContainerStyle}>
              <View style={logoImageContainerStyle}>
                <Image
                  source={require('../assets/logo.png')}
                  style={{
                    width: isSmallDevice ? 24 : 28,
                    height: isSmallDevice ? 24 : 28,
                  }}
                  resizeMode="contain"
                />
              </View>
              <Text style={logoTextStyle}>
                Femora
              </Text>
            </View>
          ) : null}
        </View>

        {/* Center: Title */}
        <View style={centerSectionStyle}>
          <Text
            style={titleStyle}
            numberOfLines={1}
            ellipsizeMode="tail">
            {title}
          </Text>
        </View>

        {/* Right Section: Notifications and Profile */}
        <View style={rightSectionStyle}>
          {/* Enhanced Notification Bell */}
          {onNotificationPress && (
            <TouchableOpacity
              style={notificationButtonStyle}
              onPress={handleNotificationPress}
              activeOpacity={0.8}>
              <Ionicons name="notifications" size={isSmallDevice ? 20 : 22} color="#2D1B3D" />
              {/* Notification Badge */}
              {notificationCount > 0 && (
                <View style={notificationBadgeStyle}>
                  <Text style={badgeTextStyle}>
                    {notificationCount > 99 ? '99+' : notificationCount.toString()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Enhanced User Profile */}
          {userProfile ? (
            <TouchableOpacity
              style={profileButtonStyle}
              onPress={handleProfilePress}
              activeOpacity={0.8}>
              <View style={profileImageContainerStyle}>
                <Image
                  source={
                    userProfile.image ? { uri: userProfile.image } : require('../assets/mora.png')
                  }
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  resizeMode="cover"
                />
              </View>
              <Text
                style={profileTextStyle}
                numberOfLines={1}
                ellipsizeMode="tail">
                {userProfile.name}
              </Text>
            </TouchableOpacity>
          ) : rightAction ? (
            <TouchableOpacity
              style={rightActionButtonStyle}
              onPress={handleRightActionPress}
              activeOpacity={0.8}>
              <Text style={rightActionTextStyle}>
                {rightAction.label}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </LinearGradient>
  );
};

// Helper functions for right action styling
const getRightActionBackgroundColor = (style?: string) => {
  switch (style) {
    case 'danger':
    case 'destructive':
      return 'rgba(255, 59, 48, 0.2)';
    case 'primary':
      return 'rgba(0, 122, 255, 0.2)';
    case 'secondary':
    default:
      return 'rgba(255, 255, 255, 0.25)';
  }
};

const getRightActionBorderColor = (style?: string) => {
  switch (style) {
    case 'danger':
    case 'destructive':
      return 'rgba(255, 59, 48, 0.3)';
    case 'primary':
      return 'rgba(0, 122, 255, 0.3)';
    case 'secondary':
    default:
      return 'rgba(255, 255, 255, 0.3)';
  }
};

const getRightActionTextColor = (style?: string) => {
  switch (style) {
    case 'danger':
    case 'destructive':
      return '#D70015';
    case 'primary':
      return '#0066CC';
    case 'secondary':
    default:
      return '#2D1B3D';
  }
};

export default Navbar;
