import React from 'react';
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
  return (
    <LinearGradient
      colors={['#E8D5FF', '#D2AAF7', '#C490F5']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        shadowColor: Platform.OS === 'ios' ? 'rgba(0,0,0,0.15)' : '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: Platform.OS === 'ios' ? 1 : 0.25,
        shadowRadius: 12,
        elevation: 16,
      }}>
      {/* Subtle overlay for depth */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      />
      
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: isSmallDevice ? 18 : isMediumDevice ? 22 : 26,
          paddingTop: Platform.OS === 'ios' ? 12 : 16,
          paddingBottom: isSmallDevice ? 16 : 20,
        }}>
        
        {/* Left Section: Back Button or Logo */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 0.25 }}>
          {onBack ? (
            <TouchableOpacity
              style={{
                height: isSmallDevice ? 38 : 42,
                width: isSmallDevice ? 38 : 42,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 21,
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                shadowColor: 'rgba(0,0,0,0.1)',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={onBack}
              activeOpacity={0.8}>
              <Ionicons 
                name="chevron-back" 
                size={isSmallDevice ? 20 : 22} 
                color="#2D1B3D" 
              />
            </TouchableOpacity>
          ) : showLogo ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: isSmallDevice ? 10 : 14,
                paddingHorizontal: 8,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}>
              <View
                style={{
                  width: isSmallDevice ? 32 : 36,
                  height: isSmallDevice ? 32 : 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: 'rgba(0,0,0,0.1)',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 4,
                  elevation: 2,
                }}>
                <Image
                  source={require('../assets/logo.png')}
                  style={{
                    width: isSmallDevice ? 24 : 28,
                    height: isSmallDevice ? 24 : 28,
                  }}
                  resizeMode="contain"
                />
              </View>
              <Text
                style={{
                  fontSize: isSmallDevice ? 17 : isMediumDevice ? 19 : 21,
                  fontWeight: '700',
                  color: '#2D1B3D',
                  letterSpacing: -0.5,
                  textShadowColor: 'rgba(255, 255, 255, 0.8)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}>
                Femora
              </Text>
            </View>
          ) : null}
        </View>

        {/* Center: Title */}
        <View style={{ flex: 0.5, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: isSmallDevice ? 17 : isMediumDevice ? 19 : 21,
              fontWeight: '600',
              color: '#2D1B3D',
              letterSpacing: -0.3,
              textAlign: 'center',
              textShadowColor: 'rgba(255, 255, 255, 0.6)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
            numberOfLines={1}
            ellipsizeMode="tail">
            {title}
          </Text>
        </View>

        {/* Right Section: Notifications and Profile */}
        <View 
          style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            gap: 12, 
            flex: 0.25, 
            justifyContent: 'flex-end' 
          }}>
          
          {/* Enhanced Notification Bell */}
          {onNotificationPress && (
            <TouchableOpacity
              style={{
                height: isSmallDevice ? 42 : 46,
                width: isSmallDevice ? 42 : 46,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 23,
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                shadowColor: 'rgba(0,0,0,0.1)',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={onNotificationPress}
              activeOpacity={0.8}>
              <Ionicons 
                name="notifications" 
                size={isSmallDevice ? 20 : 22} 
                color="#2D1B3D" 
              />
              {/* Notification Badge */}
              {notificationCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    backgroundColor: '#FF3B30',
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: '#FFFFFF',
                    shadowColor: 'rgba(0,0,0,0.2)',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 1,
                    shadowRadius: 2,
                    elevation: 4,
                  }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      color: '#FFFFFF',
                      textAlign: 'center',
                    }}>
                    {notificationCount > 99 ? '99+' : notificationCount.toString()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Enhanced User Profile */}
          {userProfile ? (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
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
              }}
              onPress={userProfile.onPress}
              activeOpacity={0.8}>
              <View
                style={{
                  width: isSmallDevice ? 30 : 34,
                  height: isSmallDevice ? 30 : 34,
                  borderRadius: 17,
                  overflow: 'hidden',
                  borderWidth: 2,
                  borderColor: 'rgba(255, 255, 255, 0.6)',
                  shadowColor: 'rgba(0,0,0,0.1)',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 1,
                  shadowRadius: 2,
                  elevation: 2,
                }}>
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
                style={{
                  fontSize: isSmallDevice ? 13 : 14,
                  fontWeight: '600',
                  color: '#2D1B3D',
                  letterSpacing: -0.2,
                  textShadowColor: 'rgba(255, 255, 255, 0.8)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 1,
                }}
                numberOfLines={1}
                ellipsizeMode="tail">
                {userProfile.name}
              </Text>
            </TouchableOpacity>
          ) : rightAction ? (
            <TouchableOpacity
              style={{
                paddingHorizontal: isSmallDevice ? 14 : 18,
                paddingVertical: isSmallDevice ? 10 : 12,
                borderRadius: 22,
                backgroundColor: getRightActionBackgroundColor(rightAction.style),
                borderWidth: 1,
                borderColor: getRightActionBorderColor(rightAction.style),
                shadowColor: 'rgba(0,0,0,0.1)',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={rightAction.onPress}
              activeOpacity={0.8}>
              <Text
                style={{
                  fontSize: isSmallDevice ? 14 : 15,
                  fontWeight: '600',
                  color: getRightActionTextColor(rightAction.style),
                  letterSpacing: -0.2,
                }}>
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