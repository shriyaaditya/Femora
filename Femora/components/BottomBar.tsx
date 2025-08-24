import React from 'react';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;

interface BottomBarProps {
  onScanPress?: () => void;
  onHomePress?: () => void;
  onProfilePress?: () => void;
  activeTab?: 'scan' | 'home' | 'profile';
}

const BottomBar: React.FC<BottomBarProps> = ({
  onScanPress,
  onHomePress,
  onProfilePress,
  activeTab = 'home',
}) => {
  const iconSize = isSmallDevice ? 22 : 26;
  const activeColor = '#D2AAF7';
  const inactiveColor = 'white';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#D2AAF7',
        paddingHorizontal: isSmallDevice ? 20 : 24,
        paddingVertical: isSmallDevice ? 12 : 16,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}>
      {/* Scan Button */}
      <TouchableOpacity
        style={{
          backgroundColor: activeTab === 'scan' ? activeColor : 'transparent',
          borderRadius: 20,
          padding: 12,
          minWidth: 80,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={onScanPress}>
        <Ionicons name="add-circle" size={iconSize} color={activeTab === 'scan' ? activeColor : inactiveColor} />
      </TouchableOpacity>

      {/* Home Button */}
      <TouchableOpacity
        style={{
          backgroundColor: activeTab === 'home' ? activeColor : 'transparent',
          borderRadius: 20,
          padding: 12,
          minWidth: 80,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={onHomePress}>
        <Ionicons name="home" size={iconSize} color={activeTab === 'home' ? activeColor : inactiveColor} />
      </TouchableOpacity>

      {/* Profile Button */}
      <TouchableOpacity
        style={{
          backgroundColor: activeTab === 'profile' ? activeColor : 'transparent',
          borderRadius: 20,
          padding: 12,
          minWidth: 80,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={onProfilePress}>
        <Ionicons name="person" size={iconSize} color={activeTab === 'profile' ? activeColor : inactiveColor} />
      </TouchableOpacity>
    </View>
  );
};

export default BottomBar;
