import React from 'react';
import { View, SafeAreaView, StatusBar, StyleSheet, Image, Text } from 'react-native';

interface LoadingPageProps {
  message?: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ message = 'Loading...' }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e8d6f9' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#d6b8f2" />

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}>
        
        {/* Pig Character */}
        <View style={styles.container}>
          <Image
            source={{
              uri: "https://res.cloudinary.com/doojbkvn6/image/upload/v1755943252/Pig-Waving-Video-Generation-unscreen_vox5o7.gif",
            }}
            style={{ width: 150, height: 150 }}
          />
        </View>

        {/* Loading Text */}
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </SafeAreaView>
  );
};

export default LoadingPage;

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: '500',
    color: '#000', // black color
  },
});
