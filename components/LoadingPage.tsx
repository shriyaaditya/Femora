import React, { useEffect, useRef } from 'react';
import { 
  View, 
  SafeAreaView, 
  StatusBar, 
  StyleSheet, 
  Image, 
  Text,
  Animated,
  Dimensions
} from 'react-native';

interface LoadingPageProps {
  message?: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ message = 'Loading...' }) => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const dotAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;
  const typingAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Text entrance animation
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        // Typing effect for "Femora"
        Animated.timing(typingAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    // Bouncing dots animation
    const createDotAnimation = (index: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnimations[index], {
            toValue: 1,
            duration: 600,
            delay: index * 200,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnimations[index], {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    dotAnimations.forEach((_, index) => {
      createDotAnimation(index).start();
    });
  }, []);

  const renderTypingText = () => {
    const text = "Femora";
    const animatedText = text.split('').map((char, index) => {
      const opacity = typingAnimation.interpolate({
        inputRange: [index / text.length, (index + 1) / text.length],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      });

      return (
        <Animated.Text
          key={index}
          style={[
            styles.brandText,
            { opacity }
          ]}
        >
          {char}
        </Animated.Text>
      );
    });

    return <View style={styles.typingContainer}>{animatedText}</View>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#e2caf9" />

      <View style={styles.content}>
        {/* Logo with entrance animation */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Brand name with typing effect */}
        <Animated.View
          style={[
            styles.brandContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          {renderTypingText()}
        </Animated.View>

        {/* Bouncing dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  transform: [
                    {
                      translateY: dotAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -15],
                      }),
                    },
                  ],
                  opacity: dotAnimations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                },
              ]}
            />
          ))}
        </View>

        {/* Loading message */}
        <Animated.Text
          style={[
            styles.loadingMessage,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          {message}
        </Animated.Text>
      </View>
    </SafeAreaView>
  );
};

export default LoadingPage;

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e2caf9',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  brandContainer: {
    marginBottom: 40,
  },
  typingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FF9DF1',
    letterSpacing: 2,
    textShadowOffset: { width: 0, height: 2 },
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 30,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF9DF1',
    elevation: 4,
  },
  loadingMessage: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF9DF1',
    textAlign: 'center',
    opacity: 0.8,
  },
});
