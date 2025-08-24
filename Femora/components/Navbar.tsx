import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';

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
}

const Navbar: React.FC<NavbarProps> = ({ title, onBack, rightAction, showLogo = false }) => {
  return (
    <View
      style={{
        backgroundColor: '#D2AAF7',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 12,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: isSmallDevice ? 16 : isMediumDevice ? 20 : 24,
          paddingVertical: isSmallDevice ? 14 : 18,
        }}>
        {/* Left: Back Button or Logo */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {onBack ? (
            <TouchableOpacity
              style={{
                height: isSmallDevice ? 36 : 40,
                width: isSmallDevice ? 36 : 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20,
                backgroundColor: 'rgba(0,0,0,0.06)',
              }}
              onPress={onBack}>
              <Text
                style={{
                  fontSize: isSmallDevice ? 18 : 20,
                  fontWeight: 'bold',
                  color: '#111',
                }}>
                ←
              </Text>
            </TouchableOpacity>
          ) : showLogo ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: isSmallDevice ? 12 : 16,
              }}>
              <Image
                source={require('../assets/logo.png')}
                style={{
                  width: isSmallDevice ? 32 : 40,
                  height: isSmallDevice ? 32 : 40,
                }}
                resizeMode="contain"
              />
              <Text
                style={{
                  fontSize: isSmallDevice ? 18 : isMediumDevice ? 20 : 22,
                  fontWeight: 'bold',
                  color: '#111',
                }}>
                Femora
              </Text>
            </View>
          ) : (
            <View style={{ width: isSmallDevice ? 36 : 40 }} />
          )}
        </View>

        {/* Center: Title */}
        <Text
          style={{
            fontSize: isSmallDevice ? 16 : isMediumDevice ? 18 : 20,
            flex: 1,
            textAlign: 'center',
            marginHorizontal: 8,
            fontWeight: 'bold',
            color: '#111',
          }}>
          {title}
        </Text>

        {/* Right: Action Button or Spacer */}
        {rightAction ? (
          <TouchableOpacity
            style={{
              paddingHorizontal: isSmallDevice ? 12 : 16,
              paddingVertical: isSmallDevice ? 8 : 12,
              borderRadius: 20,
              backgroundColor:
                rightAction.style === 'danger'
                  ? 'rgba(255, 59, 48, 0.25)'
                  : rightAction.style === 'secondary'
                  ? 'rgba(0,0,0,0.06)'
                  : 'rgba(0,0,0,0.06)',
            }}
            onPress={rightAction.onPress}>
            <Text
              style={{
                fontSize: isSmallDevice ? 14 : 16,
                fontWeight: '500',
                color: '#111',
              }}>
              {rightAction.label}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: isSmallDevice ? 36 : 40 }} />
        )}
      </View>
    </View>
  );
};

export default Navbar;
